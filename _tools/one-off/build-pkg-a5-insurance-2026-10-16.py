# Data package layer, step A5: Insurance Billing Plans (W06, prefix insO) renders from insOPackage(w).
# Default returns INSO_PLANS (or the nodental / empty fixtures) by reference. Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''  function insODataset(w){if(w.dataset==="small"||w.dataset==="extreme")return DATA_STATES.get(w.dataset,"insurance");if(w.dataset==="none")return INSO_PLANS_EMPTY;if(w.dataset==="nodental")return INSO_NODENTAL;return INSO_PLANS;}''',
'''  /* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
     reasons: no-enrolments (no-data), no-plans (not-configured). A type filter with no plans stays client-side (insOScopedEmpty). */
  function insOPackage(w){
    if(w&&w.pkg)return w.pkg;
    var o=pkgOption();
    if(o==="default"){
      if(w&&(w.state==="empty"||w.dataset==="none"))return pkg("not-configured","no-plans",{plans:INSO_PLANS_EMPTY});
      return pkg("ok","",{plans:(w&&w.dataset==="nodental")?INSO_NODENTAL:INSO_PLANS});
    }
    if(o==="none")return pkg("no-data","no-enrolments",{plans:INSO_PLANS_EMPTY});
    if(o==="notconfigured")return pkg("not-configured","no-plans",{plans:INSO_PLANS_EMPTY});
    var g=pkgGen(o,"insurance");return pkg("ok",o,{plans:g||INSO_PLANS});
  }
  function insODataset(w){return insOPackage(w).data.plans||[];}
  /* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
  function insOStateHTML(w,p){return insOEmpty(w);}''')
sub1('''  function insOContent(w){\r
    var inner;\r
    if(w.state==="empty")inner=insOEmpty(w);''',
'''  function insOContent(w){\r
    var inner,p=insOPackage(w);\r
    if(p.state!=="ok")inner=insOStateHTML(w,p);\r
    else if(w.state==="empty")inner=insOEmpty(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A5 insurance ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
