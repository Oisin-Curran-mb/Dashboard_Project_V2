# Shell: Demo / Spec view toggle

Owner instruction, 5 October 2026: port Jo's Demo / Spec toggle from her live
phase-2 shell into Complete Version 2, and update the spec text so it describes
V2 as built rather than her file, which is out of date for us.

## Source

Jo's live page at `helloimjolopez-collab.github.io/design-sandbox/phase-2/Widget Container Demo/`,
fetched 5 Oct 2026 (her clone under `Step 7 - Version 2\Jo Phase 2 branch` is
at `deb572e`, 1 Oct). The toggle is NOT in the frozen reference
`_ref/jo-phase2-8958e49.html` (25 Sep); it is a later addition of hers.

Her pieces, taken verbatim except where noted:

| Piece | Hers | Ours |
|---|---|---|
| CSS `.viewtab`, `.vtb`, `.vtb.on`, `.spec*` | live L225-251 | shell CSS, after `.tn-avatar`, under the banner `Shell: Demo / Spec view toggle (dark, top-right) + spec document` |
| Top nav toggle (`role="tablist"`, Demo on by default) | live L3125-3128 | after `.tn-spacer`, before the Search icon, same as hers |
| `<section class="spec" id="specView" hidden>` | live L3152-3261 | after `#dashboard`; content rewritten (below) |
| Click branch `view-spec` / `view-demo` | live L10398 | shell dispatcher, after `modal-close`; adds `pop=null` so an open pop-over closes on a view switch |

Differences from her code:

- `.spec-mode` also hides `.fkp-band` (our W18 band mounts above the grid; her shell has no band element).
- Em dashes in her spec text removed throughout (owner rule). Her title "Accounting Dashboard — Implementation Spec" is now "Accounting Dashboard, Implementation Spec (Version 2)".

## Spec content rewritten for V2

Her text describes her shell (container queries at 720 / 1148, `fitSize()` /
`curCap()` size clamping, a widget catalog with category rail and preview, a
900px manage gate, one canonical 960 x 680 overlay). None of that exists in V2.
Each section was checked against `index.html` and rewritten:

| Section | V2 fact it now states |
|---|---|
| 1 Tokens | pathway-tokens 10.0.4 via CDN (primitives + light theme); the `:root` alias groups actually declared (`--txt-*`, `--wn-*`, `--cn-*`, `--brand-*`, `--am-*`, `--chart*`, `--pos/--red`, `--stroke-*`, `--surface-*`, `--gap-*`, `--padding-*`, `--cornerradius-*`, `--dur/--dur2/--ease/--dec`, `--focusring-base`); Pathway button border rule |
| 2 Grid | viewport media queries 768 / 1024 for 4 / 8 / 12 columns; 48px rows, 16px gap, `row dense`; sidenav hidden at 900px |
| 3 Sizes | spans 4/4/3, 4/8/6, 4/8/12; rows 3/8/9 (176 / 496 / 560px); W18 band above the grid; W08 and W19 Explore + Detail only (`tiers`) |
| 4 Resizing | header menu `wsize` then `pick-size`, tiers-limited, status line confirms; no automatic clamp, spans do the clamping |
| 5 Toolbar | switcher actions, Find a widget (scroll + flash), Refresh, Edit Dashboard mode and its toolbar, Add widget placeholder, in-grid Add tile, status line; the developer-only selector flagged as a review aid |
| 6 Overlays | `.pop` anchored panels; `.modal` 390 compact, `.modal-wide` 1080 / 94vw / 84vh, widget-specific sizes; D12 table header rule; no full-screen variant |
| 7 States | skeleton, `.state` empty / error with actions, same data at all sizes |
| 8 Accessibility | focus ring 2px / 2px offset, Pathway button ring, roles and aria on toggles / menus / rows, reduced motion, copy rules |
| 9 Inventory | W01-W19 by registered kind and tiers (driver checks it against `WIDGETS.register` and the registry) |
| 10 Build | one IIFE, `WIDGETS.register`, namespaced CSS, shared helper package, static data shaped like the API, drivers |

The two `.spec-link` anchors stay as her placeholders (`href="#"`) until the
owner supplies the Figma and SharePoint links.

## Auto-fixed defects

- Lint T2: her `.spec-tbl th,.spec-tbl td{...}` followed by separate `.spec-tbl th{...}` and `.spec-tbl td{...}` declared each selector twice. Merged into one rule per selector, same computed style.
- Lint T3: em dashes in her spec markup (user-facing). Removed.

## Driver

`_tools/shell-spec.driver.js` (new): toggle present once in the top nav, every
class and token declared, spec hidden by default, no em dashes, ten sections,
figures cross-checked against the grid / size / modal CSS, inventory rows equal
registered kinds plus the band, and the click branch driven both ways against a
fake document (class, hidden flag, aria-selected, scroll, pop-over closed, no
dashboard re-render).

## Not done, owner to rule

- Real Figma and SharePoint links for the two spec-link buttons.
- Whether the spec should also carry per-widget API notes (the Step 5 specs) or
  keep pointing at the SharePoint docs.
