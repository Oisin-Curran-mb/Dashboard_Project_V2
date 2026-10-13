# Active Context: Shelby Financials Dashboard V2

## Current Date: 13 October 2026

## Current Focus

The user (Oisin Curran, owner) has returned after a session gap. Prior AI conversation history was lost. The immediate goal is to:

1. Restore full project context via memento files (this session — in progress)
2. Await the owner's list of changes to implement next

## Last Known State (from SESSION-HANDOVER.md, written 9 Oct 2026)

### Git
- **HEAD**: `cd340f2` (as of 13 Oct 2026, per environment context)
- **Last push**: `c7af686` (9 Oct 2026, owner's instruction, covering 8–9 Oct round)
- **Aditya's merge incident**: `ba64ad5` (11 Oct) — "Resolve merge conflict: accept remote index.html" — was built on a stale 7 Oct copy and silently reverted all 8–11 Oct rounds. Handled by `git merge -s ours origin/main`; Aditya's new Alerts & Actions hunks (kind `alerts2`, Detail split pane) were manually ported onto our file.
- **Rule**: Never merge a teammate's `index.html` without checking it still contains latest owner rounds (grep `purf-gtile` as a recent marker).

### Code State
- `node _tools/verify.js` was green: **3431 passed, 0 failed** across 19 drivers (state as of 9 Oct evening)
- After Aditya's port (11–13 Oct), status unclear — verify must be run at start of next session

### W13 Purchasing Management — Open Question
- Commit `8e36ab1` built four logic rulings (rejected-row requests hidden, holds per row, Coming to you keeps Approve, newest first) that the owner said to record in MD only, not build: *"stop changing logic this only supposed to MD file"*
- **Owner has not yet said** whether to keep `8e36ab1`'s build changes or revert `index.html` and W13 driver to `d35f13c`
- **Do not touch W13 until the owner decides**

### W19 Alerts & Actions — Status
- Aditya's second Alerts & Actions copy (`alerts2`, Detail split pane) was ported from his `ba64ad5` diff
- The original `alerts` kind (W19, Oisin's version) remains in the file
- The public handover repo (`Dashboard_V2_Handover`) had Alerts & Actions withdrawn from the last release (`f36b180`, 7 Oct)
- Status of W19 in `index.html`: present (both kinds), but handover section for W19 may be incomplete or stale

### Handover Doc (`handover.html`) — Known Gaps
- Purchasing Management (W13): shot 07 shows new pop-up; **prose still describes Save/Cancel and editable grid** (deliberately not updated per owner, 9 Oct)
- Shots 02 and 05 for W13 predate the Jan–May data
- W19 (Alerts & Actions): section may be Draft or absent

### Public Release State (`Dashboard_V2_Handover` repo, commit `f36b180`, 7 Oct)
Released (WIDGET_SWITCH true): Budget, Pension, Payroll Distributions, Remittance Pledges, Receivable Invoices, Insurance Billing Plans, Deposits on Hand, My Status, Financial KPI  
Not yet released: PTO, Loans, Fixed Assets, Purchasing, Tasks (W14), Bank, Payables, Gifts, Alerts & Actions

## Open Owner Questions (as of 9 Oct handover)

1. **W13**: Should `8e36ab1`'s logic changes (rejected hidden, holds, Coming-to-you Approve, newest-first) be kept or reverted?
2. **W13**: Should "Coming to you" requests also offer Approve (currently they do)?
3. **W13**: Should the request table still default to oldest-first now that January orders sit on top?
4. **W19**: Final shape and status for both the `alerts` and `alerts2` kinds?

## Immediately Prior Changes (9–13 Oct 2026, chronological)

| Date | What | Commit |
|---|---|---|
| 9 Oct | Full round: PTO, Loans, Fixed Assets, Purchasing reworked; handover sections for first three at "Draft 9 Oct 2026" | `c7af686` (pushed) |
| 9 Oct (late) | W13 four logic rulings built (but owner said MD-only) | `8e36ab1` |
| 11 Oct | Aditya pushed `ba64ad5` (merge conflict, stale base) — reverted 8–11 Oct rounds | *(theirs, we didn't push)* |
| 11–13 Oct | Handled with `git merge -s ours`; ported Aditya's 6 Alerts hunks (alerts2) | `cd340f2` |

## What to Do at the Start of the Next Working Session

1. Run `node _tools/verify.js` — must say ALL DRIVERS GREEN before any edit
2. Run `node _tools/syntax-check.js`
3. Read `docs/decisions/W13.md` (the W13 open question about `8e36ab1`)
4. Ask the owner: **"What's the list of changes?"** — he said he would share it
5. Read the relevant `docs/decisions/Wnn.md` for any widget in the new change list

## Process Rules (Owner, Binding)

- **Plan before implementing**: new scope gets a short plan (files touched, what changes, open questions) and waits for "go". Small follow-ups can proceed directly.
- **Widget names, never W-numbers** in prose/captions/comments readers may see
- **Tokens only** — every style value from Pathway tokens; `node _tools/lint.js` catches violations
- **Jo Phase 2 is the styling authority** for "like Jo's" requests (source: `_ref/jo-phase2-d7f33b0.html`)
- **No handover work unless asked** ("dont worry about the handover document" was the owner's 9 Oct instruction)
- **No commits/pushes without owner's instruction**
- **Em dashes (`—`, `\u2014`) are forbidden** in markup, string literals, handover prose anywhere
- **CRLF throughout** `index.html`; use Python byte-level replace pattern; never `sed -i`
