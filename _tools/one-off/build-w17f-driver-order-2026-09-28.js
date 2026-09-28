/* =====================================================================
   build-w17f-driver-order-2026-09-28.js

   The ordering section of the W17 driver still carried the goal-progress
   leftovers: an unused barOrder capture and a spread check on `prog`, the
   retired progress array. Bars are ordered most received first since the
   28 September rebuild, so the spread check measures received.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "w17-gifts-mb.driver.js");
let s = fs.readFileSync(FILE, "utf8");
const fix = x => x.split("\n").join("\r\n");

function swap(a0, b0) {
  const a = fix(a0), b = fix(b0);
  const got = s.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a0.slice(0, 80));
  s = s.split(a).join(b);
}

swap(
  `  /* bars: CLOSEST TO GOAL FIRST */
  const bars = ctx.gpFContent(w);
  const barOrder = (bars.match(/data-c="([^"]+)"/g) || []).map(function (s) { return s.slice(8, -1); });
  /* bars are ordered MOST RECEIVED first since 28 Sep (was goal progress) */
  const byRecv = ctx.gpFPurposeCompute(w).slice().sort(function (a2, b2) { return b2.received - a2.received; });
  const shown = (ctx.gpFGivingBars(w).match(/data-c="([^"]+)"/g) || []).map(function (m) { return /data-c="([^"]+)"/.exec(m)[1]; });
  A.eq(shown.join("|"), byRecv.map(function (r) { return r.label; }).join("|"),
    "bars are ordered most received first");
  A.ok(prog[0] > prog[prog.length - 1], "the fixture genuinely has a spread, so the order is meaningful");`,
  `  /* bars: MOST RECEIVED FIRST since the 28 Sep rebuild (was goal progress,
     and there is no per-purpose goal any more). */
  const byRecv = ctx.gpFPurposeCompute(w).slice().sort(function (a2, b2) { return b2.received - a2.received; });
  const shown = (ctx.gpFGivingBars(w).match(/data-c="([^"]+)"/g) || []).map(function (m2) { return /data-c="([^"]+)"/.exec(m2)[1]; });
  A.eq(shown.join("|"), byRecv.map(function (r) { return r.label; }).join("|"),
    "bars are ordered most received first");
  A.ok(byRecv[0].received > byRecv[byRecv.length - 1].received,
    "the fixture genuinely has a spread, so the order is meaningful");`
);

fs.writeFileSync(FILE, s);
console.log("w17 driver: bar ordering measured on received, goal leftovers gone");
