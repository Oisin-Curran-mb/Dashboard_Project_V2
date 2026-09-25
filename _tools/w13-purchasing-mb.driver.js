/* =====================================================================
   w13-purchasing-mb.driver.js

   Verification driver for the W13 Purchasing Management port (prefix purF,
   kind "purchasing-mb"), on the shared harness in jo-port-driver.js.

   Run from this folder:  node w13-purchasing-mb.driver.js

   What it proves, in the order the brief asks for it:
     1  extraction, namespace hygiene and Jo's four purF-LOOKALIKE functions
     2  initial render at every tier, and the (OC titles
     3  the headline IS the Pending count, path-scoped, never status-scoped
     4  three state columns, plus the split Finish column ONLY at All statuses
     5  oldest-first sort in BOTH views and inside every column
     6  the 2 / 5 / 10 per-tier caps
     7  every filter: status, approval path (searchable), department, year, overdue
     8  the view toggle, and loading only on a fetch
     9  drag, hold and Finish guards
    10  the record modal, its five tabs, Update and Cancel
    11  every empty state
    12  a no-em-dash sweep over every size x status x path x view combination
    13  colour never alone, real table semantics, no native selects
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const START = "var PURF_TODAY=new Date(2026,7,19);";
const END = "/* ===== end W13 Purchasing Management V2 ===== */";
const CSS_START = "/* ===== W13 Purchasing Management V2 CSS =====";
const CSS_END = "/* ===== end W13 Purchasing Management V2 CSS ===== */";

const shell = H.loadShell();
const block = H.extractRegion(shell.script, START, END);
const cssRegion = H.extractRegion(shell.css, CSS_START, CSS_END);
const registry = H.extractRegistry(shell.script, "purchasing-mb");
const env = H.runBlock(block, { registry: registry, dataAttr: "data-purf" });
const A = new H.Assert("W13 purchasing-mb");

/* ---------- local helpers -------------------------------------------- */
const POS = env.get("PURF_POS");
const PRISTINE_POS = JSON.parse(JSON.stringify(POS));
const PRISTINE_REG = JSON.parse(JSON.stringify(registry));

function W(id) { for (const w of registry) if (w.id === id) return w; throw new Error("no widget " + id); }
function R(id) { return env.call("purFContent", W(id)); }
function C(name) { return env.call.apply(null, arguments); }

function resetData() {
  POS.length = 0;
  JSON.parse(JSON.stringify(PRISTINE_POS)).forEach(function (p) { POS.push(p); });
}
function resetState() {
  PRISTINE_REG.forEach(function (src) {
    const w = W(src.id);
    Object.keys(w).forEach(function (k) { if (/^purf/.test(k)) delete w[k]; });
    Object.keys(src).forEach(function (k) { if (/^purf/.test(k)) w[k] = src[k]; });
    w.size = src.size;
    w.state = src.state;
    w.dataset = src.dataset;
  });
}
function resetAll() { resetData(); resetState(); env.ctx.PURF_POP = null; env.ctx.PURF_MODAL = null; env.ctx.PURF_MOVE = null; env.ctx.PURF_HOLD = null; env.ctx.PURF_DRAG = null; env.call("purFRenderModal"); }

/* clicks, keys and the drag events the harness does not wrap */
const fire = env.shim.fire;
const fireKey = env.shim.fireKey;
function fireDrag(type, attrs, cls) {
  const t = env.shim.mkTarget(attrs || {}, "div", cls || "");
  const ev = {
    target: t, currentTarget: t, key: null,
    preventDefault: function () { ev._pd = true; },
    stopPropagation: function () {},
    dataTransfer: { setData: function () {}, getData: function () { return ""; } }
  };
  (env.shim.listeners[type] || []).forEach(function (fn) { fn(ev); });
  return ev;
}
function fireInput(id, value, attrs) {
  const t = env.shim.mkNode(id || "", "input");
  Object.keys(attrs || {}).forEach(function (k) { t.setAttribute(k, attrs[k]); });
  t.value = value;
  (env.shim.listeners.input || []).forEach(function (fn) { fn({ target: t }); });
  return t;
}
function popHTML() { const n = env.shim.nodes.purfPop; return n ? n.innerHTML : ""; }
function modalHTML() { const n = env.shim.nodes.purfModalRoot; return n ? n.innerHTML : ""; }
function count(hay, needle) { return String(hay).split(needle).length - 1; }
/* every data-purf-ref in document order, i.e. what the user actually sees */
function refsIn(html) {
  const out = [], re = /data-purf-ref="(PO-\d+)"/g;
  let m; while ((m = re.exec(String(html)))) out.push(m[1]);
  return out;
}
/* the cards inside ONE board column, in order */
function colRefs(html, stage) {
  const i = String(html).indexOf('data-purf-drop="' + stage + '"');
  if (i < 0) return null;
  const rest = String(html).slice(i);
  const j = rest.indexOf("</div></div>");
  return refsIn(rest.slice(0, j < 0 ? rest.length : j));
}
function po(ref) { for (const p of POS) if (p.ref === ref) return p; return null; }

const STAGES = ["Pending", "Approved", "Rejected"];
const PATHS = ["Administration", "Education Ministry", "Everyone", "QA Path"];

/* =====================================================================
   1. EXTRACTION, NAMESPACE HYGIENE, AND JO'S FOUR LOOKALIKES
   ===================================================================== */
console.log("\n-- 1. extraction and namespace hygiene --");
A.ok(block.length > 20000, "block extracted between its markers");
A.contains(block, END, "block ends on its own end marker");
A.ok(cssRegion.length > 4000, "CSS block extracted between its markers");

/* THE HEADLINE RISK OF THIS WIDGET. Jo's purForStatus, purPathsForStatus,
   purFiltered and purFindOrder all begin with "purF" but are HERS. Each must
   still be defined exactly once, in HER block, and never inside ours. */
const HER_LOOKALIKES = ["purForStatus", "purPathsForStatus", "purFiltered", "purFindOrder"];
HER_LOOKALIKES.forEach(function (fn) {
  A.eq(count(shell.script, "function " + fn + "("), 1, "Jo's " + fn + " is defined exactly once in the shell");
  A.eq(count(block, "function " + fn + "("), 0, "our block does not define " + fn);
  A.ok(new RegExp("function\\s+" + fn + "\\s*\\(w").test(shell.script) || fn === "purFindOrder",
    "Jo's " + fn + " keeps its own signature");
});
/* Her exact source lines, verbatim, still present */
A.contains(shell.script, 'function purForStatus(w){var s=w.pstatus||"mine";return purVisible(w).filter(function(o){return o.status===s;});}',
  "Jo's purForStatus body is byte-identical");
A.contains(shell.script, "function purPathsForStatus(w){var seen={},out=[];purForStatus(w).forEach(function(o){if(!seen[o.path]){seen[o.path]=1;out.push(o.path);}});return out;}",
  "Jo's purPathsForStatus body is byte-identical");
A.contains(shell.script, 'function purFiltered(w){var fs=purForStatus(w),cp=purPathCur(w);if(cp==="All approval paths")return fs;return fs.filter(function(o){return o.path===cp;});}',
  "Jo's purFiltered body is byte-identical");
A.contains(shell.script, "function purFindOrder(w,oid){var list=purOrders(w);for(var i=0;i<list.length;i++)if(list[i].id===oid)return list[i];return null;}",
  "Jo's purFindOrder body is byte-identical");
/* and they are still WIRED into her own widget, not orphaned */
A.contains(shell.script, "purFiltered(w).length?purTable(w", "Jo's purFiltered is still called by her purQueueView");
A.contains(shell.script, "purFindOrder(wa,t.getAttribute", "Jo's purFindOrder is still called by her approve handler");
A.contains(shell.script, "purPathsForStatus(w),cur=purPathCur(w)", "Jo's purPathsForStatus is still called by her purPathChip");

/* no name of ours can be character-for-character one of hers */
const OUR_FNS = (block.match(/function (purF[A-Za-z0-9_]+)\(/g) || []).map(function (s) { return s.slice(9, -1); });
A.ok(OUR_FNS.length > 40, "our block defines the full purF function set  (" + OUR_FNS.length + " functions)");
A.eq(OUR_FNS.filter(function (n) { return HER_LOOKALIKES.indexOf(n) > -1; }).length, 0,
  "not one of our purF* names equals one of Jo's four lookalikes");
A.eq(OUR_FNS.filter(function (n) { return /^purF[a-z]/.test(n); }).length, 0,
  "every one of our names is purF plus a CAPITAL, so it can never shadow a pur+word of hers");

/* attribute and CSS namespaces stay disjoint */
A.eq(count(block, 'data-action="pur-'), 0, "our block never emits one of Jo's pur- data-actions");
A.contains(shell.script, 'data-action="pur-status"', "Jo's pur-status data-action is still in the file");
A.contains(shell.script, 'data-action="pur-path"', "Jo's pur-path data-action is still in the file");
/* comments in our CSS block NAME her classes on purpose (that is the reuse
   record), so the test is on the declarations, not on the prose */
const cssRules = cssRegion.replace(/\/\*[\s\S]*?\*\//g, "");
A.ok(!/\.pur-(?!f)/.test(cssRules), "our CSS block declares no .pur-* selector of Jo's");
A.ok(count(shell.css, ".pur-kcard{") === 1, "Jo's .pur-kcard rule is declared exactly once");
A.ok(count(shell.css, ".pur-kanban{") === 1, "Jo's .pur-kanban rule is declared exactly once");

/* shell conformance: no inline handlers, no native selects */
A.eq(count(block, "onclick="), 0, "no inline onclick survives the port");
A.eq(count(block, "ondragstart="), 0, "no inline ondragstart survives the port");
A.eq(count(block, "onchange="), 0, "no inline onchange survives the port");
A.eq(count(block, "<select"), 0, "no native select survives the port");
A.contains(block, 'document.addEventListener("click",purFHandleClick)', "own delegated click listener");
A.contains(block, 'document.addEventListener("input",purFHandleInput)', "own delegated input listener");
A.contains(block, 'document.addEventListener("drop",purFDrop)', "own delegated drop listener");
A.contains(block, "var PURF_WIRED=false;", "listeners are wired once behind PURF_WIRED");

/* the two dispatch lines, and only those, in Jo's shared regions */
A.contains(shell.script, 'if(w.kind==="purchasing-mb")return purFContent(w);', "contentHTML dispatches purchasing-mb");
A.ok(shell.script.indexOf('if(w.kind==="purchasing-mb")return purFContent(w);') <
  shell.script.indexOf('if(w.state==="empty"){var ec=EMPTY_COPY[w.kind]', shell.script.indexOf("function contentHTML(w){")),
  "our dispatch sits BEFORE the generic empty fallback, so our own empty state renders");
A.contains(shell.script, 'if(w.kind==="purchasing-mb")return {h:w.title,b:PURF_ABOUT};', "aboutOf dispatches purchasing-mb");
A.contains(shell.script, 'if(w.kind==="purchasing")return {h:w.title,b:PUR_ABOUT_BODY};', "Jo's own aboutOf branch is untouched");

/* =====================================================================
   2. REGISTRY, TITLES AND INITIAL RENDER AT EVERY TIER
   ===================================================================== */
console.log("\n-- 2. registry, titles, initial render --");
A.eq(registry.length, 6, "six registry entries");
["purF", "purF_k", "purF_x", "purF2", "purF3", "purF4"].forEach(function (id) {
  A.ok(registry.some(function (w) { return w.id === id; }), "registry has " + id);
});
registry.forEach(function (w) {
  A.eq(w.kind, "purchasing-mb", w.id + " kind is purchasing-mb");
  A.contains(w.title, "(OC", w.id + " title uses the (OC convention");
  A.contains(w.title, "Purchasing Management", w.id + " title names the widget");
  A.eq((w.tiers || []).join(","), "kpi,wide,xwide", w.id + " offers all three tiers and no fourth");
  A.absent(w.title, "MB updated", w.id + " title does not use the retired (MB updated) form");
});
A.eq(W("purF").size, "wide", "purF is the Explore tier");
A.eq(W("purF_k").size, "kpi", "purF_k is the Glance tier");
A.eq(W("purF_x").size, "xwide", "purF_x is the Detail tier");
A.eq(W("purF2").purfView, "table", "purF2 demos the PO Table view");
A.eq(W("purF3").purfStatus, "Pending", "purF3 demos a single-status board");
A.eq(W("purF4").dataset, "empty", "purF4 demos the empty state");

resetAll();
const hWide = R("purF"), hKpi = R("purF_k"), hXwide = R("purF_x"), hTable = R("purF2"), hEmpty = R("purF4");
A.contains(hWide, 'class="purf-root purf-w"', "Explore renders our namespaced root");
A.contains(hWide, 'data-tier="wide"', "Explore stamps its tier");
A.contains(hWide, 'class="dep-hd purf-hd"', "Explore reuses Jo's two-row .dep-hd header");
A.contains(hWide, 'class="pur-kanban purf-board"', "the board rides on Jo's .pur-kanban component");
A.contains(hWide, "pur-kcard purf-card", "cards ride on Jo's .pur-kcard component");
A.contains(hWide, 'class="vtoggle purf-vtoggle"', "the view toggle is Jo's .vtoggle");
A.contains(hXwide, 'data-tier="xwide"', "Detail stamps its tier");
A.contains(hXwide, 'class="pur-kanban purf-board"', "Detail renders the board");
A.contains(hKpi, 'data-tier="kpi"', "Glance stamps its tier");
A.contains(hKpi, 'class="kpi-row"', "Glance reuses Jo's .kpi-row");
A.contains(hKpi, 'class="purf-glance"', "Glance renders the state-count cards");
A.absent(hKpi, "purf-board", "Glance renders no board");
A.absent(hKpi, "vtoggle", "Glance offers no view switch, per the Step 4 size table");
A.absent(hKpi, "filter-chip", "Glance offers no filter chips");
A.contains(hTable, 'class="purf-tbl"', "the Table view renders the table");
A.contains(hTable, "PO #", "the table has the PO # column");
A.contains(hTable, "Vendor", "the table has the Vendor column");
A.contains(hTable, "Amount", "the table has the Amount column");
A.contains(hTable, "Department", "the table has the Department column");
A.contains(hTable, "Status", "the table has the Status column");
A.contains(hTable, "Issued", "the table has the Issued column");
A.contains(hTable, 'class="dep-total"', "the table has Jo's totals row");
A.absent(hTable, "pur-kanban", "the Table view renders no board");
/* no Small size, for any view: the tier mapper collapses everything else */
A.eq(env.call("purFTier", { size: "small" }), "wide", "an unexpected small size falls back to Explore, never a fourth tier");
A.eq(env.call("purFTier", { size: "large" }), "xwide", "large maps onto Detail");

/* =====================================================================
   3. THE HEADLINE IS THE PENDING COUNT
   ===================================================================== */
console.log("\n-- 3. headline = Pending count --");
resetAll();
A.eq(env.call("purFPendingCount", W("purF")), 10, "ten requests are Pending in the fixture");
A.contains(R("purF"), '<span class="metric-value">10</span>', "Explore headline is the Pending count");
A.contains(R("purF"), "pending approval", "the headline is labelled pending approval");
A.contains(R("purF_k"), '<span class="metric-value">10</span>', "Glance headline is the Pending count");
A.contains(R("purF_k"), "pending approval", "Glance labels the headline pending approval");
A.contains(R("purF2"), '<span class="metric-value">10</span>', "the Table view shows the same headline");
/* it MOVES with the data */
env.call("purFApplyMove", W("purF"), "PO-2893", "Approved", "driver");
A.eq(env.call("purFPendingCount", W("purF")), 9, "approving a request drops the Pending count");
A.contains(R("purF"), '<span class="metric-value">9</span>', "the headline follows the data");
resetAll();
/* path-scoped */
W("purF").purfPath = "QA Path";
A.eq(env.call("purFPendingCount", W("purF")), 2, "the headline is scoped by the approval path");
A.contains(R("purF"), '<span class="metric-value">2</span>', "the headline renders the path-scoped count");
W("purF").purfPath = "Administration";
A.eq(env.call("purFPendingCount", W("purF")), 3, "Administration has three pending requests");
resetAll();
/* NOT status-scoped: it is the pending read, whatever the board is filtered to */
W("purF").purfStatus = "Approved";
A.eq(env.call("purFPendingCount", W("purF")), 10, "the headline ignores the status filter");
A.contains(R("purF"), '<span class="metric-value">10</span>', "the headline still reads 10 with the board on Approved");
resetAll();
A.eq(env.call("purFPendingCount", W("purF4")), 0, "the empty dataset has no pending requests");

/* =====================================================================
   4. THREE STATE COLUMNS, PLUS THE FINISH COLUMN ONLY AT ALL STATUSES
   ===================================================================== */
console.log("\n-- 4. state columns and the split Finish column --");
resetAll();
const board = R("purF");
STAGES.forEach(function (s) {
  A.contains(board, 'data-purf-drop="' + s + '"', "the board has a " + s + " column");
  A.contains(board, ">" + s + "</span>", "the " + s + " column is named in text");
});
A.eq(count(board, "data-purf-drop="), 5, "All statuses renders 3 state columns plus the 2 Finish halves");
A.contains(board, 'class="purf-finish"', "the split Finish column shows at All statuses");
A.contains(board, 'data-purf-drop="Closed"', "Finish offers Close as a drop target");
A.contains(board, 'data-purf-drop="Voided"', "Finish offers Void as a drop target");
A.contains(board, "paid orders only", "the Close half states it takes paid orders only");
A.contains(board, "unpaid only", "the Void half states it takes unpaid orders only");
A.contains(board, "grid-template-columns:repeat(3,1fr) 0.6fr", "the grid is 3 state columns plus the Finish column");
A.contains(board, ">Pending</span><span class=\"pur-kcol-n\">10<", "the Pending column count is 10");
A.contains(board, ">Approved</span><span class=\"pur-kcol-n\">6<", "the Approved column count is 6");
A.contains(board, ">Rejected</span><span class=\"pur-kcol-n\">2<", "the Rejected column count is 2");
/* one state selected: the other columns AND the Finish column go */
STAGES.forEach(function (s) {
  resetAll();
  W("purF").purfStatus = s;
  const one = R("purF");
  A.contains(one, 'data-purf-drop="' + s + '"', s + " only: its own column renders");
  A.eq(count(one, "data-purf-drop="), 1, s + " only: exactly one drop target, so no Finish column");
  A.absent(one, 'class="purf-finish"', s + " only: the Finish column is HIDDEN (it shows only at All statuses)");
  A.absent(one, 'data-purf-drop="Closed"', s + " only: no Close target");
  A.absent(one, 'data-purf-drop="Voided"', s + " only: no Void target");
  A.contains(one, "grid-template-columns:repeat(1,1fr)", s + " only: the grid is one column with no Finish track");
  STAGES.filter(function (o) { return o !== s; }).forEach(function (o) {
    A.absent(one, 'data-purf-drop="' + o + '"', s + " only: the " + o + " column is hidden");
  });
});
resetAll();
A.contains(R("purF3"), 'data-purf-drop="Pending"', "purF3 demos the single-status board");
A.absent(R("purF3"), "purf-finish", "purF3 has no Finish column, because it is not at All statuses");
/* the archive never reaches the board */
resetAll();
po("PO-2864").stage = "Closed";
A.eq(env.call("purFBoardRows", W("purF")).length, 17, "a closed order leaves the board");
A.absent(R("purF"), "PO-2864", "the closed order is not rendered on the board");
A.ok(env.call("purFTableRows", W("purF2")).some(function (p) { return p.ref === "PO-2864"; }), "the closed order is still in the Table");
resetAll();

/* =====================================================================
   5. OLDEST FIRST, IN BOTH VIEWS AND INSIDE EVERY COLUMN
   ===================================================================== */
console.log("\n-- 5. oldest-first sort --");
resetAll();
function isOldestFirst(refs, label) {
  let ok = true;
  for (let i = 1; i < refs.length; i++) {
    const a = po(refs[i - 1]), b = po(refs[i]);
    if (!a || !b) { ok = false; break; }
    if (new Date(a.issued) > new Date(b.issued)) { ok = false; break; }
  }
  return A.ok(ok, label + " is ordered oldest first  (" + refs.join(" ") + ")");
}
/* the function itself */
const sorted = env.call("purFOldestFirst", POS).map(function (p) { return p.ref; });
A.eq(sorted[0], "PO-2610", "purFOldestFirst puts the oldest order first");
A.eq(sorted[sorted.length - 1], "PO-2906", "purFOldestFirst puts the newest order last");
isOldestFirst(sorted, "purFOldestFirst output");
/* inside each board column, at Detail where nothing is trimmed */
STAGES.forEach(function (s) {
  const refs = colRefs(R("purF_x"), s);
  A.ok(refs && refs.length, "the " + s + " column renders cards at Detail");
  isOldestFirst(refs, "the " + s + " column");
});
A.eq((colRefs(R("purF_x"), "Pending") || [])[0], "PO-2885", "the longest-waiting pending request is at the top of its column");
A.eq((colRefs(R("purF_x"), "Approved") || [])[0], "PO-2610", "the oldest approved order is at the top of its column");
A.eq((colRefs(R("purF_x"), "Rejected") || [])[0], "PO-2902", "the oldest rejected order is at the top of its column");
/* and in the Table view */
const tRefs = refsIn(R("purF2"));
isOldestFirst(tRefs, "the PO Table");
A.eq(tRefs[0], "PO-2610", "the Table leads with the oldest order");
/* the trimmed views take the OLDEST, which is what the sort is for */
A.eq((colRefs(R("purF"), "Pending") || []).join(","), "PO-2885,PO-2888", "the trimmed board shows the two longest-waiting pending requests");
A.eq((colRefs(R("purF"), "Approved") || []).join(","), "PO-2610,PO-2655", "the trimmed board shows the two oldest approved orders");
resetAll();
W("purF").purfView = "table";
A.eq(refsIn(R("purF")).join(","), "PO-2610,PO-2655,PO-2633,PO-2864,PO-2885", "the trimmed table shows the five oldest orders");
resetAll();
/* no sort control is offered: the sort is settled, not user-changeable */
A.absent(R("purF2"), "wt-sort", "the table offers no sort buttons, because the sort is settled");
A.absent(block, 'data-purf="sort"', "no sort action exists in the block");

/* =====================================================================
   6. THE 2 / 5 / 10 PER-TIER CAPS
   ===================================================================== */
console.log("\n-- 6. per-tier caps 2 / 5 / 10 --");
resetAll();
A.eq(env.get("PURF_CAP_BOARD_WIDE"), 2, "the board cap at Explore is 2 cards per column");
A.eq(env.get("PURF_CAP_TABLE_WIDE"), 5, "the table cap at Explore is 5 rows");
A.eq(env.get("PURF_CAP_TABLE_XWIDE"), 10, "the table cap at Detail is 10 rows");
A.eq((colRefs(R("purF"), "Pending") || []).length, 2, "Explore board: 2 cards in the Pending column");
A.eq((colRefs(R("purF"), "Approved") || []).length, 2, "Explore board: 2 cards in the Approved column");
A.eq((colRefs(R("purF"), "Rejected") || []).length, 2, "Explore board: both rejected cards fit under the cap");
A.contains(R("purF"), "+8 more, view in the PO Table", "Explore board: Pending offers +8 more into the Table");
A.contains(R("purF"), "+4 more, view in the PO Table", "Explore board: Approved offers +4 more into the Table");
A.eq(count(R("purF"), 'data-purf="more"'), 2, "Explore board: only the two trimmed columns offer a more link");
A.eq((colRefs(R("purF_x"), "Pending") || []).length, 10, "Detail board: the Pending cap is lifted, all 10 cards render");
A.eq((colRefs(R("purF_x"), "Approved") || []).length, 6, "Detail board: all 6 approved cards render");
A.absent(R("purF_x"), 'data-purf="more"', "Detail board: no more link, because nothing is trimmed");
resetAll();
W("purF").purfView = "table";
A.eq(refsIn(R("purF")).length, 5, "Explore table: 5 rows");
A.contains(R("purF"), "Showing the 5 longest waiting of 18 requests", "Explore table names what is trimmed");
A.eq(refsIn(R("purF2")).length, 10, "Detail table: 10 rows");
A.contains(R("purF2"), "Showing the 10 longest waiting of 18 requests", "Detail table names what is trimmed");
/* the totals row totals the WHOLE filtered set, never the visible page */
A.contains(R("purF2"), "<span>18 requests</span>", "the totals row counts all 18 requests, not the visible 10");
A.contains(R("purF"), "<span>18 requests</span>", "the totals row is set-wide at Explore too");
resetAll();

/* =====================================================================
   7. FILTERS
   ===================================================================== */
console.log("\n-- 7. filters --");
resetAll();
/* status popover */
fire("status", { "data-id": "purF" });
A.ok(env.shim.nodes.purfPop, "the status chip opens a popover");
A.contains(popHTML(), "PO status", "the status popover is captioned");
/* a short fixed list gets bare options, exactly as her own pur-status popover
   does; only the searchable path menu wraps them in a listbox */
A.contains(popHTML(), 'role="option"', "the status popover renders selectable options");
A.contains(popHTML(), 'aria-selected="true"', "the current status is marked selected");
STAGES.concat(["All statuses"]).forEach(function (v) {
  A.contains(popHTML(), '>' + v + '</span>', "board status popover offers " + v);
});
A.absent(popHTML(), ">Closed</span>", "board status popover does NOT offer Closed");
A.absent(popHTML(), ">Voided</span>", "board status popover does NOT offer Voided");
A.eq(count(popHTML(), 'data-purf="set-status"'), 4, "the board offers exactly 4 status values");
fire("status", { "data-id": "purF" });
A.ok(!env.shim.nodes.purfPop, "clicking the chip again closes the popover");
/* the table adds the archive values */
resetAll();
fire("status", { "data-id": "purF2" });
A.eq(count(popHTML(), 'data-purf="set-status"'), 6, "the Table offers 6 status values, adding the archive");
A.contains(popHTML(), ">Closed</span>", "the Table status popover offers Closed");
A.contains(popHTML(), ">Voided</span>", "the Table status popover offers Voided");
A.contains(popHTML(), "archive states", "the Table popover explains what Closed and Voided are");
env.call("purFClosePop");
/* selecting a status sets state, resets the path, and fetches */
resetAll();
const rBefore = env.log.renders;
fire("set-status", { "data-id": "purF", "data-v": "Approved" });
A.eq(W("purF").purfStatus, "Approved", "selecting a status stores it on the widget");
A.eq(W("purF").purfPath, null, "changing the status clears the approval path");
A.eq(W("purF").purfLoading, true, "a status change is a fetch, so it shows loading");
A.ok(env.log.renders > rBefore, "the status change re-renders");
A.contains(R("purF"), "purf-skel", "loading renders the skeleton");
A.contains(R("purF"), "bgt-spin", "loading renders Jo's spinner");
A.contains(R("purF"), "Loading purchase requests", "the skeleton says what is loading");
A.absent(R("purF"), "purf-board", "the board is replaced while loading");
W("purF").purfLoading = false;
A.eq(env.call("purFBoardRows", W("purF")).length, 6, "the Approved filter narrows the board to 6");
/* an archive value cannot survive a switch back to the board */
resetAll();
W("purF2").purfStatus = "Closed";
A.eq(env.call("purFStatusCur", W("purF2")), "Closed", "the Table honours a Closed selection");
W("purF2").purfView = "kanban";
A.eq(env.call("purFStatusCur", W("purF2")), "All statuses", "switching to the board drops the impossible Closed selection");
resetAll();
/* approval path: dependent, searchable, omitted when dead */
A.eq(env.call("purFPathVals", W("purF")).length, 4, "All statuses exposes all four approval paths");
W("purF").purfStatus = "Rejected";
A.eq(env.call("purFPathVals", W("purF")).join(","), "Administration,QA Path", "the path list re-derives from the selected status");
resetAll();
fire("path", { "data-id": "purF" });
A.contains(popHTML(), 'class="dd-search"', "the path popover is a branded searchable menu, not a native select");
A.contains(popHTML(), 'id="purfPathQ"', "the path popover has a search input");
A.contains(popHTML(), "All approval paths", "the path popover offers all paths");
PATHS.forEach(function (p) { A.contains(popHTML(), ">" + p + "</span>", "the path popover offers " + p); });
fireInput("purfPathQ", "qa");
A.contains(popHTML(), ">QA Path</span>", "searching qa keeps QA Path");
A.absent(popHTML(), ">Administration</span>", "searching qa drops Administration");
fireInput("purfPathQ", "zzz");
A.contains(popHTML(), "No approval paths match", "an empty search says so");
env.call("purFClosePop");
resetAll();
fire("set-path", { "data-id": "purF", "data-v": "QA Path" });
A.eq(W("purF").purfPath, "QA Path", "selecting a path stores it");
A.eq(W("purF").purfLoading, true, "a path change is a fetch");
W("purF").purfLoading = false;
/* QA Path holds PO-2897 and PO-2903 pending, PO-2879 approved, PO-2906 rejected */
A.eq(env.call("purFBoardRows", W("purF")).length, 4, "the QA Path filter narrows the board to 4");
fire("set-path", { "data-id": "purF", "data-v": "all" });
A.eq(W("purF").purfPath, null, "choosing all paths clears the selection");
/* an impossible path selection resets rather than emptying the view */
resetAll();
W("purF").purfPath = "Education Ministry";
W("purF").purfStatus = "Rejected";
A.eq(env.call("purFPathCur", W("purF")), "All approval paths", "a path that the status cannot produce resets to all paths");
/* one path only means a dead control, so the chip is omitted */
resetAll();
const keep = POS.slice();
POS.length = 0;
keep.filter(function (p) { return p.path === "Everyone"; }).forEach(function (p) { POS.push(p); });
A.eq(env.call("purFPathVals", W("purF")).length, 1, "the fixture now has one approval path");
A.absent(R("purF"), 'data-purf="path"', "with one path the chip is omitted, never rendered dead");
resetAll();
A.contains(R("purF"), 'data-purf="path"', "with several paths the chip is back");
/* the three Rule 11 filters are Table-only and Detail-only */
resetAll();
A.absent(R("purF"), 'data-purf="dept"', "Explore board: no Department chip");
A.absent(R("purF_x"), 'data-purf="dept"', "Detail board: no Department chip, it is Table only");
A.absent(R("purF_x"), 'data-purf="ov"', "Detail board: no Overdue chip, it is Table only");
W("purF").purfView = "table";
A.absent(R("purF"), 'data-purf="dept"', "Explore table: the Rule 11 chips appear at Detail, not here");
resetAll();
A.contains(R("purF2"), 'data-purf="dept"', "Detail table: Department chip present");
A.contains(R("purF2"), 'data-purf="year"', "Detail table: Year chip present");
A.contains(R("purF2"), 'data-purf="ov"', "Detail table: Overdue only chip present");
fire("dept", { "data-id": "purF2" });
A.contains(popHTML(), "not confirmed to exist", "the Department popover flags the unconfirmed field");
env.call("purFClosePop");
fire("year", { "data-id": "purF2" });
A.contains(popHTML(), "not confirmed to exist", "the Year popover flags the unconfirmed field");
env.call("purFClosePop");
fire("set-dept", { "data-id": "purF2", "data-v": "Finance" });
A.eq(W("purF2").purfDept, "Finance", "selecting a department stores it");
A.eq(W("purF2").purfLoading, true, "a department change is a fetch");
W("purF2").purfLoading = false;
A.eq(env.call("purFTableRows", W("purF2")).length, 4, "Finance narrows the table to 4 orders");
fire("set-dept", { "data-id": "purF2", "data-v": "all" });
A.eq(W("purF2").purfDept, null, "all departments clears the selection");
W("purF2").purfLoading = false;
fire("set-year", { "data-id": "purF2", "data-v": "FY 2025" });
A.eq(W("purF2").purfYear, "FY 2025", "selecting a year stores it");
W("purF2").purfLoading = false;
A.eq(env.call("purFTableRows", W("purF2")).length, 3, "FY 2025 narrows the table to 3 orders");
resetAll();
/* overdue */
A.eq(POS.filter(function (p) { return env.call("purFOverdue", p); }).length, 4, "four pending requests are past their expected-by date");
fire("ov", { "data-id": "purF2" });
A.eq(W("purF2").purfOv, true, "the overdue chip toggles on");
A.eq(W("purF2").purfLoading, true, "an overdue change is a fetch");
W("purF2").purfLoading = false;
A.eq(env.call("purFTableRows", W("purF2")).length, 4, "overdue only narrows the table to the 4 overdue requests");
A.contains(R("purF2"), 'aria-pressed="true"', "the overdue chip reports its pressed state");
fire("ov", { "data-id": "purF2" });
A.eq(W("purF2").purfOv, false, "the overdue chip toggles off again");
W("purF2").purfLoading = false;
A.eq(env.call("purFTableRows", W("purF2")).length, 18, "clearing overdue restores the full table");
/* overdue is never colour alone */
A.contains(R("purF2"), "purf-ovrow", "an overdue row gets the red highlight");
A.contains(R("purF2"), "purf-ovflag", "an overdue row also gets a flag");
A.contains(R("purF2"), ">Overdue<", "the overdue flag carries the word Overdue");
A.contains(R("purF"), ", overdue", "an overdue card says overdue in text on the card");
resetAll();

/* =====================================================================
   8. THE VIEW TOGGLE, AND LOADING ONLY ON A FETCH
   ===================================================================== */
console.log("\n-- 8. view toggle --");
resetAll();
A.contains(R("purF"), 'data-purf="view" data-id="purF" data-v="kanban"', "Explore offers the Kanban segment");
A.contains(R("purF"), 'data-purf="view" data-id="purF" data-v="table"', "Explore offers the Table segment");
A.contains(R("purF_x"), 'data-purf="view"', "Detail offers the view toggle too");
A.contains(R("purF"), 'data-v="kanban" aria-pressed="true"', "Kanban reads as the pressed segment by default");
const beforeToggle = R("purF");
fire("view", { "data-id": "purF", "data-v": "table" });
A.eq(W("purF").purfView, "table", "the toggle switches the view");
A.eq(!!W("purF").purfLoading, false, "a view switch is a local re-render and shows NO loading");
A.changed(beforeToggle, R("purF"), "the view switch changes the output");
A.contains(R("purF"), 'data-v="table" aria-pressed="true"', "Table now reads as the pressed segment");
fire("view", { "data-id": "purF", "data-v": "kanban" });
A.eq(W("purF").purfView, "kanban", "the toggle switches back, so the way back never needs the 3-dot menu");
A.same(beforeToggle, R("purF"), "switching back restores the original board exactly");
/* the more link is the other route into the Table */
fire("more", { "data-id": "purF" });
A.eq(W("purF").purfView, "table", "the +N more link switches to the Table view");
A.eq(!!W("purF").purfLoading, false, "the more link is a local re-render, no loading");
resetAll();

/* =====================================================================
   9. DRAG, HOLD AND FINISH GUARDS
   ===================================================================== */
console.log("\n-- 9. drag, hold and Finish guards --");
resetAll();
A.contains(R("purF"), 'draggable="true"', "cards are draggable");
A.contains(R("purF"), 'data-purf-card="PO-2885"', "each card carries its own drag handle attribute");
/* a normal drag opens the reason popup, and only Confirm applies it */
fireDrag("dragstart", { "data-purf-card": "PO-2885", "data-id": "purF" });
A.ok(env.get("PURF_DRAG"), "dragging a normal card starts a drag");
A.eq(env.get("PURF_DRAG").ref, "PO-2885", "the drag carries the card it started on");
fireDrag("drop", { "data-purf-drop": "Approved", "data-id": "purF" });
A.ok(env.get("PURF_MOVE"), "dropping on another column opens the move confirmation");
A.eq(env.get("PURF_MOVE").to, "Approved", "the confirmation knows the target state");
A.eq(po("PO-2885").stage, "Pending", "the drop alone changes nothing: Confirm is required");
A.contains(modalHTML(), "Move PO-2885 to Approved", "the confirmation names the move");
A.contains(modalHTML(), "Reason or note, recorded on the request", "the confirmation asks for the Reason from the real Approvals tab");
A.contains(modalHTML(), "Confirm move", "the confirmation has a Confirm button");
A.contains(modalHTML(), 'data-purf="move-cancel"', "the confirmation has a Cancel");
fireInput("purfMoveNote", "Approved after budget check");
A.eq(env.get("PURF_MOVE").note, "Approved after budget check", "the reason is captured as it is typed");
fire("move-confirm", { "data-id": "purF" });
A.eq(po("PO-2885").stage, "Approved", "Confirm applies the move");
A.eq(po("PO-2885").log[po("PO-2885").log.length - 1].note, "Approved after budget check", "the reason is recorded on the request");
A.eq(po("PO-2885").log[po("PO-2885").log.length - 1].to, "Approved", "the activity log records the new state");
A.ok(!env.get("PURF_MOVE"), "the confirmation closes after Confirm");
/* Cancel reverts to no change */
resetAll();
fireDrag("dragstart", { "data-purf-card": "PO-2888", "data-id": "purF" });
fireDrag("drop", { "data-purf-drop": "Rejected", "data-id": "purF" });
A.contains(modalHTML(), "Why is this request being rejected?", "rejecting asks why");
fire("move-cancel", {});
A.eq(po("PO-2888").stage, "Pending", "Cancel leaves the request exactly as it was");
A.ok(!env.get("PURF_MOVE"), "Cancel closes the confirmation");
/* a same-column drop is a no-op */
resetAll();
fireDrag("dragstart", { "data-purf-card": "PO-2893", "data-id": "purF" });
fireDrag("drop", { "data-purf-drop": "Pending", "data-id": "purF" });
A.ok(!env.get("PURF_MOVE"), "a same-column drop opens nothing");
A.eq(po("PO-2893").stage, "Pending", "a same-column drop changes nothing");
/* HOLD blocks the drag at the source */
resetAll();
A.eq(po("PO-2891").hold, true, "PO-2891 is on hold in the fixture");
const statusBefore = env.log.status.length;
fireDrag("dragstart", { "data-purf-card": "PO-2891", "data-id": "purF" });
A.ok(!env.get("PURF_DRAG"), "a held card refuses to start a drag");
A.ok(env.log.status.length > statusBefore, "the refusal is explained to the user");
A.contains(env.log.status[env.log.status.length - 1], "remove the hold", "the message says to remove the hold first");
fireDrag("drop", { "data-purf-drop": "Approved", "data-id": "purF" });
A.ok(!env.get("PURF_MOVE"), "with no drag started, a drop does nothing");
A.eq(po("PO-2891").stage, "Pending", "the held card never moved");
/* and the guard is repeated in the apply function, not only in the UI */
A.eq(env.call("purFApplyMove", W("purF"), "PO-2891", "Approved", ""), false, "purFApplyMove refuses a held request");
/* held card rendering: colour AND text */
const heldHTML = R("purF_x");
A.contains(heldHTML, "purf-card-hold", "the held card gets its own colour state");
A.contains(heldHTML, "purf-holdflag", "the held card gets a hold flag");
A.contains(heldHTML, "On hold: Waiting on budget confirmation", "the held card shows the reason in text");
A.contains(heldHTML, "cannot be moved until the hold is removed", "the held card's label says it cannot be moved");
/* FINISH column: Close takes paid only */
resetAll();
A.eq(po("PO-2872").pay, "unpaid", "PO-2872 is approved and not paid");
fireDrag("dragstart", { "data-purf-card": "PO-2872", "data-id": "purF" });
fireDrag("drop", { "data-purf-drop": "Closed", "data-id": "purF" });
A.ok(!env.get("PURF_MOVE"), "an unpaid order cannot be dropped on Close");
A.contains(env.log.status[env.log.status.length - 1], "Only paid orders can be closed", "the refusal names the rule");
A.eq(po("PO-2872").stage, "Approved", "the unpaid order stays where it was");
A.eq(env.call("purFApplyMove", W("purF"), "PO-2872", "Closed", ""), false, "purFApplyMove refuses to close an unpaid order");
/* Close succeeds on a paid order */
resetAll();
A.eq(po("PO-2864").pay, "paid", "PO-2864 is paid");
fireDrag("dragstart", { "data-purf-card": "PO-2864", "data-id": "purF" });
fireDrag("drop", { "data-purf-drop": "Closed", "data-id": "purF" });
A.ok(env.get("PURF_MOVE"), "a paid order can be dropped on Close");
A.contains(modalHTML(), "Close PO-2864", "the confirmation names the close");
A.contains(modalHTML(), "Close order", "the confirm button says Close order");
A.contains(modalHTML(), "stays in the PO Table", "the confirmation says where the order goes");
fire("move-confirm", { "data-id": "purF" });
A.eq(po("PO-2864").stage, "Closed", "Confirm closes the order");
A.absent(R("purF_x"), "PO-2864", "the closed order has left the board");
/* Void takes unpaid only, and never a paid order */
resetAll();
fireDrag("dragstart", { "data-purf-card": "PO-2864", "data-id": "purF" });
fireDrag("drop", { "data-purf-drop": "Voided", "data-id": "purF" });
A.ok(!env.get("PURF_MOVE"), "a paid order cannot be voided from the dashboard");
A.contains(env.log.status[env.log.status.length - 1], "cannot be voided here", "the refusal explains why");
A.eq(env.call("purFApplyMove", W("purF"), "PO-2864", "Voided", ""), false, "purFApplyMove refuses to void a paid order");
resetAll();
fireDrag("dragstart", { "data-purf-card": "PO-2872", "data-id": "purF" });
fireDrag("drop", { "data-purf-drop": "Voided", "data-id": "purF" });
A.ok(env.get("PURF_MOVE"), "an unpaid order can be dropped on Void");
A.contains(modalHTML(), "Void PO-2872", "the confirmation names the void");
A.contains(modalHTML(), "Void order", "the confirm button says Void order");
A.contains(modalHTML(), "not asserted", "the void confirmation asserts NO financial reversal, which is deliberately unresolved");
fire("move-confirm", { "data-id": "purF" });
A.eq(po("PO-2872").stage, "Voided", "Confirm voids the order");
/* the archive is final */
A.eq(env.call("purFApplyMove", W("purF"), "PO-2872", "Pending", ""), false, "a voided order cannot return to the board");
resetAll();
po("PO-2864").stage = "Closed";
A.eq(env.call("purFApplyMove", W("purF"), "PO-2864", "Approved", ""), false, "a closed order cannot return to the board");
resetAll();
/* dragover / dragleave never throw on a real or a bare target */
fireDrag("dragover", { "data-purf-drop": "Approved", "data-id": "purF" });
fireDrag("dragleave", { "data-purf-drop": "Approved", "data-id": "purF" });
fireDrag("dragover", {});
fireDrag("drop", {});
A.ok(true, "dragover, dragleave and a drop on nothing all pass without throwing");
/* hold and remove hold through the modal */
resetAll();
fire("hold-open", { "data-id": "purF", "data-purf-ref": "PO-2893", "data-v": "hold" });
A.ok(env.get("PURF_HOLD"), "Put on hold opens its own confirmation");
A.contains(modalHTML(), "Put PO-2893 on hold", "the hold confirmation names the request");
A.contains(modalHTML(), "Reason, recorded on the request", "the hold confirmation asks for a reason");
A.contains(modalHTML(), "cannot be moved until someone removes the hold", "the hold confirmation says what a hold does");
fireInput("purfHoldNote", "Vendor query outstanding");
fire("hold-confirm", { "data-id": "purF" });
A.eq(po("PO-2893").hold, true, "the hold is applied");
A.eq(po("PO-2893").log[po("PO-2893").log.length - 1].note, "Vendor query outstanding", "the hold reason is recorded");
A.eq(po("PO-2893").log[po("PO-2893").log.length - 1].to, "On hold", "the activity log records the hold");
fireDrag("dragstart", { "data-purf-card": "PO-2893", "data-id": "purF" });
A.ok(!env.get("PURF_DRAG"), "the newly held card now refuses to be dragged");
fire("hold-open", { "data-id": "purF", "data-purf-ref": "PO-2893", "data-v": "unhold" });
A.contains(modalHTML(), "Remove hold on PO-2893", "Remove hold opens its own confirmation");
fire("hold-confirm", { "data-id": "purF" });
A.eq(po("PO-2893").hold, false, "the hold is removed");
fireDrag("dragstart", { "data-purf-card": "PO-2893", "data-id": "purF" });
A.ok(env.get("PURF_DRAG"), "with the hold removed the card drags again");
/* who can be held */
resetAll();
A.eq(env.call("purFCanHold", po("PO-2893")), true, "a pending request can be held");
A.eq(env.call("purFCanHold", po("PO-2872")), true, "an approved unpaid request can be held");
A.eq(env.call("purFCanHold", po("PO-2864")), false, "a paid request cannot be held");
A.eq(env.call("purFCanHold", po("PO-2902")), false, "a rejected request cannot be held");
A.eq(env.call("purFCanHold", po("PO-2891")), false, "an already held request cannot be held again");
A.eq(env.call("purFApplyHold", W("purF"), "PO-2864", "hold", ""), false, "purFApplyHold refuses a paid request");
A.eq(env.call("purFApplyHold", W("purF"), "PO-2893", "unhold", ""), false, "purFApplyHold refuses to unhold what is not held");
resetAll();

/* =====================================================================
   10. THE RECORD MODAL, ITS FIVE TABS, UPDATE AND CANCEL
   ===================================================================== */
console.log("\n-- 10. record modal --");
resetAll();
fire("open", { "data-id": "purF", "data-purf-ref": "PO-2893" });
A.ok(env.get("PURF_MODAL"), "a card opens the record modal");
A.eq(env.get("PURF_MODAL").tab, "detail", "a pending request opens on Detail");
let m = modalHTML();
A.contains(m, 'role="dialog"', "the modal is a dialog");
A.contains(m, 'aria-modal="true"', "the modal is modal");
A.contains(m, 'class="modal-backdrop"', "the modal reuses Jo's backdrop");
A.contains(m, 'class="modal purf-modal"', "the modal reuses Jo's modal shell");
A.contains(m, "Purchase order PO-2893", "the modal titles the record");
A.contains(m, "Requests, Update", "the modal names the real screen it mirrors");
["Detail", "Approvals", "Attachments", "Note", "Payment Approval"].forEach(function (t) {
  A.contains(m, ">" + t + "</button>", "the modal offers the " + t + " tab");
});
A.contains(m, 'class="pur-tabs purf-mtabs"', "the modal tabs ride on Jo's .pur-tabs component");
A.contains(m, 'data-purf="update"', "the modal footer has Update");
A.contains(m, ">Update</button>", "the Update button is labelled Update");
A.contains(m, ">Cancel</button>", "the modal footer has Cancel");
A.contains(m, "kept for this session only", "the footer says the edits do not persist");
/* header form, the record-screen parity fields */
["Email", "Date Requested", "Type", "Issued To", "Status", "Agent", "Approval Path", "Shipping", "Payment Approval Path", "Requisition #"].forEach(function (f) {
  A.contains(m, ">" + f + "<", "the header form has the " + f + " field");
});
A.contains(m, "Vendor", "the header shows the vendor block");
A.contains(m, "3003 Airways Blvd", "the vendor block shows the address");
A.contains(m, "Terms:", "the vendor block shows the terms");
A.contains(m, ">Unapproved<", "the record status uses the record screen's own vocabulary");
A.contains(m, 'data-purf="set-po-path"', "the approval path is editable while the request is pending");
/* Detail tab */
A.contains(m, "Line items", "Detail renders the line-item grid");
["Period", "Account", "Description", "Project", "Amount"].forEach(function (c) {
  A.contains(m, ">" + c + "</span>", "the line grid has the " + c + " column");
});
A.contains(m, "Fund: 1 Church", "Detail shows the account distribution");
A.contains(m, "50210 Office Supplies", "Detail shows the account number");
A.contains(m, ">Tax <", "Detail has the Tax field");
A.contains(m, ">Freight <", "Detail has the Freight field");
A.contains(m, "Total <strong>$245.00</strong>", "Detail totals the record with two decimals");
/* Approvals tab */
fire("tab", { "data-id": "purF", "data-v": "approvals" });
m = modalHTML();
A.eq(env.get("PURF_MODAL").tab, "approvals", "the tab switch is recorded");
["Approval Needed By", "Approved", "Rejected", "Reason", "Hold", "Approval Updated By"].forEach(function (c) {
  A.contains(m, c, "the Approvals grid has the " + c + " column");
});
A.contains(m, "Ends with", "the Approvals grid has the Ends with row");
A.contains(m, "Nitzi Wright", "the Approvals tab lists the approvers on the path");
A.contains(m, "Approvers on Administration", "the Approvals tab names the path");
A.contains(m, "not built yet", "the Approvals tab flags the unbuilt approver sequencing and permissions");
A.contains(m, 'data-purf="appr-box" data-k="approve"', "the Approved checkbox is actionable");
A.contains(m, 'data-purf="appr-box" data-k="reject"', "the Rejected checkbox is actionable");
A.contains(m, 'data-purf="appr-box" data-k="hold"', "the Hold checkbox is actionable");
A.contains(m, 'role="checkbox"', "the boxes are real checkboxes to a screen reader");
/* Attachments */
fire("tab", { "data-id": "purF", "data-v": "attachments" });
m = modalHTML();
A.contains(m, "No attachments on this request", "Attachments renders its empty state");
A.contains(m, "Add New Attachment", "Attachments offers the Add stub");
const sBefore2 = env.log.status.length;
fire("attach-stub", { "data-id": "purF" });
A.ok(env.log.status.length > sBefore2, "the Add stub says it is a placeholder");
A.contains(env.log.status[env.log.status.length - 1], "placeholder", "the attachment action is labelled a placeholder, not a fake success");
/* Note */
fire("tab", { "data-id": "purF", "data-v": "note" });
m = modalHTML();
A.contains(m, 'id="purfRecordNote"', "Note offers an editable note");
A.contains(m, "Activity", "Note shows the activity log");
A.contains(m, "No activity recorded on this request yet", "an unactioned request has an empty activity log");
fireInput("", "Chased the vendor", { "data-purf-field": "note", "data-purf-ref": "PO-2893", "data-id": "purF" });
A.eq(po("PO-2893").f.note, "Chased the vendor", "the note is kept on the request");
/* Payment Approval on a pending request */
fire("tab", { "data-id": "purF", "data-v": "payment" });
m = modalHTML();
A.contains(m, "Payment approval starts after the purchase order is fully approved", "payment is unavailable before approval");
A.contains(m, "purf-disputed", "the payment tab carries the dispute flag");
A.contains(m, "action item C3", "the payment tab names the open C3 dispute and picks no side");
A.contains(m, "carried unresolved", "the payment tab states the dispute is carried, not resolved");
/* Update and Cancel */
const sBefore3 = env.log.status.length;
fire("update", { "data-id": "purF" });
A.ok(!env.get("PURF_MODAL"), "Update closes the modal");
A.ok(env.log.status.length > sBefore3, "Update reports what it did");
A.contains(env.log.status[env.log.status.length - 1], "session only", "Update says the change is not persisted");
A.eq(modalHTML(), "", "the modal root is emptied after Update");
fire("open", { "data-id": "purF", "data-purf-ref": "PO-2893" });
fire("close-modal", {});
A.ok(!env.get("PURF_MODAL"), "Cancel closes the modal");
A.eq(modalHTML(), "", "the modal root is emptied after Cancel");
/* Escape closes, innermost first */
fire("open", { "data-id": "purF", "data-purf-ref": "PO-2893" });
fireKey("Escape");
A.ok(!env.get("PURF_MODAL"), "Escape closes the record modal");
fire("status", { "data-id": "purF" });
fireKey("Escape");
A.ok(!env.shim.nodes.purfPop, "Escape closes the popover");
/* an unpaid approved card goes straight to payment entry */
resetAll();
fire("open", { "data-id": "purF", "data-purf-ref": "PO-2872" });
A.eq(env.get("PURF_MODAL").tab, "payment", "an unpaid approved card opens straight on Payment Approval");
m = modalHTML();
["Invoice Number", "Tax", "Freight", "Other", "Check #", "Check Date", "Setup Information"].forEach(function (c) {
  A.contains(m, c, "the invoice grid has the " + c + " column");
});
A.contains(m, "Add Invoice Payment Approval", "the payment tab offers Add Invoice Payment Approval");
A.contains(m, "No invoice payment approvals yet", "an unpaid order has no invoices yet");
A.contains(m, "Submit for Approval", "the payment tab has the real Submit for Approval control");
A.contains(m, "check being issued", "the payment tab tells a developer to read green as check issued");
fire("add-invoice", { "data-id": "purF", "data-purf-ref": "PO-2872" });
A.eq(po("PO-2872").inv.length, 1, "Add Invoice adds an invoice row");
A.contains(modalHTML(), "Account: 50510 Building Maintenance", "the invoice row carries its account distribution");
fireInput("", "INV-9001", { "data-purf-inv": "no", "data-purf-i": "0", "data-purf-ref": "PO-2872", "data-id": "purF" });
A.eq(po("PO-2872").inv[0].no, "INV-9001", "the invoice number is captured");
fire("pay-submit", { "data-id": "purF", "data-purf-ref": "PO-2872" });
A.eq(po("PO-2872").pay, "paid", "Submit for Approval marks the request paid");
A.ok(po("PO-2872").inv[0].check, "submitting fills the mock check number");
A.ok(po("PO-2872").inv[0].checkDate, "submitting fills the mock check date");
A.contains(po("PO-2872").log[po("PO-2872").log.length - 1].note, "INV-9001", "the invoice number is recorded on the request");
A.contains(R("purF_x"), "purf-card-paid", "the card turns green once paid");
A.contains(R("purF_x"), "Payment: paid", "the green card is paired with the paid badge in text");
A.eq(env.call("purFPaySubmit", W("purF"), "PO-2872"), false, "a paid request cannot be submitted twice");
/* payment entry refuses while held */
resetAll();
env.call("purFApplyHold", W("purF"), "PO-2879", "hold", "driver");
A.eq(env.call("purFPaySubmit", W("purF"), "PO-2879"), false, "a held request cannot be submitted for payment");
A.contains(env.log.status[env.log.status.length - 1], "remove the hold", "the refusal says to remove the hold");
/* the Approvals grid drives the card through the SAME guards as drag */
resetAll();
fire("open", { "data-id": "purF", "data-purf-ref": "PO-2893" });
fire("appr-box", { "data-id": "purF", "data-purf-ref": "PO-2893", "data-k": "approve", "data-v": "on" });
A.eq(po("PO-2893").stage, "Approved", "ticking Approved moves the card");
fire("appr-box", { "data-id": "purF", "data-purf-ref": "PO-2893", "data-k": "approve", "data-v": "off" });
A.eq(po("PO-2893").stage, "Pending", "unticking Approved returns the card to Pending");
fire("appr-box", { "data-id": "purF", "data-purf-ref": "PO-2893", "data-k": "reject", "data-v": "on" });
A.eq(po("PO-2893").stage, "Rejected", "ticking Rejected moves the card");
resetAll();
fire("appr-box", { "data-id": "purF", "data-purf-ref": "PO-2893", "data-k": "hold", "data-v": "on" });
A.eq(po("PO-2893").hold, true, "ticking Hold holds the card");
fire("appr-box", { "data-id": "purF", "data-purf-ref": "PO-2893", "data-k": "approve", "data-v": "on" });
A.eq(po("PO-2893").stage, "Pending", "a held request refuses an approval change, the same as drag");
A.contains(env.log.status[env.log.status.length - 1], "remove the hold", "the refusal is explained");
resetAll();
fire("appr-box", { "data-id": "purF", "data-purf-ref": "PO-2864", "data-k": "approve", "data-v": "off" });
A.eq(po("PO-2864").stage, "Approved", "a paid request is locked against approval changes");
A.contains(env.log.status[env.log.status.length - 1], "locked", "the lock is explained");
po("PO-2864").stage = "Closed";
fire("appr-box", { "data-id": "purF", "data-purf-ref": "PO-2864", "data-k": "approve", "data-v": "off" });
A.contains(env.log.status[env.log.status.length - 1], "final", "closed and voided orders are stated to be final");
/* the record modal on a closed and a voided order */
resetAll();
po("PO-2864").stage = "Closed";
fire("open", { "data-id": "purF2", "data-purf-ref": "PO-2864" });
fire("tab", { "data-id": "purF2", "data-v": "payment" });
A.contains(modalHTML(), "payment history is read-only", "a closed order's payment history is read-only");
A.contains(modalHTML(), ">Closed<", "a closed order shows the Closed record status");
resetAll();
po("PO-2872").stage = "Voided";
fire("open", { "data-id": "purF2", "data-purf-ref": "PO-2872" });
fire("tab", { "data-id": "purF2", "data-v": "payment" });
A.contains(modalHTML(), "Voided orders do not enter payment approval", "a voided order has no payment approval");
resetAll();
fire("open", { "data-id": "purF", "data-purf-ref": "PO-2902" });
fire("tab", { "data-id": "purF", "data-v": "payment" });
A.contains(modalHTML(), "Rejected requests do not enter payment approval", "a rejected request has no payment approval");
fire("tab", { "data-id": "purF", "data-v": "note" });
A.contains(modalHTML(), "Duplicate of PO-2891", "a rejected request shows its rejection reason in the activity log");
resetAll();
/* a table row opens the same record, by click and by Enter */
fire("open", { "data-id": "purF2", "data-purf-ref": "PO-2610" });
A.eq(env.get("PURF_MODAL").ref, "PO-2610", "a table row click opens the record");
env.call("purFCloseModal");
fireKey("Enter", { "data-purf-ref": "PO-2655", "data-id": "purF2" }, "div");
A.ok(!env.get("PURF_MODAL"), "Enter on a non-row does nothing");
const rowNode = env.shim.mkTarget({ "data-purf-ref": "PO-2655", "data-id": "purF2" }, "div", "wt-row purf-trow purf-rowclick");
(env.shim.listeners.keydown || []).forEach(function (fn) { fn({ key: "Enter", target: rowNode }); });
A.ok(env.get("PURF_MODAL") && env.get("PURF_MODAL").ref === "PO-2655", "Enter on a focused table row opens the record, the keyboard route");
resetAll();

/* =====================================================================
   11. EMPTY STATES
   ===================================================================== */
console.log("\n-- 11. empty states --");
resetAll();
A.contains(hEmpty, 'class="state" data-kind="empty"', "the empty dataset renders Jo's .state block");
A.contains(hEmpty, "Nothing needs your approval", "the empty state uses the purposeful copy");
A.contains(hEmpty, "anything that needs you shows up", "the empty state explains what will change");
A.contains(hEmpty, "Jo Lopez", "the adapted empty copy credits its source");
A.absent(hEmpty, "dep-hd", "the empty state has no duplicated header above it");
A.absent(hEmpty, "purf-board", "the empty state renders no board");
A.absent(hEmpty, "No deposit accounts", "the empty state is OURS, not the shared Deposits copy");
/* a state flag reaches the same place as an empty dataset */
resetAll();
W("purF").state = "empty";
A.contains(R("purF"), "Nothing needs your approval", "an explicit empty state flag lands on the same state");
resetAll();
/* a column with nothing in it stays visible and says so */
po("PO-2902").stage = "Pending";
po("PO-2906").stage = "Pending";
const noRej = R("purF");
A.contains(noRej, 'data-purf-drop="Rejected"', "an empty state column stays on the board");
A.contains(noRej, "None waiting", "an empty column says None waiting rather than going blank");
A.contains(noRej, ">Rejected</span><span class=\"pur-kcol-n\">0<", "the empty column shows a count of zero");
resetAll();
/* the filtered-empty board state */
const pend = POS.filter(function (p) { return p.stage === "Pending"; });
pend.forEach(function (p) { p.stage = "Approved"; });
W("purF").purfStatus = "Pending";
const fEmpty = R("purF");
A.contains(fEmpty, "No purchase requests match", "a filter that matches nothing says so");
A.contains(fEmpty, "Change the filters above", "the filtered-empty state tells the user what to do");
A.contains(fEmpty, "dep-hd", "the filtered-empty state KEEPS the header, so the filters stay reachable");
resetAll();
/* the filtered-empty table state keeps the totals row at zero */
W("purF2").purfDept = "Finance";
W("purF2").purfYear = "FY 2025";
W("purF2").purfOv = true;
const tEmpty = R("purF2");
A.eq(env.call("purFTableRows", W("purF2")).length, 0, "that filter combination matches no orders");
A.contains(tEmpty, "No purchase orders match these filters", "the table shows an in-table empty row");
A.contains(tEmpty, "<span>0 requests</span>", "the totals row shows zero requests");
A.contains(tEmpty, "$0.00", "the totals row shows a zero total");
A.contains(tEmpty, "PO #", "the table keeps its column headers when empty");
resetAll();

/* =====================================================================
   12. NO EM DASH, ACROSS EVERY SIZE x STATUS x PATH x VIEW
   ===================================================================== */
console.log("\n-- 12. no-em-dash sweep --");
resetAll();
let sweeps = 0;
["purF_k", "purF", "purF_x"].forEach(function (id) {
  ["kanban", "table"].forEach(function (view) {
    ["All statuses"].concat(STAGES, ["Closed", "Voided"]).forEach(function (st) {
      ["All approval paths"].concat(PATHS).forEach(function (pa) {
        const w = W(id);
        w.purfView = view;
        w.purfStatus = st;
        w.purfPath = (pa === "All approval paths") ? null : pa;
        const html = env.call("purFContent", w);
        A.noEmDash(html, id + " / " + view + " / " + st + " / " + pa);
        sweeps++;
      });
      resetState();
    });
  });
});
console.log("   swept " + sweeps + " size x view x status x path combinations");
resetAll();
/* the loading state, the empty states, the popovers and all three dialogs */
W("purF").purfLoading = true;
A.noEmDash(R("purF"), "the loading state");
resetAll();
A.noEmDash(R("purF4"), "the empty state");
["status", "path", "dept", "year"].forEach(function (t) {
  env.call("purFOpenPop", t, "purF2", null);
  A.noEmDash(popHTML(), "the " + t + " popover");
  env.call("purFClosePop");
});
resetAll();
["detail", "approvals", "attachments", "note", "payment"].forEach(function (tab) {
  ["PO-2893", "PO-2872", "PO-2864", "PO-2902", "PO-2891"].forEach(function (ref) {
    env.ctx.PURF_MODAL = { id: "purF2", ref: ref, tab: tab };
    A.noEmDash(env.call("purFModalHTML"), "the " + tab + " tab on " + ref);
  });
});
env.ctx.PURF_MODAL = null;
["Approved", "Rejected", "Pending", "Closed", "Voided"].forEach(function (to) {
  env.ctx.PURF_MOVE = { id: "purF", ref: "PO-2864", to: to, from: "Approved", note: "" };
  A.noEmDash(env.call("purFMoveHTML"), "the move confirmation to " + to);
});
env.ctx.PURF_MOVE = null;
["hold", "unhold"].forEach(function (mode) {
  env.ctx.PURF_HOLD = { id: "purF", ref: "PO-2891", mode: mode, note: "" };
  A.noEmDash(env.call("purFHoldHTML"), "the " + mode + " confirmation");
});
env.ctx.PURF_HOLD = null;
A.noEmDash(env.get("PURF_ABOUT"), "the about copy");
A.noEmDash(cssRegion, "the CSS block");
A.noEmDash(block, "the whole code block, comments included");
resetAll();

/* =====================================================================
   13. STYLING, SEMANTICS AND MONEY
   ===================================================================== */
console.log("\n-- 13. styling, semantics and money --");
/* every class our markup uses must actually be declared somewhere */
A.cssDeclares(shell.css, [
  "purf-root", "purf-w", "purf-hd", "purf-chiprow", "purf-chip", "purf-ovchip", "purf-vtoggle",
  "purf-numwrap", "purf-ctx", "purf-body", "purf-skel", "purf-skel-rows", "purf-sk-line", "purf-skel-cap",
  "purf-board", "purf-col", "purf-colb", "purf-dragover", "purf-card", "purf-card-age", "purf-age-hot",
  "purf-card-hold", "purf-card-paid", "purf-card-rej", "purf-card-ok", "purf-holdflag",
  "purf-paybadge", "purf-pay-unpaid", "purf-pay-paid", "purf-more",
  "purf-finish", "purf-fin-half", "purf-fin-close", "purf-fin-void", "purf-fin-t", "purf-fin-s",
  "purf-tblwrap", "purf-tscroll", "purf-tbl", "purf-trow", "purf-c-num", "purf-c-dept", "purf-c-st",
  "purf-c-date", "purf-c-go", "purf-chip-st", "purf-ovflag", "purf-ovrow", "purf-rowclick",
  "purf-none", "purf-tnote", "purf-glance", "purf-gcard", "purf-gnum", "purf-glbl",
  "purf-pop", "purf-popnote", "purf-modal", "purf-confirm", "purf-m-hd", "purf-m-sub", "purf-m-bd",
  "purf-m-ft", "purf-m-note", "purf-mtabs", "purf-vhd", "purf-vname", "purf-vmeta", "purf-vship",
  "purf-hdgrid", "purf-fld", "purf-flbl", "purf-fin", "purf-fin-sm", "purf-fro", "purf-fnote",
  "purf-fpath", "purf-pathbtn", "purf-lines", "purf-lrow", "purf-l-per", "purf-l-desc", "purf-l-proj",
  "purf-dist", "purf-distf", "purf-distline", "purf-totrow", "purf-tot-tot", "purf-holdbar",
  "purf-apgrid", "purf-aprow", "purf-a-b", "purf-a-r", "purf-a-u", "purf-box",
  "purf-seq", "purf-seqrow", "purf-seqn", "purf-seqnm", "purf-seqend",
  "purf-mnote", "purf-disputed", "purf-mact", "purf-mact-l", "purf-note",
  "purf-actlbl", "purf-actrow", "purf-actmain", "purf-actnote",
  "purf-invtbl", "purf-irow", "purf-i-n", "purf-i-c", "purf-i-s", "purf-idist",
  "purf-submitrow", "purf-submitlbl", "purf-paidnote"
], "our own purf classes");
/* and every shell component we ride on must exist, or we ship native chrome */
A.cssDeclares(shell.css, [
  "pur-kanban", "pur-kcol", "pur-kcol-h", "pur-kcol-t", "pur-kcol-n", "pur-kcol-b",
  "pur-kcard", "pur-kc-top", "pur-kc-num", "pur-kc-amt", "pur-kc-vendor", "pur-kempty",
  "pur-tabs", "pur-tab",
  "dep-hd", "dep-hd-top", "dep-hd-num", "dep-hd-kpigrp", "dep-hd-toggle", "dep-total",
  "metric-value", "bank-pill", "bank-caption", "filter-chip", "fc-label", "vtoggle", "vt",
  "wt-row", "wt-head", "lr-main", "wt-c2", "scroll", "kpi-row", "kpi-num", "gl-sub",
  "state", "state-title", "state-sub", "modal", "modal-backdrop", "modal-h", "modal-title",
  "modal-b", "modal-f", "btn", "iconbtn", "pop", "mi", "cap", "mi-nm", "mi-gap", "mi-ic",
  "mi-note", "dd-search", "dd-input", "menu-scroll", "sk", "bgt-spin", "sr-only"
], "Jo's shell components we reuse");
/* the chip fill and glyph convention, restated for our attribute */
A.contains(cssRegion, ".purf-root .purf-chip,.purf-root .purf-ovchip{background:var(--wn-200)", "our chips get the shell's secondary fill");
A.contains(cssRegion, ".purf-root .purf-chip::before{font-family:'Material Symbols Rounded';content:'filter_list'", "our dropdown chips get the leading filter glyph");
A.ok(!/\.purf-ovchip::before/.test(cssRegion), "the boolean overdue toggle does not get a dropdown glyph on top of its own icon");
/* real table semantics survive the swap to div rows */
const tSem = R("purF2");
A.contains(tSem, 'role="table"', "the table is a table to a screen reader");
A.contains(tSem, 'role="row"', "rows are rows");
A.contains(tSem, 'role="columnheader"', "headers are column headers");
A.contains(tSem, 'role="cell"', "cells are cells");
A.contains(tSem, 'aria-colcount="7"', "the table declares its column count");
A.contains(tSem, "sr-only", "each row carries a screen-reader summary");
A.contains(tSem, "aria-label=\"Purchase orders, oldest first\"", "the table names its own order");
A.absent(tSem, "<select", "no native select reaches the rendered output");
A.absent(R("purF"), "<select", "no native select on the board either");
A.absent(R("purF2"), "onclick=", "no inline handler reaches the rendered output");
/* values are in the DOM as text, never colour or hover only */
A.contains(R("purF_x"), "Payment: not paid", "an unpaid approved card carries its badge as text");
A.contains(R("purF_x"), "Payment: paid", "a paid card carries its badge as text");
A.contains(R("purF_k"), ">Pending</span>", "the Glance cards name their state in text");
A.contains(R("purF_k"), ">Approved</span>", "the Glance cards name Approved in text");
A.contains(R("purF_k"), ">Rejected</span>", "the Glance cards name Rejected in text");
A.contains(R("purF_k"), "outstanding on pending requests", "the Glance states what the money figure is");
A.contains(R("purF"), "waiting ", "cards carry the item age as text");
A.contains(R("purF_x"), "issued ", "an approved card reads issued N days ago, not waiting");
/* money keeps two decimals, per the Step 4 rounding rule */
A.eq(env.call("purFMoney", 87.5), "$87.50", "purFMoney keeps two decimals");
A.eq(env.call("purFMoney", 76.25), "$76.25", "purFMoney keeps the cents");
A.eq(env.call("purFMoney", 0), "$0.00", "purFMoney renders zero with two decimals");
A.eq(env.call("purFMoney", 12400), "$12,400.00", "purFMoney groups thousands");
A.contains(R("purF2"), "$76.25", "the table renders a real cent value, not a rounded one");
/* item age maths against the fixed anchor */
A.eq(env.call("purFAge", po("PO-2885")), 75, "PO-2885 has waited 75 days as of the anchor date");
A.eq(env.call("purFAgeLabel", po("PO-2885")), "waiting 75 days", "a pending request reads waiting N days");
A.eq(env.call("purFAgeLabel", po("PO-2864")), "issued 102 days ago", "an approved order reads issued N days ago");
A.eq(env.call("purFOverdue", po("PO-2885")), true, "PO-2885 is overdue");
A.eq(env.call("purFOverdue", po("PO-2901")), false, "PO-2901 is not overdue");
A.eq(env.call("purFOverdue", po("PO-2610")), false, "an approved order is never flagged overdue");
/* the about copy is wired and describes the real behaviour */
A.contains(env.get("PURF_ABOUT"), "approval board", "the about copy describes the board");
A.contains(env.get("PURF_ABOUT"), "no dashboard API yet", "the about copy is honest about the missing write APIs");

console.log("");
process.exit(A.report());
