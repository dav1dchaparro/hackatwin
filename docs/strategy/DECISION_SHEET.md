# HackaTwin — Decision sheet
### Saturday 7 Nov 2026 · submission 18:00 · team of 4

---

## The call

**Track:** Stablecoins only. **Concept:** `Aval` — social collateral, priced on-chain.
**Chain:** Arbitrum One with real ARGt (Option A). **Do not build two deployments.**

**Why:**
1. The Stablecoins rubric gives 25% to "the Twin token is the core". A peso credit guarantee passes that test; a ported Avalanche app does not.
2. Every on-chain credit winner verified in 2025–26 is USD-denominated (Cred-Fi, Strevvo, Ghost, Dow, Efy). **Local-currency credit is the open lane.**
3. A focused demo rehearsed three times beats two demos rehearsed once — and the demo is 50% of the score.

---

## The concept in five lines

1. **Rosa, 44**, informal worker, no payslip, no property. Wants **ARGt 300,000** for a moto. Bank asks for a guarantor; fintech offers **120% TNA**.
2. **Two people who trust her** (daughter, neighbor) lock **15% each** of the loan in ARGt as a capped first-loss guarantee.
3. The contract **prices the risk**: coverage 30% → rate falls from **120% to 45%**. A lender funds. ARGt moves on-chain.
4. Repayment is a **waterfall**: lender → avalistas' fee → borrower. Default → the aval is **seized automatically**; the avalista loses only her stake.
5. The repayment record becomes a **portable `legajo`**: next loan = less aval, lower rate.

**Pitch line:** *"Rosa no tenía garantía. Tenía una red."*
**Close:** *"El banco pide garantías. Nosotros las creamos."*

---

## The numbers that matter

| Number | Value | Source |
|---|---|---|
| Informal workers | **43%** (5.8 M) | INDEC Q4 2025 |
| Fintech delinquency | **29.6%** (banks 12.3%) | CEPA/BCRA, May 2026 |
| Debtors / in arrears | **20.9 M / 5.8 M** | CEPA/BCRA |
| Inflation | **33.4% y/y** (Sep 2026) | INDEC |
| Consumer credit rate | **60–120% TNA** | market, [ASSUMPTION] |

---

## The three gates (check by 11:30)

1. **Rules:** organizers confirm the same project may be submitted to both tracks, and the Blockchain deadline is also 18:00.
2. **Token:** Twin mentors confirm ARGt on Arbitrum + give a test balance; ask whether ARGt exists on Avalanche C-Chain mainnet.
3. **Dual only if:** ARGt is live on Avalanche mainnet **and** KUMPLY or 0xGasless sits in the core flow **and** one person can deploy/verify in ≤45 min. Otherwise: **Stablecoins only**.

---

## The 6-hour plan

| Time | Who | What |
|---|---|---|
| 10:50 | all | concept locked; 4 wallets; ask Twin for ARGt + gas |
| 11:15 | P1/P2 | contract skeleton compiles; UI shell |
| 12:00 | P1 | `create`/`stake`/`fund` pass in Foundry |
| **13:30** | P1 | **first real ARGt transfer on Arbitrum** — hash saved |
| 14:30 | P2/P3 | end-to-end in UI (create → 2 stakes → fund → repay) |
| 15:30 | P3 | seizure/stress test + `legajo` page |
| 16:00 | P4 | rehearsal #1 + **backup video** |
| 16:30 | P4 | deck + README with addresses and hashes |
| 17:00 | all | rehearsal #2; **code freeze** |
| 17:15 | P4 | repo public; submit |
| 17:45 | all | buffer |

**Roles:** P1 contracts · P2 borrower/avalista UI · P3 lender/legajo/design · P4 pitch/ops.

---

## The one thing that cannot slip

The **real ARGt transaction hash**. Nothing else matters until it exists. If by 13:30 there is no ARGt, use a test token for the flow and execute one real ARGt tx for the protocol fee; disclose it in the README. Do not spend the afternoon on a second chain.

---

## The one risk to say out loud

*"We don't lend, we don't take deposits, and we don't promise yield. After the CNV case, we deliberately built a guarantee product — not an investment product."*
