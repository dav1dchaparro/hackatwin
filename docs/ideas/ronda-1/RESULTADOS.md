# RESULTADOS – Ronda 1 (Juez)

Criterios 1-5: **PR** problema real · **BC** por qué blockchain · **TK** uso de Twin + KUMPLY · **F** factible en 12 h · **D** demo clara · **N** negocio · **W** momento wow · **S** afinidad con sponsors. Máximo 40. Pasan 6. Desempate: demo más clara (D).

## Fusiones (antes de puntuar)
1. **g3-agente-sin-chamuyo absorbe a g1-freno-de-mano.** Es el mismo mecanismo: un contrato que paga al instante solo a comercios KYB (nivel 4 exacto), con topes, y retiene el resto para que lo apruebe o cancele un hijo con KYC 2+. Agente sin chamuyo suma el agente con KYA, el wow de la inyección de prompt y más sponsors. De Freno se conserva la **cola de 24 h con veto del guardián** y el "ni la propia app puede saltarla". g1-freno-de-mano no pasa.
2. **g1-recibo-sin-patron absorbe a s1-alquiler-verificado.** Las dos arman un historial de pagos entre personas verificadas para presentarlo ante una inmobiliaria. s1 solo agrega recibos de un pago que el banco ya documenta (su propio Ataque recomienda la fusión). De s1 se conserva el **recibo como evento on-chain con período** (`TxLink.tsx`). s1 no pasa.

Revisadas y **no fusionadas** (se parecen, pero no son casi iguales): s3-libreta (cliente → almacén) vs g2-legajo (almacén → mayorista); s2-changa vs s7-seña vs g1-cuotas (las tres retienen fondos, pero resuelven problemas distintos); s6-datos vs g3-comanda (las dos usan x402 + 403 sin KYA, pero una vende un dato y la otra un producto físico).

## Tabla

| # | id | nombre | tipo | PR | BC | TK | F | D | N | W | S | Total | Pasa |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | g1-cuotas-egresados | Cuota Blindada | calle | 5 | 4 | 4 | 4 | 5 | 3 | 4 | 4 | **33** | sí |
| 2 | g3-agente-sin-chamuyo | Al contrato no lo chamuyan (+ Freno de Mano) | agentes | 4 | 3 | 4 | 3 | 5 | 3 | 5 | 5 | **32** | sí |
| 3 | s7 | Seña segura (alquiler de verano) | calle | 5 | 3 | 4 | 4 | 5 | 3 | 4 | 4 | **32** | sí |
| 4 | g2-cheque-que-se-llena | Cheque que se llena | pyme | 5 | 4 | 4 | 3 | 4 | 3 | 4 | 4 | **31** | sí |
| 5 | g3-comanda-x402 | Comanda x402 | agentes | 3 | 3 | 3 | 3 | 5 | 3 | 5 | 5 | **30** | sí |
| 6 | g2-compra-conjunta | Pallet compartido | pyme | 3 | 3 | 3 | 5 | 5 | 3 | 3 | 4 | **29** | sí (desempate D=5) |
| 7 | g2-legajo-buen-pagador | Legajo de buen pagador | pyme | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 4 | **29** | no (desempate D=4) |
| 8 | g3-cobrador-verificado | Cobrador con credencial | agentes | 4 | 3 | 4 | 3 | 4 | 3 | 4 | 4 | **29** | no (desempate D=4) |
| 9 | g1-freno-de-mano | Freno de Mano | calle | 4 | 2 | 3 | 4 | 5 | 3 | 4 | 4 | 29 | no (absorbida por g3-agente-sin-chamuyo) |
| 10 | g1-recibo-sin-patron | Recibo sin Patrón (+ s1) | calle | 4 | 3 | 4 | 4 | 4 | 2 | 3 | 4 | **28** | no |
| 11 | s2 | Changa segura | calle | 4 | 3 | 3 | 5 | 4 | 3 | 2 | 4 | **28** | no |
| 12 | s5 | Colecta transparente | otro | 3 | 3 | 3 | 5 | 4 | 2 | 3 | 3 | **26** | no |
| 13 | s8 | P2P de USDT sin triangulación | otro | 4 | 2 | 2 | 5 | 4 | 2 | 3 | 3 | **25** | no |
| 14 | s6 | Datos por consulta para agentes | agentes | 2 | 2 | 3 | 4 | 4 | 2 | 2 | 4 | **23** | no |
| 15 | s1 | Alquiler verificado | calle | 3 | 1 | 2 | 5 | 4 | 2 | 2 | 3 | 22 | no (absorbida por g1-recibo-sin-patron) |
| 16 | s3 | Libreta del almacén | pyme | 4 | 1 | 2 | 5 | 3 | 2 | 2 | 3 | **22** | no |
| 17 | s4 | Entradas sin reventa | calle | 3 | 2 | 2 | 4 | 4 | 2 | 3 | 2 | **22** | no |

Corte: 29 puntos. Hay tres ideas vivas en 29 (compra conjunta, legajo, cobrador) y pasa la de demo más clara. Legajo y cobrador quedaron **a 0 puntos del corte**: el rescatista debería mirarlas primero.

## Justificación (una línea por idea)
- **g1-cuotas-egresados (33):** dolor con casos reales y fácil de entender, y la regla "la agencia no se puede pagar a sí misma" solo es creíble si no la controla la agencia. Se pierde un punto porque el seguro de caución ya existe y porque el proveedor KYB es simulado.
- **g3-agente-sin-chamuyo (32):** el mejor wow de la tanda (el agente cae en la trampa y el contrato no) y calza con los 4 controles de BitGo y con los tres niveles de KUMPLY. Riesgo: que el pago x402 salga de un contrato (EIP-3009/ERC-1271).
- **s7 seña segura (32):** la estafa con mejor evidencia, se entiende en 10 s y ARGt liquida un sábado de enero. Debilidad: el KYC no prueba que la casa sea del dueño y el estafador pide transferencia por fuera.
- **g2-cheque-que-se-llena (31):** ataca un dolor récord de 2026 entre empresas que no comparten banco. Pierde porque el emisor decide qué ventas pasan por el router y porque hay riesgo de que la CNV lo trate como valor negociable [SIN VERIFICAR].
- **g3-comanda-x402 (30):** es el flujo del workshop de Team1 (403 → 402 → 200) con una ticketera que imprime en vivo: demo y sponsors excelentes. El problema de fondo es débil (hoy nadie pide comida con un agente) y el KYA está medio pegado.
- **g2-compra-conjunta (29):** la más factible y con la barra "52/60 cajas" que cualquiera entiende. Pierde en wow ("Kickstarter de aceite") y porque el KYC del almacenero está pegado; solo el KYB del mayorista suma.
- **g2-legajo-buen-pagador (29):** buena idea de historial portable, pero se contradice: on-chain expone la cartera de cada mayorista, que es justo lo que dice que no aceptarían. Queda afuera solo por el desempate.
- **g3-cobrador-verificado (29):** KYA atado a un dueño KYB es exactamente el diseño de KUMPLY, pero el deudor no usa cripto y el verde de la demo sale de `WorkshopKYA`. Queda afuera solo por el desempate.
- **g1-freno-de-mano (29, absorbida):** el contrato es chico y la demo clara, pero Norma no usaría autocustodia y ARGt está pegado. Su cola de 24 h con veto pasa a g3-agente-sin-chamuyo.
- **g1-recibo-sin-patron (28):** KUMPLY es esencial, pero los empleadores no ganan nada y arriesgan exponer que pagan en negro, y dos amigos verificados pueden inflar la constancia.
- **s2 changa segura (28):** fácil y querida por Digital House, pero es un escrow más (Workana ya lo hace) y KUMPLY no dice nada de la calidad del trabajo.
- **s5 colecta transparente (26):** la entrada es trazable, pero el gasto "15 kg de papa" lo declara el propio comedor. Ya existen Pulenta y Giveth.
- **s8 P2P USDT (25):** usuario cripto-nativo y evidencia fuerte, pero no resuelve la triangulación bancaria (debilidad admitida en CONTEXTO.md) y Binance P2P/El Dorado ya hacen escrow con KYC.
- **s6 datos para agentes (23):** saturada (la API de lácteos ya ganó) y los datos argentinos que propone ya son gratis.
- **s1 alquiler verificado (22, absorbida):** no agrega nada a un comprobante de transferencia; el dueño ya conoce al inquilino.
- **s3 libreta del almacén (22):** se reemplaza por una planilla sin perder nada (regla de prohibidos) y Treinta ya lo hace gratis.
- **s4 entradas sin reventa (22):** se revende la billetera con la entrada adentro, las ticketeras ya usan QR dinámico y la demo puede verse como un "NFT de entradas" (prohibido).

## Notas para la ronda 2
- Pasan 2 de calle, 2 de pyme y 2 de agentes: buena mezcla para la regla "no todas del mismo tipo".
- Riesgo común en 5 de las 6: no hay billetera KYB ni KYA real en Fuji (`refs/Kumply/LITEPAPER.md`). El plan B es `WorkshopKYA.sol` y hay que decirlo en el pitch.
- Combinaciones a mirar: g3-comanda-x402 + el reparto al repartidor de g2-compra-conjunta (mayorista → almacén, "pago al mayorista el sábado" de Twin); s7 + la regla anti autopago de g1-cuotas.
