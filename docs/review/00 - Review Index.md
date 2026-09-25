# Review Index: everything that still needs a ruling

Compiled 2026-09-25 from Jo's `Design Review (Jo decisions on OC).md` (23 Sep), her `phase-2` commits 09 Sep to 25 Sep, and our PR #3 branch. The owner rules on every line; nothing here is decided until it appears in `docs/decisions/`.

Legend for "Jo built it": what she actually changed on `phase-2` after writing the review (from her commit diffs). It is a hint for the pack, not a fact until the pack confirms it against `_ref/jo-phase2-8958e49.html`.

## A. Widgets

| W | Widget | Jo's rulings | Jo built it on phase-2 | Our side today | Status |
|---|---|---|---|---|---|
| W01 | Budget Compared to Actual | 3: accept Day/Week grains; reject the "1.9%"; rebuild the Glance sparkline (last point = KPI, favourability on hover) | Sparkline built, then removed again (23 Sep). Grains not seen. | `budget-oc` clone + build sheet rows GL/EX/ST | **Next** |
| W02 | Pension Plans | 4: reject Glance subtitle; add district filter to Glance; "per year" caption; badge "5 plans" + tooltip | Yes, 23 Sep (badge, filter, per year) | `pension-oc` | Undecided |
| W03 | Payroll Distributions | 5: accept pay-types filter, filter-only distributions, nested drill modal; toggle to KPI row (G3); permission gate deferred (simulate a no-permission state) | Detail table/donut split into panels (23 Sep); toggle move not seen | `payroll-oc` | Undecided |
| W04 | Remittance Pledges | 1 (+2 copy trims): accept per-card info controls; everything else = Jo's | New KPI Glance + member-churches drill (15 Sep), a different direction from her own ruling | `remittance-oc` | Undecided |
| W05 | Receivable Invoices Outstanding | 10: six bands + 23 invoices; remove two subtitles; toggle to KPI row; canonical pie; Aging/Customers content toggle with Table/Pie under each; one list at a time in Detail; sortable Customer/Balance/Aging columns; do NOT touch the drill modal | Yes, 24 Sep (six bands, 23 invoices, Aging column, Table/Pie toggle) | `receivables-oc` | Undecided |
| W06 | Insurance Billing Plans | 2: keep "Share"; dependents note becomes an info icon on the column header | Yes, 23 Sep | `insurance-oc` | Undecided |
| W07 | Deposits on Hand | 4: reject pagination (Load more x50); reject scope-gated toggle; rebuild chart click as a per-type modal; accept bigger dataset | Per-type modal on slice/legend tap (24 Sep) | `deposits-oc` | Undecided |
| W08 | My Status | not reviewed | — | — | **Decided 25 Sep: Jo's.** `docs/decisions/W08.md` |
| W09 | Payroll Scheduled Time Off | full redesign, 8 areas: filters; queue/calendar toggle; All/Pending/Approved tiles; time range; queue table (badges, sort, search, approve + confirm, undo, dismiss, bulk); employee drill overlay; Glance; calendar chips; no group-by | Yes, 24 Sep (queue + calendar, filters, confirm dialogs, drill) | `pto-mb` | Undecided |
| W10 | Loans With Balance Due | 9: accept 61-90 band, amount sort, loan-type filter; remove subtitle and KPI badge; canonical donut; aging filter cards under KPI with colours; Table/Pie toggle; flag oldest-first allocation | Yes, 24 Sep (5 bands, amount sort, cards, toggle) | `loans-mb` | Undecided |
| W11 | Fixed Asset Values | 12: no group-by; NBV-led KPI with secondaries; grouped/stacked bars; 7-column table + Load more + search; org currency; empty-group state; accept sorting, 52 assets, one view + toggle; reject donut, server paging, dead download; 4 flags | Yes, 24 Sep (group-by removed, class filter, columns, Table/Chart, Load more +50, 52 assets) | `fixedassets-mb` | Undecided |
| W12 | (empty slot) | — | — | — | Nothing to review |
| W13 | Purchasing Management | 15: Approvals/Encumbrances levels; filters + Table/Kanban + tiles; kanban rework; one status badge; table cleanup + age column; keep Encumbrances; accept detail overlay, badges, dataset; reject cutting Encumbrances, Hold/Close/Void/payments, removing sort; G11; 3 flags | Tiles + Pending-me/All scope (24 Sep); kanban/table rework not confirmed | `purchasing-mb` | Undecided |
| W14 | Main Content Tasks | not reviewed (Jo's only) | — | — | **Decided 25 Sep: Jo's.** `docs/decisions/W14.md` |
| W15 | Bank Balances | 17: keep Jo's; fix Glance clipping (G12); accept table markup, amethyst bars, whole-set scale, 52 accounts; reject paging, no-sort, subtitle, dropped delta; rebuild available-cash framing, basis caption, currency, single-account focus, table default, real states; 3 flags | Sparkline + hover, "Bank Accounts" rename, deep link removed (09-10 Sep); basis chip added then removed | `bank-mb` | Undecided |
| W16 | Accounts Payable By Due Date | 13: keep Jo's v2; one aging-bucket card filter (4 buckets); reject subtitle, dropped "due this week", Status folded into date; "Go to invoice" link; rebuild synced chart, vendor rollup, currency, basis caption, empty state; 2 flags | Aging cards Overdue/This week/This month/Later; "Top vendors owed" (24 Sep) | `payables-mb` | Undecided |
| W17 | Gifts Pledges | 18: keep Jo's pledge-based version; accept inline drill + as-of fix; reject goal pivot, bands, date range, no-sort, export-only; rebuild subtitles, "% fulfilled", goal bar only if stored, canonical bars, currency, empty state; 4 flags | Behind-schedule panel, negative remaining as "ahead", follow-up button removed (15 Sep) | `gifts-mb` | Undecided |
| W18 | Financial KPI (Aditya) | not reviewed | — | Variant A in the band; B/C/D in `_ref/aditya/Demo V2.html` | Owner: which variants ship; finder hook; `fkpActiveV` bug; demo chip |

Rulings to make: **136 widget items** across 13 undecided widgets, plus W18.

## B. Jo's global rules (rule once, as a batch)

| Rule | Jo's rule | Where it bites | Also needs her shell code? |
|---|---|---|---|
| G1 | Size steps down when it does not fit (Glance 275 / Explore 566 / Detail 1148 px) | every widget | yes: her 23 Sep size-fit + container-query rewrite |
| G2 | Drill modals and tables work on small screens | W03 W05 W07 W09 W13 | yes: full-screen modals under 900 px |
| G3 | Data-view toggle on the KPI row; filters top-left | W03 W05 W10 W11 W13 | no |
| G4 | No forced table-beside-chart in Detail | W10 W11 | no |
| G5 | Canonical proportions at every size | all | with G1 |
| G6 | Long lists and legends scroll, with search | W07 W11 W15 | no |
| G7 | No narrative subtitles | W02 W05 W10 W15 W16 W17 | no |
| G8 | Canonical amethyst charts; red only for a true alarm | W05 W07 W10 W15 | no |
| G9 | KPI shows only its number | W01 W10 W11 W13 | no |
| G10 | No group-by control | W09 W11 | no |
| G11 | One toggle design | all | yes: her 23 Sep toggle/chip restyle |
| G12 | Glance never below the fold | W15 + all | with G1 |
| conv. | Load more never pagination; sort on column headers; badges with icons; tappable tiles; tap the row to drill; org currency | W07 W11 W13 W15 W16 W17 | no |

## C. Jo's shell-wide changes since 08 Sep (her code, batch ruling; not in our file)

1. Size step-down + container queries + minimum column widths (G1/G5/G12)
2. Full-screen drill modals under 900 px (G2)
3. New canvas / container / sheet styling: canvas `#FAFAFA`, stroke `#D8D3CD`, 16 px radius, new shadow, white content sheet
4. Filter chips and toggles restyled; Glance chips fixed-width and truncating (G11)
5. Unified pill geometry; padding 16 -> 14 px on several widgets
6. Enter/Space activation and Escape-closes on custom controls
7. Add-widget catalogue dialog (search, previews, module badges, toast); "Edit Dashboard" removed; toolbar "Add widget"
8. Tap a widget title to swap it for another widget
9. "Find a widget" rebuilt as a search field (`.wfind-box`); Glance drill opens Explore in an overlay; hover "View details" hint; expand button removed
10. Root landing page changed (not the demo; ignore)

## D. Cross-cutting (document, do not invent)

- Currency £ -> org currency: W05 W07 W11 W13 W15 W16 W17
- API / backend gaps: W03 permission gate; W10 oldest-first allocation; W13 approve/reject API; W16 pay path -> deep link; W17 received basis + campaign goal; W11 server sort + asset drill; W15 per-account activity + available cash by fund; W18 unreconciled-accounts API, 3-5 account range, thresholds
- Basis confirmations: W16 aging basis; W17 pledge-due basis; W11 % depreciated basis

## E. Housekeeping the owner still needs to rule on

1. Em dashes in Jo's demo *titles* (`mct3` "new user — content tasks only"; the page `<title>`): does the no-em-dash rule cover demo labels?
2. Keep or drop the `sys` "System dashboard" and `nowidgets` demo tabs in the release.
3. Retired v1 code of Jo's (kinds `budget pension payroll remittance ar insurance deposits`, the `all/pt/distpt/metric/chart/table/signups/status` sub-kinds): remove as each widget is finalised, or all at the end.
4. `(OC)` / `(MB updated)` words in registry *titles* of undecided widgets: renamed at each widget's finalisation.
5. `_tools/diag2.js` (print utility, not a test): delete at W01.
6. Lint worklist (auto-fix as defects, per D4): 5 undeclared tokens, 98 duplicate selectors, 50 undeclared static classes.
7. **Remove the TEMPORARY single-widget viewer** (toolbar dropdown + `#w=` / `#k=` hash filter, added 25 Sep as a review aid) before release. Lint T6 reports it while present.

## F. Order

W01 -> W02 -> W03 -> W04 -> W05 -> W06 -> W07 -> W09 -> W10 -> W11 -> W13 -> W15 -> W16 -> W17 -> W18 -> batch B/C -> housekeeping E -> catch-up diff of Jo's phase-2 since `8958e49` -> cmp tab removal -> documentation.
