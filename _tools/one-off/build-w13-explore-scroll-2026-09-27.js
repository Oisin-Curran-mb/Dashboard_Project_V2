/* One-off, 2026-09-27: owner: "also allow scrolling of the colums in the explore view". At the wide
   (Explore) tier the four lanes plus the Finish column squeezed to ellipsised headers. Now each lane keeps
   a readable minimum width and the board scrolls sideways instead: the inline grid template uses
   minmax(150px,1fr) per lane and a fixed 96px Finish track at wide, and the board gets overflow-x:auto. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap('  var gtc="repeat("+lanes.length+",1fr)"+(finish?" 0.6fr":"");',
     '  /* Explore: lanes keep a readable minimum and the board scrolls sideways (owner, 27 Sep). */' + NL +
     '  var gtc=(tier==="wide")?("repeat("+lanes.length+",minmax(150px,1fr))"+(finish?" 96px":"")):("repeat("+lanes.length+",1fr)"+(finish?" 0.6fr":""));', "grid template per tier");
swap("  .purf-root .purf-board{flex:1;min-height:0;align-items:stretch;}",
     "  .purf-root .purf-board{flex:1;min-height:0;align-items:stretch;}" + NL +
     "  .purf-root[data-tier=\"wide\"] .purf-board{overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding-bottom:10px;}" + NL +
     "  .purf-root[data-tier=\"wide\"] .purf-col,.purf-root[data-tier=\"wide\"] .purf-finish{min-width:0;}", "board scrolls sideways at wide");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
