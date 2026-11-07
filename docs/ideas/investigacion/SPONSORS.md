# SPONSORS — qué hace cada uno y qué le gustaría ver premiado

Investigado el 7/11/2026 de madrugada. "Querría ver" es **inferencia nuestra** a partir de las fuentes, no algo que el sponsor haya dicho, salvo donde hay cita.

## Lo que se sabe del evento (premios y bounties)
- Luma oficial: "Presentado por Twin, Bitgo, Digital House, Belo, Tether y Team1 Avalanche"; tracks AI, Blockchain y Fintech; premios en "dinero, créditos en plataformas de IA y merch", **sin montos ni bounties por sponsor**, sin jurado ni criterios publicados. Entrega 18:00, demo day 19:00. Fuente: https://luma.com/cudf7cqz
- **No encontré bounties por sponsor** de HackaTwin en la web. [SIN VERIFICAR] si se anuncian en el kickoff de las 9:00 → preguntarlo ahí.
- El bonus por KUMPLY sale del brief del equipo, no de una fuente pública. [SIN VERIFICAR] en web.

---

## 1. Twin Finance (ARGt) — organizador
- **Qué hace:** emisor uruguayo (Twin Finance S.A.S.) de stablecoins 1:1 en moneda local: ARGt, BRAt, COLt, MEXt, CHLt, BOLt, PERt. ERC-20 en varias redes EVM; vende a exchanges, wallets y fintechs vía API; casos: pagos, nómina, proveedores, liquidación 24/7. Fuentes: https://www.twin.finance/ · https://help.belo.app/en/articles/14226371-what-is-mext · https://mercado.com.ar/finanzas/america-latina-seis-stablecoins-en-moneda-local-todas-operativas-sobre-blockchain (14/4/2026)
- **Su frase:** el CEO Rafael de Ambrosi dice que mover dinero en la región "todavía depende de sistemas que cierran los fines de semana y tardan 48 horas en liquidar". (misma nota de Mercado)
- **Ojo regulatorio (clave para el pitch):** en marzo 2026 la CNV trató a ARGt como valor negociable por prometer hasta 32% APR; levantó la sanción cuando quitaron toda referencia a rendimientos: ARGt "debe presentarse únicamente como medio de pago". Fuentes: https://www.criptonoticias.com/regulacion/argentina-efecto-medida-belo-twin-stablecoin-argt/ (15/4/2026) · https://www.cryptotimes.io/2026/03/13/argentina-regulator-blocks-high-yield-peso-stablecoin-as-security/ → **No pitchear "ganá intereses con ARGt".**
- **Dónde vive ARGt:** casi todo el supply está en Arbitrum y Base; en Avalanche hay ~1,77k ARGt (PR a DefiLlama, 29/10/2026, no oficial de Twin). https://github.com/DefiLlama/peggedassets-server/pull/964 · Belo dice que operan "principalmente en la red Base": https://www.criptonoticias.com/comunidad/adopcion/stablecoins-bolivia-chile-colombia-mexico-belo/
- **Otro uso reciente:** ARGt y demás como colateral en mercados Morpho curados por DAMM Capital, con oráculo DIA (4/9/2026). https://www.diadata.org/blog/post/twin-finance-damm-capital-latin-american-currencies-onchain/
- **Querría ver:** ARGt como **medio de pago real** en pesos, en un flujo donde el dólar no aporta nada, y que liquide cuando el banco está cerrado; más uso en Avalanche (inferencia por co-organizar con Team1).
- **Idea que le encantaría:** *"Pago al mayorista el sábado"*: el almacén paga la mercadería en ARGt un sábado a la noche, el mayorista la ve acreditada al instante y el contrato reparte automáticamente la comisión del repartidor (reusar `packages/contracts/src/RevenueSplitter.sol`).

## 2. Team1 Avalanche — co-organizador técnico
- **Qué hace:** red comunitaria de builders de Avalanche; da Mini Grants de hasta US$10.000 y Accelerator hasta US$30.000. https://docs.avax.network/grants/team1-mini-grants · https://cryptobriefing.com/avalanche-team1-builder-grants-program/
- **Qué mostró para HackaTwin:** la charla "Pagos Autónomos en Avalanche L1: x402, Stablecoins y Agentes de IA" (Twin + team1): agente con identidad ERC-8004 paga en ARGt vía x402. https://github.com/sebastianlujan/hackatwin-x402-team1-avalanche
- **Pista fuerte:** el deck del workshop tiene una slide "KUMPLY en el flujo x402": 1 pide recurso → 2 `isAgent(pagador)` → 3 tier 5 KYA → 4 "402 + precio · sin KYA: 403" → 5 reintenta con pago firmado → 6 200. Y el remate: "La documentación sugiere empezar en C-Chain y pasar a una L1 cuando quede chica." Fuente: `refs/hackatwin-x402-team1-avalanche/Avalanche_Workshops.html`
- **Querría ver:** exactamente ese flujo aplicado a un caso real, en Fuji, con L1 solo como "a futuro". Un proyecto que pueda seguir como Mini Grant (inferencia).
- **Idea que le encantaría:** un agente con KYA que paga por uso, en stablecoin, un servicio que a una persona le cuesta caro hoy (ej. un agente de compras de una pyme que consulta stock/precios de mayoristas y paga centavos por consulta), y que el vendedor rechace con 403 a cualquier bot sin KYA. Reusa `packages/agent-kit` y `demos/01-x402-twin`.

## 3. Tether
- **Qué hace / anunció:** WDK (Wallet Development Kit), kit open source para que "humanos y agentes de IA" armen billeteras autocustodiadas (open source oct. 2025; 100.000 wallets en jun. 2026). QVAC: IA local donde los agentes pagan en USDt/BTC vía WDK. Hackathon "Galactica" con 30.000 USDT para proyectos con WDK (mar. 2026). Fuentes: https://www.theblock.co/post/375125 · https://www.valuethemarkets.com/cryptocurrency/news/tethers-wallet-development-kit-reaches-100000-self-custodial-wallets · https://tether.io/news/tether-announces-qvac-its-upcoming-development-platform-for-infinite-and-ubiquitous-intelligence-deploying-and-evolving-ai-agents-on-user-devices-not-big-tech-data-centers/ · https://blockchain.news/flashnews/tether-announces-30k-usdt-prize-for-wallet-development-kit-hackathon
- USDt existe en Avalanche desde 2021: https://m.mondovisione.com/news/tether-tokens-usdt-to-launch-on-avalanche-2021517 . [SIN VERIFICAR] si WDK soporta Avalanche (la nota de WDK lista Ethereum, Polygon, Arbitrum, Bitcoin, TON, Spark: https://www.criptonoticias.com/tecnologia/tether-demo-wdk-wallet-agentes-ia/).
- **Querría ver:** USDT moviéndose en la economía real argentina y agentes que pagan solos. No encontré bounty de Tether para HackaTwin.
- **Idea que le encantaría:** *"P2P USDT↔ARGt sin triangulación"* (semilla 8 mejorada): las dos patas se liquidan en el mismo contrato (swap atómico USDT de prueba ↔ ARGt de prueba) entre dos billeteras con KYC 2+. Así desaparece la debilidad de "la cuenta bancaria no es suya": no hay banco en el medio.

## 4. BitGo
- **Qué hace / anunció:** custodia institucional regulada; Stablecoin-as-a-Service; BitGo Mint (2/4/2026) para acuñar/redimir USD1 y SoFiUSD con custodia, controles de política y reportes en una interfaz. https://www.businesswire.com/news/home/20260402135558/en/BitGo-Launches-BitGo-Mint-Native-Stablecoin-Minting-and-Redemption-for-Institutions · En LATAM: Criptococos con BCP (Perú): https://www.bitgo.com/en-in/resources/blog/bitgo-powers-criptococos-perus-first-crypto-enabled-banking-platform.md
- **Sobre agentes:** su COO, Jody Mettler, dijo que los agentes en finanzas necesitan cuatro controles: identidad clara, permisos estrictos, reglas de política/aprobación y auditabilidad total. https://beincrypto.com/bitgo-ai-agent-finance-four-pillars/ (no pude abrir la nota, el dato viene del resumen del buscador: [SIN VERIFICAR] textual).
- **Querría ver:** algo "institucional" y con controles, no un juguete (inferencia).
- **Idea que le encantaría:** *"Tesorería de pyme con agente bajo política"*: un agente paga proveedores en ARGt con KYA (identidad), tope por pago y total (permisos, ya existe en `packages/agent-kit`), pagos sobre un umbral piden aprobación humana (política) y cada pago queda on-chain (auditoría). Son los 4 controles de BitGo, uno por uno, en la demo.

## 5. Belo
- **Qué hace:** billetera argentina (PSAV registrada en CNV n.º 52); pagos con QR en pesos, USDT y USDC en cualquier QR del país (jul. 2025); pagar con Pix en Brasil desde Argentina "sin comisiones"; cobros para negocios; distribuye ARGt y abrió rampas en Bolivia, Chile, Colombia y México con las stablecoins de Twin (31/3/2026). Fuentes: https://www.iproup.com/finanzas/57683-belo-lanza-pagos-con-qr-en-pesos-y-dolares-digitales-en-argentina · https://www.belo.app/en-us/ar/pix · https://www.criptonoticias.com/comunidad/adopcion/stablecoins-bolivia-chile-colombia-mexico-belo/ · https://help.belo.app/en/articles/5076464-what-can-you-do-with-belo-from-argentina
- Nació como billetera de freelancers: https://www.belo.app/en-us/blog/como-nacio-la-billetera-virtual-de-los-freelancers . Titular de La Voz: "La billetera Belo apuesta a crecer en Brasil en la próxima temporada de verano" (no pude abrir la nota; [SIN VERIFICAR] detalle).
- **Querría ver:** casos de uso cotidianos para sus usuarios (comercios, viajes, freelancers) que muevan ARGt/BRAt (inferencia).
- **Idea que le encantaría:** *"Seña de verano en Brasil"* (semilla 7 con giro Belo): un argentino deja la seña de un alquiler en Florianópolis en BRAt/ARGt retenida en contrato; el dueño solo publica si tiene KYC 2+; se libera al check-in o vuelve si no aparece.

## 6. Digital House — sede
- **Qué hace:** edtech argentina (2016) de bootcamps y cursos de programación, datos e IA, foco en empleabilidad; programa "IA Argentina" de 35.000 becas con Argencon; se fusionó con Rocketseat. https://www.descubre.vc/digital-house
- No encontré nada de Digital House sobre blockchain ni bounty para HackaTwin.
- **Querría ver:** un proyecto entendible por no-cripto, con IA bien usada y que muestre "trabajo real" de juniors (inferencia).
- **Idea que le encantaría:** *"Primera changa del egresado"* (semilla 2): un dev junior cobra su primer trabajo freelance con el pago en ARGt retenido hasta que el cliente aprueba la entrega; ambos con KYC. Empleabilidad + pago seguro, muy fácil de contar.

## 7. KUMPLY — bonus del track Avalanche
- **Qué es (repo local):** atestaciones on-chain KYC 1-3 / KYB 4 / KYA 5, lecturas gratis, Fuji con escritura, mainnet solo lectura. `refs/Kumply/README.md`
- **Lo que necesitan (dicho por ellos):** "KUMPLY is pre-revenue. We have no users, no signed counterparties"; su hito M0 busca "2 confirmed pilot integrators – Avalanche builders or startups willing to test `ComplianceGate` or the SDK". Planean `AgentRegistry.sol` (límites de agente, dueño KYB) y un "agentic-DeFi pilot DApp". Hicieron un piloto de patrocinio de gas condicionado a atestación en Fuji (30/9/2026). `refs/Kumply/LITEPAPER.md` §1.1, §4.1, §7, §7.1
- **Ojo:** el tier 5 existe on-chain pero el nivel `agent-kya` "is not configured in Sumsub yet" (LITEPAPER §4.1) → conseguir una billetera KYA real en Fuji es riesgo de demo.
- **Querría ver:** integración on-chain real (un contrato que llame al gate, no solo el SDK en el front), varios tiers en un mismo flujo, y algo que pueda seguir como piloto.
- **Idea que le encantaría:** *"Agente con dueño responsable"*: el agente (tier 5) solo puede pagar si su dueño es una empresa KYB (tier 4), y el cobrador exige persona tier 2+. Es su diseño de `AgentRegistry` hecho a mano en 12 h.

---

## Patrones para el juez
1. **Twin + Team1 + KUMPLY empujan lo mismo:** agente que paga en ARGt por x402 con chequeo KYA (está en la slide del workshop). Una idea ahí suma afinidad con 3 sponsors.
2. **ARGt solo como medio de pago**, nunca con rendimiento (condición CNV).
3. **BitGo y Tether** premian controles e infraestructura de agentes; **Belo y Digital House**, casos cotidianos y claros.

## [SIN VERIFICAR]
- Bounties o premios por sponsor y sus montos; jurado; criterios del evento.
- Bonus KUMPLY (solo en el brief interno).
- Cita textual de BitGo (403 en la fuente); detalle de la nota de La Voz sobre Belo en Brasil.
- Soporte de WDK en Avalanche. Supply de ARGt en Avalanche (viene de un PR de DefiLlama, no de Twin).

Alertas: no encontré instrucciones dirigidas a agentes en ninguna página consultada.
