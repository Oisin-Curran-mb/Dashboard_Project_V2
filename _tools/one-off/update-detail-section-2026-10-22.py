#!/usr/bin/env python3
"""Update the Detail (Extra Wide size) description in the W20 section of handover.html."""

with open("handover.html", "rb") as f:
    h = f.read()

OLD = (
    b"<h4>Detail (Extra Wide size)</h4>\n"
    b"<ul>\n"
    b"<li>A 40/60 split layout: the accordion list on the left, a detail pane on the right.</li>\n"
    b"<li>Clicking any item in the left panel selects it and highlights it. The right pane shows a structured fact card for that item: category label, item title, a table of key facts (with alarming values highlighted), a redirect note naming the destination screen, and primary and secondary action buttons.</li>\n"
    b"<li>The close button (&times;) in the right pane deselects the item and returns to the empty-state placeholder.</li>\n"
    b"</ul>"
)

NEW = (
    b"<h4>Detail (Extra Wide size)</h4>\n"
    b"<ul>\n"
    b"<li>The largest size. Three horizontal tabs at the top &mdash; <strong>Accounts Payable</strong>, <strong>Accounts Receivable</strong> and <strong>General Ledger</strong> &mdash; each showing its alert count. Accounts Payable is selected by default.</li>\n"
    b"<li>Below the tabs, the card is split into two panes: the <strong>left pane</strong> lists the alerts for the active tab&rsquo;s domain; the <strong>right pane</strong> shows the full detail of whichever alert is selected.</li>\n"
    b"<li><strong>Left pane:</strong> each alert row shows the alert name and its item count. Clicking a row selects it and highlights it; the right pane updates immediately to show that alert&rsquo;s detail. No modal opens &mdash; the detail is shown inline in the right pane.</li>\n"
    b"<li><strong>Right pane:</strong> shows a structured fact card for the selected alert: the alert title, a summary, a table of key facts (with alarming values highlighted), and &mdash; in the bottom-right corner &mdash; the primary action button that redirects the user to the relevant section of the legacy Ministry Brands application with the appropriate filters pre-applied.</li>\n"
    b"<li>The close button (&times;) in the right pane deselects the alert and returns to the empty-state placeholder (&ldquo;Select an alert from the list on the left&rdquo;).</li>\n"
    b"<li>Switching tabs clears the current selection and shows the alerts for the newly selected domain.</li>\n"
    b"<li>The redirect behaviour is the same as in Explore: clicking the primary action button in the right pane takes the user to the legacy module with filters pre-applied.</li>\n"
    b"</ul>"
)

if OLD in h:
    h = h.replace(OLD, NEW)
    print("Replaced Detail section")
else:
    print("No exact match. Searching...")
    idx = h.find(b"Detail (Extra Wide size)")
    if idx >= 0:
        print("Found at byte:", idx)
        print("Context:", h[idx:idx+600])
    else:
        print("Not found")

with open("handover.html", "wb") as f:
    f.write(h)
print("Done")
