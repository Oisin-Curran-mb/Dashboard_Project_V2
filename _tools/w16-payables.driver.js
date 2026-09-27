/* =====================================================================
   w16-payables.driver.js , W16 Accounts Payable By Due Date, the FINAL block
   (Jo's, kept with its shell hooks; owner ruling 2026-09-27, docs/decisions/W16.md).

   Same hosting idiom as w15-bank.driver.js: run the whole shell, prove only
   her block is left, that the three sizes render with the owner's titles,
   that her controls are intact, and that the registration is the only
   content dispatch.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const A = new H.Assert("W16 Accounts Payable By Due Date (final, Jo's)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure ------------------------------------------------ */
["apFContent(", 'kind:"payables-mb"', "data-apf", "APF_", "apf-root"].forEach(function (n) { A.absent(S, n, "nothing of ours survives: " + n); });
A.absent(shell.css, ".apf-", "no .apf- rule survives");
["function apContent(", "function apHandleClick(", 'a==="ap-due"', 'a==="ap-open"', "function apPopContent("].forEach(function (n) { A.contains(S, n, "her block holds " + n); });
A.contains(S, 'WIDGETS.register("payables",{content:apContent});', "her content is registered under kind payables");
A.absent(S.replace(//*[sS]*?*//g, ""), '    if(w.kind==="payables")return apContent(w);', "the old contentHTML hook is gone (her banner comment still quotes it)");
A.absent(S, 'if(w.kind==="payables-mb")', "no payables-mb branch anywhere");
A.eq((raw.match(/title:"[^"]*",kind:"payables",/g) || []).length, 3, "exactly three registry rows (her banner comment also says kind:payables)");
A.eq((raw.match(/title:"Accounts Payable By Due Date",kind:"payables"/g) || []).length, 3, "all three titled Accounts Payable By Due Date");
["ap2", "ap3", "ap4"].forEach(function (id) { A.absent(raw, 'id:"' + id + '"', "fixture " + id + " gone"); });

/* ---------- 2. host the shell ------------------------------------------ */
const TAIL = "\r\n  render();\r\n})();\r\n";
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},getModal:function(){return modal;},setModal:function(m){modal=m;}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: {
  __EX: null, Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error,
  encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
  setInterval: function () { return 1; }, clearInterval: function () {},
  navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" }, alert: function () {},
  performance: { now: function () { return 0; } },
  localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
  getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; } } });
const EX = env.ctx.__EX;
A.ok(EX && EX.WIDGETS, "shell loaded; exports reachable");
EX.stubRender();
A.ok(!!EX.WIDGETS.kinds.payables, "WIDGETS.kinds.payables is registered");

/* ---------- 3. the three sizes render ------------------------------------ */
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "payables"; });
A.eq(rows.length, 3, "three payables rows on the main dashboard");
A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "Glance, Explore and Detail");
rows.forEach(function (w) { w.aploading = false; const html = EX.contentHTML(w); A.ok(html && html.length > 400, w.id + " (" + w.size + ") renders (" + (html || "").length + " bytes)"); A.noEmDash(html, w.id); });
const wide = rows.filter(function (w) { return w.size === "wide"; })[0], xw = rows.filter(function (w) { return w.size === "xwide"; })[0];

/* ---------- 4. her controls are intact ---------------------------------- */
const e = EX.contentHTML(wide), d = EX.contentHTML(xw);
A.contains(e, 'data-action="ap-due"', "Explore: due-date chip"); A.contains(d, 'data-action="ap-due"', "Detail: due-date chip");
EX.setPop({ type: "ap-due", id: wide.id });
A.eq(EX.triggerSelector(), '[data-action="ap-due"][data-id="' + wide.id + '"]', "trigger selector for her pop-up");
const pc = EX.popContent(); A.ok(pc && pc.length > 100, "her pop-up content renders through the shell (" + (pc || "").length + " bytes)");
EX.setPop(null);

process.exit(A.report());
