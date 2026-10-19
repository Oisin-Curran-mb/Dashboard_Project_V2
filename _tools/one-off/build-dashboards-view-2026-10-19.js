/* One-off, 2026-10-19: a fourth view, Dashboards, beside Demo / Spec / Permissions.

   Owner, pointing at the view toggle: "where the Doc should be option selection
   as default dashboards". So the module-dashboards work becomes a view in the
   build rather than only a markdown file, laid out like the Permissions view
   ("similar design and layout like the permissions", 19 Oct).

   WHAT IT SHOWS. One section per module page: its URL in the owner's form
   (https://[env]myamplify.io/AccountsPayable), what the old system's page on
   test1 actually shows in its two slots, what is provable from the migration
   history, the V2 widgets that belong to the module, the proposed V2 default,
   and full-page screenshots: the old system on test1, then this build. Every
   proposed default is the Detail size. The requirement that a user's
   selection be SAVED leads the view.

   WHERE THE OLD-SYSTEM FACTS COME FROM. shoot-legacy-modules-2026-10-19.js
   writes docs/Pics/Modules/legacy-manifest.json as it captures, naming the
   two panels on each page. This script reads it, so the "what it shows today"
   row is taken from the capture rather than typed in. Until a module has been
   captured, its row and its figure say so instead of guessing.

   RE-RUNNABLE. If the view is already in the file it is removed and rebuilt,
   so this can run after each capture pass. The button and the dispatcher
   branch are only added when absent.

   It uses only classes the shell already declares, so it adds no CSS and
   nothing for lint T5 to report.
*/
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", ".."), NL = "\r\n";
const FILE = path.join(DIR, "index.html");
let t = fs.readFileSync(FILE, "utf8");
const log = [];

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const enc = s => encodeURIComponent(s);
const PICS = "docs/Pics/Modules";
const MANIFEST_PATH = path.join(DIR, PICS, "legacy-manifest.json");
const MANIFEST = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) : {};
/* the owner's notation for the environment, 19 Oct: "like https://[env]myamplify.io/AccountsPayable" */
const ENV = "https://[env]myamplify.io/";

/* ---------------------------------------------------------------- data */
/* path:    the module's URL segment; "" is the root, the home dashboard
   legacy:  what the migration history in the repo proves; "" when nothing does
   shots:   false when there is nothing to photograph in either version
   v2shot:  false when there is no V2 counterpart to show (the home page) */
const MODULES = [
  { m: "Home", path: "", size: "Explore",
    widgets: ["Accounts Payable By Due Date", "Receivable Invoices Outstanding", "Budget Compared to Actual", "Financial KPI", "Bank Balances", "Pending Actions", "Main Content Tasks"],
    dflt: "What Accounts Payable, Accounts Receivable, General Ledger and Bank Account Management show, all at Explore: Accounts Payable By Due Date, Receivable Invoices Outstanding, Budget Compared to Actual with the Financial KPI band, and Bank Balances; Pending Actions once; then Main Content Tasks last. Owner's ruling, 19 October.",
    legacy: "",
    note: "The root URL is the page a user lands on before choosing a module. The old system's seed for it is not in the repository and the two live tenants disagree (test1 shows Payroll Scheduled Time Off in both slots, the owner's beta1 account Gifts Pledges and Main Content Tasks), so at least one is a user's override. This is the one page whose default is Explore rather than Detail, so that four modules' widgets fit one screen. A new user on the old system also gets an empty My Status, an empty right-hand task pad, and no Quick Links on this page." },
  { m: "Accounts Payable", path: "AccountsPayable", widgets: ["Accounts Payable By Due Date", "Pending Actions"],
    dflt: "Accounts Payable By Due Date at Detail and Pending Actions at Detail", legacy: "",
    note: "Pending Actions belongs here: its group tabs are Accounts Payable, Accounts Receivable and General Ledger, and Accounts Payable opens first." },
  { m: "Accounts Receivable", path: "AccountsReceivable", widgets: ["Receivable Invoices Outstanding", "Pending Actions"],
    dflt: "Receivable Invoices Outstanding at Detail and Pending Actions at Detail", legacy: "" },
  { m: "Bank Account Management", path: "BankAccountManagement", widgets: ["Bank Balances"],
    dflt: "Bank Balances at Detail", legacy: "",
    note: "There is no Bank Reconciliation module; it is a page inside this one." },
  { m: "Deposits On Hand", path: "DepositsOnHand", widgets: ["Deposits on Hand"],
    dflt: "Deposits on Hand at Detail",
    legacy: "Slot 1 the Deposit Accounts panel, slot 2 Main Content Tasks. Slot 1 was Main Content Tasks first and was changed to the module's own panel." },
  { m: "Donors And Gifts", path: "DonorsAndGifts", widgets: ["Gifts Pledges"],
    dflt: "Gifts Pledges at Detail",
    legacy: "Slot 1 the Gifts Pledges panel, slot 2 Main Content Tasks.",
    note: "The public URL is /DonorsAndGifts while the folder is Gifts, so the module's display name is Donors And Gifts. That is the string the dashboard should carry, not “Gifts”." },
  { m: "Fixed Assets", path: "FixedAssets", widgets: ["Fixed Asset Values"],
    dflt: "Fixed Asset Values at Detail",
    legacy: "Slot 1 the Fixed Assets panel. It was My Status before that and was changed to the module's own panel. Slot 2 is not set by any migration in the repo." },
  { m: "General Ledger", path: "GeneralLedger", widgets: ["Budget Compared to Actual", "Financial KPI", "Pending Actions"],
    dflt: "The Financial KPI band, Budget Compared to Actual at Detail and Pending Actions at Detail", legacy: "",
    note: "The busiest module in V2, and the case that argues for more than the old system's two panels." },
  { m: "Insurance Billing", path: "InsuranceBilling", widgets: ["Insurance Billing Plans"],
    dflt: "Insurance Billing Plans at Detail", legacy: "" },
  { m: "Loan Processing", path: "LoanProcessing", widgets: ["Loans With Balance Due"],
    dflt: "Loans With Balance Due at Detail",
    legacy: "Slot 1 the Loans With Balance Due panel, slot 2 Main Content Tasks." },
  { m: "Payroll", path: "Payroll", widgets: ["Payroll Distributions", "Payroll Scheduled Time Off"],
    dflt: "Payroll Distributions at Detail. Payroll Scheduled Time Off is available but not the default.", legacy: "",
    note: "Payroll Scheduled Time Off is gated on a deeper right than the module root, the secure time-off hours tab, so it is absent for some users who can see Payroll Distributions. That makes it the wrong choice for a default." },
  { m: "Pension Billing", path: "PensionBilling", widgets: ["Pension Plans"],
    dflt: "Pension Plans at Detail", legacy: "" },
  { m: "Purchasing Management", path: "PurchasingManagement", widgets: ["Purchasing Management"],
    dflt: "Purchasing Management at Detail, Table view",
    legacy: "Slot 1 the Purchasing Management panel, named “Data Panel Info”; slot 2 Main Content Tasks, named “Main Content Links”. The clearest case in the repo.",
    note: "The legacy panel opened on “Awaiting my approval next”, the first option in its status dropdown. V2 keeps that vocabulary in its scope chip, so the default carries over." },
  { m: "Records", path: "Records", widgets: ["My Status", "Main Content Tasks"],
    dflt: "My Status at Detail and Main Content Tasks at Detail", legacy: "",
    note: "Records has no widget of its own, so it takes the two cross-module widgets. Both adapt to whichever module they sit on, which is what makes them the answer here rather than a placeholder. Owner's ruling, 19 October. In the old system this page can have two empty slots, and when a slot has no seed row the picker silently refuses to fill it, so this replaces a page a user cannot fix." },
  { m: "Remittance", path: "Remittance", widgets: ["Remittance Pledges"],
    dflt: "Remittance Pledges at Detail", legacy: "",
    note: "Remittance is also a licence flag, not only a module: other modules test for it before showing certain links and tiles." },
  { m: "Statistics", path: "Statistics", widgets: [],
    dflt: "Nothing to propose.", legacy: "", shots: false,
    note: "No widget in either version, so there is nothing to show; on test1 the URL redirects to the home page. The legacy panel rendered the literal word STATS: its grid and chart are commented out and it still references the Accounts Payable record type it was copied from. Needs a ruling: does Statistics get a dashboard at all?" }
];

/* ------------------------------------------------------------ the view */
const picPath = (d, ver) => `${PICS}/${d.m}/${d.m} - V${ver}.png`;
const picExists = (d, ver) => fs.existsSync(path.join(DIR, picPath(d, ver)));
const figure = (d, ver, alt) => {
  const p = picPath(d, ver).split("/").map(enc).join("/");
  /* The spec column is 900px and these are full pages at 1920, so they render
     at about 47 per cent. Each is a link to the file, so a click opens it at
     full size. No new class: the anchor inherits the figure's styling. */
  return `            <figure class="spec-fig"><a href="${p}" target="_blank" rel="noopener" title="Open this screenshot at full size"><img src="${p}" alt="${esc(alt)}" loading="lazy"></a></figure>`;
};

/* Owner, 19 Oct: "add main content tasks to all the modules V2 so that it
   looks more like the default from the original place where the widget came
   from, but as the last item". Every module with a widget of its own ends
   with Main Content Tasks, which is the old system's slot 2 on every module
   page that has panels. Records already carries it, last. */
const MCT = "Main Content Tasks";
MODULES.forEach(d => {
  if (d.widgets.length && d.widgets.indexOf(MCT) < 0) {
    d.widgets.push(MCT);
    d.dflt = d.dflt.replace(/\.?$/, "") + ", then " + MCT + " at Detail as the last item.";
  }
});

function moduleSection(d, i) {
  const url = ENV + d.path;
  const live = MANIFEST[d.m];
  const liveRow = live
    ? `Slot 1 <b>${esc(live.slots[0] || "(empty)")}</b>, slot 2 <b>${esc(live.slots[1] || "(empty)")}</b>. Captured ${esc(live.taken)} on ${esc(live.host)}, company ${esc(live.company)}.`
    : (d.shots === false ? "Nothing to capture." : "Not yet captured from test1.");
  const rows = [
    `<tr><td>URL</td><td><code>${esc(url)}</code></td></tr>`,
    `<tr><td>What it shows today</td><td>${liveRow}</td></tr>`,
    `<tr><td>Provable from source</td><td>${d.legacy ? esc(d.legacy) : "Not set by any migration in the repo."}</td></tr>`,
    `<tr><td>V2 widgets</td><td>${d.widgets.length ? d.widgets.map(w => "<b>" + esc(w) + "</b>").join(", ") : "<b>None.</b>"}</td></tr>`,
    `<tr><td>Proposed default</td><td><b>${esc(d.dflt)}</b></td></tr>`
  ].join("");
  const out = [
    `          <div class="spec-sec" id="dash-${d.m.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">`,
    `            <h2>${i + 5}. ${esc(d.m)}</h2>`,
    `            <table class="spec-tbl"><tbody>${rows}</tbody></table>`
  ];
  if (d.note) out.push(`            <p>${esc(d.note)}</p>`);
  if (d.shots !== false) {
    if (picExists(d, 1)) {
      out.push(`            <p><b>The old system</b>, ${esc(url)} on test1.</p>`);
      out.push(figure(d, 1, `${d.m}, the old system on test1: a full-page screenshot of ${url}.`));
    } else {
      out.push(`            <p><b>The old system</b>, ${esc(url)}: screenshot not yet captured from test1.</p>`);
    }
    if (d.v2shot !== false && picExists(d, 2)) {
      const sz = d.size || "Detail";
      out.push(`            <p><b>V2</b>, this build, with only this page's widgets, at ${sz}.</p>`);
      out.push(figure(d, 2, `${d.m}, Version 2: a full-page screenshot of the dashboard with only this page's widgets, at ${sz} size.`));
    }
  }
  out.push(`          </div>`);
  return out.join(NL);
}

const HEADER_PIC = `${PICS}/_header/Dashboard header named for the module - target.png`;
const headerFig = fs.existsSync(path.join(DIR, HEADER_PIC))
  ? `            <figure class="spec-fig"><a href="${HEADER_PIC.split("/").map(enc).join("/")}" target="_blank" rel="noopener" title="Open at full size"><img src="${HEADER_PIC.split("/").map(enc).join("/")}" alt="The owner's screenshot of the live Pages site with the dashboard renamed to Accounts Payable: the selector reads Accounts Payable with its chevron, above the Financial KPI band and the Pending Actions widgets." loading="lazy"></a></figure>`
  : "";

const VIEW = [
  `        <section class="spec" id="dashView" hidden aria-label="Default dashboards">`,
  `          <header class="spec-hd">`,
  `            <h1 class="spec-title">Accounting Dashboard, Default Dashboards by Module (Version 2)</h1>`,
  `            <p class="spec-lead">For each module page: its URL, what the old system shows on it today, which widgets belong to it in V2, and what it should open with. Every proposed default is the Detail size. The screenshots are full pages, not widget crops.</p>`,
  `            <div class="spec-links">`,
  `              <a class="spec-link" href="docs/handover/${enc("Module dashboards - the original default and the V2 equivalent (draft).md")}" target="_blank" rel="noopener"><span class="material-symbols-rounded">description</span>Full review document (Markdown)</a>`,
  `            </div>`,
  `          </header>`,
  ``,
  `          <div class="spec-sec" id="dash-saved">`,
  `            <h2>1. Required: the user's choice has to be saved</h2>`,
  `            <div class="spec-rule">Whatever a user selects on their dashboard must persist. If they change the dashboard option, that choice is saved against the user and is what they see next time they open the module. Without it the dashboard resets on every visit and the defaults below are the only thing anyone ever sees.</div>`,
  `            <p>It is also how the old system behaves: a user's panel choice is written to their own row, keyed to the user and the page, and that row wins over the system default on every later load. The first time a user changes a slot, the system row is cloned into a personal row and then edited. So this is a port, not a new feature.</p>`,
  `            <p>What has to be saved, at minimum:</p>`,
  `            <ul class="spec-ul"><li>which dashboard the user selected, per module</li><li>which widgets are on it, and in what order</li><li>each widget's size</li><li>each widget's own view, filter, range and sort, which the registry row already tracks but only in memory</li></ul>`,
  `            <p>This build saves none of it. Every selection is lost on reload.</p>`,
  `          </div>`,
  ``,
  `          <div class="spec-sec" id="dash-naming">`,
  `            <h2>2. The dashboard carries the module's name</h2>`,
  `            <div class="spec-rule">In Accounts Payable the dashboard selector reads <b>Accounts Payable</b>, not <b>Dashboard</b>. Done in this build on 19 October. It matches the old system, where every module home page is titled with the module's name: the URL <code>${esc(ENV)}AccountsPayable</code> is titled Accounts Payable, <code>${esc(ENV)}Payroll</code> is titled Payroll, and so on for all of them.</div>`,
  `            <p>The owner's own capture of the target, taken on the live Pages site with the rename control:</p>`,
  headerFig,
  `            <p>The build has one dashboard and its sidebar shows one module, Accounts Payable, so that is the name it takes. When the per-module split happens (still to be decided below) each dashboard takes its own module's name the same way, and the page title (&ldquo;Accounting Home&rdquo; today) and the browser title should follow it.</p>`,
  `            <p>The Phase 1 demo named its dashboard &ldquo;Dashboard&rdquo; too, so this was inherited rather than introduced; nothing in the old system ever used that word as a page name.</p>`,
  `          </div>`,
  ``,
  `          <div class="spec-sec" id="dash-before">`,
  `            <h2>3. What the old system actually has</h2>`,
  `            <div class="spec-rule">There is no per-module dashboard page. One generic home page serves every module, and it shows exactly <b>two stacked panels</b> chosen from one global list of eighteen.</div>`,
  `            <p>Which panel sits in each slot is a database row, not code, and any panel can go on any module's page: the chooser is built from every panel class and filtered only by the user's rights. You can put Bank Balances on the Payroll home page, and on some tenants someone has. So &ldquo;the default for this module&rdquo; is a weaker idea than it sounds, a seed row the user can change in two clicks.</p>`,
  `            <p>Two things are therefore shown for each module below. <b>What it shows today</b> is read from the page on test1 at the time of capture, and reflects that tenant and that user's own choices. <b>Provable from source</b> is what the migration history in the repository sets, which is the only place the shipped default is written down; only five modules have one there. The pattern in all five is the same: slot 1 the module's own panel, slot 2 Main Content Tasks.</p>`,
  `            <p><b>Quick Links is retired</b> (owner, 19 October). It was the densest per-module content in the old system, hard-coded per module, with twenty links for Accounts Receivable and none at all for five modules. Nothing replaces it.</p>`,
  `          </div>`,
  ``,
  `          <div class="spec-sec" id="dash-sizes">`,
  `            <h2>4. Every default is the Detail size</h2>`,
  `            <div class="spec-rule">Each module's proposed default below is the Detail size, and its V2 screenshot shows Detail. Glance and Explore stay available to the user; they are not what a module dashboard opens with. <b>The one exception is the home page</b>, which gathers four modules' widgets and so opens at Explore (owner, 19 October).</div>`,
  `            <p><b>Main Content Tasks closes every module's dashboard</b> (owner, 19 October). On the old system it is slot 2 on every module page that has panels, the grid of up to eight task shortcuts for that module; putting it last on every V2 module dashboard keeps that shape. The V2 screenshots below show each proposal as it would render: the dashboard titled for its module, its own widgets first, Main Content Tasks last.</p>`,
  `          </div>`,
  ``,
  MODULES.map(moduleSection).join(NL + NL),
  ``,
  `          <div class="spec-sec" id="dash-open">`,
  `            <h2>${MODULES.length + 5}. What still needs a decision</h2>`,
  `            <ul class="spec-ul">`,
  `              <li><b>One dashboard per module, or one that follows the module in the navigation?</b> Everything else depends on this. The single dashboard is already named Accounts Payable to match the navigation.</li>`,
  `              <li><b>What the home page (the root URL) opens with</b> when no module is chosen.</li>`,
  `              <li><b>Does Statistics get a dashboard?</b> Records is settled; Statistics is not.</li>`,
  `              <li><b>Pending Actions needs a row in the Permissions view's widget table.</b> It is the only widget without one.</li>`,
  `              <li><b>The shipped defaults for the eleven modules not set by any migration</b> can be settled with one query against a live database. The query is in the review document.</li>`,
  `            </ul>`,
  `            <p>Settled on 19 October: Quick Links is retired, Records shows Main Content Tasks and My Status, every default is the Detail size, the dashboard is named for its module, and the user's selection must be saved.</p>`,
  `          </div>`,
  `        </section>`,
  ``
].filter(l => l !== null).join(NL);

/* ------------------------------------------------------- 1. the button */
if (t.indexOf('data-action="view-dash"') < 0) {
  const a = `      <button class="vtb" data-action="view-perm" role="tab" aria-selected="false">Permissions</button>`;
  if (t.split(a).length - 1 !== 1) throw new Error("the Permissions button was not found exactly once");
  t = t.split(a).join(a + NL + `      <button class="vtb" data-action="view-dash" role="tab" aria-selected="false">Dashboards</button>`);
  log.push("  a fourth button in the view toggle");
} else log.push("  the Dashboards button is already there");

/* --------------------------------------------------- 2. the dispatcher */
if (t.indexOf('a==="view-dash"') < 0) {
  const a = `    if(a==="view-spec"||a==="view-demo"||a==="view-perm"){var _spec=(a!=="view-demo");document.body.classList.toggle("spec-mode",_spec);var _sv=document.getElementById("specView");if(_sv)_sv.hidden=(a!=="view-spec");var _pv=document.getElementById("permView");if(_pv)_pv.hidden=(a!=="view-perm");`;
  if (t.split(a).length - 1 !== 1) throw new Error("the dispatcher branch was not found exactly once");
  t = t.split(a).join(`    if(a==="view-spec"||a==="view-demo"||a==="view-perm"||a==="view-dash"){var _spec=(a!=="view-demo");document.body.classList.toggle("spec-mode",_spec);var _sv=document.getElementById("specView");if(_sv)_sv.hidden=(a!=="view-spec");var _pv=document.getElementById("permView");if(_pv)_pv.hidden=(a!=="view-perm");var _dv=document.getElementById("dashView");if(_dv)_dv.hidden=(a!=="view-dash");`);
  log.push("  the dispatcher learns view-dash and the new section");
} else log.push("  the dispatcher already knows view-dash");

/* ----------------------------------------------------- 3. the section */
{
  const start = `        <section class="spec" id="dashView"`;
  const i = t.indexOf(start);
  if (i > -1) {
    const j = t.indexOf(`        </section>` + NL, i);
    if (j < 0) throw new Error("an existing Dashboards section has no end");
    let end = j + (`        </section>` + NL).length;
    if (t.slice(end, end + NL.length) === NL) end += NL.length;
    t = t.slice(0, i) + t.slice(end);
    /* the blank line that sat BEFORE the section stays behind otherwise, and the
       end-of-views anchor below then misses by one line */
    if (t.slice(i - 2 * NL.length, i) === NL + NL) t = t.slice(0, i - NL.length) + t.slice(i);
    log.push("  removed the previous Dashboards section");
  }
  const anchor = `        </section>` + NL + `      </div>` + NL + `    </main>`;
  if (t.split(anchor).length - 1 !== 1) throw new Error("the end of the views block is not unique");
  t = t.split(anchor).join(`        </section>` + NL + NL + VIEW + `      </div>` + NL + `    </main>`);
  log.push("  the Dashboards section, after Permissions");
}

/* ------------------------------------------------------------- guards */
if ((t.match(/data-action="view-dash"/g) || []).length !== 1) throw new Error("the button is not there exactly once");
if ((t.match(/id="dashView"/g) || []).length !== 1) throw new Error("the section is not there exactly once");
if (t.indexOf('_dv.hidden=(a!=="view-dash")') < 0) throw new Error("the dispatcher does not hide the new section");
const ip = t.indexOf('id="permView"'), id = t.indexOf('id="dashView"');
if (!(ip > -1 && id > ip)) throw new Error("the Dashboards section is not after Permissions");

const sec = t.slice(id, t.indexOf("</section>", id));
MODULES.forEach(d => { if (sec.indexOf(esc(d.m) + "</h2>") < 0) throw new Error("module missing from the view: " + d.m); });
if (sec.indexOf(ENV + "AccountsPayable") < 0) throw new Error("the URL row did not land");

const imgs = [...sec.matchAll(/<img src="([^"]+)"/g)].map(m => decodeURIComponent(m[1]));
imgs.forEach(p => { if (!fs.existsSync(path.join(DIR, p))) throw new Error("screenshot missing on disk: " + p); });
const v2n = MODULES.filter(d => d.shots !== false && d.v2shot !== false && picExists(d, 2)).length;
const v1n = MODULES.filter(d => d.shots !== false && picExists(d, 1)).length;
if (v2n !== 15) throw new Error("expected 15 V2 screenshots on disk (14 modules + Home), found " + v2n);

const css = t.slice(t.indexOf("<style"), t.lastIndexOf("</style>"));
[...new Set([...sec.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)))].forEach(c => {
  if (/^material-symbols/.test(c)) return;
  if (css.indexOf("." + c) < 0) throw new Error("the view uses an undeclared class: " + c);
});

let bare = 0;
for (let k = 0; k < t.length; k++) if (t[k] === "\n" && t[k - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log(`Dashboards view: ${MODULES.length} module pages, ${v2n} V2 and ${v1n} old-system screenshots, ${Object.keys(MANIFEST).length} module(s) with live panel data`);
