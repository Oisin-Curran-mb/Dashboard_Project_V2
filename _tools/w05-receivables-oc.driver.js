/* =====================================================================
   w05-receivables-oc.driver.js , W05 Receivable Invoices Outstanding
   (kind receivables-oc, prefix arO) verification driver for the
   2026-09-07 V2 re-port (Final Check build v2.3, FC_VERSION[5]='2.3').

   W05 is a style-(a) port like W01-W04: arOHandleClick / arOPopContent are
   real functions dispatched from Jo's shared listener, so the extracted
   block is directly runnable and this driver calls them as the shell would.

   V2 specifics asserted here (Step 4 "W05 - Receivable Invoices
   Outstanding.md", stamped 2026-08-30 against v2.3):
     - SIX aging bands with exact boundaries: Current (days<=0, not yet due),
       1-30, 31-60, 61-90, 91-120, 121+; six severity colours led by --am-100
     - overdue is days>0 (v2.1; was days>30)
     - every band renders as a row even at zero; a zero row is inert
     - band click -> invoice list modal; per-customer rollup agrees with the
       band totals to the cent; pager pages without changing totals
     - PIE as a third toggle segment; toggle renders at Detail too
     - drill modal tabs (Details/Attachments/Note/Payments) + checkbox +
       always-enabled Confirm + "Move to unposted transactions" note
     - empty / everything-current / nothing-outstanding states
     - no em dashes anywhere; titles use the (OC) convention

   Run from this folder:  node w05-receivables-oc.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const shell = H.loadShell();
const S = shell.script;
const A = new H.Assert("W05 receivables-oc (V2 re-port)");

/* ---------- extraction (verbatim region out of the real file) ---------- */
const block = "/*" + H.extractRegion(S,
  '===== W05 Receivable Invoices Outstanding V2 JS (prefix: arO, kind:"receivables-oc") =====',
  'document.addEventListener("mousemove",function(e){var row=e.target.closest&&e.target.closest(".arO-barrow[data-arOpop]");if(!row){if(arOPopEl)arOHidePop();return;}arOShowPop(row,e.clientX,e.clientY);});');

/* ---------- structural markers and dispatch (Jo's pre-existing lines) -- */
A.ok(S.indexOf('if(w.kind==="receivables-oc")return arOContent(w);') > -1, "contentHTML dispatch line present");
A.ok(S.indexOf('if(w.kind==="receivables-oc")return {h:w.title,') > -1, "aboutOf branch present");
A.ok(S.indexOf('if(a&&a.indexOf("arO-")===0&&arOHandleClick(a,id,t))return;') > -1, "click-listener dispatch present");
A.ok(S.indexOf('if(pop.type==="arO-rc"||pop.type==="arO-source")return arOPopContent();') > -1, "popContent dispatch present");
A.ok(S.indexOf('if(pop.type==="arO-rc")return \'[data-action="arO-rc"][data-id="\'+pop.id+\'"]\';') > -1, "triggerSelector arO-rc branch present");
A.ok(S.indexOf('if(pop.type==="arO-source")return \'[data-action="arO-source"][data-id="\'+pop.id+\'"]\';') > -1, "triggerSelector arO-source branch present");
A.ok(S.indexOf('if(modal.type==="arOdetail"){mr.innerHTML=arODetailModalHTML();return;}') > -1, "renderModal dispatch present");
A.ok(shell.css.indexOf("Receivable Invoices Outstanding (MB updated) v W05") > -1, "CSS region marker (MB updated wording) present");

/* the OLD port's artifacts are genuinely gone */
[".arO-dcheck{", ".arO-cn-lbl{", ".arO-cn-count{", ".arO-cn-live"].forEach(function (bad) {
  A.absent(shell.css, bad, "old CSS rule " + bad + " absent");
});
A.absent(block, "check_box_outline_blank", "old glyph checkbox absent from the block");
A.absent(block, "+'No balance in '", "old collapsed zero-band note absent from the block");
/* Jo's own ar widget is untouched: her five-band AR_BUCKETS still has cur at hi:30 */
A.ok(S.indexOf('var AR_BUCKETS=') > -1 && /var AR_BUCKETS=\[\s*\{key:"cur",label:"Current",sub:"not yet overdue",hi:30,sev:0\}/.test(S), "Jo's own AR_BUCKETS untouched (five bands, cur hi:30)");

/* every class our markup emits is declared (ours in our block, shared in the shell) */
A.cssDeclares(shell.css, ["arO-chip", "arO-ctlrow", "arO-numwrap", "arO-ctx",
  "arO-glance-read", "arO-stack", "arO-seg", "arO-glance-cap", "arO-cap-ok", "arO-sevdot", "arO-allset",
  "arO-empty", "arO-body", "arO-explore", "arO-panel", "arO-panel-h",
  "arO-bars", "arO-barrow", "arO-clickable", "arO-barrow-zero", "arO-barlbl", "arO-barlbl-nm",
  "arO-barlbl-sub", "arO-bartrack", "arO-barfill", "arO-barval", "arO-barval-amt", "arO-barval-cnt",
  "arO-zeroline", "arO-custbar", "arO-pager", "arO-pager-txt",
  "arO-pie", "arO-arc", "arO-leg", "arO-leg-zero", "arO-chart-empty",
  "arO-skel", "arO-skel-bars", "arO-sk-row", "arO-sk-bar",
  "arO-detail-modal", "arO-detail-h", "arO-dsub", "arO-dh-spacer", "arO-detail-scroll",
  "arO-dhead", "arO-drow", "arO-dexp", "arO-dc", "arO-dc0", "arO-dc1", "arO-dc4", "arO-dc-amt",
  "arO-drawer", "arO-tabbar", "arO-tab", "arO-tabpanel", "arO-tab-empty",
  "arO-lines", "arO-lrow", "arO-lhead", "arO-ld", "arO-lq", "arO-lu", "arO-la",
  "arO-pays", "arO-prow", "arO-phead", "arO-pa",
  "arO-atts", "arO-att", "arO-att-nm", "arO-att-sz", "arO-note", "arO-dtotal", "arO-actions",
  "arO-check", "arO-check-sp", "arO-modal-f", "arO-f-spacer", "arO-f-btns",
  "arO-confirm-note", "arO-confirm-primary", "arO-confirm-sub",
  "dep-hd", "dep-hd-top", "dep-hd-toggle", "dep-hd-num", "dep-hd-kpigrp",
  "filter-chip", "fc-label", "vtoggle", "vt", "kpi-row", "kpi-num", "gl-sub", "bgt-caption",
  "metric-value", "bank-pill", "delta-pill", "state", "state-title", "state-sub",
  "sk", "bgt-spin", "bgt-skel-cap", "wt-row", "wt-head", "dep-total", "btn", "iconbtn",
  "mi", "mi-gap", "cap", "sr-only",
  "modal", "modal-wide", "modal-backdrop", "modal-h", "modal-b", "modal-f", "modal-title",
  "pie-wrap", "donut", "donut-c1", "donut-c2", "legend", "legend-col", "legend-head", "legend-hd",
  "leg", "lg-main", "lg-meta", "dot",
  "bgt-pop", "bgt-pop-h", "bgt-pop-r", "bgt-pop-lbl", "bgt-pop-v", "bgt-pop-div", "bgt-pop-var", "bgt-pop-fav"],
  "W05 class list");

/* ---------- registry ---------------------------------------------------- */
const registry = H.extractRegistry(S, "receivables-oc");
A.eq(registry.length, 6, "six live receivables-oc registry entries");
["arO", "arO_k", "arO2", "arO3", "arO4", "arO5"].forEach(function (id, i) {
  A.eq(registry[i].id, id, "registry order: " + id);
});
registry.forEach(function (w) {
  A.ok(/\(OC[,)]/.test(w.title), "title uses the (OC) convention: " + w.title);
  A.noEmDash(w.title, "registry title " + w.id);
  A.eq(w.arOCustPage, 0, w.id + " carries arOCustPage:0");
});
A.eq(registry[0].size, "wide", "arO is the Explore card");
A.eq(registry[1].size, "kpi", "arO_k is the Glance card");
A.eq(registry[2].size, "xwide", "arO2 is the Detail card");
A.eq(registry[2].arOGroup, "customer", "arO2 demos the customer rollup");
A.eq(registry[3].dataset, "current", "arO3 is the everything-current card");
A.eq(registry[4].dataset, "single", "arO4 is the single-band card");
A.eq(registry[5].state, "empty", "arO5 is the nothing-outstanding card");

/* ---------- run the real code ------------------------------------------ */
const env = H.runBlock(block, { registry: registry, dataAttr: "data-action",
  globals: { innerWidth: 1440, innerHeight: 900 } });
const ctx = env.ctx, shim = env.shim, log = env.log;

function w(id) { return registry.filter(function (x) { return x.id === id; })[0]; }
function click(a, id, extra) {
  const bag = Object.assign({ "data-id": id || "" }, extra || {});
  return ctx.arOHandleClick(a, id, shim.mkTarget(bag));
}

/* ---------- V2 band set and boundaries (the owner's six-band ruling) ---- */
const B = ctx.ARO_BUCKETS;
A.eq(B.length, 6, "exactly six aging bands");
A.eq(B.map(function (b) { return b.label; }).join("|"),
  "Current|1-30 days|31-60 days|61-90 days|91-120 days|121+ days", "band labels in severity order");
A.eq(B[0].hi, 0, "Current means not yet due (hi:0), the v2.1 correction");
A.eq(B[1].hi, 30, "1-30 upper bound"); A.eq(B[2].hi, 60, "31-60 upper bound");
A.eq(B[3].hi, 90, "61-90 upper bound"); A.eq(B[4].hi, 120, "91-120 upper bound");
A.eq(B[5].hi, Infinity, "121+ is unbounded");
A.eq(ctx.ARO_SEV_COLORS.length, 6, "six severity colours");
A.eq(ctx.ARO_SEV_COLORS[0], "--am-100", "Current takes the new lightest step");
A.eq(ctx.ARO_SEV_COLORS[5], "--am-700", "121+ keeps the darkest step");
/* boundary maths, both sides of every edge */
[[-12, "cur"], [0, "cur"], [1, "b0"], [30, "b0"], [31, "b1"], [60, "b1"],
 [61, "b2"], [90, "b2"], [91, "b3"], [120, "b3"], [121, "b4"], [500, "b4"]].forEach(function (t) {
  A.eq(ctx.arOBucketOf(t[0]), t[1], "bucketOf(" + t[0] + ") = " + t[1]);
});
A.eq(ctx.arOSevOf(0), 0, "sevOf(0) is Current"); A.eq(ctx.arOSevOf(21), 1, "sevOf(21) is 1-30 (the INV-3002 bug case)");
A.eq(ctx.arOSevOf(121), 5, "sevOf(121) is the worst band");

/* dataset facts */
A.eq(ctx.ARO_INV.length, 23, "23 invoices in the main dataset (v2.1 Rule 11)");
const bandRows = ctx.arOBuckets(w("arO"));
bandRows.forEach(function (r) { A.ok(r.count > 0, "band " + r.label + " has data in the main dataset"); });

/* ---------- rollup agreement, to the cent ------------------------------ */
const total = ctx.arOTotal(w("arO"));
const bandSum = bandRows.reduce(function (s, r) { return s + r.total; }, 0);
const custRows = ctx.arOCustomers(w("arO"));
const custSum = custRows.reduce(function (s, r) { return s + r.total; }, 0);
A.eq(bandSum, total, "band totals sum to the widget total, to the cent");
A.eq(custSum, total, "per-customer rollup sums to the widget total, to the cent");
A.eq(bandRows.reduce(function (s, r) { return s + r.count; }, 0), 23, "band counts sum to 23");
A.eq(custRows.reduce(function (s, r) { return s + r.count; }, 0), 23, "customer counts sum to 23");
A.eq(custRows.length, 23, "23 distinct customers");

/* ---------- overdue pill maths (v2.1: overdue is days>0) --------------- */
const expOver = ctx.ARO_INV.filter(function (x) { return x.days > 0; })
  .reduce(function (s, x) { return s + x.amount; }, 0);
const expOverN = ctx.ARO_INV.filter(function (x) { return x.days > 0; }).length;
A.eq(ctx.arOOverdue(w("arO")), expOver, "overdue sums every invoice with days>0");
A.eq(ctx.arOOverdueCount(w("arO")), expOverN, "overdue count matches days>0");
A.ok(ctx.ARO_INV.some(function (x) { return x.days > 0 && x.days <= 30; }), "the 1-30 case exists, so the old days>30 rule would fail this assertion");
const pill = ctx.arOOverduePill(w("arO"));
A.contains(pill, "$" + Math.round(expOver).toLocaleString("en-US"), "pill carries the overdue dollars");
A.contains(pill, "(" + Math.round(expOver / total * 100) + "%)", "pill carries the overdue share of the total");

/* ---------- initial render at each tier -------------------------------- */
const kpiHTML = ctx.arOContent(w("arO_k"));
A.contains(kpiHTML, ctx.arOEsc ? "metric-value" : "metric-value", "Glance has the KPI number");
A.contains(kpiHTML, "owed to you across 23 unpaid invoices", "Glance caption counts the invoices");
A.contains(kpiHTML, "arO-stack", "Glance carries the stacked severity bar");
A.contains(kpiHTML, "sr-only", "Glance carries sr-only text");
A.contains(kpiHTML, "bank-pill", "Glance shows the overdue pill (money is overdue)");

const expHTML = ctx.arOContent(w("arO"));
A.contains(expHTML, 'data-v="aging"', "toggle: Aging segment");
A.contains(expHTML, 'data-v="customer"', "toggle: Customers segment");
A.contains(expHTML, 'data-v="pie"', "toggle: Pie segment (v2.1)");
A.eq((expHTML.match(/class="arO-barrow arO-clickable"/g) || []).length, 6, "six clickable band rows, none zero, on the main dataset");
A.absent(expHTML, "arO-barrow-zero", "no zero rows when every band has data");
A.eq((expHTML.match(/data-arOpop=/g) || []).length, 6, "hover card data on all six rows");
A.contains(expHTML, "aging band, current to most overdue", "bars aria-label names the axis");

const detHTML = ctx.arOContent(w("arO2"));
A.contains(detHTML, "arO-explore", "Detail is the two-panel layout");
/* Detail layout revised 2026-09-14 (owner): the LEFT panel is now the whole toggle,
   including Customers, and the RIGHT panel is Jo's Invoice detail list. Previously the
   left was forced to aging and the right was always the customer rollup. The arO2
   fixture carries arOGroup:"customer", so the left panel is the customer rollup here. */
A.contains(detHTML, "Top overdue customers", "Detail left panel follows the toggle (group=customer)");
A.absent(detHTML, "By aging", "and is NOT forced to the aging ladder any more");
A.contains(detHTML, "Invoice detail", "Detail right panel is her Invoice detail list");
A.contains(detHTML, "arO-illist", "the ported invoice list renders");
A.contains(detHTML, "arO-iltotal", "with the footer that reconciles it to the bar total");
A.contains(detHTML, 'data-v="pie"', "v2.1: the toggle renders at Detail too");
A.contains(detHTML, "arO-pager", "Detail customer panel is paged (23 customers)");

/* ---------- customer rollup: sort + pager ------------------------------ */
click("arO-group", "arO", { "data-v": "customer" });
A.eq(w("arO").arOGroup, "customer", "group toggle updates state");
let custHTML = ctx.arOContent(w("arO"));
A.contains(custHTML, "arO-custbar", "customer view shows the sort bar");
A.contains(custHTML, "1 to 7 of 23 customers", "pager text page 1");
A.contains(custHTML, 'data-p="prev"' , "pager has Prev");
A.ok(/data-p="prev" disabled/.test(custHTML), "Prev disabled on page 1");
A.eq((custHTML.match(/class="arO-barrow arO-clickable"/g) || []).length, 7, "seven customer rows per page");
/* default sort: biggest amount first, tie-broken by oldest */
const sortedByTotal = custRows.slice();
A.contains(custHTML, sortedByTotal[0].customer, "page 1 carries the biggest debtor: " + sortedByTotal[0].customer);
A.eq(sortedByTotal[0].customer, "Cornerstone Academy", "biggest debtor is Cornerstone Academy (9650)");

const headerBefore = /dep-hd-kpigrp[\s\S]*?<\/div>/.exec(custHTML)[0];
click("arO-cust-page", "arO", { "data-p": "next" });
A.eq(w("arO").arOCustPage, 1, "Next moves to page 2");
let p2HTML = ctx.arOContent(w("arO"));
A.contains(p2HTML, "8 to 14 of 23 customers", "pager text page 2");
const headerAfter = /dep-hd-kpigrp[\s\S]*?<\/div>/.exec(p2HTML)[0];
A.same(headerBefore, headerAfter, "paging leaves the KPI header (totals) untouched");
click("arO-cust-page", "arO", { "data-p": "next" });
click("arO-cust-page", "arO", { "data-p": "next" });
A.eq(w("arO").arOCustPage, 3, "page 4 reached");
let p4HTML = ctx.arOContent(w("arO"));
A.contains(p4HTML, "22 to 23 of 23 customers", "last page shows the remainder");
A.ok(/data-p="next" disabled/.test(p4HTML), "Next disabled on the last page");
click("arO-cust-page", "arO", { "data-p": "next" });
A.eq(w("arO").arOCustPage, 3, "Next clamps at the last page");

/* sort by oldest resets the page and reorders */
click("arO-cust-sort", "arO", { "data-v": "oldest" });
A.eq(w("arO").arOSort, "oldest-desc", "sort switches to oldest-desc");
A.eq(w("arO").arOCustPage, 0, "sort change resets the page");
const oldestRows = ctx.arOCustomers(w("arO"));
A.eq(oldestRows[0].customer, "Whitestone Pension Office", "oldest balance first (152 days)");
A.ok(oldestRows[0].oldest >= oldestRows[1].oldest, "oldest sort is descending");
let oldestHTML = ctx.arOContent(w("arO"));
A.contains(oldestHTML, "oldest 152 days", "row sub names the oldest days");
click("arO-cust-sort", "arO", { "data-v": "total" });
A.eq(w("arO").arOSort, "total-desc", "sort back to biggest amount");
A.eq(ctx.arOCustomers(w("arO"))[0].customer, "Cornerstone Academy", "amount sort restored");
/* re-tapping the active sort does not reset paging state needlessly */
click("arO-cust-page", "arO", { "data-p": "next" });
click("arO-cust-sort", "arO", { "data-v": "total" });
A.eq(w("arO").arOCustPage, 1, "re-tapping the active sort keeps the page");
click("arO-cust-sort", "arO", { "data-v": "oldest" });
A.eq(w("arO").arOCustPage, 0, "a real sort change resets the page");
click("arO-cust-sort", "arO", { "data-v": "total" });
click("arO-group", "arO", { "data-v": "aging" });
A.eq(w("arO").arOGroup, "aging", "back to the aging view");

/* ---------- loading: only a data fetch flips it ------------------------ */
const timersBefore = log.timers;
click("arO-group", "arO", { "data-v": "customer" });
click("arO-cust-page", "arO", { "data-p": "next" });
click("arO-cust-sort", "arO", { "data-v": "oldest" });
click("arO-group", "arO", { "data-v": "aging" });
A.eq(log.timers, timersBefore, "group/sort/page never start a load timer");
A.ok(!w("arO").arOloading, "no loading flag from client-side re-renders");
click("arO-rc", "arO");
A.ok(ctx.pop && ctx.pop.type === "arO-rc", "revenue-center popover opens");
const rcPop = ctx.arOPopContent();
A.contains(rcPop, "Revenue center", "popover cap");
["All revenue centers", "Church", "Insurance Billing", "Pension Billing", "School"].forEach(function (o) {
  A.contains(rcPop, o, "rc option: " + o);
});
click("arO-set-rc", "arO", { "data-v": "Church" });
A.eq(w("arO").arORc, "Church", "revenue center committed");
A.ok(w("arO").arOloading, "a real filter change starts the loading skeleton");
A.eq(log.timers, timersBefore + 1, "exactly one load timer started");
A.eq(w("arO").arOCustPage, 0, "filter change resets the customer page");
A.contains(ctx.arOContent(w("arO")), "arO-skel", "loading renders the skeleton");
w("arO").arOloading = false; /* the timer would do this at 800ms */
const churchHTML = ctx.arOContent(w("arO"));
const churchRows = ctx.arOFiltered(w("arO"));
A.ok(churchRows.length > 0 && churchRows.every(function (x) { return x.rc === "Church"; }), "filter keeps only Church invoices");
A.eq(ctx.arOBuckets(w("arO")).reduce(function (s, r) { return s + r.total; }, 0), ctx.arOTotal(w("arO")), "filtered bands still reconcile");
const timersAfterChurch = log.timers;
click("arO-rc", "arO");
click("arO-set-rc", "arO", { "data-v": "Church" });
A.eq(log.timers, timersAfterChurch, "re-committing the same value does not refetch");
click("arO-rc", "arO");
click("arO-set-rc", "arO", { "data-v": "All" });
w("arO").arOloading = false;
/* source filter */
click("arO-source", "arO");
A.ok(ctx.pop && ctx.pop.type === "arO-source", "source popover opens");
A.contains(ctx.arOPopContent(), "All sources", "source options render");
click("arO-set-source", "arO", { "data-v": "Insurance Billing" });
w("arO").arOloading = false;
A.ok(ctx.arOFiltered(w("arO")).every(function (x) { return x.source === "Insurance Billing"; }), "source filter applies");
click("arO-source", "arO");
click("arO-set-source", "arO", { "data-v": "All" });
w("arO").arOloading = false;
A.eq(ctx.pop, null, "committing an option closes the popover");

/* ---------- pie view (v2.1-v2.3) ---------------------------------------- */
click("arO-group", "arO", { "data-v": "pie" });
A.eq(w("arO").arOGroup, "pie", "pie segment commits");
const pieHTML = ctx.arOContent(w("arO"));
A.contains(pieHTML, "arO-pie", "Explore renders the pie");
A.contains(pieHTML, 'width="300"', "Explore donut is the v2.3 300px");
A.eq((pieHTML.match(/class="leg arO-leg arO-clickable"/g) || []).length, 6, "six clickable legend rows (all bands have data)");
A.contains(pieHTML, "Outstanding by aging band", "legend heading");
A.contains(pieHTML, "outstanding</text>", "donut centre caption");
A.contains(pieHTML, 'max-height:300px', "legend cap follows the donut size (v2.2)");
const arcCount = (pieHTML.match(/<circle/g) || []).length;
A.eq(arcCount, 6, "six arcs drawn when every band holds money");
/* stale group falls back to Aging with Aging pressed (v2.1 guard) */
w("arO").arOGroup = "bogus";
const staleHTML = ctx.arOContent(w("arO"));
A.contains(staleHTML, 'data-v="aging" aria-pressed="true"', "stale group falls back to Aging, pressed");
A.contains(staleHTML, "arO-bars", "stale group renders the ladder, not a blank");
w("arO").arOGroup = "pie";
/* pie at Detail: left panel follows the toggle, sized 210 */
w("arO2").arOGroup = "pie";
const detPie = ctx.arOContent(w("arO2"));
A.contains(detPie, "Outstanding by band", "Detail left panel header follows the pie");
A.contains(detPie, 'width="210"', "Detail donut is the v2.3 210px");
A.contains(detPie, "Invoice detail", "Detail right panel is the invoice list whichever view the left shows");
A.absent(detPie, "Top overdue customers", "the customer rollup is not duplicated on the right");
w("arO2").arOGroup = "customer";
w("arO").arOGroup = "aging";

/* ---------- band click -> invoice list modal ---------------------------- */
click("arO-open", "arO", { "data-mode": "aging", "data-key": "b1" });
A.ok(ctx.modal && ctx.modal.type === "arOdetail", "band click opens the drill modal");
A.eq(ctx.modal.key, "b1", "modal keyed to the clicked band");
A.ok(ctx.modal.sel && Object.keys(ctx.modal.sel).length === 0 && ctx.modal.confirmed === false, "selection resets on open");
let modalHTML = ctx.arODetailModalHTML();
A.contains(modalHTML, "31-60 days", "modal subject names the band");
const b1Invs = ctx.arODetailInvoices(w("arO"), "aging", "b1");
A.ok(b1Invs.length > 0 && b1Invs.every(function (x) { return x.days > 30 && x.days <= 60; }), "modal list holds only 31-60 day invoices");
A.ok(b1Invs.every(function (x, i, a) { return i === 0 || a[i - 1].days >= x.days; }), "modal list sorted most overdue first");
const b1Total = b1Invs.reduce(function (s, x) { return s + x.amount; }, 0);
A.eq(b1Total, bandRows.filter(function (r) { return r.key === "b1"; })[0].total, "modal total equals the band total, to the cent");
A.contains(modalHTML, "$" + Math.round(b1Total).toLocaleString("en-US"), "modal footer carries the band total");
A.contains(modalHTML, b1Invs.length + " invoice", "modal footer counts the invoices");
A.contains(modalHTML, "Export to Excel", "modal keeps Jo's export");
A.contains(modalHTML, ">Confirm<", "Confirm is present and carries no disabled attribute");
A.absent(modalHTML, 'data-action="arO-confirm" disabled', "Confirm is never disabled");
A.contains(modalHTML, "arO-f-spacer", "no confirm note before Confirm is pressed");
A.absent(modalHTML, "Move to unposted transactions", "the dev-intent note waits for Confirm");

/* row expand -> tabs */
const inv0 = b1Invs[0].inv;
click("arO-exp", "arO", { "data-inv": inv0 });
A.eq(ctx.modal.exp, inv0, "row expands");
modalHTML = ctx.arODetailModalHTML();
A.contains(modalHTML, "arO-drawer", "expanded drawer renders");
A.contains(modalHTML, 'data-tab="details"', "Details tab");
A.contains(modalHTML, 'data-tab="attachments"', "Attachments tab");
A.contains(modalHTML, 'data-tab="note"', "Note tab");
A.contains(modalHTML, 'data-tab="payments"', "Payments tab");
A.contains(modalHTML, "Description", "Details tab shows the line-item table by default");
click("arO-tab", "arO", { "data-tab": "attachments" });
A.eq(ctx.modal.tab, "attachments", "tab switches");
const attHTML = ctx.arODetailModalHTML();
A.ok(attHTML.indexOf("arO-att") > -1 || attHTML.indexOf("No attachments on this invoice.") > -1, "Attachments tab renders content or its empty state");
click("arO-tab", "arO", { "data-tab": "note" });
const noteHTML = ctx.arODetailModalHTML();
A.ok(noteHTML.indexOf("arO-note") > -1 || noteHTML.indexOf("No note added.") > -1, "Note tab renders content or its empty state");
click("arO-tab", "arO", { "data-tab": "payments" });
const payHTML = ctx.arODetailModalHTML();
A.ok(payHTML.indexOf("arO-pays") > -1 || payHTML.indexOf("No payments recorded yet.") > -1, "Payments tab renders content or its empty state");
A.contains(payHTML, "Open invoice", "drawer keeps the collection next-steps");
A.contains(payHTML, "Record a follow-up", "drawer keeps the follow-up action");
click("arO-exp", "arO", { "data-inv": inv0 });
A.eq(ctx.modal.exp, null, "second click collapses the row");

/* checkbox + Confirm (owner enhancement, ported as built) */
click("arO-check", "arO", { "data-inv": inv0 });
A.ok(ctx.modal && ctx.modal.sel[inv0] === true, "checkbox selects without closing the modal");
A.eq(ctx.modal.exp, null, "checkbox does not expand the row");
click("arO-confirm", "arO");
A.ok(ctx.modal.confirmed, "Confirm flips the modal state");
modalHTML = ctx.arODetailModalHTML();
A.contains(modalHTML, "Move to unposted transactions", "the dev-intent note renders after Confirm");
A.contains(modalHTML, "(1 invoice selected)", "note reports the selected count");
click("arO-check", "arO", { "data-inv": inv0 });
A.contains(ctx.arODetailModalHTML(), "(no invoices selected)", "note reports an empty selection honestly");
click("arO-detail-close", "arO");
A.eq(ctx.modal, null, "Close clears the modal");
click("arO-open", "arO", { "data-mode": "aging", "data-key": "b1" });
A.ok(!ctx.modal.confirmed && Object.keys(ctx.modal.sel).length === 0, "reopening resets selection and Confirm");
click("arO-detail-close", "arO");

/* customer drill agrees with the rollup row, to the cent */
click("arO-open", "arO", { "data-mode": "customer", "data-key": "Cornerstone Academy" });
const cInvs = ctx.arODetailInvoices(w("arO"), "customer", "Cornerstone Academy");
A.ok(cInvs.every(function (x) { return x.customer === "Cornerstone Academy"; }), "customer drill holds only that customer");
const cRow = custRows.filter(function (r) { return r.customer === "Cornerstone Academy"; })[0];
A.eq(cInvs.reduce(function (s, x) { return s + x.amount; }, 0), cRow.total, "customer drill total equals the rollup row, to the cent");
A.contains(ctx.arODetailModalHTML(), "Cornerstone Academy", "modal subject names the customer");
click("arO-detail-close", "arO");

/* export / open / follow-up produce their status lines */
click("arO-export", "arO");
A.ok(log.status.some(function (s) { return s.indexOf("Exporting the detail list to Excel") === 0; }), "export status line");
click("arO-open-invoice", "arO", { "data-inv": "INV-3001" });
A.ok(log.status.some(function (s) { return s.indexOf("Opening invoice INV-3001") === 0; }), "open-invoice status line");
click("arO-followup", "arO", { "data-inv": "INV-3001" });
A.ok(log.status.some(function (s) { return s.indexOf("Follow-up noted for invoice INV-3001.") === 0; }), "follow-up status line");

/* ---------- edge datasets ---------------------------------------------- */
/* everything current: only Current and 1-30 hold money; four inert zero rows */
const curHTML = ctx.arOContent(w("arO3"));
A.eq((curHTML.match(/arO-barrow-zero/g) || []).length, 5, "everything-current: five inert zero rows (all three invoices are 1-30)");
A.eq((curHTML.match(/class="arO-barrow arO-clickable"/g) || []).length, 1, "everything-current: one live band (1-30, as built: days 3/12/27)");
A.contains(curHTML, "Nothing outstanding in this band.", "zero rows carry the sr-only explanation");
const curBands = ctx.arOBuckets(w("arO3"));
A.ok(curBands[2].total === 0 && curBands[5].total === 0, "31+ bands are genuinely zero");
A.eq(ctx.arOOverdue(w("arO3")), ctx.arOTotal(w("arO3")), "all three current-dataset invoices are days>0, so overdue equals the total (as built)");

/* single band: 91-120 only */
const oneHTML = ctx.arOContent(w("arO4"));
A.eq((oneHTML.match(/arO-barrow-zero/g) || []).length, 5, "single-band: five inert zero rows");
A.eq((oneHTML.match(/class="arO-barrow arO-clickable"/g) || []).length, 1, "single-band: one live band");
const oneBands = ctx.arOBuckets(w("arO4"));
A.eq(oneBands.filter(function (r) { return r.total > 0; })[0].key, "b3", "the live band is 91-120");
/* single-band pie: one arc, five inert legend rows */
w("arO4").arOGroup = "pie";
const onePie = ctx.arOContent(w("arO4"));
A.eq((onePie.match(/<circle/g) || []).length, 1, "single-band pie draws one arc");
A.eq((onePie.match(/arO-leg-zero/g) || []).length, 5, "five inert legend rows");
A.absent(/class="leg arO-leg arO-leg-zero"[^>]*data-action/.exec(onePie) ? "x" : "", "x", "zero legend rows carry no data-action");
w("arO4").arOGroup = "aging";

/* nothing outstanding */
const emptyHTML = ctx.arOContent(w("arO5"));
A.contains(emptyHTML, "Nothing outstanding", "empty state title");
A.contains(emptyHTML, "There is nothing to chase right now.", "empty state copy");
A.absent(emptyHTML, "dep-hd", "empty state has no duplicated header");
w("arO5").size = "kpi";
const emptyKpi = ctx.arOContent(w("arO5"));
A.contains(emptyKpi, "All settled", "Glance empty state");
w("arO5").size = "wide";

/* ---------- bar hover card ---------------------------------------------- */
shim.fireMove("arO-barrow arO-clickable", { "data-arOpop": "31-60 days|8120|3|13" });
A.ok(ctx.arOPopEl, "hover raises the card");
A.contains(ctx.arOPopEl.innerHTML, "31-60 days", "card names the band");
A.contains(ctx.arOPopEl.innerHTML, "$8,120", "card carries the amount");
A.contains(ctx.arOPopEl.innerHTML, "Share of outstanding", "card carries the share row");
shim.fireMove("somewhere-else", {});
A.ok(!ctx.arOPopEl, "leaving the row hides the card");

/* ---------- no-em-dash sweep over every combination --------------------- */
registry.forEach(function (wid) {
  ["kpi", "wide", "xwide"].forEach(function (sz) {
    const keep = wid.size; wid.size = sz;
    ["aging", "customer", "pie"].forEach(function (g) {
      const kg = wid.arOGroup; wid.arOGroup = g;
      A.noEmDash(ctx.arOContent(wid), wid.id + " " + sz + " " + g);
      wid.arOGroup = kg;
    });
    wid.size = keep;
  });
});
ctx.modal = { type: "arOdetail", id: "arO", mode: "aging", key: "b4", tab: "details", exp: null, sel: {}, confirmed: true };
A.noEmDash(ctx.arODetailModalHTML(), "confirmed modal");
ctx.modal = null;
ctx.pop = { type: "arO-rc", id: "arO" }; A.noEmDash(ctx.arOPopContent(), "rc popover");
ctx.pop = { type: "arO-source", id: "arO" }; A.noEmDash(ctx.arOPopContent(), "source popover");
ctx.pop = null;
A.noEmDash(ctx.arOOverduePill(w("arO")), "overdue pill");
A.noEmDash(ctx.arOSkeleton(), "loading skeleton");

process.exit(A.report());
