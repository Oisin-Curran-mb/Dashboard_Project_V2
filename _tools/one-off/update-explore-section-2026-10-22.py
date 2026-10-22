#!/usr/bin/env python3
"""Update the Explore (Wide size) description in the W20 section of handover.html."""

with open("handover.html", "rb") as f:
    h = f.read()

OLD = (
    b"<h4>Explore (Wide size)</h4>\n"
    b"<ul>\n"
    b"<li>Shows all five categories as a collapsible accordion. Each category row shows the category name, item count, and a one-line summary (e.g. &ldquo;7 AP invoices past due: $56,350 total outstanding&rdquo;).</li>\n"
    b"<li>All categories start open. Clicking a category header collapses or expands it.</li>\n"
    b"<li>Each item within a category shows the item label and one action button (e.g. &ldquo;Process Payment&rdquo;, &ldquo;Post Transaction&rdquo;, &ldquo;View Invoice&rdquo;, &ldquo;View Journal&rdquo;).</li>\n"
    b"<li>Clicking an action button opens the item&rsquo;s modal.</li>\n"
    b"</ul>"
)

NEW = (
    b"<h4>Explore (Wide size)</h4>\n"
    b"<ul>\n"
    b"<li>Three horizontal tabs, one per financial domain: <strong>Accounts Payable</strong>, <strong>Accounts Receivable</strong> and <strong>General Ledger</strong>. Each tab label shows the number of alerts inside it (e.g. &ldquo;Accounts Payable (3)&rdquo;). Accounts Payable is selected by default.</li>\n"
    b"<li>The active tab shows the alerts for that domain. Each alert is a row with the alert name and item count.</li>\n"
    b"<li>Clicking an alert opens a modal with full details about that alert: a summary of what is pending, key facts (amounts, counts, oldest item age), and a redirect button that takes the user to the relevant section of the legacy Ministry Brands application with the appropriate filters pre-applied.</li>\n"
    b"<li>The AP Payment Processing alert lists three sub-groups &mdash; AVID Pay, ACH and EFT &mdash; each with its own invoice count and total. Clicking a sub-group opens a modal for that payment method and redirects to the AP Payment Processing screen filtered to that method.</li>\n"
    b"<li>Switching tabs shows the alerts for that domain without navigating away from the card.</li>\n"
    b"</ul>"
)

if OLD in h:
    h = h.replace(OLD, NEW)
    print("Replaced Explore section")
else:
    print("No match found for old Explore section")
    # Show what's in the file around Explore
    idx = h.find(b"Explore (Wide size)")
    if idx >= 0:
        print("Found 'Explore (Wide size)' at:", idx)
        print("Context:", h[idx:idx+500])
    else:
        print("'Explore (Wide size)' not found either")

with open("handover.html", "wb") as f:
    f.write(h)

print("Done")
