# Verificación técnica – Ronda 3

Verificador técnico. Leí el código de `refs/` sin ejecutar nada (07/11/2026). Las rutas son relativas a `ideas/refs/`. Abrevio `X = hackatwin-x402-team1-avalanche`. "Existe" quiere decir que el archivo y la línea están y hacen lo que dice el plan. "A construir" suma riesgo.

## Hallazgos que valen para las 4
1. **SDK KUMPLY confirmado** (`Kumply/packages/sdk/src/client.ts`): `verify` l. 121, `isPersonAtLeast` l. 222, `isBusiness` l. 236, `isAgent` l. 245. Las tres usan `verify()` del contrato, así que respetan el vencimiento. `contractAddress` es obligatorio: si falta, tira error (l. 83-84 del archivo). `hasTier` (l. 203) hace `tier >= n`: con 2 deja pasar al 4 y al 5. No usarlo.
2. **Store de Fuji** `0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD` (`constants.ts` l. 71). `AttestationStore.verify` (l. 224) es gratis y devuelve `(false,0,0,0)` si venció. `attestations` es el mapping público y no mira el vencimiento. `issueAttestation` (l. 197) pide `VERIFIER_ROLE` y **pisa** la atestación anterior: una dirección tiene un solo nivel.
3. **Plan B del store:** el constructor `(admin, eercToken)` (l. 139) acepta `address(0)` (así lo hace `contracts/scripts/deploy.ts` l. 12). Ojo: `issue-attestation.ts` e `issue-attestation-batch.ts` tienen la dirección del store **fija** en un mapa `STORE` (l. 17-20 y l. 27-29). Para el store propio hay que cambiar esa dirección. Nosotros no tenemos `VERIFIER_ROLE` en el oficial: el KYB/KYA en el oficial depende de que KUMPLY lo emita.
4. **Nivel 5 sin flujo automático:** LITEPAPER l. 159 dice que el nivel Sumsub `agent-kya` "no está configurado todavía". El nivel 4 depende de una cotización Enterprise pendiente (LITEPAPER l. 225). Los dos salen solo a mano por KUMPLY o por store propio.
5. **ARGt:** no hay en Fuji. `X/packages/contracts/test/utils/MockERC20.sol` existe: es un ERC-20 con `mint` abierto y **sin `permit`**. USDC de Fuji `0x5425…Bc65` está en `X/packages/chains/registry/fuji.json` l. 11.
6. **OpenZeppelin:** el catálogo pide `@openzeppelin/contracts` 5.7.0 (`X/pnpm-workspace.yaml` l. 18), más 4.8.3 y 5.3.0. **No hay `node_modules` en refs**, así que no pude abrir `ERC20Permit.sol` en disco: [SIN VERIFICAR] en disco. Que OZ 5.x traiga `ERC20Permit` es conocimiento general.
7. **Guías del repo x402 confirmadas:** `PaymentHub.sol` (`pay` l. 109, saldo antes/después l. 126-128, `refund` l. 158 con el plazo en l. 162, `settle` l. 171 con el plazo en l. 177, `withdraw` l. 193, `_transition` l. 211, `_spendBudget` l. 225). `PaymentStateLib.sol` (`HUB_EDGES` l. 11-12, `canTransition` l. 21). `RevenueSplitter.sol` (`release` l. 38, `_split` l. 56: **2 vías fijas** vendedor/plataforma con `PLATFORM_BPS`). `script/DeployFuji.s.sol` existe, pero despliega hub, broker y messenger con CCIP/ICTT: sirve de modelo, no se reusa. `DeployRevenueSplitter.s.sol` existe. `packages/ui/src/atoms/TxLink.tsx` (hace link solo si le pasás `url`) y `Badge.tsx` existen.
8. **Ninguna de las 4 reutiliza código desplegable:** todo contrato propio es "a construir". Lo único ya desplegado en Fuji que se usa sin escribir son el store de KUMPLY, el USDC de Fuji y (en mandato) el registro ERC-8004.

## r2-sena-segura
| pieza | existe (ruta) | a construir |
|---|---|---|
| Token | Guía `X/.../test/utils/MockERC20.sol`; alternativa USDC `fuji.json` l. 11 | `ARGtDemo` (30 min) |
| Escrow con estados | Guías `PaymentHub.sol` l. 193/211/126-128 y `PaymentStateLib.sol` l. 11-21 | `SenaEscrow` entero: 3 salidas, reclamo, árbitro, devolución sin árbitro, antiautopago, plazos en el constructor |
| Comisión adentro | `RevenueSplitter.sol` `_split` l. 56 (2 líneas) | Copiarla adentro |
| Chequeo de credencial | `AttestationStore.verify` l. 224; `ComplianceGate.sol` l. 97 confirma el defecto (`tier < required` deja pasar 4 y 5) | `tier ∈ {2,3}` y `tier == 4` a mano |
| Segundo store opcional | — | Si `storeDemo == address(0)`, **no llamarlo**: un call a una dirección sin código revierte al decodificar. Guardarlo con un `if` |
| Insignias en el front | `client.ts` l. 222/236, `tier.ts` (`meetsTierRequirement` l. 27), ABI `contracts.ts` | Front entero (listado rojo/ámbar/verde, ficha, barra) |
| Plan B del store | `AttestationStore.sol`, `scripts/deploy.ts`, `issue-attestation-batch.ts` | Cambiar la dirección fija del script (hallazgo 3) |
| Siembra "9 de 9" | — | Script de siembra con 9 billeteras |

**Riesgo técnico: BAJO.** Sigue siendo el contrato más chico y cerrado. Lo único que depende de afuera es el KYC 2 real (y el árbitro KYB, que se cubre con el store propio). El detalle a cuidar es el `if` de `storeDemo`.

## r2-cuota-blindada
| pieza | existe (ruta) | a construir |
|---|---|---|
| Token con `permit` | `MockERC20.sol` existe, **sin `permit`** | `ARGtDemo is ERC20, ERC20Permit` sobre OZ. Que OZ esté en disco: [SIN VERIFICAR] (hallazgo 6) |
| Estados del hito | `PaymentStateLib.sol` `canTransition` l. 21 | Tabla propia Pendiente → Confirmado / Vencido |
| Crédito y retiro | `PaymentHub.sol` `withdraw` l. 193, `_transition` l. 211; `refund` l. 158 (un solo pagador) | Devolución **proporcional** a muchas familias en `liberarVencido` (lo más delicado: redondeo y gas si hay muchas familias; hacerlo por pull, no por loop) |
| Tope por período | `_spendBudget` l. 225 (presupuesto total, no por período) | `debitar` con una cuota por período |
| Reparto final | `RevenueSplitter.sol` `_split` l. 56 | Copiado en `cerrarViaje` |
| KYB agencia / KYC delegada | `AttestationStore.verify` l. 224; `issue-attestation.ts`, `issue-tier4-deployer.ts` existen | Lectura de **dos stores** en el constructor |
| Insignias en el front | `client.ts` `isPersonAtLeast` l. 222, `isBusiness` l. 236; `constants.ts` l. 71 | Tablero público y 4 paneles de rol |
| UI | `Badge.tsx`, `TxLink.tsx` | Barra sólido/rayado/ámbar |
| Despliegue | `DeployFuji.s.sol` (solo modelo); `fuji.json` (RPC l. 7) | Script de deploy y semilla con 8 billeteras |

Nota: `issue-tier4-deployer.ts` re-emite solo si el nivel actual es `< 4` (l. 39). Si una billetera tiene 5, la deja como está. Usar billeteras limpias.

**Riesgo técnico: MEDIO.** El contrato tiene más piezas nuevas que la seña (muchos pagadores, devolución proporcional, tope por período, `permit`, dos stores) y el front tiene 5 vistas. El KYB de la agencia es plan B casi seguro (hallazgo 4).

## r2-pallet-compartido
| pieza | existe (ruta) | a construir |
|---|---|---|
| Token | `MockERC20.sol` | `tARGt` con botón de carga |
| Estados y pull-payments | `PaymentHub.sol` l. 109/158/171/193/211; `PaymentStateLib.sol` | Umbral grupal, pago del 50 % en la misma tx que llega al mínimo, 50/50 por almacén, reclamo, árbitro, `liberarPorPlazo`, `devolver` |
| Reparto en 3 | `RevenueSplitter.sol` `_split` l. 56 es de **2 vías** | Reparto mayorista/repartidor/plataforma propio |
| Legajo | — | Vista `legajo(addr)`. Para que "solo cuenta un mayorista con KYB vigente en el recibí" funcione, hay que **guardar el resultado de `verify` en el momento del recibí**: `verify` solo dice el estado de hoy |
| Dos stores con sello | `verify` l. 224; constructor con `address(0)` l. 139; `deploy.ts` l. 12 | Lectura en cascada (oficial, después propio) y evento o vista que diga cuál respondió |
| Emisión plan B | `issue-attestation-batch.ts` (dirección fija, hallazgo 3) | Script de emisión a ~13 billeteras, una con vencimiento corto |
| Front | `client.ts` l. 222/236, `constants.ts` l. 70-71, ABI `contracts.ts`; `TxLink.tsx`, `Badge.tsx` | Barra, panel del almacén, panel del mayorista por eventos, `/legajo/:addr` con QR, vista del árbitro |
| Siembra | — | 52/60 y 14 pallets de Sonia (~15 billeteras con AVAX) |

**Riesgo técnico: MEDIO (el más alto de los medios).** Es el contrato más grande de los 4 (umbral + 50/50 + reclamo + árbitro + legajo) y la siembra es la más pesada. Todo es Solidity común, pero son muchos caminos para testear en 6 h. El dato estrella del legajo (mayoristas KYB) depende del plan B.

## r2-mandato-sin-chamuyo
| pieza | existe (ruta) | a construir |
|---|---|---|
| Token | `MockERC20.sol` | `ARGtDemo` |
| Contrato del mandato | Guías `AttestationStore.verify` l. 224; `examples/KumplyPaymasterCheck.sol` (nivel exacto `tier != requiredTier`, l. 48-49); `PaymentHub.sol` l. 126-128 | `Mandato` entero: lista, topes, cola amarilla con veto por tiempo, evento `Bloqueado` sin revertir, apagado. Ojo: `KumplyPaymasterCheck` lee `attestations()` (l. 48) y resuelve el vencimiento aparte; copiar el nivel exacto, **no** la llamada |
| Registro ERC-8004 | Fuji `0x8004A818BFB912233c491871b3d84c89A494BD9e` en `fuji.json` l. 29 (el chequeo pide `getVersion() == "2.0.0"`). ABI en `X/packages/agent-kit/src/identity/abi.ts`: `register` l. 5, `ownerOf` l. 12, `isAuthorizedOrOwner` l. 19. Wrapper `identity/erc8004-identity.ts` (`register` l. 23, usa `isAuthorizedOrOwner` en l. 61) | Registrar desde la billetera de Diego. `approve` no está en el ABI del repo |
| Agente con guion | `packages/agent-kit/src/llm/scripted-plan-llm.ts` (`ScriptedPlanLLM` l. 35); `policy/budget-policy.ts` (l. 25); `demos/01-x402-twin/buyer-agent/tools.ts` (l. 33) | Adaptar a Fuji: la demo 1 usa `Tokens.Fork` (`demos/01-x402-twin/tokens.ts` l. 20). Herramientas `leer_pagina` y `pagar` |
| Servidor 402 de la farmacia | `demos/01-x402-twin/adapters/seller-app.ts` usa el middleware x402 estándar (`paymentMiddleware`, l. 63), no lee hashes de tx | 402 propio + `POST /confirmar` que lee el evento por RPC |
| Registro como dueño | `adapters/registration.ts` l. 65: cada rol se registra a sí mismo | Flujo nuevo |
| Niveles 4 y 5 | `issue-attestation-batch.ts` (por defecto tier 5, "live-workshop path") | Dependen de KUMPLY a mano o del store propio (hallazgo 4) |
| Front | `client.ts` `isAgent` l. 245, `isBusiness` l. 236, `isPersonAtLeast` l. 222; `TxLink.tsx` | Panel de Diego, consola del agente, pantalla mostrador |

Simplificación posible: si `altaAgente(wallet, agentId)` lo llama solo `ownerOf(agentId)` (Diego), el contrato ya ata billetera ↔ agentId ↔ dueño y **no hace falta `isAuthorizedOrOwner`**. La pregunta 3 deja de bloquear.

**Riesgo técnico: MEDIO (el más cercano a ALTO).** Tiene más piezas móviles que las otras: contrato nuevo, agente adaptado del fork a Fuji, servidor 402 propio, registro ERC-8004 en vivo y 3 pantallas. El nivel 5 no tiene flujo automático (LITEPAPER l. 159). El guion fijo y el mínimo "intentos 0-3 por script" lo sostienen.

## Resumen
| idea | riesgo | por qué |
|---|---|---|
| r2-sena-segura | BAJO | Contrato chico y cerrado; solo depende del KYC 2 real (plan B con store propio) |
| r2-cuota-blindada | MEDIO | Devolución proporcional, tope por período, `permit` y 5 vistas; KYB casi seguro plan B |
| r2-pallet-compartido | MEDIO | El contrato con más estados, reparto en 3 a construir, legajo que tiene que congelar el KYB del momento, siembra pesada |
| r2-mandato-sin-chamuyo | MEDIO (al borde de ALTO) | Contrato + agente pasado a Fuji + 402 propio + ERC-8004 en vivo; nivel 5 sin flujo automático |

[SIN VERIFICAR]
- Que `ERC20Permit` esté disponible en el OZ que se instale (no hay `node_modules` en refs).
- Que el registro ERC-8004 de Fuji implemente `isAuthorizedOrOwner` y `approve` (el ABI del repo trae el primero, no el segundo).
- Que `@kumply/sdk` 1.3.0 esté publicado en npm (el `package.json` del SDK dice ese nombre y versión).
