// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockPesos (mPESO)
/// @notice "Plata de juguete" de testnet para la demo de la Llave: 18 decimales, faucet libre. Sin gate KUMPLY.
/// @dev Solo para Fuji. No tiene dueño ni valor: cualquiera puede mintear con `faucet()`.
contract MockPesos is ERC20 {
    /// @notice Lo que entrega cada llamada al faucet: $1.000.000 (18 decimales).
    uint256 public constant MONTO_FAUCET = 1_000_000 ether;

    constructor() ERC20("Pesos de Prueba (Fuji)", "mPESO") {}

    /// @notice Mintea MONTO_FAUCET a quien llama. Sin límite: es testnet.
    function faucet() external {
        _mint(msg.sender, MONTO_FAUCET);
    }

    /// @notice Mintea MONTO_FAUCET a otra cuenta (útil para cargar una smart account desde el deployer).
    function faucetPara(address a) external {
        _mint(a, MONTO_FAUCET);
    }
}
