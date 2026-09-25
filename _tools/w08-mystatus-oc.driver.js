/* =====================================================================
   w08-mystatus-oc.driver.js , W08 My Status, the (OC) DUPLICATE.

   Her W08 is the finished reference build. This driver's first job is not to
   check our clone works, it is to prove HER widget was not touched, because
   the manifest and the port skill both record W08 as never-ported. The owner
   directed the duplicate on 2026-09-17 so small improvements can be trialled
   against hers; until those land, ours must be a byte-for-byte behavioural
   clone, so PARITY is asserted as strictly as isolation.

   node _port-drivers/w08-mystatus-oc.driver.js
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const A = new H.Assert("W08 My Status (OC duplicate)");
const DIR = path.join(__dirname, "..");
const shell = H.loadShell();
const S = shell.script;
const CSS = shell.css;
const raw = fs.readFileSync(path.join(DIR, "index.html"), { encoding: "utf-8" });

/* the snapshot taken immediately before the clone */
const snaps = H.baselineFiles();
A.ok(snaps.length > 0, "the a548419 baseline is on disk (_tools/baselines) to compare against");
const snap = snaps.length ? fs.readFileSync(snaps[snaps.length - 1], { encoding: "utf-8" }) : "";

/* ---------- 1. HER CODE IS UNTOUCHED ---------------------------------- */
const HER_FNS = ["mysFind", "mysConfigBtn", "mysActive", "mysClearList", "mysHeaderBlock",
  "mysRowHTML", "mysContent", "mysConfigModalHTML", "mysDetailModalHTML", "mysPopContent"];

HER_FNS.forEach(fn => {
  const re = new RegExp("function\\s+" + fn + "\\s*\\(", "g");
  A.eq((raw.match(re) || []).length, 1, "her " + fn + " is still defined exactly once");
  /* the definition line, byte for byte */
  const i = raw.indexOf("function " + fn + "(");
  const j = raw.indexOf("\r\n", i);
  const k = snap.indexOf("function " + fn + "(");
  const l = snap.indexOf("\r\n", k);
  A.eq(raw.slice(i, j), snap.slice(k, l), "her " + fn + " opening line is byte-identical");
});

["MYS_AREA", "MYS_QUERIES", "MYS_DEFAULT"].forEach(c => {
  A.eq((raw.match(new RegExp("var\\s+" + c + "\\s*=", "g")) || []).length, 1, "her " + c + " is declared exactly once");
});

/* her whole data block and her whole render block, md5-identical */
function span(text, a, b) { const i = text.indexOf(a); const j = text.indexOf(b, i); return text.slice(i, j); }
const herData_now = span(raw, "/* === MY STATUS (mys) data === */", "function mysFind(id){");
const herData_was = span(snap, "/* === MY STATUS (mys) data === */", "function mysFind(id){");
A.eq(herData_now, herData_was, "her MYS_ data block is byte-identical (" + herData_now.length + " bytes)");

const herRender_now = span(raw, "/* === MY STATUS (mys) render === */", "/* ===== Bank Balances (prefix: bank), RENDER ===== */");
const herRender_was = span(snap, "/* === MY STATUS (mys) render === */", "/* ===== Bank Balances (prefix: bank), RENDER ===== */");
A.eq(herRender_now, herRender_was, "her whole render block is byte-identical (" + herRender_now.length + " bytes)");

/* her CSS cluster */
const herCss_now = span(raw, "/* ===== My Status (mys) ===== */", "/* ===== Bank Balances (prefix: bank): CSS ===== */");
const herCss_was = span(snap, "/* ===== My Status (mys) ===== */", "/* ===== Bank Balances (prefix: bank): CSS ===== */");
A.eq(herCss_now, herCss_was, "her .mys-* CSS cluster is byte-identical (" + herCss_now.length + " bytes)");
A.ok((herCss_now.match(/\{/g) || []).length >= 55, "and still holds all her rules (" + (herCss_now.match(/\{/g) || []).length + ")");

/* her two registry rows, and her dashboards */
const herRows = raw.match(/\{[^{}]*kind:"mystatus"[^{}]*\}/g) || [];
A.eq(herRows.length, 2, "her two kind:\"mystatus\" registry rows are still there");
herRows.forEach((r, i) => A.ok(snap.indexOf(r) > -1, "her registry row " + (i + 1) + " is byte-identical"));
A.absent(raw.replace(/kind:"mystatus-oc"/g, ""), 'kind:"mystatus"' + "x", "sanity: the -oc kind is distinct from hers");

/* her eleven click branches, verbatim */
const HER_ACTIONS = ["mys-config", "mys-add", "mys-remove", "mys-config-done", "mys-config-cancel",
  "mys-row", "mys-detail-close", "mys-detail-export", "mys-mode", "mys-opts", "mys-hidezero"];
HER_ACTIONS.forEach(a => {
  A.eq((raw.match(new RegExp('if\\(a==="' + a + '"\\)', "g")) || []).length, 1, "her branch for " + a + " is present exactly once");
  A.eq((raw.match(new RegExp('data-action="' + a + '"', "g")) || []).length,
       (snap.match(new RegExp('data-action="' + a + '"', "g")) || []).length,
       "her emitted count for data-action=\"" + a + "\" is unmoved");
});

/* her own dispatch lines */
A.eq((raw.match(/if\(w\.kind==="mystatus"\)return mysContent\(w\);/g) || []).length, 1, "her contentHTML dispatch is intact");
A.eq((raw.match(/if\(pop\.type==="mys-opts"\)return mysPopContent\(\);/g) || []).length, 1, "her popContent dispatch is intact");
A.eq((raw.match(/if\(modal\.type==="mysconfig"\)/g) || []).length, 1, "her mysconfig modal dispatch is intact");
A.eq((raw.match(/if\(modal\.type==="mysdetail"\)/g) || []).length, 1, "her mysdetail modal dispatch is intact");

/* ---------- 2. NOTHING IS SHARED -------------------------------------- */
/* every one of these was ZERO occurrences before the clone */
["mysO", "MYSO_", "myso-", "mystatus-oc", "mysOconfig", "mysOdetail", "mysOConfigQ"].forEach(t => {
  A.eq((snap.match(new RegExp(t.replace(/[-]/g, "\\-"), "g")) || []).length, 0, t + " did not exist before the clone");
  A.ok((raw.match(new RegExp(t.replace(/[-]/g, "\\-"), "g")) || []).length > 0, t + " is ours now");
});

/* the hyphen is what keeps the two action namespaces apart */
A.eq("myso-config".indexOf("mys-"), -1, "her \"mys-\" prefix cannot prefix-match our \"myso-\" one");
HER_ACTIONS.forEach(a => A.absent(a.replace("mys-", "myso-"), a, "our " + a.replace("mys-", "myso-") + " does not contain her " + a));

/* our three regions must contain none of her identifiers */
const ourData = span(raw, "/* === W08 My Status V2 data === */", "/* ===== P2/P3 WIDGET BLOCKS");
const ourJs = span(raw, '/* ===== W08 My Status V2 JS, kind:"mystatus-oc" ===', "/* ===== end W08 My Status V2 ===== */");
const ourCss = span(raw, "/* ===== W08 My Status V2 CSS =====", "/* ===== W18 Financial KPI V2 ===");
[["data", ourData], ["js", ourJs], ["css", ourCss]].forEach(([nm, seg]) => {
  A.ok(seg.length > 200, "our " + nm + " region was located (" + seg.length + " bytes)");
  A.eq((seg.match(/\bmys[A-NP-Z_][A-Za-z_]*/g) || []).length, 0, "our " + nm + " region holds none of her mys<Capital> names");
  A.eq((seg.match(/\bMYS_/g) || []).length, 0, "our " + nm + " region holds none of her MYS_ constants");
  A.eq((seg.match(/\.mys-(?!o)/g) || []).length, 0, "our " + nm + " region declares none of her .mys- selectors");
  A.eq((seg.match(/"mys-(?!o)/g) || []).length, 0, "our " + nm + " region emits none of her mys- action values");
  A.noEmDash(seg, "our " + nm + " region");
});
/* and our CSS declares nothing of hers as a rule subject */
A.eq((ourCss.match(/^\s*\.mys-(?!o)/gm) || []).length, 0, "our CSS block declares zero .mys- rules");
A.ok((ourCss.match(/\.myso-/g) || []).length >= 60, "our CSS is all .myso- scoped (" + (ourCss.match(/\.myso-/g) || []).length + " references)");

/* ---------- 3. our nine added lines, one each ------------------------- */
[['if(w.kind==="mystatus-oc")return mysOContent(w);', "contentHTML dispatch"],
 ['if(a&&a.indexOf("myso-")===0&&mysOHandleClick(a,id,t))return;', "click delegation, the insHandleClick idiom"],
 ["if(mysOHandleInput(e))return;", "input delegation, the gftHandleInput idiom"],
 ['if(pop.type==="myso-opts")return mysOPopContent();', "popContent dispatch"],
 ['if(pop.type==="myso-opts")return \'[data-action="myso-opts"][data-id="\'+pop.id+\'"]\';', "triggerSelector branch"],
 ['if(modal.type==="mysOconfig")', "mysOconfig modal dispatch"],
 ['if(modal.type==="mysOdetail")', "mysOdetail modal dispatch"]
].forEach(([line, what]) => {
  A.eq((raw.split(line).length - 1), 1, "exactly one " + what);
});

/* our controls carry data-action, NOT a private attribute. This is load
   bearing: her click listener nulls any open pop when a click misses
   [data-action], so a private attribute would have let her listener close our
   popover before ours could toggle it, and it could never have shut. */
A.eq((raw.match(/data-myso/g) || []).length, 0, "we use no private click attribute");
A.ok((ourJs.match(/data-action="myso-/g) || []).length >= 10, "our controls carry data-action with myso- values");

/* ---------- 4. run it ------------------------------------------------- */
const TAIL = "\r\n  render();\r\n})();\r\n";
A.eq(S.slice(-TAIL.length), TAIL, "the shell still ends in the render()/IIFE tail");
const EXPORTS =
  "\r\n  __EX={contentHTML:contentHTML,find:find,dashboards:dashboards,cmpCards:cmpCards," +
  "mysContent:mysContent,mysOContent:mysOContent,mysOFind:mysOFind,mysFind:mysFind," +
  "mysOHandleClick:mysOHandleClick,mysOHandleInput:mysOHandleInput," +
  "mysOPopContent:mysOPopContent,mysOConfigModalHTML:mysOConfigModalHTML," +
  "mysODetailModalHTML:mysODetailModalHTML,MYSO_QUERIES:MYSO_QUERIES,MYSO_DEFAULT:MYSO_DEFAULT," +
  "MYSO_URGENCY:MYSO_URGENCY,mysConfigModalHTML:mysConfigModalHTML," +
  "MYS_DEFAULT:MYS_DEFAULT,getPop:function(){return pop;},setPop:function(p){pop=p;}," +
  "getModal:function(){return modal;},setModal:function(m){modal=m;}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";

const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, {
  dataAttr: "data-action",
  globals: {
    __EX: null,
    Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    setInterval: function () { return 1; }, clearInterval: function () {},
    navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" },
    /* renderOverlay clamps the popover against the bare window globals */
    innerWidth: 1440, innerHeight: 900, scrollX: 0, scrollY: 0, pageXOffset: 0, pageYOffset: 0,
    alert: function () {}, performance: { now: function () { return 0; } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; }
  }
});
const EX = env.ctx.__EX;
A.ok(EX && typeof EX.mysOContent === "function", "the (OC) My Status block loaded and is reachable");
A.ok(typeof EX.mysContent === "function", "and hers is still reachable alongside it");

/* the two constant sets are separate objects with the same contents */
A.ok(EX.MYSO_DEFAULT !== EX.MYS_DEFAULT, "our default list is a SEPARATE array from hers");
A.eq(EX.MYSO_DEFAULT.join(","), EX.MYS_DEFAULT.join(","), "with the same contents, since this is a clone");
A.ok(EX.MYSO_QUERIES.length > 0, "our query catalogue is populated (" + EX.MYSO_QUERIES.length + ")");
A.ok(EX.mysOFind(EX.MYSO_DEFAULT[0]) !== EX.mysFind(EX.MYS_DEFAULT[0]),
     "mysOFind returns OUR record object, not hers");

/* ---------- 5. PARITY: ours renamed back must equal hers ------------- */
const cards = EX.cmpCards();
function card(id) { return cards.filter(c => c.id === id)[0]; }
[["cmpW08hwide", "cmpW08owide", "Explore"], ["cmpW08hxwide", "cmpW08oxwide", "Detail"]].forEach(([hid, oid, lbl]) => {
  const her = EX.contentHTML(card(hid));
  const our = EX.contentHTML(card(oid));
  A.ok(her.length > 500, "her " + lbl + " card renders");
  A.ok(our.length > 500, "our " + lbl + " card renders");
  const norm = our.replace(/myso-/g, "mys-").replace(/mysO/g, "mys").split(oid).join(hid);
  A.eq(norm, her, "PARITY at " + lbl + ": ours renamed back is byte-identical to hers");
});

/* ---------- 6. the Side by side tab --------------------------------- */
A.eq(cards.filter(c => c.id.indexOf("cmpW08") === 0).length, 5, "W08 contributes 5 cards, not 7");
A.ok(!!card("cmpW08hwide") && !!card("cmpW08hxwide"), "hers at Explore and Detail");
A.ok(!!card("cmpW08owide") && !!card("cmpW08oxwide"), "ours at Explore and Detail");
A.ok(!!card("cmpW08note"), "and the What-changed note card");
A.eq(cards.filter(c => c.id === "cmpW08hkpi" || c.id === "cmpW08okpi").length, 0,
     "NO Glance card: her widget declares two tiers and her content does not branch on size");
A.eq(card("cmpW08hwide").title, "W08 My Status - Jo (Explore)", "her card is labelled Jo");
A.eq(card("cmpW08owide").title, "W08 My Status - OC (Explore)", "our card is labelled OC");
A.eq(card("cmpW08hwide").kind, "mystatus", "her card uses her kind");
A.eq(card("cmpW08owide").kind, "mystatus-oc", "our card uses ours");
A.ok(Array.isArray(card("cmpW08owide").selected), "the selected list survived card building as an ARRAY");
A.ok(card("cmpW08owide").selected !== EX.MYSO_DEFAULT, "and is a per-card copy, not the shared constant");
/* the array fix must not have disturbed any other row */
A.eq(cards.length, 103, "the tab now holds 103 cards (98 before, plus these 5)");
const note = EX.contentHTML(card("cmpW08note"));
A.contains(note, "DUPLICATE", "the note says ours is a duplicate");
A.contains(note, "no design changes yet", "and that there are no design changes yet");
A.noEmDash(note, "the W08 note card");

/* every other widget still gets its 7 */
["W01", "W02", "W03", "W04", "W05", "W06", "W07", "W09", "W10", "W11", "W13", "W15", "W16", "W17"].forEach(w => {
  A.eq(cards.filter(c => c.id.indexOf("cmp" + w) === 0).length, 7, w + " still contributes 7 cards");
});

/* ---------- 7. interactions, through HER listener ------------------- */
/* Her render() writes straight into #dashboard, #tbLeft, #tbRight, and
   renderOverlay/renderModal/setStatus into #overlay, #modalRoot and #status.
   The shim starts with no nodes, so any handler that calls render() would
   throw on null. Seed them, which is what a parsed page would have. */
["dashboard", "tbLeft", "tbRight", "status", "overlay", "modalRoot"].forEach(function (id) {
  env.shim.nodes[id] = env.shim.mkNode(id, "div");
});
/* renderOverlay reads ov.firstChild and then its offsetWidth to position the
   popover, so the overlay needs a child the way a parsed page would have one. */
const ovChild = env.shim.mkNode("", "div");
ovChild.classList = { add: function () {}, remove: function () {}, contains: function () { return false; } };
ovChild.style.setProperty = function (k, v) { ovChild.style[k] = v; };
ovChild.style.removeProperty = function (k) { delete ovChild.style[k]; };
Object.defineProperty(env.shim.nodes.overlay, "firstChild", { get: function () { return ovChild; } });

const ourW = card("cmpW08owide");
EX.dashboards[0].widgets.push(ourW);   /* so her find(id) can reach our card */

/* the options popover: open, toggle shut, and her pop is what carries it */
EX.setPop(null);
A.ok(EX.mysOHandleClick("myso-opts", ourW.id, env.shim.mkTarget({ "data-id": ourW.id }, "button")),
     "our handler claims myso-opts");
A.ok(EX.getPop() && EX.getPop().type === "myso-opts", "the popover opened on her shared pop");
A.contains(EX.mysOPopContent(), "myso-hidezero", "and popContent renders OUR menu");
EX.mysOHandleClick("myso-opts", ourW.id, env.shim.mkTarget({ "data-id": ourW.id }, "button"));
A.ok(!EX.getPop(), "clicking it again closes it, which is the race a private attribute would have broken");

/* hide-zero toggles our own widget state and nothing of hers */
const before = !!ourW.hideZero;
EX.mysOHandleClick("myso-hidezero", ourW.id, env.shim.mkTarget({ "data-id": ourW.id }, "button"));
A.eq(!!ourW.hideZero, !before, "myso-hidezero flips our widget's own state");

/* mode */
EX.mysOHandleClick("myso-mode", ourW.id, env.shim.mkTarget({ "data-id": ourW.id, "data-m": "area" }, "button"));
A.eq(ourW.mode, "area", "myso-mode sets our grouping mode");

/* the config modal is OUR type, and its search input is OUR id */
EX.setModal(null);
EX.mysOHandleClick("myso-config", ourW.id, env.shim.mkTarget({ "data-id": ourW.id }, "button"));
A.ok(EX.getModal() && EX.getModal().type === "mysOconfig", "myso-config opens OUR modal type, not hers");
A.contains(EX.mysOConfigModalHTML(), "mysOConfigQ", "our config modal uses our own search input id");
A.absent(EX.mysOConfigModalHTML(), 'id="mysConfigQ"', "and never hers");

/* our handler must refuse anything that is not ours */
["mys-config", "mys-opts", "ins-foo", "noop"].forEach(a => {
  A.ok(!EX.mysOHandleClick(a, ourW.id, env.shim.mkTarget({ "data-id": ourW.id }, "button")),
       "our handler declines " + a + ", so her chain carries on");
});

/* ---------- 8. no em dash sweep over every rendered state ----------- */
let sweep = 0;
[["wide"], ["xwide"]].forEach(([sz]) => {
  [true, false].forEach(hz => {
    ["urgency", "area"].forEach(mode => {
      [EX.MYSO_DEFAULT.slice(), [], EX.MYSO_DEFAULT.slice(0, 1)].forEach(sel => {
        const w = Object.assign({}, ourW, { size: sz, hideZero: hz, mode: mode, selected: sel });
        const out = EX.mysOContent(w);
        A.noEmDash(out, "size=" + sz + " hideZero=" + hz + " mode=" + mode + " sel=" + sel.length);
        A.ok(out.length > 100, "renders non-empty at size=" + sz + " sel=" + sel.length);
        A.absent(out, "undefined", "no undefined at size=" + sz + " sel=" + sel.length);
        sweep++;
      });
    });
  });
});
A.eq(sweep, 24, "swept 24 combinations of size, hideZero, mode and selection");
A.noEmDash(ourJs, "our JS source");
A.noEmDash(ourCss, "our CSS source");
A.noEmDash(ourData, "our data source");

/* ---------- 9. IMPROVEMENT 1: the pop-up content fills the pop-up -----
   Owner, 2026-09-17. The shells were already fine; their inner scrollers were
   pinned short inside an 84vh flex dialog, so the content stopped and the rest
   was dead space. This is the FIRST intentional difference from hers, and it
   is CSS only, which is why the markup parity assertions above still hold. */
(function () {
  /* the shells were deliberately NOT resized */
  A.absent(ourCss, "max-width:none", "we did not resize the dialogs themselves");
  A.absent(ourCss, "width:94vw", "no viewport width was forced on the shells");
  A.contains(raw, 'class="modal modal-wide myso-cfg-modal"', "the config shell still carries her modal-wide");
  A.contains(raw, 'class="modal modal-wide myso-detail-modal"', "the records shell still carries her modal-wide");

  /* the body owns the leftover height */
  A.contains(ourCss, ".modal.myso-cfg-modal>.modal-b", "the config body is made the flex child");
  A.contains(ourCss, ".modal.myso-detail-modal>.modal-b", "the records body is made the flex child");
  A.contains(ourCss, "flex:1 1 auto;min-height:0", "with min-height:0 so it can actually shrink and grow");

  /* the inner scrollers are released to fill */
  A.contains(ourCss, ".myso-cfg-modal .myso-cfg-scroll{max-height:none", "the config lists are released from 320px");
  A.contains(ourCss, ".myso-detail-modal .myso-detail-tbl{max-height:none", "the records table is released from 60vh");
  A.contains(ourCss, ".myso-cfg-modal .myso-cfg{height:100%", "the two-column grid stretches");
  A.contains(ourCss, ".myso-cfg-modal .myso-cfg-col{min-height:0", "and its columns can shrink");

  /* ISOLATION: her four sizing rules must be byte-for-byte as she wrote them */
  const flat = raw.replace(/ /g, "");
  [[".mys-cfg-modal{max-width:720px", "her config dialog width"],
   [".mys-detail-modal{max-width:760px", "her records dialog width"],
   [".mys-cfg-scroll{max-height:320px", "her config list height"],
   [".mys-detail-tbl{max-height:60vh", "her records table height"]].forEach(([rule, what]) => {
    A.contains(flat, rule, what + " is untouched");
  });
  /* and none of our new rules names one of her classes as a subject */
  A.eq((ourCss.match(/\.mys-(?!o)/g) || []).length, 0, "our new rules name none of her classes");

  /* a rule that overrides nothing is the defect class this run keeps finding,
     so the originals we override must genuinely still be there to override */
  A.contains(flat, ".myso-cfg-scroll{max-height:320px", "the cloned 320px rule is still present to be overridden");
  A.contains(flat, ".myso-detail-tbl{max-height:60vh", "the cloned 60vh rule is still present to be overridden");

  /* the modals still render, and still carry their own ids and actions */
  EX.setModal({ type: "mysOconfig", id: ourW.id, q: "", draft: EX.MYSO_DEFAULT.slice() });
  const cfg = EX.mysOConfigModalHTML();
  A.ok(cfg.length > 800, "the config modal still renders");
  A.contains(cfg, "myso-cfg-scroll", "and still uses the scroller we restyled");
  A.contains(cfg, "mysOConfigQ", "and still our own search input");
  A.noEmDash(cfg, "the config modal");
  /* a query that actually HAS records, so the table renders rather than the
     empty state. MYSO_DEFAULT[0] carries none, which is what tripped this. */
  const withRecs = EX.MYSO_QUERIES.filter(function (q) { return q.records && q.records.length; })[0];
  A.ok(!!withRecs, "our catalogue has a query with records to show");
  EX.setModal({ type: "mysOdetail", id: ourW.id, q: withRecs.id });
  const det = EX.mysODetailModalHTML();
  A.ok(det.length > 400, "the records modal still renders");
  A.contains(det, "myso-detail-tbl", "and still uses the table we restyled");
  A.noEmDash(det, "the records modal");
})();

/* ---------- 10. IMPROVEMENT 2: the urgency dots are explained ----------
   Owner, 2026-09-17. There are only two urgency values, and nothing named
   either of them anywhere: no legend, no tooltip, and every dot carried
   aria-hidden, so the meaning reached neither the eye nor a screen reader.
   A legend now sits directly above the available list, and each row names its
   urgency in its accessible name. Scoped to OUR Configure modal. */
(function () {
  A.cssDeclares(ourCss, ["myso-legend", "myso-legend-k"], "the legend classes are declared");

  /* the label map is ours, and covers exactly the values the data uses */
  const urg = new Set(EX.MYSO_QUERIES.map(function (q) { return q.urgency; }));
  A.eq(urg.size, 2, "the catalogue uses exactly two urgency values");
  A.ok(urg.has("action") && urg.has("info"), "and they are action and info");
  A.contains(raw, 'var MYSO_URGENCY = {action:"Needs action", info:"For information"};', "our label map names both");

  EX.setModal({ type: "mysOconfig", id: ourW.id, q: "", draft: EX.MYSO_DEFAULT.slice() });
  const cfg = EX.mysOConfigModalHTML();

  /* the legend renders, once, above the list it explains */
  A.eq((cfg.match(/class="myso-legend"/g) || []).length, 1, "the legend renders exactly once");
  A.eq((cfg.match(/class="myso-legend-k"/g) || []).length, 2, "with one key per urgency value");
  A.contains(cfg, "Needs action", "the legend names the action state");
  A.contains(cfg, "For information", "the legend names the info state");
  A.ok(cfg.indexOf('class="myso-legend"') < cfg.indexOf('class="menu-scroll myso-cfg-scroll"'),
       "the legend sits ABOVE the available list, next to the dots it explains");

  /* it reuses the row swatches, so the key cannot drift from the rows */
  A.contains(cfg, '<span class="myso-dot myso-dot-action" aria-hidden="true"></span>' , "the action swatch is the row's own class");
  A.contains(cfg, '<span class="myso-dot myso-dot-info" aria-hidden="true"></span>', "the info swatch is the row's own class");

  /* every row now names its urgency to a screen reader */
  const labels = (cfg.match(/class="sr-only">(Needs action|For information)\. <\/span>/g) || []);
  A.eq(labels.length, EX.MYSO_QUERIES.length, "all " + EX.MYSO_QUERIES.length + " rows name their urgency");
  A.noEmDash(cfg, "the config modal with the legend");

  /* ISOLATION: her Configure modal gains none of this */
  EX.setModal({ type: "mysconfig", id: ourW.id, q: "", draft: EX.MYS_DEFAULT.slice() });
  const hers = EX.mysConfigModalHTML();
  A.absent(hers, "myso-legend", "her modal has no legend of ours");
  A.absent(hers, "mys-legend", "and none was added to hers");
  A.absent(hers, "Needs action", "her modal names no urgency");
  A.absent(hers, "For information", "her modal names no urgency");
  A.eq((hers.match(/class="sr-only">/g) || []).length, 0, "her rows gained no screen reader labels");
  A.ok((hers.match(/mys-dot mys-dot-\w+" aria-hidden="true"/g) || []).length > 0,
       "her dots are still aria-hidden, exactly as she wrote them");
  A.absent(raw, "MYS_URGENCY", "no label map was added to her namespace");

  /* our CSS still touches nothing of hers */
  A.eq((ourCss.match(/\.mys-(?!o)/g) || []).length, 0, "the legend rules name none of her classes");
})();

process.exit(A.report());
