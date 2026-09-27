/* One-off, 2026-09-27, owner: the Explore filter chips must fit ("these changes only for the explore view").
   Cause: .purf-chiprow was justify-self:start, so it took its max-content width and overflowed its 1fr grid
   track; the view toggle in the auto track was drawn over it (clipped "All approval pa"). At Explore the
   three chips cannot share a line with a labelled toggle at any realistic width, so:
     - both tiers: the chip row stretches to its track (hidden sideways scroll is the fallback)
     - Explore: the chip row spans the full header width; the view toggle becomes icon-only (aria-label and
       title keep the words) and moves onto the headline row beside the legend icon
     - Detail: unchanged layout */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* toggle: icon-only at Explore */
swap("  var v=purFViewCur(w);" + NL + "  function seg(val,lbl,ic,tip){" + NL +
     "    return '<button class=\"vt'+(v===val?\" on\":\"\")+'\" data-purf=\"view\" data-id=\"'+w.id+'\" data-v=\"'+val+'\" aria-pressed=\"'+(v===val)+'\" title=\"'+purFEsc(tip)+'\">'+purFIcon(ic)+lbl+'</button>';",
     "  var v=purFViewCur(w),iconOnly=(purFTier(w)===\"wide\");" + NL + "  function seg(val,lbl,ic,tip){" + NL +
     "    return '<button class=\"vt'+(v===val?\" on\":\"\")+'\" data-purf=\"view\" data-id=\"'+w.id+'\" data-v=\"'+val+'\" aria-pressed=\"'+(v===val)+'\" aria-label=\"'+purFEsc(lbl)+'\" title=\"'+purFEsc(lbl+\". \"+tip)+'\">'+purFIcon(ic)+(iconOnly?\"\":lbl)+'</button>';", "toggle: icon-only segments at Explore");
swap("  return '<div class=\"vtoggle purf-vtoggle\" role=\"group\" aria-label=\"View\">'+",
     "  return '<div class=\"vtoggle purf-vtoggle'+(iconOnly?\" purf-vtoggle-ic\":\"\")+'\" role=\"group\" aria-label=\"View\">'+", "toggle: icon-only class");

/* header: Explore stacks chips over headline + toggle + legend */
const OLD_TOP = "    '<div class=\"dep-hd-top\"><div class=\"purf-chiprow\">'+chips+'</div><div class=\"dep-hd-toggle\">'+purFViewToggle(w)+'</div></div>'+" + NL +
                "    '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div>'+" + NL +
                "      ((view===\"enc\")?\"\":'<button class=\"purf-lgbtn\" data-purf=\"legend\" data-id=\"'+w.id+'\" aria-haspopup=\"dialog\" aria-label=\"Legend: what the lanes, badges and colours mean\" data-tip=\"Legend\">'+purFIcon(\"info\")+'</button>')+" + NL +
                "    '</div>'+";
const NEW_TOP = "    /* Explore: chips take the whole first line; the icon-only toggle and the legend icon share the headline row. */" + NL +
                "    ((tier===\"wide\")" + NL +
                "      ? '<div class=\"dep-hd-top\"><div class=\"purf-chiprow purf-chiprow-full\">'+chips+'</div></div>'+" + NL +
                "        '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div><div class=\"purf-hd-acts\">'+purFViewToggle(w)+lg+'</div></div>'" + NL +
                "      : '<div class=\"dep-hd-top\"><div class=\"purf-chiprow\">'+chips+'</div><div class=\"dep-hd-toggle\">'+purFViewToggle(w)+'</div></div>'+" + NL +
                "        '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div>'+lg+'</div>')+";
swap(OLD_TOP, NEW_TOP, "header: Explore stack");
swap("  return '<div class=\"dep-hd purf-hd\">'+",
     "  var lg=(view===\"enc\")?\"\":'<button class=\"purf-lgbtn\" data-purf=\"legend\" data-id=\"'+w.id+'\" aria-haspopup=\"dialog\" aria-label=\"Legend: what the lanes, badges and colours mean\" data-tip=\"Legend\">'+purFIcon(\"info\")+'</button>';" + NL +
     "  return '<div class=\"dep-hd purf-hd\">'+", "header: legend button variable");

t = t.slice(0, b0) + blk + t.slice(b1);

/* CSS */
const swapT = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swapT("  .purf-root .purf-chiprow{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;min-width:0;overflow-x:auto;overscroll-behavior:contain;scrollbar-width:none;justify-self:start;align-self:center;}",
      "  .purf-root .purf-chiprow{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;min-width:0;overflow-x:auto;overscroll-behavior:contain;scrollbar-width:none;justify-self:stretch;align-self:center;}" + NL +
      "  .purf-root[data-tier=\"wide\"] .purf-chiprow-full{grid-column:1 / -1;}" + NL +
      "  .purf-root .purf-hd-acts{display:flex;align-items:center;gap:6px;justify-self:end;align-self:start;}" + NL +
      "  .purf-root .purf-vtoggle-ic .vt{padding-left:8px;padding-right:8px;}" + NL +
      "  .purf-root .purf-vtoggle-ic .vt .material-symbols-rounded{margin:0;}" + NL +
      "  /* Explore chips drop the leading filter glyph so the three chips fit the header width. */" + NL +
      "  .purf-root[data-tier=\"wide\"] .purf-chip::before{display:none;}" + NL +
      "  .purf-root[data-tier=\"wide\"] .purf-chip{padding-left:9px;}", "CSS: chip row stretches; Explore stack");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
