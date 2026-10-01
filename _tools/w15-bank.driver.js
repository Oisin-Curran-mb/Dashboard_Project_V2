/* =====================================================================
   w15-bank.driver.js , W15 Bank Balances, the FINAL block (Jo's, kept as she
   built it with its shell hooks; owner ruling 2026-09-27, docs/decisions/W15.md).

   Same hosting idiom as w14-tasks.driver.js: run the whole shell, then prove
   that only her block is left (nothing of ours survives), that the three
   sizes render with the titles the owner asked for, and that the Glance is
   the owner's layout: account chip, compact amount beside a twelve-month
   sparkline, pills in one row underneath, delta versus a year ago.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const META = H.meta("W15");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final, Jo's)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure: ours is gone, hers is whole ------------------ */
["bkFContent(", "bkFGlance(", 'kind:"bank-mb"', "data-bkf", "BKF_"].forEach(function (n) { A.absent(S, n, "nothing of ours survives: " + n); });
A.absent(shell.css, ".bkf-", "no .bkf- rule survives");
["function bankContent(", "function bankGlance(", "function bankSpark(", "function bankHistory(", "function bankMonthLabels(", 'a==="bank-acct"', 'a==="bank-drill"', "function bankDrillModalHTML("].forEach(function (n) { A.contains(S, n, "her block holds " + n); });
A.absent(S, "function bankBeginTotal(", "dead bankBeginTotal removed");
A.contains(S, 'WIDGETS.register("bank",{content:bankContent,about:function(w){return {h:w.title,b:BANK_ABOUT};}});', "her content and about text are registered under kind bank (so the viewer lists W15)"); A.absent(S, 'if(w.kind==="bank")return {h:w.title', "aboutOf no longer special-cases bank"); A.absent(S, 'if(w.kind==="bank")return bankContent(w);', "the old contentHTML hook is gone");
A.contains(shell.css, ".bank-hb-zero{position:absolute;top:-2px;bottom:-2px;width:1px;background:var(--wn-400);}", "zero axis uses a declared token (was the undeclared --wn-500)");
A.absent(shell.css, "--wn-500", "no reference to the undeclared --wn-500");
A.contains(shell.css, ".bank-glrow{flex-direction:column;gap:var(--space-xtight);padding:var(--padding-tight) var(--padding-tight) calc(var(--padding-tight) + var(--space-xtight));}", "Glance row uses the xtight spacing token");
A.contains(shell.css, "--space-xtight:4px;", "the xtight token is declared");
A.eq((raw.match(/kind:"bank"/g) || []).length, 3, "exactly three registry rows");
A.eq((raw.match(/title:"Bank Balances",\s*kind:"bank"|title:"Bank Balances",kind:"bank"/g) || []).length, 3, "all three titled Bank Balances");
A.absent(raw, 'id:"bank2"', "fixture bank2 gone"); A.absent(raw, 'id:"bank3"', "fixture bank3 gone");

/* ---------- 2. host the shell ----------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},getModal:function(){return modal;},setModal:function(m){modal=m;}," +
  "bankHistory:bankHistory,bankMonthLabels:bankMonthLabels,bankTotal:bankTotal," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX;
A.ok(EX && EX.WIDGETS, "shell loaded; exports reachable"); /* the shim has no app root, so the first render() throws on innerHTML as it does for W14; not a widget defect */
EX.stubRender();

/* ---------- 3. the three sizes render ---------------------------------- */
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "bank"; });
A.eq(rows.length, 3, "three bank rows on the main dashboard");
A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "Glance, Explore and Detail");
rows.forEach(function (w) { w.bkloading = false; const html = EX.contentHTML(w); A.ok(html && html.length > 400, w.id + " (" + w.size + ") renders (" + (html || "").length + " bytes)"); A.noEmDash(html, w.id); });
const kpi = rows.filter(function (w) { return w.size === "kpi"; })[0], wide = rows.filter(function (w) { return w.size === "wide"; })[0], xw = rows.filter(function (w) { return w.size === "xwide"; })[0];

/* ---------- 4. Glance: the owner's layout ------------------------------- */
const g = EX.contentHTML(kpi);
A.contains(g, 'class="kpi-row bank-glrow"', "Glance row"); A.contains(g, 'class="bank-gl-top"', "account chip line first");
A.contains(g, 'class="bank-gl-mid"', "amount and sparkline share the middle line"); A.ok(g.indexOf("bank-gl-mid") < g.indexOf("bank-spark") && g.indexOf("bank-spark") < g.indexOf("bank-gl-pills"), "chip, then amount + sparkline, then pills");
A.contains(g, 'class="gl-sub bank-gl-pills"', "pills in one row underneath"); A.contains(g, 'data-action="bank-drill"', "overdrawn drill pill"); A.contains(g, 'class="delta-pill', "delta pill");
const total = EX.bankTotal(kpi); A.contains(g, 'title="' + "$" + total.toLocaleString("en-US") + '"', "compact amount carries the exact total as title");
const series = (g.match(/data-series="([^"]+)"/) || [])[1], labs = (g.match(/data-labels="([^"]+)"/) || [])[1];
A.ok(!!series && series.split(",").length === 12, "sparkline has twelve points"); A.eq(labs && labs.split("|")[0], "Sep 2025", "first month Sep 2025"); A.eq(labs && labs.split("|")[11], "Aug 2026", "last month Aug 2026");
A.eq(series && +series.split(",")[11], total, "last point equals the total");
const hist = EX.bankHistory(kpi); A.eq(hist.length, 12, "bankHistory: twelve months"); A.eq(hist[11], total, "bankHistory ends at the total");
A.contains(g, 'data-tip="Balance in Sep 2025 ', "delta tooltip names the month a year ago"); A.contains(g, ">vs Sep 2025</span>", "delta label vs Sep 2025");
A.contains(g, "Month-end balance of all bank accounts over the last twelve months", "sparkline accessible label"); A.absent(g, "Total deposits", "no Deposits label leaks in");

/* ---------- 5. Explore and Detail keep her controls -------------------- */
const e = EX.contentHTML(wide), d = EX.contentHTML(xw);
["bank-acct", "bank-overdrawn", "bank-sort", "bank-more"].forEach(function (a) { A.contains(e, 'data-action="' + a + '"', "Explore control " + a); });
A.contains(e, 'data-action="bank-view"', "Explore Table / Bars toggle"); A.absent(d, 'data-action="bank-view"', "Detail shows both views, no toggle");
["bank-acct", "bank-overdrawn", "bank-sort", "bank-more"].forEach(function (a) { A.contains(d, 'data-action="' + a + '"', "Detail control " + a); });

process.exit(A.report());
