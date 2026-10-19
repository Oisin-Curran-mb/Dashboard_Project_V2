# Data package layer, step A16: Gifts Pledges (W17, prefix gpF) renders from gpFPackage(w).
# Default returns GPF_PURPOSES / GPF_PURPOSES_SINGLE by reference. The driver's inline fixtures keep their meaning.
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function gpFAllPurposes(w){if(w&&w.dataset==="nopurposes")return [];if(w&&(w.dataset==="small"||w.dataset==="extreme"))return DATA_STATES.get(w.dataset,"gifts");return (w&&w.dataset==="single")?GPF_PURPOSES_SINGLE:GPF_PURPOSES;}''',
'''/* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
   reasons: no-active-pledges (no-data), no-purposes (not-configured) */
function gpFPackage(w){
  if(w&&w.pkg)return w.pkg;
  var o=pkgOption();
  if(o==="default"){
    if(w&&w.dataset==="nopurposes")return pkg("not-configured","no-purposes",{purposes:[]});
    if(w&&(w.state==="empty"||w.dataset==="empty"))return pkg("no-data","no-active-pledges",{purposes:[]});
    return pkg("ok","",{purposes:(w&&w.dataset==="single")?GPF_PURPOSES_SINGLE:GPF_PURPOSES});
  }
  if(o==="none")return pkg("no-data","no-active-pledges",{purposes:[]});
  if(o==="notconfigured")return pkg("not-configured","no-purposes",{purposes:[]});
  var g=pkgGen(o,"gifts");return pkg("ok",o,{purposes:g||GPF_PURPOSES});
}
function gpFAllPurposes(w){return gpFPackage(w).data.purposes||[];}
/* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
function gpFStateHTML(w,p){return gpFEmpty(w);}''')
sub1('''function gpFContent(w){\r
  if(w.state==="empty"||!gpFData(w).length)return gpFEmpty(w);''',
'''function gpFContent(w){var p=gpFPackage(w);if(p.state!=="ok")return gpFStateHTML(w,p);\r
  if(w.state==="empty"||!gpFData(w).length)return gpFEmpty(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A16 gifts ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
