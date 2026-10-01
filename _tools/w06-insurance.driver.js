/* =====================================================================
   w06-insurance.driver.js , W06 Insurance Billing Plans, the FINAL block
   (ours 1:1, owner decision 2026-09-25, docs/decisions/W06.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "insurance"; Jo's insurance-mb and her v1 "ins" block
   are gone and no ins-/insf- class or rule survives; renders at three sizes;
   the inline type popover, type filter (one fetch), sort, expandable type
   rows and the Table / Pie view work through the registration; the table
   header carries its columns' width classes (D12, nested-table form).
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W06");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W06 Insurance Billing Plans V2 CSS ===== */", CSS_END = "/* ===== end W06 Insurance Billing Plans V2 CSS ===== */";
const JS_START = "/* ===== W06 Insurance Billing Plans V2 ===== */", JS_END = "/* ===== end W06 Insurance Billing Plans V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 52)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 4000, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 15000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("insurance",{', "registers itself"); A.contains(js, "var INSO_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), cssOutside = shell.css.replace(css, "");
["function insFContent(", "function insContent(", "var INSF_", "var INS_PLANS=", 'kind:"insurance-mb"', 'kind:"insurance-oc"', "insHandleClick", "INSF_ABOUT"].forEach(function (n) { A.absent(outside.replace(/\/\*[\s\S]*?\*\//g, ""), n, "gone from the shell: " + n); });
A.eq((shell.css.match(/\.ins[fF]?-[a-z0-9-]+/g) || []).length, 0, "no .ins- or .insf- rule anywhere"); A.absent(cssOutside, ".w06-", "no .w06- rule outside the block");
A.eq((js.replace(/\/\*[\s\S]*?\*\//g, "").match(/(?<![\w-])ins[fF]?-[a-z0-9-]+/g) || []).length, 0, "block code names nothing ins-/insf-");
["w06-share", "w06-cost", "w06-row", "w06-grp", "w06-menu", "w06-scope", "w06-pie", "w06-share-fill"].forEach(function (c) { A.contains(css, "." + c, "W06 declares its own " + c); });
A.contains(css, ".wt-head .w06-share{", "header share style keyed on wt-head (D12)"); A.contains(css, ".wt-head .w06-cost{", "header cost style keyed on wt-head (D12)");
A.absent(js, 'if(a&&a.indexOf("insO-")===0){insOHandle(', "the block no longer dispatches its own clicks (registration does)");
A.noEmDash(js.replace(/\/\*[\s\S]*?\*\//g, ""), "W06 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.insurance; A.ok(!!reg, "WIDGETS.kinds.insurance is registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(/enrolled/i.test((EX.aboutOf({ kind: "insurance", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "insurance"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
const settle = function (w) { w.loading = false; w.bloading = false; w.insloading = false; };
/* D12, nested-table form: every header cell's classes are carried by the same cell of every body row (type rows and plan rows add their own) */
const headSubset = function (h, msg) {
  const rowsH = [...h.matchAll(/<div class="wt-row([^"]*)"[^>]*>([\s\S]*?)<\/div>/g)];
  const head = rowsH.find(function (r) { return /\bwt-head\b/.test(r[1]); }), bodies = rowsH.filter(function (r) { return !/\bwt-head\b/.test(r[1]); });
  if (!head || !bodies.length) return A.ok(false, msg + ": header and body rows found");
  const cells = function (s) { return [...s.matchAll(/<span class="([^"]*)"/g)].filter(function (m) { return m.index === 0 || s.slice(0, m.index).split("<span").length - 1 === s.slice(0, m.index).split("</span>").length - 1; }).map(function (m) { return m[1].split(/\s+/).filter(Boolean); }); };
  const hc = cells(head[2]); let bad = [];
  bodies.slice(0, 4).forEach(function (b, bi) { const bc = cells(b[2]); if (bc.length !== hc.length) { bad.push("row " + (bi + 1) + " has " + bc.length + " cells vs " + hc.length); return; } hc.forEach(function (c, i) { c.forEach(function (k) { if (bc[i].indexOf(k) < 0) bad.push("row " + (bi + 1) + " col " + (i + 1) + " lacks " + k); }); }); });
  A.ok(!bad.length, msg + ": header classes carried by body cells" + (bad.length ? "  (" + bad.slice(0, 3).join("; ") + ")" : ""));
};
rows.forEach(function (w) { settle(w); A.eq(w.title, "Insurance Billing Plans", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 300, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.eq((h.match(/(?<![\w-])ins[fF]?-[a-z0-9-]+/g) || []).length, 0, w.id + ": no ins-/insf- name in markup"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) headSubset(h, w.id + " table (D12)"); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0], T = function (a) { return env.shim.mkTarget(a || {}, "button"); };

/* ---------- 4. controls ----------------------------------------------- */
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");
A.eq(EX.WIDGETS.click("insO-type", w.id, T(), {}), true, "type chip opens the shell popover");
A.eq(EX.getPop() && EX.getPop().type, "insO-type", "pop state set (shell popover, so it is not clipped by the card)");
let html = EX.contentHTML(w); A.absent(html, "w06-menu", "no inline menu inside the card");
const pcx = EX.popContent(); A.noEmDash(pcx, "type popover");
const tv = (pcx.match(/data-action="insO-set-type"[^>]*data-v="([^"]+)"/g) || []).map(function (m) { return /data-v="([^"]+)"/.exec(m)[1]; }).filter(function (x) { return x !== "All"; })[0];
A.ok(!!tv, "popover offers a type"); if (tv) { A.eq(EX.WIDGETS.click("insO-set-type", w.id, T({ "data-v": tv }), {}), true, "type applied"); A.eq(w.insType, tv, "type stored"); A.eq(w.insloading, true, "type change is the one fetch (skeleton)"); settle(w); html = EX.contentHTML(w); A.absent(html, "w06-menu", "popover closed after choosing"); }
A.eq(EX.WIDGETS.click("insO-set-type", w.id, T({ "data-v": "All" }), {}), true, "type back to All"); settle(w);
html = EX.contentHTML(w);
const s0 = w.insSort; A.eq(EX.WIDGETS.click("insO-sort", w.id, T({ "data-k": "plan" }), {}), true, "sort handled"); A.changed(w.insSort, s0, "sort key changed");
const ty = (EX.contentHTML(w).match(/data-action="insO-toggle-type"[^>]*data-ty="([^"]+)"/) || [])[1];
A.ok(!!ty, "a type row offers expand");
if (ty) { A.eq(EX.WIDGETS.click("insO-toggle-type", w.id, T({ "data-ty": ty }), {}), true, "type expand handled"); A.eq(!!(w.insExpanded && w.insExpanded[ty]), true, "type marked expanded"); const hh = EX.contentHTML(w); A.contains(hh, "w06-child", "plan rows rendered under the type"); headSubset(hh, "expanded table (D12)"); }
A.eq(EX.WIDGETS.click("insO-view", w.id, T({ "data-v": "pie" }), {}), true, "pie view handled"); A.eq(w.insView, "pie", "view stored");
html = EX.contentHTML(w); A.contains(html, "w06-pie", "pie rendered at Explore"); A.noEmDash(html, "pie view");
A.eq(EX.WIDGETS.click("insO-view", w.id, T({ "data-v": "table" }), {}), true, "table view handled");
const wx = rows.filter(function (x) { return x.size === "xwide"; })[0]; const hx = EX.contentHTML(wx); A.ok(/w06-pie/.test(hx) && /wt-head/.test(hx), "Detail shows table and pie together");
/* fixtures */
const fx = H.extractRegistry(S, "insurance"); ["insO3", "insO4"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { settle(r); const h = EX.contentHTML(r); A.ok(h.length > 100, id + " renders (" + h.length + " bytes)"); } });

/* sort: group (type) rows follow every sort, and Cost is sortable (owner ask 2026-10-01) */
(function () {
  function order() { return (EX.contentHTML(w).match(/w06-grp-nm"><span[^>]*>[^<]*<\/span>([A-Za-z]+)/g) || []).map(function (m) { return /([A-Za-z]+)$/.exec(m)[1]; }); }
  A.contains(EX.contentHTML(w), 'data-k="cost"', "Cost header is sortable");
  w.insType = "All"; w.insloading = false;
  w.insSort = "plan-asc"; A.eq(order().join(","), "Dental,Medical,Vision,Property", "name A-Z orders the types (zero group last)");
  w.insSort = "plan-desc"; A.eq(order().join(","), "Vision,Medical,Dental,Property", "name Z-A orders the types");
  w.insSort = "count-desc"; A.eq(order().join(","), "Medical,Dental,Vision,Property", "enrolled high-low");
  w.insSort = "count-asc"; A.eq(order().join(","), "Vision,Dental,Medical,Property", "enrolled low-high");
  w.insSort = "cost-desc"; A.eq(order().join(","), "Medical,Dental,Vision,Property", "cost high-low");
  w.insSort = "cost-asc"; A.eq(order().join(","), "Vision,Dental,Medical,Property", "cost low-high");
  A.eq(EX.WIDGETS.click("insO-sort", w.id, T({ "data-k": "cost" }), {}), true, "cost sort click handled"); A.eq(w.insSort, "cost-desc", "cost click flips direction from asc");
  w.insSort = "count-desc";
})();
process.exit(A.report());
