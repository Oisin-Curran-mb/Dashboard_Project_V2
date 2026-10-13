# Product Context: Shelby Financials Dashboard V2

## What This Is

A single-page financial dashboard demo (`index.html`) for Shelby Systems' accounting product, targeting Value Labs as the client. It is a self-contained HTML file with all CSS and JavaScript inlined — no build system, no npm, no external packages. Node.js (v22) is used only for tooling (`_tools/verify.js`, `_tools/lint.js`, `_tools/serve.js`, etc.).

## Why It Exists

Value Labs received V1 (the original Jo Lopez dashboard). V2 is the upgraded version, incorporating:
- Jo Lopez's Phase 2 design improvements (selectively accepted by Oisin)
- Aditya's Financial KPI widget (W18) and Alerts & Actions widget (W19)
- Significant product logic improvements (approval flows, encumbrances, etc.)
- A complete handover document (`handover.html`) explaining V1 → V2 differences to Value Labs developers

## The User / Viewer

A finance manager or administrator at a faith-based organisation using Shelby Systems' accounting software. They see:
- A grid of financial widgets on their dashboard
- Each widget has three sizes: **Glance** (kpi), **Explore** (wide), **Detail** (xwide)
- The Financial KPI band (W18) sits full-width above the grid
- Widgets can be added/removed via the Edit Dashboard dialog

## The Demo vs Product Distinction

`index.html` serves both as:
1. The V2 product demo (what Value Labs evaluates)
2. The actual V2 specification (what developers will build from)

The `handover.html` documents what changed from V1 → V2 and what a developer needs to build it.

## What's NOT in V2

- No real data connections — all mock data
- No authentication or permission gates (modelled as constants, e.g. `PURF_OVERRIDE`)
- No write APIs — all actions are in-memory for the session
- Demo/spec toggle and single-widget review viewer are present but TEMPORARY (removed at release)

## Widget Registry

All widgets register via `WIDGETS.register(kind, {content, about, pop, modal, click, input})`. The shell dispatches by kind; no widget-specific branches in the shell itself. W18 (Financial KPI) is NOT a grid widget — it is a full-width band above the grid mounted at `#fkpBand`.

## Widget Sizes

| Size label | URL hash | Name |
|---|---|---|
| `kpi` | `#k=<kind>` | Glance |
| `wide` | `#k=<kind>` | Explore |
| `xwide` | `#k=<kind>` | Detail |

## The Styling Authority

Jo's Phase 2 (`_ref/jo-phase2-d7f33b0.html`) is the styling authority. When the owner says "like Jo's", copy her markup and CSS then swap raw values for Pathway tokens.

## Pathway Tokens Rule

**Every style value must use Pathway tokens** — `--type-size-*`, `--padding-*`, `--gap-*`, `--cornerradius-*`, `--wn-*`, `--semantic-color-*`. Column widths in px are the one accepted exception. `node _tools/lint.js` reports undeclared tokens.

## The Handover Document (`handover.html`)

For Value Labs developers. Structure per widget:
- W-number badge + widget name + change-type badge + review badge
- Screenshot pairs (V1 vs V2)
- Overview prose
- What's Different (by area, tied to screenshot names)
- Developer Notes (data model, rules, hooks, open questions)

Change-type badges: `t-visual` (Visual Only), `t-feature` (New Feature or Logic), `t-complete` (Complete Change), `t-new` (New Widget), `t-none` (No Change).

Review badge: `Draft <date>` until owner reviews, then `Reviewed <date>` with `rev ok` class. **Never promote to reviewed yourself.**
