# The third view: Demo | Spec | Permissions (owner, 16 Oct 2026). A document section like the Spec one that
# condenses docs/handover/Widget permissions - the old system and the V2 recommendation (draft).md:
# every widget shows with its module's Dashboard right; more care only for links and actions, each with a picture.
# Pictures: docs/Pics/Permissions/*.png (captured from this build in headless Chrome).
# Byte-safe. Run: python -I <this file>
import re, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"
P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


# ---------- 1. toggle: third tab ----------
sub1('''      <button class="vtb" data-action="view-spec" role="tab" aria-selected="false">Spec</button>\r
    </div>''',
'''      <button class="vtb" data-action="view-spec" role="tab" aria-selected="false">Spec</button>
      <button class="vtb" data-action="view-perm" role="tab" aria-selected="false">Permissions</button>
    </div>''')

# ---------- 2. CSS: figures, inside the spec region ----------
sub1('''  .spec-tbl td b{color:var(--txt-primary);}\r
  /* ===== end Shell: Demo / Spec view toggle + spec document ===== */''',
'''  .spec-tbl td b{color:var(--txt-primary);}
  /* Permissions view (16 Oct 2026): a picture of each link or action that needs more care than the module right */
  .spec-fig{margin:10px 0 14px;border:1px solid var(--stroke-widget);border-radius:10px;overflow:hidden;background:var(--wn-100);}
  .spec-fig img{display:block;max-width:100%;height:auto;}
  .spec-fig figcaption{font-size:12px;line-height:1.5;color:var(--txt-subtle);padding:8px 12px;border-top:1px solid var(--stroke-widget);}
  .spec-rule{font-size:13.5px;line-height:1.6;color:var(--txt-primary);background:var(--brand-10);border:1px solid var(--brand-100);border-radius:10px;padding:12px 14px;margin:10px 0 14px;max-width:76ch;}
  /* ===== end Shell: Demo / Spec view toggle + spec document ===== */''')

# ---------- 3. the document ----------
IMG = "docs/Pics/Permissions/"


def fig(name, cap):
    return '<figure class="spec-fig"><img src="' + IMG + name + '.png" alt="' + cap.replace('"', "&quot;") + '" loading="lazy"><figcaption>' + cap + '</figcaption></figure>'


SHOW = [
    ("Budget Compared to Actual", "General Ledger", "/GeneralLedger"), ("Pension Plans", "Pension Billing", "/PensionBilling"),
    ("Payroll Distributions", "Payroll", "/Payroll"), ("Remittance Pledges", "Remittance", "/Remittance"),
    ("Receivable Invoices Outstanding", "Accounts Receivable", "/AccountsReceivable"), ("Insurance Billing Plans", "Insurance Billing", "/InsuranceBilling"),
    ("Deposits on Hand", "Deposits On Hand", "/DepositsOnHand"), ("My Status", "none: each query carries its own module right", "always offered"),
    ("Payroll Scheduled Time Off", "Payroll", "/Payroll"), ("Loans With Balance Due", "Loan Processing", "/LoanProcessing"),
    ("Fixed Asset Values", "Fixed Assets", "/FixedAssets"), ("Purchasing Management", "Purchasing Management", "/PurchasingManagement"),
    ("Main Content Tasks", "none: each tile carries its own task", "always offered"), ("Bank Balances", "Bank Account Management", "/BankAccountManagement"),
    ("Accounts Payable By Due Date", "Accounts Payable", "/AccountsPayable"), ("Gifts Pledges", "Donors And Gifts", "/DonorsAndGifts"),
    ("Financial KPI", "General Ledger (new in V2; proposed)", "/GeneralLedger"),
]
show_rows = "".join('<tr><td><b>%s</b></td><td>%s</td><td><code>%s</code></td></tr>' % r for r in SHOW)

DOC = '''
        <section class="spec" id="permView" hidden aria-label="Widget permissions">
          <header class="spec-hd">
            <h1 class="spec-title">Accounting Dashboard, Widget Permissions (Version 2)</h1>
            <p class="spec-lead">Which Task Role right shows each widget, and where a link or an action inside a widget needs a further check. Condensed from the review document; the full text, with the legacy code references, is linked below.</p>
            <div class="spec-links">
              <a class="spec-link" href="docs/handover/Widget%20permissions%20-%20the%20old%20system%20and%20the%20V2%20recommendation%20(draft).md" target="_blank" rel="noopener"><span class="material-symbols-rounded">description</span>Full review document (Markdown)</a>
            </div>
          </header>

          <div class="spec-sec" id="perm-rule">
            <h2>1. The rule: the module's Dashboard right shows the widget</h2>
            <div class="spec-rule">Every widget is offered when the user holds its module's <b>Dashboard</b> row in the Task Role editor, which is the module's root task (the bare module URI, such as <code>/Payroll</code>) at Inquiry. That is exactly how the old dashboard decided which panels a user could add. No widget needs a right of its own. Further checks exist only for the <b>links and actions</b> in section 2.</div>
            <p>Rights are an exact match on a page URI: holding <code>/Payroll</code> grants the Payroll Dashboard and nothing else. A user without the module right is not offered the widget, so no "no access" face is needed. The API enforces the same test; what the dashboard hides is presentation.</p>
            <table class="spec-tbl"><thead><tr><th>Widget</th><th>Module</th><th>Right to show it (Inquiry)</th></tr></thead><tbody>''' + show_rows + '''</tbody></table>
            <p>One departure from the old system, by this rule: the old Payroll Scheduled Time Off panel tested a separate task (<code>/Payroll/EmployeeInformation/SecureTimeOffHoursTab</code>); here it follows the Payroll Dashboard right like every other widget, and its Approve and Undo actions carry the extra check (2.5).</p>
          </div>

          <div class="spec-sec" id="perm-care">
            <h2>2. Where more care is needed: links and actions</h2>
            <p>The standing rule for every control below: <b>show it only when the user holds the destination page's right</b> (or the action's right); otherwise the control is absent. Never rely on the destination page refusing the user after the click, which is what the old Purchasing pencil and My Status jump did. The API serving the widget returns, per record, whether the current user may open or act on it, so the widget never reads the rights table.</p>

            <h3>2.1 Purchasing Management</h3>
            ''' + fig("purchasing-popup", "The request pop-up: Approve, Hold and Reject are actions; Open request and each attachment leave the widget.") + '''
            <ul class="spec-ul">
              <li><b>Approve, Reject</b>: the user is on the request's approval path at the level now acting, or holds <code>/PurchasingManagement/Requests/ApprovalOverride</code> at Update. <b>Hold</b>: the user is on the path. These are API actions; the API refuses, hiding the button is presentation.</li>
              <li><b>Open request</b> and <b>attachments</b>: <code>/PurchasingManagement/Requests/Update</code> at Inquiry. The widget's own right does not include this page.</li>
              <li>Account roles can refuse an order the page right would allow; the API marks each request openable or not.</li>
            </ul>

            <h3>2.2 Accounts Payable By Due Date</h3>
            ''' + fig("payables-invoice", "The invoice pop-up: Open in Accounts Payable leaves the widget. Schedule payment (Jo's version, not yet built) would sit beside it.") + '''
            <ul class="spec-ul">
              <li><b>Open in Accounts Payable</b>: <code>/AccountsPayable/TransactionInquiry</code> at Inquiry.</li>
              <li><b>Schedule payment</b>, when built: two gates, the AvidPay feature flag on the tenant <b>and</b> <code>/AccountsPayable/PaymentProcessing</code> at Update. Show a note for the flag, hide for the right.</li>
            </ul>

            <h3>2.3 Bank Balances</h3>
            ''' + fig("bank-drill", "The account drill: Open in Bank leaves the widget.") + '''
            <ul class="spec-ul">
              <li><b>Open in Bank</b>: <code>/BankAccountManagement/BankAccountInformation</code> at Inquiry.</li>
              <li>Plus the General Ledger <b>account roles</b>: a user may hold the page right and still be refused an account they may not see. The API applies the account filter to the list and to the link.</li>
            </ul>

            <h3>2.4 Gifts Pledges, Remittance Pledges, Loans With Balance Due</h3>
            ''' + fig("gifts-ledger", "Gifts Pledges, the purpose ledger: Open in Gifts and Pledges leaves the widget; the Excel file is built from data already on screen.") + '''
            ''' + fig("remittance-drill", "Remittance Pledges, the member-church drill: Open in Remittance leaves the widget.") + '''
            ''' + fig("loans-popup", "Loans With Balance Due, the loan detail: Open loan leaves the widget (destination route still to confirm).") + '''
            <ul class="spec-ul">
              <li><b>Open in Gifts and Pledges</b>: <code>/DonorsAndGifts/Pledges</code> at Inquiry. <b>Open in Remittance</b>: the Remittance pledge page at Inquiry (route to confirm). <b>Open loan</b>: <code>/LoanProcessing/LoanInformation</code> at Inquiry (route to confirm).</li>
              <li><b>Exports</b> are data, not pages: they follow the widget's own right.</li>
            </ul>

            <h3>2.5 Payroll Scheduled Time Off</h3>
            ''' + fig("pto-approve", "The approval queue with a person expanded: Approve, and Undo on an approved day, are actions.") + '''
            <ul class="spec-ul">
              <li><b>Approve</b>, <b>Undo</b>: the Payroll Dashboard right at <b>Update</b>. The old panel saved an approval with no update check; V2 closes that.</li>
              <li>The rows a user sees are the employees whose home department is in the user's approval departments. The old panel showed every department to a user with no employee record; V2 must not.</li>
            </ul>

            <h3>2.6 Payroll Distributions</h3>
            ''' + fig("payroll-drill", "The distribution drill with its Excel export: the only export that carries personal data.") + '''
            <ul class="spec-ul">
              <li><b>Export to Excel</b>: the employee rows follow the Payroll Dashboard right exactly as the Employee Break Down does; a user without it gets the file without those rows. Whether Secure employees are excluded is an open decision.</li>
            </ul>

            <h3>2.7 Budget Compared to Actual</h3>
            ''' + fig("budget-scope", "The account scope menu: the Special report option needs a further right.") + '''
            <ul class="spec-ul">
              <li><b>Special report</b> lines: <code>/GeneralLedger/Reports/SpecialReports</code> at Inquiry, as the old panel required. Income and expense accounts need only the module right.</li>
            </ul>

            <h3>2.8 My Status and Main Content Tasks</h3>
            ''' + fig("mystatus-detail", "My Status, a query opened: the row leads to the query's own module page.") + '''
            ''' + fig("tasks-tiles", "Main Content Tasks: every tile is a link to its task's page, and only tasks the user holds are shown. The right model, kept.") + '''
            <ul class="spec-ul">
              <li><b>My Status</b>: a query is offered only with its module right, as today; the jump to its page must test the <b>destination page</b> right before the row offers it, not only the module root.</li>
              <li><b>Main Content Tasks</b>: tiles are the tasks the user holds, so the destination right is checked before the tile shows. My Tasks may list only tasks the user holds.</li>
            </ul>

            <h3>2.9 No link or action</h3>
            <p>Pension Plans, Insurance Billing Plans, Deposits on Hand, Receivable Invoices Outstanding, Fixed Asset Values and the Financial KPI band have no control that leaves the widget today. Where one is added later (open account, open invoice, open asset), it follows the same rule with the destination page's right.</p>
          </div>

          <div class="spec-sec" id="perm-points">
            <h2>3. Six things V2 must be careful with</h2>
            <ul class="spec-ul">
              <li><b>Dashboard right is not page right.</b> Every "Open ..." control needs the destination page's URI tested at Inquiry, server-side, before it is shown.</li>
              <li><b>Record-level filters travel with the link.</b> Bank account roles and Purchasing account roles can refuse a record the page right alone would allow; the API marks each record openable or not.</li>
              <li><b>Two-gate buttons.</b> Schedule payment needs the tenant feature flag and a right; show the note for the flag, hide for the right.</li>
              <li><b>Exports are data, not pages.</b> They follow the widget's right, with the one personal-data exception in Payroll Distributions.</li>
              <li><b>Approve, Hold, Reject, Undo are not links.</b> They are API actions with their own tests; hiding the button is presentation, the API refuses.</li>
              <li><b>Routes to confirm with Value Labs</b>: the Remittance pledge page, the deposit account page, the loan page and the AR invoice page, so the right tested is the one the page really checks.</li>
            </ul>
          </div>

          <div class="spec-sec" id="perm-open">
            <h2>4. Open decisions</h2>
            <ul class="spec-ul">
              <li>Financial KPI: the General Ledger Dashboard right (recommended) or a new task of its own.</li>
              <li>Purchasing Management: drop the old panel's Admin shortcut and follow the request page's rule (recommended), or keep parity with the panel.</li>
              <li>Payroll Scheduled Time Off: the rule for a user with no employee record, and the new Update check on Approve and Undo.</li>
              <li>Payroll Distributions: whether Secure employees are excluded from the Employee Break Down and the export for users without <code>/Payroll/Secure/Employee</code>.</li>
              <li>My Status and Main Content Tasks: carried as today, per query and per tile. Confirm.</li>
              <li>Links out of a widget: shown only with the destination page's right, as Main Content Tasks does. Confirm.</li>
            </ul>
          </div>
        </section>'''
anchor = '''          </div>\r
        </section>\r
      </div>\r
    </main>'''
assert s.count(anchor) == 1
s = s.replace(anchor, '''          </div>\r
        </section>''' + DOC.replace("\n", "\r\n") + '''\r
      </div>\r
    </main>''')

# ---------- 4. click branch: three views ----------
old = '''    if(a==="view-spec"||a==="view-demo"){var _spec=(a==="view-spec");document.body.classList.toggle("spec-mode",_spec);var _sv=document.getElementById("specView");if(_sv)_sv.hidden=!_spec;'''
new = '''    if(a==="view-spec"||a==="view-demo"||a==="view-perm"){var _spec=(a!=="view-demo");document.body.classList.toggle("spec-mode",_spec);var _sv=document.getElementById("specView");if(_sv)_sv.hidden=(a!=="view-spec");var _pv=document.getElementById("permView");if(_pv)_pv.hidden=(a!=="view-perm");'''
sub1(old, new)

nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("perm view ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)), "| figures:", s.count('class="spec-fig"'), "| em dashes in doc:", DOC.count("\u2014"))
