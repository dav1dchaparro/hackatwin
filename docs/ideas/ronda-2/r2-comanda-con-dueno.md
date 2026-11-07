Origen: g3-comanda-x402, s8-p2p-usdt

# Comanda con dueño

**La rotisería toma pedidos de agentes de IA que pagan en ARGt dentro del mismo pedido HTTP, solo si el agente tiene KYA y su dueño es una persona verificada. Ningún pedido anónimo, ningún cadete con efectivo encima y 1 % de comisión en vez de 25-35 %.**

*(Generador G3 · Ronda 2. Rutas relativas a `ideas/`.)*

## Problema
Rubén vende por apps que se quedan con 25-35 %, o por WhatsApp, donde cualquiera pide con un nombre inventado. El pedido falso ya se usa para emboscar al cadete y llevarse la moto y la plata cobrada. Y los agentes de IA que compran ya están llegando por los bancos, pero sin un canal directo con el comercio de barrio.

## Usuario concreto
**Rubén, rotisería en Lanús Oeste**, con un cadete propio. Viernes 21:30. **Sofía**, clienta de siempre, le dice al asistente de su banco o billetera: "pedile a lo de Rubén lo de siempre, que no pase de $20.000".

## Evidencia
- Añatuya, 8/5/2026: "luego de ser engañado mediante un pedido falso" a nombre de "Olivera", le robaron al repartidor la moto, la riñonera con el efectivo del día y el celular ([Diario Panorama](https://www.diariopanorama.com/noticia/551666/delincuentes-simularon-ser-clientes-asaltaron-delivery-anatuya)). Cuántos casos hay por año: [SIN VERIFICAR].
- PedidosYa cobra "entre el 25 % y el 35 % del total vendido"; Rappi dice que no pasa del 25 % ([iProfesional, 14/5/2026](https://www.iprofesional.com/negocios/454816-mas-pedidos-y-cargos-de-hasta-35-por-cento-la-presion-del-delivery-sobre-comercios-y-repartidores)).
- Compras con agentes en AR: piloto Visa + Santander, marzo de 2026 ([iProfesional, 14/3/2026](https://www.iprofesional.com/tecnologia/450225-inteligencia-artificial-logro-pagos-automaticos-santander-sorprendio-latinoamerica)). Cuánta gente pide comida con un agente hoy: [SIN VERIFICAR] (probablemente casi nadie: es apuesta a 1-2 años).

## Solución (3 frases)
El menú de Rubén es un endpoint x402 (`POST /pedido`) que contesta 402 con el total en ARGt. Cuando llega el pago firmado, **antes de liquidar** el vendedor mira el `from` de esa firma (no un encabezado que se puede falsear): tiene que ser KYA (`isAgent`) y su dueño ERC-8004 (`ownerOf`) tiene que tener KYC 2+ (documento + prueba de vida). Si no cumple, 403 y no se cobra nada; si cumple, se liquida en Fuji, un splitter reparte Rubén / envío del cadete / 1 % plataforma, y recién ahí la comanda sale en la cocina.

## Momento wow (30 s)
Ticketera en la mesa del jurado. Un bot sin KYA pide → 403. Un agente con KYA pero con dueño solo nivel 1 (un email) → 403 "dueño sin verificar". Sofía dicta el pedido → 402 → pago → 200, y sale la comanda: "PAGADO · Fuji · dueño verificado", con el reparto a la vista. El cadete sale sin un peso encima.

## Quién paga
Rubén: 1 % por pedido, cobrado en el mismo split y sin abono fijo (lo que pidió en el usuario simulado). Contra 25-35 % de las apps. El cliente no paga extra.

## Qué sponsor la amaría y por qué
- **Team1 Avalanche:** es su slide "KUMPLY en el flujo x402" (`isAgent` → 402 → pago → 200; sin KYA, 403) aplicada a algo que el jurado ve imprimirse, con el chequeo puesto donde no se puede falsear.
- **KUMPLY:** dos niveles en un mismo pedido (5 y persona 2+), que es su idea de "agente con dueño responsable".
- **Twin:** ARGt como medio de pago en pesos, nada de rendimiento (condición CNV). Rubén paga al mayorista en ARGt el sábado o lo pasa a pesos: Belo dice que se pueden mandar ARGt a un CBU y llegan pesos (resumen del buscador; la ayuda de Belo dio 403 [SIN VERIFICAR]).
- **Tether (a futuro, fuera de la demo):** que el 402 acepte también USDT y lo liquide en ARGt (pedido de Tether en `ronda-0/SPONSORS.md` #3).
- **Digital House / Belo:** se entiende sin saber nada de cripto.

## Qué se reutiliza (verificado en `refs/hackatwin-x402-team1-avalanche/`)
- Vendedor x402: `demos/01-x402-twin/adapters/seller-app.ts` (`paymentMiddleware` de `@x402/hono`, `ExactEvmScheme`) y `demos/01-x402-twin/seller-api/main.ts`. Facilitador: `demos/01-x402-twin/adapters/x402-facilitator.ts` y `demos/01-x402-twin/facilitator/main.ts`.
- Agente comprador con tope: `demos/01-x402-twin/buyer-agent/main.ts`, `tools.ts`, `prompt.ts` y `packages/agent-kit/src/policy/budget-policy.ts`.
- Precio en pesos: `demos/01-x402-twin/adapters/argt-money-parser.ts`. En Fuji no hay ARGt: perfil `fuji-cchain` (USDC + `eip3009`) en `packages/config/src/profiles.ts`, que igual pide `ARBITRUM_RPC_URL` y `BASE_RPC_URL`. Que corra entero: [SIN VERIFICAR].
- Dueño del agente: `packages/agent-kit/src/identity/erc8004-identity.ts` (`ownerOf`) y el registro de Fuji en `packages/chains/registry/fuji.json`. KUMPLY: `refs/Kumply/packages/sdk/src/client.ts` (`isAgent`, `isPersonAtLeast`).
- Reparto: `packages/contracts/src/RevenueSplitter.sol` (hoy reparte en 2: vendedor y plataforma con `platformBps`) y `script/DeployRevenueSplitter.s.sol` + `script/params/fuji-revenue-splitter.json`. Recibo: `packages/ui/src/atoms/TxLink.tsx`.
- **A construir:** el chequeo KYA + dueño entre la verificación y la liquidación del pago, un splitter de 3 vías y la pantalla de cocina. **Plan B:** sin KYA real en Fuji (`refs/Kumply/LITEPAPER.md` l. 159) se lee el nivel de `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol`, y se dice en el pitch.

## Cambios vs ronda 1
- KYA deja de estar "pegado": un bot que paga por adelantado no daña a la cocina, pero un pedido anónimo sí pone en riesgo al cadete (caso Añatuya). Se exige dueño con KYC **2+**, no 1+.
- Se saca el comprobante trucho como dolor principal: el QR de Mercado Pago ya lo resuelve (lo dijo el Ataque).
- El chequeo va sobre el `from` del pago firmado y antes de liquidar, así no se puede falsear con un encabezado.
- Negocio: 1 % por pedido, sin abono. Lo pidió Rubén.
- Respuesta a "¿cómo lo paso a pesos?": ARGt → CBU vía Belo [SIN VERIFICAR] o pago al mayorista en ARGt.
- Se nombra el piloto Visa/Santander como señal de que los agentes que compran ya están llegando. USDT de Tether queda como "a futuro".

## Ataque
*(Abogado del diablo 2, ronda 2)*
- **¿Base de datos común?** Para el cadete, sí: cobrar por adelantado con un link de Mercado Pago ya saca el efectivo de la riñonera. Lo que se pierde es que la identidad del que paga la tiene MP, no Rubén, y que un agente no puede pagar solo por HTTP.
- **¿Ya existe?** Los pagos con agentes en AR se prueban con tarjeta tokenizada, no con stablecoins. Visa + Santander venden libros y productos digitales, Mastercard opera con Nación, Galicia, Itaú y Santander, y Pomelo hizo un pago agéntico dentro de ChatGPT ([iProUP, 12/8/2026](https://www.iproup.com/finanzas/70397-mercado-libre-tiendanube-y-tarjetas-ya-prueban-compras-agenticas-en-argentina.amp)). En esa nota no hay delivery ni comercios de barrio. Integración de PedidosYa o Rappi con agentes: no la encontré.
- **¿Billetera cripto?** Sofía no tiene un agente con billetera ni ARGt. El "asistente de su banco" de la historia pagaría con tarjeta tokenizada (nota anterior), no con x402. Rubén necesita pesos el sábado (ARGt → CBU vía Belo: [SIN VERIFICAR]).
- **¿Fuji en 12 h?** Es la más riesgosa de las tres. (1) El ABI de ERC-8004 del repo no tiene búsqueda billetera → `agentId` (`packages/agent-kit/src/identity/abi.ts`: solo `ownerOf` e `isAuthorizedOrOwner`, l. 12-19). El `agentId` tiene que llegar en un encabezado y validarse con `isAuthorizedOrOwner(from, agentId)`. (2) `paymentMiddleware` (`seller-app.ts` l. 63) verifica y liquida adentro, sin un gancho visible. El chequeo va antes, decodificando el pago a mano. (3) `fuji-cchain` paga en USDC y pide `ARBITRUM_RPC_URL` y `BASE_RPC_URL` (`profiles.ts` l. 70-73). (4) No hay KYA real (`LITEPAPER` l. 159). Hay tres piezas falsas en la demo.
- **¿ARGt y KUMPLY?** KUMPLY es esencial en el diseño (agente 5 + dueño 2+). ARGt, en la demo, es USDC: el "pagan en ARGt" no se ve en Fuji.
- **Debilidad más grave:** no hay usuario hoy. Nadie en AR pide comida con un agente que paga en stablecoin, y los pilotos reales van por tarjeta tokenizada. Encima, es la demo más frágil de las tres.

## Usuario
- Soy Rubén, la rotisería de Lanús Oeste. 1 % contra el 30 % de PedidosYa me encanta, y que el cadete salga sin plata encima, más.
- No entiendo de dónde salen clientes con un "agente que paga en ARGt": los míos piden por WhatsApp y pagan con el QR de Mercado Pago.
- Pago el 1 % por pedido, sin abono. La ticketera, si me la prestan.
- Me da miedo no poder pasar el ARGt a pesos el sábado para el mayorista, y que si el agente pide mal no tenga a quién reclamarle.
