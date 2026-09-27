/* One-off, 2026-09-27: fit pass for Jo's re-laid Bank Glance. At 172px the amount, the overdrawn pill and the
   delta cannot share a line, so the line stacks (amount, then pill + delta); the sparkline takes the full width
   at 32px; gaps and padding trimmed so the 137px body holds it. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap("  .bank-glrow{flex-direction:column;gap:6px;padding:10px 12px;}", "  .bank-glrow{flex-direction:column;gap:4px;padding:8px 12px;}", "row gap and padding");
swap("  .bank-glrow .bank-gl-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;}", "  .bank-glrow .bank-gl-line{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;}", "amount line stacks amount over pill + delta");
swap("  .bank-glrow .bank-spark{flex:0 0 auto;width:100%;height:40px;}", "  .bank-glrow .kpi-spark.bank-spark{flex:0 0 auto;width:100%;max-width:none;height:32px;}" + NL + "  .bank-glrow .kpi-spark.bank-spark svg{height:100%;}", "sparkline full width, 32px");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
