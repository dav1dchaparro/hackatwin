# s1 – Alquiler verificado
**Frase:** el inquilino paga el alquiler en pesos digitales (ARGt) a un dueño que solo acepta billeteras verificadas, y cada pago deja un recibo on-chain.

*(Semilla 1 de TORNEO_IDEAS.md. Rutas relativas a `ideas/`.)*

## Problema
El alquiler se paga por transferencia o en efectivo y el recibo depende de la buena voluntad del dueño. Sin recibo, el inquilino no puede demostrar que pagó ni armar historial; el dueño no sabe a quién le alquila.

## Usuario concreto
**Lucía, 29, enfermera, alquila un 2 ambientes en Caballito.** Su contrato ajusta cada 3 meses por IPC. Paga por transferencia y el dueño le manda "el recibo" por WhatsApp cuando se acuerda. Quiere mudarse y la nueva inmobiliaria le pide comprobantes de pago puntual.

## Evidencia
- El 78 % de los inquilinos ajusta cada 3 o 4 meses; el alquiler se lleva el 40 % del salario (mediana); el 38 % está atrasado; el 5,8 % alquila sin contrato escrito. Encuesta a 808 hogares, jun. 2026 ([Inquilinos Agrupados, PDF](https://inquilinosagrupados.com.ar/wp-content/uploads/2026/07/inquilinos_agrupados_encuesta_junio2026-1.pdf), vía DOLORES.md #7).
- El 13,5 % de los reportes a la UFECI en 2024 fue usurpación de identidad ([Chequeado, 4/7/2025](https://chequeado.com/nota/las-denuncias-de-estafas-virtuales-aumentaron-un-21-en-2024-cuales-son-los-tipos-de-fraude-mas-comunes), DOLORES.md #5).
- Que los inquilinos no reciban recibo o no puedan probar pagos: [SIN VERIFICAR], no hay dato en DOLORES.md.

## Solución (3 frases)
El dueño publica su contrato de cobro y fija que solo acepta pagos de billeteras con KYC (KUMPLY `isPersonAtLeast`). Lucía paga el mes en ARGt (en Fuji, token de prueba) y el contrato rechaza a cualquier pagador no verificado. Cada pago emite un evento que funciona como recibo público (fecha, monto, período), sin datos personales.

## Momento wow (30 s)
Una billetera sin KYC intenta pagar y el contrato la rechaza; Lucía (verificada) paga y aparece al instante su "historial de pagos" con 6 recibos en el explorador de Fuji.

## Quién paga
[SIN VERIFICAR] Comisión chica por cobro al dueño o a la administradora; o la inmobiliaria/garantía que consulta el historial.

## Sponsor que la amaría
- **Twin:** ARGt como medio de pago real en pesos, mensual y recurrente (SPONSORS.md #1). Ojo CNV: nada de rendimientos.
- **KUMPLY:** gate de persona en un contrato on-chain, no solo en el front (SPONSORS.md #7).

## Qué se reutiliza del repo de referencia
- `refs/Kumply/packages/sdk/src/client.ts` – `isPersonAtLeast` (línea 222) y `verify` (línea 121) para el front.
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` – patrón `_requireVerified` (línea 85) para exigir KYC dentro del contrato de cobro.
- `refs/Kumply/packages/sdk/src/constants.ts` – direcciones de Fuji (`attestationStore`, `complianceGate`).
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol` – token propio como ARGt de prueba.
- `refs/hackatwin-x402-team1-avalanche/packages/ui/src/atoms/TxLink.tsx` – link a la transacción/recibo.
- A construir: contrato de cobro de alquiler con recibos.

## Ataque
*(Abogado del diablo 2, ronda 1)*
- **¿Base de datos común?** Sí, casi todo. Una transferencia bancaria ya deja un comprobante con CBU/CUIT de las dos partes, y los bancos ya hicieron el KYC, que vale tanto como el de KUMPLY. Lo que se pierde es poco: un recibo público que no depende del dueño. El comprobante de transferencia ya tampoco depende de él.
- **¿Ya existe?** Alquilando junta corredores, aseguradoras y bancos y planeaba cobrar la renta online ([Cronista](https://www.cronista.com/infotechnology/entreprenerds/hackeando-a-las-inmobiliarias-con-esta-app-podes-alquilar-sin-hacer-tramites-insoportables)). La nota es de alrededor de 2017 y no sé si hoy sigue operando [SIN VERIFICAR]. Hoggax ya evalúa al inquilino ([iProUP](https://www.iproup.com/startups/24703-garantia-de-alquiler-digital-como-funciona-hoggax)).
- **¿Billetera cripto?** El dueño tiene que aceptar ARGt y pasarlo a pesos, sin ganar nada a cambio. Lucía tiene que hacer KYC y comprar ARGt todos los meses. No se ve el incentivo de ninguno de los dos.
- **¿Fuji en 12 h?** Sí, es trivial. Lo riesgoso es el wow: "una billetera sin KYC no puede pagar el alquiler" no le resuelve nada a nadie. Ojo: `_requireVerified` exige `tier >= 2` (`ComplianceGate.sol`, línea 97), así que también pasan empresas (4) y agentes (5).
- **¿ARGt y KUMPLY?** Los dos están pegados. El dueño ya conoce al inquilino porque firmó un contrato con su DNI, y quién paga no es el riesgo. ARGt es solo el medio de pago.
- **Debilidad más grave:** no agrega nada sobre un comprobante de transferencia. Conviene fusionarla con g1-recibo-sin-patron, que usa el historial para alquilar.

## Usuario
Soy Lucía, enfermera, alquilo en Caballito. Lo usaría solo si el dueño lo pide, y no lo va a pedir: él quiere la transferencia a su cuenta.
No entiendo para qué sirve esto si ya tengo el comprobante del banco de cada mes, ni por qué tengo que hacer un KYC para pagar un alquiler que ya firmé con DNI.
No pagaría nada; como mucho, que la comisión la pague el dueño.
Me da miedo comprar "pesos digitales" todos los meses, que el día 10 falle algo y me cobren punitorios.
