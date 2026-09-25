/* One-off, 2026-09-25: build W03 Payroll Distributions (owner: ours 1:1, docs/decisions/W03.md).
   Delete Jo's payroll-mb (prF) and retired v1 payroll (pr) blocks, hooks, rows and their
   payroll-only .pr- / .prf- CSS; copy the rules our block uses as w03-; rewire the shell's
   scoped drill-modal body to the final kind; kind payroll-oc -> payroll; plain titles;
   register. Anchored; aborts before writing on any miss. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8"); const log = [];
const idx = function (n, from, label) { const i = t.indexOf(n, from || 0); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 70))); return i; };
const once = function (n, label) { const i = idx(n, 0, label); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 70))); return i; };
const lineStart = function (i) { return t.lastIndexOf(NL, i - 1) + NL.length; }, lineEnd = function (i) { return t.indexOf(NL, i) + NL.length; };
function cutSpan(s, e, label) { const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("cut " + cut.split(NL).length + " lines: " + label); return cut; }
function removeLine(n, label) { const i = once(n, label); const s = lineStart(i), e = lineEnd(i); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
function removeLineOutside(n, _b0, _b1, label) { const b0 = t.indexOf("/* ===== W03 Payroll Distributions V2 ===== */", t.indexOf("<script>")), b1 = t.indexOf("\r\n/* ===== W", b0 + 10); let i = t.indexOf(n), hit = -1; while (i > -1) { if (i < b0 || i > b1) { if (hit > -1) throw new Error("ambiguous outside block: " + label); hit = i; } i = t.indexOf(n, i + 1); } if (hit < 0) throw new Error("missing outside block: " + label); const s = lineStart(hit), e = lineEnd(hit); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); }
function editLine(lineNeedle, re, repl, label) { const i = once(lineNeedle, label + " line"); const s = lineStart(i), e = lineEnd(i); const line = t.slice(s, e); if (!re.test(line)) throw new Error("not in line: " + label); t = t.slice(0, s) + line.replace(re, repl) + t.slice(e); log.push("edited in line: " + label); }
function takeLines(re, n, label) { const L = t.split(NL), out = [], keep = []; L.forEach(function (l) { if (re.test(l)) out.push(l); else keep.push(l); }); if (out.length !== n) throw new Error(label + ": expected " + n + ", got " + out.length); t = keep.join(NL); log.push("took " + out.length + " lines: " + label); return out; }
function insertBefore(n, block, label) { const i = once(n, label); const s = lineStart(i); t = t.slice(0, s) + block + NL + t.slice(s); log.push("inserted: " + label); }
const styleEnd = function () { return t.indexOf("</style>"); }, scriptStart = function () { return t.indexOf("<script>"); };
const defsIn = function (s) { return new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(function (m) { return m[1]; }).concat([...s.matchAll(/^\s*var\s+([A-Z][A-Z0-9_]*)\s*=/gm)].map(function (m) { return m[1]; }))); };

/* ================= JS: v1 (pr) then Jo's live (prF) ================= */
const jHead = idx('     Payroll Distributions (MB updated)    (prefix: prF, kind:"payroll-mb")', scriptStart(), "prF header");
const jStart = lineStart(t.lastIndexOf("/* =====", jHead));
const v1Start = lineStart(once("  /* ---- Payroll Distributions ---- */", "v1 banner"));
if (!(v1Start < jStart)) throw new Error("v1 banner not before the prF header");
const v1 = cutSpan(v1Start, jStart, "v1 payroll block (data + render + prContent)");
if (v1.indexOf("function prContent(") < 0 || v1.indexOf("var PR_DISTS=") < 0 || v1.indexOf("function prRangeBoundsFor(") < 0) throw new Error("v1 block shape");
/* prF: from its header to the first top-level definition after prFPopContent that is not prF/PRF */
const jS = lineStart(t.lastIndexOf("/* =====", idx('     Payroll Distributions (MB updated)    (prefix: prF, kind:"payroll-mb")', scriptStart())));
const popI = idx("  function prFPopContent(", jS, "prFPopContent");
let jE = popI; const defRe = /\r\n  (function |var |\/\* =====)([A-Za-z_$][\w$]*)?/g; defRe.lastIndex = popI + 10; let m;
while ((m = defRe.exec(t))) { const nm = m[2] || ""; if (/^prF|^PRF_/.test(nm)) continue; jE = m.index + NL.length; break; }
const jBlk = cutSpan(jS, jE, "prF block (data + render + handlers)");
if (jBlk.indexOf("function prFContent(") < 0 || jBlk.indexOf("var PRF_ABOUT=") < 0 || jBlk.indexOf("function prFPopContent(") < 0) throw new Error("prF block shape");
const deleted = new Set([...defsIn(v1), ...defsIn(jBlk)]);

/* ================= our block position (for outside-block anchoring) ================= */
const B0 = idx("/* ===== W03 Payroll Distributions V2 ===== */", scriptStart(), "W03 JS banner"), B1 = idx("\r\n/* ===== W", B0 + 10, "next banner");

/* ================= shell hooks ================= */
removeLine('if(w.kind==="payroll")return prContent(w);', "v1 contentHTML");
removeLineOutside('if(w.kind==="payroll-mb")return prFContent(w);', B0, B1, "prF contentHTML");
removeLineOutside('if(w.kind==="payroll-oc")return prOContent(w);', B0, B1, "prO contentHTML");
removeLineOutside('if(pop.type==="prF-period"||pop.type==="prF-scope")return prFPopContent();', B0, B1, "prF popContent");
removeLineOutside('if(pop.type==="prO-period"||pop.type==="prO-scope"||pop.type==="prO-pt")return prOPopContent();', B0, B1, "prO popContent");
(function () { const s = lineStart(once('    if(pop.type==="prperiod"){', "v1 prperiod popover")); const e = lineEnd(idx("return customRow+", s, "prperiod end")); cutSpan(s, e, "v1 prperiod popover"); })();
(function () { const s = lineStart(once('    if(pop.type==="pr-scope"){', "v1 pr-scope popover")); const e = lineEnd(idx("      return out;}", s, "pr-scope end")); cutSpan(s, e, "v1 pr-scope popover"); })();
["prperiod", "pr-scope", "prF-period", "prF-scope", "prO-period", "prO-scope", "prO-pt"].forEach(function (k) {
  editLine("function triggerSelector(){", new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "", "triggerSelector " + k);
});
editLine("function aboutOf(w){", /if\(w\.kind==="payroll"\)return \{h:w\.title,b:"[^"]*"\};/, "", "aboutOf payroll v1");
editLine("function aboutOf(w){", /if\(w\.kind==="payroll-mb"\)return \{h:w\.title,b:PRF_ABOUT\};/, "", "aboutOf payroll-mb");
editLine("function aboutOf(w){", /if\(w\.kind==="payroll-oc"\)return \{h:w\.title,b:PRO_ABOUT\};/, "", "aboutOf payroll-oc");
/* the shell's scoped drill modal picks its body by kind: point it at the final kind */
editLine("var body=(modal.scoped?", /\(\(modal\.mw&&modal\.mw\.kind==="payroll-mb"\)\?prFContent\(modal\.mw\):\(modal\.mw&&modal\.mw\.kind==="payroll-oc"\)\?prOContent\(modal\.mw\):depContent\(modal\.mw\)\)/,
  '((modal.mw&&modal.mw.kind==="payroll")?prOContent(modal.mw):depContent(modal.mw))', "scoped modal body -> kind payroll");
removeLineOutside('if(a&&a.indexOf("prF-")===0&&prFHandleClick(a,id,t))return;', B0, B1, "prF click hook");
removeLineOutside('if(a&&a.indexOf("prO-")===0&&prOHandleClick(a,id,t))return;', B0, B1, "prO click hook");
takeLines(/^\s*if\(a==="(pr-[a-z-]+|prperiod)"\)\{/, 7, "v1 payroll click branches");

/* ================= registry ================= */
takeLines(/^\s*\{id:"prF(_k|_x|2|3|4)?",\s*title:"Payroll Distributions[^"]*",\s*kind:"payroll-mb"/, 6, "prF registry rows");
removeLine('/* Payroll Distributions: our finalized W03, additive. kind "payroll-mb", prefix prF', "prF registry label comment");
(function () {
  const s = lineStart(once('{id:"prO",  title:"Payroll Distributions (OC)"', "prO registry row"));
  const e = lineEnd(idx("      */", s, "fixture close"));
  const rows = t.slice(s, e).split(NL).filter(Boolean);
  const fix = function (l) { return l.replace('kind:"payroll-oc"', 'kind:"payroll"').replace(/title:"Payroll Distributions \(OC[^"]*\)"/, 'title:"Payroll Distributions"'); };
  const live = rows.filter(function (l) { return /^\s*\{id:"prO(_k|_x)?",/.test(l); }).map(fix);
  const fixtures = rows.filter(function (l) { return /^\s*\{id:"prO[234]",/.test(l); }).map(fix);
  if (live.length !== 3 || fixtures.length !== 3) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
  t = t.slice(0, s) + ["      /* W03 Payroll Distributions */"].concat(live).concat(["      /* W03 driver fixtures (state variants), not rendered as cards:"]).concat(fixtures).concat(["      */"]).join(NL) + NL + t.slice(e);
  log.push("registry: 3 live W03 rows + 3 fixtures, kind payroll, plain titles");
})();
removeLine('    ["W03","Payroll Distributions","payroll-mb",', "CMP_ROWS W03");
removeLine('    W03:{h:"Ours is her Payroll widget', "CMPNOTE_ W03");

/* ================= the block ================= */
const b0 = idx("/* ===== W03 Payroll Distributions V2 ===== */", scriptStart(), "W03 JS banner"), b1 = idx("\r\n/* ===== W", b0 + 10, "next banner");
let blk = cutSpan(b0, b1 + NL.length, "prO JS block").replace(/(\r\n)+$/, "");
blk = blk.replace(/kind:"payroll-oc"/g, 'kind:"payroll"').replace(/payroll-oc/g, "payroll").replace(/title:"Payroll Distributions \(MB updated[^"]*\)"/g, 'title:"Payroll Distributions"').replace(/Payroll Distributions \(MB updated\)/g, "Payroll Distributions V2");
blk = blk.split(NL).filter(function (l) { return !(/dispatch|branch/.test(l) && /if\(/.test(l) && /^\s*(\d\.|[a-zA-Z]+\(\)|\/\*)/.test(l)); }).join(NL);

/* ================= CSS ================= */
const styleText = function () { return t.slice(t.indexOf("<style"), styleEnd()); };
let st = styleText();
const declared = new Set((st.match(/\.prf?-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); }));
const used = new Set(); (blk.match(/(?<![\w-])prf?-[a-z0-9-]+/g) || []).forEach(function (c) { if (declared.has(c)) used.add(c); });
/* our own CSS region also uses shared pr- classes in compound selectors (.pro-split .pr-split-chart): count those too */
const c0 = once("/* ===== W03 Payroll Distributions V2 ===== */", "W03 CSS banner"); if (c0 > styleEnd()) throw new Error("W03 CSS banner not in style");
const c1 = idx("\r\n/* ===== W", c0 + 10, "next CSS banner"); if (c1 > styleEnd()) throw new Error("next CSS banner not in style");
let region = t.slice(c0, c1);
(region.match(/\.prf?-[a-z0-9-]+/g) || []).forEach(function (c) { if (declared.has(c.slice(1))) used.add(c.slice(1)); });
if (used.size < 8) throw new Error("too few shared classes found: " + used.size);
const rules = []; (function () { let i = 0, media = null, depth = 0, buf = ""; while (i < st.length) { const ch = st[i]; if (ch === "{") { const pre = buf.trim(); buf = ""; if (pre.charAt(0) === "@") { media = pre; depth++; i++; continue; } const j = st.indexOf("}", i); rules.push({ sel: pre, body: st.slice(i + 1, j), media: depth ? media : null }); i = j + 1; continue; } if (ch === "}") { if (depth) { depth--; media = null; } buf = ""; i++; continue; } buf += ch; i++; } })();
const usedList = [...used].sort();
const ren = function (s) { return s.replace(/\.(prf?-[a-z0-9-]+)/g, function (m, x) { return used.has(x) ? ".w03-" + x.replace(/^prf?-/, "") : m; }); };
const copies = [], seen = {};
rules.forEach(function (r) { const sel = r.sel.replace(/\/\*[\s\S]*?\*\//g, "").trim(); if (!sel) return; if (/^\.pro-/.test(sel) && !/\.prf?-/.test(sel)) return; if (!(sel.match(/\.prf?-[a-z0-9-]+/g) || []).some(function (c) { return used.has(c.slice(1)); })) return; if (/\.pro-/.test(sel)) return; /* our region's own compound rules are handled below */ const ns = ren(sel); const key = (r.media || "") + "|" + ns; if (seen[key]) return; seen[key] = 1; const rule = ns + "{" + r.body.trim() + "}"; copies.push(r.media ? r.media + "{" + rule + "}" : rule); });
/* delete Jo's payroll CSS runs (payroll-only; nothing else uses them) */
const runsToCut = [["  .pr-pop-dates{", "  .pr-split-chart"], ["  .prf-gcomp{", null], ["  .pr-tools{", null]];
[[".pr-pop-dates{", "v1 popover dates"], [".pr-split{", "v1 split layout"], [".prf-gcomp{", "prF glance composition"], [".pr-tools{", "v1 tools row"]].forEach(function (p) {
  const i = t.indexOf("  " + p[0]); if (i < 0 || i > styleEnd()) throw new Error("CSS run start missing: " + p[1]);
  /* run = consecutive lines (allowing 1 blank/comment) whose selector contains .pr- / .prf- */
  let s = lineStart(i), e = s, L = t.slice(s, styleEnd()).split(NL), k = 0;
  while (k < L.length && (/\.prf?-/.test(L[k]) || (L[k].trim() === "" && k + 1 < L.length && /\.prf?-/.test(L[k + 1])) || /^\s*\/\*.*\*\/\s*$/.test(L[k]) && k + 1 < L.length && /\.prf?-/.test(L[k + 1]))) { e += L[k].length + NL.length; k++; }
  const cut = cutSpan(s, e, "Jo's payroll CSS run: " + p[1]);
  const odd = cut.split(NL).filter(function (l) { return l.trim() && !/\.prf?-|^\s*\/\*/.test(l); }); if (odd.length) throw new Error("payroll CSS cut touched: " + odd[0]);
});
/* rebuild our region: banner, copies, our own rules with shared classes renamed, end banner */
const cc0 = once("/* ===== W03 Payroll Distributions V2 ===== */", "W03 CSS banner (2)"); const cc1 = idx("\r\n/* ===== W", cc0 + 10, "next CSS banner (2)");
region = t.slice(cc0, cc1).split(NL).slice(1).filter(function (l) { return l.trim() && !/^\s*\.pr-fchip/.test(l); }).map(function (l) { return ren(l); });
const newCss = ["/* ===== W03 Payroll Distributions V2 CSS ===== */", "  /* Stand-alone copies of the payroll rules this widget uses (w03- prefix). Classes: " + usedList.join(" ") + " */"]
  .concat(copies.map(function (c) { return "  " + c; })).concat(region).concat(["/* ===== end W03 Payroll Distributions V2 CSS ===== */"]).join(NL);
t = t.slice(0, cc0) + newCss + t.slice(cc1); log.push("W03 CSS region rebuilt: " + copies.length + " w03- copies + " + region.length + " own rules");
/* repoint the block's markup */
const renameRe = new RegExp("(?<![\\w-])(" + usedList.map(function (c) { return c.replace(/-/g, "\\-"); }).join("|") + ")(?![\\w-])", "g");
blk = blk.replace(renameRe, function (m) { return "w03-" + m.replace(/^prf?-/, ""); });
/* unstyled leftovers: rename too, so the block references nothing named pr- */
const leftover = [...new Set((blk.match(/(?<![\w-])prf?-[a-z0-9-]+/g) || []).filter(function (c) { return !/-$/.test(c); }))];
leftover.forEach(function (c) { blk = blk.replace(new RegExp("(?<![\\w-])" + c.replace(/-/g, "\\-") + "(?![\\w-])", "g"), "w03-" + c.replace(/^prf?-/, "")); });
if (leftover.length) log.push("renamed unstyled hook classes: " + leftover.join(" "));

/* ================= register + place ================= */
const trig = function (k) { return '"' + k + '":{content:prOPopContent,trigger:function(){return \'[data-action="' + k + '"][data-id="\'+pop.id+\'"]\';}}'; };
const register = '  WIDGETS.register("payroll",{content:prOContent,about:function(w){return {h:w.title,b:PRO_ABOUT};},' +
  'click:function(a,id,t){return !!(a&&a.indexOf("prO-")===0&&prOHandleClick(a,id,t));},' +
  "pops:{" + ["prO-period", "prO-scope", "prO-pt"].map(trig).join(",") + "}});";
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + "/* ===== end W03 Payroll Distributions V2 ===== */" + NL, "W03 block before the registry");

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const codeLines = t.split(NL).filter(function (l) { return l.trim() && !/^\s*(\/\*|\*|\/\/)/.test(l); });
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; const re = new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])"); return codeLines.some(function (l) { return re.test(l.replace(/\/\*[\s\S]*?\*\//g, "")); }); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
['kind:"payroll-mb"', 'kind:"payroll-oc"', "payroll-mb", "payroll-oc", "prFContent", "prContent(", "PRF_", 'pop.type==="prperiod"){', ".prf-"].forEach(function (n) { if (t.indexOf(n) > -1) throw new Error("leftover: " + n + " @" + t.slice(0, t.indexOf(n)).split(NL).length); });
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
