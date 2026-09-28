/* One-off, 2026-09-28, Phase B of the W17 rebuild. Presentation layer: the headline becomes
   Received split into pledge payments and other gifts, the bar carries the two tones, the table
   keeps the legacy panel's six columns and shows the split in its sub-line, the date presets
   arrive, and the retired goal panel and donut are removed. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8"); const log = [];
function replaceFn(name, next) {
  const head = "function " + name + "(";
  const i = t.indexOf(head); if (i < 0) throw new Error("function missing: " + name);
  if (t.indexOf(head, i + 1) > -1) throw new Error("function ambiguous: " + name);
  let d = 0, end = -1;
  for (let k = t.indexOf("{", i); k < t.length; k++) { if (t[k] === "{") d++; else if (t[k] === "}") { d--; if (!d) { end = k + 1; break; } } }
  if (end < 0) throw new Error("unterminated: " + name);
  t = t.slice(0, i) + next + t.slice(end); log.push("replaced fn: " + name);
}
function deleteFn(name) {
  const head = "function " + name + "(";
  const i = t.indexOf(head); if (i < 0) throw new Error("function missing: " + name);
  let d = 0, end = -1;
  for (let k = t.indexOf("{", i); k < t.length; k++) { if (t[k] === "{") d++; else if (t[k] === "}") { d--; if (!d) { end = k + 1; break; } } }
  let s = i; const nl = t.lastIndexOf(NL, i); if (nl > -1) s = nl + NL.length;
  while (t.slice(end, end + NL.length) === NL) end += NL.length;
  t = t.slice(0, s) + t.slice(end); log.push("deleted fn: " + name);
}
function swap(a, b, label) { const n = t.split(a).length - 1; if (n !== 1) throw new Error("anchor x" + n + ": " + label); t = t.replace(a, b); log.push("edited: " + label); }

/* ---------- 1. the split read, used by the headline, the glance and the bars ---------- */
swap("function gpFHeaderBlock(w,mode){",
  ["/* The split sentence every size shows: what arrived, and how much of it was pledge money. */",
   "function gpFSplitLine(r){",
   "  if(!(r.received>0))return 'Nothing received in this window';",
   "  if(!(r.fromPledges>0))return gpFMoney0(r.other)+' from gifts, none against a pledge';",
   "  if(!(r.other>0))return gpFMoney0(r.fromPledges)+' all from pledge payments';",
   "  return gpFMoney0(r.fromPledges)+' from pledges, '+gpFMoney0(r.other)+' from other gifts';",
   "}",
   "/* Two-tone bar: pledge payments then other gifts, both against what was pledged. Widths are",
   "   shares of the pledged amount, so an over-funded purpose fills the track and the overspill is",
   "   stated in text rather than drawn. */",
   "function gpFSplitBar(r,small){",
   "  var base=r.pledgeTotal>0?r.pledgeTotal:r.received;",
   "  var p=base>0?Math.max(0,Math.min(100,r.fromPledges/base*100)):0;",
   "  var o=base>0?Math.max(0,Math.min(100-p,r.other/base*100)):0;",
   "  return '<div class=\"gft-track'+(small?' gft-track-sm':'')+'\">'+",
   "    '<span class=\"gft-fill gpf-seg-pledge\" style=\"width:'+p.toFixed(1)+'%\"></span>'+",
   "    '<span class=\"gft-fill gpf-seg-other\" style=\"width:'+o.toFixed(1)+'%;left:'+p.toFixed(1)+'%\"></span>'+",
   "  '</div>';",
   "}",
   "function gpFHeaderBlock(w,mode){"].join(NL), "split line and two-tone bar helpers");

/* ---------- 2. headline ---------- */
swap("  var pill=(t.progress==null)?'':('<span class=\"gpf-pill\" style=\"background:'+gpFGoalColor(t.gstatus)+'\">'+ICON(t.gstatus==='green'?'check_circle':'flag')+gpFPct(t.progress)+' of goal</span>');" + NL +
     "  var num='<div class=\"dep-hd-kpigrp\"><span class=\"metric-value\">'+gpFMoney0(t.received)+'</span>'+pill+'<span class=\"gft-goalpill\">received of '+gpFMoney0(t.goal)+' goal</span></div>';",
  ["  var lbl=gpFStatusLabelRow(t.status),col=gpFStatusColor(t.status);",
   "  var pill=(t.pledgeTotal>0)?('<span class=\"gpf-pill\" style=\"background:'+col+'\">'+ICON(t.status==='funded'?'check_circle':'flag')+gpFPct(t.fulfilled)+' of '+gpFMoney0(t.pledgeTotal)+' pledged</span>'):'';",
   "  var num='<div class=\"dep-hd-kpigrp\"><span class=\"metric-value\">'+gpFMoney0(t.received)+'</span>'+pill+'<span class=\"gft-goalpill\">'+gpFSplitLine(t)+'</span></div>';"].join(NL),
  "headline: received, fulfilment of what was pledged, and the split");
swap("    '<span class=\"sr-only\">'+gpFMoney0(t.received)+' received against a '+gpFMoney0(t.goal)+' goal across '+t.count+' purpose'+(t.count===1?'':'s')+', '+gpFPct(t.progress)+' of goal, '+gpFGoalLabel(t.gstatus)+'.</span></div></div>';",
     "    '<span class=\"sr-only\">'+gpFMoney0(t.received)+' received across '+t.count+' purpose'+(t.count===1?'':'s')+'. '+gpFSplitLine(t)+'. '+gpFMoney0(t.pledgeTotal)+' pledged, '+gpFPct(t.fulfilled)+' fulfilled. '+lbl+'.</span></div></div>';",
     "headline: spoken text");

/* ---------- 3. glance ---------- */
replaceFn("gpFGlance",
  ["function gpFGlance(w){",
   "  var t=gpFTotals(w),lbl=gpFStatusLabelRow(t.status),col=gpFStatusColor(t.status);",
   "  var pill=(t.pledgeTotal>0)?('<span class=\"gpf-pill\" style=\"background:'+col+'\">'+ICON(t.status==='funded'?'check_circle':'flag')+gpFPct(t.fulfilled)+'</span><span class=\"gft-goalpill\">of '+gpFMoney0(t.pledgeTotal)+' pledged</span>')",
   "    :'<span class=\"gft-goalpill\">no pledges in this window</span>';",
   "  return '<div class=\"kpi-row\"><div class=\"kpi-num\">'+",
   "    '<span class=\"scope-chip\" style=\"cursor:default\"><span class=\"sc-nm\">Gifts and Pledges</span></span>'+",
   "    '<div class=\"metric-value\">'+gpFMoney0(t.received)+'</div>'+",
   "    '<div class=\"gl-sub\">'+pill+'</div>'+",
   "    '<div class=\"gft-glance-read\">'+gpFSplitBar(t,true)+",
   "      '<span class=\"gft-glance-cap'+(t.status==='funded'?' gft-cap-ok':'')+'\">'+gpFSplitLine(t)+'</span></div>'+",
   "    '<span class=\"sr-only\">'+gpFMoney0(t.received)+' received across '+t.count+' purpose'+(t.count===1?'':'s')+'. '+gpFSplitLine(t)+'. '+lbl+'.</span>'+",
   "  '</div></div>';",
   "}",
   ""].join(NL));

/* ---------- 4. the bars ---------- */
replaceFn("gpFGoalBars",
  ["/* One bar per purpose, most received first, inside her .gft-bars scroll container. The fill is",
   "   two segments: pledge payments, then other gifts, both measured against what was pledged.",
   "   Selecting a bar opens the giving ledger for that purpose. Values live in the DOM. */",
   "function gpFGivingBars(w){",
   "  var rows=gpFPurposeCompute(w).slice();",
   "  if(!rows.length)return '<div class=\"gft-zeroline\">'+ICON(\"info\")+'No gift or pledge purposes match this selection.</div>';",
   "  rows.sort(function(a,b){return b.received-a.received;});",
   "  var body=rows.map(function(r){",
   "    var col=gpFStatusColor(r.status),lbl=gpFStatusLabelRow(r.status);",
   "    var pctTxt=(r.pledgeTotal>0)?gpFPct(r.fulfilled):'gifts only';",
   "    var target=(r.pledgeTotal>0)?(' of '+gpFMoney0(r.pledgeTotal)+' pledged'):'';",
   "    var sr=r.label+', '+gpFMoney0(r.received)+' received'+target+'. '+gpFSplitLine(r)+'. '+lbl+'.';",
   "    return '<div class=\"gft-prow gft-clickable\" data-gpf=\"baropen\" data-id=\"'+w.id+'\" data-c=\"'+gpFEsc(r.label)+'\" role=\"button\" tabindex=\"0\" aria-haspopup=\"dialog\" aria-label=\"'+gpFEsc(sr+' Open every gift and pledge behind this purpose.')+'\">'+",
   "      '<div class=\"gft-prow-top\"><span class=\"gft-p-nm\">'+r.label+(r.closed?'<span class=\"gpf-closed\">Closed</span>':'')+'</span><span class=\"gft-p-pct\" style=\"color:'+col+'\">'+pctTxt+'</span></div>'+",
   "      gpFSplitBar(r)+",
   "      '<div class=\"gft-prow-foot\"><span class=\"gft-p-amt\">'+gpFMoney0(r.received)+' received'+target+'</span>'+",
   "        '<span class=\"gpf-split\">'+gpFSplitLine(r)+'</span></div>'+",
   "      '<span class=\"sr-only\">'+gpFEsc(sr)+'</span>'+",
   "    '</div>';",
   "  }).join('');",
   "  var t=gpFTotals(w);",
   "  var legend='<div class=\"gft-bars-legend gpf-legend\">'+",
   "    '<span class=\"gpf-lg-i\"><span class=\"gpf-lg-sw gpf-seg-pledge\"></span>Pledge payments<b class=\"gpf-lg-n\">'+gpFMoney0(t.fromPledges)+'</b></span>'+",
   "    '<span class=\"gpf-lg-i\"><span class=\"gpf-lg-sw gpf-seg-other\"></span>Other gifts<b class=\"gpf-lg-n\">'+gpFMoney0(t.other)+'</b></span>'+",
   "    '<span class=\"gpf-lg-i gpf-lg-rem\">Still to arrive against pledges: <b>'+gpFMoney0(Math.max(0,t.pledgeTotal-t.fromPledges))+'</b></span>'+",
   "  '</div>';",
   "  var cap='<div class=\"gft-ctx gpf-cap\">'+ICON(\"volunteer_activism\")+'<span>What each purpose has received, most received first. The bar shows pledge payments and other gifts separately. Select one to see every gift and pledge behind it.</span></div>';",
   "  return '<div class=\"gpf-goalwrap\">'+cap+'<div class=\"gft-bars gpf-barscroll\">'+body+'</div>'+legend+'</div>';",
   "}",
   "function gpFGoalBars(w){return gpFGivingBars(w);}",
   ""].join(NL));

/* ---------- 5. the table keeps the panel's columns, sub-line carries the split ---------- */
swap("  var sub=gpFMoney0(r.received)+' received of '+gpFMoney0(r.goal)+' goal ('+gpFPct(r.progress)+')';",
     "  var sub=gpFSplitLine(r)+((r.pledgeTotal>0)?(' \\u00b7 '+gpFPct(r.fulfilled)+' of pledged'):'');",
     "table sub-line carries the split");

/* ---------- 6. date presets ---------- */
replaceFn("gpFRangeChip",
  ["function gpFRangeChip(w){",
   "  var spin=w.gpFLoading?'<span class=\"bgt-spin\" aria-hidden=\"true\"></span>':'';",
   "  var phrase=gpFRangePhrase(w);",
   "  return '<button class=\"filter-chip gft-datechip\" data-gpf=\"range\" data-id=\"'+w.id+'\" aria-haspopup=\"dialog\" aria-expanded=\"'+(GPF_POP&&GPF_POP.type==='range'&&GPF_POP.id===w.id?'true':'false')+'\" aria-label=\"'+gpFEsc(phrase)+', tap to change the dates\">'+spin+ICON('event')+'<span class=\"fc-label\">'+phrase+'</span>'+ICON('expand_more')+'</button>';",
   "}",
   "var GPF_RANGES=[",
   "  ['thru','Gifts received through','Every gift up to the date, and the full pledge amounts. This is the shipped widget\\u2019s own basis, so the figures reconcile with it.'],",
   "  ['ytd','Year to date','1 January to today. Pledged becomes the instalments scheduled this year.'],",
   "  ['quarter','This quarter','The current quarter to today, on the same rule.'],",
   "  ['month','This month','The current month to today, on the same rule.'],",
   "  ['custom','Custom dates','Choose your own start and end.']",
   "];",
   ""].join(NL));

/* ---------- 7. retire the goal panel and the donut ---------- */
deleteFn("gpFGoalPanel");
deleteFn("gpFDonut");

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); log.forEach(function (l) { console.log(l); });
console.log("done: " + t.split(NL).length + " lines");
