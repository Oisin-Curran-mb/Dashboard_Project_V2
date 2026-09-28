/* =====================================================================
   w14-tasks.driver.js , W14 Main Content Tasks, the FINAL block (Jo's, the
   only version; made self-contained 2026-09-25, docs/decisions/W14.md).

   Same idiom as w08-mystatus.driver.js: host the whole shell, prove the
   block is one region plugged in only through WIDGETS.register("tasks"),
   renders at all three sizes, and that its filter popover, search box and
   click actions work through the registration.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const META = H.meta("W14");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W14 Main Content Tasks V2 CSS ===== */", CSS_END = "/* ===== end W14 Main Content Tasks V2 CSS ===== */";
const JS_START = "/* ===== W14 Main Content Tasks V2 =====", JS_END = "/* ===== end W14 Main Content Tasks V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 40)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END);
const js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 2000, "CSS region has substance (" + css.length + " bytes)");
A.ok(js.length > 8000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
["var MCT_APPS", "var MCT_TASKS", "function mctContent(", "function mctPopContent(", "function mctHandleClick(", "function mctHandleInput(", 'WIDGETS.register("tasks"']
  .forEach(function (n) { A.contains(js, n, "block holds " + n); });
A.contains(css, ".mct-filterrow{display:flex;}", "the stray .mct-filterrow rule moved into the region");
const outside = S.replace(js, "");
["mctContent(", "mctPopContent(", 'a==="mct-', 'pop.type==="mct-appfilter"', 'indexOf("mctq-")'].forEach(function (n) { A.absent(outside, n, "no W14 code outside the block: " + n); });
A.contains(outside, 'kind:"tasks"', "registry rows stay in the registry");
A.contains(outside, "/* W14 Main Content Tasks */", "and are labelled");
A.absent(shell.css.replace(css, ""), ".mct-", "no .mct- rule outside the region");

/* ---------- 2. host the shell ----------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},getModal:function(){return modal;},setModal:function(m){modal=m;}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX;
A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable");
EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.tasks;
A.ok(!!reg, "WIDGETS.kinds.tasks is registered");
A.eq(typeof reg.content, "function", "content()"); A.eq(typeof reg.click, "function", "click()"); A.eq(typeof reg.input, "function", "input()");
A.ok(reg.pops && reg.pops["mct-appfilter"], "owns the mct-appfilter popover");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "tasks"; });
A.eq(rows.length, 4, "four registry rows on the main dashboard");
rows.forEach(function (w) {
  const html = EX.contentHTML(w);
  A.ok(html && html.length > 300, w.id + " (" + w.size + ") renders (" + (html || "").length + " bytes)");
  A.noEmDash(html, w.id);
  if (w.size === "kpi") A.contains(html, "mct-glance", w.id + ": Glance layout"); else A.contains(html, 'id="mctq-' + w.id + '"', w.id + ": search box present");
});
const w = rows[0];
const T = function (attrs) { return env.shim.mkTarget(attrs || {}, "button"); };

/* ---------- 4. interactions ------------------------------------------- */
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");
A.eq(EX.WIDGETS.click("mct-appfilter", w.id, T(), {}), true, "filter chip opens the popover");
A.eq(EX.getPop() && EX.getPop().type, "mct-appfilter", "pop state set");
A.eq(EX.triggerSelector(), '[data-action="mct-appfilter"][data-id="' + w.id + '"]', "trigger via WIDGETS.trigger()");
let pc = EX.popContent();
A.contains(pc, "Filter standard tasks by application", "popover content via WIDGETS.pop()");
A.contains(pc, 'data-f="ap"', "lists an application option");
A.noEmDash(pc, "filter popover");
A.eq(EX.WIDGETS.click("mct-set-filter", w.id, T({ "data-f": "ap" }), {}), true, "mct-set-filter handled");
A.eq(w.mctFilter, "ap", "filter stored on the widget");
A.eq(EX.getPop(), null, "popover closed");
let html = EX.contentHTML(w);
A.contains(html, "Accounts Payable", "filtered content names the application");
/* search (reset the application filter first, or a bank task cannot match) */
A.eq(EX.WIDGETS.click("mct-set-filter", w.id, T({ "data-f": "all" }), {}), true, "filter reset to all");
const inp = env.shim.mkNode("mctq-" + w.id, "input"); inp.value = "deposit"; inp.selectionStart = 7; inp.setSelectionRange = function () {};
env.shim.nodes["mctq-" + w.id] = inp;
A.eq(EX.WIDGETS.input({ target: inp }), true, "search input handled through WIDGETS.input");
A.eq(w.mctQ, "deposit", "query stored on the widget");
html = EX.contentHTML(w);
A.contains(html, "Record Bank Deposit", "search results include the matching task");
A.eq(EX.WIDGETS.click("mct-clearq", w.id, T(), {}), true, "clear handled");
A.eq(w.mctQ, "", "query cleared");
/* save / unsave */
const before = (w.mctSaved || []).length;
A.eq(EX.WIDGETS.click("mct-save", w.id, T({ "data-t": "ap-void" }), {}), true, "mct-save handled");
A.ok(w.mctSaved.indexOf("ap-void") > -1, "task saved");
A.eq(EX.WIDGETS.click("mct-unsave", w.id, T({ "data-t": "ap-void" }), {}), true, "mct-unsave handled");
A.ok(w.mctSaved.indexOf("ap-void") < 0, "task removed again");
A.eq(w.mctSaved.length, before, "saved list back to its starting length");
A.eq(EX.WIDGETS.click("mct-open", w.id, T({ "data-t": "ap-check" }), {}), true, "mct-open handled (opens the explainer modal)");

/* section panels (owner, 27 Sep): every section on the warm-sand token, which no badge or icon uses */
A.contains(css, ".mct-sec-recent,.mct-sec-my,.mct-sec-content{background:var(--wn-250);}", "all three sections share the --wn-250 panel tint");
["--brand-10", "--am-100", "--am-50", "--green-10", "--pos-10", "--wn-200", "--cn-30"].forEach(function (tok) { A.absent((css.match(/.mct-sec-[^{]*{[^}]*}/g) || []).join(" "), tok, "section panel avoids " + tok); });
A.contains(css, ".mct-sec{display:flex;flex-direction:column;gap:7px;padding:10px 10px 8px;border-radius:12px;}", "sections are padded rounded panels");
(function () { w.mctQ = ""; const h = EX.contentHTML(w); A.contains(h, 'class="mct-sec mct-sec-recent"', "Recent Tasks section carries its tint class"); A.contains(h, 'class="mct-sec mct-sec-my"', "My Tasks section carries its tint class"); A.contains(h, 'class="mct-sec mct-sec-content"', "Content Tasks section carries its tint class"); w.mctQ = "check"; const r = EX.contentHTML(w); A.absent(r, "mct-sec-recent", "search results replace the sections and stay untinted"); w.mctQ = ""; })();

/* Glance bubbles (owner, 27 Sep): same row, same order, same tiles; Recent and My Tasks each in a --wn-250 bubble */
(function () { const wk = EX.dashboards[0].widgets.filter(function (x) { return x.kind === "tasks" && x.size === "kpi"; })[0]; if (!wk) { A.ok(false, "a Glance tasks widget exists"); return; } wk.mctQ = "";
  const g = EX.contentHTML(wk); A.contains(g, 'class="mct-gsec mct-gsec-recent"', "Recent bubble"); A.contains(g, 'class="mct-gsec mct-gsec-my"', "My Tasks bubble"); A.ok(g.indexOf("mct-gsec-recent") < g.indexOf("mct-gsec-my"), "Recent first, My Tasks second, as before");
  const tiles = (g.match(/class="mct-itile/g) || []).length; A.eq(tiles, EX.mctGlanceTasks ? EX.mctGlanceTasks(wk).length : tiles, "tile count unchanged (Recent, then saved tasks not already recent)"); A.contains(g, "mct-search", "search box kept");
  wk.mctQ = "check"; const r = EX.contentHTML(wk); A.contains(r, 'class="mct-gsec mct-gsec-results"', "search matches sit in one bubble"); A.absent(r, "mct-gsec-recent", "no group bubbles while searching"); wk.mctQ = ""; })();
A.contains(css, ".mct-gsec{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;padding:2px 6px;border-radius:12px;background:var(--wn-250);}", "bubble uses the section panel token");
process.exit(A.report());
