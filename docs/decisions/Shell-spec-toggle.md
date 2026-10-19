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
| 3 Sizes | spans 4/4/3, 4/8/6, 4/8/12; rows 3/8/9 (176 / 496 / 560px); W18 band above the grid; W08 and W20 Explore + Detail only (`tiers`). W20 was W19 until the 16 Oct renumber; W19 is now Pending Actions, which offers all three sizes. |
| 4 Resizing | header menu `wsize` then `pick-size`, tiers-limited, status line confirms; no automatic clamp, spans do the clamping |
| 5 Toolbar | switcher actions, Find a widget (scroll + flash), Refresh, Edit Dashboard mode and its toolbar, Add widget placeholder, in-grid Add tile, status line; the developer-only selector flagged as a review aid |
| 6 Overlays | `.pop` anchored panels; `.modal` 390 compact, `.modal-wide` 1080 / 94vw / 84vh, widget-specific sizes; D12 table header rule; no full-screen variant |
| 7 States | skeleton, `.state` empty / error with actions, same data at all sizes |
| 8 Accessibility | focus ring 2px / 2px offset, Pathway button ring, roles and aria on toggles / menus / rows, reduced motion, copy rules |
| 9 Inventory | W01-W20 by registered kind and tiers (driver checks it against `WIDGETS.register` and the registry). 19 rows: one per registered kind, plus the W18 band. The kind regex is letters-only, so `alerts2` collapses onto `alerts`. |
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

## Addendum, 16 October 2026: the third view, Permissions

Owner instruction: add another document to the toggle, called Permissions, carrying the permissions
review (`docs/handover/Widget permissions - the old system and the V2 recommendation (draft).md`) with
pictures where links and actions need more care. Rule stated by the owner: every widget uses its
module's Dashboard right by default; the only further permission checks are for links and actions.

- Toggle: Demo | Spec | Permissions (`data-action="view-perm"`). The click branch now switches three
  ways: `.spec-mode` on for either document, `#specView` shown for Spec, `#permView` for Permissions.
- `<section class="spec" id="permView" hidden>` after the spec section, same classes, four numbered
  sections: the rule and the right-to-show table (17 widgets); links and actions with a picture per
  widget (11 figures under `docs/Pics/Permissions/`, captured from this build in headless Chrome);
  the six care points; the open decisions. A link to the full Markdown.
- One departure from the review document, by the owner's rule: Payroll Scheduled Time Off follows the
  Payroll Dashboard right like every other widget (the old panel used a separate task); its Approve
  and Undo carry the Update check.
- New CSS in the spec region: `.spec-fig`, `.spec-fig img`, `.spec-fig figcaption`, `.spec-rule`.
- Driver: `shell-spec.driver.js` extended (toggle regex with the third tab, section 5b for the
  permissions document, the click branch driven three ways). Suite 4,573 across 21 drivers. Default
  card dump unchanged.

### 17 October 2026: pictures of the old system's Task Role editor

Owner's screenshot of Security Setup, Task Roles, Update on the test1 host (Accounts Payable selected,
the Dashboard row first in the tree) placed under the rule in section 1 as `taskrole-dashboard-row.png`.
Then, from the in-app browser signed in to the same host, the task tree for each module a link or action
names, placed under its section 2 block: Purchasing Management (Request Information, Enter &amp; Manage;
Approval Override; Approval Paths), Accounts Payable (Payment Processing; View, Transaction Inquiry),
Bank Account Management, Donors And Gifts (its root row carries the module's name, not "Dashboard";
Manage, Pledges), Remittance (Manage, Enter &amp; Manage Pledges), Loan Processing (Modify, Loan
Information), Payroll (Modify, Employee Information, Time Off Hours and Secured Employees), General
Ledger (Reports, Special Reports). Eight pictures, `docs/Pics/Permissions/taskrole-*.png`, cropped to the
page card. The driver's picture list covers all twenty. Suite 4,591 across 21 drivers; Default dump
unchanged.
