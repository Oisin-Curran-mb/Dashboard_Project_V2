// One-off, 2026-09-26, owner ruling (docs/decisions/W09.md item 13): a day split between two leave
// types is ONE day. Counts (KPI, group and person badges, Glance figures) count distinct person-days;
// the queue shows one row per date with both types and the total hours, approved or undone together;
// the person pop-up shows the split as separate rows with hours and counts distinct days; the calendar
// shows one marker per person per day. Demo data gains a same-day split (Dana Whitfield, Aug 20).
// Anchored; aborts before writing on any miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W09 Payroll Scheduled Time Off V2 ===== */", B1 = "/* ===== end W09 Payroll Scheduled Time Off V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(B1, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* 1. distinct person-days */
swap("function ptoFPendingCount(w){return ptoFWorkFlat(w).filter(function(fe){return ptoFEff(w,fe)===\"Pending\";}).length;}",
  "/* A calendar day split between two leave types is ONE day: every count is over distinct person-days, not day-lines. */" + NL +
  "function ptoFDayKey(fe){return fe.personKey+\"|\"+fe.year+\"|\"+fe.mo+\"|\"+fe.d;}" + NL +
  "function ptoFDistinctDays(lines){var s={};lines.forEach(function(fe){s[ptoFDayKey(fe)]=1;});return Object.keys(s).length;}" + NL +
  "function ptoFPendingCount(w){return ptoFDistinctDays(ptoFWorkFlat(w).filter(function(fe){return ptoFEff(w,fe)===\"Pending\";}));}", "pending count");
swap("function ptoFPendingNotOutstanding(w){return ptoFWorkFlat(w).filter(function(fe){return ptoFEff(w,fe)===\"Pending\"&&!ptoFDateBeforeToday(fe);}).length;}",
     "function ptoFPendingNotOutstanding(w){return ptoFDistinctDays(ptoFWorkFlat(w).filter(function(fe){return ptoFEff(w,fe)===\"Pending\"&&!ptoFDateBeforeToday(fe);}));}", "glance pending");
swap("function ptoFOutstandingCount(w){return ptoFWorkFlat(w).filter(function(fe){return ptoFIsOutstanding(w,fe);}).length;}",
     "function ptoFOutstandingCount(w){return ptoFDistinctDays(ptoFWorkFlat(w).filter(function(fe){return ptoFIsOutstanding(w,fe);}));}", "glance outstanding");
swap("function ptoFGroupPending(w,key){return ptoFWorkFlat(w).filter(function(fe){return ptoFGroupKey(fe,w)===key&&ptoFEff(w,fe)===\"Pending\";}).length;}",
     "function ptoFGroupPending(w,key){return ptoFDistinctDays(ptoFWorkFlat(w).filter(function(fe){return ptoFGroupKey(fe,w)===key&&ptoFEff(w,fe)===\"Pending\";}));}", "group pending");
swap("function ptoFPersonPending(w,pk){return ptoFWorkFlat(w).filter(function(fe){return fe.personKey===pk&&ptoFEff(w,fe)===\"Pending\";}).length;}",
     "function ptoFPersonPending(w,pk){return ptoFDistinctDays(ptoFWorkFlat(w).filter(function(fe){return fe.personKey===pk&&ptoFEff(w,fe)===\"Pending\";}));}", "person pending");
swap("  var pend=ptoFPendingCount(w),all=ptoFWorkFlat(w).length;", "  var pend=ptoFPendingCount(w),all=ptoFDistinctDays(ptoFWorkFlat(w));", "header caption total");

/* 2. queue: one row per date, types joined, hours totalled, approved / undone together */
const rowStart = blk.indexOf("function ptoFEntryRow(fe,w){"), rowEnd = blk.indexOf("function ptoFQueueOrdered(", rowStart); if (rowStart < 0 || rowEnd < 0) throw new Error("entry row span");
blk = blk.slice(0, rowStart) + [
  "/* One queue row per calendar day. A day split between leave types lists both types and the total hours; Approve / Undo act on every line of that day. */",
  "function ptoFEntryRow(lines,w){",
  "  if(!Array.isArray(lines))lines=[lines];",
  "  var fe=lines[0],ids=lines.map(function(l){return l._id;}).join(\",\");",
  "  var types=[];lines.forEach(function(l){if(types.indexOf(l.type)<0)types.push(l.type);});",
  "  var hours=lines.reduce(function(a,l){return a+(l.hours||0);},0);",
  "  var appr=lines.every(function(l){return ptoFEff(w,l)!==\"Pending\";});",
  "  var isOut=lines.some(function(l){return ptoFIsOutstanding(w,l);});",
  "  var action=appr",
  "    ?('<button class=\"w09-undo\" data-pto=\"pto-unapprove\" data-id=\"'+w.id+'\" data-day=\"'+ptoFEsc(ids)+'\" aria-label=\"Undo approval for '+ptoFDates(fe)+', return this day to pending\">'+ICON(\"undo\")+'Undo</button>')",
  "    :('<button class=\"w09-abtn w09-abtn-appr\" data-pto=\"pto-approve\" data-id=\"'+w.id+'\" data-day=\"'+ptoFEsc(ids)+'\" aria-label=\"Approve time off on '+ptoFDates(fe)+'\">'+ICON(\"check\")+'Approve</button>');",
  "  var otag=isOut?('<span class=\"ptof-otag\" title=\"Past due and still pending\">'+ICON(\"error\")+'Outstanding</span>'):\"\";",
  "  var status=appr?ptoFStatusCell(w,fe):'<span class=\"ptof-chip ptof-chip-pend\">'+ICON(\"schedule\")+'Pending</span>';",
  "  return '<div class=\"wt-row w09-l3'+(appr?\" appr\":\"\")+(isOut?\" ptof-l3-out\":\"\")+'\">'+",
  "    '<span class=\"w09-datecol\">'+ptoFDates(fe)+'</span>'+",
  "    '<span class=\"ptof-typecol\">'+types.join(\", \")+otag+'</span>'+",
  "    '<span class=\"w09-hrcol\">'+hours+' h</span>'+",
  "    '<span class=\"w09-actioncol ptof-statuscol\">'+status+action+'</span></div>';}",
  "function ptoFEntryRowsMerged(lines,w){var order=[],byDay={};lines.forEach(function(fe){var k=ptoFDayKey(fe);if(!byDay[k]){byDay[k]=[];order.push(k);}byDay[k].push(fe);});return order.map(function(k){return ptoFEntryRow(byDay[k],w);}).join(\"\");}",
  ""].join(NL) + blk.slice(rowEnd);
console.log("edited: entry row merges a day's lines");
swap("        html+='<div class=\"wt-row w09-colhead\"><span class=\"w09-datecol\">Date</span><span class=\"ptof-typecol\">Type</span><span class=\"w09-hrcol\">Hrs</span><span class=\"w09-actioncol ptof-statuscol\">Status</span></div>';" + NL +
     "    }" + NL + "    /* Day lines render ONLY for an expanded person. */" + NL + "    if(ptoFOpenMap(w)[u.pk])html+=ptoFEntryRow(u.fe,w);",
     "        html+='<div class=\"wt-row w09-colhead\"><span class=\"w09-datecol\">Date</span><span class=\"ptof-typecol\">Type</span><span class=\"w09-hrcol\">Hrs</span><span class=\"w09-actioncol ptof-statuscol\">Status</span></div>';" + NL +
     "      /* Day rows render ONLY for an expanded person, one row per calendar day. */" + NL +
     "      if(ptoFOpenMap(w)[u.pk])html+=ptoFEntryRowsMerged(units.filter(function(x){return x.pk===u.pk&&x.k===u.k;}).map(function(x){return x.fe;}),w);" + NL +
     "    }", "queue renders merged day rows once per person");
swap("  if(a===\"pto-approve\"){ptoFApprMap(w)[t.getAttribute(\"data-day\")]=\"Approved\";", "  if(a===\"pto-approve\"){var am=ptoFApprMap(w);t.getAttribute(\"data-day\").split(\",\").forEach(function(id){am[id]=\"Approved\";});", "approve every line of the day");
swap("  if(a===\"pto-unapprove\"){ptoFApprMap(w)[t.getAttribute(\"data-day\")]=\"Pending\";", "  if(a===\"pto-unapprove\"){var um=ptoFApprMap(w);t.getAttribute(\"data-day\").split(\",\").forEach(function(id){um[id]=\"Pending\";});", "undo every line of the day");

/* 3. pop-up: distinct days + hours */
swap("function ptoFPersonDaysByState(w,pk,approved){var out={},tot=0;ptoFYearFlat(w).forEach(function(fe){if(fe.personKey!==pk)return;var isA=(ptoFEff(w,fe)===\"Approved\");if(isA!==approved)return;var n=ptoFEntryDays(fe);out[fe.type]=(out[fe.type]||0)+n;tot+=n;});return {by:out,tot:tot};}",
     "function ptoFPersonDaysByState(w,pk,approved){var out={},hrs={},lines=[],hours=0;ptoFYearFlat(w).forEach(function(fe){if(fe.personKey!==pk)return;var isA=(ptoFEff(w,fe)===\"Approved\");if(isA!==approved)return;out[fe.type]=(out[fe.type]||0)+ptoFEntryDays(fe);hrs[fe.type]=(hrs[fe.type]||0)+(fe.hours||0);hours+=(fe.hours||0);lines.push(fe);});return {by:out,hrs:hrs,tot:ptoFDistinctDays(lines),hours:hours};}", "pop-up totals by distinct day + hours");
swap("function ptoFInfoTypes(by){var rows=PTOF_LEAVE_TYPES.filter(function(o){return (by[o.key]||0)>0;});if(!rows.length)return '<div class=\"ptof-info-empty\">None</div>';return rows.map(function(o){var n=by[o.key];return '<div class=\"ptof-info-typ\"><span class=\"ptof-info-typ-nm\">'+o.key+'</span><span class=\"ptof-info-typ-n\">'+n+(n===1?\" day\":\" days\")+'</span></div>';}).join(\"\");}",
     "function ptoFInfoTypes(st){var by=st.by,hrs=st.hrs||{};var rows=PTOF_LEAVE_TYPES.filter(function(o){return (by[o.key]||0)>0;});if(!rows.length)return '<div class=\"ptof-info-empty\">None</div>';return rows.map(function(o){var n=by[o.key],h=hrs[o.key]||0;return '<div class=\"ptof-info-typ\"><span class=\"ptof-info-typ-nm\">'+o.key+'</span><span class=\"ptof-info-typ-n\">'+h+' h &middot; '+n+(n===1?\" day\":\" days\")+'</span></div>';}).join(\"\");}", "type rows carry hours");
swap("  var head='<div class=\"ptof-info-typ ptof-info-pend\"><span class=\"ptof-info-typ-nm\"><strong>'+ptoFDates(fe)+'</strong> &middot; '+fe.type+'</span><span class=\"ptof-info-typ-n\">'+n+(n===1?\" day\":\" days\")+' &middot; '+st+'</span></div>';",
     "  var head='<div class=\"ptof-info-typ ptof-info-pend\"><span class=\"ptof-info-typ-nm\"><strong>'+ptoFDates(fe)+'</strong> &middot; '+fe.type+'</span><span class=\"ptof-info-typ-n\">'+(fe.hours||0)+' h &middot; '+st+'</span></div>';", "pending row shows hours");
swap("  var pendDays=pending.reduce(function(a,fe){return a+ptoFEntryDays(fe);},0);", "  var pendDays=ptoFDistinctDays(pending),pendHours=pending.reduce(function(a,fe){return a+(fe.hours||0);},0);", "pending header counts distinct days");
swap("      '<div class=\"ptof-info-cap\">Pending approval, '+days(pendDays)+'</div>'+pendHtml+", "      '<div class=\"ptof-info-cap\">Pending approval, '+days(pendDays)+' ('+pendHours+' h)</div>'+pendHtml+", "pending header hours");
swap("      '<div class=\"ptof-info-cap ptof-info-cap2\">Taken and approved, '+days(appr.tot)+' this year ('+PTOF_WORK_Y+')</div>'+ptoFInfoTypes(appr.by)+", "      '<div class=\"ptof-info-cap ptof-info-cap2\">Taken and approved, '+days(appr.tot)+' ('+appr.hours+' h) this year, '+PTOF_WORK_Y+'</div>'+ptoFInfoTypes(appr)+", "approved header hours");

/* 4. calendar: one marker per person per day */
swap("      hit.slice(0,maxMarks).forEach(function(fe){marks+=ptoFMarker(fe,w,dd);});" + NL + "      if(hit.length>maxMarks)marks+='<span class=\"ptof-more\" title=\"'+(hit.length-maxMarks)+' more out this day\">+'+(hit.length-maxMarks)+'</span>';",
     "      var byP=ptoFOnePerPerson(w,hit);" + NL + "      byP.slice(0,maxMarks).forEach(function(fe){marks+=ptoFMarker(fe,w,dd);});" + NL + "      if(byP.length>maxMarks)marks+='<span class=\"ptof-more\" title=\"'+(byP.length-maxMarks)+' more out this day\">+'+(byP.length-maxMarks)+'</span>';", "calendar markers per person");
swap("function ptoFEntryRowsMerged(", "/* One marker per person per day; a split day takes its most urgent state (Outstanding, then Pending, then Approved). */" + NL + "function ptoFOnePerPerson(w,lines){var rank={Outstanding:3,Pending:2,Approved:1},best={},order=[];lines.forEach(function(fe){var k=fe.personKey,r=rank[ptoFEffState(w,fe)]||0;if(!best[k]){best[k]=fe;order.push(k);}else if(r>(rank[ptoFEffState(w,best[k])]||0))best[k]=fe;});return order.map(function(k){return best[k];});}" + NL + "function ptoFEntryRowsMerged(", "one-per-person helper");

/* 5. demo data: a same-day split */
swap("      {type:\"Vacation\", d:12, dEnd:14, hours:24, st:\"Pending\"}," + NL + "      {type:\"Sick\", d:3, hours:8, st:\"Approved\", appBy:\"M. Reyes\", appDate:\"Aug 1\"},",
     "      {type:\"Vacation\", d:12, dEnd:14, hours:24, st:\"Pending\"}," + NL + "      {type:\"Sick\", d:20, hours:4, st:\"Pending\"}," + NL + "      {type:\"Personal\", d:20, hours:4, st:\"Pending\"}," + NL + "      {type:\"Sick\", d:3, hours:8, st:\"Approved\", appBy:\"M. Reyes\", appDate:\"Aug 1\"},", "demo: Dana Whitfield Aug 20 split Sick 4h / Personal 4h");
t = t.slice(0, b0) + blk + t.slice(b1);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
// Same day: the Info button's aria-label now describes the new pop-up ("pending days with department
// coverage, and time taken this year").
