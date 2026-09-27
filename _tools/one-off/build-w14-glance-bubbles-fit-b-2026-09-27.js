/* One-off, 2026-09-27: second fit pass for the Glance bubbles (still 8px over the 127px body). Bubble vertical
   padding 4 -> 2 and Glance vertical padding 10 -> 6. Tiles, search and the row scrollbar are unchanged. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap("padding:4px 6px;border-radius:12px;background:var(--wn-250);}", "padding:2px 6px;border-radius:12px;background:var(--wn-250);}", "bubble padding 2px 6px");
swap("  .mct-glance{padding:10px 12px;min-height:0;overflow:hidden;", "  .mct-glance{padding:6px 12px;min-height:0;overflow:hidden;", "glance padding 6px 12px");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
