/* =====================================================================
   shell-spec.driver.js , Shell: the Demo / Spec view toggle and the spec
   document (ported from Jo's phase-2 live shell, 2026-10-05; the spec text
   is rewritten for V2 as built, docs/decisions/Shell-spec-toggle.md).

   Proves: the toggle is in the top nav once, every class it uses is
   declared, every token the block uses is declared on :root, the spec
   section is present, hidden by default, free of em dashes and consistent
   with the build (one inventory row per registered kind, plus the band),
   and the click handler actually switches the view when driven.
   ===================================================================== */
"use strict";
const vm = require("vm");
const H = require("./jo-port-driver.js");

const A = new H.Assert("Shell: Demo / Spec view toggle");
const shell = H.loadShell();
const S = shell.script, raw = shell.html, css = shell.css;

/* ---------- 1. the toggle in the top nav ------------------------------- */
const TOGGLE_RE = /<div class="viewtab" role="tablist" aria-label="View mode">\s*<button class="vtb on" data-action="view-demo" role="tab" aria-selected="true">Demo<\/button>\s*<button class="vtb" data-action="view-spec" role="tab" aria-selected="false">Spec<\/button>\s*<\/div>/g;
A.eq((raw.match(TOGGLE_RE) || []).length, 1, "exactly one Demo / Spec toggle");
const nav = raw.slice(raw.indexOf('<header class="topnav">'), raw.indexOf("</header>"));
A.contains(nav, 'class="viewtab"', "the toggle sits inside the top nav");
A.ok(nav.indexOf('class="viewtab"') > nav.indexOf('class="tn-spacer"') && nav.indexOf('class="viewtab"') < nav.indexOf('aria-label="Search"'), "placed after the spacer and before the Search icon (Jo's placement)");
A.cssDeclares(css, ["viewtab", "vtb", "vtb.on", "spec", "spec-mode", "spec-hd", "spec-title", "spec-lead", "spec-links", "spec-link", "spec-sec", "spec-ul", "spec-tbl"], "toggle and spec CSS");
A.contains(css, "/* ===== Shell: Demo / Spec view toggle (dark, top-right) + spec document ===== */", "CSS region banner");
A.contains(css, "/* ===== end Shell: Demo / Spec view toggle + spec document ===== */", "CSS region end banner");

/* ---------- 2. spec-mode hides the whole Demo view, band included ------- */
const hide = /\.spec-mode [^{]*\{display:none!important;\}/.exec(css);
A.ok(!!hide, ".spec-mode has a display:none rule");
[".pagetitle", ".toolbar", ".statusline", ".fkp-band", ".dashboard"].forEach(function (c) { A.contains(hide ? hide[0] : "", ".spec-mode " + c, "spec mode hides " + c); });

/* ---------- 3. every token the block uses is declared ------------------- */
const block = css.slice(css.indexOf("/* ===== Shell: Demo / Spec view toggle"), css.indexOf("/* ===== end Shell: Demo / Spec view toggle"));
const used = {}; let m, re = /var\((--[a-z0-9-]+)\)/g;
while ((m = re.exec(block))) used[m[1]] = true;
Object.keys(used).forEach(function (t) { A.contains(css, t + ":", "token declared on :root: " + t); });
A.ok(Object.keys(used).length >= 10, "the block uses Pathway aliases (" + Object.keys(used).length + " tokens)");
A.absent(block, "#", "no raw hex in the block");
A.eq((block.match(/\.spec-tbl th\{/g) || []).length, 1, ".spec-tbl th declared once (lint T2 fix)");
A.eq((block.match(/\.spec-tbl td\{/g) || []).length, 1, ".spec-tbl td declared once (lint T2 fix)");

/* ---------- 4. the spec document --------------------------------------- */
const s0 = raw.indexOf('<section class="spec" id="specView"'), s1 = raw.indexOf("</section>", s0);
A.ok(s0 > -1 && s1 > s0, "spec section present");
const spec = raw.slice(s0, s1);
A.contains(spec, ' hidden ', "hidden by default (Demo is the default view)");
A.ok(s0 > raw.indexOf('<div class="dashboard" id="dashboard"></div>'), "spec section follows the dashboard grid");
A.noEmDash(spec, "the spec document");
A.absent(spec, "→", "no arrows in the spec text");
A.contains(spec, "Version 2", "titled for Version 2");
["spec-tokens", "spec-grid", "spec-sizes", "spec-resize", "spec-toolbar", "spec-overlays", "spec-states", "spec-a11y", "spec-widgets", "spec-build"].forEach(function (id, i) {
  A.contains(spec, 'id="' + id + '"', "section " + (i + 1) + " " + id);
});
A.eq((spec.match(/<h2>/g) || []).length, 10, "ten numbered sections");
/* static classes in the markup are all declared */
const cls = {}; re = /class="([^"]+)"/g;
while ((m = re.exec(spec))) m[1].split(/\s+/).forEach(function (c) { if (c && c !== "material-symbols-rounded") cls[c] = true; });
A.cssDeclares(css, Object.keys(cls), "spec markup classes");

/* ---------- 5. the spec agrees with the build --------------------------- */
A.contains(spec, "pathway-tokens@10.0.4", "token package version matches the <link>");
A.contains(raw, "pathway-tokens@10.0.4/dist/primitives.css", "(the <link> really is 10.0.4)");
const grid = /\.dashboard\{[^}]*grid-template-columns:repeat\((\d+),1fr\)[^}]*grid-auto-rows:(\d+)px[^}]*gap:(\d+)px/.exec(css);
A.ok(!!grid, "grid rule located");
if (grid) { A.eq(grid[1], "4", "base grid is 4 columns"); A.contains(spec, "<code>grid-auto-rows: " + grid[2] + "px</code>", "spec quotes the row height"); A.contains(spec, "<code>gap: " + grid[3] + "px</code>", "spec quotes the gap"); }
A.contains(css, "@media(min-width:768px){.dashboard{grid-template-columns:repeat(8,1fr);}}", "8 columns at 768");
A.contains(css, "@media(min-width:1024px){.dashboard{grid-template-columns:repeat(12,1fr);}}", "12 columns at 1024");
A.contains(spec, "<td>768px and up</td><td>8</td>", "spec: 8 columns at 768");
A.contains(spec, "<td>1024px and up</td><td>12</td>", "spec: 12 columns at 1024");
[["kpi", "3"], ["wide", "8"], ["xwide", "9"]].forEach(function (p) { A.contains(css, '.widget[data-size="' + p[0] + '"]{grid-row:span ' + p[1] + ';}', p[0] + " spans " + p[1] + " rows in the build"); });
A.contains(spec, "<td>3 (176px)</td>", "spec: Glance 3 rows = 3*48 + 2*16");
A.contains(spec, "<td>8 (496px)</td>", "spec: Explore 8 rows = 8*48 + 7*16");
A.contains(spec, "<td>9 (560px)</td>", "spec: Detail 9 rows = 9*48 + 8*16");
A.contains(css, ".modal.modal-wide{max-width:1080px;width:94vw;height:84vh;", "wide modal is 1080 / 94vw / 84vh in the build");
A.contains(spec, "<code>.modal-wide</code>: 1080px, 94vw maximum, 84vh tall", "spec quotes the wide modal size");
/* inventory: one row per registered kind, plus the band */
const kinds = {}; re = /WIDGETS\.register\("([a-z]+)"/g;
while ((m = re.exec(S))) kinds[m[1]] = true;
const inv = spec.slice(spec.indexOf('id="spec-widgets"'));
Object.keys(kinds).forEach(function (k) { A.contains(inv, "<code>" + k + "</code>", "inventory lists kind " + k); });
A.eq((inv.match(/<tr><td>W\d\d<\/td>/g) || []).length, Object.keys(kinds).length + 1, "inventory rows = registered kinds + the W18 band");
A.contains(inv, "<td>W18</td><td>Financial KPI</td><td>band</td>", "W18 listed as the band");
/* tiers: W08 and W19 are Explore + Detail only; everything else offers all three */
const two = (raw.match(/tiers:\["wide","xwide"\]/g) || []).length;
A.ok(two > 0, "some registry rows are Explore + Detail only (" + two + ")");
["mystatus", "alerts"].forEach(function (k) { A.ok(new RegExp('kind:"' + k + '"[^}]*tiers:\\["wide","xwide"\\]').test(raw), k + " rows are Explore + Detail only in the registry"); });
A.contains(inv, "<td>My Status</td><td><code>mystatus</code></td><td>Explore, Detail</td>", "inventory: My Status two sizes");
A.contains(inv, "<td>Alerts &amp; Actions</td><td><code>alerts</code></td><td>Explore, Detail</td>", "inventory: Alerts two sizes");

/* ---------- 6. the click handler, driven -------------------------------- */
const code = H.code(S);
const hm = /    if\(a==="view-spec"\|\|a==="view-demo"\)\{[\s\S]*?window\.scrollTo\(0,0\);return;\}/.exec(code);
A.ok(!!hm, "dispatcher has the view-spec / view-demo branch");
const disp = code.indexOf('document.addEventListener("click",function(e){\r\n    var t=e.target.closest("[data-action]");');
A.ok(disp > -1 && hm && hm.index > disp, "the branch lives in the shell's delegated click dispatcher");
if (hm) {
  function fakeDoc() {
    function node(action) {
      const n = { cls: {}, attrs: { "data-action": action }, hidden: false };
      n.classList = { toggle: function (c, on) { if (on) n.cls[c] = true; else delete n.cls[c]; }, contains: function (c) { return !!n.cls[c]; } };
      n.getAttribute = function (k) { return n.attrs[k] == null ? null : n.attrs[k]; };
      n.setAttribute = function (k, v) { n.attrs[k] = String(v); };
      return n;
    }
    const body = node(""), sv = node(""), demo = node("view-demo"), specBtn = node("view-spec"), main = { scrollTop: 300 };
    demo.cls.on = true; sv.hidden = true;
    return { body: body, sv: sv, demo: demo, specBtn: specBtn, main: main, scrolled: 0,
      document: { body: body, getElementById: function (id) { return id === "specView" ? sv : null; }, querySelectorAll: function (q) { return q === ".viewtab .vtb" ? [demo, specBtn] : []; }, querySelector: function (q) { return q === ".appmain" ? main : null; } } };
  }
  function drive(action) {
    const f = fakeDoc();
    const ctx = vm.createContext({ document: f.document, window: { scrollTo: function () { f.scrolled++; } }, pop: { type: "wfind" }, Array: Array });
    vm.runInContext("(function(a){" + hm[0] + " return 'fell through';})(" + JSON.stringify(action) + ")", ctx);
    f.pop = ctx.pop;
    return f;
  }
  const on = drive("view-spec");
  A.ok(on.body.classList.contains("spec-mode"), "Spec: body gets .spec-mode");
  A.eq(on.sv.hidden, false, "Spec: the spec section is shown");
  A.ok(on.specBtn.classList.contains("on") && !on.demo.classList.contains("on"), "Spec: the Spec tab is on, Demo is off");
  A.eq(on.specBtn.getAttribute("aria-selected"), "true", "Spec: aria-selected moves to Spec");
  A.eq(on.demo.getAttribute("aria-selected"), "false", "Spec: aria-selected leaves Demo");
  A.eq(on.main.scrollTop, 0, "Spec: content scrolled to the top");
  A.eq(on.scrolled, 1, "Spec: window scrolled to the top");
  A.eq(on.pop, null, "Spec: any open pop-over is closed");
  const off = drive("view-demo");
  A.ok(!off.body.classList.contains("spec-mode"), "Demo: .spec-mode removed");
  A.eq(off.sv.hidden, true, "Demo: the spec section is hidden again");
  A.ok(off.demo.classList.contains("on") && !off.specBtn.classList.contains("on"), "Demo: the Demo tab is on, Spec is off");
}
/* the shell must not render on a view switch (nothing in the dashboard changed) */
A.absent(hm ? hm[0] : "", "render()", "the view switch does not re-render the dashboard");

process.exit(A.report());
