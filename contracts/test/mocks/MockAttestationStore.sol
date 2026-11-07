// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title MockAttestationStore
/// @notice Réplica EXACTA de la regla de `verify()` del AttestationStore de KUMPLY (PLAN_TAREA2 §4), pero con
///         `set` libre: permite cargar `ok = false` con un tier distinto de 0, cosa que el DemoAttestationStore no
///         deja hacer. Solo para tests.
contract MockAttestationStore {
    struct A {
        bool ok;
        uint32 tier;
        uint64 ts;
        uint64 expiry;
    }

    mapping(address => A) internal a;

    /// @notice Carga (o reemplaza) la atestación cruda de `who`. `ts` = ahora.
    function set(address who, bool ok, uint32 tier, uint64 expiry) external {
        a[who] = A(ok, tier, uint64(block.timestamp), expiry);
    }

    /// @notice Igual que `revoke` del store real: borra el registro.
    function revoke(address who) external {
        delete a[who];
    }

    /// @notice (true, …) solo si `ok` y `expiry > block.timestamp` (estricto); si no, (false, 0, 0, 0).
    function verify(address who) external view returns (bool, uint32, uint64, uint64) {
        A memory x = a[who];
        // Misma comparación estricta que el store real (el vencimiento es por tiempo, no por bloque).
        // forge-lint: disable-next-line(block-timestamp)
        if (x.ok && x.expiry > uint64(block.timestamp)) return (true, x.tier, x.ts, x.expiry);
        return (false, 0, 0, 0);
    }

    /// @notice Getter crudo (no filtra vencimiento), para completar la interfaz IKumplyAttestationStore.
    function attestations(address who)
        external
        view
        returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry, address verifier)
    {
        A memory x = a[who];
        return (x.ok, x.tier, x.ts, x.expiry, address(this));
    }
}
