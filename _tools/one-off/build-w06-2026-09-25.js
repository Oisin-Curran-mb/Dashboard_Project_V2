/* One-off, 2026-09-25: build W06 Insurance Billing Plans (owner: ours 1:1, docs/decisions/W06.md).
   Delete Jo's insurance-mb (insF) block and her v1 "ins" block (no registry row uses kind "insurance"),
   their hooks, rows and CSS; our block used 50 of Jo's .ins-/.insf- classes, so every ins- token in the
   block and its CSS becomes w06- and the rules it needs are copied in renamed; register as kind
   "insurance"; the block's own click dispatch moves to the registration (its outside-click popover
   close and keyboard handling stay); drill-free table header follows D12. Anchored; aborts on a miss. */
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
const B0 = "/* ===== W06 Insurance Billing Plans V2 ===== */", W07 = "/* ===== W07 Deposits on Hand V2 ===== */";

/* ================= JS: Jo's insF block, then her v1 ins block ================= */
const v1S = lineStart(t.lastIndexOf("/* =====", idx('   Insurance Billing Plans  (ins, kind:"insurance")  ,  v2 redesign', scriptStart(), "v1 header")));
const jS = lineStart(t.lastIndexOf("/* =====", idx('     Insurance Billing Plans (MB updated)  (prefix: insF, kind:"insurance-mb")', scriptStart(), "insF header")));
const fS = lineStart(idx('  /* ===== Fixed Asset Values (fa, kind:"fixedassets") ===== */', scriptStart(), "fa header"));
if (!(v1S < jS && jS < fS)) throw new Error("block order");
let jE = fS; while (t.slice(jE - NL.length * 2, jE) === NL + NL) jE -= NL.length;
const jBlk = cutSpan(jS, jE, "insF block"); if (jBlk.indexOf("function insFContent(") < 0 || jBlk.indexOf("var INSF_WIRED=") < 0) throw new Error("insF shape");
let v1E = jS; while (t.slice(v1E - NL.length * 2, v1E) === NL + NL) v1E -= NL.length;
const v1 = cutSpan(v1S, v1E, "v1 ins block"); if (v1.indexOf("function insContent(") < 0 || v1.indexOf("var INS_PLANS=") < 0) throw new Error("v1 shape");
const deleted = new Set([...defsIn(v1), ...defsIn(jBlk)]);

/* ================= shell hooks ================= */
removeLine('if(w.kind==="insurance")return insContent(w);', "v1 contentHTML");
removeLine('if(w.kind==="insurance-mb")return insFContent(w);', "insF contentHTML");
removeLine('if(w.kind==="insurance-oc")return insOContent(w);', "insO contentHTML");
removeLine('if(pop.type==="ins-type")return insPopContent();', "v1 popContent");
editLine("function triggerSelector(){", /if\(pop\.type==="ins-type"\)return '\[data-action="ins-type"\]\[data-id="'\+pop\.id\+'"\]';/, "", "triggerSelector ins-type");
removeLine('if(a&&a.indexOf("ins-")===0&&insHandleClick(a,id,t))return;', "v1 click hook");
editLine("function aboutOf(w){", /if\(w\.kind==="insurance-mb"\)return \{h:w\.title,b:INSF_ABOUT\};/, "", "aboutOf insurance-mb");
editLine("function aboutOf(w){", /if\(w\.kind==="insurance-oc"\)return \{h:w\.title,b:INSO_ABOUT\};/, "", "aboutOf insurance-oc");

/* ================= registry ================= */
takeLines(/^\s*\{id:"insF(_k|2|3|4)?",\s*title:"Insurance Billing Plans[^"]*",\s*kind:"insurance-mb"/, 5, "insF registry rows");
removeLine("/* Insurance Billing Plans: our finalized W06, additive.", "insF registry label comment");
(function () {
  const s = lineStart(once('{id:"insO", title:"Insurance Billing Plans (OC)"', "insO registry row"));
  const e = lineEnd(idx("      */", s, "fixture close"));
  const rows = t.slice(s, e).split(NL).filter(Boolean);
  const fix = function (l) { return l.replace('kind:"insurance-oc"', 'kind:"insurance"').replace(/title:"Insurance Billing Plans \(OC[^"]*\)"/, 'title:"Insurance Billing Plans"'); };
  const live = rows.filter(function (l) { return /^\s*\{id:"insO(_k|2)?",\s*title/.test(l); }).map(fix);
  const fixtures = rows.filter(function (l) { return /^\s*\{id:"insO[34]",\s*title/.test(l); }).map(fix);
  if (live.length !== 3 || fixtures.length !== 2) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
  t = t.slice(0, s) + ["      /* W06 Insurance Billing Plans */"].concat(live).concat(["      /* W06 driver fixtures (state variants), not rendered as cards:"]).concat(fixtures).concat(["      */"]).join(NL) + NL + t.slice(e);
  log.push("registry: 3 live W06 rows + 2 fixtures, kind insurance, plain titles");
})();
removeLine('    ["W06","Insurance Billing Plans","insurance-mb",', "CMP_ROWS W06");
removeLine('    W06:{h:"Ours is her Insurance widget one-to-one, plus an expandable type-to-plan table and the restored pie.",', "CMPNOTE_ W06");

/* ================= the block ================= */
let b0 = idx(B0, scriptStart(), "W06 JS banner"), b1 = idx(W07, b0, "W07 JS banner");
let blk = cutSpan(b0, b1, "insO JS block").replace(/(\r\n)+$/, "");
/* history header comment -> one purpose line (D10) */
(function () { const hs = blk.indexOf(NL + "  /* =====", B0.length - 5); const he = blk.indexOf("*/", hs) + 2; if (hs < 0 || he < hs || !/prefix: insO/.test(blk.slice(hs, he))) throw new Error("block header comment"); blk = blk.slice(0, hs) + NL + "  /* Insurance Billing Plans: enrolment by insurance type and plan. Expandable type rows with enrolled and cost subtotals, Share and Cost columns, Table / Pie views (Table default at Explore, both at Detail), one fetch on the type filter. */" + blk.slice(he); log.push("block header comment replaced by a purpose line"); })();
blk = blk.replace(/kind:"insurance-oc"/g, 'kind:"insurance"').replace(/insurance-oc/g, "insurance").replace(/Insurance Billing Plans \(OC[^"']*\)/g, "Insurance Billing Plans");
/* click dispatch through the registration; the block keeps the outside-click close and the keyboard handling */
const clickOld = '      if(a&&a.indexOf("insO-")===0){insOHandle(a,t.getAttribute("data-id"),t);return;}' + NL + "      /* outside click: close the inline type popover unless the click is inside it */" + NL + '      if(INSO_POP&&!(e.target.closest&&e.target.closest(".insf-menu"))){INSO_POP=null;render();}';
if (blk.split(clickOld).length !== 2) throw new Error("block click listener");
blk = blk.replace(clickOld, '      if(a&&a.indexOf("insO-")===0)return;' + NL + "      /* outside click: close the inline type popover unless the click is inside it */" + NL + '      if(INSO_POP&&!(e.target.closest&&e.target.closest(".insf-menu"))){INSO_POP=null;render();}');
/* D12: header cells carry the column's width/alignment classes only */
const headOld = '<div class="wt-row wt-head ins-row"><span class="lr-main">\'+sb("plan","Insurance type / plan")+\'</span><span class="ins-share ins-share-head">Share of total</span><span class="wt-c2">\'+sb("count","Enrolled")+\'</span><span class="ins-cost ins-cost-head">Cost</span></div>';
if (blk.split(headOld).length !== 2) throw new Error("head row");
blk = blk.replace(headOld, '<div class="wt-row wt-head ins-row"><span class="lr-main">\'+sb("plan","Insurance type / plan")+\'</span><span class="ins-share">Share of total</span><span class="wt-c2">\'+sb("count","Enrolled")+\'</span><span class="ins-cost">Cost</span></div>');
log.push("D12: header cells carry width/alignment classes only");

/* ================= CSS ================= */
const st = t.slice(t.indexOf("<style"), styleEnd());
const declared = new Set((st.match(/\.ins[fF]?-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); }));
const tokens = [...new Set(blk.match(/(?<![\w-])ins[fF]?-[a-z0-9-]+/g) || [])].filter(function (c) { return !/-$/.test(c); });
const used = new Set(tokens.filter(function (c) { return declared.has(c); }));
const c0 = idx(B0, 0, "W06 CSS banner"); if (c0 > styleEnd()) throw new Error("W06 CSS banner not in style");
const c1 = idx(W07, c0, "W07 CSS banner"); if (c1 > styleEnd()) throw new Error("W07 CSS banner not in style");
(t.slice(c0, c1).match(/\.ins[fF]?-[a-z0-9-]+/g) || []).forEach(function (c) { if (declared.has(c.slice(1))) used.add(c.slice(1)); });
if (used.size < 40) throw new Error("too few shared classes: " + used.size);
const w06 = function (c) { return "w06-" + c.replace(/^ins[fF]?-/, ""); };
const mapped = {}; [...used].forEach(function (c) { const n = w06(c); if (mapped[n] && mapped[n] !== c) throw new Error("w06- name collision: " + c + " vs " + mapped[n]); mapped[n] = c; });
const ren = function (s) { return s.replace(/\.(ins[fF]?-[a-z0-9-]+)/g, function (m, x) { return used.has(x) ? "." + w06(x) : m; }); };
/* rules from Jo's two blocks that our block needs */
const rules = []; (function () { let i = 0, media = null, depth = 0, buf = ""; while (i < st.length) { const ch = st[i]; if (ch === "{") { const pre = buf.trim(); buf = ""; if (pre.charAt(0) === "@") { media = pre; depth++; i++; continue; } const j = st.indexOf("}", i); rules.push({ sel: pre, body: st.slice(i + 1, j), media: depth ? media : null, at: i }); i = j + 1; continue; } if (ch === "}") { if (depth) { depth--; media = null; } buf = ""; i++; continue; } buf += ch; i++; } })();
const regionStart = c0 - t.indexOf("<style"), regionEnd = c1 - t.indexOf("<style");
const copies = [];
rules.forEach(function (r) { if (r.at >= regionStart && r.at < regionEnd) return; const sel = r.sel.replace(/\/\*[\s\S]*?\*\//g, "").trim(); if (!sel) return; const cls = sel.match(/\.ins[fF]?-[a-z0-9-]+/g) || []; if (!cls.length || !cls.every(function (c) { return used.has(c.slice(1)); })) return; if (/\.ins-share-head|\.ins-cost-head/.test(sel)) return; const rule = ren(sel) + "{" + r.body.trim() + "}"; copies.push(r.media ? r.media + "{" + rule + "}" : rule); });
if (copies.length < 30) throw new Error("too few copied rules: " + copies.length);
/* delete Jo's two insurance CSS blocks */
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
cutCssBlock('Insurance Billing Plans (MB updated) v insF, kind "insurance-mb"', /\.ins[fF]-/, "Jo's .insf- CSS");
cutCssBlock("Insurance Billing Plans (ins) , v2 styles", /\.ins-/, "Jo's v1 .ins- CSS");
/* rebuild our region */
const cc0 = idx(B0, 0, "W06 CSS banner (2)"), cc1 = idx(W07, cc0, "W07 CSS banner (2)");
const ownRules = t.slice(cc0, cc1).split(NL).slice(1).filter(function (l) { return l.trim() && !/^\s*\/\* ===== W06 Insurance Billing Plans V2 CSS, prefix/.test(l) && !/\.ins-cost-head/.test(l); }).map(ren);
const headRules = ["  .wt-head .w06-share{color:var(--txt-subtle);font-size:11px;font-weight:600;}", "  .wt-head .w06-cost{font-weight:600;color:var(--txt-subtle);}"];
const newCss = ["/* ===== W06 Insurance Billing Plans V2 CSS ===== */", "  /* Stand-alone copies of the insurance rules this widget uses (w06- prefix). Classes: " + [...used].sort().join(" ") + " */"]
  .concat(copies.map(function (c) { return "  " + c; })).concat(headRules).concat(ownRules).concat(["/* ===== end W06 Insurance Billing Plans V2 CSS ===== */"]).join(NL);
t = t.slice(0, cc0) + newCss + NL + NL + t.slice(cc1); log.push("W06 CSS region rebuilt: " + copies.length + " w06- copies + " + ownRules.length + " own lines");
/* repoint the block: every ins-/insf- token, declared or hook-only, becomes w06- */
blk = blk.replace(/(?<![\w-])ins[fF]?-([a-z0-9-]+)/g, function (m, rest) { return "w06-" + rest; });
const leftover = tokens.filter(function (c) { return !used.has(c); });
if (leftover.length) log.push("renamed hook-only names: " + leftover.join(" "));

/* ================= register + place ================= */
const register = '  WIDGETS.register("insurance",{content:insOContent,about:function(w){return {h:w.title,b:INSO_ABOUT};},click:function(a,id,t){return !!(a&&a.indexOf("insO-")===0&&insOHandle(a,id,t));}});';
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + "/* ===== end W06 Insurance Billing Plans V2 ===== */" + NL, "W06 block before the registry");

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
['kind:"insurance-mb"', 'kind:"insurance-oc"', "insurance-mb", "insurance-oc", "insFContent", "insContent(", "INSF_", "INS_PLANS", "insHandleClick", "ins-type", ".ins-", ".insf-", "insf-grp-"].forEach(function (n) { const i = codeOnly.indexOf(n); if (i > -1) throw new Error("leftover in code: " + n + "  -> " + codeOnly.slice(codeOnly.lastIndexOf("\n", i) + 1, i + 80)); });
const jsNow = t.slice(scriptStart()); if (/(?<![\w-])ins[fF]?-[a-z0-9-]+/.test(jsNow.replace(/\/\*[\s\S]*?\*\//g, ""))) throw new Error("ins- token left in script code");
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
// Same day: the viewer's VIEW_WNUM map gained insurance:"W06".
// 26 Sep follow-up after the browser look: the region held duplicate lines (our own rules repeated Jo's
// insF rules verbatim; deduped) and at narrow card widths the three fixed columns (132/104 + 96 + 96 px)
// left the name column 0 px wide. The numeric columns may now shrink (flex 0 1, min widths 72/52/64)
// and the name column keeps min-width 104px; row gap 10px.
