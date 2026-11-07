---
version: 1
slug: "web-src-pages-dueno-tsx"
primary_target: "web/src/pages/Dueno.tsx"
related_targets: ["web/src/pages/Heredero.tsx"]
---

# Surface brief: Mi Llave (gestor de la herencia) + Mi herencia (heredero)

Scope: dos superficies Operate dentro del mundo visual ya establecido en `web/src/styles/base.css` (paleta azul del equipo, shell con barra lateral, módulos). Sin `/demo`.

Audience and job: la dueña (no cripto, celular) conecta su cuenta con el email, elige cada cuánto da señal de vida y si quiere recordatorio por email, carga herederos por email con porcentajes (más fondo común o donación como destinos), guarda todo en la cadena y desde entonces solo toca «Estoy bien». El heredero entra con su email y mira qué le corresponde y en qué etapa está.

Proof/content: estado real de la Llave (saldo, última señal, vencimiento, etapa), comprobantes de cada operación, contratos verificados en Fuji. Emails y nombres se guardan solo en el dispositivo.

Constraints: contrato `configurar(herederos, bps, plazoInactividad, plazoGracia)` con 1 a 5 destinos; comisión 1% al liberar; sin palabras cripto en pantalla salvo «Conectar»; KUMPLY y 0xGasless como etiquetas; craft-floor: sin eyebrows, íconos SVG, contraste AA.

Unresolved: envío real del recordatorio por email (keeper de P2); cuentas embebidas por email en Fuji (0xGasless pregenerada) — en mock se derivan del email.

## Direction contract

THESIS: La pantalla de la dueña es una consola de vigilancia y configuración en una sola página: primero el reloj de la señal de vida y la acción «Estoy bien», después la configuración (cada cuánto, herederos y destinos) como módulos que se guardan en la cadena. Refuso el default de la categoría: una billetera con el saldo como héroe y la configuración escondida detrás de un engranaje.

OWN-WORLD: Fondo claro teñido de azul (#f4f8fb) con paneles blancos y bordes de 1 px (#d6e4ed); variante oscura (#0a1623 / #0f2033); acento #01497c (oscuro: #2c7da0) solo en acción principal, selección y etapa actual; verde/ámbar/rojo semánticos separados del acento. Inter para interfaz, JetBrains Mono para montos, cuentas y tiempos. Barra lateral de 240 px, cabecera de página con título, descripción y acción a la derecha, módulos con cabecera propia, tiles de resumen, filas tipo tabla editables, segmentados para presets. Íconos SVG de trazo 1.8. Sin eyebrows.

STORY: La dueña entiende «mientras doy señales, mi plata es mía; si dejo de darlas, un agente verificado avisa, espera y la reparte como yo dije». Conecta con su email, elige el período y el recordatorio, carga a sus herederos por email con porcentajes, guarda en la cadena, y después solo toca «Estoy bien». El heredero entiende que no tiene nada que hacer.

FIRST VIEWPORT: Barra lateral a la izquierda (Mi Llave, Mi herencia, sesión, tema). Cabecera «Mi Llave» con descripción y «Estoy bien» (verde, grande) a la derecha. Debajo, si hay aviso abierto, una franja de alerta. Módulo «Señal de vida»: cuatro tiles (vence en, última señal, en tu bóveda, etapa) sobre la línea de etapas; a la derecha de la fila siguiente, la tarjeta «Cada cuánto» con segmentado de períodos, espera para cancelar, recordatorio por email y «Guardar en la cadena». Luego «Herederos y destinos» como tabla editable (tipo, email o nombre, cuenta, porcentaje) con presets, total y «Guardar en la cadena». Al final «Mi plata» (mandar plata, cargar pesos de prueba).

FORM: Consola de módulos en una página, posición 1 de mi lista (alternativas: asistente de pasos; configuración en pestañas). Pedido especificado con precisión: shape directo, sin torneo de conceptos. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
