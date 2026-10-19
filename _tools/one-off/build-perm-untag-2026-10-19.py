# Owner, 19 Oct 2026: remove the "decided by the owner, 19 October 2026" style tags from the Permissions view and
# the review document; the rulings stand as the rules. Byte-safe. Run: python -I <this file>
import re, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"
P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s
n0 = len(s)
R = [
    (" (confirmed 19 Oct 2026)", ""),
    (" (new in V2; decided 19 Oct 2026)", " (new in V2)"),
    ("<p><b>Decided by the owner, 19 October 2026.</b> The rule for every control", "<p>The rule for every control"),
    ("<li><b>Decided by the owner, 19 October 2026:</b> the rows a user may see", "<li>The rows a user may see"),
    ("<li><b>Decided by the owner, 19 October 2026: keep the old panel's behaviour.</b> <b>Approve</b>", "<li><b>Approve</b>"),
    ("Both points are recorded as the owner's decision in the review document's section 6.", "Both keep the old panel's behaviour and are recorded in the review document's section 6."),
    ("<li><b>Decided by the owner, 19 October 2026: all or nothing.</b> A user who holds", "<li><b>All or nothing.</b> A user who holds"),
    (" (owner, 19 October 2026).</li>", ".</li>"),
    ("            <h3>Decided (owner, 19 October 2026)</h3>\r\n", ""),
]
for o, n in R:
    assert s.count(o) >= 1, ("count", s.count(o), o[:70]); s = s.replace(o, n)   # the confirmed tag appears on two rows
assert "19 October 2026" not in s[s.index('id="permView"'):s.index("</section>", s.index('id="permView"'))]
assert "19 Oct 2026" not in s[s.index('id="permView"'):s.index("</section>", s.index('id="permView"'))]
nb = s.encode("utf-8"); open(P, "wb").write(nb); print("index.html: tags removed; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)), "| chars", n0, "->", len(s))

D = os.path.join(ROOT, "docs", "handover", "Widget permissions - the old system and the V2 recommendation (draft).md")
t = open(D, "rb").read().decode("utf-8"); nl = "\r\n" if t.count("\r\n") > t.count("\n") // 2 else "\n"; t = t.replace("\r\n", "\n")
RD = [
    ("**Owner's ruling, 19 October 2026: keep the same as the original panel.** The list rule is the panel's,", "**Kept the same as the original panel.** The list rule is the panel's,"),
    ("| A user who is not an employee | **Owner's ruling, 19 October 2026: keep the old behaviour**; every department is listed, as the panel does | n/a |", "| A user who is not an employee | every department is listed, as the panel does (kept as the original) | n/a |"),
    ("| Approve, Undo | **Owner's ruling, 19 October 2026: keep the old behaviour**; the widget's right only, no separate Update check | n/a |", "| Approve, Undo | the widget's right only, no separate Update check (kept as the original) | n/a |"),
    ("All or nothing (owner, 19 Oct 2026): the Payroll Dashboard right", "All or nothing: the Payroll Dashboard right"),
    ("**Owner's ruling, 19 October 2026: kept as the\n   original; no Update check in V2 either.**", "**Kept as the original; no Update check in V2 either.**"),
    ("**Owner's ruling, 19 October\n   2026: kept as the original.**", "**Kept as the original.**"),
    ("**Owner's\n   ruling, 19 October 2026: all or nothing; the Payroll Dashboard right shows the widget, the Employee Break\n   Down pop-up and the export in full. Whether the pop-up should ever be hidden waits on feedback.**",
     "**All or nothing: the Payroll Dashboard right shows the widget, the Employee Break Down pop-up and the\n   export in full. Whether the pop-up should ever be hidden waits on feedback.**"),
    (" (decided 19 Oct 2026) | none; Secure employees included |", " | none; Secure employees included |"),
    ("| My Status | none (confirmed 19 Oct 2026) | always |", "| My Status | none | always |"),
    ("| Main Content Tasks | none (confirmed 19 Oct 2026) | always |", "| Main Content Tasks | none | always |"),
    ("| Financial KPI | General Ledger (decided 19 Oct 2026) | `/GeneralLedger` |", "| Financial KPI | General Ledger | `/GeneralLedger` |"),
    ("**Decided by the owner, 19 October 2026**\n\n", ""),
]
for o, n in RD:
    assert t.count(o) == 1, ("count", t.count(o), o[:70]); t = t.replace(o, n)
assert "19 October 2026" not in t and "19 Oct 2026" not in t and "Owner's ruling" not in t
open(D, "wb").write(t.replace("\n", nl).encode("utf-8")); print("review document: tags removed")
