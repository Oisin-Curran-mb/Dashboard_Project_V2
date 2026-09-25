/* One-off, 2026-09-25: rename OUR region banners in index.html to the
   "Wnn <Name> V2 <part>" form (owner request: widget name + V2, no OC / MB /
   Jo references). Jo's own lines are protected: any line that exists verbatim
   in _tools/baselines/index.a548419.html is left alone. The same substitutions
   are applied to every _tools/*.js driver and widget-map.json so the region
   anchors stay consistent. Idempotent. Kept for the audit trail. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const TOOLS = path.join(__dirname, "..");

const RULES = [
  /* CSS blocks, W09-W17 */
  ["MB loans (W10) , Loans With Balance Due (MB updated) , CSS", "W10 Loans With Balance Due V2 CSS"],
  ["end MB loans (W10)", "end W10 Loans With Balance Due V2 CSS"],
  ["MB time off (W09) , Payroll Scheduled Time Off (MB updated) , CSS", "W09 Payroll Scheduled Time Off V2 CSS"],
  ["end MB time off (W09)", "end W09 Payroll Scheduled Time Off V2 CSS"],
  ["MB time off (W09)", "W09 Payroll Scheduled Time Off V2 CSS"],
  ["MB fixed assets (W11) , Fixed Asset Values (MB updated) , CSS", "W11 Fixed Asset Values V2 CSS"],
  ["end MB fixed assets (W11)", "end W11 Fixed Asset Values V2 CSS"],
  ["MB fixed assets (W11)", "W11 Fixed Asset Values V2 CSS"],
  ["MB purchasing (W13) , Purchasing Management (MB updated) , CSS", "W13 Purchasing Management V2 CSS"],
  ["Bank Balances (MB updated) CSS", "W15 Bank Balances V2 CSS"],
  ["Accounts Payable By Due Date (MB updated) CSS", "W16 Accounts Payable By Due Date V2 CSS"],
  ["Gifts Pledges (MB updated) CSS", "W17 Gifts Pledges V2 CSS"],
  ["Side by side comparison note (cmpnote-mb) CSS", "Comparison note V2 CSS"],
  ["end Side by side comparison note CSS", "end Comparison note V2 CSS"],
  /* (OC) clone banners, CSS and JS share the text */
  ["(OC) CLONE of bgtF -> bgtO, kind budget-oc. V2 from stash@{0} 2026-09-08; Jo's adopted bgtF block above is untouched.", "W01 Budget Compared to Actual V2"],
  ["(OC) CLONE of bgtF -> bgtO", "W01 Budget Compared to Actual V2"],
  ["(OC) CLONE of penF -> penO, kind pension-oc. V2 from stash@{0} 2026-09-08; Jo's adopted penF block above is untouched.", "W02 Pension Plans V2"],
  ["(OC) CLONE of penF -> penO", "W02 Pension Plans V2"],
  ["(OC) CLONE of prF -> prO, kind payroll-oc. V2 from stash@{0} 2026-09-08; Jo's adopted prF block above is untouched.", "W03 Payroll Distributions V2"],
  ["(OC) CLONE of prF -> prO", "W03 Payroll Distributions V2"],
  ["(OC) CLONE of remF -> remO, kind remittance-oc. REBASED 2026-09-10 onto Jo's", "W04 Remittance Pledges V2"],
  ["(OC) CLONE of remF -> remO", "W04 Remittance Pledges V2"],
  ["   EXACT remF block (renamed, attribute-isolated); only the adopted W04 rows below differ.", "   Built from the remF block (renamed, attribute-isolated); only the adopted W04 rows below differ."],
  ["   Jo's remF block above is untouched. ===== */", "   ===== */"],
  ["(OC) CLONE of arF -> arO, kind receivables-oc. V2 from stash@{0} 2026-09-08; Jo's adopted arF block above is untouched.", "W05 Receivable Invoices Outstanding V2"],
  ["(OC) CLONE of arF -> arO", "W05 Receivable Invoices Outstanding V2"],
  ["Receivable Invoices Outstanding (MB updated) v W05 (prefix: arO, kind receivables-oc) , CSS", "W05 Receivable Invoices Outstanding V2 CSS (prefix: arO, kind receivables-oc)"],
  ["Receivable Invoices Outstanding (MB updated) , W05, ADDITIVE (prefix: arO, kind:\"receivables-oc\")", "W05 Receivable Invoices Outstanding V2 JS (prefix: arO, kind:\"receivables-oc\")"],
  ["(OC) CLONE of insF -> insO, kind insurance-oc. V2 from stash@{0} 2026-09-08; Jo's adopted insF block above is untouched.", "W06 Insurance Billing Plans V2"],
  ["(OC) CLONE of insF -> insO", "W06 Insurance Billing Plans V2"],
  ["Insurance Billing Plans (MB updated) v insO, kind \"insurance-oc\"", "W06 Insurance Billing Plans V2 CSS, prefix insO, kind \"insurance-oc\""],
  ["Insurance Billing Plans (MB updated) , W06, ADDITIVE (prefix: insO, kind:\"insurance-oc\")", "W06 Insurance Billing Plans V2 JS (prefix: insO, kind:\"insurance-oc\")"],
  ["(OC) CLONE of depF -> depO, kind deposits-oc. V2 from stash@{0} 2026-09-08; Jo's adopted depF block above is untouched.", "W07 Deposits on Hand V2"],
  ["(OC) CLONE of depF -> depO", "W07 Deposits on Hand V2"],
  ["Deposits on Hand (MB updated)  -  kind \"deposits-oc\", prefix depO", "W07 Deposits on Hand V2 JS, kind \"deposits-oc\", prefix depO"],
  ["W07 acctm modal, own shell + sizing (2026-09-17)", "W07 Deposits on Hand V2 CSS: account modal (2026-09-17)"],
  ["end W07 acctm modal, own shell + sizing", "end W07 Deposits on Hand V2 CSS"],
  /* W08 */
  ["My Status (OC) , mysO CSS", "W08 My Status V2 CSS"],
  ["MY STATUS (OC) , mysO data", "W08 My Status V2 data"],
  ["end My Status (OC) , mysO", "end W08 My Status V2"],
  ["My Status (OC) , mysO , kind:\"mystatus-oc\"", "W08 My Status V2 JS, kind:\"mystatus-oc\""],
  ["MY STATUS (OC) , mysO render", "W08 My Status V2 render"],
  /* W18 */
  ["W18 Financial KPI (MB updated)", "W18 Financial KPI V2"],
  /* registry banners */
  ["Purchasing Management (MB updated), prefix purF", "W13 Purchasing Management V2 registry, prefix purF"],
  ["Bank Balances (MB updated), prefix bkF", "W15 Bank Balances V2 registry, prefix bkF"],
  ["Accounts Payable By Due Date (MB updated), prefix apF", "W16 Accounts Payable By Due Date V2 registry, prefix apF"],
  ["Gifts Pledges (MB updated), prefix gpF", "W17 Gifts Pledges V2 registry, prefix gpF"],
  /* JS blocks, W09-W17 */
  ["Fixed Asset Values (MB updated) , prefix faF", "W11 Fixed Asset Values V2 JS , prefix faF"],
  ["end Fixed Asset Values (MB updated)", "end W11 Fixed Asset Values V2"],
  ["Purchasing Management (MB updated) , prefix purF", "W13 Purchasing Management V2 JS , prefix purF"],
  ["end Purchasing Management (MB updated)", "end W13 Purchasing Management V2"],
  ["Bank Balances (MB updated) , prefix bkF", "W15 Bank Balances V2 JS , prefix bkF"],
  ["end Bank Balances (MB updated)", "end W15 Bank Balances V2"],
  ["Accounts Payable By Due Date (MB updated) , prefix apF", "W16 Accounts Payable By Due Date V2 JS , prefix apF"],
  ["end Accounts Payable By Due Date (MB updated)", "end W16 Accounts Payable By Due Date V2"],
  ["end Gifts Pledges (MB updated)", "end W17 Gifts Pledges V2"],
  ["end Payroll Scheduled Time Off (MB updated)", "end W09 Payroll Scheduled Time Off V2"],
  ["end Loans With Balance Due (MB updated)", "end W10 Loans With Balance Due V2"]
];

function apply(text, counts) {
  RULES.forEach(function (r, i) {
    let n = 0;
    while (text.indexOf(r[0]) > -1) { text = text.replace(r[0], r[1]); n++; if (n > 500) throw new Error("runaway rule " + i); }
    counts[i] = (counts[i] || 0) + n;
  });
  return text;
}

/* 1. index.html, line by line, Jo's baseline lines protected */
const idx = path.join(ROOT, "index.html");
const baseline = new Set(fs.readFileSync(path.join(TOOLS, "baselines", "index.a548419.html"), "utf8").split("\r\n"));
const lines = fs.readFileSync(idx, "utf8").split("\r\n");
const cIdx = {};
let changedLines = 0;
const out = lines.map(function (l) {
  if (baseline.has(l)) return l;
  const n = apply(l, cIdx);
  if (n !== l) changedLines++;
  return n;
});
fs.writeFileSync(idx, out.join("\r\n"), "utf8");
console.log("index.html: " + changedLines + " lines changed");

/* 2. drivers + map */
const cTools = {};
fs.readdirSync(TOOLS).filter(function (f) { return /\.js$|\.json$/.test(f); }).forEach(function (f) {
  const p = path.join(TOOLS, f);
  const before = fs.readFileSync(p, "utf8");
  const after = apply(before, cTools);
  if (after !== before) { fs.writeFileSync(p, after, "utf8"); console.log("  updated " + f); }
});

/* 3. leftovers of ours still carrying the old words (banner-shaped lines only) */
const left = out.filter(function (l) { return !baseline.has(l) && /\/\*\s*=+/.test(l) && /\(OC\)|MB updated|\bMB (loans|time off|fixed assets|purchasing)|mysO|cmpnote-mb/.test(l); });
console.log("\nrules with zero hits in index.html: " + RULES.map(function (r, i) { return cIdx[i] ? null : i; }).filter(function (x) { return x !== null; }).join(", "));
console.log("our banner lines still mentioning OC/MB/mysO: " + left.length);
left.forEach(function (l) { console.log("   " + l.trim().slice(0, 140)); });
