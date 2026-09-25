/* One-off, 2026-09-25: build W04 Remittance Pledges (owner: ours 1:1, docs/decisions/W04.md).
   Delete Jo's remittance-mb (remF) and v1 remittance (rem) blocks, hooks, rows and their
   remittance-only CSS; copy the rules our block uses as w04-; register as kind "remittance".
   Also: the shell's two "change" listeners carried the custom date-input handling for payroll
   and remittance; each moves into its widget block (W03 gets w03-date-input handling back,
   which the W03 build had orphaned) and the shell listeners go. Anchored; aborts before writing. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8"); const log = [];
const idx = function (n, from, label) { const i = t.indexOf(n, from || 0); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 70))); return i; };
const once = function (n, label) { const i = idx(n, 0, label); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 70))); return i; };
const lineStart = function (i) { return t.lastIndexOf(NL, i - 1) + NL.length; }, lineEnd = function (i) { return t.indexOf(NL, i) + NL.length; };
function cutSpan(s, e, label) { const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("cut " + cut.split(NL).length + " lines: " + label); return cut; }
function removeLine(n, label) { const i = once(n, label); const s = lineStart(i), e = lineEnd(i); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
const blockBounds = function () { const b0 = t.indexOf("/* ===== W04 Remittance Pledges V2 ===== */", t.indexOf("<script>")); return [b0, t.indexOf("\r\n/* ===== W", b0 + 10)]; };
function removeLineOutside(n, label) { const [b0, b1] = blockBounds(); let i = t.indexOf(n), hit = -1; while (i > -1) { if (i < b0 || i > b1) { if (hit > -1) throw new Error("ambiguous outside block: " + label); hit = i; } i = t.indexOf(n, i + 1); } if (hit < 0) throw new Error("missing outside block: " + label); const s = lineStart(hit), e = lineEnd(hit); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
function editLine(lineNeedle, re, repl, label) { const i = once(lineNeedle, label + " line"); const s = lineStart(i), e = lineEnd(i); const line = t.slice(s, e); if (!re.test(line)) throw new Error("not in line: " + label); t = t.slice(0, s) + line.replace(re, repl) + t.slice(e); log.push("edited in line: " + label); }
function takeLines(re, n, label) { const L = t.split(NL), out = [], keep = []; L.forEach(function (l) { if (re.test(l)) out.push(l); else keep.push(l); }); if (out.length !== n) throw new Error(label + ": expected " + n + ", got " + out.length); t = keep.join(NL); log.push("took " + out.length + " lines: " + label); return out; }
function insertBefore(n, block, label) { const i = once(n, label); const s = lineStart(i); t = t.slice(0, s) + block + NL + t.slice(s); log.push("inserted: " + label); }
const styleEnd = function () { return t.indexOf("</style>"); }, scriptStart = function () { return t.indexOf("<script>"); };
const defsIn = function (s) { return new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(function (m) { return m[1]; }).concat([...s.matchAll(/^\s*var\s+([A-Z][A-Z0-9_]*)\s*=/gm)].map(function (m) { return m[1]; }))); };

/* ================= JS: Jo's v1 then her live block ================= */
const v1S = lineStart(t.lastIndexOf("/* =====", idx('   Remittance Pledges  (prefix: rem, kind:"remittance")', scriptStart(), "v1 header")));
const jS = lineStart(t.lastIndexOf("/* =====", idx('   Remittance Pledges (MB updated)  (prefix: remF, kind:"remittance-mb")', scriptStart(), "remF header")));
const gS = lineStart(t.lastIndexOf("/* =====", idx('   Gifts Pledges  (prefix: gft, kind:"gifts")', scriptStart(), "gifts header")));
if (!(v1S < jS && jS < gS)) throw new Error("block order");
const jBlk = cutSpan(jS, gS, "remF block"); if (jBlk.indexOf("function remFContent(") < 0 || jBlk.indexOf("var REMF_ABOUT=") < 0) throw new Error("remF shape");
const v1 = cutSpan(v1S, jS, "v1 remittance block"); if (v1.indexOf("function remContent(") < 0 || v1.indexOf("var REM_ACTIVITIES=") < 0 || v1.indexOf("function remHandleInput(") < 0) throw new Error("v1 shape");
const deleted = new Set([...defsIn(v1), ...defsIn(jBlk)]);

/* ================= shell hooks ================= */
removeLine('if(w.kind==="remittance")return remContent(w);', "v1 contentHTML");
removeLineOutside('if(w.kind==="remittance-mb")return remFContent(w);', "remF contentHTML");
removeLineOutside('if(w.kind==="remittance-oc")return remOContent(w);', "remO contentHTML");
removeLineOutside('if(pop.type==="remF-thru"||pop.type==="remF-pacef")return remFPopContent();', "remF popContent");
removeLineOutside('if(pop.type==="remO-thru")return remOPopContent();', "remO popContent");
removeLine('if(pop.type==="rem-thru")return remPopContent();', "v1 popContent");
["rem-thru", "remF-thru", "remF-pacef", "remO-thru"].forEach(function (k) { editLine("function triggerSelector(){", new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "", "triggerSelector " + k); });
removeLineOutside('if(modal.type==="remFdetail"){mr.innerHTML=remFDetailModalHTML();return;}', "remF detail modal");
removeLineOutside('if(modal.type==="remOdetail"){if(modalMounted){', "remO detail modal (in-place refresh)");
removeLineOutside('if(modal.type==="remOdrill"){mr.innerHTML=remODrillModalHTML();return;}', "remO drill modal");
removeLineOutside('if(modal.type==="remFdrill"){mr.innerHTML=remFDrillModalHTML();return;}', "remF drill modal");
removeLine('if(modal.type==="remdetail"){mr.innerHTML=remDetailModalHTML();return;}', "v1 detail modal");
removeLineOutside('if(a&&a.indexOf("remF-")===0&&remFHandleClick(a,id,t))return;', "remF click hook");
removeLineOutside('if(a&&a.indexOf("remO-")===0&&remOHandleClickOC(a,id,t))return;', "remO click hook");
removeLine('if(a&&a.indexOf("rem-")===0&&remHandleClick(a,id,t))return;', "v1 click hook");
editLine("function aboutOf(w){", /if\(w\.kind==="remittance"\)return \{h:w\.title,b:"[^"]*"\};/, "", "aboutOf remittance v1");
editLine("function aboutOf(w){", /if\(w\.kind==="remittance-mb"\)return \{h:w\.title,b:REMF_ABOUT\};/, "", "aboutOf remittance-mb");
editLine("function aboutOf(w){", /if\(w\.kind==="remittance-oc"\)return \{h:w\.title,b:REMO_ABOUT\};/, "", "aboutOf remittance-oc");
/* the two shell "change" listeners: their v1 hook goes; the date-input branches move into the widget blocks */
const chg1 = removeLine('document.addEventListener("change",function(e){if(typeof remHandleInput==="function"&&remHandleInput(e))return;if(e.target.classList&&e.target.classList.contains("pr-date-input"))', "shell change listener 1 (payroll dates)");
const chg2 = removeLine('document.addEventListener("change",function(e){if(typeof remHandleInput==="function"&&remHandleInput(e))return;if(e.target.classList&&e.target.classList.contains("remo-date-input"))', "shell change listener 2 (remittance + payroll dates)");
const prDates = (/if\(e\.target\.classList&&e\.target\.classList\.contains\("pr-date-input"\)\)\{[^}]*\{[^}]*\}\}/.exec(chg1) || [])[0];
const remDates = (/if\(e\.target\.classList&&e\.target\.classList\.contains\("remo-date-input"\)\)\{[^}]*\}/.exec(chg2) || [])[0];
if (!prDates || !remDates) throw new Error("date-input branches not extracted");
editLine('document.addEventListener("input",function(e){if(gftHandleInput(e))return;', /if\(typeof remHandleInput==="function"&&remHandleInput\(e\)\)return;/, "", "input listener: drop the v1 remHandleInput hook");
editLine('var sc=e.target.closest&&e.target.closest(".scroll,.mct-scroll,.rem-scroll,', /\.rem-scroll,/, ".w04-scroll,", "click: scroll-container list follows the renamed class");

/* ================= W03 follow-up: payroll custom dates handled inside the W03 block ================= */
const f1 = removeLine('document.addEventListener("focus",function(e){if(e.target.classList&&e.target.classList.contains("pr-date-input"))', "shell focus listener (payroll dates)").replace(/^\s+|\s+$/g, "");
const f2 = removeLine('document.addEventListener("focusout",function(e){if(e.target.classList&&e.target.classList.contains("pr-date-input")', "shell focusout listener (payroll dates)").replace(/^\s+|\s+$/g, "");
const w03Change = "  /* Custom date range: the From / To inputs in the period popover (class w03-date-input); focus tracking keeps the caret through re-renders */" + NL +
  '  document.addEventListener("change",function(e){' + prDates.replace(/"pr-date-input"/, '"w03-date-input"') + "});" + NL +
  "  " + f1.replace(/"pr-date-input"/g, '"w03-date-input"') + NL + "  " + f2.replace(/"pr-date-input"/g, '"w03-date-input"');
insertBefore("/* ===== end W03 Payroll Distributions V2 ===== */", w03Change, "W03: custom date-input change handler inside its block");

/* ================= registry ================= */
takeLines(/^\s*\{id:"remF(2|3|4)?",\s*title:"Remittance Pledges[^"]*",\s*kind:"remittance-mb"/, 4, "remF registry rows");
removeLine('/* Remittance Pledges: our finalized W04, additive. kind "remittance-mb", prefix remF.', "remF registry label comment");
editLine("that exist ONLY inside our own W04 remittance-mb CSS block.", /remittance-mb CSS block/, "remittance CSS block", "W05 comment mentioning the old kind");
(function () {
  const s = lineStart(once('{id:"remO", title:"Remittance Pledges (OC)"', "remO registry row"));
  const e = lineEnd(idx("      */", s, "fixture close"));
  const rows = t.slice(s, e).split(NL).filter(Boolean);
  const fix = function (l) { return l.replace('kind:"remittance-oc"', 'kind:"remittance"').replace(/title:"Remittance Pledges \(OC[^"]*\)"/, 'title:"Remittance Pledges"'); };
  const live = rows.filter(function (l) { return /^\s*\{id:"remO(_k|2)?",\s*title/.test(l); }).map(fix);
  const fixtures = rows.filter(function (l) { return /^\s*\{id:"remO[34]",\s*title/.test(l); }).map(fix);
  if (live.length !== 3 || fixtures.length !== 2) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
  t = t.slice(0, s) + ["      /* W04 Remittance Pledges */"].concat(live).concat(["      /* W04 driver fixtures (state variants), not rendered as cards:"]).concat(fixtures).concat(["      */"]).join(NL) + NL + t.slice(e);
  log.push("registry: 3 live W04 rows + 2 fixtures, kind remittance, plain titles");
})();
removeLine('    ["W04","Remittance Pledges","remittance-mb",', "CMP_ROWS W04");
removeLine('    W04:{h:"Ours repositions her Remittance widget', "CMPNOTE_ W04");

/* ================= the block ================= */
let [b0, b1] = blockBounds();
let blk = cutSpan(b0, b1 + NL.length, "remO JS block").replace(/(\r\n)+$/, "");
blk = blk.replace(/kind:"remittance-oc"/g, 'kind:"remittance"').replace(/remittance-oc/g, "remittance").replace(/title:"Remittance Pledges \((MB updated|OC)[^"]*\)"/g, 'title:"Remittance Pledges"').replace(/Remittance Pledges \(MB updated\)/g, "Remittance Pledges V2");
blk = blk.split(NL).filter(function (l) { return !(/^\s{3,}[A-Za-z][A-Za-z ()\/-]*[.:]{1,}\s*\.{2,}\s*if\(/.test(l) || (/^\s{3,}[A-Za-z()]+:\s+if\(/.test(l)) || /^\s{3,}[A-Za-z][A-Za-z ()]*\.{3,}\s*if\(/.test(l)); }).join(NL);

/* ================= CSS ================= */
const st = t.slice(t.indexOf("<style"), styleEnd());
const declared = new Set((st.match(/\.rem[fF]?-[a-z0-9-]+/gi) || []).map(function (c) { return c.slice(1); }));
const used = new Set(); (blk.match(/(?<![\w-])rem[fF]?-[a-z0-9-]+/g) || []).forEach(function (c) { if (declared.has(c)) used.add(c); });
const c0 = once("/* ===== W04 Remittance Pledges V2 ===== */", "W04 CSS banner"); if (c0 > styleEnd()) throw new Error("W04 CSS banner not in style");
const c1 = idx("\r\n/* ===== W", c0 + 10, "next CSS banner"); if (c1 > styleEnd()) throw new Error("next CSS banner not in style");
(t.slice(c0, c1).match(/\.rem-[a-z0-9-]+/g) || []).forEach(function (c) { if (declared.has(c.slice(1))) used.add(c.slice(1)); });
if (used.size < 10) throw new Error("too few shared classes: " + used.size);
const rules = []; (function () { let i = 0, media = null, depth = 0, buf = ""; while (i < st.length) { const ch = st[i]; if (ch === "{") { const pre = buf.trim(); buf = ""; if (pre.charAt(0) === "@") { media = pre; depth++; i++; continue; } const j = st.indexOf("}", i); rules.push({ sel: pre, body: st.slice(i + 1, j), media: depth ? media : null }); i = j + 1; continue; } if (ch === "}") { if (depth) { depth--; media = null; } buf = ""; i++; continue; } buf += ch; i++; } })();
const usedList = [...used].sort();
const mapped = {}; usedList.forEach(function (c) { const n = "w04-" + c.replace(/^rem[fF]?-/, ""); if (mapped[n] && mapped[n] !== c) throw new Error("w04- name collision: " + c + " vs " + mapped[n]); mapped[n] = c; });
const ren = function (s) { return s.replace(/\.(rem[fF]?-[a-z0-9-]+)/g, function (m, x) { return used.has(x) ? ".w04-" + x.replace(/^rem[fF]?-/, "") : m; }); };
const copies = [], seen = {};
rules.forEach(function (r) { const sel = r.sel.replace(/\/\*[\s\S]*?\*\//g, "").trim(); if (!sel) return; if (/\.remO-|\.remo-/i.test(sel) && !/\.rem-/.test(sel)) return; if (!(sel.match(/\.rem[fF]?-[a-z0-9-]+/g) || []).some(function (c) { return used.has(c.slice(1)); })) return; if (/\.remO-|\.remo-/.test(sel)) return; const ns = ren(sel); const key = (r.media || "") + "|" + ns; if (seen[key]) return; seen[key] = 1; const rule = ns + "{" + r.body.trim() + "}"; copies.push(r.media ? r.media + "{" + rule + "}" : rule); });
/* delete Jo's two remittance CSS blocks (header comment through last rule); the rem+gft shared lines further down stay */
function cutCssBlock(headerNeedle, prefixRe, label) {
  const h = idx(headerNeedle, 0, label + " header"); if (h > styleEnd()) throw new Error(label + " header not in style");
  let s = lineStart(t.lastIndexOf("/* =====", h)); let e = s; const L = t.slice(s, styleEnd()).split(NL); let k = 0, inHead = true, inC = false;
  while (k < L.length) { const l = L[k];
    const ok = inHead || inC ? true : (l.trim() === "" || /^\s*\/\*/.test(l) || /^\s*\*/.test(l) || prefixRe.test(l) || /^\s*@media/.test(l) || /^\s*\}/.test(l) || (/^\s+[a-z-]+:/.test(l) && !/\{/.test(l)));
    if (!ok) break;
    if (inHead && /\*\/\s*$/.test(l)) inHead = false;
    if (!inHead) { if (/\/\*/.test(l) && !/\*\//.test(l)) inC = true; else if (inC && /\*\//.test(l)) inC = false; }
    e += l.length + NL.length; k++; }
  /* trim trailing blank lines from the span */
  while (t.slice(e - NL.length * 2, e) === NL + NL) e -= NL.length;
  const cut = cutSpan(s, e, label); const rulesIn = cut.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*@media|^\s*\/\*/.test(l); }); const odd = rulesIn.filter(function (l) { return !prefixRe.test(l); }); if (odd.length) throw new Error(label + " cut touched: " + odd[0]);
}
cutCssBlock("   Remittance Pledges (prefix: rem)  , CSS block", /\.rem-/, "Jo's v1 .rem- CSS");
cutCssBlock("     Remittance Pledges (MB updated) (prefix: remF), CSS block", /\.remF?-/, "Jo's .remF- CSS (incl. her .rem-drill-* modal rules)");
/* rebuild our region */
const cc0 = once("/* ===== W04 Remittance Pledges V2 ===== */", "W04 CSS banner (2)"), cc1 = idx("\r\n/* ===== W", cc0 + 10, "next CSS banner (2)");
const ownRules = t.slice(cc0, cc1).split(NL).slice(1).filter(function (l) { return l.trim() && !/^\s*\/\* =====.*\(MB updated\)/.test(l); }).map(ren);
const newCss = ["/* ===== W04 Remittance Pledges V2 CSS ===== */", "  /* Stand-alone copies of the remittance rules this widget uses (w04- prefix). Classes: " + usedList.join(" ") + " */"]
  .concat(copies.map(function (c) { return "  " + c; })).concat(ownRules).concat(["/* ===== end W04 Remittance Pledges V2 CSS ===== */"]).join(NL);
t = t.slice(0, cc0) + newCss + t.slice(cc1); log.push("W04 CSS region rebuilt: " + copies.length + " w04- copies + " + ownRules.length + " own lines");
/* repoint the block */
const renameRe = new RegExp("(?<![\\w-])(" + usedList.map(function (c) { return c.replace(/-/g, "\\-"); }).join("|") + ")(?![\\w-])", "g");
blk = blk.replace(renameRe, function (m) { return "w04-" + m.replace(/^rem[fF]?-/, ""); });
const leftover = [...new Set((blk.match(/(?<![\w-])rem[fF]?-[a-z0-9-]+/g) || []).filter(function (c) { return !/-$/.test(c) && !/^remo-/i.test(c); }))];
leftover.forEach(function (c) { blk = blk.replace(new RegExp("(?<![\\w-])" + c.replace(/-/g, "\\-") + "(?![\\w-])", "g"), "w04-" + c.replace(/^rem[fF]?-/, "")); });
if (leftover.length) log.push("renamed unstyled hook classes: " + leftover.join(" "));
/* our own remo- date input class -> w04- too, and its change handler lives in the block */
blk = blk.replace(/(?<![\w-])remo-date-input(?![\w-])/g, "w04-date-input");
const w04Change = "  /* Custom receipts-window dates: the From / To inputs in the popover (class w04-date-input) */" + NL +
  '  document.addEventListener("change",function(e){' + remDates.replace(/"remo-date-input"/, '"w04-date-input"') + "});";

/* ================= register + place ================= */
const register = '  WIDGETS.register("remittance",{content:remOContent,about:function(w){return {h:w.title,b:REMO_ABOUT};},' +
  'click:function(a,id,t){return !!(a&&a.indexOf("remO-")===0&&remOHandleClickOC(a,id,t));},' +
  'pops:{"remO-thru":{content:remOPopContent,trigger:function(){return \'[data-action="remO-thru"][data-id="\'+pop.id+\'"]\';}}},' +
  "modals:{remOdetail:remOPledgeModalHTML,remOdrill:remODrillModalHTML}});";
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + w04Change + NL + register + NL + "/* ===== end W04 Remittance Pledges V2 ===== */" + NL, "W04 block before the registry");

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
/* code only: block comments stripped across the whole text (wiring notes inside comments look like code line by line) */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
/* literal leftovers are checked in code only; a comment elsewhere naming an old kind is not a defect */
['kind:"remittance-mb"', 'kind:"remittance-oc"', "remittance-mb", "remittance-oc", "remFContent", "remContent(", "REMF_", "remHandleInput", "pr-date-input", "remo-date-input", ".remF-"].forEach(function (n) { const i = codeOnly.indexOf(n); if (i > -1) throw new Error("leftover in code: " + n + "  -> " + codeOnly.slice(codeOnly.lastIndexOf(NL, i) + 2, codeOnly.indexOf(NL, i)).slice(0, 140)); });
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
