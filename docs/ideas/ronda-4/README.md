# Ronda 4: 10 ideas investigadas en paralelo + Dos agentes

Hecha por Gabosawn el 7/11 entre las 10:20 y las 10:55. Diez investigaciones en paralelo, cada una con un ángulo distinto, con el contexto compartido de `CONTEXTO.md` (reglas de los 3 tracks sacadas de los PDFs, features de cada partner, restricción de la CNV y las 36 ideas anteriores para no repetir). Cada archivo tiene: plantilla del equipo, precedentes en otras competencias con URL, feature de partner que aprovecha, qué suma en cada track, factibilidad en 7 h, puntaje honesto, comparación con las ideas existentes y fuentes. Lo no confirmado está marcado [SIN VERIFICAR].

## Archivos

| Archivo | Idea | Grupo |
|---|---|---|
| `00-dos-agentes.md` | Bóveda en ARGt + Financiero y Abogado, con el chequeo de reglas de los 3 tracks | Propuesta de Gabosawn |
| `01-cambio-directo.md` | Cambio Directo: router ARGt→USDT0→BRAt por Curve + tasa fija 7 días | A: distinta de todo |
| `02-caja-a-la-vista.md` | Caja a la Vista: tesorería de consorcio/club/pasanaku con quórum KYC | A |
| `03-dia-perdido.md` | Día Perdido: seguro paramétrico de lluvia para feriantes | A |
| `04-liquidacion-cifrada.md` | Liquidación Cifrada: honorarios con montos cifrados (eERC) y auditor | B: feature de partner poco usada |
| `05-con-referencias.md` | Con Referencias: reputación ERC-8004 de agentes con reseñas que cuestan un DNI | B |
| `06-escalera.md` | Escalera: onboarding "tu primera vez" con tiers graduados de KUMPLY | B |
| `07-cambio-cerrado.md` | Cambio Cerrado: pyme fija hoy el costo en pesos de una factura en reales (+ patrones de ganadores de hackatones) | C: abierta |
| `08-carta-poder.md` | Carta Poder: poder firmado off-chain + presupuesto firmado por el proveedor + recibo (+ primitivas del estado del arte) | C |
| `09-giro-con-destino.md` | Giro con Destino: remesa como sobre etiquetado en BOLt/PERt/COLt | C |
| `10-boton-de-baja.md` | Botón de Baja: débito automático en ARGt con baja ejecutable por el contrato | C |

Hice 10 investigaciones en paralelo, cada una con un ángulo distinto: 3 ideas fuera de los moldes "agente con correa" y "escrow con KYC" (grupo A), 3 sobre features de partners que nadie usa (grupo B) y 4 abiertas (grupo C). Cada una con precedentes de hackatones (URL), feature de partner, qué suma por track, factibilidad en 7 h y puntaje. Recalibré los puntajes con la misma escala del [ranking anterior](https://github.com/dav1dchaparro/hackatwin/pull/3#issuecomment-6707354701): los agentes inflaban "Uso de Avalanche" (14-17/25 a contratos que corren igual en cualquier EVM).

## Ranking (Avalanche /120 recalibrado; entre paréntesis el puntaje original de la investigación)

| # | Idea | Grupo | Qué es en una frase | Avalanche | Twin /20 | Belo /100 | Riesgo 7 h |
|---|---|---|---|---|---|---|---|
| 1 | **Botón de Baja** | C | Débito automático en ARGt donde la baja la aplica el contrato en un clic; comercio KYB, cuota reservada, agente KYA dispara el cobro | **79** (83) | 13 | 69 | MEDIO |
| 2 | **Día Perdido** | A | Seguro de lluvia en ARGt para feriantes: oráculo lee la lluvia y el contrato paga solo; KYC = una póliza por persona | **79** (86) | 14 | 68 | MEDIO |
| 3 | **Caja a la Vista** | A | Tesorería de consorcio/club/pasanaku: N-de-M vecinos con KYC aprueban, proveedor KYB, agente propone pero nunca paga | **79** (84) | 14 | 62 | MEDIO |
| 4 | **Cambio Cerrado** | C | Pyme cierra hoy el costo en pesos de una factura en reales: compra BRAt y los traba con fecha a nombre del proveedor KYB | **79** (83) | 15 | 65 | MEDIO sobre Tesorero |
| 5 | **Carta Poder** | C | Poder firmado off-chain (EIP-712) + presupuesto firmado por el proveedor + recibo que une los dos; el contrato verifica las tres firmas | **79** (81) | 15 | 66 | MEDIO sobre Tesorero |
| 6 | **Con Referencias** | B | Mostrador de agentes que cobran por trámite; cada reseña la firma un cliente con KYC que pagó ("una reseña cuesta un DNI"), auditor KYA | 75 (83) | 11 | 50 | MEDIO/ALTO |
| 7 | **Giro con Destino** | C | Remesa como sobre on-chain en BOLt con partes etiquetadas (luz, colegio, libre), cambio fijado 24 h, reclamo con email + DNI | 74 (77) | 15 | **70** | ALTO |
| 8 | **Escalera** | B | Billetera con login por email donde el tier de KUMPLY abre funciones de a poco; tutor de IA explica y dispara el KYC justo cuando falta | 72 (79) | 11 | 69 | ALTO |
| 9 | **Liquidación Cifrada** | B | Honorarios a monotributistas en ARGt con montos cifrados (eERC) y llave de auditor para el contador | 69 (75) | 9 | 45 | **ALTO** |
| 10 | **Cambio Directo** | A | Router ARGt→USDT0→BRAt por Curve en una tx atómica + contrato de tasa fija 7 días | 68 (68) | 15 | 60 | ALTO |

Referencia: **Tesorero con Correa 85 · Fiado 82 · Mandato 79**.

## Veredicto

**Ninguna de las 10 le gana a Tesorero con Correa en Avalanche hoy.** Las cinco de arriba empatan en 79 por la misma razón: buen problema, contrato chico, pero nada que corra solo en Avalanche, y las mismas tres integraciones de terceros (atestaciones a mano de KUMPLY, paymaster, ARGt de mentores). Lo que Tesorero tiene y ellas no: plan escrito, voto del panel y ya se está construyendo.

Donde sí ganan es fuera de Avalanche:
- **Twin:** Cambio Cerrado / Cambio Directo son las únicas que tocan el disparador FX, que nadie del repo usa. Cambio Directo tiene una ventaja única: **tx real en Arbitrum sin pedirle tokens a nadie** (US$30 de USDT0 alcanzan). Pero los pools de Curve tienen TVL de US$5-15k: la tx tiene que ser de US$10-100.
- **Belo:** Giro con Destino (consigna 1) y Escalera (consigna 5) son las mejores del repo entero para Belo; ninguna de las 36 anteriores apuntaba a esas consignas.

## Lo que vale aunque no cambiemos de idea

**Módulos que se suman a Tesorero sin tocar el núcleo** (1-2 h cada uno, ordenados por lo que suman al puntaje):
1. **Carta Poder:** que el proveedor firme el presupuesto y el contrato emita un recibo que une poder → presupuesto → tx. Responde "¿quién tiene la culpa si el agente paga mal?" (sección 2.4 de AP2 de Google). Sube Negocio y Presentación.
2. **Cambio Cerrado:** "el Tesorero también paga en reales": una factura brasileña, swap a BRAt, trabado con fecha. Abre el track Twin por el disparador 3.
3. **Botón de Baja:** el mismo contrato para que la pyme **cobre** sus propias cuotas recurrentes.

**Hallazgos técnicos verificados hoy** (sirven para cualquier idea):
- Los 3 registros canónicos de **ERC-8004 ya están en Fuji** (Identity `0x8004A818BFB912233c491871b3d84c89A494BD9e`, Reputation `0x8004B663056A597Dffe9eCcC1965A193B7388713`, Validation `0x8004Cb1BF31DAf7788923b405b754f57acEB4272`, v2.0.0). Ojo: `client.identity.link()` de 0xGasless mintea en su registro propio, no en el canónico; registrar con `register(string)` como hace el workshop de Team1.
- `0xgasless-mcp` 1.0.5 es de junio 2025 y no soporta Fuji: no usarlo. `@0xgasless/agentkit` 1.0.1 sí soporta Fuji.
- **Superfluid está en Fuji** (host `0x85Fe79b998509B77BF10A8BD4001D58475D29386`), pero su buffer no da cuota garantizada.
- **eERC es usable hoy en Fuji** con receta en español (`eerc-backend-converter`, artefactos ZK ya commiteados), pero la cuenta debe ser EOA: 0xGasless solo llega a bonus básico. Ya existe VeilPay (nómina cifrada en Fuji, jul-2026).
- **Chainlink Functions en Fuji:** router `0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0`, DON `fun-avalanche-fuji-1`.
- **API de belo** (`api.belo.app/public/price`) cotiza BRAt/ARS 294/301 (spread 2,5 %), USDT/BOLt ≈ 11,7-12,1 vs oficial boliviano 6,96. No hay pares cruzados: todo pasa por ARS.
- **BOLt, BRAt y el resto no existen en Avalanche** (docs de Twin: 10 tokens solo en Base/Polygon/Arbitrum/Ethereum). Solo ARGt está en C-Chain, con supply 1.770.
- Pools de Curve en Arbitrum: fee 0,30 %, ARGt/USDT0 ≈ US$15k de TVL. `get_dy` medido hoy: US$100 → +0,6 % sobre el ask de belo; US$1.000 → +2 %; US$5.000 → +8 %.
- La **SSN sacó la Res. 315/2026** (jul-2026) regulando seguros paramétricos.
