/* One-off, 2026-09-28, Phase C of the W17 rebuild. The pop-up stops being a "donors behind
   pace" exception list, which duplicated Remittance Pledges, and becomes the giving ledger for
   one purpose: every pledge and every gift, a type filter, a search box, and each row expanding
   to its own history. Also: the date presets are wired, the retired layout flag goes, and the
   CSS for the two-tone bar and the ledger is added. */
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
function swap(a, b, label) { const n = t.split(a).length - 1; if (n !== 1) throw new Error("anchor x" + n + ": " + label); t = t.replace(a, b); log.push("edited: " + label); }

/* ---------- 1. the date presets ---------- */
swap("  var r=w.gpFRange||'year',b=gpFRangeBounds(w),todayIso=gpFISO(GPF_TODAY);" + NL +
     "  var out='<div class=\"cap\">Date range</div><div role=\"listbox\" aria-label=\"Date range\">';" + NL +
     "  out+=[['year','This year'],['last30','Last 30 days'],['custom','Custom']].map(function(o){" + NL +
     "    var on=r===o[0];" + NL +
     "    return '<button class=\"mi'+(on?\" check\":\"\")+'\" role=\"option\" aria-selected=\"'+on+'\" data-gpf=\"set-range\" data-id=\"'+w.id+'\" data-r=\"'+o[0]+'\">'+(on?ICON(\"check\"):'<span class=\"mi-gap\"></span>')+'<span class=\"mi-nm\">'+o[1]+'</span></button>';",
     "  var r=w.gpFRange||'thru',b=gpFWindow(w),todayIso=gpFISO(GPF_TODAY);" + NL +
     "  var out='<div class=\"cap\">Dates</div><div role=\"listbox\" aria-label=\"Dates\">';" + NL +
     "  out+=GPF_RANGES.map(function(o){" + NL +
     "    var on=r===o[0];" + NL +
     "    return '<button class=\"mi'+(on?\" check\":\"\")+'\" role=\"option\" aria-selected=\"'+on+'\" data-gpf=\"set-range\" data-id=\"'+w.id+'\" data-r=\"'+o[0]+'\" data-tip=\"'+gpFEsc(o[2])+'\" data-tip-plain>'+(on?ICON(\"check\"):'<span class=\"mi-gap\"></span>')+'<span class=\"mi-nm\">'+o[1]+'</span></button>';",
     "range popover: the five presets");
swap("  if(r==='custom'){" + NL +
     "    out+='<div class=\"sep\"></div><div class=\"cap\">Custom range</div><div class=\"gpf-dates\">'+" + NL +
     "      '<label>From<input type=\"date\" id=\"gpfFrom-'+w.id+'\" class=\"gpf-date-input\" data-id=\"'+w.id+'\" data-which=\"start\" value=\"'+b.start+'\" max=\"'+todayIso+'\"></label>'+",
     "  if(r==='custom'){" + NL +
     "    out+='<div class=\"sep\"></div><div class=\"cap\">Custom dates</div><div class=\"gpf-dates\">'+" + NL +
     "      '<label>From<input type=\"date\" id=\"gpfFrom-'+w.id+'\" class=\"gpf-date-input\" data-id=\"'+w.id+'\" data-which=\"start\" value=\"'+(b.start||todayIso)+'\" max=\"'+todayIso+'\"></label>'+",
     "range popover: custom start tolerates no lower bound");
swap('if(r==="custom"){var b=gpFRangeBounds(w);if(!w.gpFStart)w.gpFStart=b.start;if(!w.gpFEnd)w.gpFEnd=b.end;}'.replace(/"/g, "'"),
     "if(r==='custom'){var b=gpFWindow(w);if(!w.gpFStart)w.gpFStart=b.start||gpFISO(new Date(GPF_TODAY.getFullYear(),0,1));if(!w.gpFEnd)w.gpFEnd=b.end;}",
     "set-range: custom seeds a start");

/* ---------- 2. the ledger ---------- */
replaceFn("gpFBehindModalHTML",
  ["/* The giving ledger for one purpose: every pledge and every gift that money came through,",
   "   filterable by type, searchable by donor, pledge or reference, each row expanding to its own",
   "   history. This replaces the old 'donors behind pace' list, which asked Remittance Pledges'",
   "   question rather than this widget's (owner, 28 Sep). */",
   "function gpFLedgerRows(w,p,win){",
   "  var f=(GPF_MODAL&&GPF_MODAL.filter)||'all',q=((GPF_MODAL&&GPF_MODAL.q)||'').trim().toLowerCase();",
   "  var asOf=gpFParse(win.end),out=[];",
   "  if(f!=='gifts'){",
   "    gpFDonorsFor(p).forEach(function(pl){",
   "      var r=gpFDonorPace(pl,asOf,win.end,win);",
   "      if(r.pledgedIn<=0&&r.received<=0)return;",
   "      out.push({kind:'pledge',id:pl.id,donor:pl.donor,pledge:pl,pace:r,amount:r.received,",
   "        date:(pl.gifts&&pl.gifts.length?pl.gifts[pl.gifts.length-1].date:pl.begin),",
   "        refs:(pl.gifts||[]).map(function(g){return g.ref;}).join(' ')});",
   "    });",
   "  }",
   "  if(f!=='pledges'){",
   "    gpFOtherGiftsFor(p).forEach(function(g){",
   "      if(!gpFInWindow(g.date,win))return;",
   "      out.push({kind:'gift',id:g.id,donor:g.donor,gift:g,amount:g.amount,date:g.date,refs:g.ref+' '+g.media+' '+g.motive});",
   "    });",
   "  }",
   "  if(q)out=out.filter(function(it){",
   "    return (it.donor+' '+it.id+' '+it.refs).toLowerCase().indexOf(q)>-1;",
   "  });",
   "  out.sort(function(a,b){return b.amount-a.amount;});",
   "  return out;",
   "}",
   "function gpFLedgerRowHTML(it,w,win){",
   "  var exp=!!(w.gpFPlExp&&w.gpFPlExp[it.id]);",
   "  if(it.kind==='pledge'){",
   "    var p=it.pace,chip=gpFDonorChip(p.status);",
   "    var sr=it.donor+', pledge '+it.id+'. Pledged '+gpFMoney(p.pledgedIn)+', received '+gpFMoney(p.received)+', due remaining '+gpFMoney(p.dueRem)+'.';",
   "    return '<button class=\"gft-drow gft-clickable gpf-grow\" data-gpf=\"gopen\" data-id=\"'+w.id+'\" data-plid=\"'+gpFEsc(it.id)+'\" aria-expanded=\"'+exp+'\" aria-label=\"'+gpFEsc(sr)+'\">'+",
   "      '<span class=\"gft-dexp\">'+ICON(exp?'expand_more':'chevron_right')+'</span>'+",
   "      '<span class=\"gft-dc gft-dc0\"><span class=\"gpf-ldr-nm\">'+it.donor+'</span><span class=\"gpf-ldr-sub\">'+ICON('handshake')+'Pledge '+it.id+'</span></span>'+",
   "      '<span class=\"gft-dc gft-dc1\">'+gpFMoney(p.pledgedIn)+'</span>'+",
   "      '<span class=\"gft-dc gft-dc2\">'+gpFMoney(p.received)+'</span>'+",
   "      '<span class=\"gft-dc gft-dc3\">'+gpFDueCell(p.dueRem)+'</span>'+",
   "      '<span class=\"gft-dstat-h\">'+chip+'</span>'+",
   "    '</button>'+(exp?gpFGiftPanel(it.pledge,win.end):'');",
   "  }",
   "  var g=it.gift;",
   "  var sr2=it.donor+', gift of '+gpFMoney(g.amount)+' on '+gpFFmtDate(g.date)+' by '+g.media+', '+g.motive+', reference '+g.ref+'.';",
   "  return '<button class=\"gft-drow gft-clickable gpf-grow gpf-ldr-gift\" data-gpf=\"gopen\" data-id=\"'+w.id+'\" data-plid=\"'+gpFEsc(it.id)+'\" aria-expanded=\"'+exp+'\" aria-label=\"'+gpFEsc(sr2)+'\">'+",
   "    '<span class=\"gft-dexp\">'+ICON(exp?'expand_more':'chevron_right')+'</span>'+",
   "    '<span class=\"gft-dc gft-dc0\"><span class=\"gpf-ldr-nm\">'+it.donor+'</span><span class=\"gpf-ldr-sub\">'+ICON('redeem')+'Gift, no pledge</span></span>'+",
   "    '<span class=\"gft-dc gft-dc1 gpf-muted\">n/a</span>'+",
   "    '<span class=\"gft-dc gft-dc2\">'+gpFMoney(g.amount)+'</span>'+",
   "    '<span class=\"gft-dc gft-dc3 gpf-muted\">n/a</span>'+",
   "    '<span class=\"gft-dstat-h\"><span class=\"gpf-tag gpf-seg-other-tag\">Other gift</span></span>'+",
   "  '</button>'+(exp?('<div class=\"gft-gifts gpf-ldr-exp\"><div class=\"gft-grow gft-ghead\"><span>Gift date</span><span>Arrived by</span><span>Prompted by</span><span>Reference</span><span class=\"gft-ga\">Amount</span></div>'+",
   "    '<div class=\"gft-grow\"><span>'+gpFFmtDate(g.date)+'</span><span>'+g.media+'</span><span>'+g.motive+' ('+g.motiveCode+')</span><span>'+g.ref+'</span><span class=\"gft-ga\">'+gpFMoney(g.amount)+'</span></div></div>'):'');",
   "}",
   "function gpFLedgerModalHTML(){",
   "  if(!GPF_MODAL)return '';",
   "  var w=find(GPF_MODAL.id);if(!w)return '';",
   "  var p=gpFCampByLabel(w,GPF_MODAL.label);if(!p)return '';",
   "  var win=gpFWindow(w);",
   "  var comp=gpFPurposeCompute({id:w.id,size:w.size,dataset:w.dataset,gpFCamp:p.code+': '+p.name,gpFRange:w.gpFRange,gpFStart:w.gpFStart,gpFEnd:w.gpFEnd})[0];",
   "  if(!comp)return '';",
   "  var col=gpFStatusColor(comp.status);",
   "  var summary='<div class=\"gft-dsum\">'+",
   "    '<span class=\"gft-dsum-i\"><span class=\"gft-dsum-k\">Pledge Total</span><span class=\"gft-dsum-v\">'+gpFMoney(comp.pledgeTotal)+'</span></span>'+",
   "    '<span class=\"gft-dsum-i\"><span class=\"gft-dsum-k\">Pledge Due</span><span class=\"gft-dsum-v\">'+gpFMoney(comp.pledgeDue)+'</span></span>'+",
   "    '<span class=\"gft-dsum-i\"><span class=\"gft-dsum-k\">Pledge payments</span><span class=\"gft-dsum-v\">'+gpFMoney(comp.fromPledges)+'</span></span>'+",
   "    '<span class=\"gft-dsum-i\"><span class=\"gft-dsum-k\">Other gifts</span><span class=\"gft-dsum-v\">'+gpFMoney(comp.other)+'</span></span>'+",
   "    '<span class=\"gft-dsum-i\"><span class=\"gft-dsum-k\">Received</span><span class=\"gft-dsum-v\">'+gpFMoney(comp.received)+'</span></span>'+",
   "    '<span class=\"gft-dsum-i\"><span class=\"gpf-badge\" style=\"color:'+col+';border-color:'+col+'\">'+ICON(comp.status==='funded'?'check_circle':'flag')+gpFStatusLabelRow(comp.status)+'</span></span>'+",
   "  '</div>';",
   "  var f=(GPF_MODAL.filter)||'all',q=GPF_MODAL.q||'';",
   "  var tabs=[['all','All'],['pledges','Pledge payments'],['gifts','Other gifts']].map(function(o){",
   "    return '<button class=\"vt'+(f===o[0]?' on':'')+'\" data-gpf=\"ledger-filter\" data-v=\"'+o[0]+'\" aria-pressed=\"'+(f===o[0])+'\">'+o[1]+'</button>';",
   "  }).join('');",
   "  var search='<div class=\"gpf-ldr-search\">'+ICON('search')+'<input type=\"text\" id=\"gpfLedgerQ\" class=\"gpf-ldr-input\" placeholder=\"Search donor, pledge or reference\" value=\"'+gpFEsc(q)+'\" aria-label=\"Search this purpose\"></div>';",
   "  var bar='<div class=\"gpf-ldr-bar\"><div class=\"vtoggle\" role=\"group\" aria-label=\"Type\">'+tabs+'</div>'+search+'</div>';",
   "  var rows=gpFLedgerRows(w,p,win);",
   "  var head='<div class=\"gft-drow wt-head\"><span class=\"gft-dexp\"></span><span class=\"gft-dc gft-dc0\">Donor</span>'+",
   "    '<span class=\"gft-dc gft-dc1\">Pledged</span><span class=\"gft-dc gft-dc2\">Received</span>'+",
   "    '<span class=\"gft-dc gft-dc3\">Due Remaining</span><span class=\"gft-dstat-h\">Type</span></div>';",
   "  var list=rows.length",
   "    ? '<div class=\"gpf-drill-tbl\">'+head+rows.map(function(it){return gpFLedgerRowHTML(it,w,win);}).join('')+'</div>'",
   "    : '<div class=\"gft-tab-empty\">'+ICON('search_off')+(q?('Nothing matches \"'+gpFEsc(q)+'\" in this purpose.'):'Nothing received for this purpose in this window.')+'</div>';",
   "  var note=rows.length?(rows.length+' entr'+(rows.length===1?'y':'ies')+', largest first. Open one to see its history.'):'';",
   "  return '<div class=\"modal-backdrop\" data-gpf=\"detail-close\"><div class=\"modal modal-wide gft-detail-modal gpf-modal\" data-gpf=\"stop\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+gpFEsc(comp.label+', every gift and pledge')+'\">'+",
   "    '<div class=\"modal-h gft-detail-h\"><span class=\"modal-title\"><span class=\"material-symbols-rounded gft-detail-ic\">volunteer_activism</span>'+comp.label+'</span><span class=\"gft-dsub\">every gift and pledge, '+gpFRangePhrase(w).toLowerCase()+'</span><span class=\"gft-dh-spacer\"></span>'+",
   "      '<button class=\"iconbtn\" data-gpf=\"detail-close\" aria-label=\"Close\">'+ICON('close')+'</button></div>'+",
   "    '<div class=\"modal-b gft-detail-b\">'+summary+bar+",
   "      (note?('<div class=\"gft-ctx gpf-cap\">'+ICON('receipt_long')+'<span>'+note+'</span></div>'):'')+list+'</div>'+",
   "    '<div class=\"modal-f\"><button class=\"btn naked sm\" data-gpf=\"open-record\" data-c=\"'+gpFEsc(comp.label)+'\">'+ICON('open_in_new')+'Open in Gifts and Pledges</button><button class=\"btn primary sm\" data-gpf=\"detail-close\">Close</button></div></div></div>';",
   "}",
   "function gpFBehindModalHTML(){return gpFLedgerModalHTML();}",
   ""].join(NL));

/* ---------- 3. filter and search handling ---------- */
swap("  if(a==='detail-close'){GPF_MODAL=null;gpFRenderModal();return;}",
     ["  if(a==='ledger-filter'){if(GPF_MODAL){GPF_MODAL.filter=t.getAttribute('data-v');gpFRenderModal();}return;}",
      "  if(a==='detail-close'){GPF_MODAL=null;gpFRenderModal();return;}"].join(NL),
     "click: the ledger type filter");
swap("  document.addEventListener('change',function(e){", ["  /* The ledger search filters in place and keeps focus and caret, so typing never blinks. */",
     "  document.addEventListener('input',function(e){",
     "    if(!(e.target&&e.target.id==='gpfLedgerQ'))return;",
     "    if(!GPF_MODAL)return;",
     "    GPF_MODAL.q=e.target.value;",
     "    var pos=e.target.selectionStart;gpFRenderModal();",
     "    var el2=document.getElementById('gpfLedgerQ');",
     "    if(el2){el2.focus();try{el2.setSelectionRange(pos,pos);}catch(x){}}",
     "  });",
     "  document.addEventListener('change',function(e){"].join(NL),
     "input: the ledger search keeps focus and caret");

/* ---------- 4. retire the layout flag ---------- */
swap("var GPF_V12_LAYOUT=true;" + NL, "", "retired GPF_V12_LAYOUT");
{
  const i = t.indexOf("  if(!GPF_V12_LAYOUT){"); if (i < 0) throw new Error("layout branch");
  let d = 0, end = -1;
  for (let k = t.indexOf("{", i + 5); k < t.length; k++) { if (t[k] === "{") d++; else if (t[k] === "}") { d--; if (!d) { end = k + 1; break; } } }
  while (t.slice(end, end + NL.length) === NL) end += NL.length;
  t = t.slice(0, i) + t.slice(end); log.push("removed the pre-v1.2 layout branch");
}

/* ---------- 5. view toggle and export wording ---------- */
swap('seg("goal","Goal Progress","flag","Progress toward each purpose goal, closest to goal first, coloured and labelled by status.")',
     'seg("goal","Giving","volunteer_activism","What each purpose has received, most received first, with pledge payments and other gifts shown separately.")',
     "view toggle: Giving replaces Goal Progress");

/* ---------- 6. registry defaults ---------- */
t = t.split('gpFRange:"year"').join('gpFRange:"thru"');
log.push("registry rows default to the through-date preset");

/* ---------- 7. CSS ---------- */
{
  const CEND = "  /* ===== end W17 Gifts Pledges V2 CSS ===== */";
  if (t.split(CEND).length !== 2) throw new Error("css end");
  const css = [
    "  /* Two-tone giving bar: pledge payments and other gifts, over her .gft-track geometry. */",
    "  .gpf-root .gft-track{position:relative;}",
    "  .gpf-root .gpf-seg-pledge{background:var(--am-500);}",
    "  .gpf-root .gpf-seg-other{background:var(--am-200);position:absolute;top:0;bottom:0;}",
    "  .gpf-root .gpf-lg-sw.gpf-seg-pledge,.gpf-root .gpf-lg-sw.gpf-seg-other{position:static;}",
    "  .gpf-root .gpf-split{font-size:11px;color:var(--txt-subtle);}",
    "  /* The giving ledger: type filter, search, and a row per pledge or gift. */",
    "  .gpf-root .gpf-ldr-bar,.gpf-modal .gpf-ldr-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:2px 0 8px;}",
    "  .gpf-modal .gpf-ldr-search{display:flex;align-items:center;gap:6px;flex:1;min-width:180px;background:var(--wn-100);border:1px solid var(--stroke-widget);border-radius:9px;padding:6px 10px;}",
    "  .gpf-modal .gpf-ldr-search .material-symbols-rounded{font-size:17px;color:var(--txt-subtle);}",
    "  .gpf-modal .gpf-ldr-input{flex:1;min-width:0;border:0;background:transparent;font-family:inherit;font-size:13px;color:var(--txt-primary);outline:none;}",
    "  .gpf-modal .gpf-ldr-nm{display:block;font-weight:600;}",
    "  .gpf-modal .gpf-ldr-sub{display:inline-flex;align-items:center;gap:3px;font-size:11px;color:var(--txt-subtle);}",
    "  .gpf-modal .gpf-ldr-sub .material-symbols-rounded{font-size:13px;}",
    "  .gpf-modal .gpf-tag{display:inline-flex;align-items:center;font-size:10.5px;font-weight:600;border-radius:5px;padding:2px 6px;background:var(--am-100);color:var(--am-700);}",
    "  .gpf-modal .gpf-ldr-gift .gft-dc0 .gpf-ldr-sub{color:var(--am-700);}",
    "  .gpf-modal .gpf-ldr-exp .gft-grow{display:grid;grid-template-columns:1fr 1fr 1.4fr 1fr auto;gap:10px;}",
    "  /* Declared: both were used by our markup and never had a rule (found 28 Sep). */",
    "  .gpf-root .gpf-empty{padding:18px 16px;font-size:13px;color:var(--txt-subtle);text-align:center;}",
    "  .gpf-root .gpf-date-input{font-family:inherit;font-size:12.5px;padding:5px 7px;border:1px solid var(--stroke-widget);border-radius:7px;background:var(--surface-widget);color:var(--txt-primary);}",
    ""].join(NL);
  t = t.replace(CEND, css + CEND); log.push("added the CSS for the two-tone bar, the ledger and the two undeclared classes");
}

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); log.forEach(function (l) { console.log(l); });
console.log("done: " + t.split(NL).length + " lines");
