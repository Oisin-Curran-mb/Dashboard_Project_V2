# System Patterns: Shelby Financials Dashboard V2

## Architecture Overview

`index.html` is a single self-contained file (~13,867 lines, CRLF). One `<style>` block and one `<script>` block (a single IIFE) form the shell. Each widget contributes exactly one CSS region and one JS region, both clearly banner-delimited.

```
index.html
├── <style>
│   ├── Shell CSS (tokens, primitives, layout)
│   ├── W14 Main Content Tasks V2 CSS
│   ├── W08 My Status V2 CSS
│   ├── W10 Loans V2 CSS
│   ├── W09 PTO V2 CSS
│   ├── W11 Fixed Assets V2 CSS
│   ├── W13 Purchasing V2 CSS
│   ├── W17 Gifts Pledges V2 CSS
│   ├── W19 Alerts & Actions V2 CSS
│   ├── W01–W07 CSS (each with start/end banners)
│   └── W18 Financial KPI V2 CSS
└── <script> (IIFE)
    ├── Shell: Demo/Spec toggle
    ├── Shell: widget registration (WIDGETS object)
    ├── Shell: shared widget helpers (common package)
    ├── Shell: single-widget viewer (TEMPORARY review aid)
    ├── Shell: widget switchboard (WIDGET_SWITCH)
    ├── W18 Financial KPI V2
    ├── W08 My Status V2
    ├── W14 Main Content Tasks V2
    ├── W01 Budget Compared to Actual V2
    ├── W02 Pension Plans V2
    ├── W03 Payroll Distributions V2
    ├── W04 Remittance Pledges V2
    ├── W05 Receivable Invoices Outstanding V2
    ├── W06 Insurance Billing Plans V2
    ├── W07 Deposits on Hand V2
    ├── W09 Payroll Scheduled Time Off V2
    ├── W10 Loans With Balance Due V2
    ├── W11 Fixed Asset Values V2
    ├── W13 Purchasing Management V2
    ├── W17 Gifts Pledges V2
    ├── W19 Alerts & Actions V2
    ├── W19-Copy alerts2 (Aditya's second Alerts copy)
    ├── var dashboards = [...] (registry rows)
    ├── Shell: Bank Balances (W15, Jo's block)
    ├── Shell: Accounts Payable By Due Date (W16, Jo's block)
    ├── Shell: main render/dispatch functions
    └── W18 Financial KPI band init
```

## Widget Block Structure (D8)

Each widget is one self-contained block with this shape:
```
/* ===== Wnn Widget Name V2 CSS ===== */
  .prefix-class { ... }
/* ===== end Wnn Widget Name V2 CSS ===== */

/* ===== Wnn Widget Name V2 ===== */
  var WPREFIX_DATA = [...];
  function wPrefixContent(w) { ... }
  function wPrefixAbout(w) { ... }
  function wPrefixHandleClick(a, id, t) { ... }
  function wPrefixPopContent(w) { ... }
  function wPrefixModalHTML(w) { ... }
  WIDGETS.register("kind", {content, about, click, pops, modals});
/* ===== end Wnn Widget Name V2 ===== */
```

## Widget Registration Pattern

```js
WIDGETS.register("kind", {
  content: function(w) { return "...html..."; },
  about: function(w) { return {h: w.title, b: ABOUT_TEXT}; },
  click: function(a, id, t) { return !!(a && a.indexOf("prefix-") === 0 && handleClick(a,id,t)); },
  pops: {
    "prefix-chipname": {
      content: popContentFn,
      trigger: function() { return '[data-action="prefix-chipname"][data-id="'+pop.id+'"]'; }
    }
  },
  modals: { modalname: modalHTMLFn }
});
```

## Widget Prefix / Kind / CSS Prefix Map

| W# | Name | Kind | JS Prefix | CSS Prefix |
|---|---|---|---|---|
| W01 | Budget Compared to Actual | `budget` | `bgtO` | `.bgtO-` |
| W02 | Pension Plans | `pension` | `penO` | `.penO-` |
| W03 | Payroll Distributions | `payroll` | `prO` | `.prO-` |
| W04 | Remittance Pledges | `remittance` | `remO` | `.remO-` |
| W05 | Receivable Invoices Outstanding | `receivables` | `arO` | `.arO-` |
| W06 | Insurance Billing Plans | `insurance` | `insO` | `.insO-` |
| W07 | Deposits on Hand | `deposits` | `depO` | `.depO-` |
| W08 | My Status | `mystatus` | `mys` | `.mys-` |
| W09 | Payroll Scheduled Time Off | `pto` | `ptoF` | `.ptoF-` |
| W10 | Loans With Balance Due | `loans` | `lonF` | `.lonF-` |
| W11 | Fixed Asset Values | `fixedassets` | `faF` | `.faF-` |
| W13 | Purchasing Management | `purchasing` | `purF` | `.purF-` / `.purf-` |
| W14 | Main Content Tasks | `tasks` | `mct` | `.mct-` |
| W15 | Bank Balances | `bank` | `bank` | `.bank-` |
| W16 | Accounts Payable By Due Date | `payables` | `ap` | `.ap-` / `.pay-` |
| W17 | Gifts Pledges | `gifts` | `gpF` | `.gpF-` / `.gpf-` |
| W18 | Financial KPI | *(band, no kind)* | `fkp` | `.fkp-` |
| W19 | Alerts & Actions | `alerts` | `alo` | `.alO-` |

## CSS Region Banners

```
/* ===== Wnn Name V2 CSS ===== */
...
/* ===== end Wnn Name V2 CSS ===== */
```

## JS Region Banners

```
/* ===== Wnn Name V2 ===== */
...
/* ===== end Wnn Name V2 ===== */
```

## Shell: Widget Switchboard

```js
var WIDGET_SWITCH = {
  W01: true, W02: true, ... W19: true
};
```
Flip to `false` to hide from dashboard without removing code. URL override: `#only=W01,W02`.

## Shell: Shared Helpers Package

Inside the IIFE under banner `Shell: shared widget helpers (the common package)`. Each widget has a one-line alias pointing to the shared impl.

| Helper | Used by |
|---|---|
| `escAttr` | W02, W03, W04, W05, W06, W10, W16, W17 |
| `escText` | W09, W11, W13, W18 |
| `parseISO` | W03, W04, W10, W13, W16, W17 |
| `fmtDateLong` | W04, W05, W10, W13, W17 |
| `MONTHS` | W04, W13, W16, W17 |
| `moneyFull` | W02, W10, W13, W16 |
| `bandFromDays` | W04, W17 |

## Interaction Patterns

- **Click handler**: `data-action="prefix-actionname"` on element; one `prefixHandleClick(a, id, t)` per widget switching on the value
- **Pop-overs**: shell's `.filter-chip` with `.pop / .cap / .mi` menus; caret needs `data-dir` + `--caret-x`
- **Modals / pop-ups**: shell's `.modal-backdrop / .modal / .modal-h / .modal-b / .modal-f`; widget-specific class for specifics
- **Tables**: `.wt-row / .wt-head`, sort headers `.wt-sort`; no min-width on table so card never scrolls sideways
- **Status chips**: widget-specific `.prefix-stchip-<kind>` on semantic tokens
- **Tooltips**: `data-tip` attribute, shell tooltip engine (narrow, plain)

## HTML Regions (in `<body>`)

```html
<div class="fkp-band" id="fkpBand"></div>  <!-- W18 KPI band -->
<div id="dashboard"></div>                  <!-- widget grid -->
<div id="overlay"></div>                    <!-- pop-over overlay -->
<div id="modalRoot"></div>                  <!-- modal root -->
<div id="toastRoot"></div>                  <!-- status toasts -->
```

## Tool Gates (run in this order after every edit)

```bash
node _tools/syntax-check.js          # SYNTAX OK
node _tools/verify.js w13            # widget driver
node _tools/verify.js                # all 19 drivers (~90 s)
node _tools/lint.js                  # compare finding counts
```

## File Editing Rule (CRLF)

`index.html` is CRLF. When using Python to patch:
```python
P="index.html"; s=open(P,"rb").read().decode("utf-8")
def sub1(o,n):
    global s; o=o.replace("\n","\r\n"); n=n.replace("\n","\r\n")
    assert s.count(o)==1,(s.count(o),o[:80]); s=s.replace(o,n)
sub1("old text", "new text")
open(P,"wb").write(s.encode("utf-8"))
```
Never `sed -i`. Never double-convert (causes `\r\r\n`).

## Driver Architecture

`_tools/verify.js` runs:
1. Syntax gate (`node --check` on the script, CRLF purity, IIFE tail)
2. Every `_tools/wNN-name.driver.js` (real handlers in a DOM shim)
3. Design-defect lint as a report

Shared driver library: `_tools/jo-port-driver.js` exports `sharedPackage()`, `TAIL`, `NODE_GLOBALS()`, `code()`, `meta(Wnn)`.

## W15 and W16 Exceptions

W15 (Bank Balances) and W16 (Accounts Payable) are Jo's blocks kept with their original shell hooks. They are NOT converted to `WIDGETS.register` content functions — content is registered but the original click/pop/trigger structure is retained from Jo's code. W15 has no `WIDGETS.register` conversion at all for its shell hooks.
