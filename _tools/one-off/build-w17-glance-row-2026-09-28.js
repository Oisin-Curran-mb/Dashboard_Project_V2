/* One-off, 2026-09-28: the Glance stack fits its body.

   Measured after the owner's trim: the Glance needs 133px in a 103px box, and
   the card clips at 137px with overflow hidden, so the last line was cut
   through its own text.

   Where the 30px goes: the pill row takes 45px because its two pills will not
   sit side by side at Glance width and wrap, and the split caption takes 30px
   because it wraps too, even shortened.

   The house answer to a tight Glance is already settled: W15 Bank Balances put
   its pills in ONE row that scrolls sideways rather than wrapping. Same here,
   and scoped to the Glance tier alone so Explore and Detail are untouched.
   45 + 30 becomes about 22 + 15, which clears the 30px.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");

const ANCHOR = '  .gpf-root[data-tier="wide"] .gpf-barscroll{max-height:236px;}';
if (t.split(ANCHOR).length - 1 !== 1) throw new Error("the tier anchor was not found exactly once");
const add = [
  "  /* GLANCE ONLY: one row each, scrolling sideways rather than wrapping, which",
  "     is the pattern W15 settled on for the same problem. Glance clips at 137px",
  "     and the stack needed 133px in a 103px box before this. (28 Sep 2026) */",
  '  .gpf-root[data-tier="kpi"] .gl-sub{display:flex;flex-wrap:nowrap;align-items:center;gap:6px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;}',
  '  .gpf-root[data-tier="kpi"] .gl-sub::-webkit-scrollbar{display:none;}',
  '  .gpf-root[data-tier="kpi"] .gl-sub>*{flex:0 0 auto;}',
  '  .gpf-root[data-tier="kpi"] .gpf-glance-cap{flex-wrap:nowrap;white-space:nowrap;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;}',
  '  .gpf-root[data-tier="kpi"] .gpf-glance-cap::-webkit-scrollbar{display:none;}',
  '  .gpf-root[data-tier="kpi"] .gpf-glance-read{margin-top:var(--space-xtight,4px);gap:var(--space-xtight,4px);}',
  ANCHOR
].join(NL);
t = t.split(ANCHOR).join(add);

if (t.indexOf('.gpf-root[data-tier="kpi"] .gl-sub{') < 0) throw new Error("the Glance rules did not land");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
fs.writeFileSync(FILE, t);
console.log("Glance: pills and caption in one sideways-scrolling row each");
