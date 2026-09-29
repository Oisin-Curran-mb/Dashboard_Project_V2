/* One-off, 2026-09-28. Part E: layout defect found by measuring the new board in the browser, not by
   eyeballing it (W13's header has broken twice in ways only measuring caught).

   Each column header sized itself to its own title, so the four card bodies started at four different
   heights: 524, 539, 524 and 511px at Detail. Approved (no threshold line) sat 13px high, and the
   wrapped "Lanette Stewart or Jim AndersonAndMoreLetters" pushed its column 28px low. The cards read as
   a ragged row instead of a board.

   Fix: the path board gets its own class, and on it every column header is one fixed height, tall
   enough for a two-line title plus the threshold line, with the title clamped to two lines so the
   header can never grow past it at a narrower width. The full "Starts with ... from $500" wording is
   already the column's accessible name, so clamping loses nothing. Titles and counts align to the top.
   The payment board is untouched: the class is only added when the process is off, so its markup stays
   byte for byte what the owner signed off. Defect, so fixed without asking and logged (owner, 25 Sep). */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

swap('  return \'<div class="purf-kanban purf-board" data-purf-tier="\'+tier+\'" style="grid-template-columns:\'+gtc+\'">\'+cs+fin+\'</div>\';',
  '  return \'<div class="purf-kanban purf-board\'+(PURF_USE_PAY?"":" purf-pathboard")+\'" data-purf-tier="\'+tier+\'" style="grid-template-columns:\'+gtc+\'">\'+cs+fin+\'</div>\';', "board carries the path-board class");

t = t.slice(0, b0) + blk + t.slice(b1);

const CEND = "/* ===== end W13 Purchasing Management V2 CSS ===== */";
if (t.split(CEND).length !== 2) throw new Error("css end");
t = t.replace(CEND, [
  "  /* One header height for every column, so the cards across the board start on the same line. Tall",
  "     enough for a two-line title plus the threshold line; the title clamps to two lines so a narrow",
  "     column cannot push the header taller and make the row ragged again. */",
  "  .purf-root .purf-pathboard .purf-kcol-h{min-height:46px;align-items:flex-start;}",
  "  .purf-root .purf-pathboard .purf-kcol-ttl .purf-kcol-t,.purf-root .purf-pathboard .purf-kcol-h>.purf-kcol-t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-height:30px;}",
  CEND].join(NL));
console.log("edited: one header height across the path board");

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
