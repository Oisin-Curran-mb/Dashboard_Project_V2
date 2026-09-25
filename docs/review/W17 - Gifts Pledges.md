# W17 Gifts Pledges: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W17.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `gifts` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `gifts-mb` (prefix `gpF`). Jo's live version: `gifts`.

---

## 1. Jo's PR feedback

- **Keep Jo's** pledge-based version: money-first, per-purpose progress bars with the "expected by today" marker and a behind status. This is the brief's lead direction and the data supports it.
- **Accept from OC:** the inline drill (a purpose expands to its donors / pledges, each pledge to its gift transactions, paged); fixing the as-of anchor to follow the selected date.
- **Reject from OC:** the pivot to campaign-GOAL progress (depends on a stored campaign goal the brief says is unconfirmed, and OC's own note flags a received-basis conflict that puts every summed figure in question); the three goal bands; the date range replacing the single as-of date (breaks sibling consistency with Remittance); removing sort; export as the only action.
- **Rebuild / polish:** remove the narrative subtitles (both versions have them); reframe "% Due" to "% fulfilled" and show over-received as positive, not an alarming negative; an overall goal bar only if a real goal is stored; canonical progress bars; fix the £ currency; a positive empty state; keep Remittance sibling consistency.
- **Flag:** the received-basis conflict (pledge-linked gifts only versus all posted gifts) blocks every summed figure and needs engineering; whether a campaign goal is stored; donor-level detail availability; the Pledge-Due calculation basis.

---

---

## 2. Jo's notes in her final version

**Registry rows she ships (id · title · size):**

- gft · Gifts Pledges · wide
- gft2 · Gifts Pledges (report view) · xwide
- gft3 · Gifts Pledges (one purpose) · wide
- gft4 · Gifts Pledges (all on track) · wide
- gft5 · Gifts Pledges (no pledges yet) · wide · state empty
- gft · Gifts Pledges · wide
- gft_k · Gifts Pledges (Glance) · kpi
- gft2 · Gifts Pledges (report view) · xwide
- gft3 · Gifts Pledges (one purpose) · wide
- gft4 · Gifts Pledges (all on track) · wide
- gft5 · Gifts Pledges (no pledges yet) · wide · state empty

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L246 [css]: Multi-column table totals reuse the row column structure so numbers sit under their columns
- L2268 [css]: --- header context lines under the KPI ---
- L2280 [css]: behind pill uses the neutral bank-pill; nudge the glyph tone (no red)
- L2283 [css]: --- progress thermometers (the hero) ---
- L2297 [css]: expected-by-now but not yet received (the schedule shortfall), light amethyst
- L2299 [css]: "due by now" marker tick
- L2313 [css]: --- table view ---
- L2329 [css]: --- glance ---
- L2338 [css]: --- explore (xwide) two panels ---
- L2345 [css]: behind-schedule follow-up list
- L2359 [css]: --- skeleton ---
- L2365 [css]: --- drill / focus overlay ---
- L2389 [css]: expanded donor drawer
- L2406 [css]: custom date row in the date popover
- L2412 [css]: narrow: stack the explore panels
- L2590 [css]: Bounded full-size sections (match other widgets)
- L2596 [css]: Gifts drill modal: size to content, no fixed tall empty sheet
- L2600 [css]: ===== Gifts/Remittance rebuild to Deposits pattern =====
- L2605 [css]: Legend belongs WITH the bars view, never floating over a plain table
- L2609 [css]: Gifts drill modal: content-height sheet, footer total sits BELOW the table (not beside it)
- L2614 [css]: ===== Budget Compared to Actual (MB updated): ONLY the new visuals the owner deltas introduce. Everything else reuses Jo's .bgt-* / .dep-hd / .filter-chip / .scope-chip / .vtoggle / .delta-pill / .wt-* / .state / .modal / .bgt-rm-* / .bgt-pop-* / .tr-* classes and Pathway tokens. =====
- L2813 [css]: ===== Glance KPI secondary line: ONE consistent pill component across every widget (size, padding, radius, tokens, icon, touch target, motion). Colours still come from each pill's own rule; only the geometry is unified here, placed last so it wins. =====
- L4628 [js]: Building Fund , capital campaign, behind by one lapsed pledge
- L4653 [js]: Shell fallback copy (about text kept OUT of the widget chrome).
- L4658 [js]: --- derivations ---
- L4696 [js]: ===== RENDER ===========================================================
- L4717 [js]: Explore shows progress + follow-up side by side, so the view toggle is hidden there.
- L4956 [js]: popContent branches (routed from popContent(): gft-date / gft-purpose).
- L4970 [js]: triggerSelector branches (kept here for parity / verification).

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Ported 2026-09-08 against Jo's `phase-2` @ `71ca056` on branch `oisin-v2-rebuild`. **First-ever port of this widget, and the last of the run.** Ours is `kind:"gifts-mb"`, prefix `gpF`/`GPF_`, entry `gpFContentRoot`, CSS root `.gpf-*`, actions `data-gpf`, seven registry entries on the `(OC)` convention. Source of truth: our built Final `gpF`, `FC_VERSION[17]` = 1.3, audit-stamped against the build by `widget-final-check-audit` on 2026-09-07. W17 owns the **goal-progress** side of the pledge pair; W04 Remittance Pledges owns the **exception** side, and that split is deliberate and not blurred here.

**Collision result.** Jo's own widget is `kind:"gifts"` with a large `gft*` helper set, **36 functions**, plus `GFT_*` data constants and a `.gft-*` CSS cluster. There is no letter overlap between `gft` and `gpF`, so unlike W09 (`ptoFindEmp`), W13 (`purFiltered`) or W16 (`apFmtLong`) there was no lookalike trap to defuse. Before this port `GPF_`, `.gpf-`, `data-gpf` and `gifts-mb` each had **zero** occurrences in her file; the only two `gpF` strings present were comments inside our own W04 block referencing this widget's rollback pattern. Verified after the port: **all 36 of her helpers are defined exactly once, every definition line is byte-identical to the pre-edit snapshot, and every one of their raw occurrence counts is unchanged**; her entire gifts render block (36,226 bytes) and her whole gifts CSS cluster (9,096 bytes) are md5-identical; her six `kind:"gifts"` registry rows, her `GFT_TODAY` / `GFT_MONTHS` / `GFT_DATE_PRESETS` / `GFT_DONORS` / `GFT_DONORS_ONTRACK` / `GFT_ABOUT_BODY` / `GFT_WIDGETS` and her `EMPTY_COPY.gifts` / `ERROR_COPY.gifts` are untouched (our empty-state strings are inline in our own block, never written into her shared copy objects). Our block leaks no non-namespaced global.

**One real cross-widget catch, fixed rather than excused.** Two of our new comments named her `gftThru` verbatim while explaining that our state keys cannot collide with hers, which pushed that identifier's raw count from 26 to 28. That is exactly the hazard W13, W15 and W16 each hit. Both comments were **reworded** to describe her keys in prose instead of quoting them, and the count is back to 26, matching the snapshot exactly.

### THE DELIBERATE DECOUPLING FROM W04 — the headline of this port

In our mockup the `gpF` block's root element carried **both** classes, `class="remf-root gpf-root"`, and leaned on `.remf-root .btn` to style its export button. W04's `remF` block is now **live in this same file**, so porting that root verbatim would have silently coupled W17 to W04's stylesheet: an edit to W04 would have changed W17, and deleting W04 would have stripped W17 bare. The audit found the coupling ran much deeper than the button. Our mockup also drew on a long tail of classes that exist **only** inside our own W04 CSS block, every one of them scoped under `.remf-root`: the whole `.rem-pl-*` pledge-table and pager family, `.rem-legend*`, `.rem-pledge-panel`, `.rem-caret`, `.rem-cap`, `.rem-behind-sec`, `.rem-name-txt`, `.rem-pop-dates`, `.rem-spin` and `.remf-chip`. **All of it is dropped. Our root is `.gpf-root` alone**, and the export button now resolves its styling from the shell's **global** `.btn` family, which is declared once near the top of the stylesheet (`.btn` plus `.btn.naked`, `.btn.sm`, `.btn.primary`, `.btn.outlined`) and is exactly what W03's port relied on for the same reason. The driver asserts this four ways: the root markup is `.gpf-root` with no `remf-` string anywhere in our output at any tier, the popover and modal roots are ours alone, `.btn` / `.btn.naked` / `.btn.sm` are each declared **before the first ported block** in the stylesheet (so they are genuinely global, not W04's), and the old `.remf-root .gpf-export` rule no longer exists in the file.

The audit also turned up a smaller finding worth recording: **four selectors our mockup relied on were never declared anywhere in Jo's file at all** — `.rem-ctlrow`, `.rem-empty`, `.remf-vtoggle` and `.remf-mb`. Our mockup had been shipping unstyled chrome for those. They are replaced with her `.gft-ctlrow`, her `.state`, her `.vtoggle` and her `.modal-backdrop` respectively.

**This port REUSES her CSS heavily.** Her `.gft-*` vocabulary turned out to cover almost the whole widget, and three of her grids fit ours exactly: her six-slot `.gft-trow` table row is precisely our six baseline columns, her eight-slot `.gft-drow` donor row (`.gft-dexp` plus `.gft-dc0..5` plus `.gft-dstat-h`) is precisely our caret plus seven donor columns, and her `.gft-prow` progress row is our goal bar. Her bars container, track, fill, legend shell, zero line, donor status chips, expanded drawer, gift list, summary cells, detail-modal shell, skeleton, calendar and purpose filter chips and glance read stack are all reused as they are. Our CSS block therefore **declares zero of her selectors as a rule subject**, and every rule in it is `.gpf-root` scoped. Exactly **three** rules mention one of her classes as a scoped descendant, each because our markup puts something inside her cell that her own markup never does: a two-line campaign name inside her single-line name cell, a third Reference column inside her two-column gift row, and a wrapping legend carrying per-band counts.

Verified by `w17-gifts-mb.driver.js`, **734/734**, including a 155-combination size × campaign × view × drill × loading no-em-dash sweep, three independent proofs that the retired donut is unreachable, and definition-level byte-checks on all 36 of her helpers. All thirteen previously ported drivers re-run green afterwards.

| # | Difference | Jo's version | Ours | Grounded in |
|---|---|---|---|---|
| 1 | What the widget is *about* | **Fulfilment against the pledge total.** Her headline is `% fulfilled`, her bars measure received against Pledge Total, and she carries a behind-schedule follow-up panel listing every purpose that is behind | **Goal progress against a distinct campaign Goal field.** The headline is Received against Goal with a progress percent, bars measure received against **Goal**, and there is **no follow-up panel** | [DESIGN - Step 4 Final Design v3 (2026-08-19, direct owner instruction): "pivoted to the modern campaign Goal model"; the goal/exception split with W04 is the 2026-08-24 direct instruction] |
| 2 | The Goal field itself | No Goal. Her "goal" *is* the pledge total, which is what the legacy data has | **A separate Goal per campaign** (`goal`, `progressPercent`, `isClosed`), rendered per Rule 11 as if real | [DATA - Step 4 Data Contract "Goal" row: the legacy GF data has no Goal field distinct from Pledge Total; the Phase 2 campaign-giving-tracker API has a real one. Adopting it closes old Sign-off #3] |
| 3 | Status banding | Two states driven by pace: behind (saffron) or on track / ahead / funded (emerald) | **Three goal bands: under 75 percent, 75 percent or more, and goal met at 100 percent or more**, each paired with its own label (In progress / Close to goal / Goal Met) and glyph | [DESIGN - Step 4 Final Design: "status colour (blue under 75 percent, amber 75 percent or more, green goal met)"] |
| 4 | Pledge Due maths | A linear read: scheduled instalments dated on or before the chosen date | **Per-pledge installment proration following the legacy pledge-due routine**: the full pledge once past its end date, else the per-installment amount times frequency cycles elapsed plus one, capped at the installment count, with each pledge paced on its **own** begin-to-end term | [DATA - Step 4 Final Design, "Definitions used": explicitly "NOT the linear day fraction that Remittance Pledges uses". This is the substantive maths difference between the pledge pair] |
| 5 | The as-of anchor | Anchored on today | Anchored on the **selected** range end. The shipped legacy code anchors its cycle count on today, which is a known defect and is **not** reproduced | [CODE - legacy pledge-due routine; recorded in the block's own comment] |
| 6 | Date control | A single "gifts received through" date picker, with Today and End of last month presets plus a custom date | **A date range**: This year (default), Last 30 days, Custom with an inline From/To reveal. The **end** is the as-of cutoff driving Received and pacing; the **start** frames the chip only and windows no figure. No Refresh button. The chip reads "Gifts from X to Y" | [DESIGN - Step 4 Filters, carried from W04 remF v2.4; Step 5 v2 Filter architecture confirms only `rangeEnd` is sent and puts start-date windowing explicitly out of scope] |
| 7 | Campaign filter behaviour | Her purpose filter narrows too | **Narrows the dataset**, so every view, every subtotal and the totals row recompute. **No highlight treatment exists**; the earlier "highlights the selected campaign across all views" idea was never built and no highlight styling exists in our CSS | [DESIGN - Step 4 Interaction Spec, "Campaign filter (as built)"; the driver asserts six named highlight classes are absent from markup and stylesheet, and that a filtered bar's markup is byte-identical to its unfiltered self] |
| 8 | Views offered | Progress and Table, with the toggle **hidden** at her largest tier (she shows progress and follow-up side by side there instead) | **Goal Progress and Summary Table**, one at a time full width, with the toggle **visible at both** Explore and Detail. Explore and Detail differ by card size alone | [DESIGN - Step 4 v1.2 (2026-08-24, direct instruction after the owner reviewed the Detail render): "Explore and Detail both show ONE view at a time, full width"] |
| 9 | **The retired donut** | She never had one | **Donut by Campaign is retired, and its code is retained.** `gpFDonut` stays defined and correct but is **unreachable**: no toggle segment offers it, `gpFView` maps any stale `"donut"` state back to `"goal"`, no registry entry seeds it, and its CSS is kept so restoring the view is a one-line change. Same discipline as `REMF_USE_POPUP` on W04 | [DESIGN - Step 4: "Donut by Campaign was removed per owner (2026-08-19, v1.1)". Note the Step 4 doc's Views section still *lists* View 2 as the donut, which is superseded text the audit left in place] |
| 10 | Table columns | Six of her own: Purpose, Pledged, Due by date, Received, Remaining, % Fulfilled | **The live product's exact baseline columns**: Purpose (Campaign), Pledge Total, Pledge Due, Received, Due Remaining, Percent Due, with a totals row summing the first four and **Percent Due deliberately not summed** | [DATA - Step 4 Final Design and Data Contract "Totals row" row] |
| 11 | Table ordering | **User-sortable**: every column is a sort button, defaulting to `fulfilled-asc`, with her own asc/desc toggling | **The data's own order, with no sort control at all.** Bars order closest-to-goal-first; the donor drill orders most-behind-first; the table renders in the data's order. **No alphabetical sort exists anywhere** | [BUILD - Step 4 "Data Table Sort", recorded by the 2026-09-07 audit: "No alphabetical sort is implemented in the built Final... None are user-changeable. The fixed alphabetical rule below belonged to the A/B/C design and was never carried into gpF". Step 5 v2 puts user-selectable sort out of scope. The driver asserts no sort control and no locale-aware comparison anywhere] |
| 12 | Drill shape | Purpose to donors, **in a modal**, with an All donors / Behind only toggle | **Purpose to donor pledges INLINE under the row, paginated 20 per page**, and then each pledge expands again to its **gift transactions** (Gift Date, Amount, Reference), headed "Gifts applied to this pledge" and totalling that pledge's Received | [DESIGN - Step 4 Final Design "Deep dive": "This is the gift level the owner asked for". Paging is Step 4's 20-per-page rule] |
| 13 | Pagination | None. Her donor list is unpaginated | **20 per page**, with the figures above the pager computed over the **whole** donor set, so turning the page moves neither the campaign row nor the totals row nor the donor count. An out-of-range page is clamped on render; a page index below 1 is refused | [DESIGN - Step 4 Final Design; Step 5 v2 API 3 pagination contract. The driver asserts totals invariance across pages and both clamp directions] |
| 14 | Bar interaction | A bar opens her donors modal | **A bar opens the top-5 most-behind donor pledges modal** for that campaign, on her modal shell and her summary-cell primitives, with a note stating how many of how many it is showing | [DESIGN - Step 4 Interaction Spec: "clicking a Goal Progress bar opens the top-5 most-behind donor pledges modal for that campaign" (the W04 most-behind pattern)] |
| 15 | Actions on the card | Three: an Export to Excel in her modal, an **Open donor record** and a **Record a follow-up** in her drawer | **Export only, and deliberately so**, at two scopes: a header export of the active view, and a second export inside an expanded campaign's donor breakdown scoped to that campaign. Both are Rule 11 toast stubs | [DESIGN - Step 4 v1.3 (2026-08-25, Feargal call): export is this widget's only action, and "additional actions must not be invented without a demonstrated user need" — a standing constraint, not a temporary state. The driver asserts eleven workflow verbs are absent from every surface] |
| 16 | Glance | `% fulfilled` plus a status badge, a compact goal bar and a follow-up read, using her shared progress-bar helper | **Received as the number, with the goal pill, the progress percent and a goal bar** built on her track and fill at the small size. After v1.2 this is the **only** place the overall goal read appears | [DESIGN - Step 4 v1.2: "This is now the ONLY place the overall goal read appears"] |
| 17 | The Detail goal panel | n/a | **Removed, and retained for rollback.** It duplicated the Glance read, so v1.2 deleted it from the layout; `gpFGoalPanel` and the trimmed-table path are both intact behind `GPF_V12_LAYOUT`, and the status counts plus "Remaining to goal overall" that only it used to show **moved into the Goal Progress legend** rather than being lost | [DESIGN - Step 4 v1.2 and its stated rollback flag] |
| 18 | Over-received amounts | Her remaining cell shows an ahead amount with a minus sign | **A negative Due Remaining renders parenthesised and green as favourable**, matching the live product, because a single pledge can be over-received and a campaign's Received can therefore exceed its Pledge Total | [DATA - Step 4 Final Design and Fine-Tuning Notes; the fixture's Stoke Sell row reproduces the live `(655)` / `-54.58%` case exactly] |
| 19 | Money format | Her shared `money()` helper, whole dollars | **Our own `gpFMoney` at two decimals**, because every verified figure for this widget carries cents (Stoke Sell `$1,855.00`, Percent Due `90.40%`) and her helper would round them away. Same reasoning as W13's `purFMoney` | [BUILD - the live-screenshot figures Step 4 cites as its numeric proof; Step 4 records rounding, currency and locale as *not yet specified*, so en-US dollars is a recorded build choice] |
| 20 | State and wiring | Global-free, but hooked into the shell's shared plumbing: a `gft-` branch in the delegated click listener, a `popContent()` entry, a `triggerSelector` branch, a `renderModal` branch and an input-listener line | The Final's global `GPF_STATE` singleton becomes **per-widget registry state** (`gpFView` / `gpFCamp` / `gpFRange` / `gpFStart` / `gpFEnd` / `gpFLoading` / `gpFExp` / `gpFPage` / `gpFPlExp`), so several cards coexist; handlers are a **fully self-contained subsystem** behind `GPF_WIRED` keyed to `data-gpf` with its own popover and modal roots. Her `renderModal`, `popContent` and `triggerSelector` chains are **not touched** — the only shared-region edits are the two dispatch lines | [the port skill's integration style (b), the same as W07, W09, W10, W13, W15 and W16] |
| 21 | Shell conformance | n/a | `gpFRerender` becomes her global `render()`; `showToast` becomes her `setStatus`; our own `gpFIcon` is dropped in favour of her `ICON` helper; the fetch timer is keyed in her shared `timers` object; and the empty-state dispatch sits **before** the generic fallback so our copy renders and not the Deposits copy | [shell conventions, consistent with every other port on this branch] |
| 22 | Colour tokens | Her saffron is a hard-coded hex in her own stylesheet | Two of our three bands map onto **shell tokens** — the blue is `var(--brand-100)`, which *is* our Final's `#4b6ec3` to the byte, and goal-met green is `var(--pos-100)`. The middle band has **no token anywhere in this shell**, so it stays a hex, exactly as she hard-codes her own saffron. The retired donut's palette was re-pointed to amethyst tokens | [Jo's colour conventions; the token audit found no amber or saffron token in the file] |
| 23 | A latent defect in our own Final, fixed | n/a | Our mockup's modal mapped its row renderer straight through a `map` callback, so the array **index** arrived as the widget and the array as the date, and the pledge expand silently could not work in the modal. Every call site now passes all three arguments explicitly and the modal maps with a closure. This is the same class of bug as W04's v3.4 arity fix | [BUILD defect found during this port; the driver asserts no modal row carries an index or an undefined widget id] |
| 24 | Two latent gaps in **her** block, reported and NOT fixed | Her `class="state gft-empty"` uses `.gft-empty`, which **her stylesheet never declares**, so her own empty state carries no widget-specific styling. Separately, her `.gft-total-row` resolves only to a generic shell rule, not to anything in her gifts cluster | Ours uses `.gpf-empty`, declared in our own block. Her rules are left exactly as they are | [her own code; reported for her attention, never edited, in line with the additive rule] |
| 25 | Registry demo entries | Six `kind:"gifts"` entries | **Seven** `kind:"gifts-mb"` entries covering the two views, all three tiers, a narrowed campaign, a single-campaign instance and the empty state, all on the `(OC)` convention. **No entry seeds a donut view** | [the port convention of demoing each state; the driver asserts the donut is unreachable from the registry] |

**Open items carried, not resolved.** This widget carries the most of any in the run, and the port takes no side on any of them.

- **THE RECEIVED BASIS CONFLICT IS THE TOP ITEM, AND IT BLOCKS EVERY SUMMED FIGURE.** Ours counts **pledge-linked gifts only** (pledge-linked gift lines, posted, not voided, on or before the range end), excluding unpledged one-off gifts to the same campaign, per the standing owner decision of 2026-08-19 and mirroring the legacy widget. **The Modern API's existing responses count ALL posted gift detail for the purpose**, and the parallel campaign response's `TotalRaised` likewise counts all posted gifts, including gifts with no pledge link. The two figures differ whenever unpledged one-off gifts exist. Blocked until it is settled: every `received`, `dueRemaining`, `percentDue`, `progressPercent` and `totals` figure, which is to say APIs 1, 3, 4's totals and 5. Deciders are the project owner (product intent) and the backend team (which query ships). The port implements the built basis and confines it to one function so a flip has a single edit site.
- **The Step 4 doc contains an internal inconsistency about Percent Due, recorded here and deliberately not collapsed.** Its Data Contract CONFLICT row says the definition is *disputed* and build-blocking; its Sign-off Readiness note #2 declares it **RESOLVED** with live numeric proof (2020 Pledge 904 ÷ 1000 = 90.40%, Stoke Sell −655 ÷ 1200 = −54.58%); and the build computes Due Remaining ÷ Pledge Due. The port follows the build and the live proof. **Both statements stay on the record**, and the doc must stop disagreeing with itself before sign-off. The owner reconciles the doc.
- **The goal-met colour is contested.** The build and Step 4 both treat goal met as the **positive** end of the scale (green, with a Goal Met badge). The `Widget_Comparison_New_Widgets` doc records the modern `ProgressStatus` enum's goal-met value as **"red (goal met)"**. Step 5 v2 sidesteps the enum by serving a raw progress percent and banding client-side, which is what this port does, but the backend must still confirm the enum is genuinely presentation-only and safe to ignore, or its semantics get imported by accident.
- **`GF_Campaign` versus `GF_Purpose` keying for Goal is `[TO CONFIRM]`.** The Goal lives on the modern campaign model while the widget keys everything by purpose. Whether campaign rows map 1:1 to purposes, what happens when they do not, and where `isClosed` truly lives are all unconfirmed with the backend team. Blocked: `goal`, `progressPercent` and `isClosed` on APIs 1, 2 and 3. The build renders Goal as if real under Rule 11 and this port inherits that posture, **not** a verified source.
- **The "Open in Gifts and Pledges" stub sits against the standing export-only constraint, `[TO CONFIRM - Oisin]`.** The modal footer's navigation stub **predates** the v1.3 export-only ruling and may contradict it. It is carried exactly as built, labelled on screen as a stub, with no API allocated and no navigation backend. Note that the Final's own banned-verb assertion never covered the word "Open", which is how the two survived side by side. The decision only adds or removes a client-side route.
- **Every one of Jo's dossier flags on this widget is Unreviewed, and no reconciliation file exists for it.** None carries an Accepted, Rejected or Disputed status. They include: relabelling "% Due" to **"% Fulfilled"** and leading with fulfilment, which the build did **not** do and this port does not apply (her own block *does* use the % Fulfilled framing, so this difference is live on screen between the two widgets); a **data-as-of timestamp** by the refresh control, not built; the **pound-sign localisation defect**, where the live legacy widget renders a fixed pound sign regardless of organisation locale, so currency and locale rules for the rebuild are unspecified and en-US dollars is a build choice; and entitlement / empty behaviour when the module is not adopted, which is *not yet specified* and is nothing simulated here.
- **Four v1.2 judgement calls still await owner review**, all made 2026-08-24 and all shipped in this port: the **bar cap was lifted** (every campaign gets a bar, scrolling inside the card, rather than a trimmed top-N), the **trimmed table was removed** (every row with totals at both tiers), the **status counts moved into the legend**, and the bars order **closest-to-goal-first**. Lifting the cap and removing the trim together dissolved old Sign-off row 7 rather than answering it, and they removed an internal inconsistency where the bars ranked best-first while the trimmed table ranked worst-first.
- **Volume ceilings are `[TO CONFIRM - backend team]`** for campaigns per organisation, pledges per campaign and gifts per pledge, so the bounded verdicts on APIs 1, 2 and 4 are conditional. If campaigns exceed roughly 500 the summary paginates and the view toggle moves server-side. Related: the legacy grid's exact `ORDER BY` is unconfirmed, which is what the "renders in data order" rule depends on, and the `pageSize` maximum of 100 on API 3 is a defaulted value rather than an owner decision.
- **The pledge term, frequency and installment column names behind the Pledge Due proration are unverified in code.** The formula is fixed by the design; only the column names and their exact semantics are unconfirmed. The maths is confined to two functions so a correction has a single pair of edit sites.
- **The remaining older open items** are unchanged: drill-through to the Donors and Gifts module beyond the stub (Sign-off #6), and the `campaign-giving-tracker` overlap, which was **adopted** rather than left open, since this build aligns W17 to that model as recommended.

*Section added 2026-09-08 on branch oisin-v2-rebuild (base 71ca056).*

---

### 3b. Final Version Build Sheet

_No Build Sheet section for W17 (detailed rows were only written for W01-W05)._

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W17.md`._
