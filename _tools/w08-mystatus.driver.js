/* =====================================================================
   w08-mystatus.driver.js , W08 My Status, the FINAL block (Jo's version,
   owner decision 2026-09-25, docs/decisions/W08.md).

   Hosts the whole shell in the shim (the cmp-driver idiom) and proves:
     - the block is self-contained: one CSS region, one JS region (data +
       render + handlers + registration) placed BEFORE the registry
     - it plugs in only through WIDGETS.register("mystatus", ...)
     - content renders at both of its sizes with no em dash
     - the config modal, records modal, options popover and every click
       action work through the registration, not through if-chains
     - the deleted clone (mystatus-oc / mysO) has left no trace
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const A = new H.Assert("W08 My Status (final)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W08 My Status V2 CSS ===== */", CSS_END = "/* ===== end W08 My Status V2 CSS ===== */";
const JS_START = "/* ===== W08 My Status V2 =====", JS_END = "/* ===== end W08 My Status V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 40)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END);
const js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 3000, "CSS region has substance (" + css.length + " bytes)");
A.ok(js.length > 8000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal (its data is read at load)");
["var MYS_AREA", "var MYS_QUERIES", "var MYS_DEFAULT", "function mysFind(", "function mysContent(", "function mysConfigModalHTML(",
 "function mysDetailModalHTML(", "function mysPopContent(", "function mysHandleClick(", "function mysHandleInput(",
 'WIDGETS.register("mystatus"'].forEach(function (n) { A.contains(js, n, "block holds " + n); });
["mysContent", "mysHandleClick", "mysHandleInput", "mysConfigModalHTML", "mysDetailModalHTML", "mysPopContent"].forEach(function (n) {
  A.eq((S.match(new RegExp("function\\s+" + n + "\\s*\\(", "g")) || []).length, 1, n + " is defined exactly once");
});
/* nothing of W08 lives outside its block any more */
const outside = S.replace(js, "");
["mysContent(", "mysPopContent(", "mysConfigModalHTML(", "mysDetailModalHTML(", 'a==="mys-', 'pop.type==="mys-opts"', 'modal.type==="mysconfig"', 'modal.type==="mysdetail"', "mysConfigQ"]
  .forEach(function (n) { A.absent(outside, n, "no W08 code outside the block: " + n); });
A.contains(outside, 'kind:"mystatus"', "the registry rows stay in the registry (shell-owned layout)");
A.contains(outside, "/* W08 My Status */", "and are labelled with the widget");
/* the clone is gone */
["mystatus-oc", "mysO", "MYSO_", "myso-", ".myso"].forEach(function (n) { A.absent(raw, n, "no trace of the deleted clone: " + n); });
/* CSS: hers, whole */
A.ok((css.match(/\.mys-/g) || []).length > 50, "her .mys-* rules are all in the CSS region (" + (css.match(/\.mys-/g) || []).length + ")");
A.absent(shell.css.replace(css, ""), ".mys-", "no .mys- rule outside the region");

/* ---------- 2. host the shell ----------------------------------------- */
const TAIL = "\r\n  render();\r\n})();\r\n";
A.eq(S.slice(-TAIL.length), TAIL, "shell ends in the IIFE tail");
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "mysHandleClick:mysHandleClick,mysHandleInput:mysHandleInput,setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;}," +
  "modalHTML:function(){return WIDGETS.modal();}," +
  /* the handlers call the shell's render(); in the shim there is no DOM to draw into, so after load the
     three renderers are stubbed and the driver asserts state + the content functions directly */
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: {
  __EX: null, Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error,
  encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
  setInterval: function () { return 1; }, clearInterval: function () {},
  navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" }, alert: function () {},
  performance: { now: function () { return 0; } },
  localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
  getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; } } });
const EX = env.ctx.__EX;
A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable");
EX.stubRender();

/* ---------- 3. registration ------------------------------------------- */
const reg = EX.WIDGETS.kinds.mystatus;
A.ok(!!reg, 'WIDGETS.kinds.mystatus is registered');
["content", "click", "input"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(reg.pops && reg.pops["mys-opts"] && typeof reg.pops["mys-opts"].content === "function" && typeof reg.pops["mys-opts"].trigger === "function", "owns the mys-opts popover (content + trigger)");
A.ok(reg.modals && typeof reg.modals.mysconfig === "function" && typeof reg.modals.mysdetail === "function", "owns the mysconfig and mysdetail modals");

/* ---------- 4. render ------------------------------------------------- */
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "mystatus"; });
A.eq(rows.length, 2, "two registry rows on the main dashboard (Explore, Detail)");
rows.forEach(function (w) {
  const html = EX.contentHTML(w);
  A.ok(html && html.length > 500, w.id + " renders through contentHTML -> WIDGETS (" + (html || "").length + " bytes)");
  A.contains(html, 'data-action="mys-row"', w.id + ": query rows are clickable");
  A.contains(html, 'data-action="mys-config"', w.id + ": Configure button present");
  A.contains(html, "queries need attention", w.id + ": header badge present");
  A.noEmDash(html, w.id + " content");
  A.absent(html, 'aria-busy="true"', w.id + ": not a loading skeleton");
});
const w = rows[0];
/* empty state when nothing is selected */
const emptyW = Object.assign({}, w, { selected: [] });
A.contains(EX.contentHTML(emptyW), "No records to display", "empty selection renders the empty state");

/* ---------- 5. interactions via the registration ---------------------- */
const T = function (attrs) { return env.shim.mkTarget(attrs || {}, "button"); };
A.eq(EX.mysHandleClick("not-mine", w.id, T()), false, "unknown actions are declined (return false)");
A.eq(EX.WIDGETS.click("mys-config", w.id, T(), {}), true, "mys-config handled through WIDGETS.click");
A.eq(EX.getModal() && EX.getModal().type, "mysconfig", "config modal opened");
A.eq(EX.getModal().draft.join(","), w.selected.join(","), "draft starts from the current selection");
let html = EX.modalHTML();
A.contains(html, "Configure My Status", "WIDGETS.modal() renders the config modal");
A.contains(html, 'id="mysConfigQ"', "with its search box");
A.noEmDash(html, "config modal");
/* add + remove in the draft */
const q0 = w.selected[0];
A.eq(EX.WIDGETS.click("mys-remove", w.id, T({ "data-q": q0 }), {}), true, "mys-remove handled");
A.ok(EX.getModal().draft.indexOf(q0) < 0, "removed query left the draft");
A.eq(EX.WIDGETS.click("mys-add", w.id, T({ "data-q": q0 }), {}), true, "mys-add handled");
A.ok(EX.getModal().draft.indexOf(q0) > -1, "added query is back in the draft");
/* search in the modal */
const inp = env.shim.mkNode("mysConfigQ", "input"); inp.value = "payroll"; inp.selectionStart = 7; inp.setSelectionRange = function () {};
env.shim.nodes.mysConfigQ = inp;
A.eq(EX.WIDGETS.input({ target: inp }), true, "config search handled through WIDGETS.input");
A.eq(EX.getModal().q, "payroll", "search term stored on the modal");
A.contains(EX.modalHTML(), "Payroll and HR", "filtered list still shows the matching area");
A.eq(EX.WIDGETS.input({ target: { id: "somethingelse", value: "" } }), false, "other inputs are declined");
A.eq(EX.WIDGETS.click("mys-config-cancel", w.id, T(), {}), true, "cancel handled");
A.eq(EX.getModal(), null, "modal closed");
/* records modal from a row */
const detailQ = "q_apdue";
A.eq(EX.WIDGETS.click("mys-row", w.id, T({ "data-q": detailQ }), {}), true, "mys-row handled");
A.eq(EX.getModal() && EX.getModal().type, "mysdetail", "records modal opened for a detail query");
html = EX.modalHTML();
A.contains(html, "Unpaid accounts payable by due date", "records modal names the query");
A.contains(html, "Overdue", "and lists its records");
A.noEmDash(html, "records modal");
A.eq(EX.WIDGETS.click("mys-detail-close", w.id, T(), {}), true, "close handled");
A.eq(EX.getModal(), null, "records modal closed");
/* options popover */
A.eq(EX.WIDGETS.click("mys-opts", w.id, T(), {}), true, "mys-opts handled");
A.eq(EX.getPop() && EX.getPop().type, "mys-opts", "popover state set");
A.eq(EX.triggerSelector(), '[data-action="mys-opts"][data-id="' + w.id + '"]', "triggerSelector answers through WIDGETS.trigger()");
A.contains(EX.popContent(), "Hide zero-count rows", "popContent answers through WIDGETS.pop()");
A.eq(EX.WIDGETS.click("mys-hidezero", w.id, T(), {}), true, "mys-hidezero handled");
A.eq(w.hideZero, true, "hideZero toggled on the widget");
A.eq(EX.getPop(), null, "popover closed after the toggle");

process.exit(A.report());
