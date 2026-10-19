# Data package layer, step A15: Purchasing Management (W13, prefix purF) renders from purFPackage(w).
# Default returns PURF_POS by reference (the W13 driver mutates it). No EMPTY_COPY in this block: it runs alone in its driver.
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function purFDataset(w){var base=(w&&(w.dataset==="small"||w.dataset==="extreme"))?DATA_STATES.get(w.dataset,"purchasing"):((w&&(w.dataset==="empty"||w.state==="empty"))?PURF_POS_EMPTY:PURF_POS);return base.filter(function(p){return !purFHidden(p);});}''',
'''/* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
   reasons: nothing-matches-status (no-data), not-on-any-path (not-configured). data.pos is PURF_POS itself
   in the default package: approvals mutate the orders in place and the driver reaches the same array. */
function purFPackage(w){
  if(w&&w.pkg)return w.pkg;
  var o=pkgOption();
  if(o==="default"){
    if(w&&(w.dataset==="empty"||w.state==="empty"))return pkg("no-data","nothing-matches-status",{pos:PURF_POS_EMPTY});
    return pkg("ok","",{pos:PURF_POS});
  }
  if(o==="none")return pkg("no-data","nothing-matches-status",{pos:PURF_POS_EMPTY});
  if(o==="notconfigured")return pkg("not-configured","not-on-any-path",{pos:PURF_POS_EMPTY});
  var g=pkgGen(o,"purchasing");return pkg("ok",o,{pos:g||PURF_POS});
}
function purFDataset(w){return (purFPackage(w).data.pos||[]).filter(function(p){return !purFHidden(p);});}
/* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
function purFStateHTML(w,p){return purFEmpty(w,false);}''')
sub1('''function purFBody(w){\r
  if(w.state==="empty"||!purFDataset(w).length)return purFEmpty(w,false);''',
'''function purFBody(w){var p=purFPackage(w);if(p.state!=="ok")return purFStateHTML(w,p);\r
  if(w.state==="empty"||!purFDataset(w).length)return purFEmpty(w,false);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A15 purchasing ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
