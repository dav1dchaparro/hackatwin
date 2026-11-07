// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {KumplyGated} from "./kumply/KumplyGated.sol";
import {IKumplyAttestationStore} from "./kumply/IKumplyAttestationStore.sol";

/// @title Llave: herencia por inactividad
/// @notice Una bóveda por dueño. El dueño deposita un token, elige herederos (billeteras + porcentajes) y un plazo de
///         inactividad. Cada movimiento suyo (depositar, retirar, "Estoy bien", configurar, transferir) reinicia el
///         reloj (`block.timestamp`, nunca bloques: la C-Chain solo produce bloques cuando hay tx).
///         Vencido el plazo, un AGENTE verificado por KUMPLY (tier 5 exacto, `isAgent`) abre el período de gracia; el
///         dueño lo cancela con cualquier movimiento. Al terminar la gracia, el agente libera y la plata se ENVÍA SOLA
///         a todos los herederos en la misma tx, descontando la comisión (`comisionBps`, máx. 1%) para la tesorería.
///         Un bot sin KYA queda bloqueado con `NotAgent(bot, tier)`. Retirar es gratis.
/// @dev Sin función de administrador: nadie (ni nosotros) puede sacar la plata fuera de estas reglas.
///      `comisionBps` y `tesoreria` son immutables. Emergencias, guardianes y multifirma: fuera de alcance.
///      Interfaz congelada (v2-herencia): las firmas, structs, eventos y errores de abajo son el contrato con la web
///      y el agente. Solo se pueden AGREGAR cosas.
contract Llave is KumplyGated, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ───────────── Tipos ─────────────

    /// @dev El índice lo usa la web y el agente: 0 Activa · 1 Vencida · 2 EnGracia · 3 Ejecutable · 4 Liberada.
    enum Fase {
        Activa,
        Vencida,
        EnGracia,
        Ejecutable,
        Liberada
    }

    struct Heredero {
        address cuenta;
        uint16 bps; // 6000 = 60%
    }

    struct Config {
        address dueno; // smart account 0xGasless del dueño
        address[] herederos; // 1..5, sin repetidos, ni cero, ni el dueño
        uint16[] bps; // mismo largo, cada uno > 0, suman 10_000
        uint64 plazoInactividad; // seg. Demo 60; prod 180 días
        uint64 plazoGracia; // seg. Demo 30; prod 30 días
    }

    /// @notice Una sola lectura para toda la web y para el agente.
    struct Estado {
        address dueno;
        Fase fase;
        uint256 saldo; // token.balanceOf(this)
        uint64 ultimaSenal;
        uint64 venceEn; // ultimaSenal + plazoInactividad
        uint64 reclamoIniciadoEn; // 0 = no hay reclamo
        uint64 graciaTerminaEn; // reclamoIniciadoEn + plazoGracia; 0 si no hay reclamo
        uint64 liberadaEn; // 0 = no se liberó
        uint256 totalLiberado; // saldo bruto repartido al liberar (incluye la comisión)
        uint64 plazoInactividad;
        uint64 plazoGracia;
        uint16 comisionBps;
        uint64 ahora; // block.timestamp, para que la web y el agente corrijan su reloj
    }

    // ───────────── Constantes ─────────────

    uint8 public constant MAX_HEREDEROS = 5;
    uint16 public constant BPS_TOTAL = 10_000;
    uint16 public constant COMISION_MAX_BPS = 100; // 1%
    /// @notice Valor de `rol` en `VerificadoKumply` cuando el gate chequeó a un agente (tier 5).
    uint8 public constant ROL_AGENTE = 3;

    // ───────────── Estado ─────────────

    IERC20 public immutable token;
    uint64 public immutable periodoMinimo; // piso de los plazos: 1 en la instancia de demo, 2_592_000 (30 días) en prod
    uint16 public immutable comisionBps; // 0..100; 0 = sin comisión
    address public immutable tesoreria; // recibe la comisión al liberar

    address public dueno;
    uint64 public ultimaSenal;
    uint64 public plazoInactividad;
    uint64 public plazoGracia;
    uint64 public reclamoIniciadoEn;
    uint64 public liberadaEn;
    uint256 public totalLiberado;
    Heredero[] internal _herederos;

    // ───────────── Eventos ─────────────

    event Configurada(
        address indexed dueno, address[] herederos, uint16[] bps, uint64 plazoInactividad, uint64 plazoGracia
    );
    event SenalDeVida(address indexed dueno, uint64 cuando);
    event Depositado(address indexed de, uint256 monto);
    event Retirado(address indexed a, uint256 monto);
    event DuenoTransferido(address indexed anterior, address indexed nuevo);
    /// @notice Evento de compliance: en Snowtrace, el mismo hash muestra que quien actuó es un agente KUMPLY tier 5.
    event VerificadoKumply(address indexed cuenta, uint32 tier, uint8 rol);
    event ReclamoIniciado(address indexed agente, uint64 graciaTerminaEn);
    event ReclamoCancelado(uint64 cuando);
    event HerenciaEnviada(address indexed heredero, uint256 monto);
    event ComisionCobrada(address indexed tesoreria, uint256 monto);
    event Liberada(address indexed agente, uint256 total, uint256 comision);

    // ───────────── Errores (además de los de KumplyGated: NotAgent, etc.) ─────────────

    error NoEsDueno(address quien);
    error PorcentajesInvalidos(uint256 suma);
    error CantidadHerederosInvalida(uint256 cantidad);
    error DireccionInvalida(address cuenta);
    error PlazoInvalido(uint64 plazo, uint64 minimo);
    error ComisionInvalida(uint16 bps);
    error MontoInvalido();
    error SaldoInsuficiente(uint256 pedido, uint256 disponible);
    error SigueVivo(uint64 venceEn);
    error ReclamoYaIniciado(uint64 iniciadoEn);
    error SinReclamo();
    error GraciaEnCurso(uint64 terminaEn);
    error YaLiberada(uint64 liberadaEn);
    error SinSaldo();

    // ───────────── Constructor ─────────────

    /// @param store AttestationStore de KUMPLY (Fuji 0xa3Bc…22dD) o el DemoAttestationStore (tests / plan B).
    /// @param token_ ERC-20 de la bóveda (MockPesos en la demo).
    /// @param periodoMinimo_ piso de los dos plazos (≥ 1).
    /// @param c configuración inicial (mismas validaciones que `configurar`).
    /// @param comisionBps_ comisión al liberar, 0..100 (1%).
    /// @param tesoreria_ recibe la comisión; obligatoria si `comisionBps_ > 0`.
    /// @dev El orden de los chequeos es parte de la interfaz (el primero que falla da el error). No consulta KUMPLY:
    ///      el dueño y los herederos no necesitan atestación; solo el agente, al actuar.
    constructor(
        IKumplyAttestationStore store,
        IERC20 token_,
        uint64 periodoMinimo_,
        Config memory c,
        uint16 comisionBps_,
        address tesoreria_
    ) KumplyGated(store) {
        if (address(token_) == address(0)) revert DireccionInvalida(address(0));
        if (periodoMinimo_ == 0) revert PlazoInvalido(0, 1);
        if (comisionBps_ > COMISION_MAX_BPS) revert ComisionInvalida(comisionBps_);
        if (comisionBps_ > 0 && tesoreria_ == address(0)) revert DireccionInvalida(address(0));

        token = token_;
        periodoMinimo = periodoMinimo_;
        comisionBps = comisionBps_;
        tesoreria = tesoreria_;

        _validar(c, periodoMinimo_);
        dueno = c.dueno;
        _guardar(c);
        ultimaSenal = uint64(block.timestamp);
        emit Configurada(c.dueno, c.herederos, c.bps, c.plazoInactividad, c.plazoGracia);
    }

    // ───────────── Modificadores ─────────────

    modifier soloDueno() {
        if (msg.sender != dueno) revert NoEsDueno(msg.sender);
        _;
    }

    /// @dev Va DESPUÉS de `soloDueno` cuando se combinan: el orden de los errores es parte de la interfaz.
    modifier noLiberada() {
        if (liberadaEn != 0) revert YaLiberada(liberadaEn);
        _;
    }

    // ───────────── Dueño (cada acción del dueño cuenta como "Estoy bien") ─────────────

    /// @notice Señal de vida explícita. Si hay reclamo (en gracia o ejecutable sin liberar), lo cancela.
    function estoyBien() external soloDueno noLiberada {
        _senal();
    }

    /// @notice Cualquiera puede depositar (requiere `approve`). Si deposita el dueño, cuenta como señal.
    function depositar(uint256 monto) external nonReentrant noLiberada {
        if (monto == 0) revert MontoInvalido();
        token.safeTransferFrom(msg.sender, address(this), monto);
        emit Depositado(msg.sender, monto);
        // Un tercero que deposita no prueba que el dueño esté vivo: solo cuenta si es el dueño.
        if (msg.sender == dueno) _senal();
    }

    /// @notice Retiro del dueño. Gratis (sin comisión) y cuenta como señal.
    function retirar(address a, uint256 monto) external nonReentrant soloDueno noLiberada {
        if (a == address(0)) revert DireccionInvalida(address(0));
        if (monto == 0) revert MontoInvalido();
        uint256 saldo = token.balanceOf(address(this));
        if (monto > saldo) revert SaldoInsuficiente(monto, saldo);
        token.safeTransfer(a, monto);
        emit Retirado(a, monto);
        _senal();
    }

    /// @notice Reemplaza herederos, porcentajes y plazos. `c.dueno` debe ser el dueño actual. Cuenta como señal.
    function configurar(Config calldata c) external soloDueno noLiberada {
        if (c.dueno != dueno) revert DireccionInvalida(c.dueno);
        _validar(c, periodoMinimo);
        _guardar(c);
        emit Configurada(c.dueno, c.herederos, c.bps, c.plazoInactividad, c.plazoGracia);
        _senal();
    }

    /// @notice Cambia el dueño (sirve para desplegar antes de tener la smart account). Cuenta como señal.
    /// @dev El nuevo dueño no puede ser cero, el mismo dueño ni un heredero (rompería "heredero ≠ dueño").
    function transferirDueno(address nuevo) external soloDueno noLiberada {
        // La propia bóveda como dueña dejaría la Llave sin nadie que pueda dar señales, retirar ni configurar.
        if (nuevo == address(0) || nuevo == dueno || nuevo == address(this)) revert DireccionInvalida(nuevo);
        (bool es,) = esHeredero(nuevo);
        if (es) revert DireccionInvalida(nuevo);
        emit DuenoTransferido(dueno, nuevo);
        dueno = nuevo;
        _senal();
    }

    // ───────────── Agente KUMPLY (tier 5 exacto) ─────────────

    /// @notice Vencido el plazo, el agente abre el período de gracia.
    function iniciarReclamo() external {
        uint32 tier = _requireAgent(msg.sender);
        if (liberadaEn != 0) revert YaLiberada(liberadaEn);
        if (reclamoIniciadoEn != 0) revert ReclamoYaIniciado(reclamoIniciadoEn);
        uint64 vence = venceEn();
        // forge-lint: disable-next-line(block-timestamp) — los plazos son en segundos por diseño (minutos a días)
        if (block.timestamp < vence) revert SigueVivo(vence);

        reclamoIniciadoEn = uint64(block.timestamp);

        emit VerificadoKumply(msg.sender, tier, ROL_AGENTE);
        emit ReclamoIniciado(msg.sender, graciaTerminaEn());
    }

    /// @notice Terminada la gracia, el agente libera: comisión a la tesorería y el resto a todos los herederos en
    ///         esta misma tx. El último heredero recibe el polvo de redondeo: la bóveda queda en 0.
    /// @dev CEI: `liberadaEn` y `totalLiberado` se escriben antes de cualquier transferencia (y además `nonReentrant`).
    ///      Push a lo sumo a MAX_HEREDEROS + 1 cuentas: gas acotado.
    function liberar() external nonReentrant {
        uint32 tier = _requireAgent(msg.sender);
        if (liberadaEn != 0) revert YaLiberada(liberadaEn);
        if (reclamoIniciadoEn == 0) revert SinReclamo();
        uint64 terminaEn = graciaTerminaEn();
        // forge-lint: disable-next-line(block-timestamp) — los plazos son en segundos por diseño (minutos a días)
        if (block.timestamp < terminaEn) revert GraciaEnCurso(terminaEn);
        uint256 saldo = token.balanceOf(address(this));
        if (saldo == 0) revert SinSaldo();

        // Efectos
        liberadaEn = uint64(block.timestamp);
        totalLiberado = saldo;
        (uint256 comision, uint256[] memory montos) = _repartir(saldo);

        // Interacciones
        if (comision > 0) {
            token.safeTransfer(tesoreria, comision);
            emit ComisionCobrada(tesoreria, comision);
        }
        uint256 n = _herederos.length;
        for (uint256 i; i < n; ++i) {
            address h = _herederos[i].cuenta;
            uint256 monto = montos[i];
            // Con saldos ínfimos una parte puede redondear a 0: no se transfiere (hay tokens que rechazan 0).
            if (monto > 0) token.safeTransfer(h, monto);
            emit HerenciaEnviada(h, monto);
        }

        emit VerificadoKumply(msg.sender, tier, ROL_AGENTE);
        emit Liberada(msg.sender, saldo, comision);
    }

    // ───────────── Lecturas ─────────────

    /// @notice Fase calculada con `block.timestamp`: no hay cron on-chain, la fase avanza sola con el tiempo.
    function fase() public view returns (Fase) {
        if (liberadaEn != 0) return Fase.Liberada;
        if (reclamoIniciadoEn != 0) {
            // forge-lint: disable-next-line(block-timestamp)
            return block.timestamp >= graciaTerminaEn() ? Fase.Ejecutable : Fase.EnGracia;
        }
        // forge-lint: disable-next-line(block-timestamp)
        if (block.timestamp >= venceEn()) return Fase.Vencida;
        return Fase.Activa;
    }

    function estado() external view returns (Estado memory e) {
        e.dueno = dueno;
        e.fase = fase();
        e.saldo = token.balanceOf(address(this));
        e.ultimaSenal = ultimaSenal;
        e.venceEn = venceEn();
        e.reclamoIniciadoEn = reclamoIniciadoEn;
        e.graciaTerminaEn = graciaTerminaEn();
        e.liberadaEn = liberadaEn;
        e.totalLiberado = totalLiberado;
        e.plazoInactividad = plazoInactividad;
        e.plazoGracia = plazoGracia;
        e.comisionBps = comisionBps;
        e.ahora = uint64(block.timestamp);
    }

    function herederos() external view returns (Heredero[] memory) {
        return _herederos;
    }

    function esHeredero(address cuenta) public view returns (bool es, uint16 bps) {
        (uint256 i, bool encontrado) = _indiceDe(cuenta);
        if (encontrado) return (true, _herederos[i].bps);
    }

    /// @notice Lo que recibiría (o recibió) `heredero`, NETO de comisión. Base = saldo actual, o `totalLiberado`
    ///         si ya se liberó. Incluye el polvo de redondeo si es el último heredero.
    /// @dev Usa `_repartir`, la misma cuenta que `liberar`: coincide al wei.
    function parteDe(address heredero) external view returns (uint256) {
        (uint256 i, bool encontrado) = _indiceDe(heredero);
        if (!encontrado) return 0;
        uint256 base = liberadaEn != 0 ? totalLiberado : token.balanceOf(address(this));
        (, uint256[] memory montos) = _repartir(base);
        return montos[i];
    }

    /// @notice Momento desde el que el agente puede iniciar el reclamo (`ultimaSenal + plazoInactividad`).
    function venceEn() public view returns (uint64) {
        return _sumaSaturada(ultimaSenal, plazoInactividad);
    }

    /// @notice Fin del período de gracia; 0 si no hay reclamo.
    function graciaTerminaEn() public view returns (uint64) {
        if (reclamoIniciadoEn == 0) return 0;
        return _sumaSaturada(reclamoIniciadoEn, plazoGracia);
    }

    // heredadas de KumplyGated: isPersonAtLeast(address,uint32), isBusiness(address), isAgent(address), kumply()

    // ───────────── Internas ─────────────

    /// @dev Mejora 1: ÚNICA vía de señal de vida. Se llama al final, después de mover la plata. Cancela el reclamo
    ///      aunque ya esté en Ejecutable: mientras no se haya liberado, el dueño siempre puede volver.
    function _senal() internal {
        uint64 ahora = uint64(block.timestamp);
        ultimaSenal = ahora;
        if (reclamoIniciadoEn != 0) {
            reclamoIniciadoEn = 0;
            emit ReclamoCancelado(ahora);
        }
        emit SenalDeVida(dueno, ahora);
    }

    /// @dev Validaciones de una Config, en el orden de la interfaz. Compartida por el constructor y `configurar`.
    ///      `minimo` se pasa explícito porque en el constructor el immutable todavía no es legible de forma segura.
    function _validar(Config memory c, uint64 minimo) internal view {
        if (c.dueno == address(0)) revert DireccionInvalida(address(0));
        uint256 n = c.herederos.length;
        if (n == 0 || n > MAX_HEREDEROS) revert CantidadHerederosInvalida(n);
        if (c.bps.length != n) revert CantidadHerederosInvalida(c.bps.length);

        for (uint256 i; i < n; ++i) {
            address h = c.herederos[i];
            // Un heredero igual a la propia bóveda dejaría la plata trabada para siempre.
            if (h == address(0) || h == c.dueno || h == address(this)) revert DireccionInvalida(h);
            for (uint256 j; j < i; ++j) {
                if (c.herederos[j] == h) revert DireccionInvalida(h);
            }
        }

        uint256 suma;
        bool hayCero;
        for (uint256 i; i < n; ++i) {
            suma += c.bps[i];
            if (c.bps[i] == 0) hayCero = true;
        }
        if (hayCero || suma != BPS_TOTAL) revert PorcentajesInvalidos(suma);

        if (c.plazoInactividad < minimo) revert PlazoInvalido(c.plazoInactividad, minimo);
        if (c.plazoGracia < minimo) revert PlazoInvalido(c.plazoGracia, minimo);
    }

    /// @dev Reemplaza herederos y plazos. Asume una Config ya validada; no toca `dueno` ni el reloj.
    function _guardar(Config memory c) internal {
        delete _herederos;
        uint256 n = c.herederos.length;
        for (uint256 i; i < n; ++i) {
            _herederos.push(Heredero({cuenta: c.herederos[i], bps: c.bps[i]}));
        }
        plazoInactividad = c.plazoInactividad;
        plazoGracia = c.plazoGracia;
    }

    /// @dev Reparto de `base`: comisión sobre el total; cada heredero i recibe `neto * bps_i / 10_000`, salvo el
    ///      último, que recibe `neto - repartido` (polvo incluido). Ej. A1: 1.000.000, 60/40, 100 bps →
    ///      10.000 / 594.000 / 396.000. Comisión + suma de montos == base, siempre.
    function _repartir(uint256 base) internal view returns (uint256 comision, uint256[] memory montos) {
        comision = (base * comisionBps) / BPS_TOTAL;
        uint256 neto = base - comision;
        uint256 n = _herederos.length;
        montos = new uint256[](n);
        uint256 repartido;
        for (uint256 i; i + 1 < n; ++i) {
            uint256 m = (neto * _herederos[i].bps) / BPS_TOTAL;
            montos[i] = m;
            repartido += m;
        }
        montos[n - 1] = neto - repartido;
    }

    function _indiceDe(address cuenta) internal view returns (uint256 i, bool encontrado) {
        uint256 n = _herederos.length;
        for (; i < n; ++i) {
            if (_herederos[i].cuenta == cuenta) return (i, true);
        }
        return (0, false);
    }

    /// @dev `a + b` saturado en uint64: con plazos enormes el vencimiento queda en "nunca" en vez de revertir y
    ///      romper `fase()` / `estado()` para siempre.
    function _sumaSaturada(uint64 a, uint64 b) internal pure returns (uint64) {
        uint256 s = uint256(a) + b;
        // casting to uint64 is safe because s <= type(uint64).max en esa rama
        // forge-lint: disable-next-line(unsafe-typecast)
        return s > type(uint64).max ? type(uint64).max : uint64(s);
    }
}
