/* One-off, 2026-09-28: the retired drill's CSS goes with it.

   The inline donor drill was replaced by the pop-up, so its pager, its wrapper
   and its pledge-row rules are orphaned. The generic orphan sweep will not
   catch them, by design: its concatenation test asks whether any string literal
   contains a five-character prefix of the class, and "gpf-p" appears in
   gpf-pill, gpf-prow and gpf-panel, so gpf-pager and gpf-pgbtn read as possibly
   built at run time. That test is deliberately over-cautious; this removal is
   specific, and each class is proved absent outside the stylesheet first.

   The expand-caret rotation goes too: no gpf element carries is-exp any more,
   now that nothing expands in place. The caret itself stays on the table row,
   where it signals that the row opens something.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");

const a0 = t.indexOf("<style>"), b0 = t.indexOf("</style>");
const outside = t.slice(0, a0) + t.slice(b0);
const DEAD = ["gpf-pager", "gpf-pgcount", "gpf-pages", "gpf-pgbtn", "gpf-drill", "gpf-plrow"];
DEAD.forEach(n => {
  const used = (outside.match(new RegExp(n + "(?![a-z0-9-])", "g")) || []).length;
  if (used) throw new Error(n + " is still used outside the stylesheet (" + used + " times)");
});

let sheet = t.slice(a0, b0);
let dropped = 0;
sheet.split(NL).forEach(line => {
  const s = line.trim();
  if (s.charAt(0) !== "." || s.indexOf("{") < 0) return;
  const sel = s.slice(0, s.indexOf("{"));
  const names = (sel.match(/\.([a-z][a-z0-9-]*)/g) || []).map(x => x.slice(1));
  const hit = names.some(x => DEAD.indexOf(x) > -1);
  const isExpCaret = sel.indexOf(".gpf-root .is-exp>.gpf-caret") === 0;
  if (hit || isExpCaret) { sheet = sheet.split(NL + line).join(""); dropped++; }
});
if (dropped < 9) throw new Error("only " + dropped + " rules dropped; expected 9 or more");

const bal = x => { let d = 0; for (const c of x) { if (c === "{") d++; else if (c === "}") d--; if (d < 0) return -1; } return d; };
if (bal(sheet) !== 0) throw new Error("the removal unbalanced the stylesheet");
t = t.slice(0, a0) + sheet + t.slice(b0);
DEAD.forEach(n => { if (new RegExp("\." + n + "(?![a-z0-9-])").test(t)) throw new Error(n + " survives"); });
if (t.indexOf(".gpf-root .is-exp>.gpf-caret") > -1) throw new Error("the caret rotation survives");
if (t.indexOf("gpf-caret{") < 0) throw new Error("the caret itself was wrongly removed");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
fs.writeFileSync(FILE, t);
console.log("dropped " + dropped + " orphaned drill rules");
