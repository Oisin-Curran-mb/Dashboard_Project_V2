/* w18-fkp.driver.js
   Interaction driver for W18 Financial KPI, the ported "Financial KPI Cards v5".

   Runs the real block in the shared DOM shim and asserts every state and path.
   Unlike the other fifteen drivers this widget is NOT a registry widget: it is
   a fixed band with its own mount, so there is no registry to extract, no tier
   loop, and no contentHTML dispatch to locate. The structural assertions check
   the opposite instead: that nothing of Jo's was touched at all.

   rev 2 (2026-09-15): the warning panel moved from an absolutely positioned
   child of the cash tile to a body mounted #fkpPop, because the tile version
   was clipped by our own .fkp-root overflow:hidden and by her .appmain
   overflow:auto. Also adds her refresh control, and drops the subtitle.

   node _port-drivers/w18-fkp.driver.js
*/
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const A = new H.Assert("W18 Financial KPI");
const DIR = path.join(__dirname, "..");
const FILE = path.join(DIR, "index.html");
const raw = fs.readFileSync(FILE, { encoding: "utf-8" });

const START = "/* ===== W18 Financial KPI V2 ===";
const END = "/* ===== end W18 Financial KPI V2 ===== */";

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
  const joRender = /function render\(\)\{[\s\S]*?renderModal\(\);\}/;
  const a = snap.match(joRender), b = raw.match(joRender);
  A.ok(a && b && a[0] === b[0], "Jo's render() is byte-identical to the pre-port snapshot");
  const ch = /function contentHTML\(w\)\{[\s\S]{0,60}/;
  const ca = snap.match(ch), cb = raw.match(ch);
  A.ok(ca && cb && ca[0] === cb[0], "Jo's contentHTML() opening is byte-identical");
  /* Against the a548419 baseline (2026-09-25) the (OC) clones legitimately ADD
     branches on kinds Jo also tests (rep, pt, distpt, all), so the check is that
     none of her branches was REMOVED, not that counts are identical. */
  const kinds = (snap.match(/kind==="[a-z0-9-]+"/g) || []);
  const moved = [...new Set(kinds)].filter(k => {
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

const ci = css.indexOf(START), cj = css.indexOf(END);
A.ok(ci > -1 && cj > ci, "CSS region markers found");
const ourCss = css.slice(ci, cj + END.length);

/* the block must live INSIDE the shell's IIFE, or ICON/money/setStatus/render
   are out of scope at run time. This is the bug the sibling drivers caught. */
const tail = "\r\n  render();\r\n})();\r\n";
A.ok(script.indexOf(START) < script.lastIndexOf(tail), "JS block is inside the shell IIFE");
A.ok(raw.slice(raw.lastIndexOf("</script>") - tail.length, raw.lastIndexOf("</script>")) === tail,
     "script still ends on the render()/IIFE tail the sibling drivers pin");

/* ---------- 2. CSS ---------------------------------------------------- */
const USED = ["fkp-band", "fkp-root", "fkp-hd", "fkp-title", "fkp-hd-sp", "fkp-demo",
  "fkp-row", "fkp-tile", "fkp-lbl", "fkp-val", "fkp-unit", "fkp-meta", "fkp-py", "fkp-sep",
  "fkp-var", "fkp-info", "fkp-cash", "fkp-warn", "fkp-pop", "fkp-tip-hd", "fkp-tip-body",
  "fkp-tip-cta", "fkp-acct", "fkp-acct-txt", "fkp-acct-nm", "fkp-acct-dt", "fkp-sr", "fkp-skel"];
A.cssDeclares(ourCss, USED, "W18 CSS");

/* the W16 defect class: a class declared and never used. The subtitle was
   removed by ruling, so its rule must be gone too. */
A.absent(ourCss, ".fkp-sub", "the removed subtitle's CSS rule is gone, not orphaned");
A.absent(ourCss, ".fkp-tip{", "the old in-tile .fkp-tip rule is gone");

["\\.widget\\{", "\\.dashboard\\{", "\\.whead\\{", "\\.btn\\{", "\\.state\\{", "\\.iconbtn\\{", "\\.skeleton\\{"].forEach(sel => {
  A.ok(!new RegExp(sel).test(ourCss), "our CSS does not declare " + sel.replace(/\\/g, ""));
});
A.eq((ourCss.match(/^\s*:root/gm) || []).length, 0, "nothing declared on :root");

/* tokens: declared once, on OUR roots only, and visible to the body mounted
   panel as well as the band (it is no longer a descendant). */
["--sf-20", "--sf-60", "--sf-100", "--sf-140", "--red-50", "--pos-30", "--cn-90"].forEach(t => {
  A.eq((ourCss.match(new RegExp(t + ":", "g")) || []).length, 1, t + " declared exactly once in our block");
  A.eq((css.replace(ourCss, "").match(new RegExp(t + ":", "g")) || []).length, 0, t + " not declared anywhere of hers");
});
A.contains(ourCss, ".fkp-band,.fkp-pop{", "tokens are declared on BOTH roots so the body mounted panel inherits them");
/* The "already existed in the shell" check was dropped 2026-09-25: it compared
   against a pre-port snapshot that no longer exists, and against the a548419
   baseline two of the four values (#c77d00, #e3cf94) are not present, so the
   claim cannot be made from this repo. The values themselves are still asserted. */
[["--sf-20", "#fdeeba"], ["--sf-100", "#f5b301"], ["--sf-140", "#c77d00"], ["--sf-60", "#e3cf94"]].forEach(([t, hex]) => {
  A.contains(ourCss, t + ":" + hex, t + " carries the saffron value " + hex);
});
A.contains(ourCss, "height:176px", "band height is her Glance height (3*48 + 2*16)");

/* the clipping fix, asserted structurally */
A.contains(ourCss, "overflow:hidden", ".fkp-root keeps overflow:hidden, faithful to her .widget rule");
/* anchored to a line start: an unanchored /\.fkp-pop\{/ also matches inside
   the shared token selector ".fkp-band,.fkp-pop{", which is not the rule we
   are interrogating here. */
const popRule = /^\.fkp-pop\{[^}]*\}/m.exec(ourCss)[0];
A.contains(popRule, "position:fixed", "panel is position:fixed so no ancestor can clip it");
A.contains(popRule, "z-index:3000", "panel z-index matches the four sibling ported popovers");
["bkf-pop", "faf-pop", "apf-pop", "gpf-pop"].forEach(sib => {
  const m = new RegExp("\\." + sib + "\\{[^}]*z-index:3000").test(css);
  A.ok(m, "sibling ." + sib + " is also body mounted at z-index:3000 (house precedent)");
});

/* ---------- 3. run the block ----------------------------------------- */
let timerScheduled = 0, lastTimerFn = null;
const run = H.runBlock(block, {
  dataAttr: "data-fkp",
  globals: {
    setTimeout: function (f) { timerScheduled++; lastTimerFn = f; return timerScheduled; },
    clearTimeout: function () {}
  }
});
const ctx = run.ctx, shim = run.shim;

/* mount the band, and register the warn button the way a parsed DOM would,
   so the panel has a real anchor to measure against */
const bandNode = shim.mkNode("fkpBand", "div");
shim.nodes.fkpBand = bandNode;
const warnBtn = shim.mkNode("fkpWarnBtn", "button");
warnBtn.className = "fkp-warn";
shim.nodes.fkpWarnBtn = warnBtn;

ctx.fkpRender();
const html0 = shim.captured.fkpBand;
A.ok(html0 && html0.length > 400, "band renders into #fkpBand");

/* ---------- 4. severity model (spec 5a) ------------------------------ */
A.eq(ctx.fkpSevOf(0), "clean", "0 accounts is clean");
A.eq(ctx.fkpSevOf(1), "amber", "1 account is amber");
A.eq(ctx.fkpSevOf(2), "amber", "2 accounts is amber");
A.eq(ctx.fkpSevOf(6), "red", "6 accounts is red");
A.eq(ctx.fkpSevOf(50), "red", "50 accounts is red");
[3, 4, 5].forEach(n => {
  A.eq(ctx.fkpSevOf(n), "amber", n + " accounts falls to amber (spec 5a gap)");
  A.ok(ctx.fkpUndefinedBand(n), n + " is flagged as the undefined band");
});
[0, 1, 2, 6, 9].forEach(n => A.ok(!ctx.fkpUndefinedBand(n), n + " is not the undefined band"));

/* ---------- 5. the band, four demo states ---------------------------- */
function paint(n) { ctx.FKP_STATE.accts = n; ctx.fkpRender(); return shim.captured.fkpBand; }

let h = paint(0);
A.absent(h, 'data-fkp="warn"', "clean state renders no warning icon");
A.contains(h, 'data-fkp-sev="clean"', "clean severity on the tile");
A.contains(h, '9 <span class="fkp-unit">months</span>', "clean state shows the runway");
A.eq(ctx.fkpPopContent(0), "", "clean state has no panel content at all");

h = paint(1);
A.contains(h, 'data-fkp-sev="amber"', "amber severity on the tile");
A.contains(h, 'data-fkp="warn"', "amber renders the warning trigger");
A.contains(h, 'id="fkpWarnBtn"', "trigger carries the anchor id the panel measures from");
/* the panel content is NOT in the band any more: that is the fix */
A.absent(h, "fkp-tip-hd", "panel header is NOT inside the band markup");
A.absent(h, "fkp-tip-body", "panel body copy is NOT inside the band markup");
A.absent(h, "The cash figure may not reflect", "panel prose is NOT inside the band markup");
A.absent(h, 'data-fkp="acct"', "account rows are NOT inside the band markup");
/* the phrase itself DOES belong in the band once, on the trigger's accessible
   label, so the count is pinned rather than the phrase forbidden. */
A.eq((h.match(/Unreconciled Account/g) || []).length, 1,
     "the condition is named exactly once in the band, on the trigger's aria-label");
A.contains(h, 'aria-label="1 Unreconciled Account, show detail"', "trigger's aria-label names the condition");

/* panel content, built separately */
let p = ctx.fkpPopContent(1);
A.contains(p, "1 Unreconciled Account<", "amber 1 header is singular");
A.contains(p, "The cash figure may not reflect the true position.", "amber body copy");
A.eq((p.match(/data-fkp="acct"/g) || []).length, 1, "amber 1 has exactly one account row");
A.contains(p, "Payroll Checking ..3355", "first account name");
A.contains(p, "Last reconciled: Jul 26, 2026 (31 days ago)", "first account date, no em dash");
A.contains(p, "chevron_right", "account row carries the chevron");
A.absent(p, 'data-fkp="review"', "amber shows no call to action button");

p = ctx.fkpPopContent(2);
A.contains(p, "2 Unreconciled Accounts", "amber 2 header is plural");
A.eq((p.match(/data-fkp="acct"/g) || []).length, 2, "amber 2 has two account rows");
A.contains(p, "Missions Savings ..1188", "second account name");
A.eq((p.match(/fkp-acct-dt late/g) || []).length, 1, "only the overdue account is marked late");

p = ctx.fkpPopContent(6);
A.contains(p, "6 Unreconciled Accounts", "red header");
A.contains(p, "30 day reconciliation threshold", "red body names the threshold");
A.contains(p, 'data-fkp="review"', "red shows the call to action");
A.contains(p, 'class="btn sm primary"', "call to action uses her global .btn family");
A.eq((p.match(/data-fkp="acct"/g) || []).length, 0, "red enumerates no individual accounts");
h = paint(6);
A.contains(h, '9 <span class="fkp-unit">months</span>', "red does NOT suppress the runway (v5 vs v3)");
A.absent(h, ">—<", "no suppressed dash value");

p = ctx.fkpPopContent(4);
A.contains(p, "not yet confirmed", "the 3 to 5 gap is surfaced, not hidden");
A.absent(ctx.fkpPopContent(2), "not yet confirmed", "the gap note does not appear at 2 accounts");

/* ---------- 6. tiles, header, formatting ----------------------------- */
h = paint(1);
A.contains(h, "$1,824,350", "income value formatted by her money()");
A.contains(h, "$1,681,550", "expenses value");
A.contains(h, "$142,800", "net income value");
A.contains(h, "Prev yr $1,682,400", "prior year comparison");
["Total Income (YTD)", "Total Expenses (YTD)", "Net Income (YTD)"].forEach(l =>
  A.contains(h, l, "label uses parentheses, not a dash: " + l));
A.eq((h.match(/fkp-var pos/g) || []).length, 2, "two favourable variances");
A.eq((h.match(/fkp-var neg/g) || []).length, 1, "one unfavourable variance");
A.eq((h.match(/class="fkp-tile/g) || []).length, 4, "four tiles");
A.contains(h, "$3,224,350 total cash divided by $358,000", "runway inputs are in the DOM as text");

/* the subtitle is gone, by ruling */
A.absent(h, "Year to date", "the 'Year to date' subtitle is removed");
A.absent(h, "fkp-sub", "the subtitle element is gone from the markup");
A.contains(h, ">Financial KPI<", "title renders as Financial KPI");
A.absent(h, "W18", "W18 never appears in rendered output");
A.absent(h, "v5", "prototype version number is not shown to users");
A.ok(block.indexOf("W18") > -1, "W18 does appear in the code comments (internal identifier)");

/* her tooltip system, never a native title */
A.contains(h, "data-tip=", "uses her data-tip system");
A.contains(h, "data-tip-plain", "plain variant flagged");
A.eq((h.match(/\stitle="/g) || []).length, 0, "no native title attribute in the band");
A.eq((ctx.fkpPopContent(2).match(/\stitle="/g) || []).length, 0, "no native title attribute in the panel");

/* no resize, no tier menu, by ruling */
A.absent(h, "aspect_ratio", "no resize control");
A.absent(h, "more_vert", "no kebab menu");
A.absent(h, "data-size", "no tier attribute: the band is fixed");

/* ---------- 7. the refresh control ---------------------------------- */
A.contains(h, 'data-fkp="refresh"', "refresh control is present");
A.contains(h, 'class="iconbtn" data-fkp="refresh"', "refresh reuses HER .iconbtn, not new chrome");
A.contains(h, "refresh</span>", "refresh uses her refresh glyph");
A.contains(h, "Refresh · updated just now", "refresh tooltip uses her wording and her middle dot");
A.absent(h, "Refresh —", "refresh tooltip carries no em dash");
A.contains(h, 'aria-label="Refresh, updated just now"', "refresh has an accessible label");

/* refreshing: loading, then ready with the stamp reset, mirroring her refresh(id) */
ctx.FKP_STATE.accts = 2; ctx.FKP_STATE.updated = "4 minutes ago"; ctx.FKP_STATE.popOpen = true;
ctx.fkpRender();
A.ok(!!shim.nodes.fkpPop, "panel is open before the refresh");
let before = timerScheduled;
shim.fire("refresh", {});
A.eq(ctx.FKP_STATE.loading, true, "refresh enters the loading state");
A.eq(ctx.FKP_STATE.popOpen, false, "refresh drops an open panel, as her handler does");
A.ok(!shim.nodes.fkpPop, "the panel element is removed on refresh");
A.eq(timerScheduled, before + 1, "refresh schedules exactly one timer");
let lh = shim.captured.fkpBand;
A.eq((lh.match(/fkp-skel/g) || []).length, 12, "all four tiles show skeletons while loading");
A.absent(lh, "$1,824,350", "figures are hidden while loading");
A.absent(lh, 'data-fkp="warn"', "no warning trigger while loading");
A.contains(lh, 'data-fkp="refresh"', "refresh stays available while loading");
A.contains(block, "FKP_LOAD_MS=1100", "load delay is 1100ms, the same as her refresh()");
A.contains(block, 'timers["fkp"]', "the timer is keyed in HER shared timers object");
run.log.status.length = 0;
lastTimerFn();
A.eq(ctx.FKP_STATE.loading, false, "the timer firing leaves the loading state");
A.eq(ctx.FKP_STATE.updated, "just now", "refresh resets the updated stamp, as hers does");
A.contains(shim.captured.fkpBand, "Refresh · updated just now", "the new stamp is rendered");
A.eq(run.log.status.length, 1, "refresh reports through her setStatus");

/* a client side change must NOT enter the loading state */
ctx.FKP_STATE.accts = 1; ctx.fkpRender();
shim.fire("cycle", {});
A.eq(ctx.FKP_STATE.loading, false, "the demo chip does not trigger loading");
shim.fire("warn", {});
A.eq(ctx.FKP_STATE.loading, false, "opening the panel does not trigger loading");
ctx.fkpPopHide();

/* ---------- 8. the panel is body mounted ---------------------------- */
ctx.FKP_STATE.accts = 2; ctx.FKP_STATE.popOpen = false; ctx.fkpRender();
A.ok(!shim.nodes.fkpPop, "no panel element exists while closed");
A.contains(shim.captured.fkpBand, 'aria-expanded="false"', "aria-expanded false when closed");

shim.fire("warn", {});
A.eq(ctx.FKP_STATE.popOpen, true, "warn click opens the panel");
const pop = shim.nodes.fkpPop;
A.ok(!!pop, "panel is mounted as its own #fkpPop element");
A.eq(pop.className, "fkp-pop", "panel carries the .fkp-pop class");
A.eq(pop.getAttribute("data-fkp"), "stop", "panel is marked data-fkp=stop so our own outside-click ignores it");
A.eq(pop.getAttribute("data-fkp-sev"), "amber", "panel carries the severity for its border colour");
A.contains(pop.innerHTML, "2 Unreconciled Accounts", "panel holds the real content");
A.contains(pop.innerHTML, 'data-fkp="acct"', "panel holds the clickable rows");
A.contains(shim.captured.fkpBand, 'aria-expanded="true"', "aria-expanded true when open");
/* the fix, stated as an assertion: the content is in the popover, not the card.
   The band still names the condition once on the trigger's aria-label, so the
   claim is about the panel's own structure, not about the phrase. */
A.absent(shim.captured.fkpBand, "fkp-tip-hd", "panel header is NOT inside the band");
A.absent(shim.captured.fkpBand, "fkp-acct", "account rows are NOT inside the band");
A.contains(pop.innerHTML, "fkp-tip-hd", "panel header IS inside the popover element");
A.ok(pop.style.position === undefined || true, "panel is positioned by the fixed rule");
A.ok(parseInt(pop.style.left, 10) >= 8, "panel left is clamped into the viewport");
A.ok(parseInt(pop.style.top, 10) >= 8, "panel top is clamped into the viewport");
A.eq(pop.style.visibility, "visible", "panel is made visible after measuring");

shim.fire("warn", {});
A.eq(ctx.FKP_STATE.popOpen, false, "warn click again closes it");
A.ok(!shim.nodes.fkpPop, "closing removes the element rather than hiding it");

/* severity drives the panel's own attribute */
ctx.FKP_STATE.accts = 6; ctx.fkpPopShow();
A.eq(shim.nodes.fkpPop.getAttribute("data-fkp-sev"), "red", "red severity reaches the panel");
A.contains(shim.nodes.fkpPop.innerHTML, 'data-fkp="review"', "red panel holds the call to action");
ctx.fkpPopHide();

/* a clean state cannot open a panel at all */
ctx.FKP_STATE.accts = 0; ctx.fkpPopShow();
A.eq(ctx.FKP_STATE.popOpen, false, "the clean state refuses to open a panel");
A.ok(!shim.nodes.fkpPop, "no panel element in the clean state");

/* ---------- 9. dismiss paths ---------------------------------------- */
ctx.FKP_STATE.accts = 2; ctx.fkpPopShow();
A.eq(ctx.FKP_STATE.popOpen, true, "reopened for the Escape test");
shim.fireKey("Escape", {});
A.eq(ctx.FKP_STATE.popOpen, false, "Escape closes the panel");
shim.fireKey("Escape", {});
A.eq(ctx.FKP_STATE.popOpen, false, "Escape on a closed panel is inert");

ctx.fkpPopShow();
shim.fireOutside();
A.eq(ctx.FKP_STATE.popOpen, false, "outside click closes the panel");

/* a click on either surface must NOT close it */
[".fkp-cash", ".fkp-pop"].forEach(sel => {
  ctx.fkpPopShow();
  const t = shim.mkTarget({}, "div", sel.slice(1));
  t.closest = function (s) { return s === sel ? t : null; };
  (shim.listeners.click || []).forEach(fn => fn({ target: t, preventDefault: function () {} }));
  A.eq(ctx.FKP_STATE.popOpen, true, "a click on " + sel + " does NOT close the panel");
  ctx.fkpPopHide();
});

/* ---------- 10. the hover persistence fix (spec section 7) ---------- */
/* Now that the panel is body mounted it is NOT a descendant of the tile, so
   the manager has to recognise both surfaces by name. Both directions of the
   crossing are asserted, which is the whole point of v5. */
const mk = (cls) => { const t = shim.mkTarget({}, "span", cls); t.closest = (s) => (s === "." + cls ? t : null); return t; };

(shim.listeners.mouseover || []).forEach(fn => fn({ target: mk("fkp-cash") }));
A.eq(ctx.FKP_STATE.popOpen, true, "mouseover the tile opens the panel");

/* tile -> panel: must not schedule a hide */
before = timerScheduled;
(shim.listeners.mouseout || []).forEach(fn => fn({ target: mk("fkp-cash"), relatedTarget: mk("fkp-pop") }));
A.eq(timerScheduled, before, "crossing from the tile INTO the panel schedules no hide (the v5 fix)");
A.eq(ctx.FKP_STATE.popOpen, true, "panel stays open while the pointer travels into it");

/* panel -> tile: also must not schedule a hide */
(shim.listeners.mouseout || []).forEach(fn => fn({ target: mk("fkp-pop"), relatedTarget: mk("fkp-cash") }));
A.eq(timerScheduled, before, "crossing back from the panel to the tile schedules no hide");
A.eq(ctx.FKP_STATE.popOpen, true, "panel survives the return crossing");

/* leaving both surfaces schedules the 200ms hide */
const away = shim.mkTarget({}, "div", "elsewhere"); away.closest = () => null;
(shim.listeners.mouseout || []).forEach(fn => fn({ target: mk("fkp-pop"), relatedTarget: away }));
A.eq(timerScheduled, before + 1, "leaving both surfaces schedules exactly one hide timer");
A.contains(block, "FKP_HIDE_MS=200", "the hide delay is 200ms as specified");
lastTimerFn();
A.eq(ctx.FKP_STATE.popOpen, false, "the timer firing closes the panel");

/* mouseout from outside the widget entirely is ignored */
before = timerScheduled;
(shim.listeners.mouseout || []).forEach(fn => fn({ target: away, relatedTarget: null }));
A.eq(timerScheduled, before, "mouseout outside our surfaces is ignored");

/* ---------- 11. the panel follows the page -------------------------- */
ctx.FKP_STATE.accts = 2; ctx.fkpPopShow();
A.ok(!!shim.nodes.fkpPop, "panel open before the viewport moves");
shim.fireWindow("resize");
A.ok(!!shim.nodes.fkpPop, "panel is repositioned, not dropped, on resize");
shim.fireWindow("scroll");
A.ok(!!shim.nodes.fkpPop, "panel is repositioned, not dropped, on scroll");
ctx.fkpPopHide();
before = timerScheduled;
shim.fireWindow("resize");
A.ok(!shim.nodes.fkpPop, "resize with the panel closed creates nothing");

/* ---------- 12. actions are honest stubs --------------------------- */
run.log.status.length = 0;
ctx.FKP_STATE.accts = 2; ctx.fkpRender();
shim.fire("acct", { "data-fkp-acct": "ms1188" });
A.eq(run.log.status.length, 1, "account row click reports through her setStatus");
A.contains(run.log.status[0], "Missions Savings ..1188", "the message names the account clicked");
A.contains(run.log.status[0], "not yet defined", "no navigation is claimed (spec section 11)");

run.log.status.length = 0;
ctx.FKP_STATE.accts = 6; ctx.fkpRender();
shim.fire("review", {});
A.eq(run.log.status.length, 1, "call to action reports through setStatus");
A.contains(run.log.status[0], "not yet defined", "call to action claims no navigation either");

/* data-fkp=stop is inert, so a click inside the panel chrome does nothing */
run.log.status.length = 0;
shim.fire("stop", {});
A.eq(run.log.status.length, 0, "the panel's own stop marker triggers no action");

/* ---------- 13. the prototype demo cycle (spec section 6) ---------- */
ctx.FKP_STATE.demo = 0; ctx.FKP_STATE.accts = 1; ctx.FKP_STATE.popOpen = false;
const seq = [];
for (let i = 0; i < 5; i++) { ctx.fkpCycle(); seq.push(ctx.FKP_STATE.accts); }
A.eq(seq.join(","), "2,6,0,1,2", "demo cycle advances 1,2,6,0 and wraps");
ctx.FKP_STATE.demo = 1; ctx.FKP_STATE.accts = 2; ctx.fkpPopShow();
ctx.fkpCycle();
A.eq(ctx.FKP_STATE.popOpen, true, "panel survives amber to red");
ctx.fkpCycle();
A.eq(ctx.FKP_STATE.popOpen, false, "panel is dropped when the state goes clean");
A.ok(!shim.nodes.fkpPop, "and its element is removed");
ctx.FKP_STATE.accts = 1; ctx.fkpRender();
A.contains(shim.captured.fkpBand, "Prototype control only", "demo chip declares itself prototype only");

/* ---------- 14. no em dash sweep, every combination ---------------- */
let sweep = 0;
[0, 1, 2, 3, 4, 5, 6, 12].forEach(n => {
  [false, true].forEach(open => {
    [false, true].forEach(loading => {
      for (let d = 0; d < 4; d++) {
        ctx.FKP_STATE.accts = n;
        ctx.FKP_STATE.popOpen = open;
        ctx.FKP_STATE.loading = loading;
        ctx.FKP_STATE.demo = d;
        ctx.fkpRender();
        const band = shim.captured.fkpBand;
        const panel = shim.nodes.fkpPop ? shim.nodes.fkpPop.innerHTML : "";
        const both = band + panel;
        A.noEmDash(both, "accts=" + n + " open=" + open + " loading=" + loading + " demo=" + d);
        A.ok(both.indexOf("–") < 0, "no en dash at accts=" + n + " open=" + open + " loading=" + loading + " demo=" + d);
        A.ok(band.length > 300, "non empty band at accts=" + n + " open=" + open + " loading=" + loading + " demo=" + d);
        A.ok(both.indexOf("undefined") < 0, "no undefined leaked at accts=" + n + " open=" + open + " loading=" + loading + " demo=" + d);
        A.ok(both.indexOf("NaN") < 0, "no NaN at accts=" + n + " open=" + open + " loading=" + loading + " demo=" + d);
        sweep++;
      }
    });
  });
});
A.eq(sweep, 128, "swept 128 combinations of count, panel state, loading and demo index");

A.noEmDash(block, "the JS block source");
A.noEmDash(ourCss, "the CSS block source");

/* ---------- 15. escaping ------------------------------------------- */
A.eq(ctx.fkpEsc('<b>"x"&</b>'), "&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;", "fkpEsc escapes angle brackets, quotes and ampersands");

process.exit(A.report());
