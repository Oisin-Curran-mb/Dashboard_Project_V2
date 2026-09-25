/* =====================================================================
   w16-payables-mb.driver.js , verification driver for the W16 Accounts
   Payable By Due Date port.

   FIRST-EVER port of this widget, 2026-09-08, onto Jo's oisin-v2-rebuild
   @ 71ca056. Runs the REAL apF block, lifted verbatim out of index.html,
   inside the shared harness's DOM shim, and drives its OWN delegated
   listeners.

   What this driver is built to catch, in the order the Step 4 doc and the
   Step 5 v2 spec rank the risks:
     1. an aggregate that IGNORES THE HORIZON, which would make the KPI, the
        pill, the bands, the table, the cash panel and the popover disagree.
        The Step 4 Filters section calls filtering widget-wide, so a single
        unscoped reader is this widget's most likely defect,
     2. overdue invoices FALLING OUT of a narrowed horizon (they must always
        be included, whatever the horizon),
     3. the horizon SNAP RULE not firing, leaving the card on a band or a
        date that the new horizon emptied,
     4. band subtotals that do not reconcile to the footer total to the cent,
     5. a sort that triggers a FETCH (only a due-filter or horizon change may),
     6. the due-date tiebreak reverting to vendor-alphabetical,
     7. a view switch appearing anywhere (the Final has none),
     8. a row drill-through coming back (Step 4 open item 1 keeps it unbuilt),
     9. any of Jo's 38 own helpers being modified, especially the four whose
        names begin with the same three letters as our prefix.

   Run from this folder:  node w16-payables-mb.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const START = '/* ===== W16 Accounts Payable By Due Date V2 JS , prefix apF , kind "payables-mb" =';
const END = "/* ===== end W16 Accounts Payable By Due Date V2 ===== */";
const KIND = "payables-mb";

const shell = H.loadShell();
const block = H.extractRegion(shell.script, START, END);
const registry = H.extractRegistry(shell.script, KIND);
const A = new H.Assert("W16 payables-mb");

/* The block reads per-widget state off the registry object and calls the shell's
   global render(), so the harness's find()/render()/timers are exactly what it
   needs. dataAttr is ours, so nothing here can reach her data-action dispatcher
   and nothing of hers can reach ours. */
const env = H.runBlock(block, { registry: registry, dataAttr: "data-apf" });
const shim = env.shim;
const Q = (n) => env.get(n);

/* Our handler guards on t.closest(".apf-root"), so a synthetic target has to
   carry the root class as well as the data attribute. */
function fireApf(action, attrs) {
  const bag = Object.assign({}, attrs || {}, { "data-apf": action });
  const t = shim.mkTarget(bag, "button", "apf-root");
  const ev = { target: t, preventDefault() {}, stopPropagation() {} };
  (shim.listeners.click || []).forEach((fn) => fn(ev));
  return ev;
}
function fireInput(id, value, className) {
  const t = shim.mkTarget({}, "input", className || "");
  t.id = id || "";
  t.value = value;
  t.closest = (sel) => (shim.matchSel(t, sel) || sel === ".apf-root" ? t : null);
  t.querySelectorAll = () => [];
  (shim.listeners.input || []).forEach((fn) => fn({ target: t }));
  return t;
}
function w(id) { return registry.filter((r) => r.id === id)[0]; }
function content(reg) { return env.call("apFContent", reg); }
/* A fresh throwaway registry-shaped object, so a probe cannot leak state into
   the demo entries the later assertions read. */
function probe(over) {
  return Object.assign({ id: "apF", dataset: undefined, state: undefined, size: "wide",
                         apFDue: "total", apFSort: "due-asc", apFHz: "all" }, over || {});
}
const cents = (n) => Math.round(n * 100);

/* ---------------------------------------------------------------- 1. shape */
A.eq(registry.length, 6, "six payables-mb registry entries");
registry.forEach((r) => {
  A.eq(r.kind, KIND, r.id + ": kind is payables-mb");
  A.contains(r.title, "(OC", r.id + ": title carries the (OC convention");
  A.noEmDash(r.title, r.id + " title");
  A.ok(Array.isArray(r.tiers) && r.tiers.length === 3, r.id + ": all three tiers offered");
  A.ok(!r.actions, r.id + ": no actions array, so no download or export menu");
  /* Our state keys, never hers. */
  A.ok("apFDue" in r && "apFSort" in r && "apFHz" in r, r.id + ": carries our own three state keys");
});
["apF", "apF_k", "apF_x", "apF2", "apF3", "apF4"].forEach((id) =>
  A.ok(!!w(id), "registry entry " + id + " present"));
A.eq(w("apF_k").size, "kpi", "apF_k is the Glance demo");
A.eq(w("apF_x").size, "xwide", "apF_x is the Detail demo");
A.eq(w("apF2").apFDue, "overdue", "apF2 demos a band-filtered card");
A.eq(w("apF3").apFHz, "h30", "apF3 demos a horizon-scoped card");
A.eq(w("apF4").dataset, "none", "apF4 demos the nothing-outstanding state");

/* --------------------------------------------- 2. data, bands and band math */
const INV = Q("APF_INVOICES");
const BANDS = Q("APF_BANDS");
const HZ = Q("APF_HORIZONS");
A.eq(INV.length, 12, "twelve outstanding invoices in the demo set");
A.eq(Q("APF_TODAY"), "2026-07-23", "the today-anchor is her 23 Jul 2026, so band populations reproduce");
A.eq(BANDS.length, 4, "FOUR aging bands, including her fourth Due later band");
A.eq(String(BANDS.map((b) => b.id)), "overdue,week,month,later",
  "the four bands are overdue, this week, this month, later, earliest first");
A.eq(BANDS[3].label, "Due later", "the fourth band is labelled Due later");
/* The band math resolved by owner instruction 2026-08-19: overdue is before
   today, week is 0 to 7 out, month is 8 to 30, later is 31+. */
A.eq(env.call("apFBandOf", "2026-07-22"), "overdue", "yesterday bands as overdue");
A.eq(env.call("apFBandOf", "2026-07-23"), "week", "today bands as due this week, at day 0");
A.eq(env.call("apFBandOf", "2026-07-30"), "week", "day 7 is the last day of due this week");
A.eq(env.call("apFBandOf", "2026-07-31"), "month", "day 8 is the first day of due this month");
A.eq(env.call("apFBandOf", "2026-08-22"), "month", "day 30 is the last day of due this month");
A.eq(env.call("apFBandOf", "2026-08-23"), "later", "day 31 is the first day of due later");
A.eq(env.call("apFDaysLabel", "2026-07-23"), "Due today", "day 0 reads Due today");
A.eq(env.call("apFDaysLabel", "2026-07-22"), "Overdue by 1 day", "one day late is singular");
A.eq(env.call("apFDaysLabel", "2026-07-24"), "Due in 1 day", "one day out is singular");
/* THE CARRIED-FORWARD ASSUMPTION, asserted so it cannot drift silently: the
   bands are computed off the invoice DUE date. The aging basis (due date versus
   invoice date) was never confirmed against the real API and is the spec's top
   open item; if it flips, this assertion is the thing that must change first. */
A.ok(/function apFBandOf\(iso\)\{var n=apFDiffDays\(iso\)/.test(block),
  "bands are computed from the DUE date, the unconfirmed aging basis, in one place");
A.ok(INV.every((x) => "due" in x && !("invoiceDate" in x)),
  "the invoice records carry a due date only: no invoice date exists to band on yet");

/* ------------------------------- 3. the four bands over the unscoped set */
const bdAll = env.call("apFBandData", probe());
A.eq(bdAll.overdue.count, 3, "three overdue invoices");
A.eq(bdAll.week.count, 3, "three due this week");
A.eq(bdAll.month.count, 3, "three due this month");
A.eq(bdAll.later.count, 3, "three due later");
A.eq(cents(bdAll.overdue.total), cents(7670.50), "overdue subtotal");
A.eq(cents(bdAll.week.total), cents(3720.75), "due-this-week subtotal");
A.eq(cents(bdAll.month.total), cents(13100), "due-this-month subtotal");
A.eq(cents(bdAll.later.total), cents(11220), "due-later subtotal");
A.eq(cents(env.call("apFTotalDue", probe())), cents(35711.25), "grand total across all due dates");
/* The four subtotals reconcile to the grand total TO THE CENT. */
A.eq(cents(bdAll.overdue.total + bdAll.week.total + bdAll.month.total + bdAll.later.total),
  cents(env.call("apFTotalDue", probe())),
  "the four band subtotals reconcile to the grand total to the cent");
A.eq(env.call("apFOverdueCount", probe()), 3, "overdue count");
A.eq(cents(env.call("apFOverdueTotal", probe())), cents(7670.50), "overdue total");

/* ------------------------------------------ 4. the horizon chip, scoped set */
A.eq(HZ.length, 5, "five horizons: all outstanding plus next 7, 30, 60 and 90 days");
A.eq(HZ[0].id, "all", "All outstanding is the first and default horizon");
A.eq(HZ[0].days, null, "the default horizon applies no day window at all");
A.eq(String(HZ.slice(1).map((h) => h.days)), "7,30,60,90", "the four windows are 7, 30, 60 and 90 days");
const expect = { all: [12, 35711.25], h7: [6, 11391.25], h30: [9, 24491.25], h60: [11, 33611.25], h90: [12, 35711.25] };
Object.keys(expect).forEach((id) => {
  const p = probe({ apFHz: id });
  A.eq(env.call("apFData", p).length, expect[id][0], id + ": working set holds " + expect[id][0] + " invoices");
  A.eq(cents(env.call("apFTotalDue", p)), cents(expect[id][1]), id + ": total is horizon-scoped");
  /* OVERDUE IS ALWAYS INCLUDED, whatever the horizon. This is the rule most
     likely to be lost by a naive "due within N days" filter. */
  A.eq(env.call("apFOverdueCount", p), 3, id + ": all three overdue invoices are still in the set");
  A.eq(cents(env.call("apFOverdueTotal", p)), cents(7670.50), id + ": the overdue total never shrinks");
  const bd = env.call("apFBandData", p);
  A.eq(bd.overdue.count, 3, id + ": the overdue band is never narrowed by the horizon");
});
/* And a narrowed horizon really does drop the far bands. */
A.eq(env.call("apFBandData", probe({ apFHz: "h7" })).month.count, 0, "h7 empties the due-this-month band");
A.eq(env.call("apFBandData", probe({ apFHz: "h7" })).later.count, 0, "h7 empties the due-later band");
A.eq(env.call("apFBandData", probe({ apFHz: "h30" })).later.count, 0, "h30 empties the due-later band");
A.eq(env.call("apFBandData", probe({ apFHz: "h60" })).later.count, 2, "h60 keeps the two invoices 40 days out");
/* An unknown horizon id falls back to All outstanding rather than emptying. */
A.eq(env.call("apFHorizonDef", probe({ apFHz: "NOPE" })).id, "all", "an unknown horizon id falls back to All outstanding");

/* -------------------------------------------- 5. the horizon SNAP RULE */
/* A band that the new horizon emptied snaps the due filter back to All. */
let s1 = probe({ apFDue: "later", apFHz: "all" });
A.eq(env.call("apFSelDue", s1), "later", "the card starts on the Due later band");
env.call("apFSetHorizon", s1, "h30");
A.eq(s1.apFDue, "total", "SNAP: a band emptied by the new horizon reverts to All due dates");
A.eq(s1.apFHz, "h30", "the new horizon is applied");
/* A specific date that left the set snaps too. */
let s2 = probe({ apFDue: "2026-09-30", apFHz: "all" });
A.eq(env.call("apFSelDue", s2), "2026-09-30", "the card starts on a specific due date");
env.call("apFSetHorizon", s2, "h30");
A.eq(s2.apFDue, "total", "SNAP: a specific date that left the set reverts to All due dates");
/* A still-valid selection is LEFT ALONE: the snap must not fire needlessly. */
let s3 = probe({ apFDue: "overdue", apFHz: "all" });
env.call("apFSetHorizon", s3, "h7");
A.eq(s3.apFDue, "overdue", "a band still populated under the new horizon is left selected");
let s4 = probe({ apFDue: "2026-07-25", apFHz: "all" });
env.call("apFSetHorizon", s4, "h30");
A.eq(s4.apFDue, "2026-07-25", "a specific date still in the set is left selected");
/* Re-picking the same horizon is a no-op, so it cannot fetch. */
let s5 = probe({ apFHz: "h30" });
env.call("apFSetHorizon", s5, "h30");
A.ok(!s5.apFLoading, "re-picking the horizon already selected does not fetch");
/* And an out-of-range stored value reads as All, never as an empty table. */
A.eq(env.call("apFSelDue", probe({ apFDue: "2026-09-30", apFHz: "h7" })), "total",
  "a stored date outside the horizon reads as All due dates rather than emptying the table");

/* -------------------------- 6. filtering is WIDGET-WIDE, not table-only */
/* Under one narrowed horizon, every figure the widget renders must agree.
   11391.25 is the h7 total; 35711.25 is the unscoped one. */
const hz7 = probe({ apFHz: "h7", size: "xwide" });
const h7Html = content(hz7);
A.contains(h7Html, "$11,391.25", "the KPI total is horizon-scoped");
A.absent(h7Html, "$35,711.25", "the unscoped grand total appears nowhere under a horizon");
A.contains(h7Html, "$7,670.50 overdue", "the overdue pill is horizon-scoped and still complete");
A.contains(h7Html, "6 invoices outstanding", "the cash panel count is horizon-scoped");
A.contains(h7Html, "All due dates (6 invoices)", "the table footer label is horizon-scoped");
A.contains(h7Html, "due within 7 days plus everything overdue",
  "the context line states the horizon and that overdue stays in");
const h7Pop = env.call("apFPopContent", hz7);
A.contains(h7Pop, "$11,391.25", "the popover's All-due-dates amount is horizon-scoped");
A.absent(h7Pop, "$35,711.25", "the popover never shows the unscoped total");
A.eq((h7Pop.match(/data-apf="apF-set-due"/g) || []).length, 1 + 2 + 3,
  "under h7 the popover offers All, the two non-empty bands, and the three remaining dates");
/* Cross-check: every aggregate reads apFData, the one scoped source. */
["apFDueDates", "apFByDate", "apFBandData", "apFTotalDue", "apFOverdueTotal",
 "apFOverdueCount", "apFVendors", "apFRows"].forEach((fn) => {
  const body = block.slice(block.indexOf("function " + fn + "("));
  A.contains(body.slice(0, body.indexOf("\n") + 400), "apFData(w)",
    fn + " reads the horizon-scoped working set, not the raw invoice array");
});
A.eq((block.match(/apFBase\(w\)/g) || []).length, 4,
  "the raw invoice array is reached in exactly four places: the scoper, the two state guards and its own definition");

/* ------------------------------------- 7. the due-date popover, unscoped */
const popAll = env.call("apFPopContent", probe());
A.contains(popAll, 'role="listbox"', "the popover is a listbox");
A.contains(popAll, "All due dates", "the popover offers All due dates with the grand total");
A.contains(popAll, "$35,711.25", "the All-due-dates row carries the grand total");
A.contains(popAll, '<div class="cap">By aging</div>', "the popover has a By aging section");
A.contains(popAll, "By specific date, earliest first", "the popover has a specific-date section");
BANDS.forEach((b) => A.contains(popAll, ">" + b.label + "<", "the popover lists the " + b.label + " band"));
A.eq((popAll.match(/data-apf="apF-set-due"/g) || []).length, 1 + 4 + 7,
  "the popover offers All, all four bands, and all seven distinct due dates");
A.contains(popAll, '<span class="bank-tag-over">Overdue</span>', "overdue entries carry an Overdue tag, not colour alone");
A.contains(popAll, "Due Jul 10, 2026", "specific dates are listed in full");
/* Earliest first, and the amounts are per date. */
A.ok(popAll.indexOf("Due Jul 10, 2026") < popAll.indexOf("Due Sep 30, 2026"),
  "specific due dates are listed earliest first");
A.contains(popAll, "$5,555.00", "each date row carries its own total");
/* Only NON-EMPTY bands are listed, per the Step 4 Filters table. */
const popH7 = env.call("apFPopContent", probe({ apFHz: "h7" }));
A.absent(popH7, ">Due later<", "an empty band is not listed in the popover");
A.absent(popH7, ">Due this month<", "the other empty band is not listed either");
A.contains(popH7, ">Overdue<", "the populated bands are still listed");

/* ----------------------------- 8. the popover SEARCH, past 8 distinct dates */
/* The demo set has 7 distinct dates, one short of the threshold, so the search
   branch is exercised against a temporarily widened set and then restored. */
A.eq(env.call("apFDueDates", probe()).length, 7, "the demo set has seven distinct due dates");
A.absent(popAll, 'id="apfq"', "at seven distinct dates no search input appears");
const extra = [{ vendor: "Northgate Fuel", inv: "INV-8801", due: "2026-10-05", amount: 410.00 },
                { vendor: "Riverbend Security", inv: "INV-8802", due: "2026-10-19", amount: 1875.00 },
                { vendor: "Palisade Paper", inv: "INV-8803", due: "2026-11-02", amount: 305.25 }];
extra.forEach((x) => INV.push(x));
A.eq(env.call("apFDueDates", probe()).length, 10, "the widened set has ten distinct due dates");
const popBig = env.call("apFPopContent", probe());
A.contains(popBig, 'id="apfq"', "past eight distinct dates a search input appears");
A.contains(popBig, 'aria-label="Search due dates"', "the search input is labelled");
/* The query filters all three sections. */
env.ctx.APF_DUE_QUERY = "oct";
const popQ = env.call("apFPopContent", probe());
A.contains(popQ, "Due Oct 5, 2026", "the query matches October dates");
A.absent(popQ, "Due Jul 10, 2026", "a non-matching date is filtered out");
A.absent(popQ, ">Overdue<", "a date query filters the band section out too");
env.ctx.APF_DUE_QUERY = "due this week";
A.contains(env.call("apFPopContent", probe()), ">Due this week<", "the query also matches band labels");
env.ctx.APF_DUE_QUERY = "zzzz";
const popNone = env.call("apFPopContent", probe());
A.contains(popNone, "No due dates match", "an empty search says so rather than rendering nothing");
A.noEmDash(popNone, "the empty-search note");
/* the input listener re-renders the popover in place, keeping the caret */
env.ctx.APF_DUE_QUERY = "";
env.call("apFOpenPop", "due", "apF", shim.mkTarget({}, "button", "apf-root"));
const rendersBeforeQuery = env.log.renders;
fireInput("apfq", "sep");
A.eq(env.ctx.APF_DUE_QUERY, "sep", "typing in the search updates the query");
A.eq(env.log.renders, rendersBeforeQuery, "the search re-renders the popover only, never the whole shell");
A.contains(shim.captured.apfPop || "", "Due Sep 1, 2026", "the popover content narrows as you type");
env.ctx.APF_DUE_QUERY = "";
env.call("apFClosePop");
extra.forEach(() => INV.pop());
A.eq(INV.length, 12, "the widened set is restored to twelve invoices");

/* ------------------------------------- 9. NO VIEW SWITCH anywhere */
const noSwitch = ["vtoggle", '"vt ', "data-apf=\"apF-view", "apFToggle", "Switch view", "donut", "timeline"];
["kpi", "wide", "xwide"].forEach((size) => {
  const html = content(probe({ size }));
  noSwitch.forEach((tok) => A.absent(html, tok, size + ": no view switch or chart trace (" + tok + ")"));
  A.absent(html, "<svg", size + ": no chart is rendered, per her v2 and the Final");
});
A.contains(content(probe()), '<div class="dep-hd-toggle"></div>',
  "the header's toggle slot is present but deliberately EMPTY");
A.eq((block.match(/dep-hd-toggle/g) || []).length, 1,
  "the toggle slot is emitted once and never filled");
A.absent(block, "function apFToggle", "no view-toggle builder exists in the block at all");
A.absent(block, "w.apFView", "no view state key exists");
registry.forEach((r) => A.ok(!("apFView" in r) && !("view" in r), r.id + ": carries no view state"));

/* ------------------- 10. Glance: filterless, but horizon-scoped */
const gl = content(probe({ size: "kpi" }));
A.contains(gl, 'data-tier="kpi"', "Glance renders at the kpi tier");
A.contains(gl, "Accounts payable", "Glance carries the scope chip");
A.contains(gl, "$35,711.25", "Glance shows the total payable");
A.contains(gl, "$7,670.50 overdue", "Glance carries the overdue pill");
A.absent(gl, "filter-chip", "Glance has NO filter chips, per the Step 4 size table");
A.absent(gl, "apF-due", "Glance offers no due-date filter");
A.absent(gl, "apF-horizon", "Glance offers no horizon chip");
A.absent(gl, "apF-sort", "Glance has no sortable table");
A.absent(gl, "wt-row", "Glance renders no table at all");
/* and yet the FIGURE is horizon-scoped, not unconditional */
const glH7 = content(probe({ size: "kpi", apFHz: "h7" }));
A.contains(glH7, "$11,391.25", "the Glance KPI is horizon-scoped, not unconditionally all due dates");
A.absent(glH7, "$35,711.25", "the Glance KPI does not fall back to the unscoped total");
A.contains(glH7, "$7,670.50 overdue", "the Glance overdue pill keeps every overdue invoice");
/* the value is in the DOM as text for a screen reader, never hover-only */
A.contains(gl, 'class="sr-only"', "the Glance total is also available as screen-reader text");
/* a due filter set on a Glance card cannot leak a table into it */
A.absent(content(probe({ size: "kpi", apFDue: "overdue" })), "wt-row",
  "a stored due filter never grows a table at Glance");

/* --------------------- 11. the hero: aging-band grouping and subtotals */
const wide = content(probe());
A.contains(wide, 'class="wt-row ap-grp"', "the table groups under aging-band subheaders");
BANDS.forEach((b) => A.contains(wide, ">" + b.label + " <", "the " + b.label + " subheader renders"));
A.eq((wide.match(/class="wt-row ap-grp"/g) || []).length, 4,
  "all four non-empty bands get a subheader at All due dates");
A.contains(wide, '<span class="ap-grp-ct">3 invoices</span>', "each subheader carries its own count");
[7670.50, 3720.75, 13100, 11220].forEach((v) => {
  const s = "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  A.contains(wide, s, "the subheader subtotal " + s + " renders");
});
A.contains(wide, "All due dates (12 invoices)", "the footer names the selection and the count");
A.contains(wide, "<span>$35,711.25</span>", "the footer total renders");
/* Reconciliation, read out of the RENDERED markup rather than the helpers, so a
   grouping bug cannot hide behind correct arithmetic. */
const grpAmts = [...wide.matchAll(/class="ap-grp-amt[^"]*">\$([\d,]+\.\d\d)</g)]
  .map((m) => cents(Number(m[1].replace(/,/g, ""))));
A.eq(grpAmts.length, 4, "four band subtotals are present in the markup");
A.eq(grpAmts.reduce((a, b) => a + b, 0), cents(35711.25),
  "the RENDERED band subtotals reconcile to the rendered footer total to the cent");
/* Under a horizon, the same reconciliation must hold on the narrowed set. */
const grp30 = [...content(probe({ apFHz: "h30" })).matchAll(/class="ap-grp-amt[^"]*">\$([\d,]+\.\d\d)</g)]
  .map((m) => cents(Number(m[1].replace(/,/g, ""))));
A.eq(grp30.reduce((a, b) => a + b, 0), cents(24491.25),
  "the band subtotals reconcile to the horizon-scoped total too");
A.eq(grp30.length, 3, "h30 renders three band subheaders, the empty one omitted");
/* Picking a band or a date FLATTENS the grouping. */
const bandOnly = content(probe({ apFDue: "overdue" }));
A.absent(bandOnly, "ap-grp", "picking a band flattens the grouping");
A.contains(bandOnly, "Overdue (3 invoices)", "the footer names the chosen band");
A.contains(bandOnly, "<span>$7,670.50</span>", "the footer total is the band subtotal");
const dateOnly = content(probe({ apFDue: "2026-07-25" }));
A.absent(dateOnly, "ap-grp", "picking a specific date flattens the grouping too");
A.contains(dateOnly, "Due Jul 25, 2026 (3 invoices)", "the footer names the chosen date");
/* Overdue is never colour alone: glyph plus the words, in the row and the band. */
A.contains(wide, 'class="ap-due-days over"', "an overdue row's day cell carries the red variant");
A.contains(wide, "Overdue by 13 days", "and states the lateness in words");
A.contains(wide, 'class="ap-grp-nm over"', "the overdue band subheader carries the red variant");
A.contains(wide, ">warning<", "overdue carries a warning glyph as well as colour");

/* ----------------------- 12. four columns, all sortable, no drill-through */
A.eq((wide.match(/data-apf="apF-sort"/g) || []).length, 4, "FOUR sortable column headers");
["Vendor", "Invoice", "Due date", "Amount"].forEach((c) =>
  A.contains(wide, 'data-k="' + { Vendor: "vendor", Invoice: "inv", "Due date": "due", Amount: "amt" }[c] + '"',
    "the " + c + " column is a sort button"));
A.absent(wide, "ap-c-status", "her separate Status column is folded into the two-line due cell");
A.contains(wide, 'class="ap-c-due"><span class="ap-due-d"', "the due cell is the two-line date-plus-lateness cell");
A.contains(wide, 'aria-label="Sort by due date, currently ascending"',
  "the active sort header announces its direction");
A.contains(wide, 'aria-label="Sort by vendor"', "an inactive sort header announces its column");
/* NO ROW DRILL-THROUGH: rows are not buttons and carry no click affordance. */
A.absent(wide, "ap-rowclick", "no row-click affordance class");
A.absent(wide, 'role="button"', "no row is a button");
A.absent(wide, "tabindex", "no row is focusable as a control");
A.absent(block, "showModal", "the block never opens a modal: drill-through stays unbuilt");
A.absent(block, "apF-open", "no row-open action exists");
const beforeRows = env.log.renders;
fireApf("apF-open", { "data-id": "apF" });
fireApf("row", { "data-id": "apF" });
A.eq(env.log.renders, beforeRows, "clicking a row does nothing: this port is READ ONLY");
/* The actionability dispute stays recorded, not resolved: no pay or schedule
   control exists anywhere in the block (Feargal's 2026-08-25 ruling). */
["Pay ", "Schedule payment", "apF-pay", "apF-schedule", "Approve"].forEach((tok) =>
  A.absent(block, tok, "no payment action in the block (" + tok + ")"));

/* ------------- 13. sort: due ascending default, LARGER AMOUNT tiebreak */
const rowsDef = env.call("apFRows", probe());
A.eq(rowsDef.length, 12, "the default row list holds every invoice");
A.eq(rowsDef[0].due, "2026-07-10", "default sort is due date ASCENDING");
A.eq(rowsDef[rowsDef.length - 1].due, "2026-09-30", "and runs to the latest due date");
/* The 18 Jul pair and the 25 Jul trio both break ties by the LARGER AMOUNT
   FIRST, never vendor-alphabetical. City Water sorts before Grainger
   alphabetically, so a vendor-alphabetical tiebreak would put it first. */
const jul18 = rowsDef.filter((r) => r.due === "2026-07-18");
A.eq(jul18[0].vendor, "Grainger Supply", "date tie broken by LARGER AMOUNT first, not vendor-alphabetical");
A.eq(cents(jul18[0].amount), cents(1240.50), "the larger of the two 18 Jul invoices leads");
const jul25 = rowsDef.filter((r) => r.due === "2026-07-25");
A.eq(String(jul25.map((r) => cents(r.amount))), String([210000, 98000, 64075]),
  "the three 25 Jul invoices run largest amount first");
/* Every column really re-orders, and toggles direction. */
const orders = {
  vendor: ["vendor", (r) => r.vendor],
  inv: ["inv", (r) => r.inv],
  amt: ["amt", (r) => r.amount]
};
Object.keys(orders).forEach((k) => {
  const asc = env.call("apFRows", probe({ apFSort: k + "-asc" }));
  const desc = env.call("apFRows", probe({ apFSort: k + "-desc" }));
  A.changed(asc.map(orders[k][1]).join("|"), rowsDef.map(orders[k][1]).join("|"),
    "sorting by " + k + " ascending re-orders the list");
  A.eq(String(desc.map(orders[k][1])), String(asc.map(orders[k][1]).reverse()),
    "sorting by " + k + " descending is the exact reverse of ascending");
});
A.eq(env.call("apFRows", probe({ apFSort: "vendor-asc" }))[0].vendor, "City Water & Power",
  "vendor ascending starts at the alphabetically first vendor");
A.eq(cents(env.call("apFRows", probe({ apFSort: "amt-desc" }))[0].amount), cents(8400),
  "amount descending starts at the largest invoice");
/* Clicking a header toggles it; clicking a different one adopts that column's
   own first direction (text and dates ascending, amount descending). */
const sw = w("apF");
sw.apFSort = "due-asc";
fireApf("apF-sort", { "data-id": "apF", "data-k": "due" });
A.eq(sw.apFSort, "due-desc", "clicking the active header flips its direction");
fireApf("apF-sort", { "data-id": "apF", "data-k": "vendor" });
A.eq(sw.apFSort, "vendor-asc", "a text column adopts ascending first");
fireApf("apF-sort", { "data-id": "apF", "data-k": "amt" });
A.eq(sw.apFSort, "amt-desc", "the amount column adopts descending first");
sw.apFSort = "due-asc";
/* Grouping keeps the current sort WITHIN each band. */
const grouped = content(probe({ apFSort: "amt-desc" }));
const firstBandRows = grouped.slice(grouped.indexOf("Overdue <"), grouped.indexOf("Due this week <"));
A.ok(firstBandRows.indexOf("$5,555.00") < firstBandRows.indexOf("$875.00"),
  "the chosen sort is kept inside each band");

/* ------------------- 14. FETCH ON FILTER ONLY, never on sort */
const wf = w("apF");
delete wf.apFLoading; delete wf.apFLast;
const timersBefore = env.log.timers;
fireApf("apF-set-due", { "data-id": "apF", "data-due": "overdue" });
A.ok(wf.apFLoading === true, "picking a due filter FETCHES: the loading flag is set");
A.eq(wf.apFLast, "due", "and the due chip is the one that shows the spinner");
A.eq(env.log.timers, timersBefore + 1, "exactly one 800ms timer was started");
wf.apFLoading = false;
fireApf("apF-set-horizon", { "data-id": "apF", "data-h": "h60" });
A.ok(wf.apFLoading === true, "picking a horizon FETCHES too");
A.eq(wf.apFLast, "horizon", "and the horizon chip is the one that shows the spinner");
wf.apFLoading = false;
const timersAfterFilters = env.log.timers;
["vendor", "inv", "due", "amt"].forEach((k) => fireApf("apF-sort", { "data-id": "apF", "data-k": k }));
A.ok(!wf.apFLoading, "sorting NEVER fetches: the loading flag stays clear");
A.eq(env.log.timers, timersAfterFilters, "sorting starts no timer at all");
/* Re-picking the same due filter is a no-op, so it cannot fetch either. */
wf.apFDue = "overdue"; wf.apFHz = "h60"; wf.apFLoading = false;
const timersSame = env.log.timers;
fireApf("apF-set-due", { "data-id": "apF", "data-due": "overdue" });
A.ok(!wf.apFLoading, "re-picking the due filter already selected does not fetch");
A.eq(env.log.timers, timersSame, "and starts no timer");
/* The loading render is the header skeleton plus five skeleton rows, and the
   spinner sits on whichever chip started the fetch. */
const loadHtml = content(probe({ apFLoading: true, apFLast: "due" }));
A.contains(loadHtml, "ap-skel", "the loading state renders the skeleton table");
A.eq((loadHtml.match(/ap-sk-row/g) || []).length, 5, "five skeleton rows");
A.contains(loadHtml, "Updating outstanding invoices...", "the loading copy uses three dots, not an ellipsis glyph");
A.contains(loadHtml, 'aria-busy="true"', "the skeleton is announced as busy");
A.absent(loadHtml, "wt-head", "the real table is replaced while loading");
const chipDue = content(probe({ apFLoading: true, apFLast: "due" }));
const chipHz = content(probe({ apFLoading: true, apFLast: "horizon" }));
A.ok(chipDue.indexOf("bgt-spin") < chipDue.indexOf("apf-hz-chip"),
  "a due fetch puts the spinner on the due chip");
A.ok(chipHz.indexOf("apf-hz-chip") < chipHz.indexOf("bgt-spin"),
  "a horizon fetch puts the spinner on the horizon chip");
A.eq((chipDue.match(/bgt-spin/g) || []).length, 1, "only one chip ever spins at a time");
/* restore the demo entry */
wf.apFDue = "total"; wf.apFHz = "all"; delete wf.apFLoading; delete wf.apFLast;

/* --------------- 15. the Detail cash-requirements / top-vendors panel */
const det = content(probe({ size: "xwide" }));
A.contains(det, 'data-tier="xwide"', "Detail renders at the xwide tier");
A.contains(det, "Cash requirements", "Detail adds the Cash requirements panel");
A.contains(det, "Top vendors owed", "Detail adds the Top vendors owed rollup");
A.contains(det, "Outstanding invoices", "the table keeps its own column heading");
A.contains(det, "How much cash is needed, and when. Pick a band to filter the invoice list.",
  "the panel explains what it is for and that the rows filter");
/* The All row plus the four band rows double as the due filter. */
A.eq((det.match(/data-apf="apF-set-due"/g) || []).length, 5,
  "the All row and all four band rows are due-filter selectors");
A.contains(det, 'class="ap-sum-row ap-sum-all sel"', "the All row shows as selected by default");
A.contains(det, 'aria-pressed="true"', "the selected selector row is announced as pressed");
A.contains(det, "12 invoices outstanding", "the All row carries the outstanding count");
A.contains(det, "3 invoices, 21% of total", "each band row carries its count and its share");
A.contains(det, 'class="ap-sum-track" aria-hidden="true"', "the share bars are aria-hidden magnitude cues");
A.contains(det, "ap-sum-fill over", "the overdue band's bar takes the darker step");
/* Top vendors owed is a top FIVE, largest first, flagging overdue in red. */
const vend = env.call("apFVendors", probe());
A.eq(vend.length, 9, "nine distinct vendors in the set");
A.eq(vend[0].vendor, "Guardian Insurance", "the vendor rollup leads with the largest owed");
A.eq(cents(vend[0].total), cents(16800), "Guardian's two invoices are rolled up");
A.ok(vend.every((v, i) => i === 0 || vend[i - 1].total >= v.total), "the rollup is ordered largest first");
A.eq((det.match(/class="ap-sum-row ap-static"/g) || []).length, 5,
  "the rollup shows the top FIVE vendors, not all nine");
A.contains(det, '<span class="ap-over">$5,555.00 overdue</span>',
  "a vendor with an overdue balance flags the overdue amount");
A.absent(det, "Palisade Paper", "a vendor outside the top five is not listed");
/* An emptied band is a DISABLED row, not a hidden one. */
const detH7 = content(probe({ size: "xwide", apFHz: "h7" }));
A.contains(detH7, "Due later", "an emptied band still appears in the panel");
A.contains(detH7, 'disabled aria-disabled="true"', "but as a disabled row");
A.contains(detH7, "nothing due", "and says nothing due rather than showing a bare zero");
A.eq((detH7.match(/data-apf="apF-set-due"/g) || []).length, 3,
  "under h7 only the All row and the two populated bands are clickable");
/* the panel amounts reconcile to the table footer, to the cent */
const panelAmts = [...det.matchAll(/class="ap-sum-val[^"]*">\$([\d,]+\.\d\d)</g)]
  .map((m) => cents(Number(m[1].replace(/,/g, ""))));
A.eq(panelAmts[0], cents(35711.25), "the panel's All row equals the grand total");
A.eq(panelAmts.slice(1, 5).reduce((a, b) => a + b, 0), cents(35711.25),
  "the panel's four band amounts reconcile to the grand total to the cent");
/* clicking a band row in the panel filters the whole widget */
const wp = w("apF_x");
delete wp.apFLoading;
fireApf("apF-set-due", { "data-id": "apF_x", "data-due": "week" });
A.eq(wp.apFDue, "week", "clicking a band row in the panel sets the due filter");
A.ok(wp.apFLoading === true, "and it counts as a fetch, like the popover");
wp.apFDue = "total"; delete wp.apFLoading; delete wp.apFLast;
/* Explore does NOT get the panel: it is the Detail addition. */
A.absent(content(probe({ size: "wide" })), "Cash requirements", "Explore does not carry the Detail panel");
A.absent(content(probe({ size: "wide" })), "Top vendors owed", "nor the vendor rollup");

/* ------------------------- 16. the vendor search, past 6 rows */
A.contains(wide, 'class="dep-q"', "past six rows a vendor search appears above the table");
A.contains(wide, 'aria-label="Search vendors or invoices"', "the vendor search is labelled");
A.absent(content(probe({ apFDue: "overdue" })), 'class="dep-q"',
  "at three rows no vendor search appears");
A.absent(wide, "apF-vendor", "the vendor search is a client-side row filter, not an action");
A.ok(typeof env.get("apFVendorFilter") === "function", "the row filter exists and is reachable");
const rendersBeforeVendor = env.log.renders;
fireInput("", "grainger", "dep-q");
A.eq(env.log.renders, rendersBeforeVendor, "the vendor search never re-renders the shell");
/* There is no vendor filter CHIP in the Final, per Step 4. */
A.absent(wide, "apF-vendor-chip", "no vendor filter chip exists");
A.eq((wide.match(/data-apf="apF-(due|horizon)"/g) || []).length, 2,
  "exactly TWO filter chips: due date and horizon");

/* --------------------------- 17. the empty state, at every size */
["kpi", "wide", "xwide"].forEach((size) => {
  ["none", undefined].forEach((ds, i) => {
    const st = i === 0 ? { size, dataset: "none" } : { size, state: "empty" };
    const html = content(probe(st));
    A.contains(html, "Nothing outstanding", size + ": the empty state says Nothing outstanding");
    A.contains(html, 'data-kind="empty"', size + ": it uses her empty-state block");
    A.contains(html, "task_alt", size + ": with the positive glyph, not an error one");
    A.absent(html, "dep-hd", size + ": no duplicated header above the empty state");
    A.absent(html, "wt-row", size + ": no table shell is left behind");
    A.absent(html, "$0.00", size + ": no fake zero total");
    A.noEmDash(html, size + " empty state");
  });
});
A.contains(content(probe({ size: "wide", dataset: "none" })),
  "All supplier invoices are paid. Nothing is due right now.",
  "Explore gets the full positive empty copy");
A.absent(content(probe({ size: "kpi", dataset: "none" })),
  "All supplier invoices are paid.",
  "Glance gets the SHORT variant of the empty state");
/* Her generic fallback must never be able to claim this widget. */
A.absent(content(probe({ dataset: "none" })), "Deposits", "the Deposits empty copy never reaches our card");
A.absent(content(probe({ dataset: "none" })), "inbox", "nor her generic inbox glyph");

/* -------------------------- 18. popover open, close, toggle, escape */
const wo = w("apF");
env.call("apFClosePop");
fireApf("apF-due", { "data-id": "apF" });
A.ok(env.ctx.APF_POP && env.ctx.APF_POP.type === "due", "the due chip opens the due popover");
A.eq(env.ctx.APF_POP.id, "apF", "the popover remembers which card opened it");
A.contains(shim.captured.apfPop || "", "All due dates", "the popover mounted its content");
A.eq(shim.nodes.apfPop.className, "apf-root apf-pop", "the popover is mounted with our own scoped classes");
fireApf("apF-due", { "data-id": "apF" });
A.ok(!env.ctx.APF_POP, "clicking the same chip again closes it");
fireApf("apF-horizon", { "data-id": "apF" });
A.eq(env.ctx.APF_POP.type, "horizon", "the horizon chip opens the horizon popover");
A.contains(shim.captured.apfPop || "", "Next 30 days", "the horizon popover lists the windows");
A.contains(shim.captured.apfPop || "", "overdue always included",
  "each scoped horizon restates that overdue stays in the set");
fireApf("apF-due", { "data-id": "apF" });
A.eq(env.ctx.APF_POP.type, "due", "clicking the OTHER chip swaps which popover is open");
shim.fireKey("Escape");
A.ok(!env.ctx.APF_POP, "Escape closes the popover");
fireApf("apF-horizon", { "data-id": "apF" });
shim.fireOutside();
A.ok(!env.ctx.APF_POP, "an outside click closes the popover");
/* the chips announce their own expanded state */
env.call("apFOpenPop", "due", "apF", shim.mkTarget({}, "button", "apf-root"));
A.contains(env.call("apFDueChip", wo), 'aria-expanded="true"', "the open chip reports itself expanded");
A.contains(env.call("apFHorizonChip", wo), 'aria-expanded="false"', "the closed chip reports itself collapsed");
env.call("apFClosePop");
A.contains(env.call("apFDueChip", wo), 'aria-expanded="false"', "and collapses again when closed");
/* both chips are her secondary-fill filter chips with a chevron */
A.contains(env.call("apFDueChip", wo), 'class="filter-chip ap-due-chip"', "the due chip is her filter chip");
A.contains(env.call("apFHorizonChip", wo), 'class="filter-chip apf-hz-chip"', "the horizon chip is too");
[env.call("apFDueChip", wo), env.call("apFHorizonChip", wo)].forEach((c) => {
  A.contains(c, "expand_more", "the chip carries a trailing chevron");
  A.contains(c, "aria-haspopup=\"listbox\"", "the chip announces its listbox");
  A.contains(c, "aria-label=", "the chip carries a plain-language label");
});
A.contains(env.call("apFHorizonChip", probe({ apFHz: "h30" })),
  "overdue invoices always included", "the horizon chip's label states the overdue rule");

/* --------------------- 19. NO EM DASH, every size x band x horizon */
let sweep = 0;
const dues = ["total", "overdue", "week", "month", "later", "2026-07-25"];
["kpi", "wide", "xwide"].forEach((size) => {
  dues.forEach((due) => {
    ["all", "h7", "h30", "h60", "h90"].forEach((hz) => {
      ["ready", "none"].forEach((ds) => {
        const html = content(probe({ size, apFDue: due, apFHz: hz,
                                     dataset: ds === "none" ? "none" : undefined }));
        A.noEmDash(html, `${size}/${due}/${hz}/${ds}`);
        sweep++;
      });
    });
    /* and the loading render for the same combination */
    A.noEmDash(content(probe({ size, apFDue: due, apFLoading: true, apFLast: "due" })),
      `${size}/${due}/loading`);
    sweep++;
  });
});
A.eq(sweep, 198, "the no-em-dash sweep covered all 198 size x band x horizon x state combinations");
/* and everything that renders OUTSIDE content() */
["all", "h7", "h30", "h60", "h90"].forEach((hz) => {
  A.noEmDash(env.call("apFPopContent", probe({ apFHz: hz })), "the due popover at " + hz);
  A.noEmDash(env.call("apFHorizonPopContent", probe({ apFHz: hz })), "the horizon popover at " + hz);
  A.noEmDash(env.call("apFDueChip", probe({ apFHz: hz })), "the due chip at " + hz);
  A.noEmDash(env.call("apFHorizonChip", probe({ apFHz: hz })), "the horizon chip at " + hz);
  A.noEmDash(env.call("apFBadge", probe({ apFHz: hz })), "the overdue pill at " + hz);
});
A.noEmDash(Q("APF_ABOUT"), "the About popover body");
BANDS.forEach((b) => A.noEmDash(b.label, "the " + b.id + " band label"));
HZ.forEach((h) => { A.noEmDash(h.chip, "the " + h.id + " chip label"); A.noEmDash(h.pick, "the " + h.id + " menu label"); });
INV.forEach((x) => A.noEmDash(x.vendor + x.inv, "the " + x.inv + " record"));
/* the positive pill, which only renders when nothing is overdue */
const noOd = env.call("apFBadge", { apFHz: "all", dataset: undefined, apFDue: "total",
                                    id: "x", size: "wide" });
A.contains(noOd, "overdue", "the pill states the overdue position");
A.noEmDash(noOd, "the overdue pill");

/* -------------------- 20. CSS: ours declared, hers reused not redeclared */
A.cssDeclares(shell.css, ["apf-root", "apf-w", "apf-pop", "apf-body", "apf-ctlrow",
  "apf-hz-chip", "apf-ctx"], "our own .apf- classes");
/* Every class we borrow from her must genuinely exist in the stylesheet, or it
   ships as unstyled native chrome. */
A.cssDeclares(shell.css, ["ap-due-chip", "ap-pill", "ap-mi-amt", "ap-over", "ap-c-inv",
  "ap-c-due", "ap-due-d", "ap-due-days", "ap-grp", "ap-grp-nm", "ap-grp-ct", "ap-grp-amt",
  "ap-col-cash", "ap-panel", "ap-sum-sub", "ap-sum-h", "ap-sum-row", "ap-sum-all",
  "ap-sum-main", "ap-sum-lbl", "ap-sum-meta", "ap-sum-track", "ap-sum-fill", "ap-sum-val",
  "ap-sum-sep", "ap-static", "ap-skel", "ap-sk-row",
  "dep-hd", "dep-hd-top", "dep-hd-num", "dep-hd-toggle", "dep-hd-kpigrp", "dep-total",
  "dep-full", "dep-col", "dep-col-h", "dep-search", "dep-q", "tbl-search", "filter-chip",
  "fc-label", "kpi-row", "kpi-num", "gl-sub", "metric-value", "scope-chip", "sc-nm",
  "mi", "mi-gap", "mi-nm", "mi-nm-stack", "mi-acctno", "mi-note", "cap", "dd-search",
  "dd-input", "menu-scroll", "bank-numwrap", "bank-tag-over", "sk", "bgt-spin", "state",
  "state-title", "state-sub", "scroll", "sr-only", "wt-row", "wt-head", "wt-sort",
  "lr-main", "wt-c2"], "Jo's classes we reuse rather than redeclare");
/* Our CSS block must declare zero selectors of hers. */
const ourCss = shell.css.slice(
  shell.css.indexOf("===== W16 Accounts Payable By Due Date V2 CSS"),
  shell.css.indexOf("===== end W16 Accounts Payable By Due Date V2 CSS"));
A.ok(ourCss.length > 500, "our CSS block is present and findable by its markers");
const ourSelectors = (ourCss.match(/^\s*([^\n{}/][^\n{}]*)\{/gm) || []).map((s) => s.replace(/\{$/, "").trim());
A.eq(ourSelectors.filter((s) => s.indexOf(".apf-") < 0).length, 0,
  "EVERY rule in our CSS block is .apf-scoped, so it cannot reach her widget");
A.ok(ourSelectors.length >= 8, "our CSS block declares the expected handful of rules (" + ourSelectors.length + ")");
/* Specifically: not one rule of ours STARTS at one of her two-letter selectors,
   so none of them can win on specificity or reach her card. The single rule that
   mentions one of hers is scoped under .apf-root and keys on OUR attribute. */
A.eq(ourSelectors.filter((s) => /^\.ap-/.test(s)).length, 0,
  "not one rule in our block STARTS at one of her selectors");
A.eq(ourSelectors.filter((s) => /\.ap-/.test(s) && !/^\.apf-root\s/.test(s)).length, 0,
  "any rule that mentions one of her selectors at all is scoped under .apf-root first");
A.ok(/\.apf-root \.ap-sum-row\[data-apf\]:hover/.test(ourCss),
  "the one selector-row hover we add is scoped under .apf-root and keys on OUR attribute");
A.absent(ourCss, "#", "our CSS block declares no hard-coded hex colour");

/* ------------- 21. Jo's payables widget and all 38 helpers are untouched */
const S = shell.script;
const HER = ["apBadge", "apBandData", "apBandOf", "apByDate", "apContent", "apData",
  "apDaysLabel", "apDaysShort", "apDiffDays", "apDueChip", "apDueDates", "apDueWithin",
  "apEsc", "apFmtLong", "apFmtShort", "apFull", "apGlance", "apHandleClick",
  "apHeaderBlock", "apISO", "apIsBand", "apIsOverdue", "apLoad", "apMiniBar", "apMoney",
  "apOverdueCount", "apOverdueTotal", "apPanel", "apParse", "apPopContent", "apRowHTML",
  "apRows", "apSel", "apSelLabel", "apSkeleton", "apTable", "apTotalDue", "apVendors"];
A.eq(HER.length, 38, "the collision list holds all 38 of her ap helpers");
HER.forEach((fn) => {
  const defs = (S.match(new RegExp("function\\s+" + fn + "\\s*\\(", "g")) || []).length;
  A.eq(defs, 1, "Jo's " + fn + " is still defined exactly once");
});
/* THE TRAP ON THIS WIDGET: four of her names begin with the same three letters
   as our prefix. Each must still be hers, and none of ours may equal one. */
["apFmtLong", "apFmtShort", "apFull", "apSelLabel"].forEach((fn) => {
  A.ok(new RegExp("function\\s+" + fn + "\\s*\\(").test(S),
    "her lookalike " + fn + " is still defined");
  A.absent(block, "function " + fn + "(", "our block does NOT define her lookalike " + fn);
});
/* Every name our block defines is apF or APF_ prefixed, and none equals one of
   hers. This is the assertion that would have caught the W09 and W13 traps. */
/* TOP-LEVEL declarations only, i.e. those at column zero. A helper nested inside
   a renderer (the sort-button builder inside the table) is function-scoped and
   cannot collide with anything of hers, so it is deliberately not counted. */
const ourNames = new Set([
  ...(block.match(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm) || []).map((m) => m.replace(/^function\s+/, "").replace(/\s*\($/, "")),
  ...(block.match(/^var\s+([A-Za-z_$][\w$]*)/gm) || []).map((m) => m.replace(/^var\s+/, ""))
]);
const collisions = [...ourNames].filter((n) => HER.indexOf(n) > -1);
A.eq(collisions.length, 0, "NOT ONE name our block defines equals one of her 38 helpers");
const unprefixed = [...ourNames].filter((n) => !/^apF[A-Z]/.test(n) && !/^APF_/.test(n));
A.eq(unprefixed.length, 0, "every top-level name our block defines is apF or APF_ prefixed (" + unprefixed.join(", ") + ")");
A.ok(ourNames.size >= 50, "our block defines the expected namespaced surface (" + ourNames.size + " names)");
/* Her data, registry and dispatch are all intact. */
A.eq((S.match(/var AP_INVOICES\s*=/g) || []).length, 1, "Jo's AP_INVOICES is still declared exactly once");
A.eq((S.match(/var AP_INVOICES_SINGLE\s*=/g) || []).length, 1, "and her single-date variant too");
A.eq((S.match(/var AP_BANDS\s*=/g) || []).length, 1, "Jo's AP_BANDS is still declared exactly once");
A.eq((S.match(/var AP_TODAY\s*=/g) || []).length, 1, "Jo's AP_TODAY is still declared exactly once");
A.eq((S.match(/,kind:"payables",/g) || []).length, 6, "Jo's six payables registry entries are all still there");
/* TWO occurrences each, both pre-existing and both verified against the
   pre-edit snapshot: the live statement, plus one copy inside HER OWN wiring
   comment above the block. Neither count moved when this widget was ported. */
A.eq((S.match(/if\(w\.kind==="payables"\)return apContent\(w\);/g) || []).length, 2,
  "her contentHTML dispatch line is intact: the live one plus the copy in her own comment");
A.eq((S.match(/^\s*EMPTY_COPY\.payables=\{/gm) || []).length, 1,
  "her empty copy is declared exactly once as a statement, and unedited");
A.eq((S.match(/EMPTY_COPY\.payables=/g) || []).length, 2,
  "and appears twice overall, the statement plus the copy in her own comment");
A.absent(block, "EMPTY_COPY", "our block never writes to her shared copy object: the strings are inline");
A.absent(block, "ERROR_COPY", "nor to her error copy object");
/* Our dispatch is additive, present once, and sits with the MB variants BEFORE
   the generic empty fallback so apF4 renders our own empty state. */
A.eq((S.match(/if\(w\.kind==="payables-mb"\)return apFContent\(w\);/g) || []).length, 1,
  "our contentHTML dispatch line is present exactly once");
A.ok(S.indexOf('w.kind==="payables-mb"') < S.indexOf('if(w.state==="empty"){var ec=EMPTY_COPY[w.kind]'),
  "our dispatch sits BEFORE the generic empty fallback, so our own empty state wins");
A.ok(S.indexOf('w.kind==="bank-mb"') < S.indexOf('w.kind==="payables-mb"'),
  "our dispatch is appended at the END of the mb chain, after the newest entry");
A.eq((S.match(/w\.kind==="payables-mb"/g) || []).length, 2,
  "payables-mb is dispatched in exactly two places: contentHTML and aboutOf");
A.ok(/function apFContent\(/.test(S), "our single entry point is apFContent");
/* Our block cannot reach her dispatcher and hers cannot reach ours. */
A.eq((block.match(/data-action=/g) || []).length, 0,
  "our block emits NO data-action, so her dispatcher can never reach our markup");
A.ok((block.match(/data-apf=/g) || []).length >= 9,
  "our block drives everything through our own data-apf attribute");
A.eq((block.match(/data-apf="(?!apF-)/g) || []).length, 0,
  "every data-apf VALUE is apF- prefixed, never one of her ap- action names");
A.eq((block.match(/\bfunction\s+ap[A-EG-Z]/g) || []).length, 0,
  "our block defines no function that would sit in her two-letter namespace");
A.eq((block.match(/\bpop\s*=/g) || []).length, 0,
  "our block never assigns her global popover state: ours is APF_POP");
/* We do reuse her shared plumbing, on purpose and read-only. */
A.contains(block, "ICON(", "we reuse her ICON helper rather than shipping our own");
A.contains(block, "data-tip", "we reuse her delegated tooltip system rather than a native title");
A.absent(block, 'title="', "no native title attribute anywhere: her tooltip component is used instead");
A.contains(block, 'timers["apF-', "the fetch timer is keyed under our own prefix in her shared timers object");

process.exit(A.report());
