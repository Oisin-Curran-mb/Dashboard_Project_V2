/* One-off, 2026-10-19: shell-spec.driver.js follows the fourth view.

   The driver pins the view toggle's markup and the dispatcher's branch
   verbatim, which is the right thing for a shell contract and means adding a
   Dashboards view has to be mirrored here. Three pins move and one set of
   assertions is added:

     1. TOGGLE_RE gains the fourth button, so the toggle is still matched
        exactly once and in the right order.
     2. The dispatcher regex gains view-dash.
     3. The driven harness learns the new section and the new button, and a
        drive("view-dash") block asserts the same five things the Permissions
        block asserts: the body enters spec mode, the new section shows, the
        other two hide, only its tab is on, and aria-selected moves to it.
        The Demo block gains the mirror assertion that the new section hides
        again, which is what would catch a fourth view that never closes.
*/
"use strict";
const fs = require("fs"), path = require("path");
const P = path.join(__dirname, "..", "shell-spec.driver.js");
let s = fs.readFileSync(P, "utf8");
/* This driver is LF, unlike index.html which is CRLF; take the endings from
   the file rather than assuming, or every multi-line anchor misses. */
const NL = s.indexOf("\r\n") > -1 ? "\r\n" : "\n";
const log = [];
function swap(a0, b0, why) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = s.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + (why || a0.slice(0, 60)));
  s = s.split(a).join(b);
  log.push("  " + why);
}

/* ---------- 1. the toggle regex ---------------------------------------- */
swap(`<button class="vtb" data-action="view-perm" role="tab" aria-selected="false">Permissions<\\/button>\\s*<\\/div>/g;`,
     `<button class="vtb" data-action="view-perm" role="tab" aria-selected="false">Permissions<\\/button>\\s*<button class="vtb" data-action="view-dash" role="tab" aria-selected="false">Dashboards<\\/button>\\s*<\\/div>/g;`,
     "TOGGLE_RE gains the Dashboards button");
swap(`"exactly one Demo / Spec / Permissions toggle");`,
     `"exactly one Demo / Spec / Permissions / Dashboards toggle");`,
     "and the assertion says so");

/* ---------- 2. the dispatcher regex ------------------------------------ */
swap(`const hm = /    if\\(a==="view-spec"\\|\\|a==="view-demo"\\|\\|a==="view-perm"\\)\\{[\\s\\S]*?window\\.scrollTo\\(0,0\\);return;\\}/.exec(code);`,
     `const hm = /    if\\(a==="view-spec"\\|\\|a==="view-demo"\\|\\|a==="view-perm"\\|\\|a==="view-dash"\\)\\{[\\s\\S]*?window\\.scrollTo\\(0,0\\);return;\\}/.exec(code);`,
     "the dispatcher regex gains view-dash");
swap(`A.ok(!!hm, "dispatcher has the view-spec / view-demo / view-perm branch");`,
     `A.ok(!!hm, "dispatcher has the view-spec / view-demo / view-perm / view-dash branch");`,
     "and its assertion");

/* ---------- 3. the driven harness -------------------------------------- */
swap(`    const body = node(""), sv = node(""), pv = node(""), demo = node("view-demo"), specBtn = node("view-spec"), permBtn = node("view-perm"), main = { scrollTop: 300 };
    demo.cls.on = true; sv.hidden = true; pv.hidden = true;
    return { body: body, sv: sv, pv: pv, demo: demo, specBtn: specBtn, permBtn: permBtn, main: main, scrolled: 0,`,
`    const body = node(""), sv = node(""), pv = node(""), dv = node(""), demo = node("view-demo"), specBtn = node("view-spec"), permBtn = node("view-perm"), dashBtn = node("view-dash"), main = { scrollTop: 300 };
    demo.cls.on = true; sv.hidden = true; pv.hidden = true; dv.hidden = true;
    return { body: body, sv: sv, pv: pv, dv: dv, demo: demo, specBtn: specBtn, permBtn: permBtn, dashBtn: dashBtn, main: main, scrolled: 0,`,
  "the harness gains the Dashboards section and button");

swap(`      document: { body: body, getElementById: function (id) { return id === "specView" ? sv : (id === "permView" ? pv : null); }, querySelectorAll: function (q) { return q === ".viewtab .vtb" ? [demo, specBtn, permBtn] : []; }, querySelector: function (q) { return q === ".appmain" ? main : null; } } };`,
`      document: { body: body, getElementById: function (id) { return id === "specView" ? sv : (id === "permView" ? pv : (id === "dashView" ? dv : null)); }, querySelectorAll: function (q) { return q === ".viewtab .vtb" ? [demo, specBtn, permBtn, dashBtn] : []; }, querySelector: function (q) { return q === ".appmain" ? main : null; } } };`,
  "getElementById and the tab list know the fourth view");

/* ---------- 4. the assertions ------------------------------------------ */
swap(`  A.eq(on.pv.hidden, true, "Spec: the permissions section stays hidden");`,
`  A.eq(on.pv.hidden, true, "Spec: the permissions section stays hidden");
  A.eq(on.dv.hidden, true, "Spec: the dashboards section stays hidden");`,
  "Spec also keeps the new section hidden");

swap(`  A.eq(pm.permBtn.getAttribute("aria-selected"), "true", "Permissions: aria-selected moves to Permissions");`,
`  A.eq(pm.permBtn.getAttribute("aria-selected"), "true", "Permissions: aria-selected moves to Permissions");
  A.eq(pm.dv.hidden, true, "Permissions: the dashboards section stays hidden");
  const dm = drive("view-dash");
  A.ok(dm.body.classList.contains("spec-mode"), "Dashboards: body gets .spec-mode (the dashboard hides)");
  A.eq(dm.dv.hidden, false, "Dashboards: the dashboards section is shown");
  A.eq(dm.sv.hidden, true, "Dashboards: the spec section is hidden");
  A.eq(dm.pv.hidden, true, "Dashboards: the permissions section is hidden");
  A.ok(dm.dashBtn.classList.contains("on") && !dm.permBtn.classList.contains("on") && !dm.specBtn.classList.contains("on") && !dm.demo.classList.contains("on"), "Dashboards: only the Dashboards tab is on");
  A.eq(dm.dashBtn.getAttribute("aria-selected"), "true", "Dashboards: aria-selected moves to Dashboards");
  A.eq(dm.main.scrollTop, 0, "Dashboards: content scrolled to the top");
  A.eq(dm.pop, null, "Dashboards: any open pop-over is closed");`,
  "a drive(view-dash) block, matching the Permissions one");

swap(`  A.eq(off.pv.hidden, true, "Demo: the permissions section is hidden again");
  A.ok(off.demo.classList.contains("on") && !off.specBtn.classList.contains("on") && !off.permBtn.classList.contains("on"), "Demo: the Demo tab is on, Spec and Permissions are off");`,
`  A.eq(off.pv.hidden, true, "Demo: the permissions section is hidden again");
  A.eq(off.dv.hidden, true, "Demo: the dashboards section is hidden again");
  A.ok(off.demo.classList.contains("on") && !off.specBtn.classList.contains("on") && !off.permBtn.classList.contains("on") && !off.dashBtn.classList.contains("on"), "Demo: the Demo tab is on, Spec, Permissions and Dashboards are off");`,
  "Demo closes the new section too");

/* ---------- 5. the view's own content ---------------------------------- */
swap(`/* the shell must not render on a view switch (nothing in the dashboard changed) */`,
`/* ---------- 7. the Dashboards view ------------------------------------- */
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
  A.eq(secs, 20, "four preamble sections, fifteen modules and the open-questions list");
  /* every module named */
  ["Accounts Payable", "Accounts Receivable", "Bank Account Management", "Deposits On Hand",
   "Donors And Gifts", "Fixed Assets", "General Ledger", "Insurance Billing", "Loan Processing",
   "Payroll", "Pension Billing", "Purchasing Management", "Records", "Remittance", "Statistics"
  ].forEach(function (m) { A.contains(dash, ">" + m + "<", "the view has a section for " + m); });
  /* the screenshots: two per module that has a widget, every one on disk, and
     all lazily loaded so four views' worth of images do not load at once */
  const imgs = (dash.match(/<img src="([^"]+)"/g) || []).map(function (s) { return decodeURIComponent(/src="([^"]+)"/.exec(s)[1]); });
  A.eq(imgs.length, 28, "two full-page screenshots for each of the fourteen modules with a widget");
  A.eq((dash.match(/loading="lazy"/g) || []).length, 28, "every screenshot is lazily loaded");
  let missing = imgs.filter(function (p) { return !fs.existsSync(path.join(DIR, p)); });
  A.eq(missing.length, 0, "every screenshot it names exists on disk: " + missing.join(", "));
  A.ok(imgs.every(function (p) { return p.indexOf("docs/Pics/Modules/") === 0; }), "they all come from docs/Pics/Modules");
  /* Statistics is the one module with no screenshot, and says why */
  A.absent(dash.slice(dash.indexOf(">Statistics<")), "<img", "Statistics has no screenshot, having no widget in either version");
  /* it introduces no new classes */
  const used = [...new Set((dash.match(/class="([^"]+)"/g) || []).flatMap(function (s) { return /class="([^"]+)"/.exec(s)[1].split(/\\s+/); }))];
  used.forEach(function (c) {
    if (/^material-symbols/.test(c)) return;
    A.contains(css, "." + c, "the view's class is declared: " + c);
  });
}

/* the shell must not render on a view switch (nothing in the dashboard changed) */`,
  "a section asserting the view's own content");

fs.writeFileSync(P, s);
log.forEach(l => console.log(l));
console.log("shell-spec.driver.js follows the Dashboards view");
