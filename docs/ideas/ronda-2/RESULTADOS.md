# RESULTADOS – Ronda 2 (Juez)

Criterios 1-5: **PR** problema real · **BC** por qué blockchain · **TK** uso de Twin + KUMPLY · **F** factible en 12 h (incluye el riesgo técnico de `VERIFICACION.md`) · **D** demo clara · **N** negocio · **W** momento wow · **S** afinidad con sponsors. Máximo 40. Pasan 4, no todas del mismo tipo. Desempate: demo más clara (D).

Regla para F: riesgo BAJO → 5, MEDIO → 3 o 4 (4 si es Solidity simple y autocontenido), ALTO → 2.

## Fusiones
**No hay duplicados.** Las 6 resuelven problemas distintos. Revisé dos parecidos:
- r2-pallet-compartido y r2-comanda-con-dueno comparten usuario (Rubén) y el reparto al repartidor, pero una es compra mayorista entre comercios y la otra es venta minorista a agentes.
- r2-cuota-blindada y r2-sena-segura retienen fondos en un contrato, pero una paga hitos a proveedores durante un año y la otra libera una sola seña al check-in.

## Tabla

| # | id | nombre | tipo | PR | BC | TK | F | D | N | W | S | Total | Pasa |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | r2-sena-segura | Seña Segura | calle | 5 | 3 | 4 | 5 | 5 | 3 | 4 | 4 | **33** | sí |
| 2 | r2-cuota-blindada | Cuota Blindada | calle | 5 | 4 | 4 | 3 | 5 | 3 | 4 | 4 | **32** | sí |
| 3 | r2-pallet-compartido | Pallet compartido | pyme | 4 | 3 | 4 | 4 | 5 | 3 | 4 | 4 | **31** | sí |
| 4 | r2-mandato-sin-chamuyo | Al contrato no lo chamuyan | agentes | 4 | 3 | 3 | 3 | 5 | 3 | 5 | 5 | **31** | sí |
| 5 | r2-comanda-con-dueno | Comanda con dueño | agentes | 2 | 3 | 3 | 2 | 5 | 3 | 5 | 5 | **28** | no (desempate D=5) |
| 6 | r2-cheque-que-se-llena | Cheque que se llena | pyme | 5 | 3 | 3 | 3 | 4 | 2 | 4 | 4 | **28** | no (desempate D=4) |

Corte: 31 puntos. Pasan 2 de calle, 1 de pyme y 1 de agentes: cumple "no todas del mismo tipo". Las dos eliminadas quedaron **a 3 puntos del corte**, así que no entran en la regla de "≤2 puntos" del rescate.

## Justificación (una línea por idea)
- **r2-sena-segura (33):** la estafa con mejor evidencia, demo rojo/verde que se entiende en 10 s y el contrato más chico de la tanda (riesgo BAJO). Pierde en BC: Alohar ya retiene hasta el check-in, y el contador mide billeteras, no personas, así que el "9 de 9" es dato sembrado.
- **r2-cuota-blindada (32):** dolor real y "en manos de la agencia: $0" es un wow fuerte. Baja en F (riesgo MEDIO: varios pagadores, devolución proporcional, `approve` + ejecutor mensual, hitos en minutos) y tiene un hueco que se arregla fácil: la agencia elige a los proveedores, así que Claudia o el colegio tienen que aprobar cada dirección.
- **r2-pallet-compartido (31):** es la idea de Twin ("pago al mayorista el sábado") con una barra 52/60 que cualquiera entiende, y el legajo hace esencial al KYB. Le falta salida para el reclamo: hay que agregar plazo y árbitro, y además el mayorista cobra el 50 % antes de entregar.
- **r2-mandato-sin-chamuyo (31):** el mejor wow de la noche (el agente cae en la trampa y el contrato no) y calza con BitGo, KUMPLY y Team1. Pierde en TK porque ARGt se puede cambiar por cualquier estable y el KYB del comercio quedó pegado al lado de la lista de Diego. Riesgo MEDIO: hay que armar el vínculo agentId↔dueño y el 402 propio, y KYA/KYB van por plan B.
- **r2-comanda-con-dueno (28):** demo y sponsors excelentes (ticketera + flujo 403/402/200 del workshop), pero hoy nadie pide comida con un agente que paga en stablecoin, y es la única con riesgo ALTO: el x402 solo corre en el fork de mainnet (`eip155:43114` fijo, Permit2/oráculo).
- **r2-cheque-que-se-llena (28):** dolor récord de 2026, pero lo garantizado (lo sólido) es justo la liquidez que Claudio no tiene. La Factura de Crédito Electrónica y el eCheq avalado por SGR ya cubren el caso, el emisor no pagaría (N=2) y los 4 actores son KYB inexistente en Fuji.

## Notas para el rescate y la ronda 3
- **Pregunta de la mañana que vale para las 4:** "¿KUMPLY nos puede emitir a mano niveles 4 y 5 en su `AttestationStore` de Fuji?" (`VERIFICACION.md`, hallazgo 3). Si dice que no, el plan B preferido es la opción B (nuestra copia de `AttestationStore`, que mantiene el SDK), no `WorkshopKYA`.
- Todas las que dicen "adelantamos el reloj" necesitan plazos configurables en minutos (hallazgo 6).
- Piezas para rescatar:
  - De **comanda**: la ticketera física y el 403 al bot sin KYA, que podrían sumarse a **mandato** como cierre del wow.
  - De **cheque**: la barra sólida/rayada con "en riesgo", que podría servirle al **pallet** (comprometido vs. cobrado).
- Arreglos obligatorios antes de la ronda 3:
  - **Cuota:** aprobar proveedores.
  - **Pallet:** plazo y árbitro para el reclamo.
  - **Seña:** cómo se ve un dueño honesto con "0 estadías".
  - **Mandato:** guionar el LLM.
