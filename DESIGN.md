---
name: Llave
description: Consola clara y tranquila para proteger ahorros en pesos digitales, con la paleta azul del equipo.
colors:
  azul-profundo: "#012a4a"
  azul-marino: "#013a63"
  azul-llave: "#01497c"
  azul-cobalto: "#014f86"
  azul-acero: "#2a6f97"
  azul-lago: "#2c7da0"
  azul-cielo: "#468faf"
  azul-bruma: "#61a5c2"
  azul-hielo: "#89c2d9"
  azul-espuma: "#a9d6e5"
  fondo: "#f4f8fb"
  superficie: "#ffffff"
  superficie-2: "#ebf3f8"
  borde: "#d6e4ed"
  borde-fuerte: "#b7d0df"
  texto: "#012a4a"
  texto-2: "#3b5f7b"
  texto-3: "#6b8aa3"
  acento-suave: "#e3f0f7"
  acento-borde: "#89c2d9"
  enlace: "#2a6f97"
  anillo: "#468faf"
  ok: "#1b7f5a"
  ok-suave: "#e3f4ec"
  alerta: "#9a5b00"
  alerta-suave: "#fff3df"
  peligro: "#b42336"
  peligro-suave: "#fde8eb"
  oscuro-fondo: "#0a1623"
  oscuro-superficie: "#0f2033"
  oscuro-superficie-2: "#142b43"
  oscuro-borde: "#1f3f5c"
  oscuro-texto: "#e9f2f8"
  oscuro-acento: "#2c7da0"
typography:
  headline:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.05em"
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.azul-llave}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.sm}"
    height: "36px"
    padding: "0 14px"
  button-primary-hover:
    backgroundColor: "{colors.azul-marino}"
  button-secondary:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto}"
    rounded: "{rounded.sm}"
    height: "36px"
    padding: "0 14px"
  button-ok:
    backgroundColor: "{colors.ok}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.sm}"
    height: "46px"
    padding: "0 22px"
  card:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.lg}"
    padding: "20px"
  tile:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.md}"
    padding: "16px 18px"
  tile-featured:
    backgroundColor: "{colors.azul-llave}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.md}"
    padding: "16px 18px"
  input:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
  badge:
    backgroundColor: "{colors.superficie-2}"
    textColor: "{colors.texto-2}"
    rounded: "{rounded.pill}"
    height: "24px"
    padding: "0 9px"
  nav-item-active:
    backgroundColor: "{colors.acento-suave}"
    textColor: "{colors.azul-llave}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
---

# Design System: Llave

## Overview

**Creative North Star: "La caja de seguridad abierta"**

Llave es una consola que una persona de 67 años opera desde el celular para proteger sus ahorros. El sistema se parece a un panel de administración moderno (barra lateral, cabecera con una acción, módulos con cabecera propia, tiles de resumen, filas tipo tabla), pero con una paleta de un solo azul profundo que transmite custodia y calma, no tecnología. La densidad es media: suficiente para ver el estado completo de la Llave en una pantalla, con aire entre módulos.

Nada decora: cada color, chip o tile codifica un estado real de la Llave (vence en, última señal, etapa, guardado o sin guardar). Lo privado (emails, nombres) se ve como texto normal; lo público y verificable (montos, cuentas, tiempos) se ve en mono. Rechazos confirmados: eyebrows sobre los títulos, franjas de acento en un borde, gradientes en texto, emojis como íconos, palabras cripto en pantalla.

**Key Characteristics:**
- Un solo acento (azul Llave) para acción principal, selección y etapa actual; verde, ámbar y rojo solo para estados.
- Fondo claro teñido de azul con paneles blancos de borde 1 px; tema oscuro espejado con los mismos tokens.
- Source Sans 3 para toda la interfaz; JetBrains Mono para montos, cuentas y cuentas regresivas.
- Cabecera de página con título, descripción y la acción principal a la derecha; después módulos.
- Íconos SVG propios de trazo 1.8, 18 px.

## Colors

Una familia de azules del equipo que va del profundo al espuma, sobre un fondo apenas teñido; los semánticos quedan apagados para no competir con el acento.

### Primary
- **Azul Llave** (#01497c): botón primario, ítem activo de navegación, etapa actual, tile destacado. Hover: **Azul marino** (#013a63). En tema oscuro el acento sube a **Azul lago** (#2c7da0) y el hover a **Azul cielo** (#468faf).
- **Acento suave** (#e3f0f7) y **Acento borde** (#89c2d9): fondo y borde de lo seleccionado o actual (etapa actual, nav activo, badges informativos). Oscuro: #10314d / #2a6f97.
- **Enlace** (#2a6f97; oscuro #89c2d9) y **Anillo de foco** (#468faf; oscuro #61a5c2).

### Neutral
- **Fondo** (#f4f8fb): el suelo de toda la app. Oscuro: #0a1623.
- **Superficie** (#ffffff) para paneles, tarjetas y barra lateral; **Superficie 2** (#ebf3f8) para cabeceras de tabla, segmentados y la tarjeta de sesión. Oscuro: #0f2033 / #142b43.
- **Borde** (#d6e4ed) en paneles y filas; **Borde fuerte** (#b7d0df) en inputs y botones secundarios. Oscuro: #1f3f5c / #2c5a80.
- **Texto** (#012a4a), **Texto 2** (#3b5f7b) para descripciones, **Texto 3** (#6b8aa3) para etiquetas y metadatos. Oscuro: #e9f2f8 / #a9d6e5 / #7ea4bd.

### Semantic
- **Ok** (#1b7f5a / suave #e3f4ec): «Estoy bien», guardado, recibido, listo.
- **Alerta** (#9a5b00 / suave #fff3df): plazo vencido, cambios sin guardar, modo ensayo.
- **Peligro** (#b42336 / suave #fde8eb): aviso del agente abierto, errores del contrato, quitar.
- Oscuro: ok #4cc38a / #0f2f24, alerta #f0b35a / #33240c, peligro #f28b98 / #3a141c.

### Named Rules
**La regla del único acento.** El azul Llave aparece en una sola acción principal por pantalla, en la selección y en la etapa actual. Un segundo botón azul en la misma vista es un error.
**La regla del estado.** Verde, ámbar y rojo nunca decoran: cada uso corresponde a un estado real que la persona puede cambiar o entender.

## Typography

**Body Font:** Source Sans 3 (con system-ui, -apple-system, "Segoe UI", sans-serif)
**Label/Mono Font:** JetBrains Mono (con ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)

**Character:** Una sans humanista, abierta y legible en el celular, con los números y cuentas en mono para que alineen y se lean como datos verificables.

### Hierarchy
- **Headline** (600, 24px, 1.2, -0.01em): título de página («Mi Llave», «Mi herencia»). Uno por pantalla.
- **Title** (600, 16px): cabecera de módulo; 15px dentro de tarjetas.
- **Body** (400, 15px, 1.5): descripciones y avisos; 13px para notas secundarias; ancho máximo 64–72ch.
- **Label** (500, 12px, 0.05em, mayúsculas): etiquetas de tile, cabeceras de tabla, sección de navegación.
- **Data** (600, 26px, mono, -0.02em): valor de los tiles; 20px en tiles chicos; 13px en cuentas.

### Named Rules
**La regla del mono.** Mono solo para montos, cuentas, hashes y tiempos. Nunca como costumbre "técnica" en títulos o botones.

## Layout

Shell en grilla de dos columnas: barra lateral fija de 240 px (sticky, altura completa) y contenido con ancho máximo de 1080 px, padding de 24 px (16 px en celular) y módulos separados por 28 px. En menos de 960 px la barra pasa a una franja superior con los ítems en fila; en menos de 560 px los ítems muestran solo el ícono. Dentro de un módulo: cabecera (título + descripción + extra a la derecha) y cuerpo con gap de 14 px. Grillas de dos columnas que colapsan a una en menos de 760 px. Tiles en `auto-fit, minmax(200px, 1fr)`. Filas tipo tabla con columnas en grid y colapso a dos columnas en celular. Escala de espaciado: 4 / 8 / 12 / 16 / 24 / 28 px.

## Elevation & Depth

Sistema plano con capas tonales: el fondo teñido, la superficie blanca y la superficie 2 marcan los niveles; los bordes de 1 px separan. La única sombra es `0 1px 2px rgba(1, 42, 74, 0.06)` (oscuro `rgba(0,0,0,0.4)`) sobre el botón activo del segmentado.

### Named Rules
**La regla del borde.** La separación la hace el borde de 1 px y el cambio de superficie, no la sombra.

## Shapes

Radio 6 px en botones, inputs y badges de navegación; 8 px en tiles y avisos; 12 px en tarjetas, tablas y la línea de etapas; píldora en badges. Sin franjas de color en los bordes. Sin recortes ni formas decorativas.

## Components

### Buttons
- **Shape:** rectángulo de radio 6 px, altura 36 px (46 px grande, 64 px XL, 30 px chico), ícono opcional de 16 px a la izquierda.
- **Primary:** fondo azul Llave, texto blanco. **Ok:** fondo verde para «Estoy bien». **Secondary:** superficie blanca con borde fuerte. **Ghost:** transparente, texto 2. **Danger:** fondo peligro suave, texto y borde peligro.
- **Hover / Focus:** oscurece el fondo (primario) o pasa a superficie 2 (secundario/ghost); foco con anillo de 2 px y offset 2 px. Deshabilitado al 45 % de opacidad. Cargando: spinner de 14 px en lugar del ícono.
- **BotonTx:** debajo del botón muestra «Listo» con el comprobante y los ms, o el error del contrato en castellano con su nombre crudo en chico.

### Chips (badges)
- **Style:** píldora de 24 px, fondo superficie 2, borde 1 px, texto 2, 12px/500.
- **State:** ok / mal / info / alerta cambian texto, fondo suave y borde; «Modo ensayo» lleva un punto delante.

### Cards / Containers
- **Corner Style:** 12 px.
- **Background:** superficie; cabecera de tarjeta con título, descripción e ícono a la derecha.
- **Shadow Strategy:** ninguna.
- **Border:** 1 px borde.
- **Internal Padding:** 20 px; gap interno 14 px.

### Tiles
Etiqueta en mayúsculas chicas, valor en mono grande, nota debajo. El tile destacado invierte: fondo azul Llave y texto blanco al 78 %.

### Inputs / Fields
- **Style:** fondo superficie, borde fuerte 1 px, radio 6 px, padding 9/12; mono para cuentas.
- **Focus:** anillo azul de 2 px. **Disabled:** 55 % de opacidad.
- **Segmentado:** grupo con fondo superficie 2 y la opción activa en superficie con borde y sombra mínima.

### Navigation
- Barra lateral con marca (ícono en cuadrado azul + «Llave»), sección «Pantallas», ítems con ícono y texto; activo con fondo acento suave y texto azul Llave; hover superficie 2. Pie con «Modo ensayo», cambio de tema y tarjeta de sesión (avatar con inicial, alias, cuenta en mono, salir).

### Línea de etapas (signature)
Las cinco etapas de la Llave en una fila de celdas con borde: número, nombre y, en la actual, la cuenta regresiva en mono. La pasada lleva el número en verde con tilde; la actual, fondo acento suave y nombre en azul; las futuras, texto 3. En celular se apila.

### Filas tipo tabla
Cabecera en mayúsculas chicas sobre superficie 2; filas con grid; nombre en negrita con la cuenta en mono debajo; números en mono. El editor de destinos usa la misma fila con select, inputs y un botón de quitar.

## Do's and Don'ts

- Do: una acción principal por pantalla, en la cabecera; el resto, secundarios.
- Do: mostrar el estado antes del detalle (tiles y avisos arriba, configuración abajo).
- Do: escribir en castellano rioplatense sin palabras cripto («cuenta», «comprobante», «costo: $0»).
- Do: tematizar los dos temas desde los mismos tokens; cada color se define primero en `:root`.
- Don't: eyebrows sobre títulos, franjas de acento en un borde, gradientes en texto, emojis como íconos.
- Don't: usar mono en títulos o botones; usar el acento en estados inactivos.
- Don't: publicar emails o nombres en la cadena ni mostrarlos como si fueran públicos.
