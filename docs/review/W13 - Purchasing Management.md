# W13 Purchasing Management: review pack

Generated 2026-09-25 by `_tools/review-pack.js`. Three sources, verbatim, in their own sections. Nothing here is a decision; the owner's ruling goes in `docs/decisions/W13.md`.

| Source | Where | As of |
|---|---|---|
| 1. Jo's PR feedback | `_ref/Design Review (Jo decisions on OC).md`, her one comment on PR #3 | 23 Sep 2026 |
| 2. Jo's notes in her final version | comments and text inside her `purchasing` regions of `_ref/jo-phase2-8958e49.html` | phase-2 @ 8958e49, 25 Sep 2026 12:34 |
| 3. Our diff doc | `_ref/oisin-docs/Jo vs Oisin - Design Differences.md` + Build Sheet | PR #3 @ 198ffd5, 21 Sep 2026 |

Our version in the build: `purchasing-mb` (prefix `purF`). Jo's live version: `purchasing`.

---

## 1. Jo's PR feedback

- **Control levels:** Level 0 toggle Approvals | Encumbrances. Under Approvals only: filters (approval paths; Pending me / All, default Pending me), Table / Kanban, and KPI selection tiles (All / Pending / Approved / Rejected with counts). These vanish under Encumbrances.
- **Kanban:** scrollable; redesigned cards with clear hierarchy, mine-first, far less crammed. Drag a card or open it, both trigger the same confirm-and-review dialog.
- **Status:** one consistent badge with an icon; overdue shown under the status, not a separate column; never colour alone.
- **Table:** remove the "+4 more"; remove the far-right edit icon (tap the row to open); column-header sort, oldest-first default, an age column.
- **Keep Encumbrances** (OC cut it): committed-not-spent per period, values as text, org currency.
- **Accept from OC:** the record detail overlay (with Approve / Reject restored in it); colour always paired with a text badge; the bigger dataset.
- **Reject from OC:** cutting Encumbrances; the Hold, Close, Void and payment features (speculative, no API, unresolved payment-location dispute); removing sort. Note: including a Rejected tile / lane is a deliberate expansion beyond today's product, which hides rejected orders.
- **G11:** all toggles use the canonical styling. The "$5,195 to approve" KPI badge is replaced by the KPI selection tiles.
- **Flag:** the approve / reject API is unconfirmed; chart scope (recommend Encumbrances shows all commitments, independent of the queue filter); the payment-location dispute stays out of scope.

---

## 2. Jo's notes in her final version

**Registry rows she ships (id · title · size):**

- pur · Purchasing Management · wide
- pur_k · Purchasing Management (Glance) · kpi
- pur2 · Purchasing Management (approved orders, detail) · xwide
- pur3 · Purchasing Management (single approval path) · wide
- pur4 · Purchasing Management (nothing awaiting me) · wide
- pur5 · Purchasing Management (not on an approval path) · wide · state empty

**Comments in her code (line numbers in `_ref/jo-phase2-8958e49.html`):**

- L1033 [css]: ---- Header ----------------------------------------------------------
- L1052 [css]: ---- Queue table (over shell .wt-row primitives) ---------------------
- L1066 [css]: ---- Encumbrance ("Committed") chart ---------------------------------
- L1104 [css]: Queue vs Committed data selector (top-level, not a view toggle)
- L1112 [css]: Approvals kanban: lanes = approval stages, cards = orders, tap to act
- L1148 [css]: ---- Loading skeleton ------------------------------------------------
- L1154 [css]: ---- Caught-up / positive state tint ---------------------------------
- L1158 [css]: ---- Focus overlay: purchase-order detail (approve/reject inline) -----
- L1199 [css]: ---- Narrow viewport: stack the fact grid ---------------------------
- L1979 [css]: Consistent table header styling across every widget
- L5430 [js]: Receivable Invoices Outstanding: our finalized W05, additive. kind "receivables-mb", prefix arF. 1-to-1 with Jo's AR widget PLUS the drill-modal enhancement: row checkboxes, an always-enabled Confirm beside Close, and on Confirm the dev-intent note "Move to unposted transactions" with a live selected count.
- L7168 [js]: (1) DATA --------------------------------------------------------------
- L7245 [js]: Synthesised detail for the focus overlay (kept out of row data to stay lean).
- L7254 [js]: (2) RENDER ------------------------------------------------------------
- L7385 [js]: (3) POPOVERS ----------------------------------------------------------
- L7400 [js]: (4) HANDLERS ----------------------------------------------------------
- L7433 [js]: (5) FOCUS OVERLAY (renderModal branch: modal.type==="pur-po") ---------
- L7481 [js]: Glance drill: open the Detail view (queue + committed) in a focus overlay.

---

## 3. Our diff doc

### 3a. Jo vs Oisin - Design Differences

Ported 2026-09-08 against Jo's `phase-2` @ `71ca056` on branch `oisin-v2-rebuild`. **First-ever port of this widget.** Ours is `kind:"purchasing-mb"`, prefix `purF`/`PURF_`, entry `purFContent`, CSS root `.purf-*`, actions `data-purf`, six registry entries on the `(OC)` convention. Source of truth: our built Final `purF`, `FC_VERSION[13]` = 2.6, all rounds dated 2026-08-19.

**Collision note.** Jo's own purchasing widget declares four functions whose names begin with the letters "purF" but which are HERS: `purForStatus`, `purPathsForStatus`, `purFiltered` and `purFindOrder`. Every one of our names is `purF` plus a capital letter, so none can shadow one of hers. Verified after the port: each of her four is still defined exactly once and byte-identical, her whole 35,644-byte purchasing block and her 12,468-byte `.pur-*` CSS cluster are byte-identical, and her `.pur-*` selectors are neither redeclared nor overridden. Her data-actions stay `pur-*` and ours are `data-purf`, so her delegated click listener never sees ours and ours never sees hers.

Verified by `w13-purchasing-mb.driver.js`, 763/763. All ten previously ported drivers re-run green afterwards.

| # | Difference | Jo's version | Ours | Grounded in |
|---|---|---|---|---|
| 1 | What the board means | Four payment-progress lanes (Pending approval, Approved, Approved for payment, Paid / closed), the last three derived from a hash of the order id rather than from data | Three columns that ARE the approval states on the real record screen's Approvals tab: Pending, Approved, Rejected | [DESIGN - Step 4 v2.2, owner correction 2026-08-19: "this is the approval process, this is how kanban should be"; states confirmed from the owner's live Approvals tab screenshot] |
| 2 | Terminal states | No terminal column; nothing ever leaves her board | The split Finish column: Close on top (paid orders only), Void below (unpaid only), each behind a confirm popup with a reason. A confirmed card leaves the board and stays findable in the Table. It appears ONLY when the status filter is "All statuses", because a single-state board is not the whole flow | [DESIGN - Step 4 v2.6 + Views; record statuses Closed (2) and Voided (3) verified live on beta1, 2026-08-19] |
| 3 | How a request is actioned | Card click opens a focus overlay with Approve and Reject buttons and an optional note | Every card is draggable; a drop on another column opens the Reason / note popup and only Confirm applies the move. Cancel changes nothing, and a same-column drop is a no-op | [DESIGN - Step 4 v2.2 drag-to-action, owner instruction 2026-08-19, adopting dossier 11.2 in drag form] |
| 4 | Hold | Not offered | Hold and remove hold, each recording a reason. A held card turns yellow with a lock and its reason and refuses to be dragged until the hold is removed; the Approvals grid refuses approval changes on it too | [DESIGN - Step 4 v2.4; the real Approvals tab has a Hold checkbox plus Reason per approval row, owner screenshot 2026-08-19] |
| 5 | Card colour | Colours by lane and by "needs me" | Card colour carries the payment sub-state and is always paired with a text badge: neutral normal, amber "Payment: not paid" badge on an unpaid approved card, green card for paid, yellow card for on hold. No extra columns | [DESIGN - Step 4 v2.3 badge, v2.4 colour-state model, owner decisions 2026-08-19] |
| 6 | The record popup | Read-only fact grid, line items and an approval trail, with Approve / Reject / Open full record in the footer | Record-screen parity: header form (vendor block, Ship To, Email, Type, record Status in its own Unapproved / Approved / Closed / Voided vocabulary, Approval Path editable only while pending and not held, Payment Approval Path, Requisition or Check Request number, Issued To, Agent, Shipping, dates), Detail line grid with account distribution and Tax / Freight / Other / Total, the Approvals tab as the real interactive grid, Attachments with an Add stub, editable Note plus activity log, and the Payment Approval tab. Update and Cancel mirror the real footer | [DESIGN - Step 4 v2.5, owner instruction 2026-08-19; grid verified against the live Requests/Update screen, beta1] |
| 7 | Payment entry | Not offered; her paid lane is decorative | The Payment Approval tab reproduces Add Invoice Payment Approval, the invoice grid (Invoice Number / Tax / Freight / Other / Check # / Check Date / Setup Information), the per-invoice account distribution, and the real Submit for Approval control, which marks the request paid and turns its card green. An unpaid approved card opens straight onto this tab | [DESIGN - Step 4 v2.4 and v2.5. **DISPUTED, carried, no side taken:** see the open items below] |
| 8 | Second view | A top-level Approvals / Encumbrances data selector, then a Table / Kanban sub-toggle inside the queue | One always-visible Kanban / Table segmented toggle in the widget header at Explore and Detail. The Table's job differs from the board's: it lists everything over time, so its status list adds Closed and Voided and its "All statuses" includes the archive, while the board stays the live approval flow | [DESIGN - Step 4 v2.1 (the way back must never require the 3-dot menu) and v2.6 (the two views have different jobs)] |
| 9 | Encumbrance chart | Committed-per-accounting-period bar chart, its own table, its own hover card and its own caption | Cut. There is no chart, no chart table, no bar hover card and no data selector | [DESIGN - Step 4 What Got Cut, owner decision 2026-08-19, over the dossier's "keep both jobs" recommendation, which is recorded as a divergence] |
| 10 | Status filter values | Her four hardcoded personal-queue stages (Awaiting my approval next, Awaiting my approval, Unapproved, Approved) | Board: All statuses, Pending, Approved, Rejected. Table: those plus Closed and Voided. A single state hides the other columns AND the Finish column; an archive value left over from the Table falls back to All statuses on the board | [DESIGN - Step 4 Filters table + Fine-Tuning; the four legacy options remain the codebases' status filter but are no longer columns] |
| 11 | Sort | User-sortable on four columns, defaulting to age descending (newest waiting first) | Fixed oldest first (Date Issued ascending), in both views and inside every column, with no sort control at all. It is the aging read and it defines what "top" means in every trimmed view | [DESIGN - Step 4 Data Table Sort, settled by owner decision 2026-08-19, Sign-off row 4] |
| 12 | Volume | Renders her whole filtered queue, unpaged | Per-tier caps: 2 cards per board column at Explore with a "+N more, view in the PO Table" link, 5 table rows at Explore, 10 at Detail. The totals row always totals the whole filtered set, never the visible page | [DESIGN - Step 4 Size behaviour and the Trimmed-view rule; API - Step 5 v2, the table is MUST PAGINATE and the board is column-capped] |
| 13 | Headline | The count of whatever stage is filtered, plus an outstanding-amount pill | The Pending count, labelled "pending approval", with the pending outstanding total beneath it. It is scoped by the approval path and deliberately NOT by the status filter, because it is the pending read | [DESIGN - Step 4 Headline math, `FC_KPI_HEADLINE[13]`, checked in code 2026-09-07] |
| 14 | Rejected requests | Never shown, matching the legacy access rule | Given their own column, a deliberate departure that needs the API to start serving rejected orders | [DESIGN - Step 4 v2.2, owner-accepted forward design; API - Step 5 v2 and Sign-off row 9] |
| 15 | Table-only filters | None | Department, Year and an Overdue-only toggle, visible at Detail only. All three are unconfirmed fields rendered as if real per Rule 11, and each popover says so on screen | [DESIGN - Step 4 Filters table; Sign-off rows 1 to 3, all still open] |
| 16 | Money | Shell `money()`, whole dollars | Our own `purFMoney`, two decimals, because real orders in the set are $87.50 and $76.25 and rounding would print a cent value as a dollar one | [DESIGN - Step 4 rounding rule: "amounts render as dollars with two decimals in the build"] |

**Parity kept (identical to Jo, or her component reused verbatim).** The board rides on her `.pur-kanban` / `.pur-kcol` / `.pur-kcol-h` / `.pur-kcard` / `.pur-kc-*` / `.pur-kempty` components; the record modal's five tabs ride on her `.pur-tabs` / `.pur-tab`; the header is her two-row `.dep-hd` grid with the chips left and the view toggle right and the KPI number on the left; the table is her `.wt-row` / `.wt-head` / `.lr-main` / `.wt-c2` / `.dep-total` primitives carrying ARIA table roles so the real table semantics survive; the filters are her `.filter-chip` with the secondary fill and leading filter glyph, and the approval-path menu is her `.dd-search` + `.menu-scroll` searchable picker rather than a native select; the dialogs are her `.modal` family; the empty states are her `.state` block; loading is her `.sk` skeleton plus `.bgt-spin`. Behaviourally identical: the Approval Path list re-derives from the selected status, an impossible path selection resets to "All approval paths", the chip is omitted rather than rendered dead when only one path exists, and the purposeful empty-state copy is adapted from her build with attribution on screen. Only a filter change fetches; the view toggle and the modal tabs are local re-renders and never flash a skeleton. [DESIGN - parity with Jo]

**Open items carried, not resolved.**
- **The Feargal C3 payment dispute is live and no side is taken.** Claim A: the dashboard should preserve the existing payment functionality and may redirect to the established payment screen (his stated requirement, Step 4 item 3, 2026-08-25). Claim B: payment entry belongs in the record popup (owner-directed 2026-08-19 and verified against the live screen). The Step 5 v2 spec deliberately gates its payment endpoint (API 7) as DISPUTED. This port renders the BUILT behaviour, and the Payment Approval tab says on screen that the question is open and carried. If the redirect ruling lands, the tab is dropped and the unpaid-card selection becomes a navigation.
- **Voided-request financial treatment is recorded both sides with no reversal behaviour asserted** (Step 4 item 5, 2026-08-25). Void here changes the record status and records a reason. It claims no reversal, no journal entry and no credit, and the confirm popup says so.
- **Dossier finding 11.6 is Unreviewed, and so is the stable-columns half of 11.5.** The built table does use one fixed column set, but the finding has no assigned status, so the column commitment stays provisional. (The aging half of 11.5 is Accepted and built.)
- **Department, Year and Overdue are UNVERIFIED Rule 11 fields.** If any turns out not to be real, that filter, and for Overdue the red row highlight and text flag, drop from the Table view. No other view uses them.
- **No dashboard API serves or writes any of this yet:** approve and reject with a reason, hold, payment status and payment entry, and the Closed / Voided archive (Sign-off rows 9 to 13). Every action in this port is in-memory for the session and the modal footer says so.
- **Feargal's items 1, 2, 4 and 6 (2026-08-25) are documented, not built:** ordered approver sequences with the viewer's own position, permission-aware actions, and filters that separate purchase-order approval from invoice or payment approval. The Approvals tab names the gap on screen rather than implying the sequence is live.
- **Drag to action is pointer-only.** No keyboard equivalent for moving a card exists yet; the record modal, reachable by Enter on a table row, is the keyboard route to a request. Flagged in Step 4 Accessibility, not solved here.
- **Volume ceilings are TO CONFIRM.** No worst-realistic open purchase order count has a documented basis, so the per-column cap and the page size are unvalidated.

*Section added 2026-09-08 on branch oisin-v2-rebuild (base 71ca056).*

---

### 3b. Final Version Build Sheet

_No Build Sheet section for W13 (detailed rows were only written for W01-W05)._

---

## Owner's ruling

_Fill in per item, or write the decision straight into `docs/decisions/W13.md`._
