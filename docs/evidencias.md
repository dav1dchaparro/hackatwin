# Evidencias on-chain (Fuji C-Chain, 43113)

Cada hash o link que el equipo publica en el PR #2 se copia acá en el momento.
Explorer: `https://testnet.snowtrace.io/tx/<hash>` · contratos: `https://testnet.snowtrace.io/address/<dir>#code`.

## Contratos verificados (P1, 15:03)

Verificación confirmada también con la API de Routescan (`getsourcecode`, solc 0.8.28).

| Contrato | Dirección | Código | Tx de deploy |
|---|---|---|---|
| `MockPesos` (mPESO) | `0x866FD7C4B1c5d356c11840550483Ef3e415FA66E` | [#code](https://testnet.snowtrace.io/address/0x866FD7C4B1c5d356c11840550483Ef3e415FA66E#code) | [0x9228a3…](https://testnet.snowtrace.io/tx/0x9228a39fbfd175f84675c0631c42f141a34deceb4d5e03414c560fa117074c3b) |
| `Llave` A (store oficial KUMPLY) | `0xd466FD4712A70E6b2c4d1Ec299210E905d2eF8BA` | [#code](https://testnet.snowtrace.io/address/0xd466FD4712A70E6b2c4d1Ec299210E905d2eF8BA#code) | [0xc19b2c…](https://testnet.snowtrace.io/tx/0xc19b2c8495ecafac8f5af6b88b8be8508d2bc5a44a848fe0921923089d9c0205) |
| `DemoAttestationStore` | `0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513` | [#code](https://testnet.snowtrace.io/address/0xc1694bF1Ee5A000Fd39BA0196bf953215cb6D513#code) | [0x7bdd1c…](https://testnet.snowtrace.io/tx/0x7bdd1c863f404bf390976e16e13e9edd6d46b51e50fb595a550c7c78f6f5a58c) |
| `Llave` B (store demo) | `0xc74d36226ACABb11482455175919fbFF3936de37` | [#code](https://testnet.snowtrace.io/address/0xc74d36226ACABb11482455175919fbFF3936de37#code) | [0x1017c1…](https://testnet.snowtrace.io/tx/0x1017c19cb5c7e2b90a2a46f106a9a68800938af8c9f42fa300e8f475f60934a4) |

Lecturas de control (15:05): cada Llave tiene 1.000.000 mPESO · `verify(agente)` = tier 5 en el store demo, sin atestación en el oficial.

## Transacciones de la demo

| # | Acción | Quién | Resultado esperado | Hash / link | Patrocinada | Prueba de |
|---|---|---|---|---|---|---|
| 1 | Login + `depositar` / `configurar` | Marta (SA) | `Depositado` / `Configurada` | `TODO` | sí | 0xGasless |
| 2 | `estoyBien()` | Marta (SA) | `SenalDeVida` | `TODO` | sí | 0xGasless |
| 3 | `iniciarReclamo()` | Agente KYA | `VerificadoKumply` + `ReclamoIniciado` | `TODO` | `TODO` (lane KUMPLY o EOA) | KUMPLY (pasa) |
| 4 | Movimiento de Marta en la gracia | Marta (SA) | `ReclamoCancelado` | `TODO` | sí | — |
| 5 | `liberar()` | Bot sin KYA | **revierte** `NotAgent(bot, 0)` | `TODO` | no | KUMPLY (bloqueada) |
| 6 | `liberar()` | Agente KYA | `ComisionCobrada` + `HerenciaEnviada` ×2 + `Liberada` | `TODO` | `TODO` | KUMPLY (pasa) · negocio (1%) |

## Saldos de AVAX

| Cuenta | AVAX | Captura |
|---|---|---|
| SA de Marta | `TODO` (esperado: 0) | `TODO` |
| Agente | 0,05 (15:05) | — |
