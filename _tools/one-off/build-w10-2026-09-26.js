/* One-off, 2026-09-26: build W10 Loans With Balance Due (owner: ours 1:1, docs/decisions/W10.md).
   Delete Jo's live "loans" block (loan), its hooks, rows and .loan- CSS; register ours (lonF) as kind
   "loans" (content, about; the block keeps its own data-lon click / keyboard / hover / resize handling).
   Our block uses none of her .loan- classes, so nothing is copied. Anchored; aborts on any miss. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8"); const log = [];
const idx = function (n, from, label) { const i = t.indexOf(n, from || 0); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 70))); return i; };
const once = function (n, label) { const i = idx(n, 0, label); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 70))); return i; };
const lineStart = function (i) { return t.lastIndexOf(NL, i - 1) + NL.length; }, lineEnd = function (i) { return t.indexOf(NL, i) + NL.length; };
function cutSpan(s, e, label) { const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("cut " + cut.split(NL).length + " lines: " + label); return cut; }
function removeLine(n, label) { const i = once(n, label); const s = lineStart(i), e = lineEnd(i); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
function editLine(lineNeedle, re, repl, label) { const i = once(lineNeedle, label + " line"); const s = lineStart(i), e = lineEnd(i); const line = t.slice(s, e); if (!re.test(line)) throw new Error("needle not on line: " + label); t = t.slice(0, s) + line.replace(re, repl) + t.slice(e); log.push("edited: " + label); }
function takeLines(re, n, label) { const L = t.split(NL), out = [], keep = []; L.forEach(function (l) { if (re.test(l)) out.push(l); else keep.push(l); }); if (out.length !== n) throw new Error(label + ": expected " + n + " lines, found " + out.length); t = keep.join(NL); log.push("removed " + n + " lines: " + label); return out; }
function insertBefore(n, block, label) { const i = once(n, label); const s = lineStart(i); t = t.slice(0, s) + block + NL + t.slice(s); log.push("inserted: " + label); }
const styleEnd = function () { return t.indexOf("</style>"); }, scriptStart = function () { return t.indexOf("<script>"); };
const defsIn = function (s) { return new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(function (m) { return m[1]; }).concat([...s.matchAll(/^\s*var\s+([A-Z][A-Z0-9_]*)\s*=/gm)].map(function (m) { return m[1]; }))); };
const B0 = "/* ===== W10 Loans With Balance Due V2 ===== */", BEND = "/* ===== end W10 Loans With Balance Due V2 ===== */";

/* ================= JS: Jo's live loan block ================= */
const jS = lineStart(t.lastIndexOf("/* =====", idx('   Loans With Balance Due (prefix: loan, kind: "loans")  , v2 redesign', scriptStart(), "loan header")));
const mm = idx('document.addEventListener("mousemove",function(e){var row=e.target.closest&&e.target.closest(".loan-', jS, "loan mousemove listener");
let jE = lineEnd(mm); const after = t.slice(jE).replace(/^(\r\n)+/, ""); if (!/^\s*\/\* =====/.test(after)) throw new Error("loan block end: " + after.slice(0, 60));
const jBlk = cutSpan(jS, jE, "Jo's loan block"); if (jBlk.indexOf("function loanContent(") < 0 || jBlk.indexOf("var LOAN_REGISTRY=[") < 0 || jBlk.indexOf("function loanShowPop(") < 0) throw new Error("loan shape");
const deleted = new Set([...defsIn(jBlk)]);

/* ================= shell hooks ================= */
removeLine('if(w.kind==="loans")return loanContent(w);', "loan contentHTML");
removeLine('if(w.kind==="loans-mb")return lonFContent(w);', "lonF contentHTML");
removeLine('if(pop.type==="loan-type")return loanPopContent();', "loan popContent");
editLine("function triggerSelector(){", /if\(pop\.type==="loan-type"\)return '\[data-action="loan-type"\]\[data-id="'\+pop\.id\+'"\]';/, "", "triggerSelector loan-type");
removeLine('if(modal.type==="loandetail"){mr.innerHTML=loanDetailModalHTML();return;}', "loan detail modal");
removeLine('if(a&&a.indexOf("loan-")===0&&loanHandleClick(a,id,t))return;', "loan click hook");
editLine("function aboutOf(w){", /if\(w\.kind==="loans"\)return \{h:w\.title,b:"[^"]*"\};/, "", "aboutOf loans");
editLine("function aboutOf(w){", /if\(w\.kind==="loans-mb"\)return \{h:w\.title,b:LONF_ABOUT\};/, "", "aboutOf loans-mb");

/* ================= registry ================= */
takeLines(/^\s*\{id:"loan(_k|2|3|4|5|6)?",title:"Loans With Balance Due[^"]*",kind:"loans",/, 7, "Jo's loan registry rows");
const ours = takeLines(/^\s*,?\{id:"lonF(_k|_x|2|3)?",\s*title:"Loans With Balance Due \(OC[^"]*\)",\s*kind:"loans-mb"/, 5, "lonF registry rows (to rebuild)");
const fix = function (l) { return l.replace(/^(\s*),/, "$1").replace(/,\s*$/, "").replace('kind:"loans-mb"', 'kind:"loans"').replace(/title:"Loans With Balance Due \(OC[^"]*\)"/, 'title:"Loans With Balance Due"'); };
const live = ours.filter(function (l) { return /\{id:"lonF(_k|_x)?",/.test(l); }).map(fix), fixtures = ours.filter(function (l) { return /\{id:"lonF[23]",/.test(l); }).map(fix);
if (live.length !== 3 || fixtures.length !== 2) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
/* the rows that follow are comma-first (",{id:\"faF\""), so the last live row ends without a comma */
insertBefore('      ,{id:"faF",  title:"Fixed Asset Values (OC)"', ["      /* W10 Loans With Balance Due */", live[0] + ",", live[1] + ",", live[2], "      /* W10 driver fixtures (state variants), not rendered as cards:"].concat(fixtures).concat(["      */"]).join(NL), "W10 registry rows");
removeLine('    ["W10","Loans With Balance Due","loans",', "CMP_ROWS W10");
removeLine('    W10:{h:"Ours is her Loans widget with six changes, five owner-directed and one a laten', "CMPNOTE_ W10");

/* ================= the block ================= */
const hS = idx('   Loans With Balance Due (MB updated) , prefix lonF , kind "loans-mb"', scriptStart(), "lonF header");
const b0 = lineStart(t.lastIndexOf("/* =====", hS)), b1 = lineEnd(idx(BEND, b0, "W10 end banner"));
let blk = cutSpan(b0, b1, "lonF block").replace(/(\r\n)+$/, "");
(function () { const he = blk.indexOf("*/") + 2; if (!/prefix lonF/.test(blk.slice(0, he))) throw new Error("block header comment"); blk = B0 + NL + "/* Loans With Balance Due: every loan with a balance owing by how overdue it is. Five aging ranges (Current, 1-30, 31-60, 61-90, 90+); the loan-type filter drives every figure; Explore has a Table / Pie segment with the ranges as a chip filter, Detail shows the flat loan list beside the balance-by-range donut whose legend filters the list; a loan opens a detail pop-up. */" + blk.slice(he); log.push("block header comment replaced by a purpose line"); })();
blk = blk.replace(/kind:"loans-mb"/g, 'kind:"loans"').replace(/loans-mb/g, "loans").replace(/Loans With Balance Due \((MB updated|OC)[^"']*\)/g, "Loans With Balance Due");
blk = blk.split(NL).filter(function (l) { return !(/^\s{3,}[A-Za-z][A-Za-z ()\/-]*[.:]{1,}\s*\.{2,}\s*if\(/.test(l) || /^\s{3,}[A-Za-z()]+:\s+if\(/.test(l) || /^\s{3,}[A-Za-z][A-Za-z ()]*\.{3,}\s*if\(/.test(l)); }).join(NL);
if (blk.indexOf("var LONF_ABOUT=") < 0) throw new Error("LONF_ABOUT");
if (/(?<![\w-])loan-[a-z0-9-]+/.test(blk.replace(/\/\*[\s\S]*?\*\//g, ""))) throw new Error("our block names a loan- class");
const register = 'WIDGETS.register("loans",{content:lonFContent,about:function(w){return {h:w.title,b:LONF_ABOUT};}});';
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + BEND + NL, "W10 block before the registry");

/* ================= CSS: Jo's .loan- block ================= */
(function () {
  const h = idx("/* ===== Loans With Balance Due (prefix: loan) , CSS =====", 0, "loan CSS header"); if (h > styleEnd()) throw new Error("loan CSS header not in style");
  let s = lineStart(h), e = s; const L = t.slice(s, styleEnd()).split(NL); let k = 0, inHead = true, inC = false;
  while (k < L.length) { const l = L[k];
    const ok = inHead || inC ? true : (l.trim() === "" || /^\s*\/\*/.test(l) || /^\s*\*/.test(l) || /\.loan-/.test(l) || /^\s*@media/.test(l) || /^\s*\}/.test(l) || (/^\s+[a-z-]+:/.test(l) && !/\{/.test(l)));
    if (!ok) break;
    if (inHead && /\*\/\s*$/.test(l)) inHead = false;
    if (!inHead) { if (/\/\*/.test(l) && !/\*\//.test(l)) inC = true; else if (inC && /\*\//.test(l)) inC = false; }
    e += l.length + NL.length; k++; }
  while (t.slice(e - NL.length * 2, e) === NL + NL) e -= NL.length;
  const cut = cutSpan(s, e, "Jo's .loan- CSS"); const odd = cut.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*@media|^\s*\/\*/.test(l) && !/\.loan-/.test(l); }); if (odd.length) throw new Error("non-loan rule inside: " + odd[0].trim().slice(0, 80));
})();
const stNow = t.slice(t.indexOf("<style"), styleEnd()); const loanLeft = [...new Set(stNow.match(/\.loan-[a-z0-9-]+/g) || [])]; if (loanLeft.length) throw new Error(".loan- rules left: " + loanLeft.join(" "));

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
['kind:"loans-mb"', "loans-mb", "loanContent(", "LOAN_", "loanHandleClick", "loandetail", '"loan-type"'].forEach(function (n) { const i = codeOnly.indexOf(n); if (i > -1) throw new Error("leftover in code: " + n + "  -> " + codeOnly.slice(codeOnly.lastIndexOf("\n", i) + 1, i + 80)); });
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
