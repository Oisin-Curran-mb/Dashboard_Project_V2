# Final Version Build Sheet — Jo vs OC, per widget, per size

**Status: scaffold. Content is added widget by widget, dictated by the owner.**

This is a **working build sheet**, not the finished difference doc. It exists to drive the code
change for the `(OC)` widgets. Once it is complete and implemented, a separate **true diff doc**
will be written from the resulting code. The existing pair in this folder
(`Jo vs Oisin - Design Differences.md` / `.html`) is untouched by this document.

---

## The end state this sheet builds toward

Every `(OC)` widget **starts as Jo's exact code** — her current live block, copied byte for byte
into the `(OC)` namespace. Nothing of ours is carried across by default.

The final version is then produced by applying **only** the differences marked `Adopt` below, one
at a time. So:

- The default for every row is **Keep Jo**.
- Each row marked `Adopt ours` is an explicit, itemised opt-in.
- For every aspect **not** listed as adopted, the `(OC)` code must stay byte-identical to hers.

This inverts the current state of the file, where the `(OC)` widgets hold our V2 re-port wholesale.

---

## What "Jo" and "Ours" mean here

**Jo** always means **her current live widget** — what her GitHub Pages phase-2 site serves today.
Never a retired or superseded version of hers.

For W01–W07 she adopted our August port as *the* widget in her own commit `faa6507` and has evolved
it since, so her live widget is the `*-mb` kind. For W09–W17 she never adopted ours, so her own
kinds are her live widgets. Verified against the file:

| Widget | Name | **Jo** = her live kind | **Ours** = kind |
|---|---|---|---|
| W01 | Budget Compared to Actual | `budget-mb` | `budget-oc` |
| W02 | Pension Plans | `pension-mb` | `pension-oc` |
| W03 | Payroll Distributions | `payroll-mb` | `payroll-oc` |
| W04 | Remittance Pledges | `remittance-mb` | `remittance-oc` |
| W05 | Receivable Invoices Outstanding | `receivables-mb` | `receivables-oc` |
| W06 | Insurance Billing Plans | `insurance-mb` | `insurance-oc` |
| W07 | Deposits on Hand | `deposits-mb` | `deposits-oc` |
| W09 | Payroll Scheduled Time Off | `pto` | `pto-mb` |
| W10 | Loans With Balance Due | `loans` | `loans-mb` |
| W11 | Fixed Asset Values | `fixedassets` | `fixedassets-mb` |
| W13 | Purchasing Management | `purchasing` | `purchasing-mb` |
| W15 | Bank Balances | `bank` | `bank-mb` |
| W16 | Accounts Payable By Due Date | `payables` | `payables-mb` |
| W17 | Gifts Pledges | `gifts` | `gifts-mb` |

Not in scope: **W08** (My Status) and **W14** (Main Content Tasks) are hers alone, and **W12** is an
empty slot in the widget list.

Baseline: Jo's `a548419` ("widget demo update 2026-09-08 11:23:16"), branch `oisin-v2-rebuild`.

---

## How to read a row

Each widget gets four subsections, in this order:

1. **Glance** (`kpi` tier)
2. **Explore** (`wide` tier)
3. **Detail** (`xwide` tier)
4. **Other states** — empty, loading, no-data, single-band, and any other demo state that widget carries

Every difference is one row with a stable ID:

| Prefix | Meaning |
|---|---|
| `Wnn-GL-nn` | Glance |
| `Wnn-EX-nn` | Explore |
| `Wnn-DE-nn` | Detail |
| `Wnn-ST-nn` | Other states |
| `Wnn-AL-nn` | Applies at **all** sizes — data rules, maths, sort/paging logic that is not size-specific |

IDs are **stable and never reused**. If a row is dropped, its ID is retired, not recycled.

### Decision values

| Value | Meaning for the code phase |
|---|---|
| **Keep Jo** | *(default)* `(OC)` keeps her exact code for this aspect. Ours is not carried across. |
| **Adopt ours** | Bring our version across into the `(OC)` widget as built. |
| **Adopt modified** | Bring ours across with a change, described in Notes. |
| **New** | Neither side is right. Build something that exists in neither version, described in Notes. |

### Row template

```
### Glance

| ID | Aspect | Jo (current live) | Ours | Decision | Notes |
|---|---|---|---|---|---|
| W01-GL-01 | Headline figure | unsigned $5,900 | signed +$5,900 with arrow and quiet 1.9% | Keep Jo | why / source / open question |
```

Notes carries the reason, the source where there is one (Step 4 design decision, Step 5 API spec,
codebase trace), and any open question. A row with nothing to say in Notes leaves it blank.

---

## Progress

| Widget | Documented | Decisions made | Implemented |
|---|---|---|---|
| W01 Budget Compared to Actual | 2026-09-08 | 3 adopt, rest base = Jo | **2026-09-08, verified** |
| W02 Pension Plans | 2026-09-08 | 1 adopt, rest base = Jo | **2026-09-08, verified** |
| W03 Payroll Distributions | 2026-09-08 | 1 adopt, 1 adopt-modified, 1 new | **2026-09-08, verified** |
| W04 Remittance Pledges | 2026-09-10 | Round 1: 11 rows. Round 2: T1-T19, all agreed. 3 naming cautions open | **2026-09-10, verified.** Both rounds in; 221 assertions, seed tuned |
| W05 Receivable Invoices Outstanding | 2026-09-17 | No decision rows recorded; the built delta stands as agreed | **2026-09-17, verified.** `w05-receivables-oc.driver.js`, 292 assertions |
| W06 Insurance Billing Plans | 2026-09-17 | No decision rows recorded; the pie is the whole difference, see below | **2026-09-17, verified.** `w06-insurance-oc.driver.js`, 280 assertions |
| W07 Deposits on Hand | 2026-09-17 | Four owner changes, plus the account pop-up, which has no counterpart in hers | **2026-09-17, verified.** `w07-deposits-oc.driver.js`, 263 assertions |
| W08 My Status | 2026-09-17 | Clone of hers, plus 2 improvements: pop-up content fills the dialog; the urgency dots get a legend | **2026-09-17, verified.** `w08-mystatus-oc.driver.js`, 291 assertions |
| W09 Payroll Scheduled Time Off | — | — | — |
| W10 Loans With Balance Due | — | — | — |
| W11 Fixed Asset Values | — | — | — |
| W13 Purchasing Management | — | — | — |
| W15 Bank Balances | — | — | — |
| W16 Accounts Payable By Due Date | — | — | — |
| W17 Gifts Pledges | — | — | — |

---

<!-- Widget sections are appended below, one per widget, as they are dictated. -->

## W01 — Budget Compared to Actual

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

## W02 — Pension Plans

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

## W03 — Payroll Distributions

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

## W04 — Remittance Pledges

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

## W05 — Receivable Invoices Outstanding

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

## W01 — implementation notes

### Step 1: rebase the `(OC)` widget onto her exact code

Today `bgtO` holds our V2 re-port. Replace the whole block with her live `bgtF` block taken from
`a548419`, renaming only the namespace: `bgtF` to `bgtO`, `BGTF_` to `BGTO_`,
`budget-mb` to `budget-oc`. Take her CSS block the same way. Also replace the `bgtO` registry card's
state with **her** state, which differs in one key: her second Explore panel defaults to
`iB: "period"`, ours to `iB: "month"`.

Three things return with her code that our V2 had deleted, and that is correct now:

- her Detail chart/table toggle and its handler, plus the `bdetail` state it reads (3 references)
- the Glance sparkline
- her `trend-range` caption, replacing our `bgt-caption` variant

### Step 2: apply the one adopted difference — two edits, nothing else

Both of her render sites already receive the window's budget total, so no signature or upstream
change is needed.

**Edit 1 — the headline builder.** In `bgtOHeadlineInner`, compute the percent and return it, while
leaving her `html` string **byte-identical**. Her version returns an empty percent and no arrow; the
arrow must not come across (W01-GL-02). Concretely: add the percent calculation from the Step 3
Final, and return it wrapped in a `bgtO-hl-pct` span, keeping her signed-amount `html` exactly as it
is.

**Edit 2 — the two render sites.** Append the percent to the headline in:

1. `bgtOHeaderBlock` — serves **both** Explore and Detail, so this single edit satisfies W01-EX-01
   and W01-DE-01
2. `bgtOGlance` — satisfies W01-GL-01

That is the entire code change for W01: one function body, two render sites.

### CSS

No new CSS. Her CSS block already declares the percent class, left over from the August port she
adopted, even though her code never emits it — so after the namespace rename the class exists and is
correctly styled (quiet grey, 13px, 7px left margin). Do not reintroduce the arrow class in the
markup.

### Verification

- `w01-budget-mb.driver.js` currently asserts **our V2** behaviour (140 assertions covering the Time
  Window Module, the absence of `bdetail`, our caption). Once `bgtO` is her code plus the percent,
  most of those assertions become wrong. The driver has to be rewritten to assert *her* behaviour
  plus the percent. Treat this as required work in the same change, not a follow-up.
- After the rebase, assert the `(OC)` block is byte-identical to her block except the namespace
  rename and the two percent edits. That is the strongest guard that nothing of ours leaked in.
- The comparison tab should then show the Jo and OC columns differing **only** by the percent.
- Re-run all 15 drivers and the popover regression guard.

## W02 — implementation notes

### Step 1: rebase the `(OC)` widget onto her exact code

Replace the whole `penO` block with her live `penF` block from `a548419`, renaming only the
namespace: `penF` to `penO`, `PENF_` to `PENO_`, `pension-mb` to `pension-oc`. Take her CSS block and
her registry state the same way.

Lower risk than W01: the two blocks have **identical function structure**, the same 35 functions with
none added or removed on either side, so our V2's W02 changes are all inside function bodies. The
rebase therefore cannot orphan a call or leave a dangling reference.

### Step 2: apply the one adopted difference — a single edit

In `penOGlance`, the caption slot is currently an **empty string literal** sitting between the metric
row and the screen-reader sentence. Replace that empty literal with the caption element from our
version. Both the plan count and the district label are already computed at the top of her function
for her screen-reader sentence, so the edit reuses them and adds no new calculation.

That is the entire code change for W02: one empty string, in one function.

### CSS

No new CSS. The caption class is declared **once**, globally, outside both the `penF` and `penO`
blocks, so it is already available and correctly styled at 11px subtle grey. The namespace rename
does not touch it, because the class name carries no namespace letter.

### Leave alone

Her screen-reader sentence under the metric already states the plans, the appointee count and the
district. The new visible line partly duplicates it. Leave the sentence exactly as she wrote it: it
is hers, it is correct, and changing it is not in scope.

### Verification

- `w02-pension-mb.driver.js` currently asserts **our V2** behaviour (159 assertions). It must be
  rewritten to assert *her* behaviour plus the Glance caption.
- Assert the `(OC)` block is byte-identical to hers except the namespace rename and the single
  caption edit.
- The comparison tab should then show the Jo and OC columns differing **only** by that line, and only
  at Glance.

### Flag for the owner

The rebase discards our other V2 W02 changes, which are body-level rather than structural and are not
listed above because everything outside the Glance caption was ruled "same as Jo". If you want them
enumerated before the code change so nothing is dropped unknowingly, say so and I will list them.

### Implemented 2026-09-08 — what was actually done

Backup: `index.BACKUP-W01W02-oc-rebase-*.html`. Rebased `bgtO` onto her `bgtF` block from
`a548419` (14 CSS + 287 JS lines) and took her registry state, which restored her Detail
chart/table toggle, her Glance sparkline and her `trend-range` caption. Then the percent: the
calculation added to `bgtOHeadlineInner` and `hv.pct` appended at the two render sites, exactly as
planned. Her `html` string was left byte-identical, so the arrow did not come across.

No new CSS was needed, as predicted: her block already declared the percent class.

**One thing the plan missed.** The rebase restored her Detail toggle's *markup* but not its click
handler, because that handler lives in the shell's listener and our V2 had deleted it, so there was
no `bgtO` copy to restore. The toggle rendered but did nothing. Its twin has been added. The new
driver asserts it, so this cannot regress.

Verification: **`w01-budget-oc.driver.js`**, 38 assertions, replacing
`w01-budget-mb.driver.js` (kept as `.superseded.bak`). It pins the percent's maths against the
widget's own window totals, asserts the arrow is absent at all three sizes, asserts her sparkline and
caption survive, and checks every one of her `bgtF` functions still exists.

### Implemented 2026-09-08 — what was actually done

Rebased `penO` onto her `penF` block from `a548419` (20 CSS + 342 JS lines) and took her
registry state. Then the one edit: her empty caption slot now renders the context line, reusing the
plan count and district label she already computes. No new CSS, and her screen-reader sentence was
left exactly as she wrote it.

Verification: **`w02-pension-oc.driver.js`**, 25 assertions, replacing
`w02-pension-mb.driver.js` (kept as `.superseded.bak`). It checks the line uses the widget's live
plan count rather than a hardcoded number, that a chosen district is named instead of claiming
"all districts", that the line does not leak into Explore or Detail, and that her `penF`
functions all survive.

**Worth noting:** she uses the same caption class in her empty state for her own wording
("no active pension appointments"), so the driver asserts the *text*, not the class.

## W03 — implementation notes

The largest of the three so far, and the only one needing new CSS and a new markup wrapper.

### Step 1: rebase the `(OC)` widget onto her exact code

Replace the whole `prO` block with her live `prF` block from `a548419`, renaming only the namespace:
`prF` to `prO`, `PRF_` to `PRO_`, `payroll-mb` to `payroll-oc`. Take her CSS block and her registry
state the same way. Her state uses the single combined scope key; ours uses the two split keys, so
the registry card's state changes with the rebase and is then changed again by W03-EX-02.

Unlike W01 and W02, the two blocks differ **structurally**: hers has 33 functions, ours 43. The
rebase brings back eight of her functions our version had deleted, including her Glance composition
bar (which is exactly what W03-GL-01 asks for) and her single scope chip. It also drops nineteen of
ours. Four of those have to come back for the adopted rows, and they are listed below.

### Step 2: W03-GL-01 — Glance

Nothing to do. Her Glance arrives whole with the rebase, composition bar included. Do **not** port
our chip-and-total Glance back over it.

### Step 3: W03-AL-01 — export

Nothing to build. The shell's 3-dot menu already renders Export as CSV / Excel / PDF for any card
carrying an `actions` array, and her registry card carries one. The work is purely **not** bringing
our in-widget export button and its caption row back after the rebase. Leave the two functions that
build them behind, and leave the CSS rule that right-aligns that button behind with them.

### Step 4: W03-EX-02 — three filters

Re-add our two chip builders for Distribution and Pay type, and the two filter-state keys they read,
replacing her single combined scope chip in the header block. Her popover branches for the combined
chip go; ours for the two chips come back. The popover plumbing for these already exists in the
shell dispatchers from the earlier merge, so check what is already wired before adding branches.

### Step 5: W03-EX-01 and W03-DE-02 — employee list inside her modal

One implementation covering both sizes, because her modal is shared.

Keep her modal builder as the shell: her chips, total, pay-type table, donut, legend and Done button
all stay untouched. Re-add our employee functions — the employee lookup, the employee block builder,
its filtering and its row-key helper — and render the employee block into the **left column, beneath
her pay-type table's Total row**, which is the empty area boxed on the screenshot.

Requirements that are ours to honour, not hers:

- columns Employee and Total pay, both sortable, Total pay descending by default
- a chevron per row that expands that employee's pay breakdown in place
- a `Total, N employees` footer row with the summed pay
- the employee block sits in **its own scroll container**, so a long list scrolls inside the modal
  rather than growing it. Her modal has a fixed height and a Done button pinned at the bottom; that
  must not move

### Step 6: W03-DE-01 — Detail pie legend to the right

This is the only genuinely new work, and it has a trap.

The donut already emits the row-direction wrapper that puts the legend to its right, which is why
Explore looks correct. At Detail the chart is nested inside the split-layout column, and **one CSS
rule** in that layout overrides the direction to a column, dropping the legend underneath. Removing
that override is the whole fix.

**The trap:** that rule is written as a plain global selector, and the same selector is used by Jo's
**own original payroll widget**, which also renders a split Detail layout. Editing or deleting the
rule in place would change her widget's appearance. It is also declared twice, once in her CSS block
and once again in our clone's copy, so deleting one copy achieves nothing.

So the fix must be **namespaced to the `(OC)` widget only**, and there is currently no namespaced
wrapper to hang it on: the `(OC)` markup has no root class, and the two root-class mentions in the
file are both comments, not markup. Therefore:

1. add a namespaced root wrapper element around the `(OC)` widget's rendered content, and
2. write the override under it, restoring the row direction and undoing the full-width legend column
   that the same rule block forces

Then confirm Jo's original payroll widget and her adopted one both still stack the legend underneath
at Detail, unchanged. That check is the point of the whole exercise.

### Verification

- `w03-payroll-mb.driver.js` currently asserts **our V2** behaviour across 277 assertions, including
  a block that asserts her composition bar and her scope chip are *absent*. Those assertions invert
  under this plan. It needs a substantial rewrite, not a tweak.
- Assert her modal's own markup is unchanged by the employee insertion, and that the employee block
  is inside a scroll container.
- Assert the legend is row-direction for the `(OC)` widget at Detail **and** still column-direction
  for both of Jo's payroll widgets at Detail.
- Re-run all 15 drivers and the popover regression guard.

### Implemented 2026-09-08 — what was actually done

All six rows are in. Backup taken first as `index.BACKUP-W03-oc-rebase-20260908-172951.html`.

1. **Rebase.** The `prO` CSS and JS blocks were replaced with her `prF` blocks from `a548419`,
   renamed into the `prO` namespace. Her block was checked first for tokens that a naive rename
   would corrupt (things like her date formatter and the shell's focus id); there were none in the
   region, and only her namespaced classes carry the lowercase prefix. Function count went from our
   43 to her 32.
2. **Two wiring fixes the rebase exposed.** The shell's scoped-modal body only knew her kind, so an
   `(OC)` drill fell through to the deposits renderer; it now routes `payroll-oc` to `prOContent`.
   This is the **fourth** line of hers the branch extends, and the comparison driver's integrity
   allowlist was widened to name it. The registry card also had to take her state, since her code
   reads her keys.
3. **W03-GL-01** needed no work beyond not porting ours back: her composition bar returned with the
   rebase, as predicted.
4. **W03-AL-01** needed no work either. The shell's 3-dot menu already offers CSV / Excel / PDF from
   the card's actions array. Our in-widget export button and its caption row were simply left behind.
5. **W03-EX-02.** Her single scope chip became our Distribution and Pay type chips. Because her
   aggregation is a distribution-to-pay-type map, the pay-type filter was applied at the boundary:
   her row builders now sum only the selected pay types, so her sorting, donut and totals are
   untouched and everything still cross-foots. The pay-type list offers only pay types actually paid
   in the period. Verified: filtering to Overtime moved the total from $86,109 to $3,630, and
   choosing Pastoral Staff gave $24,593 with her own pay-type breakdown.
6. **W03-EX-01 / W03-DE-02.** Our employee table was grafted into her modal's left column, beneath
   her total, with its own scroll container capped so the dialog never grows and Done stays put. Her
   chrome, chips, table, donut and Done button are untouched. The footer cross-foots to the penny
   against the distribution total. Expanding a person shows only that person's pay types. The
   handlers resolve the widget through the modal's scoped clone, which is not in the registry, so
   expanding works inside the dialog.
7. **W03-DE-01.** Fixed by adding a namespaced marker class to the existing split element rather than
   a new wrapper, so no DOM nesting changed and the flex layout was not disturbed. The override is
   scoped under that marker, which only this widget emits, so Jo's own two payroll widgets keep
   their stacked legend. It reaches the drill modal as well, because the modal renders the same
   branch.

**Verification.** `w03-payroll-mb.driver.js` asserted our V2 and could not be salvaged; it is
retained as `w03-payroll-mb.driver.superseded.bak` and replaced by **`w03-payroll-oc.driver.js`**,
66 assertions, each traceable to a row ID above, including the cross-foot, the scoping of the legend
fix, and a check that all of her own `prF` functions still exist verbatim. Full suite: 15 drivers,
**7,167 assertions, 0 failures**. Confirmed in the browser at all three sizes and in the drill modal.

---

## W04 — implementation notes

### Implemented 2026-09-10 — what was actually done

All eleven rows are in. **`w04-remittance-oc.driver.js`, 124 assertions, 0 failures.** Full suite
after the change: **6,589 assertions, 2 failures**, both pre-existing and unrelated — `cmp-dashboard`
and `w17-gifts-mb` each look for an `index.BACKUP-cmpdash-*.html` / W17 snapshot from an earlier
edit workflow that no longer exists on disk.

1. **Rebase.** The `remO` CSS and JS blocks were replaced with her `remF` blocks renamed into the
   `remO` namespace. Function count went from our 79 to her 50, then the pledge machinery was added
   back on top. Three traps the rename had to survive:
   - **Her retired `rem` widget owns `remFmtDate` and `remFindRow`**, while her live block owns
     `remFFmtDate` and `remFFindRow`. A blind `remF` → `remO` replace would have silently corrupted
     the retired widget's two functions. The rename was anchored on an enumerated allowlist of the
     57 `remF` tokens that actually occur inside her block, applied longest-first. Both retired
     functions are asserted intact in the driver.
   - **The hover popover.** Her mousemove listener keys on `data-rempop`, and our pre-rebase block
     had deliberately used `data-remopop` to stay isolated. A straight rename would have reinstated
     her attribute in our copy, so both listeners would fire on both widgets' bars. The copy keeps
     the distinct attribute.
   - **Shared `rem-*` CSS.** Her block defines eleven un-prefixed rules (`.rem-drill-modal`,
     `.rem-mini*` and so on). Copying them would have put a *later, unscoped* duplicate in the file,
     which would then override hers for **her** widgets. Those eleven rules were dropped from the
     copy; hers still supply them.
2. **The pop-up (W04-AL-01, EX-01/02, DE-01).** Her `remOdetail` modal type now renders
   `remOPledgeModalHTML` instead of her payment history. No new route: her own open action already
   fires from the table row and the pacing bar, so both reach it. `remOBehindModalHTML` and
   `REMO_USE_POPUP` are gone; her `remODetailModalHTML` is retained unedited as the rollback path.
   The shell branch uses the mounted / body-only refresh pattern so paging, sorting and expanding a
   schedule never replay the entry animation.
3. **Instalment pacing (W04-AL-04).** `remOPledgePace` derives everything from `remOSchedule`, which
   already existed and already allocated receipts oldest-first with missed / part / upcoming states.
   So this was a rewiring, not new logic — and it resolves the contradiction that the expandable
   schedule had always been instalment-based while the chip above it was day-based. `daysAhead` and
   the ±30 / −60 band are gone from the pop-up; the widget keeps both.
4. **The reconciliation holds.** Verified for every activity: pledge goals sum **exactly** to the
   activity total and pledge paids sum **exactly** to the activity paid, because they are
   definitional. The paced figure is the one that legitimately differs, and the driver asserts that
   it *does* differ — that divergence is the reason the label names the basis.
5. **W04-ST-03/04.** The ended-term status and the term-range line are in, and the driver asserts
   the pledges genuinely span outside the activity's own dates, which is what made the old single
   term line wrong.

### Two things left open

**Flagged for the owner — the demo data now makes almost everything read behind.** The logic is
right and verified, but the seeded pledge paids are random fractions of goal, and the instalment
basis is far stricter than term-elapsed, so the pop-up now reports 58 of 60 pledges behind on W04-01
and **71 of 71** on the capital campaign. Worst case is the capital campaign, where the widget row
says "on track, +$178" while its pop-up says every pledge is behind and $10,416 is unfunded. That is
the masking cost recorded above behaving exactly as designed, but at an implausible scale that will
read as a bug in review. This is a **demo-data tune, not a logic change** — the seed needs a
realistic mix of on-track, one-behind, several-behind and ended pledges. Not done, pending the
owner's word.

**Naming.** The strip currently reads "Total pledged" and "Expected by instalments due" as
placeholders that name the basis. The three wording questions above are unresolved and the labels
are marked provisional in the code comment.

---

### Round 2 — agreed and IMPLEMENTED 2026-09-10

Every item below was decided by the owner on 2026-09-10 and is **built and verified**.
`w04-remittance-oc.driver.js` now runs **221 assertions, 0 failures**; the full suite is
**6,686 assertions, 2 failures**, both pre-existing and unrelated (`cmp-dashboard` and
`w17-gifts-mb` each look for an `index.BACKUP-*` snapshot from an earlier edit workflow that is no
longer on disk). What was actually done, where it differed from the plan, is noted after the table.

| # | Change | Detail |
|---|---|---|
| T1 | Pledge table gets its own scroll | Name / Begin date / End date / Goal / Paid / Outstanding / Status stay **fixed**; rows and any expanded schedule scroll beneath. Strip, term line, note and caption stay above the scroll. `.rem-pl-head` already carries `position:sticky` and only needs a scrolling ancestor |
| T2 | Padding between table and footer | Rows currently land on the Close button |
| T3 | Separate the note from the caption | "N of M pledges have missed a payment" and the purple "Every pledge recorded against…" read as one block |
| T4 | Widen the modal, strip to 7 cells at 4 per row | `Total pledged · Expected by instalments due · Received to date · Outstanding` / `% Paid · Pledges behind · Pledges at risk`. Replaces the single "Pledges with a missed payment" cell with the two counts. Widen via a **scoped** override (`.remo-root.rem-drill-modal`) — never her global `.rem-drill-modal` rule |
| T5 | At-risk **amount** named in the note | The two counts fix the population but not the arithmetic: expected minus received will not reach the unfunded figure, because at-risk money sits between them |
| T6 | Widget headings | `Pledge` → **`Annual`** (kept per owner, misnomer acknowledged, tooltip it), `Paid` → **`Received to date`**, `Expected` → **`Expected to date`**. "YTD" is **dropped, not adopted** — see the time-basis note below |
| T7 | Widget column order | `Seq. \| Activity \| Pledges behind \| Annual \| Expected to date \| Received to date \| Outstanding \| % Paid` |
| T8 | Add `Seq.` back | The only legacy number missing. The table already defaults to sorting by `seq` without showing it |
| T9 | Keep Jo's `% Paid` progress bar | With its expected-position marker. Legacy was a plain percentage; Jo's bar wins |
| T10 | New column `Pledges behind` | **Count only, no amount.** Definition: pledges with at least one payment behind **past the 7-day grace**. Sortable like her other columns. Purpose: an activity that looks healthy overall but hides one or two behind pledges, at high volume |
| T11 | Bands unchanged | Jo's 30 / ±30 / −60 logic stays, and both edge cases with it (paid-in-full counts as Ahead, no-pledge-amount counts in none). The owner's proposed 0-boundary was withdrawn |
| T12 | Info icon on each of the three cards | Top right, **all** sizes, **focusable** not hover-only, reusing her `data-tip` mechanism. Wording in plain terms, no day counts: "further behind than about a month's worth of payments" and its equivalents. Note: the icon cannot nest inside her `<button>` card — needs a wrapper with the button and the icon as siblings |
| T13 | 7-day grace on every payment date | Due dates themselves unchanged. For an instalment due 1 Jul: **on track on 1 Jul**, at risk 2–8 Jul, behind from 9 Jul. Grace runs from the day *after* the due date |
| T14 | Status column, five types | `N payments behind` · `At risk` · `Term ended, unpaid` · `Paid in full` · `On track`. No separate "Term ended, paid" — `Paid in full` already existed and covers it |
| T15 | At risk never counts as behind | Excluded from the pledge's behind count, the note, the strip cell and the `Pledges behind` column |
| T16 | Unfunded counts only past-grace instalments | At-risk money is tracked separately (T4, T5) |
| T17 | Tune the seed | Populate at-risk, term-ended-unpaid and **more** paid-in-full pledges. Constraint to respect: pledge paids must still sum **exactly** to the activity's paid figure, so profiles have to be engineered through **terms** (free) and through *which* pledges get the money, not by overriding the sum |
| T18 | Amend `W04-AL-04` and the section opening | Two things change on the record: the widget is no longer purely term-elapsed (T10 puts one instalment-derived number on the row), and W04 is no longer "Jo's widget taken whole" (T6–T10 edit her table). The spec needs the same live-vs-materialise dev note that `W04-AL-07` carries for the sort |
| T19 | Empty state has two meanings | "No pledges configured" versus "pledges exist but none in scope". Legacy collapses both into "No records to display" |

**Deliberately left out:** a second column for a true annual figure (`windowPaid`, receipts inside
the selected window). Offered, not chosen. Add it only if an annual view is wanted later — as an
extra column, never by redefining `Received to date`.

#### Round 2 — what was actually done, and four things worth knowing

0. **T1 needed a second pass — the first attempt did not scroll.** Her `.rem-drill-b` is
   `display:flex; flex-direction:column; overflow:hidden`, so **nothing in that dialog scrolls**:
   anything past the bottom is clipped, which is why an expanded schedule ran under the Close
   button. Capping the table with a `max-height` did not fix it, because the strip, term line, note
   and caption still pushed the panel past the modal's 88vh and the excess was cut. The working fix
   distributes height down the whole chain instead — panel and table both `flex:1 1 auto` with
   **`min-height:0`**, and the scrollport takes what is left. The `min-height:0` is the load-bearing
   part: a flex item defaults to `min-height:auto` and refuses to shrink below its content, which
   silently defeats any nested scroller. The driver now asserts every link in that chain, and that
   the abandoned `max-height` cap has not come back.

0b. **The restored column set needed a layout pass (2026-09-14).** Two faults, both mine:
   - **Headers overlapped.** `.remO-cell` carries `white-space:nowrap` with `overflow:visible`, so a
     header wider than its column spills straight over its neighbour rather than wrapping or
     clipping — which rendered "Expected to date" and "Received to date" as "Expected to Rate". Not
     fixed by shortening the labels or widening the table past her card: the **head row now wraps**.
     The sort control is set to `display:inline` so its label flows like text, and the row
     bottom-aligns so a two-line header sits level with a one-line one. Net effect the table got
     *narrower*, from a 685px minimum to 663px.
   - **Money columns were misaligned.** Jo alternated `remO-alignL` down her money columns to
     separate them visually **in her column order**; after the `W04-T7` reorder that alternation
     read as random — Annual and Outstanding left, Expected and Received right. All six occurrences
     are removed from our head, row and totals, so every money column is right-aligned and the
     figures read as a column of currency. Her `remF-alignL` markup is untouched.

1. **The grace period turned out to be a status change only.** `remOSchedule` gains a `daysPast`
   figure and the status set becomes `paid` / `upcoming` / `atrisk` / `part` / `missed`. Due dates,
   instalment amounts and `dueAmt` are all untouched, exactly as instructed — an at-risk instalment
   is still counted as *due*, it simply is not counted as *behind*.
2. **`.remo-root` is on the drill modal only, never on the widget card.** So the eight-column grid
   rule had to be written **unscoped** as `.remO-row` — a rule scoped under `.remo-root` would never
   have reached the table. It is safe unscoped because `remO-` *is* the namespace: her own widget
   uses `remF-`. The modal widening is the opposite case and *is* scoped, as
   `.remo-root.rem-drill-modal`, so her global 760px rule is untouched. The driver asserts both.
3. **The info icon could not go inside her card.** Her card is a `<button>`, and a focusable control
   nested in a button is invalid and unreachable. Each card is now wrapped, with the info button as
   a **sibling**. It is a real `<button>`, and the shell's tooltip engine already listens on both
   `mouseover` and `focusin` for `[data-tip]`, so hover and keyboard both work with no new plumbing.
4. **The seed needed engineering, not just re-rolling.** The reconciliation constraint is absolute:
   pledge goals must sum exactly to the activity total and pledge paids exactly to its paid figure.
   So the showcase states are built out of the only two free variables — each pledge's own **term**,
   and **which** pledges receive the money. At-risk is the fiddly one: it needs an instalment due
   inside the grace window, achieved by anchoring those terms on **26 January**, which lands a due
   date on 26 July for every frequency whose step divides 6, five days before the thru date. If the
   showcase would ever cost more than the activity actually received, profiles are demoted back to
   flex until it fits — an activity 30% paid genuinely cannot carry many paid-in-full pledges, and
   faking it would break the cross-foot.

Result, with every activity still reconciling exactly:

| Activity | Behind | At risk | Paid in full | Term ended | On track |
|---|---|---|---|---|---|
| W04-01 General Fund Apportionment (30% paid) | 40 | 3 | 6 | 6 | 6 |
| W04-02 District Mission Share (100% paid) | 0 | 0 | 72 | 0 | 0 |
| W04-03 Clergy Pension Assessment (45% paid) | 37 | 3 | 11 | 6 | 6 |
| W04-04 Outreach and Benevolence (70% paid) | 20 | 3 | 28 | 7 | 5 |
| W04-05 Capital Campaign Pledge (37% paid) | 47 | 3 | 9 | 13 | 6 |

Before the tune, W04-01 read 58 of 60 behind and W04-05 read 71 of 71. W04-05 is still mostly
behind, and that is honest: it is a three-year campaign only 37% paid.

**Still open, unchanged:** the three naming cautions above (`Annual` kept as the owner's call with
the caveat in its tooltip; "Due" avoided because legacy already uses it for shortfall). The pop-up
strip's expected cell reads "Expected by instalments due" and the widget's reads "Expected to date",
so the two bases are never presented as the same quantity.

### The time basis — settled 2026-09-10

The legacy labels are wrong on two of three columns, verified in live data (1 Saint Michael Church,
pledge 1/1/2019–12/31/2019, thru 1 Sep 2019):

- **`YTD Paid` has no lower bound.** The only filter is `CheckDate <= thru`, plus posted and
  non-void. It is **cumulative all-time to date**, not year-to-date [CODE: RMActivityRepository.cs].
- **`Annual` is the full pledge term**, not a year. A three-year pledge contributes all three years.
- **`YTD Expected` is the only calendar-year-anchored figure**, `ROUND((Annual / 12) × thru.Month, 2)`
  — a calendar-year fraction applied to a full-term amount.

**Decision: keep the cumulative basis and fix the labels to say so.** The governing rule is that the
numerator's window must match the denominator's. Bounding paid to 1 January while `Annual` stays
full-term makes every multi-year pledge read far worse than it is — the capital campaign would go
from $19,000 outstanding and roughly on track to $24,000 outstanding and $4,822 behind. Making YTD
coherent would require pro-rating `Annual`, which legacy never did and which only derives cleanly
when `Duration` and `Frequency` agree with the term — and nothing validates that.

Live confirmations from the same screen, worth keeping:

- The **header disagrees with the column**: "Percent of year completed 66.85%" is day-of-year
  (244/365), while `YTD Expected` uses month 9 of 12 = 75%. $750 is 75% of $1,000, not 66.85%.
- **`Active` is not filtered.** That pledge has `Active` unticked and the widget still shows it,
  confirming the error in the Step 1 doc and the Step 5 legacy pass. The v2 spec has it right.
- **Why 2026 showed no rows**: the term test is the single instant `BeginDate <= thru <= EndDate`, so
  a 2019 pledge vanishes in 2026 and takes its $1,250 outstanding with it. The v2 window-overlap
  rule keeps it visible, so the same tenant may legitimately show rows where legacy shows none.
- **A receipt is not split in the apportionment ratio.** Widget paid $125/$125 = $250 against the
  pledge screen's $208.33/$166.67 = $375: the $125 difference is one later monthly payment split
  correctly ($83.33/$41.67, exactly the two Periodic amounts), while the earlier $250 was typed in
  evenly. Receipt entry allows any per-activity split.
