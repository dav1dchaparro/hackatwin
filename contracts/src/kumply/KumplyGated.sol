// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IKumplyAttestationStore} from "./IKumplyAttestationStore.sol";

/// @title KumplyGated
/// @notice Base abstracta con el gate on-chain de KUMPLY, con la misma semántica que `@kumply/sdk`:
///         persona = ok && nivel <= tier <= 3 · empresa = tier == 4 · agente = tier == 5. El tier 0 nunca pasa.
/// @dev Copiada de PLAN_TAREA2_KUMPLY_GATE.md §2. Nunca la función deprecada de "tier mínimo" del store ni `tier >= N` a secas: con esa regla una
///      empresa o un agente pasarían como persona.
abstract contract KumplyGated {
    uint32 internal constant PERSON_MAX = 3;
    uint32 internal constant BUSINESS = 4; // KYB
    uint32 internal constant AGENT = 5; // KYA

    IKumplyAttestationStore public immutable kumply;

    error KumplyStoreInvalid(address store);
    error InvalidPersonLevel(uint32 level); // igual que el throw del SDK
    error NotPerson(address who, uint32 tier, uint32 minLevel); // tier = 0 → sin atestación válida
    error NotBusiness(address who, uint32 tier);
    error NotAgent(address who, uint32 tier);

    constructor(IKumplyAttestationStore store) {
        if (address(store).code.length == 0) revert KumplyStoreInvalid(address(store));
        kumply = store;
    }

    /// @dev `verify` ya filtra vencida/revocada/inexistente: devuelve 0 en esos casos.
    function _tierOf(address who) internal view returns (uint32) {
        (bool ok, uint32 tier,,) = kumply.verify(who);
        return ok ? tier : 0;
    }

    function _isPersonAtLeast(address who, uint32 level) internal view returns (bool) {
        if (level < 1 || level > PERSON_MAX) revert InvalidPersonLevel(level);
        uint32 t = _tierOf(who);
        return t >= level && t <= PERSON_MAX;
    }

    function _isBusiness(address who) internal view returns (bool) {
        return _tierOf(who) == BUSINESS;
    }

    function _isAgent(address who) internal view returns (bool) {
        return _tierOf(who) == AGENT;
    }

    // _require*: chequean a CUALQUIER dirección, no solo a msg.sender. Devuelven el tier para poder emitirlo.
    function _requirePersonAtLeast(address who, uint32 level) internal view returns (uint32 t) {
        if (level < 1 || level > PERSON_MAX) revert InvalidPersonLevel(level);
        t = _tierOf(who);
        if (t < level || t > PERSON_MAX) revert NotPerson(who, t, level);
    }

    function _requireBusiness(address who) internal view returns (uint32 t) {
        t = _tierOf(who);
        if (t != BUSINESS) revert NotBusiness(who, t);
    }

    function _requireAgent(address who) internal view returns (uint32 t) {
        t = _tierOf(who);
        if (t != AGENT) revert NotAgent(who, t);
    }

    modifier onlyPersonAtLeast(uint32 level) {
        _requirePersonAtLeast(msg.sender, level);
        _;
    }

    modifier onlyBusiness() {
        _requireBusiness(msg.sender);
        _;
    }

    modifier onlyAgent() {
        _requireAgent(msg.sender);
        _;
    }

    // Lectura pública: la web, el agente y `cast call` la usan para mostrar verde o rojo.
    function isPersonAtLeast(address who, uint32 level) external view returns (bool) {
        return _isPersonAtLeast(who, level);
    }

    function isBusiness(address who) external view returns (bool) {
        return _isBusiness(who);
    }

    function isAgent(address who) external view returns (bool) {
        return _isAgent(who);
    }
}
