/* One-off, 2026-09-28: the Giving legend sits on the card's bottom edge too.

   The owner's fifth change, "the line under the table needs to be on the last line so there is
   not white space at the bottom", was applied to the table, and measured: 0px. The Giving
   view still left 69px of white under its legend, which is the same defect on the view the
   owner drew an arrow under.

   The cause was not the shell padding this time. `.gpf-barscroll` carried
   `max-height:236px` at the Explore tier, so the bar list stopped short of the space it had
   and the legend rode up with it. The container is already `flex:1 1 auto; min-height:0`
   inside a fixed-height card, so removing the cap lets it take exactly the room available and
   no more, which pins the legend to the bottom and gives the bars the 69px back.
*/
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");

const a = `  .gpf-root[data-tier="wide"] .gpf-barscroll{max-height:236px;}
  .gpf-root[data-tier="xwide"] .gpf-barscroll{max-height:none;}`.split("\n").join(NL);
const b = `  /* No cap: the container is flex:1 inside a fixed-height card, so it takes the room it
     has and the legend stays on the bottom edge (owner, 28 Sep). */
  .gpf-root .gpf-barscroll{max-height:none;}`.split("\n").join(NL);

const got = t.split(a).length - 1;
if (got !== 1) throw new Error("the tier caps were not found exactly once: " + got);
t = t.split(a).join(b);

if (/max-height:236px/.test(t)) throw new Error("the cap survives");
if (!/\.gpf-root \.gpf-barscroll\{max-height:none;\}/.test(t)) throw new Error("the replacement rule is missing");
if (!/\.gpf-root \.gpf-barscroll\{flex:1 1 auto;min-height:0;overflow-y:auto/.test(t)) {
  throw new Error("the container no longer flexes, so removing the cap would not fill the space");
}

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
console.log("W17: the Giving legend sits on the bottom edge, and the bars take the space back");
