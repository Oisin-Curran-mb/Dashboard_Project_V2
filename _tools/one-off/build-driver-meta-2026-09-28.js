/* One-off, 2026-09-28: every driver takes its identity from the widget map.

   The label a driver passes to H.Assert is the only machine-readable thing
   verify.js has: it parses it out of stdout for the summary table. Fifteen
   drivers followed "Wnn <map name> (suffix)"; two had drifted to the kind in
   lowercase ("W13 purchasing", "W17 gifts"), so the summary table named the
   same widget two different ways depending on the row.

   Each driver now calls H.meta("Wnn"), which reads the map, and labels itself
   from that. The widget number, name, kind, prefix and tags then live in one
   place, and a rename cannot leave a driver claiming to be something else.

   Each driver's own suffix is preserved: it records how that widget was
   decided, which is worth keeping visible in the run output.
*/
"use strict";
const fs = require("fs"), path = require("path");
const TOOLS = path.join(__dirname, "..");

const SUFFIX = {
  W01: " (final)", W02: " (final)", W03: " (final)", W04: " (final)", W05: " (final)",
  W06: " (final)", W07: " (final)", W08: " (final)", W09: " (final)", W10: " (final)",
  W11: " (final)",
  W13: " (final, rebuilt on the legacy approval model)",
  W14: " (final)",
  W15: " (final, Jo's)", W16: " (final, Jo's)",
  W17: " (final, rebuilt 28 Sep)",
  W18: ""
};
const map = JSON.parse(fs.readFileSync(path.join(TOOLS, "widget-map.json"), "utf8"));
let n = 0;
Object.keys(map.widgets).sort().forEach(k => {
  const w = map.widgets[k];
  const p = path.join(TOOLS, w.driver);
  if (!fs.existsSync(p)) throw new Error("driver not on disk: " + w.driver);
  let s = fs.readFileSync(p, "utf8");
  const re = /const A = new H\.Assert\("([^"]*)"\);/;
  const m = re.exec(s);
  if (!m) throw new Error(w.driver + ": no Assert construction found");
  const suffix = SUFFIX[k] === undefined ? "" : SUFFIX[k];
  const repl = 'const META = H.meta("' + k + '");   /* number, name, kind, prefix and tags from _tools/widget-map.json */\n'
    + 'const A = new H.Assert(META.label + "' + suffix.replace(/"/g, '\\"') + '");';
  const NL = s.indexOf("\r\n") > -1 ? "\r\n" : "\n";
  s = s.replace(re, repl.split("\n").join(NL));
  fs.writeFileSync(p, s);
  console.log("  " + k + "  " + m[1] + "   ->   " + (k + " " + w.name + suffix));
  n++;
});
console.log("  " + n + " drivers now label themselves from the map");
