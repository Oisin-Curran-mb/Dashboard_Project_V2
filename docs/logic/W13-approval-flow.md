# W13 Purchasing Management: how a purchase request moves (legacy model and the V2 Kanban)

Written 2026-09-27. Every claim below is tied to a line in the legacy repository (`MBAccounting`, read-only reference) or to a function in the W13 block of `index.html` (prefix `purF`). POR = `Shelby.Repository/EntityRepositories/PO/POOrderRepository.cs`.

Lucid documents (one per diagram):

| # | Diagram | Link |
|---|---|---|
| 1 | Record statuses and derived states | https://lucid.app/lucidchart/b38f2d26-7e12-44f8-872b-b29238475068/edit |
| 2 | Approval path evaluation (request and payment) | https://lucid.app/lucidchart/7a3f7665-f755-486e-be03-8f4afb634d22/edit |
| 3 | Payment path to Paid and Closed | https://lucid.app/lucidchart/3c939771-a231-4b52-a637-9084c4b59ec6/edit |
| 4 | Kanban lanes, turn badge, scopes and gates | https://lucid.app/lucidchart/dc9b5473-284a-4721-94cc-15a3a71a4ff0/edit |

## 1. The one stored status

`PO_Order.Status` (`Shelby.Global/Enumerations/Enumerations.cs:449`) is the only status on the record.

| Value | Name | Meaning | Demo (`stage`) |
|---|---|---|---|
| -1 | NotSubmitted | Saved, submit later | not modelled |
| 0 | Unapproved | Request Approval Path is live | `Pending` |
| 1 | Approved | Request path complete; `OrderNumber` assigned (POR:1787); Payment Approval Path is live | `Approved` |
| 2 | Closed | Set by the AP post that carries `PurchaseOrderStatus = 3` (`APInvoiceRepository.cs:919`); undo reopens to Approved (`:907`) | `Closed` |
| 3 | Voided | Status list enables Voided only while Approved (`POApprovalsGrid.js`) | `Voided` |
| 4 | Rejected | **Never stored.** Filter = Status 0 plus a row with `RejectedID` (POR:1064) | rejected row in `appr[]` |

Three things people read as statuses are derived, not stored:

- **Rejected** = an acted row with `RejectedID` on an Unapproved order. Clearing the rejection (POR:1849) revives it.
- **On hold** = an acted row with `HoldReason` (POR:1858). Demo: `hold` flag plus a `state:"hold"` row.
- **Paid** = the linked AP invoice has `JournalID` set and `UndoJournalID` null (POR:428-436). Demo: `paid` flag, check number `CHK-nnnn`.

Legacy note: the manual Status list lets a user pick Closed from any status ("Closed enabled in all cases" in `POApprovalsGrid.js`), and the demo follows it: Close is offered from every lane or column, on hold or not (`purFMoveCheck`). An earlier build was stricter, allowing Close only from Paid; the owner reversed that on 27 Sep 2026 ("follow the rules that page follow as it how it need to work, so close at any time is possible") and `docs/decisions/W13.md` carries the ruling.

## 2. Approval paths: what the organisation can build

A path (`PO_Approval`) is a list of approver rows (`PO_ApprovalPath`): `Sequence`, `UserTenantID`, `RequiredMinimum`.

- **Then** opens a new Sequence (a new level). **Or** adds another approver at the same Sequence. Any one approver satisfies a level.
- **The dollar minimum belongs to the approver row**, not the level: "X has to approve if at least $N". An approver applies to a request only when the total reaches their minimum. Demo: `purFStepUsers(step, amt)`; `purFSteps` drops levels with no applying approver.
- A creator who is not on the path is shown as pseudo level 0, "Starts with <creator>" (POR:346, 492).
- The same path can be flagged ForRequest and/or ForPayment; the order stores `ApprovalID` (request) and `PaymentApprovalID` (payment). Demo: `path` and `payPath` (defaults to the request path).

Acted rows (`PO_OrderApproval`) exist only when someone acts. Approved = a row with neither `RejectedID` nor `HoldReason`. Rows that are neither approved, rejected nor held are deleted on save (POR:1793).

## 3. How a path is evaluated (diagram 2)

`ApproveOrder` (POR:1742-1793), mirrored by `purFTurn` and `purFPathDone`:

1. **Release.** If no approver's minimum is reached by the total, every row is auto-approved on submit (POR:1766-1768) and the order goes straight to Approved. Demo badge: "No approver required at $430.00 on Education Ministry. Approve to release." (`purFTurn` returns `kind:"next", none:true`; approving completes the path because `purFPathDone` is true for an empty step list).
2. **Rejected blocks.** Any rejected row stops evaluation (POR:1751 `!Any(x => x.Rejected)`). Demo: `kind:"rejected"`, badge "Rejected by X: reason".
3. **Hold blocks.** Demo: `kind:"hold"`, badge "On hold: reason", card not draggable, only Void allowed. Legacy: the hold row stays and is included in `Max(Sequence)` (see section 6).
4. **Highest acted level** = `maxSeq`. Approving at level k marks every row at Sequence ≤ k approved (POR:1754-1755). So approving out of turn is allowed by the server and implies the lower levels. Demo: `purFPathDone` requires every applicable level's `seq ≤ max approved seq`.
5. **Walk upward** from `maxSeq + 1`. Threshold skip rule differs by path type:
   - Request path: a level is skipped only when **every** approver on it is over the total or inactive (POR:1760-1770, `items.All`).
   - Payment path: skipped when **any** approver on it is over the total (POR:708-716, `items.Any`).
   - Demo uses the request rule on both paths ("Skipped: below every minimum on this level").
6. **Complete.** No unapproved row left: Status 0 → 1 and the "approved" email (POR:1776-1779). If someone unticks an approval on an Approved order, Status 1 → 0 (POR:1781-1785). Payment path: `ApprovedForPayment = true` (POR:720), demo `payDone`.
7. **Who is next.** The first applicable level above `maxSeq`, reduced to the approvers whose minimum applies. Demo labels: "Your approval next (level k of n)", "Your approval later. Waiting on X (level k of n)", "Waiting on A or B (level k of n, payment)".

## 4. Payment path (diagram 3)

> **This whole section applies only when the company has the payment approval process switched on.** It is off by default: see §5c for `PO_Company.UsePaymentApprovalProcess`, what the legacy skips when it is off, and the approval-path board the widget shows instead. The demo ships with it off (`PURF_USE_PAY = false`).

Approved → `PO_OrderInvoice` per vendor invoice → Payment Approval Path rows `PO_OrderInvoiceApproval` (they carry an explicit `Approved` bit) → `ApprovedForPayment` when no row is unapproved → AP invoice created when the preference is on → check posted (`JournalID`) = Paid → the AP post with `PurchaseOrderStatus = 3` closes the order; undoing the post reopens it.

Demo gates: `purFPaySubmit` refuses until `payDone` ("payment approval must finish before a payment is entered") and while on hold; a Paid card cannot be voided ("Reverse the check in Accounts Payable first").

Encumbrance (`GL/GLAccountRepository.cs:2220`): open detail dollars while Status < 2 and not rejected.

## 5. The Kanban (diagram 4)

**Lane** (`purFLane`) is derived, never a stored status:

| Lane | Condition |
|---|---|
| Pending approval | `stage === "Pending"` (Status 0) |
| Payment approval | `stage === "Approved"`, `payDone` false, `paid` false |
| Ready to pay | `payDone` true, `paid` false (= ApprovedForPayment) |
| Paid | `paid` true (check posted) |
| Finish column | `stage` Closed or Voided |

**Turn badge** (`purFTurn`), first match wins: no live path → Paid / Approved for payment / stage; rejected; hold; release (no level applies); complete; me on the open level (`next`); me on a later level (`mine`); otherwise `waiting`.

**A drop is an act on the live path** (`purFApplyMove`):

- Pending approval → Payment approval = my approval at my level (`purFApproveStep`); completes the request path when every applicable level is satisfied (sets `stage:"Approved"`).
- Payment approval → Ready to pay = my payment approval (`purFApproveStep` on `payAppr`); sets `payDone`.
- Ready to pay → Paid = enter the payment (`purFPaySubmit`).
- Paid → Closed. Any unpaid lane → Voided (allowed even on hold).

**Gates** (`purFMoveCheck`, `purFCanDrag`): Closed and Voided are final; hold blocks every move except Close and Void; rejected blocks approval until cleared on the Approvals tab; one lane at a time, forward only; Paid cannot Void. **Every card that is not Closed or Voided can be picked up** - `purFMoveCheck` rules on the drop, not the pickup, so a forward move still needs the viewer's turn and refuses by name, while Close and Void are status actions and do not (owner, 27 Sep 2026; this closed the gap where waiting, rejected and held cards could never reach Void).

**Scope chip** (`purFNeedsMe`): "Awaiting my approval next" = `kind === "next"`; "Awaiting my approval" = `next || mine`; "All requests" = everything. The headline count uses the current scope.

## 5b. The record pop-up = the Requests/Update page

Source: `Shelby.Web.Financials/PurchasingManagement/Requests/Update.aspx(.cs)` and `Content/scripts/Controls/POApprovalsGrid.js`. Demo: `purFGridRows`, `purFGridEnable`, `purFGridTick`, `purFStatusOptions`, `purFRecordSave` in the W13 block.

**Grid rows** (`LoadApprovals`, Update.aspx.cs:507-640): one row per approver in path order. A creator who is not on the path gets a "Starts with <creator>" row at Sequence 0. A second approver on the same Sequence reads "Or" (indented). The last non-Or row reads "Ends with". Inactive and out-of-office approvers are flagged in red. Existing acted rows are matched by user.

**Cascade** (`POApprovalsGrid.js:16-37`): ticking Approved on a row ticks every row with Sequence at or below it and clears their Rejected, Hold and both Reasons. Unticking clears Approved and Rejected on every row with Sequence at or above it.

**Enablement** (`setApprovalRows`, `POApprovalsGrid.js:50-90`), walking the rows in order:
- a row is in reach while the viewer's row has not been passed, or it shares the viewer's Sequence (Or siblings);
- Approved enabled = in reach and not Rejected and not Hold; Rejected = in reach and not Approved and not Hold; Hold = in reach and not Approved and not Rejected;
- a Reason is editable only while its own box is ticked and in reach;
- an acted row on a Sequence after the viewer's disables every Approved and Rejected box; a viewer who is not on the path (and lacks the ApprovalOverride right) gets every Approved and Rejected disabled;
- any acted row disables Type, Approval Path, the Vendor and Ship To pickers, the Detail selects and the add-line controls.

**Status list** (`setApprovalRows` tail, `LoadApprovals`): the current value and Closed are always enabled. Voided only from Approved, and only when the creator is on the path. Approved from Closed, or from Voided when every box is ticked. Unapproved is never re-selectable.

**Submit for Approval** (Update.aspx:82-125, .cs:391-393, 704-705): shown while Unapproved with nothing approved. Ticking it ticks the first grid row when that row is the viewer's. Saved unticked, the order stores Status -1 (not submitted); the hover text calls that a hold on the approval process. The demo shows it as a hold-style badge.

**Save** (`buttonUpdate_Click`): one postback applies status, header, grid rows and the submit flag; `ApproveOrder` then flips 0 to 1 when no row is unapproved, or 1 back to 0 when one is. The demo's `purFRecordSave` does the same, and the Kanban drop (`purFApproveStep`) uses the same cascade and stores the same rows.

## 5c. The company setting that removes the payment process, and the path board

Added 2026-09-28. **`PO_Company.UsePaymentApprovalProcess`** is `bit NOT NULL DEFAULT 0` - off on a new company (`Plugin/sql/Archive/1045_V810_SchemaUpdate.sql:24`; entity `Shelby.Data/EntityClasses/POCompany.cs:512`; the "Use Payment Approval Process" checkbox on Purchasing Management > Company Information, `CompanyInformation/Default.aspx.cs:46,86`). The demo models it as `PURF_USE_PAY`, default `false`, and §4 above applies only when it is on.

What the legacy does when it is off:

| Off | Legacy |
|---|---|
| no payment path can be chosen on a request | `Requests/Update.aspx:93` hides `#pPaymentApprovalPath` and the Payment Approval tab, so `PO_Order.PaymentApprovalID` stays NULL |
| nothing hydrates | the whole invoice / approval-path block is inside `if (order.PaymentApprovalID != null)` (POR:322-529); `EmailOrderInvoice` returns at POR:1489 |
| no invoice approvals exist | no `PO_OrderInvoice` rows, so `ApprovedForPayment` is never set and `APInvoiceRepository.CreateFromPO` is never reached (POR:879-881) |
| AP goes manual | the approved-payment-request dropdown is not loaded and the PM link is shown instead (`AccountsPayable/Transactions/Update.aspx.cs:496,625`) |
| `CreateInvoiceInAccountsPayable` is forced off | `CompanyInformation/Default.aspx.cs:87` |
| path admin collapses | only `ForRequest` paths are listed; the For Request / For Payment columns and checkboxes are hidden (`ApprovalPaths/Default.aspx.cs:25-51`) |

An approved PO therefore goes **straight to Accounts Payable**, entered and paid by hand: `ApproveOrder` only walks the request path and sets `Status = 1` (POR:1742-1793); there is no gate after it. Note that the legacy's own Purchasing Management data panel works this way unconditionally - it never reads payment at all (`DataPanelControls/PurchasingManagement.ascx.cs:80-122`).

**So with the flag off the board is the approval path, not the lifecycle.** `purFColOf` replaces `purFLane` as the placement rule, and `purFCols` builds the columns:

| Column | Holds |
|---|---|
| one per level of the **selected** path, in Sequence order | requests whose next level to act is that level (`purFOpenLevel`) |
| Approved | `stage === "Approved"`; the request has left for AP |
| Finish (Close / Void) | drop target only, always shown |

- `purFOpenLevel` walks the levels the **amount** reaches (`purFSteps`), then maps the chosen Sequence back to its position in the full path, because the columns are the whole path. A level skipped by its threshold is passed over; a request no level applies to sits in the first column with the release badge; a rejected or held request parks at the last applicable level.
- Column title = the level's approvers joined with "or" (`purFWho`, so the viewer's own level reads "(you)"). Sub-line = "from $N" when the level's minimum is above zero. Accessible name and hover = the legacy "Starts with / Then / Ends with ... from $N" string (`Shelby.Data/EntityClassExtensions/POOrder.cs:120-166`; a one-level path reads "Ends with"). A level whose minimum is above every amount on the board is dimmed and reads "Not required under $5,000".
- Gates: forward is any later level or Approved, and records my approval at my level; approving at a level implies the ones below it (POR:1754), so the landing column is the model's decision, named by `purFLandCol`. A leftward drop is refused. Close from any column; Void on any open order, since nothing is paid.
- The path chip is required and offers no "All approval paths"; the status chip is not offered, the columns being the status axis.

Rulings, wording and the defects found while building this are in `docs/decisions/W13.md` under 28 Sep.

## 6. "Awaiting my approval next" vs "Awaiting my approval"

Legacy (`FilterOrders`, POR:1058-1093). Both start from Status < 1 with no rejected row.

- **Awaiting my approval next** (POR:1071-1085): I am on the path and `Max(acted Sequence) + 1 == my Sequence`, or I am the creator (not on the path) and nothing has been acted yet. It is the strict "it is my turn now" list.
- **Awaiting my approval** (POR:1087-1093): I am on the path (or the creator) and **I have not acted on this order**. My level may be far down the path; the order still appears. It is the "I will have to approve this at some point" list.

Demo (`purFNeedsMe`): "next" = `purFTurn(po).kind === "next"`; "awaiting" = `kind === "next" || kind === "mine"`. Same meaning, with two deliberate differences:

1. **Hold.** Legacy keeps the hold row in `Max(Sequence)`, so a hold at level 1 makes level 2 see the order as "next" (a known quirk). The demo returns `kind:"hold"` before computing `maxSeq`, so a held order leaves both scopes and shows the hold badge instead.
2. **After I acted.** Legacy drops the order from "awaiting" as soon as any row of mine exists, including my own reject or hold. The demo drops it once my level is satisfied (`purFMyLevel` finds no open level with me); my own reject or hold shows as that badge and is out of both scopes as well, so the outcome matches.

Observation, not verified in the running product: with no acted rows at all, the legacy "next" query relies on `Max` over an empty set, which SQL returns as NULL; the creator's Sequence 0 "Starts with" row is what makes level 1 appear as next. The demo computes `maxSeq = 0` for an empty list, so level 1 is next without a pseudo row.
