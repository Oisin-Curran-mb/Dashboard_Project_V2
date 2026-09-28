/* =====================================================================
   build-w17k-driver-tail-2026-09-28.js

   The tail of the em-dash sweep still swept the retired goal panel, which
   the rebuild deleted, and still called the ledger the most-behind modal.
   The sweep now covers the ledger under each of its three type filters and
   with a search term applied, which is more markup than the goal panel was.
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

swap(`  LABELS.forEach(function (l) {
    gfire("baropen", { "data-id": "gpF", "data-c": l });
    A.noEmDash(shim.captured["gpfModalRoot"], "the most-behind modal for " + l); n++;
    gfire("detail-close", { "data-id": "gpF" });
  });
  /* the retired donut's own markup, and the rollback layout, are swept too */
  n++;
  A.noEmDash(ctx.gpFGoalPanel(fresh("gpF", { size: "xwide" })), "the rollback goal panel"); n++;`,
`  LABELS.forEach(function (l) {
    gfire("baropen", { "data-id": "gpF", "data-c": l });
    A.noEmDash(shim.captured["gpfModalRoot"], "the giving ledger for " + l); n++;
    /* and under each type filter, and with a search applied */
    ["pledges", "gifts", "all"].forEach(function (f) {
      gfire("ledger-filter", { "data-id": "gpF", "data-v": f });
      A.noEmDash(shim.captured["gpfModalRoot"], "the ledger for " + l + ", filtered to " + f); n++;
    });
    A.noEmDash(gtype("a"), "the ledger for " + l + ", searched"); n++;
    A.noEmDash(gtype("zzzznomatch"), "the ledger for " + l + ", empty search"); n++;
    gtype("");
    gfire("detail-close", { "data-id": "gpF" });
  });`);

fs.writeFileSync(FILE, s);
console.log("w17 driver: the sweep covers the ledger, filtered and searched, not the retired goal panel");
