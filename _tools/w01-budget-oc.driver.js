/* =====================================================================
   w01-budget-oc.driver.js , W01 Budget Compared to Actual, the (OC) widget
   AFTER the 2026-09-08 build-sheet implementation.

   The (OC) widget is JO'S OWN CODE (kind budget-oc, prefix bgtO) with one
   adopted change: the headline percent. Rows in the build sheet:
     W01-GL-01 / EX-01 / DE-01  headline percent      (Adopt ours)
     W01-GL-02 / EX-02 / DE-02  arrow glyph           (Keep Jo: absent)
     W01-GL-03                  her Glance sparkline  (Keep Jo: present)
     W01-GL-04                  her window caption    (Keep Jo)
     W01-ST-01                  no-budget states      (Keep Jo)

   Replaces w01-budget-mb.driver.js (kept as .superseded.bak).
   Run from this folder:  node w01-budget-oc.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const path = require("path");
const { execFileSync } = require("child_process");

const shell = H.loadShell();
const S = shell.script;
const A = new H.Assert("W01 budget-oc (build sheet 2026-09-08)");

const TAIL = "\r\n  render();\r\n})();\r\n";
A.eq(S.slice(-TAIL.length), TAIL, "the shell still ends in the render()/IIFE tail");
const EXPORTS =
  "\r\n  __EX={bgtOContent:bgtOContent,bgtOGlance:bgtOGlance,bgtOHeadlineInner:bgtOHeadlineInner," +
  "bgtOSpanVariance:bgtOSpanVariance,bgtOBasis:bgtOBasis};\r\n" +
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
A.ok(EX && typeof EX.bgtOContent === "function", "the (OC) budget block loaded and is reachable");

const REG = H.extractRegistry(S, "budget-oc");
const base = REG.filter(function (w) { return w.id === "bgtO"; })[0];
A.ok(!!base, "the default (OC) card is present");
function W(o) { return Object.assign({}, base, o || {}); }

/* ---------- the base really is her code ------------------------------ */
(function () {
  A.contains(S, "W01 Budget Compared to Actual V2", "the (OC) budget block is marked as a clone of hers");
  /* her Detail chart/table toggle, which our V2 had deleted, is back */
  A.contains(S, "bgtODetailToggle", "her Detail toggle is restored by the rebase");
  A.contains(S, 'a==="set-bgtO-detail"', "her Detail toggle handler is restored");
  A.eq(base.iB, "period", "the card carries HER second-panel default, not ours");
})();

/* ---------- W01-GL-01 / EX-01 / DE-01: the percent -------------------- */
(function () {
  const sizes = { kpi: "Glance (W01-GL-01)", wide: "Explore (W01-EX-01)", xwide: "Detail (W01-DE-01)" };
  Object.keys(sizes).forEach(function (sz) {
    const html = EX.bgtOContent(W({ size: sz }));
    A.contains(html, "bgtO-hl-pct", sizes[sz] + ": the headline percent renders");
    A.ok(/bgtO-hl-pct">[\d.]+%</.test(html), sizes[sz] + ": the percent is a number followed by a percent sign");
    A.noEmDash(html, sizes[sz]);
  });

  /* the figure: window variance over the window's posted budget, one decimal */
  const w = W({ size: "wide" });
  const sv = EX.bgtOSpanVariance(w, EX.bgtOBasis(w).type);
  const expect = Math.round(Math.abs(sv.v) / sv.sumB * 1000) / 10;
  const hv = EX.bgtOHeadlineInner(sv.v, false, sv.sumB);
  A.contains(hv.pct, String(expect) + "%",
    "the percent equals abs(variance) over the window's posted budget, to one decimal (" + expect + "%)");
  A.ok(sv.sumB > 0, "the denominator is the window's POSTED budget (" + sv.sumB + ")");

  /* unsigned: direction is carried by the sign already on her amount */
  A.absent(hv.pct, "+", "the percent itself is unsigned");
  A.absent(hv.pct, "−", "the percent itself carries no minus sign");
  A.contains(hv.html, "+", "her signed amount still carries the direction");

  /* no posted budget means no percent at all */
  A.eq(EX.bgtOHeadlineInner(500, false, 0).pct, "", "no percent when the window has no posted budget");
  A.eq(EX.bgtOHeadlineInner(null, false, 1000).pct, "", "no percent when there is no variance to show");
})();

/* ---------- W01-GL-02 / EX-02 / DE-02: no arrow glyph ---------------- */
(function () {
  ["kpi", "wide", "xwide"].forEach(function (sz) {
    A.absent(EX.bgtOContent(W({ size: sz })), "bgtO-hl-ar",
      "W01-GL-02: our arrow glyph is NOT adopted at " + sz);
  });
  const hv = EX.bgtOHeadlineInner(-500, false, 1000);
  A.absent(hv.html, "▼", "the headline carries no down triangle");
  A.absent(hv.html, "▲", "the headline carries no up triangle");
  A.contains(hv.html, "−", "a negative variance still reads with her minus sign");
})();

/* ---------- W01-GL-03 / GL-04: her Glance is otherwise hers ---------- */
(function () {
  const g = EX.bgtOGlance(W({ size: "kpi" }));
  A.contains(g, "<svg", "W01-GL-03: her Glance sparkline is kept");
  A.contains(g, "trend-range", "W01-GL-04: her own window caption control is kept");
  A.absent(g, "vs. budget,", "W01-GL-04: our 'vs. budget,' caption prefix is NOT adopted");
  A.absent(g, "bgt-caption", "W01-GL-04: our caption class is not used");
})();

/* ---------- W01-ST-01: the no-budget states are untouched ------------ */
(function () {
  const empty = EX.bgtOContent(W({ size: "wide", acctview: "expense", fy: "2027" }));
  A.ok(empty.length > 100, "W01-ST-01: the no-budget state renders");
  A.absent(empty, "bgtO-hl-pct", "W01-ST-01: no percent is shown when there is no budget set up");
})();

/* ---------- Jo is untouched ------------------------------------------ */
(function () {
  let hers = null;
  try {
    hers = H.baseline();
  } catch (e) {}
  if (!hers) { A.ok(true, "her baseline unreadable, integrity check skipped"); return; }
  const herFns = hers.match(/function bgtF[A-Za-z0-9_]*\(/g) || [];
  A.ok(herFns.length > 25, "her baseline has her bgtF block (" + herFns.length + " functions)");
  const missing = herFns.filter(function (f) { return S.indexOf(f) < 0; });
  A.eq(missing.length, 0, "her own bgtF functions all survive verbatim" +
    (missing.length ? " (missing: " + missing.slice(0, 3).join(", ") + ")" : ""));
  /* her own widget still shows no percent */
  A.contains(S, 'html:(neg?"−":"+")+money(Math.abs(v)),pct:""',
    "her own headline builder still returns an empty percent");
})();

process.exit(A.report());
