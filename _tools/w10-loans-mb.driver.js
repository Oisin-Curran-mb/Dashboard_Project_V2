/* =====================================================================
   w10-loans-mb.driver.js , W10 Loans With Balance Due (OC).

   The widget-specific half of the port harness: the extraction markers, the
   class list, the code-true figures, and the behavioural assertions. Every
   shim, fire() and generic assertion comes from ./jo-port-driver.js.

   It runs the REAL handlers lifted verbatim out of ../index.html, so a pass
   here is a statement about the shipped file, not about a copy.

   Run:  node w10-loans-mb.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const START = "var LONF_TODAY=";
const END = "/* ===== end W10 Loans With Balance Due V2 ===== */";
const KIND = "loans-mb";

const shell = H.loadShell();
const block = H.extractRegion(shell.script, START, END);
const registry = H.extractRegistry(shell.script, KIND);
const env = H.runBlock(block, { registry: registry, dataAttr: "data-lon" });
const A = new H.Assert("W10 loans-mb port driver");
const C = env.ctx;
const shim = env.shim;

function W(id) { return registry.filter(function (w) { return w.id === id; })[0]; }
function render(w) { return C.lonFContent(w); }
function accts(html) {
  const out = [], re = /class="lon-c-acct">(LN-\d+)</g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
function reset(w, over) {
  w.lonType = "All"; w.lonSort = "amt-desc"; w.lonBucket = "total";
  w.lonView = "table"; w.lonLoading = false;
  Object.assign(w, over || {});
  return w;
}

/* ---------- 1. wiring and isolation ----------------------------------- */
console.log("\n[1] wiring and isolation");
A.contains(shell.script, 'if(w.kind==="loans-mb")return lonFContent(w);', "contentHTML dispatches loans-mb to lonFContent");
A.contains(shell.script, 'if(w.kind==="loans-mb")return {h:w.title,b:LONF_ABOUT};', "aboutOf carries a loans-mb branch");
A.eq(registry.length, 5, "five loans-mb registry entries");
A.eq(registry.map(function (w) { return w.id; }).join(","), "lonF,lonF_k,lonF_x,lonF2,lonF3", "registry ids");
A.ok(registry.every(function (w) { return w.tiers.join(",") === "kpi,wide,xwide"; }), "every entry carries the three tiers");
A.ok(registry.every(function (w) { return /^Loans With Balance Due \(OC/.test(w.title); }), "every title uses the (OC...) form");
A.eq(registry.filter(function (w) { return w.size === "kpi"; }).length, 1, "one Glance variant");
A.eq(registry.filter(function (w) { return w.size === "xwide"; }).length, 1, "one Detail variant");
A.eq(registry.filter(function (w) { return w.dataset === "current"; }).length, 1, "one all-current variant");
A.eq(registry.filter(function (w) { return w.state === "empty"; }).length, 1, "one no-loans variant");
/* our block must not carry any of Jo's names */
A.absent(block, "loanF", "our block is free of loanF names");
A.absent(block, "LOANF_", "our block is free of LOANF_ names");
A.absent(block, 'data-loanf', "our block is free of data-loanf");
A.absent(block, '.loan-', "our block is free of .loan- classes");
A.absent(block, 'data-action', "our block never emits data-action, so Jo's listener cannot see it");
/* Jo's block must still be intact */
A.contains(shell.script, "function loanContent(w)", "Jo's loanContent is still present");
A.contains(shell.css, ".loan-c-acct{", "Jo's .loan-c-acct rule is still present");
A.contains(shell.script, 'if(w.kind==="loans")return loanContent(w);', "Jo's own loans dispatch is untouched");
A.contains(shell.script, 'id:"loan6"', "Jo's last loans registry entry is still present");
A.contains(shell.script, 'if(w.kind==="loans")return {h:w.title,b:"Every loan', "Jo's aboutOf loans branch is untouched");
A.eq((shell.script.match(/function loanTable\(w\)/g) || []).length, 1, "Jo's loanTable defined exactly once");
/* the unstyled-chrome bug class: every class our markup uses must be declared */
A.cssDeclares(shell.css, [
  "lon-ctlrow", "lon-chip", "lon-numwrap", "lon-ctx", "lon-glance-read", "lon-stack", "lon-seg",
  "lon-glance-cap", "lon-cap-ok", "lon-sevdot", "lon-allset", "lon-body", "lon-c-acct", "lon-c-name",
  "lon-nm-wrap", "lon-nm", "lon-type-sub", "lon-c-last", "lon-dormant", "lon-c-days", "lon-days-v",
  "lon-notdue", "lon-c-amt", "lon-row", "lon-zeroline", "lon-bchips", "lon-bchip", "lon-bchip-dot",
  "lon-bchip-n", "lon-pie", "lon-leg", "lon-pie-note", "lon-chart-empty", "lon-col-side", "lon-panel",
  "lon-band-row", "lon-band-dot", "lon-band-meta", "lon-band-val", "lon-mini-track", "lon-mini-fill",
  "lon-risk-row", "lon-worst-row", "lon-skel", "lon-sk-row", "lon-empty", "lon-detail-modal",
  "lon-dsub", "lon-dh-spacer", "lon-detail-b", "lon-dl-grid", "lon-dl-row", "lon-dl-lbl", "lon-dl-val",
  "lon-dl-band", "lon-dl-since", "lon-dl-dormant", "lon-dl-payh", "lon-pays", "lon-prow", "lon-phead",
  "lon-pa", "lon-tab-empty", "lon-actions", "lon-dl-note"
], "every .lon-* class our markup uses is declared in <style>");
/* Three names are deliberate hooks with no rules of their own, exactly as Jo's
   own .loan-head is: they sit on a fully styled shared family and exist so a
   later session can find and diff our markup. Assert that the family they
   depend on IS declared, rather than asserting a rule that should not exist. */
A.contains(shell.script, 'class="wt-row wt-head lon-head"', "lon-head is a hook on the styled .wt-head row");
A.contains(shell.script, 'class="vtoggle lon-vtoggle"', "lon-vtoggle is a hook on the styled .vtoggle");
A.contains(shell.css, ".vtoggle{", "the .vtoggle family our segment depends on is declared");
A.contains(shell.css, ".vt{", "the .vt segment style our toggle depends on is declared");
A.contains(shell.css, ".wt-head,", "the .wt-head family our table head depends on is declared");
/* the shared families we rely on but do not redefine */
A.cssDeclares(shell.css, ["vtoggle", "vt", "donut", "legend", "legend-col", "legend-head", "legend-hd",
  "leg", "lg-main", "lg-meta", "dot", "seg", "pie-wrap", "wt-row", "wt-head", "wt-sort", "wt-c2",
  "filter-chip", "fc-label", "dep-hd", "dep-hd-top", "dep-hd-num", "dep-hd-toggle", "dep-hd-kpigrp",
  "dep-full", "dep-col", "dep-col-h", "dep-total", "scroll", "state", "sk", "bgt-spin", "bgt-skel-cap",
  "bgt-pop", "kpi-row", "kpi-num", "metric-value", "bank-pill", "delta-pill", "gl-sub", "bgt-caption",
  "mi", "mi-gap", "cap", "pop", "modal", "modal-backdrop", "sr-only", "lr-main", "lr-stack", "lr-link"
], "every shared shell family our markup reuses is declared");
A.contains(shell.css, ".filter-chip[data-lon]::before", "the interactive filter chip keeps its fill and filter glyph under data-lon");

/* ---------- 2. code-true figures -------------------------------------- */
console.log("\n[2] code-true figures");
const w0 = reset(W("lonF"));
A.near(C.lonFTotal(w0), 112037.96, 0.005, "total balance due");
A.eq(C.lonFCount(w0), 9, "loan count");
A.near(C.lonFPastDue(w0), 58147.96, 0.005, "past due amount");
A.eq(C.lonFPastDueCount(w0), 6, "past due loan count");
A.eq(C.lonFPct(w0), 52, "past due percent");
A.near(C.lonF90(w0), 38940.13, 0.005, "90+ amount");
const B = C.lonFBuckets(w0);
A.eq(B.map(function (b) { return b.key; }).join(","), "cur,b1,b2,b25,b3", "five ranges, severity order");
A.eq(B.map(function (b) { return b.label; }).join(" / "), "Current / 1-30 days / 31-60 days / 61-90 days / 90+ days", "ladder labels");
A.near(B[0].total, 53890.00, 0.005, "Current total"); A.eq(B[0].count, 3, "Current count");
A.near(B[1].total, 8386.86, 0.005, "1-30 total"); A.eq(B[1].count, 2, "1-30 count");
A.near(B[2].total, 10820.97, 0.005, "31-60 total"); A.eq(B[2].count, 2, "31-60 count");
A.near(B[3].total, 0.00, 0.005, "61-90 total is exactly zero"); A.eq(B[3].count, 0, "61-90 count is zero");
A.near(B[4].total, 38940.13, 0.005, "90+ total"); A.eq(B[4].count, 2, "90+ count");
A.near(B.reduce(function (s, b) { return s + b.total; }, 0), 112037.96, 0.005, "ranges cross-foot to the total");
A.eq(B.reduce(function (s, b) { return s + b.count; }, 0), 9, "range counts cross-foot to the loan count");
A.near(C.lonFTotal(reset(W("lonF2"))), 16720.00, 0.005, "all-current dataset total");
A.near(C.lonFTotal(reset({ dataset: "single", id: "x" })), 13400.00, 0.005, "single-range dataset total");
/* C1 regression: the ladder must be exhaustive, especially 61 to 89 */
[[-12, "cur"], [0, "cur"], [1, "b1"], [6, "b1"], [30, "b1"], [31, "b2"], [58, "b2"], [60, "b2"],
 [61, "b25"], [70, "b25"], [90, "b25"], [91, "b3"], [95, "b3"], [145, "b3"]].forEach(function (p) {
  A.eq(C.lonFBucketOf(p[0]), p[1], "day " + p[0] + " lands in " + p[1]);
});

/* ---------- 3. initial render at each tier ---------------------------- */
console.log("\n[3] initial render, three tiers");
const gl = render(reset(W("lonF_k")));
A.contains(gl, "$112,037.96", "Glance shows the total");
A.contains(gl, "past due (52%)", "Glance past-due pill");
A.contains(gl, "lon-stack", "Glance aging bar");
A.contains(gl, "owed across 9 loans with a balance", "Glance caption");
A.contains(gl, 'class="sr-only">Outstanding by age:', "Glance values exist as text for a screen reader");
A.contains(gl, "61-90 days $0.00", "the screen-reader ladder states all five ranges including the empty one");
A.absent(gl, "vtoggle", "Glance carries no view toggle");
const ex = render(reset(W("lonF")));
A.contains(ex, 'class="dep-hd"', "Explore uses the two-row header");
A.contains(ex, "lon-bchips", "Explore table view carries the range chip row");
A.contains(ex, "wt-head lon-head", "Explore renders the table head");
A.contains(ex, "vtoggle lon-vtoggle", "Explore carries the Table / Pie segment");
A.contains(ex, "All loans (9)", "Explore footer label");
A.contains(ex, "$112,037.96", "Explore footer cross-foots to the total");
A.absent(ex, "lon-grp", "Explore table has no range group headers");
A.absent(ex, "Days past due", "Explore table has no Days past due column");
A.contains(ex, "Last payment", "Explore table keeps Last payment");
const dt = render(reset(W("lonF_x")));
A.contains(dt, "dep-full", "Detail uses the two-column layout");
A.contains(dt, "wt-head lon-head", "Detail renders the table");
A.contains(dt, 'class="donut"', "Detail renders the donut");
A.contains(dt, "Balance by time range", "Detail donut is titled");
/* 2026-09-21: Detail now DOES carry a switch, but only for its right column
   (pie or bands). The left column is always the table, so there is still no
   three-way Table/Pie/Bands toggle at Detail. */
A.contains(dt, "lon-side-vt", "Detail carries a switch for its right column");
A.eq((dt.match(/data-lon="lon-side"/g) || []).length, 2, "with exactly two choices, pie and bands");
A.absent(dt, 'data-lon="lon-view"', "and NOT the Explore three-way toggle, since the table is always shown");
A.absent(dt, "lon-bchips", "Detail uses the legend as the filter, not the chip row");
A.contains(dt, 'width="200"', "Detail donut is sized the way every donut in this shell is sized");

/* ---------- 4. loan type dropdown ------------------------------------- */
console.log("\n[4] loan type dropdown");
reset(W("lonF"));
A.eq(C.LONF_POP, null, "no popover open initially");
shim.fire("lon-type", { "data-id": "lonF" });
A.ok(C.LONF_POP && C.LONF_POP.id === "lonF", "clicking the chip opens the popover");
const popEl = shim.document.getElementById("lonPop");
A.ok(!!popEl, "#lonPop is mounted on the body");
A.contains(popEl.className, "pop", "the popover reuses the shell's .pop shell");
const popHTML = popEl.innerHTML;
A.contains(popHTML, '<div class="cap">Loan type</div>', "popover is captioned");
["All loan types", "Church - Special", "Church Expansion", "Individual"].forEach(function (o) {
  A.contains(popHTML, ">" + o + "</button>", "option present: " + o);
});
A.eq((popHTML.match(/data-lon="lon-set-type"/g) || []).length, 4, "exactly four loan type options");
A.contains(popHTML, 'class="mi check"', "the selected option is checked");
shim.fire("lon-type", { "data-id": "lonF" });
A.eq(C.LONF_POP, null, "clicking the chip again closes the popover");
shim.fire("lon-type", { "data-id": "lonF" });
shim.fireOutside();
A.eq(C.LONF_POP, null, "an outside click closes the popover");

/* ---------- 5. the loan type filter drives EVERYTHING ----------------- */
console.log("\n[5] the loan type filter drives everything, not just the table");
const wf = reset(W("lonF"));
const before = { hdr: render(wf), pie: C.lonFBandPie(wf), chips: C.lonFBandChips(wf), badge: C.lonFBadge(wf) };
shim.fire("lon-type", { "data-id": "lonF" });
shim.fire("lon-set-type", { "data-id": "lonF", "data-v": "Church - Special" });
A.eq(wf.lonType, "Church - Special", "the loan type changed");
A.eq(wf.lonLoading, true, "a loan type change is a data fetch, so it shows loading");
A.contains(render(wf), "lon-skel", "the loading state renders the skeleton");
A.contains(render(wf), "Updating loans with a balance", "the loading header keeps the chrome in place");
wf.lonLoading = false;
const after = { hdr: render(wf), pie: C.lonFBandPie(wf), chips: C.lonFBandChips(wf), badge: C.lonFBadge(wf) };
A.changed(before.hdr, after.hdr, "the header re-reads against the loan type");
A.changed(before.pie, after.pie, "the donut re-reads against the loan type");
A.changed(before.chips, after.chips, "the chip row re-reads against the loan type");
A.changed(before.badge, after.badge, "the past-due pill re-reads against the loan type");
A.near(C.lonFTotal(wf), 32436.86, 0.005, "Church - Special total");
A.eq(C.lonFCount(wf), 4, "Church - Special loan count");
A.contains(after.hdr, "$32,436.86", "the header total shows the filtered figure");
A.contains(after.hdr, '<span class="fc-label">Church - Special</span>', "the chip echoes the selection");
A.eq(wf.lonBucket, "total", "a loan type change clears the range selection");
reset(wf);

/* ---------- 6. Table / Pie segment at Explore ------------------------- */
console.log("\n[6] Table / Pie segment at Explore");
const wv = reset(W("lonF"));
const tableOut = render(wv);
A.contains(tableOut, 'data-lon="lon-view" data-id="lonF" data-v="table" aria-pressed="true"', "Table is the default segment");
shim.fire("lon-view", { "data-id": "lonF", "data-v": "pie" });
A.eq(wv.lonView, "pie", "the segment flips lonView");
const pieOut = render(wv);
A.changed(tableOut, pieOut, "the Explore output changes with the segment");
A.contains(pieOut, 'class="donut"', "the pie view renders the donut at Explore");
A.contains(pieOut, 'width="168"', "the Explore donut is sized for the narrower tier");
A.absent(pieOut, "wt-head lon-head", "the pie view replaces the table");
A.absent(pieOut, "lon-bchips", "the chip row rides with the table view, the donut carries its own filter");
shim.fire("lon-view", { "data-id": "lonF", "data-v": "table" });
A.eq(wv.lonView, "table", "the segment flips back");
A.eq(render(wv), tableOut, "flipping back restores the table view exactly");

/* ---------- 7. sorting ------------------------------------------------ */
console.log("\n[7] sorting, all four columns, both directions");
const ws = reset(W("lonF"));
A.eq(ws.lonSort, "amt-desc", "default sort is amount due descending");
A.eq(accts(render(ws))[0], "LN-1042", "default sort puts the largest balance first");
[["acct", "desc"], ["name", "asc"], ["last", "asc"], ["amt", "desc"]].forEach(function (p) {
  const k = p[0], firstDir = p[1];
  reset(ws);
  /* start from a column that is NOT the one under test, so the first click is
     a first selection and not a direction toggle of the active column */
  ws.lonSort = (k === "name") ? "amt-desc" : "name-asc";
  shim.fire("lon-sort", { "data-id": "lonF", "data-k": k });
  A.eq(ws.lonSort, k + "-" + firstDir, k + " first click sorts " + firstDir);
  const one = accts(render(ws));
  A.contains(render(ws), 'class="wt-sort on" data-lon="lon-sort" data-id="lonF" data-k="' + k + '"', k + " header shows the active sort");
  shim.fire("lon-sort", { "data-id": "lonF", "data-k": k });
  A.eq(ws.lonSort, k + "-" + (firstDir === "asc" ? "desc" : "asc"), k + " second click reverses");
  const two = accts(render(ws));
  A.eq(two.join(","), one.slice().reverse().join(","), k + " reversing reorders the rows");
  A.eq(one.length, 9, k + " sorting never drops a row");
});
reset(ws);

/* ---------- 8. range filter, chips and legend ------------------------- */
console.log("\n[8] range filter, from the chip row and from the donut legend");
const wb = reset(W("lonF"));
const allRows = accts(render(wb)).length;
A.eq(allRows, 9, "unfiltered table shows every loan");
shim.fire("lon-set-bucket", { "data-id": "lonF", "data-bucket": "b3" });
A.eq(wb.lonBucket, "b3", "a chip click selects the range");
const filtered = render(wb);
A.eq(accts(filtered).length, 2, "the table filters to the 90+ range");
A.contains(filtered, "90+ days (2 loans)", "the footer names the selected range");
A.contains(filtered, "$38,940.13", "the footer amount is the range total");
A.contains(filtered, 'data-bucket="b3" data-id="lonF" aria-pressed="true"', "the selected chip is pressed");
shim.fire("lon-set-bucket", { "data-id": "lonF", "data-bucket": "b3" });
A.eq(wb.lonBucket, "total", "clicking the selected range again clears the filter");
A.eq(accts(render(wb)).length, 9, "clearing restores every loan");
/* the same filter from the legend, at Detail */
const wd = reset(W("lonF_x"));
const legend = C.lonFBandPie(wd);
A.contains(legend, 'class="leg lon-leg" data-lon="lon-set-bucket" data-bucket="b1"', "the legend rows are the filter control");
shim.fire("lon-set-bucket", { "data-id": "lonF_x", "data-bucket": "b1" });
A.eq(wd.lonBucket, "b1", "a legend click selects the range");
const dfil = render(wd);
A.eq(accts(dfil).length, 2, "Detail table filters from the legend");
A.contains(dfil, "1-30 days (2 loans)", "Detail footer names the selected range");
A.contains(dfil, "pie-wrap row dim", "the donut dims the unselected arcs, using the shell's own mechanism");
A.contains(dfil, 'class="seg hi"', "the selected arc is emphasised");
A.contains(dfil, "Table filtered to 1-30 days", "the donut states what the table is filtered to");
shim.fire("lon-set-bucket", { "data-id": "lonF_x", "data-bucket": "b1" });
A.eq(wd.lonBucket, "total", "a second legend click clears it");

/* ---------- 9. the empty 61-90 range is muted and INERT --------------- */
console.log("\n[9] the 61-90 range holds no balance: shown in full, muted, inert");
const wz = reset(W("lonF"));
const chips = C.lonFBandChips(wz), pie = C.lonFBandPie(wz);
A.eq((chips.match(/lon-bchip/g) || []).length > 0, true, "the chip row renders");
["Current", "1-30 days", "31-60 days", "61-90 days", "90+ days"].forEach(function (l) {
  A.contains(chips, l, "chip row lists " + l);
  A.contains(pie, l, "legend lists " + l);
});
A.contains(chips, '<span class="lon-bchip is-zero" aria-label="61-90 days, no loans in this range">', "the 61-90 chip is a muted span, not a button");
A.contains(pie, '<div class="leg lon-leg is-zero" aria-label="61-90 days, no balance in this range">', "the 61-90 legend row is a muted div, not a button");
A.contains(pie, ">$0.00</span>", "the empty range reads $0.00 rather than vanishing");
A.absent(chips, 'data-bucket="b25"', "there is no clickable 61-90 chip");
A.absent(pie, 'data-bucket="b25"', "there is no clickable 61-90 legend row");
A.eq((pie.match(/<circle/g) || []).length, 4, "arcs are drawn only for the four ranges that hold a balance");
/* and behaviourally: a click on that muted row changes nothing */
shim.fireOutside();
const bucketBefore = wz.lonBucket;
shim.fire(null, { "class": "lon-bchip is-zero" });
A.eq(wz.lonBucket, bucketBefore, "clicking the muted 61-90 row does not filter");
A.eq(accts(render(wz)).length, 9, "the table is unchanged after clicking the muted row");

/* ---------- 10. drill modal ------------------------------------------- */
console.log("\n[10] drill modal");
reset(W("lonF"));
shim.fire("lon-open", { "data-id": "lonF", "data-acct": "LN-1042" });
A.ok(C.LONF_MODAL && C.LONF_MODAL.acct === "LN-1042", "the row click opens the modal");
const mroot = shim.document.getElementById("lonModalRoot");
A.ok(!!mroot, "#lonModalRoot is mounted on the body");
const mhtml = mroot.innerHTML;
A.contains(mhtml, "modal-backdrop", "the modal reuses the shell's backdrop");
A.contains(mhtml, "Loan detail", "the modal is titled");
A.contains(mhtml, "Grace Fellowship", "the modal names the borrower");
A.contains(mhtml, "Payment history", "the modal carries the payment history");
A.contains(mhtml, "Jul 8, 2026", "the payment history lists a payment date");
A.contains(mhtml, "$2,100.00", "the payment history lists a payment amount");
A.contains(mhtml, "Days past due", "the modal still reports days past due, per instruction");
A.contains(mhtml, '<span class="lon-dl-lbl">Aging</span>', "the modal keeps the Final's own Aging row label, untouched");
A.contains(mhtml, "Not yet due", "a current loan reads Not yet due");
A.contains(mhtml, "Open loan", "the modal offers the Open loan action");
A.contains(mhtml, "Record a contact", "the modal offers Record a contact");
A.contains(mhtml, 'class="lon-dl-note"', "the modal labels its unresolved actions as placeholders");
A.contains(mhtml, '"Open loan" has no confirmed destination yet', "the Open loan gap is labelled on screen, not invented");
shim.fire("lon-open-loan", { "data-id": "lonF", "data-acct": "LN-1042" });
A.contains(env.log.status.join(" | "), "Open loan is a placeholder", "Open loan reports itself as a placeholder");
shim.fire("lon-contact", { "data-id": "lonF", "data-acct": "LN-1042" });
A.contains(env.log.status.join(" | "), "Record a contact is a placeholder", "Record a contact reports itself as a placeholder");
shim.fire("lon-export", { "data-id": "lonF" });
A.contains(env.log.status.join(" | "), "Export to Excel is a placeholder", "Export reports itself as a placeholder");
shim.fire("lon-detail-close", {});
A.eq(C.LONF_MODAL, null, "Close closes the modal");
A.eq(shim.document.getElementById("lonModalRoot").innerHTML, "", "the modal root is emptied");
/* a loan with no payments, and Escape */
shim.fire("lon-open", { "data-id": "lonF", "data-acct": "LN-1150" });
A.contains(shim.document.getElementById("lonModalRoot").innerHTML, "No payments recorded yet on this loan.", "a loan with no payments states so");
A.contains(shim.document.getElementById("lonModalRoot").innerHTML, "No payment in over 90 days", "a dormant loan carries the dormancy note");
shim.fireKey("Escape", {});
A.eq(C.LONF_MODAL, null, "Escape closes the modal");
/* keyboard: the row is a div with role=button, so Enter must activate it */
shim.fireKey("Enter", { "data-lon": "lon-open", "data-id": "lonF", "data-acct": "LN-1017" }, "div");
A.ok(C.LONF_MODAL && C.LONF_MODAL.acct === "LN-1017", "Enter on a focused row opens the modal");
shim.fire("lon-detail-close", {});

/* ---------- 11. unhappy paths ---------------------------------------- */
console.log("\n[11] unhappy paths");
const we = reset(W("lonF3"));
we.state = "empty";
const eh = render(we);
A.contains(eh, "Nothing outstanding", "the no-loans variant renders the empty state");
A.contains(eh, "No loans currently carry a balance", "the empty state explains itself");
A.absent(eh, "dep-hd", "the empty state does not duplicate the header");
we.size = "kpi";
A.contains(render(we), "All settled", "the empty state at Glance reads All settled");
we.size = "wide";
const wc = reset(W("lonF2"));
const ch = render(wc);
A.contains(ch, "All current", "the all-current variant shows the All current pill");
A.contains(ch, "Nothing past due", "the all-current context line");
A.contains(ch, "$16,720.00", "the all-current total");
A.absent(ch, "past due (", "no past-due percentage when nothing is past due");
A.eq((C.lonFBandPie(wc).match(/<circle/g) || []).length, 1, "all-current draws a single arc");
A.eq((C.lonFBandPie(wc).match(/lon-leg is-zero/g) || []).length, 4, "all-current lists the four empty ranges as muted rows");
wc.size = "kpi";
A.contains(render(wc), "Every loan is current", "the all-current Glance read");
wc.size = "wide";
/* a filter that legitimately matches nothing */
const wn = reset({ id: "lonF", dataset: "single", size: "wide" });
wn.lonType = "Individual";
A.eq(C.lonFCount(wn), 0, "a type with no loans is a well formed zero");
A.contains(render(wn), "No loans match this selection.", "the table states the zero rather than showing an empty box");
A.contains(C.lonFBandPie(wn), "Nothing outstanding to chart for Individual", "the donut names the type that has nothing outstanding");
/* an unknown range key falls back to the whole book rather than throwing */
const wu = reset(W("lonF"));
wu.lonBucket = "nonsense";
A.eq(C.lonFSel(wu), "total", "an unrecognised range key falls back to every range");
A.eq(accts(render(wu)).length, 9, "and the table still renders every loan");
reset(wu);

/* ---------- 12. no em dash sweep ------------------------------------- */
console.log("\n[12] no em dash sweep, every size x view x filter x sort x range");
const sizes = ["kpi", "wide", "xwide"];
const views = ["table", "pie"];
const types = ["All", "Church - Special", "Church Expansion", "Individual"];
const sorts = ["acct-asc", "acct-desc", "name-asc", "name-desc", "last-asc", "last-desc", "amt-asc", "amt-desc"];
const rangeKeys = ["total", "cur", "b1", "b2", "b25", "b3"];
const datasets = [undefined, "current", "single"];
let combos = 0, emDash = 0, blank = 0, ell = 0;
const probe = { id: "lonF" };
datasets.forEach(function (ds) {
  sizes.forEach(function (sz) {
    views.forEach(function (vw) {
      types.forEach(function (ty) {
        sorts.forEach(function (so) {
          rangeKeys.forEach(function (rk) {
            probe.dataset = ds; probe.size = sz; probe.lonView = vw;
            probe.lonType = ty; probe.lonSort = so; probe.lonBucket = rk;
            probe.state = "ready"; probe.lonLoading = false;
            let out = render(probe);
            /* the loading state and the drill modal are part of the sweep too */
            probe.lonLoading = true; out += render(probe); probe.lonLoading = false;
            combos++;
            if (out.indexOf(H.EM_DASH) > -1) emDash++;
            if (out.indexOf("…") > -1) ell++;
            if (!out || !out.length) blank++;
          });
        });
      });
    });
  });
});
/* the modal, for every loan in every dataset */
let modalCombos = 0;
[["", "LN-1042"], ["", "LN-1017"], ["", "LN-2231"], ["", "LN-1188"], ["", "LN-1205"], ["", "LN-2044"],
 ["", "LN-1150"], ["", "LN-1301"], ["", "LN-1099"], ["current", "LN-3001"], ["current", "LN-3002"],
 ["current", "LN-3003"], ["single", "LN-4001"], ["single", "LN-4002"]].forEach(function (p) {
  const wm = reset(W("lonF"), { dataset: p[0] || undefined });
  shim.fire("lon-open", { "data-id": "lonF", "data-acct": p[1] });
  const html = shim.document.getElementById("lonModalRoot").innerHTML;
  modalCombos++;
  if (html.indexOf(H.EM_DASH) > -1) emDash++;
  if (html.indexOf("…") > -1) ell++;
  if (!html) blank++;
  shim.fire("lon-detail-close", {});
});
/* plus the popover, the empty state and the all-current Glance */
shim.fire("lon-type", { "data-id": "lonF" });
const extra = [shim.document.getElementById("lonPop").innerHTML,
  render(reset(W("lonF3"), { state: "empty" })),
  render(reset(W("lonF3"), { state: "empty", size: "kpi" })),
  render(reset(W("lonF2"), { size: "kpi" })),
  C.lonFAgingPanel(reset(W("lonF"))),   /* carried but uncalled: swept anyway */
  C.lonFDaysCell({ days: 95 }) + C.lonFDaysCell({ days: -3 })];
extra.forEach(function (h) { modalCombos++; if (String(h).indexOf(H.EM_DASH) > -1) emDash++; if (String(h).indexOf("…") > -1) ell++; });
shim.fire("lon-detail-close", {});
console.log("    swept " + combos + " size x view x type x sort x range combinations (x2 for loading) plus " + modalCombos + " modal and state renders");
A.eq(emDash, 0, "no em dash in any of " + (combos + modalCombos) + " swept renders");
A.eq(ell, 0, "no ellipsis character either, matching our built Final's copy");
A.eq(blank, 0, "every swept combination rendered something");

/* ---------- 13. the rollback pair, now one restored and one still dormant --
   lonFAgingPanel was dormant until 2026-09-21, when the owner asked for her
   pacing bars back as an OPTION. It is now the third Explore view. lonFDaysCell
   is still carried uncalled, so the pattern itself is still exercised. */
console.log("\n[13] the rollback pattern: one restored, one still dormant");
A.ok(typeof C.lonFAgingPanel === "function", "lonFAgingPanel is defined");
A.ok(typeof C.lonFDaysCell === "function", "lonFDaysCell is defined");
/* lonFDaysCell: still exactly one occurrence, its own definition */
A.eq((block.match(/lonFDaysCell\(/g) || []).length, 1, "lonFDaysCell appears once, as its definition, and is never called");
/* lonFAgingPanel: definition plus exactly ONE call site, the bands view */
A.eq((block.match(/lonFAgingPanel\(/g) || []).length, 3, "lonFAgingPanel has its definition and TWO call sites");
A.contains(block, 'if(v==="bands")return mh+', "one is the bands branch of lonFContent (Explore)");
A.contains(block, "(bands?('<div class=\"lon-side-bands\">'+lonFAgingPanel(w)", "the other is the Detail right column");
/* Detail is deliberately unchanged: still the table beside the donut */
const det = render(reset(W("lonF_x")));
A.absent(det, "Portfolio risk", "Detail is unchanged: still the donut, not the aging panel");
A.contains(det, "Balance by time range", "Detail keeps its donut column heading");

/* ---------- 13b. BANDS as the third Explore view (owner, 2026-09-21) --- */
console.log("\n[13b] bands as the third Explore view");
(function () {
  const toggle = render(reset(W("lonF")));
  /* three segments now, and the third is ours */
  A.eq((toggle.match(/data-lon="lon-view"/g) || []).length, 3, "the Explore toggle offers three views");
  ['data-v="table"', 'data-v="pie"', 'data-v="bands"'].forEach(v =>
    A.contains(toggle, v, "the toggle offers " + v));
  A.contains(toggle, "stacked_bar_chart", "the bands segment has its own glyph");
  A.noEmDash(toggle, "the three-way toggle");

  /* the bands view renders the panel, and only in that view */
  const bands = render(reset(W("lonF"), { lonView: "bands" }));
  A.contains(bands, "lon-body-bands", "the bands view gets its own body class");
  A.contains(bands, "lon-panel", "and renders the aging panel");
  /* the old foot is gone from the view (owner, 2026-09-21) */
  A.absent(bands, "Portfolio risk", "the portfolio risk block is removed from the view");
  A.absent(bands, "Most overdue", "and so is the most-overdue list");
  A.contains(bands, "All aging bands", "the all-bands row is still there");
  A.contains(bands, "lon-mini-track", "the pacing bars themselves are present");
  A.ok((bands.match(/lon-band-row/g) || []).length >= 2, "one band row per aging band");
  A.noEmDash(bands, "the bands view");

  /* it does NOT leak into the other two views */
  const table = render(reset(W("lonF"), { lonView: "table" }));
  const pie = render(reset(W("lonF"), { lonView: "pie" }));
  A.absent(table, "lon-body-bands", "the table view is unaffected");
  A.absent(table, "Portfolio risk", "the table view does not render the panel");
  A.absent(pie, "lon-body-bands", "the pie view is unaffected");
  A.absent(pie, "Portfolio risk", "the pie view does not render the panel");
  /* the chip row still rides with the table only, as before */
  A.contains(table, "lon-bchip", "the band chips still ride with the table view");
  A.absent(bands, "lon-bchip", "and not with bands, which carries its own row filter");

  /* every class the panel emits is declared, the one known exception aside */
  const emitted = (bands.match(/class="([^"]+)"/g) || [])
    .join(" ").replace(/class="|"/g, " ").split(/\s+/)
    .filter(c => /^lon-/.test(c));
  const missing = [...new Set(emitted)].filter(c => !new RegExp("\\." + c + "[,{ :]").test(shell.css));
  /* TWO undeclared classes on this path, both PRE-EXISTING, neither introduced
     by restoring the panel. Recorded rather than silently swept:
       .lon-band-all   on her "All aging bands" row. She does not declare her
                       own equivalent either, so ours is faithful to hers.
       .lon-vtoggle    on our view toggle. Purely ours, she has no counterpart
                       at all, and it has never had a rule. Inert, because
                       .vtoggle alongside it carries the styling. */
  /* .lon-band-all went with the old markup; its replacement, .lon-band-total,
     IS declared, so only the pre-existing .lon-vtoggle remains undeclared. */
  A.eq(missing.sort().join(","), "lon-vtoggle",
    "only the pre-existing .lon-vtoggle is undeclared now");
  A.absent(bands, "lon-band-all", "the undeclared band-all class is gone from the markup");
  A.ok(/\.lon-band-total[,{ :]/.test(shell.css), "and .lon-band-total that replaced it IS declared");
  A.eq((shell.css.match(/\.loan-vtoggle[,{ :]/g) || []).length, 0,
    "and she has no vtoggle hook of her own for ours to have copied");
  A.contains(shell.css, ".vtoggle", "both are inert because the shell's .vtoggle does the styling");

  /* the panel's actions are all still handled */
  ["lon-set-bucket", "lon-open"].forEach(a =>
    A.contains(block, 'a==="' + a + '"', "the panel's " + a + " action is still handled"));

  /* picking a band from the panel filters, and the toggle survives a bad value */
  const stale = render(reset(W("lonF"), { lonView: "nonsense" }));
  A.contains(stale, "lon-bchip", "a stale view value falls back to the table");
  A.absent(stale, "lon-body-bands", "and not to bands");
})();

/* ---------- 13c. the three owner changes of 2026-09-21 --------------- */
console.log("\n[13c] total at the foot, old foot removed, Detail switchable");
(function () {
  const bands = render(reset(W("lonF"), { lonView: "bands" }));

  /* (a) THE OLD FOOT IS GONE, retained as a function rather than deleted so
         its eleven CSS rules still have an owner. */
  A.absent(bands, "Portfolio risk", "portfolio risk is gone from the view");
  A.absent(bands, "Most overdue", "the most-overdue list is gone from the view");
  A.absent(bands, "lon-risk-row", "no risk rows are emitted");
  A.absent(bands, "lon-worst-row", "no most-overdue rows are emitted");
  A.ok(typeof C.lonFRiskPanel === "function", "it survives as lonFRiskPanel, retired not deleted");
  A.eq((block.match(/lonFRiskPanel\(/g) || []).length, 1, "and is never called, the pattern this file uses");
  const hdr = render(reset(W("lonF")));
  A.contains(hdr, "past due, of which", "the header already states past due and the 90+ figure");

  /* (b) ALL AGING BANDS IS THE TOTAL, AT THE FOOT */
  const rows = [...bands.matchAll(/class="lon-band-row([^"]*)"/g)].map(m => m[1].trim());
  A.eq(rows.length, 6, "six rows: five aging bands plus the total");
  A.eq(rows.filter(c => /lon-band-total/.test(c)).length, 1, "exactly one total row");
  A.ok(/lon-band-total/.test(rows[rows.length - 1]), "and it is the LAST row, not the first");
  A.ok(rows.slice(0, -1).every(c => !/lon-band-total/.test(c)), "no band row is marked as the total");
  A.ok(bands.lastIndexOf("All aging bands") > bands.indexOf("90+ days"),
    "the all-bands label really does come after the last band");
  A.contains(shell.css, ".lon-band-total{margin-top:4px;border-top:", "the total row is ruled off above it");

  /* (c) IT FITS WITHOUT SCROLLING */
  A.eq((bands.match(/lon-band-barrow/g) || []).length, 5, "each of the five bands has a bar row");
  A.absent(bands.split("lon-band-total")[1] || "", "lon-band-barrow", "the total carries no bar, being 100% by definition");
  A.contains(shell.css, ".lon-band-barrow{display:flex", "bar and caption share one line");
  A.contains(shell.css, ".lon-body-bands .lon-band-row{padding:5px 9px;}", "and the rows are compacted for it");
  const rowPx = 5 + 5 + 16 + 3 + 14;
  const totalPx = 5 + 5 + 17 + 4;
  const need = 5 * rowPx + totalPx + 5 * 2;
  A.ok(need < 348, "six rows need about " + need + "px, inside the Explore body budget");

  /* (d) DETAIL: the right column switches, each choice excluding the other */
  const dBands = render(reset(W("lonF_x"), { lonSide: "bands" }));
  const dPie = render(reset(W("lonF_x"), { lonSide: "pie" }));
  A.contains(dBands, "lon-side-bands", "Detail can show the bands panel");
  A.contains(dBands, "Aging bands", "and retitles the column for it");
  A.absent(dBands, 'class="donut"', "with the donut not drawn");
  A.contains(dPie, 'class="donut"', "Detail still defaults to the donut");
  A.contains(dPie, "Balance by time range", "with its own column heading");
  A.absent(dPie, "lon-side-bands", "and no bands panel");
  A.contains(block, 'a==="lon-side"', "the side switch has its own handler branch");
  A.contains(block, 'function lonFSide(w){return w.lonSide==="bands"?"bands":"pie";}',
    "lonSide is its own state key, kept separate from lonView");
  A.contains(render(reset(W("lonF_x"), { lonSide: "nonsense" })), 'class="donut"', "a stale side value falls back to the donut");
  A.contains(render(reset(W("lonF_x"))), 'class="donut"', "and so does no value at all");
  A.absent(render(reset(W("lonF"), { lonSide: "bands", lonView: "table" })), "lon-side-bands",
    "lonSide does nothing at Explore");
  A.contains(render(reset(W("lonF_x"), { lonView: "table" })), 'class="donut"',
    "lonView does nothing at Detail");

  A.noEmDash(bands, "the reworked bands view");
  A.noEmDash(dBands, "the Detail bands column");
})();

process.exit(A.report());
