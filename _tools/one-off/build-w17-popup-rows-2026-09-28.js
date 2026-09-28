/* One-off, 2026-09-28: the ledger's rows render properly.

   Found by screenshotting the pop-up. Every text-based check passed, because
   both faults are about which classes the row carries, not what it says.

   1. A GIANT "UNDEFINED" IN THE STATUS COLUMN. gpFDonorPace returns one of
      neutral, funded, current, ahead, onpace, behind, farbehind. gpFDonorChip's
      icon map carries `full`, which nothing produces, and is missing `current`,
      which is what an up-to-date pledge gets. So ICON(undefined) emitted a
      glyph span containing the literal text "undefined". With the icon font
      unavailable in this browser that text renders at full size, which is why
      it was impossible to miss on screen and invisible to an assertion about
      the row's figures.

   2. THE COLUMNS DID NOT LINE UP AND THE TEXT WAS CENTRED. I gave the ledger
      row `gpf-grow`, which is the GIFT-list row: it is redeclared later in the
      block as a three-column grid, so it overrode the donor row's flex layout
      and the row's six cells wrapped onto two lines. The row is also a
      <button>, and nothing reset the browser's centred text and default
      border, so donor names sat centred in their cell.

      The row now carries its own class for the things it actually needs, the
      button reset and the row rhythm, and keeps gpf-drow for the column grid
      it shares with the header. The header gains matching padding so the two
      agree.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0, n) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const want = n === undefined ? 1 : n;
  const got = t.split(a).length - 1;
  if (got !== want) throw new Error("anchor appeared " + got + " times, wanted " + want + ": " + a0.slice(0, 70));
  t = t.split(a).join(b);
  log.push("edited: " + a0.slice(0, 56).replace(/\s+/g, " "));
}

/* ------------------------------------------- 1. the missing status icon */
swap(`  var ic={neutral:"remove",full:"check_circle",ahead:"trending_up",onpace:"check",behind:"schedule",farbehind:"error"}[status];`,
`  /* every status gpFDonorPace can return needs an entry here, or ICON() is
     handed undefined and emits the word. "current" is what an up-to-date pledge
     gets and was missing; "full" is kept as an alias because saved card state
     may still carry it. (28 Sep 2026) */
  var ic={neutral:"remove",current:"check_circle",full:"check_circle",funded:"check_circle",
          ahead:"trending_up",onpace:"check",behind:"schedule",farbehind:"error"}[status]||"remove";`);

/* ----------------------------------------- 2. the ledger row's own class */
swap(`    return '<button class="gpf-drow gpf-clickable gpf-grow" data-gpf="gopen"`,
     `    return '<button class="gpf-drow gpf-clickable gpf-ldr-row" data-gpf="gopen"`);
swap(`  return '<button class="gpf-drow gpf-clickable gpf-grow gpf-ldr-gift" data-gpf="gopen"`,
     `  return '<button class="gpf-drow gpf-clickable gpf-ldr-row gpf-ldr-gift" data-gpf="gopen"`);

{
  const anchor = "  .gpf-root .gpf-modal .gpf-ldr-list .wt-head{position:sticky;top:0;z-index:2;background:var(--surface-widget);}";
  if (t.split(anchor).length - 1 !== 1) throw new Error("the sticky header rule was not found exactly once");
  t = t.split(anchor).join(
    "  .gpf-root .gpf-modal .gpf-ldr-list .wt-head{position:sticky;top:0;z-index:2;background:var(--surface-widget);padding:8px 11px;}" + NL
    + "  /* The ledger row is a <button>, so it needs the browser's centred text and" + NL
    + "     default border undone. It used to borrow gpf-grow for its padding, which" + NL
    + "     also brought a three-column grid and broke the columns. (28 Sep 2026) */" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-row{width:100%;text-align:left;font:inherit;color:inherit;background:transparent;border:0;border-bottom:1px solid var(--stroke-widget);padding:8px 11px;cursor:pointer;}" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-row:last-child{border-bottom:0;}" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-row:focus-visible{outline:2px solid var(--am-500);outline-offset:-2px;}");
  log.push("added the ledger row's button reset and row rhythm");
}

/* ------------------------------------------------------------- guards */
if (t.indexOf('gpf-clickable gpf-grow') > -1) throw new Error("a ledger row still carries the gift-row class");
["gpf-ldr-row", "current:\"check_circle\""].forEach(n => {
  const c = t.split(n).length - 1;
  if (c < 1) throw new Error(n + " is missing");
});
/* the icon map must cover every status the pace function can produce */
{
  const st = /status=\(pledgedIn<=0\)\?'neutral':\(received>=pledgedIn\?'funded':\(dueRem<=0\?'current':gpFBandFromDays\(daysAhead\)\)\);/.test(t);
  if (!st) throw new Error("gpFDonorPace's status expression changed; re-check the icon map");
  const map = /var ic=\{([^}]*)\}\[status\]\|\|"remove";/.exec(t);
  if (!map) throw new Error("the icon map was not found");
  ["neutral", "funded", "current", "ahead", "onpace", "behind", "farbehind"].forEach(s => {
    if (map[1].indexOf(s + ":") < 0) throw new Error("the icon map has no entry for status " + s);
  });
}
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("W17 ledger rows: status icons complete, columns aligned, button reset");
