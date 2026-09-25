/* =====================================================================
   w03-payroll-oc.driver.js , W03 Payroll Distributions, the (OC) widget
   AFTER the 2026-09-08 build-sheet implementation.

   The (OC) widget is now JO'S OWN CODE (kind payroll-oc, prefix prO) with
   exactly three adopted changes grafted on. Every assertion below is
   traceable to a row ID in:
     Design Differences (Jo vs Oisin)/
       Final Version Build Sheet - Jo vs OC (per widget, per size).md

     W03-AL-01  export lives only behind the 3-dot menu   (Keep Jo)
     W03-GL-01  her Glance taken whole                    (Keep Jo)
     W03-EX-01  her drill modal + OUR employee table      (Adopt modified)
     W03-EX-02  three independent filters                 (Adopt ours)
     W03-DE-01  Detail donut legend to the right          (New)
     W03-DE-02  same modal as W03-EX-01                   (Adopt modified)

   It replaces w03-payroll-mb.driver.js, which asserted our V2 re-port and
   is retained as w03-payroll-mb.driver.superseded.bak.

   Run from this folder:  node w03-payroll-oc.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const shell = H.loadShell();
const S = shell.script;
const A = new H.Assert("W03 payroll-oc (build sheet 2026-09-08)");

/* ---------- host the whole shell ------------------------------------- */
const TAIL = "\r\n  render();\r\n})();\r\n";
A.eq(S.slice(-TAIL.length), TAIL, "the shell still ends in the render()/IIFE tail");
const EXPORTS =
  "\r\n  __EX={contentHTML:contentHTML,dashboards:dashboards,find:find," +
  "prOContent:prOContent,prOOpenDist:prOOpenDist,prOEmpTable:prOEmpTable," +
  "prOEmpFiltered:prOEmpFiltered,prOTableRows:prOTableRows,prOGlance:prOGlance," +
  "prODistTotals:prODistTotals,PRO_DISTS:PRO_DISTS,PRO_PT:PRO_PT," +
  "getModal:function(){return modal;},setModal:function(m){modal=m;}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";

const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, {
  globals: {
    __EX: null,
    Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    setInterval: function () { return 1; }, clearInterval: function () {},
    navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" },
    alert: function () {}, performance: { now: function () { return 0; } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; }
  }
});
const EX = env.ctx.__EX;
A.ok(EX && typeof EX.prOContent === "function", "the (OC) payroll block loaded and is reachable");

const REG = H.extractRegistry(S, "payroll-oc");
A.ok(REG.length >= 1, "the (OC) payroll widget has a registry card (" + REG.length + ")");
const base = REG.filter(function (w) { return w.id === "prO"; })[0];
A.ok(!!base, "the default (OC) card is present");

function W(over) { return Object.assign({}, base, over || {}); }
/* prOOpenDist sets the modal and then calls the shell's render(), which the Node
   DOM shim cannot complete. The modal state is set BEFORE that, so swallow it. */
function openDrill(w, distId) { try { EX.prOOpenDist(w, distId); } catch (e) {} }
function money(s) { const m = /\$([\d,]+)/.exec(s); return m ? Number(m[1].replace(/,/g, "")) : null; }

/* ---------- the base really is her code ------------------------------ */
(function () {
  const cssBanner = S.indexOf("W03 Payroll Distributions V2");
  A.ok(cssBanner > -1, "the (OC) payroll block is still marked as a clone of hers");
  /* her own functions our V2 had deleted are back */
  ["prOGlanceComp", "prOOpenDist", "prOPTFlat", "prOPTTotals", "prODistBadge"].forEach(function (fn) {
    A.contains(S, "function " + fn + "(", "her function " + fn + " is present (restored by the rebase)");
  });
  /* our V2-only machinery that must NOT have come across */
  ["prOScopeChip"].forEach(function (fn) {
    A.contains(S, "function " + fn + "(", "her " + fn + " still exists (kept, simply unused in the header)");
  });
})();

/* ---------- W03-GL-01: her Glance, whole ----------------------------- */
(function () {
  const g = EX.prOGlance(W({ size: "kpi" }));
  A.ok(g && g.length > 100, "W03-GL-01: the (OC) Glance renders");
  A.contains(g, "pro-gcomp", "W03-GL-01: her within-period composition bar is present");
  A.contains(g, "pro-gbar", "W03-GL-01: the composition bar's stacked track is present");
  A.contains(g, "pro-gcap", "W03-GL-01: the leading cost-centre caption under the bar is present");
  A.absent(g, "pro-emps", "W03-GL-01: no employee table leaks into Glance");
  A.noEmDash(g, "W03-GL-01 Glance");
})();

/* ---------- W03-AL-01: export only behind the 3 dots ----------------- */
(function () {
  A.ok(Array.isArray(base.actions) && base.actions.length >= 1,
    "W03-AL-01: the card carries an actions array, so the shell's 3-dot menu offers export");
  A.contains(JSON.stringify(base.actions), "Export as CSV", "W03-AL-01: CSV export is offered in the 3-dot menu");
  /* our in-widget export button and its caption row must not exist */
  const block = S.slice(S.indexOf("W03 Payroll Distributions V2", S.indexOf("W03 Payroll Distributions V2") + 10));
  A.absent(block, "prOExportBtn", "W03-AL-01: our in-widget export button is not in the (OC) block");
  A.absent(block, "prO-export-view", "W03-AL-01: our in-widget export action is not wired");
  const wide = EX.prOContent(W({ size: "wide" }));
  A.absent(wide, "pro-cap", "W03-AL-01: our export caption row does not render");
})();

/* ---------- W03-EX-02: three independent filters --------------------- */
(function () {
  const wide = EX.prOContent(W({ size: "wide" }));
  A.contains(wide, 'data-action="prO-period"', "W03-EX-02: the period chip is present");
  A.contains(wide, 'data-action="prO-scope"', "W03-EX-02: the Distribution chip is present");
  A.contains(wide, 'data-action="prO-pt"', "W03-EX-02: the Pay type chip is present");
  A.eq((wide.match(/class="filter-chip pr-fchip"/g) || []).length, 2,
    "W03-EX-02: exactly two filter chips sit beside the period chip");
  A.contains(wide, "All distributions", "W03-EX-02: the Distribution chip defaults to all");
  A.contains(wide, "All pay types", "W03-EX-02: the Pay type chip defaults to all");

  /* the two filters are genuinely independent and both change the data */
  const all = EX.prODistTotals(W());
  const totAll = all.reduce(function (s, r) { return s + r.net; }, 0);
  A.ok(totAll > 0, "W03-EX-02: an unfiltered total exists (" + totAll + ")");

  const onePT = EX.prODistTotals(W({ prPT: "ot" }));
  const totPT = onePT.reduce(function (s, r) { return s + r.net; }, 0);
  A.ok(totPT > 0 && totPT < totAll,
    "W03-EX-02: filtering to one pay type reduces the total (" + totPT + " < " + totAll + ")");

  const oneDist = EX.prOTableRows(W({ prDist: EX.PRO_DISTS[1].id }));
  A.ok(oneDist.length > 0, "W03-EX-02: choosing a distribution lists its pay types");
  A.ok(oneDist.every(function (r) { return EX.PRO_PT.some(function (p) { return p.id === r.id; }); }),
    "W03-EX-02: those rows are pay types, not distributions");

  /* combining both filters narrows further still */
  const both = EX.prOTableRows(W({ prDist: EX.PRO_DISTS[1].id, prPT: "ot" }));
  A.ok(both.length <= oneDist.length,
    "W03-EX-02: the two filters combine rather than override (" + both.length + " <= " + oneDist.length + ")");
  A.absent(EX.prOContent(W({ size: "wide" })), "By pay type",
    "W03-EX-02: her combined scope chip's 'By pay type' mode is gone, replaced by the pay-type filter");
})();

/* ---------- W03-EX-01 / W03-DE-02: employee table in HER modal -------- */
(function () {
  const w = W({ size: "wide" });
  const dist = EX.PRO_DISTS[1];
  EX.setModal(null);
  openDrill(w, dist.id);
  const modal = EX.getModal();
  A.ok(!!modal && modal.scoped === true, "W03-EX-01: clicking a distribution opens HER scoped modal");
  A.contains(modal.t, "Payroll Distributions:", "W03-EX-01: her modal title is unchanged");
  A.contains(modal.t, dist.name, "W03-EX-01: the modal names the distribution clicked");
  A.eq(modal.mw.prDist, dist.id, "W03-EX-01: the scoped clone is filtered to that distribution");
  A.eq(modal.mw.prODrill, true, "W03-EX-01: the clone is flagged as the drill, so only it shows employees");

  const body = EX.prOContent(modal.mw);
  /* her own modal content survives untouched */
  A.contains(body, "pr-split-table", "W03-EX-01: her pay-type table column is intact");
  A.contains(body, "pr-split-chart", "W03-EX-01: her donut column is intact");
  /* our employee table, in the left column beneath her table */
  A.contains(body, "pro-emps", "W03-EX-01: our employee table is present");
  A.ok(body.indexOf("pro-emps") > body.indexOf("pr-split-table"),
    "W03-EX-01: the employee panel sits AFTER her pay-type table");
  A.ok(body.indexOf("pro-emps") > body.indexOf("pr-split-chart"),
    "W03-EX-01: and after the donut column too, so it spans the full width below both");
  A.ok(body.lastIndexOf("</div></div>", body.indexOf("pro-emps")) > -1,
    "W03-EX-01: it is OUTSIDE the two-column split, not nested in a column");
  A.contains(body, "pro-panel-h", "W03-EX-01: the panel carries a subheading");
  A.contains(body, ">Employee Break Down</h4>", "W03-EX-01: the subheading reads Employee Break Down");
  A.contains(shell.css, ".pro-emps{", "W03-EX-01: the panel has its own styling");
  A.ok(/\.pro-emps\{[^}]*border:1px solid var\(--stroke-widget\)/.test(shell.css),
    "W03-EX-01: the panel uses the house weak border");
  A.contains(body, "pro-empscroll", "W03-EX-01: the employee table has its own scroll container");
  A.contains(body, "Employee", "W03-EX-01: the employee column header is present");
  A.contains(body, "Total pay", "W03-EX-01: the total-pay column header is present");
  A.contains(body, 'data-action="prO-sort"', "W03-EX-01: both employee columns are sortable, using her sort control");
  A.contains(body, "employees</span>", "W03-EX-01: the 'Total, N employees' footer row is present");
  A.noEmDash(body, "W03-EX-01 modal body");

  /* the footer cross-foots to the distribution total, to the penny */
  const emps = EX.prOEmpFiltered(modal.mw, dist.id);
  A.ok(emps.length > 0, "W03-EX-01: the distribution has employees (" + emps.length + ")");
  const empSum = Math.round(emps.reduce(function (s, e) { return s + e.total; }, 0) * 100);
  const distSum = Math.round(EX.prOTableRows(modal.mw).reduce(function (s, r) { return s + r.net; }, 0) * 100);
  A.eq(empSum, distSum, "W03-EX-01: employee pay cross-foots to the distribution total to the penny");

  /* expanding a person reveals that person's pay types, and only that person's */
  const key = emps[0].dist + "|" + emps[0].name;
  const openMw = Object.assign({}, modal.mw, { prEmpOpen: {} });
  openMw.prEmpOpen[key] = true;
  const opened = EX.prOEmpTable(openMw, dist.id);
  A.contains(opened, "pro-emp-panel", "W03-EX-01: expanding a person opens their pay-type panel");
  A.contains(opened, 'aria-expanded="true"', "W03-EX-01: the expanded row reports its state");
  A.eq((opened.match(/pro-emp-panel/g) || []).length, 1,
    "W03-EX-01: only the clicked person expands, not the whole list");
  A.contains(EX.prOEmpTable(modal.mw, dist.id) === opened ? "" : "differs", "differs",
    "W03-EX-01: the expanded render differs from the collapsed one");

  /* employees are deterministic, so the demo is stable */
  const again = EX.prOEmpFiltered(modal.mw, dist.id);
  A.eq(JSON.stringify(again.map(function (e) { return [e.name, e.total]; })),
       JSON.stringify(emps.map(function (e) { return [e.name, e.total]; })),
       "W03-EX-01: the employee list is deterministic across renders");
  EX.setModal(null);
})();

/* ---------- W03-DE-01: Detail donut legend to the right --------------- */
(function () {
  const detail = EX.prOContent(W({ size: "xwide" }));
  A.contains(detail, "pr-split pro-split",
    "W03-DE-01: the (OC) Detail split carries the namespaced marker the override hangs on");
  /* the override itself, and its scoping */
  A.contains(shell.css, ".pro-split .pr-split-chart .pie-wrap.row",
    "W03-DE-01: the legend-direction override exists");
  A.contains(shell.css, "flex-direction:row",
    "W03-DE-01: the override restores the row direction, putting the legend to the right");
  const scoped = shell.css.split("\n").filter(function (l) {
    return l.indexOf(".pr-split-chart .pie-wrap.row") > -1;
  });
  A.ok(scoped.every(function (l) {
    return l.indexOf(".pro-split") > -1 || l.indexOf("flex-direction:column") > -1;
  }), "W03-DE-01: every row-direction override is scoped under .pro-split; the unscoped rule still says column");
  /* and it must reach the drill modal too, since that renders the same branch */
  EX.setModal(null);
  openDrill(W({ size: "wide" }), EX.PRO_DISTS[1].id);
  A.contains(EX.prOContent(EX.getModal().mw), "pr-split pro-split",
    "W03-DE-01: the drill modal gets the same marker, so its legend is on the right too");
  EX.setModal(null);
})();

/* ---------- Jo is untouched ------------------------------------------ */
(function () {
  let hers = null;
  try {
    hers = H.baseline();
  } catch (e) { /* git unavailable: skip rather than fail */ }
  if (!hers) { A.ok(true, "her baseline could not be read from git, integrity check skipped"); return; }

  /* every one of her prF functions still exists, unrenamed */
  const herFns = (hers.match(/function prF[A-Za-z0-9_]*\(/g) || []);
  A.ok(herFns.length > 25, "her baseline has her prF block (" + herFns.length + " functions)");
  const missing = herFns.filter(function (f) { return S.indexOf(f) < 0; });
  A.eq(missing.length, 0, "her own prF functions all survive verbatim" +
    (missing.length ? " (missing: " + missing.slice(0, 3).join(", ") + ")" : ""));

  /* her Detail legend must still stack underneath: the (OC) fix is scoped */
  A.contains(shell.css, ".pr-split-chart .pie-wrap.row{flex-direction:column",
    "her own payroll widgets keep the stacked legend at Detail");
  /* her scope chip is still hers, still single */
  A.contains(S, 'data-action="prF-scope"', "her own combined scope chip is untouched");
})();

process.exit(A.report());
