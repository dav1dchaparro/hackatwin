# Plan de Facundo (P4 · KUMPLY, cuentas, README, pitch, video y entrega) · sáb 7/11/2026, 13:55 → 18:00

Tu misión en una línea: **que las atestaciones lleguen, que el README cumpla los 6 obligatorios y los dos bonus con links reales, que haya video de respaldo a las 17:00 y que la entrega esté cargada antes de las 17:45.**
Fuentes: `PLAN_CONSTRUCCION_LLAVE.md` (P4-1 a P4-12, §7 checklist, §8.4 preguntas), `MEJORAS_LLAVE.md` (mejoras 5 (tier 5), 9, 10, 11, 12, 13), `COMPLEMENTO_LLAVE.md` (A2, A5, A6, §8 textos listos, §9, §10). Cortes: **14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00**.
**Sos el cuello de botella humano que vieron los validadores.** Por eso: los textos del README ya están escritos (§8 del complemento, se pegan), las evidencias las pega cada uno en el PR #2 y vos solo las copiás, y si a las 16:15 no hay datos de validación, se pone "Validación: pendiente" y se sigue.

---

## 0. Cómo nos comunicamos (igual para los 4)
- **La conversación del equipo son los comentarios del PR #2** (https://github.com/dav1dchaparro/hackatwin/pull/2). No se mergea nunca. Si una decisión o un desbloqueo no está en el PR #2, no pasó.
- **Abrí una sesión remota de Claude Code que vigile el PR #2.** Una sesión **aparte** (claude.ai/code sobre el repo, o `claude --bg` desde la carpeta del repo), **no un subagente** dentro de la sesión en la que escribís el README. Hace dos cosas: te avisa cada comentario nuevo y publica tu estado cuando le decís "terminé X". Pegale este prompt:

> Vigilá el PR #2 de dav1dchaparro/hackatwin (usá `gh` con una cuenta que vea el repo). Es el canal de conversación del equipo: los comentarios son la conversación. Cada 60 s leé los comentarios nuevos (conversación, reviews e inline) y mostrámelos resumidos con autor y hora; si alguno me menciona, menciona a P4, trae un hash o un link de Snowtrace, o dice "bloqueado", destacalo. Cuando yo te escriba "terminé <bloque>" o "bloqueado por <algo>", publicá un comentario en el PR #2 con este formato exacto, en una sola línea:
> `✅ P4 Facundo · HH:MM · Terminé: <bloque> · Evidencia: <link> · ➡️ Desbloquea: <P# tarea> · ⏳ Espero: <P# tarea> · 🚧 Bloqueado por: <nada / qué>`
> No publiques nada que yo no te haya pedido y no toques código.

- **Cuándo publicar estado, sin que nadie lo pida:** (1) al terminar cada bloque de abajo; (2) en cada corte (14:30, 15:30, 16:15, 16:30, 17:30) aunque no hayas terminado: "estoy en X, me falta Y"; (3) **apenas quedás bloqueado más de 10 minutos**, con 🚧 y a quién necesitás; (4) cuando desbloqueás a alguien (atestaciones, respuestas del stand, AVAX), con el dato.
- **Antes de empezar cada bloque, leé los últimos comentarios del PR #2** (tu sesión remota te los pasa). Para vos esto es doble: **cada hash o link que alguien publique va a `docs/evidencias.md` en el momento**, no al final.

---

## 1. Lo que los otros esperan de vos (tus desbloqueos)
| Qué | Para quién | Para cuándo | Cómo lo publicás |
|---|---|---|---|
| Respuestas del stand (A2): 0xGasless ¿política de patrocinio por allowlist/webhook en el dashboard? (combo +20) · ¿pre-alta de embedded wallet por email? · KUMPLY ¿atestan smart accounts? ¿hay **tier 5** para el agente ejecutor (mejora 5)? | P1 (mejora 5 sí/no), P2 (P2-8 y combo) | **14:10** | ✅ con las 4 respuestas textuales |
| Pedido formal a KUMPLY de tier 2 sobre las SA de Lucía, Pablo, Rosa (y Marta); Tomás **sin** atestación (P4-4) | P1, P2 | apenas P2 publique las 4 direcciones | ✅ "pedido entregado a las HH:MM, dicen que tarda X" |
| **Decisión 15:00: atestaciones oficiales o plan B** (`cast call 0xa3Bc…22dD "verify(address)…"` sobre las 4) | P1 (P1-10), P2 | 15:00 | ✅ "oficial: Lucía ✓ Pablo ✓ Rosa ✓" o "plan B: P1 despliega el store demo" |
| AVAX de Fuji en el deployer (≥0,5) y en Tomás (0,1); USDC de Fuji si se consigue (mejora 15) | P1 | ya / 16:30 | ✅ |
| `docs/evidencias.md` (acción → hash → link) al día | Todos, README | continuo 14:30→16:30 | ✅ a cada corte: "evidencias: N tx con link" |
| `docs/finalidad.md` (benchmark p50/p95 y costo, mejora 9) | README "Por qué Avalanche", P3 (recibo), guion | 15:15 | ✅ con los números |
| README raíz completo (6 obligatorios + bonus + negocio + legal) | Todos | **16:30** | ✅ con link |
| Video de respaldo ≤3 min | Todos | 17:00 | ✅ con link |
| **Entrega** (repo público, PR `develop → main`, formulario) | Todos | **17:45** | ✅ **"ENTREGADO"** con captura del formulario |

## 2. Lo que vos esperás de otros (y el plan B si no llega)
| Qué | De quién | Para cuándo | Si no llega |
|---|---|---|---|
| 4 direcciones de SA | P2 | ya | Te sentás con P2 y hacés los logins en su compu; a las 13:45 como máximo mandás el pedido a KUMPLY con lo que haya |
| Hashes de evidencia (Tomás revertido, reclamo cancelado, veto, punta a punta) | P1 (15:10), P2 (16:00) | 16:00 | Placeholders `TODO-link` en el README; los pedís con ⏳ en cada corte |
| `contracts/README.md` y `web/README.md` | P1 (15:45), P2 (16:45) | 16:45 | El README raíz enlaza y dice "ver carpeta"; no bloquea O5 |
| 4 capturas | P3 | 16:30 | Capturas del ensayo 1 que sacás vos |
| Instancias finales A y B verificadas | P1 | 16:15 | El README lleva la instancia A de las 14:30 (verificada) y se actualiza si llega la final |
| ABI v2 con comisión (A1) sí/no | P1 | 16:15 | Elegís el texto del README: **con A1** → "1% al liberar, cobrado por el contrato (`comisionBps`), visible en Snowtrace"; **sin A1** → "1% al liberar en el contrato de producción; el MVP de hoy lo documenta y no lo cobra" |

## 3. Tus bloques, en orden
| Hora | Bloque | Min | Terminado cuando | Estado que publicás |
|---|---|---|---|---|
| 13:55-14:10 | **A2 + mejora 5: stands.** 0xGasless: política de patrocinio (allowlist/webhook), pre-alta por email, ¿el paymaster del dashboard patrocina en Fuji sin depósito? KUMPLY: ¿atestan smart accounts?, ¿cuánto tardan?, **pedir tier 5 YA** para el agente ejecutor (si no existe, decirlo). Pedir AVAX/USDC si falta | 15 | 4 respuestas textuales | ✅. **Desbloquea P1 (mejora 5 sí/no), P2 (P2-8/combo)** |
| 14:10-14:30 | **P4-4 pedido formal a KUMPLY** apenas P2 publique las SA (si ya lo hiciste, confirmá en el PR #2 la hora y qué te dijeron) + `docs/cuentas.md` (alias → dirección, solo públicas). **P4-6 README raíz**: esqueleto con las 6 secciones obligatorias + bonus (lista en `PLAN_CONSTRUCCION_LLAVE.md` §7) y `TODO-link` donde falte | 20 | pedido entregado; README con encabezados | ✅ |
| **14:30** | **Corte.** Abrís `docs/evidencias.md` y pegás los links `#code` que P1 publicó | 5 | tabla con 2 links | Estado del corte |
| 14:30-15:00 | **P4-5 control de atestaciones** (14:40 y 15:00) con `cast call … verify(address)`. Entre controles: **"Por qué Avalanche"** del README: empezar por **compliance on-chain** (KUMPLY leído en la misma tx), finalidad (números a las 15:15), gasless, **reloj correcto (`block.timestamp`, texto §8.5 del complemento)**, visión L1 + ICM (roadmap, "NO DESPLEGADA") | 30 | sección escrita | ✅ |
| **15:00** | **Decisión atestaciones:** oficial o plan B (P1-10) | 5 | publicado | ✅ **"oficial" / "plan B"**. **Desbloquea P1-10** |
| 15:00-15:15 | **Mejora 9 benchmark de finalidad:** `scripts/medir-finalidad.sh` (20 `cast send` + 3 `estoyBien()`), p50/p95 y costo en `docs/finalidad.md` con hashes. **Solo cifras medidas** van al pitch (nunca "<1 s" si el cronómetro marca más) | 15 | `docs/finalidad.md` con números | ✅ con p50/p95. **Desbloquea P3 (recibo) y guion** |
| 15:15-16:00 | **P4-8 pitch + mejora 10 guion nuevo + A6:** arranca en la **clínica** (internación), herencia desde 1:10, **1:05: 10 s para el aviso de Telegram** ("le suena el celu a Marta"), 20 s de "por qué Avalanche" señalando logs y ms, "con la semilla Lucía saca el 100%; con la Llave, como mucho el tope y solo a la clínica", negocio (1% al liberar visible en Snowtrace), cierre. 5 slides. Tarjeta de preguntas difíciles: §13 del plan de producto + **§9 del complemento** ("¿y si retiro?", "¿cómo ganan plata?", "¿por qué no Privy/Safe?", "¿es legal?") | 45 | ensayado con reloj ≤2:50 | ✅ |
| **15:30** | **Corte: punta a punta.** Pegás los hashes que P2 publica en `docs/evidencias.md` | 5 | ≥8 tx con link | Estado del corte |
| 15:30-16:15 (en las esperas) | **Mejora 11 validación temprana:** 5 asistentes + mentores de billeteras + KUMPLY: "¿pagarías USD 2/mes por esto?", "¿a quién le pasó?". Números reales, aunque sean chicos. Si a las 16:15 no hay: "Validación: pendiente" | 25 | sección "Validación" | ✅ con los números |
| 16:00-16:30 | **Mejora 12 + A5 README negocio y legal:** pegar **§8.1 Modelo de negocio**, **§8.2 ¿Y si retiro antes?**, **§8.3 Aviso legal** (legítima 2/3, nunca "mandato", presunción 3 años, no reemplaza la sucesión, no es asesoramiento), **§8.4 Por qué no Privy ni Safe hoy**, **§8.6 Bonus** (componente, por qué, links; tabla de **3 casos que pasan y 3 bloqueados** con links, mejora 13), "Hecho hoy vs. reutilizado", "Límites conocidos" y roadmap (§10 del complemento). Elegir el texto del 1% según lo que publicó P1 (ver §2). `grep -r hasTier` = 0 | 30 | las 6 secciones obligatorias con encabezado propio y sin `TODO-link` salvo los que esperan tx | ✅ **"README completo"** |
| 16:15-16:30 | **P4-9 QA como jurado** en una compu limpia: clonar, `forge test`, `npm ci && npm run dev`, abrir cada link del README | 15 | lista de bugs entregada a P2/P3 | ✅ con la lista |
| **16:30-17:00** | **P4-10 video de respaldo** (ensayo 1 = grabación; pantalla + voz; instancia A nueva). Vos narrás, **no tocás dispositivos** | 30 | video subido y linkeado en el README | ✅ con link. **Desbloquea el plan B de la demo** |
| 17:00-17:15 | Ensayo 2 con reloj. **P4-11** si hay respuestas de validación: ponerlas. Revisás el PR de P3 (≤5 min) | 15 | — | — |
| **17:15-17:45** | **P4-12 entrega:** checklist §7 ítem por ítem, último merge `feature/* → develop` (17:15), repo **público**, PR `develop → main`, formulario con: repo, dirección del contrato verificado + link, video, pitch | 30 | **formulario enviado antes de las 17:45** | ✅ **"ENTREGADO"** con captura |
| 17:45-18:00 | Colchón. No se toca nada | — | — | — |

## 4. Tu parte del checklist de entrega
- **O3** "Por qué Avalanche" · **O4** modelo de negocio (+ validación) · **O5** repo público con instalación, deploy, arquitectura (diagrama §1.2 en `docs/arquitectura.md`) · **O6** "hecho hoy vs. reutilizado".
- **K5** sin `hasTier` + frase "Las atestaciones de KUMPLY en Fuji son de DEMO, emitidas por el staff, sin verificación KYC real" · **G2** 0xGasless explicado con links · **C** combo +20: **solo si el stand habilitó un paymaster real con política**; si no, no se reclama.
- **E1** video · **E2** aviso legal · **E4** repo público + PR `develop → main` + formulario.

## 5. Tus riesgos y plan B
1. **Saturación** → no escribís de cero: §8 del complemento se pega; las evidencias las publica cada uno en el PR #2 y vos copiás; si el README pasa de las 16:30, se arriesgan O4-O6: **cortá la validación y el roadmap, nunca los 6 obligatorios**.
2. **Atestaciones no llegan** → plan B a las 15:00 (store demo, declarado). La "bloqueada" (Tomás) no depende de nadie.
3. **El stand no confirma política de patrocinio** → no se reclama el combo; el README dice "política en el cliente" sin inflar.
4. **Te piden cosas por fuera** → todo pedido va al PR #2; si no está ahí, no existe.
