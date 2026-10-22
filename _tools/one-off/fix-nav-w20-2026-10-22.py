#!/usr/bin/env python3
"""Fix nav to add W20 entry after W19 in handover.html."""

with open("handover.html", "rb") as f:
    h = f.read()

# Find the exact bytes ending the nav
# The nav ends with: ...Alerts & Actions</span></a></nav>
old = b'<a href="#w19" class="t-new"><span class="dot"></span><span class="nw">W19</span><span class="nn">Alerts & Actions</span></a></nav>'
new = (
    b'<a href="#w19" class="t-new"><span class="dot"></span><span class="nw">W19</span><span class="nn">Alerts & Actions</span><span class=chk>\xe2\x9c\x93</span></a>'
    b'<a href="#w20" class="t-new"><span class="dot"></span><span class="nw">W20</span><span class="nn">Pending Actions</span><span class=chk>\xe2\x9c\x93</span></a></nav>'
)

if old in h:
    h = h.replace(old, new)
    print("Nav updated successfully")
else:
    # Show what's around </nav>
    idx = h.find(b'</nav>')
    if idx >= 0:
        print("Nav closing tag found at:", idx)
        print("Context before </nav>:", h[idx-200:idx+10])
    else:
        print("</nav> not found")

with open("handover.html", "wb") as f:
    f.write(h)
print("Done")
