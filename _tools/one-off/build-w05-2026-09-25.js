/* One-off, 2026-09-25: build W05 Receivable Invoices Outstanding (owner: ours 1:1, docs/decisions/W05.md).
   Delete Jo's receivables-mb (arF) block and her retired v1 "ar" block (no registry row uses kind "ar"),
   their hooks, rows and CSS; keep the six .ar- bar-primitive classes that W04 and W17 markup still uses
   as a labelled shell block; register ours as kind "receivables"; fix the drill-modal header (D12).
   Anchored; aborts before writing on any miss. */
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
const blockBounds = function () { const b0 = t.indexOf("/* ===== W05 Receivable Invoices Outstanding V2 ===== */", t.indexOf("<script>")); return [b0, t.indexOf("/* ===== W06 Insurance Billing Plans V2 ===== */", b0 + 10)]; };
function removeLineOutside(n, label) { const [b0, b1] = blockBounds(); let i = t.indexOf(n), hit = -1; while (i > -1) { if (i < b0 || i > b1) { if (hit > -1) throw new Error("ambiguous outside block: " + label); hit = i; } i = t.indexOf(n, i + 1); } if (hit < 0) throw new Error("anchor missing outside block: " + label); const s = lineStart(hit), e = lineEnd(hit); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
function insertBefore(n, block, label) { const i = once(n, label); const s = lineStart(i); t = t.slice(0, s) + block + NL + t.slice(s); log.push("inserted: " + label); }
const styleEnd = function () { return t.indexOf("</style>"); }, scriptStart = function () { return t.indexOf("<script>"); };
const defsIn = function (s) { return new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(function (m) { return m[1]; }).concat([...s.matchAll(/^\s*var\s+([A-Z][A-Z0-9_]*)\s*=/gm)].map(function (m) { return m[1]; }))); };

/* ================= JS: Jo's arF block, then her v1 ar block ================= */
const v1S = lineStart(idx("  /* ===== Receivable Invoices Outstanding (prefix: ar) , v2 redesign =====", scriptStart(), "v1 ar header"));
const jS = lineStart(idx('/* ===== Receivable Invoices Outstanding (MB updated) , W05, ADDITIVE (prefix: arF, kind:"receivables-mb") =====', scriptStart(), "arF header"));
const pS = lineStart(idx("  /* ===== Payroll Scheduled Time Off (pto) ===== */", scriptStart(), "pto header"));
if (!(v1S < jS && jS < pS)) throw new Error("block order");
let jE = pS; while (t.slice(jE - NL.length * 2, jE) === NL + NL) jE -= NL.length;
const jBlk = cutSpan(jS, jE, "arF block"); if (jBlk.indexOf("function arFContent(") < 0 || jBlk.indexOf('e.target.id!=="arFwlq"') < 0) throw new Error("arF shape");
const v1 = cutSpan(v1S, jS, "v1 ar block"); if (v1.indexOf("function arContent(") < 0 || v1.indexOf("var AR_INV=") < 0 || v1.indexOf("function arShowPop(") < 0) throw new Error("v1 shape");
const deleted = new Set([...defsIn(v1), ...defsIn(jBlk)]);

/* ================= shell hooks ================= */
removeLine('if(w.kind==="ar")return arContent(w);', "v1 contentHTML");
removeLine('if(w.kind==="receivables-mb")return arFContent(w);', "arF contentHTML");
removeLineOutside('if(w.kind==="receivables-oc")return arOContent(w);', "arO contentHTML");
removeLine('if(pop.type==="arF-rc"||pop.type==="arF-source")return arFPopContent();', "arF popContent");
removeLineOutside('if(pop.type==="arO-rc"||pop.type==="arO-source")return arOPopContent();', "arO popContent");
removeLine('if(pop.type==="ar-rc"||pop.type==="ar-source")return arPopContent();', "v1 popContent");
["arO-rc", "arO-source", "arF-rc", "arF-source", "ar-rc", "ar-source"].forEach(function (k) { editLine("function triggerSelector(){", new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "", "triggerSelector " + k); });
removeLine('if(modal.type==="artdetail"){mr.innerHTML=arDetailModalHTML();return;}', "v1 detail modal");
removeLine('if(modal.type==="arFdetail"){var _am=mr.querySelector(".arF-detail-modal");', "arF detail modal");
removeLineOutside('if(modal.type==="arOdetail"){mr.innerHTML=arODetailModalHTML();return;}', "arO detail modal");
removeLine('if(a&&a.indexOf("arF-")===0&&arFHandleClick(a,id,t))return;', "arF click hook");
removeLineOutside('if(a&&a.indexOf("arO-")===0&&arOHandleClick(a,id,t))return;', "arO click hook");
removeLine('if(a&&a.indexOf("ar-")===0&&arHandleClick(a,id,t))return;', "v1 click hook");
editLine("function aboutOf(w){", /if\(w\.kind==="receivables-mb"\)return \{h:w\.title,b:"[^"]*"\};/, "", "aboutOf receivables-mb");
let aboutText = "";
editLine("function aboutOf(w){", /if\(w\.kind==="receivables-oc"\)return \{h:w\.title,b:"([^"]*)"\};/, function (m, b) { aboutText = b; return ""; }, "aboutOf receivables-oc");
if (aboutText.length < 40) throw new Error("about text not captured");

/* ================= registry ================= */
takeLines(/^\s*\{id:"arF(_k|2|3|4|5)?",\s*title:"Receivable Invoices Outstanding[^"]*",\s*kind:"receivables-mb"/, 6, "arF registry rows");
removeLine("/* Receivable Invoices Outstanding: our finalized W05, additive.", "arF registry label comment");
(function () {
  const s = lineStart(once('{id:"arO", title:"Receivable Invoices Outstanding (OC)"', "arO registry row"));
  const e = lineEnd(idx("      */", s, "fixture close"));
  const rows = t.slice(s, e).split(NL).filter(Boolean);
  const fix = function (l) { return l.replace('kind:"receivables-oc"', 'kind:"receivables"').replace(/title:"Receivable Invoices Outstanding \(OC[^"]*\)"/, 'title:"Receivable Invoices Outstanding"'); };
  const live = rows.filter(function (l) { return /^\s*\{id:"arO(_k|2)?",\s*title/.test(l); }).map(fix);
  const fixtures = rows.filter(function (l) { return /^\s*\{id:"arO[345]",\s*title/.test(l); }).map(fix);
  if (live.length !== 3 || fixtures.length !== 3) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
  t = t.slice(0, s) + ["      /* W05 Receivable Invoices Outstanding */"].concat(live).concat(["      /* W05 driver fixtures (state variants), not rendered as cards:"]).concat(fixtures).concat(["      */"]).join(NL) + NL + t.slice(e);
  log.push("registry: 3 live W05 rows + 3 fixtures, kind receivables, plain titles");
})();
removeLine('    ["W05","Receivable Invoices Outstanding","receivables-mb",', "CMP_ROWS W05");
removeLine('    W05:{h:"Ours is her AR widget corrected and extended by three owner rounds.",', "CMPNOTE_ W05");

/* ================= the block ================= */
const B0 = "/* ===== W05 Receivable Invoices Outstanding V2 ===== */", W06 = "/* ===== W06 Insurance Billing Plans V2 ===== */";
let b0 = idx(B0, scriptStart(), "W05 JS banner"), b1 = idx(W06, b0, "W06 JS banner");
let blk = cutSpan(b0, b1, "arO JS block").replace(/(\r\n)+$/, "");
blk = blk.split(NL).filter(function (l) { return !/^\/\* ===== W05 Receivable Invoices Outstanding V2 JS \(prefix/.test(l); }).join(NL);
blk = blk.replace(/kind:"receivables-oc"/g, 'kind:"receivables"').replace(/receivables-oc/g, "receivables").replace(/Receivable Invoices Outstanding \(OC[^"']*\)/g, "Receivable Invoices Outstanding");
/* wiring how-to lines inside comments (D10) */
blk = blk.split(NL).filter(function (l) { return !(/^\s{3,}[A-Za-z][A-Za-z ()\/-]*[.:]{1,}\s*\.{2,}\s*if\(/.test(l) || /^\s{3,}[A-Za-z()]+:\s+if\(/.test(l) || /^\s{3,}[A-Za-z][A-Za-z ()]*\.{3,}\s*if\(/.test(l)); }).join(NL);
/* D12: the drill-modal header cells carry their body cells' classes */
const h0 = '<div class="wt-row wt-head arO-dhead"><span class="arO-check-sp" aria-hidden="true"></span><span class="arO-dexp"></span>\'+cols.map(function(c,i){return \'<span class="arO-dc arO-dc\'+i+\'">\'+c+\'</span>\';}).join("")+\'</div>\';';
if (blk.split(h0).length !== 2) throw new Error("drill header anchor");
blk = blk.replace(h0, '<div class="wt-row wt-head arO-dhead"><span class="arO-check" aria-hidden="true"></span><span class="arO-dexp"></span>\'+cols.map(function(c,i){return \'<span class="arO-dc arO-dc\'+i+(i===5?" arO-dc-amt":"")+\'">\'+c+\'</span>\';}).join("")+\'</div>\';');
log.push("D12: drill-modal header cells now match the body (check column + amount class)");
/* info text lives in the block */
blk = blk.replace(B0 + NL, B0 + NL + 'var ARO_ABOUT="' + aboutText + '";' + NL);
const register = '  WIDGETS.register("receivables",{content:arOContent,about:function(w){return {h:w.title,b:ARO_ABOUT};},' +
  'click:function(a,id,t){return !!(a&&a.indexOf("arO-")===0&&arOHandleClick(a,id,t));},' +
  'pops:{"arO-rc":{content:arOPopContent,trigger:function(){return \'[data-action="arO-rc"][data-id="\'+pop.id+\'"]\';}},"arO-source":{content:arOPopContent,trigger:function(){return \'[data-action="arO-source"][data-id="\'+pop.id+\'"]\';}}},' +
  "modals:{arOdetail:arODetailModalHTML}});";
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + "/* ===== end W05 Receivable Invoices Outstanding V2 ===== */" + NL, "W05 block before the registry");

/* ================= CSS ================= */
function cutCssBlock(headerNeedle, prefixRe, label) {
  const h = idx(headerNeedle, 0, label + " header"); if (h > styleEnd()) throw new Error(label + " header not in style");
  let s = lineStart(t.lastIndexOf("/* =====", h)); let e = s; const L = t.slice(s, styleEnd()).split(NL); let k = 0, inHead = true, inC = false;
  while (k < L.length) { const l = L[k];
    const ok = inHead || inC ? true : (l.trim() === "" || /^\s*\/\*/.test(l) || /^\s*\*/.test(l) || prefixRe.test(l) || /^\s*@media/.test(l) || /^\s*\}/.test(l) || (/^\s+[a-z-]+:/.test(l) && !/\{/.test(l)));
    if (!ok) break;
    if (inHead && /\*\/\s*$/.test(l)) inHead = false;
    if (!inHead) { if (/\/\*/.test(l) && !/\*\//.test(l)) inC = true; else if (inC && /\*\//.test(l)) inC = false; }
    e += l.length + NL.length; k++; }
  while (t.slice(e - NL.length * 2, e) === NL + NL) e -= NL.length;
  const cut = cutSpan(s, e, label); const rulesIn = cut.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*@media|^\s*\/\*/.test(l); }); const odd = rulesIn.filter(function (l) { return !prefixRe.test(l); }); if (odd.length) throw new Error(label + ": non-prefixed rules inside: " + odd[0].trim().slice(0, 80)); return cut;
}
cutCssBlock("Receivable Invoices Outstanding (MB updated) v W05 (prefix: arF, kind receivables-mb) , CSS", /\.ar[fF]-/, "Jo's .arF- CSS");
const v1css = cutCssBlock("Receivable Invoices Outstanding v2 (prefix: ar) , CSS", /\.ar-/, "Jo's v1 .ar- CSS");
/* the bar primitives W04 and W17 markup still carries stay, as a labelled shell block */
const KEEP = ["ar-bars", "ar-barrow", "ar-clickable", "ar-barlbl", "ar-barlbl-nm", "ar-barlbl-sub", "ar-bartrack", "ar-barfill"];
const keepRules = v1css.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*\/\*|^\s*@media/.test(l) && (l.match(/\.ar-[a-z0-9-]+/g) || []).every(function (c) { return KEEP.indexOf(c.slice(1)) > -1; }); });
if (keepRules.length < 12) throw new Error("shared .ar- rules: " + keepRules.length);
const shared = ["/* ===== Shell: AR-derived bar primitives (.ar-bars .ar-barrow .ar-clickable .ar-barlbl .ar-barlbl-nm .ar-barlbl-sub .ar-bartrack .ar-barfill). Used by W04 Remittance Pledges and W17 Gifts markup. Remove when nothing uses them. ===== */"].concat(keepRules.map(function (l) { return l.replace(/^\s+/, ""); }));
insertBefore("/* ===== Shell: remittance-derived shared primitives", shared.join(NL) + NL, "shared .ar- bar primitives");
/* our region: banners, D12 rule, dead rule */
const c0 = idx(B0, 0, "W05 CSS banner"); if (c0 > styleEnd()) throw new Error("W05 CSS banner not in style");
const c1 = idx(W06, c0, "W06 CSS banner");
let css = t.slice(c0, c1).replace(/(\r\n)+$/, "").split(NL);
if (!/^\/\* ===== W05 Receivable Invoices Outstanding V2 CSS \(prefix/.test(css[1])) throw new Error("CSS sub-banner");
css = [ "/* ===== W05 Receivable Invoices Outstanding V2 CSS ===== */" ].concat(css.slice(2));
const sp = css.findIndex(function (l) { return /^\s*\.arO-check-sp\{/.test(l); }); if (sp < 0) throw new Error(".arO-check-sp rule");
css.splice(sp, 1, "  .arO-dhead .arO-check{visibility:hidden;border:0;background:transparent;}");
css.push("/* ===== end W05 Receivable Invoices Outstanding V2 CSS ===== */");
t = t.slice(0, c0) + css.join(NL) + NL + NL + t.slice(c1); log.push("W05 CSS region: banners, D12 header rule, .arO-check-sp dropped");

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
['kind:"receivables-mb"', 'kind:"receivables-oc"', "receivables-mb", "receivables-oc", "arFContent", "arContent(", "ARF_", "arFwlq", "artdetail", "arFdetail", ".arF-", "arO-check-sp", 'kind:"ar"'].forEach(function (n) { const i = codeOnly.indexOf(n); if (i > -1) throw new Error("leftover in code: " + n + "  -> " + codeOnly.slice(codeOnly.lastIndexOf("\n", i) + 1, i + 80)); });
const stNow = t.slice(t.indexOf("<style"), styleEnd()); const arLeft = [...new Set(stNow.match(/\.ar-[a-z0-9-]+/g) || [])].filter(function (c) { return KEEP.indexOf(c.slice(1)) < 0; });
if (arLeft.length) throw new Error(".ar- rules left beyond the shared set: " + arLeft.join(" "));
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
// Follow-up the same day: one wiring how-to comment line inside our block survived the D10 filter
// ("/* contentHTML dispatch (already in the shell): ... */") and was removed by hand; the viewer's
// VIEW_WNUM map gained receivables:"W05".
