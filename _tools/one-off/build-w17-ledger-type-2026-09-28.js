/* One-off, 2026-09-28: the ledger's filter and Type column say what they mean.

   Owner: "for the pop up. the filter should be 'all, pledges, gifts'. type
   should either be pledge or gift."

   1. THE FILTER LABELS become All, Pledges, Gifts. Only the labels change: the
      values behind them were already all / pledges / gifts. The SUMMARY strip
      above keeps "Pledge payments" and "Other gifts", because those name money
      figures under the 28 September ruling, not row types.

   2. THE TYPE COLUMN CARRIES A TYPE. It was mislabelled: a gift row showed
      "Other gift", which is a type, but a PLEDGE row showed its pace status
      ("Fully paid", "50+ days behind"), which is not. Both rows now show
      "Pledge" or "Gift" under a column headed Type.

      The pace status is not dropped, which would lose the one thing the column
      was actually telling you. It moves to the donor cell's sub-line, beside
      the pledge reference, where a pledge row already had a line. The word
      "Pledge" leaves that sub-line, since the Type column now carries it, so
      the sub-line reads "BLDGFUND-46 - Up to date" rather than repeating
      itself. A gift's sub-line drops to "No pledge" for the same reason.

      The aria-label for a pledge row gains its status too, so the reading
      order matches what is on screen.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];
function swap(a0, b0) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a0.slice(0, 64));
  t = t.split(a).join(b);
  log.push("edited: " + a0.slice(0, 52).replace(/\s+/g, " "));
}

/* ------------------------------------------------- 1. the filter labels */
swap(`  var tabs=[['all','All'],['pledges','Pledge payments'],['gifts','Other gifts']].map(function(o){`,
`  /* the labels name row TYPES; the summary strip above names money figures and
     keeps its own wording (owner, 28 Sep) */
  var tabs=[['all','All'],['pledges','Pledges'],['gifts','Gifts']].map(function(o){`);

/* -------------------------------------- 2. the Type column, both rows */
swap(`    var p=it.pace,chip=gpFDonorChip(p.status);
    var sr=it.donor+', pledge '+it.id+'. Pledged '+gpFMoney(p.pledgedIn)+', received '+gpFMoney(p.received)+', due remaining '+gpFMoney(p.dueRem)+'.';`,
`    var p=it.pace,chip=gpFDonorChip(p.status);
    var sr=it.donor+', pledge '+it.id+'. Pledged '+gpFMoney(p.pledgedIn)+', received '+gpFMoney(p.received)+', due remaining '+gpFMoney(p.dueRem)+'. '+gpFStatusLabel(p.status)+'.';`);
swap(`      '<span class="gpf-dc gpf-dc0"><span class="gpf-ldr-nm">'+it.donor+'</span><span class="gpf-ldr-sub">'+ICON('handshake')+'Pledge '+it.id+'</span></span>'+`,
`      '<span class="gpf-dc gpf-dc0"><span class="gpf-ldr-nm">'+it.donor+'</span><span class="gpf-ldr-sub">'+ICON('handshake')+it.id+'<span class="gpf-ldr-stat">'+chip+'</span></span></span>'+`);
swap(`      '<span class="gpf-dstat-h">'+chip+'</span>'+
    '</button>'+(exp?gpFPledgeHistory(it.pledge,win):'');`,
`      '<span class="gpf-dstat-h"><span class="gpf-tag gpf-seg-pledge-tag">Pledge</span></span>'+
    '</button>'+(exp?gpFPledgeHistory(it.pledge,win):'');`);
swap(`    '<span class="gpf-dc gpf-dc0"><span class="gpf-ldr-nm">'+it.donor+'</span><span class="gpf-ldr-sub">'+ICON('redeem')+'Gift, no pledge</span></span>'+`,
`    '<span class="gpf-dc gpf-dc0"><span class="gpf-ldr-nm">'+it.donor+'</span><span class="gpf-ldr-sub">'+ICON('redeem')+'No pledge</span></span>'+`);
swap(`    '<span class="gpf-dstat-h"><span class="gpf-tag gpf-seg-other-tag">Other gift</span></span>'+`,
     `    '<span class="gpf-dstat-h"><span class="gpf-tag gpf-seg-other-tag">Gift</span></span>'+`);

/* the pledge tag's tint, and room for the status beside the reference */
{
  const anchor = "  .gpf-root .gpf-seg-other-tag{background:var(--am-200);color:var(--am-700);}";
  if (t.split(anchor).length - 1 !== 1) throw new Error("the gift tag rule was not found exactly once");
  t = t.split(anchor).join(anchor + NL
    + "  /* the pledge tag takes the bar's pledge-payments tone, the gift tag its" + NL
    + "     other-gifts tone, so the Type column and the bar agree by colour */" + NL
    + "  .gpf-root .gpf-seg-pledge-tag{background:var(--am-500);color:#fff;}" + NL
    + "  /* the pace status moved off the Type column and sits with the reference */" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-stat{margin-left:6px;}" + NL
    + "  .gpf-root .gpf-modal .gpf-ldr-stat .gpf-dstatus{font-size:10px;padding:1px 6px;}" + NL);
  log.push("added the pledge tag tint and the sub-line status");
}

/* ---------------------------------------------------------- guards */
if (t.indexOf("'pledges','Pledges'") < 0 || t.indexOf("'gifts','Gifts'") < 0) throw new Error("the filter labels did not land");
if (t.indexOf(">Pledge</span>") < 0) throw new Error("the pledge type tag is missing");
if (t.indexOf(">Gift</span>") < 0) throw new Error("the gift type tag is missing");
if (t.indexOf("Other gift<") > -1) throw new Error("a row still says Other gift");
/* the summary strip keeps its own wording */
["Pledge payments", "Other gifts"].forEach(n => {
  if (t.indexOf("gpf-dsum-k\">" + n) < 0) throw new Error("the summary strip lost " + n);
});
/* the status is not dropped, only moved */
if (t.indexOf("gpf-ldr-stat") < 0) throw new Error("the pace status was dropped rather than moved");
if ((t.match(/gpFDonorChip/g) || []).length < 2) throw new Error("the status chip builder is unused");
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("the ledger filter reads All, Pledges, Gifts and the Type column carries a type");
