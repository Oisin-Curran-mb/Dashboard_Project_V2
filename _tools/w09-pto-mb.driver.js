/* =====================================================================
   w09-pto-mb.driver.js , W09 Payroll Scheduled Time Off (OC).

   The widget-specific half of the port harness: the extraction markers, the
   class list, the code-true figures, and the behavioural assertions. Every
   shim, fire() and generic assertion comes from ./jo-port-driver.js.

   It runs the REAL handlers lifted verbatim out of ../index.html, so a pass
   here is a statement about the shipped file, not about a copy.

   Two things this driver adds to the shared harness (both generic, both
   already merged into jo-port-driver.js):
     - mkNode's own click() now fires the shim's CONFIGURED data attribute
       instead of a hardcoded data-lon.
     - Assert.same(), the inverse of Assert.changed(), because this widget's
       sharpest claim is a negative one: the calendar's department filter
       must leave the queue rows and the Glance figures untouched.

   Run:  node w09-pto-mb.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const START = "var PTOF_ME=";
const END = "/* ===== end W09 Payroll Scheduled Time Off V2 ===== */";
const KIND = "pto-mb";

const shell = H.loadShell();
const block = H.extractRegion(shell.script, START, END);
const registry = H.extractRegistry(shell.script, KIND);
const env = H.runBlock(block, { registry: registry, dataAttr: "data-pto" });
const A = new H.Assert("W09 pto-mb port driver");
const C = env.ctx;
const shim = env.shim;
/* The header comment legitimately DISCUSSES the old names (payFStatusColor,
   PAYF_STATE, approve-person, "Approve all", calgroup), which is what makes
   the port auditable. The "nothing survived the rename" checks therefore run
   against the block with its comments stripped. */
const code = block.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

function W(id) { return registry.filter(function (w) { return w.id === id; })[0]; }
function render(w) { return C.ptoFContent(w); }
function reset(w, over) {
  w.ptofView = "queue"; w.ptofStatus = "pending"; w.ptofQueueGroup = "dept";
  w.ptofCalDept = "all"; w.ptofCalY = 2026; w.ptofCalM = 7;
  w.ptofOpen = {}; w.ptofAppr = {};
  Object.assign(w, over || {});
  C.PTOF_DAY = null; C.PTOF_INFO = null; C.ptoFClosePop();
  return w;
}
/* every person row currently rendered, in order */
function people(html) {
  const out = [], re = /class="lr-main pto-emp-nm">([^<]+)</g;
  let m; while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
/* every group subheading currently rendered, in order */
function groups(html) {
  const out = [], re = /class="lr-main pto-dept-nm">([^<]+)</g;
  let m; while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
/* every day-line date cell currently rendered */
function dayLines(html) {
  const out = [], re = /class="pto-datecol">([^<]+)</g;
  let m; while ((m = re.exec(html))) out.push(m[1]);
  return out.filter(function (s) { return s !== "Date"; });
}
function count(html, re) { return (String(html).match(re) || []).length; }
/* people present in the working month but absent from a rendered queue */
function allPeopleWithheld(html) {
  const shown = people(html);
  const all = [];
  C.ptoFWorkFlat(W("ptoF_x")).forEach(function (f) { if (all.indexOf(f.person) < 0) all.push(f.person); });
  return all.filter(function (p) { return shown.indexOf(p) < 0; });
}
const ovl = function () { const n = shim.document.getElementById("ptofOverlayRoot"); return n ? n.innerHTML : ""; };
const popEl = function () { const n = shim.document.getElementById("ptofPop"); return n ? n.innerHTML : ""; };

/* ---------- 1. wiring and isolation ----------------------------------- */
console.log("\n[1] wiring and isolation");
A.contains(shell.script, 'if(w.kind==="pto-mb")return ptoFContent(w);', "contentHTML dispatches pto-mb to ptoFContent");
A.ok(shell.script.indexOf('if(w.kind==="loans-mb")return lonFContent(w);') < shell.script.indexOf('if(w.kind==="pto-mb")return ptoFContent(w);'),
  "our dispatch sits after the loans-mb line, in the MB group");
A.ok(shell.script.indexOf('if(w.kind==="pto-mb")return ptoFContent(w);') < shell.script.lastIndexOf('if(w.state==="empty"){var ec=EMPTY_COPY[w.kind]||EMPTY_COPY.deposits;'),
  "our dispatch sits BEFORE the generic empty fallback, so ptoF3 renders ptoFEmpty");
A.contains(shell.script, 'if(w.kind==="pto-mb")return {h:w.title,b:PTOF_ABOUT};', "aboutOf carries a pto-mb branch");
A.eq(registry.length, 5, "five pto-mb registry entries");
A.eq(registry.map(function (w) { return w.id; }).join(","), "ptoF,ptoF_k,ptoF_x,ptoF2,ptoF3", "registry ids");
A.ok(registry.every(function (w) { return w.tiers.join(",") === "kpi,wide,xwide"; }), "every entry carries the three tiers, no fourth");
A.ok(registry.every(function (w) { return /^Payroll Scheduled Time Off \(OC/.test(w.title); }), "every title uses the (OC...) form");
A.eq(registry.filter(function (w) { return w.size === "kpi"; }).length, 1, "one Glance variant");
A.eq(registry.filter(function (w) { return w.size === "xwide"; }).length, 1, "one Detail variant");
A.eq(registry.filter(function (w) { return w.ptofView === "calendar"; }).length, 1, "one variant opens on the Leave Calendar");
A.eq(registry.filter(function (w) { return w.state === "empty"; }).length, 1, "one no-records variant");

/* our block must not DEFINE or shadow any of Jo's names */
["ptoContent", "ptoTree", "ptoData", "ptoTypes", "ptoVisTypes", "ptoYears", "ptoCurYear",
 "ptoRecsForYear", "ptoMatchView", "ptoFmtDate", "ptoFindEmp", "ptoFindRec", "ptoPending",
 "ptoDeptPending", "ptoEmpState", "ptoYearChip", "ptoViewLabel", "ptoViewChip", "ptoHeaderBlock",
 "ptoSkeleton", "ptoChev", "ptoCheckIcon", "ptoDeptRow", "ptoDayRow", "ptoEmpRows",
 "ptoConfirmModalHTML", "ptoEmptyForView", "ptoNoAccessState", "ptoGlance", "ptoLoad"
].forEach(function (fn) {
  A.absent(block, "function " + fn + "(", "our block does not define Jo's " + fn);
});
/* THE ONE THAT MATTERS MOST: her three functions already begin with ptoF.
   Ours must neither redefine them nor call them, and the file must still
   hold exactly one definition of each. */
["ptoFindEmp", "ptoFindRec", "ptoFmtDate"].forEach(function (fn) {
  A.eq(count(shell.script, new RegExp("function\\s+" + fn + "\\s*\\(", "g")), 1, "the file defines " + fn + " exactly once, and it is hers");
  A.eq(count(block, new RegExp(fn + "\\s*\\(", "g")), 0, "our block never mentions her " + fn);
});
A.ok(!/var\s+PTO_[A-Z]/.test(block), "our block defines no PTO_ constant (ours are all PTOF_)");
A.absent(block, "data-action", "our block never emits data-action, so Jo's delegated listener cannot see it");
A.absent(code, "PAYF_", "no PAYF_ name survived the rename");
A.absent(code, "payF", "no payF name survived the rename");
A.absent(code, ".payf-", "no .payf- class survived the rename");
A.absent(code, "data-payf", "no data-payf attribute survived the rename");
A.absent(code, "fcRenderWidget", "the mockup shell's re-render hook is gone, replaced by render()");
A.absent(code, "PAYF_STATE", "the mockup's singleton state object is gone, replaced by per-widget state");

/* Jo's own block must still be intact */
A.eq(count(shell.script, /function ptoContent\(w\)/g), 1, "Jo's ptoContent is still present, exactly once");
A.contains(shell.script, 'if(w.kind==="pto")return ptoContent(w);', "Jo's own pto dispatch is untouched");
A.contains(shell.script, 'id:"pto4"', "Jo's last pto registry entry is still present");
A.contains(shell.script, "function ptoConfirmModalHTML()", "Jo's approve-confirm modal is still present");
A.contains(shell.css, "  .pto-l1{cursor:pointer;", "Jo's .pto-l1 rule is byte-intact");
A.contains(shell.css, "  .pto-abtn{display:inline-flex;align-items:center;gap:5px;font-family:inherit;font-size:12px;", "Jo's .pto-abtn rule is byte-intact (we add no override)");
A.eq(count(shell.css, /^\s*\.pto-l1\{/gm), 1, "nothing redeclares .pto-l1");
A.eq(count(shell.css, /^\s*\.pto-abtn\{/gm), 1, "nothing redeclares .pto-abtn");
/* and the W10 block must be undisturbed */
A.contains(shell.script, "function lonFContent(w)", "the W10 block is still present");
A.contains(shell.css, "/* ===== end W10 Loans With Balance Due V2 CSS ===== */", "the W10 CSS block is still closed off");
A.ok(shell.css.indexOf("/* ===== end W10 Loans With Balance Due V2 CSS ===== */") < shell.css.indexOf("/* ===== W09 Payroll Scheduled Time Off V2 CSS"),
  "our CSS block sits AFTER the W10 block, at the end of <style>");

/* the unstyled-chrome bug class, in both directions */
A.cssDeclares(shell.css, [
  "ptof-ctlrow", "ptof-ctl", "ptof-ctl-lbl", "ptof-deptchip", "ptof-body", "ptof-queue", "ptof-hint",
  "ptof-viewnote", "ptof-more-note", "ptof-l1-static", "ptof-abtn-info", "ptof-l3-out", "ptof-typecol",
  "ptof-statuscol", "ptof-chip", "ptof-chip-appr", "ptof-chip-pend", "ptof-otag", "ptof-glance",
  "ptof-fig", "ptof-kpi-div", "ptof-num-pend", "ptof-num-out", "ptof-num-zero", "ptof-cal",
  "ptof-cal-t-detail", "ptof-cal-top", "ptof-cal-nav", "ptof-cal-title", "ptof-wk", "ptof-wkc",
  "ptof-grid", "ptof-day", "ptof-daynum", "ptof-marks", "ptof-mark", "ptof-mark-tx",
  "ptof-mst-approved", "ptof-mst-pending", "ptof-mst-outstanding", "ptof-more", "ptof-legend",
  "ptof-legend-cap", "ptof-legend-item", "ptof-legend-sw", "ptof-lg-appr", "ptof-lg-pend",
  "ptof-lg-out", "ptof-cal-empty", "ptof-ovl", "ptof-ovl-b", "ptof-ovl-f", "ptof-dd-row",
  "ptof-dd-focus", "ptof-dd-dot", "ptof-dd-main", "ptof-dd-nm", "ptof-dd-grp", "ptof-dd-lv",
  "ptof-dd-st", "ptof-info-hd-main", "ptof-info-hd-sub", "ptof-info-cap", "ptof-info-cap2",
  "ptof-info-typ", "ptof-info-typ-nm", "ptof-info-typ-n", "ptof-info-oth", "ptof-info-oth-main",
  "ptof-info-oth-nm", "ptof-info-oth-grp", "ptof-info-oth-side", "ptof-info-oth-dt",
  "ptof-info-oth-lt", "ptof-info-empty", "ptof-note", "ptof-note-foot", "ptof-root"
], "every .ptof-* class our markup uses is declared in <style>");
/* the four earlier instances of this bug class in the Final were all "our
   markup uses one of HER classes under a root that never declares it". Here
   we deliberately reuse her classes unscoped, so the check is that the
   shell really declares each one. */
A.cssDeclares(shell.css, [
  "wt-row", "pto-l1", "pto-l2", "pto-l3", "pto-colhead", "pto-count-badge", "pto-abtn",
  "pto-abtn-appr", "pto-undo", "pto-appr-chip", "pto-datecol", "pto-hrcol", "pto-chev",
  "pto-emp-meta", "pto-emp-nm", "pto-dept-nm", "pto-numwrap", "pto-ctx", "pto-pill", "pto-caption",
  "pto-actioncol", "pto-l2-head", "pto-l2-action", "lr-main", "scroll", "filter-chip", "fc-label",
  "vtoggle", "vt", "pop", "cap", "mi", "mi-gap", "mi-nm", "kpi-row", "kpi-num", "metric-value",
  "gl-sub", "state", "state-title", "state-sub", "iconbtn", "sr-only", "modal", "modal-backdrop",
  "modal-h", "modal-title", "modal-b", "modal-f", "dep-hd", "dep-hd-top", "dep-hd-num",
  "dep-hd-kpigrp", "dep-hd-toggle"
], "every shell class we reuse is really declared in <style>");
/* the department control is HER chip, not a native select: the Final's own
   reason for the select ("no .filter-chip under .payf-root") does not hold
   in this file. */
A.absent(block, "<select", "the department filter is not a native select here");
A.contains(block, 'class="filter-chip ptof-deptchip" data-pto="pto-dept"', "the department filter is her .filter-chip, keyed to data-pto");
A.contains(shell.css, ".filter-chip[data-pto]{background:var(--wn-200)", "the [data-pto] chip carries the shell's secondary fill");
A.contains(shell.css, ".filter-chip[data-pto]::before{font-family:'Material Symbols Rounded';content:'filter_list'", "and the shell's leading filter glyph");
A.eq(count(shell.css, /\.filter-chip\[data-action\]/g), 3, "her own [data-action] chip selectors are untouched, all three of them");
/* no inline hex left anywhere in the render code */
A.ok(!/style="[^"]*#[0-9a-fA-F]{3,6}/.test(block), "no inline hex colour anywhere in our markup: every colour comes from a token");

/* ---------- 2. dataset truth, independently recomputed ---------------- */
console.log("\n[2] dataset");
const w0 = reset(W("ptoF"));
const flat = C.ptoFWorkFlat(w0);
A.eq(flat.length, 27, "27 day-lines in the working month (August)");
A.eq(flat.filter(function (f) { return f.st === "Pending"; }).length, 20, "20 of them pending");
A.eq(flat.filter(function (f) { return f.st === "Approved"; }).length, 7, "7 of them approved");
A.eq(C.ptoFPendingCount(w0), 20, "ptoFPendingCount is 20");
A.eq(C.ptoFOutstandingCount(w0), 2, "2 outstanding (pending and dated before the Aug 7 anchor)");
A.eq(C.ptoFPendingNotOutstanding(w0), 18, "18 pending and upcoming");
A.eq(C.ptoFOutstandingCount(w0) + C.ptoFPendingNotOutstanding(w0), C.ptoFPendingCount(w0), "the two Glance figures partition the pending set with no double count");
const outs = C.ptoFWorkFlat(w0).filter(function (f) { return C.ptoFIsOutstanding(w0, f); })
  .map(function (f) { return f.person + " Aug " + f.d; }).sort();
A.eq(outs.join(" | "), "Grace Lin Aug 1 | Kofi Mensah Aug 4", "the two outstanding day-lines are the expected ones");
A.eq(C.PTOF_GROUPS.length, 3, "3 pay groups");
A.eq(C.PTOF_GROUPS.reduce(function (a, g) { return a + g.people.length; }, 0), 7, "7 people");
A.eq(C.ptoFCalDepts(w0).join(","), "Admin,Facilities,Finance,IT,Ministry", "5 departments, alphabetical");
const deptCounts = C.ptoFCalDepts(w0).map(function (d) {
  return C.ptoFDistinctOut(C.ptoFMonthEntries(w0, 2026, 7).filter(function (f) { return f.dept === d; }));
});
A.eq(deptCounts.join("/"), "1/2/1/1/2", "department option counts for the displayed month");
A.eq(deptCounts.reduce(function (a, b) { return a + b; }, 0), 7, "which sum to the 7 people out");
A.eq(C.ptoFDistinctOut(C.ptoFMonthEntries(w0, 2026, 7)), 7, "and All departments reports the same 7");

/* ---------- 3. initial render at all three tiers ---------------------- */
console.log("\n[3] initial render, three tiers");
const rG = render(reset(W("ptoF_k")));
const rE = render(reset(W("ptoF")));
const rD = render(reset(W("ptoF_x")));
[["Glance", rG], ["Explore", rE], ["Detail", rD]].forEach(function (p) {
  A.ok(p[1] && p[1].length > 40, p[0] + " renders content");
  A.noEmDash(p[1], p[0] + " initial render");
});
A.contains(rG, "kpi-row ptof-glance", "Glance uses her .kpi-row");
A.absent(rG, "vtoggle", "Glance carries no view toggle");
A.absent(rG, "filter-chip", "Glance carries no filters at all");
A.contains(rE, 'class="dep-hd ptof-hd"', "Explore uses her two-row .dep-hd header");
A.contains(rE, 'class="dep-hd-toggle"', "with the view toggle in her right-hand toggle slot");
A.contains(rE, 'class="ptof-ctlrow"', "and the view-scoped controls on the left");
A.contains(rE, "wt-row pto-l1", "the queue rows sit on her .wt-row / .pto-l1 chassis");
A.contains(rD, "wt-row pto-l1", "same at Detail");

/* ---------- 4. the view toggle ---------------------------------------- */
console.log("\n[4] view toggle");
const wv = reset(W("ptoF"));
const beforeV = render(wv);
shim.fire("pto-view", { "data-id": "ptoF", "data-v": "calendar" });
A.eq(wv.ptofView, "calendar", "the toggle sets the calendar view");
const afterV = render(wv);
A.changed(beforeV, afterV, "the output changes with the view");
A.contains(afterV, "ptof-grid", "the calendar renders a grid");
A.absent(afterV, "wt-row pto-l1", "and no queue rows");
shim.fire("pto-view", { "data-id": "ptoF", "data-v": "queue" });
A.eq(wv.ptofView, "queue", "and back to the queue");
A.same(render(wv), beforeV, "returning to the queue restores the same output");
shim.fire("pto-view", { "data-id": "ptoF", "data-v": "queue" });
A.eq(wv.ptofView, "queue", "clicking the active segment is a no-op");

/* ---------- 5. the Status toggle, and the counts that must NOT move --- */
console.log("\n[5] Status filter, and the counts it must not move");
/* at Detail: the Explore cap legitimately changes WHICH people are listed
   under a different filter, which would confound a badge-by-badge compare. */
const ws = reset(W("ptoF_x"));
C.PTOF_GROUPS.forEach(function (g) { g.people.forEach(function (p) { ws.ptofOpen[g.pg + "|" + p.name] = true; }); });
const pend = render(ws);
A.eq(dayLines(pend).length, 20, "Pending (the default) shows 20 day-lines");
shim.fire("pto-status", { "data-id": "ptoF_x", "data-v": "approved" });
const appr = render(ws);
A.eq(ws.ptofStatus, "approved", "the toggle sets the status");
A.eq(dayLines(appr).length, 7, "Approved shows 7 day-lines");
shim.fire("pto-status", { "data-id": "ptoF_x", "data-v": "all" });
const alls = render(ws);
A.eq(dayLines(alls).length, 27, "All shows all 27 day-lines");
A.changed(pend, appr, "the rows change with the filter");
/* the deliberate part: the header, group and person counts are computed
   over the unfiltered working month, so they do not move. */
const hdrN = function (h) { const m = /<span class="metric-value">(\d+)<\/span>/.exec(h); return m && m[1]; };
A.eq(hdrN(pend), "20", "header pending figure under Pending");
A.eq(hdrN(appr), "20", "header pending figure under Approved is STILL 20");
A.eq(hdrN(alls), "20", "header pending figure under All is STILL 20");
/* The Status filter legitimately changes WHICH groups and people are listed
   (Approved lists only people who have an approved day). The claim under test
   is the other one: for every group and person present in BOTH renders, the
   pending badge VALUE is identical, because it is computed over the
   unfiltered working month. Compared on the intersection, per key. */
const badgeMap = function (html) {
  const m = {};
  /* split per row, so a person whose badge is the "All resolved" chip rather
     than a count cannot make the scan borrow the NEXT row's count */
  String(html).split('<div class="wt-row').forEach(function (chunk) {
    const nm = /pto-(?:dept-nm|emp-nm)">([^<]+)</.exec(chunk);
    if (!nm) return;
    const c = /pto-count-badge(?: ok)?">([^<]+)</.exec(chunk);
    const r = /pto-appr-chip">[\s\S]*?<\/span>([^<]+)</.exec(chunk);
    const v = c ? c[1] : (r ? r[1] : null);
    if (v !== null && !(nm[1] in m)) m[nm[1]] = v;
  });
  return m;
};
const bp = badgeMap(pend), ba = badgeMap(appr), bl = badgeMap(alls);
const shared = Object.keys(bp).filter(function (k) { return k in ba; });
A.ok(shared.length >= 6, "at least six groups and people appear under both Pending and Approved (" + shared.length + ")");
shared.forEach(function (k) { A.same(ba[k], bp[k], "the pending badge for " + k + " does not move between Pending and Approved"); });
Object.keys(bp).forEach(function (k) { A.same(bl[k], bp[k], "nor for " + k + " between Pending and All"); });
A.eq(bp["Ministry"], "8 pending", "Ministry's group badge is 8 under every filter");
A.eq(bp["Thomas Ade"], "4 pending", "Thomas Ade's person badge is 4 under every filter");
A.ok(!("Priya Nandakumar" in bp), "a person with nothing pending is absent from the Pending queue entirely");
A.eq(bl["Priya Nandakumar"], "All resolved", "and under All she reads her All resolved chip, not a silent zero");
A.eq(bl["Admin"], "All approved", "and her group's badge states the other outcome in words too");
A.eq(C.ptoFGroupPending(ws, "Ministry"), 8, "ptoFGroupPending runs over the unfiltered month (Ministry: Thomas 4 + Grace 4 = 8)");
A.eq(C.ptoFPersonPending(ws, "Monthly Clergy|Grace Lin"), 4, "ptoFPersonPending likewise (Grace Lin: 4)");

/* ---------- 6. Group by: regroups the queue, absent from the calendar - */
console.log("\n[6] Group by");
const wg = reset(W("ptoF"), { ptofStatus: "all" });
const byDept = render(wg);
A.eq(groups(byDept).join(","), "Admin,Facilities,Finance,IT,Ministry", "grouped by Department, alphabetical (and capped at 6 people, so all 5 groups appear)");
shim.fire("pto-qgroup", { "data-id": "ptoF", "data-v": "paygroup" });
A.eq(wg.ptofQueueGroup, "paygroup", "the toggle sets the grouping");
const byPg = render(wg);
A.eq(groups(byPg).join(","), "Weekly Staff,Monthly Clergy,Seasonal", "grouped by Pay Group, in source order (the documented alphabetical group sort is a known build gap, Step 4 row 12)");
A.changed(byDept, byPg, "regrouping changes the output");
A.contains(byDept, "Weekly Staff", "under Department, the pay group is the quiet secondary label");
A.contains(byPg, "Finance", "under Pay Group, the department is the quiet secondary label");
/* v3.3: the control does not exist on the calendar, and neither does its handler */
const wcal = reset(W("ptoF"), { ptofView: "calendar" });
const calHtml = render(wcal);
A.absent(calHtml, "pto-qgroup", "the calendar carries NO Group by control");
A.absent(calHtml, "Group by", "not even the label");
A.contains(calHtml, 'data-pto="pto-dept"', "the calendar's own control is the Department chip");
A.absent(code, "calgroup", "and the calgroup handler was removed with the control");
A.eq(count(block, /ptoFCalGroupVal/g), 2, "ptoFCalGroupVal survives as a single definition with a single call site in ptoFMarker");

/* ---------- 7. the person expander ----------------------------------- */
console.log("\n[7] person expander");
const we = reset(W("ptoF_x"));   /* Detail: no people cap to confound the counts */
const shut = render(we);
A.eq(dayLines(shut).length, 0, "every person is collapsed by default, so no day-lines render");
A.contains(shut, 'aria-expanded="false"', "and the row reports itself collapsed");
A.absent(shut, "pto-colhead", "the column header only exists inside an open person");
shim.fire("pto-person", { "data-id": "ptoF_x", "data-person": "Monthly Clergy|Grace Lin" });
A.eq(we.ptofOpen["Monthly Clergy|Grace Lin"], true, "clicking a person opens it");
const open1 = render(we);
A.eq(dayLines(open1).length, 4, "Grace Lin's 4 pending day-lines appear");
A.contains(open1, "pto-colhead", "with her Date / Type / Hrs / Status column header");
A.contains(open1, 'class="wt-row pto-l2 open"', "and the row carries her .open state for the caret rotation");
A.eq(count(open1, /class="pto-chev open"/g), 1, "exactly one caret is rotated");
shim.fire("pto-person", { "data-id": "ptoF_x", "data-person": "Weekly Staff|Dana Whitfield" });
A.eq(dayLines(render(we)).length, 7, "opening a second person adds only that person's days (4 + 3)");
A.eq(Object.keys(we.ptofOpen).length, 2, "expansion state is per person, and both are held");
/* it survives a filter change and a grouping change */
shim.fire("pto-status", { "data-id": "ptoF_x", "data-v": "all" });
A.eq(Object.keys(we.ptofOpen).length, 2, "expansion survives a Status change");
A.eq(dayLines(render(we)).length, 8, "and now shows both people's full day lists (Dana 4 + Grace 4)");
shim.fire("pto-qgroup", { "data-id": "ptoF_x", "data-v": "paygroup" });
A.eq(Object.keys(we.ptofOpen).length, 2, "expansion survives a Group by change");
A.eq(dayLines(render(we)).length, 8, "with the same day-lines, regrouped");
shim.fire("pto-person", { "data-id": "ptoF_x", "data-person": "Monthly Clergy|Grace Lin" });
A.ok(!we.ptofOpen["Monthly Clergy|Grace Lin"], "clicking again closes that person");
A.eq(dayLines(render(we)).length, 4, "and only Dana's 4 days remain");
/* keyboard: the row is role=button on a span, so Enter must reach the handler */
const wk = reset(W("ptoF"));
shim.fireKey("Enter", { "data-pto": "pto-person", "data-id": "ptoF", "data-person": "Weekly Staff|Marcus Bell", role: "button" }, "span");
A.eq(wk.ptofOpen["Weekly Staff|Marcus Bell"], true, "Enter on the person row opens it (it is role=button on a span)");

/* ---------- 8. per-day Approve and Undo ------------------------------- */
console.log("\n[8] per-day Approve and Undo");
const wa = reset(W("ptoF_x"), { ptofStatus: "all" });   /* Detail: Grace is the person the Explore cap withholds */
wa.ptofOpen["Monthly Clergy|Grace Lin"] = true;
const gid = C.ptoFWorkFlat(wa).filter(function (f) { return f.person === "Grace Lin" && f.d === 11; })[0]._id;
const b4 = render(wa);
A.eq(C.ptoFPendingCount(wa), 20, "20 pending before");
A.contains(b4, 'data-pto="pto-approve" data-id="ptoF_x" data-day="' + gid + '"', "the pending day offers Approve");
shim.fire("pto-approve", { "data-id": "ptoF_x", "data-day": gid });
A.eq(wa.ptofAppr[gid], "Approved", "Approve flips exactly that one day");
A.eq(C.ptoFPendingCount(wa), 19, "the pending count drops by exactly one");
const af = render(wa);
A.contains(af, "Approved by You, Aug 7", "and the row now reads Approved by the current user with a date");
A.contains(af, 'data-pto="pto-unapprove" data-id="ptoF_x" data-day="' + gid + '"', "with an Undo in place of Approve");
A.contains(af, "wt-row pto-l3 appr", "and picks up her approved-row tint");
shim.fire("pto-unapprove", { "data-id": "ptoF_x", "data-day": gid });
A.eq(wa.ptofAppr[gid], "Pending", "Undo returns it to Pending");
A.eq(C.ptoFPendingCount(wa), 20, "and the count returns to 20");
A.same(render(wa), b4, "the rendered queue returns to exactly its previous state");
/* approving an OUTSTANDING day clears the outstanding state, it is derived */
const wo = reset(W("ptoF"));
const oid = C.ptoFWorkFlat(wo).filter(function (f) { return f.person === "Grace Lin" && f.d === 1; })[0]._id;
A.eq(C.ptoFOutstandingCount(wo), 2, "2 outstanding before");
shim.fire("pto-approve", { "data-id": "ptoF", "data-day": oid });
A.eq(C.ptoFOutstandingCount(wo), 1, "approving an outstanding day clears it: outstanding is derived, not stored");
A.eq(C.ptoFPendingNotOutstanding(wo), 18, "and the upcoming-pending figure is unaffected");

/* ---------- 9. NO bulk approve, anywhere ------------------------------ */
console.log("\n[9] no bulk approve control exists (v3.0 removed it)");
A.absent(code, "approve-person", "no approve-person action string anywhere in the executable block");
A.absent(code, "Approve all", "no 'Approve all' copy anywhere in the executable block");
A.absent(code, "pto-approve-emp", "and none of Jo's own bulk actions either");
let bulkFound = 0, bulkStates = 0;
["ptoF", "ptoF_k", "ptoF_x", "ptoF2", "ptoF3"].forEach(function (id) {
  ["queue", "calendar"].forEach(function (v) {
    ["all", "pending", "approved"].forEach(function (st) {
      ["dept", "paygroup"].forEach(function (g) {
        const w = reset(W(id), { ptofView: v, ptofStatus: st, ptofQueueGroup: g });
        C.PTOF_GROUPS.forEach(function (gg) { gg.people.forEach(function (p) { w.ptofOpen[gg.pg + "|" + p.name] = true; }); });
        const h = render(w);
        bulkStates++;
        if (/Approve all|approve-person|approve-emp/.test(h)) bulkFound++;
      });
    });
  });
});
A.eq(bulkFound, 0, "no bulk approve control in any of " + bulkStates + " rendered states");
A.eq(count(code, /data-pto="pto-approve"/g), 1, "the only approve action in the block is the per-day one");

/* ---------- 10. the two Glance figures -------------------------------- */
console.log("\n[10] Glance");
const wgl = reset(W("ptoF_k"));
const gl = render(wgl);
A.contains(gl, '<div class="metric-value ptof-num-pend">18</div>', "the Pending figure is 18");
A.contains(gl, '<div class="metric-value ptof-num-out">2</div>', "the Outstanding figure is 2");
A.contains(gl, "ptof-kpi-div", "with a rule between the two");
A.eq(count(gl, /class="metric-value/g), 2, "exactly two figures, side by side");
A.contains(gl, ">Pending<", "each labelled");
A.contains(gl, ">Outstanding<", "each labelled");
A.absent(gl, "Out this week", "the dropped 'Out this week' secondary is not here");
/* mutual exclusivity, asserted at the unit level too */
const upcoming = C.ptoFWorkFlat(wgl).filter(function (f) { return C.ptoFEff(wgl, f) === "Pending" && !C.ptoFDateBeforeToday(f); });
const overdue = C.ptoFWorkFlat(wgl).filter(function (f) { return C.ptoFIsOutstanding(wgl, f); });
A.eq(upcoming.filter(function (f) { return overdue.indexOf(f) > -1; }).length, 0, "no day-line is counted in both figures");
const zeroG = render(reset(W("ptoF3"), { size: "kpi" }));
A.eq(count(zeroG, /ptof-num-zero">0</g), 2, "the no-records Glance renders two muted zeros, not blanks");
A.contains(zeroG, ">Pending<", "still labelled Pending");
A.contains(zeroG, ">Outstanding<", "and Outstanding");

/* ---------- 11. the Leave Calendar ----------------------------------- */
console.log("\n[11] Leave Calendar");
const wc = reset(W("ptoF"), { ptofView: "calendar" });
const cal = render(wc);
A.contains(cal, "August 2026", "opens on the working month");
A.eq(count(cal, /class="ptof-wkc">/g), 7, "seven weekday column headers");
A.contains(cal, '<div class="ptof-wkc">S</div>', "single-letter headers at Explore");
/* the class name is a prefix of .ptof-daynum, so the boundary matters */
A.eq(count(cal, /class="ptof-day[ "]/g), 42, "a real 6 x 7 month grid: 31 August days plus 11 adjacent-month days");
A.eq(count(cal, /class="ptof-day oth"/g), 11, "11 adjacent-month days, greyed");
A.contains(cal, "ptof-day st-outstanding", "Aug 1 and Aug 4 carry the outstanding cell state");
A.contains(cal, "ptof-day st-pending", "future pending days carry the pending cell state");
A.contains(cal, "ptof-day st-approved", "approved-only days carry the approved cell state");
/* today: a pill on the NUMBER, so the cell geometry never changes */
A.contains(cal, 'class="ptof-day st-pending today"', "today (Aug 7, a pending day) is marked, its status class intact");
A.contains(shell.css, ".ptof-day.today .ptof-daynum{background:var(--brand-100)", "today is a pill on the day NUMBER");
A.ok(!/\.ptof-day\.today\{[^}]*border/.test(shell.css), "and never overrides the cell border, so it cannot resize its own cell");
A.contains(shell.css, ".ptof-day{border:1px solid var(--stroke-widget)", "the cell border is a uniform 1px");
/* CALENDAR FIT, 2026-09-18: these three pinned the sizing that caused the
   overflow. The row rule is no longer minmax(floor,auto) but minmax(floor,1fr),
   and the floors dropped from 44/62 to 36/44. Updated, not loosened: each still
   asserts an exact rule. */
A.contains(shell.css, "grid-auto-rows:minmax(var(--ptof-cell),1fr)", "week rows take an equal share of the leftover height");
A.contains(shell.css, ".ptof-cal{display:flex;flex-direction:column;min-height:0;flex:1 1 auto;--ptof-cell:36px;}", "36px row floor at Explore");
A.contains(shell.css, ".ptof-cal-t-detail{--ptof-cell:44px;}", "44px row floor at Detail");
A.contains(cal, "ptof-cal-t-explore", "the Explore grid carries its tier class");
/* one visual channel for status, and the one deliberate exception */
A.contains(shell.css, ".ptof-day.st-approved{box-shadow:inset 3px 0 0 var(--ptof-st-appr);}", "approved is the accent bar alone, no cell fill");
A.contains(shell.css, ".ptof-day.st-pending{box-shadow:inset 3px 0 0 var(--ptof-st-pend);}", "pending likewise");
A.contains(shell.css, ".ptof-day.st-outstanding{background:var(--ptof-out-wash)", "outstanding is the one exception and also gets a wash");
A.contains(shell.css, "--ptof-out-wash:rgba(176,58,58,.04)", "the wash is the weakened 0.04 the owner asked for");
A.contains(shell.css, "--ptof-out-wash-hover:rgba(176,58,58,.09)", "and 0.09 on hover");
/* markers are initials coloured by their OWN status */
A.contains(cal, '<span class="ptof-mark-tx">GL</span>', "a marker is the person's initials (Grace Lin reads GL)");
A.contains(cal, '<span class="ptof-mark-tx">DW</span>', "Dana Whitfield reads DW");
A.contains(cal, "ptof-mark ptof-mst-outstanding", "and takes its own state class");
A.contains(cal, "ptof-mark ptof-mst-pending", "for each state present");
A.contains(cal, "ptof-mark ptof-mst-approved", "for each state present");
A.eq(count(cal, /class="material-symbols-rounded">(vacation|sick|beach_access)/g), 0, "markers carry zero leave-type icons");
/* the priority rule: Aug 4 mixes an outstanding and an approved person, so
   the CELL is outstanding while the markers stay their own colours */
A.eq(C.ptoFDayStatus(C.ptoFCalEntries(wc, 2026, 7).filter(function (f) { return f.d <= 4 && f.dEnd >= 4; }), wc), "outstanding",
  "Aug 4 mixes Outstanding and Approved, and the cell takes the Outstanding priority colour");
A.eq(C.ptoFCalEntries(wc, 2026, 7).filter(function (f) { return f.d === 3; }).length, 1, "Aug 3 has exactly one person out, approved");
A.eq(C.ptoFDayStatus(C.ptoFCalEntries(wc, 2026, 7).filter(function (f) { return f.d === 3; }), wc), "approved",
  "an approved-only day reads approved, and a PAST approved day is not outstanding");
A.eq(C.ptoFDayStatus(C.ptoFCalEntries(wc, 2026, 7).filter(function (f) { return f.d === 20; }), wc), "pending",
  "Aug 20 mixes Thomas pending with Elena approved, so it reads pending by priority");
A.eq(C.ptoFDayStatus(C.ptoFCalEntries(wc, 2026, 7).filter(function (f) { return f.d <= 18 && f.dEnd >= 18; }), wc), "pending",
  "a future pending day reads pending");
A.eq(C.ptoFDayStatusLabel("outstanding"), "some outstanding", "and the day cell names its state in words, not colour alone");
A.contains(cal, "some outstanding", "which reaches the rendered aria-label");
/* +N past the per-tier marker cap: Aug 13 has three people out */
A.eq(C.ptoFDistinctOut(C.ptoFCalEntries(wc, 2026, 7).filter(function (f) { return f.d <= 13 && f.dEnd >= 13; })), 3, "Aug 13 has 3 people out");
A.contains(cal, 'class="ptof-more" title="1 more out this day">+1', "Explore caps at 2 markers and shows a real +1 chip");
const calD = render(reset(W("ptoF_x"), { ptofView: "calendar" }));
A.absent(calD, 'class="ptof-more"', "Detail caps at 3 markers, so Aug 13 needs no +N");
A.contains(calD, '<div class="ptof-wkc">Sun</div>', "three-letter weekday headers at Detail");
A.contains(calD, "ptof-cal-t-detail", "and the Detail tier class");
/* month navigation */
shim.fire("pto-cal-next", { "data-id": "ptoF" });
A.eq(wc.ptofCalM, 8, "next moves to September");
A.contains(render(wc), "September 2026", "and the title follows");
shim.fire("pto-cal-prev", { "data-id": "ptoF" });
shim.fire("pto-cal-prev", { "data-id": "ptoF" });
A.eq(wc.ptofCalM, 6, "two prev clicks reach July");
A.contains(render(wc), "July 2026", "and the title follows");
reset(wc, { ptofView: "calendar", ptofCalY: 2026, ptofCalM: 0 });
shim.fire("pto-cal-prev", { "data-id": "ptoF" });
A.eq(wc.ptofCalY + "-" + wc.ptofCalM, "2025-11", "prev from January rolls the year back");
reset(wc, { ptofView: "calendar", ptofCalY: 2026, ptofCalM: 11 });
shim.fire("pto-cal-next", { "data-id": "ptoF" });
A.eq(wc.ptofCalY + "-" + wc.ptofCalM, "2027-0", "next from December rolls the year forward");
/* an empty month is a clean state, not a blank or a throw */
reset(wc, { ptofView: "calendar", ptofCalY: 2026, ptofCalM: 10 });
const emptyMonth = render(wc);
A.contains(emptyMonth, "No time off scheduled in November", "an empty month gets its own state");
A.contains(emptyMonth, "Use the arrows to browse other months.", "pointing at month navigation");
A.contains(emptyMonth, "ptof-legend", "with the legend still shown");
/* the legend documents the colour key in words */
A.contains(cal, "Colour = status", "the legend caption");
["Approved", "Pending", "Outstanding"].forEach(function (s) {
  A.contains(cal, 'ptof-legend-item ptof-lg-', "the legend lists a state item");
  A.contains(cal, ">" + s + "</span>", "the legend names " + s + " in words");
});

/* ---------- 12. the day-detail popover ------------------------------- */
console.log("\n[12] day-detail popover");
const wd = reset(W("ptoF"), { ptofView: "calendar" });
A.eq(ovl(), "", "no overlay before anything is clicked");
shim.fire("pto-day", { "data-id": "ptoF", "data-day": "13" });
let dd = ovl();
A.ok(C.PTOF_DAY && C.PTOF_DAY.d === 13, "clicking a day cell opens the day detail");
A.contains(dd, "modal-backdrop", "on her .modal-backdrop card");
A.contains(dd, 'role="dialog" aria-modal="true"', "as a real dialog");
A.contains(dd, "Thu, Aug 13", "titled with the weekday and date");
A.eq(count(dd, /class="ptof-dd-nm">/g), 3, "listing all 3 people out that day");
A.contains(dd, "Department: Finance &middot; Pay Group: Weekly Staff", "each with BOTH department and pay group");
A.contains(dd, "Vacation &middot; 8 h", "leave type as text plus hours");
A.contains(dd, "ptof-chip ptof-chip-pend", "and the status chip");
A.contains(dd, "Approvals are handled in the Approval Queue.", "informational only, with the footer pointing to the queue");
A.absent(dd, "pto-approve", "no approve action inside the popover");
A.noEmDash(dd, "day-detail popover");
/* the day whose popover is open is marked selected */
A.contains(render(wd), 'class="ptof-day st-pending sel"', "the open day's cell is marked selected, which the calendar previously never showed");
/* a marker click pre-focuses that person */
shim.fire("pto-ovl-close", {});
const eid = C.ptoFCalEntries(wd, 2026, 7).filter(function (f) { return f.person === "Elena Sokolova" && f.d === 13; })[0]._id;
shim.fire("pto-mark", { "data-id": "ptoF", "data-day": "13", "data-eid": eid });
dd = ovl();
A.ok(C.PTOF_DAY && C.PTOF_DAY.focusId === eid, "a marker click carries the entry id through");
A.contains(dd, "ptof-dd-row ptof-dd-focus", "and pre-focuses that person's row");
A.eq(count(dd, /ptof-dd-focus/g), 1, "exactly one row is focused");
/* three ways out */
shim.fire("pto-ovl-close", {});
A.eq(ovl(), "", "the close control dismisses it");
shim.fire("pto-day", { "data-id": "ptoF", "data-day": "13" });
A.ok(ovl().length > 0, "reopened");
shim.fire("pto-ovl-close", {});           /* the backdrop carries the same action */
A.eq(ovl(), "", "click-away on the backdrop dismisses it");
shim.fire("pto-day", { "data-id": "ptoF", "data-day": "13" });
shim.fireKey("Escape");
A.eq(ovl(), "", "Escape dismisses it");
A.ok(C.PTOF_DAY === null, "and clears the state");
/* keyboard reachable: the day cell is role=button on a div */
shim.fireKey("Enter", { "data-pto": "pto-day", "data-id": "ptoF", "data-day": "18", role: "button" }, "div");
A.ok(C.PTOF_DAY && C.PTOF_DAY.d === 18, "Enter on a day cell opens the detail");
shim.fireKey("Escape");
/* an empty day is not clickable */
A.ok(C.ptoFCalEntries(wd, 2026, 7).filter(function (f) { return f.d <= 9 && f.dEnd >= 9; }).length === 0, "Aug 9 has nobody out");
A.absent(cal, 'data-day="9" role="button"', "so it carries no click affordance");

/* ---------- 13. the per-person Info popover -------------------------- */
console.log("\n[13] per-person Info popover");
const wi = reset(W("ptoF"));
A.contains(render(wi), 'class="pto-abtn ptof-abtn-info" data-pto="pto-info"', "Info is a real labelled button on her .pto-abtn chassis");
A.contains(render(wi), "pto-actioncol pto-l2-action", "sitting in the same action column Approve uses");
A.eq(count(render(wi), /ptof-abtn-info/g), 6, "one per person row");
shim.fire("pto-info", { "data-id": "ptoF", "data-person": "Weekly Staff|Dana Whitfield" });
let inf = ovl();
A.ok(C.PTOF_INFO && C.PTOF_INFO.pk === "Weekly Staff|Dana Whitfield", "the button opens the Info panel");
A.contains(inf, ">Dana Whitfield<", "headed by the person's name");
A.contains(inf, 'class="ptof-info-hd-sub">Finance &middot; Weekly Staff<', "with her own department and pay group beside it");
A.contains(inf, "Time off this year (2026)", "section (a): this year's totals by leave type");
["Vacation", "Sick", "Personal", "Misc"].forEach(function (t) {
  A.contains(inf, '<span class="ptof-info-typ-nm">' + t + "</span>", "enumerating " + t);
});
A.eq(C.ptoFPersonYearTotal(wi, "Weekly Staff|Dana Whitfield"), 12, "Dana's year total is 12 days (Aug 3, Aug 12 to 14, Jul 28 to 31, Jan 2 to 3, Mar 10, May 20)");
A.contains(inf, "12 days total", "which the panel states");
const dby = C.ptoFPersonYearByType(wi, "Weekly Staff|Dana Whitfield");
A.eq(dby.Vacation + "/" + dby.Sick + "/" + dby.Personal + "/" + dby.Misc, "9/2/1/0", "split by leave type");
A.contains(inf, "Also off during these dates", "section (b): the coverage-overlap list");
A.contains(inf, "ptof-info-oth-nm", "with real overlap rows");
const ov = C.ptoFOverlapStaff(wi, "Weekly Staff|Dana Whitfield");
A.ok(ov.length > 0, "Dana overlaps someone (Elena Aug 13 and Grace Aug 13 to 14)");
A.eq(ov[0].person, "Elena Sokolova", "sorted by name, so Elena comes before Grace");
A.ok(ov.some(function (o) { return o.person === "Grace Lin"; }), "and Grace Lin is in the list too");
A.ok(ov.every(function (o) { return o.dept && o.pg && o.dates && o.type && o.status; }), "each overlap row carries name, department, pay group, dates, type and status");
A.contains(inf, "Coverage overlap, informational only.", "informational only");
A.absent(inf, "pto-approve", "no approve action inside the Info panel");
A.noEmDash(inf, "Info popover");
/* the empty case */
shim.fire("pto-ovl-close", {});
shim.fire("pto-info", { "data-id": "ptoF", "data-person": "Weekly Staff|Priya Nandakumar" });
inf = ovl();
A.eq(C.ptoFOverlapStaff(wi, "Weekly Staff|Priya Nandakumar").length, 0, "Priya overlaps nobody");
A.contains(inf, "No one else is off during these dates.", "so the panel says so, cleanly");
A.contains(inf, "ptof-info-empty", "in the empty-state class");
/* dismissal, all three ways */
shim.fire("pto-ovl-close", {});
A.eq(ovl(), "", "the close control dismisses it");
shim.fire("pto-info", { "data-id": "ptoF", "data-person": "Weekly Staff|Dana Whitfield" });
shim.fireKey("Escape");
A.eq(ovl(), "", "Escape dismisses it");
A.ok(C.PTOF_INFO === null, "and clears the state");
/* the two popovers are mutually exclusive */
shim.fire("pto-info", { "data-id": "ptoF", "data-person": "Weekly Staff|Dana Whitfield" });
shim.fire("pto-day", { "data-id": "ptoF", "data-day": "13" });
A.ok(C.PTOF_INFO === null && C.PTOF_DAY !== null, "opening one closes the other");
shim.fireKey("Escape");

/* ---------- 14. the Department filter, and what it must NOT touch ----- */
console.log("\n[14] Department filter (calendar only)");
const wf = reset(W("ptoF"), { ptofView: "calendar" });
shim.fire("pto-dept", { "data-id": "ptoF" });
let menu = popEl();
A.ok(C.PTOF_POP && C.PTOF_POP.id === "ptoF", "the chip opens a menu");
A.contains(menu, '<div class="cap">Department</div>', "on the shell's .pop / .cap card");
A.contains(menu, "All departments (7)", "All departments, carrying the count of PEOPLE out this month");
["Admin (1)", "Facilities (2)", "Finance (1)", "IT (1)", "Ministry (2)"].forEach(function (o) {
  A.contains(menu, o, "option " + o + ", derived from the data with its people count");
});
/* .mi is a prefix of .mi-gap and .mi-nm, so count the action instead */
A.eq(count(menu, /data-pto="pto-set-dept"/g), 6, "six options, All plus the five departments in the data");
A.contains(menu, 'class="mi check"', "the current selection is checked");
shim.fire("pto-set-dept", { "data-id": "ptoF", "data-v": "Ministry" });
A.eq(wf.ptofCalDept, "Ministry", "picking an option sets the filter");
A.eq(popEl(), "", "and closes the menu");
const filtered = render(wf);
A.contains(filtered, "filtered to Ministry", "the summary line says it is filtered");
A.contains(filtered, "<strong>2 people</strong> out across 1 department", "and reports only Ministry's 2 people");
A.eq(count(filtered, /class="ptof-mark-tx">/g) > 0, true, "the grid still draws markers");
A.absent(filtered, '<span class="ptof-mark-tx">DW</span>', "but Dana Whitfield (Finance) is gone from the grid");
A.contains(filtered, '<span class="ptof-mark-tx">GL</span>', "while Grace Lin (Ministry) remains");
A.contains(filtered, "ptof-legend", "the legend still renders under a filter");
A.contains(filtered, '<span class="fc-label">Ministry</span>', "the chip label names the current department");
A.eq(C.ptoFCalDeptLabel(wf), "Ministry", "and ptoFCalDeptLabel agrees");
A.eq(C.ptoFCalDeptLabel(reset(W("ptoF2"), { ptofCalDept: "all" })), "All departments", "with All departments as the default label");
/* it reaches the day-detail popover too */
shim.fire("pto-day", { "data-id": "ptoF", "data-day": "13" });
const fdd = ovl();
A.eq(count(fdd, /class="ptof-dd-nm">/g), 1, "clicking Aug 13 while filtered to Ministry lists 1 person, not 3");
A.contains(fdd, ">Grace Lin<", "the right one");
/* changing the filter closes an open popover */
shim.fire("pto-dept", { "data-id": "ptoF" });
shim.fire("pto-set-dept", { "data-id": "ptoF", "data-v": "Finance" });
A.eq(ovl(), "", "changing the filter closes any open day popover");
A.ok(C.PTOF_DAY === null, "and clears its state, so it cannot show excluded people");
/* the filter survives month navigation rather than silently clearing */
shim.fire("pto-cal-next", { "data-id": "ptoF" });
A.eq(wf.ptofCalDept, "Finance", "the selection survives month navigation (Step 5 cascade rule: kept, not cleared)");
/* THE NEGATIVE CLAIM: it is calendar-scoped by construction */
A.eq(count(block, /ptoFCalEntries\(/g), 3, "ptoFCalEntries has exactly two call sites, ptoFCalendar and ptoFDayDetailHTML");
A.contains(block, "function ptoFWorkFlat(w){return ptoFMonthEntries(w,PTOF_WORK_Y,PTOF_WORK_M);}", "the queue and Glance go through ptoFMonthEntries, which the filter never touches");
const wq1 = reset(W("ptoF"), { ptofCalDept: "all" });
const queueUnfiltered = render(wq1);
const glanceUnfiltered = render(reset(W("ptoF_k"), { ptofCalDept: "all" }));
["Admin", "Facilities", "Finance", "IT", "Ministry"].forEach(function (d) {
  const wq = reset(W("ptoF"), { ptofCalDept: d });
  A.same(render(wq), queueUnfiltered, "the queue renders byte-identically with the filter set to " + d);
  A.same(render(reset(W("ptoF_k"), { ptofCalDept: d })), glanceUnfiltered, "and so does the Glance, with the filter set to " + d);
  A.eq(C.ptoFPendingCount(wq), 20, "the queue's pending count is untouched under " + d);
  A.eq(C.ptoFOutstandingCount(wq), 2, "and the Outstanding figure too, under " + d);
});
/* the chip does not exist on the queue */
A.absent(queueUnfiltered, 'data-pto="pto-dept"', "the Department chip does not appear on the Approval Queue");
/* menu dismissal */
shim.fire("pto-dept", { "data-id": "ptoF" });
A.ok(popEl().length > 0, "menu open");
shim.fireOutside();
A.eq(popEl(), "", "an outside click closes the menu");
shim.fire("pto-dept", { "data-id": "ptoF" });
shim.fire("pto-dept", { "data-id": "ptoF" });
A.eq(popEl(), "", "clicking the chip again toggles the menu shut");
shim.fire("pto-dept", { "data-id": "ptoF" });
shim.fireKey("Escape");
A.eq(popEl(), "", "Escape closes the menu");
shim.fire("pto-dept", { "data-id": "ptoF" });
shim.fireWindow("resize");
A.ok(true, "a window resize repositions the menu without throwing");
C.ptoFClosePop();

/* ---------- 15. the two calendar empty states are distinct ------------ */
console.log("\n[15] two distinct calendar empty states");
const we1 = reset(W("ptoF"), { ptofView: "calendar", ptofCalM: 10 });
const emptyM = render(we1);
const we2 = reset(W("ptoF"), { ptofView: "calendar", ptofCalM: 7, ptofCalDept: "Admin" });
/* Admin has one person out in August, so filter to a month where it has none */
const we3 = reset(W("ptoF"), { ptofView: "calendar", ptofCalM: 8, ptofCalDept: "Admin" });
const emptyF = render(we3);
A.eq(C.ptoFCalEntries(we3, 2026, 8).length, 0, "Admin has nothing in September");
A.ok(C.ptoFMonthEntries(we3, 2026, 8).length > 0, "while the month itself is not empty");
A.contains(emptyF, "No time off in Admin in September", "the filtered miss names the department and the month");
A.contains(emptyF, "Switch to All departments to see it.", "and points back to All departments");
A.contains(emptyM, "No time off scheduled in November", "the empty month says something different");
A.contains(emptyM, "Use the arrows to browse other months.", "and points at month navigation instead");
A.changed(emptyM, emptyF, "the two empty states are genuinely distinct");
A.contains(emptyF, 'class="state ptof-cal-empty" data-kind="empty"', "both sit on her .state card");
A.noEmDash(emptyF, "filtered-miss empty state");
A.noEmDash(emptyM, "empty-month state");

/* ---------- 16. the Explore people cap ------------------------------- */
console.log("\n[16] Explore caps at 6 PEOPLE, Detail does not cap");
const wcap = reset(W("ptoF"), { ptofStatus: "all" });
const capE = render(wcap);
A.eq(people(capE).length, 6, "Explore shows 6 people");
/* BUILD GAP FOUND DURING THIS PORT, carried faithfully rather than
   silently fixed, the same way Step 4 row 12's sort gap is carried.
   The CAP unit is correctly PEOPLE (6 shown, 1 withheld, shown whole), but
   the NOTE's N counts the withheld person's DAY-LINES, not people: Grace
   Lin has 4 August day-lines, so the note reads "4 more" when one person
   remains. Cause, in the Final and here: seenP[pk] stores false for an
   excluded person, so the guard `if(!seenP[u.pk])` cannot tell "unseen"
   from "seen and excluded" and the counter block re-runs on every later
   unit of that person. Reported to the owner, not patched here. */
A.contains(capE, '<div class="ptof-more-note">4 more in Detail size</div>', "an N-more note renders (carrying the Final's day-line-counting defect: 4, not 1)");
A.eq(allPeopleWithheld(capE).length, 1, "exactly ONE person is actually withheld, which is what the note should have said");
const wcapD = reset(W("ptoF_x"), { ptofStatus: "all" });
const capD = render(wcapD);
A.eq(people(capD).length, 7, "Detail shows all 7 people");
A.absent(capD, "ptof-more-note", "and carries no cap note");
/* the cap unit is PEOPLE, not day-lines: open everyone and prove no
   person is shown half-way */
C.PTOF_GROUPS.forEach(function (g) { g.people.forEach(function (p) { wcap.ptofOpen[g.pg + "|" + p.name] = true; }); });
const capOpen = render(wcap);
const shownPeople = people(capOpen);
A.eq(shownPeople.length, 6, "still 6 people with everyone expanded");
shownPeople.forEach(function (nm) {
  const pk = C.ptoFWorkFlat(wcap).filter(function (f) { return f.person === nm; })[0].personKey;
  const total = C.ptoFWorkFlat(wcap).filter(function (f) { return f.personKey === pk; }).length;
  const rendered = (capOpen.match(new RegExp(nm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  A.ok(rendered > 0 && total > 0, nm + " is shown whole (" + total + " day-lines), never truncated mid-person");
});
A.eq(dayLines(capOpen).length, 27 - C.ptoFWorkFlat(wcap).filter(function (f) { return shownPeople.indexOf(f.person) < 0; }).length,
  "the day-lines shown are exactly the capped people's, whole");
/* the filtered-no-matches queue state */
const wnone = reset(W("ptoF"), { ptofStatus: "approved", ptofCalDept: "all" });
wnone.ptofAppr = {};
C.ptoFWorkFlat(wnone).forEach(function (f) { if (f.st === "Approved") wnone.ptofAppr[f._id] = "Pending"; });
const noneHtml = render(wnone);
A.contains(noneHtml, "Nothing to show for this filter.", "a filter matching no day-lines gets its own note");
A.contains(noneHtml, 'class="dep-hd ptof-hd"', "with the header and controls still present, so the filter can be changed back");
A.noEmDash(noneHtml, "filtered-no-matches queue state");

/* ---------- 17. the placeholders, carried and never filled ------------ */
console.log("\n[17] unresolved gaps carried as labelled placeholders");
const gap = render(reset(W("ptoF")));
A.contains(gap, "Placeholder, not yet available", "the queue carries a labelled placeholder note");
A.contains(gap, "There is no inline approval endpoint on the Modern API", "naming the missing write endpoint");
A.contains(gap, "the approval-authority filter is not implemented", "naming the authority gap");
A.contains(gap, "every supervisor would see every employee", "and its consequence");
A.contains(gap, "leave-type column names cannot yet be renamed per organisation", "naming the PRCompany label gap");
A.contains(gap, "the confirm prompt, success message and failure handling for an approve are not specified yet", "and the three unspecified approve behaviours");
A.absent(render(reset(W("ptoF"), { ptofView: "calendar" })), "Placeholder, not yet available", "the note rides with the queue, where the write action is");
shim.fire("pto-info", { "data-id": "ptoF", "data-person": "Weekly Staff|Dana Whitfield" });
A.contains(ovl(), "aggregations with no endpoint today", "the Info panel carries its own placeholder for its two aggregations");
shim.fireKey("Escape");

/* ---------- 18. no em dash, every combination ------------------------- */
console.log("\n[18] no em dash sweep, every size x view x status x group x department");
let combos = 0, emDash = 0, blank = 0;
["ptoF", "ptoF_k", "ptoF_x", "ptoF2", "ptoF3"].forEach(function (id) {
  ["queue", "calendar"].forEach(function (v) {
    ["all", "pending", "approved"].forEach(function (st) {
      ["dept", "paygroup"].forEach(function (g) {
        ["all", "Admin", "Facilities", "Finance", "IT", "Ministry"].forEach(function (d) {
          [false, true].forEach(function (openAll) {
            [6, 7, 8, 10].forEach(function (mo) {
              const w = reset(W(id), { ptofView: v, ptofStatus: st, ptofQueueGroup: g, ptofCalDept: d, ptofCalM: mo });
              if (openAll) C.PTOF_GROUPS.forEach(function (gg) { gg.people.forEach(function (p) { w.ptofOpen[gg.pg + "|" + p.name] = true; }); });
              const h = render(w);
              combos++;
              if (String(h).indexOf(H.EM_DASH) > -1) emDash++;
              if (!h) blank++;
            });
          });
        });
      });
    });
  });
});
/* plus every overlay and menu state */
let extras = 0;
const wsw = reset(W("ptoF"), { ptofView: "calendar" });
[1, 4, 11, 13, 14, 18, 20, 26].forEach(function (d) {
  shim.fire("pto-day", { "data-id": "ptoF", "data-day": String(d) });
  const h = ovl(); extras++; if (h.indexOf(H.EM_DASH) > -1) emDash++; if (!h) blank++;
  shim.fire("pto-ovl-close", {});
});
C.PTOF_GROUPS.forEach(function (g) {
  g.people.forEach(function (p) {
    shim.fire("pto-info", { "data-id": "ptoF", "data-person": g.pg + "|" + p.name });
    const h = ovl(); extras++; if (h.indexOf(H.EM_DASH) > -1) emDash++; if (!h) blank++;
    shim.fire("pto-ovl-close", {});
  });
});
["all", "Admin", "Facilities", "Finance", "IT", "Ministry"].forEach(function (d) {
  reset(wsw, { ptofView: "calendar", ptofCalDept: d });
  shim.fire("pto-dept", { "data-id": "ptoF" });
  const h = popEl(); extras++; if (h.indexOf(H.EM_DASH) > -1) emDash++; if (!h) blank++;
  C.ptoFClosePop();
});
/* and the carried-but-uncalled helpers, swept anyway */
const uncalled = [String(C.ptoFStatusGlyph("Outstanding")), String(C.ptoFAbbrev("Vacation")), String(C.ptoFOutThisWeek(reset(W("ptoF"))))];
uncalled.forEach(function (h) { extras++; if (h.indexOf(H.EM_DASH) > -1) emDash++; });
console.log("    swept " + combos + " size x view x status x group x department x expansion x month combinations, plus " + extras + " overlay, menu and helper renders");
A.eq(emDash, 0, "no em dash in any of " + (combos + extras) + " swept renders");
A.eq(blank, 0, "every swept combination rendered something");
A.eq(C.PTOF_ABOUT.indexOf(H.EM_DASH), -1, "nor in the aboutOf body");
registry.forEach(function (w) { A.eq(w.title.indexOf(H.EM_DASH), -1, "nor in the title " + w.title); });

/* ---------- 19. the carried-but-uncalled helpers --------------------- */
console.log("\n[19] helpers carried uncalled, exactly as the Final carries them");
[["ptoFOutThisWeek", "Step 4 Data Contract records it as defined and called from nowhere"],
 ["ptoFStatusGlyph", "the legend names its own glyphs"],
 ["ptoFAbbrev", "the leave type is shown in full as text"]].forEach(function (p) {
  A.ok(typeof C[p[0]] === "function", p[0] + " is defined");
  A.eq(count(block, new RegExp(p[0] + "\\(", "g")), 1, p[0] + " appears once, as its definition, and is never called (" + p[1] + ")");
});
A.absent(block, "ptoFStatusColor", "payFStatusColor is NOT carried: the state class plus the --ptof-st-* tokens replace it");
A.absent(block, "ptoFGroupOrder", "payFGroupOrder is NOT carried: v3.3 orphaned it when it deleted payFGroupColor");
A.absent(block, "PTOF_PALETTE", "nor the group palette it fed");

/* ---------- CALENDAR FIT (owner, 2026-09-18) --------------------------
   The month grid overflowed the card and was clipped by .wcontent's
   overflow:hidden. It dictated its own height through a per-row FLOOR with no
   upper bound; it now shares the leftover height instead. CSS only, so every
   markup assertion above still holds. */
(function () {
  const css = shell.css;
  /* the grid is now the flex child that takes what is left */
  A.contains(css, "flex:1 1 auto;min-height:0;grid-auto-rows:minmax(var(--ptof-cell),1fr);",
    "the grid shares the leftover height, with rows stretching to 1fr");
  A.contains(css, "overflow-y:auto", "and scrolls rather than clipping when even the floor does not fit");

  /* the old unbounded floor is gone */
  A.absent(css, "grid-auto-rows:minmax(var(--ptof-cell),auto)",
    "the old minmax(floor,auto) that forced the overflow is gone");

  /* --ptof-cell is REUSED as the floor, not orphaned: still exactly one reader */
  A.eq((css.match(/var\(--ptof-cell\)/g) || []).length, 1, "--ptof-cell is read in exactly one place");
  A.ok((css.match(/--ptof-cell:/g) || []).length >= 2, "and declared per tier");
  /* the effective floor is the LAST declaration of each */
  const calDecls = css.match(/\.ptof-cal\{[^}]*--ptof-cell:(\d+)px[^}]*\}/g) || [];
  const detDecls = css.match(/\.ptof-cal-t-detail\{[^}]*--ptof-cell:(\d+)px[^}]*\}/g) || [];
  const lastPx = s => Number(/--ptof-cell:(\d+)px/.exec(s)[1]);
  A.ok(calDecls.length >= 1 && detDecls.length >= 1, "both tiers declare a floor");
  const explore = lastPx(calDecls[calDecls.length - 1]);
  const detail = lastPx(detDecls[detDecls.length - 1]);
  A.eq(explore, 36, "the Explore floor is 36px");
  A.eq(detail, 44, "the Detail floor is 44px");

  /* THE ARITHMETIC, which is the whole point of the change.
     Card heights come from her own grid: grid-auto-rows:48px, gap:16px, and
     .widget[data-size] spans of 8 and 9. The calendar's own chrome is the nav,
     the summary line, the weekday row and the legend. */
  A.contains(css, "grid-auto-rows:48px", "her dashboard row height is 48px");
  A.contains(css, '.widget[data-size="wide"]{grid-row:span 8;}', "Explore spans 8 rows");
  A.contains(css, '.widget[data-size="xwide"]{grid-row:span 9;}', "Detail spans 9 rows");
  const card = n => n * 48 + (n - 1) * 16;
  A.eq(card(8), 496, "an Explore card is 496px tall");
  A.eq(card(9), 560, "a Detail card is 560px tall");
  /* six week rows at the OLD floors already exceeded what was left */
  const gridAt = (floor) => 6 * floor + 5 * 4;
  A.eq(gridAt(44), 284, "six week rows at the old 44px floor needed 284px");
  A.eq(gridAt(62), 392, "six week rows at the old 62px floor needed 392px");
  /* at the new floors the grid fits inside a plausible content budget */
  A.eq(gridAt(36), 236, "six week rows at the new 36px floor need 236px");
  A.eq(gridAt(44), 284, "six week rows at the new 44px floor need 284px");
  A.ok(gridAt(36) + 107 < card(8) - 38, "Explore: floor grid plus chrome fits the card less its head");
  A.ok(gridAt(44) + 107 < card(9) - 38, "Detail: floor grid plus chrome fits the card less its head");
  /* and the floor is still enough for a date plus one marker line */
  /* this assertion is why the floor is 36 and not 34: 34 was one pixel-pair
     short of a date plus a single marker line, and it caught that. */
  A.eq(explore, 4 + 4 + 12 + 2 + 14, "the Explore floor is exactly a date plus one marker line");
  A.ok(detail > explore, "and Detail keeps a roomier floor than Explore");

  /* markers stay capped, so nothing is silently lost when a row is short */
  A.contains(block, 'var maxMarks=(tier==="detail")?3:2;', "markers are still capped per tier");
  A.contains(block, "ptof-more", "and the overflow chip still reports the remainder");

  /* ISOLATION: her own pto widget is not touched by any of this */
  /* 36 occurrences across 35 distinct selectors, one of hers being declared
     twice in her own stylesheet. Compare the whole cluster, not a count. */
  const herPto = (css.match(/\.pto-[a-z-]+\{[^}]*\}/g) || []).join("");
  A.eq(new Set((css.match(/\.pto-[a-z-]+\{/g) || [])).size, 35, "her 35 distinct .pto-* selectors are all still there");
  A.ok(herPto.length > 2000, "and her cluster is intact (" + herPto.length + " bytes)");
  ["ptof-cal", "ptof-cal-t-detail", "ptof-grid"].forEach(c => {
    A.ok(new RegExp("\\." + c + "\\{").test(css), "our ." + c + " is what we restyled");
  });
  A.absent(css, ".pto-grid{flex:1 1 auto", "we did not restyle a grid of hers");

  /* the calendar still renders at both tiers that have one */
  [["wide", "explore"], ["xwide", "detail"]].forEach(([size, tier]) => {
    const w = Object.assign({}, registry[0], { size: size, ptofView: "calendar" });
    const out = render(w);
    A.contains(out, "ptof-cal ptof-cal-t-" + tier, "the calendar renders at " + size);
    A.contains(out, "ptof-grid", "with its month grid at " + size);
    A.noEmDash(out, "the calendar at " + size);
  });
})();

process.exit(A.report());
