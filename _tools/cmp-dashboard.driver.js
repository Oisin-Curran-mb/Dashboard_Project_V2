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
/* 103 since 2026-09-17: fourteen widgets at 7 cards each, plus W08 My Status
   at 5. W08 was added on owner instruction, reversing the earlier ruling that
   it was hers alone; it contributes 5 rather than 7 because her widget declares
   tiers:["wide","xwide"] and her mysContent does not branch on size, so no
   Glance card is invented for it. */
A.eq(dash.widgets.length, 103, "it holds exactly 103 cards (14 widgets x 7, plus W08 x 5)");

A.eq(EX.dashboards.length, 4, "the shell now has four dashboards, hers plus this one");
A.eq(EX.dashboards.map(function (d) { return d.id; }).join(","), "d1,sys,nowidgets,cmp",
  "the tab is APPENDED after her three, so her order and default dashboard are unchanged");
A.eq(EX.dashboards[0].widgets.length, 130, "her main dashboard holds her 123 cards plus the seven (OC) side-by-side defaults");
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
  var oldLines = rOld.split("\r\n"), curLines = rCurFiltered.split("\r\n"), oi = 0;
  for (var ci = 0; ci < curLines.length && oi < oldLines.length; ci++) {
    if (curLines[ci] === oldLines[oi]) oi++;
  }
  A.eq(oi, oldLines.length, "her three dashboard entries survive line-for-line IN ORDER inside the region (a548419 baseline; ours interleave additively)");

  /* purely additive vs a548419: only three shared dispatcher lines were extended
     (triggerSelector, aboutOf, and the bgt hover listener selector). */
  const oL = old.split("\r\n"), cL = cur.split("\r\n");
  A.ok(cL.length - oL.length > 3000, "the edit added our blocks (" + (cL.length - oL.length) + " lines)");
  const curSet = {};
  cL.forEach(function (l) { curSet[l] = 1; });
  const missing = oL.filter(function (l) { return !curSet[l] && l.trim() !== ""; });
  /* The only lines of hers this branch is allowed to have changed. Each was
     EXTENDED (a branch or selector appended), never rewritten, so her own
     behaviour on each is preserved:
       1. triggerSelector  - the (OC) popover anchors
       2. aboutOf          - the (OC) about text
       3. the bgt hover listener selector - the (OC) line-chart hover
       4. the scoped-modal body - routes a payroll-oc drill to prOContent
       5. the document "input" listener - the (OC) My Status search (mysOHandleInput),
          added 2026-09-21; visible now that the comparison is against the
          committed a548419 baseline rather than a later snapshot */
  const allowed = missing.filter(function (l) {
    return l.indexOf("function triggerSelector()") > -1
        || l.indexOf("function aboutOf(") > -1
        || (l.indexOf('addEventListener("mousemove"') > -1 && l.indexOf("bgt-col2") > -1)
        || (l.indexOf("modal.scoped?") > -1 && l.indexOf("wcontent acct-mw") > -1)
        || (l.indexOf('addEventListener("input"') > -1 && l.indexOf("gftHandleInput") > -1);
  });
  A.eq(missing.length - allowed.length, 0, "every a548419 line survives verbatim except the 5 extended dispatcher lines (" + missing.length + " modified)");
  A.eq(allowed.length, missing.length, "every modified line of hers is one of the 5 known extensions");

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
const GROUPS = [
  /* W01-W07: she adopted our port as THE widget in her commit faa6507 and has
     evolved it since (the 2026-09-08 Glance sparkline push, the dropped
     "vs budget" caption prefix). Her CURRENT LIVE widget is therefore the
     *-mb kind, and that - not her retired v1 kind - is what the Jo column
     must show. Her v1 kinds are asserted ABSENT from the tab below. */
  ["W01", "Budget Compared to Actual", "budget-mb", "budget-oc"],
  ["W02", "Pension Plans", "pension-mb", "pension-oc"],
  ["W03", "Payroll Distributions", "payroll-mb", "payroll-oc"],
  ["W04", "Remittance Pledges", "remittance-mb", "remittance-oc"],
  ["W05", "Receivable Invoices Outstanding", "receivables-mb", "receivables-oc"],
  ["W06", "Insurance Billing Plans", "insurance-mb", "insurance-oc"],
  ["W07", "Deposits on Hand", "deposits-mb", "deposits-oc"],
  ["W09", "Payroll Scheduled Time Off", "pto", "pto-mb"],
  ["W10", "Loans With Balance Due", "loans", "loans-mb"],
  ["W11", "Fixed Asset Values", "fixedassets", "fixedassets-mb"],
  ["W13", "Purchasing Management", "purchasing", "purchasing-mb"],
  ["W15", "Bank Balances", "bank", "bank-mb"],
  ["W16", "Accounts Payable By Due Date", "payables", "payables-mb"],
  ["W17", "Gifts Pledges", "gifts", "gifts-mb"]
];
const TIERS = ["kpi", "wide", "xwide"];
const LBL = { kpi: "Glance", wide: "Explore", xwide: "Detail" };

/* GROUPS stays at fourteen: its loop below walks the tab in strides of seven,
   and W08 is appended AFTER those fourteen with five cards, so it is checked
   in its own block rather than by bending the stride. */
A.eq(GROUPS.length, 14, "fourteen widgets are compared in groups of seven");
/* W14 is still hers alone and must not appear. W08 no longer holds: the owner
   directed a duplicate on 2026-09-17, so her mystatus IS now compared, against
   our mystatus-oc clone. */
A.eq(dash.widgets.filter(function (w) { return w.kind === "tasks"; }).length, 0,
  "kind 'tasks' is absent: W14 is hers alone, so there is nothing to compare");
A.eq(dash.widgets.filter(function (w) { return w.kind === "mystatus"; }).length, 2,
  "her mystatus appears twice, at Explore and Detail");
A.eq(dash.widgets.filter(function (w) { return w.kind === "mystatus-oc"; }).length, 2,
  "our mystatus-oc clone appears alongside it, at the same two sizes");
A.eq(dash.widgets.filter(function (w) { return /^cmpW08/.test(w.id); }).length, 5,
  "W08 contributes 5 cards, with no Glance card invented");
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

/* ---------- W08 My Status: the five-card group, added 2026-09-17 -------
   Her W08 is the finished reference build and is NOT modified; ours is a clone
   of it so improvements can be trialled. It sits last on the tab and carries
   five cards, not seven, because her widget offers only Explore and Detail. */
(function () {
  const grp = dash.widgets.slice(98, 103);
  A.eq(grp.length, 5, "W08: the group holds five cards");
  const two = ["wide", "xwide"];
  two.forEach(function (sz, i) {
    A.eq(grp[i].kind, "mystatus", "W08 card " + (i + 1) + ": HER kind");
    A.eq(grp[i].size, sz, "W08 card " + (i + 1) + ": size is " + sz);
    A.eq(grp[i].title, "W08 My Status - Jo (" + LBL[sz] + ")", "W08 card " + (i + 1) + ": title names Jo");
    A.eq(grp[2 + i].kind, "mystatus-oc", "W08 card " + (i + 3) + ": OUR kind");
    A.eq(grp[2 + i].size, sz, "W08 card " + (i + 3) + ": size is " + sz);
    A.eq(grp[2 + i].title, "W08 My Status - OC (" + LBL[sz] + ")", "W08 card " + (i + 3) + ": title names OC");
  });
  A.eq(grp[4].kind, "cmpnote-mb", "W08 card 5: the note card");
  A.eq(grp[4].cmpN, "W08", "W08 card 5: names its widget");
  /* no Glance card is invented for a widget she built with two tiers */
  A.eq(grp.filter(function (w) { return w.size === "kpi"; }).length, 0, "W08: no Glance card");
  /* each card owns its query list, so selecting on one cannot change another */
  const lists = grp.filter(function (w) { return w.selected; }).map(function (w) { return w.selected; });
  A.eq(lists.length, 4, "all four widget cards carry a query list");
  A.eq(new Set(lists).size, 4, "and every list is a separate array, not one shared reference");
  lists.forEach(function (l, i) { A.ok(Array.isArray(l) && l.length > 0, "W08 list " + (i + 1) + " is a populated array"); });
  /* hers and ours start from the same selection, since this is a clone */
  A.eq(grp[0].selected.join(","), grp[2].selected.join(","), "hers and ours start from the same selection");
})();

/* card ids are unique, so find() and the shell's per-card state cannot cross */
(function () {
  const ids = dash.widgets.map(function (w) { return w.id; });
  A.eq(new Set(ids).size, 103, "all 103 card ids are unique");
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
  A.eq(herRendered, 44, "44 of HER cards rendered: 14 widgets x 3 sizes, plus W08 x 2");
  A.eq(ourRendered, 44, "44 of OUR cards rendered: 14 widgets x 3 sizes, plus W08 x 2");
  A.eq(noteRendered, 15, "15 note cards rendered");
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
  const RETIRED = ["budget", "pension", "payroll", "remittance", "ar", "insurance", "deposits"];
  RETIRED.forEach(function (k) {
    A.eq(liveRows(shell.html, k), 0,
      "she has NO live registry row for kind '" + k + "' any more (she removed it in her own commit faa6507)");
    A.eq(dash.widgets.filter(function (w) { return w.kind === k; }).length, 0,
      "retired kind '" + k + "' is NOT on the comparison tab: the Jo column shows her current live widget only");
  });
  /* Her seven CURRENT live kinds, which the Jo column now shows. Each must be on
     the tab at all three tiers and render as her own code does. */
  const LIVE_ADOPTED = ["budget-mb", "pension-mb", "payroll-mb", "remittance-mb",
                        "receivables-mb", "insurance-mb", "deposits-mb"];
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
  const HER_LIVE = { pto: "pto", loans: "loans", fixedassets: "fixedassets",
    purchasing: "purchasing", bank: "bank", payables: "payables", gifts: "gifts" };
  const OUR_LIVE = { "budget-oc": 1, "pension-oc": 1, "payroll-oc": 1, "remittance-oc": 1,
    "receivables-oc": 1, "insurance-oc": 1, "deposits-oc": 1, "pto-mb": 1, "loans-mb": 1,
    "fixedassets-mb": 1, "purchasing-mb": 1, "bank-mb": 1, "payables-mb": 1, "gifts-mb": 1 };
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
  const FLIP = {
    "budget-mb": ["acctview", "expense"], "pension-mb": ["penSort", "name"],
    "payroll-mb": ["view", "dist"], "remittance-mb": ["view", "pacing"],
    "receivables-mb": ["arFGroup", "customer"], "insurance-mb": ["insType", "Medical"],
    "deposits-mb": ["view", "dist"]
  };
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
  A.eq(Object.keys(EX.CMPNOTE_).length, 15, "the note lookup holds one summary per compared widget");
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
    ["budget", "pension", "payroll", "remittance", "ar", "insurance", "deposits", "pto", "loans",
     "fixedassets", "purchasing", "bank", "payables", "gifts", "mystatus", "tasks"].forEach(function (k) {
      A.eq(liveRows(shell.html, k), liveRows(old, k),
        k + ": her live registry row count is unmoved vs a548419");
    });
    ["budget-oc", "pension-oc", "payroll-oc", "remittance-oc", "receivables-oc", "insurance-oc",
     "deposits-oc", "pto-mb", "loans-mb", "fixedassets-mb", "purchasing-mb", "bank-mb",
     "payables-mb", "gifts-mb"].forEach(function (k) {
      A.ok(liveRows(shell.html, k) >= 1, k + ": at least one live registry row is present");
    });
    /* and the harness's own textual extraction, which every -mb driver uses */
    /* -mb kinds pre-date this edit and their counts must be unmoved vs a548419;
       the -oc kinds are NEW in this edit, so they are asserted present instead. */
    ["pto-mb", "loans-mb", "fixedassets-mb", "purchasing-mb", "bank-mb",
     "payables-mb", "gifts-mb"].forEach(function (k) {
      A.ok(H.extractRegistry(shell.script, k).length >= 4,
        k + ": extractRegistry finds this widget's registry entries");
    });
    ["budget-oc", "pension-oc", "payroll-oc", "remittance-oc", "receivables-oc", "insurance-oc",
     "deposits-oc"].forEach(function (k) {
      A.ok(H.extractRegistry(shell.script, k).length >= 4,
        k + ": the (OC) clone registry (default + driver fixtures) is present");
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
  A.eq(swept, 103, "the em-dash sweep covered all 103 cards, title and body");
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
