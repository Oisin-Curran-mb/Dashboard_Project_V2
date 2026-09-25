# Version 2 Final: plan

Agreed 2026-09-25 between Oisin (owner) and Claude. This is the working plan;
edit it when a decision changes and note the date.

## Goal

One clean, product-ready `index.html` for Value Labs, built from Oisin's PR #3
branch, with every difference from Jo's V2 consciously ruled on, Aditya's KPI
widget added, and three documents: V1 -> V2 changes (Value Labs), change
rationale (manager), and the logic behind each widget's functions.

Manager's agreed task list:
- Review Jo's changes and justify accepting or declining each
- Make the changes needed based on her feedback
- Document what changed from V1 to V2
- A viable version that can be released and signed off
- Documents for the logic of the changes and the functions
- Aditya: KPI added to V2 and documented

## Decisions (owner, 2026-09-25)

| # | Decision |
|---|---|
| D1 | Base is the PR #3 branch (`OisinBranch` @ `198ffd5`). Changes are applied from there. Jo's `phase-2` is NOT merged. |
| D2 | One local skill (`v2-port`) for editing/porting, using Jo's live styling from `_ref/`, never routed through stale docs. |
| D3 | Repo layout: `index.html` at root, `_tools/`, `_ref/`, `docs/`. |
| D4 | The owner rules on everything; no locks, no defaults that override him. Design and layout DEFECTS are auto-fixed and logged. |
| D5 | Jo's latest V2 (`phase-2` @ `8958e49`, 25 Sep 12:34) is the comparison reference, frozen in `_ref/`. |
| D6 | Line endings stay CRLF (deviation from the first draft, which said LF): the 17 drivers are CRLF-bound throughout and we are no longer merging her file. Jo's blocks are converted to CRLF on insert. |
| D7 | The drivers' snapshot and `git show a548419` dependencies are replaced by the committed `_tools/baselines/index.a548419.html`. |
| D8 | (25 Sep) Target structure: one self-contained block per widget (CSS, data, render, popups/modals, handlers, registry rows) plus a labelled Shell section. Widgets plug in through a registration object (`WIDGETS.register(kind, {content, about, pop, modal, click, input})`); the shell's if-chains become generic lookups. Nothing unused survives; shared helpers are labelled with the widgets that use them. |
| D9 | (25 Sep) Widgets are finished one at a time, end to end: review pack -> owner decision -> final self-contained block -> delete the losing version, retired v1 remnants and cmp row -> retarget driver -> verify -> `docs/decisions/Wnn.md` -> commit. No separate collapse phase. The cmp tab keeps rows only for undecided widgets. |
| D10 | (25 Sep) Code comments: keep what a function/block does, why non-obvious logic exists, and structural markers agents rely on (region banners, `data-<prefix>` conventions, "shared by Wnn" labels). Remove decision history, "what changed", row citations, dates, stash/rebase notes, "Jo's block untouched". History lives in `docs/decisions/`. |
| D11 | (25 Sep) Pilot: W14 Main Content Tasks and W08 My Status. Owner ruling: keep Jo's version of both; `mystatus-oc` is deleted. |
| D12 | (25 Sep) **Table header rule, all widgets and pop-ups:** a header cell carries exactly the same width/alignment classes as the body cells in its column, so headers sit over their data. Text columns left-aligned, amount/count columns right-aligned, nothing centred. Checked per widget at build (driver `H.headMatchesBody`) and fixed as a defect. |

## Key facts the plan rests on

- Jo reviewed the (OC) widgets on 23 Sep (`_ref/Design Review (Jo decisions on OC).md`): global rules G1-G12 plus Accept / Reject / Rebuild per item for W01-W07, W09-W11, W13, W15-W17. She did not review W08, W12, W14, W18.
- She then applied her accepted items to HER OWN widgets on `phase-2` (213 commits, 09 Sep -> 25 Sep). She never edited the (OC) clones.
- Kind naming is mixed. W01-W07: Jo's live widgets are the `-mb` kinds (she adopted the August port), ours are `-oc`. W09-W17: hers are plain kinds, ours are `-mb`. W18 is a fixed band with no kind.
- Aditya's `Demo V2.html` is a fork of the whole shell. Its W18 Variant A is our W18; he added Variants B (solo tiles), C (WCAG AA band), D (dual runway), Alerts widgets, and a finder hook that edits Jo's code. It has an inverted `fkpActiveV` bug and lacks our 17-21 Sep edits. Porting = lifting the B/C/D blocks, not the file.
- V1 (what Value Labs has) = `main`'s `Widget Container Demo/index.html`, identical to `phase-2` @ `e0a04c5` (19 Aug).

## Phases

### Phase 0: clean slate (done 2026-09-25)
Repo pruned to the approved layout; drivers re-homed to `_tools/` with the baseline dependency; `verify.js`, `syntax-check.js`, `lint.js`; `.gitattributes` (no normalisation); `v2-port` skill; this plan. Tag `seed`.

### Phase 1: review packs
One `docs/review/Wnn - Name.md` per widget, compiled from: S1 Jo's Design Review; S2 her PR #3 comment (same text, cite only); S3 her actual `phase-2` edits for that widget, `a548419..8958e49`, mapped to her rulings (implemented / not yet / done differently); S4 our Design Differences doc; S5 the Build Sheet; S6 our OC clone as built (`198ffd5`); S7 Step 4 doc + Step 5 v2 API spec; S8 Step 6 dossier where one exists.

Pack sections: header with source commits; Jo's rulings numbered J1..Jn plus applicable G-rules; what Jo actually changed; our documented differences (marked current or stale vs S6); reconciliation matrix (`Item | Jo's ruling | Jo implemented? | Our position + evidence | Status | Decision | Notes`, Status in {Agree, Contest, Drifted, Open, Unreviewed}, Decision left blank for the owner); open questions and API flags; decision record (filled in Phase 2).

Plus `docs/review/00 - Review Index.md`: G1-G12 with our stance, per-widget status board, cross-cutting items (currency, permission gates, API gaps).

W01 first as a pilot for format approval, then W02-W07, W09-W17, then W08 / W14 / W18 as Unreviewed packs, then G1-G12 as a batch.

### Phase 0b: prep for the per-widget process (25 Sep, done)
Comment diet on our code (D10): -1,880 lines. Registration plumbing (D8): `WIDGETS` at the top of the shell IIFE, six dispatch points hook it. Pilot (D11): W14 and W08 are self-contained registered blocks, the W08 clone is deleted, both have decision records and drivers. File 18,770 lines; 18 drivers, 8,274 assertions green. Shell labelling pass (shared helpers marked with their users) still to do; it is folded into each widget's finalisation.

Placement rules learned: `WIDGETS` inside the IIFE; finished blocks before `var dashboards=` (registry rows read widget data at load); registry rows stay in the shell's array, labelled.

### Phase 2: review + finalise, one widget at a time (D9)
Owner rules per item. Claude applies, runs lint (auto-fixing defects), runs `verify.js`, records in `docs/decisions/Wnn.md`. Where Jo's version of a widget wins, her latest block is ported from `_ref/jo-phase2-8958e49.html` over the 08 Sep copy already in the file (converted to CRLF), per widget, per commit. Her shell-wide changes (size step-down, container/sheet styling, Add-widget dialog, finder, title-tap swap) are reviewed as their own batch under G1-G12.

### Phase 3: W18 / Aditya
Owner picks which of Variants A-D ship. Port the chosen B/C/D blocks (CSS, mount divs, `fkpSolo*/fkpC*/fkpD*` JS) from `_ref/aditya/Demo V2.html`; fix `fkpActiveV`; rule on the `wfind-fkp` finder hook (edits Jo's code); resolve Variant D's invented "Current runway"; strip the prototype-only demo chip for release. Update `w18-fkp.driver.js`. `docs/decisions/W18.md`.

### Release gate (before v2.0-rc1)
- Remove the TEMPORARY review aid: the `viewOnly` filter, the `hashchange` listener, `viewOnlySelectHTML` and its `change` listener, and `viewOnly(` in `render()` (all in the "Shell: single-widget viewer" block). Lint rule T6 reports it while present.
- Remove the cmp tab, `CMP_ROWS`, `CMPNOTE_`, `cmpCards`, `cmpnote-mb`.

### Phase 4: collapse to release candidate
Remove the cmp tab (`CMP_ROWS`, `cmpCards`, `cmpnote-mb`, `CMPNOTE_`), the losing copy of every widget, the retired v1 kinds (`budget`, `pension`, `payroll`, `remittance`, `ar`, `insurance`, `deposits`), commented driver fixtures, `stash@{0}` banners, `(OC)` titles; rename surviving kinds to plain names; fix known CSS leaks (`insO` re-declares `.insf-scope`; `penO` duplicates `.penf-*`). Retarget each driver at the surviving widget. One catch-up diff of Jo's `phase-2` since `8958e49`, presented as a final pack. Full verify green. Tag `v2.0-rc1`.

### Phase 5: documentation
From `docs/decisions/`: V1 -> V2 changes for Value Labs (baseline `_ref/v1-main-e0a04c5.html`); change rationale for the manager (ruling, decision, why, backend implications); logic docs per widget cross-referenced to Step 5 v2 specs; W18 KPI doc; sign-off checklist.

### Phase 6: publish
New GitHub repo (account, name, visibility confirmed with the owner first); optional Pages; hand-off to Value Labs.

## Working rules
- No edit to `index.html` without an owner decision behind it, except lint-class defects (logged).
- `node _tools/verify.js` green before any commit.
- Commit per widget decision, message names the widget and the decision record.
- Never touch Jo's `design-sandbox` clones from this repo; never push anywhere without the owner's say.
