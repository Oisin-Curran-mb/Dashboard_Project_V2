# Data package layer, step A11: Main Content Tasks (W14, prefix mct) renders from mctPackage(w).
# Default returns MCT_TASKS by reference. Phase A: a non-ok package falls through (the widget has no empty block yet).
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''  function mctTasks(w){var l=(w&&w.dataset==="none")?[]:(w&&(w.dataset==="small"||w.dataset==="extreme"))?DATA_STATES.get(w.dataset,"tasks"):MCT_TASKS;mctLive=l;return l;}''',
'''  /* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
     reasons: nothing-recent (no-data), role-has-no-tasks (not-configured) */
  function mctPackage(w){
    if(w&&w.pkg)return w.pkg;
    var o=pkgOption();
    if(o==="default"){
      if(w&&(w.state==="empty"||w.dataset==="none"))return pkg("not-configured","role-has-no-tasks",{tasks:[]});
      return pkg("ok","",{tasks:MCT_TASKS});
    }
    if(o==="none")return pkg("no-data","nothing-recent",{tasks:[]});
    if(o==="notconfigured")return pkg("not-configured","role-has-no-tasks",{tasks:[]});
    var g=pkgGen(o,"tasks");return pkg("ok",o,{tasks:g||MCT_TASKS});
  }
  function mctTasks(w){var l=mctPackage(w).data.tasks||[];mctLive=l;return l;}
  /* what a non-ok package shows. Phase A: nothing of its own yet (null falls through to the normal face). */
  function mctStateHTML(w,p){return null;}''')
sub1('''  function mctContent(w){mctTasks(w);if(w.size==="kpi")return mctGlance(w);''',
'''  function mctContent(w){mctTasks(w);var p=mctPackage(w);if(p.state!=="ok"){var sh=mctStateHTML(w,p);if(sh)return sh;}if(w.size==="kpi")return mctGlance(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A11 tasks ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
