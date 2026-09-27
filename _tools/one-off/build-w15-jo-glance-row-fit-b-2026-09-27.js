/* One-off, 2026-09-27: second fit pass for Jo's re-laid Bank Glance. The overdrawn pill and the delta pill cannot
   share a 146px line, so they stack; to hold chip + amount + pill + delta + sparkline in 137px the sparkline is
   24px, the row gap 3px and the padding 6px. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap("  .bank-glrow{flex-direction:column;gap:4px;padding:8px 12px;}", "  .bank-glrow{flex-direction:column;gap:3px;padding:6px 12px;}", "row gap 3, padding 6");
swap("  .bank-glrow .kpi-spark.bank-spark{flex:0 0 auto;width:100%;max-width:none;height:32px;}", "  .bank-glrow .kpi-spark.bank-spark{flex:0 0 auto;width:100%;max-width:none;height:24px;margin:0;}", "sparkline 24px");
swap("  .bank-glrow .kpi-num{flex:0 0 auto;gap:2px;width:100%;}", "  .bank-glrow .kpi-num{flex:0 0 auto;gap:2px;width:100%;margin:0;}", "kpi-num no margin");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
