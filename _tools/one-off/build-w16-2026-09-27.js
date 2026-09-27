/* One-off, 2026-09-27: finalise W16 Accounts Payable By Due Date on JO's version (owner: "take jo version of
   Accounts Payable By Due Date"; docs/decisions/W16.md). Same shape as build-w15-2026-09-27.js:
     - our apF block (JS + CSS), its content-dispatch hook, its aboutOf branch, six registry rows and comment, the
       cmp row and cmp note are deleted; every deleted name must have zero code references afterwards
     - Jo's block stays with its shell hooks (click, pop, trigger); her content is registered under kind
       "payables" so the review viewer lists W16, and the now redundant contentHTML branch goes
     - her three fixture rows (ap2, ap3, ap4) go; the three sizes are titled "Accounts Payable By Due Date"
     - a shell comment naming .apf-pop is reworded */
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
const styleEnd = function () { return t.indexOf("</style>"); }, scriptStart = function () { return t.indexOf("<script>"); };
const defsIn = function (s) { return new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(function (m) { return m[1]; }).concat([...s.matchAll(/^\s*var\s+([A-Z_][A-Z0-9_]*)\s*=/gm)].map(function (m) { return m[1]; }))); };

/* ================= our JS block ================= */
const B0 = '/* ===== W16 Accounts Payable By Due Date V2 JS , prefix apF , kind "payables-mb" ===== */', BEND = "/* ===== end W16 Accounts Payable By Due Date V2 ===== */";
const b0 = lineStart(idx(B0, scriptStart(), "apF banner")), b1 = lineEnd(idx(BEND, b0, "apF end banner"));
const ours = cutSpan(b0, b1, "our apF block");
/* her block ends exactly where ours began: leave a marker there for the registration line (later edits shift offsets) */
t = t.slice(0, b0) + "@@W16_REGISTER@@" + NL + t.slice(b0);
["function apFContent(", "var APF_INVOICES="].forEach(function (n) { if (ours.indexOf(n) < 0) throw new Error("apF block lacks " + n); });
if (/function ap[A-Z][a-z]/.test(ours.replace(/apF/g, ""))) throw new Error("apF cut reached into Jo's functions");
const deleted = new Set([...defsIn(ours)].filter(function (n) { return n.length > 2; }));

/* ================= hooks, registry, cmp ================= */
removeLine('    if(w.kind==="payables-mb")return apFContent(w); //', "apF contentHTML");
editLine("  function aboutOf(w){", /if\(w\.kind==="payables-mb"\)return \{h:w\.title,b:APF_ABOUT\};/, "", "aboutOf payables-mb");
removeLine('      /* ===== W16 Accounts Payable By Due Date V2 registry, prefix apF, kind "payables-mb". ===== */', "apF registry comment");
takeLines(/^\s*,\{id:"apF(_k|_x|2|3|4)?",\s*title:"Accounts Payable By Due Date \(OC[^"]*\)",\s*kind:"payables-mb",/, 6, "apF registry rows");
takeLines(/^\s*\{id:"ap(2|3|4)",title:"Accounts Payable By Due Date[^"]*",kind:"payables",/, 3, "Jo's fixture rows ap2, ap3, ap4");
editLine('      {id:"ap_k",title:"Accounts Payable By Due Date (Glance)",kind:"payables",', /title:"Accounts Payable By Due Date \(Glance\)"/, 'title:"Accounts Payable By Due Date"', "ap_k title");
editLine('      {id:"ap_x",title:"Accounts Payable By Due Date (Detail)",kind:"payables",', /title:"Accounts Payable By Due Date \(Detail\)"/, 'title:"Accounts Payable By Due Date"', "ap_x title");
removeLine('    ["W16","Accounts Payable By Due Date","payables",{apview:"table",apDue:"total",apsort:"due-asc",updated:"just now"},"payables-mb",', "CMP_ROWS W16");
removeLine('    W16:{h:"Ours is a one-to-one copy of her v2 Payables design plus exactl', "CMPNOTE W16");
editLine("    var VIEW_WNUM={budget:\"W01\"", /bank:"W15",/, 'bank:"W15",payables:"W16",', "viewer map W16");
editLine("   how .faf-pop, .apf-pop and .gpf-pop already solve this in this", /\.apf-pop and /, "", "shell comment: .apf-pop gone");

/* ================= Jo's block: register her content, drop the hook ================= */
removeLine('    if(w.kind==="payables")return apContent(w);', "Jo's contentHTML hook (registration replaces it)");
editLine('     2. contentHTML() dispatch ...... if(w.kind==="payables")return apContent(w);   (UNCHANGED)', /if(w.kind==="payables")return apContent(w);s+(UNCHANGED)/, 'registered through WIDGETS.register under kind payables, content apContent   (2026-09-27; the shell consults the registry first, so no kind branch remains)', "her integration comment follows the registration");
{
  once('   Accounts Payable By Due Date  (ap, kind:"payables")  ,  v2 redesign', "her banner");
  const mk = "@@W16_REGISTER@@" + NL; if (t.split(mk).length !== 2) throw new Error("register marker");
  t = t.replace(mk, "  /* Registered so the shell (and the review viewer) find her block through WIDGETS; her click, pop and trigger hooks stay as they are. */" + NL + '  WIDGETS.register("payables",{content:apContent});' + NL + NL);
  log.push("inserted: WIDGETS.register(\"payables\") where our block ended hers");
}

/* ================= our CSS ================= */
{
  const c0 = lineStart(idx('  /* ===== W16 Accounts Payable By Due Date V2 CSS , prefix apF , kind "payables-mb" ===== */', 0, "apF CSS banner"));
  const c1 = lineEnd(idx("  /* ===== end W16 Accounts Payable By Due Date V2 CSS ===== */", c0, "apF CSS end"));
  const cut = cutSpan(c0, c1, "our .apf- CSS run");
  const odd = cut.split(NL).filter(function (l) { return /\{/.test(l) && !/^\s*@media|^\s*\/\*|^\s*\*/.test(l) && !/\.apf-/.test(l) && !/^\s*\}?\s*$/.test(l); });
  if (odd.length) throw new Error("non-.apf- rules inside our CSS run: " + JSON.stringify(odd.slice(0, 4)));
}

/* ================= guards ================= */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").split(NL).filter(function (l) { return l.trim() && !/^\s*\/\//.test(l); }).join(NL);
const refs = [...deleted].filter(function (n) { if (new RegExp("function\\s+" + n + "\\s*\\(|var\\s+" + n + "\\b").test(t)) return false; return new RegExp("(?<![\\w$.])" + n + "(?![\\w$])").test(codeOnly); });
if (refs.length) throw new Error("deleted names still referenced: " + refs.join(", "));
if (/\.apf-/.test(t.slice(t.indexOf("<style"), styleEnd()))) throw new Error(".apf- rules survive");
if (/apF[A-Z]|APF_|payables-mb|data-apf|apf-/.test(codeOnly)) throw new Error("apF survives in code: " + JSON.stringify(codeOnly.match(/.{0,50}(apF[A-Z]|APF_|payables-mb|data-apf|apf-).{0,50}/g).slice(0, 4)));
/* her banner comment also says kind:"payables", so count registry rows by their title+kind shape */
if ((t.match(/title:"[^"]*",kind:"payables",/g) || []).length !== 3) throw new Error("expected exactly three payables rows, got " + (t.match(/title:"[^"]*",kind:"payables",/g) || []).length);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); log.forEach(function (l) { console.log(l); }); console.log("done: " + t.split(NL).length + " lines");
