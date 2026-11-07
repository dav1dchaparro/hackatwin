# Pallet compartido

**Almaceneros del mismo barrio juntan ARGt para comprar al precio de volumen. Si llegan al mínimo, el mayorista cobra solo. Si no llegan, cada uno recupera su plata.**

## Problema
El almacén chico compra por caja y paga más caro que el súper, que compra por pallet. Juntarse para comprar en volumen funciona, pero alguien tiene que juntar la plata de todos. Eso exige confiar en un vecino o armar una estructura con costos fijos (galpón, administración).

## Usuario concreto
**Rubén, almacenero en Morón.** Está en un grupo de WhatsApp con otros 8 almaceneros. Un mayorista les ofrece aceite a precio de pallet si piden 60 cajas antes del jueves. Rubén necesita 6 y nadie quiere ser el que junta la plata.

## Evidencia
- Los almaceneros ya se organizan en grupos de WhatsApp para enfrentar a las marcas. Antes compraban en conjunto con una ACE y un consorcio cooperativo en Morón, que conseguía precios "hasta 17 puntos" por debajo de los mayoristas. Pero los costos operativos se comían el 7-8 % del margen y solo sobrevivieron los más grandes ([Cronista, 3/8/2025](https://www.cronista.com/economia-politica/quieren-vender-bajen-los-precios-el-grupo-de-whatsapp-que-hace-temblar-a-las-grandes-marcas)).
- Las compras comunitarias cuestan entre 10 % y 25 % menos por unidad que el súper (Canal 26, 1/9/2025, citado por el buscador: [SIN VERIFICAR] textual).
- Cae el consumo y vuelve el fiado. El almacén necesita capital para reponer (Federación de Almaceneros, [Noticias NQN, 25/10/2026](https://www.noticiasnqn.com.ar/noticias/2026/10/25/358053-la-inflacion-sigue-cerca-del-2por_ciento-cae-el-consumo-y-vuelve-el-fiado-en-los-comercios-de-barrio), DOLORES #11).

## Solución
1. El mayorista (KYB, nivel 4) publica una oferta en un contrato: producto, precio por caja, mínimo de cajas y fecha de cierre.
2. Cada almacenero (KYC 2+ o KYB) compromete ARGt por las cajas que quiere. La plata queda retenida en el contrato, no en manos de un vecino.
3. Si se llega al mínimo antes del cierre, el contrato paga al mayorista (menos la comisión de la plataforma) y emite un pedido por almacén. Si no se llega, cada uno retira lo suyo. Variante: liberar la mitad al cierre y la otra mitad cuando cada almacén confirma la entrega.

## Momento wow (30 s)
Barra "52 de 60 cajas". El jurado ve entrar a un tercer almacén con 8 cajas: la barra llega a 60, se pone verde y el mayorista ve el pago acreditado y la lista de pedidos por almacén. En una segunda oferta que no llegó al mínimo, apretamos "retirar" y vuelve la plata.

## Quién paga
El mayorista, con una comisión por oferta cerrada (ej. 2 %, cobrada con RevenueSplitter). Gana volumen sin riesgo de cobro y sin preventista puerta a puerta. El almacenero no paga nada extra y recibe el precio de pallet. Porcentajes [SIN VERIFICAR].

## Por qué blockchain
Es un "todo o nada" entre desconocidos sin organizador de confianza: nadie custodia la plata, la regla de devolución no depende de la buena voluntad de nadie y el mayorista ve fondos reales antes de despachar. Con una planilla, alguien igual tiene que juntar la plata, que es justo el problema.

**No es "dividir pagos" (saturado):** no se reparte una cuenta. Es un compromiso condicional que se ejecuta solo si se alcanza el mínimo.

## Sponsors
- **Twin:** ARGt como medio de pago del comercio de barrio, en pesos y sin pasar por el dólar.
- **KUMPLY:** dos niveles en el mismo flujo: KYB del mayorista para publicar y KYC 2+ del almacenero para comprometer fondos (evita compromisos falsos que inflen el mínimo).
- **Belo y Digital House:** caso cotidiano, fácil de contar a alguien que no conoce cripto.

## Qué se reutiliza (rutas en refs/)
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol`: `pay` con `deadline`, `refund` después del vencimiento y `withdraw`, que es casi el ciclo comprometer → devolver → retirar.
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/RevenueSplitter.sol` + `script/DeployRevenueSplitter.s.sol` + `script/params/fuji-revenue-splitter.json`: comisión de la plataforma al cerrar.
- `refs/Kumply/contracts/contracts/ComplianceGate.sol` (`_requireVerified`) y `refs/Kumply/packages/sdk/src/client.ts` (`isBusiness`, `isPersonAtLeast`).
- Plan B de identidad: `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol`.
- **A construir:** el contrato `Oferta` (umbral + cierre) y un front con la barra de avance.

## Ataque
*(Abogado del diablo 1, ronda 1)*
- **¿Base de datos común?** Casi. El mayorista puede cobrar con un link de pago y devolver si no se llega al mínimo: es la mecánica de "compra colectiva" de siempre. Lo que se pierde es que la plata no quede en manos del mayorista ni de un vecino. Pero el que despacha es el mayorista, así que igual hay que confiar en él para la entrega. Por eso la variante "mitad contra entrega" es la que le da sentido.
- **¿Ya existe?** La compra agregada de comercios, sí: Comprando En Grupo (Córdoba, desde 2012) junta pedidos de ferreteros en un contenedor y cobra una comisión del 2-10 % ([InfoNegocios, 20/12/2017](https://infonegocios.info/nota-principal/comprando-en-grupo-se-expande-desembarca-en-mexico-y-suma-nuevos-verticales)). Para almacenes ya existió el consorcio y la ACE de Morón (Cronista, en la evidencia), y hay plataformas B2B mayoristas como Compre Ahora ([InfoNegocios](https://infonegocios.info/default/como-funciona-compre-ahora-la-plataforma-mayorista-que-abastece-a-mas-de-50-000-minoristas-en-la-que-podes-buscar-hasta-en-chino)). No encontré una compra conjunta con fondos retenidos para almacenes.
- **¿Rubén usaría una billetera cripto?** Lo dudo. Su capital de trabajo está en pesos en Mercado Pago o en el banco, y le falta capital (DOLORES #11). Inmovilizar plata días esperando que se complete el mínimo, con inflación de ~2 % mensual, le duele. Además, pasar a ARGt y volver es un paso extra.
- **¿Fuji en 12 h?** Sí, es lo más factible de la tanda: umbral, cierre, retiro y comisión con `RevenueSplitter`. Lo riesgoso es poco: el KYB del mayorista (no hay KYB real en Fuji, `refs/Kumply/LITEPAPER.md` l. 225) y que la demo se vea como un "Kickstarter de aceite" ya conocido.
- **¿ARGt y KUMPLY esenciales?** ARGt encaja (pago en pesos entre comercios). KUMPLY está medio pegado: el KYC 2+ del almacenero "para que no infle el mínimo" no tiene mucho sentido, porque quien compromete fondos reales no infla nada. Solo el KYB del mayorista agrega algo.

## Usuario
Soy Rubén, almacenero en Morón. Me gusta que nadie del grupo tenga que juntar la plata: si el aceite sale más barato, lo pruebo con una oferta chica.
No entiendo por qué tengo que pasar mis pesos a "ARGt" y después volver, ni cuánto tarda en volver si no se llega a las 60 cajas.
Que la comisión la pague el mayorista; yo como mucho pagaría la diferencia de precio, no un abono.
Me da miedo dejar la plata trabada tres días con lo justo que tengo, y que el mayorista cobre y después no me traiga las cajas.
