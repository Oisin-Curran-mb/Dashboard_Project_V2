/* One-off, 2026-09-28: the shared package, first pass.

   Owner: "since I made all the code separate for each widget to help clean it up
   and make sure there was no nock on effect, see what common code, styling or
   functions that are duplicated between widgets and then make a common package
   but also take what widget is using what."

   THE METHOD MATTERS. Each widget's helper is not deleted and its call sites
   are not rewritten. The canonical implementation moves into a shared package
   in the shell, and each widget's helper becomes a one-line alias to it. So:

     - there is exactly ONE implementation of each helper, which is the point
     - every call site in every widget is untouched, so the isolation the owner
       built the file around is preserved at the point of use
     - a widget can still diverge later by giving its alias a real body again,
       which is what kept the per-widget separation valuable in the first place
     - the drivers that assert `function penOEsc(` is defined still pass, so the
       change is verifiable rather than merely plausible

   This pass takes only the families whose copies are byte-identical or differ
   by a guard that is strictly safer. The families whose copies genuinely differ
   in behaviour (compact axis money, severity ladders, day-difference rounding,
   the minus glyph in two money formatters) are left alone and recorded in
   docs/SHARED.md for the owner to rule on.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a0.slice(0, 70));
  t = t.split(a).join(b);
}

/* ------------------------------------------------- 1. the package itself */
const PKG = [
  '  /* =====================================================================',
  '     Shell: shared widget helpers (the common package)',
  '     =====================================================================',
  '     Added 2026-09-28. Every widget was built self-contained, on purpose, so',
  '     that editing one could not affect another. The cost was the same helper',
  '     written out once per widget: eight identical attribute escapers, six',
  '     identical ISO date parsers, four identical month tables.',
  '',
  '     This is the one implementation of each. A widget keeps its own named',
  '     helper, now a one-line alias, so no call site anywhere moved and any',
  '     widget can still take its own body back if it needs to diverge.',
  '',
  '     Who uses what is recorded in docs/SHARED.md and tagged per widget in',
  '     _tools/widget-map.json, so a single widget\'s tests still run alone.',
  '',
  '     NOT here, deliberately: the compact axis formatters, the severity',
  '     ladders, the day-difference helpers and the two sign-aware money',
  '     formatters. Those copies differ in ways that are visible on screen',
  '     (rounding tiers, band counts, midnight normalisation, and one uses a',
  '     true minus sign where the other uses a hyphen). Unifying them is a',
  '     design decision, not a refactor.',
  '  ===================================================================== */',
  '  /* attribute-safe: the eight-copy family. Quote only, which is all that is',
  '     needed inside a double-quoted attribute. */',
  '  function escAttr(s){return String(s).replace(/"/g,"&quot;");}',
  '  /* text-safe: the four-copy family. Ampersand first, or the later',
  '     replacements would double-escape it. Null-guarded, which W09 alone did',
  '     and which is strictly safer for the other three. */',
  '  function escText(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}',
  '  /* a date-only ISO string to a LOCAL midnight Date. new Date("2026-08-19")',
  '     would parse as UTC and shift behind the date line, which is why every',
  '     widget hand-rolled this rather than using the constructor. */',
  '  function parseISO(iso){var p=String(iso).split("-");return new Date(+p[0],(+p[1])-1,+p[2]);}',
  '  var MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];',
  '  /* "Aug 19, 2026". Returns the input untouched when it is not a date-only',
  '     ISO string, so a label already in prose passes through. */',
  '  function fmtDateLong(iso){var p=String(iso).split("-");if(p.length!==3)return iso;return MONTHS[(+p[1])-1]+" "+(+p[2])+", "+p[0];}',
  '  /* money at two decimals. Number(n||0) tolerates null, which W13 alone did. */',
  '  function moneyFull(n){return "$"+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});}',
  '  /* pace band from days ahead of, or behind, schedule. Shared by W04',
  '     Remittance Pledges and W17 Gifts Pledges, which pace on the same rule. */',
  '  function bandFromDays(d){if(d>=30)return "ahead";if(d>=-30)return "onpace";if(d>=-60)return "behind";return "farbehind";}',
  '  /* ===== end Shell: shared widget helpers ===== */'
].join(NL);

/* it goes right after the widget-registration block, which is the shell's own
   first shared thing, and well before any widget block */
{
  const anchor = "  /* ===== Shell: single-widget viewer (review aid) =====";
  const i = t.indexOf(anchor);
  if (i < 0) throw new Error("the placement anchor was not found");
  if (t.indexOf(anchor, i + 1) > -1) throw new Error("the placement anchor is ambiguous");
  t = t.slice(0, i) + PKG + NL + t.slice(i);
  log.push("added the shared package (" + (PKG.split(NL).length) + " lines)");
}

/* --------------------------------------------- 2. the per-widget aliases */
const ALIASES = [
  /* attribute escaping, eight copies */
  ['function penOEsc(s){return String(s).replace(/"/g,"&quot;");}', 'function penOEsc(s){return escAttr(s);}'],
  ['  function prOEsc(x){return String(x).replace(/"/g,"&quot;");}', '  function prOEsc(x){return escAttr(x);}'],
  ['function remOEsc(s){return String(s).replace(/"/g,"&quot;");}', 'function remOEsc(s){return escAttr(s);}'],
  ['function arOEsc(s){return String(s).replace(/"/g,"&quot;");}', 'function arOEsc(s){return escAttr(s);}'],
  ['  function insOEsc(s){return String(s).replace(/"/g,"&quot;");}', '  function insOEsc(s){return escAttr(s);}'],
  ['function lonFEsc(s){return String(s).replace(/"/g,"&quot;");}', 'function lonFEsc(s){return escAttr(s);}'],
  ['function gpFEsc(s){return String(s).replace(/"/g,"&quot;");}', 'function gpFEsc(s){return escAttr(s);}'],
  ['  function apEsc(s){return String(s).replace(/"/g,"&quot;");}', '  function apEsc(s){return escAttr(s);}'],
  /* text escaping, four copies */
  ['function ptoFEsc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}',
   'function ptoFEsc(s){return escText(s);}'],
  ["function faFEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');}",
   'function faFEsc(s){return escText(s);}'],
  ['function purFEsc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}',
   'function purFEsc(s){return escText(s);}'],
  ['function fkpEsc(s){\n  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");\n}',
   'function fkpEsc(s){return escText(s);}'],
  /* ISO parsing, six copies */
  ['  function prOParseISO(s){var p=String(s).split("-");return new Date(+p[0],(+p[1])-1,+p[2]);}', '  function prOParseISO(s){return parseISO(s);}'],
  ['function remOParse(iso){var p=String(iso).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}', 'function remOParse(iso){return parseISO(iso);}'],
  ['function lonFParse(iso){var p=String(iso).split("-");return new Date(+p[0],(+p[1])-1,+p[2]);}', 'function lonFParse(iso){return parseISO(iso);}'],
  ['function purFParse(iso){var p=String(iso).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}', 'function purFParse(iso){return parseISO(iso);}'],
  ['function gpFParse(iso){var p=String(iso).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}', 'function gpFParse(iso){return parseISO(iso);}'],
  ['  function apParse(iso){var p=iso.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}', '  function apParse(iso){return parseISO(iso);}'],
  /* money at two decimals, four copies */
  ['function penOMoney(n){return "$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});}', 'function penOMoney(n){return moneyFull(n);}'],
  ['function lonFMoney(n){return "$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});}', 'function lonFMoney(n){return moneyFull(n);}'],
  ['function purFMoney(n){return "$"+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});}', 'function purFMoney(n){return moneyFull(n);}'],
  ['  function apMoney(n){return "$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});}', '  function apMoney(n){return moneyFull(n);}'],
  /* long-date formatting: five copies, three of which inlined their own month
     table. The shared one keeps the "return the input untouched when it is not
     a date-only ISO string" guard that W05 and W10 had and the other three
     lacked, which is strictly safer for them. */
  ['function remOFmtDate(iso){var d=remOParse(iso);return REMO_MON[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();}', 'function remOFmtDate(iso){return fmtDateLong(iso);}'],
  ['function purFFmtDate(iso){var M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],d=purFParse(iso);return M[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();}', 'function purFFmtDate(iso){return fmtDateLong(iso);}'],
  ['function gpFFmtDate(iso){var d=gpFParse(iso);return GPF_MON[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();}', 'function gpFFmtDate(iso){return fmtDateLong(iso);}'],
  ['function arOFmtDate(iso){var M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var p=String(iso).split("-");if(p.length!==3)return iso;return M[(+p[1])-1]+" "+(+p[2])+", "+p[0];}', 'function arOFmtDate(iso){return fmtDateLong(iso);}'],
  ['function lonFFmtDate(iso){var M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var p=String(iso).split("-");if(p.length!==3)return iso;return M[(+p[1])-1]+" "+(+p[2])+", "+p[0];}', 'function lonFFmtDate(iso){return fmtDateLong(iso);}'],
  /* the four month tables become private copies of the one literal, so the
     duplicate data is gone without sharing a mutable array by reference */
  ['var REMO_MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];', 'var REMO_MON=MONTHS.slice();'],
  ['var PURF_MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];', 'var PURF_MON=MONTHS.slice();'],
  ['var GPF_MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];', 'var GPF_MON=MONTHS.slice();'],
  ['  var AP_M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];', '  var AP_M=MONTHS.slice();'],
  /* pace band, two copies */
  ["function remOBandFromDays(d){if(d>=30)return 'ahead';if(d>=-30)return 'onpace';if(d>=-60)return 'behind';return 'farbehind';}", 'function remOBandFromDays(d){return bandFromDays(d);}'],
  ["function gpFBandFromDays(d){if(d>=30)return 'ahead';if(d>=-30)return 'onpace';if(d>=-60)return 'behind';return 'farbehind';}", 'function gpFBandFromDays(d){return bandFromDays(d);}']
];
ALIASES.forEach(([a, b]) => swap(a, b));
log.push("aliased " + ALIASES.length + " per-widget helpers onto the package");

/* -------------------------------------------------------------- 3. guards */
["escAttr", "escText", "parseISO", "MONTHS", "fmtDateLong", "moneyFull", "bandFromDays"].forEach(n => {
  const c = (t.match(new RegExp("(^|[^A-Za-z0-9_$])" + n + "(?![A-Za-z0-9_$])", "g")) || []).length;
  if (c < 2) throw new Error(n + " is declared but never used (" + c + ")");
});
/* no widget's alias may be defined twice, and every aliased name must survive */
ALIASES.forEach(([, b]) => {
  const m = /function ([A-Za-z0-9_$]+)\(/.exec(b);
  if (!m) return; /* a var alias, checked by the package guard above */
  const name = m[1];
  const c = (t.match(new RegExp("function " + name + "\\(", "g")) || []).length;
  if (c !== 1) throw new Error(name + " is defined " + c + " times");
});
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("shared package in place; " + t.split(NL).length + " lines");
