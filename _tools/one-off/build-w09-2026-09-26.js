/* One-off, 2026-09-26: build W09 Payroll Scheduled Time Off (owner: ours 1:1, docs/decisions/W09.md).
   Delete Jo's live "pto" block (the pre-phase-2 one in this file), its hooks, rows and .pto- CSS;
   copy the 18 shared .pto- classes our block uses as w09-; register ours as kind "pto" (content,
   about; the block keeps its own data-pto click / keyboard / resize handling). Anchored; aborts
   before writing on any miss. */
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
const B0 = "/* ===== W09 Payroll Scheduled Time Off V2 ===== */", BEND = "/* ===== end W09 Payroll Scheduled Time Off V2 ===== */";

/* ================= JS: Jo's live pto block ================= */
const jS = lineStart(idx("  /* ===== Payroll Scheduled Time Off (pto) ===== */", scriptStart(), "pto header"));
const aS = lineStart(t.lastIndexOf("/* =====", idx('   Accounts Payable By Due Date  (ap, kind:"payables")  ,  v2 redesign', scriptStart(), "ap header")));
if (!(jS < aS)) throw new Error("block order");
let jE = aS; while (t.slice(jE - NL.length * 2, jE) === NL + NL) jE -= NL.length;
const jBlk = cutSpan(jS, jE, "Jo's pto block"); if (jBlk.indexOf("function ptoContent(") < 0 || jBlk.indexOf("var PTO_DEPTS_MAIN=") < 0) throw new Error("pto shape");
const deleted = new Set([...defsIn(jBlk)]);

/* ================= shell hooks ================= */
removeLine('if(w.kind==="pto")return ptoContent(w);', "pto contentHTML");
removeLine('if(w.kind==="pto-mb")return ptoFContent(w);', "ptoF contentHTML");
removeLine('if(pop.type==="pto-year"){var wy=find(pop.id),cy=ptoCurYear(wy);', "pto-year popContent");
removeLine('if(pop.type==="pto-view"){var wv=find(pop.id),cv=wv.ptoView||"pending";', "pto-view popContent");
["pto-year", "pto-view"].forEach(function (k) { editLine("function triggerSelector(){", new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "", "triggerSelector " + k); });
removeLine('if(modal.type==="pto-confirm"){mr.innerHTML=ptoConfirmModalHTML();modalMounted=true;return;}', "pto-confirm modal");
['if(a==="pto-expand"){var wpe=find(id)', 'if(a==="pto-year"){pop=(pop&&pop.type==="pto-year"', 'if(a==="pto-set-year"){var wsy=find(id)', 'if(a==="pto-view"){pop=(pop&&pop.type==="pto-view"', 'if(a==="pto-set-view"){var wsv=find(id)', 'if(a==="pto-approve-day"){var wpd=find(id)', 'if(a==="pto-unapprove-day"){var wpu=find(id)', 'if(a==="pto-approve-emp"){modal={type:"pto-confirm"', 'if(a==="pto-approve-emp-confirm"){var wpc=find(id)', 'if(a==="pto-unapprove-emp"){var wpx=find(id)'].forEach(function (n) { removeLine(n, "click hook " + n.slice(6, 30)); });
let aboutText = "";
editLine("function aboutOf(w){", /if\(w\.kind==="pto-mb"\)return \{h:w\.title,b:PTOF_ABOUT\};/, "", "aboutOf pto-mb");

/* ================= registry ================= */
takeLines(/^\s*\{id:"pto(_k|2|3|4)?",title:"Payroll Scheduled Time Off[^"]*",kind:"pto",/, 5, "Jo's pto registry rows");
const ours = takeLines(/^\s*\{id:"ptoF(_k|_x|2|3)?",\s*title:"Payroll Scheduled Time Off \(OC[^"]*\)",\s*kind:"pto-mb"/, 5, "ptoF registry rows (to rebuild)");
const fix = function (l) { return l.replace('kind:"pto-mb"', 'kind:"pto"').replace(/title:"Payroll Scheduled Time Off \(OC[^"]*\)"/, 'title:"Payroll Scheduled Time Off"'); };
const live = ours.filter(function (l) { return /^\s*\{id:"ptoF(_k|_x)?",/.test(l); }).map(fix), fixtures = ours.filter(function (l) { return /^\s*\{id:"ptoF[23]",/.test(l); }).map(fix);
if (live.length !== 3 || fixtures.length !== 2) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
insertBefore("      /* W08 My Status */", ["      /* W09 Payroll Scheduled Time Off */"].concat(live).concat(["      /* W09 driver fixtures (state variants), not rendered as cards:"]).concat(fixtures).concat(["      */"]).join(NL), "W09 registry rows");
removeLine('    ["W09","Payroll Scheduled Time Off","pto",', "CMP_ROWS W09");
removeLine('    W09:{h:"Ours restructures her Time Off widget around a per-day approval model,', "CMPNOTE_ W09");

/* ================= the block ================= */
const hS = lineStart(idx('   Payroll Scheduled Time Off (MB updated) , prefix ptoF , kind "pto-mb"', scriptStart(), "ptoF header")) - NL.length;
const b0 = lineStart(t.lastIndexOf("/* =====", hS)), b1 = lineEnd(idx(BEND, b0, "W09 end banner"));
let blk = cutSpan(b0, b1, "ptoF block").replace(/(\r\n)+$/, "");
(function () { const he = blk.indexOf("*/") + 2; if (!/prefix ptoF/.test(blk.slice(0, he))) throw new Error("block header comment"); blk = B0 + NL + "/* Payroll Scheduled Time Off: per-day approval of scheduled leave. Approval Queue (group by Department or Pay Group, a person row expands to that person's day-lines; Pending / Approved, Outstanding derived for past pending days) and a Leave Calendar month grid with a department filter; Glance shows Pending and Outstanding. */" + blk.slice(he); log.push("block header comment replaced by a purpose line"); })();
blk = blk.replace(/kind:"pto-mb"/g, 'kind:"pto"').replace(/pto-mb/g, "pto").replace(/Payroll Scheduled Time Off \(OC[^"']*\)/g, "Payroll Scheduled Time Off");
blk = blk.split(NL).filter(function (l) { return !(/^\s{3,}[A-Za-z][A-Za-z ()\/-]*[.:]{1,}\s*\.{2,}\s*if\(/.test(l) || /^\s{3,}[A-Za-z()]+:\s+if\(/.test(l) || /^\s{3,}[A-Za-z][A-Za-z ()]*\.{3,}\s*if\(/.test(l)); }).join(NL);
if (blk.indexOf("var PTOF_ABOUT=") < 0) throw new Error("PTOF_ABOUT");

/* ================= CSS ================= */
const st = t.slice(t.indexOf("<style"), styleEnd());
const declared = new Set((st.match(/\.pto-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); }));
const used = new Set((blk.match(/(?<![\w-])pto-[a-z0-9-]+/g) || []).filter(function (c) { return declared.has(c); }));
const c0 = idx("/* ===== W09 Payroll Scheduled Time Off V2 CSS ===== */", 0, "W09 CSS banner"), cEnd = "/* ===== end W09 Payroll Scheduled Time Off V2 CSS ===== */", c1 = idx(cEnd, c0, "W09 CSS end");
(t.slice(c0, c1).match(/\.pto-[a-z0-9-]+/g) || []).forEach(function (c) { if (declared.has(c.slice(1))) used.add(c.slice(1)); });
if (used.size < 15) throw new Error("too few shared classes: " + used.size);
const w09 = function (c) { return "w09-" + c.replace(/^pto-/, ""); };
const ren = function (s) { return s.replace(/\.(pto-[a-z0-9-]+)/g, function (m, x) { return used.has(x) ? "." + w09(x) : m; }); };
const rules = []; (function () { let i = 0, media = null, depth = 0, buf = ""; while (i < st.length) { const ch = st[i]; if (ch === "{") { const pre = buf.trim(); buf = ""; if (pre.charAt(0) === "@") { media = pre; depth++; i++; continue; } const j = st.indexOf("}", i); rules.push({ sel: pre, body: st.slice(i + 1, j), media: depth ? media : null, at: i }); i = j + 1; continue; } if (ch === "}") { if (depth) { depth--; media = null; } buf = ""; i++; continue; } buf += ch; i++; } })();
const sOff = t.indexOf("<style"), r0 = c0 - sOff, r1 = c1 - sOff;
const copies = [];
rules.forEach(function (r) { if (r.at >= r0 && r.at < r1) return; const sel = r.sel.replace(/\/\*[\s\S]*?\*\//g, "").trim(); const cls = sel.match(/\.pto-[a-z0-9-]+/g) || []; if (!cls.length || !cls.every(function (c) { return used.has(c.slice(1)); })) return; const rule = ren(sel) + "{" + r.body.trim() + "}"; copies.push(r.media ? r.media + "{" + rule + "}" : rule); });
if (copies.length < 12) throw new Error("too few copied rules: " + copies.length);
/* delete Jo's .pto- run (no header comment of its own: it starts right after the purchasing media rule) */
(function () { const first = idx("  .pto-hd .pto-chips{", 0, ".pto- first rule"); let s = lineStart(first), e = s; const L = t.slice(s, styleEnd()).split(NL); let k = 0, inC = false; while (k < L.length) { const l = L[k]; if (/^\s*\/\* =====/.test(l)) break; const ok = inC || l.trim() === "" || /^\s*\/\*/.test(l) || /\.pto-/.test(l) || /^\s*@media/.test(l) || /^\s*\}/.test(l) || (/^\s+[a-z-]+:/.test(l) && !/\{/.test(l)); if (!ok) break; if (/\/\*/.test(l) && !/\*\//.test(l)) inC = true; else if (inC && /\*\//.test(l)) inC = false; e += l.length + NL.length; k++; } while (t.slice(e - NL.length * 2, e) === NL + NL) e -= NL.length; const cut = cutSpan(s, e, "Jo's .pto- CSS run"); const odd = cut.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*@media|^\s*\/\*/.test(l) && !/\.pto-/.test(l); }); if (odd.length) throw new Error("non-pto rule in the run: " + odd[0].trim().slice(0, 80)); })();
/* our region: copies first, own rules renamed */
const cc0 = idx("/* ===== W09 Payroll Scheduled Time Off V2 CSS ===== */", 0, "W09 CSS banner (2)"), cc1 = idx(cEnd, cc0, "W09 CSS end (2)");
const ownRules = t.slice(cc0, cc1).split(NL).slice(1).filter(function (l) { return l.trim(); }).map(ren);
const newCss = ["/* ===== W09 Payroll Scheduled Time Off V2 CSS ===== */", "  /* Stand-alone copies of the time-off rules this widget uses (w09- prefix). Classes: " + [...used].sort().join(" ") + " */"].concat(copies.map(function (c) { return "  " + c; })).concat(ownRules).join(NL) + NL;
t = t.slice(0, cc0) + newCss + t.slice(cc1); log.push("W09 CSS region rebuilt: " + copies.length + " w09- copies + " + ownRules.length + " own lines");
/* repoint the block */
const usedList = [...used];
blk = blk.replace(new RegExp("(?<![\\w-])(" + usedList.map(function (c) { return c.replace(/-/g, "\\-"); }).join("|") + ")(?![\\w-])", "g"), function (m) { return w09(m); });

/* ================= register + place ================= */
const register = 'WIDGETS.register("pto",{content:ptoFContent,about:function(w){return {h:w.title,b:PTOF_ABOUT};}});';
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + BEND + NL, "W09 block before the registry");

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
['kind:"pto-mb"', "pto-mb", "ptoContent(", "PTO_DEPTS", "PTO_VIEWS", "ptoConfirmModalHTML", "pto-confirm", "pto-set-year", "pto-set-view"].forEach(function (n) { const i = codeOnly.indexOf(n); if (i > -1) throw new Error("leftover in code: " + n + "  -> " + codeOnly.slice(codeOnly.lastIndexOf("\n", i) + 1, i + 80)); });
const stNow = t.slice(t.indexOf("<style"), styleEnd()); const ptoLeft = [...new Set(stNow.match(/\.pto-[a-z0-9-]+/g) || [])];
if (ptoLeft.length) throw new Error(".pto- rules left: " + ptoLeft.join(" "));
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
// Same day: the viewer's VIEW_WNUM map gained pto:"W09".
// Same day: the block already ended with the end banner, so the build appended a second one and the
// register line sat outside the region; the first banner was removed by hand.
