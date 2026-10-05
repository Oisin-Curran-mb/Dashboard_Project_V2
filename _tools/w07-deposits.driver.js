/* =====================================================================
   w07-deposits.driver.js , W07 Deposits on Hand, the FINAL block (ours 1:1,
   owner decision 2026-09-26, docs/decisions/W07.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "deposits" (content, about, the account pop-up modal);
   Jo's deposits-mb is gone with its .depf- rules; renders at three sizes;
   table paging over the full set, the three views, the chart drill
   (re-scope to a type) and the per-account pop-up work; tables obey D12.
   Also: "Account Type" is the vocabulary everywhere (a rename to "Product"
   was built and reverted on 2026-10-01 to match the rest of the Deposits on
   Hand UI), the scope list is driven by the configured account type registry
   so a type with no accounts still lists, and Inception sorts by date order.
   The block handles its own clicks through data-depo attributes, so the
   behaviour is driven through the functions it exports for the test.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W07");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W07 Deposits on Hand V2 CSS ===== */", CSS_END = "/* ===== end W07 Deposits on Hand V2 CSS ===== */";
const JS_START = "/* ===== W07 Deposits on Hand V2 ===== */", JS_END = "/* ===== end W07 Deposits on Hand V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 48)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 1500, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 40000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("deposits",{', "registers itself"); A.contains(js, "var DEPO_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), code = H.code;   /* strip block comments, shared */
["function depFContent(", "var DEPF_", 'kind:"deposits-mb"', 'kind:"deposits-oc"', "depFfq", 'if(w.kind==="deposits")return depContent(w);', 'modal.type==="depOacct"'].forEach(function (n) { A.absent(code(outside), n, "gone from the shell: " + n); });
A.eq((shell.css.match(/\.depf-[a-z0-9-]+/g) || []).length, 0, "no .depf- rule anywhere"); A.absent(shell.css.replace(css, ""), ".depo-", "no .depo- rule outside the block");
A.contains(outside, "function depSparkHTML(", "the shell keeps depSparkHTML (W01's glance spark uses it)");
A.noEmDash(code(js), "W07 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "depO:{openAcct:depOOpenAcct,drill:depODrillType,openPop:depOOpenPop,closePop:depOClosePop,data:DEPO_DEP,types:DEPO_TYPES,popFilter:function(id){DEPO_POP={type:'depfilter',id:id};DEPO_FQ='';return depOPopContent();}}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.deposits; A.ok(!!reg, "WIDGETS.kinds.deposits is registered");
["content", "about"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(reg.modals && reg.modals.depOacct, "owns the account pop-up modal");
A.ok(/holds on behalf/i.test((EX.aboutOf({ kind: "deposits", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "deposits"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
const settle = function (w) { w.loading = false; w.bloading = false; w.depoLoading = false; w.dloading = false; };
rows.forEach(function (w) { settle(w); A.eq(w.title, "Deposits on Hand", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 400, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.absent(h, "depf-", w.id + ": no depf- name in markup"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) A.headMatchesBody(h, w.id + " table (D12)"); });
const sys = EX.dashboards.filter(function (d) { return d.id === "sys"; })[0]; if (sys) { const s1 = sys.widgets.filter(function (w) { return w.id === "s1"; })[0]; A.ok(s1 && s1.kind === "deposits", "System dashboard sample row uses the final kind"); if (s1) { settle(s1); A.ok(EX.contentHTML(s1).length > 400, "s1 renders"); } }
const w = rows.filter(function (x) { return x.size === "wide"; })[0];

/* ---------- 4. behaviour ---------------------------------------------- */
let html = EX.contentHTML(w);
A.eq((html.match(/class="wt-row wt-rowh"/g) || []).length, 50, "the table loads 50 accounts first");
A.ok(/\$106,726,837/.test(html), "the total row cross-foots the full 125-account dataset");
A.ok(/Load 50 more/.test(html) && /75 remaining/.test(html), "first 50 load, with a Load 50 more button"); A.absent(html, "dep-pager", "no page-forward/back pager"); A.ok(html.indexOf("w07-more") < html.indexOf("dep-total"), "the button sits at the end of the scroll list, above the Total"); w.tshown = 100; html = EX.contentHTML(w); A.ok(/Load 25 more/.test(html), "after one load, 100 shown and 25 left"); w.tshown = 150; html = EX.contentHTML(w); A.absent(html, "w07-more", "button gone once everything is loaded"); w.tshown = 50;
w.view = "dist"; html = EX.contentHTML(w); A.ok(/donut|pie-wrap/.test(html), "Distribution view renders the donut"); A.noEmDash(html, "distribution view");
w.view = "trend"; html = EX.contentHTML(w); A.ok(/tr-canvas/.test(html), "Trend view renders the line chart"); A.noEmDash(html, "trend view"); w.view = "table";
/* Compare To offers the fiscal Period between month and quarter */
A.ok(/Previous period|period/i.test(EX.contentHTML(w)) || /"P"/.test(js), "Compare To carries the fiscal Period option");
/* chart drill: a type re-scopes the widget and flips the breakdown to By Account */
EX.depO.drill(w, "Checking"); A.eq(w.filter, "Checking", "type drill re-scopes the filter"); A.eq(w.bd, "group", "breakdown flips to By Account"); A.eq(w.tshown, 50, "lazy list resets to the first 50");
html = EX.contentHTML(w); A.ok(html.length > 400, "re-scoped widget renders"); if (/wt-head/.test(html)) A.headMatchesBody(html, "re-scoped table (D12)");
w.filter = "All types";
/* the per-account pop-up */
const acct = EX.depO.data[0]; A.ok(!!acct, "an account exists in the dataset");
EX.depO.openAcct(w, acct.name, acct.type, acct.acct);
A.eq(EX.getModal() && EX.getModal().type, "depOacct", "account pop-up opened");
let mh = EX.modalHTML(); A.ok(mh && mh.length > 800, "pop-up renders via WIDGETS.modal() (" + (mh || "").length + " bytes)"); A.contains(mh, "depo-acct-modal", "pop-up uses the block's 560px shell"); A.noEmDash(mh, "account pop-up");
if (/wt-head/.test(mh)) A.headMatchesBody(mh, "account pop-up table (D12)");
A.contains(mh, acct.name, "pop-up names the account");
EX.setModal(null);
/* scope popover: the block's own inline popover needs a real anchor element; closing is safe to call */
EX.depO.closePop(); A.ok(true, "scope popover close is callable without a popover");
/* fixtures */
const fx = H.extractRegistry(S, "deposits"); ["depO4", "depO5"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { settle(r); const h = EX.contentHTML(r); A.ok(h.length > 150, id + " renders (" + h.length + " bytes)"); } });

/* time window chip: same picker and wording as W01 Budget Compared to Actual (owner ask 2026-10-01) */
(function () {
  function TT(attrs) { return { getAttribute: function (k) { return (attrs || {})[k] || null; }, closest: function () { return null; } }; }
  const h0 = EX.contentHTML(w); A.contains(h0, 'data-action="depO-span"', "header carries the time window chip"); A.contains(h0, "This quarter", "default window reads This quarter"); A.absent(h0, "vs quarter", "old compare button gone");
  A.eq(EX.WIDGETS.click("depO-span", w.id, TT(), {}), true, "chip opens the shell popover"); A.eq(EX.getPop() && EX.getPop().type, "depO-span", "pop state set");
  const pc = EX.popContent(); A.contains(pc, "Show change over", "picker heading says what Deposits measures"); ["This month", "This period", "This quarter", "This year", "This fiscal year"].forEach(function (l) { A.contains(pc, l, "offers " + l); }); A.absent(pc, "This week", "no week option");
  A.eq(EX.WIDGETS.click("depO-set-span", w.id, TT({ "data-s": "F" }), {}), true, "window applied"); A.eq(w.range, "F", "range stored"); A.contains(EX.contentHTML(w), "This fiscal year", "chip label follows"); A.absent(EX.contentHTML(w), "since ", "no start date in the header");
  const H2 = function (r) { w.range = r; return EX.contentHTML(w).replace(/data-id="[^"]*"/g, "").replace(/This (month|period)/g, "X"); }; A.eq(H2("P"), H2("M"), "This period draws the same numbers as This month (one-month period in the demo)");
  const g = rows.filter(function (x) { return x.size === "kpi"; })[0]; if (g) { const gh = EX.contentHTML(g); A.contains(gh, "vs quarter", "Glance caption uses Jo's wording (vs quarter)"); A.absent(gh, "since ", "no start date on the Glance"); A.contains(gh, 'data-action="depO-span"', "Glance caption opens the same picker"); }
  w.range = "Q";
})();
/* balances are always today's; only the % moves with the window, and every view agrees (owner rule 2026-10-01) */
(function () {
  const keep = { view: w.view, range: w.range }; w.view = "dist";
  function bal(h) { return [(h.match(/metric-value">([^<]*)/) || [])[1]].concat((h.match(/class="lg-meta">[^<]*/g) || [])).join("|"); }
  function pct(h) { return (h.match(/delta-pill[^>]*>.*?<\/span>([0-9.]+%)/) || [])[1]; }
  w.range = "M"; const b0 = bal(EX.contentHTML(w)), seen = {};
  ["P", "Q", "Y", "F"].forEach(function (r) { w.range = r; const h = EX.contentHTML(w); A.eq(bal(h), b0, r + ": headline and pie balances are today's, unchanged by the window"); A.contains(h, "w07-chg", r + ": pie legend shows each slice's change"); seen[r] = pct(h); });
  A.ok(seen.Q !== seen.Y, "the % changes with the window");
  ["Q", "F"].forEach(function (r) { w.range = r; w.view = "dist"; const a = pct(EX.contentHTML(w)); w.view = "trend"; A.eq(pct(EX.contentHTML(w)), a, r + ": headline % is the same on Distribution and Trend"); });
  w.view = keep.view; w.range = keep.range;
})();
/* ---- account type vocabulary, the configured registry and the Inception
        column. Owner rulings 2026-10-01: a rename to "Product" was built and
        then reverted, because the rest of the Deposits on Hand UI says Account
        Type and the module should read one way. The registry, the empty type
        and the Inception column are aligned with the legacy widget,
        Shelby.Web.Financials/DataPanelControls/DepositAccounts.ascx.cs. ------ */
(function () {
  const keep = { filter: w.filter, tsort: w.tsort, acct: w.acct };
  /* 1. vocabulary: "Account Type" everywhere, no stray "Product", in EVERY view
        and breakdown. Checking only a row's default view is what let the Trend
        legend heading, which carries its own label, keep the wrong word. */
  rows.forEach(function (r) {
    settle(r);
    const kv = r.view, kb = r.bd;
    ["table", "dist", "trend"].forEach(function (v) {
      ["group", "total"].forEach(function (b) {
        r.view = v; r.bd = b;
        A.absent(EX.contentHTML(r), "Product", r.id + " (" + r.size + ", " + v + "/" + b + "): no stray Product");
      });
    });
    r.view = kv; r.bd = kb;
  });
  /* the two labels the donut does not own */
  (function () {
    const kv = w.view, kb = w.bd, ki = w.trIso;
    w.view = "trend"; w.bd = "group"; w.trIso = null;
    A.contains(EX.contentHTML(w), '<div class="tr-lg-hd">Account Types</div>', "Trend legend heading reads Account Types");
    w.trIso = 0;
    A.contains(EX.contentHTML(w), "Show all account types", "isolate clear button reads Show all account types");
    w.view = kv; w.bd = kb; w.trIso = ki;
  })();
  w.view = "dist"; w.bd = "group";
  A.contains(EX.contentHTML(w), "By Account Type", "Distribution breakdown toggle reads By Account Type");
  w.view = "table";
  w.filter = "Checking"; w.acct = null;
  A.contains(EX.contentHTML(w), "Account Type: Checking", "scope chip reads Account Type");
  w.filter = "All types";

  /* 2. the scope list comes from the configured registry, not from the accounts
        present, so an account type with no accounts still lists, the way the
        legacy dropdown lists every type set up under the bank account */
  const used = {}; EX.depO.data.forEach(function (a) { used[a.type] = true; });
  const reg = EX.depO.types;
  A.ok(Array.isArray(reg) && reg.length > 0, "account type registry readable (" + reg.length + " types)");
  Object.keys(used).forEach(function (t) { A.ok(reg.indexOf(t) > -1, "registry covers the type in use: " + t); });
  const empty = reg.filter(function (t) { return !used[t]; });
  A.eq(empty.length, 1, "exactly one configured account type has no accounts");
  A.eq(reg.slice().sort(function (a, b) { return a.localeCompare(b); }).join("|"), reg.join("|"), "registry is ordered by name, as the legacy page orders it");
  const list = EX.depO.popFilter(w.id);
  A.contains(list, '<div class="cap">Account Type</div>', "scope list heading reads Account Type");
  A.contains(list, "Search account types or accounts", "search placeholder names account types");
  A.absent(list, "Product", "scope list carries no stray Product");
  A.contains(list, empty[0], "the account type with no accounts still lists: " + empty[0]);
  A.contains(list, "All Accounts", "Show-All equivalent still at the top");
  A.ok(/class="cap">Accounts</.test(list), "accounts still list beneath the types (owner ruling: they are where the money sits)");

  /* 3. selecting that type gives an honest empty state, not a blank table, and
        keeps its header so the scope chip stays reachable */
  w.filter = empty[0]; w.acct = null;
  const eh = EX.contentHTML(w);
  A.contains(eh, "No accounts on " + empty[0], "an account type with no accounts renders a scoped empty state");
  A.contains(eh, 'data-kind="empty"', "it uses the shared empty state primitive");
  A.absent(eh, "wt-head", "no empty table is drawn");
  A.contains(eh, 'data-depo="depfilter"', "the scope chip survives, so the empty type is not a dead end");
  A.contains(eh, "Account Type: " + empty[0], "the chip still names the scope you are in");
  A.ok(EX.depO.popFilter(w.id).indexOf("All Accounts") > -1, "and the list it opens still offers the way back");
  A.noEmDash(eh, "scoped empty state");
  w.filter = "All types";

  /* 4. Inception column: present, D12-aligned, and sorted by date not by text */
  let th = EX.contentHTML(w);
  A.contains(th, "Inception", "table has an Inception column");
  A.ok(/dt-type"><button[^>]*>Type /.test(th), "the type column header reads Type");
  A.eq((th.match(/class="dt-c dt-inc"/g) || []).length, 51, "one Inception header plus 50 loaded rows");
  A.headMatchesBody(th, "table with Inception (D12)");
  function incepts(h) { return (h.match(/class="dt-c dt-inc">([^<]*)/g) || []).slice(1).map(function (x) { return x.replace(/.*>/, ""); }); }
  function key(v) { const p = String(v).split(" "), m = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }; return (parseInt(p[1], 10) || 0) * 12 + (m[p[0]] || 0); }
  w.tsort = "incept-asc"; const asc = EX.contentHTML(w);
  w.tsort = "incept-desc"; const desc = EX.contentHTML(w);
  const a0 = incepts(asc)[0], d0 = incepts(desc)[0];
  A.ok(!!a0 && !!d0, "both sort directions render an inception date (" + a0 + " / " + d0 + ")");
  A.ok(key(a0) < key(d0), "ascending starts earlier than descending: " + a0 + " before " + d0);
  const allAsc = incepts(asc).map(key);
  A.ok(allAsc.every(function (v, i) { return i === 0 || allAsc[i - 1] <= v; }), "ascending page is in true date order, not alphabetical");
  A.ok(key("Jan 2011") < key("Feb 2014") && key("Sep 2020") < key("Apr 2023"), "the date key orders months within and across years");

  /* 5. the account number stays in the name stack (owner ruling: cleaner) */
  A.absent(th, 'dt-c dt-acctno', "no separate account number column");
  A.contains(th, 'class="lr-acctno"', "account number stays attached to the name");
  w.filter = keep.filter; w.tsort = keep.tsort; w.acct = keep.acct;
})();
process.exit(A.report());
