# HackaTwin — Decision sheet
### Saturday 7 Nov 2026 · submission 18:00 · team of 4

> Full analysis: [`../proposal/HACKATWIN_PROPOSAL.md`](../proposal/HACKATWIN_PROPOSAL.md) · Pitch script: [`../proposal/PITCH_ES.md`](../proposal/PITCH_ES.md) · Deck: [`../proposal/AVAL_PITCH.pptx`](../proposal/AVAL_PITCH.pptx)

---

## The call

**Track:** Stablecoins only. **Concept:** `Aval` — the on-chain guarantee layer.
**Chain:** Arbitrum One with real ARGt. **Do not build two deployments.**
**Customer:** an SGR / mutual (guarantee institution), not a consumer lender.

**Why:**
1. The Stablecoins rubric gives 25% to "the Twin token is the core". A peso guarantee backed by a peso risk fund passes that test; a ported Avalanche app does not.
2. **Resolución 94/2026** requires SGRs that use electronic contracts to do so on a blockchain support. The demand is now a legal obligation, and no product exists.
3. SGRs already guarantee 1 in 3 SME bank credits in Argentina; the system wants to be 2–3× larger. The bottleneck is not capital, it is verifiable guarantees.
4. Every on-chain credit winner verified in 2025–26 is USD-denominated *lending* (Cred-Fi, Strevvo, Ghost, Dow, Efy; Goldfinch wound down). **Local-currency guarantees are the open lane.**
5. A focused demo rehearsed three times beats two demos rehearsed once — and the demo is 50% of the score.

---

## The concept in five lines

1. **Rosa, 44**, runs a kiosco in La Matanza, is a monotributista, has no property and needs **ARGt 3,000,000** for inventory. A bank asks for a property guarantee; a fintech offers **90% TNA**.
2. Her **cooperative — an SGR** with a risk fund — can guarantee **50%** of the loan. Today that guarantee is a paper certificate: slow, unverifiable, unsellable.
3. Aval mints a **Guarantee Certificate (ERC-721)** and allocates **ARGt** from the risk pool. A lender verifies it and funds at **45%**.
4. Repayment is a **waterfall**: lender → SGR fee → pool. Default → the pool pays the lender up to the covered amount; the `legajo` records it.
5. The SGR can **cede 30%** of the certificate to another SGR in one click — the first secondary guarantee market, and the capital relief that lets the system grow.

**Pitch line:** *"El banco pide garantías. Nosotros las hacemos verificables."*
**Human line:** *"Rosa no tenía garantía. Su cooperativa sí."*

---

## The numbers that matter

| Number | Value | Source |
|---|---|---|
| SME bank credits with an SGR guarantee | **1 in 3** | CASFOG / Forbes, Apr 2026 |
| Firms reporting financing difficulty | **>60%** | CASFOG / Forbes |
| Credit-to-GDP | **11–12%** | CASFOG / Forbes |
| SGR-backed delinquency vs banks | **1 in 12 vs 1 in 8** | CASFOG / Forbes |
| SGRs / mutuals in Argentina | **~50+** [VERIFY] | CASFOG |
| Blockchain mandate for SGR contracts | **Res. 94/2026**, in force 2 Jun 2026 | InfoLEG |
| Consumer credit rate | **60–120% TNA** | market, [ASSUMPTION] |

---

## The three gates (check by 11:30)

1. **Rules:** organizers confirm the same project may be submitted to both tracks, and the Blockchain deadline is also 18:00.
2. **Token:** Twin mentors confirm ARGt on Arbitrum + give a test balance; ask whether ARGt exists on Avalanche C-Chain mainnet.
3. **Dual only if:** ARGt is live on Avalanche mainnet **and** 0xGasless sits in the core flow **and** one person can deploy/verify in ≤45 min. Otherwise: **Stablecoins only**.

**Default:** gates 1–2 pass, gate 3 fails → Stablecoins only. That is the expected outcome.

---

## The 6-hour plan

| Time | Who | What |
|---|---|---|
| 11:15 | all | concept locked; 4 wallets; ask Twin for ARGt + gas; confirm track rules |
| 11:45 | P1/P2 | contract skeleton compiles; UI shell |
| 12:45 | P1 | `create` / `mint` / `fund` / `repay` pass in Foundry |
| **13:30** | P1 | **first real ARGt transfer on Arbitrum** — hash saved |
| 14:30 | P2/P3 | end-to-end in UI (request → mint → fund → repay) |
| 15:30 | P3 | default/claim on a separate certificate + public certificate page |
| 16:00 | P4 | rehearsal #1 + **backup video** |
| 16:30 | P4 | deck + README with addresses and hashes |
| 17:00 | all | rehearsal #2; **code freeze** |
| 17:15 | P4 | repo public; submit |
| 17:45 | all | buffer |

**Roles:** P1 contracts · P2 SGR/borrower UI · P3 lender/certificate/design · P4 pitch/ops.

---

## The one thing that cannot slip

The **real ARGt transaction hash**. Nothing else matters until it exists. If by 13:30 there is no ARGt, use a test token for the flow and execute one real ARGt tx for the guarantee fee; disclose it in the README. Do not spend the afternoon on a second chain.

---

## The one risk to say out loud

*"We don't lend, we don't take deposits, and we don't promise yield. The SGR is the regulated guarantor. After the CNV case, we deliberately built a guarantee product — not an investment product."*
