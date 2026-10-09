# Purchasing Management: how the original works, and how V2 works

Written 9 October 2026 from the legacy code in `MBAccounting` (file and line references are to
that repository) and the V2 build in this repository. Three parts:

1. The original dashboard panel: what it reads, and the exact rules behind each filter.
2. The V2 widget: the same rules, plus one extra option, "All requests".
3. The original record screen (`PurchasingManagement/Requests/Update/{orderID}`) and how the V2
   pop-up mirrors it read-only with three actions, including which fields and tabs come and go
   with the company's setup.

---

## 1. The original dashboard panel

Files: `Shelby.Web.Financials/DataPanelControls/PurchasingManagement.ascx` (markup) and
`.ascx.cs` (rules). It is a data-panel control on the Financials dashboard, refreshable, and it
remembers the user's two dropdown choices as a user preference (`UserPreferences.PODataPanelControl`).

### 1.1 What it reads

| Data | Source | Used for |
|---|---|---|
| Purchase requests of the current company | `POOrderRepository.GetAllByCurrentContext()`: `PO_Order` rows where `CompanyID` is the current company | the table, the chart, the path list |
| Record status | `PO_Order.Status`: -1 not submitted, 0 Unapproved, 1 Approved, 2 Closed, 3 Voided | every filter |
| Acted approval rows | `PO_OrderApproval` (one row per approver who has acted): `Sequence`, `UserTenantID`, `RejectedID`, `HoldReason`, `Approved` | whose turn, rejected, hold |
| The request's approval path and its levels | `PO_Approval` (name) and `PO_ApprovalPath` rows (`Sequence`, `UserTenantID`, `RequiredMinimum`) and `PO_ApprovalUsers` | the two Awaiting filters, the path dropdown, who may see a path |
| Who created the request | the earliest `SS_Updated` row of the order (`SSUpdateds.OrderBy(When).First().UserTenantID`) | a creator who is not on the path counts as "on it" for the Awaiting filters |
| Vendor name, issued date, total, requisition and order numbers | `PO_Order` and `AP_Vendor.CorePerson.FullName` | the table |
| Line detail dollars per GL period | `PO_OrderDetail` joined to the order: `Quantity * UnitPrice - DollarsApplied`, grouped by `GLPeriod` | the Encumbrances chart |
| Rights | admin flag; `/PurchasingManagement/Requests/ApprovalOverride` (Update) | Unapproved and Approved visibility |

### 1.2 The one rule that applies before anything else

```csharp
this._orders = this.repository.GetAllByCurrentContext()
    .Where(x => !x.POOrderApprovals.Any(y => y.RejectedID != null));   // .ascx.cs:86-87
```

**A request with a rejected approval row is never shown in the panel**, under any option, in the
table or in the chart. Rejected requests are reached from the Requests list page
(`Requests/Default.aspx`, "Rejected" radio: status 0 plus a rejected row, `POOrderRepository.cs:1066`).

### 1.3 The "Select" dropdown: four options, four queries

`me` below is the current user's tenant id. "On the path" means a `PO_ApprovalPath` row for me on
the request's path. "Created it" means the first `SS_Updated` row is mine.

| Option (value) | Rule (`.ascx.cs:91-113`) | In words |
|---|---|---|
| **Awaiting my approval next** (0) | `Status == 0` and (on the path or created it) and ( (not on the path and nothing has acted) or (on the path and `Max(acted Sequence) + 1 == my Sequence`) ) | Pending, and my level is exactly the one after the highest level that has acted; or I created it off-path and nobody has acted yet. |
| **Awaiting my approval** (1) | `Status == 0` and (on the path or created it) and no acted row of mine | Pending, I am on the path (or created it) and I have not acted in any way. |
| **Unapproved** (2) | `Status == 0` and (no path, or admin, or override right, or I am a user of the path, or the path has no users) | Every pending request on a path I am allowed to see. |
| **Approved** (3) | `Status == 1` and the same visibility rule | Every approved order on a path I am allowed to see. |

Sort: by requisition number, except Approved, which sorts by order number (`:115-118`).

Notes on the mechanics:

- "Acted" means any `PO_OrderApproval` row: approved, rejected or **held**. A hold row at level N
  therefore raises `Max(Sequence)` to N, so the request shows as "Awaiting my approval next" for
  level N + 1 while N is still holding it. This is how the legacy code behaves; it reads like a
  defect rather than a design.
- Because rejected rows are excluded first (1.2), the four queries never see them.
- Not-submitted requests (`Status -1`) are excluded by `Status == 0`.
- Closed (2) and Voided (3) never appear.

### 1.4 The approval path dropdown

Built from the requests that survive the Select option (`:129-149`): the distinct paths of those
requests, limited to paths I may see (admin, override right, I am a path user, or the path has no
users), sorted by name.

- No matching requests: the list reads "No matching requests found" and is disabled.
- One path: that path, and the dropdown is disabled.
- More than one: "All approval paths" is inserted at the top.

Choosing a path narrows both the table and the chart (`:154-156`).

### 1.5 The table

Columns `Requisition#` (right-aligned), `Vendor`, `Issued` (short date), `Total` (currency), and a
pencil link to `~/PurchasingManagement/Requests/Update/{OrderID}`. Under **Approved** the first
column becomes `Order#` bound to `OrderNumber` and the last becomes `Outstanding`
(`:158-162`). Footer: `# Requests: n` and the sum. No sorting, no paging, scrolls at 310 px with
static headers.

### 1.6 The Encumbrances chart

Same filtered requests, joined to their lines (`:167-178`):

- only lines whose GL period belongs to this company's GL years;
- only lines with `Quantity * UnitPrice - DollarsApplied > 0` (open dollars);
- grouped by GL period, ordered by GL year begin date then period, labelled "`period` `year`";
- bar value = sum of open dollars in the period.

So the chart is "budget reserved by the filtered requests, by accounting period", and it follows
both dropdowns.

### 1.7 Hold and Rejected, summarised

| State | Awaiting my approval next | Awaiting my approval | Unapproved | Approved |
|---|---|---|---|---|
| Rejected row on the request | never | never | never | never |
| Held by someone else | shown; if the hold is at the level just below mine it is "next" for me | shown | shown | shown |
| Held by me | not shown (my hold row is past my level) | not shown (I have acted) | shown | shown |

---

## 2. How the V2 widget works

V2 keeps the original's model and its two filters, and adds one option. Nothing else in the rules
is meant to differ; what differs is presentation (status chip column, Age column, sortable headers,
Glance tiles, a Chart / Table view of the same encumbrance figures, the pop-up in part 3).

### 2.1 The Show chip

| Option | Rule |
|---|---|
| **All requests** (new, default) | every request the viewer may see with status Unapproved or Approved, on any path |
| Awaiting my approval next | as the original (1.3) |
| Awaiting my approval | as the original |
| Unapproved | as the original |
| Approved | as the original |

"All requests" is the only addition. It exists so the dashboard opens on the whole picture rather
than on one person's queue; the headline figure ("N need your approval") and the Glance tiles are
computed from the Awaiting rules regardless of the chip, so the chip only changes the rows and the
bars.

The approval path chip works as the original's dropdown: paths of the requests in view that the
viewer may see, "All approval paths" when there is more than one, narrowing both table and chart.

### 2.2 The table and the chart

- Table columns: Requisition #, Vendor, Issued, Age (days since issued), Status (Your turn, Coming
  to you, Pending, Approved, On hold), Amount. Default order newest first; every header sorts.
  "Your turn" is the original's "Awaiting my approval next"; "Coming to you" is its "Awaiting my
  approval" minus the "next" set.
- Encumbrances: the original chart's rule (open line dollars by GL period) over the rows in view,
  one bar per period from the first open request to the current month, with a Chart / Table view.

### 2.3 Rulings taken on 9 October (owner), now built

1. **A request with a rejected approval row is hidden from the whole widget**, exactly as the
   original panel hides it: it leaves the table, the headline and tile counts and the bars under
   every option. No status word or chip for it exists in V2. It stays reachable from the Requests
   page. Rejecting from the pop-up records the row and the request leaves the table.
2. **Held requests** follow the original for the part that is sound: a hold by someone else leaves
   the request where the approved rows put it, so it stays in the viewer's Awaiting lists with the
   chip "On hold" and the turn line "(on hold by X)". The original's promotion of a held request to
   the next level's "Awaiting my approval next" list (a hold row counting as acted) is **not**
   copied, since it would put a frozen request in someone's queue. The viewer's own hold takes the
   request out of their lists, as the original does.
3. **Coming to you offers Approve**, as the original page enables rows down to the viewer's own
   and cascades the approval below.
4. **Newest first** is the table's default order; Issued and the number columns open descending.

---

## 3. The original record screen, and the V2 pop-up

### 3.1 The original: `PurchasingManagement/Requests/Update/{orderID}`

Files: `Shelby.Web.Financials/PurchasingManagement/Requests/Update.aspx(.cs)`, the grids
`Controls/POApprovalsGrid.ascx(.cs)`, `Controls/PODetailsGrid.ascx(.cs)`,
`Controls/POOrderInvoiceGrid.ascx`, and the client rules in
`Content/scripts/Controls/POApprovalsGrid.js`. The server side is
`Shelby.Repository/EntityRepositories/PO/POOrderRepository.cs` (`UpdateItem`, `ApproveOrder`,
`EmailOrder`).

It is an ASP.NET WebForms edit page. There are **no Approve, Hold or Reject buttons**: an approver
ticks Approved, Rejected or Hold on their own row of the Approvals grid, types a reason if they
want, and presses **Update**. The page then saves everything at once.

#### Header fields, in page order

| Left column | Right column |
|---|---|
| Vendor (picker, required) with address and terms beneath | P.O. Date (label becomes "Purchase Order Date" or "Check Request Date" with the Type) |
| Ship To (picker) | Issued To |
| Email | Agent |
| Type: Purchase Order or Check Request | Shipping (label is the company's `ShippingLabel` setting) |
| Status: Unapproved, Approved, Closed, Voided | Date Requested |
| Approval Path (required: "You must select an Approval Path") | |
| Payment Approval Path | |
| Requisition # | |
| Purchase Order # (becomes "Check Request #" with the Type; shows "Order # already exists" on a duplicate) | |

#### Tabs, in page order

Detail, Headings, Approvals, Attachments, Note, Payment Approval.

- **Detail**: Tax, Freight, Other, Total; a line grid with Period, Account (Fund #, Department #,
  Account # each with a pick button and its name), Description, Project, Qty, Unit, Unit Price,
  Amount; Add / Add New Line and a delete icon ("Are you sure you want to delete this detail row?").
- **Headings**: the company's five custom fields.
- **Approvals**: the grid in 3.2.
- **Attachments**: files on the request.
- **Note**: a free-text note.
- **Payment Approval**: invoice payment approvals (`POOrderInvoiceGrid`) with Add Invoice Payment
  Approval.

Footer: Cancel (back to the list), Reset ("Information is reset."), Update (save and return),
Apply (new requests only: save and clear for the next one). Delete, Print and Print List live on
the Requests list page, not here.

#### What appears or disappears with the setup

| Setting or condition | Effect on the screen | Where |
|---|---|---|
| `PO_Company.UsePaymentApprovalProcess` off (the database default) | Payment Approval Path field and Payment Approval tab hidden | `Update.aspx:88-123`, `.cs:48` |
| Status is Unapproved | Payment Approval Path and tab hidden even when the process is on | same |
| No custom field label set (the check reads `CustomField1Label`, so only field 1 controls it) | Headings tab hidden; each unlabelled custom field hidden | `.cs:657-684` |
| `AP_Company.TaxFreightOther` off | Tax, Freight and Other hidden; Total stays | `.cs:692-693` |
| `PO_Company.QuantityOnOrder` off | Qty, Unit and Unit Price columns hidden; Amount typed directly | `PODetailsGrid.ascx.cs:86, 120` |
| `PO_Company.ShippingLabel` | the Shipping field's label text | `.cs:655` |
| No Approval Path selected | Approvals tab hidden | `.cs:520-521, 642-643` |
| Type = Check Request | "Purchase Order #" reads "Check Request #", the date label follows, and the order number box is disabled | `Update.aspx` `numberLabel()` |
| New request | Requisition # editable; Apply button shown | `.cs:200-209, 225` |
| Status Approved, or any approval row exists, or no edit right | Vendor locked; Ship To locked when Approved or without edit right | `.cs:649-650` |
| Any row Approved, Rejected or Held | Type, Approval Path, both pickers, the dates, Tax / Freight / Other / Total, the line text boxes and dropdowns, and the add / delete line controls all become read-only | `POApprovalsGrid.js:95-140` |
| Viewer not on the path and without the ApprovalOverride right | every Approved and Rejected box disabled | `POApprovalsGrid.js:51-93` |
| `/PurchasingManagement/Requests/ApprovalOverride` right | the viewer may tick any level | `.cs:221` |

#### Status dropdown rules (after a row has acted, `POApprovalsGrid.js:149-188`)

Closed is always offered; Voided only from Approved; Approved from Closed, or from Voided once
every row is approved; Unapproved is blocked when Voided.

#### Submit for Approval (`Update.aspx:428-435`, `.cs:392-393`)

Shown only while Status is Unapproved and no row is Approved, Rejected or Held; otherwise hidden
and forced on. Hover text: "Leaving this check box unchecked will put this request on hold from
proceeding with the approval process." Saved unticked, the request is stored as Status -1 (not
submitted). Toggling it also ticks or unticks Approved on the first row when that row is the
current user.

### 3.2 The Approvals grid, which is the approval flow

Columns (`POApprovalsGrid.ascx:8-21`): `Approval Needed By:`, `Approved`, `Rejected`, `Reason`,
`Hold`, `Reason`, `Approval Updated By:`.

- One row per approver on the path, in Sequence order. The first column reads "Starts with X",
  then "Then Y", with "Or Z" for a second approver on the same level, and "Ends with ..." on the
  last. A creator who is not on the path gets a level-0 "Starts with" row. " - inactive" or
  " - out of office until {date}" is appended from the user record (`.ascx.cs:566-629`).
- `Approval Updated By:` shows "{name} {date time}" or "(unspecified)".
- **Who may tick** (`.js:51-93`): rows are enabled from the top down to and including my own row,
  plus the other approvers on my level. Within a row Approved, Rejected and Hold are mutually
  exclusive. If a later level has already acted, Approved and Rejected are disabled everywhere.
- **Approved cascade** (`.js:16-37`): ticking Approved ticks every row at or below that level and
  clears their Rejected, Hold and reasons; unticking clears Approved and Rejected on that level and
  every later one.
- **Reasons**: an inline text box per row for Rejected and for Hold, 50 characters, enabled only
  while its box is ticked; the rejected reason autocompletes from past reasons. Not required: a
  blank reason is saved as "unknown" (`POOrderRepository.cs:1829-1830, 1867-1868`).
- **On save** (`UpdateItem` / `ApproveOrder`, `POOrderRepository.cs:1742-1885`): levels whose
  `RequiredMinimum` is above the order total, and inactive approvers, are auto-approved. When every
  row is approved, Status goes 0 to 1 and the order number is assigned from `NextOrderNumber` (only
  if still 0 and every line has an account). The page shows "Vendor {name}, Order# {n} has been
  updated." There is no confirmation dialog.
- **Emails**, each behind a company setting: next level "Request awaiting your approval"; creator
  "Requisition # {r} for {vendor} Approved"; vendor "PO # {n} created" (purchase orders); check
  requests "... Check Request Approved"; on reject "... Rejected"; on hold "... Placed on Hold" with
  "Your request has been placed on hold by {user} for reason '{reason}'."
- A one-click page, `Requests/ApproveReject.aspx`, serves the email links: one Approve (or Reject)
  button, an optional Reject Reason, "Override Previous Selection?", "View Request".

### 3.3 The V2 pop-up: the same screen, read-only, three actions

Opened from any row. It shows what the page shows and changes nothing except the viewer's own
decision and the note. Everything else is edited on the real page through **Open request** (top
right), which is the link to `PurchasingManagement/Requests/Update/{orderID}`.

#### Header and fields

- Title: "Requisition {n} · {vendor}" with the table's status chip.
- A read-only fact grid in the page's field order: Vendor (address, terms), Ship To, Email, Type,
  Status, Approval Path, Requisition #, Purchase Order # or Check Request #, Purchase Order Date
  or Check Request Date, Issued To, Agent, Shipping, Date Requested. An empty field reads
  "Not set". No pickers, no dropdowns, no Save / Cancel / Reset / Apply, no Submit for Approval.

#### Tabs

Detail, Approvals, Attachments (with a file count), Note.

- **Detail**: the lines with Period, Account (fund and department beneath), Description, Project,
  Amount, and a totals row with Tax, Freight, Other and Total. Read-only.
- **Approvals**: the turn line ("Your approval next (level 2 of 2)") and the page's seven-column
  grid with the same row wording, read-only: ticks drawn as marks, reasons as text, Approval
  Updated By as text. The enable rules and the cascade are the page's, kept as the single source.
- **Attachments**: the files on the request (the invoice or quote the approver reads before
  deciding), each with Open. No upload.
- **Note**: the one writable field, with Save note, above the activity log.

#### The three actions, in the footer

Shown when the viewer's level may act by the grid's own rule (on the path, not yet acted, no later
level has acted):

| Button | What it does, exactly as ticking the box and pressing Update would |
|---|---|
| **Approve** | ticks Approved on my row; the cascade ticks every level below; if every applicable level is now approved the request becomes Approved (order number assigned). A confirm strip asks for an optional note first. |
| **Hold** | ticks Hold on my row with a reason (optional, 50 characters, blank saved as "unknown"); the request stops until the hold is removed. |
| **Reject** | ticks Rejected on my row with a reason (same rules); the request leaves this table and stays on the Requests page. |

My own hold offers **Remove hold** (unticking my box; only my row is cleared). A hold by someone
else at or below my level leaves my row enabled, so the three actions stay and approving clears
the hold through the cascade, as the page does; an acted row at a later level locks Approve and
Reject but not Hold. A not-submitted request or a non-pending order leaves the footer with Close
only and a line saying why ("On hold by Lanette Stewart.", "This request is approved; nothing to
decide here.").

#### How setup changes the pop-up, following the page

| Setting or condition | Pop-up |
|---|---|
| Payment approval process off (default) | no Payment Approval Path fact, no Payment Approval tab (as the page) |
| Payment approval process on and the order Approved | the page shows the Payment Approval Path and tab; the pop-up would add the fact and a read-only tab listing invoice approvals, with the same three actions on the payment path when the viewer is on it. Not built in the demo; the model carries the payment path so it can be. |
| Custom field labels set | the page shows Headings; the pop-up would list the labelled custom fields as read-only facts. Not built: the demo company has none. |
| `TaxFreightOther` off | Tax, Freight and Other leave the totals row; Total stays |
| `QuantityOnOrder` on | Qty, Unit and Unit Price join the line columns |
| Type = Check Request | labels change to Check Request # and Check Request Date |
| Viewer not on the path, no override right | no actions, grid read-only, footer explains |
| ApprovalOverride right | the viewer may act on any level (modelled as `PURF_OVERRIDE`, off in the demo) |
| A later level has acted | no actions; the grid shows who |
| Request not submitted (Status -1) | no actions; the requester submits from the page |
| Status Closed or Voided | facts only; nothing to decide |

#### What the pop-up does not do, by design

- It never edits the header, the lines, the status or the paths; Open request does.
- It never offers Closed or Voided; those are page actions.
- It never submits a request for approval; that is the requester's act on the page.
- Every act in the demo is kept for the session only: no dashboard write API exists yet.

---

## 4. Decisions

All four questions were ruled on 9 October 2026 and are recorded in 2.3 and in
`docs/decisions/W13.md`. Nothing is open on this widget's rules.
