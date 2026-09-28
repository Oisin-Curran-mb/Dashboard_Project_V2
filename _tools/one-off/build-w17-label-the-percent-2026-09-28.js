/* One-off, 2026-09-28: two labels the un-blending made necessary. Found by measuring in
   the browser, not by reading the markup.

   1. A BARE PERCENT THAT NO LONGER MATCHES THE LINE UNDER IT. A Giving row printed
      "82.00%" top right over the foot line "$236,500 received of $250,000 pledged". While
      Received was blended the two agreed. Now the percent is pledge payments over the
      pledge ($205,000 of $250,000) and the foot line still states the whole purpose's
      giving, so a reader dividing the two figures in front of them gets 94.6% and has to
      wonder which is wrong. The percent now says what it measures, "82.00% paid", carries
      the full sentence in the shell's delegated tooltip, and the aria line says it too.

   2. TWO SUB-LINES THAT DID NOT FIT. Measured: the name cell is 81px in the Pledges table
      and 139px in the Gifts table, and both sub-lines overflowed it (158px of text in
      115px). The Pledges sub-line also repeated two of the row's own columns back at it.
      Each now says the one thing its columns do not.
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

/* ---- 1. the Giving row's percent says what it measures ---- */
swap(
  `    var pctTxt=(r.pledgeTotal>0)?(r.windowed?'':gpFPct(r.fulfilled)):'gifts only';
    var target=(r.pledgeTotal>0)?(' of '+gpFMoney0(r.pledgeTotal)+' pledged'):'';
    var sr=r.label+', '+gpFMoney0(r.totalIn)+' received'+target+'. '+gpFSplitLine(r)+'. '+lbl+'.';`,
  `    /* The percent measures the DARK segment against the track: pledge payments over the
       amount pledged. It is not the whole purpose's giving over the pledge, which is what
       the foot line states, so it says "paid" and carries the arithmetic in its tooltip. */
    var pctTxt=(r.pledgeTotal>0)?(r.windowed?'':(gpFPct(r.fulfilled)+' paid')):'gifts only';
    var pctTip=(r.pledgeTotal>0&&!r.windowed)?(gpFMoney0(r.fromPledgesThru)+' paid against '+gpFMoney0(r.pledgeTotal)+' pledged. Gifts with no pledge behind them count in the total, not here.'):'';
    var target=(r.pledgeTotal>0)?(' of '+gpFMoney0(r.pledgeTotal)+' pledged'):'';
    var sr=r.label+', '+gpFMoney0(r.totalIn)+' received'+target+'. '+gpFSplitLine(r)+'.'+(pctTip?(' '+pctTip):'')+' '+lbl+'.';`,
  "the Giving percent says paid, and explains itself");

swap(
  `<span class="gpf-p-pct" style="color:'+col+'">'+pctTxt+'</span>`,
  `<span class="gpf-p-pct" style="color:'+col+'"'+(pctTip?(' data-tip="'+gpFEsc(pctTip)+'" data-tip-plain'):'')+'>'+pctTxt+'</span>`,
  "and hovers with the two amounts behind it");

/* ---- 2. the sub-lines say what their columns do not ---- */
swap(
  `  var sub=(r.pledgeTotal>0)?(gpFMoney0(r.fromPledgesThru)+' of '+gpFMoney0(r.pledgeTotal)+' pledged \\u00b7 '+gpFPct(r.fulfilled)+' fulfilled'):'Nothing pledged';`,
  `  /* The row's own cells already carry Received and Pledge Total, so the sub-line adds the
     one thing they do not: how far through the pledge that leaves the purpose. Measured: the
     name cell is 81px wide here, so the wording is held to what fits. */
  var sub=(r.pledgeTotal>0)?(gpFPct(r.fulfilled)+' paid'):'Nothing pledged';`,
  "the Pledges sub-line stops repeating its own columns");

swap(
  `  var sub=r.hasPledges?'Also has pledges, under Pledges':'No pledges on this purpose';`,
  `  var sub=r.hasPledges?'Also has pledges':'No pledges';`,
  "the Gifts sub-line fits its cell");

/* ---- guards ---------------------------------------------------------- */
const W17 = t.slice(t.indexOf("var GPF_TODAY="), t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */"));
const code = W17.replace(/\/\*[\s\S]*?\*\//g, "");
if (code.indexOf("gpFPct(r.fulfilled)+' paid'") < 0) throw new Error("the Giving percent is still bare");
if (code.indexOf("data-tip=\"'+gpFEsc(pctTip)") < 0) throw new Error("the percent has no tooltip");
if (code.indexOf("gpFPct(r.fulfilled)+' paid'):'Nothing pledged'") < 0) throw new Error("the Pledges sub-line was not replaced");
if (code.indexOf("'Also has pledges'") < 0) throw new Error("the Gifts sub-line was not shortened");
if (code.indexOf("Also has pledges, under Pledges") > -1) throw new Error("the long Gifts sub-line survives");
/* the tooltip must never claim a figure the window cannot support */
if (!/pctTip=\(r\.pledgeTotal>0&&!r\.windowed\)/.test(code)) throw new Error("the tooltip is not gated on the window");

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("W17: the percent names what it measures, and both sub-lines fit");
