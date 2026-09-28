/* One-off, 2026-09-28: the Summary Table opens the pop-up instead of expanding.

   Owner: "In the table view, instead of expanding the row it should be a pop up"

   A table row opened an inline donor drill below itself: the purpose's pledges
   at twenty to a page, with a pager and its own export. It is replaced by the
   giving ledger, the same pop-up the Giving bars open, so a purpose behaves the
   same way wherever it is selected and there is one place that answers "what is
   behind this".

   That retires the whole inline drill. Removed here rather than left defined:
   gpFDonorPanel, gpFDonorHead, gpFDonorRowHTML, gpFPager, GPF_PAGE_SIZE, the
   open, ppage and export-donors handlers, and the per-row gpFExp / gpFPage
   state with it. The ledger's own row expansion (gpFPlExp) is untouched.

   The drill's export-donors button goes with it, which answers the question
   left open when the header export was removed: there is no export stub left
   on this widget.

   gpFDonorRows and gpFDonorPace STAY. They are the model layer the ledger's
   pledge rows and the purpose roll-up are built on, and the driver uses them to
   cross-check the ledger against the pace arithmetic.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a0.slice(0, 68));
  t = t.split(a).join(b);
  log.push("edited: " + a0.slice(0, 54).replace(/\s+/g, " "));
}
function cutFn(name) {
  const re = new RegExp("(^|[\\r\\n])function " + name + "\\s*\\(");
  const m = re.exec(t);
  if (!m) throw new Error("no definition for " + name);
  const start = m.index + (m[1] ? m[1].length : 0);
  let i = t.indexOf("{", start), depth = 0;
  for (; i < t.length; i++) {
    if (t[i] === "{") depth++;
    else if (t[i] === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  let end = t.indexOf(NL, i);
  end = end < 0 ? t.length : end + NL.length;
  const cut = t.slice(start, end);
  t = t.slice(0, start) + t.slice(end);
  log.push("cut " + name + " (" + (cut.split(NL).length - 1) + " lines)");
}

/* ================================ 1. the row opens the ledger */
swap(`function gpFSummaryRow(w,r){
  var exp=!!(w.gpFExp&&w.gpFExp[r.label]);
  var badge=r.closed?'<span class="gpf-closed">Closed</span>':'';`,
`/* A row opens the giving ledger, the same pop-up the Giving bars open, so a
   purpose behaves the same way wherever it is selected. It used to expand an
   inline donor drill below itself; the owner replaced that on 28 Sep 2026. */
function gpFSummaryRow(w,r){
  var badge=r.closed?'<span class="gpf-closed">Closed</span>':'';`);
swap(`", percent due "+gpFPct(r.percentDue)+". "+(exp?'Hide':'Show')+" the donor pledg`,
     `", percent due "+gpFPct(r.percentDue)+". Open every gift and pledge behind this purpos`);
swap(`  return '<div class="wt-row gpf-trow gpf-clickable gpf-sumrow'+(exp?' is-exp':'')+'" data-gpf="open" data-id="'+w.id+'" data-c="'+gpFEsc(r.label)+'" role="button" tabindex="0" aria-expanded="'+exp+'" aria-label="'+gpFEsc(sr)+'">'+`,
     `  return '<div class="wt-row gpf-trow gpf-clickable gpf-sumrow" data-gpf="baropen" data-id="'+w.id+'" data-c="'+gpFEsc(r.label)+'" role="button" tabindex="0" aria-haspopup="dialog" aria-label="'+gpFEsc(sr)+'">'+`);
swap(`  var body=rows.map(function(r){
    var h=gpFSummaryRow(w,r);
    if(w.gpFExp&&w.gpFExp[r.label])h+=gpFDonorPanel(w,r);
    return h;
  }).join("");`,
`  var body=rows.map(function(r){return gpFSummaryRow(w,r);}).join("");`);

/* ================================ 2. the inline drill is retired */
/* gpFDonorRows goes too: the drill was its only caller, so keeping it would be
   product code alive only because a test calls it. The driver derives the same
   list from gpFDonorsFor and gpFDonorPace, both of which the ledger uses. */
["gpFDonorPanel", "gpFDonorHead", "gpFDonorRowHTML", "gpFPager", "gpFDonorRows"].forEach(cutFn);
{
  const re = /(^|[\r\n])var GPF_PAGE_SIZE=[^;]*;[^\r\n]*(\r\n)?/;
  const m = re.exec(t);
  if (!m) throw new Error("GPF_PAGE_SIZE was not found");
  t = t.slice(0, m.index + (m[1] ? m[1].length : 0)) + t.slice(m.index + m[0].length);
  log.push("cut GPF_PAGE_SIZE");
}
swap(`  if(a==='export-donors'){setStatus('Exporting the donor pledges for '+t.getAttribute('data-c')+' to Excel (stub, no export backend in this shell).');return;}
`, ``);
swap(`  if(a==='open'){
    if(!w)return;
    var oc=t.getAttribute('data-c');
    w.gpFExp=w.gpFExp||{};w.gpFPage=w.gpFPage||{};
    var willOpen=!w.gpFExp[oc];w.gpFExp[oc]=willOpen;
    if(willOpen&&!w.gpFPage[oc])w.gpFPage[oc]=1;
    gpFClosePop();render();return;
  }
`, ``);
swap(`  if(a==='ppage'){if(!w)return;var pn=+t.getAttribute('data-p');if(pn>=1){w.gpFPage=w.gpFPage||{};w.gpFPage[t.getAttribute('data-c')]=pn;render();}return;}
`, ``);

/* the keyboard path listed the retired actions */
{
  const re = /\(ga==='open'\|\|ga==='baropen'\|\|ga==='gopen'\)/;
  if (!re.test(t)) throw new Error("the keydown action list was not found");
  t = t.replace(re, "(ga==='baropen'||ga==='gopen')");
  log.push("edited: the keyboard path no longer lists the retired expand action");
}

/* changing the purpose filter cleared the retired state too */
swap(`  if(a==='set-camp'){if(!w)return;w.gpFCamp=t.getAttribute('data-v');w.gpFExp={};w.gpFPage={};w.gpFPlExp={};gpFClosePop();gpFLoad(w);render();return;}`,
     `  if(a==='set-camp'){if(!w)return;w.gpFCamp=t.getAttribute('data-v');w.gpFPlExp={};gpFClosePop();gpFLoad(w);render();return;}`);

/* the block banner lists the per-widget state keys */
swap(`   gpFRange / gpFStart / gpFEnd / gpFLoading / gpFExp / gpFPage /`,
     `   gpFRange / gpFStart / gpFEnd / gpFLoading /`);

/* the per-row expand state leaves the registry rows */
{
  const n = (t.match(/gpFExp:\{\},gpFPage:\{\},/g) || []).length;
  if (n < 1) throw new Error("the registry state keys were not found");
  t = t.split("gpFExp:{},gpFPage:{},").join("");
  log.push("removed gpFExp and gpFPage from " + n + " registry row(s)");
}

/* ================================ 3. guards */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "");
/* JS names only. The drill's CSS (the pager, the drill wrapper and the donor
   row) is now orphaned, and the orphan sweep computes that for itself rather
   than being handed a list here: run build-clean-d-inert after this. */
["gpFDonorPanel", "gpFDonorHead", "gpFDonorRowHTML", "gpFPager", "GPF_PAGE_SIZE",
  "gpFExp", "gpFPage", "export-donors", "'ppage'", "gpFDonorRows"].forEach(n => {
    const c = codeOnly.split(n).length - 1;
    if (c) throw new Error("still present in code: " + n + " x" + c);
  });
/* the model layer the ledger needs must survive */
["gpFDonorsFor", "gpFDonorPace", "gpFDonorChip", "gpFPlExp", "gpFGiftPanel", "gpFPledgeHistory"].forEach(n => {
  if (codeOnly.split(n).length - 1 < 2) throw new Error("wrongly removed: " + n);
});
if (codeOnly.indexOf('data-gpf="open"') > -1) throw new Error("a row still carries the expand action");
if ((t.match(/data-gpf="baropen"/g) || []).length < 2) throw new Error("the table row does not open the pop-up");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("the Summary Table opens the giving ledger; the inline drill is retired");
