/* =====================================================================
   review-pack.js , build docs/review/Wnn - Name.md for the owner to read.

     node _tools/review-pack.js W05        one widget
     node _tools/review-pack.js all        every undecided widget in the map

   Three sections, each verbatim from its source, no judgement added:
     1. Jo's PR feedback      her section of _ref/Design Review (Jo decisions on OC).md
                              (identical to her one comment on PR #3, 2026-09-23)
     2. Jo's notes in her final version
                              comment lines inside her regions of
                              _ref/jo-phase2-8958e49.html, her info-popover text
                              for the kind, and the registry rows she ships
     3. Our diff doc          our section of Jo vs Oisin - Design Differences.md
                              and of the Final Version Build Sheet (where present)
   Regions come from widget-map.json. Re-run any time; the file is overwritten.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const MAP = JSON.parse(fs.readFileSync(path.join(__dirname, "widget-map.json"), "utf8"));
const rd = function (p) { return fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r\n/g, "\n"); };

const REVIEW = rd("_ref/Design Review (Jo decisions on OC).md");
const DIFF = rd("_ref/oisin-docs/Jo vs Oisin - Design Differences.md");
const SHEET = rd("_ref/oisin-docs/Final Version Build Sheet - Jo vs OC (per widget, per size).md");
const JO = rd("_ref/jo-phase2-8958e49.html");
const JO_LINES = JO.split("\n");

/* the `## Wnn ...` section of a markdown doc, up to the next `## ` */
function section(md, wnn) {
  const re = new RegExp("^## " + wnn + "\\b[^\\n]*\\n", "m");
  const m = re.exec(md); if (!m) return null;
  const start = m.index;
  const rest = md.slice(start + m[0].length);
  const next = rest.search(/^## /m);
  return md.slice(start, next < 0 ? md.length : start + m[0].length + next).trim();
}

/* comment-only lines (and comment blocks) inside a region of Jo's file */
function commentsIn(startLine, endLine) {
  const out = []; let inBlock = false, buf = [], bufStart = 0;
  for (let i = startLine; i <= endLine && i < JO_LINES.length; i++) {
    const l = JO_LINES[i], t = l.trim();
    if (inBlock) { buf.push(t.replace(/\*\/.*$/, "").trim()); if (t.indexOf("*/") > -1) { inBlock = false; out.push({ line: bufStart + 1, text: buf.filter(Boolean).join(" ") }); buf = []; } continue; }
    if (t.startsWith("/*")) {
      if (t.indexOf("*/") > -1) out.push({ line: i + 1, text: t.replace(/^\/\*+\s*/, "").replace(/\s*\*+\/.*$/, "").trim() });
      else { inBlock = true; bufStart = i; buf = [t.replace(/^\/\*+\s*/, "").trim()]; }
    } else if (t.startsWith("//")) out.push({ line: i + 1, text: t.replace(/^\/\/\s*/, "") });
    else { const k = l.indexOf("//"); if (k > -1 && !/https?:\/\//.test(l) && !/['"][^'"]*\/\/[^'"]*['"]/.test(l)) out.push({ line: i + 1, text: l.slice(k + 2).trim() + "   (inline, on code)" }); }
  }
  return out.filter(function (c) { return c.text && !/^=+$/.test(c.text); });
}
function regionLines(spec) {
  /* returns [startIdx, endIdx] (0-based, inclusive) or null */
  if (spec.start) {
    const i = JO.indexOf(spec.start); if (i < 0) return null;
    const j = JO.indexOf(spec.end, i + spec.start.length); if (j < 0) return null;
    const a = JO.slice(0, i).split("\n").length - 1, b = JO.slice(0, j).split("\n").length - 1;
    return [a, b];
  }
  return null;
}
function grepLines(tokens) {
  const idx = [];
  JO_LINES.forEach(function (l, i) { if (tokens.some(function (t) { return l.indexOf(t) > -1; })) idx.push(i); });
  return idx;
}

function joNotes(w) {
  const jo = w.jo || {}; const kind = jo.kind; const notes = [];
  ["css", "js", "data"].forEach(function (part) {
    const spec = jo[part]; if (!spec) return;
    let cs;
    if (spec.start) { const r = regionLines(spec); cs = r ? commentsIn(r[0], r[1]) : []; if (!r) notes.push({ line: 0, text: "(region markers for " + part + " not found in her file: " + spec.start.slice(0, 40) + ")" }); }
    else { /* grep mode: comments on or within 2 lines of a matching line */
      const hits = grepLines(spec.grep); const seen = {}; cs = [];
      hits.forEach(function (i) { for (let k = Math.max(0, i - 2); k <= Math.min(JO_LINES.length - 1, i + 2); k++) { if (seen[k]) continue; seen[k] = 1; commentsIn(k, k).forEach(function (c) { cs.push(c); }); } });
    }
    cs.forEach(function (c) { c.part = part; notes.push(c); });
  });
  /* dedupe by line */
  const byLine = {}; notes.forEach(function (n) { byLine[n.line] = n; });
  const list = Object.keys(byLine).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return byLine[k]; });

  /* her info-popover text for this kind */
  let about = null;
  if (kind) {
    const m = new RegExp('if\\(w\\.kind==="' + kind + '"\\)return \\{h:[^}]*b:"([^"]*)"').exec(JO);
    if (m) about = m[1];
    else { const prefix = jo.prefix; const m2 = new RegExp("^\\s*" + prefix + ":\\{h:\"([^\"]*)\",b:\"([^\"]*)\"", "m").exec(JO); if (m2) about = m2[2]; }
  }
  /* registry rows she ships for this kind */
  const rows = kind ? JO_LINES.filter(function (l) { return l.indexOf('kind:"' + kind + '"') > -1 && /^\s*,?\{id:/.test(l); }).map(function (l) {
    const id = /id:"([^"]+)"/.exec(l), title = /title:"([^"]+)"/.exec(l), size = /size:"([^"]+)"/.exec(l), state = /state:"([^"]+)"/.exec(l);
    return (id ? id[1] : "?") + " · " + (title ? title[1] : "") + " · " + (size ? size[1] : "") + (state ? " · state " + state[1] : "");
  }) : [];
  return { list: list, about: about, rows: rows, kind: kind };
}

function build(wnn) {
  const w = MAP.widgets[wnn]; if (!w) throw new Error("unknown widget " + wnn);
  const name = w.name;
  const out = [];
  out.push("# " + wnn + " " + name + ": review pack");
  out.push("");
  out.push("Generated " + new Date().toISOString().slice(0, 10) + " by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/" + wnn + ".md`.");
  out.push("");
  out.push("| Source | Where | As of |");
  out.push("|---|---|---|");
  out.push("| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |");
  out.push("| 2. Jo's notes in her final version | comments and text inside her " + (w.jo && w.jo.kind ? "`" + w.jo.kind + "`" : "") + " regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |");
  out.push("| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |");
  out.push("");
  out.push("Our version in the build: " + (w.ours ? "`" + w.ours.kind + "` (prefix `" + w.ours.prefix + "`)" : "none") + ". Jo's live version: " + (w.jo ? "`" + w.jo.kind + "`" : "none") + ".");
  out.push("");

  out.push("---"); out.push(""); out.push("## 1. Jo's PR feedback"); out.push("");
  const rev = section(REVIEW, wnn);
  out.push(rev ? rev.replace(/^## [^\n]*\n/, "").trim() : "_Jo did not review this widget._");
  out.push("");

  out.push("---"); out.push(""); out.push("## 2. Jo's notes in her final version"); out.push("");
  const jn = joNotes(w);
  if (jn.about) { out.push("**Her info-popover text (what the widget is for):** " + jn.about); out.push(""); }
  if (jn.rows.length) { out.push("**Registry rows she ships (id · title · size):**"); out.push(""); jn.rows.forEach(function (r) { out.push("- " + r); }); out.push(""); }
  if (jn.list.length) {
    out.push("**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**"); out.push("");
    jn.list.forEach(function (c) { out.push("- L" + c.line + (c.part ? " [" + c.part + "]" : "") + ": " + c.text); });
  } else out.push("_No comments found in her regions (her code is sparsely commented; the code itself is the note)._");
  out.push("");

  out.push("---"); out.push(""); out.push("## 3. Our diff doc"); out.push("");
  const diff = section(DIFF, wnn);
  out.push("### 3a. Jo vs Oisin - Design Differences"); out.push("");
  out.push(diff ? diff.replace(/^## [^\n]*\n/, "").trim() : "_No section for " + wnn + "._");
  out.push("");
  const sheet = section(SHEET, wnn);
  out.push("### 3b. Final Version Build Sheet"); out.push("");
  out.push(sheet ? sheet.replace(/^## [^\n]*\n/, "").trim() : "_No Build Sheet section for " + wnn + " (detailed rows were only written for W01-W05)._");
  out.push("");

  out.push("---"); out.push(""); out.push("## Owner's ruling"); out.push("");
  out.push("_Fill in per item, or write the decision straight into `docs/decisions/" + wnn + ".md`._");
  out.push("");

  const file = path.join(ROOT, "docs", "review", wnn + " - " + name.replace(/[\\/:*?"<>|]/g, "") + ".md");
  fs.writeFileSync(file, out.join("\r\n"), "utf8");
  return { file: path.relative(ROOT, file), lines: out.length, review: !!rev, notes: jn.list.length, diff: !!diff, sheet: !!sheet };
}

const arg = (process.argv[2] || "").toUpperCase();
if (!arg) { console.log("usage: node _tools/review-pack.js <Wnn|all>"); process.exit(1); }
const targets = arg === "ALL" ? Object.keys(MAP.widgets).filter(function (k) { const w = MAP.widgets[k]; return !w.decided && (w.ours || w.jo); }) : [arg];
targets.forEach(function (wnn) { const r = build(wnn); console.log(wnn.padEnd(5) + r.file.padEnd(58) + r.lines + " lines  review:" + (r.review ? "y" : "-") + " notes:" + String(r.notes).padStart(3) + " diff:" + (r.diff ? "y" : "-") + " sheet:" + (r.sheet ? "y" : "-")); });
