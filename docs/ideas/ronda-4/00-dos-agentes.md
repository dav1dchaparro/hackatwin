# Idea: Dos agentes, el Financiero y el Abogado (bóveda en ARGt con límites en el contrato)

Propuesta de Gabosawn en el PR #3 (comentarios del 7/11, 9:46 y 9:58) más el chequeo contra los PDFs de los 3 tracks (10:11). Tres partes: la bóveda, la extensión a dos agentes y el chequeo de reglas.

---

## Idea: Bóveda con agente de pagos con límites (ARGt en Avalanche)

- **Problema:** delegarle pagos a un agente de IA da miedo: si se equivoca o lo hackean, puede vaciar la cuenta. Además, los precios y servicios que pagamos están en pesos.
- **Solución:** una **bóveda en ARGt sobre Avalanche** que pertenece al usuario. El agente tiene una llave propia que solo puede mover fondos dentro de la política que **verifica el contrato**. Las reglas viven en el contrato, no en el agente.
- **Demo:** desde la web, el usuario configura topes y destinatarios. El agente le paga a una dirección habilitada (por ejemplo, "mandale a mi mamá") y el contrato lo deja pasar. Si intenta superar el tope o pagarle a otra dirección, el contrato lo rechaza o crea una solicitud que el usuario aprueba desde la web.
- **On-chain:**
  - Tope por transacción y por día. Por encima, el agente crea una solicitud pendiente que el usuario aprueba desde la web.
  - Lista blanca de destinatarios (mamá, tiendas, servicios). Cualquier otra dirección se rechaza.
  - Pagos recurrentes registrados en el contrato, que el agente solo puede ejecutar cuando venció el período.
  - Fondos apartados por objetivo de la wishlist, como sub-saldos.
- **IA (lo que el contrato no puede hacer):** detectar promos con Firecrawl, interpretar pedidos en lenguaje natural y explicar cada movimiento. Esto responde de antemano la pregunta obvia del jurado ("¿y si el agente se equivoca o lo hackean?"): el contrato acota el daño, no la buena conducta del modelo.

## Cómo cumple cada track
- **Twin:** encaja casi palabra por palabra con la consigna 1 ("pagos agénticos dentro de límites que define el usuario"). ARGt es el núcleo: sin moneda local en la cadena, el producto no existe. Precios de referencia con la API pública de belo. También coincide con la consigna 4 de belo, si las bases permiten postular a más de un track.
- **Avalanche (Blockchain Track):** contrato verificado e interfaz web (un bot de WhatsApp o Telegram **no** cumple el requisito de UI). El "por qué Avalanche" es la finalidad rápida y las comisiones bajas para los pagos frecuentes de un agente.
- **Bonus 0xGasless (+10):** el usuario y el agente operan sin tener AVAX, con paymaster, como parte del flujo principal.
- **Bonus KUMPLY (+10):** la bóveda solo acepta como agente una dirección que pase `isAgent()` (su caso de "agentes con operador verificado").

## Riesgos (resolver en la primera hora)
- **El más importante:** el PDF de Twin trunca la tabla de direcciones y no muestra la de Avalanche. Además, los pools y vaults están solo en Arbitrum, y el bridge de ARGt todavía no incluye Avalanche. Hay que preguntarles a los mentores si existe ARGt en Fuji o solo en mainnet. Si es solo mainnet, desplegamos en C-Chain mainnet con los montos mínimos que nos den y cumplimos ambos tracks con una sola transacción real.
- Confirmar si un mismo proyecto puede competir en Twin y en Blockchain a la vez.
- **El horario real es de 9:00 a 18:00.** Prioridad: primero contrato y web con una transacción real en ARGt; después 0xGasless; KUMPLY y la wishlist con scraping solo si sobra tiempo.
- Las compras siguen siendo simuladas: la "tienda" de la demo es una dirección de la lista blanca que recibe ARGt. Lo decimos con transparencia.

---

## Idea (extensión): dos agentes, el Financiero y el Abogado

Extiende la bóveda de [mi comentario anterior](https://github.com/dav1dchaparro/hackatwin/pull/3#issuecomment-6707124838). En vez de un solo agente que negocia, decide y paga, separamos la responsabilidad en **dos agentes expertos**, cada uno en lo suyo, los dos atados al mismo contrato.

- **Problema:** un solo agente que negocia, decide y paga es un punto único de fallo. Si lo engañan en la conversación, también mueve la plata. Y hoy un trato entre dos personas (un alquiler, una changa, una seña) queda en WhatsApp y no obliga a nadie.
- **Solución:** dos agentes con mandatos separados.
  - **El Financiero (tu amigo fiel):** es el de la bóveda. Solo mueve ARGt dentro de la política del contrato: tope por pago y por día, lista blanca de destinatarios, pagos recurrentes y solicitudes pendientes cuando se pasa del tope. No negocia nada.
  - **El Abogado / Conciliador:** pone las reglas y negocia. Habla con el agente de la otra parte, pacta precio, fechas y condiciones, y cuando hay acuerdo lo **deja escrito en la blockchain**: un contrato de alquiler, una seña, un servicio. No toca la plata. Lo que el Abogado firma, el Financiero lo paga, y solo si entra en los límites.
- **Demo:** Diego le dice a su agente "alquilá una casa en Santa Clara para enero, hasta $300.000". El Abogado negocia con el agente del dueño, acuerdan $280.000 con seña del 30 %, y los dos firman los mismos términos. El contrato de acuerdo se crea en Fuji. El Financiero paga la seña a la cuenta del acuerdo (queda "Retenida") y la libera en el check-in. Si el Abogado intenta cerrar un trato de $350.000, el contrato lo deja pendiente y Diego lo aprueba o lo veta desde la web.
- **On-chain:**
  - **Contrato modelo de acuerdos** (`Acuerdos.sol`): tipos de acuerdo predefinidos (alquiler con seña, servicio, seña a secas). El Abogado no escribe código ni despliega nada: **llena los parámetros** de un modelo que escribimos y auditamos nosotros una sola vez.
  - **Dos firmas sobre los mismos términos** (EIP-712): el acuerdo se crea solo si los dos agentes firmaron exactamente lo mismo.
  - **Mandato del Abogado:** monto máximo que puede comprometer, tipos de acuerdo permitidos, plazo máximo. Lo que se pasa queda pendiente para el usuario.
  - **Mandato del Financiero:** el que ya está en la bóveda. Las cuentas de los acuerdos firmados por el Abogado entran automáticamente a la lista blanca.
  - **KYA:** el Abogado solo negocia con agentes que pasan `isAgent()` de KUMPLY, con dueño verificado.
- **IA (lo que el contrato no puede hacer):** la negociación en lenguaje natural entre los dos agentes, interpretar lo que pide el usuario, armar los términos y explicarle a Diego qué firmó y por qué.
- **Por qué dos agentes y no uno:** cada uno es experto en una sola cosa y tiene un mandato chico. El Abogado **promete** dentro de su mandato y el Financiero **paga** dentro del suyo. Ninguno puede hacer daño solo, y al jurado se le explica en una frase: *"Al Abogado lo pueden chamuyar. Al Financiero no le importa: paga lo que está firmado, y solo hasta el tope."*
- **Riesgo:** el tiempo. Es la unión de Mandato (agente que paga con límites) y Seña Segura (alquiler con seña en un contrato), las dos primeras del TOP5, pero suma un segundo contrato, firmas dobles y la conversación entre agentes. Propuesta de recorte:
  1. **Núcleo (hoy, sí o sí):** la bóveda con el Financiero, como está en `DECISION_TRACKS.md`.
  2. **Si llegamos:** un solo tipo de acuerdo (alquiler con seña) y una negociación con **guion fijo** entre los dos agentes, sin negociación libre.
  3. **Si no llegamos:** va al pitch como "siguiente paso", con un diagrama de los dos agentes y el contrato en el medio.

---

## Reglas de los 3 tracks vs. la idea de los dos agentes

Leí los 3 PDFs (Avalanche, Twin y Belo). **La idea entra en los tres y no rompe ninguna regla escrita**, pero hay condiciones que hay que cumplir sí o sí y un detalle sobre cómo se demuestra la autonomía del agente.

## Avalanche (Blockchain Track): 6 obligatorios, 100 + 20 de bonus

| Requisito | Cómo quedamos |
|---|---|
| 1. Contrato en Avalanche (Fuji o mainnet), **verificado** en el explorer | ✅ Bóveda + Acuerdos en Fuji, verificados en Snowtrace. |
| 2. Interfaz web o mobile. **"A CLI or a bot does not satisfy"** | ⚠️ El panel de Diego tiene que ser una web real. La charla entre agentes va por atrás; si la demo es solo un Telegram, **no califica**. |
| 3. "Why Avalanche" documentado en el repo | ⚠️ Escribirlo en el README: finalidad rápida para pagos frecuentes del agente + KUMPLY y 0xGasless viven en Fuji. |
| 4. Modelo de negocio (problema, cliente, ingresos, ventaja) | ⚠️ Falta definirlo. En el TOP5 hay "$3.000–5.000/mes suscripción familiar [SIN VERIFICAR]". |
| 5. **Repo público** con instalación, deploy y arquitectura | ❌ Hoy el repo es **privado**. Hacerlo público antes de la entrega. |
| 6. Solo se evalúa lo construido hoy; si hay base previa, el README lo separa | ✅ Lo de anoche es investigación en `.md`, no código. El CI del #1 viene de otro repo: mencionarlo en el README. |

**Bonus (+20 posibles):**
- **0xGasless Core (+10):** "app donde el usuario nunca paga gas" o "agente que paga con x402". ✅ Nuestro flujo es gasless de punta a punta. Mostrar una tx patrocinada en Fuji con link en el README.
- **KUMPLY Core (+10):** "verificación clave para el producto, prioridad KYA". ✅ La bóveda solo acepta un agente que pasa `isAgent()`, y el Abogado solo negocia con agentes verificados. Es el caso "AI agents with a verified operator". Reglas duras: **no usar `hasTier()`** (deprecado), mostrar una dirección que pasa y una bloqueada, y decir en el README que las atestaciones de Fuji son demo.
- El PDF nombra el combo que da los 20: "paymaster que solo patrocina gas a agentes verificados con KUMPLY". Nos sale natural.
- Desempate: gana el de mayor puntaje **sin** bonus. El núcleo pesa más que los bonus.

## Twin (Stablecoins): 500 USDT

| Requisito | Cómo quedamos |
|---|---|
| Usar al menos una Twin Stablecoin en una chain elegible: Arbitrum, Base, Polygon, Ethereum **y Avalanche** | ✅ Avalanche está en la lista. ⚠️ Pero la tabla de direcciones está cortada y no muestra la de Avalanche; el bridge solo cubre las otras 4. Pedir la dirección de ARGt en C-Chain a los mentores. |
| Al menos una tx on-chain **real** ejecutada por el producto, con hash en el explorer | ⚠️ No menciona testnet. "Tokens para testear en montos mínimos" suena a mainnet. El plan de un deploy en C-Chain mainnet es correcto. |
| El token tiene que ser **núcleo**, no decorativo | ✅ Los topes se escriben en pesos y todo se paga en ARGt. Sin moneda local on-chain el producto no existe. |
| "Ideas nuevas, no versiones on-chain de lo que ya existe" | ✅ Dos agentes con mandatos separados que firman acuerdos en la cadena no existe hoy. |
| Disparador 1: "agentes que pagan **de forma autónoma**, dentro de límites que define el usuario" | ✅ Textual. |
| Lógica construida durante el evento y **el historial de commits lo tiene que mostrar** | ⚠️ Commits chicos durante el día; no subir todo en uno al final. |

Evaluación: Idea, Problema, Negocio y Pitch, cada uno de 1 a 5, mismo peso.

## Belo: consigna 4

> "Un agente que maneja tu plata: paga, ahorra o invierte por el usuario con reglas que pone él, **y que explica cada movimiento**."

✅ Encaja directo. Criterios: Problema real 30 %, Funciona 25 % ("demo de punta a punta, sin slides en lugar de producto"), Se puede llevar a producto 25 % ("respeta límites regulatorios; un equipo de Belo podría continuarlo"), **Uso de IA 20 % ("la IA hace algo que antes no se podía, no decora")**.

- ⚠️ **"Explica cada movimiento" es requisito**, no adorno: el panel tiene que mostrar, por cada pago y cada acuerdo, qué hizo el agente y por qué.
- ✅ Regulatorio: la bóveda es **no custodial** (el contrato es del usuario). Eso es lo que Belo puede continuar. Decirlo así en el pitch.
- El Abogado negociando con otro agente es justo lo que cubre "IA que hace algo que antes no se podía".

## Autonomía: sin humano en el loop

Las tres consignas coinciden: el humano **pone las reglas una vez** y el agente **actúa solo** dentro de ellas. La idea lo respeta, pero hay que cuidar cómo se demuestra:

- El flujo principal de la demo tiene que ser **100 % autónomo**: el Abogado negocia, los dos agentes firman, el Financiero paga la seña, y Diego no toca nada. Después el panel le **explica** lo que pasó (lo que pide Belo).
- La "solicitud pendiente de aprobación" cuando se pasa del tope queda como **red de seguridad**, no como el camino normal. Se muestra una sola vez, al final, como "esto es lo que pasa si el agente intenta pasarse". Si la demo está llena de botones de "Aprobar", el jurado ve un humano en el loop.

## Conflictos de agenda que no dice ningún PDF

- **Belo entrega a las 17:30** y pitchea a las 18:00. **Twin y Avalanche cierran a las 18:00**, y Twin tiene demo day de 19:00 a 21:00. Si vamos a los tres, la entrega real es a las **17:30**.
- Ningún PDF prohíbe competir en varios tracks, pero ninguno lo permite explícitamente. Sigue abierta la pregunta a la organización.

## Dos ajustes técnicos por las reglas

1. **Un solo contrato de acuerdos con los acuerdos como registros**, no una fábrica que despliega un contrato por acuerdo. Así hay un solo contrato que verificar (requisito 1 de Avalanche) y no N.
2. **Dos deploys del mismo contrato:** Fuji para Avalanche y los bonus (KUMPLY exige Fuji), C-Chain mainnet con ARGt real para Twin. Es lo que ya está en `DECISION_TRACKS.md`; los PDFs lo confirman.
