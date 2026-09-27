/* One-off, 2026-09-27: finalise W15 Bank Balances on JO's version (owner: "ok accept Jo version. delete mine and
   clean it all up until there just Jo 3 sizes"; docs/decisions/W15.md).
     - our bkF block (JS + CSS), its content-dispatch hook, its seven registry rows and comment, the cmp row and
       cmp note are deleted; every deleted name must have zero code references afterwards
     - Jo's block stays as it is (shell hooks and all); her two fixture rows (bank2, bank3) go; the three sizes
       are titled "Bank Balances"
     - auto-fixed defects in hers: .bank-hb-zero read the undeclared --wn-500 (zero axis invisible) -> --wn-400;
       bankBeginTotal was dead since the Glance delta moved to the twelve-month line -> removed
     - viewer map learns bank -> W15; a shell comment naming .bkf-pop is reworded */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8"); const log = [];
const idx = function (n, from, label) { const i = t.indexOf(n, from || 0); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 70))); return i; };
const once = function (n, label) { const i = idx(n, 0, label); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 70))); return i; };
const lineStart = function (i) { return t.lastIndexOf(NL, i - 1) + NL.length; }, lineEnd = function (i) { return t.indexOf(NL, i) + NL.length; };
function cutSpan(s, e, label) { const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("cut " + cut.split(NL).length + " lines: " + label); return cut; }
function removeLine(n, label) { const i = once(n, label); const s = lineStart(i), e = lineEnd(i); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
function editLine(lineNeedle, re, repl, label) { const i = once(lineNeedle, label + " line"); const s = lineStart(i), e = lineEnd(i); const line = t.slice(s, e); if (!re.test(line)) throw new Error("edit pattern missing: " + label); t = t.slice(0, s) + line.replace(re, repl) + t.slice(e); log.push("edited: " + label); }
function takeLines(re, n, label) { const L = t.split(NL), out = [], keep = []; L.forEach(function (l) { if (re.test(l)) out.push(l); else keep.push(l); }); if (out.length !== n) throw new Error(label + ": expected " + n + " lines, found " + out.length); t = keep.join(NL); log.push("took " + n + " lines: " + label); return out; }
const styleEnd = function () { return t.indexOf("</style>"); }, scriptStart = function () { return t.indexOf("<script>"); };
const defsIn = function (s) { return new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(function (m) { return m[1]; }).concat([...s.matchAll(/^\s*var\s+([A-Z_][A-Z0-9_]*)\s*=/gm)].map(function (m) { return m[1]; }))); };

/* ================= our JS block ================= */
const B0 = '/* ===== W15 Bank Balances V2 JS , prefix bkF , kind "bank-mb" ===== */', BEND = "/* ===== end W15 Bank Balances V2 ===== */";
const b0 = lineStart(idx(B0, scriptStart(), "bkF banner")), b1 = lineEnd(idx(BEND, b0, "bkF end banner"));
const ours = cutSpan(b0, b1, "our bkF block");
["function bkFContent(", "function bkFGlance("].forEach(function (n) { if (ours.indexOf(n) < 0) throw new Error("bkF block lacks " + n); });
if (/\bbank[A-Z][A-Za-z]*\(\)\s*\{|function bank[A-Z]/.test(ours)) throw new Error("bkF cut reached into Jo's functions");
const deleted = new Set([...defsIn(ours)].filter(function (n) { return n.length > 2; }));

/* ================= shell hook, registry, cmp, viewer ================= */
removeLine('    if(w.kind==="bank-mb")return bkFContent(w); //', "bkF contentHTML");
editLine("  function aboutOf(w){", /if\(w\.kind==="bank-mb"\)return \{h:w\.title,b:BKF_ABOUT\};/, "", "aboutOf bank-mb");
removeLine('      /* ===== W15 Bank Balances V2 registry, prefix bkF, kind "bank-mb". Seven registry ===== */', "bkF registry comment");
takeLines(/^\s*,\{id:"bkF(_k|_x|2|3|4|5)?",\s*title:"Bank Balances \(OC[^"]*\)",\s*kind:"bank-mb",/, 7, "bkF registry rows");
takeLines(/^\s*\{id:"bank(2|3)",title:"Bank Balances[^"]*",kind:"bank",/, 2, "Jo's fixture rows bank2, bank3");
editLine('      {id:"bank_k",title:"Bank Balances (Glance)",kind:"bank",', /title:"Bank Balances \(Glance\)"/, 'title:"Bank Balances"', "bank_k title");
editLine('      {id:"bank_x",title:"Bank Balances (Detail)",kind:"bank",', /title:"Bank Balances \(Detail\)"/, 'title:"Bank Balances"', "bank_x title");
removeLine('    ["W15","Bank Balances","bank",{bkacct:null,bkview:"table",bksort:"bal-desc"},"bank-mb",', "CMP_ROWS W15");
removeLine('    W15:{h:"Ours is her Bank widget rebuilt to her design, reusing her CSS', "CMPNOTE W15");
editLine("    var VIEW_WNUM={budget:\"W01\"", /purchasing:"W13",/, 'purchasing:"W13",bank:"W15",', "viewer map W15");
editLine("   how .bkf-pop, .faf-pop, .apf-pop and .gpf-pop already solve this in this", /\.bkf-pop, /, "", "shell comment: .bkf-pop gone");

/* ================= Jo's block: two auto-fixed defects ================= */
editLine("  .bank-hb-zero{position:absolute;top:-2px;bottom:-2px;width:1px;background:var(--wn-500);}", /var\(--wn-500\)/, "var(--wn-400)", "zero axis: declared token");
removeLine("  function bankBeginTotal(w){return bankAccounts(w).reduce(function(s,a){return s+(a.a[0]||0);},0);}", "dead bankBeginTotal");
deleted.add("bankBeginTotal");

/* ================= our CSS ================= */
{
  const c0 = lineStart(idx('  /* ===== W15 Bank Balances V2 CSS , prefix bkF , kind "bank-mb" ===== */', 0, "bkF CSS banner"));
  const c1 = lineEnd(idx("  /* ===== end W15 Bank Balances V2 CSS ===== */", c0, "bkF CSS end"));
  const cut = cutSpan(c0, c1, "our .bkf- CSS run");
  const odd = cut.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*@media|^\s*\/\*|^\s*\*/.test(l) && !/\.bkf-/.test(l) && !/^\s*\}?\s*$/.test(l); });
  if (odd.length) throw new Error("non-.bkf- rules inside our CSS run: " + JSON.stringify(odd.slice(0, 4)));
}

/* ================= guards ================= */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.join(", "));
const stNow = t.slice(t.indexOf("<style"), styleEnd()); if (/\.bkf-/.test(stNow)) throw new Error(".bkf- rules survive");
if (/bkF|BKF_|bank-mb|data-bkf|bkf-/.test(codeOnly)) throw new Error("bkF survives in code: " + JSON.stringify(codeOnly.match(/.{0,50}(bkF|BKF_|bank-mb|data-bkf|bkf-).{0,50}/g).slice(0, 4)));
if ((t.match(/kind:"bank"/g) || []).length !== 3) throw new Error("expected exactly three bank rows");
if (/--wn-500/.test(t)) throw new Error("--wn-500 still referenced");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); log.forEach(function (l) { console.log(l); }); console.log("done: " + t.split(NL).length + " lines");
