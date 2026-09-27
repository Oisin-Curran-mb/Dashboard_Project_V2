/* One-off, 2026-09-27: fit pass for Jo's Bank Glance pills row (146px wide). The static "vs beginning balance"
   label is hidden at Glance (the delta pill's tooltip carries it), the Overdrawn pill drops its trailing chevron
   and tightens, and the row's side padding and gap shrink so the two bubbles sit side by side. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap("  .bank-glrow{flex-direction:column;gap:4px;padding:8px 12px;}", "  .bank-glrow{flex-direction:column;gap:4px;padding:8px 8px;}", "row side padding 8");
swap("  .bank-glrow .bank-gl-pills::-webkit-scrollbar{display:none;}",
     "  .bank-glrow .bank-gl-pills::-webkit-scrollbar{display:none;}" + NL +
     "  .bank-glrow .bank-gl-pills{gap:4px;}" + NL +
     "  .bank-glrow .bank-gl-pills .trend-range.static{display:none;} /* the delta pill's tooltip carries 'vs beginning balance' */" + NL +
     "  .bank-glrow .bank-odpill{font-size:10.5px;padding:2px 5px;gap:1px;}" + NL +
     "  .bank-glrow .bank-odpill .material-symbols-rounded:last-child{display:none;}", "compact pills");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
