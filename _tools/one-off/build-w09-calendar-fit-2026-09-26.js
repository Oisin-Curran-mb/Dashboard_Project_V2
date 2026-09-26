// One-off, 2026-09-26, owner: "try all" on the W09 calendar-fit proposal (docs/decisions/W09.md item 10).
//   1. header defect: the KPI block sat in a 77px grid column beside the control segment (the shell's
//      .dep-hd grid places the header rows' children directly); W09's header now stacks: controls row,
//      then the KPI row across the full width
//   2. Leave Calendar view omits the KPI block (its figures describe the queue); Glance untouched
//   3. the month grid keeps a floor of five week rows and scrolls for a sixth instead of squashing
//   4. compact furniture: one-line caption ("N people out in Month"), one-row legend without icons
// Anchored; aborts before writing on any miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W09 Payroll Scheduled Time Off V2 ===== */", B1 = "/* ===== end W09 Payroll Scheduled Time Off V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(B1, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
/* 2. KPI row only in the queue view */
swap("  return '<div class=\"dep-hd ptof-hd\"><div class=\"dep-hd-top\"><div class=\"ptof-ctlrow\">'+ctls+'</div>'+ptoFViewToggle(w)+" + NL +
     "    '</div><div class=\"dep-hd-num\"><div class=\"w09-numwrap\">'+kpi+'<div class=\"w09-ctx\">'+ctx+'</div></div></div></div>';",
     "  var kpiRow=(ptoFView(w)===\"queue\")?('<div class=\"dep-hd-num\"><div class=\"w09-numwrap\">'+kpi+'<div class=\"w09-ctx\">'+ctx+'</div></div></div>'):\"\";" + NL +
     "  return '<div class=\"dep-hd ptof-hd\"><div class=\"dep-hd-top\"><div class=\"ptof-ctlrow\">'+ctls+'</div>'+ptoFViewToggle(w)+'</div>'+kpiRow+'</div>';", "header: KPI row in queue view only");
/* 4. caption */
swap("  var summary='<div class=\"ptof-hint\"><strong>'+distinct+(distinct===1?\" person\":\" people\")+'</strong> out across '+nG+' department'+(nG===1?\"\":\"s\")+' in '+PTOF_MONTHS[m]+((dsel!==\"all\")?(\", filtered to \"+dsel):\"\")+'. Click a day for detail.</div>';",
     "  var summary='<div class=\"ptof-hint\"><strong>'+distinct+(distinct===1?\" person\":\" people\")+'</strong> out in '+PTOF_MONTHS[m]+((dsel!==\"all\")?(\", \"+dsel):\"\")+'</div>';", "one-line caption");
/* 4. legend without icons or the caption word */
swap("<span class=\"ptof-legend-cap\">Colour = status</span>", "", "legend: no caption word");
swap("<span class=\"ptof-legend-sw\" aria-hidden=\"true\"></span>'+ICON(o[2])+o[0]+'</span>';", "<span class=\"ptof-legend-sw\" aria-hidden=\"true\"></span>'+o[0]+'</span>';", "legend: no icons");
t = t.slice(0, b0) + blk + t.slice(b1);
/* CSS */
const cEnd = "/* ===== end W09 Payroll Scheduled Time Off V2 CSS ===== */"; if (t.split(cEnd).length !== 2) throw new Error("css end");
const cssRep = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("css anchor: " + label); t = t.replace(a, b); console.log("css: " + label); };
cssRep("  .ptof-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;flex:1 1 auto;min-height:0;grid-auto-rows:minmax(var(--ptof-cell),1fr);overflow-y:auto;overscroll-behavior:contain;}",
       "  .ptof-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;flex:1 1 auto;min-height:calc(var(--ptof-cell)*5 + 16px);grid-auto-rows:minmax(var(--ptof-cell),1fr);overflow-y:auto;overscroll-behavior:contain;}", "grid keeps five rows, scrolls for a sixth");
cssRep("  .ptof-legend{display:flex;flex-wrap:wrap;align-items:center;gap:5px 12px;margin-top:9px;padding-top:8px;border-top:1px solid var(--stroke-widget);flex-shrink:0;}",
       "  .ptof-legend{display:flex;flex-wrap:nowrap;align-items:center;gap:12px;margin-top:6px;padding-top:6px;border-top:1px solid var(--stroke-widget);flex-shrink:0;}", "legend one row");
cssRep("  .ptof-legend-item{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--txt-secondary);}", "  .ptof-legend-item{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:var(--txt-secondary);white-space:nowrap;}", "legend item");
t = t.replace(cEnd, "  /* header rows stack: controls, then the KPI row across the full width (the shell grid would put the KPI beside the control segment) */" + NL +
  "  .ptof-hd{grid-template-columns:1fr;row-gap:10px;}" + NL +
  "  .ptof-hd .dep-hd-top{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0;}" + NL +
  "  .ptof-hd .dep-hd-num{display:block;min-width:0;}" + NL +
  "  .ptof-hd .w09-ctx{max-width:none;}" + NL + cEnd);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
