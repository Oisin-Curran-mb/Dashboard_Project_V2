/* One-off, 2026-09-27: W13 Encumbrances view (owner: "add the Encumbrance view into my version so the
   options are table Kanban or Encumbrances").
   Legacy basis: the Purchasing Management data panel's "Encumbrances" chart (PurchasingManagement.ascx.cs
   170-178) sums open line dollars per accounting period for the filtered orders; an order encumbers budget
   while it is not closed, Status < 2 and no approval row is rejected (GLAccountRepository.cs:2220).
   Ours: open = stage Pending or Approved, unpaid, no rejected request row; encumbrance = the order total
   (the demo has no line-level dollars applied); period = the issue month. The approval path chip applies;
   the status chip is hidden in this view because encumbrance is the open set by definition.
   Chart classes are copied from Jo's block as purf-enc-* so her block stays untouched. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* 1. view vocabulary */
swap('function purFViewCur(w){return (w.purfView==="table")?"table":"kanban";}',
     'function purFViewCur(w){return (w.purfView==="table")?"table":((w.purfView==="enc")?"enc":"kanban");}', "view: kanban | table | enc");
swap("    seg(\"table\",\"Table\",\"table_rows\",\"Every purchase order over time, including closed and voided ones, with the department, year and overdue filters.\")+",
     "    seg(\"table\",\"Table\",\"table_rows\",\"Every purchase order over time, including closed and voided ones, with the department, year and overdue filters.\")+" + NL +
     "    seg(\"enc\",\"Encumbrances\",\"account_balance_wallet\",\"Budget committed by open purchase orders, by accounting period: pending or approved, unpaid, not rejected.\")+", "toggle: third segment");

/* 2. header in the Encumbrances view */
swap('  chips+=purFChip(w,"status","Status: "+purFStatusCur(w),"PO status, currently "+purFStatusCur(w),loading);',
     '  if(view!=="enc")chips+=purFChip(w,"status","Status: "+purFStatusCur(w),"PO status, currently "+purFStatusCur(w),loading);', "header: no status chip in enc view");
swap("    : '<div class=\"dep-hd-kpigrp\"><span class=\"metric-value\">'+mine+'</span><span class=\"bank-pill\">'+(mine===1?\"needs\":\"need\")+' your approval</span></div>';",
     "    : ((view===\"enc\")?'<div class=\"dep-hd-kpigrp\"><span class=\"metric-value\">'+purFMoney(purFEncTotal(w))+'</span><span class=\"bank-pill\">encumbered, not yet paid</span></div>'" + NL +
     "    : '<div class=\"dep-hd-kpigrp\"><span class=\"metric-value\">'+mine+'</span><span class=\"bank-pill\">'+(mine===1?\"needs\":\"need\")+' your approval</span></div>');", "header: encumbered headline");
swap("  var ctx=loading?\"\":'<div class=\"purf-ctx\">'+pending+' pending approval, '",
     "  var ctx=loading?\"\":(view===\"enc\")?'<div class=\"purf-ctx\">'+purFEncCtx(w)+'</div>':'<div class=\"purf-ctx\">'+pending+' pending approval, '", "header: encumbrance context line");

/* 3. body dispatch */
swap("  return purFHeaderBlock(w)+'<div class=\"purf-body\">'+((view===\"table\")?purFTable(w):purFBoard(w))+'</div>';",
     "  return purFHeaderBlock(w)+'<div class=\"purf-body\">'+((view===\"table\")?purFTable(w):(view===\"enc\")?purFEncView(w):purFBoard(w))+'</div>';", "body: enc view");

/* 4. the view */
swap("function purFBody(w){",
     "/* ---- Encumbrances (legacy data panel chart: open order dollars by accounting period) ----------------" + NL +
     "   Open = stage Pending or Approved, unpaid, no rejected request row (GLAccountRepository.cs:2220: Closed" + NL +
     "   false, Status < 2, no RejectedID). Encumbrance = the order total; the demo has no dollars applied per" + NL +
     "   line. Period = the issue month, as the legacy groups by GL period. Held orders count: the legacy has" + NL +
     "   no hold exclusion. */" + NL +
     "var PURF_MON=[\"Jan\",\"Feb\",\"Mar\",\"Apr\",\"May\",\"Jun\",\"Jul\",\"Aug\",\"Sep\",\"Oct\",\"Nov\",\"Dec\"];" + NL +
     "function purFEncOpen(po){return purFActive(po)&&!po.paid&&po.pay!==\"paid\"&&!(po.appr||[]).some(function(a){return a.state===\"rejected\";});}" + NL +
     "function purFEncRows(w){var pa=purFPathCur(w);return purFDataset(w).filter(function(p){return purFEncOpen(p)&&(pa===\"All approval paths\"||p.path===pa);});}" + NL +
     "function purFEncKey(po){return String(po.issued).slice(0,7);}" + NL +
     "function purFEncLabel(key){var p=key.split(\"-\");return PURF_MON[+p[1]-1]+\" \"+p[0];}" + NL +
     "function purFEncPeriods(w){var map={};purFEncRows(w).forEach(function(p){var k=purFEncKey(p);if(!map[k])map[k]={key:k,label:purFEncLabel(k),amt:0,n:0,orders:[]};map[k].amt+=p.amt;map[k].n++;map[k].orders.push(p);});return Object.keys(map).sort().map(function(k){return map[k];});}" + NL +
     "function purFEncTotal(w){return purFSum(purFEncRows(w));}" + NL +
     "function purFEncCtx(w){var rows=purFEncRows(w),per=purFEncPeriods(w);if(!rows.length)return \"No open purchase orders on this approval path.\";return rows.length+\" open order\"+(rows.length===1?\"\":\"s\")+\" across \"+per.length+\" accounting period\"+(per.length===1?\"\":\"s\")+\". Pending or approved, unpaid, not rejected.\";}" + NL +
     "function purFEncViewCur(w){return (w.purfEncView===\"table\")?\"table\":\"chart\";}" + NL +
     "function purFAxis(n){if(n>=1000)return \"$\"+(n/1000).toFixed(n>=10000?0:1).replace(/\\.0$/,\"\")+\"k\";return \"$\"+Math.round(n);}" + NL +
     "function purFEncChart(w){" + NL +
     "  var data=purFEncPeriods(w);" + NL +
     "  if(!data.length)return '<div class=\"purf-enc-none\">'+purFIcon(\"insights\")+'<div class=\"purf-enc-none-t\">Nothing committed</div><div class=\"purf-enc-none-s\">No open purchase orders, so no budget is encumbered right now.</div></div>';" + NL +
     "  var max=1;data.forEach(function(r){max=Math.max(max,r.amt);});max=max*1.18;" + NL +
     "  var many=data.length>8,cols=\"\",xl=\"\";" + NL +
     "  data.forEach(function(r){var h=Math.max(1,Math.round(r.amt/max*100));" + NL +
     "    var sr=r.label+\": \"+purFMoney(r.amt)+\" encumbered on \"+r.n+(r.n===1?\" order\":\" orders\")+\". Open the list.\";" + NL +
     "    cols+='<button class=\"purf-enc-col\" data-purf=\"enc-pop\" data-id=\"'+w.id+'\" data-v=\"'+r.key+'\" aria-label=\"'+purFEsc(sr)+'\"><span class=\"purf-enc-val\" aria-hidden=\"true\">'+purFAxis(r.amt)+'</span><span class=\"purf-enc-bar\" style=\"height:'+h+'%\"></span></button>';" + NL +
     "    xl+='<div class=\"purf-enc-xcol\"><span class=\"purf-enc-xlbl\">'+r.label+'</span></div>';" + NL +
     "  });" + NL +
     "  var yl='<span>'+purFAxis(max)+'</span><span>'+purFAxis(max/2)+'</span><span>$0</span>';" + NL +
     "  return '<div class=\"purf-enc-chart\">'+" + NL +
     "    '<div class=\"purf-enc-plot\"><div class=\"purf-enc-yax\">'+yl+'</div><div class=\"purf-enc-canvas\"><div class=\"purf-enc-gl\"></div><div class=\"purf-enc-cols'+(many?\" many\":\"\")+'\">'+cols+'</div></div></div>'+" + NL +
     "    '<div class=\"purf-enc-xrow\"><div class=\"purf-enc-yaxsp\"></div><div class=\"purf-enc-xcols'+(many?\" many\":\"\")+'\">'+xl+'</div></div>'+" + NL +
     "    '<div class=\"purf-enc-cap\">'+purFIcon(\"info\")+'Budget reserved by open purchase orders, by accounting period. Click a bar for the orders behind it.</div></div>';" + NL +
     "}" + NL +
     "function purFEncTable(w){" + NL +
     "  var data=purFEncPeriods(w),tot=purFEncTotal(w);" + NL +
     "  var head='<div class=\"wt-row wt-head purf-enc-row\" role=\"row\"><span class=\"lr-main\" role=\"columnheader\">Accounting period</span><span class=\"purf-enc-c\" role=\"columnheader\">Orders</span><span class=\"wt-c2\" role=\"columnheader\">Encumbered</span></div>';" + NL +
     "  var body=data.map(function(r){return '<button class=\"wt-row purf-enc-row purf-enc-trow\" role=\"row\" data-purf=\"enc-pop\" data-id=\"'+w.id+'\" data-v=\"'+r.key+'\" aria-label=\"'+purFEsc(r.label+\": \"+r.n+\" orders, \"+purFMoney(r.amt)+\". Open the list.\")+'\"><span class=\"lr-main\" role=\"cell\">'+r.label+'</span><span class=\"purf-enc-c\" role=\"cell\">'+r.n+'</span><span class=\"wt-c2\" role=\"cell\">'+purFMoney(r.amt)+'</span></button>';}).join(\"\");" + NL +
     "  if(!data.length)body='<div class=\"wt-row purf-enc-row\" role=\"row\"><span class=\"lr-main purf-enc-dim\" role=\"cell\">No open commitments</span><span class=\"purf-enc-c\" role=\"cell\">0</span><span class=\"wt-c2\" role=\"cell\">'+purFMoney(0)+'</span></div>';" + NL +
     "  return '<div class=\"purf-enc-tbl\" role=\"table\" aria-label=\"Encumbrances by accounting period\">'+head+body+'</div><div class=\"dep-total purf-enc-tot\"><span>Total encumbered, not yet paid</span><span>'+purFMoney(tot)+'</span></div>';" + NL +
     "}" + NL +
     "function purFEncView(w){" + NL +
     "  var tier=purFTier(w),v=purFEncViewCur(w);" + NL +
     "  if(tier===\"xwide\")return '<div class=\"purf-enc purf-enc-split\"><div class=\"purf-enc-half\">'+purFEncChart(w)+'</div><div class=\"purf-enc-half\">'+purFEncTable(w)+'</div></div>';" + NL +
     "  var tog='<div class=\"purf-enc-sub\"><div class=\"vtoggle\" role=\"group\" aria-label=\"Encumbrance display\">'+[[\"chart\",\"Chart\",\"bar_chart\"],[\"table\",\"Table\",\"table_rows\"]].map(function(o){return '<button class=\"vt'+(v===o[0]?\" on\":\"\")+'\" data-purf=\"enc-view\" data-id=\"'+w.id+'\" data-v=\"'+o[0]+'\" aria-pressed=\"'+(v===o[0])+'\">'+purFIcon(o[2])+o[1]+'</button>';}).join(\"\")+'</div></div>';" + NL +
     "  return '<div class=\"purf-enc\">'+tog+((v===\"table\")?purFEncTable(w):purFEncChart(w))+'</div>';" + NL +
     "}" + NL +
     "/* Bar or row pop-up: the orders behind one period, each with its lane, so the figure ties back to the board. */" + NL +
     "function purFEncPopHTML(w){" + NL +
     "  var key=PURF_POP.v,per=purFEncPeriods(w).filter(function(r){return r.key===key;})[0];" + NL +
     "  if(!per)return '<div class=\"mi-note purf-popnote\">No open orders in this period.</div>';" + NL +
     "  var rows=purFOldestFirst(per.orders).map(function(p){return '<button class=\"mi purf-enc-mi\" data-purf=\"open\" data-purf-ref=\"'+purFEsc(p.ref)+'\" data-id=\"'+w.id+'\"><span class=\"purf-enc-mi-l\"><span class=\"mi-nm\">'+purFEsc(p.ref)+' '+purFEsc(p.vendor)+'</span><span class=\"purf-enc-mi-s\" style=\"color:'+(PURF_STAGE_TONE[purFLane(p)]||\"inherit\")+'\">'+purFLane(p)+(p.hold?\", on hold\":\"\")+'</span></span><span class=\"purf-enc-mi-a\">'+purFMoney(p.amt)+'</span></button>';}).join(\"\");" + NL +
     "  return '<div class=\"cap\">'+per.label+': '+purFMoney(per.amt)+' encumbered</div>'+rows+'<div class=\"mi-note purf-popnote\">'+per.n+(per.n===1?\" open order\":\" open orders\")+' issued in '+per.label+'. Open one to see its record.</div>';" + NL +
     "}" + NL +
     "function purFBody(w){", "encumbrance functions");

/* 5. pop dispatch + clicks */
swap("  if(t===\"legend\")return purFLegendHTML(w);", "  if(t===\"legend\")return purFLegendHTML(w);" + NL + "  if(t===\"enc\")return purFEncPopHTML(w);", "pop: enc");
swap("  if(a===\"view\"){if(w)w.purfView=v;purFClosePop();render();return;}",
     "  if(a===\"enc-view\"){if(w)w.purfEncView=v;purFClosePop();render();return;}" + NL +
     "  if(a===\"enc-pop\"){if(PURF_POP&&PURF_POP.type===\"enc\"&&PURF_POP.id===id&&PURF_POP.v===v){purFClosePop();return;}PURF_POP={type:\"enc\",id:id,v:v};PURF_Q=\"\";purFRenderPop(t);return;}" + NL +
     "  if(a===\"view\"){if(w)w.purfView=v;purFClosePop();render();return;}", "clicks: enc-view, enc-pop");

/* 6. legend */
swap("  out+='<div class=\"cap\">Moving a card</div>",
     "  out+='<div class=\"cap\">Encumbrances view</div><div class=\"mi-note purf-popnote purf-lg-rules\">Budget reserved by open purchase orders, grouped by the accounting period they were issued in. Open means pending or approved, unpaid and not rejected. Closed, voided and paid orders release their encumbrance.</div>';" + NL +
     "  out+='<div class=\"cap\">Moving a card</div>", "legend: encumbrances note");

t = t.slice(0, b0) + blk + t.slice(b1);

/* 7. CSS (Jo's chart classes copied as purf-enc-*) */
const CEND = "/* ===== end W13 Purchasing Management V2 CSS ===== */";
if (t.split(CEND).length !== 2) throw new Error("css end");
const css = [
  "  /* Encumbrances view: chart (her .pur-* chart copied as purf-enc-*), period table, split at Detail. */",
  "  .purf-root .purf-enc{flex:1;min-height:0;display:flex;flex-direction:column;}",
  "  .purf-root .purf-enc-sub{display:flex;justify-content:flex-end;padding:2px 14px 6px;}",
  "  .purf-root .purf-enc-chart{flex:1;min-height:0;display:flex;flex-direction:column;padding:0 0 4px;}",
  "  .purf-root .purf-enc-plot{flex:1;min-height:150px;display:flex;gap:8px;padding:0 16px;}",
  "  .purf-root .purf-enc-yax{flex:0 0 44px;display:flex;flex-direction:column;justify-content:space-between;font-size:11px;color:var(--txt-subtle);text-align:right;font-variant-numeric:tabular-nums;padding:2px 0;}",
  "  .purf-root .purf-enc-canvas{flex:1;min-width:0;position:relative;border-bottom:1px solid var(--stroke-widget);overflow-x:auto;overflow-y:hidden;}",
  "  .purf-root .purf-enc-gl{position:absolute;left:0;right:0;bottom:50%;border-top:1px dashed var(--stroke-widget);opacity:.5;}",
  "  .purf-root .purf-enc-cols{position:absolute;inset:0;display:flex;align-items:flex-end;gap:12px;padding:0 6px;}",
  "  .purf-root .purf-enc-cols.many{position:relative;min-width:max-content;height:100%;}",
  "  .purf-root .purf-enc-cols.many .purf-enc-col{flex:0 0 46px;}",
  "  .purf-root .purf-enc-col{flex:1 1 0;min-width:0;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;border:0;background:transparent;padding:0;font-family:inherit;cursor:pointer;border-radius:6px;transition:background var(--dur,.15s) ease;}",
  "  .purf-root .purf-enc-col:hover,.purf-root .purf-enc-col:focus-visible{background:var(--wn-300);outline:none;}",
  "  .purf-root .purf-enc-val{font-size:10px;line-height:1.3;color:var(--txt-subtle);font-variant-numeric:tabular-nums;margin-bottom:3px;white-space:nowrap;}",
  "  .purf-root .purf-enc-col:hover .purf-enc-val{color:var(--txt-secondary);}",
  "  .purf-root .purf-enc-bar{display:block;width:58%;max-width:44px;min-height:2px;border-radius:3px 3px 0 0;background:var(--am-600);transition:background var(--dur,.15s) ease;}",
  "  .purf-root .purf-enc-col:hover .purf-enc-bar{background:var(--am-700);}",
  "  .purf-root .purf-enc-xrow{display:flex;gap:8px;padding:6px 16px 0;}",
  "  .purf-root .purf-enc-yaxsp{flex:0 0 44px;}",
  "  .purf-root .purf-enc-xcols{flex:1;min-width:0;display:flex;gap:12px;padding:0 6px;}",
  "  .purf-root .purf-enc-xcols.many{min-width:max-content;}",
  "  .purf-root .purf-enc-xcols.many .purf-enc-xcol{flex:0 0 46px;}",
  "  .purf-root .purf-enc-xcol{flex:1 1 0;min-width:0;display:flex;justify-content:center;}",
  "  .purf-root .purf-enc-xlbl{font-size:11px;color:var(--txt-secondary);white-space:nowrap;}",
  "  .purf-root .purf-enc-cap{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--txt-subtle);padding:9px 16px 4px;}",
  "  .purf-root .purf-enc-cap .material-symbols-rounded{font-size:14px;flex:0 0 auto;}",
  "  .purf-root .purf-enc-none{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;padding:34px 24px;color:var(--txt-subtle);}",
  "  .purf-root .purf-enc-none-t{font-size:13px;font-weight:600;color:var(--txt-secondary);}",
  "  .purf-root .purf-enc-none-s{font-size:12px;}",
  "  .purf-root .purf-enc-tbl{flex:1;min-height:0;overflow-y:auto;}",
  "  .purf-root .purf-enc-row{display:grid;grid-template-columns:1fr 64px 120px;gap:10px;align-items:center;text-align:left;}",
  "  .purf-root .purf-enc-row .lr-main,.purf-root .purf-enc-row .wt-c2,.purf-root .purf-enc-row .purf-enc-c{text-align:left;}",
  "  .purf-root .purf-enc-c{font-size:12.5px;font-variant-numeric:tabular-nums;}",
  "  .purf-root .purf-enc-trow{width:100%;border:0;border-top:1px solid var(--stroke-widget);background:transparent;font:inherit;color:inherit;cursor:pointer;}",
  "  .purf-root .purf-enc-trow:hover,.purf-root .purf-enc-trow:focus-visible{background:var(--wn-100);outline:none;}",
  "  .purf-root .purf-enc-dim{color:var(--txt-subtle);}",
  "  .purf-root .purf-enc-split{flex-direction:row;gap:16px;padding:4px 16px 8px;}",
  "  .purf-root .purf-enc-half{flex:1 1 0;min-width:0;min-height:0;display:flex;flex-direction:column;}",
  "  .purf-root .purf-enc-split .purf-enc-plot,.purf-root .purf-enc-split .purf-enc-xrow{padding-left:0;padding-right:0;}",
  "  .purf-root .purf-enc-split .purf-enc-cap{padding-left:0;padding-right:0;}",
  "  .purf-root .purf-enc-mi{display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%;}",
  "  .purf-root .purf-enc-mi-l{display:flex;flex-direction:column;min-width:0;}",
  "  .purf-root .purf-enc-mi-s{font-size:10.5px;font-weight:600;}",
  "  .purf-root .purf-enc-mi-a{font-size:12px;font-variant-numeric:tabular-nums;flex:0 0 auto;}",
  "  .purf-root .purf-enc-tot{margin-top:auto;}",
  ""].join(NL);
t = t.replace(CEND, css + CEND);
console.log("edited: encumbrance CSS");

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
