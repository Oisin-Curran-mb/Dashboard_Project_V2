# W13 Purchasing Management: handover

Written 28 September 2026, for a session starting with no history. Read this
before touching the widget. The expensive knowledge here is the **approval
model**: three separate attempts at this widget got it wrong in the same way,
and the code's current shape is the correction.

Owner: Oisin Curran. He rules on this widget item by item; nothing about its
behaviour is yours to decide.

---

## 1. Sixty seconds of orientation

W13 is a purchase-request workflow board. It answers: **what is waiting for me
to approve, what is waiting on someone else, and what is ready to pay?**

The one thing to understand before anything else:

> **The approver's turn does not live on the status axis. It lives on the
> approval path.**

Every earlier version of this widget put it on the status, and every one was
wrong. A record has *one* stored status. Whose turn it is, and whether the
record can move, is computed from the ordered approval path and who has already
acted on it.

Status: **finalised on our version, 27 September 2026.** Jo's rival block is
deleted. Ours owns kind `purchasing`.

**And the second thing, added 28 September 2026:** the payment approval process
is a **company setting that is off by default**, so the board is not the
payment lifecycle. It is the approval path itself.

> **`PURF_USE_PAY` is `false`.** One column per level of the selected approval
> path, then Approved. Flip the constant to `true` and the four payment lanes
> come back, unchanged. Both boards live in the file.

| | |
|---|---|
| Prefix | `purF` (JS), `purf-` (CSS), `data-purf` (actions) |
| Kind | `purchasing`, registered through `WIDGETS.register("purchasing", …)` |
| Driver | `_tools/w13-purchasing.driver.js`, 414 assertions |
| Decision record | `docs/decisions/W13.md` — the authority for every ruling |
| Flow document | `docs/logic/W13-approval-flow.md` — the model, with legacy line references and four Lucid diagrams; §5c is the company setting and the path board |
| Review pack | `docs/review/W13 - Purchasing Management.md` |

Three views: **Table** (the default), **Kanban** (Detail only), **Encumbrances**.

---

## 2. Where the code is

**Line numbers drift with every edit. Use the anchors, never the numbers.**
`_tools/widget-map.json` holds them and is the machine-readable source.

| Region | Anchor | Approx. |
|---|---|---|
| CSS | `/* ===== W13 Purchasing Management V2 CSS ===== */` to `/* ===== end W13 Purchasing Management V2 CSS ===== */` | ~1537-1820 |
| JS | `/* ===== W13 Purchasing Management V2 JS , prefix purF , kind "purchasing" ===== */` to `/* ===== end W13 Purchasing Management V2 ===== */` | ~7843-8961 |
| Registry rows | `kind:"purchasing"` | in the shell's `dashboards` array |

Extract both regions to `_tools/.tmp/W13.final.txt` (1,418 lines, the largest of
any widget):

```bash
node _tools/extract.js W13
```

The widget id is positional, not a flag. `--print` writes to stdout instead;
`node _tools/extract.js` alone prints the usage and the known ids.

This is the **largest widget in the build**, ~1,120 lines of JS and ~120
functions. The record pop-up alone is a screen.

### The code map

**The model — read these first, they are the whole widget.**
`purFLivePath` (the path as it currently stands, **and the only switch between
the request and the payment path**, which is why gating the payment process
there was a small change), `purFPathDone`, `purFTurn` (whose turn it is),
`purFNeedsMe`, `purFLane` (the lifecycle lane; collapses to Pending approval /
Approved when the payment process is off), `purFMyLevel`, `purFStepUsers`,
`purFSteps`, `purFApproveStep`, `purFSeedPayment` (opens the payment path only
when the process is on).

**The columns** — `purFCols` (the column list: payment lanes as objects whose
markup is byte-identical to before, or the selected path's levels plus
Approved), `purFColOf` (which column a record sits in), `purFOpenLevel` (the
level next to act; **walks the levels the amount reaches**, see §6),
`purFColNo`, `purFLandCol` (where an approval will land, named in the confirm
dialog), `purFPathReq` (the board needs one concrete path).

**Scopes and filters** — `purFScopeCur`, `purFPendingSet`, `purFMineSet`,
`purFMatchStatus`, `purFPathCur`, `purFOvOnly`, `purFRows`.

**Views** — `purFBoard` / `purFCard` / `purFCardCls` / `purFTurnBadge`
(Kanban), `purFTable`, `purFGlance`, and the Encumbrances set
(`purFEncOpen`, `purFEncRows`, `purFEncPeriods`, `purFEncChart`, `purFEncTable`).

**The record pop-up = the Requests/Update page**, one-to-one.
`purFModalHTML`, `purFRecordGrid`, `purFGridRows`, `purFGridEnable`,
`purFGridTick` (the cascade rules), `purFRowsToActed`, `purFStatusOptions`,
`purFRecordDraft` / `purFRecordSave` / `purFRecordCancel`.
Modal source also lives in `_tools/one-off/w13-record-screen.part.js`.

**Drag and drop** — `purFCanDrag`, `purFDragStart`, `purFDragOver`, `purFDrop`,
`purFMoveCheck` (rules on the drop and names the refusal), `purFApplyMove`.

**Legend** — `purFLegendHTML` (payment) and `purFLegendNoPay` (the path board).
Two functions so the payment legend the owner signed off is never touched.
Every sample is the board's own markup, and the path board's Columns section is
built from `purFCols`, so the legend cannot drift from the board.

**Data constants** — `PURF_TODAY` (19 Aug 2026 anchor), `PURF_STAGES`
(`["Pending","Approved"]` — only two stored), **`PURF_USE_PAY`** (the company
setting `PO_Company.UsePaymentApprovalProcess`, **off**, whose DB default is
also 0), `PURF_LANES` (the four *derived* lanes, used only when it is on),
`PURF_ME` (`"Oisin Curran"`, the demo viewer), `PURF_SCOPES`,
`PURF_PATHS`, `PURF_PATH_APPROVERS`, `PURF_POS` (the requests),
`PURF_OVERRIDE` (the approval-override right, **off**), `PURF_ABOUT` /
`PURF_ABOUT_NOPAY` via `purFAbout()`.

The fixtures still carry `pay`, `payPath`, `payAppr`, `payDone` and `paid`.
**Leave them.** Nothing reads them while the process is off, and they are what
lets the constant be flipped back.

---

## 3. How to work here

### The house build pattern

**Do not hand-edit `index.html` for anything non-trivial.** Write an anchored
one-off script in `_tools/one-off/build-w13-<what>-<date>.js`, following the
twenty already there. The pattern:

- a header comment quoting the owner's words and saying what is changing and why
- `swap(a, b)` helpers that **throw if an anchor appears zero or more than once**
- guards at the end that abort *before* `writeFileSync`
- a bare-LF check, because the file is CRLF and must stay CRLF

### Verify

```bash
node _tools/syntax-check.js
```

The **hard gate**. If it fails, stop and fix before anything else.

```bash
node _tools/verify.js --widget=W13
node _tools/verify.js
node _tools/lint.js
```

The full suite is 2,838 assertions across 17 drivers and must stay green.

W13 itself is 414. Sections 1 to 4g of its driver force `PURF_USE_PAY` on
(`env.ctx.PURF_USE_PAY = true`, since the shim exposes the context) and assert
the payment board exactly as it was signed off; section 6 covers the shipped
default, the path board. **If you change the board, keep both alive.**

### Look at it in a browser

There is **no `.claude/launch.json` in this repo.** Serve the build folder over
http and open `index.html` with a **cache-busting query string** — a `file://`
URL is refused by the browser tooling, and without the query string you will
spend twenty minutes debugging the previous build.

```
http://localhost:8765/index.html?cb=1     # root = Complete Version 2
```

**W13 needs this more than most**, because its header layout has already broken
twice in ways only measuring caught (§6).

### The rules

- Work only inside `Complete Version 2`. Never touch the sibling clones.
- `C:\Users\ocurran\source\repos\MBAccounting` is **read-only reference.**
- Nothing enters `index.html` from `_ref/` without an owner decision recorded in
  `docs/decisions/`.
- New scope gets a reviewable plan before you edit.
- Don't push without being asked.

---

## 4. The model — the part that must be right

From `POOrderRepository.cs` and friends in MBAccounting. The full write-up with
line references is `docs/logic/W13-approval-flow.md`.

### One stored status

| Value | Meaning |
|---|---|
| 0 | Unapproved |
| 1 | Approved |
| 2 | Closed |
| 3 | Voided |

- **Rejected is never stored.** It is a *rejected approval row* on an Unapproved
  request.
- **Paid is never stored.** It is derived from the linked AP invoice's posted
  journal.

### Two paths per record

The **Approval Path** (on the request) and the **Payment Approval Path** (per
invoice, after approval).

A path is **ordered levels**:
- **"Then"** opens a new level.
- **"Or"** adds an interchangeable approver to the same level.
- Any one approver satisfies a level.
- Approving at a higher level **implies** the lower ones.
- The server does **not** enforce order; the grid and the "awaiting next" query
  do.

### Thresholds are per approver, not per level

`PO_ApprovalPath.RequiredMinimum` is on the **user row**. So:

- A level applies when at least one of its approvers' minimums is reached, and
  **only those approvers can act on it**.
- An "Or" level with different minimums **narrows** to the approvers the total
  reaches.
- A request that **no level applies to** (every minimum above the total) is
  released on approval **without an approver**, as the legacy `ApproveOrder`
  does on submit.

This was a real gap found from the owner's own Education Ministry path (Alfred
Johnson from $500, Then Jim Anderson… or Lanette Stewart from $2,000, Ends with
Pastor Bob from $5,000). Demo cases exist for each: PO-2899 ($640, Alfred
alone), PO-2891 ($3,150, Alfred approved and Lanette holding with Pastor Bob
unreached), PO-2907 ($430, the release case), PO-2633 ($15, released on both).

### The two "awaiting" scopes

- **Awaiting my approval next** — I am on the path and `Max(acted Sequence) + 1`
  is my level.
- **Awaiting my approval** — I am on the path and have not acted, wherever my
  level sits.

### Hold

A per-row reason. **And a known legacy bug we reproduce:** hold counts as
*acted*, so the next level sees the request as theirs. That is the legacy
behaviour; it is not ours to fix without a ruling.

---

## 5. Decisions already made — do not quietly undo these

**The payment approval process is a company setting, and it is off** (owner,
28 Sep). `PURF_USE_PAY = false`, matching the real DB default of
`PO_Company.UsePaymentApprovalProcess`. With it off there is no payment path, no
payment lanes, no Payment Approval tab and no payment-path dropdown — exactly
what `Requests/Update.aspx:93` hides — and an approved request goes straight to
Accounts Payable. **Both boards stay in the file behind the constant.** Do not
delete the payment board: flipping the constant is how the other behaviour is
demonstrated, and it is what keeps roughly 150 driver assertions meaningful.

**With the process off, the board is the approval path.** One column per level
of the **selected** path, in Sequence order, then Approved, then the Finish
column. The path chip is required there and offers no "All approval paths"; the
status chip is not offered at all, because the columns are the status axis.
Column titles are approver names; the threshold shows as a sub-line, as the
column's accessible name and hover, and as a **dimmed column reading "Not
required under $5,000"** when no request on the board can reach that level.
Forward is any later level or Approved, and `purFLandCol` names where the card
will actually land, because approving at a level implies the ones below it.

**Lanes are derived, never the raw status.** With the payment process on:
Pending approval (Unapproved) | Payment approval (Approved, payment path open) |
Ready to pay (payment approved, no check) | Paid (check posted). Closed and
Voided stay in the table and the Finish column, **not** as lanes. Rejected is
**not** a lane.

**A drop is an act on the live path**, not a status write. Pending → Payment
approval records my approval (and sets Approved only when every applicable level
is satisfied). Payment approval → Ready to pay records my payment approval.
Ready to pay → Paid enters the payment. Paid → Close. Unpaid → Void.

**Close is available at any time, from any lane, on hold or not** — matching the
Status list on Requests/Update. Void stays unpaid-only, because a paid order is
reversed in AP first.

**Any card that is not Closed or Voided can be picked up.** `purFMoveCheck`
rules on the *drop*, not the pickup: forward moves need the viewer's turn and
refuse by name; Close and Void are status actions and do not. This closed an
earlier gap where waiting, rejected and held cards could never reach Void.

**The record pop-up is the Requests/Update page, one-to-one**, including its
enable rules and its locks. Owner's words: "follow all the same rules, blockers
and locker". The grid cascade (`purFGridTick`) is `POApprovalsGrid.js` behaviour:
ticking Approved ticks every row at or below its level and clears their Rejected
and Hold; unticking clears Approved and Rejected on its level and above; an
acted row on a later level disables every Approved and Rejected; any acted row
locks Type, Approval Path, Vendor, Ship To and the Detail lines. **Save applies
everything at once like the postback; Cancel discards.** The body scrolls;
header and footer stay fixed.

**The Kanban drop uses the same cascade and stores the same rows as the record
screen**, so the board and the record cannot disagree. If you change one, change
both.

**The table is the default at Explore and Detail.** Kanban is a Detail-only
choice. Toggle order is Table | Kanban | Encumbrances at Detail, Table |
Encumbrances at Explore, so the default sits first.

**Department and Year filters are deleted.** Owner: "they dont approvied enough
and take up too much space". Neither field was confirmed on purchasing records,
so nothing real was lost. The Overdue chip stays.

**The legend follows the view.** Hidden entirely in Encumbrances. In Table view
it covers only what the table shows: status chips, turn badges, the Overdue
flag. The board legend covers lanes, Finish zones, badges, card colours and the
move rules. A plain info icon, **no circle and no border** — the owner's W09
ruling. Glance has no header block, so no icon.

**Glance shows what is waiting for *someone* to act**, not just me. Headline =
Pending approval + Payment approval + Ready to pay, pill "waiting for action".
Tiles: My approval / Coming to me / To be paid. Caption = "$X outstanding" only.
With the payment process off the third tile is **Waiting on others** instead,
"To be paid" having no meaning — the one place the 28 Sep work amends this
27 Sep ruling, and it is **flagged for the owner at review**.

**Only the three sizes remain.** The review-era fixtures were removed; the
driver builds those states itself.

**Encumbrances:** open = stage Pending or Approved, unpaid, no rejected request
row. Encumbrance = the order total (no line-level dollars in the demo). Period =
issue month. **Held orders count** — the legacy has no hold exclusion. Closed,
voided and paid release. The status chip is hidden in this view because
encumbrance *is* the open set by definition. **Unchanged by the payment
setting**, deliberately: the legacy rule keys off `Status`, never the payment
process, and paid-ness is still real when the process is off because AP enters
and pays the invoice by hand. A driver assertion pins the total as identical
either way, so the owner's signed-off figures cannot move by accident.

---

## 6. Traps that cost real time

### Everyone puts the turn on the status axis. Don't.

Jo's board assigned its three post-approval lanes from `hash(id) % 3`, derived
the number of approval steps from the *amount*, and read "steps done" from a
status string — letting "next" orders be approved out of turn. Our own earlier
version had real states but no notion of whose turn it was: approvers were a
display list and anyone could drag anything.

If you find yourself writing a lane or a permission from the status alone, stop.

### Measure the header, don't eyeball it

The Explore chip row was clipped behind the view toggle, showing "All approval
pa". Root cause: the chip row was **start-justified**, so it took its
max-content width and overflowed its grid track at both sizes. It now stretches
to its track, with sideways scroll as the fallback.

The attempted fix — stacking the chips and making the toggle icon-only — was
**reverted the same day** on the owner's screenshot ("no fix this to way it was
before"). What was kept: Table first, short Explore labels, the hidden leading
glyph, and the stretch so the toggle can never cover the chips again.

**Lesson:** a layout fix the owner has not seen is a proposal, not a fix. And
short labels at Explore only — aria-labels keep the full legacy wording, and
Detail is unchanged.

It happened a third time on 28 Sep, and again only measuring caught it: each
path-board column header sized itself to its own title, so the four card bodies
started at **524 / 539 / 524 / 511px** and the cards read as a ragged row rather
than a board. `.purf-pathboard .purf-kcol-h` now pins one header height and the
title clamps to two lines, so a narrower column cannot make it ragged again.
Measure `getBoundingClientRect().top` on every `.purf-colb` after any header
change; they must all be equal.

### Place a card by the levels its amount reaches, never the raw path

The columns are the **whole** path, but a card's column is chosen from the
levels its own **amount** reaches (`purFSteps`), then mapped back to a position
in the full path. Get this wrong and the board contradicts itself: the first
version of `purFOpenLevel` walked the raw step list, so PO-2891 ($3,150, held by
Lanette) was placed in Pastor Bob's $5,000 column while the same board greyed
that column out as "Not required under $5,000".

This is the §6 trap above wearing different clothes. The threshold is part of
the model, not decoration, so every placement decision has to consult it.

### The legend is built from the board's own markup

`PURF_STAGE_TONE`, `.purf-turn-*`, `.purf-card-*`, `.purf-fin-*`. That is
deliberate: the legend cannot drift. If you add a badge or a card colour, the
legend picks it up — and the driver asserts every lane, badge kind and card
class appears in it.

### Orphan-CSS sweeps nearly deleted runtime-built classes

`purf-turn-*` and `ptof-mst-*` are assembled at run time from string fragments,
so a naive "declared but never used" sweep flags them as dead. Detection now
harvests string literals with a tokenizer plus hyphen-terminated stem detection.
**Do not trust a class-usage sweep on this block** without checking for
constructed names.

Related: a regex over a whole JS file mis-pairs quotes on the first apostrophe.
Tokenize.

### `purFRejectStep` / `purFClearReject` have no UI call site

They are driver-tested but nothing calls them. **This is a missing feature, not
dead code** — rejecting from the board was never wired. Do not sweep them.

### Comment terminators and CRLF

`*/` inside a block comment closes it early. Heredocs convert `\r\n` escapes to
real newlines — write scripts with the Write tool. `index.html` is CRLF; keep it
so, and the syntax gate will tell you if you slip.

---

## 7. Open, and awaiting the owner

**Backend, the big one.** There is **no approval, hold, payment or archive write
API**. Every action is in-memory for the session. Nothing persists. This is the
largest gap between the demo and a shippable widget.

- The **Feargal C3 payment-location dispute** and the **voided-request
  treatment** are unresolved.
- **Delegation and out-of-office are not modelled** — the legacy has none
  either.
- The **"Starts with <creator>" pseudo-step** is not modelled in the demo data.
- The **approval override right** is modelled as `PURF_OVERRIDE`, off. The Reset
  button from the legacy page was not carried.
- `purFRejectStep` / `purFClearReject` need a UI decision (above).
- **Glance’s third tile** is "Waiting on others" with the payment process off,
  replacing "To be paid" from the 27 Sep Glance ruling. Substituted on reasoning,
  not on a ruling, so the owner still has to see it.
- **The approval path itself** is the next piece of work (owner, 28 Sep: "after
  we will look into the approval path"). Nothing here touches how paths are
  built, displayed or edited; the board only reads `PURF_PATHS`.
- **W06 and W09 define the same named check with different strictness**;
  consolidating will change one driver's result. Not W13's, but it is in the
  same neighbourhood.

Shell-wide, not W13's to fix: icons render as ligature text because the browser
cannot reach Google Fonts; the review viewer is still in the file (lint T6,
deliberate until release); GitHub Pages serves the repo root, so `_ref/` and
`docs/` are publicly reachable.

---

## 8. Reference material

| Where | What |
|---|---|
| `docs/decisions/W13.md` | **Start here.** Every ruling, dated, with reasoning. |
| `docs/logic/W13-approval-flow.md` | The model in full: statuses, both paths, gates, hold, lane and badge derivation, the two scopes. Four Lucid diagrams. |
| `docs/review/W13 - Purchasing Management.md` | The ours-vs-Jo's diff the owner ruled from. |
| `_tools/one-off/build-w13*` | Twenty scripts; the exact text of every change. |
| `_tools/one-off/w13-record-screen.part.js` | The record pop-up's source. |
| `MBAccounting` (read-only) | `POOrderRepository.cs`, `PO_ApprovalPath`, `POApprovalsGrid.js`, `PurchasingManagement.ascx.cs`, `GLAccountRepository.cs` (the encumbrance rule, ~line 2220). |

Live: https://oisin-curran-mb.github.io/Dashboard_Project_V2/

Findings from the demo review go in `Correction doc.xlsx` at the repo root.
