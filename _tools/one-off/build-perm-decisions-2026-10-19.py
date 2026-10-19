# Owner's rulings on the permissions open decisions, 19 Oct 2026:
#   1. Financial KPI: the General Ledger Dashboard right. DECIDED.
#   4. My Status and Main Content Tasks: carried as today, per query and per tile. CONFIRMED.
#   2, 3, 5: more information requested; stay open.
# Applied to the Permissions view (index.html) and the review document. Byte-safe. Run: python -I <this file>
import re, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"

# ---------- index.html: the Permissions view ----------
P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('<tr><td><b>Financial KPI</b></td><td>General Ledger (new in V2; proposed)</td><td><code>/GeneralLedger</code></td></tr>',
     '<tr><td><b>Financial KPI</b></td><td>General Ledger (new in V2; decided 19 Oct 2026)</td><td><code>/GeneralLedger</code></td></tr>')
sub1('<tr><td><b>My Status</b></td><td>none: each query carries its own module right</td><td><code>always offered</code></td></tr>',
     '<tr><td><b>My Status</b></td><td>none: each query carries its own module right (confirmed 19 Oct 2026)</td><td><code>always offered</code></td></tr>')
sub1('<tr><td><b>Main Content Tasks</b></td><td>none: each tile carries its own task</td><td><code>always offered</code></td></tr>',
     '<tr><td><b>Main Content Tasks</b></td><td>none: each tile carries its own task (confirmed 19 Oct 2026)</td><td><code>always offered</code></td></tr>')
sub1('''            <h2>4. Open decisions</h2>
            <ul class="spec-ul">
              <li>Financial KPI: the General Ledger Dashboard right (recommended) or a new task of its own.</li>
              <li>Purchasing Management: drop the old panel's Admin shortcut and follow the request page's rule (recommended), or keep parity with the panel.</li>
              <li>Payroll Scheduled Time Off: the rule for a user with no employee record, and the new Update check on Approve and Undo.</li>
              <li>Payroll Distributions: whether Secure employees are excluded from the Employee Break Down and the export for users without <code>/Payroll/Secure/Employee</code>.</li>
              <li>My Status and Main Content Tasks: carried as today, per query and per tile. Confirm.</li>
              <li>Links out of a widget: shown only with the destination page's right, as Main Content Tasks does. Confirm.</li>
            </ul>'''.replace("\n", "\r\n"),
'''            <h2>4. Decisions</h2>
            <h3>Decided (owner, 19 October 2026)</h3>
            <ul class="spec-ul">
              <li><b>Financial KPI</b> is shown with the General Ledger Dashboard right, like Budget Compared to Actual. No task of its own.</li>
              <li><b>My Status and Main Content Tasks</b> are carried as today: My Status offers a query only when the user holds that query's module right, and Main Content Tasks shows a tile only when the user holds the tile's task. Neither has a module right of its own.</li>
            </ul>
            <h3>Still open</h3>
            <ul class="spec-ul">
              <li>Purchasing Management: drop the old panel's Admin shortcut and follow the request page's rule (recommended), or keep parity with the panel.</li>
              <li>Payroll Scheduled Time Off: the rule for a user with no employee record, and the new Update check on Approve and Undo.</li>
              <li>Payroll Distributions: whether Secure employees are excluded from the Employee Break Down and the export for users without <code>/Payroll/Secure/Employee</code>.</li>
              <li>Links out of a widget: shown only with the destination page's right, as Main Content Tasks does (recommended).</li>
            </ul>''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("index.html: decisions applied; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))

# ---------- the review document ----------
D = os.path.join(ROOT, "docs", "handover", "Widget permissions - the old system and the V2 recommendation (draft).md")
t = open(D, "rb").read().decode("utf-8"); nl = "\r\n" if t.count("\r\n") > t.count("\n") // 2 else "\n"; t = t.replace("\r\n", "\n")


def dsub(o, n):
    global t
    assert t.count(o) == 1, ("count", t.count(o), o[:80]); t = t.replace(o, n)


dsub("| Financial KPI | General Ledger (proposed) | `/GeneralLedger` | none | none |",
     "| Financial KPI | General Ledger (decided 19 Oct 2026) | `/GeneralLedger` | none | none |")
dsub("| My Status | none | always | each query: its module root | none |",
     "| My Status | none (confirmed 19 Oct 2026) | always | each query: its module root | none |")
dsub("| Main Content Tasks | none | always | each tile: its own task | none |",
     "| Main Content Tasks | none (confirmed 19 Oct 2026) | always | each tile: its own task | none |")
i = t.index("## 8. Decisions for the owner"); j = t.find("\n## ", i + 5); j = len(t) if j < 0 else j
new8 = '''## 8. Decisions

**Decided by the owner, 19 October 2026**

1. Financial KPI is shown with the General Ledger Dashboard right (`/GeneralLedger` at Inquiry), like Budget
   Compared to Actual. No task of its own.
2. My Status and Main Content Tasks are carried as today: My Status offers a query only when the user holds
   that query's module right (`MyStatus.ascx.cs:58`), and Main Content Tasks shows a tile only when the user
   holds the tile's task (`MainContentTasks.ascx.cs:31`). Neither widget has a module right of its own.

**Still open, information supplied 19 October 2026 (see the session notes)**

3. Purchasing Management: drop the old panel's Admin shortcut and follow the request page's rule
   (recommended), or keep parity with the panel's list rule. Section 3.
4. Payroll Scheduled Time Off: the rule for a user with no employee record (Q21), and the new Update check on
   Approve and Undo. Section 4.
5. Payroll Distributions: whether Secure employees are excluded from the Employee Break Down for users without
   `/Payroll/Secure/Employee`.
6. Links out of a widget: shown only with the destination page's right (section 5.2), as Main Content Tasks
   does today, rather than letting the destination refuse the user as the old Purchasing pencil did.
   Recommended.
'''
t = t[:i] + new8 + t[j:]
open(D, "wb").write(t.replace("\n", nl).encode("utf-8")); print("review document: section 8 and the summary rows updated")
