/* One-off, 2026-09-25: build W02 Pension Plans (owner decision, docs/decisions/W02.md):
   keep our penO version at every size; delete Jo's pension-mb (penF) and retired v1
   pension blocks and their .pen- and .penf- CSS (pension-only, nothing else uses them);
   copy the rules our block uses as w02- so it stands alone; reword the Glance caption;
   24 varied appointees; the drill modal keeps its two columns but the table gets the
   width. Kind pension-oc -> pension; plain titles; registered. Anchored; aborts before
   writing on any miss. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8"); const log = [];
const idx = function (n, from, label) { const i = t.indexOf(n, from || 0); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 70))); return i; };
const once = function (n, label) { const i = idx(n, 0, label); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 70))); return i; };
const lineStart = function (i) { return t.lastIndexOf(NL, i - 1) + NL.length; }, lineEnd = function (i) { return t.indexOf(NL, i) + NL.length; };
function cutLines(from, to, incl, label, after) { const i = idx(from, after || 0, label + " start"), j = idx(to, i + from.length, label + " end"); const s = lineStart(i), e = incl ? lineEnd(j) : lineStart(j); const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("cut " + cut.split(NL).length + " lines: " + label); return cut; }
function removeLine(n, label) { const i = once(n, label); const s = lineStart(i), e = lineEnd(i); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
function removeSub(re, label) { const m = t.match(re); if (!m) throw new Error("substring missing: " + label); if (t.match(new RegExp(re.source, "g")).length !== 1) throw new Error("substring ambiguous: " + label); t = t.replace(re, ""); log.push("removed: " + label); return m[0]; }
function insertBefore(n, block, label, after) { const i = idx(n, after || 0, label); const s = lineStart(i); t = t.slice(0, s) + block + NL + t.slice(s); log.push("inserted: " + label); }
function replaceOnce(a, b, label) { once(a, label); t = t.replace(a, b); log.push("replaced: " + label); }
const styleEnd = function () { return t.indexOf("</style>"); }, scriptStart = function () { return t.indexOf("<script>"); };
const defsIn = function (s) { return new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(function (m) { return m[1]; }).concat([...s.matchAll(/^\s*var\s+([A-Z][A-Z0-9_]*)\s*=/gm)].map(function (m) { return m[1]; }))); };

/* ================= JS: Jo's v1 + penF blocks (inside the P2/P3 area) ================= */
const V1 = "/* =====================================================================" + NL + '   Pension Plans  (pen, kind:"pension")  ,  v1 build';
const FB = "/* =====================================================================" + NL + '   Pension Plans (MB updated)  (prefix: penF, kind:"pension-mb")';
const REM = "/* =====================================================================" + NL + '   Remittance Pledges  (prefix: rem, kind:"remittance")';
const v1 = cutLines(V1, FB, false, "v1 pension block", scriptStart());
if (v1.indexOf("function penContent(") < 0 || v1.indexOf("var PEN_APPTS=") < 0) throw new Error("v1 block shape");
/* the shared pacing-bar component (.pbar) lives inside her pension block but is used by W04 Remittance and W17 Gifts: lift it out, keep it in the shell */
const pbar = (function () {
  const L = v1.split(NL);
  let a = L.findIndex(function (l) { return /^\s*var pbarPopEl\b|^\s*function pbarHTML\(/.test(l); });
  const b = L.findIndex(function (l) { return l.indexOf('.pbar[data-pbar]') > -1; });
  if (a < 0 || b < 0 || b < a) throw new Error("pbar span not found in v1 block");
  while (a > 0 && /^\s*\/\*|^\s*\*|^\s*$/.test(L[a - 1]) && !/\*\/\s*$/.test(L[a - 1]) === false) a--; /* include an immediately preceding one-line comment */
  const span = L.slice(a, b + 1);
  ["pbarHTML", "pbarShow", "pbarHide", "pbarPopEl"].forEach(function (n) { if (span.join("\n").indexOf(n) < 0) throw new Error("pbar span misses " + n); });
  return span.join(NL);
})();
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", "  /* ===== Shell: pacing bar (.pbar) with its hover card, shared by W04 Remittance Pledges and W17 Gifts Pledges ===== */" + NL + pbar + NL, "pbar component kept in the shell");
const fb = cutLines(FB, REM, false, "penF block", scriptStart());
if (fb.indexOf("function penFContent(") < 0 || fb.indexOf("var PENF_APPTS=") < 0) throw new Error("penF block shape");
const deleted = new Set([...defsIn(v1), ...defsIn(fb)]);

/* ================= shell hooks ================= */
removeLine('if(w.kind==="pension")return penContent(w);', "v1 contentHTML");
removeLine('if(w.kind==="pension-mb")return penFContent(w);', "penF contentHTML");
/* the penO block documents its own dispatch lines in comments, so shell lines are anchored on their trailing comments */
removeLine('if(w.kind==="pension-oc")return penOContent(w); // MB variants', "penO contentHTML (shell line)");
removeLine('if(pop.type==="pen-dist")return penPopContent();', "v1 popContent");
removeLine('if(pop.type==="penF-dist")return penFPopContent();', "penF popContent");
removeLine('if(pop.type==="penO-dist")return penOPopContent(); // Pension Plans', "penO popContent (shell line)");
removeLine('if(modal.type==="pendetail"){mr.innerHTML=penDetailModalHTML();return;}', "v1 modal");
removeLine('if(modal.type==="penFdetail"){mr.innerHTML=penFDetailModalHTML();return;}', "penF modal");
removeLine('if(modal.type==="penOdetail"){mr.innerHTML=penODetailModalHTML();return;} // Pension Plans', "penO modal (shell line)");
removeLine('if(a&&a.indexOf("pen-")===0&&penHandleClick(a,id,t))return;', "v1 click hook");
removeLine('if(a&&a.indexOf("penF-")===0&&penFHandleClick(a,id,t))return;', "penF click hook");
removeLine('if(a&&a.indexOf("penO-")===0&&penOHandleClick(a,id,t))return; // Pension Plans', "penO click hook (shell line)");
/* edits confined to one shell function line */
function editLine(lineNeedle, re, label) { const i = once(lineNeedle, label + " line"); const s = lineStart(i), e = lineEnd(i); const line = t.slice(s, e); if (!re.test(line)) throw new Error("not in line: " + label); t = t.slice(0, s) + line.replace(re, "") + t.slice(e); log.push("removed in line: " + label); }
["pen-dist", "penF-dist", "penO-dist"].forEach(function (k) { editLine("function triggerSelector(){", new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "triggerSelector " + k); });
editLine("function aboutOf(w){", /if\(w\.kind==="pension"\)return \{h:w\.title,b:PEN_ABOUT\};/, "aboutOf pension");
editLine("function aboutOf(w){", /if\(w\.kind==="pension-mb"\)return \{h:w\.title,b:PENF_ABOUT\};/, "aboutOf pension-mb");
editLine("function aboutOf(w){", /if\(w\.kind==="pension-oc"\)return \{h:w\.title,b:PENO_ABOUT\};/, "aboutOf pension-oc");

/* ================= registry ================= */
(function () {
  const L = t.split(NL), keep = [], gone = [];
  L.forEach(function (l) { if (/^\s*\{id:"penF(_k|2|3)?",\s*title:"Pension Plans/.test(l) && l.indexOf('kind:"pension-mb"') > -1) gone.push(l); else keep.push(l); });
  if (gone.length !== 4) throw new Error("penF registry rows: " + gone.length); t = keep.join(NL); log.push("took 4 lines: penF registry rows");
})();
(function () {
  const s = lineStart(once('{id:"penO", title:"Pension Plans (OC)"', "penO registry row"));
  const e = lineEnd(idx("      */", s, "fixture close"));
  const rows = t.slice(s, e).split(NL).filter(Boolean);
  const fix = function (l) { return l.replace('kind:"pension-oc"', 'kind:"pension"').replace(/title:"Pension Plans \(OC[^"]*\)"/, 'title:"Pension Plans"'); };
  const live = rows.filter(function (l) { return /^\s*\{id:"penO(_k|2)?",/.test(l); }).map(fix);
  const fixtures = rows.filter(function (l) { return /^\s*\{id:"penO3",/.test(l); }).map(fix);
  if (live.length !== 3 || fixtures.length !== 1) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
  t = t.slice(0, s) + ["      /* W02 Pension Plans */"].concat(live).concat(["      /* W02 driver fixture (empty state), not rendered as a card:"]).concat(fixtures).concat(["      */"]).join(NL) + NL + t.slice(e);
  log.push("registry: 3 live W02 rows + 1 fixture, kind pension, plain titles");
})();
removeLine('    ["W02","Pension Plans","pension-mb",', "CMP_ROWS W02");
removeLine('    W02:{h:"Ours is her Pension widget', "CMPNOTE_ W02");

/* ================= the block ================= */
let blk = cutLines("/* ===== W02 Pension Plans V2 ===== */", "/* ===== W03 Payroll Distributions V2 ===== */", false, "penO JS block", scriptStart()).replace(/(\r\n)+$/, "");
blk = blk.replace(/kind:"pension-oc"/g, 'kind:"pension"').replace(/\(prefix: penO, kind:"pension-oc"\)/, '(prefix: penO, kind:"pension")').replace(/pension-oc/g, "pension")
  .replace(/title:"Pension Plans \(MB updated[^"]*\)"/g, 'title:"Pension Plans"').replace(/Pension Plans \(MB updated\)/g, "Pension Plans V2");
/* item 1: Glance caption, reworded to Jo's terms */
const capOld = "'<div class=\"gl-sub\"><span class=\"pen-caption\">contributed a year across '+np+' plan'+(np===1?\"\":\"s\")+', '+lead+'</span></div>'+";
if (blk.split(capOld).length !== 2) throw new Error("glance caption anchor");
blk = blk.replace(capOld, "'<div class=\"gl-sub\"><span class=\"pen-caption\">per year across '+np+' plan'+(np===1?\"\":\"s\")+', '+lead+'</span></div>'+");
/* item 4: 24 varied appointees */
const a0 = blk.indexOf("var PENO_APPTS=["), a1 = blk.indexOf("];", a0) + 2; if (a0 < 0) throw new Error("PENO_APPTS");
const APPTS = [
  ["Rev. Jonathan Pierce", "St. Paul UMC", 1, "Employee Before Tax-UMPIP", 12000.00],
  ["Rev. Naomi Adler", "Hope UMC", 2, "Employee Before Tax-UMPIP", 6000.00],
  ["Rev. Caleb Monroe", "Riverside UMC", 3, "Employee Before Tax-UMPIP", 6000.00],
  ["Rev. Priya Natarajan", "Aldersgate UMC", 2, "Employee Before Tax-UMPIP", 9600.00],
  ["Rev. Marcus Ellison", "Bethel UMC", 3, "Employee Before Tax-UMPIP", 4800.00],
  ["Rev. Daniel Cho", "Asbury UMC", 1, "CRSP-DB-%", 4532.56],
  ["Rev. Miriam Okafor", "Grace Fellowship UMC", 3, "CRSP-DB-%", 3000.00],
  ["Rev. Lydia Brennan", "Mount Zion UMC", 2, "CRSP-DB-%", 5210.40],
  ["Rev. Owen Gallagher", "Shiloh UMC", 1, "CRSP-DB-%", 2875.12],
  ["Rev. Isabel Moreno", "New Life UMC", 2, "CRSP-DB-%", 3960.00],
  ["Rev. Samuel Reyes", "First UMC Lakeside", 2, "CRSP-DC", 3518.66],
  ["Rev. Hannah Whitfield", "Cornerstone UMC", 3, "CRSP-DC", 3518.65],
  ["Rev. Peter Lindqvist", "Christ UMC Northgate", 1, "CRSP-DC", 4104.20],
  ["Rev. Adaeze Nwosu", "Faith Community UMC", 1, "CRSP-DC", 2760.00],
  ["Rev. Tomas Herrera", "Calvary UMC", 3, "CRSP-DC", 3300.00],
  ["Rev. Thomas Ashford", "Trinity UMC", 1, "CPP", 3341.28],
  ["Rev. Grace Bellamy", "Wesley Chapel UMC", 2, "CPP", 3341.28],
  ["Rev. Joseph Kimani", "Epworth UMC", 3, "CPP", 2980.50],
  ["Rev. Rachel Sørensen", "Good Shepherd UMC", 2, "CPP", 3612.00],
  ["Rev. Benjamin Osei", "Centenary UMC", 1, "CPP", 2455.75],
  ["Rev. Esther Vaughn", "Emmanuel UMC", 1, "Flat CRSP-DB", 3000.00],
  ["Rev. Micah Delgado", "Harmony UMC", 3, "Flat CRSP-DB", 3000.00],
  ["Rev. Charlotte Ives", "St. Andrew UMC", 2, "Flat CRSP-DB", 3000.00],
  ["Rev. Elijah Baptiste", "Living Water UMC", 3, "Flat CRSP-DB", 3000.00]
];
const pad = function (s, n) { return (s + ",").padEnd(n); };
const apptsText = "var PENO_APPTS=[" + NL + APPTS.map(function (r, i) {
  return "  {name:" + pad('"' + r[0] + '"', 26) + " org:" + pad('"' + r[1] + '"', 26) + ' dist:"District ' + r[2] + '", plan:' + pad('"' + r[3] + '"', 30) + " amt:" + r[4].toFixed(2) + "}" + (i < APPTS.length - 1 ? "," : "");
}).join(NL) + NL + "];";
blk = blk.slice(0, a0) + apptsText + blk.slice(a1);
log.push("PENO_APPTS: 24 appointees, 3 districts x 5 plans, varied amounts");

/* ================= CSS: copy the shared .pen- and .penf- rules the block uses as w02-, then delete the originals ================= */
const styleText = function () { return t.slice(t.indexOf("<style"), styleEnd()); };
let st = styleText();
const declared = new Set((st.match(/\.penf?-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); }));
const used = new Set(); (blk.match(/(?<![\w-])penf?-[a-z0-9-]+/g) || []).forEach(function (c) { if (declared.has(c)) used.add(c); });
if (used.size < 20) throw new Error("too few shared classes found: " + used.size);
const rules = []; (function () { let i = 0, media = null, depth = 0, buf = ""; while (i < st.length) { const ch = st[i]; if (ch === "{") { const pre = buf.trim(); buf = ""; if (pre.charAt(0) === "@") { media = pre; depth++; i++; continue; } const j = st.indexOf("}", i); rules.push({ sel: pre, body: st.slice(i + 1, j), media: depth ? media : null }); i = j + 1; continue; } if (ch === "}") { if (depth) { depth--; media = null; } buf = ""; i++; continue; } buf += ch; i++; } })();
const copies = [], seen = {};
rules.forEach(function (r) { const sel = r.sel.replace(/\/\*[\s\S]*?\*\//g, "").trim(); if (!sel) return; if (!(sel.match(/\.penf?-[a-z0-9-]+/g) || []).some(function (c) { return used.has(c.slice(1)); })) return; const ns = sel.replace(/\.(penf?-[a-z0-9-]+)/g, function (m, x) { return used.has(x) ? ".w02-" + x.replace(/^penf?-/, "") : m; }); const key = (r.media || "") + "|" + ns; if (seen[key]) return; seen[key] = 1; const rule = ns + "{" + r.body.trim() + "}"; copies.push(r.media ? r.media + "{" + rule + "}" : rule); });
/* w02- names: pen-x and penf-x both map to w02-x; check no collision */
const mapped = {}; [...used].forEach(function (c) { const n = "w02-" + c.replace(/^penf?-/, ""); if (mapped[n] && mapped[n] !== c) throw new Error("w02- name collision: " + c + " vs " + mapped[n]); mapped[n] = c; });
const usedList = [...used].sort();
/* delete Jo's .pen-* run and her .penf-* run */
const penRun = cutLines("  .pen-hd .dep-hd-num{align-self:center;}", "  .pen-dtotal{border-top:none;margin-top:2px;}", true, "Jo's .pen-* CSS");
const odd = penRun.split(NL).filter(function (l) { return l.trim() && !/\.pen-|^\s*\/\*|^\s*\*|^\s*@media|^\s*\}/.test(l); });
if (odd.length) throw new Error("pen CSS cut touched a non-pen line: " + odd[0]);
const penfRun = cutLines("  .penf-explore-chart{display:flex;flex-direction:column;min-height:0;}", "  .penf-gleg:hover{background:transparent;}", true, "Jo's .penf-* CSS", 0);
/* the O region: new banner, drop its dup Jo banner + its .penf- copies, add the w02- copies, the modal layout, the end banner */
const c0 = once("/* ===== W02 Pension Plans V2 ===== */", "W02 CSS banner"); if (c0 > styleEnd()) throw new Error("W02 CSS banner not in style");
const c1 = idx("/* ===== W03 Payroll Distributions V2 ===== */", c0, "W03 CSS banner"); if (c1 > styleEnd()) throw new Error("W03 CSS banner not in style");
const region = t.slice(c0, lineStart(c1));
const regionLeft = region.split(NL).filter(function (l) { return !/^\s*\.penf-/.test(l) && !/Pension Plans \(MB updated\)|Everything else reuses Jo|\.bank-pill \/ \.wt-\*/.test(l) && l.indexOf("/* ===== W02 Pension Plans V2 ===== */") < 0; }).filter(function (l) { return l.trim(); });
if (regionLeft.length) throw new Error("unexpected lines in the W02 CSS region: " + regionLeft[0]);
const newCss = ["/* ===== W02 Pension Plans V2 CSS ===== */",
  "  /* Stand-alone copies of the .pen-* / .penf-* rules this widget uses (w02- prefix). Classes: " + usedList.join(" ") + " */"]
  .concat(copies.map(function (c) { return "  " + c; }))
  .concat(["  /* Appointees drill modal: the shell's .modal-wide body is a flex row; the table takes the width, the summary is a narrow side column */",
    "  .modal.modal-wide.w02-detail-modal .modal-b{display:flex;gap:18px;align-items:flex-start;padding:0 18px 6px;}",
    "  .w02-detail-scroll{flex:1 1 auto;min-width:0;}",
    "  .w02-dtotal{flex:0 0 auto;min-width:150px;max-width:220px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;border-top:none;margin-top:2px;padding:8px 0 0 6px;}",
    "/* ===== end W02 Pension Plans V2 CSS ===== */"]).join(NL) + NL;
t = t.slice(0, c0) + newCss + t.slice(lineStart(c1)); log.push("W02 CSS region rebuilt: " + copies.length + " w02- rules + modal layout");
/* repoint the block's markup */
const renameRe = new RegExp("(?<![\\w-])(" + usedList.map(function (c) { return c.replace(/-/g, "\\-"); }).join("|") + ")(?![\\w-])", "g");
blk = blk.replace(renameRe, function (m) { return "w02-" + m.replace(/^penf?-/, ""); });
const leftover = (blk.match(/(?<![\w-])penf?-[a-z0-9-]+/g) || []).filter(function (c) { return c !== "pen-" && !/^peno?-\$/.test(c); });
if (leftover.length) log.push("NOTE unstyled pen-* tokens left in block: " + [...new Set(leftover)].join(" "));

/* ================= register + place ================= */
const register = '  WIDGETS.register("pension",{content:penOContent,about:function(w){return {h:w.title,b:PENO_ABOUT};},' +
  'click:function(a,id,t){return !!(a&&a.indexOf("penO-")===0&&penOHandleClick(a,id,t));},' +
  'pops:{"penO-dist":{content:penOPopContent,trigger:function(){return \'[data-action="penO-dist"][data-id="\'+pop.id+\'"]\';}}},' +
  'modals:{penOdetail:penODetailModalHTML}});';
const finalBlock = blk + NL + register + NL + "/* ===== end W02 Pension Plans V2 ===== */" + NL + NL;
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", finalBlock, "W02 block before the registry (after W01)");

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
/* a deleted name is a problem only if it is no longer defined anywhere AND some non-comment code line uses it (not as a property key) */
const codeLines = t.split(NL).filter(function (l) { return l.trim() && !/^\s*(\/\*|\*|\/\/)/.test(l); });
const refs = [...deleted].filter(function (n) {
  if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false;
  const re = new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])");
  return codeLines.some(function (l) { return re.test(l.replace(/\/\*[\s\S]*?\*\//g, "")); });
});
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
['kind:"pension-mb"', 'kind:"pension-oc"', "pension-mb", "pension-oc", "penFContent", "penContent(", "PEN_APPTS", "PENF_"].forEach(function (n) { if (t.indexOf(n) > -1) throw new Error("leftover: " + n); });
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
