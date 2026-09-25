# W03 Payroll Distributions: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W03.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `payroll-mb` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `payroll-oc` (prefix `prO`). Jo's live version: `payroll-mb`.

---

## 1. Jo's PR feedback

- **Accept:** the second "All pay types" filter; fixing "All distributions" to filter only (stop mixing filtering by distribution with sorting by pay type); the nested drill (distribution, then employees paid, then their pay types) in a modal overlay.
- **Apply G3:** the data-view toggle moves inline to the KPI row.
- **Permission gate:** deferred. It is not actually built in the demo. At build time, add a simulated "no permission" state so Jo can see it, then decide keep or drop.

---

## 2. Jo's notes in her final version

**Registry rows she ships (id · title · size):**

- prF · Payroll Distributions · wide
- prF_k · Payroll Distributions (Glance) · kpi
- prF_x · Payroll Distributions (Detail) · xwide
- prF2 · Payroll Distributions (by pay type) · wide
- prF3 · Payroll Distributions (one distribution) · wide
- prF4 · Payroll Distributions (no history) · wide · state empty

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L485 [css]: Period control: a single named-period chip (default "This year"), opening one popover. Custom time span is the FIRST row in that popover, with its own From/To fields right there — never a second click deeper than any other option. Clicking inside the popover (including the date fields) never closes it — see data-action="stop" on .pop in renderOverlay().
- L490 [css]: Table "% of total" — a visible bar alongside the text figure (proportion stays in-scope per §10.3; amounts/percentages stay real text, never chart-only, per the accessibility constraint)
- L516 [css]: Drillable distribution rows / donut legend entries (open the pay-type focus overlay).
- L646 [css]: Glance chart segments: hover feedback (brighten hovered, dim siblings) so slices/bars feel interactive
- L650 [css]: Glance drill overlay: show the Explore view of a glance widget without resizing it on the grid
- L1012 [css]: ===== Payroll Distributions (pr): scope dropdown + distribution badges =====
- L5407 [js]: Payroll Distributions: our finalized W03, additive. kind "payroll-mb", prefix prF, default range TM (This month, owner delta).
- L6617 [js]: OWNER DELTA: preset order and set. This month default, smallest first.
- L6619 [js]: OWNER DELTA: Time Window Module definitions (rolling quarter and year).
- L9378 [js]: MB variants dispatched BEFORE the generic empty fallback so each renders its own empty state, not the Deposits copy   (inline, on code)
- L9524 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9525 [js]: Remittance Pledges (MB updated), additive   (inline, on code)
- L9526 [js]: Payroll Distributions (MB updated), additive   (inline, on code)
- L9733 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9734 [js]: Payroll Distributions (MB updated), additive   (inline, on code)
- L9735 [js]: Remittance Pledges (MB updated), additive   (inline, on code)

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Our version = Jo's Payroll widget with a standardised period set, two independent filters, a permission-gated nested employee drill, and one view-scoped export; the chrome and chart language are kept at parity. (V2 v2.6; the August port's single scope chip and by-pay-type grouping view are replaced.)

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Filters | One period chip + one combined scope chip (All distributions / By pay type / one distribution) | THREE chips: Period / Distribution / Pay type. prDist and prPT are independent and combine freely; the "By pay type" grouping view is removed outright (its functions, sort keys, badge column and CSS are tombstoned) | A pay-type filter over the distribution table answers the by-pay-type question better: one comparable row per distribution instead of a long pay-type x distribution list | [DESIGN — Step 4 v2.3, owner instruction] |
| Period presets | This month / This quarter / All time / This year | This month (default) / This period / This quarter / This year / All time, smallest-first, Custom From/To row kept FIRST in the popover | Standardised, ordered period set matching the project's window conventions; adds an explicit fiscal Period option | [DESIGN — Step 4 Filters v2] |
| Rolling window definitions | Calendar-style | This quarter = rolling last 3 months, This year = rolling last 12 months; This period is a distinct fiscal-period param | Matches how finance reads a rolling payroll window rather than a calendar cut | [DESIGN — Step 4 Filters v2; Time Window Module] |
| Drill | Pick a distribution on the chip to see its pay types; no person-level data anywhere | Nested in-widget drill in ONE table at every tier: distribution -> the employees paid in it -> that person's own pay types. Employee amounts are allocated in cents from the distribution x pay-type totals and cross-foot to the penny. NO link-out and NO drill modal (the old focus-overlay drill is removed) | Feargal asked for the full chain to an individual employee's pay breakdown (2026-08-25); the owner reordered it (2026-08-30) so pay types appear once, under the person they were paid to | [DESIGN — Step 4 v2.1 + v2.2; API — Step 5 v2 employee level] |
| Permission | None | Row-level PRF_PAYROLL_PERM gate: without payroll permission, distribution rows render inert (no caret, no button role, no handler path), a chosen distribution falls back to pay-type rows, and no employee name can render; totals and their export stay available | Feargal: access to per-person pay is limited to users with payroll permission; v2.1 supersedes the earlier zero-personal-data rule for permissioned users only, unauthorised viewers still see amounts alone | [DESIGN — Step 4 v2.1; API — Step 5 v2 permission] |
| Sort | Sortable headers including pay-type and distribution keys on the flat table | Amount-descending default (`prSort:"amt-desc"`); header clicks toggle (text columns ascend first, every click flips); only the name and amount keys remain | The flat table's dist/pt sort keys went with the grouping view | [DESIGN — Step 4 v2.3] |
| Export | Card-menu exports only (registry actions) | Card-menu exports kept, PLUS one view-scoped "Export to Excel" button (`btn naked sm`, `data-prf="export-view"`) on the caption row, exporting whatever the filters currently resolve to; per-person and per-distribution exports removed; in this shell the button is styled by the GLOBAL .btn family, so the FC build's v2.6 `.prf-root .btn` fix maps to "already global" here | One export at the top, not tied to a person or a panel (owner instruction); the caption row routes through every data-bearing state so the export cannot be lost | [DESIGN — Step 4 v2.3/v2.4/v2.5/v2.6] |
| Glance headline | Period chip + total | Same: the distribution total for the window (the "N pending approval" headline belongs to W13, not this widget); sr-only text added | Keeps the two payroll widgets' headlines distinct | [DESIGN — Step 4; API — Step 5 v2 headline] |
| Grain / comparison | Not present | Deliberately not added: no grain toggle, no prior-period comparison, and no comparison fields anywhere in the ported block (no total.prior, no diffAmount, no diffPct) | Sign-off decision F3 rejected comparison features for this widget | [DESIGN — Step 4 sign-off F3] |

**Parity kept (identical to Jo):** the two-row header with the chips on the left and the view toggle on the right; the Table / Chart toggle (two segments; a stale "emp" view from the removed Employees segment falls back to Table with Table marked pressed); the percent bars with real figures beside them; the blue-ramp donut with legend hover-sync (the chart no longer drills, the drill lives in the table); the Custom From/To date fields on the shell's caret-restore machinery; the clean empty state when the window holds no runs, plus a distinct "Nothing matches these filters" state naming the filter combination, chips kept reachable in both; and the instant client-side recompute (no fetch, no skeleton). [DESIGN — parity with Jo]

**Open items (carried, not invented):** exports remain honest stubs, both the card menu and the view button (no export backend decided) [API — Step 5]; no Department filter, pay-date anchoring, recurrence, or drill-through-to-module link were added (all cut or rejected in Step 4) [DESIGN — Step 4 What Got Cut].

_Section updated 2026-09-07: V2 re-port in place on branch oisin-v2-rebuild (base 71ca056), replacing the August block; three filter chips (prDist/prPT, prScope gone), nested permission-gated drill, amt-desc default sort, one view-scoped export, (OC) registry titles; verified by w03-payroll-mb.driver.js, 277/277._

---

### 3b. Final Version Build Sheet

**Base: Jo's exact code.** Her Glance is taken whole. Three things change: her distribution drill
modal gains our employee list, her single scope chip becomes our three separate filters, and the
Detail pie legend moves to the right of the donut, which is wrong in **both** versions today.

### All sizes

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W03-AL-01 | Export control | Export sits **only** behind the card's 3-dot overflow menu, as Export as CSV / Excel / PDF | Same 3-dot entries, **plus** an extra export button inside the widget on its own caption row | **Keep Jo** | Export belongs behind the 3 dots. Our in-widget button is not adopted. The 3-dot entries already exist and are display-only; the intent to record for the devs is that they export **the table's contents**. Nothing to build here, only our button to leave behind |

### Glance

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W03-GL-01 | Whole Glance card | Her Glance, including the within-period composition bar under the total | Chip and total only. Our version deliberately deleted her composition bar | **Keep Jo** | Take hers completely, as-is. Nothing from ours is carried across at this size. Rebasing restores the composition bar our version removed |

### Explore

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W03-EX-01 | Clicking a Distribution in the table view | Opens **her** modal: period and distribution chips, the total, a pay-type table (% of total and Amount) with a Total row, a donut with its legend to the right, and Done. No employee detail anywhere | Employee-level drill: an employee table, sortable by Employee or Total pay, each row expanding to that employee's pay breakdown | **Adopt modified** | Keep **her modal exactly as it is** and add our employee table into the empty area beneath the pay-type table, in the left column below the Total row, where the box is drawn on the screenshot. Columns Employee and Total pay, both sortable; a chevron per row expanding that employee's pay breakdown; a `Total, N employees` footer row. The employee table gets **its own scroll container**, so the modal itself does not grow |

**Refined 2026-09-08 (owner):** the employee list is no longer inside her left column. It spans the
**full width across the bottom of the modal, below both columns**, as its own panel with the house
weak border and radius used by the other popups, and an **Employee Break Down** subheading. Everything else
about the row is unchanged.
| W03-EX-02 | Filter chips | Two chips: the period, plus one combined scope chip | Three chips: the period, plus **Distribution** and **Pay type** as two independent filters that combine freely | **Adopt ours** | Distributions and pay types must be separately filterable |

### Detail

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W03-DE-01 | Pie chart legend position | Legend sits **under** the donut | Legend sits **under** the donut — identical, ours is no better | **New** | Wrong in both. The legend must sit to the **right** of the donut, the way it already does at Explore. Cause is known: a single CSS rule forces the donut and legend into a column at Detail only. See the implementation notes for why the fix has to be namespaced |
| W03-DE-02 | Clicking a Distribution in the table view | As W03-EX-01 | As W03-EX-01 | **Adopt modified** | Same behaviour and the same code as W03-EX-01. The modal is shared across sizes, so this is one implementation, not two |

### Other states

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W03-ST-01 | No pay history, and zero-in-range | Her empty state, with the header kept so the period chip is the way back | Same | Keep Jo | Untouched by everything above |

---

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W03.md`._
