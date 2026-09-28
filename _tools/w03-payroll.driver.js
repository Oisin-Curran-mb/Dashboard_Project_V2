/* =====================================================================
   w03-payroll.driver.js , W03 Payroll Distributions, the FINAL block (ours
   1:1, owner decision 2026-09-25, docs/decisions/W03.md).

   Whole-shell hosting (see w08-mystatus.driver.js). Proves: one CSS region
   and one JS region before the registry; registered as kind "payroll";
   Jo's payroll-mb and v1 payroll are gone; renders at three sizes; period,
   scope and pay-type popovers, scope/pay-type selection, sort, range presets
   and the nested distribution drill (the shell's scoped modal) work through
   the registration; tables obey D12 (header cells carry their column's classes).
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W03");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W03 Payroll Distributions V2 CSS ===== */", CSS_END = "/* ===== end W03 Payroll Distributions V2 CSS ===== */";
const JS_START = "/* ===== W03 Payroll Distributions V2 ===== */", JS_END = "/* ===== end W03 Payroll Distributions V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 48)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 2500, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 25000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
["var PRO_ABOUT", "var PRO_DISTS", "var PRO_PT", "var PRO_RUNS", "var PRO_PRESETS", "function prOContent(", "function prOHandleClick(", "function prOPopContent(", "function prOOpenDist(", 'WIDGETS.register("payroll"']
  .forEach(function (n) { A.contains(js, n, "block holds " + n); });
const outside = S.replace(js, "");
A.eq((outside.match(/prO[A-Z]\w*\s*\(/g) || []).filter(function (c) { return c !== "prOContent("; }).length, 0, "no W03 function is called outside the block (except the shell's scoped-modal body)");
A.contains(outside, 'kind==="payroll")?prOContent(modal.mw)', "the shell's scoped drill modal renders the payroll body for kind \"payroll\"");
["PRO_", 'a==="prO-', 'a.indexOf("prO-")'].forEach(function (n) { A.absent(outside, n, "no W03 code outside the block: " + n); });
A.eq((outside.match(/pop\.type==="prO-/g) || []).length, 1, "the only prO popover mention outside the block is renderOverlay's width class");
A.contains(outside, '(pop.type==="prO-period"?" pop-period":"")', "renderOverlay gives the period popover its .pop-period width");
["function prContent(", "function prFContent(", "function prFPopContent(", "function prRangeBoundsFor(", "var PR_DISTS", "var PRF_", 'kind:"payroll-mb"', 'kind:"payroll-oc"', "payroll-mb", "payroll-oc", 'a==="pr-', 'a==="prF-', 'pop.type==="prperiod"', 'pop.type==="pr-scope"', 'pop.type==="prF-']
  .forEach(function (n) { A.absent(raw, n, "Jo's payroll versions are gone: " + n); });
A.contains(outside, 'kind:"payroll"', "registry rows stay in the registry"); A.contains(outside, "/* W03 Payroll Distributions */", "and are labelled");
["Payroll Distributions (OC", "Payroll Distributions (Glance)", "Payroll Distributions (Detail)", "Payroll Distributions (MB updated"].forEach(function (n) { A.absent(raw, n, "no (OC) / size / MB words in W03 titles: " + n); });
const prInMarkup = [...new Set(js.match(/(?<![\w-])prf?-[a-z0-9-]+/g) || [])].filter(function (c) { return !/-$/.test(c); });
A.eq(prInMarkup.length, 0, "block markup references no shared pr- / prf- class" + (prInMarkup.length ? " (" + prInMarkup.slice(0, 6).join(" ") + ")" : ""));
const w03Used = new Set((js.match(/(?<![\w-])w03-[a-z0-9-]+/g) || []).filter(function (c) { return !/-$/.test(c); }));
const w03Declared = new Set((css.match(/\.w03-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); }));
const undeclared = [...w03Used].filter(function (c) { return !w03Declared.has(c); });
A.ok(undeclared.length <= 6, "w03- classes used but undeclared are only unstyled hooks (" + undeclared.length + ": " + undeclared.slice(0, 6).join(" ") + ")");
A.absent(shell.css.replace(css, ""), ".w03-", "no w03- rule outside the region"); A.absent(shell.css.replace(css, ""), ".pro-", "no pro- rule outside the region");
A.absent(shell.css, ".pr-", "Jo's .pr-* rules are gone (payroll-only)"); A.absent(shell.css, ".prf-", "Jo's .prf-* rules are gone");
A.noEmDash(js.replace(/\/\*[\s\S]*?\*\//g, ""), "W03 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.payroll; A.ok(!!reg, "WIDGETS.kinds.payroll is registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
["prO-period", "prO-scope", "prO-pt"].forEach(function (p) { A.ok(reg.pops && reg.pops[p] && reg.pops[p].trigger, "owns popover " + p); });
A.ok(/payroll/i.test((EX.aboutOf({ kind: "payroll", title: "Payroll Distributions" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "payroll"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
rows.forEach(function (w) { A.eq(w.title, "Payroll Distributions", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 500, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.absent(h, 'class="pr-', w.id + ": no shared pr- class in markup"); A.noEmDash(h, w.id); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0], T = function (a) { return env.shim.mkTarget(a || {}, "button"); };
const settle = function () { w.loading = false; w.bloading = false; w.prLoading = false; };

/* ---------- 4. controls ----------------------------------------------- */
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");
["prO-period", "prO-scope", "prO-pt"].forEach(function (p) {
  A.eq(EX.WIDGETS.click(p, w.id, T(), {}), true, p + " opens its popover"); A.eq(EX.getPop() && EX.getPop().type, p, p + ": pop state set");
  A.eq(EX.triggerSelector(), '[data-action="' + p + '"][data-id="' + w.id + '"]', p + ": trigger via WIDGETS.trigger()");
  const pc = EX.popContent(); A.ok(pc && pc.length > 40, p + ": popover content via WIDGETS.pop() (" + (pc || "").length + " bytes)"); A.noEmDash(pc, p + " popover");
  A.eq(EX.WIDGETS.click(p, w.id, T(), {}), true, p + " toggles closed"); A.eq(EX.getPop(), null, p + ": closed");
});
EX.setPop({ type: "prO-scope", id: w.id }); let pc = EX.popContent(); A.contains(pc, 'data-action="prO-set-dist"', "scope popover offers distributions"); EX.setPop(null);
const dist = (EX.contentHTML(w).match(/data-dist="([a-z]+)"/) || [])[1];
A.eq(EX.WIDGETS.click("prO-set-dist", w.id, T({ "data-s": dist || "admin" }), {}), true, "set-dist handled"); settle();
A.eq(EX.WIDGETS.click("prO-set-dist", w.id, T({ "data-s": "all" }), {}), true, "back to all distributions"); settle();
EX.setPop({ type: "prO-pt", id: w.id }); pc = EX.popContent(); A.contains(pc, 'data-action="prO-set-pt"', "pay-type popover offers types"); EX.setPop(null);
A.eq(EX.WIDGETS.click("prO-set-pt", w.id, T({ "data-s": "all" }), {}), true, "set-pt handled"); settle();
const s0 = w.prSort; A.eq(EX.WIDGETS.click("prO-sort", w.id, T({ "data-k": "amt" }), {}), true, "sort handled"); A.changed(w.prSort, s0, "sort key changed");
A.eq(EX.WIDGETS.click("prO-range-set", w.id, T({ "data-r": "TQ" }), {}), true, "range preset handled"); A.eq(w.range, "TQ", "range stored"); settle();
let html = EX.contentHTML(w); A.ok(html.length > 500, "renders for the quarter range");
if (/wt-head/.test(html)) A.headMatchesBody(html, "Explore table (D12)");
/* nested drill: the shell's scoped modal */
const dd = (html.match(/data-action="prO-drilldist"[^>]*data-dist="([a-z]+)"/) || [])[1];
A.ok(!!dd, "a distribution row offers the drill");
if (dd) { A.eq(EX.WIDGETS.click("prO-drilldist", w.id, T({ "data-dist": dd }), {}), true, "drill handled"); const md = EX.getModal(); A.ok(md && md.scoped && md.mw && md.mw.kind === "payroll", "drill opens the scoped modal for kind payroll"); if (md && md.mw) { const mh = EX.contentHTML(md.mw); A.ok(mh.length > 300, "scoped modal body renders (" + mh.length + " bytes)"); A.noEmDash(mh, "drill body"); if (/wt-head/.test(mh)) A.headMatchesBody(mh, "drill table (D12)"); } EX.setModal(null); }
/* Detail */
const xw = rows.filter(function (x) { return x.size === "xwide"; })[0]; html = EX.contentHTML(xw); A.ok(html.length > 1500, "Detail renders (" + html.length + " bytes)"); if (/wt-head/.test(html)) A.headMatchesBody(html, "Detail table (D12)");
/* custom date range: the block's own change handler (moved out of the shell 2026-09-25) */
A.contains(js, 'contains("w03-date-input")', "the block handles its own custom date inputs");
const chg = env.shim.listeners.change || []; A.ok(chg.length >= 1, "a change listener is registered");
const di = env.shim.mkNode("", "input"); di.classList = { contains: function (c) { return c === "w03-date-input"; } }; di.setAttribute("data-id", w.id); di.setAttribute("data-which", "begin"); di.value = "2026-02-01";
chg.forEach(function (f) { f({ target: di }); });
A.eq(w.begin, "2026-02-01", "the From date lands on the widget"); A.eq(w.range, "CUSTOM", "and the range becomes CUSTOM");
/* fixtures */
const fx = H.extractRegistry(S, "payroll"); ["prO2", "prO3", "prO4"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { const h = EX.contentHTML(r); A.ok(h.length > 200, id + " renders (" + h.length + " bytes)"); } });

process.exit(A.report());
