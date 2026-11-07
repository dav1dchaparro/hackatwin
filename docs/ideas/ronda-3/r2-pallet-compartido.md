# Pallet compartido – Ronda 3 (plan de construcción)

## Resumen
1. Almaceneros del barrio juntan ARGt en un contrato para comprar a precio de pallet. Si se llega al mínimo, el mayorista (KYB) cobra el 50 % al toque. El otro 50 % de cada almacén se libera con su "recibí" y se reparte en el momento entre el mayorista y el repartidor.
2. **Usuarios:** Rubén, almacenero en Morón, en un grupo de WhatsApp de 8 almacenes donde nadie quiere juntar la plata. Sonia, almacenera en Quilmes, quiere plazo con un mayorista nuevo que no la conoce.
3. **Arreglo obligatorio, hecho (copiado de seña):** reclamo dentro del plazo del "recibí". Si no hay reclamo, el silencio libera la plata al mayorista. Si hay reclamo, decide un árbitro KYB, y si el árbitro no decide a tiempo la mitad vuelve al almacén. Los plazos se cargan en segundos al publicar: en la demo son 3-5 min.
4. **Legajo:** compras cerradas, entregas sin reclamo, "reclamo resuelto en N días" (no queda como marca para siempre) y mayoristas KYB distintos. Solo cuenta un mayorista con `tier == 4` vigente en el momento del "recibí". Dato que lo justifica: récord de 119.285 cheques rechazados en dic. 2025 ([iProfesional](https://www.iprofesional.com/economia/447284-la-increible-cantidad-de-cheques-que-se-rechazaron-diciembre-2025)).
5. **Momento wow:** la barra muestra "52 de 60". Entra Rubén con 8 cajas, la barra se pone verde y el mayorista recibe el 50 %. La barra queda mitad sólida (cobrado) y mitad rayada (retenido). Rubén aprieta "recibí" y el rayado se parte en vivo entre el mayorista y el repartidor. Después, en el mostrador de Sonia, un QR muestra "14 pallets · 0 reclamos · 3 mayoristas verificados". Una compra a un mayorista con el KYB vencido aparece en gris: "no cuenta".

## Qué se despliega en Fuji (C-Chain, 43113)
- **`tARGt`**: ERC-20 de prueba con mint abierto y botón de "cargar pesos de prueba". No hay ARGt oficial en Fuji.
- **`PalletCompartido.sol`**: un solo contrato con muchas ofertas (`mapping id => Oferta`).
  - Funciones: `publicar` (solo KYB), `comprometer` (KYC 2-3 o KYB; al llegar al mínimo cierra y paga el 50 % en la misma tx), `devolver` (si no se llegó al mínimo), `recibi`, `reclamar`, `decidir` (árbitro KYB), `liberarPorPlazo` y la vista `legajo(addr)`.
  - El reparto mayorista/repartidor/plataforma va adentro, con un `_split` copiado. No usamos `RevenueSplitter` aparte (`release()` lo llama cualquiera y no le avisa al contrato).
  - Los niveles se leen con `verify()` y nivel exacto, no con `attestations()`, porque `attestations()` no mira el vencimiento.
  - Lee de **dos stores**: primero el oficial de KUMPLY (`0xa3Bc5564…22dD`) y después el nuestro. La UI marca cuál respondió ("KUMPLY real" o "demo").
- **Plan B:** una copia de `AttestationStore.sol` con el equipo como verificador. Se despliega con `eercToken = address(0)`, que el constructor admite.

## Qué se reutiliza (como guía, se reescribe) y qué se hace de cero
Las rutas son relativas a `/home/juan-chaparro/hackatwin-noche/ideas/refs/`. Las revisé con `ls` y `sed`.

| pieza | guía real | de cero |
|---|---|---|
| Estados y pull-payments | `hackatwin-x402-team1-avalanche/packages/contracts/src/PaymentHub.sol` (`pay` l. 109, `refund` l. 158, `settle` l. 171, `withdraw` l. 193, `_transition` l. 211) y `src/libraries/PaymentStateLib.sol` | Umbral grupal, 50/50 por almacén, reclamo, árbitro y legajo |
| Reparto | `.../src/RevenueSplitter.sol` `_split` l. 56 | 3 vías dentro de `PalletCompartido` |
| Token y deploy | `.../test/utils/MockERC20.sol`, `.../script/DeployFuji.s.sol`, `packages/chains/registry/fuji.json` | Script de deploy y de sembrado |
| KUMPLY | `Kumply/contracts/contracts/AttestationStore.sol` (`verify` l. 224, `issueAttestation` l. 197); `Kumply/contracts/scripts/issue-attestation-batch.ts`; `Kumply/packages/sdk/src/client.ts` (`isPersonAtLeast` l. 222, `isBusiness` l. 236); `src/constants.ts` l. 70-71; ABI en `src/contracts.ts` | Lectura de dos stores con su sello |
| UI | `hackatwin-x402-team1-avalanche/packages/ui/src/atoms/TxLink.tsx`, `Badge.tsx` | Barra sólido/rayado/ámbar, panel del almacén, panel del mayorista, página del legajo con QR |

## Quién hace qué (4 personas, ~11 h de trabajo)
- **P1, Solidity (9 h):** `PalletCompartido` y tests Foundry de los 5 caminos: no se llega, recibí, silencio, reclamo con fallo y árbitro que no decide (6 h). Deploy en Fuji y verificación en Snowtrace (1 h). Ajustes (2 h). A las 14:00 tiene que estar desplegado el camino feliz.
- **P2, KUMPLY y datos (8 h):**
  - A las 9:00 hace las 3 preguntas a los mentores.
  - Saca el KYC 2 real de Rubén (1 h).
  - Despliega nuestro store y emite los niveles: 3 mayoristas KYB, 1 KYB con vencimiento corto, árbitro KYB, 8 almaceneros KYC 2 y Sonia (1,5 h).
  - Arma unas 15 billeteras y les reparte AVAX desde una sola (1 h).
  - Escribe el script que siembra 52/60 y los 14 pallets de Sonia (3 h).
  - Ensaya la demo (1,5 h).
- **P3, Front (9 h):** Vite + viem con la conexión de billetera (1 h), la oferta y su barra (3 h), las acciones del almacén (2 h), el panel del mayorista con el saldo y el reparto en vivo por eventos (2 h) y los sellos "KUMPLY real/demo" (1 h). Si `@kumply/sdk` no está en npm [SIN VERIFICAR], lee `verify` directo con el ABI.
- **P4, Legajo y pitch (8 h):** página `/legajo/:addr` con QR y tarjetas gris/verde (3 h), vista del árbitro (1 h), pitch con slides y competencia (Nilus, ML Negocios, FCE, eCheq SGR) (2 h), y a las 18:00 graba en video la corrida completa en Fuji (1 h). Reserva de 1 h.

## Plan B (de mayor a menor riesgo)
1. **Si KUMPLY no emite el nivel 4 en su store:** los mayoristas y el árbitro salen de nuestra copia de `AttestationStore`. La UI muestra "demo" y en el pitch se dice: "el día que KUMPLY habilite KYB, se cambia una dirección". Rubén mantiene su sello "KUMPLY real" si sacó el KYC 2. Si no, todo sale de nuestro store y se dice así.
2. **Si a las 15:00 no anda el reclamo:** la demo muestra solo el camino feliz y el reclamo se explica con una slide y los tests en verde.
3. **Si se cae Fuji o el RPC:** se pasa el video de las 18:00 y la misma demo en anvil local con los mismos contratos.
4. **Riesgo que se dice de frente:** el mayorista cobra el 50 % antes de entregar. El anticipo es configurable por oferta (`anticipoBps`) y su KYB vigente es lo que pone en juego.

## Preguntas sí/no para la mañana
1. ¿KUMPLY nos emite a mano el nivel 4 (y el 2) en su `AttestationStore` de Fuji para nuestras billeteras antes de las 12:00?
2. ¿Un integrante puede sacar el KYC nivel 2 real de KUMPLY en Fuji (Sumsub) en menos de 30 minutos?
3. Si la 1 es "no", ¿el jurado de KUMPLY acepta una copia propia de `AttestationStore` como verificador de demo sin restar puntaje?

[SIN VERIFICAR]
- Que `@kumply/sdk` esté publicado en npm.
- Qué tan rápido es el KYC con Sumsub en Fuji.
- Que el jurado acepte un store propio.
- Los límites del faucet de AVAX.
- Los porcentajes de comisión.

## Ataque final
*(Abogado del diablo 1, ronda 3)*
- **¿Base de datos común?** La compra en grupo, sí: un link de pago con devolución si no se llega al mínimo. Lo que se pierde es la mitad retenida sin custodio y un legajo que no edita quien lo lleva. Pero el mayorista cobra el 50 % antes de despachar, así que la confianza sigue a medias.
- **¿Ya existe?** Sí, varias cosas parecidas:
  - Nilus hace compras grupales a precio mayorista en el AMBA ([Río Negro](https://www.rionegro.com.ar/sociedad/como-una-empresa-aplica-tecnologia-para-evitar-el-sobreprecio-de-los-alimentos-en-barrios-mas-pobres-3170800/)).
  - Mercado Libre Negocios da precio mayorista y financiamiento a quien tenga CUIT ([Cronista, 3/9/2025](https://www.cronista.com/negocios/mercado-libre-avanza-entra-al-mercado-mayorista-el-negocio-mas-grande-que-le-faltaba-conquistar)).
  - Comprando En Grupo junta pedidos de comercios en Córdoba ([InfoNegocios](https://infonegocios.info/nota-principal/comprando-en-grupo-se-expande-desembarca-en-mexico-y-suma-nuevos-verticales)).
  - La central de compras web de cooperativas de FACC ([CICOPA, 2016](https://www.cicopa.coop/work-together-archive/consumer-and-worker-cooperatives-in-argentina-are-working-together-in-a-web-based-central-purchasing-body/)).
  - Los almaceneros de FABA ya se coordinan por WhatsApp ([Cronista](https://www.cronista.com/economia-politica/quieren-vender-bajen-los-precios-el-grupo-de-whatsapp-que-hace-temblar-a-las-grandes-marcas)).
  
  No encontré ninguna con fondos retenidos.
- **¿Billetera cripto?** Rubén no tiene capital de sobra (DOLORES #11) y tendría que inmovilizarlo hasta el mínimo y el "recibí". El mayorista tiene que aceptar ARGt, tener KYB y facturar igual [SIN VERIFICAR: cómo factura un cobro en ARGt].
- **¿Fuji en 12 h?** Es más grande que Seña Segura: 8 funciones, 5 caminos, un reparto de 3 vías, la lectura de 2 stores y un legajo. Hay que sembrar 14 pallets con plazos de minutos en ~15 billeteras, en 3 h. Lo más riesgoso es el KYB 4 real: no existe hoy. El LITEPAPER (l. 225) lo deja atado a un "pending Enterprise quote" de Sumsub, y el KYC "real on-chain" es un hito M2 a futuro.
- **¿ARGt y KUMPLY?** ARGt encaja (pago un sábado en pesos; en Fuji es un token propio). KUMPLY es el centro del legajo (`tier == 4`), pero justo ese nivel es el que no emite hoy. El KYC 2 del almacenero sigue pegado: quien pone plata no infla el mínimo.
- **Debilidad más grave:** el wow ("3 mayoristas verificados") depende de un KYB que KUMPLY no emite hoy y saldría del store propio. Encima, el mayorista cobra el 50 % antes de entregar.
