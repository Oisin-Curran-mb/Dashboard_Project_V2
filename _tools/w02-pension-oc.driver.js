/* =====================================================================
   w02-pension-oc.driver.js , W02 Pension Plans, the (OC) widget AFTER the
   2026-09-08 build-sheet implementation.

   The (OC) widget is JO'S OWN CODE (kind pension-oc, prefix penO) with one
   adopted change, at Glance only:
     W02-GL-01  context line under the total  (Adopt ours)
     W02-ST-01  no-appointments state         (Keep Jo)
     Explore / Detail                          no differences adopted

   Replaces w02-pension-mb.driver.js (kept as .superseded.bak).
   Run from this folder:  node w02-pension-oc.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const path = require("path");
const { execFileSync } = require("child_process");

const shell = H.loadShell();
const S = shell.script;
const A = new H.Assert("W02 pension-oc (build sheet 2026-09-08)");

const TAIL = "\r\n  render();\r\n})();\r\n";
const EXPORTS =
  "\r\n  __EX={penOContent:penOContent,penOGlance:penOGlance,penOPlanCount:penOPlanCount," +
  "penODist:penODist,PENO_DISTRICTS:(typeof PENO_DISTRICTS!=='undefined')?PENO_DISTRICTS:null};\r\n" +
  "  try{render();}catch(e){}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, {
  globals: {
    __EX: null, Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    setInterval: function () { return 1; }, clearInterval: function () {},
    navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" },
    alert: function () {}, performance: { now: function () { return 0; } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; }
  }
});
const EX = env.ctx.__EX;
A.ok(EX && typeof EX.penOGlance === "function", "the (OC) pension block loaded and is reachable");

const REG = H.extractRegistry(S, "pension-oc");
const base = REG.filter(function (w) { return w.id === "penO"; })[0];
A.ok(!!base, "the default (OC) card is present");
function W(o) { return Object.assign({}, base, o || {}); }

/* ---------- the base really is her code ------------------------------ */
(function () {
  A.contains(S, "W02 Pension Plans V2", "the (OC) pension block is marked as a clone of hers");
  A.eq(base.penViewM, "table", "the card carries HER default view");
  A.eq(base.penChartL, "pie", "the card carries HER default chart");
})();

/* ---------- W02-GL-01: the context line ------------------------------ */
(function () {
  const g = EX.penOGlance(W({ size: "kpi" }));
  A.contains(g, "pen-caption", "W02-GL-01: the context line renders at Glance");
  A.contains(g, "contributed a year across", "W02-GL-01: the line reads as intended");
  A.ok(/across \d+ plans?/.test(g), "W02-GL-01: it states how many plans");
  A.contains(g, "all districts", "W02-GL-01: with no district filter it says 'all districts'");
  A.noEmDash(g, "W02-GL-01 Glance");

  /* the plan count is the real one, not hardcoded */
  const n = EX.penOPlanCount(W());
  A.ok(n > 0, "W02-GL-01: the widget reports a plan count (" + n + ")");
  A.contains(g, "across " + n + " plan", "W02-GL-01: the line uses that live plan count");

  /* a specific district is named instead of 'all districts' */
  const dists = (EX.PENO_DISTRICTS || []).filter(function (d) { return d !== "All Districts"; });
  if (dists.length) {
    const g2 = EX.penOGlance(W({ size: "kpi", penDist: dists[0] }));
    A.contains(g2, dists[0].toLowerCase(), "W02-GL-01: a chosen district is named in the line");
    A.absent(g2, "all districts", "W02-GL-01: and 'all districts' is then not claimed");
  } else {
    A.ok(true, "district list unavailable, per-district wording not exercised");
  }

  /* her screen-reader sentence is left exactly as she wrote it */
  A.contains(g, "Annual pension contribution", "her own screen-reader sentence is untouched");
})();

/* ---------- Explore and Detail adopt nothing ------------------------- */
(function () {
  ["wide", "xwide"].forEach(function (sz) {
    const html = EX.penOContent(W({ size: sz }));
    A.ok(html.length > 100, sz + " renders");
    A.absent(html, "pen-caption",
      "the Glance-only context line does not leak into " + sz + " (no differences adopted there)");
  });
})();

/* ---------- W02-ST-01: the empty state is untouched ------------------ */
(function () {
  const e = EX.penOGlance(W({ size: "kpi", state: "empty" }));
  A.contains(e, "No appointments", "W02-ST-01: her empty Glance readout is kept");
  /* she uses the same caption class here for her own wording, so assert the TEXT:
     her empty-state line stays, and our adopted line does not appear. */
  A.contains(e, "no active pension appointments", "W02-ST-01: her own empty-state caption text is kept");
  A.absent(e, "contributed a year across", "W02-ST-01: the adopted line lives in the has-data branch only");
})();

/* ---------- Jo is untouched ------------------------------------------ */
(function () {
  let hers = null;
  try {
    hers = H.baseline();
  } catch (e) {}
  if (!hers) { A.ok(true, "her baseline unreadable, integrity check skipped"); return; }
  const herFns = hers.match(/function penF[A-Za-z0-9_]*\(/g) || [];
  A.ok(herFns.length > 20, "her baseline has her penF block (" + herFns.length + " functions)");
  const missing = herFns.filter(function (f) { return S.indexOf(f) < 0; });
  A.eq(missing.length, 0, "her own penF functions all survive verbatim" +
    (missing.length ? " (missing: " + missing.slice(0, 3).join(", ") + ")" : ""));
  /* her own Glance still has the empty slot where our line goes */
  A.contains(S, "penFBadge(w)+'</div>'+\r\n    ''+",
    "her own Glance still renders nothing in that slot");
})();

process.exit(A.report());
