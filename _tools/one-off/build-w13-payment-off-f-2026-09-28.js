/* One-off, 2026-09-28. Part F: a hover for a clamped column title.

   At a narrower Detail width the two-line clamp truncates a long Or level, so the board showed
   "Lanette Stewart or Jim..." with no way for a sighted user to read the rest. The full legacy wording
   was already the column's accessible name; it is now its title attribute too, so a hover gives
   everyone the same "Then Lanette Stewart or Jim AndersonAndMoreLetters from $2,000" the screen reader
   gets. Only the path board is touched: payment lanes pass no aria, so they pass no title. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

swap('    var ttl=\'<span class="purf-kcol-t" style="color:\'+c.tone+\'">\'+purFEsc(c.title)+\'</span>\';',
  '    var ttl=\'<span class="purf-kcol-t" style="color:\'+c.tone+\'"\'+(c.aria?\' title="\'+purFEsc(c.aria)+\'"\':"")+\'>\'+purFEsc(c.title)+\'</span>\';', "column title carries the full wording as a hover");

t = t.slice(0, b0) + blk + t.slice(b1);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
