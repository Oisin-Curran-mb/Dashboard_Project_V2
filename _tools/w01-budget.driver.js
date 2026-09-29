/* =====================================================================
   w01-budget.driver.js , W01 Budget Compared to Actual, the FINAL block
   (our version at every size, owner decision 2026-09-25, docs/decisions/W01.md).

   Whole-shell hosting (see w08-mystatus.driver.js). Proves the block is
   self-contained (one CSS region incl. its w01- copies of the shared rules,
   one JS region before the registry, registered as kind "budget"), that
   nothing of Jo's budget code remains, and that the widget renders at all
   three sizes and its controls work through the registration: scope and
   span popovers, interval / shape / detail toggles, table sort, the
   special-report modal, the headline percent, hover-card payloads.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const META = H.meta("W01");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W01 Budget Compared to Actual V2 CSS ===== */", CSS_END = "/* ===== end W01 Budget Compared to Actual V2 CSS ===== */";
const JS_START = "/* ===== W01 Budget Compared to Actual V2 =====", JS_END = "/* ===== end W01 Budget Compared to Actual V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 44)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END);
const js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 6000, "CSS region has substance incl. the w01- copies (" + css.length + " bytes)");
A.ok(js.length > 40000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
["var BGT_CUR_FY", "var BGT_CUR_PERIOD", "var BGT_REPORTS", "function bgtOContent(", "function bgtOHandleClick(", "function bgtOPopContent(", "function bgtOAbout(",
 "function bgtOShowBpop(", "function bgtOHideBpop(", 'WIDGETS.register("budget"', "function bgtOReportModalHTML("].forEach(function (n) { A.contains(js, n, "block holds " + n); });
/* everything W01 lives inside the block; nothing of the two deleted versions remains */
const outside = S.replace(js, "");
A.eq((outside.match(/bgtO[A-Z]\w*\s*\(/g) || []).length, 0, "no W01 function is called or defined outside the block (registry ids like bgtO_k are fine)");
["BGT_CUR_PERIOD", "BGT_REPORTS", "BUDGET_INCOME_BY_FY", "BUDGET_EXPENSE_BY_FY", "bgtMonths(", "data-bgtfpop"].forEach(function (n) { A.absent(outside, n, "no W01 code outside the block: " + n); });
["budgetContent(", "bgtFContent(", "bgtFLoad(", "bgtShowBpop(", "bgtFShowBpop(", 'kind:"budget-mb"', 'kind:"budget-oc"', "budget-mb", "budget-oc", "bgtPanel(", "bgtFavPill(", 'a==="bgt-', 'a==="bgtF-', 'a==="set-bgt-', 'a==="set-bgtF-', 'pop.type==="bgt-', 'pop.type==="bgtF-', 'modal.type==="bgtreport"', 'modal.type==="bgtF-report"']
  .forEach(function (n) { A.absent(raw, n, "Jo's budget versions are gone: " + n); });
A.contains(outside, 'kind:"budget"', "registry rows stay in the registry"); A.contains(outside, "/* W01 Budget Compared to Actual */", "and are labelled");
A.absent(raw, "Budget Compared to Actual (OC", "no (OC) wording in W01 titles");
A.absent(raw, "Budget Compared to Actual (Glance)", "no size words in W01 titles");
A.absent(raw, "Budget Compared to Actual (Detail", "no size words in W01 titles (Detail)");
A.contains(outside, "function bgtLockBg(", "the shell keeps its modal scroll lock (shared, labelled)");
/* the block's markup uses ONLY its own classes: w01- copies and bgtO- */
const bgtInMarkup = (js.match(/(?<![\w-])bgt-[a-z0-9-]+/g) || []).filter(function (c) { return c !== "bgt-" ; });
A.eq(bgtInMarkup.length, 0, "block markup references no shared .bgt-* class (uses its w01- copies)" + (bgtInMarkup.length ? " leftovers: " + [...new Set(bgtInMarkup)].slice(0, 6).join(" ") : ""));
const w01Used = new Set((js.match(/(?<![\w-])w01-[a-z0-9-]+/g) || []).filter(function (c) { return !/-$/.test(c) && c !== "w01-kpirow"; })); /* prefixes built up in string concatenation, and the one unstyled hook class, are excluded */
const w01Declared = new Set((css.match(/\.w01-[a-z0-9-]+/g) || []).map(function (c) { return c.slice(1); }));
const undeclared = [...w01Used].filter(function (c) { return !w01Declared.has(c); });
A.eq(undeclared.length, 0, "every w01- class the block uses is declared in its CSS region" + (undeclared.length ? " (missing: " + undeclared.slice(0, 8).join(" ") + ")" : ""));
A.absent(shell.css.replace(css, ""), ".w01-", "no w01- rule outside the region");
A.absent(shell.css.replace(css, ""), ".bgtO-", "no bgtO- rule outside the region");
A.contains(shell.css, "Shell: shared primitives that began life in the budget widget", "the shared .bgt-* originals are kept and labelled for the other widgets");
A.noEmDash(js.replace(/\/\*[\s\S]*?\*\//g, ""), "W01 block code (comments excluded)");

/* ---------- 2. host the shell ----------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "bgtOShowBpop:bgtOShowBpop,bgtOHideBpop:bgtOHideBpop," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX;
A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable");
EX.stubRender();

/* ---------- 3. registration ------------------------------------------- */
const reg = EX.WIDGETS.kinds.budget;
A.ok(!!reg, "WIDGETS.kinds.budget is registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(reg.pops && reg.pops["bgtO-scope"] && reg.pops["bgtO-span"], "owns the scope and span popovers");
A.ok(reg.modals && typeof reg.modals["bgtO-report"] === "function", "owns the special-report modal");
const about = EX.aboutOf({ kind: "budget", title: "Budget Compared to Actual" });
A.ok(about && /original budget/.test(about.b), "info-popover text comes through WIDGETS.about");

/* ---------- 4. render at three sizes ---------------------------------- */
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "budget"; });
A.eq(rows.length, 3, "three live registry rows (Explore, Glance, Detail)");
A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one row per size");
rows.forEach(function (w) {
  A.eq(w.title, "Budget Compared to Actual", w.id + ": plain title");
  const html = EX.contentHTML(w);
  A.ok(html && html.length > 800, w.id + " (" + w.size + ") renders (" + (html || "").length + " bytes)");
  A.ok(html.indexOf("w01-") > -1 || html.indexOf("bgtO-") > -1, w.id + ": markup uses the block's own classes (w01- copies or bgtO-)");
  A.absent(html, 'class="bgt-', w.id + ": markup uses no shared bgt- class");
  A.contains(html, 'data-action="bgtO-scope"', w.id + ": scope chip present");
  A.contains(html, "bgtO-hl-pct", w.id + ": headline percent present (owner decision, item 1)");
  A.noEmDash(html, w.id);
});
const w = rows.filter(function (x) { return x.size === "wide"; })[0];
const T = function (attrs) { return env.shim.mkTarget(attrs || {}, "button"); };

/* ---------- 5. controls ----------------------------------------------- */
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");
/* scope popover */
A.eq(EX.WIDGETS.click("bgtO-scope", w.id, T(), {}), true, "scope chip opens the popover");
A.eq(EX.getPop() && EX.getPop().type, "bgtO-scope", "pop state set");
A.eq(EX.triggerSelector(), '[data-action="bgtO-scope"][data-id="' + w.id + '"]', "trigger via WIDGETS.trigger()");
let pc = EX.popContent();
A.contains(pc, "Account scope", "scope popover content via WIDGETS.pop()");
A.contains(pc, 'data-action="set-bgtO-scope"', "scope options present");
A.contains(pc, "Special report", "special-report row present");
A.contains(pc, "w01-special-mi", "popover markup uses the w01- copies");
A.eq(EX.WIDGETS.click("set-bgtO-scope", w.id, T({ "data-v": "expense" }), {}), true, "set-bgtO-scope handled");
A.eq(w.acctview, "expense", "scope stored on the widget");
A.eq(EX.getPop(), null, "popover closed");
/* a scope or span change starts a data-fetch shimmer (bloading) that the shim's setTimeout never clears; assert it, then clear it to read the content */
A.eq(w.bloading, true, "scope change flips the data-fetch loading flag");
const settle = function () { w.bloading = false; };
settle();
let html = EX.contentHTML(w);
A.contains(html, "Expense", "content reflects the expense scope");
/* span popover */
A.eq(EX.WIDGETS.click("bgtO-span", w.id, T(), {}), true, "span chip opens the popover");
pc = EX.popContent(); A.contains(pc, "Show data over", "span popover content");
A.eq(EX.WIDGETS.click("set-bgtO-span", w.id, T({ "data-s": "quarter" }), {}), true, "set-bgtO-span handled");
A.eq(w.bspan, "quarter", "span stored"); settle();
/* interval + shape */
A.eq(EX.WIDGETS.click("set-bgtO-interval", w.id, T({ "data-v": "week" }), {}), true, "week interval handled");
A.eq(w.binterval, "week", "interval stored (Day/Week grains, item 2)");
html = EX.contentHTML(w); A.ok(html.length > 800, "renders at week grain");
A.eq(EX.WIDGETS.click("set-bgtO-shape", w.id, T({ "data-v": "table" }), {}), true, "table shape handled");
A.eq(w.bshape, "table", "shape stored");
html = EX.contentHTML(w); A.contains(html, "bgtO-sort", "table view has sortable headers");
const before = w.bsort;
A.eq(EX.WIDGETS.click("bgtO-sort", w.id, T({ "data-k": "budget" }), {}), true, "sort handled");
A.changed(w.bsort, before, "sort key changed");
/* back to a full-year monthly bar view: every column carries the hover-card payload */
A.eq(EX.WIDGETS.click("set-bgtO-span", w.id, T({ "data-s": "year" }), {}), true, "span back to fiscal year"); settle();
A.eq(EX.WIDGETS.click("set-bgtO-interval", w.id, T({ "data-v": "month" }), {}), true, "interval back to month");
A.eq(EX.WIDGETS.click("set-bgtO-shape", w.id, T({ "data-v": "bar" }), {}), true, "bar shape handled");
html = EX.contentHTML(w); A.contains(html, "data-bgtfpop", "bar view carries hover-card payloads on its columns");
A.eq(EX.WIDGETS.click("set-bgtO-shape", w.id, T({ "data-v": "line" }), {}), true, "line shape handled");
html = EX.contentHTML(w); A.ok(html.indexOf("data-bgtfpop") > -1 || html.indexOf("No trend") > -1, "line view renders (hover columns, or the no-trend guard)");
/* special-report modal */
A.eq(EX.WIDGETS.click("bgtO-open-report", w.id, T(), {}), true, "open-report handled");
A.eq(EX.getModal() && EX.getModal().type, "bgtO-report", "report modal state set");
html = EX.modalHTML();
A.ok(html && html.length > 500, "WIDGETS.modal() renders the report modal");
A.contains(html, "w01-rm-modal", "modal uses the w01- copies");
A.eq(EX.WIDGETS.click("bgtO-rm-cancel", w.id, T(), {}), true, "cancel handled");
A.eq(EX.getModal(), null, "modal closed");
/* hover card */
const shim = env.shim;
const col = shim.mkNode("", "div"); col.setAttribute("data-bgtfpop", "Jul|1000|1200|200|fav|0");
EX.bgtOShowBpop(col, 300, 300);
const popEl = shim.body.children.filter(function (n) { return n && n.className === "w01-pop"; })[0];
A.ok(!!popEl, "hover card element is created with the w01-pop class");
if (popEl) { A.contains(popEl.innerHTML, "Jul", "hover card names the period"); A.contains(popEl.innerHTML, "Variance", "hover card shows the variance"); }
EX.bgtOHideBpop();
/* Detail size renders two panels */
const xw = rows.filter(function (x) { return x.size === "xwide"; })[0];
html = EX.contentHTML(xw);
A.ok((html.match(/w01-explore-col/g) || []).length >= 2, "Detail renders two independent panels");
/* empty-state fixture: no budget set up */
const fixtureRows = H.extractRegistry(S, "budget");
const noBudget = fixtureRows.filter(function (r) { return r.id === "bgtO3"; })[0];
A.ok(!!noBudget, "state fixture bgtO3 is still readable by the harness");
if (noBudget) { const eh = EX.contentHTML(noBudget); A.ok(/No [a-z ]*budget set up/.test(eh), "no-budget state renders its empty state (\"No <scope> budget set up\")"); A.contains(eh, 'data-action="add-budget"', "with the add-budget action, handled by the block"); A.eq(EX.WIDGETS.click("add-budget", noBudget.id, T(), {}), true, "add-budget handled through WIDGETS.click"); }

/* owner rule 29 Sep: no budget set up = no percent anywhere (every size) */
["bgtO3","bgtO4"].forEach(function (id) { const r = fixtureRows.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "state fixture " + id + " readable"); if (!r) return; ["kpi","wide","xwide"].forEach(function (sz) { const h = EX.contentHTML(Object.assign({}, r, { size: sz })); A.absent(h, "bgtO-hl-pct", id + " (" + sz + "): no budget, so no percent"); }); });

process.exit(A.report());
