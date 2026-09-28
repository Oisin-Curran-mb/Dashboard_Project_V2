/* One-off, 2026-09-28: rewrite the W17 entry in _tools/widget-map.json into the
   finalised shape the review pack expects, matching W13, W15 and W16. The "jo"
   sub-object goes with her block. */
"use strict";
const fs = require("fs"), path = require("path");
const P = path.join(__dirname, "..", "widget-map.json");
const raw = fs.readFileSync(P, "utf8");
const NL = raw.indexOf("\r\n") > -1 ? "\r\n" : "\n";
const m = JSON.parse(raw);
const w = m.widgets || m;
if (!w.W17 || !w.W17.jo) throw new Error("the W17 entry is not in the pre-finalisation shape");

w.W17 = {
  name: "Gifts Pledges",
  driver: "w17-gifts.driver.js",
  decided: "2026-09-28 OC (rebuilt on the owner's rulings: Received carries both pledge payments and other gifts, every figure obeys the date window, the pop-up is a giving ledger; Jo's block deleted)",
  removed: ["gifts-mb"],
  baselineDrop: [
    '{id:"gft",', '{id:"gft_k",', '{id:"gft2",', '{id:"gft3",', '{id:"gft4",', '{id:"gft5",',
    '{id:"gpF2",', '{id:"gpF3",', '{id:"gpF4",', '{id:"gpF5",'
  ],
  baselineNote: "The block keeps prefix gpF and takes over kind gifts. The sixty gft-* classes it used to borrow were copied into its own CSS as gpf-* before her block was deleted, so it declares everything it draws with.",
  final: {
    kind: "gifts",
    prefix: "gpF",
    css: {
      start: '/* ===== W17 Gifts Pledges V2 CSS , prefix gpF , kind "gifts" ===== */',
      end: "/* ===== end W17 Gifts Pledges V2 CSS ===== */"
    },
    js: { start: "var GPF_TODAY=", end: "/* ===== end W17 Gifts Pledges V2 ===== */" },
    registry: { grep: ['kind:"gifts"'] }
  }
};

/* the schema note at the top described the -mb convention, which no widget uses now */
if (typeof m.note === "string" && m.note.indexOf("-mb") > -1) {
  m.note = m.note.replace(/\s*Kinds:[^"]*$/, "") +
    " Every widget is decided: each entry's `final` block names the kind and prefix that shipped.";
}

let out = JSON.stringify(m, null, 2);
if (NL === "\r\n") out = out.split("\n").join(NL);
fs.writeFileSync(P, out + NL);
console.log("W17 map entry rewritten in the finalised shape; the jo sub-object is gone");
