/* =====================================================================
   w09-pto.driver.js , W09 Payroll Scheduled Time Off, the FINAL block (ours
   1:1, owner decision 2026-09-26, docs/decisions/W09.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "pto" (content, about); Jo's pto block, hooks, rows and
   .pto- rules are gone, our block stands on w09- copies; renders at three
   sizes; queue / calendar views, status filter, grouping, calendar month
   stepping and the per-day approve path work; header rows obey D12 (nested
   table form). The block handles its own data-pto clicks.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const A = new H.Assert("W09 Payroll Scheduled Time Off (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W09 Payroll Scheduled Time Off V2 CSS ===== */", CSS_END = "/* ===== end W09 Payroll Scheduled Time Off V2 CSS ===== */";
const JS_START = "/* ===== W09 Payroll Scheduled Time Off V2 ===== */", JS_END = "/* ===== end W09 Payroll Scheduled Time Off V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 56)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 8000, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 40000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("pto",{', "registers itself"); A.contains(js, "var PTOF_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), code = function (s) { return s.replace(/\/\*[\s\S]*?\*\//g, ""); };
["function ptoContent(", "var PTO_DEPTS_MAIN=", 'kind:"pto-mb"', "ptoConfirmModalHTML", 'pop.type==="pto-year"', 'a==="pto-approve-day"', "ptoFContent(w); //"].forEach(function (n) { A.absent(code(outside), n, "gone from the shell: " + n); });
A.eq((shell.css.match(/\.pto-[a-z0-9-]+/g) || []).length, 0, "no .pto- rule anywhere"); A.absent(shell.css.replace(css, ""), ".w09-", "no .w09- rule outside the block"); A.absent(shell.css.replace(css, ""), ".ptof-", "no .ptof- rule outside the block");
A.eq((code(js).match(/(?<![\w-])pto-[a-z0-9-]+(?=["' ])/g) || []).filter(function (c) { return /^pto-(abtn|actioncol|appr-chip|caption|colhead|count-badge|ctx|datecol|dept-nm|emp-meta|emp-nm|hrcol|l1|l2|numwrap|pill|undo)/.test(c); }).length, 0, "block code names no shared pto- class");
["w09-l1", "w09-pill", "w09-abtn", "w09-count-badge"].forEach(function (c) { A.contains(css, "." + c, "W09 declares its own " + c); });
A.noEmDash(code(js), "W09 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = "\r\n  render();\r\n})();\r\n";
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "pto:{click:ptoFHandleClick,calStep:ptoFCalStep,closeOverlay:ptoFCloseOverlay,closePop:ptoFClosePop,info:function(id,pk){PTOF_INFO={id:id,pk:pk};var h=ptoFInfoPanelHTML();PTOF_INFO=null;return h;}}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: {
  __EX: null, Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error, encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
  setInterval: function () { return 1; }, clearInterval: function () {}, navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" }, alert: function () {}, innerWidth: 1440, innerHeight: 900,
  performance: { now: function () { return 0; } }, localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} }, getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; } } });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.pto; A.ok(!!reg, "WIDGETS.kinds.pto is registered");
["content", "about"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(/time off|leave/i.test((EX.aboutOf({ kind: "pto", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "pto"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
const headSubset = function (h, msg) {
  const rowsH = [...h.matchAll(/<div class="wt-row([^"]*)"[^>]*>([\s\S]*?)<\/div>/g)];
  const head = rowsH.find(function (r) { return /\bwt-head\b/.test(r[1]); }), bodies = rowsH.filter(function (r) { return !/\bwt-head\b/.test(r[1]); });
  if (!head || !bodies.length) return A.ok(true, msg + ": no header/body pair to compare");
  const cells = function (s) { return [...s.matchAll(/<span class="([^"]*)"/g)].filter(function (m) { return s.slice(0, m.index).split("<span").length - 1 === s.slice(0, m.index).split("</span>").length - 1; }).map(function (m) { return m[1].split(/\s+/).filter(Boolean); }); };
  const hc = cells(head[2]); let bad = [];
  bodies.slice(0, 3).forEach(function (b, bi) { const bc = cells(b[2]); if (bc.length < hc.length) { bad.push("row " + (bi + 1) + " has " + bc.length + " cells vs " + hc.length); return; } hc.forEach(function (c, i) { c.forEach(function (k) { if (bc[i].indexOf(k) < 0) bad.push("row " + (bi + 1) + " col " + (i + 1) + " lacks " + k); }); }); });
  A.ok(!bad.length, msg + ": header classes carried by body cells" + (bad.length ? "  (" + bad.slice(0, 3).join("; ") + ")" : ""));
};
const settle = function (w) { w.loading = false; w.bloading = false; w.ptofLoading = false; };
rows.forEach(function (w) { settle(w); A.eq(w.title, "Payroll Scheduled Time Off", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 300, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.eq((h.match(/class="[^"]*(?<![\w-])pto-[a-z0-9-]+/g) || []).length, 0, w.id + ": no shared pto- class in markup"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) headSubset(h, w.id + " table (D12)"); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0];

/* ---------- 4. behaviour ---------------------------------------------- */
let html = EX.contentHTML(w);
A.ok(/Pending/.test(html) && /Outstanding|Approved/.test(html), "queue shows the status vocabulary");
/* owner (26 Sep): header = view switch alone on the top row, view-specific controls in a sub-row, KPI row in the queue only; Glance untouched */
rows.forEach(function (r) { const h = EX.contentHTML(r); if (r.size === "kpi") { A.absent(h, "ptof-subrow", r.id + ": Glance has no sub-row"); return; }
  A.ok(/<div class="dep-hd ptof-hd"><div class="dep-hd-top"><div class="dep-hd-toggle">/.test(h), r.id + ": top row starts with the view switch");
  A.ok(/<\/div><div class="ptof-subrow"><div class="ptof-ctlrow">/.test(h), r.id + ": view controls sit in the sub-row");
  A.contains(h, "dep-hd-num", r.id + ": queue view keeps the KPI row");
  const c = Object.assign({}, r, { ptofView: "calendar" }); const hc = EX.contentHTML(c); A.absent(hc, "dep-hd-num", r.id + ": calendar view has no KPI row"); A.contains(hc, "ptof-subrow", r.id + ": calendar view keeps the Department sub-row"); });
/* owner (26 Sep): no placeholder / API-gap note under the queue at Explore or Detail */
rows.forEach(function (r) { if (r.size !== "kpi") { A.absent(EX.contentHTML(r), "Placeholder, not yet available: approving", r.id + ": no placeholder note under the queue"); } });
A.absent(js, "function ptoFGapNote", "the gap-note function is gone");
w.ptofStatus = "approved"; html = EX.contentHTML(w); A.ok(html.length > 400, "Approved status filter renders"); w.ptofStatus = "pending";
w.ptofQueueGroup = "pg"; html = EX.contentHTML(w); A.ok(html.length > 400, "Pay Group grouping renders"); A.noEmDash(html, "pay group view"); w.ptofQueueGroup = "dept";
/* per-day approve via the block's own click handler */
html = EX.contentHTML(w);
const person = (html.match(/data-pto="pto-person"[^>]*data-person="([^"]+)"/) || [])[1];
A.ok(!!person, "a person row offers the expander"); A.absent(html, 'data-pto="pto-approve"', "day-lines (and their Approve buttons) are hidden while the person is collapsed");
if (person) {
  w.ptofOpen = w.ptofOpen || {}; w.ptofOpen[person] = true; html = EX.contentHTML(w);
  const day = (html.match(/data-pto="pto-approve"[^>]*data-day="([^"]+)"/) || [])[1];
  A.ok(!!day, "an expanded person shows per-day Approve buttons");
  if (day) { const before = (html.match(/data-pto="pto-approve"/g) || []).length; const el = env.shim.mkTarget({ "data-pto": "pto-approve", "data-id": w.id, "data-day": day }, "button"); el.closest = function (sel) { return sel.indexOf("data-pto") > -1 ? el : null; }; EX.pto.click({ target: el }); const after = (EX.contentHTML(w).match(/data-pto="pto-approve"/g) || []).length; A.eq(after, before - 1, "approving one day removes exactly that day's Approve button (" + before + " -> " + after + ")"); }
  delete w.ptofOpen[person];
}
/* person Info pop-up (owner, 26 Sep): two sections, no placeholder note */
if (person) {
  const ih = EX.pto.info(w.id, person);
  A.ok(ih.length > 400, "Info pop-up renders (" + ih.length + " bytes)"); A.absent(ih, "Placeholder", "no placeholder note in the pop-up");
  A.contains(ih, "Pending approval, ", "Pending approval section with its day count"); A.contains(ih, "Taken and approved, ", "Taken and approved section with its day count");
  A.ok(/Also out from [^<]+ during these dates|No one else from/.test(ih), "same-department overlap under the pending section");
  A.absent(ih, "Also off during these dates", "old all-departments overlap heading gone"); A.noEmDash(ih, "Info pop-up");
}
/* calendar */
w.ptofView = "calendar"; html = EX.contentHTML(w); A.contains(html, "ptof-cal", "Leave Calendar renders the month grid"); A.noEmDash(html, "calendar");
const m0 = html.match(/ptof-cal-t-[a-z]+/); A.ok(!!m0, "calendar tier class present");
EX.pto.calStep(w, 1); const h2 = EX.contentHTML(w); A.changed(h2, html, "stepping a month changes the grid"); EX.pto.calStep(w, -1);
w.ptofView = "queue";
EX.pto.closeOverlay(); EX.pto.closePop(); A.ok(true, "overlay / popover close callable");
/* fixtures */
const fx = H.extractRegistry(S, "pto"); ["ptoF2", "ptoF3"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { settle(r); const h = EX.contentHTML(r); A.ok(h.length > 150, id + " renders (" + h.length + " bytes)"); } });

process.exit(A.report());
