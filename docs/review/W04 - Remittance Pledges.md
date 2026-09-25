# W04 Remittance Pledges: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W04.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `remittance-mb` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `remittance-oc` (prefix `remO`). Jo's live version: `remittance-mb`.

---

## 1. Jo's PR feedback

- **Accept the per-card info controls, with the copy trimmed:**
  - On track: keep "Within about a month's worth of payments either side of what was expected by now." Remove "A pledge that has just paid sits here."
  - Ahead: keep "Further ahead than about a month's worth of payments, or paid in full." Remove "Pledges with no pledge amount set are counted in none of the three."
- Everything else on W04 reads the same as Jo's; approved as-is.

---

## 2. Jo's notes in her final version

**Registry rows she ships (id · title · size):**

- remF · Remittance Pledges · wide
- remF2 · Remittance Pledges (Detail view) · xwide
- remF3 · Remittance Pledges (no pledges set up) · wide · state empty
- remF4 · Remittance Pledges (Glance) · kpi

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L2105 [css]: the "data as of" line sits where the view toggle would (right of chip)
- L2109 [css]: ---- table (shared by Detail compact + Explore full) ---------------
- L2128 [css]: header row: quiet, sticky, one sort-control style (.wt-sort)
- L2133 [css]: activity cell: name, optional paid-of-annual sub, pacing bar
- L2144 [css]: row interactivity: whole row taps through to the payment-history drill
- L2151 [css]: totals row: reuses the .dep-total weight, kept on the grid
- L2155 [css]: per-row "no pledge" chip (rare edge; neutral, never alarming)
- L2159 [css]: ---- Glance pacing read --------------------------------------------
- L2166 [css]: ---- receipts-through popover --------------------------------------
- L2173 [css]: ---- skeleton (data-fetch only) ------------------------------------
- L2179 [css]: ---- payment-history drill (modal) ---------------------------------
- L2210 [css]: status-coloured progress fills
- L2222 [css]: accessible status pills: colour + icon + text
- L2229 [css]: member-church drill table
- L2590 [css]: Bounded full-size sections (match other widgets)
- L2596 [css]: Gifts drill modal: size to content, no fixed tall empty sheet
- L2600 [css]: ===== Gifts/Remittance rebuild to Deposits pattern =====
- L2605 [css]: Legend belongs WITH the bars view, never floating over a plain table
- L2660 [js]: -- day-based colour scale (text colours, darker for contrast on white) --
- L2673 [js]: -- Option B pacing bar: flat band-coloured fill + a thin navy expected tick --
- L2738 [js]: -- pacing-bars view --
- L2752 [js]: -- KPI (two-number) + pace filter + slim/mini shared bars --
- L2781 [js]: -- Glance pacing read --
- L2783 [js]: -- term line inside the drill modal --
- L2786 [js]: -- bar hover card (body-appended) --
- L2795 [js]: ===== Deposits on Hand (MB updated): only the few visuals the owner deltas add. Everything else reuses Jo's .dep-hd / .scope-chip / .vtoggle / .vt / .tr-* / .pie-wrap / .donut / .legend* / .dep-search / .dep-q / .wt-* / .dep-total / .state / .skeleton / .acctm* / .mi / .dd-search / .menu-scroll classes and Pathway tokens. =====
- L2813 [css]: ===== Glance KPI secondary line: ONE consistent pill component across every widget (size, padding, radius, tokens, icon, touch target, motion). Colours still come from each pill's own rule; only the geometry is unified here, placed last so it wins. =====
- L3818 [js]: View toggle (Progress bars / Table), sibling-consistent with Gifts Pledges (Oisin W04 "Progress Bars default"; brief 11.2).
- L3970 [js]: controls-only header for the filtered-empty case: keep the date + view controls, drop the KPI money and pace badge
- L3974 [js]: ---- drill: payment history focus overlay (modal.type "remdetail") ---
- L4050 [js]: Custom date applies on change (no Refresh button), matching Gifts Pledges.
- L4156 [js]: ===== RENDER ===================================================
- L4159 [js]: ---- date helpers (leap-aware) ----------------------------------
- L4255 [js]: per-activity pbar: pop = "label|pledged|received|expected|remaining|pctFill|pctTick|status|dayPhrase"
- L4256 [js]: binary pace band for colour (behind = saffron, else emerald), matching Gifts/HQ.
- L4258 [js]: pace bucket for the pace filter: behind | ontrack | ahead | neutral(no pledge)
- L4272 [js]: Mini bar for the % Paid table column (Pension small-bar pattern, shared palette).
- L4280 [js]: Pace filter: a normal top-toolbar dropdown (View all / Behind / On track / Ahead).
- L4296 [js]: ---- sort (seq default = conference order) ----
- L4360 [js]: ---- pacing-bars view (Version B presentation) ----
- L4383 [js]: ---- controls + header ----
- L4388 [js]: View toggle: 2-way Table (default) / Pacing bars, shown at Explore and Detail.
- L4397 [js]: KPI: Paid (check) vs Expected-by-now (error, ochre) as two numbers, plus a pace badge.
- L4411 [js]: Per-band stats for the KPI filter cards (count + outstanding).
- L4457 [js]: ===== entry point ==============================================
- L4525 [js]: ===== REGISTRY (see the dashboards[0].widgets array; entries appended there) ===
- L4526 [js]: {id:"remF", title:"Remittance Pledges (MB updated)", kind:"remittance-mb", ...}
- L4528 [js]: ===== HANDLERS =================================================
- L5470 [js]: Remittance Pledges: our finalized W04, additive. kind "remittance-mb", prefix remF. Default view Table (Version A), Pacing bars behind a toggle, per-pledge-term pacing, day-based colour bands.
- L9378 [js]: MB variants dispatched BEFORE the generic empty fallback so each renders its own empty state, not the Deposits copy   (inline, on code)
- L9524 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9525 [js]: Remittance Pledges (MB updated), additive   (inline, on code)
- L9526 [js]: Payroll Distributions (MB updated), additive   (inline, on code)
- L9706 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9707 [js]: Remittance Pledges (MB updated), additive   (inline, on code)
- L9733 [js]: Pension Plans (MB updated), additive   (inline, on code)
- L9734 [js]: Payroll Distributions (MB updated), additive   (inline, on code)
- L9735 [js]: Remittance Pledges (MB updated), additive   (inline, on code)

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Our version = Jo's Remittance widget repositioned as the EXCEPTION side of the pledge pair (W17 Gifts and Pledges owns goal progress): a behind-pace shortfall headline, her three pace cards filtering a flat report table, a two-job receipts date range, and a drill screen down to each pledge's own payment schedule. (V2 v3.5a; the August port's single receipts-through cutoff, pace-filter popover and payment-history drill are replaced in place.)

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Role and headline | Overall pacing read: paid vs expected with a pace badge and per-activity table | THE EXCEPTION widget of the pledge pair (W17 owns goal progress): the headline is the behind-pace shortfall in money, summed PER ROW, with an "N of M behind pace" pill; the "% of pledged" goal pill is gone from Glance and the header | Owner split W04/W17 by role, 2026-08-24: percentages of a goal are W17's language; per-row summing so a pledge running ahead can never mask one running behind | [DESIGN — Step 4 v3.0, owner 2026-08-24] |
| Pace cards | Her three pace cards (Behind / On track / Ahead, count + outstanding money) filter by DAY BAND, so Behind starts at 30+ days behind | Her three-card shape kept as the filter over a FLAT table, but Behind = this widget's own shortfall > 0 rule (any money short); only the remainder splits her way into Ahead / On track | Correctness: her mapping would put two contradicting counts on one screen (a row 10 days behind reading On track under a header counting it behind); the driver asserts card and header agree under every date range | [DESIGN — Step 4 v3.5, deliberate departure] |
| Date range | Single "Receipts through [date]" cutoff (Today / End of last month presets, date field + Refresh) | A receipts WINDOW: This year (default) / Last 30 days / Custom From-To (inline reveal, no Refresh; presets apply on click, Custom on field change). END is the only pacing cutoff (all pacing cumulative to it); START bounds which pledges are in scope (term overlap) and a separate window-receipts figure. Never labelled "fiscal" | SME Edward Eoff 2026-08-10: the pledge dictates which activities display, and the window figure is the second job; window-bounding paid itself would corrupt pacing (cumulative numerator vs windowed one) | [API — Step 5 v2 rangeStart/rangeEnd, windowPaid, hasPledgeInRange; SME — Eoff 2026-08-10] |
| Receipts-only activities | Not distinguished: an activity with receipts but no pledge reads like a zero-expected pledge | A footer line under the table (count + money received), never a card, never filtered away, excluded from the behind-pace headline; the drill states why pacing is suppressed | No commitment means nothing to be behind on; faking zero-expected inflates the exception headline. Backend gap stays open: receipts-only rows need a query path that does not exist today (Sign-off row 7) | [DESIGN — Step 4 v3.0; API — Step 5 v2, row 7 open] |
| Drill | Per-activity payment-history popup (receipts list) | A drill SCREEN on her own drill-modal shell (1240px / 96vw, 88vh cap): summary strip, term line, pace note, then the pledge list 8/page, most behind first, reconciling to the activity row to the cent; a THIRD level expands one pledge to its own payment schedule, receipts applied oldest first, the FIRST SKIPPED DATE named; export scoped to the view shown. Pacing Bars rows open a top-5-most-behind popup on the same shell. Her history popup is preserved behind REMF_USE_POPUP (default false) | v3.1/v3.3/v3.4 owner instructions: which scheduled payment was skipped is the question an exception widget exists to answer; Jo's own shell so the drill reads as hers | [DESIGN — Step 4 v3.1/v3.3/v3.4; API — Step 5 v2 API 3, Pledge Payment Schedule] |
| Pacing calculation | Calendar-year approximation | Per pledge term (Expected = total x elapsedDays/termDays over the pledge's own BeginDate/EndDate) with the four-band day-based colour scale; kept from v2, unchanged in V2 | The calendar-year approach mis-paces multi-year and off-cycle pledges; dev-confirmed calculation-only fix | [API — Step 5 formula; CODE — RM_Pledge.BeginDate/EndDate already queried] |
| Total row | Totals over what the table shows | The Total row covers EVERY activity in scope, including rows a pace-card filter hides and the receipts-only rows, and the caption says so while a filter is active | A filtered table above an unfiltered total would otherwise read as an error; totals maths untouched by the card filter | [DESIGN — Step 4 v3.5] |

**Parity kept (identical to Jo):** her shell primitives (two-row dep-hd header, filter chip, view toggle, modal shell and backdrop, pbar anatomy with the navy expected tick); the two-view Table / Pacing bars toggle; the ~800ms skeleton on a range change only (sort, view, cards and drill are instant client re-renders); Escape/backdrop close; export and open-in-Remittance stubs; and her pace-card look, colour on the icon only with count and money always as text. [DESIGN — parity with Jo]

**Rule 11 / open items (carried, not invented):** pledge sets and payment schedules are DERIVED, deterministic mock data that reconciles to the activity rows to the cent; individual dates are illustrative pending API support. Receipts-only rows still lack a backend query path (Sign-off Readiness row 7, open; waived by the owner for the build only). The once-academic linear-vs-stepped expected question is now load-bearing for the schedule drill. [API — Step 5 v2]

_Section updated 2026-09-07: V2 re-port (v3.5a) in place on branch oisin-v2-rebuild (base 71ca056), replacing the August block; driver w04-remittance-mb.driver.js 329/329; W01—W03 drivers re-verified after the edit._
---|---|---|---|---|
| Table view | Table with pacing shown inline | Version-A report table (Activity, Pledge, Expected, Paid, Outstanding, % Paid, Total), strictly table-only with no in-cell bar or status column | Owner wanted the report table as the base look, kept clean | [DESIGN — Step 4 Views v2, Version A] |
| Pacing bars | Inline with the table | A separate Pacing Bars view behind a Table / Pacing bars toggle (Explore and Detail); bars do not appear in the table view | Owner wanted pacing as its own view (Version B), not mixed into the report table | [DESIGN — Step 4 Views v2, Version B; "remove the bars in the table view"] |
| Pacing calculation | Calendar-year approximation | Per pledge term: Expected = TotalPledge x daysSinceBeginDate / totalTermDays, using each pledge's own BeginDate/EndDate | The calendar-year approach mis-paces multi-year and off-cycle pledges; this is the dev-confirmed calculation-only fix, no new data needed | [API — Step 5 formula; CODE — RM_Pledge.BeginDate / EndDate already queried] |
| Colour scale | Not a day-based scale | Exactly four day-based bands keyed to daysAhead: 30+ ahead (dark green), on track within +/-30 (green), about 30 days behind (amber), 60+ days behind (red); colour is always paired with the status chip text and values | Owner-specified four-band ahead/behind scale so users read pacing at a glance without colour being the only signal | [DESIGN — owner four-band scale; API — Step 5 returns raw numbers, bands are frontend] |

**Parity kept (identical to Jo):** the receipts-through chip (Today / End of last month presets); the per-pledge drill modal; the refresh-commits fetch with the ~800ms skeleton (loading only on a receipts-through commit); Escape/backdrop close; and export / open-in-Remittance stubs. [DESIGN — parity with Jo]

**Resolved (owner, 2026-08-05):** pacing stays linear-by-days; the stepped-by-payment-schedule alternative is not pursued. Frequency/Duration remain in the data, unused for pacing [DESIGN — owner].

_Section updated 2026-08-05._

---

### 3b. Final Version Build Sheet

**Base: Jo's exact code**, and it stays the base — but W04 is **no longer "her widget taken whole"**.
Round 1 changed only the pop-up. Round 2 (agreed and built 2026-09-10) also edits her table: the
column headings go back to the legacy words, the legacy order is restored, `Seq.` comes back, and a
new `Pledges behind` column is added. Recorded honestly here rather than left reading as parity.

What still stands untouched from her: her pacing bars, her pace cards, her band drill, her thru-date
control, her sorting mechanism, her views, her `% Paid` progress bar, her band thresholds and her
loading and empty behaviour. What changes is the pop-up on an activity click, her table's column
set, and three additions on top (grace period, info icons, the second empty state).

### The governing decision: two tiers, two pacing definitions

**The widget is the overview. The pop-up is where the detailed work happens.** That split is
deliberate, and it decides everything else in this section.

| | Widget, every size | Pop-up |
|---|---|---|
| Pacing basis | **Term elapsed.** `expected = goal × (daysElapsed / termDays)` on each pledge's own term, summed | **Instalments due.** For each pledge, the instalments whose due date has passed, from `BeginDate`, `Frequency` and `Duration` |
| Unit of "behind" | Days | Payments |
| Cost | One grouped read, as legacy | Per-pledge iteration, scoped to one activity |
| Answers | "is this activity roughly keeping up" | "who has missed a payment, which one, and how much is unfunded" |

The widget keeps the term-elapsed basis because it is what legacy did, it is adequate for an
overview, and — decisively — **it is the only one that scales.** A mega-church activity can carry
thousands of pledgers, each with its own start and end date; building an instalment schedule for
every one of them to render a KPI tile cannot be indexed and cannot easily be cached, because it
depends on the as-of date. Term-elapsed is a single `GROUP BY` that the database does.

> **Amended 2026-09-10 (round 2).** The split is no longer absolute. `W04-T10` puts **one**
> instalment-derived number on the widget row — the `Pledges behind` count — because the owner needs
> an activity that reads healthy overall to still reveal the one or two pledges behind inside it,
> which is exactly the exception a netted total hides. Every *money* figure on the row is still
> term-elapsed and still one grouped read; only that count crosses over. It carries the same
> live-versus-materialise decision the pledge-list sort does in `W04-AL-07`, and the same two
> options: materialise a missed-instalment count per pledge when receipts post so it becomes a plain
> `SUM`, or compute it live only below a row-count threshold.

The pop-up is scoped to one activity, so the instalment work is bounded by that activity's pledge
count rather than the organisation's.

**Known cost of the split, accepted deliberately:** the activity row nets, so an activity can read
"keeping up" while pledgers underneath it have missed payments. This is the masking the aggregate
rule in the Step 5 spec was written to prevent (`SUM(MAX(0, expected − paid))`, never
`MAX(0, SUM(expected) − SUM(paid))`). It is accepted here because the alternative does not scale.
It must be worded as "the activity is keeping up overall, but these pledgers have missed payments",
never in a way that reads as a defect.

### Why the two numbers will not match, and how that is handled

Most of the pop-up reconciles to the activity row regardless of the split, because most of the
figures are definitional rather than paced: **Goal, Paid, Outstanding and % Paid** are receipts
summed and goal minus receipts. They tie out under either basis.

**Exactly one figure diverges: expected-by-now** — and with it the status chip and the behind
phrase. The two must therefore never appear side by side under the same name. Handled by naming the
basis in the label at both tiers (see `W04-AL-05`), so a reader is told why the numbers differ
instead of being left to assume one is wrong.

### What the pop-up is for

> Clicking an activity answers **"what pledges sit behind this activity, and which of them are
> falling behind?"** — not "what money arrived recently".

Her receipts list is the wrong level. What it shows are the payments made against the activity's
pledges, but flattened, with the pledge each one belongs to and its term stripped out — so a reader
sees amounts arriving without being able to tell which commitment they are paying down or whether
that commitment is on schedule. The pledge list restores the level the widget is actually about:
each pledge, its own term, its goal, what it has paid, what is outstanding, and its pacing status.

### Route structure — no new wiring

Her pacing bars already fire the **same** action as her table rows (`remF-open`), so a bar and a row
open one shared modal. Our version split that into two different pop-ups. Restoring one modal from
both routes is therefore **her own structure**, not a change to it: only the modal that action opens
is different. Our second pop-up is dropped.

### All sizes

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W04-AL-01 | What the activity pop-up lists under the header | **Receipts.** Six-cell summary (Total pledge, Expected by now, Paid to date, Outstanding, % Paid, status chip), term line, status note, then `Receipts on or before <date>` as a Date / Reference / Amount list with a count-and-total footer | **Pledges.** A pledge table — Name, Begin date, End date, Goal, Paid, Outstanding, Status — each name expanding to that pledge's payment schedule and any skipped payments | **Adopt ours** | Her receipts are the payments against the activity's pledges with the pledge and its term stripped out, so they cannot be read as progress against a commitment. The pledge list is the level the widget is about. The summary strip above the list is **not** kept as-is from either version — see `W04-AL-05` |
| W04-AL-02 | Scope and default order of that list | n/a | Every pledge for the activity, sorted most behind pace first | **Adopt modified** | **All** pledges, not only the behind ones — the sort carries the urgency, the filter must not. Default order is most instalments missed first, per `W04-AL-07`. Paging stays as ours has it. Wording must be corrected with it: the modal subtitle reads `Pledges behind this activity` and the panel caption `Pledges behind <name>`, where "behind" means *belonging to* — three words after a pacing status chip, so it reads as "behind pace". Neither string filters anything; both need rewording |
| W04-AL-03 | Export inside the pop-up | Export to Excel in the modal header, exporting the receipts | Export to Excel in the modal header, exporting that activity's pledges | **Adopt ours** | Export covers **what is in the pop-up**: the list of pledges and, beneath each, its transactions. Display-only, as every export in this build is — the button records where the control lives and what it covers; the developers implement the file. Unlike W03, this export is **not** pushed behind the card's 3-dot menu: it is scoped to one activity's pop-up, which the card-level menu cannot express |
| W04-AL-04 | Pacing basis | Calendar-year: `(Annual / 12) × month number` in the grid, day-of-year `/365` in the header note. Two bases on one screen that do not agree, and neither reads a pledge's own term | Term-elapsed everywhere: `goal × daysElapsed / termDays` on each pledge's own term, with the day-based band (±30 / −60) and the phrase "About N days behind schedule" | **Adopt ours for the widget, New for the pop-up** | Widget keeps term-elapsed, per the two-tier decision above. The pop-up switches to **instalments due**, computed from `BeginDate`, `Frequency` and `Duration`. Consequences inside the pop-up: the band stops being defined in days and becomes payments (on track / 1 payment behind / 2 or more behind); "ahead" becomes rare and meaningful, reached only by prepaying an instalment not yet due. Reason the day band cannot be carried into the pop-up: `daysAhead` peaks at exactly one payment interval for a payer who misses nothing, so a fixed 30-day tolerance flags on-time quarterly and semi-annual payers as "30+ days ahead" while taking a full month to surface a real miss. Six of the seven selectable frequencies are non-monthly |
| W04-AL-05 | Pop-up summary strip | Total pledge, Expected by now, Paid to date, Outstanding, % Paid, status chip — all term-elapsed | Identical strip, identical basis | **New** | The strip is rebuilt to the pop-up's own basis. Keeps: total pledged, paid to date, outstanding, % paid — these are definitional and tie out to the activity row either way. Replaces the paced figures with instalment ones: how many pledges have a missed instalment, how many instalments are missed in total, and the unfunded amount. **Both tiers name their basis in the label** so the two expected figures are never presented as the same quantity. See the naming questions below |
| W04-AL-06 | Pop-up behind-pace note | Her note reads "About 102 days behind schedule ($6,712 behind the expected pace)" | Same sentence, same day basis | **New** | Rewritten to the instalment basis, in payments rather than days, naming the count of missed instalments and the unfunded amount. The day-count sentence stays on the widget, where the day basis still applies |
| W04-AL-07 | Pledge list sorting | n/a — no pledge list exists | Fixed order: most behind pace first, no user control | **Adopt modified** | Five sorts, user-selectable from the column headers: **most outstanding by amount**, **most instalments missed** (the default), **oldest / newest pledger** (`BeginDate`), **closest to / furthest from finishing** (`EndDate`, or paid ÷ goal). Note for the devs on cost: four of the five are plain indexed column sorts. **Most instalments missed is not** — sorting on it requires building the schedule for *every* pledge under the activity, not only the page being shown, and it is the default. For a large activity that is thousands of schedules per open. Options to spec: compute live below a row-count threshold and fall back to outstanding-amount ordering above it, or materialise a missed-instalment count per pledge when receipts post so the sort becomes a column |

**Naming — decided in principle, wording still open.** The two expected figures must carry different
labels, because they answer the same question on different bases and will not agree. Recorded as an
owner decision. Three cautions on the specific words, raised 2026-09-10 and **not yet resolved**:

1. **Avoid "absolute" for the widget's figure.** It points the wrong way: term-elapsed is the looser,
   smoothed approximation, while instalments-due is the literal one. "Absolute" would tell a reader
   the approximation is the exact number. Prefer labels that name the basis — the widget's is
   "expected by term elapsed", the pop-up's "expected by instalments due" — rather than asserting
   precision.
2. **"Due" is already taken, and it means shortfall.** Legacy uses it that way twice: the church
   portal's `Due` is `expected − paid` floored at zero, and the pledge grid's "Current Due" is the
   same idea instalment-based. `RM_Company` even ships a configurable `DueLabel` beside
   `YTDExpectedLabel`. Using "Due by now" for the pop-up's *target* would collide with a word
   existing users read as "the amount you are behind".
3. **"For the year" is wrong for multi-year pledges, and legacy already has this bug.** The legacy
   column is called "Annual" but holds `SUM(RM_PledgeDetail.Pledge)` — the **full term** amount. The
   demo's own capital campaign proves it: $30,000 is the whole three-year pledge, not a year of it.
   The screenshot's pledge list carries terms running to 2027 and 2028 under an activity strip
   claiming a 2026 term. So "total pledged for the year" would inherit a misnomer. Either drop "for
   the year", or pro-rate to the window — which nothing in legacy does.

### Glance

No differences adopted. Base is Jo's code, unchanged. Her Glance carries no activity list, so the
pop-up is not reachable at this size.

### Explore

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W04-EX-01 | Clicking an activity row in the table | Opens her receipts pop-up | Opens our pledge drill | **Adopt ours** | The pop-up defined in W04-AL-01. Her row markup and her click action are kept; only the modal they open changes |
| W04-EX-02 | Clicking a pacing bar | Opens her receipts pop-up — the **same** action as her table rows, so bar and row share one modal | Opens a **different, second** pop-up: the same summary and term line, then only the **top 5 pledges furthest behind pace**, no paging, with a caption counting how many are behind | **Adopt ours, single route** | The bar must open the **same** pop-up as the table. Our separate top-5 pop-up is **not adopted** and is dropped — its content is a subset of the drill's first page once the sort is most-behind-first. Because her two routes already share one action, this needs no new wiring: it is her structure, pointed at our modal |

### Detail

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W04-DE-01 | Clicking an activity row or a pacing bar | As W04-EX-01 and W04-EX-02 | As W04-EX-01 and W04-EX-02 | **Adopt ours, single route** | Same behaviour and the same code. The modal is shared across sizes, so this is one implementation, not a second one |

### Other states

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W04-ST-01 | No pledges set up / no receipts | Her empty state, and inside the pop-up a `No receipts recorded on or before <date>` row | Her empty state is untouched; inside our pop-up an empty pledge list | Keep Jo for the widget, ours for the pop-up | The widget's own empty state is hers and is not touched. Only the pop-up's empty message changes, because the pop-up's content changed |
| W04-ST-02 | Activity with no pledge amount set | Her `neutral` status note: nothing to pace against, receipts shown for reference | Same neutral note, plus a term line that says no pledge term falls inside the selected window | Carried with the pop-up | **Open question.** Our extra term line belongs to our date-range machinery, which is **not** being adopted — the range picker stays hers. Say whether that line should come across reworded to her thru-date framing, or be dropped so the neutral note stands alone |
| W04-ST-03 | Pledge whose term has **ended** with an amount still unpaid | No such state. Her day-based chip labels it "60+ days behind" like any other lagging pledge | Same — ours inherits the day band, so it labels it "60+ days behind" too | **New** | Wrong in **both**. Evidenced in the live build 2026-09-10: `Coleman, Derek`, term Feb 1 2025 to Jan 31 2026, goal $320, paid $0 — the term ended six months before the as-of date and nothing was ever paid, yet it reads "60+ days behind". It is not behind, it is **finished and defaulted**, and no amount of catching up is possible inside the term. `Fairchild, Nora` is the same case part-paid ($238 of $683, term ended Feb 28 2026). Needs its own state and wording — under the instalment basis, every instalment is missed and the term is closed. Distinct from "behind", which implies a term still running |
| W04-ST-04 | Activity term line above the pledge list | Renders a single pledge term for the whole activity | Same | **New** | Wrong in both. An activity has **no term of its own** — the line is inheriting one pledge's dates. The live build shows `Pledge term Jan 1, 2026 to Dec 31, 2026` above a list whose pledges run to Jan 2027, Jun 2026 and May 2028. Confirmed in the schema: `RM_Activity` has `StartDate` and `EndDate` columns but the widget's activity aggregate is built from `RM_PledgeDetail` joined to `RM_Pledge`, so the term shown is a pledge's, not the activity's. Either drop the line at activity level, or replace it with a range across the pledges it contains |

---

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W04.md`._
