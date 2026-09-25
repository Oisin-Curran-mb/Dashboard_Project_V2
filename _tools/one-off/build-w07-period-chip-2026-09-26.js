// One-off, 2026-09-26, owner ruling after the W07 browser look: at Explore and Detail the time
// selection becomes a period chip on the header row beside the scope chip, in the shared scope-chip
// style and with the same terms the other widgets use ("This month", "This quarter", ...). The KPI
// row keeps the delta pill with a static "vs previous <period>" caption. Glance is unchanged.
// Anchored; aborts before writing on any miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W07 Deposits on Hand V2 ===== */", B1 = "/* ===== end W07 Deposits on Hand V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(B1, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

swap('  function depORangeBtn(w){return \'<button class="trend-range" data-depo="rangemenu" data-id="\'+w.id+\'">vs \'+depOPeriodLbl(w)+ICON("expand_more")+\'</button>\';}',
  '  function depORangeBtn(w){return \'<button class="trend-range" data-depo="rangemenu" data-id="\'+w.id+\'">vs \'+depOPeriodLbl(w)+ICON("expand_more")+\'</button>\';}' + NL +
  '  /* Explore / Detail: the period is a chip on the header row, in the shared scope-chip style and the terms the other widgets use */' + NL +
  '  function depOPeriodTerm(r){return {W:"This week",M:"This month",P:"This period",Q:"This quarter",F:"This fiscal year",Y:"This calendar year"}[r||"Q"];}' + NL +
  '  function depOPeriodChip(w){var lb=depOPeriodTerm(w.range);return \'<button class="scope-chip" data-depo="rangemenu" data-id="\'+w.id+\'" aria-haspopup="listbox" aria-label="Period, tap to change" title="\'+lb+\'"><span class="sc-nm">\'+lb+\'</span>\'+ICON("expand_more")+\'</button>\';}',
  "period chip functions");
swap('<span class="delta-grp">\'+depODelta(p)+depORangeBtn(w)+\'</span></div>\';' + NL + '    var showSearch=',
  '<span class="delta-grp">\'+depODelta(p)+\'<span class="trend-range static">vs previous \'+depOPeriodLbl(w)+\'</span></span></div>\';' + NL + '    var showSearch=',
  "KPI row: static caption instead of the button");
swap('<div class="dep-hd"><div class="dep-hd-top">\'+depOScopeChip(w)+\'<div class="dep-hd-toggle">\'+depOToggle(w)+\'</div></div>',
  '<div class="dep-hd"><div class="dep-hd-top depo-hd-top">\'+depOScopeChip(w)+depOPeriodChip(w)+\'<div class="dep-hd-toggle">\'+depOToggle(w)+\'</div></div>',
  "header row: scope chip + period chip + toggle");
swap('return \'<div class="cap">Compare to</div>\'+[["W","Previous week"],["M","Previous month"],["P","Previous period"],["Q","Previous quarter"],["F","Previous fiscal year"],["Y","Previous calendar year"]].map(',
  'return \'<div class="cap">Period</div>\'+[["W","This week"],["M","This month"],["P","This period"],["Q","This quarter"],["F","This fiscal year"],["Y","This calendar year"]].map(',
  "menu terms");
t = t.slice(0, b0) + blk + t.slice(b1);
/* CSS: the header row lays its chips out in a row, toggle to the right */
const cssEnd = "/* ===== end W07 Deposits on Hand V2 CSS ===== */"; if (t.split(cssEnd).length !== 2) throw new Error("css end");
t = t.replace(cssEnd, "  .depo-hd-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;}" + NL + "  .depo-hd-top .dep-hd-toggle{margin-left:auto;}" + NL + cssEnd);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
