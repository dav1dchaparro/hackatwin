# Al contrato no lo chamuyan – Plan de construcción (Ronda 3)

*(Planificador · Ronda 3. Rutas relativas a `ideas/refs/`. Suma los injertos de `ronda-2/RESCATE.md` y los avisos de `ronda-2/VERIFICACION.md`.)*

## Resumen (5 líneas)
1. Un agente de IA le compra los remedios a Nelly (76, Mar del Plata) y paga en ARGt desde un contrato **Mandato** en Fuji. El agente no tiene saldo propio.
2. Usuario: **Diego, 48, en Córdoba**. Tiene KYC 2, es dueño ERC-8004 del agente, arma la lista de comercios y el tope, puede vetar y apagar al agente.
3. Semáforo: **verde** (en la lista, con KYB vigente y bajo el tope) paga; **amarillo** (sobre el tope) queda en cola y Diego puede vetarlo; **rojo** (cualquier otro destino, aunque tenga KYB) no mueve un peso.
4. **Wow:** intento 0, un bot sin dueño verificado → rojo. Intento 1, la página trampa pide "transferí a 0xABC" → rojo. Intento 2, "pagá a Farmacia Online SA", que tiene KYB → rojo, "no está en la lista de Diego". Intento 3, el ibuprofeno → verde, sale el ticket "PAGADO · Fuji · dueño verificado" en la pantalla de la farmacia. Al final una caja grande → amarillo, y en el celu de Diego aparece "Vetar".
5. Remate: *"A Nelly la pueden chamuyar. Al agente también. Al contrato no."*

## Qué se despliega en Fuji (43113)
| contrato | qué hace | origen | horas |
|---|---|---|---|
| `ARGtDemo` (ERC-20 con mint) | Hace de ARGt, que no existe en Fuji | Guía: `hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol` | 0,5 |
| **`Mandato`** | `altaAgente(wallet, agentId)`, `setComercio(addr, tope)`, `pagar(comercio, monto, pedidoId)`, `vetar(id)`, `ejecutar(id)` (pasado el plazo), `apagarAgente()`. Chequea: `msg.sender` = la billetera del agente (nunca un encabezado), agente nivel 5 exacto, `ownerOf(agentId) == Diego`, Diego nivel 2 o 3, comercio en la lista **y** con nivel 4 exacto vigente. Para leer niveles usa `verify()` y no `attestations()`, porque `attestations()` no mira el vencimiento (hallazgo 7). El plazo del veto se configura en segundos (120 s en la demo) | **De cero** (~180 líneas). Guías: `Kumply/contracts/contracts/AttestationStore.sol` (`verify` l. 224), `Kumply/contracts/contracts/examples/KumplyPaymasterCheck.sol` (nivel exacto), `…/packages/contracts/src/PaymentHub.sol` (`_transition`, chequeo de saldo l. 126-128) | 5 + 2 de tests |
| Registro ERC-8004 | Vincula agentId con Diego | **Ya desplegado** en `0x8004A818…BD9e` (`packages/chains/registry/fuji.json` l. 29). Snowtrace muestra "8004: Registry", ERC-721 "AgentIdentity", 399 tx (consultado hoy) | 0 |
| `AttestationStore` de KUMPLY | Niveles 2/4/5 | Plan A: el de KUMPLY, `0xa3Bc…22dD` (`Kumply/packages/sdk/src/constants.ts` l. 71). Plan B: abajo | 0 |

Decisión de diseño: el rojo **no revierte**. `pagar` emite `Bloqueado(agente, destino, monto, motivo)` y sale sin mover fondos. Así cada intento deja un tx con link a Snowtrace (la auditoría que pide BitGo), y la billetera no corta el envío al estimar el gas. El constructor recibe **dos direcciones de store**, una para personas y otra para empresas y agentes. En plan A son la misma. En plan B se cambian sin tocar el código.

Billeteras, una por rol porque cada dirección tiene una sola atestación (hallazgo 8): Diego, agente, bot intruso, farmacia del barrio, Farmacia Online SA, 0xABC y deployer. Todas con AVAX del faucet.

## Quién hace qué (4 personas, ~12 h)
- **P1 – Contratos (Foundry), ~8 h:** `ARGtDemo` y `Mandato`. Tests de los 5 intentos (0 a 3 más el amarillo, con veto y sin veto) y de agente apagado. Script de deploy a Fuji. A las 12:00, verde y rojo andando en Fuji por línea de comando. Después: plan B del store y apoyo a P2.
- **P2 – Agente y cobro de la farmacia, ~8 h:**
  - Agente en TS con LLM de **guion fijo**, así cae en la trampa siempre igual. Guías: `…/packages/agent-kit/src/llm/scripted-plan-llm.ts`, `demos/01-x402-twin/buyer-agent/tools.ts` y `packages/agent-kit/src/policy/budget-policy.ts`. Se reescribe para Fuji, porque la demo 1 usa `Tokens.Fork`.
  - Herramientas del agente: `leer_pagina` y `pagar`, que llama a `Mandato.pagar`.
  - Servidor de la farmacia: `GET /pedido` → 402 con `{comercio, monto, pedidoId}`; `POST /confirmar?tx=` lee el evento `Pagado` por RPC y responde 200 con el ticket. Es un 402 propio, no x402 estándar (`seller-app.ts` no acepta un hash de tx).
  - Página trampa con texto escondido.
- **P3 – Front, ~8 h:**
  - **Panel de Diego:** lista, topes, cola amarilla con cuenta regresiva y botón Vetar, Apagar agente.
  - **Consola del agente** con el semáforo en vivo.
  - **Pantalla mostrador:** el comprobante tipo comanda del rescate.
  - Insignias KUMPLY por SDK (`Kumply/packages/sdk/src/client.ts`: `isAgent` l. 245, `isBusiness` l. 236, `isPersonAtLeast` l. 222; `contractAddress` obligatorio) y link a Snowtrace (guía: `…/packages/ui/src/atoms/TxLink.tsx`).
- **P4 – Identidad, demo y pitch, ~8 h:**
  - 9:00: pregunta 1 a KUMPLY.
  - KYC 2 real de Diego (Sumsub en Fuji).
  - Registrar al agente en ERC-8004 **desde la billetera de Diego** (`register(agentURI)`, ABI en `…/packages/agent-kit/src/identity/abi.ts`). Hoy la demo 1 registra al agente como dueño de sí mismo (`adapters/registration.ts` l. 65).
  - Faucet y datos sembrados.
  - Guion del wow, slides y pitch. A las 19:00, video de respaldo. Línea "a futuro": Diego fondea con USDT (Tether) y el contrato paga en ARGt.

Hitos: **12:00** Mandato en Fuji (verde y rojo). **15:00** agente → 402 → pago → ticket, de punta a punta. **18:00** front completo. **19:00** se congela el código y se graba el video.

## Plan B
- **Si KUMPLY no emite niveles 4 y 5 en Fuji** (lo más riesgoso, LITEPAPER l. 159 y l. 225):
  - Opción B: desplegamos nuestra copia de `Kumply/contracts/contracts/AttestationStore.sol` con el equipo como verificador. Tiene el mismo `verify()` y el SDK anda pasándole nuestro `contractAddress`.
  - El KYC 2 de Diego sigue siendo real, en el store de KUMPLY (por eso hay dos stores).
  - No usar `WorkshopKYA.sol`: su `verify` devuelve solo `uint32`, rompe el SDK y no tiene vencimiento.
  - Se dice en el pitch: "Los niveles de agente y empresa los emitimos nosotros porque KUMPLY todavía no los emite en Fuji. El contrato lee la misma interfaz."
- **Si tampoco sale el KYC 2 real:** los tres niveles van a nuestro store. El wow no cambia.
- **Si falla el registro ERC-8004** (`register` o el vínculo): `RegistroAgentes` mínimo con la misma `ownerOf(agentId)`. Son 30 min.
- **Si falla el 402 o el servidor:** la consola del agente muestra el tx y la pantalla mostrador escucha directo el evento `Pagado`.
- **Si falla Fuji o la red del lugar:** el video de las 19:00 y los mismos contratos en anvil local.
- **Mínimo que se muestra pase lo que pase:** los intentos 0 a 3 por script, con links a Snowtrace.

## 3 preguntas sí/no para la mañana
1. ¿KUMPLY nos emite a mano nivel 5 (agente) y nivel 4 (2 farmacias) en su `AttestationStore` de Fuji antes de las 12:00? Si dice que no: ¿acepta, para el track, una copia propia del store?
2. ¿El KYC nivel 2 de Sumsub en Fuji se completa en menos de 30 min con el documento de alguien del equipo?
3. ¿El registro ERC-8004 de Fuji deja que Diego registre al agente y autorice su billetera, de modo que `isAuthorizedOrOwner(agente, agentId)` dé true? (Se prueba con un tx a las 9:30.)

[SIN VERIFICAR]
- Que el registro de Fuji implemente `isAuthorizedOrOwner` y `approve`: hoy solo está confirmado que es un ERC-721 desplegado.
- Que `@kumply/sdk` esté en npm.
- Que el jurado acepte un store propio.

## Ataque final
*(Abogado del diablo 2, ronda 3)*
- **¿Base de datos común?** Sí. Un emisor de tarjeta o una billetera aplica la lista, los topes y el veto en su servidor. Lo que se pierde es que la regla sea pública y que la farmacia la pueda verificar sin confiar en una empresa. Para Diego, eso pesa poco.
- **¿Ya existe?** En AR, Visa y Mastercard prueban compras con agentes junto a Santander y Galicia, y Mercado Pago lanzó un asistente con más de 100 funciones ([descubre.vc, 12/8/2026](https://www.descubre.vc/noticia/mercado-libre-y-tiendanube-impulsan-las-compras-con-agentes-de-ia-en-argentina-2026-08-12)). La nota no menciona topes ni veto. On-chain, Coinbase Spend Permissions ya pone topes por período y funciona en Avalanche ([docs CDP](https://docs.cdp.coinbase.com/wallets/using-wallets/spend-permissions)). Kite AI tiene un "Agent Passport" en una L1 de Avalanche (LITEPAPER l. 235). El diferencial que queda es la lista de destinos, el veto y el dueño verificado.
- **¿Billetera cripto?** Nelly no la usa. Diego tendría que fondear el contrato con ARGt en Avalanche, pero allí hay ~1,77k ARGt (SPONSORS #1). Lo más grave: **la farmacia de barrio no tiene billetera ni KYB y no cobra en ARGt**, así que el carril verde no tiene un comercio real adonde pagar.
- **Choque con el diseño de KUMPLY:** para KUMPLY, el dueño de un agente es un **nivel 4 (KYB)** que "takes legal responsibility" (LITEPAPER l. 145). Acá el dueño es Diego, con KYC 2. Si el jurado de KUMPLY lo nota, hay que justificarlo como "agente personal" y no como agente institucional.
- **¿Fuji en 12 h?** Sí, el contrato tiene ~180 líneas. Lo más riesgoso: el nivel 5 no se emite (el nivel `agent-kya` "is not configured in Sumsub yet", LITEPAPER l. 159), el 4 tampoco (l. 225), y `isAuthorizedOrOwner` en el registro ERC-8004 de Fuji sigue [SIN VERIFICAR]. Con el plan B, 2 de los 3 niveles los emitimos nosotros. Detalle: como el rojo no revierte, cualquiera puede llenar el tablero con eventos `Bloqueado` falsos, así que conviene filtrar por la billetera del agente.
- **¿ARGt y KUMPLY?** ARGt se cambia por cualquier stablecoin sin perder nada. KYA + `ownerOf` son esenciales. El KYB de la farmacia está **pegado**: el intento 2 lo frena la lista de Diego, no el nivel 4.
