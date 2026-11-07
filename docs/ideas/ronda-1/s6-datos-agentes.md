# s6 – Datos por consulta para agentes
**Frase:** una API de datos argentinos (precios mayoristas, inflación, cotizaciones) cobra centavos en ARGt por consulta vía x402 y solo responde a agentes verificados con KYA.

*(Semilla 6 de TORNEO_IDEAS.md. Rutas relativas a `ideas/`.)*

## Problema
Los agentes de IA necesitan datos frescos y pagar por uso, sin suscripciones ni API keys. Quien vende datos no quiere regalarlos a bots anónimos que los scrapean y revenden.

## Usuario concreto
**Diego, 34, dueño de una distribuidora de bebidas en Rosario.** Tiene un agente de compras que cada mañana consulta precios de mayoristas para decidir a quién comprarle. Hoy lo hace a mano, llamando o mirando listas de WhatsApp.

## Evidencia
- Inflación todavía alta: 1,9 % mensual y 33,4 % interanual en septiembre de 2026 ([Canal 26, 13/10/2026](https://www.canal26.com/economia/2026/10/13/la-inflacion-de-septiembre-fue-de-19-y-acumula-un-alza-de-236-en-lo-que-va-del-2026/), DOLORES.md #10): los precios cambian seguido.
- Una API de precios de lácteos que cobra por consulta vía x402 ganó el 1.er puesto del track Coinbase/AWS en Consensus Miami 2026 (GANADORES.md #11, fuente secundaria). **GANADORES.md la marca como saturada:** necesita giro fuerte (KYA esencial, datos que solo existen en Argentina).
- El deck del workshop de Team1 tiene la slide "KUMPLY en el flujo x402": `isAgent(pagador)` → tier 5 → "402 + precio · sin KYA: 403" (SPONSORS.md #2, `refs/hackatwin-x402-team1-avalanche/Avalanche_Workshops.html`).
- Que pymes argentinas ya usen agentes para compras: [SIN VERIFICAR].

## Solución (3 frases)
La API de datos responde 402 con el precio en ARGt (en Fuji, USDC de prueba o token propio) a cada pedido. Antes de cobrar, chequea con KUMPLY `isAgent` si el pagador es un agente verificado (nivel 5); si no lo es, responde 403. El agente verificado reintenta con el pago firmado y recibe el dato.

## Momento wow (30 s)
Dos agentes piden el precio del cajón de cerveza: el anónimo recibe "403 – sin KYA"; el de Diego recibe "402", paga $10 en ARGt y obtiene el dato, con la transacción en el explorador de Fuji.

## Quién paga
El agente (la pyme) paga por consulta; el proveedor de datos cobra. Fuente de los datos y precio por consulta: [SIN VERIFICAR].

## Sponsor que la amaría
- **Team1 Avalanche + KUMPLY + Twin:** es el flujo exacto de la slide del workshop (SPONSORS.md, patrón 1).
- **BitGo:** identidad y permisos del agente (SPONSORS.md #4).

## Qué se reutiliza del repo de referencia
- `refs/hackatwin-x402-team1-avalanche/demos/01-x402-twin/adapters/seller-app.ts` – `createSellerApp` (línea 29), vendedor x402 con precio por consulta.
- `refs/hackatwin-x402-team1-avalanche/demos/01-x402-twin/adapters/x402-facilitator.ts` y `facilitator/main.ts` – facilitador.
- `refs/hackatwin-x402-team1-avalanche/packages/agent-kit/src/x402/engine.ts`, `policy/budget-policy.ts`, `identity/erc8004-identity.ts` – agente comprador con tope y identidad.
- `refs/Kumply/packages/sdk/src/client.ts` – `isAgent` (línea 245).
- `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol` – plan B de nivel 5 en demo (el KYA real "is not configured in Sumsub yet", SPONSORS.md #7).
- Ojo (CONTEXTO.md): la demo 1 corre sobre una copia local de mainnet; en Fuji hay que usar el perfil `fuji-crosschain` con USDC. Ese perfil figura como `{ asset: 'USDC', x402: 'none' }` en `refs/hackatwin-x402-team1-avalanche/packages/config/src/profiles.ts` (línea 53): x402 sobre Fuji parece estar a construir (que lo confirme el verificador).

## Ataque
*(Abogado del diablo 1, ronda 1)*
- **¿Base de datos común?** Sí: una API con clave y facturación mensual hace lo mismo. Lo que se pierde: que el agente pague solo, sin alta ni tarjeta. Ese es el argumento x402 de siempre, no algo argentino.
- **¿Ya existe?** Ya ganó tal cual: la API de lácteos x402 (GANADORES #11, saturada). Y los datos argentinos que menciona ya son gratis: ArgentinaDatos (API pública gratuita, licencia MIT: [publicapis.dev](https://publicapis.dev/resource/argentinadatos/r5t4vqrj)), DolarAPI para cotizaciones ([GitHub](https://github.com/enzonotario/dolarapi.com)) y el dataset de Precios Claros/SEPA con más de 70 mil productos ([datos.gob.ar](https://datos.gob.ar/dataset?tags=Precios)). Nadie paga por un dato gratis. Los precios de mayoristas, que sí valdrían, no tienen fuente: la idea marca el origen de los datos [SIN VERIFICAR].
- **¿Diego usaría una billetera cripto?** Su agente sí podría pagar solo. A Diego lo frena fondear al agente con ARGt para ahorrarse una consulta que hoy hace por WhatsApp gratis.
- **¿Fuji en 12 h?** Probablemente. Corrección para el verificador: además de `fuji-crosschain` (`x402: 'none'`), `packages/config/src/profiles.ts` línea 70 tiene un perfil `fuji-cchain` con `{ asset: 'USDC', x402: 'eip3009', facilitator: 'x402-ts' }`. Que corra entero: [SIN VERIFICAR]. Lo riesgoso es el KYA real, que no está configurado en Sumsub (`refs/Kumply/LITEPAPER.md` l. 159). El 403 con `WorkshopKYA` se ve armado.
- **¿ARGt y KUMPLY esenciales?** Calzan con la slide del workshop, pero están pegados al caso: el dato no es argentino-exclusivo y el KYA no protege nada que valga (un agente con KYA puede revender el dato igual).

## Usuario
Soy Diego, distribuidora de bebidas en Rosario. Si el agente me trae el precio de los mayoristas de verdad cada mañana, lo uso; la inflación y el dólar ya los veo gratis.
No entiendo de dónde salen esos precios de mayoristas ni quién me asegura que estén actualizados, ni por qué mi agente necesita una "credencial".
Pagaría centavos por consulta, hasta unos $10.000 por mes en total, si me ahorra las llamadas.
Me da miedo cargarle plata al agente y que se gaste todo en consultas que no necesito.
