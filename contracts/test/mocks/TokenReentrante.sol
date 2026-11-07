// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title TokenReentrante
/// @notice ERC-20 malicioso para tests: cuando está "armado", en cada `transfer` que sale de `objetivo` intenta volver
///         a entrar a `objetivo` con `llamada` y guarda cómo le fue (no propaga el revert, para que el test pueda
///         mirar el error exacto que devolvió el guard).
contract TokenReentrante is ERC20 {
    address public objetivo;
    bytes public llamada;
    bool public intento;
    bool public exito;
    bytes public errorDevuelto;

    constructor() ERC20("Token Reentrante", "REENT") {}

    function mint(address a, uint256 m) external {
        _mint(a, m);
    }

    /// @notice Arma el ataque: la próxima transferencia desde `objetivo_` dispara `llamada_` contra `objetivo_`.
    function armar(address objetivo_, bytes calldata llamada_) external {
        objetivo = objetivo_;
        llamada = llamada_;
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (from == objetivo && objetivo != address(0) && !intento) {
            intento = true;
            (exito, errorDevuelto) = objetivo.call(llamada);
        }
    }
}
