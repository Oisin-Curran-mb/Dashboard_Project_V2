# Data package layer, step A0 (shell). Plan: .claude plan "the data package layer" (16 Oct 2026).
#   1. pkg* helpers into "Shell: shared widget helpers" (self-contained: the isolated drivers run that region alone).
#   2. Delete DATA_STATE_MAP and dsApply from the data-states region; rewrite its header.
#   3. render() no longer calls dsApply.
# Byte-safe: read bytes, every anchor asserted unique, no bare LF written. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
b = open(P, "rb").read(); s = b.decode("utf-8")
assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


# ---------- 1. shared helpers ----------
HELPERS = '''  /* ---- data package (16 Oct 2026) ------------------------------------
     The envelope every widget renders from, shaped like the API response the
     widget will one day receive:  { state, reason, data }
       state  : "ok" | "no-data" | "not-configured" | "error"
       reason : a short code from docs/handover/Widget data states - API responses ... .md
       data   : the widget's own payload (null for error)
     Each widget block has its own <prefix>Package(w) builder. Today the builder
     reads the review selector (pkgOption) and hands back its fixtures: the SAME
     objects by reference for "default", so the default face is byte-identical.
     A stored response on the row (w.pkg) always wins; that is the API seam.
     These four helpers depend on nothing but ICON, so the isolated drivers that
     run one block alone still have them. */
  function pkg(state,reason,data){return {state:state||"ok",reason:reason||"",data:(data===undefined)?null:data};}
  /* the selector's option; "default" when the data-states region is absent (isolated drivers, release build) */
  function pkgOption(){return (typeof dataState==="function")?dataState():"default";}
  /* a generated set from the data-states region, or null when that region is absent */
  function pkgGen(option,kind){return (typeof DATA_STATES==="object"&&DATA_STATES&&DATA_STATES.get)?DATA_STATES.get(option,kind):null;}
  /* the shell's state block: icon, title, optional sub-line, optional call-to-action button. Same markup
     contentHTML's generic empty block emits; Glance hides the sub-line through the existing kpi .state-sub rule. */
  function pkgStateHTML(w,o){return '<div class="state" data-kind="'+(o.kind||"empty")+'">'+ICON(o.icon||"inbox")+'<div class="state-title">'+o.title+'</div>'+(o.sub?'<div class="state-sub">'+o.sub+'</div>':'')+(o.cta?'<button class="btn outlined" data-action="'+o.action+'" data-id="'+w.id+'">'+ICON("add")+o.cta+'</button>':'')+'</div>';}
  /* owner's rule (16 Oct 2026): where Jo Phase 2 has no design for a package state, say so; invent nothing. */
  function pkgPlaceholderHTML(w,p){return pkgStateHTML(w,{icon:"design_services",title:"Not designed yet",sub:(w.title||"").replace(/\\s*\\([^)]*\\)\\s*$/,"")+": "+p.state+" / "+p.reason+". No Jo Phase 2 design for this state; placeholder for the owner to review."});}
'''
sub1("  function bandFromDays(d){if(d>=30)return \"ahead\";if(d>=-30)return \"onpace\";if(d>=-60)return \"behind\";return \"farbehind\";}\r\n  /* ===== end Shell: shared widget helpers ===== */",
     "  function bandFromDays(d){if(d>=30)return \"ahead\";if(d>=-30)return \"onpace\";if(d>=-60)return \"behind\";return \"farbehind\";}\r\n" + HELPERS.replace("\n", "\r\n") + "  /* ===== end Shell: shared widget helpers ===== */")

# ---------- 2. data-states region: header, map, apply ----------
sub1('''     #ds=none|notconfigured|default|small|extreme; dsApply() maps it onto each widget's own dataset and\r
     state flags and restores the registry row for "default". The shell draws nothing itself: each option\r
     only changes the data a widget is handed, and the widget shows whatever it already does with that\r
     (owner, 16 Oct 2026: "just the data going to the widgets"). Design: docs/DATA-STATES.md. ===== */''',
'''     #ds=none|notconfigured|default|small|extreme. Each widget's <prefix>Package(w) builder reads it through\r
     pkgOption() (shared helpers) and hands the widget an API-shaped envelope {state, reason, data}; the shell\r
     draws nothing itself and never touches a row's state (owner, 16 Oct 2026: "just the data going to the\r
     widgets"; "mimic how it arrived through API payload"). Design: docs/DATA-STATES.md. ===== */''')
a = s.index("  /* Per kind: what each option means in the widget's own data flags.")
b2 = s.index("  function dataStateSelectHTML(){")
cut = s[a:b2]
assert "var DATA_STATE_MAP={" in cut and "function dsApply(ws){" in cut and cut.count("\r\n") < 40, cut.count("\r\n")
s = s[:a] + s[b2:]
assert "DATA_STATE_MAP" not in s and "dsApply" not in s.replace("var _ws=viewOnly(cur().widgets);dsApply(_ws);", "")

# ---------- 3. render() ----------
sub1("var _ws=viewOnly(cur().widgets);dsApply(_ws);var _grid=", "var _ws=viewOnly(cur().widgets);var _grid=")
assert "dsApply" not in s

nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A0 ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)), "| pkg helpers:", s.count("function pkg"))
