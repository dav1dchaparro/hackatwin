// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, Vm} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Llave} from "../src/Llave.sol";
import {MockPesos} from "../src/MockPesos.sol";
import {DemoAttestationStore} from "../src/demo/DemoAttestationStore.sol";
import {KumplyGated} from "../src/kumply/KumplyGated.sol";
import {IKumplyAttestationStore} from "../src/kumply/IKumplyAttestationStore.sol";
import {TokenReentrante} from "./mocks/TokenReentrante.sol";

/// @notice Tests de la Llave (interfaz v2-herencia). Escenario de la demo: Marta (dueña) deja 60% a Lucía y 40% a
///         Tomás, inactividad 60 s, gracia 30 s, comisión 1% a la tesorería, $1.000.000 mPESO depositados.
///         Solo el agente KUMPLY tier 5 puede iniciar el reclamo y liberar; un bot sin KYA o una empresa (tier 4)
///         quedan bloqueados con `NotAgent`.
contract LlaveTest is Test {
    uint64 internal constant T0 = 1_778_000_000; // un timestamp realista (2026)
    uint64 internal constant INACTIVIDAD = 60;
    uint64 internal constant GRACIA = 30;
    uint64 internal constant PERIODO_MINIMO = 1;
    uint16 internal constant COMISION = 100; // 1%
    uint256 internal constant DEPOSITO = 1_000_000 ether;

    DemoAttestationStore internal store;
    MockPesos internal pesos;
    Llave internal llave;

    address internal marta = makeAddr("marta");
    address internal lucia = makeAddr("lucia");
    address internal tomas = makeAddr("tomas");
    address internal tesoreria = makeAddr("tesoreria");
    address internal agente = makeAddr("agente"); // tier 5
    address internal bot = makeAddr("botSinKya"); // sin atestación
    address internal empresa = makeAddr("empresa"); // tier 4
    address internal extrano = makeAddr("extrano");

    // ───────────── setUp y helpers ─────────────

    function setUp() public {
        vm.warp(T0);
        store = new DemoAttestationStore();
        pesos = new MockPesos();
        uint64 lejos = T0 + 365 days;
        store.emitir(agente, 5, lejos);
        store.emitir(empresa, 4, lejos);
        store.emitir(lucia, 2, lejos); // heredera con KYC de persona: igual no es agente

        llave = _deploy(_cfgBase(), COMISION, tesoreria);
        _depositar(llave, marta, DEPOSITO);
    }

    function _dos(address a, address b) internal pure returns (address[] memory r) {
        r = new address[](2);
        r[0] = a;
        r[1] = b;
    }

    function _bps(uint16 a, uint16 b) internal pure returns (uint16[] memory r) {
        r = new uint16[](2);
        r[0] = a;
        r[1] = b;
    }

    function _cfg(address d, address[] memory hs, uint16[] memory bs, uint64 inact, uint64 gracia)
        internal
        pure
        returns (Llave.Config memory c)
    {
        c.dueno = d;
        c.herederos = hs;
        c.bps = bs;
        c.plazoInactividad = inact;
        c.plazoGracia = gracia;
    }

    function _cfgBase() internal view returns (Llave.Config memory) {
        return _cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), INACTIVIDAD, GRACIA);
    }

    function _deploy(Llave.Config memory c, uint16 comision, address tes) internal returns (Llave) {
        return
            new Llave(IKumplyAttestationStore(address(store)), IERC20(address(pesos)), PERIODO_MINIMO, c, comision, tes);
    }

    /// @dev Mintea `monto` a `quien`, aprueba y deposita en `l`.
    function _depositar(Llave l, address quien, uint256 monto) internal {
        deal(address(pesos), quien, pesos.balanceOf(quien) + monto);
        vm.startPrank(quien);
        pesos.approve(address(l), type(uint256).max);
        l.depositar(monto);
        vm.stopPrank();
    }

    /// @dev Lleva `l` a EnGracia: espera el vencimiento exacto y el agente inicia el reclamo.
    function _aGracia(Llave l) internal {
        vm.warp(l.venceEn());
        vm.prank(agente);
        l.iniciarReclamo();
    }

    /// @dev Lleva `l` a Ejecutable (fin exacto de la gracia).
    function _aEjecutable(Llave l) internal {
        _aGracia(l);
        vm.warp(l.graciaTerminaEn());
    }

    function _liberar(Llave l) internal {
        _aEjecutable(l);
        vm.prank(agente);
        l.liberar();
    }

    function _fase(Llave l) internal view returns (uint8) {
        return uint8(l.fase());
    }

    function _u8(Llave.Fase f) internal pure returns (uint8) {
        return uint8(f);
    }

    function _contar(Vm.Log[] memory logs, address emisor, bytes32 topic0) internal pure returns (uint256 n) {
        for (uint256 i; i < logs.length; i++) {
            if (logs[i].emitter == emisor && logs[i].topics.length > 0 && logs[i].topics[0] == topic0) n++;
        }
    }

    // ───────────── 1. Constructor guarda la config ─────────────

    function test_constructor_guardaConfig() public view {
        assertEq(llave.dueno(), marta);
        assertEq(address(llave.token()), address(pesos));
        assertEq(address(llave.kumply()), address(store));
        assertEq(llave.periodoMinimo(), PERIODO_MINIMO);
        assertEq(llave.comisionBps(), COMISION);
        assertEq(llave.tesoreria(), tesoreria);
        assertEq(llave.plazoInactividad(), INACTIVIDAD);
        assertEq(llave.plazoGracia(), GRACIA);
        assertEq(llave.ultimaSenal(), T0);
        assertEq(llave.venceEn(), T0 + INACTIVIDAD);
        assertEq(llave.reclamoIniciadoEn(), 0);
        assertEq(llave.graciaTerminaEn(), 0);
        assertEq(llave.liberadaEn(), 0);
        assertEq(llave.totalLiberado(), 0);
        assertEq(_fase(llave), _u8(Llave.Fase.Activa));

        Llave.Heredero[] memory hs = llave.herederos();
        assertEq(hs.length, 2);
        assertEq(hs[0].cuenta, lucia);
        assertEq(hs[0].bps, 6000);
        assertEq(hs[1].cuenta, tomas);
        assertEq(hs[1].bps, 4000);

        (bool es, uint16 b) = llave.esHeredero(lucia);
        assertTrue(es);
        assertEq(b, 6000);
        (es, b) = llave.esHeredero(extrano);
        assertFalse(es);
        assertEq(b, 0);
        (es,) = llave.esHeredero(marta);
        assertFalse(es, "la duena no es heredera");

        assertEq(llave.MAX_HEREDEROS(), 5);
        assertEq(llave.BPS_TOTAL(), 10_000);
        assertEq(llave.COMISION_MAX_BPS(), 100);
        assertEq(llave.ROL_AGENTE(), 3);
    }

    function test_constructor_ultimaSenalEsNowYEmiteConfigurada() public {
        vm.warp(T0 + 1234);
        Llave.Config memory c = _cfgBase();
        address previsto = vm.computeCreateAddress(address(this), vm.getNonce(address(this)));
        vm.expectEmit(previsto);
        emit Llave.Configurada(marta, c.herederos, c.bps, INACTIVIDAD, GRACIA);
        Llave l = _deploy(c, COMISION, tesoreria);
        assertEq(address(l), previsto);
        assertEq(l.ultimaSenal(), T0 + 1234);
    }

    function test_constructor_sinComisionPermiteTesoreriaCero() public {
        Llave l = _deploy(_cfgBase(), 0, address(0));
        assertEq(l.comisionBps(), 0);
        assertEq(l.tesoreria(), address(0));
    }

    function test_constructor_comisionMaximaEsValida() public {
        Llave l = _deploy(_cfgBase(), 100, tesoreria);
        assertEq(l.comisionBps(), 100);
    }

    function test_constructor_cincoHerederosEsValido() public {
        address[] memory hs = new address[](5);
        uint16[] memory bs = new uint16[](5);
        for (uint256 i; i < 5; i++) {
            // casting to 'uint160' is safe because i < 6
            // forge-lint: disable-next-line(unsafe-typecast)
            hs[i] = address(uint160(0xBEEF00 + i));
            bs[i] = 2000;
        }
        Llave l = _deploy(_cfg(marta, hs, bs, INACTIVIDAD, GRACIA), COMISION, tesoreria);
        assertEq(l.herederos().length, 5);
    }

    // ───────────── 2. Constructor revierte ─────────────

    function test_constructor_revierte_storeSinCodigo() public {
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.KumplyStoreInvalid.selector, extrano));
        new Llave(IKumplyAttestationStore(extrano), IERC20(address(pesos)), 1, _cfgBase(), COMISION, tesoreria);
    }

    function test_constructor_revierte_tokenCero() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(0)));
        new Llave(IKumplyAttestationStore(address(store)), IERC20(address(0)), 1, _cfgBase(), COMISION, tesoreria);
    }

    function test_constructor_revierte_periodoMinimoCero() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.PlazoInvalido.selector, uint64(0), uint64(1)));
        new Llave(IKumplyAttestationStore(address(store)), IERC20(address(pesos)), 0, _cfgBase(), COMISION, tesoreria);
    }

    function test_constructor_revierte_comision101() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.ComisionInvalida.selector, uint16(101)));
        _deploy(_cfgBase(), 101, tesoreria);
    }

    function test_constructor_revierte_comisionSinTesoreria() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(0)));
        _deploy(_cfgBase(), 1, address(0));
    }

    function test_constructor_revierte_ordenDeChequeos() public {
        // Token 0 y comisión inválida a la vez: primero se chequea el token.
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(0)));
        new Llave(IKumplyAttestationStore(address(store)), IERC20(address(0)), 1, _cfgBase(), 101, tesoreria);

        // Comisión inválida y config inválida: primero la comisión.
        Llave.Config memory c = _cfgBase();
        c.bps[0] = 1;
        vm.expectRevert(abi.encodeWithSelector(Llave.ComisionInvalida.selector, uint16(200)));
        _deploy(c, 200, tesoreria);
    }

    function test_constructor_revierte_duenoCero() public {
        Llave.Config memory c = _cfgBase();
        c.dueno = address(0);
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(0)));
        _deploy(c, COMISION, tesoreria);
    }

    function test_constructor_revierte_bpsNoSuman10000() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.PorcentajesInvalidos.selector, uint256(9000)));
        _deploy(_cfg(marta, _dos(lucia, tomas), _bps(6000, 3000), INACTIVIDAD, GRACIA), COMISION, tesoreria);

        vm.expectRevert(abi.encodeWithSelector(Llave.PorcentajesInvalidos.selector, uint256(10_001)));
        _deploy(_cfg(marta, _dos(lucia, tomas), _bps(6001, 4000), INACTIVIDAD, GRACIA), COMISION, tesoreria);
    }

    function test_constructor_revierte_bpsCero() public {
        // El cero va al final para que la suma (parcial o total) sea 10.000 en cualquier implementación del bucle.
        vm.expectRevert(abi.encodeWithSelector(Llave.PorcentajesInvalidos.selector, uint256(10_000)));
        _deploy(_cfg(marta, _dos(lucia, tomas), _bps(10_000, 0), INACTIVIDAD, GRACIA), COMISION, tesoreria);
    }

    function test_constructor_revierte_ceroHerederos() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.CantidadHerederosInvalida.selector, uint256(0)));
        _deploy(_cfg(marta, new address[](0), new uint16[](0), INACTIVIDAD, GRACIA), COMISION, tesoreria);
    }

    function test_constructor_revierte_seisHerederos() public {
        address[] memory hs = new address[](6);
        uint16[] memory bs = new uint16[](6);
        for (uint256 i; i < 6; i++) {
            // casting to 'uint160' is safe because i < 6
            // forge-lint: disable-next-line(unsafe-typecast)
            hs[i] = address(uint160(0xBEEF00 + i));
            bs[i] = 1000;
        }
        bs[5] = 5000;
        vm.expectRevert(abi.encodeWithSelector(Llave.CantidadHerederosInvalida.selector, uint256(6)));
        _deploy(_cfg(marta, hs, bs, INACTIVIDAD, GRACIA), COMISION, tesoreria);
    }

    function test_constructor_revierte_bpsDeOtroLargo() public {
        uint16[] memory bs = new uint16[](1);
        bs[0] = 10_000;
        vm.expectRevert(abi.encodeWithSelector(Llave.CantidadHerederosInvalida.selector, uint256(1)));
        _deploy(_cfg(marta, _dos(lucia, tomas), bs, INACTIVIDAD, GRACIA), COMISION, tesoreria);
    }

    function test_constructor_revierte_herederoIgualAlDueno() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, marta));
        _deploy(_cfg(marta, _dos(lucia, marta), _bps(6000, 4000), INACTIVIDAD, GRACIA), COMISION, tesoreria);
    }

    function test_constructor_revierte_herederoCero() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(0)));
        _deploy(_cfg(marta, _dos(address(0), tomas), _bps(6000, 4000), INACTIVIDAD, GRACIA), COMISION, tesoreria);
    }

    function test_constructor_revierte_herederoRepetido() public {
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, lucia));
        _deploy(_cfg(marta, _dos(lucia, lucia), _bps(6000, 4000), INACTIVIDAD, GRACIA), COMISION, tesoreria);
    }

    function test_constructor_revierte_plazoMenorAlMinimo() public {
        Llave.Config memory c = _cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), 5, 30);
        vm.expectRevert(abi.encodeWithSelector(Llave.PlazoInvalido.selector, uint64(5), uint64(10)));
        new Llave(IKumplyAttestationStore(address(store)), IERC20(address(pesos)), 10, c, COMISION, tesoreria);

        c = _cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), 60, 9);
        vm.expectRevert(abi.encodeWithSelector(Llave.PlazoInvalido.selector, uint64(9), uint64(10)));
        new Llave(IKumplyAttestationStore(address(store)), IERC20(address(pesos)), 10, c, COMISION, tesoreria);

        vm.expectRevert(abi.encodeWithSelector(Llave.PlazoInvalido.selector, uint64(0), uint64(1)));
        _deploy(_cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), 0, GRACIA), COMISION, tesoreria);
    }

    // ───────────── 3. estoyBien solo del dueño ─────────────

    function test_estoyBien_deOtroRevierteNoEsDueno() public {
        vm.prank(lucia);
        vm.expectRevert(abi.encodeWithSelector(Llave.NoEsDueno.selector, lucia));
        llave.estoyBien();

        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.NoEsDueno.selector, agente));
        llave.estoyBien();
    }

    function test_estoyBien_reiniciaElReloj() public {
        vm.warp(T0 + 50);
        vm.expectEmit(address(llave));
        emit Llave.SenalDeVida(marta, T0 + 50);
        vm.prank(marta);
        llave.estoyBien();
        assertEq(llave.ultimaSenal(), T0 + 50);
        assertEq(llave.venceEn(), T0 + 50 + INACTIVIDAD);
    }

    // ───────────── 4. Activa → Vencida en el borde exacto ─────────────

    function test_fase_activaAVencidaEnElBorde() public {
        uint64 vence = llave.venceEn();
        assertEq(vence, T0 + INACTIVIDAD);

        vm.warp(vence - 1);
        assertEq(_fase(llave), _u8(Llave.Fase.Activa));

        vm.warp(vence);
        assertEq(_fase(llave), _u8(Llave.Fase.Vencida));

        vm.warp(vence + 1000);
        assertEq(_fase(llave), _u8(Llave.Fase.Vencida), "sin reclamo se queda en Vencida");
    }

    // ───────────── 5. iniciarReclamo antes de tiempo ─────────────

    function test_iniciarReclamo_antesDeTiempoRevierteSigueVivo() public {
        uint64 vence = llave.venceEn();
        vm.warp(vence - 1);
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.SigueVivo.selector, vence));
        llave.iniciarReclamo();
    }

    // ───────────── 6. Solo un agente tier 5 ─────────────

    function test_iniciarReclamo_botSinKyaRevierteNotAgent() public {
        vm.warp(llave.venceEn());
        vm.prank(bot);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, bot, uint32(0)));
        llave.iniciarReclamo();
    }

    function test_iniciarReclamo_empresaTier4RevierteNotAgent() public {
        vm.warp(llave.venceEn());
        vm.prank(empresa);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, empresa, uint32(4)));
        llave.iniciarReclamo();
    }

    function test_iniciarReclamo_herederoNoAgenteRevierteNotAgent() public {
        vm.warp(llave.venceEn());
        vm.prank(lucia); // persona tier 2: tampoco es agente
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, lucia, uint32(2)));
        llave.iniciarReclamo();

        vm.prank(tomas); // sin atestación
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, tomas, uint32(0)));
        llave.iniciarReclamo();

        vm.prank(marta); // ni la dueña
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, marta, uint32(0)));
        llave.iniciarReclamo();
    }

    function test_iniciarReclamo_elGateVaAntesQueElReloj() public {
        // Con la Llave viva, un bot recibe NotAgent (no SigueVivo): KUMPLY es el primer chequeo.
        vm.prank(bot);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, bot, uint32(0)));
        llave.iniciarReclamo();
    }

    // ───────────── 7. Reclamo del agente ─────────────

    function test_iniciarReclamo_agentePasaAEnGraciaYEmite() public {
        uint64 vence = llave.venceEn();
        vm.warp(vence);

        vm.expectEmit(address(llave));
        emit Llave.VerificadoKumply(agente, 5, 3);
        vm.expectEmit(address(llave));
        emit Llave.ReclamoIniciado(agente, vence + GRACIA);
        vm.prank(agente);
        llave.iniciarReclamo();

        assertEq(_fase(llave), _u8(Llave.Fase.EnGracia));
        assertEq(llave.reclamoIniciadoEn(), vence);
        assertEq(llave.graciaTerminaEn(), vence + GRACIA);
    }

    function test_iniciarReclamo_segundoReclamoRevierte() public {
        _aGracia(llave);
        uint64 iniciado = llave.reclamoIniciadoEn();
        vm.warp(iniciado + 5);
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.ReclamoYaIniciado.selector, iniciado));
        llave.iniciarReclamo();
    }

    function test_iniciarReclamo_tambienEnEjecutableRevierteReclamoYaIniciado() public {
        _aEjecutable(llave);
        uint64 iniciado = llave.reclamoIniciadoEn();
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.ReclamoYaIniciado.selector, iniciado));
        llave.iniciarReclamo();
    }

    function test_estado_enGracia() public {
        _aGracia(llave);
        uint64 ahora = uint64(block.timestamp);
        Llave.Estado memory e = llave.estado();
        assertEq(e.dueno, marta);
        assertEq(uint8(e.fase), _u8(Llave.Fase.EnGracia));
        assertEq(e.saldo, DEPOSITO);
        assertEq(e.ultimaSenal, T0);
        assertEq(e.venceEn, T0 + INACTIVIDAD);
        assertEq(e.reclamoIniciadoEn, ahora);
        assertEq(e.graciaTerminaEn, ahora + GRACIA);
        assertEq(e.liberadaEn, 0);
        assertEq(e.totalLiberado, 0);
        assertEq(e.plazoInactividad, INACTIVIDAD);
        assertEq(e.plazoGracia, GRACIA);
        assertEq(e.comisionBps, COMISION);
        assertEq(e.ahora, ahora);
    }

    // ───────────── 8. Todo movimiento del dueño en gracia cancela el reclamo (mejora 1/7) ─────────────

    function _esperarCancelacion(address duenoQueSenala) internal {
        uint64 ahora = uint64(block.timestamp);
        vm.expectEmit(address(llave));
        emit Llave.ReclamoCancelado(ahora);
        vm.expectEmit(address(llave));
        emit Llave.SenalDeVida(duenoQueSenala, ahora);
    }

    function _assertActivaDeNuevo() internal view {
        assertEq(_fase(llave), _u8(Llave.Fase.Activa));
        assertEq(llave.reclamoIniciadoEn(), 0);
        assertEq(llave.graciaTerminaEn(), 0);
        assertEq(llave.ultimaSenal(), uint64(block.timestamp));
        assertEq(llave.venceEn(), uint64(block.timestamp) + INACTIVIDAD);
    }

    function test_gracia_estoyBienCancela() public {
        _aGracia(llave);
        vm.warp(block.timestamp + 10);
        _esperarCancelacion(marta);
        vm.prank(marta);
        llave.estoyBien();
        _assertActivaDeNuevo();
    }

    function test_gracia_depositarDelDuenoCancela() public {
        _aGracia(llave);
        vm.warp(block.timestamp + 10);
        deal(address(pesos), marta, 500 ether);
        vm.expectEmit(address(llave));
        emit Llave.Depositado(marta, 500 ether);
        _esperarCancelacion(marta);
        vm.prank(marta);
        llave.depositar(500 ether);
        _assertActivaDeNuevo();
        assertEq(pesos.balanceOf(address(llave)), DEPOSITO + 500 ether);
    }

    function test_gracia_retirarCancela() public {
        _aGracia(llave);
        vm.warp(block.timestamp + 10);
        vm.expectEmit(address(llave));
        emit Llave.Retirado(marta, 1 ether);
        _esperarCancelacion(marta);
        vm.prank(marta);
        llave.retirar(marta, 1 ether);
        _assertActivaDeNuevo();
    }

    function test_gracia_configurarCancela() public {
        _aGracia(llave);
        vm.warp(block.timestamp + 10);
        Llave.Config memory c = _cfgBase();
        vm.expectEmit(address(llave));
        emit Llave.Configurada(marta, c.herederos, c.bps, INACTIVIDAD, GRACIA);
        _esperarCancelacion(marta);
        vm.prank(marta);
        llave.configurar(c);
        _assertActivaDeNuevo();
    }

    function test_gracia_transferirDuenoCancela() public {
        _aGracia(llave);
        vm.warp(block.timestamp + 10);
        address nueva = makeAddr("nuevaSmartAccount");
        vm.expectEmit(address(llave));
        emit Llave.DuenoTransferido(marta, nueva);
        _esperarCancelacion(nueva); // la señal ya es del dueño nuevo
        vm.prank(marta);
        llave.transferirDueno(nueva);
        _assertActivaDeNuevo();
        assertEq(llave.dueno(), nueva);
    }

    function test_gracia_cancelarYVolverAReclamar() public {
        _aGracia(llave);
        vm.prank(marta);
        llave.estoyBien();
        // El reloj arranca de nuevo: hay que esperar otro plazo completo.
        uint64 vence = llave.venceEn();
        vm.warp(vence - 1);
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.SigueVivo.selector, vence));
        llave.iniciarReclamo();
        vm.warp(vence);
        vm.prank(agente);
        llave.iniciarReclamo();
        assertEq(_fase(llave), _u8(Llave.Fase.EnGracia));
    }

    // ───────────── 9. En Ejecutable (antes de liberar) también cancela ─────────────

    function test_ejecutable_estoyBienCancela() public {
        _aEjecutable(llave);
        assertEq(_fase(llave), _u8(Llave.Fase.Ejecutable));
        vm.warp(block.timestamp + 100);
        _esperarCancelacion(marta);
        vm.prank(marta);
        llave.estoyBien();
        _assertActivaDeNuevo();

        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.SinReclamo.selector));
        llave.liberar();
    }

    // ───────────── 10. liberar: GraciaEnCurso, SinReclamo, NotAgent ─────────────

    function test_liberar_enGraciaRevierteGraciaEnCurso() public {
        _aGracia(llave);
        uint64 termina = llave.graciaTerminaEn();
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.GraciaEnCurso.selector, termina));
        llave.liberar();

        vm.warp(termina - 1);
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.GraciaEnCurso.selector, termina));
        llave.liberar();
    }

    function test_liberar_sinReclamoRevierte() public {
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.SinReclamo.selector));
        llave.liberar();

        vm.warp(llave.venceEn() + 1000); // Vencida pero sin reclamo
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.SinReclamo.selector));
        llave.liberar();
    }

    function test_liberar_botRevierteNotAgent() public {
        _aEjecutable(llave);
        vm.prank(bot);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, bot, uint32(0)));
        llave.liberar();

        vm.prank(empresa);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, empresa, uint32(4)));
        llave.liberar();

        vm.prank(lucia); // la heredera tampoco puede liberarse la plata sola
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, lucia, uint32(2)));
        llave.liberar();
    }

    // ───────────── 11. liberar: ejemplo A1 ─────────────

    function test_liberar_ejemploA1() public {
        _aEjecutable(llave);
        uint64 ahora = uint64(block.timestamp);

        vm.expectEmit(address(llave));
        emit Llave.ComisionCobrada(tesoreria, 10_000 ether);
        vm.expectEmit(address(llave));
        emit Llave.HerenciaEnviada(lucia, 594_000 ether);
        vm.expectEmit(address(llave));
        emit Llave.HerenciaEnviada(tomas, 396_000 ether);
        vm.expectEmit(address(llave));
        emit Llave.VerificadoKumply(agente, 5, 3);
        vm.expectEmit(address(llave));
        emit Llave.Liberada(agente, DEPOSITO, 10_000 ether);
        vm.prank(agente);
        llave.liberar();

        assertEq(pesos.balanceOf(tesoreria), 10_000 ether, "tesoreria");
        assertEq(pesos.balanceOf(lucia), 594_000 ether, "lucia");
        assertEq(pesos.balanceOf(tomas), 396_000 ether, "tomas");
        assertEq(pesos.balanceOf(address(llave)), 0, "la boveda queda en 0");
        assertEq(_fase(llave), _u8(Llave.Fase.Liberada));
        assertEq(llave.liberadaEn(), ahora);
        assertEq(llave.totalLiberado(), DEPOSITO);

        Llave.Estado memory e = llave.estado();
        assertEq(uint8(e.fase), _u8(Llave.Fase.Liberada));
        assertEq(e.saldo, 0);
        assertEq(e.liberadaEn, ahora);
        assertEq(e.totalLiberado, DEPOSITO);
    }

    function test_liberar_todoEnUnaSolaTx() public {
        _aEjecutable(llave);
        vm.recordLogs();
        vm.prank(agente);
        llave.liberar();
        Vm.Log[] memory logs = vm.getRecordedLogs();
        address l = address(llave);
        assertEq(_contar(logs, l, Llave.ComisionCobrada.selector), 1, "una sola comision");
        assertEq(_contar(logs, l, Llave.HerenciaEnviada.selector), 2, "un envio por heredero");
        assertEq(_contar(logs, l, Llave.Liberada.selector), 1);
        assertEq(_contar(logs, l, Llave.VerificadoKumply.selector), 1);
        assertEq(_contar(logs, address(pesos), IERC20.Transfer.selector), 3, "tesoreria + 2 herederos");
    }

    // ───────────── 12. Sin comisión ─────────────

    function test_liberar_sinComision() public {
        Llave l = _deploy(_cfgBase(), 0, address(0));
        _depositar(l, marta, DEPOSITO);
        _aEjecutable(l);

        vm.recordLogs();
        vm.prank(agente);
        l.liberar();
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(_contar(logs, address(l), Llave.ComisionCobrada.selector), 0, "sin ComisionCobrada");
        assertEq(_contar(logs, address(l), Llave.HerenciaEnviada.selector), 2);
        assertEq(pesos.balanceOf(lucia), 600_000 ether);
        assertEq(pesos.balanceOf(tomas), 400_000 ether);
        assertEq(pesos.balanceOf(address(l)), 0);
    }

    // ───────────── 13. parteDe coincide al wei con lo recibido ─────────────

    function test_parteDe_antesYDespuesCoincideConLoRecibido() public {
        uint256 pl = llave.parteDe(lucia);
        uint256 pt = llave.parteDe(tomas);
        assertEq(pl, 594_000 ether);
        assertEq(pt, 396_000 ether);
        assertEq(llave.parteDe(extrano), 0);
        assertEq(llave.parteDe(marta), 0);

        _liberar(llave);

        assertEq(pesos.balanceOf(lucia), pl);
        assertEq(pesos.balanceOf(tomas), pt);
        assertEq(llave.parteDe(lucia), pl, "despues de liberar usa totalLiberado");
        assertEq(llave.parteDe(tomas), pt);
        assertEq(llave.parteDe(extrano), 0);
    }

    function test_parteDe_polvoAlUltimoHeredero() public {
        address[] memory hs = new address[](3);
        hs[0] = lucia;
        hs[1] = tomas;
        hs[2] = extrano;
        uint16[] memory bs = new uint16[](3);
        bs[0] = 3333;
        bs[1] = 3333;
        bs[2] = 3334;
        Llave l = _deploy(_cfg(marta, hs, bs, INACTIVIDAD, GRACIA), 37, tesoreria);
        uint256 saldo = 1_000_000 ether + 7; // impar a propósito
        _depositar(l, marta, saldo);

        uint256 comision = saldo * 37 / 10_000;
        uint256 neto = saldo - comision;
        uint256 p0 = l.parteDe(lucia);
        uint256 p1 = l.parteDe(tomas);
        uint256 p2 = l.parteDe(extrano);
        assertEq(p0, neto * 3333 / 10_000);
        assertEq(p1, neto * 3333 / 10_000);
        assertEq(p2, neto - p0 - p1, "el ultimo se lleva el polvo");
        assertEq(p0 + p1 + p2 + comision, saldo);

        _liberar(l);
        assertEq(pesos.balanceOf(lucia), p0);
        assertEq(pesos.balanceOf(tomas), p1);
        assertEq(pesos.balanceOf(extrano), p2);
        assertEq(pesos.balanceOf(tesoreria), comision);
        assertEq(pesos.balanceOf(address(l)), 0);
    }

    // ───────────── 14. En Liberada todo revierte YaLiberada ─────────────

    function test_liberada_todoRevierteYaLiberada() public {
        _liberar(llave);
        uint64 lib = llave.liberadaEn();
        bytes memory err = abi.encodeWithSelector(Llave.YaLiberada.selector, lib);
        Llave.Config memory c = _cfgBase();
        address nueva = makeAddr("nueva");

        vm.prank(marta);
        vm.expectRevert(err);
        llave.estoyBien();

        deal(address(pesos), marta, 1 ether);
        vm.prank(marta);
        vm.expectRevert(err);
        llave.depositar(1 ether);

        vm.prank(extrano);
        vm.expectRevert(err);
        llave.depositar(1 ether);

        vm.prank(marta);
        vm.expectRevert(err);
        llave.retirar(marta, 1);

        vm.prank(marta);
        vm.expectRevert(err);
        llave.configurar(c);

        vm.prank(marta);
        vm.expectRevert(err);
        llave.transferirDueno(nueva);

        vm.prank(agente);
        vm.expectRevert(err);
        llave.iniciarReclamo();

        vm.prank(agente);
        vm.expectRevert(err);
        llave.liberar();

        assertEq(_fase(llave), _u8(Llave.Fase.Liberada));
    }

    function test_liberada_noEsDuenoVaAntes() public {
        _liberar(llave);
        vm.prank(lucia);
        vm.expectRevert(abi.encodeWithSelector(Llave.NoEsDueno.selector, lucia));
        llave.estoyBien();

        vm.prank(bot);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, bot, uint32(0)));
        llave.liberar();
    }

    // ───────────── 15. La atestación del agente vence entre iniciar y liberar ─────────────

    function test_liberar_atestacionVencidaRevierteNotAgent() public {
        _aGracia(llave);
        uint64 ahora = uint64(block.timestamp);
        store.emitir(agente, 5, ahora + 10); // vence antes de que termine la gracia
        vm.warp(llave.graciaTerminaEn());

        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, agente, uint32(0)));
        llave.liberar();

        // El reclamo sigue en pie: con la atestación renovada, el mismo agente libera.
        store.emitir(agente, 5, ahora + 365 days);
        vm.prank(agente);
        llave.liberar();
        assertEq(_fase(llave), _u8(Llave.Fase.Liberada));
    }

    function test_liberar_atestacionRevocadaRevierteNotAgent() public {
        _aEjecutable(llave);
        store.revocar(agente);
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, agente, uint32(0)));
        llave.liberar();
    }

    function test_liberar_otroAgenteTier5PuedeLiberar() public {
        address agente2 = makeAddr("agente2");
        store.emitir(agente2, 5, T0 + 365 days);
        _aEjecutable(llave);
        vm.expectEmit(address(llave));
        emit Llave.Liberada(agente2, DEPOSITO, 10_000 ether);
        vm.prank(agente2);
        llave.liberar();
    }

    // ───────────── 16. retirar ─────────────

    function test_retirar_soloElDueno() public {
        vm.prank(lucia);
        vm.expectRevert(abi.encodeWithSelector(Llave.NoEsDueno.selector, lucia));
        llave.retirar(lucia, 1 ether);

        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.NoEsDueno.selector, agente));
        llave.retirar(agente, 1 ether);
    }

    function test_retirar_esGratisYReiniciaElReloj() public {
        vm.warp(T0 + 50);
        address destino = makeAddr("cuentaBancaria");
        vm.expectEmit(address(llave));
        emit Llave.Retirado(destino, 250_000 ether);
        vm.expectEmit(address(llave));
        emit Llave.SenalDeVida(marta, T0 + 50);
        vm.prank(marta);
        llave.retirar(destino, 250_000 ether);

        assertEq(pesos.balanceOf(destino), 250_000 ether, "llega entero");
        assertEq(pesos.balanceOf(tesoreria), 0, "retirar no cobra comision");
        assertEq(pesos.balanceOf(address(llave)), DEPOSITO - 250_000 ether);
        assertEq(llave.ultimaSenal(), T0 + 50);
        assertEq(llave.venceEn(), T0 + 50 + INACTIVIDAD);
    }

    function test_retirar_todo() public {
        vm.prank(marta);
        llave.retirar(marta, DEPOSITO);
        assertEq(pesos.balanceOf(marta), DEPOSITO);
        assertEq(pesos.balanceOf(address(llave)), 0);
        assertEq(llave.parteDe(lucia), 0);
    }

    function test_retirar_saldoInsuficiente() public {
        vm.prank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.SaldoInsuficiente.selector, DEPOSITO + 1, DEPOSITO));
        llave.retirar(marta, DEPOSITO + 1);
    }

    function test_retirar_direccionCero() public {
        vm.prank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(0)));
        llave.retirar(address(0), 1 ether);
    }

    function test_retirar_montoCero() public {
        vm.prank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.MontoInvalido.selector));
        llave.retirar(marta, 0);
    }

    // ───────────── 17. depositar ─────────────

    function test_depositar_deUnTerceroNoEsSenal() public {
        vm.warp(T0 + 50);
        deal(address(pesos), lucia, 100 ether);
        vm.startPrank(lucia);
        pesos.approve(address(llave), 100 ether);
        vm.recordLogs();
        llave.depositar(100 ether);
        vm.stopPrank();
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(_contar(logs, address(llave), Llave.SenalDeVida.selector), 0, "un tercero no da senal");
        assertEq(_contar(logs, address(llave), Llave.Depositado.selector), 1);
        assertEq(llave.ultimaSenal(), T0, "el reloj no se movio");
        assertEq(pesos.balanceOf(address(llave)), DEPOSITO + 100 ether);
    }

    function test_depositar_deUnTerceroNoCancelaElReclamo() public {
        _aGracia(llave);
        uint64 iniciado = llave.reclamoIniciadoEn();
        _depositar(llave, extrano, 1 ether);
        assertEq(_fase(llave), _u8(Llave.Fase.EnGracia));
        assertEq(llave.reclamoIniciadoEn(), iniciado);
    }

    function test_depositar_delDuenoEsSenal() public {
        vm.warp(T0 + 50);
        deal(address(pesos), marta, 1 ether); // `approve` infinito ya está hecho en setUp
        // vm.expectEmit mira solo la PRÓXIMA llamada: va justo antes de `depositar`.
        vm.expectEmit(address(llave));
        emit Llave.Depositado(marta, 1 ether);
        vm.expectEmit(address(llave));
        emit Llave.SenalDeVida(marta, T0 + 50);
        vm.prank(marta);
        llave.depositar(1 ether);
        assertEq(llave.ultimaSenal(), T0 + 50);
    }

    function test_depositar_montoCero() public {
        vm.prank(extrano);
        vm.expectRevert(abi.encodeWithSelector(Llave.MontoInvalido.selector));
        llave.depositar(0);
    }

    // ───────────── 18. configurar ─────────────

    function test_configurar_reemplazaLaConfig() public {
        address[] memory hs = new address[](3);
        hs[0] = tomas;
        hs[1] = extrano;
        hs[2] = makeAddr("sofia");
        uint16[] memory bs = new uint16[](3);
        bs[0] = 5000;
        bs[1] = 3000;
        bs[2] = 2000;
        Llave.Config memory c = _cfg(marta, hs, bs, 120, 45);

        vm.warp(T0 + 20);
        vm.expectEmit(address(llave));
        emit Llave.Configurada(marta, hs, bs, 120, 45);
        vm.prank(marta);
        llave.configurar(c);

        assertEq(llave.plazoInactividad(), 120);
        assertEq(llave.plazoGracia(), 45);
        assertEq(llave.ultimaSenal(), T0 + 20);
        assertEq(llave.venceEn(), T0 + 20 + 120);
        Llave.Heredero[] memory r = llave.herederos();
        assertEq(r.length, 3);
        assertEq(r[0].cuenta, tomas);
        assertEq(r[0].bps, 5000);
        assertEq(r[2].bps, 2000);

        (bool es,) = llave.esHeredero(lucia);
        assertFalse(es, "lucia ya no es heredera");
        assertEq(llave.parteDe(lucia), 0);
        (bool esT, uint16 bT) = llave.esHeredero(tomas);
        assertTrue(esT);
        assertEq(bT, 5000);
    }

    function test_configurar_soloElDueno() public {
        Llave.Config memory c = _cfgBase();
        vm.prank(lucia);
        vm.expectRevert(abi.encodeWithSelector(Llave.NoEsDueno.selector, lucia));
        llave.configurar(c);
    }

    function test_configurar_exigeMismoDueno() public {
        Llave.Config memory c = _cfgBase();
        c.dueno = extrano;
        vm.prank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, extrano));
        llave.configurar(c);
    }

    function test_configurar_validaIgualQueElConstructor() public {
        vm.startPrank(marta);

        vm.expectRevert(abi.encodeWithSelector(Llave.PorcentajesInvalidos.selector, uint256(9999)));
        llave.configurar(_cfg(marta, _dos(lucia, tomas), _bps(5999, 4000), INACTIVIDAD, GRACIA));

        vm.expectRevert(abi.encodeWithSelector(Llave.PorcentajesInvalidos.selector, uint256(10_000)));
        llave.configurar(_cfg(marta, _dos(lucia, tomas), _bps(10_000, 0), INACTIVIDAD, GRACIA));

        vm.expectRevert(abi.encodeWithSelector(Llave.CantidadHerederosInvalida.selector, uint256(0)));
        llave.configurar(_cfg(marta, new address[](0), new uint16[](0), INACTIVIDAD, GRACIA));

        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, marta));
        llave.configurar(_cfg(marta, _dos(marta, tomas), _bps(6000, 4000), INACTIVIDAD, GRACIA));

        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, tomas));
        llave.configurar(_cfg(marta, _dos(tomas, tomas), _bps(6000, 4000), INACTIVIDAD, GRACIA));

        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(0)));
        llave.configurar(_cfg(marta, _dos(lucia, address(0)), _bps(6000, 4000), INACTIVIDAD, GRACIA));

        vm.expectRevert(abi.encodeWithSelector(Llave.PlazoInvalido.selector, uint64(0), uint64(1)));
        llave.configurar(_cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), INACTIVIDAD, 0));

        vm.stopPrank();
    }

    function test_configurar_conPeriodoMinimoDeProduccion() public {
        uint64 treintaDias = 30 days;
        Llave l = new Llave(
            IKumplyAttestationStore(address(store)),
            IERC20(address(pesos)),
            treintaDias,
            _cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), 180 days, 30 days),
            COMISION,
            tesoreria
        );
        vm.prank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.PlazoInvalido.selector, uint64(60), treintaDias));
        l.configurar(_cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), 60, 30 days));
    }

    // ───────────── 19. transferirDueno ─────────────

    function test_transferirDueno_invalidos() public {
        vm.startPrank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(0)));
        llave.transferirDueno(address(0));

        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, lucia));
        llave.transferirDueno(lucia);

        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, marta));
        llave.transferirDueno(marta);
        vm.stopPrank();

        vm.prank(extrano);
        vm.expectRevert(abi.encodeWithSelector(Llave.NoEsDueno.selector, extrano));
        llave.transferirDueno(extrano);
    }

    function test_transferirDueno_ok() public {
        address sa = makeAddr("smartAccount0xGasless");
        vm.warp(T0 + 5);
        vm.expectEmit(address(llave));
        emit Llave.DuenoTransferido(marta, sa);
        vm.expectEmit(address(llave));
        emit Llave.SenalDeVida(sa, T0 + 5);
        vm.prank(marta);
        llave.transferirDueno(sa);

        assertEq(llave.dueno(), sa);
        assertEq(llave.ultimaSenal(), T0 + 5);

        vm.prank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.NoEsDueno.selector, marta));
        llave.estoyBien();

        vm.prank(sa);
        llave.estoyBien();
    }

    // ───────────── 20. SinSaldo ─────────────

    function test_liberar_sinSaldoRevierte() public {
        Llave l = _deploy(_cfgBase(), COMISION, tesoreria); // sin depósito
        _aEjecutable(l);
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(Llave.SinSaldo.selector));
        l.liberar();
    }

    // ───────────── Reentrancy (token malicioso) ─────────────

    function test_reentrancy_liberarBloqueaReentrada() public {
        TokenReentrante t = new TokenReentrante();
        Llave l = new Llave(
            IKumplyAttestationStore(address(store)), IERC20(address(t)), PERIODO_MINIMO, _cfgBase(), COMISION, tesoreria
        );
        t.mint(marta, DEPOSITO);
        vm.startPrank(marta);
        t.approve(address(l), DEPOSITO);
        l.depositar(DEPOSITO);
        vm.stopPrank();

        t.armar(address(l), abi.encodeCall(Llave.depositar, (1)));
        _liberar(l);

        assertTrue(t.intento(), "el token intento reentrar");
        assertFalse(t.exito(), "la reentrada tiene que fallar");
        assertEq(t.errorDevuelto(), abi.encodeWithSelector(ReentrancyGuard.ReentrancyGuardReentrantCall.selector));
        assertEq(t.balanceOf(address(l)), 0);
        assertEq(t.balanceOf(lucia) + t.balanceOf(tomas) + t.balanceOf(tesoreria), DEPOSITO);
    }

    function test_reentrancy_retirarBloqueaReentrada() public {
        TokenReentrante t = new TokenReentrante();
        Llave l = new Llave(
            IKumplyAttestationStore(address(store)), IERC20(address(t)), PERIODO_MINIMO, _cfgBase(), COMISION, tesoreria
        );
        t.mint(marta, DEPOSITO);
        vm.startPrank(marta);
        t.approve(address(l), DEPOSITO);
        l.depositar(DEPOSITO);
        vm.stopPrank();

        t.armar(address(l), abi.encodeCall(Llave.retirar, (marta, 1)));
        vm.prank(marta);
        l.retirar(marta, 1 ether);

        assertTrue(t.intento());
        assertFalse(t.exito());
        assertEq(t.errorDevuelto(), abi.encodeWithSelector(ReentrancyGuard.ReentrancyGuardReentrantCall.selector));
        assertEq(t.balanceOf(address(l)), DEPOSITO - 1 ether);
    }

    // ───────────── 21. Fuzz de reparto: Σ recibido + comisión == saldo ─────────────

    function testFuzz_reparto(uint8 nRaw, uint16[5] memory raw, uint256 saldo, uint16 comision) public {
        uint256 n = bound(nRaw, 2, 5);
        saldo = bound(saldo, 1, 1e36);
        comision = uint16(bound(comision, 0, 100));

        address[] memory hs = new address[](n);
        uint16[] memory bs = new uint16[](n);
        uint256 resto = 10_000;
        for (uint256 i; i < n; i++) {
            hs[i] = address(uint160(uint256(keccak256(abi.encode("heredero", i)))));
            if (i == n - 1) {
                // casting to 'uint16' is safe because resto <= 10_000
                // forge-lint: disable-next-line(unsafe-typecast)
                bs[i] = uint16(resto);
            } else {
                // Cada uno ≥ 1 y deja al menos 1 bps para cada heredero que falta.
                bs[i] = uint16(bound(raw[i], 1, resto - (n - 1 - i)));
                resto -= bs[i];
            }
        }

        Llave l = _deploy(_cfg(marta, hs, bs, INACTIVIDAD, GRACIA), comision, tesoreria);
        _depositar(l, marta, saldo);

        uint256[] memory previsto = new uint256[](n);
        for (uint256 i; i < n; i++) {
            previsto[i] = l.parteDe(hs[i]);
        }

        _liberar(l);

        uint256 recibido;
        for (uint256 i; i < n; i++) {
            uint256 b = pesos.balanceOf(hs[i]);
            assertEq(b, previsto[i], "parteDe coincide al wei");
            assertEq(l.parteDe(hs[i]), b, "parteDe despues de liberar");
            recibido += b;
        }
        uint256 com = pesos.balanceOf(tesoreria);
        assertEq(com, saldo * comision / 10_000, "comision sobre el total");
        assertEq(recibido + com, saldo, "no se pierde ni se crea un wei");
        assertEq(pesos.balanceOf(address(l)), 0, "la boveda queda en 0");
        assertEq(l.totalLiberado(), saldo);
    }

    // ───────────── 22. Fuzz de tiempo: fase() coherente ─────────────

    function testFuzz_faseCoherente(uint64 inact, uint64 gracia, uint64 dt1, bool reclamar, uint64 dt2) public {
        inact = uint64(bound(inact, 1, 365 days));
        gracia = uint64(bound(gracia, 1, 365 days));
        dt1 = uint64(bound(dt1, 0, 2 * 365 days));
        dt2 = uint64(bound(dt2, 0, 2 * 365 days));
        // La atestación del agente del setUp vence a T0 + 365 días: acá la estiramos para que el fuzz solo mida el
        // reloj de la Llave, no el de KUMPLY (eso lo cubre test_liberar_atestacionVencidaRevierteNotAgent).
        store.emitir(agente, 5, T0 + 10 * 365 days);

        Llave l = _deploy(_cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), inact, gracia), COMISION, tesoreria);
        uint64 vence = l.venceEn();
        assertEq(vence, T0 + inact);

        vm.warp(T0 + dt1);
        bool hayReclamo = reclamar && T0 + dt1 >= vence;
        if (hayReclamo) {
            vm.prank(agente);
            l.iniciarReclamo();
        }
        vm.warp(T0 + dt1 + dt2);
        uint64 ahora = uint64(block.timestamp);

        Llave.Fase esperada;
        if (hayReclamo) {
            uint64 termina = T0 + dt1 + gracia;
            assertEq(l.graciaTerminaEn(), termina);
            esperada = ahora >= termina ? Llave.Fase.Ejecutable : Llave.Fase.EnGracia;
        } else {
            assertEq(l.graciaTerminaEn(), 0);
            esperada = ahora >= vence ? Llave.Fase.Vencida : Llave.Fase.Activa;
        }
        assertEq(_fase(l), _u8(esperada));

        Llave.Estado memory e = l.estado();
        assertEq(uint8(e.fase), _u8(esperada));
        assertEq(e.ahora, ahora);
        assertEq(e.venceEn, vence);
        assertEq(e.graciaTerminaEn, l.graciaTerminaEn());
    }

    // ───────────── Bordes agregados por la validación ─────────────

    function test_constructor_revierte_herederoEsLaBoveda() public {
        address previsto = vm.computeCreateAddress(address(this), vm.getNonce(address(this)));
        Llave.Config memory c = _cfg(marta, _dos(lucia, previsto), _bps(6000, 4000), INACTIVIDAD, GRACIA);
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, previsto));
        _deploy(c, COMISION, tesoreria);
    }

    function test_configurar_revierte_herederoEsLaBoveda() public {
        vm.prank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(llave)));
        llave.configurar(_cfg(marta, _dos(lucia, address(llave)), _bps(6000, 4000), INACTIVIDAD, GRACIA));
    }

    function test_transferirDueno_revierte_aLaBoveda() public {
        vm.prank(marta);
        vm.expectRevert(abi.encodeWithSelector(Llave.DireccionInvalida.selector, address(llave)));
        llave.transferirDueno(address(llave));
        assertEq(llave.dueno(), marta);
    }

    function test_plazoMaximoNoRompeLecturas() public {
        uint64 max = type(uint64).max;

        // Inactividad "infinita": venceEn satura en uint64.max y la Llave sigue Activa.
        Llave l = _deploy(_cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), max, GRACIA), COMISION, tesoreria);
        assertEq(l.venceEn(), max);
        assertEq(_fase(l), _u8(Llave.Fase.Activa));
        Llave.Estado memory e = l.estado();
        assertEq(e.venceEn, max);
        assertEq(_u8(e.fase), _u8(Llave.Fase.Activa));

        // Gracia "infinita": graciaTerminaEn satura y la Llave queda EnGracia sin revertir.
        Llave g = _deploy(_cfg(marta, _dos(lucia, tomas), _bps(6000, 4000), INACTIVIDAD, max), COMISION, tesoreria);
        _aGracia(g);
        assertEq(g.graciaTerminaEn(), max);
        assertEq(_fase(g), _u8(Llave.Fase.EnGracia));
        e = g.estado();
        assertEq(e.graciaTerminaEn, max);
        assertEq(_u8(e.fase), _u8(Llave.Fase.EnGracia));
    }

    function test_liberar_parteCeroEmiteSinTransferir() public {
        Llave l = _deploy(_cfgBase(), COMISION, tesoreria);
        _depositar(l, marta, 1); // 1 wei: comisión 0, Lucía (60%) redondea a 0, Tomás (último) se lleva el polvo
        _aEjecutable(l);

        vm.recordLogs();
        vm.expectEmit(address(l));
        emit Llave.HerenciaEnviada(lucia, 0);
        vm.expectEmit(address(l));
        emit Llave.HerenciaEnviada(tomas, 1);
        vm.prank(agente);
        l.liberar();
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(_contar(logs, address(pesos), keccak256("Transfer(address,address,uint256)")), 1, "solo un Transfer");
        assertEq(_contar(logs, address(l), Llave.ComisionCobrada.selector), 0, "sin comision no hay evento");
        assertEq(pesos.balanceOf(lucia), 0);
        assertEq(pesos.balanceOf(tomas), 1);
        assertEq(pesos.balanceOf(address(l)), 0);
    }
}
