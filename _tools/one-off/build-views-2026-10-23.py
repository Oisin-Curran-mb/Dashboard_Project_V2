# The owner's answers of 22 Oct 2026 (open points Q44 to Q58, A17 to A30) written into the Permissions
# and Dashboards views, and the full bank account number taken out of Bank Balances (Q56).
# Plan: "Step 7 - Version 2\Plan - index.html views and Bank Balances numbers after the 22 Oct answers (2026-10-22).md".
# Owner's go, 23 Oct 2026: Deposits on Hand left as it is; Statistics screenshot shot now; plain
# "Settled 22 October" wording. Byte-safe, CRLF kept. Run: python -I <this file>
import re, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s
MISSING = []

def subx(o, n):
    """replace exactly one occurrence; both sides written with \n, converted to CRLF"""
    global s
    o2 = o.replace("\r\n", "\n").replace("\n", "\r\n"); n2 = n.replace("\r\n", "\n").replace("\n", "\r\n")
    c = s.count(o2)
    if c != 1: MISSING.append((c, o[:110])); return
    s = s.replace(o2, n2)

# ---------------------------------------------------------------- Permissions view
# P1 placed widget whose right is later removed (Q47)
subx('A user without the module right is not offered the widget, so no "no access" face is needed. The API enforces the same test; what the dashboard hides is presentation.</p>',
     'A user without the module right is not offered the widget, so no "no access" face is needed. A widget already on a saved dashboard whose right is later removed is dropped from that dashboard the next time it loads, as if the user never had it (owner, 22 October, Q47). The API enforces the same test; what the dashboard hides is presentation.</p>')
# P2 table row (Q44)
subx('<tr><td><b>Payroll Scheduled Time Off</b></td><td>Payroll</td><td><code>/Payroll</code></td></tr>',
     '<tr><td><b>Payroll Scheduled Time Off</b></td><td>Payroll</td><td><code>/Payroll/EmployeeInformation/SecureTimeOffHoursTab</code> (the Time Off Hours task, as the old panel; owner, 22 October, Q44)</td></tr>')
# P3 the departure paragraph (Q44)
subx('<p>One departure from the old system, by this rule: the old Payroll Scheduled Time Off panel tested a separate task (<code>/Payroll/EmployeeInformation/SecureTimeOffHoursTab</code>); here it follows the Payroll Dashboard right like every other widget, and its Approve and Undo actions carry the extra check (2.5).</p>',
     '<p>The one exception, kept from the old system: Payroll Scheduled Time Off is shown on the <b>Time Off Hours</b> task (<code>/Payroll/EmployeeInformation/SecureTimeOffHoursTab</code>), not the Payroll Dashboard row, so a user with the Payroll row alone sees Payroll Distributions but not Time Off. Its Approve and Undo need that right only (2.5). Owner\'s ruling, 22 October (Q44), reversing the 16 October draft.</p>')
# P4 Purchasing: Admins, emails, log (Q48, Q52, Q53)
subx('Approve, Hold and Reject keep the request page\'s rule above, the only rule the old system has for acting.</li>',
     'Approve, Hold and Reject keep the request page\'s rule above, the only rule the old system has for acting.</li>\n'
     '              <li><b>Admins</b>: the Requests page tests the Approval Override right, not the Admin flag, and an Admin user holds every task at Update, so an Admin may approve or reject any level from the dashboard exactly as on the Requests page (owner, 22 October, Q48).</li>\n'
     '              <li><b>Emails and the activity log</b> (owner, 22 October, Q52 and Q53): acting from the dashboard sends the same emails as the Requests screen, to the next approver, the creator and, on final approval of a purchase order, the vendor, each under its company setting; nothing new is invented. The pop-up\'s activity log shows the acted approval rows: date, approver, Approved / On hold / Rejected and the reason; Shelby keeps each approver\'s latest action only.</li>')
# P5 Bank: masked numbers (Q56)
subx('<li>Plus the General Ledger <b>account roles</b>: a user may hold the page right and still be refused an account they may not see. The API applies the account filter to the list and to the link.</li>',
     '<li>Plus the General Ledger <b>account roles</b>: a user may hold the page right and still be refused an account they may not see. The API applies the account filter to the list and to the link.</li>\n'
     '              <li><b>Account numbers</b> (owner, 22 October, Q56): the row tooltip and the account picker show the masked number only (••4021), as the rows do. Shelby stores the bank account number encrypted and the bank page shows it only behind a secure right at Full Rights; the dashboard shows no more than that page does.</li>')
# P6 loan figure caption (A20)
subx('<figure class="spec-fig"><img src="docs/Pics/Permissions/loans-popup.png" alt="Loans With Balance Due, the loan detail: Open loan leaves the widget (destination route still to confirm)." loading="lazy"><figcaption>Loans With Balance Due, the loan detail: Open loan leaves the widget (destination route still to confirm).</figcaption></figure>',
     '<figure class="spec-fig"><img src="docs/Pics/Permissions/loans-popup.png" alt="Loans With Balance Due, the loan detail: Open loan leaves the widget (Loan Processing, Loan Information, Update for that loan; A20, 22 October)." loading="lazy"><figcaption>Loans With Balance Due, the loan detail: Open loan leaves the widget (Loan Processing, Loan Information, Update for that loan; A20, 22 October).</figcaption></figure>')
# P7 the three routes (A20, A21, A23)
subx('<li><b>Open in Gifts and Pledges</b>: <code>/DonorsAndGifts/Pledges</code> at Inquiry. <b>Open in Remittance</b>: the Remittance pledge page at Inquiry (route to confirm). <b>Open loan</b>: <code>/LoanProcessing/LoanInformation</code> at Inquiry (route to confirm).</li>',
     '<li><b>Open in Gifts and Pledges</b>: <code>/DonorsAndGifts/Purposes</code> at Inquiry, the purpose\'s own record (Q39; A23, 22 October). <b>Open in Remittance</b>: Remittance, Pledges, the pledge list, at Inquiry (A21, 22 October). <b>Open loan</b>: <code>/LoanProcessing/LoanInformation</code> at Inquiry, the Update page for that loan (A20, 22 October).</li>')
# P8 Payroll task-role caption (Q44), alt and figcaption
old8 = 'Time Off Hours is the task the old panel tested; by the rule above, V2 uses the Payroll Dashboard row and keeps the Update check on Approve and Undo.'
new8 = 'Time Off Hours is the task the old panel tested; V2 tests the same task, and Approve and Undo need no further check (owner, 22 October, Q44).'
c8 = s.count(old8)
if c8 != 2: MISSING.append((c8, old8[:110]))
else: s = s.replace(old8, new8)
# P9 Budget account roles (Q45)
subx('<li><b>Special report</b> lines: <code>/GeneralLedger/Reports/SpecialReports</code> at Inquiry, as the old panel required. Income and expense accounts need only the module right.</li>',
     '<li><b>Special report</b> lines: <code>/GeneralLedger/Reports/SpecialReports</code> at Inquiry, as the old panel required. Income and expense accounts need only the module right.</li>\n'
     '              <li><b>Account roles</b> (owner, 22 October, Q45): the totals, chart and tiles cover only the general ledger accounts the user\'s Account Rights Roles allow, as the old panel did; the Financial KPI band follows the same roles. The API keeps the filter.</li>')
# P10 2.9 No link or action (Q20, Q46, Q28, Q45)
subx('<p>Pension Plans, Insurance Billing Plans, Deposits on Hand, Receivable Invoices Outstanding, Fixed Asset Values and the Financial KPI band have no control that leaves the widget today. Where one is added later (open account, open invoice, open asset), it follows the same rule with the destination page\'s right.</p>',
     '<p>Pension Plans, Insurance Billing Plans, Deposits on Hand, Receivable Invoices Outstanding, Fixed Asset Values and the Financial KPI band have no control that leaves the widget today. The three that will are decided (22 October): Open account opens Deposits On Hand, Account Information for that account (Q20, A21); Open invoice opens the posted invoice read-only in Accounts Receivable, Transaction Inquiry (Q46); Open asset opens Fixed Assets, Asset Information (Q28). Each follows the rule above with the destination page\'s right and the pop-up in 2.10. The Financial KPI band follows the user\'s Account Rights Roles, as Budget Compared to Actual (Q45).</p>')
# P11 routes confirmed (A20 to A23, Q46)
subx('<li><b>Routes to confirm with Value Labs</b>: the Remittance pledge page, the deposit account page, the loan page and the AR invoice page, so the right tested is the one the page really checks.</li>',
     '<li><b>Routes confirmed 22 October</b> (A20 to A23, Q46): Remittance, Pledges; Deposits On Hand, Account Information, Update; Loan Processing, Loan Information, Update; Accounts Receivable, Transaction Inquiry, Invoice; Accounts Payable, Transaction Inquiry, Details; Donors And Gifts, Purposes, Update. Each tests the right of the exact page it opens.</li>')
# P12 decision 5, stale against the 19 October rule
subx('<li><b>Links out of a widget</b>: a link from a widget to a page in another module the user does not hold is not shown, as Main Content Tasks does. Confirmed.</li>',
     '<li><b>Links out of a widget</b>: always shown; a click by a user who does not hold the destination page\'s right opens the no-permission pop-up naming the page (2.10). Revised 19 October from hiding the link.</li>')
# P13 nothing is open -> settled and open lists
subx('<p>Nothing is open. Every widget works from the one simple right, its module\'s Dashboard row; the only further checks are the links and actions in section 2.</p>',
     '<p>Settled 22 October, the owner\'s answers to the open points: Budget Compared to Actual and the Financial KPI band follow the user\'s Account Rights Roles (Q45); a placed widget whose right is removed is dropped from the dashboard (Q47); Admins act as holders of Approval Override, the dashboard sends the Requests screen\'s emails under the company\'s settings, and the activity log shows the acted approval rows (Q48, Q52, Q53); override acts on the level whose turn it is, and Hold is open to anyone on the path with an open row (A24, A25); Payroll Scheduled Time Off is shown and approved on the Time Off Hours task (Q44); Bank Balances shows masked account numbers (Q56); the six link routes in section 3 (A20 to A23, Q46).</p>\n'
     '            <p>Open after 22 October: the right that shows Pending Actions (Q49, with Aditya Bhaskarrao Lakhmapure, whose widget it is); the wording of the two Payroll Scheduled Time Off empty messages (Q55); where the empty-state Add buttons go (A27). Everything else works from the one simple right, its module\'s Dashboard row; the only further checks are the links and actions in section 2.</p>')

# ---------------------------------------------------------------- Dashboards view
# D1 lead
subx('Every proposed default is the Detail size. The screenshots are full pages, not widget crops.</p>',
     'Every proposed default is the Detail size. The screenshots are full pages, not widget crops. Updated 22 October 2026 with the owner\'s answers (Q50, Q51, A26, A30; Q49 stays open).</p>')
# D2 per-module split decided (Q50)
subx('When the per-module split happens (still to be decided below) each dashboard takes its own module\'s name the same way,',
     'When the per-module split happens (decided 22 October: one dashboard per module, each with its own saved preference; Q50) each dashboard takes its own module\'s name the same way,')
# D3 Home confirmed (A30)
subx('Bank Balances; Pending Actions once; then Main Content Tasks last. Owner\'s ruling, 19 October.</b></td></tr></tbody></table>',
     'Bank Balances; Pending Actions once; then Main Content Tasks last. Owner\'s ruling, 19 October; confirmed 22 October (A30).</b></td></tr></tbody></table>')
# D4 Payroll row (A26)
subx('<tr><td>Proposed default</td><td><b>Payroll Distributions at Detail. Payroll Scheduled Time Off is available but not the default, then Main Content Tasks at Detail as the last item.</b></td></tr>',
     '<tr><td>Proposed default</td><td><b>Payroll Distributions at Detail, then Main Content Tasks at Detail as the last item.</b> Owner, 22 October (A26). Payroll Scheduled Time Off is available but not the default.</td></tr>')
# D5 Statistics table and paragraph, plus the V2 figure (Q51)
subx('<tr><td>V2 widgets</td><td><b>None.</b></td></tr><tr><td>Proposed default</td><td><b>Nothing to propose.</b></td></tr></tbody></table>',
     '<tr><td>V2 widgets</td><td><b>My Status</b>, <b>Main Content Tasks</b>: none of its own, the two shared widgets</td></tr><tr><td>Proposed default</td><td><b>My Status at Detail and Main Content Tasks at Detail, like Records.</b> Owner\'s ruling, 22 October (Q51).</td></tr></tbody></table>')
subx('<p>No widget in either version, so there is nothing to show; on test1 the URL redirects to the home page. The legacy panel rendered the literal word STATS: its grid and chart are commented out and it still references the Accounts Payable record type it was copied from. Needs a ruling: does Statistics get a dashboard at all?</p>',
     '<p>No widget of its own in either version; on test1 the URL redirects to the home page, so there is no old-system screenshot. The legacy panel rendered the literal word STATS: its grid and chart are commented out and it still references the Accounts Payable record type it was copied from. Settled 22 October (Q51): Statistics takes the two shared widgets, My Status and Main Content Tasks, like Records, once V2 serves a Statistics page.</p>\n'
     '            <p><b>V2</b>, this build, with only this page\'s widgets, at Detail.</p>\n'
     '            <figure class="spec-fig"><a href="docs/Pics/Modules/Statistics/Statistics%20-%20V2.png" target="_blank" rel="noopener" title="Open this screenshot at full size"><img src="docs/Pics/Modules/Statistics/Statistics%20-%20V2.png" alt="Statistics, Version 2: a full-page screenshot of the dashboard with only this page\'s widgets, My Status and Main Content Tasks, at Detail size." loading="lazy"></a></figure>')
# D6 the decision list
subx('<li><b>One dashboard per module, or one that follows the module in the navigation?</b> Everything else depends on this. The single dashboard is already named Accounts Payable to match the navigation.</li>',
     '<li><b>One dashboard per module, or one that follows the module in the navigation?</b> Settled 22 October (Q50): one per module, each with its own saved preference.</li>')
subx('<li><b>What the home page (the root URL) opens with</b> when no module is chosen.</li>',
     '<li><b>What the home page (the root URL) opens with.</b> Settled 19 October, confirmed 22 October (A30): see section 5.</li>')
subx('<li><b>Does Statistics get a dashboard?</b> Records is settled; Statistics is not.</li>',
     '<li><b>Does Statistics get a dashboard?</b> Settled 22 October (Q51): My Status and Main Content Tasks, like Records.</li>')
subx('<li><b>Pending Actions needs a row in the Permissions view\'s widget table.</b> It is the only widget without one.</li>',
     '<li><b>Pending Actions needs a row in the Permissions view\'s widget table.</b> Still open: the owner settles it with Aditya Bhaskarrao Lakhmapure, whose widget it is (22 October, Q49).</li>')
subx('<p>Settled on 19 October: Quick Links is retired, Records shows Main Content Tasks and My Status, every default is the Detail size, the dashboard is named for its module, and the user\'s selection must be saved.</p>',
     '<p>Settled on 19 October: Quick Links is retired, Records shows Main Content Tasks and My Status, every default is the Detail size, the dashboard is named for its module, and the user\'s selection must be saved.</p>\n'
     '            <p>Settled on 22 October: one dashboard per module with its own saved preference (Q50); Statistics takes My Status and Main Content Tasks (Q51); Payroll\'s dashboard ends with Main Content Tasks (A26); Home as ruled on 19 October (A30).</p>')

# ---------------------------------------------------------------- Bank Balances (Q56)
# B1 row tooltip
subx("      var tip=aesc+', Account '+(a.acctFull||a.acct)+(neg?'. This account is overdrawn.':'');",
     "      var tip=aesc+', Account '+a.acct+(neg?'. This account is overdrawn.':'');")
# B2 the bank account picker (the bank-set-acct list; the Deposits on Hand picker above it is left as it is)
pk_old = '<span class="mi-nm-stack"><span class="mi-nm">\'+a.name+\'</span><span class="mi-acctno">\'+(a.acctFull||a.acct)+\'</span></span><span class="bank-mi-bal\''
pk_new = '<span class="mi-nm-stack"><span class="mi-nm">\'+a.name+\'</span><span class="mi-acctno">\'+a.acct+\'</span></span><span class="bank-mi-bal\''
subx(pk_old, pk_new)
# B3 fixtures: drop acctFull from the 26 bank rows and the two data-state generators
lines = s.split("\r\n")
bank_rows = 0
for i, l in enumerate(lines):
    if re.match(r'^   \{id:"bk-', l) and 'acctFull:"' in l:
        lines[i] = re.sub(r', acctFull:"\d+"', '', l); bank_rows += 1
if bank_rows != 26: MISSING.append((bank_rows, "bank fixture rows with acctFull (want 26)"))
s = "\r\n".join(lines)
subx('acct: "••4021", acctFull: "0044174021", a: [380000, 210500, 1200, -142300, -21400, 39500] }]; },',
     'acct: "••4021", a: [380000, 210500, 1200, -142300, -21400, 39500] }]; },')
subx('acct: "••" + last4, acctFull: "00441" + pad(Math.floor(r() * 100000), 5) + last4.slice(0, 1), a: a }); } return out; }',
     'acct: "••" + last4, a: a }); } return out; }')

if MISSING:
    for m in MISSING: print("MISSING", m)
    sys.exit(1)

# ---------------------------------------------------------------- checks before writing
perm0 = s.index('id="permView"'); perm1 = s.index('id="dash-open"')
seg = s[perm0:perm1 + 4000]
assert "—" not in s[perm0 - 200: perm1 + 6000], "em dash introduced in the views"
assert "→" not in s[perm0:perm1], "arrow introduced in the permissions text"
CRLF = chr(13) + chr(10)
bank0 = s.index('{id:"bk-op"'); bank1 = s.index('{id:"bk-spe"'); bank1 = s.index(CRLF, bank1)
assert "acctFull" not in s[bank0:bank1], "acctFull still in the bank fixtures"
assert "', Account '+a.acct+(neg?'. This account is overdrawn.':'')" in s, "bank row tooltip not masked"
assert pk_new in s, "bank picker not masked"
# what is left of acctFull belongs to Deposits on Hand (left as it is, owner 23 Oct) and the shell's old deposits helpers
left = [l for l in s.split(CRLF) if "acctFull" in l]
assert not any(l.startswith('   {id:"bk-') or 'bank-mi-bal' in l or "This account is overdrawn" in l for l in left), left
assert '"bank-set-acct"' in s
assert "\r\r\n" not in s
open(P, "wb").write(s.encode("utf-8"))
print("index.html updated:", len(s.split("\r\n")), "lines;", bank_rows, "bank fixture rows cleaned")
