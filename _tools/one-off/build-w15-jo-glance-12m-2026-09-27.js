/* One-off, 2026-09-27, owner: "the line should not be the breakdown of each type but 12 months total of all
   accounts over the last year ... the hover over should show this, time and amount for all accounts".
   The Glance sparkline becomes a twelve-point monthly series ending at the current total (or the selected
   account's ending balance), one point per month over the last year; the hover reads month and amount.
   The demo has no monthly history, so the earlier months are a deterministic walk back from the ending
   balance (demo data, flagged as such); the backend would supply real month-end balances. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const s = t.indexOf("  function bankRunning(w){"), e = t.indexOf("  function bankAcctChip(w){", s); if (s < 0 || e < 0) throw new Error("range");
const fn = [
  "  /* Glance sparkline (owner, 27 Sep): month-end total balance over the last twelve months, all accounts (or the",
  "     selected account). Demo data: earlier months walk back deterministically from the ending balance; the backend",
  "     would supply real month-end balances. The hover reads the month and the amount. */",
  "  function bankMonthLabels(){var M=[\"Jan\",\"Feb\",\"Mar\",\"Apr\",\"May\",\"Jun\",\"Jul\",\"Aug\",\"Sep\",\"Oct\",\"Nov\",\"Dec\"],out=[],i;for(i=11;i>=0;i--){var d=new Date(2026,7-i,1);out.push(M[d.getMonth()]+\" \"+d.getFullYear());}return out;}",
  "  function bankHistory(w){var sel=bankSelected(w),end=sel?bankEnding(sel):bankTotal(w),seed=sel?(sel.name.length*7+sel.acct.length):11,out=[],v=end,i;",
  "    for(i=11;i>=0;i--){out[i]=Math.round(v);var f=1+Math.sin(seed*1.7+i*1.31)*0.055-0.008;v=v/f;}return out;}",
  "  function bankSpark(w){var run=bankHistory(w),mx=Math.max.apply(null,run),mn=Math.min.apply(null,run);",
  "    if(run.length<2||mx===mn)return \"\";",
  "    var sel=bankSelected(w),who=sel?sel.name:\"all bank accounts\";",
  "    var lbl=\"Month-end balance of \"+who+\" over the last twelve months. Hover to read a month and its amount\";",
  "    /* depSparkHTML hard-codes the Deposits aria text, so the label is set here */",
  "    return depSparkHTML({s:run,labs:bankMonthLabels()},\"bank-spark\",lbl).replace(/aria-label=\"[^\"]*\"/,'aria-label=\"'+lbl.replace(/\"/g,\"&quot;\")+'\"');}",
  ""].join(NL);
t = t.slice(0, s) + fn + t.slice(e);
console.log("edited: 12-month sparkline");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
