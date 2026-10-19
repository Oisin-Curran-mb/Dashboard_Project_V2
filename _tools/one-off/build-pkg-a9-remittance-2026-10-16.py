# Data package layer, step A9: Remittance Pledges (W04, prefix remO) renders from remOPackage(w).
# Default returns REMO_ACTIVITIES by reference; the fixture flag state:"noscope" becomes no-data / no-term-covers-date.
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function remOData(w){if(w.state==="empty"||w.state==="noscope")return [];var l=(w.dataset==="small"||w.dataset==="extreme")?DATA_STATES.get(w.dataset,"remittance").activities:REMO_ACTIVITIES;remOLive=l;return l;}''',
'''/* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
   reasons: no-term-covers-date (no-data), no-activities (not-configured) */
function remOPackage(w){
  if(w&&w.pkg)return w.pkg;
  var o=pkgOption();
  if(o==="default"){
    if(w&&w.state==="noscope")return pkg("no-data","no-term-covers-date",{activities:[]});
    if(w&&w.state==="empty")return pkg("not-configured","no-activities",{activities:[]});
    return pkg("ok","",{activities:REMO_ACTIVITIES});
  }
  if(o==="none")return pkg("no-data","no-term-covers-date",{activities:[]});
  if(o==="notconfigured")return pkg("not-configured","no-activities",{activities:[]});
  var g=pkgGen(o,"remittance");return pkg("ok",o,{activities:g?g.activities:REMO_ACTIVITIES});
}
function remOData(w){var l=remOPackage(w).data.activities||[];remOLive=l;return l;}
/* what a non-ok package shows. Phase A: the widget's own empty block; the date-range case is its noscope branch. */
function remOStateHTML(w,p){if(p.state==="no-data"&&p.reason==="no-term-covers-date"&&w.state!=="noscope"){var c={};for(var k in w)c[k]=w[k];c.state="noscope";return remOEmpty(c);}return remOEmpty(w);}''')
sub1('''function remOContent(w){\r
  if(w.state==="empty"||w.state==="noscope")return remOEmpty(w);''',
'''function remOContent(w){var p=remOPackage(w);if(p.state!=="ok")return remOStateHTML(w,p);\r
  if(w.state==="empty"||w.state==="noscope")return remOEmpty(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A9 remittance ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
