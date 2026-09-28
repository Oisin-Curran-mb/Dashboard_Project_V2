/* One-off, 2026-09-28: the Pledges row loses its sub-line.

   Measured in the browser, after the sub-line was shortened once already: the name cell is
   81px wide in the Pledges table (six columns in a 568px card), its sub-line has about 57px
   of usable width, and "82.00% paid" needs 68px. It was still truncating.

   Shortening it again was the wrong answer. The row already carries Percent Due in its own
   column, so a second, differently-based percentage beside it ("82.00% paid" against
   "6.77%") is two numbers about the same pledge, each correct, inviting the reader to pick
   the wrong one. The legacy panel's row has no sub-line at all, and this mode exists to be
   one to one with it. So the sub-line goes, and the name has the cell to itself.

   The Gifts row keeps its own sub-line, which measures 114px in a 114px slot and says the
   one thing its columns do not: whether the purpose also has a pledged position.
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

swap(
  `  /* The row's own cells already carry Received and Pledge Total, so the sub-line adds the
     one thing they do not: how far through the pledge that leaves the purpose. Measured: the
     name cell is 81px wide here, so the wording is held to what fits. */
  var sub=(r.pledgeTotal>0)?(gpFPct(r.fulfilled)+' paid'):'Nothing pledged';
`,
  ``,
  "the Pledges sub-line is dropped");

swap(
  `    '<span class="gpf-c-nm"><span class="gpf-caret" aria-hidden="true">'+ICON('chevron_right')+'</span><span class="gpf-nmtxt"><span class="gpf-nm">'+r.label+badge+'</span><span class="gpf-nmsub">'+sub+'</span></span></span>'+
    '<span class="gpf-c-n">'+gpFMoney(r.pledgeTotal)+'</span>'+`,
  `    /* No sub-line: every figure this row can state is in its own cell, and a second
       percentage beside Percent Due would be two numbers about one pledge. */
    '<span class="gpf-c-nm"><span class="gpf-caret" aria-hidden="true">'+ICON('chevron_right')+'</span><span class="gpf-nmtxt"><span class="gpf-nm">'+r.label+badge+'</span></span></span>'+
    '<span class="gpf-c-n">'+gpFMoney(r.pledgeTotal)+'</span>'+`,
  "and the name has its cell to itself");

/* ---- guards ---------------------------------------------------------- */
const W17 = t.slice(t.indexOf("var GPF_TODAY="), t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */"));
const code = W17.replace(/\/\*[\s\S]*?\*\//g, "");
const srow = /function gpFSummaryRow[\s\S]*?\n}/.exec(code)[0];
if (srow.indexOf("gpf-nmsub") > -1) throw new Error("the Pledges row still renders a sub-line");
if (srow.indexOf("var sub=") > -1) throw new Error("the Pledges row still builds a sub-line");
const grow = /function gpFGiftsRow[\s\S]*?\n}/.exec(code)[0];
if (grow.indexOf("gpf-nmsub") < 0) throw new Error("the Gifts row lost its sub-line, which fits and is wanted");
/* the class stays declared and stays used, so neither lint rule fires */
if (t.indexOf(".gpf-root .gpf-nmsub") < 0) throw new Error("the sub-line rule was declared away");
/* the aria line still carries everything the row states */
if (srow.indexOf("percent due") < 0) throw new Error("the row's screen-reader line lost its figures");

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("W17: the Pledges row reads like the panel's row, name and five figures");
