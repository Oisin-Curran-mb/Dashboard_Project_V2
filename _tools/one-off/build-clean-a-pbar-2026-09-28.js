/* One-off, 2026-09-28: delete the shared .pbar pacing bar.

   Owner: "check all the code and see what code is no longer in use."

   pbarHTML, pbarShow, pbarHide, pbarPopEl and the document mousemove listener
   form a closed loop with no outside entry point. The listener can never match,
   because pbarHTML was the only thing that emitted `class="pbar" data-pbar=`.

   The banner claimed W04 Remittance and W17 Gifts were its two consumers. Both
   claims are stale: W04 has its own remOPbarHTML emitting remO-pbar with its
   own scoped listener, and W17 owns its vocabulary since finalisation. The real
   last caller was Jo's gft block, deleted earlier today.

   The CSS goes with it: .pbar and .pbar-track, -sm, -fill, -gap and -mark are
   reached only from inside pbarHTML, and the .pbar-lg family and .pbar-hd are
   emitted by nothing at all. Five descendant rules hanging off them go too, two
   under the dead .rem- run and three under live gpf classes that never render a
   pbar child.

   W02's and W04's drivers assert the cluster is present, so they are edited in
   the same commit, and W02's decision record carries the correction.
*/
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const FILE = path.join(ROOT, "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

const once = (n, label) => { const i = t.indexOf(n); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 60))); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 60))); return i; };
const lineStart = i => t.lastIndexOf(NL, i - 1) + NL.length;
const lineEnd = i => t.indexOf(NL, i) + NL.length;
function cutSpan(s, e, label) { const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("cut " + (cut.split(NL).length - 1) + " lines: " + label); return cut; }
function dropLine(n, label) { const i = once(n, label); t = t.slice(0, lineStart(i)) + t.slice(lineEnd(i)); log.push("dropped: " + (label || n.slice(0, 50))); }

/* ------------------------------------------------------------ 1. the JS */
{
  const a = lineStart(once("  /* ===== Shell: pacing bar (.pbar) with its hover card", "pbar banner"));
  const b = lineEnd(once('document.addEventListener("mousemove",function(e){var el=e.target.closest&&e.target.closest(".pbar[data-pbar]");', "pbar mousemove listener"));
  const cut = cutSpan(a, b, "the .pbar cluster, banner to listener");
  ["function pbarHTML(", "var pbarPopEl=null;", "function pbarHide(){", "function pbarShow(", 'closest(".pbar[data-pbar]")'].forEach(n => {
    if (cut.indexOf(n) < 0) throw new Error("the cut lacks " + n);
  });
  if (/function (remO|gpF|bgtO|depO)[A-Z]/.test(cut)) throw new Error("the cut reached into a widget block");
}

/* ------------------------------------------------------------ 2. the CSS */
/* Rule by rule, not a span cut: the run itself sits together, but five more
   rules style a pbar child inside another widget's markup, and those sit inside
   other widgets' blocks. A selector group naming a .pbar class goes; a rule
   whose every group goes is dropped whole. Nothing else is touched. */
{
  const a0 = t.indexOf("<style>"), b0 = t.indexOf("</style>");
  const sheet = t.slice(a0, b0);
  let out = "", j = 0, dropped = 0, trimmed = 0;
  while (j < sheet.length) {
    const open = sheet.indexOf("{", j);
    if (open < 0) { out += sheet.slice(j); break; }
    const head = sheet.slice(j, open);
    let depth = 1, k = open + 1;
    while (k < sheet.length && depth > 0) { if (sheet[k] === "{") depth++; else if (sheet[k] === "}") depth--; k++; }
    const body = sheet.slice(open + 1, k - 1);
    const lastC = head.lastIndexOf("*/");
    const lead = head.slice(0, lastC > -1 ? lastC + 2 : 0);
    const sel = head.slice(lastC > -1 ? lastC + 2 : 0);
    const selTrim = sel.trim();
    if (selTrim.charAt(0) === "@") { out += lead + sel + "{" + body + "}"; j = k; continue; }
    const groups = selTrim.split(",").map(x => x.trim()).filter(Boolean);
    const keep = groups.filter(g => !/\.pbar(?![a-z0-9])/.test(g));
    if (!keep.length) { out += lead; dropped++; }
    else if (keep.length !== groups.length) { out += lead + sel.replace(selTrim, keep.join(",")) + "{" + body + "}"; trimmed++; }
    else out += lead + sel + "{" + body + "}";
    j = k;
  }
  const bal = x => { let d = 0; for (const c of x) { if (c === "{") d++; else if (c === "}") d--; if (d < 0) return -1; } return d; };
  if (bal(sheet) !== 0 || bal(out) !== 0) throw new Error("the CSS sweep unbalanced the stylesheet");
  if (dropped < 14) throw new Error("only " + dropped + " pbar rules dropped; expected 14+");
  t = t.slice(0, a0) + out + t.slice(b0);
  log.push("swept " + dropped + " .pbar rules out of the stylesheet (" + trimmed + " selectors trimmed)");
}

/* --------------------------------------------------------- 3. the drivers */
function patch(rel, edits) {
  const p = path.join(ROOT, "_tools", rel);
  let s = fs.readFileSync(p, "utf8");
  edits.forEach(([a, b]) => {
    const A = a.split("\n").join(NL), B = b.split("\n").join(NL);
    const c = s.split(A).length - 1;
    if (c === 0 && s.indexOf(B) > -1) { log.push("_tools/" + rel + ": already patched"); return; }
    if (c !== 1) throw new Error(rel + ": anchor appeared " + c + " times: " + a.slice(0, 60));
    s = s.split(A).join(B);
  });
  fs.writeFileSync(p, s);
  log.push("patched _tools/" + rel);
}
patch("w02-pension.driver.js", [
  ['["function pbarHTML(", "function pbarShow(", "function pbarHide(", ".pbar[data-pbar]"].forEach(function (n) { A.contains(outside, n, "shar',
   '/* The shared .pbar pacing bar was DELETED on 2026-09-28: its last caller was\n   Jo\'s gifts block, and nothing emitted its markup after that block went. What\n   matters here is that no trace of it is left behind. */\n["pbarHTML", "pbarShow", "pbarHide", "pbarPopEl", ".pbar[data-pbar]", "Shell: pacing bar"].forEach(function (n) { A.absent(outside, n, "the retired shar']
]);
patch("w04-remittance.driver.js", [
  ['["function pbarHTML(", "function pbarShow(", "function pbarHide("].forEach(function (n) { A.contains(outside, n, "shared pacing bar kep',
   '/* W04 has its own remO-pbar with its own scoped listener; the shell\'s shared\n   .pbar was deleted on 2026-09-28 once nothing emitted it. */\n["pbarHTML", "pbarShow", "pbarHide"].forEach(function (n) { A.absent(outside, n, "the retired shared pacing bar kep']
]);

patch("w02-pension.driver.js", [
  ['A.contains(outside, "Shell: pacing bar (.pbar)", "and labelled as shared");',
   'A.absent(outside, ".pbar-lg", "and its legend swatches went with it");'],
  ['   pension versions remains while the shared .pbar component she kept inside',
   '   pension versions remains; the shared .pbar component she kept inside']
]);

/* --------------------------------------------------------- 4. guards */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "");
/* W04's own classes are remO-pbar-track and friends, so the guard needs a
   boundary: only a pbar name that is NOT part of a longer prefixed name counts. */
["pbarHTML", "pbarShow", "pbarHide", "pbarPopEl"]
  .forEach(n => { const c = codeOnly.split(n).length - 1; if (c) throw new Error("still present in code: " + n + " x" + c); });
["pbar-track", "pbar-fill", "pbar-mark", "pbar-gap", "pbar-lg", "pbar-hd", "pbar-sm", "pbar"]
  .forEach(n => {
    const re = new RegExp("(^|[^A-Za-z0-9_-])" + n + "(?![A-Za-z0-9_-])", "g");
    const hits = codeOnly.match(re) || [];
    if (hits.length) throw new Error("still present in code: " + n + " x" + hits.length);
  });
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("the shared .pbar pacing bar is gone");
