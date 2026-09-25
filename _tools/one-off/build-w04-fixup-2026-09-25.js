/* One-off, 2026-09-25, follow-up to build-w04: Jo's v1 .rem-* stylesheet block was
   not remittance-only after all. Her W05 Receivables and W17 Gifts blocks use its
   pacing-bar and status-chip classes (rem-bwrap, rem-bartrack, rem-fill-*, rem-flag-*,
   rem-st-*, rem-sw-*, rem-lg-i, ...), and our own W04 block builds two class names
   dynamically ('rem-fill-'+state, 'rem-flag-'+state) that the token rename could not see.
     1. restore the whole v1 .rem-* block from the committed file into the shell, labelled
        as shared (removed later, when W05 and W17 are decided and nothing uses it)
     2. make W04's dynamic names its own: w04-fill-* / w04-flag-* with copied rules
   Anchored; aborts before writing on any miss. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, "..", ".."), FILE = path.join(ROOT, "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const head = cp.execSync('git -C "' + ROOT + '" show HEAD:index.html', { maxBuffer: 64 * 1024 * 1024 }).toString();
const once = function (s, n, label) { const i = s.indexOf(n); if (i < 0 || s.indexOf(n, i + 1) > -1) throw new Error("anchor: " + (label || n.slice(0, 60))); return i; };
const lineStart = function (s, i) { return s.lastIndexOf(NL, i - 1) + NL.length; };

/* 1. the v1 .rem-* block, verbatim from HEAD: header comment through the closing media rule */
const hHead = once(head, "   Remittance Pledges (prefix: rem)  , CSS block", "v1 rem CSS header");
const s = lineStart(head, head.lastIndexOf("/* =====", hHead));
const endMarker = head.indexOf("  .rem-sum{grid-template-columns:repeat(2,minmax(0,1fr));}" + NL + "}", s); if (endMarker < 0) throw new Error("v1 rem CSS end");
const e = head.indexOf(NL, head.indexOf("}", endMarker + 10)) + NL.length;
const v1css = head.slice(s, e);
if (v1css.indexOf(".rem-bwrap") < 0 || v1css.indexOf(".rem-fill-ontrack") < 0 || v1css.indexOf(".rem-st-behind") < 0) throw new Error("v1 rem CSS shape: " + v1css.length);
const label = "/* ===== Shell: remittance-derived shared primitives (.rem-row/.rem-cell/.rem-head table grid, .rem-bars/.rem-barrow/.rem-bartrack/.rem-fill-*/.rem-flag-* pacing bars, .rem-st-*/.rem-sw-* status chips and legend). Used by W05 Receivables and W17 Gifts (Jo's blocks). Remove when those are decided and nothing uses it. ===== */";
const anchor = ".rem-glance-cap,.gft-glance-cap{"; once(t, anchor, "rem/gft shared line");
const at = lineStart(t, t.indexOf(anchor));
t = t.slice(0, at) + label + NL + v1css + NL + t.slice(at);
console.log("restored v1 .rem-* CSS block: " + v1css.split(NL).length + " lines, labelled shared");

/* 2. W04's dynamic class names become its own */
const b0 = t.indexOf("/* ===== W04 Remittance Pledges V2 ===== */", t.indexOf("<script>")), b1 = t.indexOf("/* ===== end W04 Remittance Pledges V2 ===== */");
let blk = t.slice(b0, b1);
const n1 = (blk.match(/rem-fill-'\+/g) || []).length, n2 = (blk.match(/rem-flag-'\+/g) || []).length;
if (!n1 || !n2) throw new Error("dynamic prefixes not found: " + n1 + "/" + n2);
blk = blk.replace(/rem-fill-'\+/g, "w04-fill-'+").replace(/rem-flag-'\+/g, "w04-flag-'+");
t = t.slice(0, b0) + blk + t.slice(b1);
console.log("dynamic prefixes renamed: rem-fill- x" + n1 + ", rem-flag- x" + n2);
/* copies of the fill / flag rules, renamed, into the W04 CSS region */
const cssHead = head.slice(head.indexOf("<style"), head.indexOf("</style>"));
const rules = []; { let i = 0, media = null, depth = 0, buf = ""; while (i < cssHead.length) { const ch = cssHead[i]; if (ch === "{") { const pre = buf.trim(); buf = ""; if (pre.charAt(0) === "@") { media = pre; depth++; i++; continue; } const j = cssHead.indexOf("}", i); rules.push({ sel: pre, body: cssHead.slice(i + 1, j), media: depth ? media : null }); i = j + 1; continue; } if (ch === "}") { if (depth) { depth--; media = null; } buf = ""; i++; continue; } buf += ch; i++; } }
const copies = []; rules.forEach(function (r) { const sel = r.sel.replace(/\/\*[\s\S]*?\*\//g, "").trim(); if (!/\.rem-(fill|flag)-/.test(sel)) return; const ns = sel.replace(/\.rem-(fill|flag)-/g, ".w04-$1-").replace(/\.rem-([a-z0-9-]+)/g, function (m, x) { return t.indexOf(".w04-" + x + "{") > -1 || t.indexOf(".w04-" + x + " ") > -1 || t.indexOf(".w04-" + x + ".") > -1 || t.indexOf(".w04-" + x + ":") > -1 || t.indexOf(".w04-" + x + ",") > -1 ? ".w04-" + x : m; }); const rule = ns + "{" + r.body.trim() + "}"; copies.push(r.media ? r.media + "{" + rule + "}" : rule); });
if (!copies.length) throw new Error("no fill/flag rules found");
const endCss = once(t, "/* ===== end W04 Remittance Pledges V2 CSS ===== */", "W04 CSS end banner");
t = t.slice(0, lineStart(t, endCss)) + "  /* pacing fill and flag states, built dynamically as w04-fill-<state> / w04-flag-<state> */" + NL + copies.map(function (c) { return "  " + c; }).join(NL) + NL + t.slice(lineStart(t, endCss));
console.log("added " + copies.length + " w04-fill/flag rules to the W04 CSS region");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
