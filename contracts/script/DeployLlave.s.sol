// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Llave} from "../src/Llave.sol";
import {MockPesos} from "../src/MockPesos.sol";
import {DemoAttestationStore} from "../src/demo/DemoAttestationStore.sol";
import {IKumplyAttestationStore} from "../src/kumply/IKumplyAttestationStore.sol";

/// @title DeployLlave
/// @notice Despliega una instancia de la Llave en Avalanche Fuji (43113), en un solo comando y con todo leído del
///         entorno (ver `contracts/.env.example` y `contracts/README.md`):
///           1. (plan B, `USAR_STORE_DEMO=true`) un `DemoAttestationStore` propio que emite tier 5 al agente;
///              si no, usa el AttestationStore oficial de KUMPLY (`KUMPLY_STORE`).
///           2. `MockPesos` nuevo si `PESOS_ADDRESS` está vacío; si no, usa ese token.
///           3. La `Llave` con herederos, porcentajes, plazos, comisión y tesorería.
///           4. La siembra (`DEMO_SIEMBRA`): el deployer hace faucet (si hace falta), approve y depositar.
///         Al final comprueba el estado (fase Activa, saldo = siembra) y loguea las direcciones y una línea JSON
///         para copiar a `deployments/fuji.json`.
/// @dev Sin claves en archivos: la cuenta se pasa por CLI (`--account <keystore> --sender <dirección>`).
///      Sin `--broadcast` es solo una simulación (sirve contra `anvil --chain-id 43113`).
contract DeployLlave is Script {
    /// @notice Store de KUMPLY en Fuji (por defecto si `KUMPLY_STORE` está vacío).
    address internal constant KUMPLY_STORE_FUJI = 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD;
    uint256 internal constant CHAIN_ID_FUJI = 43113;
    uint32 internal constant TIER_EMPRESA = 4;
    uint32 internal constant TIER_AGENTE = 5;
    /// @notice Tope de llamadas a `faucet()` en la siembra (10 × 1.000.000 mPESO).
    uint256 internal constant MAX_FAUCETS = 10;

    /// @notice Todo lo que el script lee del entorno, ya validado y con los valores por defecto aplicados.
    struct Params {
        bool usarStoreDemo; // USAR_STORE_DEMO
        address kumplyStore; // KUMPLY_STORE (se ignora con el store demo)
        address pesos; // PESOS_ADDRESS; 0 = desplegar MockPesos
        uint64 periodoMinimo; // PERIODO_MINIMO
        address dueno; // DEMO_DUENO; 0 = el deployer
        address[] herederos; // DEMO_HEREDEROS
        uint16[] bps; // DEMO_BPS
        uint64 plazoInactividad; // DEMO_INACTIVIDAD
        uint64 plazoGracia; // DEMO_GRACIA
        uint16 comisionBps; // COMISION_BPS
        address tesoreria; // TESORERIA; 0 = el deployer
        uint256 siembra; // DEMO_SIEMBRA (unidades mínimas del token)
        address agente; // AGENTE_ADDRESS (obligatorio con el store demo)
        address[] agentesExtra; // AGENTES_EXTRA (store demo: también tier 5)
        address[] empresasExtra; // EMPRESAS_EXTRA (store demo: tier 4, para la evidencia NotAgent(x,4))
        uint64 venceAtestacion; // STORE_DEMO_VIGENCIA_S segundos desde ahora
    }

    /// @notice Lo que quedó desplegado (también lo devuelve `run()`, útil para tests de script).
    struct Desplegado {
        address store;
        address pesos;
        address llave;
        bool storeDemo;
        bool pesosNuevo;
    }

    function run() external returns (Desplegado memory d) {
        require(block.chainid == CHAIN_ID_FUJI, "DeployLlave: solo Avalanche Fuji (chainId 43113)");

        Params memory p = _leerEntorno();
        address deployer = msg.sender; // = --sender / --account (o el sender por defecto en una simulación)
        if (p.dueno == address(0)) p.dueno = deployer;
        if (p.tesoreria == address(0)) p.tesoreria = deployer;

        vm.startBroadcast();

        // 1. Store de atestaciones: el oficial de KUMPLY o el demo (plan B, P1-10).
        if (p.usarStoreDemo) {
            d.store = address(_desplegarStoreDemo(p));
            d.storeDemo = true;
        } else {
            require(p.kumplyStore.code.length > 0, "DeployLlave: KUMPLY_STORE no tiene codigo en esta red");
            d.store = p.kumplyStore;
        }

        // 2. Token de la bóveda.
        if (p.pesos == address(0)) {
            d.pesos = address(new MockPesos());
            d.pesosNuevo = true;
        } else {
            require(p.pesos.code.length > 0, "DeployLlave: PESOS_ADDRESS no tiene codigo en esta red");
            d.pesos = p.pesos;
        }

        // 3. La Llave. El constructor valida todo (herederos, bps, plazos, comisión, tesorería).
        Llave.Config memory c = Llave.Config({
            dueno: p.dueno,
            herederos: p.herederos,
            bps: p.bps,
            plazoInactividad: p.plazoInactividad,
            plazoGracia: p.plazoGracia
        });
        d.llave = address(
            new Llave(IKumplyAttestationStore(d.store), IERC20(d.pesos), p.periodoMinimo, c, p.comisionBps, p.tesoreria)
        );

        // 4. Siembra: la hace el deployer (cualquiera puede depositar; si el deployer es el dueño, cuenta como señal).
        if (p.siembra > 0) _sembrar(Llave(d.llave), d.pesos, deployer, p.siembra);

        vm.stopBroadcast();

        _comprobar(Llave(d.llave), p);
        _loguear(d, p, deployer);
    }

    // ───────────── Pasos ─────────────

    /// @dev Plan B declarado: store propio con la MISMA regla de `verify` que KUMPLY. El admin es el deployer.
    function _desplegarStoreDemo(Params memory p) internal returns (DemoAttestationStore s) {
        require(p.agente != address(0), "DeployLlave: con USAR_STORE_DEMO=true falta AGENTE_ADDRESS");
        s = new DemoAttestationStore();
        s.emitir(p.agente, TIER_AGENTE, p.venceAtestacion);
        for (uint256 i = 0; i < p.agentesExtra.length; i++) {
            s.emitir(p.agentesExtra[i], TIER_AGENTE, p.venceAtestacion);
        }
        for (uint256 i = 0; i < p.empresasExtra.length; i++) {
            s.emitir(p.empresasExtra[i], TIER_EMPRESA, p.venceAtestacion);
        }
    }

    /// @dev Si el deployer no tiene saldo y el token es un MockPesos, pide al faucet las veces que haga falta.
    ///      Con un token real (USDC de Fuji) el deployer ya tiene que tener el saldo.
    function _sembrar(Llave llave, address token, address deployer, uint256 siembra) internal {
        uint256 saldo = IERC20(token).balanceOf(deployer);
        if (saldo < siembra) {
            uint256 porFaucet = _montoFaucet(token);
            require(
                porFaucet > 0, "DeployLlave: el deployer no tiene saldo para DEMO_SIEMBRA y el token no tiene faucet"
            );
            uint256 veces = (siembra - saldo + porFaucet - 1) / porFaucet;
            require(veces <= MAX_FAUCETS, "DeployLlave: DEMO_SIEMBRA demasiado grande para el faucet");
            for (uint256 i = 0; i < veces; i++) {
                MockPesos(token).faucet();
            }
        }
        IERC20(token).approve(address(llave), siembra);
        llave.depositar(siembra);
    }

    /// @dev Post-condiciones (lecturas, no se transmiten). Si algo no cierra, el script falla antes de loguear.
    function _comprobar(Llave llave, Params memory p) internal view {
        require(llave.dueno() == p.dueno, "DeployLlave: el dueno no quedo bien");
        require(llave.fase() == Llave.Fase.Activa, "DeployLlave: la Llave no quedo en fase Activa");
        require(llave.token().balanceOf(address(llave)) == p.siembra, "DeployLlave: el saldo no es DEMO_SIEMBRA");
        require(llave.comisionBps() == p.comisionBps, "DeployLlave: comisionBps no coincide");
        require(llave.tesoreria() == p.tesoreria, "DeployLlave: tesoreria no coincide");
        if (p.usarStoreDemo) require(llave.isAgent(p.agente), "DeployLlave: el agente no quedo con tier 5");
    }

    function _loguear(Desplegado memory d, Params memory p, address deployer) internal view {
        Llave llave = Llave(d.llave);
        console2.log("=== DeployLlave (Avalanche Fuji, 43113) ===");
        console2.log("deployer             ", deployer);
        if (d.storeDemo) console2.log("store demo (plan B)  ", d.store);
        else console2.log("store KUMPLY oficial ", d.store);
        console2.log(d.pesosNuevo ? "MockPesos (nuevo)    " : "token (existente)    ", d.pesos);
        console2.log("Llave                ", d.llave);
        console2.log("dueno                ", p.dueno);
        console2.log("tesoreria            ", p.tesoreria);
        console2.log("comisionBps          ", uint256(p.comisionBps));
        console2.log("plazoInactividad (s) ", uint256(p.plazoInactividad));
        console2.log("plazoGracia (s)      ", uint256(p.plazoGracia));
        console2.log("saldo sembrado       ", llave.token().balanceOf(d.llave));
        for (uint256 i = 0; i < p.herederos.length; i++) {
            console2.log("heredero / bps       ", p.herederos[i], uint256(p.bps[i]));
        }
        if (p.agente != address(0)) {
            console2.log("agente               ", p.agente);
            console2.log("agente isAgent (tier 5)", llave.isAgent(p.agente));
            if (!llave.isAgent(p.agente)) {
                console2.log("AVISO: el agente todavia no tiene tier 5 en el store: no va a poder iniciar ni liberar");
            }
        }
        if (p.dueno == deployer) {
            console2.log("AVISO: el dueno es el deployer. Pasarlo a la SA de Marta con:");
            console2.log("  cast send <LLAVE> \"transferirDueno(address)\" <SA_MARTA> --account $DEPLOYER_ACCOUNT");
        }
        console2.log(
            "--- Fragmento JSON con el esquema de deployments/fuji.json (fusionar campo por campo; actualizar a mano"
        );
        console2.log("    'actualizado' y 'cuentas.*'; la Llave va en llave.<LLAVE_INSTANCIA>) ---");
        console2.log(_json(d, p));
        console2.log("Despues: node script/export-abi.mjs");
    }

    /// @dev Fragmento con los MISMOS nombres y forma que el esquema de `deployments/fuji.json` (interfaces §4): se
    ///      fusiona campo por campo (por ejemplo con `jq -s '.[0] * .[1]'`). No incluye `actualizado` (fecha ISO, se
    ///      completa a mano), `kumplyStore` fijo ni `cuentas.*`, que no dependen de este deploy. La instancia de
    ///      `llave` sale de `LLAVE_INSTANCIA` (A o B, por defecto A).
    function _json(Desplegado memory d, Params memory p) internal view returns (string memory) {
        string memory instancia = _envString("LLAVE_INSTANCIA");
        if (bytes(instancia).length == 0) instancia = "A";
        string memory demo = string.concat(
            '{"periodoMinimo":',
            vm.toString(uint256(p.periodoMinimo)),
            ',"plazoInactividad":',
            vm.toString(uint256(p.plazoInactividad)),
            ',"plazoGracia":',
            vm.toString(uint256(p.plazoGracia)),
            "}"
        );
        string memory agente = string.concat(
            '{"cuenta":"', vm.toString(p.agente), '","tier":5,"tipo":"EOA del agente, atestada tier 5 por KUMPLY"}'
        );
        return string.concat(
            '{"chainId":43113,"attestationStoreEnUso":"',
            vm.toString(d.store),
            '","mockPesos":"',
            vm.toString(d.pesos),
            '","tesoreria":"',
            vm.toString(p.tesoreria),
            '","comisionBps":',
            vm.toString(uint256(p.comisionBps)),
            ',"llave":{"',
            instancia,
            '":"',
            vm.toString(d.llave),
            '"},"demo":',
            demo,
            ',"agente":',
            agente,
            "}"
        );
    }

    // ───────────── Entorno ─────────────

    function _leerEntorno() internal view returns (Params memory p) {
        p.usarStoreDemo = _envBool("USAR_STORE_DEMO");
        p.kumplyStore = _envAddressOr("KUMPLY_STORE", KUMPLY_STORE_FUJI);
        p.pesos = _envAddressOr("PESOS_ADDRESS", address(0));
        p.periodoMinimo = _toUint64(_envUintOr("PERIODO_MINIMO", 1), "PERIODO_MINIMO");
        p.dueno = _envAddressOr("DEMO_DUENO", address(0));

        // Obligatorios: separados por comas, en el mismo orden (heredero i ↔ bps i).
        p.herederos = vm.envAddress("DEMO_HEREDEROS", ",");
        uint256[] memory bps = vm.envUint("DEMO_BPS", ",");
        require(bps.length == p.herederos.length, "DeployLlave: DEMO_BPS y DEMO_HEREDEROS tienen distinto largo");
        p.bps = new uint16[](bps.length);
        for (uint256 i = 0; i < bps.length; i++) {
            require(bps[i] <= type(uint16).max, "DeployLlave: un valor de DEMO_BPS no entra en uint16");
            // forge-lint: disable-next-line(unsafe-typecast)
            p.bps[i] = uint16(bps[i]); // seguro: chequeado arriba
        }

        p.plazoInactividad = _toUint64(_envUintOr("DEMO_INACTIVIDAD", 60), "DEMO_INACTIVIDAD");
        p.plazoGracia = _toUint64(_envUintOr("DEMO_GRACIA", 30), "DEMO_GRACIA");
        uint256 comision = _envUintOr("COMISION_BPS", 100);
        require(comision <= type(uint16).max, "DeployLlave: COMISION_BPS no entra en uint16");
        // forge-lint: disable-next-line(unsafe-typecast)
        p.comisionBps = uint16(comision); // seguro: chequeado arriba
        p.tesoreria = _envAddressOr("TESORERIA", address(0));
        p.siembra = _envUintOr("DEMO_SIEMBRA", 0);

        p.agente = _envAddressOr("AGENTE_ADDRESS", address(0));
        p.agentesExtra = _envAddressList("AGENTES_EXTRA");
        p.empresasExtra = _envAddressList("EMPRESAS_EXTRA");
        uint256 vigencia = _envUintOr("STORE_DEMO_VIGENCIA_S", 30 days);
        require(vigencia > 0, "DeployLlave: STORE_DEMO_VIGENCIA_S tiene que ser > 0");
        p.venceAtestacion = _toUint64(block.timestamp + vigencia, "STORE_DEMO_VIGENCIA_S");
    }

    /// @dev Vacío o ausente = "". Así una línea `VAR=` del .env.example funciona como "usar el valor por defecto".
    function _envString(string memory k) internal view returns (string memory) {
        return vm.trim(vm.envOr(k, string("")));
    }

    function _envAddressOr(string memory k, address def) internal view returns (address) {
        string memory s = _envString(k);
        return bytes(s).length == 0 ? def : vm.parseAddress(s);
    }

    function _envUintOr(string memory k, uint256 def) internal view returns (uint256) {
        string memory s = _envString(k);
        return bytes(s).length == 0 ? def : vm.parseUint(s);
    }

    /// @dev "true", "1", "si" o "sí" (sin importar mayúsculas) = true; cualquier otra cosa = false.
    function _envBool(string memory k) internal view returns (bool) {
        bytes32 h = keccak256(bytes(vm.toLowercase(_envString(k))));
        return h == keccak256("true") || h == keccak256("1") || h == keccak256("si") || h == keccak256(unicode"sí");
    }

    /// @dev Lista opcional separada por comas; vacía si la variable no está o está vacía.
    function _envAddressList(string memory k) internal view returns (address[] memory out) {
        string memory s = _envString(k);
        if (bytes(s).length == 0) return new address[](0);
        string[] memory partes = vm.split(s, ",");
        out = new address[](partes.length);
        for (uint256 i = 0; i < partes.length; i++) {
            out[i] = vm.parseAddress(vm.trim(partes[i]));
        }
    }

    function _toUint64(uint256 v, string memory k) internal pure returns (uint64) {
        require(v <= type(uint64).max, string.concat("DeployLlave: ", k, " no entra en uint64"));
        // forge-lint: disable-next-line(unsafe-typecast)
        return uint64(v); // seguro: chequeado arriba
    }

    /// @dev `MONTO_FAUCET()` por staticcall (no se transmite): > 0 solo si el token es un MockPesos.
    function _montoFaucet(address token) internal view returns (uint256) {
        (bool ok, bytes memory ret) = token.staticcall(abi.encodeWithSignature("MONTO_FAUCET()"));
        if (!ok || ret.length != 32) return 0;
        return abi.decode(ret, (uint256));
    }
}
