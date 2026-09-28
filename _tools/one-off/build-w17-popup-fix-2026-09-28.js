/* One-off, 2026-09-28: make the W17 giving ledger work as intended.

   Owner: "w17 can you fix the pop up to work as it is intented."

   TWO FAULTS, found by measuring the rendered pop-up rather than counting its
   markup.

   1. THE LIST WAS CLIPPED, NOT SCROLLABLE. The ledger lists everything that
      came in for a purpose, 58 entries for the Building Fund. Measured: the
      row container was 5,786px of content inside a 410px box carrying
      `overflow:hidden`, with its last row at y=5842 against a modal bottom of
      706. Forty-eight of the fifty-eight rows could not be reached by any
      means. The modal body's own `overflow-y:auto` could not save it, because
      a flex child that clips does not grow its parent's scroll height, so the
      body reported scrollHeight === clientHeight and showed no scrollbar.

      The `overflow:hidden` came in with the sixty classes copied from Jo's
      block, where it was right: that container was the in-card drill, paged at
      twenty rows, and the clip kept its rounded corners. The ledger is not
      paged and cannot use it.

      Earlier verification counted `data-gpf="gopen"` matches in the DOM and saw
      58, which is exactly the wrong test: the rows existed and were unreachable.

      Fix: the ledger's list gets its own scroll container, so the summary, the
      type filter and the search box stay pinned while the entries scroll, and
      the column header sticks to the top of the list so the columns stay
      labelled. The in-card drill keeps its clip, because it is still paged.

   2. A PLEDGE SHOWED ITS PAYMENTS BUT NOT ITS SCHEDULE. The rebuild plan said
      "each row expanding to its history: a pledge shows its schedule and
      payments, a gift shows its detail". Only the payments were built, so a
      pledge behind pace showed what had arrived with nothing to compare it
      against, which is the one thing the row's Due Remaining is asserting.

      Fix: a pledge's expansion opens with its schedule, derived with the SAME
      stepping gpFPledgedIn uses (monthly, quarterly or annual from the begin
      date), so the schedule cannot disagree with the pace arithmetic it is
      shown beside. Each instalment says whether it has fallen due by the end
      of the current window. The payments follow, as before.
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
  log.push("edited: " + a0.slice(0, 58).replace(/\s+/g, " "));
}

/* ============================================ 1. the list gets a scroller */
swap(`    ? '<div class="gpf-drill-tbl">'+head+rows.map(function(it){return gpFLedgerRowHTML(it,w,win);}).join('')+'</div>'`,
     `    ? '<div class="gpf-drill-tbl gpf-ldr-list">'+head+rows.map(function(it){return gpFLedgerRowHTML(it,w,win);}).join('')+'</div>'`);

{
  const anchor = "  .gpf-root .gpf-modal .modal-b{max-height:min(70vh,620px);overflow-y:auto;}";
  if (t.split(anchor).length - 1 !== 1) throw new Error("the modal-b rule was not found exactly once");
  const add = anchor + NL
    + "  /* THE LEDGER SCROLLS, the chrome around it does not. The list inherits" + NL
    + "     .gpf-drill-tbl from the in-card drill, which is paged at twenty rows and" + NL
    + "     clips to keep its corners; the ledger is not paged and was losing every" + NL
    + "     row past the fourth. overflow-x stays hidden, so only the entries move," + NL
    + "     and the column header sticks so they stay labelled. (28 Sep 2026) */" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-list{flex:1 1 auto;min-height:150px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;}" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-list .wt-head{position:sticky;top:0;z-index:2;background:var(--surface-widget);}" + NL
    + "  /* the note above the list must not be squeezed by the list taking the rest */" + NL
    + "  .gpf-root .gpf-modal .gpf-detail-b>.gpf-cap{flex:0 0 auto;}" + NL
    + "  .gpf-root .gpf-modal .gpf-detail-b>.gpf-dsum,.gpf-root .gpf-modal .gpf-detail-b>.gpf-ldr-bar{flex:0 0 auto;}" + NL;
  t = t.split(anchor + NL).join(add);
  log.push("added the ledger scroll container and its sticky header");
}

/* ======================================= 2. a pledge shows its schedule */
{
  const anchor = "function gpFGiftPanel(pl,iso,win){";
  const i = t.indexOf(anchor);
  if (i < 0) throw new Error("gpFGiftPanel was not found");
  const fnStart = t.lastIndexOf(NL, i - 1) + NL.length;
  const block = [
    "/* The pledged instalment schedule, stepped exactly as gpFPledgedIn steps it",
    "   (monthly, quarterly, else annual from the begin date), so the schedule and",
    "   the pace figures shown beside it cannot disagree. `inst` is the instalment",
    "   count the fixture derives from the term and the frequency. */",
    "var GPF_FREQ_LBL={12:\"monthly\",6:\"every two months\",4:\"quarterly\",2:\"every two years\",1:\"once a year\"};",
    "function gpFScheduleRows(pl){",
    "  var duration=Math.max(1,pl.inst||1),periodic=pl.pledge/duration;",
    "  var b=gpFParse(pl.begin),out=[],i;",
    "  for(i=0;i<duration;i++){",
    "    var d=new Date(b.getTime());",
    "    if(pl.freq===12)d.setMonth(d.getMonth()+i);",
    "    else if(pl.freq===4)d.setMonth(d.getMonth()+i*3);",
    "    else d.setFullYear(d.getFullYear()+i);",
    "    out.push({n:i+1,date:gpFISO(d),amount:periodic});",
    "  }",
    "  return out;",
    "}",
    "function gpFSchedulePanel(pl,win){",
    "  var rows=gpFScheduleRows(pl),end=win&&win.end?win.end:gpFISO(GPF_TODAY);",
    "  var due=0,dueN=0;",
    "  rows.forEach(function(r){if(r.date<=end){due+=r.amount;dueN++;}});",
    "  var freq=GPF_FREQ_LBL[pl.freq]||(\"every \"+Math.round(12/(pl.freq||1))+\" months\");",
    "  var lead='<div class=\"gpf-sched-lead\">'+rows.length+' instalment'+(rows.length===1?'':'s')+' of '+gpFMoney(rows[0].amount)+', '+freq+', '+gpFFmtDate(pl.begin)+' to '+gpFFmtDate(pl.end)+'. '+dueN+' of '+rows.length+' fallen due, '+gpFMoney(due)+'.</div>';",
    "  var head='<div class=\"gpf-grow gpf-ghead gpf-sched-row\"><span>Instalment</span><span>Due date</span><span>State</span><span class=\"gpf-ga\">Amount</span></div>';",
    "  var body='';",
    "  rows.forEach(function(r){",
    "    var isDue=r.date<=end;",
    "    body+='<div class=\"gpf-grow gpf-sched-row\"><span>'+r.n+' of '+rows.length+'</span><span>'+gpFFmtDate(r.date)+'</span><span class=\"'+(isDue?'gpf-sched-due':'gpf-muted')+'\">'+(isDue?'Fallen due':'Not yet due')+'</span><span class=\"gpf-ga\">'+gpFMoney(r.amount)+'</span></div>';",
    "  });",
    "  return '<div class=\"gpf-drawer-h\">Pledge schedule</div>'+lead+'<div class=\"gpf-gifts\">'+head+body+'</div>';",
    "}",
    "/* A pledge's history in the ledger: what was promised, then what arrived. The",
    "   in-card drill keeps the payments alone, because it is a pace read and the",
    "   schedule would double its row height at twenty rows to a page. */",
    "function gpFPledgeHistory(pl,win){",
    "  return '<div class=\"gpf-drawer gpf-ldr-drawer\" role=\"region\" aria-label=\"'+gpFEsc('Schedule and gifts for the '+pl.donor+' pledge')+'\">'+",
    "    gpFSchedulePanel(pl,win)+gpFGiftPanel(pl,(win&&win.end)||gpFISO(GPF_TODAY),win,true)+'</div>';",
    "}",
    ""
  ].join(NL);
  t = t.slice(0, fnStart) + block + t.slice(fnStart);
  log.push("added gpFScheduleRows, gpFSchedulePanel and gpFPledgeHistory");
}

/* gpFGiftPanel gains a flag so it can render inside another drawer without
   nesting a second region wrapper */
swap("function gpFGiftPanel(pl,iso,win){\n  win=win||{start:null,end:iso};",
     "function gpFGiftPanel(pl,iso,win,inner){\n  win=win||{start:null,end:iso};");
swap(`    return '<div class="gpf-drawer gpf-drawer" role="region" aria-label="'+gpFEsc('Gifts applied to the '+pl.donor+' pledge')+'">'+head+
      '<div class="gpf-tab-empty">'+ICON('volunteer_activism')+'No gifts have been applied to this pledge inside the current dates.</div></div>';`,
`    var emptyBody=head+'<div class="gpf-tab-empty">'+ICON('volunteer_activism')+'No gifts have been applied to this pledge inside the current dates.</div>';
    if(inner)return emptyBody;
    return '<div class="gpf-drawer gpf-drawer" role="region" aria-label="'+gpFEsc('Gifts applied to the '+pl.donor+' pledge')+'">'+emptyBody+'</div>';`);
swap(`  return '<div class="gpf-drawer gpf-drawer" role="region" aria-label="'+gpFEsc('Gifts applied to the '+pl.donor+' pledge')+'">'+head+
    '<div class="gpf-gifts">'+body+'</div>'+
    '<div class="gpf-giftfoot">Total received: '+gpFMoney(sum)+' across '+gifts.length+' gift'+(gifts.length===1?'':'s')+' applied to this pledge</div></div>';`,
`  var fullBody=head+'<div class="gpf-gifts">'+body+'</div>'+
    '<div class="gpf-giftfoot">Total received: '+gpFMoney(sum)+' across '+gifts.length+' gift'+(gifts.length===1?'':'s')+' applied to this pledge</div>';
  if(inner)return fullBody;
  return '<div class="gpf-drawer gpf-drawer" role="region" aria-label="'+gpFEsc('Gifts applied to the '+pl.donor+' pledge')+'">'+fullBody+'</div>';`);

/* the ledger's pledge rows use the new history */
swap("  '</button>'+(exp?gpFGiftPanel(it.pledge,win.end,win):'');",
     "  '</button>'+(exp?gpFPledgeHistory(it.pledge,win):'');");

/* the schedule's own styling, beside the gift-list rules it reuses */
{
  const anchor = "  .gpf-root .gpf-ldr-hist,.gpf-modal .gpf-ldr-hist{display:grid;grid-template-columns:1fr 1fr 1.4fr 1fr auto;gap:10px;}";
  if (t.split(anchor).length - 1 !== 1) throw new Error("the ledger history rule was not found exactly once");
  t = t.split(anchor).join(anchor + NL
    + "  /* the pledge schedule, shown above the payments in the ledger */" + NL
    + "  .gpf-root .gpf-modal .gpf-sched-row{display:grid;grid-template-columns:1fr 1.2fr 1fr auto;gap:10px;}" + NL
    + "  .gpf-root .gpf-modal .gpf-sched-lead{font-size:11.5px;color:var(--txt-secondary);padding:0 0 6px;line-height:1.45;}" + NL
    + "  .gpf-root .gpf-modal .gpf-sched-due{color:var(--txt-primary);font-weight:600;}" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-drawer .gpf-drawer-h{margin-top:8px;}" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-drawer .gpf-drawer-h:first-child{margin-top:0;}" + NL);
  log.push("added the schedule CSS");
}

/* ------------------------------------------------------------ guards */
["gpFScheduleRows", "gpFSchedulePanel", "gpFPledgeHistory", "gpf-ldr-list", "gpf-sched-row"].forEach(n => {
  const c = (t.match(new RegExp(n.replace(/[-]/g, "\\-"), "g")) || []).length;
  if (c < 2) throw new Error(n + " is declared but never used (" + c + ")");
});
if (t.indexOf("gpFGiftPanel(pl,iso,win,inner)") < 0) throw new Error("the gift panel did not gain its inner flag");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("W17 pop-up: the ledger scrolls, and a pledge shows its schedule");
