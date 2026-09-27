/* One-off, 2026-09-27: owner: "the scrolling should be for [the lanes] ... not scroll up and down, the
   scroll left to right". overflow-x:auto had forced a vertical scrollbar too, and the tallest lane ran
   about 40px past the fixed 496px widget because turn badges wrapped in 150px lanes. Lanes now hold
   180px (badges wrap less, cards are shorter, every lane fits) and the board hides vertical overflow. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap('("repeat("+lanes.length+",minmax(150px,1fr))"+(finish?" 96px":""))', '("repeat("+lanes.length+",minmax(180px,1fr))"+(finish?" 96px":""))', "lane minimum 180px");
swap('.purf-root[data-tier="wide"] .purf-board{overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding-bottom:10px;}',
     '.purf-root[data-tier="wide"] .purf-board{overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scrollbar-width:thin;padding-bottom:10px;}', "board: sideways only");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
