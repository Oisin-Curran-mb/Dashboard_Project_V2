# Owner's ruling on the last open permissions item, 19 Oct 2026: Payroll Distributions is all or nothing.
# The Payroll Dashboard right shows the widget and everything in it, the Employee Break Down pop-up and the
# export included; no Secure-employee exclusion. Feedback is awaited on whether the pop-up should ever be hidden.
# Byte-safe. Run: python -I <this file>
import re, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"

P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def subx(o, n):
    global s
    o2 = o.replace("\r\n", "\n").replace("\n", "\r\n"); n2 = n.replace("\r\n", "\n").replace("\n", "\r\n")
    assert s.count(o2) == 1, ("count", s.count(o2), o[:80]); s = s.replace(o2, n2)


subx('''              <li><b>Export to Excel</b>: the employee rows follow the Payroll Dashboard right exactly as the Employee Break Down does; a user without it gets the file without those rows. Whether Secure employees are excluded is an open decision.</li>''',
     '''              <li><b>Decided by the owner, 19 October 2026: all or nothing.</b> A user who holds the Payroll Dashboard right sees the widget, the Employee Break Down pop-up and the Excel export in full; nothing inside the widget needs a further right and Secure employees are not excluded. Whether the pop-up should ever be hidden for some users waits on feedback; until then the one simple right governs everything.</li>''')
subx('''              <li><b>Links out of a widget</b>: a link from a widget to a page in another module the user does not hold is not shown, as Main Content Tasks does. Confirmed.</li>
            </ul>
            <h3>Still open</h3>
            <ul class="spec-ul">
              <li>Payroll Distributions: whether Secure employees are excluded from the Employee Break Down and the export for users without <code>/Payroll/Secure/Employee</code>.</li>
            </ul>''',
     '''              <li><b>Links out of a widget</b>: a link from a widget to a page in another module the user does not hold is not shown, as Main Content Tasks does. Confirmed.</li>
              <li><b>Payroll Distributions</b> is all or nothing: the Payroll Dashboard right shows the widget, its Employee Break Down pop-up and its export in full; Secure employees are not excluded. Whether the pop-up should ever be hidden waits on feedback.</li>
            </ul>
            <p>Nothing is open. Every widget works from the one simple right, its module's Dashboard row; the only further checks are the links and actions in section 2.</p>''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("index.html: ruling applied; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))

D = os.path.join(ROOT, "docs", "handover", "Widget permissions - the old system and the V2 recommendation (draft).md")
t = open(D, "rb").read().decode("utf-8"); nl = "\r\n" if t.count("\r\n") > t.count("\n") // 2 else "\n"; t = t.replace("\r\n", "\n")


def dsub(o, n):
    global t
    assert t.count(o) == 1, ("count", t.count(o), o[:80]); t = t.replace(o, n)


dsub("| Payroll Distributions | Payroll | `/Payroll` | Employee Break Down and export: same right (Q7) | Secure employees: open |",
     "| Payroll Distributions | Payroll | `/Payroll` | Employee Break Down and export: the same right, nothing further (decided 19 Oct 2026) | none; Secure employees included |")
dsub('''4. Payroll Distributions includes Secure employees' pay in its totals with no check (section 2.3).''',
     '''4. Payroll Distributions includes Secure employees' pay in its totals with no check (section 2.3). **Owner's
   ruling, 19 October 2026: all or nothing; the Payroll Dashboard right shows the widget, the Employee Break
   Down pop-up and the export in full. Whether the pop-up should ever be hidden waits on feedback.**''')
dsub('''**Still open**

6. Payroll Distributions: whether Secure employees are excluded from the Employee Break Down for users without
   `/Payroll/Secure/Employee`.''',
     '''6. Payroll Distributions is all or nothing: a user who holds the Payroll Dashboard right sees the widget,
   the Employee Break Down pop-up and the Excel export in full; Secure employees are not excluded and nothing
   inside the widget needs a further right. Whether the pop-up should ever be hidden for some users waits on
   feedback.

Nothing is open. Every widget works from the one simple right, its module's Dashboard row; the only further
checks are the links and actions in section 5.''')
open(D, "wb").write(t.replace("\n", nl).encode("utf-8")); print("review document: ruling written in")
