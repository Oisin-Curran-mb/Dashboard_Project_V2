# W07 Deposits on Hand: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W07.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `deposits-mb` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `deposits-oc` (prefix `depO`). Jo's live version: `deposits-mb`.

---

## 1. Jo's PR feedback

- **Reject pagination:** use a "Load more" button in batches of 50.
- **Period option:** already in Jo's Compare To; nothing to add.
- **Reject the scope-dependent breakdown toggle:** it forces a staged, multi-click flow and would need an Apply button. The all-accounts long list is solved by G6 (scroll and search), not by gating the toggle.
- **Chart click (rebuild):** on All account types the legend / donut toggle stays consistent (a legend click does not re-scope the main filter). Tapping any account type, on a slice or in the legend, opens a modal with that type's pie, correct filtering applied, and the by-account breakdown inside the modal. A single account type has no donut, so nothing there.
- **Accept:** the bigger dataset. Row detail modal untouched (parity). The dropped fourth size tier is a non-issue (three sizes system-wide).

---

## 2. Jo's notes in her final version

**Her info-popover text (what the widget is for):** Money your organization holds on behalf of others, such as congregation or member deposits that may earn interest, shown here as a current balance with a comparison delta and a balance trend over time.

**Registry rows she ships (id · title · size):**

- depF · Deposits on Hand · wide
- depF2 · Deposits on Hand (Detail view) · xwide
- depF3 · Deposits on Hand (Glance) · kpi
- depF4 · Deposits on Hand (a single account type) · wide
- depF5 · Deposits on Hand (no data) · wide · state empty
- s1 · Deposits on Hand · wide

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L120 [css]: KPI glance: number + mini trend SIDE BY SIDE, never a full chart
- L230 [css]: Grid, not stacked flex rows: the toggle row and the search/break-toggle row share one right-hand column, so whichever is wider sets the column width and the other stretches to match it exactly — search bar and toolbar always line up, instead of each sizing to its own content.
- L244 [css]: KPI number/badge always starts in column 1 (left), even when the header top row has nothing in column 2 (e.g. Remittance, Fixed Assets)
- L246 [css]: Multi-column table totals reuse the row column structure so numbers sit under their columns
- L252 [css]: Canonical in-widget search field, one interactive state shared by every widget search bar.
- L261 [css]: Fills the shared right-hand column edge-to-edge, so it renders exactly as wide as the view-toggle pill row above it — search and breakdown-toggle never both render at once, so this can always claim the full column.
- L264 [css]: Visually hidden but present in the DOM — real screen-reader text, not a hover-only tooltip. Used to fix Budget Compared to Actual's confirmed-live gap: amounts/variance existed only as SVG geometry + hover, absent from the accessibility tree.
- L370 [css]: Explore panels each carry their own view bar so the two charts can be set to different grains (e.g. Month bars beside a YTD line).
- L373 [css]: Compact, self-contained table sized to the widget: Period fills, the three number columns are fixed and right-aligned, and Variance carries the colour + % so there's no separate redundant "Result" column crowding it.
- L555 [css]: deposit-accounts depth content
- L754 [css]: Glance: single flat white card, no inner panel
- L817 [css]: ===== My Status (mys) =====
- L949 [css]: Glance: interactive chip row (account picker + overdrawn drill)
- L1012 [css]: ===== Payroll Distributions (pr): scope dropdown + distribution badges =====
- L1112 [css]: Approvals kanban: lanes = approval stages, cards = orders, tap to act
- L1211 [css]: ---- Header control row (left of the two-row .dep-hd grid) ----
- L1329 [css]: ---- Header control row (left of the two-row .dep-hd grid) ----
- L1847 [css]: header context line (row 2): quiet, single statement, no big number
- L1983 [css]: Chips size to their content, never stretch to fill the header
- L2000 [css]: header context line (row 2): quiet, single statement, no big number
- L2151 [css]: totals row: reuses the .dep-total weight, kept on the grid
- L2426 [css]: ---- Header control row (left of the two-row .dep-hd grid) ----
- L2596 [css]: Gifts drill modal: size to content, no fixed tall empty sheet
- L2600 [css]: ===== Gifts/Remittance rebuild to Deposits pattern =====
- L2614 [css]: ===== Budget Compared to Actual (MB updated): ONLY the new visuals the owner deltas introduce. Everything else reuses Jo's .bgt-* / .dep-hd / .filter-chip / .scope-chip / .vtoggle / .delta-pill / .wt-* / .state / .modal / .bgt-rm-* / .bgt-pop-* / .tr-* classes and Pathway tokens. =====
- L2795 [css]: ===== Deposits on Hand (MB updated): only the few visuals the owner deltas add. Everything else reuses Jo's .dep-hd / .scope-chip / .vtoggle / .vt / .tr-* / .pie-wrap / .donut / .legend* / .dep-search / .dep-q / .wt-* / .dep-total / .state / .skeleton / .acctm* / .mi / .dd-search / .menu-scroll classes and Pathway tokens. =====
- L2813 [css]: ===== Glance KPI secondary line: ONE consistent pill component across every widget (size, padding, radius, tokens, icon, touch target, motion). Colours still come from each pill's own rule; only the geometry is unified here, placed last so it wins. =====
- L3091 [css]: ---- header (Detail / Explore): two-row .dep-hd --------------------
- L3465 [css]: ---- header (Detail / Explore): two-row .dep-hd ----
- L3904 [css]: ---- header (Detail / Explore): two-row .dep-hd ---------------
- L5418 [js]: Deposits on Hand: our finalized W07, additive. kind "deposits-mb", prefix depF. 1-to-1 with Jo's Deposits on Hand widget PLUS four owner changes: (1) 50/page table pagination over a 125-account mock (grand total $106,726,837), KPI + subtotals over the full set; (2) scope-dependent breakdown (All Accounts: Total / By Account Type; a type: Total / By Account); (3) chart clicks drill (type re-scopes to By Account, account inert), no chart drill-modal, row modal preserved; (4) Compare To gains a fiscal "period" option between month and quarter. Tiers kpi/wide/xwide only (Jo's "large" dropped).
- L5869 [js]: Detail (full width): Balances = table | by-type pie side by side; toggle to Trend = full-width
- L6017 [css]: Table view uses the SAME row primitives as every other widget's table (.wt-row / .wt-head / .lr-main / .wt-c2 / .wt-sort / .scroll / .dep-total) so it matches Deposits and Payroll exactly. Columns: Period, Budget, Actual, Variance.
- L8685 [css]: ---- header (Detail / Explore) : two-row .dep-hd -------------------
- L8943 [css]: ---- header (Explore / Detail) ------------------------------------
- L9394 [js]: Deposits on Hand (MB updated); relies on the generic empty fallback (deposits copy is correct for it)   (inline, on code)
- L10002 [css]: Trend line chart: hover shows a guideline, dots on each line, and a tooltip listing each account's balance at that point
- L10081 [js]: Owner change 2: unified scope-dependent breakdown. "total" = one ring/line; "group" = By Account Type at All Accounts, By Account at a selected type. The old all-accounts By-every-account branch is gone.
- L10088 [js]: Owner change 4: P is a fiscal PERIOD (Time Window Module: per-org fiscal calendar, span between a month and a quarter), distinct from a calendar month, ordered between M and Q.
- L10109 [js]: Owner change 2 (Trend): scope-dependent 2-option breakdown. All Accounts: Total | By Account Type. A selected type: Total | By Account. No standalone all-accounts By Account.
- L10117 [js]: Owner change 1: table with display-only pagination (50 rows/page). Sort + filter apply first; the Total row (and the KPI headline) cross-foot over the FULL scoped set, never the visible page.
- L10186 [js]: Row-detail modal body (owner change 3 keeps this; only the CHART drill-modal was removed). Reuses Jo's .acctm* classes and her global modal chrome (modal.b path in renderModal).
- L10208 [js]: Owner change 3: chart click drills into scope, it does not expand. A type series sets the top-left scope to that type and flips the breakdown to By Account.
- L10257 [js]: Spark scrub, namespaced to .depf-spark so it never collides with Jo's #depnum-keyed .dep-spark handler; updates this widget's own [data-depf-num].

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Our version = Jo's Deposits widget with four owner-directed changes plus one addition that has no counterpart in hers (the account pop-up); everything else is kept at parity. (Jo titles it "Deposits"; the widget was renamed "Deposits on Hand" by management, rename not yet executed project-wide.)

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Table pagination | Full list, unpaginated | 50 accounts per page with a pager over a 125-account dataset; the KPI total and all subtotals compute over the full filtered set (pagination is display-only); grand total 106,726,837 | Real orgs run to hundreds of depositor accounts, so the table needs paging while the headline stays a true total | [DESIGN — Step 4 owner change 1; API — Step 5 Pagination] |
| Breakdown toggle | A breakdown that did not depend on scope | Scope-dependent: at All Accounts the toggle offers Total / By Account Type only (the standalone all-accounts By Account is removed); with a single account type in scope it offers Total / By Account (that type's own accounts) | Removes a confusing all-accounts account-level view and makes the breakdown mean the same thing as the current scope | [DESIGN — Step 4 owner change 2] |
| Chart click | Clicking a chart series expanded / opened a drill-modal | Clicking an account-TYPE series (donut slice or trend line) re-scopes the top-left filter to that type and switches the breakdown to By Account; clicking an individual ACCOUNT series is inert; the old chart click-to-expand / drill-modal is removed; the table-row detail modal is kept | Owner wanted charts to drill by re-scoping, not to open a separate focus/modal | [DESIGN — Step 4 owner change 3] |
| Compare To scale | Did not include a fiscal Period option | Six options: Previous week / month / period / quarter / fiscal year / calendar year, with the fiscal Period sitting between month and quarter | Owner added a real intermediate fiscal-period delta between month and quarter | [DESIGN — Step 4 owner change 4] |
| Account pop-up (row click) | **None. She has no account pop-up at all** — her `dep*` functions stop at `depContent`, with no `depAcctModalBody` and no `depOpenAcct`, so there is nothing of hers this is derived from | Clicking a table row opens a per-account pop-up: the type badge, that account's balance with its delta against the current Compare To period, and a Trend / Table segment (a nine-point sparkline with y and x axes, or a one-row table reconciling to the account total). It uses her shared `.wt-row` / `.dt-*` / `.wt-c2` column widths exactly as written, in **our own 560px `.depo-acct-modal` shell** — a deliberate duplicate of the generic shell her `renderModal` builds, because her 390px default leaves 354px against 424px of unshrinkable columns | The whole `.acctm*` family is ours, invented with this port; the duplicate shell is the same approach `remOPledgeModalHTML` already takes for the W04 drill, and it costs one appended dispatch line in `renderModal` rather than any change to her widths or her 390px default | [DESIGN — Step 4; owner directions 2026-09-17] |

**Parity kept (identical to Jo):** the account-scope chip (All Accounts / a type / an individual account, searchable); the three views Table (default) / Distribution (donut) / Trend (multi-line); the KPI headline with delta pill and scrubbable sparkline; the account/type detail modal (opened from a table row); the empty and loading states; and values carried as DOM text. Jo's fourth size tier (large) is dropped, mapping her four tiers to our three (Glance / Explore / Detail = kpi / wide / xwide). [DESIGN — parity with Jo; Rule 12 sizing]

**Resolved (owner, 2026-08-05):** the out-of-widget drill-through is dropped for v1 (the in-widget row detail modal is enough; there is no jump to a module screen, since none exists) [DESIGN — owner]. Historical period-end balances for Trend and non-current Compare To are computed **on demand** for the first draft, to be optimized (precomputed) later if needed [DESIGN — owner; API — Step 5]. **Still open:** the balance tie-out against the modern DHAccount.CalcBalance is a backend concern not addressed here [CODE — DHAccount].

**Open item carried, not resolved (flagged 2026-09-07):** the Step 4 doc’s Interaction Spec says Compare To also drives "the overlaid line in Trend"; the built V2 Final has NO comparison overlay on the Trend chart (Compare To drives the KPI delta pill and the table’s Trend % column only). The port follows the BUILT behaviour, no overlay; whether the doc or the build should move is an open question for the owner. [DESIGN — Step 4 vs build conflict]

_Section updated 2026-09-07: V2 re-port (v2.0) in place on branch oisin-v2-rebuild (base 71ca056), replacing the August block. Deltas from the old port: the table pager is now the built page-N-of-M shape (prev/next + "Showing X to Y of Z accounts"; the old Load-more is gone); the widget renders its OWN empty/loading/error states, the empty state triggering on the account count (zero accounts) per the Step 5 v2 spec; a trend LINE click now drills exactly like the legend (type re-scopes + By Account, account inert; our canvases opt out of the shell’s shared isolate-on-click); the row-detail modal’s table keeps the account-number disambiguator (dossier gap #14); Escape closes the scope/Compare To popover; decorative icons carry aria-hidden; registry titles use the (OC) convention. Verified by w07-deposits-mb.driver.js, 224/224; W01-W06 drivers re-verified after the edit._

---

### 3b. Final Version Build Sheet

_No Build Sheet section for W07 (detailed rows were only written for W01-W05)._

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W07.md`._
