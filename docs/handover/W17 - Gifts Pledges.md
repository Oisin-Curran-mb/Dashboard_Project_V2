# W17 Gifts Pledges: handover

Written 28 September 2026, for a session starting with no history. Read this
before touching the widget. It exists because the expensive knowledge here is
not in the code: it is *why* the code is the shape it is, and which obvious
"improvements" have already been tried and rejected.

Owner: Oisin Curran. He rules on this widget item by item; nothing about its
behaviour is yours to decide. Ask, or state an assumption plainly and proceed.

---

## 1. Sixty seconds of orientation

W17 answers one question: **what has come in against each giving purpose, and
how far behind are the pledges?**

- **The row unit is the PURPOSE**, not the campaign. This matters and is easy to
  get wrong; see §4.
- **`PurposeID` is the guiding light, and the rule is strict.** Every figure comes
  from one of exactly two purpose-keyed queries (§4) and nothing else is ever
  shown. This money is tracked for tax; a number a reader cannot trace back to a
  purpose has no business on this widget.
- **Giving shows all the money given to a purpose.** The bar has THREE segments:
  pledge payments (dark), what is still expected against those pledges (white),
  and the gifts that sit beyond the pledge (light). They always fill the track, so
  the bar shows composition, not reach; the dark share is the progress. The line
  under it states all four figures in words. **No percentage appears on a Giving
  row** (owner, 28 Sep) - the row states the money given.
- **The table shows one read at a time**, switched by the Pledges / Gifts toggle
  on its own line under the view toggle. *Pledges* is the shipped panel, one to
  one. *Gifts* is money given to the purpose that answers to no pledge. Neither
  borrows a figure from the other. The Gifts table centres its headers and reads
  its data from the left, which is an owner override of D12 and applies to that
  table alone.
- **A pledge's position is read to the thru date; gift transactions obey the
  window.** A pledge is a cumulative promise, so nothing about it is ever
  re-scoped by a window start.
- **There is no per-purpose goal.** There used to be. It was invented and has
  been retired. Do not add one back.

Status: **finalised on our version, 28 September 2026**, and corrected the same
day after the owner spoke to Edward Eoff. Jo's rival block is deleted. Ours owns
kind `gifts`.

| | |
|---|---|
| Prefix | `gpF` (JS), `gpf-` (CSS), `data-gpf` (actions) |
| Kind | `gifts`, registered through `WIDGETS.register("gifts", …)` |
| Driver | `_tools/w17-gifts.driver.js`, 836 assertions |
| Decision record | `docs/decisions/W17.md` — 200 lines, the authority for every ruling |
| Review pack | `docs/review/W17 - Gifts Pledges.md` |

---

## 2. Where the code is

**Line numbers drift with every edit. Use the anchors, never the numbers.**
`_tools/widget-map.json` holds them and is the machine-readable source.

| Region | Anchor | Approx. |
|---|---|---|
| CSS | `/* ===== W17 Gifts Pledges V2 CSS , prefix gpF , kind "gifts" ===== */` to `/* ===== end W17 Gifts Pledges V2 CSS ===== */` | ~1821-2087 |
| JS | `var GPF_TODAY=` to `/* ===== end W17 Gifts Pledges V2 ===== */` | ~9070-9904 |
| Registry rows | `kind:"gifts"` | in the shell's `dashboards` array |

Extract both regions to `_tools/.tmp/W17.final.txt` without hunting (1,117
lines of CSS and JS together):

```bash
node _tools/extract.js W17
```

The widget id is positional, not a flag. `--print` writes to stdout instead;
`--side jo|aditya` reads the reference copies. `node _tools/extract.js` alone
prints the usage and the known ids.

### The code map

Roughly 70 `gpF*` functions. The ones worth knowing first:

**Model and arithmetic** — change these and every number on screen moves.
`gpFData` (the fixture), `gpFMakeGifts`, `gpFOtherGiftsFor`, `gpFDonorsFor`,
`gpFCycles`, `gpFScheduleRows` (steps a pledge's instalments for the schedule
panel), `gpFDonorPace`, `gpFPurposeCompute`, `gpFSumRows`, `gpFTotals`.

**The counting rule** — `gpFCounts` and `gpFCountsThru`. Posted and not-undone are
part of the DEFINITION of every money figure, not a filter detail: the legacy
repository tests `GFBatch.Posted` and `GFHistory.UnDoJournalID` before it sums
anything. On the owner's own dev database the excluded money was $30,192 against
$200 included. Every sum in this block goes through these two functions.

**The two tables** — `gpFTblMode`, `gpFTableToggle`, `gpFPledgesTable`,
`gpFGiftsTable`, `gpFGiftsHead`, `gpFGiftsRow`, `gpFWidePct`.

**The bar and its line** — `gpFSplitBar` (three segments), `gpFStillExpected`,
`gpFBarFoot`. The bar's scale is `max(pledged, paid) + gifts`: change it and an
over-paid pledge runs off the end of the track.

**The date window** — `gpFWindow`, `gpFRangeBounds`, `gpFInWindow`,
`gpFRangeShort` (the chip's short label), `gpFRangePhrase` (the full sentence,
used for aria-labels and the pop-up subtitle).

**Views** — `gpFGlance`, `gpFGivingBars`, `gpFSummaryTable`, `gpFContent`.

**The pop-up (the giving ledger)** — `gpFLedgerRows`, `gpFLedgerRowHTML`,
`gpFLedgerModalHTML`, `gpFPledgeHistory`, `gpFSchedulePanel`, `gpFGiftPanel`,
`gpFRenderModal`.

**Data constants** — `GPF_TODAY` (19 Aug 2026, the deterministic anchor; the
fixture is dated against it), `GPF_PURPOSES`, `GPF_DONORS`, `GPF_MEDIA`,
`GPF_MOTIVATIONS`, `GPF_RANGES`.

---

## 3. How to work here

### The house build pattern

**Do not hand-edit `index.html` for anything non-trivial.** Write an anchored
one-off script in `_tools/one-off/build-w17-<what>-<date>.js`, following the
thirty that are already there. The pattern:

- a header comment quoting the owner's words and saying what is changing and why
- `swap(a, b)` helpers that **throw if an anchor appears zero or more than once**
- guards at the end that abort *before* `writeFileSync`
- a bare-LF check, because the file is CRLF and must stay CRLF

The script is the record of how the change was made. It stays in the repo.

### Verify

```bash
node _tools/syntax-check.js
```

That is the **hard gate**: `node --check` on the shell script, CRLF purity,
balanced braces and comments in the stylesheet, and the IIFE tail the drivers
splice into. If it fails, stop and fix before anything else.

```bash
node _tools/verify.js --widget=W17
node _tools/verify.js
node _tools/lint.js
```

The full suite is 2,736 assertions across 17 drivers and must stay green. The
lint is a report, not a gate; its current findings are pre-existing and listed
in §7.

### Look at it in a browser

There is **no `.claude/launch.json` in this repo.** Serve the build folder over
http and open `index.html` with a **cache-busting query string** — a `file://`
URL is refused by the browser tooling, and without the query string you will
spend twenty minutes debugging the previous build.

```
http://localhost:8765/index.html?cb=1     # root = Complete Version 2
```

**This is not optional for W17.** Read §6 before you decide that reading the
markup is enough. It is not.

### The rules

- Work only inside `Complete Version 2`. Never touch the sibling clones under
  `Step 7 - Version 2`.
- `C:\Users\ocurran\source\repos\MBAccounting` is **read-only reference.**
- Nothing enters `index.html` from `_ref/` without an owner decision recorded in
  `docs/decisions/`.
- New scope gets a reviewable plan before you edit.
- Don't edit the old documents on the Desktop; they are inputs.
- Don't push without being asked.

---

## 4. The model, and the thing everyone gets wrong

**The legacy system holds two models, and the owner's two instincts each
described one.** This was the central finding of the rebuild and it is worth
understanding before you touch the arithmetic.

- The **dashboard panel** is pledge-only: `GFPledgeRepository.GetWidgetData`
  walks `GFPledge.GFHistoryDetails` on `PledgeID`.
- A **parallel purpose-wide path** exists — `GFPurpose.GFHistoryDetails` on
  `PurposeID` — and that panel simply does not use it.
- A **real goal does exist**, but it is `GFCampaignDetail.Goal` per *dated
  period*, and the Campaign screen measures it against every `CampaignID`-tagged
  gift. It is not a per-purpose number.

Our build had blended the two: a campaign-style goal measured against
pledge-linked receipts only. **The data does not support that.** The owner ruled
that both parts count. Then, later the same day, that they must count
**separately** — which is the shape the widget has now.

### The two queries, and nothing else

**Q1, the purpose's gift lines.** `GFHistoryDetail` where `PurposeID` is the row's
purpose, `GFHistory.GFBatch.Posted` is true, `GFHistory.UnDoJournalID` is null and
`GiftDate` falls in the window. Split once, on `PledgeID`: not null is a **pledge
payment**, null is a **gift**.

**Q2, the purpose's pledges.** `GFPledge` where `PurposeID` is the row's purpose
and `Active` is true. Pledge Total is `Sum(Pledge)`; Pledge Due is
`Sum(PledgeDue(true, thru))`.

That is the whole basis. No campaign anything: `CampaignID` and
`GFCampaignDetail.Goal` stay out, and the Campaign screen's figures are never
copied here because that screen omits the posted and not-undone tests.

### Confirmed on real data, 28 September

The owner queried `A90911DB` on `ssdevdevsql01` rather than let this rest on
inference:

- unpledged gifts to a purpose exist: `2022 GIF`, $200.00 over two lines, no
  pledge payments at all;
- that purpose has **no active pledge** while its `AllowPledges` is **1** — it
  permits pledging and simply has none, which is the shape the fixture models;
- $30,192.00 over five lines sits in unposted batches, money that must never
  count.

### The row shape

`gpFPurposeCompute` returns named figures and **no blended one**. There is no
`received` property; reaching for one is the mistake this shape exists to prevent.

| Figure | Means |
|---|---|
| `fromPledgesThru` | pledge payments to the thru date: the legacy panel's Received |
| `fromPledges` | the same money narrowed to the window: what Giving shows |
| `other` | gifts with no pledge, inside the window |
| `totalIn` | both: all the money given to the purpose |
| `pledgeTotal` | the full active pledge, never re-scoped |
| `pledgeDue` | the legacy proration on the thru date |
| `dueRem`, `percentDue`, `fulfilled` | the legacy formulas, all off `fromPledgesThru` |
| `windowed` | true when the preset has a start date |
| `hasPledges`, `giftN`, `giftDonors`, `giftDonorList`, `lastGift` | what each table mode needs |

### The gift data shape (from MBAccounting, read-only)

| Table | Carries |
|---|---|
| `GFHistory` (gift header) | `MediaID`, `MotivationID`, `CheckNumber`, `ReceiptNumber` |
| `GFHistoryDetail` (gift line) | `Amount`, `PledgeID`, `PurposeID`, `ProjectID`, `Sequence`, `CommemorativeID`, `PersonIDSubDonor` — **no media, no motivation** |
| `GFMotivation` | `Code`, `Name`, `PurposeID`, `StartDate`, `EndDate`, `Cost`, `CorrespondenceSent` |

That header-versus-line split is why "Prompted by" was dropped; see §5.

---

## 5. Decisions already made — do not quietly undo these

Each of these looks like an improvement waiting to happen. Each was decided
deliberately. If you want to change one, that is a conversation with the owner,
not a refactor.

**The per-purpose goal is retired.** With its 75% and 100% bands, its labels and
its colours. No such field exists per purpose. A newcomer looking at the bars
will want to add a target line. Don't.

**Nothing blends pledge payments with gifts into one figure.** They are two named
figures and a named total (§4). Putting them back into a single Received column is
what the 28 September correction undid, and it is the one thing the owner has said
most plainly: no number that cannot be traced to a purpose-keyed query.

**Nothing re-scopes Pledge Total to a window.** `gpFPledgedIn` existed to do that
and was deleted. A prorated pledge is not a figure the data holds.

**A preset's start date does not act in the Pledges table.** That is what keeps
the mode one to one with the panel, which has only a thru date. Making the start
act there would compare this window's receipts against a whole term's Pledge Due
and show a fully paid old pledge as catastrophically behind.

**On a windowed preset, Giving shows no percentage of pledged.** The money on
screen is the window's and the pledge behind it is the whole promise; a ratio
across the two dates is not a number the data holds. The pledged amount still
shows. Do not "restore" the percentage.

**Percent Due is a Detail column.** Measured: with it at Explore the purpose name
had 57px of the 166px it needs and every row read "BLDGF...". It is derivable from
two columns in the same row and stays in every row's screen-reader line at all
sizes. Do not narrow the money columns to bring it back: a clipped money figure on
a tax-tracked table is the worse defect, and real data holds larger amounts than
this fixture.

**No percentage appears on a Giving row.** The owner struck it on 28 September.
Both the bare percent and the labelled "82.00% paid" that replaced it are gone;
the row states the money given. Do not reintroduce a share of anything there.

**Both views end on the card's bottom edge**, and each got there a different way:
the table cancels `.wcontent`'s 10px padding inside this root only, because that
padding is the shell's and all seventeen widgets share it; Giving had a
`max-height:236px` cap on its bar list at Explore, now removed. If either view
grows white space at the bottom again, check those two things first.

**`lastGift` is not in the model.** The Gifts table had a Last gift column; the
owner removed it, so the field went too rather than stay as data only a test
reads. Bringing the column back means putting the field back.

**The default date preset has no start date.** "Gifts received through <date>".
This is what keeps the default reconciling with the shipped legacy panel, figure
for figure, on the pledge-payments subtotal.

**Pledge Total, Pledge Due, Due Remaining and Percent Due are unchanged from the
legacy formulas.** All four already matched. Keeping them is what lets the table
reconcile against the old system. Do not "simplify" them.

**The word "fiscal" is avoided.** Edward Eoff's instruction on the sibling
widget: it implies the General Ledger year, and gifts run on the calendar. The
preset is "Year to date".

**On screen it says "Gifts", never "other gifts".** In the *model*, `other`
means a gift with no pledge behind it, and it stays there — data key, class
names, comments all unchanged. The owner ruled twice on this wording.

**"Prompted by" (motivation) is dropped, but the model still carries it.**
"Until" was the operative word in the owner's instruction, so `GPF_MOTIVATIONS`,
`motive` and `motiveCode` are still seeded and the driver asserts they are.
Restoring the column is two spans and a grid template. The reason it went: a
motivation belongs to at most one purpose, but the picker is company-wide and
the value sits on the gift *header*, so a gift split across purposes carries one
motivation for all its lines — which may belong to a different purpose than the
line being read. In a purpose-scoped pop-up that can mislead silently.

**The table row opens the pop-up; it does not expand.** The inline donor drill
is fully retired (`gpFDonorPanel`, `gpFDonorHead`, `gpFDonorRowHTML`, `gpFPager`,
`gpFDonorRows`, `GPF_PAGE_SIZE` and the `open` / `ppage` / `export-donors`
handlers). One place answers "what is behind this".

**There are no export buttons anywhere on this widget.** Both stubs were
removed. Don't reintroduce one as a convenience.

**"Up to date", not "Paid in full"**, for a pledge that is merely current.

**The ledger orders by amount, largest first** — not by pace. It lists gifts and
pledges together, and "behind pace" means nothing for a gift.

**The Giving view has no caption.** Three sentences describing what the bars and
legend already say. The **Summary Table's caption stays** and is a live open
question (§7).

---

## 6. Traps that cost real time in this session

Read these. Every one of them was paid for.

### A row that exists is not a row you can reach

The ledger clipped **48 of its 58 rows**: 5,786px of rows inside a 410px box
carrying `overflow:hidden`. Earlier verification counted rows in the DOM, found
58, and passed. The rows existed and were unreachable.

**Screenshot the thing. Measure it.** Counting DOM nodes proves nothing about
what a user can see. This is the single most important line in this document.

The clip arrived with the sixty classes copied from Jo's block, where it was
*correct* — that container was the paged in-card drill and the clip preserved its
rounded corners. The ledger is not paged. It now has its own scroll container,
with the summary, filter and search pinned and the column header sticky.

### Copied CSS must sit in base position

When Jo's sixty `gft-*` rules were copied in as `gpf-*`, they were appended at
the **end** of our block, which inverted the cascade for four classes the block
already declared. `.gpf-body` computed `display:block` and lost its flex column.
Her cluster used to sit earlier in the stylesheet and her selectors were one
class less specific, so ours won twice over; after the copy both sides read
`.gpf-root .gpf-*` and the later copy won.

**Copied rules are the base and go first.** Caught by the duplicate-selector
lint, confirmed by measuring in the browser.

### Guards that match more than you meant

Every one of these bit:

- `gpFExp` matched inside `gpFExportBtn`
- `.pbar` matched `remO-pbar-track`
- `"What each purpose has received"` matched the about text *and* the toggle tip
- `absent(html, 'aria-expanded')` matched the header chips
- `absent(m, "from other gifts")` passed **vacuously** off the wrong element

Use word boundaries, or scope the assertion to the element you mean. A guard
that passes for the wrong reason is worse than no guard.

### Icon maps and `ICON(undefined)`

`gpFDonorChip`'s map carried `full`, which nothing produces, and lacked
`current`, which is what an up-to-date pledge gets. Result: a giant **UNDEFINED**
in the status column, invisible to every assertion about the row's figures. Maps
now have a `||"remove"` fallback.

### Class collisions across a block

A ledger row carried `gpf-grow` — the gift-list row class, redeclared later as a
three-column grid — which overrode the donor row's flex layout and wrapped six
cells onto two lines. It is also a `<button>`, and nothing reset the browser's
centred text. Give a new thing its own class.

### Pseudo-elements gated on the wrong attribute

`.gpf-datechip::before` was copied in to swap the shared filter-chip glyph for a
calendar. The shared glyph is gated on `[data-action]`; this block's chips carry
`data-gpf`. So there was nothing to override, and the rule added a text-only
pseudo-element with no icon font behind it — the chip printed the word
**"event"**.

### Shell quoting, CRLF, and comment terminators

- Heredocs convert `\r\n` escapes to real newlines. Write scripts with the Write
  tool instead.
- Backticks inside template literals bite.
- `*/` inside a block comment closes it early. A comment containing
  `.pbar-lg*/-hd` truncated a whole block.
- The drivers had bare LFs while `verify.js` is LF; anchors mismatched silently.
  Normalise to CRLF for `index.html`.

### Glance has a hard height budget

Glance was 133px of stack in a 103px box, clipped at 137px, cutting the last
line through its own text. The pill row and the caption each wrapped to two
lines. Both are now held to one line and scroll sideways — the pattern W15 Bank
Balances settled on — **scoped to the Glance tier alone.** It now measures 87px
in 87px. There is no headroom. Adding anything to Glance means measuring it.

### The modal is body-mounted

`render()` redraws widgets but **not** the body-mounted modal. A handler that
changes modal state must also call `gpFRenderModal()`. This was the defect the
owner remembered as "the pop up used to work correctly".

### The live registry object is shared

A driver that sets `w.gpFCamp = "All Campaigns"` mutates the shared registry
widget and poisons later assertions. Build a fresh widget for a state, and note
the build uses **"All purposes"**, not "All campaigns".

---

## 7. Open, and awaiting the owner

- **The Summary Table's captions.** Both are shorter since the split, and the
  Pledges one no longer repeats the date that sits in the chip beside it. Whether
  they are wanted at all is still unanswered.
- **The purpose name ellipsises at Explore**, 136px of the 166px it needs. Inherent
  to five money columns in a 568px card. The code prefix keeps rows identifiable
  and Detail shows names in full.
- **Percent Due when Pledge Due is zero.** The legacy POCO divides by 1 there,
  printing the negative of Received as a percentage. This shows "n/a". No fixture
  row hits it; on real data a purpose whose pledges all begin in the future
  would.
- **The real campaign goal.** Needs a campaign-period row unit. Not started.
- **W04's pacing basis differs from the legacy monthly step.** Recorded in Part
  10 of the review document.
- **Can the dashboard endpoint supply media and motivation?** The fields exist;
  the API spec does not request them yet.
- One stray edit: a `campaign`-to-`purpose` rename reached a comment inside Jo's
  own block ("capital campaign" became "capital purpose"). Her block is deleted,
  so it is moot.

Shell-wide, not W17's to fix: icons render as ligature text because the browser
cannot reach Google Fonts (self-hosting awaits a decision); the review viewer is
still in the file (lint T6, deliberate until release); GitHub Pages serves the
repo root, so `_ref/` and `docs/` are publicly reachable.

---

## 8. Reference material

| Where | What |
|---|---|
| `docs/decisions/W17.md` | **Start here.** Every ruling, dated, with reasoning. |
| `docs/review/W17 - Gifts Pledges.md` | The ours-vs-Jo's diff the owner ruled from. |
| `_tools/one-off/build-w17*` | Thirty scripts; the exact text of every change. |
| `Desktop\…\W17 Gifts Pledges - Thought Process and Concept Review (2026-09-28).md` | The evidence behind the rebuild. Read-only input. |
| `Desktop\…\W17 Gifts Pledges - Rebuild Plan (2026-09-28).md` | The work order. Read-only input. |
| `_ref/jo-phase2-8958e49.html` | Jo's build, frozen. Reference only. |
| `MBAccounting` (read-only) | `GFPledgeRepository`, `GFHistory`, `GFHistoryDetail`, `GFMotivation`, `GFCampaignDetail`. |

Live: https://oisin-curran-mb.github.io/Dashboard_Project_V2/

Findings from the demo review go in `Correction doc.xlsx` at the repo root.
