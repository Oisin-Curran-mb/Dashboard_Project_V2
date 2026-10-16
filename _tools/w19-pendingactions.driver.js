/* =====================================================================
   w19-pendingactions.driver.js , W19 Pending Actions.

   Created 2026-10-16 with the renumber. Pending Actions replaces the
   scrapped Alerts & Actions, which moved to W20; this widget took the W19
   identifier and had its styling moved onto the build's own tokens on the
   owner's instruction ("make sure everything is using tokens on that new
   widget ... dont change how the widget works but just the styling").

   WHAT THIS PINS, and why each one is here rather than taken on trust:

   - The CSS region exists and is its OWN region. Until 16 Oct this widget's
     58 lines of CSS sat inside the W20 Alerts banner pair, which is why the
     Alerts driver was the thing reporting 18 raw colours. A region of its
     own is what lets the colour bar below be scoped to this widget at all.
   - ZERO raw colours in that region, by the same matcher every other widget
     is held to.
   - None of the five invented token names is back. They were declared
     nowhere in the build and their hex fallbacks did the rendering, which is
     how the widget looked tokenised while not being so.
   - Every token the region names is really declared, so a future rename
     cannot quietly reintroduce a fallback that silently paints the widget.
   - Three live registry rows and their tiers, the registration, and that all
     three sizes render.

   WHAT IT DELIBERATELY DOES NOT PIN. The borrowed .al-, .alb4- and .al2-dp-
   classes are W20's and are asserted there, in w20-alerts.driver.js, which
   is the file that would notice if that block were deleted. Renaming them to
   pa3- was tried on 2026-10-13 and broke the detail pane.

   This is deliberately a styling-and-wiring driver, not a behavioural one.
   The widget's group tabs, queue panel, glance-card modal and detail pane
   have no assertions here beyond rendering without throwing. That gap is
   recorded in docs/decisions/W19.md.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W19");
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell();
const S = shell.script, raw = shell.html;

/* ---------- 1. the two regions ---------------------------------------- */
const CSS_START = '/* ===== W19 Pending Actions V2 CSS , prefix pa3 , kind "pendingactions" ===== */';
const CSS_END = "/* ===== end W19 Pending Actions V2 CSS ===== */";
const JS_START = '/* ===== W19 Pending Actions V2 JS , prefix pa3 , kind "pendingactions" ===== */';
const JS_END = "/* ===== end W19 Pending Actions V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) {
  A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 50));
});
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 3000, "CSS region has substance (" + css.length + " bytes)");
A.ok(js.length > 10000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("pendingactions",{', "registers itself as kind pendingactions");
["var PA3_ABOUT=", "var PA3_CATS=", "var PA3_GROUPS=", "function pa3Content(", "function pa3Handle("]
  .forEach(function (n) { A.contains(js, n, "block holds " + n); });
A.absent(S.replace(js, ""), "PA3_CATS", "no W19 code outside the block");

/* the CSS region is this widget's own, not a lodger in W20's */
const alertsCss = H.extractRegion(shell.css, "/* ===== W20 Alerts & Actions V2 CSS ===== */", "/* ===== end W20 Alerts & Actions V2 CSS ===== */");
A.absent(alertsCss, ".pa3-", "no pa3 rule is left inside the W20 region");
A.absent(alertsCss, ".pa3g2-", "nor any pa3g2 rule");
A.absent(alertsCss, ".pa3gm-", "nor any pa3gm rule");
A.ok(shell.css.indexOf(CSS_START) > shell.css.indexOf("/* ===== end W20 Alerts & Actions V2 CSS ===== */"),
  "and it sits after the W20 region rather than inside it");

/* ---------- 2. the colour bar ----------------------------------------- */
/* The same matcher every other widget is held to. H.code strips CSS comments
   first, so a hex quoted in a note is exempt; a raw rgba() in a box-shadow is
   NOT, which is why the panel uses var(--elevation-overlay). */
A.eq((H.code(css).match(/#[0-9a-fA-F]{3,6}\b|rgba?\(/g) || []).length, 0, "no raw colours in the CSS region");

/* the five invented names are gone and must not come back */
["--color-primary", "--color-err", "--surface-card", "--surface-subtle", "--surface-widget-hover"]
  .forEach(function (n) {
    A.absent(H.code(css), n, "the invented token name " + n + " is gone");
    A.absent(H.code(shell.css), n, "and is nowhere else in the stylesheet either");
  });

/* every token this region names resolves: declared here, or one of the
   upstream families the CDN link in <head> declares (primitive, semantic,
   elevation), or the one custom property the JS sets inline at run time */
const named = [];
(css.match(/var\((--[A-Za-z0-9-]+)/g) || []).forEach(function (s) {
  const n = s.slice(4); if (named.indexOf(n) < 0) named.push(n);
});
A.ok(named.length > 15, "the region names " + named.length + " tokens");
named.forEach(function (n) {
  if (/^--(primitive|semantic|elevation)-/.test(n)) return;
  if (n === "--pa3-cols") return;
  A.contains(shell.css, n + ":", "token is really declared: " + n);
});
A.contains(css, "--pa3-cols", "the card grid still reads its run-time column count");
A.contains(js, "style=\"--pa3-cols:", "which the JS still sets inline");

/* the house patterns it was pointed at */
A.contains(css, "background:var(--red-10);color:var(--red-100);", "the error pill takes the Alerts error palette");
A.contains(css, "var(--primitive-color-saffron-25)", "the warning pill takes the saffron palette");
A.contains(css, "box-shadow:var(--elevation-overlay)", "the queue panel uses the elevation token, not a raw shadow");
A.contains(css, "outline:2px solid var(--focusring-base)", "focus uses the shared focus ring");
A.absent(css, "0 0 0 2px", "the hover ring in the invented blue is gone");

/* type and spacing: only exact-value swaps were made, so these must be tokens */
A.absent(H.code(css), "font-size:32px", "the hero number is on --type-size-32");
A.absent(H.code(css), "font-size:11px", "11px type is on --type-size-11");
A.absent(H.code(css), "font-size:10px", "10px type is on --type-size-10");
A.contains(css, "var(--type-size-32)", "and --type-size-32 is what it names");

/* ---------- 3. host and registration ---------------------------------- */
const TAIL = H.TAIL;
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,aboutOf:aboutOf,dashboards:dashboards,cats:PA3_CATS,groups:PA3_GROUPS," +
  "cfgs:PA3_ITEM_MODALS,modalHTML:aloModalHTML," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded"); EX.stubRender();
/* renderErr is not asserted: the shim has no real #dashboard element, so the
   shell's own render() always fails on innerHTML here. That is the harness,
   not the widget, and the sibling drivers do not assert it either. */

const reg = EX.WIDGETS.kinds.pendingactions;
A.ok(!!reg, "WIDGETS.kinds.pendingactions is registered");
["content", "about", "click"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(((EX.aboutOf({ kind: "pendingactions", title: "x" }) || {}).b || "").length > 20, "info text comes through WIDGETS.about");

/* ---------- 4. the three sizes ---------------------------------------- */
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "pendingactions"; });
A.eq(rows.length, 3, "three live registry rows");
rows.forEach(function (w) {
  A.eq(JSON.stringify(w.tiers), '["kpi","wide","xwide"]', w.id + ": offers all three tiers");
});
["paB4_g2", "paB4", "paB4_x"].forEach(function (id) {
  A.eq(rows.filter(function (w) { return w.id === id; }).length, 1, "row " + id + " is live");
});
A.contains(raw, '/* {id:"paB4_g",', "the card-grid glance row stays preserved, commented out");

const g = rows.filter(function (w) { return w.size === "kpi"; })[0];
const w = rows.filter(function (w) { return w.size === "wide"; })[0];
const wx = rows.filter(function (w) { return w.size === "xwide"; })[0];
A.ok(g && w && wx, "one row per size");

const hg = EX.contentHTML(g), hw = EX.contentHTML(w), hx = EX.contentHTML(wx);
A.contains(hg, "pa3g2-wrap", "Glance renders the queue-list variant");
A.contains(hw, "alb4-root", "Explore renders the accordion");
A.contains(hx, "alb4-xwide-wrap", "Detail renders the split with the detail pane");
[["Glance", hg], ["Explore", hw], ["Detail", hx]].forEach(function (p) {
  A.ok(p[1].length > 200, p[0] + " renders something substantial");
  A.absent(p[1], "undefined", "no undefined leaked at " + p[0]);
  A.absent(p[1], "NaN", "no NaN at " + p[0]);
});

/* the card-grid glance is still reachable if its row is switched back on */
A.contains(EX.contentHTML({ id: "paB4_g", title: "Pending Actions", kind: "pendingactions", size: "kpi", tiers: ["kpi", "wide", "xwide"] }),
  "pa3-cards", "the preserved card-grid glance still builds");

/* ---------- 4b. no item pop-up prints the word "undefined" -----------
   Owner, 16 Oct 2026, with a screenshot: the "Unposted Transaction:
   TXN-2024-3356" button read "UNDEFINED Post Transaction". The shared ICON()
   helper interpolated a missing icon name into a ligature span and the font
   rendered the word. Ten of this widget's configs carry a label with no icon
   and so all ten showed it; the builder is aloModalHTML, which lives in W20's
   block, so this is pinned at both ends. */
A.contains(raw, "var ICON=function(n){return n?", "the shared ICON() helper guards a falsy name");
{
  const keys = Object.keys(EX.cfgs || {});
  A.ok(keys.length > 20, "the item-modal configs are reachable (" + keys.length + ")");
  let noIcon = 0;
  keys.forEach(function (k) {
    const cfg = EX.cfgs[k];
    const mh = EX.modalHTML("warn", "Cat", "Item", cfg);
    A.absent(mh, "undefined", "no undefined in the pop-up for " + k);
    if (cfg && cfg.btnPri && !cfg.btnPri.icon) {
      noIcon++;
      A.absent(mh, '<span class="material-symbols-rounded"></span>', k + " leaves no empty icon span");
      A.contains(mh, cfg.btnPri.label, k + " still renders its label: " + cfg.btnPri.label);
    }
  });
  A.eq(noIcon, 10, "the ten label-only buttons are still label-only (a rendering fix, not a data change)");
}

/* ---------- 5. the number, and the three maps that bind it ------------ */
A.contains(raw, 'W19:"pendingactions"', "WIDGET_KIND maps W19 to this kind");
A.contains(raw, 'pendingactions:"W19"', "VIEW_WNUM maps this kind to W19, which retires the W?? label");
A.contains(raw, "W19:true,   /* Pending Actions */", "WIDGET_SWITCH carries W19, so the widget can be switched off");
A.absent(raw, "W19-PendingActions", "the working banner name is gone");
A.contains(raw, "<code>pendingactions</code>", "the spec inventory lists the kind");
A.absent(raw, "W?? ", "nothing in the shell still prints a W?? label");

/* nothing user-facing gained a W number (owner's rule, 6 Oct) */
[hg, hw, hx].forEach(function (h) { A.absent(h, "W19", "no W number in the rendered markup"); });
/* The title is drawn by the widget frame from the registry row, not by
   contentHTML, so it is the row that has to carry the name. */
rows.forEach(function (r) {
  A.ok(/^Pending Actions/.test(r.title), r.id + " is titled by name: " + r.title);
  A.absent(r.title, "W19", r.id + " carries no W number in its title");
});

A.noEmDash(H.code(js), "W19 code and copy");
A.noEmDash(H.code(css), "W19 CSS");

process.exit(A.report());
