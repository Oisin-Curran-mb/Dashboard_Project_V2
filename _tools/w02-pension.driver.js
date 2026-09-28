/* =====================================================================
   w02-pension.driver.js , W02 Pension Plans, the FINAL block (our version
   at every size, owner decision 2026-09-25, docs/decisions/W02.md).

   Whole-shell hosting (see w08-mystatus.driver.js). Proves: one CSS region
   (w02- copies + its own rules) and one JS region before the registry;
   plugged in only via WIDGETS.register("pension"); nothing of Jo's two
   pension versions remains; the shared .pbar component she kept inside
   her block is still in the shell; renders at three sizes; the district
   popover, sort, view/chart toggles and the Appointees drill modal work
   through the registration; the owner's three items: Glance caption
   wording, 24 varied appointees, modal table-first layout.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const META = H.meta("W02");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W02 Pension Plans V2 CSS ===== */", CSS_END = "/* ===== end W02 Pension Plans V2 CSS ===== */";
const JS_START = "/* ===== W02 Pension Plans V2 ===== */", JS_END = "/* ===== end W02 Pension Plans V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 44)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END);
const js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 4000, "CSS region has substance incl. the w02- copies (" + css.length + " bytes)");
A.ok(js.length > 20000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
["var PENO_APPTS", "var PENO_DISTRICTS", "var PENO_PLAN_ORDER", "function penOContent(", "function penOHandleClick(", "function penOPopContent(", "function penODetailModalHTML(", 'WIDGETS.register("pension"']
  .forEach(function (n) { A.contains(js, n, "block holds " + n); });
const outside = S.replace(js, "");
A.eq((outside.match(/penO[A-Z]\w*\s*\(/g) || []).length, 0, "no W02 function is called or defined outside the block");
["PENO_", 'a==="penO-', 'pop.type==="penO-dist"', 'modal.type==="penOdetail"'].forEach(function (n) { A.absent(outside, n, "no W02 code outside the block: " + n); });
/* Jo's two versions are gone; the shared pacing bar she kept inside her block is still in the shell */
["function penContent(", "function penFContent(", "function penDetailModalHTML(", "function penFDetailModalHTML(", "var PEN_APPTS", "var PENF_APPTS", 'kind:"pension-mb"', 'kind:"pension-oc"', "pension-mb", "pension-oc", 'a==="pen-', 'a==="penF-', 'pop.type==="pen-dist"', 'pop.type==="penF-dist"']
  .forEach(function (n) { A.absent(raw, n, "Jo's pension versions are gone: " + n); });
/* The shared .pbar pacing bar was DELETED on 2026-09-28: its last caller was
   Jo's gifts block, and nothing emitted its markup after that block went. What
   matters here is that no trace of it is left behind. */
["pbarHTML", "pbarShow", "pbarHide", "pbarPopEl", ".pbar[data-pbar]", "Shell: pacing bar"].forEach(function (n) { A.absent(outside, n, "the retired shared pacing bar kept in the shell: " + n); });
A.absent(outside, ".pbar-lg", "and its legend swatches went with it");
A.contains(outside, 'kind:"pension"', "registry rows stay in the registry"); A.contains(outside, "/* W02 Pension Plans */", "and are labelled");
["Pension Plans (OC", "Pension Plans (Glance)", "Pension Plans (Detail view)", "Pension Plans (MB updated"].forEach(function (n) { A.absent(raw, n, "no (OC) / size / MB words in W02 titles: " + n); });
/* stand-alone CSS */
const penInMarkup = [...new Set(js.match(/(?<![\w-])penf?-[a-z0-9-]+/g) || [])].filter(function (c) { return !/-$/.test(c); });
A.eq(penInMarkup.length, 0, "block markup references no shared pen- / penf- class" + (penInMarkup.length ? " (" + penInMarkup.slice(0, 6).join(" ") + ")" : ""));
const w02Used = new Set((js.match(/(?<![\w-])w02-[a-z0-9-]+/g) || []).filter(function (c) { return !/-$/.test(c); }));
const w02Declared = new Set((css.match(/\.w02-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); }));
const HOOKS = ["w02-chip", "w02-vtoggle", "w02-seg", "w02-dc3", "w02-detail-b"]; /* unstyled hook classes, renamed from pen- */
const undeclared = [...w02Used].filter(function (c) { return !w02Declared.has(c) && HOOKS.indexOf(c) < 0; });
A.eq(undeclared.length, 0, "every styled w02- class the block uses is declared in its CSS region" + (undeclared.length ? " (missing: " + undeclared.slice(0, 8).join(" ") + ")" : ""));
A.absent(shell.css.replace(css, ""), ".w02-", "no w02- rule outside the region");
A.absent(shell.css, ".pen-", "Jo's .pen-* rules are gone (nothing else used them)");
A.absent(shell.css, ".penf-", "Jo's .penf-* rules are gone");
A.contains(css, ".modal.modal-wide.w02-detail-modal .modal-b{display:flex;", "drill modal: two-column flex body kept");
A.contains(css, ".w02-detail-scroll{flex:1 1 auto;min-width:0;}", "drill modal: the table takes the width (item 5)");
A.contains(css, ".w02-dtotal{flex:0 0 auto;min-width:150px;max-width:220px;", "drill modal: the summary is a narrow side column (item 5)");
A.noEmDash(js.replace(/\/\*[\s\S]*?\*\//g, ""), "W02 block code (comments excluded)");

/* ---------- 2. host the shell ----------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards,PENO_APPTS:PENO_APPTS," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX;
A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable");
EX.stubRender();

/* ---------- 3. registration + data ------------------------------------ */
const reg = EX.WIDGETS.kinds.pension;
A.ok(!!reg, "WIDGETS.kinds.pension is registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(reg.pops && reg.pops["penO-dist"], "owns the district popover"); A.ok(reg.modals && reg.modals.penOdetail, "owns the appointees modal");
A.ok(/pension plan/.test((EX.aboutOf({ kind: "pension", title: "Pension Plans" }) || {}).b || ""), "info text through WIDGETS.about");
/* item 4: 24 varied appointees */
const D = EX.PENO_APPTS;
A.eq(D.length, 24, "24 appointees");
A.eq(new Set(D.map(function (a) { return a.name; })).size, 24, "all names differ");
A.eq(new Set(D.map(function (a) { return a.org; })).size, 24, "all churches differ");
A.eq(new Set(D.map(function (a) { return a.dist; })).size, 3, "spread over the three districts");
A.eq(new Set(D.map(function (a) { return a.plan; })).size, 5, "spread over the five plans");
A.ok(new Set(D.map(function (a) { return a.amt; })).size >= 15, "amounts vary (" + new Set(D.map(function (a) { return a.amt; })).size + " distinct)");
["District 1", "District 2", "District 3"].forEach(function (d) { A.ok(D.filter(function (a) { return a.dist === d; }).length >= 6, d + " has at least 6 appointees"); });

/* ---------- 4. render at three sizes ---------------------------------- */
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "pension"; });
A.eq(rows.length, 3, "three live registry rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
rows.forEach(function (w) {
  A.eq(w.title, "Pension Plans", w.id + ": plain title");
  const html = EX.contentHTML(w);
  A.ok(html && html.length > 500, w.id + " (" + w.size + ") renders (" + (html || "").length + " bytes)");
  A.absent(html, 'class="pen-', w.id + ": no shared pen- class in markup");
  A.noEmDash(html, w.id);
});
const g = rows.filter(function (x) { return x.size === "kpi"; })[0];
let html = EX.contentHTML(g);
A.contains(html, "per year across 5 plans, all districts", "Glance caption reworded to Jo's terms (item 1)");
A.absent(html, "contributed a year", "old caption wording gone");
A.contains(html, "appointee", "Glance badge kept as ours (item 2)");
const w = rows.filter(function (x) { return x.size === "wide"; })[0];
const T = function (attrs) { return env.shim.mkTarget(attrs || {}, "button"); };

/* ---------- 5. controls ----------------------------------------------- */
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");
A.eq(EX.WIDGETS.click("penO-dist", w.id, T(), {}), true, "district chip opens the popover");
A.eq(EX.getPop() && EX.getPop().type, "penO-dist", "pop state set");
A.eq(EX.triggerSelector(), '[data-action="penO-dist"][data-id="' + w.id + '"]', "trigger via WIDGETS.trigger()");
let pc = EX.popContent(); A.contains(pc, "District 1", "popover lists the districts"); A.contains(pc, 'data-action="penO-set-dist"', "with set-dist options");
A.eq(EX.WIDGETS.click("penO-set-dist", w.id, T({ "data-v": "District 2" }), {}), true, "set-dist handled");
A.eq(w.penDist, "District 2", "district stored"); w.penLoading = false; w.bloading = false;
html = EX.contentHTML(w); A.ok(html.length > 500, "renders for District 2");
html = EX.contentHTML(g); A.contains(html, "all districts", "Glance card keeps its own (unfiltered) scope");
A.eq(EX.WIDGETS.click("penO-set-dist", w.id, T({ "data-v": "All Districts" }), {}), true, "back to all districts");
const s0 = w.penSort; A.eq(EX.WIDGETS.click("penO-sort", w.id, T({ "data-k": "name" }), {}), true, "sort handled"); A.changed(w.penSort, s0, "sort key changed");
A.eq(EX.WIDGETS.click("penO-view", w.id, T({ "data-v": "chart" }), {}), true, "view toggle handled"); A.eq(w.penViewM, "chart", "view stored");
A.eq(EX.WIDGETS.click("penO-chart", w.id, T({ "data-v": "pie" }), {}), true, "chart toggle handled"); A.eq(w.penChartL, "pie", "chart kind stored");
/* the Appointees modal (item 5) */
A.eq(EX.WIDGETS.click("penO-open", w.id, T({ "data-plan": "CRSP-DB-%" }), {}), true, "row open handled");
A.eq(EX.getModal() && EX.getModal().type, "penOdetail", "appointees modal opened");
html = EX.modalHTML();
A.contains(html, "Pension Plan: Appointees", "modal title");
A.contains(html, "w02-detail-modal", "modal uses the w02- class the layout rules target");
A.contains(html, "w02-detail-scroll", "table container carries the width class");
A.contains(html, "w02-dtotal", "summary carries the side-column class");
A.contains(html, "5 appointees", "CRSP-DB-% now lists five appointees (24-row dataset)");
A.headMatchesBody(html, "appointees modal table (D12)");
A.noEmDash(html, "appointees modal");
A.eq(EX.WIDGETS.click("penO-export", w.id, T({ "data-plan": "CRSP-DB-%" }), {}), true, "export handled");
A.eq(EX.WIDGETS.click("penO-detail-close", w.id, T(), {}), true, "close handled"); A.eq(EX.getModal(), null, "modal closed");
/* empty-state fixture */
const fx = H.extractRegistry(S, "pension").filter(function (r) { return r.id === "penO3"; })[0];
A.ok(!!fx, "empty-state fixture readable"); if (fx) A.contains(EX.contentHTML(fx), "No active pension appointments", "empty state renders");

process.exit(A.report());
