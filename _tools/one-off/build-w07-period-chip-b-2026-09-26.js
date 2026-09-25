// W07 header chips follow W01 Budget Compared to Actual: filter-chip style, scope + period in one control row.
const fs = require("fs");
const FILE = "C:/Users/ocurran/Desktop/For Dashboard/Step 7 - Version 2/Complete Version 2/index.html";
let t = fs.readFileSync(FILE, "utf8"); const NL = "\r\n";
const B0 = "/* ===== W07 Deposits on Hand V2 ===== */", B1 = "/* ===== end W07 Deposits on Hand V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(B1, b0);
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
/* Explore / Detail scope chip in the W01 filter-chip style (glance keeps depOScopeChip) */
swap('  function depOPeriodTerm(r){return {W:"This week",M:"This month",P:"This period",Q:"This quarter",F:"This fiscal year",Y:"This calendar year"}[r||"Q"];}',
  '  function depOPeriodTerm(r){return {W:"This week",M:"This month",P:"This period",Q:"This quarter",F:"This fiscal year",Y:"This year"}[r||"Q"];}' + NL +
  '  function depOScopeChipX(w){var lb=depOTypeLabel(w);return \'<button class="filter-chip depo-scope-chip" data-depo="depfilter" data-id="\'+w.id+\'" aria-haspopup="listbox" aria-label="Scope, tap to change" title="\'+lb.replace(/"/g,"&quot;")+\'"><span class="fc-label">\'+lb+\'</span>\'+ICON("expand_more")+\'</button>\';}', "scope chip, filter-chip style");
swap('  function depOPeriodChip(w){var lb=depOPeriodTerm(w.range);return \'<button class="scope-chip" data-depo="rangemenu" data-id="\'+w.id+\'" aria-haspopup="listbox" aria-label="Period, tap to change" title="\'+lb+\'"><span class="sc-nm">\'+lb+\'</span>\'+ICON("expand_more")+\'</button>\';}',
  '  function depOPeriodChip(w){var lb=depOPeriodTerm(w.range);return \'<button class="filter-chip" data-depo="rangemenu" data-id="\'+w.id+\'" aria-haspopup="listbox" aria-label="Period, tap to change" title="\'+lb+\'"><span class="fc-label">\'+lb+\'</span>\'+ICON("expand_more")+\'</button>\';}', "period chip, filter-chip style");
swap('<div class="dep-hd"><div class="dep-hd-top depo-hd-top">\'+depOScopeChip(w)+depOPeriodChip(w)+\'<div class="dep-hd-toggle">',
  '<div class="dep-hd"><div class="dep-hd-top"><div class="depo-ctlrow">\'+depOScopeChipX(w)+depOPeriodChip(w)+\'</div><div class="dep-hd-toggle">', "header row like W01: control row + toggle");
swap('[["W","This week"],["M","This month"],["P","This period"],["Q","This quarter"],["F","This fiscal year"],["Y","This calendar year"]]', '[["W","This week"],["M","This month"],["P","This period"],["Q","This quarter"],["F","This fiscal year"],["Y","This year"]]', "menu terms");
t = t.slice(0, b0) + blk + t.slice(b1);
const a = "  .depo-hd-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;}" + NL + "  .depo-hd-top .dep-hd-toggle{margin-left:auto;}" + NL;
if (t.split(a).length !== 2) throw new Error("css anchor");
t = t.replace(a, "  .depo-ctlrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}" + NL + "  .depo-scope-chip{justify-self:start;max-width:190px;}" + NL);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
