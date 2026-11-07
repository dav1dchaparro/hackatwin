// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {KumplyGated} from "../../src/kumply/KumplyGated.sol";
import {IKumplyAttestationStore} from "../../src/kumply/IKumplyAttestationStore.sol";

/// @title GatedHarness
/// @notice Expone cada modifier y cada `_require*` de KumplyGated para testearlos (PLAN_TAREA2 §4). `pagar` imita al
///         `PaymentGuard` del plan (§7): un agente KYA que solo le puede pagar a una empresa KYB (chequeo de TERCERO).
contract GatedHarness is KumplyGated {
    event Pagado(address indexed agente, address indexed proveedor, uint32 tierAgente, uint32 tierProveedor);

    constructor(IKumplyAttestationStore store) KumplyGated(store) {}

    // ── Modifiers (sobre msg.sender) ──

    function soloPersona1() external view onlyPersonAtLeast(1) returns (bool) {
        return true;
    }

    function soloPersona2() external view onlyPersonAtLeast(2) returns (bool) {
        return true;
    }

    function soloPersona3() external view onlyPersonAtLeast(3) returns (bool) {
        return true;
    }

    function soloEmpresa() external view onlyBusiness returns (bool) {
        return true;
    }

    function soloAgente() external view onlyAgent returns (bool) {
        return true;
    }

    // ── _require* sobre cualquier dirección (devuelven el tier) ──

    function requirePersona(address who, uint32 level) external view returns (uint32) {
        return _requirePersonAtLeast(who, level);
    }

    function requireEmpresa(address who) external view returns (uint32) {
        return _requireBusiness(who);
    }

    function requireAgente(address who) external view returns (uint32) {
        return _requireAgent(who);
    }

    function tierDe(address who) external view returns (uint32) {
        return _tierOf(who);
    }

    // ── Tercero: el agente (msg.sender) le paga a un proveedor que tiene que ser empresa ──

    function pagar(address proveedor) external {
        uint32 ta = _requireAgent(msg.sender);
        uint32 tp = _requireBusiness(proveedor);
        emit Pagado(msg.sender, proveedor, ta, tp);
    }
}
