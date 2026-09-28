/* One-off, 2026-09-28: the date chip printed the word "event".

   `.gpf-root .gpf-datechip::before{content:'event' !important;}` was copied in
   with Jo's classes, where it swapped the shared filter-chip glyph for a
   calendar. But the shared glyph rule is `.filter-chip[data-action]::before`,
   and this block's chips carry data-gpf, not data-action, so there was no glyph
   to override. The rule therefore added a ::before of its own with no icon
   font behind it, which renders the literal text "event" in the body font,
   beside the real calendar the markup already emits. Two glyphs' worth of
   space for one, and on a narrow card it pushed the date into an ellipsis.

   The markup's own ICON('event') is the calendar and stays.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");

const RULE = "  .gpf-root .gpf-datechip::before{content:'event' !important;}" + NL;
if (t.split(RULE).length - 1 !== 1) throw new Error("the ::before rule was not found exactly once");
t = t.split(RULE).join("");

/* prove the shared glyph really is gated on data-action, so nothing is lost */
const base = /\.filter-chip\[data-action\]::before/.test(t);
if (!base) throw new Error("the shared filter-chip glyph rule changed; re-check this removal");
if (/\.gpf-root \.gpf-datechip::before/.test(t)) throw new Error("the rule survives");
if (t.indexOf("ICON('event')") < 0) throw new Error("the markup's own calendar icon is missing");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
fs.writeFileSync(FILE, t);
console.log("the date chip no longer prints the word event");
