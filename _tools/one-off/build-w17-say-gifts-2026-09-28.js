/* One-off, 2026-09-28: it is a gift, not an other gift.

   Owner: "again it should be a gift and not other gift."

   Six visible strings carried "other gifts": the bar's hover, the split line
   under each bar and in the headline, the legend, the view-toggle tip, the
   Giving caption and the pop-up's summary strip. All read "gifts" now.

   The word "other" was doing a job in the model, where `other` means a gift
   with no pledge behind it, and it stays there: the data key, the class names
   and the code comments are unchanged. It was only ever needed on screen to
   distinguish the two bar segments, and "Pledge payments" against "Gifts"
   does that without it.

   The about text is corrected in the same pass, because it still described the
   widget before the rebuild: a goal that no longer exists, Received as
   pledge-linked only, and opening a purpose to see an inline donor drill that
   was replaced by the pop-up.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];
function swap(a0, b0) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a0.slice(0, 66));
  t = t.split(a).join(b);
  log.push("edited: " + a0.slice(0, 50).replace(/\s+/g, " "));
}

swap(`data-tip="'+gpFEsc('Other gifts: '+gpFMoney0(r.other))+'"`,
     `data-tip="'+gpFEsc('Gifts: '+gpFMoney0(r.other))+'"`);
swap(`  return gpFMoney0(r.fromPledges)+' from pledges, '+gpFMoney0(r.other)+' from other gifts';`,
     `  return gpFMoney0(r.fromPledges)+' from pledges, '+gpFMoney0(r.other)+' from gifts';`);
swap(`gpf-seg-other"></span>Other gifts<b class="gpf-lg-n">`,
     `gpf-seg-other"></span>Gifts<b class="gpf-lg-n">`);
swap(`seg("goal","Giving","volunteer_activism","What each purpose has received, most received first, with pledge payments and other gifts shown separately.")+`,
     `seg("goal","Giving","volunteer_activism","What each purpose has received, most received first, with pledge payments and gifts shown separately.")+`);
swap(`The bar shows pledge payments and other gifts separately.`,
     `The bar shows pledge payments and gifts separately.`);
swap(`'<span class="gpf-dsum-i"><span class="gpf-dsum-k">Other gifts</span><span class="gpf-dsum-v">'+gpFMoney(comp.other)+'</span></span>'+`,
     `'<span class="gpf-dsum-i"><span class="gpf-dsum-k">Gifts</span><span class="gpf-dsum-v">'+gpFMoney(comp.other)+'</span></span>'+`);

/* the about text, which still described the widget before the rebuild */
swap(`var GPF_ABOUT="How each gift and pledge purpose is tracking against its goal, and how much of what was pledged is still due, as of the end of the chosen date range. Received counts gifts applied to a pledge. Open a purpose to see the donor pledges behind it, and a pledge to see the individual gifts applied to it.";`,
`var GPF_ABOUT="What each purpose has received, and how much of what was pledged is still due, over the dates you choose. Received counts both payments against a pledge and gifts given to the purpose with no pledge behind them, shown separately in the bar. Open a purpose to see every gift and pledge behind it, and open one of those to see its history: a pledge shows its schedule and the payments against it, a gift shows how it arrived and what prompted it.";`);

/* ------------------------------------------------------------ guards */
{
  const a = t.indexOf("var GPF_TODAY="), b = t.indexOf("/* ===== end W17 Gifts Pledges V2 ===== */");
  const code = t.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, "");
  if (/[Oo]ther gift/.test(code)) {
    throw new Error("a visible string still says other gift: " +
      JSON.stringify((code.match(/.{0,50}[Oo]ther gift.{0,20}/g) || []).slice(0, 4)));
  }
  /* the model keeps the distinction it needs */
  ["gpf-seg-other", "r.other", "comp.other", "t.other"].forEach(n => {
    if (code.indexOf(n) < 0) throw new Error("the model's own name was wrongly changed: " + n);
  });
  /* the about text describes the widget as it is now */
  const ab = /var GPF_ABOUT="([^"]*)";/.exec(code);
  if (!ab) throw new Error("the about text was not found");
  ["both payments against a pledge", "every gift and pledge behind it", "schedule"].forEach(n => {
    if (ab[1].indexOf(n) < 0) throw new Error("the about text is missing: " + n);
  });
  ["against its goal", "donor pledges behind it"].forEach(n => {
    if (ab[1].indexOf(n) > -1) throw new Error("the about text still describes the retired design: " + n);
  });
}
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("the card says gifts, and the about text describes the widget as built");
