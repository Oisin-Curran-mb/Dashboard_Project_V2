# Data package layer, step A14: Payroll Distributions (W03, prefix prO) renders from prOPackage(w).
# Default returns PRO_DISTS and PRO_RUNS by reference. The inline empty block becomes prOEmptyHTML(w), same string.
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''  var prODsRuns={},prOLiveDists=PRO_DISTS;\r
  function prODists(w){var l=(w&&w.dataset==="nodists")?[]:(w&&(w.dataset==="small"||w.dataset==="extreme"))?DATA_STATES.get(w.dataset,"payroll").dists:PRO_DISTS;prOLiveDists=l;return l;}\r
  function prORuns(w){if(w&&(w.dataset==="small"||w.dataset==="extreme")){if(!prODsRuns[w.dataset]){var g=DATA_STATES.get(w.dataset,"payroll");prODsRuns[w.dataset]=prOGenRuns(g.dists,g.base,w.dataset==="small"?19:23);}return prODsRuns[w.dataset];}return PRO_RUNS;}''',
'''  var prODsRuns={},prOLiveDists=PRO_DISTS;
  /* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
     reasons: no-checks-in-window (no-data), no-distributions (not-configured). data = {dists, runs}. */
  function prOPackage(w){
    if(w&&w.pkg)return w.pkg;
    var o=pkgOption();
    if(o==="default"){
      if(w&&w.state==="empty")return pkg("no-data","no-checks-in-window",{dists:PRO_DISTS,runs:[]});
      if(w&&w.dataset==="nodists")return pkg("not-configured","no-distributions",{dists:[],runs:PRO_RUNS});
      return pkg("ok","",{dists:PRO_DISTS,runs:PRO_RUNS});
    }
    if(o==="none")return pkg("no-data","no-checks-in-window",{dists:PRO_DISTS,runs:[]});
    if(o==="notconfigured")return pkg("not-configured","no-distributions",{dists:[],runs:PRO_RUNS});
    var g=pkgGen(o,"payroll");if(!g)return pkg("ok","",{dists:PRO_DISTS,runs:PRO_RUNS});
    if(!prODsRuns[o])prODsRuns[o]=prOGenRuns(g.dists,g.base,o==="small"?19:23);
    return pkg("ok",o,{dists:g.dists,runs:prODsRuns[o]});
  }
  function prODists(w){var l=prOPackage(w).data.dists||[];prOLiveDists=l;return l;}
  function prORuns(w){return prOPackage(w).data.runs||[];}''')
sub1('''  function prOContent(w){\r
    if(w.state==="empty"){var ec=EMPTY_COPY.payroll,body='<div class="state" data-kind="empty">'+ICON("inbox")+'<div class="state-title">'+ec.title+'</div><div class="state-sub">'+ec.sub+'</div>'+(ec.cta?'<button class="btn outlined" data-action="'+ec.action+'" data-id="'+w.id+'">'+ICON("add")+ec.cta+'</button>':'')+'</div>';\r
      return prOHeaderBlock(w,(w.size==="xwide"||w.size==="kpi"),true)+body;}''',
'''  /* the widget's own empty block (EMPTY_COPY.payroll wording); the header stays so the period chip is the recovery */
  function prOEmptyHTML(w){var ec=EMPTY_COPY.payroll,body='<div class="state" data-kind="empty">'+ICON("inbox")+'<div class="state-title">'+ec.title+'</div><div class="state-sub">'+ec.sub+'</div>'+(ec.cta?'<button class="btn outlined" data-action="'+ec.action+'" data-id="'+w.id+'">'+ICON("add")+ec.cta+'</button>':'')+'</div>';
    return prOHeaderBlock(w,(w.size==="xwide"||w.size==="kpi"),true)+body;}
  /* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */
  function prOStateHTML(w,p){return prOEmptyHTML(w);}
  function prOContent(w){var p=prOPackage(w);if(p.state!=="ok")return prOStateHTML(w,p);
    if(w.state==="empty")return prOEmptyHTML(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A14 payroll ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
