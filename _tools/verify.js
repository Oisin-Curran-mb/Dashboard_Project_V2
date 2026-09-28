/* =====================================================================
   verify.js , the one command that proves index.html is sound.

     node _tools/verify.js              everything
     node _tools/verify.js w05 w18      only the drivers whose file name
                                        contains one of these tokens
     node _tools/verify.js --widget=W10 one widget, matched exactly against
                                        _tools/widget-map.json
     node _tools/verify.js --kind=loans the widget serving that widget kind
     node _tools/verify.js --tag=pager  every widget carrying that tag, so a
                                        change to a shared helper can be
                                        checked across all of its consumers
     node _tools/verify.js --list       print the widgets and their tags
     node _tools/verify.js --no-lint    skip the design-defect lint report

   The bare token form stays, because README documents it, but it is a
   substring match on the file name, so "w1" quietly selects eight drivers.
   The --widget, --kind and --tag forms are matched against the map and stop
   with an error on a value that does not exist, which is what you want when
   you meant to run one widget and got none.

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

/* ---- map-driven selection: --widget=Wnn, --kind=<kind>, --tag=<tag> ----
   The widget map is the single place that knows which driver belongs to which
   widget, which kind it serves and what it shares with its siblings. Selecting
   from it means a rename cannot leave the runner pointing at nothing. */
const MAP = JSON.parse(fs.readFileSync(path.join(__dirname, "widget-map.json"), "utf8"));
const WIDGETS = MAP.widgets;
function opt(name) {
  return args.filter(function (a) { return a.indexOf("--" + name + "=") === 0; })
             .map(function (a) { return a.slice(name.length + 3); });
}
function kindOf(w) { const f = w.final || w.ours || {}; return f.kind || null; }
if (args.indexOf("--list") > -1) {
  Object.keys(WIDGETS).sort().forEach(function (k) {
    const w = WIDGETS[k];
    console.log(k.padEnd(5) + String(w.name).padEnd(36) + String(kindOf(w) || "(no kind)").padEnd(14) + (w.tags || []).join(" "));
  });
  process.exit(0);
}
const selected = [];
opt("widget").forEach(function (v) {
  const k = v.toUpperCase();
  if (!WIDGETS[k]) { console.log("VERIFY: no such widget in the map: " + v); process.exit(1); }
  selected.push(WIDGETS[k].driver);
});
opt("kind").forEach(function (v) {
  const hit = Object.keys(WIDGETS).filter(function (k) { return kindOf(WIDGETS[k]) === v; });
  if (!hit.length) { console.log("VERIFY: no widget in the map serves kind: " + v); process.exit(1); }
  hit.forEach(function (k) { selected.push(WIDGETS[k].driver); });
});
opt("tag").forEach(function (v) {
  const hit = Object.keys(WIDGETS).filter(function (k) { return (WIDGETS[k].tags || []).indexOf(v) > -1; });
  if (!hit.length) {
    const all = {};
    Object.keys(WIDGETS).forEach(function (k) { (WIDGETS[k].tags || []).forEach(function (tg) { all[tg] = 1; }); });
    console.log("VERIFY: no widget carries the tag: " + v);
    console.log("known tags: " + Object.keys(all).sort().join(" "));
    process.exit(1);
  }
  hit.forEach(function (k) { selected.push(WIDGETS[k].driver); });
});

function run(file, extra) {
  return spawnSync(process.execPath, [path.join(__dirname, file)].concat(extra || []), { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/* 1. syntax gate */
const syn = run("syntax-check.js");
process.stdout.write(syn.stdout);
if (syn.status !== 0) { console.log("\nVERIFY: stopped at the syntax gate"); process.exit(1); }

/* 2. drivers */
let drivers = fs.readdirSync(__dirname).filter(function (f) { return /\.driver\.js$/.test(f); }).sort();
if (selected.length) {
  const want = {};
  selected.forEach(function (d) { want[d] = 1; });
  const missing = Object.keys(want).filter(function (d) { return drivers.indexOf(d) < 0; });
  if (missing.length) { console.log("VERIFY: the map names a driver that is not on disk: " + missing.join(", ")); process.exit(1); }
  drivers = drivers.filter(function (f) { return want[f]; });
} else if (filters.length) {
  drivers = drivers.filter(function (f) { return filters.some(function (t) { return f.toLowerCase().indexOf(t) > -1; }); });
}
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
