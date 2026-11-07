# KIT GANADORA – Seña Segura (r2-sena-segura)

> La seña de un alquiler de verano se paga en ARGt a un contrato en Avalanche, no al "dueño". Queda retenida hasta que llegás.

Base: `ronda-3/r2-sena-segura.md` (plan), `ronda-3/VERIFICACION.md` (riesgo BAJO), `ronda-3/RESULTADOS.md` (33/40). Datos técnicos: `CONTEXTO.md`, que manda sobre todo lo demás.

**Tres reglas para todo el día**
1. **Honestidad en el pitch.** La protección es la **retención**. El "9 de 9" es **historial de demo**. Si las credenciales salen del store propio, se dice. El jurado lo va a preguntar, así que mejor decirlo antes.
2. **Fuji, chain ID 43113.** Nada en mainnet. Ninguna clave privada en el código: keystore de Foundry (`cast wallet import`) y `.env` en `.gitignore`.
3. **Los repos de referencia son solo guía.** No se entrega código copiado de ellos (CONTEXTO.md). El repo nuevo se crea a las 9:00.

---

## 1. Pitch de 2 minutos (para leer en voz alta)

*(≈ 270 palabras. Entre corchetes, lo que se hace en pantalla. La compu de la demo ya tiene el `approve` hecho y las dos pestañas abiertas.)*

**[0:00 · Problema]**
Enero de 2026. Una familia de Santa Fe encuentra en Facebook una casa en la costa, cerca de Mar del Plata. Le piden 210 mil pesos de seña. Transfiere. La casa no se alquilaba, y la cuenta que cobró era de alguien que estaba preso. No fue mala suerte: la fiscalía de ciberdelito puso esta estafa entre las cuatro más denunciadas de enero de 2025.

Ella es Andrea, de Santa Fe. Quiere una casa en Santa Clara del Mar, no puede ir a verla y le piden 210 mil de seña. Hoy tiene dos opciones: confiar o perder la casa.

**[0:30 · Solución]**
Esto es **Seña Segura**. Andrea no le paga al dueño: le paga a un contrato en Avalanche, en ARGt, pesos digitales. La seña queda retenida. Solo puede publicar quien KUMPLY verificó como persona o como inmobiliaria. Y el dueño cobra cuando Andrea llega.

**[0:45 · Demo]** *[pantalla: dos avisos lado a lado]*
La misma casa, dos avisos. El rojo no tiene verificación y pide transferencia. El verde es de una persona verificada, con 9 estadías confirmadas por 9 huéspedes verificados distintos. Ese historial lo cargamos para la demo. *[clic: pagar seña]* Andrea paga en el verde: "Retenida", y acá está la transacción en Snowtrace. *[clic: el dueño se reserva su propia casa]* Ahora el dueño se reserva su propia casa para inflar el contador… y no suma. *[clic: check-in]* Andrea llega y confirma: "Liberada", y el contador pasa a 10. Si la casa no existe, Andrea reclama, decide un árbitro, y si el árbitro no decide a tiempo, la plata vuelve a Andrea.
*[Decir una sola de estas dos frases:]* **Si salió el KYC real:** "Andrea y el dueño están verificados de verdad por KUMPLY en Fuji." **Plan B:** "Las credenciales de hoy las emitimos nosotros como verificador de prueba. En producción las emite KUMPLY."

**[1:25 · Por qué blockchain]**
Las plataformas grandes ya retienen la seña, pero el trato de Facebook o WhatsApp no pasa por ninguna. Acá nadie se queda con la plata: la guarda un contrato con reglas públicas. Se paga en pesos aunque sea sábado, sin esperar al banco. Y el historial del dueño es suyo: lo puede leer cualquiera y no queda encerrado en una app.

**[1:40 · Negocio]**
Cobramos un porcentaje chico de cada seña protegida, y hoy lo estamos validando con los mentores. Una billetera que ya ofrece ARGt, como Belo, lo puede sumar como un botón: "pagar seña protegida".

**[1:52 · Visión]**
Hoy es la costa. Mañana, la seña del auto usado, la de Marketplace y la del verano en Brasil. Si la seña no entra al contrato, no hay protección. "Transferime" es la señal de alarma.

**Fuentes del pitch:** caso de $210.000 ([Noticias NQN, 20/1/2026](https://www.noticiasnqn.com.ar/noticias/2026/01/20/326920-estafa-con-alquileres-en-la-costa-atlantica-una-familia-fue-enganada-y-recibio-burlas-desde-una-carcel)); UFECI, top 4 de enero de 2025 ([Chequeado, 18/1/2025](https://chequeado.com/el-explicador/estafas-en-los-alquileres-de-verano-2025-cuales-son-las-modalidades-mas-comunes-y-como-evitar-caer-en-la-trampa/)); Belo distribuye ARGt (`ronda-0/SPONSORS.md` §5). Andrea es un personaje inventado. El porcentaje de la comisión está [SIN VERIFICAR]: no decir un número sin validarlo antes.
**No decir:** "ganá intereses con ARGt" (la CNV exige que ARGt se presente solo como medio de pago; `SPONSORS.md` §1); "sin custodio" a secas (lo correcto es "la custodia la tiene un contrato"); "probamos que la casa existe".

**Respuestas listas para el jurado (P4 las lleva en una tarjeta)**
- *¿Y Alohar o Airbnb?* También retienen, pero solo dentro de su plataforma. Seña Segura sirve para el trato de Facebook o WhatsApp, y el historial del dueño se puede llevar a cualquier lado.
- *¿El contador cuenta personas o billeteras?* Billeteras con KYC 2 o más. Para inflarlo hacen falta personas distintas verificadas. Si KUMPLY impide que una persona verifique varias billeteras, cuenta personas (es la pregunta 2 para KUMPLY).
- *¿Y si el dueño dice "transferime"?* Esa es la señal de alarma. Sin contrato no hay protección, y la app lo dice.
- *¿Un dueño honesto nuevo?* Aparece en ámbar: está verificado y tiene 0 estadías, pero la seña igual queda retenida.

---

## 2. Esqueleto de 5 slides

| # | Título | Bullets |
|---|---|---|
| 1 | **Seña Segura: la seña queda retenida hasta que llegás** | · Andrea, de Santa Fe: $210.000 de seña por una casa que no puede ver · Caso real, enero de 2026: la seña terminó en la cuenta de un preso · UFECI: entre las 4 estafas más denunciadas de enero de 2025 |
| 2 | **Cómo funciona** | · Solo publica quien KUMPLY verificó: persona (KYC 2-3) o inmobiliaria (KYB 4), nunca un agente · La seña en ARGt queda retenida en un contrato en Avalanche (Fuji) · 3 salidas: check-in → al dueño · plazo sin reclamo → al dueño · reclamo → decide un árbitro (si no decide, vuelve a Andrea) |
| 3 | **Demo: rojo vs verde** | · Mismo aviso: rojo (pide transferencia) vs verde (verificada + 9 estadías de demo) · Pago → barra rayada "Retenida" → check-in → sólida "Liberada", contador de 9 a 10 · El dueño se reserva su propia casa → el contador no sube. En pantalla se ve si cada credencial es "KUMPLY" o "demo" |
| 4 | **Por qué blockchain** | · La custodia la tiene un contrato con reglas públicas, no una empresa · Pesos (ARGt) que liquidan un sábado, sin esperar al banco · El historial del dueño es suyo y cualquiera lo puede leer: verificación KUMPLY + estadías confirmadas |
| 5 | **Negocio y visión** | · Un porcentaje chico por seña protegida (a validar con mentores) · Belo / billeteras con ARGt: botón "pagar seña protegida" · Lo que sigue: seña de auto usado, Marketplace, verano en Brasil (BRAt) |

---

## 3. Plan hora por hora (8:00-21:00)

Roles: **P1 Contratos · P2 Credenciales y datos · P3 Front · P4 Producto, pitch y QA**. La entrega es a las **18:00** y el demo day a las **19:00**, según Luma (`SPONSORS.md`). [SIN VERIFICAR: confirmarlo en el kickoff, junto con los bounties por sponsor].

| hora | qué pasa | hito de control (si no está, plan B) |
|---|---|---|
| **8:00** | Llegar, leer este kit (15 min) y repartir roles. **P2:** crear las billeteras (sección 4, P2) y empezar **ya** el KYC de 2 personas del equipo (dueño y Andrea) en kumply.xyz/verify: no hace falta repo. **P4:** buscar a la gente de KUMPLY y de Twin. | — |
| **8:30** | P2 consigue AVAX de Fuji para la billetera madre [SIN VERIFICAR: límites del faucet; si pide saldo en mainnet o cupón, pedir AVAX de Fuji a Team1]. P1 y P3 preparan el entorno local (Foundry, Node) sin repo. P4 hace las 3 preguntas a KUMPLY (abajo). | — |
| **9:00** | **Se crea el repo** (`contracts/`, `web/`, `scripts/`, `pitch/`, `.gitignore` con `.env`, `keystore` y `out/`). Se pega la **interfaz común** (sección 4) en `contracts/INTERFAZ.md`. Kickoff: P4 pregunta por la entrega y los bounties. | **9:30:** repo con estructura e interfaz acordada. Si no, P1 la fija solo y la comparte. |
| **10:00** | P1: `ARGtDemo` + esqueleto de `SenaEscrow`. P2: script de reparto de AVAX y store demo propio. P3: app con conexión a Fuji y lectura de `verify()` del store oficial. P4: aviso rojo falso y guion. | **10:00:** billeteras con AVAX, 2 KYC en curso y respuestas de KUMPLY anotadas. |
| **11:00** | P1: tests Foundry del camino feliz. P3: listado + ficha con el semáforo rojo/ámbar/verde. | **11:30:** camino feliz (`publicar → reservar → confirmarCheckIn → withdraw`) con tests verdes. **Si no:** P2 se suma a P1 y el árbitro sale de la demo (queda en la slide). |
| **12:00** | **Decisión KUMPLY (una sola vez, no se vuelve a discutir).** | **12:00:** ¿dueño y Andrea tienen KYC 2 real en el store oficial? **Sí:** personas reales + huéspedes y árbitro del store demo. **No:** todo sale del store demo y en el pitch se dice la frase del plan B. El store demo ya está en Fuji y tiene emitidos los 9 huéspedes y el árbitro (nivel 4). |
| **13:00** | Almuerzo escalonado (de a 2). | **13:00: `SenaEscrow` v1 desplegado en Fuji y el front paga una seña real (`approve` + `reservar`) con `TxLink` a Snowtrace.** **Si no:** front con una sola pantalla (ficha + botones, listado estático) y P1 despliega a mano con `cast`. Si a las 13:30 el contrato no está en Fuji, la demo es el camino feliz por consola y P3 la muestra con capturas. |
| **14:00** | P1: `reclamar`, `liberarPorPlazo`, `decidir`, `devolverSinArbitro`, antiautopago. P2: script de siembra. P3: barra rayado/sólido y botones de check-in y reclamo. P4: slides v1. | — |
| **15:00** | P1 despliega la v2. P2 corre la siembra ("9 de 9"). P3 arma el panel del árbitro. | **15:00: antiautopago en Fuji y contador en 9.** **Si no:** el antiautopago va primero (es parte del wow) y el árbitro se muestra solo en la slide. Si la siembra falla, alcanza con 3 estadías ("3 de 3"). |
| **16:00** | **Congelado de funciones.** P4 hace QA de punta a punta en una compu limpia y con otra billetera. Todos arreglan lo que encuentra P4. | **16:00: demo completa desde el front en Fuji, en menos de 60 s.** **Si no:** se recorta al camino feliz + antiautopago. Nada nuevo después de las 16:00. |
| **17:00** | **Video de respaldo** (menos de 2 min, con la voz del pitch) + lista de links de Snowtrace de las tx buenas. | **17:00: video grabado.** Después de esto, solo se despliega para arreglar un bug que rompa la demo. |
| **17:30** | README: qué es, cómo correrlo, direcciones de los contratos **copiadas de Snowtrace** y qué es demo y qué es real. Se carga la entrega. | **17:45: entrega cargada.** No esperar a las 17:59. |
| **18:00** | Entrega [SIN VERIFICAR: hora exacta]. 3 ensayos cronometrados del pitch (2:00 justos) + ronda de preguntas con las tarjetas. | Ensayo con la demo en vivo y otro con el video, por si falla el wifi. |
| **19:00** | **Demo day.** Dejar el `approve` hecho antes, las pestañas abiertas y el video a mano. | Si Fuji o el front fallan en vivo: video + links de Snowtrace, sin pedir disculpas. |
| **21:00** | Cierre. | — |

**3 preguntas de sí o no para KUMPLY (8:30, las hace P4):**
1. ¿El KYC 2 con Sumsub en Fuji aprueba a una persona en menos de 1 hora? (El LITEPAPER l. 225 pone la producción de Sumsub como hito futuro. Puede ser sandbox: [SIN VERIFICAR]).
2. ¿KUMPLY impide que una misma persona verifique dos billeteras?
3. ¿Nos pueden emitir a mano un nivel 4 (árbitro KYB) en el store de Fuji?

---

## 4. Primer prompt para la sesión de Claude de cada persona

### Interfaz común (se pega en `contracts/INTERFAZ.md` a las 9:00; P1 puede ajustarla, pero avisa)

```solidity
// SenaEscrow — Avalanche Fuji (43113). Plazos en MINUTOS (en Fuji no se puede adelantar el reloj).
constructor(IERC20 token, address storeKumply, address storeDemo, address arbitro,
            address plataforma, uint16 comisionBps, uint32 minReclamo, uint32 minArbitro)
function publicar(uint256 montoSena, string calldata titulo) returns (uint256 pubId) // dueño: persona nivel 2-3 o empresa nivel 4
function reservar(uint256 pubId) returns (uint256 resId)    // huésped persona 2-3; antes token.approve(escrow, monto)
function confirmarCheckIn(uint256 resId)                    // huésped → Liberada; suma estadía salvo autopago o huésped repetido
function reclamar(uint256 resId)                            // huésped, antes de minReclamo desde la reserva → EnDisputa
function liberarPorPlazo(uint256 resId)                     // cualquiera, pasado minReclamo sin reclamo → Liberada (no suma estadía)
function decidir(uint256 resId, bool devolverAlHuesped)     // solo el árbitro (nivel 4), antes de minArbitro desde el reclamo
function devolverSinArbitro(uint256 resId)                  // cualquiera, pasado minArbitro sin decisión → Devuelta
function withdraw()                                         // retiro de saldos (pull payments)
function credencial(address a) view returns (bool ok, uint32 tier, uint8 fuente) // fuente: 0 ninguna, 1 KUMPLY, 2 demo
function estadias(address dueno) view returns (uint256)
// Estados: 0 Ninguno, 1 Retenida, 2 EnDisputa, 3 Liberada, 4 Devuelta
// Eventos: Publicada, Reservada, Reclamada, Decidida, Liberada(resId, alDueno, comision), Devuelta,
//          EstadiaSumada(dueno, huesped, total), EstadiaNoSuma(dueno, huesped, motivo) // 1 autopago, 2 repetido
```
Comisión: al liberar al dueño se descuentan `comisionBps` para `plataforma` (como `_split` de `RevenueSplitter.sol` l. 56, dos líneas). Al devolverle a Andrea, se devuelve el 100 %. Simplificación de demo: los plazos corren desde la reserva, no desde la fecha de llegada.

**Rutas de referencia.** `REFS = /home/juan-chaparro/hackatwin-noche/ideas/refs` en la compu de Juan. En otra compu: clonar `https://github.com/sebastianlujan/hackatwin-x402-team1-avalanche` (rama `develop`) y `https://github.com/kumplyprotocol/Kumply`, y usar las mismas rutas relativas. `X = REFS/hackatwin-x402-team1-avalanche`.

### P1 · Contratos

```text
Sos mi par de programación en HackaTwin (sábado 7/11/2026, entrega ~18:00). Soy P1, responsable de los contratos.
Proyecto "Seña Segura": la seña de un alquiler de verano se paga en ARGt (peso digital) a un contrato en
Avalanche Fuji y queda retenida hasta el check-in. Solo publica quien está verificado por KUMPLY.

REGLAS
- Fuji C-Chain, chain ID 43113, RPC https://api.avax-test.network/ext/bc/C/rpc. Nada de mainnet.
- Foundry (forge/cast). Claves solo en keystore de Foundry (cast wallet import); .env en .gitignore. Nunca claves en el código.
- Los repos de referencia son SOLO GUÍA: leelos, no copies archivos. Código propio.
- No inventes direcciones ni firmas: si algo no está en esta lista o en el código, preguntame.

DATOS VERIFICADOS (no usar memoria)
- En Fuji no hay ARGt: hacemos ARGtDemo (ERC-20, 18 decimales, mint abierto, nombre visible "ARGt de prueba").
  Guía: X/packages/contracts/test/utils/MockERC20.sol (no tiene permit; usamos approve).
- KUMPLY AttestationStore oficial en Fuji: 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD.
  verify(address) external view returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry).
  Devuelve (false,0,0,0) si venció, fue revocada o nunca existió. Guía: REFS/Kumply/contracts/contracts/AttestationStore.sol l. 224.
- Niveles: 1-3 personas (escalera), 4 empresa (KYB), 5 agente (KYA). Una dirección tiene UNA sola atestación.
- NO usar attestations() (no mira el vencimiento). NO heredar ComplianceGate.sol: en la l. 97, `tier < required` deja pasar 4 y 5.
  Comparar el nivel exacto: persona = tier 2 o 3; inmobiliaria o árbitro = tier 4; nivel 5 nunca publica ni reserva.
- Hay un segundo store "demo" (storeDemo) que despliega P2 con la misma firma de verify(). Si storeDemo == address(0),
  NO llamarlo (una llamada a una dirección sin código revierte al decodificar). Orden: primero el oficial (fuente=1), después el demo (fuente=2).
- En Fuji no se adelanta el reloj: los plazos se pasan en minutos al constructor.

GUÍAS EN EL REPO (solo leer)
- X/packages/contracts/src/PaymentHub.sol: withdraw l. 193, _transition l. 211, saldo antes/después l. 126-128.
  Ojo: settle (l. 177) y refund (l. 162) tienen el plazo AL REVÉS de lo que necesitamos.
- X/packages/contracts/src/libraries/PaymentStateLib.sol l. 11-21: tabla de transiciones en bits.
- X/packages/contracts/src/RevenueSplitter.sol _split l. 56 (la comisión son 2 líneas).
- X/packages/contracts/script/DeployFuji.s.sol: solo como modelo de script de despliegue.

INTERFAZ ACORDADA CON EL FRONT (respetala; si la cambiás, avisame para avisar a P3)
[pegar acá el bloque "Interfaz común" de KIT_GANADORA.md]

ANTIAUTOPAGO: en confirmarCheckIn, si huésped == dueño → emitir EstadiaNoSuma(…,1) y no sumar;
si ese huésped ya sumó para ese dueño → EstadiaNoSuma(…,2). La seña igual se libera.

ENTREGABLES Y HORARIOS
1. 11:30 → ARGtDemo + SenaEscrow con camino feliz (publicar → reservar → confirmarCheckIn → withdraw) y tests Foundry verdes.
2. 13:00 → desplegado en Fuji; direcciones en deployments/fuji.json y ABI en web/src/abi/ para P3.
3. 15:00 → reclamar, liberarPorPlazo, decidir, devolverSinArbitro y antiautopago, con tests (incluido el árbitro que no decide) y la v2 desplegada.
Tests obligatorios: un agente (tier 5) no puede publicar; tier 1 no puede reservar; credencial vencida = no verificada;
storeDemo en address(0) no revierte; nadie retira dos veces.

Empezá leyendo las guías de arriba. Antes de escribir código, proponeme en 10 líneas el storage, los estados
y las transiciones. Después escribí primero los tests del camino feliz.
```

### P2 · Credenciales y datos

```text
Sos mi par de programación en HackaTwin (sábado 7/11/2026, entrega ~18:00). Soy P2: credenciales, billeteras y datos de demo.
Proyecto "Seña Segura": la seña de un alquiler de verano se paga en ARGt a un contrato (SenaEscrow, lo hace P1) en
Avalanche Fuji y queda retenida hasta el check-in. Solo publica quien KUMPLY verificó (persona nivel 2-3 o empresa nivel 4).

REGLAS
- Fuji, chain ID 43113, RPC https://api.avax-test.network/ext/bc/C/rpc. Nada de mainnet. Plata de prueba.
- Claves en keystore de Foundry (cast wallet new / cast wallet import); nada de claves en el código ni en el repo.
- Repos de referencia: SOLO GUÍA, no copiar archivos. No inventes direcciones: si no lo sabés, preguntame.

DATOS VERIFICADOS
- Store oficial KUMPLY en Fuji: 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD
  (REFS/Kumply/packages/sdk/src/constants.ts l. 71). El KYC real se hace en kumply.xyz/verify (Sumsub) y emite en Fuji.
  Nosotros NO tenemos VERIFIER_ROLE en el oficial.
- verify(address) view returns (bool verified, uint32 tier, uint64 timestamp, uint64 expiry); lectura gratis.
- issueAttestation(address subject, uint32 tier, uint64 expiry), solo VERIFIER_ROLE, PISA la anterior
  (REFS/Kumply/contracts/contracts/AttestationStore.sol l. 197). Una dirección = una atestación: cada rol necesita su billetera.
- Niveles: 1-3 personas, 4 KYB, 5 KYA. KUMPLY NO verifica edad. La credencial es pública, sin datos personales.
- Los scripts REFS/Kumply/contracts/scripts/issue-attestation.ts y issue-attestation-batch.ts tienen la dirección
  del store FIJA en un mapa STORE (l. 17-20 / 27-29): sirven de guía, pero el nuestro apunta a nuestro store.

TAREAS (en orden)
1. 8:00 – Billeteras con keystore: W0 madre/plataforma/admin, W1 dueño, W2 Andrea, W3 árbitro, W4-W12 nueve huéspedes,
   W13 "sin credencial". Tabla alias → dirección en scripts/billeteras.md (solo direcciones públicas).
2. Script que reparte AVAX de Fuji desde W0 a las demás (poco a cada una).
3. Store demo PROPIO, mínimo y escrito por nosotros (no copiar AttestationStore.sol): misma firma de verify(),
   issueAttestation solo para el admin, vencimiento. Así el SDK de KUMPLY y SenaEscrow lo leen igual (contractAddress = nuestro store).
   Desplegar en Fuji y emitir: W4-W12 nivel 2, W3 nivel 4. Si a las 12:00 no hay KYC real, también W1 y W2 nivel 2.
4. Módulo TS para el front: credencial(addr) → {ok, tier, fuente: "KUMPLY" | "demo" | null}, con @kumply/sdk
   (new KumplyClient({ network: "fuji", contractAddress })), isPersonAtLeast(addr, 2) e isBusiness(addr): son las funciones
   que suman bonus. contractAddress es OBLIGATORIO. No usar hasTier (deprecado; deja pasar 4 y 5).
   Si @kumply/sdk no instala [SIN VERIFICAR que esté en npm], leer verify() directo con viem y un ABI mínimo.
   Guías: REFS/Kumply/packages/sdk/src/client.ts l. 121/222/236 y tier.ts l. 27.
5. 14:00 – Script de siembra (cuando P1 tenga la v2 en Fuji): mint de ARGtDemo a W4-W12, approve, reservar
   en la publicación de W1 y confirmarCheckIn → estadias(W1) = 9. Un intento de autopago de W1 para mostrar que no suma.

HITOS: 10:00 billeteras con AVAX · 12:00 store demo desplegado y emitido · 15:00 siembra corrida.
Empezá por el punto 1 y mostrame los comandos antes de ejecutarlos.
```

### P3 · Front

```text
Sos mi par de programación en HackaTwin (sábado 7/11/2026, entrega ~18:00). Soy P3, el front.
Proyecto "Seña Segura": la seña de un alquiler de verano se paga en ARGt a un contrato en Avalanche Fuji y queda
retenida hasta el check-in. La demo dura menos de 60 s frente al jurado y tiene que entenderla alguien que no sabe nada de cripto.

REGLAS
- Fuji, chain ID 43113, RPC https://api.avax-test.network/ext/bc/C/rpc, explorador https://testnet.snowtrace.io.
- Stack: Next.js o Vite + React + viem/wagmi, de cero. Mobile primero. Español rioplatense en toda la UI.
- Repos de referencia: SOLO GUÍA, no copiar archivos. Nada de claves en el código.
- No inventes direcciones: salen de deployments/fuji.json (P1) y del store demo (P2).

PANTALLAS (en orden de prioridad)
1. Listado con semáforo: ROJO = aviso externo "tipo Facebook" (datos fijos, sin marcas reales: "sin verificación ·
   pide transferencia"); ÁMBAR = persona verificada con 0 estadías ("la seña igual queda retenida");
   VERDE = verificada + N estadías de N huéspedes verificados. Rojo y verde de LA MISMA casa, lado a lado.
2. Ficha: sello de credencial con su fuente ("KUMPLY" o "demo"), contador de estadías, botón "Pagar seña"
   (approve + reservar), barra de estado: RAYADA "Retenida" → SÓLIDA "Liberada" / ámbar "En disputa" / "Devuelta".
   TxLink a https://testnet.snowtrace.io/tx/<hash> en cada paso.
3. Botones del huésped: "Llegué" (confirmarCheckIn) y "Reclamar". Botón del dueño "Reservarme mi casa" para el antiautopago:
   mostrar el evento EstadiaNoSuma como "No suma: autopago".
4. Panel del árbitro (decidir) y botón "Liberar por plazo".

DATOS VERIFICADOS
- Credenciales: @kumply/sdk → new KumplyClient({ network: "fuji", contractAddress }); contractAddress OBLIGATORIO.
  Store oficial Fuji 0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD. Usar isPersonAtLeast(addr, 2) e isBusiness(addr)
  (suman bonus); no usar hasTier. verify() da verified=false si venció, fue revocada o nunca existió.
  Si el SDK no instala, P2 te pasa un módulo con viem. Guía: REFS/Kumply/packages/sdk/src/client.ts l. 222/236.
- Token: ARGtDemo (P1), mostrar como "ARGt de prueba", montos en pesos con separador de miles ($210.000).
- Guías visuales: X/packages/ui/src/atoms/TxLink.tsx (hace link solo si le pasás url) y Badge.tsx.
  Estados del contrato: 0 Ninguno, 1 Retenida, 2 EnDisputa, 3 Liberada, 4 Devuelta.

INTERFAZ DEL CONTRATO (acordada con P1)
[pegar acá el bloque "Interfaz común" de KIT_GANADORA.md]

HITOS: 11:00 listado + ficha con credenciales reales leídas de Fuji (con datos falsos del escrow si P1 no desplegó) ·
13:00 pagar seña real en Fuji con TxLink · 15:00 check-in, reclamo, antiautopago y árbitro · 16:00 congelado.
Plan B a las 13:00: una sola pantalla (ficha + botones) y el listado estático.
Empezá armando el proyecto y la pantalla 1 con datos falsos. Proponeme antes la estructura de carpetas en 8 líneas.
```

### P4 · Producto, pitch y QA

```text
Sos mi compañero de producto en HackaTwin (sábado 7/11/2026, Digital House, entrega ~18:00, demo day 19:00).
Soy P4: pitch, slides, aviso falso de la demo, QA y video de respaldo. Escribí en español rioplatense, claro y corto.

PROYECTO "Seña Segura": la seña de un alquiler de verano se paga en ARGt (peso digital de Twin) a un contrato en
Avalanche Fuji y queda retenida. Solo publica quien KUMPLY verificó (persona nivel 2-3 o inmobiliaria nivel 4).
Salidas: check-in → al dueño; plazo sin reclamo → al dueño; reclamo → árbitro (si no decide, vuelve al huésped).
Usuario: Andrea Gómez (personaje inventado), de Santa Fe, $210.000 de seña por una casa en Santa Clara del Mar.

DATOS CON FUENTE (solo estos; si querés otro, marcalo [SIN VERIFICAR])
- Enero de 2026: familia santafesina, $210.000 de seña, la cuenta era de alguien preso. Noticias NQN, 20/1/2026.
- La UFECI la puso entre las 4 estafas más reportadas de enero de 2025. Chequeado, 18/1/2025.
- Alohar libera al dueño 72 h después del check-in (iProfesional, 7/1/2025): la retención ya existe dentro de plataformas.
- ARGt debe presentarse SOLO como medio de pago (CNV, 2026). Nunca hablar de rendimiento.
- KUMPLY: credencial pública (dirección + nivel), sin datos personales, NO verifica edad. Busca pilotos de integración (su LITEPAPER).
- Belo distribuye ARGt y su idea pública es la "seña de verano en Brasil".

HONESTIDAD (no negociable): la protección es la retención; el "9 de 9" es historial de demo; si las credenciales
salen de nuestro store, se dice. No decir "probamos que la casa existe".

TAREAS
1. Aviso ROJO falso tipo Facebook (sin logos ni marcas reales): texto e imagen para el front de P3.
2. Las 5 slides: [pegar acá la sección 2 de KIT_GANADORA.md]. Pocas palabras, letra grande.
3. Ajustar el pitch de 2 minutos: [pegar acá la sección 1 de KIT_GANADORA.md]. Cronometrarlo.
4. Tarjeta de preguntas difíciles: ¿y Alohar?, ¿billeteras o personas?, ¿y si el dueño dice "transferime"?, ¿dueño nuevo?,
   ¿por qué no una base de datos?
5. Checklist de QA de punta a punta en Fuji desde una compu limpia (16:00) y guion del video de respaldo (17:00).
6. README de entrega: qué es, cómo correrlo, direcciones de contratos (copiadas de Snowtrace, no inventadas), qué es real y qué es demo.

Empezá por la tarjeta de preguntas difíciles y por el aviso rojo. Después, las slides.
```

---

## 5. Tres preguntas para los mentores (validar con gente real)

1. **El problema:** "¿Alguna vez dejaste (o te pidieron) una seña por un alquiler temporario a alguien que no conocías? ¿Cómo la pagaste, y qué te habría hecho sentir seguro?" → Si nadie lo vivió ni conoce a alguien que lo haya vivido, el "Problema" del pitch tiene que apoyarse en la cifra de la UFECI y no en la anécdota.
2. **El dueño, que es el que más frena:** "Si alquilás una casa en la costa, ¿aceptarías cobrar la seña en ARGt recién cuando llega el huésped, a cambio de un sello verificado y un historial que se ve? ¿Qué te haría decir que no?" → Esto valida o mata el lado de la oferta (es el ataque más fuerte: "transferime").
3. **Quién paga:** "Para no perder una seña de $210.000, ¿quién debería pagar la protección, el huésped o el dueño? ¿Cuánto es razonable: 1 %, 3 %, 5 %?" → Con esto se completa la slide 5 y la frase "un porcentaje chico" del pitch. Anotar las respuestas textuales y usar solo lo que digan.

*(Las 3 preguntas técnicas de sí o no para KUMPLY están en la sección 3, a las 8:30.)*

---

## [SIN VERIFICAR] de este kit
- Hora exacta de la entrega (18:00) y del demo day (19:00): salen de Luma vía `SPONSORS.md`. Bounties por sponsor y jurado.
- Cuánto tarda el KYC 2 en Fuji y si es sandbox de Sumsub. Si KUMPLY impide varias billeteras por persona.
- Límites del faucet de AVAX en Fuji. Que `@kumply/sdk` 1.3.0 instale desde npm.
- Porcentaje de comisión que la gente aceptaría pagar.
- Que no exista un escrow argentino para tratos de Facebook o WhatsApp (búsqueda de ronda 3, sin resultados).
- Cambio respecto del plan de ronda 3: el store del plan B **se escribe de cero** con la misma firma de `verify()`, en vez de copiar `AttestationStore.sol`, porque CONTEXTO.md dice que no se entrega código de los repos de referencia.
