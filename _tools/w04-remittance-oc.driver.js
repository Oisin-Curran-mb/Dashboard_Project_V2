/* =====================================================================
   w04-remittance-oc.driver.js , W04 Remittance Pledges, the (OC) widget
   AFTER the 2026-09-10 build-sheet implementation.

   The (OC) widget is now JO'S OWN CODE (kind remittance-oc, prefix remO)
   with exactly one adopted change: the pop-up that opens when an activity
   is clicked. Every assertion is traceable to a row ID in:
     Design Differences (Jo vs Oisin)/
       Final Version Build Sheet - Jo vs OC (per widget, per size).md

     W04-AL-01  pop-up lists PLEDGES, not receipts        (Adopt ours)
     W04-AL-02  ALL pledges, most instalments missed first(Adopt modified)
     W04-AL-03  export in the modal header, scoped        (Adopt ours)
     W04-AL-04  widget = term elapsed, pop-up = instalments(Adopt/New)
     W04-AL-05  summary strip rebuilt to the new basis    (New)
     W04-AL-06  behind note in payments, not days         (New)
     W04-AL-07  five sorts, most-missed default           (Adopt modified)
     W04-EX-01  table row click opens the pledge pop-up   (Adopt ours)
     W04-EX-02  pacing bar opens the SAME pop-up          (Adopt ours)
     W04-DE-01  same modal at Detail, one implementation  (Adopt ours)
     W04-ST-03  ended-term-unpaid gets its own status     (New)
     W04-ST-04  activity term line = range across pledges (New)

   It replaces w04-remittance-mb.driver.js, which asserted our V2 re-port.

   Run from this folder:  node w04-remittance-oc.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const path = require("path");
const { execFileSync } = require("child_process");

const shell = H.loadShell();
const S = shell.script;
const A = new H.Assert("W04 remittance-oc (build sheet 2026-09-10)");

const TAIL = "\r\n  render();\r\n})();\r\n";
A.eq(S.slice(-TAIL.length), TAIL, "the shell still ends in the render()/IIFE tail");
const EXPORTS =
  "\r\n  __EX={contentHTML:contentHTML,dashboards:dashboards,find:find," +
  "remOContent:remOContent,remOGlance:remOGlance,remOCompute:remOCompute," +
  "remOFindRow:remOFindRow,remOThru:remOThru,remOTotals:remOTotals," +
  "remOPledgeModalBody:remOPledgeModalBody,remOPledgeModalHTML:remOPledgeModalHTML," +
  "remODetailModalHTML:remODetailModalHTML,remODrillModalHTML:remODrillModalHTML," +
  "remOPledgeAgg:remOPledgeAgg,remOPledgeRows:remOPledgeRows,remOActBySeq:remOActBySeq," +
  "remOPledgePace:remOPledgePace,remOSchedule:remOSchedule,remOPlLabel:remOPlLabel," +
  "remOPledgesFor:remOPledgesFor,REMO_ACTIVITIES:REMO_ACTIVITIES,REMO_SORTS:REMO_SORTS," +
  "remOActCounts:remOActCounts,remOScheduleSummary:remOScheduleSummary," +
  "REMO_GRACE_DAYS:REMO_GRACE_DAYS,REMO_CARD_TIPS:REMO_CARD_TIPS,remOHead:remOHead," +
  "remOTable:remOTable,remOPaceCards:remOPaceCards,remOBehindCell:remOBehindCell," +
  "REMO_PAGE_SIZE:REMO_PAGE_SIZE,remOHandleClickOC:remOHandleClickOC," +
  "getModal:function(){return modal;},setModal:function(m){modal=m;}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";

const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, {
  globals: {
    __EX: null,
    Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    setInterval: function () { return 1; }, clearInterval: function () {},
    navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" },
    alert: function () {}, performance: { now: function () { return 0; } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; }
  }
});
const EX = env.ctx.__EX;
A.ok(EX && typeof EX.remOContent === "function", "the (OC) remittance block loaded and is reachable");

const REG = H.extractRegistry(S, "remittance-oc");
A.ok(REG.length >= 1, "the (OC) remittance widget has a registry card (" + REG.length + ")");
const base = REG.filter(function (w) { return w.id === "remO"; })[0];
A.ok(!!base, "the default (OC) card is present");
function W(over) { return Object.assign({}, base, over || {}); }
function money(s) { const m = /\$([\d,]+)/.exec(s); return m ? Number(m[1].replace(/,/g, "")) : null; }
function allMoney(s) { return (s.match(/\$[\d,]+/g) || []).map(function (x) { return Number(x.slice(1).replace(/,/g, "")); }); }

/* ---------- the base really is her code ------------------------------ */
(function () {
  A.ok(S.indexOf("W04 Remittance Pledges V2") > -1, "the W04 V2 block carries its region banner");
  A.ok(S.indexOf("Built from the remF block (renamed, attribute-isolated)") > -1, "the banner records that the block was built from the remF block");
  /* her machinery our V2 had dropped is back */
  ["remOPaceChip", "remOPaceLabel", "remOMiniBar", "remOCommitThru", "remOKpiHead",
   "remOPaceCards", "remOBandStats", "remODrillModalHTML"].forEach(function (fn) {
    A.contains(S, "function " + fn + "(", "her function " + fn + " is present (restored by the rebase)");
  });
  /* our V2-only machinery that must NOT have come across (range picker not adopted) */
  ["remORangeBounds", "remOSetRange", "remOSetCustomDate", "remORangePhrase",
   "remOGroups", "remOGrpHead", "remOVariance", "remOVarNoPledge",
   "remOBehindModalBody", "remOBehindModalHTML", "remOContentInner"].forEach(function (fn) {
    A.absent(S, "function " + fn + "(", "our V2-only " + fn + " did not survive the rebase");
  });
  A.absent(S, "REMO_USE_POPUP", "our V2 rollback flag is gone");
  A.absent(S, 'remO-baropen', "W04-EX-02: our separate pacing-bar action is gone");
  A.absent(S, 'modal.type==="remObehind"', "our top-5 behind pop-up is no longer dispatched");
  /* the hover popover stays isolated from Jo's, as it was before the rebase */
  A.contains(S, "data-remopop", "the (OC) hover popover keeps its own attribute");
})();

/* ---------- W04-AL-04: the widget keeps HER term-elapsed basis -------- */
(function () {
  const rows = EX.remOCompute(W({ size: "wide" }));
  A.ok(Array.isArray(rows) && rows.length > 0, "W04-AL-04: remOCompute returns the activity rows");
  const r0 = rows.filter(function (r) { return r.seq === 1; })[0];
  A.ok(!!r0 && typeof r0.daysAhead === "number", "W04-AL-04: the widget row still carries daysAhead (her day basis)");
  /* General Fund Apportionment, 24,000 over calendar 2026, thru 31 Jul 2026:
     term 364d, elapsed 211d -> expected = round(24000 * 211/364) = 13912 */
  A.eq(Math.round(r0.expected), 13912, "W04-AL-04: her term-elapsed expected is unchanged on the widget (13,912)");
  A.eq(r0.paid, 7200, "W04-AL-04: her paid figure is unchanged (7,200)");
  const wide = EX.remOContent(W({ size: "wide" }));
  A.contains(wide, "days behind schedule", "W04-AL-06: the day-count phrase stays on the widget, where the day basis applies");
})();

/* ---------- W04-AL-01: the pop-up lists PLEDGES ----------------------- */
const w = W({ size: "wide" });
EX.setModal({ type: "remOdetail", id: base.id, seq: 1 });
const pop = EX.remOPledgeModalHTML();
(function () {
  A.ok(pop && pop.length > 500, "W04-AL-01: the pledge pop-up renders");
  A.contains(pop, "rem-pledge-panel", "W04-AL-01: the pledge panel is present");
  A.contains(pop, "rem-pl-tbl", "W04-AL-01: the pledge table is present");
  /* her receipt list must NOT be what the activity click shows */
  A.absent(pop, "Receipts on or before", "W04-AL-01: her receipt list is not in the activity pop-up");
  A.absent(pop, "rem-ph-tbl", "W04-AL-01: her receipt table markup is not rendered here");
  A.contains(pop, "Pledges and instalments", "W04-AL-01: the header names what the pop-up shows");
  A.noEmDash(pop, "W04-AL-01 pop-up");
  /* her payment-history builder survives as the rollback path */
  A.contains(S, "function remODetailModalHTML(", "W04-AL-01: her payment-history builder is retained, unedited, as the rollback path");
})();

/* ---------- W04-AL-05: the strip, rebuilt to the instalment basis ----- */
const act = EX.remOActBySeq(1);
const agg = EX.remOPledgeAgg(w, act);
(function () {
  A.contains(pop, "Total pledged", "W04-AL-05: total pledged is kept");
  A.contains(pop, "Received to date", "W04-AL-05/T6: the received figure is kept, relabelled by T6");
  A.contains(pop, "Outstanding", "W04-AL-05: outstanding is kept");
  A.contains(pop, "% Paid", "W04-AL-05: % paid is kept");
  A.contains(pop, "Expected by instalments due", "W04-AL-05: the expected figure is LABELLED BY BASIS");
  A.contains(pop, "Pledges behind", "W04-AL-05/T4: the pledge-level exception count is present, split into two cells by T4");
  /* her term-elapsed expected and her day phrase must not appear in here, or the
     pop-up would answer the same question twice with different numbers */
  A.absent(pop, "Expected by now<", "W04-AL-05: her unqualified 'Expected by now' is not in the pop-up");
  A.absent(pop, "days behind schedule", "W04-AL-06: no day-count sentence in the pop-up");
  A.absent(pop, "behind the expected pace", "W04-AL-06: her day-basis note is not in the pop-up");
})();

/* ---------- the reconciliation that must survive the two-basis split -- */
(function () {
  const r = EX.remOCompute(w).filter(function (x) { return x.seq === 1; })[0];
  A.eq(agg.goal, r.total, "W04-AL-01: pledge goals sum EXACTLY to the activity total (" + agg.goal + ")");
  A.eq(agg.paid, r.paid, "W04-AL-01: pledge paids sum EXACTLY to the activity paid (" + agg.paid + ")");
  A.eq(agg.outstanding, r.total - r.paid, "W04-AL-01: pledge outstanding sums EXACTLY to the activity outstanding");
  /* and the paced figure is the one that legitimately differs */
  A.ok(Math.round(agg.dueAmt) !== Math.round(r.expected),
    "W04-AL-04: the instalment expected (" + Math.round(agg.dueAmt) + ") differs from her term-elapsed expected (" + Math.round(r.expected) + "), which is why it is labelled by basis");
})();

/* ---------- W04-AL-04 / ST-03: instalment pacing, and the ended term -- */
(function () {
  const thru = EX.remOThru(w);
  const pls = EX.remOPledgesFor(act, thru);
  A.ok(pls.length >= 60, "W04-AL-02: the activity carries a full pledge set (" + pls.length + ")");
  /* oldest-first allocation invariant: no funded instalment after an unfunded due one */
  let checked = 0, violations = 0, endedSeen = 0, labels = {};
  pls.forEach(function (pl) {
    const p = EX.remOPledgePace(pl, act, thru);
    labels[p.status] = (labels[p.status] || 0) + 1;
    if (p.status === "ended") endedSeen++;
    const sch = p.sch;
    let sawUnfunded = false;
    sch.forEach(function (x) {
      if (x.status === "missed" || x.status === "part") sawUnfunded = true;
      else if (x.status === "paid" && sawUnfunded) violations++;
    });
    /* the schedule must reconcile to the pledge's own paid figure */
    const applied = sch.reduce(function (s, x) { return s + x.applied; }, 0);
    if (Math.abs(applied - pl.paid) > 1) violations++;
    checked++;
  });
  A.ok(checked >= 60, "W04-AL-04: every pledge was paced by instalment (" + checked + ")");
  A.eq(violations, 0, "W04-AL-04: receipts allocate oldest-first and every schedule reconciles to its pledge's paid total");
  A.ok(endedSeen > 0, "W04-ST-03: at least one pledge has an ended term with money unpaid (" + endedSeen + ")");
  A.absent(JSON.stringify(labels), "farbehind\":0", "W04-AL-04: the payment bands are populated");
  /* the ended pledge is NOT labelled as merely behind */
  const ended = pls.map(function (pl) { return { pl: pl, p: EX.remOPledgePace(pl, act, thru) }; })
                   .filter(function (o) { return o.p.status === "ended"; })[0];
  A.eq(EX.remOPlLabel(ended.p), "Term ended, unpaid", "W04-ST-03: an ended, unpaid pledge reads 'Term ended, unpaid', not '60+ days behind'");
  A.ok(ended.p.outstanding > 0, "W04-ST-03: that pledge really does still owe money");
})();

/* ---------- W04-AL-04: labels are in PAYMENTS, not days --------------- */
(function () {
  A.absent(pop, "days ahead of schedule", "W04-AL-04: no day-count labels in the pop-up");
  const hasPaymentLabel = /\d+ payments? behind|On track|Paid in full|Prepaid|Term ended, unpaid|No pledge/.test(pop);
  A.ok(hasPaymentLabel, "W04-AL-04: the pop-up's chips are expressed in payments");
})();

/* ---------- W04-AL-02: ALL pledges, and the wording corrected --------- */
(function () {
  A.eq(agg.rows.length, EX.remOPledgesFor(act, EX.remOThru(w)).length,
    "W04-AL-02: the list holds EVERY pledge, not only the ones behind");
  A.absent(pop, "Pledges behind this activity", "W04-AL-02: the ambiguous 'behind' subtitle is gone");
  A.absent(pop, "most behind pace first", "W04-AL-02: the day-basis ordering phrase is gone");
  /* Owner ruling 2026-09-15: the explanatory caption is REMOVED from the drill.
     The AL-02 claim it used to carry (every pledge, most-missed-first) is still
     asserted, but now against the DATA and the sort rather than against prose,
     which is the stronger test anyway. */
  A.absent(pop, "Every pledge recorded against", "W04-AL-02: the caption is removed by ruling");
  A.absent(pop, "ordered by the most instalments missed", "W04-AL-02: the ordering prose is removed by ruling");
  A.absent(pop, "rem-pl-cap", "W04-AL-02: the caption element is gone from the markup");
  A.absent(shell.css, ".rem-pl-cap", "W04-AL-02: its CSS rules went with it, not left orphaned");
})();

/* ---------- owner ruling 2026-09-15: the drill pop-up is stripped back ---
   Three removals, and two deliberate keeps. The counts paragraph said nothing
   the strip and the per-row chips do not already say; the caption and the
   purple left bar were chrome. The no-goal and fully-paid STATE messages are
   kept, because without them those two states explain themselves nowhere. */
(function () {
  A.absent(pop, "have missed a payment", "the counts paragraph is gone from the drill");
  A.absent(pop, "remains outstanding across all", "its outstanding sentence is gone too");
  A.absent(pop, "at risk rather than behind", "the at-risk sentence is gone with it");
  A.absent(pop, "cannot be caught up", "the ended-term sentence is gone with it");
  /* it is suppressed behind a flag, not deleted, so it can come back in one line */
  A.contains(S, "REMO_DRILL_COUNTS_NOTE=false", "suppressed behind a rollback flag");
  A.contains(S, "agg.shortPledges+' of '+agg.n+' pledges have missed a payment: '",
    "the suppressed sentence is left intact as the rollback path");
  A.contains(S, "remOActNote(w,r,agg)", "remOActNote is still called, so the state messages survive");
  /* the purple left bar */
  A.absent(shell.css, "border-left:3px solid var(--am-400)", "the purple left bar is removed");
  /* what must remain: the pledge count and the pager */
  A.contains(pop, "pledges", "the pledge count line remains at the bottom");
  A.contains(pop, "page 1 of", "the page number remains at the bottom");
  A.contains(S, "remOPager(w,r.seq,pg,pages,total)", "the pager is still rendered by the panel");
  /* and the term line the owner did not strike through */
  A.contains(pop, "terms running", "the term range line is kept");
})();

/* ---------- W04-AL-07: five sorts, most-missed default ---------------- */
(function () {
  ["name", "begin", "end", "goal", "paid", "outstanding", "status"].forEach(function (k) {
    A.ok(!!EX.REMO_SORTS[k], "W04-AL-07: sort '" + k + "' is defined");
    A.contains(pop, 'data-k="' + k + '"', "W04-AL-07: column header for '" + k + "' is sortable");
  });
  const dflt = EX.remOPledgeRows(w, act);
  A.ok(dflt[0].p.shortCount >= dflt[dflt.length - 1].p.shortCount,
    "W04-AL-07: the default order puts the most instalments missed first");
  /* an explicit sort really reorders, and paging resets */
  const byOut = EX.remOPledgeRows(W({ plSort: "outstanding", plDir: -1 }), act);
  A.ok(byOut[0].p.outstanding >= byOut[byOut.length - 1].p.outstanding,
    "W04-AL-07: sorting by outstanding orders by amount descending");
  const oldest = EX.remOPledgeRows(W({ plSort: "begin", plDir: 1 }), act);
  A.ok(oldest[0].pl.begin <= oldest[oldest.length - 1].pl.begin,
    "W04-AL-07: oldest pledger first when begin date sorts ascending");
  const closest = EX.remOPledgeRows(W({ plSort: "end", plDir: 1 }), act);
  A.ok(closest[0].pl.end <= closest[closest.length - 1].pl.end,
    "W04-AL-07: closest to finishing first when end date sorts ascending");
  A.contains(S, "ws.plPage[seq2]=1", "W04-AL-07: a sort change resets the page");
})();

/* ---------- W04-AL-02: paging ----------------------------------------- */
(function () {
  A.eq(EX.REMO_PAGE_SIZE, 8, "W04-AL-02: the page size is 8, so the pop-up opens tidy");
  const shown = (pop.match(/data-action="remO-plopen"/g) || []).length;
  A.eq(shown, 8, "W04-AL-02: exactly one page of pledges renders at a time (" + shown + ")");
  A.contains(pop, "rem-pl-pager", "W04-AL-02: the pager is present");
  A.contains(pop, "page 1 of", "W04-AL-02: the pager states which page of how many");
})();

/* ---------- W04-ST-04: the activity has no term of its own ------------ */
(function () {
  A.contains(pop, "terms running", "W04-ST-04: the line gives the RANGE across the pledges");
  A.contains(pop, "the activity has no single term of its own", "W04-ST-04: it says so explicitly");
  A.absent(pop, "Pledge term Jan 1, 2026 to Dec 31, 2026", "W04-ST-04: one pledge's dates are no longer passed off as the activity's");
  A.ok(agg.minBegin < act.begin || agg.maxEnd > act.end,
    "W04-ST-04: the pledges genuinely span outside the activity's own dates, which is why the old line was wrong");
})();

/* ---------- W04-AL-03: export in the modal header, scoped ------------- */
(function () {
  A.contains(pop, 'data-action="remO-export-drill"', "W04-AL-03: the export button is in the modal header");
  A.contains(pop, "Export to Excel", "W04-AL-03: it is labelled Export to Excel");
  A.contains(pop, 'data-seq="1"', "W04-AL-03: the export is scoped to this one activity");
  A.contains(S, 'if(a==="remO-export-drill")return true;', "W04-AL-03: the export is display-only, as every export in this build is");
})();

/* ---------- W04-EX-01 / EX-02 / DE-01: ONE route, both triggers ------- */
(function () {
  /* her own remO-open action fires from the table row AND the pacing bar */
  const wideHtml = EX.remOContent(W({ size: "wide", view: "table" }));
  A.contains(wideHtml, 'data-action="remO-open"', "W04-EX-01: the table row carries her open action");
  const bars = EX.remOContent(W({ size: "wide", view: "bars" }));
  const barsHasOpen = bars.indexOf('data-action="remO-open"') > -1;
  A.ok(barsHasOpen, "W04-EX-02: the pacing bar carries THE SAME open action, so both routes share one modal");
  A.contains(S, 'modal={type:"remOdetail"', "W04-EX-01/02: that one action sets one modal type");
  /* and Detail uses the same modal, not a second implementation */
  const det = EX.remOContent(W({ size: "xwide", view: "table" }));
  A.contains(det, 'data-action="remO-open"', "W04-DE-01: Detail uses the same action, so it is one implementation");
  A.eq((S.match(/function remOPledgeModalHTML\(/g) || []).length, 1,
    "W04-DE-01: there is exactly one pledge pop-up builder for every size");
})();

/* ---------- the pop-up's own actions are wired ------------------------ */
(function () {
  A.contains(S, "function remOHandleClickOC(", "the pop-up's actions have their own handler in front of hers");
  A.contains(S, 'remO-")===0&&remOHandleClickOC(', "the shell dispatches to it");
  A.contains(S, "return remOHandleClick(a,id,t);", "and it falls through to Jo's renamed handler");
  A.contains(S, 'closest(\'[data-action="remO-plopen"]\')', "Enter and Space reach the pledge rows");
  const expanded = (function () {
    /* expand whatever the DEFAULT sort actually puts on page 1 - picking a fixed
       pledge id would only test the seed, and most-missed-first reorders it. */
    const first = EX.remOPledgeRows(W({}), act)[0].pl.id;
    const open = {}; open[first] = true;
    const ww = W({ plOpen: open });
    EX.setModal({ type: "remOdetail", id: base.id, seq: 1 });
    return EX.remOPledgeModalBody(ww, EX.remOFindRow(ww, 1));
  })();
  A.contains(expanded, "rem-plh", "W04-AL-01: a pledge row expands to its own instalment schedule");
  A.contains(expanded, "Amount due", "the schedule names what was due");
  A.contains(expanded, "oldest first", "the schedule explains the allocation order");
})();

/* ---------- states ---------------------------------------------------- */
(function () {
  const empty = EX.remOContent(W({ state: "empty" }));
  A.ok(empty && empty.length > 50, "W04-ST-01: her empty state still renders");
  /* the no-pledge-amount activity (seq 6) reconciles and says so */
  const w6 = W({});
  EX.setModal({ type: "remOdetail", id: base.id, seq: 6 });
  const p6 = EX.remOPledgeModalBody(w6, EX.remOFindRow(w6, 6));
  A.contains(p6, "nothing to pace against", "W04-ST-02: the no-pledge activity says there is nothing to pace against");
  const a6 = EX.remOPledgeAgg(w6, EX.remOActBySeq(6));
  A.eq(a6.goal, 0, "W04-ST-02: its pledge goals sum to zero, as the activity total does");
  A.eq(a6.outstanding, 0, "W04-ST-02: and nothing is outstanding");
})();

/* ---------- Jo is untouched ------------------------------------------- */
(function () {
  let hers = null;
  try {
    hers = H.baseline();
  } catch (e) { /* git unavailable: skip rather than fail */ }
  if (!hers) { A.ok(true, "her baseline could not be read from git, integrity check skipped"); return; }

  const herFns = (hers.match(/function remF[A-Za-z0-9_]*\(/g) || []);
  A.ok(herFns.length > 40, "her baseline has her remF block (" + herFns.length + " functions)");
  const missing = herFns.filter(function (f) { return S.indexOf(f) < 0; });
  A.eq(missing.length, 0, "her own remF functions all survive verbatim" +
    (missing.length ? " (missing: " + missing.slice(0, 4).join(", ") + ")" : ""));

  /* the retired rem widget's near-identical names must NOT have been renamed */
  A.contains(S, "function remFmtDate(", "her retired widget's remFmtDate is intact (the rename anchored on remF+uppercase)");
  A.contains(S, "function remFindRow(", "her retired widget's remFindRow is intact");

  /* her own hover popover attribute is untouched, so our listener cannot reach her bars */
  A.contains(hers, "data-rempop", "her baseline uses data-rempop");
  A.contains(S, ".rem-bwrap[data-rempop],.rem-minirow[data-rempop]", "her own hover listener still keys on her attribute");

  /* her payment-history modal is still what HER widget opens */
  A.contains(S, 'modal={type:"remFdetail"', "her activity click still opens HER payment history");
  A.contains(S, "function remFDetailModalHTML(", "her payment-history builder is untouched");
})();

/* =====================================================================
   ROUND 2 - the changes agreed 2026-09-10 (T1-T19 in the build sheet)
   ===================================================================== */

/* ---------- T13: the seven day grace, from the day AFTER the due date -- */
(function () {
  A.eq(EX.REMO_GRACE_DAYS, 7, "T13: the grace period is 7 days");
  const thru = EX.remOThru(w);
  let atrisk = 0, missed = 0, dueToday = 0, bad = 0;
  EX.REMO_ACTIVITIES.forEach(function (a) {
    if (a.total <= 0) return;
    EX.remOPledgesFor(a, thru).forEach(function (pl) {
      EX.remOPledgePace(pl, a, thru).sch.forEach(function (x) {
        if (x.status === "atrisk") { atrisk++; if (!(x.daysPast >= 1 && x.daysPast <= 7)) bad++; }
        if (x.status === "missed") { missed++; if (!(x.daysPast >= 8)) bad++; }
        if (x.daysPast === 0 && x.applied < x.amount && x.status !== "upcoming") dueToday++;
      });
    });
  });
  A.ok(atrisk > 0, "T13: at-risk instalments exist in the data (" + atrisk + ")");
  A.ok(missed > 0, "T13: behind instalments exist in the data (" + missed + ")");
  A.eq(bad, 0, "T13: every at-risk instalment is 1-7 days past due, and every behind one is 8+");
  A.eq(dueToday, 0, "T13: an unfunded instalment due TODAY is not flagged - it reads on track");
})();

/* ---------- T14: five statuses, at risk among them ------------------- */
(function () {
  const thru = EX.remOThru(w);
  const seen = {};
  EX.REMO_ACTIVITIES.forEach(function (a) {
    if (a.total <= 0) return;
    EX.remOPledgesFor(a, thru).forEach(function (pl) {
      seen[EX.remOPledgePace(pl, a, thru).status] = true;
    });
  });
  ["behind", "farbehind", "atrisk", "ended", "full", "onpace"].forEach(function (st) {
    A.ok(!!seen[st], "T14/T17: the seed produces the '" + st + "' status");
  });
  A.eq(EX.remOPlLabel({ status: "atrisk" }), "At risk", "T14: the at-risk label reads 'At risk'");
  A.eq(EX.remOPlLabel({ status: "ended" }), "Term ended, unpaid", "T14: term-ended-unpaid keeps its own label");
  A.eq(EX.remOPlLabel({ status: "full" }), "Paid in full", "T14: paid-in-full is kept, not replaced by a term-ended variant");
})();

/* ---------- T15/T16: at risk is never behind ------------------------- */
(function () {
  const thru = EX.remOThru(w);
  let checked = 0, leaks = 0, amtLeaks = 0;
  EX.REMO_ACTIVITIES.forEach(function (a) {
    if (a.total <= 0) return;
    EX.remOPledgesFor(a, thru).forEach(function (pl) {
      const p = EX.remOPledgePace(pl, a, thru), s = p.sum;
      /* shortCount counts only past-grace instalments */
      if (s.shortCount !== s.missed.length + s.part.length) leaks++;
      /* unfunded excludes at-risk money entirely */
      const expectMissed = s.missed.reduce(function (t, x) { return t + x.amount; }, 0) +
                           s.part.reduce(function (t, x) { return t + (x.amount - x.applied); }, 0);
      if (Math.abs(s.missedAmt - expectMissed) > 0.5) amtLeaks++;
      if (p.status === "atrisk" && p.shortCount !== 0) leaks++;
      checked++;
    });
  });
  A.ok(checked > 300, "T15: every pledge across every activity was checked (" + checked + ")");
  A.eq(leaks, 0, "T15: no at-risk instalment is counted as behind");
  A.eq(amtLeaks, 0, "T16: the unfunded amount counts only instalments past grace");
})();

/* ---------- the pop-up, rebuilt ------------------------------------- */
EX.setModal({ type: "remOdetail", id: base.id, seq: 1 });
const pop2 = EX.remOPledgeModalHTML();
const agg2 = EX.remOPledgeAgg(w, EX.remOActBySeq(1));

/* ---------- T1/T2/T3: scroll, padding, divider ---------------------- */
(function () {
  A.contains(pop2, "rem-pl-scroll", "T1: the pledge table has its own scrollport");
  /* T1 regression guard. Her .rem-drill-b is display:flex/column + overflow:hidden,
     so the dialog CLIPS rather than scrolls. A nested scroller only works if every
     ancestor between it and the flex container can shrink - and a flex item defaults
     to min-height:auto, which refuses to shrink below its content and silently kills
     the scroll. That was the actual bug. Assert the whole chain, not just the leaf. */
  A.contains(shell.css, ".rem-drill-b{padding:0;min-height:0;display:flex;flex-direction:column;overflow:hidden;}",
    "T1: her modal body is still the clipping flex column it always was");
  A.contains(shell.css, ".remo-root .rem-pledge-panel{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;}",
    "T1: the panel takes the leftover height and CAN shrink (min-height:0)");
  A.contains(shell.css, ".remo-root .rem-pl-tbl{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;}",
    "T1: the table can shrink too, or the scroller below it never gets a bounded height");
  A.contains(shell.css, ".remo-root .rem-pl-scroll{flex:1 1 auto;min-height:120px;overflow-y:auto;",
    "T1: the scrollport absorbs what is left, rather than being capped at a guessed height");
  A.contains(shell.css, ".remo-root .rem-drill-b>.rem-sum,", "T1: the strip is pinned and does not shrink");
  A.contains(shell.css, ".remo-root .rem-pledge-panel>.rem-pl-pager{flex:0 0 auto;}", "T1: the pager is pinned below the scroll");
  A.absent(shell.css, ".remo-root .rem-pl-scroll{max-height:clamp",
    "T1: the guessed max-height cap is gone - it was what let the panel overflow the modal");
  A.contains(shell.css, ".rem-pl-head{", "T1: the head row rule exists");
  A.contains(shell.css, "position:sticky", "T1: the head row sticks");
  A.contains(shell.css, ".remo-root .rem-pledge-panel{margin-bottom:", "T2: the panel clears the footer");
  /* T3 asserted the caption was divided from the note by a rule. Owner ruling
     2026-09-15 removed BOTH the caption and the note, so there is nothing left
     to divide; T3 is now the absence check, and its CSS went with it. */
  A.absent(shell.css, ".rem-pl-cap", "T3: caption and its divider rule are both removed by ruling");
})();

/* ---------- T4/T5: wider modal, 7 strip cells, at-risk amount -------- */
(function () {
  A.contains(shell.css, ".remo-root.rem-drill-modal{width:min(880px", "T4: our modal is widened");
  A.contains(shell.css, ".rem-drill-modal{height:auto;max-height:88vh;width:min(760px,94vw)",
    "T4: her global modal rule still says 760 - ours is a scoped override, not an edit to hers");
  A.absent(shell.css, " .rem-drill-modal{width:min(880px",
    "T4: the 880 rule is never applied unscoped (the only match is the .remo-root class pair)");
  A.contains(shell.css, ".remo-root .rem-sum{grid-template-columns:repeat(4", "T4: the strip runs 4 cells per row");
  const cells = (pop2.match(/rem-sum-cell/g) || []).length;
  A.eq(cells, 7, "T4: the strip has 7 cells (" + cells + ")");
  A.contains(pop2, "Received to date", "T4: the strip uses the corrected vocabulary");
  A.contains(pop2, "Pledges behind", "T4: the behind count is its own cell");
  A.contains(pop2, "Pledges at risk", "T4: the at-risk count is its own cell");
  A.absent(pop2, "Pledges with a missed payment", "T4: the single combined cell is gone");
  A.ok(agg2.atRiskInstalments > 0, "T5: activity 1 has at-risk instalments to report (" + agg2.atRiskInstalments + ")");
  /* T5 REGRESSED BY RULING, AND IT IS RECORDED HERE RATHER THAN DELETED.
     T5 existed because the strip cannot be made to add up on its own: the
     at-risk money sits BETWEEN expected-minus-received and the unfunded
     figure (W04-T16), and the suppressed note was the only place the at-risk
     AMOUNT was ever named. The owner removed that note on 2026-09-15, so the
     strip now names the at-risk COUNT and never the amount: for activity 1
     that is 3 instalments worth 113, a figure no longer on screen anywhere.
     The count cell is still asserted; the amount is asserted ABSENT so the
     loss is explicit and a future reader cannot mistake it for an oversight.
     Restoring it is one line: REMO_DRILL_COUNTS_NOTE=true. */
  A.contains(pop2, "Pledges at risk", "T5: the at-risk COUNT cell survives in the strip");
  A.ok(agg2.atRiskAmt > 0, "T5: there is an at-risk amount that is now unnamed (" + agg2.atRiskAmt + ")");
  A.absent(pop2, "grace period, so it is at risk rather than behind",
    "T5: the at-risk AMOUNT is no longer named anywhere, an accepted consequence of the ruling");
})();

/* ---------- T6/T7/T8/T9: the widget table --------------------------- */
(function () {
  const head = EX.remOHead(w);
  A.contains(head, ">Seq. ", "T8: the Seq. column is back");
  A.contains(head, ">Annual ", "T6: Annual is restored");
  A.contains(head, ">Expected to date ", "T6: Expected to date");
  A.contains(head, ">Received to date ", "T6: Received to date");
  A.contains(head, ">Pledges behind ", "T10: the new column is in the head");
  A.absent(head, ">YTD ", "T6: no column is LABELLED YTD any more - the figures are cumulative, not year-to-date");
  A.contains(head, "it is not year-to-date", "T6: and a tooltip explains why the label changed");
  A.absent(head, '"annual","Pledge"', "T6: the old 'Pledge' heading is gone");
  /* T7: legacy order, with Pledges behind after Activity */
  const order = ["Seq.", "Activity", "Pledges behind", "Annual", "Expected to date", "Received to date", "Outstanding", "% Paid"];
  let last = -1, seq = true;
  order.forEach(function (lbl) { const at = head.indexOf(">" + lbl + " "); if (at <= last) seq = false; last = at; });
  A.ok(seq, "T7: the columns run " + order.join(" | "));
  const row = EX.remOContent(W({ size: "wide", view: "table" }));
  A.contains(row, "remO-seq", "T8: the row renders a Seq. cell");
  A.contains(row, "rem-mini-fill", "T9: Jo's % Paid progress bar is kept");
  A.contains(shell.css, ".remO-row{grid-template-columns:34px", "T7: the grid carries eight columns");
  /* header overlap guard: .remO-cell is nowrap + overflow:VISIBLE, so a header wider
     than its column spills over its neighbour rather than wrapping. Two long labels
     ("Expected to date", "Received to date") made that visible. The head row wraps
     instead, so assert the three rules that let it. */
  A.contains(shell.css, ".remO-head .remO-cell{white-space:normal;overflow:hidden;",
    "headers wrap instead of spilling over the next column");
  A.contains(shell.css, ".remO-head .wt-sort{display:inline;",
    "the sort control is inline, so its label flows like text and can wrap");
  A.contains(shell.css, ".remO-head{align-items:end;}",
    "a two-line header bottom-aligns with a one-line one");
  /* alignment: every money column right-aligned, none left */
  const hd2 = EX.remOHead(w), rw2 = EX.remOContent(W({ size: "wide", view: "table" }));
  A.absent(hd2, "remO-alignL", "no money header is left-aligned any more");
  A.absent(rw2, "remO-alignL", "and no money cell is either, so the figures line up");
  A.contains(shell.css, ".remO-num{text-align:right;}", "the money columns are right-aligned");
  A.absent(shell.css, ".remo-root .remO-row{grid-template-columns:38px",
    "T7: that grid rule is NOT scoped under remo-root, which is on the modal only and would never reach the table");
})();

/* ---------- T10: the Pledges behind count --------------------------- */
(function () {
  const c1 = EX.remOActCounts(w, EX.remOActBySeq(1));
  A.ok(c1.behind > 0, "T10: activity 1 reports pledges behind (" + c1.behind + ")");
  A.eq(c1.behind, agg2.shortPledges, "T10: the row count agrees with the pop-up's own behind count");
  A.ok(c1.atrisk >= 0 && c1.behind + c1.atrisk <= c1.n, "T10: behind and at risk are disjoint and bounded by the pledge count");
  const cell = EX.remOBehindCell(w, EX.remOCompute(w).filter(function (r) { return r.seq === 1; })[0]);
  A.absent(cell, "$", "T10: the cell is a count, never an amount");
  A.contains(cell, String(c1.behind), "T10: it shows the count");
  const zero = EX.remOBehindCell(w, EX.remOCompute(w).filter(function (r) { return r.seq === 6; })[0]);
  A.contains(zero, "remO-behind0", "T10: an activity with no pledges renders a quiet dash");
  /* sortable, like her other columns */
  A.contains(EX.remOHead(w), 'data-k="behind"', "T10: the column is sortable");
  const asc = EX.remORows ? null : null;
  const rowsD = EX.remOCompute(W({ remSort: "behind-desc" }));
  A.ok(Array.isArray(rowsD), "T10: sorting by the new key does not throw");
})();

/* ---------- T12: focusable info icons on the cards ------------------- */
(function () {
  ["behind", "ontrack", "ahead"].forEach(function (k) {
    A.ok(!!EX.REMO_CARD_TIPS[k], "T12: a definition exists for the '" + k + "' card");
    A.ok(EX.REMO_CARD_TIPS[k].indexOf("day") < 0, "T12: the '" + k + "' wording avoids day counts, per the owner");
  });
  A.contains(EX.REMO_CARD_TIPS.ahead, "no pledge amount set", "T12: the wording says where no-pledge pledges are counted");
  const cards = EX.remOPaceCards(W({ size: "wide" }), false);
  A.eq((cards.match(/remO-cardinfo/g) || []).length, 3, "T12: all three cards carry an info control");
  A.eq((cards.match(/remO-cardwrap/g) || []).length, 3, "T12: each sits in a wrapper");
  A.contains(cards, 'type="button" class="remO-cardinfo"', "T12: it is a real button, so keyboard focus reaches it");
  A.contains(cards, "data-tip", "T12: it uses the shell's tooltip engine, which listens on mouseover AND focusin");
  /* the icon must be a SIBLING of her card button, never nested inside it */
  A.ok(cards.indexOf("</button>" + '<button type="button" class="remO-cardinfo"') > -1,
    "T12: the info button follows the card button as a sibling, not nested inside it");
  const drill = EX.remOPaceCards(W({ size: "wide" }), true);
  A.eq((drill.match(/remO-cardinfo/g) || []).length, 3, "T12: the drill variant carries them too");
  A.contains(shell.css, ".remO-cardinfo:focus-visible", "T12: it has a visible focus ring");
})();

/* ---------- T17: the seed shows the states, and still reconciles ----- */
(function () {
  let ties = 0, breaks = 0;
  EX.remOCompute(w).forEach(function (r) {
    const act = EX.remOActBySeq(r.seq); if (!act) return;
    const a = EX.remOPledgeAgg(w, act);
    if (a.goal === r.total && a.paid === r.paid) ties++; else breaks++;
  });
  A.ok(ties >= 6, "T17: every activity still reconciles exactly after the seed change (" + ties + ")");
  A.eq(breaks, 0, "T17: no activity's pledges drift from its row");
  /* and the demo is no longer "everything behind" */
  const a1 = EX.remOPledgeAgg(w, EX.remOActBySeq(1));
  A.ok(a1.shortPledges < a1.n * 0.8,
    "T17: activity 1 is no longer almost entirely behind (" + a1.shortPledges + " of " + a1.n + ")");
  A.ok(a1.full > 0, "T17: it carries paid-in-full pledges (" + a1.full + ")");
  A.ok(a1.ended > 0, "T17: and term-ended-unpaid pledges (" + a1.ended + ")");
  A.ok(a1.atRiskPledges > 0, "T17: and at-risk pledges (" + a1.atRiskPledges + ")");
})();

/* ---------- T19: the empty state has two distinct meanings ----------- */
(function () {
  const noPledges = EX.remOContent(W({ state: "empty", size: "wide" }));
  const noScope = EX.remOContent(W({ state: "noscope", size: "wide" }));
  A.contains(noPledges, 'data-kind="empty"', "T19: the no-pledges state renders");
  A.contains(noPledges, "No remittance pledges yet", "T19: and says the organisation has none");
  A.contains(noScope, 'data-kind="noscope"', "T19: the nothing-in-range state renders and is a DIFFERENT kind");
  A.contains(noScope, "No pledge term covers this date", "T19: and says the pledges exist but miss the date");
  A.contains(noScope, "is still owed", "T19: it warns that an ended term's unpaid balance is still owed");
  A.contains(noScope, "Move the date back", "T19: and names the recovery, which the other state has none of");
  A.ok(noPledges !== noScope, "T19: legacy collapsed both into one message; these are two");
  /* both distinguish at Glance too */
  const kA = EX.remOContent(W({ state: "empty", size: "kpi" }));
  const kB = EX.remOContent(W({ state: "noscope", size: "kpi" }));
  A.contains(kA, "None set up", "T19: Glance distinguishes them as well");
  A.contains(kB, "None in range", "T19: with its own wording");
  const reg4 = REG.filter(function (r) { return r.id === "remO4"; })[0];
  A.ok(!!reg4 && reg4.state === "noscope", "T19: a driver fixture exists for the second state");
})();

/* ---------- Jo's own widget is still untouched by round 2 ------------ */
(function () {
  A.contains(S, '"annual","Pledge"', "her own table head still says Pledge, not Annual");
  A.contains(S, 'remFSortBtn(w,"paidamt","Paid")', "her own Paid heading is untouched");
  A.contains(shell.css, ".remF-row{display:grid;grid-template-columns:minmax(150px,2fr) 76px 80px 80px 80px 110px",
    "her own six-column grid is untouched");
  A.absent(S, ".remF-seq", "no Seq. column was added to her widget");
  A.absent(S, "remFActCounts", "the pledges-behind machinery exists only in ours");
  A.absent(S, "remFPledgesFor", "her widget has no pledge generator");
  /* scoped to HER function body: S holds both blocks, so a bare absent() would be
     testing our own block by accident */
  const herEmpty = (function () {
    const a = S.indexOf("function remFEmpty(");
    if (a < 0) return "";
    const b = S.indexOf("function remFSkeleton(", a);
    return S.slice(a, b > a ? b : a + 2000);
  })();
  A.ok(herEmpty.length > 100, "her remFEmpty body was located (" + herEmpty.length + " chars)");
  A.absent(herEmpty, "noscope", "her widget keeps its single empty state");
  A.contains(herEmpty, "No remittance pledges yet", "and its original wording");
  A.absent(S, "REMF_CARD_TIPS", "her cards have no info icons added");
  A.absent(S, "remF-cardinfo", "and no info control in her card markup");
})();

process.exit(A.report());
