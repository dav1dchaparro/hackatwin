# HackaTwin 2026 — Proposal
## **Aval** — the on-chain guarantee layer for Latin America's credit guarantee institutions

**Prepared:** Saturday 7 November 2026, Buenos Aires · **Event:** Digital House, Monroe 860, 08:00–21:00 · **Submission closes:** 18:00 · **Demo day:** 19:00 · **Team:** up to 4
**Recommended track:** **Twin Stablecoins — single track.** **Chain:** Arbitrum One. **Token:** ARGt.
**Status of evidence:** every external claim is linked; anything I could not verify against a primary/dated source is marked **[UNVERIFIED]** or **[ASSUMPTION]**.

---

## 0. Executive summary

**The decision.** Build **one** product for the **Stablecoins** track. Do not split the team across two tracks. The two rubrics reward opposite things — Twin gives 25% of the score to "the local token is the core, not decoration", Avalanche gives 25% to "the product uses Avalanche's own capabilities" — and the only dual-track version that is not self-defeating requires a real ARGt balance on Avalanche plus an Avalanche-native capability in the core flow. Neither is confirmed, and one of them (KUMPLY) is Fuji-only, so a mainnet contract cannot read it. A second deployment costs 1.5–3 hours of a 9-hour build and doubles the failure surface of the demo, which is 50% of the Stablecoins score. The expected value of dual is only positive if the second submission is nearly free; it is not (§2).

**The concept.** **Aval** turns a guarantee — *el aval* — into a first-class on-chain primitive: a **transferable guarantee certificate** backed by a **risk pool denominated in ARGt**, issued by an existing **SGR** (Sociedad de Garantía Recíproca) or mutual, consumed by any lender, and priced by the repayment record of the borrower.

The user story stays human: **Rosa, 44**, runs a kiosco in La Matanza, is a monotributista, has no property and no payslip. She needs **ARGt 3,000,000** for inventory. A bank asks for a property guarantee; a fintech offers **90% TNA**. Her cooperative — an SGR with a risk fund — can guarantee **50%** of the loan. Today that guarantee is a paper certificate that takes weeks, cannot be verified by a lender in another province, and cannot be sold or reinsured. With Aval it is minted in seconds, verified by any lender, and **the rate falls from 90% to 45%**. If Rosa defaults, the pool pays the lender automatically and Rosa's `legajo` records it.

**Why this is the open lane.** Every on-chain credit winner of 2025–26 that I could verify is **USD-denominated** — unsecured lending or credit-adjacent (Cred-Fi, Strevvo, Ghost, Dow, Efy). The category of **guarantees** — the instrument that actually unlocks bank credit for small firms in Argentina, Chile, Korea, Japan and Germany — has no on-chain product in LATAM. The closest public work I found is a 2026 academic framework (BLINK), not a company. And on **2 June 2026** Argentina published **Resolución 94/2026**, which requires SGRs that use electronic guarantee contracts to do so on a **blockchain-associated support** for identity validation and transaction security. The regulation just created the demand; nobody has shipped the product.

**Why local currency is load-bearing.** The guarantee covers a **peso** obligation, the risk fund is accounted in **pesos**, and the SGR's regulatory capital is in **pesos**. A USDT-denominated pool would make the SGR take an FX position against its own guarantees: a 30% devaluation moves the coverage ratio, not just the borrower's burden. ARGt keeps income, obligation, collateral and accounting in the same unit. Remove ARGt and the product is not "a dollar version" — it is a different, worse product (§4.3).

**The business.** Sell the guarantee rail to the **~50 SGRs and mutuals [VERIFY]** that already exist, not to consumers: SaaS (USD 1,000–3,000/month) plus **10–25 bps of guaranteed volume** plus a take rate on ceded guarantees. One mid-size SGR guaranteeing ARS 30,000M/year at 15 bps is ~USD 30k/year at ~ARS 1,500/USD; thirty of them is ~USD 900k ARR before the secondary market and the float. The regulatory mandate is the wedge; the risk-fund float and the secondary guarantee market are the business.

**What to build in the next 7 hours.** One Solidity core (`GuaranteePool` + `GuaranteeCertificate` + `LoanBook` + `Legajo`), three screens (SGR, borrower, lender), one seeded demo, one real ARGt transaction hash. The hash is the deliverable that cannot be faked; protect it above every feature (§6).

---

## 1. What the documents actually say

I re-extracted both PDFs with a position-aware parser because the original text extraction interleaved glyphs from different text blocks; the clean transcriptions are in `docs/strategy/source/blockchain_track.txt` and `docs/strategy/source/track_twin.txt`. The rules below are quoted from those clean extractions, not from a summary.

### 1.1 The event

| Item | Fact | Source |
|---|---|---|
| Date / place | **Sat 7 Nov 2026**, 08:00–21:00, Digital House, Monroe 860, CABA | [Luma listing](https://luma.com/cudf7cqz), [mirror](https://foundercal.com/events/hackatwin-BSgYLj4RNzBmKBw) |
| Format | ~100 builders, teams ≤4, 12-hour build, mentors on site, demo day + awards | same |
| Agenda | 08:00 accreditation · **09:00 kickoff** · **18:00 submission** · **19:00 demo day** · 21:00 close | same |
| Tracks (public listing) | **AI · Blockchain · Fintech** | same |
| Twin's own track PDF | **"HackaTwin · Track Stablecoins"**, prize **500 USDT + merch** | `track twin.pdf` |
| Presenters | Twin, Bitgo, Digital House, Belo, Tether, Team1 Avalanche | listing |
| Partners | Vercel, Firecrawl, Paisanos, Monster, Mathienzo, Plugin | listing |

**Discrepancy to resolve at kickoff:** the public listing advertises three tracks (AI / Blockchain / Fintech), while Twin's PDF describes a **Stablecoins** track with its own prize and rubric. The most likely reading is that the Twin "Stablecoins" track is the Fintech track sponsored by Twin, but this must be confirmed on the record before 10:00 **[UNVERIFIED]**. It does not change the recommendation: the Twin rubric is the one that rewards a local-currency product, and it is the only one with a disclosed prize.

### 1.2 The Stablecoins rubric (Twin)

**The ask:** *"Construí en 9 horas un producto que explore qué se puede hacer con moneda local en una infraestructura programable y componible, usando las Twin Stablecoins, con al menos una transacción onchain real en la demo."*

**Scoring:** each criterion 1–5, equal weight, final score = average over 100. The four criteria are **Idea · Problem · Business · Pitch**. The Idea criterion is explicit: *"Que sea original y aproveche lo que solo es posible con moneda local onchain. Las Twin Stablecoins tienen que ser el núcleo del producto, no un agregado decorativo."*

**Deliverables (hard):** public repo with README (token(s), chain, contract addresses); **≥1 on-chain tx hash** executed by the product, verifiable in the explorer; working demo; 3-minute pitch + 2 minutes of Q&A; the product logic must be built **during** the event (boilerplate/libraries allowed, with a README that separates what was built).

**Triggers Twin suggests (not limits):** (1) agentic payments with user-defined limits; (2) merchant working capital with on-chain collection scoring and repayment as a percentage of sales, using **Morpho** vaults; (3) FX between local currencies via **Curve** pools, or hedging.

**The trap:** the triggers are suggestions, and several teams will build them literally. The rubric rewards originality and "token as core", not obedience. A fourth "agent with limits" is compared to the other three.

**The assets (from the PDF):** seven ERC-20 tokens (ARGt, BRAt, COLt, PERt, MEXt, CHLt, BOLt), 18 decimals, upgradeable beacon proxy, permissionless transfers; chains Arbitrum, Base, Polygon, Ethereum, Avalanche; **Curve** pool per token vs USDT0 and **Morpho** vault per token on Arbitrum; LayerZero V2 OFT bridge, live for ARGt between Arbitrum, Base, Polygon and Ethereum (**not** Avalanche); price API `api.belo.app/public/price`; a documented footgun — the same address can be a different token on another chain, so always read `symbol()` at runtime.

### 1.3 The Blockchain rubric (Avalanche)

**Six mandatory requirements; missing one = not eligible:** (1) a smart contract on Avalanche — Fuji or mainnet, C-Chain or own L1 — **verified** in the explorer; (2) an end-user **web or mobile UI** wired to the contracts (CLI/bot does not count); (3) a documented **"why Avalanche"** — valid examples: time to finality, custom L1 configuration, compliance/privacy for institutional use cases, **ICM**; (4) a business model (problem, customer, revenue, advantage); (5) a public repo with install/deploy/architecture; (6) **original work from the event**, with a README that separates prior work.

**Scoring (max 100):** Impact **25** · Use of Avalanche **25** · Technical feasibility **20** · Business and scalability **20** · Presentation **10**. **Bonuses:** 0xGasless up to **+10**, KUMPLY up to **+10**, max 120. **Tie-break: the higher jury score *excluding* bonus points.** The prize amount is not disclosed ("un premio, monto no informado").

**KUMPLY caveat that decides the dual question:** the attestations are **Fuji demo attestations**, and the README must say so. A mainnet contract cannot read Fuji state. So "KUMPLY in the core flow on mainnet" is not a thing you can honestly claim; it implies a Fuji deployment. **0xGasless** is the only Avalanche-native capability that can plausibly sit in a mainnet core flow, and its Avalanche mainnet support must be confirmed with the mentors.

### 1.4 The clock

It is now ~11:15. Submission is at 18:00. That leaves **~6.75 hours**, of which the last hour must be reserved for rehearsal, README, video and submission. The real build window is **11:15–16:30 (5.25 hours)**. Every decision in this proposal is made against that budget, not against an ideal 9-hour day.

---

## 2. Dual track or Stablecoins only?

### 2.1 The structural conflict

| | **Stablecoins (Twin)** | **Blockchain (Avalanche)** |
|---|---|---|
| Core noun | the **local-currency token** | **Avalanche** |
| 25% of score | "only possible with local money; token at the core" | "uses Avalanche's own capabilities" |
| Natural product | peso guarantee, peso credit, peso FX | identity-gated agents, gasless UX, L1s, ICM |
| Chain with real liquidity | **Arbitrum** (Curve + Morpho + ARGt) | Avalanche C-Chain / L1 |
| Failure mode | "a generic escrow with a token bolted on" | "a generic EVM app that happens to be on Avalanche" |
| Prize | **500 USDT + merch** | undisclosed, single prize |

A single product can satisfy both only when an Avalanche capability is **load-bearing in the core mechanism**, not added as a feature. For a guarantee product, the honest Avalanche-native version is not 0xGasless or KUMPLY — it is a **permissioned L1 (Evergreen-style) for a consortium of SGRs, banks and insurers**, with KYC-validated validators, privacy for borrower data and ARGt as the gas/settlement token. That is exactly the "custom L1 configuration / compliance and privacy for institutional use cases" example the Avalanche rubric lists. It is also **not buildable in five hours**. Spin-up, validator configuration and a working UI would consume the whole day and produce a weaker Stablecoins product.

### 2.2 The expected-value math (illustrative, not a forecast)

Let `P` = probability of winning, `V` = prize value. Prize for Blockchain is unknown; use scenarios. Assume ~20–30 teams in the Stablecoins track and ~15–25 in Blockchain.

| Scenario | P(Stablecoins) | V(S) | P(Blockchain) | V(B) | EV | Real cost |
|---|---|---|---|---|---|---|
| **A. Stablecoins only** | 15–20% | 500 | — | — | **75–100 USDT** | none |
| **B. Two builds** (Arbitrum + Fuji) | 8–12% | 500 | 4–6% | 2,000–5,000 | **120–360 USDT** | 2–3 h, two demos, narrative split |
| **C. One Avalanche deployment, dual** | 12–16% | 500 | 6–9% | 2,000–5,000 | **180–570 USDT** | 1–1.5 h, ARGt-on-Avalanche dependency |

The table can be made to favor dual. That is the wrong way to read it. The prize is **500 USDT**; the real return is a credible product and a relationship with Twin/Belo/Tether. A dual submission that turns the guarantee story into "an EVM app on Avalanche" loses the relationship and the story at the same time. The variance is also asymmetric: a broken demo scores **zero on both tracks**, and the demo is 50% of the Stablecoins score. **A focused team that ships one flawless demo beats a dual team that ships two mediocre ones.**

### 2.3 The four gates

Before considering dual, answer these at the venue, on the record:

1. **May the same project be submitted to both tracks?** The rules are silent **[UNVERIFIED]**. If no, the decision is over.
2. **Does ARGt exist on Avalanche C-Chain mainnet, and can Twin fund a test balance?** The track PDF lists Avalanche among supported chains, but the LayerZero bridge is live only for ARGt between Arbitrum, Base, Polygon and Ethereum. If ARGt is not on Avalanche, Option C dies.
3. **Is there an Avalanche-native capability in the core flow?** For Aval: **0xGasless** as the borrower onboarding (Rosa never buys AVAX) is the only credible mainnet hook. **KUMPLY** is Fuji-only; using it in the core flow means a second (Fuji) deployment and a mock token — i.e. Option B, which is not worth it.
4. **Can one engineer deploy and verify on Avalanche in ≤45 minutes?** If not, it is not a free option.

**Gate times:** 11:30 (organizer + Twin mentor answers) and 13:00 (final go/no-go). After 13:00, no chain changes.

### 2.4 Recommendation

**Default: Stablecoins only, on Arbitrum One, with real ARGt.** Reasons:

- **Liquidity and rails:** Arbitrum is where ARGt's Curve pool and Morpho vault live, and where the documented addresses are. A guarantee product that wants to park its risk fund in Morpho or hedge a USD guarantee on Curve must be there.
- **Rubric fit:** the Stablecoins rubric is the one that pays for a product that could only exist with local money. Aval's core — a peso guarantee backed by a peso risk fund — fails the "remove the token" test in the right direction: remove ARGt and the guarantee becomes an FX bet.
- **Demo quality:** one chain, one deployment, one set of hashes, three rehearsals.
- **Relationship value:** Twin and Belo are the distribution; the 500 USDT is a token of it.

**Exception:** if **all four gates pass by 11:30**, the only dual version worth considering is **one deployment on Avalanche C-Chain mainnet with real ARGt and 0xGasless sponsoring the borrower's onboarding**, submitted to both tracks. Even then, the Avalanche score will hinge on how honestly the "why Avalanche" is argued: gasless onboarding for informal merchants is real but only worth ~3/5 on the 25-point criterion. Do not claim a mainnet contract reads Fuji attestations.

**What I would not do:** port the product to Fuji with a mock token and tell the Avalanche jury that "fast finality" is why it is on Avalanche. The 25-point criterion sees through it, and the Stablecoins jury sees a team that spent its morning on the wrong chain.

---

## 3. Why guarantees: the market, the models, the failures

### 3.1 Argentina: a guarantee system that already works — on paper

- **SGRs guarantee one of every three bank credits to SMEs**, and close to **40% of guaranteed products in the capital market** (CASFOG, Apr 2026, [Forbes Argentina](https://www.forbesargentina.com/money/mas-60-empresas-tiene-alguna-dificultad-financiamiento-pero-situacion-empieza-estabilizarse-n90030)).
- **More than 60% of firms report some financing difficulty**; the credit-to-GDP ratio is **11–12%**, versus far higher levels in Chile or Brazil (same).
- SGR-backed borrowers show **payment difficulties one in twelve**, versus **one in eight** for the banking system — the guarantee institutions underwrite better because they sit closer to the borrower (same).
- The system's own goal is to be **two to three times larger** (same). It cannot get there with paper certificates, manual onboarding and concentration limits.
- **Resolución 94/2026** (29 May 2026, published 2 June 2026) amends the SGR regime: guarantee contracts may be executed as **electronic documents with electronic signatures**, and the SGR **"deberá utilizar un soporte asociado a la tecnología blockchain"** for identity validation and transaction security; SGRs must report the chosen infrastructure to the authority. The same resolution allows **USD guarantees up to 50% of the available risk fund** for SMEs without FX income, provided the SGR holds matching FX investments ([InfoLEG](https://servicios.infoleg.gob.ar/infolegInternet/anexos/425000-429999/426303/norma.htm); [Boletín Oficial](https://www.boletinoficial.gob.ar/detalleAviso/primera/342672/20260602)).

That last point is the wedge. **The regulator has mandated a blockchain support for electronic guarantee contracts, and nobody has built the product the SGRs can actually use.** A hackathon team that ships the certificate, the risk pool and the lender view is not pitching a nice-to-have; it is pitching the compliance rail.

### 3.2 International models worth stealing from

| Model | What it is | What to steal for Aval |
|---|---|---|
| **Chile — FOGAPE** | State guarantee fund for small firms; guarantees **up to 80%** of a loan, allocated through **auctions** with risk-based coverage; caps in UF ([SII](https://www.sii.cl/portales/mipyme/modulo_fomento/fogape.htm)) | **Coverage is a price, not a constant.** Aval should let the SGR quote a coverage percentage and a fee per borrower, and let the lender see both. |
| **Korea — KODIT** | Public credit guarantee fund; large-scale guarantees for SMEs; 2026 issuance constrained by fiscal supply ([Sedaily](https://en.sedaily.com/finance/2026/06/01/korea-credit-guarantee-tightens-issuance-q1-supply-at-just)) | **A public/private guarantee stack is normal.** Aval's pool can sit alongside a public guarantee, not replace it. |
| **Japan — Credit Guarantee Corporations** | Local guarantee corporations, very high coverage, deep bank integration | **Local, relationship-based underwriting** is the moat; the chain is plumbing, not the product. |
| **Germany — Bürgschaftsbanken** | Regional guarantee banks, SME lending | **Federation of local pools** — the same certificate standard lets several pools coinsure one risk. |
| **Argentina — SGRs** | Reciprocal guarantee societies, risk fund, 1-in-3 SME bank credits | The **customer already exists**, with a regulatory mandate to digitize. |
| **BLINK (2026)** | Academic framework for blockchain-based credit guarantee institutions ([Financial Innovation](https://doi.org/10.1186/s40854-025-00880-y)) | The architecture is academically sound; **no LATAM product exists**. This is the citation that answers "why hasn't this been done?" |

### 3.3 The failure file: what not to rebuild

| Project | What it did | Why it matters |
|---|---|---|
| **Goldfinch** | On-chain credit to emerging-market fintechs; raised **$37M** (a16z), originated ~**$100M**; wound down with depositors reporting ~**$50M** in defaults ([The Defiant](https://thedefiant.io/news/defi/goldfinch-finance-winds-down-depositors-report-50m-defaults)) | **Unsecured, off-chain-underwritten credit fails** when the enforcement is social and the collateral is a promise. Aval does not lend; it collateralizes a guarantee with a funded pool and a legal issuer. |
| **Suretly** (2017) | Tokenized **crowdfunded guarantors** for microloans; strangers back a borrower for a fee ([whitepaper](https://www.cryptocompare.com/media/39838214/suretly%5Fwhitepaper%5Fv12.pdf)) | The idea of a "guarantee market" is not new; the failure was **anonymous guarantors with no local information and no enforcement**. Aval uses **known, regulated guarantors** (SGRs/mutuals) and a **funded** pool. |
| **Saving Circles / PasaTanda / MiTanda** | On-chain ROSCAs with VRF draws, NFT seats, WhatsApp onboarding ([ETHGlobal](https://ethglobal.com/showcase/saving-circles-bmgxr), [PasaTanda](https://ethglobal.com/showcase/pasatanda-c3f0w)) | ROSCAs are a **savings** product and already have winners; at 33% inflation a peso savings circle is economically hostile. Different lane. |
| **Cred-Fi / Strevvo / Ghost / Dow** | Unsecured or revenue-based credit, USD-denominated | Adjacent, but **none prices a local-currency guarantee**. This is the open lane. |
| **Meridian** | **Institutional credit infrastructure** — grand prize, Avalanche Build Games ($100k) ([AVAX One](https://avax-one.com/inside-the-avalanche-build-games-a-conversation-with-avax-one-coo-pete-wylie/)) | The institutional credit category **wins on Avalanche**. It validates the lane, not the exact product. |

### 3.4 The gap in one sentence

**The world has built on-chain *lending* and on-chain *savings*; it has not built on-chain *guarantees* — the instrument that actually converts a small firm's cash flow into bank credit in most of the world.** Argentina just made that instrument digital-by-law. That is the opening.

### 3.5 What winning projects do — and what Aval steals

| Winner (event) | What it did | What Aval steals |
|---|---|---|
| **Paybot** (ETHGlobal Buenos Aires 2025) | x402 micropayments unlock physical devices; the provider pays the gas | **Remove gas and wallet friction from the person who has the least** — the SGR or the lender can sponsor the borrower's onboarding |
| **Payload Exchange** (ETHGlobal BA 2025) | a third party sponsors part of the payment in exchange for data or an action | **The party that benefits from the guarantee pays for the certification** — the lender, not Rosa |
| **Onda** (Arc/Circle, Cannes 2026) | $0.01 to the artist, escrowed until claimed | **Escrow the guarantee fee until the loan is funded**; no fee if the loan never happens |
| **PayMate** (Cannes 2026) | a programmable credit pool: providers borrow, investors earn | **Pool + credit is a winning primitive**; Aval turns the pool into a guarantee fund |
| **Strevvo** (Chainlink Convergence 2026) | revenue-based financing, CRE-orchestrated | **Repayment as a share of sales** is the natural next iteration for merchant guarantees |
| **Saving Circles** (ETHGlobal BA 2025, Chainlink prize) | ROSCA with VRF draws and **NFT seats as liquid positions** | **The certificate is the liquid seat**: cession is the killer feature, not a back-office detail |
| **Meridian** (Avalanche Build Games, $100k) | institutional credit infrastructure | **Institutional credit infrastructure wins on Avalanche**; Aval is the same category with a different instrument (guarantees, not loans) |

The pattern is consistent: one user, one number that moves, one live transaction, and a business line that survives the weekend. Aval's number is **90% → 45%**; its live transaction is the **ARGt allocation and disbursement**; its business line is the **SGR's compliance budget**.

---

## 4. The concept: Aval

> **"Rosa no tenía garantía. Su cooperativa sí."**
> *Aval convierte el aval en un certificado on-chain, con un fondo de riesgo en ARGt, que cualquier prestamista puede verificar y ejecutar.*

### 4.0 The shortlist (and why this one)

Scored 1–5 on Twin's four criteria plus feasibility for a **5-hour build by four people**. The "token core?" column asks: *if you removed ARGt, would the product still work?*

| Concept | Idea | Problem | Business | Pitch | Feasibility | Token core? |
|---|---|---|---|---|---|---|
| **Aval Network — SGR guarantees** | 5 | 5 | 5 | 4 | 4 | **Yes** |
| **Aval Direct — friends' aval** | 4 | 4 | 3 | 5 | 5 | **Yes** |
| **La Cadena — merchant ROSCA** | 3 | 4 | 3 | 5 | 4 | Partial |
| **La Libreta — fiado ledger + merchant credit** | 4 | 5 | 4 | 4 | 3 | Yes |
| **El Plan — on-chain layaway** | 4 | 4 | 3 | 3 | 2 | Yes |

**Aval Network wins** because it is the only concept where (a) the customer has a **legal mandate** to digitize, (b) the risk capital is **already funded** (the SGR's risk fund), (c) a **secondary market** exists to be unlocked, and (d) the demo is still a human story. **Aval Direct** is the fallback if no SGR or mutual is reachable at the venue: same certificate, but the guarantors are two people who trust Rosa instead of a pool. It is more emotional and less defensible; build it only if the institutional door is closed.

### 4.1 The users

| Actor | Who | What they need | What Aval gives them |
|---|---|---|---|
| **Borrower** | Rosa, 44, kiosco in La Matanza; monotributista; no property; daily cash flow | ARGt 3,000,000 for inventory; a rate she can pay | A guarantee that lowers the rate; a portable `legajo`; no notary |
| **Guarantor** | Her cooperative — an SGR or mutual with a risk fund | To grow guarantees without raising capital; to comply with Res. 94/2026; to cede concentration | A pool, a certificate standard, a secondary market |
| **Lender** | Bank, fintech, or Belo-like wallet | A verifiable guarantee and a fast claim | A certificate it can read and enforce; a lower loss-given-default |
| **Reinsurer / second SGR** | Another guarantee institution or insurer | Diversification, yield on risk | A transferable participation in a certificate |

### 4.2 The mechanism

1. **Request.** Rosa opens the app, connects her wallet, and requests **ARGt 3,000,000** for 12 months. Her `legajo` (empty at first) is attached. The SGR sees her on-chain sales/repayment history and its own bureau data.
2. **Underwrite and mint.** The SGR approves a **50% coverage** (ARGt 1,500,000) at a **3% annual guarantee fee**. It mints a **Guarantee Certificate** (ERC-721) that names the borrower, the lender (or "open"), the covered amount, the coverage ratio, the term and a hash of the legal documents. It allocates ARGt 1,500,000 from its **risk pool** to the certificate.
3. **Fund.** A lender sees the certificate, the pool's available capital and the borrower's `legajo`, and funds the loan at **45% TNA** instead of **90%** unguaranteed. ARGt moves from the lender to Rosa in the same transaction that activates the guarantee.
4. **Repay.** Rosa pays monthly in ARGt. The waterfall is automatic: **lender principal + interest → SGR guarantee fee → pool reserve replenishment**. On the final payment the certificate is marked `Repaid`, the pool allocation is released and the `legajo` updates.
5. **Default.** If Rosa misses a payment, the SGR (or the lender) calls `markDefault` after a grace period. The pool pays the lender **up to the covered amount**; the SGR keeps the collection rights; the `legajo` records the event; the pool's loss is visible to every future lender.
6. **Cede (the wow).** The SGR can **cede 30% of the certificate** to another SGR or an insurer for a fee, on-chain, in one transaction. That frees capital, reduces concentration, and creates the first **secondary guarantee market** in the region. This is the primitive that does not exist on paper and cannot exist without a token.

### 4.3 Why local currency is load-bearing

| If the guarantee is in… | What happens to the SGR | What happens to Rosa | Verdict |
|---|---|---|---|
| **USDT / USD** | The pool takes an FX position against a peso-denominated guarantee; a 30% devaluation moves the coverage ratio; regulatory capital and accounting are in ARS | Her income is in pesos; a peso depreciation raises the real burden even if she pays every installment | A different, worse product: it adds an FX bet the guarantee cannot cover |
| **ARGt** | Assets (pool) and liabilities (guarantee) are in the same unit; the coverage ratio is stable; the SGR's capital is not revalued by FX | Income, obligation and guarantee are in the same unit; only credit risk remains | **The guarantee prices credit risk — which is what a guarantee is for** |

This is the "remove the token and the product breaks" test, and it is economically correct, not rhetorical. It is also why Twin's **seven currencies** matter for the expansion: an Argentine SGR guaranteeing an importer's **BRAt** payable, or a Bolivian **BOLt** guarantee, is the same certificate with a different unit — and the Curve pools are the FX leg.

### 4.4 What is genuinely new

| Prior art | What it does | Aval's delta |
|---|---|---|
| Bank/fintech credit | Lends against payslip, property or bureau score | **Guarantees** the loan; the SGR, not Aval, is the lender of record |
| Informal *aval* | A friend signs, uncapped, unenforceable | **Capped, priced, funded, enforced, transferable** |
| Suretly (2017) | Anonymous crowdfunded guarantors | **Regulated, local-information guarantors** with a funded pool |
| Goldfinch | Unsecured on-chain credit | **Collateralized guarantee**, not unsecured lending |
| Insurance (seguro de caución) | Regulated insurance product, capital-heavy, slow | **Infrastructure for guarantee institutions**, not an insurer |
| SGR core software | Records guarantees in a database; paper certificates | **Portable certificate + risk pool + secondary market** |
| BLINK (2026) | Academic DLT framework for CGIs | **A working product on ARGt**, with a lender UX and a business model |

**The three things that make it defensible:** (1) the certificate is a **standard** any lender can read, so the network grows with each SGR; (2) the **risk pool** is transparent and composable, so capital can be priced and reinsured; (3) the **legajo** captures the informal cash flow that bureaus cannot see, and the borrower carries it.

### 4.5 Why this is *not* generic

The generic version of this idea is "P2P lending with a guarantor" — a category with a graveyard (Suretly, Goldfinch) and a saturated hackathon lane (Cred-Fi, Strevvo, Ghost). Aval is deliberately **not a lender**:

- It does not originate, fund or hold the loan; the lender does.
- It does not take deposits; the SGR's risk fund does.
- It does not promise yield; the SGR charges a guarantee fee.
- It sells **infrastructure to licensed guarantee institutions**, which is why the regulatory mandate matters and why the business survives the weekend.

That positioning is also the answer to the CNV question: **Aval is not an investment product.** It is the rail on which a regulated guarantee is issued, priced and enforced.

---

## 5. Architecture

### 5.1 The contract core

Keep it to **four small contracts**, all in Solidity 0.8.24, deployed on **Arbitrum One (42161)** with real ARGt.

```
contracts/
  GuaranteePool.sol        // ARGt risk fund: deposit, allocate, release, claim
  GuaranteeCertificate.sol // ERC-721: terms, status, cession (fractional participation)
  LoanBook.sol             // fund, repay, waterfall, markDefault
  Legajo.sol               // portable repayment record (SBT or mapping)
```

**Data model (abridged):**

```solidity
struct Guarantee {
    uint256 id;
    address sgr;            // issuer, role-gated
    address borrower;
    address lender;         // 0 until funded
    uint256 principal;      // ARGt, 18 dec
    uint256 covered;        // ARGt allocated from the pool
    uint16  coverageBps;    // e.g. 5000 = 50%
    uint16  feeBps;         // SGR guarantee fee, annualized
    uint64  start;
    uint64  due;
    Status  status;         // Requested, Approved, Funded, Repaying, Repaid, Defaulted, Claimed
}
```

**State machine:** `Requested → Approved (certificate minted, pool allocated) → Funded (ARGt to borrower) → Repaying → Repaid | Defaulted → Claimed → Closed`. Every transition checks the previous state; `claim` cannot pay twice; `release` cannot run after `claim`.

**Functions the demo needs:**

```solidity
// SGR
createGuarantee(borrower, principal, coverageBps, feeBps, termDays) -> id
approveAndMint(id)                       // allocates pool, mints certificate
cede(id, to, bps)                        // secondary market
markDefault(id)                          // after grace
claim(id)                                // pool -> lender, up to covered

// Lender
fund(id)                                 // ARGt from lender to borrower

// Borrower
repay(id, amount)                        // waterfall

// Views
quoteRate(coverageBps) -> aprBps         // the 90% -> 45% moment
legajo(address) -> (loans, onTime, late, defaulted, volume)
poolAvailable() -> uint256
```

**Design rules:** `SafeERC20`, `ReentrancyGuard`, checks-effects-interactions, role-based access (`SGR_ROLE`, `LENDER_ROLE`, `ADMIN`), a pause switch, caps per borrower and per SGR, no unbounded loops (max 3 cessions per certificate), pull-over-push for fees, events for everything the UI needs. **No upgradeable proxy in the demo** — immutable and disclosed as unaudited; upgradeability is a post-hackathon decision.

### 5.2 Integrations (in priority order)

1. **ARGt (required).** `0x59863989d080B22476DB95656d0C3CC18be92214` on Arbitrum One **[verify with Twin at the venue]**. Read `symbol()` and `decimals()` at runtime; never hard-code by chain — the PDF documents that the same address can be a different token on another chain.
2. **Morpho (optional, high value).** Park idle risk-fund capital in the ARGt vault (`0x9Dd3F844747AB78d616BF76DB92756E17A064aDD`) so the pool earns while it waits. This is treasury management for the SGR, **not** a yield promise to users; say that explicitly. If integration risk is high, show a read-only "projected yield" card and keep the funds in the pool.
3. **Curve (optional).** Quote ARGt/USDT0 (`0x356d349da9add7efb56a35fab939a2c6d852f853`) for a USD-denominated guarantee (Res. 94/2026 allows up to 50% of the fund). A read-only quote in the UI is enough to show the FX leg; do not route funds in the demo.
4. **Belo price API.** Display only (`api.belo.app/public/price`), with a hard-coded fallback and a note. Never let a demo depend on it.
5. **KUMPLY / 0xGasless.** Only in the dual-track branch (§2.4); not in the recommended build.

### 5.3 Frontend

**Next.js 14 + wagmi + viem + RainbowKit + Tailwind.** Three surfaces plus one public page:

- **SGR desk:** pipeline of requests, borrower `legajo`, coverage/rate slider, "mint certificate", pool dashboard (available, allocated, claims), cede modal.
- **Borrower (Rosa):** request form, status timeline, repayment schedule, "pay installment", `legajo` card.
- **Lender:** certificate list with coverage, rate and pool depth; "fund" button; portfolio; claim status.
- **Public certificate page:** `/[id]` — issuer, borrower (pseudonymous), covered amount, status, explorer link, document hash. This is the "any lender can verify it" moment.

**Demo mode:** seeded accounts, one pre-created request, one pre-funded pool, a "stress test" toggle that defaults a *separate* certificate (never the happy path), and a one-click reset script.

### 5.4 Repository shape

```
aval/
  contracts/        GuaranteePool.sol, GuaranteeCertificate.sol, LoanBook.sol, Legajo.sol, test/
  script/           Deploy.s.sol, Seed.s.sol, Demo.s.sol
  app/              Next.js
  docs/             architecture.md, demo.md
  README.md         token(s), chain, addresses, tx hashes, what was built today
```

---

## 6. The build window (11:15–17:00)

### 6.1 Scope: the minimum that wins

| Must have | Nice | Cut without regret |
|---|---|---|
| Pool deposit + allocate + claim | Morpho yield card | Fractional cession >3 parties |
| Certificate mint + public page | Curve FX quote | Multi-SGR federation |
| Loan fund + repay waterfall | `legajo` badge/score | Mobile app |
| Rate quote (90% → 45%) | Cession to a second SGR | KYC integration |
| One real ARGt tx hash | Stress-test default | Fancy animations |

### 6.2 Roles (4 people)

| Role | Owns | Deliverable by |
|---|---|---|
| **P1 — Contracts** | `GuaranteePool.sol`, `GuaranteeCertificate.sol`, `LoanBook.sol`, tests, deploy, verify, seed | contract verified by **13:30** |
| **P2 — SGR + borrower UI** | request, underwrite, mint, repay | end-to-end by **15:00** |
| **P3 — Lender + certificate page + design** | lender view, public certificate, visual system | by **15:30** |
| **P4 — Narrative + ops** | deck, script, video, README, sponsor liaison, ARGt/gas, submission | deck by **16:30**, video by **16:00** |

### 6.3 Timeline (hard stops)

| Time | Milestone | Kill criterion |
|---|---|---|
| 11:30 | Concept locked; repo created; wallets; **ask Twin for ARGt + gas**; confirm dual rules | — |
| 12:00 | Contract skeleton compiles; UI shell runs | — |
| 13:00 | **Dual-track go/no-go**; first pool deposit + certificate mint in Foundry | if not: cut cession, keep mint/fund/repay |
| 13:30 | **First real ARGt transaction on Arbitrum**; hash saved | if no ARGt: use a test token for the flow and one real ARGt tx for the fee; disclose |
| 14:30 | End-to-end in the UI (request → mint → fund → repay) | if not: script the flow, record a video |
| 15:30 | Default + claim on a separate certificate; public certificate page | if not: slides only |
| 16:00 | Rehearsal #1; **record backup video** | — |
| 16:30 | Deck final; README with addresses + hashes | — |
| 17:00 | Rehearsal #2; **code freeze** | — |
| 17:15 | Repo public; README; submit | — |
| 17:45 | Buffer; final checks | — |

### 6.4 The one thing that cannot slip

**The real ARGt transaction hash.** Nothing else matters until it exists. If by 13:30 there is no ARGt, use a test token for the product flow and execute **one real ARGt transaction** for the guarantee fee; disclose it in the README. Do not spend the afternoon on a second chain.

### 6.5 Demo reliability checklist

- [ ] Four wallets, four browser profiles, all pre-funded.
- [ ] One request pre-created, one certificate pre-minted, one pool pre-funded.
- [ ] The live path is: **mint the second certificate → fund → one repayment**. Nothing else.
- [ ] Every hash copied into the deck and the README.
- [ ] Backup video recorded at 16:00, playable offline.
- [ ] Local Anvil fork as the last resort, clearly labeled.
- [ ] No live dependency on the Belo price API or Morpho; hard-coded fallbacks with notes.

---

## 7. The 3-minute pitch

### 7.1 Script (Spanish, with English gloss)

**[0:00–0:25] The person.**
> "Rosa tiene 44 años y un kiosco en La Matanza. Es monotributista. No tiene propiedad, no tiene recibo de sueldo. Necesita tres millones de pesos para mercadería. El banco le pidió una garantía con propiedad. No tiene. Una fintech le ofrece 90% de interés."

**[0:25–0:50] The insight.**
> "Pero Rosa sí tiene garantía: su cooperativa. Una SGR con un fondo de riesgo que avala uno de cada tres créditos bancarios a pymes en Argentina. Lo que no tiene es cómo probarlo. Hoy el aval es un papel que tarda semanas, que ningún prestamista de otra provincia puede verificar, y que no se puede vender ni reasegurar."

**[0:50–2:00] The demo.**
> "Rosa pide tres millones en ARGt. Su SGR suscribe un certificado de garantía por el 50%, y lo respalda con un fondo de riesgo en ARGt. Miren la tasa: 90% sin aval, 45% con aval. El prestamista fondea: la plata sale a la billetera de Rosa. Rosa paga la primera cuota: el contrato reparte solo — capital e interés al prestamista, comisión a la SGR, y el fondo se repone. Si Rosa no paga, el fondo paga al prestamista hasta el 50%, automáticamente. Y el certificado se puede ceder: la SGR vende el 30% a otra SGR en un clic, libera capital y baja concentración."

**[2:00–2:30] Why local money.**
> "Todo esto es en pesos. Si el fondo estuviera en dólares, la SGR estaría apostando al tipo de cambio contra sus propias garantías: una devaluación del 30% le mueve el ratio de cobertura. En ARGt, el activo y el pasivo están en la misma unidad. El token local no es un detalle: es lo que hace que el riesgo sea asegurable."

**[2:30–3:00] Business and close.**
> "Le vendemos la infraestructura a las SGR y mutuales que ya existen: SaaS más 15 puntos básicos del volumen garantizado. Desde junio, la resolución 94/2026 les exige blockchain para los contratos electrónicos de garantía. Ya no es una idea: es una obligación sin producto. El banco pide garantías. Nosotros las hacemos verificables."

### 7.2 Choreography (64 seconds of demo inside the 3 minutes)

| Time | Screen | Action | What the judge sees |
|---|---|---|---|
| 0:50 | SGR desk | Open Rosa's request; `legajo` empty; coverage slider 0 → 50% | the problem in one number |
| 1:00 | SGR desk | Tap **Emitir certificado**; tx confirms | a real ARGt allocation, a real hash |
| 1:10 | Lender view | Certificate appears with **50% coverage**; rate card flips **90% → 45%** | the pricing moment |
| 1:22 | Lender view | Tap **Fondear**; ARGt lands in Rosa's wallet | the money moves |
| 1:34 | Borrower | Tap **Pagar cuota**; waterfall animates | the repayment is automatic |
| 1:44 | Certificate page | Status `Repaid`; `legajo` ticks up | the compounding |
| 1:54 | SGR desk | **Ceder 30%** to a second SGR; tx confirms | the secondary market — the wow |

**Rules:** pre-seed the request and the pool; do only the mint, the funding and one repayment live; cede on a *separate* certificate if time is short; never run the default live on the happy path; have a recorded video of the full flow.

### 7.3 Q&A prep

| Question | Answer |
|---|---|
| "Why not USDC?" | The guarantee covers a peso obligation and the pool is accounted in pesos. A USD pool makes the SGR take an FX position against its own guarantees. ARGt leaves one risk — credit — which is what a guarantee prices. |
| "Isn't this just a guarantor?" | A guarantor is uncapped, unpriced, unenforceable and unportable. Aval's certificate is capped (coverage %), priced (fee), funded (pool), enforceable (claim) and transferable (cession). |
| "Why would an SGR use this?" | Res. 94/2026 requires a blockchain support for electronic contracts; the certificate is verifiable by any lender; the pool can be reinsured; cession frees capital and reduces concentration. |
| "Who pays?" | The SGR pays SaaS + bps; the borrower pays the guarantee fee (embedded in the rate); the secondary buyer pays a fee. |
| "Is this lending? Are you regulated?" | No. Aval does not lend, take deposits or promise yield. The SGR is the regulated guarantor; Aval is its infrastructure. |
| "What if the borrower defaults?" | The pool pays the lender up to the covered amount; the SGR keeps collection rights; the `legajo` records it; the loss is visible to future lenders. |
| "What about the CNV case?" | We deliberately built a guarantee product, not an investment product. No yield, no deposits, no pooled retail funds. |
| "How do you prevent fraud?" | The SGR underwrites with its own data and the on-chain `legajo`; caps per borrower and per SGR; role-gated issuance; document hashes; a post-hackathon audit and identity layer. |
| "What did you build today?" | `GuaranteePool.sol`, `GuaranteeCertificate.sol`, `LoanBook.sol`, the `legajo`, the three views and the live ARGt tx. Everything else is boilerplate, and the README says so. |
| "Why not Avalanche?" | The product needs ARGt liquidity (Arbitrum) and an institutional consortium chain is a post-hackathon architecture, not a 9-hour build. We chose the chain where the guarantee can actually settle. |

---

## 8. Business model and go-to-market

### 8.1 Who pays

| Revenue line | Price | Payer | Why it works |
|---|---|---|---|
| **SaaS** | USD 1,000–3,000/month per SGR | SGR / mutual | replaces paper workflow and manual certificate handling; compliance budget |
| **Volume fee** | **10–25 bps** of guaranteed volume | SGR | aligned with the SGR's growth; small relative to the guarantee fee |
| **Secondary market** | 5–10 bps of ceded volume | buyer and seller | new revenue from a market that does not exist today |
| **Legajo API** | USD 0.10–0.50 per query | lender / fintech | portable credit record for the informal economy |
| **Float (later)** | share of Morpho yield on the risk fund | SGR | treasury management, not a retail yield product |

### 8.2 Illustrative unit economics **[ASSUMPTION]**

- A mid-size SGR guarantees **ARS 30,000M/year** (roughly USD 20M at ~ARS 1,500/USD); at **15 bps** that is **ARS 45M/year** (~USD 30k).
- **30 SGRs** at that scale = **~USD 900k ARR** from volume fees alone, before SaaS and the secondary market.
- The system's own ambition is to be **2–3× larger**; the fee pool grows with it.
- The real upside is the **risk-fund float** and the **secondary guarantee market**, not the micro-loan fee.

### 8.3 Go-to-market

1. **Wedge:** one SGR or mutual in CABA/GBA with a micro-SME portfolio; pilot one product line (working capital) for 90 days.
2. **Channel:** CASFOG (the SGR chamber) as the industry body; a joint webinar and a reference case.
3. **Expansion:** mutuals and cooperatives that guarantee consumer/merchant credit but are not SGRs; then cross-border guarantees using Twin's seven currencies.
4. **Moat:** the certificate standard (network effects), the `legajo` data (informal cash flow), and the regulatory integration (Res. 94/2026 reporting).

### 8.4 Competition and positioning

| Competitor | What they do | Why Aval is different |
|---|---|---|
| SGR core software / Excel | records guarantees, prints certificates | Aval is the **portable certificate + pool + secondary market**, not a registry |
| Banks' guarantee desks | own guarantee products | Aval is **infrastructure for the guarantor**, bank-agnostic |
| Seguro de caución | insurance, capital-heavy | Aval is not an insurer; it makes the SGR's guarantee liquid |
| Goldfinch / DeFi credit | unsecured lending | Aval is **collateralized by a funded pool**, not a promise |
| ROSCAs / tandas | savings circles | different instrument, different risk |

**Positioning line:** *"No somos un prestamista. Somos la infraestructura que hace que un aval valga en cualquier lado."*

---

## 9. Risks, legal and ethics

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Regulatory perimeter** | Guarantees are regulated (Ley 24.467; Res. 21/2021 as amended by Res. 94/2026). Aval must not be the guarantor. | Aval is software sold to licensed SGRs/mutuals; the SGR issues the guarantee; no deposits, no lending, no yield. Legal review before pilot. |
| **CNV / ARGt** | The CNV suspended ARGt in March 2026 over a "32% TNA" promise and lifted it in April 2026; it still asserts ARGt may be a *valor negociable*. | No yield promises; ARGt is a settlement unit; the SGR's fee is a service fee; the pool's Morpho yield is the SGR's treasury, disclosed as such. |
| **Credit concentration** | A pool can be wiped by correlated defaults. | Caps per borrower/sector; diversification; cession/reinsurance; a first-loss layer; transparent reporting. |
| **Legal enforceability of the on-chain certificate** | A token is not a legal guarantee by itself. | The certificate references a hash of the signed legal contract; the SGR remains the legal obligor; the chain is evidence + automation. |
| **Oracle / default attestation** | The contract cannot know if Rosa paid outside the system. | The SGR and lender attest; a multisig with a dispute window; disclose the trust assumption. |
| **Smart contract** | No audit in 5 hours. | Small immutable core, Foundry tests, pause, caps, "unaudited demo" in the README. |
| **Issuer / depeg** | ARGt is an upgradeable proxy with a reserve mix that includes private securities and DeFi positions. | Disclose; do not custody funds longer than the guarantee; allow the SGR to refuse ARGt. |
| **Adoption** | SGRs are conservative and have core systems. | Start with one pilot; integrate via CSV/API; sell the compliance mandate, not the technology. |
| **Demo** | 50% of the Stablecoins score. | Pre-seed, three rehearsals, backup video, hashes on slides, no live external dependencies. |

**Ethics of the guarantee.** A capped first-loss guarantee is better than the informal *aval* that can cost a family its house, but it is still debt. The product should disclose the covered amount, the fee, the consequence of default, and a cooling-off period; the SGR's underwriting must include affordability, not just coverage.

---

## 10. Scorecard: how this wins

### 10.1 Twin Stablecoins rubric

| Criterion | What the jury asks | Aval's answer | Score (1–5) |
|---|---|---|---|
| **Idea** | original, only possible with local money, token at the core | Guarantees, not lending; a peso certificate backed by a peso pool; remove ARGt and the coverage ratio becomes an FX bet | **5** |
| **Problem** | real problem, identified user, concrete pain | Rosa, 43% informality, 1-in-3 SME bank credits guaranteed by SGRs, >60% of firms report financing difficulty, Res. 94/2026 mandate | **5** |
| **Business** | viable path to users and a model after the hack | ~50 SGRs, SaaS + 15 bps, secondary market, float; pilot with one SGR | **4** |
| **Pitch** | clear story in 3 minutes with a working demo | Rosa → certificate → rate flip → claim → cession; one live ARGt tx | **5** |

**Average: 4.75 → ~95/100** if the demo works. The weakest link is Business (adoption by conservative SGRs), which is why the pitch leads with the regulatory mandate.

### 10.2 If dual (Avalanche rubric)

| Criterion | What the jury asks | Aval's answer | Score (1–5) |
|---|---|---|---|
| **Impact** | real, relevant problem | same as above | 5 |
| **Use of Avalanche** | the network's own capabilities | **weak on C-Chain**: gasless onboarding (0xGasless) is real but not load-bearing; the honest 5/5 version is a permissioned L1 for the SGR consortium, which is not built in 9h | **2–3** |
| **Technical feasibility** | works and is deployed | verified contract + UI | 4 |
| **Business** | model and scalability | strong | 5 |
| **Presentation** | clarity | strong | 4 |

**This is exactly why dual is a trap:** the same product scores 5 on the Stablecoins "Idea" and 2–3 on the Avalanche "Use of Avalanche". The second track's 25-point criterion is the one the product cannot satisfy honestly in a day.

---

## 11. Appendices

### 11.1 Verified addresses (from the track PDF; verify at runtime)

**Arbitrum One (42161):**

| Token | Contract | Curve pool vs USDT0 | Morpho vault |
|---|---|---|---|
| ARGt | `0x59863989d080B22476DB95656d0C3CC18be92214` | `0x356d349da9add7efb56a35fab939a2c6d852f853` | `0x9Dd3F844747AB78d616BF76DB92756E17A064aDD` |
| BRAt | `0xC4ed6Aba5373D78E160F4df39e011F078Be54df8` | `0xeef48df5f1c509cd9730774b4e8a4464626ef8d5` | `0x207396cbe2f6f50670eaa69584c9f723924c7fe9` |
| COLt | `0xa16d5DB80A45157E0e451750B81FF0CC0b61d558` | `0x7d2dffa9e903b8377c96196da424c7965b06bcc3` | `0x596FD4C6cAb1aeBCe2a847773Ca87F24349D0c56` |
| PERt | `0x899438713f62B04d6CD8e8709986F7256fB6E3d9` | `0x41af8cc0811dd07f167752b821cf5b11dba7ca85` | `0x5eD1aeFACb3B6CCC3F924B1d8915754Ed780266F` |
| MEXt | `0xb96aA6babCcD738d6644ADd4912fE5eFbEBF5a25` | `0x6edbf3ada7b6d9524c3248955538d573aae449cf` | `0x3046bc254bD2269eC5C3478692be619441Bb11A5` |
| CHLt | `0xe8dbC4680235cCAeFf48e4C0B0EaceeBb89E5e17` | `0xa087f05ecd245476d7844f6eab28d98724696ac2` | `0xb5cd19e8e884e8e0e6dD8eDF54C172BD865A7BAd` |
| BOLt | `0x1edF5E61B6a4Fe19FEf3A695328F61aAa07728eA` | `0x9c7809c813bcc67e288c56d5ce5e0225996bfcd2` | `0x8dE92AFea0266A67c451b5AD1318bc0A9d834a7E` |

**Footgun:** the same address can be a different token on another chain (`0x5986…2214` is ARGt on Arbitrum/Ethereum, MEXt on Base, BRAt on Polygon). Read `symbol()` and `decimals()` at runtime.

**Other:** price API `https://api.belo.app/public/price`; logos `https://assets.twin.finance/media/tokens/32x32/<TICKER>.svg`; Twin transparency `https://www.twin.finance/transparency`; whitepaper `https://cdn.twin.finance/docs/TwinStablecoins_Whitepaper_v1.pdf`; Discord `discord.gg/whU99xqnZ`.

### 11.2 Open questions to resolve at the venue

1. Is the Twin "Stablecoins" track the Fintech track, and is the Blockchain deadline also 18:00?
2. May the same project be submitted to both tracks?
3. Does ARGt exist on Avalanche C-Chain mainnet, and can Twin fund a test balance?
4. How much test ARGt can Twin provide on Arbitrum, at what address, and is there gas?
5. Is there an audit for the ARGt proxy? (None found.)
6. Are the KUMPLY Fuji attestations issued by staff, and how long do they take?
7. What are the SGR concentration limits that cession would relieve? (Confirm with a mentor or CASFOG.)
8. Does the SGR in the room already have a blockchain provider, and what would it take to pilot?

### 11.3 Sources

**Primary:** `track twin.pdf` (clean transcription: `docs/strategy/source/track_twin.txt`); `HackaTwin — Blockchain Track Rules and Requirements (EN).docx.pdf` (clean transcription: `docs/strategy/source/blockchain_track.txt`); `Resolución 94/2026` ([InfoLEG](https://servicios.infoleg.gob.ar/infolegInternet/anexos/425000-429999/426303/norma.htm)); Twin transparency and whitepaper.

**Argentina market:** [CASFOG/Forbes, Apr 2026](https://www.forbesargentina.com/money/mas-60-empresas-tiene-alguna-dificultad-financiamiento-pero-situacion-empieza-estabilizarse-n90030); [SGR reform, June 2026](https://www.somospymes.com.ar/financiamiento-y-mercados/reformaron-el-sistema-garantias-pymes-operatorias-dolares-y-firma-contratos-n5403171); [CNV ARGt suspension](https://cointelegraph.es/news/argentina-la-cnv-ordeno-suspender-la-oferta-y-negociacion-de-la-stablecoin-argt); [CNV lifts](https://cointelegraph.es/news/cnv-de-argentina-levanto-suspension-sobre-la-stablecoin-argt); [Belo $14M led by Tether](https://stablecoinnews.com/belo-raises-14m-in-a-round-with-tether/).

**International models:** [FOGAPE](https://www.sii.cl/portales/mipyme/modulo_fomento/fogape.htm); [KODIT 2026](https://en.sedaily.com/finance/2026/06/01/korea-credit-guarantee-tightens-issuance-q1-supply-at-just); [BLINK, Financial Innovation 2026](https://doi.org/10.1186/s40854-025-00880-y); [BIS Agorá](https://www.bis.org/about/bisih/topics/fintech/agora.htm); [BIS Mariana](https://www.bis.org/project/mariana); [Drex pivot](https://valorinternational.globo.com/markets/news/2025/08/08/central-bank-drops-blockchain-for-next-phase-of-drex.ghtml); [MiCA](https://eur-lex.europa.eu/eli/reg/2023/1114/oj); [OCC GENIUS rule](https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-92.html); [HKMA e-HKD](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2025/10/20251028-4/).

**Hackathon evidence:** [ETHGlobal Buenos Aires winners](https://www.bitget.com/news/detail/12560605081065); [Arc Cannes winners](https://www.arc.io/blog/meet-the-arc-track-winners-from-ethglobal-cannes-hackathon-and-what-we-learned); [Chainlink winners](https://chain.link/hackathon/winners); [Saving Circles](https://ethglobal.com/showcase/saving-circles-bmgxr); [PasaTanda](https://ethglobal.com/showcase/pasatanda-c3f0w); [Cred-Fi](https://ethglobal.com/showcase/cred-fi-tguaw); [Avalanche Build Games](https://avax-one.com/inside-the-avalanche-build-games-a-conversation-with-avax-one-coo-pete-wylie/); [Goldfinch wind-down](https://thedefiant.io/news/defi/goldfinch-finance-winds-down-depositors-report-50m-defaults).

### 11.4 Glossary

- **SGR** — Sociedad de Garantía Recíproca: a regulated Argentine guarantee institution that backs SME loans with a risk fund.
- **Aval** — guarantee; in Argentina, the signature that backs a loan.
- **Certificado de garantía** — the legal instrument the SGR issues; Res. 94/2026 allows it to be signed electronically and requires a blockchain support for electronic contracts.
- **Fondo de riesgo** — the SGR's reserve that backs its guarantees.
- **Legajo** — the borrower's portable credit record.
- **Cession** — transfer of a share of the guarantee to another institution; the secondary market.

---

*This proposal is strategy and product analysis, not legal or investment advice. The regulatory perimeter for guarantees and lending in Argentina is fact-specific; validate the structure with counsel before any commercial launch.*
