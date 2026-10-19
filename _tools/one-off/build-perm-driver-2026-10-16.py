# Extends _tools/shell-spec.driver.js for the third view (Permissions), 16 Oct 2026:
#   the toggle regex allows the Permissions tab; the permissions section is asserted (present after the spec,
#   hidden by default, four sections, one figure per listed widget picture, every picture file present, no em
#   dashes, no arrows); the click branch is driven three ways. Keeps the file's LF endings. Run: python -I <this file>
import os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"
P = os.path.join(ROOT, "_tools", "shell-spec.driver.js")
t = open(P, "rb").read().decode("utf-8"); nl = "\r\n" if t.count("\r\n") > t.count("\n") // 2 else "\n"; t = t.replace("\r\n", "\n")


def sub1(o, n):
    global t
    assert t.count(o) == 1, ("count", t.count(o), o[:80]); t = t.replace(o, n)


sub1('''const vm = require("vm");
const H = require("./jo-port-driver.js");''',
     '''const vm = require("vm");
const fs = require("fs"), path = require("path");
const H = require("./jo-port-driver.js");''')
sub1('''<button class="vtb" data-action="view-spec" role="tab" aria-selected="false">Spec<\\/button>\\s*<\\/div>/g;''',
     '''<button class="vtb" data-action="view-spec" role="tab" aria-selected="false">Spec<\\/button>\\s*<button class="vtb" data-action="view-perm" role="tab" aria-selected="false">Permissions<\\/button>\\s*<\\/div>/g;''')
sub1('''A.eq((raw.match(TOGGLE_RE) || []).length, 1, "exactly one Demo / Spec toggle");''',
     '''A.eq((raw.match(TOGGLE_RE) || []).length, 1, "exactly one Demo / Spec / Permissions toggle");''')
sub1('''"spec-sec", "spec-ul", "spec-tbl"], "toggle and spec CSS");''',
     '''"spec-sec", "spec-ul", "spec-tbl", "spec-fig", "spec-rule"], "toggle and spec CSS");''')

# the permissions section, asserted after the spec checks and before the click handler
sub1('''/* ---------- 6. the click handler, driven -------------------------------- */''',
'''/* ---------- 5b. the Permissions view (16 Oct 2026) --------------------- */
const p0 = raw.indexOf('<section class="spec" id="permView"'), p1 = raw.indexOf("</section>", p0);
A.ok(p0 > -1 && p1 > p0, "permissions section present");
A.ok(p0 > s1, "permissions section follows the spec section");
const perm = raw.slice(p0, p1);
A.contains(perm, ' hidden ', "permissions hidden by default");
A.noEmDash(perm, "permissions text");
A.absent(perm, "\\u2192", "no arrows in the permissions text");
A.contains(perm, "Widget Permissions (Version 2)", "titled for Version 2");
["perm-rule", "perm-care", "perm-points", "perm-open"].forEach(function (id, i) { A.contains(perm, 'id="' + id + '"', "permissions section " + (i + 1) + " " + id); });
A.eq((perm.match(/<h2>/g) || []).length, 4, "four numbered permissions sections");
A.eq((perm.match(/<tr><td><b>/g) || []).length, 17, "seventeen widgets in the right-to-show table");
const PICS = ["purchasing-popup", "payables-invoice", "bank-drill", "gifts-ledger", "remittance-drill", "loans-popup", "pto-approve", "payroll-drill", "budget-scope", "mystatus-detail", "tasks-tiles"];
PICS.forEach(function (n) {
  A.contains(perm, 'src="docs/Pics/Permissions/' + n + '.png"', "picture referenced: " + n);
  A.ok(fs.existsSync(path.join(__dirname, "..", "docs", "Pics", "Permissions", n + ".png")), "picture file present: " + n + ".png");
});
A.eq((perm.match(/<figure class="spec-fig">/g) || []).length, PICS.length, "one figure per picture");
A.eq((perm.match(/<img /g) || []).length, (perm.match(/ alt="/g) || []).length, "every picture has alt text");
A.contains(perm, 'href="docs/handover/Widget%20permissions', "links to the full review document");
A.contains(perm, "<code>/PurchasingManagement/Requests/Update</code>", "Purchasing: Open request names its page right");
A.contains(perm, "<code>/AccountsPayable/PaymentProcessing</code>", "Accounts Payable: Schedule payment names its Update right");
A.contains(perm, "account roles", "Bank: account roles named");
A.contains(css, ".spec-fig img{display:block;max-width:100%;", "figures scale to the column");

/* ---------- 6. the click handler, driven -------------------------------- */''')
sub1('''const hm = /    if\\(a==="view-spec"\\|\\|a==="view-demo"\\)\\{[\\s\\S]*?window\\.scrollTo\\(0,0\\);return;\\}/.exec(code);
A.ok(!!hm, "dispatcher has the view-spec / view-demo branch");''',
     '''const hm = /    if\\(a==="view-spec"\\|\\|a==="view-demo"\\|\\|a==="view-perm"\\)\\{[\\s\\S]*?window\\.scrollTo\\(0,0\\);return;\\}/.exec(code);
A.ok(!!hm, "dispatcher has the view-spec / view-demo / view-perm branch");''')
sub1('''    const body = node(""), sv = node(""), demo = node("view-demo"), specBtn = node("view-spec"), main = { scrollTop: 300 };
    demo.cls.on = true; sv.hidden = true;
    return { body: body, sv: sv, demo: demo, specBtn: specBtn, main: main, scrolled: 0,
      document: { body: body, getElementById: function (id) { return id === "specView" ? sv : null; }, querySelectorAll: function (q) { return q === ".viewtab .vtb" ? [demo, specBtn] : []; }, querySelector: function (q) { return q === ".appmain" ? main : null; } } };''',
     '''    const body = node(""), sv = node(""), pv = node(""), demo = node("view-demo"), specBtn = node("view-spec"), permBtn = node("view-perm"), main = { scrollTop: 300 };
    demo.cls.on = true; sv.hidden = true; pv.hidden = true;
    return { body: body, sv: sv, pv: pv, demo: demo, specBtn: specBtn, permBtn: permBtn, main: main, scrolled: 0,
      document: { body: body, getElementById: function (id) { return id === "specView" ? sv : (id === "permView" ? pv : null); }, querySelectorAll: function (q) { return q === ".viewtab .vtb" ? [demo, specBtn, permBtn] : []; }, querySelector: function (q) { return q === ".appmain" ? main : null; } } };''')
sub1('''  const off = drive("view-demo");
  A.ok(!off.body.classList.contains("spec-mode"), "Demo: .spec-mode removed");
  A.eq(off.sv.hidden, true, "Demo: the spec section is hidden again");
  A.ok(off.demo.classList.contains("on") && !off.specBtn.classList.contains("on"), "Demo: the Demo tab is on, Spec is off");''',
     '''  A.eq(on.pv.hidden, true, "Spec: the permissions section stays hidden");
  const pm = drive("view-perm");
  A.ok(pm.body.classList.contains("spec-mode"), "Permissions: body gets .spec-mode (the dashboard hides)");
  A.eq(pm.pv.hidden, false, "Permissions: the permissions section is shown");
  A.eq(pm.sv.hidden, true, "Permissions: the spec section is hidden");
  A.ok(pm.permBtn.classList.contains("on") && !pm.specBtn.classList.contains("on") && !pm.demo.classList.contains("on"), "Permissions: only the Permissions tab is on");
  A.eq(pm.permBtn.getAttribute("aria-selected"), "true", "Permissions: aria-selected moves to Permissions");
  const off = drive("view-demo");
  A.ok(!off.body.classList.contains("spec-mode"), "Demo: .spec-mode removed");
  A.eq(off.sv.hidden, true, "Demo: the spec section is hidden again");
  A.eq(off.pv.hidden, true, "Demo: the permissions section is hidden again");
  A.ok(off.demo.classList.contains("on") && !off.specBtn.classList.contains("on") && !off.permBtn.classList.contains("on"), "Demo: the Demo tab is on, Spec and Permissions are off");''')
assert "require(\"fs\")" in t or "const fs" in t, "driver needs fs"
open(P, "wb").write(t.replace("\n", nl).encode("utf-8")); print("spec driver extended")
