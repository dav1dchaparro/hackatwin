# Cuota Blindada — el viaje de egresados que la agencia no puede vaciar

**Frase:** las cuotas del viaje de egresados se juntan en ARGt dentro de un contrato que les paga directo al micro, al hotel y a la aerolínea verificados, nunca a la caja de la agencia.

## Problema
Las familias pagan cuotas durante uno o dos años y la agencia maneja toda la plata. Si no reserva los vuelos o quiebra, los chicos quedan varados y la plata ya no está. Los padres no tienen forma de ver si el hotel o el micro están pagos hasta que es tarde.

## Usuario concreto
**Claudia, mamá de Tomi (5.º año) en Bahía Blanca.** Es la delegada de 32 familias que pagan 14 cuotas a una agencia para ir a Bariloche. En el grupo de WhatsApp todos preguntan "¿ya pagaron el hotel?".

## Evidencia
- Egresados de un instituto de Bariloche quedaron varados en Córdoba: según las familias, la agencia no había pagado boliches ni excursiones, y "los vuelos nunca habían sido reservados", aunque ellas habían pagado todas las cuotas ([ANB, 2/1/2026](https://www.anbariloche.com.ar/amp/noticias/2026/01/02/101650-egresados-barilochenses-fueron-estafados-en-su-viaje-a-brasil-y-terminaron-varados-en-cordoba)).
- Otra agencia de viajes de egresados sumó "cientos de denuncias" de padres en Río Negro ([El Cronista, 2023](https://www.cronista.com/negocios/tras-la-polemica-con-travel-rock-otra-agencia-de-viajes-de-egresados-suma-cientos-de-denuncias-y-es-acusada-de-estafa); fecha exacta [SIN VERIFICAR]).
- Turismo Felgueres: la justicia contó 1.967 afectados y daños por más de US$10 M, y eso que la agencia tenía seguro de caución ([El Cronista, 26/4/2023](https://www.cronista.com/negocios/la-estafa-de-turismo-felgueres-los-danos-provocados-por-la-agencia-ascienden-a-us-10-millones-segun-la-justicia)). No es de egresados, pero muestra que el seguro y el registro no alcanzan.
- Cuántos viajes de egresados fallan por año: [SIN VERIFICAR], no encontré estadística.

## Solución (3 frases)
La agencia (KYB nivel 4) crea el viaje en un contrato y carga el presupuesto por proveedor (micro, hotel, vuelos, boliches), cada uno con su billetera KYB. Las familias (KYC 1+) pagan sus cuotas en ARGt al contrato, y cada pago queda a nombre del alumno. El dinero solo sale hacia la billetera de un proveedor verificado y contra su tramo del presupuesto; la ganancia de la agencia se libera recién cuando vuelve el viaje, y si la agencia no paga a tiempo, el saldo vuelve a las familias.

## Momento wow (30 s)
Tablero de padres: "Hotel ✓ pagado · Micro ✓ pagado · Vuelos ⏳ pendiente · en caja $11,2 M". En vivo, la agencia intenta transferirse $5 M a su propia billetera → **revertido: "destino no es proveedor del viaje"**. Llega la fecha límite de los vuelos sin pago → se activa la devolución y Claudia ve volver su parte.

## Quién paga
Las agencias pagan una comisión chica por viaje y la usan como argumento de venta ("viaje blindado"). Los colegios pueden exigirlo como condición. Porcentaje: [SIN VERIFICAR].

## Sponsor que la amaría
- **KUMPLY:** usa dos categorías en el mismo flujo (KYB para agencia y proveedores, KYC para familias) y hace el chequeo on-chain dentro del contrato. Es justo el "piloto integrador" que buscan (SPONSORS.md).
- **Twin:** cuotas en pesos que cubren un servicio en pesos, sin pasar por el dólar.
- **Digital House / Belo:** caso cotidiano que cualquier jurado entiende.

## Qué se reutiliza
- Custodia con plazo, devolución y estados: `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol` (`pay`, `refund`, `statusOf`, máquina de estados en `src/libraries/PaymentStateLib.sol`). Hay que adaptarlo a varios pagadores y varios destinos.
- Margen de la agencia al final: `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/RevenueSplitter.sol`.
- Chequeo de credenciales: `refs/Kumply/contracts/contracts/AttestationStore.sol` (`verify`; para KYB, `tier == 4` exacto, como en `refs/Kumply/contracts/contracts/examples/KumplyPaymasterCheck.sol`) y SDK `refs/Kumply/packages/sdk/src/client.ts` (`isBusiness`, `isPersonAtLeast`).
- Plan B de tiers en la demo: `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol`.

**Riesgos que ya veo:** la aerolínea real no cobra en ARGt ni tiene KYB (en la demo el "proveedor" es simulado; en la realidad habría que usar un agregador o pagar en pesos fuera de la cadena); parecido a la semilla 7 (seña retenida), aunque acá hay muchos pagadores y muchos destinos; existe un registro de agencias y un fondo de turismo estudiantil por ley [SIN VERIFICAR]; KYB real en Fuji todavía no está confirmado.

## Ataque
*(Abogado del diablo 1, ronda 1)*
- **¿Base de datos común?** En parte. Un fideicomiso o una cuenta de garantía bancaria con pagos directos a proveedores hace lo mismo. Lo que se pierde es el tablero que los padres auditan solos y la regla que la agencia no puede saltar. Ese es el valor real, porque las agencias que quebraron manejaban la caja.
- **¿Ya existe?** La protección legal sí. Desde 2024 el reglamento de turismo estudiantil exige a las agencias un **seguro de caución** que cubra el reembolso de las cuotas, contratado antes del primer pago. Ese seguro reemplazó a la "cuota cero" del Fondo de Turismo Estudiantil ([Río Negro, 7/8/2024](https://www.rionegro.com.ar/voy-turismo/el-gobierno-aprobo-el-reglamento-de-turismo-estudiantil-y-elimino-la-cuota-cero-3731486/?amp=1)). El jurado va a preguntar "¿y el seguro?". La respuesta es Felgueres (tenía caución y dejó 1.967 afectados), pero eso era turismo general. Competidor privado tipo "escrow de viajes" en LATAM: no encontré [SIN VERIFICAR].
- **¿Claudia usaría una billetera cripto?** Una delegada quizás sí. Las otras 31 familias, que pagan en efectivo o por transferencia, probablemente no: comprar ARGt (por ejemplo, en Belo) suma un paso. Lo que las frena es tener que hacer ese paso 14 veces por familia.
- **¿Fuji en 12 h?** Sí: contrato con varios pagadores, presupuesto por proveedor y devolución con fecha límite, más el tablero. Lo riesgoso es el **realismo**: la aerolínea y el hotel no tienen KYB ni cobran en ARGt (lo admite la idea), así que el corazón de la demo ("solo paga a proveedores verificados") es simulado. Además, KYB real todavía no existe en Fuji (`refs/Kumply/LITEPAPER.md` l. 225).
- **¿ARGt y KUMPLY esenciales?** KUMPLY sí: el KYB del proveedor es la regla clave. ARGt encaja bien (cuotas en pesos para un gasto en pesos), pero se cae cuando el proveedor real no lo acepta.

## Usuario
Soy Claudia, delegada de 32 familias en Bahía Blanca. Ver "hotel pagado ✓" en una pantalla me sacaría el 80 % de los mensajes del grupo: sí, lo usaría, y lo pediría en la reunión con la agencia.
No entiendo por qué cada familia tiene que comprar "pesos digitales" 14 veces en vez de transferir como siempre, ni quién me garantiza que el "hotel verificado" es el hotel de Bariloche de verdad.
Pagaría unos $10.000 por familia por todo el viaje si lo exige el colegio; si lo paga la agencia, mejor.
Me da miedo ser yo la que tiene que explicarle a 31 familias cómo se hace, y que si sale mal me echen la culpa a mí.
