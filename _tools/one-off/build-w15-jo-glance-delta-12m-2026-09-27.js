/* One-off, 2026-09-27, owner ("so what it take to fix it"): the Glance delta pill compares today's balance with
   the first point of the same twelve-month series (a year ago) instead of the reconciliation's beginning balance,
   so the pill and the line tell one story. Tooltip: "Balance in Sep 2025 $X · up $Y since then". */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const s = t.indexOf("  function bankGlance(w){"), e = t.indexOf("  function bankDrillModalHTML(){", s); if (s < 0 || e < 0) throw new Error("range");
let fn = t.slice(s, e);
const swap = function (a, b, label) { if (fn.split(a).length !== 2) throw new Error("anchor x" + (fn.split(a).length - 1) + ": " + label); fn = fn.replace(a, b); console.log("edited: " + label); };
/* the old helper line is replaced whole (its middle-dot escape makes an exact anchor brittle) */
const dl0 = fn.indexOf("    var delta=function(beg,chg,up){"); if (dl0 < 0) throw new Error("old delta helper line");
const dl1 = fn.indexOf(NL, dl0); if (dl1 < 0) throw new Error("old delta helper line end");
fn = fn.slice(0, dl0) +
  "    /* delta vs a year ago: first point of the twelve-month series the sparkline draws (owner, 27 Sep) */" + NL +
  "    var hist=bankHistory(w),ago=hist[0],agoLbl=bankMonthLabels()[0];" + NL +
  "    var delta=function(now){var chg=now-ago,up=chg>=0;return '<span class=\"delta-pill'+(up?\"\":\" neg\")+'\" data-tip=\"Balance in '+agoLbl+' '+bankMoney(ago)+' \\u00b7 '+(up?\"up \":\"down \")+bankMoney(Math.abs(chg))+' since then\" data-tip-plain tabindex=\"0\" aria-label=\"'+(up?\"Up \":\"Down \")+bankMoney(Math.abs(chg))+' since '+agoLbl+'\">'+ICON(up?\"north_east\":\"south_east\")+bankAbbr(chg)+'</span><span class=\"trend-range static\">vs '+agoLbl+'</span>';};" +
  fn.slice(dl1);
console.log("edited: delta helper");
swap("    if(sel){var end=bankEnding(sel),beg=sel.a[0],chg=end-beg,neg=end<0,up=chg>=0;", "    if(sel){var end=bankEnding(sel),neg=end<0;", "single account vars");
swap("+delta(beg,chg,up)+'</div>'+", "+delta(end)+'</div>'+", "single account delta call");
swap("    var val=bankTotal(w),negT=val<0,over=bankNegCount(w),bt=bankBeginTotal(w),tchg=val-bt,tup=tchg>=0;", "    var val=bankTotal(w),negT=val<0,over=bankNegCount(w);", "all accounts vars");
swap("+od+delta(bt,tchg,tup)+'</div>'+", "+od+delta(val)+'</div>'+", "all accounts delta call");
t = t.slice(0, s) + fn + t.slice(e);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
