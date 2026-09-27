/* One-off, 2026-09-27, owner: "move the chart to where it was before. and have the bubbles under it in a row".
   Jo's Bank Glance becomes three lines: the account chip; the amount with the sparkline beside it (where the
   chart sat originally); the pills (Overdrawn drill, delta, "vs beginning balance") in one row underneath.
   The amount is shown compact ($4.9M) with the exact figure as title and aria-label, so the sparkline has room
   in a 172px widget. Replaces the two earlier stacked passes. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const s = t.indexOf("  function bankGlance(w){"), e = t.indexOf("  function bankDrillModalHTML(){", s); if (s < 0 || e < 0) throw new Error("bankGlance range");
const fn = [
  "  /* Glance (owner, 27 Sep): chip; amount + sparkline side by side; pills in a row underneath. */",
  "  function bankGlance(w){var sel=bankSelected(w);",
  "    var amt=function(v,neg){return '<div class=\"metric-value bank-gl-amt'+(neg?\" bank-neg\":\"\")+'\" title=\"'+bankMoney(v)+'\" aria-label=\"'+bankMoney(v)+'\">'+bankAbbr(v)+'</div>';};",
  "    var delta=function(beg,chg,up){return '<span class=\"delta-pill'+(up?\"\":\" neg\")+'\" data-tip=\"Beginning balance '+bankMoney(beg)+' \\u00b7 '+(up?\"up \":\"down \")+bankMoney(Math.abs(chg))+' since the last reconciliation\" data-tip-plain tabindex=\"0\">'+ICON(up?\"north_east\":\"south_east\")+bankAbbr(chg)+'</span><span class=\"trend-range static\">vs beginning balance</span>';};",
  "    if(sel){var end=bankEnding(sel),beg=sel.a[0],chg=end-beg,neg=end<0,up=chg>=0;",
  "      return '<div class=\"kpi-row bank-glrow\">'+",
  "        '<div class=\"bank-gl-top\">'+bankAcctChip(w)+'</div>'+",
  "        '<div class=\"bank-gl-mid\">'+amt(end,neg)+bankSpark(w)+'</div>'+",
  "        '<div class=\"gl-sub bank-gl-pills\">'+(neg?'<span class=\"bank-pill warn\">'+ICON(\"error\")+'Overdrawn</span>':'')+delta(beg,chg,up)+'</div>'+",
  "        '</div>';}",
  "    var val=bankTotal(w),negT=val<0,over=bankNegCount(w),bt=bankBeginTotal(w),tchg=val-bt,tup=tchg>=0;",
  "    var od=over?'<button class=\"bank-pill warn bank-odpill\" data-action=\"bank-drill\" data-over=\"1\" data-id=\"'+w.id+'\" aria-label=\"'+over+' account'+(over>1?\"s\":\"\")+' overdrawn, tap to open\">'+ICON(\"error\")+over+' overdrawn'+ICON(\"chevron_right\")+'</button>':'';",
  "    return '<div class=\"kpi-row bank-glrow\">'+",
  "      '<div class=\"bank-gl-top\">'+bankAcctChip(w)+'</div>'+",
  "      '<div class=\"bank-gl-mid\">'+amt(val,negT)+bankSpark(w)+'</div>'+",
  "      '<div class=\"gl-sub bank-gl-pills\">'+od+delta(bt,tchg,tup)+'</div>'+",
  "      '</div>';}",
  ""].join(NL);
t = t.slice(0, s) + fn + t.slice(e);
console.log("edited: bankGlance rewritten");
/* CSS: replace the two earlier passes' rules */
const c0 = t.indexOf("  /* Glance (owner, 27 Sep): chip, then amount with the pill beside it, then the sparkline full width, left to right. */");
const c1 = t.indexOf("  .bank-glrow .kpi-spark.bank-spark svg{height:100%;}");
if (c0 < 0 || c1 < 0) throw new Error("css range");
const cEnd = t.indexOf(NL, c1) + NL.length;
const css = [
  "  /* Glance (owner, 27 Sep): chip; amount + sparkline side by side; pills in one row underneath. */",
  "  .bank-glrow{flex-direction:column;gap:4px;padding:8px 12px;}",
  "  .bank-glrow .bank-gl-top{margin-bottom:0;}",
  "  .bank-glrow .bank-gl-mid{display:flex;align-items:center;gap:10px;min-width:0;}",
  "  .bank-glrow .bank-gl-amt{flex:0 0 auto;}",
  "  .bank-glrow .kpi-spark.bank-spark{flex:1 1 auto;min-width:0;max-width:none;height:40px;margin:0;align-self:center;}",
  "  .bank-glrow .kpi-spark.bank-spark svg{height:100%;}",
  "  .bank-glrow .bank-gl-pills{display:flex;flex-wrap:nowrap;align-items:center;gap:6px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;white-space:nowrap;min-width:0;}",
  "  .bank-glrow .bank-gl-pills::-webkit-scrollbar{display:none;}",
  ""].join(NL);
t = t.slice(0, c0) + css + t.slice(cEnd);
console.log("edited: glance CSS replaced");
if (/bank-gl-line/.test(t)) throw new Error("bank-gl-line survives");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
