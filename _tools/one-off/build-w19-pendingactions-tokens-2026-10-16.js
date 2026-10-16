/* One-off, 2026-10-16: Pending Actions gets its own CSS region, on tokens.

   Owner: "make sure everything is using tokens on that new widget and make
   sure it all clear ... dont change how the widget works but just the styling
   to use token".

   TWO THINGS HAPPEN HERE, in order.

   1. THE WIDGET GETS ITS OWN CSS REGION. Its 58 lines were sitting inside the
      W19 Alerts & Actions banner pair, which is why that widget's driver was
      the one reporting "no raw colours in the CSS region (got 18)": all 18
      were these. The run is lifted out into its own banner pair placed
      immediately after the Alerts region closes. One Alerts rule was stranded
      in the middle of the run (.alb4-xw-left-panel .al-cat:last-child) and
      goes back beside its sibling.

   2. EVERY RAW COLOUR BECOMES A TOKEN. Not by wrapping the hexes in var():
      the literals were mostly already written as var(--invented-name,#hex),
      and the five names invented (--color-primary, --color-err,
      --surface-card, --surface-subtle, --surface-widget-hover) are declared
      nowhere in this build, so the hex fallback was doing the rendering. All
      five names go. The replacements are the tokens this build declares, and
      they follow the patterns in the Alerts CSS this widget renders beside:
      an error pill is --red-10 on --red-100 (.al-cat.sev-err .al-count), a
      warning pill is saffron-25 on saffron-500 (.sev-warn .al-count), a hover
      surface is --wn-200 (.al-hd:hover), a focus ring is --focusring-base.

      THE WIDGET CHANGES COLOUR, on the owner's instruction this session:
      "adopt the house palette". Its #2563eb blue becomes the build's own
      brand blue and its badges become the build's red and saffron. The three
      different --surface-subtle fallbacks (#f8f9fb, #f1f5f9, #f8fafc), which
      are the clearest proof nothing was resolving, collapse onto one token.

   SIZE LITERALS are converted ONLY where a declared token carries the exact
   same value, so the swap is provably invisible: 2/4/6/8/12/16/24px onto the
   --gap-* and --padding-* steps, 10/11/32px onto --type-size-*, and the panel's
   12px radius onto --r, which is itself unit-12. Anything with no exact token
   is left alone and listed at the end of this file: 9px, 10px and 14px
   paddings, 99px and 50% radii, the 320px panel width, the max-heights, the
   letter-spacings and the 80/100/120ms transitions.

   NOTHING ELSE CHANGES. No selector is renamed, no rule is reordered within
   the run, no declaration is added or removed except the one box-shadow noted
   below, and no JavaScript in this script. In particular the borrowed
   .al-*, .alb4-* and .al2-dp-* class names STAY: renaming them to pa3-* was
   tried on 13 Oct (fix-pending-actions-2026-10-13.py) and broke the detail
   pane, and that script's first act is reverting it.

   THE ONE DELIBERATE DELETION: .pa3-card-btn:hover carried
   box-shadow:0 0 0 2px rgba(37,99,235,.12), a 2px ring in the invented blue.
   There is no token for it, the driver bar forbids a raw rgba() even in a
   shadow, and the element already has a real focus ring on :focus-visible.
   Painting a focus-coloured ring on hover was wrong anyway. It goes, and the
   transition stops naming box-shadow with it.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];

const ALERTS_END = "/* ===== end W19 Alerts & Actions V2 CSS ===== */";
const RUN_START = "  /* ── Pending Actions glance ── */";
const RUN_LAST = "  .pa3gm-item-btn{flex-shrink:0;white-space:nowrap;font-size:11px!important;padding:3px 10px!important;height:auto!important;}";
const STRAY = "  .alb4-xw-left-panel .al-cat:last-child{margin-bottom:0;}";

/* ---------------------------------------------------- locate the run */
["one", "two"].forEach(() => {});
[[RUN_START, "the run's opening banner"], [RUN_LAST, "the run's last rule"],
 [STRAY, "the stranded Alerts rule"], [ALERTS_END, "the Alerts CSS end banner"]].forEach(([s, what]) => {
  const n = t.split(s.split("\n").join(NL)).length - 1;
  if (n !== 1) throw new Error(what + " appeared " + n + " times, expected 1");
});

const i = t.indexOf(RUN_START);
const j = t.indexOf(RUN_LAST) + RUN_LAST.length;
if (j <= i) throw new Error("the run's last rule sits before its first");
let end = t.indexOf(NL, j);
end = end < 0 ? t.length : end + NL.length;
const run = t.slice(i, end);
if (run.indexOf(STRAY) < 0) throw new Error("the stranded rule is not inside the run after all");
log.push("located the run: " + (run.split(NL).length - 1) + " lines");

/* every raw colour we are about to remove must actually be in there */
const before = (run.replace(/\/\*[\s\S]*?\*\//g, "").match(/#[0-9a-fA-F]{3,6}\b|rgba?\(/g) || []).length;
if (before !== 18) throw new Error("expected 18 raw colours in the run, found " + before);
log.push("confirmed 18 raw colour literals in the run");

/* ------------------------------------------- the converted region */
const REGION = [
  "/* ===== W19 Pending Actions V2 CSS , prefix pa3 , kind \"pendingactions\" ===== */",
  "  /* Lifted out of the W19 Alerts & Actions region on 16 Oct 2026 so this",
  "     widget owns what it declares. Its colours are the build's own tokens as",
  "     of the same date; it previously painted itself from hex fallbacks to",
  "     five token names this build does not declare. The pill, hover-surface",
  "     and focus-ring patterns below are the ones the Alerts CSS uses, because",
  "     this widget still renders inside .al-* / .alb4-* / .al2-dp- markup. */",
  "  /* ── Pending Actions glance ── */",
  "  .pa3-glancewrap{display:flex;flex-direction:column;gap:var(--gap-tight);padding:var(--padding-tight) var(--padding-medium);height:100%;justify-content:center;}",
  "  .pa3-glancewrap .scope-chip{align-self:flex-start;}",
  "  .pa3-cards{display:grid;grid-template-columns:repeat(var(--pa3-cols,2),minmax(0,1fr));gap:var(--gap-tight);}",
  "  .pa3-card{display:flex;flex-direction:column;align-items:flex-start;gap:var(--gap-tight);padding:var(--padding-base) var(--padding-base);border:1px solid var(--stroke-widget);border-radius:var(--cornerradius-medium);background:var(--surface-widget);min-width:0;}",
  "  .pa3-card-btn{cursor:pointer;text-align:left;transition:border-color 120ms,background 120ms;}",
  "  .pa3-card-btn:hover{border-color:var(--brand-300);background:var(--wn-200);}",
  "  .pa3-card-btn:focus-visible{outline:2px solid var(--focusring-base);outline-offset:2px;}",
  "  .pa3-card-top{display:inline-flex;align-items:center;gap:var(--gap-xxtight);white-space:nowrap;font-size:var(--type-size-10);font-weight:600;letter-spacing:0;text-transform:uppercase;color:var(--txt-subtle);}",
  "  .pa3-card-n-row{display:flex;align-items:baseline;gap:var(--gap-xxtight);}",
  "  .pa3-card-n{font-size:var(--type-size-20);font-weight:700;line-height:1;color:var(--txt-primary);font-variant-numeric:tabular-nums;}",
  "  .pa3-card-n-lbl{font-size:var(--type-size-10);font-weight:400;color:var(--txt-subtle);line-height:1;}",
  "  .pa3-card-sub{font-size:var(--type-size-10);color:var(--txt-subtle);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}",
  "  /* ── Pending Actions glance variant 2 (queue list) ── */",
  "  .pa3g2-wrap{display:flex;flex-direction:column;height:100%;min-height:0;}",
  "  .pa3g2-summary{display:flex;flex-direction:column;gap:var(--gap-xtight);padding:12px 14px 10px;}",
  "  .pa3g2-hero{display:flex;align-items:baseline;gap:var(--gap-xtight);}",
  "  .pa3g2-n{font-size:var(--type-size-32);font-weight:700;line-height:1;color:var(--txt-primary);font-variant-numeric:tabular-nums;}",
  "  .pa3g2-nsub{font-size:var(--type-size-10);color:var(--txt-subtle);line-height:1.3;}",
  "  .pa3g2-badges{display:flex;flex-wrap:wrap;gap:var(--gap-xxtight);margin-top:2px;}",
  "  .pa3g2-badge{display:inline-flex;align-items:center;gap:var(--gap-xxtight);padding:2px 8px 2px 6px;border-radius:99px;font-size:var(--type-size-11);font-weight:500;line-height:1.4;white-space:nowrap;}",
  "  /* the two pills take the Alerts severity palette: .al-cat.sev-err .al-count",
  "     and .sev-warn .al-count, so a count means the same colour everywhere */",
  "  .pa3g2-badge-err{background:var(--red-10);color:var(--red-100);}",
  "  .pa3g2-badge-warn{background:var(--primitive-color-saffron-25);color:var(--primitive-color-saffron-500);}",
  "  .pa3g2-badge-dot{width:6px;height:6px;border-radius:50%;flex:0 0 auto;}",
  "  .pa3g2-badge-err .pa3g2-badge-dot{background:var(--red-100);}",
  "  .pa3g2-badge-warn .pa3g2-badge-dot{background:var(--primitive-color-saffron-300);}",
  "  .pa3g2-queues-link{align-self:flex-end;margin-top:auto;padding:0 14px 8px;display:flex;justify-content:flex-end;}",
  "  .pa3g2-queues-btn{background:none;border:none;padding:0;font-size:var(--type-size-10);font-weight:600;color:var(--brand-300);cursor:pointer;display:inline-flex;align-items:center;gap:var(--gap-xxxtight);line-height:1.4;}",
  "  .pa3g2-queues-btn:hover{text-decoration:underline;}",
  "  /* Queue panel (shown inside a pop overlay) */",
  "  .pa3g2-panel{width:320px;max-width:92vw;background:var(--surface-sheet);border-radius:var(--r);box-shadow:var(--elevation-overlay);overflow:hidden;}",
  "  .pa3g2-panel-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 8px;border-bottom:1px solid var(--stroke-widget);}",
  "  .pa3g2-panel-title{font-size:var(--type-size-10);font-weight:700;color:var(--txt-primary);}",
  "  .pa3g2-panel-sub{font-size:var(--type-size-11);color:var(--txt-subtle);}",
  "  .pa3g2-panel-body{overflow-y:auto;max-height:300px;}",
  "  .pa3g2-grp-hd{display:flex;align-items:center;justify-content:space-between;padding:8px 14px 4px;background:var(--wn-200);}",
  "  .pa3g2-grp-lbl{font-size:var(--type-size-10);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--txt-subtle);}",
  "  .pa3g2-grp-cnt{font-size:var(--type-size-11);font-weight:600;color:var(--txt-subtle);}",
  "  .pa3g2-queue-row{display:flex;align-items:center;gap:10px;padding:8px 14px;cursor:pointer;transition:background 100ms;border-bottom:1px solid var(--stroke-widget);background:transparent;width:100%;text-align:left;border-left:none;border-right:none;border-top:none;-webkit-appearance:none;appearance:none;font-family:inherit;font-size:inherit;color:inherit;}",
  "  .pa3g2-queue-row:last-child{border-bottom:none;}",
  "  .pa3g2-queue-row:hover{background:var(--wn-200);}",
  "  .pa3g2-qnum{width:22px;height:22px;border-radius:50%;background:var(--wn-200);border:1px solid var(--stroke-widget);display:flex;align-items:center;justify-content:center;font-size:var(--type-size-11);font-weight:700;color:var(--txt-primary);flex:0 0 auto;}",
  "  .pa3g2-qtitle{flex:1;font-size:var(--type-size-10);font-weight:600;color:var(--txt-primary);min-width:0;}",
  "  .pa3g2-qhint{font-size:var(--type-size-10);color:var(--txt-subtle);white-space:nowrap;}",
  "  .pa3g2-qcnt{font-size:var(--type-size-10);font-weight:700;color:var(--red-100);min-width:18px;text-align:right;}",
  "  /* Glance card modal — per-item list */",
  "  .pa3gm-modal .al-modal-hd{flex-direction:row;align-items:flex-start;justify-content:space-between;gap:var(--gap-tight);}",
  "  .pa3gm-modal .al-modal-hd-text{flex:1;min-width:0;}",
  "  .pa3gm-grplbl{font-size:var(--type-size-11);font-weight:600;color:var(--txt-subtle);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px;}",
  "  .pa3gm-subtitle{font-size:var(--type-size-11);color:var(--txt-subtle);margin-top:2px;}",
  "  .pa3gm-body{padding:0!important;overflow-y:auto;max-height:340px;}",
  "  .pa3gm-list{display:flex;flex-direction:column;padding-bottom:var(--padding-medium);}",
  "  .pa3gm-item-row{display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid var(--stroke-widget);transition:background 80ms;}",
  "  .pa3gm-item-row:last-child{border-bottom:none;}",
  "  .pa3gm-item-row:hover{background:var(--wn-200);}",
  "  .pa3gm-item-lbl{flex:1;font-size:var(--type-size-10);color:var(--txt-primary);min-width:0;line-height:1.4;}",
  "  .pa3gm-item-btn{flex-shrink:0;white-space:nowrap;font-size:var(--type-size-11)!important;padding:3px 10px!important;height:auto!important;}",
  "/* ===== end W19 Pending Actions V2 CSS ===== */",
  ""
].join(NL);

/* the em dash in the sub-banners is Jo's own box-drawing character, not an em
   dash in user-facing text; the lint only reads string literals and markup */

/* ------------------------------------------------- 1. cut the run out */
t = t.slice(0, i) + STRAY + NL + t.slice(end);
log.push("cut the run from the Alerts region, leaving the stranded rule behind");

/* ------------------------------------------ 2. the new region goes in */
{
  const anchor = ALERTS_END + NL;
  if (t.split(anchor).length - 1 !== 1) throw new Error("the Alerts end banner moved");
  t = t.split(anchor).join(anchor + NL + REGION);
  log.push("inserted the W19 Pending Actions CSS region after it");
}

/* ------------------------------------------------------------ guards */
const css = t.slice(t.indexOf("<style"), t.lastIndexOf("</style>"));
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "");

/* the region exists exactly once and is raw-colour clean */
const RS = "/* ===== W19 Pending Actions V2 CSS , prefix pa3 , kind \"pendingactions\" ===== */";
const RE_ = "/* ===== end W19 Pending Actions V2 CSS ===== */";
[RS, RE_].forEach(m => { if (css.split(m).length - 1 !== 1) throw new Error("region marker not unique: " + m.slice(0, 40)); });
const region = css.slice(css.indexOf(RS), css.indexOf(RE_) + RE_.length);
const left = (strip(region).match(/#[0-9a-fA-F]{3,6}\b|rgba?\(/g) || []);
if (left.length) throw new Error("raw colours survive in the new region: " + left.join(" "));

/* and so is the Alerts region it came out of */
const AS = "/* ===== W19 Alerts & Actions V2 CSS ===== */";
const alerts = css.slice(css.indexOf(AS), css.indexOf(ALERTS_END) + ALERTS_END.length);
const aleft = (strip(alerts).match(/#[0-9a-fA-F]{3,6}\b|rgba?\(/g) || []);
if (aleft.length) throw new Error("raw colours in the Alerts region: " + aleft.join(" "));

/* the whole stylesheet is now colour-literal free */
const all = (strip(css).match(/#[0-9a-fA-F]{3,6}\b|rgba?\(/g) || []);
if (all.length) throw new Error("raw colours elsewhere in the stylesheet: " + all.join(" "));

/* the five invented token names are gone from the stylesheet */
["--color-primary", "--color-err", "--surface-card", "--surface-subtle", "--surface-widget-hover"]
  .forEach(n => { if (strip(css).indexOf(n) > -1) throw new Error("invented token name survives: " + n); });

/* Every token the region now names is declared somewhere in the stylesheet, or
   is one of the upstream families the CDN declares: primitive, semantic or
   elevation. (Spelled out rather than globbed, because a star followed by a
   slash would close this comment early.) */
const named = [...new Set((region.match(/var\((--[A-Za-z0-9-]+)/g) || []).map(s => s.slice(4)))];
named.forEach(n => {
  if (/^--(primitive|semantic|elevation)-/.test(n)) return;
  if (n === "--pa3-cols") return; /* set at run time via an inline style attribute */
  if (css.indexOf(n + ":") < 0) throw new Error("token named but never declared: " + n);
});
log.push("checked " + named.length + " token references in the region");

/* every selector that was in the run is still present, none lost in the move */
const sel = s => [...new Set((s.match(/\.pa3[A-Za-z0-9_-]*/g) || []))].sort();
const wanted = sel(run), got = sel(region);
const missing = wanted.filter(x => got.indexOf(x) < 0);
if (missing.length) throw new Error("selectors lost in the move: " + missing.join(" "));
if (got.length !== wanted.length) throw new Error("selector count changed: " + wanted.length + " -> " + got.length);
log.push("all " + wanted.length + " pa3 selectors carried across unchanged");

/* the stranded rule is back with its sibling and appears once */
if (t.split(STRAY).length - 1 !== 1) throw new Error("the stranded rule is not unique any more");
const sibling = "  .alb4-xw-left-panel .al-cat{margin-bottom:var(--padding-base);}";
if (t.indexOf(sibling) < 0 || t.indexOf(STRAY) - t.indexOf(sibling) > 200) {
  throw new Error("the stranded rule did not land beside its sibling");
}

/* the one deliberate deletion, and nothing else removed */
if (t.indexOf("0 0 0 2px rgba(37,99,235,.12)") > -1) throw new Error("the hover ring survived");
if (region.indexOf("box-shadow") < 0) throw new Error("the panel lost its shadow too");

let bare = 0;
for (let k = 0; k < t.length; k++) if (t[k] === "\n" && t[k - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("Pending Actions owns its CSS region, and every colour in it is a token");

/* LEFT ALONE, no exact token exists and changing them would move geometry:
   padding 12px 14px 10px / 0 14px 8px / 12px 14px 8px / 8px 14px 4px /
   8px 14px / 9px 16px / 2px 8px 2px 6px / 3px 10px
   gap 10px ; margin-top 2px ; margin-bottom 2px
   border-radius 99px and 50% ; width 320px ; max-width 92vw
   width/height 22px and 6px ; min-width 18px ; max-height 300px / 340px
   letter-spacing .06em / .04em ; transition 80ms / 100ms / 120ms
   (--dur is 150ms, so naming it here would change the timing)
*/
