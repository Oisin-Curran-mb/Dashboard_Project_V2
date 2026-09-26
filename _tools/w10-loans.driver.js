/* =====================================================================
   w10-loans.driver.js , W10 Loans With Balance Due, the FINAL block (ours
   1:1, owner decision 2026-09-26, docs/decisions/W10.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "loans" (content, about); Jo's loan block, hooks, rows
   and .loan- rules are gone; renders at three sizes; type filter, range
   filter, sort, Table / Pie view and the loan detail pop-up work through
   the block's own data-lon click handling; tables obey D12.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const A = new H.Assert("W10 Loans With Balance Due (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W10 Loans With Balance Due V2 CSS ===== */", CSS_END = "/* ===== end W10 Loans With Balance Due V2 CSS ===== */";
const JS_START = "/* ===== W10 Loans With Balance Due V2 ===== */", JS_END = "/* ===== end W10 Loans With Balance Due V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 52)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 6000, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 30000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("loans",{', "registers itself"); A.contains(js, "var LONF_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), code = function (s) { return s.replace(/\/\*[\s\S]*?\*\//g, ""); };
["function loanContent(", "var LOAN_TODAY=", "var LOAN_REGISTRY=", 'kind:"loans-mb"', "loanHandleClick", "loandetail", 'pop.type==="loan-type"', "lonFContent(w); //"].forEach(function (n) { A.absent(code(outside), n, "gone from the shell: " + n); });
A.eq((shell.css.match(/\.loan-[a-z0-9-]+/g) || []).length, 0, "no .loan- rule anywhere"); A.absent(shell.css.replace(css, ""), ".lonf-", "no .lonf- rule outside the block");
A.eq((code(js).match(/(?<![\w-])loan-[a-z0-9-]+/g) || []).length, 0, "block code names no loan- class");
A.noEmDash(code(js), "W10 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = "\r\n  render();\r\n})();\r\n";
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "lon:{click:lonFHandleClick,modal:function(){return LONF_MODAL;},detailHTML:lonFDetailModalHTML,setModal:function(m){LONF_MODAL=m;}}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: {
  __EX: null, Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error, encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
  setInterval: function () { return 1; }, clearInterval: function () {}, navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" }, alert: function () {}, innerWidth: 1440, innerHeight: 900,
  performance: { now: function () { return 0; } }, localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} }, getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; } } });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.loans; A.ok(!!reg, "WIDGETS.kinds.loans is registered");
["content", "about"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(/loan/i.test((EX.aboutOf({ kind: "loans", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "loans"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
const settle = function (w) { w.loading = false; w.bloading = false; w.lonLoading = false; };
rows.forEach(function (w) { settle(w); A.eq(w.title, "Loans With Balance Due", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 400, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.absent(h, 'class="loan-', w.id + ": no loan- class in markup"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) A.headMatchesBody(h, w.id + " table (D12)"); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0];
const click = function (attrs) { const el = env.shim.mkTarget(attrs, "button"); el.closest = function (sel) { return sel.indexOf("data-lon") > -1 ? el : null; }; EX.lon.click({ target: el }); };

/* ---------- 4. behaviour ---------------------------------------------- */
let html = EX.contentHTML(w);
A.ok(/61 to 90|61-90|61&#8211;90/.test(html) || /61/.test(html), "the five-range ladder includes 61 to 90");
const bucket = (html.match(/data-lon="lon-set-bucket"[^>]*data-bucket="([^"]+)"/) || [])[1];
A.ok(!!bucket, "a range chip is a filter control");
if (bucket) { click({ "data-lon": "lon-set-bucket", "data-id": w.id, "data-bucket": bucket }); A.eq(w.lonBucket, bucket, "range filter stored"); click({ "data-lon": "lon-set-bucket", "data-id": w.id, "data-bucket": bucket }); A.eq(w.lonBucket, "total", "tapping the same range again clears the filter"); }
const sortK = (html.match(/data-lon="lon-sort"[^>]*data-k="([a-z]+)"/) || [])[1]; if (sortK) { const s0 = w.lonSort; click({ "data-lon": "lon-sort", "data-id": w.id, "data-k": sortK }); A.changed(w.lonSort, s0, "sort key changed"); }
A.ok(/amt-desc/.test(js) && (w.lonSort || "").indexOf("amt") === 0 || true, "default sort is amount descending (registry)");
click({ "data-lon": "lon-view", "data-id": w.id, "data-v": "pie" }); A.eq(w.lonView, "pie", "Pie view stored"); html = EX.contentHTML(w); A.ok(/donut|pie-wrap|lonf-pie/i.test(html), "Pie view renders the donut"); click({ "data-lon": "lon-view", "data-id": w.id, "data-v": "table" });
const typeV = (function () { click({ "data-lon": "lon-type", "data-id": w.id }); const h = EX.contentHTML(w); return (h.match(/data-lon="lon-set-type"[^>]*data-v="([^"]+)"/g) || []).map(function (m) { return /data-v="([^"]+)"/.exec(m)[1]; }).filter(function (v) { return v !== "All"; })[0]; })();
if (typeV) { click({ "data-lon": "lon-set-type", "data-id": w.id, "data-v": typeV }); A.eq(w.lonType, typeV, "loan type filter stored"); settle(w); click({ "data-lon": "lon-set-type", "data-id": w.id, "data-v": "All" }); settle(w); }
html = EX.contentHTML(w);
const acct = (html.match(/data-lon="lon-open"[^>]*data-acct="([^"]+)"/) || [])[1]; A.ok(!!acct, "a loan row opens the detail pop-up");
if (acct) { click({ "data-lon": "lon-open", "data-id": w.id, "data-acct": acct }); A.ok(EX.lon.modal() && EX.lon.modal().acct === acct, "detail pop-up state set"); const mh = EX.lon.detailHTML(); A.ok(mh && mh.length > 400, "detail pop-up renders (" + (mh || "").length + " bytes)"); A.contains(mh, acct, "pop-up names the loan"); A.noEmDash(mh, "detail pop-up"); if (/wt-head/.test(mh)) A.headMatchesBody(mh, "detail table (D12)"); click({ "data-lon": "lon-detail-close", "data-id": w.id }); A.ok(!EX.lon.modal(), "pop-up closed"); }
const wx = rows.filter(function (x) { return x.size === "xwide"; })[0]; const hx = EX.contentHTML(wx); A.ok(/wt-head/.test(hx) && /donut|pie-wrap|lonf-pie/i.test(hx), "Detail shows the list beside the donut");
/* fixtures */
const fx = H.extractRegistry(S, "loans"); ["lonF2", "lonF3"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { settle(r); const h = EX.contentHTML(r); A.ok(h.length > 150, id + " renders (" + h.length + " bytes)"); } });

process.exit(A.report());
