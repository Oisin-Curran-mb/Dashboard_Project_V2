# Permissions view: under each links-and-actions section, the old Task Role editor's task tree for that module,
# captured from the test1 host on 17 Oct 2026 (Security Setup, Task Roles, Update), so the reader sees where the
# named right lives. Also extends the spec driver's picture list. Byte-safe. Run: python -I <this file>
import re, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"
P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


def fig(name, cap):
    return '            <figure class="spec-fig"><img src="docs/Pics/Permissions/' + name + '.png" alt="' + cap.replace('"', "&quot;") + '" loading="lazy"><figcaption>' + cap + '</figcaption></figure>\n'


# each insertion goes right after the section's existing <ul class="spec-ul">...</ul>, anchored on a unique line inside it
INS = [
    ('''              <li>Account roles can refuse an order the page right would allow; the API marks each request openable or not.</li>\r\n            </ul>\r\n''',
     fig("taskrole-purchasing", "Old Task Role editor, Purchasing Management: the Dashboard row, then Request Information with Enter &amp; Manage (the request page) and Approval Override, and Modify with Approval Paths.")),
    ('''              <li><b>Schedule payment</b>, when built: two gates, the AvidPay feature flag on the tenant <b>and</b> <code>/AccountsPayable/PaymentProcessing</code> at Update. Show a note for the flag, hide for the right.</li>\r\n            </ul>\r\n''',
     fig("taskrole-payables", "Old Task Role editor, Accounts Payable: the Dashboard row; Payment Processing with Enter &amp; Manage and Process; View with Transaction Inquiry and its sub-rows.")),
    ('''              <li>Plus the General Ledger <b>account roles</b>: a user may hold the page right and still be refused an account they may not see. The API applies the account filter to the list and to the link.</li>\r\n            </ul>\r\n''',
     fig("taskrole-bank", "Old Task Role editor, Bank Account Management: the Dashboard row, Transactions, Bank Statements and View; Bank Account Information sits under Modify further down the same tree.")),
    ('''              <li><b>Exports</b> are data, not pages: they follow the widget's own right.</li>\r\n            </ul>\r\n''',
     fig("taskrole-gifts", "Old Task Role editor, Donors And Gifts: the root row carries the module's name instead of Dashboard; Manage holds Pledges with both boxes.") +
     fig("taskrole-remittance", "Old Task Role editor, Remittance: the Dashboard row; Manage holds Enter &amp; Manage Pledges, the page behind Open in Remittance.") +
     fig("taskrole-loans", "Old Task Role editor, Loan Processing: the Dashboard row; Modify holds Loan Information, the page behind Open loan.")),
    ('''              <li>The rows a user sees are the employees whose home department is in the user's approval departments. The old panel showed every department to a user with no employee record; V2 must not.</li>\r\n            </ul>\r\n''',
     fig("taskrole-payroll", "Old Task Role editor, Payroll: Modify, Employee Information, with Secured Employees and Time Off Hours as separate rows. Time Off Hours is the task the old panel tested; by the rule above, V2 uses the Payroll Dashboard row and keeps the Update check on Approve and Undo.")),
    ('''              <li><b>Special report</b> lines: <code>/GeneralLedger/Reports/SpecialReports</code> at Inquiry, as the old panel required. Income and expense accounts need only the module right.</li>\r\n            </ul>\r\n''',
     fig("taskrole-generalledger", "Old Task Role editor, General Ledger: Reports holds Special Reports, the right the Special report option needs.")),
]
for anchor, f in INS:
    sub1(anchor, anchor + f)
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("index.html: task-tree figures added; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)), "| figures now:", s.count('class="spec-fig"'))

D = os.path.join(ROOT, "_tools", "shell-spec.driver.js")
t = open(D, "rb").read().decode("utf-8")
o = 'const PICS = ["taskrole-dashboard-row", "purchasing-popup",'; assert t.count(o) == 1
t = t.replace(o, 'const PICS = ["taskrole-dashboard-row", "taskrole-purchasing", "taskrole-payables", "taskrole-bank", "taskrole-gifts", "taskrole-remittance", "taskrole-loans", "taskrole-payroll", "taskrole-generalledger", "purchasing-popup",')
open(D, "wb").write(t.encode("utf-8")); print("driver: picture list extended")
