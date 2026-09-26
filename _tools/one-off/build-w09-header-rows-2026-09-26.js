// One-off, 2026-09-26, owner ruling (docs/decisions/W09.md item 11): the only control the two views
// share is the Approval Queue / Leave Calendar switch, so it alone sits on the header's top row; the
// view-specific controls (Group by + Show for the queue, Department for the calendar) move to a quiet
// sub-row beneath it, then the KPI row (queue only). Same structure at Explore and Detail; Glance untouched.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W09 Payroll Scheduled Time Off V2 ===== */", B1 = "/* ===== end W09 Payroll Scheduled Time Off V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(B1, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
swap("  return '<div class=\"dep-hd ptof-hd\"><div class=\"dep-hd-top\"><div class=\"ptof-ctlrow\">'+ctls+'</div>'+ptoFViewToggle(w)+'</div>'+kpiRow+'</div>';",
     "  return '<div class=\"dep-hd ptof-hd\"><div class=\"dep-hd-top\">'+ptoFViewToggle(w)+'</div><div class=\"ptof-subrow\"><div class=\"ptof-ctlrow\">'+ctls+'</div></div>'+kpiRow+'</div>';", "header: view switch alone on top, view controls in a sub-row");
t = t.slice(0, b0) + blk + t.slice(b1);
const cEnd = "/* ===== end W09 Payroll Scheduled Time Off V2 CSS ===== */"; if (t.split(cEnd).length !== 2) throw new Error("css end");
const cssRep = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("css anchor: " + label); t = t.replace(a, b); console.log("css: " + label); };
cssRep("  .ptof-hd .dep-hd-top{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0;}",
       "  .ptof-hd .dep-hd-top{display:flex;align-items:center;justify-content:flex-start;gap:8px;flex-wrap:wrap;min-width:0;}" + NL +
       "  .ptof-hd .dep-hd-top .dep-hd-toggle{margin:0;}" + NL +
       "  /* view-specific controls read as a sub-view of the switch above: a quiet band, left-aligned */" + NL +
       "  .ptof-subrow{display:flex;align-items:center;min-width:0;padding:6px 10px;border-radius:8px;background:var(--wn-100);border:1px solid var(--stroke-widget);}", "top row and sub-row");
cssRep("  .ptof-hd{grid-template-columns:1fr;row-gap:10px;}", "  .ptof-hd{grid-template-columns:1fr;row-gap:8px;}", "header row gap");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
