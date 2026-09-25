/* =====================================================================
   w15-bank-mb.driver.js , verification driver for the W15 Bank Balances port.

   FIRST-EVER port of this widget, 2026-09-08, onto Jo's phase-2 @ 71ca056.
   Runs the REAL bkF block, lifted verbatim out of index.html, inside the
   shared harness's DOM shim, and drives its OWN delegated listeners.

   What this driver is built to catch, in the order the Step 4 doc and the
   Step 5 v2 spec rank the risks:
     1. a total or a bar scale that MOVES WHEN THE PAGE TURNS (named in Step 5
        v2 as this widget's single most likely defect),
     2. an overdrawn COUNT computed over the filtered set or the page instead
        of the whole active set,
     3. sortable column headers reappearing (open item 7 keeps them unbuilt),
     4. any of the five removed affordances coming back (download, search,
        drill overlay, per-bar hover card, Load more),
     5. Jo's own bank widget being modified in any way.

   Run from this folder:  node w15-bank-mb.driver.js
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const START = '/* ===== W15 Bank Balances V2 JS , prefix bkF , kind "bank-mb" =';
const END = "/* ===== end W15 Bank Balances V2 ===== */";
const KIND = "bank-mb";

const shell = H.loadShell();
const block = H.extractRegion(shell.script, START, END);
const registry = H.extractRegistry(shell.script, KIND);
const A = new H.Assert("W15 bank-mb");

/* The block reads per-widget state off the registry object and calls the
   shell's global render(), so the harness's find()/render() are exactly what
   it needs. dataAttr is ours, so nothing here can reach Jo's data-action
   dispatcher and nothing of hers can reach ours. */
const env = H.runBlock(block, { registry: registry, dataAttr: "data-bkf" });
const shim = env.shim;
const Q = (n) => env.get(n);

/* Our handler guards on t.closest(".bkf-root"), so a synthetic target has to
   carry the root class as well as the data attribute. The harness's fire()
   sets no className, so this driver dispatches its own targets. */
function fireBkf(action, attrs) {
  const bag = Object.assign({}, attrs || {}, { "data-bkf": action });
  const t = shim.mkTarget(bag, "button", "bkf-root");
  const ev = { target: t, preventDefault() {}, stopPropagation() {} };
  (shim.listeners.click || []).forEach((fn) => fn(ev));
  return ev;
}
function w(id) { return registry.filter((r) => r.id === id)[0]; }
function content(reg) { return env.call("bkFContent", reg); }
/* A fresh throwaway registry-shaped object, so a probe cannot leak state into
   the demo entries the later assertions read. */
function probe(over) {
  return Object.assign({ id: "bkF", dataset: undefined, bkFAcct: null, bkFView: "table",
                         bkFPage: 0, bkFOver: false, bkFSort: "nm-asc", size: "wide" }, over || {});
}

/* ---------------------------------------------------------------- 1. shape */
A.eq(registry.length, 7, "seven bank-mb registry entries");
registry.forEach((r) => {
  A.eq(r.kind, KIND, r.id + ": kind is bank-mb");
  A.contains(r.title, "(OC", r.id + ": title carries the (OC convention");
  A.noEmDash(r.title, r.id + " title");
  A.ok(Array.isArray(r.tiers) && r.tiers.length === 3, r.id + ": all three tiers offered");
  /* No download at any size: the control was removed 2026-09-04, so no entry
     may carry the actions array that drives Jo's export menu. */
  A.ok(!r.actions, r.id + ": no actions array, so no download menu");
});
["bkF", "bkF_k", "bkF_x", "bkF2", "bkF3", "bkF4", "bkF5"].forEach((id) =>
  A.ok(!!w(id), "registry entry " + id + " present"));
A.eq(w("bkF_k").size, "kpi", "bkF_k is the Glance demo");
A.eq(w("bkF_x").size, "xwide", "bkF_x is the Detail demo");
A.eq(w("bkF2").bkFView, "bars", "bkF2 demos the bar chart");
A.eq(w("bkF3").bkFAcct, "BA-1042", "bkF3 demos Single Account mode");
A.eq(w("bkF4").bkFOver, true, "bkF4 demos the Overdrawn-only filter");
A.eq(w("bkF5").dataset, "empty", "bkF5 demos the no-accounts state");

/* ------------------------------------------------- 2. data and derivations */
const ACC = Q("BKF_ACCOUNTS");
A.eq(ACC.length, 52, "52 accounts, enough to force five pages at size 12");
A.eq(Q("BKF_PAGE_SIZE"), 12, "page size is 12");
A.eq(Q("BKF_SORTABLE").length, 1, "sort whitelist has exactly one member");
A.eq(Q("BKF_SORTABLE")[0], "nm", "the only sortable key is the account name");
A.eq(Q("BKF_BREAKDOWN").length, 7, "seven structural breakdown rows");
A.eq(Q("BKF_CATEGORIES").length, 4, "four activity categories");
A.eq(Q("BKF_VIEWS").length, 2, "TWO presentations only: Account Cards was removed 2026-09-04");
A.eq(Q("BKF_VIEWS")[0].k, "table", "Table is the first and default presentation");
/* The source array must NOT be pre-sorted, or every ordering assertion below
   would pass without the ordering code ever running. */
const names = ACC.map((a) => a.nm);
A.ok(String(names) !== String(names.slice().sort((x, y) => x.localeCompare(y))),
  "source array is deliberately NOT in name order");
/* EFT is deliberately not one of the four categories, and the two boundary
   balances are not activity. */
const catKeys = Q("BKF_CATEGORIES").map((c) => c.k);
A.absent(String(catKeys), "eft", "EFT is not one of the four activity categories");
A.absent(String(catKeys), "beg", "beginning balance is not an activity category");
A.absent(String(catKeys), "end", "ending balance is not an activity category");
/* Ending = beginning plus all five activity types, using the STORED signs. */
const a0 = ACC[0];
A.near(env.call("bkFEnding", a0),
  a0.beg + a0.dep + a0.vd + a0.chk + a0.wdr + a0.eft, 0.001,
  "ending balance is beginning plus all five activity types");
A.ok(a0.chk < 0 && a0.wdr < 0, "checks and withdrawals are STORED negative");
/* The sign flip is display only: magnitude is positive, the stored value is not. */
A.ok(env.call("bkFMagnitude", a0, "chk") > 0, "chart magnitude of checks is positive");
A.ok(env.call("bkFActivity", a0, "chk") < 0, "stored value of checks stays negative");
A.eq(env.call("bkFMagnitude", a0, "chk"), Math.abs(a0.chk), "magnitude is the absolute stored value");
/* Overdrawn = ending balance strictly less than zero. */
const negs = ACC.filter((a) => env.call("bkFEnding", a) < 0);
A.eq(negs.length, 7, "seven accounts are overdrawn in the fixture");
A.ok(ACC.every((a) => (env.call("bkFEnding", a) < 0) === (negs.indexOf(a) > -1)),
  "overdrawn is exactly: ending balance strictly less than zero");
A.eq(ACC.filter((a) => !a.rec).length, 3, "three accounts have never been reconciled");

/* ------------------------------------- 3. the server contract: paging rules */
const p0 = env.call("bkFServerQuery", probe());
A.eq(p0.totalCount, 52, "totalCount is the whole set, not the page");
A.eq(p0.rows.length, 12, "a page carries exactly pageSize rows");
A.eq(p0.pageCount, 5, "52 accounts over size 12 is five pages");
A.eq(p0.pageIndex, 0, "page index starts at 0");
A.eq(p0.sortBy, "nm", "sortBy echoes the applied key");
A.eq(p0.sortDir, "asc", "sortDir echoes the applied direction");
/* Server ORDERING: alphabetical by name, ending in a unique id tiebreaker. */
const allRows = [];
for (let p = 0; p < p0.pageCount; p++) allRows.push(...env.call("bkFServerQuery", probe({ bkFPage: p })).rows);
A.eq(allRows.length, 52, "paging through every page yields every account exactly once");
A.eq(new Set(allRows.map((r) => r.id)).size, 52, "no account is repeated or skipped across pages");
A.ok(allRows.every((r, i) => i === 0 || allRows[i - 1].nm.localeCompare(r.nm) <= 0),
  "rows are ordered alphabetically by account name across the whole set");
/* THE DEFECT STEP 5 v2 RANKS FIRST: totals must not move when the page turns. */
for (let p = 1; p < p0.pageCount; p++) {
  const pn = env.call("bkFServerQuery", probe({ bkFPage: p }));
  A.eq(pn.totals.ending, p0.totals.ending, "page " + (p + 1) + ": combined total is unchanged");
  A.eq(pn.totalCount, p0.totalCount, "page " + (p + 1) + ": totalCount is unchanged");
  A.eq(pn.overdrawnCount, p0.overdrawnCount, "page " + (p + 1) + ": overdrawn count is unchanged");
  A.eq(pn.totals.maxEnding, p0.totals.maxEnding, "page " + (p + 1) + ": bar scale max is unchanged");
  A.eq(pn.totals.minEnding, p0.totals.minEnding, "page " + (p + 1) + ": bar scale min is unchanged");
}
/* The total is the FULL SET sum, never a page sum. */
const fullSum = ACC.reduce((s, a) => s + env.call("bkFEnding", a), 0);
A.near(p0.totals.ending, fullSum, 0.01, "combined total sums every account, not the page");
const pageSum = p0.rows.reduce((s, a) => s + env.call("bkFEnding", a), 0);
A.ok(Math.abs(p0.totals.ending - pageSum) > 1, "the total is provably NOT the page sum");
/* Rule 3, the clamp, in both directions and on junk. */
A.eq(env.call("bkFServerQuery", probe({ bkFPage: 99 })).pageIndex, 4, "a page past the end clamps to the last page");
A.eq(env.call("bkFServerQuery", probe({ bkFPage: -7 })).pageIndex, 0, "a negative page clamps to the first page");
A.eq(env.call("bkFServerQuery", probe({ bkFPage: "zz" })).pageIndex, 0, "a non-numeric page clamps to the first page");
A.eq(env.call("bkFServerQuery", probe({ bkFPage: 2.7 })).pageIndex, 2, "a fractional page floors");
/* Rule 1, the whitelist: an unknown key falls back and is never trusted. */
const bad = env.call("bkFServerQuery", probe({ bkFSort: "balance-desc" }));
A.eq(bad.sortBy, "nm", "an unknown sortBy falls back to the name key");
A.eq(bad.sortDir, "asc", "an unknown sortBy falls back to ascending");
A.eq(String(bad.rows.map((r) => r.id)), String(p0.rows.map((r) => r.id)),
  "an unknown sortBy serves the default ordering, not an arbitrary one");
A.eq(env.call("bkFServerQuery", probe({ bkFSort: "nm-desc" })).sortDir, "desc",
  "a whitelisted key with desc is honoured (the parameter exists even though no UI sets it)");

/* ------------------------------------- 4. the overdrawn chip and its filter */
A.eq(p0.overdrawnCount, 7, "overdrawn count is 7 over the whole active set");
A.eq(p0.overdrawnOnly, false, "the filter is off by default");
const of1 = env.call("bkFServerQuery", probe({ bkFOver: true }));
A.eq(of1.overdrawnOnly, true, "the applied filter is echoed back");
A.eq(of1.totalCount, 7, "with the filter on, totalCount follows the FILTERED population");
A.eq(of1.rows.length, 7, "with the filter on, only the overdrawn accounts are served");
A.eq(of1.pageCount, 1, "with the filter on, pageCount follows the filtered population");
A.ok(of1.rows.every((r) => env.call("bkFEnding", r) < 0), "every filtered row is genuinely overdrawn");
/* THE COUNT SPANS THE WHOLE ACTIVE SET even while the filter narrows the rows.
   Counting the filtered set would make the chip circular. */
A.eq(of1.overdrawnCount, 7, "the overdrawn COUNT still spans the whole active set, not the filtered set");
/* The filtered total is the overdrawn subtotal, not the org total. */
A.ok(of1.totals.ending !== p0.totals.ending, "the filtered total is the overdrawn subtotal, not the org total");
A.near(of1.totals.ending, negs.reduce((s, a) => s + env.call("bkFEnding", a), 0), 0.01,
  "the filtered total sums exactly the overdrawn accounts");
/* A stale page index against the shrunk set is clamped, not stranded. */
A.eq(env.call("bkFServerQuery", probe({ bkFOver: true, bkFPage: 4 })).pageIndex, 0,
  "a stale page index against the shrunk filtered set clamps to page 1");
/* The chip renders only when something is actually overdrawn, and it names the state. */
const chipOff = env.call("bkFOverdrawnChip", probe(), p0);
const chipOn = env.call("bkFOverdrawnChip", probe({ bkFOver: true }), of1);
A.contains(chipOff, "7 overdrawn", "the chip reads the count when the filter is off");
A.contains(chipOn, "7 overdrawn only", "the chip names what is being shown when the filter is on");
A.contains(chipOff, 'aria-pressed="false"', "the chip carries its state as aria-pressed, not colour alone");
A.contains(chipOn, 'aria-pressed="true"', "the pressed chip carries aria-pressed true");
A.contains(chipOn, "close", "a close glyph appears only when the filter is on, so clearing it is discoverable");
A.absent(chipOff, "close", "no close glyph while the filter is off");
A.contains(chipOff, "bank-odchip", "the chip reuses Jo's own .bank-odchip component");
A.eq(env.call("bkFOverdrawnChip", probe(), { overdrawnCount: 0 }), "",
  "a zero overdrawn count renders NO chip, never a red alarm about nothing");
A.eq(env.call("bkFOverdrawnChip", probe(), null), "", "no response renders no chip");

/* --------------------------------- 5. both presentations at every tier */
const TIERS = ["kpi", "wide", "xwide"];
const VIEWS = ["table", "bars"];
TIERS.forEach((size) => {
  VIEWS.forEach((view) => {
    const html = content(probe({ size: size, bkFView: view }));
    A.ok(html && html.length > 200, size + "/" + view + ": renders substantive markup");
    A.contains(html, 'class="bkf-root bkf-w"', size + "/" + view + ": our namespaced root");
    A.contains(html, 'data-tier="' + size + '"', size + "/" + view + ": carries data-tier");
    if (size === "kpi") {
      /* Glance: one figure, no controls of any kind. */
      A.contains(html, "kpi-row", "kpi/" + view + ": Glance renders the single KPI figure");
      A.absent(html, "vtoggle", "kpi/" + view + ": Glance has NO view switch");
      A.absent(html, "bank-odchip", "kpi/" + view + ": Glance has NO overdrawn chip");
      A.absent(html, 'data-bkf="acct"', "kpi/" + view + ": Glance has NO account control");
      A.absent(html, "bkf-pager", "kpi/" + view + ": Glance has no pager");
    } else {
      A.contains(html, "dep-hd", size + "/" + view + ": reuses Jo's two-row header grid");
      A.contains(html, 'data-bkf="acct"', size + "/" + view + ": the account control is live");
      A.contains(html, "vtoggle", size + "/" + view + ": Switch View is offered in All Accounts mode");
      A.contains(html, "bkf-pager", size + "/" + view + ": the pager renders over 52 accounts");
      if (view === "table") {
        A.contains(html, 'class="bkf-tbl"', size + "/table: the balance table renders");
        A.contains(html, 'scope="col"', size + "/table: real th plus scope column headers");
        A.contains(html, "dep-total", size + "/table: the totals row renders");
        A.absent(html, "bank-hb-row", size + "/table: no bars in the table view");
      } else {
        A.contains(html, "bank-hb-row", size + "/bars: Jo's diverging bar rows render");
        A.contains(html, "bank-hb-zero", size + "/bars: the ZERO AXIS renders on every row");
        A.contains(html, "bkf-hb-head", size + "/bars: the bar chart has labelled columns");
        A.absent(html, 'class="bkf-tbl"', size + "/bars: no table element in the bars view");
      }
    }
  });
});

/* -------------------------- 6. the diverging bar: axis and full-set scaling */
const barsP0 = env.call("bkFBalanceBars", probe({ bkFView: "bars" }), p0);
const barsP2 = env.call("bkFBalanceBars", probe({ bkFView: "bars", bkFPage: 2 }),
  env.call("bkFServerQuery", probe({ bkFPage: 2 })));
function zeroPct(html) {
  const m = /bank-hb-zero" style="left:([0-9.]+)%/.exec(html);
  return m ? m[1] : null;
}
A.ok(zeroPct(barsP0) !== null, "the zero axis is positioned as a percentage");
A.eq(zeroPct(barsP2), zeroPct(barsP0),
  "THE ZERO AXIS SITS IN THE SAME PLACE ON EVERY PAGE, because it is scaled to the full set");
/* The axis is genuinely between the extremes, not pinned at an edge. */
const zp = parseFloat(zeroPct(barsP0));
A.ok(zp > 0 && zp < 100, "the zero axis is inside the track, so both sides can be read");
/* Scale derives from the SERVER's full-set extremes. */
const expZero = (-p0.totals.minEnding) / ((p0.totals.maxEnding) + (-p0.totals.minEnding)) * 100;
A.near(zp, expZero, 0.01, "the axis position is computed from the server's full-set min and max");
A.ok(p0.totals.minEnding < 0, "the full-set minimum is negative, so the left side is real");
A.ok(p0.totals.maxEnding > 0, "the full-set maximum is positive, so the right side is real");
/* An overdrawn bar grows LEFT of the axis, an in-credit bar RIGHT of it. */
const negOnly = env.call("bkFBalanceBars", probe({ bkFOver: true }), of1);
A.contains(negOnly, "bank-hb-fill neg", "an overdrawn bar carries the negative fill class");
A.contains(negOnly, "right:", "an overdrawn bar is anchored to the RIGHT edge, growing leftward");
A.contains(barsP0, "left:", "an in-credit bar is anchored at the axis, growing rightward");
/* Colour is never the only signal on a bar. */
A.contains(negOnly, "Overdrawn", "an overdrawn bar states the word Overdrawn");
A.contains(negOnly, "bank-hb-warn", "an overdrawn bar carries a warning glyph");
A.contains(barsP0, "grows right of the zero axis", "the legend states in words which side means what");
A.contains(barsP0, "grows left of the zero axis", "the legend states the overdrawn side in words");
/* Every value is text in the DOM, never hover only. */
const barVals = (barsP0.match(/bank-hb-val/g) || []).length;
A.ok(barVals >= 12, "every bar carries its value as text beside it");
A.eq((barsP0.match(/sr-only/g) || []).length >= 12, true, "every bar repeats its value for screen readers");

/* ------------------------------------------- 7. the pager reads the response */
const pager = env.call("bkFPager", probe(), p0);
A.contains(pager, "1 to 12 of 52 accounts", "the pager states the served window and the full count");
A.contains(pager, "Page 1 of 5", "the pager states which page of how many");
A.contains(pager, 'data-bkf="page-prev"', "a Previous page control exists");
A.contains(pager, 'data-bkf="page-next"', "a Next page control exists");
A.contains(pager, "disabled", "Previous is disabled on the first page");
const pagerLast = env.call("bkFPager", probe({ bkFPage: 4 }), env.call("bkFServerQuery", probe({ bkFPage: 4 })));
A.contains(pagerLast, "49 to 52 of 52 accounts", "the last page states a short final window");
A.contains(pagerLast, "Page 5 of 5", "the last page names itself");
/* Below one page there is no pager at all. */
A.eq(env.call("bkFPager", probe({ bkFOver: true }), of1), "",
  "with only 7 filtered rows there is no pager, because there is one page");
A.contains(env.call("bkFPager", probe(), Object.assign({}, of1, { totalCount: 30, pageCount: 3, overdrawnOnly: true })),
  "overdrawn accounts", "a filtered pager says the rows it counts are overdrawn");

/* -------------------------------------- 8. Single Account mode, seven rows */
const single = probe({ bkFAcct: "BA-1042", size: "wide" });
A.eq(env.call("bkFIsAllMode", single), false, "selecting an account leaves All Accounts mode");
const acc = env.call("bkFAccountQuery", single);
A.eq(acc.rows.length, 7, "the breakdown is exactly seven rows");
A.eq(String(acc.rows.map((r) => r.k)), "beg,dep,vd,chk,wdr,eft,end",
  "the seven rows are in their FIXED structural order");
const sHtml = content(single);
A.contains(sHtml, "Beginning Balance", "row 1 is the beginning balance");
A.contains(sHtml, "Ending Balance", "row 7 is the ending balance");
["Deposits", "Voids", "Checks", "Withdrawals", "EFT"].forEach((l) =>
  A.contains(sHtml, l, "the breakdown lists " + l));
A.contains(sHtml, "bank-anchor", "the beginning balance uses Jo's muted anchor treatment");
A.contains(sHtml, "bkf-brk-end", "the ending balance carries the closing-figure treatment");
A.contains(sHtml, "there is no separate totals row", "the build states WHY there is no totals row");
/* No totals row: ending balance already IS the total. */
A.absent(sHtml, "dep-total", "Single Account mode has NO totals row, because row 7 is the total");
A.near(acc.rows[6].v, acc.rows.slice(0, 6).reduce((s, r) => s + r.v, 0), 0.001,
  "the ending balance equals the beginning balance plus all five activity rows");
/* The view switch is not offered where it would be a dead control. */
A.absent(sHtml, "vtoggle", "Single Account mode offers NO view switch, because it has one presentation");
A.contains(sHtml, 'data-bkf="acct"', "the account control stays live in Single Account mode");
/* Beginning-balance provenance is stated, both ways. */
A.contains(sHtml, "ending balance of the last reconciliation", "a reconciled account names its beginning-balance source");
const never = content(probe({ bkFAcct: "BA-1023" }));
A.contains(never, "never been reconciled", "a never-reconciled account names its opening balance instead");
A.eq(env.call("bkFAccountQuery", probe({ bkFAcct: "BA-1023" })).beginningFromReconciliation, false,
  "the never-reconciled flag is carried in the response");
/* An account id that no longer resolves falls back rather than rendering empty. */
A.eq(env.call("bkFIsAllMode", probe({ bkFAcct: "NOPE" })), true,
  "an unresolvable account id falls back to All Accounts mode");
A.eq(env.call("bkFAccountQuery", probe({ bkFAcct: "NOPE" })), null, "an unresolvable account yields no breakdown");

/* --------------------- 9. the four activity categories, DETAIL ONLY */
const detailSingle = content(probe({ bkFAcct: "BA-1042", size: "xwide" }));
A.contains(detailSingle, "bkf-cats", "Detail adds the four-category activity chart");
A.contains(detailSingle, "Activity by category", "the category chart names itself");
A.contains(detailSingle, "bank-cols", "the category chart reuses Jo's column chart");
A.absent(sHtml, "bkf-cats", "Explore does NOT carry the category chart: it is Detail's one addition");
const cats = env.call("bkFAccountQuery", single).categories;
A.eq(cats.length, 4, "exactly four categories are charted");
A.ok(cats.every((c) => c.v >= 0), "all four categories read as POSITIVE magnitudes");
A.ok(cats.filter((c) => c.flow === "out").every((c) => c.stored <= 0),
  "the money-out categories keep their negative STORED value");
A.contains(detailSingle, "display transform only", "the build states that the sign flip is display only");
A.contains(detailSingle, "EFT is not one of the four", "the build states that EFT is excluded, and why");
A.contains(detailSingle, "Out", "each column states its direction in words");
A.contains(detailSingle, "In", "each column states its direction in words");
/* Detail does not pair the two All Accounts presentations. */
const detailAll = content(probe({ size: "xwide", bkFView: "table" }));
A.absent(detailAll, "bank-hb-row", "Detail shows ONE presentation, it does not pair table and bars");

/* -------------------------------- 10. Glance is always the all-accounts total */
const glance = content(probe({ size: "kpi" }));
A.contains(glance, "Total balance, all 52 bank accounts", "Glance states the all-accounts total");
A.contains(glance, "Always the all accounts aggregate", "Glance states that it ignores any account selection");
/* The proof: an account selected at a larger size must not move the Glance figure. */
const glanceSel = content(probe({ size: "kpi", bkFAcct: "BA-1042", bkFOver: true }));
A.same(glanceSel, glance,
  "GLANCE IS UNCHANGED by an account selection or an overdrawn filter set at a larger size");

/* ------------------------------------------------ 11. sortable headers ABSENT */
const tbl = content(probe({ size: "xwide", bkFView: "table" }));
A.absent(tbl, "wt-sort", "NO sortable column headers: open item 7 leaves them deliberately unbuilt");
A.absent(tbl, 'data-bkf="sort"', "no sort action is wired");
A.absent(tbl, "unfold_more", "no sort affordance glyph on any column header");
A.absent(tbl, "arrow_upward", "no sort direction glyph on any column header");
A.absent(tbl, "arrow_downward", "no sort direction glyph on any column header");
A.contains(tbl, 'aria-sort="none"', "the columns honestly declare themselves unsorted");
A.absent(sHtml, "wt-sort", "the seven-row breakdown is not sortable either: its order is structural");

/* ------------------------- 12. the five removed affordances stay removed */
const everySurface = [glance, tbl, sHtml, detailSingle, detailAll,
  content(probe({ bkFView: "bars" })), content(probe({ bkFOver: true }))].join("\n");
A.absent(everySurface, "download", "NO download control at any size (removed 2026-09-04)");
A.absent(everySurface, "Export", "no export affordance anywhere");
A.absent(everySurface, "dd-search", "NO search box: her account search carries no handler and no source specifies one");
A.absent(everySurface, "dd-input", "no search input anywhere");
A.absent(everySurface, "Load more", "NO Load more: paging is a server round trip, so it is Previous/Next");
A.absent(everySurface, "bank-more", "her Load-more control has no counterpart here");
A.absent(everySurface, "bank-drill", "NO per-account drill overlay: Single Account mode already is the drill-in");
A.absent(everySurface, "data-bankpop", "NO per-bar hover card: her hover popover is not carried");
A.absent(everySurface, "modal-backdrop", "this widget opens no modal of its own");
/* Our columns must not carry the attribute her document-level mousemove reads. */
A.absent(detailSingle, "bankpop", "our category columns cannot trigger her mousemove hover popover");

/* --------------------------------------------------------- 13. the states */
const empty = content(probe({ dataset: "empty" }));
A.contains(empty, 'data-kind="empty"', "the no-accounts state renders a clean state frame");
A.contains(empty, "No active bank accounts", "the empty state names what is missing");
A.contains(empty, "not specified in any source", "the empty state NAMES THE GAP rather than inventing copy");
A.absent(empty, 'class="bkf-tbl"', "the empty state renders no table");
A.absent(empty, "bkf-pager", "the empty state renders no pager");
A.ok(content(probe({ dataset: "empty", size: "kpi" })).indexOf("No active bank accounts") > -1,
  "Glance also renders the no-accounts state rather than a zero figure");
["kpi", "wide", "xwide"].forEach((s) =>
  A.ok(content(probe({ dataset: "empty", size: s })).length > 100, s + ": the empty state renders safely"));
/* A single-account org: the All Bank Accounts option must not appear. */
A.eq(env.call("bkFHasAllOption", probe()), true, "with 52 accounts the All option is offered");
A.eq(env.call("bkFHasAllOption", probe({ dataset: "empty" })), false, "with no accounts there is no All option");

/* ------------------------------------------------------ 14. the interactions */
/* Every control is driven through the block's OWN delegated listener. */
const t0 = w("bkF");
t0.bkFView = "table"; t0.bkFPage = 0; t0.bkFOver = false; t0.bkFAcct = null;
const r0 = env.log.renders;
fireBkf("view", { "data-id": "bkF", "data-v": "bars" });
A.eq(t0.bkFView, "bars", "the view toggle writes the widget's own state");
A.eq(env.log.renders, r0 + 1, "the view toggle re-renders");
A.changed(content(t0), tbl, "the view toggle changes the rendered output");
fireBkf("view", { "data-id": "bkF", "data-v": "table" });
A.eq(t0.bkFView, "table", "the view toggle switches back");

fireBkf("page-next", { "data-id": "bkF" });
A.eq(t0.bkFPage, 1, "Next page advances the page index");
fireBkf("page-next", { "data-id": "bkF" });
A.eq(t0.bkFPage, 2, "Next page advances again");
fireBkf("page-prev", { "data-id": "bkF" });
A.eq(t0.bkFPage, 1, "Previous page steps back");
/* The pager cannot walk off either end. */
t0.bkFPage = 4; fireBkf("page-next", { "data-id": "bkF" });
A.eq(t0.bkFPage, 4, "Next page cannot advance past the last page");
t0.bkFPage = 0; fireBkf("page-prev", { "data-id": "bkF" });
A.eq(t0.bkFPage, 0, "Previous page cannot step before the first page");
/* Paging does not disturb the totals the header and totals row read. */
t0.bkFPage = 3;
A.eq(env.call("bkFServerQuery", t0).totals.ending, p0.totals.ending,
  "after paging, the widget's own total is still the full-set total");
t0.bkFPage = 0;

/* The overdrawn filter toggles, and resets the page. */
t0.bkFPage = 3;
fireBkf("overdrawn", { "data-id": "bkF" });
A.eq(t0.bkFOver, true, "the overdrawn chip turns the filter on");
A.eq(t0.bkFPage, 0, "turning the filter on resets to page 1");
A.contains(content(t0), "Filtered to overdrawn accounts only", "the header states that the rows are filtered");
A.contains(content(t0), "Total, 7 overdrawn accounts", "the totals row describes the FILTERED set it sums");
A.absent(content(t0), "Total, all 52", "the totals row stops claiming to cover every account");
fireBkf("overdrawn", { "data-id": "bkF" });
A.eq(t0.bkFOver, false, "the overdrawn chip turns the filter off again");
A.contains(content(t0), "Total, all 52 accounts", "with the filter off the totals row covers every account");

/* The account popover, and the mode switch. */
fireBkf("acct", { "data-id": "bkF" });
A.ok(!!shim.nodes.bkFPop, "the account control opens our own popover");
const popHtml = shim.captured.bkFPop || "";
A.contains(popHtml, "All Bank Accounts", "the picker offers the All Bank Accounts scope");
A.contains(popHtml, "One account, switches the whole widget", "the picker says the selection is a mode switch");
A.eq((popHtml.match(/data-bkf="set-acct"/g) || []).length, 53,
  "the picker lists every one of the 52 accounts plus the All option, not just a page");
A.contains(popHtml, "bank-mi-bal", "each picker row carries its balance, reusing Jo's class");
A.absent(popHtml, "dd-search", "the picker carries NO search input");
/* Selecting an account switches mode, resets the page AND clears the filter. */
t0.bkFOver = true; t0.bkFPage = 3;
fireBkf("set-acct", { "data-id": "bkF", "data-v": "BA-1042" });
A.eq(t0.bkFAcct, "BA-1042", "selecting an account writes the selection");
A.eq(t0.bkFPage, 0, "the mode switch resets the page");
A.eq(t0.bkFOver, false, "THE OVERDRAWN FILTER CLEARS in Single Account mode, where it has no meaning");
A.absent(content(t0), "bank-odchip", "the overdrawn chip is absent in Single Account mode");
A.ok(!shim.nodes.bkFPop, "selecting an account closes the popover");
/* Back to All Accounts. */
fireBkf("acct", { "data-id": "bkF" });
fireBkf("set-acct", { "data-id": "bkF", "data-v": "all" });
A.eq(t0.bkFAcct, "all", "the All Bank Accounts option returns to All Accounts mode");
A.contains(content(t0), "bank-odchip", "the overdrawn chip returns in All Accounts mode");
/* The popover closes on Escape and on an outside click. */
fireBkf("acct", { "data-id": "bkF" });
A.ok(!!shim.nodes.bkFPop, "the popover is open again");
shim.fireKey("Escape");
A.ok(!shim.nodes.bkFPop, "Escape closes the popover");
fireBkf("acct", { "data-id": "bkF" });
shim.fireOutside();
A.ok(!shim.nodes.bkFPop, "a click outside closes the popover");
/* A toggle click that resolves to no widget must be inert, not a throw. */
fireBkf("view", { "data-id": "no-such-widget", "data-v": "bars" });
A.ok(true, "an action naming an unknown widget id is inert");
/* Nothing here is wired to a row, a bar or a column. */
const beforeRows = env.log.renders;
fireBkf("row", { "data-id": "bkF" });
fireBkf("bar", { "data-id": "bkF" });
A.eq(env.log.renders, beforeRows, "clicking a row or a bar does nothing: this widget is view only");

/* ----------------------------------- 15. NO EM DASH, every combination */
let sweep = 0;
["kpi", "wide", "xwide"].forEach((size) => {
  ["table", "bars"].forEach((view) => {
    [false, true].forEach((over) => {
      ["all", "BA-1042", "BA-1023", "NOPE"].forEach((acct) => {
        ["ready", "empty"].forEach((ds) => {
          const html = content(probe({ size, bkFView: view, bkFOver: over, bkFAcct: acct,
                                       dataset: ds === "empty" ? "empty" : undefined }));
          A.noEmDash(html, `${size}/${view}/over=${over}/acct=${acct}/${ds}`);
          sweep++;
        });
      });
    });
  });
});
A.ok(sweep === 96, "the no-em-dash sweep covered all 96 size x view x filter x account x dataset combinations");
/* And the popover, the pager and the chips, which render outside content(). */
A.noEmDash(popHtml, "the account popover");
A.noEmDash(pager, "the pager");
A.noEmDash(chipOn + chipOff, "the overdrawn chip in both states");
A.noEmDash(Q("BKF_ABOUT"), "the About popover body");
Q("BKF_VIEWS").forEach((v) => A.noEmDash(v.tip, "the " + v.l + " view tooltip"));

/* ---------------------------- 16. CSS: ours declared, hers untouched */
A.cssDeclares(shell.css, ["bkf-root", "bkf-w", "bkf-pop", "bkf-body", "bkf-tbl", "bkf-tblwrap",
  "bkf-tscroll", "bkf-pager", "bkf-pgcount", "bkf-pgnum", "bkf-hb", "bkf-hb-head", "bkf-brk",
  "bkf-brk-cap", "bkf-brk-sub", "bkf-brk-end", "bkf-cats", "bkf-cats-hd", "bkf-odchip-l",
  "bkf-gap", "bkf-live"], "our own .bkf- classes");
/* Every class we borrow from her must genuinely exist in the stylesheet, or it
   ships as unstyled native chrome. */
A.cssDeclares(shell.css, ["bank-hb", "bank-hb-row", "bank-hb-name", "bank-hb-track", "bank-hb-zero",
  "bank-hb-fill", "bank-hb-val", "bank-hb-warn", "bank-odchip", "bank-pill", "bank-neg", "bank-pos",
  "bank-anchor", "bank-tag-over", "bank-mi-bal", "bank-pager", "bank-ctx", "bank-numwrap",
  "bank-hd-left", "bank-acct-chip", "bank-legend", "bank-lg", "bank-sw", "bank-amt", "bank-bal",
  "bank-chart-wrap", "bank-plotrow", "bank-yax", "bank-yaxsp", "bank-xaxrow", "bank-xcol",
  "bank-xcols", "bank-xlbl", "bank-xval", "bank-xflow", "bank-col", "bank-cols", "bank-bar",
  "bank-barwrap", "bank-canvas", "bank-gl",
  "dep-hd", "dep-hd-top", "dep-hd-num", "dep-hd-toggle", "dep-hd-kpigrp", "dep-total", "dep-full",
  "dep-col", "dep-col-h", "vtoggle", "vt", "filter-chip", "fc-label", "iconbtn", "kpi-row",
  "kpi-num", "gl-sub", "metric-value", "mi", "mi-gap", "mi-nm", "cap", "sep", "menu-scroll",
  "state", "state-title", "state-sub", "scroll", "sr-only", "wt-row", "wt-head", "lr-main", "wt-c2"],
  "Jo's classes we reuse rather than redeclare");
/* Our CSS block must declare zero .bank-* selectors of its own. */
const ourCss = shell.css.slice(
  shell.css.indexOf("===== W15 Bank Balances V2 CSS"),
  shell.css.indexOf("===== end W15 Bank Balances V2 CSS"));
A.ok(ourCss.length > 500, "our CSS block is present and findable by its markers");
const ourSelectors = (ourCss.match(/^\s*([^\n{}/][^\n{}]*)\{/gm) || []).map((s) => s.replace(/\{$/, "").trim());
A.eq(ourSelectors.filter((s) => s.indexOf(".bkf-") < 0).length, 0,
  "EVERY rule in our CSS block is .bkf-scoped, so it cannot reach her widget");
A.ok(ourSelectors.length >= 45, "our CSS block declares the expected handful of rules (" + ourSelectors.length + ")");
/* The three forced overrides are present and are the fix, not a copy. */
A.contains(ourCss, "--wn-750", "our zero axis uses a token this file actually declares");
A.ok(!/\.bkf-root[^{]*\.bank-hb-zero[^}]*--wn-500/.test(ourCss), "our zero axis does NOT read the undeclared --wn-500");
/* Jo's own defect, recorded: --wn-500 is declared nowhere in the stylesheet. */
A.eq((shell.css.match(/--wn-500\s*:/g) || []).length, 0,
  "REPORTED DEFECT IN HER ORIGINAL: --wn-500 is declared nowhere, so her own zero axis is invisible");
A.ok(/\.bank-hb-zero\{[^}]*--wn-500/.test(shell.css.replace(/\s+/g, "")) ||
     /bank-hb-zero[^}]*--wn-500/.test(shell.css),
  "her .bank-hb-zero rule still reads --wn-500, left exactly as it is");

/* -------------------- 17. Jo's bank widget is untouched */
const S = shell.script;
["bankContent", "bankAccounts", "bankEnding", "bankSelected", "bankMoney", "bankAbbr", "bankTotal",
 "bankNegCount", "bankAcctChip", "bankViewToggle", "bankHeaderBlock", "bankSkeleton", "bankAllTable",
 "bankAllBars", "bankSingleTable", "bankBars", "bankAllView", "bankSingleView", "bankAllFull",
 "bankSingleFull", "bankGlance", "bankDrillModalHTML", "bankLoad", "bankOdChip", "bankHideBpop",
 "bankShowBpop"].forEach((fn) => {
  const defs = (S.match(new RegExp("function\\s+" + fn + "\\s*\\(", "g")) || []).length;
  A.eq(defs, 1, "Jo's " + fn + " is still defined exactly once");
});
A.eq((S.match(/var BANK_ACCOUNTS\s*=/g) || []).length, 1, "Jo's BANK_ACCOUNTS is still declared exactly once");
A.eq((S.match(/kind:"bank"/g) || []).length, 5, "Jo's five kind:\"bank\" registry entries are all still there");
/* Her dispatch line is intact and ours is additive, placed with the MB variants
   BEFORE the generic empty fallback so bkF5 renders our own empty state. */
A.eq((S.match(/if\(w\.kind==="bank"\)return bankContent\(w\);/g) || []).length, 1,
  "her contentHTML dispatch line is intact");
A.eq((S.match(/if\(w\.kind==="bank-mb"\)return bkFContent\(w\);/g) || []).length, 1,
  "our contentHTML dispatch line is present exactly once");
A.ok(S.indexOf('w.kind==="bank-mb"') < S.indexOf('if(w.state==="empty"){var ec=EMPTY_COPY'),
  "our dispatch sits BEFORE the generic empty fallback, so our own empty state wins");
A.eq((S.match(/w\.kind==="bank-mb"/g) || []).length, 2,
  "bank-mb is dispatched in exactly two places: contentHTML and aboutOf");
/* None of our names can shadow one of hers: every one of ours is bkF or BKF_. */
A.eq((S.match(/\bbankF[A-Za-z]/g) || []).length, 0,
  "the discarded bankF prefix appears nowhere as an identifier");
A.ok(/function bkFContent\(/.test(S), "our single entry point is bkFContent");
/* Our namespace never uses her prefix, and hers never uses ours. */
const ourBlock = H.extractRegion(S, START, END);
A.eq((ourBlock.match(/function\s+bank[A-Z]/g) || []).length, 0,
  "our block defines NO function starting with her bank prefix");
A.eq((ourBlock.match(/data-action=/g) || []).length, 0,
  "our block emits NO data-action, so Jo's dispatcher can never reach our markup");
A.ok((ourBlock.match(/data-bkf=/g) || []).length >= 6,
  "our block drives everything through our own data-bkf attribute");
/* The only sort/slice in the whole block is inside the server stand-in. */
const serverFn = ourBlock.slice(ourBlock.indexOf("function bkFServerQuery"), ourBlock.indexOf("function bkFAccountQuery"));
A.eq((ourBlock.match(/\.sort\(/g) || []).length, (serverFn.match(/\.sort\(/g) || []).length,
  "every .sort( in the block is inside the SERVER stand-in, none in a renderer");
A.eq((ourBlock.match(/\.slice\(/g) || []).length, (serverFn.match(/\.slice\(/g) || []).length,
  "every .slice( in the block is inside the SERVER stand-in, none in a renderer");

process.exit(A.report());
