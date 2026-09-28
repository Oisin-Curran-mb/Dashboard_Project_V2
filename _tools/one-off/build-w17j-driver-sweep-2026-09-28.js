/* =====================================================================
   build-w17j-driver-sweep-2026-09-28.js

   Two last driver corrections.

   (a) The no-match empty-state assertion was made too specific. At the
       content root a filter that matches nothing falls into the same
       stated empty state as having no purposes at all; the point of the
       assertion is that something is STATED rather than blank, so it goes
       back to matching the copy by its opening.

   (b) The em-dash sweep assumed every purpose has at least one donor
       pledge. Memorial Gifts, added in the rebuild, has gifts and no
       pledge, which is exactly the case the old widget could not show. The
       sweep now skips the drill for a purpose with no pledges, and asserts
       that such a purpose exists so the branch is not silently dead.
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

swap('A.contains(none, "No gift or pledge purposes match this selection", "a filter matching nothing renders a stated empty state");',
     'A.contains(none, "No gift or pledge purposes", "a filter matching nothing renders a stated empty state");');

swap(`        const comp = ctx.gpFCampCompute(w);
        if (comp.length) {
          const lab = comp[0].label;
          const camp = ctx.gpFCampByLabel(w, lab);
          const pid = ctx.gpFDonorRows(w, camp)[0].pl.id;
          const w2 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFExp: { [lab]: true }, gpFPlExp: { [pid]: true } });
          A.noEmDash(ctx.gpFContentRoot(w2), sz + " / " + c + " / " + v + " / drilled"); n++;
        }`,
`        const comp = ctx.gpFCampCompute(w);
        if (comp.length) {
          const lab = comp[0].label;
          const camp = ctx.gpFCampByLabel(w, lab);
          /* a gifts-only purpose has no donor pledges to drill into */
          const dr = ctx.gpFDonorRows(w, camp);
          const pid = dr.length ? dr[0].pl.id : "none";
          const w2 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFExp: { [lab]: true }, gpFPlExp: { [pid]: true } });
          A.noEmDash(ctx.gpFContentRoot(w2), sz + " / " + c + " / " + v + " / drilled"); n++;
        }`);

swap(`  /* the empty and single-purpose fixtures, every tier */`,
`  /* the gifts-only purpose really is in the sweep, so the no-pledge branch
     above is exercised rather than silently skipped (28 Sep) */
  (function () {
    const wAll = fresh("gpF", { size: "xwide", gpFView: "goal" });
    const giftsOnly = ctx.gpFPurposeCompute(wAll).filter(function (r) { return r.pledgeTotal <= 0 && r.other > 0; });
    A.eq(giftsOnly.length, 1, "exactly one purpose in the fixture has gifts and no pledge");
    A.eq(ctx.gpFDonorRows(wAll, ctx.gpFCampByLabel(wAll, giftsOnly[0].label)).length, 0,
      "and it genuinely has no donor pledges to drill into");
    A.noEmDash(ctx.gpFContentRoot(fresh("gpF", { size: "xwide", gpFView: "goal", gpFCamp: giftsOnly[0].label })),
      "the gifts-only purpose, filtered to itself");
  })();
  /* the empty and single-purpose fixtures, every tier */`);

fs.writeFileSync(FILE, s);
console.log("w17 driver: empty-state copy matched by opening, sweep survives a gifts-only purpose");
