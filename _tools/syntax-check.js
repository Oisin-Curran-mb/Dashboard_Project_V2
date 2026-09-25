/* =====================================================================
   syntax-check.js , the file-level gate. Run after EVERY edit to index.html.

     node _tools/syntax-check.js

   1. extracts the shell's <script> and runs `node --check` on it
   2. confirms the file is pure CRLF (no bare LF), since the drivers compare
      regions byte for byte and a line-ending flip fails all of them
   3. confirms the file still ends inside the shell IIFE the drivers expect

   Exit 0 = clean, 1 = a problem. Nothing is modified.
   Replaces the old `/tmp/c.js` + python one-liner from mb-widget-port.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "index.html");
const TMP = path.join(__dirname, ".tmp");
const TAIL = "\r\n  render();\r\n})();\r\n";

let bad = 0;
function check(ok, msg) { console.log((ok ? "  ok    " : "  FAIL  ") + msg); if (!ok) bad++; }

const raw = fs.readFileSync(FILE, "utf8");

/* 1. syntax */
const m = /<script>([\s\S]*)<\/script>/.exec(raw);
check(!!m, "<script> block located");
if (m) {
  if (!fs.existsSync(TMP)) fs.mkdirSync(TMP);
  const js = path.join(TMP, "shell-script.js");
  fs.writeFileSync(js, m[1], "utf8");
  const r = spawnSync(process.execPath, ["--check", js], { encoding: "utf8" });
  check(r.status === 0, "node --check on the shell script" + (r.status === 0 ? "" : "\n" + r.stderr));
}

/* 2. line endings */
const bare = (raw.match(/(?<!\r)\n/g) || []).length;
const crlf = (raw.match(/\r\n/g) || []).length;
check(bare === 0, "no bare LF (" + bare + " found; file has " + crlf + " CRLF pairs)");
check(raw.charCodeAt(0) !== 0xFEFF, "no BOM");

/* 3. shape the drivers rely on */
check(!!m && m[1].endsWith(TAIL), "shell script ends with the IIFE tail the drivers splice into");
check((raw.match(/<style>/g) || []).length >= 1, "at least one <style> block");

/* 4. stylesheet integrity: comments close where they should and braces balance.
      A stray "*" + "/" inside a comment's text, or one "}" short, makes the browser drop
      or swallow every rule that follows, while the DOM-shim drivers never notice. */
raw.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, function (_, css) {
  let open = false, j = 0, stray = 0;
  while (j < css.length) {
    if (!open) { const o = css.indexOf("/*", j), c = css.indexOf("*/", j); if (c > -1 && (o < 0 || c < o)) { stray++; j = c + 2; continue; } if (o < 0) break; open = true; j = o + 2; }
    else { const c = css.indexOf("*/", j); if (c < 0) { stray++; break; } open = false; j = c + 2; }
  }
  check(stray === 0, "<style>: comments open and close in pairs (" + stray + " stray)");
  let depth = 0, under = 0;
  css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/[{}]/g, function (ch) { if (ch === "{") depth++; else if (--depth < 0) { under++; depth = 0; } return ch; });
  check(depth === 0 && under === 0, "<style>: braces balance (depth " + depth + " at end, " + under + " extra closers)");
  return _;
});

console.log(bad ? "\nSYNTAX CHECK FAILED (" + bad + ")" : "\nSYNTAX OK");
process.exit(bad ? 1 : 0);
