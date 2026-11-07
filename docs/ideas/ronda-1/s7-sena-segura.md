# s7 – Seña segura para alquileres de verano
**Frase:** la seña de un alquiler temporario queda retenida en un contrato y solo la cobra un dueño verificado cuando llegás.

*(Semilla 7 de CONTEXTO.md. Rutas relativas a `ideas/`.)*

## Problema
Para reservar en la costa, las familias transfieren la seña a un desconocido de Facebook o WhatsApp. Si la casa no existe, la plata ya se fue. Lo mismo pasa con autos usados o compras de Marketplace con pago anticipado.

## Usuario concreto
**Familia Gómez, de Santa Fe.** Andrea encontró una casa en Santa Clara del Mar por Facebook; el "dueño" le pide $210.000 de seña por transferencia antes de enero. No puede ir a ver la casa.

## Evidencia
- Caso de enero de 2026: una familia santafesina transfirió $210.000 de seña por una casa cerca de Mar del Plata que no se alquilaba, y la plata fue a la cuenta de alguien preso ([Noticias NQN, 20/1/2026](https://www.noticiasnqn.com.ar/noticias/2026/01/20/326920-estafa-con-alquileres-en-la-costa-atlantica-una-familia-fue-enganada-y-recibio-burlas-desde-una-carcel), DOLORES.md #1).
- La UFECI la puso entre las 4 estafas más reportadas en enero de 2025 ([Chequeado, 18/1/2025](https://chequeado.com/el-explicador/estafas-en-los-alquileres-de-verano-2025-cuales-son-las-modalidades-mas-comunes-y-como-evitar-caer-en-la-trampa/), DOLORES.md #1).
- Autos "mellizos": las víctimas "pagan primero para revisar después" ([Sitio Andino, 2/11/2025](https://www.sitioandino.com.ar/policiales/autos-mellizos-la-trampa-que-ya-afecta-mas-80-mil-vehiculos-argentina-n5711182), cifra de ONG, DOLORES.md #4).
- Conteo nacional de 2026: [SIN VERIFICAR].

## Solución (3 frases)
El dueño solo puede publicar si tiene KYC nivel 2+ en KUMPLY (`isPersonAtLeast(addr, 2)`). Andrea deja la seña en ARGt (en Fuji, token de prueba) retenida en el contrato, no en la cuenta del dueño. Se libera al dueño cuando ella confirma el check-in o al vencer el plazo sin reclamo; si hay reclamo, decide un árbitro.

## Momento wow (30 s)
Un "dueño" sin KYC intenta publicar la casa y el contrato lo rechaza. El dueño verificado publica; Andrea deja la seña, se ve "retenida"; llega, confirma el check-in y la plata pasa al dueño en el acto.

## Quién paga
[SIN VERIFICAR] Comisión por seña protegida (a cargo del inquilino como "seguro", o del dueño para ganar confianza).

## Sponsor que la amaría
- **Belo:** propuso la variante "Seña de verano en Brasil" con BRAt/ARGt (SPONSORS.md #5).
- **Twin:** ARGt como medio de pago real, y liquida en fin de semana (SPONSORS.md #1).
- **KUMPLY:** gate de persona nivel 2+ en contrato (SPONSORS.md #7).

## Qué se reutiliza del repo de referencia
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol` – patrón de retención: `pay` (línea 109), `refund` por plazo (línea 158), `settle` (línea 171). Ojo: `settle` lo puede llamar cualquiera; confirmación de check-in y árbitro son a construir.
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` – patrón `_requireVerified` (línea 85) con `requiredTier` 2.
- `refs/Kumply/packages/sdk/src/client.ts` – `isPersonAtLeast` (línea 222).
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol` – ARGt de prueba.

## Ataque
*(Abogado del diablo 2, ronda 1)*
- **¿Base de datos común?** Una plataforma que retiene el pago hace lo mismo: Airbnb le paga al anfitrión unas 24 h después del check-in ([Airbnb](https://es-l.airbnb.com/resources/hosting-homes/a/how-you-get-paid-for-hosting-20)). Lo que se pierde: no hay un intermediario con la plata (que necesitaría licencia) y sirve en tratos de Facebook o WhatsApp, que es donde ocurre la estafa (DOLORES #1).
- **¿Ya existe?** Airbnb y Booking, dentro de su plataforma. No encontré un servicio argentino de seña retenida para tratos entre particulares [SIN VERIFICAR: que no exista].
- **¿Billetera cripto?** Andrea tiene que conseguir ARGt, y el dueño honesto de la costa también tiene que aceptarlo. El estafador va a decir "transferime", así que solo protege a quien ya desconfía. Y KYC 2 prueba que el dueño es una persona real, no que la casa sea suya: la estafa de la nota cobró en una cuenta bancaria, que también tiene KYC.
- **¿Fuji en 12 h?** Sí, pero `PaymentHub` hace al revés de lo que hace falta: `settle` solo funciona antes del plazo (línea 177) y `refund` solo después (línea 162), y aquí "vence sin reclamo" tiene que pagarle al dueño. Hay que reescribir la retención, el check-in y el árbitro. Además falta una billetera con KYC 2 real en Fuji.
- **¿ARGt y KUMPLY?** ARGt es esencial: la seña es en pesos y liquida un sábado de enero. KUMPLY suma (permite identificar y perseguir al dueño), pero lo que protege es la retención.
- **Debilidad más grave:** el KYC no prueba que el dueño sea dueño de la casa, y el estafador simplemente pide transferencia por fuera.

## Usuario
Soy Andrea, de Santa Fe. Sí lo usaría: que la seña quede guardada hasta que llegue a la casa es justo lo que necesito para no ir a ciegas.
No entiendo cómo sé que la casa es de ese señor (que esté "verificado" no me dice que sea el dueño) ni cómo consigo ARGt.
Pagaría un 3-5 % de la seña como seguro, unos $10.000 sobre $210.000.
Me da miedo que el dueño no quiera usarlo y me diga "transferime o se la doy a otro", y que si hay problema el árbitro tarde semanas.
