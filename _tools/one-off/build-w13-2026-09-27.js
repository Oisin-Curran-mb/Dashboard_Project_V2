/* One-off, 2026-09-27: finalise W13 Purchasing Management (owner: "ok this done, remove Jo and clean it up ...
   visually it should be Purchasing Management and just purchasing"; docs/decisions/W13.md).
     - Jo's `pur` block (JS + CSS) and its shell hooks, registry rows, cmp row and cmp note are deleted
     - ours keeps prefix purF, becomes kind "purchasing", titles "Purchasing Management", registered via
       WIDGETS.register and moved before the registry like every finished widget
     - the shell classes we borrowed from her block (.pur-kanban, .pur-kcol*, .pur-kcard, .pur-kc-*, .pur-kempty,
       .pur-tabs, .pur-tab) are copied as .purf-* inside our CSS block; nothing else used them
     - guards: every deleted name has zero code references, no .pur- rule or class survives, CRLF only */
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
function insertBefore(n, block, label) { const i = once(n, label); const s = lineStart(i); t = t.slice(0, s) + block + NL + t.slice(s); log.push("inserted: " + label); }
const styleEnd = function () { return t.indexOf("</style>"); }, scriptStart = function () { return t.indexOf("<script>"); };
const defsIn = function (s) { return new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(function (m) { return m[1]; }).concat([...s.matchAll(/^\s*var\s+([A-Z_][A-Z0-9_]*)\s*=/gm)].map(function (m) { return m[1]; }))); };
const B0 = '/* ===== W13 Purchasing Management V2 JS , prefix purF , kind "purchasing-mb" ===== */', BEND = "/* ===== end W13 Purchasing Management V2 ===== */";

/* ================= JS: Jo's pur block ================= */
const jHdr = idx("   Purchasing Management (pur) , v2" + NL, scriptStart(), "pur header"); const jS = lineStart(jHdr - NL.length);
if (t.slice(jS, jS + 30).indexOf("/* ====") < 0) throw new Error("pur banner line not found above header");
const apHdr = idx('   Accounts Payable By Due Date  (ap, kind:"payables")', jS, "ap header"); let jE = lineStart(apHdr - NL.length); while (t.slice(jE - NL.length, jE) === NL) jE -= NL.length;
const jBlk = cutSpan(jS, jE, "Jo's pur block");
["function purContent(", "function purHandleClick(", "function purHandleInput(", "function purPopContent(", "function purDrillModalHTML(", "var PUR_PERIODS=", 'document.addEventListener("mousemove"'].forEach(function (n) { if (jBlk.indexOf(n) < 0) throw new Error("pur block lacks " + n); });
if (/bpurF[A-Z]|PURF_|purf-/.test(jBlk)) throw new Error("pur block cut reached into ours");
const deleted = new Set([...defsIn(jBlk)].filter(function (n) { return n.length > 2; })); /* her block has local one-letter vars (Y) that share names with other code */

/* ================= shell hooks ================= */
removeLine('    if(w.kind==="purchasing")return purContent(w);', "pur contentHTML");
removeLine('    if(w.kind==="purchasing-mb")return purFContent(w); //', "purF contentHTML (now via WIDGETS.register)");
removeLine('    if(pop.type==="pur-status"||pop.type==="pur-path")return purPopContent();', "pur popContent");
["pur-status", "pur-path"].forEach(function (k) { editLine("  function triggerSelector(){", new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "", "triggerSelector " + k); });
removeLine('    if(modal.type==="pur-po"){', "pur-po modal");
removeLine('    if(modal.type==="pur-drill"){mr.innerHTML=purDrillModalHTML();return;}', "pur-drill modal");
removeLine("    if(purHandleClick(a,t,id))return;", "pur click hook");
editLine("  function aboutOf(w){", /if\(w\.kind==="purchasing"\)return \{h:w\.title,b:PUR_ABOUT_BODY\};/, "", "aboutOf purchasing (ours registers its own about)");
editLine("  function aboutOf(w){", /if\(w\.kind==="purchasing-mb"\)return \{h:w\.title,b:PURF_ABOUT\};/, "", "aboutOf purchasing-mb (moved into WIDGETS.register)");
editLine('  document.addEventListener("input",function(e){if(gftHandleInput(e))return;if(purHandleInput(e))return;', /if\(purHandleInput\(e\)\)return;/, "", "pur input hook");

/* ================= registry ================= */
takeLines(/^\s*\{id:"pur(_k|2|3|4|5)?",title:"Purchasing Management[^"]*",kind:"purchasing",/, 6, "Jo's pur registry rows");
editLine('      /* ===== W13 Purchasing Management V2 registry, prefix purF, kind "purchasing-mb". Six ===== */', /.*/, "      /* W13 Purchasing Management (ours, prefix purF) */", "registry comment");
["purF", "purF_k", "purF_x", "purF2", "purF3", "purF4"].forEach(function (id) {
  editLine(',{id:"' + id + '",', /title:"Purchasing Management \(OC[^"]*\)",\s*/, 'title:"Purchasing Management",'.padEnd(id === "purF" ? 41 : 41, " "), "title " + id);
  editLine(',{id:"' + id + '",', /kind:"purchasing-mb"/, 'kind:"purchasing"', "kind " + id);
});
removeLine('    ["W13","Purchasing Management","purchasing",{admin:true,', "CMP_ROWS W13");
removeLine('    W13:{h:"Ours rebuilds her Purchasing board as the real approval process', "CMPNOTE W13");
editLine("    var VIEW_WNUM={budget:\"W01\"", /fixedassets:"W11",/, 'fixedassets:"W11",purchasing:"W13",', "viewer map W13");

/* ================= our block: rename, register, move before the registry ================= */
const b0 = lineStart(idx(B0, scriptStart(), "purF banner")), b1 = lineEnd(idx(BEND, b0, "W13 end banner"));
let blk = cutSpan(b0, b1, "purF block").replace(/(\r\n)+$/, ""); if (blk.endsWith(BEND)) blk = blk.slice(0, -BEND.length).replace(/(\r\n)+$/, "");
blk = blk.replace(B0, '/* ===== W13 Purchasing Management V2 JS , prefix purF , kind "purchasing" ===== */');
blk = blk.split('w.kind==="purchasing-mb"').join('w.kind==="purchasing"').split('kind "purchasing-mb"').join('kind "purchasing"');
if (blk.indexOf("purchasing-mb") > -1) throw new Error("purchasing-mb survives in the block: " + JSON.stringify(blk.match(/.{0,40}purchasing-mb.{0,40}/g)));
const borrowed = ["kcard", "kc-top", "kc-num", "kc-vendor", "kc-amt", "kcol-h", "kcol-t", "kcol-n", "kcol-b", "kcol", "kempty", "kanban", "tabs", "tab"];
blk = blk.replace(new RegExp("\\bpur-(" + borrowed.join("|") + ")\\b", "g"), "purf-$1");
if (/\bpur-[a-z]/.test(blk)) throw new Error("her classes survive in the block: " + JSON.stringify(blk.match(/.{0,30}\bpur-[a-z-]+.{0,30}/g).slice(0, 5)));
if (blk.indexOf("WIDGETS.register(") > -1) throw new Error("block already registers");
const register = 'WIDGETS.register("purchasing",{content:purFContent,about:function(w){return {h:w.title,b:PURF_ABOUT};}});';
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + BEND + NL, "W13 block before the registry");

/* ================= CSS: Jo's .pur- run, then the borrowed rules as .purf-* ================= */
{
  const cHdr = idx("   Purchasing Management (pur) , v2 styles" + NL, 0, "pur CSS header"); const s = lineStart(cHdr - NL.length);
  if (t.slice(s, s + 30).indexOf("/* ====") < 0) throw new Error("pur CSS banner not found");
  const apCss = idx("  /* ===== Accounts Payable By Due Date (ap) , v2 : aging", s, "ap CSS header"); let e = lineStart(apCss); while (t.slice(e - NL.length, e) === NL) e -= NL.length;
  const cut = cutSpan(s, e, "Jo's .pur- CSS run");
  /* two shell-level rules lived inside her run and the Gifts widget (W17) uses them: keep them in place */
  const keep = cut.split(NL).filter(function (l) { return /^\.state\[data-tone="pos"\]/.test(l); }); if (keep.length !== 2) throw new Error("expected the two .state[data-tone=pos] rules, got " + keep.length);
  /* the Accounts Payable modal (shell "ap-open" handler) also borrows her fact-grid classes: keep those four rules and their narrow-viewport override */
  const facts = cut.split(NL).filter(function (l) { return /^\.pur-po-fact(s|-k|-v)?\{/.test(l); }); if (facts.length !== 4) throw new Error("expected the four .pur-po-fact rules, got " + facts.length);
  t = t.slice(0, s) + "  /* Positive empty-state tint (used by W17 Gifts; was inside the deleted purchasing run) */" + NL + keep.join(NL) + NL +
      "  /* Fact grid used by the Accounts Payable modal (was inside the deleted purchasing run) */" + NL + facts.join(NL) + NL + "@media (max-width:520px){" + NL + "  .pur-po-facts{grid-template-columns:1fr;}" + NL + "}" + NL + t.slice(s);
  log.push("kept 2 shell rules used by W17 and 4 fact-grid rules used by the AP modal");
  const odd = cut.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*@media|^\s*\/\*/.test(l) && !/\.pur-/.test(l) && !/^\.state\[data-tone="pos"\]/.test(l) && !/^\s*\}?\s*$/.test(l); });
  if (odd.length) throw new Error("non-.pur- rules inside her CSS run: " + JSON.stringify(odd.slice(0, 4)));
  const want = new RegExp("^\\.pur-(" + borrowed.join("|") + ")(\\b|[.:])");
  const copied = cut.split(NL).filter(function (l) { return want.test(l) && !/^\.pur-tab\.on\b.*\.pur-kc|pur-kcol-(done|action|ok|nd)|pur-kcard-(done|action|ok)|pur-kc-(prog|need|age|foot|act)/.test(l); })
    .map(function (l) { return "  " + l.replace(/\.pur-/g, ".purf-root .purf-").replace(/\.purf-root \.purf-tab \.material/, ".purf-root .purf-tab .material"); });
  if (copied.length < 16) throw new Error("expected the borrowed rules, got " + copied.length + ": " + JSON.stringify(copied));
  const CEND = "/* ===== end W13 Purchasing Management V2 CSS ===== */";
  if (t.split(CEND).length !== 2) throw new Error("css end");
  t = t.replace(CEND, "  /* Board, card and tab primitives, copied from her deleted .pur- run (only this widget used them). */" + NL + copied.join(NL) + NL + CEND);
  log.push("copied " + copied.length + " borrowed rules as .purf-root .purf-*");
  /* dead .pur- rules that other blocks' CSS carried for her block; no markup outside her block used them */
  removeLine("  .pur-rowclick{cursor:pointer;}", "AP-block .pur-rowclick");
  removeLine("  .pur-rowclick:hover{background:var(--wn-100);}", "AP-block .pur-rowclick:hover");
  removeLine("  .pur-rowclick:focus-visible{outline:2px solid var(--focus);outline-offset:-2px;}", "AP-block .pur-rowclick:focus-visible");
  removeLine("  .pur-status-chip .w01-spin{margin-right:2px;}", "W01-block .pur-status-chip spinner");
  removeLine("  .w01-pop.pur-pop{z-index:4000;}", "W01-block .pur-pop z-index");
  editLine("     derived from her own .pur-po-note declarations (token border, 8px radius,", /her own \.pur-po-note declarations/, "the note field on her (since deleted) purchasing pop-up", "comment: pur-po-note");
  editLine("  /* Encumbrances view: chart (her .pur-* chart copied as purf-enc-*), period table, split at Detail. */", /her \.pur-\* chart copied as purf-enc-\*/, "her chart, since deleted, copied as purf-enc-*", "comment: pur-* chart");
  const stNow = t.slice(t.indexOf("<style"), styleEnd()); const left = [...new Set(stNow.match(/\.pur-[a-z0-9-]+/g) || [])].filter(function (c) { return !/^\.pur-po-fact/.test(c); }); if (left.length) throw new Error(".pur- rules survive: " + left.join(", "));
}

/* ================= guards ================= */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.join(", "));
const markup = t.slice(scriptStart()); const purCls = [...new Set(markup.match(/class="[^"]*\bpur-[a-z0-9-]+/g) || [])].filter(function (c) { return !/\bpur-po-fact/.test(c); }); if (purCls.length) throw new Error("her classes still in markup: " + purCls.slice(0, 5).join(" | "));
if (t.indexOf("purchasing-mb") > -1) throw new Error("purchasing-mb survives: " + JSON.stringify(t.match(/.{0,50}purchasing-mb.{0,50}/g).slice(0, 4)));
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); log.forEach(function (l) { console.log(l); }); console.log("done: " + t.split(NL).length + " lines");
