# Aval — guion de pitch (3 min) y runbook de demo

**Track:** Twin Stablecoins · **Chain:** Arbitrum One · **Token:** ARGt
**Formato:** 3 min de pitch + 2 min de Q&A · **Demo day:** 19:00 · **Cierre de entrega:** 18:00

> Regla de oro: el pitch no explica el producto, cuenta lo que el producto cambia para una persona. Una sola historia (Rosa), un solo número que se mueve (90% → 45%), una sola transacción que se ve.

---

## 1. Guion (3:00)

### [0:00–0:25] La persona

> "Rosa tiene 44 años y un kiosco en La Matanza. Es monotributista: no tiene recibo de sueldo, no tiene propiedad. Necesita tres millones de pesos para mercadería. El banco le pidió una garantía con propiedad. No tiene. Una fintech le ofrece 90% de interés."

*En pantalla: foto de kiosco + los tres números (3.000.000 / 0% garantía / 90% TNA).*

### [0:25–0:50] La idea

> "Pero Rosa sí tiene garantía: su cooperativa. Una SGR, una sociedad de garantía recíproca, con un fondo de riesgo que avala uno de cada tres créditos bancarios a pymes en Argentina. Lo que no tiene es cómo probarlo. Hoy el aval es un papel: tarda semanas, ningún prestamista de otra provincia lo puede verificar, y no se puede vender ni reasegurar."

*En pantalla: el papel → el certificado on-chain.*

### [0:50–2:00] La demo

> "Rosa pide tres millones en ARGt, en 12 cuotas. Su SGR suscribe un certificado de garantía por el 50% y lo respalda con el fondo de riesgo, en ARGt. El prestamista publicó su tarifa on-chain: 90% sin aval, 45% con aval. Miren la tasa: el contrato aplica esa tarifa y baja a 45% — 46,5% contando la comisión de la SGR. El prestamista fondea: la plata sale a la billetera de Rosa. Rosa paga la primera cuota: el contrato reparte solo — capital e interés al prestamista, comisión a la SGR — y un doceavo de la garantía vuelve al fondo, listo para avalar a otro. Si Rosa no paga, el fondo le paga al prestamista hasta el 50%, automáticamente. Y el certificado se puede ceder: la SGR vende el 30% a otra SGR en un clic, libera capital y baja concentración."

*En pantalla: SGR desk → certificado → lender → fund → repay → ceder.*

### [2:00–2:30] Por qué moneda local

> "Todo esto es en pesos. Si el fondo estuviera en dólares, la SGR estaría apostando al tipo de cambio contra sus propias garantías: una devaluación del 30% le mueve el ratio de cobertura. En ARGt, el activo y el pasivo están en la misma unidad. El token local no es un detalle: es lo que hace que el riesgo sea asegurable."

*En pantalla: dos columnas, USD vs ARGt.*

### [2:30–3:00] Negocio y cierre

> "Le vendemos la infraestructura a las SGR y mutuales que ya existen: SaaS más 15 puntos básicos del volumen garantizado. Desde junio, la resolución 94/2026 les exige blockchain para los contratos electrónicos de garantía. Ya no es una idea: es una obligación sin producto. El banco pide garantías. Nosotros las hacemos verificables."

*En pantalla: ~50 SGR · 15 bps · Res. 94/2026 · repo + hash.*

**Cierre alternativo (si el jurado es más emocional):**
> "Rosa no tenía garantía. Su cooperativa sí. Nosotros hicimos que valga."

---

## 2. Coreografía de la demo (90 segundos dentro del pitch)

| t | Pantalla | Acción | Lo que ve el jurado | Respaldo si falla |
|---|---|---|---|---|
| 0:50 | SGR desk | Abrir el pedido de Rosa; `legajo` vacío; slider de cobertura 0 → 50% | el problema en un número | captura en el deck |
| 1:00 | SGR desk | **Emitir certificado** → confirmar | asignación real de ARGt + hash | video pregrabado |
| 1:10 | Lender | El certificado aparece con **50%**; la tarifa que publicó el prestamista cambia **90% → 45%** | el momento de pricing, y de quién es el precio | captura |
| 1:25 | Lender | **Fondear** → confirmar | el ARGt llega a Rosa | video |
| 1:40 | Borrower | **Pagar cuota 1 de 12** → confirmar | waterfall: prestamista y SGR; el "disponible" del fondo sube 1/12 de la garantía | video |
| 1:55 | Certificado público | Estado `Repaid`; `legajo` sube | el registro que queda | captura |
| 2:05 | SGR desk | **Ceder 30%** a otra SGR → confirmar | el mercado secundario | slides |

**Reglas:**
- Pre-sembrar: 1 pedido, 1 certificado, 1 pool fondeado. En vivo: emitir el segundo certificado, fondear, pagar una cuota.
- Nunca correr el default en vivo sobre el camino feliz. Si se muestra, que sea un certificado aparte, ya marcado.
- Todos los hashes copiados al deck y al README **antes** del pitch.
- Video de respaldo grabado a las 16:00, reproducible sin internet.
- Anvil local como último recurso, dicho en voz alta ("demo local, mismos contratos").

---

## 3. Q&A (2 minutos) — respuestas de 20 segundos

| Pregunta | Respuesta |
|---|---|
| **¿Por qué no USDC?** | La garantía cubre una obligación en pesos y el fondo se contabiliza en pesos. Un fondo en dólares hace que la SGR apueste al tipo de cambio contra sus propias garantías. En ARGt queda un solo riesgo: crédito. Eso es lo que el aval precio. |
| **¿Esto no es un prestamista?** | No. No prestamos, no tomamos depósitos, no prometemos rendimiento. La SGR es la garante regulada; nosotros somos su infraestructura. |
| **¿Por qué una SGR usaría esto?** | La resolución 94/2026 le exige un soporte blockchain para los contratos de garantía. Además, el certificado lo verifica cualquier prestamista, el fondo se puede reasegurar y la cesión libera capital y baja concentración. |
| **¿Quién paga?** | La SGR paga SaaS + 15 bps del volumen; el tomador paga la comisión de garantía, embebida en la tasa; el comprador secundario paga una comisión por la cesión. |
| **¿Y si Rosa no paga?** | El fondo paga al prestamista hasta el 50%; la SGR conserva el derecho de cobro; el `legajo` lo registra y el próximo prestamista lo ve. |
| **¿Cómo evitan el fraude?** | La SGR suscribe con su información y el `legajo` on-chain; topes por tomador y por SGR; emisión con roles; hash de los documentos; auditoría e identidad post-hackathon. El `legajo` solo lo escriben préstamos de una SGR y un prestamista con rol, y nadie puede fondearse a sí mismo. |
| **¿Quién pone el 45%?** | El prestamista. Publica su tarifa on-chain (tasa sin aval y tasa con cobertura completa) y el contrato la aplica a la cobertura del certificado. Ni Rosa, ni la SGR, ni nosotros tipeamos una tasa. Con la comisión de la SGR, Rosa paga ~46,5% en total contra 90%. |
| **¿Un fondo en un token que no rinde, con 33% de inflación?** | La garantía se libera con cada cuota: en un préstamo de 12 meses el fondo tiene asignado en promedio ~54% de lo inicial, así que el mismo fondo avala casi el doble. Lo no asignado va a la tesorería de la SGR (vault de Morpho en ARGt), como cualquier SGR invierte hoy su fondo de riesgo. Es tesorería, no un producto de rendimiento para usuarios. |
| **¿Qué pasa con la CNV?** | Después del caso ARGt, evitamos deliberadamente todo lo que parezca producto de inversión: sin rendimiento, sin depósitos, sin fondos minoristas. Es una garantía, no un fondo. |
| **¿Por qué no Avalanche?** | El producto necesita la liquidez de ARGt, que está en Arbitrum. Una L1 permissionada para el consorcio de SGR es la arquitectura post-hackathon, no algo que se construya en 9 horas. Elegimos la cadena donde la garantía puede liquidar. |
| **¿Qué construyeron hoy?** | `AvalCore.sol` con el fondo, el certificado, el préstamo y el `legajo`; las tres vistas; el deploy y la transacción real en ARGt. El resto es boilerplate y el README lo dice. |
| **¿Cuál es el moat?** | El estándar del certificado (efecto de red entre SGR y prestamistas), el `legajo` (flujo informal que ningún bureau ve) y la integración regulatoria. |

---

## 4. Frases de una línea (para jurados y pasillos)

- "El aval es el instrumento que convierte el flujo de caja de una pyme en crédito bancario. Todavía vive en papel."
- "No somos un prestamista: somos la infraestructura que hace que un aval valga en cualquier lado."
- "Una de cada tres créditos bancarios a pymes en Argentina ya tiene aval de una SGR. Ninguna tiene certificado on-chain."
- "Desde junio de 2026, la ley argentina exige blockchain para los contratos de garantía. Nadie les dio el producto."
- "El fondo de riesgo en ARGt es lo que hace que la garantía sea *asegurable*: activo y pasivo en la misma moneda."
- "La SGR puede ceder el 30% del aval en un clic. Eso no existe ni en papel ni en ningún otro país de la región."

---

## 5. Runbook de entrega (17:00–18:00)

- [ ] Repo público; README con token, chain, direcciones, hash, "qué se construyó hoy".
- [ ] Contrato verificado en Arbiscan; link en el README y en el deck.
- [ ] Al menos una transacción real de ARGt ejecutada por el producto (hash + link).
- [ ] Video de respaldo subido y descargado localmente.
- [ ] Deck final en PDF además de PPTX (por si falla la fuente).
- [ ] Dos personas pueden presentar el pitch (por si una pierde la voz).
- [ ] Submit hecho a las 17:15, no a las 17:55.

---

## 6. Si el jurado pregunta por el track de Avalanche

Respuesta honesta y breve:
> "Evaluamos las dos opciones. El track de Twin premia que el token local sea el núcleo; el de Avalanche premia que la cadena sea el núcleo. Nuestro producto necesita ARGt y la liquidez de Arbitrum para que la garantía liquide. La versión Avalanche-native sería una L1 permissionada para el consorcio de SGR, con validadores KYC y privacidad: es la hoja de ruta, no el demo de hoy. Preferimos entregar una cosa que funcione a dos que no."

No hablar mal del otro track. No prometer que "en dos semanas" se migra.
