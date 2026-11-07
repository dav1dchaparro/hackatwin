# Seña Segura – plan de construcción (Ronda 3, Planificador)

## Resumen
1. **Qué es:** la seña de un alquiler de verano se paga en ARGt a un contrato `SenaEscrow`, no al "dueño". Solo publica una persona KYC 2-3 o una inmobiliaria KYB 4 (nunca un agente).
2. **Usuario:** Andrea Gómez, de Santa Fe. Le piden $210.000 de seña por una casa en Santa Clara del Mar que no puede ir a ver.
3. **Salidas:** confirma el check-in y se libera; pasa el plazo sin reclamo y se libera; reclama y decide un árbitro KYB (si no decide a tiempo, la plata vuelve a Andrea).
4. **Arreglo obligatorio (dueño honesto con 0 estadías):** tres colores. Rojo = sin verificar, pide transferencia. **Ámbar = persona verificada, nueva, 0 estadías: "la seña igual queda retenida"**. Verde = verificada + estadías de huéspedes distintos. La protección viene del escrow; el contador suma confianza, no la reemplaza.
5. **Wow (30 s):** la misma casa en rojo y en verde, lado a lado. Andrea paga en la verde → barra **rayada "Retenida"** + `TxLink`. El dueño se reserva su propia casa → el contador **no sube**. Check-in → la barra pasa a **sólida "Liberada"** y el contador sube de 9 a 10.

Injertos: RESCATE no le asignó piezas a esta idea. Sumo la barra rayado/sólido/ámbar (de cheque) y el reparto de la comisión **dentro** del contrato, sin `RevenueSplitter` aparte (VERIFICACION y RESCATE, l. 38 y 56).

## Qué se despliega en Fuji (C-Chain, 43113)
| contrato | origen | nota |
|---|---|---|
| `ARGtDemo` (ERC-20, mint abierto) | de cero, guía `test/utils/MockERC20.sol` | en Fuji no hay ARGt (CONTEXTO). Alternativa: USDC de Fuji `0x5425…Bc65` (`packages/chains/registry/fuji.json`) |
| `SenaEscrow` (~180 líneas) | de cero | `publicar`, `reservar`, `confirmarCheckIn`, `reclamar`, `liberarPorPlazo`, `decidir`, `devolverSinArbitro`, `withdraw`. **Plazos en el constructor, en minutos** (no se puede adelantar el reloj en Fuji). Antiautopago: no suma si huésped == dueño o si ese huésped ya contó para ese dueño |
| `AttestationStore` propio (solo plan B) | copia de `Kumply/contracts/contracts/AttestationStore.sol` | equipo como verificador. Mantiene `verify()` y el SDK funciona con nuestro `contractAddress` |

**Credenciales en el contrato:** `verify()` del store oficial de KUMPLY en Fuji (`0xa3Bc…22dD`, `Kumply/packages/sdk/src/constants.ts` l. 71), con `verified && tier ∈ {2,3}` para personas y `tier == 4` para inmobiliaria o árbitro. No heredar `ComplianceGate.sol` (l. 97 deja pasar el nivel 5) ni usar `attestations()` (no mira el vencimiento). Segundo store opcional (`storeDemo`, se puede dejar en `address(0)`): el front muestra de qué store sale cada credencial ("KUMPLY real" o "demo").

## Quién hace qué (≈ 9:00-21:00)
| persona | tareas | horas |
|---|---|---|
| **P1 Contratos** | `SenaEscrow` + tests Foundry (3 salidas, antiautopago, plazos, árbitro ausente) → 6 h. Script de despliegue en Fuji → 1 h. Script de siembra: 9 huéspedes demo completan ciclos cortos → 1,5 h | 8,5 |
| **P2 Credenciales y datos** | 9:00: preguntas a KUMPLY. KYC 2 real de 2 del equipo (dueño y Andrea) → 1-2 h [SIN VERIFICAR: cuánto tarda]. AVAX de faucet para 12 billeteras. Plan B: desplegar el store propio y emitir a 9 huéspedes + árbitro KYB → 2 h. Módulo de lectura `isPersonAtLeast`/`isBusiness` → 1,5 h. Después, ayuda a P3 | 8 |
| **P3 Front** | Next o Vite + viem/wagmi, de cero. Listado rojo/ámbar/verde, ficha con contador, pagar seña (`approve` + `reservar`), barra de estado, botones de check-in y reclamo, panel del árbitro, `TxLink` → 8 h. Pulido en mobile → 1 h | 9 |
| **P4 Producto y pitch** | Publicación roja falsa (captura tipo Facebook, sin marcas reales), guion del wow, 5 slides, respuestas "¿y Alohar?" y "¿billeteras o personas?" → 4 h. QA de punta a punta en Fuji → 2 h. **Video de respaldo a las 17:00** → 1 h. Ensayos → 2 h | 9 |

## Qué se reutiliza (guía; rutas desde `/home/juan-chaparro/hackatwin-noche/ideas/refs/`)
- `hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol`: `_transition` l. 211, `withdraw` l. 193, saldo antes/después l. 126-128. **Ojo:** `settle` (l. 177) y `refund` (l. 162) tienen el plazo al revés de lo que se necesita acá.
- `…/src/libraries/PaymentStateLib.sol` l. 11-21: tabla de transiciones en bits (sumar `EnDisputa`, `Liberada` y `Devuelta`).
- `…/src/RevenueSplitter.sol` `_split` l. 56 (se copian 2 líneas, sin el contrato).
- `…/script/DeployFuji.s.sol` como modelo del despliegue; `…/test/utils/MockERC20.sol` para el token.
- `…/packages/ui/src/atoms/TxLink.tsx` y `Badge.tsx` para el comprobante y los sellos.
- `Kumply/contracts/contracts/AttestationStore.sol` `verify` l. 224; `Kumply/packages/sdk/src/client.ts` l. 222/236; `tier.ts` l. 27; ABI en `sdk/src/contracts.ts` (si `@kumply/sdk` no está en npm [SIN VERIFICAR], se lee `verify` directo con viem).
- `Kumply/contracts/scripts/issue-attestation-batch.ts` y `deploy.ts` como guía del plan B.

**De cero:** `SenaEscrow`, sus tests, el script de siembra, todo el front y la publicación roja.

## Plan B (si falla lo más riesgoso)
- **No sale el KYC 2 real en Fuji:** todo el mundo pasa al store propio (opción B de VERIFICACION, mejor que `WorkshopKYA`, que rompe el SDK). En el pitch se dice: "credenciales emitidas por nosotros como verificador de prueba; en producción, KUMPLY".
- **No hay KYB 4 para el árbitro (lo más probable):** árbitro KYB del store propio, declarado. Las personas siguen siendo reales si salió el punto anterior.
- **El "9 de 9" no puede ser real:** se siembra y se dice "historial de demo". El único dato vivo es el 10: Andrea real.
- **Falla Fuji o el front a última hora:** video de las 17:00 + links de Snowtrace de las tx ya hechas. Si se cae el árbitro, solo se muestra el camino feliz + antiautopago.

## 3 preguntas de sí o no para la mañana
1. ¿El KYC 2 de KUMPLY con Sumsub en Fuji aprueba a una persona del equipo en menos de 1 hora?
2. ¿KUMPLY impide que la misma persona verifique dos billeteras distintas? (Si dice que sí, el contador de "huéspedes distintos" cuenta personas, no billeteras.)
3. ¿KUMPLY nos emite a mano un nivel 4 (árbitro KYB) en su `AttestationStore` de Fuji con `issue-attestation.ts`?

## Ataque final
*(Abogado del diablo 1, ronda 3)*
- **¿Base de datos común?** Sí, dentro de una plataforma: Alohar libera al dueño 72 h después del check-in ([iProfesional, 7/1/2025](https://www.iprofesional.com/realestate/420145-con-que-app-puedo-alquilar-temporal-en-pesos-y-cuotas-sin-interes-en-vacaciones)) y Airbnb ~24 h ([Airbnb](https://es-l.airbnb.com/resources/hosting-homes/a/how-you-get-paid-for-hosting-20)). Lo que se pierde es que no haga falta un custodio con licencia y que el historial del dueño sirva fuera de una plataforma. Pero el "9 de 9" de la demo está sembrado, así que ese historial no se puede probar el sábado.
- **¿Ya existe?** Para tratos de Facebook o WhatsApp entre particulares no encontré ningún escrow argentino (búsqueda del 7/11) [SIN VERIFICAR: que no exista]. Los avisos de Mar del Plata 2026 ya cobran la reserva por Mercado Pago, sin retención ([Roomix](https://www.roomix.ai/propiedad/departamento-1-ambientes-centro-3e1c781b), según el resumen del buscador [SIN VERIFICAR]). El dueño honesto ya tiene un canal que conoce.
- **¿Billetera cripto?** Andrea, quizás con Belo. El dueño necesita KYC 2, ARGt y una rampa para volver a pesos, y el estafador dice "transferime". El sistema solo protege a quien ya desconfía y se niega a transferir.
- **¿Fuji en 12 h?** El contrato sí. Lo más riesgoso es el front: 9 h de P3 hechas de cero, con 8 funciones, panel de árbitro y 12 billeteras. Además, el KYC 2 "real" quizás no sea real: el LITEPAPER (l. 225) pone "Sumsub production activated, first real KYC on-chain" como hito M2 a futuro. Entonces el de Fuji sería el sandbox de Sumsub [SIN VERIFICAR].
- **¿ARGt y KUMPLY?** ARGt encaja (seña en pesos, un sábado), aunque en Fuji es un token propio. KUMPLY es secundario, y el archivo lo admite: "la protección viene del escrow". El contador cuenta billeteras, no personas. El árbitro y la inmobiliaria KYB 4 salen del store propio: el KYB depende de un "pending Enterprise quote" de Sumsub (LITEPAPER l. 225).
- **Debilidad más grave:** lo que protege es la retención, que ya existe en plataformas. Lo que KUMPLY agrega (el contador) es sembrado y cuenta billeteras, no personas.
