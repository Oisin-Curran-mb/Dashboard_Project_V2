/* One-off, 2026-09-27, owner (screenshot of the icon-only toggle on the headline row): "no fix this to way
   it was before." The Explore header goes back to one layout for both tiers: labelled view toggle on the chip
   line, legend icon on the headline row. Kept from the same batch: Table first, short Explore chip labels,
   the chip row stretching to its track (no more toggle-over-chips overlap) and the hidden filter glyph. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
swap("  var v=purFViewCur(w),iconOnly=(purFTier(w)===\"wide\");", "  var v=purFViewCur(w),iconOnly=false; /* owner, 27 Sep: labelled toggle at every tier */", "toggle: labels at every tier");
swap("  return '<div class=\"vtoggle purf-vtoggle'+(iconOnly?\" purf-vtoggle-ic\":\"\")+'\" role=\"group\" aria-label=\"View\">'+", "  return '<div class=\"vtoggle purf-vtoggle\" role=\"group\" aria-label=\"View\">'+", "toggle: plain class");
swap("    /* Explore: chips take the whole first line; the icon-only toggle and the legend icon share the headline row. */" + NL +
     "    ((tier===\"wide\")" + NL +
     "      ? '<div class=\"dep-hd-top\"><div class=\"purf-chiprow purf-chiprow-full\">'+chips+'</div></div>'+" + NL +
     "        '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div><div class=\"purf-hd-acts\">'+purFViewToggle(w)+lg+'</div></div>'" + NL +
     "      : '<div class=\"dep-hd-top\"><div class=\"purf-chiprow\">'+chips+'</div><div class=\"dep-hd-toggle\">'+purFViewToggle(w)+'</div></div>'+" + NL +
     "        '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div>'+lg+'</div>')+",
     "    '<div class=\"dep-hd-top\"><div class=\"purf-chiprow\">'+chips+'</div><div class=\"dep-hd-toggle\">'+purFViewToggle(w)+'</div></div>'+" + NL +
     "    '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div>'+lg+'</div>'+", "header: one layout for both tiers");
t = t.slice(0, b0) + blk + t.slice(b1);
const swapT = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swapT("  .purf-root[data-tier=\"wide\"] .purf-chiprow-full{grid-column:1 / -1;}" + NL +
      "  .purf-root .purf-hd-acts{display:flex;align-items:center;gap:6px;justify-self:end;align-self:start;}" + NL +
      "  .purf-root .purf-vtoggle-ic .vt{padding-left:8px;padding-right:8px;}" + NL +
      "  .purf-root .purf-vtoggle-ic .vt .material-symbols-rounded{margin:0;}" + NL, "", "CSS: stack rules removed");
if (/purf-chiprow-full|purf-hd-acts|purf-vtoggle-ic/.test(t)) throw new Error("stack leftovers");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
