/* =====================================================================
   lint.js , design / layout DEFECT lint for index.html (report only).

     node _tools/lint.js            report
     node _tools/lint.js --strict   exit 1 if any finding

   Owner ruling (2026-09-25): design and layout DEFECTS are fixed without
   asking and logged in the widget's docs/decisions record; design CHOICES
   go to the owner. This script finds the defects. It never edits the file.

   Checks
     T1  CSS custom properties used via var(--x) but never declared
     T2  selectors declared more than once inside <style> (namespace leaks,
         e.g. an (OC) block re-declaring one of Jo's rules)
     T3  em dashes in string literals / markup (comments are ignored)
     T4  console.log / debugger left in the shell script
     T5  class names used in class="..." markup but never declared in CSS
         (only literal, static class tokens are checked)
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "index.html");
const strict = process.argv.indexOf("--strict") > -1;
const raw = fs.readFileSync(FILE, "utf8");

const styles = [];
raw.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, function (_, c) { styles.push(c); return ""; });
const css = styles.join("\n");
const script = (/<script>([\s\S]*)<\/script>/.exec(raw) || ["", ""])[1];
const stripComments = function (s) { return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/[^\n]*/g, "$1"); };

const findings = [];
function add(rule, msg, items) {
  findings.push({ rule: rule, msg: msg, items: items || [] });
}

/* T1 undeclared tokens */
(function () {
  const used = new Set(), declared = new Set();
  raw.replace(/var\(\s*(--[A-Za-z0-9_-]+)/g, function (_, t) { used.add(t); return ""; });
  css.replace(/(--[A-Za-z0-9_-]+)\s*:/g, function (_, t) { declared.add(t); return ""; });
  script.replace(/setProperty\(\s*["'](--[A-Za-z0-9_-]+)/g, function (_, t) { declared.add(t); return ""; });
  const missing = [...used].filter(function (t) { return !declared.has(t); }).sort();
  if (missing.length) add("T1", "CSS custom properties used but never declared", missing);
})();

/* T2 duplicate selectors */
(function () {
  const seen = {};
  stripComments(css).replace(/(^|\})\s*([^{}@]+?)\s*\{/g, function (_, __, sel) {
    sel.split(",").map(function (s) { return s.trim().replace(/\s+/g, " "); }).forEach(function (s) {
      if (!s) return;
      seen[s] = (seen[s] || 0) + 1;
    });
    return "";
  });
  const dups = Object.keys(seen).filter(function (s) { return seen[s] > 1; })
    .sort(function (a, b) { return seen[b] - seen[a]; })
    .map(function (s) { return seen[s] + "x  " + s; });
  if (dups.length) add("T2", "selectors declared more than once (possible namespace leak; some are legitimate media-query overrides)", dups);
})();

/* T3 em dashes outside comments */
(function () {
  const lines = raw.split(/\r?\n/);
  const hits = [];
  let inBlock = false;
  lines.forEach(function (l, i) {
    let s = l;
    if (inBlock) { const e = s.indexOf("*/"); if (e < 0) return; s = s.slice(e + 2); inBlock = false; }
    s = s.replace(/\/\*[\s\S]*?\*\//g, "");
    const o = s.indexOf("/*"); if (o > -1) { s = s.slice(0, o); inBlock = true; }
    s = s.replace(/(^|[^:\\"'])\/\/.*$/, "$1");
    if (s.indexOf("—") > -1) hits.push("L" + (i + 1) + "  " + s.trim().slice(0, 110));
  });
  if (hits.length) add("T3", "em dashes in code / markup (owner rule: none in user-facing text)", hits);
})();

/* T4 debug leftovers */
(function () {
  const hits = [];
  stripComments(script).split(/\r?\n/).forEach(function (l, i) {
    if (/console\.(log|debug|warn|error)\(|(^|[^A-Za-z])debugger\b/.test(l)) hits.push("script L" + (i + 1) + "  " + l.trim().slice(0, 110));
  });
  if (hits.length) add("T4", "console.* / debugger left in the shell script", hits);
})();

/* T5 static classes never declared */
(function () {
  const used = new Set();
  raw.replace(/class="([^"${}<>]+)"/g, function (_, c) {
    c.split(/\s+/).forEach(function (t) { if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(t)) used.add(t); });
    return "";
  });
  const declared = new Set();
  css.replace(/\.([A-Za-z_][A-Za-z0-9_-]*)/g, function (_, c) { declared.add(c); return ""; });
  script.replace(/classList\.(add|toggle|remove)\(\s*["']([A-Za-z0-9_-]+)/g, function (_, __, c) { declared.add(c); return ""; });
  const missing = [...used].filter(function (c) { return !declared.has(c) && !/^material-symbols/.test(c); }).sort();
  if (missing.length) add("T5", "static class names in markup with no CSS declaration (may be JS hooks; check before fixing)", missing);
})();

/* report */
if (!findings.length) { console.log("LINT: no findings"); process.exit(0); }
findings.forEach(function (f) {
  console.log("\n[" + f.rule + "] " + f.msg + " (" + f.items.length + ")");
  f.items.slice(0, 40).forEach(function (i) { console.log("    " + i); });
  if (f.items.length > 40) console.log("    ... " + (f.items.length - 40) + " more");
});
console.log("\nLINT: " + findings.length + " rule(s) with findings" + (strict ? " (strict: failing)" : ""));
process.exit(strict ? 1 : 0);
