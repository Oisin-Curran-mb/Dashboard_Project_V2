"""
fix-pending-actions-2026-10-13.py
Fixes the pendingactions (pa3) widget:
  1. Right pane not rendering: revert pa3-dp-* CSS classes to al2-dp-*.
  2. Remove the tab bar; show only needCats (sev:need) always.
  3. Fix pa3Ensure for no-tab operation.
  4. Remove tab handler from pa3Handle.
"""
import re

P = "index.html"
s = open(P, "rb").read().decode("utf-8")

def sub1(old, new):
    global s
    cnt = s.count(old)
    assert cnt == 1, "Expected 1 occurrence, got %d for: %r" % (cnt, old[:60])
    s = s.replace(old, new)

# ── 1. Revert pa3-dp-* class names back to al2-dp-* ──────────────────────────
# These only exist in the pa3 block so bulk replace is safe.
dp_classes = [
    "pa3-dp-empty-title", "pa3-dp-empty-sub", "pa3-dp-empty",
    "pa3-dp-hd-text", "pa3-dp-hd",
    "pa3-dp-sev", "pa3-dp-title", "pa3-dp-badge", "pa3-dp-close",
    "pa3-dp-body", "pa3-dp-msg", "pa3-dp-redirect-note",
    "pa3-dp-table", "pa3-dp-lbl",
    "pa3-dp-actions", "pa3-dp-apv-actions", "pa3-dp-apv-spacer",
    "pa3-dp-section-last", "pa3-dp-section-lbl", "pa3-dp-section",
    "pa3-dp-grid",
    "pa3-dp-field-lbl", "pa3-dp-field-val", "pa3-dp-field",
    "pa3-dp-items",
    "pa3-dp-item-desc", "pa3-dp-item-qty", "pa3-dp-item-amt", "pa3-dp-item-row",
    "pa3-dp-trail",
    "pa3-dp-step-icon", "pa3-dp-step-info", "pa3-dp-step-name", "pa3-dp-step-sub", "pa3-dp-step",
    "pa3-dp-divider",
    "pa3-dp-row",
    "pa3-dp-val",
    "pa3-dp",
]
for cls in dp_classes:
    s = s.replace(cls, "al2-" + cls[4:])  # pa3- -> al2-

# ── 2. Fix pa3Ensure: remove pa3Tab, use only needCats ────────────────────────
sub1(
    "  var pa3Open={},pa3Tab={},pa3Sel={};",
    "  var pa3Open={},pa3Sel={};"
)

# Replace the pa3Ensure function body using a regex
old_ensure = re.compile(
    r"  function pa3Ensure\(w\)\{.*?  \}",
    re.DOTALL
)
new_ensure = (
    "  function pa3Ensure(w){\r\n"
    "    if(!pa3Open[w.id]){\r\n"
    "      pa3Open[w.id]={};\r\n"
    "      /* Only need cats shown; xwide: open first need cat; wide: open all */\r\n"
    "      var needCats=PA3_CATS.filter(function(c){return c.sev===\"need\";});\r\n"
    "      var firstNeed=needCats[0];\r\n"
    "      needCats.forEach(function(c){\r\n"
    "        pa3Open[w.id][c.id]=(w.size===\"xwide\")?(c===firstNeed):true;\r\n"
    "      });\r\n"
    "    }\r\n"
    "    /* xwide: auto-select first item of first need cat if none selected */\r\n"
    "    if(w.size===\"xwide\"&&!pa3Sel[w.id]){\r\n"
    "      var needCats=PA3_CATS.filter(function(c){return c.sev===\"need\";});\r\n"
    "      var firstCat=needCats[0];\r\n"
    "      if(firstCat&&firstCat.items.length>0){\r\n"
    "        pa3Sel[w.id]={cat:firstCat,catId:firstCat.id,idx:0,cfg:PA3_ITEM_MODALS[firstCat.id+\":0\"]||null};\r\n"
    "      }\r\n"
    "    }\r\n"
    "  }"
)
matches = old_ensure.findall(s)
assert len(matches) == 1, "pa3Ensure regex matched %d times" % len(matches)
s = old_ensure.sub(new_ensure, s, count=1)

# ── 3. Fix pa3Content: remove tabs, show only needCats ───────────────────────
old_content = re.compile(
    r"  /\* pa3Content:.*?  \}(?=\r\n\r\n  function pa3Handle)",
    re.DOTALL
)
new_content = (
    "  /* pa3Content: wide -> accordion only; xwide -> 40/60 split pane.\r\n"
    "     No tab bar: always shows Pending actions (sev:need) categories only. */\r\n"
    "  function pa3Content(w){\r\n"
    "    pa3Ensure(w);\r\n"
    "    var needCats=PA3_CATS.filter(function(c){return c.sev===\"need\";});\r\n"
    "    var xwide=(w.size===\"xwide\");\r\n"
    "    var listHTML='<div class=\"alb4-root\"><div class=\"alb4-panel scroll\">'+needCats.map(function(c){return pa3CatHTML(c,w.id,xwide);}).join(\"\")+'</div></div>';\r\n"
    "    if(!xwide)return listHTML;\r\n"
    "    /* xwide: accordion left + detail pane right, no tab bar */\r\n"
    "    var accordionHTML='<div class=\"alb4-xw-left-panel scroll\">'+needCats.map(function(c){return pa3CatHTML(c,w.id,xwide);}).join(\"\")+'</div>';\r\n"
    "    return '<div class=\"alb4-xwide-wrap\">'+\r\n"
    "      '<div class=\"alb4-detail-split\">'+\r\n"
    "        '<div class=\"alb4-detail-left\">'+accordionHTML+'</div>'+\r\n"
    "        '<div class=\"alb4-detail-right\">'+pa3DetailPane(w.id)+'</div>'+\r\n"
    "      '</div>'+\r\n"
    "    '</div>';\r\n"
    "  }"
)
matches = old_content.findall(s)
assert len(matches) == 1, "pa3Content regex matched %d times" % len(matches)
s = old_content.sub(new_content, s, count=1)

# ── 4. Remove tab handler from pa3Handle ─────────────────────────────────────
old_tab = re.compile(
    r'    if\(a==="paO3-tab"\)\{.*?render\(\);return true;\}',
    re.DOTALL
)
matches = old_tab.findall(s)
assert len(matches) == 1, "paO3-tab handler regex matched %d times" % len(matches)
s = old_tab.sub("    /* paO3-tab removed: no tab bar in Pending Actions */", s, count=1)

# ── 5. Write back ─────────────────────────────────────────────────────────────
open(P, "wb").write(s.encode("utf-8"))
print("Done.")
print("  1. pa3-dp-* CSS classes reverted to al2-dp-* (shared CSS)")
print("  2. pa3Ensure: no tab state; always selects first need cat")
print("  3. pa3Content: tab bar removed; only needCats rendered")
print("  4. pa3Handle: tab handler removed")
