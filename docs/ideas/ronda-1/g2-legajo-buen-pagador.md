# Legajo de buen pagador

**Cada factura que el almacén le paga en ARGt a un mayorista verificado queda como antecedente. Cuando va a un mayorista nuevo, lleva su historial y consigue cuenta corriente desde el primer pedido.**

## Problema
Un mayorista nuevo no le da plazo a un almacén que no conoce: le pide pago contado o "referencias". El historial de buen pagador del almacén está repartido en los cuadernos y sistemas de cada mayorista, que compiten entre sí y no lo comparten. Encima, hoy todos se atrasan y el mayorista desconfía más.

## Usuario concreto
**Sonia, almacenera en Quilmes.** Hace 6 años que le paga a término a dos mayoristas. Quiere sumar un distribuidor de lácteos más barato, pero le exige contado. Sin plazo de 15 días no puede reponer y seguir fiando a sus clientes.

## Evidencia
- El 24 % de las pymes industriales tuvo al menos un vencimiento impago y el 15,3 % se atrasó con proveedores (antes 5,7 %). El 62 % cobra a plazos más largos ([El Economista, 19/8/2026](https://eleconomista.com.ar/economia/alerta-pymes-una-cada-cuatro-atrasa-sus-pagos-problema-duplico-menos-ano-n97516), DOLORES #13).
- La mora de las pymes pasó al 4 % en ene. 2026 (Analytica) y los fabricantes avisan que "sus canales de venta empezaron a postergar pagos" ([Cronista, 12/3/2026](https://www.cronista.com/economia-politica/atrasos-en-la-cadena-de-pagos-cual-es-el-escenario-para-el-comercio-e-industria-y-la-medida-de-alivio)).
- Con el fiado de vuelta, el almacenero necesita recuperar plata para reponer y pagar a proveedores (DOLORES #11).
- Que las centrales de riesgo (BCRA, Veraz, Nosis) no registren la cuenta corriente informal con mayoristas: [SIN VERIFICAR].

## Solución
1. El mayorista (KYB, nivel 4) carga una factura en el contrato: almacén, monto en ARGt y vencimiento.
2. Sonia (KYC 2+ o KYB) la paga por el contrato. Queda registrado si pagó a término o con cuántos días de atraso. No se puede cargar a mano un pago "bueno": el antecedente solo nace de un pago real.
3. Cualquier mayorista consulta el legajo de una billetera: facturas pagas, % a término, atraso promedio y cuántos mayoristas KYB distintos. Con eso decide si le da plazo y cuánto.

## Momento wow (30 s)
Sonia escanea un QR en el mostrador del mayorista nuevo. En pantalla aparece "38 facturas, 37 a término, 3 mayoristas verificados distintos". El mayorista toca "Dar 15 días" y queda creada una factura a plazo. Después se muestra la billetera de un "almacén" recién creado y sin KYC: legajo vacío y solo contado.

## Quién paga
El mayorista, por consulta de legajo o con un abono mensual. Le ahorra incobrables y le permite captar clientes de la competencia con plazo. Para el almacén es gratis: su historial es suyo y lo lleva a donde quiera. Precios [SIN VERIFICAR].

## Por qué blockchain
El historial lo escriben mayoristas competidores que no le confiarían su cartera a otro mayorista ni a una central privada. Nadie lo puede borrar ni inflar, y le pertenece al almacén. El KYB del mayorista impide que el almacén invente un "mayorista amigo" para fabricarse antecedentes. **Riesgo a decir:** los montos on-chain son públicos. Mostrar solo contadores o rangos, y dejar los saldos privados con eERC como "a futuro".

**No es la semilla 3 (libreta del fiado):** aquella es cliente → almacén. Esta es almacén → mayorista, y el valor está en que el historial sirve ante cualquier mayorista.

## Sponsors
- **KUMPLY:** KYB e KYC son el filtro anti-fraude del propio historial, no un adorno. Además es un caso de uso que pueden vender como piloto.
- **Twin:** cada antecedente es un pago real en ARGt. Más uso de ARGt → más historial.
- **BitGo:** auditabilidad y reglas de crédito explícitas.

## Qué se reutiliza (rutas en refs/)
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol`: `pay` / `settle` con `deadline` y eventos por pago, como base de "factura pagada a término / tarde".
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` (`_requireVerified`) y `refs/Kumply/contracts/contracts/AttestationStore.sol` (`verify`).
- `refs/Kumply/packages/sdk/src/client.ts` (`isBusiness`, `isPersonAtLeast`) y `src/constants.ts` (direcciones de Fuji).
- Plan B de identidad: `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol`.
- **A construir:** el contrato `Legajo` (factura, pagar, resumen) y el front con el QR de consulta.

## Ataque
*(Abogado del diablo 2, ronda 1)*
- **¿Base de datos común?** Es lo que hacen los informes comerciales: Nosis vende un puntaje de riesgo por API ([Nosis](https://testwww.nosis.com/en/informes-comerciales/api)). Lo que se pierde: que el historial sea del almacén y que ningún mayorista lo controle. Pero hay una contradicción: la idea dice que los mayoristas "no le confiarían su cartera a otro", y on-chain cada factura muestra en público quién le compra a quién, cuánto y cuándo. Es regalarle la cartera a la competencia. eERC está en "Phase 2" y no está implementado (CONTEXTO).
- **¿Ya existe?** Tienda Pago presta capital de trabajo a bodegas junto con distribuidores en México y Perú ([Descubre](https://www.descubre.vc/tienda-pago)). Treinta da 15 días de plazo a tiendas en su marketplace ([LatamList](https://latamlist.com/?p=11214)).
- **¿Billetera cripto?** Sonia tiene que hacer KYC 2, conseguir ARGt y pagar por el contrato. Hoy le paga a los mayoristas en efectivo o por transferencia. Que lo cambie solo para armar historial es un salto grande.
- **¿Fuji en 12 h?** Sí, el contrato es simple. Lo más riesgoso: varias billeteras KYB reales en Fuji (3 mayoristas). Las "38 facturas" se cargan como datos de prueba, y el plan B `WorkshopKYA` tiene otra interfaz (`verify` devuelve `uint32`).
- **¿ARGt y KUMPLY?** KUMPLY es esencial contra el "mayorista amigo", pero KYB solo prueba que es una empresa, no que sea mayorista: una SRL amiga con KYB fabrica el historial igual. ARGt sirve porque el antecedente nace de un pago real en pesos.
- **Debilidad más grave:** publicar las facturas on-chain expone la cartera de cada mayorista, justo lo que la idea dice que no aceptarían.

## Usuario
Soy Sonia, almacenera en Quilmes. La idea de llevar mis 6 años de buena pagadora a un mayorista nuevo me encanta, porque hoy eso vale solo en la libreta de cada uno.
Pero mis mayoristas de siempre cobran en efectivo o transferencia: no entiendo por qué van a cargar facturas en "la cadena", ni cómo cuentan los años que ya pagué antes.
Para mí tiene que ser gratis; que pague el mayorista que consulta.
Me da miedo que cualquiera vea a quién le compro y cuánto, y que un atraso de una semana en enero me arruine el legajo para siempre.
