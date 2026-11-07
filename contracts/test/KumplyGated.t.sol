// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {KumplyGated} from "../src/kumply/KumplyGated.sol";
import {IKumplyAttestationStore} from "../src/kumply/IKumplyAttestationStore.sol";
import {MockAttestationStore} from "./mocks/MockAttestationStore.sol";
import {GatedHarness} from "./mocks/GatedHarness.sol";

/// @notice Casos 1-10 de PLAN_TAREA2 §4: la semántica del gate tiene que ser IGUAL a la de `@kumply/sdk`
///         (persona = nivel <= tier <= 3 · empresa = 4 · agente = 5). Nunca la regla deprecada `tier >= N`.
contract KumplyGatedTest is Test {
    MockAttestationStore internal store;
    GatedHarness internal g;

    address internal persona1 = makeAddr("persona1");
    address internal persona2 = makeAddr("persona2");
    address internal persona3 = makeAddr("persona3");
    address internal empresa = makeAddr("empresa"); // tier 4
    address internal agente = makeAddr("agente"); // tier 5
    address internal sinKya = makeAddr("sinKya"); // sin atestación

    uint64 internal lejos;

    function setUp() public {
        vm.warp(1_778_000_000);
        lejos = uint64(block.timestamp + 365 days);
        store = new MockAttestationStore();
        g = new GatedHarness(IKumplyAttestationStore(address(store)));
        store.set(persona1, true, 1, lejos);
        store.set(persona2, true, 2, lejos);
        store.set(persona3, true, 3, lejos);
        store.set(empresa, true, 4, lejos);
        store.set(agente, true, 5, lejos);
    }

    // ───────────── 1. Persona por nivel; tier 4 y 5 NUNCA son persona ─────────────

    function test_persona_niveles() public view {
        assertTrue(g.isPersonAtLeast(persona1, 1));
        assertFalse(g.isPersonAtLeast(persona1, 2));
        assertFalse(g.isPersonAtLeast(persona1, 3));

        assertTrue(g.isPersonAtLeast(persona2, 1));
        assertTrue(g.isPersonAtLeast(persona2, 2));
        assertFalse(g.isPersonAtLeast(persona2, 3));

        assertTrue(g.isPersonAtLeast(persona3, 1));
        assertTrue(g.isPersonAtLeast(persona3, 2));
        assertTrue(g.isPersonAtLeast(persona3, 3));
    }

    function test_persona_empresaYAgenteNuncaSonPersona() public view {
        for (uint32 nivel = 1; nivel <= 3; nivel++) {
            assertFalse(g.isPersonAtLeast(empresa, nivel), "empresa (4) paso como persona");
            assertFalse(g.isPersonAtLeast(agente, nivel), "agente (5) paso como persona");
            assertFalse(g.isPersonAtLeast(sinKya, nivel), "sin atestacion paso como persona");
        }
    }

    function test_persona_requireRevierteConTierYNivel() public {
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotPerson.selector, persona1, uint32(1), uint32(2)));
        g.requirePersona(persona1, 2);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotPerson.selector, empresa, uint32(4), uint32(1)));
        g.requirePersona(empresa, 1);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotPerson.selector, agente, uint32(5), uint32(3)));
        g.requirePersona(agente, 3);

        assertEq(g.requirePersona(persona3, 2), 3, "_requirePersonAtLeast devuelve el tier");
    }

    function test_persona_modifiers() public {
        vm.prank(persona2);
        assertTrue(g.soloPersona2());

        vm.prank(persona2);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotPerson.selector, persona2, uint32(2), uint32(3)));
        g.soloPersona3();

        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotPerson.selector, agente, uint32(5), uint32(1)));
        g.soloPersona1();
    }

    // ───────────── 2. Nivel inválido ─────────────

    function test_nivelInvalido() public {
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.InvalidPersonLevel.selector, uint32(0)));
        g.isPersonAtLeast(persona1, 0);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.InvalidPersonLevel.selector, uint32(4)));
        g.isPersonAtLeast(persona1, 4);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.InvalidPersonLevel.selector, uint32(0)));
        g.requirePersona(persona3, 0);
    }

    // ───────────── 3. Empresa = 4 exacto; agente = 5 exacto ─────────────

    function test_empresaYAgenteExactos() public {
        assertTrue(g.isBusiness(empresa));
        assertFalse(g.isBusiness(persona3));
        assertFalse(g.isBusiness(agente));

        assertTrue(g.isAgent(agente));
        assertFalse(g.isAgent(empresa));
        assertFalse(g.isAgent(persona3));

        assertEq(g.requireEmpresa(empresa), 4);
        assertEq(g.requireAgente(agente), 5);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotBusiness.selector, persona3, uint32(3)));
        g.requireEmpresa(persona3);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotBusiness.selector, agente, uint32(5)));
        g.requireEmpresa(agente);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, empresa, uint32(4)));
        g.requireAgente(empresa);
    }

    // ───────────── 4. Vencida: el borde es expiry == timestamp ─────────────

    function test_vencida_bordeExacto() public {
        address x = makeAddr("x");
        uint64 ahora = uint64(block.timestamp);
        store.set(x, true, 5, ahora + 10);

        vm.warp(ahora + 9);
        assertTrue(g.isAgent(x), "un segundo antes del vencimiento sigue valida");

        vm.warp(ahora + 10);
        assertFalse(g.isAgent(x), "expiry == timestamp ya esta vencida");
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, x, uint32(0)));
        g.requireAgente(x);
    }

    // ───────────── 5. Revocada / ok = false ─────────────

    function test_revocada() public {
        assertTrue(g.isAgent(agente));
        store.revoke(agente);
        assertFalse(g.isAgent(agente));
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, agente, uint32(0)));
        g.requireAgente(agente);
    }

    function test_okFalseConTier5NoPasa() public {
        address x = makeAddr("okFalse");
        store.set(x, false, 5, lejos);
        assertFalse(g.isAgent(x));
        assertEq(g.tierDe(x), 0, "ok = false se trata como tier 0");
    }

    // ───────────── 6. Sin atestación ─────────────

    function test_sinAtestacion() public {
        assertEq(g.tierDe(sinKya), 0);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, sinKya, uint32(0)));
        g.requireAgente(sinKya);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotBusiness.selector, sinKya, uint32(0)));
        g.requireEmpresa(sinKya);

        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotPerson.selector, sinKya, uint32(0), uint32(1)));
        g.requirePersona(sinKya, 1);
    }

    // ───────────── 7. Modifiers sobre msg.sender ─────────────

    function test_modifiers_agenteYEmpresa() public {
        vm.prank(agente);
        assertTrue(g.soloAgente());

        vm.prank(empresa);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, empresa, uint32(4)));
        g.soloAgente();

        vm.prank(empresa);
        assertTrue(g.soloEmpresa());

        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotBusiness.selector, agente, uint32(5)));
        g.soloEmpresa();
    }

    // ───────────── 8. Tercero (PaymentGuard) ─────────────

    function test_tercero_agentePagaAEmpresa() public {
        vm.expectEmit(address(g));
        emit GatedHarness.Pagado(agente, empresa, 5, 4);
        vm.prank(agente);
        g.pagar(empresa);
    }

    function test_tercero_agenteAPersonaRevierteNotBusiness() public {
        vm.prank(agente);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotBusiness.selector, persona3, uint32(3)));
        g.pagar(persona3);
    }

    function test_tercero_botSinKyaRevierteAntesNotAgent() public {
        // Aunque el proveedor tampoco sea empresa, el primer chequeo que falla es el del que llama.
        vm.prank(sinKya);
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, sinKya, uint32(0)));
        g.pagar(persona3);
    }

    // ───────────── 9. Constructor ─────────────

    function test_constructor_storeCero() public {
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.KumplyStoreInvalid.selector, address(0)));
        new GatedHarness(IKumplyAttestationStore(address(0)));
    }

    function test_constructor_storeEOA() public {
        address eoa = makeAddr("eoa");
        vm.expectRevert(abi.encodeWithSelector(KumplyGated.KumplyStoreInvalid.selector, eoa));
        new GatedHarness(IKumplyAttestationStore(eoa));
    }

    function test_constructor_guardaStore() public view {
        assertEq(address(g.kumply()), address(store));
    }

    // ───────────── 10. Fuzz: misma regla que el SDK ─────────────

    function testFuzz_reglaDelSdk(uint32 tier, uint32 nivel, bool ok) public {
        nivel = uint32(bound(nivel, 1, 3));
        address x = makeAddr("fuzz");
        store.set(x, ok, tier, lejos);

        uint32 t = ok ? tier : 0;
        assertEq(g.isPersonAtLeast(x, nivel), t >= nivel && t <= 3, "persona");
        assertEq(g.isBusiness(x), t == 4, "empresa");
        assertEq(g.isAgent(x), t == 5, "agente");
        assertEq(g.tierDe(x), t, "tier");
    }
}
