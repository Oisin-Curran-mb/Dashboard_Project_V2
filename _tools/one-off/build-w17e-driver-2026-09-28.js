/* =====================================================================
   build-w17e-driver-2026-09-28.js

   Phase 6 of the W17 rebuild: bring the widget's own driver on to the
   rebuilt model. Everything it still asserts about the retired design is
   replaced with the contract the giving ledger actually carries.

   Anchored and CRLF-aware. Every anchor must appear exactly once or the
   script aborts before writing a byte.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "w17-gifts-mb.driver.js");
let s = fs.readFileSync(FILE, "utf8");
const NL = s.indexOf("\r\n") > -1 ? "\r\n" : "\n";
const fix = x => x.split("\n").join(NL);

function swap(a0, b0, n) {
  const a = fix(a0), b = fix(b0), want = n || 1;
  const got = s.split(a).length - 1;
  if (got !== want) throw new Error("anchor appeared " + got + " times, wanted " + want + ": " + a0.slice(0, 80));
  s = s.split(a).join(b);
}

/* -------------------------------------------------- 1. the header block */
swap(
  `     1  render at every tier, both views
     2  the retired donut: code present, genuinely unreachable
     3  the campaign filter NARROWS and does not highlight
     4  a bar click opens the top-5 most-behind modal
     5  a row expands the donor breakdown at 20 per page, totals invariant
     6  a pledge click expands its gifts
     7  ordering: bars closest-to-goal-first, drill most-behind-first,
        table in data order, and NO alphabetical sort anywhere`,
  `     1  render at every tier, both views
     2  the retired donut: code present, genuinely unreachable
     3  the purpose filter NARROWS and does not highlight
     4  a bar click opens the giving ledger, uncapped, filtered and
        searchable, and the type filter PARTITIONS the whole list
     5  a row expands the donor breakdown at 20 per page, totals invariant
     6  a pledge click expands its gifts, with media and motivation
     7  ordering: bars most-received-first, ledger largest-first, drill
        most-behind-first, table in data order, no alphabetical sort`
);
swap(
  `   Widget: Gifts Pledges (MB updated), kind "gifts-mb", prefix gpF / GPF_,`,
  `   Rebuilt 2026-09-28 on the owner's three rulings: the row unit is the
   PURPOSE, Received carries both pledge payments and other gifts, and
   every money figure obeys the date window. The invented per-row goal,
   its bands and the top-5 most-behind modal are gone.

   Widget: Gifts Pledges (MB updated), kind "gifts-mb", prefix gpF / GPF_,`
);

/* ------------------------------------- 2. a typing helper for the search */
swap(
  `/* A keydown whose target behaves like a real element:`,
  `/* Typing into the ledger search box. The block's listener reads the
   target's id and value and re-renders in place, so a plain bag is enough. */
function gtype(v) {
  const t = { id: "gpfLedgerQ", value: v, selectionStart: v.length,
    focus: function () {}, setSelectionRange: function () {} };
  (shim.listeners.input || []).forEach(function (fn) { fn({ target: t }); });
  return shim.captured["gpfModalRoot"] || "";
}
function grows(html) { return (html.match(/data-gpf="gopen"/g) || []).length; }

/* A keydown whose target behaves like a real element:`
);

/* --------------------------------------------- 3. the chip phrase, clean */
swap(
  `  A.contains(ctx.gpFRangePhrase(fresh("gpF")), "Gifts received through", "the default chip reads Gifts received through X");`,
  `  /* read the default phrase off a CLEAN widget: this block has just fired
     set-range custom, so the shared registry entry is no longer at default. */
  A.contains(ctx.gpFRangePhrase(Object.assign(fresh("gpF"), { gpFRange: "thru", gpFEnd: "2026-08-19" })),
    "Gifts received through", "the default chip reads Gifts received through X");`
);

/* ------------------------------------------ 4. the section-4 title line */
swap(
  `/* --------------------------------- 4. a bar click opens the top-5 modal */`,
  `/* ------------------------- 4. a bar click opens the giving ledger (28 Sep) */`
);

/* ------------------------- 5. the ledger contract, replacing the top-5 */
swap(
  `  /* at most five rows, and the note says so */
  const rows = (m.match(/data-gpf="gopen"/g) || []).length;
  A.ok(rows > 0 && rows <= 5, "the modal lists at most five donor pledges (got " + rows + ")");
  A.ok(/Showing (all \\d+ donor pledges? behind pace|the 5 furthest behind of \\d+ donor pledges behind pace)/.test(m),
    "the modal states how many of how many it is showing");
  /* every listed pledge really is behind pace */
  const camp = ctx.gpFCampByLabel(w, LABELS[2]);
  const behind = ctx.gpFDonorRows(w, camp).filter(function (it) { return it.p.dueRem > 0.005; });
  A.eq(rows, Math.min(5, behind.length), "the modal shows exactly min(5, behind count) rows");
  A.ok(behind.length > 5, "the fixture genuinely has more than five behind, so the cap is exercised");`,
  `  /* The ledger lists EVERYTHING that came in for the purpose. It replaced the
     top-5 most-behind modal, which duplicated W04 Remittance Pledges. */
  const purpose = ctx.gpFCampByLabel(w, LABELS[2]);
  const win = ctx.gpFWindow(w);
  const model = ctx.gpFLedgerRows(w, purpose, win);
  const rows = grows(m);
  A.eq(rows, model.length, "the ledger renders one row per entry, uncapped");
  A.ok(rows > 5, "the fixture gives the ledger more than a handful of entries (got " + rows + ")");
  A.contains(m, rows + " entries, largest first", "the note states the entry count");
  A.ok(model.every(function (it, i) { return i === 0 || model[i - 1].amount >= it.amount; }),
    "the ledger is ordered largest first");
  /* the two type filters PARTITION the unfiltered list: nothing lost, nothing counted twice */
  const pOnly = (function () {
    gfire("ledger-filter", { "data-id": "gpF", "data-v": "pledges" });
    const h = shim.captured["gpfModalRoot"];
    A.absent(h, "gpf-seg-other-tag", "the pledge-payments filter hides the other gifts");
    return grows(h);
  })();
  const gOnly = (function () {
    gfire("ledger-filter", { "data-id": "gpF", "data-v": "gifts" });
    const h = shim.captured["gpfModalRoot"];
    A.contains(h, "gpf-seg-other-tag", "the other-gifts filter tags every row as an other gift");
    A.contains(h, "gpf-muted", "and an other gift shows no pledged figure and no due remaining");
    A.absent(h, "handshake", "no pledge rows survive the other-gifts filter");
    return grows(h);
  })();
  A.ok(pOnly > 0 && gOnly > 0, "both sides of the split hold something");
  A.eq(pOnly + gOnly, rows, "the two filters partition the unfiltered ledger exactly");
  gfire("ledger-filter", { "data-id": "gpF", "data-v": "all" });
  A.eq(grows(shim.captured["gpfModalRoot"]), rows, "All restores every entry");
  /* the search box narrows in place, and says so when nothing matches */
  const term = String(model[0].donor).split(" ").pop().toLowerCase();
  const hit = grows(gtype(term));
  A.ok(hit > 0 && hit < rows, "a search term narrows the ledger (got " + hit + " of " + rows + ")");
  const miss = gtype("zzzznomatch");
  A.eq(grows(miss), 0, "a term matching nothing lists no rows");
  A.contains(miss, "Nothing matches", "and the ledger says so rather than going blank");
  A.eq(grows(gtype("")), rows, "clearing the search restores every entry");`
);

/* ----------------------------------------- 6. the roll-up, on the split */
swap(
  `  A.near(sumRec, comp.received, 0.02, "donor received rolls up to the campaign row");
  A.near(sumDue, comp.pledgeDue, 0.02, "donor pledge due rolls up to the campaign row");`,
  `  /* The drill lists PLEDGES, so it rolls up to the pledge-payments part of
     Received, not to Received itself, which now also carries other gifts. */
  A.near(sumRec, comp.fromPledges, 0.02, "donor received rolls up to the purpose's pledge payments");
  A.near(sumDue, comp.pledgeDue, 0.02, "donor pledge due rolls up to the purpose row");
  A.near(comp.fromPledges + comp.other, comp.received, 0.02,
    "and the two parts sum to Received, so the split is pinned from both ends");
  A.ok(comp.other > 0, "this purpose really does have other gifts, so the distinction is exercised");`
);

/* -------------------------------------- 7. the gift panel column names */
swap(
  `  ["Gift Date", "Amount", "Reference"].forEach(function (c) {
    A.contains(after, ">" + c + "<", "gift column: " + c);
  });`,
  `  ["Gift date", "Arrived by", "Prompted by", "Reference", "Amount"].forEach(function (c) {
    A.contains(after, ">" + c + "<", "gift column: " + c);
  });`
);

/* The file had picked up bare line feeds from earlier repair passes. Normalise
   the whole thing to CRLF, which is the house ending for every file here. */
let bare = 0;
for (let i = 0; i < s.length; i++) if (s[i] === "\n" && s[i - 1] !== "\r") bare++;
if (bare) s = s.replace(/\r?\n/g, "\r\n");
fs.writeFileSync(FILE, s);
console.log("w17 driver: header, ledger contract, roll-up split, gift columns"
  + (bare ? " (" + bare + " bare LF normalised to CRLF)" : ""));
