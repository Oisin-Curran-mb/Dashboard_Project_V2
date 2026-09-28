/* One-off, 2026-09-28: the "Prompted by" column comes off the gift history.

   Owner: "drop Prompted by until we know it is wanted or needed because I dont
   think this is needed."

   Why it was questionable, from the legacy code:
     - GFHistory.MotivationID is real, and captured by a picker on Unposted
       Gifts / Update Gift, so the field exists
     - but it sits on the GIFT, not on the gift LINE. GFHistoryDetail, which
       carries PledgeID and PurposeID, has no motivation column
     - a motivation belongs to at most one purpose (GFMotivation.PurposeID),
       while the picker offers every motivation in the company, so a gift split
       across purposes carries one motivation for all its lines and it may
       belong to a purpose other than the one being read
     - this pop-up is scoped to ONE purpose, so it could print a motivation
       belonging elsewhere and never admit it

   "Until" is the operative word, so the MODEL KEEPS the field: GPF_MOTIVATIONS
   and the motive / motiveCode on each gift stay seeded. Bringing the column
   back is then two spans and a grid template, not a data change.

   The motivation also leaves the ledger's search haystack, so the search only
   matches what is on screen. Media stays in it, because "Arrived by" is still
   shown.

   Both grids drop from five columns to four. The gift row's aria-label drops
   the motivation too, so the reading order matches the screen.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];
function swap(a0, b0) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a0.slice(0, 66));
  t = t.split(a).join(b);
  log.push("edited: " + a0.slice(0, 50).replace(/\s+/g, " "));
}

/* the pledge's gift list: header and cell */
swap(`<span>Gift date</span><span>Arrived by</span><span>Prompted by</span><span>Reference</span><span class="gpf-ga">Amount</span></div>';
  gifts.forEach(function(g){`,
`<span>Gift date</span><span>Arrived by</span><span>Reference</span><span class="gpf-ga">Amount</span></div>';
  gifts.forEach(function(g){`);
swap(`'</span><span>'+gpFEsc(g.media||'')+'</span><span>'+gpFEsc(g.motive||'')+(g.motiveCode?(' ('+g.motiveCode+')'):'')+'</span><span>'+gpFEsc(g.ref)+'</span>`,
     `'</span><span>'+gpFEsc(g.media||'')+'</span><span>'+gpFEsc(g.ref)+'</span>`);

/* the standalone gift row's own detail: header and cell */
swap(`<div class="gpf-grow gpf-ghead"><span>Gift date</span><span>Arrived by</span><span>Prompted by</span><span>Reference</span><span class="gpf-ga">Amount</span></div>'+`,
     `<div class="gpf-grow gpf-ghead"><span>Gift date</span><span>Arrived by</span><span>Reference</span><span class="gpf-ga">Amount</span></div>'+`);
swap(`'<div class="gpf-grow"><span>'+gpFFmtDate(g.date)+'</span><span>'+g.media+'</span><span>'+g.motive+' ('+g.motiveCode+')</span><span>'+g.ref+'</span><span class="gpf-ga">'+gpFMoney(g.amount)+'</span></div></div>'`,
     `'<div class="gpf-grow"><span>'+gpFFmtDate(g.date)+'</span><span>'+g.media+'</span><span>'+g.ref+'</span><span class="gpf-ga">'+gpFMoney(g.amount)+'</span></div></div>'`);

/* four columns, not five */
swap(`  .gpf-root .gpf-modal .gpf-ldr-exp .gpf-grow{display:grid;grid-template-columns:1fr 1fr 1.4fr 1fr auto;gap:10px;}`,
     `  .gpf-root .gpf-modal .gpf-ldr-exp .gpf-grow{display:grid;grid-template-columns:1fr 1fr 1.2fr auto;gap:10px;}`);
swap(`  .gpf-root .gpf-ldr-hist,.gpf-modal .gpf-ldr-hist{display:grid;grid-template-columns:1fr 1fr 1.4fr 1fr auto;gap:10px;}`,
     `  .gpf-root .gpf-ldr-hist,.gpf-modal .gpf-ldr-hist{display:grid;grid-template-columns:1fr 1fr 1.2fr auto;gap:10px;}`);

/* the aria-label, and the search haystack */
swap(`var sr2=it.donor+', gift of '+gpFMoney(g.amount)+' on '+gpFFmtDate(g.date)+' by '+g.media+', '+g.motive+', reference '+g.ref+'.'`,
     `var sr2=it.donor+', gift of '+gpFMoney(g.amount)+' on '+gpFFmtDate(g.date)+' by '+g.media+', reference '+g.ref+'.'`);
swap(`refs:g.ref+' '+g.media+' '+g.motive`,
     `refs:g.ref+' '+g.media`);

/* ------------------------------------------------------------- guards */
if (t.indexOf("Prompted by") > -1) throw new Error("the column survives");
{
  const a = t.indexOf("var GPF_TODAY="), b = t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */");
  const code = t.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, "");
  /* the model keeps the field, so restoring the column is a markup change */
  ["GPF_MOTIVATIONS", "motive:mot.name", "motiveCode:mot.code"].forEach(n => {
    if (code.indexOf(n) < 0) throw new Error("the model lost " + n + "; it was meant to be kept");
  });
  /* but nothing renders or searches it any more */
  ["g.motive", "it.motive"].forEach(n => {
    if (code.indexOf(n) > -1) throw new Error("the motivation is still read for display or search: " + n);
  });
  /* both gift tables now have four headers */
  [/<span>Gift date<\/span><span>Arrived by<\/span><span>Reference<\/span><span class="gpf-ga">Amount<\/span>/g].forEach(re => {
    const n = (code.match(re) || []).length;
    if (n !== 2) throw new Error("expected two four-column gift headers, found " + n);
  });
  /* and the grids agree with them */
  if ((t.match(/grid-template-columns:1fr 1fr 1\.2fr auto/g) || []).length !== 2) {
    throw new Error("the two gift grids were not both narrowed to four columns");
  }
}
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("Prompted by is off the screen; the model still carries the field");
