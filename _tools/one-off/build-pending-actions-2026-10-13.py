"""
build-pending-actions-2026-10-13.py
Duplicates the alerts2 (W19-Copy) block as a new "Pending Actions" widget (kind: pendingactions).
All alerts2-specific identifiers are renamed:
  ALO2_  -> PA3_
  alo2   -> pa3
  alO2-  -> paO3-  (data-action attribute values)
  al2-   -> pa3-   (CSS classes that are widget-specific)
  alerts2 -> pendingactions  (kind string)
  W19-Copy -> W19-PendingActions  (banner)
  alb4-  -> stays (shared CSS)
  al-    -> stays  (shared CSS)
Then adds two dashboard registry entries for Pending Actions (wide + xwide).
"""
import re

P = "index.html"
s = open(P, "rb").read().decode("utf-8")

# ── 1. Extract the alerts2 JS block ────────────────────────────────────────
START_MARKER = "/* ===== W19-Copy Alerts & Actions V2 (alerts2) ===== */"
END_MARKER   = "/* ===== end W19-Copy Alerts & Actions V2 (alerts2) ===== */"

assert s.count(START_MARKER) == 1, "START_MARKER not found exactly once"
assert s.count(END_MARKER)   == 1, "END_MARKER not found exactly once"

i_start = s.index(START_MARKER)
i_end   = s.index(END_MARKER) + len(END_MARKER)
alerts2_block = s[i_start:i_end]

# ── 2. Build the pendingactions block by renaming identifiers ───────────────
# Order matters: longest/most-specific first to avoid partial matches.
def rename(text):
    # Data-action attribute values: "alO2-..." -> "paO3-..."
    text = text.replace('"alO2-',  '"paO3-')
    text = text.replace("'alO2-",  "'paO3-")
    # indexOf check strings: 'alO2-' -> 'paO3-'
    text = text.replace('a.indexOf("alO2-")', 'a.indexOf("paO3-")')
    # JS variable prefixes / function names: ALO2_ -> PA3_
    text = text.replace("ALO2_", "PA3_")
    # Function and variable names: alo2 -> pa3  (careful: alo2OpenJournalModal etc)
    text = text.replace("alo2", "pa3")
    # CSS classes: al2- -> pa3-
    text = text.replace('"al2-', '"pa3-')
    text = text.replace("'al2-", "'pa3-")
    text = text.replace(' al2-', ' pa3-')
    text = text.replace('.al2-', '.pa3-')
    # kind string: alerts2 -> pendingactions
    text = text.replace('"alerts2"', '"pendingactions"')
    # Banners
    text = text.replace(
        "/* ===== W19-Copy Alerts & Actions V2 (alerts2) ===== */",
        "/* ===== W19-PendingActions Pending Actions V2 (pendingactions) ===== */"
    )
    text = text.replace(
        "/* ===== end W19-Copy Alerts & Actions V2 (alerts2) ===== */",
        "/* ===== end W19-PendingActions Pending Actions V2 (pendingactions) ===== */"
    )
    # Comment header inside block
    text = text.replace(
        "/* Variant of W19 with renamed tabs (Need Actions / Updates, no All),\n     a 7th category (Unposted Journals, like Receivable Invoices Outstanding),\n     Need Actions tab = Overdue Payables + PO Queue (red border),\n     Updates tab = all others (amber border). */",
        "/* Pending Actions: duplicate of alerts2 variant, renamed as Pending Actions widget. */"
    )
    # Category ids: al2-cat- -> pa3-cat-
    text = text.replace('"al2-cat-', '"pa3-cat-')
    text = text.replace("'al2-cat-", "'pa3-cat-")
    # data-cat attribute values that reference al2-cat
    # These are covered by the '"al2-cat-' replacement above.
    return text

pa3_block = rename(alerts2_block)

# Sanity: make sure the new block doesn't still contain the old kind
assert '"alerts2"' not in pa3_block, "alerts2 kind still present in new block"
assert '"pendingactions"' in pa3_block, "pendingactions kind missing from new block"
assert "PA3_CATS" in pa3_block, "PA3_CATS missing from new block"
assert "pa3Content" in pa3_block, "pa3Content missing from new block"

# ── 3. Insert the new block immediately after the alerts2 block ────────────
# We insert right after the END_MARKER of the alerts2 block (+ the newline)
insert_after = END_MARKER
assert s.count(insert_after) == 1

insertion = "\r\n\r\n" + pa3_block.replace("\n", "\r\n")
# Avoid double-converting CRLF (alerts2_block was read from CRLF file, so already CRLF)
# pa3_block inherits CRLF from the source; the .replace("\n", "\r\n") above converts
# any remaining bare LF. Check for double CRLF and fix.
insertion = insertion.replace("\r\r\n", "\r\n")

s = s.replace(insert_after, insert_after + insertion)
assert s.count("/* ===== W19-PendingActions Pending Actions V2 (pendingactions) ===== */") == 1

# ── 4. Add dashboard registry entries for Pending Actions ──────────────────
# Insert after the alerts2 registry entries
OLD_REG = '      {id:"alB4_2x",title:"Alerts & Actions Copy (Detail)",kind:"alerts2",size:"xwide",tiers:["wide","xwide"],updated:"just now"},'
NEW_REG_LINES = (
    '      {id:"alB4_2x",title:"Alerts & Actions Copy (Detail)",kind:"alerts2",size:"xwide",tiers:["wide","xwide"],updated:"just now"},\r\n'
    '      /* W19-PendingActions Pending Actions (pendingactions variant) */\r\n'
    '      {id:"paB4",title:"Pending Actions",kind:"pendingactions",size:"wide",tiers:["wide","xwide"],updated:"just now"},\r\n'
    '      {id:"paB4_x",title:"Pending Actions (Detail)",kind:"pendingactions",size:"xwide",tiers:["wide","xwide"],updated:"just now"},'
)

OLD_REG_CRLF = OLD_REG.replace("\n", "\r\n")
assert s.count(OLD_REG_CRLF) == 1, "Registry anchor not found exactly once: " + repr(OLD_REG_CRLF[:80])
s = s.replace(OLD_REG_CRLF, NEW_REG_LINES)

# ── 5. Write back ───────────────────────────────────────────────────────────
open(P, "wb").write(s.encode("utf-8"))
print("Done. New kind 'pendingactions' inserted after alerts2 block.")
print("Registry entries added: paB4 (wide) and paB4_x (xwide).")
