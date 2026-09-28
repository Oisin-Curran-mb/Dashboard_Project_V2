# Shelby Financials Dashboard, Version 2 (Complete)

The single-file dashboard demo (`index.html`) being finalised for release to
Value Labs, plus the tooling that verifies it and the reference material the
review is made against. Owner: Oisin Curran. Plan: `docs/PLAN.md`.

## Status, 28 September 2026

Every widget is decided and finalised: W01 to W11 and W13 to W17 as dashboard
cards, plus W18 Financial KPI, which is a page section rather than a card and so
has no widget kind. W12 is an empty slot. Each card is a self-contained block
registered through `WIDGETS.register`, and each widget has a driver and a
decision record. The side-by-side comparison tab was retired with W17, the last
undecided widget, since there is nothing left to compare.

Remote: `Dashboard_Project_V2` on GitHub, public, branch `main`. The build is
served at https://oisin-curran-mb.github.io/Dashboard_Project_V2/.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The build. Started from design-sandbox `OisinBranch` at `198ffd5` (PR #3 head, 2026-09-21). CRLF line endings, on purpose. |
| `_tools/` | Verification. `verify.js` runs everything; see below. |
| `_tools/baselines/index.a548419.html` | Jo's `Widget Container Demo/index.html` at the point `OisinBranch` split from `phase-2` (CRLF-converted). The drivers' "Jo untouched" checks compare against this. |
| `_ref/jo-phase2-8958e49.html` | Jo's latest `phase-2` build, frozen 2026-09-25 12:34. Read-only reference for the review; never edited, never merged. |
| `_ref/Design Review (Jo decisions on OC).md` | Jo's rulings on the (OC) widgets (23 Sep). Same text as her PR #3 comment. |
| `_ref/v1-main-e0a04c5.html` | The Phase 1 demo Value Labs already received (`main`, 19 Aug). Baseline for the V1 -> V2 change document. |
| `_ref/oisin-docs/` | Our Design Differences doc (+ Confluence HTML) and the per-widget Build Sheet, as of PR #3. |
| `_ref/aditya/` | Aditya's `Demo V2.html` (a fork of the shell carrying W18 Variants A-D) and his v5 KPI design spec. |
| `Correction doc.xlsx` | Review log for the demo: one row per widget, with Defects and Changes columns. For a second team to record bad wording and defects they find while working through the live demo. Owner's document; filled in as the review runs. |
| `docs/review/` | One review pack per widget: Jo's rulings, what she implemented, our differences, reconciliation matrix. |
| `docs/handover/` | **Start here if you are new to a widget.** One document per widget: the model, where the code is, the decisions not to undo, the traps that already cost time, and what is still open. Currently W13 and W17. |
| `docs/decisions/` | One decision record per widget, filled during the review. Source for the final documents. |
| `docs/SHARED.md` | What the widgets share, which widget uses each piece, and what stays duplicated and why. |

## Verify

Plain Node (v22 tested), no packages.

```bash
node _tools/verify.js
```

Runs the syntax gate (`node --check` on the shell script, CRLF purity, IIFE
tail), then every `_tools/*.driver.js` (real handlers executed in a DOM shim,
thousands of assertions), then the design-defect lint as a report. Exit 1 on
any driver failure. `node _tools/lint.js` runs the lint alone.

To run less than everything:

```bash
node _tools/verify.js w05            # substring on the file name
node _tools/verify.js --widget=W10   # exact, validated against the widget map
node _tools/verify.js --kind=loans   # the widget serving that kind
node _tools/verify.js --tag=uses:parseISO   # every widget that shared helper affects
node _tools/verify.js --list         # the widgets, their kinds and their tags
```

What is shared between widgets, which widget uses what, and what was left
duplicated on purpose: `docs/SHARED.md`.

## Rules

- `index.html` stays CRLF. `.gitattributes` disables normalisation repo-wide.
- Nothing from `_ref/` enters `index.html` except by an explicit owner decision
  recorded in `docs/decisions/`.
- Never push to, or run tooling from, Jo's `design-sandbox` repo from here.
