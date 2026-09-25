# W05 Receivable Invoices Outstanding: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W05.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `receivables-mb` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `receivables-oc` (prefix `arO`). Jo's live version: `receivables-mb`.

---

## 1. Jo's PR feedback

- **Bring in:** six aging bands with Current = not yet due and overdue counting any days past due; the bigger demo dataset (23 invoices).
- **Remove / fix:** the "Owed to you, oldest balances first" KPI subtitle; the off-standard "outstanding" subtitle to the standard treatment; data-view toggle inline with the KPI (G3); the pie made interactive and canonical (G8).
- **Restructure the toggles:** Aging and Customers are content; Pie is a data view. Remove Pie from the content toggle. Content toggle is Aging / Customers only, with a Table / Pie data-view toggle under each.
- **Detail shows one list at a time:** under Aging show only aging; under Customers show only customers.
- **Sorting via column headers:** Customers view has Customer, Balance, and a new **Aging** column (age of the unpaid per customer), each sortable. Same principle for the Aging view.
- **Do NOT touch the drill modal at all** (no checkbox, Confirm, or move-to-unposted).

---

## 2. Jo's notes in her final version

**Her info-popover text (what the widget is for):** How much money is currently owed to the organisation in unpaid invoices, and how long those invoices have been outstanding, so staff can prioritise which outstanding amounts need attention first.

**Registry rows she ships (id · title · size):**

- arF · Receivable Invoices Outstanding · wide
- arF_k · Receivable Invoices Outstanding (Glance) · kpi
- arF2 · Receivable Invoices Outstanding (Detail, by customer) · xwide
- arF3 · Receivable Invoices Outstanding (everything current) · wide
- arF4 · Receivable Invoices Outstanding (single aging bucket) · wide
- arF5 · Receivable Invoices Outstanding (nothing outstanding) · wide · state empty

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L252 [js]: Canonical in-widget search field, one interactive state shared by every widget search bar.
- L646 [js]: Glance chart segments: hover feedback (brighten hovered, dim siblings) so slices/bars feel interactive
- L650 [js]: Glance drill overlay: show the Explore view of a glance widget without resizing it on the grid
- L1211 [css]: ---- Header control row (left of the two-row .dep-hd grid) ----
- L1217 [css]: ---- Glance: compact aging read under the KPI ----
- L1228 [css]: ---- Body layouts ----
- L1229 [css]: Detail (wide): the ordered severity ladder is the full-width hero.
- L1233 [css]: Explore (xwide): aging + top debtors side by side, each a quiet-headed panel.
- L1239 [css]: ---- Ordered severity ladder (the hero read). Amethyst gradient, no red. ----
- L1255 [css]: De-emphasised empty buckets, collapsed to one quiet line rather than a sparse zero row.
- L1259 [css]: ---- Loading skeleton (data-fetch only) ----
- L1265 [css]: ---- Positive empty state (shared .state; a touch of positive colour) ----
- L1268 [css]: ---- Drill-to-detail focus overlay ----
- L1289 [css]: Expandable tabs (Details / Attachments / Note / Payments)
- L1315 [css]: Collection next-step actions in the expanded drawer
- L1329 [js]: ---- Header control row (left of the two-row .dep-hd grid) ----
- L1335 [js]: ---- Glance: compact aging read under the KPI ----
- L1346 [js]: ---- Body layouts ----
- L1347 [js]: Detail (wide): the ordered severity ladder is the full-width hero.
- L1361 [js]: Explore (xwide): aging + top debtors side by side, each a quiet-headed panel.
- L1372 [js]: ---- Receivables collections worklist overlay ----
- L1455 [js]: ---- Ordered severity ladder (the hero read). Amethyst gradient, no red. ----
- L1471 [js]: De-emphasised empty buckets, collapsed to one quiet line rather than a sparse zero row.
- L1475 [js]: ---- Loading skeleton (data-fetch only) ----
- L1481 [js]: ---- Positive empty state (shared .state; a touch of positive colour) ----
- L1484 [js]: ---- Drill-to-detail focus overlay ----
- L1505 [js]: Expandable tabs (Details / Attachments / Note / Payments)
- L1531 [js]: Collection next-step actions in the expanded drawer
- L1535 [js]: ---- Drill-modal enhancement (W05 owner delta, Step 4): checkbox + Confirm + dev-intent note ----
- L1546 [js]: ===== Payroll Scheduled Time Off (pto) =====
- L2210 [css]: status-coloured progress fills
- L5430 [js]: Receivable Invoices Outstanding: our finalized W05, additive. kind "receivables-mb", prefix arF. 1-to-1 with Jo's AR widget PLUS the drill-modal enhancement: row checkboxes, an always-enabled Confirm beside Close, and on Confirm the dev-intent note "Move to unposted transactions" with a live selected count.
- L7576 [js]: (2) RENDER -----------------------------------------------------------
- L7828 [js]: Attach once at load (this listener lives inside the ar IIFE block):
- L7928 [js]: (2) RENDER -----------------------------------------------------------
- L7959 [js]: Filter chips: secondary-fill + leading filter glyph (via .filter-chip[data-action]) + trailing chevron. Sized to content.
- L8066 [js]: W05 data view: Table (default) or interactive Pie, under either content view (Aging / Customers).
- L8093 [js]: Interactive canonical donut (G8): slices AND legend are clickable to open the invoices behind them.
- L8242 [js]: (3) HANDLERS ---------------------------------------------------------
- L8272 [js]: popContent branches (routed from popContent(): arF-rc / arF-source -> arFPopContent)
- L8281 [js]: renderModal branch (already in the shell): if(modal.type==="arFdetail"){mr.innerHTML=arFDetailModalHTML();return;}
- L8282 [js]: contentHTML dispatch (already in the shell): if(w.kind==="ar")return arFContent(w);
- L8284 [js]: Bar hover popover (formatted card; reuses .bgt-pop styling)
- L8299 [js]: Attach once at load (this listener lives inside the ar IIFE block):
- L8301 [js]: Worklist search: update in place, keep focus (no full app render).
- L8304 [js]: ===== Payroll Scheduled Time Off (pto) =====
- L9609 [js]: Receivable Invoices Outstanding (MB updated), additive   (inline, on code)
- L9704 [js]: Receivable Invoices Outstanding (MB updated): incremental in-place update, no blink   (inline, on code)
- L9706 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9768 [js]: Receivable Invoices Outstanding (MB updated), additive   (inline, on code)

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Our version = Jo's AR widget corrected and extended by three owner rounds (build v2.1-v2.3, 2026-08-30): six aging bands, an honest overdue headline, a paged and sortable customer rollup, the legacy pie restored as a third view, plus the select-and-confirm "move to unposted" action in the drill modal.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Aging bands | Five bands with Current = anything up to 30 days past due (`hi:30`) | SIX bands: Current (not yet due, `hi:0`) / 1-30 / 31-60 / 61-90 / 91-120 / 121+, with a six-step amethyst ramp led by `--am-100` | A real bug, visible in the owner's screenshot: an invoice 21 days past due was bucketed AND labelled "Current / not yet overdue". Owner ruled six bands; the genuinely missing band was 1-30, not 91-120 as flag C1 was written up | [DESIGN — Step 4 Data Contract, age bucket row; v2.1 changelog; owner screenshots (INV-3002)] |
| Overdue headline | Overdue counts only `days > 30`, so 1-30-day money was excluded from the pill while also reading as "Current" | Overdue is `days > 0` | The other half of the same bug: money genuinely past due must reach the headline figure | [DESIGN — Step 4 v2.1; owner ruling] |
| Zero bands | Empty buckets suppressed from the ladder and collapsed into one "No balance in ..." note | Every band renders as a row even at zero; a zero row is inert (no fill, no click, no hover card, sr-only explains it) | The collapse is exactly what made a real band (91-120) look absent to the owner; an inert row shows the band exists and holds nothing, without shipping a dead control | [DESIGN — Step 4 v2.1] |
| Top overdue customers | A fixed top 6/7 slice, biggest amount only | Paged (7 per page, Prev/Next, "x to y of n") and sortable two ways: Biggest amount (default) and Oldest balance (each customer's most-overdue invoice); ties fall back to the other key; the page index is clamped on render and any filter or sort change resets to page 1 | 23 customers make a fixed slice lossy; the pager can never point past the end of a shortened list | [DESIGN — Step 4 v2.1, Views] |
| Pie view | No chart view | Third toggle segment: the aging bands as a donut with amounts and shares in the legend; zero bands are listed but draw no arc; non-zero legend rows drill like the bars; sized per tier (300px Explore / 210px Detail) and centred in its space | The legacy widget shipped a side-by-side table and pie; restored on the house pie primitives | [DESIGN — Step 4 Views v2.1; Step 1 legacy research; v2.2/v2.3 geometry] |
| View toggle at Detail | Hidden at her largest size (both cuts always shown) | Renders at Detail too: the LEFT panel follows the toggle (aging bars or pie) while Top overdue customers keeps the right panel | The pie must be reachable at both tiers without the two panels fighting for the same space | [DESIGN — Step 4 v2.1] |
| Drill modal (invoice list) | Read-only list, Close only | Row-level checkbox per invoice (no select-all), an always-enabled Confirm beside Close; on Confirm an inline dev-intent note "Move to unposted transactions" with a "(N invoices selected)" count (the note renders only AFTER Confirm; the V2 build drops the old pre-Confirm live count) | Owner wants to select invoices in a band and act on them; the note is a developer-facing signal, not a wired workflow | [DESIGN — Step 4 Interaction Spec; API — Step 5 Move to Unposted logic notes] |
| Mock dataset | 8 invoices | 23 invoices (amounts and names illustrative, Rule 11) covering all six bands, so no band and no pager page is undemonstrable; the band maths, sort and paging are real | The original eight covered only four of six bands and made paging meaningless | [DESIGN — Step 4 v2.1, Rule 11] |

**Parity kept (identical to Jo, one-to-one):** the Revenue Center and Source filter chips as the only two fetches (~800ms skeleton, client re-renders never load); the Details / Attachments / Note / Payments tabs and the collection next-steps in each expanded modal row; the KPI headline + overdue pill and the Glance stacked severity read; the bar hover card; the amethyst-only severity ramp (no red on any chart element); and the empty / single-band demo states. [DESIGN — parity with Jo]

**Open questions carried, not resolved:** (1) the Attachments / Note / Payments tab data sources are unverified and now on the critical path, an open item for Feargal (Step 4 open item 2); the tabs are ported exactly as built. (2) The six-band outcome still needs formal closure of action-list flag C1 with Feargal. (3) The overdue pill tooltip still reads "more than 30 days past due" while the maths is days>0, carried as built in v2.3 and flagged here rather than reworded. (4) Confirm does NOT stage to an entry screen; the move-to-unposted transaction type is an open SME/API item, so the UI keeps only the intent label [API — Step 5 logic notes]. The Bill To blank remains a pre-existing modern-API defect, not a design choice [CODE — BillToDisplay].

_Section updated 2026-09-07: V2 re-port (v2.3) in place on branch oisin-v2-rebuild (base 71ca056), replacing the August block; registry titles now use the (OC) convention; verified by w05-receivables-oc.driver.js, 288/288; W01-W04 drivers re-verified after the edit._

---

### 3b. Final Version Build Sheet

**Status: facts gathered 2026-09-14. No decisions taken yet.** Nothing below is a decision; the
Decision column is deliberately empty until the owner dictates. Recorded now so the groundwork does
not have to be repeated.

| | |
|---|---|
| Jo's live kind / prefix | `receivables-mb` / **`arF`** — CSS 1217-1432, JS 9122-9538, 42 functions |
| Ours | `receivables-oc` / **`arO`** — CSS 3871-4036, JS 18325-18805, 41 functions |
| Also present, must not be touched | Her **original** AR widget, prefix **`ar`**, `kind:"ar"` — CSS 1100-1216, JS 8800-9121. Still live. Both `arF` and `arO` were derived from it |

### ⚠ The rename trap here is worse than W03's or W04's — read before any rebase

W04's trap was two functions. W05 has **three collisions in two unrelated widgets**, and the prefix
boundary is unsafe in *both* directions, so neither a `arF[A-Z]` regex nor a `\barF[a-z]` regex is
usable:

| Token | Where | What a blind `arF` → `arO` does |
|---|---|---|
| `arFmtDate` | her original `ar` block, defined 8870, called 9055 | `arOmtDate` — breaks her live `kind:"ar"` widget |
| `arFiltered` | same block, defined 8872, **called 8× (8877-8895)** | `arOiltered` — breaks every aggregate in that widget |
| `ptoF**YearF**lat` | the Time Off widget, 11534, called 11535-11536 | `ptoFYearOlat` — **the substring `arF` sits inside "YearFlat"** |

And the reverse direction is already contaminated: her `ar` block contains **`arOverdue`**,
**`arOverdueCount`** and **`arOverduePill`**, so the token prefix `arO` is *already shared* with her
namespace. Any tooling that scopes our block by "identifiers starting with `arO`" will pick those up.

Her own namespace also carries lowercase-following tokens that an `[A-Z]`-anchored rule would
silently skip: `arFloading`, `arFdetail` (the `modal.type` string), `arFpop` / `data-arFpop`,
`arFwlq`, `arFwlScroll`, plus ~180 `arF-*` classes.

**The only safe rule: an explicit allow-list.** `arF` + `[A-Z]`, plus exactly `arFloading`,
`arFdetail`, `arFpop`, `arFwlq`, `arFwlScroll`, `arF-*`, `ARF_*`, and the ids `arF`, `arF_k`,
`arF2`-`arF5`. Never a bare substring pass. (`ARF_`/`ARO_` constants are clean — no such token
exists outside the two blocks.) And per the W04 lesson, scope every patch by slicing the file at the
`(OC) CLONE` banner: large stretches of the two blocks are byte-identical, so text anchors collide.

**Two more porting notes.** Her CSS block defines **no** un-prefixed shared classes, so nothing
duplicates on copy (unlike W04, where eleven had to be dropped). But her hover listener keys on
`.arF-barrow[data-arFpop]`, which a rename turns into an exact duplicate of our existing listener at
18803 — the old one must be **removed, not renamed**, or two popover nodes fight over the same rows.
Her `input` listener on `#arFwlq` has no counterpart in ours and would need to survive as `#arOwlq`.

### The headline difference: the two drill modals are different products

This is the decision that will drive the whole widget, so it is stated plainly rather than as a row:

| | Jo's modal (`arFdetail`) | Ours (`arOdetail`) |
|---|---|---|
| Shape | A **collections worklist grouped by customer** | A **flat invoice table** |
| Columns | Customer / Oldest, invoices, last contact / Outstanding | Customer / Bill To / Due Date / Invoice # / Days Past Due / Outstanding |
| Controls | Search, cycling sort (oldest / most owed / name), 12-per-page "Show more", select-all | None of those |
| Row expands to | Contact block (email, phone, last activity) then that customer's invoices, plus Send statement / Record a follow-up / Record a payment | A four-tab drawer: Details / Attachments / Note / Payments, plus Open invoice / Record a follow-up |
| Selection keyed by | Customer name | Invoice number |
| Export | Footer button opening a **preview sheet** (scope line, column chips, first 6 rows) | Header button, fires immediately |
| Also has | Print statements, scroll-preserving incremental re-render | `Confirm` → "Move to unposted transactions" |

Hers answers *"who do I chase and how do I reach them"*. Ours answers *"which invoices are these and
what do I do with them"*. They are not variants of one design.

### What ours changed at the data level (from Step 4 v2.1, already locked there)

- **Six aging bands, not five.** `Current` was redefined `hi:30` → **`hi:0`** (genuinely not yet
  due), and a new **`1-30 days`** band carries what her `Current` was mislabelling.
- **Overdue is `days > 0`**, was `days > 30`. So the headline overdue figure now includes
  1-30-day money.
- Not-yet-due invoices carry **negative** `days`; her dataset has none, so her `Current` band can
  never be exercised as "not yet due".
- Ours adds a **Pie** view, **customer paging** (7 per page), an in-widget **customer sort**
  (Biggest amount / Oldest balance), inert zero-band rows, a Glance sub-caption and a header
  context line. Hers has a bar list only, `.slice(0,6|7)` with no pager and no sort control.

### Live defects found while inventorying — present before any change

1. **Our overdue-pill tooltip is now wrong.** `arOOverduePill` still says "more than 30 days past
   due" while `arOOverdue` counts `days > 0`. Already flagged as the `open:` item in the comparison
   copy at 6637, still unfixed.
2. **Dead code in her block.** `arFDetailTabs` (9356) is defined, never called, and emits
   `data-action="arF-tab"` for which `arFHandleClick` has **no branch**. Roughly 30 orphaned CSS
   rules go with it (the whole first-port table skin our `arO` still uses). Rebasing inherits all of
   it unless dropped deliberately.
3. **Neither version is keyboard-operable.** The bar rows carry `role="button" tabindex="0"` but
   neither block installs a keydown bridge, so Enter and Space do nothing. Several neighbouring
   widgets do install one, so this is a genuine gap in both, not a porting artifact.
4. **Demo-card asymmetry.** She ships **six** live registry cards (`arF`, `arF_k`, `arF2`-`arF5`,
   including `dataset:"current"`, `dataset:"single"` and an empty state). We ship **one** — our five
   variants sit inside a block comment as driver fixtures only.

### Glance / Explore / Detail

| | Jo | Ours |
|---|---|---|
| Glance | Total + overdue pill + stacked band bar + one callout line. **No sub-caption** — the `gl-sub` slot is an explicit empty string | Same plus a sub-caption, "owed to you across N unpaid invoices", and longer callout wording |
| Explore | Two chips (Revenue center, Source), two-segment toggle (Aging / Customers) with `data-tip` copy, bar list | Same chips, **three**-segment toggle (Aging / Customers / **Pie**) with no tips, plus the sort bar and pager in customer mode |
| Detail | Two panels: left follows the toggle, right is a **flat invoice list** capped at 8 with a "View all N invoices" button | Two panels: left is Pie or Aging, right is **always** the customer bar. **No invoice list panel at all** |

### Changes already taken, 2026-09-14 (owner instruction, ahead of the row-by-row pass)

Two fixes made before the decision pass, both on our `arO` side only. Hers is untouched.

**1. Explore did not fit.** Our row metrics are hers verbatim (`gap:14px`, `padding:8px 6px` on
`.arF-body`), but she **collapses** zero bands into one "No balance in…" line while we render all six
as inert rows — a deliberate v2.1 choice, and about two rows taller than the spacing was designed
for. Six rows came to ~355px against a body of roughly 350, so the `121+ days` row clipped off the
bottom. Tightened to `gap:9px` / `padding:6px` with label line-heights at 1.2 / 1.25, which frees
52px. The list is also now a shrinkable flex child with `overflow-y:auto`, because **this shell clips
rather than scrolls** when content overruns (the W04 lesson) — so customer mode with its sort bar and
pager, or a shorter card, degrades to a scroll instead of silently losing a row. Only the
Explore-scoped overrides changed; the Detail panels use the tighter base values and were never
affected.

> Standing tension worth knowing: six always-visible bands is what does not fit her row design.
> Tightening buys it back, but if anything else is added to Explore, collapsing zero bands the way
> she does is the more durable answer.

**2. Detail's second panel now matches hers.** Was: left panel forced to aging (or the pie), right
panel **always** the customer rollup, and no invoice list at any size. Now:

| | Before | After |
|---|---|---|
| Left panel | Aging, or the pie | **The whole toggle** — Aging, Customers or Pie, heading follows |
| Right panel | Always the customer rollup | **Her Invoice detail list** |

So all three toggle options stay reachable at Detail, and the companion panel answers "which invoices
are these" — which hers does and ours had lost. The customer bar's own sort control and pager travel
with it into the left panel.

Two things had to be ported to make it work, since neither existed on our side:

- **`arOInlineList`** — hand-ported from her `arFInlineList`, *not* mechanically renamed, because this
  widget's prefix cannot be find-and-replaced safely (see the trap table above). Kept verbatim from
  hers: the cap of 8, days-descending sort, the "Nd past due" / "Not due" wording, the shell's
  `wt-row` / `lr-main` / `wt-c2` / `dep-total` primitives, and the `depf-more` footer button. Our own
  data functions feed it, so the six-band scheme and the `days > 0` overdue rule still apply.
- **The `all` drill scope** — her footer button opens every invoice in the current filter.
  `arODetailInvoices` only knew `customer` and band keys, so the button had nowhere to go.

Verified: 27 targeted checks plus the existing W05 driver at **292 assertions, 0 failures**; full
suite **6,702 passing**. Two assertions in `w05-receivables-oc.driver.js` encoded the old layout
(left forced to aging, right always customers) and were updated to the new intent rather than
retired — this is a layout change on our V2 code, not a rebase.

<!-- Decision rows to be added here as the owner dictates, using the W05-GL/EX/DE/ST/AL-nn scheme. -->

---

# Implementation notes — code phase

Working notes for whoever makes the code change. **Not part of the difference record**, and not for
Confluence or for Jo. Kept separate on purpose so the tables above stay a clean decision record.

Nothing in this section has been implemented yet.

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W05.md`._
