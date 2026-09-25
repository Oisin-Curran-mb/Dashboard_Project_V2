# W02 Pension Plans: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W02.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `pension-mb` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `pension-oc` (prefix `penO`). Jo's live version: `pension-mb`.

---

## 1. Jo's PR feedback

- Detail and Explore are identical to Jo's; the "By district" view and All-Districts total OC lists as new are already in Jo's version. No change there.
- **Reject:** OC's narrative Glance subtitle.
- **Rebuild (Jo's requests):** add the district filter to Glance; under the KPI add "per year" in the trend-range caption style used on the other Glance widgets; change the badge from "10 appointees" to **"5 plans"** with a hover tooltip "Per year contribution across 5 plans and 10 appointees."

---

## 2. Jo's notes in her final version

**Registry rows she ships (id · title · size):**

- penF · Pension Plans (MB updated) · wide
- penF2 · Pension Plans (MB updated, Detail view) · xwide
- penF3 · Pension Plans (MB updated, no active appointments) · wide · state empty
- penF · Pension Plans · wide
- penF_k · Pension Plans (Glance) · kpi
- penF2 · Pension Plans (Detail view) · xwide
- penF3 · Pension Plans (no active appointments) · wide · state empty

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L2000 [css]: header context line (row 2): quiet, single statement, no big number
- L2006 [css]: body: table scrolls, total row pins beneath it
- L2010 [css]: table rows
- L2022 [css]: row-tap drill affordance
- L2029 [css]: inline share-of-contribution cue (Detail table)
- L2038 [css]: Explore: table + synced chart side by side
- L2045 [css]: horizontal bar chart (Explore, bar view)
- L2061 [css]: pie/donut view (Explore) , reuses shell .donut/.legend/.leg/.pie-wrap
- L2069 [css]: loading skeleton (data-fetch only)
- L2073 [css]: empty state (shared .state; a touch of positive colour on the glyph)
- L2076 [css]: drill-to-detail focus overlay
- L3065 [js]: ---- controls -------------------------------------------------------
- L3218 [js]: ---- Glance ---------------------------------------------------------
- L3392 [js]: ===== RENDER (Jo's pen* logic, renamed penF*) =========================
- L3399 [js]: roll appointees up into one row per plan: amount + appointee count
- L3411 [js]: sorted plan rows; default annual amount high to low
- L3459 [js]: ---- KPI badge ----
- L3480 [js]: ---- table atoms (Jo's, verbatim logic; penF- actions) ----
- L3510 [js]: ---- pie/donut by plan (Jo's penPieChart, promoted to a top-level view) ----
- L3574 [js]: ---- Glance ----
- L3585 [js]: ---- states ----
- L3635 [js]: ===== HANDLERS (Jo's penHandleClick / penPopContent, adapted to penF-) =====
- L3639 [js]: --- click handler branch: if(a&&a.indexOf("penF-")===0&&penFHandleClick(a,id,t))return;
- L3651 [js]: --- popContent() branch: if(pop.type==="penF-dist")return penFPopContent();
- L3657 [js]: --- triggerSelector() branch: if(pop.type==="penF-dist")return '[data-action="penF-dist"][data-id="'+pop.id+'"]';
- L3658 [js]: --- renderModal() branch: if(modal.type==="penFdetail"){mr.innerHTML=penFDetailModalHTML();return;}
- L3660 [js]: ===== REGISTRY (appended after Jo's pen entries in the dashboards array) =====
- L5470 [js]: Remittance Pledges: our finalized W04, additive. kind "remittance-mb", prefix remF. Default view Table (Version A), Pacing bars behind a toggle, per-pledge-term pacing, day-based colour bands.
- L9378 [js]: MB variants dispatched BEFORE the generic empty fallback so each renders its own empty state, not the Deposits copy   (inline, on code)
- L9524 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9525 [js]: Remittance Pledges (MB updated), additive   (inline, on code)
- L9526 [js]: Payroll Distributions (MB updated), additive   (inline, on code)
- L9704 [js]: Receivable Invoices Outstanding (MB updated): incremental in-place update, no blink   (inline, on code)
- L9706 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9707 [js]: Remittance Pledges (MB updated), additive   (inline, on code)
- L9733 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9734 [js]: Payroll Distributions (MB updated), additive   (inline, on code)
- L9735 [js]: Remittance Pledges (MB updated), additive   (inline, on code)

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Our version = Jo's Pension widget plus a new grouped-bar-by-district view and an all-districts aggregate; the rest is kept at parity.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Views | Plan table as the body, with a bar/pie toggle offered only at her largest size | Three views under a Table / Pie / By district toggle, Table as the default; Detail shows table (left) and the active chart (right) as two synced panels | Users compare the plan mix and the district mix, so both a whole-org chart and a per-district chart are first-class, not a largest-size extra | [DESIGN — Step 4 Views v2; Size behaviour] |
| Grouped Bar by District | Not offered | New view: district groups on the x-axis, one bar per plan (same fixed amethyst plan ramp as the table dots and pie), a group total per district, and each bar drills to that plan and that district | Surfaces a second real dimension already in the data (plan spend by district) that a single donut cannot show | [DESIGN — Step 4 View 2; API — Step 5 grouped-bar matrix] |
| District scope | District filter narrows the snapshot | Same, plus an explicit All Districts aggregate that sums every district (48,252.43); a specific district narrows to its own total (District 1 = 22,873.84 / 4 appointees) | The all-districts rollup is the headline a finance user opens on; the district list is shown by Name | [API — Step 5 Example 1; CODE — district = PB_ControlTable ControlTableID shown as Name] |
| Districts roster | Never offered | Also not offered, deliberately: a v2.1 Districts roster view (expandable district rows listing participants) was added per a Feargal ask and then CUT by owner instruction before it ever reached this port; no roster functions or state key exist, and a stale "dist" view state falls back to Table with Table marked pressed at both Explore and Detail | Owner decision 2026-08-30: district stays a filter chip, not a roster view | [DESIGN — Step 4 v2.2 change 1, superseding v2.1] |
| Appointees drill modal layout | Same 960px modal, but an accidental CSS cascade (a later `.modal.modal-wide .modal-b{display:flex}` beating `.pen-detail-modal .modal-b{display:block}` on specificity) squeezes the table to roughly half the modal with its footer stranded beside it | Same 960px modal with the row made deliberate: the table takes the majority of the width and the count/total summary is a 190px rail pinned right whose divider runs the full body height; scoped to our own `penf-detail-modal` class so Jo's modal cascade is untouched | Owner: "the popup needs to be the same size", plus the v2.2a mark-up on the divider | [DESIGN — Step 4 v2.2 change 2 + v2.2a] |

**Parity kept (identical to Jo):** the two-row header with the district filter chip on the left and the KPI money + appointee badge on the left; the sortable plan table; the donut pie and share bars in the fixed amethyst plan ramp (donut kept at Jo's 200px; the mockup Final's 180px was an fc-card proportion trim, not a design decision); the loading skeleton that fires only on a district change (not on a view toggle or sort); the appointee drill modal's columns, footer, export button and 960px width; the empty state; and values carried as DOM text. [DESIGN — parity with Jo]

**Open items (carried, not invented):** the Pension Billing drill-through still has no target URL [DESIGN — Step 4 open item]; export is a stub toast pending a backend decision [API — Step 5]; the Charge / church-organisation column shows mock org names because the real API returns an empty string today, a pre-existing defect [CODE — pension-plans grid].

_Section updated 2026-09-07: V2 re-port in place on branch oisin-v2-rebuild (base 71ca056), replacing the August block; v2.2 stale-dist fallback and deliberate modal flex-row layout applied; registry titles now use the (OC) convention; verified by w02-pension-mb.driver.js, 159/159._

---

### 3b. Final Version Build Sheet

**Base: Jo's exact code.** The only thing carried across from our version is the **context line under
the total, at Glance only**. Explore, Detail and the states stay hers.

### Glance

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W02-GL-01 | Context line under the total | Nothing rendered. Her Glance has an empty slot exactly where this line sits | `contributed a year across 5 plans, all districts` | **Adopt ours** | How many plans, then the district scope. When no district filter is applied it reads `all districts`; otherwise it names the selected district. `plan` singularises at one |

**Open question on W02-GL-01:** when a *single* district is selected, our line names that district
rather than giving a count. So it reads `across 5 plans, north district`, not `1 district`. That is
what our build does and what the screenshot shows, so it is adopted as built, but say the word if you
want a count instead.

Her Glance already computes every value this line needs (the plan count and the district label) for
the screen-reader sentence she renders underneath. Nothing new has to be calculated.

### Explore

No differences adopted. Base is Jo's code, unchanged.

### Detail

No differences adopted. Base is Jo's code, unchanged.

### Other states

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W02-ST-01 | No appointments | Her own empty Glance readout | Same | Keep Jo | The adopted line lives in the has-data branch only, so this state is untouched either way |

---

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W02.md`._
