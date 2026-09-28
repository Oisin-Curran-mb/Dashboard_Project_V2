/* =====================================================================
   w17-gifts.driver.js , verification driver for W17 Gifts Pledges.

   Rebuilt 2026-09-28 on the owner's three rulings: the row unit is the
   PURPOSE, Received carries both pledge payments and other gifts, and
   every money figure obeys the date window. The invented per-row goal,
   its bands and the top-5 most-behind modal are gone.

   Widget: Gifts Pledges, kind "gifts", prefix gpF / GPF_,
   root class .gpf-root, action attribute data-gpf.
   FIRST-EVER port, 2026-09-08, built against Jo's phase-2 @ 71ca056, and
   the FOURTEENTH and last driver of the run.

   Runs the real ported block out of the real index.html in the shared
   harness and drives its own delegated listeners. Asserts, in order:
     1  render at every tier, both views
     2  the retired donut: code present, genuinely unreachable
     3  the purpose filter NARROWS and does not highlight
     4  a bar click opens the giving ledger, uncapped, filtered and
        searchable, and the type filter PARTITIONS the whole list
     5  a row expands the donor breakdown at 20 per page, totals invariant
     6  a pledge click expands its gifts, with media and motivation
     7  ordering: bars most-received-first, ledger largest-first, drill
        most-behind-first, table in data order, no alphabetical sort
     8  the export button styles from the GLOBAL button family, and our
        root carries no W04 root class (the deliberate decoupling)
     9  the Rule 11 navigation stub is present and labelled as a stub
    10  the empty states
    11  a no-em-dash sweep over every size x campaign x view combination
    12  registry titles in the (OC form
    13  (retired 28 Sep 2026: this section proved Jo's gifts block was
        byte-unmodified, and that block was deleted when W17 was finalised
        on this version)

   Run from this folder:  node w17-gifts.driver.js
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const END = "/* ===== end W17 Gifts Pledges V2 ===== */";
const CSS_START = "/* ===== W17 Gifts Pledges V2 CSS";
const CSS_END = "/* ===== end W17 Gifts Pledges V2 CSS ===== */";

const shell = H.loadShell();
/* finished widgets register themselves; the shim has no WIDGETS, so the register
   line is checked here and stripped before the block runs (same as W13) */
const blockRaw = H.extractRegion(shell.script, "var GPF_TODAY=", END);
if (blockRaw.indexOf('WIDGETS.register("gifts",{content:gpFContentRoot,about:') < 0) throw new Error("the W17 block does not register kind gifts");
const block = blockRaw.split(/\r?\n/).filter(function (l) { return l.indexOf('WIDGETS.register("gifts",') !== 0; }).join("\r\n");
const registry = H.extractRegistry(shell.script, "gifts");
const META = H.meta("W17");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final, rebuilt 28 Sep)");

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
/* Typing into the ledger search box. The block's listener reads the
   target's id and value and re-renders in place, so a plain bag is enough. */
function gtype(v) {
  const t = { id: "gpfLedgerQ", value: v, selectionStart: v.length,
    focus: function () {}, setSelectionRange: function () {} };
  (shim.listeners.input || []).forEach(function (fn) { fn({ target: t }); });
  return shim.captured["gpfModalRoot"] || "";
}
function grows(html) { return (html.match(/data-gpf="gopen"/g) || []).length; }

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
const CAMPS = ctx.GPF_PURPOSES; /* the row unit is the PURPOSE since 28 Sep */
const LABELS = CAMPS.map(function (c) { return c.code + ": " + c.name; });

/* ---------------------------------------------------------------- 0. shape */
A.eq(registry.length, 3, "three gifts registry entries: Glance, Explore, Detail");
A.eq(typeof ctx.gpFContentRoot, "function", "gpFContentRoot entry point defined");
A.eq(ctx.GPF_PAGE_SIZE, 20, "donor breakdown page size is 20 (Step 4)");
A.eq(CAMPS.length, 7, "seven purposes in the fixture (Memorial Gifts added 28 Sep: gifts, no pledge)");
A.eq(ctx.GPF_V12_LAYOUT, undefined, "the v1.2 layout flag is retired (28 Sep)");
/* the two live-screenshot rows, the numeric proof cited in Step 4 */
A.eq(CAMPS[0].code, "FRNKSTOK", "first fixture row is the live Stoke Sell row");
A.eq(CAMPS[0].pledgePaid, 1855, "Stoke Sell pledge payments 1855 (live screenshot)");
A.eq(CAMPS[1].pledgePaid, 96, "2020 Pledge pledge payments 96 (live screenshot)");
A.eq(CAMPS[6].pledgeTotal, 0, "Memorial Gifts has no pledge"); A.ok(CAMPS[6].otherGifts > 0, "Memorial Gifts has gifts");

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
      A.contains(html, "of $", "Glance shows the overall pledged read at " + v);
      A.contains(html, "from pledges", "Glance names the split at " + v);
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
        A.absent(html, "gpf-trow", "Goal Progress renders none of her table rows at " + sz);
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
["Purpose", "Pledge Total", "Pledge Due", "Received", "Due Remaining", "Percent Due"]
  .forEach(function (c) { A.contains(tbl, ">" + c + "<", "summary column present: " + c); });
A.contains(tbl, "gpf-total-row", "totals row rendered (her total row class)");
/* totals sum the first four money columns; Percent Due is NOT summed */
const totCells = /gpf-sumtotal"[\s\S]*?<\/div>\s*$/.test(tbl) || tbl.indexOf("gpf-sumtotal") > -1;
A.ok(totCells, "totals row carries our total marker");
A.ok(/gpf-sumtotal[\s\S]*?gpf-c-pct"><\/span>/.test(tbl), "Percent Due is NOT summed in the totals row");
/* Explore and Detail differ by card size alone under v1.2 (same view, same body) */
const exGoal = ctx.gpFContent(fresh("gpF", { size: "wide", gpFView: "goal" }));
const dtGoal = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" }));
A.eq(exGoal, dtGoal, "v1.2: Explore and Detail render the same body for one view");

/* ------------------------------------------- 2. the donut: retained, unreachable */
A.eq(typeof ctx.gpFDonut, "undefined", "the retired donut is DELETED, not carried (28 Sep)");
A.eq(typeof ctx.gpFGoalPanel, "undefined", "the retired Detail goal panel is deleted too");
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
A.eq(typeof ctx.gpFGoalPanel, "undefined", "the retired Detail goal panel is deleted (28 Sep)");
A.absent(ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" })), "gpf-panel-big",
  "the Detail goal panel is gone");

/* ------------------------------------- 3. the campaign filter NARROWS, no highlight */
(function () {
  const all = ctx.gpFCampCompute(fresh("gpF", { size: "xwide" }));
  A.eq(all.length, 7, "All purposes computes every purpose");
  const one = ctx.gpFCampCompute(fresh("gpF", { size: "xwide", gpFCamp: LABELS[2] }));
  A.eq(one.length, 1, "picking a campaign NARROWS the dataset to one row");
  A.eq(one[0].label, LABELS[2], "and it is the picked campaign");
  /* the narrowing recomputes the totals, which is what proves it is a filter
     and not a highlight */
  const tAll = ctx.gpFTotals(fresh("gpF", { size: "xwide" }));
  const tOne = ctx.gpFTotals(fresh("gpF", { size: "xwide", gpFCamp: LABELS[2] }));
  A.eq(tAll.count, 7, "totals count over all purposes");
  A.eq(tOne.count, 1, "totals count under the filter");
  A.ok(tOne.received < tAll.received, "the received total recomputes under the filter");
  A.ok(tOne.pledgeTotal < tAll.pledgeTotal, "the pledged total recomputes under the filter");
  /* every view narrows, not just the table */
  const barsAll = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" }));
  const barsOne = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal", gpFCamp: LABELS[2] }));
  A.eq((barsAll.match(/data-gpf="baropen"/g) || []).length, 7, "seven bars unfiltered");
  A.eq((barsOne.match(/data-gpf="baropen"/g) || []).length, 1, "one bar under the filter");
  const rowsAll = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "table" }));
  const rowsOne = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "table", gpFCamp: LABELS[2] }));
  A.eq((rowsAll.match(/data-gpf="open"/g) || []).length, 7, "seven table rows unfiltered");
  A.eq((rowsOne.match(/data-gpf="open"/g) || []).length, 1, "one table row under the filter");
  /* the totals row wording follows the narrowed count, including the singular */
  A.contains(rowsAll, "Total (7 purposes)", "totals row names the unfiltered count");
  A.contains(rowsOne, "Total (1 purpose)", "totals row goes singular under the filter");
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
  A.contains(ctx.gpFContent(w), "gpf-skel", "and the skeleton renders while loading");
  A.contains(ctx.gpFContent(w), "Loading purpose giving", "loading is explained, not a bare skeleton");
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
  w.gpFCamp = "All purposes"; w.gpFView = "goal"; w.gpFExp = {}; w.gpFPage = {}; w.gpFPlExp = {};
})();
/* the campaign popover lists All plus every campaign, and marks the current one */
(function () {
  const w = W("gpF");
  gfire("camp", { "data-id": "gpF" });
  const popHTML = shim.captured["gpfPop"];
  A.ok(popHTML && popHTML.length > 50, "the campaign popover opened and rendered");
  A.contains(popHTML, "All purposes", "popover offers All purposes");
  LABELS.forEach(function (l) { A.contains(popHTML, l, "popover offers " + l); });
  A.eq((popHTML.match(/role="option"/g) || []).length, 8, "eight purpose options (All plus seven)");
  A.contains(popHTML, 'aria-selected="true"', "the current purpose is marked selected");
  gfire("camp", { "data-id": "gpF" });
  A.eq(shim.document.getElementById("gpfPop"), null, "a second click closes the campaign popover");
})();
/* the date-range popover, its three presets and the custom From/To reveal */
(function () {
  const w = W("gpF");
  gfire("range", { "data-id": "gpF" });
  let popHTML = shim.captured["gpfPop"];
  ["Gifts received through", "Year to date", "This quarter", "This month", "Custom dates"].forEach(function (o) {
    A.contains(popHTML, o, "the dates popover offers " + o);
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
  /* the START now windows every figure; a wider start takes in more (owner ruling, 28 Sep) */
  const wideStart = ctx.gpFTotals(Object.assign(fresh("gpF"), { gpFRange: "custom", gpFStart: "2000-01-01", gpFEnd: "2026-08-19" }));
  A.ok(wideStart.received > late.received, "a wider start takes in more; the START is no longer cosmetic");
  const thru = ctx.gpFTotals(Object.assign(fresh("gpF"), { gpFRange: "thru", gpFEnd: "2026-08-19" }));
  A.eq(thru.received, wideStart.received, "the default through-date preset has no start, so it matches an all-time window");
  A.ok(thru.fromPledges > 0 && thru.other > 0, "Received carries BOTH pledge payments and other gifts (owner ruling, 28 Sep)");
  A.eq(Math.round((thru.fromPledges + thru.other) * 100) / 100, thru.received, "the two parts sum to Received");
  /* read the default phrase off a CLEAN widget: this block has just fired
     set-range custom, so the shared registry entry is no longer at default. */
  A.contains(ctx.gpFRangePhrase(Object.assign(fresh("gpF"), { gpFRange: "thru", gpFEnd: "2026-08-19" })),
    "Gifts received through", "the default chip reads Gifts received through X");
  A.contains(ctx.gpFRangePhrase(Object.assign(fresh("gpF"), { gpFRange: "ytd" })), "Gifts from", "a windowed chip reads Gifts from X to Y");
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

/* ------------------------- 4. a bar click opens the giving ledger (28 Sep) */
(function () {
  const w = W("gpF");
  A.eq(shim.captured["gpfModalRoot"], undefined, "no modal before a bar is clicked");
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  const m = shim.captured["gpfModalRoot"];
  A.ok(m && m.length > 200, "clicking a bar opened the modal");
  A.contains(m, "modal-backdrop", "the modal uses the copied backdrop primitive");
  A.contains(m, "gpf-detail-modal", "the modal reuses the copied gifts detail-modal shell");
  A.contains(m, LABELS[2], "the modal names the clicked purpose");
  A.contains(m, "every gift and pledge", "the modal is the giving ledger, not the old most-behind list");
  A.contains(m, 'data-gpf="ledger-filter"', "the ledger carries the type filter");
  A.contains(m, "Pledge payments", "filter: pledge payments");
  A.contains(m, "Other gifts", "filter: other gifts");
  A.contains(m, 'id="gpfLedgerQ"', "the ledger carries a search box");
  /* the campaign summary cells, on the copied summary-cell primitives */
  A.contains(m, "gpf-dsum", "the modal summary uses the copied summary-cell primitive");
  ["Pledge Total", "Pledge Due", "Received", "Due Remaining", "Pledge payments", "Other gifts"].forEach(function (k) {
    A.contains(m, ">" + k + "<", "modal summary cell: " + k);
  });
  /* The ledger lists EVERYTHING that came in for the purpose. It replaced the
     top-5 most-behind modal, which duplicated W04 Remittance Pledges. */
  const purpose = ctx.gpFCampByLabel(w, LABELS[2]);
  const win = ctx.gpFWindow(w);
  const model = ctx.gpFLedgerRows(w, purpose, win);
  const rows = grows(m);
  A.eq(rows, model.length, "the ledger renders one row per entry, uncapped");
  A.ok(rows > 5, "the fixture gives the ledger more than a handful of entries (got " + rows + ")");
  A.contains(m, rows + " entries, largest first", "the note states the entry count");
  A.ok(model.every(function (it, i) { return i === 0 || model[i - 1].amount >= it.amount; }),
    "the ledger is ordered largest first");
  /* the two type filters PARTITION the unfiltered list: nothing lost, nothing counted twice */
  const pOnly = (function () {
    gfire("ledger-filter", { "data-id": "gpF", "data-v": "pledges" });
    const h = shim.captured["gpfModalRoot"];
    A.absent(h, "gpf-seg-other-tag", "the pledge-payments filter hides the other gifts");
    return grows(h);
  })();
  const gOnly = (function () {
    gfire("ledger-filter", { "data-id": "gpF", "data-v": "gifts" });
    const h = shim.captured["gpfModalRoot"];
    A.contains(h, "gpf-seg-other-tag", "the other-gifts filter tags every row as an other gift");
    A.contains(h, "gpf-muted", "and an other gift shows no pledged figure and no due remaining");
    A.absent(h, "handshake", "no pledge rows survive the other-gifts filter");
    return grows(h);
  })();
  A.ok(pOnly > 0 && gOnly > 0, "both sides of the split hold something");
  A.eq(pOnly + gOnly, rows, "the two filters partition the unfiltered ledger exactly");
  gfire("ledger-filter", { "data-id": "gpF", "data-v": "all" });
  A.eq(grows(shim.captured["gpfModalRoot"]), rows, "All restores every entry");
  /* the search box narrows in place, and says so when nothing matches */
  const term = String(model[0].donor).split(" ").pop().toLowerCase();
  const hit = grows(gtype(term));
  A.ok(hit > 0 && hit < rows, "a search term narrows the ledger (got " + hit + " of " + rows + ")");
  const miss = gtype("zzzznomatch");
  A.eq(grows(miss), 0, "a term matching nothing lists no rows");
  A.contains(miss, "Nothing matches", "and the ledger says so rather than going blank");
  A.eq(grows(gtype("")), rows, "clearing the search restores every entry");
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
  A.contains(open1, "gpf-drow", "the drill reuses the copied donor-row grid");
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
  /* The drill lists PLEDGES, so it rolls up to the pledge-payments part of
     Received, not to Received itself, which now also carries other gifts. */
  A.near(sumRec, comp.fromPledges, 0.02, "donor received rolls up to the purpose's pledge payments");
  A.near(sumDue, comp.pledgeDue, 0.02, "donor pledge due rolls up to the purpose row");
  A.near(comp.fromPledges + comp.other, comp.received, 0.02,
    "and the two parts sum to Received, so the split is pinned from both ends");
  A.ok(comp.other > 0, "this purpose really does have other gifts, so the distinction is exercised");
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
  A.contains(after, "gpf-gifts", "the gift list reuses the copied gift-list primitive");
  A.contains(after, "gpf-drawer", "the gift level sits in the copied expanded drawer");
  ["Gift date", "Arrived by", "Prompted by", "Reference", "Amount"].forEach(function (c) {
    A.contains(after, ">" + c + "<", "gift column: " + c);
  });
  /* the deepest level is unmistakably GIFTS, not more pledges */
  A.absent(after.slice(after.indexOf("Gifts applied to this pledge")), "Begin date",
    "the gift level lists gifts, not another pledge table");
  /* the gifts total EXACTLY equals the pledge's displayed Received */
  /* gpFThru was retired with the window rebuild: every figure now reads the
     window, and Received sums gift LINES inside it rather than taking a
     pledge's whole paid amount all or nothing (28 Sep). */
  const win = ctx.gpFWindow(w);
  const gp = ctx.gpFGiftPanel(paid.pl, win.end, win);
  let gsum = 0;
  (paid.pl.gifts || []).forEach(function (g) { if (ctx.gpFInWindow(g.date, win)) gsum += g.amount; });
  gsum = Math.round(gsum * 100) / 100;
  A.eq(gsum, paid.p.received, "the gifts sum EXACTLY to the pledge's Received");
  A.contains(gp, ctx.gpFMoney(gsum), "the gift footer states that same total");
  A.contains(gp, "applied to this pledge", "the gift footer names the basis");
  /* a pledge with nothing received yet gets the empty gift line, not a blank */
  const none = ctx.gpFGiftPanel({ donor: "Test, Donor", giftDate: "2026-08-19", gifts: [] }, "2020-01-01");
  A.contains(none, "No gifts have been applied", "a pledge with no gifts in range says so");
  A.contains(none, "gpf-tab-empty", "and uses her empty-line primitive");
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
  /* bars: MOST RECEIVED FIRST since the 28 Sep rebuild (was goal progress,
     and there is no per-purpose goal any more). */
  const byRecv = ctx.gpFPurposeCompute(w).slice().sort(function (a2, b2) { return b2.received - a2.received; });
  const shown = (ctx.gpFGivingBars(w).match(/data-c="([^"]+)"/g) || []).map(function (m2) { return /data-c="([^"]+)"/.exec(m2)[1]; });
  A.eq(shown.join("|"), byRecv.map(function (r) { return r.label; }).join("|"),
    "bars are ordered most received first");
  A.ok(byRecv[0].received > byRecv[byRecv.length - 1].received,
    "the fixture genuinely has a spread, so the order is meaningful");
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
  const herSubject = rules.filter(function (l) { return /^\.(rem|ap|bank|pur|fa|dep|ar|ins|pen|pr|loan|pto)-/.test(l.trim()); });
  A.eq(herSubject.length, 0, "our CSS block declares no other widget's selectors as a rule subject");
})();
/* every class this widget's markup names is declared: the shell's own
   primitives, and the sixty it used to borrow, copied in as gpf-* when W17
   was finalised on this version (28 Sep 2026) */
A.cssDeclares(shell.css, [
  "dep-hd", "dep-hd-top", "dep-hd-num", "dep-hd-toggle", "dep-hd-kpigrp",
  "gpf-hd", "gpf-numwrap", "gpf-ctlrow", "gpf-datechip", "gpf-purpchip", "gpf-goalpill",
  "gpf-bars", "gpf-prow", "gpf-prow-top", "gpf-prow-foot", "gpf-p-nm", "gpf-p-pct", "gpf-p-amt",
  "gpf-track", "gpf-track-sm", "gpf-fill", "gpf-bars-legend", "gpf-zeroline", "gpf-clickable",
  "gpf-trow", "gpf-c-nm", "gpf-c-n", "gpf-c-pct", "gpf-total-row",
  "gpf-drow", "gpf-dexp", "gpf-dc", "gpf-dc0", "gpf-dc5", "gpf-dstat-h", "gpf-dstatus",
  "gpf-dstatus-behind", "gpf-dstatus-ok", "gpf-drawer", "gpf-drawer-h", "gpf-gifts", "gpf-grow",
  "gpf-ghead", "gpf-ga", "gpf-dsum", "gpf-dsum-i", "gpf-dsum-k", "gpf-dsum-v", "gpf-tab-empty",
  "gpf-detail-modal", "gpf-detail-h", "gpf-detail-b", "gpf-detail-ic", "gpf-dsub", "gpf-dh-spacer",
  "gpf-skel", "gpf-skel-rows", "gpf-sk-row", "gpf-sk-bar", "gpf-glance-read", "gpf-glance-cap",
  "gpf-cap-ok", "gpf-allset",
  "filter-chip", "fc-label", "vtoggle", "vt", "scope-chip", "sc-nm", "metric-value", "gl-sub",
  "kpi-row", "kpi-num", "wt-row", "wt-head", "scroll", "sk", "bgt-spin", "sr-only",
  "state", "state-title", "state-sub", "modal", "modal-wide", "modal-h", "modal-b", "modal-f",
  "modal-title", "modal-backdrop", "iconbtn", "cap", "mi", "mi-nm", "mi-gap", "sep"
], "every shell and copied class our markup uses is declared");
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
  /* the empty fixture left the demo registry at finalisation; built here instead */
  const e = Object.assign({}, W("gpF"), { id: "gpF5", dataset: "empty", state: "empty" });
  A.eq(e.dataset, "empty", "the empty fixture is seeded empty");
  const wide = ctx.gpFContentRoot(Object.assign({}, e, { size: "wide" }));
  A.contains(wide, "No gift or pledge purposes yet", "the empty card states its own copy");
  A.contains(wide, "state", "the empty state uses her state primitive");
  A.contains(wide, 'data-kind="empty"', "and is marked as an empty state");
  A.absent(wide, "Deposits", "the empty state is OURS, not the generic Deposits copy");
  A.absent(wide, 'data-gpf="view"', "no view toggle on the empty card");
  A.absent(wide, "gpf-pager", "no pager on the empty card");
  const kpi = ctx.gpFContentRoot(Object.assign({}, e, { size: "kpi" }));
  A.contains(kpi, "None set up", "the Glance empty variant is the short one");
  A.contains(kpi, "no purposes to show yet", "and explains itself");
  A.changed(kpi, wide, "the Glance empty state differs from the card empty state");
  /* Since finalisation the widget reaches the shell through WIDGETS.register,
     which contentHTML consults before its own kind chain and before the
     generic empty fallback, so this widget's own empty state renders and not
     the Deposits copy. No hard-coded dispatch line remains. */
  A.contains(shell.script, 'WIDGETS.register("gifts",{content:gpFContentRoot', "the widget registers its content");
  A.contains(shell.script, 'b:GPF_ABOUT', "and its about text");
  A.absent(shell.script, 'if(w.kind==="gifts")return', "no hard-coded contentHTML dispatch survives");
  const iReg = shell.script.indexOf("var wreg=WIDGETS.content(w);");
  const iFallback = shell.script.indexOf('EMPTY_COPY[w.kind]||EMPTY_COPY.deposits');
  A.ok(iReg > -1, "the registry lookup in contentHTML was located");
  A.ok(iFallback > -1, "the generic empty fallback was located");
  A.ok(iReg < iFallback, "the registry lookup runs BEFORE the generic empty fallback");
  A.absent(shell.script, "-mb", "no -mb kind survives anywhere in the shell");
  /* a filter that narrows to nothing says so rather than rendering a blank */
  const none = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "table", gpFCamp: "NOSUCH: Campaign" }));
  A.contains(none, "No gift or pledge purposes", "a filter matching nothing renders a stated empty state");
  /* the single-purpose fixture narrows the option list too */
  /* the single-purpose and empty datasets left the demo registry when W17 was
     finalised (owner: only the three sizes). The driver builds them, as W13's does. */
  const one = Object.assign({}, W("gpF"), { id: "gpF4", dataset: "single", gpFCamp: "All purposes" });
  A.eq(ctx.gpFAllPurposes(one).length, 1, "the single-purpose fixture offers one purpose");
  A.contains(ctx.gpFContentRoot(Object.assign({}, one, { size: "wide" })), "gpf-root", "the single-purpose card renders");
  /* aboutOf is wired */
  A.ok(String(ctx.GPF_ABOUT).length > 120, "the about text is real prose");
  A.noEmDash(ctx.GPF_ABOUT, "the about text");
})();

/* --------------------- 11. no-em-dash sweep, every combination */
(function () {
  let n = 0;
  const sizes = ["kpi", "wide", "xwide"];
  const camps = ["All purposes"].concat(LABELS);
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
          /* a gifts-only purpose has no donor pledges to drill into */
          const dr = ctx.gpFDonorRows(w, camp);
          const pid = dr.length ? dr[0].pl.id : "none";
          const w2 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFExp: { [lab]: true }, gpFPlExp: { [pid]: true } });
          A.noEmDash(ctx.gpFContentRoot(w2), sz + " / " + c + " / " + v + " / drilled"); n++;
        }
        /* and while loading */
        const w3 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFLoading: true });
        A.noEmDash(ctx.gpFContentRoot(w3), sz + " / " + c + " / " + v + " / loading"); n++;
      });
    });
  });
  /* the gifts-only purpose really is in the sweep, so the no-pledge branch
     above is exercised rather than silently skipped (28 Sep) */
  (function () {
    const wAll = fresh("gpF", { size: "xwide", gpFView: "goal" });
    const giftsOnly = ctx.gpFPurposeCompute(wAll).filter(function (r) { return r.pledgeTotal <= 0 && r.other > 0; });
    A.eq(giftsOnly.length, 1, "exactly one purpose in the fixture has gifts and no pledge");
    A.eq(ctx.gpFDonorRows(wAll, ctx.gpFCampByLabel(wAll, giftsOnly[0].label)).length, 0,
      "and it genuinely has no donor pledges to drill into");
    A.noEmDash(ctx.gpFContentRoot(fresh("gpF", { size: "xwide", gpFView: "goal", gpFCamp: giftsOnly[0].label })),
      "the gifts-only purpose, filtered to itself");
  })();
  /* the empty and single-purpose fixtures, every tier */
  [{ id: "gpF4", dataset: "single" }, { id: "gpF5", dataset: "empty", state: "empty" }].forEach(function (f) {
    sizes.forEach(function (sz) {
      A.noEmDash(ctx.gpFContentRoot(Object.assign({}, W("gpF"), f, { size: sz })), f.id + " / " + sz); n++;
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
    A.noEmDash(shim.captured["gpfModalRoot"], "the giving ledger for " + l); n++;
    /* and under each type filter, and with a search applied */
    ["pledges", "gifts", "all"].forEach(function (f) {
      gfire("ledger-filter", { "data-id": "gpF", "data-v": f });
      A.noEmDash(shim.captured["gpfModalRoot"], "the ledger for " + l + ", filtered to " + f); n++;
    });
    A.noEmDash(gtype("a"), "the ledger for " + l + ", searched"); n++;
    A.noEmDash(gtype("zzzznomatch"), "the ledger for " + l + ", empty search"); n++;
    gtype("");
    gfire("detail-close", { "data-id": "gpF" });
  });
  /* every status string this widget can emit */
  env.log.status.forEach(function (s, i) { A.noEmDash(s, "status message " + i); n++; });
  console.log("  (no-em-dash sweep: " + n + " combinations)");
  A.ok(n >= 100, "the sweep covered at least 100 combinations (got " + n + ")");
})();

/* ------------------------------------------------ 12. titles and namespace */
registry.forEach(function (w) {
  A.eq(w.title, "Gifts Pledges", "registry title is the plain product name: " + w.id);
  A.contains(w.title, "Gifts Pledges", "registry title names the widget: " + w.id);
  A.eq(w.kind, "gifts", "registry kind: " + w.id);
  A.ok(w.id.indexOf("gpF") === 0, "registry id is gpF-prefixed: " + w.id);
  A.ok(w.tiers && w.tiers.length === 3, "three tiers: " + w.id);
  A.noEmDash(w.title, "registry title " + w.id);
});
A.ok(registry.some(function (w) { return w.size === "kpi"; }), "a Glance entry exists");
A.ok(registry.some(function (w) { return w.size === "wide"; }), "an Explore entry exists");
A.ok(registry.some(function (w) { return w.size === "xwide"; }), "a Detail entry exists");
/* the review fixtures (Summary Table, one purpose, single dataset, empty) left the
   demo registry at finalisation; the driver exercises all four states directly. */
A.eq(registry.filter(function (w) { return w.state === "empty"; }).length, 0, "no fixture rows remain in the demo registry");
/* Read the seeded state from the FILE, not from the registry objects: the
   sections above drive the live entries through their own states, so their
   keys have moved by the time this runs. */
A.eq((shell.script.match(/title:"Gifts Pledges",\s*kind:"gifts"/g) || []).length, 3,
  "all three rows are titled Gifts Pledges under kind gifts");
A.eq((shell.script.match(/gpFRange:"thru"/g) || []).length, 3,
  "all three open on the default through-date basis");


/* ---------------------------------------------------------------- report */
process.exit(A.report());
