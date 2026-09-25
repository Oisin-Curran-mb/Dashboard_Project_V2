/* One-off, 2026-09-26: build W07 Deposits on Hand (owner: ours 1:1, docs/decisions/W07.md).
   Delete Jo's deposits-mb (depF) block, its hooks, rows and .depf- CSS; register ours as kind
   "deposits" (content, about, the account pop-up modal). Jo's original "dep" code stays in the
   shell for now: it is woven into shared helpers (depSparkHTML feeds W01's glance spark, the
   scoped account modal path) and no registry row uses kind "deposits" any more; its dead render
   chain is release-gate housekeeping. The shell .dep- .tr- .acctm primitives our block uses
   are shared with other widgets and stay. Anchored; aborts before writing on any miss. */
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
const B0 = "/* ===== W07 Deposits on Hand V2 ===== */", W18 = "/* ===== W18 Financial KPI V2 ===== */";

/* ================= JS: Jo's depF block ================= */
const jS = lineStart(t.lastIndexOf("/* =====", idx('     Deposits on Hand (MB updated)  -  kind "deposits-mb", prefix depF', scriptStart(), "depF header")));
const pS = lineStart(t.lastIndexOf("/* =====", idx('   Payroll Scheduled Time Off (MB updated) , prefix ptoF , kind "pto-mb"', scriptStart(), "ptoF header")));
if (!(jS < pS)) throw new Error("block order");
let jE = pS; while (t.slice(jE - NL.length * 2, jE) === NL + NL) jE -= NL.length;
const jBlk = cutSpan(jS, jE, "depF block"); if (jBlk.indexOf("function depFContent(") < 0 || jBlk.indexOf('e.target.id==="depFfq"') < 0) throw new Error("depF shape");
const deleted = new Set([...defsIn(jBlk)].filter(function (n) { return !/^(px|py|sb|trendPct|r|PER|DS)$/.test(n); }));

/* ================= shell hooks ================= */
removeLine('if(w.kind==="deposits-mb")return depFContent(w);', "depF contentHTML");
removeLine('if(w.kind==="deposits-oc")return depOContent(w);', "depO contentHTML");
removeLine('if(w.kind==="deposits")return depContent(w);', "v1 deposits contentHTML (no row uses the kind; the kind is now ours)");
removeLine('if(modal.type==="depOacct"){if(modalMounted){', "depO account modal (in-place refresh)");
editLine("function aboutOf(w){", /if\(w\.kind==="deposits-mb"\)return \{h:w\.title,b:"[^"]*"\};/, "", "aboutOf deposits-mb");
let aboutText = "";
editLine("function aboutOf(w){", /if\(w\.kind==="deposits-oc"\)return \{h:w\.title,b:"([^"]*)"\};/, function (m, b) { aboutText = b; return ""; }, "aboutOf deposits-oc");
editLine("function aboutOf(w){", /if\(w\.kind==="deposits"\)return \{h:w\.title,b:"[^"]*"\};/, "", "aboutOf v1 deposits");
if (aboutText.length < 40) throw new Error("about text not captured");

/* ================= registry ================= */
takeLines(/^\s*\{id:"depF[2-5]?",\s*title:"Deposits on Hand[^"]*",\s*kind:"deposits-mb"/, 5, "depF registry rows");
removeLine("/* Deposits on Hand: our finalized W07, additive.", "depF registry label comment");
(function () {
  const s = lineStart(once('{id:"depO", title:"Deposits on Hand (OC)"', "depO registry row"));
  const e = lineEnd(idx("      */", s, "fixture close"));
  const rows = t.slice(s, e).split(NL).filter(Boolean);
  const fix = function (l) { return l.replace('kind:"deposits-oc"', 'kind:"deposits"').replace(/title:"Deposits on Hand \(OC[^"]*\)"/, 'title:"Deposits on Hand"'); };
  const live = rows.filter(function (l) { return /^\s*\{id:"depO[23]?",\s*title/.test(l); }).map(fix);
  const fixtures = rows.filter(function (l) { return /^\s*\{id:"depO[45]",\s*title/.test(l); }).map(fix);
  if (live.length !== 3 || fixtures.length !== 2) throw new Error("registry rows: live " + live.length + " fixtures " + fixtures.length);
  t = t.slice(0, s) + ["      /* W07 Deposits on Hand */"].concat(live).concat(["      /* W07 driver fixtures (state variants), not rendered as cards:"]).concat(fixtures).concat(["      */"]).join(NL) + NL + t.slice(e);
  log.push("registry: 3 live W07 rows + 2 fixtures, kind deposits, plain titles");
})();
editLine('{id:"s1",title:"Deposits on Hand",kind:"deposits-mb"', /kind:"deposits-mb"/, 'kind:"deposits"', "System dashboard sample row follows the final kind");
removeLine('    ["W07","Deposits on Hand","deposits-mb",', "CMP_ROWS W07");
removeLine('    W07:{h:"Ours is her Deposits widget with four owner-directed changes; everything else is parity.', "CMPNOTE_ W07");

/* ================= the block ================= */
let b0 = idx(B0, scriptStart(), "W07 JS banner"), b1 = idx(W18, b0, "W18 JS banner");
let blk = cutSpan(b0, b1, "depO JS block").replace(/(\r\n)+$/, "");
(function () { const hs = blk.indexOf(NL + "  /* =====", B0.length - 5); const he = blk.indexOf("*/", hs) + 2; if (hs < 0 || he < hs || !/prefix depO/.test(blk.slice(hs, he))) throw new Error("block header comment"); blk = blk.slice(0, hs) + NL + "  /* Deposits on Hand: balances held for others by account type and account. Scope chip (all / a type / one account, searchable), Table (50 per page, totals over the full set) / Distribution donut / Trend views, Compare To with a fiscal Period option, scope-dependent breakdown, chart click re-scopes to the type, per-account pop-up from a table row. */" + blk.slice(he); log.push("block header comment replaced by a purpose line"); })();
blk = blk.replace(/kind:"deposits-oc"/g, 'kind:"deposits"').replace(/deposits-oc/g, "deposits").replace(/Deposits on Hand \(OC[^"']*\)/g, "Deposits on Hand");
blk = blk.split(NL).filter(function (l) { return !(/^\s{3,}[A-Za-z][A-Za-z ()\/-]*[.:]{1,}\s*\.{2,}\s*if\(/.test(l) || /^\s{3,}[A-Za-z()]+:\s+if\(/.test(l) || /^\s{3,}[A-Za-z][A-Za-z ()]*\.{3,}\s*if\(/.test(l)); }).join(NL);
blk = blk.replace(B0 + NL, B0 + NL + '  var DEPO_ABOUT="' + aboutText + '";' + NL);
const register = '  WIDGETS.register("deposits",{content:depOContent,about:function(w){return {h:w.title,b:DEPO_ABOUT};},modals:{depOacct:depOAcctModalHTML}});';
insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + "/* ===== end W07 Deposits on Hand V2 ===== */" + NL, "W07 block before the registry");

/* ================= W05 leftover: its View-all button used Jo's .depf-more classes ================= */
(function () {
  const a0 = idx("/* ===== W05 Receivable Invoices Outstanding V2 ===== */", scriptStart(), "W05 JS banner"), a1 = idx("/* ===== end W05 Receivable Invoices Outstanding V2 ===== */", a0, "W05 JS end");
  let w5 = t.slice(a0, a1); const n = (w5.match(/(?<![\w-])depf-more(-n)?(?![\w-])/g) || []).length; if (n < 2) throw new Error("W05 depf-more uses: " + n);
  w5 = w5.replace(/(?<![\w-])depf-more(-n)?(?![\w-])/g, function (m, x) { return "w05-more" + (x || ""); }); t = t.slice(0, a0) + w5 + t.slice(a1);
  const rules = t.split(NL).filter(function (l) { return /^\s*\.depf-more/.test(l); }).map(function (l) { return l.replace(/\.depf-more/g, ".w05-more"); }); if (rules.length !== 5) throw new Error("depf-more rules: " + rules.length);
  insertBefore("/* ===== end W05 Receivable Invoices Outstanding V2 CSS ===== */", "  /* View all button in the aging list */" + NL + rules.join(NL), "W05: own w05-more rules");
  log.push("W05: depf-more -> w05-more (" + n + " uses)");
})();
/* ================= CSS ================= */
(function () {
  const first = idx("  .kpi-row .depf-spark{", 0, ".depf- first rule"); if (first > styleEnd()) throw new Error("depf rule not in style");
  let s = lineStart(first), e = s; const L = t.slice(s, styleEnd()).split(NL); let k = 0;
  while (k < L.length && /\.depf-/.test(L[k])) { e += L[k].length + NL.length; k++; }
  if (k < 10) throw new Error(".depf- run too short: " + k);
  while (t.slice(e - NL.length * 2, e) === NL + NL) e -= NL.length;
  cutSpan(s, e, "Jo's .depf- CSS run");
})();
const c0 = idx(B0, 0, "W07 CSS banner"); if (c0 > styleEnd()) throw new Error("W07 CSS banner not in style");
const cEnd = "/* ===== end W07 Deposits on Hand V2 CSS ===== */"; const c1 = idx(cEnd, c0, "W07 CSS end banner") + cEnd.length;
let css = t.slice(c0, c1).split(NL);
if (!/^\s*\/\* ===== Deposits on Hand \(MB updated\): only the few visuals/.test(css[1])) throw new Error("CSS sub-banner 1");
const acct = css.findIndex(function (l) { return /^\/\* ===== W07 Deposits on Hand V2 CSS: account modal/.test(l); }); if (acct < 0) throw new Error("CSS sub-banner 2");
css[acct] = "  /* account pop-up: own 560px modal shell so the shared .wt-row column widths fit */";
css = ["/* ===== W07 Deposits on Hand V2 CSS ===== */"].concat(css.slice(2));
t = t.slice(0, c0) + css.join(NL) + t.slice(c1); log.push("W07 CSS region: banners normalised");

/* ================= write ================= */
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$:])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.slice(0, 8).join(", "));
['kind:"deposits-mb"', 'kind:"deposits-oc"', "deposits-mb", "deposits-oc", "depFContent", "DEPF_", "depFfq", ".depf-", "depOContent(w); //"].forEach(function (n) { const i = codeOnly.indexOf(n); if (i > -1) throw new Error("leftover in code: " + n + "  -> " + codeOnly.slice(codeOnly.lastIndexOf("\n", i) + 1, i + 80)); });
if (/(?<![\w-])depf-[a-z0-9-]+/.test(t.slice(scriptStart()).replace(/\/\*[\s\S]*?\*\//g, ""))) throw new Error("depf- token left in script code");
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");
