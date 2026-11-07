// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title DemoAttestationStore
/// @notice Store de atestaciones propio, escrito de cero, con la MISMA regla de `verify` que el AttestationStore
///         de KUMPLY. Sirve para los tests y como plan B declarado en el README si el staff no emite el tier 5 a
///         tiempo. No reemplaza a KUMPLY en producción.
contract DemoAttestationStore {
    struct Atestacion {
        bool ok;
        uint32 tier;
        uint64 ts;
        uint64 vence;
    }

    address public immutable admin;
    mapping(address => Atestacion) internal _a;

    error SoloAdmin();

    event Emitida(address indexed cuenta, uint32 tier, uint64 vence);
    event Revocada(address indexed cuenta);

    constructor() {
        admin = msg.sender;
    }

    modifier soloAdmin() {
        if (msg.sender != admin) revert SoloAdmin();
        _;
    }

    /// @notice Emite (o reemplaza) la atestación de `cuenta` con `tier` hasta `vence` (unix, estricto).
    function emitir(address cuenta, uint32 tier, uint64 vence) external soloAdmin {
        _a[cuenta] = Atestacion(true, tier, uint64(block.timestamp), vence);
        emit Emitida(cuenta, tier, vence);
    }

    /// @notice Borra la atestación (igual que `revoke` del store real).
    function revocar(address cuenta) external soloAdmin {
        delete _a[cuenta];
        emit Revocada(cuenta);
    }

    /// @notice (true, …) solo si existe y `vence > block.timestamp`; si no, (false, 0, 0, 0).
    function verify(address cuenta) external view returns (bool ok, uint32 tier, uint64 ts, uint64 expiry) {
        Atestacion memory x = _a[cuenta];
        // forge-lint: disable-next-line(block-timestamp) — el vencimiento es en segundos/días por diseño, igual que el store real
        if (x.ok && x.vence > uint64(block.timestamp)) return (true, x.tier, x.ts, x.vence);
        return (false, 0, 0, 0);
    }

    /// @notice Getter crudo, para que la interfaz IKumplyAttestationStore quede completa. No filtra vencimiento.
    function attestations(address cuenta)
        external
        view
        returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry, address verifier)
    {
        Atestacion memory x = _a[cuenta];
        return (x.ok, x.tier, x.ts, x.vence, admin);
    }
}
