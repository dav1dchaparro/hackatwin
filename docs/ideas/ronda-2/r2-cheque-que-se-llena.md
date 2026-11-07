Origen: g2-cheque-que-se-llena (+ dato de g2-legajo-buen-pagador, idea de Tether de s8-p2p como "a futuro")

# Cheque que se llena

**Un cheque diferido en ARGt cuyos fondos quedan trabados adentro y que se llena con facturas que los clientes verificados del emisor aceptaron pagarle al cheque. Quien lo recibe en endoso ve cuánto hay y cuánto está comprometido.**

## Problema
Una pyme acepta un cheque o eCheq a 30-60 días sin saber si va a tener fondos, lo endosa y, si rebota, el problema vuelve para atrás por toda la cadena. El eCheq admite endosos ilimitados, pero no muestra si hay plata ni impide que el emisor vacíe la cuenta.

## Usuario concreto
**Claudio, distribuidora de fiambres en Avellaneda.** Le paga a un frigorífico con cheques a 30 días y el frigorífico le sube el precio "por riesgo". **Nora, de la administración del frigorífico**, endosa esos cheques al transportista. Dos de los clientes grandes de Claudio son autoservicios con cuenta empresa (KYB).

## Evidencia
- Récord de 119.285 cheques rechazados en dic. 2025, el triple que un año antes ([iProfesional, 31/1/2026](https://www.iprofesional.com/economia/447284-la-increible-cantidad-de-cheques-que-se-rechazaron-diciembre-2025)); unos 112.000 por $357.800 M en mar. 2026 ([Infobae, 1/5/2026](https://www.infobae.com/economia/2026/05/01/crecieron-los-cheques-rechazados-por-falta-de-fondos-y-duplican-el-nivel-de-hace-un-ano/)).
- 2.º trim. 2026: el 15,3 % de las pymes industriales se atrasó con proveedores (antes 5,7 %) y el 24 % tuvo un vencimiento impago ([El Economista, 19/8/2026](https://eleconomista.com.ar/economia/alerta-pymes-una-cada-cuatro-atrasa-sus-pagos-problema-duplico-menos-ano-n97516)).

## Solución
1. Claudio (KYB) emite el cheque: monto, vencimiento y cronograma de llenado. Lo que deposita queda **trabado**: él no lo puede retirar; solo cobra el tenedor al vencer.
2. El cheque no depende de que Claudio "quiera" mandar ventas: un cliente KYB **acepta en el contrato** una factura de Claudio y se compromete a pagarla al cheque. La barra muestra dos colores: **en caja** (sólido) y **comprometido por clientes verificados** (rayado). Si el llenado viene atrasado contra el cronograma, el tenedor ve "en riesgo" (ámbar) antes del vencimiento, no el día del rechazo.
3. Solo una empresa KYB exacta (nivel 4, no agentes) puede recibir un endoso. Al vencer, el contrato le paga solo al último tenedor. Si falta plata, queda "atrasado" en nuestro contrato y pasa a "pagado con N días de atraso" cuando se completa: no es una marca eterna ni toca la credencial de KUMPLY.

## Momento wow (30 s)
Cheque al 40 % sólido + 30 % rayado ("factura aceptada por cliente KYB ✓", autoservicio ficticio de la demo). El autoservicio paga: el rayado se vuelve sólido, 70 %. Nora endosa al transportista con un clic. Una billetera sin KYB y un agente nivel 5 intentan recibirlo: los dos rebotan. Adelantamos el vencimiento (plazo corto en Fuji) y el transportista cobra solo, un sábado.

## Quién paga
El emisor, una comisión por cheque (ej. 0,3 %) a cambio de plazo sin recargo. Monto y disposición a pagar [SIN VERIFICAR]; Claudio solo paga si el frigorífico lo acepta sin recargo.

## Por qué blockchain
Emisor, clientes, frigorífico y transportista no comparten banco ni confían entre sí. Ni el emisor ni el operador pueden sacar la plata trabada ni dibujar la barra. Con una base común, el que la opera podría mentir sobre los fondos y el emisor podría desviar el cobro de la factura.

## Sponsors
- **Twin:** ARGt como medio de pago B2B en pesos que liquida un sábado. Sin rendimiento: lo trabado no genera intereses (condición CNV).
- **KUMPLY:** chequeo on-chain de KYB en cada endoso y en cada factura aceptada. Es la integración en contrato que buscan para su piloto.
- **BitGo:** fondos bajo reglas, historial auditable de un instrumento de crédito.
- **Tether (a futuro, opcional):** aceptar USDT de un cliente y que entre al cheque como ARGt. Requiere liquidez USDT/ARGt en Fuji: no va en la demo.

## Qué se reutiliza (verificado en refs/)
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/RevenueSplitter.sol`: **se usa tal cual** para la factura cedida: `constructor(_seller, _platform, _platformBps)` con `_seller` = Claudio y `_platform` = el cheque; `release()` manda el % al cheque. Despliegue: `script/DeployRevenueSplitter.s.sol` + `script/params/fuji-revenue-splitter.json` (hoy `platformBps: 500`, se cambia el número).
- `.../src/PaymentHub.sol` (`pay` con `deadline`, `settle`, `refund`, `withdraw`) + `src/libraries/PaymentStateLib.sol` (`canTransition`): patrón de estados del cheque.
- `refs/Kumply/contracts/contracts/AttestationStore.sol` `verify()` (l. 224: devuelve `verified, tier, timestamp, expiry`): el cheque exige `verified && tier == 4`. **No** heredar `ComplianceGate.sol`: `_requireVerified` usa `tier < requiredTier` (l. 97) y deja pasar agentes nivel 5.
- `refs/Kumply/packages/sdk/src/client.ts` `isBusiness` (l. 236, exactamente nivel 4) y `src/constants.ts` (l. 70-71, `fuji.attestationStore`) para el front.
- `refs/hackatwin-x402-team1-avalanche/packages/ui/src/atoms/TxLink.tsx` y `Badge.tsx`: link al endoso y sello "KYB ✓".
- Plan B: `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol` (`issueTier` sin control de acceso; `verify` devuelve solo `uint32`, l. 54 → hace falta un adaptador de 10 líneas). Decirlo en el pitch.
- **A construir:** contrato `Cheque` (emitir, depositar, aceptarFactura, endosar, cobrar, estado de atraso) y front con la barra de dos colores. Riesgo principal: 4 billeteras KYB reales en Fuji (KYB tier 4 aún sin cotización de Sumsub, `refs/Kumply/LITEPAPER.md` l. 225).

## Riesgos que se dicen de frente
- Un cliente puede pagar la factura por fuera: el rayado nunca se vuelve sólido y el tenedor lo ve como "en riesgo". La garantía es lo sólido.
- Los montos en ARGt son públicos on-chain; el front muestra %, pero la cadena no esconde nada. Privacidad con eERC: "Phase 2", no implementada (CONTEXTO.md).
- Que un cheque endosable en token sea valor negociable para la CNV: [SIN VERIFICAR]. Sin rendimiento, sin descuento ni mercado secundario en la app. Pregunta para mentores.
- Pasar ARGt a pesos para sueldos: vía Belo u otro que liste ARGt [SIN VERIFICAR: rampa de salida para empresas].

## Cambios vs ronda 1
- El llenado ya no depende de un router que el emisor controla: depósitos trabados + facturas que acepta el cliente KYB (barra sólida/rayada). Responde a la debilidad más grave del Ataque.
- No hace falta que los 40 almacenes paguen en ARGt: alcanza con los clientes grandes con KYB.
- Alerta "en riesgo" por cronograma; "sin fondos" eterno → "pagado con N días de atraso".
- KYB exacto (`tier == 4`) con `verify()`, sin heredar `ComplianceGate`; wow suma el rebote del agente nivel 5.
- `RevenueSplitter` reutilizado sin cambios; ruta de `constants.ts` y líneas verificadas.
- Suma dato de El Economista (rescate), Tether como "a futuro" y riesgos de privacidad, CNV y rampa dichos de frente.

## Ataque
*(Abogado del diablo 1, ronda 2)*
- **Hueco central:** lo único garantizado (lo sólido) es la plata que Claudio traba por adelantado, que es justo la liquidez que no tiene: por eso paga con cheque a 30 días. Lo rayado no obliga a nadie, porque el cliente puede pagar por fuera (la idea lo admite). Termina siendo un depósito en garantía con un termómetro, no un cheque con fondos.
- **¿Base de datos común?** Una cuenta recaudadora o un fideicomiso bancario con cesión de cobranzas hace casi lo mismo. Lo que se pierde: que tenedores de distintos bancos vean el saldo sin confiar en el operador y que el emisor no pueda sacar lo trabado.
- **¿Ya existe?** Sí, con respaldo legal. La **Factura de Crédito Electrónica MiPyME**: el comprador la acepta en un registro de ARCA (o queda aceptada sola a los 21 días) y se negocia antes del vencimiento ([Cronista, 27/10/2025](https://www.cronista.com/finanzas-mercados/factura-de-credito-electronica-que-es-y-cuales-son-los-beneficios-que-brinda-a-tu-pyme)). Y el **eCheq avalado por SGR**: si el emisor no paga, paga la SGR, con una comisión de ~3 % ([El Economista](https://eleconomista.com.ar/negocios/como-hacer-operar-echeqs-n33497); [MAV](https://mav-sa.com.ar/wp-content/uploads/2025/09/Brochure_Echeq.pdf)). La CNV abrió un régimen de "representación digital de valores negociables" ([iProUP, 11/8/2026](https://www.iproup.com/economia-digital/70340-el-gobierno-lleva-tecnologia-cripto-a-la-bolsa-para-ampliar-el-credito.amp)). Que este cheque caiga ahí: [SIN VERIFICAR].
- **¿Billetera cripto?** Claudio, el autoservicio, el frigorífico y el transportista necesitan billetera de empresa, custodia y un contador que registre pagos en ARGt. La rampa de salida para sueldos sigue [SIN VERIFICAR]. Nora no endosa algo que su banco no reconoce.
- **¿Fuji en 12 h?** Sí, pero `RevenueSplitter.release()` reparte todo el saldo sin saber qué factura se pagó (`RevenueSplitter.sol`, l. 38-45). Para que el rayado pase a sólido por factura hace falta lógica propia: un splitter por factura o un pago directo al `Cheque`. Lo más riesgoso: 4 o más billeteras KYB, todas autoemitidas con `WorkshopKYA`.
- **¿ARGt y KUMPLY?** ARGt sí: es B2B en pesos y liquida un sábado. El KYB de los endosatarios replica lo que el eCheq ya hace con CUIT y bancos: sirve para que el contrato funcione, pero no lo diferencia.

## Usuario
- Soy Claudio, la distribuidora de fiambres de Avellaneda. Si pago con cheque a 30 días es porque hoy no tengo la plata: trabarla por adelantado no me sirve, salvo que el frigorífico me saque el recargo "por riesgo".
- No entiendo qué gano contra un eCheq avalado por una SGR, que mi contador ya conoce, ni cómo anoto en los libros un pago en ARGt.
- Pagaría el 0,3 % solo si el frigorífico me baja el precio más que eso. Si no, nada.
- Me da miedo que cualquiera vea on-chain cuánto le compro a quién, y que Nora me diga "esto mi banco no lo reconoce" y no lo acepte.
