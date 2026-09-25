/* =====================================================================
   verify.js , the one command that proves index.html is sound.

     node _tools/verify.js              everything
     node _tools/verify.js w05 w18      only the drivers whose file name
                                        contains one of these tokens
     node _tools/verify.js --no-lint    skip the design-defect lint report

   Order: syntax-check (hard gate) -> every *.driver.js -> lint (report).
   Exit 1 if the syntax gate or any driver fails. Lint findings never fail
   the run; they are the auto-fix worklist (see lint.js header).
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const args = process.argv.slice(2);
const noLint = args.indexOf("--no-lint") > -1;
const filters = args.filter(function (a) { return a.charAt(0) !== "-"; }).map(function (a) { return a.toLowerCase(); });

function run(file, extra) {
  return spawnSync(process.execPath, [path.join(__dirname, file)].concat(extra || []), { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/* 1. syntax gate */
const syn = run("syntax-check.js");
process.stdout.write(syn.stdout);
if (syn.status !== 0) { console.log("\nVERIFY: stopped at the syntax gate"); process.exit(1); }

/* 2. drivers */
let drivers = fs.readdirSync(__dirname).filter(function (f) { return /\.driver\.js$/.test(f); }).sort();
if (filters.length) drivers = drivers.filter(function (f) { return filters.some(function (t) { return f.toLowerCase().indexOf(t) > -1; }); });
if (!drivers.length) { console.log("VERIFY: no drivers matched " + filters.join(", ")); process.exit(1); }

const rows = [];
let anyFail = false;
drivers.forEach(function (f) {
  const r = run(f);
  const out = (r.stdout || "") + (r.stderr || "");
  const m = /^(.+?): (\d+) passed, (\d+) failed, (\d+) assertions/m.exec(out);
  const failed = m ? Number(m[3]) : -1;
  const ok = r.status === 0 && failed === 0;
  if (!ok) anyFail = true;
  rows.push({ file: f, label: m ? m[1] : "(no summary: " + (r.status === null ? "crashed" : "exit " + r.status) + ")", pass: m ? m[2] : "-", fail: m ? m[3] : "-", ok: ok });
  if (!ok) {
    console.log("\n---- " + f + " ----");
    const failLines = out.split(/\r?\n/).filter(function (l) { return /^\s*FAIL|^FAILURES:|^ - |Error|error/.test(l); });
    console.log((failLines.length ? failLines : out.split(/\r?\n/).slice(-20)).join("\n"));
  }
});

console.log("\n" + "driver".padEnd(34) + "pass".padStart(6) + "fail".padStart(6) + "   result");
rows.forEach(function (r) {
  console.log(r.file.padEnd(34) + String(r.pass).padStart(6) + String(r.fail).padStart(6) + "   " + (r.ok ? "ok" : "FAIL") + "  " + r.label);
});
const totalPass = rows.reduce(function (s, r) { return s + (Number(r.pass) || 0); }, 0);
const totalFail = rows.reduce(function (s, r) { return s + (Number(r.fail) || 0); }, 0);
console.log("\nTOTAL " + totalPass + " passed, " + totalFail + " failed across " + rows.length + " drivers");

/* 3. lint (report only) */
if (!noLint) {
  const l = run("lint.js");
  process.stdout.write("\n" + l.stdout);
}

console.log(anyFail ? "\nVERIFY: FAILED" : "\nVERIFY: ALL DRIVERS GREEN");
process.exit(anyFail ? 1 : 0);
