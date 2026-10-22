#!/usr/bin/env python3
"""Patch handover.html: add W20 Pending Actions nav entry and section."""
import re

with open("handover.html", "r", encoding="utf-8") as f:
    h = f.read()

# 1. Nav: mark W19 as reviewed, add W20 after it
OLD_NAV = '<a href="#w19" class="t-new"><span class="dot"></span><span class="nw">W19</span><span class="nn">Alerts & Actions</span></a></nav>'
NEW_NAV = (
    '<a href="#w19" class="t-new"><span class="dot"></span><span class="nw">W19</span><span class="nn">Alerts & Actions</span><span class=chk>&#x2713;</span></a>'
    '<a href="#w20" class="t-new"><span class="dot"></span><span class="nw">W20</span><span class="nn">Pending Actions</span><span class=chk>&#x2713;</span></a></nav>'
)
h = h.replace(OLD_NAV, NEW_NAV)

# 2. Legend bullet — update "new widget" description
h = h.replace(
    "did not exist in V1 (Financial KPI and Alerts & Actions).",
    "did not exist in V1 (Financial KPI, Alerts & Actions, and Pending Actions)."
)

# 3. Intro paragraph — update "two new" to "three new"
h = h.replace(
    "plus the two new in V2, <strong>Financial KPI</strong>",
    "plus the three new in V2: <strong>Financial KPI</strong>"
)
h = h.replace(
    "and <strong>Alerts & Actions</strong>, not yet written up.",
    "; <strong>Alerts & Actions</strong>; and <strong>Pending Actions</strong>."
)

# 4. W20 section — insert before </main>
W20_SECTION = """
<section id="w20" class="widget"><header class="wh"><div><span class="wid">W20</span><h2>Pending Actions</h2></div><div class="badges"><span class="ctype t-new">New Widget</span><span class="rev">Not reviewed yet</span></div></header>
<details class="shots" open><summary>Screenshots <span class="count">Screenshots not yet captured</span></summary>
<div class="pair"><h4><span class="num">01</span>Glance (KPI)</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending<code>kpi size</code></div></figure></div></div>
<div class="pair"><h4><span class="num">02</span>Explore (Wide)</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending<code>wide size</code></div></figure></div></div>
<div class="pair"><h4><span class="num">03</span>Detail (Extra Wide)</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending<code>xwide size</code></div></figure></div></div>
<div class="pair"><h4><span class="num">04</span>Detail — item selected, right pane</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending</div></figure></div></div>
<div class="pair"><h4><span class="num">05</span>Modal — AP Payment Processing</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending</div></figure></div></div>
</details>
<div class="prose"><h3>Overview</h3>
<p><strong>Pending Actions is new in V2 and has no V1 counterpart.</strong> Where Alerts & Actions (W19) surfaces exceptional conditions that need investigation, Pending Actions surfaces items that are waiting for a specific person to act on them right now — invoices to process, transactions to post, journals to review. It is the action queue for the user's day-to-day accounting tasks, grouped by financial domain and sized for three dashboard widths.</p>
<p>It does four things:</p>
<ol>
<li><strong>Queues.</strong> One collapsible accordion per action category, showing what is waiting and how long it has been there.</li>
<li><strong>Action buttons per item.</strong> Each item carries a button labelled for its action: "Process Payment", "Post Transaction", "View Invoice", "View Journal", "Review Budget".</li>
<li><strong>Detail pane (xwide only).</strong> A 40/60 split: the queue list on the left, a right-hand detail pane that opens when an item is selected and shows a structured fact card for that item with primary and secondary action buttons.</li>
<li><strong>Modals.</strong> Clicking an action button opens a structured modal with the item's key facts, a redirect note naming the destination screen, and the action button. The modal header category label (Accounts Payable, Accounts Receivable, General Ledger) is shown in neutral grey, not a severity colour, because these are pending tasks, not alerts.</li>
</ol>
<h3>What It Does</h3>
<h4>Sizes</h4>
<ul>
<li><strong>Glance (KPI):</strong> A summary card showing the total number of items to act on and how many queues have items, then three neutral badge pills showing the item count per financial group (Accounts Payable, Accounts Receivable, General Ledger). A "Queues" link at the bottom-right opens a popover panel listing every active category with its item count, so the user can see at a glance where work is concentrated without leaving the dashboard.</li>
<li><strong>Explore (Wide):</strong> The full accordion list of categories, each with a coloured severity edge, the category title, the item count, and a one-line summary. All categories start open. Each item row shows the item text and its action button. The user can collapse or expand any category.</li>
<li><strong>Detail (Extra Wide):</strong> A 40/60 split layout. The left panel shows the same accordion list as Explore; clicking an item selects it and highlights it in amber. The right panel shows the selected item's detail card: category label, item title, a table of key facts (with alarming values highlighted), a redirect note ("You will be taken to…"), and primary and secondary action buttons. Clicking the right panel's close button (×) deselects the item and returns to the empty-state placeholder ("Select an item from the queue on the left").</li>
</ul>
<h4>Categories (Action Queues)</h4>
<p>The widget groups items into nine categories across three financial domains:</p>
<table>
<thead><tr><th>Domain</th><th>Category</th><th>Primary action</th></tr></thead>
<tbody>
<tr><td>Accounts Payable</td><td>Payment Processing</td><td>Process Payment</td></tr>
<tr><td>Accounts Payable</td><td>Unreconciled Accounts</td><td>View Details</td></tr>
<tr><td>Accounts Payable</td><td>Budget Alert</td><td>Review Budget</td></tr>
<tr><td>Accounts Payable</td><td>Unposted Transactions</td><td>Post Transaction</td></tr>
<tr><td>Accounts Payable</td><td>Pending Approval</td><td>Review Approval</td></tr>
<tr><td>Accounts Receivable</td><td>Unposted Invoices</td><td>View Invoice</td></tr>
<tr><td>Accounts Receivable</td><td>Payment Processing</td><td>Process Payment</td></tr>
<tr><td>Accounts Receivable</td><td>Budget Alert</td><td>Review Budget</td></tr>
<tr><td>General Ledger</td><td>Unposted Journals</td><td>View Journal</td></tr>
</tbody>
</table>
<h4>Accordion behaviour</h4>
<ul>
<li><strong>Explore (Wide):</strong> All categories start open. Clicking a category header toggles it. There is no "one open at a time" rule in Explore — any combination can be open simultaneously.</li>
<li><strong>Detail (Extra Wide):</strong> On first load, only the first category with items is open. After that, clicking a header toggles it independently. Selecting an item auto-scrolls to keep it visible.</li>
<li>The item count badge and the one-line summary are always visible, even when a category is collapsed.</li>
</ul>
<h4>Action buttons</h4>
<ul>
<li>Each item carries one primary action button. The label is determined by the category: "Process Payment" for payment processing categories, "Post Transaction" for unposted transactions, "View Invoice" for unposted invoices, "View Journal" for unposted journals, "Review Budget" for budget alerts, and "Review Approval" for pending approvals.</li>
<li>Clicking an action button opens the modal for that item. In xwide Detail, the button in the right pane opens the same modal.</li>
<li>The action buttons in the accordion item rows are hidden in xwide Detail (clicking the item row itself selects it into the right pane instead).</li>
</ul>
<h4>Modals</h4>
<ul>
<li>Every action button opens a structured modal. The modal has: a category label in neutral grey (e.g. "ACCOUNTS PAYABLE"), the item title, a table of key facts with alarming values highlighted in red, a redirect note naming the destination screen, and a primary action button ("Process Payment", "Post Transaction" etc.) plus Cancel.</li>
<li>Modals close with the × button, the Cancel button, the Escape key, or a click outside the modal.</li>
<li>In the demo, all action buttons write to the status line ("Processing payment for…", "Posting transaction…") instead of navigating. Production needs real destinations wired per category.</li>
<li>The GL Unposted Journals category uses a distinct journal modal showing journal-entry-specific fields (journal number, period, prepared by, total debit/credit).</li>
</ul>
<h4>Group filter (Glance / Explore)</h4>
<ul>
<li>The Glance card's Queues popover groups categories under Accounts Payable, Accounts Receivable and General Ledger headings and shows each category's item count.</li>
<li>The Explore and Detail views show all categories regardless; filtering by group is a future enhancement.</li>
</ul>
<h3>Data States</h3>
<p>The widget handles five data states, selectable via the <code>#ds=</code> URL parameter in the demo:</p>
<ul>
<li><strong>Default:</strong> Nine categories, realistic item counts (1–6 items each), detailed modal facts per item.</li>
<li><strong>No data (<code>#ds=none</code>):</strong> Empty state — "No pending actions. All queues are clear."</li>
<li><strong>Not configured (<code>#ds=notconfigured</code>):</strong> "Pending Actions has not been set up for your role."</li>
<li><strong>Small data (<code>#ds=small</code>):</strong> Five categories, one item each — minimal workload.</li>
<li><strong>Extreme high volume (<code>#ds=extreme</code>):</strong> Five categories with high item counts: AP Payment Processing shows 3 grouped batch lines (AVID Pay · 25 invoices, ACH · 18 invoices, EFT · 12 invoices); AP Unposted Transactions 40 items; AR Unposted Invoices 80 items; AR Payment Processing 30 items; GL Unposted Journals 50 items. The Glance hero number and group badges update to reflect the totals.</li>
</ul>
<h3>Developer Notes</h3>
<p>Everything in the card is mock data. Production needs action queue feeds and real actions wired per category.</p>
<h4>Data</h4>
<ul>
<li>One feed per category: severity, title, summary, items. Per item: the label text, and the structured facts its modal shows (invoice number, amount, days pending, vendor, status, etc.).</li>
<li>Severity is "need" (action required now) or "upd" (update / informational). The left-edge colour and item count badge colour follow the severity. The demo uses "need" for all active categories.</li>
<li>Item counts in the Glance hero and group badges are computed from the live data, so they update automatically when data states change.</li>
<li>The "days pending", "days overdue" and amount figures are fixed in the demo; in production they are computed from the item dates.</li>
</ul>
<h4>Actions</h4>
<ul>
<li>Each category needs a destination page and action agreed with the product team. The modal's "redirect note" field names this destination; the action button is what triggers the navigation or API call.</li>
<li>The Approve and Reject paths (Pending Approval category) must use the same permission checks as the Purchasing / AP approval pages and refresh the queue item on success.</li>
<li>Do not assume a destination page exists without checking; some categories may require new pages.</li>
</ul>
<h4>Fallback button logic</h4>
<ul>
<li>Each category has a default action registered in <code>PA3_CAT_FALLBACK</code>. This is used when an item does not have a specific modal configuration — for example, generated items in the extreme data state beyond the first six. The fallback maps category ID to <code>opens*</code> flag and button label, so every item always shows a meaningful action button rather than the generic "View Details".</li>
</ul>
<h4>Still open</h4>
<ul>
<li>This widget has not yet been through the owner's review; the category list and item wording may change.</li>
<li>Screenshots are not yet captured for the handover doc.</li>
<li>The group filter dropdown in Explore / Detail (to show only AP, AR or GL categories) is not yet built.</li>
<li>Destination pages for each category's action buttons are not yet defined.</li>
<li>Whether a completed item should disappear from the queue immediately or on next page load is not decided.</li>
</ul>
</div></section>
"""

h = h.replace("</main></div>", W20_SECTION + "</main></div>")

with open("handover.html", "w", encoding="utf-8") as f:
    f.write(h)

print("Done — W20 section added to handover.html")
