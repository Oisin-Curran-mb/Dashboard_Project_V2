/* =====================================================================
   w11-fixedassets.driver.js , W11 Fixed Asset Values, the FINAL block (ours
   1:1, owner decision 2026-09-26, docs/decisions/W11.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "fixedassets" (content, about, the full-table modal);
   Jo's fa block, hooks, rows and .fa- rules are gone; renders at three sizes;
   grouping, measure, view, sort and paging work through the block's own
   data-faf click handling; the full table opens through WIDGETS.modal();
   tables obey D12.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W11");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W11 Fixed Asset Values V2 CSS ===== */", CSS_END = "/* ===== end W11 Fixed Asset Values V2 CSS ===== */";
const JS_START = "/* ===== W11 Fixed Asset Values V2 ===== */", JS_END = "/* ===== end W11 Fixed Asset Values V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 48)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 5000, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 30000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("fixedassets",{', "registers itself"); A.contains(js, "var FAF_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), code = H.code;   /* strip block comments, shared */
["function faContent(", "var FA_ASSETS=", "function faHandleClick(", 'kind:"fixedassets-mb"', 'pop.type==="fa-groupby"', 'modal.type==="fafTable"', "faFContent(w); //"].forEach(function (n) { A.absent(code(outside), n, "gone from the shell: " + n); });
A.eq((shell.css.match(/\.fa-[a-z0-9-]+/g) || []).length, 0, "no .fa- rule anywhere"); A.absent(shell.css.replace(css, ""), ".faf-", "no .faf- rule outside the block");
A.eq((code(js).match(/(?<![\w-])fa-[a-z0-9-]+/g) || []).length, 0, "block code names no fa- class");
A.noEmDash(code(js), "W11 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "faf:{click:faFHandleClick,pop:function(){return FAF_POP;},query:function(w){return faFServerQuery(w);},setChunk:function(n){FAF_CHUNK=n;},chunk:function(){return FAF_CHUNK;}}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.fixedassets; A.ok(!!reg, "WIDGETS.kinds.fixedassets is registered");
["content", "about"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); }); A.ok(reg.modals && reg.modals.fafTable, "owns the full-table modal");
A.ok(/asset/i.test((EX.aboutOf({ kind: "fixedassets", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "fixedassets"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
const settle = function (w) { w.loading = false; w.bloading = false; w.fafLoading = false; w.faLoading = false; };
rows.forEach(function (w) { settle(w); A.eq(w.title, "Fixed Asset Values", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 400, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.absent(h, 'class="fa-', w.id + ": no fa- class in markup"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) A.headMatchesBody(h, w.id + " table (D12)"); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0];
const click = function (attrs) { const el = env.shim.mkTarget(attrs, "button"); el.closest = function (sel) { return sel.indexOf("data-faf") > -1 ? el : null; }; EX.faf.click({ target: el }); };

/* owner (26 Sep): no icon-only download; export lives in the card's three-dot menu with the standard set */
rows.forEach(function (r) { A.absent(EX.contentHTML(r), 'data-faf="download"', r.id + ": no download button"); A.ok(r.actions && r.actions.length === 3 && r.actions.map(function (a) { return a.fmt; }).join(",") === "CSV,Excel,PDF", r.id + ": standard export actions on the row"); });
A.absent(js, "faFDownloadBtn", "download helper gone");
/* ---------- 4. behaviour ---------------------------------------------- */
let html = EX.contentHTML(w);
const acts = [...new Set((html.match(/data-faf="([a-z-]+)"/g) || []).map(function (m) { return /"([a-z-]+)"/.exec(m)[1]; }))];
A.ok(acts.length >= 3, "the block offers its own actions (" + acts.join(", ") + ")");
const sortA = (html.match(/data-faf="([a-z-]*sort[a-z-]*)"[^>]*data-k="([a-z]+)"/) || []); if (sortA[1]) { const s0 = w.faFSort; click({ "data-faf": sortA[1], "data-id": w.id, "data-k": sortA[2] }); A.changed(w.faFSort, s0, "column-header sort changed faFSort"); }
click({ "data-faf": "view", "data-id": w.id, "data-v": "donut" }); A.eq(w.faFView, "donut", "Donut view stored"); html = EX.contentHTML(w); A.ok(/donut|pie-wrap/.test(html), "Donut view renders"); A.noEmDash(html, "donut view");
click({ "data-faf": "view", "data-id": w.id, "data-v": "assets" }); A.eq(w.faFView, "assets", "Table view stored"); html = EX.contentHTML(w);
/* Lazy loading (owner, 5 Oct): no pager; a "Load N more · M remaining" button inside the scroll adds the next chunk. */
A.absent(html, 'data-faf="page-next"', "no page-next control"); A.absent(html, "faf-pager", "no pager row"); A.absent(html, "Page 1 of", "no page count");
(function () {
  const chunk0 = EX.faf.chunk(); EX.faf.setChunk(5); w.faFShown = 0;
  const h5 = EX.contentHTML(w), total = (EX.faf.query(w) || {}).totalCount || 0;
  if (total > 5) {
    A.contains(h5, 'data-faf="more"', "with more rows than the chunk, a Load more button shows");
    A.ok(/Load 5 more<span class="faf-more-n">\d+ remaining<\/span>/.test(h5), "it reads \"Load N more · M remaining\" (the shared convention)");
    A.ok(h5.indexOf('data-faf="more"') < h5.indexOf("faf-totalrow"), "the button sits under the last row, above the totals row");
    A.ok(h5.indexOf('data-faf="more"') > h5.indexOf('class="scroll faf-tscroll"'), "and inside the scroll");
    A.eq((h5.match(/class="wt-row faf-arow(?! faf-totalrow)/g) || []).length, 5, "the first chunk is shown");
    click({ "data-faf": "more", "data-id": w.id }); A.eq(w.faFShown, 10, "Load more asks for the next chunk");
    const h10 = EX.contentHTML(w); A.eq((h10.match(/class="wt-row faf-arow(?! faf-totalrow)/g) || []).length, Math.min(10, total), "and the rows are appended");
    if (total <= 10) A.absent(h10, 'data-faf="more"', "the button goes once everything is shown");
  } else A.ok(true, "group too small to exercise Load more (" + total + " rows)");
  EX.faf.setChunk(chunk0); w.faFShown = 0; html = EX.contentHTML(w);
})();
A.ok(/data-faf="open-table"/.test(html), "a row offers the full seven-column table");
click({ "data-faf": "open-table", "data-id": w.id }); A.eq(EX.getModal() && EX.getModal().type, "fafTable", "full table modal opened");
const mh = EX.modalHTML(); A.ok(mh && mh.length > 800, "full table renders via WIDGETS.modal() (" + (mh || "").length + " bytes)"); A.noEmDash(mh, "full table modal"); if (/wt-head/.test(mh)) A.headMatchesBody(mh, "full table (D12)"); EX.setModal(null);
const wx = rows.filter(function (x) { return x.size === "xwide"; })[0]; A.ok(EX.contentHTML(wx).length > 800, "Detail renders");
/* fixtures */
const fx = H.extractRegistry(S, "fixedassets"); ["faF2", "faF3", "faF4", "faF5"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { settle(r); const h = EX.contentHTML(r); A.ok(h.length > 100, id + " renders (" + h.length + " bytes)"); } });

/* ---------- 9. Jo's Phase 2 headline block and Glance (owner, 5 Oct 2026) ------ */
(function () {
  const wk = rows.filter(function (x) { return x.size === "kpi"; })[0]; settle(wk); settle(w); settle(wx);
  const g = EX.contentHTML(wk);
  A.ok(/<span class="metric-value"[^>]*>\$[\d,]+<\/span>/.test(g), "Glance shows the full Net Book Value figure, not a shortened one");
  A.absent(g, "organisation wide</span>", "Glance has no caption line");
  A.contains(g, "% depreciated</span>", "Glance: depreciated pill"); A.contains(g, " assets</span>", "Glance: asset count pill");
  A.ok(g.indexOf("% depreciated") < g.indexOf(" assets</span>"), "Glance pill order: depreciated, then assets (Jo's)");
  [w, wx].forEach(function (x) {
    const h = EX.contentHTML(x);
    A.contains(h, '<div class="faf-kpi-lbl">Net book value</div>', x.id + ": NET BOOK VALUE label");
    A.ok(h.indexOf('data-v="assets"') < h.indexOf("faf-kpi-lbl") && h.indexOf("faf-kpi-lbl") < h.indexOf("faf-tscroll"), x.id + ": headline sits between the controls and the table");
    A.contains(h, "faf-countpill", x.id + ": asset count pill"); A.contains(h, "faf-pdpill", x.id + ": depreciated pill");
    A.ok(h.indexOf("faf-countpill") < h.indexOf("faf-pdpill"), x.id + ": pill order assets, then depreciated (Jo's header)");
  });
  A.contains(css, ".faf-root .faf-tscroll{flex:1 1 auto;min-height:0;overflow:auto;}", "the table scrolls both ways inside the card so the headline never pushes it out");
  A.contains(css, ".faf-root .faf-numwrap{grid-column:1/-1", "the headline spans both header columns");
})();

/* ---------- 10. no "fully depreciated" tag (owner, 5 Oct: not in Jo's version) ---- */
[w, wx].forEach(function (x) { const h = EX.contentHTML(x); A.absent(h, "fully depreciated", x.id + ": zero-net rows carry no tag"); A.absent(h, "faf-zero", x.id + ": and no zero class"); });
A.absent(css, ".faf-zero", "zero-row CSS gone");

process.exit(A.report());
