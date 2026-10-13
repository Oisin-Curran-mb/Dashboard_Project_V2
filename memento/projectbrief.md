# Project Brief: Shelby Financials Dashboard V2

## Project Identity
- **Product**: Shelby Financials Dashboard V2
- **Owner**: Oisin Curran (decision authority on all design and product matters)
- **Client**: Value Labs
- **Repo**: `Dashboard_Project_V2` on GitHub (`main` branch), served at https://oisin-curran-mb.github.io/Dashboard_Project_V2/
- **Working path (Oisin's machine)**: `C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2`
- **This machine's path**: `/Users/adityabhaskarrao.l/Desktop/Final Widgets`

## Core Goal
One clean, product-ready `index.html` for Value Labs — a Shelby financial dashboard demo built from Oisin's PR #3 branch, with every Jo design difference consciously ruled on, Aditya's KPI widget added, and three accompanying documents:
1. V1 → V2 changes (for Value Labs)
2. Change rationale (for the manager)
3. Per-widget logic documentation

## What V1 Is
V1 = `main`'s `Widget Container Demo/index.html`, identical to Jo's `phase-2` @ `e0a04c5` (19 Aug 2026). This is what Value Labs has today. Reference copy: `_ref/v1-main-e0a04c5.html`.

## Key Decisions (from docs/PLAN.md)
| # | Decision |
|---|---|
| D1 | Base is PR #3 branch (`OisinBranch` @ `198ffd5`). Jo's `phase-2` is NOT merged. |
| D2 | One local skill (`v2-port`) for porting, using Jo's live styling from `_ref/`. |
| D3 | Repo layout: `index.html` at root, `_tools/`, `_ref/`, `docs/`. |
| D4 | Owner rules on everything; defects auto-fixed and logged. |
| D5 | Jo's latest V2 (`phase-2` @ `8958e49`) is the comparison reference, frozen in `_ref/`. |
| D6 | CRLF line endings throughout (never LF). |
| D8 | One self-contained block per widget (CSS, data, render, popups, handlers, registry). Registered via `WIDGETS.register(kind, {...})`. |
| D9 | Widgets finished one at a time end to end. |
| D10 | Comment diet: keep what/why, remove history. |
| D12 | Table header rule: header cells carry same width/alignment classes as body cells. |
| D13 | Jo's Demo/Spec toggle ported into the shell. |

## Phases Status (as of 13 Oct 2026)
- **Phase 0 (clean slate)**: Done
- **Phase 1 (review packs)**: Done
- **Phase 2 (finalise widgets)**: Done — all 17 widgets decided
- **Phase 3 (W18 KPI)**: Done
- **Phase 4 (collapse)**: Largely done (cmp tab gone, losing copies gone)
- **Release gate**: OPEN — `viewOnly` review aid still live (lint T6 reports it)
- **Phase 5 (documentation)**: In progress — handover.html being built
- **Phase 6 (publish)**: Not yet started

## Repositories Involved
| Repo | Purpose |
|---|---|
| `Oisin-Curran-mb/Dashboard_Project_V2` | Working repo — edit here only |
| `Oisin-Curran-mb/Dashboard_V2_Handover` | Public handover for Value Labs |
| `Oisin-Curran-mb/Dashboard_Project` | Aditya's fork — read-only source for W18/W19 |
| `helloimjolopez-collab/design-sandbox` `main` | V1 — pull only |
| `helloimjolopez-collab/design-sandbox` `phase-2` | Jo's Phase 2 — styling authority |
| `MBAccounting` (Azure DevOps) | Legacy product code — read-only |
