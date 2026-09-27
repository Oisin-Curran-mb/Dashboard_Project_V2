# W15 Bank Balances: review pack

Generated 2026-09-27 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W15.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `bank` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `bank-mb` (prefix `bkF`). Jo's live version: `bank`.

---

## 1. Jo's PR feedback

- **Keep Jo's** money-first glance (total, delta versus beginning balance, overdrawn flag) and the searchable, sortable table. **Fix the below-the-fold clipping on the glance (G12).**
- **Accept from OC:** the accessible real-table markup (header cells and scope); red off the bars (amethyst ramp), red kept only on the Overdrawn chip; totals and bar scale over the whole set; the bigger 52-account dataset.
- **Reject from OC:** server paging (use Load-more plus scroll and search); removing column sort; the narrative glance subtitle and the dropped delta.
- **Rebuild:** honest available-cash framing (do not imply the whole total is spendable; ideally show available / unrestricted alongside the raw total); label the unreconciled basis as a compact caption, not a sentence; fix the £ currency; single account as a clear reversible focus with outflows labelled; table default, a sorted bar only where it earns its place (never a pie); real empty, no-rights, loading and error states.
- **Flag:** available cash by fund needs fund data (the biggest gap); the paged-accounts endpoint and the 7-line per-account activity are new backend work; the £ currency defect.

---

## 2. Jo's notes in her final version

**Her info-popover text (what the widget is for):** The current balance of each active bank account, based on unreconciled activity since the last reconciliation. Select one account to see what has moved (deposits, voids, checks, withdrawals, EFT) since then.

**Registry rows she ships (id · title · size):**

- bank · Bank Balances · wide
- bank_k · Bank Balances (Glance) · kpi
- bank_x · Bank Balances (Detail) · xwide
- bank2 · Bank Balances: Operating Checking · wide
- bank3 · Bank Balances (no accounts) · wide · state empty

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L876 [css]: ===== Bank Balances (prefix: bank): CSS =====
- L932 [css]: All-Accounts sorted diverging bar (Table alternate view + Detail side-by-side)
- L943 [css]: Account cell stacks name over a muted account number (was rendering inline)
- L946 [css]: Left toolbar group: account scope chip + overdrawn chip share ONE grid cell so they don't disturb the .dep-hd grid (which places dep-hd-top children directly).
- L949 [css]: Glance: interactive chip row (account picker + overdrawn drill)
- L958 [css]: Drill overlay: body is a normal block (header above the two-column detail, not side by side), and the modal sizes to content instead of a fixed 84vh.
- L962 [css]: bar hover card must sit ABOVE the drill overlay (modal-backdrop is z-index 2000)
- L964 [css]: Overdrawn quick-filter: a small toggle chip in the toolbar (not a KPI tile)
- L991 [css]: Overdrawn marker on a diverging bar row (so a thin red bar isn't the only cue)
- L993 [css]: End-of-table pager: count + Load more, only past 20 accounts
- L999 [css]: Wide balance cell so an overdrawn pill sits INLINE with the amount, never stacked
- L1005 [css]: Single-account statement: framing heading, pinned Beginning anchor, Type+Amount
- L1012 [css]: ===== Payroll Distributions (pr): scope dropdown + distribution badges =====
- L6924 [js]: ===== Bank Balances (prefix: bank), RENDER =====
- L6929 [js]: Compact money for the glance delta pill: $88k, $1.2M. Sign is carried by the arrow, so callers pass the signed value and we abs it.
- L6934 [js]: Running balance across the reconciliation entries (Beginning, then Deposits, Voids, Checks, Withdrawals, EFT, to Ending). Not a time axis: the sequence of movements since the last reconciliation. Endpoints are Beginning and Ending, and Ending equals the KPI.
- L6942 [js]: Running-balance spark: Beginning to Ending across the reconciliation entries. Coloured dots encode additions (green) vs subtractions (red); endpoints are neutral. A custom hover reads each movement (into/out, signed amount, running balance), and the Ending point shows the net change since Beginning.
- L6991 [js]: Both scopes have two views: All-Accounts = balance table / sorted diverging bar (shows negatives, replaces the pie per Confluence 10.2 + section 8); Single-account = activity table / activity bar. Toggle at Explore (wide); Detail (xwide) shows both views side by side, so no toggle there.
- L6997 [js]: The balance is the unreconciled figure (activity since the last reconciliation), not necessarily cleared, spendable cash — the domain's central truth (brief section 8 / 17.3). Carried as one muted chip, not a sentence; detail in hover.
- L7005 [js]: KPI is the money + the unreconciled-basis chip. Account count moves to a "showing X of Y" caption on the table; overdrawn moves to its own filter card.
- L7038 [js]: All-Accounts comparison = a sorted horizontal DIVERGING bar (replaces the pie: shows negatives, comparable, legible with many accounts; section 8 + decision 2). Zero line; positive bars amethyst growing right, overdrawn red growing left; values as text; sorted by the same key as the table; hover tip per row.
- L7062 [js]: Single-account activity = production's register model: a Type column + a signed Amount column (money out negative/red, money in positive/green, matching the +/- convention). Framed as a running statement: Beginning balance pinned on top, the movement Types sortable in between, Ending balance as the total. Red = a negative amount everywhere; "Overdrawn" is the status word on a negative balance.
- L7106 [js]: Glance is interactive: the account chip opens the real picker (filter/search), and the overdrawn chip DRILLS, opening the Detail view in a closable overlay filtered to the overdrawn accounts. No inert button-looking chip.
- L7137 [js]: Overdrawn is the ONE meaningful quick-filter here (account type is not universal across orgs; available/unrestricted cash is out of scope). A single boolean does not warrant a KPI-style tile, so it is a small toggle chip that lives in the toolbar (inherits the canonical header padding), shown only when an account is actually overdrawn. Count only, no amount.
- L7152 [js]: ======================================================================= Purchasing Management (pur) , v2 Approval queue (lead) + inline approve/reject + encumbrance (committed). Drop-in replacement for the current `pur` block in widget-container.html. Lives in the shell <script> scope: relies on money, fmtAxis, ICON, find, render, renderOverlay, renderModal, showModal, setStatus, and the globals pop / modal / modalMounted / timers / purQuery / purPopEl. FIVE PIECES: (1) DATA + derivations (2) RENDER  , single entry purContent(w) + size/view builders (3) POPOVERS , purPopContent() (4) HANDLERS , purHandleClick / purHandleInput / mousemove hover card (5) FOCUS OVERLAY , purPoModalInner / purPoModalHTML (renderModal branch) =======================================================================
- L7168 [js]: (1) DATA --------------------------------------------------------------
- L7171 [js]: Line-item categories + a requester, keyed by approval path, used to build a rich (but synthesised) focus overlay without bloating each row.
- L7210 [js]: Plain-language context for the info affordance , see integration note (aboutOf). This is where "admins see all / others see their paths / rejected never shown / the chart shows all commitments" lives, so it stays OUT of the widget's copy.
- L7219 [js]: W13: KPI selection tiles replace the old status dropdown + "$X to approve" badge. Tiles: All / Pending / Approved / Rejected. "Pending" respects the Pending-me/All scope (w.pscope, default "me"). Rejected is a deliberate expansion beyond today's product.
- L7245 [js]: Synthesised detail for the focus overlay (kept out of row data to stay lean).
- L7254 [js]: (2) RENDER ------------------------------------------------------------
- L7261 [js]: Queue and Committed are two DIFFERENT data sets, so a top-level DATA SELECTOR chooses which one you are looking at (not a view-toggle, not stacked, never both crammed together). Each data set then offers only the views usable FOR IT: Queue = table (a to-do list); Committed = chart or table (money over time).
- L7346 [js]: No caption sentence: the header "encumbered, not yet paid" pill carries the meaning and the About popover carries the all-paths scope (no face prose).
- L7385 [js]: (3) POPOVERS ----------------------------------------------------------
- L7400 [js]: (4) HANDLERS ----------------------------------------------------------
- L7413 [js]: Whole-row tap -> in-widget focus overlay (approve/reject inline).
- L7433 [js]: (5) FOCUS OVERLAY (renderModal branch: modal.type==="pur-po") ---------
- L7481 [js]: Glance drill: open the Detail view (queue + committed) in a focus overlay.
- L7491 [js]: mousemove hover card for the encumbrance bars (formatted popover, not a one-line tooltip). Guarded so it only appears over a real bar.
- L7508 [js]: ===== Receivable Invoices Outstanding (prefix: ar) , v2 redesign ===== Drop-in replacement for the existing ar block (data + render + handlers). Keeps the shell contract identical: contentHTML->arContent(w); every action is "ar-"-prefixed and routed to arHandleClick(a,id,t); popContent uses only pop types ar-rc / ar-source (arPopContent); the drill uses modal.type "artdetail" (arDetailModalHTML); the bar-hover mousemove listener is inside this block. No shell wiring changes are required. What changed vs v1 (subpar): the pie is gone (aging is an ordered severity read, per DR decision 11.1); the redundant "Total outstanding" box is gone (the KPI already shows the total, per shell 0.1); the sparse 5-row zero table is gone as the hero, replaced by an ordered amethyst severity bar that fills the width and strongly de-emphasises empty buckets; Glance gains a compact aging read; Explore shows aging + top-debtors side by side; internal jargon ("posted", "voided excluded", table mechanics) is removed from user copy; a light collection next-step is offered from a drilled invoice.
- L7525 [js]: (1) DATA -------------------------------------------------------------
- L7533 [js]: Amethyst severity ramp, light (Current) deepening to dark (121+). No red: severity reads from depth of amethyst + order + labels + text.
- L7538 [js]: Unpaid invoices with a balance remaining, aged by days past due. Some tabs left empty on purpose to exercise the empty-tab paths.
- L7560 [js]: Edge instance: everything current (all <=30 days). Overdue buckets are zero, so they are not clickable, and the KPI badge reads All current.
- L7567 [js]: Edge instance: a single populated bucket (91-120). Every other bucket is zero and not clickable; the ordered bar shows one full bar plus a quiet "no balance in" line for the empties.
- L7576 [js]: (2) RENDER -----------------------------------------------------------
- L7607 [js]: Filter chips: secondary-fill + leading filter glyph (via .filter-chip[data-action]) + trailing chevron. Sized to content.
- L7612 [js]: Compact stacked severity bar (single row) , the Glance aging read and a tidy summary strip. One segment per bucket that has a balance, amethyst gradient. Values live in text (Glance caption + sr-only), so this is aria-hidden.
- L7623 [js]: Overdue badge (shared by Glance and the header KPI). Amethyst-neutral pill; red is reserved for the app delta pill, not used here.
- L7631 [js]: GLANCE (kpi): total owed + overdue badge on the LEFT, a plain context line, then a compact aging read (stacked severity bar + oldest-with-balance callout). No content toolbar (Glance is flat). Values as text + sr-only.
- L7661 [js]: No prose line: the total + overdue pill + the aging-ordered table (oldest first) already carry what this is and how it is sorted.
- L7663 [js]: Explore shows both cuts side by side, so the group toggle is hidden there.
- L7671 [js]: Ordered severity bar , the hero read. Current -> 121+ (aging) or worst-debtor first (customers). Amethyst gradient, no red. Values are in the DOM (amount + count) plus an sr-only sentence. Empty aging buckets are suppressed from the plot and collapsed into one quiet "no balance in ..." line.
- L7716 [js]: Drill-to-detail focus overlay: report-style list (Customer, Bill To, Due Date, Invoice #, Days Past Due, Outstanding). Each row expands into four tabs and a collection next-step (open the invoice / record a follow-up). Export + Close.
- L7781 [js]: (3) HANDLERS ---------------------------------------------------------
- L7782 [js]: Data-fetch: revenue center / source changes fetch new data => transient arloading flag + skeleton. Group by, drill, tab, expand are client re-renders and never trigger a load.
- L7801 [js]: popContent branches (routed from popContent(): ar-rc / ar-source -> arPopContent)
- L7807 [js]: triggerSelector branches (already inline in the shell's triggerSelector for ar-rc / ar-source; kept here for parity/verification).
- L7810 [js]: renderModal branch (already in the shell): if(modal.type==="artdetail"){mr.innerHTML=arDetailModalHTML();return;}
- L7811 [js]: contentHTML dispatch (already in the shell): if(w.kind==="ar")return arContent(w);
- L7813 [js]: Bar hover popover (formatted card; reuses .bgt-pop styling)
- L7828 [js]: Attach once at load (this listener lives inside the ar IIFE block):
- L7830 [js]: ===== Receivable Invoices Outstanding (MB updated) , W05, ADDITIVE (prefix: arF, kind:"receivables-mb") ===== Our finalized W05, built FROM Jo's ar block one-to-one and renamed into the arF namespace so it lives ALONGSIDE her "ar" widget and never edits her code. Owner delta (Step 4 W05): the drill-to-detail modal gains a row-level checkbox per invoice (no select-all), an always-enabled "Confirm" button beside Close, and on Confirm an inline dev-intent note reading exactly "Move to unposted transactions" plus a muted live "(N invoices selected)" count. The move-to-unposted TRANSACTION TYPE is an OPEN SME/API item (see Step 5 "Move to Unposted Transactions - Logic Notes.md" section 9) and is deliberately NOT invented. Shell wiring (append-only, added beside Jo's ar wiring): contentHTML() ....... if(w.kind==="receivables-mb")return arFContent(w); click listener ...... if(a&&a.indexOf("arF-")===0&&arFHandleClick(a,id,t))return; popContent() ........ if(pop.type==="arF-rc"||pop.type==="arF-source")return arFPopContent(); triggerSelector() ... arF-rc / arF-source branches renderModal() ....... if(modal.type==="arFdetail"){mr.innerHTML=arFDetailModalHTML();return;} aboutOf() ........... if(w.kind==="receivables-mb")return {...};
- L7845 [js]: (1) DATA -------------------------------------------------------------
- L7846 [js]: Six aging bands (W05): Current = not yet due (days <= 0); overdue counts ANY day past due, starting the 1-30 band at day 1.
- L7856 [js]: Amethyst severity ramp, light (Current) deepening to dark (121+). No red: severity reads from depth of amethyst + order + labels + text.
- L7861 [js]: Unpaid invoices with a balance remaining, aged by days past due. Some tabs left empty on purpose to exercise the empty-tab paths.
- L7898 [js]: Edge instance: everything current (all <=30 days). Overdue buckets are zero, so they are not clickable, and the KPI badge reads All current.
- L7905 [js]: Edge instance: a single populated bucket (91-120). Every other bucket is zero and not clickable; the ordered bar shows one full bar plus a quiet "no balance in" line for the empties.
- L7913 [js]: Illustrative scale: extend the default dataset to ~35 customers so the drill worklist exercises search, sort and paging. Demo values, not real records.
- L7928 [js]: (2) RENDER -----------------------------------------------------------
- L7959 [js]: Filter chips: secondary-fill + leading filter glyph (via .filter-chip[data-action]) + trailing chevron. Sized to content.
- L7964 [js]: Compact stacked severity bar (single row) , the Glance aging read and a tidy summary strip. One segment per bucket that has a balance, amethyst gradient. Values live in text (Glance caption + sr-only), so this is aria-hidden.
- L7975 [js]: Overdue badge (shared by Glance and the header KPI). Amethyst-neutral pill; red is reserved for the app delta pill, not used here.
- L7983 [js]: GLANCE (kpi): total owed + overdue badge on the LEFT, a plain context line, then a compact aging read (stacked severity bar + oldest-with-balance callout). No content toolbar (Glance is flat). Values as text + sr-only.
- L8019 [js]: Ordered severity bar , the hero read. Current -> 121+ (aging) or worst-debtor first (customers). Amethyst gradient, no red. Values are in the DOM (amount + count) plus an sr-only sentence. Empty aging buckets are suppressed from the plot and collapsed into one quiet "no balance in ..." line.
- L8052 [js]: xwide companion to the breakdown bar: the invoices behind the current selection, worst overdue first, read-only. Capped; the footer opens the full detail overlay. Values as text, so it reconciles to the bar total.
- L8066 [js]: W05 data view: Table (default) or interactive Pie, under either content view (Aging / Customers).
- L8093 [js]: Interactive canonical donut (G8): slices AND legend are clickable to open the invoices behind them.
- L8116 [js]: Drill-to-detail focus overlay: report-style list (Customer, Bill To, Due Date, Invoice #, Days Past Due, Outstanding). Each row expands into four tabs and a collection next-step (open the invoice / record a follow-up). Export + Close.
- L8144 [js]: Group the scope's invoices by customer, worst-overdue first: the collections worklist model (who to chase).
- L8151 [js]: Illustrative contact + last-contacted per customer, deterministic from the name (demo data, not real records) so the chase journey reads end to end.
- L8161 [js]: Expanded customer panel: their invoices, contact + last activity, and the collection next steps (open invoice, statement, follow-up, payment).
- L8181 [js]: Export preview: shows the exact scope (selected vs all), the columns and the first rows, so Maria sees what she is exporting before she commits.
- L8198 [js]: Worklist body, re-rendered in place on every in-modal tap (no full app render, scroll preserved) so it never blinks.
- L8242 [js]: (3) HANDLERS ---------------------------------------------------------
- L8243 [js]: Data-fetch: revenue center / source changes fetch new data => transient arFloading flag + skeleton. Group by, drill, tab, expand are client re-renders and never trigger a load.
- L8272 [js]: popContent branches (routed from popContent(): arF-rc / arF-source -> arFPopContent)
- L8278 [js]: triggerSelector branches (already inline in the shell's triggerSelector for arF-rc / arF-source; kept here for parity/verification).
- L8281 [js]: renderModal branch (already in the shell): if(modal.type==="arFdetail"){mr.innerHTML=arFDetailModalHTML();return;}
- L8282 [js]: contentHTML dispatch (already in the shell): if(w.kind==="ar")return arFContent(w);
- L8284 [js]: Bar hover popover (formatted card; reuses .bgt-pop styling)
- L8299 [js]: Attach once at load (this listener lives inside the ar IIFE block):
- L8301 [js]: Worklist search: update in place, keep focus (no full app render).
- L8304 [js]: ===== Payroll Scheduled Time Off (pto) =====

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Ported 2026-09-08 against Jo's `phase-2` @ `71ca056` on branch `oisin-v2-rebuild`. **First-ever port of this widget.** Ours is `kind:"bank-mb"`, prefix `bkF`/`BKF_`, entry `bkFContent`, CSS root `.bkf-*`, actions `data-bkf`, seven registry entries on the `(OC)` convention. Source of truth: our built Final `bkF`, **rebuilt 2026-09-04** per direct instruction ("change the design to Jo's, dont copy it but take what is in it and try to copy it for Bank Balances W15"). There is no `FC_VERSION[15]` entry in the build, so the dated comments in the Final's own bkF block are its only version record and are what is cited here. The earlier 2026-08-30 v2.0 port (prefix `bankF`) was discarded by owner instruction on 2026-09-03 and is deliberately not resurrected.

**Collision note.** Jo's own bank widget is `kind:"bank"` with twenty-six `bank*`-prefixed helpers (`bankContent`, `bankAccounts`, `bankEnding`, `bankMoney`, `bankAbbr`, `bankAllTable`, `bankAllBars`, `bankBars`, `bankSingleTable`, `bankGlance`, `bankOdChip`, `bankShowBpop` and the rest) plus `BANK_ACCOUNTS` and a 107-rule `.bank-*` CSS cluster. None of her names begin with `bkF`, and before this port `bkF`, `BKF_`, `data-bkf`, `.bkf-` and `bankf` each had **zero** occurrences in her file. Verified after the port: all twenty-six of her functions are still defined exactly once, `BANK_ACCOUNTS` is declared exactly once, her five `kind:"bank"` registry rows are byte-identical, her 17,144-byte bank render block and her 1,417-byte hover-popover tail are byte-identical by md5, and all 107 of her `.bank-*` CSS rules (9,266 bytes) are byte-identical. Her `EMPTY_COPY.bank` and `ERROR_COPY.bank` lines are untouched. Her data-actions stay `bank-*` and ours are `data-bkf`, so her delegated click listener never sees ours and ours never sees hers.

**This port REUSES her CSS rather than redeclaring it.** 74 of the classes our markup relies on are already declared in her stylesheet, her whole `.bank-*` cluster included, so our CSS block adds only 51 rules: our own 21 `.bkf-*` classes plus three groups of forced, `.bkf-root`-scoped overrides (documented in rows 12 to 14 below). Our block declares **zero** `.bank-*` selectors. Our Final's stylesheet re-implemented her entire vocabulary only because our own mockup file had none of it to inherit; here it was already present.

Verified by `w15-bank-mb.driver.js`, 463/463. All eleven previously ported drivers re-run green afterwards.

| # | Difference | Jo's version | Ours | Grounded in |
|---|---|---|---|---|
| 1 | Presentations offered | Table and Bars, and at `xwide` her `bankAllFull` shows BOTH side by side in a paired two-column layout | The same two presentations, but ONE at a time at every tier. Detail differs from Explore in the room it has, not in its structure | [DESIGN - Step 4 Views: "Detail does not pair presentations"; the paired requirement was retired after review on W11 (2026-09-03) for not fitting the space] |
| 2 | A third presentation | n/a | **Account Cards was REMOVED by owner instruction on 2026-09-04.** There are two presentations, not three, and both read the same server response so neither can show an account the other does not | [DESIGN - Step 4 Views, View 3 recorded as removed so the earlier three-view plan is not treated as current] |
| 3 | Paging | Client-side "Load more" (`bank-more`), which slices a longer list already held in the browser | Server paging: Previous page / Next page, **page size 12** over 52 accounts (five pages), stating "1 to 12 of 52 accounts" and "Page 1 of 5". Each move is a round trip, which is why it is a page control rather than Load more: Load more cannot say which page you are on | [DESIGN - Step 4 Paging rule, 2026-09-04 rebuild; API - Step 5 v2 pagination contract, default pageSize 12] |
| 4 | Ordering, and where it happens | User-sortable columns (`bank-sort` / `bank-ssort` rendering her `.wt-sort` buttons on both tables), defaulting to `bal-desc`, sorted in the browser | Fixed alphabetical by account name, ordered server-side, with a whitelisted `sortBy` of exactly one member and a unique account-id tiebreaker so paging can neither repeat nor skip an account. **Her sortable column HEADERS are deliberately NOT built** | [DESIGN - Step 4 Data Table Sort (fixed alphabetical, not user-changeable) and open item 7, an OWNER decision; the discarded port had sortable columns, contradicting both the Step 4 and Step 3 docs] |
| 5 | Totals and chart scale | Computed in the browser: `bankTotal` reduces over her account list, and her bar scale is taken from the rows on screen | Computed server-side over the **whole filtered set** and never the page. The totals row reads `res.totals` rather than reducing over the rows it was handed, and the diverging bar scales to `totals.maxEnding` / `totals.minEnding`, so **turning the page moves neither the total nor any bar's length** | [API - Step 5 v2, which names a page-sized total as this widget's single most likely defect and gives `maxEnding`/`minEnding` exactly this job] |
| 6 | The Overdrawn chip's arithmetic | Her `bankOdChip` counts and filters, but count and filter run over the same client-side list | Same control, hers reused, with the arithmetic split: the **count spans the whole active set** while `rows`, `totalCount`, `pageCount` and `totals` all follow the **filtered** population. The count therefore does not move when the filter turns on or the page turns, and the header and totals row stop saying "all accounts" while it is on | [DESIGN - Step 4 Filters, chip added 2026-09-04 per direct instruction; API - Step 5 v2 filter architecture: `overdrawnCount` alone always spans the whole active set] |
| 7 | Where the Overdrawn chip appears | On her Glance as a **drill** chip that opens the Detail view in a closable modal overlay | Absent at Glance entirely, because Glance has no controls, and **cleared** on the switch to Single Account mode, where an overdrawn filter has no meaning. Its two undocumented edges are recorded build choices: it renders only when at least one account is genuinely overdrawn (a red "0 overdrawn" would be a permanent alarm about nothing), and it carries its state as `aria-pressed`, a label that names what is being shown, and a close glyph, so colour is never the only signal | [DESIGN - Step 4 Filters and Size behaviour ("no controls, no view switch, no overdrawn chip" at Glance)] |
| 8 | Glance | Interactive: a live account chip, the overdrawn drill chip, and a `delta-pill` comparing the ending balance to the beginning balance | One figure, the Total Balance across all bank accounts, **always the all-accounts aggregate regardless of any account selection made at a larger size**, with no controls and no view switch. Refresh comes from her shared card chrome | [DESIGN - Step 4 Size behaviour, Glance row; the always-aggregate rule itself is flagged for owner confirmation as open item 5, the same exception as W05, W10 and W11] |
| 9 | Drill-through | A per-row and per-bar link (`bank-acct-drill` on `.bank-namecell` and `.bank-hb-name`) into her `bankDrillModalHTML` overlay | None. No row, bar or column is clickable, and the widget opens no modal of its own: **Single Account mode already IS this widget's drill-in mechanism** | [DESIGN - Step 4 Drill-Through: "No separate page link, Single Account mode already is this widget's drill-in mechanism"; the port's per-account overlay is recorded as having no source] |
| 10 | Per-bar hover detail | `bankShowBpop`, a hover card on `.bank-col[data-bankpop]`, driven by her document-level `mousemove` listener | Dropped. Our category columns carry no `data-bankpop` attribute, so her listener never fires on them. Every chart value instead exists as text in the DOM beside its bar and again for screen readers, never hover only, which is what clears the standing F4 accessibility finding against this widget | [DESIGN - Step 4 Interaction Spec and Accessibility; the hover card is unspecified in every source] |
| 11 | Table semantics | Div-based flex row stacks using her `.wt-row` / `.lr-main` / `.wt-c2` primitives | Real native `<table>` elements with `<th scope="col">`, `<th scope="row">` and an `sr-only` `<caption>` that names the filter, the page and what the total covers. This is not a style preference: a `<th scope>` set through `innerHTML` inside a `<div role="row">` is a parse error and is silently dropped, so the ARIA-role approach cannot meet the requirement | [DESIGN - Step 4 Accessibility: "Table semantics are real (th/scope)"] |
| 12 | The zero axis on the diverging bar | Her `.bank-hb-zero` rule reads `var(--wn-500)`, and **`--wn-500` is declared nowhere in her file**, so the rule resolves to nothing and her diverging bar's zero axis is **invisible in her own build** | `--wn-750`, a Pathway primitive the file does declare. **This is a real defect in her original, reported rather than copied:** her rule is left exactly as it is and only our own axis is re-pointed, scoped to `.bkf-root` | [BUILD - verified in her file: zero `--wn-500` declarations; the driver asserts both the defect and our fix] |
| 13 | Red on the bars | `.bank-hb-fill.neg` and `.bank-col.out .bank-bar` are `var(--red-100)`, and her `.bank-xval` pairs `in` with `--am-700` against a red `out` | The amethyst ramp: `--am-500` for in-credit and money-in, `--am-700` for overdrawn and money-out. Nothing is lost, because the overdrawn reading is carried by the side of the zero axis, a warning glyph, the word Overdrawn and a legend line that states in words which side means what. Red survives in exactly one place, the Overdrawn status chip | [DESIGN - Widget Styling Reference 8.2, which keeps red off bars and arcs; colour is never the only signal] |
| 14 | Native-table box model | n/a | Three groups of `.bkf-root`-scoped overrides, all forced rather than chosen: her row, header, second-column and totals selectors set `display:flex` and a fixed flex basis, which would collapse a real table row, so her visual treatment is kept and only the box model is re-stated for table semantics | [BUILD - required by row 11; her rules are untouched and still drive her own div stacks everywhere else in the file] |
| 15 | The seven-row breakdown | Present, but with sortable columns, and the ending figure sits in a `.dep-total` strip **outside** the table, which makes it an eighth row | Row 7 inside the table with the same weight and rule, and **no totals row at all**, because Ending Balance already is the total and a totals row would double count it. Each boundary row carries a sub-line stating its provenance: whether the beginning balance came from the last reconciliation or, for a never-reconciled account, from its opening balance, and why there is no separate total. The order is structural and is never sortable | [DESIGN - Step 4 Data Table Sort (fixed structural row order) and Data Contract (the two beginning-balance origins)] |
| 16 | Account identification | Name plus a masked account number (`••4021`) with the full number held alongside | Account name only | [DESIGN - Step 4 Views: "All Accounts views show name + balance only, as specced"] |
| 17 | Download | Her three `kind:"bank"` registry entries carry an `actions` array (CSV, Excel, PDF) driving her export menu | **No download at any size.** None of our seven registry entries carries an `actions` array | [DESIGN - Step 4, the download control was removed by owner instruction on 2026-09-04] |
| 18 | Search | She renders a search input over the account table, but it carries **no handler in her own file**, so it is a dead control | No search box at all, in the widget or in the account picker | [DESIGN - Step 4, recorded as not carried over from the discarded port; no source document specifies a search here] |
| 19 | Money | `bankMoney`, whole dollars | Two decimals, en-US, keeping her U+2212 MINUS SIGN glyph for negatives. Ported exactly as built, because Step 4 records "Rounding / currency / locale rules: *not yet specified*" and Jo's own localisation defect on this widget is Unreviewed (see the open items) | [DESIGN - ported as built; the rounding rule is an acknowledged gap, not a decision] |
| 20 | Volume in the fixture | 26 accounts, unpaged | 52 accounts, deliberately **not** in name order so that the server ordering code actually runs rather than being masked by pre-sorted input. Seven end overdrawn and three have never been reconciled, so both edge paths render | [SME - Ben Lane, 13.07.2026: "Up to 50, sometimes more. 3 is unrealistically low... design for dozens of accounts, not a handful"] |
| 21 | Tier awareness | Two `data-tier` occurrences in her whole file | `data-tier` on our root and on the activity chart, with tier-scoped rules for the bar grid and the chart | [DESIGN - Widget Styling Reference 8.1 makes tier sizing mandatory] |
| 22 | Mode-change announcement | Silent: her account selection replaces the whole widget with no announcement | A polite `role="status"` live region, because the Account control changes the entire widget rather than filtering a list, and a silent whole-widget replacement is not announced to a screen reader | [DESIGN - Step 4 Interaction Spec, "This is a mode switch, not a row filter", plus Accessibility] |

**Parity kept (identical to Jo, or her component reused verbatim).** The header is her two-row `.dep-hd` grid with the account chip and overdrawn chip left in her `.bank-hd-left`, the view toggle right in her `.dep-hd-toggle`, and the KPI number and its badge on the left in her `.bank-numwrap` with her `.bank-ctx` context line beneath. The diverging bar is her `.bank-hb` family whole (`.bank-hb-row`, `-name`, `-track`, `-zero`, `-fill`, `-val`, `-warn`) on her exact grid. The four-category activity chart is her `.bank-cols` column chart whole: her 40px `.bank-yax`, her `.bank-canvas` with its bottom rule and dashed `.bank-gl` mid gridline, her per-column hover band, her 56%-wide bar capped at 46px, and her `.bank-xaxrow` repeating each label and value as text. The Overdrawn chip is her `.bank-odchip` with her own pressed `.on` treatment, not a restyle. The overdrawn balance markers are her `.bank-pill warn`, `.bank-tag-over` and `.bank-neg`/`.bank-pos`. The beginning-balance row uses her muted `.bank-anchor`. The account picker is her `.mi` / `.mi-gap` / `.mi-nm` / `.cap` / `.sep` / `.menu-scroll` menu with her `.bank-mi-bal` trailing balance. The view switch is her `.vtoggle` / `.vt` segmented control, offering the same two segments hers does. The account control is her `.filter-chip` with her `.bank-acct-chip` width cap and her `.fc-label` ellipsis. Pagers use her `.iconbtn`, the pager strip her `.bank-pager`, tables her `.wt-*` / `.lr-main` / `.dep-total` treatment, Detail her `.dep-full` / `.dep-col` / `.dep-col-h` columns, states her `.state` block, and Glance her `.kpi-row` / `.kpi-num` / `.metric-value` / `.gl-sub`. Refresh is her shared card chrome and preserves the account selection, because nothing in our render path writes to the selection. [DESIGN - parity with Jo]

**Open items carried, not resolved.**
- **The paged accounts endpoint exists in NO Modern API document.** `GET /api/dashboard/bank-balances/accounts?page&pageSize&sortBy&sortDir` is modelled here by the `bkFServerQuery` stand-in and is central NEW backend work: the paging, the full-set aggregation, the extremes that hold the bar scale still, and the overdrawn count that rides the same request. No schema change is needed, but the endpoint does not exist.
- **The per-account seven-line activity breakdown is entirely NEW and is the WAIVED Rule 11 ask that blocks Single Account mode.** The Modern API's single-account endpoint returns only a summary balance: there is no seven-row Beginning / Deposits / Voids / Checks / Withdrawals / EFT / Ending breakdown and no activity-category endpoint at all. The owner waived this explicitly as forward design (Step 4 Sign-off row 3, the one row marked as blocking), so the mode is built as if the data were real and the caveat lives here and in the manifest, never on screen. It is this widget's largest gap and it is the backend team's to close.
- **Every one of Jo's dossier findings is Unreviewed. No reconciliation file exists for this widget,** so no finding has an owner-assigned status. That includes her **live pound-sign localisation defect** (a pound sign shown for a US org, observed 23 Jul 2026), against which Step 4 records "Rounding / currency / locale rules: not yet specified" while the build formats en-US dollars; and her **available-vs-unrestricted-cash "Do now"** (gap 10.4), for which the nearest recorded item is open item 9 (cash runway) and for which no available-vs-total framing exists in either the doc or the build. Also Unreviewed: her multiple-instances-plus-saved-default-account request (gap 10.5), and labelling the unreconciled-only basis with an optional all-items view.
- **The SME attribution conflict stays recorded on both sides.** Jo's dossier names the 13 Jul 2026 SME as "Marvin"; this project's Step 2 records name Ben Lane for the same interview on the same date. Neither is treated as the correction of the other; whoever holds the recording settles it.
- **Ben Lane's "top 3 to 5 plus view all" preference versus the built paged full set is an open design question.** He recommended surfacing a handful with a view-all route for orgs with up to 50 accounts; the build instead pages the entire set with no trimming at any size. **This port renders the BUILT behaviour** and flags the divergence. Step 4 open item 2 keeps both the locked size table and the interview finding recorded until someone resolves it, and open item 4 (which 2 to 3 accounts a trimmed view would pick, first alphabetically or largest balance) stays recorded against any future trimmed view.
- **Negative balances in the bar chart are undefined.** The legacy pie excluded negative-balance accounts; the equivalent rule for the bar chart was never written. The build shows them on the correct side of the zero axis and names the gap in one muted line, which appears only when the current page actually contains one, so it never becomes a standing footnote. Design settles the rule (open item 6).
- **Loading is unspecified and deliberately not invented** (open item 8), which matters more here than on most widgets because paging is now a server round trip. Jo's `bankSkeleton` and her 850ms `bankLoad` timer are hers and are left to her widget; ours has no loading treatment at all.
- **Last Reconciled visibility is undecided** (open item 1). Balances are a running tally of unreconciled items since each account's last reconciliation, but no visible "Last Reconciled" date or status badge exists in the legacy design or here. If the green / amber / red reconciliation badges are ever confirmed, each must carry a text label, not colour alone. An unreconciled-item count on the account rows is the related open item 10.
- **The always-aggregate Glance figure is flagged for confirmation** (open item 5): it ignores any account selection made at a larger size, the same exception as W05, W10 and W11.
- **The empty state names its own gap rather than resolving it.** What a zero-account organisation should see is unspecified in every source, and the related known rule is that the "All Bank Accounts" option only appears when more than one active account exists. The state renders cleanly and says the treatment is Design's and the owner's to settle.

*Section added 2026-09-08 on branch oisin-v2-rebuild (base 71ca056).*

---

### 3b. Final Version Build Sheet

_No Build Sheet section for W15 (detailed rows were only written for W01-W05)._

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W15.md`._
