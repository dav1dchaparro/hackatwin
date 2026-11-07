# Twin app & docs — what is actually useful (7 Nov 2026)

## Short answer

The **Explore** page (`app.twin.finance/explore`) is a dashboard, not a building block: total supply, in circulation (USD), and a directory of tools. It is useful for context, not for the build.

The value is in **`docs.twin.finance`** and the **September 2026 reserve report**. Three facts change the plan:

1. **Avalanche is not in Twin's supported chains.** The docs (updated 25 Aug 2026) list **Base, Polygon, Arbitrum One and Ethereum** — no Avalanche. The hackathon PDF lists Avalanche as eligible. Resolve this with the Twin mentors before planning any Avalanche deployment. Until then: **Arbitrum only**.
2. **Seven tokens are live and covered by the reserve report; the docs list ten.** The extra **PRYt, URYt and VENt** are deployed/documented but do not appear in the September 2026 PoR. **ARGt is ~96% of circulation.**
3. **ARGt's reserve is Argentine government securities at 1.09x coverage** (30 Sep 2026), attested by NEXXO Solutions under **agreed-upon procedures** — not a full audit. The other six are backed mostly by USD stablecoins (1.21x–1.95x).

## What the app gives you

| Tool | What it does | Use for the hackathon |
|---|---|---|
| **Explore** | Supply / in circulation, directory of tools | context slide; not a build |
| **Swap** | Curve pools on Arbitrum | FX leg, only if needed |
| **Disperse** | Batch send to many addresses in one tx | shortcut for payroll / ROSCA / aval payouts |
| **Bridge** | LayerZero OFT, 4 chains | only if multi-chain; we are not |
| **Mint / Redeem** | KYC ramp, crypto or bank transfer | how Rosa gets ARGt; not something we build |

## What the docs give you (the real asset)

- **Contracts:** all 10 tokens on 4 chains, verified on-chain, with the warning that the same address can be a different token on another chain. Public RPCs for each chain.
- **Bridge:** LayerZero V2 **OFT burn & mint**, all pairs, `quoteSend` → `send` with `nativeFee`; one adapter per token per chain.
- **Proof of reserves:** 30 Sep 2026 and 10 Jun 2026 reports; 1:1 parity; coverage per token.
- **Legal:** Twin's own disclosure says the stablecoins are *"payment instruments, not investment products, not securities and not legal tender… do not entitle holders to yield, interest, or returns of any kind."* This is exactly the frame our product needs after the CNV case.

## Numbers (30 Sep 2026 reserve report)

| Token | Peg | Circulation (peg units) | Coverage |
|---|---|---|---|
| **ARGt** | ARS | 15,960,039,776.05 | **1.09x** |
| BRAt | BRL | 1,102,995.76 | 1.37x |
| COLt | COP | 103,653,384.69 | 1.32x |
| PERt | PEN | 78,355.00 | 1.85x |
| MEXt | MXN | 872,179.58 | 1.21x |
| CHLt | CLP | 33,263,388.00 | 1.40x |
| BOLt | BOB | 298,574.00 | 1.95x |

ARGt at ARS 15.96 B is roughly **USD 9.9 M** at the rate implied by the marketing site. The other six together are roughly **USD 0.37 M** — pilot scale. That is the strongest argument for making the demo ARGt-only.

## What changes in our plan

- **Kill Option C** (one Avalanche deployment, dual submission) unless Twin confirms an Avalanche deployment that is not in the docs. The "why Avalanche" story has no token behind it.
- **Use the docs' Arbitrum addresses** in the README and the demo; read `symbol()` and `decimals()` at runtime.
- **ARGt only** in the demo. The other six tokens are for the roadmap slide, not the live flow.
- **Cite the reserve report and the legal disclaimer** in the README and pitch. Do not call it an "audit": it is an AUP engagement.

## What to ask Twin

1. Is ARGt live on Avalanche? The PDF says yes; the docs say no.
2. Which of the 10 tokens are mintable/redeemable today, and on which chains?
3. Can we get test ARGt on Arbitrum, and how much?
4. Is there an API/SDK for mint/redeem, or only the app?

## Links

- App: https://app.twin.finance/explore
- Docs: https://docs.twin.finance/stablecoins/README
- Contracts: https://docs.twin.finance/stablecoins/contracts
- Chains: https://docs.twin.finance/stablecoins/supported-chains
- Bridge: https://docs.twin.finance/stablecoins/bridge
- Reserves: https://docs.twin.finance/stablecoins/proof-of-reserves
- Transparency / reports: https://www.twin.finance/transparency
- Sep 2026 PoR: https://cdn.twin.finance/Proof%20of%20Reserves/stablecoins/PoR-260930-en.pdf
