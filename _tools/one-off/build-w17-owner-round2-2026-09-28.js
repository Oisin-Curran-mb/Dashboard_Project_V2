/* One-off, 2026-09-28: the owner's seven changes after seeing the split build.

   1. "Pledges and gift needs to drop to line below, and keep giving and summary table into
      corner as it was before."
   2. "Change to show the dark blue how much pledges got, and then in the middle the white agg
      of how much more is expected, and light-blue what is extra for the gift as part of the
      total but more separate of the total."
   3. "What below of the purpose giving bars to be: total given to a purpose, how much from
      pledges, how much from gifts, and then how much more is expected."
   4. "The percentage number should go and just show how much has currently been given to a
      purpose."
   5. "The line under the table needs to be on the last line so there is not white space at
      the bottom."
   6. "In the gift table Last gift column can be removed."
   7. "The gifts table needs to have header centre aligned and content left aligned."

   NOTES ON TWO OF THEM.

   (2) The bar changes what it measures. It was: pledge payments then gifts, both as shares of
   the pledge, with the track's grey showing whatever was unfunded. It is now three named
   segments that fill the track, in the order the owner drew them: pledge payments, then the
   white still-expected gap, then the gifts that sit beyond the pledge. The scale is
   max(pledged, paid) + gifts, so an over-paid pledge (Mission Trip, $41,000 against $40,000)
   cannot push the segments past the end of the track.

   (5) The 10px of white below the last line is `.wcontent{padding-bottom:10px}`, which is the
   shell's own card padding and is shared by all seventeen widgets, so it is not touched. It is
   cancelled inside THIS block only, on the two tiers that have a last line to pin: the table's
   totals row and the Giving legend.

   (7) This is an owner override of D12, which says nothing is centred and counts sit right.
   The header and body cells keep the SAME width classes, so the columns still line up; only
   the alignment differs, which is what was asked for.
*/
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0, why) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + (why || a0.slice(0, 64)));
  t = t.split(a).join(b);
  log.push("  " + (why || a0.slice(0, 52).replace(/\s+/g, " ")));
}

/* ---- 1. the view toggle goes back to the corner alone; the table toggle takes the next line ---- */
swap(
  `  var toggle='<div class="dep-hd-toggle"><div class="gpf-toggles">'+gpFViewToggle(w)+((gpFView(w)==="table"&&mode!=="loading")?gpFTableToggle(w):'')+'</div></div>';
  var top='<div class="dep-hd-top"><div class="gpf-ctlrow">'+gpFCampChip(w)+gpFRangeChip(w)+'</div>'+toggle+'</div>';`,
  `  var toggle='<div class="dep-hd-toggle">'+gpFViewToggle(w)+'</div>';
  /* The Pledges / Gifts toggle takes its own line under the view toggle, which keeps the
     corner as it was (owner, 28 Sep). It is there only while the table view is up. */
  var tblrow=(gpFView(w)==="table"&&mode!=="loading")?('<div class="gpf-tblrow">'+gpFTableToggle(w)+'</div>'):'';
  var top='<div class="dep-hd-top"><div class="gpf-ctlrow">'+gpFCampChip(w)+gpFRangeChip(w)+'</div>'+toggle+'</div>'+tblrow;`,
  "the table toggle drops to its own line");

swap(
  `  return '<div class="vtoggle gpf-tbltoggle" role="group" aria-label="Table">'+`,
  `  return '<div class="vtoggle" role="group" aria-label="Table">'+`,
  "and loses the class that only positioned it");

/* ---- 2. the bar: pledge payments, the white gap still expected, then the gifts beyond ---- */
swap(
  `function gpFSplitBar(r,small){
  var base=r.pledgeTotal>0?r.pledgeTotal:r.totalIn;
  var p=base>0?Math.max(0,Math.min(100,r.fromPledges/base*100)):0;
  var o=base>0?Math.max(0,Math.min(100-p,r.other/base*100)):0;
  return '<div class="gpf-track'+(small?' gpf-track-sm':'')+'">'+
    '<span class="gpf-fill gpf-seg-pledge" style="width:'+p.toFixed(1)+'%" data-tip="'+gpFEsc('Pledge payments: '+gpFMoney0(r.fromPledges))+'" data-tip-plain></span>'+
    '<span class="gpf-fill gpf-seg-other" style="width:'+o.toFixed(1)+'%;left:'+p.toFixed(1)+'%" data-tip="'+gpFEsc('Gifts: '+gpFMoney0(r.other))+'" data-tip-plain></span>'+
  '</div>';
}`,
  `/* Three segments, in the order the owner drew them: what the pledges have brought in, the
   white gap of what is still expected against them, and the gifts that sit beyond the pledge
   as part of the total but separate from it. The scale is the larger of pledged and paid, plus
   the gifts, so an over-paid pledge cannot run off the end of the track. */
function gpFStillExpected(r){return Math.max(0,r.pledgeTotal-r.fromPledges);}
function gpFSplitBar(r,small){
  var paid=Math.max(0,r.fromPledges),gifts=Math.max(0,r.other),exp=gpFStillExpected(r);
  var base=Math.max(r.pledgeTotal,paid)+gifts;
  var p=base>0?paid/base*100:0,e=base>0?exp/base*100:0,g=base>0?gifts/base*100:0;
  return '<div class="gpf-track'+(small?' gpf-track-sm':'')+'">'+
    '<span class="gpf-fill gpf-seg-pledge" style="width:'+p.toFixed(1)+'%" data-tip="'+gpFEsc('Pledge payments: '+gpFMoney0(paid))+'" data-tip-plain></span>'+
    '<span class="gpf-fill gpf-seg-exp" style="width:'+e.toFixed(1)+'%;left:'+p.toFixed(1)+'%" data-tip="'+gpFEsc('Still expected: '+gpFMoney0(exp))+'" data-tip-plain></span>'+
    '<span class="gpf-fill gpf-seg-other" style="width:'+g.toFixed(1)+'%;left:'+(p+e).toFixed(1)+'%" data-tip="'+gpFEsc('Gifts: '+gpFMoney0(gifts))+'" data-tip-plain></span>'+
  '</div>';
}`,
  "the bar takes three segments");

/* ---- 3 and 4. the row's own figures: the amount given, and the four-part line under it ---- */
swap(
  `    var col=gpFStatusColor(r.status),lbl=gpFStatusLabelRow(r.status);
    /* The percent measures the DARK segment against the track: pledge payments over the
       amount pledged. It is not the whole purpose's giving over the pledge, which is what
       the foot line states, so it says "paid" and carries the arithmetic in its tooltip. */
    var pctTxt=(r.pledgeTotal>0)?(r.windowed?'':(gpFPct(r.fulfilled)+' paid')):'gifts only';
    var pctTip=(r.pledgeTotal>0&&!r.windowed)?(gpFMoney0(r.fromPledgesThru)+' paid against '+gpFMoney0(r.pledgeTotal)+' pledged. Gifts with no pledge behind them count in the total, not here.'):'';
    var target=(r.pledgeTotal>0)?(' of '+gpFMoney0(r.pledgeTotal)+' pledged'):'';
    var sr=r.label+', '+gpFMoney0(r.totalIn)+' received'+target+'. '+gpFSplitLine(r)+'.'+(pctTip?(' '+pctTip):'')+' '+lbl+'.';`,
  `    var col=gpFStatusColor(r.status),lbl=gpFStatusLabelRow(r.status);
    /* No percentage: the row states the money given, and the line under it accounts for it
       (owner, 28 Sep). A share of a pledge was a second basis on a bar that now carries
       three. */
    var given=gpFMoney0(r.totalIn);
    var sr=r.label+', '+given+' given. '+gpFBarFoot(r)+' '+lbl+'.';`,
  "the row states the money given, not a percentage");

swap(
  `      '<div class="gpf-prow-top"><span class="gpf-p-nm">'+r.label+(r.closed?'<span class="gpf-closed">Closed</span>':'')+'</span><span class="gpf-p-pct" style="color:'+col+'"'+(pctTip?(' data-tip="'+gpFEsc(pctTip)+'" data-tip-plain'):'')+'>'+pctTxt+'</span></div>'+
      gpFSplitBar(r)+
      '<div class="gpf-prow-foot"><span class="gpf-p-amt">'+gpFMoney0(r.totalIn)+' received'+target+'</span>'+
        '<span class="gpf-split">'+gpFSplitLine(r)+'</span></div>'+`,
  `      '<div class="gpf-prow-top"><span class="gpf-p-nm">'+r.label+(r.closed?'<span class="gpf-closed">Closed</span>':'')+'</span><span class="gpf-p-pct" style="color:'+col+'">'+given+'</span></div>'+
      gpFSplitBar(r)+
      '<div class="gpf-prow-foot"><span class="gpf-split">'+gpFBarFoot(r)+'</span></div>'+`,
  "and the foot line replaces the old pair");

swap(
  `function gpFSplitLine(r){`,
  `/* The line under a bar, in the order the owner listed it: the total given to the purpose,
   then where it came from, then what is still expected against the pledges. A purpose with no
   pledge says so instead of showing a zero. */
function gpFBarFoot(r){
  var parts=[gpFMoney0(r.totalIn)+' given'];
  if(r.fromPledges>0)parts.push(gpFMoney0(r.fromPledges)+' from pledges');
  if(r.other>0)parts.push(gpFMoney0(r.other)+' from gifts');
  if(r.pledgeTotal>0)parts.push(gpFMoney0(gpFStillExpected(r))+' still expected');
  else parts.push('no pledge on this purpose');
  return parts.join(' \\u00b7 ');
}
function gpFSplitLine(r){`,
  "gpFBarFoot: given, from pledges, from gifts, still expected");

/* the legend names the three segments it now draws */
swap(
  `    '<span class="gpf-lg-i"><span class="gpf-lg-sw gpf-seg-pledge"></span>Pledge payments<b class="gpf-lg-n">'+gpFMoney0(t.fromPledges)+'</b></span>'+
    '<span class="gpf-lg-i"><span class="gpf-lg-sw gpf-seg-other"></span>Gifts<b class="gpf-lg-n">'+gpFMoney0(t.other)+'</b></span>'+
    '<span class="gpf-lg-i gpf-lg-rem">Still to arrive against pledges: <b>'+gpFMoney0(Math.max(0,t.pledgeTotal-t.fromPledges))+'</b></span>'+`,
  `    '<span class="gpf-lg-i"><span class="gpf-lg-sw gpf-seg-pledge"></span>Pledge payments<b class="gpf-lg-n">'+gpFMoney0(t.fromPledges)+'</b></span>'+
    '<span class="gpf-lg-i"><span class="gpf-lg-sw gpf-seg-exp"></span>Still expected<b class="gpf-lg-n">'+gpFMoney0(gpFStillExpected(t))+'</b></span>'+
    '<span class="gpf-lg-i"><span class="gpf-lg-sw gpf-seg-other"></span>Gifts<b class="gpf-lg-n">'+gpFMoney0(t.other)+'</b></span>'+`,
  "the legend names all three segments");

/* ---- 6 and 7. the Gifts table: no Last gift, header centred, body left ---- */
swap(
  `function gpFGiftsHead(){
  return '<div class="wt-row wt-head gpf-trow">'+
    '<span class="gpf-c-nm">Purpose</span>'+
    '<span class="gpf-c-n">Gifts</span>'+
    '<span class="gpf-c-n">Donors</span>'+
    '<span class="gpf-c-n gpf-c-dt">Last gift</span>'+
    '<span class="gpf-c-n">Total</span>'+
  '</div>';
}`,
  `/* Header centred, body left, on the owner's instruction of 28 Sep. The width classes are
   the same on both, so the columns line up; only the alignment differs. */
function gpFGiftsHead(){
  return '<div class="wt-row wt-head gpf-trow">'+
    '<span class="gpf-c-nm gpf-c-ctr">Purpose</span>'+
    '<span class="gpf-c-n gpf-c-ctr">Gifts</span>'+
    '<span class="gpf-c-n gpf-c-ctr">Donors</span>'+
    '<span class="gpf-c-n gpf-c-ctr">Total</span>'+
  '</div>';
}`,
  "the Gifts header: no Last gift, centred");

swap(
  `    '<span class="gpf-c-n">'+r.giftN+'</span>'+
    '<span class="gpf-c-n">'+r.giftDonors+'</span>'+
    '<span class="gpf-c-n gpf-c-dt">'+gpFFmtDate(r.lastGift)+'</span>'+
    '<span class="gpf-c-n">'+gpFMoney(r.other)+'</span>'+`,
  `    '<span class="gpf-c-n gpf-c-lft">'+r.giftN+'</span>'+
    '<span class="gpf-c-n gpf-c-lft">'+r.giftDonors+'</span>'+
    '<span class="gpf-c-n gpf-c-lft">'+gpFMoney(r.other)+'</span>'+`,
  "the Gifts row: no Last gift, left aligned");

swap(
  `    '<span class="gpf-c-n">'+t.giftN+'</span>'+
    '<span class="gpf-c-n">'+t.giftDonors+'</span>'+
    '<span class="gpf-c-n gpf-c-dt">'+gpFFmtDate(t.lastGift)+'</span>'+
    '<span class="gpf-c-n">'+gpFMoney(t.other)+'</span>'+`,
  `    '<span class="gpf-c-n gpf-c-lft">'+t.giftN+'</span>'+
    '<span class="gpf-c-n gpf-c-lft">'+t.giftDonors+'</span>'+
    '<span class="gpf-c-n gpf-c-lft">'+gpFMoney(t.other)+'</span>'+`,
  "and its totals row follows");

/* The date leaves the row's screen-reader line too: a figure read aloud that no sighted
   reader can see is its own defect. With nothing left reading it, the field goes from the
   model rather than sitting there as data kept alive by a test. */
swap(
  `  var sr=r.label+', '+r.giftN+' gift'+(r.giftN===1?'':'s')+' with no pledge, from '+r.giftDonors+' donor'+(r.giftDonors===1?'':'s')+', last on '+gpFFmtDate(r.lastGift)+', '+gpFMoney(r.other)+' in total. Open every gift and pledge behind this purpose.';`,
  `  var sr=r.label+', '+r.giftN+' gift'+(r.giftN===1?'':'s')+' with no pledge, from '+r.giftDonors+' donor'+(r.giftDonors===1?'':'s')+', '+gpFMoney(r.other)+' in total. Open every gift and pledge behind this purpose.';`,
  "the Gifts row's screen-reader line drops the date as well");

swap(
  `    var other=0,giftN=0,lastGift=null,donors={},donorN=0;
    gpFOtherGiftsFor(p).forEach(function(g){
      if(!gpFCounts(g,win))return;
      other+=g.amount;giftN++;
      if(!lastGift||g.date>lastGift)lastGift=g.date;
      if(!donors[g.donor]){donors[g.donor]=1;donorN++;}
    });`,
  `    var other=0,giftN=0,donors={},donorN=0;
    gpFOtherGiftsFor(p).forEach(function(g){
      if(!gpFCounts(g,win))return;
      other+=g.amount;giftN++;
      if(!donors[g.donor]){donors[g.donor]=1;donorN++;}
    });`,
  "the model stops tracking the last gift date");

swap(
  `      other:other,totalIn:totalIn,giftN:giftN,giftDonors:donorN,giftDonorList:Object.keys(donors),lastGift:lastGift,`,
  `      other:other,totalIn:totalIn,giftN:giftN,giftDonors:donorN,giftDonorList:Object.keys(donors),`,
  "and stops carrying it on the row");

swap(
  `  var pt=0,pd=0,fp=0,fpt=0,ot=0,ti=0,gn=0,dset={},dn=0,last=null;
  rows.forEach(function(r){
    pt+=r.pledgeTotal;pd+=r.pledgeDue;fp+=r.fromPledges;fpt+=r.fromPledgesThru;
    ot+=r.other;ti+=r.totalIn;gn+=r.giftN;
    if(r.lastGift&&(!last||r.lastGift>last))last=r.lastGift;
    (r.giftDonorList||[]).forEach(function(d){if(!dset[d]){dset[d]=1;dn++;}});
  });`,
  `  var pt=0,pd=0,fp=0,fpt=0,ot=0,ti=0,gn=0,dset={},dn=0;
  rows.forEach(function(r){
    pt+=r.pledgeTotal;pd+=r.pledgeDue;fp+=r.fromPledges;fpt+=r.fromPledgesThru;
    ot+=r.other;ti+=r.totalIn;gn+=r.giftN;
    (r.giftDonorList||[]).forEach(function(d){if(!dset[d]){dset[d]=1;dn++;}});
  });`,
  "nor the totals");

swap(
  `    giftN:gn,giftDonors:dn,lastGift:last,dueRem:Math.round((pd-fpt)*100)/100,`,
  `    giftN:gn,giftDonors:dn,dueRem:Math.round((pd-fpt)*100)/100,`,
  "nor the totals object");

/* ---- 5 and the CSS the rest of this needs ---- */
swap(
  `    /* The header's right-hand cluster holds the view toggle and, in the table view, the
       Pledges / Gifts toggle. Both are her .vtoggle; this only lays them out. */
    .gpf-root .gpf-toggles{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;}
    /* The Pledges / Gifts toggle keeps its width when the two share the row. */
    .gpf-root .gpf-tbltoggle{flex:0 0 auto;}
    /* A date sits in a wider slot than a money figure and reads from the left. */
    .gpf-root .gpf-c-dt{width:104px;text-align:left;}`,
  `    /* The Pledges / Gifts toggle sits on its own line under the view toggle, right aligned
       under it, on the block's own 14px inset. */
    .gpf-root .gpf-tblrow{display:flex;justify-content:flex-end;padding:0 14px 6px;}
    /* The Gifts table centres its headers and reads its data from the left (owner override of
       D12, which is otherwise in force across the build). */
    .gpf-root .gpf-c-ctr{text-align:center;}
    .gpf-root .gpf-c-lft{text-align:left;}
    /* The white middle of the bar: what is still expected against the pledges. */
    .gpf-root .gpf-seg-exp{background:var(--surface-widget);position:absolute;top:0;bottom:0;border-radius:0;}
    .gpf-root .gpf-lg-sw.gpf-seg-exp{position:static;border-radius:3px;box-shadow:inset 0 0 0 1px var(--cn-30);}
    /* The last line sits on the card's bottom edge. The 10px of white beneath it is
       .wcontent's own padding, which every widget shares, so it is cancelled here rather than
       there, and only on the tiers that have a last line to pin. */
    .gpf-root[data-tier="wide"],.gpf-root[data-tier="xwide"]{margin-bottom:-10px;}`,
  "CSS: the toggle row, the alignments, the white segment, the flush bottom");

/* ---- guards ---------------------------------------------------------- */
const W17 = t.slice(t.indexOf("var GPF_TODAY="), t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */"));
const code = W17.replace(/\/\*[\s\S]*?\*\//g, "");

/* 1 */
if (code.indexOf("gpf-toggles") > -1 || t.indexOf("gpf-toggles") > -1) throw new Error("the old toggle cluster survives");
if (code.indexOf("gpf-tbltoggle") > -1 || t.indexOf("gpf-tbltoggle") > -1) throw new Error("the old toggle class survives");
if (code.indexOf(`'<div class="dep-hd-toggle">'+gpFViewToggle(w)+'</div>'`) < 0) throw new Error("the view toggle is not alone in the corner");
if (code.indexOf("gpf-tblrow") < 0 || t.indexOf(".gpf-root .gpf-tblrow{") < 0) throw new Error("the toggle has no line of its own");
/* 2 */
const bar = /function gpFSplitBar[\s\S]*?\n}/.exec(code)[0];
["gpf-seg-pledge", "gpf-seg-exp", "gpf-seg-other"].forEach(c => {
  if (bar.indexOf(c) !== bar.lastIndexOf(c) || bar.indexOf(c) < 0) throw new Error("the bar does not draw " + c + " exactly once");
});
if (bar.indexOf("Still expected: ") < 0) throw new Error("the white segment does not name itself on hover");
if (bar.indexOf("Math.max(r.pledgeTotal,paid)+gifts") < 0) throw new Error("the bar scale can still overflow on an over-paid pledge");
if (t.indexOf(".gpf-root .gpf-seg-exp{") < 0) throw new Error("the white segment has no rule");
/* 3, 4 */
const bars = /function gpFGivingBars[\s\S]*?\n}/.exec(code)[0];
if (bars.indexOf("gpFPct(") > -1) throw new Error("a percentage survives on a Giving row");
if (bars.indexOf("gpf-p-amt") > -1) throw new Error("the old amount span survives");
const foot = /function gpFBarFoot[\s\S]*?\n}/.exec(code)[0];
["' given'", "' from pledges'", "' from gifts'", "' still expected'"].forEach(s2 => {
  if (foot.indexOf(s2) < 0) throw new Error("the foot line is missing " + s2);
});
/* 5 */
if (!/\.gpf-root\[data-tier="wide"\],\.gpf-root\[data-tier="xwide"\]\{margin-bottom:-10px;\}/.test(t)) {
  throw new Error("the last line is not pinned to the card's bottom edge");
}
if (!/\.wcontent\{[^}]*padding-bottom:10px/.test(t)) throw new Error("the shell padding this cancels has changed; re-measure");
/* 6, 7 */
if (code.indexOf("gpf-c-dt") > -1 || t.indexOf("gpf-c-dt") > -1) throw new Error("the Last gift column survives");
const gh = /function gpFGiftsHead[\s\S]*?\n}/.exec(code)[0], gr = /function gpFGiftsRow[\s\S]*?\n}/.exec(code)[0];
if (gh.indexOf("Last gift") > -1 || gr.indexOf("lastGift") > -1) throw new Error("Last gift is still drawn");
if (code.indexOf("lastGift") > -1) throw new Error("the retired lastGift field survives in the model");
if ((gh.match(/gpf-c-ctr/g) || []).length !== 4) throw new Error("the Gifts header does not centre all four cells");
if ((gr.match(/gpf-c-lft/g) || []).length !== 3) throw new Error("the Gifts row does not left-align its three data cells");
if ((gh.match(/<span class=/g) || []).length !== 4) throw new Error("the Gifts header is not four columns");
/* the widths still match cell for cell, which is what keeps the columns lined up */
const wid = s2 => (s2.match(/gpf-c-nm|gpf-c-n\b/g) || []).join(",");
if (wid(gh) !== wid(gr)) throw new Error("the Gifts header and row no longer share their width classes: " + wid(gh) + " vs " + wid(gr));

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("W17: the owner's seven changes");
