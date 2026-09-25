/* One-off, 2026-09-25: comment diet on OUR code in index.html (decision D10).
   Jo's lines (present in _tools/baselines/index.a548419.html) are never touched,
   except that a comment BLOCK which starts on one of our lines is removed whole,
   including its closing line, so no orphan "*\/" is left behind.

   Rules
     - Region banners (our "/* ===== Wnn <Name> V2 ..." lines and their "end"
       lines) are kept and normalised to ONE line: "/* ===== text ===== *\/".
       Any continuation lines of a multi-line banner are dropped.
     - The "(OC) driver fixtures" blocks are kept whole: the cmp driver filters
       on them and the widget drivers read registry rows out of them. They go
       when their widget is finalised.
     - Any other comment-only block or line of ours that reads as HISTORY
       (dates, stash, rebase, adopted, build sheet rows, owner ruling, Step 4/5,
       "Jo's", untouched, superseded, driver/assert notes, Confluence, port notes)
       is removed. Comments that describe what code does are kept.
     - Runs of blank lines we create are collapsed to one.
   Prints what it removed. Idempotent. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const FILE = path.join(ROOT, "index.html");
const dry = process.argv.indexOf("--dry") > -1;

const base = new Set(fs.readFileSync(path.join(__dirname, "..", "baselines", "index.a548419.html"), "utf8").split("\r\n"));
const L = fs.readFileSync(FILE, "utf8").split("\r\n");

const HISTORY = /20\d\d-\d\d|stash@|REBASED|rebase|adopted|Adopt|Keep Jo|Build Sheet|build sheet|row W\d\d|W\d\d-(GL|EX|DE|ST|AL)-\d\d|owner ruling|owner deltas|owner-directed|Owner delta|Step [345]\b|Jo's|Jo already|untouched|superseded|driver|assert|Confluence|re-port|RE-PORT|port(ed)? (of|from|into)|FIRST-EVER|Final Check|mockup|Mockups|V2 from|cloned|CLONE|DUPLICATE|reference build|rev \d|v\d\.\d|\(OC\)|MB updated|phase-2|commit [0-9a-f]{7}|@ [0-9a-f]{7}|PR #|design-sandbox|Aditya_Widget_Design|Dashboard Container Demo/;
const isBanner = function (t) { return /^\/\*\s*=+\s*(end )?W\d\d .* V2\b/.test(t) || /^\/\*\s*=+\s*(end )?Comparison note V2/.test(t); };
const isFixtureStart = function (t) { return t.indexOf("(OC) driver fixtures") > -1; };

const out = [];
let removed = 0, bannersFixed = 0, blocksDropped = 0, i = 0;
const dropped = [];

while (i < L.length) {
  const l = L[i], t = l.trim(), ours = !base.has(l);

  /* a comment block starting here? */
  const startsBlock = t.startsWith("/*");
  if (startsBlock) {
    /* find its extent (closing "*\/" may be on the same line) */
    let j = i, closed = t.indexOf("*/", 2) > -1;
    while (!closed && j + 1 < L.length) { j++; closed = L[j].indexOf("*/") > -1; }
    const block = L.slice(i, j + 1);
    const tail = L[j].slice(L[j].indexOf("*/") + 2); /* code after the closer, if any */

    if (!ours) { /* Jo's block: keep whole */ out.push.apply(out, block); i = j + 1; continue; }

    if (isBanner(t)) {
      const text = t.replace(/^\/\*\s*=+\s*/, "").replace(/\s*=*\s*(\*\/)?\s*$/, "").trim();
      const indent = l.slice(0, l.indexOf("/*"));
      out.push(indent + "/* ===== " + text + " ===== */");
      if (tail.trim()) out.push(tail);
      if (block.length > 1 || l.trim() !== indent.trim() + "/* ===== " + text + " ===== */") bannersFixed++;
      removed += block.length - 1;
      i = j + 1; continue;
    }
    if (isFixtureStart(t)) { out.push.apply(out, block); i = j + 1; continue; }

    const body = block.join("\n");
    if (HISTORY.test(body)) {
      blocksDropped++; removed += block.length;
      dropped.push(String(i + 1) + ": " + t.slice(0, 90));
      if (tail.trim()) out.push(tail);
      i = j + 1; continue;
    }
    out.push.apply(out, block); i = j + 1; continue;
  }

  /* single-line // comment of ours */
  if (ours && t.startsWith("//") && HISTORY.test(t)) { removed++; dropped.push(String(i + 1) + ": " + t.slice(0, 90)); i++; continue; }

  out.push(l); i++;
}

/* collapse blank runs that involve at least one line of ours */
const final = [];
for (let k = 0; k < out.length; k++) {
  if (out[k].trim() === "" && final.length && final[final.length - 1].trim() === "" && (!base.has(out[k]) || true)) { removed++; continue; }
  final.push(out[k]);
}

console.log("lines before " + L.length + ", after " + final.length + ", removed " + (L.length - final.length));
console.log("banners normalised: " + bannersFixed + "   history blocks dropped: " + blocksDropped);
if (dry) { console.log("\n-- would drop (first 60) --"); dropped.slice(0, 60).forEach(function (d) { console.log("  " + d); }); }
else fs.writeFileSync(FILE, final.join("\r\n"), "utf8");
