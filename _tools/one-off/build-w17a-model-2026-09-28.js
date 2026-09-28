/* One-off, 2026-09-28, Phase A of the W17 rebuild (owner rulings; plan in
   "Step 7 - Version 2/W17 Gifts Pledges - Rebuild Plan (2026-09-28).md").
   Model layer only: the row unit becomes the PURPOSE, Received counts pledge payments AND
   other gifts, the invented goal is retired, and one date window governs every figure.
   Presentation is Phase B; the ledger pop-up is Phase C. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8"); const log = [];
/* replace a whole top-level function body by brace matching, so long bodies need no exact anchor */
function replaceFn(name, next) {
  const head = "function " + name + "(";
  const i = t.indexOf(head); if (i < 0) throw new Error("function missing: " + name);
  if (t.indexOf(head, i + 1) > -1) throw new Error("function ambiguous: " + name);
  let d = 0, end = -1;
  for (let k = t.indexOf("{", i); k < t.length; k++) {
    if (t[k] === "{") d++; else if (t[k] === "}") { d--; if (!d) { end = k + 1; break; } }
  }
  if (end < 0) throw new Error("unterminated: " + name);
  t = t.slice(0, i) + next + t.slice(end); log.push("replaced fn: " + name);
}
function swap(a, b, label) { const n = t.split(a).length - 1; if (n !== 1) throw new Error("anchor x" + n + ": " + label); t = t.replace(a, b); log.push("edited: " + label); }
function cutSpan(startNeedle, endNeedle, repl, label) {
  const i = t.indexOf(startNeedle); if (i < 0) throw new Error("start missing: " + label);
  const j = t.indexOf(endNeedle, i); if (j < 0) throw new Error("end missing: " + label);
  t = t.slice(0, i) + repl + t.slice(j); log.push("replaced span: " + label);
}

/* ---------- 1. the seed data: purposes, media, motivations ---------- */
cutSpan("var GPF_CAMPAIGNS=[", "var GPF_POP=null,",
  [
    "/* Purposes. Money goes into a PURPOSE. A pledge is a promise against it; a gift is money",
    "   actually received for it. A gift may be linked to a pledge (a pledge payment) or stand on",
    "   its own (another gift). BOTH count toward the purpose, which is why this widget is Gifts",
    "   AND Pledges (owner ruling 2026-09-28).",
    "   Legacy note: the shipped panel counts pledge payments only, walking",
    "   GFPledge.GFHistoryDetails on PledgeID. The purpose-wide path GFPurpose.GFHistoryDetails on",
    "   PurposeID exists in the same data model and is unused there; it is what this widget uses.",
    "   Code and Name are real GF_Purpose columns. otherGifts seeds the unpledged giving. */",
    'var GPF_PURPOSES=[',
    '  {code:"FRNKSTOK", name:"Stoke Sell",        pledgeTotal:1200,   pledgePaid:1855,   otherGifts:240,   closed:true,  allPast:true},',
    '  {code:"2020PLED", name:"2020 Pledge",       pledgeTotal:1000,   pledgePaid:96,     otherGifts:0,     closed:false, allPast:true},',
    '  {code:"BLDGFUND", name:"Building Fund",     pledgeTotal:250000, pledgePaid:205000, otherGifts:31500, closed:false, allPast:false},',
    '  {code:"MISSION26",name:"Mission Trip 2026", pledgeTotal:40000,  pledgePaid:41000,  otherGifts:2600,  closed:false, allPast:false},',
    '  {code:"YOUTHCMP", name:"Youth Camp",        pledgeTotal:18000,  pledgePaid:6000,   otherGifts:4200,  closed:false, allPast:false},',
    '  {code:"ORGANRST", name:"Organ Restoration", pledgeTotal:90000,  pledgePaid:72000,  otherGifts:9800,  closed:false, allPast:false},',
    "  /* A purpose with gifts but no pledge. The legacy panel cannot show this row at all, because",
    "     it starts from active pledges; counting gifts makes the money visible (owner, 28 Sep). */",
    '  {code:"MEMGIFT",  name:"Memorial Gifts",    pledgeTotal:0,      pledgePaid:0,      otherGifts:8600,  closed:false, allPast:false}',
    "];",
    "/* A single-purpose instance, so the narrowing filter has an already-narrowed fixture. */",
    "var GPF_PURPOSES_SINGLE=[GPF_PURPOSES[0]];",
    "/* How a gift arrived. Real lookup: GFMedia.Name on the gift row. */",
    'var GPF_MEDIA=["Online","Mail","In person","Bank transfer"];',
    "/* What prompted the gift. Real lookup: GFMotivation, which carries Code and Name and is tied",
    "   to a purpose. */",
    "var GPF_MOTIVATIONS=[",
    '  {code:"APPEAL", name:"Annual appeal"},{code:"WEBSITE",name:"Website"},',
    '  {code:"BULLETIN",name:"Bulletin insert"},{code:"EVENT",name:"Fundraiser event"},',
    '  {code:"UNSOL",  name:"Unsolicited"}',
    "];",
    "/* A gift reference from real fields: CheckNumber for mailed cheques, ReceiptNumber for gifts",
    "   taken in person, the ACH account for bank transfers. Online gifts carry an EFT trace. */",
    "function gpFRefFor(media,rng){",
    '  if(media==="Mail")return "Check #"+(1000+Math.floor(rng()*9000));',
    '  if(media==="In person")return "Receipt #"+(200+Math.floor(rng()*800));',
    '  if(media==="Bank transfer")return "ACH";',
    '  return "EFT "+(100000+Math.floor(rng()*900000));',
    "}",
    ""].join(NL), "seed data becomes purposes, media and motivations");

/* every other reference to the old constant names */
t = t.split("GPF_CAMPAIGNS_SINGLE").join("GPF_PURPOSES_SINGLE").split("GPF_CAMPAIGNS").join("GPF_PURPOSES");
log.push("renamed the data constants everywhere");

/* ---------- 2. the date window ---------- */
replaceFn("gpFRangeBounds",
  ["/* One window governs every figure. The default preset has NO start, so the widget reproduces",
   "   the legacy panel exactly (full pledge amounts, gifts inception-to-date) and can still be",
   "   reconciled against it. Narrower presets set a start, and then every figure is windowed:",
   "   Pledged becomes the instalments scheduled inside the window. The word fiscal is avoided;",
   "   gifts run on the calendar and fiscal implies the General Ledger year (owner, 28 Sep). */",
   "function gpFWindow(w){",
   "  var todayIso=gpFISO(GPF_TODAY),r=(w&&w.gpFRange)||'thru',y=GPF_TODAY.getFullYear(),m=GPF_TODAY.getMonth();",
   "  if(r==='ytd')return {key:r,start:gpFISO(new Date(y,0,1)),end:todayIso};",
   "  if(r==='quarter')return {key:r,start:gpFISO(new Date(y,Math.floor(m/3)*3,1)),end:todayIso};",
   "  if(r==='month')return {key:r,start:gpFISO(new Date(y,m,1)),end:todayIso};",
   "  if(r==='custom')return {key:r,start:(w&&w.gpFStart)||gpFISO(new Date(y,0,1)),end:(w&&w.gpFEnd)||todayIso};",
   "  return {key:'thru',start:null,end:(w&&w.gpFEnd)||todayIso};",
   "}",
   "function gpFRangeBounds(w){return gpFWindow(w);}",
   ""].join(NL));
replaceFn("gpFRangePhrase",
  ["function gpFRangePhrase(w){",
   "  var b=gpFWindow(w),ed=gpFParse(b.end);",
   '  var endTxt=GPF_MON[ed.getMonth()]+" "+ed.getDate()+", "+ed.getFullYear();',
   '  if(!b.start)return "Gifts received through "+endTxt;',
   "  var sd=gpFParse(b.start);",
   '  var st=GPF_MON[sd.getMonth()]+" "+sd.getDate();if(sd.getFullYear()!==ed.getFullYear())st+=", "+sd.getFullYear();',
   '  return "Gifts from "+st+" to "+endTxt;',
   "}",
   "/* true when a gift date falls inside the window (no start means everything up to the end) */",
   "function gpFInWindow(iso,win){return iso<=win.end&&(!win.start||iso>=win.start);}",
   ""].join(NL));

/* ---------- 3. gifts per pledge, and standalone gifts per purpose ---------- */
replaceFn("gpFMakeGifts",
  ["/* Gift transactions against one pledge. Each carries the media it arrived by, the motivation",
   "   that prompted it, and a reference drawn from the real fields (cheque, receipt, ACH, EFT). */",
   "function gpFMakeGifts(rng,total,beginIso,endIso){",
   "  total=Math.round(total);",
   "  if(total<=0)return [];",
   "  var n=1+Math.floor(rng()*5),i;",
   "  var wt=[],ws=0;for(i=0;i<n;i++){var q=0.5+rng();wt.push(q);ws+=q;}",
   "  var amts=[],asum=0;for(i=0;i<n;i++){var v=Math.max(0,Math.round(total*wt[i]/ws));amts.push(v);asum+=v;}",
   "  var diff=total-asum,pi=0,step=diff>0?1:-1,guard=0;",
   "  while(diff!==0&&guard<n*40000){var k=pi%n;var nv=amts[k]+step;if(nv>=0){amts[k]=nv;diff-=step;}pi++;guard++;}",
   "  var b=gpFParse(beginIso),e=gpFParse(endIso);",
   "  var spanDays=Math.max(0,Math.round((e-b)/86400000));",
   "  var days=[];for(i=0;i<n;i++)days.push(Math.floor(rng()*(spanDays+1)));",
   "  days.sort(function(a,c){return a-c;});",
   "  days[n-1]=spanDays;",
   "  var out=[];",
   "  for(i=0;i<n;i++){",
   "    var dt=new Date(b.getTime()+days[i]*86400000);",
   "    var media=GPF_MEDIA[Math.floor(rng()*GPF_MEDIA.length)];",
   "    var mot=GPF_MOTIVATIONS[Math.floor(rng()*GPF_MOTIVATIONS.length)];",
   "    out.push({date:gpFISO(dt),amount:amts[i],ref:gpFRefFor(media,rng),media:media,motive:mot.name,motiveCode:mot.code});",
   "  }",
   "  return out;",
   "}",
   "/* Gifts for the purpose that are NOT linked to any pledge: one-off giving, memorials, an",
   "   appeal response from someone who never pledged. The legacy panel is blind to these; the",
   "   owner ruled on 28 Sep that they count. Deterministic from the purpose code. */",
   "function gpFOtherGiftsFor(p){",
   "  if(p._gpfOther)return p._gpfOther;",
   "  var total=Math.round(p.otherGifts||0);",
   "  if(total<=0){p._gpfOther=[];return p._gpfOther;}",
   "  var rng=gpFRng((p.code.length*104729+total)>>>0),i;",
   "  var n=4+Math.floor(rng()*9); /* 4..12 standalone gifts */",
   "  var wt=[],ws=0;for(i=0;i<n;i++){var q=0.4+rng();wt.push(q);ws+=q;}",
   "  var amts=[],asum=0;for(i=0;i<n;i++){var v=Math.max(1,Math.round(total*wt[i]/ws));amts.push(v);asum+=v;}",
   "  var diff=total-asum,pi=0,step=diff>0?1:-1,guard=0;",
   "  while(diff!==0&&guard<n*40000){var k=pi%n;var nv=amts[k]+step;if(nv>=1){amts[k]=nv;diff-=step;}pi++;guard++;}",
   "  /* spread across the two years up to the as-of anchor, so any window has something in it */",
   "  var endT=GPF_TODAY.getTime(),startT=endT-730*86400000;",
   "  var out=[];",
   "  for(i=0;i<n;i++){",
   "    var dt=new Date(startT+Math.floor(rng()*(endT-startT)));",
   "    var media=GPF_MEDIA[Math.floor(rng()*GPF_MEDIA.length)];",
   "    var mot=GPF_MOTIVATIONS[Math.floor(rng()*GPF_MOTIVATIONS.length)];",
   "    out.push({id:p.code+'-G'+(i+1),donor:GPF_DONORS[Math.floor(rng()*GPF_DONORS.length)],",
   "      date:gpFISO(dt),amount:amts[i],ref:gpFRefFor(media,rng),media:media,motive:mot.name,motiveCode:mot.code});",
   "  }",
   "  out.sort(function(a,c){return a.date<c.date?1:-1;});",
   "  p._gpfOther=out;",
   "  return out;",
   "}",
   ""].join(NL));

/* ---------- 4. pledge generation reads the renamed seed field ---------- */
swap("var rng=gpFRng((camp.code.length*7919+camp.pledgeTotal)>>>0),i;",
     "var rng=gpFRng((camp.code.length*7919+camp.pledgeTotal)>>>0),i;" + NL +
     "  if(!(camp.pledgeTotal>0)){camp._gpfPledges=[];return camp._gpfPledges;} /* a gifts-only purpose has no pledges */",
     "pledge generator: gifts-only purposes have no pledges");
t = t.split("camp.received*pw[i]/pws").join("camp.pledgePaid*pw[i]/pws")
     .split("var pdiff=camp.received-psum").join("var pdiff=camp.pledgePaid-psum");
log.push("pledge generator reads pledgePaid");

/* ---------- 5. per-pledge pace: sum the gifts in the window ---------- */
replaceFn("gpFDonorPace",
  ["/* One pledge, measured inside the window. Received is the SUM OF ITS GIFT LINES in the",
   "   window, not the whole paid amount switched on by a single date (the old all-or-nothing",
   "   read, fixed 28 Sep). Pledged is the full pledge when the window has no start, else the",
   "   instalments scheduled inside it. */",
   "function gpFPledgedIn(pl,win){",
   "  if(!win.start)return pl.pledge;",
   "  var duration=Math.max(1,pl.inst||1),periodic=pl.pledge/duration;",
   "  var b=gpFParse(pl.begin),cnt=0,i;",
   "  for(i=0;i<duration;i++){",
   "    var d=new Date(b.getTime());",
   "    if(pl.freq===12)d.setMonth(d.getMonth()+i);",
   "    else if(pl.freq===4)d.setMonth(d.getMonth()+i*3);",
   "    else d.setFullYear(d.getFullYear()+i);",
   "    var iso=gpFISO(d);",
   "    if(iso>=win.start&&iso<=win.end)cnt++;",
   "  }",
   "  return Math.round(periodic*cnt*100)/100;",
   "}",
   "function gpFDonorPace(pl,asOf,asOfIso,win){",
   "  win=win||{start:null,end:asOfIso};",
   "  var b=gpFParse(pl.begin),e=gpFParse(pl.end);",
   "  var termDays=Math.max(1,Math.round((e-b)/86400000));",
   "  var pledgedIn=gpFPledgedIn(pl,win);",
   "  var due;",
   "  if(win.start){due=pledgedIn;}",
   "  else if(win.end>=pl.end){due=pl.pledge;}",
   "  else{",
   "    var duration=Math.max(1,pl.inst||1),periodic=pl.pledge/duration;",
   "    var iterations=gpFCycles(b,gpFParse(win.end),pl.freq)+1;",
   "    if(iterations<0)iterations=0;",
   "    if(iterations>duration)iterations=duration;",
   "    due=(iterations>=duration)?pl.pledge:periodic*iterations;",
   "  }",
   "  var received=0;",
   "  (pl.gifts||[]).forEach(function(g){if(gpFInWindow(g.date,win))received+=g.amount;});",
   "  received=Math.round(received*100)/100;",
   "  var dueRem=Math.round((due-received)*100)/100;",
   "  var pctPaid=pledgedIn>0?received/pledgedIn:null;",
   "  var expectedFrac=pledgedIn>0?due/pledgedIn:0;",
   "  var daysAhead=(pctPaid==null)?null:(pctPaid-expectedFrac)*termDays;",
   "  var status=(pledgedIn<=0)?'neutral':(received>=pledgedIn?'funded':(dueRem<=0?'current':gpFBandFromDays(daysAhead)));",
   "  return {due:due,received:received,dueRem:dueRem,pledgedIn:pledgedIn,",
   "    outstanding:Math.max(0,pledgedIn-received),pctPaid:pctPaid,daysAhead:daysAhead,status:status,termDays:termDays};",
   "}",
   ""].join(NL));

/* ---------- 6. the row model: pledge payments plus other gifts ---------- */
replaceFn("gpFData",
  ["function gpFData(w){",
   '  if(w.state==="empty"||w.dataset==="empty")return [];',
   '  var pool=(w.dataset==="single")?GPF_PURPOSES_SINGLE:GPF_PURPOSES;',
   "  var c=w.gpFCamp||'All purposes';",
   "  return (c==='All purposes')?pool:pool.filter(function(x){return (x.code+\": \"+x.name)===c;});",
   "}",
   ""].join(NL));
replaceFn("gpFCampCompute",
  ["/* One row per PURPOSE. Received is pledge payments plus other gifts, both inside the window,",
   "   and the two parts are carried separately so the bar and the ledger can show the split. */",
   "function gpFPurposeCompute(w){",
   "  var win=gpFWindow(w),asOf=gpFParse(win.end);",
   "  return gpFData(w).map(function(p){",
   "    var due=0,fromPledges=0,pledged=0;",
   "    gpFDonorsFor(p).forEach(function(pl){",
   "      var r=gpFDonorPace(pl,asOf,win.end,win);",
   "      due+=r.due;fromPledges+=r.received;pledged+=r.pledgedIn;",
   "    });",
   "    var other=0;",
   "    gpFOtherGiftsFor(p).forEach(function(g){if(gpFInWindow(g.date,win))other+=g.amount;});",
   "    due=Math.round(due*100)/100;fromPledges=Math.round(fromPledges*100)/100;",
   "    other=Math.round(other*100)/100;pledged=Math.round(pledged*100)/100;",
   "    var received=Math.round((fromPledges+other)*100)/100;",
   "    var dueRem=Math.round((due-fromPledges)*100)/100;",
   "    return {code:p.code,name:p.name,label:p.code+\": \"+p.name,",
   "      pledgeTotal:pledged,pledgeDue:due,received:received,fromPledges:fromPledges,other:other,",
   "      dueRem:dueRem,percentDue:(due>0?dueRem/due:null),",
   "      fulfilled:(pledged>0?received/pledged:null),",
   "      closed:p.closed,status:gpFRowStatus(pledged,due,fromPledges,received),purpose:p,camp:p};",
   "  });",
   "}",
   "function gpFCampCompute(w){return gpFPurposeCompute(w);}",
   ""].join(NL));
replaceFn("gpFTotals",
  ["function gpFTotals(w){",
   "  var rows=gpFPurposeCompute(w),pt=0,pd=0,rc=0,fp=0,ot=0;",
   "  rows.forEach(function(r){pt+=r.pledgeTotal;pd+=r.pledgeDue;rc+=r.received;fp+=r.fromPledges;ot+=r.other;});",
   "  return {pledgeTotal:pt,pledgeDue:pd,received:rc,fromPledges:fp,other:ot,dueRem:pd-fp,",
   "    fulfilled:(pt>0?rc/pt:null),status:gpFRowStatus(pt,pd,fp,rc),count:rows.length,rows:rows};",
   "}",
   ""].join(NL));

/* ---------- 7. status: pacing against what is due, not bands against an invented goal ---------- */
replaceFn("gpFGoalStatus",
  ["/* Row status from the data the system actually holds: is the money that was due by now here?",
   "   'funded' when total received covers everything pledged, which counting other gifts makes",
   "   reachable. The invented goal bands at 75 and 100 per cent are retired (owner, 28 Sep). */",
   "function gpFRowStatus(pledged,due,fromPledges,received){",
   "  if(!(pledged>0))return (received>0)?'gifts':'none';",
   "  if(received>=pledged)return 'funded';",
   "  if(fromPledges>=due)return 'ontrack';",
   "  return 'behind';",
   "}",
   "function gpFGoalStatus(pct){return pct==null?'none':(pct>=1?'funded':'behind');}",
   ""].join(NL));
replaceFn("gpFGoalColor",
  ["function gpFStatusColor(s){return {funded:'var(--pos-100)',ontrack:'var(--brand-100)',behind:'#e0952b',",
   "  gifts:'var(--am-500)',none:'var(--txt-subtle)'}[s]||'var(--txt-subtle)';}",
   "function gpFGoalColor(s){return gpFStatusColor(s);}",
   ""].join(NL));
replaceFn("gpFGoalLabel",
  ["function gpFStatusLabelRow(s){return {funded:'Fully funded',ontrack:'On track',behind:'Behind',",
   "  gifts:'Gifts only, no pledge',none:'Nothing pledged'}[s]||'';}",
   "function gpFGoalLabel(s){return gpFStatusLabelRow(s);}",
   ""].join(NL));
swap("function gpFStatusLabel(s){return {neutral:'No pledge',full:'Paid in full',",
     "function gpFStatusLabel(s){return {neutral:'No pledge',funded:'Fully paid',current:'Up to date',full:'Up to date',",
     "pledge status labels: 'Paid in full' becomes accurate");

/* ---------- 8. wording: campaign stops meaning purpose ---------- */
[["All Campaigns", "All purposes"], ["All campaigns", "All purposes"],
 ["Purpose (Campaign)", "Purpose"], ["campaign goal progress", "purpose giving"],
 ["campaigns", "purposes"], ["campaign", "purpose"], ["Campaigns", "Purposes"], ["Campaign", "Purpose"]]
  .forEach(function (p) { const n = t.split(p[0]).length - 1; if (n) { t = t.split(p[0]).join(p[1]); log.push("wording: " + p[0] + " -> " + p[1] + " x" + n); } });

if (/gpFCampByLabel|gpFAllCampaigns/.test(t)) log.push("note: gpFCampByLabel / gpFAllCampaigns keep their names (function identifiers, not user-facing)");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); log.forEach(function (l) { console.log(l); });
console.log("done: " + t.split(NL).length + " lines");
