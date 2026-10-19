# Data package layer, step A7: Fixed Asset Values (W11, prefix faF) renders from faFPackage(w).
# Default returns FAF_ASSETS by reference. Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function faFDataset(w){if(w.dataset==='small'||w.dataset==='extreme')return DATA_STATES.get(w.dataset,"fixedassets");return (w.dataset==='none'||w.dataset==='empty')?FAF_ASSETS_EMPTY:FAF_ASSETS;}''',
'''/* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
   reasons: nothing-to-chart-for-measure (no-data), no-assets (not-configured) */
function faFPackage(w){
  if(w&&w.pkg)return w.pkg;
  var o=pkgOption();
  if(o==="default"){
    if(w&&(w.state==='empty'||w.dataset==='none'||w.dataset==='empty'))return pkg("not-configured","no-assets",{assets:FAF_ASSETS_EMPTY});
    return pkg("ok","",{assets:FAF_ASSETS});
  }
  if(o==="none")return pkg("no-data","nothing-to-chart-for-measure",{assets:FAF_ASSETS_EMPTY});
  if(o==="notconfigured")return pkg("not-configured","no-assets",{assets:FAF_ASSETS_EMPTY});
  var g=pkgGen(o,"fixedassets");return pkg("ok",o,{assets:g||FAF_ASSETS});
}
function faFDataset(w){return faFPackage(w).data.assets||[];}
/* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
function faFStateHTML(w,p){return faFNoAssets(w);}''')
sub1('''  if(w.state==='empty'||!faFDataset(w).length) return faFNoAssets(w);\r
  if(w.state==='unspecified') return faFUnbuilt(w);''',
'''  var p=faFPackage(w);if(p.state!=="ok") return faFStateHTML(w,p);\r
  if(w.state==='empty'||!faFDataset(w).length) return faFNoAssets(w);\r
  if(w.state==='unspecified') return faFUnbuilt(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A7 fixedassets ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
