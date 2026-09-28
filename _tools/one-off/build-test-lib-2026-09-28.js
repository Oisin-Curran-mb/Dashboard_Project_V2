/* One-off, 2026-09-28: the shared test library and per-widget tagging.

   Owner: "then check to see what test are also duplicates and see if you can
   have shared liabry but also make sure what widget uses what test and have it
   tagged so I can run test per widget still."

   Three additive changes. Nothing is removed and no driver's behaviour moves,
   so the 3069 assertions must still pass identically afterwards.

   1. `_tools/widget-map.json` gains a `tags` array per widget, DERIVED from the
      build rather than typed: which shared helpers the widget's own region
      actually calls, plus what shape its tests take (table, sort, pager,
      modal, popover, skeleton, chart). Deriving them means they cannot drift.

   2. `_tools/jo-port-driver.js` gains the exports the drivers were each
      hand-rolling: TAIL, NODE_GLOBALS, meta(), code(), outside(),
      assertMarkersUnique(). They are additive; adopting them in the fourteen
      drivers that duplicate the hosting block is a separate, reviewable step,
      deliberately not done unsupervised.

   3. `_tools/verify.js` keeps its documented name-substring filter and gains
      exact, validated selectors on top: --widget=W10, --kind=loans, --tag=pager.
      The substring form stays because README and the runner's own header
      document it, but it over-matches (`w1` hits eight drivers), so the exact
      forms error on an unknown value instead of silently running nothing.
*/
"use strict";
const fs = require("fs"), path = require("path");
const TOOLS = path.join(__dirname, "..");
const NL = "\r\n";

/* =============================================== 1. derive and write tags */
const H = require(path.join(TOOLS, "jo-port-driver.js"));
const MAPP = path.join(TOOLS, "widget-map.json");
const map = JSON.parse(fs.readFileSync(MAPP, "utf8"));
const shell = H.loadShell();

const SHARED = {
  escAttr: "escAttr", escText: "escText", parseISO: "parseISO",
  fmtDateLong: "fmtDateLong", MONTHS: "MONTHS", moneyFull: "moneyFull", bandFromDays: "bandFromDays"
};
const SHAPE = {
  table: /class="wt-row|wt-head/,
  sort: /wt-sort|data-[a-z]*="sort"|Sort\(/,
  pager: /pgbtn|pager|Load more/,
  modal: /modal-backdrop/,
  popover: /PositionPop|OpenPop|-pop"/,
  skeleton: /Skeleton\(|skel/,
  chart: /conic-gradient|<svg|sparkline|Spark/,
  search: /type="text"|Search |wfindq|placeholder="Search/,
  filter: /filter-chip|scope-chip/,
  checklist: /type="checkbox"|aria-checked/
};

function regionFor(w) {
  const spec = w.final || w.ours;
  if (!spec || !spec.js) return null;
  const js = spec.js;
  if (js.start && js.end) {
    const a = shell.script.indexOf(js.start);
    const b = shell.script.indexOf(js.end, a < 0 ? 0 : a);
    if (a < 0 || b < 0) return null;
    return shell.script.slice(a, b + js.end.length);
  }
  return null;
}

let tagged = 0;
Object.keys(map.widgets).sort().forEach(k => {
  const w = map.widgets[k];
  const region = regionFor(w);
  const tags = [];
  if (region) {
    const code = region.replace(/\/\*[\s\S]*?\*\//g, "");
    Object.keys(SHARED).forEach(n => {
      const re = new RegExp("(^|[^A-Za-z0-9_$])" + SHARED[n] + "\\s*[\\(\\.\\[]", "g");
      if (re.test(code)) tags.push("uses:" + n);
    });
    Object.keys(SHAPE).forEach(n => { if (SHAPE[n].test(region)) tags.push(n); });
  }
  w.tags = tags;
  tagged++;
  console.log("  " + k + "  " + (region ? (tags.length ? tags.join(" ") : "(no shared helper, no listed shape)") : "REGION NOT LOCATED, fix the map anchors"));
});

/* the map gains a note about what tags are for */
map._readme = map._readme || [];
if (Array.isArray(map._readme)) {
  const note = "`tags`: derived from the build by _tools/one-off/build-test-lib-2026-09-28.js, not typed. `uses:<helper>` means the widget's own region calls that helper from the shell's shared package; the rest describe the shape of the widget, and so of its tests. Select with `node _tools/verify.js --tag=<tag>`.";
  if (!map._readme.some(x => String(x).indexOf("`tags`") > -1)) map._readme.push(note);
}
let out = JSON.stringify(map, null, 2).split("\n").join(NL);
fs.writeFileSync(MAPP, out + NL);
console.log("  tagged " + tagged + " widgets in widget-map.json");
