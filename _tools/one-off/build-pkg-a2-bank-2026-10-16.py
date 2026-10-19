# Data package layer, step A2: Bank Balances (W15, prefix bank) renders from bankPackage(w).
# Default returns BANK_ACCOUNTS by reference. Phase A: a non-ok package falls through unchanged (no renderer yet).
# Also repoints _tools/widget-map.json W15 js.start (stale since the data-state branches). Byte-safe. Run: python -I <this file>
import re, json, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"
P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''  function bankAccounts(w){if(w&&w.dataset==="none")return [];if(w&&(w.dataset==="small"||w.dataset==="extreme"))return DATA_STATES.get(w.dataset,"bank");return BANK_ACCOUNTS;}''',
'''  /* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
     reasons: all-zero-balances (no-data), no-active-bank-accounts (not-configured) */
  function bankPackage(w){
    if(w&&w.pkg)return w.pkg;
    var o=pkgOption();
    if(o==="default"){
      if(w&&(w.state==="empty"||w.dataset==="none"))return pkg("not-configured","no-active-bank-accounts",{accounts:[]});
      return pkg("ok","",{accounts:BANK_ACCOUNTS});
    }
    if(o==="none")return pkg("no-data","all-zero-balances",{accounts:[]});
    if(o==="notconfigured")return pkg("not-configured","no-active-bank-accounts",{accounts:[]});
    var g=pkgGen(o,"bank");return pkg("ok",o,{accounts:g||BANK_ACCOUNTS});
  }
  function bankAccounts(w){return bankPackage(w).data.accounts||[];}
  /* what a non-ok package shows. Phase A: nothing of its own yet (null falls through to the normal face). */
  function bankStateHTML(w,p){return null;}''')
sub1('''  function bankContent(w){\r
    if(w.size==="kpi")return bankGlance(w);''',
'''  function bankContent(w){var p=bankPackage(w);if(p.state!=="ok"){var sh=bankStateHTML(w,p);if(sh)return sh;}\r
    if(w.size==="kpi")return bankGlance(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)

M = os.path.join(ROOT, "_tools", "widget-map.json")
raw = open(M, "rb").read().decode("utf-8"); nl = "\r\n" if "\r\n" in raw else "\n"
m = json.loads(raw)
w15 = m["widgets"]["W15"]["final"]
old = w15["js"]["start"]
assert "bankAccounts" in old, old
w15["js"]["start"] = "  function bankPackage(w){"
txt = json.dumps(m, indent=2, ensure_ascii=False).replace("\n", nl) + nl
open(M, "wb").write(txt.encode("utf-8"))
print("A2 bank ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)), "| widget-map W15 js.start repointed")
