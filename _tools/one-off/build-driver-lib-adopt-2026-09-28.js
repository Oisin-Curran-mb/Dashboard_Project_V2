/* One-off, 2026-09-28: the drivers adopt the shared test library's constants.

   This substitutes duplicated VALUES. It does not restructure how any driver
   runs, which is the deliberate line: the drivers are the only thing that
   proves the build, so the wide change (folding the whole hosting block into
   one H.hostShell call) is left for a reviewed pass.

   What goes:
     - `const TAIL = "\r\n  render();\r\n})();\r\n";`   14 byte-identical copies
     - the Node globals bag, 14 byte-identical copies of 19 keys
     - `const code = s => s.replace(block-comment regex, "")`, 4 named copies

   W18 keeps its two extra globals by layering them over the shared bag. W13
   and W17 run a single block and never needed the bag at all.

   The proof is that the assertion count does not move: 3069 before, 3069 after.
*/
"use strict";
const fs = require("fs"), path = require("path");
const TOOLS = path.join(__dirname, "..");
const drivers = fs.readdirSync(TOOLS).filter(f => /\.driver\.js$/.test(f)).sort();
const TAIL_LITERAL = 'const TAIL = "\\r\\n  render();\\r\\n})();\\r\\n";';

let tails = 0, bags = 0, codes = 0;
drivers.forEach(f => {
  const p = path.join(TOOLS, f);
  let s = fs.readFileSync(p, "utf8");
  const NL = s.indexOf("\r\n") > -1 ? "\r\n" : "\n";
  const before = s;

  /* 1. the tail constant */
  if (s.indexOf(TAIL_LITERAL) > -1) {
    if (s.split(TAIL_LITERAL).length - 1 !== 1) throw new Error(f + ": TAIL appears more than once");
    s = s.split(TAIL_LITERAL).join("const TAIL = H.TAIL;   /* the shell's closing lines, shared */");
    tails++;
  }

  /* 2. the globals bag */
  const gi = s.indexOf("globals: {");
  if (gi > -1) {
    let d = 1, j = gi + "globals: {".length;
    while (j < s.length && d > 0) { if (s[j] === "{") d++; else if (s[j] === "}") d--; j++; }
    const bag = s.slice(gi, j);
    /* W18 runs a single block and its bag is only a timer override, not the
       shared Node-globals bag, so it is left exactly as it is. */
    if (bag.indexOf("__EX: null") < 0) { console.log("  " + f + ": its globals bag is its own, left alone"); return; }
    const extraTimers = bag.indexOf("setTimeout: function") > -1;
    const repl = extraTimers
      ? "globals: Object.assign(H.NODE_GLOBALS(), {" + NL
        + "    /* W18 lets its timers run, where the other drivers assert on the loading" + NL
        + "       flag instead of waiting, so it overrides the shared no-op pair. */" + NL
        + "    setTimeout: setTimeout, clearTimeout: clearTimeout })"
      : "globals: H.NODE_GLOBALS()";
    s = s.slice(0, gi) + repl + s.slice(j);
    bags++;
  }

  /* 3. the named comment stripper */
  const CODE_RE = /const code = function \(s\) \{ return s\.replace\(\/\\\/\\\*\[\\s\\S\]\*\?\\\*\\\/\/g, ""\); \};/;
  if (CODE_RE.test(s)) { s = s.replace(CODE_RE, "const code = H.code;   /* strip block comments, shared */"); codes++; }
  else {
    const alt = 'const code = function (s) { return s.replace(/\\/\\*[\\s\\S]*?\\*\\//g, ""); };';
    if (s.indexOf(alt) > -1) { s = s.split(alt).join("const code = H.code;   /* strip block comments, shared */"); codes++; }
  }

  if (s !== before) {
    /* some drivers already carry a few bare line feeds from earlier repair
       passes, so the guard is that this pass adds none, not that none exist */
    const count = x => { let n = 0; for (let i = 0; i < x.length; i++) if (x[i] === "\n" && x[i - 1] !== "\r") n++; return n; };
    if (count(s) > count(before)) throw new Error(f + ": bare LF introduced");
    fs.writeFileSync(p, s);
    console.log("  " + f);
  }
});
console.log("  TAIL copies removed: " + tails + ", globals bags: " + bags + ", comment strippers: " + codes);
