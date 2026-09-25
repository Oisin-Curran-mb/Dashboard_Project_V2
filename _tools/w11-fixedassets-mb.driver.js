/* =====================================================================
   w11-fixedassets-mb.driver.js

   Verifies the W11 Fixed Asset Values port (prefix faF, kind
   "fixedassets-mb") that was added to Jo's index.html on branch
   oisin-v2-rebuild against base 71ca056, 2026-09-08.

   Runs the REAL block, lifted verbatim out of index.html, inside the shared
   DOM shim, and drives the block's OWN delegated listeners. Nothing here
   reasons about the code: every claim is executed.

   What it proves:
     - both views render at every tier, and Detail renders exactly ONE view
     - the view toggle switches, and a stale view value falls back to the
       donut in BOTH the toggle's pressed state and the body
     - the measure chip is DONUT-ONLY, and the measure selection survives a
       trip through the table view
     - the grid pages 10 rows a page, the totals row totals the WHOLE group
       and does not move when the page does, and the page index is clamped
     - all SEVEN columns sort, money columns open descending, text columns
       ascending, re-click flips, and sorting returns to page 1
     - the empty / no-asset / state-not-specified frames render
     - the three account dimensions return no groups and render the
       placeholder with the controls still live
     - no Depreciation Method filter anywhere (invented, cut, must stay cut)
     - a no-em-dash sweep over every size x view x group x measure
     - every registry title carries the (OC convention

   Run from this folder:  node w11-fixedassets-mb.driver.js
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");

const END = "/* ===== end W11 Fixed Asset Values V2 ===== */";
const shell = H.loadShell();
const block = H.extractRegion(shell.script, "var FAF_ASSETS=[", END);
const registry = H.extractRegistry(shell.script, "fixedassets-mb");
const env = H.runBlock(block, { registry: registry, dataAttr: "data-faf" });
const c = env.ctx;
const A = new H.Assert("W11 fixedassets-mb");

/* ---------- helpers ---------------------------------------------------- */
const W = function (id) { return registry.filter(function (w) { return w.id === id; })[0]; };
const HTML = function (w) { return c.faFContent(w); };
/* a throwaway widget object, so a state probe cannot leak into the registry
   entries the later assertions read */
let probeSeq = 0;
function probe(over) {
  probeSeq++;
  const w = Object.assign({ id: "faFprobe" + probeSeq, size: "wide", state: "ready" }, over || {});
  registry.push(w);          /* so find(id) resolves it for the handlers */
  return w;
}
function cellTexts(html, cls) {
  const out = [];
  const re = new RegExp('<span class="' + cls + '"[^>]*>([\\s\\S]*?)</span>', "g");
  let m;
  while ((m = re.exec(html))) {
    /* the non-greedy capture stops at the icon's own </span>, so the glyph name
       is stripped by name rather than by markup */
    out.push(m[1].replace(/<[^>]*>/g, "")
      .replace(/\b(unfold_more|arrow_upward|arrow_downward)\b/g, "")
      .replace(/\s+/g, " ").trim());
  }
  return out;
}
function totalRow(html) {
  const i = html.indexOf("faf-totalrow");
  return i < 0 ? "" : html.slice(i, html.indexOf("</div>", html.lastIndexOf("</span>")) + 6);
}
function totalsCells(html) {
  const i = html.indexOf("faf-totalrow");
  if (i < 0) return [];
  return cellTexts(html.slice(i), "faf-c");
}
function rowTags(html) {
  /* data rows only: the head cells are columnheaders, the total is a rowheader */
  const out = [];
  const re = /<span class="faf-tag" role="cell">([^<]*)<\/span>/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
const DIMS = c.FAF_DIMS.map(function (d) { return d.k; });
const MEAS = c.FAF_MEASURES.map(function (m) { return m.k; });
const IMPL = c.FAF_DIMS.filter(function (d) { return d.impl; }).map(function (d) { return d.k; });
const DEAD = c.FAF_DIMS.filter(function (d) { return !d.impl; }).map(function (d) { return d.k; });

/* ---------- 0. shape: block, registry, CSS ---------------------------- */
A.eq(typeof c.faFContent, "function", "faFContent is the single entry point");
A.eq(c.FAF_ASSETS.length, 52, "the register carries the Final's 52 assets");
A.eq(c.FAF_PAGE_SIZE, 10, "page size is 10 rows, per owner instruction");
A.eq(c.FAF_SORTABLE.length, 7, "seven columns are on the sort whitelist");
A.eq(c.FAF_MEASURES.length, 5, "five financial measures");
A.eq(c.FAF_DIMS.length, 6, "six Group By dimensions are offered");
A.eq(IMPL.length, 3, "three dimensions are implemented (Class, Building, Room)");
A.eq(DEAD.length, 3, "three account dimensions are marked not on API");
A.eq(registry.length, 7, "seven registry variants");
registry.forEach(function (w) {
  A.contains(w.title, "(OC", "title carries the (OC convention: " + w.id);
  A.eq(w.kind, "fixedassets-mb", "kind is fixedassets-mb: " + w.id);
  A.ok(w.tiers.indexOf("kpi") > -1 && w.tiers.indexOf("wide") > -1 && w.tiers.indexOf("xwide") > -1,
    "all three tiers offered: " + w.id);
});
A.cssDeclares(shell.css, ["faf-root", "faf-w", "faf-pop", "faf-chiprow", "faf-chip-dead", "faf-vtoggle",
  "faf-body", "faf-hd-right", "faf-dl", "faf-tblwrap", "faf-tscroll", "faf-tbl", "faf-rowgroup",
  "faf-arow", "faf-tag", "faf-nm", "faf-c", "faf-totalrow", "faf-zero", "faf-zerotag", "faf-pager",
  "faf-pgcount", "faf-pgnum", "faf-pie", "faf-leg", "faf-seg", "faf-note", "faf-chart-empty",
  "faf-mi-dead", "faf-mi-tag", "faf-kpi-none"], "W11 CSS classes declared");
/* the pager button class is markup-only in the CSS block's own comment, so it
   is asserted as markup rather than as a declared rule */
A.contains(shell.script, 'class="iconbtn faf-pgbtn"', "pager buttons reuse the shell's .iconbtn");

/* ---------- 1. both views render at every tier ----------------------- */
["kpi", "wide", "xwide"].forEach(function (sz) {
  ["assets", "donut"].forEach(function (v) {
    const w = probe({ size: sz, faFView: v });
    const h = HTML(w);
    A.ok(h.length > 200, "renders at " + sz + " in view " + v);
    A.contains(h, 'class="faf-root faf-w"', "root wrapper at " + sz + "/" + v);
    A.contains(h, 'data-tier="' + (sz === "kpi" ? "kpi" : sz) + '"', "tier attribute at " + sz + "/" + v);
    if (sz === "kpi") {
      /* Glance is ONE figure, org-wide Net Value, and ignores the selections */
      A.contains(h, "Total Net Value, all fixed assets, organisation wide", "Glance context line at " + v);
      A.contains(h, "bank-pill", "Glance asset-count pill at " + v);
      A.absent(h, "vtoggle", "no view toggle at Glance in view " + v);
      A.absent(h, "filter-chip", "no filter chips at Glance in view " + v);
      A.absent(h, 'data-faf="download"', "no download at Glance in view " + v);
    } else {
      A.contains(h, "vtoggle", "view toggle present at " + sz + "/" + v);
      A.contains(h, 'data-faf="download"', "download present at " + sz + "/" + v);
      if (v === "assets") {
        A.contains(h, 'role="table"', "asset table renders at " + sz);
        A.contains(h, "faf-totalrow", "totals row renders at " + sz);
        A.absent(h, "faf-pie", "the donut is NOT also rendered at " + sz + " (one view, full width)");
      } else {
        A.contains(h, "faf-pie", "donut renders at " + sz);
        A.absent(h, 'role="table"', "the table is NOT also rendered at " + sz + " (one view, full width)");
      }
    }
  });
});
/* Glance ignores all three selections: the figure cannot move */
(function () {
  const base = HTML(probe({ size: "kpi" }));
  const other = HTML(probe({ size: "kpi", faFDim: "room", faFGroup: "Kitchen", faFMeasure: "cost" }));
  A.same(base, other, "Glance ignores Group By, Specific Group and Financial Measure");
})();
/* Detail differs from Explore only in the room it has: same view, same content shape */
(function () {
  const wide = HTML(probe({ size: "wide", faFView: "donut" }));
  const xw = HTML(probe({ size: "xwide", faFView: "donut" }));
  /* 2026-09-21: these were backwards. Explore, with less room, drew 320 while
     Detail drew 240 and left the card part empty. Now the tier with the room
     gets the bigger chart, which is the point of the assertion. */
  A.contains(wide, 'width="260"', "donut is 260 at Explore");
  A.contains(xw, 'width="340"', "donut is 340 at Detail");
  const dsW = Number(/width="(\d+)"/.exec(wide)[1]), dsX = Number(/width="(\d+)"/.exec(xw)[1]);
  A.ok(dsX > dsW, "the tier with more room draws the LARGER donut (" + dsX + " > " + dsW + ")");
  A.eq((xw.match(/faf-pie/g) || []).length, (wide.match(/faf-pie/g) || []).length,
    "Detail renders exactly one donut, same as Explore");
})();
/* the hidden small slot safe-falls-back to Explore */
A.eq(c.faFTier({ size: "small" }), "wide", "an unexpected size falls back to the Explore tier");
A.eq(c.faFTier({ size: "large" }), "xwide", "legacy large maps to the Detail tier");

/* ---------- 2. view toggle + stale-view fallback ---------------------- */
(function () {
  const w = probe({ size: "wide" });
  A.eq(c.faFViewK(w), "assets", "BUILT default view is the Asset Detail table (doc conflict carried, not resolved)");
  const before = HTML(w);
  env.shim.fire("view", { "data-id": w.id, "data-v": "donut" });
  A.eq(w.faFView, "donut", "view toggle sets state to donut");
  const after = HTML(w);
  A.changed(before, after, "view toggle changes the rendered output");
  A.contains(after, "faf-pie", "donut is rendered after the toggle");
  env.shim.fire("view", { "data-id": w.id, "data-v": "assets" });
  A.eq(w.faFView, "assets", "view toggle switches back to the table");
  A.contains(HTML(w), 'role="table"', "table is rendered after switching back");
  /* pressed state tracks the view */
  const dh = HTML(probe({ size: "wide", faFView: "donut" }));
  A.contains(dh, 'data-v="donut" aria-pressed="true"', "Donut segment is pressed in the donut view");
  A.contains(dh, 'data-v="assets" aria-pressed="false"', "Asset Detail segment is not pressed in the donut view");
  /* STALE VIEW: 'bars' was removed 2026-09-03. Body AND toggle must agree. */
  const stale = probe({ size: "wide", faFView: "bars" });
  A.eq(c.faFViewK(stale), "donut", "a stale 'bars' view falls back to the donut");
  const sh = HTML(stale);
  A.contains(sh, "faf-pie", "stale view renders the donut body");
  A.absent(sh, 'role="table"', "stale view does not render the table body");
  A.contains(sh, 'data-v="donut" aria-pressed="true"', "stale view shows the Donut segment pressed, so toggle and body agree");
  A.eq((sh.match(/aria-pressed="true"/g) || []).length, 1, "exactly one segment is pressed under a stale view");
  const staleX = HTML(probe({ size: "xwide", faFView: "bars" }));
  A.contains(staleX, 'data-v="donut" aria-pressed="true"', "stale-view fallback holds at Detail too");
})();

/* ---------- 3. measure chip is DONUT-ONLY ---------------------------- */
(function () {
  ["wide", "xwide"].forEach(function (sz) {
    const t = HTML(probe({ size: sz, faFView: "assets" }));
    A.absent(t, 'data-faf="measure"', "no measure chip in the table view at " + sz);
    A.contains(t, 'data-faf="dim"', "Group by chip stays in the table view at " + sz);
    A.contains(t, 'data-faf="group"', "Specific group chip stays in the table view at " + sz);
    A.eq((t.match(/class="filter-chip/g) || []).length, 2, "exactly two chips in the table view at " + sz);
    const d = HTML(probe({ size: sz, faFView: "donut" }));
    A.contains(d, 'data-faf="measure"', "measure chip appears in the donut view at " + sz);
    A.eq((d.match(/class="filter-chip/g) || []).length, 3, "exactly three chips in the donut view at " + sz);
  });
  /* the selection PERSISTS through a trip via the table and takes effect again */
  const w = probe({ size: "wide", faFView: "donut", faFMeasure: "cost" });
  env.shim.fire("view", { "data-id": w.id, "data-v": "assets" });
  A.eq(w.faFMeasure, "cost", "the measure selection is not reset by the table view");
  env.shim.fire("view", { "data-id": w.id, "data-v": "donut" });
  /* the measure chip got its FULL label back on 2026-09-21 when it moved to
     its own line: width stopped being the constraint there. The two DIMENSION
     chips stay value-only, because they still share the header row. */
  const back = HTML(w);
  A.contains(back, "Financial Measure: Cost", "the measure chip carries its full label");
  /* the wording gained "for the chart" when the chip moved into the legend */
  A.contains(back, "Financial measure for the chart, currently Cost", "the label survives in the accessible name");
  /* and it does nothing to the table's own output. ONE widget, so the only
     thing differing between the two renders is the measure. */
/* 2026-09-21: these assertions describe the FULL seven column table, which
   now lives at Detail and in the pop-up. Explore shows a slim four column
   table, so the probes moved to xwide. The slim shape has its own section. */
  const t = probe({ size: "xwide", faFView: "assets", faFMeasure: "cap" });
  const t1 = HTML(t);
  t.faFMeasure = "accum";
  A.same(t1, HTML(t), "the measure selection cannot change the table (all five are columns)");
  /* fixed canonical column order, no lead marking */
  const heads = cellTexts(HTML(probe({ size: "xwide" })), "faf-c");
  A.eq(heads.slice(0, 5).join("|"), "Capitalized|Cost|Depreciable|Accumulated|Net",
    "table columns are in fixed canonical measure order");
  /* and the order does not follow the measure, which is the whole point */
  const ho = cellTexts(HTML(probe({ size: "xwide", faFMeasure: "accum" })), "faf-c");
  A.eq(ho.slice(0, 5).join("|"), "Capitalized|Cost|Depreciable|Accumulated|Net",
    "column order does not follow the (hidden) measure selection");
  ["faf-c-lead", "faf-lead-tag", ">selected<", "faf-emph", "fa-emph"].forEach(function (s) {
    A.absent(HTML(probe({ size: "xwide", faFMeasure: "cost" })), s,
      "no lead-column marking in the table: " + s);
  });
})();

/* ---------- 4. server paging: 10 a page, totals over the whole group -- */
(function () {
  const w = probe({ size: "xwide", faFDim: "cls" });   /* full table: rowTags reads the tag cell */
  const g = c.faFCurrentGroup(w);
  const q0 = c.faFServerQuery(w);
  A.ok(q0.totalCount > c.FAF_PAGE_SIZE, "the default group has more assets than one page (" + q0.totalCount + " in " + g + ")");
  A.eq(q0.rows.length, c.FAF_PAGE_SIZE, "page 1 serves exactly 10 rows");
  A.eq(q0.pageIndex, 0, "page 1 is the page served");
  A.eq(q0.pageCount, Math.ceil(q0.totalCount / 10), "page count is derived from the whole group");
  const h0 = HTML(w);
  A.eq(rowTags(h0).length, 10, "page 1 renders 10 asset rows");
  A.contains(h0, "faf-pager", "the pager renders when the group exceeds one page");
  A.contains(h0, "1 to 10 of " + q0.totalCount, "the pager count names the whole group");
  A.contains(h0, "Page 1 of " + q0.pageCount, "the pager states which page of how many");
  const totals0 = totalsCells(h0);
  A.eq(totals0.length, 5, "the totals row carries all five measure totals");
  A.contains(totalRow(h0), q0.totalCount + " assets", "the totals row counts the whole group, not the page");

  env.shim.fire("page-next", { "data-id": w.id });
  const q1 = c.faFServerQuery(w);
  const h1 = HTML(w);
  A.eq(q1.pageIndex, 1, "Next serves page 2");
  A.changed(h0, h1, "paging changes the rendered rows");
  A.ok(rowTags(h1).length > 0 && rowTags(h1).length <= 10, "page 2 serves at most 10 rows");
  A.eq(rowTags(h0).filter(function (t) { return rowTags(h1).indexOf(t) > -1; }).length, 0,
    "no asset appears on both pages (the unique tag tiebreaker holds)");
  A.eq(totalsCells(h1).join("|"), totals0.join("|"), "THE TOTALS ROW DOES NOT MOVE WHEN THE PAGE DOES");
  A.contains(totalRow(h1), q1.totalCount + " assets", "the totals row still counts the whole group on page 2");
  A.eq(q1.totalCount, q0.totalCount, "totalCount is the whole group, unaffected by paging");

  env.shim.fire("page-prev", { "data-id": w.id });
  A.eq(c.faFServerQuery(w).pageIndex, 0, "Previous returns to page 1");
  A.eq(totalsCells(HTML(w)).join("|"), totals0.join("|"), "totals are identical again on page 1");

  /* the donut never pages at all */
  const dw = probe({ size: "wide", faFView: "donut", faFDim: "cls" });
  const d0 = HTML(dw);
  dw.faFPage = 3;
  A.same(d0, HTML(dw), "the donut never pages");

  /* clamping: a page index past the end cannot strand the view */
  const cl = probe({ size: "wide", faFDim: "cls", faFPage: 99 });
  const qc = c.faFServerQuery(cl);
  A.eq(qc.pageIndex, qc.pageCount - 1, "a page index past the end is clamped to the last page");
  A.ok(qc.rows.length > 0, "the clamped page still serves rows");
  A.eq(qc.totalCount, q0.totalCount, "clamping does not change the group total");
  const cn = probe({ size: "wide", faFDim: "cls", faFPage: -5 });
  A.eq(c.faFServerQuery(cn).pageIndex, 0, "a negative page index is clamped to the first page");
  /* Next on the last page is disabled and cannot advance */
  const last = probe({ size: "wide", faFDim: "cls", faFPage: qc.pageCount - 1 });
  A.contains(HTML(last), "disabled", "the pager disables the control at the end of the set");
  env.shim.fire("page-next", { "data-id": last.id });
  A.eq(c.faFServerQuery(last).pageIndex, qc.pageCount - 1, "Next cannot advance past the last page");
  /* a group that fits on one page shows no pager */
  const small = probe({ size: "wide", faFDim: "cls", faFGroup: "Vehicles" });
  A.ok(c.faFServerQuery(small).totalCount <= 10, "Vehicles fits on one page");
  A.absent(HTML(small), "faf-pager", "no pager when the group fits on one page");
})();

/* ---------- 5. all seven columns sort ------------------------------- */
(function () {
  const MONEY = ["cap", "cost", "depr", "accum", "net"];
  c.FAF_SORTABLE.forEach(function (k) {
    /* start ordered by a DIFFERENT column, so the click really is a first
       click on k. The widget's own default is tag-asc, so a click on Tag #
       from the default state correctly flips rather than opening. */
    const w = probe({ size: "xwide", faFDim: "cls", faFPage: 1, faFSort: (k === "nm" ? "tag-asc" : "nm-asc") });
    const before = HTML(w);
    env.shim.fire("sort", { "data-id": w.id, "data-k": k });
    const wantFirst = MONEY.indexOf(k) > -1 ? "desc" : "asc";
    A.eq(w.faFSort, k + "-" + wantFirst,
      "column " + k + " opens " + wantFirst + " on first click");
    A.eq(w.faFPage, 0, "sorting column " + k + " returns to page 1");
    const after = HTML(w);
    A.changed(before, after, "sorting column " + k + " changes the rendered page");
    A.contains(after, 'aria-sort="' + (wantFirst === "asc" ? "ascending" : "descending") + '"',
      "aria-sort reflects the real state for " + k);
    /* re-click flips */
    env.shim.fire("sort", { "data-id": w.id, "data-k": k });
    A.eq(w.faFSort, k + "-" + (wantFirst === "asc" ? "desc" : "asc"),
      "re-clicking column " + k + " flips the direction");
    /* the ordering is real */
    const q = c.faFServerQuery(w);
    if (MONEY.indexOf(k) > -1) {
      const vals = q.rows.map(function (a) { return c.faFValue(a, k); });
      const asc = w.faFSort.split("-")[1] === "asc";
      let ok = true;
      for (let i = 1; i < vals.length; i++) if (asc ? vals[i] < vals[i - 1] : vals[i] > vals[i - 1]) ok = false;
      A.ok(ok, "rows really are ordered by " + k + " " + w.faFSort.split("-")[1]);
    }
    /* and the totals are untouched by ordering */
    A.eq(c.faFServerQuery(w).totalCount, q.totalCount, "sorting does not change the group total for " + k);
  });
  /* the DEFAULT sort is Tag # ascending (proposed only, never confirmed against
     the old design: Step 4 Sign-off Readiness row 1). Clicking the already
     active default column therefore flips it rather than opening it. */
  const dflt = probe({ size: "xwide" });
  A.eq(c.faFSortK(dflt), "tag-asc", "the default sort is Tag # ascending, as built");
  A.contains(HTML(dflt), 'aria-sort="ascending"', "the default sort is reported to a reader");
  env.shim.fire("sort", { "data-id": dflt.id, "data-k": "tag" });
  A.eq(dflt.faFSort, "tag-desc", "clicking the active default column flips it to descending");
  /* every column carries a sort control and a real aria-sort */
  const h = HTML(probe({ size: "xwide" }));
  A.eq((h.match(/data-faf="sort"/g) || []).length, 7, "seven sort controls, one per column");
  A.eq((h.match(/role="columnheader"/g) || []).length, 7, "seven column headers");
  A.eq((h.match(/aria-sort="none"/g) || []).length, 6, "six columns report aria-sort none while one orders the table");
  /* a non-whitelisted sort key falls back to tag, as the API's whitelist must */
  const bad = probe({ size: "wide", faFSort: "salvage-desc" });
  A.eq(c.faFServerQuery(bad).rows[0].tag, c.faFServerQuery(probe({ size: "wide", faFSort: "tag-desc" })).rows[0].tag,
    "a non-whitelisted sortBy falls back to the tag order");
})();

/* ---------- 6. table semantics + shortened figures ------------------ */
(function () {
  const w = probe({ size: "xwide" });
  const h = HTML(w);
  const q = c.faFServerQuery(w);
  A.contains(h, 'aria-colcount="7"', "aria-colcount is 7 in the full table");
  A.contains(h, 'aria-rowcount="' + (q.totalCount + 2) + '"', "aria-rowcount counts the whole group plus head and total");
  A.eq((h.match(/role="rowgroup"/g) || []).length, 3, "three rowgroups");
  A.contains(h, 'role="rowheader"', "the totals row uses a rowheader");
  /* every shortened figure carries the exact figure in title AND aria-label */
  const cells = (h.match(/<span class="faf-c" role="cell"[^>]*>/g) || []);
  A.ok(cells.length > 0, "money cells render");
  A.eq(cells.filter(function (s) { return s.indexOf("title=") > -1 && s.indexOf("aria-label=") > -1; }).length,
    cells.length, "every money cell carries the exact figure in title and aria-label");
  /* the fully depreciated marker is a word, not colour alone */
  const zw = probe({ size: "wide", faFDim: "cls", faFGroup: "Buildings" });
  const zh = HTML(zw);
  A.contains(zh, "faf-zero", "a zero Net Value row is marked");
  A.contains(zh, "fully depreciated", "the zero marker is text, not colour alone");
  /* net value maths: base is Depreciable Value, not Cost */
  const a = c.FAF_ASSETS.filter(function (x) { return x.tag === "FA-1014"; })[0];
  A.eq(c.faFValue(a, "depr"), a.cost - a.salv, "Depreciable Value is Cost minus Salvage");
  A.eq(c.faFValue(a, "net"), (a.cost - a.salv) - a.dep, "Net Value's base is Depreciable Value, NOT Cost");
  A.eq(c.faFValue(a, "accum"), a.dep, "Accumulated Depreciation is the book figure (tax excluded by definition)");
})();

/* ---------- 7. group list, not-assigned, zero-value groups ---------- */
(function () {
  IMPL.forEach(function (dk) {
    const w = probe({ size: "wide", faFDim: dk });
    const names = c.faFGroupNames(w);
    A.ok(names.length > 0, "dimension " + dk + " returns groups");
    if (names.indexOf(c.FAF_NA) > -1) {
      A.eq(names[names.length - 1], c.FAF_NA, "'not assigned' is sorted last in " + dk);
      const nw = probe({ size: "wide", faFDim: dk, faFGroup: c.FAF_NA });
      A.ok(c.faFServerQuery(nw).totalCount > 0, "'not assigned' is a real selectable group in " + dk);
    }
    /* a stale group that does not exist in this dimension falls back to the first */
    const st = probe({ size: "wide", faFDim: dk, faFGroup: "no such group" });
    A.eq(c.faFCurrentGroup(st), names[0], "a stale group falls back to the first group in " + dk);
    /* no "All groups" option: the table always shows exactly one group */
    A.absent(HTML(w), "All groups", "no All groups option in " + dk);
  });
  /* THE ZERO-GROUP RULE. Finding, 2026-09-08: the Final's shipped 52-asset
     register produces NO group that totals zero for ANY dimension and measure,
     even though nine individual assets have a zero Net Value. So on the shipped
     data the exclusion note never appears. That is a property of illustrative
     mock data (Rule 11), not a port defect, and the port must NOT gain invented
     rows to make the note fire. It is carried in the manifest and the diff doc.
     The rule itself is verified against a temporary fixture instead, then the
     shipped register is checked for the opposite failure: a note that fires
     when nothing is actually excluded. */
  let shippedZero = 0;
  IMPL.forEach(function (dk) {
    MEAS.forEach(function (mk) {
      const w = probe({ size: "wide", faFDim: dk, faFMeasure: mk, faFView: "donut" });
      if (c.faFChartRows(w).zero.length) shippedZero++;
      else A.absent(HTML(w), "faf-note", "no excluded-group note when nothing is excluded: " + dk + "/" + mk);
    });
  });
  A.eq(shippedZero, 0, "FINDING: the shipped register has no zero-total group in any dimension or measure");
  (function () {
    const real = c.FAF_ASSETS;
    /* one group whose Net Value genuinely totals zero, one that does not */
    c.FAF_ASSETS = [
      { tag: "ZZ-01", nm: "Spent Asset", cls: "Spent", bldg: "B1", room: "R1", cap: 100, cost: 100, salv: 0, dep: 100 },
      { tag: "ZZ-02", nm: "Live Asset", cls: "Live", bldg: "B1", room: "R2", cap: 900, cost: 900, salv: 0, dep: 200 }
    ];
    try {
      const w = probe({ size: "wide", faFDim: "cls", faFMeasure: "net", faFView: "donut" });
      const rows = c.faFChartRows(w);
      A.eq(rows.zero.length, 1, "fixture: exactly one group totals zero for Net Value");
      A.eq(rows.charted.length, 1, "fixture: the zero group is EXCLUDED from the chart");
      const h = HTML(w);
      A.contains(h, "faf-note", "fixture: the excluded-group note renders");
      A.contains(h, "Spent", "fixture: the note NAMES the excluded group");
      A.contains(h, "excluded from the chart", "fixture: the note says it is excluded from the chart");
      A.contains(h, "still appears in the asset table", "fixture: the note says the table keeps it");
      /* the TABLE is not filtered that way: the zero group is still selectable */
      A.ok(c.faFGroupNames(w).indexOf("Spent") > -1, "fixture: the zero group is still in the group list");
      const tw = probe({ size: "wide", faFDim: "cls", faFMeasure: "net", faFGroup: "Spent" });
      A.eq(c.faFServerQuery(tw).totalCount, 1, "fixture: the zero group still lists its assets in the table");
      A.contains(HTML(tw), "ZZ-01", "fixture: the zero group's asset really renders");
      /* and a dimension where EVERY group totals zero falls to the chart-empty frame */
      c.FAF_ASSETS = [{ tag: "ZZ-03", nm: "All Spent", cls: "Spent", bldg: "B1", room: "R1", cap: 10, cost: 10, salv: 0, dep: 10 }];
      const ew = probe({ size: "wide", faFDim: "cls", faFMeasure: "net", faFView: "donut" });
      const eh = HTML(ew);
      A.contains(eh, "faf-chart-empty", "fixture: nothing chartable falls to the chart-empty frame");
      A.contains(eh, "has a Net Value to chart", "fixture: the chart-empty frame names the measure");
      A.contains(eh, "faf-note", "fixture: the chart-empty frame still names the excluded groups");
      A.noEmDash(eh, "fixture: the chart-empty frame");
    } finally {
      c.FAF_ASSETS = real;
    }
    A.eq(c.FAF_ASSETS.length, 52, "the shipped register is restored after the fixture");
  })();
  /* charted groups are ordered largest share first, on the amethyst ramp only */
  const cw = probe({ size: "wide", faFView: "donut", faFDim: "cls", faFMeasure: "net" });
  const cr = c.faFChartRows(cw);
  let ordered = true;
  for (let i = 1; i < cr.charted.length; i++) if (Math.abs(cr.charted[i].total) > Math.abs(cr.charted[i - 1].total)) ordered = false;
  A.ok(ordered, "donut arcs are ordered largest share first");
  const dh = HTML(cw);
  A.contains(dh, "var(--am-600)", "the darkest amethyst leads the ramp");
  A.absent(dh, "--red-100", "no red on the arcs");
  A.contains(dh, 'role="img"', "the donut carries role=img");
  A.contains(dh, "aria-label=", "the donut carries a summary aria-label");
  A.eq((dh.match(/<title>/g) || []).length, cr.charted.length, "every arc carries a title with its own figures");
  A.eq((dh.match(/class="leg faf-leg"/g) || []).length, cr.charted.length, "every charted group has a legend row");
  A.contains(dh, "donut-c1", "the centre total renders");
  /* view-only: no click affordance anywhere in either view */
  ["assets", "donut"].forEach(function (v) {
    const h = HTML(probe({ size: "xwide", faFView: v }));
    A.absent(h, 'role="button"', "no row or arc is a button in view " + v);
    A.absent(h, "data-faf=\"open", "no drill action in view " + v);
  });
})();

/* ---------- 8. the three account dimensions return nothing ---------- */
(function () {
  DEAD.forEach(function (dk) {
    const w = probe({ size: "wide", faFDim: dk });
    A.eq(c.faFGroupNames(w).length, 0, "dimension " + dk + " returns an empty group list");
    A.eq(c.faFCurrentGroup(w), null, "dimension " + dk + " has no current group");
    const q = c.faFServerQuery(w);
    A.eq(q.totalCount, 0, "dimension " + dk + " serves a well-formed zero response");
    A.eq(q.rows.length, 0, "dimension " + dk + " serves no rows");
    ["assets", "donut"].forEach(function (v) {
      const h = HTML(probe({ size: "wide", faFDim: dk, faFView: v }));
      A.contains(h, "No groups returned for", "placeholder frame renders for " + dk + " in view " + v);
      A.contains(h, 'data-faf="dim"', "the Group by chip stays live for " + dk + " in view " + v);
      A.contains(h, "faf-chip-dead", "the Specific group chip is marked inert for " + dk + " in view " + v);
      A.absent(h, 'role="table"', "no invented table for " + dk + " in view " + v);
      A.absent(h, "$", "no invented figure for " + dk + " in view " + v);
    });
    const hx = HTML(probe({ size: "xwide", faFDim: dk }));
    A.contains(hx, "No groups returned for", "placeholder frame renders at Detail for " + dk);
  });
  /* the menu marks them rather than silently offering them */
  const w = probe({ size: "wide" });
  env.shim.fire("dim", { "data-id": w.id });
  const menu = env.shim.captured.fafPop || "";
  A.contains(menu, "Group by", "the Group by menu opens");
  A.eq((menu.match(/not on API/g) || []).length, 3, "three dimensions are marked 'not on API' in the menu");
  A.eq((menu.match(/faf-mi-dead/g) || []).length, 3, "three menu rows are marked inert");
  A.eq((menu.match(/role="option"/g) || []).length, 6, "all six dimensions are offered");
  A.contains(menu, 'aria-selected="true"', "the current dimension is marked selected");
  /* picking a dimension RESETS the specific group and the page */
  const w2 = probe({ size: "wide", faFDim: "cls", faFGroup: "Vehicles", faFPage: 1 });
  env.shim.fire("set-dim", { "data-id": w2.id, "data-v": "room" });
  A.eq(w2.faFDim, "room", "the dimension changes");
  A.eq(w2.faFGroup, null, "THE RESET: the specific group is cleared, never carried into the new dimension");
  A.eq(w2.faFPage, 0, "the table returns to page 1 after a dimension change");
  /* the account-dimension menu's group popover says so rather than inventing rows */
  const w3 = probe({ size: "wide", faFDim: "acctExp" });
  env.shim.fire("group", { "data-id": w3.id });
  A.contains(env.shim.captured.fafPop || "", "No groups returned for this dimension",
    "the group menu says why it is empty for an unimplemented dimension");
})();

/* ---------- 9. the popovers, and Escape --------------------------- */
(function () {
  const w = probe({ size: "wide", faFView: "donut" });
  env.shim.fire("group", { "data-id": w.id });
  let menu = env.shim.captured.fafPop || "";
  A.contains(menu, "Specific group", "the Specific group menu opens");
  A.eq((menu.match(/role="option"/g) || []).length, c.faFGroupNames(w).length, "every group is offered");
  A.contains(HTML(w), 'aria-expanded="true"', "the open chip reports aria-expanded true");
  env.shim.fire("set-group", { "data-id": w.id, "data-v": "Vehicles" });
  A.eq(w.faFGroup, "Vehicles", "picking a group sets it");
  A.eq(w.faFPage, 0, "picking a group returns to page 1");
  A.eq(c.FAF_POP, null, "picking a group closes the popover");
  env.shim.fire("measure", { "data-id": w.id });
  menu = env.shim.captured.fafPop || "";
  A.contains(menu, "Financial measure", "the measure menu opens");
  A.eq((menu.match(/role="option"/g) || []).length, 5, "all five measures are offered");
  env.shim.fire("measure", { "data-id": w.id });
  A.eq(c.FAF_POP, null, "clicking the same chip again closes the popover");
  env.shim.fire("dim", { "data-id": w.id });
  A.ok(c.FAF_POP !== null, "a popover is open before the Escape test");
  env.shim.fireKey("Escape");
  A.eq(c.FAF_POP, null, "Escape closes the popover");
  env.shim.fire("dim", { "data-id": w.id });
  env.shim.fireOutside();
  A.eq(c.FAF_POP, null, "an outside click closes the popover");
  /* each popover is listbox-shaped */
  A.contains(shell.script, "el.setAttribute('role','listbox')", "the popover is a listbox");
  /* two widgets cannot share one popover state */
  const a1 = probe({ size: "wide" }), a2 = probe({ size: "wide" });
  env.shim.fire("dim", { "data-id": a1.id });
  A.contains(HTML(a1), 'aria-expanded="true"', "the owning widget reports its chip as open");
  A.contains(HTML(a2), 'aria-expanded="false"', "another widget's chip stays closed");
  env.shim.fireKey("Escape");
})();

/* ---------- 10. empty and unspecified states ---------------------- */
(function () {
  /* explicit flag */
  const e1 = HTML(W("faF4"));
  A.contains(e1, "No fixed assets", "the state:empty variant renders the no-assets frame");
  A.contains(e1, 'data-kind="empty"', "it is the shell's own empty state");
  A.absent(e1, 'role="table"', "no table in the empty state");
  A.absent(e1, "faf-pager", "no pager in the empty state");
  /* dataset route lands on the SAME state, which was the failure mode worth guarding */
  const e2 = HTML(probe({ size: "wide", dataset: "none" }));
  A.contains(e2, "No fixed assets", "an empty DATASET also lands on the no-assets frame");
  const e3 = HTML(probe({ size: "wide", dataset: "empty" }));
  A.contains(e3, "No fixed assets", "the 'empty' dataset alias lands there too");
  /* compact Glance variant */
  const e4 = HTML(probe({ size: "kpi", state: "empty" }));
  A.contains(e4, "No assets", "the Glance empty variant is compact");
  A.contains(e4, "no fixed asset records", "the Glance empty variant explains itself");
  A.absent(e4, "faf-pager", "no pager in the Glance empty variant");
  /* state not specified: one honest frame for the four undesigned states */
  const u = HTML(W("faF5"));
  A.contains(u, "State not specified", "the unspecified-state frame renders");
  A.contains(u, "no defined behaviour in any source", "the frame names the gap rather than inventing a design");
  A.absent(u, 'role="table"', "no table in the unspecified state");
  /* empty state at every tier */
  ["kpi", "wide", "xwide"].forEach(function (sz) {
    const h = HTML(probe({ size: sz, state: "empty" }));
    A.ok(h.length > 80, "the empty state renders at " + sz);
    A.noEmDash(h, "empty state at " + sz);
  });
  /* a group with no assets cannot happen through the UI, but the frame exists */
  A.contains(shell.script, "No assets in this group.", "an empty group renders a row saying so");
})();

/* ---------- 11. download ------------------------------------------ */
(function () {
  ["wide", "xwide"].forEach(function (sz) {
    ["assets", "donut"].forEach(function (v) {
      const h = HTML(probe({ size: sz, faFView: v }));
      /* 2026-09-21: no row of its own. It shares the header row with the view
         toggle, which is what reclaimed about 30px of card height. */
      A.absent(h, "faf-actionrow", "there is no separate download row at " + sz + "/" + v);
      A.contains(h, "faf-hd-right", "the header right group exists at " + sz + "/" + v);
      A.ok(h.indexOf('data-faf="download"') > h.indexOf("faf-hd-right") &&
           h.indexOf('data-faf="download"') < h.indexOf("faf-body"),
        "and the download sits inside it, above the body, at " + sz + "/" + v);
      A.contains(h, 'data-faf="download"', "the download control renders at " + sz + "/" + v);
      A.contains(h, 'aria-label="Download every measure at full precision"',
        "the icon-only download has an accessible name at " + sz + "/" + v);
      A.absent(h, ">Download<", "the download is icon only, with no label, at " + sz + "/" + v);
    });
  });
  const w = probe({ size: "wide" });
  const n = env.log.status.length;
  env.shim.fire("download", { "data-id": w.id });
  A.eq(env.log.status.length, n + 1, "the download control actually fires");
  A.contains(env.log.status[env.log.status.length - 1], "placeholder",
    "the download says it is a placeholder rather than claiming a file was produced");
  A.contains(env.log.status[env.log.status.length - 1], "full precision",
    "the download message states what it would carry");
})();

/* ---------- 12. the Depreciation Method filter must stay absent ---- */
(function () {
  const bad = ["Depreciation Method", "depreciation method", "Straight Line", "straight-line",
    "Declining Balance", "declining balance", "DepreciationMethod"];
  bad.forEach(function (s) {
    A.absent(block, s, "no " + JSON.stringify(s) + " anywhere in the W11 block (invented, cut, stays cut)");
  });
  /* and nothing that looks like a hardcoded depreciation multiplier */
  A.absent(block, "* 0.2", "no hardcoded depreciation multiplier");
  A.absent(block, "*1.5", "no hardcoded declining-balance factor");
  /* no time filter of any kind: this widget never had one */
  ["fiscal", "Fiscal", "This year", "Last 30", "date range", "From", "period"].forEach(function (s) {
    A.absent(block.replace(/\/\*[\s\S]*?\*\//g, ""), s, "no time filter token " + JSON.stringify(s) + " in live code");
  });
})();

/* ---------- 13. no-em-dash sweep: every size x view x group x measure */
(function () {
  let n = 0;
  ["kpi", "wide", "xwide"].forEach(function (sz) {
    ["assets", "donut", "bars"].forEach(function (v) {
      DIMS.forEach(function (dk) {
        const groups = c.faFGroupNames(probe({ size: sz, faFDim: dk })).concat([null]);
        groups.forEach(function (g) {
          MEAS.forEach(function (mk) {
            const w = probe({ size: sz, faFView: v, faFDim: dk, faFGroup: g, faFMeasure: mk });
            const h = HTML(w);
            n++;
            if (String(h).indexOf(H.EM_DASH) > -1) A.noEmDash(h, sz + "/" + v + "/" + dk + "/" + g + "/" + mk);
            /* paged states too */
            w.faFPage = 1;
            const h2 = HTML(w);
            n++;
            if (String(h2).indexOf(H.EM_DASH) > -1) A.noEmDash(h2, "page 2 " + sz + "/" + v + "/" + dk + "/" + g + "/" + mk);
          });
        });
      });
    });
  });
  A.ok(n > 500, "the em-dash sweep covered " + n + " rendered states");
  A.noEmDash(block, "the W11 code block itself");
  /* the popover contents too */
  const w = probe({ size: "wide", faFView: "donut" });
  ["dim", "group", "measure"].forEach(function (t) {
    env.shim.fire(t, { "data-id": w.id });
    A.noEmDash(env.shim.captured.fafPop || "", "the " + t + " popover");
    env.shim.fireKey("Escape");
  });
  /* and every state frame */
  [{ state: "empty" }, { state: "unspecified" }, { faFDim: "acctAsset" }, { dataset: "none" }].forEach(function (o) {
    ["kpi", "wide", "xwide"].forEach(function (sz) {
      A.noEmDash(HTML(probe(Object.assign({ size: sz }, o))), "state frame " + JSON.stringify(o) + " at " + sz);
    });
  });
  A.noEmDash(registry.map(function (w) { return w.title; }).join(" "), "the registry titles");
})();

/* ---------- 14. coexistence with Jo's own fixedassets widget -------- */
(function () {
  A.contains(shell.script, 'if(w.kind==="fixedassets")return faContent(w);',
    "Jo's own fixedassets dispatch is still in place");
  A.contains(shell.script, 'if(w.kind==="fixedassets-mb")return faFContent(w);',
    "our dispatch line is present");
  const iOurs = shell.script.indexOf('if(w.kind==="fixedassets-mb")return faFContent(w);');
  const iEmpty = shell.script.indexOf('if(w.state==="empty"){var ec=EMPTY_COPY[w.kind]');
  A.ok(iOurs > -1 && iEmpty > -1 && iOurs < iEmpty,
    "our dispatch sits BEFORE the generic empty fallback, so faF4 renders our own empty state");
  A.contains(shell.script, "b:FAF_ABOUT", "the info popover has our About body");
  /* Jo's own names are untouched and still reachable */
  ["faContent", "faTable", "faPie", "faPopContent", "faHandleClick", "faGroupOptions", "faSkeletonBody"]
    .forEach(function (n) {
      A.contains(shell.script, "function " + n + "(", "Jo's " + n + " is still declared");
    });
  ["FA_ASSETS", "FA_DIMS", "FA_MEASURES", "FA_CATALOG", "FA_PIE"].forEach(function (n) {
    A.contains(shell.script, "var " + n + "=", "Jo's " + n + " is still declared");
  });
  /* she declares these three on one line, so the whole declaration is checked */
  A.contains(shell.script, 'var FA_NA="__na",FA_ALL="__all",FA_NA_LABEL="Not assigned";',
    "Jo's FA_NA / FA_ALL / FA_NA_LABEL declaration is byte-intact");
  A.contains(shell.script, 'kind:"fixedassets",title:"Fixed Asset Values"', "Jo's fa1 registry entry is intact");
  /* our names never equal one of hers */
  const ours = Object.keys(env.ctx).filter(function (k) { return /^(faF|FAF_)/.test(k); });
  A.ok(ours.length > 40, "the block defines " + ours.length + " faF / FAF_ names");
  const hers = ["faChip", "faColumns", "faContent", "faControls", "faDim", "faDimLabel", "faEmptyState",
    "faGroup", "faGroupBy", "faGroupLabel", "faGroupOptions", "faHandleClick", "faHasNA", "faHeader",
    "faLoad", "faLoading", "faMeasure", "faMeasureLabel", "faPie", "faPieData", "faPopContent",
    "faSkeletonBody", "faSum", "faTable", "faTableAssets", "FA_ALL", "FA_ASSETS", "FA_CATALOG",
    "FA_DIMS", "FA_MEASURES", "FA_NA", "FA_NA_LABEL", "FA_PIE"];
  A.eq(ours.filter(function (n) { return hers.indexOf(n) > -1; }).length, 0,
    "no faF / FAF_ name collides with one of Jo's fa / FA_ names");
  /* our CSS never matches one of her .fa- selectors */
  const mine = (shell.css.match(/\.faf-[a-z0-9-]+/g) || []);
  A.ok(mine.length > 20, "our CSS declares " + mine.length + " .faf- selectors");
  A.eq(mine.filter(function (s) { return /^\.fa-/.test(s); }).length, 0, "no .faf- selector can match a .fa- selector");
  A.contains(shell.css, ".fa-c-num", "Jo's .fa-c-num rule is still present");
  A.contains(shell.css, ".fa-panel-pie", "Jo's .fa-panel-pie rule is still present");
})();

/* ---------- FIT (owner, 2026-09-21) ----------------------------------
   Four changes, all aimed at Explore and the donut fitting the card. */
(function () {
  console.log("\n[fit] Explore and the donut inside the card");

  /* (1) the download row is gone and its CSS went with it, so nothing orphaned */
  A.absent(shell.css, ".faf-actionrow", "the action row's CSS rule was removed, not left dead");
  A.absent(shell.script, "faFActionRow", "and its wrapper function was deleted too");
  A.contains(shell.css, ".faf-root .faf-hd-right{display:flex", "the header right group is declared");

  /* (2) row density at Explore only, which is where the overflow was */
  A.contains(shell.css, '.faf-root[data-tier="wide"] .faf-arow{padding:5px 14px;}',
    "Explore rows are tightened to 5px");
  A.contains(shell.css, ".wt-row{display:flex;align-items:center;gap:12px;padding:7px 14px;",
    "the shared row keeps her 7px, which is what Detail still uses");
  A.absent(shell.css, '.faf-root[data-tier="xwide"] .faf-arow{padding:5',
    "Detail is not tightened: it has the room");

  /* THE ARITHMETIC. Twelve rows (ten plus header and totals), the pager, and the
     header, against the Explore body. Card 496 less the widget head and the
     wcontent padding leaves about 448. */
  const card = 8 * 48 + 7 * 16;               /* her grid: span 8, 48px rows, 16px gap */
  A.eq(card, 496, "an Explore card is 496px");
  const body = card - 38 - 10;                /* widget head, wcontent padding */
  const rowAt = px => 12 * (px + px + 18 + 1);
  const before = rowAt(7) + 30 + 30 + 44;     /* rows + pager + action row + header */
  const after = rowAt(5) + 30 + 44;           /* rows + pager + header, no action row */
  A.ok(before > body, "at 7px with the action row it needed about " + before + "px, over the " + body + "px body");
  A.ok(after <= body, "at 5px without it, about " + after + "px, inside the body");
  A.ok(before - after >= 70, "the two changes together give back about " + (before - after) + "px");

  /* the page size is deliberately NOT what changed */
  A.contains(shell.script, "FAF_PAGE_SIZE=10", "the page size stays a flat ten, so no spec value moved");

  /* (3) the chips carry the value alone, in every view */
  const don = HTML(probe({ size: "wide", faFView: "donut", faFDim: "cls", faFMeasure: "net" }));
  const tbl = HTML(probe({ size: "wide", faFView: "assets", faFDim: "cls" }));
  /* the two DIMENSION chips are value-only; the measure is the exception,
     having its own line and so no width problem. */
  ["Group by:", "Group:"].forEach(lbl => {
    A.absent(don, lbl, "the donut view no longer prints " + lbl + " inline");
    A.absent(tbl, lbl, "nor does the table view");
  });
  A.contains(don, "Financial Measure:", "but the measure chip DOES carry its full label");
  A.absent(tbl, "Financial Measure:", "and it is absent from the table view entirely");
  /* but the wording still reaches assistive tech on all three */
  ["Group by, currently", "Specific group, currently", "Financial measure for the chart, currently"].forEach(s =>
    A.contains(don, s, "the accessible name still says: " + s));
  A.eq((don.match(/filter-chip/g) || []).length, 3, "the donut view shows three chips");
  A.eq((tbl.match(/filter-chip/g) || []).length, 2, "the table view shows two, the measure being donut only");
  /* the row is nowrap by design, so width is the thing the prefixes were costing */
  A.contains(shell.css, "flex-wrap:nowrap", "the chip row does not wrap, it scrolls");
  A.contains(shell.css, ".faf-root .faf-chiprow .filter-chip{flex:0 0 auto;max-width:230px;}",
    "and each chip is capped, which is why shorter labels matter");

  /* (4) the donut view fits: chart plus its note, inside the same body */
  const dWide = HTML(probe({ size: "wide", faFView: "donut", faFDim: "cls", faFMeasure: "net" }));
  const ds = Number(/width="(\d+)"/.exec(dWide)[1]);
  A.ok(ds + 44 + 45 <= body, "the Explore donut plus header and note is about " + (ds + 44 + 45) + "px, inside the body");
  A.contains(dWide, "legend-col", "the legend sits beside the donut, not under it");
  A.noEmDash(dWide, "the donut view after the fit changes");
  A.noEmDash(tbl, "the table view after the fit changes");
})();

/* ---------- SLIM EXPLORE TABLE + FULL-TABLE POP-UP (owner, 2026-09-21) --
   Explore drops Tag #, Capitalized and Depreciable, and a row click opens every
   column in a pop-up. The seven column table needs min-width:624px, more than
   an Explore card has, which is why it scrolled sideways and read badly. */
(function () {
  console.log("\n[slim] four columns at Explore, all seven in the pop-up");
  const ex = HTML(probe({ size: "wide", faFView: "assets", faFDim: "cls" }));
  const de = HTML(probe({ size: "xwide", faFView: "assets", faFDim: "cls" }));

  /* (1) TAG IS GONE FROM EXPLORE, and still present where the full set is */
  A.absent(ex, "faf-tag", "Explore shows no Tag # column at all");
  A.contains(de, "faf-tag", "Detail still shows Tag #");
  A.contains(ex, "faf-tbl-slim", "Explore marks itself the slim table");
  A.absent(de, "faf-tbl-slim", "Detail is not the slim table");

  /* (2) THREE MEASURES AT EXPLORE, FIVE IN FULL, canonical order both times */
  const exHeads = cellTexts(ex, "faf-c").slice(0, 3).join("|");
  A.eq(exHeads, "Cost|Accumulated|Net", "Explore keeps Cost, Accumulated and Net, in canonical order");
  A.eq(cellTexts(de, "faf-c").slice(0, 5).join("|"), "Capitalized|Cost|Depreciable|Accumulated|Net",
    "Detail keeps all five, in canonical order");
  A.contains(shell.script, "var FAF_COMPACT_MEAS=['cost','accum','net'];", "the slim set is declared once");
  A.eq((ex.match(/class="faf-c"/g) || []).length, 12 * 3, "twelve rows of three money cells at Explore");
  A.eq((de.match(/class="faf-c"/g) || []).length, 12 * 5, "twelve rows of five at Detail");

  /* (3) THE COLUMN COUNT IS REPORTED HONESTLY. It was hardcoded at seven, which
         would have lied the moment three columns went. */
  A.contains(ex, 'aria-colcount="4"', "Explore reports four columns");
  A.contains(de, 'aria-colcount="7"', "Detail reports seven");
  A.contains(ex, "select a row for every column", "and Explore's table label says where the rest are");

  /* (4) SLIM ROWS ARE CONTROLS; FULL ROWS ARE NOT */
  A.eq((ex.match(/faf-rowopen/g) || []).length, 10, "all ten Explore data rows open the pop-up");
  A.eq((ex.match(/data-faf="open-table"/g) || []).length, 10, "each carries the open action");
  A.absent(de, "faf-rowopen", "Detail rows are inert: there is nothing more to open");
  A.absent(de, 'data-faf="open-table"', "and carry no open action");
  /* the head and the total are not rows you can open */
  A.absent(totalRow(ex), "open-table", "the totals row is not clickable");
  A.contains(ex, 'tabindex="0"', "an openable row is reachable by keyboard");
  A.contains(ex, "open the full breakdown", "and says what it opens");
  A.contains(shell.css, ".faf-root .faf-rowopen{cursor:pointer;}", "it looks like a control");
  A.contains(shell.css, ".faf-root .faf-rowopen:focus-visible", "with a real focus ring, since it is tabbable");

  /* (5) THE POP-UP. Its own shell, because her generic modal is 390px and the
         full table needs 624. */
  const wid = probe({ size: "wide", faFView: "assets", faFDim: "cls" });
  env.shim.fire("open-table", { "data-id": wid.id });
  A.ok(c.modal && c.modal.type === "fafTable", "the row click opens our own modal type");
  A.eq(c.modal.id, wid.id, "and names the widget it came from");
  const mo = c.faFTableModalHTML();
  A.ok(mo.length > 800, "the pop-up renders");
  A.contains(mo, "faf-table-modal", "with its own width class");
  A.contains(mo, "faf-root", "scoped so it inherits the widget's tokens");
  A.contains(mo, "faf-tag", "it shows Tag #");
  A.absent(mo, "faf-tbl-slim", "it is the FULL table, not the slim one");
  A.eq((mo.match(/class="faf-c"/g) || []).length, 12 * 5, "all five measures across twelve rows");
  A.contains(mo, 'aria-colcount="7"', "and reports seven columns");
  A.contains(mo, 'data-faf="sort"', "sorting works inside it");
  A.contains(mo, "faf-pager", "and so does paging");
  A.absent(mo, "faf-rowopen", "its rows are inert: it is already the full table");
  /* it reuses ONE table implementation, so the two cannot drift apart */
  A.eq((shell.script.match(/function faFAssetTable\(/g) || []).length, 1, "there is one table function, not a second copy");
  A.contains(shell.script, "faFAssetTable(w,true)", "the pop-up renders that same function with the full flag");
  /* her own close action closes it, so we added no closer of our own */
  A.contains(mo, 'data-action="modal-close"', "her modal-close action closes it");
  A.eq((shell.script.match(/modal\.type==="fafTable"/g) || []).length, 1, "exactly one dispatch line was added to renderModal");
  A.contains(shell.css, ".modal.faf-table-modal{max-width:900px", "the pop-up is wide enough for the 624px table");
  A.noEmDash(mo, "the full-table pop-up");
  A.noEmDash(ex, "the slim Explore table");

  /* (6) THE FIT, which is the reason for all of it */
  A.contains(shell.css, ".faf-root .faf-tbl-slim{min-width:420px;}", "the slim table needs 420px");
  A.contains(shell.css, ".faf-root .faf-tbl{min-width:624px;}", "the full one still needs 624px");
  A.ok(420 < 624, "which is the whole point: 420 fits an Explore card, 624 does not");
  c.modal = null;
})();

/* ---------- POP-UP REFINEMENTS (owner, 2026-09-21) -------------------
   Three asks: the two dimension filters inside the pop-up, the download moved
   to the top right, and the table filling the dialog instead of stopping at
   the height of its rows. */
(function () {
  console.log("\n[popup] filters inside, download top right, table fills");
  const wid = probe({ size: "wide", faFView: "assets", faFDim: "cls" });
  env.shim.fire("open-table", { "data-id": wid.id });
  const mo = c.faFTableModalHTML();
  const h0 = mo.indexOf('class="modal-h"'), b0 = mo.indexOf('class="modal-b"'), f0 = mo.indexOf('class="modal-f"');
  A.ok(h0 > -1 && b0 > h0 && f0 > b0, "the dialog has a header, a body and a footer, in order");
  const hd = mo.slice(h0, b0), bd = mo.slice(b0, f0), ft = mo.slice(f0);

  /* (1) THE TWO DIMENSION FILTERS, and only those two */
  A.eq((bd.match(/filter-chip/g) || []).length, 2, "the pop-up carries exactly two chips");
  A.contains(bd, 'data-faf="dim"', "Group by is one of them");
  A.contains(bd, 'data-faf="group"', "Specific group is the other");
  A.absent(bd, 'data-faf="measure"', "and NOT the measure: the table shows all five as columns");
  A.contains(bd, "Group by, currently", "the Group by chip keeps its accessible name");
  A.contains(bd, "Specific group, currently", "and so does Specific group");
  A.ok(bd.indexOf("faf-modal-chips") < bd.indexOf("faf-tblwrap"), "the chips sit above the table");
  /* they are the widget's own chip row and its own popover, which outranks the
     backdrop, so they can actually open on top of the dialog */
  A.contains(bd, "faf-chiprow", "they reuse the widget's own chip row");
  A.contains(shell.css, ".faf-pop{position:fixed;z-index:3000", "the chip popover is z-index 3000");
  A.contains(shell.css, ".modal-backdrop{position:fixed;inset:0;z-index:2000", "against the backdrop's 2000, so it opens above the dialog");

  /* (2) THE DOWNLOAD IS TOP RIGHT, NOT IN THE FOOTER */
  A.contains(hd, 'data-faf="download"', "the download is in the header");
  A.contains(hd, "faf-modal-acts", "inside the header action group");
  A.ok(hd.indexOf('data-faf="download"') < hd.indexOf('aria-label="Close"'),
    "sitting before Close, so the pair reads download then dismiss");
  A.absent(ft, 'data-faf="download"', "and it is NOT in the footer any more");
  A.contains(ft, "btn primary sm", "the footer is the Close button alone");
  A.contains(shell.css, ".faf-root .faf-modal-acts{display:flex", "the action group is declared");
  /* the spacer that used to push it apart in the footer went with it */
  A.absent(shell.css, ".faf-modal-sp{", "the footer spacer's rule was removed, not left dead");

  /* (3) THE TABLE FILLS THE DIALOG */
  A.contains(shell.css, ".modal.faf-table-modal>.modal-b{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;",
    "the body is a flex COLUMN, so the chips stack above the table");
  A.contains(shell.css, ".modal.faf-table-modal .faf-tblwrap{flex:1 1 auto;min-height:0;}",
    "the table wrapper claims the remaining height");
  A.contains(shell.css, ".modal.faf-table-modal .faf-tscroll{flex:1 1 auto;min-height:0;overflow-y:auto;}",
    "and the scroller inside it is what scrolls");
  A.contains(shell.css, ".modal.faf-table-modal .faf-tbl{min-height:100%;}",
    "the table itself stretches to the full height rather than stopping at its rows");
  A.contains(shell.css, ".modal.faf-table-modal .faf-chiprow{flex:0 0 auto;}",
    "the chip row does not stretch with it");
  /* the totals row was already sticky, so filling the height pins it to the foot */
  A.contains(shell.css, ".faf-root .faf-totalrow{border-top:1.5px solid var(--stroke-widget);border-bottom:none;position:sticky;bottom:0;",
    "the totals row is sticky to the bottom, which is what filling the height makes useful");

  /* nothing about the table itself changed: still the full seven columns */
  A.absent(mo, "faf-tbl-slim", "the pop-up is still the full table");
  A.eq((mo.match(/class="faf-c"/g) || []).length, 12 * 5, "still five measures across twelve rows");
  A.contains(mo, 'aria-colcount="7"', "still reporting seven columns");
  A.contains(mo, 'data-faf="sort"', "sorting still works inside it");
  A.contains(mo, "faf-pager", "and paging");
  A.noEmDash(mo, "the pop-up after the refinements");

  /* changing a filter from inside the pop-up re-renders it, title included */
  const before = c.faFTableModalHTML();
  const names = c.faFGroupNames(wid);
  const other = names.filter(function (g) { return g !== c.faFCurrentGroup(wid); })[0];
  if (other) {
    env.shim.fire("set-group", { "data-id": wid.id, "data-v": other });
    const after = c.faFTableModalHTML();
    A.changed(before, after, "changing the group from inside the pop-up re-renders it");
    A.contains(after, faFEscLike(other), "and the dialog title follows the new group");
  } else {
    A.ok(true, "only one group in this dimension, so no switch to test");
  }
  c.modal = null;
  function faFEscLike(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
})();

/* ---------- MEASURE PLACEMENT (owner, 2026-09-21) --------------------
   The measure chip is no longer inline with Group by and Specific group. It
   sits one line lower, in the chart's own legend head, directly above the key,
   so it reads as the pie's control rather than a third dimension filter. */
(function () {
  console.log("\n[measure] with the chart, not with the filters");

  ["wide", "xwide"].forEach(function (sz) {
    const d = HTML(probe({ size: sz, faFView: "donut", faFDim: "cls", faFMeasure: "net" }));
    const hdr = d.slice(0, d.indexOf("faf-body"));
    const legcol = d.slice(d.indexOf("legend-col"));

    /* NOT in the header filter row */
    A.absent(hdr, 'data-faf="measure"', sz + ": the measure is not in the header row");
    A.eq((hdr.match(/filter-chip/g) || []).length, 2, sz + ": the header carries just the two dimension filters");
    A.contains(hdr, 'data-faf="dim"', sz + ": Group by stays in the header");
    A.contains(hdr, 'data-faf="group"', sz + ": and so does Specific group");

    /* ON ITS OWN LINE, above the chart. Not inside the legend column: that is
       capped at 250px and "Financial Measure: Accumulated Depreciation" renders
       about 290, so it would have wrapped or clipped in there. */
    A.contains(d, "faf-meas-row", sz + ": the measure has a row of its own");
    A.eq((d.match(/faf-meas-row/g) || []).length, 1, sz + ": exactly one such row");
    A.ok(d.indexOf("faf-meas-row") < d.indexOf("pie-wrap"), sz + ": it sits above the chart");
    A.ok(d.indexOf("faf-body") < d.indexOf("faf-meas-row"), sz + ": one line lower than the header, inside the body");
    A.absent(d.slice(d.indexOf("legend-col")), 'data-faf="measure"', sz + ": and NOT inside the legend column");
    A.contains(shell.css, ".faf-root .faf-meas-row .filter-chip{flex:0 1 auto;max-width:340px;}",
      sz + ": the chip is given room for the longest label");
    A.contains(shell.css, ".faf-root .pie-wrap.row .legend-col{flex:0 1 250px;min-width:150px;max-width:250px;}",
      sz + ": the legend column is capped at 250px, which is why it could not live there");

    /* THE FULL LABEL IS BACK */
    const chip = /data-faf="measure"[\s\S]*?<span class="fc-label">([^<]*)</.exec(d);
    A.ok(!!chip, sz + ": the measure chip is found");
    A.eq(chip[1], "Financial Measure: Net Value", sz + ": and reads Financial Measure: <selected>");

    /* "By Class" NOW HEADS THE KEYS, rather than trailing the measure */
    const keys = /faf-keys-head"><span class="legend-hd">([^<]*)</.exec(d);
    A.ok(!!keys, sz + ": the keys have their own header");
    A.eq(keys[1], "By Class", sz + ": reading By Class");
    A.ok(d.indexOf("faf-keys-head") < d.indexOf('class="legend"'),
      sz + ": sitting directly above the key list it heads");
    A.ok(d.indexOf("faf-meas-row") < d.indexOf("faf-keys-head"),
      sz + ": with the measure line above it, so the order reads filter then keys");
    A.absent(d, "faf-leg-by", sz + ": the old trailing-context span is gone");
    A.contains(d, 'aria-label="Net Value by Class', sz + ": the full phrase stays in the chart's aria-label, where it belongs");
    /* the accessible name says what it controls */
    A.contains(d, "Financial measure for the chart, currently", sz + ": the chip says it is the chart's measure");
    A.noEmDash(d, sz + ": donut view with the measure row");
  });

  /* it reuses HER legend-head, shared by thirteen other widgets, so this is her
     chrome in her position, not a new bar of ours */
  A.ok((shell.script.match(/legend-head/g) || []).length > 10,
    "legend-head is shared across the shell, so it is hers, not new chrome");
  A.contains(shell.css, ".faf-root .faf-keys-head{padding-bottom:6px;}", "and only OUR instance is adjusted");
  /* the check has to be scoped to OUR region: hers declares .legend-head and
     must keep doing so for the other thirteen widgets. */
  const ourCssRegion = shell.css.slice(shell.css.indexOf("W11 Fixed Asset Values V2 CSS"),
                                       shell.css.indexOf("end W11 Fixed Asset Values V2 CSS"));
  A.eq((ourCssRegion.match(/(?<![a-z-])\.legend-head\{/g) || []).length, 0,
    "our region does not redeclare her .legend-head");
  A.ok((ourCssRegion.match(/\.faf-root \.faf-keys-head/g) || []).length >= 1,
    "it adds a scoped rule of its own instead");
  /* the keys header still USES her shared legend heading element */
  A.contains(shell.script, '<div class="legend-head faf-keys-head">',
    "the keys header is her legend-head element with our layout class on it");

  /* the table view still shows no measure chip at all */
  const t = HTML(probe({ size: "wide", faFView: "assets", faFDim: "cls" }));
  A.absent(t, 'data-faf="measure"', "the table view has no measure chip anywhere");
  A.eq((t.match(/filter-chip/g) || []).length, 2, "just the two dimension filters");
  A.absent(t, "faf-leg-head", "and no legend head, there being no chart");

  /* showMeasure is gone: the header no longer decides whether to show it */
  A.absent(shell.script, "showMeasure", "the old header-side visibility flag was removed, not left dead");
  A.eq((shell.script.match(/function faFMeasureRow\(/g) || []).length, 1, "the measure row is one function");
  /* three occurrences: the definition plus two call sites */
  A.eq((shell.script.match(/faFMeasureRow\(w\)/g) || []).length, 3,
    "its definition plus exactly two call sites");
  A.eq((shell.script.match(/\+faFMeasureRow\(w\)|return faFMeasureRow\(w\)/g) || []).length, 2,
    "called with the chart, and in the empty-chart state");

  /* THE EMPTY-CHART BRANCH cannot be reached with this fixture: no implemented
     dimension has a measure that charts nothing. Asserted at the SOURCE instead
     of pretended to be exercised. It matters because that state is reached by
     picking a measure nothing has, so without the chip it would be a dead end. */
  const dn = shell.script.slice(shell.script.indexOf("function faFDonut("),
                                shell.script.indexOf("function faFSortBtn("));
  const emptyBranch = dn.slice(0, dn.indexOf("faFZeroNote(w,c.zero);") + 22);
  A.contains(emptyBranch, "return faFMeasureRow(w)+'<div class=\"faf-chart-empty\">",
    "the empty-chart state renders the measure row FIRST, so it is not a dead end");
})();

process.exit(A.report());
