/* One-off, 2026-09-27, owner: "fix her glimpse so the bubble start left to right and not up and down". Jo's
   Bank Balances Glance put the sparkline beside a stacked column in a 172px widget, so the column collapsed to
   29px and the sparkline overlapped the account chip (her G12 clipping). Now the Glance stacks: account chip,
   then amount with the overdrawn pill on the same line, then the sparkline running full width left to right. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const s = t.indexOf("  function bankGlance(w){"), e = t.indexOf("  function bankDrillModalHTML(){", s); if (s < 0 || e < 0) throw new Error("bankGlance range");
let fn = t.slice(s, e);
const swapN = function (a, b, n, label) { const k = fn.split(a).length - 1; if (k !== n) throw new Error("anchor x" + k + " (want " + n + "): " + label); fn = fn.split(a).join(b); console.log("edited: " + label + " x" + n); };
swapN("'<div class=\"kpi-row\"><div class=\"kpi-num\">'+", "'<div class=\"kpi-row bank-glrow\"><div class=\"kpi-num\">'+", 2, "glance row class");
swapN("'<div class=\"metric-value'+(neg?\" bank-neg\":\"\")+'\">'+bankMoney(end)+'</div>'+", "'<div class=\"bank-gl-line\"><div class=\"metric-value'+(neg?\" bank-neg\":\"\")+'\">'+bankMoney(end)+'</div>'+", 1, "single account: line opens");
swapN("'<div class=\"metric-value'+(negT?\" bank-neg\":\"\")+'\">'+bankMoney(val)+'</div>'+", "'<div class=\"bank-gl-line\"><div class=\"metric-value'+(negT?\" bank-neg\":\"\")+'\">'+bankMoney(val)+'</div>'+", 1, "all accounts: line opens");
/* the gl-sub (pill + delta) is the last child of kpi-num in both branches: close the line where kpi-num closes */
swapN("'</div>'+bankSpark(w)+'</div>';}", "'</div></div>'+bankSpark(w)+'</div>';}", 2, "line closes after the pill and delta (both branches)");
t = t.slice(0, s) + fn + t.slice(e);
const cssA = "  .bank-gl-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;}";
if (t.split(cssA).length !== 2) throw new Error("css anchor");
t = t.replace(cssA, cssA + NL +
  "  /* Glance (owner, 27 Sep): chip, then amount with the pill beside it, then the sparkline full width, left to right. */" + NL +
  "  .bank-glrow{flex-direction:column;gap:6px;padding:10px 12px;}" + NL +
  "  .bank-glrow .kpi-num{flex:0 0 auto;gap:2px;width:100%;}" + NL +
  "  .bank-glrow .bank-gl-top{margin-bottom:0;}" + NL +
  "  .bank-glrow .bank-gl-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;}" + NL +
  "  .bank-glrow .bank-spark{flex:0 0 auto;width:100%;height:40px;}");
console.log("edited: glance CSS");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
