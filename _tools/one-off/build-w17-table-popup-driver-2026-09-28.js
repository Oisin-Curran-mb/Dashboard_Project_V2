/* One-off, 2026-09-28: the W17 driver follows the table-row change.

   The Summary Table opens the giving ledger instead of expanding an inline
   donor drill, so sections 5 and 6, which tested the drill and the in-card
   pledge expansion, are replaced by one section testing the new behaviour.
   Nothing is merely deleted: every property those sections proved still has an
   assertion, moved onto the pop-up where the behaviour now lives.

   What section 5 proved, and where it goes:
     - the drill opened on page 1 at twenty a page  -> retired with the pager;
       the ledger is not paged, and its scroll container is asserted in §4
     - the purpose figures never moved while paging -> the figures are asserted
       against the ledger's summary, which is computed the same way
     - the donor sums rolled up to the purpose row  -> kept, against the
       ledger's own rows and the pace arithmetic
     - each purpose paged independently             -> retired with the pager
   Section 6's gift level now lives in the ledger and is covered there.
*/
"use strict";
const fs = require("fs"), path = require("path");
const P = path.join(__dirname, "..", "w17-gifts.driver.js");
const NL = "\r\n";
let lines = fs.readFileSync(P, "utf8").split(NL);

const s = lines.findIndex(l => l.indexOf("5. a row expands the donor breakdown") > -1);
const e = lines.findIndex((l, i) => i > s && l.indexOf("7. ordering rules") > -1);
if (s < 0 || e < 0) throw new Error("the section boundaries were not found");
const cut = lines.slice(s, e).join(NL);
if (cut.indexOf("gpFDonorRows") < 0 || cut.indexOf("ppage") < 0) throw new Error("the cut does not look like sections 5 and 6");

const NEW = `/* ------- 5. a table row opens the pop-up; it no longer expands in place ----
   The owner replaced the inline donor drill with the giving ledger on 28 Sep,
   so a purpose behaves the same way whether it is selected from a bar or from
   a table row. */
(function () {
  const w = fresh("gpF", { size: "xwide", gpFView: "table" });
  const html = ctx.gpFContent(w);
  /* the row is a pop-up trigger, not a disclosure */
  A.contains(html, 'data-gpf="baropen"', "a table row opens the pop-up");
  A.contains(html, 'aria-haspopup="dialog"', "and says so");
  A.absent(html, 'data-gpf="open"', "the expand action is gone");
  A.absent(html, 'aria-expanded', "a row is no longer a disclosure control");
  A.absent(html, "gpf-drill", "and nothing expands inside the card");
  A.absent(html, "gpf-pager", "so there is no in-card pager");
  A.eq(typeof ctx.gpFDonorPanel, "undefined", "the inline drill builder is deleted, not merely unused");
  A.eq(typeof ctx.gpFPager, "undefined", "the pager builder too");
  A.eq(typeof ctx.GPF_PAGE_SIZE, "undefined", "and the page size with them");
  /* the row still carries the caret, which now means it opens something */
  A.contains(html, "gpf-caret", "the row keeps its affordance");
  A.absent(shell.css, ".gpf-root .is-exp>.gpf-caret", "but not the rotation, since nothing expands");

  /* clicking a row opens the ledger for THAT purpose */
  const row = W("gpF");
  row.gpFView = "table";
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  const m = shim.captured["gpfModalRoot"];
  A.ok(m && m.length > 200, "the row opened the ledger");
  A.contains(m, LABELS[2], "and it is the ledger for the row's own purpose");
  A.contains(m, "every gift and pledge", "which is the same pop-up a bar opens");

  /* WHAT THE RETIRED DRILL PROVED, asserted against the pop-up instead: the
     purpose's own figures agree with the pledges behind it. */
  const win = ctx.gpFWindow(row);
  const purpose = ctx.gpFCampByLabel(row, LABELS[2]);
  const comp = ctx.gpFCampCompute(row).filter(function (r) { return r.label === LABELS[2]; })[0];
  A.ok(!!comp, "the purpose row was located");
  const pledges = ctx.gpFDonorsFor(purpose);
  A.ok(pledges.length > 40, "the purpose has a real pledge set behind it (" + pledges.length + ")");
  let sumRec = 0, sumDue = 0;
  pledges.forEach(function (pl) {
    const pace = ctx.gpFDonorPace(pl, ctx.gpFParse(win.end), win.end, win);
    sumRec += pace.received; sumDue += pace.due;
  });
  A.near(sumRec, comp.fromPledges, 0.02, "the pledges' received sums to the purpose's pledge payments");
  A.near(sumDue, comp.pledgeDue, 0.02, "and their due sums to the purpose's Pledge Due");
  A.near(comp.fromPledges + comp.other, comp.received, 0.02, "the two parts still sum to Received");
  /* every one of those pledges is reachable in the ledger, which is the point
     of replacing a paged drill with one scrolling list */
  const ledger = ctx.gpFLedgerRows(row, purpose, win);
  const pledgeEntries = ledger.filter(function (it) { return it.kind === "pledge"; });
  const withActivity = pledges.filter(function (pl) {
    const r = ctx.gpFDonorPace(pl, ctx.gpFParse(win.end), win.end, win);
    return r.pledgedIn > 0 || r.received > 0;
  });
  A.eq(pledgeEntries.length, withActivity.length, "every pledge with activity appears in the ledger, unpaged");
  gfire("detail-close", { "data-id": "gpF" });
  A.eq(shim.captured["gpfModalRoot"], "", "and the pop-up closes");
})();
`;

lines = lines.slice(0, s).concat(NEW.split("\n"), lines.slice(e));
let s2 = lines.join(NL);

/* ---------------- the scattered references ---------------- */
function swap(a0, b0, n) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const want = n === undefined ? 1 : n;
  const got = s2.split(a).length - 1;
  if (got !== want) throw new Error("anchor appeared " + got + " times, wanted " + want + ": " + a0.slice(0, 64));
  s2 = s2.split(a).join(b);
}
swap(`  const w = Object.assign({}, base, { gpFExp: {}, gpFPage: {}, gpFPlExp: {} }, over || {});`,
     `  const w = Object.assign({}, base, { gpFPlExp: {} }, over || {});`);
swap(`A.eq(ctx.GPF_PAGE_SIZE, 20, "donor breakdown page size is 20 (Step 4)");`,
     `A.eq(ctx.GPF_PAGE_SIZE, undefined, "the drill's page size went with the drill (28 Sep)");`);
swap(`  A.eq((rowsAll.match(/data-gpf="open"/g) || []).length, 7, "seven table rows unfiltered");
  A.eq((rowsOne.match(/data-gpf="open"/g) || []).length, 1, "one table row under the filter");`,
`  A.eq((rowsAll.match(/gpf-sumrow/g) || []).length, 7, "seven table rows unfiltered");
  A.eq((rowsOne.match(/gpf-sumrow/g) || []).length, 1, "one table row under the filter");`);
swap(`  A.eq(Object.keys(w.gpFExp).length, 0, "a campaign change clears expanded campaigns");
  A.eq(Object.keys(w.gpFPage).length, 0, "a campaign change clears drill paging");`,
`  A.eq(Object.keys(w.gpFPlExp).length, 0, "a purpose change clears the ledger's expanded rows");`);
swap(`  w.gpFCamp = "All purposes"; w.gpFView = "goal"; w.gpFExp = {}; w.gpFPage = {}; w.gpFPlExp = {};`,
     `  w.gpFCamp = "All purposes"; w.gpFView = "goal"; w.gpFPlExp = {};`);
/* that reset line lived inside the replaced section, so there is nothing left to edit */
/* the Summary Table no longer forbids the bar action: its rows use it */
swap(`        A.absent(html, 'data-gpf="baropen"', "Summary Table renders NO bars at " + sz);`,
`        /* the table's own rows carry baropen since 28 Sep, so the check is that
           it renders no BAR markup, not that it never opens the pop-up */
        A.absent(html, "gpf-prow", "Summary Table renders NO bars at " + sz);`);
/* ordering: the drill's own ordering went with it */
swap(`  const drill = ctx.gpFDonorRows(w, camp);`,
     `  const drill = ctx.gpFLedgerRows(w, camp, ctx.gpFWindow(w)).filter(function (it) { return it.kind === "pledge"; });`);
/* the table's order is read off the row class, not the retired action */
swap(`  const tOrder = (ctx.gpFContent(tw).match(/data-gpf="open" data-id="[^"]*" data-c="([^"]+)"/g) || [])`,
     `  const tOrder = (ctx.gpFContent(tw).match(/data-gpf="baropen" data-id="[^"]*" data-c="([^"]+)"/g) || [])`);
/* sweeps that seeded the retired expand state */
swap(`    return ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: v, gpFExp: { [LABELS[2]]: true } }));`,
     `    return ctx.gpFContent(fresh("gpF", { size: "xwide", gpFView: v }));`);
swap(`      return ctx.gpFContentRoot(fresh("gpF", { size: sz, gpFView: v, gpFExp: { [LABELS[2]]: true } }));`,
     `      return ctx.gpFContentRoot(fresh("gpF", { size: sz, gpFView: v }));`);
/* the declared-class list loses the retired drill classes */
swap(`  "gpf-nmtxt", "gpf-nm", "gpf-nmsub", "gpf-drill", "gpf-drill-tbl", "gpf-plrow", "gpf-drawer",`,
     `  "gpf-nmtxt", "gpf-nm", "gpf-nmsub", "gpf-drill-tbl", "gpf-drawer",`);
/* the drill's export went with it */
swap(`  gfire("export-donors", { "data-id": "gpF", "data-c": LABELS[2] });
  A.contains(env.log.status[env.log.status.length - 1], LABELS[2], "the donor export is purpose-scoped");
  A.contains(env.log.status[env.log.status.length - 1], "stub", "the donor export is a labelled stub");
  A.eq(env.log.status.length, n1 + 1, "it reported exactly once");`,
`  /* Both export stubs are gone: the header one on 28 Sep at the owner's
     request, the drill's when the drill was replaced by the pop-up. There is
     no export control left on this widget. */
  gfire("export-donors", { "data-id": "gpF", "data-c": LABELS[2] });
  A.eq(env.log.status.length, n1, "the retired drill export reports nothing, because it is gone");
  A.absent(shell.script, 'data-gpf="export', "no export action survives in the block");`);
/* the em-dash sweep no longer opens a drill */
swap(`          /* a gifts-only purpose has no donor pledges to drill into */
          const dr = ctx.gpFDonorRows(w, camp);
          const pid = dr.length ? dr[0].pl.id : "none";
          const w2 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFExp: { [lab]: true }, gpFPlExp: { [pid]: true } });`,
`          /* a gifts-only purpose has no pledges behind it */
          const dr = ctx.gpFDonorsFor(camp);
          const pid = dr.length ? dr[0].id : "none";
          const w2 = fresh("gpF", { size: sz, gpFView: v, gpFCamp: c, gpFPlExp: { [pid]: true } });`);
swap(`    A.eq(ctx.gpFDonorRows(wAll, ctx.gpFCampByLabel(wAll, giftsOnly[0].label)).length, 0,
      "and it genuinely has no donor pledges to drill into");`,
`    A.eq(ctx.gpFDonorsFor(ctx.gpFCampByLabel(wAll, giftsOnly[0].label)).length, 0,
      "and it genuinely has no pledges behind it");`);
/* the header comment */
swap(`     5  a row expands the donor breakdown at 20 per page, totals invariant
     6  a pledge click expands its gifts, with media and motivation`,
`     5  a table row opens the pop-up (it expanded in place until 28 Sep), and
        the purpose's figures agree with the pledges behind it
     6  (merged into 4 and 5: the gift level lives in the pop-up now)`);

/* word boundaries matter here: gpFExportBtn contains gpFExp, and the driver
   still asserts that builder is undefined, which is correct and must stay. */
{
  const code = s2.replace(/\/\*[\s\S]*?\*\//g, "");
  const RETIRED = /(^|[^A-Za-z0-9_$])(gpFDonorRows|gpFExp|gpFPage|ppage)(?![A-Za-z0-9_$])/g;
  const hits = code.match(RETIRED) || [];
  if (hits.length) throw new Error("a retired name survives in the driver's code: " + JSON.stringify(hits.slice(0, 5)));
}
fs.writeFileSync(P, s2);
console.log("driver: sections 5 and 6 replaced, " + (e - s) + " lines out, and the scattered references updated");
