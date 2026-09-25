# W11 Fixed Asset Values: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W11.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `fixedassets` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `fixedassets-mb` (prefix `faF`). Jo's live version: `fixedassets`.

---

## 1. Jo's PR feedback

- **G10:** remove the "Group by" selector entirely. Classifications (Class, Building, Room, Asset Account) become table columns; a filter narrows, column-header sort reorders. Dropping "None" happens automatically.
- **Rebuild:** an NBV-led KPI with compact secondary reads of total cost, total accumulated depreciation, asset count and % depreciated (G7, G9); the depreciation story as a grouped or stacked bar per group (Cost, Accumulated, NBV together), bar over pie, breaking down by the currently sorted classification column; the 7-column table with key columns prioritised, Load-more, and G6 scroll and search; currency follows the org (fix the hardcoded £); a purposeful empty-group state.
- **Accept from OC:** column-header sorting; the bigger 52-asset dataset; one view with a toggle.
- **Reject from OC:** the donut (brief says bar over pie, and a donut shows one measure at a time); server paging; the dead icon-only download.
- **Flag:** % depreciated basis (accumulated over cost, or over depreciable); replacement-timing data availability; server-side sort; asset-row drill destination. Default view: table.

---

## 2. Jo's notes in her final version

**Registry rows she ships (id · title · size):**

- fa1 · Fixed Asset Values · wide
- fa1_k · Fixed Asset Values (Glance) · kpi
- fa2 · Fixed Asset Values (Annex, accumulated depreciation) · xwide
- fa3 · Fixed Asset Values (nothing set up) · wide · state empty

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L1922 [css]: ===== Fixed Asset Values (fa) =====
- L1979 [css]: Consistent table header styling across every widget
- L1983 [css]: Chips size to their content, never stretch to fill the header
- L1988 [css]: ===== P2/P3 widget styles =====
- L5460 [js]: Insurance Billing Plans: our finalized W06, additive. kind "insurance-mb", prefix insF. 1-to-1 with Jo's insurance widget PLUS the expandable Type -> Plan nested table with a Cost column (Explore AND Detail), Jo's Share column kept alongside Cost. No status/COBRA/pending field (none exists in the real IB module).
- L9210 [js]: ===== Fixed Asset Values (fa, kind:"fixedassets") =====

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Ported 2026-09-07 against Jo's `phase-2` @ `71ca056`. Ours is `kind:"fixedassets-mb"`, prefix `faF`/`FAF_`, entry `faFContent`, CSS root `.faf-*`, 7 registry entries on the `(OC)` convention. Jo's own `fixedassets` widget (`faContent` and her `fa*` helpers) is byte-untouched. Verified by `w11-fixedassets-mb.driver.js`, 435/435.

Our version is the **2026-09-03 from-scratch rebuild** (build 3.6). An earlier Jo-derived port of this widget was deleted by owner instruction after six failed restyle attempts, so this is deliberately not a restyle of her block.

| # | Difference | Jo's version | Ours | Grounded in |
|---|---|---|---|---|
| 1 | Sortable columns | No sort control anywhere in her block | All 7 columns sortable, server-side, default `tag-asc` | Step 4 (v3.6 build), Step 5 v2 API 3 sort whitelist |
| 2 | Table volume | Renders her full register (13 assets), no paging or trimming | Server paging, `FAF_PAGE_SIZE` 10 per page, totals computed over the whole group and unaffected by paging | Step 5 v2 API 3 `MUST PAGINATE` verdict |
| 3 | Views | Table only, no view toggle | Two views behind a toggle: Asset Detail table and Donut. The third Group Bars view was removed 2026-09-03 | Step 4, dated build note |
| 4 | Detail tier | n/a | ONE view full width; the side-by-side pair was retired 2026-09-03 | Step 4, dated build note |
| 5 | Measure control | `fa-measure` re-columns her table at any time | Financial Measure chip is Donut-view-only; legitimate as a client filter because all five measure totals arrive per group | Step 4, Step 5 v2 (five measures served per group) |
| 6 | Download | None | Icon-only download; recorded in the spec as an unfunded gap, possible sixth API | Step 5 v2 open items |
| 7 | Register size | 13 assets | 52 assets across six dimensions | Step 4 Data Contract |

**Open items carried, not resolved.** The 52-asset register is illustrative mock data never verified against Shelby's real fixed-asset tables. Six-dimension, dependent-group and five-measure backend feasibility is UNCONFIRMED, and the three account dimensions deliberately return empty lists. **The default view is contested:** the amended handoff says Donut, the built code treats a null state as Asset Detail; the port follows the BUILT default and the conflict stays flagged (Sign-off row 10). Jo's dossier flags J1-J7 are all Unreviewed, no reconciliation file exists. The invented Depreciation Method filter was removed earlier and remains absent, asserted by the driver.

---

### 3b. Final Version Build Sheet

_No Build Sheet section for W11 (detailed rows were only written for W01-W05)._

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W11.md`._
