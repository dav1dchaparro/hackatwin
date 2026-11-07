# Complemento: Llave de Emergencia (reglas del PDF, alta por email, multifirma, avisos, comisión y retiro)

Fecha: sáb 7/11/2026, 14:00 (Buenos Aires). Autor: P2 (Gabosawn), con investigación hecha hoy.
Este doc **complementa** `PLAN_CONSTRUCCION_LLAVE.md` (cómo se construye) y `MEJORAS_LLAVE.md` (las 17 mejoras de los validadores). No los reemplaza: manda solo en lo que agrega (§5 y §6). Los cortes del cronograma (14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00) **no se mueven**.
Lo marcado **[SIN VERIFICAR]** no se confirmó hoy con fuente primaria: no decirlo en el pitch como hecho.

---

## 0. Resumen en 8 líneas
1. Leímos el PDF oficial del track completo (§1). El resumen de `REGLAS_TRACKS.md` es fiel. Nada de lo nuevo rompe un obligatorio.
2. **Alta por email de herederos y guardianes: embedded wallet de 0xGasless** (ya está). Privy no es sponsor y su patrocinio de gas no corre en Avalanche (§3.1).
3. **La multifirma del mentor ya existe:** la 2-de-3 de guardianes del contrato, con tope y veto. Safe va al roadmap (§3.2).
4. **"La blockchain no tiene cron":** cierto, pero en Avalanche el reloj es `block.timestamp`, **no** los bloques (la C-Chain solo produce bloques cuando hay tx). El aviso antes del vencimiento es un **keeper off-chain + Telegram** (§3.3).
5. **Modelo:** nosotros pagamos el gas; cobramos **1% on-chain al liberar la herencia** (`comisionBps` + `tesoreria`, immutables) (§3.4).
6. **Si el dueño retira antes: gratis y cuenta como "Estoy bien".** Ni se traba ni se cobra: coherencia con el pitch, Ley 24.240, PSAV (§4).
7. Hoy entran 6 cosas chicas (A1-A6, §5), ninguna mueve un corte. Lo demás es roadmap (§10).
8. Para P1 hay un cambio de contrato de 20 minutos (§6); para P4, textos listos para pegar en el README (§8).

---

## 1. Las reglas del PDF, una por una

Fuente: `HackaTwin — Blockchain Track Rules and Requirements (EN)`, 16/10/2026 (PDF de la organización). Un solo premio. Jurado hasta 100 + bonus hasta 20 = 120. **Desempate: puntaje del jurado sin bonus.**

### 1.1 Obligatorios (si falta uno, no es elegible aunque tenga bonus)
| # | Regla (PDF) | Cómo la cumplimos | Qué cambia con este doc |
|---|---|---|---|
| O1 | Al menos un contrato en Avalanche (Fuji o mainnet; C-Chain o L1 propia) **verificado** en el explorer. Si es L1 propia, tx medibles en P-Chain | `LlaveEmergencia` + `MockPesos` verificados en Fuji (P1-6 a las 14:30, instancias finales P1-12 a las 16:15) | Si entra la comisión (A1), va en la instancia final verificada |
| O2 | Interfaz web o mobile conectada a los contratos. **CLI o bot NO cumplen** | La web de P2/P3 | El bot de Telegram (A4) es un **complemento**; la UI obligatoria sigue siendo la web |
| O3 | "Por qué Avalanche" documentado en el repo (finalidad, L1 propia, compliance/privacidad institucional, ICM) | README de P4 | Se suma un argumento nuevo: "C-Chain produce bloques solo con tx y recomienda `block.timestamp`" (§8.5) |
| O4 | Modelo de negocio: problema, cliente, ingresos, ventaja. Validación temprana suma | README de P4 | Se completa con comisión on-chain, "¿y si retiro?", unit economics y comparables (§8.1-8.2) |
| O5 | Repo público con instalación, despliegue y arquitectura | README raíz + `contracts/README.md` + `web/README.md` | Sin cambios |
| O6 | Solo se evalúa lo hecho en el evento; el README separa lo reutilizado | Sección "Hecho hoy / reutilizado" | Sin cambios |

### 1.2 Bonus (cada uno se puntúa aparte; se suman hasta +20)
| Bonus | Básico +5 | Core +10 | Para que cuente | Nuestro estado |
|---|---|---|---|---|
| **0xGasless** | Usar cualquier componente (server wallet, embedded wallet, paymaster 4337, x402, AgentKit, MCP, ERC-8004) y mostrar **una tx patrocinada** o un pago x402 en Fuji/mainnet | Además, 0xGasless en el **flujo principal** (ej. "el usuario nunca paga gas") | README explica qué componente y por qué, **con links al explorer**. Free tier: 1.500 wallets | **Core:** login con email (embedded wallet) + todas las tx patrocinadas (G1/G2 del checklist) |
| **KUMPLY** | `@kumply/sdk` + gate **on-chain** con `isPersonAtLeast()` / `isBusiness()` / `isAgent()` en Fuji, mostrando **una dirección que pasa y una bloqueada** | Además, la verificación es **clave del producto** (prioridad a KYA) | **No usar `hasTier()`** (deprecado). README: "las atestaciones de Fuji son demo, sin verificación real" | **Core:** gate en `cobrar`, `iniciarReclamo`, guardianes y destino; Lucía pasa / Tomás bloqueado (K1-K5) |
| **Combo +20** | "Un paymaster de 0xGasless que solo patrocina gas a cuentas verificadas con KUMPLY" | | | **No se reclama hoy** salvo que el stand habilite una política de patrocinio (A2). P2-8 es política en el cliente, no un paymaster |

Casos de uso que el PDF lista y nosotros tocamos: "Onboarding sin wallet ni gas" (0xGasless), "Servicios solo para personas verificadas" (KUMPLY KYC), "Transacciones entre empresas verificadas" (destino KYB de la emergencia) y, si A2 sale, "Gas patrocinado solo para cuentas verificadas".

### 1.3 Entregables y jurado
- **Entregables:** repo público con README (instalación, deploy, arquitectura, por qué Avalanche, qué se hizo en el evento) · dirección del contrato verificado + link · **demo funcionando (URL o video) + pitch de hasta 3 min** · si se reclama bonus, sección en el README con links a las tx de demo.
- **Jurado (100):** Impacto 25 · Uso de Avalanche 25 · Factibilidad técnica (funciona y está desplegado) 20 · Negocio y escalabilidad 20 · Presentación 10.
- Lo que agrega este doc pega sobre todo en **Negocio (20)** y **Uso de Avalanche (25)**.

---

## 2. Decisiones tomadas hoy (P2, 13:45)
1. **Alta por email:** embedded wallet de 0xGasless. Privy = plan B / roadmap.
2. **Retiro anticipado del dueño:** sin penalidad. Se cobra solo al ejecutar (1% al liberar la herencia).
3. **Dónde vive esto:** este doc en `docs/brainstorming` + resumen en el PR #2.

---

## 3. Lo que agregamos a la idea

### 3.1 Alta rápida por email para herederos y persona de confianza
**Lo que pidió el equipo:** que un heredero o una persona de confianza tenga cuenta en 1 minuto, sin seed ni gas, y que el dueño pueda decir "repartí en partes iguales / por porcentajes / todo a un fondo común".

**Qué encontramos:**
- **Privy** tiene exactamente "wallets pregeneradas por email" (`POST /api/v1/users` con el email y `wallets:[{chain_type:"ethereum"}]`; el usuario la reclama al entrar con ese email), policies por wallet y quórums m-de-n. **Pero su patrocinio nativo de gas usa EIP-7702, y Avalanche no está en su lista de redes.** EIP-7702 **no está activo** en Avalanche: la ACP-209 sigue "Proposed" y el último upgrade (Helicon, Fuji 28/7/2026, mainnet 22/9/2026) no la incluye. Quedaría la vía smart wallet 4337 de Privy + un paymaster externo con soporte en Fuji [SIN VERIFICAR].
- **0xGasless** es el único con patrocinio confirmado en Fuji hoy: un PR del 21/10/2026 hizo que `setupSmartAccount()` use por defecto las direcciones de Fuji (antes fallaba). Tiene embedded wallet con login por email, bundler + paymaster, free tier de 1.500 wallets (PDF).
- Privy **no es sponsor**: no suma bonus. 0xGasless en el flujo principal suma +10.

**Decisión:** 0xGasless embedded wallet, como ya hace P2-1. Flujo de hoy: cada heredero/guardián entra una vez con su email y comparte su dirección; el dueño la carga. En la UI de configuración (A3) se agregan tres **presets** que resuelven lo que pidió el equipo sin tocar el contrato:
- **Partes iguales:** la web calcula los `bps` (con 3 herederos: 3334/3333/3333).
- **Porcentajes:** manual (lo que ya existe).
- **Un solo destino:** 100% a una persona de confianza verificada (tier 2+).

**"Fondo común" (todo a una cuenta familiar compartida):** roadmap. Hoy no entra por dos razones: (1) el gate `_requirePersonAtLeast(msg.sender, 2)` de `cobrar()` **no deja cobrar a un contrato** (un Safe no tiene atestación de persona); (2) habría que agregar `destinoDePago` por heredero (cobra el heredero verificado, recibe el fondo). Es un cambio chico pero no entra antes del freeze.

**Roadmap de alta:** invitación por email sin login previo (pre-alta). Preguntar en el stand si 0xGasless lo tiene (A2); si no, Privy pregenerated wallets para esa parte.

### 3.2 Multifirma ("MultiC" del mentor)
**Ya está.** La emergencia 2-de-3 de guardianes **es** una multifirma, pero con reglas que una multisig genérica no tiene: tope total del 20% hasta la próxima señal, destino KYB fijo, veto del dueño con demora, y cada voto es una tx verificable. Así se dice en el pitch: *"es una multifirma con reglas, no una multisig genérica."*

**Por qué no Safe hoy** (investigado):
- Safe v1.4.1 **sí** está desplegado en Fuji y mainnet (`0x41675C099F32341bf84BFc5382aF534df5C7461a`), y se puede crear por código con protocol-kit.
- Pero `Safe4337Module` **no está desplegado en Avalanche** (43113 ni 43114): sin eso, un Safe no puede usar el paymaster → los firmantes pagarían gas.
- La web app.safe.global **dejó de soportar la C-Chain el 18/6/2026**; el reemplazo es Ash Wallet. Más fricción para usuarios no cripto.
- Hay un módulo Safe "dead man's switch" de Blockful (marzo 2026, MIT, **sin auditar**): `ping()` o cualquier tx del dueño reinicia el reloj y, vencido el plazo, el heredero toma el Safe. Sirve como referencia de diseño, no para hoy.

**Roadmap:** (a) reclamo de herencia con 2 firmas (heredero + un guardián) para bajar falsos positivos; (b) Safe familiar como `destinoDePago` del "fondo común"; (c) rotación de dueño 2-de-3 con demora (recupera el acceso si Marta pierde el email).

### 3.3 "No hay cron": reloj y avisos
**Lo que dijo el mentor:** la blockchain no tiene cron; estimar el tiempo por bloques firmados y, antes de llegar a esa cantidad, avisar por mail/WhatsApp/Telegram para que dé señales de vida.

**Corrección importante para Avalanche:** el README oficial de coreth dice textual que los bloques se producen de forma asíncrona, que "timing assumptions that apply to Ethereum do not apply" y que **"smart contracts built on Avalanche should use the block timestamp instead of the block number"**. La C-Chain solo arma un bloque cuando hay transacciones pendientes (en Fuji, un domingo a la noche, pueden pasar minutos sin bloques) y desde Granite (ACP-226) el tiempo mínimo entre bloques es dinámico. **Contar bloques como reloj daría plazos cualquiera.** El contrato ya usa `block.timestamp` (campo `ahora` en `Estado`): **no se toca**. Un bloque no puede estar más de 10 s en el futuro: para plazos de días, el drift no importa.

**El aviso sí va off-chain, como dijo el mentor.** No hay cron on-chain; lo que había (Chainlink Automation) **fue dado de baja** (v1 el 30/6/2026, v2.1 el 31/7/2026; reemplazo: Chainlink CRE con triggers cron, Fuji en la lista) y OpenZeppelin Defender **cerró el 1/7/2026** (reemplazo: Relayer/Monitor open source, self-hosted). Para hoy: **script propio** (Node + viem), cero dependencias (A4, detalle en §7):
- Lee `estado()` de la bóveda cada 5 s. Cuando `venceEn − ahora` cruza un umbral (demo: 30 s y 10 s; producción: 30, 15 y 7 días) manda un Telegram al dueño: *"Marta, te quedan 10 segundos para tocar Estoy bien"* con el link a la web.
- Escucha `ReclamoIniciado` y manda **alerta inmediata**: *"Lucía inició un reclamo. Tenés 30 s para cancelarlo tocando Estoy bien"* (es el modelo de Argent: guardianes + ventana para cancelar, con avisos por SMS/email/push).
- **Telegram** porque es lo más rápido y gratis (Bot API; deep link `t.me/<bot>?start=<id>` para capturar el chat). WhatsApp sirve solo para demo: el sandbox de Twilio exige "join <código>" y vence a las 72 h; el número de prueba de Meta llega a 5 destinatarios. Email: Resend gratis 3.000/mes y 100/día. En producción: los tres canales.

**Momento nuevo en la demo (1:05):** cuando el panel llega a 10 s, el celular de Marta suena con el aviso. Vale 10 segundos de guion y responde la pregunta "¿y si se olvida?" antes de que la hagan.

**Roadmap:** Chainlink CRE como keeper gestionado; "Estoy bien" como **firma EIP-712** que el keeper relaya en lote (OpenZeppelin `ERC2771Forwarder.executeBatch`): el usuario firma un mensaje, no manda una tx, y el costo por señal baja a casi cero.

### 3.4 Paymaster y modelo de negocio
**Lo que pidió el equipo:** que el usuario no pague gas (paymaster nuestro) y que, como nosotros pagamos, cobremos un porcentaje cuando se cumpla el contrato.

**Cómo queda:**
- **Gas:** lo pagamos nosotros vía 0xGasless (free tier 1.500 wallets). Es costo de adquisición. P4-9 mide el costo real de un `estoyBien` en Fuji (`docs/finalidad.md`); el objetivo para el README es "centavos por mes por bóveda" [SIN VERIFICAR hasta medir; mainnet puede diferir].
- **Comisión on-chain (A1):** `comisionBps` (máx. 100 = 1%) y `tesoreria`, **immutables en el constructor**. Nadie los cambia después: se mantiene "sin función de administrador". Se descuenta **solo en `cobrar()`**: el heredero recibe `parte − comisión`, la tesorería recibe la comisión, se emite `ComisionCobrada`. `parteDe()` devuelve el neto. La UI lo muestra: *"Comisión Llave: 1%"*. Emergencias sin comisión hoy (roadmap: 0,5%). Tope en pesos: roadmap.
- **Ingresos:** 1% al liberar (on-chain) · Plan Familia USD 2/mes (off-chain, roadmap) · B2B marca blanca USD 0,50 por bóveda activa por mes (billeteras y exchanges que ya tienen el KYC).
- **Por qué es defendible:** es **precio del servicio**, visible en el contrato y en Snowtrace. Comparables: una sucesión judicial se lleva entre 6% y 15% del patrimonio (en PBA: honorarios 6-20% + tasa de justicia ~2,2‰ + impuesto a la herencia); **Nunchuk** (Bitcoin, nov. 2025) cobra **0,3% al heredero al reclamar** si venció la suscripción; Webacy cobra 1% al ejecutar su "panic button" [SIN VERIFICAR, la página da 404]; Vault12 USD 49,99/mes; Casa desde USD 250/año; Kresus USD 99,99/año; Ledger Recover ~USD 9,99/mes. **Ninguno cobra por retirar la plata propia.**

### 3.5 Combo +20 (A2)
El PDF dice que un paymaster que solo patrocina cuentas verificadas con KUMPLY puede dar los 20 completos. Las docs de 0xGasless mencionan un piloto de "patrocinio condicionado a atestación KUMPLY" en Fuji [SIN VERIFICAR detalles]; el lane conocido solo patrocina tier 5 (agentes). **P4 pregunta en el stand:** ¿el dashboard permite una política de patrocinio (allowlist de direcciones o webhook)? Si sí: allowlist = las 4 smart accounts verificadas → se reclama el combo. Si no: no se reclama (P2-8 es política en el cliente, no un paymaster, y no hay que inflar el README).

---

## 4. ¿Y si el dueño retira la plata antes?

**La pregunta del equipo:** ¿hacemos un contrato que no deje sacar la plata? ¿O si la saca le cobramos una comisión porque ya usó el servicio?

**Decisión: retirar es gratis y cuenta como "Estoy bien"** (ya está así en `retirar()`: señal + `safeTransfer`). No se traba ni se cobra. Razones, en el orden que se dicen en el pitch:

1. **Coherencia con el producto.** Vendemos "ni nosotros podemos tocar tu plata; las reglas viven en el contrato". Un contrato que no deja retirar, o que cobra por retirar, lo contradice y el jurado lo señala en la primera pregunta.
2. **Defensa del consumidor.** Una comisión por retirar fondos propios se parece a un "cargo por baja": la Ley 24.240 (art. 37) tiene por no convenidas las cláusulas que restringen derechos del consumidor o amplían los del proveedor, y el CCyC (arts. 1119-1122) hace lo mismo en contratos de consumo. Hay precedentes contra cargos por dar de baja un servicio. En cambio, **el 1% al ejecutar es precio del servicio**: el art. 1121 CCyC dice que las cláusulas sobre la relación entre precio y servicio no se pueden declarar abusivas. Comparable bancario: el plazo fijo UVA precancelable no cobra fee sobre el capital, solo paga menos tasa.
3. **Regulación cripto.** Trabar o administrar fondos ajenos se parece a "custodia o administración por cuenta de otro", que la Ley 27.739 y la RG 1058/2025 de la CNV ponen bajo el registro PSAV (patrimonio mínimo USD 150.000 para custodia). Que lo **no custodial** quede afuera tiene fuentes en conflicto [SIN VERIFICAR]: el diseño sin admin y con retiro libre es nuestro mejor argumento para quedar afuera.
4. **Negocio.** El costo hundido de un usuario que se va es centavos de gas. El que retira y vuelve a cargar sigue en el embudo. El que retira "después de usarnos gratis" es costo de adquisición, como el free tier de cualquier SaaS. El gas a escala lo paga el B2B (USD 0,50/bóveda/mes) y el 1% al ejecutar.

**Alternativa documentada, no elegida:** fee de servicio **pro-rata** descontado al salir, solo en el Plan Familia pago (ej. 0,3% anual por el tiempo que estuvo activo; nunca una multa; cero en el plan gratis). Queda en el roadmap como opción para marca blanca B2B, donde el que paga es la billetera, no la persona.

**Cómo se responde en el Q&A:** *"Si Marta retira, no pasa nada: es su plata y además es la mejor señal de que está bien. Nosotros cobramos solo cuando el servicio hizo su trabajo: 1% al liberar, escrito en el contrato y visible en Snowtrace. Cobrar por retirar sería una cláusula abusiva y nos convertiría en custodios."*

---

## 5. Plan de hoy: 6 cosas que no mueven ningún corte

Regla ⏱ de `MEJORAS_LLAVE.md`: si a las 14:25 P1 no tiene ≥18 tests en verde, lo marcado ⏱ pasa a la instancia final de las 16:15 (P1-12).

| # | Qué | Quién | Cuándo | Min | Terminado cuando |
|---|---|---|---|---|---|
| **A1** ⏱ | Comisión on-chain: `comisionBps` + `tesoreria` immutables, descuento en `cobrar()`, evento `ComisionCobrada`, `parteDe()` neto, 2 tests (§6). **Solo agrega** a la interfaz (2 params de constructor): P1 regenera el ABI y avisa "ABI v2" | P1 | con las mejoras "YA" o a las 16:15 | 20 | `forge test` verde con los 2 tests; `Cobrado` + `ComisionCobrada` en la misma tx |
| **A2** | Stand de 0xGasless: ¿política de patrocinio (allowlist/webhook) en el dashboard? (combo +20) · ¿pre-alta de embedded wallet por email? · Stand de KUMPLY: ¿atestan smart accounts? | P4 | ya | 10 | respuestas en el chat; P4 decide si se reclama el combo |
| **A3** | Presets de reparto en `/dueno` ("Partes iguales" / "Porcentajes" / "Un solo destino") + línea *"Solo sobre la porción disponible de tu herencia"* + *"Comisión Llave: 1% al liberar"* en `/heredero` | P3 | 15:30-16:15 | 20 | se ve en las dos pantallas; los bps de "Partes iguales" suman 10.000 |
| **A4** | `keeper/avisos.ts` + bot de Telegram (§7): polling de `estado()`, avisos T-30 s / T-10 s, alerta en `ReclamoIniciado`, link a la web. Carpeta nueva, **no toca `web/src/lib/`** | P2 (o Claude en una rama aparte) | 15:30-16:15 | 40 | un mensaje real en el Telegram de "Marta" durante el ensayo; captura para el README |
| **A5** | README: "Modelo de negocio" (§8.1), "¿Y si retiro antes?" (§8.2), "Aviso legal" (§8.3), "Por qué no Privy ni Safe hoy" (§8.4), "Por qué Avalanche" + reloj (§8.5) | P4 | 16:15-16:30 | 25 | secciones pegadas con sus fuentes |
| **A6** | Guion: 10 s en 1:05 para el aviso de Telegram; respuestas nuevas a "¿y si retiro?" y "¿cuánto cobran?" (§9) | P4 | 16:30 | 10 | §13 del plan de producto actualizado |

**No entra hoy (va al roadmap, §10):** fondo común con Safe y `destinoDePago`; pre-alta por email; reclamo con 2 firmas; comisión en emergencias; tope de comisión en pesos; fee pro-rata del Plan Familia; señal EIP-712 relayada; paymaster condicionado a KUMPLY (salvo que el stand lo habilite hoy); Chainlink CRE; mainnet con ARGt (solo medio de pago, nunca rendimiento); L1 institucional + ICM.

---

## 6. Cambio de contrato para P1 (A1): comisión al liberar

Encaja en la interfaz congelada de `PLAN_CONSTRUCCION_LLAVE.md` §2.2: **solo agrega**. No toca `Estado` (los immutables públicos ya exponen `comisionBps()` y `tesoreria()`).

```solidity
// ───────────── Constantes (agregar) ─────────────
uint16 public constant COMISION_MAX_BPS = 100;          // 1%

// ───────────── Estado (agregar) ─────────────
uint16  public immutable comisionBps;                   // 0..100; 0 = sin comisión
address public immutable tesoreria;                     // recibe la comisión

// ───────────── Eventos / errores (agregar) ─────────────
event ComisionCobrada(address indexed tesoreria, uint256 monto);
error ComisionInvalida(uint16 bps);

// ───────────── Constructor (2 params más, al final) ─────────────
constructor(IKumplyAttestationStore store, IERC20 token_, uint64 periodoMinimo_, Config memory c,
            uint16 comisionBps_, address tesoreria_) KumplyGated(store) {
    if (comisionBps_ > COMISION_MAX_BPS) revert ComisionInvalida(comisionBps_);
    if (comisionBps_ > 0 && tesoreria_ == address(0)) revert DireccionInvalida(tesoreria_);
    comisionBps = comisionBps_;
    tesoreria = tesoreria_;
    // ... resto igual
}

// ───────────── cobrar(): reemplaza la transferencia final ─────────────
uint256 bruto = foto * bps / BPS_TOTAL;
uint256 comision = bruto * comisionBps / BPS_TOTAL;
cobro[msg.sender] = true;                               // efectos antes de interacciones (CEI)
if (comision > 0) {
    token.safeTransfer(tesoreria, comision);
    emit ComisionCobrada(tesoreria, comision);
}
token.safeTransfer(msg.sender, bruto - comision);
emit Cobrado(msg.sender, bruto - comision);

// ───────────── parteDe(): devuelve el neto ─────────────
function parteDe(address h) external view returns (uint256) {
    (bool es, uint16 bps) = esHeredero(h);
    if (!es) return 0;
    uint256 base = foto == 0 ? token.balanceOf(address(this)) : foto;
    uint256 bruto = base * bps / BPS_TOTAL;
    return bruto - (bruto * comisionBps / BPS_TOTAL);
}
```

**Tests (se suman a los 21 del plan y a los 22-33 de las mejoras; numerar A1-a y A1-b):**
- **A1-a:** con `comisionBps = 100`, foto 1.000.000 y Lucía 60%: Lucía recibe **594.000**, la tesorería **6.000**, se emiten `ComisionCobrada(tesoreria, 6000)` y `Cobrado(lucia, 594000)` en la misma tx; `parteDe(lucia)` antes de cobrar = 594.000.
- **A1-b:** con `comisionBps = 0` no se emite `ComisionCobrada` y Lucía recibe 600.000. Constructor con `comisionBps = 101` → `ComisionInvalida`; con `100` y tesorería cero → `DireccionInvalida`.
- El fuzz 21 sigue valiendo: lo cobrado + comisiones ≤ foto.

**Deploy:** `DeployLlave.s.sol` lee `COMISION_BPS` (demo: `100`) y `TESORERIA` (una EOA nuestra, **no** una SA de la demo) de `.env`. En la demo, después de que Lucía cobra, Snowtrace muestra las dos transferencias: es la respuesta visual a "¿cómo ganan plata?".

**ABI:** P1 corre `export-abi` y avisa "ABI v2". La web no llama al constructor: P2 solo agrega las lecturas `comisionBps()`/`tesoreria()` para el texto de A3.

---

## 7. Keeper de avisos por Telegram (A4)

Carpeta nueva `keeper/` (Node 20, `viem`, sin framework). No toca `web/src/lib/`. En producción corre como cron; en la demo, en la compu de P2 durante el ensayo.

**Setup (5 min):** crear el bot con @BotFather → `TELEGRAM_BOT_TOKEN`. "Marta" abre el bot y manda `/start`; `https://api.telegram.org/bot<token>/getUpdates` devuelve su `chat_id` → `TELEGRAM_CHAT_ID_DUENO`. Variables: `FUJI_RPC_URL`, `LLAVE_ADDRESS`, `WEB_URL`. Nada de esto va al repo (`.env` ignorado).

**Lógica (`keeper/avisos.ts`, ~80 líneas):**
```ts
// cada 5 s
const e = await llave.read.estado();                   // ahora, venceEn, ultimaSenal, reclamoIniciadoEn, graciaTerminaEn
const faltan = Number(e.venceEn) - Number(e.ahora);
for (const umbral of UMBRALES) {                        // demo: [30, 10]; prod: [30d, 15d, 7d] en segundos
  if (faltan <= umbral && !avisado(e.ultimaSenal, umbral)) {     // un aviso por umbral por "época" (ultimaSenal)
    await telegram(`⏳ Marta, te quedan ${faltan} s para tocar "Estoy bien". ${WEB_URL}/dueno`);
    marcarAvisado(e.ultimaSenal, umbral);
  }
}
// logs de ReclamoIniciado desde el último bloque visto
for (const log of await llave.getEvents.ReclamoIniciado({ fromBlock })) {
  await telegram(`🚨 ${nombre(log.args.heredero)} inició un reclamo. Tenés hasta ${hora(log.args.graciaTerminaEn)} para cancelarlo tocando "Estoy bien". ${WEB_URL}/dueno`);
}
```
// (c) KUMPLY en el aviso: el heredero que no pasa el gate se entera antes de intentar cobrar
for (const h of await llave.read.herederos()) {
  const ok = await kumply.read.isPersonAtLeast([h.cuenta, 2]);          // mismo gate que usa cobrar()
  if (!ok && !avisadoKyc(h.cuenta)) {
    await telegram(`🪪 ${nombre(h.cuenta)}, tu parte (${porcentaje(h.bps)}) te espera en la Llave de Marta, pero para cobrarla tenés que verificar tu identidad. ${WEB_URL}/heredero`);
    marcarAvisadoKyc(h.cuenta);
  }
}
```
`telegram()` es un `fetch` a `https://api.telegram.org/bot<token>/sendMessage` con `{chat_id, text}`. Se corre con `npx tsx keeper/avisos.ts`. El aviso (c) lee la **misma** función del contrato (`isPersonAtLeast`, heredada de `KumplyGated`) que decide si `cobrar()` pasa: suma al argumento "la verificación es el corazón del producto" (KUMPLY core) sin tocar el contrato.

**En el README:** captura del mensaje + 3 líneas: "No hay cron on-chain; el contrato usa `block.timestamp` (recomendación de Ava Labs para la C-Chain) y un keeper off-chain avisa antes del vencimiento. En producción: Chainlink CRE o un relayer propio, y los tres canales (Telegram, WhatsApp, email)."

---

## 8. Textos listos para el README (A5, P4)

### 8.1 Modelo de negocio
> **Problema:** la plata en dólares o pesos digitales se congela cuando el dueño muere o queda incapacitado; la sucesión tarda meses y cuesta entre 6% y 15% del patrimonio; sin claves, la cripto se pierde.
> **Cliente:** B2C, personas y familias que ahorran en stablecoins (o la hija que le arma la Llave a su madre). B2B (el que escala): billeteras, exchanges y bancos digitales que ya tienen a esos usuarios y su KYC.
> **Ingresos:** (1) **1% al liberar la herencia**, cobrado por el contrato (`comisionBps`, immutable, visible en Snowtrace). (2) Plan Familia USD 2/mes (más herederos, más guardianes, avisos por WhatsApp). (3) Marca blanca B2B: USD 0,50 por bóveda activa por mes. **El gas lo pagamos nosotros** (0xGasless): un "Estoy bien" por mes cuesta centavos [medido en `docs/finalidad.md`].
> **Ventaja:** nadie junta (1) plata en stablecoins que se mueve sola por inactividad, (2) herederos con identidad verificada on-chain, (3) retiro de emergencia 2-de-3 con tope y (4) alta con email sin gas. Comparables: Vault12 USD 49,99/mes, Casa desde USD 250/año, Kresus USD 99,99/año, Nunchuk 0,3% al reclamar. Ninguno verifica al heredero ni mueve stablecoins en pesos.

### 8.2 ¿Y si retiro mi plata antes?
> Retirás cuando quieras, sin costo. Retirar también cuenta como "Estoy bien". No cobramos por sacar tu plata: sería una cláusula abusiva (Ley 24.240, art. 37) y nos convertiría en custodios. Cobramos solo cuando el servicio hizo su trabajo: 1% al liberar la herencia, escrito en el contrato.

### 8.3 Aviso legal
> Llave de Emergencia **no reemplaza la sucesión ni un testamento**: es un plan de continuidad y liquidez para que la plata no se pierda sin claves y la familia tenga acceso mientras sale la sucesión. En Argentina existen herederos forzosos: los descendientes tienen reservados 2/3 de la herencia, ascendientes y cónyuge 1/2 (art. 2445 CCyC); los porcentajes que configurás solo son seguros sobre la porción disponible, y los bienes igual se declaran en la sucesión. El pacto sobre herencia futura está prohibido (art. 1010 CCyC), por eso esto no es una forma de heredar sino una herramienta de ejecución. La inactividad no prueba la muerte (la presunción de fallecimiento exige 3 años, art. 85 CCyC): por eso hay aviso, gracia, veto y guardianes. No usamos la figura del mandato (se extingue con la muerte o incapacidad, art. 1329 CCyC). No es asesoramiento legal.

### 8.4 Por qué no Privy ni Safe hoy
> **Privy** tiene wallets pregeneradas por email, pero su patrocinio de gas usa EIP-7702, que no está activo en Avalanche (ACP-209 sigue propuesta). Usamos la embedded wallet de **0xGasless**, que patrocina en Fuji hoy. **Safe** está desplegado en Fuji, pero su módulo 4337 no, y su web dejó de soportar la C-Chain en junio de 2026; además, nuestro gate de identidad no deja cobrar a un contrato. La 2-de-3 de guardianes vive en nuestro contrato, con tope, destino verificado y veto. Safe queda como "fondo común familiar" en el roadmap.

### 8.5 Agregar a "Por qué Avalanche"
> **Reloj correcto para un contrato de inactividad.** La C-Chain produce bloques solo cuando hay transacciones y Ava Labs recomienda usar `block.timestamp` en vez del número de bloque. Nuestro contrato mide los plazos con `block.timestamp` y expone `ahora` para que la web corrija su reloj; el aviso previo lo hace un keeper off-chain. Finalidad de la C-Chain medida hoy: [p50/p95 de `docs/finalidad.md`].

### 8.6 Bonus (sección obligatoria si se reclaman)
> **0xGasless (core):** componente `@0xgasless/core` (embedded wallet con login por email + smart account + paymaster). Por qué: Marta, Lucía y los guardianes nunca compran AVAX. Tx patrocinadas: `SenalDeVida` [link], `EmergenciaPropuesta` [link], `ReclamoIniciado` [link], `Cobrado` [link]. Saldo AVAX de las cuentas: 0 [captura].
> **KUMPLY (core):** `@kumply/sdk` en la web (semáforo) y gate on-chain con `isPersonAtLeast(…, 2)` en `iniciarReclamo`/`cobrar`/guardianes e `isBusiness` en el destino de emergencia. Pasa: Lucía [link `Cobrado`]. Bloqueada: Tomás [link tx revertida `NotPerson`]. No usamos `hasTier()`. **Las atestaciones de KUMPLY en Fuji son de demo, emitidas por el staff, sin verificación de identidad real.**

---

## 9. Guion y Q&A (A6)
- **1:05 (10 s nuevos):** "El panel llega a 10 segundos y a Marta le suena el celular: *'Te quedan 10 segundos para tocar Estoy bien'*. Hoy no lo toca."
- **"¿Y si Marta retira la plata antes?"** → §4, último párrafo.
- **"¿Cómo ganan plata?"** → "1% al liberar, escrito en el contrato. Acá está en Snowtrace: la tx de Lucía tiene dos transferencias, 594.000 para ella y 6.000 para la tesorería. Contra 6 a 15% de una sucesión."
- **"¿Por qué no Privy / Safe?"** → §8.4 en una frase cada uno.
- **"¿Esto es legal?"** → §8.3: "no reemplaza la sucesión; respeta la legítima porque los bienes igual se declaran; no es mandato; es un plan de continuidad."

---

## 10. Roadmap (para el README, no se construye hoy)
1. **Alta por invitación:** el dueño carga el email del heredero y la cuenta queda pre-creada (0xGasless si lo tiene; si no, Privy pregenerated wallets).
2. **Fondo común familiar:** `destinoDePago` por heredero + Safe v1.4.1 como destino (cuando `Safe4337Module` esté en Avalanche o con Ash Wallet).
3. **Reclamo con 2 firmas** (heredero + guardián) y **rotación de dueño 2-de-3 con demora**.
4. **Comisión 0,5% en emergencias** y **tope de comisión** en pesos; fee pro-rata solo en marca blanca B2B.
5. **Señal de vida por firma EIP-712** relayada en lote (OZ `ERC2771Forwarder`): costo por señal casi cero.
6. **Keeper gestionado** (Chainlink CRE) + tres canales de aviso (Telegram, WhatsApp Cloud API, email).
7. **Paymaster condicionado a KUMPLY** (el combo +20) cuando el lane patrocine personas, no solo agentes.
8. **Liberación total con confirmación** (acta de defunción o 2 guardianes) y liberación parcial por inactividad: cierra el riesgo de "reaparece a los 90 días".
9. **Mainnet con ARGt de Twin** como medio de pago (nunca rendimiento: la CNV frenó ARGt en marzo 2026 por prometer APR). **L1 institucional + ICM** para bancos.

---

## 11. Fuentes
| Tema | Fuente |
|---|---|
| Reglas del track | PDF "HackaTwin — Blockchain Track Rules and Requirements (EN)", 16/10/2026 (organización) |
| C-Chain: bloques solo con tx, usar `block.timestamp` | https://github.com/ava-labs/coreth/blob/master/README.md · https://support.avax.network/en/articles/6093276-how-do-avalanche-blocks-differ-from-ethereum-s |
| Tiempo mínimo de bloque dinámico (Granite, ACP-226) | https://build.avax.network/docs/acps/226-dynamic-minimum-block-times |
| EIP-7702 no activo en Avalanche (ACP-209, Helicon) | https://build.avax.network/docs/acps/209-eip7702-style-account-abstraction · https://docs.avax.network/docs/primary-network/helicon-upgrade |
| Chainlink Automation dado de baja → CRE | https://docs.chain.link/cre/reference/cla-migration-go.md · https://docs.chain.link/cre/supported-networks-ts.md |
| OpenZeppelin Defender cerrado | https://www.openzeppelin.com/news/doubling-down-on-open-source-and-phasing-out-defender |
| Privy: wallets pregeneradas, gas, smart wallets, policies, Stripe | https://docs.privy.io/recipes/pregenerate-wallets · https://docs.privy.io/wallets/gas-and-asset-management/gas/overview.md · https://docs.privy.io/wallets/using-wallets/evm-smart-wallets/overview.md · https://privy.io/blog/policy-engine · https://www.theblock.co/post/357803/ |
| 0xGasless: docs, Fuji por defecto (PR 21/10/2026) | https://docs.0xgasless.com/ · https://build.avax.network/integrations/0xgasless · https://github.com/0xgasless/0xgasless-core/pull/1 |
| Safe en Avalanche; módulo 4337 ausente; Safe app sin C-Chain; Ash | https://github.com/safe-global/safe-deployments · https://github.com/safe-global/safe-modules-deployments · https://crypto-economy.com/ash-wallet-goes-live-on-avalanche-c-chain-mainnet/ |
| Módulo Safe dead man's switch (Blockful) | https://forum.safefoundation.org/t/dead-man-s-switch-module/6948 · https://github.com/blockful/deadman-switch-safe |
| Nunchuk 0,3% al reclamar | https://nunchuk.io/blog/autonomous-inheritance |
| Argent: guardianes + 36 h + avisos | https://support.argent.xyz/hc/en-us/articles/360022629212 |
| Webacy 1% al ejecutar | https://docs.webacy.com/product-guides/crypto-will [SIN VERIFICAR: 404] |
| Vault12, Casa, Kresus, Ledger Recover, Bron | https://vault12.com/help/faqs/payments/ · https://www.theblock.co/post/285090/casa-expands-self-custody-inheritance-solution-globally-bitcoin-ether-stablecoins · https://hackernoon.com/who-inherits-your-bitcoin-when-you-die-kresus-wants-an-answer-built-into-the-wallet · https://nobsbitcoin.com/ledger-launched-its-recover-service · https://unchainedcrypto.com/self-custody-startup-bron-adds-inheritance-flow-built-around-guardians-and-mpc/ |
| Señal relayada (ERC-2771 forwarder) | https://docs.openzeppelin.com/contracts/api/metatx |
| Telegram Bot API; WhatsApp sandbox; Resend | https://core.telegram.org/bots/api · https://www.twilio.com/docs/whatsapp/sandbox · https://help.wanotifier.com/en/article/test-phone-number-limitations-kt0ly2/ · https://resend.com/docs/knowledge-base/what-is-resend-pricing |
| Legítima (art. 2445) y acción de reducción | https://codigocivilonline.com.ar/etiquetas/articulo-2445/ · https://abogados.com.ar/transmision-hereditaria-de-las-criptomonedas/38008 |
| Pacto sobre herencia futura (art. 1010) | https://www.cronista.com/informacion-gral/que-es-el-pacto-de-herencia-futura-y-por-que-esta-prohibido-en-argentina/ |
| Mandato se extingue por muerte o incapacidad (art. 1329 e) | https://codigocivilonline.com.ar/etiquetas/articulo-1329/ |
| Presunción de fallecimiento (arts. 85 y 92) y fallo 2025 | https://codigocivilonline.com.ar/articulo-85/ · https://www.conceptosjuridicos.com/ar/articulos/codigo-civil-y-comercial-articulo-92/ · https://aldiaargentina.microjuris.com/2025/06/04/fallos-presuncion-de-fallecimiento-el-solo-transcurso-del-tiempo-y-la-avanzada-edad-no-son-elementos-validos-por-si-solos-para-tener-por-configurada-la-muerte-de-una-persona/ |
| Cláusulas abusivas (Ley 24.240 art. 37; CCyC 1121); cargos por baja | https://abogados.com.ar/la-aplicacion-de-sanciones-por-la-inclusion-de-clausulas-abusivas-en-los-contratos-de-consumo/29983 · https://leyfacil.com.ar/codigo-civil-y-comercial/articulo-1121/ · https://www.diariojudicial.com/news-63726-por-que-hay-que-pagar-para-dar-de-baja-una-linea |
| Plazo fijo UVA precancelable (sin fee sobre capital) | https://www.cronista.com/finanzas-mercados/plazo-fijo-uva-precancelable-que-bancos-lo-ofreceran-y-cuales-son-los-plazos |
| PSAV: Ley 27.739, RG 1058/2025, RG 1172/2026, UIF 49/2024 | https://beccarvarela.com/novedades/regulacion-de-proveedores-de-servicios-de-activos-virtuales-en-argentina-ley-n-27-739/ · https://abogados.com.ar/resolucion-general-cnv-n1058-regulacion-de-proveedores-de-servicios-de-activos-virtuales-psav/36529 · https://www.estudio-ofarrell.com/la-cnv-reglamenta-las-actividades-de-los-proveedores-de-servicios-de-activos-virtuales-psav/ · https://abogados.com.ar/del-registro-a-la-gestion-del-riesgo-la-nueva-agenda-legal-de-los-psav-tras-la-rg-11722026-de-la-cnv/40354 · https://bruchoufunes.com/nuevas-resoluciones-de-uif-y-cnv-sobre-proveedores-de-servicios-de-activos-virtuales-psav/ |
| CNV vs ARGt (marzo 2026) | https://www.lanacion.com.ar/economia/IA/la-cnv-ordeno-frenar-las-actividades-de-una-criptomoneda-que-funciona-como-una-version-digital-del-nid12032026/ · https://www.iproup.com/economia-digital/66852-cnv-levanta-la-sancion-contra-belo-y-twin-por-la-stablecoin-del-peso-argt |
| BCRA: bancos y PSP sin cripto (A 7506, A 7759) | https://www.marval.com/publicacion/el-bcra-prohibe-a-los-psp-realizar-y-facilitar-a-sus-clientes-operaciones-con-criptoactivos-15478 |
| Costo de una sucesión (PBA, 2026) | https://www.iprofesional.com/impuestos/449527-honorarios-tasas-e-impuestos-cuanto-sale-una-sucesion-en-provincia-de-buenos-aires · https://www.cronista.com/economia-politica/cuanto-cuesta-una-sucesion-en-2026-ley-nacional-de-honorarios-y-gastos-ocultos/ |

## 12. [SIN VERIFICAR] (no decir como hecho)
- Costo real de un `estoyBien` patrocinado en Fuji y en mainnet (P4-9 lo mide).
- Detalles del piloto "patrocinio condicionado a KUMPLY" de 0xGasless y si el dashboard tiene políticas de patrocinio (A2 lo pregunta).
- Si 0xGasless tiene pre-alta de embedded wallet por email (A2).
- Smart wallet 4337 de Privy con paymaster externo en Fuji.
- Webacy 1% al ejecutar (la página da 404).
- Que lo no custodial quede fuera del registro PSAV (RG 1058): dos estudios jurídicos dicen cosas distintas.
- Cifra exacta del costo total de una sucesión (las fuentes van de 6% a 15%).
