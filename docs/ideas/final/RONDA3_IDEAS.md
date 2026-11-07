# Ronda 3: ideas nuevas (Blockchain Track, Fuji)

**Ganadora del duelo: e1 "Ronda de Compensación" (89/120, 3 de 3 votos del jurado, 15 pts).**
**Destrona a Tesorero con Correa (d4, 82/120): le gana por 7 puntos y quedó 1.ª en los 3 rankings, con d4 2.ª en los 3.**
**Por qué:** es la única donde la blockchain no se reemplaza por una base de datos (cancelación atómica de N deudas entre pymes que no se tienen confianza), el KYA es central (un agente cancela deudas de terceros solo porque está atestado) y mantiene el combo +20 natural de d4, con más impacto y más wow.

## Tabla (ideas nuevas, ordenadas por total)

| # | id | Nombre | Frase | Imp/25 | Ava/25 | Fact/20 | Neg/20 | Pres/10 | Jurado/100 | Bonus/20 | Total/120 | Oblig. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | e1 | Ronda de Compensación | Un agente verificado encuentra los círculos de deuda entre pymes KYB y los cancela en una sola tx: $36 M sin mover un peso. | 21 | 11 | 14 | 16 | 9 | 71 | 18 | **89** | Sí |
| 2 | e2 | Candado de Crédito | El agente de la fintech tiene que pasar por tu candado on-chain; si está puesto, el préstamo no sale sin tu OK desde el mail. | 22 | 9 | 15 | 12 | 9 | 67 | 18 | **85** | Sí |
| 3 | h1 | Alias Quemado | Pegás el alias y ves cuántas personas verificadas lo denunciaron, sin saber quién ni publicar el alias en claro. | 23 | 8 | 17 | 12 | 8 | 68 | 14 | **82** | Sí |
| 4 | f1 | Martillo Final | Remate de hacienda donde cada puja tiene la plata trabada y queda firme en menos de 1 s: no hay cheque que rebote. | 13 | 18 | 14 | 12 | 9 | 66 | 16 | **82** | Sí |
| 5 | e4 | Envío con Testigo | La plata de la compra queda trabada y la libera el agente verificado del correo al confirmar la entrega. | 22 | 8 | 16 | 11 | 7 | 64 | 18 | **82** | Sí |
| 6 | g4 | Kilo Pagado | La balanza municipal es un agente verificado: cada kilo de la cooperativa se paga al toque; una balanza trucha no cobra. | 15 | 11 | 18 | 10 | 8 | 62 | 20 | **82** | Sí |
| 7 | f3 | Carga Tomada | El primer transportista verificado que acepta la carga se la queda en menos de 1 s; el camión fantasma ni puede aceptar. | 14 | 15 | 16 | 11 | 8 | 64 | 17 | **81** | Sí |
| 8 | g3 | Sesión Confirmada | La obra social paga solo las sesiones que la familia confirmó desde el celular: las fantasma no se cobran. | 16 | 9 | 15 | 14 | 7 | 61 | 16 | **77** | Sí |
| 9 | i4 | Garante de a Muchos | Cien inquilinos verificados ponen un fondo común que hace de garantía; si uno no paga, el agente le paga al dueño ese día. | 21 | 5 | 14 | 14 | 6 | 60 | 14 | **74** | Sí |
| 10 | g1 | Fila de Pago | El municipio paga a proveedores en el orden de certificación: la cola es un contrato y saltearla revierte. | 15 | 10 | 17 | 7 | 8 | 57 | 17 | **74** | Sí |
| 11 | e3 | Mesa de Quitas | Tu agente negocia de noche con los agentes de tus acreedores, paga y te deja un libre deuda on-chain. | 19 | 7 | 9 | 15 | 5 | 55 | 19 | **74** | Sí, recortada |
| 12 | h2 | Sobre Cerrado | Agentes de proveedores verificados ofertan en sobre sellado on-chain; ni la compradora espía antes del cierre. | 14 | 11 | 11 | 10 | 6 | 52 | 19 | **71** | Sí (plan B) |
| 13 | h3 | Legajo con Marca de Agua | Tu DNI y recibos solo los ve una empresa verificada con permiso; cada vista queda registrada y lo revocás en 1 s. | 19 | 9 | 10 | 10 | 7 | 55 | 12 | **67** | Sí |
| 14 | f4 | Círculo a la Vista | Plan de ahorro donde las cuotas las tiene un contrato y el sorteo y la licitación son on-chain y a la vista. | 11 | 13 | 9 | 9 | 5 | 47 | 13 | **60** | Sí, recortada |
| 15 | h4 | Sueldo sin Vidriera | La pyme paga sueldos a direcciones stealth: nadie ve cuánto gana cada empleado, salvo él y el auditor. | 8 | 12 | 6 | 7 | 3 | 36 | 11 | **47** | Sí, riesgo alto |

Empates en 82: se ordenan por puntaje de jurado (h1 68 > f1 66 > e4 64 > g4 62).

## Top 3 nuevo

### 1. e1 · Ronda de Compensación (89)
**Problema.** La cadena de pagos pyme está cortada: en el 2.º trim. 2026 el 24 % de las industrias pyme tuvo un vencimiento impago y el 62 % cobra a plazos más largos (DOLORES #13), con cheques rechazados en récord: 119.285 en dic-2025 (#12). Muchas deudas son circulares, pero nadie ve el circuito. Cuánta deuda forma ciclos en Argentina: [SIN VERIFICAR].
**Cómo funciona.** Cada factura queda on-chain confirmada por el deudor (login con email). Solo cargan y confirman empresas isBusiness. Un agente tier 5 (por ejemplo, el de la cámara) busca ciclos off-chain y propone el que más cancela respetando topes. El contrato `Ronda` solo verifica (aristas confirmadas, nodos KYB, proponente isAgent) y descuenta el mínimo del ciclo en todas las aristas en una sola tx.
**Demo.** 4 pymes: $12 M, $11 M, $10 M, $9 M. Bot sin KYA → `NOT_AGENT`. Pyme sin KYB → `NOT_BUSINESS`. Agente verificado (gas del paymaster conjunto) → un hash, "Deuda cancelada $36 M · Plata movida $0", finalidad medida en pantalla [SIN VERIFICAR].
**Sponsors.** KUMPLY +10 (KYA real + KYB por nodo), 0xGasless +10 combo natural (el agente tier 5 es el que más tx manda).
**Negocio.** Fee de 0,1-0,3 % sobre lo compensado [SIN VERIFICAR], vendido a cámaras, parques industriales y estudios contables. Efecto red: más nodos, más ciclos.
**Punto flojo.** Uso de Avalanche 11/25 y ciclos sembrados. El jurado propone cómo levantarlo (ver duelo).

### 2. e2 · Candado de Crédito (85)
**Problema.** Préstamos sacados con el celular robado: hay un caso de 3 préstamos por $1.453.000 sin devolución (DOLORES #6), el 13,5 % de los reportes a la UFECI es usurpación de identidad (#5) y la mora en billeteras está en 29,6 % (#9).
**Cómo funciona.** Silvia (tier 2, email) activa su candado. El agente de originación de la fintech (tier 5, dueño tier 4) llama a `requestDisbursement`; si hay candado, queda pendiente y ella aprueba o rechaza desde el mail. Cada intento queda como prueba con hora y fintech.
**Demo.** Scraper sin KYA: revierte. Fintech con dueño sin KYB: rojo. FinPrueba pide $1,4 M: pendiente → "No fui yo" sin gas → Snowtrace muestra el intento bloqueado.
**Sponsors.** KUMPLY con 3 tiers en un flujo; combo 0xGasless por las consultas de los agentes.
**Punto flojo.** Avalanche 9/25 (podría ser una API de consentimiento), el problema del huevo y la gallina entre fintechs, y el patrocinio de tx de personas tier 2: [SIN VERIFICAR].

### 3. h1 · Alias Quemado (82)
**Problema.** La plata de las estafas cae en alias de cuentas mula; el 63 % de los reportes a la UFECI es fraude en línea (#5). Las denuncias quedan en grupos de Facebook, inventables o borrables.
**Cómo funciona.** `AliasRegistry`: `reportar(hashAlias, hashEvidencia)` solo para personas tier >= 1, una por persona y por alias. Guarda el hash, nunca el alias en claro. La consulta es una view gratis. Los agentes antifraude tier 5 reportan en lote con el paymaster conjunto.
**Demo.** Marta pega el alias: rojo, 4 denuncias verificadas. Dirección sin KUMPLY intenta denunciar: rechazada en el explorer. Agente tier 5 sube 3 denuncias patrocinadas.
**Sponsors.** KUMPLY es el núcleo (impide denuncias en masa). Bonus 14: el core gasless de personas depende de un patrocinio [SIN VERIFICAR].
**Punto flojo.** El contrato más simple del lote (Fact 17), pero con poco uso de Avalanche (8/25), nadie claro que pague y riesgo de difamación y de la Ley 25.326.

## Duelo: resultado

Puntos (5-4-3-2-1): **e1 15** · d4 12 · e2 8 · b1 6 · h1 4. Votos a ganadora: e1 3/3.

| Jurado | Ranking | Razón | Cambio clave que pide |
|---|---|---|---|
| 1 | e1, d4, b1, e2, h1 | La única donde la cadena no se reemplaza por una base: cancelación atómica entre pymes sin confianza, sin ARGt real ni riesgo PSAV. d4 funciona seguro, pero "pagos de agente con política" lo van a llevar varios equipos. e2 y h1 usan poco Avalanche. | Liquidación neta multilateral en la misma tx: cancelar ciclos y pagar el residuo en mock ARGt desde allowances con tope. "Deuda bruta $42 M → plata movida $X M" con un hash. El residuo no debería dar cero. |
| 2 | e1, d4, e2, b1, h1 | "$36 M cancelados, $0 movidos" ataca la cadena de pagos cortada; tiene quien paga y distribuye (la cámara trae 50-200 pymes [SIN VERIFICAR]) y un efecto red defendible. d4 está en un mercado lleno, e2 tiene el huevo y la gallina, b1 carga PSAV/CNV y h1 casi no tiene quién pague. | Responder el arranque en frío: importar facturas desde CSV (FCE/ARCA o el sistema contable, formato [SIN VERIFICAR]), confirmación en un clic, y un grafo de 20-30 pymes con ruido donde el agente encuentra solo el ciclo de 4. |
| 3 | e1, d4, e2, h1, b1 | El caso KYA más fuerte: el agente tier 5 cancela deudas ajenas solo porque está atestado, coincide con el único lane del paymaster conjunto y muestra dos bloqueos distintos. Le gana a d4 en impacto, wow y argumento de Avalanche. e2 y h1 dependen del patrocinio de personas [SIN VERIFICAR]. | Atar el agente a un dueño KYB on-chain: mapping agente → cámara tier 4; exigir isAgent && isBusiness(dueño) && cámara adherida. Tercer bloqueo `NOT_THEIR_CHAMBER` y respuesta a "quién responde si el agente cancela mal". |

**Para decidir:** si se cambia a e1, los tres cambios son compatibles. El que más suma es el del jurado 1, porque ataca Uso de Avalanche (11/25), el punto más flojo.
