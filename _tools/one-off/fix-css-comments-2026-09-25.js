// One-off, 2026-09-25: three CSS comments contained a star-slash inside their text, which
// closes the comment early and leaves prose in the stylesheet. The browser then drops every
// rule from the first breakage onwards (found by the W04 browser check: nothing after file
// line ~1692 was applying). Two are Jo's v1 pension header comments (".modal*" + "/.donut"),
// one is a W01 comment-diet leftover, one is the W04 shared-.rem-* label. Anchored; aborts on a miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const fixes = [
  [".bgt-spin .cap .mi .modal*/.donut/.legend/.leg/.pie-wrap .sr-only.", ".bgt-spin .cap .mi .modal-* .donut .legend .leg .pie-wrap .sr-only.", 1],
  /* W02: three lines of prose left behind by the comment diet after a comment that already closed */
  ["\r\n  .donut/.legend/.leg/.pie-wrap .sr-only.\r\n   Only pen-* rules are defined here.\r\n   ===================================================================== */\r\n", "\r\n", 1],
  [".rem-bars/.rem-barrow/.rem-bartrack/.rem-fill-*/.rem-flag-* pacing bars, .rem-st-*/.rem-sw-* status chips", ".rem-bars .rem-barrow .rem-bartrack .rem-fill-* .rem-flag-* pacing bars, .rem-st-* .rem-sw-* status chips", 1]
];
fixes.forEach(function (f) { const n = t.split(f[0]).length - 1; if (n !== f[2]) throw new Error("anchor x" + n + ": " + f[0].slice(0, 50)); t = t.split(f[0]).join(f[1]); });
/* W01: prose after the closing of the trimmed comment */
const a = "  /* the visuals this widget adds on top of the copies above */ the owner deltas introduce.";
const i = t.indexOf(a); if (i < 0 || t.indexOf(a, i + 1) > -1) throw new Error("W01 anchor");
const eol = t.indexOf("\r\n", i);
t = t.slice(0, i) + "  /* the visuals this widget adds on top of the copies above */" + t.slice(eol);
/* prove no stray closer remains in the stylesheet */
const css = t.slice(t.indexOf("<style"), t.indexOf("</style>"));
let open = false, j = 0; while (j < css.length) { if (!open) { const o = css.indexOf("/*", j), c = css.indexOf("*/", j); if (c > -1 && (o < 0 || c < o)) throw new Error("stray */ remains at css offset " + c); if (o < 0) break; open = true; j = o + 2; } else { const c = css.indexOf("*/", j); if (c < 0) throw new Error("unclosed comment"); open = false; j = c + 2; } }
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: 4 comment fixes, stylesheet comments balanced, " + t.split("\r\n").length + " lines");
// Applied by hand after this script ran (same day): the restored shared .rem-* block ended one
// brace short (build-w04-fixup sliced the block before its closing "}" of the 560px media rule),
// so every later rule sat inside that media query. The "}" was put back after ".rem-sum{...}".
