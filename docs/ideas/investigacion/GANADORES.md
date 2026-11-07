# GANADORES – Ronda 0 (Investigador de ganadores)

Búsqueda: 7/11/2026, madrugada. Todo con fuente. Lo que viene de un medio secundario (no de la página oficial del evento) va marcado "(fuente secundaria)".

**Aviso importante:** no encontré listas públicas de ganadores de los hackathons de Avalanche más parecidos al nuestro: Avalanche Summit LATAM 2024 en Buenos Aires (solo se sabe que hubo 115 hackers, 90 % de LATAM, y 32 proyectos entregados: https://x.com/AvaxDevelopers/status/1848810004167668117), Hack2Build: Payments x402 (nov-dic 2025, US$25k, x402 + ERC-8004; la página dice "ENDED" pero no nombra ganadores: https://build.avax.network/hackathons/5ce3a8c2-21db-40fa-b40f-f82ecdde99db), Build Games 2026, Jungle Hack (Tether WDK + Avalanche, Costa Rica) ni Aleph. **Tampoco encontré una edición anterior de un hackathon de Twin Finance.** Por eso la lista usa ETHGlobal Buenos Aires 2025, Interledger México 2025, ETHGlobal Cannes 2026 (track de Arc), Consensus Miami 2026 y un ganador viejo de Avalanche.

## Proyectos (12)

| # | Proyecto | Qué hacía | Evento y premio | Fuente |
|---|---|---|---|---|
| 1 | **Paybot** | Micropagos con x402 para usar dispositivos físicos (robots, IoT). El usuario firma una autorización y paga en la stablecoin QUSD **sin gas**; el gas lo cubre el proveedor. | ETHGlobal Buenos Aires (21-23/11/2025): top 10 de 475 proyectos. Premio puntual: [SIN VERIFICAR] | https://www.bitrue.com/blog/top-10-winning-projects-of-ethglobal-buenos-aires-hackathon (fuente secundaria); lista: https://www.kucoin.com/news/flash/ethglobal-buenos-aires-hackathon-announces-10-winning-projects-in-nft-defi-and-prediction-markets |
| 2 | **Hubble Trading Arena** | Agentes de IA que operan solos on-chain usando x402 + ERC-8004 (identidad de agentes). | ETHGlobal BA 2025, top 10 | mismas dos fuentes |
| 3 | **Payload Exchange** | El comercio acepta cualquier token vía un agente x402 y recibe estables; suma un "sponsor" que paga parte o todo a cambio de una acción o datos del usuario. | ETHGlobal BA 2025, top 10 | mismas dos fuentes |
| 4 | **zkx402** (ProofofLeak) | x402 + pruebas ZK: probar condiciones de pago o autoría sin revelar identidad (periodistas, denunciantes, agentes que compran datos sensibles). | ETHGlobal BA 2025, top 10 | mismas dos fuentes |
| 5 | **Halo** | Escaneás el ticket de compra del súper y recibís recompensa on-chain; solo personas verificadas con World ID, sin exponer identidad. | ETHGlobal BA 2025, top 10 | mismas dos fuentes |
| 6 | **VibePayments** (Los VibeCoders) | SaaS para pagar nómina, proveedores, propinas y servicios en lote, con división y unión de pagos (Interledger). | Interledger Hackathon, Ciudad de México, 8-9/11/2025: **1.er puesto** (47 equipos) | https://interledger.org/news/building-real-solutions-interledger-hackathon-winners-2025 |
| 7 | **Pagos** (Haki Ando) | Pagar sin celular ni tarjeta: autoriza con cara + voz. Pensado para personas con discapacidad motriz. | Interledger MX 2025: **2.º puesto** | misma |
| 8 | **Paguito** (Máquinas de Boltzmann) | Bot de IA en WhatsApp que detecta en el chat un pedido de transferencia y arranca el pago. | Interledger MX 2025: **premio de la comunidad** | misma |
| 9 | **Onda** | Extensión de Chrome que reconoce la música que suena y le manda US$0,01 en USDC al artista; si el artista no reclamó, queda retenido en un contrato. | ETHGlobal Cannes (2-5/4/2026), track de Arc (US$15k entre 4 tracks) | https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned |
| 10 | **ETHastic** | Pagos que viajan de celular a celular por radio de largo alcance y se liquidan on-chain cuando vuelve la conexión. | ETHGlobal Cannes 2026, track de Arc | misma |
| 11 | **Dairy Price API x402** | API de precios y pronósticos de lácteos que cobra por consulta en USDC vía x402 en Base; los agentes la usan sin API key. | Consensus Miami 2026, hackathon EasyA, track Coinbase/AWS: **1.er puesto** (track de US$45k) | https://www.kucoin.com/news/flash/ai-agents-drive-startup-surge-at-consensus-miami-easya-hackathon (fuente secundaria) |
| 12 | **zk-id** | Identidad con ZK sobre Avalanche: probar que cumplís un requisito (ej. tener un NFT) sin revelar tu dirección. | Avalanche Summit Hackathon (Encode Club), Barcelona, 25-27/3/2022: **US$20.000** (Best dApp Deployed on Subnet) | https://www.chaincatcher.com/en/article/2072056 (fuente secundaria) |

Menciones que pueden servir: **Chainlens** (finalista en Consensus Miami 2026: capa de confianza que solo paga a la API después de verificar la respuesta, misma fuente que #11) y **ValidAR** (identidad blockchain, finalista de Aleph según un resumen de búsqueda de The Defiant; no pude abrir la nota: [SIN VERIFICAR]).

## Patrones

**Tipo de problema**
- Un caso **chico y con nombre propio**, no una plataforma: precios de lácteos (#11), retrasos de vuelos (JetLagged, top 10 en BA), un centavo para el artista que está sonando (#9), el ticket del súper (#5).
- **Fricción de pago para gente no cripto:** sin gas (#1), sin billetera ni celular (#7), dentro de WhatsApp (#8).
- **Confianza o identidad como filtro, sin mostrar datos personales:** World ID (#5), ZK (#4, #12), Self Protocol (PLY, en la galería de BA: https://ethglobal.com/showcase?events=buenosaires).
- **Agentes que pagan solos**, casi siempre con x402 (#1, #2, #3, #11). En el track de Arc de Cannes, "98 % de los proyectos" ponían a los agentes como usuarios financieros principales (fuente #9).

**Cómo era la demo** (inferido de las descripciones; ninguna fuente detalla el pitch: [SIN VERIFICAR])
- Algo **físico o cotidiano** que el jurado ve pasar: un dispositivo que se activa al pagar (#1), una cámara Raspberry Pi que firma fotos (LensMint, top 10 en BA), dos celulares sin señal (#10), una canción que suena (#9).
- Un **flujo completo de punta a punta** en 1-2 minutos: pedido → pago → resultado.
- El pago es **chiquito y concreto** (US$0,01, una consulta), no "mover millones".

**Cómo lo contaban**
- Frase de una línea "X para Y" + el usuario concreto (persona con discapacidad motriz en #7, periodista/denunciante en #4, comerciante en #3).
- Nombran el protocolo del sponsor en la frase (x402, World ID, Interledger, Nanopayments): calce explícito con el track.

## Saturados (no sorprenden más)

1. **"API de datos que cobra por consulta a agentes vía x402"**: ya ganó tal cual (#11). **Ojo: es casi la semilla 6** de TORNEO_IDEAS.md. Para usarla tiene que tener un giro fuerte (KYA esencial, datos que solo existen en Argentina).
2. **Agentes de trading autónomos o "arena de agentes"**: Hubble (#2), banger arena, Galactic Alpha (galería BA).
3. **Mercados de predicción de cualquier cosa**: JetLagged, Scout (BA); Predict It!, PolyPOP (Arc Cannes); Parabola (Consensus Miami).
4. **"Pagá sin gas" / abstracción de gas como idea central**: Paybot (#1), OmniSweep (galería BA). Ya es esperado, no es el wow.
5. **Micropagos a creadores o publishers** (al artista, por página leída): Onda (#9), NanoCrawl (Arc Cannes).
6. **Pagos por chat o bot de WhatsApp/Telegram**: Paguito (#8), Rootstock Mini App (galería BA).
7. **Dividir pagos / nómina / alquiler compartido**: VibePayments (#6), RenSplit (galería BA, x402).
8. **Liquidez cross-chain, swaps, DEX**: Aqua0, LOCUSt, Yoga (BA).
9. **Billetera multichain / terminal de cobro NFC genérica**: Multi wallet, AnyPay (galería BA).
10. **Agente con identidad ERC-8004 + x402 "genérico"** sin un usuario concreto: era el tema oficial de Hack2Build x402 (Avalanche, fin de 2025) y aparece en #2.

**Lectura para nosotros:** lo que todavía se ve poco en estas listas es pagar **en pesos** (ARGt) con una **credencial on-chain que filtra quién participa** (KUMPLY) en un problema argentino concreto y físico. No encontré ganadores con stablecoin en pesos en ETHGlobal BA (búsqueda sin resultados; no prueba que no existan).
