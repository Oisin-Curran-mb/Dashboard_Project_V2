/* =====================================================================
   w20-alerts.driver.js , W20 Alerts & Actions.

   Ported 2026-10-02 from Aditya's client-approved Variation B4 (Aditya KPI
   branch, Dashboard_Project/Aditya_Widget_Design/Demo V2.html, kind
   "alerts-b4"). Was w19-alerts.driver.js until 2026-10-16.

   SCRAPPED 2026-10-16, replaced by W19 Pending Actions (owner). Its registry
   rows were commented out before that and stay so: nothing of this widget is
   on screen.

   SO WHY IS THERE STILL A DRIVER? Because the block is NOT deleted, and must
   not be. W19 Pending Actions renders inside this widget's .al-, .alb4- and
   .al2-dp- class families and declares none of them itself. Deleting this
   block would strip the live widget of most of its styling. This driver's
   job is now to keep that dependency honest: it proves the block and its CSS
   are still present and intact, and that the rows are still switched off
   rather than quietly switched back on.

   Changed with the renumber: the four banners carry W20; section 4 asserts
   that NO live registry row has kind "alerts", where it used to assert two;
   and the behaviour it still exercises runs against a widget object built
   here rather than one read from the registry, because there is no longer a
   row to read. Everything the old driver proved about the code itself, it
   still proves.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W20");
const A = new H.Assert(META.label + " (scrapped, code retained)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W20 Alerts & Actions V2 CSS ===== */", CSS_END = "/* ===== end W20 Alerts & Actions V2 CSS ===== */";
const JS_START = "/* ===== W20 Alerts & Actions V2 ===== */", JS_END = "/* ===== end W20 Alerts & Actions V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 44)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 4000, "CSS region has substance (" + css.length + " bytes)");
A.ok(js.length > 10000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("alerts",{', "registers itself as kind alerts");
["var ALO_CATS=", "var ALO_ITEM_MODALS=", "function aloContent(", "function aloOpenModal(", "function aloHandle("].forEach(function (n) { A.contains(js, n, "block holds " + n); });
A.absent(S.replace(js, ""), "ALO_CATS", "no W20 code outside the block");
A.absent(H.code(S), 'kind:"alerts-b4"', "the source's variant kind is not carried over");
["alb2-", "alb3-", ".alb-", "al-sev-group"].forEach(function (n) { A.absent(css, n, "other variants not carried over: " + n); });
A.eq((H.code(css).match(/#[0-9a-fA-F]{3,6}\b|rgba?\(/g) || []).length, 0, "no raw colours in the CSS region");
A.eq((H.code(js).match(/window\.alert\(|[^.\w]alert\(/g) || []).length, 0, "no window.alert placeholders");
A.noEmDash(H.code(js), "W20 code and copy (the source's em dashes are replaced)");

/* the number moved cleanly: nothing here still calls itself W19 */
A.absent(raw, "W19 Alerts", "no W19 Alerts banner survives the renumber");
A.absent(raw, "W19-Copy", "no W19-Copy banner survives the renumber");

/* ---------- 1b. the classes W19 Pending Actions borrows ---------------
   The live widget renders inside these and declares none of them. If this
   list ever stops matching, W19 has lost its styling, so it is pinned here
   rather than left as a note in a document. */
["alb4-root", "alb4-tabs", "alb4-tab", "alb4-panel", "alb4-badge",
  "alb4-xwide-wrap", "alb4-detail-split", "alb4-detail-left", "alb4-detail-right",
  "alb4-xw-left-panel", "al-cat", "al-count", "al-item", "al-modal-hd",
  "al2-dp", "al2-dp-empty", "al2-dp-hd", "al2-dp-body", "al2-dp-table", "al2-dp-actions"
].forEach(function (c) {
  A.contains(css, "." + c, "W19 borrows ." + c + ", so W20's CSS still declares it");
});
A.contains(css, ".alb4-xw-left-panel .al-cat:last-child", "the rule that was stranded in W19's run is back with its siblings");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,aboutOf:aboutOf,find:find,dashboards:dashboards,cats:ALO_CATS,cfgs:ALO_ITEM_MODALS,modalHTML:aloModalHTML," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded"); EX.stubRender();
const reg = EX.WIDGETS.kinds.alerts; A.ok(!!reg, "WIDGETS.kinds.alerts is still registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(/accounting modules/.test((EX.aboutOf({ kind: "alerts", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");

/* ---------- 3. data matches the source -------------------------------- */
A.eq(EX.cats.length, 6, "6 alert categories");
const nItems = EX.cats.reduce(function (s, c) { return s + c.items.length; }, 0);
A.eq(nItems, 15, "15 items in all");
A.eq(EX.cats.filter(function (c) { return c.sev === "err"; }).reduce(function (s, c) { return s + c.items.length; }, 0), 4, "4 critical items");
A.eq(EX.cats.filter(function (c) { return c.sev === "warn"; }).reduce(function (s, c) { return s + c.items.length; }, 0), 11, "11 warning items");
A.contains(JSON.stringify(EX.cats), "Purchase Order Queue", "the Purchase Order Queue rename is carried over");

/* ---------- 4. it is switched off, and stays switched off ------------- */
const live = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "alerts" || w.kind === "alerts2"; });
A.eq(live.length, 0, "no live registry row: the widget is scrapped, not on screen");
A.contains(raw, '/* {id:"alB4",', "its Explore row is preserved, commented out");
A.contains(raw, '/* {id:"alB4_x",', "its Detail row is preserved, commented out");
A.contains(raw, '/* {id:"alB4_2",', "the Copy's Explore row is preserved, commented out");
A.contains(raw, '/* {id:"alB4_2x",', "the Copy's Detail row is preserved, commented out");
A.contains(raw, "W20:false", "and the W20 switch is off");

/* ---------- 5. the code still works if it is ever switched back on ----
   Built here rather than read from the registry, because there is no row to
   read. These are the rows as they sit commented out above. */
const w = { id: "alB4", title: "Alerts & Actions", kind: "alerts", size: "wide", tiers: ["wide", "xwide"], updated: "just now" };
const wx = { id: "alB4_x", title: "Alerts & Actions (Detail)", kind: "alerts", size: "xwide", tiers: ["wide", "xwide"], updated: "just now" };
function T(attrs) { return { getAttribute: function (k) { return (attrs || {})[k] == null ? null : String(attrs[k]); }, closest: function () { return null; } }; }
let h = EX.contentHTML(w);
A.contains(h, "alb4-root", "Explore renders the widget");
A.contains(EX.contentHTML(wx), "alb4-root", "Detail renders the widget");
A.ok(/All <span class="alb4-badge[^"]*">15</.test(h), "All tab counts 15");
A.ok(/Critical <span class="alb4-badge[^"]*">4</.test(h), "Critical tab counts 4");
A.ok(/Warning <span class="alb4-badge[^"]*">11</.test(h), "Warning tab counts 11");
A.eq((h.match(/class="al-cat /g) || []).length, 6, "All shows the 6 categories");
A.eq((h.match(/class="al-body"/g) || []).length, 6, "every category starts open, as in B4");
A.ok(/data-action="alO-(item|payment|recon|ar|budget)"/.test(h), "items carry their action buttons (item pop-up, or one of the 7 Oct destination screens)");

/* The tab, toggle and item HANDLERS cannot be exercised while the widget is
   switched off, and this is the mechanism rather than a defect: aloHandle
   opens with `var w=find(id);if(!w)return false;`, and find() reads the
   registry, where every alerts row is commented out. The old w19 driver
   asserted these paths against live rows; asserting them now would mean
   un-commenting a row the owner switched off. What is pinned instead is that
   they decline cleanly rather than throwing, which is what a scrapped widget
   should do if something still reaches it. */
["alO-tab", "alO-toggle", "alO-item", "alO-payment", "alO-recon"].forEach(function (a) {
  let out, threw = false;
  try { out = EX.WIDGETS.click(a, w.id, T({ "data-tab": "err", "data-cat": "al-cat-1", "data-idx": "0" }), {}); }
  catch (e) { threw = true; }
  A.ok(!threw, a + " does not throw while the widget is switched off");
  A.eq(out, false, a + " declines, because find() has no row to return");
});
A.contains(js, "var w=find(id);if(!w)return false;", "and that guard is the reason, pinned here so the cause is not re-diagnosed");
/* every item's pop-up opens without throwing, including the two source crash cases */
let threw = 0;
EX.cats.forEach(function (c) { c.items.forEach(function (lbl, i) { try { const mh = EX.modalHTML(c.sev, c.title, lbl, EX.cfgs[c.id + ":" + i] || null); if (!/al-modal/.test(mh)) threw++; } catch (e) { threw++; if (threw === 1) console.log("first error:", e && e.message); } }); });
A.eq(threw, 0, "every item's pop-up builds (secondary-only and Purchase Order Queue configs included)");

/* ---------- 5b. no pop-up ever prints the word "undefined" -----------
   aloModalHTML lives in THIS block and is also what W19 Pending Actions
   opens its item pop-ups with. On 16 Oct a button rendered as "UNDEFINED
   Post Transaction": the shared ICON() helper interpolated a missing name
   into a ligature span, and the icon font rendered the word. Both halves are
   pinned, here and in w19-pendingactions.driver.js, because the fault needs
   a builder in one block and a config in the other to show itself. */
A.contains(S, "var ICON=function(n){return n?", "the shared ICON() helper guards a falsy name");
A.absent(H.code(js), "ICON(b.icon)+b.label", "the modal button no longer passes a possibly-absent icon straight to ICON()");
EX.cats.forEach(function (c) {
  c.items.forEach(function (lbl, i) {
    const mh = EX.modalHTML(c.sev, c.title, lbl, EX.cfgs[c.id + ":" + i] || null);
    A.absent(mh, "undefined", "no undefined in the pop-up for " + c.id + ":" + i);
    A.absent(mh, ">undefined<", "and none inside a ligature span for " + c.id + ":" + i);
  });
});
/* a config with a label and NO icon is the exact shape that broke */
{
  const mh = EX.modalHTML("warn", "Cat", "Item", { sevLabel: "X", title: "T", msg: "M", rows: [], btnPri: { label: "Post Transaction" } });
  A.absent(mh, "undefined", "a label-only btnPri renders no undefined");
  A.contains(mh, "Post Transaction", "and still renders its label");
  A.absent(mh, '<span class="material-symbols-rounded"></span>', "and leaves no empty icon span behind");
}
A.contains(EX.modalHTML("warn", "Purchase Order Queue", "x", EX.cfgs["al-cat-5:0"]), "Approval Trail", "Purchase Order Queue opens the approval pop-up");
A.contains(EX.modalHTML("err", "Restricted Fund", "x", EX.cfgs["al-cat-1:0"]), "Review Fund", "a secondary-only config gets its own button label");
A.eq(EX.WIDGETS.click("nope", w.id, T(), {}), false, "unknown action declined");

process.exit(A.report());
