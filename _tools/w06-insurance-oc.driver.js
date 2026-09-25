/* =====================================================================
   w06-insurance-oc.driver.js , W06 Insurance Billing Plans
   (kind insurance-oc, prefix insO) verification driver for the
   2026-09-07 V2 re-port (Final Check build v2.4, FC_VERSION[6]='2.4').

   W06 is a style-(b) port like W07/W09/W10: a self-contained subsystem
   with its own delegated click + keydown listeners (INSO_WIRED) keyed to
   data-action="insO-*", plus an inline type popover. The extracted block
   is run in the shim and driven through the block's OWN listeners via
   fire()/fireKey() with dataAttr "data-action".

   V2 specifics asserted here (Step 4 "W06 - Insurance Billing Plans.md",
   stamped 2026-09-07 against v2.4):
     - Table / Pie segment at EXPLORE only, Table the default; a stale
       insView value falls back to the table with Table marked pressed
       (pie-as-default was never owner-confirmed: carried open, not flipped)
     - DETAIL shows BOTH at once: table left 58 / pie right 42 with a rule
     - nested Type -> Plan table: "Share of total" head label, subtotals,
       "Total (all types)" footer, share and cost math exact to the cent
     - pie: amethyst INSO_COLORS ramp, arcs sum to the charted enrolment,
       zero-enrolment plans NOT charted + uncharted note, chart-empty state
       per filter, legacy hover titles (segment + legend), no drill
     - a11y: donut role="img" + aria-label, per-segment <title>, legend
       counts/percents as DOM text, aria-expanded/aria-pressed/haspopup
     - loading only on a type change, never on sort / expand / view
     - empty states; no em dashes anywhere; titles use the (OC) convention

   Run from this folder:  node w06-insurance-oc.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const shell = H.loadShell();
const S = shell.script;
const A = new H.Assert("W06 insurance-oc (V2 re-port)");

/* ---------- extraction (verbatim region out of the real file) ---------- */
const block = "/*" + H.extractRegion(S,
  'W06 Insurance Billing Plans V2 JS (prefix: insO, kind:"insurance-oc")',
  "  })();");

/* ---------- structural markers and dispatch (pre-existing lines) ------- */
A.ok(S.indexOf('if(w.kind==="insurance-oc")return insOContent(w);') > -1, "contentHTML dispatch line present");
A.ok(S.indexOf('if(w.kind==="insurance-oc")return {h:w.title,b:INSO_ABOUT};') > -1, "aboutOf branch present");
A.ok(shell.css.indexOf('W06 Insurance Billing Plans V2 CSS, prefix insO, kind "insurance-oc"') > -1, "CSS region marker (MB updated wording) present");

/* Jo's own ins widget is untouched */
A.ok(S.indexOf("var INS_PLANS=[") > -1, "Jo's own INS_PLANS still present");
A.ok(S.indexOf("function insContent(w)") > -1, "Jo's own insContent still present");
A.ok(S.indexOf("function insHandleClick(") > -1, "Jo's own insHandleClick still present");
A.ok(S.indexOf('<span class="ins-share ins-share-head">Share</span>') > -1, "Jo's own plain Share head label untouched");

/* the OLD port's artifacts are genuinely gone from OUR block */
A.absent(block, ">Total enrolled<", "old two-column footer absent (V2 uses Total (all types))");
A.absent(block, 'ins-share-head">Share</span>', "old plain Share head absent (V2 says Share of total)");
A.ok(S.indexOf('title:"Insurance Billing Plans (Glance)"') > -1, "Jo's default-title Glance instance present (side-by-side model: hers keep default titles)");

/* ---------- registry ---------------------------------------------------- */
const REG = H.extractRegistry(S, "insurance-oc");
A.eq(REG.length, 5, "five insurance-oc registry entries");
REG.forEach(function (w) { A.contains(w.title, "(OC", "title (OC convention: " + w.title); });
const IDS = {}; REG.forEach(function (w) { IDS[w.id] = w; });
A.ok(IDS.insO && IDS.insO.size === "wide" && IDS.insO.insView === "table", "insO: Explore card, Table default");
A.ok(IDS.insO_k && IDS.insO_k.size === "kpi", "insO_k: Glance card");
A.ok(IDS.insO2 && IDS.insO2.size === "xwide" && IDS.insO2.insExpanded && IDS.insO2.insExpanded.Medical === true, "insO2: Detail card, Medical pre-expanded");
A.ok(IDS.insO3 && IDS.insO3.state === "empty" && IDS.insO3.dataset === "none", "insO3: no plans set up");
A.ok(IDS.insO4 && IDS.insO4.dataset === "nodental" && IDS.insO4.insType === "Dental", "insO4: Dental filter, none set up");

/* ---------- run the block in the shim ---------------------------------- */
const env = H.runBlock(block, { registry: REG, dataAttr: "data-action" });
const fire = env.shim.fire, fireOutside = env.shim.fireOutside, fireKey = env.shim.fireKey;
function content(id) { return env.call("insOContent", env.registry.filter(function (w) { return w.id === id; })[0]); }
function W(id) { return env.registry.filter(function (w) { return w.id === id; })[0]; }

/* ---------- data cross-foot (exact, to the cent) ------------------------ */
A.eq(env.call("insOTotal", W("insO")), 349, "grand total enrolled = 349");
A.eq(env.call("insOCostTotal", W("insO")), 95367, "grand total cost = $95,367");
const PLANS = env.get("INSO_PLANS");
A.eq(PLANS.filter(function (p) { return p.type === "Medical"; }).reduce(function (s, p) { return s + p.enroll; }, 0), 182, "Medical subtotal 182");
A.eq(PLANS.filter(function (p) { return p.type === "Medical"; }).reduce(function (s, p) { return s + p.enroll * p.rate; }, 0), 91080, "Medical cost subtotal $91,080");

/* ---------- Explore (wide): Table default + segment --------------------- */
let ex = content("insO");
A.contains(ex, 'data-tier="wide"', "Explore renders at wide tier");
A.contains(ex, 'class="vtoggle ins-vtoggle"', "Table / Pie segment present at Explore");
A.contains(ex, 'data-v="table" aria-pressed="true"', "Table segment pressed by default");
A.contains(ex, 'data-v="pie" aria-pressed="false"', "Pie segment not pressed by default");
A.contains(ex, "Total (all types)", "footer row Total (all types) at Explore");
A.contains(ex, "Share of total", "Share of total column head at Explore");
A.contains(ex, ">349<", "footer total enrolled 349 in DOM");
A.contains(ex, ">$95,367<", "footer total cost $95,367 in DOM");
A.contains(ex, ">$91,080<", "Medical type-row cost subtotal");
A.contains(ex, ">182<", "Medical type-row enrolled subtotal");
A.absent(ex, "<svg", "no pie in the default Explore table view");
/* share-of-total percents on the type rows: 52 / 28 / 20 / 0 */
["52%", "28%", "20%", "0%"].forEach(function (p) { A.contains(ex, ">" + p + "<", "type-row share " + p + " present"); });
A.contains(ex, 'aria-expanded="false"', "type rows collapsed by default");
A.contains(ex, 'role="button"', "type rows are keyboard-operable buttons");

/* ---------- expand a type (instant, no fetch) --------------------------- */
const timersBefore = env.log.timers;
fire("insO-toggle-type", { "data-id": "insO", "data-ty": "Medical" });
A.ok(W("insO").insExpanded.Medical === true, "expand toggle sets w.insExpanded.Medical");
ex = content("insO");
A.contains(ex, "Medical Base", "expanded Medical shows Base child row");
A.contains(ex, ">$57,600<", "Medical Base cost 128 x $450 = $57,600");
A.contains(ex, ">$33,480<", "Medical Buy Up cost 54 x $620 = $33,480");
A.contains(ex, ">37%<", "Medical Base share of total 37%");
A.contains(ex, ">15%<", "Medical Buy Up share of total 15%");
A.eq(env.log.timers, timersBefore, "expand is NOT a fetch (no timer)");
/* keyboard operability: Enter collapses it again */
fireKey("Enter", { "data-action": "insO-toggle-type", "data-id": "insO", "data-ty": "Medical" });
A.ok(W("insO").insExpanded.Medical === false, "Enter key collapses the type row");
A.absent(content("insO"), "Medical Base", "children hidden again after collapse");

/* ---------- sort (instant, both directions, zero sinks) ----------------- */
fire("insO-sort", { "data-id": "insO", "data-k": "count" });
A.eq(W("insO").insSort, "count-asc", "count sort toggles desc -> asc");
let sorted = env.call("insORows", W("insO"));
A.eq(sorted[0].plan, "Medical Buy Up", "count-asc: smallest non-zero count first (54)");
A.eq(sorted[sorted.length - 1].plan, "Building", "zero-enrolment row sinks to the bottom in asc too");
fire("insO-sort", { "data-id": "insO", "data-k": "plan" });
A.eq(W("insO").insSort, "plan-asc", "plan sort starts ascending");
sorted = env.call("insORows", W("insO"));
A.eq(sorted[0].plan, "Delta Dental", "plan-asc alphabetical first");
A.eq(sorted[sorted.length - 1].plan, "Building", "zero-enrolment row still last under plan sort");
A.eq(env.log.timers, timersBefore, "sort is NOT a fetch (no timer)");
W("insO").insSort = "count-desc";

/* ---------- Table / Pie segment at Explore ------------------------------ */
const rendersBefore = env.log.renders;
fire("insO-view", { "data-id": "insO", "data-v": "pie" });
A.eq(W("insO").insView, "pie", "segment click sets w.insView = pie");
A.ok(env.log.renders > rendersBefore, "segment click re-renders");
A.eq(env.log.timers, timersBefore, "view switch is NOT a fetch (no timer)");
ex = content("insO");
A.contains(ex, "<svg", "pie view renders the donut at Explore");
A.contains(ex, 'data-v="pie" aria-pressed="true"', "Pie segment pressed in pie view");
A.absent(ex, "ins-tscroll", "table hidden in Explore pie view");
A.contains(ex, 'role="img"', "donut SVG carries role=img");
A.contains(ex, 'aria-label="Enrolment by plan, 349 enrolled across 4 plans"', "donut aria-label states charted total and plan count");
/* legacy pie rules: 4 segments (Building uncharted), arcs sum to enrolment */
const arcs = ex.match(/stroke-dasharray="([\d.]+) ([\d.]+)"/g) || [];
A.eq(arcs.length, 4, "four charted segments (zero-enrolment plan uncharted)");
const Cfull = 2 * Math.PI * 52;
let drawn = 0;
arcs.forEach(function (a) { drawn += parseFloat(/dasharray="([\d.]+)/.exec(a)[1]); });
/* each arc carries +0.9 overlap; subtract it back out */
A.near(drawn - 4 * 0.9, Cfull, 0.5, "arc lengths sum to the full circumference (charted enrolment)");
[["Medical Base", "128", "37"], ["Delta Dental", "96", "28"], ["Vision", "71", "20"], ["Medical Buy Up", "54", "15"]].forEach(function (r) {
  A.contains(ex, r[0] + ", " + r[1] + " enrolled, " + r[2] + " percent of the total", "hover title for " + r[0]);
});
A.contains(ex, "<title>", "per-segment <title> hover present");
A.contains(ex, 'class="leg ins-leg" title="', "legend rows carry the legacy hover title");
A.contains(ex, "128 &middot; 37%", "legend count + percent as DOM text (Medical Base)");
A.contains(ex, ">349<", "donut centre states the charted total");
A.contains(ex, "1 plan with no enrolment is listed in the table but not charted", "uncharted zero-enrolment note present");
A.absent(ex, 'data-action="insO-leg', "no drill: legend rows are not action buttons");
/* colour is keyed to the fixed INSO_PLANS order, so the four charted plans
   use --am-600..--am-300; --am-200 belongs to Building, which is uncharted
   at "All" (zero enrolment). The full five-shade ramp is asserted on the
   constant itself. */
["--am-600", "--am-500", "--am-400", "--am-300"].forEach(function (c) {
  A.contains(ex, "var(" + c + ")", "amethyst ramp shade " + c + " used");
});
A.eq(env.get("INSO_COLORS").join(","), "--am-600,--am-500,--am-400,--am-300,--am-200", "INSO_COLORS is the five-shade amethyst ramp");

/* stale fallback: an unknown insView renders the table, Table pressed */
W("insO").insView = "chart";
ex = content("insO");
A.absent(ex, "<svg", "stale insView falls back to the table");
A.contains(ex, 'data-v="table" aria-pressed="true"', "stale insView marks Table pressed");
W("insO").insView = "table";

/* ---------- type filter: the only fetch --------------------------------- */
fire("insO-type", { "data-id": "insO" });
A.ok(env.get("INSO_POP") && env.get("INSO_POP").id === "insO", "type chip opens the inline popover");
ex = content("insO");
A.contains(ex, 'class="insf-menu"', "inline type menu rendered when open");
A.contains(ex, 'aria-expanded="true"', "chip aria-expanded true while open");
["All types", "Dental", "Medical", "Property", "Vision"].forEach(function (o) { A.contains(ex, o, "type option " + o + " offered"); });
fire("insO-set-type", { "data-id": "insO", "data-v": "Dental" });
A.eq(W("insO").insType, "Dental", "picking a type sets w.insType");
A.ok(env.log.timers > timersBefore, "type change IS a fetch (timer armed)");
A.ok(W("insO").insloading === true, "insloading true during the fetch");
A.contains(content("insO"), "Updating the enrolment breakdown...", "loading header copy");
A.contains(content("insO"), "ins-skel", "loading skeleton rendered");
W("insO").insloading = false;
ex = content("insO");
A.contains(ex, ">96<", "Dental filter: table total 96");
W("insO").insView = "pie";
A.contains(content("insO"), 'aria-label="Enrolment by plan, 96 enrolled across 1 plan"', "pie charted total equals table total for the same filter");
W("insO").insView = "table";

/* chart-empty per filter: Property has only a zero-enrolment plan */
W("insO").insType = "Property"; W("insO").insView = "pie";
ex = content("insO");
A.contains(ex, "No plan has an enrolment to chart for Property.", "chart-empty state names the filter");
A.absent(ex, "<svg", "no donut drawn in the chart-empty state");
W("insO").insType = "All"; W("insO").insView = "table";

/* popover closes on outside click and on Escape */
fire("insO-type", { "data-id": "insO" });
fireOutside();
A.ok(env.get("INSO_POP") === null, "outside click closes the type popover");
fire("insO-type", { "data-id": "insO" });
fireKey("Escape");
A.ok(env.get("INSO_POP") === null, "Escape closes the type popover");

/* ---------- Detail (xwide): BOTH views at 58/42 -------------------------- */
let dt = content("insO2");
A.contains(dt, 'data-tier="xwide"', "Detail renders at xwide tier");
A.contains(dt, "ins-body-split", "Detail uses the split body");
A.contains(dt, "ins-col-tbl", "Detail table column present");
A.contains(dt, "ins-col-chart", "Detail chart column present");
A.contains(dt, "<svg", "Detail renders the pie alongside the table");
A.contains(dt, "Total (all types)", "Detail table keeps the totals footer");
A.absent(dt, "ins-vtoggle", "no Table / Pie segment at Detail (both shown)");
A.contains(dt, "Medical Base", "insO2 Medical pre-expanded children visible");
/* the 58/42 + rule CSS is actually declared */
A.ok(/\.insf-scope \.ins-col-tbl\{flex:1 1 58%;\}/.test(shell.css), "CSS: table column 58%");
A.ok(/\.insf-scope \.ins-col-chart\{flex:1 1 42%;border-left:1px solid var\(--stroke-widget\);/.test(shell.css), "CSS: chart column 42% with dividing rule");
/* v2.4 sizing CSS */
A.ok(/\.insf-scope\[data-tier="wide"\] \.donut\{flex-basis:320px/.test(shell.css), "CSS: Explore donut flex-basis 320");
A.ok(/\.insf-scope\[data-tier="xwide"\] \.donut\{flex-basis:240px/.test(shell.css), "CSS: Detail donut flex-basis 240");
A.ok(/\.insf-scope\[data-tier="wide"\] \.pie-wrap\.row \.legend-col\{flex-basis:250px;max-width:250px;\}/.test(shell.css), "CSS: Explore legend cap 250");
A.ok(/\.insf-scope\[data-tier="xwide"\] \.pie-wrap\.row \.legend-col\{flex-basis:200px;max-width:200px;\}/.test(shell.css), "CSS: Detail legend cap 200");
A.ok(/\.insf-scope \.pie-wrap\.row\{flex-wrap:wrap;justify-content:center;align-items:flex-start;align-content:center;\}/.test(shell.css), "CSS: flex-wrap stacking + centred slack");

/* every class our markup emits is declared (ours scoped, shared in shell) */
A.cssDeclares(shell.css, ["insf-scope", "insf-chip-wrap", "insf-menu",
  "ins-cost", "ins-cost-head", "ins-typerow", "ins-caret", "ins-child",
  "ins-total-detail", "ins-total-lead", "ins-total-en", "ins-total-cost",
  "ins-pie", "ins-pie-note", "ins-chart-empty", "ins-vtoggle",
  "ins-body-split", "ins-col", "ins-col-tbl", "ins-col-chart", "ins-leg",
  "ins-share", "ins-share-track", "ins-share-fill", "ins-share-pct",
  /* ins-grp-body and ins-seg are bare markup hooks with no rule, by design,
     matching the Final (see the W11 faf-seg note in the Step 3 CSS). */
  "ins-grp", "ins-grp-nm", "ins-grp-ct", "ins-zero-tag",
  "ins-skel", "ins-sk-row", "ins-hd", "ins-ctx", "ins-body", "ins-tscroll",
  "vtoggle", "vt", "donut", "legend-col", "legend-hd", "leg", "lg-main", "lg-meta", "dot"],
  "all emitted classes declared");

/* ---------- Glance + empty states ---------------------------------------- */
const gl = content("insO_k");
A.contains(gl, ">349<", "Glance headline 349 enrolled");
A.contains(gl, "5 plans", "Glance plan-count pill");
A.contains(gl, "employees and dependents", "Glance basis caption");
A.absent(gl, "<svg", "Glance charts nothing");
const emp = content("insO3");
A.contains(emp, "No insurance plans yet", "empty state title");
A.contains(emp, "Insurance Billing module", "empty state guidance");
const den = content("insO4");
A.contains(den, "No Dental plans", "scoped empty for the Dental filter");
A.contains(den, "Pick another type above", "scoped empty offers the way out");
const kEmpty = env.call("insOContent", Object.assign({}, W("insO3"), { size: "kpi" }));
A.contains(kEmpty, "No plans", "Glance-size empty variant");

/* ---------- no-em-dash sweep over every combination ---------------------- */
const sizes = ["kpi", "wide", "xwide"];
const types = ["All", "Dental", "Medical", "Property", "Vision"];
const views = ["table", "pie"];
REG.forEach(function (base) {
  sizes.forEach(function (sz) {
    types.forEach(function (ty) {
      views.forEach(function (v) {
        const w = Object.assign({}, base, { size: sz, insType: ty, insView: v, insExpanded: { Medical: true, Dental: true, Vision: true, Property: true } });
        const out = env.call("insOContent", w);
        A.noEmDash(out, base.id + " " + sz + " " + ty + " " + v);
      });
    });
  });
});
A.noEmDash(block, "the whole insO block");

process.exit(A.report());
