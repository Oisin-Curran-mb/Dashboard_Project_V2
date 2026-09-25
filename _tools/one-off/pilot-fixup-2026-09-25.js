/* One-off, 2026-09-25, follow-up to pilot-w14-w08: the registry literal reads
   widget data (MYS_DEFAULT.slice()) at load, so a widget block must sit BEFORE
   `var dashboards=`, and WIDGETS must be defined before any block registers.
   Moves: WIDGETS -> top of the script IIFE; W08 and W14 blocks -> just before
   the P2/P3 widget blocks (which is where Jo kept her data). Marker-based,
   aborts before writing on any miss. */
"use strict";
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
const NL = "\r\n";
let text = fs.readFileSync(FILE, "utf8");
function once(n, label) { const i = text.indexOf(n); if (i < 0) throw new Error("missing: " + label); if (text.indexOf(n, i + 1) > -1) throw new Error("ambiguous: " + label); return i; }
function cutBlock(startNeedle, endNeedle, label) {
  const i = once(startNeedle, label + " start"); const j = text.indexOf(endNeedle, i); if (j < 0) throw new Error("missing end: " + label);
  const s = text.lastIndexOf(NL, i) + NL.length, e = text.indexOf(NL, j) + NL.length;
  const block = text.slice(s, e); text = text.slice(0, s) + text.slice(e);
  /* drop one blank line left behind, if any */
  if (text.slice(s, s + NL.length) === NL && text.slice(s - NL.length, s) === NL) text = text.slice(0, s) + text.slice(s + NL.length);
  console.log("cut " + block.split(NL).length + " lines: " + label); return block;
}
function insertBeforeLine(needle, block, label) { const i = once(needle, label); const s = text.lastIndexOf(NL, i) + NL.length; text = text.slice(0, s) + block + text.slice(s); console.log("inserted: " + label); }
function insertAfterLine(needle, block, label) { const i = once(needle, label); const e = text.indexOf(NL, i) + NL.length; text = text.slice(0, e) + block + text.slice(e); console.log("inserted: " + label); }

const widgets = cutBlock("  /* ===== Shell: widget registration =====", "    modal:function(){var m=modal&&this.modals[modal.type];return m?m():null;}};", "WIDGETS block");
insertAfterLine("<script>" + NL + "(function(){", widgets, "WIDGETS at top of the IIFE");

const w08 = cutBlock("/* ===== W08 My Status V2 =====", "/* ===== end W08 My Status V2 ===== */", "W08 block");
const w14 = cutBlock("/* ===== W14 Main Content Tasks V2 =====", "/* ===== end W14 Main Content Tasks V2 ===== */", "W14 block");
insertBeforeLine("  /* ===== P2/P3 WIDGET BLOCKS", w08 + NL + w14 + NL, "W08 + W14 before the registry");

const reg = once("  var dashboards=[", "registry");
["/* ===== end W08 My Status V2 ===== */", "/* ===== end W14 Main Content Tasks V2 ===== */", "modal:function(){var m=modal&&this.modals[modal.type];return m?m():null;}};"].forEach(function (n) {
  if (once(n, n) > reg) throw new Error("still after the registry: " + n);
});
if ((text.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, text, "utf8");
console.log("done: " + text.split(NL).length + " lines");
