# Plan de Ramiro (P3 · UI/UX de las 4 pantallas + panel) · sáb 7/11/2026, 13:55 → 18:00

Tu misión en una línea: **las pantallas de Marta, Lucía y los guardianes y el panel de demo, primero en mock y a las 15:30 contra Fuji, sin palabras cripto, legibles a 5 metros y en el celular.**
Fuentes: `PLAN_CONSTRUCCION_LLAVE.md` (P3-1 a P3-9, §2.7 `tipos.ts`), `MEJORAS_LLAVE.md` (mejoras 6, 7, 8 y 13), `COMPLEMENTO_LLAVE.md` (A3). Cortes: **14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00**.

---

## 0. Cómo nos comunicamos (igual para los 4)
- **La conversación del equipo son los comentarios del PR #2** (https://github.com/dav1dchaparro/hackatwin/pull/2). No se mergea nunca. Si una decisión o un desbloqueo no está en el PR #2, no pasó.
- **Abrí una sesión remota de Claude Code que vigile el PR #2.** Una sesión **aparte** (claude.ai/code sobre el repo, o `claude --bg` desde la carpeta del repo), **no un subagente** dentro de la sesión en la que programás. Hace dos cosas: te avisa cada comentario nuevo y publica tu estado cuando le decís "terminé X". Pegale este prompt:

> Vigilá el PR #2 de dav1dchaparro/hackatwin (usá `gh` con una cuenta que vea el repo). Es el canal de conversación del equipo: los comentarios son la conversación. Cada 60 s leé los comentarios nuevos (conversación, reviews e inline) y mostrámelos resumidos con autor y hora; si alguno me menciona, menciona a P3 o dice "bloqueado", destacalo. Cuando yo te escriba "terminé <bloque>" o "bloqueado por <algo>", publicá un comentario en el PR #2 con este formato exacto, en una sola línea:
> `✅ P3 Ramiro · HH:MM · Terminé: <bloque> · Evidencia: <link o captura> · ➡️ Desbloquea: <P# tarea> · ⏳ Espero: <P# tarea> · 🚧 Bloqueado por: <nada / qué>`
> No publiques nada que yo no te haya pedido y no toques código.

- **Cuándo publicar estado, sin que nadie lo pida:** (1) al terminar cada bloque de abajo; (2) en cada corte (14:30, 15:30, 16:15, 16:30, 17:30) aunque no hayas terminado: "estoy en X, me falta Y"; (3) **apenas quedás bloqueado más de 10 minutos**, con 🚧 y a quién necesitás; (4) cuando desbloqueás a alguien (componentes, capturas), con el link.
- **Antes de empezar cada bloque, leé los últimos comentarios del PR #2** (tu sesión remota te los pasa). Si algo te cambia el bloque, mandá eso primero.

---

## 1. Lo que los otros esperan de vos (tus desbloqueos)
| Qué | Para quién | Para cuándo | Cómo lo publicás |
|---|---|---|---|
| Scaffold `web/` mergeado con las 5 rutas y `tipos.ts` (P3-1) | P2 (programa adentro de `web/src/lib/`) | 13:30 (si no está, **ya**) | ✅ "scaffold mergeado, `npm run dev` levanta" |
| Componentes (`Monto`, `TxLink`, `BadgeKumply`, `CuentaRegresiva`, `LineaDeFases`, `BotonTx`) | P2 (los usa al conectar) | 14:40 | ✅ "en `/demo` se ven todos con mock" |
| Pantallas Dueño y Heredero en mock | P2 (punta a punta 15:30), P4 (guion) | 15:30 | ✅ |
| Panel `/demo` + recibo de la clínica (mejora 6) | P4 (video 16:30), todos (ensayos) | 16:15 | ✅ |
| **4 capturas** (dueño, heredero, guardianes, panel) en `docs/capturas/` | P4 (README) | 16:30 | ✅ con links |
| Textos sin cripto en toda la web (mejora 8) | P4 (pitch usa las mismas palabras) | 16:15 | ✅ "barrido de textos hecho" |

## 2. Lo que vos esperás de otros (y el plan B si no llega)
| Qué | De quién | Para cuándo | Si no llega |
|---|---|---|---|
| `lib/gasless.ts` (login) | P2 | 14:20 | Seguís con el mock (`cliente-mock.ts`): **nunca esperás a P1 ni a P2** |
| `lib/cliente-fuji.ts` lecturas / escrituras | P2 | 14:50 / 15:25 | Mock hasta las 15:30; `VITE_MODO=fuji` se prende con P2 |
| Instancia A verificada | P1 | 14:30 | Mock |
| `errores.ts` en castellano | P2 | 15:25 | Mostrás el nombre del error del contrato tal cual hasta que llegue |
| Nombres nuevos del ABI v2 (`comisionBps`, `destinoPermitido`, `emergenciaVigente`) | P1 → P2 | 16:15 | Los textos "Comisión 1%" y "Caducó" quedan detrás de un `if` que no rompe si no existen |

## 3. Tus bloques, en orden
| Hora | Bloque | Min | Terminado cuando | Estado que publicás |
|---|---|---|---|---|
| 13:55-14:40 | **P3-3 componentes:** `Monto` ($ con miles es-AR), `TxLink` (Snowtrace + ms), `BadgeKumply` (verde persona / azul empresa / rojo sin verificar → textos "Identidad verificada ✓" / "Empresa verificada" / "Falta verificar identidad"), `CuentaRegresiva` (usa `ahoraCadena`, +2 s de margen), `LineaDeFases`, `BotonTx` (inactivo → firmando → enviada → confirmada / error). Si P3-2 (mock) no está terminado, cerralo primero (15 min) | 45 | en `/demo` se ven todos con datos mock | ✅. **Desbloquea P2 (integración visual)** |
| **14:30** | **Corte: instancia A (P1).** Vos seguís en mock | — | — | Estado del corte |
| 14:40-15:10 | **P3-4 Pantalla Dueño `/dueno`** + **mejora 7**: lo principal es **"Mandar plata"** (`retirar` ya cuenta como señal) y "Estoy bien" grande al lado; "Última señal: hace X"; banner rojo "Alguien inició un reclamo: tocá Estoy bien para cancelarlo"; herederos y guardianes con badge; emergencias con "Vetar"; "Cargar $1.000.000 de prueba". + **A3 presets de reparto** en la configuración: botones **"Partes iguales"** (calcula los bps: con 3 herederos 3334/3333/3333, siempre suman 10.000), **"Porcentajes"** (manual) y **"Un solo destino"** (100% a una persona de confianza); debajo, en gris: *"Solo sobre la porción disponible de tu herencia"* | 30 | todos los botones funcionan en mock y muestran `TxLink`; los bps de "Partes iguales" suman 10.000 | ✅ |
| 15:10-15:30 | **P3-5 Pantalla Heredero `/heredero`** (sesión o `?cuenta=0x…` solo lectura): mi %, **mi parte neta** + línea *"Comisión Llave: 1% al liberar"* (A3; detrás de un `if` por si no existe `comisionBps`), mi badge, fase, "Iniciar reclamo" / "Cobrar mi parte" según fase; si no está verificado, cartel rojo con el texto de `NotPerson` ("Tenés que verificar tu identidad para cobrar") | 20 | Lucía cobra y Tomás ve el bloqueo, en mock | ✅ |
| **15:30-16:00** | **P3-8 / P2-7: pasar a `VITE_MODO=fuji` con P2** y arreglar lo que se rompa, **mientras** avanzás **P3-6 Pantalla Guardianes `/guardian`**: tope disponible ("Podés pedir hasta $200.000"), destino (selector "Clínica (empresa verificada)" + campo libre), monto, motivo; pedidos con votos 1/2, "Aprobar", "Ejecutar" si hay demora, "Caducó" si `emergenciaVigente` es falso | 30 | la emergencia 2/3 y los 2 errores (tope, destino no permitido) se ven en mock **y** en Fuji | ✅ con lo que anda en Fuji. **Desbloquea P4-7 (capturas de tx) y guion** |
| 16:00-16:15 | **P3-7 Panel de demo `/demo`** (proyector, sin sesión): `LineaDeFases` grande con cuenta regresiva, saldo de la bóveda y de Lucía/Tomás/Clínica, feed de eventos en vivo con `TxLink`, chip "Gas pagado por 0xGasless · AVAX de Marta: 0". + **mejora 6 recibo de la clínica:** tarjeta *"La Clínica recibió $150.000 · X ms · costo ≈ ARS N · Marta pagó $0 · ver comprobante"* con los **dos tiempos honestos** (envío→incluida vía 0xGasless / incluida = final) que P2 mide | 15 | se lee a 5 m; se actualiza solo cada 2 s | ✅. **Desbloquea P4-10 (video)** |
| **16:15** | **FREEZE.** Solo bugs | — | — | Estado del corte |
| 16:15-16:30 | **P3-9 mobile + barrido final de textos (mejora 8):** "tu Llave", "comprobante", "costo: $0", "Avisar que Marta no responde", "Identidad verificada ✓"; KUMPLY y 0xGasless solo como chips. **4 capturas** en `docs/capturas/` (vía P4) | 15 | capturas publicadas | ✅ con links. **Desbloquea P4-6 (README)** |
| 16:30-17:00 | **Ensayo 1 = grabación del video.** Vos manejás el panel en el proyector y la pantalla de Lucía | — | — | — |
| 17:00-17:15 | Ensayo 2 con reloj. Revisás el PR de P4 (≤5 min) | — | — | — |
| **17:15** | **Último merge.** Lo que no esté en `develop` a las 17:20 no entra | — | — | ✅ "mis ramas mergeadas" |
| 17:30-18:00 | Colchón. No se toca código | — | — | — |

**Si a las 15:30 vas atrasado, el orden de recorte es:** "Ejecutar" con demora en Guardianes → filtro de destino libre → `LineaDeFases` animada → presets de A3 (dejás solo "Porcentajes"). **Nunca** se recortan "Estoy bien", "Cobrar", el panel ni el recibo de la clínica.

## 4. Tu parte del checklist de entrega
- **O2** interfaz web: las 4 pantallas + panel conectados (con P2).
- **Mejora 8:** cero palabras cripto en pantalla (buscar "wallet", "gas", "tx", "smart account", "tier" en `web/src/pages` y `components`).
- **Mejora 13 (tu parte, 5 min):** los chips KUMPLY / 0xGasless visibles en el panel.
- **4 capturas** para el README (`docs/capturas/`).

## 5. Tus riesgos y plan B
1. **`lib/` de P2 llega tarde** → seguís en mock; el mock tiene la misma máquina de estados (§2.3) con reloj real, así que la demo se puede ensayar entera sin Fuji.
2. **Un botón no anda en Fuji a las 16:15** → se saca de la demo y se muestra con la tx grabada + panel.
3. **Te piden cosas por fuera** → todo pedido va al PR #2; si no está ahí, no existe.
