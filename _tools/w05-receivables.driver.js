/* =====================================================================
   w05-receivables.driver.js , W05 Receivable Invoices Outstanding, the FINAL
   block (ours 1:1, owner decision 2026-09-25, docs/decisions/W05.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "receivables"; Jo's receivables-mb and her v1 "ar" block
   are gone; the six .ar- bar primitives W04/W17 still use stay in the shell,
   labelled; renders at three sizes; the Revenue Center / Source popovers,
   content toggle, customer pager and sort, the drill modal (D12 header),
   row checkbox + Confirm work through the registration.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W05");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W05 Receivable Invoices Outstanding V2 CSS ===== */", CSS_END = "/* ===== end W05 Receivable Invoices Outstanding V2 CSS ===== */";
const JS_START = "/* ===== W05 Receivable Invoices Outstanding V2 ===== */", JS_END = "/* ===== end W05 Receivable Invoices Outstanding V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 56)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 6000, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 30000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("receivables",{', "registers itself"); A.contains(js, "var ARO_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), cssOutside = shell.css.replace(css, "");
["function arFContent(", "function arContent(", "var ARF_", "var AR_INV=", 'kind:"receivables-mb"', 'kind:"receivables-oc"', 'kind:"ar"', "arFwlq", "artdetail", "arFdetail"].forEach(function (n) { A.absent(outside.replace(/\/\*[\s\S]*?\*\//g, ""), n, "gone from the shell: " + n); });
A.absent(cssOutside, ".arF-", "no .arF- rule left"); A.absent(cssOutside, ".arO-", "no .arO- rule outside the block");
const arLeft = [...new Set(cssOutside.match(/\.ar-[a-z0-9-]+/g) || [])].filter(function (c) { return ["ar-bars", "ar-barrow", "ar-clickable", "ar-barlbl", "ar-barlbl-nm", "ar-barlbl-sub", "ar-bartrack", "ar-barfill"].indexOf(c.slice(1)) < 0; });
A.eq(arLeft.join(" "), "", "only the shared .ar- bar primitives remain in the shell");
A.contains(cssOutside, "Shell: AR-derived bar primitives", "the shared .ar- rules are labelled");
A.absent(js, "arO-check-sp", "drill header uses the body's check class (D12)");
A.noEmDash(js.replace(/\/\*[\s\S]*?\*\//g, ""), "W05 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.receivables; A.ok(!!reg, "WIDGETS.kinds.receivables is registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(reg.pops && reg.pops["arO-rc"] && reg.pops["arO-source"], "owns the Revenue Center and Source popovers"); A.ok(reg.modals && reg.modals.arOdetail, "owns the drill modal");
A.ok(/owed/i.test((EX.aboutOf({ kind: "receivables", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "receivables"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
const settle = function (w) { w.loading = false; w.bloading = false; w.arOloading = false; };
rows.forEach(function (w) { settle(w); A.eq(w.title, "Receivable Invoices Outstanding", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 500, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.absent(h, 'class="arF-', w.id + ": no arF- class in markup"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) A.headMatchesBody(h, w.id + " table (D12)"); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0], T = function (a) { return env.shim.mkTarget(a || {}, "button"); };

/* ---------- 4. controls ----------------------------------------------- */
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");
["arO-rc", "arO-source"].forEach(function (p) {
  A.eq(EX.WIDGETS.click(p, w.id, T(), {}), true, p + " chip opens the popover"); A.eq(EX.getPop() && EX.getPop().type, p, p + " pop state set");
  A.eq(EX.triggerSelector(), '[data-action="' + p + '"][data-id="' + w.id + '"]', p + " trigger via WIDGETS.trigger()");
  const pc = EX.popContent(); A.ok(pc && pc.length > 100, p + " popover content via WIDGETS.pop()"); A.noEmDash(pc, p + " popover");
  const v = (pc.match(/data-action="arO-set-(?:rc|source)"[^>]*data-v="([^"]+)"/g) || []).map(function (m) { return /data-v="([^"]+)"/.exec(m)[1]; }).filter(function (x) { return x !== "All"; })[0];
  if (v) { A.eq(EX.WIDGETS.click(p === "arO-rc" ? "arO-set-rc" : "arO-set-source", w.id, T({ "data-v": v }), {}), true, p + " option applied"); A.eq(p === "arO-rc" ? w.arORc : w.arOSource, v, p + " filter stored"); settle(w); }
  else { A.eq(EX.WIDGETS.click(p, w.id, T(), {}), true, p + " chip toggles closed"); }
  A.eq(EX.getPop(), null, p + " popover closed");
});
let html = EX.contentHTML(w);
const groups = [...new Set((html.match(/data-action="arO-group"[^>]*data-v="([a-z]+)"/g) || []).map(function (m) { return /data-v="([a-z]+)"/.exec(m)[1]; }))];
A.ok(groups.length >= 2, "content toggle offers views (" + groups.join(",") + ")");
groups.forEach(function (g) { A.eq(EX.WIDGETS.click("arO-group", w.id, T({ "data-v": g }), {}), true, "view " + g + " handled"); A.eq(w.arOGroup, g, "view " + g + " stored"); const hh = EX.contentHTML(w); A.ok(hh.length > 500, "view " + g + " renders"); A.noEmDash(hh, "view " + g); if (/wt-head/.test(hh)) A.headMatchesBody(hh, "view " + g + " table (D12)"); });
/* customer pager + sort */
A.eq(EX.WIDGETS.click("arO-group", w.id, T({ "data-v": "customer" }), {}), true, "customer view");
html = EX.contentHTML(w);
const pg = /data-action="arO-cust-page"/.test(html), so = /data-action="arO-cust-sort"/.test(html);
if (pg) { const p0 = w.arOCustPage || 0; A.eq(EX.WIDGETS.click("arO-cust-page", w.id, T({ "data-v": "next", "data-dir": "1", "data-p": "1" }), {}), true, "customer pager handled"); A.ok(w.arOCustPage !== undefined, "pager state present (" + p0 + " -> " + w.arOCustPage + ")"); }
if (so) { const s0 = w.arOSort; const sv = (html.match(/data-action="arO-cust-sort"[^>]*data-v="([^"]+)"/) || [])[1]; A.eq(EX.WIDGETS.click("arO-cust-sort", w.id, T(sv ? { "data-v": sv } : {}), {}), true, "customer sort handled"); A.ok(w.arOSort !== undefined, "sort state present (" + s0 + " -> " + w.arOSort + ")"); }
/* owner 29 Sep: Jo's format, Aging | Customers group toggle + Table | Pie view toggle + sortable tables, V2 styling */
A.eq(EX.WIDGETS.click("arO-set-rc", w.id, T({ "data-v": "All" }), {}), true, "rc All for format checks"); settle(w);
A.eq(EX.WIDGETS.click("arO-set-source", w.id, T({ "data-v": "All" }), {}), true, "source All for format checks"); settle(w);
EX.WIDGETS.click("arO-group", w.id, T({ "data-v": "aging" }), {}); EX.WIDGETS.click("arO-view", w.id, T({ "data-v": "table" }), {});
let jh = EX.contentHTML(w);
A.eq([...new Set((jh.match(/data-action="arO-group"[^>]*data-v="([a-z]+)"/g) || []).map(function (m) { return /data-v="([a-z]+)"/.exec(m)[1]; }))].join(","), "aging,customer", "group toggle is Aging | Customers");
A.eq([...new Set((jh.match(/data-action="arO-view"[^>]*data-v="([a-z]+)"/g) || []).map(function (m) { return /data-v="([a-z]+)"/.exec(m)[1]; }))].join(","), "table,pie", "view toggle is Table | Pie");
A.contains(jh, "Total outstanding", "aging table has the Total outstanding row"); A.absent(jh, "arO-bartrack", "no bar chart");
["Aging", "Invoices", "Amount"].forEach(function (h) { A.contains(jh, 'aria-label="Sort by ' + h + '"', "aging table header " + h); });
A.eq(EX.WIDGETS.click("arO-wsort", w.id, T({ "data-st": "arOBandSort", "data-k": "amount" }), {}), true, "aging sort handled"); A.eq(w.arOBandSort, "amount-desc", "aging sort by amount, largest first");
EX.WIDGETS.click("arO-group", w.id, T({ "data-v": "customer" }), {}); jh = EX.contentHTML(w);
["Customer", "Aging", "Balance"].forEach(function (h) { A.contains(jh, 'aria-label="Sort by ' + h + '"', "customer table header " + h); });
A.eq(EX.WIDGETS.click("arO-wsort", w.id, T({ "data-st": "arOSort", "data-k": "customer" }), {}), true, "customer sort handled"); A.eq(w.arOSort, "customer-asc", "customer sort A-Z");
EX.WIDGETS.click("arO-view", w.id, T({ "data-v": "pie" }), {}); jh = EX.contentHTML(w); A.contains(jh, "Outstanding by customer", "customer pie"); A.absent(jh, 'aria-label="Sort by', "pie has no table");
{ const xr = rows.filter(function (x) { return x.size === "xwide"; })[0]; if (xr) { const xh = EX.contentHTML(xr); A.absent(xh, "Invoice detail", "Detail has no Invoice detail panel (owner 29 Sep)"); A.absent(xh, 'data-action="arO-view"', "Detail shows table and pie together, no toggle"); A.contains(xh, "Share of total", "Detail right half is the pie"); A.contains(xh, "Total outstanding", "Detail left half is the table"); } }
EX.WIDGETS.click("arO-view", w.id, T({ "data-v": "table" }), {}); EX.WIDGETS.click("arO-group", w.id, T({ "data-v": "aging" }), {});
/* drill modal: D12 header, checkbox, confirm (filters back to All first: a centre + source pair can match nothing) */
A.eq(EX.WIDGETS.click("arO-set-rc", w.id, T({ "data-v": "All" }), {}), true, "revenue center back to All"); settle(w);
A.eq(EX.WIDGETS.click("arO-set-source", w.id, T({ "data-v": "All" }), {}), true, "source back to All"); settle(w);
A.eq(EX.WIDGETS.click("arO-group", w.id, T({ "data-v": "aging" }), {}), true, "back to aging view");
html = EX.contentHTML(w);
const open = /data-action="arO-open"[^>]*data-mode="([a-z]+)"[^>]*data-key="([^"]+)"/.exec(html);
A.ok(!!open, "a band offers the drill");
if (open) {
  A.eq(EX.WIDGETS.click("arO-open", w.id, T({ "data-mode": open[1], "data-key": open[2] }), {}), true, "drill open handled"); A.eq(EX.getModal() && EX.getModal().type, "arOdetail", "drill modal opened");
  let mh = EX.modalHTML(); A.ok(mh && mh.length > 800, "drill renders via WIDGETS.modal() (" + (mh || "").length + " bytes)"); A.noEmDash(mh, "drill modal");
  A.headMatchesBody(mh, "drill invoice table (D12)");
  /* owner (25 Sep): the pop-up is information only */
  ["arO-confirm", "arO-followup", "Move to unposted", "Confirm</button>"].forEach(function (n) { A.absent(mh, n, "pop-up: no " + n); });
  /* owner 29 Sep: Jo's phase-2 additions (subtitle, search, contact line, Send statement); Payments tab removed.
     owner 5 Oct (agreed with Jo, W05-8/10/11): no row select, no Print statements, no sort button; sorting on the column headers; search matches invoice numbers. */
  A.absent(mh, 'data-action="arO-statements"', "footer has no Print statements"); A.absent(mh, 'data-action="arO-check"', "rows carry no select box"); A.absent(mh, "arO-wl-sort", "no sort button");
  A.contains(mh, 'id="arOdq"', "pop-up has the search"); A.contains(mh, 'placeholder="Search customer or invoice #"', "search covers customer and invoice number"); A.contains(mh, "arO-wl-sub", "pop-up has the subtitle line");
  A.eq((mh.match(/data-action="arO-dsort"/g) || []).length, 6, "all six headers sortable");
  { const inv0 = (mh.match(/arO-dc3">([^<]+)</) || [])[1]; if (inv0) { EX.getModal().q = inv0.toLowerCase(); const mq = EX.modalHTML(); A.eq((mq.match(/data-action="arO-exp"/g) || []).length, 1, "searching an invoice number finds that one row"); EX.getModal().q = ""; }
    EX.WIDGETS.click("arO-dsort", w.id, T({ "data-k": "amount" }), {}); A.eq(EX.getModal().sort, "amount-desc", "Outstanding header sorts largest first"); EX.WIDGETS.click("arO-dsort", w.id, T({ "data-k": "amount" }), {}); A.eq(EX.getModal().sort, "amount-asc", "second click flips it");
    EX.WIDGETS.click("arO-dsort", w.id, T({ "data-k": "customer" }), {}); A.eq(EX.getModal().sort, "customer-asc", "Customer header sorts A to Z first"); EX.getModal().sort = null; }
  mh = EX.modalHTML();
  const inv = (mh.match(/data-action="arO-exp"[^>]*data-inv="([^"]+)"/) || [])[1];
  A.ok(!!inv, "rows expand to the info drawer");
  if (inv) { A.eq(EX.WIDGETS.click("arO-exp", w.id, T({ "data-inv": inv }), {}), true, "row expand handled"); mh = EX.modalHTML(); A.ok(/arO-drawer/.test(mh), "drawer rendered"); A.contains(mh, 'data-action="arO-open-invoice"', "drawer keeps the Open invoice link (developer hook)"); A.eq(EX.WIDGETS.click("arO-open-invoice", w.id, T({ "data-inv": inv }), {}), true, "Open invoice handled"); A.eq(EX.getModal() && EX.getModal().type, "arOdetail", "modal stays open"); const tab = (mh.match(/data-action="arO-tab"[^>]*data-tab="([a-z]+)"/) || [])[1]; if (tab) A.eq(EX.WIDGETS.click("arO-tab", w.id, T({ "data-tab": tab }), {}), true, "drawer tab handled"); }
  if (inv) { A.contains(mh, "arO-cp-contact", "drawer shows the contact line"); A.absent(mh, 'data-action="arO-statement"', "drawer has no Send statement (owner, 5 Oct)"); A.absent(mh, 'data-tab="payments"', "no Payments tab"); }
  A.eq(EX.WIDGETS.click("arO-detail-close", w.id, T(), {}), true, "drill close handled"); A.eq(EX.getModal(), null, "drill closed");
}
/* fixtures */
const fx = H.extractRegistry(S, "receivables"); ["arO3", "arO4", "arO5"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { settle(r); const h = EX.contentHTML(r); A.ok(h.length > 150, id + " renders (" + h.length + " bytes)"); } });

/* owner (8 Oct): the Glance bar spans the card like V1; without align-self:stretch the .kpi-num column left it as wide as its caption */
A.contains(css, ".arO-glance-read{display:flex;flex-direction:column;gap:var(--gap-xtight);margin-top:var(--padding-tight);min-width:0;align-self:stretch;}", "Receivables Glance bar wrapper stretches to the column");
process.exit(A.report());
