# Alerts & Actions: every action, its heading, and three design options (draft)

Written 12 October 2026 for the owner's design review of the Alerts & Actions widget. The owner ruled on 12 October that the **Copy** version (Aditya's second build, with the Pending actions / Alerts tabs and the Detail split pane) is the base; the original Critical / Warning build is reference only. Part 1 describes what is live and what each alert group is for; Part 2 proposes the names each group should carry, modelled on how the finished widgets present the same things; Part 3 holds the three design options and their mocks. Nothing here is a decision until the owner says so.

---

## Part 1. What is live today

### 1.1 The widget in one paragraph

Explore and Detail only (no Glance). Two tabs under the card header, **Pending actions (5)** and **Alerts (15)**; the counts are items, not groups. Under the tabs, one collapsible group per alert category with a coloured left edge (red under Pending actions, amber under Alerts), the group title, a count badge and a one-line summary. Opening a group lists its items, one line of dotted text each, with one button per item at Explore. At Detail the card splits 40 / 60: the groups on the left, and the selected item's detail on the right (facts table, a note on where the action goes, and the action button), so no pop-up is needed. Items in the Purchase Order Queue show a facts grid, line items and an approval trail with Reject and Approve. Action buttons are placeholders: they open a demo copy of the destination screen or report, or write "Approved: " / "Rejected: " to the status line.

### 1.2 The seven groups as they stand

| Group | Tab | Items | Button at Explore | Detail pane | Where the demo takes you |
|---|---|---|---|---|---|
| Overdue Payables | Pending actions | 3 (AVID Pay, ACH, EFT; one invoice each) | Process Payment (filled) | facts, "Opens AP Payment Processing" | demo copy of Accounts Payable > Payment Processing |
| Purchase Order Queue | Pending actions | 2 (INV-2024-4433, PO-2024-0891) | View Details (outlined) | facts grid, line items, approval trail, Reject / Approve | nothing beyond the pane (Approve writes to the status line) |
| Restricted Fund Compliance Breach | Alerts | 1 (Missions Fund) | Review Budget (outlined) | facts, "Opens the Budgeted Financial Statement" | demo copy of the Budgeted Financial Statement |
| Unreconciled Bank Account | Alerts | 1 (Payroll Checking ··3355) | View Details (outlined) | facts, "Opens the Bank Reconciliation report" | demo copy of the Bank Reconciliation report |
| Budget Exceeded | Alerts | 1 (Worship Arts) | Review Budget (outlined) | facts, "Opens the Budgeted Financial Statement" | demo copy of the Budgeted Financial Statement |
| Receivable Invoices Outstanding | Alerts | 7 (customers, 14 to 45 days) | View Invoice (filled) | facts, "Opens AR > Unposted Invoices" | demo copy of Accounts Receivable > Unposted Invoices |
| Unposted Journals | Alerts | 5 (JE-2024-1041 to 1084) | View Journal (filled) | facts, "Opens AR > Unposted Invoices" | the same Accounts Receivable screen (wrong module, see 1.4) |

Totals: Pending actions 5 items, $49,050 (3 payables $24,350 plus 2 purchase requests $24,700). Alerts 15 items.

### 1.3 Aditya's three commits of 12 October (now in local main)

- The second tab was renamed from Updates to **Alerts**.
- On a tab switch only the first group in that tab opens; the rest start collapsed (both sizes).
- The group count badge lost its severity icon; it is the number only.
- The Financial KPI handover section gained data-source, tooltip and edge-case text (not this widget).

### 1.4 The filter finding

The owner reported that the Copy's top filter "does not filter". Checked on the live page: the tabs do swap the list. The problem is what the split means. Each group carries a fixed flag that puts it in one tab or the other; nothing about the items decides it. The result reads inconsistently:

- Restricted Fund Compliance Breach says "immediate action required" in its own summary, yet it sits under Alerts.
- The Purchase Order Queue sits under Pending actions, yet its list button is View Details; the Approve the tab promises is two clicks away.
- Under Alerts, Review Budget and View Invoice are drawn as action buttons, so the two tabs look the same.
- Overdue Payables is grouped by payment method (AVID Pay, ACH, EFT), so a user cannot see the vendor or invoice from the list, while every other group lists records.
- Unposted Journals and Receivable Invoices Outstanding both open the Accounts Receivable Unposted Invoices screen; neither destination is right (outstanding invoices are posted, and journals live in General Ledger). The Restricted Fund item says Review Fund but opens the budget report; the Designated Fund Summary report that exists in the demo is never reached.

**Proposed rule.** An item is a **Pending action** when the signed-in user can complete it from the dashboard or in one step on the destination page: approve or reject a purchase request, process an overdue payment, post a journal. Everything else is an **Alert**: a threshold has been crossed and the user should look (a fund over its income, a department over budget, an account past its reconciliation window, a receivable ageing). Under this rule the tab is a true filter on the item, the button under Pending actions is always the completing verb, and the button under Alerts is always "Open ..." in the module that holds the record.

Applying the rule to the seven groups: Pending actions = Overdue Payables, Purchase Order Queue, Unposted Journals (if the owner agrees posting counts as completing). Alerts = Restricted Fund Compliance Breach, Budget Exceeded, Unreconciled Bank Account, Receivable Invoices Outstanding. Counts become 10 actions ($91,850) and 10 alerts.

---

## Part 2. Each group: focus, action, destination, names

The template for the names is the finished widgets. Their habits, in short: a card header band with a big count, a pill beside it and one quiet context line (Purchasing Management, My Status); sub-headings inside the card as small bold labels on a tinted panel (Main Content Tasks) or as a tiny uppercase column heading (Accounts Payable By Due Date); rows with a bold primary label and a quiet second line (Main Content Tasks) or a status chip inside the row (Accounts Payable By Due Date, Purchasing Management); status chips on the semantic tones attention, brand, neutral, positive, negative and severe; "Open in <module>" or "Open <record>" as the outlined button that leaves the dashboard, and a confirm dialog with Cancel and a green Approve before anything is committed (Payroll Scheduled Time Off, Purchasing Management); and an About sentence that states the purpose, what each view shows and where to go next.

Each group below uses the same headings so the owner can compare them line by line. "Proposed" wording is written exactly as the user would read it.

### 2.1 Overdue Payables

- **Belongs to:** Accounts Payable By Due Date (the widget's Overdue bucket) and Accounts Payable > Manage > Payment Processing.
- **Main focus:** which AP invoices are past their due date, for how much, and how late.
- **What the action must do:** take the user to Payment Processing with the overdue invoice selected so it can be paid; on return the item leaves the list and the counts refresh. Completes on the destination page in one step, so it is a **Pending action**.
- **Where it goes today:** the demo copy of the Payment Processing grid (no filter). Legacy page: Accounts Payable, Payment Processing, "List of Unpaid Invoices".
- **Proposed names.** Group heading: **Overdue Payables**. Summary: "3 invoices past due, $24,350". Item line: vendor first, as the Accounts Payable widget lists them, then the reference, amount and age: **Acme Audio LLC**, "INV-2024-4421 · AVID Pay · $12,400", chip **Overdue 22d** (negative tone). Primary button: **Process payment**. Secondary: **Open in Accounts Payable**. Detail pane severity line: "Needs your action: payment overdue".
- **Facts the pane shows:** payment type, invoices overdue, total amount, oldest invoice, vendor, due date (all exist in the demo data).
- **Note:** the demo groups by payment method (AVID Pay, ACH, EFT). The proposal lists invoices and keeps the method as meta, so the list reads like the rest of the widget. Owner to confirm.

### 2.2 Purchase Order Queue

- **Belongs to:** Purchasing Management (its "Your turn" filter) and Purchasing Management > Requests > Update.
- **Main focus:** purchase requests waiting on an approver beyond the five-business-day threshold.
- **What the action must do:** Approve or Reject the request as the signed-in approver, with the same permission checks and cascade as the Purchasing record page, after a confirm; or open the request. On success the item leaves the list. Completes on the dashboard, so it is a **Pending action**.
- **Where it goes today:** nowhere; Approve and Reject write to the status line. Legacy page: Purchasing Management, Requests, Update.
- **Proposed names.** Group heading: **Purchase Approvals** (the demo's "Purchase Order Queue" names the queue, not what the user does; owner to choose). Summary: "2 requests waiting on you, oldest 8 business days". Item line: vendor, then reference and amount, then the wait: **Riverside AV Solutions**, "INV-2024-4433 · $18,500 · requested by David Chen", chip **Your turn** (brand tone, the Purchasing widget's own word) and **Waiting 8 business days** (attention tone). Primary button: **Approve** (green, after the Jo-style confirm). Secondary: **Open request**. Reject lives in the detail pane beside Approve, as on the Purchasing record pop-up. Detail pane severity line: "Needs your action: approval waiting".
- **Facts the pane shows:** invoice or PO number and date, vendor, requested by, fund, total; line items with a total row; approval trail (submitted, finance pre-check, department head waiting).

### 2.3 Restricted Fund Compliance Breach

- **Belongs to:** Budget Compared to Actual for the figures, and the Designated Fund Summary report for the record.
- **Main focus:** a restricted fund has spent more than it has received.
- **What the action must do:** open the Designated Fund Summary for the fund and period so the user can review and, if policy requires, notify the board. Nothing is completed from the dashboard, so it is an **Alert**.
- **Where it goes today:** the Budgeted Financial Statement demo, although the item is labelled Review Fund and a Designated Fund Summary demo exists. Legacy report: Designated Fund Summary.
- **Proposed names.** Group heading: **Restricted Fund Over Income** (plain words for "compliance breach"; owner to choose). Summary: "1 fund has spent $35,200 more than it received". Item line: **Missions Fund**, "spent $133,400 of $98,200 received", chip **136% of income** (severe tone). Button: **Open fund summary** (outlined). Detail pane severity line: "Alert: restricted fund over income".
- **Facts the pane shows:** fund, year-to-date expenditure, income received, breach amount and percentage, first detected.

### 2.4 Unreconciled Bank Account

- **Belongs to:** Bank Balances and Bank Accounts > Reconciliation.
- **Main focus:** an account whose last reconciliation is older than the 30-day threshold.
- **What the action must do:** open Bank Reconciliation for that account. Reconciling is a session of work, not a click, so it is an **Alert** with a clear hand-off.
- **Where it goes today:** a facts pop-up (Explore) or the pane (Detail), then the Bank Reconciliation report demo. Legacy page: Bank Accounts, Reconciliation.
- **Proposed names.** Group heading: **Unreconciled Bank Accounts**. Summary: "1 account past the 30-day threshold". Item line: **Payroll Checking ··3355**, "last reconciled Jul 26, 2026", chip **31 days** (attention tone). Button: **Start reconciliation** (outlined) or **Open in Bank Accounts**; owner to choose one. Detail pane severity line: "Alert: reconciliation overdue".
- **Facts the pane shows:** account, last reconciled, days unreconciled, threshold.

### 2.5 Budget Exceeded

- **Belongs to:** Budget Compared to Actual and the Budgeted Financial Statement report.
- **Main focus:** a department whose actual spend has passed its annual budget.
- **What the action must do:** open the Budgeted Financial Statement filtered to the department, or the Budget Compared to Actual widget's drill for it. Review only, so it is an **Alert**.
- **Where it goes today:** the Budgeted Financial Statement demo (not filtered). Legacy report: Budgeted Financial Statement.
- **Proposed names.** Group heading: **Budget Exceeded**. Summary: "1 department over its annual budget by $7,300". Item line: **Worship Arts**, "$67,800 spent of $60,500 budget", chip **112% of budget** (attention tone). Button: **Open budget report** (outlined). Detail pane severity line: "Alert: over budget".
- **Facts the pane shows:** department, actual year to date, annual budget, overage and percentage, period.

### 2.6 Receivable Invoices Outstanding

- **Belongs to:** Receivable Invoices Outstanding (the widget) and Accounts Receivable > invoice.
- **Main focus:** unpaid AR invoices, how much and how old, so staff can chase the oldest.
- **What the action must do:** open the invoice in Accounts Receivable (or the customer) so a reminder can be sent or a payment recorded. The dashboard does not collect money, so it is an **Alert**.
- **Where it goes today:** the Unposted Invoices demo screen, which is the wrong list (these invoices are posted and outstanding). Legacy page: Accounts Receivable, the invoice record.
- **Proposed names.** Group heading: **Receivable Invoices Outstanding** (same as the widget, deliberately). Summary: "7 invoices unpaid, $18,450, oldest 45 days". Item line: **Riverside Community Group**, "INV-AR-2024-0112 · $3,800", chip **45 days** (attention tone over 30 days, neutral under; the Receivable widget's ageing bands can supply the words). Button: **Open invoice** (outlined, the Receivable widget's own button). Detail pane severity line: "Alert: receivable outstanding".
- **Facts the pane shows:** customer, invoice, amount, days outstanding, due date.
- **Note:** seven items is the longest list in the widget; any option needs the group to scroll or show the oldest few with "N more".

### 2.7 Unposted Journals

- **Belongs to:** General Ledger journals. No dashboard widget covers it.
- **Main focus:** journal entries prepared but not posted, so the ledger is behind.
- **What the action must do:** open the journal in General Ledger so the user can post or void it. If the owner counts posting as completing in one step it is a **Pending action**; otherwise an Alert.
- **Where it goes today:** the Accounts Receivable Unposted Invoices demo screen (wrong module). Legacy page: General Ledger, journal entry.
- **Proposed names.** Group heading: **Unposted Journals**. Summary: "5 journals awaiting posting, $42,800, oldest 12 days". Item line: **Payroll allocation**, "JE-2024-1041 · $18,400 · prepared by Finance Team", chip **12 days** (attention tone). Primary button: **Open journal** (outlined; posting happens in the ledger). Detail pane severity line: "Needs your action: journal unposted" or "Alert: journal unposted", per the owner's ruling.
- **Facts the pane shows:** journal number, type, amount, days pending, prepared by.
- **Open:** whether this group belongs in the first release at all, since no widget or demo screen stands behind it.

### 2.8 Shared vocabulary and the About text

- **Widget title:** Alerts & Actions (defined name; unchanged).
- **The two halves:** **Needs your action** and **Alerts** (tabs in Option B, sections in Option A, tiles in Option C). "Pending actions" reads as a status; "Needs your action" says whose turn it is, in the Purchasing widget's voice.
- **Header figures:** the count of items needing the user's action as the big number, a pill with the dollars at stake ("$91,850 to pay, approve or post" under the proposed rule), and one context line ("10 alerts to review across 4 groups"). This is the Purchasing Management header shape.
- **Group header:** title, count badge, one-line summary written as what to do or what happened, in this order: count, record word, total, oldest.
- **Item line:** bold primary label (who or what), one quiet meta line (reference · amount · extra), a status chip with the age or percentage, then the button.
- **Buttons:** the completing verb as the filled primary (Process payment, Approve), the leaving button as outlined "Open <record>" or "Open in <module>"; sentence case after the first word, module names capitalised.
- **Tones:** negative for Needs your action, attention for Alerts, severe for the fund breach, brand for "Your turn" and for the selected row.
- **About text (proposed):** "Items across the accounting modules that need you. Needs your action lists payments to process, purchase requests to approve and journals to post; Alerts lists funds, budgets, bank accounts and receivables that have crossed a threshold. Open a group to see each item, act on it here where you can, or open it in its module."

---

## Part 3. Three design options

Mocks: `docs/design/Alerts & Actions/option-A.html`, `option-B.html`, `option-C.html` (open them through the local server, `node _tools/serve.js` then `http://localhost:8765/docs/design/Alerts%20%26%20Actions/option-A.html`, because the fonts and tokens load over CDN). Each shows Explore (566 px) and Detail (1148 px) side by side with the same seven groups and 20 items, on the live widget's tokens and CSS (`_live.css` is lifted from the build, `mock.css` holds only what an option adds), and each is interactive: expand, switch, select, act; Approve, Reject and Process payment ask first in the Jo-style confirm. Screenshots at 2x are in `docs/design/Alerts & Actions/shots/` (A-01 to A-04, B-01 to B-04, C-01 to C-06).

All three mocks apply the rule from 1.4 with Unposted Journals counted as an action, so they compare like for like: Needs your action 10 items, $91,850; Alerts 10 items in 4 groups. If the owner rules Journals an Alert, every count moves by five and nothing else changes.

### Option A: hierarchy and sub-headings (smallest change)

- **Purpose:** make the current widget readable without changing how it works.
- **What changes:** the two tabs become two labelled sections in one scrolling list, Needs your action above Alerts, each a tinted panel with a small bold heading and its count (the Main Content Tasks panel). A header band in the Purchasing shape sits above them: big count of items needing action, a dollars pill, one context line. Group titles go to 13 px bold, the summary is rewritten as a plain instruction ("Pay 3 overdue invoices, $24,350"), and each item splits into a bold label plus a quiet meta line with a status chip, instead of one dotted string. Every button label is a verb plus destination.
- **What stays:** the accordion, one group open at a time, the item buttons, the detail pane at Detail, the pop-ups at Explore, all demo screens.
- **Cost:** low; the render functions change, the data and handlers do not.
- **Risk:** the two sections plus the header take vertical room at Explore; the Alerts section may start below the fold. The mock shows how far down it lands.

### Option B: the open group tells you the next step

- **Purpose:** keep the compact tabs and accordion, but make the opened group do the explaining.
- **What changes:** tabs renamed Needs your action / Alerts (the rule from 1.4 decides membership). The collapsed group header stays as it is. The open group shows each item as a mini record: a fact strip (amount, age, who or which account, next approver) in the Purchasing facts-grid style, a one-line **Next step** sentence in brand colour ("Approve or reject; waiting on you 8 business days"), and two buttons: outlined **Open in <module>** and, where the user can complete it, the filled action. Alert items get the single outlined button. At Detail the right pane repeats the Next step sentence and the same two buttons at the top, so list and pane agree. Item pop-ups at Explore reduce to the confirm dialog and the destination screens.
- **What stays:** tab bar, accordion, group headers, detail split pane, demo screens.
- **Cost:** medium; a per-item "next step" sentence and fact strip per group, and the pane header.
- **Risk:** the open group is tall (the seven receivables), so the panel must scroll; the mock shows it.

### Option C: complete redesign, a prioritised queue

- **Purpose:** show every item as one list a user can scan and sort, with the modules and urgency visible at a glance.
- **What changes:** no accordion. A header band with three tappable tiles in the Purchasing Glance shape, **Needs your action**, **Overdue amounts**, **Alerts to review**, which filter the table below (tap again to clear). One sortable table of all 20 items (the shell's row and sort-header classes, default order actions first then oldest): Item (bold label plus meta line), Module badge (AP, PO, AR, GL, Bank, Budget, in the Main Content Tasks badge style), Status chip on semantic tones (Overdue 22d, Waiting 8 business days, 112% of budget), Amount, and a trailing action (filled verb or outlined Open). Row tap opens the detail: pop-up at Explore, right pane at Detail. The three tiles alone would make a Glance size, shown in the mock as a question.
- **What stays:** the seven groups' data and facts, the detail content, the demo screens, the confirm dialog.
- **Cost:** high; new render for list, tiles and sort, new driver assertions; the groups become a Module column rather than headers.
- **Risk:** losing the group summary sentences ("3 AP invoices past due") which some users may rely on; the mock keeps them as the tile hover text.

---

## Part 4. Open questions for the owner

1. The rule in 1.4: agree that Needs your action = approve, pay, post, and Alerts = review? Does Unposted Journals count as an action?
2. Keep the Detail split pane (list left, detail right) in whichever option is chosen?
3. Should an approved, paid or posted item leave the list at once, and when do the header counts refresh?
4. Purchase Order Queue: show Approve (and Reject) in the list, or only in the pane?
5. Overdue Payables: list by invoice (vendor first) as proposed, or keep the three payment-method lines?
6. Group names: "Purchase Approvals" and "Restricted Fund Over Income" as proposed, or keep Aditya's titles?
7. Button labels: sentence case after the first word ("Process payment", "Open in Accounts Payable"), as the finished widgets do?
8. Is a Glance size wanted (Option C's three tiles)? Both current builds are Explore and Detail only.
9. Unposted Journals: keep it in the first release with no module behind it, or hold it?
10. When the Copy is finalised, delete the original Critical / Warning block (kind `alerts`) from the build?

---

## Sources (for the next session; not for Value Labs)

| What | Where in `index.html` (after `da5f957`) |
|---|---|
| Copy block (kind `alerts2`): data `ALO2_CATS`, pop-up configs `ALO2_ITEM_MODALS`, renderers `alo2CatHTML` / `alo2DetailPane` / `alo2Content`, handler `alo2Handle` | 12046 to 12388 (banners `W19-Copy Alerts & Actions V2 (alerts2)`) |
| Original block (kind `alerts`) and the shared demo screens it owns (`aloOpenPaymentScreen`, `aloOpenReconModal`, `aloOpenARScreen`, `aloOpenBudgetModal`, `aloOpenReportModal`, `aloMergedModal`) | 10950 to 12045 |
| Widget CSS (both kinds) | 2171 to 2553; Copy overrides from 2477 |
| Header band template `.dep-hd`, `.dep-hd-kpigrp`, `.metric-value`; Purchasing `purFHeaderBlock`, `.purf-ctx` | CSS 219 to 246, 1647; JS 9241 |
| Sub-heading templates: Tasks `.mct-sec`, `.mct-sec-h`; column heading `.dep-col-h` | 619 to 624, 514 |
| Row templates: `.wt-row`, `.wt-head`, `.wt-sort`, `.lr-main`; Tasks `.mct-row-*`, `.mct-badge[data-app]`; Payables `apRowHTML` | 200 to 203, 350 to 352, 627 to 648, 13093 |
| Status chips `.purf-stchip-*` and Glance tiles `.purf-gtile-*` on semantic tones | 1678 to 1702 |
| Buttons `.btn primary / outlined / naked / sm`, `.iconbtn` | 36 to 47 |
| About popover: `about` entries in `WIDGETS.register`, shell `popContent` | 12387; 13274 |
| Handover section for this widget | `handover.html` 1189 to 1255 |
| Aditya's Variation B5 note (grouped by Action Required vs Informational), the idea the Copy grew from | `..\Aditya KPI branch\Dashboard_Project\Aditya_Widget_Design\Demo V2.html` 21644 to 21650 |
| Live page | `https://oisin-curran-mb.github.io/Dashboard_Project_V2/#k=alerts2` |
