# Idea: Fiado – crédito en pesos para el almacén, que se repaga solo con cada venta

> *"El almacenero te fía a vos. ¿Quién le fía al almacenero?"*

Propuesta para comparar con **Mandato** (la decisión actual en `docs/ideas/final/DECISION_TRACKS.md`). Sigue la plantilla de `docs/BRAINSTORMING.md`, con un análisis por track al final.

## La idea en una línea

El almacén cobra con QR en **ARGt**. Cada pago pasa por un contrato que, en la misma transacción, le manda el 90 % al almacén y el 10 % al repago de su crédito. La línea de crédito la fija un **agente de IA verificado (KYA)** a partir del historial de cobros on-chain del almacén. El préstamo se repaga solo mientras vende.

## Plantilla

- **Problema:**
  - El almacén de barrio no tiene acceso a crédito bancario para capital de trabajo (reponer mercadería, aprovechar una oferta del mayorista).
  - Hoy le presta quien es dueño de sus datos de cobro, por ejemplo Mercado Pago con retención sobre las ventas [SIN VERIFICAR: condiciones y tasas 2026], y queda atado a esa plataforma.
  - Su historial de "buen pagador" no lo puede llevar a ningún otro lado.
- **Usuario:** Rubén, almacén en Lanús. Vende ~$300.000 por semana y necesita $500.000 el jueves para la oferta del mayorista.
- **Solución:**
  - El historial de cobros vive on-chain y es portable.
  - Cualquier prestamista (no solo la billetera donde cobra) puede enchufar su agente de scoring y prestarle en pesos.
  - El repago no depende de que Rubén "se acuerde": lo hace la propia vía de cobro.
- **Demo (lo que se ve a las 18:00):**
  1. Rubén pide crédito → el agente lee sus cobros on-chain y responde en lenguaje natural: *"Vendés ~$300.000/semana con baja variación: te apruebo $500.000, repago 10 % de cada venta"* → tx `setCreditLine`.
  2. Un agente **sin** verificación KYA intenta fijarle una línea → **rojo**, el contrato lo rechaza.
  3. Rubén retira el crédito → ARGt en su billetera, sin pagar gas.
  4. Un cliente escanea el QR y paga $10.000 en ARGt → Snowtrace: Rubén recibe $9.000, la deuda baja $1.000 en vivo (finalidad < 1 s).
  5. Un comercio sin KYB intenta pedir crédito → **rojo**.
- **On-chain (por qué hace falta la cadena):**
  - **El repago es parte del riel de pago:** el split lo hace el contrato en la misma tx del cobro. No hay un cobrador ni una plataforma que pueda cambiar la regla.
  - **Historial público y portable:** cualquier prestamista lee los mismos eventos `Sale`, sin pedirle permiso a una plataforma.
  - **Quién puede prestar y quién puede pedir lo dice KUMPLY on-chain:** agentes KYA para fijar líneas, comercios KYB para pedir.
- **Riesgo:** ver la sección de riesgos más abajo.

## Por qué tiene que ser en pesos (el argumento para Twin)

- **Rubén vende en pesos.** Si el crédito fuera en USDT, cada devaluación le agranda la deuda medida en lo que vende: tendría riesgo cambiario en un préstamo de capital de trabajo.
- **Con ARGt la deuda y las ventas están en la misma moneda**, y el repago como % de la venta funciona sin conversión.
- Responde al criterio **Idea** ("solo posible con moneda local on-chain, token como núcleo"): con USDT el producto sería peor para el usuario, no igual.
- **Encaja con el foco declarado de Twin: mercados de crédito en moneda local.**
  - Vaults de Morpho por moneda, curadas por DAMM Capital (BA) con precios de belo vía oráculos DIA.
  - Fuente: diadata.org/blog/post/twin-finance-damm-capital-latin-american-currencies-onchain
  - Roadmap: el pool de Fiado se fondea desde la vault ARGt Prime de Morpho.
- Antecedentes: en Solana Cypherpunk ganaron Yumi (BNPL on-chain, 1.º DeFi) y Hobba (préstamos que se repagan solos).
  - Fuente: blog.colosseum.com/announcing-the-winners-of-the-solana-cypherpunk-hackathon/

## Diferencia con las ideas descartadas de la ronda 1

| Idea descartada | Por qué se cayó | Por qué Fiado es distinto |
|---|---|---|
| s3 Libreta del almacén (22) | Se reemplaza con una planilla; Treinta ya lo hace | Fiado no es un registro: mueve plata y aplica el repago en el pago. Una planilla no retiene el 10 % de una venta |
| g2 Legajo de buen pagador (29) | On-chain expone la cartera del mayorista | Acá se expone el historial de **ventas del propio almacén**, que lo comparte a cambio de crédito. Sigue siendo un riesgo de privacidad (ver riesgos) |

## Cómo cumple cada track

### Twin (Stablecoins)
| Criterio | Cómo lo cubre |
|---|---|
| Idea | Crédito y repago en ARGt; con USDT el almacén carga riesgo cambiario (ver arriba) |
| Problema | Almacén sin crédito, atado a la plataforma que le cobra |
| Negocio | Fee de originación por crédito, compartido con el agente prestamista que lo originó |
| Pitch | Demo: pago con QR → split en vivo → deuda que baja |

Requisito: tx real con ARGt. **ARGt existe en Avalanche C-Chain mainnet**, lo verifiqué on-chain hoy a las 9:50:
- Contrato: `0x2E4e93eCA2E16E4989b894e188B7F7fC0175703B`.
- Datos: `symbol()` = ARGt, `name()` = "Argentine Peso token", 18 decimales.
- Ojo: `totalSupply` es **1.770 ARGt** y el bridge no llega a Avalanche. Hay que pedirles a los mentores de Twin ARGt **en Avalanche**; si no, el deploy de mainnet va en Arbitrum.

### Avalanche (Blockchain)
| Criterio (pts) | Cómo lo cubre |
|---|---|
| Impacto (25) | Crédito para comercios chicos |
| Uso de Avalanche (25) | Finalidad < 1 s en el mostrador (el split y el repago confirmados mientras el cliente espera). Roadmap: L1 con validadores KYB para prestamistas regulados + ICM hacia la C-Chain |
| Técnico (20) | Un contrato chico, deployado y verificado en Fuji |
| Negocio (20) | Fee de originación; marketplace de agentes prestamistas |
| Presentación (10) | Demo rojo/verde + deuda bajando |
| **0xGasless (+10 core)** | Ni el cliente ni el almacén pagan gas: el cobro con QR y el retiro van patrocinados |
| **KUMPLY (+10 core)** | `isAgent` (tier 5) para `setCreditLine`: solo agentes de scoring con operador verificado pueden dar crédito (es el caso KYA que KUMPLY prioriza). `isBusiness` (tier 4) para pedir crédito. Se muestra una dirección que pasa y una bloqueada en cada caso |

## Contrato (borrador: `FiadoPool.sol`, ~150 líneas)

```
token: ARGt (Fuji: ARGtDemo / mainnet: ARGt real)
kumply: AttestationStore (Fuji 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD)

fund(amount)                                 // el prestamista deposita ARGt en el pool
setCreditLine(merchant, limit, repayBps)     // solo tier == 5 (agente KYA)
draw(amount)                                 // solo tier == 4 (comercio KYB), hasta su límite; cobra fee de originación
pay(merchant, amount, ref)                   // transferFrom del cliente; si hay deuda:
                                             //   repaid = min(debt, amount * repayBps / 10000)
                                             //   merchant recibe amount - repaid; el pool recibe repaid
event Sale(merchant, payer, amount, repaid, debtLeft)   // historial que lee el agente
event CreditLineSet(merchant, agent, limit, repayBps)
```

Notas técnicas (de `docs/ideas/ronda-3/VERIFICACION.md` y de la investigación de hoy):
- Chequear el tier **exacto** con `verify()` (`tier == 5`, `tier == 4`). No usar `hasTier` ni `ComplianceGate`, porque dejan pasar tiers más altos.
- **Con 0xGasless, KUMPLY tiene que atestar la smart account (`userOp.sender`), no la EOA dueña.**
- No llamar a `verify()` dentro del paymaster (ERC-7562 prohíbe TIMESTAMP). El gate del gas va en el backend y el gate de negocio en el contrato.
- KUMPLY no tiene un flujo automático para tier 5: hay que pedirle a su staff que ateste a mano. Plan B: un store propio declarado, igual que en las otras ideas.

## Agente de scoring

- Lee los eventos `Sale` del almacén.
- Calcula volumen semanal, variación y antigüedad, y propone `limit` y `repayBps` con reglas simples y explicables.
- El LLM redacta la explicación para Rubén; la decisión de cuánto prestar no la toma el LLM.
- Firma `setCreditLine` desde su smart account (0xGasless) atestada como tier 5.
- Para la demo, el historial se siembra con ~10 ventas en Fuji (y se dice que es sembrado).

## Negocio

- **Fee de originación** (ej. 2-4 % del crédito) [SIN VERIFICAR: precio]. Se reparte entre el protocolo y el agente prestamista que lo originó.
- **Marketplace:** distintos prestamistas (fintechs, SGR, vaults de Morpho) enchufan su agente KYA y compiten por prestarle al almacén con el mismo historial público.
- **Cómo hablarlo:** "crédito productivo para comercios". No vender "rendimiento en pesos" a nadie: la CNV frenó ARGt en marzo 2026 por las referencias a rendimiento y levantó la sanción en abril cuando se quitaron. Fuente: iproup.com/economia-digital/66852-cnv-levanta-la-sancion-contra-belo-y-twin-por-la-stablecoin-del-peso-argt
- **Validación (suma en los dos jurados):** en el almuerzo, hablar con 2-3 almacenes cerca de Digital House y grabar una frase de cada uno.

## Riesgos (dichos de frente)

1. **Mercado Pago ya presta con retención de ventas** [SIN VERIFICAR: condiciones 2026]. La diferencia es la portabilidad del historial y el marketplace abierto de prestamistas. Si el jurado no lo compra, la idea queda como "versión on-chain de algo que existe".
2. **Privacidad:** las ventas del almacén quedan públicas. Mitigación en el roadmap: eERC (ERC-20 cifrado de Avalanche) o una L1 privada. En la demo se dice de frente.
3. **El almacén puede esquivar el repago** cobrando fuera del contrato. Es igual que hoy con MP; el incentivo para no hacerlo es que el historial que construye es lo que le da más crédito.
4. **Hoy nadie paga en ARGt en un almacén.** Es un problema de adopción y de rampas (belo), no del producto.
5. **Mismas dependencias externas que Mandato:** tier 5/4 de KUMPLY a mano, API key de 0xGasless, ARGt en Avalanche de los mentores.

## Comparación honesta con Mandato

| | Fiado | Mandato |
|---|---|---|
| Twin: "token núcleo" | **Más fuerte**: con USDT el almacén carga riesgo cambiario | Más débil: ARGt es reemplazable (lo marcó el juez de ronda 3) |
| Twin: originalidad | Crédito = foco de Twin; menos equipos lo van a hacer en moneda local | Es el disparador #1 de Twin: varios equipos van a hacer lo mismo |
| Avalanche: KUMPLY KYA | Natural pero menos obvio (agente que **da** crédito) | Muy natural (agente que **paga**) |
| Wow de demo | Deuda que baja con cada venta | Agente engañado que el contrato frena |
| Riesgo técnico | MEDIO-BAJO: un contrato, sin servidor 402 ni ERC-8004 | MEDIO (al borde de ALTO según VERIFICACION) |

## Reparto sugerido (si se elige)

- **P1:** `FiadoPool.sol` + tests + deploy verificado en Fuji (verde/rojo a las 12:30).
- **P2:** agente de scoring + smart account 0xGasless + pedido de tiers a KUMPLY.
- **P3:** app de Rubén (deuda, crédito, historial) + pantalla de pago con QR del cliente.
- **P4:** pedidos a sponsors, deploy en mainnet con tx ARGt, entrevistas en almacenes, README, pitch y video a las 17:00.

**Corte:** si a las 13:00 no hay verde/rojo de `setCreditLine` en Fuji, se vuelve al plan vigente.
