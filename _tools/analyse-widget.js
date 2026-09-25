/* =====================================================================
   analyse-widget.js , the read-only map needed before a widget's build.

     node _tools/analyse-widget.js W03 pr prF prO payroll payroll-mb payroll-oc

   Args: widget number, then the three function prefixes (Jo v1, Jo live,
   ours), then the three kinds. Prints:
     1. function families: count, line span, first/last name
     2. data constants per family (VAR_ prefixes = upper-cased prefix + "_")
     3. functions of the two families to delete that are CALLED from outside
        their family (candidates to keep in the shell)
     4. what our block calls outside itself (non-shell helpers it depends on)
     5. constants our block references
     6. registry rows per kind (line, id, title, size)
     7. shell hook lines for the three kinds / prefixes
     8. CSS rule runs for the prefixes, and any class used by non-family code
   Nothing is written.
   ===================================================================== */
"use strict";
const fs = require("fs"), path = require("path");
const a = process.argv.slice(2);
if (a.length < 7) { console.log("usage: node _tools/analyse-widget.js Wnn <v1prefix> <joPrefix> <ourPrefix> <v1kind> <joKind> <ourKind>"); process.exit(1); }
const [W, P1, PJ, PO, K1, KJ, KO] = a;
const raw = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"); const L = raw.split("\r\n");
const styleEnd = raw.indexOf("</style>"), scriptStart = raw.indexOf("<script>");
const lineOf = i => raw.slice(0, i).split("\r\n").length;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fam = n => new RegExp("^" + esc(PO) + "[A-Z_]").test(n) ? "O" : new RegExp("^" + esc(PJ) + "[A-Z_]").test(n) ? "J" : new RegExp("^" + esc(P1) + "[A-Z_]").test(n) ? "V1" : "-";
const defs = []; L.forEach((l, i) => { const m = /^\s*function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(l); if (m) defs.push({ name: m[1], line: i + 1, fam: fam(m[1]) }); });
const B0 = raw.indexOf("/* ===== " + W + " ", scriptStart), B1 = B0 > -1 ? raw.indexOf("\r\n/* ===== W", B0 + 10) : -1;
const blk = B0 > -1 ? raw.slice(B0, B1 > -1 ? B1 : raw.length) : "";
console.log("== 1. families ==");
["V1", "J", "O"].forEach(f => { const d = defs.filter(x => x.fam === f); console.log("  " + f.padEnd(3) + String(d.length).padStart(3) + " fns" + (d.length ? "  lines " + d[0].line + ".." + d[d.length - 1].line + "  " + d[0].name + " .. " + d[d.length - 1].name : "")); });
if (B0 > -1) console.log("  our block: lines " + lineOf(B0) + ".." + lineOf(B0 + blk.length) + " (" + blk.split("\r\n").length + ")");
console.log("\n== 2. data constants ==");
[[P1, "V1"], [PJ, "J"], [PO, "O"]].forEach(([p, f]) => { const up = p.toUpperCase() + "_"; const hits = []; L.forEach((l, i) => { const m = new RegExp("^\\s*var\\s+(" + esc(up) + "[A-Z0-9_]*)").exec(l); if (m) hits.push(m[1] + "@" + (i + 1)); }); console.log("  " + f.padEnd(3) + (hits.join(" ") || "(none with prefix " + up + ")")); });
const fnAt = [...raw.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => [m.index, m[1]]);
const enclosing = i => { let last = "(top)"; for (const [p, n] of fnAt) { if (p > i) break; last = n; } return last; };
["V1", "J"].forEach(f => {
  console.log("\n== 3. " + f + " functions called from outside " + f + " (keep these in the shell if the caller survives) ==");
  let any = false;
  defs.filter(d => d.fam === f).forEach(d => {
    const re = new RegExp("(?<![\\w$.])" + esc(d.name) + "\\s*\\(", "g"); let m; const out = new Set();
    while ((m = re.exec(raw))) { const ls = raw.lastIndexOf("\n", m.index) + 1; const line = raw.slice(ls, raw.indexOf("\n", m.index)); if (/^\s*function\s+/.test(line) && line.indexOf("function " + d.name) > -1) continue; if (/^\s*(\/\*|\*|\/\/)/.test(line)) continue; const c = enclosing(m.index); if (fam(c) !== f) out.add(c + "[" + fam(c) + "]@" + lineOf(m.index)); }
    if (out.size) { any = true; console.log("  " + d.name.padEnd(26) + [...out].slice(0, 5).join(", ")); }
  });
  if (!any) console.log("  (none)");
});
const SHELL = /^(if|for|while|function|return|switch|catch|typeof|var|new|Math|String|Number|Object|Array|JSON|Date|parseInt|parseFloat|isNaN|Boolean|RegExp|Set|Map|ICON|money|find|render|renderModal|renderOverlay|setStatus|showModal|setTimeout|clearTimeout|push|join|map|filter|reduce|sort|slice|forEach|replace|indexOf|toFixed|toLocaleString|Math|encodeURIComponent|popContent|triggerSelector|contentHTML|aboutOf|fmtAxis|tog|hideTip|escapeHTML|esc)$/;
const oDefs = new Set(defs.filter(d => d.fam === "O").map(d => d.name)); const calls = {};
[...blk.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(/g)].forEach(m => { const n = m[1]; if (!oDefs.has(n) && !SHELL.test(n) && n.length > 1) calls[n] = (calls[n] || 0) + 1; });
console.log("\n== 4. our block calls outside itself (non-shell) ==\n  " + (Object.keys(calls).sort().map(n => n + "x" + calls[n]).join("  ") || "(none)"));
console.log("\n== 5. constants referenced in our block ==\n  " + [...new Set(blk.match(/\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/g) || [])].join(" "));
console.log("\n== 6. registry rows ==");
[K1, KJ, KO].forEach(k => { L.forEach((l, i) => { if (l.indexOf('kind:"' + k + '"') > -1 && /^\s*,?\{id:/.test(l)) { const id = /id:"([^"]+)"/.exec(l), ti = /title:"([^"]+)"/.exec(l), sz = /size:"([^"]+)"/.exec(l); console.log("  L" + String(i + 1).padStart(5) + "  " + k.padEnd(12) + (id ? id[1] : "?").padEnd(8) + (sz ? sz[1] : "").padEnd(6) + (ti ? ti[1] : "")); } }); });
console.log("\n== 7. shell hook lines (outside our block) ==");
const hookRe = new RegExp('kind==="(' + [K1, KJ, KO].map(esc).join("|") + ')"|pop\\.type==="(' + [P1, PJ, PO].map(esc).join("|") + ')|modal\\.type==="(' + [P1, PJ, PO].map(esc).join("|") + ')|a==="(' + [P1, PJ, PO].map(esc).join("|") + ')-|a\\.indexOf\\("(' + [P1, PJ, PO].map(esc).join("|") + ')-"\\)|(' + [P1, PJ, PO].map(esc).join("|") + ')(HandleClick|HandleInput|Content|PopContent)\\(');
L.forEach((l, i) => { const p = raw.indexOf(l); if (B0 > -1 && p >= B0 && p < B0 + blk.length) return; if (hookRe.test(l) && !/^\s*function\s+/.test(l) && !/^\s*(\/\*|\*|\/\/)/.test(l)) console.log("  L" + String(i + 1).padStart(5) + "  " + l.trim().slice(0, 150)); });
console.log("\n== 8. CSS rule runs for ." + P1 + "- / ." + PJ.toLowerCase() + "- / ." + PO.toLowerCase() + "- ==");
const cssRe = new RegExp("^\\s*[^{]*\\.(" + [P1, PJ, PO].map(p => esc(p.toLowerCase())).join("|") + ")-", "i");
let runs = [], run = null; for (let i = 0; i < lineOf(styleEnd); i++) { if (cssRe.test(L[i])) { if (run && i - run[1] <= 2) run[1] = i; else { run = [i, i]; runs.push(run); } } }
runs.forEach(r => console.log("  " + (r[0] + 1) + "-" + (r[1] + 1) + " (" + (r[1] - r[0] + 1) + ")  " + L[r[0]].trim().slice(0, 90)));
console.log("== classes with these prefixes used by NON-family code (line: class) ==");
const shared = {}; for (let i = lineOf(styleEnd); i < L.length; i++) { const l = L[i]; const p = raw.indexOf(l); if (B0 > -1 && p >= B0 && p < B0 + blk.length) continue; const m = l.match(new RegExp("(?<![\\w-])(" + [P1, PJ, PO].map(p => esc(p.toLowerCase())).join("|") + ")-[a-z0-9-]+", "gi")); if (!m) continue; const enc = enclosing(p); if (fam(enc) !== "-") continue; if (/^\s*(\/\*|\*|\/\/)/.test(l)) continue; m.forEach(c => (shared[c] = shared[c] || []).push(i + 1)); }
Object.keys(shared).sort().forEach(c => console.log("  " + c.padEnd(22) + shared[c].slice(0, 5).join(",") + (shared[c].length > 5 ? " +" + (shared[c].length - 5) : "")));
if (!Object.keys(shared).length) console.log("  (none)");
