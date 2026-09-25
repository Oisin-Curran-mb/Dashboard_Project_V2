# W01 Budget Compared to Actual: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W01.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `budget-mb` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `budget-oc` (prefix `bgtO`). Jo's live version: `budget-mb`.

---

## 1. Jo's PR feedback

- **Accept:** the finer Day / Week interval grains (Time Window Module).
- **Reject:** the "1.9%" percent added beside the headline.
- **Rebuild:** the Glance mini-chart (sparkline). On hover or tap each point must express favourability at that point (variance amount, up or down, favourable or unfavourable colour), and the last point must equal the KPI value (for example 9,300 favourable), not a static dollar figure that does not tie to the KPI.
- **Note:** OC's "interactive Glance / caption" is not a real difference; Jo's Glance already opens those menus.

---

## 2. Jo's notes in her final version

**Her info-popover text (what the widget is for):** How actual income or spending compares to your original budget, per period and year to date. Mid-year budget revisions are not included.

**Registry rows she ships (id · title · size):**

- bgtF · Budget Compared to Actual · wide
- bgtF_k · Budget Compared to Actual (Glance) · kpi
- bgtF2 · Budget Compared to Actual (Detail view) · xwide
- bgtF3 · Budget Compared to Actual (expense budget not set up) · wide
- bgtF4 · Budget Compared to Actual (income budget not set up) · wide

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L264 [css]: Visually hidden but present in the DOM — real screen-reader text, not a hover-only tooltip. Used to fix Budget Compared to Actual's confirmed-live gap: amounts/variance existed only as SVG geometry + hover, absent from the accessibility tree.
- L268 [css]: W01: interactive favourability sparkline in the Budget Glance. Cumulative variance per posted period; last point equals the KPI. Points are focusable so hover AND tap surface the per-point read.
- L278 [css]: Controls are real segmented toggles (Account scope, Period) + a Fiscal-year chip. Toggles for the small fixed option sets (2-3 items), a dropdown chip only where the list genuinely grows (fiscal years, special reports).
- L280 [css]: Legend row now also carries the M/Q/P/Y interval toggle on its right — the legend items sit left, the interval control right, so "what the bars mean" and "how they're sliced" share one line just above the chart.
- L284 [css]: Table view's own little toolbar to hold the interval toggle (the table has no legend).
- L286 [css]: Variance column in the shared table grid + the no-trend empty state
- L301 [css]: Scope popover: the Special report row
- L308 [css]: Special-report picker dialog: two dependent dropdowns on a scrim. The dialog is deliberately tall (fixed height) so both dropdown menus open fully INSIDE it, with room to spare, and never spill past the edge.
- L334 [css]: Two chart colours only: light purple Budget (the plan), dark purple Actual (the result). No red — favourability is read from the hover popover and the headline pill, never from the bar colour itself.
- L345 [css]: Hover on a set of bars: only the neutral column fill darkens a couple steps so the hovered group is obvious. The bars themselves keep their exact legend colours — never recolour them on hover, or the legend and the bars disagree.
- L351 [css]: Custom two-line x-axis (period name + its own signed variance) laid out as a second flex row with the same column count/gap as the bars, so alignment is exact by construction. Variance number is a single neutral colour (no red); its sign carries the direction, the popover carries the good/bad reading.
- L367 [css]: The data-view controls (grain + chart/line/table) sit in their own bar directly on top of the chart/table they act on — separate from the account-scope dropdown in the header, so it's obvious they change the view below, not the scope above.
- L370 [css]: Explore panels each carry their own view bar so the two charts can be set to different grains (e.g. Month bars beside a YTD line).
- L373 [css]: Compact, self-contained table sized to the widget: Period fills, the three number columns are fixed and right-aligned, and Variance carries the colour + % so there's no separate redundant "Result" column crowding it.
- L390 [css]: Global filter-control styling (shell-wide): every interactive filter/scope dropdown — Deposits' account scope, Payroll's period, Budget's scope + time span, etc. — reads as a secondary-fill button with a leading filter glyph and a trailing chevron, so filters are obviously filters. Non-interactive label chips (no data-action, e.g. the KPI-tile scope label) are left alone.
- L395 [css]: Disabled interval letter (coarser than the chosen span): greyed and unclickable.
- L397 [css]: Span chip + M/Q/P/Y toggle kept together, just above the chart.
- L401 [css]: Quiet special-report context line under the KPI number — small, regular weight, muted. Not a headline.
- L406 [css]: Horizontal scroll wrapper for bar charts with many groups; ≤13 groups fill the width with no scroll.
- L409 [css]: Report-line combobox: report names are non-clickable group headings above their selectable lines — a standard grouped-select pattern, all in one popover (no drill-in).
- L412 [css]: Loading motion — a gentle shimmer sweep + a soft spinner. Reused across widgets; both respect reduced-motion.
- L421 [css]: Smoother, more elegant shimmer than the base .sk sweep — softer gradient, gentle ease.
- L425 [css]: Bar hover shows a formatted popover card, not a cramped one-line tooltip: budget and actual on their own rows with swatches, a divider, then the variance and whether it is favourable or unfavourable.
- L962 [css]: bar hover card must sit ABOVE the drill overlay (modal-backdrop is z-index 2000)
- L964 [css]: Overdrawn quick-filter: a small toggle chip in the toolbar (not a KPI tile)
- L2614 [js]: ===== Budget Compared to Actual (MB updated): ONLY the new visuals the owner deltas introduce. Everything else reuses Jo's .bgt-* / .dep-hd / .filter-chip / .scope-chip / .vtoggle / .delta-pill / .wt-* / .state / .modal / .bgt-rm-* / .bgt-pop-* / .tr-* classes and Pathway tokens. =====
- L3429 [css]: ---- controls ----
- L5407 [js]: Payroll Distributions: our finalized W03, additive. kind "payroll-mb", prefix prF, default range TM (This month, owner delta).
- L5877 [js]: o = [value,label,icon,tip,disabled]. A disabled option renders greyed with no data-action (so it can't be clicked) — used when an interval is coarser than the chosen time span (e.g. Year inside a single fiscal period).
- L5881 [js]: Account scope is a DROPDOWN, not a toggle: it isn't a flat 2-3 item set — the third option (Special report) branches into a two-part selection (Report, then Report line), which a segmented toggle can't express. The chip shows the current scope; the popover offers Income / Expense as one-tap options and a Special-report section with the two selects.
- L5953 [js]: Quiet context line for a special report — the full Report · Report line the chip no longer spells out. Small, regular weight, never a bold headline.
- L6086 [js]: Data-fetch loading: scope / report / report-line changes fetch new data, so they flip a transient bloading flag and clear it after a beat — the widget shows a shimmer skeleton meanwhile. Grain / shape / sort are client-side re-renders of data already in hand, so they never trigger a load.
- L6128 [js]: Compact axis/variance formatter, finer than Jo's fmtAxis so the new sub-period (Day/Week) grains keep readable sub-10k labels. Full-dollar figures still use Jo's money().
- L6130 [js]: ---- data accessors & variance math (reuse Jo's data; renamed accessors so this block stays self-contained) ----
- L6137 [js]: ---- controls (Jo's toggle primitive + tooltip convention) ----
- L6140 [js]: Owner delta: the headline dollar variance carries an up/down arrow + leading sign, coloured by favourability exactly like the table's variance column, plus a quiet % of the window's posted budget to its right. Used by the Glance card AND the wide/xwide header so the headline reads the same at every size.
- L6161 [js]: Detail size: bar + line charts side by side, with a Charts / Table swap on the right.
- L6163 [js]: as-of anchor for the two ROLLING windows ("today"): end of Jul 2026, the current date implied by BGT_CUR_PERIOD (period 7 of FY 2026). The real API takes asOf as a parameter.
- L6165 [js]: special-report lines only carry current-FY rows, but the rolling 12-month window reaches into the prior FY, so derive a deterministic prior-FY series (budget 95% of current, actuals a seeded wobble, fully posted). The real API's budget lookup simply spans both FYs.
- L6169 [js]: Flat monthly rows for the selected window. Month/Period = the current month; the two rolling windows walk back n calendar months from the as-of anchor (crossing the FY boundary, so budgets come from two FYs); This fiscal year = fiscal year to date.
- L6179 [js]: Day/Week grain (mock): deterministic synthetic daily data from the monthly figures. Budgets evenly prorated per day (display simplification; the API keeps a budget pace line at sub-period grains); actuals spread across each posted month's days with mild deterministic variation (seeded, no Math.random, so renders are byte-identical); days after the as-of date, and every day of an unposted month, stay null. Cumulative rounding so days sum exactly to their month, keeping the posted-total footer reconciled across grains.
- L6199 [js]: Weeks aggregate days, starting Monday; a first/last week not fully inside the window (fewer than 7 days), or a week only partly posted, is flagged partial.
- L6209 [js]: Aggregate the window's monthly rows to the chosen interval. Day/Week route through the synthetic daily series; Month/Period map 1:1; Quarter/Year group by fiscal quarter/FY. Labels gain a 'YY suffix only when the window crosses years. A group only partly covered by the window, or only partly posted, is flagged partial.
- L6225 [js]: Single, self-contained empty state: icon + one line + the set-up-budget action (reuses Jo's add-budget handler).
- L6228 [js]: Header: row 1 scope chip left (+ span chip at Explore size), Bar/Line/Table toggle right (not at Explore, where each panel carries its own); row 2 the window's variance + pill + info icon, plus a quiet special-report context line.
- L6249 [js]: Grouped bars from already-aggregated interval rows. Two purples only, no red; signed variance under each bar; formatted popover data rides on the column (data-bgtfpop, namespaced so Jo's own bar-hover listener never grabs ours); full text in an sr-only span.
- L6273 [js]: Owner delta: dynamic x-axis label thinning (density from estimated plot width vs label width), so a 12-month span labels every month where it fits and every other month where it does not, with no colliding text at any window/interval/scope.
- L6283 [js]: Line (trend): budget dashed light purple, actual solid dark purple, no red. Values also land in the DOM as an sr-only summary. Owner delta: nearest-point hover columns (bgtF-lcol) ride over the plot carrying the same data-bgtfpop payload as the bars, so the hover card shows Budget/Actual/Variance with a vertical guide on the hovered point.
- L6321 [js]: Table view: Period / Budget / Actual / Variance, sortable, with a "Total, posted so far" footer that sums only the posted periods in the window.
- L6334 [js]: The slicer: span chip LEFT + D W M P Q Y interval toggle RIGHT, kept together just above the chart because they constrain each other.
- L6345 [js]: Glance (KPI size): interactive. The scope chip is the same control as the bigger sizes (opens the scope popover; Special report opens the dialog), the "vs. budget, [window]" caption opens the five-window picker, and the big number carries the same arrow/sign/percent as the header headline.
- L6378 [js]: One Explore panel: its own interval + shape, so the two panels show different cuts of the SAME window (window + scope stay global up in the header). State per side as iA/fA, iB/fB.
- L6389 [js]: Glance = headline only. Wide = header + the chosen view. Explore (largest) = header + two independent panels. Loading only on data-fetch changes (scope, report, window): header controls stay usable while the content area shimmers.
- L6400 [js]: Data-fetch loading only (scope / report / report-line / window). Interval / shape / sort are client-side re-renders of data already in hand, so they never trigger a load.
- L6402 [js]: Special-report picker dialog (reuses Jo's .modal / .bgt-rm-* / .bgt-dd-* / .menu-scroll and her modal/renderModal machinery; namespaced type "bgtF-report" and bgtF-rm-* actions). Two dependent dropdowns: report then line; changing the report resets the line; Apply stays disabled until both are chosen.
- L6420 [js]: Sign-ups: a list with NO natural total, so the optional top metric IS shown (number + trend). Changing the period changes the number/trend only — the list stays "most recent".
- L7811 [css]: contentHTML dispatch (already in the shell): if(w.kind==="ar")return arContent(w);
- L7813 [css]: Bar hover popover (formatted card; reuses .bgt-pop styling)
- L8282 [css]: contentHTML dispatch (already in the shell): if(w.kind==="ar")return arFContent(w);
- L8284 [css]: Bar hover popover (formatted card; reuses .bgt-pop styling)
- L9885 [js]: ---- Budget Compared to Actual (MB updated): namespaced handlers, appended alongside Jo's bgt- handlers ----
- L9971 [js]: Budget Compared to Actual (MB updated) hover: reuses Jo's .bgt-pop card visuals but reads a namespaced data-bgtfpop attribute so Jo's own .bgt-col2[data-bpop] listener never fires on ours (and ours never fires on hers). Handles bars AND the line's nearest-point columns; the partial note is generic (covers week and rolling-edge buckets, not just quarters).
- L9995 [js]: Glance spark scrubbing: hover the deposits sparkline to read the total at that point in time

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Our version = Jo's Budget widget with the reusable **Time Window Module** layered on; everything else is kept at parity.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Interval grains | Month / Quarter / Period / Year (M Q P Y) | Day / Week / Month / Period / Quarter / Year (D W M P Q Y), toggle reads smallest-first with Period before Quarter | Users asked to slice the comparison finer than month; standardised on the reusable Time Window Module | [DESIGN — Step 4 Views/Filters, Time Window Module; owner "add day and week"] |
| Grain availability | All grains always offered | A grain is offered only when it yields 2 to 31 data points for the chosen window; each window defaults to its smallest available grain | Keeps charts legible (no 1-point or 100-point charts) and gives a sensible default per window | [DESIGN — Step 4 Time Window Module availability law] |
| Time windows | Spans: this fiscal year, last fiscal year, all time | This month · This period · This quarter (rolling 3 months) · This year (rolling 12 months) · This fiscal year (YTD) | Standardised window set from the Time Window Module, shared across widgets | [DESIGN — Step 4 Time Window Module] |
| Weekly grain | Not offered | Week grain offered wherever the window's availability law allows it (2 to 31 points), confirmed feasible | A code review indicates a weekly grain is derivable from the GL data, so Week ships rather than staying gated | [DESIGN — owner confirmed 2026-08-05; API — Step 5] |
| Fiscal year scope | Fixed fiscal-year handling | Fiscal year treated as per-organisation (not a global July-June constant); consolidated/master-company rollup must combine child accounts | The org's fiscal calendar varies, and the modern API currently returns empty for master companies, a regression to fix | [API — Step 5 spec requirement; CODE — modern API CompanyNumber=0 returns empty] |
| Headline | Unsigned dollar variance + pill; the explain sentence rides the pill | Signed dollar variance with an up/down arrow, favourability colour, and a quiet % of the window's posted budget; the explain sentence moves to a keyboard-focusable info icon beside the pill | The single variance headline replaced the v1 four-tile KPI strip; arrow + sign + percent make the direction readable at a glance without colour alone | [DESIGN — Step 4 Data Contract "Headline" row + Interaction Spec v2] |
| Glance (KPI size) | Static readout: plain scope label and caption | Interactive: the scope chip opens the scope popover and the "vs. budget, [window]" caption opens the five-window picker; headline carries the same arrow/sign/percent | Owner delta: "Glance is interactive" | [DESIGN — Step 4 Interaction Spec v2, Glance] |
| Line hover and labels | Shared crosshair readout; fixed 4-tick x-axis | Nearest-point hover columns with a dashed vertical guide showing the same Budget/Actual/Variance card as the bars; x-axis labels thin dynamically by plot width so nothing collides at any window or grain | Owner delta: line hover + dynamic label thinning | [DESIGN — Step 4 Interaction Spec v2, Line hover; Fine-Tuning] |

**Parity kept (identical to Jo):** the Income / Expense / Special-report account-scope dropdown with the two-part (Report, then Report line) branded searchable picker; two-purple bars (light budget, dark actual) with favourability shown only in the KPI pill and hover popover, never on the bars; the running YTD total; the two-independent-panel Detail (Explore) layout; the "No trend to show" guard for line view with fewer than 2 points; the no-budget empty state; and the header layout (scope chip left, view toggle right, legend + slicer row above every chart, single mid gridline). The bar-scroll threshold stays at 13 groups, sized for Jo's card widths (the mockup Final's 9/11 compensates for its own narrower cards). [DESIGN — parity with Jo]

_Section updated 2026-09-07: V2 re-port in place on branch oisin-v2-rebuild (base 71ca056), replacing the August block; registry titles now use the (OC) convention; verified by w01-budget-mb.driver.js, 140/140._

---

### 3b. Final Version Build Sheet

**Base: Jo's exact code.** The only thing carried across from our version is the **percentage after the
headline amount**, at all three sizes. Everything else stays hers.

### The figure being added

> Are you **above or below budget**, and by how much **as a percentage**, over the **selected time frame**.

| Property | Value |
|---|---|
| Meaning | The window's variance expressed as a percent of that window's budget |
| Scope | The selected time frame, start to end (the window chosen in the header: This month / period / quarter / year / fiscal year) |
| Maths | `abs(variance) / posted budget for the window * 100`, rounded to one decimal |
| Periods counted | Only **posted** periods. Unposted months are excluded from both the actual and the budget totals, so a part-year window is not diluted by months that have not happened. |
| No-budget case | When the window has no posted budget, no percent renders at all |
| Sign | Unsigned. Above vs below is already carried by the sign on her dollar amount (`+$5,900` / `−$5,900`) |
| Colour | Quiet grey, fixed. It does **not** take the favourability colour; only the dollar amount does |

This is the same figure and the same maths as the Step 3 Final (`Dashboard Widget Mockups.html`,
`bgtFHeadlineInner`), so our version is adopted as built rather than reworked. Both of Jo's render
sites already compute and pass the window totals it needs, so nothing upstream has to change.

### Glance

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W01-GL-01 | Headline percent | None. Her headline builder returns an empty percent | Quiet percent after the amount, e.g. `+$5,900  1.9%` | **Adopt ours** | The figure defined above |
| W01-GL-02 | Headline arrow glyph | No glyph. Direction reads from the signed amount and the Favourable pill | A filled up/down triangle before the sign | Keep Jo | **Not** adopted. Trap: the glyph and the percent are built in the same one-line return, so the percent must be taken without it |
| W01-GL-03 | Sparkline | Sparkline in the KPI row (her 2026-09-08 addition) | None | Keep Jo | Hers is newer than our version, which simply predates it |
| W01-GL-04 | Window caption | `This fiscal year` | `vs. budget, This fiscal year` | Keep Jo | The `vs. budget,` prefix is not adopted; she dropped it deliberately |

### Explore

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W01-EX-01 | Headline percent | None | Quiet percent after the amount | **Adopt ours** | Same figure and maths as Glance, so the headline reads identically at every size |
| W01-EX-02 | Headline arrow glyph | No glyph | Up/down triangle | Keep Jo | Same trap as W01-GL-02 |

### Detail

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W01-DE-01 | Headline percent | None | Quiet percent after the amount | **Adopt ours** | Same figure. Explore and Detail share one render site, so this is the same code edit as W01-EX-01, not a second one |
| W01-DE-02 | Headline arrow glyph | No glyph | Up/down triangle | Keep Jo | Same trap as W01-GL-02 |

### Other states

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W01-ST-01 | No budget set up / nothing posted | Headline reads zero, no percent | Identical: our builder also returns an empty percent when there is no variance, and suppresses the percent when the window has no posted budget | Keep Jo | No behaviour change in these states. Adopting the percent does not alter them |

---

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W01.md`._
