/* One-off, 2026-09-28: trim the W17 header (owner, annotated screenshot).

   "make the date picking be just the dates when selected, so it is smaller and
   fit better, remove the download button and finally remove remove gift and
   pledges in the glimpse version"

   1. THE DATE CHIP SHOWS ONLY THE DATES. It read "Gifts received through
      Aug 19, 2026", which at Explore pushed the chip row into the view toggle.
      The visible label is now "Aug 19, 2026", or "Jan 1 to Aug 19, 2026" for a
      windowed preset. The full sentence is KEPT in the aria-label and in the
      pop-up's own subtitle, so nothing is lost to a screen reader or to the
      reader of the ledger, where there is room for it.

   2. THE EXPORT BUTTON GOES from the header, with its handler. The drill's own
      export-donors button is a separate control further in and is left alone;
      it is reported to the owner rather than removed unasked.

   3. THE GLANCE DROPS ITS "Gifts and Pledges" CHIP. The card is already titled
      Gifts Pledges, so the chip repeated the title inside it and spent a line
      doing it. Glance is the one tier with no room to spare.
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
  log.push("edited: " + a0.slice(0, 56).replace(/\s+/g, " "));
}
function cutLine(needle, label) {
  const i = t.indexOf(needle);
  if (i < 0) throw new Error("anchor missing: " + label);
  if (t.indexOf(needle, i + 1) > -1) throw new Error("anchor ambiguous: " + label);
  const s = t.lastIndexOf(NL, i - 1) + NL.length, e = t.indexOf(NL, i) + NL.length;
  t = t.slice(0, s) + t.slice(e);
  log.push("removed line: " + label);
}

/* ------------------------------------------- 1. the short date label */
swap(`function gpFRangePhrase(w){`,
`/* The chip shows only the dates: the sentence around them is what pushed the
   chip row into the view toggle at Explore. gpFRangePhrase keeps the full
   sentence for the aria-label and for the pop-up subtitle. (28 Sep 2026) */
function gpFRangeShort(w){
  var b=gpFWindow(w),ed=gpFParse(b.end);
  var endTxt=GPF_MON[ed.getMonth()]+" "+ed.getDate()+", "+ed.getFullYear();
  if(!b.start)return endTxt;
  var sd=gpFParse(b.start);
  var st=GPF_MON[sd.getMonth()]+" "+sd.getDate();if(sd.getFullYear()!==ed.getFullYear())st+=", "+sd.getFullYear();
  return st+" to "+endTxt;
}
function gpFRangePhrase(w){`);
swap(`  var phrase=gpFRangePhrase(w);
  return '<button class="filter-chip gpf-datechip" data-gpf="range" data-id="'+w.id+'" aria-haspopup="dialog" aria-expanded="'+(GPF_POP&&GPF_POP.type==='range'&&GPF_POP.id===w.id?'true':'false')+'" aria-label="'+gpFEsc(phrase)+', tap to change the dates">'+spin+ICON('event')+'<span class="fc-label">'+phrase+'</span>'+ICON('expand_more')+'</button>';`,
`  var phrase=gpFRangePhrase(w),shown=gpFRangeShort(w);
  return '<button class="filter-chip gpf-datechip" data-gpf="range" data-id="'+w.id+'" aria-haspopup="dialog" aria-expanded="'+(GPF_POP&&GPF_POP.type==='range'&&GPF_POP.id===w.id?'true':'false')+'" aria-label="'+gpFEsc(phrase)+', tap to change the dates">'+spin+ICON('event')+'<span class="fc-label">'+shown+'</span>'+ICON('expand_more')+'</button>';`);

/* ------------------------------------------- 2. the export button goes */
{
  const a = t.indexOf("function gpFExportBtn(w){");
  if (a < 0) throw new Error("gpFExportBtn was not found");
  const s = t.lastIndexOf(NL, a - 1) + NL.length;
  const close = t.indexOf(NL + "}" + NL, a);
  if (close < 0) throw new Error("gpFExportBtn's closing brace was not found");
  const e = close + (NL + "}" + NL).length;
  const cut = t.slice(s, e);
  if (cut.indexOf('data-gpf="export"') < 0) throw new Error("the cut does not look like the export button");
  t = t.slice(0, s) + t.slice(e);
  log.push("cut gpFExportBtn (" + (cut.split(NL).length - 1) + " lines)");
}
swap(`  var toggle='<div class="dep-hd-toggle">'+gpFViewToggle(w)+gpFExportBtn(w)+'</div>';`,
     `  var toggle='<div class="dep-hd-toggle">'+gpFViewToggle(w)+'</div>';`);
swap(`  if(a==='export'){
    setStatus('Exporting '+(t.getAttribute('data-what')==='table'?'the purpose summary table':'purpose giving')+' to Excel (stub, no export backend in this shell).');
    return;
  }
`, ``);

/* ------------------------------------- 3. the Glance loses its title chip */
cutLine(`    '<span class="scope-chip" style="cursor:default"><span class="sc-nm">Gifts and Pledges</span></span>'+`,
        "the Glance scope chip repeating the card title");

/* ------------------------------------------------------------- guards */
if (t.indexOf("gpFExportBtn") > -1) throw new Error("gpFExportBtn still referenced");
if (t.indexOf(`data-gpf="export"`) > -1) throw new Error("the header export action survives");
if (t.indexOf(`<span class="sc-nm">Gifts and Pledges</span>`) > -1) throw new Error("the Glance chip survives");
if (t.indexOf("gpFRangeShort") < 0) throw new Error("the short label helper is missing");
if ((t.match(/gpFRangeShort/g) || []).length < 2) throw new Error("the short label helper is never called");
/* the full sentence must survive where there is room for it */
if (t.indexOf("Gifts received through") < 0) throw new Error("the full phrase was lost");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("W17 header: dates only, no export, no Glance title chip");
