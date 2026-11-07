# Plan de Gabriel (P2 · web ↔ contrato + 0xGasless) · sáb 7/11/2026, 13:55 → 18:00

Tu misión en una línea: **que Marta, Lucía y los guardianes entren con email y nunca paguen gas (bonus 0xGasless core +10), que todos los botones manden tx reales al contrato, y que el punta a punta en Fuji esté a las 15:30.**
Fuentes: `PLAN_CONSTRUCCION_LLAVE.md` (P2-1 a P2-9, §2.7, §8.2), `MEJORAS_LLAVE.md` (mejoras 4, 13, 16, 17), `COMPLEMENTO_LLAVE.md` (A3 textos, A4 keeper, §7). Cortes: **14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00**.

---

## 0. Cómo nos comunicamos (igual para los 4)
- **La conversación del equipo son los comentarios del PR #2** (https://github.com/dav1dchaparro/hackatwin/pull/2). No se mergea nunca. Si una decisión o un desbloqueo no está en el PR #2, no pasó.
- **Abrí una sesión remota de Claude Code que vigile el PR #2.** Una sesión **aparte** (claude.ai/code sobre el repo, o `claude --bg` desde la carpeta del repo), **no un subagente** dentro de la sesión en la que programás. Hace dos cosas: te avisa cada comentario nuevo y publica tu estado cuando le decís "terminé X". Pegale este prompt:

> Vigilá el PR #2 de dav1dchaparro/hackatwin (usá `gh` con una cuenta que vea el repo). Es el canal de conversación del equipo: los comentarios son la conversación. Cada 60 s leé los comentarios nuevos (conversación, reviews e inline) y mostrámelos resumidos con autor y hora; si alguno me menciona, menciona a P2 o dice "bloqueado", destacalo. Cuando yo te escriba "terminé <bloque>" o "bloqueado por <algo>", publicá un comentario en el PR #2 con este formato exacto, en una sola línea:
> `✅ P2 Gabriel · HH:MM · Terminé: <bloque> · Evidencia: <link o hash> · ➡️ Desbloquea: <P# tarea> · ⏳ Espero: <P# tarea> · 🚧 Bloqueado por: <nada / qué>`
> No publiques nada que yo no te haya pedido y no toques código.

- **Cuándo publicar estado, sin que nadie lo pida:** (1) al terminar cada bloque de abajo; (2) en cada corte (14:30, 15:30, 16:15, 16:30, 17:30) aunque no hayas terminado: "estoy en X, me falta Y"; (3) **apenas quedás bloqueado más de 10 minutos**, con 🚧 y a quién necesitás; (4) cuando desbloqueás a alguien (direcciones, hashes, `lib/`), con el link.
- **Antes de empezar cada bloque, leé los últimos comentarios del PR #2** (tu sesión remota te los pasa). Si algo te cambia el bloque, mandá eso primero.

---

## 1. Lo que los otros esperan de vos (tus desbloqueos)
| Qué | Para quién | Para cuándo | Cómo lo publicás |
|---|---|---|---|
| Las **4 direcciones de smart account** (Marta, Lucía, Pablo, Rosa) | P4 → pedido a KUMPLY; P1 (constructor) | **ya** (era 13:25) | ✅ con la tabla alias → dirección (solo públicas). **Es el desbloqueo más urgente del equipo** |
| `lib/config.ts` + `lib/gasless.ts` mergeados (`feature/web-gasless`) | P3 (importa de `lib/`, no lo edita) | 14:00 | ✅ "login con email anda y sobrevive a F5" |
| **1.ª tx patrocinada** (hash) + captura "AVAX de la SA = 0" | P4 (README bonus G1), P3 (chip "gas pagado por 0xGasless") | 14:15 | ✅ con hash en Snowtrace y captura |
| `lib/cliente-fuji.ts` lecturas (`estado()`, `herederos()`, `guardianes()`, `emergencias()`, eventos) | P3 (modo fuji) | 14:50 | ✅ "con `VITE_MODO=fuji` el panel muestra la instancia A" |
| Escrituras + `errores.ts` en castellano (incluye los errores nuevos: `DestinoNoPermitido`, `EmergenciaCerrada`, `ComisionInvalida`) | P3 | 15:25 | ✅ "los 9 métodos mandan tx; errores sin mandar la tx" |
| Hashes del **punta a punta** + reclamo cancelado + veto (instancia corta de P1) | P4 (`docs/evidencias.md`) | 16:00 | ✅ con la lista de hashes |
| `lib/kumply.ts` (semáforo con `@kumply/sdk`, fallback `verify()`) | P3 (badges), P4 (K1) | 15:30 | ✅ "badge verde Lucía, rojo Tomás, empresa Clínica, con `fuente`" |
| Captura del aviso de Telegram (A4) | P4 (README) y guion (1:05) | 16:30 | ✅ con la captura |
| `web/README.md` + URL pública de la web (si hay hosting a mano) | P4 (O2, O5) | 16:45 | ✅ con link |

## 2. Lo que vos esperás de otros (y el plan B si no llega)
| Qué | De quién | Para cuándo | Si no llega |
|---|---|---|---|
| ABI v1 + dirección de `MockPesos` | P1 | 13:30 / 13:45 | Hasta entonces, sandbox de 0xGasless fuera del repo (P2-1); `faucet()` de MockPesos sirve para la 1.ª tx |
| Instancia A verificada + `fuji.json` | P1 | 14:30 | Programás contra el mock de P3 hasta las 14:30; `?llave=` cambia de instancia sin recompilar |
| ABI v2 (mejoras 1-5 + comisión) | P1 | 16:15 | `errores.ts` con los nombres de §2.2 + los nuevos listados arriba; si un error no existe, no rompe nada |
| Emails de prueba (4 casillas) | P4 | ya | Si 0xGasless no toma `+alias` como cuentas distintas, 4 casillas reales |
| Respuesta del stand: ¿política de patrocinio por allowlist/webhook? (combo +20) | P4 (A2) | 15:00 | P2-8 queda como política en el cliente y **no se reclama** el combo |
| Keeper de avisos (A4): aviso T-30 s / T-10 s al dueño, alerta al iniciar reclamo y **aviso KUMPLY al heredero sin verificar** ("Tomás, tu parte te espera: verificá tu identidad", leyendo `isPersonAtLeast` del contrato) | Claude, en `feature/keeper-avisos` (decile "dale" cuando quieras) | 16:15 | Vos solo creás el bot en @BotFather (5 min) y probás los mensajes en el ensayo de las 16:30 |

## 3. Tus bloques, en orden
| Hora | Bloque | Min | Terminado cuando | Estado que publicás |
|---|---|---|---|---|
| 13:55-14:05 | **Cerrar P2-1 si falta:** 4 SA logueadas con email en el sandbox; confirmar las firmas reales del SDK (`OxGasClient`, `setupSmartAccount`, `sendTransaction`/`sendBatchTransactions`) | 10 | 4 direcciones en el PR #2 | ✅ **"4 SA: …"**. **Desbloquea P4-4 (KUMPLY) y P1-6 (constructor)** |
| 14:05-14:20 | **P2-2** `lib/config.ts` (env, chain Fuji, `?llave=`) + `lib/gasless.ts` (entrar, salir, sesión persistida, `enviar(calls[])`). Rama `feature/web-gasless`, PR a `develop` (lo revisa P1 en ≤5 min) | 15 | en la web real, "Entrar" muestra la SA y sobrevive a F5 | ✅. **Desbloquea P3** |
| 14:20-14:35 | **P2-3 1.ª tx patrocinada:** `MockPesos.faucet()` desde la SA de Marta | 15 | hash en Snowtrace, **AVAX de la SA = 0** (captura) | ✅ con hash y captura. **Desbloquea G1 (P4)**. Si falla: 🚧 con el error exacto → P4 al stand; probás el paymaster por defecto del dashboard |
| **14:30** | **Corte: instancia A verificada (P1).** Si no está, seguís con mock | — | — | Estado del corte |
| 14:35-15:05 | **P2-4 lecturas** `lib/cliente-fuji.ts`: `estado()`, `herederos()`, `guardianes()`, `emergencias()`, `saldoDe`, eventos con `getLogs` cada 2 s. Más `comisionBps()`/`tesoreria()` para el texto "Comisión 1%" de P3 (si P1 hizo A1) | 30 | con `VITE_MODO=fuji` el panel muestra la instancia A | ✅. **Desbloquea P3-8** |
| 15:05-15:30 | **P2-5 escrituras:** `simulateContract` (account = SA) → `decodeErrorResult` + `errores.ts`; si no revierte, `enviar` y medir ms hasta el receipt (los **dos tiempos**: envío→incluida vía 0xGasless / incluida = final). `cargarPesosDePrueba` = batch faucet+approve+depositar. Incluye `DestinoNoPermitido` ("Ese destino no está en la lista de Marta"), `EmergenciaCerrada` ("Este pedido caducó"), `ComisionInvalida` | 25 | los 9 métodos mandan tx patrocinadas; un error del contrato se ve en castellano **sin** mandar la tx | ✅. **Desbloquea P3-5/P3-6 en fuji** |
| **15:30-16:00** | **P2-7 punta a punta con P3 en Fuji:** estoyBien → emergencia 2/3 → reclamo → cobrar (Lucía OK, Tomás bloqueado). En la instancia corta de P1-8 (b): grabar **reclamo cancelado** por "Estoy bien" y un **veto** | 30 | hashes del recorrido + `ReclamoCancelado` + `EmergenciaVetada` | ✅ con todos los hashes. **Desbloquea P4-7 (evidencias) y P4-8 (guion con tiempos reales)** |
| 15:30-15:45 (en paralelo con las esperas) | **P2-6** `lib/kumply.ts`: `@kumply/sdk` (`KumplyClient({ network: "fuji", contractAddress })`, `isPersonAtLeast(addr, 2)`, `isBusiness`); fallback a `verify()` con viem **declarado, no silencioso** (mejora 13) | 15 | badges correctos con `fuente` | ✅. **Desbloquea K1 (P4)** |
| 16:00-16:15 | **P2-8** política de patrocinio en el cliente (solo manda userOp si la SA es la dueña o pasa `isPersonAtLeast(sa, 2)`) + **mejora 17** "Caducó" leyendo `emergenciaVigente(id)` (2 min). Mejora 16 (agente por el lane conjunto, 30 min) **solo si todo lo anterior está verde y el stand confirmó acceso**; si no, no | 15 | un email sin verificar ve "Tu cuenta tiene que estar verificada para operar sin gas" | ✅. P4 decide si reclama el combo (solo si el stand lo habilitó como paymaster real) |
| **16:15** | **FREEZE.** Solo bugs. Crear el bot en @BotFather y pasarle el token al keeper (fuera del repo) | 5 | `getUpdates` devuelve el `chat_id` de "Marta" | — |
| 16:15-16:45 | **P2-9** `web/README.md` (correr la web, variables, cómo se usa 0xGasless) + deploy público si hay hosting a mano | 30 | `npm ci && npm run dev` anda en una compu limpia siguiendo el README | ✅ con URL. **Desbloquea O2/O5 (P4)** |
| 16:30-17:00 | **Ensayo 1 = grabación del video.** Vos manejás la web y el celu de Marta (el narrador no toca dispositivos). Checklist antes de salir: señal hecha, tope $200.000, 3 sesiones logueadas, instancia B abierta en otra pestaña, video a mano | — | — | — |
| 17:00-17:15 | Ensayo 2 con reloj (instancia nueva). Revisás el PR de P1 (≤5 min) | — | — | — |
| **17:15** | **Último merge.** Lo que no esté en `develop` a las 17:20 no entra | — | — | ✅ "mis ramas mergeadas" |
| 17:30-18:00 | Colchón. No se toca código | — | — | — |

## 4. Tu parte del checklist de entrega
- **O2** web conectada: tx hechas **desde la web** (`SenalDeVida`, `Cobrado`) + URL o "cómo correrla".
- **G1** 0xGasless core: login con email; links de `SenalDeVida`, `EmergenciaPropuesta`, `ReclamoIniciado`, `Cobrado` patrocinadas; captura AVAX = 0.
- **K1** `@kumply/sdk` en la web (semáforo) sin fallback silencioso.
- **Mejora 13 (tu parte, 20 min repartidos):** todas las tx del usuario por la SA patrocinada; ninguna firmada con EOA desde la web.
- **Ninguna API key en el repo** (`.env.local`, `.gitignore`).

## 5. Tus riesgos y plan B
1. **0xGasless no patrocina a las 14:35** (key sin saldo, paymaster exige depósito, SDK con otra firma, polyfills) → 🚧 inmediato con el error exacto; P4 al stand; probás el paymaster por defecto del dashboard. Si a las 15:30 sigue sin andar: Core/MetaMask con AVAX **solo para esa acción** (cambia `msg.sender`: hay que atestar esas EOAs) y se pierde el core +10; se deja **una** tx patrocinada para el básico +5.
2. **La demo se desincroniza** (reloj local vs `block.timestamp`) → `ahoraCadena` + 2 s de margen; instancia B pre-envejecida con `?llave=`.
3. **Te piden cosas por fuera** → todo pedido va al PR #2; si no está ahí, no existe.
