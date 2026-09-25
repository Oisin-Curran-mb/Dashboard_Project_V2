# W10 Loans With Balance Due: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W10.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `loans` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `loans-mb` (prefix `lonF`). Jo's live version: `loans`.

---

## 1. Jo's PR feedback

- **Accept:** the fifth aging range (61 to 90); removing the Days-past-due column with default sort amount descending; the loan-type filter driving everything.
- **Remove:** the narrative subtitle; the "$58,147 past due 52%" badge beside the KPI (KPI shows only its number, G9).
- **Balance-by-range donut:** approved in principle but rebuilt to the canonical interactive legible donut (G8); no white-on-white text.
- **Aging buckets as filter cards under the KPI:** each a badge showing the bucket, its percent of total as a large coloured number (never larger than the KPI) and the loan count, tappable to filter. Colours: 90+ red, 61-90 orange, 31-60 amber, 1-30 purple, Current blue.
- **Table / Pie toggle** on both Detail and Explore; side by side on Explore only if it fits (G4, G5).
- **Flag:** the aging range figures depend on legacy oldest-first payment allocation that the modern API does not replicate.

---

## 2. Jo's notes in her final version

**Her info-popover text (what the widget is for):** Every loan that still has a balance owing, grouped by how overdue it is, so you can see the total still out and which borrowers to follow up with.

**Registry rows she ships (id · title · size):**

- loan · Loans With Balance Due · wide
- loan2 · Loans With Balance Due (every loan current) · wide
- loan3 · Loans With Balance Due (single aging band) · wide
- loan4 · Loans With Balance Due (nothing outstanding) · wide · state empty
- loan5 · Loans With Balance Due (Explore, aging and risk) · xwide
- loan6 · Loans With Balance Due (Individual filter, none outstanding) · wide
- loan · Loans With Balance Due · wide
- loan_k · Loans With Balance Due (Glance) · kpi
- loan2 · Loans With Balance Due (every loan current) · wide
- loan3 · Loans With Balance Due (single aging band) · wide
- loan4 · Loans With Balance Due (nothing outstanding) · wide · state empty
- loan5 · Loans With Balance Due (Explore, aging and risk) · xwide
- loan6 · Loans With Balance Due (Individual filter, none outstanding) · wide

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L646 [css]: Glance chart segments: hover feedback (brighten hovered, dim siblings) so slices/bars feel interactive
- L650 [css]: Glance drill overlay: show the Explore view of a glance widget without resizing it on the grid
- L2426 [css]: ---- Header control row (left of the two-row .dep-hd grid) ----
- L2432 [css]: ---- Glance: compact aging read under the KPI ----
- L2443 [css]: ---- Body (Detail: full-width table hero) ----
- L2462 [css]: ---- Table columns (over shell .wt-row primitives) ----
- L2485 [css]: Aging-band group subheaders (the ordered aging report)
- L2495 [css]: ---- Explore: table + aging/risk side panel ----
- L2502 [css]: Band rows double as the table filter (values-as-text, amethyst share bars)
- L2518 [css]: Portfolio-risk stat rows
- L2524 [css]: Most-overdue borrowers (collections priority)
- L2533 [css]: ---- Loading skeleton (data-fetch only) ----
- L2537 [css]: ---- Positive empty state (shared .state; a touch of positive colour) ----
- L2540 [css]: ---- Drill-to-detail focus overlay (single loan) ----
- L5000 [js]: ===== DATA ===========================================================
- L5017 [js]: Loan types are organisation-defined (not a fixed list). Live values.
- L5059 [js]: ===== RENDER =========================================================
- L5120 [js]: Compact stacked severity strip + sr-only aging sentence (values as text).
- L5259 [js]: W10 data view: Table (default) or the balance-by-range Pie.
- L5276 [js]: Balance-by-range interactive donut (G8, amethyst): slices + legend clickable to filter.
- L5286 [js]: Single entry point, dispatched by w.kind==="loans".
- L5299 [js]: Loading only on a data-fetch (loan-type change), never on sort or band pick.
- L5367 [js]: popContent branch (routed from popContent(): loan-type -> loanPopContent).
- L5372 [js]: triggerSelector branch.
- L5393 [css]: ===== end P2/P3 widget blocks =====

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Our version = Jo's Loans widget with six changes, five of them owner-directed and one a latent bug fix. Built against her `index.html` at base commit `a9bc157`, transplanted onto `oisin-v2-rebuild` at base commit `71ca056`. Ported as `kind:"loans-mb"`, prefix `lon`, entry `lonFContent`, sitting alongside her `kind:"loans"` block, which is byte-unchanged.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Aging range ladder | Four ranges: Current (not yet due) / 1-30 / 31-60 / 90+, the last at `hi:Infinity` | Five ranges: Current (not yet due) / 1-30 / 31-60 / **61-90** / 90+ | Her `loanBucketOf` returns the first range where `days <= hi`, so with no 61-90 range every loan between 61 and 89 days fell through and was labelled "90+ days, most overdue". A 61-90 range closes it. Latent in code rather than visible on screen, because her demo data holds no loan in that window (days are 6, 22, 44, 58, 95, 145) | [DESIGN — Step 4 v3.0 item C1] |
| Right-hand panel at Detail | "Aging and risk" panel: clickable aging bands, a Portfolio risk read, and a Most overdue borrowers collections list | Replaced by a "Balance by time range" donut whose legend rows **are** the table filter. Her panel is carried as `lonFAgingPanel`, defined and uncalled, so a rollback is one line | Owner directed the aging panel out and a time-range pie in, so the range breakdown is stated once rather than twice | [DESIGN — Step 4 v3.0, per direct instruction] |
| Loans table | Grouped into aging bands with band group headers and per-band subtotals | One flat list, no group headers and no subtotals. The ranges are a filter instead: the donut legend at Detail, a chip row at Explore | Same instruction: the ranges became a filter, so grouping the table by them restated the same breakdown twice | [DESIGN — Step 4 v3.0, per direct instruction] |
| Days past due column | A sortable "Days past due" column, and it is the default sort (`days-desc`) | Column removed. "Last payment" is kept, with its dormancy flag. Default sort moves to **Amount due descending** (`amt-desc`), and the sort control drops to four columns: Account, Borrower, Last payment, Amount due | Owner directed the column out. The default had to move with it, because a user can neither see nor reverse a sort on a column that no longer exists. Her `loanDaysCell` is carried, defined and uncalled | [DESIGN — Step 4 v3.0, per direct instruction] |
| Route to the chart at Explore | No chart at Explore, and no view toggle anywhere | A **Table / Pie** segment in the header's existing toggle slot at Explore, Table default. The chip filter rides with the table view; the pie carries its own filter in its legend. Detail keeps no toggle, since it shows both at once | Explore is six columns, which cannot hold a table and a legible pie side by side (the W06 measurement put a pie at roughly 320px plus a 250px legend), so the two are switched between. v3.0 left Explore with no route to the pie at all, which the owner caught | [DESIGN — Step 4 v3.1, owner report] |
| What the loan-type filter drives | The filter narrows the table; the aging figures keep reading across all loan types | The filter drives **everything**: `lonFBuckets` derives from the filtered set, so the donut, the chip counts, the header total, the past-due pill and the Glance aging bar all re-read against the selected type | Legacy behaviour was filter-affects-table-only, which is the antipattern Jo's own dossier flags at 11.3 and asks to be fixed consistently across Loans, Deposit Accounts and Accounts Payable. The modern chart endpoint takes no `loanTypeId`, so this needs the parameter added server-side | [DESIGN — Step 4 Filters, as built; API — Step 5 v2 Filter architecture; CODE — /api/dashboard/loans-with-balance-due/chart takes no type param] |
| Empty range presentation | Not applicable: her legend and chips list only ranges holding a balance | The full ladder always renders in order. A range holding no balance is a muted, inert row reading $0.00 and is **not** a filter control. Arcs are drawn only for ranges that hold a balance, since a zero slice has no geometry | Without it the range added by the C1 fix vanished from the legend and the ladder looked incomplete. An empty range is not made clickable because it could only ever produce an empty table | [DESIGN — Step 4 v3.1 item 1] |

**Parity kept (identical to Jo):** the Glance card (total balance due headline, past-due / All current pill, compact amethyst aging bar); the loan-type filter chip as the only fetch, with the skeleton on change and sort/view/range changes instant; the amethyst severity ramp deepening with age, with no red on the bars; the loan-detail drill modal, untouched and still reporting days past due and its Aging row; the "Nothing outstanding" empty state and the Glance "All settled" variant; her `.dep-hd` two-row header with the KPI number and badge on the left; and values carried as DOM text rather than hover-only. Her tiers `kpi` / `wide` / `xwide` map to our Glance / Explore / Detail with no fourth tier introduced. [DESIGN — parity with Jo; Rule 12 sizing]

**Not ported, a real difference:** her `loanScopedEmpty` and `loanControlsHeader` pair renders a scoped "No <type> loans" state. Our Final has no counterpart, so a loan type with nothing outstanding renders our header plus a "No loans match this selection." zeroline instead. Not owner-directed, so it is recorded here rather than justified. [DESIGN — no Step 4 decision either way]

**Open items (carried, not invented).** Two Step 4 sign-off rows were waived for the v3.0 build only and are open and blocking again, both fact gates: the **Status (Active / In Arrears)** concept has no confirmed backing field and is therefore not built and not specced [DESIGN — Step 4 Sign-off row 1]; and the **Modern API does not replicate the legacy oldest-first (LIFO) payment allocation**, it buckets by raw invoice age, so every range figure here depends on backend work that does not exist yet and a raw-age implementation returns different numbers. Step 1 calls this the single most consequential data-accuracy gap in the comparison exercise [API — Step 5 v2 Still needs sign-off; CODE — legacy `loanAging[i] -= payment` overflow, absent from the modern handler]. A further divergence surfaced while writing the spec: even with LIFO replicated, the donut will not equal the legacy pie, because our build assigns one range per loan where legacy split a loan's balance across ranges per invoice [API — Step 5 v2]. Also open: the **"Open loan"** out-destination and **"Record a contact"** are rendered as labelled placeholders with no invented target [DESIGN — Step 4 Sign-off row 3]; there is no export endpoint for loans [API — Step 5 v2 Not in scope]; the **90-day dormancy threshold** is unapproved; and the 2026-08-25 Feargal item **C2** (that loan start and end dates may not exist, which would remove the date-based and past-due calculation entirely) is a live product question that the owner has confirmed does not block this build [DESIGN — Step 4 banner, owner ruling 2026-09-02]. No `Reconciliation - Loans With Balance Due.md` exists, so every dossier flag is unreviewed and none has been acted on.

_Section updated 2026-09-07: transplanted unchanged from the oisin-v2-port build (commit 921392e) onto branch oisin-v2-rebuild (base 71ca056). Verified in place by w10-loans-mb.driver.js, 228 of 228; the full nine-driver suite is green after the edit, including W09 now at 413 of 413 (its two W10-coexistence guards pass with this block in place)._

### 3b. Final Version Build Sheet

_No Build Sheet section for W10 (detailed rows were only written for W01-W05)._

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W10.md`._
