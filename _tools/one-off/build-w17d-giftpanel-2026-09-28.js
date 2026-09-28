/* One-off, 2026-09-28, Phase D: the pledge's gift history gains the same columns the standalone
   gift expansion has (arrived by, prompted by) and obeys the window per gift line instead of the
   old all-or-nothing pledge date. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
function replaceFn(name, next) {
  const head = "function " + name + "(";
  const i = t.indexOf(head); if (i < 0) throw new Error("missing: " + name);
  if (t.indexOf(head, i + 1) > -1) throw new Error("ambiguous: " + name);
  let d = 0, end = -1;
  for (let k = t.indexOf("{", i); k < t.length; k++) { if (t[k] === "{") d++; else if (t[k] === "}") { d--; if (!d) { end = k + 1; break; } } }
  t = t.slice(0, i) + next + t.slice(end); console.log("replaced fn: " + name);
}
replaceFn("gpFGiftPanel", [
  "function gpFGiftPanel(pl,iso,win){",
  "  win=win||{start:null,end:iso};",
  "  var gifts=(pl.gifts||[]).filter(function(g){return gpFInWindow(g.date,win);});",
  "  var sum=0;gifts.forEach(function(g){sum+=g.amount;});",
  "  var head='<div class=\"gft-drawer-h\">Gifts applied to this pledge</div>';",
  "  if(!gifts.length){",
  "    return '<div class=\"gft-drawer gpf-drawer\" role=\"region\" aria-label=\"'+gpFEsc('Gifts applied to the '+pl.donor+' pledge')+'\">'+head+",
  "      '<div class=\"gft-tab-empty\">'+ICON('volunteer_activism')+'No gifts have been applied to this pledge inside the current dates.</div></div>';",
  "  }",
  "  var body='<div class=\"gft-grow gft-ghead gpf-ldr-hist\"><span>Gift date</span><span>Arrived by</span><span>Prompted by</span><span>Reference</span><span class=\"gft-ga\">Amount</span></div>';",
  "  gifts.forEach(function(g){",
  "    body+='<div class=\"gft-grow gpf-ldr-hist\"><span>'+gpFFmtDate(g.date)+'</span><span>'+gpFEsc(g.media||'')+'</span><span>'+gpFEsc(g.motive||'')+(g.motiveCode?(' ('+g.motiveCode+')'):'')+'</span><span>'+gpFEsc(g.ref)+'</span><span class=\"gft-ga\">'+gpFMoney(g.amount)+'</span></div>';",
  "  });",
  "  return '<div class=\"gft-drawer gpf-drawer\" role=\"region\" aria-label=\"'+gpFEsc('Gifts applied to the '+pl.donor+' pledge')+'\">'+head+",
  "    '<div class=\"gft-gifts\">'+body+'</div>'+",
  "    '<div class=\"gpf-giftfoot\">Total received: '+gpFMoney(sum)+' across '+gifts.length+' gift'+(gifts.length===1?'':'s')+' applied to this pledge</div></div>';",
  "}",
  ""].join(NL));
const a = "gpFGiftPanel(it.pledge,win.end)"; if (t.split(a).length !== 2) throw new Error("ledger call");
t = t.replace(a, "gpFGiftPanel(it.pledge,win.end,win)"); console.log("ledger passes the window to the history");
const CEND = "  /* ===== end W17 Gifts Pledges V2 CSS ===== */";
t = t.replace(CEND, "  .gpf-root .gpf-ldr-hist,.gpf-modal .gpf-ldr-hist{display:grid;grid-template-columns:1fr 1fr 1.4fr 1fr auto;gap:10px;}" + NL + CEND);
console.log("history grid CSS");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
