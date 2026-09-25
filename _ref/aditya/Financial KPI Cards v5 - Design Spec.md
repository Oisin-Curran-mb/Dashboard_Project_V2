# Financial KPI Cards v5 — Design Specification

> **Widget ID:** `w-kpi5`
> **Prototype file:** [`Aditya_Widget_Design/Dashboard Container Demo.html`](./Dashboard%20Container%20Demo.html) — widget `#w-kpi5`
> **Author:** Aditya
> **Last updated:** 2026-09-15
> **Status:** 🟡 Prototype — under review

---

## 1. Overview

**Financial KPI Cards v5** is the fifth iteration of the Financial KPI Cards widget on the Amplify/Shelby church accounting dashboard. It is a fixed 4-tile glance-level card that displays the most critical financial health metrics for the organisation at a glance.

This version is a direct copy of **KPI v4** with one key change: the Cash Position tile's unreconciled account warning system is simplified from a **5-tier count-based model** to a **2-colour threshold model** (amber / red) based on the number of unreconciled accounts. All other tiles are identical to v3 and v4.

### What's new in v5 vs v4

| Feature | KPI v4 | KPI v5 |
|---|---|---|
| Warning colour logic | 5 tiers (Tier 1–5) by account count | 2 colours: **Amber** (<3 accounts) · **Red** (>5 accounts) |
| Tooltip interactivity | Non-clickable (CSS `:hover` only) | **Clickable** — tooltip stays open when mouse moves into it |
| Account card style | Plain info card | **Clickable row** with right chevron `›` indicating navigation |
| Demo states | 5 states (Tier 1–5) | 4 states (Clean, Amber 1, Amber 2, Red 6) |

---

## 2. Widget Layout

The widget is a single-row grid of **4 KPI tiles** (`kpi-cards-row`, 4-column grid):

| Tile | ID | Content |
|---|---|---|
| 1 | _(static)_ | Total Income — YTD |
| 2 | _(static)_ | Total Expenses — YTD |
| 3 | _(static)_ | Net Income — YTD |
| 4 | `kpi5-cash-card` | Cash Position (dynamic — reconciliation warning) |

Tiles 1–3 are static display tiles with no interactive warning states. All dynamic logic is applied to **Tile 4 — Cash Position** only.

---

## 3. Static Tiles (1–3)

Each static tile follows the standard KPI card pattern:

```
[LABEL — e.g. TOTAL INCOME — YTD]
[$1,824,350]
Prev yr $1,682,400  ·  ↑ 8.4%
```

- **Label:** `font-size:10px`, uppercase, `color:#999`
- **Value:** `font-size:21px`, `font-weight:700`, `color:#202020`
- **Meta row:** prior-year comparison + variance badge (`fav` = green, `unfav` = red)

Mock data (prototype):

| Tile | Value | Prev yr | Change |
|---|---|---|---|
| Total Income — YTD | $1,824,350 | $1,682,400 | ↑ 8.4% (fav) |
| Total Expenses — YTD | $1,681,550 | $1,598,200 | ↑ 5.2% (unfav) |
| Net Income — YTD | $142,800 | $84,200 | ↑ 69.6% (fav) |

---

## 4. Cash Position Tile (Tile 4)

### 4a. What the numbers mean

| Element | Value (mock) | Calculation |
|---|---|---|
| **Primary metric** | 9 months | Total cash ÷ avg monthly operating expenses |
| **Total cash** | $3,224,350 | Sum of all bank account balances |
| **Avg monthly OpEx** | $358,000 | Trailing 3-month average (May–Jul 2026) |
| **Runway** | ≈ 9.01 → displayed as **9 months** | $3,224,350 ÷ $358,000 |

The `ⓘ` tooltip next to "of operating runway" shows:
> *"Avg monthly operating expenses calculated using May – Jul 2026 (3 months)."*

### 4b. Why unreconciled accounts matter

Bank accounts that have not been reconciled within the configured threshold (default: 30 days) may contain undetected errors or unauthorised transactions. When unreconciled accounts exist, the total cash figure used in the runway calculation may not reflect the organisation's true financial position.

The warning system exists to **communicate the reliability of the runway figure** — not to block access to it.

---

## 5. Unreconciled Account Warning — 2-Colour Logic (v5)

### 5a. Threshold rules

| Condition | Colour | Icon | Action |
|---|---|---|---|
| 0 unreconciled accounts | **Clean** (no warning) | — | No warning icon; runway shown normally |
| **1–2 accounts** (< 3) | **Amber** ⚠ | `warning` (filled, amber) | Tooltip with clickable account card(s) |
| **6+ accounts** (> 5) | **Red** 🔴 | `error` (filled, red) | Tooltip with CTA button only |

> **Note on the 3–5 account gap:** The design specification currently defines thresholds as "< 3" for amber and "> 5" for red. Accounts 3–5 are not explicitly addressed in v5. For prototype purposes they are treated as amber (shown alongside the 1–2 account states). This gap should be confirmed with the product team before production.

### 5b. Clean state (0 accounts)

- Warning wrap (`#kpi5-warn-wrap`) is **empty** — no icon rendered
- Runway value shows normally: **9 months**
- Meta row visible: "of operating runway" + ⓘ tooltip
- Demo chip: green, `check_circle` icon, label "No warning"

### 5c. Amber state (1–2 accounts)

- Warning icon: amber `⚠` (`warning`, filled, `color:#e67e22`) at `top:12px; right:12px` of the tile
- Tooltip appears on hover (or mouse-over via JS — see Section 7):
  - **Header:** "⚠ N Unreconciled Account(s)" (amber, uppercase, small caps)
  - **Body:** "The cash figure may not reflect the true position."
  - **Account card(s):** one card per unreconciled account, each rendered as a **clickable row** with:
    - Account name (bold, `#202020`)
    - Last-reconciled date + days-ago (amber or red text depending on severity)
    - Right chevron icon (`chevron_right`, `color:#b7620a`) on the far right — indicates the card navigates to the bank account detail
- Runway value: **still shown** (9 months) — amber does not suppress the figure
- Meta row: visible

**Mock data — Amber 1 account:**
```
Payroll Checking ··3355
Last reconciled: Jul 26, 2026 — 31 days ago  ›
```

**Mock data — Amber 2 accounts:**
```
Payroll Checking ··3355
Last reconciled: Jul 26, 2026 — 31 days ago  ›

Missions Savings ··1188
Last reconciled: Jun 25, 2026 — 62 days ago  ›   ← shown in red (#c0392b) due to age
```

- Demo chip: amber, `warning` icon, label "⚠ 1 acct" or "⚠ 2 accts"

### 5d. Red state (> 5 accounts)

- Warning icon: red 🔴 (`error`, filled, `color:#c0392b`) at `top:12px; right:12px`
- Tooltip:
  - **Header:** "🔴 6 Unreconciled Accounts" (red)
  - **Body:** "A significant number of accounts exceed the 30-day reconciliation threshold. The cash position shown may be inaccurate."
  - **CTA button:** "Review in Bank Account Mgmt →" (`kpi-warn-tip-cta`, blue pill button)
  - No individual account cards shown (too many to list)
- Runway value: **still shown** (9 months) — red at this tier does not suppress the figure (contrast with v3 red state which suppressed the value)
- Demo chip: red, `error` icon, label "● 6 accts"

> **v5 vs v3 difference:** In KPI v3, the red state (>15% of cash unreconciled) suppressed the runway value and showed "—". In KPI v5, the red state (>5 accounts) still shows the runway value but shows a CTA button in the tooltip. This is a deliberate design choice — the 2-colour model does not degrade the displayed figure.

---

## 6. Demo Cycle (Prototype Only)

The demo chip in the widget header cycles through 4 states in order. This button is a **prototype-only control** — it does not exist in production.

| Cycle position | Chip label | Icon | State | Accounts |
|---|---|---|---|---|
| 0 (start) | ⚠ 1 acct | `warning` (amber) | Amber | 1 |
| 1 | ⚠ 2 accts | `warning` (amber) | Amber | 2 |
| 2 | ● 6 accts | `error` (red) | Red | 6 |
| 3 | No warning | `check_circle` (green) | Clean | 0 |

The widget **loads at state 0 (Amber 1 acct)** so the clickable account card with the right chevron is immediately visible to reviewers without needing to click the demo button.

### Chip colour coding

| State | Border | Background | Text / Icon colour |
|---|---|---|---|
| Clean | `#b7dfc4` | `#f0faf1` | `#1a7f3c` |
| Amber | `#eed5b0` | `#fff8e1` | `#b7620a` / `#e67e22` |
| Red | `#f5a9a0` | `#feeceb` | `#c0392b` |

---

## 7. Interactive Tooltip — Hover Persistence Fix

### Problem (prior to v5)

All previous KPI widget versions (v1–v4) used a CSS `:hover` rule to show the tooltip:
```css
.kpi-warn-wrap:hover .kpi-warn-tip { display: block; }
```

This caused the tooltip to **disappear the moment the mouse moved from the warning icon toward the tooltip**, because the mouse briefly left the `.kpi-warn-wrap` element's bounding box. Account cards and CTA buttons inside the tooltip were therefore impossible to click.

### Solution (implemented in v5, applied globally)

**CSS change:**
```css
/* Before */
.kpi-warn-tip { pointer-events: none; }
.kpi-warn-wrap:hover .kpi-warn-tip { display: block; }

/* After */
.kpi-warn-tip { pointer-events: auto; }
/* CSS :hover rule removed — replaced by JS */
```

**JS — global IIFE tooltip manager** (applies to all `.kpi-warn-wrap` elements on the page, including v1–v4):

```javascript
(function(){
  var _tt = {};
  document.addEventListener('mouseover', function(e) {
    var wrap = e.target.closest('.kpi-warn-wrap');
    if (!wrap) return;
    clearTimeout(_tt[wrap.id]);
    var tip = wrap.querySelector('.kpi-warn-tip');
    if (tip) tip.style.display = 'block';
  });
  document.addEventListener('mouseout', function(e) {
    var wrap = e.target.closest('.kpi-warn-wrap');
    if (!wrap) return;
    if (wrap.contains(e.relatedTarget)) return; // still inside wrap — ignore
    var id = wrap.id || '_';
    _tt[id] = setTimeout(function() {
      var tip = wrap.querySelector('.kpi-warn-tip');
      if (tip) tip.style.display = 'none';
    }, 200); // 200 ms delay so mouse can travel from icon → tooltip
  });
})();
```

**How it works:**
1. `mouseover` on any element inside `.kpi-warn-wrap` → show the tooltip, cancel any pending hide timer
2. `mouseout` from `.kpi-warn-wrap` → check if the mouse is moving to a **child element** (`wrap.contains(e.relatedTarget)`) — if yes, ignore (mouse is still inside the tooltip)
3. If the mouse truly leaves the wrap, start a **200 ms timer** to hide the tooltip
4. If the mouse re-enters within 200 ms, the timer is cancelled and the tooltip stays open

This pattern allows the user to:
- Move the mouse from the warning icon into the tooltip without it closing
- Hover over and **click** individual account cards inside the tooltip
- Click the **CTA button** ("Review in Bank Account Mgmt") in the red state

---

## 8. Clickable Account Cards

Account cards inside the amber tooltip are rendered as **interactive rows** using the `.kpi-warn-tip-acct.clickable` CSS class.

### CSS

```css
.kpi-warn-tip-acct.clickable {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.kpi-warn-tip-acct.clickable:hover {
  background: #fff3e0;
  border-color: #f0c07a;
}
```

### HTML structure of a single clickable account card

```html
<div class="kpi-warn-tip-acct clickable" onclick="void(0)" role="button" tabindex="0">
  <div style="flex:1; min-width:0">
    <div class="kpi-warn-tip-acct-name">Payroll Checking ··3355</div>
    <div class="kpi-warn-tip-acct-date">Last reconciled: Jul 26, 2026 — 31 days ago</div>
  </div>
  <span class="msr" style="font-size:16px; color:#b7620a; flex-shrink:0">chevron_right</span>
</div>
```

**Key elements:**
- `flex:1; min-width:0` — account name + date block takes all available space, truncates cleanly if long
- `chevron_right` icon — right-aligned, `flex-shrink:0` so it never wraps or disappears
- `onclick="void(0)"` — prototype placeholder; in production this navigates to the Bank Account Management page filtered to the specific account
- `role="button"` + `tabindex="0"` — accessible for keyboard navigation
- Hover: background turns `#fff3e0` (warm amber tint) to signal interactivity

### When chevron is shown
- **1 account (amber):** 1 clickable card with chevron
- **2 accounts (amber):** 2 clickable cards, each with chevron; second card has `margin-top:4px` spacing
- **6 accounts (red):** No individual cards — CTA button only (too many to enumerate)

---

## 9. JavaScript Functions

### `cycleReconState5()`

Called by the demo chip button (`onclick`). Advances `_recon5StateIdx` through the 4-state array and updates:
1. The demo chip label, icon, and colour
2. Calls `applyReconState5(state, accts)` to update the Cash Position tile

### `applyReconState5(state, accts)`

Writes directly to the Cash Position tile DOM:

| Target ID | What it changes |
|---|---|
| `kpi5-warn-wrap` | Warning icon + tooltip HTML |
| `kpi5-val` | Runway value (always "9 months" in v5) |
| `kpi5-meta` | Meta row visibility |
| `kpi5-degrade` | Degraded/alert block (unused in v5) |

The function contains an inner helper `acctCard(name, date, isFirst, dateRed)` that builds a single clickable account card HTML string:

```javascript
function acctCard(name, date, isFirst, dateRed) {
  var mt  = isFirst ? '' : 'margin-top:4px;';
  var dc  = dateRed ? 'color:#c0392b;' : '';
  return '<div class="kpi-warn-tip-acct clickable" ...>' +
    '<div style="flex:1;min-width:0">' +
      '<div class="kpi-warn-tip-acct-name">' + name + '</div>' +
      '<div class="kpi-warn-tip-acct-date" style="' + dc + '">' + date + '</div>' +
    '</div>' +
    '<span class="msr" style="font-size:16px;color:#b7620a;flex-shrink:0">chevron_right</span>' +
  '</div>';
}
```

`dateRed: true` renders the date text in `#c0392b` (red) for accounts that are significantly overdue (e.g. 62 days).

---

## 10. Comparison: KPI v3 / v4 / v5

| Dimension | KPI v3 | KPI v4 | KPI v5 |
|---|---|---|---|
| **Warning model** | 3-state by % of cash | 5-tier by account count | 2-colour by account count |
| **Amber trigger** | >5% of cash unreconciled | Tier 1 (1 acct) or Tier 2 (≤5 accts) | < 3 accounts |
| **Red trigger** | >15% of cash unreconciled | Tier 3–5 (≥47 accts) | > 5 accounts |
| **Runway suppressed (→ "—")** | Yes — red state shows "—" | Yes — Tier 5 shows "—" | **No** — always shown |
| **Inline degrade block** | Red state only | Tier 4 + Tier 5 | **None** |
| **Tooltip clickable** | No | No | **Yes** |
| **Account card chevron** | No | No | **Yes** |
| **Tooltip hover-persistent** | No | No | **Yes (global fix)** |

---

## 11. Production Implementation Notes

The following items are **not implemented** in the prototype and must be addressed in production:

| Item | Notes |
|---|---|
| **Navigation on account card click** | `onclick="void(0)"` in prototype. In production: navigate to Bank Account Management filtered to the specific account (e.g. by account ID). |
| **CTA button action** | `onclick="void(0)"` in prototype. In production: navigate to Bank Account Management — unreconciled accounts list. |
| **Threshold configuration** | The 30-day reconciliation threshold is hardcoded in prototype. In production this should be configurable per organisation (admin setting). |
| **Account data source** | Prototype uses hardcoded mock accounts. In production: API endpoint returning unreconciled accounts with last-reconciled date, days-since, and balance. |
| **3–5 account range** | Not explicitly handled in the current v5 spec. Product team must confirm whether this maps to amber or a separate state. |
| **Runway calculation period** | "May–Jul 2026 (3 months)" is hardcoded. In production: trailing N months of confirmed operating expense history, where N is configurable (default 3). |

---

## 12. Files

| File | Role |
|---|---|
| [`Aditya_Widget_Design/Dashboard Container Demo.html`](./Dashboard%20Container%20Demo.html) | Prototype — contains `#w-kpi5` HTML, CSS classes, JS functions |
| This document | Design specification and logic reference |

**Key IDs and class names in the prototype:**

| ID / Class | Purpose |
|---|---|
| `#w-kpi5` | Widget card root |
| `#kpi5-cash-card` | Cash Position tile |
| `#kpi5-warn-wrap` | Warning icon + tooltip container |
| `#kpi5-val` | Runway value element |
| `#kpi5-meta` | Meta row ("of operating runway" + ⓘ) |
| `#kpi5-degrade` | Inline degrade block (unused in v5) |
| `#recon5-demo-btn` | Demo chip button |
| `#recon5-demo-ic` | Demo chip icon |
| `#recon5-demo-lbl` | Demo chip label |
| `.kpi-warn-tip-acct.clickable` | Clickable account card row |
| `cycleReconState5()` | Demo cycle function |
| `applyReconState5(state, accts)` | State application function |