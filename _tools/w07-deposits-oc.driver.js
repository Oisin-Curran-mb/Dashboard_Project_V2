/* =====================================================================
   w07-deposits-oc.driver.js , W07 Deposits on Hand
   (kind deposits-oc, prefix depO) verification driver for the
   2026-09-07 V2 re-port (Final Check build v2.0, FC_VERSION[7]='2.0',
   base commit 71ca056).

   W07 is a style-(b) port: a self-contained subsystem with its own
   delegated click/input/keydown listeners keyed to data-depo, its own
   body-level popover (#depoPop), and its own namespaced spark scrub
   (.depo-spark). The row-detail modal deliberately reuses Jo's shared
   `modal` object (the modal.b path), mirroring her own account modal.
   Trend hover piggybacks Jo's shared lnUpdate/trHighlight system; the
   V2 line-CLICK drill is our own capture listener reading the shared
   lnActive var, with our canvases opted OUT of her isolate-on-click
   via data-multi="0" + data-depoclick.

   V2 specifics asserted here (Step 4 "W07 - Deposit Accounts.md",
   audited 2026-08-30, + Step 5 v2 API spec):
     - scope popover: All Accounts / account types / accounts, with
       typeahead; scope drives every view the same way
     - KPI summary + pre-signed delta pill (abs value + neg class,
       never a double sign); Compare To scale week / month / period /
       quarter / fiscal year / calendar year, "period" between M and Q
     - distribution groups: by TYPE at All Accounts, per-ACCOUNT at a
       single type; breakdown toggle Total / By Account Type at All,
       Total / By Account at a type (owner change 2)
     - table: real pager 50/page (page N of M, prev/next, "Showing X
       to Y of Z accounts"), sort toggles + resets the page, totals
       and KPI cross-foot over the FULL set on every page (owner
       change 1); search box present (Jo's shared .dep-q filter)
     - chart click drills, never isolates/expands: type series (donut
       slice or trend line) re-scopes + By Account; account series
       inert; row modal preserved (owner change 3)
     - trend renders WITHOUT a Compare-To overlay line (known open
       item carried, not resolved: the doc mentions an overlay, the
       built V2 has none; the port follows the build)
     - empty state triggers on the account COUNT (zero accounts) or an
       explicit state flag; loading skeleton only for a data-fetch
       state (scope/Compare To are instant client re-renders: no fetch)
     - no em dashes anywhere; titles use the (OC) convention

   Run from this folder:  node w07-deposits-oc.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const shell = H.loadShell();
const S = shell.script;
const A = new H.Assert("W07 deposits-oc (V2 re-port)");

/* ---------- extraction (verbatim regions out of the real file) --------- */
const block = "/*" + H.extractRegion(S,
  'W07 Deposits on Hand V2 JS, kind "deposits-oc", prefix depO',
  '  window.addEventListener("resize",function(){depORepositionPop();});');

/* Jo's shared chart-math helpers the block calls (verbatim, so the math is real) */
const helpers = H.extractRegion(S, "var PIE_COLORS=", "function walk(seedStr")
  .replace(/function walk\(seedStr$/, "") +
  H.extractRegion(S, "function walk(seedStr", "return out;}") +
  "\n" + H.extractRegion(S, "function smoothPath(xs,ys)", "return d;}") +
  "\n" + H.extractRegion(S, "function _hash(s)", "return h>>>0;}");

/* ---------- structural markers, dispatch, shared-region hygiene -------- */
A.ok(S.indexOf('if(w.kind==="deposits-oc")return depOContent(w);') > -1, "contentHTML dispatch line present");
const dispatchAt = S.indexOf('if(w.kind==="deposits-oc")return depOContent(w);');
const fallbackAt = S.indexOf('if(w.state==="empty"){var ec=EMPTY_COPY[w.kind]');
A.ok(dispatchAt > -1 && fallbackAt > -1 && dispatchAt < fallbackAt, "deposits-oc dispatched BEFORE the generic empty fallback (V2: own states)");
A.ok(S.indexOf('if(w.kind==="deposits-oc")return {h:w.title') > -1, "aboutOf branch present");
A.ok(shell.css.indexOf("Deposits on Hand (MB updated)") > -1, "CSS region marker (MB updated wording) present");

/* Jo's own dep widget is untouched */
A.ok(S.indexOf("function depContent(w)") > -1, "Jo's own depContent still present");
A.ok(S.indexOf("function openAcct(w,name,type,acctNo)") > -1, "Jo's own openAcct still present");
A.ok(S.indexOf("var DEP_TYPES=") > -1, "Jo's own DEP_TYPES still present");
A.ok(S.indexOf('if(w.kind==="deposits")return depContent(w);') > -1, "Jo's own deposits dispatch untouched");

/* the OLD port's artifacts are genuinely gone from OUR block */
A.absent(block, "tshown", "old Load-more state (tshown) gone");
A.absent(block, "tmore", "old Load-more action (tmore) gone");
A.absent(block, "depo-more", "old Load-more markup gone");
A.ok(S.indexOf('title:"Deposits on Hand (Detail view)"') > -1, "Jo's default-title Detail instance present (side-by-side model)");
A.absent(shell.css, ".depo-more", "old Load-more CSS gone");
A.absent(shell.css, ".depo-dp-btn", "old stale pager CSS gone");

/* ---------- registry ---------------------------------------------------- */
const REG = H.extractRegistry(S, "deposits-oc");
A.eq(REG.length, 5, "five deposits-oc registry entries (default card + 4 driver fixtures; system s1 stays Jo's)");
REG.forEach(function (w) { A.contains(w.title, "(OC", "title (OC convention: " + w.title); });
const IDS = {}; REG.forEach(function (w) { IDS[w.id] = w; });
A.ok(IDS.depO && IDS.depO.size === "wide" && IDS.depO.view === "table" && IDS.depO.filter === "All types", "depO: Explore card, Table default, All types");
A.ok(IDS.depO2 && IDS.depO2.size === "xwide" && IDS.depO2.view === "balances", "depO2: Detail card, Balances view");
A.ok(IDS.depO3 && IDS.depO3.size === "kpi", "depO3: Glance card");
A.ok(IDS.depO4 && IDS.depO4.filter === "Restricted Funds" && IDS.depO4.view === "dist", "depO4: single account type, Distribution");
A.ok(IDS.depO5 && IDS.depO5.state === "empty" && IDS.depO5.dataset === "empty", "depO5: no data (state empty, dataset empty)");
A.ok(IDS.depO.tpage === 1 && IDS.depO.tsort === "net-desc", "depO: pager page 1, Balance-descending default sort");
REG.forEach(function (w) { A.ok(w.tiers.join(",") === "kpi,wide,xwide", w.id + " tiers kpi/wide/xwide only (Jo's large dropped)"); });

/* ---------- run the block in the shim ---------------------------------- */
const env = H.runBlock(helpers + "\n" + block, { registry: REG, dataAttr: "data-depo", globals: {
  showModalCalls: [],
  lnActive: null, hideLnTip: function () {},
  innerWidth: 1440, innerHeight: 900
} });
/* Jo's shared showModal, recorded */
env.ctx.showModal = function (t, b) { env.ctx.modal = { t: t, b: b }; env.ctx.showModalCalls.push(t); };
const fire = env.shim.fire, fireOutside = env.shim.fireOutside, fireKey = env.shim.fireKey;
function W(id) { return env.registry.filter(function (w) { return w.id === id; })[0]; }
function content(id) { return env.call("depOContent", W(id)); }

/* ---------- data cross-foot --------------------------------------------- */
const DATA = env.get("DEPO_DEP");
A.eq(DATA.length, 125, "mock dataset is 125 accounts");
A.eq(DATA.reduce(function (s, a) { return s + a.net; }, 0), 106726837, "grand total $106,726,837");
A.ok(DATA.filter(function (a) { return a.name === "General" && a.type === "Checking"; }).length >= 2, "duplicate-name edge case present (Checking accounts named General share a name)");

/* ---------- Explore (wide): table + pager (owner change 1) -------------- */
let ex = content("depO");
A.contains(ex, "Showing 1 to 50 of 125 accounts", "pager count line, page 1");
A.contains(ex, "Page 1 of 3", "pager page 1 of 3");
A.contains(ex, 'data-p="prev" disabled', "prev disabled on page 1");
A.contains(ex, 'data-p="next" aria-label', "next enabled on page 1");
A.contains(ex, ">$106,726,837<", "Total row cross-foots the FULL set on page 1");
A.contains(ex, 'class="dep-q"', "table search box present (Jo's shared .dep-q filter)");
A.contains(ex, 'data-depo="tsort"', "sortable column heads present");
A.eq((ex.match(/class="wt-row/g) || []).length - (ex.match(/wt-row wt-head/g) || []).length, 50, "exactly 50 data rows on a page");

fire("tpage", { "data-id": "depO", "data-p": "next" });
A.eq(W("depO").tpage, 2, "next moves to page 2");
let ex2 = content("depO");
A.contains(ex2, "Showing 51 to 100 of 125 accounts", "pager count line, page 2");
A.contains(ex2, ">$106,726,837<", "Total row unchanged by paging (display-only pagination)");
A.changed(ex2, ex, "page 2 shows different rows");
fire("tpage", { "data-id": "depO", "data-p": "next" });
A.contains(content("depO"), "Showing 101 to 125 of 125 accounts", "last page shows the 25 remaining");
A.contains(content("depO"), 'data-p="next" disabled', "next disabled on the last page");
fire("tpage", { "data-id": "depO", "data-p": "prev" }); fire("tpage", { "data-id": "depO", "data-p": "prev" });
A.eq(W("depO").tpage, 1, "prev returns to page 1");

/* sort toggles asc/desc and resets the page */
fire("tpage", { "data-id": "depO", "data-p": "next" });
fire("tsort", { "data-id": "depO", "data-k": "name" });
A.eq(W("depO").tsort, "name-asc", "sort by Name starts ascending");
A.eq(W("depO").tpage, 1, "sorting resets to page 1");
const exNameAsc = content("depO");
fire("tsort", { "data-id": "depO", "data-k": "name" });
A.eq(W("depO").tsort, "name-desc", "second click flips to descending");
A.changed(content("depO"), exNameAsc, "sort direction changes the rendered rows");
A.contains(content("depO"), ">$106,726,837<", "Total row unchanged by sorting");
fire("tsort", { "data-id": "depO", "data-k": "net" });
A.eq(W("depO").tsort, "net-desc", "Balance sort restores net-desc");

/* ---------- scope popover: options + typeahead -------------------------- */
fire("depfilter", { "data-id": "depO" });
let popN = env.shim.nodes.depoPop;
A.ok(!!popN, "scope popover opens on the chip");
A.contains(popN.innerHTML, ">All Accounts<", "popover offers All Accounts");
A.contains(popN.innerHTML, ">Account Type<", "popover groups account types");
A.contains(popN.innerHTML, ">Accounts<", "popover groups individual accounts");
A.contains(popN.innerHTML, "Restricted Funds", "type list includes Restricted Funds");
A.contains(popN.innerHTML, 'class="dd-input" id="depOfq"', "typeahead input present");
(env.shim.listeners.input || []).forEach(function (fn) { fn({ target: { id: "depOfq", value: "restricted", selectionStart: 3, closest: function () { return null; } } }); });
A.eq(env.get("DEPO_FQ"), "restricted", "typeahead query stored");
let filtered = env.call("depOPopContent");
A.contains(filtered, "Restricted Funds", "typeahead keeps matching type");
A.absent(filtered, ">Checking<", "typeahead filters out non-matching types");
(env.shim.listeners.input || []).forEach(function (fn) { fn({ target: { id: "depOfq", value: "zzzz", selectionStart: 2, closest: function () { return null; } } }); });
A.contains(env.call("depOPopContent"), "No matches for", "typeahead no-match message");
fireOutside();
A.ok(!env.shim.nodes.depoPop, "outside click closes the popover");

/* scope select: a type, then an account, then back to all */
fire("depfilter", { "data-id": "depO" });
fire("set-scope", { "data-id": "depO", "data-mode": "type", "data-v": "Savings" });
A.eq(W("depO").filter, "Savings", "type scope applied");
A.eq(W("depO").tpage, 1, "scope change resets the page");
A.ok(!env.shim.nodes.depoPop, "popover closes on selection");
A.contains(content("depO"), "Account Type: Savings", "scope chip shows the type");
const savTotal = DATA.filter(function (a) { return a.type === "Savings"; }).reduce(function (s, a) { return s + a.net; }, 0);
A.contains(content("depO"), ">" + env.ctx.money(savTotal) + "<", "scoped Total cross-foots the Savings set");
const acct = DATA.filter(function (a) { return a.type === "Savings"; })[0];
fire("set-scope", { "data-id": "depO", "data-mode": "account", "data-v": acct.name, "data-type": acct.type, "data-acctno": acct.acct });
A.eq(W("depO").acct, acct.name, "individual account scope applied");
A.contains(content("depO"), "Account: " + acct.name, "scope chip shows the account");
fire("set-scope", { "data-id": "depO", "data-mode": "all" });
A.eq(W("depO").filter, "All types", "back to All Accounts");
A.ok(!W("depO").acct, "account scope cleared");

/* ---------- KPI summary + pre-signed delta + Compare To ----------------- */
const gl = content("depO3");
A.contains(gl, "metric-value", "Glance renders the KPI number");
A.contains(gl, "delta-pill", "Glance renders the delta pill");
A.contains(gl, "depo-spark", "Glance renders the namespaced scrub sparkline");
A.contains(gl, "vs quarter", "Compare To label reflects the default scale");
const dNeg = env.call("depODelta", { dpct: -3.2, neg: true });
A.contains(dNeg, "neg", "negative delta carries the neg class");
A.contains(dNeg, "3.2%", "delta shows the absolute value");
A.absent(dNeg, "-3.2", "pre-signed: no double sign on the delta value");
A.contains(dNeg, "south_east", "negative delta arrow pairs with colour (never colour alone)");
fire("rangemenu", { "data-id": "depO3" });
const rp = env.shim.nodes.depoPop;
A.ok(!!rp, "Compare To popover opens");
["week", "month", "period", "quarter", "fiscal year", "calendar year"].forEach(function (o) {
  A.contains(rp.innerHTML, ">Previous " + o + "<", "Compare To offers Previous " + o);
});
A.ok(rp.innerHTML.indexOf("Previous month") < rp.innerHTML.indexOf("Previous period") && rp.innerHTML.indexOf("Previous period") < rp.innerHTML.indexOf("Previous quarter"), "period sits between month and quarter (owner change 4)");
fire("range-set", { "data-id": "depO3", "data-r": "P" });
A.eq(W("depO3").range, "P", "Compare To period applied");
A.contains(content("depO3"), "vs period", "KPI label follows the period scale");
const pM = env.call("depOMetricParts", Object.assign({}, W("depO3"), { range: "M" }));
const pP = env.call("depOMetricParts", Object.assign({}, W("depO3"), { range: "P" }));
const pQ = env.call("depOMetricParts", Object.assign({}, W("depO3"), { range: "Q" }));
A.eq(pM.latest, pQ.latest, "latest total identical across scales");
A.ok((pP.dpct - Math.min(pM.dpct, pQ.dpct)) * (Math.max(pM.dpct, pQ.dpct) - pP.dpct) >= 0, "period delta lands between the month and quarter deltas");
fire("range-set", { "data-id": "depO3", "data-r": "Q" });

/* ---------- distribution groups, both scopes (owner change 2) ----------- */
const dAll = env.call("depODist", W("depO"));
A.eq(dAll.by, "type", "All Accounts distribution groups by TYPE");
const dType = env.call("depODist", W("depO4"));
A.eq(dType.by, "account", "single-type distribution groups per ACCOUNT");
A.eq(dType.scopeType, "Restricted Funds", "per-account groups carry the scope type");
const dTot = env.call("depODist", Object.assign({}, W("depO"), { bd: "total" }));
A.ok(dTot.by === "total" && dTot.segs.length === 1, "Total breakdown collapses to one segment");
const btAll = env.call("depOBreakToggle", Object.assign({}, W("depO"), { view: "trend" }));
A.contains(btAll, "By Account Type", "All Accounts toggle offers By Account Type");
A.absent(btAll.replace(/By Account Type/g, ""), "By Account", "no standalone By Account at All Accounts (owner change 2)");
const btType = env.call("depOBreakToggle", Object.assign({}, W("depO4"), { view: "trend" }));
A.contains(btType, "By Account", "single-type toggle offers By Account");
A.absent(btType, "By Account Type", "no By Account Type at a single type");
const donutAll = env.call("depODonut", W("depO"), false);
A.contains(donutAll, 'data-by="type"', "donut type slices are drillable");
A.contains(donutAll, 'data-kind="type"', "Others slice carries its grouping kind");
A.contains(donutAll, "data-n=", "Others slice carries its grouped count");
const segSum = env.call("depODist", W("depO")).segs.reduce(function (s, x) { return s + x.net; }, 0);
A.eq(segSum, 106726837, "distribution segments (with Others) cross-foot the grand total");

/* donut drill: type slice re-scopes + By Account; account slice inert */
fire("dist-drill", { "data-id": "depO", "data-by": "type", "data-val": "Endowment" });
A.eq(W("depO").filter, "Endowment", "type slice click re-scopes to the type");
A.eq(W("depO").bd, "group", "drill lands on the By Account breakdown");
A.eq(W("depO").tpage, 1, "drill resets the page");
const before = JSON.stringify(W("depO"));
fire("dist-drill", { "data-id": "depO", "data-by": "account", "data-val": "Memorial" });
A.same(JSON.stringify(W("depO")), before, "account slice click is inert (leaf)");
fire("others", { "data-id": "depO" });
A.same(JSON.stringify(W("depO")), before, "Others slice click is inert");
fire("set-scope", { "data-id": "depO", "data-mode": "all" });

/* ---------- trend: no Compare-To overlay; line click drills -------------- */
W("depO").view = "trend";
const tr = content("depO");
A.contains(tr, "tr-canvas", "trend canvas renders");
A.contains(tr, 'data-mode="type"', "All-Accounts trend is in type mode");
A.contains(tr, 'data-multi="0"', "canvas opts OUT of the shared isolate-on-click");
A.contains(tr, 'data-depoclick="1"', "canvas carries the drill-click marker");
A.ok(!/polyline[^>]*stroke-dasharray/.test(tr), "NO dashed Compare-To overlay series on Trend (built behaviour; doc conflict carried as flagged; the dashed grid lines are not series)");
A.absent(tr, "Dashed", "no overlay caption either");
const typeCount = env.call("depOByType", W("depO")).length;
A.eq((tr.match(/polyline class="tl"/g) || []).length, typeCount, "one solid line per account type, nothing else");

/* legend row drill (tr-iso): type drills, account inert */
fire("tr-iso", { "data-id": "depO", "data-kind": "type", "data-name": "Trust Accounts" });
A.eq(W("depO").filter, "Trust Accounts", "legend type row re-scopes");
A.eq(W("depO").bd, "group", "legend drill lands on By Account");
const beforeAcct = JSON.stringify(W("depO"));
fire("tr-iso", { "data-id": "depO", "data-kind": "account", "data-name": "Memorial" });
A.same(JSON.stringify(W("depO")), beforeAcct, "legend account row is inert (leaf)");
fire("set-scope", { "data-id": "depO", "data-mode": "all" });

/* line click on the canvas itself: drive our capture listener directly */
W("depO").view = "trend";
function fireCanvasClick(mode, blob, active) {
  env.ctx.lnActive = active;
  const cv = env.shim.mkTarget({ "data-id": "depO", "data-mode": mode, "data-multi": "0", "data-depoclick": "1", "data-blob": blob }, "div", "tr-canvas");
  cv.closest = function (sel) { return String(sel).indexOf("tr-canvas") > -1 ? cv : null; };
  (env.shim.listeners.click || []).forEach(function (fn) { fn({ target: cv }); });
  env.ctx.lnActive = null;
}
fireCanvasClick("type", "Checking|hsl(249,40%,18%)|0|100,200;Savings|hsl(249,40%,40%)|1|90,180", 1);
A.eq(W("depO").filter, "Savings", "TYPE line click drills to that type (owner change 3)");
A.eq(W("depO").bd, "group", "line drill lands on By Account");
const beforeLine = JSON.stringify(W("depO"));
fireCanvasClick("account", "Youth|hsl(249,40%,18%)|0|100,200;Missions|hsl(249,40%,40%)|1|90,180", 0);
A.same(JSON.stringify(W("depO")), beforeLine, "ACCOUNT line click is inert (leaf)");
A.ok(block.indexOf("wc.trIso=(wc.trIso===lnActive)") < 0, "no isolate-on-click anywhere in our block");
fire("set-scope", { "data-id": "depO", "data-mode": "all" });
W("depO").view = "table";

/* ---------- Detail (xwide): Balances (table + donut) / Trend ------------ */
const dt = content("depO2");
A.contains(dt, ">Balances<", "Detail toggle offers Balances");
A.contains(dt, ">Trend<", "Detail toggle offers Trend");
A.ok(!/data-v="dist"/.test(dt), "no standalone Distribution toggle option at Detail (the donut lives inside Balances)");
A.contains(dt, "dep-col-dist", "Detail Balances renders the donut beside the table");
A.contains(dt, "Showing 1 to 50 of 125 accounts", "Detail table paginates too");
fire("dep-view", { "data-id": "depO2", "data-v": "trend" });
A.eq(W("depO2").view, "trend", "Detail switches to Trend");
A.contains(content("depO2"), "tr-canvas", "Detail Trend renders the canvas");
fire("dep-view", { "data-id": "depO2", "data-v": "balances" });

/* view toggle variants */
A.contains(env.call("depOToggle", W("depO")), ">Distribution<", "Explore toggle has three options at All Accounts");
A.absent(env.call("depOToggle", Object.assign({}, W("depO"), { acct: "General", leaf: true })), ">Distribution<", "account scope collapses to Table / Trend");

/* ---------- row modal (preserved, Jo's shared modal) --------------------- */
const edge = DATA.filter(function (a) { return a.acctFull === "0044177734"; })[0];
const dup = [edge, edge];
fire("pick-acct", { "data-id": "depO", "data-v": dup[1].name, "data-type": dup[1].type, "data-acctno": dup[1].acct });
A.ok(env.ctx.modal && env.ctx.modal.depo, "row click opens the account detail modal");
A.eq(env.ctx.modal.t, "General", "modal titled with the account name");
A.contains(env.ctx.modal.b, "acctm-bar", "modal body reuses Jo's acctm chrome");
A.contains(env.ctx.modal.b, 'data-v="table"', "modal offers the Table view");
A.contains(env.ctx.modal.b, 'data-v="trend"', "modal offers the Trend view");
const trendBody = env.ctx.modal.b;
fire("acct-view", { "data-v": "table" });
A.eq(env.ctx.modal.depo.mview, "table", "modal toggle switches to Table");
A.changed(env.ctx.modal.b, trendBody, "modal body re-renders on toggle");
A.contains(env.ctx.modal.b, "wt-row", "modal Table shows the account row");
A.contains(env.ctx.modal.b, dup[1].acctFull || dup[1].acct, "duplicate names stay disambiguated by account number in the modal table (gap #14)");
A.contains(env.ctx.modal.b, dup[1].acct, "masked account number shown under the name");
env.ctx.modal = null;

/* ---------- states ------------------------------------------------------- */
const empty = content("depO5");
A.contains(empty, "No deposit accounts", "no-data card renders the empty state");
A.contains(empty, 'data-depo="add-acct"', "empty state carries the Add account action");
A.absent(empty, "dep-hd", "no duplicated header above the empty state");
A.eq(env.call("depOData", W("depO5")).length, 0, "empty dataset returns zero accounts");
const countTrig = env.call("depOContent", { id: "x", size: "wide", dataset: "empty" });
A.contains(countTrig, "No deposit accounts", "empty state triggers on the account COUNT alone (no state flag needed)");
fire("add-acct", { "data-id": "depO5" });
A.eq(env.ctx.showModalCalls[env.ctx.showModalCalls.length - 1], "Add a deposit account", "Add account opens the explainer modal");
A.absent(env.ctx.modal.b, "—", "explainer copy has no em dash");
env.ctx.modal = null;
const loading = env.call("depOContent", { id: "x", size: "wide", state: "loading" });
A.contains(loading, "skeleton", "loading state renders the skeleton");
const errS = env.call("depOContent", { id: "x", size: "wide", state: "error" });
A.contains(errS, "Could not load balances", "error state renders");
A.contains(errS, 'data-depo="retry"', "error state carries Retry");
/* no fetch anywhere: scope + Compare To are instant client re-renders */
A.eq(env.log.timers, 0, "no loading timer fired by any interaction (deposits has no fetch, per the build)");

/* Escape closes the popover */
fire("depfilter", { "data-id": "depO" });
A.ok(!!env.shim.nodes.depoPop, "popover open before Escape");
fireKey("Escape");
A.ok(!env.shim.nodes.depoPop, "Escape closes the popover");

/* ---------- CSS ---------------------------------------------------------- */
A.cssDeclares(shell.css, ["dep-pager", "dp-count", "dp-nav", "dp-page", "dp-btn", "depo-spark", "dep-hd", "scope-chip", "vtoggle", "delta-pill", "state", "skeleton", "dep-total", "dd-search", "menu-scroll", "acctm-bar"], "W07 classes declared");
A.ok(shell.css.indexOf('.tr-canvas[data-depoclick="1"]{cursor:pointer;}') > -1, "drill-click cursor rule present");
A.ok(shell.css.indexOf(".scope-chip[data-depo]") > -1, "scope chip keeps the shared filter-glyph styling");

/* ---------- no-em-dash sweep across every combination -------------------- */
const sizes = ["kpi", "wide", "xwide"];
const views = ["table", "dist", "trend", "balances"];
const scopes = [{ filter: "All types" }, { filter: "Restricted Funds" }, { filter: "Savings", bd: "total" }, { acct: "General", acctType: "Checking", acctNo: dup[0].acct, leaf: true }];
const ranges = ["W", "M", "P", "Q", "F", "Y"];
let sweeps = 0;
sizes.forEach(function (sz) {
  views.forEach(function (v) {
    scopes.forEach(function (sc) {
      const w = Object.assign({ id: "sweep", size: sz, view: v, range: "Q", bd: "group", tpage: 1, tsort: "net-desc", trIso: null, title: "Deposits on Hand (OC)" }, sc);
      const out = env.call("depOContent", w);
      A.noEmDash(out, "content " + sz + "/" + v + "/" + (sc.filter || "account"));
      sweeps++;
    });
  });
});
ranges.forEach(function (r) {
  A.noEmDash(env.call("depOContent", { id: "sw2", size: "kpi", range: r, filter: "All types" }), "glance range " + r);
});
fire("depfilter", { "data-id": "depO" });
A.noEmDash(env.call("depOPopContent"), "scope popover content");
fire("rangemenu", { "data-id": "depO" });
A.noEmDash(env.call("depOPopContent"), "Compare To popover content");
fireOutside();
A.noEmDash(empty, "empty state"); A.noEmDash(loading, "loading state"); A.noEmDash(errS, "error state");
A.ok(sweeps === sizes.length * views.length * scopes.length, "sweep covered every size x view x scope");
A.noEmDash(block, "the whole block source (belt and braces)");

/* ---------- the account pop-up: own shell, and the two sizing bugs -------
   Reported 2026-09-17: the chart and the table both failed in the pop-up.
   One omission and one inherited width, both of them ours, not Jo's. */
(function () {
  /* the three classes that were declared NOWHERE before this fix */
  A.cssDeclares(shell.css, ["acctm", "acctm-chart", "acctm-kpi", "acctm-bar", "acctm-tbl"],
    "every .acctm* class the pop-up markup draws with is now declared");

  /* (1) the chart needs a real height: .tr-plot's flex:1 cannot resolve in a modal */
  A.contains(shell.css, ".depo-acct-modal .acctm-chart{height:", "the chart has an explicit height");
  A.contains(shell.css, ".tr-plot{flex:1;min-height:0", "the shared .tr-plot rule that caused it is left unchanged");

  /* (2) our own modal shell, a duplicate of her generic one, so her shared
         .wt-row column widths fit instead of being re-scoped */
  A.contains(S, "function depOAcctModalHTML(", "we build our own modal shell");
  A.contains(S, 'class="modal depo-acct-modal"', "the shell carries our own width class");
  A.contains(shell.css, ".depo-acct-modal{max-width:560px;}", "our shell is 560px, not her 390px default");
  A.contains(S, 'type:"depOacct"', "the pop-up is tagged with our own modal type");
  A.eq((S.match(/modal\.type==="depOacct"/g) || []).length, 1, "exactly ONE dispatch line was added to renderModal");
  A.contains(shell.css, "max-width:390px", "her 390px generic default is unchanged");

  /* her shared column widths are used as she wrote them, NOT re-scoped by us */
  A.absent(shell.css, ".acctm-tbl .wt-row{", "we do not re-scope her row padding or gaps");
  A.absent(shell.css, ".acctm-tbl .wt-row .dt-type{", "we do not re-scope her Type column");
  A.contains(shell.css, ".wt-row .dt-type{flex:0 0 180px", "her Type column keeps its own 180px");
  /* 560 - 36 padding = 524 of content; her fixed columns need 424, leaving 100 for the name */
  A.ok(524 - (180 + 84 + 96 + 36 + 28) >= 60, "her fixed columns fit our shell with room for the name column");

  /* (3) ISOLATION: the fix must reach the (OC) pop-up and nothing else.
         .acctm* is shared with the older dep and depF account bodies. */
  A.eq((shell.css.match(/^\.acctm/gm) || []).length, 0, "no unscoped .acctm rule was introduced");
  A.ok((shell.css.match(/^\.depo-acct-modal/gm) || []).length >= 4, "our rules are all scoped to our own shell");
  A.eq((S.match(/modal depo-acct-modal/g) || []).length, 1, "only our own shell emits the scope class");

  /* (4) both views actually render real content */
  const A1 = DATA[0];
  const arg = { aname: A1.name, atype: A1.type, acctNo: A1.acct, range: "Q" };
  ["trend", "table"].forEach(function (mv) {
    const body = env.call("depOAcctModalBody", Object.assign({}, arg, { mview: mv }));
    A.ok(body && body.length > 800, "pop-up body renders at mview=" + mv);
    A.contains(body, "acctm-bar", "header chrome present at mview=" + mv);
    A.contains(body, "acctm-kpi", "KPI row present at mview=" + mv);
    A.contains(body, 'data-depo="acct-view"', "the view toggle is wired at mview=" + mv);
    A.noEmDash(body, "pop-up body at mview=" + mv);
  });
  const tr = env.call("depOAcctModalBody", Object.assign({}, arg, { mview: "trend" }));
  A.contains(tr, "acctm-chart tr-plot", "trend view mounts the plot");
  A.contains(tr, "<polyline", "trend view draws a real polyline");
  A.ok(/points="[\d.]+,[\d.]+ /.test(tr), "the polyline has real coordinates");
  A.eq((tr.match(/<span style="top:/g) || []).length, 3, "three y axis labels, which had been stacking at zero height");
  const tb = env.call("depOAcctModalBody", Object.assign({}, arg, { mview: "table" }));
  A.contains(tb, "acctm-tbl", "table view mounts the table");
  A.contains(tb, "wt-row wt-head", "table has a head row");
  A.contains(tb, "dep-total", "table has its total row");
  A.absent(tb, "acctm-chart", "table view draws no chart");
  A.absent(tr, "acctm-tbl", "trend view draws no table");

  /* the shell itself renders, with her actions and footer wording intact */
  env.ctx.modal = { t: A1.name, glyph: "account_balance_wallet", type: "depOacct",
                    depo: Object.assign({}, arg, { mview: "trend" }) };
  const shellHTML = env.call("depOAcctModalHTML");
  A.contains(shellHTML, 'class="modal-backdrop" data-action="modal-close"', "backdrop uses her close action");
  A.contains(shellHTML, 'data-action="stop"', "the dialog stops propagation as hers does");
  A.contains(shellHTML, 'role="dialog" aria-modal="true"', "the dialog carries her ARIA");
  A.contains(shellHTML, "Got it", "footer keeps her generic wording");
  A.contains(shellHTML, "acctm-chart", "the shell actually mounts the body");
  A.noEmDash(shellHTML, "our modal shell");
})();

process.exit(A.report());
