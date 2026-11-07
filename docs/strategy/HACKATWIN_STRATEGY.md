# HackaTwin 2026 — Stablecoins Track
## Strategy memo, concept and build plan

> **Update, 11:15 ART — the concept decision is superseded.** Read [`../proposal/HACKATWIN_PROPOSAL.md`](../proposal/HACKATWIN_PROPOSAL.md) for the current proposal. The track/EV research below still stands; the recommended concept is now **Aval Network** — on-chain guarantee certificates and an ARGt risk pool for SGRs and mutuals — because **Resolución 94/2026** (June 2026) requires SGRs that use electronic contracts to do so on a blockchain support, and the consumer version has a weaker business and regulatory footing. Keep this memo for §2–3 (dual-track math) and §5 (evidence base); build from the proposal.

**Prepared:** Saturday 7 Nov 2026, ~10:50 ART · **Submission closes:** 18:00 · **Demo day:** 19:00–21:00
**Scope:** the Twin "Stablecoins" track PDF (`track twin.pdf`), the Avalanche "Blockchain" track PDF, and the public HackaTwin listing.
**Status of numbers:** every external claim is linked; anything inferred or unverified is marked **[UNVERIFIED]** or **[ASSUMPTION]**.

---

## 0. Bottom line

1. **Focus on Stablecoins. Do not run two builds.** The two rubrics pull in opposite directions: Stablecoins gives 25% of the score to "the Twin token is the core, not decorative"; Avalanche gives 25% to "uses Avalanche's own capabilities". One product can satisfy both only when Avalanche is load-bearing in the core flow — and then it is usually a weaker Stablecoins product. The only dual-track version worth considering is **one deployment on Avalanche C-Chain mainnet with real ARGt**, never two deployments — and Twin's own docs (25 Aug 2026) list four chains with **no Avalanche**, so even that path is unlikely (§3).
2. **The winning lane is local-currency credit, not another escrow, remittance app or agent wallet.** Every on-chain credit winner I could verify is USD-denominated (Cred-Fi, Strevvo, Ghost Finance, Dow, Efy). The Twin track explicitly asks for things that are *only* possible with local money; a peso-denominated credit primitive is the open lane (§5.4).
3. **Recommended concept: `Aval` — social collateral, priced on-chain.** A borrower with no payslip and no property pledges her network: two people she knows lock a capped amount of ARGt as first-loss guarantee; a lender funds the loan at a much lower rate; the contract releases or seizes the guarantee automatically; the repayment history becomes a portable "legajo". The token is not decoration: income, loan, collateral and repayment are all in the same unit, which removes the FX mismatch that makes dollar credit unusable for this borrower (§7).
4. **Why it can win this jury:** it is a payment/settlement primitive (no yield promise, which matters after the CNV episode), it gives Twin a credit story on top of payments, it gives Belo a reason to keep ARGt balances, and it has a physical, human 30-second demo: *"Rosa no tenía garantía. Tenía una red."*
5. **What to do in the next 60 minutes:** lock the concept, assign the four roles, get ARGt + gas from the Twin mentors, and put the first real ARGt transfer on Arbitrum by 13:30. The tx hash is the deliverable that cannot be faked; protect it above every other feature (§9).

---

## 1. The clock and the constraints

| Item | Fact | Consequence |
|---|---|---|
| Kickoff / close | 09:00 / **18:00** ("lo que llegue después no se evalúa") | ~7 h from now; code freeze must be ~17:00 |
| Team | up to 4 people | four parallel workstreams, one integrator |
| Prize | **500 USDT + merch** | small cash, high option value (Twin, Belo, DH, Avalanche, Tether relationships) |
| Judging | Idea / Problem / Business / Pitch, each 1–5, equal weight, average over 100 | pitch + demo = 50% of the score; a beautiful contract with a bad story loses |
| Hard deliverable | ≥1 on-chain tx hash from the product, verifiable in the explorer | this is the one non-negotiable; design the demo around it |
| Hard deliverable | public repo + README with token(s), chain, contract addresses | prepare the README skeleton before the code |
| Legal | CNV has already halted ARGt once over a "32% TNA" promise | never promise yield; frame everything as payment/settlement/guarantee |

The public listing advertises **three** tracks (AI / Blockchain / Fintech) and ~100 builders, with Twin, Bitgo, Digital House, Belo, Tether and Team1 Avalanche presenting **[UNVERIFIED which listing is authoritative]**. The two PDFs are the authoritative texts for this memo; the third-track possibility is another reason not to over-invest in a single sponsor's rubric.

---

## 2. What the two tracks actually reward

### 2.1 Stablecoins track (Twin)

**The ask:** "Construí en 9 horas un producto que explore qué se puede hacer con moneda local en una infraestructura programable y componible, usando las Twin Stablecoins, con al menos una transacción onchain real en la demo."

**The rubric (each 1–5, equal weight, final = average over 100):**

| Criterion | What the PDF literally asks | What it means in practice |
|---|---|---|
| **Idea** | original, only possible with local currency on-chain; **the Twin stablecoins must be at the core, not a decorative add-on** | remove ARGt and the product should stop making sense |
| **Problem** | a real problem, an identified user and a concrete pain in the region | a named person, a number, a date |
| **Business** | a viable path to users or customers and a model that makes sense after the hack | who pays, how much, why now |
| **Pitch** | a clear story in 3 minutes, with a working demo | one narrative, one "wow", one tx |

**Deliverables:** public repo with README (token(s), chain, contract addresses), ≥1 tx hash, functional demo, 3-min pitch + 2 min Q&A.

**Triggers Twin suggests (not limits):** (1) agentic payments with user-defined limits; (2) merchant working capital with on-chain collection scoring and repayment as a % of sales, using Morpho vaults; (3) FX between local currencies via Curve pools, or hedging.

**The trap:** the three triggers are *suggestions*. Several teams will build exactly them. The rubric rewards originality and "token as core", not obedience. A team that builds a fourth version of "agent with limits" will be compared to the other three.

### 2.2 Blockchain track (Avalanche)

**Six mandatory items** (missing one = not eligible): a contract on Avalanche (Fuji or mainnet, C-Chain or own L1) **verified** in the explorer; a web or mobile UI connected to the contracts (CLI/bot does not count); a documented "why Avalanche"; a business model (problem, customer, revenue, advantage); a public repo with install/deploy/architecture; a README that separates what was built at the event.

**Rubric (100):** Impact 25 · **Use of Avalanche-specific capabilities 25** · Technical feasibility (works and is deployed) 20 · Business and scalability 20 · Presentation 10. Tie-break: jury debate.

**Bonuses:** 0xGasless up to +10 (basic +5: any component + sponsored tx or x402 payment on Fuji/mainnet; core +10: in the main flow, e.g., the user never pays gas); KUMPLY up to +10 (basic +5: `@kumply/sdk` + an on-chain gate with `isPersonAtLeast`/`isBusiness`/`isAgent` on Fuji, showing one address that passes and one that is blocked; core +10: verification is a key part of the product, priority KYA/agents; **do not use `hasTier()`**; README must state that Fuji attestations are demo-only, not real verification). Combo example: a paymaster that only sponsors KUMPLY-verified accounts.

### 2.3 The structural conflict

| | Stablecoins | Blockchain |
|---|---|---|
| Core noun | the **local-currency token** | **Avalanche** |
| 25% of score | "only possible with local money; token at the core" | "uses Avalanche's own capabilities" |
| Natural product | peso credit, peso payments, peso FX | identity-gated agents, gasless UX, L1s, ICM |
| Chain | Arbitrum (where Twin's liquidity is) | Avalanche C-Chain / L1 |
| Failure mode | "this is a generic escrow with a token bolted on" | "this is a generic EVM app that happens to be on Avalanche" |

A product can satisfy both only if its core mechanism *needs* an Avalanche capability. For most peso-credit or peso-savings products, it does not. That is the whole dual-track problem in one table.

---

## 3. Dual track or single track?

### 3.1 The three options

| Option | What it is | Cost | Ceiling |
|---|---|---|---|
| **A. Stablecoins only** (Arbitrum) | one product, one chain, one story, one demo | lowest | high: the rubric rewards a focused, token-native product |
| **B. Two builds** (Arbitrum + Fuji/mainnet) | the same contract deployed twice, two readmes, two pitches | +1.5–3 h, two failure surfaces, narrative dilution | medium: each track sees a half-adapted product |
| **C. One deployment, two tracks** (Avalanche mainnet + real ARGt) | the *same* product on an Avalanche-eligible chain, with an Avalanche-native capability in the core flow | +45–90 min (identity/gasless), one deployment | high *if* the Avalanche capability is real; otherwise a weak "why Avalanche" |

### 3.2 The EV math (illustrative, not a forecast)

Let `P` = probability of winning, `V` = prize value. Prize for Blockchain is **not disclosed**; the track PDF says only "un premio (monto no informado)". Use scenarios.

| Scenario | P(Stablecoins) | V(S) | P(Blockchain) | V(B) | EV |
|---|---|---|---|---|---|
| A. Focused Stablecoins | 20–25% | 500 USDT | — | — | **100–125 USDT** |
| B. Two builds, diluted | 12–15% | 500 | 5–7% | 2,000–5,000 | **160–410 USDT** |
| C. One Avalanche deployment, dual | 18–22% | 500 | 8–10% | 2,000–5,000 | **250–590 USDT** |

The table says the EV can favor dual *if* the second submission is nearly free. It also hides the real cost: the **variance**. B and C can produce zero on both tracks if the demo breaks, and the demo is 50% of the Stablecoins score. A focused team that ships one flawless demo beats a dual team that ships two mediocre ones.

### 3.3 The one-deployment test

Before considering dual, answer four questions at the venue:

1. **Can the same project be submitted to both tracks?** The rules are silent **[UNVERIFIED]**. Ask the organizers on the record; if the answer is no, the decision is over.
2. **Does ARGt exist on Avalanche C-Chain mainnet, and can the Twin mentors give a test balance?** The track PDF lists Avalanche as eligible, but **Twin's own docs (25 Aug 2026) list only Base, Polygon, Arbitrum One and Ethereum** — no Avalanche ([supported chains](https://docs.twin.finance/stablecoins/supported-chains)). The repo's reference address `0x2E4e93eCA2E16E4989b894e188B7F7fC0175703B` is **[UNVERIFIED]**. Unless a mentor confirms an undocumented Avalanche deployment, C is dead; B (two builds) is the only dual path, and B is not worth it.
3. **Is there an Avalanche-native capability in the core flow?** For `Aval`, the credible ones are **KUMPLY** as the avalista identity gate (unique verified humans — Sybil resistance is the security model, not a bolt-on) and **0xGasless** as the borrower onboarding (no ETH). Two caveats: KUMPLY's Fuji attestations are demo-only and a **mainnet** contract cannot read Fuji state, so using KUMPLY in the live flow implies a Fuji deployment; and 0xGasless support on Avalanche mainnet must be confirmed. If neither is usable on the mainnet deployment, "why Avalanche" is "cheap and fast", which any EVM claims, and the 25-point criterion collapses.
4. **Can one person deploy and verify it in ≤45 minutes?** If not, it is not a free option.

### 3.4 Recommendation

**Default: Option A — Stablecoins only, on Arbitrum One.**
Reasons: (a) Arbitrum is where Twin's real liquidity lives — the Curve ARGt/USDT0 pool and the Morpho ARGt vault are there, and the addresses are documented; (b) the Stablecoins rubric is the one that rewards the thing you can uniquely build today; (c) the 500 USDT is small, but the relationship value with Twin/Belo is not; (d) one demo, rehearsed three times, is worth more than two demos rehearsed once.

**Option C (now unlikely — see the update below), only if all four gates in §3.3 pass by 11:30.** Then build the *same* product on Avalanche C-Chain mainnet with real ARGt and submit to both. Be precise about the Avalanche hook: **0xGasless on mainnet** is a clean, core-flow story if it is supported; **KUMPLY** is a Fuji-only demo, so earning that bonus means a second (Fuji) deployment — i.e. Option B. Do not claim a mainnet contract reads Fuji attestations. If the only honest answer is "cheap and fast", skip the second track.

**Update (11:30):** Twin's docs list four chains and **not Avalanche**, and the September reserve report covers **seven tokens** (not the ten the docs list). Until a mentor confirms an Avalanche deployment, treat Option C as dead and build on Arbitrum. The dual-track question is now mostly settled by the issuer's own documentation.

**What I would not do:** port a peso-credit product to Fuji with a test token, then tell the Avalanche jury that "fast finality" is why it is on Avalanche. The 25-point "use of Avalanche" score will see through it, and the Stablecoins jury will see a project that spent its morning on a second chain.

---

## 4. The asset: what ARGt is, and what it isn't

### 4.1 Mechanics (track PDF + Twin docs, 25 Aug 2026)

- **Seven live tokens** in the September 2026 reserve report: **ARGt, BRAt, COLt, PERt, MEXt, CHLt, BOLt**; ERC-20, 18 decimals, permissionless. Twin's docs list **ten** deployed (the extra **PRYt, URYt and VENt** are not in the PoR yet).
- **Four chains in Twin's docs (25 Aug 2026): Base (8453), Polygon (137), Arbitrum One (42161), Ethereum (1). Avalanche is not in the supported-chains table**, even though the track PDF lists it as eligible. Treat the PDF as the event's eligibility list and the docs as the deployment reality; confirm with the mentors.
- Issuer: **Twin Finance S.A.S.** (Uruguay) for stablecoins; **Twin Finance Bermuda Ltd.** (Class M Digital Asset Business licence) for tokenized assets.
- Reserves (30 Sep 2026 PoR): **ARGt — Argentine government securities, 1.09x coverage**; BRAt — BRL stablecoins, 1.37x; COLt — USD stablecoins, 1.32x; PERt — USD stablecoins, 1.85x; MEXt — USD stablecoins + tokenized bonds, 1.21x; CHLt — USD stablecoins, 1.40x; BOLt — USD stablecoins, 1.95x. The report is an **agreed-upon-procedures** engagement by NEXXO Solutions (Montevideo), not a full audit ([PoR](https://cdn.twin.finance/Proof%20of%20Reserves/stablecoins/PoR-260930-en.pdf)).
- Bridge: **LayerZero V2 OFT, burn & mint**, all tokens across the four documented chains; one adapter per token per chain (ARGt Arbitrum adapter `0x4821FBf47B261F0D52Ba0F941CF67b8648f82691`).
- Liquidity on Arbitrum: one **Curve** pool per token vs USDT0 (e.g. ARGt/USDT0 `0x356d349da9add7efb56a35fab939a2c6d852f853`), one **Morpho** vault per token (e.g. ARGt vault `0x9Dd3F844747AB78d616BF76DB92756E17A064aDD`).
- Price API: `https://api.belo.app/public/price` (bid/ask/mid per pair) — off-chain, for display and quotes, not for settlement.
- **Non-deterministic deploys:** the same address can be a different token on another chain (the PDF's own example: `0x5986…2214` is ARGt on Arbitrum and Ethereum, MEXt on Base, BRAt on Polygon). Always read `symbol()` at runtime; never hard-code an address by chain.

### 4.2 The CNV episode and what it teaches

In March 2026 the CNV ordered Belo and Twin to cease offering and promoting ARGt, arguing that a "guaranteed 32% TNA" campaign turned the token into an unregistered security under a Howey-style test, and citing missing corporate disclosure and no whitepaper. On **21 April 2026** the CNV lifted the measure after Belo removed the yield messaging and Twin added corporate data, a whitepaper and non-security warnings — while the CNV **still asserts** that ARGt is a *valor negociable* under its reading ([Cointelegraph, 21 Apr 2026](https://cointelegraph.es/news/cnv-de-argentina-levanto-suspension-sobre-la-stablecoin-argt); [original order, 17 Mar 2026](https://cointelegraph.es/news/argentina-la-cnv-ordeno-suspender-la-oferta-y-negociacion-de-la-stablecoin-argt)).

Three lessons for a hackathon product:

1. **Never promise yield on ARGt.** No "earn 30%", no "savings account", no "guaranteed return". A credit product that prices risk is not a yield product; say so explicitly.
2. **The regulator's concern is the *marketing of an investment*, not the token as a payment rail.** A product that uses ARGt to settle a peso obligation (a loan, a rent, an invoice) is in a different lane — as long as it does not pool funds and promise a return.
3. **Transparency is part of the product.** A README that names the issuer, the reserve model, the token contract and the risks is not bureaucracy; it is the exact thing the CNV found missing.

This is also a **differentiation opportunity**: most hackathon teams will ignore the regulatory history. A team that says "we deliberately built a guarantee product, not a yield product, because of the CNV precedent" looks like adults in the room — especially to Twin and Belo.

### 4.3 The unit-of-account argument (the core of the "token at the core" test)

A peso stablecoin is not a better dollar. It is a different unit of account, and that difference is the product:

- **Income, obligation and collateral in the same unit.** If Rosa earns in pesos, borrows in USDT and the peso depreciates 30%, her debt grows 30% in real terms even if she pays every installment. A peso loan removes the FX bet and leaves only credit risk — which is exactly what a guarantee prices. This is the strongest "only possible with local money" argument available, and it is economically correct.
- **Obligations that are legally in pesos.** Wages, rents, invoices, taxes, school fees and utility bills are denominated in ARS. A product that settles them on-chain must use a peso unit, or it is just a dollar app with an FX step.
- **Composability across currencies.** The same standard on seven live LATAM currencies (ten documented), with Curve pools on Arbitrum and an OFT bridge, makes cross-border local-currency products possible without a USD leg. But **ARGt is ~96% of circulation** (ARS 15.96 B vs ~USD 0.37 M for the other six combined), so a multi-currency demo is a roadmap slide, not a live flow.

### 4.4 What ARGt is not

- **Not a savings instrument.** At 33.4% y/y inflation (Sep 2026), holding pesos is a losing trade; a product that asks users to hold ARGt for months is fighting the macro.
- **Not risk-free.** The reserve mix includes private securities, FCIs and DeFi positions; the token is an upgradeable proxy (the issuer can upgrade it); no code audit was found **[UNVERIFIED]**. A product that custodies user funds must say this out loud.
- **Not a bank rail (yet).** The BCRA has frozen crypto/stablecoin integration into banking and payments for roughly two years (through 2027) **[UNVERIFIED, reported Oct 2026]**. Distribution is consumer wallets (Belo), not banks. Build for the wallet, not the bank.

**Design implication:** prefer products where ARGt is *in motion* (a payment, a loan, a guarantee, a settlement) over products where ARGt is *held* (savings, yield, escrow for months). The former is aligned with the macro and the regulator; the latter is a bet against both.

---

## 5. What the evidence says

### 5.1 Country and central-bank initiatives (2023–2026)

| Jurisdiction | What happened | Lesson for the concept |
|---|---|---|
| **Brazil — Drex** | The central bank **pivoted away from a general-purpose DLT rail** in 2025; the Besu pilot was switched off. The binding constraint was **privacy**, not throughput; the 2026 plan is interoperable tokenized-asset rails settling in central-bank money ([Exame](https://exame.com/future-of-money/o-que-vai-acontecer-com-o-drex-em-2026-mudancas-nova-fase-projeto/), [Valor](https://valorinternational.globo.com/markets/news/2025/08/08/central-bank-drops-blockchain-for-next-phase-of-drex.ghtml)) | Do not put sensitive financial data on-chain in plaintext. For `Aval`, the loan amount and the aval relationship can be public in a demo, but the production design should use commitments/hashes for the sensitive parts. |
| **Argentina — BCRA** | Crypto/stablecoin integration into banking and payments **frozen** for ~2 years (through 2027) **[UNVERIFIED, Oct 2026]** ([DiarioBitcoin](https://www.diariobitcoin.com/argentina/argentina-congela-por-dos-anos-la-integracion-de-criptomonedas-en-bancos-y-pagos/)) | Distribution is consumer wallets (Belo), not banks. A B2B2C deal with a wallet/credit union is the realistic path. |
| **Bolivia** | Crypto **ban lifted** by R.D. 082/2024; the central bank reports +112% operations and **>US$75M traded in four months** ([BCB](https://www.bcb.gob.bo/?q=content/en-cuatro-meses-uso-de-activos-virtuales-supera-los-us75-millones-y-dinamiza-el-sistema-de-1)) | A dollar-scarce, high-informality market where local stablecoins can win. Good second market for a cross-border version. |
| **Mexico** | Fintech Law route requires Banxico authorization; Banxico has authorized no stablecoin and warned about reserve/redemption risk (Dec 2025) ([Expansión](https://expansion.mx/economia/2025/12/19/banxico-advierte-riesgos-para-sistema-financiero-stablecoins)) | Cross-border expansion is a licensing marathon; do not pitch "we expand to Mexico next month". |
| **EU — MiCA** | Fully applicable 30 Dec 2024; the e-money-token route is the compliant path ([MiCA](https://eur-lex.europa.eu/eli/reg/2023/1114/oj)) | The global template is reserves + redemption + disclosure. Twin's offshore structure is the arbitrage; your product should not add regulatory surface. |
| **US — GENIUS Act** | OCC final rule 21 Oct 2026, effective 18 Jan 2027 ([OCC](https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-92.html)) | The dollar-stablecoin lane is being formalized; the local-currency lane is still open. |
| **Hong Kong / Singapore / UAE / Japan** | HK e-HKD pilot completed Oct 2025 and the **Stablecoins Ordinance** register is live; Singapore's **purpose-bound money** (Orchid) and Ubin+; UAE payment-token regulation; Japan's yen stablecoins ([HKMA](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2025/10/20251028-4/)) | **Purpose-bound money** is the most under-used idea for LATAM: a peso that can only be spent on food, rent or school fees. Keep it as a second vertical, not the hackathon build. |
| **BIS — Agorá / Mariana** | Agorá: 7 central banks + 40+ FIs, tokenized commercial-bank deposits + tokenized reserves with atomic cross-currency settlement (May 2026 report); Mariana: AMM-based FX of wholesale CBDCs ([BIS Agorá](https://www.bis.org/about/bisih/topics/fintech/agora.htm), [Mariana](https://www.bis.org/project/mariana)) | The institutional world is converging on **tokenized deposits + atomic FX**. Twin's Curve pools are the retail version of Mariana; a product that uses them is directionally right. |

### 5.2 Products that actually work

- **Circle USDC / Tether USDT** — the liquidity layer; USDT is the de-facto dollar in Argentina, Venezuela and Bolivia.
- **PayPal PYUSD** — distribution inside an existing wallet; the closest analogue to **Belo + ARGt**.
- **Ripple RLUSD** — enterprise treasury and cross-border settlement.
- **Mountain USDM** — yield-bearing; reportedly distributed through Argentine platforms **[distribution in Argentina UNVERIFIED]**; a cautionary tale for the CNV line.
- **Agrotoken** — commodity-backed tokens in Argentina; proof that local real-world assets can be tokenized.
- **Belo** — consumer wallet + Mastercard + QR; **$14M Series A led by Tether** (Apr 2026), with ARGt as its core asset ([Stablecoin News](https://stablecoinnews.com/belo-raises-14m-in-a-round-with-tether/)).
- **Takenos / Wallbit** — Argentine freelancer dollar accounts; **Efy Finance** — receivables → cross-border settlement, **$5M led by Tether** on 5 Nov 2026 ([TechNode](https://technode.global/2026/11/05/panama-based-efy-finance-raises-5m-seed-round-led-by-tether-to-expand-latin-american-payments/)).
- **Bitso / Ripio / Lemon / dLocal / Mercado Pago** — the LATAM distribution and payout layer.

**Pattern:** the winners are either (a) a regulated liquidity layer, or (b) a distribution channel that makes a stablecoin invisible. A hackathon product should aim at (b): a use case that a wallet like Belo can plug in.

### 5.3 Hackathon winners and what they had in common

Verified winner lists (2025–2026):

- **ETHGlobal Buenos Aires 2025** (475 projects): Paybot (x402 unlocks physical devices, provider pays gas), Payload Exchange (a sponsor pays part of the payment), Hubble Trading Arena (x402 + ERC-8004), Halo (receipt → World ID rewards), zkx402, JetLagged, Yoga, LensMint, Aqua0, BMCP ([BlockBeats](https://www.bitget.com/news/detail/12560605081065)).
- **ETHGlobal Cannes 2026, Arc/Circle track** (69 teams): Onda ($0.01 USDC to the artist you are playing), PayMate (programmable credit pool), NanoCrawl, ETHastic (LoRa device-to-device payments), VEIL VPN, C.E.S.T.A, Predict It!, PolyPOP ([Arc blog](https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned)). The same post notes **98% of projects were agentic and 40% used Nanopayments**.
- **Chainlink Convergence 2026** (3,000+ participants): FlowVault (autonomous ERC-4626 allocator), Strevvo (revenue-based financing), Ghost Finance (private P2P lending), MaskBid, etc. ([Chainlink](https://chain.link/hackathon/winners)).
- **Aleph Buenos Aires 2026** (650 hackers, Tether WDK): Minkaly, Nana Wallet, I'm OK, Warden, BabyShark VC ([Crecimiento](https://crecimiento.build/blog/aleph-hackathon-6th-edition-en)).
- **Avalanche Build Games**: Meridian, Forg3t Protocol, The Grotto **[UNVERIFIED details]**.

The pattern is consistent:

1. **One sentence, one user, one tiny payment.** "$0.01 to the artist", "a receipt", "a flight delay".
2. **A live transaction the judge can see**, not a dashboard tour.
3. **The sponsor's primitive is the noun**, not a feature: x402, Nanopayments, CRE, WDK, World ID.
4. **A demo that moves** — hardware, a song, two phones, a camera.
5. **A business line that survives the weekend** — a fee, a spread, a pool.
6. **Friction removal beats infrastructure**: gasless, zkLogin, WhatsApp, Chrome extension.

### 5.4 The saturated lanes — and the open one

Saturated in 2025–2026: agent marketplaces and trading arenas; x402 "API that charges per call"; prediction markets; gas abstraction as the headline idea; creator micropayments; chat bots that pay; split-the-bill/payroll; cross-chain swaps/DEXs; generic multichain wallets; ERC-8004 + x402 with no named user.

Adjacent to `Aval` and already taken:

- **Cred-Fi** — income-backed, under-collateralized credit lines for humans and agents (ETHGlobal BA showcase). Adjacent, but **USD-denominated and income-backed**, not social collateral.
- **Strevvo** — revenue-based financing via CRE (Chainlink Top 12).
- **Ghost Finance** — private P2P lending with sealed-bid rates.
- **Dow Protocol** — e-commerce receivables ($10.5M raised) **[UNVERIFIED details]**.
- **Efy Finance** — receivables → cross-border settlement, $5M led by Tether.
- **PasaTanda / MiTanda / Pasacoin** — ROSCA/tanda on WhatsApp + Sui, zkLogin, yield on idle USDC (HackMoney 2026).
- **Belo / Takenos / Wallbit** — wallet, remittance and dollar accounts.

**The open lane:** every credit winner above is **USD-denominated**. None prices a **local-currency** obligation, and none uses **social collateral** as a programmable first-loss layer. A peso-denominated credit guarantee with a portable repayment record is genuinely unoccupied — and it is exactly what the Twin track's "only possible with local money" test is asking for.

---

## 6. The concept space

Six concepts, scored 1–5 on the four official criteria plus a feasibility score (1–5) for a 6-hour build by four people. The "token-core" column asks: *if you removed ARGt, would the product still work?*

| # | Concept | Idea | Problem | Business | Pitch | Feasibility | Token core? | Closest existing thing |
|---|---|---|---|---|---|---|---|---|
| 1 | **Aval** — social collateral, priced | 5 | 5 | 4 | 5 | 4 | **Yes** (income, loan, collateral, repayment all in ARGt) | Cred-Fi (USD, income-backed), informal aval (uncapped, unenforceable) |
| 2 | **La Cadena** — ROSCA with slot auction, cross-border | 4 | 4 | 3 | 5 | 4 | Partial (could be USDT) | PasaTanda, MiTanda, Pasacoin |
| 3 | **La Factura** — programmable receivables for SMEs | 4 | 5 | 5 | 3 | 3 | **Yes** (ARS invoice, ARGt settlement) | Efy, Dow, factoring platforms |
| 4 | **El Sueldo** — earned-wage access with portable history | 3 | 5 | 4 | 4 | 3 | **Yes** (wages are in ARS) | DailyPay/Wagestream, fintech advances |
| 5 | **El Mandato** — agent payments with on-chain limits | 3 | 4 | 4 | 5 | 3 | Partial (could be USDC) | Hubble, Paybot, x402 lane |
| 6 | **La Cámara** — B2B multilateral netting across LATAM currencies | 5 | 4 | 4 | 3 | 2 | **Yes** (seven currencies, same rail) | correspondent banking, CLS |

### Why the ranking

- **Aval** wins because it is the only concept that is simultaneously (a) an open lane, (b) emotionally legible in 30 seconds, (c) buildable in one contract and three screens, and (d) impossible to tell without the local unit.
- **La Cadena** has the best story and the best demo, but two problems: **PasaTanda/MiTanda already exist**, and at 33% inflation a peso savings circle is economically hostile. It can be fixed by making the circle short-cycle and purpose-bound, but that weakens the story.
- **La Factura** has the best business model and the strongest token-core argument, but it is a crowded space (Efy just raised $5M from Tether) and the demo is abstract.
- **El Sueldo** is a real pain, but earned-wage access is a known product and the regulatory surface (lending) is larger.
- **El Mandato** is the repo's current plan. It is strong on Avalanche and weak on the Stablecoins "token core" test; it is also the most saturated lane in the winner lists.
- **La Cámara** is the most intellectually original, but it cannot be demoed convincingly in six hours.

---

## 7. Recommended concept: **Aval**

> **"Rosa no tenía garantía. Tenía una red."**
> *Aval turns a borrower's social network into a priced, enforceable, portable guarantee — in pesos.*

### 7.1 The user and the story

**Rosa, 44, La Matanza.** She washes and irons for several families; she is one of the 43% of Argentine workers who are informal (5.8 M people), with no payslip and no verifiable income. She wants to buy a used moto to take on delivery work: **ARGt 300,000** (≈ USD 200–250 depending on the month's FX). The bank asks for a property guarantor; she rents. A fintech offers her **120% TNA**. A "friend" offers cash at 10% per week.

What she does have: a daughter, **Lucía**, who works registered at a pharmacy, and a neighbor, **Don Alberto**, who has known her for twelve years and runs a kiosco. They trust her. Today that trust is worth nothing to a lender: it is uncapped, unwritten and unenforceable.

**The insight:** the collateral the bank is looking for already exists — it is just not legible. `Aval` makes it legible, caps it, prices it and enforces it.

### 7.2 The mechanism

1. **Request.** Rosa creates a loan request: principal, term, purpose, and the guarantee target (e.g. 30% of principal). Her on-chain `legajo` (empty at first) is attached.
2. **Avales.** Lucía and Don Alberto each accept a slice of the guarantee. Each locks ARGt in the contract (e.g. 15% each) and sets a fee for the risk (e.g. 6% of principal, annualized or per loan). The stake is locked until the loan ends; it cannot be withdrawn.
3. **Pricing.** The contract (or a simple on-chain quote function) reduces the lender's rate as coverage rises: `apr = base − (base − floor) × coverage`. With 0% coverage, 120%; with 30% first-loss coverage, ~45%. The lender sees the risk grade and funds.
4. **Disbursement.** The lender's ARGt goes to Rosa; the principal, the guarantee and the fee schedule are recorded atomically. No notary, no paper, no lawyer.
5. **Repayment.** Rosa pays in ARGt on schedule. The waterfall is automatic: lender principal + interest → avalista fees → Rosa's change. On full repayment, the stakes are released and the `legajo` updates (on-time count, volume, streak).
6. **Default.** If Rosa misses the due date plus a grace period, anyone can call `markLate`; after the grace, `seize` moves the aval stake to the lender up to the outstanding amount. The avalistas lose only what they put in — never more — and the `legajo` records the event.
7. **Portability.** Rosa's next loan needs less guarantee and costs less, because the `legajo` is a credential any lender can verify. The guarantee market becomes a credit market.

**The key design choice:** the aval is a **capped first-loss tranche**, not an unlimited personal guarantee. That is what makes it insurable, priceable and fair. It is also what distinguishes it from the informal "aval" that ruins families.

### 7.3 Why local currency is load-bearing

| If the loan is in… | What happens to Rosa | What the lender prices |
|---|---|---|
| **USDT / USD** | A 30% peso depreciation raises her debt by 30% in real terms; she can pay every installment and still default economically | FX risk + credit risk |
| **ARGt** | Her income, her obligation and her collateral are in the same unit; a peso depreciation does not change the real burden | **Credit risk only** — which is exactly what the aval is for |

This is the "remove the token and the product breaks" test. A dollar version of `Aval` is a worse product for this user, not a neutral variant: it adds a currency bet that the guarantee cannot cover. The local unit is what makes the risk *underwritable*.

### 7.4 Architecture and contracts

**Chain:** Arbitrum One (chain id 42161) for Option A. Real ARGt (`0x59863989d080B22476DB95656d0C3CC18be92214` **[verify with Twin]**), low fees, documented Curve/Morpho rails. Avalanche C-Chain mainnet for Option C.

**Contracts (Foundry, Solidity 0.8.24):**

```
AvalBook.sol
  struct Request {
      address borrower;
      uint256 principal;        // ARGt, 18 dec
      uint16  termDays;
      uint16  coverageTargetBps;// e.g. 3000 = 30%
      uint16  baseAprBps;       // 12000 = 120%
      uint16  floorAprBps;      // 4500  = 45%
      uint8   state;            // Open, Funded, Repaid, Late, Seized
      uint64  dueDate;
      uint256 avalStaked;
      address[3] avalistas;
      uint256[3] avalAmounts;
      uint16[3]  avalFeeBps;
  }

  createRequest(principal, termDays, coverageTargetBps, baseAprBps, floorAprBps)
  stake(requestId, amount, feeBps)        // avalista; ERC20 transferFrom; max 3
  fund(requestId)                          // lender; pays principal to borrower
  repay(requestId, amount)                 // borrower; waterfall
  markLate(requestId)                      // after due + grace
  seize(requestId)                          // after grace; aval -> lender up to outstanding
  quoteApr(coverageBps, base, floor) view
  legajo(address) view -> (loans, onTime, late, seized, volume)
```

**Design rules:**
- `SafeERC20`, `ReentrancyGuard`, checks-effects-interactions, pull-over-push where possible.
- Cap avalistas at 3 (gas, simplicity); no unbounded loops.
- State machine enforced in every function; `seize` cannot double-pay.
- Protocol fee 1.5% of principal, taken at funding, sent to a treasury address (disclosed in the README).
- Interest: simple, `principal × aprBps × termDays / 365 / 10000`.
- `quoteApr` is a *view* function so the UI can show the "120% → 45%" moment without a server.
- Events for everything the UI needs: `RequestCreated`, `Staked`, `Funded`, `Repaid`, `Late`, `Seized`, `LegajoUpdated`.

**Optional (only if time):** `LegajoSBT` (ERC-5192) or a signed JSON credential; a `DemoClock` contract to advance due dates; a `PriceView` using the Belo API off-chain for display only.

**Frontend (Next.js 14 + wagmi + viem + RainbowKit + Tailwind):**
- **Borrower view:** request form (amount, term, purpose), invite link/QR for avalistas, timeline (Open → Funded → Repaying → Closed), schedule, `legajo` card.
- **Avalista view:** request card with the borrower's `legajo`, stake slider, expected fee, risk disclosure, "Avalar" button.
- **Lender view:** pool dashboard, request list with coverage/APR, "Fund" button, portfolio.
- **Public `legajo` page:** score, on-time %, volume, loans; shareable link.
- **Demo mode:** seeded accounts, one-click actions, a "stress test" toggle that marks a payment late and runs `seize` on a *separate* demo request (never on the happy path).

**Testing:**
- Foundry unit tests: happy path, late payment, seizure, double-stake, over-coverage, fee accounting, reentrancy.
- One **fork test** against Arbitrum with real ARGt (read-only) — a strong README proof.
- A `script/Deploy.s.sol` + `script/Seed.s.sol` + `script/Demo.s.sol`.

### 7.5 Demo choreography (90 seconds)

| Time | Screen | Action | What the judge sees |
|---|---|---|---|
| 0:00 | Slide | "Rosa, 44, sin recibo de sueldo. Pidió $300.000. Le ofrecieron 120%." | the person, the number, the pain |
| 0:15 | Rosa's phone | Request already created; `legajo` empty; "cobertura 0% → tasa 120%" | the problem in one number |
| 0:25 | Lucía's phone | Slide to 15%, tap **Avalar**; tx confirms | a real ARGt stake, a real hash |
| 0:40 | Don Alberto's phone | Same, 15%; coverage 30%; the rate card flips to **45%** | the pricing moment |
| 0:55 | Lender dashboard | Tap **Fund**; ARGt lands in Rosa's wallet; tx hash | the money moves |
| 1:05 | Rosa's phone | Tap **Pagar cuota**; waterfall animates: lender, Lucía, Alberto | the repayment is automatic |
| 1:15 | `legajo` page | Score ticks up; "próximo préstamo: 10% de aval, 38%" | the compounding |
| 1:25 | Slide | "Stress test: si Rosa no paga, el aval se ejecuta solo." | the guarantee is real |
| 1:30 | Close | "El banco pide garantías. Nosotros las creamos." | the line |

**Rules for the demo:** pre-seed the request and one stake; do only the second stake, the funding and one repayment live; have a recorded video of the full flow; put every hash on a slide; never run the seizure live on the happy path.

### 7.6 Business model and unit economics

**Who pays:** the lender (risk-transfer fee), the avalista (a share of the fee), and later the wallet/credit union (SaaS).

| Revenue line | Price | Payer | Why |
|---|---|---|---|
| Guarantee fee | **1.5–2.5% of guaranteed principal** | lender | replaces part of the loss-given-default and the collection cost |
| Avalista fee share | **10–15% of the avalista fee** | avalista | marketplace take rate |
| SaaS / dashboard | **USD 200–500 / month per institution** | credit union, fintech, wallet | risk analytics, `legajo` API |
| Expansion: rental guarantees | **2–3% of annual rent** | landlord/tenant | the same primitive, 10–40× larger tickets |
| Expansion: supplier guarantees | **1–2% of invoice** | SME / supplier | trade credit with social collateral |

**Illustrative unit economics [ASSUMPTION]:** a USD 250 loan at 2% = USD 5 of revenue; to reach USD 50k/month you need ~10,000 loans/month. That is a real fintech, not a weekend. The honest pitch is: **micro-credit is the wedge; rental and supplier guarantees are the revenue.** A rental guarantee on a USD 1,000/month apartment (USD 12,000/year) at 2.5% = USD 300 per policy — 60 micro-loans of revenue in one contract. That is the business.

**Why now:** 43% informality, 29.6% fintech delinquency, 20.9 M debtors, 5.8 M in arrears, credit at 60–120% TNA, and a distribution channel (Belo) that already holds ARGt for a large Argentine user base **[UNVERIFIED user count]**. The supply of credit is not the bottleneck; the *risk information* is.

### 7.7 Competition and moat

| Competitor | What they do | Why `Aval` is different |
|---|---|---|
| Banks / fintechs | lend against payslips or scoring | Rosa has no payslip; the aval is the missing collateral |
| Informal aval | a friend signs | uncapped, unenforceable, unpriced, socially destructive |
| Cred-Fi | income-backed credit lines (USD) | income-backed, not social-collateral; USD |
| PasaTanda / MiTanda | ROSCA savings circles | savings, not credit; no guarantee pricing |
| Seguro de caución | rental guarantee with property | requires a property; `Aval` uses ARGt and a network |
| Pawn shops / "financieras" | cash at 10%/week | 10× cheaper, transparent, portable |

**Moat:** a two-sided data network. Every loan produces a repayment record and an aval relationship; that data prices the next loan better than any bureau, because it captures the informal economy that bureaus cannot see. The `legajo` is portable, so the borrower carries the moat with her — which is also the ethical design.

### 7.8 Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Regulatory** (guarantees/lending) | Do not lend, do not take deposits, do not promise yield. `Aval` is infrastructure sold to licensed lenders; the contract enforces a private guarantee between consenting adults. Say this on slide 2 and in the README. |
| **Adverse selection / collusion** | Cap the aval at 30%; require 2+ avalistas; limit exposure per avalista; identity verification (KUMPLY on Avalanche, lender KYC on Arbitrum); a `legajo` that prices history. |
| **Social pressure** | Capped first-loss (never unlimited), a cooling-off period, a clear "you can lose this amount" disclosure, and a rule that the avalista's stake is never more than she can afford. This is a product ethics decision, not a disclaimer. |
| **Smart contract** | No audit available in 6 h; keep the contract small, add tests, disclose "unaudited demo" in the README. |
| **Issuer / depeg** | Disclose the reserve mix and the upgradeable proxy; do not custody funds longer than the loan; allow the lender to refuse ARGt. |
| **Demo** | Pre-seed, rehearse 3×, record a backup video, put hashes on slides, never depend on live gas. |
| **Liquidity** | The amounts are small; the lender is a known counterparty; no AMM slippage in the core flow. |

### 7.9 Why this jury will like it

- **Twin:** it extends ARGt from *payments* to *credit*, which is a much bigger TAM, and it does so without a yield promise — the exact line the CNV drew.
- **Belo:** it gives the wallet a reason to keep ARGt balances and a credit product to sell; the borrower and the avalistas are all wallet users.
- **Digital House:** it is a fintech product with a social story and a clear demo; good for the demo day.
- **Avalanche (if Option C):** KUMPLY is the Sybil resistance the product needs (who can be an avalista?) and 0xGasless is the onboarding Rosa needs; both are core, not decorative — but note the Fuji/mainnet split above before promising the bonus.
- **Tether:** more ARGt velocity and more USDT-settled reserve demand; a credit product that uses local currency is complementary to USDT, not competitive.

---

## 8. Runner-up: **La Cadena** (and why not primary)

> **"La cadena de ahorro de tu familia, sin la persona que la maneja."**

A rotating savings circle (ROSCA) — *pasanaku* in Bolivia, *tanda* in Mexico, *natillera* in Colombia, *cadena* in Argentina — with three twists: (1) the slot order is **auctioned**, so the discount members bid for the early pot becomes a market-discovered peso interest rate; (2) the circle can be **cross-border**: members in Buenos Aires pay ARGt, family in El Alto receives BOLt via the Curve route; (3) the on-time record becomes a **portable credit passport**.

**Why it is a great story:** everyone in Latin America has a family member in a "cadena"; the organizer risk is real; the demo is a circle of avatars and a pot that moves; the cross-currency leg uses the one thing Twin has that nobody else does (seven local currencies on the same rail).

**Why it is not the primary pick:**

1. **Direct precedent:** PasaTanda (HackMoney 2026, WhatsApp + Sui), MiTanda, Pasacoin — the judges may have seen it.
2. **Inflation:** at 33% y/y in Argentina, a 12-month peso savings circle destroys value for the late recipients; the auction prices it, but the pitch has to explain why anyone would save in pesos. That is a hard 30 seconds.
3. **Business:** fees on small pots are thin; the real business is credit, which is `Aval`.
4. **Token-core test:** the circle could be denominated in USDT; the local currency is a choice, not a necessity.

**When to pick it instead:** if the team is stronger at frontend animation than at credit/legal, and if the ARGt-on-Avalanche gate fails (the cross-border BOLt leg is the differentiator). It is a strong second choice, not a weak one.

---

## 9. Build plan for today (7 November)

### 9.1 Roles (4 people)

| Role | Owns | Deliverable by |
|---|---|---|
| **P1 — Contracts** | `AvalBook.sol`, tests, deploy, verify on Arbiscan, seed script | contract verified by 13:30 |
| **P2 — Borrower + avalista UI** | request, invite, stake, status, repayment | end-to-end by 15:00 |
| **P3 — Lender + legajo + design** | lender dashboard, public `legajo`, visual system | by 15:30 |
| **P4 — Narrative + ops** | deck, script, video, README, sponsor liaison, ARGt/gas, submission | deck by 16:30, video by 16:00 |

### 9.2 Timeline (hard stops)

| Time | Milestone | Kill criterion |
|---|---|---|
| 10:50 | Concept locked; repo branch; wallets created; **ask Twin for ARGt + gas** | — |
| 11:15 | Contract skeleton compiles; UI shell runs | — |
| 12:00 | `create` + `stake` + `fund` pass in Foundry | if not: cut to a single-contract escrow, drop the SBT |
| 13:30 | **First real ARGt transfer on Arbitrum** (deploy + fund); hash saved | if no ARGt: use a test token for the flow and one real ARGt tx for the fee; disclose |
| 14:30 | End-to-end in the UI (create → 2 stakes → fund → repay) | if not: script + one screen, record video |
| 15:30 | Seizure/stress test + `legajo` page | if not: slides only |
| 16:00 | Rehearsal #1; **record backup video** | — |
| 16:30 | Deck final; README with addresses + hashes | — |
| 17:00 | Rehearsal #2; **code freeze** | — |
| 17:15 | Repo public; README; submit | — |
| 17:45 | Buffer; final checks | — |

### 9.3 The first 60 minutes checklist

- [ ] Confirm with the organizers: dual submission allowed? Blockchain deadline also 18:00?
- [ ] Confirm with Twin mentors: ARGt on Arbitrum (address, decimals), test balance, and whether ARGt exists on Avalanche C-Chain mainnet.
- [ ] Create 4 burner wallets; fund with ETH on Arbitrum (gas) and ARGt (test).
- [ ] Create the repo (public at submission), the `README.md` skeleton, and the `docs/` folder.
- [ ] Write the 6-line pitch before writing code: *"Rosa earns in pesos, has no payslip, and needs 300,000 for a moto. Banks ask for a property guarantor. Aval lets two people who trust her lock 30% of the loan in ARGt; the lender cuts the rate from 120% to 45%; if she pays, they earn; if she doesn't, the contract pays the lender and they lose only what they put in. The bank asks for guarantees. We create them."*
- [ ] Put the tx hash requirement on the wall: nothing else matters until there is a real ARGt transfer.

### 9.4 README skeleton (write it now, fill it later)

```
# Aval — social collateral, priced on-chain
## What it is (3 lines)
## The problem (Rosa, 43% informality, 29.6% delinquency)
## How it works (diagram)
## Token(s), chain, contract addresses
## The on-chain transaction (hash + explorer link)
## What was built at HackaTwin (vs. boilerplate)
## Architecture
## How to run / deploy
## Demo script
## Business model
## Risks and limitations (unaudited, demo attestations, issuer risk)
## Regulatory note (no yield, no deposits; guarantee infrastructure)
## Team
```

### 9.5 Demo reliability checklist

- [ ] 4 wallets, 4 browser profiles, all pre-funded.
- [ ] One request pre-created and one stake pre-confirmed.
- [ ] The live path is: second stake → fund → one repayment. Nothing else.
- [ ] Every tx hash copied into the deck and the README.
- [ ] Backup video recorded at 16:00, playable offline.
- [ ] A local Anvil fork as the last-resort demo (clearly labeled).
- [ ] No live dependency on the Belo price API; use a hard-coded display rate with a note.

---

## 10. Pitch script (3 minutes) and Q&A

### 10.1 Script

**[0:00–0:25] The person.**
"Rosa tiene 44 años, lava y plancha en La Matanza. Cobra por día, no tiene recibo de sueldo. Quiere comprar una moto para repartir: $300.000. El banco le pidió un garante con propiedad. No tiene. Una fintech le ofreció 120% de interés."

**[0:25–0:50] The insight.**
"Pero Rosa sí tiene garantía. Su hija cobra en blanco. Su vecino la conoce hace doce años. Esa garantía existe, pero no se puede ejecutar: es una firma en un papel, sin tope, sin precio y sin juez. Nosotros la convertimos en código."

**[0:50–2:00] The demo.**
"Rosa pide $300.000 en ARGt. Lucía pone el 15% en garantía. Don Alberto pone otro 15%. Miren la tasa: 120% sin aval, 45% con aval. El prestamista fondea: la plata sale del contrato a la billetera de Rosa. Rosa paga la primera cuota: el contrato reparte solo — capital e interés al prestamista, comisión a Lucía y a Alberto. Si Rosa no paga, el contrato ejecuta el aval: el prestamista cobra, y ellos pierden solo lo que pusieron. Y el legajo de Rosa queda on-chain: el próximo préstamo le sale más barato."

**[2:00–2:30] Why it only works here.**
"Si el préstamo fuera en dólares, Rosa estaría apostando al tipo de cambio: una devaluación del 30% le sube la deuda 30% aunque pague todas las cuotas. En pesos, el riesgo es solo de crédito — y eso es exactamente lo que el aval puede cubrir. El token local no es un detalle: es lo que hace que el riesgo sea asegurable."

**[2:30–3:00] Business and close.**
"Vendemos la capa de garantía a mutuales, fintechs y billeteras. Cobramos 2% del capital garantizado. Empezamos con microcrédito; el mismo contrato sirve para garantizar alquileres y crédito entre proveedores, donde los tickets son diez veces más grandes. El banco pide garantías. Nosotros las creamos."

### 10.2 Q&A prep

| Question | Answer |
|---|---|
| "Why not USDC?" | Currency mismatch: Rosa earns in pesos; a dollar loan adds an FX bet the guarantee cannot cover. ARGt leaves only credit risk, which is what the aval prices. |
| "Isn't this just a guarantor?" | A guarantor is uncapped, unpriced, unenforceable and unportable. `Aval` is capped (first-loss), priced (the avalista earns a fee), enforced (the contract seizes) and portable (the `legajo`). |
| "What if Rosa and her avalista are the same person?" | Identity verification (KUMPLY on Avalanche, lender KYC on Arbitrum), exposure caps, 2+ avalistas, and a `legajo` that prices history. |
| "What if she defaults?" | The aval covers the first loss; the lender keeps the senior risk. The avalista loses only her stake. The `legajo` records it. |
| "Why would anyone be an avalista?" | A fee for local information she already has, capped risk, and a diversifiable portfolio across several borrowers. It is underwriting with neighborhood knowledge. |
| "Regulation?" | We do not lend, take deposits or promise yield. We sell guarantee infrastructure to licensed lenders. After the CNV case, we deliberately avoided anything that looks like an investment product. |
| "How do you make money?" | 1.5–2.5% of guaranteed principal + a share of the avalista fee + SaaS. Micro-credit is the wedge; rental and supplier guarantees are the revenue. |
| "Why now?" | 43% informality, 29.6% fintech delinquency, 20.9 M debtors, ARGt rails and Belo distribution. The bottleneck is risk information, not capital. |
| "What's the moat?" | A two-sided data network: every loan produces a repayment record and an aval relationship that no credit bureau can see. The `legajo` is portable, so the borrower carries it. |
| "What did you build today?" | `AvalBook.sol`, the three views, the `legajo`, the deploy and the live tx. Everything else is boilerplate, and the README says so. |

---

## 11. Appendix

### 11.1 Verified addresses and endpoints (track PDF + Twin docs, 25 Aug 2026; verify `symbol()`/`decimals()` at runtime)

**Arbitrum One (chain 42161):**

| Token | Contract | Curve pool vs USDT0 | Morpho vault |
|---|---|---|---|
| ARGt | `0x59863989d080B22476DB95656d0C3CC18be92214` | `0x356d349da9add7efb56a35fab939a2c6d852f853` | `0x9Dd3F844747AB78d616BF76DB92756E17A064aDD` |
| BRAt | `0xC4ed6Aba5373D78E160F4df39e011F078Be54df8` | `0xeef48df5f1c509cd9730774b4e8a4464626ef8d5` | `0x207396cbe2f6f50670eaa69584c9f723924c7fe9` |
| COLt | `0xa16d5DB80A45157E0e451750B81FF0CC0b61d558` | `0x7d2dffa9e903b8377c96196da424c7965b06bcc3` | `0x596FD4C6cAb1aeBCe2a847773Ca87F24349D0c56` |
| PERt | `0x899438713f62B04d6CD8e8709986F7256fB6E3d9` | `0x41af8cc0811dd07f167752b821cf5b11dba7ca85` | `0x5eD1aeFACb3B6CCC3F924B1d8915754Ed780266F` |
| MEXt | `0xb96aA6babCcD738d6644ADd4912fE5eFbEBF5a25` | `0x6edbf3ada7b6d9524c3248955538d573aae449cf` | `0x3046bc254bD2269eC5C3478692be619441Bb11A5` |
| CHLt | `0xe8dbC4680235cCAeFf48e4C0B0EaceeBb89E5e17` | `0xa087f05ecd245476d7844f6eab28d98724696ac2` | `0xb5cd19e8e884e8e0e6dD8eDF54C172BD865A7BAd` |
| BOLt | `0x1edF5E61B6a4Fe19FEf3A695328F61aAa07728eA` | `0x9c7809c813bcc67e288c56d5ce5e0225996bfcd2` | `0x8dE92AFea0266A67c451b5AD1318bc0A9d834a7E` |
| PRYt | `0x6Bb883b61D58f3531cd2e15563F2CDd0E9B24E32` | — | — |
| URYt | `0x2eCC8c60C881436D43b9AE8EEC7bc226D5404E71` | — | — |
| VENt | `0x8c4106beE19CB995abab20f3De6Ba9DF9CF9A17f` | — | — |

**Infrastructure on Arbitrum:** Oracle `0x5Eaa8760c3290eb78A2BE5E33b6696bE42e47DD9`; USDC `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`; USDT `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`. **Docs:** [contracts](https://docs.twin.finance/stablecoins/contracts), [chains](https://docs.twin.finance/stablecoins/supported-chains), [bridge](https://docs.twin.finance/stablecoins/bridge), [PoR](https://cdn.twin.finance/Proof%20of%20Reserves/stablecoins/PoR-260930-en.pdf).

**ARGt LayerZero OFT adapters:** Ethereum `0x5Eaa8760c3290eb78A2BE5E33b6696bE42e47DD9` (EID 30101), Polygon `0xD70ad085684b2A9f4B5d54D7BDB2ecA37a273216` (30109), Base `0xe80Af1d12426dB4394b147e04f179a38e7C5Dfe7` (30184), Arbitrum `0x4821FBf47B261F0D52Ba0F941CF67b8648f82691` (30110). The bridge is live for ARGt between Arbitrum, Base, Polygon and Ethereum; **not** Avalanche.

**Other:** price API `https://api.belo.app/public/price`; logos `https://assets.twin.finance/media/tokens/32x32/<TICKER>.svg`; Discord `discord.gg/whU99xqnZ`; Twin transparency `https://www.twin.finance/transparency`; whitepaper `https://cdn.twin.finance/docs/TwinStablecoins_Whitepaper_v1.pdf`.

**Footgun:** the same address can be a different token on another chain (`0x5986…2214` = ARGt on Arbitrum/Ethereum, MEXt on Base, BRAt on Polygon). Read `symbol()` and `decimals()` at runtime.

### 11.2 Open questions to resolve at the venue

1. Can the same project be submitted to both tracks? Is the Blockchain deadline also 18:00?
2. Does ARGt exist on Avalanche C-Chain mainnet, and can Twin provide a test balance?
3. How much test ARGt can Twin provide on Arbitrum, and at what address/decimals?
4. Is there a code audit for the ARGt proxy? (None found.)
5. Are the Fuji KUMPLY attestations issued by staff only, and how long does it take?
6. Does the public three-track listing (AI / Blockchain / Fintech) change the Stablecoins track's scope or prize?

### 11.3 Sources

Primary: `track twin.pdf` (transcribed in `docs/strategy/source/track_twin.txt`), `HackaTwin — Blockchain Track Rules and Requirements (EN).docx.pdf` (transcribed in `docs/strategy/source/blockchain_track.txt`), Twin transparency page, Twin whitepaper, Belo help center.

Regulatory and macro: [CNV order, 17 Mar 2026](https://cointelegraph.es/news/argentina-la-cnv-ordeno-suspender-la-oferta-y-negociacion-de-la-stablecoin-argt); [CNV lifts, 21 Apr 2026](https://cointelegraph.es/news/cnv-de-argentina-levanto-suspension-sobre-la-stablecoin-argt); [Belo $14M led by Tether](https://stablecoinnews.com/belo-raises-14m-in-a-round-with-tether/); [BIS Agorá](https://www.bis.org/about/bisih/topics/fintech/agora.htm); [BIS Mariana](https://www.bis.org/project/mariana); [Drex pivot](https://exame.com/future-of-money/o-que-vai-acontecer-com-o-drex-em-2026-mudancas-nova-fase-projeto/); [BCRA freeze](https://www.diariobitcoin.com/argentina/argentina-congela-por-dos-anos-la-integracion-de-criptomonedas-en-bancos-y-pagos/); [Bolivia BCB](https://www.bcb.gob.bo/?q=content/en-cuatro-meses-uso-de-activos-virtuales-supera-los-us75-millones-y-dinamiza-el-sistema-de-1); [MiCA](https://eur-lex.europa.eu/eli/reg/2023/1114/oj); [OCC GENIUS rule](https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-92.html); [HKMA e-HKD](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2025/10/20251028-4/).

Hackathon evidence: [ETHGlobal BA winners](https://www.bitget.com/news/detail/12560605081065); [Arc Cannes winners](https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned); [Chainlink winners](https://chain.link/hackathon/winners); [Aleph recap](https://crecimiento.build/blog/aleph-hackathon-6th-edition-en); [PasaTanda](https://ethglobal.com/showcase/pasatanda-c3f0w); [Cred-Fi](https://ethglobal.com/showcase/cred-fi-tguaw); [Efy Finance](https://technode.global/2026/11/05/panama-based-efy-finance-raises-5m-seed-round-led-by-tether-to-expand-latin-american-payments/); [ETHGlobal rules](https://ethglobal.com/events/ethonline2026/info/details).

Local evidence: `docs/ideas/investigacion/DOLORES.md` (INDEC, CEPA/BCRA, Inquilinos Agrupados, Fundación Observatorio PyME, BCRA); `docs/ideas/investigacion/GANADORES.md`; `docs/investigacion/BRIEFING_2026-11-07.md`; `docs/investigacion/stablecoin-latam-briefing-2026-11.md`.

---

*This memo is analysis, not legal or investment advice. The regulatory perimeter for guarantees and lending in Argentina is fact-specific; validate the structure with counsel before any commercial launch.*
