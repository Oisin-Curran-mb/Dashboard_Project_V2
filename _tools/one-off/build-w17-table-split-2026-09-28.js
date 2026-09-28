/* One-off, 2026-09-28: W17's table view splits into Pledges and Gifts.

   Owner: "on Table view there is going to be a toggle in the top right hand
   corner but with different options, one being pledges which is exactly one to
   one with what was in the old pledges that currently in the system, and then
   gifts with money given to a purpose but not associated to a pledge. So where
   things are staying the same in the giving, the table is going to have better
   logic to split the two."

   The model half is build-w17-strict-model-2026-09-28.js, which un-blended the
   figures. This script adds the control and the second table.

   PLEDGES is the shipped panel, GFPledgeRepository.GetWidgetData:
     - rows are purposes with at least one ACTIVE pledge, and nothing else; a
       purpose that takes gifts and pledges nothing is absent, exactly as it is
       absent from the panel, whose query root is GFPledge;
     - ordered by Pledge Total DESCENDING, which is the panel's own final
       OrderByDescending and is not a user control, so the widget still offers
       no ordering of its own;
     - Received is fromPledgesThru, pledge-linked money to the thru date. No
       gift money reaches any cell, the sub-line or the totals row;
     - a preset's start date does not act here. A pledge is a cumulative
       promise: windowing its receipts while Pledge Due still measures the whole
       term to date would compare two different dates and make a fully paid old
       pledge look catastrophically behind. The chip says which date is acting.

   GIFTS is the money the panel cannot see: gift lines whose PledgeID is null,
   on the Purpose List report's own vocabulary (PurposeListViewModel counts
   gifts, givers and totals per purpose). The whole window acts here, start and
   end, because these are transactions. Its rows open the ledger already
   filtered to gifts.

   Totals are summed from each mode's OWN rows through gpFSumRows, so a totals
   line can never include a purpose its table does not show.
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

/* ---- 1. CSS: the toggle cluster and the one new column width ---- */
swap(
  `  /* ===== end W17 Gifts Pledges V2 CSS ===== */`,
  `    /* The header's right-hand cluster holds the view toggle and, in the table view, the
       Pledges / Gifts toggle. Both are her .vtoggle; this only lays them out. */
    .gpf-root .gpf-toggles{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;}
    /* The Pledges / Gifts toggle keeps its width when the two share the row. */
    .gpf-root .gpf-tbltoggle{flex:0 0 auto;}
    /* A date sits in a wider slot than a money figure and reads from the left. */
    .gpf-root .gpf-c-dt{width:104px;text-align:left;}
  /* ===== end W17 Gifts Pledges V2 CSS ===== */`,
  "CSS: .gpf-toggles and .gpf-c-dt");

/* ---- 2. the toggle, and the header that carries it ---- */
swap(
  `function gpFViewToggle(w){`,
  `/* Which table the table view is showing. Pledges is the default, because it is the read
   the shipped panel gives today. */
function gpFTblMode(w){return (w&&w.gpFTbl==='gifts')?'gifts':'pledges';}
/* The second toggle, in the header's top right beside the view toggle, and only while the
   table view is up. Her .vtoggle chrome, text only: two toggles share that row at Explore
   and an icon apiece does not fit. */
function gpFTableToggle(w){
  var m=gpFTblMode(w);
  function seg(val,lbl,tip){
    return '<button class="vt'+(m===val?" on":"")+'" data-gpf="tbl" data-id="'+w.id+'" data-v="'+val+'" aria-pressed="'+(m===val)+'" data-tip="'+gpFEsc(tip)+'" data-tip-plain>'+lbl+'</button>';
  }
  return '<div class="vtoggle gpf-tbltoggle" role="group" aria-label="Table">'+
    seg('pledges','Pledges','The pledged position for every purpose that has an active pledge: Pledge Total, Pledge Due, Received against those pledges, Due Remaining and Percent Due. One to one with the Gifts and Pledges panel.')+
    seg('gifts','Gifts','Money given to a purpose that is not against any pledge, by purpose, over the dates you choose.')+
  '</div>';
}
function gpFViewToggle(w){`,
  "gpFTblMode and gpFTableToggle");

swap(
  `    seg("table","Summary Table","table_rows","The baseline table: Pledge Total, Pledge Due, Received, Due Remaining and Percent Due for every purpose.")+`,
  `    seg("table","Summary Table","table_rows","The figures as a table, one read at a time: the pledged position, or the gifts given with no pledge behind them.")+`,
  "the view toggle's tip names the two table reads");

swap(
  `  var toggle='<div class="dep-hd-toggle">'+gpFViewToggle(w)+'</div>';`,
  `  var toggle='<div class="dep-hd-toggle"><div class="gpf-toggles">'+gpFViewToggle(w)+((gpFView(w)==="table"&&mode!=="loading")?gpFTableToggle(w):'')+'</div></div>';`,
  "the header carries both toggles in the table view");

/* ---- 3. the two tables ---- */
swap(
  `function gpFSummaryTable(w,trim){
  var rows=gpFCampCompute(w).slice();
  if(!rows.length)return '<div class="gpf-zeroline">'+ICON("info")+'No gift or pledge purposes match this selection.</div>';
  if(trim){rows.sort(function(a,b){return (b.percentDue==null?-Infinity:b.percentDue)-(a.percentDue==null?-Infinity:a.percentDue);});rows=rows.slice(0,4);}
  var t=gpFTotals(w);
  var body=rows.map(function(r){return gpFSummaryRow(w,r);}).join("");
  var tot=trim?'':('<div class="wt-row gpf-trow gpf-total-row gpf-sumtotal">'+
    '<span class="gpf-c-nm">Total ('+t.count+' purpose'+(t.count===1?'':'s')+')</span>'+
    '<span class="gpf-c-n">'+gpFMoney(t.pledgeTotal)+'</span>'+
    '<span class="gpf-c-n">'+gpFMoney(t.pledgeDue)+'</span>'+
    '<span class="gpf-c-n">'+gpFMoney(t.fromPledgesThru)+'</span>'+
    '<span class="gpf-c-n">'+gpFDueCell(t.dueRem)+'</span>'+
    '<span class="gpf-c-n gpf-c-pct"></span>'+
  '</div>');
  var cap='<div class="gpf-ctx gpf-cap"><span>Pledge Due is each donor pledge paced on its own begin to end term, and the full pledge once past its end date. Percent Due is Due Remaining over Pledge Due, so a negative value means over received.'+(trim?' Top purposes by need.':'')+'</span></div>';
  return '<div class="gpf-tblwrap">'+cap+'<div class="scroll gpf-scroll">'+gpFSummaryHead()+body+'</div>'+tot+'</div>';
}`,
  `/* The table view dispatches to one read or the other. Neither borrows a figure from the
   other, and each totals only the rows it shows. */
function gpFSummaryTable(w,trim){
  return (gpFTblMode(w)==='gifts')?gpFGiftsTable(w,trim):gpFPledgesTable(w,trim);
}
/* PLEDGES: the shipped panel. Rows are purposes with an active pledge, ordered by Pledge
   Total descending as the legacy query orders them. The window start does not act. */
function gpFPledgesTable(w,trim){
  var rows=gpFCampCompute(w).filter(function(r){return r.hasPledges;});
  if(!rows.length)return '<div class="gpf-zeroline">'+ICON("info")+'No purpose in this selection has an active pledge. Switch to Gifts to see money given without one.</div>';
  rows.sort(function(a,b){return b.pledgeTotal-a.pledgeTotal;});
  if(trim){rows=rows.slice(0,4);}
  var t=gpFSumRows(rows);
  var body=rows.map(function(r){return gpFSummaryRow(w,r);}).join("");
  var tot=trim?'':('<div class="wt-row gpf-trow gpf-total-row gpf-sumtotal">'+
    '<span class="gpf-c-nm">Total ('+t.count+' purpose'+(t.count===1?'':'s')+')</span>'+
    '<span class="gpf-c-n">'+gpFMoney(t.pledgeTotal)+'</span>'+
    '<span class="gpf-c-n">'+gpFMoney(t.pledgeDue)+'</span>'+
    '<span class="gpf-c-n">'+gpFMoney(t.fromPledgesThru)+'</span>'+
    '<span class="gpf-c-n">'+gpFDueCell(t.dueRem)+'</span>'+
    '<span class="gpf-c-n gpf-c-pct"></span>'+
  '</div>');
  var cap='<div class="gpf-ctx gpf-cap"><span>The pledged position for every purpose with an active pledge, as the Gifts and Pledges panel reports it. Received counts money given against those pledges up to '+gpFFmtDate(gpFWindow(w).end)+'; gifts with no pledge behind them are under Gifts. Pledge Due is each donor pledge paced on its own begin to end term, and the full pledge once past its end date. Percent Due is Due Remaining over Pledge Due, so a negative value means over received.'+(trim?' Largest pledges first.':'')+'</span></div>';
  return '<div class="gpf-tblwrap">'+cap+'<div class="scroll gpf-scroll">'+gpFSummaryHead()+body+'</div>'+tot+'</div>';
}
/* GIFTS: gift lines with no pledge behind them, per purpose, over the whole window. The
   columns are the Purpose List report's own: how many gifts, how many donors, the last one
   and the total. */
function gpFGiftsHead(){
  return '<div class="wt-row wt-head gpf-trow">'+
    '<span class="gpf-c-nm">Purpose</span>'+
    '<span class="gpf-c-n">Gifts</span>'+
    '<span class="gpf-c-n">Donors</span>'+
    '<span class="gpf-c-n gpf-c-dt">Last gift</span>'+
    '<span class="gpf-c-n">Total</span>'+
  '</div>';
}
function gpFGiftsRow(w,r){
  var badge=r.closed?'<span class="gpf-closed">Closed</span>':'';
  var sub=r.hasPledges?'Also has pledges, under Pledges':'No pledges on this purpose';
  var sr=r.label+', '+r.giftN+' gift'+(r.giftN===1?'':'s')+' with no pledge, from '+r.giftDonors+' donor'+(r.giftDonors===1?'':'s')+', last on '+gpFFmtDate(r.lastGift)+', '+gpFMoney(r.other)+' in total. Open every gift and pledge behind this purpose.';
  return '<div class="wt-row gpf-trow gpf-clickable gpf-sumrow" data-gpf="baropen" data-id="'+w.id+'" data-c="'+gpFEsc(r.label)+'" data-f="gifts" role="button" tabindex="0" aria-haspopup="dialog" aria-label="'+gpFEsc(sr)+'">'+
    '<span class="gpf-c-nm"><span class="gpf-caret" aria-hidden="true">'+ICON('chevron_right')+'</span><span class="gpf-nmtxt"><span class="gpf-nm">'+r.label+badge+'</span><span class="gpf-nmsub">'+sub+'</span></span></span>'+
    '<span class="gpf-c-n">'+r.giftN+'</span>'+
    '<span class="gpf-c-n">'+r.giftDonors+'</span>'+
    '<span class="gpf-c-n gpf-c-dt">'+gpFFmtDate(r.lastGift)+'</span>'+
    '<span class="gpf-c-n">'+gpFMoney(r.other)+'</span>'+
  '</div>';
}
function gpFGiftsTable(w,trim){
  var rows=gpFCampCompute(w).filter(function(r){return r.giftN>0;});
  if(!rows.length)return '<div class="gpf-zeroline">'+ICON("info")+'No gifts without a pledge came in for this selection over these dates.</div>';
  rows.sort(function(a,b){return b.other-a.other;});
  if(trim){rows=rows.slice(0,4);}
  var t=gpFSumRows(rows);
  var body=rows.map(function(r){return gpFGiftsRow(w,r);}).join("");
  var tot=trim?'':('<div class="wt-row gpf-trow gpf-total-row gpf-sumtotal">'+
    '<span class="gpf-c-nm">Total ('+t.count+' purpose'+(t.count===1?'':'s')+')</span>'+
    '<span class="gpf-c-n">'+t.giftN+'</span>'+
    '<span class="gpf-c-n">'+t.giftDonors+'</span>'+
    '<span class="gpf-c-n gpf-c-dt">'+gpFFmtDate(t.lastGift)+'</span>'+
    '<span class="gpf-c-n">'+gpFMoney(t.other)+'</span>'+
  '</div>');
  var cap='<div class="gpf-ctx gpf-cap"><span>Money given to a purpose that is not against any pledge, '+gpFRangePhrase(w).charAt(0).toLowerCase()+gpFRangePhrase(w).slice(1)+'. A purpose appears here whether or not it also takes pledges, and the pledged position is under Pledges. Donors are counted once each.'+(trim?' Largest first.':'')+'</span></div>';
  return '<div class="gpf-tblwrap">'+cap+'<div class="scroll gpf-scroll">'+gpFGiftsHead()+body+'</div>'+tot+'</div>';
}`,
  "gpFPledgesTable and gpFGiftsTable");

/* ---- 4. the handler, and the ledger filter a Gifts row asks for ---- */
swap(
  `  if(a==='view'){if(!w)return;w.gpFView=t.getAttribute('data-v');render();return;}`,
  `  if(a==='view'){if(!w)return;w.gpFView=t.getAttribute('data-v');render();return;}
  if(a==='tbl'){if(!w)return;w.gpFTbl=t.getAttribute('data-v');render();return;}`,
  "the tbl handler switches the table read");

swap(
  `  if(a==='baropen'){if(!w)return;GPF_MODAL={id:id,label:t.getAttribute('data-c')};gpFClosePop();gpFRenderModal();return;}`,
  `  if(a==='baropen'){if(!w)return;GPF_MODAL={id:id,label:t.getAttribute('data-c'),filter:t.getAttribute('data-f')||'all'};gpFClosePop();gpFRenderModal();return;} /* a Gifts row opens the ledger already filtered to gifts */`,
  "a Gifts row opens the ledger filtered to gifts");

/* ---- guards ---------------------------------------------------------- */
const W17 = t.slice(t.indexOf("var GPF_TODAY="), t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */"));
const code = W17.replace(/\/\*[\s\S]*?\*\//g, "");

["gpFTblMode", "gpFTableToggle", "gpFPledgesTable", "gpFGiftsTable", "gpFGiftsHead", "gpFGiftsRow",
  'data-gpf="tbl"', 'data-f="gifts"', "gpf-c-dt", "gpf-toggles"].forEach(n => {
    if (code.indexOf(n) < 0 && t.indexOf(n) < 0) throw new Error("missing: " + n);
  });
/* every table figure comes from its own mode */
if (/function gpFPledgesTable[\s\S]*?\n}/.exec(code)[0].match(/\.other|giftN|giftDonors|lastGift|totalIn/)) {
  throw new Error("gift money reached the Pledges table");
}
if (/function gpFGiftsTable[\s\S]*?\n}/.exec(code)[0].match(/pledgeDue|fromPledges|percentDue|dueRem/)) {
  throw new Error("pledge money reached the Gifts table");
}
if (!/function gpFGiftsRow[\s\S]*?\n}/.exec(code)[0].match(/r\.other/)) throw new Error("the Gifts row shows no total");
if (/function gpFGiftsRow[\s\S]*?\n}/.exec(code)[0].match(/pledgeTotal|fromPledges|dueRem/)) {
  throw new Error("pledge money reached a Gifts row");
}
/* the Pledges table must not be reachable for a purpose with no active pledge */
if (code.indexOf("filter(function(r){return r.hasPledges;})") < 0) throw new Error("the Pledges table is not filtered to purposes with pledges");
/* D12: each header cell carries its column's own classes */
const gh = /function gpFGiftsHead[\s\S]*?\n}/.exec(code)[0], gr = /function gpFGiftsRow[\s\S]*?\n}/.exec(code)[0];
["gpf-c-nm", "gpf-c-n", "gpf-c-n gpf-c-dt"].forEach(c => {
  if (gh.indexOf('"' + c + '"') < 0) throw new Error("the Gifts header lacks a " + c + " cell");
  if (gr.indexOf('"' + c + '"') < 0) throw new Error("the Gifts row lacks a " + c + " cell");
});
if ((gh.match(/<span class=/g) || []).length !== (gr.match(/<span class="gpf-c-/g) || []).length) {
  throw new Error("the Gifts header and row do not have the same number of columns");
}

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("W17 table: Pledges one to one with the panel, Gifts for money with no pledge");
