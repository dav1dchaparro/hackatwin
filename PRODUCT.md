# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Gestor de la herencia (dueña o dueño de la Llave).** Persona que ahorra en pesos digitales y no es usuaria cripto: Marta, 67, jubilada, usa el celular. Entra con su email (0xGasless crea y conecta su cuenta), decide cada cuánto quiere dar señal de vida, carga a sus herederos y reparte porcentajes. Su tarea recurrente es tocar «Estoy bien»; su tarea ocasional es ajustar herederos y plazos.
- **Heredero o beneficiario.** Hijo, hija, pareja o persona de confianza (Lucía en CABA, Tomás en Madrid). Entra con su email, ve qué le corresponde y en qué etapa está la Llave. No tiene nada que hacer: la plata se le envía sola.
- Audiencia secundaria confirmada para hoy: el jurado de HackaTwin (7/11/2026) ve la web durante el pitch de 3 minutos. La web se diseña como producto real; el pitch usa las mismas pantallas. [Inferido de la conversación: el usuario pidió "2 vistas para el producto desde 0" y descartó el panel de proyector.]

## Product Purpose

Llave guarda los ahorros en pesos digitales de una persona en una bóveda propia en Avalanche con reglas que nadie puede saltear. Cada tanto la dueña da una señal de vida («Estoy bien»; cualquier movimiento suyo también cuenta). Si deja de darla, un agente con identidad verificada avisa, abre un período de gracia en el que ella puede cancelar, y después libera la herencia: la plata llega a quienes ella eligió, en los porcentajes que puso, sin sucesión, sin trámites y sin que nadie más pueda tocarla. Éxito: la familia tiene liquidez cuando más la necesita, y mientras tanto la dueña usa su plata con total libertad.

Frase que define al producto (confirmada): **«Si te pasa algo, tu plata no se congela: llega a quien vos elegiste, y nadie más la puede tocar.»** Con énfasis en la seguridad y la privacidad de los datos: las reglas viven en el contrato que guarda la plata, no hay función de administrador, y los datos personales (emails, nombres) no se publican en la cadena.

## Positioning

La única combinación de (1) stablecoins en pesos que se mueven solas por inactividad, (2) un agente ejecutor con identidad verificada en la misma operación (KUMPLY tier 5; cualquier otro bot rebota con `NotAgent`), (3) sin comisiones de red para la persona (0xGasless) y (4) reglas públicas y verificables en Snowtrace que ni el equipo puede cambiar. Comparables (Vault12, Casa, Kresus, Nunchuk) cobran suscripción, no verifican al ejecutor ni mueven pesos.

## Operating Context

- La dueña usa la web en el celular, en su casa; el heredero desde cualquier lugar. Nadie instala nada ni compra cripto.
- Red: Avalanche Fuji (demo) con contratos verificados; `MockPesos` (mPESO) como pesos de prueba. Plazos de demo: 60 s sin señales, 30 s de gracia; en producción, meses y semanas.
- Equipo HackaTwin: P1 contratos (`contracts/src/Llave.sol`), P2 lib web (`web/src/lib/`, 0xGasless, KUMPLY, keeper de avisos), P3 pantallas (`web/src/{pages,components,mock,styles}`), P4 README y pitch. La conversación del equipo es el PR #2.
- Modo ensayo (`VITE_MODO=mock`): cliente simulado con la misma máquina de estados que el contrato; permite ensayar sin cadena.

## Capabilities and Constraints

- Contrato: `estoyBien()`, `depositar`, `retirar`, `configurar(Config{herederos, bps, plazoInactividad, plazoGracia})`; agente: `iniciarReclamo()`, `liberar()`; comisión 1% al liberar; de 1 a 5 herederos como cuentas con porcentajes en bps que suman 10.000.
- Herederos por email: la cuenta de cada heredero se deriva del email (cuenta embebida de 0xGasless; en mock, derivación determinística). Los emails y nombres se guardan solo en el dispositivo de la dueña, nunca en la cadena.
- «Fondo común» y «donación» se modelan como destinos adicionales del reparto (una cuenta con su porcentaje), sin cambiar el contrato. [Decisión de diseño; el contrato no distingue tipos de destino.]
- Recordatorio por email cada período: preferencia guardada en el dispositivo y enviada por el keeper de P2 cuando esté conectado. [Pendiente de integración; hoy se muestra como configurado.]
- Terminología confirmada: «Llave», «bóveda», «señal de vida» / «Estoy bien», «herederos», «comprobante» (nunca "tx"), «cuenta» (nunca "wallet" ni "smart account" en pantalla, salvo la acción «Conectar»), «costo: $0». KUMPLY y 0xGasless aparecen solo como etiquetas.
- Nunca `hasTier()`. Nunca claves ni API keys en el repo.
- Fuera de alcance hoy: panel de proyector `/demo` (descartado por el usuario), emergencias y guardianes (sacados del alcance a las 14:32).

## Brand Commitments

- Nombre en la interfaz: **Llave**.
- Paleta vinculante: #012a4a, #013a63, #01497c, #014f86, #2a6f97, #2c7da0, #468faf, #61a5c2, #89c2d9, #a9d6e5.
- Referencia de interfaz pedida por el usuario: la claridad y jerarquía de un panel tipo Supabase (barra lateral, módulos, tiles de resumen, tablas limpias), con el tema claro y oscuro.
- Voz: castellano rioplatense, directo, sin palabras cripto, sin promesas de rendimiento.

## Evidence on Hand

- Contratos verificados en Fuji (PR #12): MockPesos `0x866FD7C4B1c5d356c11840550483Ef3e415FA66E`, Llave A `0xd466FD4712A70E6b2c4d1Ec299210E905d2eF8BA`, Llave B `0xc74d36226ACABb11482455175919fbFF3936de37`.
- Datos del problema con fuente (sucesión 4 a 5 meses en CABA, 6% a 15% de los bienes, 85% de las compras cripto en Argentina son stablecoins) en `docs/ideas/final/PLAN_LLAVE_EMERGENCIA.md`.
- No hay testimonios, clientes ni precios reales: no inventarlos.

## Product Principles

1. La dueña nunca pierde libertad: retirar es gratis y también cuenta como señal de vida.
2. Cada paso tiene una consecuencia visible: qué pasa si no toca «Estoy bien», cuándo, y quién puede actuar.
3. Lo privado queda en el dispositivo; lo público (reglas, montos, comprobantes) es verificable por cualquiera.
4. Solo un agente verificado libera; cualquier otro rebota, y eso se muestra, no se promete.
5. Sin trámites para la familia: el heredero solo mira.

## Accessibility & Inclusion

Usuaria principal de 67 años en el celular: tipografía de 16 px como piso en acciones y montos, botones de 44 px o más, contraste AA, textos sin jerga, estados de error que dicen qué pasó y qué hacer.
