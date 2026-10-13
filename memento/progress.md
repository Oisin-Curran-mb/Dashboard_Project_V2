# Progress: Shelby Financials Dashboard V2

Last updated: 13 October 2026

## Overall Status

| Gate | State |
|---|---|
| Drivers green (`verify.js`) | ✅ 3431 passed, 0 failed (9 Oct evening); re-verify needed after 11–13 Oct Aditya port |
| Syntax gate (`syntax-check.js`) | ✅ Last known clean |
| Lint (`lint.js`) | ✅ Last known clean (except T6: review viewer still present by design) |
| Handover doc (`handover.html`) | ⚠️ W13 prose stale (deliberately); W19 section status uncertain |
| Public release (`Dashboard_V2_Handover`) | ✅ W01–W08 + W18 released; W09–W17, W19 pending release |

---

## Widget Completion Matrix

| W# | Name | Kind | Code Done | Driver Done | Handover Written | Handover Reviewed | Notes |
|---|---|---|---|---|---|---|---|
| W01 | Budget Compared to Actual | `budget` | ✅ | ✅ | ✅ | ✅ Released | — |
| W02 | Pension Plans | `pension` | ✅ | ✅ | ✅ | ✅ Released | — |
| W03 | Payroll Distributions | `payroll` | ✅ | ✅ | ✅ | ✅ Released | — |
| W04 | Remittance Pledges | `remittance` | ✅ | ✅ | ✅ | ✅ Released | — |
| W05 | Receivable Invoices Outstanding | `receivables` | ✅ | ✅ | ✅ | ✅ Released | — |
| W06 | Insurance Billing Plans | `insurance` | ✅ | ✅ | ✅ | ✅ Released | — |
| W07 | Deposits on Hand | `deposits` | ✅ | ✅ | ✅ | ✅ Released | — |
| W08 | My Status | `mystatus` | ✅ | ✅ | ✅ | ✅ Released | Jo's version kept (D11) |
| W09 | Payroll Scheduled Time Off | `pto` | ✅ | ✅ | ✅ Draft 9 Oct | ⏳ Pending owner review | — |
| W10 | Loans With Balance Due | `loans` | ✅ | ✅ | ✅ Draft 9 Oct | ⏳ Pending owner review | — |
| W11 | Fixed Asset Values | `fixedassets` | ✅ | ✅ | ✅ Draft 9 Oct | ⏳ Pending owner review | — |
| W13 | Purchasing Management | `purchasing` | ⚠️ | ⚠️ | ⚠️ Stale prose | ⏳ Pending | See W13 open question below |
| W14 | Main Content Tasks | `tasks` | ✅ | ✅ | ✅ | ✅ Released | Jo's version kept (D11) |
| W15 | Bank Balances | `bank` | ✅ | ✅ | ✅ | ⏳ Pending owner review | Jo's block, not converted to WIDGETS.register |
| W16 | Accounts Payable By Due Date | `payables` | ✅ | ✅ | ✅ | ⏳ Pending owner review | — |
| W17 | Gifts Pledges | `gifts` | ✅ | ✅ | ✅ | ⏳ Pending owner review | Rebuilt on owner's three rulings; OC version kept |
| W18 | Financial KPI | *(band)* | ✅ | ✅ | ✅ | ✅ Released | Variant A only; Aditya's latest |
| W19 | Alerts & Actions | `alerts` + `alerts2` | ⚠️ | ⚠️ | ❓ Uncertain | ⏳ Pending | Aditya's `alerts2` (split pane) ported 11–13 Oct; original `alerts` also present; handover withdrawn from public release |

---

## W13 Open Question (BLOCKING for W13 sign-off)

Commit `8e36ab1` (9 Oct, late) built four logic rulings the owner wanted recorded in MD only:
- Rejected-row requests hidden from the whole widget
- Holds per row with held-by-others left in the viewer's lists
- Coming to you keeps Approve
- Newest first (default sort)

Owner said: *"stop changing logic this only supposed to MD file"*

**Decision needed**: keep `8e36ab1` build changes, or revert `index.html` + W13 driver to `d35f13c`?

Also open:
- Should "Coming to you" requests offer Approve? (currently yes)
- Should request table default oldest-first now that Jan orders sit on top?

---

## Release Gate Items (still open)

| Item | Status |
|---|---|
| Remove single-widget review viewer (`viewOnly`, `viewOnlySelectHTML`, `hashchange` listener, `viewOnly(` call) | ⏳ Open — stays until owner finishes reviewing (lint T6 reports it) |
| 11 widgets carry review fixtures beyond 3 sizes on non-primary tabs | ⏳ Open |
| `.w01-*` vs `.bgt-*` duplication (89 identical rule bodies) | ⏳ Open |
| 56 duplicate selectors (9 are cross-block name collisions) | ⏳ Open |

---

## Phase Completion Summary

| Phase | Status |
|---|---|
| Phase 0: Clean slate | ✅ Done (25 Sep 2026) |
| Phase 0b: Comment diet, registration plumbing, pilot | ✅ Done (25 Sep 2026) |
| Phase 1: Review packs | ✅ Done |
| Phase 2: Review + finalise, per widget | ✅ Done (last: W17, 28 Sep 2026) |
| Phase 3: W18/Aditya KPI | ✅ Done (28 Sep 2026) |
| Phase 4: Collapse to release candidate | ✅ Largely done; release gate items remain |
| Phase 5: Documentation | ⏳ In progress — handover doc written per widget, owner review pending for W09–W17 |
| Phase 6: Publish | ⏳ W01–W08 + W18 published; W09–W17 + W19 pending sign-off |

---

## What's Left to Build / Decide

1. **W13 decision** — owner must rule on `8e36ab1` keep-or-revert
2. **W19 finalisation** — clarify final state of `alerts` vs `alerts2`; write/update handover section
3. **W09, W10, W11, W13** handover sections — owner review needed
4. **W15, W16, W17** handover sections — owner review needed
5. **Release gate**: remove review viewer when owner says done reviewing
6. **Next release**: W09–W17 + W19 into `Dashboard_V2_Handover` (owner must say when)
7. **Correction doc** (`Correction doc.xlsx`) — known corrections not yet triaged/applied in this session

---

## Known Issues

| Issue | Widget | Status |
|---|---|---|
| W13 handover prose describes old Save/Cancel editable grid | W13 | Deliberate (owner said do not update); pending decision |
| W13 shots 02 and 05 predate Jan–May data | W13 | Stale screenshots; depends on W13 decision |
| W19 handover section status uncertain | W19 | Clarify with owner |
| Aditya port (11–13 Oct): items NOT ported | Various | Deleted W09 status-column width rule, duplicate `.ptof-info-cap`, `W09:false` in switchboard, Deposits pop-up min-height, two PTO pop-up hunks — if Aditya intended these, he must say |
| Review viewer still live (lint T6) | Shell | By design; remove when owner says |

---

## File Size (approximate)

| File | Lines | CRLF |
|---|---|---|
| `index.html` | ~13,867 | ✅ |
| `handover.html` | Large (multi-section) | — |
