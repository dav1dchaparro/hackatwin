# Blockchain Track (Avalanche): ideas y votación

**Elegida: d4 "Tesorero con Correa".** Un agente de IA le paga a los proveedores de la pyme, y un contrato en Fuji lo limita: solo paga a empresas KYB, con tope, y por encima de un umbral pide la aprobación del dueño.
**Por qué gana:** es la primera por total (82/120) y la eligieron los 3 jueces del panel. Es la que más seguro sale en 8 h, pone el KYA en el centro del producto (bonus 19/20, con el combo +20 natural por el paymaster tier 5) y no tiene el riesgo PSAV de b1.
**Cambio clave del panel:** subir "Uso de Avalanche" (11/25, su punto más flojo). Que el paymaster conjunto también funcione de filtro (al bot sin KYA no le patrocina el gas), pagar con un mock de ARGt en Fuji (en mainnet es cambiar una dirección) y, como mucho 2 h de una persona, una L1 de prueba con TxAllowList. Si no llega, se muestra la finalidad medida y se usa como idempotencia del agente.

---

## Tabla general (ordenada por total)

| # | id | Nombre | Frase | Imp/25 | Ava/25 | Fact/20 | Neg/20 | Pres/10 | Jurado/100 | Bonus/20 | Total/120 | Obligatorios |
|---|----|--------|-------|-------|-------|--------|-------|--------|-----------|---------|----------|-------------|
| 1 | d4 | Tesorero con Correa | El agente de la pyme paga a los proveedores solo, pero con correa: solo a empresas verificadas, con tope, y si se pasa le suena el celular al dueño. | 15 | 11 | 13 | 16 | 8 | 63 | 19 | **82** | Sí |
| 2 | b1 | Sin Triangular | USDT por P2P con las dos patas liquidadas en la misma tx, entre dos personas verificadas: no queda una cuenta de terceros que te congelen. | 20 | 13 | 13 | 13 | 6 | 65 | 16 | **81** | Sí |
| 3 | c5 | Factura que se adelanta sola | El cliente grande confirma la factura on-chain y la pyme la adelanta en minutos con un financista verificado. | 20 | 10 | 12 | 17 | 6 | 65 | 15 | **80** | Sí |
| 4 | b3 | Auto Sin Mellizo | El vendedor no cobra el auto usado hasta que una gestoría verificada confirma que el título está limpio. | 19 | 7 | 14 | 13 | 8 | 61 | 14 | 75 | Sí |
| 5 | a2 | eCheq con Fondos | Un "cheque" que no rebota: el agente deja la plata comprometida y paga al vencimiento, solo a proveedores KYB. | 16 | 11 | 13 | 10 | 8 | 58 | 17 | 75 | Sí |
| 6 | b2 | Recibo que Suma | Cada alquiler pagado deja un recibo que no se puede truchar, y con 12 seguidos conseguís depto sin recibo de sueldo. | 21 | 7 | 13 | 11 | 7 | 59 | 15 | 74 | Sí |
| 7 | c2 | Cheque con fondos | Un cheque diferido con la plata trabada al emitirlo, endosable solo entre empresas verificadas. | 17 | 11 | 14 | 9 | 8 | 59 | 15 | 74 | Sí |
| 8 | d1 | Mostrador Final | El cartel verde del kiosco lo pone la cadena cuando el pago es final y de una persona verificada, no una captura. | 15 | 14 | 17 | 5 | 10 | 61 | 12 | 73 | Sí |
| 9 | a3 | Mesa P2P Agéntica | El agente market maker de la mesa P2P opera 24/7, con correa on-chain y solo contra personas verificadas. | 17 | 12 | 9 | 14 | 4 | 56 | 17 | 73 | Sí |
| 10 | a4 | Cobrador Verificado | El link de pago del "estudio de cobranzas" solo funciona si el bot tiene KYA y su dueño es la fintech real. | 16 | 8 | 12 | 12 | 7 | 55 | 18 | 73 | Sí |
| 11 | d5 | Fila Justa | Entradas asignadas en orden real por la cadena: una por persona verificada, y los bots de reventa rebotan. | 12 | 12 | 12 | 11 | 9 | 56 | 16 | 72 | Sí |
| 12 | b5 | Seña Segura con Agente | La seña va a un contrato: el dueño la cobra cuando llegás, y si no hay casa tu agente te la devuelve. | 18 | 6 | 15 | 8 | 9 | 56 | 14 | 70 | Sí |
| 13 | a1 | Correa | El agente del almacén compra solo al mayorista aprobado, hasta el tope del día; los bots sin dueño verificado rebotan. | 10 | 13 | 9 | 12 | 7 | 51 | 19 | 70 | Sí |
| 14 | a5 | Alquiler en Piloto | El agente paga el alquiler ajustado por IPC, nunca más que el tope y nunca a una "cuenta nueva". | 15 | 5 | 13 | 9 | 7 | 49 | 16 | 65 | Sí |
| 15 | c4 | Garantía de oferta al toque | La pyme traba la garantía de la licitación en un contrato en vez de pagar una caución, y si pierde le vuelve en segundos. | 10 | 9 | 12 | 9 | 5 | 45 | 13 | 58 | Sí |
| 16 | d3 | Legajo KYB por ICM | La empresa se verifica una vez en C-Chain y la L1 del mayorista se entera sola por ICM. | 12 | 23 | 5 | 6 | 3 | 49 | 8 | 57 | Sí, condicionado (*) |
| 17 | c3 | Fondo de reparo en cascada | La retención de garantía de la obra baja por contrato hasta el último subcontratista. | 11 | 9 | 11 | 10 | 2 | 43 | 13 | 56 | Sí |

(*) d3 cumple solo si el KybBeacon queda desplegado y verificado en Fuji C-Chain. La L1 local no cuenta, y hay corte duro a las 13:00.

---

## Top 3

### 1. d4 · Tesorero con Correa (82/120)
- **Problema:** el 24 % de las pymes industriales tuvo un vencimiento impago y el 15,3 % se atrasó con proveedores (Observatorio PyME, 2.º trim. 2026). Pagar es trabajo manual, y delegarlo en un agente hoy significa darle la clave del banco: una factura trucha o un CBU cambiado terminan en un pago.
- **Usuario:** Marcela, administradora de una metalúrgica de Rafaela con unos 30 proveedores, que paga los viernes a la noche y ya sufrió un cambio de CBU [persona inventada].
- **Demo wow:** cuatro intentos en vivo. (1) Bot sin KYA: rojo. (2) Mail trucho a 0xF4K3 sin KYB: rojo. (3) Factura de $400.000 a un proveedor tier 4: verde, final en segundos, con Snowtrace. (4) Factura de $9 M: amarillo, le suena el celular a Marcela, aprueba con email y sin gas, y pasa a verde.
- **Por qué Avalanche:** con finalidad rápida el agente no repite pagos y el proveedor libera la mercadería en el acto. La política está en C-Chain y el proveedor la puede verificar. Roadmap: una L1 de tesorerías con allowlist ("empezar en C-Chain, pasar a L1"); que KUMPLY se lea por ICM está [SIN VERIFICAR].
- **KUMPLY:** core +10. Tres chequeos on-chain en cada pago: `isAgent(agente)`, dueño `isBusiness` y proveedor `isBusiness`. Es a mano el AgentRegistry que KUMPLY tiene planeado.
- **0xGasless:** combo +20 natural, porque el agente tier 5 usa el paymaster conjunto. Marcela entra con email (smart account) y nunca tiene AVAX.
- **Negocio:** abono mensual por agente (US$20-50 [SIN VERIFICAR]) más un plus por volumen. Los proveedores traen a otras pymes y los estudios contables sirven de canal.
- **Riesgo:** que KUMPLY emita a tiempo el tier 5 y los tier 4 (agent-kya no está configurado en Sumsub): hay que pedirlo a las 10:00 y probar el lane antes de las 12:00. Plan B: un store propio declarado, que pierde parte del bonus. Se parece a a1 y a2: posicionarla como B2B.
- **Votos del panel:** Juez 1 → 1.º · Juez 2 → 1.º · Juez 3 → 1.º.

### 2. b1 · Sin Triangular (81/120)
- **Problema:** triangulación en el P2P de USDT. En el operativo de mayo de 2026 hubo 90 allanamientos, unos $3.000 M en pérdidas y más de 8 M de USDT congelados (DOLORES #3).
- **Usuario:** Martín, vendedor P2P en Rosario, al que le congelaron la cuenta por pesos de un tercero estafado [persona inventada].
- **Demo wow:** un taker sin KYC revierte en rojo. Paula, verificada, cierra un swap atómico con un solo hash en Snowtrace y el tiempo medido en pantalla. El agente market maker llena una orden chica con el gas patrocinado.
- **Por qué Avalanche:** finalidad sin reorg, sin ventana de reversión. ARGt ya está en C-Chain mainnet (dirección a confirmar).
- **KUMPLY:** core, con `isPersonAtLeast(maker/taker, 2)` más `isAgent(marketMaker)`.
- **0xGasless:** core +10 por login con email. El combo pasa por el agente, y que el paymaster patrocine a las personas está [SIN VERIFICAR].
- **Negocio:** fee de 0,3-0,5 % por swap [SIN VERIFICAR] más licencia a PSAV y exchanges.
- **Riesgo:** regulatorio (PSAV/CNV), que se lea como "un DEX con KYC" y que la adopción de ARGt hoy es casi nula.
- **Votos del panel:** Juez 1 → 2.º · Juez 2 → 3.º · Juez 3 → 2.º.

### 3. c5 · Factura que se adelanta sola (80/120)
- **Problema:** el 62 % de las pymes cobra a plazos más largos y 1 de cada 4 tuvo impagos. El factoring es lento y el financista no adelanta si el deudor no reconoce la deuda.
- **Usuario:** Romina, taller de Campana, que factura $12 M a 90 días y tiene que pagar sueldos en 10.
- **Demo wow:** la química confirma la factura y un financista KYB paga $11,4 M en segundos. Un financista sin KYB sale rojo. Se adelanta el reloj y el agente cobra solo.
- **Por qué Avalanche:** con finalidad inmediata no hay doble cesión. La L1 KYB conectada por ICM es todo roadmap.
- **KUMPLY:** core. `isBusiness` para proveedor, deudor y financista, e `isAgent` para el cobrador.
- **0xGasless:** core +10 para las pymes. El combo pasa por el agente cobrador, que solo actúa al vencimiento.
- **Negocio:** 0,5-1 % sobre lo adelantado [SIN VERIFICAR]. Es el mejor negocio del lote (17/20).
- **Riesgo:** que el deudor grande no confirme on-chain (en la demo está sembrado), elegir entre allowance o fondos depositados, y que se pisa con la FCE [SIN VERIFICAR].
- **Votos del panel:** Juez 1 → 3.º · Juez 2 → 2.º · Juez 3 → 3.º.

---

## Por qué cada juez eligió d4
- **Juez 1 (técnico / Avalanche):** es la que más seguro funciona en Fuji en 8 h (un contrato con tres gates KUMPLY) y ataca los pagos de agentes con política on-chain, lo que más empuja Team1.
- **Juez 2 (negocio / inversor):** el cliente que paga es el más claro (abono mensual por un dolor semanal), tiene distribución por estudios contables y no carga el riesgo PSAV de b1.
- **Juez 3 (sponsors / bonus):** es la única en la que el KYA es el corazón del producto, y encaja con el único lane que el paymaster conjunto patrocina en Fuji: el +20 sale natural.
