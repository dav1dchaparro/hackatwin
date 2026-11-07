# Cuentas de prueba (Fuji C-Chain, 43113)

Solo direcciones **públicas**. Nunca claves privadas, seeds ni API keys.
Fuente de verdad: `deployments/fuji.json` (P1). Las cuentas de la web son **smart accounts** de 0xGasless (la dirección que muestra la web después del login con email).

| Alias | Rol | Dirección | Tipo | KUMPLY esperado | Estado |
|---|---|---|---|---|---|
| Agente | Ejecuta `iniciarReclamo` y `liberar` | `0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb` | EOA (0,05 AVAX) | **tier 5 (KYA)** | Store demo: tier 5 ✅ · Store oficial: **sin atestación** (pedido a KUMPLY) |
| Marta | Dueña | `0x92893C663E74d6b1c6e551C17E7a35acaa9E8325` (provisorio: es el deployer) | pasa a su SA con `transferirDueno` | — | `TODO` SA de P2 |
| Lucía | Heredera 60% | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (placeholder de anvil) | se cambia con `configurar` | — (los herederos no necesitan KYC) | `TODO` SA real |
| Tomás | Heredero 40% | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (placeholder de anvil) | se cambia con `configurar` | — | `TODO` SA real |
| Bot sin KYA | La dirección **bloqueada** (`NotAgent`) | `TODO` (P1) | EOA | ninguna, a propósito | — |
| Tesorería | Recibe el 1% | `0x92893C663E74d6b1c6e551C17E7a35acaa9E8325` | EOA (deployer) | — | — |
| Deployer | Despliega y verifica | `0x92893C663E74d6b1c6e551C17E7a35acaa9E8325` | EOA (~0,45 AVAX) | — | — |

Fixtures de KUMPLY en el store oficial (nadie tiene sus claves; sirven para lecturas y simulaciones): agente tier 5 `0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2` · empresa tier 4 `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9` · sin atestación `0x000000000000000000000000000000000000dEaD`.

## Control de la atestación del agente

```bash
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
cast call 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD "verify(address)(bool,uint32,uint64,uint64)" \
  0x8739E80672B3b778e48D8e8544BDAb7Ed6A1CfCb --rpc-url $FUJI_RPC_URL
```

| Hora | Store oficial | Store demo |
|---|---|---|
| 15:05 | `false, 0` (sin atestación) | `true, 5` |

## Pedido a KUMPLY

No hay stand de KUMPLY en el evento. Según su documentación, el tier 5 lo emite solo su equipo y no hay autoservicio (`agent-kya` no está configurado en Sumsub). Ver [`respuestas-sponsors.md`](respuestas-sponsors.md).

| Hora | Canal | Qué se pidió | Respuesta |
|---|---|---|---|
| `TODO` | hello@kumply.xyz | tier 5 para el agente `0x8739…CfCb` en Fuji | `TODO` |
