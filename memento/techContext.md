# Tech Context: Shelby Financials Dashboard V2

## Stack

| Layer | Tech |
|---|---|
| Runtime | Single self-contained HTML file (`index.html`) |
| Language | Vanilla JavaScript (ES5 for shell + widgets), no transpiler |
| Styling | Inline `<style>` block, Pathway design tokens |
| Tooling | Node.js v22 (no npm packages; all tooling is plain Node) |
| Line endings | CRLF throughout (`index.html`), enforced by `.gitattributes` |
| Version control | Git, GitHub (`main` branch) |

## File Inventory

| File / Path | Purpose |
|---|---|
| `index.html` | The build (~13,867 lines, CRLF). The V2 demo and spec in one file. |
| `handover.html` | V1→V2 handover document for Value Labs developers |
| `_tools/verify.js` | Runs all gates: syntax, drivers, lint |
| `_tools/syntax-check.js` | Checks `node --check`, CRLF purity, IIFE tail |
| `_tools/lint.js` | Pathway token audit; reports undeclared tokens and design defects |
| `_tools/extract.js` | Extracts one widget's regions to `_tools/.tmp/` |
| `_tools/serve.js` | Local dev server at port 8765 |
| `_tools/jo-port-driver.js` | Shared driver library (exports: `sharedPackage`, `TAIL`, `NODE_GLOBALS`, `code`, `meta`) |
| `_tools/wNN-name.driver.js` | Per-widget executable specs (19 drivers, ~3,400+ assertions) |
| `_tools/widget-map.json` | Widget metadata: name, kind, prefix, CSS/JS markers, tags |
| `_tools/baselines/index.a548419.html` | Jo's baseline at the OisinBranch split point (CRLF). Drivers compare against this. |
| `_ref/jo-phase2-d7f33b0.html` | Jo's latest Phase 2 (styling authority, untracked) |
| `_ref/jo-phase2-8958e49.html` | Jo's Phase 2 frozen 25 Sep 2026 (review reference) |
| `_ref/v1-main-e0a04c5.html` | V1 baseline (what Value Labs has) |
| `_ref/Design Review (Jo decisions on OC).md` | Jo's rulings on our widgets (23 Sep) |
| `docs/PLAN.md` | Master plan and standing decisions D1–D13 |
| `docs/SESSION-HANDOVER.md` | Day-to-day operating procedure for new sessions |
| `docs/SHARED.md` | What's shared between widgets vs kept duplicated |
| `docs/REPO.md` | Repo guide |
| `docs/decisions/Wnn.md` | Per-widget decision records (one file per widget) |
| `docs/handover/W13 - Purchasing Management.md` | Deep-dive handover for W13 |
| `docs/handover/W17 - Gifts Pledges.md` | Deep-dive handover for W17 |
| `docs/logic/W13-approval-flow.md` | Full approval flow model with Lucid diagrams |
| `docs/Pics/Version 1/Wnn - Name/` | V1 screenshots |
| `docs/Pics/Version 2/Wnn - Name/` | V2 screenshots |
| `Correction doc.xlsx` | Review log: defects and changes per widget |

## Tooling: verify.js Commands

```bash
node _tools/verify.js                    # all 19 drivers
node _tools/verify.js w13               # substring match on filename
node _tools/verify.js --widget=W10      # exact widget
node _tools/verify.js --kind=loans      # by kind
node _tools/verify.js --tag=uses:parseISO  # by tag
node _tools/verify.js --list            # list widgets, kinds, tags
node _tools/syntax-check.js            # syntax gate only
node _tools/lint.js                    # lint only
node _tools/serve.js                   # local server (port 8765)
```

## Local Demo URLs

```
http://localhost:8765/index.html#k=<kind>     # one widget, three sizes
http://localhost:8765/handover.html#wNN       # one handover section
```

## Screenshot Script

`_tools/one-off/shoot-handover-2026-10-07.js` — headless Chrome, 1920×1080, element-clipped PNGs.

```bash
node _tools/one-off/shoot-handover-2026-10-07.js W13 v2      # all V2 shots
node _tools/one-off/shoot-handover-2026-10-07.js W13 v1      # all V1 shots
```

Output: `docs/Pics/Version 2/Wnn - Name/Wnn-V2-NN Label.png`

## Design Token System (Pathway)

All values via Pathway tokens. Key token families:
- `--type-size-*` — typography
- `--padding-*` — spacing
- `--gap-*` — gaps
- `--cornerradius-*` — border radius
- `--semantic-color-*` — semantic colours (attention, brand, neutral, positive, negative, severe)
- `--wn-*` — widget-specific
- `--stroke-container` — 1px borders

`node _tools/lint.js` catches undeclared tokens (lint finding T1).

## CRLF Rule

- `.gitattributes` disables all git normalisation
- Jo's blocks converted to CRLF on insert
- Python patch scripts: `.replace("\n", "\r\n")` on old and new strings
- If `\r\r\n` appears: `s.replace("\r\r\n", "\r\n")`
- Never `sed -i` on `index.html`

## Browser Testing

- Headless Chrome via DevTools protocol (no packages)
- Start `_tools/serve.js`, open URL, wait for `document.fonts.ready`
- Viewport: 1920px (100% zoom), 1536px (125% zoom, owner's typical)
- Clip: page coordinates (`left + scrollX`, `top + scrollY`)

## Git Workflow

- Commits on owner's say-so only, one per finished widget
- Push only when owner says push
- Last known push: `c7af686` (9 Oct), `cd340f2` is HEAD as of 13 Oct 2026
- No merge of teammates' `index.html` without checking for latest owner rounds (grep `purf-gtile` as a recent marker)
- Prefer porting their block onto ours over merging

## Known Constraints / Gotchas (from SESSION-HANDOVER)

1. Python heredocs (`python - <<'EOF'`) break on long scripts — write to file and run
2. Python `cp1252` console crashes on em dashes; encode or avoid printing them
3. Em dashes (`—`, `\u2014`) are forbidden in markup, string literals, and handover prose
4. `W-numbers` forbidden in handover prose (write widget names)
5. `verify.js` runs some W13 sections with `payOn(true)` and some with the default `false`
6. Capture script step clicks are card-scoped; pop-up root is outside the card
7. Chrome capture clip is page coords; `getBoundingClientRect` is viewport coords
8. Jo's `.pur-tab` styles were deleted with her block on 27 Sep; when copying Jo components, copy their CSS too
9. Always grep that every class in new markup has a rule
10. Aditya's `ba64ad5` merge silently reverted 8–11 Oct work — **never merge a teammate's index.html without checking recent markers**
