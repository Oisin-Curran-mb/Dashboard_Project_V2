/* One-off, 2026-09-25, follow-up to build-w01: the W01 block also needs Jo's
   budget DATA (BUDGET_INCOME_BY_FY, BUDGET_EXPENSE_BY_FY) and the bgtMonths()
   helper the special-report catalogue calls at load; they were in the deleted
   v1 data block. Also deletes the dead v1 report-modal helpers that survived
   next to renderModal, and renames the one unstyled class (bgt-kpirow) so the
   block references nothing named bgt-. Anchored; aborts before writing. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, "..", ".."), FILE = path.join(ROOT, "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const old = cp.execSync('git -C "' + ROOT + '" show HEAD:index.html', { maxBuffer: 64 * 1024 * 1024 }).toString();
const once = function (s, n, label) { const i = s.indexOf(n); if (i < 0 || s.indexOf(n, i + 1) > -1) throw new Error("anchor: " + (label || n.slice(0, 60))); return i; };
const lineStart = function (s, i) { return s.lastIndexOf(NL, i - 1) + NL.length; };
/* a top-level (2-space) definition and everything up to the next 2-space definition or banner */
function defBlock(s, startNeedle) {
  const i = once(s, startNeedle); const a = lineStart(s, i);
  const re = /\r\n  (function |var |\/\* )/g; re.lastIndex = a + 2;
  const m = re.exec(s); const b = m ? m.index + NL.length : s.length;
  return s.slice(a, b).replace(/(\r\n)+$/, "");
}
const bgtMonths = defBlock(old, "  function bgtMonths(");
const incByFy = defBlock(old, "  var BUDGET_INCOME_BY_FY=");
const expByFy = defBlock(old, "  var BUDGET_EXPENSE_BY_FY=");
[bgtMonths, incByFy, expByFy].forEach(function (b) { if (b.split(NL).length > 400) throw new Error("extracted block suspiciously long"); });
const anchor = "  /* Data: fiscal calendar, current period, and the special-report catalogue (shared with the report picker) */";
const i = once(t, anchor);
t = t.slice(0, i) + "  /* Data: month-row builder, the budget and actual tables per fiscal year, fiscal calendar, current period, special-report catalogue */" + NL +
  bgtMonths + NL + incByFy + NL + expByFy + NL + t.slice(i + anchor.length + NL.length);
console.log("inserted bgtMonths + BUDGET_INCOME_BY_FY + BUDGET_EXPENSE_BY_FY into the W01 block");

/* dead v1 helpers outside the block: bgt* functions (not bgtO*, not bgtLockBg) with no reference left anywhere else */
const js0 = t.indexOf("/* ===== W01 Budget Compared to Actual V2 =====", t.indexOf("<script>")), js1 = t.indexOf("/* ===== end W01 Budget Compared to Actual V2 ===== */");
let removed = [];
for (;;) {
  const defs = [...t.matchAll(/\r\n  function (bgt(?!O)[A-Za-z0-9_]*)\(/g)].filter(function (m) { return m[1] !== "bgtLockBg" && (m.index < js0 || m.index > js1); });
  const dead = defs.filter(function (m) { const re = new RegExp("(?<![\\w$.])" + m[1] + "(?![\\w$])", "g"); return (t.match(re) || []).length === 1; });
  if (!dead.length) break;
  const d = dead[0]; const blk = defBlock(t, "  function " + d[1] + "("); const s = t.indexOf(blk); t = t.slice(0, s) + t.slice(s + blk.length + NL.length); removed.push(d[1] + " (" + blk.split(NL).length + " lines)");
}
console.log("removed dead v1 helpers: " + (removed.join(", ") || "none"));
const stillBgt = [...t.matchAll(/\r\n  function (bgt(?!O)[A-Za-z0-9_]*)\(/g)].filter(function (m) { return m[1] !== "bgtLockBg" && (m.index < js0 || m.index > js1); }).map(function (m) { return m[1]; });
console.log("bgt* functions still outside the block (referenced from elsewhere): " + (stillBgt.join(", ") || "none"));

/* the one unstyled class */
const before = (t.slice(js0, js1).match(/bgt-kpirow/g) || []).length;
t = t.slice(0, js0) + t.slice(js0, js1).replace(/(?<![\w-])bgt-kpirow(?![\w-])/g, "w01-kpirow") + t.slice(js1);
console.log("renamed bgt-kpirow -> w01-kpirow in the block (" + before + ")");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8");
console.log("done: " + t.split(NL).length + " lines");
