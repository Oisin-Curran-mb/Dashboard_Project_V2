/* One-off, 2026-09-27: third fit pass for the Glance bubbles (2px over the 127px body). The tile row's bottom
   padding 4 -> 2. Tiles, search and the scrollbar are unchanged. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const a = "  .mct-irow{display:flex;align-items:center;gap:8px;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:4px;min-width:0;}";
if (t.split(a).length !== 2) throw new Error("anchor");
t = t.replace(a, "  .mct-irow{display:flex;align-items:center;gap:8px;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:2px;min-width:0;}");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
