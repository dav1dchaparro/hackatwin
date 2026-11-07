# Comanda x402

**La rotisería del barrio toma pedidos de los agentes de IA de sus clientes, que pagan en ARGt dentro del mismo pedido HTTP: no hay comprobante trucho ni pedido de broma, y la app no se queda con un 25-35 %.**

*(Generador G3 · Ronda 1. Rutas relativas a `ideas/`.)*

## Problema
El comercio chico vive entre dos males. Si vende por apps de delivery, deja una comisión enorme. Si vende directo por WhatsApp, entrega contra una captura que puede ser falsa. Y cuando los clientes empiecen a pedir con su asistente de IA, Rubén no va a tener forma de saber si del otro lado hay alguien que paga.

## Usuario concreto
**Rubén, rotisería en Lanús Oeste.** Viernes 21:30, cocina llena. **Sofía**, clienta de siempre, le dice a su asistente: "pedile a lo de Rubén lo de siempre, que no pase de $20.000".

## Evidencia
- Comprobantes truchos de transferencia en kioscos, casas de comida y heladerías: detenido en La Plata (Infobae, 24/2/2026) y caso en Catamarca (El Ancasti, 16/7/2026) (`ronda-0/DOLORES.md` #2).
- PedidosYa "aplica cargos que oscilan entre el 25 % y el 35 % del total vendido"; Rappi dice que no supera el 25 % (iProfesional, 14/5/2026): https://www.iprofesional.com/negocios/454816-mas-pedidos-y-cargos-de-hasta-35-por-cento-la-presion-del-delivery-sobre-comercios-y-repartidores
- Comisión de 6,49 % + IVA por cobrar con tarjeta al instante (Ámbito, 2023; dato viejo) (`ronda-0/DOLORES.md` #14).
- Pedidos falsos o de broma a rotiserías: [SIN VERIFICAR]. Cuántos clientes usan asistentes de IA para pedir comida: [SIN VERIFICAR].

## Solución (3 frases)
El menú de Rubén es un endpoint x402 (`POST /pedido`). Solo atiende a agentes con KYA cuyo dueño ERC-8004 sea una persona con KYC 1+; al resto le devuelve 403, como en la slide "KUMPLY en el flujo x402" del workshop. El 402 trae el total en ARGt, el agente de Sofía paga dentro de su tope, el facilitador liquida en Fuji y la comanda sale en la cocina con el link a la transacción, mientras el contrato le separa automáticamente la parte al repartidor.

## Momento wow (30 s)
Pantalla de la cocina (o una ticketera térmica). Alguien muestra una captura de transferencia falsa y la cocina no se mueve. Un bot sin KYA pide y recibe 403. Sofía dicta el pedido: 402, pago, 200, y sale la comanda "PAGADO · Fuji" con el ARGt ya en la billetera de Rubén y la parte del repartidor separada. Todo en menos de 10 segundos, un viernes a la noche con los bancos cerrados.

## Quién paga
La rotisería: abono fijo o 1-2 % por pedido, contra el 25-35 % de las apps [SIN VERIFICAR: disposición a pagar]. El cliente no paga extra.

## Qué sponsor la amaría y por qué
- **Team1 Avalanche:** es su flujo del workshop (pedir → `isAgent` → 402 → pagar → 200, y 403 sin KYA) aplicado a algo que el jurado come, en C-Chain Fuji (`ronda-0/SPONSORS.md` #2).
- **Twin:** ARGt como medio de pago en pesos, con liquidación el fin de semana, sin dólar ni rendimiento.
- **KUMPLY:** gate de dos niveles en un mismo pedido (agente 5 + persona dueña 1+).
- **Digital House / Belo:** se entiende sin saber nada de cripto y es un caso de comercio de barrio.
- No es la API de datos saturada (#1): se paga un producto físico, no una consulta.

## Qué se reutiliza
- Vendedor x402 (Hono + `paymentMiddleware`): `refs/hackatwin-x402-team1-avalanche/demos/01-x402-twin/adapters/seller-app.ts` y `demos/01-x402-twin/seller-api/main.ts`.
- Facilitador: `demos/01-x402-twin/adapters/x402-facilitator.ts` y `demos/01-x402-twin/facilitator/main.ts`.
- Agente comprador con tope "no más de $20.000": `demos/01-x402-twin/buyer-agent/main.ts`, `tools.ts`, `prompt.ts` y `packages/agent-kit/src/policy/budget-policy.ts`.
- Precio en ARGt: `demos/01-x402-twin/adapters/argt-money-parser.ts`. En Fuji no hay ARGt: se usa el perfil `fuji-crosschain` con USDC o un token propio (`CONTEXTO.md`).
- Reparto con el repartidor: `packages/contracts/src/RevenueSplitter.sol` y `packages/contracts/script/DeployRevenueSplitter.s.sol`.
- Chequeos: `refs/Kumply/packages/sdk/src/client.ts` (`isAgent`, `isPersonAtLeast`); dueño del agente: `packages/agent-kit/src/identity/erc8004-identity.ts` (`ownerOf`).
- Flujo de referencia del 403: `refs/hackatwin-x402-team1-avalanche/Avalanche_Workshops.html`.
- **A construir:** middleware KYA antes del 402, pantalla de cocina y el paso de Demo 1 (fork de mainnet) a Fuji. Riesgo: billetera KYA real en Fuji.

## Ataque
*(Abogado del diablo 1, ronda 1)*
- **¿Base de datos común?** Sí, para el dolor que se cita. El comprobante trucho se resuelve cobrando con QR o link de Mercado Pago: la cocina ve la acreditación real, al 0,8 % + IVA con dinero en cuenta (DOLORES #14). Lo que se pierde: que liquide sin intermediario y que el agente pague solo. Sigue sin estar claro que Sofía quiera eso.
- **¿Ya existe?** Pedidos directos sin comisión por venta: Pedix, catálogo para pedidos por WhatsApp con abono mensual y sin comisión, que "puede usarse en paralelo" con PedidosYa ([InfoNegocios](https://infonegocios.info/amp/default/vender-por-whatsapp-es-mas-facil-pedix-acelera-el-proceso-catalogo-virtual-y-ventas-centralizadas); fecha [SIN VERIFICAR]). La tienda online de Fudo cobra con Mercado Pago ([ayuda Fudo](https://intercom.help/fudoapp/es/articles/12044599-funcionamiento-de-tienda-online); detalle [SIN VERIFICAR]: solo lo vi en el resumen del buscador). Para distinguir agentes legítimos de bots, Visa tiene el Trusted Agent Protocol (oct. 2025) ([Visa](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21716.html)).
- **¿Sofía usaría una billetera cripto?** Hoy, no. La propia idea marca [SIN VERIFICAR] cuántos piden comida con un asistente de IA. Rubén necesita pesos para comprar pollo el sábado, así que tendría que cambiar ARGt a pesos. Lo que la frena: no conoce el ARGt y no tiene un agente.
- **¿Fuji en 12 h?** Sí, pero justo. En `packages/config/src/profiles.ts` existe un perfil `fuji-cchain` con `x402: 'eip3009'` y USDC. Ese perfil también pide `ARBITRUM_RPC_URL` y `BASE_RPC_URL`. Que corra de punta a punta: [SIN VERIFICAR]. Lo más riesgoso es el chequeo "dueño ERC-8004 con KYC 1+": requiere un registro ERC-8004 en Fuji [SIN VERIFICAR] y un KYA real que no existe (`refs/Kumply/LITEPAPER.md` l. 159).
- **¿ARGt y KUMPLY esenciales?** ARGt encaja como pago en pesos. KUMPLY está medio pegado: el 403 al bot sin KYA es lindo, pero un bot que paga por adelantado no le hace daño a Rubén. El "pedido de broma" no existe si se cobra antes.

## Usuario
Soy Rubén, rotisería en Lanús Oeste. Si me saca del 30 % de la app, lo pruebo, pero hoy ningún cliente me pide con "un asistente": me piden por WhatsApp y me pagan con el QR de Mercado Pago.
No entiendo qué es eso del 402 ni el "KYA", y cómo convierto el ARGt en pesos el sábado a la mañana para comprar el pollo.
Pagaría 1-2 % por pedido, nunca un abono fijo si no tengo pedidos.
Me da miedo que se caiga un viernes a las 21:30 con la cocina llena, y no tener a quién llamar.
