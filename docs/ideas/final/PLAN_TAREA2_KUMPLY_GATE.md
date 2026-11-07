# Plan tarea 2: contrato base `KumplyGated` (Fuji, Foundry)

Fecha: 7/11/2026. Objetivo: tener **≤1,5 h** después un contrato hijo desplegado y VERIFICADO en Fuji, con un gate on-chain `isPersonAtLeast` / `isBusiness` / `isAgent` y una dirección que pasa y otra bloqueada. Sirve para cualquier idea (Tesorero con Correa, Sin Triangular, Factura…).
Estado del código de abajo: **boceto, sin compilar** [SIN VERIFICAR hasta el primer `forge build`].

## Lo que se confirmó en fuente (no repetir la investigación)
- `AttestationStore.verify(address) view → (bool verified, uint32 tier, uint64 timestamp, uint64 expiry)`. Devuelve `(false,0,0,0)` si la atestación venció (`expiry <= block.timestamp`), si fue revocada (`revoke` hace `delete`) o si nunca existió. Es gratis y funciona aunque el store esté pausado.
- `attestations(address)` es el getter crudo `(verified, tier, timestamp, expiry, verifier)`: **no** filtra el vencimiento. Solo se usa dentro de un paymaster (ver más abajo).
- La semántica del SDK (`packages/sdk/src/tier.ts`) es: **persona** = `ok && tier >= nivel && tier <= 3` (nivel 1, 2 o 3; si no, el SDK tira error). **Empresa** = `ok && tier == 4`. **Agente** = `ok && tier == 5`. El tier 0 nunca pasa. `hasTier` está deprecado (`tier >= N`) y las reglas lo prohíben.
- `ComplianceGate.sol` NO sirve: hace `tier < requiredTier` con `requiredTier = 2`, así que una empresa (4) y un agente (5) pasan como "persona". Encima es inmutable y usa el camino con fee (`checkCompliance`, payable).
- `KumplyPaymasterCheck.sol` lee el getter crudo porque ERC-7562 (OP-011) prohíbe `TIMESTAMP` durante `validatePaymasterUserOp`, y `verify()` lee `block.timestamp`. Por eso le pasa `expiry` como `validUntil` al EntryPoint. **A nosotros no nos afecta:** el gate corre en la fase de ejecución, donde `verify()` anda bien.
- Datos leídos hoy en Fuji con `cast` (solo lectura): `verificationFee() = 0`, `paused() = false`, `totalAttestations() = 50`. Las direcciones de demo (son del seed `contracts/scripts/seed-fuji.ts`) vencen el 16/07/2027:

| Dirección (Fuji) | verify() hoy | Uso en la demo |
|---|---|---|
| `0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2` | ok, tier 5 | agente que PASA |
| `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9` | ok, tier 4 | empresa que PASA (y agente BLOQUEADO) |
| `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` | ok, tier 3 | persona nivel 3 |
| `0x1F98431c8aD98523631AE4a59f267346ea31F984` | ok, tier 2 | persona nivel 2 |
| `0x000000000000000000000000000000000000dEaD` | false, 0 | sin atestación: BLOQUEADA |

Nadie tiene las claves de esas direcciones (son direcciones de tokens de mainnet usadas como fixtures). Sirven para `cast call --from` y para el test fork. **Para una tx real que pase hay que pedirle al staff una atestación sobre NUESTRA dirección** (es el cuello de botella humano, así que hay que pedirla ya).

## 1. Interfaz mínima y direcciones
```solidity
// src/kumply/IKumplyAttestationStore.sol
interface IKumplyAttestationStore {
    function verify(address subject) external view
        returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry);
    // Solo para un paymaster propio (ERC-7562). No filtra el vencimiento.
    function attestations(address subject) external view
        returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry, address verifier);
}
```
| Red | chainId | AttestationStore |
|---|---|---|
| Fuji C-Chain | 43113 | `0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD` |
| Mainnet C-Chain (beta de solo lectura) | 43114 | `0xa116261Ed3a848A9E1cd34923D5A0442D1455F71` |

No usar `checkCompliance()`: es payable, no es view y podría empezar a cobrar.

## 2. Contrato abstracto `KumplyGated`
```solidity
// src/kumply/KumplyGated.sol
abstract contract KumplyGated {
    uint32 internal constant PERSON_MAX = 3;
    uint32 internal constant BUSINESS = 4;  // KYB
    uint32 internal constant AGENT = 5;     // KYA
    IKumplyAttestationStore public immutable kumply;

    error KumplyStoreInvalid(address store);
    error InvalidPersonLevel(uint32 level);                          // igual que el throw del SDK
    error NotPerson(address who, uint32 tier, uint32 minLevel);     // tier = 0 → sin atestación válida
    error NotBusiness(address who, uint32 tier);
    error NotAgent(address who, uint32 tier);

    constructor(IKumplyAttestationStore store) {
        if (address(store).code.length == 0) revert KumplyStoreInvalid(address(store));
        kumply = store;
    }

    function _tierOf(address who) internal view returns (uint32) {
        (bool ok, uint32 tier,,) = kumply.verify(who);   // ya filtra vencida/revocada/inexistente
        return ok ? tier : 0;
    }
    function _isPersonAtLeast(address who, uint32 level) internal view returns (bool) {
        if (level < 1 || level > PERSON_MAX) revert InvalidPersonLevel(level);
        uint32 t = _tierOf(who);
        return t >= level && t <= PERSON_MAX;
    }
    function _isBusiness(address who) internal view returns (bool) { return _tierOf(who) == BUSINESS; }
    function _isAgent(address who)    internal view returns (bool) { return _tierOf(who) == AGENT; }

    // _require*: para chequear a CUALQUIER dirección (proveedor, contraparte), no solo msg.sender
    function _requirePersonAtLeast(address who, uint32 level) internal view {
        if (level < 1 || level > PERSON_MAX) revert InvalidPersonLevel(level);
        uint32 t = _tierOf(who);
        if (t < level || t > PERSON_MAX) revert NotPerson(who, t, level);
    }
    function _requireBusiness(address who) internal view { uint32 t = _tierOf(who); if (t != BUSINESS) revert NotBusiness(who, t); }
    function _requireAgent(address who)    internal view { uint32 t = _tierOf(who); if (t != AGENT)    revert NotAgent(who, t); }

    modifier onlyPersonAtLeast(uint32 level) { _requirePersonAtLeast(msg.sender, level); _; }
    modifier onlyBusiness() { _requireBusiness(msg.sender); _; }
    modifier onlyAgent()    { _requireAgent(msg.sender); _; }

    // Lectura pública: el front y `cast call` la usan para mostrar verde o rojo
    function isPersonAtLeast(address who, uint32 level) external view returns (bool) { return _isPersonAtLeast(who, level); }
    function isBusiness(address who) external view returns (bool) { return _isBusiness(who); }
    function isAgent(address who)    external view returns (bool) { return _isAgent(who); }
}
```
- Los errores llevan datos: en el front, viem decodifica `NotAgent(0x…, 4)` y muestra "es empresa, no agente". Con tier = 0 muestra "sin KYC/KYA vigente".
- Evento: la base no emite ninguno, porque los checks son `view` y desde un modifier view no se puede emitir. Cada hijo emite su propio evento de dominio (ej. `Paid(agent, supplier, amount)`).
- Nunca usar `tx.origin`, nunca `tier >= N` a secas. `isPersonAtLeast` en Solidity revierte con nivel 0/4/5, igual que el SDK.

## 3. Casos borde
- **Vencimiento:** lo filtra `verify()` (`expiry > block.timestamp`, estricto). No hay que comparar nada a mano.
- **Revocación:** `revoke` borra el registro, así que `verify` da `(false,0,..)` y el gate bloquea desde el bloque siguiente. Vencida, revocada e inexistente no se pueden distinguir, y no hace falta.
- **Sin atestación:** el tier es 0 y se revierte `NotX(who, 0)`.
- **Smart accounts ERC-4337 (0xGasless):** `msg.sender` es la smart account, no el EOA dueño. La atestación tiene que estar sobre ESA dirección (lo dice el README del SDK). Al pedirle al staff el tier 5 del agente hay que pasarle la dirección de la smart account. La dirección es contrafactual: se puede obtener antes del primer deploy [SIN VERIFICAR en el SDK de 0xGasless].
- **Terceros:** el proveedor, el dueño o la contraparte se chequean con `_requireBusiness(to)` y similares dentro del cuerpo. En flujos de dos pasos (el pago queda pendiente hasta que el dueño aprueba) hay que **volver a chequear al ejecutar**, porque la atestación puede vencer o ser revocada entre los dos pasos.
- **Reentrancy:** irrelevante para el gate. `verify` es una STATICCALL a un store inmutable y conocido, y no se puede cambiar estado. Si el hijo mueve AVAX o tokens, se aplica checks-effects-interactions como siempre.
- **Paymaster propio** (solo si se hace el combo con paymaster propio): NO llamar a `verify()` en la validación. Copiar `KumplyPaymasterCheck` (getter crudo, `tier == 5` exacto, `validUntil = expiry`). Según REGLAS, el lane KUMPLY+0xGasless en Fuji ya patrocina solo tier 5, así que probablemente no haga falta.
- **Confianza:** el admin y los verificadores de KUMPLY pueden emitir y revocar. Es aceptable y se declara en el README.

## 4. Mock y tests (Foundry)
```solidity
// test/mocks/MockAttestationStore.sol: replica EXACTA de la regla de verify()
contract MockAttestationStore {
    struct A { bool ok; uint32 tier; uint64 ts; uint64 expiry; }
    mapping(address => A) internal a;
    function set(address who, bool ok, uint32 tier, uint64 expiry) external { a[who] = A(ok, tier, uint64(block.timestamp), expiry); }
    function revoke(address who) external { delete a[who]; }
    function verify(address who) external view returns (bool, uint32, uint64, uint64) {
        A memory x = a[who];
        if (x.ok && x.expiry > uint64(block.timestamp)) return (true, x.tier, x.ts, x.expiry);
        return (false, 0, 0, 0);
    }
}
```
Tests (`test/KumplyGated.t.sol`, con un `GatedHarness is KumplyGated` que expone funciones con cada modifier):
1. Persona: tier 1 pasa nivel 1 y falla 2. Tier 2 pasa 1-2 y falla 3. Tier 3 pasa 1-3. **Tier 4 y 5 fallan en todo nivel de persona** (la trampa de `hasTier`).
2. `isPersonAtLeast(x, 0)` y `(x, 4)` revierten `InvalidPersonLevel`.
3. Empresa: tier 4 pasa, **3 y 5 fallan**. Agente: tier 5 pasa, **4 falla**.
4. Vencida: `set(x, true, 5, now+10)`, `vm.warp(now+10)` y falla (borde `expiry == timestamp`). Con `now+9` pasa.
5. Revocada: `revoke(x)` y falla. `ok=false` con tier 5 también falla.
6. Sin atestación: `vm.expectRevert(abi.encodeWithSelector(KumplyGated.NotAgent.selector, x, uint32(0)))`.
7. Modifiers: `vm.prank(agent)` pasa. `vm.prank(business)` revierte `NotAgent(business, 4)`.
8. Tercero (`PaymentGuard`): agente → proveedor tier 4 pasa. Agente → persona tier 3 revierte `NotBusiness(to, 3)`. Bot sin KYA revierte primero `NotAgent`.
9. Constructor con `address(0)` o con un EOA revierte `KumplyStoreInvalid`.
10. Fuzz `(uint32 tier, uint32 level ∈ [1,3])`: `isPersonAtLeast == (tier>=level && tier<=3)`, `isBusiness == (tier==4)`, `isAgent == (tier==5)`.

Test fork opcional (`test/ForkFuji.t.sol`, se saltea si no hay `FUJI_RPC_URL`): `vm.createSelectFork(vm.envString("FUJI_RPC_URL"))`, deploy de `PaymentGuard` contra el store real y asserts con la tabla de arriba (`isAgent(0x9f8F…)=true`, `isAgent(0x7Fc6…)=false`, `isBusiness(0x7Fc6…)=true`, `isBusiness(0x…dEaD)=false`, `isPersonAtLeast(0x2260…,3)=true`, `isPersonAtLeast(0x7Fc6…,1)=false`).
Se corre con `forge test --match-contract ForkFuji -vv`.

## 5. Estructura, config y secretos
```
contracts/                 # proyecto Foundry dentro del repo del equipo
  foundry.toml  remappings.txt  .env.example  .gitignore(.env, out/, cache/)
  src/kumply/IKumplyAttestationStore.sol  src/kumply/KumplyGated.sol
  src/PaymentGuard.sol     # (o el contrato del producto)
  test/mocks/MockAttestationStore.sol  test/KumplyGated.t.sol  test/PaymentGuard.t.sol  test/ForkFuji.t.sol
  script/Deploy.s.sol
```
```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.28"   # la misma que usa KUMPLY
evm_version = "cancun"    # la que usa KUMPLY para C-Chain/Fuji; no dejar el default de solc
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
fuji = "${FUJI_RPC_URL}"
```
`remappings.txt`: `forge-std/=lib/forge-std/src/`. No hace falta OpenZeppelin para la base. Si el hijo usa ERC-20, alcanza con una interfaz mínima chequeando el `bool`; si se agrega OZ, ojo con fijar la versión.
Que alguna EVM más nueva que `cancun` ande hoy en Fuji está [SIN VERIFICAR]. No hace falta probarlo.
```bash
# .env.example (NUNCA una private key en archivos)
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
KUMPLY_STORE=0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD
DEPLOYER_ACCOUNT=hackatwin-deployer      # nombre en ~/.foundry/keystores
DEPLOYER_ADDRESS=0x...
```
La clave entra una sola vez, con prompt oculto: `cast wallet import hackatwin-deployer --interactive`. Después todo se firma con `--account hackatwin-deployer`.

## 6. Deploy, verificación y prueba en vivo
```solidity
// script/Deploy.s.sol
contract Deploy is Script {
    address constant FUJI_STORE = 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD;
    function run() external returns (PaymentGuard g) {
        require(block.chainid == 43113, "solo Fuji");
        vm.startBroadcast();
        g = new PaymentGuard(IKumplyAttestationStore(vm.envOr("KUMPLY_STORE", FUJI_STORE)));
        vm.stopBroadcast();
    }
}
```
```bash
cd contracts && source .env
forge script script/Deploy.s.sol:Deploy --rpc-url fuji \
  --account $DEPLOYER_ACCOUNT --sender $DEPLOYER_ADDRESS --broadcast \
  --verify --verifier etherscan \
  --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' \
  --etherscan-api-key verifyContract --delay 15 --retries 10
```
Si la verificación no salió junto con el deploy, se verifica aparte (el constructor recibe el store):
```bash
forge verify-contract <ADDR> src/PaymentGuard.sol:PaymentGuard --chain 43113 \
  --verifier etherscan --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' \
  --etherscan-api-key verifyContract --compiler-version 0.8.28 \
  --constructor-args $(cast abi-encode "constructor(address)" 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD) \
  --skip-is-verified-check --watch
```
- Estado de la fuente. Que el URL de Routescan (`…/v2/network/testnet/evm/43113/etherscan`) y la key `"verifyContract"` funcionen está confirmado: lo usa el `hardhat.config.ts` de KUMPLY y la guía Foundry de Routescan usa el mismo patrón (con Sepolia). La combinación exacta `--verifier etherscan` + Fuji en forge 1.7.1 está [SIN VERIFICAR] hasta correrla. Plan B 1: igual pero con `--verifier custom`. Plan B 2: el docs de Routescan muestra el sufijo `/etherscan/api`, se prueba con ese. Plan B 3: `forge flatten src/PaymentGuard.sol > flat.sol` y subirlo a mano en https://routescan.io/verifycontract (o en la UI de testnet.snowtrace.io) con solc 0.8.28, optimizer 200 y EVM cancun [SIN VERIFICAR el formulario].
- Gas del deployer: hace falta AVAX de Fuji (faucet o mentores). Cómo funciona hoy el faucet está [SIN VERIFICAR].

Prueba en vivo (para los links del README):
```bash
G=<PaymentGuard>; R=$FUJI_RPC_URL
cast call $G "isAgent(address)(bool)"    0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2 --rpc-url $R  # true  (tier 5)
cast call $G "isAgent(address)(bool)"    0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9 --rpc-url $R  # false (tier 4)
cast call $G "isBusiness(address)(bool)" 0x000000000000000000000000000000000000dEaD --rpc-url $R  # false (sin atestación)
# Simulación del pago con msg.sender = agente demo (eth_call permite --from sin clave):
cast call $G "pay(address)" 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9 --value 1 --from 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2 --rpc-url $R  # ok
cast call $G "pay(address)" 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9 --value 1 --from $DEPLOYER_ADDRESS --rpc-url $R  # revert NotAgent(deployer,0)
# Tx BLOQUEADA real, visible en Snowtrace (forzar gas para que no la frene la estimación):
cast send $G "pay(address)" 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9 --value 1 --gas-limit 120000 --account $DEPLOYER_ACCOUNT --rpc-url $R
```
La tx real que PASA necesita que nuestra dirección (o la smart account de 0xGasless) tenga tier 5 emitido por el staff, y que el proveedor sea tier 4 (puede ser `0x7Fc6…`).

## 7. Ejemplo de contrato hijo (~15 líneas)
```solidity
// src/PaymentGuard.sol: un agente KYA le paga en AVAX solo a una empresa KYB, con tope fijo
contract PaymentGuard is KumplyGated {
    uint256 public constant MAX_PER_PAYMENT = 0.1 ether;
    event Paid(address indexed agent, address indexed supplier, uint256 amount);
    error OverCap(uint256 amount, uint256 cap);
    error TransferFailed();

    constructor(IKumplyAttestationStore store) KumplyGated(store) {}

    function pay(address payable supplier) external payable onlyAgent {
        _requireBusiness(supplier);                                   // chequeo de un TERCERO
        if (msg.value > MAX_PER_PAYMENT) revert OverCap(msg.value, MAX_PER_PAYMENT);
        emit Paid(msg.sender, supplier, msg.value);
        (bool ok,) = supplier.call{value: msg.value}("");
        if (!ok) revert TransferFailed();
    }
}
```
Para el Tesorero real: el tope pasa a ser por agente y se configura, se agrega una cola "pendiente de aprobación del dueño" (con re-check al ejecutar) y el pago se hace con un ERC-20 mock de ARGt.

## 8. Pasos para quien lo implemente (objetivo ≤1,5 h)
| # | Paso | Min |
|---|---|---|
| 0 | **Ya:** pedirle al staff tier 5 para la dirección del agente (EOA o smart account) y tier 4 para un proveedor nuestro | 5 |
| 1 | `forge init contracts --use-parent-git` (o `--no-git`), borrar Counter y escribir `foundry.toml`, `remappings.txt`, `.env.example` y `.gitignore` | 10 |
| 2 | Interfaz + `KumplyGated` + `PaymentGuard` (copiar los bocetos) y `forge build` | 15 |
| 3 | Mock + tests 1-10 y `forge test` en verde | 25 |
| 4 | Test fork contra Fuji | 10 |
| 5 | `cast wallet import`, AVAX de Fuji, deploy + verify (y plan B si falla) | 15 |
| 6 | `cast call` pasa/bloquea + tx bloqueada real y pegar los links en el README | 10 |
| | **Total** | **~90** |

Sección de README lista para pegar (completar `<…>`):
```markdown
## KUMPLY: gate de cumplimiento on-chain

Nuestro contrato [`PaymentGuard`](https://testnet.snowtrace.io/address/<ADDR>#code) (Fuji C-Chain, verificado) hereda
`KumplyGated`, que lee en el mismo bloque el `AttestationStore` de KUMPLY en Fuji
([`0xa3Bc…22dD`](https://testnet.snowtrace.io/address/0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD)) con `verify(address)`.
Reglas (iguales al SDK `@kumply/sdk`): persona = tier 1-3 (escalera), **empresa = tier 4 exacto**, **agente = tier 5 exacto**.
No usamos `hasTier()`, porque con esa regla una empresa o un agente pasarían como persona.

- Solo un **agente KYA** (`isAgent`) puede pagar, y solo a un **proveedor KYB** (`isBusiness`).
- Pasa: agente `0x9f8F…79A2` (tier 5) → proveedor `0x7Fc6…DaE9` (tier 4). <link tx o comando cast>
- Bloqueada: `<nuestra dirección sin KYA>` → revierte `NotAgent(addr, 0)`. <link tx fallida en Snowtrace>
- Vencida, revocada o inexistente: `verify()` devuelve `false` y el gate bloquea.

> ⚠️ **Las atestaciones de KUMPLY en Fuji son de DEMO**: las emite el staff para el hackathon, sin verificación
> KYC/KYB/KYA real. En producción se usaría el AttestationStore de mainnet (`0xa116…5F71`), hoy en beta de solo lectura.
```

## Fuentes
- `refs/Kumply/contracts/contracts/{AttestationStore,ComplianceGate}.sol`, `examples/KumplyPaymasterCheck.sol`, `contracts/hardhat.config.ts`, `contracts/scripts/seed-fuji.ts`, `packages/sdk/src/{constants,client,tier}.ts`, `packages/sdk/README.md`.
- Lecturas `cast call` y `getLogs` a Fuji (7/11/2026) del store `0xa3Bc…22dD`.
- Routescan, guía Foundry: https://info.routescan.io/en/articles/11992459-deploying-and-verifying-contracts-foundry · Patrón de API: https://docs.routescan.io/getting-started/migrate-from-etherscan
- Avalanche, verificación (Hardhat/Snowtrace, sin API key): https://build.avax.network/docs/primary-network/verify-contract/hardhat
- Flags confirmados con `forge 1.7.1 --help` local (`--verifier etherscan|custom`, `--verifier-url`, `--account`, `--skip-is-verified-check`, `--watch`).
