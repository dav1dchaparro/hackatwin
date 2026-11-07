Origen: g2-compra-conjunta (+ legajo, usuaria Sonia y competidores de g2-legajo-buen-pagador; "Pago al mayorista el sábado" de SPONSORS #1)

# Pallet compartido

**Almaceneros del barrio juntan ARGt para comprar a precio de pallet: el mayorista cobra la mitad al cerrar y la otra mitad cuando cada almacén confirma que le llegó la mercadería. Cada pallet cerrado le suma al almacén un legajo que ningún mayorista puede dibujar.**

## Problema
El almacén chico compra por caja y paga más que el súper, que compra por pallet. Juntarse sirve, pero alguien tiene que juntar la plata de todos y confiar en que el mayorista entregue. Y aunque compre hace años, el almacén no tiene cómo mostrarle a un mayorista nuevo que es un cliente serio: le piden contado.

## Usuario concreto
**Rubén, almacenero en Morón**, en un grupo de WhatsApp con 8 almaceneros. Un mayorista ofrece aceite a precio de pallet si piden 60 cajas antes del jueves; nadie quiere ser el que junta la plata. **Sonia, almacenera en Quilmes**, 6 años comprando sin fallar, quiere plazo con un mayorista nuevo que no la conoce.

## Evidencia
- Los almaceneros ya se organizan por WhatsApp. El consorcio de Morón conseguía precios "hasta 17 puntos" por debajo de los mayoristas, pero los costos operativos se comían el 7-8 % del margen ([Cronista, 3/8/2025](https://www.cronista.com/economia-politica/quieren-vender-bajen-los-precios-el-grupo-de-whatsapp-que-hace-temblar-a-las-grandes-marcas)).
- Vuelve el fiado y el almacén necesita capital para reponer (Federación de Almaceneros, [Noticias NQN, 25/10/2026](https://www.noticiasnqn.com.ar/noticias/2026/10/25/358053-la-inflacion-sigue-cerca-del-2por_ciento-cae-el-consumo-y-vuelve-el-fiado-en-los-comercios-de-barrio)).
- Inflación 1,9 % mensual (DOLORES #10): 2 días de plata retenida cuestan ~0,13 %, contra un ahorro de hasta 17 puntos (cuenta nuestra con esos dos datos).

## Solución
1. El mayorista (KYB nivel 4) publica la oferta: producto, precio por caja, mínimo y cierre (máx. 48 h). Cada almacén (KYC 2+ o KYB) compromete ARGt por sus cajas; la plata queda en el contrato, no en manos de un vecino.
2. Si se llega al mínimo, el mayorista cobra **50 % al instante** (aunque sea sábado a la noche). El otro 50 % de cada almacén se libera cuando ese almacén aprieta "recibí", y se reparte solo entre mayorista y repartidor. Si reclama, su mitad queda congelada; si no se llega al mínimo, cada uno recupera todo al cierre.
3. Cada entrega confirmada suma al **legajo** del almacén: compras cerradas, entregas sin reclamo y **cuántos mayoristas KYB distintos**. Solo cuentan pagos a billeteras `tier == 4`: un "mayorista amigo" sin KYB no suma. Sonia muestra un QR y el mayorista nuevo lee su historial sin pedirle papeles.

## Momento wow (30 s)
Barra "52 de 60 cajas". Entra Rubén con 8: la barra se pone verde y el mayorista ve acreditado el 50 %. Rubén aprieta "recibí": el resto se parte en vivo entre mayorista y repartidor. Corte al mostrador de Sonia: QR → "14 pallets, 0 reclamos, 3 mayoristas verificados". Una compra a un mayorista sin KYB aparece gris: "no cuenta".

## Quién paga
El mayorista: comisión por oferta cerrada (ej. 2 %) a cambio de volumen cobrado, sin riesgo y sin preventista. El almacenero no paga extra. A futuro: plazo para almacenes con legajo, financiado por el mayorista. Porcentajes [SIN VERIFICAR].

## Por qué blockchain
Es un "todo o nada" entre desconocidos sin organizador de confianza, y la mitad contra entrega no depende de la buena voluntad del mayorista. El legajo lo pueden leer mayoristas que no comparten sistema y nadie lo puede editar: en una planilla, el que la lleva escribe lo que quiere.

## Sponsors
- **Twin:** es su idea "pago al mayorista el sábado" con el reparto al repartidor, dentro de una compra de barrio en pesos.
- **KUMPLY:** tres usos en un flujo: KYB para publicar, KYC 2+ del almacén (el legajo es de una persona o comercio verificado, no de billeteras nuevas) y conteo de mayoristas KYB distintos.
- **Belo y Digital House:** caso cotidiano que se entiende sin saber de cripto.

## Competencia (a nombrar antes que el jurado)
Comprando En Grupo (Córdoba, 2-10 % de comisión, [InfoNegocios](https://infonegocios.info/nota-principal/comprando-en-grupo-se-expande-desembarca-en-mexico-y-suma-nuevos-verticales)), Compre Ahora (plataforma mayorista), Tienda Pago (MX/PE) y Treinta (plazo a tiendas). Diferencia: plata retenida con mitad contra entrega y un legajo que sirve con cualquier mayorista, no solo con el que lo emitió. Que ninguno haga esto: [SIN VERIFICAR].

## Qué se reutiliza (verificado en refs/)
- `refs/hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol` (`pay` con `deadline`, `settle`, `refund`, `withdraw`) + `src/libraries/PaymentStateLib.sol`: ciclo comprometer → cerrar → devolver.
- `.../src/RevenueSplitter.sol` **tal cual** (`_seller` = mayorista, `_platform` = repartidor, `release()`) + `script/DeployRevenueSplitter.s.sol` + `script/params/fuji-revenue-splitter.json`. Es de 2 vías: la comisión de la plataforma va dentro de `Oferta`.
- `refs/Kumply/contracts/contracts/AttestationStore.sol` `verify()` (l. 224) para `tier == 4` y nivel 2+ en contrato (no heredar `ComplianceGate.sol`, que usa `>=`, l. 97). Front: `refs/Kumply/packages/sdk/src/client.ts` `isBusiness` (l. 236) e `isPersonAtLeast` (l. 222); `src/constants.ts` (l. 70-71).
- `refs/hackatwin-x402-team1-avalanche/packages/ui/src/atoms/TxLink.tsx` y `Badge.tsx`: comprobante y sello en el legajo.
- Plan B: `refs/Kumply/contracts/contracts/workshop/WorkshopKYA.sol` (cualquiera emite tiers; `verify` devuelve `uint32`).
- **A construir:** contrato `Oferta` (umbral, cierre, 50/50, reclamo), contadores del legajo, front con barra y página QR del legajo.

## Riesgos que se dicen de frente
- El legajo dice "compra seguido y no reclama", no "paga a término": hoy todo es contado. "A término" llega cuando un mayorista le dé plazo en el mismo contrato (a futuro).
- Se ve on-chain a qué mayorista le compra cada almacén. En el pallet ya es público por diseño y el legajo es opcional.
- Pasar pesos a ARGt y volver: vía Belo [SIN VERIFICAR: rampa para comercios]. Sin KYB real en Fuji (`refs/Kumply/LITEPAPER.md` l. 225).

## Cambios vs ronda 1
- La mitad contra entrega pasa de variante a regla, con reclamo que congela; responde al miedo de Rubén.
- Injerto del rescate: legajo con conteo de mayoristas KYB distintos, wow del QR y usuaria Sonia. El KYC del almacén deja de estar pegado.
- Reparto mayorista/repartidor con `RevenueSplitter` (la idea de Twin); cierre máx. 48 h y cuenta inflación vs. ahorro.
- Competidores nombrados (Comprando En Grupo, Compre Ahora, Tienda Pago, Treinta) y rutas con líneas verificadas.

## Ataque
*(Abogado del diablo 2, ronda 2)*
- **¿Base de datos común?** La compra en grupo, sí: un link de pago y una devolución. Lo que se pierde es la mitad que queda retenida y un legajo que no edita quien lo lleva. Pero el mayorista ya cobró el 50 % antes de despachar. Si no entrega, el almacén pierde esa mitad y solo puede congelar la otra.
- **Hueco de diseño:** no hay plazo para el "recibí" ni árbitro. Si el almacén no aprieta nada o reclama, su mitad queda congelada para siempre. El mayorista no tiene salida y el reclamo sirve para presionarlo y sacarle un descuento.
- **¿Ya existe?** Nilus (AR, desde 2018) arma compras grupales a precio mayorista en el AMBA, en MX y en PE ([Río Negro](https://www.rionegro.com.ar/sociedad/como-una-empresa-aplica-tecnologia-para-evitar-el-sobreprecio-de-los-alimentos-en-barrios-mas-pobres-3170800/); fecha [SIN VERIFICAR]). Mercado Libre Negocios da precios mayoristas y "financiamiento interno" a pymes con CUIT ([Cronista, 3/9/2025](https://www.cronista.com/negocios/mercado-libre-avanza-entra-al-mercado-mayorista-el-negocio-mas-grande-que-le-faltaba-conquistar)). Es el competidor directo del "plazo por legajo" que se promete a futuro.
- **¿Billetera cripto?** Rubén tiene la plata en pesos y justa. Pasar a ARGt, dejarla hasta 48 h y volver es la misma fricción que marcó en ronda 1. La rampa de Belo para comercios: [SIN VERIFICAR].
- **¿Fuji en 12 h?** Es la más factible: umbral, cierre, 50/50 y reclamo. Ojo: `RevenueSplitter` tiene `SELLER` y `PLATFORM` `immutable` (l. 18-24) y `release()` reparte todo el saldo. Hace falta un deploy por cada par mayorista-repartidor, o meter el reparto dentro de `Oferta`. Lo más riesgoso: 8+ billeteras con KYC 2 y un KYB real en Fuji. Sin eso, el legajo sale de `WorkshopKYA.sol` y "3 mayoristas verificados" son autoemitidos.
- **¿ARGt y KUMPLY?** ARGt es esencial (pesos el sábado). KUMPLY es esencial en el legajo (cuenta solo los `tier == 4`). Pero un mayorista amigo con KYB real puede inflarlo igual.
- **Debilidad más grave:** "nadie tiene que confiar" es verdad a medias. El mayorista se lleva el 50 % antes de entregar, y la otra mitad puede quedar trabada para siempre sin plazo ni árbitro.

## Usuario
- Soy Rubén, almacenero en Morón. Que nadie del grupo tenga que juntar la plata de los 8 me gusta. Con ese precio de pallet en aceite, la uso.
- No entiendo cómo paso mis pesos a ARGt y cómo vuelven a pesos, ni qué hago si el mayorista cobra la mitad y no me trae nada.
- Yo no pagaría: que la comisión la ponga el mayorista. Si me la cobran a mí, 1 % como mucho.
- Me da miedo tener la plata justa trabada 48 h, que mi mitad quede congelada en una pelea sin nadie que decida, y que el mayorista de siempre vea a quién más le compro.
