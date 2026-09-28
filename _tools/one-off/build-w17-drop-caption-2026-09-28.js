/* One-off, 2026-09-28: the Giving view's caption goes (owner struck it out).

   "What each purpose has received, most received first. The bar shows pledge
   payments and gifts separately. Select one to see every gift and pledge
   behind it." Three sentences telling you what the bars, the legend and the
   rows in front of you already say.

   The Summary Table's own caption is LEFT ALONE. It explains how Pledge Due
   and Percent Due are derived, which is reference rather than instruction, and
   it sits on the other view, which the owner was not looking at. Reported
   rather than removed on a guess.

   Two CSS rules go with the caption: both existed only to place the export
   button inside it, and the export button was removed earlier today.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];
function swap(a0, b0) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a0.slice(0, 64));
  t = t.split(a).join(b);
  log.push("edited: " + a0.slice(0, 50).replace(/\s+/g, " "));
}
function dropLine(needle, label) {
  const i = t.indexOf(needle);
  if (i < 0) throw new Error("anchor missing: " + label);
  if (t.indexOf(needle, i + 1) > -1) throw new Error("anchor ambiguous: " + label);
  const s = t.lastIndexOf(NL, i - 1) + NL.length, e = t.indexOf(NL, i) + NL.length;
  t = t.slice(0, s) + t.slice(e);
  log.push("dropped: " + label);
}

/* the caption itself, and the slot it occupied in the Giving wrapper */
dropLine(`  var cap='<div class="gpf-ctx gpf-cap">'+ICON("volunteer_activism")+'<span>What each purpose has received`,
         "the Giving view's caption");
swap(`  return '<div class="gpf-goalwrap">'+cap+'<div class="gpf-bars gpf-barscroll">'+body+'</div>'+legend+'</div>';`,
     `  return '<div class="gpf-goalwrap"><div class="gpf-bars gpf-barscroll">'+body+'</div>'+legend+'</div>';`);

/* the export button's placement rules, orphaned when the button was removed */
dropLine("  .gpf-root .gpf-cap .gpf-export{margin-left:auto;flex:0 0 auto;}", "the caption's export slot rule");
dropLine("  .gpf-root .gpf-export{align-self:flex-start;}", "the export button's own rule");

/* ------------------------------------------------------------- guards */
/* the about text and the view-toggle tip legitimately open with the same
   phrase, so the guard names the caption's own closing sentence */
if (t.indexOf("Select one to see every gift and pledge behind it.") > -1) throw new Error("the caption survives");
if (t.indexOf("gpf-export") > -1) throw new Error("an export rule survives");
{
  const a = t.indexOf("var GPF_TODAY="), b = t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */");
  const code = t.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, "");
  /* the Giving view must still render its bars and its legend */
  ["gpf-goalwrap", "gpf-barscroll", "gpf-legend", "gpf-lg-i"].forEach(n => {
    if (code.indexOf(n) < 0) throw new Error("the Giving view lost " + n);
  });
  /* no dangling reference to the removed local */
  if (/\+cap\+/.test(code.slice(code.indexOf("function gpFGivingBars"), code.indexOf("function gpFGoalBars")))) {
    throw new Error("gpFGivingBars still references its caption");
  }
  /* .gpf-cap is still earned by the pop-up note and the table caption */
  if (code.indexOf("gpf-ctx gpf-cap") < 0) throw new Error("no caption class remains in use, so its rule is now orphaned");
}
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("the Giving caption is gone; the Summary Table's reference note is left for the owner");
