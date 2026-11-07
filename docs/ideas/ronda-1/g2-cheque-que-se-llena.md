# Cheque que se llena

**Un cheque diferido en ARGt que se va fondeando con cada venta de quien lo firmó, y cualquiera que lo recibe en endoso ve cuánto tiene adentro.**

## Problema
Hoy una pyme acepta un cheque o eCheq a 30-60 días sin saber si va a tener fondos. Lo endosa a su propio proveedor y, si rebota, el problema vuelve para atrás en toda la cadena. El eCheq ya admite endosos sin límite, pero no muestra si hay plata.

## Usuario concreto
**Claudio, dueño de una distribuidora de fiambres en Avellaneda.** Le vende a 40 almacenes y le paga a un frigorífico con cheques a 30 días. El frigorífico le pide "algo más seguro" o le sube el precio. Del otro lado está **Nora, de la administración del frigorífico**, que endosa esos cheques al transportista.

## Evidencia
- Récord de 119.285 cheques rechazados por falta de fondos en dic. 2025, el triple que un año antes ([iProfesional, 31/1/2026](https://www.iprofesional.com/economia/447284-la-increible-cantidad-de-cheques-que-se-rechazaron-diciembre-2025), DOLORES #12).
- 137.576 rechazados en ene. 2026 (+51 %), según APYME. La mora de las pymes llegó al 4 %, contra el 0,9 % de las grandes (Analytica) ([Cronista, 12/3/2026](https://www.cronista.com/economia-politica/atrasos-en-la-cadena-de-pagos-cual-es-el-escenario-para-el-comercio-e-industria-y-la-medida-de-alivio)).
- La CNV liberó el endoso ilimitado de eCheq "para darles liquidez", en un contexto donde los rechazos pasaron de 55.000 a 112.000 en un año ([Cronista](https://www.cronista.com/finanzas-mercados/desregulacion-de-echeqs-el-gobierno-libero-el-limite-de-endosos-que-implica-para-las-empresas/); fecha de la nota [SIN VERIFICAR]).
- El 62 % de las pymes industriales cobra a plazos más largos de lo habitual (Observatorio PyME, DOLORES #13).

## Solución
1. Claudio (KYB, nivel 4) emite un cheque en ARGt con vencimiento y monto. Puede emitirlo sin fondos, pero el contrato guarda cuánto tiene depositado.
2. Las cobranzas de Claudio en ARGt entran por un "router" que manda automáticamente un % de cada venta al cheque abierto. El frigorífico ve el termómetro subir en vivo.
3. Solo una empresa KYB puede recibir un endoso. Al vencer, el contrato le paga solo al último endosatario. Si no se llenó, queda registrado como "sin fondos" contra la credencial de la empresa que lo emitió, a la vista de todos.

## Momento wow (30 s)
Pantalla con un cheque al 40 %. Entra una venta de un almacén y la barra sube al 70 %. Nora lo endosa al transportista con un clic. Una billetera sin KYB intenta recibirlo y el contrato la rechaza (`NotVerified`). Adelantamos el vencimiento (plazo corto en Fuji), el cheque llega al 100 % y el transportista cobra sin que nadie apriete nada.

## Quién paga
El emisor paga una comisión chica por cheque (ej. 0,3 %) a cambio de conseguir plazo sin que le suban el precio. El receptor puede pagar por una alerta de "cheque en riesgo" cuando el llenado viene atrasado. Montos y disposición a pagar [SIN VERIFICAR].

## Por qué blockchain
El fondeo, el endoso y el pago los ven y los ejecutan empresas que no confían entre sí y no comparten banco. Ninguna puede tocar los fondos ni "dibujar" el termómetro. Con una base de datos común, el operador de la base podría mentir sobre los fondos.

## Sponsors
- **Twin:** ARGt como medio de pago B2B real, que liquida un sábado o un feriado. Sin rendimiento: los fondos retenidos no generan intereses (condición CNV).
- **KUMPLY:** KYB (nivel 4) verificado dentro del contrato en cada endoso. Es la "integración on-chain real" que piden.
- **BitGo:** controles e historial auditable de un instrumento de crédito.

## Qué se reutiliza (rutas en refs/)
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/RevenueSplitter.sol`: la división en puntos básicos (`_split`) sirve como base del router que manda un % de cada venta al cheque. `script/DeployRevenueSplitter.s.sol` y `script/params/fuji-revenue-splitter.json` sirven para el despliegue en Fuji.
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol`: patrón de fondos retenidos con estados, `deadline`, `settle`, `refund` y `withdraw` (+ `src/libraries/PaymentStateLib.sol`).
- `refs/Kumply/contracts/contracts/ComplianceGate.sol`: `_requireVerified` (tier mínimo) para usar dentro de `endosar()`.
- `refs/Kumply/packages/sdk/src/client.ts` (`isBusiness`) y `src/constants.ts` (direcciones de Fuji): para que el front muestre si la empresa está verificada.
- Plan B de identidad: `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol` (tiers emitidos a mano, solo para la demo).
- **A construir:** el contrato `Cheque` (emitir, fondear, endosar, cobrar) y el router de ventas.

## Ataque
*(Abogado del diablo 2, ronda 1)*
- **¿Base de datos común?** Un fideicomiso o una cuenta recaudadora bancaria con cesión de cobranzas ya hace "fondear de a poco y mostrar cuánto hay" [SIN VERIFICAR: que se use en este segmento]. Lo que se pierde: que endosatarios de distintos bancos lo vean sin confiar en el banco. Pero el termómetro solo mide lo que Claudio decide mandar por el router. Si cobra sus ventas por fuera, el contrato no lo puede obligar. Es una garantía parcial, no un cheque con fondos.
- **¿Ya existe?** El eCheq con endosos ilimitados, que se puede descontar en el mercado de capitales ([Cronista](https://www.cronista.com/finanzas-mercados/se-oficializo-el-descuento-de-cheques-electronicos-en-el-mercado-de-capitales)), y la consulta pública de cheques rechazados por CUIT del BCRA ([texto ordenado](https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-ceninf.pdf)). No encontré eCheq tokenizados en Argentina.
- **¿Billetera cripto?** Para que el router se llene, los 40 almacenes de Claudio tienen que pagarle en ARGt, y el frigorífico y el transportista necesitan billeteras KYB. Además, un crédito endosable en token podría ser valor negociable para la CNV, como pasó con ARGt (SPONSORS #1) [SIN VERIFICAR].
- **¿Fuji en 12 h?** Sí: retención, endoso y router se hacen con `PaymentHub` y `RevenueSplitter`. Lo más riesgoso: 3 billeteras KYB (nivel 4) reales en Fuji. El plan B `WorkshopKYA` tiene otra interfaz (`verify` devuelve solo `uint32`, línea 54) y cualquiera puede emitir tiers. Ojo: `_requireVerified` exige `tier >= requiredTier` (`ComplianceGate.sol`, línea 97), así que con nivel 4 también pasa un agente nivel 5. Hay que chequear `== 4` a mano.
- **¿ARGt y KUMPLY?** ARGt suma: B2B en pesos que liquida un sábado. KYB filtra a los endosatarios, pero la marca "sin fondos" vive en nuestro contrato, no en la credencial de KUMPLY.
- **Debilidad más grave:** el emisor decide qué ventas pasan por el router, así que el termómetro no garantiza nada que no dé un eCheq con aval de SGR. Además depende de que sus clientes paguen en ARGt.

## Usuario
Soy Claudio, distribuidora de fiambres en Avellaneda. Me sirve si el frigorífico deja de subirme el precio, pero mis 40 almaceneros me pagan en efectivo y transferencia: el "termómetro" se llenaría con lo que yo quiera meter.
No entiendo qué gano frente a un eCheq que ya uso desde el home banking, ni cómo lo paso a pesos para pagar sueldos el viernes.
Pagaría 0,3 % solo si el frigorífico me lo acepta sin recargo; si no, nada.
Me da miedo que cualquiera vea cuánto vendo y a quién le debo, y que un "sin fondos" quede pegado a mi empresa para siempre.
