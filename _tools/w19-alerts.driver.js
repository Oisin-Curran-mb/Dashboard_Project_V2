/* =====================================================================
   w19-alerts.driver.js , W19 Alerts & Actions, ported 2026-10-02 from
   Aditya's client-approved Variation B4 (Aditya KPI branch,
   Dashboard_Project/Aditya_Widget_Design/Demo V2.html, kind "alerts-b4").

   Proves: one CSS + one JS region before the registry; registered as kind
   "alerts" through WIDGETS.register; Explore and Detail render (no Glance);
   the All | Critical | Warning tabs, the single-open accordion and every
   item button work through the registration; the data matches the source
   (6 categories, 15 items, 4 critical / 11 warning); the two source crashes
   (secondary-only config, Purchase Order Queue configs) no longer throw;
   no raw colours are left in the region.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W19");
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W19 Alerts & Actions V2 CSS ===== */", CSS_END = "/* ===== end W19 Alerts & Actions V2 CSS ===== */";
const JS_START = "/* ===== W19 Alerts & Actions V2 ===== */", JS_END = "/* ===== end W19 Alerts & Actions V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 44)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 4000, "CSS region has substance (" + css.length + " bytes)");
A.ok(js.length > 10000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("alerts",{', "registers itself as kind alerts");
["var ALO_CATS=", "var ALO_ITEM_MODALS=", "function aloContent(", "function aloOpenModal(", "function aloHandle("].forEach(function (n) { A.contains(js, n, "block holds " + n); });
A.absent(S.replace(js, ""), "ALO_CATS", "no W19 code outside the block");
A.absent(H.code(S), 'kind:"alerts-b4"', "the source's variant kind is not carried over");
["alb2-", "alb3-", ".alb-", "al-sev-group"].forEach(function (n) { A.absent(css, n, "other variants not carried over: " + n); });
A.eq((H.code(css).match(/#[0-9a-fA-F]{3,6}\b|rgba?\(/g) || []).length, 0, "no raw colours in the CSS region");
A.eq((H.code(js).match(/window\.alert\(|[^.\w]alert\(/g) || []).length, 0, "no window.alert placeholders");
A.noEmDash(H.code(js), "W19 code and copy (the source's em dashes are replaced)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,aboutOf:aboutOf,find:find,dashboards:dashboards,cats:ALO_CATS,cfgs:ALO_ITEM_MODALS,modalHTML:aloModalHTML," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded"); EX.stubRender();
const reg = EX.WIDGETS.kinds.alerts; A.ok(!!reg, "WIDGETS.kinds.alerts is registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(/accounting modules/.test((EX.aboutOf({ kind: "alerts", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");

/* ---------- 3. data matches the source -------------------------------- */
A.eq(EX.cats.length, 6, "6 alert categories");
const nItems = EX.cats.reduce(function (s, c) { return s + c.items.length; }, 0);
A.eq(nItems, 15, "15 items in all");
A.eq(EX.cats.filter(function (c) { return c.sev === "err"; }).reduce(function (s, c) { return s + c.items.length; }, 0), 4, "4 critical items");
A.eq(EX.cats.filter(function (c) { return c.sev === "warn"; }).reduce(function (s, c) { return s + c.items.length; }, 0), 11, "11 warning items");
A.contains(JSON.stringify(EX.cats), "Purchase Order Queue", "the Purchase Order Queue rename is carried over");

/* ---------- 4. render + behaviour -------------------------------------- */
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "alerts"; });
A.eq(rows.length, 2, "two registry rows (Explore and Detail)");
rows.forEach(function (w) { A.eq(JSON.stringify(w.tiers), '["wide","xwide"]', w.id + ": no Glance size, as in the source"); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0], wx = rows.filter(function (x) { return x.size === "xwide"; })[0];
function T(attrs) { return { getAttribute: function (k) { return (attrs || {})[k] == null ? null : String(attrs[k]); }, closest: function () { return null; } }; }
let h = EX.contentHTML(w);
A.contains(h, "alb4-root", "Explore renders the widget");
A.contains(EX.contentHTML(wx), "alb4-root", "Detail renders the widget");
A.ok(/All <span class="alb4-badge[^"]*">15</.test(h), "All tab counts 15");
A.ok(/Critical <span class="alb4-badge[^"]*">4</.test(h), "Critical tab counts 4");
A.ok(/Warning <span class="alb4-badge[^"]*">11</.test(h), "Warning tab counts 11");
A.eq((h.match(/class="al-cat /g) || []).length, 6, "All shows the 6 categories");
A.eq((h.match(/class="al-body"/g) || []).length, 6, "every category starts open, as in B4");
A.eq(EX.WIDGETS.click("alO-tab", w.id, T({ "data-tab": "err" }), {}), true, "Critical tab handled");
h = EX.contentHTML(w); A.eq((h.match(/class="al-cat /g) || []).length, 2, "Critical shows the 2 critical categories");
A.eq(EX.WIDGETS.click("alO-tab", w.id, T({ "data-tab": "warn" }), {}), true, "Warning tab handled");
h = EX.contentHTML(w); A.eq((h.match(/class="al-cat /g) || []).length, 4, "Warning shows the 4 warning categories");
EX.WIDGETS.click("alO-tab", w.id, T({ "data-tab": "all" }), {});
A.eq(EX.WIDGETS.click("alO-toggle", w.id, T({ "data-cat": "al-cat-1" }), {}), true, "category toggle handled");
h = EX.contentHTML(w); A.eq((h.match(/class="al-body"/g) || []).length, 5, "closing one category leaves the rest open");
EX.WIDGETS.click("alO-toggle", w.id, T({ "data-cat": "al-cat-1" }), {});
h = EX.contentHTML(w); A.eq((h.match(/class="al-body"/g) || []).length, 1, "opening one closes the others (single-open, as in the source)");
A.contains(h, "Restricted Fund Compliance Breach", "and it is the one opened");
A.ok(/data-action="alO-(item|payment|recon|ar|budget)"/.test(h), "items carry their action buttons (item pop-up, or one of the 7 Oct destination screens)");
/* every item's pop-up opens without throwing, including the two source crash cases */
let threw = 0;
EX.cats.forEach(function (c) { c.items.forEach(function (lbl, i) { try { const mh = EX.modalHTML(c.sev, c.title, lbl, EX.cfgs[c.id + ":" + i] || null); if (!/al-modal/.test(mh)) threw++; } catch (e) { threw++; if (threw === 1) console.log("first error:", e && e.message); } }); });
A.eq(threw, 0, "every item's pop-up builds (secondary-only and Purchase Order Queue configs included)");
A.contains(EX.modalHTML("warn", "Purchase Order Queue", "x", EX.cfgs["al-cat-5:0"]), "Approval Trail", "Purchase Order Queue opens the approval pop-up");
A.contains(EX.modalHTML("err", "Restricted Fund", "x", EX.cfgs["al-cat-1:0"]), "Review Fund", "a secondary-only config gets its own button label");
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");

process.exit(A.report());
