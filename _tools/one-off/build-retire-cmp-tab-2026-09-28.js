/* One-off, 2026-09-28: retire the side-by-side comparison tab.

   Owner: "clean away code that no longer in use."

   The tab existed to show Jo's version of a widget beside ours while each one
   was being decided. W17 was the last undecided widget, and when it was
   finalised on the OC version its CMP_ROWS entry went with Jo's block, leaving
   CMP_ROWS empty. An empty CMP_ROWS builds a dashboard tab with no cards, so
   the tab, the note cards it carried, their CSS and their driver are all dead.

   The single-widget review viewer is NOT touched: the owner reviews with it.
   Its #w=Wnn route did jump into the cmp tab, so that one branch goes and the
   route now filters the current tab by kind, which is what #k= already does.

   Removed: CMPNOTE_, CMP_ROWS, CMP_TIERS, CMP_TIERLBL, cmpCards, cmpNoteContent,
   the cmpnote-mb dispatch, the cmp dashboards entry, the .cmpnote-* CSS, the
   comparison-tab banner comment, and _tools/cmp-dashboard.driver.js.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

const idx = (n, from, label) => { const i = t.indexOf(n, from || 0); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 70))); return i; };
const once = (n, label) => { const i = idx(n, 0, label); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 70))); return i; };
const lineStart = i => t.lastIndexOf(NL, i - 1) + NL.length;
const lineEnd = i => t.indexOf(NL, i) + NL.length;
function cutSpan(s, e, label) { const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("cut " + (cut.split(NL).length - 1) + " lines: " + label); return cut; }
function removeLine(n, label) { const i = once(n, label); t = t.slice(0, lineStart(i)) + t.slice(lineEnd(i)); log.push("removed line: " + label); }
function editLine(needle, re, repl, label) {
  const i = once(needle, label + " line"), s = lineStart(i), e = lineEnd(i), line = t.slice(s, e);
  if (!re.test(line)) throw new Error("edit pattern missing: " + label);
  t = t.slice(0, s) + line.replace(re, repl) + t.slice(e); log.push("edited: " + label);
}

/* it is only safe to retire the tab because nothing is left to compare */
{
  const a = idx("  var CMP_ROWS=[", 0, "CMP_ROWS");
  const b = idx("];", a, "CMP_ROWS end");
  if (t.slice(a + "  var CMP_ROWS=[".length, b).trim() !== "") throw new Error("CMP_ROWS is not empty; a widget is still undecided");
}

/* ---------------------------------------------- 1. the banner and the machinery */
{
  const a = idx("  /* =====================================================================" + NL
    + "     Side by side (Jo vs OC) , a COMPARISON TAB, not a widget.", 0, "comparison-tab banner");
  const endOfNote = idx("  }" + NL, idx("function cmpNoteContent(w){", a, "cmpNoteContent"), "cmpNoteContent end");
  const cut = cutSpan(a, endOfNote + ("  }" + NL).length, "the comparison tab: banner, CMPNOTE_, CMP_ROWS, cmpCards, cmpNoteContent");
  ["var CMPNOTE_={", "var CMP_ROWS=[", "var CMP_TIERS=", "function cmpCards(){", "function cmpNoteContent(w){"].forEach(n => {
    if (cut.indexOf(n) < 0) throw new Error("the cut lacks " + n);
  });
  if (/gpFContent|purFContent|WIDGETS\.register/.test(cut)) throw new Error("the cut reached into a widget block");
}

/* ------------------------------------------------- 2. the dashboards entry */
removeLine('    ,{id:"cmp",name:"Side by side (Jo vs OC)",custom:true,widgets:cmpCards()}', "the cmp dashboards entry");

/* ------------------------------------------------- 3. the note-card dispatch */
removeLine('    if(w.kind==="cmpnote-mb")return cmpNoteContent(w); //', "cmpnote-mb contentHTML dispatch");

/* ------------------------------------------------- 4. the #w= route

   #w=Wnn only ever selected cards whose id began "cmpWnn", so it dies with the
   tab. #k=<kind> stays: it is what the review dropdown drives now, and it
   filters the current tab, which is the one the finished widgets live on. */
removeLine('    if(mw){var W=mw[1].toUpperCase();if(currentId!=="cmp"&&dashboards.some(function(d){return d.id==="cmp";})){currentId="cmp";return viewOnly(cur().widgets);}return ws.filter(function(x){return x.id.indexOf("cmp"+W)===0;});}', "the #w= route");
editLine('  function viewOnly(ws){var h=location.hash||"";',
  /var mw=\/\[#&\]w=\(W\\d\\d\)\/i\.exec\(h\),mk=/, "var mk=", "viewOnly drops the unused #w= capture");
editLine("  function viewOnlySelectHTML(){",
  /var h=location\.hash\|\|"",cur_=\(\/\[#&\]\(w=W\\d\\d\|k=\[a-z0-9,-\]\+\)\/i\.exec\(h\)\|\|\["",""\]\)\[1\];/,
  'var h=location.hash||"",cur_=(/[#&](k=[a-z0-9,-]+)/i.exec(h)||["",""])[1];',
  "the review dropdown reads only the #k= hash");
removeLine('    if(typeof CMP_ROWS!=="undefined")CMP_ROWS.forEach(function(r){opts.push(["w="+r[0],r[0]+" "+r[1]+" (Jo vs OC, 3 sizes)"]);});', "the dropdown's Jo-vs-OC options");
editLine("  /* ===== Shell: single-widget viewer (review aid) =====",
  /.*/,
  "  /* ===== Shell: single-widget viewer (review aid) =====", "viewer banner kept");
{
  const a = once("     index.html#w=W05     the Side by side tab filtered to one widget: both", "viewer banner line 1");
  const b = lineEnd(once("                         versions at Glance, Explore and Detail, plus its note", "viewer banner line 2"));
  cutSpan(lineStart(a), b, "the viewer banner's #w= lines");
}

/* ------------------------------------------------- 5. the CSS */
{
  const a = idx(".cmpnote-root{", t.indexOf("<style>"), "cmpnote CSS start");
  let s = lineStart(a);
  /* take the comment directly above it, if it is one */
  const prev = lineStart(s - NL.length);
  if (t.slice(prev, s).indexOf("cmpnote") > -1 || t.slice(prev, s).indexOf("comparison") > -1) s = prev;
  const last = idx(".cmpnote-open{", a, "cmpnote CSS end");
  const cut = cutSpan(s, lineEnd(last), "the .cmpnote-* CSS");
  if ((cut.match(/cmpnote/g) || []).length < 7) throw new Error("the CSS cut looks too small");
}

/* ------------------------------------------------- 6. guards */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "");
["CMPNOTE_", "CMP_ROWS", "CMP_TIERS", "CMP_TIERLBL", "cmpCards", "cmpNoteContent", "cmpnote-mb", "cmpnote-root", '"cmp"']
  .forEach(n => { const c = codeOnly.split(n).length - 1; if (c) throw new Error("still referenced in code: " + n + " x" + c); });
if (codeOnly.indexOf("-mb") > -1) throw new Error("an -mb kind survives: " + JSON.stringify(codeOnly.match(/.{0,40}-mb.{0,20}/g).slice(0, 4)));
if (codeOnly.indexOf("viewOnlySelectHTML") < 0) throw new Error("the review viewer was damaged");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
/* the driver goes with it */
const drv = path.join(__dirname, "..", "cmp-dashboard.driver.js");
if (fs.existsSync(drv)) { fs.unlinkSync(drv); log.push("deleted _tools/cmp-dashboard.driver.js"); }
log.forEach(l => console.log("  " + l));
console.log("comparison tab retired; the review viewer is untouched");
