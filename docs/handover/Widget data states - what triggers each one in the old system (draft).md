# Widget data states: what triggers each one in the old system, and what V2 should do with it

Draft for review, 16 October 2026. Written from the legacy code in `C:\Users\ocurran\source\repos\MBAccounting`
(read-only; file and line references are to that repository, paths under `Shelby.Web.Financials\DataPanelControls\`
unless another project is named) and from the V2 demo as it stands today. One section per widget, in dashboard
order. After review, the summary table in section 4 becomes the data-state contract for the API and the widgets.

The question for each widget is the same: **what in the data makes the old panel show nothing, show zeros, or
show its normal content, and which of the V2 selector's five options (Default, No data, Not configured, Small
data, Extreme high volume of data) does each of those conditions correspond to.**

Two definitions used throughout:

- **Not configured**: the module's setup is missing, so there is nothing the widget could ever show until someone
  sets it up (no fiscal year, no bank account, no approval path, no pledge purposes). The right response is to
  say what to set up.
- **No data**: the setup exists, but there are no records for the widget's window, filter or user (no payroll
  checks this year, every invoice paid, nothing awaiting approval). The right response is a quiet "nothing here".

The old dashboard never makes that distinction, and in most panels never says anything at all. Section 2 explains
why; the per-widget sections say exactly which tables being empty produce which picture.

---

## 1. How to read a widget section

Each widget has the same parts:

- **Old panel and module**: the legacy control, the module right it tests, and the record cache it uses.
- **What it reads**: the repository calls, tables and filters, in plain words with the file and line.
- **What must be set up**: the rows that have to exist before the panel can show anything, and whether the code
  checks for them or just gets zero rows back.
- **Triggers**: a table of data condition, what the old panel shows for it, and the V2 option it maps to.
- **Defaults and saved choices**: what the first load selects and what happens when a saved selection no longer
  exists.
- **Numbers**: what is summed and how, and any place the arithmetic can fail.
- **V2 today and recommendation**: what the V2 widget does with the equivalent data right now (from the data-state
  selector built on 16 October) and what it should do.

---

## 2. What the old dashboard does for every panel

**Hosting.** The Financials home page has two panel slots (`Shelby.Web.Financials\Default.aspx.cs:15-56`). The
control for each slot comes from the user's own `SS_UserTenantScreenSectionTask` row, falling back to the page's
`SS_ScreenSectionTask` row (`Shelby.Repository\...\SS\SSScreenSectionTaskRepository.cs:224-253`). Only the
construction of the control is wrapped in a try/catch (`Default.aspx.cs:23-29, 42-48`): if the control cannot be
created, the "None" panel (a header and nothing else, `None.ascx:1-2`) is loaded in its place.

**A broken panel takes down the page.** Anything a panel throws later, while loading its data, is not caught by
the dashboard. The page base class logs the exception and redirects the whole dashboard to the "ViewException"
page (`Shelby.Web.UI\ShelbyPage.cs:808-817`). Every unguarded null reference or `Single()` listed in the widget
sections below has that effect: one bad record in one widget and the user sees no dashboard at all.

**Rights.** Each panel declares a module URI. Without it at Inquiry the body is hidden and the header stays
(`Shelby.Web.UI\DataPanelControl.cs:151-165`); the data-loading code still runs. The hide only works when the
header panel is a direct child of the control, which is not the case for Payroll Scheduled Time Off (section 3.9).
The permissions document covers the rest.

**Empty grids say "No records to display."** No panel sets its own empty text. The shared grid class
(`Shelby.Web.UI\ShelbyGrid.cs`) sets no `NoRecordsTemplate`, and no panel markup sets `EmptyDataText`, so an empty
grid shows the Telerik RadGrid default row, and a chart bound to nothing shows its title over an empty plot. The
one panel with any words of its own is Bank Balances ("no bank accounts set up" as the chart title,
`BankBalances.ascx.cs:23-25`). Nothing anywhere tells the user what to set up.

**The one-hour cache.** Twelve panels have a cache preference for their last result as XML (two of them, Payroll Distributions and Loans With Balance Due, read it but never write it) in a user preference
(`DataPanelControl.cs:78-105`; preference ids 236 to 247 in `Shelby.Global\Enumerations\Enumerations.cs:313-322`)
and reuse it for an hour, per user, not per company or bank account. Each panel adds its own staleness test
(company changed, bank account changed, current period not in the cached list), and the Refresh button deletes
the cache. Two consequences for the new dashboard: a widget can show data up to an hour old without saying so,
and an empty or partial result caused by an exception that the panel swallowed (Bank Balances,
`BankBalances.ascx.cs:173-236`) is cached for the hour too.

**What "current" means** (`Shelby.Data\ShelbyContext.cs`). The company is the user's saved preference, else the
lowest company number (`:1018-1031`). The fiscal year is the saved preference, else the company's default year,
else the latest year by begin date, and **null when the company has no fiscal year** (`:1063-1086`). The period
follows the year and is null with it (`:1115-1146`). The bank account is the saved preference, else the first
bank account reachable through the company's chart of accounts, and **`Guid.Empty` when there is none**
(`:1179-1191`). A stale saved value pointing at a deleted year or bank account is deleted and the default re-read.
Three widgets (Accounts Payable By Due Date, Deposits on Hand, and the Bank Balances cache test) read one bank
account, the context default, not the whole company.

**Account roles.** Every General Ledger account query applies the user's account roles
(`Shelby.Repository\...\GL\GLAccountRepository.cs:83-114`): include roles must match at least one, omit roles must
match none, and a user with no roles at all sees everything. Bank account lists get the same filter only when the
caller asks for it (`BR\BRBankAccountRepository.cs:93-130`). So "the user's roles exclude every account" is a real
trigger for Budget Compared to Actual and Bank Balances, and it looks exactly like "no accounts".

---

## 3. The widgets

### 3.1 Budget Compared to Actual

**Old panel and module.** `BudgetComparedToActual.ascx(.cs)`, right `/GeneralLedger`; cache preference 238;
selection preference 102 (`AccountType=` and one special-report line per company, `.ascx.cs:78, 99-137`).

**What it reads** (`LoadRecords`, `.ascx.cs:347-445`).
- One record per period of the **current fiscal year**, skipping the extra "Audit" closing period
  (`:353`; `Shelby.Data\EntityClassExtensions\GLYear.cs:93`), each starting at Actual 0, Budget 0 (`:356-364`).
- The account set: all income accounts (statement type "I", shown with sign reversed), all expense accounts
  ("E"), or the accounts behind one special-report line (`:366-392`), year-filtered and account-role filtered
  (`GLAccountRepository.cs:132-135, 83-114`). A special-report line that no longer exists falls back silently to
  all income accounts and clears the saved line (`:379-383`). In the consolidation company (company number 0)
  the set becomes every tenant account whose master account is in the set (`:399-402`).
- Actuals: the sum of `GL_Summary` amounts for those accounts by period (`:404-411`).
- Budgets: the sum of `GL_BudgetDetail` for those accounts by period, **original budgets only**, never revisions
  (`RevisionStartingPeriodID == null`, `:415`).
- Year to date is the running sum down the period list (`:438-442`). No variance or percentage is computed
  anywhere; the chart just draws the four series.

**What must be set up.** A fiscal year resolvable as current; periods in it other than Audit; income or expense
accounts in that year (or a special-report line with links); posted summary rows; a budget with details. None of
this is checked. The only explicit checks are for the special-report line (`:379, 59, 247`) and for whether any
special report has lines, which decides whether the "Select Accounts" button appears at all (`:283`). The
"Selected Accounts" option also needs `/GeneralLedger/Reports/SpecialReports` at Inquiry (`:154-155`).

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| Company has no fiscal year (context year null) | Zero periods, so both charts are empty under the title "Budget Comparison for all Income Accounts" (`:51, 66-67`); the cache is never valid, so the query runs on every load (`:46-47`); Export writes a header and a zero total (`:187-189`) | Not configured |
| Year exists but has only the Audit period | Same | Not configured |
| Periods exist, no income or expense accounts, or the user's account roles exclude them all, or the special-report line links match nothing | One column pair per period, every value 0, $0.00 axis, flat year-to-date lines, no message | Not configured (no accounts) or a rights case that looks the same |
| Accounts exist, no summary rows and no budget | All zeros with period names | Not configured (no budget) |
| Actuals posted, no budget entered | Actual columns only; budget columns and budget year-to-date flat at $0 | Not configured (no budget) |
| The only budget rows are revisions | Budget shows 0 (`:415`) | Looks like no budget; a defect to decide on |
| Budget entered, nothing posted yet | Budget columns only; actual columns 0 | No data |
| Saved special-report line deleted | Silently all income accounts; saved line cleared; the account-type preference stays "selected accounts", so the dialog shows that radio with nothing in the line list | Default, with a stale choice |
| Two periods share a period number | `SingleOrDefault` throws (`:426, 433`); the whole dashboard goes to the error page | Error |
| Special-report line chosen and no current year | Null reference in `ReportHelpers.cs:406`; dashboard error page | Error |

**Defaults and saved choices.** First load: all income accounts, chart view, the context year and period. The
dialog's report list is alphabetical with the first selected (`:86-88, 237-239`). The account type is saved once
for every company; the special-report line is saved per company. The cache is also dropped when the current
period is not in the cached list, so changing year reloads.

**Numbers.** Actual per period = sum of summary amounts times the sign (`:410`); Budget per period = sum of
original budget details times the sign (`:420`); year to date cumulative (`:438-442`). No division, so no
divide-by-zero. The summary and budget amounts are not-null columns.

**V2 today and recommendation.** V2 has its own "No budget set up" state (shown when no row has a budget above
zero) and a "No data yet" headline when a budget exists with nothing posted. That is the right split: **Not
configured** = no fiscal year, no accounts in scope, or no budget rows for the year; **No data** = budget rows
exist and no actuals. Two things the API must settle that the old panel gets wrong or silent: whether revisions
count as a budget (old: no), and that "the user's roles exclude every account" should say so rather than draw
zeros. The special-report fallback should be reported, not silent.

### 3.2 Pension Plans

**Old panel and module.** `PensionPlans.ascx(.cs)`, right `/PensionBilling`; cache preference 245 holding the
whole result including the district list. A hard-coded sample data set exists behind a constant that is off
(`.ascx.cs:20, 165-243`).

**What it reads** (`.ascx.cs:250-286`).
- Districts: the Pension Billing control table rows of type District for the company
  (`Shelby.Repository\...\PB\PBControlTableRepository.cs:31-34`), with "All Districts" first.
- Plans: every appointment-plan row for the company whose appointment is **active, started on or before today
  and not ended** (`:258-286`), grouped by plan and ordered by plan name. A plan with no such appointment never
  appears. Each detail row carries the annual plan amount, the charge (church) name and the appointment's
  district, which can be null.

**What must be set up.** Plans; appointments that are active and current; appointment-plan rows with an annual
amount; the appointee and charge persons. Nothing is checked; a missing person is an unguarded null reference
(`:272-279`), which takes the dashboard down.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No plans, or no active current appointments | Empty grid, no footer, empty pie; the district dropdown still offers "All Districts" and any districts | Not configured (no plans) or No data (plans with no one appointed): the panel cannot tell them apart |
| Plans exist, every appointment inactive, future-dated or ended | Same | No data |
| A district selected that has no appointment | Empty grid and pie (`:117-118`) | No data (filtered) |
| A plan whose appointments sum to zero | Row shown with a plain label instead of a link; it cannot be opened (`.ascx:30-32`) | Default, edge |
| An appointment with no district while a district is selected | Excluded from that view | No data (filtered) |
| Cached result from another company | Reload (`:39-40`) | Default |

**Defaults and saved choices.** "All Districts", chart view. The district is remembered only when Refresh is
pressed (`:318-319`). A saved district that no longer exists silently becomes "All Districts". Because the
district list is part of the cached result, a newly added district does not appear for up to an hour.

**Numbers.** Plan amount = sum of the annual plan amounts of the details in the selected district (`:120-121`),
recomputed on every bind. Footer and detail footer are grid sums. No division.

**V2 today and recommendation.** V2 shows "No active pension appointments" for both empty cases. Recommendation:
**Not configured** when the company has no pension plans at all; **No data** when plans exist and no appointment
is active today or in the selected district. The API can tell these apart with one count of plan rows.

### 3.3 Payroll Distributions

**Old panel and module.** `PayrollDistributions.ascx(.cs)`, right `/Payroll`. No cache: the query runs on every
load (the Refresh handler deletes a cache the panel never writes, `.ascx.cs:38`).

**What it reads** (`.ascx.cs:84-101`). Payroll history checks for the company joined to their compensation lines,
with check date between the two date boxes, not voided (`VoidJournalID` null and check type not 2), grouped by
compensation distribution and summed. Unposted checks are counted (the posted-only repository method is not
used). **Secure employees are not filtered out**: their pay is inside the totals
(`PR\PREmployeeRepository.cs:63-67` filters by tenant only).

**What must be set up.** Employees, compensation distributions, at least one payroll check in the window with
compensation lines. Nothing is checked; everything just yields zero rows.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No payroll setup at all (no employees, distributions or history) | Empty grid, no footer, "By Distributions" title over an empty pie (`.ascx:40`) | Not configured |
| Set up, no checks dated this calendar year to date | Same | No data |
| Only voided checks in the window | Same | No data |
| A distribution that nets to zero or negative | Still a row; a zero or negative pie slice | Default, edge |
| A date box cleared, then Refresh | Zero rows | No data (filtered) |
| A date changed without Refresh | Nothing: the picker calls a JavaScript function that does not exist in the repository (`.ascx:11, 17`; `DateTextBox.js:66-72`), so the console shows an error and the data only changes on Refresh | Defect |

**Defaults and saved choices.** 1 January of the current year to today (`.ascx.cs:27-28`), then the search runs.
Nothing is saved; the dates reset on every load.

**Numbers.** Amount per distribution = sum of compensation amounts (`:100`); footer count and sum. No division.

**V2 today and recommendation.** V2 has "No payroll runs in this range" for the empty window and a Glance that
says "No payroll this period" when there are no distributions. Recommendation: **Not configured** when there are
no compensation distributions (or no payroll company); **No data** when distributions exist and no non-void check
falls in the window. The Secure-employee question is for the permissions document, but the API should decide it
before this widget ships.

### 3.4 Remittance Pledges

**Old panel and module.** `RMPledges.ascx(.cs)`, right `/Remittance`; cache preference 247 with a company guard
(`.ascx.cs:29-39`). No seed script places this panel in a slot: a user only sees it by choosing it from the panel
dropdown.

**What it reads** (`Shelby.Repository\...\RM\RMActivityRepository.cs:74-95`). Pledge detail rows for the company
whose **pledge header's begin and end dates bracket the chosen "Date Receipts Thru"** (`:77`), grouped by
activity: Annual = sum of the pledge amounts, YTD Paid = sum of receipt details in a posted batch, not voided,
with a check date on or before the chosen date (`:82-83`). The company's activities are then inner-joined to
those groups (`:85`): an activity with no pledge detail in the window **does not appear at all**, not even as a
zero row. Not filtered: the pledge's Active flag, the activity's Active or CanPledge flags, the church's status.

**What must be set up.** A Remittance company; at least one activity; at least one pledge whose term covers the
chosen date with detail rows against an activity of the same company. Receipts only drive YTD Paid. An activity
with a null sequence is an unguarded `.Value` (`:88`), which takes the dashboard down.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No Remittance company, activities or pledges | Date box at today; the line "Percent of year completed NN.NN%." (`.ascx:9`; `.ascx.cs:16-17`); grid header with no rows | Not configured |
| Pledges exist but no pledge term covers the chosen date | Same empty grid, no explanation; moving the date into a term fills it | No data (really "no term covers this date") |
| Term covers the date, no posted receipts | Rows with YTD Paid 0, Outstanding = Annual, % Paid 0.00% | Default |
| Pledge amount null or zero for an activity | Annual 0; % Paid blank (null, `RMWidgetActivityRecord.cs:19`); Outstanding = minus what was paid | Default, edge |
| Receipts in an unposted batch or voided | Not counted (`:83`) | Default |
| Record served from the hour-old cache | YTD Expected is recomputed with a default date whose month is 1, because the date field is private and not serialised, so YTD Expected becomes Annual ÷ 12 whatever the real month (inferred from `RMWidgetActivityRecord.cs:16, 20-27`) | Cache defect |
| Company switched | Cache discarded and reloaded (`.ascx.cs:37-38`) | Default |

**Defaults and saved choices.** Date Receipts Thru = today (`.ascx.cs:19`); the record stores the date only when
it differs from today (`:60-63`). There is no activity or term selector, so "no term covers today" has no fallback
to the nearest term. Date change or Refresh deletes the cache (`:48-53`).

**Numbers.** Annual = sum of pledge details in the term (`:82`). YTD Expected = round(Annual ÷ 12 × month of the
date) (`RMWidgetActivityRecord.cs:16`), a month-count proration. Outstanding = Annual − YTD Paid (`:18`), against
the annual figure, not the year-to-date expectation. % Paid = YTD Paid ÷ Annual, null when Annual is 0 (`:19`).
Percent of year = (days since 1 January + 1) ÷ 365 (`.ascx.cs:16-17`), so 31 December in a leap year reads
100.27%.

**V2 today and recommendation.** V2 already has both states: "No remittance pledges yet" and, for a date no term
covers, "No pledge term covers this date". That is the right split: **Not configured** = no activities (or no
Remittance company); **No data** = activities exist and no pledge term covers the date, or a term exists with no
receipts (show zero rows, as the old panel does). Decide whether activities with no pledge in the term should
appear as zero rows; the old panel drops them.

### 3.5 Receivable Invoices Outstanding

**Old panel and module.** `ReceivableInvoicesOutstanding.ascx(.cs)`, right `/AccountsReceivable`; cache
preference 246 holding the lists, the selections and the bucket sums together, reused for an hour when the
company matches (`.ascx.cs:43-54`).

**What it reads** (`.ascx.cs:124-132, 379-402`). Every invoice for the company's revenue centres that is posted,
not undone, and has a non-zero balance (total + sales tax − payments − discounts − write-offs), with no date,
customer-status or account-role filter. Age = days from due date to today, 0 when nothing is outstanding
(`Shelby.Data\EntityClassExtensions\ARInvoice.cs:28-34`). Buckets are summed per revenue centre and source. The
revenue-centre dropdown lists the company's active centres, **minus any centre whose configured GL accounts the
user's account roles hide** (`AR\ARRevenueCenterRepository.cs:43-55, 78-86`); that filter shrinks the dropdown but
not the totals. The source dropdown is tenant-wide with "All Sources" written over the "not assigned" entry
(`.ascx.cs:377`), so invoices with no source can only be seen under "All Sources".

**What must be set up.** An Accounts Receivable company and at least one revenue centre (the invoice query goes
through the centre); customers with a person record for the detail grid; posted invoices with a balance. Nothing
is checked explicitly.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No revenue centres, no invoices, or every invoice paid, unposted or undone | Dropdowns "All Revenue Centers" and "All Sources"; **the aging grid always has its five rows** Current, 31-60, 61-90, 91-120, 121 & over (`Shelby.Web.UI\DataPanelControl.cs:455-463`) at $0.00, each a plain label rather than a link (`.ascx:37-39`); a "Total" link in the footer at $0.00 (`.ascx:42`); the "Invoice Aging" pie with no slices | Not configured (no revenue centres) or No data (all settled): the panel cannot tell them apart |
| Filtered to a centre or source with no invoices | Same five rows at $0.00 | No data (filtered) |
| A bucket is non-zero | Its label becomes a link; clicking opens the detail list of invoices in that band (`.ascx.cs:319-331, 74-99`), with Close and Export and the Refresh hidden | Default |
| "Total" clicked | Every outstanding invoice listed | Default |
| An invoice not yet due | Negative age, counted in Current (`Age < 31`) | Default |
| A credit balance | Included (the filter is non-zero); it reduces its bucket, which can go negative and still shows as a link | Default, edge |
| Cache under an hour old | Sums, lists and selections all come from the cache; a deactivated revenue centre stays listed and selected until expiry | Stale |

**Defaults and saved choices.** Both dropdowns at "All" (`.ascx.cs:335-341, 370-377`). The selections are saved
inside the cached record (`:203-205, 214-216`), so they survive navigation within the hour; after expiry both
reset to "All". Refresh rebuilds the sums but does not rebind the dropdowns, so a new revenue centre appears only
after a full load (`:194-208`).

**Numbers.** Outstanding = total + sales tax − payments − discounts − write-offs (`:392`). Buckets: age under 31,
31-60, 61-90, 91-120, over 120 (`:395-399`). Footer and detail footer are grid sums. No division.

**V2 today and recommendation.** V2 shows "Nothing outstanding" for the empty state and, when handed an empty
list without the state flag, headings with six aging rows at $0. Recommendation: **Not configured** when the
company has no revenue centre; **No data** when centres exist and no posted invoice has a balance (the old panel's
five-zero grid is a reasonable "all settled" picture, but it should say so). Decide whether the user's account
roles should narrow the totals as well as the dropdown.

### 3.6 Insurance Billing Plans

**Old panel and module.** `InsuranceBillingPlans.ascx(.cs)`, right `/InsuranceBilling`; cache preference 242.

**What it reads** (`.ascx.cs:67-75, 128-139`). The plan types for the company (live, not cached) with "All
Types" first; every plan for the company ordered by name, each with a count of enrolled employees **plus** a count
of dependents (`:136`). No status, date or active filter: a terminated employee's enrolment counts, a dependent
counts even when the employee has no plan row (`Shelby.Data\EntityClasses\IBEmployeePlan.cs:97-271`,
`IBEmployeeDependent.cs:120`).

**What must be set up.** The insurance company row, plan types, plans. Enrolments are not required; a plan with
none shows with 0. Nothing is checked.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No plan types or plans | Dropdown with only "All Types"; empty grid, no footer, empty chart | Not configured |
| Types but no plans | Dropdown lists the types; grid and chart empty | Not configured |
| Plans with no enrolments | Rows with 0 (`.ascx:25-27`), footer 0, a pie with no wedges | No data |
| A type selected that has no plans | Empty grid and chart (`:89-91`) | No data (filtered) |
| A cached plan whose type was deleted | Appears under "All Types" and under no selectable type | Default, stale |

**Defaults and saved choices.** "All Types". The type is remembered only on Refresh (`:153-154`); a saved type
that no longer exists becomes "All Types". The cached record is re-read and re-deserialised on every access
(`:25-40`), a cost rather than a behaviour.

**Numbers.** Number enrolled = employee plan rows plus dependent rows (`:136`), so it overstates headcount.
Footer sum. No division.

**V2 today and recommendation.** V2 shows "0 plans" with an empty table or donut and has no empty state.
Recommendation: **Not configured** when there are no plans; **No data** when plans exist and every count is zero
(show the plans at 0 rather than nothing, as the old panel does, but say so). Decide whether dependents count.

### 3.7 Deposits on Hand

**Old panel and module.** `DepositAccounts.ascx(.cs)`, right `/DepositsOnHand`; cache preference 239, tagged with
the bank account.

**What it reads** (`.ascx.cs:87-112`). Active deposit accounts whose depositor belongs to the current
organisation and whose account type is on the **context default bank account** (`DH\DHAccountRepository.cs:54-61`),
each with a balance calculated in memory from its transactions up to today (`Shelby.Data\EntityClassExtensions\
DHAccount.cs:93-808`). The type dropdown lists the types on that bank account with "Show All" first (`:56-60`).

**What must be set up.** A default bank account for the context; at least one deposit account type on it; at
least one active account of such a type; a current organisation (null is an unguarded reference,
`DHAccountRepository.cs:56`).

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No bank account in context (`Guid.Empty`) | Types empty, accounts empty: dropdown with only "Show All", empty grid, "By Account Type" title over an empty pie | Not configured |
| Bank account but no deposit account types on it | Same | Not configured |
| Types exist, no active accounts | Dropdown lists types; grid and pie empty | No data |
| Accounts exist | Grid of name, inception date, number, ending balance; footer count and sum; pie per type | Default |
| A type selected that has no accounts | Grid empty; the pie keeps the unfiltered picture, since it is rebuilt only on first load or Refresh (`:65-66, 82-84`) | No data (filtered), with a stale chart |
| A cached account whose type is no longer on this bank account | `Single()` throws (`:160-164`); dashboard error page | Error |

**Defaults and saved choices.** "Show All". Nothing is saved beyond the cache.

**Numbers.** Ending balance = beginning + deposits + interest − withdrawals + unposted interest − penalties +
adjustments as of today (`DHAccount.cs:793-808`). Footer count and sum; pie sums per type. No division in the
panel path.

**V2 today and recommendation.** V2 shows "No deposit accounts" with an "Add account" button for both empty cases.
Recommendation: **Not configured** when the bank account has no deposit account types (the "Add account" call to
action fits here); **No data** when types exist and no account is active. The bank-account scoping is a decision:
the old panel shows one bank account's deposits, not the company's.

### 3.8 My Status

**Old panel and module.** `MyStatus.ascx(.cs)`, no module right (`.ascx.cs:18-19`). Preference 77 holds the
chosen queries by display name. Counts are never cached.

**What it reads.** The possible queries are **code, not data**: every class implementing the status-query
interface in the deployed assemblies (`Shelby.Global\Reflection.cs:65-117`; 22 of them under
`Shelby.Repository\Queries\MyStatusQueries\`). A query is offered only if the user holds its access URI at
Inquiry (`.ascx.cs:58`), a module landing page such as `/AccountsPayable`, `/PurchasingManagement` or `/Payroll`.
Each row's number is that query's own count with its own filters: for example "My Unposted AP Transactions" is
tenant-wide and filtered to invoices the current user created; "Unpaid Accounts Payable By Due Date" groups by
due date, so its count is the **number of distinct due dates**, not invoices (`UnpaidAccountsPayableByDueDate.cs:
20-29`).

**What must be set up.** No application data. Two things: the user must hold at least one module that a query
targets, and the user must have **saved a selection**; with nothing saved the grid is empty even when queries are
available.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| User holds no module any query targets | Grid and Select button hidden (`.ascx.cs:132-136`): the header and a blank body | Not configured (for this user, by rights) |
| Rights exist, nothing saved yet | Grid header "Query / # Records" with no rows; Select button shown (`:98, 145`) | Not configured (no queries chosen) |
| A saved query name is no longer offered (rights removed, query renamed) | Skipped silently (`:166-167`); the stale name stays in the preference | Default, stale |
| A chosen query counts 0 | Row with "0"; the view and jump icons hidden (`.ascx:31, 37`); double-click still opens an empty detail grid | No data (per row) |
| A chosen query counts above 0 | Row with the count; view opens the detail panel; jump navigates to the query's page | Default |
| Save with nothing on the right | The selection key is removed from the preference; the grid empties (`:350-359`) | Not configured again |
| A query's own LINQ throws | Nothing catches the count; the dashboard goes to the error page | Error |

**Defaults and saved choices.** No default selection; nothing auto-selects "all". Matching on reload is by display
name, case-insensitive (`:166`).

**Numbers.** Integer counts only. No sums or division.

**V2 today and recommendation.** V2 already has both: "0, All clear" with Configure when every query is at zero,
and "No records to display, choose the queries" when none is chosen. Recommendation: keep that split. **Not
configured** = no queries chosen (or none available to this user: say which); **No data** = every chosen query at
zero. The API should also return which saved names it could not match, so the widget can say so instead of
silently dropping them.

### 3.9 Payroll Scheduled Time Off

**Old panel and module.** `PayrollScheduledTimeOff.ascx(.cs)`, right `/Payroll/EmployeeInformation/
SecureTimeOffHoursTab` (`.ascx.cs:17`). Filter preference 131 (year and view). No record cache; the rows sit in
view state. The same control is hosted on the portal page `/Portal/Payroll/ApproveTimeOff` with a company
dropdown and the header hidden (`Portal\Payroll\ApproveTimeOff\Default.aspx:5-9, 23`).

**What it reads** (`.ascx.cs:32-38, 80-110`). The years that have any scheduled time off for the company, newest
first; then the rows for the selected year, narrowed in two steps:
- if the signed-in person has an employee record in the company, only employees whose home department is in
  that employee's approval departments (`PR_EmployeeTimeOffApproval`, `:82-84`);
- by the view: pending (no approved date), approved, or all (`:85-93`).
Rows carry the employee, home department, day, the four hours columns and "Pending" or "Approved by: name date"
(`:108`). The grid is department, then employee (with an "Approved" box ticked when nothing is pending), then the
days.

**What must be set up.** Employees with home departments; scheduled time off rows; for a narrowed view, approval
department rows for the signed-in employee; the company's hours captions (a blank sick, personal or misc short
name hides that column, `:133-144`).

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| User lacks the right | **Body still shows.** The header panel is nested inside an update panel (`.ascx:3-6`), so the shared hide loop never finds it; the panel is only missing from the chooser | Rights defect |
| No scheduled time off rows in the company | Year dropdown empty; grid empty; view "Show Pending" | Not configured (nothing scheduled, ever) |
| Rows exist, none in the selected year | Empty grid | No data (filtered) |
| Rows in the year, all approved, view "Show Pending" (the default) | Empty grid, so a fully approved year looks like nothing | No data (filtered) |
| Signed-in user has **no employee record** | The department filter is skipped: **every department in the company** (`:83-84`) | Default, over-wide |
| Signed-in user has an employee record and **no approval departments** | Filter applied with an empty list: always empty, whatever the data | No data for this user, really "not configured for this user" |
| Two employee records for the same person in the company | `SingleOrDefault` throws (`:82`); dashboard error page | Error |

**Defaults and saved choices.** Newest year, "Show Pending". Saved year and view are applied only if they still
exist in the lists (`:44-47`); otherwise the newest year stays. Department groups are expanded on the first load
only (`:64-71`).

**Numbers.** None computed; the hours columns have sum footers declared but the footer is switched off
(`.ascx:30, 47-58`). Approving writes the approver and date (`:173-185, 201-212`).

**V2 today and recommendation.** V2 shows "No time off scheduled" for every empty case. Recommendation: three
states, because the user matters here. **Not configured (for this user)**: the signed-in person has an employee
record with no approval departments; say "You have no departments to approve time off for". **No data**: there
are approval departments and nothing pending in the window. **Default**: rows. The no-employee-record case must
not fall through to the whole company; the permissions document already asks for that ruling.

### 3.10 Loans With Balance Due

**Old panel and module.** `LoansWithBalanceDue.ascx(.cs)`, right `/LoanProcessing`. Cache preference 243 is read
but **never written** (the setter that saves is never called, `.ascx.cs:25, 28-32`), so every load recomputes.

**What it reads** (`.ascx.cs:77-79, 136-156`). The company's loans **that have at least one invoice**, with
Amount Due = sum of invoice principal and interest − sum of **posted** payments, kept when above zero. Last
payment = latest posted payment date. The loan-type dropdown is tenant-wide (`LN\LNTypeRepository.cs:31-34`).
Voided invoices and voided payments are **not** excluded here, unlike the loan's own unposted calculation
(`Shelby.Data\EntityClassExtensions\LNLoan.cs:35, 43-44`).

**What must be set up.** Loan types; loans for the company with at least one posted invoice run. Payments are
optional. Nothing is checked.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No loan types | Dropdown with only "Show All" (`.ascx.cs:43-47`) | Not configured |
| No loans, no loan with invoices, or every amount due at or below zero | Empty grid; "By Age" pie bound to four zero slices (Current, 30, 60, over 60, `:81-87`), so nothing drawn | Not configured (no loans) or No data (all paid): the panel cannot tell them apart |
| A loan type selected | **Always an empty grid**: the type is never copied into the row (`Shelby.Web.UI\DataPanelControl.cs:374`; projection `:138-154`), so the filter at `:60-61` matches nothing; the pie is unaffected | Defect |
| A loan with invoices and no posted payment | Last payment blank; amount due = invoice total. Whether the empty payment sum throws or reads as zero in LINQ to SQL could not be settled from code | Default, verify |
| Chart | Sits outside the update panel (`.ascx:36-49`), so the dropdown's partial postback never redraws it | Default |

**Defaults and saved choices.** "Show All". Nothing is saved.

**Numbers.** Amount due as above; footer count and sum (`.ascx:21, 28`). The aging pie uses **overlapping**
buckets (`:89-132`): an invoice under 30 days old is added to Current, 30 and 60; payments, smallest first, are
subtracted from the oldest bucket down with carry; a loan contributes only if the buckets sum above zero. It
cannot be reproduced as a conventional exclusive aging; a faithful port copies the algorithm or replaces it
knowingly.

**V2 today and recommendation.** V2 shows "Nothing outstanding" for every empty case. Recommendation: **Not
configured** when the company has no loan types or no loans; **No data** when loans exist and none carries a
balance. Decide whether voided invoices and payments count (old: yes, by omission) and whether the aging chart is
kept.

### 3.11 Fixed Asset Values

**Old panel and module.** `FixedAssets.ascx(.cs)`, right `/FixedAssets`; cache preference 240 with a company
guard; selection preference 125 (grouping, group, measure, keyed by control id, `.ascx.cs:36, 96-110`).

**What it reads** (`FA\FAAssetRepository.cs:120-128`; `.ascx.cs:133-324`). Every asset of the company, **including
retired, sold and transferred** (no filter on those dates), grouped by the chosen grouping: class, building, room
(null → a "not assigned" group), asset account, accumulated depreciation account or expense account (null → "not
assigned" with a null id). Measures per asset: capitalised value, cost, depreciable value (capitalised less
salvage for methods that use salvage), accumulated book depreciation **all-time**, net (depreciable − accumulated)
(`Shelby.Data\EntityClassExtensions\FAAsset.cs:20-27, 186-220`). Grid = the assets of the selected group; pie =
group totals for the selected measure, zero groups dropped (`:423-428`).

**What must be set up.** Asset rows for the company; a GL asset account on each (required by the schema).
Classes, buildings, rooms and the two other accounts are optional. Depreciation postings are needed for
accumulated and net to differ from depreciable. Only explicit check: no selected group gives an empty list
(`:415-417`).

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No assets | Group dropdown with no items (`:76-77, 328-329`); empty grid with a "# Assets" footer; a pie with nothing drawn | Not configured (no assets) |
| Assets exist, every group at zero for the chosen measure (for example accumulated depreciation with no postings) | Pie empty while the grid lists the assets at $0.00 in that column | No data (for that measure) |
| Assets with no class, building or room | A "not assigned" group, sorted first, selectable and working | Default |
| The "not assigned" group under the two account groupings | Its id is null, which the dropdown turns into an empty value, which no group matches: **grid empty while the pie shows the group's total** (inferred from `:267-268, 300-301, 328, 415-417`) | Defect |
| Cold load with a saved grouping other than Class and no fresh cache | The data is grouped by Class before the saved grouping is applied (`:76, 83`), so the dropdown and the grouping disagree until the user changes the grouping | Defect |

**Defaults and saved choices.** Grouping "Class", the first group alphabetically ("not assigned" first if present),
measure "Capitalized Value". Grouping and group are restored only for the same company; the measure regardless
(`:79-87`). A saved group that no longer exists becomes the first.

**Numbers.** Group sums per measure (`:144-148`); footer count and five sums (`.ascx:42-68`). No division.

**V2 today and recommendation.** V2 shows "No fixed assets" for every empty case. Recommendation: **Not configured**
when the company has no asset records; **No data** does not really arise (an asset at $0 is still a row), but
"nothing to chart for this measure" should be said rather than left blank. Decide whether retired and sold assets
belong in the values.

### 3.12 Purchasing Management

**Old panel and module.** `PurchasingManagement.ascx(.cs)`, right `/PurchasingManagement`. No record cache; the
query runs on every non-postback load. Preference 141 saves the status and path **keyed by client id**
(`.ascx.cs:26-42, 180-183`), so moving the panel to the other slot orphans the saved values.

**What it reads** (`.ascx.cs:86-118`). The company's orders without a rejected approval row, then by the status
option: "Awaiting my approval next" (unapproved; the user is the creator with no approval rows yet, or a path
approver whose sequence is next), "Awaiting my approval" (unapproved; the user is on the path or the creator and
has not approved), "Unapproved" and "Approved" (the user may see the path: no path, no path users, the user is a
path user, Admin, or holds `/PurchasingManagement/Requests/ApprovalOverride` at Update). Closed and voided orders
are never shown. The path dropdown is built from the paths of the matching orders (`:129-137`), filtered the same
way. The encumbrance chart sums detail lines with quantity × unit price above the dollars applied, by GL period
(`:167-177`). No date range; the path's Active flag is not checked.

**What must be set up.** A Purchasing company; orders in status Unapproved or Approved without a rejection; for
the two "Awaiting" options, the user on the order's path or its creator; approval paths with users for the
visibility test. Only explicit check: no paths among the matching orders adds the entry "No matching requests
found" (`:138-139`).

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No Purchasing company or no orders | Path dropdown with the single entry **"No matching requests found"** (`:138-139`); empty grid with footer "# Requests: 0"; "Encumbrances" title over an empty chart (`.ascx:67`) | Not configured |
| Orders exist, none in the selected status | Same picture | No data (filtered) |
| "Awaiting" option, user on no path and creator of nothing | Same picture | No data (for this user) |
| "Awaiting my approval next", user on the path, order has no approval rows yet | The "next sequence" test compares against the maximum of an empty set, which is null in SQL, so the order is **not shown** until the first approval row exists (inferred from `:92-94`; whether submission writes a creator row was not traced) | Verify |
| An order with a rejected approval row | Excluded from every option (`:87`) | Default |
| Exactly one path among the matching orders | Dropdown shows it and is disabled (`:142-143`) | Default |
| Two or more paths | "All approval paths" inserted and selected (`:140-141`) | Default |
| Matching orders with no path at all | A dropdown entry built from null name and id, probably blank (inferred) | Defect |
| Rows exist, every detail line fully applied | Grid populated, chart empty (`:169`) | Default |
| Refresh clicked | Nothing reloads: there is no handler, the page re-renders from view state (`:24, 48-52`) | Defect |

**Defaults and saved choices.** Status "Awaiting my approval next" unless a saved value matches (`:50`); path
dropdown rebuilt on every status change, first item selected. A saved path no longer in the list becomes the
first item.

**Numbers.** Order total = round(sum of quantity × unit price) + tax + freight + other; outstanding = total −
dollars applied (`Shelby.Data\EntityClassExtensions\POOrder.cs:12-18, 52-57`). Footer count and sum. Encumbrance
per period = sum of open detail amounts (`:169, 176`). No division.

**V2 today and recommendation.** V2 shows "Nothing needs your approval" for every empty case and has no "no
approval paths" state. Recommendation: **Not configured** when the company has no approval path (requests cannot
be routed; the Purchasing logic document already notes that a request without a path is never routed); **No data**
when paths exist and nothing matches the status for this user. Keep the old panel's "Awaiting" self-limiting.
Decide what "Awaiting my approval next" means before the first approval row exists.

### 3.13 Main Content Tasks

**Old panel and module.** `MainContentTasks.ascx(.cs)`, no module right (`.ascx.cs:16-17`). No cache, no
preference.

**What it reads** (`.ascx.cs:23-31`; `SS\SSScreenSectionTaskRepository.cs:68-125`). The seeded main-content tiles
for the **current page URI** (section 6) whose module is in the licence, in sequence order; a user-saved set would
replace them but no code writes one. Each tile is allowed when the user holds a task whose page is the tile's
page (`:113-125`). Then **the first eight are taken before the rights filter** (`.ascx.cs:31`), so a user whose
rights begin at the ninth tile sees nothing. On the Statistics app without a Remittance licence one tile is
removed (`:28-29`).

**What must be set up.** Seed rows for the page in the section-6 table with licensed modules; for each tile a
task in the user's roles pointing at the tile's page. There are no "recent tasks" in this panel: recently viewed
is another section handled elsewhere.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No seed rows for this page, or the module unlicensed | An empty tile container (`.ascx:3`), no words | Not configured (for this page) |
| Rows exist, the user holds none of their pages | Empty container | Not configured (for this user, by rights) |
| The user's accessible tiles are all beyond the eighth | Empty container (`:31`) | Defect |
| Tiles | Icon (class or an SVG by icon id), name, note, link to the page (`.ascx:6-14`) | Default |

**Defaults and saved choices.** None; the page URI is the only input.

**V2 today and recommendation.** V2 reads an empty list as "All content tasks are already done", which is the
wrong message for a role with no tasks, and its Glance says "No recent or saved tasks yet". Recommendation: the
widget is driven by rights, so **Not configured** = the user's role has no tasks for this page (say so, and who
can fix it); **No data** = tasks exist and the recent list is empty (a quiet "nothing recent"). Drop the eight-
before-rights ordering in the API.

### 3.14 Bank Balances

**Old panel and module.** `BankBalances.ascx(.cs)`, right `/BankAccountManagement`; cache preference 237.

**What it reads** (`LoadRecords`, `.ascx.cs:167-239`). The company's bank accounts with the user's account roles
enforced (`BR\BRBankAccountRepository.cs:91-146`), inactive included at this stage. For each: the beginning
balance is the opening balance when the account has never been reconciled, else the ending balance of the latest
reconcile (`:191-197`); the activity is the sum of **unreconciled** items by type (check, deposit, void,
withdrawal, EFT), with no date window (`:199-209`); ending = beginning plus those sums (`:211-220`). The whole
load is inside an empty catch (`:173-236`): any exception gives a partial or empty list, cached for the hour. The
dropdown lists only active accounts and offers "All Bank Accounts" only when there are two or more (`:65-71`).

**What must be set up.** A company with a chart of accounts and at least one bank account linked to a GL
account; the Active flag to appear. Reconciles and items are not required. Explicit checks: more than one account
for "All" (`:70`), none at all hides the dropdown (`:76-77`).

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No bank accounts, or the user's account roles exclude them all | Dropdown hidden (`:77`); the chart title reads **"no bank accounts set up"** (`:23-25, 112`); empty grid with a footer that says "Total  Bank Accounts" and no number (`.ascx:25`); empty pie | Not configured (or a rights case that looks the same) |
| Only inactive accounts | Same picture, though the inactive accounts are in the cache | Not configured |
| Exactly one active account | No "All" option; a seven-row detail grid (beginning, deposits, voids, checks, withdrawals, EFT, ending, `:180-189`) with no header or footer; a column chart of the four movement rows | Default, single |
| Two or more active accounts | One row per account with its ending balance; footer "Total N Bank Accounts" and the sum; the pie shows only accounts with a **positive** ending balance (`:107`), so zero and overdrawn accounts are in the grid but not the pie | Default |
| Account never reconciled and no items | Ending = opening balance | Default |
| Load threw (for example a bank account whose GL account chain is broken) | Swallowed; empty or partial list shown and cached (`:234-238`) | Looks like No data; really an error |
| Checks and withdrawals | Flipped to positive for display on the shared objects (`:132-133`), and flipped again on every rebind in the same request | Display defect |

**Defaults and saved choices.** "All Bank Accounts" when there are two or more, else the one account. The
selection is not saved. The cache is reused only when it contains the context default bank account (`:41-43`),
so with no context bank account it is rebuilt on every load.

**Numbers.** Beginning and type sums as above; ending only adds the types that have a grid row (`:214-219`).
Footer count and sum. No division.

**V2 today and recommendation.** V2 shows an empty table, chart and a $0 headline with no words. Recommendation:
**Not configured** when the company has no active bank account the user may see, with the old panel's words
improved ("No bank accounts set up" and where to add one); **No data** does not really exist for this widget (an
account with no activity is a valid $0 row), so the API need only distinguish "no accounts" from "accounts". Two
decisions: whether overdrawn accounts belong in the chart, and whether a load error is reported rather than cached
as nothing.

### 3.15 Accounts Payable By Due Date

**Old panel and module.** `AccountsPayableByDueDate.ascx(.cs)`, right `/AccountsPayable`; cache preference 236,
tagged with the bank account.

**What it reads** (`LoadRecords`, `.ascx.cs:145-180`). Invoices on the **context default bank account** only
(`AP\APInvoiceRepository.cs:65-71, 195-198`) that are posted, have a due date and are not fully paid (`:155-157`).
Amount due per invoice = the sum of amount less discount over detail lines in status Unpaid or Selected for
Payment (`:166-170`); invoices that net to zero are dropped (`:172`). Every such invoice regardless of due date,
past or future: there is no window. The due date is kept as a formatted string (`:165`). No account-role filter.

**What must be set up.** A default bank account in context (else `Guid.Empty` and zero invoices); posted unpaid
invoices with a due date on that account; a vendor with a person record (a missing one is an unguarded null
reference at `:163`, which takes the dashboard down).

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No bank account in context, or no qualifying invoices | Date dropdown empty with no "Total" item (`:98-99`); empty grid with a meaningless "# invoices:" footer; "By Due Date" title over an empty pie; no words | Not configured (no AP bank account) or No data (all paid): the panel cannot tell them apart |
| Invoices exist but every detail is paid, void or on hold | Dropped as zero: same picture | No data |
| Qualifying invoices | Dropdown "Total" plus one entry per due date (ordered by real date, `:92-99`); grid for the chosen date; footer count and sum; pie per due date using the absolute value (`:111-121`) | Default |
| A due date whose invoices net negative (credits) | Positive pie slice, negative footer | Default, edge |
| Context bank account changed | Reload (`:38-39`) | Default |

**Defaults and saved choices.** The first load selects the **earliest due date, not "Total"** (`:97, 104-105`),
so the grid shows the oldest due date's invoices while the pie shows every date. Refresh keeps the selection
(`:67`); a selection that no longer exists falls back to "Total". The pie is ordered by the date string, so
"10/1/2026" sorts before "9/1/2026" (`:120`) while the dropdown sorts by date (`:94`).

**Numbers.** Amount due as above; footer count and sum of the displayed rows; pie slice = absolute sum per date.
No division.

**V2 today and recommendation.** V2 shows "Nothing outstanding" for every empty case. Recommendation: **Not
configured** when the company has no bank account marked for payables; **No data** when the account exists and no
posted invoice is unpaid. Decide whether V2 reads one bank account like the old panel or all of the company's.

### 3.16 Gifts Pledges

**Old panel and module.** `GiftsPledges.ascx(.cs)`, right `/DonorsAndGifts`; cache preference 241 with **no
company guard** (`.ascx.cs:24-28`): switching company within the hour shows the previous company's figures until
Refresh or a date change.

**What it reads** (`GF\GFPledgeRepository.cs:74-104`). The company's **active** pledges (`:78`) grouped by purpose,
with Pledge Total, Pledge Due as of today's position in each pledge's schedule, and Received = gift details linked
to the pledge in a posted, not undone batch dated on or before "Date Gifts Thru" (`:89-94`). Rows ordered by
pledge total descending (`:96`). Not filtered: the purpose's Active flag (there is no "allows pledges" flag on a
purpose in this schema), campaign, term, user.

**What must be set up.** A Donors and Gifts company; at least one active pledge with a purpose. Gifts only drive
Received. A pledge with no purpose would be an unguarded null reference after the grouping (`:85`); whether the
schema allows it was not verified.

**Triggers.**

| Data condition | Old panel shows | V2 option |
|---|---|---|
| No company or no pledges | Date box at today; grid header with no rows | Not configured (no purposes or no pledges) or No data: the panel cannot tell them apart |
| Pledges exist, all inactive | Same empty grid (`:78`) | No data |
| Active pledges, no posted gifts | A row per purpose with Received 0, Due Remaining = Pledge Due, Percent Due 100% when anything is due | Default |
| A pledge amount of zero | Pledge Due 0; Percent Due = (0 − Received) ÷ 1, a raw dollar figure shown as a percentage (for example "-50,000.00 %") (`GFWidgetRecord.cs:18`) | Defect |
| Pledge begins in the future | Nothing due yet (`GFPledge.cs:87-88`) | Default |
| Date Gifts Thru moved earlier | Only Received changes; the due position is computed from today, not the chosen date (`GFPledge.cs:62-84`) | Defect |
| User lacks the right | **Body still shows** if the panel is in a slot: the header panel is inside an update panel (`.ascx:2-4`), so the shared hide finds nothing; the panel is only missing from the chooser | Rights defect |

**Defaults and saved choices.** Date Gifts Thru = today, or the date the cached record was built with
(`.ascx.cs:14, 33`). No purpose or campaign selector. Date change or Refresh deletes the cache.

**Numbers.** Pledge Due per pledge: full amount once the end date has passed, else the periodic amount times the
cycles elapsed since the begin date (frequency codes 1, 2, 4, 6, 12, 24, 26, 52; any other gives zero), capped at
the total (`GFPledge.cs:47-101`). Due Remaining = Pledge Due − Received; Percent Due = Due Remaining ÷ Pledge Due
with a divide-by-zero guard that substitutes 1 (`GFWidgetRecord.cs:17-18`). Footer sums on four columns, none on
the percentage.

**V2 today and recommendation.** V2 shows "No gift or pledge purposes yet" for every empty case (and the Gifts
Pledges logic document already covers the V2 purpose model). Recommendation: **Not configured** when the company
has no purposes that take pledges; **No data** when purposes exist and no pledge is active (or none in the chosen
term). Fix the zero-pledge percentage and the date-position defect in the API rather than copy them.

### 3.17 Financial KPI

No legacy panel. The band is new in V2 and reads General Ledger figures for the current fiscal year. Its triggers
follow Budget Compared to Actual: **Not configured** when the company has no fiscal year or no income and expense
accounts; **No data** when the year exists and nothing is posted (every tile at zero, which is what V2 shows
today). The year-over-year tile additionally needs a prior fiscal year with postings; without one it should say
so rather than show a 0% change.

---

## 4. Summary: the trigger per widget

The data condition the API should test, in the order it should test it. "Looks the same in the old panel" means
the legacy code cannot tell the two options apart; V2 can, with the count named here.

| Widget | Not configured when | No data when | Old panel for both | V2 today |
|---|---|---|---|---|
| Budget Compared to Actual | No current fiscal year; or no income/expense accounts in scope; or no budget rows for the year | Budget rows exist, nothing posted | Empty or all-zero charts, no words | Has both states |
| Pension Plans | No pension plans | Plans exist, no appointment active today or in the district | Empty grid and pie | One "no appointments" state |
| Payroll Distributions | No compensation distributions (or no payroll company) | Distributions exist, no non-void check in the window | Empty grid, "By Distributions" over an empty pie | Has both |
| Remittance Pledges | No activities (or no Remittance company) | Activities exist, no pledge term covers the date, or no receipts | Empty grid under the percent-of-year line | Has both |
| Receivable Invoices Outstanding | No revenue centres | Centres exist, no posted invoice with a balance | Five buckets at $0.00 | One state; empty list shows a $0 table |
| Insurance Billing Plans | No plans | Plans exist, every enrolment count zero | Rows at 0 or empty grid | None |
| Deposits on Hand | No deposit account types on the bank account | Types exist, no active account | Empty grid and pie | One state with "Add account" |
| My Status | No queries chosen (or none available to this user) | Every chosen query at zero | Empty grid or hidden grid | Has both |
| Payroll Scheduled Time Off | Signed-in employee has no approval departments | Departments exist, nothing in the window or view | Empty grid; no employee record shows everything | One state |
| Loans With Balance Due | No loan types or no loans | Loans exist, none with a balance | Empty grid, four zero slices | One state |
| Fixed Asset Values | No asset records | (an asset at $0 is still a row) | Empty grid and pie | One state |
| Purchasing Management | No approval paths | Paths exist, nothing matches the status for this user | "No matching requests found" in the path dropdown | One state |
| Main Content Tasks | The user's role has no tasks for this page | Tasks exist, nothing recent | Empty tile container | Wrong copy ("all done") |
| Bank Balances | No active bank account the user may see | (an account at $0 is still a row) | "no bank accounts set up" as the chart title | None |
| Accounts Payable By Due Date | No bank account marked for payables | Account exists, no posted unpaid invoice | Empty dropdown, grid and pie | One state |
| Gifts Pledges | No purposes that take pledges | Purposes exist, no active pledge | Empty grid | One state |
| Financial KPI | No fiscal year or no income/expense accounts | Year exists, nothing posted | (new in V2) | Zeros only |

**Four things the old dashboard does that V2 must not copy.** A thrown exception anywhere in a widget redirects
the whole dashboard to the error page. An empty result is cached for an hour even when it was caused by an
exception the panel swallowed. Two panels (Gifts Pledges, Payroll Scheduled Time Off) nest their header so the
rights hide does nothing. And no panel says what to set up: the richest message in the old
system is "no bank accounts set up".

---

## 5. Decisions for the owner

1. **Revisions as budget** (Budget Compared to Actual): the old panel counts original budgets only. Keep, or
   count the latest revision?
2. **Scope by one bank account or the company** (Accounts Payable By Due Date, Deposits on Hand, Bank Balances
   cache): the old panels read the context default bank account. V2 shows company-wide figures today.
3. **Secure employees** (Payroll Distributions): the old panel includes their pay in the totals.
4. **The no-employee-record case** (Payroll Scheduled Time Off): the old panel shows every department. Carried
   from the permissions document.
5. **Account roles and totals** (Receivable Invoices Outstanding, Budget, Bank Balances): the old panels let the
   roles narrow some lists and not others, and draw zeros rather than say "you cannot see these accounts".
6. **Voided loan invoices and payments** (Loans With Balance Due): counted by omission in the old panel.
7. **Retired and sold assets** (Fixed Asset Values): included in the old values.
8. **Dependents** (Insurance Billing Plans): counted as enrolments.
9. **Activities with no pledge in the term** (Remittance Pledges): dropped by the old panel's inner join.
10. **Report, don't swallow**: whether a widget whose load fails shows an error state (recommended) or an empty
    state, and whether a silent fallback (Budget's special-report line) is reported.

---

## 6. What could not be settled from the code

- The exact Telerik "No records to display." text and whether footers render on an empty grid are library
  behaviour, not in the repository.
- Purchasing: whether submitting a request writes a sequence-0 approval row for the creator (decides when
  "Awaiting my approval next" first matches for path approvers), and how the dropdown renders an order with no
  path.
- Loans: whether the empty payment sum reads as zero or throws in LINQ to SQL.
- Fixed Assets: the empty grid for the null-id "not assigned" group under the two account groupings is inferred,
  not observed.
- Remittance: the cached YTD Expected defect is inferred from the record class and the serialiser, not executed.
- Whether a pledge can have no purpose or an activity no sequence in the schema (each would be an exception).
