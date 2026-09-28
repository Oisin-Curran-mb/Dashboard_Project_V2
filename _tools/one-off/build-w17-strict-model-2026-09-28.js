/* One-off, 2026-09-28: W17 Gifts Pledges goes back to a strict PurposeID basis.

   Owner, after talking to Edd: "PurposeID is the most important thing. So if we
   are using purpose as the guiding light we have to very strictly follow it and
   no other number can ever be shown, as for tax reasons this money is very
   carefully tracked, and with the new version I don't think it follows that
   strict definition." And: "The end result is I want to keep the old system
   exactly as it is, but have a toggle to see the pledges to a purpose and then
   the gifts to a purpose. So on the Giving part it is to see all the money given
   to a purpose, but on Table view there is going to be a toggle in the top right
   hand corner: one being pledges, which is exactly one to one with the old
   pledges currently in the system, and then gifts, money given to a purpose but
   not associated to a pledge."

   THIS SCRIPT IS THE MODEL HALF. The table toggle follows in
   build-w17-table-split-2026-09-28.js.

   WHAT WAS WRONG. The 28 Sep rebuild blended the two reads: a purpose row
   carried one `received` that was pledge payments plus unpledged gifts, and
   every consumer read that one number. Two figures on the card could therefore
   not be traced to a single purpose-keyed query:
     - Received, because it mixed money that answers to a pledge with money that
       does not, so it no longer equalled the shipped panel's Received column;
     - Pledge Total, because gpFPledgedIn re-scoped it to "the instalments
       falling inside the window" on any preset with a start date, which is a
       proration that exists nowhere in the data.

   WHAT THE LEGACY CODE HOLDS (MBAccounting, read only). Every figure now comes
   from one of exactly two queries:
     Q1  the purpose's gift lines: GFHistoryDetail on PurposeID (NOT NULL on
         every line), where GFBatch.Posted is true, GFHistory.UnDoJournalID is
         null and GiftDate falls in the window. Split once on PledgeID:
         not null is a pledge payment, null is a gift.
     Q2  the purpose's pledges: GFPledge on PurposeID where Active is true.
         Pledge Total is Sum(Pledge); Pledge Due is Sum(PledgeDue(true, thru)).
   Unpledged gifts are first class: PledgeID is nullable, GFPurpose.AllowPledges
   exists, Gifts/AssignPledgeToPostedGifts hunts for PledgeID == null against a
   chosen purpose, ViewPostedGiftsPreferences.PledgeStatusOptions names the state
   NotAssociatedWithPledge, and PledgeProjectionViewModel already reports
   PaidAgainstPledge beside PaidNonPledge.

   THE NEW ROW SHAPE. `received` is gone as a property, so nothing can read a
   blended figure by accident:
     fromPledges       pledge payments INSIDE the window        (Giving)
     fromPledgesThru   pledge payments to the thru date         (the legacy Received)
     other             gifts with no pledge, inside the window  (Giving, Gifts table)
     totalIn           both, all the money given to the purpose (Giving, pop-up)
     pledgeTotal       full active pledge, never re-scoped
     pledgeDue         the legacy proration on the thru date
     dueRem            pledgeDue - fromPledgesThru, the legacy formula
     percentDue        dueRem / pledgeDue, the legacy formula
     fulfilled         fromPledgesThru / pledgeTotal, a pledge-lifetime read
     windowed          true when the preset has a start date
   A pledge's position is always the thru-date read, because a pledge is a
   cumulative promise. Gift transactions are windowed. Giving suppresses its
   percentage when `windowed`, rather than print a percent whose numerator and
   denominator answer to different dates.

   gpFPledgedIn IS DELETED. Its only job was the re-scoping now reversed, and
   gpFScheduleRows already steps a pledge identically for the schedule panel.

   THE FIXTURE GAINS MONEY THAT MUST NOT COUNT: an unposted batch, an undone
   gift and a gift dated past the anchor, on the unpledged side, where adding
   them cannot disturb the invariant that a pledge's gift lines sum exactly to
   its paid figure. Before this, nothing in the fixture was excludable, so the
   posted / not-undone rule could not fail a test.
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

/* ---- 1. the about text describes the two reads, not one blended one ---- */
swap(
  `var GPF_ABOUT="What each purpose has received, and how much of what was pledged is still due, over the dates you choose. Received counts both payments against a pledge and gifts given to the purpose with no pledge behind them, shown separately in the bar. Open a purpose to see every gift and pledge behind it, and open one of those to see its history: a pledge shows its schedule and the payments against it, a gift shows how it arrived and what prompted it.";`,
  `var GPF_ABOUT="What each purpose has received, and how much of what was pledged is still due, over the dates you choose. Giving shows all the money that came to a purpose, with payments against a pledge and gifts that have no pledge behind them as the two parts of the bar. The table takes one at a time: Pledges is the pledged position, matching the Gifts and Pledges panel figure for figure, and Gifts is money given to the purpose that answers to no pledge. Open a purpose to see every gift and pledge behind it, and open one of those to see its history.";`,
  "about text: Giving shows both, the table takes one at a time");

/* ---- 2. the fixture: AllowPledges, and the comment that no longer blends ---- */
swap(
  `   AND Pledges (owner ruling 2026-09-28).
   Legacy note: the shipped panel counts pledge payments only, walking
   GFPledge.GFHistoryDetails on PledgeID. The purpose-wide path GFPurpose.GFHistoryDetails on
   PurposeID exists in the same data model and is unused there; it is what this widget uses.
   Code and Name are real GF_Purpose columns. otherGifts seeds the unpledged giving. */`,
  `   AND Pledges. Both are money given to the purpose; only the pledge payments answer to a
   pledge, so only they appear in a pledged position (owner rulings 2026-09-28).
   Legacy note: the shipped panel counts pledge payments only, walking
   GFPledge.GFHistoryDetails on PledgeID. The purpose-wide path GFPurpose.GFHistoryDetails on
   PurposeID exists in the same data model and is unused there; it is what this widget uses.
   Code, Name and AllowPledges are real GF_Purpose columns. otherGifts seeds the unpledged
   giving, which the data holds as a gift line with a null PledgeID. */`,
  "fixture comment: both count as giving, only pledges count as pledged");

swap(
  `  {code:"FRNKSTOK", name:"Stoke Sell",        pledgeTotal:1200,   pledgePaid:1855,   otherGifts:240,   closed:true,  allPast:true},
  {code:"2020PLED", name:"2020 Pledge",       pledgeTotal:1000,   pledgePaid:96,     otherGifts:0,     closed:false, allPast:true},
  {code:"BLDGFUND", name:"Building Fund",     pledgeTotal:250000, pledgePaid:205000, otherGifts:31500, closed:false, allPast:false},
  {code:"MISSION26",name:"Mission Trip 2026", pledgeTotal:40000,  pledgePaid:41000,  otherGifts:2600,  closed:false, allPast:false},
  {code:"YOUTHCMP", name:"Youth Camp",        pledgeTotal:18000,  pledgePaid:6000,   otherGifts:4200,  closed:false, allPast:false},
  {code:"ORGANRST", name:"Organ Restoration", pledgeTotal:90000,  pledgePaid:72000,  otherGifts:9800,  closed:false, allPast:false},
  /* A purpose with gifts but no pledge. The legacy panel cannot show this row at all, because
     it starts from active pledges; counting gifts makes the money visible (owner, 28 Sep). */
  {code:"MEMGIFT",  name:"Memorial Gifts",    pledgeTotal:0,      pledgePaid:0,      otherGifts:8600,  closed:false, allPast:false}`,
  `  {code:"FRNKSTOK", name:"Stoke Sell",        allowPledges:true,  pledgeTotal:1200,   pledgePaid:1855,   otherGifts:240,   closed:true,  allPast:true},
  {code:"2020PLED", name:"2020 Pledge",       allowPledges:true,  pledgeTotal:1000,   pledgePaid:96,     otherGifts:0,     closed:false, allPast:true},
  {code:"BLDGFUND", name:"Building Fund",     allowPledges:true,  pledgeTotal:250000, pledgePaid:205000, otherGifts:31500, closed:false, allPast:false},
  {code:"MISSION26",name:"Mission Trip 2026", allowPledges:true,  pledgeTotal:40000,  pledgePaid:41000,  otherGifts:2600,  closed:false, allPast:false},
  {code:"YOUTHCMP", name:"Youth Camp",        allowPledges:true,  pledgeTotal:18000,  pledgePaid:6000,   otherGifts:4200,  closed:false, allPast:false},
  {code:"ORGANRST", name:"Organ Restoration", allowPledges:true,  pledgeTotal:90000,  pledgePaid:72000,  otherGifts:9800,  closed:false, allPast:false},
  /* A purpose that has received gifts and has NO ACTIVE PLEDGE. Confirmed against the real
     dev database: the row there permits pledges (AllowPledges 1) and simply has none active,
     which is the shape this models. The legacy panel cannot show it at all, because its query
     root is GFPledge. It appears in Giving and in the Gifts table, never in the Pledges table. */
  {code:"MEMGIFT",  name:"Memorial Gifts",    allowPledges:true,  pledgeTotal:0,      pledgePaid:0,      otherGifts:8600,  closed:false, allPast:false}`,
  "fixture rows: allowPledges on every purpose");

/* ---- 3. the counting rule, named once and read everywhere ---- */
swap(
  `/* true when a gift date falls inside the window (no start means everything up to the end) */
function gpFInWindow(iso,win){return iso<=win.end&&(!win.start||iso>=win.start);}`,
  `/* true when a gift date falls inside the window (no start means everything up to the end) */
function gpFInWindow(iso,win){return iso<=win.end&&(!win.start||iso>=win.start);}
/* Whether a gift line counts at all. Posted and not-undone are part of the DEFINITION of
   every money figure here, not a detail: the legacy repository filters each money column on
   GFBatch.Posted and GFHistory.UnDoJournalID before it sums anything. A line with neither
   flag set counts, which is why the generated fixture lines need no flags. */
function gpFCounts(g,win){return g.posted!==false&&g.undone!==true&&gpFInWindow(g.date,win);}
/* The same line, measured to the thru date alone. A pledge is a cumulative promise, so its
   position is always read inception-to-date; only gift TRANSACTIONS obey a window start. */
function gpFCountsThru(g,win){return gpFCounts(g,{start:null,end:win.end});}`,
  "gpFCounts and gpFCountsThru: the posted / not-undone rule");

/* ---- 4. row status: gifts with no pledge never move a pledged position ---- */
swap(
  `/* Row status from the data the system actually holds: is the money that was due by now here?
   'funded' when total received covers everything pledged, which counting other gifts makes
   reachable. The invented goal bands at 75 and 100 per cent are retired (owner, 28 Sep). */
function gpFRowStatus(pledged,due,fromPledges,received){
  if(!(pledged>0))return (received>0)?'gifts':'none';
  if(received>=pledged)return 'funded';
  if(fromPledges>=due)return 'ontrack';
  return 'behind';
}`,
  `/* Row status from the data the system actually holds: is the money that was due by now here?
   Only PLEDGE PAYMENTS move it, because only they answer to the pledge being measured; a gift
   with no pledge behind it cannot make a pledge funded. totalIn is read for one thing alone,
   telling a purpose that received gifts and pledged nothing from one that received nothing. */
function gpFRowStatus(pledged,due,paid,totalIn){
  if(!(pledged>0))return (totalIn>0)?'gifts':'none';
  if(paid>=pledged)return 'funded';
  if(paid>=due)return 'ontrack';
  return 'behind';
}`,
  "gpFRowStatus: pledge payments alone decide a pledged position");

/* ---- 5. unpledged gifts: seed the money that must not count ---- */
swap(
  `  out.sort(function(a,c){return a.date<c.date?1:-1;});
  p._gpfOther=out;
  return out;
}`,
  `  /* Money that must NOT count, one line of each kind, so the strict rule is provable rather
     than assumed: an unposted batch, a gift undone by a journal, and a gift dated past the
     as-of anchor. All three are excluded by gpFCounts, so the counting lines still sum to the
     purpose's otherGifts figure. */
  out.push({id:p.code+'-XU',donor:GPF_DONORS[0],date:gpFISO(new Date(endT-45*86400000)),amount:5000,
    ref:'Check #9999',media:'Mail',motive:'Annual appeal',motiveCode:'APPEAL',posted:false});
  out.push({id:p.code+'-XV',donor:GPF_DONORS[1],date:gpFISO(new Date(endT-30*86400000)),amount:7500,
    ref:'Receipt #999',media:'In person',motive:'Website',motiveCode:'WEBSITE',undone:true});
  out.push({id:p.code+'-XF',donor:GPF_DONORS[2],date:gpFISO(new Date(endT+40*86400000)),amount:2500,
    ref:'EFT 999999',media:'Online',motive:'Unsolicited',motiveCode:'UNSOL'});
  out.sort(function(a,c){return a.date<c.date?1:-1;});
  p._gpfOther=out;
  return out;
}`,
  "fixture: three unpledged lines that must never count");

/* ---- 6. a purpose that allows no pledges has none ---- */
swap(
  `  if(!(camp.pledgeTotal>0)){camp._gpfPledges=[];return camp._gpfPledges;} /* a gifts-only purpose has no pledges */`,
  `  if(camp.allowPledges===false||!(camp.pledgeTotal>0)){camp._gpfPledges=[];return camp._gpfPledges;} /* GFPurpose.AllowPledges false, or nothing pledged */`,
  "gpFDonorsFor: AllowPledges gates the pledge set");

/* ---- 7. gpFPledgedIn is deleted; the pace reads the full pledge ---- */
swap(
  `/* One pledge, measured inside the window. Received is the SUM OF ITS GIFT LINES in the
   window, not the whole paid amount switched on by a single date (the old all-or-nothing
   read, fixed 28 Sep). Pledged is the full pledge when the window has no start, else the
   instalments scheduled inside it. */
function gpFPledgedIn(pl,win){
  if(!win.start)return pl.pledge;
  var duration=Math.max(1,pl.inst||1),periodic=pl.pledge/duration;
  var b=gpFParse(pl.begin),cnt=0,i;
  for(i=0;i<duration;i++){
    var d=new Date(b.getTime());
    if(pl.freq===12)d.setMonth(d.getMonth()+i);
    else if(pl.freq===4)d.setMonth(d.getMonth()+i*3);
    else d.setFullYear(d.getFullYear()+i);
    var iso=gpFISO(d);
    if(iso>=win.start&&iso<=win.end)cnt++;
  }
  return Math.round(periodic*cnt*100)/100;
}
function gpFDonorPace(pl,asOf,asOfIso,win){
  win=win||{start:null,end:asOfIso};
  var b=gpFParse(pl.begin),e=gpFParse(pl.end);
  var termDays=Math.max(1,Math.round((e-b)/86400000));
  var pledgedIn=gpFPledgedIn(pl,win);
  var due;
  if(win.start){due=pledgedIn;}
  else if(win.end>=pl.end){due=pl.pledge;}
  else{
    var duration=Math.max(1,pl.inst||1),periodic=pl.pledge/duration;
    var iterations=gpFCycles(b,gpFParse(win.end),pl.freq)+1;
    if(iterations<0)iterations=0;
    if(iterations>duration)iterations=duration;
    due=(iterations>=duration)?pl.pledge:periodic*iterations;
  }
  var received=0;
  (pl.gifts||[]).forEach(function(g){if(gpFInWindow(g.date,win))received+=g.amount;});
  received=Math.round(received*100)/100;
  var dueRem=Math.round((due-received)*100)/100;
  var pctPaid=pledgedIn>0?received/pledgedIn:null;
  var expectedFrac=pledgedIn>0?due/pledgedIn:0;
  var daysAhead=(pctPaid==null)?null:(pctPaid-expectedFrac)*termDays;
  var status=(pledgedIn<=0)?'neutral':(received>=pledgedIn?'funded':(dueRem<=0?'current':gpFBandFromDays(daysAhead)));
  return {due:due,received:received,dueRem:dueRem,pledgedIn:pledgedIn,
    outstanding:Math.max(0,pledgedIn-received),pctPaid:pctPaid,daysAhead:daysAhead,status:status,termDays:termDays};
}`,
  `/* One pledge. Pledged is the FULL pledge and Pledge Due the legacy proration on the thru
   date: neither is re-scoped by a window start, because no such proration exists in the data.
   receivedThru is everything that arrived against it up to the thru date, which is the legacy
   panel's Received and the basis of every pace figure here. received is the same sum narrowed
   to the window, which is what a transaction list shows. */
function gpFDonorPace(pl,asOf,asOfIso,win){
  win=win||{start:null,end:asOfIso};
  var b=gpFParse(pl.begin),e=gpFParse(pl.end);
  var termDays=Math.max(1,Math.round((e-b)/86400000));
  var pledged=pl.pledge;
  var due;
  if(win.end>=pl.end){due=pl.pledge;}
  else{
    var duration=Math.max(1,pl.inst||1),periodic=pl.pledge/duration;
    var iterations=gpFCycles(b,gpFParse(win.end),pl.freq)+1;
    if(iterations<0)iterations=0;
    if(iterations>duration)iterations=duration;
    due=(iterations>=duration)?pl.pledge:periodic*iterations;
  }
  var received=0,receivedThru=0;
  (pl.gifts||[]).forEach(function(g){
    if(!gpFCountsThru(g,win))return;
    receivedThru+=g.amount;
    if(gpFCounts(g,win))received+=g.amount;
  });
  received=Math.round(received*100)/100;receivedThru=Math.round(receivedThru*100)/100;
  var dueRem=Math.round((due-receivedThru)*100)/100;
  var pctPaid=pledged>0?receivedThru/pledged:null;
  var expectedFrac=pledged>0?due/pledged:0;
  var daysAhead=(pctPaid==null)?null:(pctPaid-expectedFrac)*termDays;
  var status=(pledged<=0)?'neutral':(receivedThru>=pledged?'funded':(dueRem<=0?'current':gpFBandFromDays(daysAhead)));
  return {due:due,received:received,receivedThru:receivedThru,dueRem:dueRem,pledged:pledged,
    outstanding:Math.max(0,pledged-receivedThru),pctPaid:pctPaid,daysAhead:daysAhead,status:status,termDays:termDays};
}`,
  "gpFPledgedIn deleted; the pace reads the full pledge and the thru date");

/* ---- 8. the purpose row: three named figures, no blended one ---- */
swap(
  `/* One row per PURPOSE. Received is pledge payments plus other gifts, both inside the window,
   and the two parts are carried separately so the bar and the ledger can show the split. */
function gpFPurposeCompute(w){
  var win=gpFWindow(w),asOf=gpFParse(win.end);
  return gpFData(w).map(function(p){
    var due=0,fromPledges=0,pledged=0;
    gpFDonorsFor(p).forEach(function(pl){
      var r=gpFDonorPace(pl,asOf,win.end,win);
      due+=r.due;fromPledges+=r.received;pledged+=r.pledgedIn;
    });
    var other=0;
    gpFOtherGiftsFor(p).forEach(function(g){if(gpFInWindow(g.date,win))other+=g.amount;});
    due=Math.round(due*100)/100;fromPledges=Math.round(fromPledges*100)/100;
    other=Math.round(other*100)/100;pledged=Math.round(pledged*100)/100;
    var received=Math.round((fromPledges+other)*100)/100;
    var dueRem=Math.round((due-fromPledges)*100)/100;
    return {code:p.code,name:p.name,label:p.code+": "+p.name,
      pledgeTotal:pledged,pledgeDue:due,received:received,fromPledges:fromPledges,other:other,
      dueRem:dueRem,percentDue:(due>0?dueRem/due:null),
      fulfilled:(pledged>0?received/pledged:null),
      closed:p.closed,status:gpFRowStatus(pledged,due,fromPledges,received),purpose:p,camp:p};
  });
}
function gpFCampCompute(w){return gpFPurposeCompute(w);}

function gpFTotals(w){
  var rows=gpFPurposeCompute(w),pt=0,pd=0,rc=0,fp=0,ot=0;
  rows.forEach(function(r){pt+=r.pledgeTotal;pd+=r.pledgeDue;rc+=r.received;fp+=r.fromPledges;ot+=r.other;});
  return {pledgeTotal:pt,pledgeDue:pd,received:rc,fromPledges:fp,other:ot,dueRem:pd-fp,
    fulfilled:(pt>0?rc/pt:null),status:gpFRowStatus(pt,pd,fp,rc),count:rows.length,rows:rows};
}`,
  `/* One row per PURPOSE, carrying every figure the widget can show and no blended one. The
   pledged side (pledgeTotal, pledgeDue, fromPledgesThru, dueRem, percentDue, fulfilled) is
   always read to the thru date, which makes it one to one with GFPledgeRepository.GetWidgetData.
   The gift side (fromPledges, other, totalIn and the three gift counts) obeys the whole window,
   because those are transactions. */
function gpFPurposeCompute(w){
  var win=gpFWindow(w),asOf=gpFParse(win.end);
  return gpFData(w).map(function(p){
    var due=0,fromPledges=0,fromPledgesThru=0,pledged=0;
    gpFDonorsFor(p).forEach(function(pl){
      var r=gpFDonorPace(pl,asOf,win.end,win);
      due+=r.due;fromPledges+=r.received;fromPledgesThru+=r.receivedThru;pledged+=r.pledged;
    });
    var other=0,giftN=0,lastGift=null,donors={},donorN=0;
    gpFOtherGiftsFor(p).forEach(function(g){
      if(!gpFCounts(g,win))return;
      other+=g.amount;giftN++;
      if(!lastGift||g.date>lastGift)lastGift=g.date;
      if(!donors[g.donor]){donors[g.donor]=1;donorN++;}
    });
    due=Math.round(due*100)/100;fromPledges=Math.round(fromPledges*100)/100;
    fromPledgesThru=Math.round(fromPledgesThru*100)/100;
    other=Math.round(other*100)/100;pledged=Math.round(pledged*100)/100;
    var totalIn=Math.round((fromPledges+other)*100)/100;
    var dueRem=Math.round((due-fromPledgesThru)*100)/100;
    return {code:p.code,name:p.name,label:p.code+": "+p.name,
      pledgeTotal:pledged,pledgeDue:due,fromPledges:fromPledges,fromPledgesThru:fromPledgesThru,
      other:other,totalIn:totalIn,giftN:giftN,giftDonors:donorN,giftDonorList:Object.keys(donors),lastGift:lastGift,
      dueRem:dueRem,percentDue:(due>0?dueRem/due:null),
      fulfilled:(pledged>0?fromPledgesThru/pledged:null),windowed:!!win.start,
      hasPledges:gpFDonorsFor(p).length>0,
      closed:p.closed,status:gpFRowStatus(pledged,due,fromPledgesThru,totalIn),purpose:p,camp:p};
  });
}
function gpFCampCompute(w){return gpFPurposeCompute(w);}

/* Sums a row set. Both table modes total their OWN rows with this, so a totals line can
   never include a purpose its table does not show. Donors come from each row's own list of
   donors inside the window, unioned, because a donor who gives to two purposes is one
   donor and a donor outside the window is not there at all. */
function gpFSumRows(rows,windowed){
  var pt=0,pd=0,fp=0,fpt=0,ot=0,ti=0,gn=0,dset={},dn=0,last=null;
  rows.forEach(function(r){
    pt+=r.pledgeTotal;pd+=r.pledgeDue;fp+=r.fromPledges;fpt+=r.fromPledgesThru;
    ot+=r.other;ti+=r.totalIn;gn+=r.giftN;
    if(r.lastGift&&(!last||r.lastGift>last))last=r.lastGift;
    (r.giftDonorList||[]).forEach(function(d){if(!dset[d]){dset[d]=1;dn++;}});
  });
  return {pledgeTotal:pt,pledgeDue:pd,fromPledges:fp,fromPledgesThru:fpt,other:ot,totalIn:ti,
    giftN:gn,giftDonors:dn,lastGift:last,dueRem:Math.round((pd-fpt)*100)/100,
    fulfilled:(pt>0?fpt/pt:null),windowed:!!windowed,
    status:gpFRowStatus(pt,pd,fpt,ti),count:rows.length,rows:rows};
}
function gpFTotals(w){return gpFSumRows(gpFPurposeCompute(w),gpFWindow(w).start);}`,
  "gpFPurposeCompute and gpFTotals: named figures, plus gpFSumRows");

/* ---- 9. Giving and Glance read totalIn, and drop a percent they cannot justify ---- */
swap(
  `function gpFSplitLineShort(r){
  if(!(r.received>0))return 'Nothing received';`,
  `function gpFSplitLineShort(r){
  if(!(r.totalIn>0))return 'Nothing received';`,
  "gpFSplitLineShort reads totalIn");
swap(
  `function gpFSplitLine(r){
  if(!(r.received>0))return 'Nothing received in this window';`,
  `function gpFSplitLine(r){
  if(!(r.totalIn>0))return 'Nothing received in this window';`,
  "gpFSplitLine reads totalIn");
swap(
  `  var base=r.pledgeTotal>0?r.pledgeTotal:r.received;`,
  `  var base=r.pledgeTotal>0?r.pledgeTotal:r.totalIn;`,
  "the bar track falls back to totalIn for a purpose with no pledge");

swap(
  `/* Two-tone bar: pledge payments then other gifts, both against what was pledged. Widths are
   shares of the pledged amount, so an over-funded purpose fills the track and the overspill is
   stated in text rather than drawn. */`,
  `/* Two-tone bar: pledge payments then gifts, both as shares of what was pledged, so an
   over-funded purpose fills the track and the overspill is stated in text rather than drawn.
   The track is the full pledge; a purpose with no pledge takes its own total instead. */`,
  "bar comment: the track is the full pledge");

swap(
  `  var pill=(t.pledgeTotal>0)?('<span class="gpf-pill" style="background:'+col+'">'+ICON(t.status==='funded'?'check_circle':'flag')+gpFPct(t.fulfilled)+' of '+gpFMoney0(t.pledgeTotal)+' pledged</span>'):'';
  var num='<div class="dep-hd-kpigrp"><span class="metric-value">'+gpFMoney0(t.received)+'</span>'+pill+'<span class="gpf-goalpill">'+gpFSplitLine(t)+'</span></div>';
  return '<div class="dep-hd gpf-hd">'+top+'<div class="dep-hd-num"><div class="gpf-numwrap">'+num+'</div>'+
    '<span class="sr-only">'+gpFMoney0(t.received)+' received across '+t.count+' purpose'+(t.count===1?'':'s')+'. '+gpFSplitLine(t)+'. '+gpFMoney0(t.pledgeTotal)+' pledged, '+gpFPct(t.fulfilled)+' fulfilled. '+lbl+'.</span></div></div>';`,
  `  var pill=gpFPledgedPill(t,col);
  var num='<div class="dep-hd-kpigrp"><span class="metric-value">'+gpFMoney0(t.totalIn)+'</span>'+pill+'<span class="gpf-goalpill">'+gpFSplitLine(t)+'</span></div>';
  return '<div class="dep-hd gpf-hd">'+top+'<div class="dep-hd-num"><div class="gpf-numwrap">'+num+'</div>'+
    '<span class="sr-only">'+gpFMoney0(t.totalIn)+' received across '+t.count+' purpose'+(t.count===1?'':'s')+'. '+gpFSplitLine(t)+'. '+gpFPledgedRead(t)+' '+lbl+'.</span></div></div>';`,
  "the header KPI reads totalIn and a pill that can justify itself");

swap(
  `function gpFGlance(w){
  var t=gpFTotals(w),lbl=gpFStatusLabelRow(t.status),col=gpFStatusColor(t.status);
  var pill=(t.pledgeTotal>0)?('<span class="gpf-pill" style="background:'+col+'">'+ICON(t.status==='funded'?'check_circle':'flag')+gpFPct(t.fulfilled)+'</span><span class="gpf-goalpill">of '+gpFMoney0(t.pledgeTotal)+' pledged</span>')
    :'<span class="gpf-goalpill">no pledges in this window</span>';
  return '<div class="kpi-row"><div class="kpi-num">'+
    '<div class="metric-value">'+gpFMoney0(t.received)+'</div>'+`,
  `/* The pledged pill, and the one rule that governs it: a percentage of what was pledged is
   shown only when the window has no start. With a start, the money on screen is this window's
   while the pledge behind it is the whole promise, and a ratio across the two dates would be
   a number the data does not hold. The pledged amount itself still shows. */
function gpFPledgedPill(t,col,bare){
  if(!(t.pledgeTotal>0))return bare?'<span class="gpf-goalpill">no pledges in this window</span>':'';
  var of=gpFMoney0(t.pledgeTotal)+' pledged';
  if(t.windowed)return '<span class="gpf-goalpill">'+(bare?'of ':'')+of+'</span>';
  var p='<span class="gpf-pill" style="background:'+col+'">'+ICON(t.status==='funded'?'check_circle':'flag')+gpFPct(t.fulfilled)+'</span>';
  return bare?(p+'<span class="gpf-goalpill">of '+of+'</span>')
             :('<span class="gpf-pill" style="background:'+col+'">'+ICON(t.status==='funded'?'check_circle':'flag')+gpFPct(t.fulfilled)+' of '+of+'</span>');
}
function gpFPledgedRead(t){
  if(!(t.pledgeTotal>0))return 'Nothing pledged.';
  return gpFMoney0(t.pledgeTotal)+' pledged'+(t.windowed?'':(', '+gpFPct(t.fulfilled)+' fulfilled'))+'.';
}
function gpFGlance(w){
  var t=gpFTotals(w),lbl=gpFStatusLabelRow(t.status),col=gpFStatusColor(t.status);
  var pill=gpFPledgedPill(t,col,true);
  return '<div class="kpi-row"><div class="kpi-num">'+
    '<div class="metric-value">'+gpFMoney0(t.totalIn)+'</div>'+`,
  "gpFPledgedPill and gpFPledgedRead, and Glance reads totalIn");

swap(
  `    '<span class="sr-only">'+gpFMoney0(t.received)+' received across '+t.count+' purpose'+(t.count===1?'':'s')+'. '+gpFSplitLine(t)+'. '+lbl+'.</span>'+
  '</div></div>';
}`,
  `    '<span class="sr-only">'+gpFMoney0(t.totalIn)+' received across '+t.count+' purpose'+(t.count===1?'':'s')+'. '+gpFSplitLine(t)+'. '+lbl+'.</span>'+
  '</div></div>';
}`,
  "the Glance screen-reader line reads totalIn");

swap(
  `  rows.sort(function(a,b){return b.received-a.received;});
  var body=rows.map(function(r){
    var col=gpFStatusColor(r.status),lbl=gpFStatusLabelRow(r.status);
    var pctTxt=(r.pledgeTotal>0)?gpFPct(r.fulfilled):'gifts only';
    var target=(r.pledgeTotal>0)?(' of '+gpFMoney0(r.pledgeTotal)+' pledged'):'';
    var sr=r.label+', '+gpFMoney0(r.received)+' received'+target+'. '+gpFSplitLine(r)+'. '+lbl+'.';`,
  `  rows.sort(function(a,b){return b.totalIn-a.totalIn;});
  var body=rows.map(function(r){
    var col=gpFStatusColor(r.status),lbl=gpFStatusLabelRow(r.status);
    var pctTxt=(r.pledgeTotal>0)?(r.windowed?'':gpFPct(r.fulfilled)):'gifts only';
    var target=(r.pledgeTotal>0)?(' of '+gpFMoney0(r.pledgeTotal)+' pledged'):'';
    var sr=r.label+', '+gpFMoney0(r.totalIn)+' received'+target+'. '+gpFSplitLine(r)+'. '+lbl+'.';`,
  "the bars sort and label on totalIn");

swap(
  `      '<div class="gpf-prow-foot"><span class="gpf-p-amt">'+gpFMoney0(r.received)+' received'+target+'</span>'+`,
  `      '<div class="gpf-prow-foot"><span class="gpf-p-amt">'+gpFMoney0(r.totalIn)+' received'+target+'</span>'+`,
  "the bar foot line reads totalIn");

/* ---- 10. the ledger counts the same lines the figures do ---- */
swap(
  `      var r=gpFDonorPace(pl,asOf,win.end,win);
      if(r.pledgedIn<=0&&r.received<=0)return;
      out.push({kind:'pledge',id:pl.id,donor:pl.donor,pledge:pl,pace:r,amount:r.received,`,
  `      var r=gpFDonorPace(pl,asOf,win.end,win);
      if(r.pledged<=0&&r.receivedThru<=0)return;
      out.push({kind:'pledge',id:pl.id,donor:pl.donor,pledge:pl,pace:r,amount:r.receivedThru,`,
  "the ledger's pledge rows read the pledge's own position");

swap(
  `    gpFOtherGiftsFor(p).forEach(function(g){
      if(!gpFInWindow(g.date,win))return;`,
  `    gpFOtherGiftsFor(p).forEach(function(g){
      if(!gpFCounts(g,win))return;`,
  "the ledger drops unposted, undone and out-of-window gifts");

swap(
  `    var sr=it.donor+', pledge '+it.id+'. Pledged '+gpFMoney(p.pledgedIn)+', received '+gpFMoney(p.received)+', due remaining '+gpFMoney(p.dueRem)+'. '+gpFStatusLabel(p.status)+'.';`,
  `    var sr=it.donor+', pledge '+it.id+'. Pledged '+gpFMoney(p.pledged)+', received '+gpFMoney(p.receivedThru)+', due remaining '+gpFMoney(p.dueRem)+'. '+gpFStatusLabel(p.status)+'.';`,
  "the ledger row's screen-reader line reads the pledge's position");

swap(
  `      '<span class="gpf-dc gpf-dc1">'+gpFMoney(p.pledgedIn)+'</span>'+`,
  `      '<span class="gpf-dc gpf-dc1">'+gpFMoney(p.pledged)+'</span>'+`,
  "the ledger Pledged cell reads the full pledge");

swap(
  `      '<span class="gpf-dc gpf-dc2">'+gpFMoney(p.received)+'</span>'+`,
  `      '<span class="gpf-dc gpf-dc2">'+gpFMoney(p.receivedThru)+'</span>'+`,
  "the ledger Received cell reads the pledge's receipts to date");

swap(
  `    '<span class="gpf-dsum-i"><span class="gpf-dsum-k">Received</span><span class="gpf-dsum-v">'+gpFMoney(comp.received)+'</span></span>'+`,
  `    '<span class="gpf-dsum-i"><span class="gpf-dsum-k">Received</span><span class="gpf-dsum-v">'+gpFMoney(comp.totalIn)+'</span></span>'+`,
  "the pop-up summary's Received reads totalIn");

/* ---- 11. the Summary Table's Received column is the legacy pledge-only figure ----
   The table's own split into Pledges and Gifts modes follows in the table script; this
   is the arithmetic, so that no intermediate state of the file shows a blended column. */
swap(
  `  var sub=gpFSplitLine(r)+((r.pledgeTotal>0)?(' \\u00b7 '+gpFPct(r.fulfilled)+' of pledged'):'');
  var sr=r.label+", pledge total "+gpFMoney(r.pledgeTotal)+", pledge due "+gpFMoney(r.pledgeDue)+", received "+gpFMoney(r.received)+", due remaining "+gpFMoney(r.dueRem)+", percent due "+gpFPct(r.percentDue)+". Open every gift and pledge behind this purposes behind this purpose.";`,
  `  var sub=(r.pledgeTotal>0)?(gpFMoney0(r.fromPledgesThru)+' of '+gpFMoney0(r.pledgeTotal)+' pledged \\u00b7 '+gpFPct(r.fulfilled)+' fulfilled'):'Nothing pledged';
  var sr=r.label+", pledge total "+gpFMoney(r.pledgeTotal)+", pledge due "+gpFMoney(r.pledgeDue)+", received "+gpFMoney(r.fromPledgesThru)+", due remaining "+gpFMoney(r.dueRem)+", percent due "+gpFPct(r.percentDue)+". Open every gift and pledge behind this purpose.";`,
  "the table row's sub-line and aria line are pledge-only");

swap(
  `    '<span class="gpf-c-n">'+gpFMoney(r.received)+'</span>'+
    '<span class="gpf-c-n">'+gpFDueCell(r.dueRem)+'</span>'+`,
  `    '<span class="gpf-c-n">'+gpFMoney(r.fromPledgesThru)+'</span>'+
    '<span class="gpf-c-n">'+gpFDueCell(r.dueRem)+'</span>'+`,
  "the Received column is pledge payments to the thru date");

swap(
  `    '<span class="gpf-c-n">'+gpFMoney(t.received)+'</span>'+
    '<span class="gpf-c-n">'+gpFDueCell(t.dueRem)+'</span>'+`,
  `    '<span class="gpf-c-n">'+gpFMoney(t.fromPledgesThru)+'</span>'+
    '<span class="gpf-c-n">'+gpFDueCell(t.dueRem)+'</span>'+`,
  "the totals row's Received is pledge payments too");

/* ---- 12. the schedule comment no longer names a deleted function ---- */
swap(
  `/* The pledged instalment schedule, stepped exactly as gpFPledgedIn steps it`,
  `/* The pledged instalment schedule, stepped exactly as gpFScheduleRows steps it`,
  "the schedule comment names gpFScheduleRows");

/* ---- guards ---------------------------------------------------------- */
const W17 = t.slice(t.indexOf("var GPF_TODAY="), t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */"));
const code = W17.replace(/\/\*[\s\S]*?\*\//g, "");

/* `r.received` on a PACE record is legitimate: it is the pledge's own money inside the
   window, which Giving reads. What must be gone is the re-scoped pledge and any read of a
   blended figure off a purpose row or a totals object. */
[/gpFPledgedIn/, /pledgedIn/, /[tr]\.received(?![A-Za-z])\s*\)/, /comp\.received(?![A-Za-z])/,
  /received:\s*Math\.round\(\(fromPledges/].forEach(re => {
    const hit = code.split(/\r?\n/).filter(l => re.test(l));
    if (hit.length) throw new Error("a re-scoped or blended read survives: " + re + "\n    " + hit.slice(0, 4).join("\n    "));
  });
if (/received:\s*Math\.round\(\(fromPledges/.test(code)) throw new Error("a blended `received` is still built");
["fromPledgesThru", "totalIn", "gpFCounts", "gpFCountsThru", "gpFSumRows", "gpFPledgedPill", "windowed:"].forEach(n => {
  if (code.indexOf(n) < 0) throw new Error("missing from W17 code: " + n);
});
if ((code.match(/function gpFDonorPace/g) || []).length !== 1) throw new Error("gpFDonorPace is not defined exactly once");
if (!/MEMGIFT[^\n]*pledgeTotal:0,/.test(code)) throw new Error("no purpose with gifts and no active pledge in the fixture");
if (code.indexOf("camp.allowPledges===false") < 0) throw new Error("the AllowPledges gate is missing");
if ((code.match(/posted:false/g) || []).length !== 1 || (code.match(/undone:true/g) || []).length !== 1) {
  throw new Error("the excludable fixture lines are not seeded exactly once each");
}

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("W17 model: one strict purpose basis, three named figures, no re-scoped pledge");
