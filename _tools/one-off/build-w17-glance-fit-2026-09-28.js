/* One-off, 2026-09-28: finish what removing the Glance chip started.

   The owner removed the "Gifts and Pledges" chip so Glance would fit better.
   Measured after that removal, it still overflowed: the card body clips at
   137px with overflow hidden and the content stood at 145px, which is why the
   split line was cut through the middle of its text on screen.

   Two changes, both confined to Glance.

   1. THE SPLIT LINE GETS A COMPACT FORM AT GLANCE. "$325,951 from pledges,
      $56,940 from other gifts" wraps to two lines in a Glance-width card. At
      Glance it reads "$325,951 pledged, $56,940 gifts", which fits one line.
      Explore and Detail keep the full wording, where there is room, and the
      screen-reader text keeps the full wording everywhere.

   2. THE DATE CHIP'S LABEL STOPS ELLIPSISING. Measured at 73px of space for
      74px of text: "Aug 19, 2026" lost its last character to an ellipsis for
      the sake of one pixel. The label inherits shrink-to-fit from the shared
      .fc-label; the date is short and fixed, so it takes its natural width.
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
  log.push("edited: " + a0.slice(0, 54).replace(/\s+/g, " "));
}

/* 1. a compact split line, used at Glance only */
swap(`function gpFSplitLine(r){`,
`/* The same reading in fewer words, for the one tier with no room to spare.
   The full wording is kept for Explore, Detail and every aria string. */
function gpFSplitLineShort(r){
  if(!(r.received>0))return 'Nothing received';
  if(!(r.fromPledges>0))return gpFMoney0(r.other)+' gifts, no pledge';
  if(!(r.other>0))return gpFMoney0(r.fromPledges)+' all pledged';
  return gpFMoney0(r.fromPledges)+' pledged, '+gpFMoney0(r.other)+' gifts';
}
function gpFSplitLine(r){`);
swap(`      '<span class="gpf-glance-cap'+(t.status==='funded'?' gpf-cap-ok':'')+'">'+gpFSplitLine(t)+'</span></div>'+`,
     `      '<span class="gpf-glance-cap'+(t.status==='funded'?' gpf-cap-ok':'')+'">'+gpFSplitLineShort(t)+'</span></div>'+`);

/* 2. the date label takes its natural width */
swap(`  .gpf-root .gpf-datechip .fc-label{font-variant-numeric:tabular-nums;}`,
`  /* the date is short and fixed, so it does not shrink into an ellipsis for
     the sake of a pixel, which is what the shared .fc-label was doing */
  .gpf-root .gpf-datechip .fc-label{font-variant-numeric:tabular-nums;flex:0 0 auto;overflow:visible;text-overflow:clip;white-space:nowrap;}`);

/* guards */
if ((t.match(/gpFSplitLineShort/g) || []).length < 2) throw new Error("the compact line is never used");
if (t.indexOf("' from pledges, '") < 0) throw new Error("the full wording was lost");
{
  /* the full wording must still reach Explore, Detail and the aria text */
  const uses = (t.match(/gpFSplitLine\(/g) || []).length;
  if (uses < 3) throw new Error("the full split line is used only " + uses + " times; expected the headline, the legend and the aria text");
}
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("Glance fits and the date chip reads in full");
