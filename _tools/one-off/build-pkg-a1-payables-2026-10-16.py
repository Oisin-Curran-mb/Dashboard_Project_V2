# Data package layer, step A1: Accounts Payable By Due Date (W16, prefix ap) renders from apPackage(w).
# Default returns AP_INVOICES / AP_INVOICES_SINGLE by reference (byte-identical face). Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''  function apData(w){if(w&&w.dataset==="none")return [];if(w&&(w.dataset==="small"||w.dataset==="extreme"))return DATA_STATES.get(w.dataset,"payables");return (w&&w.dataset==="single")?AP_INVOICES_SINGLE:AP_INVOICES;}''',
'''  /* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
     reasons: nothing-unpaid (no-data), no-payables-bank-account (not-configured) */
  function apPackage(w){
    if(w&&w.pkg)return w.pkg;
    var o=pkgOption();
    if(o==="default"){
      if(w&&(w.state==="empty"||w.dataset==="none"))return pkg("no-data","nothing-unpaid",{invoices:[]});
      return pkg("ok","",{invoices:(w&&w.dataset==="single")?AP_INVOICES_SINGLE:AP_INVOICES});
    }
    if(o==="none")return pkg("no-data","nothing-unpaid",{invoices:[]});
    if(o==="notconfigured")return pkg("not-configured","no-payables-bank-account",{invoices:[]});
    var g=pkgGen(o,"payables");return pkg("ok",o,{invoices:g||AP_INVOICES});
  }
  function apData(w){return apPackage(w).data.invoices||[];}
  /* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
  function apStateHTML(w,p){var ec=EMPTY_COPY.payables;return '<div class="state" data-kind="empty">'+ICON("task_alt")+'<div class="state-title">'+ec.title+'</div>'+(w.size==="kpi"?'':'<div class="state-sub">'+ec.sub+'</div>')+'</div>';}''')
sub1('''  function apGlance(w){\r
    if(w.state==="empty"||!apData(w).length){var ec=EMPTY_COPY.payables;''',
'''  function apGlance(w){var p=apPackage(w);if(p.state!=="ok")return apStateHTML(w,p);\r
    if(w.state==="empty"||!apData(w).length){var ec=EMPTY_COPY.payables;''')
sub1('''  function apContent(w){\r
    if(w.size==="kpi")return apGlance(w);\r
    if(w.state==="empty"||!apData(w).length){var ec=EMPTY_COPY.payables;''',
'''  function apContent(w){var p=apPackage(w);if(p.state!=="ok")return apStateHTML(w,p);\r
    if(w.size==="kpi")return apGlance(w);\r
    if(w.state==="empty"||!apData(w).length){var ec=EMPTY_COPY.payables;''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A1 payables ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
