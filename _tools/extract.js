/* =====================================================================
   extract.js , read ONE widget instead of the whole file.

     node _tools/extract.js W05            ours + Jo's, written to _tools/.tmp/
     node _tools/extract.js W05 --print    same, to stdout
     node _tools/extract.js W18 --side aditya
     node _tools/extract.js shell          the shared plumbing both sides edit
     node _tools/extract.js W05 --side jo --file _ref/v1-main-e0a04c5.html

   Regions come from widget-map.json. A {start,end} region is sliced verbatim
   (inside the <style> part for css, the <script> part for js/data/registry).
   A {grep:[tokens]} region prints every line containing a token, +-2 lines,
   merged into ranges. Output lines carry their ORIGINAL line numbers so an
   Edit can be targeted without re-reading the file.

   Token budget: a widget's output is typically 300-1500 lines against 20,000
   for the file. Read the output, not index.html.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MAP = JSON.parse(fs.readFileSync(path.join(__dirname, "widget-map.json"), "utf8"));
const args = process.argv.slice(2);
const id = (args[0] || "").toUpperCase();
const print = args.indexOf("--print") > -1;
const sideArg = args.indexOf("--side") > -1 ? args[args.indexOf("--side") + 1] : null;
const fileArg = args.indexOf("--file") > -1 ? args[args.indexOf("--file") + 1] : null;

if (!id || (!MAP.widgets[id] && id !== "SHELL")) {
  console.log("usage: node _tools/extract.js <W01..W18|shell> [--side ours|jo|aditya] [--print] [--file path]\nknown: " + Object.keys(MAP.widgets).join(" "));
  process.exit(1);
}

const FILES = { ours: "index.html", final: "index.html", jo: "_ref/jo-phase2-8958e49.html", aditya: "_ref/aditya/Demo V2.html" };

function parts(html) {
  const s = /<script>([\s\S]*)<\/script>/.exec(html);
  const cStart = html.indexOf("<style"), cEnd = html.lastIndexOf("</style>");
  return {
    html: html,
    css: { text: html.slice(cStart, cEnd), offset: cStart },
    script: { text: s ? s[1] : "", offset: s ? html.indexOf(s[1]) : 0 }
  };
}
function lineOf(html, idx) { let n = 1; for (let i = 0; i < idx; i++) if (html.charCodeAt(i) === 10) n++; return n; }
function numbered(html, from, to) {
  const startLine = lineOf(html, from);
  return html.slice(from, to).split(/\r?\n/).map(function (l, i) { return String(startLine + i).padStart(6) + "  " + l; }).join("\n");
}

function sliceRegion(p, region, name) {
  const part = name === "css" ? p.css : p.script;
  const i = part.text.indexOf(region.start);
  if (i < 0) return "  (start marker not found: " + region.start + ")";
  const j = part.text.indexOf(region.end, i + region.start.length);
  if (j < 0) return "  (end marker not found: " + region.end + ")";
  return numbered(p.html, part.offset + i, part.offset + j + region.end.length);
}
function grepRegion(p, region) {
  const lines = p.html.split(/\r?\n/);
  const hit = [];
  lines.forEach(function (l, i) { if (region.grep.some(function (t) { return l.indexOf(t) > -1; })) hit.push(i); });
  if (!hit.length) return "  (no lines match: " + region.grep.join(" | ") + ")";
  const ranges = [];
  hit.forEach(function (i) {
    const a = Math.max(0, i - 2), b = Math.min(lines.length - 1, i + 2);
    if (ranges.length && a <= ranges[ranges.length - 1][1] + 1) ranges[ranges.length - 1][1] = b; else ranges.push([a, b]);
  });
  return ranges.map(function (r) {
    return lines.slice(r[0], r[1] + 1).map(function (l, k) { return String(r[0] + k + 1).padStart(6) + "  " + l; }).join("\n");
  }).join("\n   ...\n") + "\n  (" + hit.length + " matching lines in " + ranges.length + " ranges)";
}

function dump(side, spec, file) {
  const fp = path.join(ROOT, file);
  if (!fs.existsSync(fp)) return "  (file missing: " + file + ")";
  const p = parts(fs.readFileSync(fp, "utf8"));
  const out = ["==== " + id + " [" + side + "] " + file + " ===="];
  Object.keys(spec).forEach(function (k) {
    if (["kind", "prefix", "file"].indexOf(k) > -1) return;
    const r = spec[k];
    out.push("\n---- " + k + (r.start ? "  (" + r.start.slice(0, 50) + " .. " + r.end.slice(0, 40) + ")" : "  grep " + r.grep.join(" | ")) + " ----");
    out.push(r.start ? sliceRegion(p, r, k) : grepRegion(p, r));
  });
  return out.join("\n");
}

const entry = id === "SHELL" ? MAP.shell : MAP.widgets[id];
const sides = sideArg ? [sideArg] : Object.keys(entry).filter(function (k) { return k.charAt(0) !== "_" && entry[k] && typeof entry[k] === "object" && k !== "name"; });
const TMP = path.join(__dirname, ".tmp");
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP);

sides.forEach(function (side) {
  const spec = entry[side];
  if (!spec) { console.log(id + " [" + side + "]: none in the map"); return; }
  const text = dump(side, spec, fileArg || spec.file || FILES[side]);
  const lines = text.split("\n").length;
  if (print) console.log(text);
  else {
    const f = path.join(TMP, id + "." + side + ".txt");
    fs.writeFileSync(f, text, "utf8");
    console.log(id + " [" + side + "]  " + lines + " lines  ->  " + path.relative(ROOT, f));
  }
});
