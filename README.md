# HackaTwin 2026 — Aval

Proposal and pitch assets for **HackaTwin 2026** (Sat 7 Nov 2026, Digital House, Buenos Aires).

**Concept:** **Aval** — the on-chain guarantee layer for Latin America's credit guarantee institutions. A guarantee certificate (ERC-721) backed by an ARGt risk pool, issued by an SGR or mutual, verified and enforced by any lender.

## Read this first

| Document | What it is |
|---|---|
| [docs/proposal/HACKATWIN_PROPOSAL.md](docs/proposal/HACKATWIN_PROPOSAL.md) | The full proposal: track decision, market, concept, architecture, build plan, business, risks, sources |
| [docs/strategy/DECISION_SHEET.md](docs/strategy/DECISION_SHEET.md) | One-page call, gates, 6-hour plan |
| [docs/proposal/PITCH_ES.md](docs/proposal/PITCH_ES.md) | 3-minute Spanish pitch, 90-second demo choreography, Q&A |
| [docs/proposal/AVAL_PITCH.pptx](docs/proposal/AVAL_PITCH.pptx) | 9-slide deck (Spanish, editable) |
| [docs/proposal/AVAL_PITCH.pdf](docs/proposal/AVAL_PITCH.pdf) | Deck export for backup |
| [docs/strategy/HACKATWIN_STRATEGY.md](docs/strategy/HACKATWIN_STRATEGY.md) | Earlier research memo (dual-track EV, evidence base); superseded on the concept decision |

## The call

**Stablecoins track only**, on **Arbitrum One**, with **real ARGt**. Do not split the team across two tracks; the only dual-track version worth considering requires real ARGt on Avalanche mainnet *and* 0xGasless in the core flow, and both are unconfirmed.

## Sources of truth

- `track twin.pdf` → clean transcription: [docs/strategy/source/track_twin.txt](docs/strategy/source/track_twin.txt)
- `HackaTwin — Blockchain Track Rules and Requirements (EN).docx.pdf` → clean transcription: [docs/strategy/source/blockchain_track.txt](docs/strategy/source/blockchain_track.txt)
- Extractor: [docs/strategy/source/extract_pdf2.py](docs/strategy/source/extract_pdf2.py) (position-aware; fixes the interleaved-glyph bug of the first extractor)

## Build target

One Solidity core (`GuaranteePool`, `GuaranteeCertificate`, `LoanBook`, `Legajo`), three screens (SGR desk, borrower, lender), a public certificate page, one seeded demo, and **at least one real ARGt transaction hash** on Arbiscan.
