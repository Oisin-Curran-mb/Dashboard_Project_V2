# Data package layer, step A10: Payroll Scheduled Time Off (W09, prefix ptoF) renders from ptoFPackage(w).
# Default returns PTOF_GROUPS by reference. Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function ptoFFlat(w){var ds=(w.dataset==="none"||w.state==="empty")?[]:((w.dataset==="small"||w.dataset==="extreme")?DATA_STATES.get(w.dataset,"pto"):PTOF_GROUPS),out=[];''',
'''/* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
   reasons: nothing-pending (no-data), nothing-ever-scheduled (not-configured). Owner (16 Oct 2026): no
   permissions version; a user without the right does not have the widget at all. */
function ptoFPackage(w){
  if(w&&w.pkg)return w.pkg;
  var o=pkgOption();
  if(o==="default"){
    if(w&&(w.state==="empty"||w.dataset==="none"))return pkg("no-data","nothing-pending",{groups:[]});
    return pkg("ok","",{groups:PTOF_GROUPS});
  }
  if(o==="none")return pkg("no-data","nothing-pending",{groups:[]});
  if(o==="notconfigured")return pkg("not-configured","nothing-ever-scheduled",{groups:[]});
  var g=pkgGen(o,"pto");return pkg("ok",o,{groups:g||PTOF_GROUPS});
}
/* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
function ptoFStateHTML(w,p){return ptoFEmpty(w);}
function ptoFFlat(w){var ds=ptoFPackage(w).data.groups||[],out=[];''')
sub1('''function ptoFContent(w){\r
  if(w.state==="empty"||w.dataset==="none"||!ptoFFlat(w).length)return ptoFEmpty(w);''',
'''function ptoFContent(w){var p=ptoFPackage(w);if(p.state!=="ok")return ptoFStateHTML(w,p);\r
  if(w.state==="empty"||w.dataset==="none"||!ptoFFlat(w).length)return ptoFEmpty(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A10 pto ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
