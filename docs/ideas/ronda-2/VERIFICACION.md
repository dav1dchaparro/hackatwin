# Verificación técnica – Ronda 2

Verificador técnico. Leí el código de `refs/` sin ejecutar nada (07/11/2026). Las rutas son relativas a `ideas/refs/`. "Existe" quiere decir que el archivo y la línea citada están y hacen lo que la idea dice. "A construir" suma riesgo.

## Hallazgos que valen para todas las ideas

1. **Las rutas y líneas citadas existen.** Lo comprobé: `PaymentHub.sol` (l. 83, 109, 123, 158/162, 171/177, 193, 211, 126-128), `PaymentStateLib.sol` (l. 11-21), `RevenueSplitter.sol` (l. 38, 56), `AttestationStore.sol` `verify` (l. 224), `ComplianceGate.sol` (l. 97, `tier < requiredTier`), `KumplyPaymasterCheck.sol` (l. 49, `tier != requiredTier`), `WorkshopKYA.sol` (l. 54, `verify` devuelve solo `uint32`), y en el SDK `client.ts` `isPersonAtLeast` (l. 222), `isBusiness` (l. 236) e `isAgent` (l. 245), `constants.ts` (l. 70-71) y `tier.ts` `meetsTierRequirement` (l. 27). En `LITEPAPER.md` también: l. 146, l. 159 (`agent-kya` sin configurar en Sumsub) y l. 225 (KYB Tier-4 todavía sin cotización). Ninguna idea inventó rutas.
2. **"Se usa tal cual" choca con CONTEXTO.md**, que dice: "repos de referencia SOLO GUÍA; no se entrega código de ellos". Entonces `RevenueSplitter`, `PaymentHub` y los átomos de UI se **reescriben** tomándolos de guía. Son cortos (`RevenueSplitter` tiene 60 líneas), así que el costo es bajo, pero ninguna idea puede decir "reutilizado sin cambios". Lo que sí se puede usar como dependencia externa: el `AttestationStore` que KUMPLY ya tiene desplegado en Fuji (`0xa3Bc…22dD`, `constants.ts` l. 71) y el SDK. Que `@kumply/sdk` esté publicado en npm: [SIN VERIFICAR].
3. **No hay KYB (4) ni KYA (5) reales en Fuji.** La l. 225 del LITEPAPER dice que el KYB espera la cotización de Sumsub, y la l. 159 que el nivel `agent-kya` no está configurado. Las 6 ideas usan KYB, KYA o los dos, así que **todas dependen de un plan B**. Opciones, de mejor a peor:
   - A. Que KUMPLY emita a mano nivel 4/5 a nuestras billeteras en su store de Fuji. El script `Kumply/contracts/scripts/issue-attestation.ts` existe y ya apunta a Fuji, pero necesita `VERIFIER_ROLE`, que lo tiene KUMPLY. **Hay que preguntárselo a los mentores de KUMPLY a las 9:00.**
   - B. Desplegar una copia propia de `AttestationStore.sol` en Fuji con el equipo como verificador. Mantiene el mismo `verify()` (4 valores) y el SDK funciona pasándole nuestro `contractAddress`, sin adaptador. Que el jurado lo acepte: [SIN VERIFICAR].
   - C. `WorkshopKYA.sol`, la opción que proponen las ideas. Cualquiera emite cualquier nivel y no tiene vencimiento. Además `verify` devuelve solo `uint32`: **el SDK no le sirve** (espera el ABI de `AttestationStore`), así que contrato y front necesitan un adaptador.
4. **KYC de personas (1-3):** CONTEXTO dice que se emite en Fuji con Sumsub. Igual, para el nivel 2 alguien del equipo tiene que pasar documento y prueba de vida. Que en Fuji sea sandbox y acepte datos de prueba: [SIN VERIFICAR].
5. **ARGt no está en Fuji.** Todas usan "ARGt": en la demo es un token propio (guía: `hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol`, con mint abierto) o el USDC de Fuji (`packages/chains/registry/fuji.json`, `0x5425…Bc65`).
6. **En Fuji no se puede adelantar el reloj.** Los wows que dicen "adelantamos el vencimiento/reloj" (cheque, cuota, seña, mandato) necesitan plazos que se puedan configurar (minutos) desde el despliegue.
7. **No conviene usar `attestations()` (el patrón de `KumplyPaymasterCheck`) fuera de un paymaster:** no mira el vencimiento, porque ese chequeo lo hace el EntryPoint. En un contrato normal hay que usar `verify()` (l. 231 chequea `expiry`) y comparar el nivel exacto.
8. **Una dirección tiene una sola atestación.** La misma billetera no puede ser KYC y KYB a la vez, así que cada rol necesita su propia billetera.

---

## r2-cuota-blindada

| pieza | existe (ruta) | a construir |
|---|---|---|
| Autorización firmada una vez | `…/packages/contracts/src/PaymentHub.sol` `setAuthorizationWithSig` l. 83, `_spendBudget` l. 225 | Además de la firma, cada familia tiene que hacer un `approve` ERC-20 on-chain, porque `pay` usa `safeTransferFrom` (l. 127). No es "una sola firma": son una firma y una tx con AVAX de gas |
| Débito de cada cuota | `pay(_id,_onBehalf,…)` l. 109/123 | Alguien tiene que llamar a `pay` todos los meses (backend o la agencia). El presupuesto es un total, no un tope por mes: el autorizado podría tirar todo de una. Hay que construir el tope por período |
| Estados y retiro del proveedor | `_transition` l. 211, `PaymentStateLib.canTransition` l. 21, `withdraw` l. 193 | Contrato propio: varios pagadores, plan de hitos, `confirmarReserva`, devolución proporcional (`refund` l. 158 devuelve a un solo pagador) y bloquear transferencias a quien no sea proveedor del viaje |
| Margen al final | `RevenueSplitter.sol` `release` l. 38 | Reescribirlo |
| KYB exacto en el contrato | `Kumply/contracts/contracts/AttestationStore.sol` `verify` l. 224 | Usar `verify` + `tier == 4`, no `attestations()` (hallazgo 7) |
| Front | `Kumply/packages/sdk/src/client.ts` `isBusiness` l. 236, `isPersonAtLeast` l. 222 | Tablero público de solo lectura (RPC pública, sin billetera) |
| KYB real (agencia, hotel, micro) | No existe en Fuji (LITEPAPER l. 225) | Plan B (hallazgo 3) |

**Riesgo técnico: MEDIO.** Los patrones existen, pero el contrato de hitos con varios pagadores y devolución proporcional es nuevo. La promesa de "una sola firma / se debita sola" no sale de `PaymentHub` sin un `approve` y un ejecutor mensual, y todo el KYB es plan B.

## r2-sena-segura

| pieza | existe (ruta) | a construir |
|---|---|---|
| Patrón de escrow y estados | `PaymentHub.sol` `_transition` l. 211, `PaymentStateLib.sol` l. 11-21, `withdraw` l. 193, chequeo de saldo l. 126-128 | `SenaEscrow` (~150 líneas) con los estados `EnDisputa`/`Liberada`. La idea admite bien que `settle` (l. 177) y `refund` (l. 162) tienen el plazo al revés de lo que necesita |
| Comisión | `RevenueSplitter.sol` `_split` l. 56 | Reescribirla (2 líneas) |
| Token y comprobante | `test/utils/MockERC20.sol`, `packages/ui/src/atoms/TxLink.tsx` | Nada (guía) |
| Gate {2,3,4} sin agentes | `AttestationStore.sol` `verify` l. 224; `tier.ts` `meetsTierRequirement` l. 27; `client.ts` l. 222/236 | Chequeo explícito en el contrato |
| Contador de huéspedes distintos y antiautopago | — | Mapping dueño→huésped, que excluya `huésped == dueño` |
| Árbitro KYB con plazo de 72 h | — | Función `decidir`. El árbitro KYB real no existe (plan B) |
| Datos del wow (9 estadías) | — | Sembrar 9 billeteras de huésped con KYC: con KYC real son 9 personas, así que es plan B |

**Riesgo técnico: BAJO.** Es el contrato más chico y autocontenido. El único riesgo serio es tener una billetera con KYC 2 real (y el árbitro KYB en plan B), y los plazos de 48/72 h tienen que poder configurarse.

## r2-cheque-que-se-llena

| pieza | existe (ruta) | a construir |
|---|---|---|
| Factura cedida | `RevenueSplitter.sol` (constructor l. 29, `release` l. 38), `script/DeployRevenueSplitter.s.sol` | Reescribirlo. `script/params/fuji-revenue-splitter.json` hoy tiene **solo** `platformBps: 500`: faltan `deployer`, `seller` y `platform` (el script los lee). `release` lo puede llamar cualquiera y manda el saldo con `safeTransfer` sin avisarle al cheque, así que el cheque no sabe qué factura se pagó. Más simple: que el cliente pague a `Cheque.pagarFactura(id)` y sacar el splitter |
| Estados del cheque | `PaymentHub.sol` + `PaymentStateLib.sol` (guía) | Contrato `Cheque`: emitir, depositar trabado, `aceptarFactura` por el cliente KYB, endosar solo a `tier == 4`, cobrar al vencer, estado de atraso |
| KYB exacto en el endoso | `AttestationStore.sol` `verify` l. 224; `client.ts` `isBusiness` l. 236 | Comprobado que `ComplianceGate` l. 97 deja pasar a nivel 5 |
| Barra sólida/rayada con "en riesgo" | `packages/ui/src/atoms/Badge.tsx`, `TxLink.tsx` | Front completo y cálculo de lo que va atrasado contra el cronograma |
| 4 billeteras KYB (Claudio, autoservicio, frigorífico, transportista) | No hay KYB en Fuji | Plan B para las 4. Todo el valor KUMPLY de la demo queda simulado |
| "Adelantamos el vencimiento" | — | Vencimiento en minutos (hallazgo 6) |

**Riesgo técnico: MEDIO.** El contrato es nuevo y tiene más funciones que la seña. La conciliación factura→cheque no sale del splitter. Y los 4 actores son KYB, que hoy no existe en Fuji: si no hay plan B A o B, el chequeo central es de juguete.

## r2-pallet-compartido

| pieza | existe (ruta) | a construir |
|---|---|---|
| Comprometer → cerrar → devolver | `PaymentHub.sol` `pay` l. 109, `settle` l. 171, `refund` l. 158, `withdraw` l. 193 (guía) | `PaymentHub` no tiene umbral grupal, y `settle` y `refund` los puede llamar cualquiera, sin control de rol. Hay que hacer el contrato `Oferta`: mínimo, cierre ≤ 48 h, 50 % al cerrar, 50 % por almacén con "recibí", reclamo que congela y devolución total si no se llega |
| Reparto mayorista/repartidor | `RevenueSplitter.sol`, `script/DeployRevenueSplitter.s.sol` | Reescribirlo. El JSON de parámetros está incompleto (como en el cheque). Comisión de plataforma dentro de `Oferta` |
| Gate KYB / KYC 2+ | `AttestationStore.sol` `verify` l. 224; `client.ts` l. 222/236; `constants.ts` l. 70-71 | Chequeo exacto en el contrato |
| Legajo (compras, sin reclamo, mayoristas KYB distintos) | — | Contadores y mapping almacén→mayorista. Página del QR |
| Resolución del reclamo | — | La idea no dice quién destraba la mitad congelada: sin árbitro ni plazo queda trabada para siempre. Hay que definirlo |
| Mayoristas KYB | No hay KYB en Fuji | Plan B. "3 mayoristas verificados" en la demo serían emitidos por nosotros |
| Sello y comprobante | `packages/ui/src/atoms/Badge.tsx`, `TxLink.tsx` | — |

**Riesgo técnico: MEDIO.** Es todo Solidity simple, pero con muchos estados (umbral, 50/50 por almacén, reclamo, legajo). El reclamo no tiene salida definida, y el dato estrella del legajo ("mayoristas KYB distintos") depende de un KYB que hoy no existe.

## r2-mandato-sin-chamuyo

| pieza | existe (ruta) | a construir |
|---|---|---|
| Firma EIP-712 con EOA o ERC-1271 | `PaymentHub.sol` `setAuthorizationWithSig` l. 83 (`SignatureChecker` l. 97), `test/unit/PaymentHubAuthorization.t.sol`, `test/utils/Erc1271Wallet.sol` | Solo como guía: en el Mandato la plata está en el contrato y no usa el presupuesto de `PaymentHub` |
| Nivel exacto | `KumplyPaymasterCheck.sol` l. 48-49 | **Ojo:** `attestations()` no chequea el vencimiento, y la idea pide KYB "vigente". Hay que usar `AttestationStore.verify` l. 224 |
| Dueño ERC-8004 | `packages/agent-kit/src/identity/erc8004-identity.ts` `ownerOf` l. 48; registro en `packages/chains/registry/fuji.json` (`erc8004Identity 0x8004A818…`, se espera `getVersion` 2.0.0) | `ownerOf` recibe un **agentId**, no la dirección del agente. El Mandato tiene que guardar agentId + billetera del agente, y en la demo 1 el agente se registra a sí mismo (`adapters/registration.ts` l. 65), así que dueño = agente. Hace falta registrar con Diego como dueño. Que el registro esté desplegado en Fuji: [SIN VERIFICAR] |
| Contrato Mandato con semáforo | — | `pagar`, lista de Diego, tope, cola amarilla con veto (plazo configurable), apagado del agente. ~150 líneas |
| Agente | `demos/01-x402-twin/buyer-agent/tools.ts`, `packages/agent-kit/src/policy/budget-policy.ts`, `packages/agent-kit/src/llm/scripted-plan-llm.ts` | Adaptarlo: la demo 1 corre sobre el fork (`module.ts` usa `Tokens.Fork`). El LLM con guion baja el riesgo del wow |
| 402 cerrado con el tx | — | No es x402 estándar: `seller-app.ts` (`paymentMiddleware`) no acepta un hash de tx. Hay que hacer un endpoint propio que verifique el evento |
| Página trampa y alerta de veto | — | Front |
| KYA (agente) y KYB (farmacia) reales | No existen (LITEPAPER l. 159 y l. 225) | Plan B para 2 de los 3 niveles. El de Diego (KYC 2) puede ser real |

**Riesgo técnico: MEDIO.** El núcleo del wow (rojo/rojo/verde) es un contrato y un agente con guion, y se construye. Suman riesgo el vínculo agentId↔billetera↔dueño, el 402 propio y que KYA y KYB son plan B.

## r2-comanda-con-dueno

| pieza | existe (ruta) | a construir |
|---|---|---|
| Vendedor x402 | `demos/01-x402-twin/adapters/seller-app.ts` (`paymentMiddleware` l. 63, `ExactEvmScheme` l. 44), `seller-api/main.ts` | **`NETWORK = 'eip155:43114'` está fijo** (`adapters/x402-facilitator.ts` l. 8): es C-Chain mainnet (fork). Fuji es 43113 |
| Facilitador | `adapters/x402-facilitator.ts`, `facilitator/main.ts` | Firmante sobre el cliente del fork (`fork.wallet`), hay que recablearlo a Fuji con AVAX de gas. Un buen lugar para el chequeo KYA es envolver `verify` (l. 25) antes de `settle`. Dónde está el `from` en el payload EIP-3009: [SIN VERIFICAR] (no hay `node_modules`) |
| Precio en pesos | `adapters/argt-money-parser.ts` | Es ARGt vía **Permit2** con oráculo Curve/Chainlink (l. 23-31): en Fuji no sirve. Hay que reemplazarlo por USDC/eip3009 o un token propio |
| Perfil Fuji | `packages/config/src/profiles.ts` `fuji-cchain` l. 70 (USDC, eip3009, pide `ARBITRUM_RPC_URL`/`BASE_RPC_URL`) | **Solo está definido y probado en `packages/config/test/`. El código de la demo 1 no lo usa.** No existe un x402 andando en Fuji |
| Agente con tope | `buyer-agent/main.ts`, `tools.ts`, `prompt.ts`, `packages/agent-kit/src/policy/budget-policy.ts`, `llm/scripted-plan-llm.ts` | Adaptarlo a Fuji |
| Dueño del agente | `packages/agent-kit/src/identity/erc8004-identity.ts` `ownerOf(agentId)` l. 48, `isAuthorizedOrOwner` en `identity/abi.ts` | Pasar de `from` a agentId: el pedido trae el agentId y se chequea con `isAuthorizedOrOwner(from, agentId)`. El agente tiene que registrarse con Sofía como dueña (hoy se registra a sí mismo) |
| Chequeo KUMPLY | `Kumply/packages/sdk/src/client.ts` `isAgent` l. 245, `isPersonAtLeast` l. 222 | `KumplyClient` exige `contractAddress` (`client.ts` l. 83). Con WorkshopKYA el SDK no anda (hallazgo 3) |
| Reparto en 3 | `RevenueSplitter.sol` (2 vías) | Splitter de 3 vías (Rubén, cadete, plataforma) que reciba `transferWithAuthorization` como `payTo`, más alguien que llame a `release` |
| Pantalla o ticketera de cocina | `packages/ui/src/atoms/TxLink.tsx` | Front e impresora (hardware: [SIN VERIFICAR]) |
| KYA real | No existe (LITEPAPER l. 159) | Plan B |

**Riesgo técnico: ALTO.** El wow depende de un x402 que hoy solo corre sobre el fork de mainnet. Pasarlo a Fuji implica cambiar la red fija, el money parser (Permit2/oráculo) y los clientes del fork, y meter un chequeo nuevo entre `verify` y `settle`. Encima, KYA es plan B y el vínculo agente→dueño hay que armarlo.

---

## Resumen

| idea | riesgo | por qué, en una línea |
|---|---|---|
| r2-sena-segura | BAJO | Un escrow chico y autocontenido. Solo falta KYC 2 real (o plan B) y que los plazos se puedan configurar |
| r2-cuota-blindada | MEDIO | Contrato de hitos con varios pagadores, nuevo. "Una firma" necesita además un `approve` y un ejecutor mensual. KYB en plan B |
| r2-cheque-que-se-llena | MEDIO | Contrato con muchas funciones. El splitter no le avisa al cheque. Los 4 actores son KYB inexistente en Fuji |
| r2-pallet-compartido | MEDIO | Muchos estados (umbral, 50/50, reclamo sin salida, legajo). Los mayoristas KYB son plan B |
| r2-mandato-sin-chamuyo | MEDIO | El contrato y el agente con guion se construyen. Falta el vínculo agentId/dueño y el 402 propio. KYA y KYB en plan B |
| r2-comanda-con-dueno | ALTO | x402 hoy solo corre en el fork de mainnet (`eip155:43114` fijo y Permit2/oráculo). Fuji y el chequeo KYA son nuevos |

**Pregunta para la mañana, la misma para las 6 ideas:** "¿KUMPLY nos puede emitir a mano niveles 4 y 5 en su `AttestationStore` de Fuji (`issue-attestation.ts`)?" Si dice que sí, el riesgo baja un escalón en cheque, pallet, mandato y comanda.
