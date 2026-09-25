/* One-off, 2026-09-25: build W01 Budget Compared to Actual (owner decision:
   keep our version at every size, drop Jo's; docs/decisions/W01.md).
     - delete Jo's budget-mb (bgtF) CSS + JS and her retired v1 budget JS
     - keep her original .bgt-* CSS: it is shell-wide (hover cards, spinners,
       captions used by W02 W04 W05 W13 W15 W16); label it as such
     - our bgtO block becomes the W01 block: data constants, hover card,
       popovers, handlers, about text and WIDGETS.register("budget", ...)
     - registry: kind budget-oc -> budget; titles lose "(OC" and size words;
       Glance / Explore / Detail rows live; state variants stay as fixtures
     - cmp tab loses its W01 row and note
   Marker-anchored; aborts before writing if any anchor is missing/ambiguous. */
"use strict";
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
const NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];
const idx = function (n, from, label) { const i = t.indexOf(n, from || 0); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 70))); return i; };
const once = function (n, label) { const i = idx(n, 0, label); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 70))); return i; };
const lineStart = function (i) { return t.lastIndexOf(NL, i - 1) + NL.length; };
const lineEnd = function (i) { return t.indexOf(NL, i) + NL.length; };
/* cut whole lines: from the line containing `from` (first occurrence at/after `after`) to the line containing `to` (inclusive if incl) */
function cutLines(from, to, incl, label, after) {
  const i = idx(from, after || 0, label + " start"); const j = idx(to, i + from.length, label + " end");
  const s = lineStart(i), e = incl ? lineEnd(j) : lineStart(j);
  const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e);
  log.push("cut " + cut.split(NL).length + " lines: " + label); return cut;
}
function removeLine(n, label) { const i = once(n, label); const s = lineStart(i), e = lineEnd(i); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
function removeSub(re, label) { const m = t.match(re); if (!m) throw new Error("substring missing: " + label); if (t.match(new RegExp(re.source, "g")).length !== 1) throw new Error("substring ambiguous: " + label); t = t.replace(re, ""); log.push("removed: " + label); return m[0]; }
function takeLines(re, min, label) { const L = t.split(NL), out = [], keep = []; L.forEach(function (l) { if (re.test(l)) out.push(l); else keep.push(l); }); if (out.length < min) throw new Error(label + ": expected >= " + min + ", got " + out.length); t = keep.join(NL); log.push("took " + out.length + " lines: " + label); return out; }
function insertBefore(n, block, label, after) { const i = idx(n, after || 0, label); const s = lineStart(i); t = t.slice(0, s) + block + NL + t.slice(s); log.push("inserted: " + label); }
function replaceOnce(a, b, label) { once(a, label); t = t.replace(a, b); log.push("replaced: " + label); }
const styleEnd = function () { return t.indexOf("</style>"); };
const scriptStart = function () { return t.indexOf("<script>"); };
const toHandler = function (lines) { return lines.map(function (l) { return l.replace(/return;\}\s*(\/\/.*|\/\*.*\*\/)?\s*$/, "return true;}"); }); };

/* ================= CSS ================= */
insertBefore("  .bgt-caption{color:var(--txt-subtle);font-weight:400;font-size:11px;}",
  "/* ===== Shell: shared primitives that began life in the budget widget (.bgt-caption, .bgt-pop*, .bgt-spin, .bgt-skel-cap, .bgt-legend*, .bgt-sw*, .bgt-notrend*, .bgt-varcol, .bgt-tbar, .bgt-tscroll, .bgt-special-*, .bgt-rm-*, .bgt-dd-*). Used by W01 and by the hover cards, captions and spinners of W02 W04 W05 W13 W15 W16. ===== */",
  "shell label on the shared .bgt-* CSS");
const bgtFcss = cutLines("  /* ===== Budget Compared to Actual (MB updated): ONLY the new visuals", "  /* ===== Pension Plans (MB updated)", false, "bgtF CSS");
if (bgtFcss.split(NL).filter(function (l) { return l.trim() && !/^\s*\.bgtF-|^\s*\/\* =====/.test(l); }).length) throw new Error("bgtF CSS cut touched a non-bgtF line");
replaceOnce("/* ===== W01 Budget Compared to Actual V2 ===== */" + NL + "  /* ===== Budget Compared to Actual (MB updated): ONLY the new visuals",
  "/* ===== W01 Budget Compared to Actual V2 CSS ===== */" + NL + "  /* only the visuals this widget adds; layout, hover card, modal and spinner classes are the shared .bgt-* shell primitives above", "W01 CSS banner + dup line");
(function () { const i = idx("/* ===== W02 Pension Plans V2 ===== */", 0, "W02 CSS banner"); if (i > styleEnd()) throw new Error("W02 CSS banner not in style"); t = t.slice(0, lineStart(i)) + "/* ===== end W01 Budget Compared to Actual V2 CSS ===== */" + NL + t.slice(lineStart(i)); log.push("inserted: W01 CSS end banner"); })();

/* ================= constants to keep ================= */
const curPeriod = t.slice(lineStart(once("  var BGT_CUR_PERIOD=")), lineEnd(idx("  var BGT_CUR_PERIOD="))).replace(/\r\n$/, "");
const repStart = once("  var BGT_REPORTS=[");
const repEndIdx = (function () { const m = /\r\n\s*\];\r\n/.exec(t.slice(repStart)); if (!m) throw new Error("BGT_REPORTS end"); return repStart + m.index + m[0].length; })();
const reports = t.slice(lineStart(repStart), repEndIdx).replace(/\r\n$/, "");
if (!/^\s*var BGT_ALL_FYS=\["2024","2025","2026"\],BGT_CUR_FY="2026";/m.test(t)) throw new Error("BGT_CUR_FY line shape");

/* ================= JS: Jo's v1 + bgtF ================= */
const v1a = cutLines("  /* ---- Budget Compared to Actual ----", "  function bgtThru(rows){return rows.filter(function(r){return r.actual!=null;});}", true, "v1 budget data + helpers", scriptStart());
if (v1a.indexOf("var BGT_REPORTS=[") < 0 || v1a.indexOf("var BGT_CUR_PERIOD=") < 0) throw new Error("v1a did not contain the constants");
const v1b = cutLines("  /* ---- Budget Compared to Actual ----", "  /* ============================================================================" + NL + "     Budget Compared to Actual (MB updated) : kind \"budget-mb\", prefix bgtF.", false, "v1 budget render (budgetContent .. bgtPanel)", scriptStart());
if (v1b.indexOf("function budgetContent(") < 0 || v1b.indexOf("function bgtPanel(") < 0 || v1b.indexOf("BGT_CUR_FY=") < 0) throw new Error("v1b shape");
const fjs = cutLines("  /* ============================================================================" + NL + "     Budget Compared to Actual (MB updated) : kind \"budget-mb\", prefix bgtF.", "  function bgtFReportModalHTML(){", true, "bgtF JS block", scriptStart());
if (!/^\s*\/\* Sign-ups:/.test(t.slice(lineStart(idx("  var SIGNUPS=[")) - 200, lineStart(idx("  var SIGNUPS=["))).split(NL).slice(-2)[0])) throw new Error("F cut did not end right before the Sign-ups comment");
/* v1 hover + listener */
cutLines("  var bpopEl=null;", '.bgt-col2[data-bpop]");if(!col){if(bpopEl)bgtHideBpop();return;}', true, "v1 bar-hover card + listener");
/* F hover + listener -> ours */
let hover = cutLines("  /* Budget Compared to Actual (MB updated) hover:", '.bgtO-lcol[data-bgtfpop]");if(!col){if(bgtFBpopEl)bgtFHideBpop();return;}', true, "bgtF hover card + shared listener");
hover = hover.replace(/^.*?\r\n/, "  /* Bar and line hover card: reads the data-bgtfpop payload each column carries (period|budget|actual|variance|mode|partial) */" + NL)
  .replace(/bgtFBpopEl/g, "bgtOBpopEl").replace(/bgtFHideBpop/g, "bgtOHideBpop").replace(/bgtFShowBpop/g, "bgtOShowBpop")
  .replace('".bgt-col2[data-bgtfpop],.bgtF-lcol[data-bgtfpop],.bgtO-lcol[data-bgtfpop]"', '".bgt-col2[data-bgtfpop],.bgtO-lcol[data-bgtfpop]"').replace(/\r\n$/, "");
if (hover.indexOf("bgtF") > -1) throw new Error("bgtF left in hover: " + hover.match(/.{20}bgtF.{20}/)[0]);

/* ================= popContent ================= */
cutLines("    /* Account scope: three plain rows.", '    if(pop.type==="bgt-span"){', true, "v1 scope/span popovers");
cutLines('    if(pop.type==="bgtF-scope"){', '    if(pop.type==="bgtF-span"){', true, "bgtF scope/span popovers");
let popO = cutLines('    if(pop.type==="bgtO-scope"){', '    if(pop.type==="bgtO-span"){', true, "bgtO scope/span popovers").replace(/\r\n$/, "");
if (!/\}\s*$/.test(popO)) throw new Error("popO shape");
const popFn = "  /* Popovers: account scope (Income / Expense / Special report) and the time-span picker */" + NL + "  function bgtOPopContent(){" + NL + popO + NL + '    return "";' + NL + "  }";

/* ================= triggerSelector ================= */
["bgt-scope", "bgt-span", "bgtF-scope", "bgtF-span", "bgtO-scope", "bgtO-span"].forEach(function (k) {
  removeSub(new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "triggerSelector " + k);
});

/* ================= renderModal ================= */
removeLine('if(modal.type==="bgtreport"){', "v1 report modal dispatch");
removeLine('if(modal.type==="bgtF-report"){', "bgtF report modal dispatch");
removeLine('if(modal.type==="bgtO-report"){', "bgtO report modal dispatch (registered instead)");

/* ================= click handlers ================= */
const addBudget = toHandler([removeLine('    if(a==="add-budget"){', "add-budget click").replace(/\r\n$/, "")]);
takeLines(/^\s*if\(a==="(set-)?bgt-/, 16, "v1 budget click branches");
removeLine("/* ---- Budget Compared to Actual (MB updated): namespaced handlers", "bgtF handlers comment");
takeLines(/^\s*if\(a==="(set-)?bgtF-/, 17, "bgtF click branches");
const clickO = toHandler(takeLines(/^\s*if\(a==="(set-)?bgtO-/, 17, "bgtO click branches"));
const clickFn = ["  /* Click actions: bgtO-sort, bgtO-scope, set-bgtO-scope, bgtO-open-report, bgtO-rm-*, bgtO-span, set-bgtO-span, set-bgtO-interval, set-bgtO-shape, set-bgtO-pinterval, set-bgtO-pshape, set-bgtO-detail, add-budget */", "  function bgtOHandleClick(a,id,t){"].concat(clickO).concat(addBudget).concat(["    return false;", "  }"]).join(NL);

/* ================= contentHTML + aboutOf ================= */
removeLine('if(w.kind==="budget")return budgetContent(w);', "v1 contentHTML");
removeLine('if(w.kind==="budget-mb")return bgtFContent(w);', "bgtF contentHTML");
removeLine('if(w.kind==="budget-oc")return bgtOContent(w);', "bgtO contentHTML");
removeSub(/if\(w\.kind==="budget"\)return \{h:w\.title,b:"[^"]*"\};/, "aboutOf budget v1");
removeSub(/if\(w\.kind==="budget-mb"\)return \{h:w\.title,b:"[^"]*"\};/, "aboutOf budget-mb");
const aboutO = removeSub(/if\(w\.kind==="budget-oc"\)return \{h:w\.title,b:"[^"]*"\};/, "aboutOf budget-oc");
const aboutFn = "  /* Info-popover text */" + NL + "  function bgtOAbout(w){" + aboutO.replace(/^if\(w\.kind==="budget-oc"\)/, "") + "}";

/* ================= registry ================= */
takeLines(/^\s*\{id:"bgtF(_k|2|3|4)?",title:"Budget Compared to Actual/, 5, "bgtF registry rows");
(function () {
  const s = lineStart(once('      {id:"bgtO",title:"Budget Compared to Actual (OC)"', "bgtO registry row"));
  const e = lineEnd(idx("      */", s, "fixture close"));
  const rows = t.slice(s, e).split(NL).filter(Boolean);
  const fix = function (l) { return l.replace('kind:"budget-oc"', 'kind:"budget"').replace(/title:"Budget Compared to Actual \(OC[^"]*\)"/, 'title:"Budget Compared to Actual"'); };
  const live = rows.filter(function (l) { return /^\s*\{id:"bgtO(_k|2)?",/.test(l); }).map(fix);
  const fixtures = rows.filter(function (l) { return /^\s*\{id:"bgtO(3|4)",/.test(l); }).map(fix);
  if (live.length !== 3 || fixtures.length !== 2) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
  const block = ["      /* W01 Budget Compared to Actual */"].concat(live).concat(["      /* W01 driver fixtures (state variants), not rendered as cards:"]).concat(fixtures).concat(["      */"]).join(NL) + NL;
  t = t.slice(0, s) + block + t.slice(e); log.push("registry: 3 live W01 rows + 2 fixtures, kind budget, plain titles");
})();
removeLine('    ["W01","Budget Compared to Actual","budget-mb",', "CMP_ROWS W01");
removeLine('    W01:{h:"Ours is her Budget widget', "CMPNOTE_ W01");

/* ================= the W01 block ================= */
let blk = cutLines("/* ===== W01 Budget Compared to Actual V2 ===== */", "/* ===== W02 Pension Plans V2 ===== */", false, "bgtO JS block", scriptStart()).replace(/(\r\n)+$/, "");
blk = blk.replace('kind "budget-oc", prefix bgtO.', 'kind "budget", prefix bgtO.');
if (blk.indexOf("budget-oc") > -1 || blk.indexOf("(OC") > -1) throw new Error("OC wording left in block");
const constants = ["  /* Data: fiscal calendar, current period, and the special-report catalogue (shared with the report picker) */", '  var BGT_CUR_FY="2026";', curPeriod, reports].join(NL);
const register = '  WIDGETS.register("budget",{content:bgtOContent,about:bgtOAbout,click:bgtOHandleClick,' +
  'pops:{"bgtO-scope":{content:bgtOPopContent,trigger:function(){return \'[data-action="bgtO-scope"][data-id="\'+pop.id+\'"]\';}},' +
  '"bgtO-span":{content:bgtOPopContent,trigger:function(){return \'[data-action="bgtO-span"][data-id="\'+pop.id+\'"]\';}}},' +
  'modals:{"bgtO-report":bgtOReportModalHTML}});';
const bannerLines = blk.slice(0, blk.indexOf("*/") + 2); let body = blk.slice(blk.indexOf("*/") + 2).replace(/^\r\n/, "");

/* ================= stand-alone CSS: copy the shared .bgt-* rules this block uses, under a w01- prefix =================
   Owner ruling 2026-09-25: do not delete shared shell CSS; copy + rename per widget so each block stands alone,
   and remove the shared originals at the end when nothing uses them any more. */
let pieces = { body: body, hover: hover, popFn: popFn, clickFn: clickFn, aboutFn: aboutFn };
const styleText = t.slice(t.indexOf("<style"), styleEnd());
const declared = new Set((styleText.match(/\.bgt-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); }));
const used = new Set();
Object.keys(pieces).forEach(function (k) { (pieces[k].match(/(?<![\w-])bgt-[a-z0-9-]+/g) || []).forEach(function (c) { if (declared.has(c)) used.add(c); }); });
if (!used.size) throw new Error("no shared .bgt-* classes found in the block (unexpected)");
/* parse the stylesheet into rules, remembering the @media prelude each rule sits in */
const rules = []; (function () {
  let i = 0, media = null, depth = 0, buf = "";
  while (i < styleText.length) {
    const ch = styleText[i];
    if (ch === "{") { const pre = buf.trim(); buf = "";
      if (pre.charAt(0) === "@") { media = pre; depth++; i++; continue; }
      const j = styleText.indexOf("}", i); rules.push({ sel: pre, body: styleText.slice(i + 1, j), media: depth ? media : null }); i = j + 1; continue; }
    if (ch === "}") { if (depth) { depth--; media = null; } buf = ""; i++; continue; }
    buf += ch; i++;
  }
})();
const copies = [], seen = {};
rules.forEach(function (r) {
  const sel = r.sel.replace(/\/\*[\s\S]*?\*\//g, "").trim(); if (!sel) return;
  const classesInSel = (sel.match(/\.bgt-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); });
  if (!classesInSel.some(function (c) { return used.has(c); })) return;
  const newSel = sel.replace(/\.bgt-([a-z0-9-]+)/g, function (m, x) { return used.has("bgt-" + x) ? ".w01-" + x : m; });
  const key = (r.media || "") + "|" + newSel; if (seen[key]) return; seen[key] = 1;
  const rule = newSel + "{" + r.body.trim() + "}";
  copies.push(r.media ? r.media + "{" + rule + "}" : rule);
});
const usedList = [...used].sort();
const cssCopies = ["  /* Stand-alone copies of the shared .bgt-* shell rules this widget uses (w01- prefix). Shared originals stay for the other widgets. Classes: " + usedList.join(" ") + " */"]
  .concat(copies.map(function (c) { return "  " + c; })).join(NL);
/* point the block's markup at the copies */
const renameRe = new RegExp("(?<![\\w-])bgt-(" + usedList.map(function (c) { return c.slice(4); }).join("|") + ")(?![\\w-])", "g");
Object.keys(pieces).forEach(function (k) { pieces[k] = pieces[k].replace(renameRe, "w01-$1"); });
log.push("stand-alone CSS: " + used.size + " shared classes copied as " + copies.length + " w01- rules; block markup repointed");
insertBefore("  /* only the visuals this widget adds; layout, hover card, modal and spinner classes are the shared .bgt-* shell primitives above", cssCopies, "w01- CSS copies into the W01 CSS region");
replaceOnce("  /* only the visuals this widget adds; layout, hover card, modal and spinner classes are the shared .bgt-* shell primitives above", "  /* the visuals this widget adds on top of the copies above */", "W01 CSS note");

const finalBlock = [bannerLines, constants, pieces.body, pieces.hover, pieces.popFn, pieces.clickFn, pieces.aboutFn, register, "/* ===== end W01 Budget Compared to Actual V2 ===== */"].join(NL) + NL + NL;
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", finalBlock, "W01 block before the registry");

/* ================= labels ================= */
insertBefore("  function bgtLockBg(on){", "  /* Shell: freezes page scroll while any modal is open (used by renderModal; the name is historical) */", "bgtLockBg label");

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
["budgetContent(", "bgtFContent(", "bgtFLoad(", "bgtFShowBpop", "bgtShowBpop", 'kind:"budget-mb"', 'kind:"budget-oc"', "budget-mb", "budget-oc"].forEach(function (n) { if (t.indexOf(n) > -1) throw new Error("leftover: " + n + " @" + t.slice(0, t.indexOf(n)).split(NL).length); });
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); });
console.log("done: " + t.split(NL).length + " lines");
