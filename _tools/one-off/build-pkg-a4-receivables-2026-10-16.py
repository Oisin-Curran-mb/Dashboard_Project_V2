# Data package layer, step A4: Receivable Invoices Outstanding (W05, prefix arO) renders from arOPackage(w).
# Default returns ARO_INV (or the current/single fixtures) by reference. Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function arODataset(w){if(w.dataset==="none")return [];if(w.dataset==="small"||w.dataset==="extreme")return DATA_STATES.get(w.dataset,"receivables");if(w.dataset==="current")return ARO_INV_CURRENT;if(w.dataset==="single")return ARO_INV_SINGLE;return ARO_INV;}''',
'''/* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
   reasons: all-settled (no-data), no-revenue-centres (not-configured) */
function arOPackage(w){
  if(w&&w.pkg)return w.pkg;
  var o=pkgOption();
  if(o==="default"){
    if(w&&(w.state==="empty"||w.dataset==="none"))return pkg("no-data","all-settled",{invoices:[]});
    return pkg("ok","",{invoices:(w&&w.dataset==="current")?ARO_INV_CURRENT:(w&&w.dataset==="single")?ARO_INV_SINGLE:ARO_INV});
  }
  if(o==="none")return pkg("no-data","all-settled",{invoices:[]});
  if(o==="notconfigured")return pkg("not-configured","no-revenue-centres",{invoices:[]});
  var g=pkgGen(o,"receivables");return pkg("ok",o,{invoices:g||ARO_INV});
}
function arODataset(w){return arOPackage(w).data.invoices||[];}
/* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
function arOStateHTML(w,p){return arOEmpty(w);}''')
sub1('''function arOContent(w){\r
  if(w.state==="empty")return arOEmpty(w);''',
'''function arOContent(w){var p=arOPackage(w);if(p.state!=="ok")return arOStateHTML(w,p);\r
  if(w.state==="empty")return arOEmpty(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A4 receivables ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
