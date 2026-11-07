// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Interfaz mínima del AttestationStore de KUMPLY (Fuji: 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD).
/// @dev Copiada de PLAN_TAREA2_KUMPLY_GATE.md §1. Nunca usar la función deprecada de "tier mínimo" ni `checkCompliance` (payable).
interface IKumplyAttestationStore {
    /// @notice Devuelve (false, 0, 0, 0) si la atestación venció (`expiry <= block.timestamp`), fue revocada o no existe.
    function verify(address subject) external view returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry);

    /// @notice Getter crudo: NO filtra el vencimiento. Solo para un paymaster propio (ERC-7562); no se usa en la Llave.
    function attestations(address subject)
        external
        view
        returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry, address verifier);
}
