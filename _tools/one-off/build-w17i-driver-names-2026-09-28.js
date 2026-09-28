/* =====================================================================
   build-w17i-driver-names-2026-09-28.js

   The last of the driver's old vocabulary: the empty-state copy and the
   option-list helper both moved from "campaign" to "purpose" in the
   rebuild, because a campaign is a real and different entity in the legacy
   data and the row unit is the purpose.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "w17-gifts-mb.driver.js");
let s = fs.readFileSync(FILE, "utf8");
const fix = x => x.split("\n").join("\r\n");

function swap(a0, b0, n) {
  const a = fix(a0), b = fix(b0), want = n || 1;
  const got = s.split(a).length - 1;
  if (got !== want) throw new Error("anchor appeared " + got + " times, wanted " + want + ": " + a0.slice(0, 80));
  s = s.split(a).join(b);
}

swap('"No gift or pledge campaigns yet"', '"No gift or pledge purposes yet"');
swap('"no campaigns to show yet"', '"no purposes to show yet"');
swap('A.contains(none, "No gift or pledge campaigns", "a filter matching nothing renders a stated empty state");',
     'A.contains(none, "No gift or pledge purposes match this selection", "a filter matching nothing renders a stated empty state");');
swap(`  /* the single-campaign fixture narrows the option list too */
  const one = W("gpF4");
  A.eq(ctx.gpFAllCampaigns(one).length, 1, "the single-campaign fixture offers one campaign");
  A.contains(ctx.gpFContentRoot(Object.assign({}, one, { size: "wide" })), "gpf-root", "the single-campaign card renders");`,
`  /* the single-purpose fixture narrows the option list too */
  const one = W("gpF4");
  A.eq(ctx.gpFAllPurposes(one).length, 1, "the single-purpose fixture offers one purpose");
  A.contains(ctx.gpFContentRoot(Object.assign({}, one, { size: "wide" })), "gpf-root", "the single-purpose card renders");`);
swap("  /* the empty and single-campaign fixtures, every tier */",
     "  /* the empty and single-purpose fixtures, every tier */");

fs.writeFileSync(FILE, s);
console.log("w17 driver: empty-state copy and the option-list helper renamed to purpose");
