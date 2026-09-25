# Widget Review: Jo's decisions on Oisin's (OC) versions

Reviewed against the "Side by side (Jo vs OC)" comparison on OisinBranch, widget by widget, grounded in each widget's Confluence brief (space DR) and the mb-widget-builder conventions. Every approved item is to be built into the **phase-2** branch only, applied onto Jo's current widget, never a wholesale replacement with OC's version (OC built on an earlier version of the widgets, so only the specific deltas below come across).

How to read each widget:
- **Accept** = bring this OC change into phase-2.
- **Reject** = do not bring it in; keep Jo's.
- **Rebuild** = neither version is right; build to the brief.
- **Flag** = a data or backend dependency to document, never to invent.

---

## Global rules (apply to every widget)

- **G1. Size steps down when it does not fit.** If a size's canonical width exceeds the breakpoint (about 393px mobile), that size is not offered there and falls back to the next smaller one (Detail to Explore to Glance). Detail is effectively not offered on mobile.
- **G2. Drill modals and tables must work on small screens.** Fix truncation by horizontal scroll (keep column widths) or tooltips on truncated text. No heavily clipped overlays.
- **G3. Data-view toggle placement.** The data-view toggle (Table / Chart / Kanban / Pie) sits inline on the KPI number row. Filters sit top-left above the KPI. The view toggle never sits on the filters row.
- **G4. Detail layout.** Do not force table-beside-chart when the chart is complex and legended and the table has more than two columns; use the inline data-view toggle instead. Side by side only when it genuinely fits.
- **G5. Canonical proportions.** Widgets keep their canonical Figma proportions at every size; a size never distorts or reproportions the widget below its canonical size.
- **G6. Long lists and legends** need a proper accessible scroll, and a search where needed.
- **G7. No narrative subtitles, ever.** Remove them everywhere (reinforces the text ban).
- **G8. Canonical charts.** Every donut, pie, bar uses the canonical interactive, legible, accessible chart (no white-on-white or illegible text, proper hover and legend). Charts are amethyst; red is reserved for a true alarm.
- **G9. Clean KPI.** The KPI shows only its number; no secondary metric badge crammed beside it.
- **G10. No "Group by" control.** The classification shows as columns (or badges). Filtering narrows what you see; sorting via column headers reorders. Never a group-by.
- **G11. One toggle design.** All toggles and segmented controls use the same canonical design-system pattern, at every level; no bespoke variants.
- **G12. Glance never runs below the fold.** Glance content fits the canonical glance size; if it does not fit, cut to the primary signal.

Reinforced conventions: Load-more in batches, never pagination. Sort on column headers, not sort-by toggles. Status and aging as clear badges with icons, never colour alone, consistent and on brand. Tappable KPI / filter tiles (with counts) for statuses and aging buckets. Drill by tapping the row or name; no separate info or edit icons. Currency follows the org. Ground every decision in the brief; flag dependencies, never invent data.

---

## W01 Budget Compared to Actual
- **Accept:** the finer Day / Week interval grains (Time Window Module).
- **Reject:** the "1.9%" percent added beside the headline.
- **Rebuild:** the Glance mini-chart (sparkline). On hover or tap each point must express favourability at that point (variance amount, up or down, favourable or unfavourable colour), and the last point must equal the KPI value (for example 9,300 favourable), not a static dollar figure that does not tie to the KPI.
- **Note:** OC's "interactive Glance / caption" is not a real difference; Jo's Glance already opens those menus.

## W02 Pension Plans
- Detail and Explore are identical to Jo's; the "By district" view and All-Districts total OC lists as new are already in Jo's version. No change there.
- **Reject:** OC's narrative Glance subtitle.
- **Rebuild (Jo's requests):** add the district filter to Glance; under the KPI add "per year" in the trend-range caption style used on the other Glance widgets; change the badge from "10 appointees" to **"5 plans"** with a hover tooltip "Per year contribution across 5 plans and 10 appointees."

## W03 Payroll Distributions
- **Accept:** the second "All pay types" filter; fixing "All distributions" to filter only (stop mixing filtering by distribution with sorting by pay type); the nested drill (distribution, then employees paid, then their pay types) in a modal overlay.
- **Apply G3:** the data-view toggle moves inline to the KPI row.
- **Permission gate:** deferred. It is not actually built in the demo. At build time, add a simulated "no permission" state so Jo can see it, then decide keep or drop.

## W04 Remittance Pledges
- **Accept the per-card info controls, with the copy trimmed:**
  - On track: keep "Within about a month's worth of payments either side of what was expected by now." Remove "A pledge that has just paid sits here."
  - Ahead: keep "Further ahead than about a month's worth of payments, or paid in full." Remove "Pledges with no pledge amount set are counted in none of the three."
- Everything else on W04 reads the same as Jo's; approved as-is.

## W05 Receivable Invoices Outstanding
- **Bring in:** six aging bands with Current = not yet due and overdue counting any days past due; the bigger demo dataset (23 invoices).
- **Remove / fix:** the "Owed to you, oldest balances first" KPI subtitle; the off-standard "outstanding" subtitle to the standard treatment; data-view toggle inline with the KPI (G3); the pie made interactive and canonical (G8).
- **Restructure the toggles:** Aging and Customers are content; Pie is a data view. Remove Pie from the content toggle. Content toggle is Aging / Customers only, with a Table / Pie data-view toggle under each.
- **Detail shows one list at a time:** under Aging show only aging; under Customers show only customers.
- **Sorting via column headers:** Customers view has Customer, Balance, and a new **Aging** column (age of the unpaid per customer), each sortable. Same principle for the Aging view.
- **Do NOT touch the drill modal at all** (no checkbox, Confirm, or move-to-unposted).

## W06 Insurance Billing Plans
- **Reject:** the "Share" to "Share of total" relabel; keep "Share."
- **Change:** remove the "Counts include employees and their dependents" subheading; replace with an info icon on the "Insurance type / plan" header, shown on hover only.
- Nothing else changes.

## W07 Deposits on Hand
- **Reject pagination:** use a "Load more" button in batches of 50.
- **Period option:** already in Jo's Compare To; nothing to add.
- **Reject the scope-dependent breakdown toggle:** it forces a staged, multi-click flow and would need an Apply button. The all-accounts long list is solved by G6 (scroll and search), not by gating the toggle.
- **Chart click (rebuild):** on All account types the legend / donut toggle stays consistent (a legend click does not re-scope the main filter). Tapping any account type, on a slice or in the legend, opens a modal with that type's pie, correct filtering applied, and the by-account breakdown inside the modal. A single account type has no donut, so nothing there.
- **Accept:** the bigger dataset. Row detail modal untouched (parity). The dropped fourth size tier is a non-issue (three sizes system-wide).

## W09 Payroll Scheduled Time Off (full redesign, grounded in the brief)
Grounded facts from the brief: approval is department-based and permission-gated (table PREmployeeTimeOffApprovals; a supervisor sees only their departments; payroll admin sees all). Only pending and approved exist, no reject. Undo equals un-approving (the approve checkbox is a toggle). The SME says do NOT use per-type icons (types are client-renamable). Pay group is kept as an option because many clients do not set home departments.
- **Filters (top left):** Department (Show All or one department). Pay Group kept as an option (department is the default).
- **View toggle (top right):** Approval Queue / Leave Calendar.
- **KPI selection cards:** All / Pending / Approved, each with a count, tap to filter; work in both views. Remove the "18 of 27 scheduled days" line.
- **Time range (inline with the cards):** Day / Week / Month / Quarter / Year; hidden in the Leave Calendar.
- **Approval Queue table:** date always the row header, then Employee, Department (grey badge with a department icon), Leave type (**plain text**, no icon, per SME), Status (badge with icon: Approved green, Pending amber, Outstanding orange; hover shows who approved and when). Column-header sort. Search by person. Approve is a primary button with a confirmation modal; **no reject**; once approved, undo via the Approved badge (tooltip plus "Undo approval" back to Pending). Outstanding can be approved in retrospect or **dismissed** (confirmation, removed from the calendar). Bulk select and approve with a confirmation. Remove the info button; tap the name to drill.
- **Employee drill:** tap a name to open a full-size scrim overlay, that person isolated (queue or calendar), with their own KPIs (total, pending, approved).
- **Glance:** total Pending and total Approved, plus a Day / Month / Quarter / Year filter; tapping a card opens the filtered Explore in an overlay.
- **Leave Calendar:** remove "2 people across 1 department in September" and every micro-comment like it. Each day shows counts, not names: a green Approved chip and an amber Pending chip, each with its number; Outstanding orange with an icon. Today is much more visible. Tap a day chip for isolation mode: approve pending, dismiss outstanding, see who approved already.
- **G10:** no group-by; department and pay group are filters, not grouping.

## W10 Loans With Balance Due
- **Accept:** the fifth aging range (61 to 90); removing the Days-past-due column with default sort amount descending; the loan-type filter driving everything.
- **Remove:** the narrative subtitle; the "$58,147 past due 52%" badge beside the KPI (KPI shows only its number, G9).
- **Balance-by-range donut:** approved in principle but rebuilt to the canonical interactive legible donut (G8); no white-on-white text.
- **Aging buckets as filter cards under the KPI:** each a badge showing the bucket, its percent of total as a large coloured number (never larger than the KPI) and the loan count, tappable to filter. Colours: 90+ red, 61-90 orange, 31-60 amber, 1-30 purple, Current blue.
- **Table / Pie toggle** on both Detail and Explore; side by side on Explore only if it fits (G4, G5).
- **Flag:** the aging range figures depend on legacy oldest-first payment allocation that the modern API does not replicate.

## W11 Fixed Asset Values (rebuild to the brief)
- **G10:** remove the "Group by" selector entirely. Classifications (Class, Building, Room, Asset Account) become table columns; a filter narrows, column-header sort reorders. Dropping "None" happens automatically.
- **Rebuild:** an NBV-led KPI with compact secondary reads of total cost, total accumulated depreciation, asset count and % depreciated (G7, G9); the depreciation story as a grouped or stacked bar per group (Cost, Accumulated, NBV together), bar over pie, breaking down by the currently sorted classification column; the 7-column table with key columns prioritised, Load-more, and G6 scroll and search; currency follows the org (fix the hardcoded £); a purposeful empty-group state.
- **Accept from OC:** column-header sorting; the bigger 52-asset dataset; one view with a toggle.
- **Reject from OC:** the donut (brief says bar over pie, and a donut shows one measure at a time); server paging; the dead icon-only download.
- **Flag:** % depreciated basis (accumulated over cost, or over depreciable); replacement-timing data availability; server-side sort; asset-row drill destination. Default view: table.

## W13 Purchasing Management (mostly rebuild)
- **Control levels:** Level 0 toggle Approvals | Encumbrances. Under Approvals only: filters (approval paths; Pending me / All, default Pending me), Table / Kanban, and KPI selection tiles (All / Pending / Approved / Rejected with counts). These vanish under Encumbrances.
- **Kanban:** scrollable; redesigned cards with clear hierarchy, mine-first, far less crammed. Drag a card or open it, both trigger the same confirm-and-review dialog.
- **Status:** one consistent badge with an icon; overdue shown under the status, not a separate column; never colour alone.
- **Table:** remove the "+4 more"; remove the far-right edit icon (tap the row to open); column-header sort, oldest-first default, an age column.
- **Keep Encumbrances** (OC cut it): committed-not-spent per period, values as text, org currency.
- **Accept from OC:** the record detail overlay (with Approve / Reject restored in it); colour always paired with a text badge; the bigger dataset.
- **Reject from OC:** cutting Encumbrances; the Hold, Close, Void and payment features (speculative, no API, unresolved payment-location dispute); removing sort. Note: including a Rejected tile / lane is a deliberate expansion beyond today's product, which hides rejected orders.
- **G11:** all toggles use the canonical styling. The "$5,195 to approve" KPI badge is replaced by the KPI selection tiles.
- **Flag:** the approve / reject API is unconfirmed; chart scope (recommend Encumbrances shows all commitments, independent of the queue filter); the payment-location dispute stays out of scope.

## W15 Bank Balances (keep Jo's)
- **Keep Jo's** money-first glance (total, delta versus beginning balance, overdrawn flag) and the searchable, sortable table. **Fix the below-the-fold clipping on the glance (G12).**
- **Accept from OC:** the accessible real-table markup (header cells and scope); red off the bars (amethyst ramp), red kept only on the Overdrawn chip; totals and bar scale over the whole set; the bigger 52-account dataset.
- **Reject from OC:** server paging (use Load-more plus scroll and search); removing column sort; the narrative glance subtitle and the dropped delta.
- **Rebuild:** honest available-cash framing (do not imply the whole total is spendable; ideally show available / unrestricted alongside the raw total); label the unreconciled basis as a compact caption, not a sentence; fix the £ currency; single account as a clear reversible focus with outflows labelled; table default, a sorted bar only where it earns its place (never a pie); real empty, no-rights, loading and error states.
- **Flag:** available cash by fund needs fund data (the biggest gap); the paged-accounts endpoint and the 7-line per-account activity are new backend work; the £ currency defect.

## W16 Accounts Payable By Due Date (keep Jo's v2)
- **Keep Jo's** money-first glance (total, overdue, due this week) and the searchable, sortable table; no pie.
- **Accept the horizon idea, simplified:** one aging-buckets filter, Overdue / Due this week / Due this month / Later, as tappable cards with amount and count, overdue emphasised, applied widget-wide. This replaces OC's separate horizon chip and the separate tappable figures. Keep the loading state.
- **Reject from OC:** the narrative glance subtitle; dropping "due this week"; folding Status into the Due-date cell (keep Status as its own badge).
- **Actionable:** a "Go to invoice" / "Go to transaction" deep link (inline pay/schedule is not feasible); tap the row for the invoice detail with that CTA.
- **Rebuild:** a date-ordered chart synced to the bucket filter (amethyst, overdue emphasised, only if it earns its place); optional vendor rollup; fix the £ currency; label the aging basis as a compact caption; a positive "nothing due" empty state.
- **Flag:** the aging basis (due date versus invoice date) is unconfirmed and moves every bucket; a coverage read against Bank Balances is a cross-widget phase item.

## W17 Gifts Pledges (keep Jo's)
- **Keep Jo's** pledge-based version: money-first, per-purpose progress bars with the "expected by today" marker and a behind status. This is the brief's lead direction and the data supports it.
- **Accept from OC:** the inline drill (a purpose expands to its donors / pledges, each pledge to its gift transactions, paged); fixing the as-of anchor to follow the selected date.
- **Reject from OC:** the pivot to campaign-GOAL progress (depends on a stored campaign goal the brief says is unconfirmed, and OC's own note flags a received-basis conflict that puts every summed figure in question); the three goal bands; the date range replacing the single as-of date (breaks sibling consistency with Remittance); removing sort; export as the only action.
- **Rebuild / polish:** remove the narrative subtitles (both versions have them); reframe "% Due" to "% fulfilled" and show over-received as positive, not an alarming negative; an overall goal bar only if a real goal is stored; canonical progress bars; fix the £ currency; a positive empty state; keep Remittance sibling consistency.
- **Flag:** the received-basis conflict (pledge-linked gifts only versus all posted gifts) blocks every summed figure and needs engineering; whether a campaign goal is stored; donor-level detail availability; the Pledge-Due calculation basis.

---

## Cross-cutting data and backend dependencies (document, do not invent)
- **Currency localisation** (£ to org currency): W05, W07, W11, W13, W15, W16, W17.
- **Backend / API gaps:** payroll permission gate (W03); loans oldest-first allocation (W10); purchasing approve / reject API (W13); AP pay path resolved to a deep link (W16); gifts received-basis and campaign goal (W17); fixed-assets server sort and asset drill (W11); bank per-account activity and available-cash-by-fund (W15).
- **Basis confirmations:** AP aging basis, due date versus invoice date (W16); gifts pledge-due basis (W17); fixed-assets % depreciated basis (W11).
</content>
