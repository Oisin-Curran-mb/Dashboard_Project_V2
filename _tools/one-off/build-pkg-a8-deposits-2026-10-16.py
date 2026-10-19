# Data package layer, step A8: Deposits on Hand (W07, prefix depO) renders from depOPackage(w).
# Default returns DEPO_DEP by reference; the block keeps its own small (first two) and extreme (eight renamed copies) sets.
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''  function depOData(w){\r
    if(w&&w.dataset==="small")return DEPO_DEP.slice(0,2);\r
    if(w&&w.dataset==="extreme"){if(!depODsBig){depODsBig=[];for(var k=0;k<8;k++)DEPO_DEP.forEach(function(a){var c={};for(var f in a)c[f]=a[f];c.name=a.name+(k?" "+(k+1):"");c.acct="\\u2022\\u2022"+String(1000+(k*977+parseInt(a.acctFull.slice(-4),10))%9000);c.acctFull=a.acctFull.slice(0,6)+c.acct.slice(2);c.net=Math.round(a.net*(0.3+(k*0.37)%1.4));depODsBig.push(c);});}return depODsBig;}\r
    return (w&&w.dataset==="empty")?[]:DEPO_DEP;}''',
'''  /* the extreme set: eight renamed copies of the shipped accounts, built once */
  function depOBigSet(){if(!depODsBig){depODsBig=[];for(var k=0;k<8;k++)DEPO_DEP.forEach(function(a){var c={};for(var f in a)c[f]=a[f];c.name=a.name+(k?" "+(k+1):"");c.acct="\\u2022\\u2022"+String(1000+(k*977+parseInt(a.acctFull.slice(-4),10))%9000);c.acctFull=a.acctFull.slice(0,6)+c.acct.slice(2);c.net=Math.round(a.net*(0.3+(k*0.37)%1.4));depODsBig.push(c);});}return depODsBig;}
  /* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
     reasons: no-active-accounts (no-data), no-account-types (not-configured) */
  function depOPackage(w){
    if(w&&w.pkg)return w.pkg;
    var o=pkgOption();
    if(o==="default"){
      if(w&&(w.state==="empty"||w.dataset==="empty"))return pkg("not-configured","no-account-types",{accounts:[]});
      return pkg("ok","",{accounts:DEPO_DEP});
    }
    if(o==="none")return pkg("no-data","no-active-accounts",{accounts:[]});
    if(o==="notconfigured")return pkg("not-configured","no-account-types",{accounts:[]});
    if(o==="small")return pkg("ok","small",{accounts:DEPO_DEP.slice(0,2)});
    if(o==="extreme")return pkg("ok","extreme",{accounts:depOBigSet()});
    return pkg("ok","",{accounts:DEPO_DEP});
  }
  function depOData(w){return depOPackage(w).data.accounts||[];}
  /* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
  function depOStateHTML(w,p){return depOEmptyState(w);}''')
sub1('''  function depOContent(w){\r
    if(w.state==="loading")return depOSkeleton();\r
    if(w.state==="error")return depOErrorState(w);\r
    if(w.state==="empty"||!depOData(w).length)return depOEmptyState(w);''',
'''  function depOContent(w){\r
    if(w.state==="loading")return depOSkeleton();\r
    if(w.state==="error")return depOErrorState(w);\r
    var p=depOPackage(w);if(p.state!=="ok")return depOStateHTML(w,p);\r
    if(w.state==="empty"||!depOData(w).length)return depOEmptyState(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A8 deposits ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
