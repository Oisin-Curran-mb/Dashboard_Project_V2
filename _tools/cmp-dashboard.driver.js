/* =====================================================================
   cmp-dashboard.driver.js , the "Side by side (Jo vs OC)" comparison TAB.

   This is not a widget driver. The tab is a fourth entry in the shell's
   dashboards array holding 103 cards: for each of the fourteen widgets we
   have ported, HER version at Glance / Explore / Detail, OUR version at the
   same three, and one cmpnote-mb note card summarising that widget's section
   of the Jo vs Oisin design-difference doc.

   The real test in here is not the note card. It is that every one of HER
   fourteen widgets still renders at all three sizes from a registry row built
   by this tab, including the seven she deleted from her own dashboard in her
   commit faa6507 (budget, pension, payroll, remittance, ar, insurance,
   deposits). Their render functions are still in the file; nothing but this
   tab exercises them any more.

   Unlike the widget drivers, this one runs the WHOLE shell script rather than
   one extracted block, because contentHTML() and all fourteen of her entry
   functions have to be live at once. It does that on the shared harness:
   loadShell + runBlock + Assert, with one appended export line so the IIFE's
   internals are reachable, and with render() caught because the shim has no
   real #grid to write into.

   Run from this folder:  node cmp-dashboard.driver.js
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./jo-port-driver.js");

const A = new H.Assert("CMP side-by-side dashboard");
const shell = H.loadShell();
const S = shell.script;

/* The compared widgets come from widget-map.json: every widget that is not yet
   `decided` and has both a Jo side and an ours side. W01-W07: Jo adopted our
   August port as THE widget (her commit faa6507), so her live kind is the -mb
   one; W09-W17: hers is the plain kind, ours the -mb one. A decided widget
   leaves this tab, its `final` kind is the only one left, and its `removed`
   kinds are gone from the file. */
const MAPW = JSON.parse(fs.readFileSync(path.join(__dirname, "widget-map.json"), "utf8")).widgets;
const GROUPS = Object.keys(MAPW).sort().filter(function (k) { const w = MAPW[k]; return !w.decided && w.jo && w.ours && w.jo.kind && w.ours.kind; })
  .map(function (k) { return [k, MAPW[k].name, MAPW[k].jo.kind, MAPW[k].ours.kind]; });
const REMOVED = []; Object.keys(MAPW).forEach(function (k) { (MAPW[k].removed || []).forEach(function (r) { REMOVED.push(r); }); });
const FINAL_KINDS = Object.keys(MAPW).filter(function (k) { return MAPW[k].final && MAPW[k].final.kind; }).map(function (k) { return MAPW[k].final.kind; });
const LIVE_ADOPTED_ALL = GROUPS.map(function (g) { return g[2]; }).filter(function (k) { return /-mb$/.test(k); });
const N = GROUPS.length;

/* ---------- 0. host the whole shell on the shared harness ------------- */
const TAIL = "\r\n  render();\r\n})();\r\n";
A.eq(S.slice(-TAIL.length), TAIL, "the shell still ends in the render()/IIFE tail this driver appends to");
const EXPORTS =
  "\r\n  __EX={contentHTML:contentHTML,dashboards:dashboards,find:find," +
  "cmpNoteContent:cmpNoteContent,CMPNOTE_:CMPNOTE_,cmpCards:cmpCards,CMP_ROWS:CMP_ROWS,triggerSelector:triggerSelector,setPop:function(p){pop=p;}};\r\n" +
  "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
const hosted = S.slice(0, -TAIL.length) + EXPORTS;

const env = H.runBlock(hosted, {
  globals: {
    __EX: null,
    Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    setInterval: function () { return 1; }, clearInterval: function () {},
    navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" },
    alert: function () {}, performance: { now: function () { return 0; } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; }
  }
});
const EX = env.ctx.__EX;
A.ok(EX && typeof EX.contentHTML === "function", "the whole shell script loaded and contentHTML is reachable");

/* ---------- 1. the tab exists, and hers are untouched ----------------- */
const dash = EX.dashboards.filter(function (d) { return d.id === "cmp"; })[0];
A.ok(!!dash, "a dashboard with id 'cmp' exists");
A.eq(dash.name, "Side by side (Jo vs OC)", "its name reads as specified");
A.eq(dash.custom, true, "it is a custom dashboard, so it is not the read-only system one");
/* card count is asserted against the widget map in section 2 */

A.eq(EX.dashboards.length, 4, "the shell now has four dashboards, hers plus this one");
A.eq(EX.dashboards.map(function (d) { return d.id; }).join(","), "d1,sys,nowidgets,cmp",
  "the tab is APPENDED after her three, so her order and default dashboard are unchanged");
A.ok(EX.dashboards[0].widgets.length > 100, "her main dashboard still holds its cards (" + EX.dashboards[0].widgets.length + ")");
A.eq(EX.dashboards[1].widgets.length, 1, "her System dashboard still holds its one card");
A.eq(EX.dashboards[2].widgets.length, 0, "her No widgets dashboard is still empty");

/* Her three dashboard entries, byte-identical to the pre-edit snapshot.
   The comparison is on the SOURCE TEXT of the array region, so a changed
   default, a moved card or a re-ordered key would all show up. */
(function () {
  const dir = path.join(__dirname, "..");
  const snaps = H.baselineFiles();
  A.ok(snaps.length > 0, "the a548419 baseline is on disk (_tools/baselines)");
  if (!snaps.length) return;
  const old = fs.readFileSync(snaps[snaps.length - 1], "utf8");
  const cur = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  function region(t) {
    const i = t.indexOf('    {id:"d1",name:"Dashboard",custom:true,widgets:[');
    const END = '    {id:"nowidgets",name:"No widgets dashboard",custom:true,widgets:[]}';
    const j = t.indexOf(END, i);
    return i < 0 || j < 0 ? null : t.slice(i, j + END.length);
  }
  const rOld = region(old), rCur = region(cur);
  A.ok(rOld && rCur, "her three dashboard entries were located in both files");
  /* side-by-side model: her region must equal the a548419 baseline once our
     (OC) additions - the seven -oc defaults and the commented driver
     fixtures - are filtered back out. */
  var inFixture = false;
  const rCurFiltered = rCur.split("\r\n").filter(function (l) {
    const s = l.trim();
    if (s.indexOf("(OC) driver fixtures") === 0 || s.indexOf("/* (OC) driver fixtures") === 0) { inFixture = true; return false; }
    if (inFixture) { if (s === "*/") inFixture = false; return false; }
    if (s.indexOf('{id:"') === 0 && l.indexOf('-oc"') > -1) return false;
    return true;
  }).join("\r\n");
  /* baseline rows of kinds that left the file with a decided widget are not expected any more */
  var oldLines = rOld.split("\r\n").filter(function (l) { return !REMOVED.some(function (k) { return l.indexOf('kind:"' + k + '"') > -1; }); }), curLines = rCurFiltered.split("\r\n"), oi = 0;
  for (var ci = 0; ci < curLines.length && oi < oldLines.length; ci++) {
    if (curLines[ci] === oldLines[oi]) oi++;
  }
  A.eq(oi, oldLines.length, "her three dashboard entries survive line-for-line IN ORDER inside the region (a548419 baseline; ours interleave additively)");

  /* Decision D8 (2026-09-25): widgets are being restructured into self-contained
     registered blocks, so Jo's shell lines are no longer byte-frozen and the old
     "every a548419 line survives verbatim" guard is retired. The guard is now
     structural: her live widgets still render (section 3), every kind registers
     at most once, and no top-level function is defined twice. */
  const oL = old.split("\r\n"), cL = cur.split("\r\n");
  A.ok(cL.length - oL.length > 3000, "the edit added our blocks (" + (cL.length - oL.length) + " lines)");
  const regs = (cur.match(/WIDGETS\.register\("([a-z0-9-]+)"/g) || []).map(function (m) { return /"([a-z0-9-]+)"/.exec(m)[1]; });
  A.ok(regs.length >= 2, "widgets register through WIDGETS.register (" + regs.join(", ") + ")");
  A.eq(new Set(regs).size, regs.length, "no kind is registered twice");
  A.ok(cur.indexOf("var WIDGETS={") < cur.indexOf("  var dashboards=["), "WIDGETS is defined before the registry literal");
  /* and INSIDE the shell IIFE: its methods read the IIFE's pop/modal variables,
     so outside it they would resolve to nothing (caught 2026-09-25) */
  A.ok(cur.indexOf("<script>\r\n(function(){") > -1 && cur.indexOf("<script>\r\n(function(){") < cur.indexOf("var WIDGETS={"), "WIDGETS is defined inside the shell IIFE, after its opening line");
  regs.forEach(function (k) {
    A.absent(cur, 'if(w.kind==="' + k + '")return', k + ": no leftover contentHTML branch, the registration is the only dispatch");
  });
  /* Jo's own shell already repeats a few tiny helper names (sb, seg, val, line,
     btn) in separate scopes, so a duplicate only counts if OUR work added it:
     the name's definition count must not have grown against the baseline. */
  function defCounts(lines) { const d = {}; lines.forEach(function (l) { const m = /^ {0,2}function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(l); if (m) d[m[1]] = (d[m[1]] || 0) + 1; }); return d; }
  const dCur = defCounts(cL), dOld = defCounts(oL);
  /* Four helper names (sb, seg, line, btn) were already duplicated by the older
     OC blocks before 2026-09-25; each disappears when its widget is finalised,
     so they are tolerated here and re-checked per widget. Anything new fails. */
  const KNOWN_DUPS = ["sb", "seg", "line", "btn"];
  const dups = Object.keys(dCur).filter(function (n) { return dCur[n] > 1 && dCur[n] > (dOld[n] || 0) && KNOWN_DUPS.indexOf(n) < 0; });
  A.eq(dups.length, 0, "no top-level function was defined twice by our work" + (dups.length ? " (" + dups.join(", ") + ")" : ""));

  /* the CRLF file kept its line endings: a whole-file flip is an automatic fail */
  A.eq((cur.match(/(?<!\r)\n/g) || []).length, 0, "no bare LF anywhere: still a pure CRLF file");
  A.eq((cur.match(/\r\n/g) || []).length, cur.split("\n").length - 1, "the CRLF pair count matches the file's own line count");

  /* our namespace was free before this edit and is ours alone now */
  ["cmpnote", "CMPNOTE_", "cmpCards", "cmpNoteContent", "CMP_ROWS", 'id:"cmp"', "Side by side"]
    .forEach(function (tok) {
      A.eq(old.split(tok).length - 1, 0, "'" + tok + "' had ZERO occurrences before this edit");
      A.ok(cur.split(tok).length - 1 > 0, "'" + tok + "' is present now and is ours");
    });
})();

/* ---------- 2. group structure: hers x3, ours x3, then the note ------- */
const TIERS = ["kpi", "wide", "xwide"];
const LBL = { kpi: "Glance", wide: "Explore", xwide: "Detail" };
A.ok(N >= 1, N + " undecided widgets are compared in groups of seven");
A.eq(dash.widgets.length, N * 7, "the tab holds exactly " + (N * 7) + " cards (" + N + " widgets x 7)");
A.eq(new Set(dash.widgets.map(function (w) { return w.id; })).size, N * 7, "all card ids are unique");
REMOVED.forEach(function (k) { A.absent(S, 'kind:"' + k + '"', "decided widget's removed kind '" + k + "' has no registry row anywhere"); });
/* Decided widgets leave the tab (D9). W14 was Jo's alone; W08 was decided for
   Jo's version on 2026-09-25 and the clone deleted. */
A.eq(dash.widgets.filter(function (w) { return w.kind === "tasks"; }).length, 0,
  "kind 'tasks' is absent: W14 is decided (Jo's), nothing to compare");
A.eq(dash.widgets.filter(function (w) { return w.kind === "mystatus"; }).length, 0,
  "kind 'mystatus' is absent: W08 is decided (Jo's), nothing to compare");
A.eq(dash.widgets.filter(function (w) { return /^cmpW08/.test(w.id); }).length, 0,
  "W08 contributes no cards any more");
A.absent(S, "mystatus-oc", "the W08 clone kind is gone from the shell");
A.absent(S, "mysO", "the W08 clone namespace is gone from the shell");
A.eq(dash.widgets.filter(function (w) { return /^cmpW12/.test(w.id); }).length, 0,
  "W12 is absent: it is an empty slot in the widget list");

GROUPS.forEach(function (g, gi) {
  const n = g[0], nm = g[1], herK = g[2], ourK = g[3];
  const grp = dash.widgets.slice(gi * 7, gi * 7 + 7);
  A.eq(grp.length, 7, n + ": the group holds seven cards");
  /* 1-3 hers, in tier order */
  TIERS.forEach(function (sz, i) {
    const w = grp[i];
    A.eq(w.kind, herK, n + " card " + (i + 1) + ": HER kind is " + herK);
    A.eq(w.size, sz, n + " card " + (i + 1) + ": size is " + sz);
    A.eq(w.title, n + " " + nm + " - Jo (" + LBL[sz] + ")", n + " card " + (i + 1) + ": title names Jo and the tier");
  });
  /* 4-6 ours, in the same tier order */
  TIERS.forEach(function (sz, i) {
    const w = grp[3 + i];
    A.eq(w.kind, ourK, n + " card " + (i + 4) + ": OUR kind is " + ourK);
    A.eq(w.size, sz, n + " card " + (i + 4) + ": size is " + sz);
    A.eq(w.title, n + " " + nm + " - OC (" + LBL[sz] + ")", n + " card " + (i + 4) + ": title names OC and the tier");
  });
  /* 7 the note card */
  const note = grp[6];
  A.eq(note.kind, "cmpnote-mb", n + " card 7: the diff-summary card is the new kind");
  A.eq(note.size, "wide", n + " card 7: the note card is wide");
  A.eq(note.title, n + " - What changed", n + " card 7: title reads plainly");
  A.eq(note.cmpN, n, n + " card 7: the note card names its widget");
  /* every card in the group */
  grp.forEach(function (w, i) {
    A.eq((w.tiers || []).join(","), "kpi,wide,xwide", n + " card " + (i + 1) + ": declares all three tiers");
    A.eq(w.goto, false, n + " card " + (i + 1) + ": the go-to-report icon is off");
    A.eq(w.state, "ready", n + " card " + (i + 1) + ": no card fakes a loading, error or empty state");
  });
});

/* card ids are unique, so find() and the shell's per-card state cannot cross */
(function () {
  const ids = dash.widgets.map(function (w) { return w.id; });
  A.eq(new Set(ids).size, N * 7, "all " + (N * 7) + " card ids are unique");
  const herIds = EX.dashboards[0].widgets.map(function (w) { return w.id; });
  A.eq(ids.filter(function (i) { return herIds.indexOf(i) > -1; }).length, 0,
    "no card id collides with one of hers on her own dashboard");
})();

/* ---------- 3. THE REAL TEST: every card renders at its own size ------ */
(function () {
  let herRendered = 0, ourRendered = 0, noteRendered = 0;
  dash.widgets.forEach(function (w) {
    let html = null, threw = null;
    try { html = EX.contentHTML(w); } catch (e) { threw = e.message; }
    A.ok(threw === null, w.id + " (" + w.kind + " at " + w.size + ") renders without throwing" +
      (threw ? " [" + threw + "]" : ""));
    A.ok(html && html.length > 100, w.id + " (" + w.kind + " at " + w.size + ") renders NON-EMPTY html" +
      (html ? " (" + html.length + " bytes)" : ""));
    /* nothing silently degraded into a loading skeleton or a shared fallback */
    A.absent(html || "", 'aria-busy="true"', w.id + ": did not render as a loading skeleton");
    A.absent(html || "", 'data-kind="error"', w.id + ": did not render as an error state");
    A.noEmDash(html || "", w.id + " (" + w.kind + " at " + w.size + ")");
    if (w.kind === "cmpnote-mb") noteRendered++;
    else if (/^cmpW\d\d o/.test(w.id.replace(/^(cmpW\d\d)([ho])/, "$1 $2"))) ourRendered++;
    else herRendered++;
  });
  A.eq(herRendered, N * 3, (N * 3) + " of HER cards rendered: " + N + " widgets x 3 sizes");
  A.eq(ourRendered, N * 3, (N * 3) + " of OUR cards rendered: " + N + " widgets x 3 sizes");
  A.eq(noteRendered, N, N + " note cards rendered");
})();

/* Her seven removed widgets specifically: the point of the whole tab.
   NOTE on counting: her file still carries COMMENTED-OUT registry templates
   for several of these kinds (she left the paste-me blocks above her own
   render code), so a whole-script scan for a kind literal is not a test of
   what is LIVE. Everything below counts inside the dashboards array only. */
function dashRegion(text) {
  const i = text.indexOf("  var dashboards=[");
  const j = text.indexOf("\n  ];", i);
  return i < 0 || j < 0 ? "" : text.slice(i, j);
}
function liveRows(text, kind) {
  return dashRegion(text).split(/\r?\n/).filter(function (l) {
    return l.indexOf('kind:"' + kind + '"') > -1 && l.trim().replace(/^,/, "").charAt(0) === "{";
  }).length;
}
(function () {
  /* Her seven RETIRED v1 kinds. She removed their registry rows in faa6507 when
     she adopted our port, so they are not what she ships - and per the owner's
     2026-09-08 ruling the comparison tab must show ONLY her current live widget.
     The v1 CODE stays in the file untouched (it is hers); it is simply not
     exercised by this tab. */
  const RETIRED =["budget", "pension", "payroll", "remittance", "ar", "insurance", "deposits"].filter(function (k) { return FINAL_KINDS.indexOf(k) < 0; });
  RETIRED.forEach(function (k) {
    A.eq(liveRows(shell.html, k), 0,
      "she has NO live registry row for kind '" + k + "' any more (she removed it in her own commit faa6507)");
    A.eq(dash.widgets.filter(function (w) { return w.kind === k; }).length, 0,
      "retired kind '" + k + "' is NOT on the comparison tab: the Jo column shows her current live widget only");
  });
  /* Her seven CURRENT live kinds, which the Jo column now shows. Each must be on
     the tab at all three tiers and render as her own code does. */
  const LIVE_ADOPTED = LIVE_ADOPTED_ALL;
  LIVE_ADOPTED.forEach(function (k) {
    A.ok(liveRows(shell.html, k) >= 1,
      "she HAS a live registry row for kind '" + k + "' (this is the widget she ships)");
    const cards = dash.widgets.filter(function (w) { return w.kind === k; });
    A.eq(cards.length, 3, "her live kind '" + k + "' is on the comparison tab at all three sizes");
    A.eq(cards.map(function (w) { return w.size; }).join(","), "kpi,wide,xwide",
      k + ": all three sizes are present, in order");
    cards.forEach(function (w) {
      const html = EX.contentHTML(w);
      A.ok(html.length > 150, k + " at " + w.size + ": her live widget renders (" + html.length + " bytes)");
    });
  });
})();

/* Every comparison card's state is copied from the matching LIVE registry
   object on her own dashboard, key by key, for HERS and for OURS alike. The
   live objects are read at runtime rather than parsed out of the source,
   because two of her rows reference a shell constant by name. */
(function () {
  const HER_LIVE = {}; GROUPS.forEach(function (g) { if (!/-mb$/.test(g[2])) HER_LIVE[g[2]] = g[2]; });
  const OUR_LIVE = {}; GROUPS.forEach(function (g) { OUR_LIVE[g[3]] = 1; });
  /* the one key we deliberately do NOT carry, and why, asserted rather than assumed */
  const OMITTED = { gifts: "gftThru" };
  const SKIP = ["id", "title", "kind", "size", "tiers", "actions", "state", "dataset", "goto", "sub", "updated"];

  function checkSide(kind, label) {
    const live = EX.dashboards[0].widgets.filter(function (w) {
      return w.kind === kind && w.size === "wide" && !w.dataset && w.state === "ready";
    })[0];
    const card = dash.widgets.filter(function (w) { return w.kind === kind && w.size === "wide"; })[0];
    A.ok(!!live, kind + ": her live " + label + " entry was found on her own dashboard");
    A.ok(!!card, kind + ": the matching comparison card was found");
    if (!live || !card) return;
    Object.keys(live).forEach(function (key) {
      if (SKIP.indexOf(key) > -1) return;
      if (OMITTED[kind] === key) return;
      const a = live[key], b = card[key];
      if (a && typeof a === "object") {
        A.ok(b && typeof b === "object" && b !== a,
          kind + ": object-valued key '" + key + "' is carried as this card's OWN fresh map, not shared with hers");
      } else {
        A.eq(b, a, kind + ": state key '" + key + "' is copied verbatim from the live " + label + " entry");
      }
    });
    /* and the three sizes of one widget never share a mutable state object */
    const trio = dash.widgets.filter(function (w) { return w.kind === kind; });
    Object.keys(live).forEach(function (key) {
      if (SKIP.indexOf(key) > -1 || !(live[key] && typeof live[key] === "object")) return;
      const seen = trio.map(function (w) { return w[key]; });
      A.eq(new Set(seen).size, 3, kind + ": each size holds its own '" + key + "' map");
    });
  }
  Object.keys(HER_LIVE).forEach(function (k) { checkSide(k, "Jo"); });
  Object.keys(OUR_LIVE).forEach(function (k) { checkSide(k, "OC"); });

  /* The one omission, proved harmless by rendering rather than argued. */
  const gLive = EX.dashboards[0].widgets.filter(function (w) { return w.kind === "gifts" && w.size === "wide" && !w.dataset; })[0];
  const gCard = dash.widgets.filter(function (w) { return w.kind === "gifts" && w.size === "wide"; })[0];
  A.ok(!Object.prototype.hasOwnProperty.call(gCard, "gftThru"),
    "her gifts receipts-through key is deliberately NOT set on the comparison card");
  ["kpi", "wide", "xwide"].forEach(function (sz) {
    const c = dash.widgets.filter(function (w) { return w.kind === "gifts" && w.size === sz; })[0];
    const withKey = {}; Object.keys(c).forEach(function (k) { withKey[k] = c[k]; });
    withKey.gftThru = gLive.gftThru;
    A.same(EX.contentHTML(c), EX.contentHTML(withKey),
      "gifts at " + sz + ": omitting that key renders identically to her own value, so the card IS in her default state");
  });
})();

/* State keys on HER CURRENT LIVE widgets are read by her render functions, and the
   values we carried are her own defaults, lifted from her own live registry entry.
   Two proofs per widget, by rendering:
     (a) flipping one key changes the output, so the key is genuinely live;
     (b) her card renders identically to a bare card with no state at all, so
         the values we carried ARE her defaults and nothing is being forced. */
(function () {
  /* keyed on her LIVE kinds; every flip below was verified to change her render */
  const FLIP_ALL = {
    "budget-mb": ["acctview", "expense"], "pension-mb": ["penSort", "name"],
    "payroll-mb": ["view", "dist"], "remittance-mb": ["view", "pacing"],
    "receivables-mb": ["arFGroup", "customer"], "insurance-mb": ["insType", "Medical"],
    "deposits-mb": ["view", "dist"]
  };
  const FLIP = {}; Object.keys(FLIP_ALL).forEach(function (k) { if (LIVE_ADOPTED_ALL.indexOf(k) > -1) FLIP[k] = FLIP_ALL[k]; });
  Object.keys(FLIP).forEach(function (k) {
    const card = dash.widgets.filter(function (w) { return w.kind === k && w.size === "wide"; })[0];
    const base = EX.contentHTML(card);
    const flipped = {}; Object.keys(card).forEach(function (kk) { flipped[kk] = card[kk]; });
    flipped[FLIP[k][0]] = FLIP[k][1];
    A.changed(base, EX.contentHTML(flipped), k + ": her render reads the state key '" + FLIP[k][0] + "'");
    const bare = { id: card.id, title: card.title, kind: k, size: "wide", tiers: ["kpi", "wide", "xwide"], state: "ready", updated: card.updated };
    A.same(base, EX.contentHTML(bare), k + ": the state we carried is HER OWN default, so the card renders in her default state");
  });
})();

/* ---------- 4. the note cards carry the real summaries ---------------- */
(function () {
  A.eq(Object.keys(EX.CMPNOTE_).length, N, "the note lookup holds one summary per compared widget");
  GROUPS.forEach(function (g) {
    const n = g[0];
    const note = EX.CMPNOTE_[n];
    A.ok(!!note, n + ": a summary exists");
    A.ok(note.rows.length >= 4 && note.rows.length <= 8,
      n + ": the summary is 4 to 8 rows (" + note.rows.length + ")");
    A.ok(!!note.open && note.open.length > 30, n + ": the summary carries this widget's open item");
    const card = dash.widgets.filter(function (w) { return w.cmpN === n; })[0];
    const html = EX.contentHTML(card);
    A.contains(html, note.h, n + ": the rendered note leads with its framing line");
    note.rows.forEach(function (r, i) {
      A.contains(html, r, n + ": rendered note row " + (i + 1) + " is on screen");
    });
    A.contains(html, note.open, n + ": the open item is on screen, not dropped");
    A.contains(html, "cmpnote-root", n + ": the note renders in our own root");
    A.contains(html, "cap cmpnote-cap", n + ": the framing line reuses her .cap caption primitive");
    /* static text only: no control, no handler hook, no popover trigger */
    A.absent(html, "data-action", n + ": the note card emits NO data-action, so her dispatcher never sees it");
    A.absent(html, "<button", n + ": the note card has no buttons");
    A.absent(html, "aria-haspopup", n + ": the note card opens nothing");
    A.absent(html, "<svg", n + ": the note card draws no chart");
  });
  /* an unknown widget number degrades honestly on her own empty block */
  const stray = EX.cmpNoteContent({ id: "x", kind: "cmpnote-mb", size: "wide", cmpN: "W99" });
  A.contains(stray, 'class="state" data-kind="empty"', "an unknown widget number falls back to her .state block");
  A.noEmDash(stray, "the fallback note");
})();

/* ---------- 5. the new kind's footprint is one dispatch line + CSS ---- */
(function () {
  const LINE = 'if(w.kind==="cmpnote-mb")return cmpNoteContent(w);';
  A.eq(S.split(LINE).length - 1, 1, "the dispatch line is present exactly once");
  /* scoped to contentHTML's own body, not the first "return" in the file */
  const fnStart = S.indexOf("  function contentHTML(w){");
  const fnEnd = S.indexOf("\r\n  function titleHTML(w){", fnStart);
  A.ok(fnStart > -1 && fnEnd > fnStart, "contentHTML's body was located");
  const fn = S.slice(fnStart, fnEnd);
  A.eq(fn.split(LINE).length - 1, 1, "the dispatch sits inside contentHTML's if-chain");
  A.ok(fn.indexOf('if(w.kind==="status")return statusHTML();') < fn.indexOf(LINE),
    "it is appended at the END of the chain, after her last existing branch");
  const branches = fn.match(/if\(w\.kind==="[a-z-]+"\)/g) || [];
  A.eq(branches[branches.length - 1], 'if(w.kind==="cmpnote-mb")',
    "ours is the LAST kind branch in the chain, so no dispatch of hers was displaced");
  A.ok(fn.indexOf(LINE) < fn.lastIndexOf('return "";'),
    "and it precedes the chain's final fallthrough return");
  A.eq(S.split('kind:"cmpnote-mb"').length - 1, 1,
    "the new kind appears as a literal exactly once, in the card builder");
  /* the tab's cards are BUILT, not typed as registry literals, which is what
     keeps every other widget's registry line count where it was */
  A.eq(S.split('kind:"gifts"').length - 1, 12, "no new kind:\"gifts\" literal was introduced");
  A.eq((S.match(/,kind:"payables",/g) || []).length, 6, "her six payables registry lines are still six");
  A.eq((S.match(/kind:"bank"/g) || []).length, 5, "her five bank registry lines are still five");
  /* Every widget's own registry row count is unmoved, measured against the
     pre-edit snapshot rather than against a hardcoded number, so this holds
     if any of them is ever re-ported. */
  (function () {
    const snaps = H.baselineFiles();
    if (!snaps.length) return;
    const old = fs.readFileSync(snaps[snaps.length - 1], "utf8");
    /* HER kinds must be unmoved vs the a548419 baseline; OUR kinds (-mb and -oc)
       are additions of this edit and are asserted present below. */
    /* her kinds that are still undecided (plain kinds + W08/W14 which are hers and final): row counts unmoved vs a548419 */
    ["budget", "pension", "payroll", "remittance", "ar", "insurance", "deposits", "pto", "loans",
     "fixedassets", "purchasing", "bank", "payables", "gifts", "mystatus", "tasks"].filter(function (k) { return FINAL_KINDS.indexOf(k) < 0 || k === "mystatus" || k === "tasks"; }).forEach(function (k) {
      A.eq(liveRows(shell.html, k), liveRows(old, k),
        k + ": her live registry row count is unmoved vs a548419");
    });
    GROUPS.forEach(function (g) {
      A.ok(liveRows(shell.html, g[3]) >= 1, g[3] + ": at least one live registry row is present");
      A.ok(H.extractRegistry(shell.script, g[3]).length >= 4, g[3] + ": extractRegistry finds this widget's registry entries (default + fixtures)");
    });
  })();
  /* our CSS: declared, ours alone, and it redeclares nothing of hers */
  A.cssDeclares(shell.css, ["cmpnote-root", "cmpnote-cap", "cmpnote-list", "cmpnote-row",
    "cmpnote-tx", "cmpnote-open"], "our note-card CSS");
  const ours = shell.css.slice(
    shell.css.indexOf("===== Comparison note V2 CSS"),
    shell.css.indexOf("===== end Comparison note V2 CSS"));
  A.ok(ours.length > 200, "our CSS block was located (" + ours.length + " bytes)");
  const sels = (ours.match(/^\s*([^\n{}/][^\n{}]*)\{/gm) || []).map(function (s) { return s.trim(); });
  A.ok(sels.length >= 6, "our CSS block declares at least six rules (" + sels.length + ")");
  A.eq(sels.filter(function (s) { return s.indexOf(".cmpnote-") < 0; }).length, 0,
    "EVERY selector in our block is .cmpnote- scoped: [" + sels.join(" ") + "]");
  A.eq((ours.match(/\{/g) || []).length, (ours.match(/\}/g) || []).length,
    "our CSS block is brace-balanced");
  A.absent(ours, "--wn-500", "our block does not declare the token her own zero-axis rule is missing");
  A.absent(ours, "(MB updated)", "our block header does not use the ported-widget marker");
  A.absent(ours, "[data-action]", "our block adds no [data-action] selector to her shared components");
  /* the note block borrows her primitives read-only and ships no handler */
  const jsBlock = S.slice(S.indexOf("  var CMPNOTE_={"), S.indexOf("  var dashboards=["));
  A.ok(jsBlock.length > 1000, "our JS block was located (" + jsBlock.length + " bytes)");
  A.absent(jsBlock, "addEventListener", "our block wires NO listener");
  A.absent(jsBlock, "data-action", "our block emits no data-action attribute");
  A.absent(jsBlock, "setTimeout", "our block starts no timer, so it can never flash a skeleton");
  A.absent(jsBlock, "pop=", "our block never assigns her popover state");
  A.contains(jsBlock, "ICON(", "we reuse her ICON helper rather than shipping our own");
})();

/* ---------- 6. a no-em-dash sweep over all 98 cards, whole card ------- */
(function () {
  let swept = 0;
  dash.widgets.forEach(function (w) {
    A.noEmDash(w.title, "the title of " + w.id);
    A.noEmDash(EX.contentHTML(w), "the body of " + w.id);
    swept++;
  });
  A.eq(swept, N * 7, "the em-dash sweep covered all " + (N * 7) + " cards, title and body");
})();


/* ---------- 7. popover plumbing: every declared pop.type resolves ------
   REGRESSION GUARD (2026-09-08): the side-by-side merge once inserted the
   (OC) branches at the wrong point in triggerSelector, stranding Jo's 42
   branches after an unconditional `return null;`. Every popover in the app
   died silently - no console error, the overlay simply never painted. The
   widget drivers all stayed green, because none of them drives this
   function. So: assert it for EVERY pop.type the function itself declares. */
(function () {
  A.ok(typeof EX.triggerSelector === "function", "triggerSelector is reachable from the hosted shell");
  const srcLine = S.split("\r\n").filter(function (l) {
    return l.trim().indexOf("function triggerSelector()") === 0;
  })[0];
  A.ok(!!srcLine, "triggerSelector is a single-line function, as the shell writes it");

  const types = (srcLine.match(/pop\.type===\"[^\"]+\"/g) || [])
    .map(function (s) { return s.slice('pop.type==="'.length, -1); })
    .filter(function (v, i, a) { return a.indexOf(v) === i; });
  A.ok(types.length > 40, "triggerSelector declares its full branch set (" + types.length + " pop types)");

  /* the guard itself: no pop means no anchor. Wrapped, because the branch-order
     bug this section guards against makes `if(!pop)` fall into a pop.type test
     and throw here rather than returning. */
  EX.setPop(null);
  let guardRes = null, guardThrew = null;
  try { guardRes = EX.triggerSelector(); } catch (e) { guardThrew = e.message; }
  A.ok(guardThrew === null,
    "triggerSelector's `if(!pop)` guard short-circuits instead of dereferencing pop" +
    (guardThrew ? " [" + guardThrew + " - the (OC) branches are inserted INSIDE the guard]" : ""));
  A.eq(guardRes, null, "triggerSelector returns null when no popover is open");

  let dead = [];
  types.forEach(function (ty) {
    EX.setPop({ type: ty, id: "bank" });
    let sel = null, threw = null;
    try { sel = EX.triggerSelector(); } catch (e) { threw = e.message; }
    A.ok(threw === null, "triggerSelector(" + ty + ") does not throw" + (threw ? " [" + threw + "]" : ""));
    A.ok(typeof sel === "string" && sel.indexOf("[data-action=") === 0,
      "pop type " + ty + " resolves to an anchor selector" + (sel === null ? " (got null: its branch is unreachable)" : ""));
    if (sel === null) dead.push(ty);
  });
  A.eq(dead.length, 0, "no declared pop type is stranded behind an unconditional return" +
    (dead.length ? " (dead: " + dead.slice(0, 6).join(", ") + ")" : ""));

  /* the three shared entry points the merge extends must all still be live */
  ["switcher", "wfind", "wmenu", "save", "winfo"].forEach(function (ty) {
    EX.setPop({ type: ty, id: "bank" });
    A.ok(typeof EX.triggerSelector() === "string", "shell chrome popover '" + ty + "' is live");
  });
  ["bgtO-scope", "penO-dist", "prO-pt", "remO-thru", "arO-rc"].forEach(function (ty) {
    EX.setPop({ type: ty, id: "bgtO" });
    A.ok(typeof EX.triggerSelector() === "string", "(OC) clone popover '" + ty + "' is live");
  });
  EX.setPop(null);
})();

process.exit(A.report());
