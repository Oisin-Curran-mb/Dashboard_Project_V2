/* One-off, 2026-09-28: correct the comments and banners that describe code
   which no longer exists, fix the four undeclared custom properties, and clear
   the two em dashes. Owner: "check all the code ... or can be cleaned."

   The CSS token fixes are not cosmetic. --wn-700 and --focus-ring were never
   declared, so `border-left:2px dashed var(--wn-700)` is invalid at computed
   value time and the expected-tick marks fall back to currentcolor, and the
   W03 date input's focus ring paints a hard-coded blue off the palette. The
   tokens that exist are --wn-750 and --focus. --wn-50 and --wn-050 are
   zero-padded typos that already fall back to --wn-100, which is what the
   author meant, so they become that outright.
*/
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const FILE = path.join(ROOT, "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0, n) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const want = n === undefined ? 1 : n;
  const got = t.split(a).length - 1;
  if (got !== want) throw new Error("anchor appeared " + got + " times, wanted " + want + ": " + a0.slice(0, 70));
  t = t.split(a).join(b);
  log.push("edited: " + a0.slice(0, 60).replace(/\s+/g, " "));
}
function dropLine(needle, label) {
  const i = t.indexOf(needle);
  if (i < 0) throw new Error("anchor missing: " + label);
  if (t.indexOf(needle, i + 1) > -1) throw new Error("anchor ambiguous: " + label);
  const s = t.lastIndexOf(NL, i - 1) + NL.length, e = t.indexOf(NL, i) + NL.length;
  t = t.slice(0, s) + t.slice(e);
  log.push("dropped line: " + label);
}

/* ------------------------------------------------------- 1. token defects */
{
  const n700 = (t.match(/var\(--wn-700\)/g) || []).length;
  if (n700 < 1) throw new Error("--wn-700 not found");
  t = t.split("var(--wn-700)").join("var(--wn-750)");
  log.push("--wn-700 -> --wn-750 (" + n700 + " sites; the token was never declared)");
}
swap("var(--focus-ring,#2563eb)", "var(--focus)");
{
  const a = (t.match(/var\(--wn-50,var\(--wn-100\)\)/g) || []).length;
  const b = (t.match(/var\(--wn-050,var\(--wn-100\)\)/g) || []).length;
  if (a + b < 2) throw new Error("the zero-padded wn tokens were not found");
  t = t.split("var(--wn-50,var(--wn-100))").join("var(--wn-100)")
       .split("var(--wn-050,var(--wn-100))").join("var(--wn-100)");
  log.push("--wn-50 and --wn-050 -> --wn-100 (" + (a + b) + " sites)");
}

/* ------------------------------------------------------ 2. em dashes (T3) */
swap("<title>Dashboard + Widget depth ladder — Pathway (draft v14)</title>",
     "<title>Shelby Financials Dashboard, Version 2</title>");
swap("Main Content Tasks (new user — content tasks only)",
     "Main Content Tasks (new user, content tasks only)");

/* -------------------------------------------------- 3. stale banner prose */
/* the shared .pbar this warned about collided with was deleted today */
swap(`   track at expected/total). Its own class + data attr so it never collides with
   Jo's shared .pbar[data-pbar] hover. o={fill,tick,band,pop,aria,sm,tickTip}. */`,
`   track at expected/total). Its own class and data attribute, which is why it
   outlived the shell's shared pacing bar, deleted 2026-09-28 once nothing
   emitted it. o={fill,tick,band,pop,aria,sm,tickTip}. */`);

/* the .ar- primitives: still used, but by W04 alone since W17 took its own */
swap("AR-derived bar primitives", "AR-derived bar primitives");
{
  const i = t.indexOf("Used by W04 Remittance Pledges and W17 Gifts markup. Remove when nothing uses them.");
  if (i < 0) throw new Error("the .ar- banner was not found");
  t = t.replace("Used by W04 Remittance Pledges and W17 Gifts markup. Remove when nothing uses them.",
    "Used by W04 Remittance Pledges only: W17 Gifts took its own copies on 2026-09-28. Remove when nothing uses them.");
  log.push("edited: the .ar- primitives banner now names W04 alone");
}

/* the .bgt- banner claimed far more consumers than survive */
{
  const old = "Used by W01 and by the hover cards, captions and spinners of W02 W04 W05 W13 W15 W16";
  const i = t.indexOf(old);
  if (i < 0) throw new Error("the .bgt- banner was not found");
  t = t.replace(old, "Thirteen of these survive, used by W01 and by the hover cards, captions and spinners of W02 W04 W05 W13 W15 W16; the rest of the V1 budget stylesheet was deleted 2026-09-28");
  log.push("edited: the .bgt- banner now says which part survives");
}

/* two comments still list a class from the deleted gifts block */
{
  const n = (t.match(/gft-goalpill/g) || []).length;
  if (n < 1) throw new Error("gft-goalpill not found in the comments");
  t = t.split(",gft-goalpill").join("").split("gft-goalpill,").join("").split("gft-goalpill").join("");
  log.push("removed the gft-goalpill token from " + n + " comment(s)");
}

/* the empty banner pair left by the retired comparison note */
{
  const pair = "  /* ===== Comparison note V2 CSS ===== */" + NL + "  /* ===== end Comparison note V2 CSS ===== */" + NL;
  if (t.indexOf(pair) > -1) { t = t.split(pair).join(""); log.push("dropped the empty Comparison note CSS banner pair"); }
  else {
    ["/* ===== Comparison note V2 CSS ===== */", "/* ===== end Comparison note V2 CSS ===== */"].forEach(b => {
      if (t.indexOf(b) > -1) dropLine(b, b);
    });
  }
}

/* the banner over the deleted .rem- run, if its rules are gone but it is not */
{
  const b = "Used by W05 Receivables and W17 Gifts (Jo's blocks). Remove when those are decided and nothing uses it.";
  if (t.indexOf(b) > -1) {
    const s = t.lastIndexOf("/* =====", t.indexOf(b));
    const e = t.indexOf("*/", t.indexOf(b)) + 2;
    const endLine = t.indexOf(NL, e) + NL.length;
    t = t.slice(0, t.lastIndexOf(NL, s - 1) + NL.length) + t.slice(endLine);
    log.push("dropped the banner over the deleted remittance-derived run");
  }
}

/* the W17 banner's decoupling paragraph still credits Jo's classes by their old
   names; those rules are ours now, copied in as gpf-* at finalisation */
swap(`   exist; those are gone too, replaced with her .gft-ctlrow, her .state,
   her .vtoggle and her .modal-backdrop.`,
`   exist; those are gone too, replaced with the control row this block now
   declares itself as .gpf-ctlrow, plus the shell's own .state, .vtoggle and
   .modal-backdrop.`);

/* ------------------------------------------------------------- 4. guards */
if (/--wn-700|--focus-ring|--wn-050|var\(--wn-50[,)]/.test(t)) throw new Error("an undeclared token survives");
/* The owner's rule is no em dash in USER-FACING text, which is what lint rule
   T3 measures; em dashes inside code comments are not in scope. So the guard
   names the two strings that were user-facing, and the lint confirms the count. */
["Pathway (draft v14)", "(new user — content tasks only)"].forEach(s => {
  if (t.indexOf(s) > -1) throw new Error("a user-facing em dash site survives: " + s);
});
if (/gft-/.test(t)) throw new Error("a gft- name survives: " + JSON.stringify((t.match(/.{0,40}gft-.{0,20}/g)||[]).slice(0,4)));
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("comments, tokens and em dashes corrected");
