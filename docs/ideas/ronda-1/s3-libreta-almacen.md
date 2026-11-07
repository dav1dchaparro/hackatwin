# s3 – Libreta del almacén
**Frase:** el "fiado" del barrio digitalizado: cliente verificado, deuda y pagos en ARGt registrados on-chain.

*(Semilla 3 de TORNEO_IDEAS.md. Rutas relativas a `ideas/`.)*

## Problema
El fiado vuelve con la inflación, pero se anota en una libreta de papel: se pierde, se discute ("yo no llevé eso") y el almacenero no sabe cuánto le deben ni a quién. Mientras tanto se queda sin plata para reponer.

## Usuario concreto
**Marta, 58, almacenera en Lanús.** Tiene 30 clientes con fiado en una libreta. Doña Rosa dice que ya pagó la semana pasada; Marta no lo tiene anotado. El lunes tiene que pagarle al mayorista y no le cierra la caja.

## Evidencia
- Con inflación cerca del 2 % "vuelve a ganar protagonismo" el fiado para "completar las compras antes de cobrar"; el almacenero necesita recuperar esa plata para reponer y pagar a proveedores (Fernando Savore, Federación de Almaceneros) ([Noticias NQN, 25/10/2026](https://www.noticiasnqn.com.ar/noticias/2026/10/25/358053-la-inflacion-sigue-cerca-del-2por_ciento-cae-el-consumo-y-vuelve-el-fiado-en-los-comercios-de-barrio), DOLORES.md #11).
- IPC de septiembre de 2026: 1,9 % mensual, 33,4 % interanual ([Canal 26, 13/10/2026](https://www.canal26.com/economia/2026/10/13/la-inflacion-de-septiembre-fue-de-19-y-acumula-un-alza-de-236-en-lo-que-va-del-2026/), DOLORES.md #10).
- Mora de familias con billeteras: 29,6 % en mayo de 2026 ([Sitio Andino, 28/7/2026](https://www.sitioandino.com.ar/economia/la-mora-bancos-y-billeteras-familias-y-personas-alcanza-su-peor-nivel-20-anos-n5727247), DOLORES.md #9).
- Cuántos fían y cuánto no se cobra: [SIN VERIFICAR], no hay cifra nacional.

## Solución (3 frases)
Marta habilita la libreta solo para clientes con KYC (KUMPLY `isPersonAtLeast`). Cada compra fiada queda registrada on-chain como deuda del cliente con el almacén, y el cliente la acepta desde su billetera. Cuando el cliente paga en ARGt (en Fuji, token de prueba), el contrato descuenta la deuda y ambos ven el mismo saldo.

## Momento wow (30 s)
Doña Rosa paga $5.000 en ARGt desde el celular; en la pantalla de Marta su deuda baja de $12.000 a $7.000 en el acto, con la historia completa de compras y pagos que nadie puede borrar.

## Quién paga
[SIN VERIFICAR] Suscripción mensual baja del almacén; o un mayorista/distribuidor que la regala para que sus almacenes cobren mejor.

## Sponsor que la amaría
- **Twin:** ARGt como medio de pago en pesos en el comercio de barrio (SPONSORS.md #1).
- **Belo:** caso cotidiano para comercios (SPONSORS.md #5).
- **KUMPLY:** filtro de persona verificada para dar crédito informal (SPONSORS.md #7).

## Qué se reutiliza del repo de referencia
- `refs/Kumply/packages/sdk/src/client.ts` – `isPersonAtLeast` (línea 222).
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` – patrón `_requireVerified` (línea 85).
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/test/utils/MockERC20.sol` – ARGt de prueba.
- `refs/hackatwin-x402-team1-avalanche/packages/ui/src/atoms/TxLink.tsx` y `Badge.tsx` – mostrar transacciones y estado.
- A construir: contrato de libreta (deudas por cliente, aceptación y pagos).

## Ataque
*(Abogado del diablo 2, ronda 1)*
- **¿Base de datos común?** Sí. El "yo no llevé eso" se resuelve con que el cliente acepte cada compra en una app común, sin cadena. Lo que se pierde es solo que "nadie lo puede borrar", y eso a Marta no le cambia la caja. Cae en la regla de prohibidos: la blockchain se reemplaza por una planilla sin perder nada.
- **¿Ya existe?** Treinta (Colombia) es una libreta digital gratis para tiendas, con fiado, recordatorios de pago y recibos, y dice tener más de 7 M de negocios en LATAM ([App Store](https://apps.apple.com/MX/app/id1644703591), [LatamList](https://latamlist.com/?p=11214)).
- **¿Billetera cripto?** Doña Rosa tendría que hacer KYC 2 (DNI y prueba de vida) para que le fíen el pan, y firmar cada compra desde su billetera. Marta tiene 58 años. Es el usuario menos cripto posible y la fricción más alta, en cada venta.
- **¿Fuji en 12 h?** Sí, técnicamente es fácil. Lo riesgoso es la demo: dos firmas por cada compra fiada se ven lentas. Además, `_requireVerified` con nivel 2 también deja pasar empresas y agentes (`ComplianceGate.sol`, línea 97).
- **¿ARGt y KUMPLY?** KUMPLY está pegado: Marta conoce a sus clientes, y el KYC no la ayuda a cobrar. ARGt sirve para el pago, pero no es lo que resuelve el problema.
- **Debilidad más grave:** Treinta ya lo hace gratis y sin cripto. g2-legajo-buen-pagador es la versión que sí aprovecha la cadena.

## Usuario
Soy Marta, almacenera en Lanús. Me sirve tener el fiado en el celular para que Doña Rosa no me discuta, pero eso ya me lo hace cualquier app de libreta.
No entiendo por qué mis clientes de 20 años tienen que mostrar el DNI y sacarse una selfie para que les fíe el pan, ni qué es una billetera.
Pagaría $3.000-5.000 por mes como mucho, y solo si mis clientes la usan sin que yo les explique.
Me da miedo ofender a la clientela pidiéndoles "verificarse", y que si se me rompe el celular pierda todo lo que me deben.
