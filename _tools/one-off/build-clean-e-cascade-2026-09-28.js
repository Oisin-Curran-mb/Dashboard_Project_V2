/* One-off, 2026-09-28: put the copied W17 rules back in base position.

   When Jo's gifts block was deleted, the sixty classes our block borrowed were
   copied into its own CSS as gpf-*. They were appended at the END of the block,
   which silently inverted the cascade for the nine classes the block already
   declared itself.

   Before the copy, Jo's rules lived in her own cluster, EARLIER in the
   stylesheet, and ours overrode them. Her selectors were also one class less
   specific, so ours won on specificity too. After the copy both sides read
   `.gpf-root .gpf-*`, equal specificity, and the later copy won.

   Measured, not assumed: `.gpf-root .gpf-body` computed `display:block` from
   the copied rule, losing the block's own `display:flex` column layout. Eight
   more classes were in the same position.

   The fix is ordering, not deletion: the copied rules are the base and belong
   first, so the block's own deliberate overrides win on conflict while the
   copied declarations still fill everything they were copied in for. That is
   exactly the cascade that existed before her block was deleted.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");

const MARK = "  /* ----- W17: the shell classes this widget used to borrow from the retired gft";
const BANNER = '  /* ===== W17 Gifts Pledges V2 CSS , prefix gpF , kind "gifts" ===== */';
const CSSEND = "  /* ===== end W17 Gifts Pledges V2 CSS ===== */";

const iMark = t.indexOf(MARK);
const iBanner = t.indexOf(BANNER);
const iEnd = t.indexOf(CSSEND);
if (iMark < 0 || iBanner < 0 || iEnd < 0) throw new Error("the W17 CSS block landmarks were not all found");
if (!(iBanner < iMark && iMark < iEnd)) throw new Error("the copied run is not where it was left");

/* the copied run: from its own comment to the block's end banner */
const runStart = t.lastIndexOf(NL, iMark - 1) + NL.length;
const runEnd = t.lastIndexOf(NL, iEnd - 1) + NL.length;
let run = t.slice(runStart, runEnd);
if ((run.match(/\.gpf-root /g) || []).length < 80) throw new Error("the copied run looks too small: " + (run.match(/\.gpf-root /g) || []).length);
if (run.indexOf("gpf-root .gpf-prow{") < 0) throw new Error("the copied run lacks a landmark rule");

/* how many classes are declared on both sides, before the move */
const ownBefore = t.slice(iBanner, runStart);
const dupes = [...new Set((run.match(/\.gpf-root ([^{,]*)\{/g) || []))]
  .map(s => (/\.gpf-root (.*)\{/.exec(s) || [])[1])
  .filter(sel => sel && ownBefore.indexOf(".gpf-root " + sel + "{") > -1);

t = t.slice(0, runStart) + t.slice(runEnd);
const afterBanner = t.indexOf(NL, t.indexOf(BANNER)) + NL.length;
run = run.replace(
  "     draws with. Declarations are unchanged; only the names and the root scope are. ----- */",
  "     draws with. Declarations are unchanged; only the names and the root scope are." + NL +
  "     They sit FIRST, in base position, because that is where her cluster sat: the" + NL +
  "     block's own rules below are overrides and must keep winning. ----- */");
t = t.slice(0, afterBanner) + run + t.slice(afterBanner);

/* guards */
if (t.indexOf(MARK) < 0) throw new Error("the copied run was lost");
{
  const b = t.indexOf(BANNER), m = t.indexOf(MARK), e = t.indexOf(CSSEND);
  if (!(b < m && m < e)) throw new Error("the copied run did not land inside the block");
  const own = t.slice(t.indexOf(NL, m) + NL.length, e);
  if (own.indexOf(".gpf-root .gpf-body{flex:1") < 0) throw new Error("the block's own rules are no longer after the copy");
}
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
console.log("  the copied run moved to base position, ahead of the block's own rules");
console.log("  classes that were being overridden by the copy (" + dupes.length + "): " + dupes.join(" "));
