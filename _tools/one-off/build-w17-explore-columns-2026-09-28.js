/* One-off, 2026-09-28: the Pledges table fits its card at Explore, and its caption shrinks.

   Both found by screenshotting and measuring, not by reading markup.

   1. THE PURPOSE NAME HAD 57px. Six columns at 82px, plus a 70px percent column, in a 568px
      card leaves the name cell 81px and its text 57px of that. "BLDGFUND: Building Fund"
      needs 166px, so every row read "BLDGF...". Narrowing the money columns is the wrong
      trade: a clipped money figure on a tax-tracked table is a worse defect than a clipped
      name, and real data holds larger amounts than this fixture. So at Explore the table
      drops PERCENT DUE, which is the one column a reader can derive from two others in the
      same row (Due Remaining over Pledge Due). Detail keeps all six, and every row's
      screen-reader line carries Percent Due at every size. The plan named this as the
      contingency if the measurement came out this way; it did.

   2. THE CAPTION RAN TO FOUR LINES. It gained two sentences when the table split, one of
      which repeated the date that is already in the chip beside it. The caption is already
      an open question with the owner, so it gets smaller, not larger.
*/
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0, why) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + (why || a0.slice(0, 64)));
  t = t.split(a).join(b);
  log.push("  " + (why || a0.slice(0, 52).replace(/\s+/g, " ")));
}

/* ---- 1. Percent Due is a Detail column ---- */
swap(
  `function gpFSummaryHead(){
  return '<div class="wt-row wt-head gpf-trow">'+
    '<span class="gpf-c-nm">Purpose</span>'+
    '<span class="gpf-c-n">Pledge Total</span>'+
    '<span class="gpf-c-n">Pledge Due</span>'+
    '<span class="gpf-c-n">Received</span>'+
    '<span class="gpf-c-n">Due Remaining</span>'+
    '<span class="gpf-c-n gpf-c-pct">Percent Due</span>'+
  '</div>';
}`,
  `/* Percent Due shows at Detail only. Measured: with it, the purpose name has 57px of the
   166px it needs at Explore. It is the one column derivable from two others in the same row,
   and it stays in every row's screen-reader line at every size. */
function gpFWidePct(w){return (w&&w.size==="xwide");}
function gpFSummaryHead(w){
  return '<div class="wt-row wt-head gpf-trow">'+
    '<span class="gpf-c-nm">Purpose</span>'+
    '<span class="gpf-c-n">Pledge Total</span>'+
    '<span class="gpf-c-n">Pledge Due</span>'+
    '<span class="gpf-c-n">Received</span>'+
    '<span class="gpf-c-n">Due Remaining</span>'+
    (gpFWidePct(w)?'<span class="gpf-c-n gpf-c-pct">Percent Due</span>':'')+
  '</div>';
}`,
  "Percent Due is a Detail column in the header");

swap(
  `    '<span class="gpf-c-n">'+gpFDueCell(r.dueRem)+'</span>'+
    '<span class="gpf-c-n gpf-c-pct">'+gpFPctCell(r.percentDue)+'</span>'+
  '</div>';
}`,
  `    '<span class="gpf-c-n">'+gpFDueCell(r.dueRem)+'</span>'+
    (gpFWidePct(w)?('<span class="gpf-c-n gpf-c-pct">'+gpFPctCell(r.percentDue)+'</span>'):'')+
  '</div>';
}`,
  "and in the row");

swap(
  `    '<span class="gpf-c-n">'+gpFDueCell(t.dueRem)+'</span>'+
    '<span class="gpf-c-n gpf-c-pct"></span>'+
  '</div>');`,
  `    '<span class="gpf-c-n">'+gpFDueCell(t.dueRem)+'</span>'+
    (gpFWidePct(w)?'<span class="gpf-c-n gpf-c-pct"></span>':'')+
  '</div>');`,
  "and in the totals row, which never summed it anyway");

swap(
  `  return '<div class="gpf-tblwrap">'+cap+'<div class="scroll gpf-scroll">'+gpFSummaryHead()+body+'</div>'+tot+'</div>';`,
  `  return '<div class="gpf-tblwrap">'+cap+'<div class="scroll gpf-scroll">'+gpFSummaryHead(w)+body+'</div>'+tot+'</div>';`,
  "the table passes its tier to the header");

/* ---- 2. the caption says the new thing once, and drops what the chip already says ---- */
swap(
  `  var cap='<div class="gpf-ctx gpf-cap"><span>The pledged position for every purpose with an active pledge, as the Gifts and Pledges panel reports it. Received counts money given against those pledges up to '+gpFFmtDate(gpFWindow(w).end)+'; gifts with no pledge behind them are under Gifts. Pledge Due is each donor pledge paced on its own begin to end term, and the full pledge once past its end date. Percent Due is Due Remaining over Pledge Due, so a negative value means over received.'+(trim?' Largest pledges first.':'')+'</span></div>';`,
  `  var cap='<div class="gpf-ctx gpf-cap"><span>The pledged position for every purpose with an active pledge, as the Gifts and Pledges panel reports it. Gifts with no pledge behind them are under Gifts. Pledge Due is each donor pledge paced on its own begin to end term, and the full pledge once past its end date.'+(gpFWidePct(w)?' Percent Due is Due Remaining over Pledge Due, so a negative value means over received.':'')+(trim?' Largest pledges first.':'')+'</span></div>';`,
  "the Pledges caption loses the date the chip already shows");

swap(
  `  var cap='<div class="gpf-ctx gpf-cap"><span>Money given to a purpose that is not against any pledge, '+gpFRangePhrase(w).charAt(0).toLowerCase()+gpFRangePhrase(w).slice(1)+'. A purpose appears here whether or not it also takes pledges, and the pledged position is under Pledges. Donors are counted once each.'+(trim?' Largest first.':'')+'</span></div>';`,
  `  var cap='<div class="gpf-ctx gpf-cap"><span>Money given to a purpose that is not against any pledge. A purpose appears here whether or not it also has pledges, and its pledged position is under Pledges. Donors are counted once each.'+(trim?' Largest first.':'')+'</span></div>';`,
  "and the Gifts caption does the same");

/* ---- guards ---------------------------------------------------------- */
const W17 = t.slice(t.indexOf("var GPF_TODAY="), t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */"));
const code = W17.replace(/\/\*[\s\S]*?\*\//g, "");
if ((code.match(/gpFWidePct/g) || []).length !== 5) {
  throw new Error("gpFWidePct is not read in its four places plus its definition: " + (code.match(/gpFWidePct/g) || []).length);
}
if (code.indexOf("gpFSummaryHead()") > -1) throw new Error("a caller still asks for the header without a tier");
/* the percent stays in the screen-reader line at every size */
const srow = /function gpFSummaryRow[\s\S]*?\n}/.exec(code)[0];
if (srow.indexOf("percent due \"+gpFPct(r.percentDue)") < 0) throw new Error("Percent Due left the row's screen-reader line");
/* D12: the header and the row gate the column on the SAME condition */
if ((srow.match(/gpFWidePct\(w\)/g) || []).length !== 1) throw new Error("the row does not gate exactly one column");
if (code.indexOf("gpFFmtDate(gpFWindow(w).end)") > -1) throw new Error("the caption still repeats the chip's date");

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("W17: Percent Due is a Detail column, and both captions are shorter");
