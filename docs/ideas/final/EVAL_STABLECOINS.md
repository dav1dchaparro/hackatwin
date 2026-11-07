# EVAL Track Stablecoins (Twin) – juez, 7/11 ~9:50

Criterios oficiales 1-5, todos pesan igual: **I** Idea (original, solo posible con moneda local onchain, ARGt como núcleo, no la versión onchain de algo que ya existe) · **P** Problema · **N** Negocio · **Pt** Pitch (3 min + demo). Máximo 20. Disparadores de Twin: **A** pagos agénticos con límites · **M** capital de trabajo (Morpho, repago con % de ventas) · **C** FX (Curve).

| # | Idea | I | P | N | Pt | Total | Disparador | Qué cambiar para que ARGt sea el núcleo |
|---|---|---|---|---|---|---|---|---|
| 1 | **Cheque que se llena** (r1/r2) | 5 | 5 | 4 | 3 | **17** | M | Ya lo es: cada venta en ARGt pasa por un router que manda el X % al cheque. Sumar el adelanto contra el cheque desde un vault Morpho (Arbitrum) [SIN VERIFICAR: que haya vault ARGt usable hoy] |
| 2 | Al contrato no lo chamuyan (Mandato) | 4 | 3 | 3 | 5 | 15 | A (literal) | El límite tiene que estar en ARGt y en pesos ("hasta $20.000 por semana"). Que el agente pague en ARGt y no en USDC de Fuji |
| 3 | Seña Segura | 2 | 5 | 3 | 5 | 15 | – | Hoy es un escrow con ARGt como moneda (decorativo, "versión onchain" de Alohar/Airbnb). Para subir I: la seña se libera al dueño en cuotas o cubre una cobertura FX si el turista paga en BRAt (Curve) |
| 4 | Legajo de buen pagador (r1) | 4 | 4 | 4 | 3 | 15 | M (literal: scoring por cobros onchain) | Que el historial de pagos en ARGt habilite crédito real de un vault, no solo "plazo con el mayorista" |
| 5 | Cuota Blindada | 3 | 5 | 3 | 4 | 15 | – | Escrow por hitos: el token es medio de pago. Para subir I: que el pozo rinda (Morpho) y el rendimiento cubra el ajuste por inflación. Ojo: hotel y micro no cobran en ARGt |
| 6 | Pallet compartido | 3 | 4 | 3 | 4 | 14 | M (débil) | Que el mayorista adelante el pallet con capital de un vault y cobre con % de cada "recibí" |
| 7 | Comanda con dueño | 3 | 2 | 2 | 4 | 11 | A | Pago x402 en ARGt; el problema sigue sin usuario real |

## Una línea por idea
- **Cheque (17):** la única que ni existe ni podría existir sin dinero programable en pesos (un eCheq no se puede fondear solo con ventas), dolor récord (119k rechazados en dic. 2025) y calza con el disparador M de Twin. Le cuesta el pitch: hay que explicarlo en 30 s ("el cheque muestra cuánta plata tiene adentro").
- **Mandato (15):** es exactamente el disparador A, con el mejor wow, pero el problema (Nelly con un agente) es flojo y hoy está pensado en USDC/Fuji.
- **Seña (15):** el mejor problema y la mejor demo, pero para Twin es "escrow con pesos onchain": el jurado puede leerla como decorativa.
- **Legajo (15):** el disparador M al pie de la letra; sola es poco vistosa. Sirve como **módulo del Cheque** (el historial del cheque es el score).
- **Cuota (15):** buen dolor; ARGt no es el núcleo y los proveedores reales no cobran en ARGt.
- **Pallet (14) / Comanda (11):** el token es el medio de pago, nada más.

## Mejor para este track: Cheque que se llena (+ Legajo como score)
Demo mínima con tx real: una venta de 1 ARGt → el router manda el 20 % al cheque → la barra del cheque sube → Nora endosa y ve "fondeado 60 %". Chain: Avalanche C-Chain mainnet con ARGt real (0x2E4e…703B, [SIN VERIFICAR: confirmar con mentores de Twin]) **sirve para los dos tracks**: el mismo contrato verificado en Snowtrace cumple Twin y el obligatorio 1 de Avalanche. Morpho/Curve solo están en Arbitrum: si se usan, es una pieza aparte (riesgo). Pregunta abierta: ¿se puede competir en los dos tracks? [SIN CONFIRMAR]
