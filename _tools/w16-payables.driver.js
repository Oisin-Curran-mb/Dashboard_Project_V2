/* =====================================================================
   w16-payables.driver.js , W16 Accounts Payable By Due Date, the FINAL block
   (Jo's, kept with its shell hooks; owner ruling 2026-09-27, docs/decisions/W16.md).

   Same hosting idiom as w15-bank.driver.js: run the whole shell, prove only
   her block is left, that the three sizes render with the owner's titles,
   that her controls are intact, and that the registration is the only
   content dispatch.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const META = H.meta("W16");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final, Jo's)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure ------------------------------------------------ */
["apFContent(", 'kind:"payables-mb"', "data-apf", "APF_", "apf-root"].forEach(function (n) { A.absent(S, n, "nothing of ours survives: " + n); });
A.absent(shell.css, ".apf-", "no .apf- rule survives");
["function apContent(", "function apHandleClick(", 'a==="ap-due"', 'a==="ap-open"', "function apPopContent("].forEach(function (n) { A.contains(S, n, "her block holds " + n); });
A.contains(S, 'WIDGETS.register("payables",{content:apContent,modals:{apbill:apInvoiceModalHTML}});', "her content is registered under kind payables, with our invoice pop-up");
A.absent(S.replace(/\/\*[\s\S]*?\*\//g, ""), '    if(w.kind==="payables")return apContent(w);', "the old contentHTML hook is gone (her banner comment still quotes it)");
A.absent(S, 'if(w.kind==="payables-mb")', "no payables-mb branch anywhere");
A.eq((raw.match(/title:"[^"]*",kind:"payables",/g) || []).length, 3, "exactly three registry rows (her banner comment also says kind:payables)");
A.eq((raw.match(/title:"Accounts Payable By Due Date",kind:"payables"/g) || []).length, 3, "all three titled Accounts Payable By Due Date");
["ap2", "ap3", "ap4"].forEach(function (id) { A.absent(raw, 'id:"' + id + '"', "fixture " + id + " gone"); });

/* ---------- 2. host the shell ------------------------------------------ */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},getModal:function(){return modal;},setModal:function(m){modal=m;}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX;
A.ok(EX && EX.WIDGETS, "shell loaded; exports reachable");
EX.stubRender();
A.ok(!!EX.WIDGETS.kinds.payables, "WIDGETS.kinds.payables is registered");

/* ---------- 3. the three sizes render ------------------------------------ */
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "payables"; });
A.eq(rows.length, 3, "three payables rows on the main dashboard");
A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "Glance, Explore and Detail");
rows.forEach(function (w) { w.aploading = false; const html = EX.contentHTML(w); A.ok(html && html.length > 400, w.id + " (" + w.size + ") renders (" + (html || "").length + " bytes)"); A.noEmDash(html, w.id); });
const wide = rows.filter(function (w) { return w.size === "wide"; })[0], xw = rows.filter(function (w) { return w.size === "xwide"; })[0];

/* ---------- 4. her controls are intact ---------------------------------- */
const e = EX.contentHTML(wide), d = EX.contentHTML(xw);
/* Jo phase-2 d7f33b0 (owner, 9 Oct: her widget one to one, except the Glance and the invoice pop-up), then the owner's
   header ruling: no total in the header; the old due-date chip sits where it was, beside her inline search, and her four
   filter tiles under it drive the same filter. */
["All dates", "Overdue", "Due this week", "Due this month"].forEach(function (lbl) { A.contains(e, '<span class="ap-tile-lbl">' + lbl + "</span>", "Explore: filter tile " + lbl); A.contains(d, '<span class="ap-tile-lbl">' + lbl + "</span>", "Detail: filter tile " + lbl); });
A.contains(e, 'data-action="ap-set-due" data-due="week"', "the tiles reuse her ap-set-due handler"); A.contains(e, 'data-action="ap-due"', "Explore: the due-date chip is back in the header (owner, 9 Oct)"); A.contains(d, 'data-action="ap-due"', "Detail: due-date chip");
A.absent(e, "kpi-eyebrow", "no Total due in the header (owner, 9 Oct: the All dates tile carries it)"); A.absent(e, "ap-hd-kpi", "no header total cell"); A.contains(e, 'placeholder="Search vendor, invoice or date"', "Explore: inline search in the header");
wide.apDue = "week"; const ew = EX.contentHTML(wide); A.contains(ew, '<span class="fc-label">Due this week</span>', "picking the Due this week tile relabels the chip: one filter, two controls"); A.contains(ew, 'data-due="week" data-id="' + wide.id + '" aria-pressed="true"', "and the tile shows selected"); wide.apDue = "total";
A.contains(e, 'class="ap-sbadge ap-sbadge-over"', "Explore: overdue rows carry her negative status badge"); A.contains(e, "ap-sbadge-warn", "and due-within-a-month rows the attention badge");
A.contains(e, '<span class="ap-c-inv">', "invoice number is plain text (no code-copy helper in this shell)"); A.absent(e, "codecopy", "no codecopy markup");
A.contains(d, '<div class="dep-col-h">Top vendors owed</div>', "Detail: the right column is Top vendors owed"); A.absent(d, "ap-vendor-drill", "vendor rows do not drill (owner: our pop-up only, not hers)"); A.absent(d, "ap-sum-click", "no drill styling on vendor rows");
A.absent(S, "function apBillModalHTML(", "her invoice pop-up is not ported"); A.absent(S, "function apVendorModalHTML(", "her vendor pop-up is not ported"); A.absent(S, "AP_AVIDPAY", "no AvidPay flag");
A.contains(S, 'if(a==="ap-open"){modal={type:"apbill",', "a row opens our invoice pop-up");
EX.setModal({ type: "apbill", inv: "INV-0003", vendor: "Staples", dueiso: "2026-07-10", amt: "$5,555.00" }); const bm = EX.WIDGETS.modal(); EX.setModal(null);
A.ok(bm && bm.length > 300, "the invoice pop-up renders through the registry"); A.contains(bm, '<span class="modal-title">Invoice INV-0003</span>', "titled with the invoice number");
["Vendor", "Invoice #", "Due date", "Status", "Amount"].forEach(function (k) { A.contains(bm, '<span class="pur-po-fact-k">' + k + "</span>", "fact " + k); }); A.contains(bm, ">Jul 10, 2026<", "due date in full"); A.contains(bm, ">Overdue by 13 days<", "status in words");
A.contains(bm, '<div class="modal-f"><button class="btn naked sm" data-action="ap-openbill" data-inv="INV-0003">', "footer: Open in Accounts Payable on the left, the dashboard's standard (owner, 9 Oct)"); A.contains(bm, 'Open in Accounts Payable</button><button class="btn primary sm" data-action="modal-close">Close</button></div>', "and the standard Close on the right"); A.absent(bm, "Got it", "no Got it");
A.contains(S, 'if(a==="ap-openbill"){setStatus(', "Open in Accounts Payable reports the missing route for now");
["ap-vendor-drill", "ap-bill-close", "ap-schedule-pay"].forEach(function (act) { A.absent(S, 'a==="' + act + '"', "no handler for " + act); });
const kpi = rows.filter(function (w) { return w.size === "kpi"; })[0], g = EX.contentHTML(kpi);
A.absent(g, "scope-chip", "Glance has no Accounts payable chip (owner, 9 Oct)"); A.contains(g, '<div class="metric-value">', "Glance stays ours: the total with the overdue and this-week pills"); A.contains(g, "ap-pill warn", "overdue pill"); A.contains(g, "ap-pill ap-week", "due this week pill"); A.absent(g, "kpi-eyebrow", "no eyebrow at Glance"); A.absent(g, "ap-tile", "no tiles at Glance");
A.contains(e, 'data-acct="', "rows carry her search text so the shell's header search filters them");
EX.setPop({ type: "ap-due", id: wide.id });
A.eq(EX.triggerSelector(), '[data-action="ap-due"][data-id="' + wide.id + '"]', "trigger selector for her pop-up");
const pc = EX.popContent(); A.ok(pc && pc.length > 100, "her pop-up content renders through the shell (" + (pc || "").length + " bytes)");
A.absent(pc, ">By aging<", "chip menu has no aging bands: the tiles above the table are the bands (owner, 9 Oct)"); A.absent(pc, 'data-due="overdue"', "no Overdue option in the menu"); A.contains(pc, ">All due dates<", "All due dates stays"); A.contains(pc, ">Specific due date (earliest first)<", "and the specific dates stay");
EX.setPop(null);

process.exit(A.report());
