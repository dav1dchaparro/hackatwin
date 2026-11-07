# Recibo sin Patrón — tus cobros informales, convertidos en constancia de ingresos

**Frase:** cada pago en ARGt que le hace una persona verificada a un trabajador informal queda registrado y se convierte en una constancia de ingresos que una inmobiliaria puede leer sin pedirle nada a nadie.

## Problema
Más de 4 de cada 10 trabajadores son informales. Cobran todos los meses, pero no tienen recibo de sueldo. Para alquilar les piden ingresos de 3 veces el alquiler o un garante, y una captura del Mercado Pago no le sirve a nadie porque se puede truchar o armar entre amigos.

## Usuario concreto
**Rosa, 41 años, trabaja limpiando casas en Villa Urquiza:** 5 empleadores, cobra unos $900.000 por mes, todo en negro. Quiere alquilar un dos ambientes en San Martín y la inmobiliaria le pide recibo de sueldo.

## Evidencia
- Informalidad del 43 % (≈5,8 M de personas). En el servicio doméstico, el 71,4 % de los puestos no está registrado (DOLORES.md #8: [Crónica, 13/4/2026](https://www.cronica.com.ar/politica/la-informalidad-laboral-no-da-tregua-afecto-al-43-de-los-trabajadores-al-cierre-de-2025/), [Mendoza Post, 2/9/2026](https://www.mendozapost.com/economia/mapa-de-la-informalidad-en-la-argentina-sector-por-sector/)).
- Hábitat para la Humanidad lanzó una "Inmobiliaria Social" piloto para "personas con ingresos informales" sin garantía ni recibo. La nota no dice cómo evalúan los ingresos ([iProfesional, 1/8/2026](https://www.iprofesional.com/economia/461087-esta-inmobiliaria-permite-alquilar-a-quienes-no-tienen-garantia-ni-recibo-de-sueldo)).
- La regla de mercado es tener ingresos de 3 veces el alquiler; sin documentación, la alternativa es un seguro de caución ([blog Mercado Libre, sin fecha, fuente comercial](https://www.mercadolibre.com.ar/blog/re-requisitos-alquiler-departamentos)). Para monotributistas, la Cámara Inmobiliaria de Mendoza propone una "certificación de ingresos emitida por un contador" ([Sitio Andino, 18/3/2024](https://www.sitioandino.com.ar/sociedad/monotributistas-por-que-algunas-inmobiliarias-no-les-quieren-alquilar-n5672975)).

## Solución (3 frases)
Los empleadores de Rosa le pagan en ARGt a través de un contrato "Libreta de Cobros", que solo acepta pagos si quien paga y quien cobra son personas KYC 2+ distintas en KUMPLY. El contrato acumula por mes los pagadores verificados distintos, el total cobrado y los meses seguidos con ingresos. La inmobiliaria pega la dirección de Rosa y ve una constancia del tipo "6 meses seguidos, 5 pagadores verificados, promedio $910.000", sin llamar a nadie.

## Momento wow (30 s)
Pantalla de la inmobiliaria: "¿Rosa puede pagar $280.000?" → en vivo entra el pago de un empleador más → la constancia se actualiza a "3,2× el alquiler ✓". Después se prueba el truco: Rosa intenta pagarse a sí misma desde otra billetera sin verificar → el contrato lo rechaza y no cuenta.

## Quién paga
Inmobiliarias, aseguradoras de caución y fintech de crédito pagan por cada constancia detallada (el resumen es gratis para la trabajadora). Ese cobro por consulta puede ir por x402 si lo hace un agente de la inmobiliaria. Precio: [SIN VERIFICAR].

## Sponsor que la amaría
- **Belo:** nació como "la billetera de los freelancers" (SPONSORS.md) y esto es identidad financiera para quien cobra por fuera del sistema.
- **KUMPLY:** sin su credencial la constancia no vale nada, porque cualquiera se paga con 10 billeteras propias. Es el corazón de la idea, no un adorno.
- **Twin:** ARGt como medio de pago de sueldos en pesos, sin rendimiento (cumple con lo que pidió la CNV). **Digital House:** empleabilidad.

## Qué se reutiliza
- Chequeo de persona verificada: `refs/Kumply/packages/sdk/src/client.ts` (`isPersonAtLeast(addr, 2)`) y `refs/Kumply/contracts/contracts/AttestationStore.sol` (`verify`) para el chequeo dentro del contrato. Es mejor que heredar `ComplianceGate.sol`, que también dejaría pasar tier 4 y 5.
- Direcciones de Fuji: `refs/Kumply/packages/sdk/src/constants.ts`.
- Tarjeta visual del nivel: `refs/Kumply/apps/web/src/components/TierCard.tsx`.
- Comisión de plataforma por cada pago: `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/RevenueSplitter.sol` + `script/DeployRevenueSplitter.s.sol`.
- Constancia paga por consulta (opcional): `refs/hackatwin-x402-team1-avalanche/demos/01-x402-twin/seller-api/main.ts`.
- La "Libreta de Cobros" hay que construirla desde cero.

**Riesgos que ya veo:** los cobros quedan públicos en la cadena (privacidad; eERC solo como "a futuro"); miedo a ARCA si los ingresos informales se vuelven visibles; dos personas verificadas pueden ponerse de acuerdo para inflar pagos; hace falta que los empleadores paguen en ARGt.

## Ataque
*(Abogado del diablo 2, ronda 1)*
- **¿Base de datos común?** En parte sí: un resumen de Mercado Pago o del banco ya muestra transferencias que entran, y quien paga pasó por el KYC del banco. Lo que se pierde: que el operador no pueda inventar ni borrar la constancia y que Rosa se la lleve a cualquier inmobiliaria. Pero la cadena solo prueba que se movió plata entre dos billeteras verificadas, no que sea un sueldo. KUMPLY guarda la credencial por dirección (`refs/Kumply/contracts/contracts/AttestationStore.sol`, línea 68), así que dos amigos verificados pueden pasarse la misma plata ida y vuelta para inflar la constancia.
- **¿Ya existe?** Hoggax hace una evaluación digital del inquilino y da garantía ([iProUP](https://www.iproup.com/startups/24703-garantia-de-alquiler-digital-como-funciona-hoggax)). Las aseguradoras de caución serían más flexibles con informales, según una fuente comercial ([blog ML](https://www.mercadolibre.com.ar/blog/re-requisitos-alquiler-departamentos)). La Inmobiliaria Social de Hábitat ya figura en la idea. No encontré una constancia de ingresos on-chain en Argentina, pero eso no prueba que no exista.
- **¿Billetera cripto?** El freno no es Rosa, son sus 5 empleadores. Cada uno tiene que hacer KYC 2 (DNI y prueba de vida), comprar ARGt y dejar un rastro público de que paga a una empleada en negro: el 71,4 % de los puestos del servicio doméstico no está registrado (DOLORES #8). Encima, en Avalanche hay muy poco ARGt: unos 1,77k según un PR a DefiLlama (SPONSORS #1).
- **¿Fuji en 12 h?** Sí: es un contrato con contadores por mes. Lo más riesgoso: hacen falta al menos 3 billeteras con KYC 2 real en Fuji (Rosa y 2 empleadores). Con `WorkshopKYA` el truco "me pago a mí misma" deja de probar algo. Además, "6 meses seguidos" hay que simularlo con fechas falsas.
- **¿ARGt y KUMPLY?** KUMPLY es esencial: sin él, cualquiera se paga desde 10 billeteras propias. ARGt suma porque el ingreso y el alquiler son en pesos, pero cualquier stablecoin de prueba sirve igual.
- **Debilidad más grave:** los empleadores no ganan nada y arriesgan mucho al dejar en público que pagan en negro.

## Usuario
Soy Rosa, limpio casas en Villa Urquiza. Me encantaría tener algo que valga como recibo, pero mis patronas me pagan en efectivo o por Mercado Pago y no les voy a pedir que hagan un trámite con DNI y selfie por mí.
No entiendo por qué la inmobiliaria va a creerle a esto más que a mis capturas, ni qué es una "billetera verificada".
Pagaría poco, $5.000 una sola vez cuando me toque alquilar; todos los meses, no.
Me da miedo que esto quede a la vista de todos y me saquen la AUH o me caiga ARCA, y que una patrona se enoje y me deje de llamar.
