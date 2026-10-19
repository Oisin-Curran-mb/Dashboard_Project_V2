# Owner's rulings on the remaining permissions decisions, 19 Oct 2026 (second round):
#   Purchasing Management: keep the original panel's list rule, Admin shortcut included.
#   Payroll Scheduled Time Off: keep the original panel's behaviour (no employee record: every department;
#     Approve and Undo with the widget's right, no Update check).
#   Links out of a widget: confirmed; a link to a page the user does not hold is not shown (Main Content Tasks model).
#   Payroll Distributions Secure employees: still open.
# Byte-safe. Run: python -I <this file>
import re, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"

# ---------- index.html: the Permissions view ----------
P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o.replace("\n", "\r\n"), n.replace("\r\n", "\n").replace("\n", "\r\n")) if o.replace("\n", "\r\n") in s else None


def subx(o, n):
    global s
    o2 = o.replace("\r\n", "\n").replace("\n", "\r\n"); n2 = n.replace("\r\n", "\n").replace("\n", "\r\n")
    assert s.count(o2) == 1, ("count", s.count(o2), o[:80]); s = s.replace(o2, n2)


# section 2 rule paragraph: now a confirmed rule
subx('''<p>The standing rule for every control below: <b>show it only when the user holds the destination page's right</b> (or the action's right); otherwise the control is absent. Never rely on the destination page refusing the user after the click, which is what the old Purchasing pencil and My Status jump did. The API serving the widget returns, per record, whether the current user may open or act on it, so the widget never reads the rights table.</p>''',
     '''<p><b>Decided by the owner, 19 October 2026.</b> The rule for every control below that leads to another page: <b>show it only when the user holds the destination page's right</b>; otherwise the control is absent, as Main Content Tasks does today. A link from a widget in one module to a page in another module the user does not hold is never shown. Do not rely on the destination page refusing the user after the click, which is what the old Purchasing pencil and My Status jump did. The API serving the widget returns, per record, whether the current user may open or act on it, so the widget never reads the rights table.</p>''')
# 2.1 Purchasing: the list rule is the panel's, Admin included
subx('''              <li>Account roles can refuse an order the page right would allow; the API marks each request openable or not.</li>
            </ul>''',
     '''              <li>Account roles can refuse an order the page right would allow; the API marks each request openable or not.</li>
              <li><b>Decided by the owner, 19 October 2026:</b> the rows a user may see follow the old panel's rule unchanged, Admin shortcut included: for "Awaiting" the user's own level or own requests; for the rest, a request whose path has no users, or where the user is a path user, or the user is an Admin, or holds Approval Override at Update. Approve, Hold and Reject keep the request page's rule above, the only rule the old system has for acting.</li>
            </ul>''')
# 2.5 Time Off: parity with the panel
subx('''              <li><b>Approve</b>, <b>Undo</b>: the Payroll Dashboard right at <b>Update</b>. The old panel saved an approval with no update check; V2 closes that.</li>
              <li>The rows a user sees are the employees whose home department is in the user's approval departments. The old panel showed every department to a user with no employee record; V2 must not.</li>''',
     '''              <li><b>Decided by the owner, 19 October 2026: keep the old panel's behaviour.</b> <b>Approve</b> and <b>Undo</b> need the widget's right only, as the old panel saved an approval; no separate Update check.</li>
              <li>The rows a user sees are the employees whose home department is in the signed-in employee's approval departments ("Can Approve Home Depts"). A user with no employee record sees every department, as the old panel did. Both points are recorded as the owner's decision in the review document's section 6.</li>''')
# 2.8 My Status / Tasks: confirmed wording already in the table; strengthen the bullet
subx('''              <li><b>Main Content Tasks</b>: tiles are the tasks the user holds, so the destination right is checked before the tile shows. My Tasks may list only tasks the user holds.</li>''',
     '''              <li><b>Main Content Tasks</b>: tiles are the tasks the user holds, so the destination right is checked before the tile shows. My Tasks may list only tasks the user holds. This is the model every other outbound link now follows (owner, 19 October 2026).</li>''')
# section 4: decisions
subx('''            <h3>Decided (owner, 19 October 2026)</h3>
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
            </ul>''',
     '''            <h3>Decided (owner, 19 October 2026)</h3>
            <ul class="spec-ul">
              <li><b>Financial KPI</b> is shown with the General Ledger Dashboard right, like Budget Compared to Actual. No task of its own.</li>
              <li><b>My Status and Main Content Tasks</b> are carried as today: My Status offers a query only when the user holds that query's module right, and Main Content Tasks shows a tile only when the user holds the tile's task. Neither has a module right of its own.</li>
              <li><b>Purchasing Management</b> keeps the original panel's list rule, Admin shortcut included; Approve, Hold and Reject follow the request page's rule.</li>
              <li><b>Payroll Scheduled Time Off</b> keeps the original panel's behaviour: a user with no employee record sees every department, and Approve and Undo need the widget's right only.</li>
              <li><b>Links out of a widget</b>: a link from a widget to a page in another module the user does not hold is not shown, as Main Content Tasks does. Confirmed.</li>
            </ul>
            <h3>Still open</h3>
            <ul class="spec-ul">
              <li>Payroll Distributions: whether Secure employees are excluded from the Employee Break Down and the export for users without <code>/Payroll/Secure/Employee</code>.</li>
            </ul>''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("index.html: rulings applied; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))

# ---------- the review document ----------
D = os.path.join(ROOT, "docs", "handover", "Widget permissions - the old system and the V2 recommendation (draft).md")
t = open(D, "rb").read().decode("utf-8"); nl = "\r\n" if t.count("\r\n") > t.count("\n") // 2 else "\n"; t = t.replace("\r\n", "\n")


def dsub(o, n):
    global t
    assert t.count(o) == 1, ("count", t.count(o), o[:80]); t = t.replace(o, n)


dsub('''**Two decisions for the owner**: (1) drop the panel's **Admin** shortcut from the list rule (the request page
never uses it), or keep it for parity; (2) whether Approval Override should also unlock Approve and Reject in
the pop-up (as the page) or only widen the list (as the panel). Recommendation: follow the page on both.''',
     '''**Owner's ruling, 19 October 2026: keep the same as the original panel.** The list rule is the panel's,
Admin shortcut included (a request whose path has no users, or the user is a path user, or the user is an
Admin, or holds Approval Override at Update). Approve, Hold and Reject follow the request page's rule, the only
rule the old system has for acting: on the path at the acting level, or Approval Override at Update, for
Approve and Reject; on the path for Hold.''')
dsub('''| A user who is not an employee | decisions page Q21: option A keeps the old behaviour (every department); option B shows the empty state. **Owner's ruling to be written in here.** | per the ruling |
| Approve, Undo | the same URI at **Update** (the old panel did not check this; V2 should) | buttons absent, queue read-only |''',
     '''| A user who is not an employee | **Owner's ruling, 19 October 2026: keep the old behaviour**; every department is listed, as the panel does | n/a |
| Approve, Undo | **Owner's ruling, 19 October 2026: keep the old behaviour**; the widget's right only, no separate Update check | n/a |''')
dsub('''1. Time-off approvals saved with no Update check (section 4).
2. A non-employee with the time-off right sees the whole company (section 4; ruled by Q21).''',
     '''1. Time-off approvals saved with no Update check (section 4). **Owner's ruling, 19 October 2026: kept as the
   original; no Update check in V2 either.**
2. A non-employee with the time-off right sees the whole company (section 4). **Owner's ruling, 19 October
   2026: kept as the original.**''')
dsub('''**Still open, information supplied 19 October 2026 (see the session notes)**

3. Purchasing Management: drop the old panel's Admin shortcut and follow the request page's rule
   (recommended), or keep parity with the panel's list rule. Section 3.
4. Payroll Scheduled Time Off: the rule for a user with no employee record (Q21), and the new Update check on
   Approve and Undo. Section 4.
5. Payroll Distributions: whether Secure employees are excluded from the Employee Break Down for users without
   `/Payroll/Secure/Employee`.
6. Links out of a widget: shown only with the destination page's right (section 5.2), as Main Content Tasks
   does today, rather than letting the destination refuse the user as the old Purchasing pencil did.
   Recommended.''',
     '''3. Purchasing Management keeps the original panel's list rule, Admin shortcut included; Approve, Hold and
   Reject follow the request page's rule. Section 3.
4. Payroll Scheduled Time Off keeps the original panel's behaviour: a user with no employee record sees every
   department, and Approve and Undo need the widget's right only, with no separate Update check. Section 4.
5. Links out of a widget: a link from a widget in one module to a page in another module the user does not
   hold is not shown, as Main Content Tasks does today (section 5.2). Confirmed.

**Still open**

6. Payroll Distributions: whether Secure employees are excluded from the Employee Break Down for users without
   `/Payroll/Secure/Employee`.''')
open(D, "wb").write(t.replace("\n", nl).encode("utf-8")); print("review document: rulings written in")
