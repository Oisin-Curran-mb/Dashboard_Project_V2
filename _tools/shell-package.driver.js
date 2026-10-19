"use strict";
/* Shell: the data package layer (16 Oct 2026).

   Every widget renders from an API-shaped envelope {state, reason, data} built by
   its own <prefix>Package(w). This driver proves the layer as a whole:
     1. every mapped widget has a builder and it returns a well-formed envelope
        for every review-selector option;
     2. the Default package hands back the block's fixtures BY REFERENCE, which is
        what keeps the default face byte-identical and in-place mutation working;
     3. the selector no longer touches a row's lifecycle state, so Refresh and
        Retry show their skeleton again;
     4. the (state, reason) each option maps to, per widget, and the title the
        card then shows;
     5. the shared helpers stand alone (the isolated drivers run them first with
        nothing else). */
const path = require("path");
const H = require(path.join(__dirname, "jo-port-driver.js"));
const A = new H.Assert("shell-package");
const shell = H.loadShell();
const S = shell.script;

/* ---------- 1 + 2 + 4: host the whole shell ----------------------------- */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,find:find,dashboards:dashboards,refresh:refresh," +
  "fkpPackage:fkpPackage,fkpBandHTML:fkpBandHTML,pkgOption:pkgOption," +
  "builders:{budget:bgtOPackage,pension:penOPackage,payroll:prOPackage,remittance:remOPackage,receivables:arOPackage,insurance:insOPackage,deposits:depOPackage,mystatus:mysPackage,pto:ptoFPackage,loans:lonFPackage,fixedassets:faFPackage,purchasing:purFPackage,tasks:mctPackage,bank:bankPackage,payables:apPackage,gifts:gpFPackage}," +
  "fixtures:{budget:BGT_REPORTS,pension:PENO_APPTS,payroll:PRO_DISTS,remittance:REMO_ACTIVITIES,receivables:ARO_INV,insurance:INSO_PLANS,deposits:DEPO_DEP,mystatus:MYS_QUERIES,pto:PTOF_GROUPS,loans:LONF_LOANS,fixedassets:FAF_ASSETS,purchasing:PURF_POS,tasks:MCT_TASKS,bank:BANK_ACCOUNTS,payables:AP_INVOICES,gifts:GPF_PURPOSES}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -H.TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX;
A.ok(EX && EX.builders, "shell loaded; package builders reachable");
EX.stubRender();

const STATES = ["ok", "no-data", "not-configured", "error"];
const OPTIONS = ["default", "none", "notconfigured", "small", "extreme"];
const KINDS = Object.keys(EX.builders);
A.eq(KINDS.length, 16, "sixteen widget kinds carry a package builder (Pending Actions and Alerts are out of scope)");
const rows = EX.dashboards[0].widgets;
function setOpt(o) { env.ctx.location.hash = o === "default" ? "" : "#ds=" + o; }

KINDS.forEach(function (kind) {
  const b = EX.builders[kind];
  A.eq(typeof b, "function", kind + ": builder is a function");
  const row = rows.filter(function (w) { return w.kind === kind; })[0];
  A.ok(!!row, kind + ": has a live registry row");
  OPTIONS.forEach(function (o) {
    setOpt(o);
    const p = b(row);
    A.ok(p && STATES.indexOf(p.state) > -1, kind + " / " + o + ": state is one of " + STATES.join("|") + " (got " + (p && p.state) + ")");
    A.eq(typeof (p && p.reason), "string", kind + " / " + o + ": reason is a string");
    A.ok(p && typeof p.data === "object", kind + " / " + o + ": data is an object or null");
    if (o === "small" || o === "extreme") A.eq(p.state, "ok", kind + " / " + o + ": a generated set is an ok package");
  });
  setOpt("default");
  const d = b(row);
  A.eq(d.state, "ok", kind + ": Default is an ok package");
  A.eq(d.reason, "", kind + ": Default carries no reason");
  const fx = EX.fixtures[kind];
  const members = Object.keys(d.data || {}).map(function (k) { return d.data[k]; });
  A.ok(members.indexOf(fx) > -1, kind + ": Default hands back the block's fixture BY REFERENCE (not a copy)");
});
A.eq(EX.pkgOption(), "default", "pkgOption() reads Default with no hash");
setOpt("none"); A.eq(EX.pkgOption(), "none", "pkgOption() reads the ds= option from the hash");

/* ---------- 3: the selector leaves lifecycle state alone ---------------- */
setOpt("none");
rows.forEach(function (w) { A.eq(w.state, "ready", w.id + ": state stays \"ready\" under #ds=none (no dsApply)"); });
A.absent(S, "function dsApply(", "dsApply is gone");
A.absent(S, "DATA_STATE_MAP", "DATA_STATE_MAP is gone");
const renderSrc = (/  function render\(\)\{[^\r\n]*/.exec(S) || [""])[0];
A.ok(renderSrc.length > 100, "render() located");
A.absent(renderSrc, "dsApply", "render() no longer applies the selector to rows");
const first = rows[0];
EX.refresh(first.id);
A.eq(first.state, "loading", "refresh(id) sets loading while the selector is on No data");
A.contains(EX.contentHTML(first), 'class="skeleton"', "and the card shows its skeleton (Refresh and Retry work again)");
first.state = "ready";

/* ---------- 4: the mapping table, and what the card then says ----------- */
/* kind -> {none:[state,reason,title], notconfigured:[state,reason,title]} ; title is a string the Detail-size
   card must contain ("" = no single title to assert, the face carries the state in its figures). */
const MAP = {
  budget:      { none: ["no-data", "no-actuals", ""],                         notconfigured: ["not-configured", "no-budget", "budget set up"] },
  pension:     { none: ["no-data", "no-active-appointments", "No active pension appointments"], notconfigured: ["not-configured", "no-plans", "No active pension appointments"] },
  payroll:     { none: ["no-data", "no-checks-in-window", "No payroll runs in this range"], notconfigured: ["not-configured", "no-distributions", "Not designed yet"] },
  remittance:  { none: ["no-data", "no-term-covers-date", "No pledge term covers this date"], notconfigured: ["not-configured", "no-activities", "No remittance pledges yet"] },
  receivables: { none: ["no-data", "all-settled", "Nothing outstanding"],      notconfigured: ["not-configured", "no-revenue-centres", "Not designed yet"] },
  insurance:   { none: ["no-data", "no-enrolments", ""],                      notconfigured: ["not-configured", "no-plans", "No insurance plans yet"] },
  deposits:    { none: ["no-data", "no-active-accounts", "No deposit accounts"], notconfigured: ["not-configured", "no-account-types", "No deposit accounts"] },
  mystatus:    { none: ["no-data", "every-query-zero", ""],                   notconfigured: ["not-configured", "no-queries-chosen", "No records to display"] },
  pto:         { none: ["no-data", "nothing-pending", "No time off scheduled"], notconfigured: ["not-configured", "nothing-ever-scheduled", "No time off scheduled"] },
  loans:       { none: ["no-data", "none-with-balance", "Nothing outstanding"], notconfigured: ["not-configured", "no-loan-types-or-loans", "Not designed yet"] },
  fixedassets: { none: ["no-data", "nothing-to-chart-for-measure", "No fixed assets yet"], notconfigured: ["not-configured", "no-assets", "No fixed assets yet"] },
  purchasing:  { none: ["no-data", "nothing-matches-status", "Nothing needs your approval"], notconfigured: ["not-configured", "not-on-any-path", "not on an approval path yet"] },
  tasks:       { none: ["no-data", "nothing-recent", "Not designed yet"],     notconfigured: ["not-configured", "role-has-no-tasks", "Not designed yet"] },
  bank:        { none: ["no-data", "all-zero-balances", "No bank accounts"],   notconfigured: ["not-configured", "no-active-bank-accounts", "No bank accounts"] },
  payables:    { none: ["no-data", "nothing-unpaid", "Nothing outstanding"],   notconfigured: ["not-configured", "no-payables-bank-account", "Not designed yet"] },
  gifts:       { none: ["no-data", "no-active-pledges", "No gift or pledge purposes yet"], notconfigured: ["not-configured", "no-purposes", "No gift or pledge purposes yet"] }
};
Object.keys(MAP).forEach(function (kind) {
  const row = rows.filter(function (w) { return w.kind === kind && w.size !== "kpi"; })[0] || rows.filter(function (w) { return w.kind === kind; })[0];
  ["none", "notconfigured"].forEach(function (o) {
    setOpt(o);
    const want = MAP[kind][o], p = EX.builders[kind](row);
    A.eq(p.state + " / " + p.reason, want[0] + " / " + want[1], kind + " / " + o + ": maps to " + want[0] + " / " + want[1]);
    const html = EX.contentHTML(row);
    A.ok(typeof html === "string" && html.length > 0, kind + " / " + o + ": renders");
    if (want[2]) A.contains(html, want[2], kind + " / " + o + ": the card says \"" + want[2] + "\"");
    A.noEmDash(html, kind + " / " + o + " card");
  });
});
setOpt("notconfigured");
A.contains(EX.fkpBandHTML(), "Not designed yet", "band / notconfigured: the placeholder stands in for the tiles");
A.eq(EX.fkpPackage().reason, "no-fiscal-year", "band / notconfigured: reason no-fiscal-year");
setOpt("none");
A.eq(EX.fkpPackage().state, "no-data", "band / none: no-data (every tile at zero)");
setOpt("default");
A.eq(EX.fkpPackage().state, "ok", "band / default: ok");

/* ---------- 5: the shared helpers stand alone -------------------------- */
const vm = require("vm");
const bare = vm.createContext({ ICON: function (n) { return "<i>" + n + "</i>"; } });
vm.runInContext(H.sharedPackage(), bare, { filename: "shared-package.js" });
["pkg", "pkgOption", "pkgGen", "pkgStateHTML", "pkgPlaceholderHTML"].forEach(function (f) { A.eq(typeof bare[f], "function", "shared region alone defines " + f); });
A.eq(bare.pkgOption(), "default", "pkgOption() is \"default\" without the data-states region");
A.eq(bare.pkgGen("small", "bank"), null, "pkgGen() is null without the data-states region");
const e = bare.pkg("no-data", "x", { a: 1 });
A.eq(e.state + "|" + e.reason + "|" + e.data.a, "no-data|x|1", "pkg() builds the envelope");
A.eq(bare.pkg().state + "|" + bare.pkg().reason + "|" + bare.pkg().data, "ok||null", "pkg() defaults: ok, no reason, null data");
A.eq(bare.pkgStateHTML({ id: "x" }, { title: "T" }), '<div class="state" data-kind="empty"><i>inbox</i><div class="state-title">T</div></div>', "pkgStateHTML() is the shell's empty-block shape");
A.contains(bare.pkgPlaceholderHTML({ id: "x", title: "Widget (Detail)" }, { state: "not-configured", reason: "r" }), "Widget: not-configured / r", "pkgPlaceholderHTML() names the widget, state and reason");

process.exit(A.report());
