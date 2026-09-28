/* One-off, 2026-09-28: bring the W17 driver on to the finalised widget.
   Companion to build-w17-final-2026-09-28.js. Same shape as the W13, W15 and
   W16 driver renames.

     - the file becomes w17-gifts.driver.js (the -mb suffix went with the kind)
     - kind "gifts-mb" becomes "gifts"; the borrowed gft-* class list becomes gpf-*
     - section 13, which existed only to prove Jo's block was byte-unmodified,
       is deleted along with her block
     - the four review fixtures left the registry, so the driver builds those
       states itself, as W13's does
*/
"use strict";
const fs = require("fs");
const path = require("path");

const OLD = path.join(__dirname, "..", "w17-gifts-mb.driver.js");
const NEW = path.join(__dirname, "..", "w17-gifts.driver.js");
let s = fs.readFileSync(OLD, "utf8");
const NL = "\r\n";
const fix = x => x.split("\n").join(NL);

function swap(a0, b0, n) {
  const a = fix(a0), b = fix(b0), want = n === undefined ? 1 : n;
  const got = s.split(a).length - 1;
  if (got !== want) throw new Error("anchor appeared " + got + " times, wanted " + want + ": " + a0.slice(0, 80));
  s = s.split(a).join(b);
}

/* ---------------------------------------------- 1. drop section 13 entirely */
{
  const a = s.indexOf(fix("/* ------------- 13. Jo's own gifts widget: byte-unmodified after the port */"));
  if (a < 0) throw new Error("section 13 banner not found");
  /* it runs to the end of its IIFE; find the next top-level banner or the file end */
  let b = s.indexOf(fix("/* ---"), a + 20);
  if (b < 0) b = s.length;
  const cut = s.slice(a, b);
  if (cut.indexOf("byte-identical") < 0) throw new Error("the cut does not look like section 13");
  if (cut.indexOf("GPF_") < 0) throw new Error("the cut lost its bearings");
  s = s.slice(0, a) + s.slice(b);
  console.log("  dropped section 13 (" + (cut.split(NL).length - 1) + " lines)");
}

/* -------------------------- 2. the borrowed class list is ours now, as gpf-* */
{
  const a = s.indexOf(fix('  "gft-hd", "gft-numwrap",'));
  const b = s.indexOf(fix('  "filter-chip", "fc-label",'));
  if (a < 0 || b < 0 || b < a) throw new Error("the borrowed class list was not found");
  const list = s.slice(a, b);
  const n = (list.match(/"gft-/g) || []).length;
  if (n < 55) throw new Error("expected 55+ borrowed names, found " + n);
  s = s.slice(0, a) + list.split('"gft-').join('"gpf-') + s.slice(b);
  console.log("  renamed " + n + " borrowed class names to gpf-");
}
/* the prose around it, and the two comments that framed the reuse claim */
swap(`/* the reuse claim, stated positively: every one of her classes our markup
   leans on is already declared in the shell */`,
`/* every class this widget's markup names is declared: the shell's own
   primitives, and the sixty it used to borrow, copied in as gpf-* when W17
   was finalised on this version (28 Sep 2026) */`);
swap('"every shell/Jo class our markup uses is declared"', '"every shell and copied class our markup uses is declared"');

/* ------------------------------------------ 3. the remaining gft- assertions */
{
  const n = (s.match(/gft-/g) || []).length;
  s = s.split("gft-").join("gpf-");
  console.log("  rewrote " + n + " remaining gft- references");
}
swap('const herSubject = rules.filter(function (l) { return /^\\.(gft|rem|ap|bank|pur|fa|dep|ar|ins|pen|pr|loan|pto)-/.test(l.trim()); });\n  A.eq(herSubject.length, 0, "our CSS block declares none of her selectors as a rule subject");',
`const herSubject = rules.filter(function (l) { return /^\\.(rem|ap|bank|pur|fa|dep|ar|ins|pen|pr|loan|pto)-/.test(l.trim()); });
  A.eq(herSubject.length, 0, "our CSS block declares no other widget's selectors as a rule subject");`);
/* wording that named her */
["her donor-row grid", "her gift-list primitive", "her expanded drawer", "her backdrop primitive",
  "her gifts detail-modal shell", "her summary-cell primitive"].forEach(p => {
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    s = s.replace(re, p.replace("her ", "the copied "));
  });

/* ------------------------------------------------------ 4. the kind and title */
swap('H.extractRegistry(shell.script, "gifts-mb")', 'H.extractRegistry(shell.script, "gifts")');
swap('A.eq(registry.length, 7, "seven gifts-mb registry entries");',
     'A.eq(registry.length, 3, "three gifts registry entries: Glance, Explore, Detail");');
/* the widget now reaches the shell through WIDGETS.register, like every finished
   one, so the dispatch-order section asserts the registration instead of a
   hard-coded contentHTML line */
swap(`  /* the dispatch really is BEFORE the generic fallback */
  A.contains(shell.script, 'if(w.kind==="gifts-mb")return gpFContentRoot(w);', "the dispatch line is in place");
  /* The GENERIC fallback is the one that falls back to the Deposits copy.
     Anchor on that exact expression: several widgets have their own earlier
     empty branches, and matching the first "state===empty" in the file finds
     one of those instead, which is not what this assertion is about. */
  const iDisp = shell.script.indexOf('if(w.kind==="gifts-mb")return gpFContentRoot(w);');
  const iFallback = shell.script.indexOf('EMPTY_COPY[w.kind]||EMPTY_COPY.deposits');
  A.ok(iDisp > -1, "our dispatch line was located");
  A.ok(iFallback > -1, "the generic empty fallback was located");
  A.ok(iDisp < iFallback, "our dispatch sits BEFORE the generic empty fallback");
  /* and it sits at the END of the mb chain, after the newest sibling */
  /* the payables-mb sibling left the file on 2026-09-27 (owner took Jo's W16); what still matters is that no other -mb dispatch follows ours */
  const between = shell.script.slice(iDisp + 1, iFallback);
  A.ok(!/if(w.kind==="[a-z]+-mb")return/.test(between), "our dispatch is the last mb entry before the fallback");`,
`  /* Since finalisation the widget reaches the shell through WIDGETS.register,
     which contentHTML consults before its own kind chain and before the
     generic empty fallback, so this widget's own empty state renders and not
     the Deposits copy. No hard-coded dispatch line remains. */
  A.contains(shell.script, 'WIDGETS.register("gifts",{content:gpFContentRoot', "the widget registers its content");
  A.contains(shell.script, 'b:GPF_ABOUT', "and its about text");
  A.absent(shell.script, 'if(w.kind==="gifts")return', "no hard-coded contentHTML dispatch survives");
  const iReg = shell.script.indexOf("var wc=WIDGETS.content(w);");
  const iFallback = shell.script.indexOf('EMPTY_COPY[w.kind]||EMPTY_COPY.deposits');
  A.ok(iReg > -1, "the registry lookup in contentHTML was located");
  A.ok(iFallback > -1, "the generic empty fallback was located");
  A.ok(iReg < iFallback, "the registry lookup runs BEFORE the generic empty fallback");
  A.absent(shell.script, "-mb", "no -mb kind survives anywhere in the shell");`);
swap('  A.contains(shell.script, \'if(w.kind==="gifts-mb")return {h:w.title,b:GPF_ABOUT};\', "the aboutOf branch is in place");\n', "");
swap('A.eq(w.kind, "gifts-mb", "registry kind: " + w.id);', 'A.eq(w.kind, "gifts", "registry kind: " + w.id);');
swap("   Run from this folder:  node w17-gifts-mb.driver.js", "   Run from this folder:  node w17-gifts.driver.js");
swap('const A = new H.Assert("W17 gifts-mb");', 'const A = new H.Assert("W17 gifts");');

/* ------------------------------ 5. the fixtures the driver now builds itself */
swap(`  const one = W("gpF4");`,
`  /* the single-purpose and empty datasets left the demo registry when W17 was
     finalised (owner: only the three sizes). The driver builds them, as W13's does. */
  const one = Object.assign({}, W("gpF"), { id: "gpF4", dataset: "single", gpFCamp: "All purposes" });`);
swap(`  ["gpF4", "gpF5"].forEach(function (id) {
    sizes.forEach(function (sz) {
      A.noEmDash(ctx.gpFContentRoot(Object.assign({}, W(id), { size: sz })), id + " / " + sz); n++;
    });
  });`,
`  [{ id: "gpF4", dataset: "single" }, { id: "gpF5", dataset: "empty", state: "empty" }].forEach(function (f) {
    sizes.forEach(function (sz) {
      A.noEmDash(ctx.gpFContentRoot(Object.assign({}, W("gpF"), f, { size: sz })), f.id + " / " + sz); n++;
    });
  });`);
/* the registry-shape assertions that named the removed fixtures */
swap('A.ok(registry.some(function (w) { return w.gpFView === "table"; }), "a Summary Table entry exists");\nA.ok(registry.some(function (w) { return w.gpFCamp && w.gpFCamp !== "All purposes"; }), "a narrowed-purpose entry exists");\nA.ok(registry.some(function (w) { return w.state === "empty"; }), "an empty-state entry exists");',
`/* the review fixtures (Summary Table, one purpose, single dataset, empty) left the
   demo registry at finalisation; the driver exercises all four states directly. */
A.eq(registry.filter(function (w) { return w.state === "empty"; }).length, 0, "no fixture rows remain in the demo registry");
A.ok(registry.every(function (w) { return /^Gifts Pledges$/.test(w.title); }), "all three rows are titled Gifts Pledges");
A.ok(registry.every(function (w) { return w.gpFRange === "thru"; }), "all three open on the default through-date basis");`);

/* ---------------------------------------------------------- 6. the header */
swap(`   Widget: Gifts Pledges (MB updated), kind "gifts-mb", prefix gpF / GPF_,`,
     `   Widget: Gifts Pledges, kind "gifts", prefix gpF / GPF_,`);
swap(`    13  all 36 of Jo's gft* helpers byte-unmodified, and her gifts block,
        her gifts CSS cluster and her registry rows untouched`,
`    13  (retired 28 Sep 2026: this section proved Jo's gifts block was
        byte-unmodified, and that block was deleted when W17 was finalised
        on this version)`);
swap("w17-gifts-mb.driver.js , verification driver for our ported W17.",
     "w17-gifts.driver.js , verification driver for W17 Gifts Pledges.");

if (/gifts-mb/.test(s)) throw new Error("gifts-mb survives: " + JSON.stringify(s.match(/.{0,50}gifts-mb.{0,30}/g).slice(0, 4)));
let bare = 0;
for (let i = 0; i < s.length; i++) if (s[i] === "\n" && s[i - 1] !== "\r") bare++;
if (bare) s = s.replace(/\r?\n/g, NL);

fs.writeFileSync(NEW, s);
fs.unlinkSync(OLD);
console.log("w17-gifts-mb.driver.js -> w17-gifts.driver.js");
