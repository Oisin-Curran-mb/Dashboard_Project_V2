#!/usr/bin/env python3
"""Rewrite the W20 section of handover.html with the corrected widget description."""

with open("handover.html", "rb") as f:
    h = f.read()

# Find and remove the existing W20 section (everything from <section id="w20" to the next </section>)
start_marker = b'<section id="w20"'
end_marker = b'</section>\n</main>'

start = h.find(start_marker)
end = h.find(end_marker)

if start < 0:
    print("ERROR: W20 section start not found")
    exit(1)
if end < 0:
    print("ERROR: </main> end not found")
    exit(1)

# Keep everything before W20 section and from </main> onwards
before = h[:start]
after = h[end:]  # starts with </section>\n</main>

NEW_W20 = b"""<section id="w20" class="widget"><header class="wh"><div><span class="wid">W20</span><h2>Pending Actions</h2></div><div class="badges"><span class="ctype t-new">New Widget</span><span class="rev">Not reviewed yet</span></div></header>
<details class="shots" open><summary>Screenshots <span class="count">Screenshots not yet captured</span></summary>
<div class="pair"><h4><span class="num">01</span>Glance</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending<code>kpi size</code></div></figure></div></div>
<div class="pair"><h4><span class="num">02</span>Explore (Wide)</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending<code>wide size</code></div></figure></div></div>
<div class="pair"><h4><span class="num">03</span>Detail (Extra Wide)</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending<code>xwide size</code></div></figure></div></div>
<div class="pair"><h4><span class="num">04</span>Detail &mdash; item selected, right pane</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending</div></figure></div></div>
<div class="pair"><h4><span class="num">05</span>Modal &mdash; AP Payment Processing</h4><div class="pair-grid"><figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not in V1<code>New in V2</code></div></figure><figure class="shot missing"><figcaption>V2</figcaption><div class="ph">Screenshot pending</div></figure></div></div>
</details>
<div class="prose"><h3>Overview</h3>
<p><strong>Pending Actions is new in V2 and has no V1 counterpart.</strong> It is the action queue for a user's outstanding financial tasks across three modules: Accounts Payable, Accounts Receivable and General Ledger. Each alert represents a category of pending work. Clicking through opens a modal with full details and a redirect button that takes the user to the relevant section of the legacy Ministry Brands application with the appropriate filters pre-applied.</p>
<p>The widget comes in three sizes: Glance (KPI), Explore (Wide) and Detail (Extra Wide).</p>
<h3>Categories</h3>
<p>There are five action categories across three financial domains:</p>
<table>
<thead><tr><th>Domain</th><th>Category</th><th>Redirect destination</th></tr></thead>
<tbody>
<tr><td>Accounts Payable</td><td>Payment Processing</td><td>AP module &rarr; Payment Processing (with method filter)</td></tr>
<tr><td>Accounts Payable</td><td>Unposted Transactions</td><td>AP module &rarr; Unposted Transactions</td></tr>
<tr><td>Accounts Receivable</td><td>Payment Processing</td><td>AR module &rarr; Payment Processing</td></tr>
<tr><td>Accounts Receivable</td><td>Unposted Invoices</td><td>AR module &rarr; Unposted Invoices</td></tr>
<tr><td>General Ledger</td><td>Unposted Journals</td><td>GL module &rarr; Unposted Journals</td></tr>
</tbody>
</table>
<p>The AP Payment Processing category has three payment method sub-groups: <strong>AVID Pay</strong>, <strong>ACH</strong> and <strong>EFT</strong>. Each sub-group shows its invoice count and total amount. Clicking a sub-group opens a modal for that payment method and redirects to the AP Payment Processing screen with that method's filter pre-applied.</p>
<h3>How It Works</h3>
<h4>Glance (KPI size)</h4>
<ul>
<li>Shows a summary: the total number of items pending across all categories, and a count of how many queues (categories) have items.</li>
<li>Three neutral group badges show the item count per domain: Accounts Payable, Accounts Receivable, General Ledger.</li>
<li>A &ldquo;Queues&rdquo; button at the bottom-right opens a popover panel listing all five active categories with their item counts, so the user can see at a glance where work is concentrated.</li>
<li>Clicking a category in the popover navigates to the Explore or Detail view for that category.</li>
</ul>
<h4>Explore (Wide size)</h4>
<ul>
<li>Shows all five categories as a collapsible accordion. Each category row shows the category name, item count, and a one-line summary (e.g. &ldquo;7 AP invoices past due: $56,350 total outstanding&rdquo;).</li>
<li>All categories start open. Clicking a category header collapses or expands it.</li>
<li>Each item within a category shows the item label and one action button (e.g. &ldquo;Process Payment&rdquo;, &ldquo;Post Transaction&rdquo;, &ldquo;View Invoice&rdquo;, &ldquo;View Journal&rdquo;).</li>
<li>Clicking an action button opens the item&rsquo;s modal.</li>
</ul>
<h4>Detail (Extra Wide size)</h4>
<ul>
<li>A 40/60 split layout: the accordion list on the left, a detail pane on the right.</li>
<li>Clicking any item in the left panel selects it and highlights it. The right pane shows a structured fact card for that item: category label, item title, a table of key facts (with alarming values highlighted), a redirect note naming the destination screen, and primary and secondary action buttons.</li>
<li>The close button (&times;) in the right pane deselects the item and returns to the empty-state placeholder.</li>
</ul>
<h4>Modals</h4>
<ul>
<li>Every action button opens a structured modal. The modal shows: the category label in neutral grey (e.g. &ldquo;ACCOUNTS PAYABLE&rdquo;), the item title, a table of key facts, a redirect note naming the destination screen in the legacy app, and the primary action button.</li>
<li>The action button navigates the user to the legacy Ministry Brands module with the relevant filters pre-applied. For example, clicking &ldquo;Process Payment&rdquo; on an AVID Pay item takes the user to the AP Payment Processing screen filtered to AVID Pay.</li>
<li>Modals close with the &times; button, Cancel, Escape, or a click outside the modal.</li>
<li>In the demo, all action buttons write to the status line instead of navigating. Production wiring is per category (see Developer Notes).</li>
</ul>
<h3>Developer Notes</h3>
<p>Everything in the card is mock data. Production needs a pending-actions feed and real redirects wired per category.</p>
<h4>Data</h4>
<ul>
<li>One data entry per category: title, summary line, item count, and items. Per item: the label text and the structured facts its modal shows (invoice number, amount, days pending, payment method, status).</li>
<li>AP Payment Processing items are grouped by payment method (AVID Pay, ACH, EFT). Each group is a single item entry in the accordion, not individual invoice rows, because the redirect goes to a filtered screen showing all invoices for that method.</li>
<li>The item counts, amounts and &ldquo;days pending&rdquo; figures are fixed in the demo. In production they come from the live AP/AR/GL feeds.</li>
</ul>
<h4>Redirects</h4>
<ul>
<li>Each category and sub-group needs a destination URL and filter set agreed with the product team. The modal&rsquo;s redirect note field names the destination screen; the action button triggers the navigation.</li>
<li>AP Payment Processing: redirect to the AP Payment Processing screen, filter by method (AVID Pay, ACH or EFT).</li>
<li>AP Unposted Transactions: redirect to the AP Unposted Transactions screen.</li>
<li>AR Payment Processing: redirect to the AR Payment Processing screen.</li>
<li>AR Unposted Invoices: redirect to the AR Unposted Invoices screen.</li>
<li>GL Unposted Journals: redirect to the GL Unposted Journals screen.</li>
</ul>
<h4>Still open</h4>
<ul>
<li>This widget has not yet been through the owner&rsquo;s review; the category list and wording may change.</li>
<li>Screenshots are not yet captured for the handover doc.</li>
<li>Exact redirect URLs and filter parameters for each category are not yet defined.</li>
<li>Whether a completed item should disappear from the queue immediately or on next page load is not decided.</li>
</ul>
</div></section>
"""

h = before + NEW_W20 + after
with open("handover.html", "wb") as f:
    f.write(h)
print("Done — W20 section rewritten")
