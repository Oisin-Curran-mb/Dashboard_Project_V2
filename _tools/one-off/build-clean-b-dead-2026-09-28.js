/* One-off, 2026-09-28: remove the dead JavaScript declarations and the orphan
   CSS rules left behind by four days of widget finalisations.

   Owner: "check all the code and see what code is no longer in use or can be
   deleted or cleaned."

   Two passes.

   PASS 1, JavaScript. Fifty top-level declarations that appear on exactly one
   line of the file, their own. Each was checked with comments and string text
   blanked, so a mention in prose or in a class-name string does not count as a
   reference. Each is cut whole, by brace or statement depth, and afterwards its
   name must not appear in any code anywhere.

   Deliberately NOT removed, and reported instead:
     - purFRejectStep / purFClearReject: no UI call site, but W13's driver
       drives them and asserts the resulting approval state. That is a
       missing-feature defect (the action was never wired to a button), not
       dead code, and deleting it would delete a tested model API.
     - FKP_TODAY: unused because W18's figures are documented prototype
       fixtures, so it is a documented anchor, not an accident.
     - arOTriggerSelector: safe on its own terms, but its job is now done by
       trigger closures inside WIDGETS.register, and that equivalence deserves
       a look before the older code goes.
     - a function-local var in W09, which is cosmetic.

   PASS 2, CSS. Every rule whose selector groups name only classes that no
   markup in the file emits. Orphan status is computed here rather than listed,
   so it cannot drift: a class counts as emitted if its bare name appears
   anywhere outside the stylesheet, OR if any string literal in the script is a
   prefix of it, which is how names like rem-flag-behind are assembled at run
   time. Prefixes belonging to Jo's accepted blocks (bank, mys, ap) and the
   still-live .ar- primitives are held back for the owner.

   Run with DRY=1 to print what would go without writing anything.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
const DRY = !!process.env.DRY;
let t = fs.readFileSync(FILE, "utf8");
const log = [];
const lines0 = t.split(NL).length;

/* ------------------------------------------------------------------ helpers */
/* blank comments and the TEXT of string literals, keeping the file's length so
   offsets still line up. Regex literals and template interpolations survive. */
function blankNonCode(s) {
  const out = s.split("");
  let i = 0, mode = "code", quote = "";
  while (i < s.length) {
    const c = s[i], d = s[i + 1];
    if (mode === "code") {
      if (c === "/" && d === "*") { mode = "block"; i += 2; continue; }
      if (c === "/" && d === "/") { mode = "line"; i += 2; continue; }
      if (c === "/") {
        /* A regex literal, or division? Decide from the previous code token. A
           regex body can contain a quote, so mistaking one for division sends
           the scanner into string mode and swallows the rest of the file. */
        let p = i - 1;
        while (p >= 0 && /\s/.test(s[p])) p--;
        const prev = p >= 0 ? s[p] : "";
        const word = /[A-Za-z0-9_$]/.test(prev) ? (/[A-Za-z_$][A-Za-z0-9_$]*$/.exec(s.slice(Math.max(0, p - 12), p + 1)) || [""])[0] : "";
        const opens = "(,=:[!&|?{};+-*%~^" .indexOf(prev) > -1 || prev === "" ||
          ["return", "typeof", "case", "in", "of", "new", "delete", "void", "do", "else", "yield", "await"].indexOf(word) > -1;
        if (opens) {
          /* skip to the unescaped closing slash, ignoring one inside a class */
          let j = i + 1, inClass = false;
          while (j < s.length) {
            const ch = s[j];
            if (ch === "\\") { j += 2; continue; }
            if (ch === "[") inClass = true;
            else if (ch === "]") inClass = false;
            else if (ch === "/" && !inClass) { j++; break; }
            else if (ch === "\n") break;
            j++;
          }
          i = j; continue;
        }
        i++; continue;
      }
      if (c === '"' || c === "'" || c === "`") { mode = "str"; quote = c; i++; continue; }
      i++; continue;
    }
    if (mode === "block") { if (c === "*" && d === "/") { mode = "code"; i += 2; continue; } if (c !== "\r" && c !== "\n") out[i] = " "; i++; continue; }
    if (mode === "line") { if (c === "\n") { mode = "code"; i++; continue; } out[i] = " "; i++; continue; }
    /* string */
    if (c === "\\") { out[i] = " "; out[i + 1] = " "; i += 2; continue; }
    if (c === quote) { mode = "code"; i++; continue; }
    if (c === "$" && d === "{" && quote === "`") { /* keep the interpolation */
      let depth = 1; let j = i + 2;
      while (j < s.length && depth > 0) { if (s[j] === "{") depth++; else if (s[j] === "}") depth--; j++; }
      i = j; continue;
    }
    if (c !== "\r" && c !== "\n") out[i] = " ";
    i++;
  }
  return out.join("");
}

/* ============================================================ PASS 1: JS */
const DEAD_FN = [
  /* W04 remittance rebuild leftovers */
  "remOBand", "remOTotals", "remOPbarHTML", "remOOk", "remOPaceChip", "remOPaceBadge",
  "remOLegend", "remOKpiHead", "remODetailModalHTML",
  /* the V1 deposits / generic shell run in the script tail */
  "depRows", "filterBtn", "secHead", "sideBySide", "exportBtn", "depTop", "advFilterBtn",
  "balHead", "acctModalBody", "depTypes",
  /* per-widget leftovers */
  "mctCtxTasks", "mctCtxName", "mctStarBtn", "mctGlanceTasks",
  "bgtOSlicer", "bgtOPanel",
  "prOPTTotals", "prOPTFlat", "prOScopeChip",
  "ptoFStatusGlyph", "ptoFOutThisWeek", "ptoFAbbrev",
  "lonFSevOf", "lonFDaysCell", "lonFRiskPanel",
  "faFMeasureOrder",
  "purFPayBadge", "purFRecordStatus", "purFApprUpdatedBy",
  "gpFThru", "gpFGoalStatus", "gpFGoalColor", "gpFGoalLabel",
  "apISO", "apDueWithin"
];
const DEAD_VAR = ["SPARK", "TYPES", "LINE_COLORS", "SIZE_LABEL", "DEP_TOTAL", "PRO_PAYROLL_PERM"];

function cutFunction(name) {
  const code = blankNonCode(t);
  const re = new RegExp("(^|[\\r\\n])([ \\t]*)function " + name + "\\s*\\(");
  const m = re.exec(code);
  if (!m) throw new Error("no definition found for function " + name);
  const start = m.index + (m[1] ? m[1].length : 0);
  /* walk to the matching close brace, counting only real code braces */
  let i = code.indexOf("{", m.index + m[0].length - 1);
  if (i < 0) throw new Error(name + ": no body brace");
  let depth = 0;
  for (; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  let end = t.indexOf(NL, i);
  end = end < 0 ? t.length : end + NL.length;
  /* The declaration only. An earlier version of this also tried to absorb the
     comment block above each function, walking back line by line; on the W11
     measure-order helper it took the block's closing line and stopped, leaving
     an unterminated comment that swallowed the next two declarations. A comment
     left behind is harmless prose; a broken one is a broken build. Stale
     comments are handled deliberately, elsewhere. */
  const s = start;
  const cut = t.slice(s, end);
  t = t.slice(0, s) + t.slice(end);
  return cut;
}
function cutVar(name) {
  const code = blankNonCode(t);
  const re = new RegExp("(^|[\\r\\n])([ \\t]*)var " + name + "\\s*=");
  const m = re.exec(code);
  if (!m) throw new Error("no declaration found for var " + name);
  const start = m.index + (m[1] ? m[1].length : 0);
  /* to the terminating semicolon at depth 0 */
  let i = start, depth = 0;
  for (; i < code.length; i++) {
    const c = code[i];
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (c === ";" && depth === 0) { i++; break; }
  }
  let end = t.indexOf(NL, i);
  end = end < 0 ? t.length : end + NL.length;
  const cut = t.slice(start, end);
  t = t.slice(0, start) + t.slice(end);
  return cut;
}

let jsLines = 0;
DEAD_FN.forEach(n => { const c = cutFunction(n); jsLines += c.split(NL).length - 1; });
DEAD_VAR.forEach(n => { const c = cutVar(n); jsLines += c.split(NL).length - 1; });
log.push("cut " + (DEAD_FN.length + DEAD_VAR.length) + " dead declarations, " + jsLines + " lines");

/* guard: none of them is referenced anywhere in code any more */
{
  const code = blankNonCode(t);
  DEAD_FN.concat(DEAD_VAR).forEach(n => {
    const re = new RegExp("(^|[^A-Za-z0-9_$])" + n + "(?![A-Za-z0-9_$])", "g");
    const hits = code.match(re) || [];
    if (hits.length) throw new Error("still referenced after the cut: " + n + " x" + hits.length);
  });
}

/* ============================================================ PASS 2: CSS */
const HOLD_BACK = /^(bank|mys|ap|ar|fkp|w04-flag|w04-fill)-|^(ar|bank|mys|ap|fkp)$/;
{
  const a0 = t.indexOf("<style>"), b0 = t.indexOf("</style>");
  const sheet = t.slice(a0, b0);
  const outside = t.slice(0, a0) + t.slice(b0);

  /* Every string literal in the script, for the concatenation test. Harvested
     with the same tokenizer used above, not with a regex: a regex over a whole
     JavaScript file mis-pairs quotes on the first apostrophe in a comment and
     then swallows every literal after it, which silently hid the stems this
     test exists to find. */
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
  const emittedAnywhere = new Set();
  (outside.match(/[A-Za-z][A-Za-z0-9_-]*/g) || []).forEach(w => emittedAnywhere.add(w));

  const declared = new Set();
  (sheet.match(/\.[A-Za-z][A-Za-z0-9_-]*/g) || []).forEach(c => declared.add(c.slice(1)));

  /* The concatenation test has to be conservative. A class built at run time is
     written as a STEM inside a longer string, for example
     '<span class="purf-turn-'+turn+'">', so the string literal neither equals
     the class nor is a prefix of it: the stem sits at the END of the literal,
     with markup in front. So: if any literal CONTAINS a prefix of the class
     name of five characters or more, treat the class as possibly emitted and
     leave it alone. Containment is looser than it needs to be, which is the
     right direction when the cost of a wrong call is a silently unstyled
     widget. A name ending in a hyphen is a stem selector, not a class. */
  /* The precise half of the test: a literal that ENDS in a hyphen-terminated
     token is a stem being concatenated with a value, so every class starting
     with that stem is built at run time. W09 writes " st-"+state, a stem of
     only three characters, which the containment test below cannot see. */
  const stems = new Set();
  frags.forEach(f => {
    const m = /([A-Za-z][A-Za-z0-9_]*(?:-[A-Za-z0-9_]*)*-)$/.exec(f);
    if (m && m[1].length >= 3) stems.add(m[1]);
  });
  const couldBeBuilt = c => {
    for (const st of stems) if (c.startsWith(st)) return true;
    for (let n = c.length; n >= 5; n--) {
      const p = c.slice(0, n);
      for (const f of frags) if (f.indexOf(p) > -1) return true;
    }
    return false;
  };
  const orphans = [...declared].filter(c => {
    if (c.endsWith("-")) return false;
    if (emittedAnywhere.has(c)) return false;
    return !couldBeBuilt(c);
  }).filter(c => !HOLD_BACK.test(c)).sort();

  /* sweep the rules, group by group */
  const orphanSet = new Set(orphans);
  let out = "", j = 0, dropped = 0, trimmed = 0;
  const isOrphanGroup = g => {
    const names = g.match(/\.([A-Za-z][A-Za-z0-9_-]*)/g) || [];
    if (!names.length) return false;
    return names.every(n => orphanSet.has(n.slice(1)));
  };
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
    const keep = groups.filter(g => !isOrphanGroup(g));
    if (groups.length && !keep.length) { out += lead; dropped++; }
    else if (keep.length !== groups.length) { out += lead + sel.replace(selTrim, keep.join(",")) + "{" + body + "}"; trimmed++; }
    else out += lead + sel + "{" + body + "}";
    j = k;
  }
  const bal = x => { let d = 0; for (const c of x) { if (c === "{") d++; else if (c === "}") d--; if (d < 0) return -1; } return d; };
  if (bal(sheet) !== 0 || bal(out) !== 0) throw new Error("the CSS sweep unbalanced the stylesheet");
  log.push("orphan classes found: " + orphans.length);
  log.push("swept " + dropped + " orphan rules, trimmed " + trimmed + " shared selectors");
  if (DRY) {
    console.log("ORPHANS (" + orphans.length + "):");
    console.log(orphans.join(" "));
  }
  t = t.slice(0, a0) + out + t.slice(b0);
}

/* ------------------------------------------------------------------ guards */
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

log.forEach(l => console.log("  " + l));
if (DRY) { console.log("DRY RUN, nothing written (" + lines0 + " -> " + t.split(NL).length + " lines)"); process.exit(0); }
fs.writeFileSync(FILE, t);
console.log("dead code removed: " + lines0 + " -> " + t.split(NL).length + " lines");
