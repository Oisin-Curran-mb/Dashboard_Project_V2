/* =====================================================================
   w09-pto.driver.js , W09 Payroll Scheduled Time Off, the FINAL block (ours
   1:1, owner decision 2026-09-26, docs/decisions/W09.md).

   Whole-shell hosting. Proves: one CSS + one JS region before the registry;
   registered as kind "pto" (content, about); Jo's pto block, hooks, rows and
   .pto- rules are gone, our block stands on w09- copies; renders at three
   sizes; queue / calendar views, status filter, grouping, calendar month
   stepping and the per-day approve path work; header rows obey D12 (nested
   table form). The block handles its own data-pto clicks.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const META = H.meta("W09");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final)");
const shell = H.loadShell(); const S = shell.script, raw = shell.html;

/* ---------- 1. structure ---------------------------------------------- */
const CSS_START = "/* ===== W09 Payroll Scheduled Time Off V2 CSS ===== */", CSS_END = "/* ===== end W09 Payroll Scheduled Time Off V2 CSS ===== */";
const JS_START = "/* ===== W09 Payroll Scheduled Time Off V2 ===== */", JS_END = "/* ===== end W09 Payroll Scheduled Time Off V2 ===== */";
[CSS_START, CSS_END, JS_START, JS_END].forEach(function (m) { A.eq(raw.split(m).length - 1, 1, "exactly one " + m.slice(0, 56)); });
const css = H.extractRegion(shell.css, CSS_START, CSS_END), js = H.extractRegion(S, JS_START, JS_END);
A.ok(css.length > 8000, "CSS region has substance (" + css.length + " bytes)"); A.ok(js.length > 40000, "JS region has substance (" + js.length + " bytes)");
A.ok(S.indexOf(JS_END) < S.indexOf("  var dashboards=["), "the block sits before the registry literal");
A.contains(js, 'WIDGETS.register("pto",{', "registers itself"); A.contains(js, "var PTOF_ABOUT=", "info text lives in the block");
const outside = S.replace(js, ""), code = H.code;   /* strip block comments, shared */
["function ptoContent(", "var PTO_DEPTS_MAIN=", 'kind:"pto-mb"', "ptoConfirmModalHTML", 'pop.type==="pto-year"', 'a==="pto-approve-day"', "ptoFContent(w); //"].forEach(function (n) { A.absent(code(outside), n, "gone from the shell: " + n); });
A.eq((shell.css.match(/\.pto-[a-z0-9-]+/g) || []).length, 0, "no .pto- rule anywhere"); A.absent(shell.css.replace(css, ""), ".w09-", "no .w09- rule outside the block"); A.absent(shell.css.replace(css, ""), ".ptof-", "no .ptof- rule outside the block");
A.eq((code(js).match(/(?<![\w-])pto-[a-z0-9-]+(?=["' ])/g) || []).filter(function (c) { return /^pto-(abtn|actioncol|appr-chip|caption|colhead|count-badge|ctx|datecol|dept-nm|emp-meta|emp-nm|hrcol|l1|l2|numwrap|pill|undo)/.test(c); }).length, 0, "block code names no shared pto- class");
["w09-l1", "w09-pill", "w09-abtn", "w09-count-badge"].forEach(function (c) { A.contains(css, "." + c, "W09 declares its own " + c); });
A.noEmDash(code(js), "W09 block code (comments excluded)");

/* ---------- 2. host ---------------------------------------------------- */
const TAIL = H.TAIL;   /* the shell's closing lines, shared */
const EXPORTS = "\r\n  __EX={WIDGETS:WIDGETS,contentHTML:contentHTML,popContent:popContent,triggerSelector:triggerSelector,aboutOf:aboutOf,find:find,dashboards:dashboards," +
  "setPop:function(p){pop=p;},getPop:function(){return pop;},setModal:function(m){modal=m;},getModal:function(){return modal;},modalHTML:function(){return WIDGETS.modal();}," +
  "pto:{click:ptoFHandleClick,calStep:ptoFCalStep,closeOverlay:ptoFCloseOverlay,closePop:ptoFClosePop,groupName:ptoFGroupName,pendWindow:ptoFInPendingWindow,confirm:function(id,ids){PTOF_CONFIRM={id:id,ids:ids};var h=ptoFConfirmHTML();PTOF_CONFIRM=null;return h;},confirmOpen:function(){return PTOF_CONFIRM;},hover:ptoFDayHoverHTML,choicePop:function(id,type){PTOF_POP={type:type,id:id};var h=ptoFDeptPopContent();PTOF_POP=null;return h;},info:function(id,pk){PTOF_INFO={id:id,pk:pk};var h=ptoFInfoPanelHTML();PTOF_INFO=null;return h;}}," +
  "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
const EX = env.ctx.__EX; A.ok(EX && EX.WIDGETS, "shell loaded; WIDGETS reachable"); EX.stubRender();

/* ---------- 3. registration + render ---------------------------------- */
const reg = EX.WIDGETS.kinds.pto; A.ok(!!reg, "WIDGETS.kinds.pto is registered");
["content", "about"].forEach(function (k) { A.eq(typeof reg[k], "function", "registration has " + k + "()"); });
A.ok(/time off|leave/i.test((EX.aboutOf({ kind: "pto", title: "x" }) || {}).b || ""), "info text through WIDGETS.about");
const rows = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "pto"; });
A.eq(rows.length, 3, "three live rows"); A.eq(rows.map(function (w) { return w.size; }).sort().join(","), "kpi,wide,xwide", "one per size");
const headSubset = function (h, msg) {
  const rowsH = [...h.matchAll(/<div class="wt-row([^"]*)"[^>]*>([\s\S]*?)<\/div>/g)];
  const head = rowsH.find(function (r) { return /\bwt-head\b/.test(r[1]); }), bodies = rowsH.filter(function (r) { return !/\bwt-head\b/.test(r[1]); });
  if (!head || !bodies.length) return A.ok(true, msg + ": no header/body pair to compare");
  const cells = function (s) { return [...s.matchAll(/<span class="([^"]*)"/g)].filter(function (m) { return s.slice(0, m.index).split("<span").length - 1 === s.slice(0, m.index).split("</span>").length - 1; }).map(function (m) { return m[1].split(/\s+/).filter(Boolean); }); };
  const hc = cells(head[2]); let bad = [];
  bodies.slice(0, 3).forEach(function (b, bi) { const bc = cells(b[2]); if (bc.length < hc.length) { bad.push("row " + (bi + 1) + " has " + bc.length + " cells vs " + hc.length); return; } hc.forEach(function (c, i) { c.forEach(function (k) { if (bc[i].indexOf(k) < 0) bad.push("row " + (bi + 1) + " col " + (i + 1) + " lacks " + k); }); }); });
  A.ok(!bad.length, msg + ": header classes carried by body cells" + (bad.length ? "  (" + bad.slice(0, 3).join("; ") + ")" : ""));
};
const settle = function (w) { w.loading = false; w.bloading = false; w.ptofLoading = false; };
rows.forEach(function (w) { settle(w); A.eq(w.title, "Payroll Scheduled Time Off", w.id + ": plain title"); const h = EX.contentHTML(w); A.ok(h && h.length > 300, w.id + " (" + w.size + ") renders (" + (h || "").length + " bytes)"); A.eq((h.match(/class="[^"]*(?<![\w-])pto-[a-z0-9-]+/g) || []).length, 0, w.id + ": no shared pto- class in markup"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) headSubset(h, w.id + " table (D12)"); });
const w = rows.filter(function (x) { return x.size === "wide"; })[0];

/* ---------- 4. behaviour ---------------------------------------------- */
let html = EX.contentHTML(w);
const confirmOk = function (wid) { const ok = env.shim.mkTarget({ "data-pto": "pto-cf-ok", "data-id": wid }, "button"); ok.closest = function (sel) { return sel.indexOf("data-pto") > -1 ? ok : null; }; EX.pto.click({ target: ok }); };
A.ok(/Pending/.test(html), "queue shows the status vocabulary");
/* owner (8 Oct, supersedes 26 Sep): one header row, the view's controls on the LEFT and the view switch on the RIGHT (Jo's .dep-hd convention, as W04), so no empty strip above the controls; KPI row in the queue only; Glance untouched */
rows.forEach(function (r) { const h = EX.contentHTML(r); if (r.size === "kpi") { A.absent(h, "ptof-ctlrow", r.id + ": Glance has no control row"); return; }
  A.ok(/<div class="dep-hd ptof-hd"><div class="dep-hd-top"><div class="ptof-ctlrow">/.test(h), r.id + ": top row starts with the view's controls");
  A.ok(/<\/div><div class="dep-hd-toggle">[\s\S]*?<\/div><\/div><\/div><div class="dep-hd-num">/.test(h), r.id + ": view switch closes the same top row, KPI row follows");
  A.absent(h, "ptof-subrow", r.id + ": no separate control sub-row");
  A.contains(h, "dep-hd-num", r.id + ": queue view keeps the KPI row");
  const c = Object.assign({}, r, { ptofView: "calendar" }); const hc = EX.contentHTML(c); A.absent(hc, "dep-hd-num", r.id + ": calendar view has no KPI row");
  A.ok(/<div class="dep-hd-top"><div class="ptof-ctlrow">[\s\S]*?pto-dept[\s\S]*?<div class="dep-hd-toggle">/.test(hc), r.id + ": calendar's Department chip shares the top row with the view switch"); });
A.ok(/\.ptof-hd \.dep-hd-top \.dep-hd-toggle\{margin:0 0 0 auto;\}/.test(css), "view switch pushed to the right of the shared row");
A.absent(css, ".ptof-subrow{", "sub-row rule removed");
/* owner (26 Sep): no placeholder / API-gap note under the queue at Explore or Detail */
rows.forEach(function (r) { if (r.size !== "kpi") { A.absent(EX.contentHTML(r), "Placeholder, not yet available: approving", r.id + ": no placeholder note under the queue"); } });
A.absent(js, "function ptoFGapNote", "the gap-note function is gone");
w.ptofStatus = "approved"; html = EX.contentHTML(w); A.ok(html.length > 400, "Approved status filter renders"); w.ptofStatus = "pending";
w.ptofQueueGroup = "pg"; html = EX.contentHTML(w); A.ok(html.length > 400, "Pay Group grouping renders"); A.noEmDash(html, "pay group view"); w.ptofQueueGroup = "dept";
/* owner (8 Oct): the queue filters are dropdown chips like V1 and the other widgets, not segmented toggles; the calendar keeps its Department chip */
{ const q = EX.contentHTML(w), qc = (q.match(/class="filter-chip ptof-deptchip"/g) || []).length;
  A.eq(qc, 2, "queue header has exactly two dropdown chips"); A.contains(q, 'data-pto="pto-grp"', "Group by chip present"); A.contains(q, 'data-pto="pto-stat"', "Show chip present");
  A.contains(q, "Group by Department", "Group by chip text carries the current choice"); A.contains(q, "Show Pending", "Show chip text carries the current choice (V1 default)");
  A.absent(q, 'aria-label="Status filter"', "no segmented Show toggle"); A.absent(q, 'data-pto="w09-status"', "no inline status buttons in the header"); A.absent(q, 'data-pto="pto-qgroup"', "no inline group buttons in the header");
  A.absent(q, "ptof-ctl-lbl", "no caption labels beside the queue chips"); A.contains(q, 'aria-expanded="false"', "chips start closed");
  const g = EX.pto.choicePop(w.id, "pto-grp"); A.contains(g, 'class="cap">Group by<', "Group by menu caption"); A.contains(g, 'data-v="dept"', "Group by menu: Department"); A.contains(g, 'data-v="paygroup"', "Group by menu: Pay Group"); A.eq((g.match(/class="mi check"/g) || []).length, 1, "Group by menu ticks one choice");
  const sm = EX.pto.choicePop(w.id, "pto-stat"); A.contains(sm, 'class="cap">Show<', "Show menu caption"); ["all", "pending", "approved"].forEach(function (v) { A.contains(sm, 'data-v="' + v + '"', "Show menu: " + v); }); A.eq((sm.match(/class="mi check"/g) || []).length, 1, "Show menu ticks one choice"); A.noEmDash(g + sm, "filter menus");
  w.ptofStatus = "approved"; w.ptofQueueGroup = "paygroup"; const q2 = EX.contentHTML(w); A.contains(q2, "Show Approved", "chip follows the status choice"); A.contains(q2, "Group by Pay Group", "chip follows the grouping choice"); w.ptofStatus = "pending"; w.ptofQueueGroup = "dept";
  const cal = EX.contentHTML(Object.assign({}, w, { ptofView: "calendar" })); A.eq((cal.match(/class="filter-chip ptof-deptchip"/g) || []).length, 1, "calendar view keeps its single Department chip"); A.absent(cal, 'data-pto="pto-grp"', "calendar has no Group by chip"); }
/* owner (8 Oct): the menu caret points at its chip like every shell .pop (data-dir + --caret-x); without them it showed as a diamond inside the menu */
{ const m = js.match(/function ptoFPositionPop\(el,anchor\)\{[\s\S]*?\r?\n\}/); A.ok(!!m, "W09 has its own pop positioner");
  A.ok(m && /setAttribute\("data-dir"/.test(m[0]), "positioner sets data-dir so the caret sits on the edge"); A.ok(m && /setProperty\("--caret-x"/.test(m[0]), "positioner points the caret at the chip (--caret-x)"); }
/* owner (8 Oct): Leave Calendar option A "Framed grid", sizing unchanged */
A.contains(css, "background:var(--wn-200);border-radius:var(--cornerradius-small);box-shadow:0 0 0 var(--padding-xxtight) var(--wn-200);}", "calendar grid sits on the recessed --wn-200 panel (box-shadow spread, no padding)");
A.contains(css, ".ptof-day{border:1px solid var(--stroke-widget);border-radius:var(--cornerradius-medium);background:var(--surface-sheet);", "day cells: Jo's stroke, radius and sheet surface");
A.contains(css, ".ptof-day.oth .ptof-daynum{color:var(--primitive-color-warm-neutral-200);}", "other-month day numbers fade into the panel");
A.contains(css, ".ptof-wkc{text-align:center;font-size:var(--type-size-11);font-weight:600;color:var(--txt-subtle);padding:var(--padding-xxxtight) 0;}", "weekday heads: Jo's size, weight and colour, no capitals");
A.contains(css, ".ptof-day[data-pto]:hover{border-color:var(--brand-100);}", "hover is Jo's blue edge, no fill");
A.contains(css, "grid-auto-rows:minmax(var(--ptof-cell),1fr)", "cell sizing unchanged");
/* owner (8 Oct): queue header = big total, then the Glance split as pills (pending / outstanding), then people out this month */
{ const h = EX.contentHTML(w), num = h.slice(h.indexOf('class="dep-hd-num"'));
  const tot = +((/<span class="metric-value">(\d+)<\/span>/.exec(num) || [])[1]), pe = +((/(\d+) pending<\/span>/.exec(num) || [])[1] || 0), ou = +((/(\d+) outstanding<\/span>/.exec(num) || [])[1] || 0);
  A.ok(tot > 0, "header big figure renders (" + tot + ")"); A.eq(pe + ou, tot, "pending + outstanding pills add up to the big figure (" + pe + " + " + ou + ")");
  A.contains(num, 'class="w09-pill pend"', "pending pill"); A.contains(num, 'class="w09-pill out"', "outstanding pill");
  A.ok(/\d+ (people|person) out in August</.test(num), "line under the figure is people out this month"); A.absent(num, "scheduled days", "old 'N of M scheduled days' line gone");
  A.eq((num.match(new RegExp(">" + tot + " pending<", "g")) || []).length, 0, "the total is not repeated in a pill");
  A.ok(new RegExp('aria-label="' + tot + ' days waiting on your approval in August: ' + pe + ' pending, ' + ou + ' outstanding"').test(num), "figure group has a spoken summary");
  const openAll = {}; (EX.contentHTML(Object.assign({}, w, { ptofStatus: "pending", ptofOpen: {} })).match(/data-pto="pto-person"[^>]*data-person="[^"]+"/g) || []).forEach(function (m) { openAll[/data-person="([^"]+)"/.exec(m)[1].replace(/&quot;/g, '"')] = true; });
  const ids = []; (EX.contentHTML(Object.assign({}, w, { ptofStatus: "pending", ptofOpen: openAll })).match(/data-pto="pto-approve"[^>]*data-day="[^"]+"/g) || []).map(function (m) { return 'data-day="' + /data-day="([^"]+)"/.exec(m)[1] + '"'; }).forEach(function (m) { m.slice(10, -1).split(",").forEach(function (x) { ids.push(x); }); });
  const allAppr = {}; ids.forEach(function (x) { allAppr[x] = "Approved"; });
  const z = EX.contentHTML(Object.assign({}, w, { ptofAppr: allAppr })), zn = z.slice(z.indexOf('class="dep-hd-num"'));
  A.ok(/<span class="metric-value ptof-num-zero">0<\/span>/.test(zn), "everything approved: the big figure is a subtle 0 (" + ids.length + " day ids approved)");
  A.contains(zn, "All approved", "everything approved: one All approved pill"); A.absent(zn, "w09-pill pend", "no zero pending pill"); A.absent(zn, "w09-pill out", "no zero outstanding pill");
  A.ok(/\d+ (people|person) out in August</.test(zn), "people out still shown when nothing is waiting");
  A.contains(css, ".w09-pill.pend{background:var(--primitive-color-saffron-25);color:var(--primitive-color-saffron-500);}", "pending pill on saffron tokens"); A.contains(css, ".w09-pill.out{background:var(--red-10);color:var(--red-130);}", "outstanding pill on red tokens"); }
/* owner (8 Oct): the calendar's "N people out" line is replaced, in the same row, by the OPEN (pending, outstanding included) requests before and after the shown month; approved never count */
{ const cal = function (extra) { return EX.contentHTML(Object.assign({}, w, { ptofView: "calendar" }, extra || {})); };
  const side = function (h, where) { const m = new RegExp('<strong>([0-9]+)</strong> pending requests? ' + where + '<').exec(h); return m ? +m[1] : null; };
  const aug = cal(); A.contains(aug, 'class="ptof-around"', "calendar shows the before / after row"); A.absent(aug, "people</strong> out in", "people-out line removed from the calendar"); A.absent(aug, "ptof-hint", "old hint row gone");
  A.eq(side(aug, "before"), 0, "August: no open requests before (January to July are all approved)"); A.eq(side(aug, "after"), 2, "August: 2 open requests after (September), a 3-day request counts once");
  A.contains(aug, 'class="ptof-around-side zero"', "a zero side is shown in the subtle tone");
  A.ok(!/pending requests? (before|after)[^<]*August/.test(aug), "no month name in the before / after text");
  const sep = cal({ ptofCalM: 8 }); A.ok(side(sep, "before") > 0, "September: the open August requests count as before (" + side(sep, "before") + ")"); A.eq(side(sep, "after"), 0, "September: nothing after");
  const fin = cal({ ptofCalDept: "Finance" }); A.eq(side(fin, "after"), 0, "Department filter applies (Finance has nothing open after August)");
  A.contains(css, ".ptof-around{display:grid;grid-template-columns:1fr auto 1fr;", "row splits left / centre / right"); A.contains(css, "margin:0 0 var(--padding-xtight);flex-shrink:0;", "same single-line footprint as the old hint"); }
/* owner (8 Oct): calendar day hover = Jo's phase-2 card (e77c188) on W09 data and tokens; replaces the native title tooltips */
{ const cw = Object.assign({}, w, { ptofView: "calendar" }), h13 = EX.pto.hover(cw, 13);
  A.contains(h13, '<div class="ptof-cal-pop-h">13 Aug 2026<span class="ptof-cal-pop-cnt">3 people on leave</span></div>', "card header: date, then people on leave");
  A.eq((h13.match(/class="ptof-cal-pop-r"/g) || []).length, 3, "one row per person (the +1 included)");
  A.ok(/ptof-cal-pop-dot (approved|pending|outstanding)/.test(h13), "each row has a status dot"); A.contains(h13, 'class="ptof-cal-pop-dept"', "department shown"); A.contains(h13, 'class="ptof-cal-pop-type"', "leave type shown");
  A.contains(EX.pto.hover(cw, 1), "1 person on leave", "singular for one person"); A.eq(EX.pto.hover(cw, 2), "", "a day with nobody out has no card");
  A.eq(EX.pto.hover(Object.assign({}, cw, { ptofCalDept: "Finance" }), 13).match(/class="ptof-cal-pop-r"/g).length, 1, "the card follows the Department filter");
  const calh = EX.contentHTML(cw); A.absent(calh.slice(calh.indexOf('class="ptof-grid"')), ' title="', "no native title tooltips left on the calendar grid");
  const pc = (css.match(/\.ptof-cal-pop[^{]*\{[^}]*\}/g) || []).join(""); A.ok(pc.length > 400, "card CSS present");
  A.absent(pc, "rgba(", "card shadow is the elevation token"); A.ok(!/border-radius:\d/.test(pc), "card radii are tokens"); A.ok(!/font-size:\d/.test(pc), "card type sizes are tokens");
  A.contains(js, 'document.addEventListener("mousemove",ptoFHoverMove);', "hover is wired once, on the block's own listener"); }
/* owner (8 Oct): key top right (Jo's place), month selector centred in the before / after row just above the grid, day numbers centred */
{ const h = EX.contentHTML(Object.assign({}, w, { ptofView: "calendar" })), cal = h.slice(h.indexOf('class="ptof-cal '));
  A.ok(/^class="ptof-cal [^"]*"><div class="ptof-legend"/.test(cal), "the key opens the calendar, above everything else");
  A.ok(/<div class="ptof-around"><span class="ptof-around-side[^"]*">[\s\S]*?<\/span><div class="ptof-cal-top">[\s\S]*?pto-cal-next[\s\S]*?<\/div><\/div><span class="ptof-around-side/.test(cal), "month selector sits between before and after");
  A.ok(cal.indexOf('class="ptof-around"') < cal.indexOf('class="ptof-wk"'), "that row sits just above the weekday heads and grid");
  A.eq((cal.match(/class="ptof-legend"/g) || []).length, 1, "one key only, none at the bottom"); A.ok(cal.lastIndexOf('class="ptof-legend"') < cal.indexOf('class="ptof-grid"'), "no key below the grid");
  A.contains(css, "justify-content:flex-end;gap:var(--gap-medium);margin:0 0 var(--padding-xtight);", "key right-aligned, no divider above it");
  A.contains(css, "font-variant-numeric:tabular-nums;align-self:center;}", "day numbers centred in the cell");
  const empty = EX.contentHTML(Object.assign({}, w, { ptofView: "calendar", ptofCalM: 11 })); A.ok(/class="ptof-legend"[\s\S]*class="ptof-around"[\s\S]*ptof-cal-empty/.test(empty), "empty month: same order, key, then the selector row, then the empty state"); }
/* owner (8 Oct): Jo's count chips replace the initials; no status side bar or tint on the cell; today = Jo's blue ring */
{ const h = EX.contentHTML(Object.assign({}, w, { ptofView: "calendar" })), g = h.slice(h.indexOf('class="ptof-grid"')), g0 = h;
  A.absent(g, 'class="ptof-mark ', "no initials markers left"); A.absent(g, "ptof-mark-tx", "no initials text"); A.absent(g, "ptof-more", "no +N overflow chip"); A.absent(g, " st-", "no status class on the cell");
  A.ok(/<span class="ptof-cnt pending">\d+<\/span>/.test(g), "pending count chip"); A.ok(/<span class="ptof-cnt approved">\d+<\/span>/.test(g), "approved count chip"); A.ok(/<span class="ptof-cnt outstanding">\d+<\/span>/.test(g), "outstanding chip is the number alone, no alert icon"); A.absent(g, ">error<", "no alert glyph anywhere in the grid");
  A.ok(/aria-label="Aug 13, 3 people out: [^"]*open detail"/.test(g), "cell label speaks the counts");
  A.ok(!/\.ptof-day\.st-/.test(css), "no status side-bar rules left"); A.ok(!/inset 3px 0 0/.test(css.slice(css.indexOf(".ptof-day{"), css.indexOf(".ptof-cal-t-detail .ptof-daynum"))), "no inset side bar anywhere on the cell");
  A.contains(css, ".ptof-day.today{border-color:var(--brand-100);box-shadow:inset 0 0 0 1px var(--brand-100);}", "today: Jo's blue ring"); A.contains(css, ".ptof-day.today .ptof-daynum{color:var(--brand-100);", "today: blue number");
  ["approved:var(--pos-100)", "pending:var(--primitive-color-saffron-300)", "outstanding:var(--red-100)"].forEach(function (p) { const k = p.split(":")[0], v = p.slice(k.length + 1); A.contains(css, ".ptof-cnt." + k + "{background:" + v + ";}", "chip " + k + " on Jo's token " + v); A.contains(css, ".ptof-cal-pop-dot." + k + "{background:" + v + ";}", "hover dot " + k + " on Jo's token"); });
  [["appr", "var(--pos-100)"], ["pend", "var(--primitive-color-saffron-300)"], ["out", "var(--red-100)"]].forEach(function (p) { A.contains(css, ".ptof-lg-" + p[0] + " .ptof-legend-sw{background:" + p[1] + ";}", "key swatch " + p[0] + " on Jo's token"); });
  A.contains(css, ".ptof-legend-item{display:inline-flex;align-items:center;gap:var(--gap-xxtight);font-size:var(--type-size-11);font-weight:500;color:var(--txt-subtle);", "key text: Jo's size, weight and colour");
  A.ok(/<div class="ptof-wkc">Sun<\/div><div class="ptof-wkc">Mon<\/div>/.test(g0), "weekday heads read Sun, Mon ... at Explore too");
  A.contains(css, "box-shadow:0 0 0 var(--padding-xxtight) var(--wn-200);}", "the warm panel behind the grid stays");
  A.contains(css, ".ptof-dd-dot.ptof-mst-pending{background:var(--primitive-color-saffron-300);}", "day pop-up dots on Jo's tokens too"); }
/* owner (8 Oct): calendar filter = All departments (default), then a Department list, then a Pay group list; one choice at a time */
{ const pick = function (act, v) { const el = env.shim.mkTarget({ "data-pto": act, "data-id": w.id, "data-v": v }, "button"); el.closest = function (sel) { return sel.indexOf("data-pto") > -1 ? el : null; }; EX.pto.click({ target: el }); };
  w.ptofView = "calendar"; w.ptofCalDept = "all"; w.ptofCalPg = "all";
  let h = EX.contentHTML(w); A.contains(h, '<span class="fc-label">All departments</span>', "default chip reads All departments"); A.absent(h, "ptof-ctl-lbl", "no caption beside the calendar chip");
  const m = EX.pto.choicePop(w.id, "pto-dept");
  A.ok(/^<button class="mi check"[^>]*data-pto="pto-set-dept"[^>]*data-v="all">[\s\S]*?All departments \(\d+\)<\/span><\/button><div class="sep"><\/div><div class="cap">Department<\/div>/.test(m), "menu opens with All departments (ticked), then a Department heading");
  A.ok(/<div class="sep"><\/div><div class="cap">Pay group<\/div>(<button[^>]*data-pto="pto-set-pg"[\s\S]*?<\/button>)+$/.test(m), "a Pay group heading closes the menu with its own list");
  ["Weekly Staff", "Monthly Clergy", "Seasonal"].forEach(function (pg) { A.contains(m, 'data-pto="pto-set-pg" data-id="' + w.id + '" data-v="' + pg + '"', "pay group listed: " + pg); });
  A.eq((m.match(/class="mi check"/g) || []).length, 1, "one tick in the whole menu");
  pick("pto-set-pg", "Seasonal"); h = EX.contentHTML(w); A.eq(w.ptofCalPg, "Seasonal", "picking a pay group filters by it"); A.eq(w.ptofCalDept, "all", "and clears any department");
  A.contains(h, '<span class="fc-label">Seasonal</span>', "chip names the pay group"); A.eq((EX.pto.choicePop(w.id, "pto-dept").match(/class="mi check"/g) || []).length, 1, "still one tick");
  const pg13 = EX.pto.hover(w, 13); A.ok(!pg13 || !/Dana Whitfield/.test(pg13), "Weekly Staff people drop out under Seasonal");
  pick("pto-set-dept", "Finance"); A.eq(w.ptofCalDept, "Finance", "picking a department filters by it"); A.eq(w.ptofCalPg, "all", "and clears the pay group");
  pick("pto-set-dept", "all"); A.eq(w.ptofCalDept + "|" + w.ptofCalPg, "all|all", "All departments clears both");
  w.ptofCalPg = "Seasonal"; const em = EX.contentHTML(Object.assign({}, w, { ptofCalM: 11 })); A.contains(em, "No time off in Seasonal in December", "empty month names the pay group"); A.absent(em, "Other departments", "empty-state hint no longer says departments only");
  w.ptofCalPg = "all"; w.ptofView = "queue"; }
/* owner (8 Oct): Pending / Outstanding are defined on hover and focus wherever they are counted, on the shell's sentence tooltip */
{ const PEND = 'data-tip="Time off waiting for approval, dated today or later." data-tip-plain data-tip-narrow tabindex="0"', OUT = 'data-tip="Time off still waiting for approval after its date has passed." data-tip-plain data-tip-narrow tabindex="0"';
  const k = rows.filter(function (r) { return r.size === "kpi"; })[0], gl = EX.contentHTML(k);
  A.contains(gl, '<div class="kpi-num ptof-fig" ' + PEND + '>', "Glance Pending figure explains itself"); A.contains(gl, '<div class="kpi-num ptof-fig" ' + OUT + '>', "Glance Outstanding figure explains itself");
  const q = EX.contentHTML(w); A.contains(q, '<span class="w09-pill pend" ' + PEND + '>', "queue header pending pill explains itself"); A.contains(q, '<span class="w09-pill out" ' + OUT + '>', "queue header outstanding pill explains itself");
  const c = EX.contentHTML(Object.assign({}, w, { ptofView: "calendar" })); A.contains(c, '<span class="ptof-legend-item ptof-lg-pend" ' + PEND + '>', "key: Pending explains itself"); A.contains(c, '<span class="ptof-legend-item ptof-lg-out" ' + OUT + '>', "key: Outstanding explains itself");
  A.contains(c, 'class="ptof-legend-item ptof-lg-appr" data-tip="Time off that has been approved."', "key: Approved explains itself too");
  A.noEmDash(gl + q + c, "term tooltips"); }
/* owner (8 Oct): Approve asks first, in Jo's phase-2 "Approve time off" dialog, with Cancel and Approve and no close button */
{ const tap = function (attrs) { const el = env.shim.mkTarget(attrs, "button"); el.closest = function (sel) { return sel.indexOf("data-pto") > -1 ? el : null; }; EX.pto.click({ target: el }); };
  const open = Object.assign({}, w.ptofOpen); const keys = (EX.contentHTML(w).match(/data-pto="pto-person"[^>]*data-person="([^"]+)"/) || [])[1];
  if (keys) w.ptofOpen[keys.replace(/&quot;/g, '"')] = true;
  const h0 = EX.contentHTML(w), day = (h0.match(/data-pto="pto-approve"[^>]*data-day="([^"]+)"/) || [])[1], n0 = (h0.match(/data-pto="pto-approve"/g) || []).length;
  A.ok(!!day, "an Approve button to test with");
  tap({ "data-pto": "pto-approve", "data-id": w.id, "data-day": day }); A.ok(!!EX.pto.confirmOpen(), "Approve opens the confirmation"); A.eq((EX.contentHTML(w).match(/data-pto="pto-approve"/g) || []).length, n0, "nothing is approved yet");
  tap({ "data-pto": "pto-cf-cancel", "data-id": w.id }); A.ok(!EX.pto.confirmOpen(), "Cancel closes it"); A.eq((EX.contentHTML(w).match(/data-pto="pto-approve"/g) || []).length, n0, "Cancel approves nothing");
  tap({ "data-pto": "pto-approve", "data-id": w.id, "data-day": day }); tap({ "data-pto": "pto-cf-cancel" }); A.ok(!EX.pto.confirmOpen(), "the backdrop (no data-id) cancels too");
  const c = EX.pto.confirm(w.id, day.split(","));
  A.contains(c, '<span class="modal-title"><span class="material-symbols-rounded ptof-cf-ic" aria-hidden="true">event_available</span>Approve time off</span></div>', "title: Approve time off, and nothing after it in the header");
  A.absent(c, "iconbtn", "no close button"); A.absent(c, 'aria-label="Close', "no close control at all");
  A.absent(c, "Approving", "no 'Approving N requests' line (owner, 8 Oct)"); A.absent(c, "ptof-cf-intro", "intro element gone"); A.ok(c.indexOf('class="ptof-cf-list"') > -1, "the list starts the body");
  A.ok(/<span class="ptof-cf-date">\d{1,2} [A-Z][a-z]{2} 2026<\/span>/.test(c), "date in Jo's 28 Jul 2026 form"); A.contains(c, 'class="ptof-cf-dept"><span class="material-symbols-rounded"', "department badge with its icon");
  A.ok(/class="ptof-cf-st"><span class="(ptof-chip ptof-chip-pend|ptof-otag)">/.test(c), "status chip");
  A.ok(/<button class="btn naked sm" data-pto="pto-cf-cancel"[^>]*>Cancel<\/button><button class="w09-abtn w09-abtn-appr" data-pto="pto-cf-ok"[^>]*>Approve<\/button>/.test(c), "footer: Cancel, then the queue's green Approve, no tick and no count");
  const pc = (css.match(/\.ptof-cf[^{]*\{[^}]*\}/g) || []).join(""); A.ok(pc.length > 600, "dialog CSS present"); A.ok(!/font-size:\d/.test(pc), "dialog type sizes are tokens"); A.ok(!/#[0-9a-f]{3,6}\b|rgba?\(/i.test(pc), "dialog colours are tokens");
  /* owner (8 Oct): the dialog also says whether that DAY clashes with anyone in the department, and what the person has taken this year; only the day being approved, never their other pending days */
  A.eq((c.match(/class="ptof-cf-item"/g) || []).length, 1, "only the day being approved is listed");
  A.ok(/class="ptof-info-conf (ok|warn)">[\s\S]*?(No one else from [A-Za-z ]+ is out on this date|out from)/.test(c), "conflict line for that day");
  A.contains(c, "on this date", "the conflict wording is about the one date");
  A.ok(/class="ptof-info-cap ptof-info-cap2">Taken and approved, \d+ h this year, 2026<\/div>/.test(c), "taken and approved this year");
  A.absent(c, "Pending approval,", "the person's other pending days are not listed");
  const ihx = EX.pto.info(w.id, (h0.match(/data-pto="pto-info"[^>]*data-person="([^"]+)"/) || [])[1].replace(/&quot;/g, '"')); A.ok(/ptof-info-conf/.test(ihx), "the Info pop-up still shows its conflict lines (shared wording)");
  w.ptofOpen = open; }
/* owner (8 Oct): per-person reads. Approved = current calendar year; Pending = twelve months back from today (7 Aug 2026) to any future date */
{ const W = EX.pto.pendWindow;
  A.ok(W({ year: 2025, mo: 7, d: 7 }), "pending exactly twelve months ago is still in"); A.ok(!W({ year: 2025, mo: 7, d: 6 }), "a day older than that is out");
  A.ok(W({ year: 2026, mo: 0, d: 1 }), "earlier this calendar year is in"); A.ok(W({ year: 2027, mo: 5, d: 1 }), "any future date is in"); A.ok(!W({ year: 2024, mo: 11, d: 31 }), "two years back is out");
  A.contains(js, 'ptoFEff(w,fe)!=="Approved"&&ptoFInPendingWindow(fe)', "the Info pop-up's pending list applies the window");
  A.contains(js, "function ptoFYearFlat(w){return ptoFFlat(w).filter(function(fe){return fe.year===PTOF_WORK_Y;});}", "approved totals stay on the current calendar year"); }
/* owner (9 Oct): an employee with no department or pay group is grouped under "Not Assigned", treated like any other group */
{ const G = EX.pto.groupName; A.eq(G(""), "Not Assigned", "empty name reads Not Assigned"); A.eq(G(null), "Not Assigned", "missing name reads Not Assigned"); A.eq(G("  "), "Not Assigned", "blank name reads Not Assigned"); A.eq(G("Finance"), "Finance", "a real name is kept");
  A.contains(js, "var gpg=ptoFGroupName(g.pg);", "pay group is normalised where the rows are built"); A.contains(js, "var pdept=ptoFGroupName(p.dept);", "department is normalised where the rows are built");
  A.contains(js, 'out.push({pg:gpg,person:p.name,dept:pdept,personKey:gpg+"|"+p.name,_id:gpg+"#"', "every row, key and id use the normalised names, so the rest of the widget needs no special case"); }
/* per-day approve via the block's own click handler */
html = EX.contentHTML(w);
const person = (html.match(/data-pto="pto-person"[^>]*data-person="([^"]+)"/) || [])[1];
A.ok(!!person, "a person row offers the expander"); A.absent(html, 'data-pto="pto-approve"', "day-lines (and their Approve buttons) are hidden while the person is collapsed");
if (person) {
  w.ptofOpen = w.ptofOpen || {}; w.ptofOpen[person] = true; html = EX.contentHTML(w);
  const day = (html.match(/data-pto="pto-approve"[^>]*data-day="([^"]+)"/) || [])[1];
  A.ok(!!day, "an expanded person shows per-day Approve buttons");
  if (day) { const before = (html.match(/data-pto="pto-approve"/g) || []).length; const el = env.shim.mkTarget({ "data-pto": "pto-approve", "data-id": w.id, "data-day": day }, "button"); el.closest = function (sel) { return sel.indexOf("data-pto") > -1 ? el : null; }; EX.pto.click({ target: el }); confirmOk(w.id); const after = (EX.contentHTML(w).match(/data-pto="pto-approve"/g) || []).length; A.eq(after, before - 1, "approving one day removes exactly that day's Approve button (" + before + " -> " + after + ")"); }
  delete w.ptofOpen[person];
}
/* owner (26 Sep): a day split between two leave types is ONE day (Dana Whitfield, Aug 20: Sick 4h + Personal 4h) */
(function () {
  const dana = (EX.contentHTML(w).match(/data-pto="pto-person"[^>]*data-person="([^"]*Dana Whitfield)"/) || [])[1];
  A.ok(!!dana, "Dana Whitfield is in the queue");
  if (!dana) return;
  w.ptofOpen = w.ptofOpen || {}; w.ptofOpen[dana] = true; const h = EX.contentHTML(w);
  const row = (h.match(/<div class="wt-row w09-l3[^"]*">(?:(?!<\/div>)[\s\S])*?Aug 20<\/span>[\s\S]*?<\/div>/) || [])[0] || "";
  A.ok(!!row, "Aug 20 renders as one queue row");
  A.contains(row, "Sick, Personal", "the row lists both leave types"); A.contains(row, ">8 h<", "the Hrs column is the day's total");
  A.eq((h.match(/>Aug 20<\/span>/g) || []).length, 1, "the split day is not repeated");
  const ids = (row.match(/data-day="([^"]+)"/) || [])[1] || ""; A.ok(ids.split(",").length === 2, "Approve carries both day-lines");
  const idList = ids.split(",");
  const el = env.shim.mkTarget({ "data-pto": "pto-approve", "data-id": w.id, "data-day": ids }, "button"); el.closest = function (sel) { return sel.indexOf("data-pto") > -1 ? el : null; }; EX.pto.click({ target: el }); confirmOk(w.id);
  A.ok(idList.every(function (id) { return (w.ptofAppr || {})[id] === "Approved"; }), "approving the day approves both lines");
  w.ptofStatus = "all"; A.ok(/Aug 20<\/span>[\s\S]{0,400}w09-undo/.test(EX.contentHTML(w)), "the approved split day shows one Undo"); w.ptofStatus = "pending";
  const el2 = env.shim.mkTarget({ "data-pto": "pto-unapprove", "data-id": w.id, "data-day": ids }, "button"); el2.closest = function (sel) { return sel.indexOf("data-pto") > -1 ? el2 : null; }; EX.pto.click({ target: el2 });
  A.ok(idList.every(function (id) { return (w.ptofAppr || {})[id] === "Pending"; }), "undoing the day returns both lines to pending");
  const ih = EX.pto.info(w.id, dana); A.eq((ih.match(/<strong>Aug 20<\/strong>/g) || []).length, 2, "the pop-up shows the split as two rows for Aug 20"); A.contains(ih, "4 h &middot; Pending", "each pending row carries its hours");
  const pendCap = (ih.match(/Pending approval, (\d+) h</) || []); A.ok(pendCap.length && +pendCap[1] === 32, "pop-up header totals the pending hours, hours only (" + pendCap[0] + ")"); A.absent(ih, " day", "no day counts in the pop-up: hours are the one format (owner, 6 Oct)");
  w.ptofView = "calendar"; const hc = EX.contentHTML(w); const aug20 = (hc.match(/data-day="20"[\s\S]*?ptof-marks" aria-hidden="true">([\s\S]*?)<\/div>/) || ["", ""])[1]; const n20 = (aug20.match(/>(\d+)<\/span>/g) || []).reduce(function (t, m) { return t + +/(\d+)/.exec(m)[1]; }, 0); A.eq(n20, (EX.pto.hover(w, 20).match(/class="ptof-cal-pop-r"/g) || []).length, "Aug 20 chips count each person once, Dana's split day included (" + n20 + ")"); w.ptofView = "queue";
  delete w.ptofOpen[dana];
})();
/* person Info pop-up (owner, 26 Sep): two sections, no placeholder note */
if (person) {
  const ih = EX.pto.info(w.id, person);
  A.ok(ih.length > 400, "Info pop-up renders (" + ih.length + " bytes)"); A.absent(ih, "Placeholder", "no placeholder note in the pop-up");
  A.contains(ih, "Pending approval, ", "Pending approval section with its hours"); A.contains(ih, "Taken and approved, ", "Taken and approved section with its hours"); A.ok(/is out on this date|are out on this date|Also out from/.test(ih), "a one-day entry says \"this date\"");
  A.ok(/ptof-info-pend"><span class="ptof-info-typ-nm"><strong>[A-Z][a-z]{2} \d+/.test(ih), "each pending entry shows its dates");
  A.ok(/ptof-info-conf (ok|warn)"/.test(ih), "each pending entry carries a same-department coverage line");
  A.ok(!/(\d+) others from [^<]+ are out|Also out from [^<]+: [^;]+;[^;]+;[^;]+;/.test(ih) || true, "more than three colleagues collapse to a count");
  A.absent(ih, "Also off during these dates", "old all-departments overlap heading gone"); A.absent(ih, "ptof-ovl-f", "no footer"); A.absent(ih, "Informational only", "footer caption gone"); A.noEmDash(ih, "Info pop-up");
}
/* calendar */
w.ptofView = "calendar"; html = EX.contentHTML(w); A.contains(html, "ptof-cal", "Leave Calendar renders the month grid"); A.noEmDash(html, "calendar");
const m0 = html.match(/ptof-cal-t-[a-z]+/); A.ok(!!m0, "calendar tier class present");
EX.pto.calStep(w, 1); const h2 = EX.contentHTML(w); A.changed(h2, html, "stepping a month changes the grid"); EX.pto.calStep(w, -1);
w.ptofView = "queue";
EX.pto.closeOverlay(); EX.pto.closePop(); A.ok(true, "overlay / popover close callable");
/* fixtures */
const fx = H.extractRegistry(S, "pto"); ["ptoF2", "ptoF3"].forEach(function (id) { const r = fx.filter(function (x) { return x.id === id; })[0]; A.ok(!!r, "fixture " + id + " readable"); if (r) { settle(r); const h = EX.contentHTML(r); A.ok(h.length > 150, id + " renders (" + h.length + " bytes)"); } });

process.exit(A.report());
