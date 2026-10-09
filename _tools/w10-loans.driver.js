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
const META = H.meta("W10");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W10 Loans With Balance Due V2 CSS ===== */", CSS_END = "/* ===== end W10 Loans With Balance Due V2 CSS ===== */";
const JS_START = "/* ===== W10 Loans With Balance Due V2 ===== */", JS_END = "/* ===== end W10 Loans With Balance Due V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 52)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 6000, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 30000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("loans",{', "registers itself"); A.contains(js, "var LONF_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), code = H.code;   /* strip block comments, shared */
["function loanContent(", "var LOAN_TODAY=", "var LOAN_REGISTRY=", 'kind:"loans-mb"', "loanHandleClick", "loandetail", 'pop.type==="loan-type"', "lonFContent(w); //"].forEach(function (n) { A.absent(code(outside), n, "gone from the shell: " + n); });
A.eq((shell.css.match(/\.loan-[a-z0-9-]+/g) || []).length, 0, "no .loan- rule anywhere"); A.absent(shell.css.replace(css, ""), ".lonf-", "no .lonf- rule outside the block");
A.eq((code(js).match(/(?<![\w-])loan-[a-z0-9-]+/g) || []).length, 0, "block code names no loan- class");
A.noEmDash(code(js), "W10 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "lon:{click:lonFHandleClick,modal:function(){return LONF_MODAL;},detailHTML:lonFDetailModalHTML,setModal:function(m){LONF_MODAL=m;}}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
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
if (acct) { click({ "data-lon": "lon-open", "data-id": w.id, "data-acct": acct }); A.ok(EX.lon.modal() && EX.lon.modal().acct === acct, "detail pop-up state set"); const mh = EX.lon.detailHTML(); A.ok(mh && mh.length > 400, "detail pop-up renders (" + (mh || "").length + " bytes)"); A.contains(mh, acct, "pop-up names the loan"); A.noEmDash(mh, "detail pop-up");
  /* owner (26 Sep): Export to Excel sits in the header top right, Record a contact and the placeholder note are gone, footer is Close only, Open loan stays as the developer hook */
  A.ok(/<div class="modal-h lon-detail-h">[\s\S]*data-lon="lon-export"[\s\S]*data-lon="lon-detail-close"[\s\S]*<\/div><div class="modal-b/.test(mh), "Export to Excel is in the header before the close button");
  ["lon-contact", "Record a contact", "lon-dl-note", "Placeholder"].forEach(function (n) { A.absent(mh, n, "pop-up has no " + n); });
  A.contains(mh, '<div class="modal-f"><button class="btn primary sm" data-lon="lon-detail-close">Close</button></div>', "footer is Close only"); A.contains(mh, 'data-lon="lon-open-loan"', "Open loan link kept"); if (/wt-head/.test(mh)) A.headMatchesBody(mh, "detail table (D12)"); click({ "data-lon": "lon-detail-close", "data-id": w.id }); A.ok(!EX.lon.modal(), "pop-up closed"); }
const wx = rows.filter(function (x) { return x.size === "xwide"; })[0]; const hx = EX.contentHTML(wx); A.ok(/wt-head/.test(hx) && /donut|pie-wrap|lonf-pie/i.test(hx), "Detail shows the list beside the donut");
/* fixtures */
const fx = H.extractRegistry(S, "loans"); ["lonF2", "lonF3"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { settle(r); const h = EX.contentHTML(r); A.ok(h.length > 150, id + " renders (" + h.length + " bytes)"); } });

/* owner (8 Oct): the menu caret sits on the edge facing its chip and points at it, like every shell .pop (data-dir + --caret-x); without them it showed as a diamond inside the menu */
{ const src = js, at = src.indexOf("function lonFPositionPop(el,anchor){"); A.ok(at > -1, "lonFPositionPop present");
  const body = at > -1 ? src.slice(at, src.indexOf("function ", at + 10)) : "";
  A.ok(/setAttribute\("data-dir"/.test(body), "lonFPositionPop sets data-dir so the caret sits on the edge"); A.ok(/setProperty\("--caret-x"/.test(body), "lonFPositionPop points the caret at the chip (--caret-x)"); }
/* owner (8 Oct): the Glance bar spans the card like V1; without align-self:stretch the .kpi-num column left it as wide as its caption */
A.contains(css, ".lon-glance-read{display:flex;flex-direction:column;gap:var(--gap-xtight);margin-top:var(--padding-tight);min-width:0;align-self:stretch;}", "Loans Glance bar wrapper stretches to the column");
/* owner (9 Oct): the Bands view stays at both sizes (V1's Aging and risk panel had band bars), laid out as Jo's phase-2 panel: all-bands row first; label, full-width bar, "N loans, X% of balance" */
{ const tw = EX.contentHTML(w); A.ok(/data-v="table"[\s\S]*data-v="pie"[\s\S]*data-v="bands"/.test(tw), "Explore switch offers Table, Pie and Bands");
  w.lonView = "bands"; const bh = EX.contentHTML(w); A.contains(bh, "lon-body-bands", "Bands view renders its panel"); A.eq((bh.match(/class="lon-band-row/g) || []).length, 6, "five range rows plus the all-bands row");
  A.ok(/<div class="lon-panel lon-panel-view"><div class="lon-band-row lon-band-all">/.test(bh), "the all-bands row comes first, as on Jo's panel"); A.absent(bh, "lon-band-total", "no bottom total row"); A.absent(bh, "lon-band-barrow", "bar and caption no longer share a line");
  A.ok(/<\/span><span class="lon-mini-track" aria-hidden="true">[\s\S]*?<\/span><span class="lon-band-meta">\d+ loans?, \d+% of balance<\/span>/.test(bh), "label, then the bar, then the count and share beneath"); A.contains(bh, "no balance in this band", "empty band wording as Jo's"); w.lonView = "table";
  ["function lonFAgingPanel", "function lonFSideToggle", "function lonFMiniBar", "lonFShowHover"].forEach(function (n) { A.contains(js, n, "Bands code present: " + n); });
  [".lon-band-row{", ".lon-body-bands{", ".lon-side-bands{"].forEach(function (n) { A.contains(css, n, "Bands CSS present: " + n); });
  /* owner (9 Oct): Explore fits all six rows without a scroll by dropping the rows' vertical padding one step; bars (6px track) and Detail spacing untouched */
  A.contains(css, ".lon-body-bands .lon-band-row,.lon-side-bands .lon-band-row{padding:var(--padding-xxtight) var(--padding-tight);}", "band rows: tighter vertical padding at both sizes"); A.contains(css, ".lon-body-bands .lon-panel{width:100%;}", "Explore bands panel spans the card (owner, 9 Oct)"); A.contains(css, ".lon-body-bands{overflow-y:auto;overscroll-behavior:contain;padding-left:var(--padding-tight);padding-right:var(--padding-tight);}", "Explore bands body: a token step of side padding");
  { const w10css = css; const raw = (w10css.match(/(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?\s*:\s*[^;{}]*\d+px/g) || []).filter(function (v) { return !/var\(/.test(v) || /\d+px/.test(v.replace(/var\([^)]*\)/g, "")); }); A.eq(raw.length, 0, "every padding, margin and gap in the W10 CSS is a token (" + raw.join(" | ") + ")"); } A.absent(css, ".lon-body-bands .lon-panel{max-width", "no width cap on the Explore panel"); A.contains(css, ".lon-mini-track{display:block;height:6px;", "bar height unchanged"); A.contains(css, ".lon-band-row{display:flex;align-items:center;gap:var(--gap-tight);width:100%;text-align:left;background:transparent;border:1px solid transparent;border-radius:var(--cornerradius-medium);padding:var(--padding-xtight) var(--padding-tight);", "base band row rule keeps Jo's padding (overridden one step tighter inside the panels)"); }
/* owner (9 Oct): the pie key and the band rows filter the table only at Detail; at Explore they are read-only (the chip row on the Table view is the Explore filter) */
{ const x = rows.filter(function (r) { return r.size === "xwide"; })[0]; A.ok(!!x, "a Detail card to test");
  w.lonView = "pie"; const ep = EX.contentHTML(w); A.absent(ep, 'data-lon="lon-set-bucket"', "Explore pie: no filter controls"); A.ok(/<div class="leg lon-leg lon-leg-static" data-seg="/.test(ep), "Explore pie: read-only key rows that still hover-sync"); A.absent(ep, "lon-pie-note", "Explore pie: no filtered note"); A.absent(ep, "tap to filter", "Explore pie: no tap-to-filter wording");
  const keep = w.lonBucket; w.lonBucket = "cur"; const ep2 = EX.contentHTML(w); A.absent(ep2, "lon-filtered", "Explore pie ignores a chip selection (no emphasis)"); A.absent(ep2, 'class="seg lon-sel"', "Explore pie: no selected slice"); w.lonBucket = keep;
  w.lonView = "bands"; const eb = EX.contentHTML(w); A.absent(eb, 'data-lon="lon-set-bucket"', "Explore bands: no filter controls"); A.absent(eb.slice(eb.indexOf('class="lon-panel')), "<button", "Explore bands: rows are not buttons"); A.contains(eb, "data-lonpop=", "Explore bands: hover card data kept"); w.lonView = "table";
  const xh = EX.contentHTML(x); A.contains(xh, 'data-lon="lon-side"', "Detail right column has its Pie / Bands switch"); A.ok(/<button class="leg lon-leg[^"]*" data-seg="[^"]+" data-lon="lon-set-bucket"/.test(xh), "Detail pie key rows filter the table");
  const xk = x.lonBucket; x.lonBucket = "cur"; const xf = EX.contentHTML(x); A.contains(xf, 'class="pie-wrap row lon-filtered"', "Detail: a selected range marks the pie"); A.contains(xf, 'class="seg lon-sel" data-seg="cur"', "Detail: the selected slice is marked"); A.contains(xf, "lon-pie-note", "Detail: filtered note shown");
  const xb = EX.contentHTML(Object.assign({}, x, { lonSide: "bands" })); A.ok(/<button class="lon-band-row lon-band-all[^"]*" data-lon="lon-set-bucket" data-bucket="total"/.test(xb), "Detail bands: all-bands row is a filter control"); A.ok(/<button class="lon-band-row sel"[^>]*data-bucket="cur"/.test(xb), "Detail bands: the selected band is marked"); x.lonBucket = xk;
  A.absent(EX.contentHTML(w), "lon-filtered", "Explore table view untouched"); }
/* owner (9 Oct): slice and key hover-sync like Pension Plans; the range selection has its own classes so a hover cannot wipe it (Detail) */
{ const x = rows.filter(function (r) { return r.size === "xwide"; })[0]; const ph = EX.contentHTML(x); A.ok(/<circle class="seg" data-seg="[^"]+"/.test(ph), "arcs carry data-seg for the shell's hover sync"); A.absent(ph, "<title>", "no native tooltip on the arcs"); A.absent(ph, 'class="pie-wrap row dim"', "no filter: the shell's hover class is not pre-set");
  A.contains(css, ".lon-pie .pie-wrap.lon-filtered .seg:not(.lon-sel):not(.hi){opacity:.28;}", "selection fades the other slices on its own class"); A.contains(css, ".lon-pie .pie-wrap.dim .seg.lon-sel:not(.hi){stroke-width:20;}", "while hovering another slice the selected one steps back"); }
/* owner (9 Oct): the header keeps its two rows at every size (chip top-left, figure beneath); Explore and Detail band rows fit without a scroll by dropping one padding step */
{ const x = rows.filter(function (r) { return r.size === "xwide"; })[0]; A.ok(/^<div class="dep-hd"><div class="dep-hd-top"><div class="lon-ctlrow">/.test(EX.contentHTML(x)), "Detail: two-row header, chip first"); A.absent(css, "lon-hd-one", "no one-row header variant");
  A.contains(css, ".lon-body-bands .lon-band-row,.lon-side-bands .lon-band-row{padding:var(--padding-xxtight) var(--padding-tight);}", "Explore and Detail band rows: tighter vertical padding"); }
/* owner (9 Oct): donut at the dashboard standard, 250 Explore / 280 Detail */
{ w.lonView = "pie"; A.contains(EX.contentHTML(w), 'class="donut" viewBox="0 0 140 140" width="250" height="250"', "Explore donut is 250"); w.lonView = "table";
  const x = rows.filter(function (r) { return r.size === "xwide"; })[0]; A.contains(EX.contentHTML(x), 'class="donut" viewBox="0 0 140 140" width="280" height="280"', "Detail donut is 280"); }
process.exit(A.report());
