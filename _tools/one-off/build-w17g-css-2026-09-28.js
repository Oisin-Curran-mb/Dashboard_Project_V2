/* =====================================================================
   build-w17g-css-2026-09-28.js

   Two CSS repairs the drivers and the lint caught after the rebuild:

   (a) The nine ledger rules added in phase 3 began at `.gpf-modal`, not at
       `.gpf-root`. The modal is body-mounted inside a `.gpf-root` wrapper,
       so they landed correctly, but the house rule is that every rule in
       the block is root-scoped, and the driver enforces it.

   (b) `gpf-seg-other-tag`, the ledger's "Other gift" tag, had no rule, so
       the tag did not read as the same thing as the bar's other-gifts
       segment. It now takes the same token, --am-200.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "..", "index.html");
let s = fs.readFileSync(FILE, "utf8");
const before = s.length;
const crlfBefore = s.split("\r\n").length - 1;

/* (a) root-scope the nine ledger rules */
const LEAD = "\r\n  .gpf-modal .gpf-";
const n = s.split(LEAD).length - 1;
if (n !== 9) throw new Error("expected 9 unscoped ledger rules, found " + n);
s = s.split(LEAD).join("\r\n  .gpf-root .gpf-modal .gpf-");

/* (b) declare the other-gift tag next to the segment it echoes */
const ANCHOR = "  .gpf-root .gpf-lg-sw.gpf-seg-pledge,.gpf-root .gpf-lg-sw.gpf-seg-other{position:static;}\r\n";
if (s.split(ANCHOR).length - 1 !== 1) throw new Error("legend-swatch anchor not unique");
s = s.split(ANCHOR).join(ANCHOR +
  "  .gpf-root .gpf-seg-other-tag{background:var(--am-200);color:var(--am-700);}\r\n");

/* guards: nothing lost, no bare line feeds introduced */
let bare = 0;
for (let i = 0; i < s.length; i++) if (s[i] === "\n" && s[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
if (s.length <= before) throw new Error("file did not grow");
if (s.split("\r\n").length - 1 !== crlfBefore + 1) throw new Error("line count moved by more than the one rule added");

fs.writeFileSync(FILE, s);
console.log("W17 CSS: 9 ledger rules root-scoped, gpf-seg-other-tag declared");
