Origen: g1-cuotas-egresados (+ injertos de RESCATE r1: s2-changa, s5-colecta, g1-recibo-sin-patron)

# Cuota Blindada: la plata del viaje de egresados nunca está toda en manos de la agencia

**Frase:** las cuotas se juntan en ARGt en un contrato que paga cada hito (hotel, micro, boliches) directo al proveedor verificado y en su fecha. Así la agencia nunca tiene en la mano más que un tramo.

## Problema
Las familias pagan 12 a 14 cuotas y durante más de un año la agencia tiene todo el pozo. Si no reserva o quiebra, los chicos se quedan varados y la plata ya no está. Hoy los padres no pueden ver qué está pago.

## Usuario concreto
**Claudia, delegada de 32 familias de 5.º año en Bahía Blanca.** Viajan a Bariloche y pagan 14 cuotas. En el grupo de WhatsApp le preguntan todas las semanas "¿ya pagaron el hotel?".

## Evidencia
- Egresados de Bariloche varados en Córdoba: la agencia no había pagado boliches ni excursiones y "los vuelos nunca habían sido reservados" ([ANB, 2/1/2026](https://www.anbariloche.com.ar/amp/noticias/2026/01/02/101650-egresados-barilochenses-fueron-estafados-en-su-viaje-a-brasil-y-terminaron-varados-en-cordoba)).
- Desde 2024 la ley exige un **seguro de caución** que cubra el reembolso ([Río Negro, 7/8/2024](https://www.rionegro.com.ar/voy-turismo/el-gobierno-aprobo-el-reglamento-de-turismo-estudiantil-y-elimino-la-cuota-cero-3731486/?amp=1)). Pero Felgueres tenía caución y dejó 1.967 afectados ([El Cronista, 26/4/2023](https://www.cronista.com/negocios/la-estafa-de-turismo-felgueres-los-danos-provocados-por-la-agencia-ascienden-a-us-10-millones-segun-la-justicia)). **El seguro devuelve la plata cuando el viaje ya se cayó. Cuota Blindada busca que el viaje no se caiga.** Que cobrar la caución tarde meses: [SIN VERIFICAR].

## Solución (3 frases)
La agencia (KYB, `tier == 4` exacto) carga los **hitos** (proveedor KYB, monto, fecha: seña del hotel en marzo, micro en agosto, saldo en octubre), y cada familia (KYC 1+) **firma una sola vez** una autorización por el total para que cada cuota se debite sola en ARGt a nombre del alumno. El proveedor confirma la reserva desde su billetera y en ese momento cobra su tramo: la plata va **solo** del contrato a él, sin pasar por la agencia. Si el hito vence sin confirmar, ese tramo vuelve a las familias, y el margen de la agencia se libera recién cuando vuelve el viaje.

## Momento wow (30 s)
Claudia abre el link del tablero, sin billetera ni login: "Hotel ✓ pagado y **confirmado por el hotel** · Micro ✓ · Boliches ⏳ 12/9 · en manos de la agencia: **$0**". En vivo, la agencia intenta pasarse $5 M → **revertido: "destino no es proveedor del viaje"**. Adelantamos el reloj: el hito de los boliches vence sin confirmar → vuelve el tramo y Claudia ve su parte de vuelta.

## Quién paga
La agencia paga una comisión por viaje y la vende como sello ("viaje blindado"). El colegio o los padres pueden exigirlo en el contrato. Ancla: Claudia pagaría ~$10.000 por familia ([SIN VERIFICAR]: es la voz del usuario simulado).

## Sponsor que la amaría
**KUMPLY:** dos categorías en el mismo flujo (KYB para la agencia y los proveedores, KYC para las familias), chequeadas dentro del contrato. Es el "piloto integrador" de su M0. **Twin:** cuotas en pesos para gastos en pesos, debitadas un sábado si hace falta. **Belo:** donde las familias cargan ARGt. **Digital House:** cualquier jurado lo entiende.

## Qué se reutiliza (verificado en `refs/`)
- Débito con una sola firma: `PaymentHub.setAuthorizationWithSig` (l. 83) + `pay(_id, _onBehalf, …)` con presupuesto (l. 109, 123) en `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol`.
- Estados y cobro del proveedor: `_transition` (l. 211) + `PaymentStateLib.canTransition` (`src/libraries/PaymentStateLib.sol`, l. 21); crédito y `withdraw` (l. 193) para que el proveedor retire. **A construir:** varios pagadores, plan de hitos, devolución proporcional y `confirmarReserva`. Ojo: `refund` (l. 158) devuelve a un solo pagador.
- Margen al final: `RevenueSplitter.sol` (`release`, l. 38).
- Credenciales: `refs/Kumply/contracts/contracts/AttestationStore.sol` (`verify`, l. 224). KYB con `tier != requiredTier` como en `examples/KumplyPaymasterCheck.sol` (l. 49). En el front, `isBusiness` / `isPersonAtLeast` (`packages/sdk/src/client.ts`, l. 236 / 222). **No heredar `ComplianceGate.sol`**: `tier < requiredTier` (l. 97) deja pasar a empresas y agentes.
- Plan B: KYB real todavía no existe (Tier-4 pendiente de cotización, `refs/Kumply/LITEPAPER.md` l. 225). La demo usa `contracts/workshop/WorkshopKYA.sol`, y hay que decirlo en el pitch.

**Riesgo principal:** la aerolínea no cobra en ARGt ni tiene KYB. Para ese hito la plata le llega a la agencia **una semana antes de la fecha de compra** y como máximo ese tramo. El contrato no lo protege: limita cuánto puede perderse.

## Cambios vs ronda 1
- La regla pasa a ser "**exposición máxima = un tramo**". Ya no prometemos "solo paga a proveedores verificados" para todo, y le damos una salida honesta a la aerolínea.
- Le responde de frente al seguro de caución: no lo reemplaza, evita llegar a usarlo.
- **Hitos con fecha** (injerto de s2) y **confirmación de la reserva desde la billetera del proveedor**, porque "una etiqueta no es un comprobante" (injerto de s5).
- **Una sola firma para 14 cuotas** (`setAuthorizationWithSig`), y el tablero sale por link público sin billetera. Así le contestamos a Claudia ("¿14 veces?", "no quiero explicarle a 31 familias").
- Gate de personas con `isPersonAtLeast`/`verify`, nunca `ComplianceGate` (injerto de g1-recibo). Rutas y líneas verificadas.

## Ataque
*(Abogado del diablo 1, ronda 2)*
- **Hueco central:** la agencia carga los hitos **y elige quién es proveedor**. Con una empresa propia o amiga con KYB nivel 4, ese "proveedor" confirma la reserva y cobra, y la "exposición máxima = un tramo" se cae. El KYB prueba que es una empresa, no que sea el hotel de Bariloche. Para arreglarlo, Claudia (o el colegio) tiene que aprobar en el contrato cada dirección de proveedor.
- **¿Base de datos común?** Un fideicomiso con pago directo a proveedores ya existió: hasta 2024 la "cuota cero" (6 %) iba a un fideicomiso con Nación Fideicomisos, no a la agencia ([Cronista](https://www.cronista.com/negocios/agencias-cancelan-viajes-de-egresados-como-pedir-el-reintegro-que-es-la-cuota-cero-y-que-condiciones-contempla-la-ley)). Lo que se pierde sin cadena es que las familias auditen solas y que nadie, ni el fiduciario, pueda mover el pozo por fuera de los hitos.
- **¿Ya existe?** Busqué escrow o app de control de cuotas para egresados en AR/LATAM y no encontré [SIN VERIFICAR que no exista]. El competidor real es la caución obligatoria ya citada.
- **¿Billetera cripto?** Una sola firma no alcanza: `pay` hace `safeTransferFrom` desde la familia (`PaymentHub.sol`, l. 123). Eso exige un `approve` aparte y **saldo en ARGt cada mes**. Si no hay saldo, el débito falla. Las 32 familias igual tienen que comprar ARGt 14 veces, y Belo opera "principalmente en Base" (SPONSORS #1). Pasarlo a Avalanche: [SIN VERIFICAR].
- **¿Fuji en 12 h?** Varios pagadores, plan de hitos, devolución proporcional y `confirmarReserva` son código nuevo. En Fuji **no se puede "adelantar el reloj"** como en anvil: los hitos tienen que durar minutos. Si no, el momento del vencimiento no se puede mostrar en vivo.
- **¿ARGt y KUMPLY?** ARGt tiene sentido (cuotas en pesos para gastos en pesos), pero en Avalanche hay ~1,77k ARGt (SPONSORS #1) y ningún hotel cobra así hoy. KUMPLY es esencial en el diseño, pero KYB real no existe (LITEPAPER l. 225): en la demo los proveedores se autoemiten la credencial con `WorkshopKYA`, lo que agrava el hueco central.

## Usuario
- Soy Claudia, delegada de 32 familias en Bahía Blanca. El tablero sin login lo uso ya: lo pego en el grupo y se terminan los "¿ya pagaron el hotel?".
- No entiendo qué es ARGt ni por qué cada familia tiene que comprarlo todos los meses. Si a una mamá le falta saldo y falla el débito, me llaman a mí.
- Pagaría unos $10.000 por familia por todo el viaje, no por mes. Mejor si lo paga la agencia como "sello".
- Me da miedo que la agencia ponga de "proveedor" a un amigo: quiero aprobar yo, o el colegio, cada hotel y cada micro. Y que el tramo del avión igual se pueda perder.
