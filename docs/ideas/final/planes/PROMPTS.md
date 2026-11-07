# Prompts para ejecutar cada plan con Claude Code

Cada uno abre **dos** sesiones de Claude Code en la carpeta del repo:
1. **La de trabajo** (en la que programás): le pegás **tu prompt de abajo**. Claude lee tu plan, ubica el bloque por la hora, trabaja solo en tus carpetas, verifica el "Terminado cuando" y publica tu estado en el PR #2 al cerrar cada bloque.
2. **La remota que vigila el PR #2** (claude.ai/code sobre el repo o `claude --bg`): le pegás el prompt de la sección 0 de tu plan. Solo te avisa los comentarios nuevos.

Requisitos: `gh auth login` con una cuenta que vea el repo (`gh pr view 2 --repo dav1dchaparro/hackatwin` tiene que andar) y `git fetch origin` hecho. Los planes están en la rama `docs/brainstorming`, carpeta `docs/ideas/final/planes/`.

---

## P1 · Juan Chaparro (contratos)
```
Sos mi par de programación en el hackathon HackaTwin (hoy, sáb 7/11/2026, entrega 18:00, Buenos Aires). Repo: dav1dchaparro/hackatwin. Soy P1 (Juan Chaparro, @dav1dchaparro): contratos.

Mi plan está en la rama docs/brainstorming: docs/ideas/final/planes/P1_JUAN_CHAPARRO.md. Leelo entero antes de hacer nada (git fetch origin && git show origin/docs/brainstorming:docs/ideas/final/planes/P1_JUAN_CHAPARRO.md). Después leé solo lo que ese plan te señale de docs/ideas/final/PLAN_CONSTRUCCION_LLAVE.md (§2 interfaz, §2.3 reglas, §3.1 tests, §8.1 comandos, §8.3 verificación), docs/ideas/final/MEJORAS_LLAVE.md ("Cambios al contrato") y docs/ideas/final/COMPLEMENTO_LLAVE.md (§6 comisión A1), todos en esa misma rama.

Reglas:
1. Primero mirá la hora real (date) y ubicá en qué bloque de mi plan estamos según los cortes (14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00). Decime en 3 líneas qué bloque arrancamos, qué espero de otros y qué desbloqueo yo. Después arrancá.
2. Antes de cada bloque, leé los últimos comentarios del PR #2 (gh api repos/dav1dchaparro/hackatwin/issues/2/comments --jq '.[-5:][] | "\(.created_at) @\(.user.login): \(.body)"'): es la conversación del equipo. Si alguien publicó algo que cambia mi bloque (SA de Marta, atestaciones, AVAX, bloqueo), aplicalo primero.
3. Trabajá solo en mis carpetas: contracts/, deployments/, web/src/abi/. Nunca toques web/src/lib/ (P2) ni web/src/pages (P3). Ramas feature/contratos-* como dice el plan, commits convencionales (feat(contratos): …, test(contratos): …, docs: …), PR a develop. Nada de claves privadas ni API keys en el repo (.env ignorado). Nunca hasTier(). Lo no confirmado va marcado [SIN VERIFICAR].
4. Un bloque está terminado solo cuando se cumple su columna "Terminado cuando" (forge test en verde, link #code verificado, hash real). Corré forge build y forge test antes de cada commit. No agregues alcance: si algo no está en mi plan, va al roadmap o se pregunta en el PR #2.
5. Al terminar cada bloque, publicá mi estado en el PR #2 (gh api repos/dav1dchaparro/hackatwin/issues/2/comments -f body='…') con este formato exacto en una sola línea: ✅ P1 Juan · HH:MM · Terminé: <bloque> · Evidencia: <link o hash> · ➡️ Desbloquea: <P# tarea> · ⏳ Espero: <P# tarea> · 🚧 Bloqueado por: <nada / qué>. Publicalo también en cada corte aunque no hayamos terminado, y apenas estemos bloqueados más de 10 minutos (🚧 y a quién necesitamos). Mostrame la línea antes de publicarla.
6. Regla ⏱ del plan: si a las 14:25 no hay ≥18 tests en verde, lo marcado ⏱ (mejora 4, A1, mejora 5) pasa a la instancia final de las 16:15. A las 14:30 se despliega igual. Si la verificación falla, probá las 3 alternativas de §8.3 ya y publicá 🚧 con el error exacto.
7. No pushees a develop ni a main directo, no hagas force-push, no toques ramas de otros. Pedime confirmación antes de cualquier deploy a Fuji que gaste AVAX del deployer.
```

## P2 · Gabriel (web ↔ contrato + 0xGasless)
```
Sos mi par de programación en el hackathon HackaTwin (hoy, sáb 7/11/2026, entrega 18:00, Buenos Aires). Repo: dav1dchaparro/hackatwin. Soy P2 (Gabriel, @Gabosawn): integración web ↔ contrato, login con email y gas patrocinado con 0xGasless.

Mi plan está en la rama docs/brainstorming: docs/ideas/final/planes/P2_GABRIEL.md. Leelo entero antes de hacer nada (git fetch origin && git show origin/docs/brainstorming:docs/ideas/final/planes/P2_GABRIEL.md). Después leé solo lo que ese plan te señale de docs/ideas/final/PLAN_CONSTRUCCION_LLAVE.md (§2.7 tipos.ts, P2-1 a P2-9, §8.2) y docs/ideas/final/COMPLEMENTO_LLAVE.md (§7 keeper, A3 textos), en esa misma rama.

Reglas:
1. Primero mirá la hora real (date) y ubicá en qué bloque de mi plan estamos según los cortes (14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00). Decime en 3 líneas qué bloque arrancamos, qué espero de otros y qué desbloqueo yo. Después arrancá.
2. Antes de cada bloque, leé los últimos comentarios del PR #2 (gh api repos/dav1dchaparro/hackatwin/issues/2/comments --jq '.[-5:][] | "\(.created_at) @\(.user.login): \(.body)"'): es la conversación del equipo. Si alguien publicó algo que cambia mi bloque (ABI nuevo, dirección de instancia, errores nuevos, bloqueo), aplicalo primero.
3. Trabajá solo en mi carpeta: web/src/lib/ (y keeper/ si lo hacemos). Nunca toques contracts/ (P1) ni web/src/pages y components (P3): si necesito algo de ellos, lo pido en el PR #2. Ramas feature/web-gasless, feature/web-integracion, feature/web-docs como dice el plan, commits convencionales (feat(web): …, docs: …), PR a develop. La API key de 0xGasless va en .env.local, nunca en el repo. Nunca hasTier(). Lo no confirmado va marcado [SIN VERIFICAR].
4. Un bloque está terminado solo cuando se cumple su columna "Terminado cuando" (la tx aparece en Snowtrace con AVAX de la SA = 0, el error se ve en castellano sin mandar la tx, la web sobrevive a F5). Antes de cada commit: npm run build sin errores. No agregues alcance: si algo no está en mi plan, va al roadmap o se pregunta en el PR #2.
5. Al terminar cada bloque, publicá mi estado en el PR #2 (gh api repos/dav1dchaparro/hackatwin/issues/2/comments -f body='…') con este formato exacto en una sola línea: ✅ P2 Gabriel · HH:MM · Terminé: <bloque> · Evidencia: <link o hash> · ➡️ Desbloquea: <P# tarea> · ⏳ Espero: <P# tarea> · 🚧 Bloqueado por: <nada / qué>. Publicalo también en cada corte aunque no hayamos terminado, y apenas estemos bloqueados más de 10 minutos (🚧 y a quién necesitamos). Mostrame la línea antes de publicarla.
6. Si 0xGasless no patrocina a las 14:35, publicá 🚧 con el error exacto (P4 lo lleva al stand) y probá el paymaster por defecto del dashboard. El plan B con Core/MetaMask es solo para esa acción y recién a las 15:30; antes de aplicarlo, preguntame.
7. No pushees a develop ni a main directo, no hagas force-push, no toques ramas de otros.
```

## P3 · Ramiro (UI/UX de las 4 pantallas + panel)
```
Sos mi par de programación en el hackathon HackaTwin (hoy, sáb 7/11/2026, entrega 18:00, Buenos Aires). Repo: dav1dchaparro/hackatwin. Soy P3 (Ramiro, @ramiro-monllor): las pantallas de la web y el panel de demo.

Mi plan está en la rama docs/brainstorming: docs/ideas/final/planes/P3_RAMIRO.md. Leelo entero antes de hacer nada (git fetch origin && git show origin/docs/brainstorming:docs/ideas/final/planes/P3_RAMIRO.md). Después leé solo lo que ese plan te señale de docs/ideas/final/PLAN_CONSTRUCCION_LLAVE.md (§2.3 máquina de estados, §2.7 tipos.ts, P3-1 a P3-9, §6 guion de la demo) y docs/ideas/final/COMPLEMENTO_LLAVE.md (A3), en esa misma rama.

Reglas:
1. Primero mirá la hora real (date) y ubicá en qué bloque de mi plan estamos según los cortes (14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00). Decime en 3 líneas qué bloque arrancamos, qué espero de otros y qué desbloqueo yo. Después arrancá.
2. Antes de cada bloque, leé los últimos comentarios del PR #2 (gh api repos/dav1dchaparro/hackatwin/issues/2/comments --jq '.[-5:][] | "\(.created_at) @\(.user.login): \(.body)"'): es la conversación del equipo. Si alguien publicó algo que cambia mi bloque (lib/ de P2 listo, instancia A, nombres nuevos del ABI), aplicalo primero.
3. Trabajá solo en mis carpetas: web/ (scaffold) y web/src/{pages,components,mock,styles}. Nunca edites web/src/lib/ (P2): importá de ahí. Nunca toques contracts/. Ramas feature/web-base, feature/web-pantallas, feature/web-pulido como dice el plan, commits convencionales (feat(web): …), PR a develop. Nunca hasTier(). Cero palabras cripto en pantalla ("tu Llave", "comprobante", "Identidad verificada ✓"; KUMPLY y 0xGasless solo como chips).
4. Un bloque está terminado solo cuando se cumple su columna "Terminado cuando" (se ve en /demo con mock, todos los botones muestran TxLink, los bps de "Partes iguales" suman 10.000, se lee a 5 m, anda en el celular). Nunca esperes a P1 ni a P2: el mock tiene la misma máquina de estados. Antes de cada commit: npm run build sin errores. No agregues alcance.
5. Al terminar cada bloque, publicá mi estado en el PR #2 (gh api repos/dav1dchaparro/hackatwin/issues/2/comments -f body='…') con este formato exacto en una sola línea: ✅ P3 Ramiro · HH:MM · Terminé: <bloque> · Evidencia: <link o captura> · ➡️ Desbloquea: <P# tarea> · ⏳ Espero: <P# tarea> · 🚧 Bloqueado por: <nada / qué>. Publicalo también en cada corte aunque no hayamos terminado, y apenas estemos bloqueados más de 10 minutos (🚧 y a quién necesitamos). Mostrame la línea antes de publicarla.
6. Si a las 15:30 vamos atrasados, aplicá el orden de recorte de mi plan ("Ejecutar" con demora → filtro de destino libre → LineaDeFases animada → presets) y nunca recortes "Estoy bien", "Cobrar", el panel ni el recibo de la clínica. Avisame antes de recortar.
7. No pushees a develop ni a main directo, no hagas force-push, no toques ramas de otros.
```

## P4 · Facundo (KUMPLY, cuentas, README, pitch, video y entrega)
```
Sos mi asistente en el hackathon HackaTwin (hoy, sáb 7/11/2026, entrega 18:00, Buenos Aires). Repo: dav1dchaparro/hackatwin. Soy P4 (Facundo, @facundo-monllor): atestaciones KUMPLY, cuentas de prueba, README, evidencias, pitch, video y entrega.

Mi plan está en la rama docs/brainstorming: docs/ideas/final/planes/P4_FACUNDO.md. Leelo entero antes de hacer nada (git fetch origin && git show origin/docs/brainstorming:docs/ideas/final/planes/P4_FACUNDO.md). Después leé docs/ideas/final/COMPLEMENTO_LLAVE.md entero (§1 reglas del PDF, §8 textos listos para el README, §9 Q&A, §10 roadmap, §11 fuentes), y de docs/ideas/final/PLAN_CONSTRUCCION_LLAVE.md el §7 (checklist de entrega y esqueleto del README) y el §8.4 (preguntas para los stands), en esa misma rama. Las reglas oficiales están en docs/ideas/REGLAS_TRACKS.md.

Reglas:
1. Primero mirá la hora real (date) y ubicá en qué bloque de mi plan estamos según los cortes (14:30 · 15:30 · 16:15 · 16:30 · 17:30 · 18:00). Decime en 3 líneas qué bloque arrancamos, qué espero de otros y qué desbloqueo yo. Después arrancá.
2. Antes de cada bloque, leé los últimos comentarios del PR #2 (gh api repos/dav1dchaparro/hackatwin/issues/2/comments --jq '.[-8:][] | "\(.created_at) @\(.user.login): \(.body)"'): es la conversación del equipo. Cada hash, dirección o link de Snowtrace que alguien publique va a docs/evidencias.md en el momento, no al final.
3. Trabajá solo en mis archivos: README.md, docs/ (cuentas.md, evidencias.md, finalidad.md, capturas/, arquitectura.md) y scripts/. Nunca toques contracts/ ni web/. Ramas feature/docs-readme, feature/docs-pitch como dice el plan, commits convencionales (docs: …), PR a develop. Nada de claves ni API keys. En el README: nunca hasTier(), y la frase "Las atestaciones de KUMPLY en Fuji son de DEMO, emitidas por el staff, sin verificación KYC real". Lo no confirmado va marcado [SIN VERIFICAR] y no se dice en el pitch como hecho.
4. No escribas de cero lo que ya está escrito: los textos de negocio, "¿y si retiro?", aviso legal, por qué no Privy ni Safe, reloj en "Por qué Avalanche" y bonus están en COMPLEMENTO_LLAVE.md §8; pegalos y adaptá los links. Para el 1%: si P1 publicó "ABI v2 con comisión", usá el texto "cobrado por el contrato"; si publicó "A1 al roadmap", el texto "en el contrato de producción". Un bloque está terminado solo cuando se cumple su columna "Terminado cuando" (las 6 secciones obligatorias con encabezado propio, ≥8 tx con link, video linkeado, formulario enviado).
5. Al terminar cada bloque, publicá mi estado en el PR #2 (gh api repos/dav1dchaparro/hackatwin/issues/2/comments -f body='…') con este formato exacto en una sola línea: ✅ P4 Facundo · HH:MM · Terminé: <bloque> · Evidencia: <link> · ➡️ Desbloquea: <P# tarea> · ⏳ Espero: <P# tarea> · 🚧 Bloqueado por: <nada / qué>. Publicalo también en cada corte aunque no hayamos terminado, y apenas estemos bloqueados más de 10 minutos. Mostrame la línea antes de publicarla.
6. Prioridad si me saturo: los 6 obligatorios del PDF (contrato verificado con link, web, por qué Avalanche, negocio, repo público con instalación/deploy/arquitectura, hecho hoy vs. reutilizado) van antes que validación y roadmap. Si a las 16:15 no hay datos de validación, poné "Validación: pendiente" y seguí.
7. Pedime confirmación antes de: hacer público el repo, abrir o mergear el PR develop → main, y enviar el formulario de entrega. No hagas force-push ni toques ramas de otros.
```

---

**Cómo se usa:** copiás tu bloque entero, lo pegás como primer mensaje en tu sesión de Claude Code abierta en la carpeta del repo, y seguís la conversación. Cuando Claude te muestre la línea de estado, la aprobás y la publica. Si cambiás de bloque a mano, decile "pasamos al bloque X".
