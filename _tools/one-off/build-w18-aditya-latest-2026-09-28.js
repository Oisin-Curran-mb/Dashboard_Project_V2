/* One-off, 2026-09-28: W18 Financial KPI takes Aditya's latest Variant A.

   Owner: "I need Aditya KPI version to update mine to his latest", then
   "drop the cash position completly you can port it over and then remove or
   just not include the code. what ever is better", and take all four of his
   changes.

   WHICH VERSION IS "HIS LATEST". Two commits on his feature branch, both
   2026-09-25, in Aditya_Widget_Design/Demo V2.html:
     c0359df  remove Cash Position tile from Financial KPI Variant A
     c016583  Variant A - equidistant 3-tile layout, remove prototype cycle
   So his latest is a SUBTRACTION from what we had, not an addition. The band
   loses its fourth tile and its prototype chip and each remaining tile
   becomes its own card. Nothing else of his is newer than ours: his Variant A
   still lacks our body-mounted panel, our design-system tokens and our
   shared escText, and his file also carries Variants B, C and D plus a
   window.fkpVariantSwitch, which are exploration scaffolding and stay out.

   THE FOUR CHANGES:
     1. three tiles, not four (Cash Position goes)
     2. .fkp-row: repeat(3,1fr) with a 10px gap, no padding of its own
     3. .fkp-tile: its own surface, border and 8px radius, replacing the 1px
        divider band
     4. .fkp-band: height:auto, replacing her fixed 176px Glance height, and
        .fkp-root pads itself while .fkp-hd stops padding

   WHAT IS DELETED, not merely left unrendered. The owner said drop it
   completely and take whichever is better; removing it is better, because
   this repo lints for declared-and-unused CSS and for product code kept
   alive only by a test, and the whole subsystem hangs off a tile that no
   longer exists. .fkp-warn lived inside .fkp-cash, and the demo chip was the
   only way to reach the other severity states, so with both gone nothing
   could ever have shown it.

     JS:   FKP_CASH, FKP_THRESHOLD_DAYS, FKP_ACCTS, FKP_DEMO, fkpSevOf,
           fkpUndefinedBand, fkpAcctHTML, fkpPopContent, fkpWarnHTML,
           fkpCashHTML, fkpClosePop, fkpOpenPop, fkpInSurface, fkpPopShow,
           fkpPopHide, fkpPopHideSoon, fkpCycle, FKP_HIDE_MS, _fkpHideT, and
           the demo/accts/popOpen keys of FKP_STATE
     CSS:  .fkp-demo*, .fkp-unit, .fkp-info*, .fkp-warn*, .fkp-cash[...],
           .fkp-pop*, .fkp-tip-hd, .fkp-tip-body, .fkp-tip-cta, .fkp-acct*,
           and the --sf-20/60/100/140, --red-50 and --pos-30 tokens they were
           the only users of
     WIRING: the mouseover, mouseout, keydown, resize and scroll listeners,
           the outside-click branch, and the warn/acct/review/cycle/stop
           actions. One click listener survives, for refresh.

   WHAT SURVIVES AND WHY:
     --cn-90         the tile label colour and the middle-dot separator use it
     .fkp-sr         fkpTileHTML still emits favourable/unfavourable
     .fkp-skel       refresh is still a data fetch, so it still shimmers
     position:relative on .fkp-tile is DROPPED though his file keeps it: it
       existed only to anchor .fkp-warn, and an inert declaration is exactly
       what the lint is for. This is the one place we do not match him byte
       for byte, and it changes nothing on screen.

   FKP_TODAY is left in place. It is unreferenced now and was unreferenced
   before this change, so it is a pre-existing finding and not something to
   fold into an owner-driven edit. Flagged rather than swept.
*/
"use strict";
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
function cut(a0, why) { swap(a0, "", why); }

/* the block must be where we think it is before anything is written */
["/* ===== W18 Financial KPI V2 ===== */", "/* ===== end W18 Financial KPI V2 ===== */"].forEach(m => {
  if (t.split(m).length - 1 !== 2) throw new Error("expected the W18 marker twice (CSS and JS): " + m);
});

/* ==================================================== CSS ============= */

/* (1) tokens and band height. The saffron ramp and two of the three borrowed
   design-system steps go with the chip and the panel; --cn-90 stays. */
swap(`.fkp-band,.fkp-pop{
  --sf-20:#fdeeba;
  --sf-60:#e3cf94;
  --sf-100:#f5b301;
  --sf-140:#c77d00;
  /* missing steps in ramps she already declares, from pathway-ds-main */
  --red-50:#e29f9f;
  --pos-30:#c9edce;
  --cn-90:#979797;
}

.fkp-band{
  height:176px;
  margin:0 0 16px;
  box-sizing:border-box;
}`,
`/* The saffron ramp and the borrowed --red-50 / --pos-30 steps left with the
   Cash Position tile on 28 Sep 2026: its warning chip, its panel and its
   account rows were the only things that painted with them. --cn-90 stays,
   because the tile label and the middle dot separator still use it. The
   selector no longer names a second root either, there being no body mounted
   panel to hand the tokens to. */
.fkp-band{
  --cn-90:#979797;
  /* height:auto, not her fixed 176px Glance height: the three tiles are
     their own cards now and size themselves (Aditya, 25 Sep 2026). */
  height:auto;
  margin:0 0 16px;
  box-sizing:border-box;
}`, "tokens pruned to --cn-90, band height goes auto");

/* (2) the band pads itself, so the header and row stop padding individually */
swap(`  box-shadow:0 1px 2px rgba(41,39,36,.04),0 2px 8px rgba(41,39,36,.05);
}

/* Header. Deliberately carries no resize control and no tier menu: the band
   is fixed by ruling, so offering either would imply an action that does not
   exist. Refresh is her own .iconbtn with her own refresh glyph and her own
   "updated" wording. The demo chip is prototype only (spec section 6) and
   says so in its own tooltip. */
.fkp-hd{
  display:flex;
  align-items:center;
  gap:8px;
  padding:7px 10px 0 14px;
  flex:0 0 auto;
}`,
`  box-shadow:0 1px 2px rgba(41,39,36,.04),0 2px 8px rgba(41,39,36,.05);
  /* the band pads itself now that the tiles are cards, rather than the
     header and the row each carrying their own asymmetric padding */
  padding:10px 12px 12px;
}

/* Header. Deliberately carries no resize control and no tier menu: the band
   is fixed by ruling, so offering either would imply an action that does not
   exist. Refresh is her own .iconbtn with her own refresh glyph and her own
   "updated" wording, and is now the only control in the header: the
   prototype state chip went with the Cash Position tile. */
.fkp-hd{
  display:flex;
  align-items:center;
  gap:8px;
  padding:0 0 8px 0;
  flex:0 0 auto;
}`, "root pads itself, header padding follows his layout");

/* (3) the prototype state chip */
cut(`
/* Prototype state chip. Colour follows the current severity. */
.fkp-demo{
  display:inline-flex;
  align-items:center;
  gap:4px;
  height:26px;
  padding:0 9px;
  border:1px solid var(--sf-60);
  border-radius:6px;
  background:var(--sf-20);
  font:inherit;
  font-size:11px;
  font-weight:600;
  color:var(--sf-140);
  cursor:pointer;
  white-space:nowrap;
  transition:background var(--dur),border-color var(--dur);
}
.fkp-demo:hover{background:var(--sf-60);}
.fkp-demo .material-symbols-rounded{font-size:14px;line-height:1;}
.fkp-demo[data-sev="clean"]{border-color:var(--pos-30);background:var(--pos-10);color:var(--green-120);}
.fkp-demo[data-sev="clean"]:hover{background:var(--pos-30);}
.fkp-demo[data-sev="red"]{border-color:var(--red-50);background:var(--red-10);color:var(--red-130);}
.fkp-demo[data-sev="red"]:hover{background:var(--red-50);}
`, "the .fkp-demo chip rules are gone");

/* (4) three tiles, each its own card */
swap(`/* Four tiles across at every width down to tablet, then two by two. The band
   is fixed height, so the row takes the remaining space and never scrolls. */
.fkp-row{
  flex:1 1 auto;
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:1px;
  padding:6px 14px 12px;
  min-height:0;
  background:transparent;
}
.fkp-tile{
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:3px;
  min-width:0;
  padding:0 14px;
  border-left:1px solid var(--cn-30);
}
.fkp-tile:first-child{border-left:0;padding-left:0;}`,
`/* Three tiles across down to tablet, then two by two. Each tile is its own
   card with its own surface, border and radius, which is Aditya's 25 Sep
   layout (c016583): the 1px divider band it replaces made sense when a
   fourth tile carried a warning that had to sit visually inside the band.
   position:relative is NOT kept, though his file keeps it: it existed only
   to anchor the warning button, and there is nothing absolute here now. */
.fkp-row{
  flex:1 1 auto;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
  min-height:0;
}
.fkp-tile{
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:4px;
  min-width:0;
  padding:10px 16px 12px;
  background:var(--surface-widget);
  border:1px solid var(--stroke-widget);
  border-radius:8px;
}`, "the row is 3 equidistant cards");

/* (5) .fkp-unit was the Cash Position value's "months" suffix */
cut(`.fkp-unit{
  font-size:13px;
  font-weight:500;
  color:var(--txt-secondary);
  letter-spacing:0;
}
`, ".fkp-unit goes with the runway value");

/* (6) .fkp-info was the runway note's affordance */
cut(`
/* Info affordance next to the runway wording. Uses her delegated data-tip
   system, so there is no native title attribute anywhere in this block. */
.fkp-info{
  display:inline-flex;
  align-items:center;
  color:var(--cn-90);
  cursor:help;
  flex:0 0 auto;
}
.fkp-info .material-symbols-rounded{font-size:14px;line-height:1;}
.fkp-info:hover{color:var(--txt-secondary);}
`, ".fkp-info goes with the runway note");

/* (7) the loading note no longer has a chip or a panel to exempt */
swap(`/* Loading. A refresh is a data fetch, so it gets her shimmer treatment; the
   demo chip and the warning panel do not, because they change nothing that
   has to be fetched. Her .skeleton is a flex column built for a whole card
   body, so the band uses its own per-tile bars on her same token and timing. */`,
`/* Loading. A refresh is a data fetch, so it gets her shimmer treatment. Her
   .skeleton is a flex column built for a whole card body, so the band uses
   its own per-tile bars on her same token and timing. */`, "the loading note drops the chip and panel");

/* (8) the whole Cash Position and reconciliation-warning cluster */
{
  const from = "/* ---- Cash Position tile: the reconciliation warning ---- */";
  const to = ".fkp-tip-cta{margin-top:2px;}";
  const i = t.indexOf(from.split("\n").join(NL));
  if (i < 0) throw new Error("the Cash Position CSS section was not found");
  const j = t.indexOf(to, i);
  if (j < 0) throw new Error("the end of the Cash Position CSS section was not found");
  let end = t.indexOf(NL, j);
  end = end < 0 ? t.length : end + NL.length;
  /* the blank line that followed it goes too */
  if (t.slice(end, end + NL.length) === NL) end += NL.length;
  const n = t.slice(i, end).split(NL).length - 1;
  t = t.slice(0, i) + t.slice(end);
  log.push("  cut the Cash Position CSS cluster (" + n + " lines: warn, pop, tip, acct)");
}

/* (9) the breakpoints have no dividers to unpick and no fixed height to undo */
swap(`@media (max-width:1100px){
  .fkp-band{height:auto;}
  .fkp-row{grid-template-columns:repeat(2,1fr);gap:10px 1px;padding-bottom:14px;}
  .fkp-tile:nth-child(3){border-left:0;padding-left:0;}
}
@media (max-width:620px){
  .fkp-row{grid-template-columns:1fr;}
  .fkp-tile{border-left:0;padding-left:0;}
}
@media (prefers-reduced-motion:reduce){
  .fkp-demo,.fkp-acct{transition:none;}
  .fkp-skel{animation:none;}
}`,
`/* The band is height:auto at every width now, and the tiles are cards rather
   than divided columns, so the breakpoints only restate the column count. */
@media (max-width:1100px){
  .fkp-row{grid-template-columns:repeat(2,1fr);}
}
@media (max-width:620px){
  .fkp-row{grid-template-columns:1fr;}
}
@media (prefers-reduced-motion:reduce){
  .fkp-skel{animation:none;}
}`, "the breakpoints simplify to the column count");

/* ==================================================== JS ============== */

/* (10) the cash, threshold, account, severity and demo model */
swap(`/* Runway: total cash divided by average monthly operating expenses.
   3224350 / 358000 = 9.01, shown as 9 months (spec 4a). The averaging window
   is a fixture here; the spec records it as configurable in production. */
var FKP_CASH={cash:3224350,opex:358000,months:9,window:"May to Jul 2026",windowMonths:3};

/* Reconciliation threshold in days. Hardcoded in the prototype and recorded
   in spec section 11 as an admin setting in production. */
var FKP_THRESHOLD_DAYS=30;

/* The two accounts the amber states enumerate. "late" drives the red date
   text on a significantly overdue account (spec 5c). */
var FKP_ACCTS=[
  {id:"pc3355",name:"Payroll Checking ..3355", last:"Jul 26, 2026", days:31, late:false},
  {id:"ms1188",name:"Missions Savings ..1188", last:"Jun 25, 2026", days:62, late:true}
];

/* Severity is 2 colour by account count (spec 5a): amber under 3, red over 5.
   THE 3 TO 5 BAND IS UNDEFINED IN THE SPEC. Section 5a flags it as needing
   product confirmation and says the prototype treats it as amber. That is
   what fkpSevOf does, and the gap is surfaced on screen in the panel
   rather than hidden, per the placeholder rule. */
function fkpSevOf(n){
  if(!n)return "clean";
  return n>5?"red":"amber";
}
function fkpUndefinedBand(n){return n>=3&&n<=5;}

/* Prototype only demo cycle, spec section 6. Loads at 1 account so the
   clickable row with its chevron is visible without pressing anything. */
var FKP_DEMO=[
  {accts:1,lbl:"1 account",   ic:"warning"},
  {accts:2,lbl:"2 accounts",  ic:"warning"},
  {accts:6,lbl:"6 accounts",  ic:"error"},
  {accts:0,lbl:"No warning",  ic:"check_circle"}
];

var FKP_STATE={demo:0,accts:1,popOpen:false,loading:false,updated:"just now"};`,
`/* THE CASH POSITION TILE AND ITS RECONCILIATION WARNING WERE REMOVED on
   28 Sep 2026 (owner, following Aditya c0359df and c016583). Deleted with
   them: FKP_CASH, FKP_THRESHOLD_DAYS, FKP_ACCTS, FKP_DEMO, fkpSevOf,
   fkpUndefinedBand, and the demo, accts and popOpen state keys. The whole
   subsystem hung off a tile that no longer exists, and the prototype chip
   was the only way to reach its other states, so nothing could have shown
   it. Spec sections 5, 6, 7, 8, 10 and 11 therefore no longer apply to this
   block; they are recorded in docs/decisions/W18.md against the day the
   tile was dropped, so the reasoning survives the code.

   What is left is three tiles and a refresh. */
var FKP_STATE={loading:false,updated:"just now"};`, "the cash, severity and demo model is deleted");

/* (11) the account row, the panel content, the trigger and the tile */
{
  const from = "function fkpAcctHTML(a){";
  const to = "function fkpBandHTML(){";
  const i = t.indexOf(from), j = t.indexOf(to);
  if (i < 0 || j < 0 || j < i) throw new Error("the cash render functions were not located");
  const n = t.slice(i, j).split(NL).length - 1;
  t = t.slice(0, i) + t.slice(j);
  log.push("  cut fkpAcctHTML, fkpPopContent, fkpWarnHTML and fkpCashHTML (" + n + " lines)");
}

/* (12) the band: no severity to compute, no chip, no fourth tile */
cut(`  var d=FKP_DEMO[FKP_STATE.demo],sev=fkpSevOf(FKP_STATE.accts);
`, "the band stops computing a severity");
cut(`      '<button type="button" class="fkp-demo" data-fkp="cycle" data-sev="'+sev+'" data-tip="Prototype control only. Cycles the reconciliation warning through its four states so reviewers can see each one. It does not exist in production." data-tip-plain>'+
        ICON(d.ic)+'<span>'+fkpEsc(d.lbl)+'</span>'+
      '</button>'+
`, "the prototype chip leaves the header");
swap(`      FKP_TILES.map(fkpTileHTML).join("")+
      fkpCashHTML()+
    '</div>'+`,
`      FKP_TILES.map(fkpTileHTML).join("")+
    '</div>'+`, "the row is the three tiles and nothing else");

/* (13) render has no panel to keep in step with */
swap(`  el.innerHTML=fkpBandHTML();
  /* keep the body mounted panel in step with the state that just rendered */
  if(FKP_STATE.popOpen&&fkpSevOf(FKP_STATE.accts)!=="clean")fkpOpenPop();else fkpClosePop();
}`,
`  el.innerHTML=fkpBandHTML();
}`, "render stops reconciling a panel");

/* (14) the panel itself, its hover manager and the demo cycle */
{
  const from = "/* (3) THE WARNING PANEL, own #fkpPop, body mounted -------------------";
  const to = "/* Mirrors her own refresh(id): loading state, render, one timer in her shared";
  const i = t.indexOf(from), j = t.indexOf(to);
  if (i < 0 || j < 0 || j < i) throw new Error("the panel section was not located");
  const n = t.slice(i, j).split(NL).length - 1;
  t = t.slice(0, i) +
    "/* (3) STATE ----------------------------------------------------------" + NL +
    "   The body mounted #fkpPop, its 200ms hover persistence manager" + NL +
    "   (fkpInSurface / fkpPopShow / fkpPopHide / fkpPopHideSoon) and the demo" + NL +
    "   cycle were deleted with the Cash Position tile on 28 Sep 2026. They were" + NL +
    "   the answer to a clipping problem on a tile that no longer exists. The" + NL +
    "   house answer they followed is still in the file, in .faf-pop and" + NL +
    "   .gpf-pop, if a popover is ever wanted here again. */" + NL +
    "var FKP_WIRED=false;" + NL +
    "var FKP_LOAD_MS=1100;" + NL + NL +
    t.slice(j);
  log.push("  cut the panel, the hover manager and fkpCycle (" + n + " lines)");
}

/* (15) refresh has no panel to drop, and its note must stop saying it does */
swap(`/* Mirrors her own refresh(id): loading state, render, one timer in her shared
   timers object, then ready with the stamp reset. An open panel is dropped
   first, exactly as her handler does pop=null before calling refresh. */
function fkpRefresh(){
  FKP_STATE.popOpen=false;
  FKP_STATE.loading=true;`,
`/* Mirrors her own refresh(id): loading state, render, one timer in her shared
   timers object, then ready with the stamp reset. It no longer drops an open
   panel first, there being no panel to drop since 28 Sep 2026. */
function fkpRefresh(){
  FKP_STATE.loading=true;`, "refresh stops dropping a panel, and says so");

/* (16) one listener, one action */
{
  const from = "function fkpWire(){";
  const to = "/* (5) MOUNT -----------------------------------------------------------";
  const i = t.indexOf(from), j = t.indexOf(to);
  if (i < 0 || j < 0 || j < i) throw new Error("fkpWire was not located");
  const n = t.slice(i, j).split(NL).length - 1;
  t = t.slice(0, i) +
    "/* (4) WIRING ---------------------------------------------------------" + NL +
    "   One delegated click listener with one action. It was five listeners and" + NL +
    "   six actions until 28 Sep 2026: the outside-click branch, the mouseover," + NL +
    "   mouseout and keydown handlers and the resize and scroll repositioning" + NL +
    "   all existed for the warning panel, and warn, acct, review, cycle and" + NL +
    "   stop were its actions. Refresh is what is left. */" + NL +
    "function fkpWire(){" + NL +
    "  if(FKP_WIRED)return;FKP_WIRED=true;" + NL +
    "  document.addEventListener(\"click\",function(e){" + NL +
    "    var n=e.target.closest&&e.target.closest(\"[data-fkp]\");" + NL +
    "    if(!n)return;" + NL +
    "    if(n.getAttribute(\"data-fkp\")===\"refresh\")fkpRefresh();" + NL +
    "  });" + NL +
    "}" + NL + NL +
    t.slice(j);
  log.push("  fkpWire reduced to one listener and one action (was " + n + " lines)");
}

/* ==================================================== guards ========== */

/* Names must be gone from CODE, not merely from comments: the comments above
   deliberately still say what was removed. */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "");
["FKP_CASH", "FKP_THRESHOLD_DAYS", "FKP_ACCTS", "FKP_DEMO", "fkpSevOf", "fkpUndefinedBand",
  "fkpAcctHTML", "fkpPopContent", "fkpWarnHTML", "fkpCashHTML", "fkpClosePop", "fkpOpenPop",
  "fkpInSurface", "fkpPopShow", "fkpPopHide", "fkpPopHideSoon", "fkpCycle", "FKP_HIDE_MS",
  "_fkpHideT", "popOpen", "fkpWarnBtn", "fkpPop",
  "fkp-demo", "fkp-cash", "fkp-warn", "fkp-pop", "fkp-acct", "fkp-info", "fkp-unit",
  "fkp-tip-hd", "fkp-tip-body", "fkp-tip-cta",
  "--sf-20", "--sf-60", "--sf-100", "--sf-140", "--red-50", "--pos-30",
  'data-fkp="warn"', 'data-fkp="acct"', 'data-fkp="review"', 'data-fkp="cycle"', 'data-fkp="stop"',
  "Unreconciled", "operating runway", "Cash Position", "reconciliation threshold"
].forEach(n => {
  const c = codeOnly.split(n).length - 1;
  if (c) throw new Error("still present in code: " + n + " x" + c);
});

/* what must survive */
["FKP_TILES", "FKP_STATE", "fkpTileHTML", "fkpBandHTML", "fkpRender", "fkpRefresh",
  "fkpWire", "fkpInit", "fkpEsc", "FKP_WIRED", "FKP_LOAD_MS", "fkp-sr", "fkp-skel",
  "--cn-90", 'data-fkp="refresh"', 'id="fkpBand"'].forEach(n => {
    if (codeOnly.indexOf(n) < 0) throw new Error("wrongly removed: " + n);
  });

/* the four changes actually landed */
if (!/\.fkp-row\{[^}]*grid-template-columns:repeat\(3,1fr\)/.test(t)) throw new Error("the row is not three columns");
if (!/\.fkp-row\{[^}]*gap:10px/.test(t)) throw new Error("the row gap is not 10px");
if (!/\.fkp-tile\{[^}]*border-radius:8px/.test(t)) throw new Error("the tile is not a card");
if (!/\.fkp-tile\{[^}]*background:var\(--surface-widget\)/.test(t)) throw new Error("the tile has no surface");
if (/height:176px/.test(t.slice(t.indexOf("/* ===== W18 Financial KPI V2 ====="), t.indexOf("/* ===== end W18 Financial KPI V2 ===== */")))) {
  throw new Error("the band still carries the fixed 176px height");
}
if (t.indexOf("border-left:1px solid var(--cn-30)") > -1) throw new Error("a divider rule survived");

/* the band still renders three tiles and a refresh */
if ((t.match(/FKP_TILES\.map\(fkpTileHTML\)/g) || []).length !== 1) throw new Error("the tile row is not built exactly once");

/* Aditya's exploration scaffolding must not have come across */
["fkpSoloRender", "fkpCRender", "fkpDRender", "fkpVariantSwitch", "fkp-solo", "fkp-c-", "fkp-d-",
  "fkpSoloRow", "fkpCBand", "fkpDBand"].forEach(n => {
    if (t.indexOf(n) > -1) throw new Error("exploration scaffolding leaked in: " + n);
  });

let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("W18 is Aditya's latest: three equidistant cards, no Cash Position, no prototype chip");
