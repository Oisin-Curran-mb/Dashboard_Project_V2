# W06 Insurance Billing Plans: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W06.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `insurance-mb` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `insurance-oc` (prefix `insO`). Jo's live version: `insurance-mb`.

---

## 1. Jo's PR feedback

- **Reject:** the "Share" to "Share of total" relabel; keep "Share."
- **Change:** remove the "Counts include employees and their dependents" subheading; replace with an info icon on the "Insurance type / plan" header, shown on hover only.
- Nothing else changes.

---

## 2. Jo's notes in her final version

**Registry rows she ships (id · title · size):**

- insF · Insurance Billing Plans · wide
- insF_k · Insurance Billing Plans (Glance) · kpi
- insF2 · Insurance Billing Plans (Detail view) · xwide
- insF3 · Insurance Billing Plans (no plans set up) · wide · state empty
- insF4 · Insurance Billing Plans (Dental filter, none set up) · wide

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L1847 [css]: header context line (row 2): quiet, single statement, no big number
- L1851 [css]: body: table scrolls, total row pins beneath it
- L1855 [css]: plan cell: name over a small muted type label
- L1862 [css]: inline share-of-enrolment cue (replaces the donut)
- L1870 [css]: zero-enrolment plans: present, but de-emphasised (never clutter)
- L1875 [css]: Detail: by-type group header rows + indented plans
- L1884 [css]: total strip
- L1887 [css]: glance caption + empty state
- L1891 [css]: loading skeleton (data-fetch only)
- L1922 [css]: ===== Fixed Asset Values (fa) =====
- L5460 [js]: Insurance Billing Plans: our finalized W06, additive. kind "insurance-mb", prefix insF. 1-to-1 with Jo's insurance widget PLUS the expandable Type -> Plan nested table with a Cost column (Explore AND Detail), Jo's Share column kept alongside Cost. No status/COBRA/pending field (none exists in the real IB module).
- L8915 [js]: Explore (wide): one clean, flat, sorted table.
- L9039 [js]: (2) HELPERS
- L9198 [js]: outside click: close the inline type popover unless the click is inside it

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Our version = Jo's Insurance widget one-to-one, with an expandable Type-to-Plan table that adds Share-of-total + Cost columns and, since v2.2, the restored legacy pie beside it.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Breakdown table | Flat plan list at Explore; a non-expandable group only at Detail | Plans nested under their insurance TYPE as an expandable table (types as parents with subtotals, collapsed by default, instant no-fetch toggle) in both Explore and Detail | Owner wanted the sub-categories shown in table form, plans grouped under their type, expandable, in the view | [DESIGN — Step 4 owner change, both views] |
| Cost | Enrolled count only | Adds a Cost column per plan and per type, alongside the enrolled count; the footer row "Total (all types)" carries total enrolled and total cost | Owner wanted both count and cost per plan and per type | [DESIGN — Step 4 owner change; API — Step 5 v2 Cost = SUM of enrolment Rate; CODE — IBEmployeePlan.Rate / IBPlanRate] |
| Share | Shown, headed "Share" | Kept in both Explore and Detail, on both parent (type) and child (plan) rows, same meaning as Jo (row enrolled / grand total in view); relabelled "Share of total" so it reads explicitly against the totals footer | Owner asked to keep the Share in both views; the 2026-08-25 Feargal call asked the column to say what the percent is a share OF | [DESIGN — Step 4 owner change + v2.1 Feargal call] |
| Chart | **No chart, and deliberately so, not an omission.** Her own code comment beside the share bars says they are in place because "with only a handful of plans it makes uptake instantly scannable (the job a donut did, but table-native)". So this row is a genuine design disagreement, not a gap we filled | The legacy pie restored (v2.2): an amethyst donut of enrolment by plan (five-shade ramp --am-600 to --am-200, colour keyed to fixed plan order). Explore shows ONE view at a time behind a Table / Pie segment, Table the default (a stale view state falls back to the table); Detail shows BOTH at once, table left 58 / pie right 42 with a dividing rule; Glance charts nothing | Step 1 records the original widget as a side-by-side table and pie; the owner directed its restoration; 6 columns cannot hold both legibly at Explore | [DESIGN — Step 4 v2.2; DOC — Step 1 research] |
| Zero-enrolment plans vs the chart | n/a (no chart) | Listed in the table but never charted, with a note stating how many plans are uncharted and why; a filter whose plans all have zero enrolment gets a chart-empty state naming the filter ("No plan has an enrolment to chart for [type]") | Legacy behaviour: zero-enrolment plans were table-only; the note keeps table and chart from silently disagreeing | [DOC — Step 1 research; DESIGN — Step 4 v2.2] |
| Chart hover / drill | n/a | Hovering a segment or its legend row shows plan, count and percent via a native title tooltip; legend rows are plain text with cursor:default, no drill anywhere | Legacy hover honoured; the original widget had no drill-down | [DOC — Step 1 research] |
| Chart sizing | n/a | v2.4 measured sizing: legend capped 250px at Explore / 200px at Detail (plan names can never truncate), donut grows via flex-basis 320/240 per tier with min-width:0 / max-width, container-driven flex-wrap stacking, leftover space centred on both axes | Set from browser measurement (chart-fill-check.js), not reasoning; a viewport media query never fires because a widget's width comes from its card | [DESIGN — Step 4 v2.4] |

**Parity kept (identical to Jo):** the Glance KPI card (total enrolled + plan-count pill + "employees and dependents" caption); the insurance-type filter chip as the only fetch (800ms skeleton; sort, expand and the view segment instant); the amethyst Share bars; the "No insurance plans yet" empty state; and a zero-enrolment plan shown as a 0 / 0% row. [DESIGN — parity with Jo]

**Accessibility added with the pie:** the donut SVG carries role="img" and an aria-label stating the charted total and plan count; every segment carries a title naming plan, count and percent; each legend row states its count and percent as DOM text, so colour is never the only signal. [DESIGN — Step 4 v2.4 accessibility]

**Resolved (owner + code, 2026-08-05):** Cost is the per-enrolment premium; the Cost column shows the **total premium** (SUM of each enrolment's Rate). The code splits every enrolment into an employer share (Rate minus RateIndividual) and an employee share (RateIndividual), so employer-only or employee-only totals are derivable from the same data later if wanted; EmployerBilled and PreTax are flags on the enrolment [CODE — IBEmployeeRepository; DESIGN — owner default = total premium]. Dependents carry their own premium and are counted.

**Open questions carried, not resolved:** (1) pie-as-default at Explore was never owner-confirmed; Table stays the default and the question is carried open, not flipped here [DESIGN — Step 4]. (2) The coverage-tier (IBTypeElection) third level is intentionally not surfaced (future). (3) The "total cost" definition (total premium vs employer share vs employee share, PreTax handling) remains a product/SME definition choice; the data is derivable either way [DESIGN — Step 4 open items; API — Step 5 v2].

_Section updated 2026-09-07: V2 re-port (v2.4) in place on branch oisin-v2-rebuild (base 71ca056), replacing the August block; registry titles now use the (OC) convention; verified by w06-insurance-oc.driver.js, 280/280; W01-W05 drivers re-verified after the edit._

---

### 3b. Final Version Build Sheet

_No Build Sheet section for W06 (detailed rows were only written for W01-W05)._

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W06.md`._
