/* One-off, 2026-09-27: the Glance bubbles added 12px to the tile row and the 127px Glance body clipped 3px.
   Bubble vertical padding 6 -> 4 and the Glance gap 12 -> 8 bring the row back inside the body. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap("  .mct-gsec{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;padding:6px;border-radius:12px;background:var(--wn-250);}",
     "  .mct-gsec{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;padding:4px 6px;border-radius:12px;background:var(--wn-250);}", "bubble padding");
swap("  .mct-glance{padding:10px 12px;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:12px;}",
     "  .mct-glance{padding:10px 12px;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:8px;}", "glance gap");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
