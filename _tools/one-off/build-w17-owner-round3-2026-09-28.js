/* One-off, 2026-09-28: the owner's third round, three changes.

   1. "Make the white into a grey to show a bit of colour from the design tokens, so we can see
      the middle section."
   2. "Make the header of the table left aligned."
   3. "Pledges and Gifts should be on the right of the widget and not in the middle."

   (1) The middle segment took `--surface-widget`, the card's own white, so against a white card
   it read as a hole rather than a share. It now takes `--wn-400`, the shell's warm neutral,
   which is visible against both the card and the two blues either side of it. The legend
   swatch loses the hairline border it needed only because it was white.

   (3) The toggle WAS right-aligned, and that is why it looked centred. `.dep-hd` is
   `grid-template-columns:1fr auto` with `.dep-hd-top{display:contents}`, so the control row and
   the view toggle are grid items in columns 1 and 2. A new child lands in column 1 alone, and
   flex-end inside it pushes only as far as the start of the toggle's column, which is the
   middle of the card. It now spans both columns, so the right edge it aligns to is the card's.
   Its own horizontal padding goes with the fix: the grid already insets by 16px, which is what
   puts it under the view toggle rather than 14px inside it.

   (2) With the header left as well as the body, the two carry identical classes again, so
   `A.headMatchesBody` applies to this table once more. The alignment is still an owner override
   of D12, which puts counts and amounts on the right; it is now simply left throughout.
*/
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0, why) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + (why || a0.slice(0, 64)));
  t = t.split(a).join(b);
  log.push("  " + (why || a0.slice(0, 52).replace(/\s+/g, " ")));
}

/* ---- 1 and 3: the CSS block ---- */
swap(
  `    /* The Pledges / Gifts toggle sits on its own line under the view toggle, right aligned
       under it, on the block's own 14px inset. */
    .gpf-root .gpf-tblrow{display:flex;justify-content:flex-end;padding:0 14px 6px;}
    /* The Gifts table centres its headers and reads its data from the left (owner override of
       D12, which is otherwise in force across the build). */
    .gpf-root .gpf-c-ctr{text-align:center;}
    .gpf-root .gpf-c-lft{text-align:left;}
    /* The white middle of the bar: what is still expected against the pledges. */
    .gpf-root .gpf-seg-exp{background:var(--surface-widget);position:absolute;top:0;bottom:0;border-radius:0;}
    .gpf-root .gpf-lg-sw.gpf-seg-exp{position:static;border-radius:3px;box-shadow:inset 0 0 0 1px var(--cn-30);}`,
  `    /* The Pledges / Gifts toggle sits on its own line under the view toggle. It must SPAN the
       header grid's two columns: in column 1 alone, its right edge is the start of the toggle's
       own column, which reads as the middle of the card. The grid's 16px inset is what lines it
       up under the view toggle, so it adds none of its own. */
    .gpf-root .gpf-tblrow{grid-column:1/-1;display:flex;justify-content:flex-end;}
    /* The Gifts table reads from the left, header and data alike (owner override of D12, which
       puts counts and amounts on the right; it is in force everywhere else in the build). */
    .gpf-root .gpf-c-lft{text-align:left;}
    /* The middle of the bar: what is still expected against the pledges. A neutral from the
       tokens, not the card's own white, or it reads as a hole rather than a share. */
    .gpf-root .gpf-seg-exp{background:var(--wn-400);position:absolute;top:0;bottom:0;border-radius:0;}
    .gpf-root .gpf-lg-sw.gpf-seg-exp{position:static;border-radius:3px;}`,
  "CSS: the grey middle, the left alignment, the toggle spanning the grid");

/* ---- 2: the Gifts header reads from the left ---- */
swap(
  `/* Header centred, body left, on the owner's instruction of 28 Sep. The width classes are
   the same on both, so the columns line up; only the alignment differs. */
function gpFGiftsHead(){
  return '<div class="wt-row wt-head gpf-trow">'+
    '<span class="gpf-c-nm gpf-c-ctr">Purpose</span>'+
    '<span class="gpf-c-n gpf-c-ctr">Gifts</span>'+
    '<span class="gpf-c-n gpf-c-ctr">Donors</span>'+
    '<span class="gpf-c-n gpf-c-ctr">Total</span>'+
  '</div>';
}`,
  `/* Left aligned throughout, header and data, on the owner's instruction of 28 Sep. Header and
   body carry identical classes, so the columns line up cell for cell. */
function gpFGiftsHead(){
  return '<div class="wt-row wt-head gpf-trow">'+
    '<span class="gpf-c-nm gpf-c-lft">Purpose</span>'+
    '<span class="gpf-c-n gpf-c-lft">Gifts</span>'+
    '<span class="gpf-c-n gpf-c-lft">Donors</span>'+
    '<span class="gpf-c-n gpf-c-lft">Total</span>'+
  '</div>';
}`,
  "the Gifts header reads from the left");

/* the name cell in the body takes the class too, so header and body match cell for cell */
swap(
  `  return '<div class="wt-row gpf-trow gpf-clickable gpf-sumrow" data-gpf="baropen" data-id="'+w.id+'" data-c="'+gpFEsc(r.label)+'" data-f="gifts" role="button" tabindex="0" aria-haspopup="dialog" aria-label="'+gpFEsc(sr)+'">'+
    '<span class="gpf-c-nm"><span class="gpf-caret" aria-hidden="true">'+ICON('chevron_right')+'</span>`,
  `  return '<div class="wt-row gpf-trow gpf-clickable gpf-sumrow" data-gpf="baropen" data-id="'+w.id+'" data-c="'+gpFEsc(r.label)+'" data-f="gifts" role="button" tabindex="0" aria-haspopup="dialog" aria-label="'+gpFEsc(sr)+'">'+
    '<span class="gpf-c-nm gpf-c-lft"><span class="gpf-caret" aria-hidden="true">'+ICON('chevron_right')+'</span>`,
  "and its name cell matches the header's");

swap(
  `    '<span class="gpf-c-nm">Total ('+t.count+' purpose'+(t.count===1?'':'s')+')</span>'+
    '<span class="gpf-c-n gpf-c-lft">'+t.giftN+'</span>'+`,
  `    '<span class="gpf-c-nm gpf-c-lft">Total ('+t.count+' purpose'+(t.count===1?'':'s')+')</span>'+
    '<span class="gpf-c-n gpf-c-lft">'+t.giftN+'</span>'+`,
  "as does the totals row");

/* ---- guards ---------------------------------------------------------- */
const W17 = t.slice(t.indexOf("var GPF_TODAY="), t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */"));
const code = W17.replace(/\/\*[\s\S]*?\*\//g, "");

/* 1 */
if (!/\.gpf-root \.gpf-seg-exp\{background:var\(--wn-400\)/.test(t)) throw new Error("the middle segment is not the token grey");
if (/gpf-seg-exp\{background:var\(--surface-widget\)/.test(t)) throw new Error("the white background survives");
if (/\.gpf-lg-sw\.gpf-seg-exp\{[^}]*box-shadow/.test(t)) throw new Error("the legend swatch keeps a border it no longer needs");
if (t.indexOf("--wn-400:") < 0) throw new Error("--wn-400 is not a token in this shell");
/* 2 */
const gh = /function gpFGiftsHead[\s\S]*?\n}/.exec(code)[0], gr = /function gpFGiftsRow[\s\S]*?\n}/.exec(code)[0];
if (gh.indexOf("gpf-c-ctr") > -1 || t.indexOf("gpf-c-ctr") > -1) throw new Error("a centred cell or its rule survives");
if ((gh.match(/gpf-c-lft/g) || []).length !== 4) throw new Error("the Gifts header does not left-align all four cells");
if ((gr.match(/gpf-c-lft/g) || []).length !== 4) throw new Error("the Gifts row does not left-align all four cells");
/* header and body now match cell for cell, class for class */
const cls = s2 => (s2.match(/class="(gpf-c-[^"]*)"/g) || []).map(m => m.replace(/^class="|"$/g, "").split(/\s+/).sort().join(" "));
if (cls(gh).join("|") !== cls(gr).join("|")) throw new Error("the Gifts header and row no longer match: " + cls(gh).join("|") + " vs " + cls(gr).join("|"));
/* 3 */
if (!/\.gpf-root \.gpf-tblrow\{grid-column:1\/-1;display:flex;justify-content:flex-end;\}/.test(t)) {
  throw new Error("the toggle row does not span the header grid and align right");
}
if (/\.gpf-root \.gpf-tblrow\{[^}]*padding/.test(t)) throw new Error("the toggle row still adds its own inset");
if (!/\.dep-hd\{display:grid;grid-template-columns:1fr auto/.test(t)) throw new Error("the header grid this spans has changed; re-measure");

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("W17: grey middle, left-aligned Gifts header, toggle on the card's right edge");
