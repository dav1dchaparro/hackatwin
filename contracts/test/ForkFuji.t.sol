// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Llave} from "../src/Llave.sol";
import {MockPesos} from "../src/MockPesos.sol";
import {KumplyGated} from "../src/kumply/KumplyGated.sol";
import {IKumplyAttestationStore} from "../src/kumply/IKumplyAttestationStore.sol";

/// @notice Test fork contra el AttestationStore REAL de KUMPLY en Fuji. Usa las direcciones fixture del seed de
///         KUMPLY (nadie tiene sus claves; con `vm.prank` alcanza). Si no hay `FUJI_RPC_URL`, o no hay red, se
///         saltea (nunca falla por falta de red).
///         Correr: FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc forge test --match-contract ForkFuji -vv
///         Si el RPC oficial devuelve "error code: 1015" (rate limit de Cloudflare), el setUp lo trata como "sin red"
///         y se saltea; para correrlo igual: FUJI_RPC_URL=https://avalanche-fuji-c-chain-rpc.publicnode.com
contract ForkFujiTest is Test {
    IKumplyAttestationStore internal constant STORE =
        IKumplyAttestationStore(0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD);
    address internal constant AGENTE_TIER5 = 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2;
    address internal constant EMPRESA_TIER4 = 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9;
    address internal constant PERSONA_TIER3 = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    address internal constant SIN_ATESTACION = 0x000000000000000000000000000000000000dEaD;

    uint64 internal constant INACTIVIDAD = 60;
    uint64 internal constant GRACIA = 30;
    uint256 internal constant DEPOSITO = 1_000_000 ether;

    MockPesos internal pesos;
    Llave internal llave;

    address internal marta = makeAddr("marta");
    address internal lucia = makeAddr("lucia");
    address internal tomas = makeAddr("tomas");
    address internal tesoreria = makeAddr("tesoreria");

    function setUp() public {
        string memory rpc = vm.envOr("FUJI_RPC_URL", string(""));
        if (bytes(rpc).length == 0) {
            vm.skip(true);
            return;
        }
        try vm.createSelectFork(rpc) returns (uint256) {}
        catch {
            vm.skip(true); // hay URL pero no hay red: se saltea, no falla
            return;
        }
        assertEq(block.chainid, 43_113, "el RPC no es Fuji");

        pesos = new MockPesos();
        address[] memory hs = new address[](2);
        hs[0] = lucia;
        hs[1] = tomas;
        uint16[] memory bs = new uint16[](2);
        bs[0] = 6000;
        bs[1] = 4000;
        Llave.Config memory c =
            Llave.Config({dueno: marta, herederos: hs, bps: bs, plazoInactividad: INACTIVIDAD, plazoGracia: GRACIA});
        llave = new Llave(STORE, IERC20(address(pesos)), 1, c, 100, tesoreria);

        vm.startPrank(marta);
        pesos.faucet();
        pesos.approve(address(llave), DEPOSITO);
        llave.depositar(DEPOSITO);
        vm.stopPrank();
    }

    function test_fork_gateContraElStoreReal() public view {
        assertEq(address(llave.kumply()), address(STORE));

        (bool ok, uint32 tier,,) = STORE.verify(AGENTE_TIER5);
        assertTrue(ok);
        assertEq(tier, 5);

        assertTrue(llave.isAgent(AGENTE_TIER5), "0x9f8F es agente tier 5");
        assertFalse(llave.isAgent(EMPRESA_TIER4), "0x7Fc6 es empresa, no agente");
        assertFalse(llave.isAgent(SIN_ATESTACION), "0xdEaD no tiene atestacion");
        assertTrue(llave.isBusiness(EMPRESA_TIER4));
        assertFalse(llave.isBusiness(SIN_ATESTACION));
        assertTrue(llave.isPersonAtLeast(PERSONA_TIER3, 3));
        assertFalse(llave.isPersonAtLeast(EMPRESA_TIER4, 1));
    }

    function test_fork_agenteTier5IniciaYLibera() public {
        vm.warp(llave.venceEn());
        vm.expectEmit(address(llave));
        emit Llave.VerificadoKumply(AGENTE_TIER5, 5, 3);
        vm.prank(AGENTE_TIER5);
        llave.iniciarReclamo();
        assertEq(uint8(llave.fase()), uint8(Llave.Fase.EnGracia));

        vm.warp(llave.graciaTerminaEn());
        vm.prank(AGENTE_TIER5);
        llave.liberar();

        assertEq(uint8(llave.fase()), uint8(Llave.Fase.Liberada));
        assertEq(pesos.balanceOf(tesoreria), 10_000 ether);
        assertEq(pesos.balanceOf(lucia), 594_000 ether);
        assertEq(pesos.balanceOf(tomas), 396_000 ether);
        assertEq(pesos.balanceOf(address(llave)), 0);
    }

    function test_fork_empresaTier4Bloqueada() public {
        vm.warp(llave.venceEn());
        vm.prank(EMPRESA_TIER4);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, EMPRESA_TIER4, uint32(4)));
        llave.iniciarReclamo();
    }

    function test_fork_sinAtestacionBloqueada() public {
        vm.warp(llave.venceEn());
        vm.prank(SIN_ATESTACION);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, SIN_ATESTACION, uint32(0)));
        llave.iniciarReclamo();
    }
}
