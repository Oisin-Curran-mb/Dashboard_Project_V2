# Data package layer, step A6: Pension Plans (W02, prefix penO) renders from penOPackage(w).
# Default returns PENO_APPTS by reference. Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function penODataset(w){if(w&&(w.dataset==="small"||w.dataset==="extreme"))return DATA_STATES.get(w.dataset,"pension");return (w&&w.dataset==="none")?PENO_APPTS_EMPTY:PENO_APPTS;}''',
'''/* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
   reasons: no-active-appointments (no-data), no-plans (not-configured) */
function penOPackage(w){
  if(w&&w.pkg)return w.pkg;
  var o=pkgOption();
  if(o==="default"){
    if(w&&(w.state==="empty"||w.dataset==="none"))return pkg("no-data","no-active-appointments",{appts:PENO_APPTS_EMPTY});
    return pkg("ok","",{appts:PENO_APPTS});
  }
  if(o==="none")return pkg("no-data","no-active-appointments",{appts:PENO_APPTS_EMPTY});
  if(o==="notconfigured")return pkg("not-configured","no-plans",{appts:PENO_APPTS_EMPTY});
  var g=pkgGen(o,"pension");return pkg("ok",o,{appts:g||PENO_APPTS});
}
function penODataset(w){return penOPackage(w).data.appts||[];}
/* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
function penOStateHTML(w,p){return penOEmpty(w);}''')
sub1('''function penOContent(w){\r
  if(w.state==="empty")return penOEmpty(w);''',
'''function penOContent(w){var p=penOPackage(w);if(p.state!=="ok")return penOStateHTML(w,p);\r
  if(w.state==="empty")return penOEmpty(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A6 pension ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
