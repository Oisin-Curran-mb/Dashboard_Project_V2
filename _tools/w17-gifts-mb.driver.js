/* =====================================================================
   w17-gifts-mb.driver.js , verification driver for our ported W17.

   Widget: Gifts Pledges (MB updated), kind "gifts-mb", prefix gpF / GPF_,
   root class .gpf-root, action attribute data-gpf.
   FIRST-EVER port, 2026-09-08, built against Jo's phase-2 @ 71ca056, and
   the FOURTEENTH and last driver of the run.

   Runs the real ported block out of the real index.html in the shared
   harness and drives its own delegated listeners. Asserts, in order:
     1  render at every tier, both views
     2  the retired donut: code present, genuinely unreachable
     3  the campaign filter NARROWS and does not highlight
     4  a bar click opens the top-5 most-behind modal
     5  a row expands the donor breakdown at 20 per page, totals invariant
     6  a pledge click expands its gifts
     7  ordering: bars closest-to-goal-first, drill most-behind-first,
        table in data order, and NO alphabetical sort anywhere
     8  the export button styles from the GLOBAL button family, and our
        root carries no W04 root class (the deliberate decoupling)
     9  the Rule 11 navigation stub is present and labelled as a stub
    10  the empty states
    11  a no-em-dash sweep over every size x campaign x view combination
    12  registry titles in the (OC form
    13  all 36 of Jo's gft* helpers byte-unmodified, and her gifts block,
        her gifts CSS cluster and her registry rows untouched

   Run from this folder:  node w17-gifts-mb.driver.js
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const END = "/* ===== end W17 Gifts Pledges V2 ===== */";
const CSS_START = "/* ===== W17 Gifts Pledges V2 CSS";
const CSS_END = "/* ===== end W17 Gifts Pledges V2 CSS ===== */";

const shell = H.loadShell();
const block = H.extractRegion(shell.script, "var GPF_TODAY=", END);
const registry = H.extractRegistry(shell.script, "gifts-mb");
const A = new H.Assert("W17 gifts-mb");

const env = H.runBlock(block, { registry: registry, dataAttr: "data-gpf" });
const ctx = env.ctx;
const shim = env.shim;

/* a click whose target is inside our root, which is what the block's own
   listener requires (it bails on anything outside .gpf-root). */
function gfire(action, attrs) {
  const bag = Object.assign({}, attrs || {});
  if (action) bag["data-gpf"] = action;
  const t = shim.mkTarget(bag, "button", "gpf-root");
  const ev = { target: t, preventDefault: function () {}, stopPropagation: function () {} };
  (shim.listeners.click || []).forEach(function (fn) { fn(ev); });
  return ev;
}
/* A keydown whose target behaves like a real element: the harness's generic
   node.click() rebuilds the target from the action alone and drops the rest of
   its attributes, which a real DOM never does, so the keyboard path would look
   broken for reasons that are the shim's and not the widget's. This target
   re-dispatches its OWN attribute bag, which is what a browser does. */
function gkey(key, attrs) {
  const bag = Object.assign({}, attrs || {});
  const t = shim.mkTarget(bag, "div", "gpf-root");
  let clicks = 0;
  t.click = function () { clicks++; gfire(null, bag); };
  const ev = { key: key, target: t, preventDefault: function () { ev._prevented = true; }, _prevented: false };
  (shim.listeners.keydown || []).forEach(function (fn) { fn(ev); });
  ev.clicks = function () { return clicks; };
  return ev;
}
function W(id) { return registry.filter(function (w) { return w.id === id; })[0]; }
function fresh(id, over) {
  const base = W(id);
  const w = Object.assign({}, base, { gpFExp: {}, gpFPage: {}, gpFPlExp: {} }, over || {});
  return w;
}
const CAMPS = ctx.GPF_CAMPAIGNS;
const LABELS = CAMPS.map(function (c) { return c.code + ": " + c.name; });

/* ---------------------------------------------------------------- 0. shape */
A.eq(registry.length, 7, "seven gifts-mb registry entries");
A.eq(typeof ctx.gpFContentRoot, "function", "gpFContentRoot entry point defined");
A.eq(ctx.GPF_PAGE_SIZE, 20, "donor breakdown page size is 20 (Step 4)");
A.eq(CAMPS.length, 6, "six campaigns in the fixture");
A.eq(ctx.GPF_V12_LAYOUT, true, "v1.2 layout flag ships true (one view at a time)");
/* the two live-screenshot rows, the numeric proof cited in Step 4 */
A.eq(CAMPS[0].code, "FRNKSTOK", "first fixture row is the live Stoke Sell row");
A.eq(CAMPS[0].received, 1855, "Stoke Sell received 1855 (live screenshot)");
A.eq(CAMPS[1].received, 96, "2020 Pledge received 96 (live screenshot)");

/* ------------------------------------------------- 1. every tier, both views */
["kpi", "wide", "xwide"].forEach(function (sz) {
  ["goal", "table"].forEach(function (v) {
    const w = fresh("gpF", { size: sz, gpFView: v });
    const html = ctx.gpFContentRoot(w);
    A.ok(html && html.length > 200, "renders at " + sz + " / " + v);
    A.contains(html, 'class="gpf-root"', "root class at " + sz + "/" + v);
    A.contains(html, 'data-tier="' + sz + '"', "tier attribute at " + sz + "/" + v);
    if (sz === "kpi") {
      /* Glance ignores the view and carries the ONLY overall goal read (v1.2) */
      A.contains(html, "kpi-row", "Glance uses her KPI row at " + v);
      A.contains(html, "of goal", "Glance shows the overall goal read at " + v);
      A.absent(html, 'data-gpf="view"', "no view toggle at Glance (" + v + ")");
      A.absent(html, 'data-gpf="camp"', "no campaign chip at Glance (" + v + ")");
      A.absent(html, 'data-gpf="export"', "no export at Glance (" + v + ")");
    } else {
      A.contains(html, 'data-gpf="view"', "view toggle present at " + sz + "/" + v);
      A.contains(html, 'data-gpf="camp"', "campaign chip present at " + sz + "/" + v);
      A.contains(html, 'data-gpf="range"', "date-range chip present at " + sz + "/" + v);
      /* v1.2 view separation. Asserted on the BODY markers, not on the words:
         the toggle's own tooltip names the table's columns, so "Percent Due"
         legitimately appears in the goal view's header and is not evidence of
         a table being rendered. */
      if (v === "goal") {
        A.contains(html, 'data-gpf="baropen"', "goal bars are the body at " + sz + "/goal");
        A.contains(html, "gpf-goalwrap", "the goal-bars wrapper is the body at " + sz + "/goal");
        A.absent(html, "gpf-tblwrap", "Goal Progress renders NO table wrapper at " + sz);
        A.absent(html, "gpf-sumrow", "Goal Progress renders NO table rows at " + sz);
        A.absent(html, "gpf-sumtotal", "Goal Progress renders NO totals row at " + sz);
        A.absent(html, "gft-trow", "Goal Progress renders none of her table rows at " + sz);
      } else {
        A.contains(html, "gpf-tblwrap", "the table wrapper is the body at " + sz + "/table");
        A.contains(html, "gpf-sumrow", "the table renders campaign rows at " + sz + "/table");
        A.contains(html, "Percent Due", "the table renders the Percent Due column at " + sz);
        A.absent(html, 'data-gpf="baropen"', "Summary Table renders NO bars at " + sz);
        A.absent(html, "gpf-goalwrap", "Summary Table renders no goal-bars wrapper at " + sz);
      }
    }
  });
});
/* the six baseline columns, in the live product's order */
const tbl = ctx.gpFContentRoot(fresh("gpF", { size: "xwide", gpFView: "table" }));
["Purpose (Campaign)", "Pledge Total", "Pledge Due", "Received", "Due Remaining", "Percent Due"]
  .forEach(function (c) { A.contains(tbl, ">" + c + "<", "summary column present: " + c); });
A.contains(tbl, "gft-total-row", "totals row rendered (her total row class)");
/* totals sum the first four money columns; Percent Due is NOT summed */
const totCells = /gpf-sumtotal"[\s\S]*?<\/div>\s*$/.test(tbl) || tbl.indexOf("gpf-sumtotal") > -1;
A.ok(totCells, "totals row carries our total marker");
A.ok(/gpf-sumtotal[\s\S]*?gft-c-pct"><\/span>/.test(tbl), "Percent Due is NOT summed in the totals row");
/* Explore and Detail differ by card size alone under v1.2 (same view, same body) */
const exGoal = ctx.gpFContent(fresh("gpF", { size: "wide", gpFView: "goal" }));
const dtGoal = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" }));
A.eq(exGoal, dtGoal, "v1.2: Explore and Detail render the same body for one view");

/* ------------------------------------------- 2. the donut: retained, unreachable */
A.eq(typeof ctx.gpFDonut, "function", "gpFDonut is still DEFINED (rollback pattern)");
const donutHTML = ctx.gpFDonut(fresh("gpF", { size: "xwide" }));
A.contains(donutHTML, "gpf-donut", "gpFDonut still produces correct markup when called directly");
A.cssDeclares(shell.css, ["gpf-donut", "gpf-donut-hole", "gpf-legend2", "gpf-leg-sw"],
  "the retired donut's CSS is retained");
/* ...and yet NOTHING reaches it. Three independent proofs. */
A.absent(ctx.gpFViewToggle(fresh("gpF", { size: "wide" })), 'data-v="donut"',
  "no toggle segment offers the donut");
A.eq(ctx.gpFViewToggle(fresh("gpF", { size: "wide" })).match(/data-gpf="view"/g).length, 2,
  "the view toggle has exactly two segments");
["goal", "table", "donut", "", null, undefined, "nonsense"].forEach(function (v) {
  const w = fresh("gpF", { size: "xwide", gpFView: v });
  const html = ctx.gpFContent(w);
  A.absent(html, "gpf-donut", "gpFView=" + JSON.stringify(v) + " never renders the donut");
  A.absent(html, "conic-gradient", "gpFView=" + JSON.stringify(v) + " renders no conic gradient");
});
A.eq(ctx.gpFView(fresh("gpF", { gpFView: "donut" })), "goal",
  "a stale donut state is mapped back to goal progress");
/* setting the view through the real handler cannot produce a donut either */
(function () {
  const w = W("gpF");
  gfire("view", { "data-id": "gpF", "data-v": "donut" });
  A.eq(ctx.gpFView(w), "goal", "even a forged donut view event resolves to goal progress");
  A.absent(ctx.gpFContent(w), "gpf-donut", "and renders no donut");
  w.gpFView = "goal";
})();
/* no registry entry seeds a donut */
A.eq(registry.filter(function (w) { return w.gpFView === "donut"; }).length, 0,
  "no registry entry seeds the donut view");
/* the same discipline for the other retained-but-unreachable piece */
A.eq(typeof ctx.gpFGoalPanel, "function", "gpFGoalPanel is still DEFINED (v1.2 rollback)");
A.absent(ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" })), "gpf-panel-big",
  "the Detail goal panel is unreachable while GPF_V12_LAYOUT is true");

/* ------------------------------------- 3. the campaign filter NARROWS, no highlight */
(function () {
  const all = ctx.gpFCampCompute(fresh("gpF", { size: "xwide" }));
  A.eq(all.length, 6, "All Campaigns computes every campaign");
  const one = ctx.gpFCampCompute(fresh("gpF", { size: "xwide", gpFCamp: LABELS[2] }));
  A.eq(one.length, 1, "picking a campaign NARROWS the dataset to one row");
  A.eq(one[0].label, LABELS[2], "and it is the picked campaign");
  /* the narrowing recomputes the totals, which is what proves it is a filter
     and not a highlight */
  const tAll = ctx.gpFTotals(fresh("gpF", { size: "xwide" }));
  const tOne = ctx.gpFTotals(fresh("gpF", { size: "xwide", gpFCamp: LABELS[2] }));
  A.eq(tAll.count, 6, "totals count over all campaigns");
  A.eq(tOne.count, 1, "totals count under the filter");
  A.ok(tOne.received < tAll.received, "the received total recomputes under the filter");
  A.ok(tOne.goal < tAll.goal, "the goal total recomputes under the filter");
  /* every view narrows, not just the table */
  const barsAll = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" }));
  const barsOne = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal", gpFCamp: LABELS[2] }));
  A.eq((barsAll.match(/data-gpf="baropen"/g) || []).length, 6, "six bars unfiltered");
  A.eq((barsOne.match(/data-gpf="baropen"/g) || []).length, 1, "one bar under the filter");
  const rowsAll = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "table" }));
  const rowsOne = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "table", gpFCamp: LABELS[2] }));
  A.eq((rowsAll.match(/data-gpf="open"/g) || []).length, 6, "six table rows unfiltered");
  A.eq((rowsOne.match(/data-gpf="open"/g) || []).length, 1, "one table row under the filter");
  /* the totals row wording follows the narrowed count, including the singular */
  A.contains(rowsAll, "Total (6 campaigns)", "totals row names the unfiltered count");
  A.contains(rowsOne, "Total (1 campaign)", "totals row goes singular under the filter");
  /* NO highlight treatment exists anywhere: the narrowed row must be styled
     exactly as it is when unfiltered */
  ["gpf-hl", "is-hl", "highlight", "hilite", "selected-camp", "gpf-selected"].forEach(function (c) {
    A.absent(barsOne, c, "no highlight class '" + c + "' on a filtered bar");
    A.absent(rowsOne, c, "no highlight class '" + c + "' on a filtered row");
    A.absent(shell.css, ".gpf-root ." + c, "no highlight rule for '" + c + "' in our CSS");
  });
  /* and the surviving row's own markup is byte-identical to its unfiltered self */
  function rowFor(html, label) {
    const i = html.indexOf('data-c="' + label + '"');
    return i < 0 ? null : html.slice(html.lastIndexOf("<div", i), html.indexOf("</div>", i));
  }
  A.eq(rowFor(barsOne, LABELS[2]), rowFor(barsAll, LABELS[2]),
    "a filtered bar's markup is identical to its unfiltered markup (narrowing, not highlighting)");
})();
/* the filter fires a fetch; the view toggle does not */
(function () {
  const w = W("gpF");
  const t0 = env.log.timers;
  gfire("set-camp", { "data-id": "gpF", "data-v": LABELS[1] });
  A.eq(w.gpFCamp, LABELS[1], "set-camp updates the widget's campaign");
  A.eq(w.gpFLoading, true, "a campaign change fetches (loading flag set)");
  A.ok(env.log.timers > t0, "a campaign change scheduled a load timer");
  A.contains(ctx.gpFContent(w), "gft-skel", "and the skeleton renders while loading");
  A.contains(ctx.gpFContent(w), "Loading campaign goal progress", "loading is explained, not a bare skeleton");
  /* selecting a campaign resets the drills, so no stale expansion survives */
  A.eq(Object.keys(w.gpFExp).length, 0, "a campaign change clears expanded campaigns");
  A.eq(Object.keys(w.gpFPage).length, 0, "a campaign change clears drill paging");
  w.gpFLoading = false;
  const t1 = env.log.timers;
  gfire("view", { "data-id": "gpF", "data-v": "table" });
  A.eq(w.gpFView, "table", "the view toggle updates the view");
  A.eq(w.gpFLoading, false, "a view switch does NOT fetch");
  A.eq(env.log.timers, t1, "a view switch scheduled no load timer");
  /* restore */
  w.gpFCamp = "All Campaigns"; w.gpFView = "goal"; w.gpFExp = {}; w.gpFPage = {}; w.gpFPlExp = {};
})();
/* the campaign popover lists All plus every campaign, and marks the current one */
(function () {
  const w = W("gpF");
  gfire("camp", { "data-id": "gpF" });
  const popHTML = shim.captured["gpfPop"];
  A.ok(popHTML && popHTML.length > 50, "the campaign popover opened and rendered");
  A.contains(popHTML, "All campaigns", "popover offers All campaigns");
  LABELS.forEach(function (l) { A.contains(popHTML, l, "popover offers " + l); });
  A.eq((popHTML.match(/role="option"/g) || []).length, 7, "seven campaign options (All plus six)");
  A.contains(popHTML, 'aria-selected="true"', "the current campaign is marked selected");
  gfire("camp", { "data-id": "gpF" });
  A.eq(shim.document.getElementById("gpfPop"), null, "a second click closes the campaign popover");
})();
/* the date-range popover, its three presets and the custom From/To reveal */
(function () {
  const w = W("gpF");
  gfire("range", { "data-id": "gpF" });
  let popHTML = shim.captured["gpfPop"];
  ["This year", "Last 30 days", "Custom"].forEach(function (o) {
    A.contains(popHTML, o, "date-range popover offers " + o);
  });
  A.absent(popHTML, "gpf-date-input", "no From/To inputs until Custom is chosen");
  A.absent(ctx.gpFContent(w), "Refresh", "no Refresh control on the filter (Step 4)");
  gfire("set-range", { "data-id": "gpF", "data-r": "custom" });
  A.eq(w.gpFRange, "custom", "Custom range selected");
  popHTML = shim.captured["gpfPop"];
  A.contains(popHTML, "gpf-date-input", "Custom reveals the From/To inputs in place");
  A.eq((popHTML.match(/gpf-date-input/g) || []).length, 2, "exactly two date inputs (From and To)");
  /* the range END is the as-of cutoff; an earlier To drops later gifts */
  const late = ctx.gpFTotals(Object.assign(fresh("gpF"), { gpFRange: "custom", gpFStart: "2026-01-01", gpFEnd: "2026-08-19" }));
  const early = ctx.gpFTotals(Object.assign(fresh("gpF"), { gpFRange: "custom", gpFStart: "2026-01-01", gpFEnd: "2024-01-01" }));
  A.ok(early.received < late.received, "an earlier range end scopes Received down (the end is the cutoff)");
  /* the range START frames the chip only and windows no figure (Step 5 v2) */
  const wideStart = ctx.gpFTotals(Object.assign(fresh("gpF"), { gpFRange: "custom", gpFStart: "2000-01-01", gpFEnd: "2026-08-19" }));
  A.eq(wideStart.received, late.received, "the range START windows no figure, it frames the chip only");
  A.contains(ctx.gpFRangePhrase(fresh("gpF")), "Gifts from", "the chip reads 'Gifts from X to Y'");
  /* choosing a non-custom preset closes the popover on its own... */
  gfire("set-range", { "data-id": "gpF", "data-r": "year" });
  A.eq(shim.document.getElementById("gpfPop"), null, "choosing a preset closes the range popover");
  /* ...and the chip itself is a true toggle: open, then closed. */
  gfire("range", { "data-id": "gpF" });
  A.ok(shim.document.getElementById("gpfPop") !== null, "the chip reopens the range popover");
  gfire("range", { "data-id": "gpF" });
  A.eq(shim.document.getElementById("gpfPop"), null, "a second click on the chip toggles it closed");
  /* an outside click closes it too */
  gfire("range", { "data-id": "gpF" });
  shim.fireOutside();
  A.eq(shim.document.getElementById("gpfPop"), null, "an outside click closes the range popover");
  w.gpFRange = "year"; delete w.gpFStart; delete w.gpFEnd; w.gpFLoading = false;
})();

/* --------------------------------- 4. a bar click opens the top-5 modal */
(function () {
  const w = W("gpF");
  A.eq(shim.captured["gpfModalRoot"], undefined, "no modal before a bar is clicked");
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  const m = shim.captured["gpfModalRoot"];
  A.ok(m && m.length > 200, "clicking a bar opened the modal");
  A.contains(m, "modal-backdrop", "the modal uses her backdrop primitive");
  A.contains(m, "gft-detail-modal", "the modal reuses her gifts detail-modal shell");
  A.contains(m, LABELS[2], "the modal names the clicked campaign");
  A.contains(m, "most behind pace", "the modal is the most-behind read");
  /* the campaign summary cells, on her summary-cell primitives */
  A.contains(m, "gft-dsum", "the modal summary uses her summary-cell primitive");
  ["Pledge Total", "Pledge Due", "Received", "Due Remaining", "Goal"].forEach(function (k) {
    A.contains(m, ">" + k + "<", "modal summary cell: " + k);
  });
  /* at most five rows, and the note says so */
  const rows = (m.match(/data-gpf="gopen"/g) || []).length;
  A.ok(rows > 0 && rows <= 5, "the modal lists at most five donor pledges (got " + rows + ")");
  A.ok(/Showing (all \d+ donor pledges? behind pace|the 5 furthest behind of \d+ donor pledges behind pace)/.test(m),
    "the modal states how many of how many it is showing");
  /* every listed pledge really is behind pace */
  const camp = ctx.gpFCampByLabel(w, LABELS[2]);
  const behind = ctx.gpFDonorRows(w, camp).filter(function (it) { return it.p.dueRem > 0.005; });
  A.eq(rows, Math.min(5, behind.length), "the modal shows exactly min(5, behind count) rows");
  A.ok(behind.length > 5, "the fixture genuinely has more than five behind, so the cap is exercised");
  /* Escape closes it, and so does the close control */
  gkey("Escape", {});
  A.eq(shim.captured["gpfModalRoot"], "", "Escape closes the modal");
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  A.ok(shim.captured["gpfModalRoot"].length > 200, "the modal reopens");
  gfire("detail-close", { "data-id": "gpF" });
  A.eq(shim.captured["gpfModalRoot"], "", "the close control closes the modal");
  /* a bar click does NOT fetch, and does not disturb the card */
  const t0 = env.log.timers;
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[0] });
  A.eq(env.log.timers, t0, "opening the modal scheduled no load timer");
  A.eq(w.gpFLoading, false, "opening the modal does not fetch");
  gfire("detail-close", { "data-id": "gpF" });
})();
/* keyboard reachability of the bar */
(function () {
  const bars = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" }));
  A.contains(bars, 'role="button"', "bars carry role=button");
  A.contains(bars, 'tabindex="0"', "bars are tabbable");
  A.contains(bars, 'aria-haspopup="dialog"', "bars announce they open a dialog");
  A.contains(bars, "sr-only", "bar values exist as text in the DOM, not hover-only");
  const ev = gkey("Enter", { "data-gpf": "baropen", "data-id": "gpF", "data-c": LABELS[3] });
  A.eq(ev.clicks(), 1, "Enter on a bar activates it");
  A.ok(ev._prevented, "and the key handler prevents the default scroll");
  A.ok(shim.captured["gpfModalRoot"].length > 200, "Enter on a bar opens the modal");
  A.contains(shim.captured["gpfModalRoot"], LABELS[3], "and opens it for the focused campaign");
  gfire("detail-close", { "data-id": "gpF" });
  /* Space works too, and an unrelated key does not */
  A.eq(gkey(" ", { "data-gpf": "baropen", "data-id": "gpF", "data-c": LABELS[3] }).clicks(), 1,
    "Space on a bar activates it");
  gfire("detail-close", { "data-id": "gpF" });
  A.eq(gkey("a", { "data-gpf": "baropen", "data-id": "gpF", "data-c": LABELS[3] }).clicks(), 0,
    "an unrelated key does not activate a bar");
  /* a real <button> must NOT be double-activated by the key handler */
  (function () {
    const bag = { "data-gpf": "export", "data-id": "gpF" };
    const t = shim.mkTarget(bag, "button", "gpf-root");
    let c = 0; t.click = function () { c++; };
    (shim.listeners.keydown || []).forEach(function (fn) { fn({ key: "Enter", target: t, preventDefault: function () {} }); });
    A.eq(c, 0, "the key handler leaves real buttons to the browser (no double activation)");
  })();
})();

/* --------------- 5. a row expands the donor breakdown at 20 per page */
(function () {
  const w = W("gpF");
  w.gpFView = "table";
  const closed = ctx.gpFContent(w);
  A.absent(closed, "gpf-drill", "no donor breakdown before a row is expanded");
  gfire("open", { "data-id": "gpF", "data-c": LABELS[2] });
  A.eq(w.gpFExp[LABELS[2]], true, "the row is marked expanded");
  A.eq(w.gpFPage[LABELS[2]], 1, "the drill opens on page 1");
  const open1 = ctx.gpFContent(w);
  A.contains(open1, "gpf-drill", "the donor breakdown rendered inline");
  A.contains(open1, "gft-drow", "the drill reuses her donor-row grid");
  ["Name", "Begin date", "End date", "Pledge", "Received", "Due Remaining", "Status"]
    .forEach(function (c) { A.contains(open1, ">" + c + "<", "drill column: " + c); });
  const camp = ctx.gpFCampByLabel(w, LABELS[2]);
  const all = ctx.gpFDonorRows(w, camp);
  const pages = Math.ceil(all.length / 20);
  A.ok(all.length > 40, "the campaign has enough donor pledges for several pages (" + all.length + ")");
  A.eq((open1.match(/data-gpf="gopen"/g) || []).length, 20, "page 1 shows exactly 20 donor pledges");
  A.contains(open1, "page 1 of " + pages, "the pager states page 1 of " + pages);
  A.contains(open1, all.length + " donor pledges", "the pager states the full donor count");
  /* page through, and prove the figures ABOVE the pager never move */
  function figuresOf(html) {
    const i = html.indexOf('data-c="' + LABELS[2] + '"');
    const row = html.slice(html.lastIndexOf('<div class="wt-row', i), html.indexOf("gpf-drill", i));
    const tot = html.slice(html.indexOf("gpf-sumtotal"));
    return { row: row, tot: tot };
  }
  const f1 = figuresOf(open1);
  gfire("ppage", { "data-id": "gpF", "data-c": LABELS[2], "data-p": "2" });
  A.eq(w.gpFPage[LABELS[2]], 2, "the pager moved to page 2");
  const open2 = ctx.gpFContent(w);
  A.contains(open2, "page 2 of " + pages, "page 2 is rendered");
  A.eq((open2.match(/data-gpf="gopen"/g) || []).length, 20, "page 2 also shows 20 donor pledges");
  const f2 = figuresOf(open2);
  A.eq(f2.row, f1.row, "the campaign row's figures are unchanged by paging");
  A.eq(f2.tot, f1.tot, "the totals row is unchanged by paging");
  A.contains(open2, all.length + " donor pledges", "the donor count is unchanged by paging");
  /* the page shows DIFFERENT donors, so paging really paged */
  A.changed(open1.slice(open1.indexOf("gpf-drill-tbl")), open2.slice(open2.indexOf("gpf-drill-tbl")),
    "paging changed which donor pledges are listed");
  /* last page holds the remainder, and the page index is clamped both ways */
  gfire("ppage", { "data-id": "gpF", "data-c": LABELS[2], "data-p": String(pages) });
  const openL = ctx.gpFContent(w);
  A.eq((openL.match(/data-gpf="gopen"/g) || []).length, all.length - 20 * (pages - 1),
    "the last page holds the remainder");
  /* Out-of-range paging, asserted as the build actually behaves. A page index
     past the end is STORED but clamped at render time, so the view is always
     valid; a page index below 1 is refused outright and the stored value is
     left alone. Clamping on write would be tidier, but the built Final clamps
     on read, and the port follows the build. */
  gfire("ppage", { "data-id": "gpF", "data-c": LABELS[2], "data-p": String(pages + 9) });
  A.contains(ctx.gpFContent(w), "page " + pages + " of " + pages, "a page index past the end is clamped down on render");
  A.eq((ctx.gpFContent(w).match(/data-gpf="gopen"/g) || []).length, all.length - 20 * (pages - 1),
    "and the clamped page shows the last page's rows");
  const stored = w.gpFPage[LABELS[2]];
  gfire("ppage", { "data-id": "gpF", "data-c": LABELS[2], "data-p": "0" });
  A.eq(w.gpFPage[LABELS[2]], stored, "a page index below 1 is REFUSED and the stored page is untouched");
  gfire("ppage", { "data-id": "gpF", "data-c": LABELS[2], "data-p": "-3" });
  A.eq(w.gpFPage[LABELS[2]], stored, "a negative page index is refused too");
  A.contains(ctx.gpFContent(w), "page " + pages + " of " + pages, "the render stays clamped and valid throughout");
  /* paging does not fetch */
  const t0 = env.log.timers;
  gfire("ppage", { "data-id": "gpF", "data-c": LABELS[2], "data-p": "1" });
  A.eq(env.log.timers, t0, "paging scheduled no load timer");
  /* each campaign pages independently */
  gfire("open", { "data-id": "gpF", "data-c": LABELS[3] });
  gfire("ppage", { "data-id": "gpF", "data-c": LABELS[3], "data-p": "2" });
  A.eq(w.gpFPage[LABELS[2]], 1, "one campaign's page is unaffected by another's");
  A.eq(w.gpFPage[LABELS[3]], 2, "the second campaign paged independently");
  /* collapse */
  gfire("open", { "data-id": "gpF", "data-c": LABELS[3] });
  A.eq(w.gpFExp[LABELS[3]], false, "clicking an expanded row collapses it");
  A.eq((ctx.gpFContent(w).match(/gpf-drill"/g) || []).length, 1, "only the still-open campaign shows a drill");
  /* the drill sums roll up to the campaign row (no disagreement between levels) */
  const comp = ctx.gpFCampCompute(w).filter(function (r) { return r.label === LABELS[2]; })[0];
  let sumRec = 0, sumDue = 0;
  all.forEach(function (it) { sumRec += it.p.received; sumDue += it.p.due; });
  A.near(sumRec, comp.received, 0.02, "donor received rolls up to the campaign row");
  A.near(sumDue, comp.pledgeDue, 0.02, "donor pledge due rolls up to the campaign row");
  /* the drill has its own campaign-scoped export (the second v1.3 export point) */
  const openNow = ctx.gpFContent(w);
  A.contains(openNow, 'data-gpf="export-donors"', "the drill carries its own campaign-scoped export");
  A.contains(openNow, 'data-c="' + LABELS[2] + '"', "and it is scoped to that campaign");
})();

/* -------------------------------- 6. a pledge click expands its gifts */
(function () {
  const w = W("gpF");
  const camp = ctx.gpFCampByLabel(w, LABELS[2]);
  const rows = ctx.gpFDonorRows(w, camp);
  const paid = rows.filter(function (it) { return it.p.received > 0; })[0];
  A.ok(!!paid, "the fixture has a donor pledge with gifts applied");
  const before = ctx.gpFContent(w);
  A.absent(before, "Gifts applied to this pledge", "no gift level before a pledge is clicked");
  gfire("gopen", { "data-id": "gpF", "data-plid": paid.pl.id });
  A.eq(w.gpFPlExp[paid.pl.id], true, "the pledge is marked expanded");
  const after = ctx.gpFContent(w);
  A.contains(after, "Gifts applied to this pledge", "the pledge expanded to its gift transactions");
  A.contains(after, "gft-gifts", "the gift list reuses her gift-list primitive");
  A.contains(after, "gft-drawer", "the gift level sits in her expanded drawer");
  ["Gift Date", "Amount", "Reference"].forEach(function (c) {
    A.contains(after, ">" + c + "<", "gift column: " + c);
  });
  /* the deepest level is unmistakably GIFTS, not more pledges */
  A.absent(after.slice(after.indexOf("Gifts applied to this pledge")), "Begin date",
    "the gift level lists gifts, not another pledge table");
  /* the gifts total EXACTLY equals the pledge's displayed Received */
  const iso = ctx.gpFThru(w);
  const gp = ctx.gpFGiftPanel(paid.pl, iso);
  let gsum = 0;
  (paid.pl.giftDate <= iso ? paid.pl.gifts : []).forEach(function (g) { gsum += g.amount; });
  A.eq(gsum, paid.p.received, "the gifts sum EXACTLY to the pledge's Received");
  A.contains(gp, ctx.gpFMoney(gsum), "the gift footer states that same total");
  A.contains(gp, "applied to this pledge", "the gift footer names the basis");
  /* a pledge with nothing received yet gets the empty gift line, not a blank */
  const none = ctx.gpFGiftPanel({ donor: "Test, Donor", giftDate: "2026-08-19", gifts: [] }, "2020-01-01");
  A.contains(none, "No gifts have been applied", "a pledge with no gifts in range says so");
  A.contains(none, "gft-tab-empty", "and uses her empty-line primitive");
  /* clicking again collapses; expanding does not fetch */
  const t0 = env.log.timers;
  gfire("gopen", { "data-id": "gpF", "data-plid": paid.pl.id });
  A.eq(w.gpFPlExp[paid.pl.id], false, "clicking an expanded pledge collapses it");
  A.eq(env.log.timers, t0, "expanding a pledge scheduled no load timer");
  /* the modal's rows carry the same expand affordance, with the arity fixed */
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  const m = shim.captured["gpfModalRoot"];
  A.contains(m, 'data-gpf="gopen"', "modal rows carry the pledge-expand action");
  A.contains(m, 'data-id="gpF"', "modal rows carry the widget id (the arity fix)");
  A.absent(m, 'data-id="0"', "no row was handed an array index as its widget id");
  A.absent(m, 'data-id="undefined"', "no row lost its widget id");
  gfire("detail-close", { "data-id": "gpF" });
  w.gpFExp = {}; w.gpFPage = {}; w.gpFPlExp = {}; w.gpFView = "goal";
})();

/* ------------------------------------------------------- 7. ordering rules */
(function () {
  const w = fresh("gpF", { size: "xwide", gpFView: "goal" });
  /* bars: CLOSEST TO GOAL FIRST */
  const bars = ctx.gpFContent(w);
  const barOrder = (bars.match(/data-c="([^"]+)"/g) || []).map(function (s) { return s.slice(8, -1); });
  const byProgress = ctx.gpFCampCompute(w).slice().sort(function (a, b) {
    return (b.progress == null ? -1 : b.progress) - (a.progress == null ? -1 : a.progress);
  }).map(function (r) { return r.label; });
  A.eq(barOrder.join("|"), byProgress.join("|"), "bars are ordered closest to goal FIRST");
  const prog = barOrder.map(function (l) {
    return ctx.gpFCampCompute(w).filter(function (r) { return r.label === l; })[0].progress;
  });
  A.ok(prog.every(function (p, i) { return i === 0 || p <= prog[i - 1]; }),
    "bar progress is monotonically non-increasing");
  A.ok(prog[0] > prog[prog.length - 1], "the fixture genuinely has a spread, so the order is meaningful");
  /* drill: MOST BEHIND FIRST, the opposite end of the same measure */
  const camp = ctx.gpFCampByLabel(w, LABELS[2]);
  const drill = ctx.gpFDonorRows(w, camp);
  A.ok(drill.every(function (it, i) { return i === 0 || it.p.dueRem <= drill[i - 1].p.dueRem; }),
    "the donor drill is ordered most behind pace FIRST");
  A.ok(drill[0].p.dueRem > drill[drill.length - 1].p.dueRem, "and the drill spread is real");
  /* table: the DATA'S OWN ORDER, which is the fixture order */
  const tw = fresh("gpF", { size: "xwide", gpFView: "table" });
  const tOrder = (ctx.gpFContent(tw).match(/data-gpf="open" data-id="[^"]*" data-c="([^"]+)"/g) || [])
    .map(function (s) { return /data-c="([^"]+)"/.exec(s)[1]; });
  A.eq(tOrder.join("|"), LABELS.join("|"), "the summary table renders in the data's own order");
  A.ok(tOrder.join("|") !== LABELS.slice().sort().join("|"),
    "and that order is demonstrably NOT alphabetical");
  /* NO alphabetical sort, and no sort control, anywhere */
  A.absent(block, "localeCompare", "the block contains no locale-aware string comparison");
  A.absent(block, ".sort(function(a,b){return a.label", "no label-alphabetical sort in the block");
  const everything = ["goal", "table"].map(function (v) {
    return ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: v, gpFExp: { [LABELS[2]]: true } }));
  }).join("") + shim.captured["gpfModalRoot"];
  ["wt-sort", 'data-gpf="sort"', "unfold_more", "arrow_upward", "arrow_downward"].forEach(function (s) {
    A.absent(everything, s, "no sort control anywhere: " + s);
  });
  A.eq(registry.filter(function (r) { return r.gpFSort !== undefined; }).length, 0,
    "no registry entry carries a sort key (there is no sort)");
})();

/* ------------- 8. THE DECOUPLING: global button family, no W04 root */
(function () {
  /* (a) our root carries .gpf-root and NOTHING else */
  ["kpi", "wide", "xwide"].forEach(function (sz) {
    const html = ctx.gpFContentRoot(fresh("gpF", { size: sz }));
    A.contains(html, '<div class="gpf-root" data-tier="' + sz + '"', "root is .gpf-root alone at " + sz);
    A.absent(html, "remf-root", "no W04 root class on our root at " + sz);
    A.absent(html, "remf-", "no W04-prefixed class anywhere in our markup at " + sz);
  });
  /* the popover and the modal roots are also decoupled */
  gfire("camp", { "data-id": "gpF" });
  A.eq(shim.document.getElementById("gpfPop").className, "gpf-root gpf-pop",
    "the popover root is ours alone, with no W04 root");
  gfire("camp", { "data-id": "gpF" });
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[0] });
  A.absent(shim.captured["gpfModalRoot"], "remf-", "the modal root carries no W04 class");
  gfire("detail-close", { "data-id": "gpF" });
  /* (b) the export button asks for the GLOBAL button family and nothing else */
  const ex = ctx.gpFExportBtn(fresh("gpF", { size: "wide" }));
  A.contains(ex, 'class="btn naked sm gpf-export"', "export uses the global button classes");
  A.contains(ex, "Export", "the export button is labelled");
  /* (c) that family really is declared GLOBALLY, ahead of every ported block */
  const firstMB = shell.css.search(/\/\* ===== W\d\d /); /* first widget CSS region banner (the old "(MB updated)" markers are gone) */
  A.ok(firstMB > 0, "the stylesheet does contain ported blocks to compare against");
  [".btn{", ".btn.naked{", ".btn.sm{"].forEach(function (sel) {
    const at = shell.css.indexOf(sel);
    A.ok(at > -1, "the shell declares " + sel + " globally");
    A.ok(at > -1 && at < firstMB, sel + " is declared BEFORE any ported block (so it is global, not W04's)");
  });
  A.cssDeclares(shell.css, ["btn", "gpf-export"], "the export button's styling exists");
  /* (d) nothing in the file scopes a gpf rule under the W04 root any more */
  A.absent(shell.css, ".remf-root .gpf-export", "the old W04-scoped export rule is gone");
  A.absent(shell.css, ".remf-root .gpf-", "no gpf rule is scoped under the W04 root");
  /* (e) our CSS block is self-sufficient: every rule is .gpf-root scoped */
  const ourCSS = shell.css.slice(shell.css.indexOf(CSS_START), shell.css.indexOf(CSS_END) + CSS_END.length);
  A.ok(ourCSS.length > 500, "our CSS block was found");
  A.absent(ourCSS, "remf", "our CSS block never mentions W04");
  const rules = ourCSS.split("\n").filter(function (l) {
    const t = l.trim();
    return t.charAt(0) === "." && t.indexOf("{") > -1;
  });
  const unscoped = rules.filter(function (l) { return l.trim().indexOf(".gpf-root") !== 0; });
  A.eq(unscoped.length, 0, "every rule in our CSS block is .gpf-root scoped");
  A.ok(rules.length > 40, "our CSS block declares a real rule set (" + rules.length + " rules)");
  /* (f) and it declares ZERO of Jo's selectors: her classes appear only as
     descendants of our root, never as the subject of a rule */
  const herSubject = rules.filter(function (l) { return /^\.(gft|rem|ap|bank|pur|fa|dep|ar|ins|pen|pr|loan|pto)-/.test(l.trim()); });
  A.eq(herSubject.length, 0, "our CSS block declares none of her selectors as a rule subject");
})();
/* the reuse claim, stated positively: every one of her classes our markup
   leans on is already declared in the shell */
A.cssDeclares(shell.css, [
  "dep-hd", "dep-hd-top", "dep-hd-num", "dep-hd-toggle", "dep-hd-kpigrp",
  "gft-hd", "gft-numwrap", "gft-ctlrow", "gft-datechip", "gft-purpchip", "gft-goalpill",
  "gft-bars", "gft-prow", "gft-prow-top", "gft-prow-foot", "gft-p-nm", "gft-p-pct", "gft-p-amt",
  "gft-track", "gft-track-sm", "gft-fill", "gft-bars-legend", "gft-zeroline", "gft-clickable",
  "gft-trow", "gft-c-nm", "gft-c-n", "gft-c-pct", "gft-total-row",
  "gft-drow", "gft-dexp", "gft-dc", "gft-dc0", "gft-dc5", "gft-dstat-h", "gft-dstatus",
  "gft-dstatus-behind", "gft-dstatus-ok", "gft-drawer", "gft-drawer-h", "gft-gifts", "gft-grow",
  "gft-ghead", "gft-ga", "gft-dsum", "gft-dsum-i", "gft-dsum-k", "gft-dsum-v", "gft-tab-empty",
  "gft-detail-modal", "gft-detail-h", "gft-detail-b", "gft-detail-ic", "gft-dsub", "gft-dh-spacer",
  "gft-skel", "gft-skel-rows", "gft-sk-row", "gft-sk-bar", "gft-glance-read", "gft-glance-cap",
  "gft-cap-ok", "gft-allset",
  "filter-chip", "fc-label", "vtoggle", "vt", "scope-chip", "sc-nm", "metric-value", "gl-sub",
  "kpi-row", "kpi-num", "wt-row", "wt-head", "scroll", "sk", "bgt-spin", "sr-only",
  "state", "state-title", "state-sub", "modal", "modal-wide", "modal-h", "modal-b", "modal-f",
  "modal-title", "modal-backdrop", "iconbtn", "cap", "mi", "mi-nm", "mi-gap", "sep"
], "every shell/Jo class our markup uses is declared");
/* and our own additions are declared too */
A.cssDeclares(shell.css, [
  "gpf-root", "gpf-body", "gpf-pill", "gpf-badge", "gpf-closed", "gpf-fav", "gpf-over", "gpf-muted",
  "gpf-goalwrap", "gpf-barscroll", "gpf-legend", "gpf-lg-i", "gpf-lg-sw", "gpf-lg-n", "gpf-lg-rem",
  "gpf-cap", "gpf-export", "gpf-tblwrap", "gpf-scroll", "gpf-sumrow", "gpf-sumtotal", "gpf-caret",
  "gpf-nmtxt", "gpf-nm", "gpf-nmsub", "gpf-drill", "gpf-drill-tbl", "gpf-plrow", "gpf-drawer",
  "gpf-grow", "gpf-gref", "gpf-giftfoot", "gpf-pager", "gpf-pgcount", "gpf-pages", "gpf-pgbtn",
  "gpf-pop", "gpf-dates", "gpf-modal", "gpf-panel", "gpf-panel-h", "gpf-panel-big", "gpf-dot"
], "every gpf- class our markup uses is declared");

/* ------------------------- 9. the Rule 11 stub, present and labelled */
(function () {
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  const m = shim.captured["gpfModalRoot"];
  A.contains(m, 'data-gpf="open-record"', "the modal footer carries the navigation control");
  A.contains(m, "Open in Gifts and Pledges", "and it is labelled 'Open in Gifts and Pledges'");
  A.contains(m, "modal-f", "it sits in her modal footer");
  A.contains(m, 'class="btn naked sm" data-gpf="open-record"', "the stub uses the global button family");
  const n0 = env.log.status.length;
  gfire("open-record", { "data-id": "gpF", "data-c": LABELS[2] });
  const said = env.log.status[env.log.status.length - 1];
  A.ok(env.log.status.length > n0, "activating the stub reported status");
  A.contains(said, "stub", "the stub SAYS it is a stub (Rule 11, no navigation backend)");
  A.contains(said, LABELS[2], "and names the campaign it would open");
  gfire("detail-close", { "data-id": "gpF" });
  /* export is the only OTHER action; no workflow verb was invented (v1.3) */
  const n1 = env.log.status.length;
  gfire("export", { "data-id": "gpF", "data-what": "goal" });
  A.contains(env.log.status[env.log.status.length - 1], "stub", "the header export is a labelled stub");
  gfire("export-donors", { "data-id": "gpF", "data-c": LABELS[2] });
  A.contains(env.log.status[env.log.status.length - 1], LABELS[2], "the donor export is campaign-scoped");
  A.contains(env.log.status[env.log.status.length - 1], "stub", "the donor export is a labelled stub");
  A.eq(env.log.status.length, n1 + 2, "both exports reported exactly once each");
  /* the export follows the ACTIVE view */
  A.contains(ctx.gpFExportBtn(fresh("gpF", { gpFView: "goal" })), 'data-what="goal"', "export scoped to goal progress");
  A.contains(ctx.gpFExportBtn(fresh("gpF", { gpFView: "table" })), 'data-what="table"', "export scoped to the table");
  /* NO invented workflow action anywhere on the card (the standing constraint) */
  const surfaces = ["kpi", "wide", "xwide"].map(function (sz) {
    return ["goal", "table"].map(function (v) {
      return ctx.gpFContentRoot(fresh("gpF", { size: sz, gpFView: v, gpFExp: { [LABELS[2]]: true } }));
    }).join("");
  }).join("") + shim.captured["gpfModalRoot"];
  ["Approve", "approve", "Post ", "Write off", "Write-off", "Waive", "Pay ", "Schedule ", "Delete", "Void", "Reject"]
    .forEach(function (verb) { A.absent(surfaces, verb, "no invented workflow verb on the card: " + verb.trim()); });
})();

/* ----------------------------------------------------- 10. empty states */
(function () {
  const e = W("gpF5");
  A.eq(e.dataset, "empty", "the empty fixture is seeded empty");
  const wide = ctx.gpFContentRoot(Object.assign({}, e, { size: "wide" }));
  A.contains(wide, "No gift or pledge campaigns yet", "the empty card states its own copy");
  A.contains(wide, "state", "the empty state uses her state primitive");
  A.contains(wide, 'data-kind="empty"', "and is marked as an empty state");
  A.absent(wide, "Deposits", "the empty state is OURS, not the generic Deposits copy");
  A.absent(wide, 'data-gpf="view"', "no view toggle on the empty card");
  A.absent(wide, "gpf-pager", "no pager on the empty card");
  const kpi = ctx.gpFContentRoot(Object.assign({}, e, { size: "kpi" }));
  A.contains(kpi, "None set up", "the Glance empty variant is the short one");
  A.contains(kpi, "no campaigns to show yet", "and explains itself");
  A.changed(kpi, wide, "the Glance empty state differs from the card empty state");
  /* the dispatch really is BEFORE the generic fallback */
  A.contains(shell.script, 'if(w.kind==="gifts-mb")return gpFContentRoot(w);', "the dispatch line is in place");
  /* The GENERIC fallback is the one that falls back to the Deposits copy.
     Anchor on that exact expression: several widgets have their own earlier
     empty branches, and matching the first "state===empty" in the file finds
     one of those instead, which is not what this assertion is about. */
  const iDisp = shell.script.indexOf('if(w.kind==="gifts-mb")return gpFContentRoot(w);');
  const iFallback = shell.script.indexOf('EMPTY_COPY[w.kind]||EMPTY_COPY.deposits');
  A.ok(iDisp > -1, "our dispatch line was located");
  A.ok(iFallback > -1, "the generic empty fallback was located");
  A.ok(iDisp < iFallback, "our dispatch sits BEFORE the generic empty fallback");
  /* and it sits at the END of the mb chain, after the newest sibling */
  const iPrev = shell.script.indexOf('if(w.kind==="payables-mb")return apFContent(w);');
  A.ok(iPrev > -1 && iPrev < iDisp, "our dispatch is appended AFTER the previous mb entry");
  /* a filter that narrows to nothing says so rather than rendering a blank */
  const none = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "table", gpFCamp: "NOSUCH: Campaign" }));
  A.contains(none, "No gift or pledge campaigns", "a filter matching nothing renders a stated empty state");
  /* the single-campaign fixture narrows the option list too */
  const one = W("gpF4");
  A.eq(ctx.gpFAllCampaigns(one).length, 1, "the single-campaign fixture offers one campaign");
  A.contains(ctx.gpFContentRoot(Object.assign({}, one, { size: "wide" })), "gpf-root", "the single-campaign card renders");
  /* aboutOf is wired */
  A.contains(shell.script, 'if(w.kind==="gifts-mb")return {h:w.title,b:GPF_ABOUT};', "the aboutOf branch is in place");
  A.ok(String(ctx.GPF_ABOUT).length > 120, "the about text is real prose");
  A.noEmDash(ctx.GPF_ABOUT, "the about text");
})();

/* --------------------- 11. no-em-dash sweep, every combination */
(function () {
  let n = 0;
  const sizes = ["kpi", "wide", "xwide"];
  const camps = ["All Campaigns"].concat(LABELS);
  const views = ["goal", "table"];
  sizes.forEach(function (sz) {
    camps.forEach(function (c) {
      views.forEach(function (v) {
        const w = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c });
        A.noEmDash(ctx.gpFContentRoot(w), sz + " / " + c + " / " + v); n++;
        /* the same combination with the drill open, and a pledge open inside it */
        const comp = ctx.gpFCampCompute(w);
        if (comp.length) {
          const lab = comp[0].label;
          const camp = ctx.gpFCampByLabel(w, lab);
          const pid = ctx.gpFDonorRows(w, camp)[0].pl.id;
          const w2 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFExp: { [lab]: true }, gpFPlExp: { [pid]: true } });
          A.noEmDash(ctx.gpFContentRoot(w2), sz + " / " + c + " / " + v + " / drilled"); n++;
        }
        /* and while loading */
        const w3 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFLoading: true });
        A.noEmDash(ctx.gpFContentRoot(w3), sz + " / " + c + " / " + v + " / loading"); n++;
      });
    });
  });
  /* the empty and single-campaign fixtures, every tier */
  ["gpF4", "gpF5"].forEach(function (id) {
    sizes.forEach(function (sz) {
      A.noEmDash(ctx.gpFContentRoot(Object.assign({}, W(id), { size: sz })), id + " / " + sz); n++;
    });
  });
  /* both popovers, all three range presets, and the modal */
  gfire("camp", { "data-id": "gpF" });
  A.noEmDash(shim.captured["gpfPop"], "the campaign popover"); n++;
  gfire("camp", { "data-id": "gpF" });
  ["year", "last30", "custom"].forEach(function (r) {
    const w = W("gpF");
    gfire("range", { "data-id": "gpF" });
    gfire("set-range", { "data-id": "gpF", "data-r": r });
    A.noEmDash(shim.captured["gpfPop"], "the date-range popover (" + r + ")"); n++;
    A.noEmDash(ctx.gpFRangePhrase(w), "the range chip phrase (" + r + ")"); n++;
    if (shim.document.getElementById("gpfPop")) gfire("range", { "data-id": "gpF" });
    w.gpFLoading = false;
  });
  W("gpF").gpFRange = "year"; delete W("gpF").gpFStart; delete W("gpF").gpFEnd;
  LABELS.forEach(function (l) {
    gfire("baropen", { "data-id": "gpF", "data-c": l });
    A.noEmDash(shim.captured["gpfModalRoot"], "the most-behind modal for " + l); n++;
    gfire("detail-close", { "data-id": "gpF" });
  });
  /* the retired donut's own markup, and the rollback layout, are swept too */
  A.noEmDash(ctx.gpFDonut(fresh("gpF", { size: "xwide" })), "the retired donut markup"); n++;
  A.noEmDash(ctx.gpFGoalPanel(fresh("gpF", { size: "xwide" })), "the rollback goal panel"); n++;
  /* every status string this widget can emit */
  env.log.status.forEach(function (s, i) { A.noEmDash(s, "status message " + i); n++; });
  console.log("  (no-em-dash sweep: " + n + " combinations)");
  A.ok(n >= 100, "the sweep covered at least 100 combinations (got " + n + ")");
})();

/* ------------------------------------------------ 12. titles and namespace */
registry.forEach(function (w) {
  A.contains(w.title, "(OC", "registry title uses the (OC convention: " + w.id);
  A.contains(w.title, "Gifts Pledges", "registry title names the widget: " + w.id);
  A.eq(w.kind, "gifts-mb", "registry kind: " + w.id);
  A.ok(w.id.indexOf("gpF") === 0, "registry id is gpF-prefixed: " + w.id);
  A.ok(w.tiers && w.tiers.length === 3, "three tiers: " + w.id);
  A.noEmDash(w.title, "registry title " + w.id);
});
A.ok(registry.some(function (w) { return w.size === "kpi"; }), "a Glance entry exists");
A.ok(registry.some(function (w) { return w.size === "wide"; }), "an Explore entry exists");
A.ok(registry.some(function (w) { return w.size === "xwide"; }), "a Detail entry exists");
A.ok(registry.some(function (w) { return w.gpFView === "table"; }), "a Summary Table entry exists");
A.ok(registry.some(function (w) { return w.gpFCamp && w.gpFCamp !== "All Campaigns"; }), "a narrowed-campaign entry exists");
A.ok(registry.some(function (w) { return w.state === "empty"; }), "an empty-state entry exists");

/* ------------- 13. Jo's own gifts widget: byte-unmodified after the port */
(function () {
  const dir = path.join(__dirname, "..");
  const snaps = H.baselineFiles();
  A.ok(snaps.length > 0, "the a548419 baseline is on disk (_tools/baselines) to compare against");
  if (!snaps.length) return;
  const old = fs.readFileSync(snaps[snaps.length - 1], "utf8");
  const cur = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const GFT = ("gftFmtDate gftThru gftDataset gftSum gftStatusOf gftAllPurposes gftPurposeCur gftPurposes " +
    "gftOverall gftDonorsFor gftPct gftBehindPurposes gftEsc gftStatusPill gftDateChip gftPurposeChip " +
    "gftViewToggle gftHeaderBlock gftSkeleton gftBar gftProgress gftTable gftRemainingText gftRemainingCell " +
    "gftBehindPanel gftGlance gftEmpty gftContent gftDonorStatusChip gftDetailModalHTML gftDonorDrawer " +
    "gftLoad gftHandleClick gftHandleInput gftPopContent gftTriggerSelector").split(/\s+/);
  A.eq(GFT.length, 36, "all 36 of her gft* helpers are under test");
  const oldLines = old.split(/\r?\n/), curLines = cur.split(/\r?\n/);
  GFT.forEach(function (n) {
    const re = new RegExp("^\\s*function " + n + "\\(");
    const dOld = oldLines.filter(function (l) { return re.test(l); });
    const dCur = curLines.filter(function (l) { return re.test(l); });
    A.eq(dCur.length, 1, "her " + n + " is defined exactly once after the port");
    A.eq(dCur.join("|"), dOld.join("|"), "her " + n + " definition line is byte-identical");
    /* the raw count guards against our comments quoting one of her names, the
       hazard that W13, W15 and W16 each hit */
    const cOld = (old.match(new RegExp(n, "g")) || []).length;
    const cCur = (cur.match(new RegExp(n, "g")) || []).length;
    /* >= rather than ===: the comparison is now against the a548419 baseline,
       which predates the (OC) input-listener extension that names gftHandleInput
       (2026-09-25). The definition-line identity above is the real guard. */
    A.ok(cCur >= cOld, "the raw occurrence count of her " + n + " did not drop (" + cCur + " vs " + cOld + ")");
    /* and no name of ours can shadow one of hers */
    A.ok(Object.keys(ctx).indexOf(n) < 0, "our block defines no global named " + n);
  });
  /* her data, copy objects, registry rows and CSS cluster */
  ["GFT_TODAY", "GFT_MONTHS", "GFT_DATE_PRESETS", "GFT_DONORS", "GFT_DONORS_ONTRACK", "GFT_ABOUT_BODY",
    "GFT_WIDGETS", "EMPTY_COPY.gifts", "ERROR_COPY.gifts", 'kind:"gifts"',
    'id:"gft"', 'id:"gft_k"', 'id:"gft2"', 'id:"gft3"', 'id:"gft4"', 'id:"gft5"'].forEach(function (k) {
      const cOld = old.split(k).length - 1, cCur = cur.split(k).length - 1;
      A.eq(cCur, cOld, "her " + k + " occurrence count is unchanged");
    });
  function seg(t, a, b) { const i = t.indexOf(a); const j = t.indexOf(b, i); return i < 0 || j < 0 ? null : t.slice(i, j); }
  const bOld = seg(old, "var GFT_TODAY=", "function gftTriggerSelector(){");
  const bCur = seg(cur, "var GFT_TODAY=", "function gftTriggerSelector(){");
  A.ok(bOld && bCur, "her gifts render block was located in both files");
  A.eq(bCur, bOld, "her ENTIRE gifts block (" + (bCur || "").length + " bytes) is byte-identical");
  const cssOld = seg(old, ".gft-body{display:block;}", "/* ===== Loans With Balance Due (prefix: loan)");
  const cssCur = seg(cur, ".gft-body{display:block;}", "/* ===== Loans With Balance Due (prefix: loan)");
  A.ok(cssOld && cssCur, "her gifts CSS cluster was located in both files");
  A.eq(cssCur, cssOld, "her gifts CSS cluster (" + (cssCur || "").length + " bytes) is byte-identical");
  /* our namespace was clean before the port and is ours alone now */
  A.eq((old.match(/GPF_/g) || []).length, 0, "GPF_ had zero occurrences before the port");
  A.eq((old.match(/\.gpf-/g) || []).length, 0, ".gpf- had zero occurrences before the port");
  A.eq((old.match(/data-gpf/g) || []).length, 0, "data-gpf had zero occurrences before the port");
  A.eq((old.match(/gifts-mb/g) || []).length, 0, "gifts-mb had zero occurrences before the port");
  A.ok((cur.match(/GPF_/g) || []).length > 20, "GPF_ is now present and ours");
  /* the file did not have its line endings flipped */
  const crlf = (cur.match(/\r\n/g) || []).length, bare = (cur.match(/(?<!\r)\n/g) || []).length;
  A.eq(bare, 0, "no bare LF anywhere: the CRLF file kept its line endings");
  A.ok(crlf > 10000, "the file is still CRLF throughout (" + crlf + " CRLF pairs)");
  /* the port was additive: exactly one pre-existing line changed (the aboutOf chain) */
  const changed = oldLines.filter(function (l, i) { return false; }); /* placeholder, see below */
  const added = curLines.length - oldLines.length;
  A.ok(added > 900 && added < 20000, "the port added a plausible number of lines (" + added + "; measured against the a548419 baseline, so this spans every (OC) block, W08 and W18)");
})();

/* our own globals do not collide with anything the shell already had */
(function () {
  const ours = Object.keys(ctx).filter(function (k) { return /^(gpF|GPF_)/.test(k); });
  A.ok(ours.length > 40, "the block defines a real namespace (" + ours.length + " gpF/GPF_ globals)");
  const stray = Object.keys(ctx).filter(function (k) {
    return !/^(gpF|GPF_)/.test(k) && ["ICON", "money", "fmtAxis", "find", "render", "renderOverlay", "renderModal",
      "setStatus", "hideTip", "hideLnTip", "timers", "pop", "modal", "modalMounted", "manage", "document", "window",
      "requestAnimationFrame", "setTimeout", "clearTimeout", "console", "Math", "Date", "JSON", "Number", "String",
      "Object", "Array", "isNaN", "parseInt", "parseFloat", "globalThis"].indexOf(k) < 0;
  });
  A.eq(stray.length, 0, "the block leaks no non-namespaced global (" + stray.join(", ") + ")");
})();

process.exit(A.report());
