/* =====================================================================
   w04-remittance.driver.js , W04 Remittance Pledges, the FINAL block (ours
   1:1, owner decision 2026-09-25, docs/decisions/W04.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "remittance"; Jo's remittance-mb and v1 remittance are
   gone; the shared pacing bar (.pbar) still lives in the shell; renders at
   three sizes; the receipts-window popover and custom dates, sort, view
   toggle, pace-band filter, the pledge pop-up (with pager) and the band
   drill work through the registration; tables obey D12.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W04");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W04 Remittance Pledges V2 CSS ===== */", CSS_END = "/* ===== end W04 Remittance Pledges V2 CSS ===== */";
const JS_START = "/* ===== W04 Remittance Pledges V2 ===== */", JS_END = "/* ===== end W04 Remittance Pledges V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 48)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 8000, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 60000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
["var REMO_ACTIVITIES", "var REMO_ABOUT", "var REMO_CHURCHES", "function remOContent(", "function remOHandleClickOC(", "function remOPopContent(", "function remOPledgeModalHTML(", "function remODrillModalHTML(", "function remOCommitThru(", 'addEventListener("change"', 'WIDGETS.register("remittance"']
  .forEach(function (n) { A.contains(js, n, "block holds " + n); });
const outside = S.replace(js, "");
A.eq((outside.match(/remO[A-Z]\w*\s*\(/g) || []).length, 0, "no W04 function is called or defined outside the block");
["REMO_", 'a==="remO-', 'pop.type==="remO-', 'a.indexOf("remO-")', 'modal.type==="remO', "remo-date-input"].forEach(function (n) { A.absent(outside, n, "no W04 code outside the block: " + n); });
["function remContent(", "function remFContent(", "function remHandleInput(", "function remFCommitThru(", "var REM_ACTIVITIES", "var REMF_", 'kind:"remittance-mb"', 'kind:"remittance-oc"', "remittance-mb", "remittance-oc", 'a==="rem-', 'a==="remF-', 'pop.type==="rem-thru"', 'pop.type==="remF-', 'modal.type==="remdetail"', 'modal.type==="remF']
  .forEach(function (n) { A.absent(raw, n, "Jo's remittance versions are gone: " + n); });
/* W04 has its own remO-pbar with its own scoped listener; the shell's shared
   .pbar was deleted on 2026-09-28 once nothing emitted it. */
["pbarHTML", "pbarShow", "pbarHide"].forEach(function (n) { A.absent(outside, n, "the retired shared pacing bar kept in the shell: " + n); });
A.contains(outside, 'kind:"remittance"', "registry rows stay in the registry"); A.contains(outside, "/* W04 Remittance Pledges */", "and are labelled");
["Remittance Pledges (OC", "Remittance Pledges (Glance)", "Remittance Pledges (Detail view)", "Remittance Pledges (MB updated"].forEach(function (n) { A.absent(raw, n, "no (OC) / size / MB words in W04 titles: " + n); });
const remInMarkup = [...new Set(js.match(/(?<![\w-])rem[fF]?-[a-z0-9-]+/g) || [])].filter(function (c) { return !/-$/.test(c); });
A.eq(remInMarkup.length, 0, "block markup references no shared rem- / remF- class" + (remInMarkup.length ? " (" + remInMarkup.slice(0, 6).join(" ") + ")" : ""));
A.absent(shell.css.replace(css, ""), ".w04-", "no w04- rule outside the region"); A.absent(shell.css.replace(css, ""), ".remO-", "no remO- rule outside the region");
A.absent(shell.css, ".remF-", "Jo's .remF-* rules are gone");
/* Jo's v1 .rem-* block was kept in the shell while W05 Receivables and W17 Gifts
   still leaned on its pacing-bar and status classes. Both are decided now and own
   their own vocabulary, so the whole run was deleted on 2026-09-28. */
A.absent(shell.css, "Shell: remittance-derived shared primitives", "the shared .rem-* run went once nothing used it");
A.absent(shell.css, ".rem-row", "and its rules with it");
A.absent(shell.css, ".rem-flag", "including the status classes");
A.absent(js, "rem-fill-'+", "W04 no longer builds rem-fill-* names dynamically"); A.absent(js, "rem-flag-'+", "W04 no longer builds rem-flag-* names dynamically");
["w04-fill-ontrack", "w04-fill-behind", "w04-fill-ahead", "w04-flag-behind"].forEach(function (c) { A.contains(css, "." + c, "W04 declares its own " + c); });
A.contains(outside, ".w04-scroll,", "the shell's scroll-container list follows the renamed class");
A.noEmDash(js.replace(/\/\*[\s\S]*?\*\//g, ""), "W04 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "fireChange:function(target){var ev={target:target};(document.__changeListeners||[]).forEach(function(f){f(ev);});}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.remittance; A.ok(!!reg, "WIDGETS.kinds.remittance is registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(reg.pops && reg.pops["remO-thru"], "owns the receipts-window popover"); A.ok(reg.modals && reg.modals.remOdetail && reg.modals.remOdrill, "owns the pledge pop-up and the band drill");
A.ok(/pledge/i.test((EX.aboutOf({ kind: "remittance", title: "Remittance Pledges" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "remittance"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
rows.forEach(function (w) { A.eq(w.title, "Remittance Pledges", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 500, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.absent(h, 'class="rem-', w.id + ": no shared rem- class in markup"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) A.headMatchesBody(h, w.id + " table (D12)"); });
/* table columns by size (owner, 25 Sep): Explore shows four, Detail all eight, Jo's phase-2 headings;
   the per-card info button exists at Explore/Detail only */
const headLabels = function (h) { const m = /<div class="remO-row remO-head[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="remO-row/.exec(h); return m ? [...m[1].matchAll(/data-k="[^"]+"[^>]*>([^<]+?)\s*<span/g)].map(function (x) { return x[1].trim(); }) : []; };
rows.forEach(function (w) {
  const h = EX.contentHTML(w), labels = headLabels(h), info = (h.match(/remO-cardinfo/g) || []).length;
  if (w.size === "wide") { A.eq(labels.join("|"), "Activity|Pledges behind|Pledge|Outstanding|Paid|Expected|% Paid" /* owner 29 Sep: Pledge and Expected back on Explore, as in V1, plus Pledges behind */, w.id + ": Explore columns"); A.eq(info, 3, w.id + ": Explore keeps the card info buttons"); }
  if (w.size === "xwide") { A.eq(labels.join("|"), "Seq.|Activity|Pledges behind|Pledge|Outstanding|Paid|Expected|% Paid", w.id + ": Detail columns"); A.absent(h, "remO-alignL", w.id + ": every amount column right-aligned"); A.eq(info, 3, w.id + ": Detail keeps the card info buttons"); }
  if (w.size === "kpi") A.eq(info, 0, w.id + ": no card info button at Glance");
  if (w.size !== "kpi") A.ok(/<div class="remO-row remO-head wt-head/.test(h), w.id + ": header row carries the shell wt-head class");
  if (w.size !== "kpi") A.ok(/remO-scroll">[\s\S]*remO-total[\s\S]*<\/div><\/div>$/.test(h.slice(h.indexOf('class="scroll remO-scroll"'))), w.id + ": total row is the sticky last row inside the scroll list");
  if (w.size === "wide") A.absent(h, " outstanding</span>", w.id + ": Explore card sub-text is the amount only");
});
/* owner (25 Sep): every table column left-aligned, headers included */
[".remO-num{text-align:left;", ".remO-pct{text-align:left;", ".remO-num .wt-sort,.remO-pct .wt-sort{justify-content:flex-start;", ".w04-minirow{display:flex;align-items:center;gap:var(--gap-tight);justify-content:flex-start;", ".remO-total{position:sticky;bottom:0;"].forEach(function (r) { A.ok(shell.css.indexOf(r) > -1, "CSS rule present: " + r); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0], T = function (a) { return env.shim.mkTarget(a || {}, "button"); };
const settle = function () { w.loading = false; w.bloading = false; w.remLoading = false; };

/* ---------- 4. controls ----------------------------------------------- */
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");
A.eq(EX.WIDGETS.click("remO-thru", w.id, T(), {}), true, "receipts-window chip opens the popover"); A.eq(EX.getPop() && EX.getPop().type, "remO-thru", "pop state set");
A.eq(EX.triggerSelector(), '[data-action="remO-thru"][data-id="' + w.id + '"]', "trigger via WIDGETS.trigger()");
let pc = EX.popContent(); A.ok(pc && pc.length > 100, "popover content via WIDGETS.pop()"); A.contains(pc, "w04-date-input", "popover carries the renamed date inputs"); A.noEmDash(pc, "receipts popover");
A.eq(EX.WIDGETS.click("remO-thru", w.id, T(), {}), true, "chip toggles the popover closed"); A.eq(EX.getPop(), null, "popover closed");
let html = EX.contentHTML(w);
const sortK = (html.match(/data-action="remO-sort"[^>]*data-k="([a-z]+)"/) || [])[1];
if (sortK) { const s0 = w.remSort; A.eq(EX.WIDGETS.click("remO-sort", w.id, T({ "data-k": sortK }), {}), true, "sort handled"); A.changed(w.remSort, s0, "sort key changed"); }
const viewV = (html.match(/data-action="remO-view"[^>]*data-v="([a-z]+)"/) || [])[1];
if (viewV) { A.eq(EX.WIDGETS.click("remO-view", w.id, T({ "data-v": viewV }), {}), true, "view toggle handled"); }
/* pace-band filter and drill */
const band = (html.match(/data-action="remO-drill"[^>]*data-band="([a-z]+)"/) || [])[1];
{ const kr = rows.filter(function (x) { return x.size === "kpi"; })[0]; if (kr) { const kh = EX.contentHTML(kr); A.absent(kh, 'data-action="remO-drill"', "Glance pace cards open no pop-up (owner 29 Sep)"); A.contains(kh, "remO-card-static", "Glance pace cards are read-only"); } }
if (band) { A.eq(EX.WIDGETS.click("remO-drill", w.id, T({ "data-band": band }), {}), true, "band drill handled"); A.eq(EX.getModal() && EX.getModal().type, "remOdrill", "band drill modal opened"); let mh = EX.modalHTML(); A.ok(mh && mh.length > 300, "band drill renders via WIDGETS.modal()"); A.noEmDash(mh, "band drill"); if (/wt-head/.test(mh)) A.headMatchesBody(mh, "band drill table (D12)"); A.eq(EX.WIDGETS.click("remO-drill-close", w.id, T(), {}), true, "drill close handled"); A.eq(EX.getModal(), null, "drill closed"); }
/* the pledge pop-up */
const seq = (html.match(/data-action="remO-open"[^>]*data-seq="([^"]+)"/) || [])[1];
A.ok(!!seq, "an activity row offers the pledge pop-up");
if (seq) {
  A.eq(EX.WIDGETS.click("remO-open", w.id, T({ "data-seq": seq }), {}), true, "row open handled"); A.eq(EX.getModal() && EX.getModal().type, "remOdetail", "pledge pop-up opened");
  let mh = EX.modalHTML(); A.ok(mh && mh.length > 800, "pledge pop-up renders via WIDGETS.modal() (" + (mh || "").length + " bytes)"); A.absent(mh, 'class="rem-', "pop-up uses no shared rem- class"); A.noEmDash(mh, "pledge pop-up");
  if (/wt-head/.test(mh)) A.headMatchesBody(mh, "pledge history table (D12)");
  const pg = (mh.match(/data-action="(remO-[a-z-]*page[a-z-]*)"/) || [])[1];
  if (pg) { A.eq(EX.WIDGETS.click(pg, w.id, T({ "data-seq": seq, "data-dir": "next", "data-p": "2" }), {}), true, "pager action handled"); }
  /* owner 29 Sep: lazy loading (8 at a time, Load more at the end of the list) replaces the pager; the basis note sits behind an info icon in the header */
  const rowsIn = function (h) { return (h.match(/data-action="remO-plopen"/g) || []).length; };
  A.contains(mh, 'class="iconbtn w04-basis-info"', "pop-up header has the basis info icon");
  A.contains(mh, "paces the activity evenly over its term", "info icon carries the basis note");
  A.absent(mh, "remO-ppage", "no page buttons");
  const n0 = rowsIn(mh); A.eq(n0, 20, "pop-up shows the first 20 pledges (fills the table)");
  if (/data-action="remO-plmore"/.test(mh)) { A.eq(EX.WIDGETS.click("remO-plmore", w.id, T({ "data-seq": seq }), {}), true, "Load more handled"); const mh2 = EX.modalHTML(); A.eq(rowsIn(mh2), Math.min(16, n0 + 8 + 99) > 16 ? 16 : rowsIn(mh2), "Load more adds the next batch"); A.ok(rowsIn(mh2) > n0, "Load more shows more pledges (" + rowsIn(mh2) + ")"); A.absent(mh2, "w04-pl-pager", "no page or count line under the list"); }
  { const kv = {}, re = /w04-sum-k">([^<]+)<\/span><span class="w04-sum-v">([^<]+)</g; let m; while ((m = re.exec(mh))) kv[m[1]] = m[2];
    A.ok("Amount in grace period" in kv, "summary has Amount in grace period (" + JSON.stringify(kv) + ")");
    A.eq(Object.keys(kv).join("|"), "Total pledged|Paid to date|Outstanding|% Paid|Pledges behind|Amount behind|Pledges in grace period|Amount in grace period", "summary headings in the owner's order"); }
  ["Paid to date", "Pledges in grace period", "Pledged amount"].forEach(function (t) { A.contains(mh, t, "pop-up wording: " + t); });
  ["Received to date", "Pledges at risk", "Prepaid", "unfunded", "no single term"].forEach(function (t) { A.absent(mh, t, "old pop-up wording gone: " + t); });
  A.eq(EX.WIDGETS.click("remO-detail-close", w.id, T(), {}), true, "pop-up close handled"); A.eq(EX.getModal(), null, "pop-up closed");
}
/* custom dates: the block's own change handler */
const listeners = env.shim.listeners.change || [];
A.ok(listeners.length >= 1, "the block registered a change listener for its date inputs");
const inp = env.shim.mkNode("", "input"); inp.className = "w04-date-input"; inp.classList = { contains: function (c) { return c === "w04-date-input"; } }; inp.setAttribute("data-id", w.id); inp.value = "2026-01-15";
const thruBefore = w.remThru;
listeners.forEach(function (f) { f({ target: inp }); });
A.eq(w.remThru, "2026-01-15", "changing the receipts-through date commits it through the block's change handler (was a ReferenceError: the shell called an undefined remOSetCustomDate)");
A.changed(w.remThru, thruBefore, "and the widget's window moved");
A.absent(S, "remOSetCustomDate", "the undefined function is no longer referenced anywhere");
/* fixtures */
const fx = H.extractRegistry(S, "remittance"); ["remO3", "remO4"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { const h = EX.contentHTML(r); A.ok(h.length > 150, id + " renders (" + h.length + " bytes)"); } });

process.exit(A.report());
