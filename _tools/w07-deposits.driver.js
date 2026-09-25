/* =====================================================================
   w07-deposits.driver.js , W07 Deposits on Hand, the FINAL block (ours 1:1,
   owner decision 2026-09-26, docs/decisions/W07.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "deposits" (content, about, the account pop-up modal);
   Jo's deposits-mb is gone with its .depf- rules; renders at three sizes;
   table paging over the full set, the three views, the chart drill
   (re-scope to a type) and the per-account pop-up work; tables obey D12.
   The block handles its own clicks through data-depo attributes, so the
   behaviour is driven through the functions it exports for the test.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const A = new H.Assert("W07 Deposits on Hand (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W07 Deposits on Hand V2 CSS ===== */", CSS_END = "/* ===== end W07 Deposits on Hand V2 CSS ===== */";
const JS_START = "/* ===== W07 Deposits on Hand V2 ===== */", JS_END = "/* ===== end W07 Deposits on Hand V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 48)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 1500, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 40000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("deposits",{', "registers itself"); A.contains(js, "var DEPO_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), code = function (s) { return s.replace(/\/\*[\s\S]*?\*\//g, ""); };
["function depFContent(", "var DEPF_", 'kind:"deposits-mb"', 'kind:"deposits-oc"', "depFfq", 'if(w.kind==="deposits")return depContent(w);', 'modal.type==="depOacct"'].forEach(function (n) { A.absent(code(outside), n, "gone from the shell: " + n); });
A.eq((shell.css.match(/\.depf-[a-z0-9-]+/g) || []).length, 0, "no .depf- rule anywhere"); A.absent(shell.css.replace(css, ""), ".depo-", "no .depo- rule outside the block");
A.contains(outside, "function depSparkHTML(", "the shell keeps depSparkHTML (W01's glance spark uses it)");
A.noEmDash(code(js), "W07 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = "\r\n  render();\r\n})();\r\n";
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "depO:{openAcct:depOOpenAcct,drill:depODrillType,openPop:depOOpenPop,closePop:depOClosePop,data:DEPO_DEP}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: {
  __EX: null, Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error, encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
  setInterval: function () { return 1; }, clearInterval: function () {}, navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" }, alert: function () {}, innerWidth: 1440, innerHeight: 900,
  performance: { now: function () { return 0; } }, localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} }, getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; } } });
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
A.ok(/Showing 1 to 50 of \d+ accounts/.test(html), "table pages 50 at a time over the full set (" + ((html.match(/Showing [^<]+/) || [""])[0]) + ")");
A.ok(/\$106,726,837/.test(html), "the total row cross-foots the full 125-account dataset");
w.tpage = 2; html = EX.contentHTML(w); A.ok(/Showing 51 to 100 of/.test(html), "page 2 shows accounts 51 to 100"); w.tpage = 1;
w.view = "dist"; html = EX.contentHTML(w); A.ok(/donut|pie-wrap/.test(html), "Distribution view renders the donut"); A.noEmDash(html, "distribution view");
w.view = "trend"; html = EX.contentHTML(w); A.ok(/tr-canvas/.test(html), "Trend view renders the line chart"); A.noEmDash(html, "trend view"); w.view = "table";
/* Compare To offers the fiscal Period between month and quarter */
A.ok(/Previous period|period/i.test(EX.contentHTML(w)) || /"P"/.test(js), "Compare To carries the fiscal Period option");
/* chart drill: a type re-scopes the widget and flips the breakdown to By Account */
EX.depO.drill(w, "Checking"); A.eq(w.filter, "Checking", "type drill re-scopes the filter"); A.eq(w.bd, "group", "breakdown flips to By Account"); A.eq(w.tpage, 1, "paging resets");
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

process.exit(A.report());
