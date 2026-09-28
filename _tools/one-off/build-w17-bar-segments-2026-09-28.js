/* One-off, 2026-09-28: the bar's two segments (owner, annotated screenshot).

   "for the gift it should be straight line on the left and curved on the right
   and when you hover over it show how much for pledges and when hover over
   gifts it would show gift amount"

   1. THE SHAPES. Both segments inherited .gpf-fill, whose radius is rounded on
      the LEFT and square on the right. That is right for the pledge payments,
      which start at the track's left edge, and backwards for the other gifts,
      which butt against the pledge segment and end in open track. The other
      gifts segment is now square on the left and curved on the right.

      No special case is needed when a purpose has gifts and no pledge, so the
      gift segment starts at zero: the track carries the radius and clips, so
      the left end still reads as rounded.

   2. THE HOVER. Each segment names itself and its amount through the shell's
      delegated [data-tip] tooltip, so hovering the dark part says what came in
      against pledges and hovering the light part says what came in as other
      gifts. Whole dollars, matching the line printed under the bar.
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
  log.push("edited: " + a0.slice(0, 52).replace(/\s+/g, " "));
}

/* the markup: each segment carries its own amount */
swap(`    '<span class="gpf-fill gpf-seg-pledge" style="width:'+p.toFixed(1)+'%"></span>'+
    '<span class="gpf-fill gpf-seg-other" style="width:'+o.toFixed(1)+'%;left:'+p.toFixed(1)+'%"></span>'+`,
`    '<span class="gpf-fill gpf-seg-pledge" style="width:'+p.toFixed(1)+'%" data-tip="'+gpFEsc('Pledge payments: '+gpFMoney0(r.fromPledges))+'" data-tip-plain></span>'+
    '<span class="gpf-fill gpf-seg-other" style="width:'+o.toFixed(1)+'%;left:'+p.toFixed(1)+'%" data-tip="'+gpFEsc('Other gifts: '+gpFMoney0(r.other))+'" data-tip-plain></span>'+`);

/* the shapes */
swap(`  .gpf-root .gpf-seg-other{background:var(--am-200);position:absolute;top:0;bottom:0;}`,
`  /* straight where it meets the pledge payments, curved at the open end. The
     legend swatches take the same classes, so they are squared back below. */
  .gpf-root .gpf-seg-other{background:var(--am-200);position:absolute;top:0;bottom:0;border-radius:0 7px 7px 0;}
  .gpf-root .gpf-track-sm .gpf-seg-pledge{border-radius:5px 0 0 5px;}
  .gpf-root .gpf-track-sm .gpf-seg-other{border-radius:0 5px 5px 0;}`);
swap(`  .gpf-root .gpf-lg-sw.gpf-seg-pledge,.gpf-root .gpf-lg-sw.gpf-seg-other{position:static;}`,
     `  .gpf-root .gpf-lg-sw.gpf-seg-pledge,.gpf-root .gpf-lg-sw.gpf-seg-other{position:static;border-radius:3px;}`);

/* guards */
if (t.indexOf("border-radius:0 7px 7px 0") < 0) throw new Error("the gift segment's radius did not land");
{
  const segs = (t.match(/gpf-seg-(pledge|other)" style="width:/g) || []).length;
  if (segs !== 2) throw new Error("expected the two segment spans, found " + segs);
  const tips = (t.match(/gpf-seg-(pledge|other)" style="width:[^>]*data-tip=/g) || []).length;
  if (tips !== 2) throw new Error("both segments must carry a tip, found " + tips);
}
/* the legend swatch must not inherit the bar's asymmetric corners */
const lg = /\.gpf-root \.gpf-lg-sw\.gpf-seg-pledge,\.gpf-root \.gpf-lg-sw\.gpf-seg-other\{([^}]*)\}/.exec(t);
if (!lg || lg[1].indexOf("border-radius:3px") < 0) throw new Error("the legend swatches were not squared back");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("the gift segment is square left and curved right, and both segments name their amount on hover");
