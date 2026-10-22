#!/usr/bin/env python3
"""Fix mojibake in handover.html extreme state description for W20."""

with open("handover.html", "rb") as f:
    h = f.read()

# Find what's actually in the file around "AVID Pay"
idx = h.find(b"AVID Pay")
if idx >= 0:
    snippet = h[idx:idx+120]
    print("Found AVID Pay at byte", idx)
    print("Hex:", snippet.hex())
    print("Raw:", snippet)
else:
    print("AVID Pay not found")

# Replace the entire broken extreme state sentence with clean ASCII
# Find the start and end of the extreme li element
start_marker = b"<li><strong>Extreme high volume"
end_marker = b"totals.</li>"

start = h.find(start_marker)
end = h.find(end_marker)

if start >= 0 and end >= 0:
    end += len(end_marker)
    old_chunk = h[start:end]
    print("\nOld chunk:", old_chunk.decode("latin-1"))
    
    new_chunk = (
        b"<li><strong>Extreme high volume (<code>#ds=extreme</code>):</strong> "
        b"Five active categories with high item counts: AP Payment Processing shows 3 grouped batch lines "
        b"(AVID Pay &middot; 25 invoices, ACH &middot; 18 invoices, EFT &middot; 12 invoices &mdash; 55 total); "
        b"AP Unposted Transactions 40 items; AR Unposted Invoices 80 items; AR Payment Processing 30 items; "
        b"GL Unposted Journals 50 items. The monitoring categories (Restricted Fund, Unreconciled Bank, "
        b"Budget Exceeded, Purchase Order Queue) are not shown in extreme state. "
        b"The Glance hero number and group badges update to reflect the totals.</li>"
    )
    
    h = h[:start] + new_chunk + h[end:]
    print("\nReplaced successfully")
else:
    print("Markers not found: start=%s end=%s" % (start, end))

with open("handover.html", "wb") as f:
    f.write(h)

print("Done")
