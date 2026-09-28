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
     5  a table row opens the pop-up (it expanded in place until 28 Sep), and
        the purpose's figures agree with the pledges behind it
     6  (merged into 4 and 5: the gift level lives in the pop-up now)
     7  ordering: bars most-received-first, ledger largest-first, drill
        most-behind-first, table in data order, no alphabetical sort
     8  the block's buttons style from the GLOBAL button family, and our
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
  const w = Object.assign({}, base, { gpFPlExp: {} }, over || {});
  return w;
}
const CAMPS = ctx.GPF_PURPOSES; /* the row unit is the PURPOSE since 28 Sep */
const LABELS = CAMPS.map(function (c) { return c.code + ": " + c.name; });

/* ---------------------------------------------------------------- 0. shape */
A.eq(registry.length, 3, "three gifts registry entries: Glance, Explore, Detail");
A.eq(typeof ctx.gpFContentRoot, "function", "gpFContentRoot entry point defined");
A.eq(ctx.GPF_PAGE_SIZE, undefined, "the drill's page size went with the drill (28 Sep)");
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
      A.absent(html, "Gifts and Pledges", "Glance does not repeat the card title inside itself (owner, 28 Sep)");
      A.absent(html, "scope-chip", "and carries no scope chip at all (" + v + ")");
      /* Glance clips at 137px with overflow hidden, so its stack has to fit. The
         pill row and the caption are each held to one line and scroll sideways
         rather than wrapping, which is the pattern W15 settled on. */
      A.contains(html, "gpf-glance-cap", "Glance carries the split caption (" + v + ")");
      /* the VISIBLE caption is the compact form; the screen-reader line below it
         keeps the full wording on purpose, so this reads the caption alone */
      const capTxt = html.slice(html.indexOf("gpf-glance-cap")).split("</span>")[0];
      /* both forms say "gifts" since 28 Sep, so the discriminator is the
         phrasing: the full line reads "from pledges", the compact "pledged," */
      A.absent(capTxt, "from pledges", "the visible Glance caption is the compact form (" + v + ")");
      A.contains(capTxt, "pledged,", "which reads pledged rather than from pledges (" + v + ")");
      A.contains(capTxt, "gifts", "and still names both parts (" + v + ")");
      A.contains(html.slice(html.indexOf("sr-only")), "from gifts",
        "while the screen-reader line keeps the full wording (" + v + ")");
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
        /* the table's own rows carry baropen since 28 Sep, so the check is that
           it renders no BAR markup, not that it never opens the pop-up */
        A.absent(html, "gpf-prow", "Summary Table renders NO bars at " + sz);
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
  A.ok(tOne.totalIn < tAll.totalIn, "the giving total recomputes under the filter");
  A.ok(tOne.pledgeTotal < tAll.pledgeTotal, "the pledged total recomputes under the filter");
  /* every view narrows, not just the table */
  const barsAll = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" }));
  const barsOne = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal", gpFCamp: LABELS[2] }));
  A.eq((barsAll.match(/data-gpf="baropen"/g) || []).length, 7, "seven bars unfiltered");
  A.eq((barsOne.match(/data-gpf="baropen"/g) || []).length, 1, "one bar under the filter");
  const rowsAll = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "table" }));
  const rowsOne = ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "table", gpFCamp: LABELS[2] }));
  A.eq((rowsAll.match(/gpf-sumrow/g) || []).length, 6, "six rows in the Pledges table: the gifts-only purpose has no active pledge and is absent, exactly as it is absent from the panel");
  A.eq((rowsOne.match(/gpf-sumrow/g) || []).length, 1, "one table row under the filter");
  /* the totals row wording follows the narrowed count, including the singular */
  A.contains(rowsAll, "Total (6 purposes)", "the Pledges totals row counts only the rows it shows");
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
  A.eq(Object.keys(w.gpFPlExp).length, 0, "a purpose change clears the ledger's expanded rows");
  w.gpFLoading = false;
  const t1 = env.log.timers;
  gfire("view", { "data-id": "gpF", "data-v": "table" });
  A.eq(w.gpFView, "table", "the view toggle updates the view");
  A.eq(w.gpFLoading, false, "a view switch does NOT fetch");
  A.eq(env.log.timers, t1, "a view switch scheduled no load timer");
  /* restore */
  w.gpFCamp = "All purposes"; w.gpFView = "goal"; w.gpFPlExp = {};
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
  A.ok(early.totalIn < late.totalIn, "an earlier range end scopes the giving down (the end is the cutoff)");
  /* the range START frames the chip only and windows no figure (Step 5 v2) */
  /* the START now windows every figure; a wider start takes in more (owner ruling, 28 Sep) */
  const wideStart = ctx.gpFTotals(Object.assign(fresh("gpF"), { gpFRange: "custom", gpFStart: "2000-01-01", gpFEnd: "2026-08-19" }));
  A.ok(wideStart.totalIn > late.totalIn, "a wider start takes in more giving; the START is not cosmetic");
  const thru = ctx.gpFTotals(Object.assign(fresh("gpF"), { gpFRange: "thru", gpFEnd: "2026-08-19" }));
  A.eq(thru.totalIn, wideStart.totalIn, "the default through-date preset has no start, so it matches an all-time window");
  A.ok(thru.fromPledges > 0 && thru.other > 0, "the model carries both parts: pledge payments and gifts with no pledge");
  A.eq(Math.round((thru.fromPledges + thru.other) * 100) / 100, thru.totalIn, "the two parts sum to the purpose total, which is what Giving shows");
  /* the pledged side never moves with the window START (owner, 28 Sep, after Edd) */
  A.eq(thru.pledgeTotal, late.pledgeTotal, "Pledge Total is the full active pledge whatever the preset");
  A.eq(thru.fromPledgesThru, late.fromPledgesThru, "and the legacy Received reads to the thru date, not the window start");
  /* read the default phrase off a CLEAN widget: this block has just fired
     set-range custom, so the shared registry entry is no longer at default. */
  /* The CHIP shows only the dates since 28 Sep (owner: "just the dates ... so
     it is smaller and fit better"). The full sentence stays in the aria-label
     and in the ledger's subtitle, where there is room for it. */
  const cleanThru = Object.assign(fresh("gpF"), { gpFRange: "thru", gpFEnd: "2026-08-19" });
  A.eq(ctx.gpFRangeShort(cleanThru), "Aug 19, 2026", "the default chip shows the date alone");
  A.eq(ctx.gpFRangeShort(Object.assign(fresh("gpF"), { gpFRange: "ytd" })), "Jan 1 to Aug 19, 2026",
    "a windowed chip shows the two dates alone");
  A.contains(ctx.gpFRangePhrase(cleanThru), "Gifts received through", "the full sentence survives for the aria-label");
  A.contains(ctx.gpFRangePhrase(Object.assign(fresh("gpF"), { gpFRange: "ytd" })), "Gifts from", "and for a windowed range");
  const chip = ctx.gpFRangeChip(cleanThru);
  A.contains(chip, 'aria-label="Gifts received through Aug 19, 2026, tap to change the dates"', "the chip's aria-label carries the meaning");
  A.contains(chip, '<span class="fc-label">Aug 19, 2026</span>', "and its visible label carries only the date");
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
  /* The filter names row TYPES: All, Pledges, Gifts (owner, 28 Sep). Read the
     tabs themselves, not the modal: "Pledge payments" and "Other gifts" still
     appear in the summary strip above, where they name money figures, so a
     whole-modal contains() would pass whatever the tabs said. */
  const tabLabels = [];
  const tabRe = /data-gpf="ledger-filter"[^>]*>([^<]*)</g;
  let tm;
  while ((tm = tabRe.exec(m)) !== null) tabLabels.push(tm[1]);
  A.eq(tabLabels.join(" | "), "All | Pledges | Gifts", "the filter reads All, Pledges, Gifts");
  ["all", "pledges", "gifts"].forEach(function (v) {
    A.contains(m, 'data-gpf="ledger-filter" data-v="' + v + '"', "and its values are unchanged: " + v);
  });
  /* the Type column carries a TYPE, for both kinds of row. It used to show a
     pledge's pace status, which is not a type. */
  A.contains(m, 'class="gpf-tag gpf-seg-pledge-tag">Pledge<', "a pledge row's Type says Pledge");
  A.absent(m, "Other gift<", "and a gift row no longer says Other gift");
  /* the pace status is moved, not dropped */
  A.contains(m, "gpf-ldr-stat", "the pace status sits with the pledge reference now");
  A.contains(m, "gpf-dstatus", "and is still the same status chip");
  A.contains(m, 'id="gpfLedgerQ"', "the ledger carries a search box");
  /* the campaign summary cells, on the copied summary-cell primitives */
  A.contains(m, "gpf-dsum", "the modal summary uses the copied summary-cell primitive");
  ["Pledge Total", "Pledge Due", "Received", "Due Remaining", "Pledge payments", "Gifts"].forEach(function (k) {
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
  /* THE LIST MUST SCROLL. It inherits .gpf-drill-tbl from the in-card drill,
     which is paged at twenty rows and clips to keep its corners. The ledger is
     not paged: on 28 Sep it was measured at 5,786px of rows inside a 410px box
     with overflow hidden, so 48 of 58 entries could not be reached. Counting
     the rows in the markup found 58 and missed it entirely, which is why this
     asserts the scroll container and its rule, not the row count. */
  A.contains(m, 'class="gpf-drill-tbl gpf-ldr-list"', "the ledger list carries its own scroll container");
  A.cssDeclares(shell.css, ["gpf-ldr-list"], "and that container is declared");
  const listRule = /\.gpf-root \.gpf-modal \.gpf-ldr-list\{([^}]*)\}/.exec(shell.css);
  A.ok(!!listRule, "the scroll container's rule was located");
  A.contains(listRule[1], "overflow-y:auto", "the ledger list scrolls");
  A.contains(listRule[1], "min-height:150px", "and keeps a floor so it cannot collapse to nothing");
  A.contains(shell.css, ".gpf-root .gpf-modal .gpf-ldr-list .wt-head{position:sticky",
    "the column header sticks, so a long ledger stays labelled");

  /* A PLEDGE SHOWS ITS SCHEDULE, then its payments. The rebuild plan called for
     both; only the payments were built, so a pledge behind pace showed what had
     arrived with nothing to compare it against. */
  const pledgeRow = ctx.gpFLedgerRows(w, purpose, win).filter(function (it) { return it.kind === "pledge"; })[0];
  A.ok(!!pledgeRow, "the ledger has a pledge entry to open");
  const hist = ctx.gpFPledgeHistory(pledgeRow.pledge, win);
  A.contains(hist, "Pledge schedule", "a pledge's history opens with its schedule");
  A.contains(hist, "Gifts applied to this pledge", "and then its payments");
  A.ok(hist.indexOf("Pledge schedule") < hist.indexOf("Gifts applied to this pledge"),
    "the promise is shown before what arrived, not after");
  A.eq((hist.match(/role="region"/g) || []).length, 1, "one region wrapper, not a drawer nested in a drawer");
  ["Instalment", "Due date", "State", "Amount"].forEach(function (c) {
    A.contains(hist, ">" + c + "<", "schedule column: " + c);
  });
  /* the schedule is stepped the same way the pace arithmetic steps it, so the
     two cannot disagree: instalments fallen due must sum to Pledge Due */
  const sched = ctx.gpFScheduleRows(pledgeRow.pledge);
  A.eq(sched.length, Math.max(1, pledgeRow.pledge.inst || 1), "one row per instalment");
  A.near(sched.reduce(function (a, r) { return a + r.amount; }, 0), pledgeRow.pledge.pledge, 0.02,
    "the instalments sum to the pledge");
  const dueByNow = sched.filter(function (r) { return r.date <= win.end; })
                        .reduce(function (a, r) { return a + r.amount; }, 0);
  A.near(dueByNow, pledgeRow.pace.due, 0.02, "the instalments fallen due sum to the row's Pledge Due");
  /* both states are reachable in the fixture, so neither branch is dead */
  (function () {
    let future = 0, past = 0;
    ctx.GPF_PURPOSES.forEach(function (p) {
      ctx.gpFDonorsFor(p).forEach(function (pl) {
        ctx.gpFScheduleRows(pl).forEach(function (r) { if (r.date > win.end) future++; else past++; });
      });
    });
    A.ok(past > 0, "the fixture has instalments already fallen due (" + past + ")");
    A.ok(future > 0, "and instalments not yet due, so that branch is not dead (" + future + ")");
  })();
  /* a gift has no schedule: there is nothing promised behind it */
  const giftRow = ctx.gpFLedgerRows(w, purpose, win).filter(function (it) { return it.kind === "gift"; })[0];
  A.ok(!!giftRow, "the ledger has an other-gift entry");
  const gw = Object.assign(fresh("gpF"), { gpFPlExp: { [giftRow.id]: true } });
  const gRow = ctx.gpFLedgerRowHTML(giftRow, gw, win);
  A.absent(gRow, "Pledge schedule", "an other gift shows no schedule; nothing was promised behind it");
  A.contains(gRow, "Gift date", "it shows its own detail instead");

  /* "Prompted by" was dropped on 28 Sep (owner: "until we know it is wanted or
     needed"). The legacy field is real, GFHistory.MotivationID, but it sits on
     the GIFT and not on the gift LINE, and a motivation belongs to at most one
     purpose while the picker offers every motivation in the company. So in a
     pop-up scoped to one purpose it could print a motivation belonging
     elsewhere. The MODEL keeps the field, so restoring the column is markup. */
  const giftCols = ["Gift date", "Arrived by", "Reference", "Amount"];
  [gRow, ctx.gpFPledgeHistory(pledgeRow.pledge, win)].forEach(function (h, i) {
    A.absent(h, "Prompted by", "no motivation column, view " + i);
    giftCols.forEach(function (c) { A.contains(h, ">" + c + "<", "gift column " + c + ", view " + i); });
  });
  A.ok(Array.isArray(ctx.GPF_MOTIVATIONS) && ctx.GPF_MOTIVATIONS.length > 0,
    "the model still carries motivations, so the column can come back without a data change");
  A.ok(ctx.gpFOtherGiftsFor(purpose).every(function (g) { return !!g.motive; }),
    "and every gift still has one seeded");
  /* the search matches only what is on screen: media yes, motivation no */
  const anyMotive = ctx.GPF_MOTIVATIONS[0].name.toLowerCase();
  const byMotive = ctx.gpFLedgerRows(w, purpose, win);
  A.ok(byMotive.every(function (it) { return String(it.refs || "").toLowerCase().indexOf(anyMotive) < 0; }),
    "the motivation is out of the search haystack, so the search matches only visible text");
  A.ok(ctx.gpFOtherGiftsFor(purpose).length === 0 ||
       byMotive.filter(function (it) { return it.kind === "gift"; })
               .every(function (it) { return String(it.refs).indexOf(it.gift.media) > -1; }),
    "while how a gift arrived stays searchable, because it is still shown");
  /* both gift grids are four columns wide now */
  A.eq((shell.css.match(/grid-template-columns:1fr 1fr 1\.2fr auto/g) || []).length, 2,
    "both gift grids were narrowed from five columns to four");
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

/* ------- 5. a table row opens the pop-up; it no longer expands in place ----
   The owner replaced the inline donor drill with the giving ledger on 28 Sep,
   so a purpose behaves the same way whether it is selected from a bar or from
   a table row. */
(function () {
  const w = fresh("gpF", { size: "xwide", gpFView: "table" });
  const html = ctx.gpFContent(w);
  /* the row is a pop-up trigger, not a disclosure */
  A.contains(html, 'data-gpf="baropen"', "a table row opens the pop-up");
  A.contains(html, 'aria-haspopup="dialog"', "and says so");
  A.absent(html, 'data-gpf="open"', "the expand action is gone");
  /* the header chips are still disclosure controls, so this reads the row alone */
  const rowAt = html.indexOf('data-gpf="baropen"');
  const rowTag = html.slice(Math.max(0, rowAt - 120), rowAt + 220);
  A.absent(rowTag, "aria-expanded", "a table row is no longer a disclosure control");
  A.contains(rowTag, "gpf-sumrow", "and the tag read really is the table row");
  A.absent(html, "gpf-drill", "and nothing expands inside the card");
  A.absent(html, "so there is no in-card pager");
  A.eq(typeof ctx.gpFDonorPanel, "undefined", "the inline drill builder is deleted, not merely unused");
  A.eq(typeof ctx.gpFPager, "undefined", "the pager builder too");
  A.eq(typeof ctx.GPF_PAGE_SIZE, "undefined", "and the page size with them");
  /* the row still carries the caret, which now means it opens something */
  A.contains(html, "gpf-caret", "the row keeps its affordance");
  A.absent(shell.css, ".gpf-root .is-exp>.gpf-caret", "but not the rotation, since nothing expands");

  /* clicking a row opens the ledger for THAT purpose */
  const row = W("gpF");
  row.gpFView = "table";
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  const m = shim.captured["gpfModalRoot"];
  A.ok(m && m.length > 200, "the row opened the ledger");
  A.contains(m, LABELS[2], "and it is the ledger for the row's own purpose");
  A.contains(m, "every gift and pledge", "which is the same pop-up a bar opens");

  /* WHAT THE RETIRED DRILL PROVED, asserted against the pop-up instead: the
     purpose's own figures agree with the pledges behind it. */
  const win = ctx.gpFWindow(row);
  const purpose = ctx.gpFCampByLabel(row, LABELS[2]);
  const comp = ctx.gpFCampCompute(row).filter(function (r) { return r.label === LABELS[2]; })[0];
  A.ok(!!comp, "the purpose row was located");
  const pledges = ctx.gpFDonorsFor(purpose);
  A.ok(pledges.length > 40, "the purpose has a real pledge set behind it (" + pledges.length + ")");
  let sumRec = 0, sumDue = 0;
  pledges.forEach(function (pl) {
    const pace = ctx.gpFDonorPace(pl, ctx.gpFParse(win.end), win.end, win);
    sumRec += pace.received; sumDue += pace.due;
  });
  A.near(sumRec, comp.fromPledges, 0.02, "the pledges' received sums to the purpose's pledge payments");
  A.near(sumDue, comp.pledgeDue, 0.02, "and their due sums to the purpose's Pledge Due");
  A.near(comp.fromPledges + comp.other, comp.totalIn, 0.02, "the two parts still sum to the purpose total");
  /* every one of those pledges is reachable in the ledger, which is the point
     of replacing a paged drill with one scrolling list */
  const ledger = ctx.gpFLedgerRows(row, purpose, win);
  const pledgeEntries = ledger.filter(function (it) { return it.kind === "pledge"; });
  const withActivity = pledges.filter(function (pl) {
    const r = ctx.gpFDonorPace(pl, ctx.gpFParse(win.end), win.end, win);
    return r.pledged > 0 || r.receivedThru > 0;
  });
  A.eq(pledgeEntries.length, withActivity.length, "every pledge with activity appears in the ledger, unpaged");
  gfire("detail-close", { "data-id": "gpF" });
  A.eq(shim.captured["gpfModalRoot"], "", "and the pop-up closes");
})();

/* ------------------------------------------------------- 7. ordering rules */
(function () {
  const w = fresh("gpF", { size: "xwide", gpFView: "goal" });
  /* bars: MOST RECEIVED FIRST since the 28 Sep rebuild (was goal progress,
     and there is no per-purpose goal any more). */
  const byRecv = ctx.gpFPurposeCompute(w).slice().sort(function (a2, b2) { return b2.totalIn - a2.totalIn; });
  const shown = (ctx.gpFGivingBars(w).match(/data-c="([^"]+)"/g) || []).map(function (m2) { return /data-c="([^"]+)"/.exec(m2)[1]; });
  A.eq(shown.join("|"), byRecv.map(function (r) { return r.label; }).join("|"),
    "bars are ordered most received first");
  A.ok(byRecv[0].totalIn > byRecv[byRecv.length - 1].totalIn,
    "the fixture genuinely has a spread, so the order is meaningful");
  /* The drill ordered most behind pace first. It was replaced by the ledger on
     28 Sep, which orders by amount received, largest first, because it lists
     gifts and pledges together and "behind pace" means nothing for a gift. */
  const camp = ctx.gpFCampByLabel(w, LABELS[2]);
  const led = ctx.gpFLedgerRows(w, camp, ctx.gpFWindow(w));
  A.ok(led.every(function (it, i) { return i === 0 || led[i - 1].amount >= it.amount; }),
    "the ledger is ordered largest first");
  A.ok(led[0].amount > led[led.length - 1].amount, "and the spread is real");
  A.ok(led.some(function (it) { return it.kind === "gift"; }) && led.some(function (it) { return it.kind === "pledge"; }),
    "it interleaves both kinds, which is why amount is the ordering and not pace");
  /* table: the LEGACY ORDER. GFPledgeRepository.GetWidgetData ends
     .OrderByDescending(p => p.PledgeTotal), so the Pledges table does too. It is not a
     user control, so the widget still offers no ordering of its own. */
  const tw = fresh("gpF", { size: "xwide", gpFView: "table" });
  const tOrder = (ctx.gpFContent(tw).match(/data-gpf="baropen" data-id="[^"]*" data-c="([^"]+)"/g) || [])
    .map(function (s) { return /data-c="([^"]+)"/.exec(s)[1]; });
  const byPledged = ctx.gpFPurposeCompute(tw).filter(function (r) { return r.hasPledges; })
    .sort(function (a2, b2) { return b2.pledgeTotal - a2.pledgeTotal; }).map(function (r) { return r.label; });
  A.eq(tOrder.join("|"), byPledged.join("|"), "the Pledges table renders largest pledge first, as the legacy query orders it");
  A.ok(tOrder.join("|") !== LABELS.slice().sort().join("|"),
    "and that order is demonstrably NOT alphabetical");
  /* NO alphabetical sort, and no sort control, anywhere */
  A.absent(block, "localeCompare", "the block contains no locale-aware string comparison");
  A.absent(block, ".sort(function(a,b){return a.label", "no label-alphabetical sort in the block");
  const everything = ["goal", "table"].map(function (v) {
    return ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: v }));
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
  /* (b) the block's buttons ask for the GLOBAL button family and nothing else.
     The header export button was removed on 28 Sep at the owner's request, so
     the ledger's own footer buttons carry this check now. */
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  const ex = shim.captured["gpfModalRoot"];
  A.contains(ex, 'class="btn naked sm"', "the ledger footer uses the global button classes");
  A.contains(ex, 'class="btn primary sm"', "and the global primary modifier for Close");
  gfire("detail-close", { "data-id": "gpF" });
  A.absent(ctx.gpFContent(fresh("gpF", { size: "wide" })), 'data-gpf="export"', "the header export button is gone (owner, 28 Sep)");
  A.absent(ctx.gpFContent(fresh("gpF", { size: "xwide" })), "Export", "and its label with it");
  /* (c) that family really is declared GLOBALLY, ahead of every ported block */
  const firstMB = shell.css.search(/\/\* ===== W\d\d /); /* first widget CSS region banner (the old "(MB updated)" markers are gone) */
  A.ok(firstMB > 0, "the stylesheet does contain ported blocks to compare against");
  [".btn{", ".btn.naked{", ".btn.sm{"].forEach(function (sel) {
    const at = shell.css.indexOf(sel);
    A.ok(at > -1, "the shell declares " + sel + " globally");
    A.ok(at > -1 && at < firstMB, sel + " is declared BEFORE any ported block (so it is global, not W04's)");
  });
  A.cssDeclares(shell.css, ["btn"], "the global button family is declared");
  /* (d) nothing in the file scopes a gpf rule under the W04 root any more */
  A.absent(shell.css, ".remf-root .gpf-", "the old W04-scoped rules are gone");
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
  "gpf-cap", "gpf-tblwrap", "gpf-scroll", "gpf-sumrow", "gpf-sumtotal", "gpf-caret",
  "gpf-nmtxt", "gpf-nm", "gpf-nmsub", "gpf-drill-tbl", "gpf-drawer",
  "gpf-grow", "gpf-gref", "gpf-giftfoot", 
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
  /* The header export went on 28 Sep (owner). The drill keeps its own
     purpose-scoped export, and it is still a labelled stub. */
  const n1 = env.log.status.length;
  /* Both export stubs are gone: the header one on 28 Sep at the owner's
     request, the drill's when the drill was replaced by the pop-up. There is
     no export control left on this widget. */
  gfire("export-donors", { "data-id": "gpF", "data-c": LABELS[2] });
  A.eq(env.log.status.length, n1, "the retired drill export reports nothing, because it is gone");
  A.absent(shell.script, 'data-gpf="export', "no export action survives in the block");
  A.eq(typeof ctx.gpFExportBtn, "undefined", "the header export builder is deleted, not merely unused");
  /* NO invented workflow action anywhere on the card (the standing constraint) */
  const surfaces = ["kpi", "wide", "xwide"].map(function (sz) {
    return ["goal", "table"].map(function (v) {
      return ctx.gpFContentRoot(fresh("gpF", { size: sz, gpFView: v }));
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
  A.absent(wide, "no pager on the empty card");
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
          /* a gifts-only purpose has no pledges behind it */
          const dr = ctx.gpFDonorsFor(camp);
          const pid = dr.length ? dr[0].id : "none";
          const w2 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFPlExp: { [pid]: true } });
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
    A.eq(ctx.gpFDonorsFor(ctx.gpFCampByLabel(wAll, giftsOnly[0].label)).length, 0,
      "and it genuinely has no pledges behind it");
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

/* ------------------- 14. the owner's 28 Sep header trim, held in place */
(function () {
  /* the compact split line says the same thing in fewer words, and the full
     wording still reaches Explore, Detail and every aria string */
  const tot = ctx.gpFTotals(fresh("gpF", { gpFRange: "thru", gpFEnd: "2026-08-19" }));
  const shortLine = ctx.gpFSplitLineShort(tot), fullLine = ctx.gpFSplitLine(tot);
  A.changed(shortLine, fullLine, "the Glance caption is not the full wording");
  A.ok(shortLine.length < fullLine.length, "it is shorter (" + shortLine.length + " against " + fullLine.length + ")");
  [ctx.gpFMoney0(tot.fromPledges), ctx.gpFMoney0(tot.other)].forEach(function (n) {
    A.contains(shortLine, n, "the compact caption still carries " + n);
  });
  A.contains(fullLine, "from gifts", "the full wording survives for the wider tiers");
  A.contains(fullLine, "from pledges", "and names both sides the long way");
  /* every branch of the compact line is real prose, not a truncation */
  [{ received: 0 }, { received: 5, fromPledges: 0, other: 5 }, { received: 5, fromPledges: 5, other: 0 }]
    .forEach(function (r, i) {
      const line = ctx.gpFSplitLineShort(r);
      A.ok(line.length > 8, "compact caption branch " + i + " is real prose: " + line);
      A.noEmDash(line, "compact caption branch " + i);
    });
  /* the Glance-only layout rules exist and are scoped to Glance */
  ['.gpf-root[data-tier="kpi"] .gl-sub{', '.gpf-root[data-tier="kpi"] .gpf-glance-cap{'].forEach(function (sel) {
    A.contains(shell.css, sel, "the Glance stack rule is declared: " + sel);
  });
  const glSub = /\.gpf-root\[data-tier="kpi"\] \.gl-sub\{([^}]*)\}/.exec(shell.css);
  A.ok(!!glSub, "the Glance pill-row rule was located");
  A.contains(glSub[1], "flex-wrap:nowrap", "the pill row does not wrap at Glance");
  A.contains(glSub[1], "overflow-x:auto", "it scrolls sideways instead");
  /* the date chip's label is allowed its natural width */
  const lab = /\.gpf-root \.gpf-datechip \.fc-label\{([^}]*)\}/.exec(shell.css);
  A.ok(!!lab, "the date-chip label rule was located");
  A.contains(lab[1], "flex:0 0 auto", "the date label does not shrink into an ellipsis");
  /* the stray pseudo-element that printed the word "event" is gone */
  A.absent(shell.css, ".gpf-datechip::before", "the chip no longer adds a text-only pseudo-element");

  /* THE TWO SEGMENTS (owner, 28 Sep): the gifts part is straight where it meets
     the pledge payments and curved at the open end, and each part says its own
     amount on hover through the shell's delegated [data-tip]. */
  const barRow = ctx.gpFTotals(fresh("gpF", { gpFRange: "thru", gpFEnd: "2026-08-19" }));
  const bar = ctx.gpFSplitBar(barRow);
  A.contains(bar, "gpf-seg-pledge", "the bar has a pledge-payments segment");
  A.contains(bar, "gpf-seg-exp", "a white still-expected segment in the middle");
  A.contains(bar, "gpf-seg-other", "and a gifts segment beyond the pledge");
  A.contains(bar, 'data-tip="Pledge payments: ' + ctx.gpFMoney0(barRow.fromPledges) + '"',
    "the pledge segment names its own amount on hover");
  A.contains(bar, 'data-tip="Still expected: ' + ctx.gpFMoney0(ctx.gpFStillExpected(barRow)) + '"',
    "the white segment names what is still expected");
  A.contains(bar, 'data-tip="Gifts: ' + ctx.gpFMoney0(barRow.other) + '"',
    "and the gifts segment names its own amount");
  A.eq((bar.match(/data-tip-plain/g) || []).length, 3, "all three are plain-text tips");
  /* the three shares fill the track and never overflow it, which is what the scale is for */
  const segW = (bar.match(/width:([\d.]+)%/g) || []).map(function (m3) { return parseFloat(/([\d.]+)/.exec(m3)[1]); });
  A.eq(segW.length, 3, "three widths are set");
  A.ok(Math.abs(segW.reduce(function (n, v) { return n + v; }, 0) - 100) < 0.4,
    "and they account for the whole track  (" + segW.join(" + ") + ")");
  /* an over-paid pledge is the case that used to run off the end */
  const over = ctx.gpFPurposeCompute(fresh("gpF", { size: "xwide" }))
    .filter(function (r) { return r.fromPledges > r.pledgeTotal && r.pledgeTotal > 0; })[0];
  A.ok(!!over, "the fixture holds an over-paid purpose");
  const oW = (ctx.gpFSplitBar(over).match(/width:([\d.]+)%/g) || []).map(function (m3) { return parseFloat(/([\d.]+)/.exec(m3)[1]); });
  A.ok(oW.reduce(function (n, v) { return n + v; }, 0) <= 100.4, "and its segments still fit the track  (" + oW.join(" + ") + ")");
  A.eq(oW[1], 0, "with nothing still expected against it");
  /* the amounts on the bar agree with the line printed under it */
  A.contains(ctx.gpFSplitLine(barRow), ctx.gpFMoney0(barRow.fromPledges), "the hover and the printed line agree on pledge payments");
  A.contains(ctx.gpFSplitLine(barRow), ctx.gpFMoney0(barRow.other), "and on other gifts");
  /* the shapes, read off the rules rather than guessed */
  const segOther = /\.gpf-root \.gpf-seg-other\{([^}]*)\}/.exec(shell.css);
  A.ok(!!segOther, "the gifts segment's rule was located");
  A.contains(segOther[1], "border-radius:0 7px 7px 0", "straight on the left, curved on the right");
  const fill = /\.gpf-root \.gpf-fill\{([^}]*)\}/.exec(shell.css);
  A.ok(!!fill, "the base fill rule was located");
  A.contains(fill[1], "border-radius:7px 0 0 7px", "which the pledge segment inherits, curved left and straight right");
  /* the legend swatches take the same classes and must stay square */
  const sw = /\.gpf-root \.gpf-lg-sw\.gpf-seg-pledge,\.gpf-root \.gpf-lg-sw\.gpf-seg-other\{([^}]*)\}/.exec(shell.css);
  A.ok(!!sw, "the legend swatch rule was located");
  A.contains(sw[1], "border-radius:3px", "the legend swatches do not inherit the bar's asymmetric corners");
  /* a gifts-only purpose starts its gift segment at zero; the track clips the
     corner, so no special case is needed and none is pretended */
  const giftsOnlyRow = ctx.gpFPurposeCompute(fresh("gpF", { size: "xwide" }))
    .filter(function (r) { return r.pledgeTotal <= 0 && r.other > 0; })[0];
  A.ok(!!giftsOnlyRow, "the fixture has a gifts-only purpose");
  const gBar = ctx.gpFSplitBar(giftsOnlyRow);
  A.contains(gBar, 'left:0.0%', "its gifts segment starts at the track's left edge");
  const track = /\.gpf-root \.gpf-track\{([^}]*)\}/.exec(shell.css);
  A.contains(track[1], "overflow:hidden", "and the track clips, so that end still reads as rounded");
})();


/* ------------------------------------- 15. the table splits in two (28 Sep, after Edd)

   Owner: "keep the old system exactly as it is, but have a toggle to see the pledges to a
   purpose and then the gifts to a purpose ... one being pledges which is exactly one to one
   with the old pledges currently in the system, and then gifts with money given to a purpose
   but not associated to a pledge." And: "PurposeID is the most important thing ... no other
   number can ever be shown, as for tax reasons this money is very carefully tracked."

   So this section proves three things: the control exists and switches; the Pledges table is
   reproducible from GFPledgeRepository.GetWidgetData's own formulas and holds no gift money;
   and money the legacy repository excludes reaches no figure anywhere. */
(function () {
  const tw = fresh("gpF", { size: "xwide", gpFView: "table" });
  const win = ctx.gpFWindow(tw);

  /* ---- the control, in the header's top right, table view only ---- */
  A.eq(ctx.gpFTblMode(tw), "pledges", "the table opens on Pledges, the read the panel gives today");
  A.eq(ctx.gpFTblMode(fresh("gpF", { gpFTbl: "gifts" })), "gifts", "and remembers the Gifts choice");
  const tHtml = ctx.gpFContent(tw);
  /* The view toggle is alone in the corner, as it was before the split; the Pledges / Gifts
     toggle takes the line below it (owner, 28 Sep). */
  A.contains(tHtml, '<div class="dep-hd-toggle">' + ctx.gpFViewToggle(tw) + '</div>',
    "the view toggle is alone in the corner");
  A.contains(tHtml, '<div class="gpf-tblrow">', "and the table toggle has its own line");
  A.ok(tHtml.indexOf('<div class="gpf-tblrow">') > tHtml.indexOf('class="dep-hd-toggle"'),
    "which sits below it, not beside it");
  A.absent(tHtml, "gpf-toggles", "the cluster that held both is gone");
  A.contains(tHtml, 'data-gpf="tbl" data-id="gpF" data-v="pledges"', "the Pledges segment is there");
  A.contains(tHtml, 'data-gpf="tbl" data-id="gpF" data-v="gifts"', "and the Gifts segment beside it");
  A.contains(tHtml, 'data-v="pledges" aria-pressed="true"', "with the live one pressed");
  A.absent(ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: "goal" })), 'data-gpf="tbl"',
    "the Giving view has no table toggle: nothing to switch there");
  A.absent(ctx.gpFContent(fresh("gpF", { size: "kpi" })), 'data-gpf="tbl"', "and Glance has no controls at all");
  /* the live registry object is shared, so its state is put back */
  const wlive = W("gpF"), view0 = wlive.gpFView, tbl0 = wlive.gpFTbl;
  wlive.gpFView = "table";
  gfire("tbl", { "data-id": "gpF", "data-v": "gifts" });
  A.eq(wlive.gpFTbl, "gifts", "the toggle switches the table read");
  gfire("tbl", { "data-id": "gpF", "data-v": "pledges" });
  A.eq(wlive.gpFTbl, "pledges", "and switches back");
  wlive.gpFView = view0; wlive.gpFTbl = tbl0;

  /* ---- PLEDGES: one to one with GFPledgeRepository.GetWidgetData ---- */
  const rows = ctx.gpFPurposeCompute(tw).filter(function (r) { return r.hasPledges; });
  A.eq(rows.length, 6, "six of the seven purposes have an active pledge");
  rows.forEach(function (r) {
    const pls = ctx.gpFDonorsFor(r.purpose);
    let pt = 0, rec = 0;
    pls.forEach(function (pl) {
      pt += pl.pledge;
      (pl.gifts || []).forEach(function (g) {
        if (g.posted !== false && g.undone !== true && g.date <= win.end) rec += g.amount;
      });
    });
    A.near(r.pledgeTotal, pt, 0.02, r.code + ": Pledge Total is Sum(Pledge) over the active pledges");
    A.near(r.fromPledgesThru, rec, 0.02, r.code + ": Received is the posted, not-undone, pledge-linked money to the thru date");
    A.near(r.dueRem, r.pledgeDue - r.fromPledgesThru, 0.02, r.code + ": Due Remaining is Pledge Due minus Received");
    A.near(r.percentDue, r.dueRem / r.pledgeDue, 0.0001, r.code + ": Percent Due is Due Remaining over Pledge Due");
    /* the legacy routine returns the whole pledge once the date is past EndDate */
    pls.filter(function (pl) { return pl.end <= win.end; }).slice(0, 3).forEach(function (pl) {
      const pace = ctx.gpFDonorPace(pl, ctx.gpFParse(win.end), win.end, win);
      A.near(pace.due, pl.pledge, 0.01, r.code + ": a pledge past its end date is fully due");
    });
  });
  /* the pledged side is blind to the window START, which is what keeps the mode one to one */
  const ytd = fresh("gpF", { size: "xwide", gpFView: "table", gpFRange: "ytd" });
  const ytdRows = ctx.gpFPurposeCompute(ytd).filter(function (r) { return r.hasPledges; });
  ytdRows.forEach(function (r, i) {
    A.eq(r.pledgeTotal, rows[i] && rows[i].pledgeTotal, r.code + ": Pledge Total is the same under Year to date");
    A.eq(r.fromPledgesThru, rows[i] && rows[i].fromPledgesThru, r.code + ": and so is the legacy Received");
  });
  A.ok(ytdRows.some(function (r, i) { return rows[i] && r.fromPledges < rows[i].fromPledges; }),
    "while the windowed figure Giving reads DOES narrow, so the two are genuinely different reads");

  /* ---- no gift money anywhere in the Pledges table ---- */
  const pTable = ctx.gpFPledgesTable(tw, false);
  const giftsOnly = ctx.gpFPurposeCompute(tw).filter(function (r) { return !r.hasPledges; })[0];
  A.ok(!!giftsOnly && giftsOnly.other > 0, "the fixture holds a purpose with gifts and no pledge");
  /* it mirrors the real dev database, where the equivalent row PERMITS pledges and simply has
     none active. The AllowPledges column is honoured too, which nothing in the fixture needs,
     so it is exercised directly rather than left to be assumed. */
  A.ok(giftsOnly.purpose.allowPledges !== false,
    "and it permits pledges, which is the shape the real data holds: no ACTIVE pledge, not a ban on pledging");
  A.eq(ctx.gpFDonorsFor({ code: "NOPLEDGE", allowPledges: false, pledgeTotal: 50000 }).length, 0,
    "a purpose whose AllowPledges is false has no pledge set at all");
  A.absent(pTable, giftsOnly.label,
    "it cannot appear in the Pledges table, exactly as it cannot appear in the panel");
  rows.forEach(function (r) {
    if (r.other > 0 && r.totalIn !== r.fromPledgesThru) {
      A.absent(pTable, ctx.gpFMoney(r.totalIn), r.code + ": no blended figure in the Pledges table");
    }
  });
  const pTot = ctx.gpFSumRows(rows);
  A.contains(pTable, ctx.gpFMoney(pTot.fromPledgesThru), "the totals row sums the pledge-linked money");
  A.contains(pTable, "Total (6 purposes)", "and counts only the rows it shows");
  A.headMatchesBody(pTable, "the Pledges header cells sit over their columns (D12)");

  /* ---- GIFTS: the money with no pledge behind it ---- */
  const gw = fresh("gpF", { size: "xwide", gpFView: "table", gpFTbl: "gifts" });
  const gRows = ctx.gpFPurposeCompute(gw).filter(function (r) { return r.giftN > 0; });
  const gTable = ctx.gpFGiftsTable(gw, false);
  A.eq((gTable.match(/gpf-sumrow/g) || []).length, gRows.length, "one row per purpose with unpledged gifts");
  A.ok(gRows.some(function (r) { return !r.hasPledges; }), "including the purpose that takes no pledges");
  A.ok(gRows.some(function (r) { return r.hasPledges; }), "and purposes that take pledges as well");
  ["Pledge Total", "Pledge Due", "Due Remaining", "Percent Due"].forEach(function (h) {
    A.absent(gTable, h, "no pledge column in the Gifts table: " + h);
  });
  ["Gifts", "Donors", "Total"].forEach(function (h) {
    A.contains(gTable, ">" + h + "<", "the Gifts table has its " + h + " column");
  });
  A.absent(gTable, "Last gift", "and no Last gift column (owner, 28 Sep)");
  A.absent(gTable, "lastGift", "with nothing left in the model feeding one");
  /* OWNER OVERRIDE OF D12, which puts counts and amounts on the right: this table reads from
     the left throughout, header and data alike (owner, 28 Sep, after asking for centred
     headers first and then changing it). Header and body carry identical classes again, so
     headMatchesBody applies to this table once more. */
  const gHeadCells = (/<div class="wt-row wt-head[\s\S]*?(?=<div class="wt-row gpf-trow)/.exec(gTable) || [""])[0];
  const gRowCells = /<div class="wt-row gpf-trow[\s\S]*?(?=<div class="wt-row gpf-trow|$)/.exec(gTable)[0];
  A.eq((gHeadCells.match(/gpf-c-lft/g) || []).length, 4, "every Gifts header cell reads from the left");
  A.eq((gRowCells.match(/gpf-c-lft/g) || []).length, 4, "and so does every cell of a row");
  A.absent(gTable, "gpf-c-ctr", "nothing in this table is centred any more");
  A.absent(shell.css, "gpf-c-ctr", "and the centring rule went with it");
  A.headMatchesBody(gTable, "the Gifts header cells carry their column's own classes (D12 shape)");
  /* the three data cells are still the same width slots as the header's */
  const widths = function (h) { return (h.match(/gpf-c-nm|gpf-c-n(?![a-z])/g) || []).join(","); };
  A.eq(widths(gHeadCells), widths(gRowCells),
    "header and body share their width classes, so the columns line up  (" + widths(gHeadCells) + ")");
  /* the middle bar segment is a token neutral, not the card's own white: on a white card,
     white read as a hole rather than as the share still expected (owner, 28 Sep) */
  A.contains(shell.css, ".gpf-root .gpf-seg-exp{background:var(--wn-400)",
    "the still-expected segment takes a token grey");
  A.absent(shell.css, "gpf-seg-exp{background:var(--surface-widget)", "and not the card's white");
  /* the toggle line spans the header grid, or right-aligning it stops at the middle of the card */
  A.contains(shell.css, ".gpf-root .gpf-tblrow{grid-column:1/-1;display:flex;justify-content:flex-end;}",
    "the toggle line spans the header grid and aligns to the card's right edge");
  A.contains(shell.css, ".dep-hd{display:grid;grid-template-columns:1fr auto",
    "which is only correct while the header is that two-column grid");
  const gTot = ctx.gpFSumRows(gRows);
  A.contains(gTable, ctx.gpFMoney(gTot.other), "the totals row sums the unpledged money");
  A.eq(gTot.giftN, gRows.reduce(function (n, r) { return n + r.giftN; }, 0), "gift counts add up");
  A.ok(gTot.giftDonors > 0 && gTot.giftDonors <= gRows.reduce(function (n, r) { return n + r.giftDonors; }, 0),
    "donors are counted once each across purposes, so the total is no larger than the sum of the rows");
  A.contains(gTable, 'data-f="gifts"', "a Gifts row opens the ledger already filtered to gifts");
  gfire("baropen", { "data-id": "gpF", "data-c": gRows[0].label, "data-f": "gifts" });
  const gModal = shim.captured["gpfModalRoot"] || "";
  A.ok(gModal.length > 0, "and the pop-up opens from a Gifts row");
  A.contains(gModal, 'data-v="gifts" aria-pressed="true"',
    "with the ledger's own Gifts filter already applied");
  gfire("detail-close", { "data-id": "gpF" });

  /* ---- the money the legacy repository excludes reaches no figure ---- */
  const purpose = ctx.gpFCampByLabel(tw, LABELS[2]);
  const allGifts = ctx.gpFOtherGiftsFor(purpose);
  const unposted = allGifts.filter(function (g) { return g.posted === false; });
  const undone = allGifts.filter(function (g) { return g.undone === true; });
  const future = allGifts.filter(function (g) { return g.date > win.end; });
  A.eq(unposted.length, 1, "the fixture seeds an unposted gift");
  A.eq(undone.length, 1, "and an undone gift");
  A.eq(future.length, 1, "and one dated past the as-of anchor");
  const row2 = ctx.gpFPurposeCompute(tw).filter(function (r) { return r.label === LABELS[2]; })[0];
  const counted = allGifts.filter(function (g) { return ctx.gpFCounts(g, win); });
  A.eq(counted.length, allGifts.length - 3, "exactly those three are excluded by the counting rule");
  A.near(row2.other, counted.reduce(function (n, g) { return n + g.amount; }, 0), 0.02,
    "the purpose's gift figure counts only the countable lines");
  A.eq(row2.giftN, counted.length, "and so does its gift count");
  const led2 = ctx.gpFLedgerRows(tw, purpose, win);
  [unposted[0], undone[0], future[0]].forEach(function (g) {
    A.ok(!ctx.gpFCounts(g, win), "excluded from every figure: " + g.id);
    A.ok(led2.every(function (it) { return it.id !== g.id; }), "and unreachable in the ledger: " + g.id);
  });
  /* the countable gifts still tie to the fixture's own figure, which is what proves the
     excluded lines are extra money rather than a re-slicing of the same money */
  A.near(row2.other, purpose.otherGifts, 0.02, "the countable gifts sum to the purpose's seeded gift total");
})();


/* ------------------------- 16. what a Giving row states, and the table's own lines (owner)

   The owner, after seeing the split build: "the percentage number should go and just show how
   much has currently been given to a purpose", and "what below of the purpose giving bars to
   be: total given to a purpose, how much from pledges, how much from gifts, and then how much
   more is expected". So a row carries money and nothing else: no share of anything. */
(function () {
  const w = fresh("gpF", { size: "xwide", gpFView: "goal" });
  const bars = ctx.gpFGivingBars(w);
  const row = ctx.gpFPurposeCompute(w).filter(function (r) { return r.pledgeTotal > 0 && r.other > 0; })[0];
  A.ok(!!row, "a purpose with both a pledge and unpledged gifts was found");
  /* no percentage anywhere on the bars, at any preset */
  A.ok(!/\d%/.test(bars.replace(/width:[\d.]+%|left:[\d.]+%/g, "")),
    "no percentage is printed on a Giving row");
  A.absent(bars, "% paid", "the old labelled percent is gone");
  A.absent(bars, "paid against", "and its tooltip with it");
  /* the row states the money given, top right, where the percent used to be */
  A.contains(bars, '<span class="gpf-p-pct" style="color:', "the row keeps its right-hand slot");
  A.contains(bars, ctx.gpFMoney0(row.totalIn), "and states the money given to the purpose");
  /* the line under the bar accounts for that money in the owner's own order */
  const foot = ctx.gpFBarFoot(row);
  A.contains(foot, ctx.gpFMoney0(row.totalIn) + " given", "the foot line opens with the total given");
  A.contains(foot, ctx.gpFMoney0(row.fromPledges) + " from pledges", "then what came through pledges");
  A.contains(foot, ctx.gpFMoney0(row.other) + " from gifts", "then what came as gifts");
  A.contains(foot, ctx.gpFMoney0(ctx.gpFStillExpected(row)) + " still expected", "then what is still expected");
  A.ok(foot.indexOf("given") < foot.indexOf("from pledges") &&
       foot.indexOf("from pledges") < foot.indexOf("from gifts") &&
       foot.indexOf("from gifts") < foot.indexOf("still expected"), "in that order");
  A.contains(bars, foot, "and the row renders exactly that line");
  /* the parts account for the whole: given is pledges plus gifts */
  A.near(row.fromPledges + row.other, row.totalIn, 0.02, "the two sources sum to the money given");
  A.near(ctx.gpFStillExpected(row), Math.max(0, row.pledgeTotal - row.fromPledges), 0.02,
    "and still expected is the pledge less what it has brought in, never below zero");
  const overPaid = ctx.gpFPurposeCompute(w).filter(function (r) { return r.fromPledges > r.pledgeTotal && r.pledgeTotal > 0; })[0];
  A.eq(ctx.gpFStillExpected(overPaid), 0,
    "an over-paid pledge expects nothing more, rather than a negative figure");
  /* a purpose with no pledge says so rather than showing a zero it cannot justify */
  const giftsOnlyRow = ctx.gpFPurposeCompute(w).filter(function (r) { return !r.hasPledges; })[0];
  A.contains(ctx.gpFBarFoot(giftsOnlyRow), "no pledge on this purpose",
    "a purpose with no pledge says so instead of showing nothing still expected");
  A.absent(ctx.gpFBarFoot(giftsOnlyRow), "still expected", "and claims nothing is owed to it");
  /* the legend names the three segments the bar draws, and no more */
  const t16 = ctx.gpFTotals(w);
  ["Pledge payments", "Still expected", "Gifts"].forEach(function (n) {
    A.contains(bars, ">" + n + "<", "the legend names " + n);
  });
  A.contains(bars, ctx.gpFMoney0(ctx.gpFStillExpected(t16)), "and totals what is still expected");
  A.absent(bars, "Still to arrive against pledges", "the old wording is gone");

  /* THE PLEDGES ROW HAS NO SUB-LINE. Measured: the name cell is 81px there, its sub-line
     had about 57px of usable width, and the shortest honest wording needed 68px. It also put
     a second percentage beside Percent Due, two numbers about one pledge. The panel's own row
     has none either, and this mode exists to match it. */
  const pTbl = ctx.gpFPledgesTable(fresh("gpF", { size: "xwide", gpFView: "table" }), false);
  A.absent(pTbl, "gpf-nmsub", "the Pledges row carries no sub-line");
  A.contains(pTbl, "gpf-nm\">", "only the purpose name, which has the cell to itself");
  A.eq((pTbl.match(/class="gpf-c-n gpf-c-pct"/g) || []).length, 8,
    "and exactly one percent cell per row plus the header and the totals line, so Percent Due stands alone");
  /* PERCENT DUE IS A DETAIL COLUMN. Measured: with it at Explore the purpose name had 57px
     of the 166px it needs. It is derivable from two columns in the same row, and it stays in
     every row's screen-reader line at every size, so nothing is lost, only moved. */
  const pWide = ctx.gpFPledgesTable(fresh("gpF", { size: "wide", gpFView: "table" }), false);
  A.absent(pWide, "Percent Due", "Explore drops the Percent Due column");
  A.absent(pWide, "gpf-c-pct", "and its cells with it, header, rows and totals alike");
  A.contains(pWide, "percent due ", "while every row still says it to a screen reader");
  A.contains(pTbl, "Percent Due", "Detail keeps the column");
  ["Pledge Total", "Pledge Due", "Received", "Due Remaining"].forEach(function (h) {
    A.contains(pWide, ">" + h + "<", "and Explore keeps every money column: " + h);
  });
  A.headMatchesBody(pWide, "the header still sits over its columns with one fewer of them (D12)");

  /* the Gifts row keeps its own, which fits: measured 114px of text in a 114px slot */
  const gSub = /gpf-nmsub">([^<]*)</.exec(ctx.gpFGiftsTable(fresh("gpF", { size: "xwide", gpFView: "table", gpFTbl: "gifts" }), false));
  A.ok(!!gSub && gSub[1].length <= 20, "the Gifts sub-line is short enough for its cell  (" + (gSub && gSub[1]) + ")");
  A.ok(["Also has pledges", "No pledges"].indexOf(gSub[1]) > -1,
    "and says the one thing the Gifts columns do not  (" + gSub[1] + ")");
})();


/* ---------------------------------------------------------------- report */
process.exit(A.report());
