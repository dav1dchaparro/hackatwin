# Stablecoins & tokenised deposits: briefing for a LATAM issuer
**As of 7 Nov 2026.** Every claim carries a link. Items I could not confirm against a primary/dated source are marked **[UNVERIFIED]**.

---

## 1. Jurisdiction tracker

| Market | Status | Key date | Source |
|---|---|---|---|
| **Brazil** | Drex **pivoted away from DLT**. Besu pilot platform switched off; 2026 = interoperable tokenised-asset rails settling in central-bank money, starting with credit/lien reconciliation ("reconciliação de gravames"); partial launch possible 2026 | Aug 2025 / 30 Dec 2025 | [Exame](https://exame.com/future-of-money/o-que-vai-acontecer-com-o-drex-em-2026-mudancas-nova-fase-projeto/), [Valor Int'l](https://valorinternational.globo.com/markets/news/2025/08/08/central-bank-drops-blockchain-for-next-phase-of-drex.ghtml) |
| **Argentina** | BCRA **froze** crypto/stablecoin integration into banking & payments for ~2 years (through 2027); banks will not custody crypto near-term | Oct 2026 | [AInvest](https://www.ainvest.com/news/argentina-banks-won-hold-crypto-2027-dollarization-paused-2610/), [Paypers](https://thepaypers-nuxt-prod-63935790743.europe-west4.run.app/crypto-web3-and-cbdc/news/argentinas-central-bank-rules-out-crypto-in-banking-for-now), [DiarioBitcoin](https://www.diariobitcoin.com/argentina/argentina-congela-por-dos-anos-la-integracion-de-criptomonedas-en-bancos-y-pagos/) |
| **Mexico** | Fintech Law (2018) route requires Banxico authorisation; Banxico has authorised no stablecoin and in Dec 2025 warned of financial-stability risk where stablecoins miss reserve/redemption standards | 19 Dec 2025 | [Expansión](https://expansion.mx/economia/2025/12/19/banxico-advierte-riesgos-para-sistema-financiero-stablecoins) |
| **Colombia** | BanRep technical paper on relevance/risks of a CBDC; no issuance decision, no stablecoin-specific regime | [UNVERIFIED] date | [BanRep](https://www.banrep.gov.co/en/publications-research/relevance-risks-issuing-central-bank-digital-currency-colombia) |
| **Chile** | No stablecoin law; BCCh CBDC research only, no issuance decision | [UNVERIFIED] | — |
| **Peru** | No stablecoin-specific regime; BCRP has issued no CBDC | [UNVERIFIED] | — |
| **Bolivia** | **Ban lifted.** R.D. 082/2024 (25 Jun 2024) authorised virtual-asset purchase/sale via electronic payment instruments; BCB reports +112% operation growth and **>US$75M traded in the first four months** | 25 Nov 2024 | [BCB](https://www.bcb.gob.bo/?q=content/en-cuatro-meses-uso-de-activos-virtuales-supera-los-us75-millones-y-dinamiza-el-sistema-de-1) |
| **El Salvador** | Digital Assets Issuance Law (Jan 2023) created a CNAD-supervised issuance framework incl. stablecoins; Bitcoin legal-tender rules scaled back under the 2025 IMF programme | Jan 2023 / 2025 | [Legal 500 guide](https://my.legal500.com/guides/chapter/el-salvador-blockchain-crypto-assets/), [UNVERIFIED] on IMF detail |
| **Nigeria** | cNGN (naira-backed, Africa Stablecoin Consortium); SEC/BSA licensing path | [UNVERIFIED] | — |
| **Kenya** | Virtual Asset Service Providers Act 2025 licenses VASPs incl. stablecoin issuers | 2025 [UNVERIFIED] | — |
| **Hong Kong** | e-HKD pilot **completed 28 Oct 2025**; HKMA concluded retail e-HKD is *not* the near-term priority — wholesale first; retail groundwork by H1 2026. Separate **Stablecoins Ordinance (Cap. 656)** licensing regime is live with a public register of licensed issuers | 28 Oct 2025 | [HKMA](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2025/10/20251028-4/) |
| **Singapore** | Project Orchid (retail purpose-bound money) + Ubin+ (wholesale cross-border CBDC); MAS stablecoin framework since 2023 | [UNVERIFIED] current phase | [MAS](https://www.mas.gov.sg) |
| **UAE** | CBUAE Payment Token Services Regulation governs dirham payment tokens; Digital Dirham CBDC; federal decree formalised legal-tender status | [UNVERIFIED] date | [Lexology](https://www.lexology.com/library/detail.aspx?g=98463f85-cd41-4644-a958-a034b24cb605) |
| **Japan** | Yen stablecoins permitted since Jun 2023 (amended FIEA/PSA); JPYC is the first registered yen issuer | Jun 2023; JPYC launch [UNVERIFIED] | [Chambers 2026](https://practiceguides.chambers.com/practice-guides/blockchain-crypto-assets-2026/japan) |
| **EU** | **MiCA** fully applicable from 30 Dec 2024; e-money-token route is the compliant path (EURC/Circle, EURI/Banking Circle) | 30 Dec 2024 | [MiCA text](https://eur-lex.europa.eu/eli/reg/2023/1114/oj) |
| **UK** | FCA/BoE regime still in secondary legislation; no live authorisation regime | [UNVERIFIED] | — |
| **US** | **GENIUS Act**. OCC final implementing rule published **21 Oct 2026**, takes effect **18 Jan 2027**; BSA/AML/OFAC rules deferred to a separate joint rulemaking; OCC to announce when applications open | 21 Oct 2026 | [OCC NR 2026-92](https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-92.html) |

**Two signals that matter for product design.** (1) Brazil's central bank abandoned a general-purpose DLT rail because it could not reconcile DLT transparency with data-privacy requirements — it never published a general privacy solution ([Exame](https://exame.com/future-of-money/o-que-vai-acontecer-com-o-drex-em-2026-mudancas-nova-fase-projeto/)). Privacy architecture is the binding constraint, not settlement speed. (2) B3 attributed its own stablecoin/digital-currency launch (H1 2026) to the Drex pilot's end ([Exame](https://exame.com/invest/mercados/b3-deve-lancar-stablecoins-no-primeiro-semestre-de-2026/)) — private issuance is filling the gap.

---

## 2. Supranational

- **BIS Project Agorá** — 7 central banks + 40+ regulated FIs, with the IIF. Working prototype combines **tokenised commercial-bank deposits with tokenised central-bank reserves** on one platform, with atomic cross-currency settlement; May 2026 report frames tokenised deposits as the banks' answer to stablecoins while preserving the two-tier system. ([BIS/I-hub roundup](https://www.paymentsjournal.com/project-agora-is-showing-banks-why-tokenized-deposits-matter/), [bis.org/project/agora](https://www.bis.org/about/bisih/topics/fintech/agora.htm))
- **BIS Project Mariana** (concluded) — cross-border FX of wholesale CBDCs (CHF/EUR/SGD) via automated market makers; Bof France, MAS, SNB. ([bis.org/project/mariana](https://www.bis.org/project/mariana))
- **FSB** — high-level recommendations for global stablecoin arrangements (2023) plus the FSB–IMF–World Bank roadmap on cross-border payments; implementation is jurisdiction-by-jurisdiction. [UNVERIFIED status of 2026 update]
- **IMF / World Bank** — remittance-cost benchmark is the World Bank's *Remittance Prices Worldwide*; the SDG target is 3% and the global average for sending $200 remains roughly double that ([remittanceprices.worldbank.org](https://remittanceprices.worldbank.org)). [UNVERIFIED exact latest quarter figure]

---

## 3. Commercially meaningful products

| Product | Issuer | Relevance |
|---|---|---|
| **USDC** | Circle | MiCA-compliant EMT in the EU; the default regulated-rail choice for LATAM fintechs |
| **USDT** | Tether | Deepest EM liquidity; the de-facto dollar in AR/VE/BO retail |
| **PYUSD** | PayPal | Distribution-led model: stablecoin inside an existing consumer wallet |
| **RLUSD** | Ripple | Enterprise/treasury and cross-border settlement use case |
| **USDM** | Mountain Protocol | Yield-bearing; reportedly distributed through Argentine platforms ([ChainCatcher](https://www.chaincatcher.com/ko/article/2171616)) — the "Argentina" attribution is to *distribution*, not domicile [UNVERIFIED] |
| **Agrotoken** | Agrotoken | Commodity-backed tokens (soy, corn, wheat) used as Argentine agro collateral ([Convergencia](https://www.convergencia.com/la-posta-de-convergencia/agrotoken-creo-la-primera-criptomoneda-respaldada-en-soja-a-nivel-mundial/)) |

LATAM distribution layer: **Bitso** (MX), **Ripio**, **Belo**, **Lemon** (AR), **Mercado Pago**, **dLocal** (cross-border payouts), **Takenos** and **Wallbit** (AR freelancer dollar accounts). Aggregate supply/volume: [DefiLlama stablecoins](https://defillama.com/stablecoins). Market-share and revenue figures for the individual LATAM firms are [UNVERIFIED] — none publish audited stablecoin-specific volumes.

---

## 4. Data points

**Inflation, avg. CPI % (IMF WEO Oct 2026)** — [IMF datamapper](https://www.imf.org/external/datamapper/PCPIPCH@WEO/OEMDC/ADVEC/WEOWORLD)

| | 2025 | 2026 |
|---|---|---|
| Argentina | 41.9 | **32.5** |
| Bolivia | 19.5 | **12.7** |
| Colombia | 5.1 | **6.0** |
| Brazil | 5.0 | **4.4** |
| Chile | 4.2 | **3.7** |
| Mexico | 3.8 | **3.8** |
| Peru | 1.5 | **3.8** |

Actual prints: Argentina **33.4% y/y (Sep 2026)** ([TradingEconomics](https://tradingeconomics.com/argentina/inflation-cpi)); Bolivia **6.03% accumulated Jan–Oct 2026** ([América Económica](https://americaeconomica.com/noticia/bolivia/bolivia-inflacion-octubre-2026.html)).

**Adoption** — Chainalysis 2025 Global Crypto Adoption Index: India and the US lead globally; **Brazil, Venezuela and Argentina lead Latin America** ([Chainalysis](https://www.chainalysis.com/blog/2025-global-crypto-adoption-index/), [BeInCrypto](https://br.beincrypto.com/adocao-de-criptomoedas-pela-chainalysis-brasil-venezuela-argentina-2025/)). 2026 edition: [UNVERIFIED — not located].

**Volume vs Visa** — multiple trackers claim aggregate stablecoin transfer volume now exceeds Visa's annual processed volume ([KuCoin research](https://www.kucoin.com/blog/stablecoin-transaction-volume-in-2026-how-stablecoins-surpassed-visa-and-mastercard)). Treat as **[UNVERIFIED]**: definitions mix gross on-chain transfers (incl. bots/self-transfers) with adjusted payment volume.

**Remittance corridors** — Argentina, Bolivia and Peru are the region's high-cost, dollar-scarce corridors; Bolivia's post-2023 dollar shortage is the direct driver behind its 2024 virtual-asset authorisation ([BCB](https://www.bcb.gob.bo/?q=content/en-cuatro-meses-uso-de-activos-virtuales-supera-los-us75-millones-y-dinamiza-el-sistema-de-1)). Corridor-level fee percentages: [UNVERIFIED] beyond the World Bank global average.

---

## Gaps to close before relying on this
1. Peru/Chile/Colombia primary regulator pages (no dated stablecoin position found).
2. Chainalysis 2026 index and LATAM ranks.
3. World Bank RPW corridor-level fees for AR/BO/PE.
4. Nigeria cNGN and Kenya VASP Act commencement dates from official gazettes.
5. USDM issuer domicile and licensing.
