# Plan de Juan Chaparro (P1 · contratos) · sáb 7/11/2026, 13:55 → 18:00

Tu misión en una línea: **`LlaveEmergencia` desplegado y VERIFICADO en Fuji (obligatorio 1), con tests en verde, las instancias finales A y B a las 16:15 y los hashes de evidencia para el README.**
Fuentes: `PLAN_CONSTRUCCION_LLAVE.md` (P1-1 a P1-13, §2, §8), `MEJORAS_LLAVE.md` (mejoras 1-5, 7, 14, 15 y "Cambios al contrato"), `COMPLEMENTO_LLAVE.md` (A1, §6). Cortes: **14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00**.

---

## 0. Cómo nos comunicamos (igual para los 4)
- **La conversación del equipo son los comentarios del PR #2** (https://github.com/dav1dchaparro/hackatwin/pull/2). No se mergea nunca. Si una decisión o un desbloqueo no está en el PR #2, no pasó.
- **Abrí una sesión remota de Claude Code que vigile el PR #2.** Una sesión **aparte** (claude.ai/code sobre el repo, o `claude --bg` desde la carpeta del repo), **no un subagente** dentro de la sesión en la que programás. Hace dos cosas: te avisa cada comentario nuevo y publica tu estado cuando le decís "terminé X". Pegale este prompt:

> Vigilá el PR #2 de dav1dchaparro/hackatwin (usá `gh` con una cuenta que vea el repo). Es el canal de conversación del equipo: los comentarios son la conversación. Cada 60 s leé los comentarios nuevos (conversación, reviews e inline) y mostrámelos resumidos con autor y hora; si alguno me menciona, menciona a P1 o dice "bloqueado", destacalo. Cuando yo te escriba "terminé <bloque>" o "bloqueado por <algo>", publicá un comentario en el PR #2 con este formato exacto, en una sola línea:
> `✅ P1 Juan · HH:MM · Terminé: <bloque> · Evidencia: <link o hash> · ➡️ Desbloquea: <P# tarea> · ⏳ Espero: <P# tarea> · 🚧 Bloqueado por: <nada / qué>`
> No publiques nada que yo no te haya pedido y no toques código.

- **Cuándo publicar estado, sin que nadie lo pida:** (1) al terminar cada bloque de abajo; (2) en cada corte (14:30, 15:30, 16:15, 16:30, 17:30) aunque no hayas terminado: "estoy en X, me falta Y"; (3) **apenas quedás bloqueado más de 10 minutos**, con 🚧 y a quién necesitás; (4) cuando desbloqueás a alguien (ABI, direcciones, hashes), con el link.
- **Antes de empezar cada bloque, leé los últimos comentarios del PR #2** (tu sesión remota te los pasa). Si algo te cambia el bloque, mandá eso primero.

---

## 1. Lo que los otros esperan de vos (tus desbloqueos)
| Qué | Para quién | Para cuándo | Cómo lo publicás |
|---|---|---|---|
| Instancia A desplegada y **verificada** + `deployments/fuji.json` + ABI exportado (`web/src/abi/`) | P2 (lecturas y escrituras), P3 (modo fuji), P4 (evidencias) | **14:30** | ✅ con los dos links `#code` (Llave y MockPesos) y "ABI v1 publicado" |
| Hashes de evidencia: `cobrar()` de Tomás revertido (`NotPerson`), instancia corta con `demoraVeto=20` para que P2 grabe reclamo cancelado y veto | P4 (`docs/evidencias.md`), P2 | 15:10 | ✅ con hash y dirección de la instancia corta |
| Decisión del plan B de atestaciones (`DemoAttestationStore`) | P4, P2 | 15:00-15:20 | ✅ "store demo desplegado en 0x…, tier 2 a Lucía/Pablo/Rosa" o "seguimos con el oficial" |
| `contracts/README.md` (instalar, `forge test`, deploy, verificación, direcciones) | P4 (lo enlaza desde el README raíz) | 15:45 | ✅ con el link al archivo |
| **ABI v2** (mejoras 1-5 + comisión A1) | P2 (`errores.ts`: `DestinoNoPermitido`, `EmergenciaCerrada`, `ComisionInvalida`), P3 (texto "Comisión 1%") | 16:15 a más tardar | ✅ "ABI v2: cambios = …" o "A1 cae al roadmap" (P4 elige el texto del README según esto) |
| Instancias finales **A y B verificadas** + `fuji.json` final | Todos (demo, video, README) | **16:15** | ✅ con los dos links `#code` y `?llave=` de cada una |
| Instancia nueva para el demo day | Todos | 18:45 | ✅ con `?llave=` |

## 2. Lo que vos esperás de otros (y el plan B si no llega)
| Qué | De quién | Para cuándo | Si no llega |
|---|---|---|---|
| Smart account de Marta para el constructor | P2 → P4 | 14:15 | Desplegás con el deployer como dueño y después `transferirDueno(saMarta)` (1 tx con AVAX). **Nunca bloquea el deploy** |
| AVAX en el deployer (≥0,5) y en Tomás (0,1) | P4 | ya | Pedís en el PR #2 con 🚧 y seguís con tests locales |
| Atestaciones KUMPLY tier 2 (Lucía, Pablo, Rosa) | P4 / staff | 15:00 | P1-10: `DemoAttestationStore` propio, declarado en el README. La "bloqueada" (Tomás) no depende de nadie |
| Tier 5 para el agente ejecutor (mejora 5) | P4 | 15:30 | Mejora 5 **no se hace**: va al README como roadmap |
| Respuesta del stand sobre verificación en Routescan si falla | P4 | cuando pase | Vos probás ya las 3 alternativas de §8.3 del plan de construcción |

## 3. Tus bloques, en orden
| Hora | Bloque | Min | Terminado cuando | Estado que publicás |
|---|---|---|---|---|
| 13:55-14:25 | **P1-4 + mejoras 1-4:** implementar `LlaveEmergencia` según §2.3 con `_senal()` única (mejora 1), `_ejecutar` interno + época (mejora 2), evento `VerificadoKumply` (mejora 3), lista blanca de destinos `permitirDestino` + `destinosIniciales` (mejora 4 ⏱) y el test de que `retirar` reinicia la base (mejora 7). **P1-5 tests** con `DemoAttestationStore` + `vm.warp` | 30 | `forge build` limpio; `forge test` ≥18 passed | A las 14:25: "tests: N en verde" → decide la regla ⏱ |
| **14:25-14:30** | **P1-6 deploy instancia A + verificación + `export-abi`** (corte duro). Si a las 14:25 no hay ≥18 tests, desplegás igual y corregís después: redeploy = 1 comando | 15 | `…/address/<llave>#code` y `…/address/<pesos>#code` verificados; `deployments/fuji.json` mergeado | ✅ "Instancia A verificada" con links. **Desbloquea P2-4, P3-8, P4-7** |
| 14:30-14:45 | **Si la verificación falla:** las 3 alternativas de §8.3 **ahora** (`--verifier custom`, sufijo `/etherscan/api`, flatten y subida a mano). Todos con vos hasta que esté: es el obligatorio 1. Si verificó: P1-7 test fork contra el store real | 15 | `#code` en verde / `ForkFuji` pasa | ✅ o 🚧 con el error exacto (P4 lo lleva al stand) |
| 14:45-15:10 | **P1-8 evidencias:** (a) `cobrar()` de Tomás revertido con `cast send --gas-limit 300000` cuando A esté Ejecutable; (b) instancia corta con `DEMO_DEMORA_VETO=20` para que P2 grabe desde la web el reclamo cancelado y el veto | 25 | hash de (a) y dirección de (b) | ✅ con hash y dirección. **Desbloquea P4-7 y P2-7** |
| 15:00 | **Control de atestaciones** con P4. Sin tier 2 en Lucía/Pablo → **P1-10** store demo + redeploy apuntando a él (20 min) | 0-20 | `verify(lucía)` del store demo = `(true, 2, …)` | ✅ "oficial" o "plan B store demo 0x…" |
| 15:10-15:30 | **P1-9 soporte a P2:** decodificar errores, gas, eventos; confirmar que los 9 métodos mandan tx | 20 | P2 confirma en el PR #2 | (lo publica P2) |
| **15:30** | **Corte: punta a punta en la web** (lo corren P2 y P3; vos atendés lo que rompa) | — | — | Estado del corte: "en qué estoy, qué falta" |
| 15:30-15:45 | **P1-11 `contracts/README.md`** | 15 | P4 lo puede enlazar | ✅ con link. **Desbloquea P4-6** |
| 15:45-16:05 | **A1 comisión al liberar** (`COMPLEMENTO_LLAVE.md` §6): `comisionBps` + `tesoreria` immutables, descuento en `cobrar()`, `ComisionCobrada`, `parteDe()` neto, tests A1-a y A1-b. Solo **agrega** al ABI. Reemplaza el "1% NO se cobra en el MVP" de la mejora 12: ahora sí se cobra on-chain (decisión de P2, 14:00). Si no entra, cae al roadmap y lo decís | 20 | tests verdes; `Cobrado` + `ComisionCobrada` en la misma tx | ✅ "ABI v2 con comisión" o "A1 al roadmap". **Desbloquea P2 (`errores.ts`), P3 (texto), P4 (texto del README)** |
| 16:05-16:15 | Mejora 5 (agente ejecutor KYA) **solo si P4 confirmó tier 5 a las 15:30**; si no, mejora 14 (bordes de configuración, tests 30-33) o colchón | 10 | tests verdes | — |
| **16:15-16:35** | **P1-12 instancias finales A (nueva) y B (pre-envejecida: reclamo iniciado hace >30 s), ambas verificadas; `fuji.json` final**. Freeze: después de esto, solo bugs | 20 | los 2 links `#code` en verde; la web abre con `?llave=` de cada una | ✅ con links y `?llave=`. **Desbloquea video (P4-10) y ensayos** |
| 16:35-16:45 | P1-13 / mejora 15: instancia con USDC de Fuji **solo si P4 consiguió USDC** | 10 | link en README | ✅ |
| 16:30-17:00 | Ensayo 1 = grabación del video (P4). Vos: nada de código, salvo bug | — | — | — |
| 17:00-17:15 | Ensayo 2 con reloj (instancia nueva). Revisás el PR de P2 (≤5 min) | — | — | — |
| **17:15** | **Último merge `feature/* → develop`.** Lo que no esté mergeado a las 17:20 no entra | — | — | ✅ "mis ramas mergeadas" |
| 17:30-18:00 | Colchón. No se toca código | — | — | — |
| 18:45 | Instancia nueva para el demo day (mismo script, `--verify` incluido) | 5 | `?llave=` nueva | ✅ |

## 4. Tu parte del checklist de entrega
- **O1** contrato verificado (links `#code` de Llave A final y MockPesos).
- **K2** gate on-chain (`_requirePersonAtLeast` en `iniciarReclamo`/`cobrar`/guardianes; `_requireBusiness` + lista blanca en destino).
- **K3/K4** hashes: Lucía cobra (pasa) y Tomás revertido (`NotPerson`).
- **E3** `forge test` en verde (salida en `contracts/README.md`).
- **Sin `hasTier()`** en ningún archivo (`grep -r hasTier contracts/` vacío).

## 5. Tus riesgos y plan B
1. **La verificación falla** → las 3 alternativas ya, 🚧 inmediato en el PR #2 con el error exacto; nadie sigue con otra cosa hasta que esté.
2. **Tests no llegan a 18 a las 14:25** → regla ⏱: mejora 4, A1 y mejora 5 pasan a la instancia final de las 16:15. Desplegás igual a las 14:30.
3. **Atestaciones no llegan a las 15:00** → P1-10 store demo, declarado en el README. Si las reales llegan antes de las 16:15, volvés al oficial (1 comando).
4. **Te piden cosas por fuera** → todo pedido va al PR #2; si no está ahí, no existe.
