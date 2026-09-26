/* One-off, 2026-09-26: build W11 Fixed Asset Values (owner: ours 1:1, docs/decisions/W11.md).
   Delete Jo's live "fixedassets" block (fa), its hooks, rows and .fa- CSS; register ours (faF) as kind
   "fixedassets" (content, about, the full-table modal; the block keeps its own data-faf click and
   keyboard handling). Our block uses none of her .fa- classes. Anchored; aborts on any miss. */
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
const B0 = "/* ===== W11 Fixed Asset Values V2 ===== */", BEND = "/* ===== end W11 Fixed Asset Values V2 ===== */", OLDB = '/* ===== W11 Fixed Asset Values V2 JS , prefix faF , kind "fixedassets-mb" ===== */';

/* ================= JS: Jo's fa block (no closing header: it runs up to the shell's contentHTML) ================= */
const jS = lineStart(idx('  /* ===== Fixed Asset Values (fa, kind:"fixedassets") ===== */', scriptStart(), "fa header"));
const cH = idx("  function contentHTML(w){", jS, "contentHTML"); let jE = lineStart(cH); while (t.slice(jE - NL.length * 2, jE) === NL + NL) jE -= NL.length;
const jBlk = cutSpan(jS, jE, "Jo's fa block"); if (jBlk.indexOf("function faContent(") < 0 || jBlk.indexOf("var FA_ASSETS=") < 0 || jBlk.indexOf("function faPopContent(") < 0) throw new Error("fa shape");
const deleted = new Set([...defsIn(jBlk)].filter(function (n) { return n !== "DS"; }));

/* ================= shell hooks ================= */
removeLine('if(w.kind==="fixedassets")return faContent(w);', "fa contentHTML");
removeLine('if(w.kind==="fixedassets-mb")return faFContent(w);', "faF contentHTML");
removeLine('if(pop.type==="fa-groupby"||pop.type==="fa-group"||pop.type==="fa-measure")return faPopContent();', "fa popContent");
["fa-groupby", "fa-group", "fa-measure"].forEach(function (k) { editLine("function triggerSelector(){", new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "", "triggerSelector " + k); });
removeLine('if(modal.type==="fafTable"){mr.innerHTML=faFTableModalHTML();return;}', "faF table modal");
removeLine("    if(faHandleClick(a,id,t))return;", "fa click hook");
editLine("function aboutOf(w){", /if\(w\.kind==="fixedassets-mb"\)return \{h:w\.title,b:FAF_ABOUT\};/, "", "aboutOf fixedassets-mb");

/* ================= registry ================= */
takeLines(/^\s*\{id:"fa(1|1_k|2|3)",kind:"fixedassets",title:"Fixed Asset Values[^"]*"/, 4, "Jo's fa registry rows");
const ours = takeLines(/^\s*,\{id:"faF(_k|_x|2|3|4|5)?",\s*title:"Fixed Asset Values \(OC[^"]*\)",\s*kind:"fixedassets-mb"/, 7, "faF registry rows (to rebuild)");
const fix = function (l) { return l.replace('kind:"fixedassets-mb"', 'kind:"fixedassets"').replace(/title:"Fixed Asset Values \(OC[^"]*\)"/, 'title:"Fixed Asset Values"'); };
const live = ours.filter(function (l) { return /\{id:"faF(_k|_x)?",/.test(l); }).map(fix), fixtures = ours.filter(function (l) { return /\{id:"faF[2-5]",/.test(l); }).map(function (l) { return fix(l).replace(/^(\s*),/, "$1"); });
if (live.length !== 3 || fixtures.length !== 4) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
insertBefore('      /* ===== W13 Purchasing Management V2 registry, prefix purF, kind "purchasing-mb".', ["      /* W11 Fixed Asset Values */"].concat(live).concat(["      /* W11 driver fixtures (state variants), not rendered as cards:"]).concat(fixtures).concat(["      */"]).join(NL), "W11 registry rows");
removeLine('    ["W11","Fixed Asset Values","fixedassets",', "CMP_ROWS W11");
removeLine('    W11:{h:"Ours is a from-scratch rebuild, deliberately not a restyle of her bl', "CMPNOTE_ W11");

/* ================= the block ================= */
const b0 = lineStart(idx(OLDB, scriptStart(), "faF banner")), b1 = lineEnd(idx(BEND, b0, "W11 end banner"));
let blk = cutSpan(b0, b1, "faF block").replace(/(\r\n)+$/, ""); if (blk.endsWith(BEND)) blk = blk.slice(0, -BEND.length).replace(/(\r\n)+$/, "");
blk = blk.replace(OLDB, B0 + NL + "/* Fixed Asset Values: net book value of the asset register, grouped by a chosen classification (Class, Building, Room, Asset Account) with a chosen measure (Cost, Accumulated depreciation, Net book value); Table / Donut views, sortable columns, paged rows; the full seven-column table opens in a modal. */");
blk = blk.replace(/kind:"fixedassets-mb"/g, 'kind:"fixedassets"').replace(/fixedassets-mb/g, "fixedassets").replace(/Fixed Asset Values \((MB updated|OC)[^"']*\)/g, "Fixed Asset Values");
blk = blk.split(NL).filter(function (l) { return !(/^\s{3,}[A-Za-z][A-Za-z ()\/-]*[.:]{1,}\s*\.{2,}\s*if\(/.test(l) || /^\s{3,}[A-Za-z()]+:\s+if\(/.test(l) || /^\s{3,}[A-Za-z][A-Za-z ()]*\.{3,}\s*if\(/.test(l)); }).join(NL);
if (blk.indexOf("var FAF_ABOUT=") < 0 || blk.indexOf("function faFTableModalHTML(") < 0) throw new Error("block shape");
if (/(?<![\w-])fa-[a-z0-9-]+/.test(blk.replace(/\/\*[\s\S]*?\*\//g, ""))) throw new Error("our block names a fa- class");
if (blk.indexOf(BEND) > -1) throw new Error("end banner still inside the block");
const register = 'WIDGETS.register("fixedassets",{content:faFContent,about:function(w){return {h:w.title,b:FAF_ABOUT};},modals:{fafTable:faFTableModalHTML}});';
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + BEND + NL, "W11 block before the registry");

/* ================= CSS: Jo's .fa- run and the shell's stray .fa-total-row ================= */
removeLine("  .fa-total-row{border-top:1.5px solid var(--stroke-widget);font-weight:600;padding-top:8px;margin-top:2px;}", "shell .fa-total-row (only her block used it)");
(function () {
  const first = idx("  .fa-ctlrow{display:flex;gap:8px;flex-wrap:wrap;min-width:0;}", 0, ".fa- first rule"); if (first > styleEnd()) throw new Error("fa rule not in style");
  let s = lineStart(first), e = s; const L = t.slice(s, styleEnd()).split(NL); let k = 0, inC = false;
  while (k < L.length) { const l = L[k]; if (/^\s*\/\* =====/.test(l)) break; const ok = inC || l.trim() === "" || /^\s*\/\*/.test(l) || /\.fa-/.test(l) || /^\s*@media/.test(l) || /^\s*\}/.test(l) || (/^\s+[a-z-]+:/.test(l) && !/\{/.test(l)); if (!ok) break; if (/\/\*/.test(l) && !/\*\//.test(l)) inC = true; else if (inC && /\*\//.test(l)) inC = false; e += l.length + NL.length; k++; }
  while (t.slice(e - NL.length * 2, e) === NL + NL) e -= NL.length;
  const cut = cutSpan(s, e, "Jo's .fa- CSS run"); const odd = cut.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*@media|^\s*\/\*/.test(l) && !/\.fa-/.test(l); }); if (odd.length) throw new Error("non-fa rule in the run: " + odd[0].trim().slice(0, 80));
})();
const stNow = t.slice(t.indexOf("<style"), styleEnd()); const faLeft = [...new Set(stNow.match(/\.fa-[a-z0-9-]+/g) || [])]; if (faLeft.length) throw new Error(".fa- rules left: " + faLeft.join(" "));

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
['kind:"fixedassets-mb"', "fixedassets-mb", "faContent(", "FA_ASSETS", "faHandleClick", "faPopContent", '"fa-groupby"', 'modal.type==="fafTable"'].forEach(function (n) { const i = codeOnly.indexOf(n); if (i > -1) throw new Error("leftover in code: " + n + "  -> " + codeOnly.slice(codeOnly.lastIndexOf("\n", i) + 1, i + 80)); });
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
