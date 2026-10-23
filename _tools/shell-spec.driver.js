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
const fs = require("fs"), path = require("path");
const H = require("./jo-port-driver.js");

const A = new H.Assert("Shell: Demo / Spec view toggle");
const shell = H.loadShell();
const S = shell.script, raw = shell.html, css = shell.css;

/* ---------- 1. the toggle in the top nav ------------------------------- */
const TOGGLE_RE = /<div class="viewtab" role="tablist" aria-label="View mode">\s*<button class="vtb on" data-action="view-demo" role="tab" aria-selected="true">Demo<\/button>\s*<button class="vtb" data-action="view-spec" role="tab" aria-selected="false">Spec<\/button>\s*<button class="vtb" data-action="view-perm" role="tab" aria-selected="false">Permissions<\/button>\s*<button class="vtb" data-action="view-dash" role="tab" aria-selected="false">Dashboards<\/button>\s*<\/div>/g;
A.eq((raw.match(TOGGLE_RE) || []).length, 1, "exactly one Demo / Spec / Permissions / Dashboards toggle");
const nav = raw.slice(raw.indexOf('<header class="topnav">'), raw.indexOf("</header>"));
A.contains(nav, 'class="viewtab"', "the toggle sits inside the top nav");
A.ok(nav.indexOf('class="viewtab"') > nav.indexOf('class="tn-spacer"') && nav.indexOf('class="viewtab"') < nav.indexOf('aria-label="Search"'), "placed after the spacer and before the Search icon (Jo's placement)");
A.cssDeclares(css, ["viewtab", "vtb", "vtb.on", "spec", "spec-mode", "spec-hd", "spec-title", "spec-lead", "spec-links", "spec-link", "spec-sec", "spec-ul", "spec-tbl", "spec-fig", "spec-rule"], "toggle and spec CSS");
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

/* ---------- 5b. the Permissions view (16 Oct 2026) --------------------- */
const p0 = raw.indexOf('<section class="spec" id="permView"'), p1 = raw.indexOf("</section>", p0);
A.ok(p0 > -1 && p1 > p0, "permissions section present");
A.ok(p0 > s1, "permissions section follows the spec section");
const perm = raw.slice(p0, p1);
A.contains(perm, ' hidden ', "permissions hidden by default");
A.noEmDash(perm, "permissions text");
A.absent(perm, "\u2192", "no arrows in the permissions text");
A.contains(perm, "Widget Permissions (Version 2)", "titled for Version 2");
["perm-rule", "perm-care", "perm-points", "perm-open"].forEach(function (id, i) { A.contains(perm, 'id="' + id + '"', "permissions section " + (i + 1) + " " + id); });
A.eq((perm.match(/<h2>/g) || []).length, 4, "four numbered permissions sections");
A.eq((perm.match(/<tr><td><b>/g) || []).length, 17, "seventeen widgets in the right-to-show table");
const PICS = ["taskrole-dashboard-row", "taskrole-purchasing", "taskrole-payables", "taskrole-bank", "taskrole-gifts", "taskrole-remittance", "taskrole-loans", "taskrole-payroll", "taskrole-generalledger", "purchasing-popup", "payables-invoice", "bank-drill", "gifts-ledger", "remittance-drill", "loans-popup", "pto-approve", "payroll-drill", "budget-scope", "mystatus-detail", "tasks-tiles"];
PICS.forEach(function (n) {
  A.contains(perm, 'src="docs/Pics/Permissions/' + n + '.png"', "picture referenced: " + n);
  A.ok(fs.existsSync(path.join(__dirname, "..", "docs", "Pics", "Permissions", n + ".png")), "picture file present: " + n + ".png");
});
/* the Task Role screenshots, plus the decided no-permission pop-up in item 2.10 (19 Oct) */
const MOCKS = ["noaccess"];
MOCKS.forEach(function (n) {
  A.contains(perm, 'src="docs/Pics/Permissions/' + n + '.png"', "mock-up referenced: " + n);
  A.ok(fs.existsSync(path.join(__dirname, "..", "docs", "Pics", "Permissions", n + ".png")), "mock-up file present: " + n + ".png");
});
A.eq((perm.match(/<figure class="spec-fig">/g) || []).length, PICS.length + MOCKS.length, "one figure per picture and per mock-up");
A.contains(perm, "Contact your administrator for more information.", "the pop-up's last line is the owner's wording");
A.contains(perm, "Module / Section / Page", "the pop-up template names the page as Module / Section / Page");
A.contains(perm, "<b>always show it</b>", "the rule for outbound links is always-show");
A.eq((perm.match(/<img /g) || []).length, (perm.match(/ alt="/g) || []).length, "every picture has alt text");
A.contains(perm, 'href="docs/handover/Widget%20permissions', "links to the full review document");
A.contains(perm, "<code>/PurchasingManagement/Requests/Update</code>", "Purchasing: Open request names its page right");
A.contains(perm, "<code>/AccountsPayable/PaymentProcessing</code>", "Accounts Payable: Schedule payment names its Update right");
A.contains(perm, "account roles", "Bank: account roles named");
A.contains(css, ".spec-fig img{display:block;max-width:100%;", "figures scale to the column");

/* ---------- 6. the click handler, driven -------------------------------- */
const code = H.code(S);
const hm = /    if\(a==="view-spec"\|\|a==="view-demo"\|\|a==="view-perm"\|\|a==="view-dash"\)\{[\s\S]*?window\.scrollTo\(0,0\);return;\}/.exec(code);
A.ok(!!hm, "dispatcher has the view-spec / view-demo / view-perm / view-dash branch");
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
    const body = node(""), sv = node(""), pv = node(""), dv = node(""), demo = node("view-demo"), specBtn = node("view-spec"), permBtn = node("view-perm"), dashBtn = node("view-dash"), main = { scrollTop: 300 };
    demo.cls.on = true; sv.hidden = true; pv.hidden = true; dv.hidden = true;
    return { body: body, sv: sv, pv: pv, dv: dv, demo: demo, specBtn: specBtn, permBtn: permBtn, dashBtn: dashBtn, main: main, scrolled: 0,
      document: { body: body, getElementById: function (id) { return id === "specView" ? sv : (id === "permView" ? pv : (id === "dashView" ? dv : null)); }, querySelectorAll: function (q) { return q === ".viewtab .vtb" ? [demo, specBtn, permBtn, dashBtn] : []; }, querySelector: function (q) { return q === ".appmain" ? main : null; } } };
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
  A.eq(on.pv.hidden, true, "Spec: the permissions section stays hidden");
  A.eq(on.dv.hidden, true, "Spec: the dashboards section stays hidden");
  const pm = drive("view-perm");
  A.ok(pm.body.classList.contains("spec-mode"), "Permissions: body gets .spec-mode (the dashboard hides)");
  A.eq(pm.pv.hidden, false, "Permissions: the permissions section is shown");
  A.eq(pm.sv.hidden, true, "Permissions: the spec section is hidden");
  A.ok(pm.permBtn.classList.contains("on") && !pm.specBtn.classList.contains("on") && !pm.demo.classList.contains("on"), "Permissions: only the Permissions tab is on");
  A.eq(pm.permBtn.getAttribute("aria-selected"), "true", "Permissions: aria-selected moves to Permissions");
  A.eq(pm.dv.hidden, true, "Permissions: the dashboards section stays hidden");
  const dm = drive("view-dash");
  A.ok(dm.body.classList.contains("spec-mode"), "Dashboards: body gets .spec-mode (the dashboard hides)");
  A.eq(dm.dv.hidden, false, "Dashboards: the dashboards section is shown");
  A.eq(dm.sv.hidden, true, "Dashboards: the spec section is hidden");
  A.eq(dm.pv.hidden, true, "Dashboards: the permissions section is hidden");
  A.ok(dm.dashBtn.classList.contains("on") && !dm.permBtn.classList.contains("on") && !dm.specBtn.classList.contains("on") && !dm.demo.classList.contains("on"), "Dashboards: only the Dashboards tab is on");
  A.eq(dm.dashBtn.getAttribute("aria-selected"), "true", "Dashboards: aria-selected moves to Dashboards");
  A.eq(dm.main.scrollTop, 0, "Dashboards: content scrolled to the top");
  A.eq(dm.pop, null, "Dashboards: any open pop-over is closed");
  const off = drive("view-demo");
  A.ok(!off.body.classList.contains("spec-mode"), "Demo: .spec-mode removed");
  A.eq(off.sv.hidden, true, "Demo: the spec section is hidden again");
  A.eq(off.pv.hidden, true, "Demo: the permissions section is hidden again");
  A.eq(off.dv.hidden, true, "Demo: the dashboards section is hidden again");
  A.ok(off.demo.classList.contains("on") && !off.specBtn.classList.contains("on") && !off.permBtn.classList.contains("on") && !off.dashBtn.classList.contains("on"), "Demo: the Demo tab is on, Spec, Permissions and Dashboards are off");
}
/* ---------- 7. the Dashboards view ------------------------------------- */
/* Added 2026-10-19 on the owner's instruction, so the module-dashboards work
   is a view in the build rather than only a markdown file. Built by
   _tools/one-off/build-dashboards-view-2026-10-19.js from a module table, so
   the sections cannot drift from one another. */
{
  const d0 = raw.indexOf('<section class="spec" id="dashView"'), d1 = raw.indexOf("</section>", d0);
  A.ok(d0 > -1 && d1 > d0, "the Dashboards section exists");
  const dash = raw.slice(d0, d1);
  A.ok(d0 > raw.indexOf('id="permView"'), "it sits after the Permissions section");
  A.contains(dash, 'hidden', "it starts hidden");
  A.contains(dash, 'aria-label="Default dashboards"', "it is labelled for a screen reader");
  A.contains(dash, '<h1 class="spec-title">', "it has the house heading");
  /* the three rulings of 19 Oct, each pinned so a later edit cannot quietly drop one */
  A.contains(dash, "must persist", "the saved-selection requirement leads the view");
  A.contains(dash, "Detail size", "it states that every default is the Detail size");
  A.contains(dash, "Quick Links is retired", "it records that Quick Links is retired");
  A.contains(dash, "Main Content Tasks", "Records' two widgets are named");
  A.contains(dash, "My Status", "both of them");
  /* one section per module, fifteen of them plus the four preamble sections */
  const secs = (dash.match(/<div class="spec-sec"/g) || []).length;
  A.eq(secs, 21, "four preamble sections, the Home page, fifteen modules and the open-questions list");
  /* 19 Oct: each module names its URL in the owner's [env] form, and the
     owner's own capture of the renamed header is shown as the target */
  A.contains(dash, "https://[env]myamplify.io/AccountsPayable", "each module page names its URL in the owner's [env] form");
  A.contains(dash, "https://[env]myamplify.io/</code>", "the home page is the root URL");
  A.contains(dash, "_header/", "the owner's target header screenshot is shown");
  A.contains(dash, "reads <b>Accounts Payable</b>", "the naming section records that the dashboard is now named for its module");
  /* every module named */
  ["Home", "Accounts Payable", "Accounts Receivable", "Bank Account Management", "Deposits On Hand",
   "Donors And Gifts", "Fixed Assets", "General Ledger", "Insurance Billing", "Loan Processing",
   "Payroll", "Pension Billing", "Purchasing Management", "Records", "Remittance", "Statistics"
  /* the headings are numbered ("5. Accounts Payable"), so the name is matched
     against its closing tag rather than an opening angle bracket */
  ].forEach(function (m) { A.contains(dash, m + "</h2>", "the view has a section for " + m); });
  /* the screenshots: two per module that has a widget, every one on disk, and
     all lazily loaded so four views' worth of images do not load at once */
  const imgs = (dash.match(/<img src="([^"]+)"/g) || []).map(function (s) { return decodeURIComponent(/src="([^"]+)"/.exec(s)[1]); });
  /* The V2 set is fourteen and always present; the old-system set arrives
     module by module from the test1 capture, so the count is a floor. */
  A.ok(imgs.length >= 15, "at least the fifteen V2 full-page screenshots are present, Statistics included (" + imgs.length + " in all)");
  A.eq((dash.match(/loading="lazy"/g) || []).length, imgs.length, "every screenshot is lazily loaded");
  const REPO = path.join(__dirname, "..");
  let missing = imgs.filter(function (p) { return !fs.existsSync(path.join(REPO, p)); });
  A.eq(missing.length, 0, "every screenshot it names exists on disk: " + missing.join(", "));
  A.ok(imgs.every(function (p) { return p.indexOf("docs/Pics/Modules/") === 0; }), "they all come from docs/Pics/Modules");
  /* Statistics has no old-system screenshot (the URL redirects to the root) and,
     since the owner's ruling of 22 Oct 2026 (Q51), one V2 screenshot like Records.
     The slice start is asserted first: indexOf returning -1 would make slice(-1)
     one character long and the checks below pass for the wrong reason. */
  const statAt = dash.indexOf("Statistics</h2>");
  A.ok(statAt > 0, "the Statistics section was located");
  A.eq((dash.slice(statAt).match(/<img /g) || []).length, 1, "Statistics has exactly one screenshot, the V2 capture");
  A.contains(dash.slice(statAt), "Statistics%20-%20V2.png", "and it is the V2 capture");
  A.absent(dash.slice(statAt), "Statistics%20-%20V1.png", "no old-system screenshot: the URL redirects");
  A.contains(dash.slice(statAt), "Settled 22 October (Q51)", "the ruling is stated");
  A.contains(dash.slice(statAt), "STATS", "and it says why: the legacy panel rendered the literal word");
  /* it introduces no new classes */
  const used = [...new Set((dash.match(/class="([^"]+)"/g) || []).flatMap(function (s) { return /class="([^"]+)"/.exec(s)[1].split(/\s+/); }))];
  used.forEach(function (c) {
    if (/^material-symbols/.test(c)) return;
    A.contains(css, "." + c, "the view's class is declared: " + c);
  });
}

/* the shell must not render on a view switch (nothing in the dashboard changed) */
A.absent(hm ? hm[0] : "", "render()", "the view switch does not re-render the dashboard");

process.exit(A.report());
