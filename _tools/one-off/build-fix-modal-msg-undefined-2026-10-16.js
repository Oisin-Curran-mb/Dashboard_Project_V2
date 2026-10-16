/* One-off, 2026-10-16: the modal body stops printing "undefined" too.

   Found by the driver assertions added with build-fix-icon-undefined of the
   same date, not by looking: having pinned "no pop-up prints the word
   undefined", four more pop-ups failed it for a DIFFERENT reason, so the ICON
   guard was only half the defect.

   THE CAUSE. index.html:11612, in aloModalHTML:

     '<div class="al-modal-body"><p class="al-modal-msg">'+cfg.msg+'</p>'+ ...

   The paragraph is emitted unconditionally, so a config with no msg field
   renders the literal word. Fifteen configs across the three item-modal sets
   have no msg; the ones that reach this branch are al-cat-3:0 and
   pa3-cat-3:0 through :2, plus their al2- equivalents. (The cat-5 configs
   also lack a msg but take the approval branch above, which builds its own
   body, so they never showed it.)

   THE FIX is already written elsewhere in the same file. aloMergedModal, the
   newer builder at line 12894, does it correctly:

     var msg=c.msg?'<p class="al-modal-msg">'+c.msg+'</p>':"";

   So this is not a new idea, it is the older builder catching up with the
   newer one. The paragraph is omitted entirely rather than left empty,
   because .al-modal-msg carries a bottom margin and an empty one would leave
   a gap above the table for no reason.

   Nothing else changes: no config gains a msg, and every config that has one
   renders exactly as before.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");

const OLD = `        '<div class="al-modal-body"><p class="al-modal-msg">'+cfg.msg+'</p>'+(rows?'<div class="al-modal-table">'+rows+'</div>':'')+'</div>'+`;
const NEW = `        /* The paragraph is omitted when there is no msg, rather than left
           empty: fifteen configs carry no msg field, and an unconditional
           '+cfg.msg+' printed the literal word "undefined" in the body
           (owner, 16 Oct 2026). This is the shape aloMergedModal already
           uses. An empty <p> would also leave its bottom margin behind. */
        '<div class="al-modal-body">'+(cfg.msg?'<p class="al-modal-msg">'+cfg.msg+'</p>':'')+(rows?'<div class="al-modal-table">'+rows+'</div>':'')+'</div>'+`;

const a = OLD.split("\n").join(NL);
if (t.split(a).length - 1 !== 1) throw new Error("the modal body anchor did not appear exactly once");
t = t.split(a).join(NEW.split("\n").join(NL));

/* ---- guards --------------------------------------------------------- */
if (t.indexOf(`<p class="al-modal-msg">'+cfg.msg+'</p>'+(rows`) > -1) throw new Error("the unguarded line survives");
if (!/\(cfg\.msg\?'<p class="al-modal-msg">'\+cfg\.msg\+'<\/p>':''\)/.test(t)) throw new Error("the guard did not land");

/* the newer builder's own guard is untouched, since it is the pattern copied */
if (t.indexOf(`var msg=c.msg?'<p class="al-modal-msg">'+c.msg+'</p>':"";`) < 0) {
  throw new Error("aloMergedModal's guard was disturbed");
}

/* the hard-coded fallback paragraph in the no-config branch stays */
if (t.indexOf("This item requires your attention. Would you like to navigate") < 0) {
  throw new Error("the no-config branch's own body was disturbed");
}

let bare = 0;
for (let k = 0; k < t.length; k++) if (t[k] === "\n" && t[k - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
console.log("  the modal body omits its paragraph when the config has no msg");
console.log("aloModalHTML no longer prints \"undefined\" for a config without a msg");
