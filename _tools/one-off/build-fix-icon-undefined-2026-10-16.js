/* One-off, 2026-10-16: no button ever prints the word UNDEFINED again.

   Owner, with a screenshot of the "Unposted Transaction: TXN-2024-3356"
   modal: the primary button reads "UNDEFINED Post Transaction".

   THE CAUSE, in two parts.

   1. index.html:3977 (the shell's shared icon helper)
        var ICON=function(n){return '<span class="material-symbols-rounded">'+n+'</span>';};
      It interpolates whatever it is given. ICON(undefined) therefore emits a
      ligature span containing the literal text "undefined", and because the
      Material Symbols font has no ligature by that name it renders the word
      itself. 359 call sites share this helper, so any one of them passing a
      missing name prints a word where an icon should be.

   2. index.html:11363, inside aloModalHTML:
        var b=cfg.btnPri||{icon:"visibility",label:...};
        ... ICON(b.icon)+b.label
      The DEFAULT object carries an icon, so the fallback path is safe. The
      bug is the other path: when cfg.btnPri exists but has no icon key,
      b.icon is undefined and goes straight to ICON().

   TEN configs are in that state, so this showed on ten modals rather than
   one: pa3-cat-8:0 through :5 ("Post Transaction") and pa3-cat-9:0 through
   :3 ("Resubmit Payment", "Authorise Payment", "Mark as Mailed", "Approve
   Payment"). Eighteen other configs do carry an icon and were always fine.

   THE FIX, also two parts, because either alone leaves the trap set.

   1. ICON returns "" for a falsy name. One line. It cannot affect any call
      that passes a real name, and it closes the whole class of defect across
      all 359 call sites. This is the third time this exact bug has cost time
      in this build: W17's gpFDonorChip printed a giant UNDEFINED in the gift
      status column on 28 Sep for the same reason, and was fixed locally with
      a per-map fallback rather than here.

   2. The call site stops relying on that. A reader of aloModalHTML should not
      have to know ICON is defensive, so the icon is emitted only when the
      config actually has one.

   WHAT IS NOT CHANGED. The ten configs do not gain icons. Giving them one
   would be inventing a design decision the owner has not made, and the
   adjacent buttons disagree about whether the icon even goes before or after
   the label (line 11363 puts it before; lines 12461 and 13107 put it after).
   A button with a label and no icon is correct and is what those ten asked
   for. Nothing else about the modals moves.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0, why) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + (why || a0.slice(0, 60)));
  t = t.split(a).join(b);
  log.push("  " + why);
}

/* ---- before: prove the bug is where we say it is -------------------- */
{
  const re = /"(pa3-cat-[89]:\d+)":\{[^\n]*?btnPri:\{([^}]*)\}/g;
  let m, without = 0, withIcon = 0;
  while ((m = re.exec(t))) { if (/icon:/.test(m[2])) withIcon++; else without++; }
  if (without !== 10) throw new Error("expected 10 icon-less btnPri configs, found " + without);
  log.push("  confirmed 10 btnPri configs with a label and no icon");
}

/* ---- 1. the shared helper stops printing a missing name ------------- */
swap(`  var ICON=function(n){return '<span class="material-symbols-rounded">'+n+'</span>';};`,
`  /* A missing name yields NOTHING, not the word "undefined". Without this
     guard ICON(undefined) emits a ligature span holding the literal text,
     which the icon font renders as the word itself: that is how a button came
     to read "UNDEFINED Post Transaction" (owner, 16 Oct 2026), and how W17's
     gift status column printed the same word on 28 Sep. 359 call sites share
     this helper, so the guard belongs here rather than in each of them. */
  var ICON=function(n){return n?'<span class="material-symbols-rounded">'+n+'</span>':"";};`,
  "ICON() returns nothing for a falsy name");

/* ---- 2. the call site says what it means ---------------------------- */
swap(`        '<div class="al-modal-actions"><button class="btn primary sm" data-alo="go">'+ICON(b.icon)+b.label+'</button></div></div>';`,
`        /* b.icon is absent on the ten configs that carry a label only, so the
           icon is emitted only when there is one. ICON() guards this too, but
           reading this line should not require knowing that. */
        '<div class="al-modal-actions"><button class="btn primary sm" data-alo="go">'+(b.icon?ICON(b.icon):"")+b.label+'</button></div></div>';`,
  "aloModalHTML emits an icon only when the config has one");

/* ---- guards --------------------------------------------------------- */
if (t.indexOf(`'<span class="material-symbols-rounded">'+n+'</span>';};`) > -1) {
  throw new Error("the unguarded ICON body survives");
}
if (!/var ICON=function\(n\)\{return n\?/.test(t)) throw new Error("the guard did not land on ICON");
if (t.indexOf("ICON(b.icon)+b.label") > -1) throw new Error("the raw call site survives");

/* the ten configs still have their labels and still have no icons: this is a
   rendering fix, not a data change */
{
  const re = /"(pa3-cat-[89]:\d+)":\{[^\n]*?btnPri:\{([^}]*)\}/g;
  let m, without = 0;
  while ((m = re.exec(t))) if (!/icon:/.test(m[2])) without++;
  if (without !== 10) throw new Error("the configs changed; they should not have");
}
["Post Transaction", "Resubmit Payment", "Authorise Payment", "Mark as Mailed", "Approve Payment"]
  .forEach(l => { if (t.indexOf('label:"' + l + '"') < 0) throw new Error("a button label was lost: " + l); });

/* the 18 configs that DO carry an icon are untouched */
if ((t.match(/btnPri:\{icon:"arrow_forward"/g) || []).length < 15) {
  throw new Error("the configs that carry an icon were disturbed");
}

let bare = 0;
for (let k = 0; k < t.length; k++) if (t[k] === "\n" && t[k - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("ICON() is guarded and the modal button emits an icon only when it has one");
