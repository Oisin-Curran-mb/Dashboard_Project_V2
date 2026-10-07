/* w18-fkp.driver.js
   Interaction driver for W18 Financial KPI.

   Runs the real block in the shared DOM shim and asserts every state and path.
   Unlike the other sixteen drivers this widget is NOT a registry widget: it is
   a band with its own mount, so there is no registry to extract, no tier loop,
   and no contentHTML dispatch to locate. The structural assertions check the
   opposite instead: that nothing of Jo's was touched at all.

   rev 2 (2026-09-15): the warning panel moved from an absolutely positioned
   child of the cash tile to a body mounted #fkpPop, and her refresh control
   was added.

   rev 3 (2026-09-28): THE CASH POSITION TILE AND ITS RECONCILIATION WARNING
   ARE GONE, on the owner's instruction, following Aditya's own two commits of
   25 September (c0359df, c016583). The band is three equidistant cards and a
   refresh control, and that is now most of what there is to test.

   Sections 4, 8, 9, 10, 11 and 13 of rev 2 are therefore deleted rather than
   weakened: they tested a severity model, a body mounted panel, its dismiss
   paths, its hover persistence manager, its repositioning and the prototype
   demo cycle, none of which exist. In their place section 8 asserts the
   REMOVAL: that each name is undefined rather than merely uncalled, that the
   retired actions are inert, and that no listener survives that had only the
   panel to serve. That is the same shape the W17 driver uses for the dropped
   "Prompted by" column, and it is what stops the deletion being silently
   undone later.

   The model is NOT kept dormant here. The owner's words were "drop the cash
   postion completly ... remove or just not include the code", so unlike W17's
   motivation field there is nothing left behind to pin.

   node _tools/w18-fkp.driver.js
*/
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const META = H.meta("W18");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + "");
const DIR = path.join(__dirname, "..");
const FILE = path.join(DIR, "index.html");
const raw = fs.readFileSync(FILE, { encoding: "utf-8" });

const START = "/* ===== W18 Financial KPI V2 ===";
const END = "/* ===== end W18 Financial KPI V2 ===== */";

/* comment-stripped source, so a claim about the CODE is not satisfied or
   defeated by a comment that merely NAMES what was removed. The block's own
   comments deliberately still say "Cash Position". */
const stripJs = s => String(s).replace(/\/\*[\s\S]*?\*\//g, "");
/* the same for CSS, and for the same reason: the block's comment explains
   which tokens left with the tile, so it NAMES --sf-140 and --red-50. A
   check that they are no longer DECLARED has to read past that. */
const stripCss = stripJs;

/* ---------- 0. the file itself --------------------------------------- */
const snaps = H.baselineFiles();
const snap = snaps.length ? fs.readFileSync(snaps[snaps.length - 1], { encoding: "utf-8" }) : null;

A.ok(raw.indexOf("\r\n") > -1, "file uses CRLF");
A.eq(raw.split("\n").filter(l => l.length && l.charAt(l.length - 1) !== "\r").length, 0, "no bare LF line introduced");

A.eq((raw.match(/id="fkpBand"/g) || []).length, 1, "exactly one #fkpBand mount element");
A.ok(raw.indexOf('id="fkpBand"') < raw.indexOf('id="dashboard"'), "band is placed ABOVE the widget grid");

/* Jo's JavaScript is untouched: no dispatch line, no registry row, nothing. */
A.absent(raw, 'kind:"fkpi', "no registry kind was introduced");
A.absent(raw, 'kind:"fkp', "no registry kind was introduced (short form)");
if (snap) {
  /* The "render() byte-identical" check was retired 2026-09-25 (decision D8:
     the shell is being restructured, render() now routes through WIDGETS and
     the review viewer). The W18 band still must not be drawn by render(): */
  A.absent(raw.match(/function render\(\)\{[\s\S]*?renderModal\(\);\}/)[0], "fkp", "render() does not draw the W18 band (it mounts itself into #fkpBand)");
  const ch = /function contentHTML\(w\)\{[\s\S]{0,60}/;
  const ca = snap.match(ch), cb = raw.match(ch);
  A.ok(ca && cb && ca[0] === cb[0], "Jo's contentHTML() opening is byte-identical");
  /* Against the a548419 baseline (2026-09-25) the (OC) clones legitimately ADD
     branches on kinds Jo also tests (rep, pt, distpt, all), so the check is that
     none of her branches was REMOVED, not that counts are identical. */
  const kinds = (snap.match(/kind==="[a-z0-9-]+"/g) || []);
  /* kinds that now plug in through WIDGETS.register() have had their if-chain
     branches removed on purpose (decision D8), so they are excluded here */
  const registered = (raw.match(/WIDGETS\.register\("([a-z0-9-]+)"/g) || []).map(s => /"([a-z0-9-]+)"/.exec(s)[1]);
  /* kinds deleted when a widget was decided (widget-map.json `removed`) are gone on purpose too */
  const MAPW = JSON.parse(fs.readFileSync(path.join(__dirname, "widget-map.json"), "utf8")).widgets;
  Object.keys(MAPW).forEach(k => (MAPW[k].removed || []).forEach(r => registered.push(r)));
  const moved = [...new Set(kinds)].filter(k => {
    const kind = /"([a-z0-9-]+)"/.exec(k)[1];
    if (registered.indexOf(kind) > -1) return false;
    /* only real widget kinds: ones with a registry row inside the baseline's dashboards literal; helpers compare other strings with kind=== too */
    const regOld = snap.slice(snap.indexOf("  var dashboards=["), snap.indexOf("dashboards.forEach(function(d){"));
    if (regOld.indexOf('kind:"' + kind + '"') < 0) return false;
    const re = new RegExp(k.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"), "g");
    return (raw.match(re) || []).length < (snap.match(re) || []).length;
  });
  A.eq(moved.length, 0, "no kind branch of Jo's was removed: " + moved.join(","));
  /* her own refresh plumbing must be untouched: we added our own, not hers */
  const jr = /function refresh\(id\)\{[\s\S]*?1100\);\}/;
  const ra = snap.match(jr), rb = raw.match(jr);
  A.ok(ra && rb && ra[0] === rb[0], "Jo's refresh(id) is byte-identical");
  A.eq((raw.match(/data-action="refresh"/g) || []).length,
       (snap.match(/data-action="refresh"/g) || []).length,
       "her data-action refresh count is unmoved (ours uses data-fkp)");
}

/* ---------- 1. extract our two blocks -------------------------------- */
const script = raw.slice(raw.indexOf("<script>"), raw.lastIndexOf("</script>"));
const css = raw.slice(raw.indexOf("<style"), raw.lastIndexOf("</style>"));

const bi = script.indexOf(START), bj = script.indexOf(END);
A.ok(bi > -1 && bj > bi, "JS region markers found");
const block = script.slice(bi, bj + END.length);
const blockCode = stripJs(block);

const ci = css.indexOf(START), cj = css.indexOf(END);
A.ok(ci > -1 && cj > ci, "CSS region markers found");
const ourCss = css.slice(ci, cj + END.length);

/* the block must live INSIDE the shell's IIFE, or ICON/money/setStatus/render
   are out of scope at run time. This is the bug the sibling drivers caught. */
A.ok(script.indexOf(START) < script.lastIndexOf(H.TAIL), "JS block is inside the shell IIFE");
A.ok(raw.slice(raw.lastIndexOf("</script>") - H.TAIL.length, raw.lastIndexOf("</script>")) === H.TAIL,
     "script still ends on the render()/IIFE tail the sibling drivers pin");

/* ---------- 2. CSS ---------------------------------------------------- */
const USED = ["fkp-band", "fkp-root", "fkp-hd", "fkp-title", "fkp-hd-sp",
  "fkp-row", "fkp-tile", "fkp-lbl", "fkp-val", "fkp-meta", "fkp-py", "fkp-sep",
  "fkp-var", "fkp-sr", "fkp-skel"];
A.cssDeclares(ourCss, USED, "W18 CSS");

/* the W16 defect class: a class declared and never used. Everything the
   Cash Position tile painted with must be gone from the stylesheet too, or
   the deletion has only moved the dead weight. */
A.absent(ourCss, ".fkp-sub", "the removed subtitle's CSS rule is gone, not orphaned");
A.absent(ourCss, ".fkp-tip{", "the old in-tile .fkp-tip rule is gone");
[".fkp-demo", ".fkp-unit", ".fkp-info{", ".fkp-warn", ".fkp-cash", ".fkp-pop",  /* ".fkp-info{" exact: the 7 Oct .fkp-info-btn is a different, live rule */
  ".fkp-tip-hd", ".fkp-tip-body", ".fkp-tip-cta", ".fkp-acct"].forEach(sel => {
    A.absent(ourCss, sel, "the retired rule " + sel + " is gone from our CSS");
    A.absent(css, sel, "and from the whole stylesheet, so nothing else adopted it");
  });

["\\.widget\\{", "\\.dashboard\\{", "\\.whead\\{", "\\.btn\\{", "\\.state\\{", "\\.iconbtn\\{", "\\.skeleton\\{"].forEach(sel => {
  A.ok(!new RegExp(sel).test(ourCss), "our CSS does not declare " + sel.replace(/\\/g, ""));
});
A.eq((ourCss.match(/^\s*:root/gm) || []).length, 0, "nothing declared on :root");

/* Tokens. Only --cn-90 is left: the saffron ramp and the two borrowed
   design-system steps had no user but the warning chip and its panel. */
A.eq((ourCss.match(/--cn-90:/g) || []).length, 1, "--cn-90 declared exactly once in our block");
A.eq((css.replace(ourCss, "").match(/--cn-90:/g) || []).length, 0, "--cn-90 not declared anywhere of hers");
A.contains(ourCss, "--cn-90:var(--primitive-color-cool-neutral-200)", "--cn-90 carries her cool neutral value");
const ourCssCode = stripCss(ourCss);
["--sf-20", "--sf-60", "--sf-100", "--sf-140", "--red-50", "--pos-30"].forEach(t => {
  A.absent(ourCssCode, t, t + " went with the warning chip, rather than being left declared and unused");
  A.eq((css.match(new RegExp(t + ":", "g")) || []).length, 0, t + " is not declared anywhere in the stylesheet");
  A.eq((stripCss(css).match(new RegExp("var\\(" + t + "\\)", "g")) || []).length, 0, t + " is not referenced anywhere either");
});
A.absent(ourCss, ".fkp-band,", "the token selector no longer names a second root: there is no body mounted panel");

/* Aditya's 25 September layout, all four changes, asserted on the rules
   themselves rather than on a substring of the block. */
const rule = name => {
  const m = new RegExp("^\\" + name + "\\{[^}]*\\}", "m").exec(ourCss);
  return m ? m[0] : "";
};
const rowRule = rule(".fkp-row"), tileRule = rule(".fkp-tile"), bandRule = rule(".fkp-band");
A.contains(rowRule, "grid-template-columns:repeat(3,1fr)", "(1) three tiles across, equidistant");
A.contains(rowRule, "gap:10px", "(2) his 10px gap between the cards");
A.absent(rowRule, "padding", "the row carries no padding of its own: the root pads the band");
A.absent(rowRule, "background", "and no background of its own");
A.contains(tileRule, "background:var(--surface-widget)", "(3) each tile is its own surface");
A.contains(tileRule, "border:1px solid var(--stroke-widget)", "each tile has its own border");
A.contains(tileRule, "border-radius:8px", "each tile has his 8px radius");
A.contains(tileRule, "padding:10px 16px 12px", "and his tile padding");
A.absent(tileRule, "border-left", "the 1px divider band is gone");
A.contains(tileRule, "position:relative", "the tile anchors its calculation info button (Aditya, 7 Oct)");
A.absent(ourCss, "var(--cn-30)", "the divider colour left with the dividers");
A.absent(ourCss, ":first-child", "and so did the first-child exception it needed");
A.contains(bandRule, "height:auto", "(4) the band sizes to its cards, not to her fixed Glance height");
A.absent(ourCss, "height:176px", "her 176px Glance height is gone from the band");
A.contains(rule(".fkp-root"), "padding:10px 12px 12px", "the root pads the band");
A.contains(rule(".fkp-hd"), "padding:0 0 8px 0", "and the header only pads beneath itself");

/* the breakpoints have nothing left to unpick */
const mq = ourCss.slice(ourCss.indexOf("@media (max-width:1100px)"));
A.contains(mq, ".fkp-row{grid-template-columns:repeat(2,1fr);}", "tablet is two across, and only that");
A.contains(mq, ".fkp-row{grid-template-columns:1fr;}", "phone is one across");
A.absent(mq, ".fkp-band{height:auto;}", "no breakpoint needs to undo a fixed height any more");
A.absent(mq, ".fkp-tile", "no breakpoint needs to unpick a divider any more");
A.contains(mq, ".fkp-skel{animation:none;}", "reduced motion still stills the shimmer");
A.absent(mq, "transition:none", "and no longer stills transitions nothing has");

/* the band is still faithful to her .widget rule */
A.contains(rule(".fkp-root"), "overflow:hidden", ".fkp-root keeps overflow:hidden, faithful to her .widget rule");

/* ---------- 3. run the block ----------------------------------------- */
let timerScheduled = 0, lastTimerFn = null;
const run = H.runBlock(block, {
  dataAttr: "data-fkp",
  globals: {
    setTimeout: function (f) { timerScheduled++; lastTimerFn = f; return timerScheduled; },
    clearTimeout: function () {},
    /* the shell's registry, reduced to the two slots the band adds to (a popover type and a click handler); it registers no kind */
    WIDGETS: { kinds: {}, pops: {}, clicks: [] }
  }
});
const ctx = run.ctx, shim = run.shim;

/* ---------- 3b. the About popover plugs into the registry, not into the shell's code (owner, 7 Oct 2026) ---- */
A.eq(Object.keys(ctx.WIDGETS.kinds).length, 0, "the band still registers no widget kind");
A.ok(!!ctx.WIDGETS.pops["fkp-info"], "it adds one popover type, fkp-info");
A.eq(ctx.WIDGETS.clicks.length, 1, "and one click handler");
ctx.pop = { type: "fkp-info", id: "fkp-0" };
const popHtml = ctx.WIDGETS.pops["fkp-info"].content();
A.contains(popHtml, '<div class="wtip-h">Total Income (YTD)</div>', "the popover title is the tile name, in her About title class");
A.contains(popHtml, '<div class="wtip-b">Sum of all revenue posted to income accounts from Jan 1 to today.</div>', "the body is the calculation sentence, in her About body class");
A.contains(popHtml, '<div class="sep"></div>', "her divider"); A.contains(popHtml, 'class="mi wtip-link" data-action="noop"', "and her user-guide link, inert as on every widget");
A.absent(popHtml, "Prev yr", "the popover does not repeat the prior-year figure the tile already shows");
A.eq(ctx.WIDGETS.pops["fkp-info"].trigger(), '[data-action="fkp-info"][data-id="fkp-0"]', "the popover is positioned against its own tile's button");
ctx.pop = { type: "fkp-info", id: "fkp-2" }; A.contains(ctx.WIDGETS.pops["fkp-info"].content(), "Total Income minus Total Expenses year-to-date.", "the third tile explains net income");
ctx.pop = null; A.eq(ctx.WIDGETS.clicks[0]("fkp-info", "fkp-1"), true, "the click handler claims fkp-info"); A.ok(ctx.pop && ctx.pop.type === "fkp-info" && ctx.pop.id === "fkp-1", "and opens that tile's popover");
A.eq(ctx.WIDGETS.clicks[0]("fkp-info", "fkp-1"), true, "a second click"); A.eq(ctx.pop, null, "toggles it closed");
A.eq(ctx.WIDGETS.clicks[0]("winfo", "x"), false, "any other action is left to the shell");

const bandNode = shim.mkNode("fkpBand", "div");
shim.nodes.fkpBand = bandNode;

ctx.fkpRender();
let h = shim.captured.fkpBand;
A.ok(h && h.length > 400, "band renders into #fkpBand");

/* ---------- 4. the state is two keys ---------------------------------- */
A.eq(Object.keys(ctx.FKP_STATE).sort().join(","), "loading,updated",
     "FKP_STATE carries only loading and updated: demo, accts and popOpen are gone");
A.eq(ctx.FKP_STATE.loading, false, "it loads ready, not loading");
A.eq(ctx.FKP_STATE.updated, "just now", "and with a fresh stamp");
A.eq(ctx.FKP_TILES.length, 3, "three tiles in the model");

/* ---------- 5. the band: three cards and a refresh -------------------- */
A.eq((h.match(/class="fkp-tile/g) || []).length, 3, "three tiles rendered, not four");
A.contains(h, ">Financial KPI<", "title renders as Financial KPI");
A.contains(h, '<div class="fkp-row">', "the tiles sit in the row");
A.contains(h, 'role="region"', "the band is a labelled region");
A.contains(h, 'aria-label="Financial KPI"', "with the same accessible name as its title");
/* the header holds the title, the spacer and the refresh control, nothing else */
const hd = h.slice(h.indexOf('class="fkp-hd"'), h.indexOf('class="fkp-row"'));
A.eq((hd.match(/<button/g) || []).length, 1, "exactly one control in the header");
A.contains(hd, 'data-fkp="refresh"', "and it is refresh");

/* the subtitle is gone, by ruling */
A.absent(h, "Year to date", "the 'Year to date' subtitle is removed");
A.absent(h, "fkp-sub", "the subtitle element is gone from the markup");
A.absent(h, "W18", "W18 never appears in rendered output");
A.absent(h, "v5", "prototype version number is not shown to users");
A.ok(block.indexOf("W18") > -1, "W18 does appear in the code comments (internal identifier)");

/* no resize, no tier menu, by ruling */
A.absent(h, "aspect_ratio", "no resize control");
A.absent(h, "more_vert", "no kebab menu");
A.absent(h, "data-size", "no tier attribute: the band is fixed");

/* ---------- 6. tiles, formatting ------------------------------------- */
A.contains(h, "$1,824,350", "income value formatted by her money()");
A.contains(h, "$1,681,550", "expenses value");
A.contains(h, "$142,800", "net income value");
A.contains(h, "Prev yr $1,682,400", "prior year comparison");
["Total Income (YTD)", "Total Expenses (YTD)", "Net Income (YTD)"].forEach(l =>
  A.contains(h, l, "label uses parentheses, not a dash: " + l));
A.eq((h.match(/fkp-var pos/g) || []).length, 2, "two favourable variances");
A.eq((h.match(/fkp-var neg/g) || []).length, 1, "one unfavourable variance");
A.eq((h.match(/fkp-sr/g) || []).length, 3, "each tile states favourable or unfavourable for a screen reader");
A.contains(h, "favourable", "the favourable wording is in the DOM as text");
A.contains(h, "unfavourable", "and the unfavourable wording");

/* her tooltip system, never a native title */
A.contains(h, "data-tip=", "uses her data-tip system");
A.eq((h.match(/data-tip=/g) || []).length, 1, "exactly one text tooltip in the band: the refresh stamp (the tiles use the About popover, not a tooltip)");
/* Each tile's info button is the shell's .wmini opening the shell's About popover through the registry (owner, 7 Oct 2026). */
A.eq((h.match(/data-action="fkp-info"/g) || []).length, 3, "one info button per tile");
A.eq((h.match(/class="wmini fkp-info-btn"/g) || []).length, 3, "the info button is her .wmini, not new chrome");
A.eq((h.match(/aria-haspopup="dialog"/g) || []).length, 3, "each announces its popover");
A.contains(blockCode, 'WIDGETS.pops["fkp-info"]', "the About popover is registered as a shell popover type");
A.contains(blockCode, 'class="wtip-h"', "and renders the shell's About card: title"); A.contains(blockCode, 'class="wtip-b"', "body"); A.contains(blockCode, 'class="sep"', "divider"); A.contains(blockCode, "Learn more in user guides", "and the user-guide link");
/* The plain variant was carried by the prototype chip and the runway info
   icon, both of which held prose long enough to need it. Both are gone, and
   the refresh stamp never used it, so asserting it here would be asserting
   the presence of something the band has no use for. */
A.absent(h, "data-tip-plain", "no plain-variant tooltip: the tiles' explanations live in the About popover");
A.eq((h.match(/\stitle="/g) || []).length, 0, "no native title attribute in the band");

/* ---------- 7. the refresh control ---------------------------------- */
A.contains(h, 'data-fkp="refresh"', "refresh control is present");
A.contains(h, 'class="iconbtn" data-fkp="refresh"', "refresh reuses HER .iconbtn, not new chrome");
A.contains(h, "refresh</span>", "refresh uses her refresh glyph");
A.contains(h, "Refresh · updated just now", "refresh tooltip uses her wording and her middle dot");
A.absent(h, "Refresh —", "refresh tooltip carries no em dash");
A.contains(h, 'aria-label="Refresh, updated just now"', "refresh has an accessible label");

/* refreshing: loading, then ready with the stamp reset, mirroring her refresh(id) */
ctx.FKP_STATE.updated = "4 minutes ago";
ctx.fkpRender();
A.contains(shim.captured.fkpBand, "updated 4 minutes ago", "the stamp renders as it stands");
let before = timerScheduled;
shim.fire("refresh", {});
A.eq(ctx.FKP_STATE.loading, true, "refresh enters the loading state");
A.eq(timerScheduled, before + 1, "refresh schedules exactly one timer");
let lh = shim.captured.fkpBand;
A.eq((lh.match(/fkp-skel/g) || []).length, 9, "all three tiles show skeletons while loading");
A.absent(lh, "$1,824,350", "figures are hidden while loading");
A.contains(lh, 'data-fkp="refresh"', "refresh stays available while loading");
A.contains(block, "FKP_LOAD_MS=1100", "load delay is 1100ms, the same as her refresh()");
A.contains(block, 'timers["fkp"]', "the timer is keyed in HER shared timers object");
run.log.status.length = 0;
lastTimerFn();
A.eq(ctx.FKP_STATE.loading, false, "the timer firing leaves the loading state");
A.eq(ctx.FKP_STATE.updated, "just now", "refresh resets the updated stamp, as hers does");
A.contains(shim.captured.fkpBand, "Refresh · updated just now", "the new stamp is rendered");
A.eq(run.log.status.length, 1, "refresh reports through her setStatus");
A.contains(run.log.status[0], "Financial KPI refreshed", "and says what was refreshed");

/* ---------- 8. the Cash Position tile and its warning are REMOVED ----
   Asserted as absence, and as undefined rather than merely uncalled, so the
   deletion cannot be quietly undone. Owner, 28 Sep 2026, following Aditya
   c0359df and c016583. */
ctx.fkpRender();
h = shim.captured.fkpBand;
["Cash Position", "operating runway", "months", "Unreconciled", "reconciliation",
  "Payroll Checking", "Missions Savings", "Last reconciled", "chevron_right",
  "Review in Bank Account Management", "Prototype control only", "1 account",
  "No warning", "not yet confirmed", "$3,224,350", "$358,000"].forEach(s =>
    A.absent(h, s, "the band says nothing about " + JSON.stringify(s)));
['data-fkp="warn"', 'data-fkp="acct"', 'data-fkp="review"', 'data-fkp="cycle"',
  'data-fkp="stop"', "fkp-cash", "fkp-warn", "fkp-unit", 'class="fkp-info"', "fkp-demo",  /* the old info popover's class exactly; fkp-info-btn and data-action="fkp-info" are the live 7 Oct button */
  "aria-expanded", "data-fkp-sev", "data-sev", "id=\"fkpWarnBtn\""].forEach(s =>
    A.absent(h, s, "the band carries no " + s));

/* deleted, not merely unreferenced */
["fkpCashHTML", "fkpWarnHTML", "fkpPopContent", "fkpAcctHTML", "fkpSevOf",
  "fkpUndefinedBand", "fkpOpenPop", "fkpClosePop", "fkpPopShow", "fkpPopHide",
  "fkpPopHideSoon", "fkpInSurface", "fkpCycle"].forEach(n =>
    A.eq(typeof ctx[n], "undefined", n + " is deleted, not merely unused"));
["FKP_CASH", "FKP_ACCTS", "FKP_DEMO", "FKP_THRESHOLD_DAYS", "FKP_HIDE_MS"].forEach(n =>
  A.eq(typeof ctx[n], "undefined", n + " is deleted from the model"));
A.eq(typeof ctx.FKP_LOAD_MS, "number", "but the refresh delay survives, because refresh survives");

/* and gone from the CODE, while the comments may still name them */
["FKP_CASH", "FKP_ACCTS", "FKP_DEMO", "fkpSevOf", "fkpCashHTML", "fkpPopContent",
  "popOpen", "fkpPop", "fkpWarnBtn"].forEach(n =>
    A.absent(blockCode, n, n + " does not appear in the block's code"));
A.contains(block, "Cash Position", "the block's comments DO record that the tile was removed and why");

/* the retired actions are inert rather than throwing */
run.log.status.length = 0;
before = timerScheduled;
["warn", "acct", "review", "cycle", "stop"].forEach(a => {
  const keys = Object.keys(ctx.FKP_STATE).map(k => k + "=" + ctx.FKP_STATE[k]).join(",");
  shim.fire(a, { "data-fkp-acct": "ms1188" });
  A.eq(Object.keys(ctx.FKP_STATE).map(k => k + "=" + ctx.FKP_STATE[k]).join(","), keys,
       "the retired action " + a + " changes no state");
});
A.eq(run.log.status.length, 0, "no retired action reports anything through setStatus");
A.eq(timerScheduled, before, "and none of them schedules a timer");

/* the listeners that existed only for the panel are gone */
A.eq((shim.listeners.click || []).length, 1, "exactly one click listener, where rev 2 had one plus four more");
A.eq((shim.listeners.mouseover || []).length, 1, "one mouseover listener: hover opens a tile's About popover, as her winfo does (7 Oct)");
A.eq((shim.listeners.mouseout || []).length, 1, "one mouseout listener: leaving closes it after her 180ms grace");
A.eq((shim.listeners.keydown || []).length, 0, "no keydown listener survives: Escape is the shell's job");
["FKP_HIDE_MS", "addEventListener(\"keydown\"", "window.addEventListener"].forEach(s =>
    A.absent(blockCode, s, "the block's code no longer contains " + JSON.stringify(s)));

/* Escape and an outside click are inert now, rather than closing something */
shim.fireKey("Escape", {});
shim.fireOutside();
A.eq(Object.keys(ctx.FKP_STATE).sort().join(","), "loading,updated",
     "Escape and an outside click leave the band alone");

/* Aditya's exploration scaffolding did not come across with his layout */
["fkpSoloRender", "fkpCRender", "fkpDRender", "fkpVariantSwitch",
  "fkp-solo", "fkp-c-", "fkp-d-", "fkpSoloRow", "fkpCBand", "fkpDBand"].forEach(n => {
    A.absent(raw, n, "his Variant B/C/D scaffolding is not in our build: " + n);
    A.eq(typeof ctx[n], "undefined", n + " is not defined at run time either");
  });

/* ---------- 9. every state sweeps clean ----------------------------- */
let sweep = 0;
[false, true].forEach(loading => {
  ["just now", "4 minutes ago", "an hour ago", '<b>"x"&</b>'].forEach(stamp => {
    ctx.FKP_STATE.loading = loading;
    ctx.FKP_STATE.updated = stamp;
    ctx.fkpRender();
    const band = shim.captured.fkpBand;
    A.noEmDash(band, "loading=" + loading + " stamp=" + stamp);
    A.ok(band.indexOf("–") < 0, "no en dash at loading=" + loading + " stamp=" + stamp);
    A.ok(band.length > 300, "non empty band at loading=" + loading + " stamp=" + stamp);
    A.ok(band.indexOf("undefined") < 0, "no undefined leaked at loading=" + loading + " stamp=" + stamp);
    A.ok(band.indexOf("NaN") < 0, "no NaN at loading=" + loading + " stamp=" + stamp);
    A.eq((band.match(/class="fkp-tile/g) || []).length, 3, "three tiles at loading=" + loading + " stamp=" + stamp);
    sweep++;
  });
});
A.eq(sweep, 8, "swept 8 combinations of loading state and update stamp");

A.noEmDash(block, "the JS block source");
A.noEmDash(ourCss, "the CSS block source");

/* ---------- 10. escaping ------------------------------------------- */
A.eq(ctx.fkpEsc('<b>"x"&</b>'), "&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;", "fkpEsc escapes angle brackets, quotes and ampersands");
ctx.FKP_STATE.loading = false;
ctx.FKP_STATE.updated = '<img src=x onerror=1>';
ctx.fkpRender();
A.absent(shim.captured.fkpBand, "<img src=x", "a hostile update stamp is escaped in both the tooltip and the label");
A.contains(shim.captured.fkpBand, "&lt;img src=x", "and appears escaped instead");
ctx.FKP_STATE.updated = "just now";

process.exit(A.report());
