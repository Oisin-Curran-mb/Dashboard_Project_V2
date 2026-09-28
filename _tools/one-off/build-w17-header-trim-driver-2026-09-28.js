/* One-off, 2026-09-28: the W17 driver follows the header trim.

   The header export button, the Glance title chip and the long date-chip label
   are gone on the owner's instruction, so the assertions that pinned them now
   assert their absence instead. The decoupling section still has work to do:
   it existed to prove the block takes its button styling from the GLOBAL button
   family rather than from W04's stylesheet, and the ledger's footer buttons
   still make that point, so the check moves onto them rather than disappearing.
*/
"use strict";
const fs = require("fs"), path = require("path");
const P = path.join(__dirname, "..", "w17-gifts.driver.js");
let s = fs.readFileSync(P, "utf8");
const NL = "\r\n";
const fix = x => x.split("\n").join(NL);
function swap(a0, b0) {
  const a = fix(a0), b = fix(b0);
  const got = s.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a0.slice(0, 70));
  s = s.split(a).join(b);
}

/* ---------------- the decoupling section: the global button family ------- */
swap(`  /* (b) the export button asks for the GLOBAL button family and nothing else */
  const ex = ctx.gpFExportBtn(fresh("gpF", { size: "wide" }));
  A.contains(ex, 'class="btn naked sm gpf-export"', "export uses the global button classes");
  A.contains(ex, "Export", "the export button is labelled");`,
`  /* (b) the block's buttons ask for the GLOBAL button family and nothing else.
     The header export button was removed on 28 Sep at the owner's request, so
     the ledger's own footer buttons carry this check now. */
  gfire("baropen", { "data-id": "gpF", "data-c": LABELS[2] });
  const ex = shim.captured["gpfModalRoot"];
  A.contains(ex, 'class="btn naked sm"', "the ledger footer uses the global button classes");
  A.contains(ex, 'class="btn primary sm"', "and the global primary modifier for Close");
  gfire("detail-close", { "data-id": "gpF" });
  A.absent(ctx.gpFContent(fresh("gpF", { size: "wide" })), 'data-gpf="export"', "the header export button is gone (owner, 28 Sep)");
  A.absent(ctx.gpFContent(fresh("gpF", { size: "xwide" })), "Export", "and its label with it");`);
swap(`  A.cssDeclares(shell.css, ["btn", "gpf-export"], "the export button's styling exists");`,
     `  A.cssDeclares(shell.css, ["btn"], "the global button family is declared");`);
swap(`  A.absent(shell.css, ".remf-root .gpf-export", "the old W04-scoped export rule is gone");`,
     `  A.absent(shell.css, ".remf-root .gpf-", "the old W04-scoped rules are gone");`);

/* ---------------- the stub section ------------------------------------- */
swap(`  /* export is the only OTHER action; no workflow verb was invented (v1.3) */
  const n1 = env.log.status.length;
  gfire("export", { "data-id": "gpF", "data-what": "goal" });
  A.contains(env.log.status[env.log.status.length - 1], "stub", "the header export is a labelled stub");
  gfire("export-donors", { "data-id": "gpF", "data-c": LABELS[2] });
  A.contains(env.log.status[env.log.status.length - 1], LABELS[2], "the donor export is campaign-scoped");
  A.contains(env.log.status[env.log.status.length - 1], "stub", "the donor export is a labelled stub");
  A.eq(env.log.status.length, n1 + 2, "both exports reported exactly once each");
  /* the export follows the ACTIVE view */
  A.contains(ctx.gpFExportBtn(fresh("gpF", { gpFView: "goal" })), 'data-what="goal"', "export scoped to goal progress");
  A.contains(ctx.gpFExportBtn(fresh("gpF", { gpFView: "table" })), 'data-what="table"', "export scoped to the table");`,
`  /* The header export went on 28 Sep (owner). The drill keeps its own
     purpose-scoped export, and it is still a labelled stub. */
  const n1 = env.log.status.length;
  gfire("export-donors", { "data-id": "gpF", "data-c": LABELS[2] });
  A.contains(env.log.status[env.log.status.length - 1], LABELS[2], "the donor export is purpose-scoped");
  A.contains(env.log.status[env.log.status.length - 1], "stub", "the donor export is a labelled stub");
  A.eq(env.log.status.length, n1 + 1, "it reported exactly once");
  A.eq(typeof ctx.gpFExportBtn, "undefined", "the header export builder is deleted, not merely unused");`);

/* ---------------- the date chip label ---------------------------------- */
swap(`  A.contains(ctx.gpFRangePhrase(Object.assign(fresh("gpF"), { gpFRange: "thru", gpFEnd: "2026-08-19" })),
    "Gifts received through", "the default chip reads Gifts received through X");
  A.contains(ctx.gpFRangePhrase(Object.assign(fresh("gpF"), { gpFRange: "ytd" })), "Gifts from", "a windowed chip reads Gifts from X to Y");`,
`  /* The CHIP shows only the dates since 28 Sep (owner: "just the dates ... so
     it is smaller and fit better"). The full sentence stays in the aria-label
     and in the ledger's subtitle, where there is room for it. */
  const cleanThru = Object.assign(fresh("gpF"), { gpFRange: "thru", gpFEnd: "2026-08-19" });
  A.eq(ctx.gpFRangeShort(cleanThru), "Aug 19, 2026", "the default chip shows the date alone");
  A.eq(ctx.gpFRangeShort(Object.assign(fresh("gpF"), { gpFRange: "ytd" })), "Jan 1 to Aug 19, 2026",
    "a windowed chip shows the two dates alone");
  A.contains(ctx.gpFRangePhrase(cleanThru), "Gifts received through", "the full sentence survives for the aria-label");
  A.contains(ctx.gpFRangePhrase(Object.assign(fresh("gpF"), { gpFRange: "ytd" })), "Gifts from", "and for a windowed range");
  const chip = ctx.gpFRangeChip(cleanThru);
  A.contains(chip, 'aria-label="Gifts received through Aug 19, 2026, tap to change the dates"', "the chip's aria-label carries the meaning");
  A.contains(chip, '<span class="fc-label">Aug 19, 2026</span>', "and its visible label carries only the date");`);

/* ---------------- the Glance chip -------------------------------------- */
swap(`      A.absent(html, 'data-gpf="export"', "no export at Glance (" + v + ")");`,
`      A.absent(html, 'data-gpf="export"', "no export at Glance (" + v + ")");
      A.absent(html, "Gifts and Pledges", "Glance does not repeat the card title inside itself (owner, 28 Sep)");
      A.absent(html, "scope-chip", "and carries no scope chip at all (" + v + ")");`);

/* the header-block section note */
swap(`     8  the export button styles from the GLOBAL button family, and our`,
     `     8  the block's buttons style from the GLOBAL button family, and our`);

fs.writeFileSync(P, s);
console.log("w17 driver: export, Glance chip and date-label assertions updated");
