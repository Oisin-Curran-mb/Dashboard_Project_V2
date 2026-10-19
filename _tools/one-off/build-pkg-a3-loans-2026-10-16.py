# Data package layer, step A3: Loans With Balance Due (W10, prefix lonF) renders from lonFPackage(w).
# Default returns LONF_LOANS (or the current/single fixtures) by reference. Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function lonFDataset(w){if(w.dataset==="small"||w.dataset==="extreme")return DATA_STATES.get(w.dataset,"loans");if(w.dataset==="current")return LONF_LOANS_CURRENT;if(w.dataset==="single")return LONF_LOANS_SINGLE;if(w.dataset==="none")return [];return LONF_LOANS;}''',
'''/* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
   reasons: none-with-balance (no-data), no-loan-types-or-loans (not-configured) */
function lonFPackage(w){
  if(w&&w.pkg)return w.pkg;
  var o=pkgOption();
  if(o==="default"){
    if(w&&(w.state==="empty"||w.dataset==="none"))return pkg("no-data","none-with-balance",{loans:[]});
    return pkg("ok","",{loans:(w&&w.dataset==="current")?LONF_LOANS_CURRENT:(w&&w.dataset==="single")?LONF_LOANS_SINGLE:LONF_LOANS});
  }
  if(o==="none")return pkg("no-data","none-with-balance",{loans:[]});
  if(o==="notconfigured")return pkg("not-configured","no-loan-types-or-loans",{loans:[]});
  var g=pkgGen(o,"loans");return pkg("ok",o,{loans:g||LONF_LOANS});
}
function lonFDataset(w){return lonFPackage(w).data.loans||[];}
/* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
function lonFStateHTML(w,p){return lonFEmpty(w);}''')
sub1('''function lonFContent(w){\r
  if(w.state==="empty"||!lonFDataset(w).length)return lonFEmpty(w);''',
'''function lonFContent(w){var p=lonFPackage(w);if(p.state!=="ok")return lonFStateHTML(w,p);\r
  if(w.state==="empty"||!lonFDataset(w).length)return lonFEmpty(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A3 loans ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
