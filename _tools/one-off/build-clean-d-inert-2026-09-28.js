/* One-off, 2026-09-28: the second CSS sweep.

   The first sweep dropped a selector group only when EVERY class in it was an
   orphan. That left rules like `.rem-row.full`, `.rem-flag .material-symbols-
   rounded` and `.rem-row .rem-cell.w04-pct` behind, because each pairs a dead
   class with a live one.

   Those rules are inert. A compound or descendant selector matches nothing when
   any one of its classes is never emitted, so a group containing an orphan can
   never match, whatever else is in it. That is the rule this pass applies.

   Orphan status is recomputed here on the same conservative basis as the first
   sweep: a class counts as emitted if its bare name appears anywhere outside
   the stylesheet, if any string literal contains a five-character prefix of it,
   or if any literal ends in a stem it starts with. Jo's accepted blocks and the
   live .ar- primitives are still held back for the owner.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
const DRY = !!process.env.DRY;
let t = fs.readFileSync(FILE, "utf8");
const lines0 = t.split(NL).length;

const a0 = t.indexOf("<style>"), b0 = t.indexOf("</style>");
const sheet = t.slice(a0, b0);
const outside = t.slice(0, a0) + t.slice(b0);

/* string literals, harvested with a tokenizer (a regex mis-pairs quotes) */
const frags = new Set();
{
  const s = outside;
  let i = 0, mode = "code", quote = "", buf = "";
  while (i < s.length) {
    const c = s[i], d = s[i + 1];
    if (mode === "code") {
      if (c === "/" && d === "*") { mode = "block"; i += 2; continue; }
      if (c === "/" && d === "/") { mode = "line"; i += 2; continue; }
      if (c === "/") {
        let p = i - 1; while (p >= 0 && /\s/.test(s[p])) p--;
        const prev = p >= 0 ? s[p] : "";
        if ("(,=:[!&|?{};+-*%~^".indexOf(prev) > -1 || prev === "") {
          let j = i + 1, inClass = false;
          while (j < s.length) {
            const ch = s[j];
            if (ch === "\\") { j += 2; continue; }
            if (ch === "[") inClass = true; else if (ch === "]") inClass = false;
            else if (ch === "/" && !inClass) { j++; break; }
            else if (ch === "\n") break;
            j++;
          }
          i = j; continue;
        }
        i++; continue;
      }
      if (c === '"' || c === "'" || c === "`") { mode = "str"; quote = c; buf = ""; i++; continue; }
      i++; continue;
    }
    if (mode === "block") { if (c === "*" && d === "/") { mode = "code"; i += 2; continue; } i++; continue; }
    if (mode === "line") { if (c === "\n") mode = "code"; i++; continue; }
    if (c === "\\") { buf += s[i + 1]; i += 2; continue; }
    if (c === quote) { if (buf.length >= 3) frags.add(buf); mode = "code"; i++; continue; }
    buf += c; i++;
  }
}
const stems = new Set();
frags.forEach(f => { const m = /([A-Za-z][A-Za-z0-9_]*(?:-[A-Za-z0-9_]*)*-)$/.exec(f); if (m && m[1].length >= 3) stems.add(m[1]); });
const emitted = new Set();
(outside.match(/[A-Za-z][A-Za-z0-9_-]*/g) || []).forEach(w => emitted.add(w));

const HOLD_BACK = /^(bank|mys|ap|ar|fkp|w04-flag|w04-fill)-|^(ar|bank|mys|ap|fkp)$/;
const isOrphan = c => {
  if (c.endsWith("-")) return false;
  if (emitted.has(c)) return false;
  if (HOLD_BACK.test(c)) return false;
  for (const st of stems) if (c.startsWith(st)) return false;
  for (let n = c.length; n >= 5; n--) { const p = c.slice(0, n); for (const f of frags) if (f.indexOf(p) > -1) return false; }
  return true;
};

let out = "", j = 0, dropped = 0, trimmed = 0;
const hit = [];
while (j < sheet.length) {
  const open = sheet.indexOf("{", j);
  if (open < 0) { out += sheet.slice(j); break; }
  const head = sheet.slice(j, open);
  let depth = 1, k = open + 1;
  while (k < sheet.length && depth > 0) { if (sheet[k] === "{") depth++; else if (sheet[k] === "}") depth--; k++; }
  const body = sheet.slice(open + 1, k - 1);
  const lastC = head.lastIndexOf("*/");
  const lead = head.slice(0, lastC > -1 ? lastC + 2 : 0);
  const sel = head.slice(lastC > -1 ? lastC + 2 : 0);
  const selTrim = sel.trim();
  if (selTrim.charAt(0) === "@") { out += lead + sel + "{" + body + "}"; j = k; continue; }
  const groups = selTrim.split(",").map(x => x.trim()).filter(Boolean);
  const dead = g => (g.match(/\.([A-Za-z][A-Za-z0-9_-]*)/g) || []).some(n => isOrphan(n.slice(1)));
  const keep = groups.filter(g => !dead(g));
  if (groups.length && !keep.length) { out += lead; dropped++; hit.push(selTrim); }
  else if (keep.length !== groups.length) { out += lead + sel.replace(selTrim, keep.join(",")) + "{" + body + "}"; trimmed++; hit.push(selTrim + "  (trimmed)"); }
  else out += lead + sel + "{" + body + "}";
  j = k;
}
const bal = x => { let d = 0; for (const c of x) { if (c === "{") d++; else if (c === "}") d--; if (d < 0) return -1; } return d; };
if (bal(sheet) !== 0 || bal(out) !== 0) throw new Error("the sweep unbalanced the stylesheet");
t = t.slice(0, a0) + out + t.slice(b0);
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

console.log("  inert rules dropped: " + dropped + ", selectors trimmed: " + trimmed);
hit.slice(0, 40).forEach(h => console.log("    " + h.slice(0, 110)));
if (DRY) { console.log("DRY RUN, nothing written"); process.exit(0); }
fs.writeFileSync(FILE, t);
console.log("inert CSS removed: " + lines0 + " -> " + t.split(NL).length + " lines");
