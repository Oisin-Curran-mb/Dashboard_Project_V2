# Module dashboards: what the old system shows, and what V2 should open with

Draft, 19 October 2026. For the owner's review. The same material is the
**Dashboards** view in the build, beside Demo, Spec and Permissions; this file
carries the source citations and research notes that do not belong on screen.

One section per module page: its URL, what the old system shows on it today,
what the source proves, which V2 widgets belong to the module, and the proposed
V2 default. Every proposed default is the Detail size. Widgets are named, never
numbered, as agreed on 6 October.

**Environments.** URLs are written in the owner's form,
`https://[env]myamplify.io/AccountsPayable`, where `[env]` stands for the
tenant and environment, for example `95301.accounting.test1.`. The screenshots
and the "what it shows today" rows were captured on **test1** as
`renmore_test1`, company **1 Test Company 92**, on 19 October 2026. That is the
tenant the Permissions screenshots were taken on, and the reason it is the
only one that may appear in this public repository: it holds test data, not a
church's accounts.

---

## Required: the user's choice has to be saved

**Whatever a user selects on their dashboard must persist.** If they change the
dashboard option, that choice is saved against the user and is what they see
next time they open the module. Without it the dashboard resets on every visit
and the defaults below become the only thing anyone ever sees.

It is also how the old system behaves. A user's panel choice is written to
`SS_UserTenantScreenSectionTask`, keyed to their user and the page, and that row
**wins over the system default** on every subsequent load
(`SSScreenSectionTaskRepository.cs:224-252`). The first time a user changes a
slot, the system row is cloned into a personal row and then edited
(`TasksServiceController.cs:107-144`). So V2 inheriting the behaviour is a
port, not a new feature.

What has to be saved, at minimum:

- which dashboard the user selected, per module
- which widgets are on it, and in what order
- each widget's size
- each widget's own view, filter, range and sort, which V2 already tracks in
  the registry row but only in memory

V2 today saves none of it. Every selection is lost on reload.

---

## The dashboard carries the module's name

**Done in the build on 19 October.** The single dashboard is named **Accounts
Payable**, after the module the sidebar shows, instead of "Dashboard". The
owner's own capture of the target, taken on the live Pages site with the rename
control, is at `docs/Pics/Modules/_header/`.

The old system agrees: every module home page on test1 is titled with the
module's name. `/AccountsPayable` is titled Accounts Payable, `/Payroll` is
titled Payroll, and so on for all of them. Only the root URL is titled
"Accounting Home", which is also V2's page title today. "Dashboard" as a name
exists only in the demo shells, Phase 1 and V2, and was inherited rather than
introduced.

When the per-module split happens (still to be decided), each dashboard takes
its own module's name the same way, and the page title and browser title
should follow it.

---

## What the old system actually has

**1. There is no per-module dashboard page.** One generic `~/Default.aspx`
serves every module root (`FinancialsAreaRegistration.cs:312-357`) and
renders exactly **two stacked slots**. A module "dashboard" is two panels,
chosen from one global list of eighteen.

**2. Which panel sits in each slot is a database row, not code.**
`SS_ScreenSectionTask` holds the system default; the user's own row overrides
it. The `.ascx` path lives in the row's `Note` column.

**3. Any panel can go on any module's page.** The header dropdown is built by
reflection over every panel class and filtered **only** by the user's rights
(`DataPanelControl.cs:174-196`). On the owner's own beta1 account, Accounts
Payable opens on Bank Balances and Payroll opens on Remittance Pledges; on the
untouched test1 tenant every module opens on its own panel. Same code, two
users' choices.

So two things are recorded for each module below. **What it shows today** is
the test1 page at capture, which reflects that tenant and that user's choices.
**Provable from source** is what the migration history in the repository sets,
the only place the shipped default is written down; five modules have one
there, and all five follow the same pattern: slot 1 the module's own panel,
slot 2 Main Content Tasks. test1 follows that pattern on all thirteen modules
with panels, which is as close to a confirmation of the shipped default as can
be had without the database. The query that would settle it outright:

```sql
SELECT p.Uri, t.Sequence, t.Name, t.Note
FROM SS_ScreenSectionTask t JOIN SS_Page p ON p.PageID = t.PageID
WHERE t.ScreenSectionID = 7 ORDER BY p.Uri, t.Sequence;
```

**Quick Links is retired** (owner, 19 October). It was the densest per-module
content in the old system — 20 links for Accounts Receivable, 18 for General
Ledger, 15 for Accounts Payable, hard-coded per module in `QuickLinks.ascx.cs`,
with five modules having no list at all. Nothing replaces it.

**Statistics Information** rendered the literal word `STATS`: its grid and
chart are commented out and it still references the Accounts Payable record
type it was copied from. On test1 `/Statistics` redirects to the root.

---

## Every default is the Detail size

Each module's proposed default below is the **Detail** size, and its V2
screenshot shows Detail. Glance and Explore remain available to the user; they
are not what a module dashboard opens with. **The one exception is the home
page**, which gathers four modules' widgets and so opens at Explore (owner,
19 October).

**Main Content Tasks closes every module's dashboard** (owner, 19 October). On the old
system it is slot 2 on every module page that has panels, the grid of up to
eight task shortcuts for that module; putting it last on every V2 module
dashboard keeps that shape. The V2 screenshots show each proposal as it would
render: the dashboard titled for its module, its own widgets first, Main
Content Tasks last.

---

## The old system's eighteen panels, and where each went

| Old-system panel | Module it is gated on | V2 widget |
|---|---|---|
| Accounts Payable By Due Date | Accounts Payable | Accounts Payable By Due Date |
| Bank Balances | Bank Account Management | Bank Balances |
| Budget Compared to Actual | General Ledger | Budget Compared to Actual |
| Deposit Accounts | Deposits On Hand | Deposits on Hand |
| Fixed Asset Values | Fixed Assets | Fixed Asset Values |
| Gifts Pledges | Donors And Gifts | Gifts Pledges |
| Insurance Billing Plans | Insurance Billing | Insurance Billing Plans |
| Loans With Balance Due | Loan Processing | Loans With Balance Due |
| Payroll Distributions | Payroll | Payroll Distributions |
| Payroll Scheduled Time Off | Payroll (time-off tab) | Payroll Scheduled Time Off |
| Pension Plans | Pension Billing | Pension Plans |
| Purchasing Management | Purchasing Management | Purchasing Management |
| Receivable Invoices Outstanding | Accounts Receivable | Receivable Invoices Outstanding |
| Remittance Pledges | Remittance | Remittance Pledges |
| Main Content Tasks | none, shared | Main Content Tasks |
| My Status | none, shared | My Status |
| Quick Links | none, shared | **retired** |
| Statistics Information | Statistics | **nothing: an unfinished stub** |

New in V2, with no old-system counterpart: **Financial KPI**, a band above the
grid gated on General Ledger, and **Pending Actions**.

---

## Module by module

Screenshots are full pages at 1920 wide, in `docs/Pics/Modules/<Module>/`:
`<Module> - V1.png` is the old system on test1, `<Module> - V2.png` is this
build showing only that module's widgets at Detail.

### Home

| | |
|---|---|
| URL | `https://[env]myamplify.io/` |
| What it shows today | Slot 1 **Payroll Scheduled Time Off**, slot 2 **Payroll Scheduled Time Off**. Titled "Accounting Home". |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Accounts Payable By Due Date**, **Receivable Invoices Outstanding**, **Budget Compared to Actual** with the **Financial KPI** band, **Bank Balances**, **Pending Actions**, **Main Content Tasks** |
| **Proposed default** | **What Accounts Payable, Accounts Receivable, General Ledger and Bank Account Management show, all at Explore; Pending Actions once; Main Content Tasks last.** Owner's ruling, 19 October. |

The root is the page a user lands on before choosing a module. **This is the one
page whose default is Explore rather than Detail**, so that four modules'
widgets fit one screen.

The old system's seed for it is not in the repository: the root is PageID 3,
and the only migrations touching that page are ScreenSectionID 9, not the
data-panel section. The two live tenants disagree (test1 shows Payroll
Scheduled Time Off in both slots; the owner's beta1 account shows Gifts
Pledges and Main Content Tasks), so at least one is a user's override and
neither can be called the shipped default. The root's page key is the empty
string (`Helpers.CurrentPage()` strips the trailing slash), so the query that
settles it is:

```sql
SELECT t.Sequence, t.Name, t.Note
FROM SS_ScreenSectionTask t JOIN SS_Page p ON p.PageID = t.PageID
WHERE p.Uri = '' AND t.ScreenSectionID = 7 ORDER BY t.Sequence;
```

What a new user provably gets on the old root page: **Quick Links hidden**
(the one exclusion in the panel chooser, `currentUri != ""`), **My Status
empty** (no seeded queries), **My Tasks and My Reports empty** in the right-hand
task pad (user rows only, no system fallback), and if a slot has no seed row,
**an empty slot the picker refuses to fill**.

![Home, old system](../Pics/Modules/Home/Home%20-%20V1.png)
![Home, V2](../Pics/Modules/Home/Home%20-%20V2.png)

---

### Accounts Payable

| | |
|---|---|
| URL | `https://[env]myamplify.io/AccountsPayable` |
| What it shows today | Slot 1 **Accounts Payable By Due Date**, slot 2 **Main Content Tasks**. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Accounts Payable By Due Date**, **Pending Actions** |
| **Proposed default** | **Accounts Payable By Due Date at Detail and Pending Actions at Detail, then Main Content Tasks at Detail as the last item** |

Pending Actions belongs here: its group tabs are Accounts Payable, Accounts
Receivable and General Ledger, and Accounts Payable opens first.

![Accounts Payable, old system](../Pics/Modules/Accounts%20Payable/Accounts%20Payable%20-%20V1.png)
![Accounts Payable, V2](../Pics/Modules/Accounts%20Payable/Accounts%20Payable%20-%20V2.png)

---

### Accounts Receivable

| | |
|---|---|
| URL | `https://[env]myamplify.io/AccountsReceivable` |
| What it shows today | Slot 1 **Receivable Invoices Outstanding**, slot 2 **Main Content Tasks**. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Receivable Invoices Outstanding**, **Pending Actions** |
| **Proposed default** | **Receivable Invoices Outstanding at Detail and Pending Actions at Detail, then Main Content Tasks at Detail as the last item** |

![Accounts Receivable, old system](../Pics/Modules/Accounts%20Receivable/Accounts%20Receivable%20-%20V1.png)
![Accounts Receivable, V2](../Pics/Modules/Accounts%20Receivable/Accounts%20Receivable%20-%20V2.png)

---

### Bank Account Management

| | |
|---|---|
| URL | `https://[env]myamplify.io/BankAccountManagement` |
| What it shows today | Slot 1 **Bank Balances**, slot 2 **Main Content Tasks**. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Bank Balances** |
| **Proposed default** | **Bank Balances at Detail, then Main Content Tasks at Detail as the last item** |

There is no Bank Reconciliation module; it is a page inside this one.

![Bank Account Management, old system](../Pics/Modules/Bank%20Account%20Management/Bank%20Account%20Management%20-%20V1.png)
![Bank Account Management, V2](../Pics/Modules/Bank%20Account%20Management/Bank%20Account%20Management%20-%20V2.png)

---

### Deposits On Hand

| | |
|---|---|
| URL | `https://[env]myamplify.io/DepositsOnHand` |
| What it shows today | Slot 1 **Deposit Accounts**, slot 2 **Main Content Tasks**. |
| Provable from source | **Yes.** Slot 1 `DepositAccounts.ascx`, slot 2 `MainContentTasks.ascx` (`1015_V5_DataUpdate.sql:320-321`, amended by `1018_V7_DataUpdate.sql:60`). Slot 1 was Main Content Tasks first and was changed to the module's own panel. |
| V2 widgets | **Deposits on Hand** |
| **Proposed default** | **Deposits on Hand at Detail, then Main Content Tasks at Detail as the last item** |

![Deposits On Hand, old system](../Pics/Modules/Deposits%20On%20Hand/Deposits%20On%20Hand%20-%20V1.png)
![Deposits On Hand, V2](../Pics/Modules/Deposits%20On%20Hand/Deposits%20On%20Hand%20-%20V2.png)

---

### Donors And Gifts

| | |
|---|---|
| URL | `https://[env]myamplify.io/DonorsAndGifts` |
| What it shows today | Slot 1 **Gifts Pledges**, slot 2 **Main Content Tasks**. |
| Provable from source | **Yes.** Slot 1 `GiftsPledges.ascx`, slot 2 `MainContentTasks.ascx` (`1069_V97_DataUpdate.sql:206-207`). |
| V2 widgets | **Gifts Pledges** |
| **Proposed default** | **Gifts Pledges at Detail, then Main Content Tasks at Detail as the last item** |

The public URL is `/DonorsAndGifts` while the folder is `Gifts`, so the module's
display name is **Donors And Gifts**. That is the string the dashboard should
carry, not "Gifts".

![Donors And Gifts, old system](../Pics/Modules/Donors%20And%20Gifts/Donors%20And%20Gifts%20-%20V1.png)
![Donors And Gifts, V2](../Pics/Modules/Donors%20And%20Gifts/Donors%20And%20Gifts%20-%20V2.png)

---

### Fixed Assets

| | |
|---|---|
| URL | `https://[env]myamplify.io/FixedAssets` |
| What it shows today | Slot 1 **Fixed Asset Values**, slot 2 **Main Content Tasks**. |
| Provable from source | **Slot 1 yes.** `FixedAssets.ascx` (`1009_V4DataUpdate.sql:78`); it was **My Status** before that (`1004_NavigationFixes.sql:64`). Slot 2 not set by any migration in the repo. |
| V2 widgets | **Fixed Asset Values** |
| **Proposed default** | **Fixed Asset Values at Detail, then Main Content Tasks at Detail as the last item** |

![Fixed Assets, old system](../Pics/Modules/Fixed%20Assets/Fixed%20Assets%20-%20V1.png)
![Fixed Assets, V2](../Pics/Modules/Fixed%20Assets/Fixed%20Assets%20-%20V2.png)

---

### General Ledger

| | |
|---|---|
| URL | `https://[env]myamplify.io/GeneralLedger` |
| What it shows today | Slot 1 **Budget Comparison for all Income Accounts** (the Budget Compared to Actual panel, carrying its special-report title), slot 2 **Main Content Tasks**. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Budget Compared to Actual**, **Financial KPI** (new in V2), **Pending Actions** |
| **Proposed default** | **The Financial KPI band, Budget Compared to Actual at Detail and Pending Actions at Detail, then Main Content Tasks at Detail as the last item** |

The busiest module in V2, and the case that argues for more than the old
system's two panels.

![General Ledger, old system](../Pics/Modules/General%20Ledger/General%20Ledger%20-%20V1.png)
![General Ledger, V2](../Pics/Modules/General%20Ledger/General%20Ledger%20-%20V2.png)

---

### Insurance Billing

| | |
|---|---|
| URL | `https://[env]myamplify.io/InsuranceBilling` |
| What it shows today | Slot 1 **Insurance Billing Plans**, slot 2 **Main Content Tasks**. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Insurance Billing Plans** |
| **Proposed default** | **Insurance Billing Plans at Detail, then Main Content Tasks at Detail as the last item** |

![Insurance Billing, old system](../Pics/Modules/Insurance%20Billing/Insurance%20Billing%20-%20V1.png)
![Insurance Billing, V2](../Pics/Modules/Insurance%20Billing/Insurance%20Billing%20-%20V2.png)

---

### Loan Processing

| | |
|---|---|
| URL | `https://[env]myamplify.io/LoanProcessing` |
| What it shows today | Slot 1 **Loans With Balance Due**, slot 2 **Main Content Tasks**. |
| Provable from source | **Yes.** Slot 1 `LoansWithBalanceDue.ascx`, slot 2 `MainContentTasks.ascx` (`1018_V7_DataUpdate.sql:115-116`). |
| V2 widgets | **Loans With Balance Due** |
| **Proposed default** | **Loans With Balance Due at Detail, then Main Content Tasks at Detail as the last item** |

![Loan Processing, old system](../Pics/Modules/Loan%20Processing/Loan%20Processing%20-%20V1.png)
![Loan Processing, V2](../Pics/Modules/Loan%20Processing/Loan%20Processing%20-%20V2.png)

---

### Payroll

| | |
|---|---|
| URL | `https://[env]myamplify.io/Payroll` |
| What it shows today | Slot 1 **Payroll Distributions**, slot 2 **Main Content Tasks**. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Payroll Distributions**, **Payroll Scheduled Time Off** |
| **Proposed default** | **Payroll Distributions at Detail.** Payroll Scheduled Time Off is available but not the default. |

Payroll Scheduled Time Off is gated on a deeper right than the module root, the
secure time-off hours tab, so it is absent for some users who can see Payroll
Distributions. That makes it the wrong choice for a default.

![Payroll, old system](../Pics/Modules/Payroll/Payroll%20-%20V1.png)
![Payroll, V2](../Pics/Modules/Payroll/Payroll%20-%20V2.png)

---

### Pension Billing

| | |
|---|---|
| URL | `https://[env]myamplify.io/PensionBilling` |
| What it shows today | Slot 1 **Pension Plans**, slot 2 **Main Content Tasks**. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Pension Plans** |
| **Proposed default** | **Pension Plans at Detail, then Main Content Tasks at Detail as the last item** |

![Pension Billing, old system](../Pics/Modules/Pension%20Billing/Pension%20Billing%20-%20V1.png)
![Pension Billing, V2](../Pics/Modules/Pension%20Billing/Pension%20Billing%20-%20V2.png)

---

### Purchasing Management

| | |
|---|---|
| URL | `https://[env]myamplify.io/PurchasingManagement` |
| What it shows today | Slot 1 **Purchasing Management**, slot 2 **Main Content Tasks**. |
| Provable from source | **Yes, the clearest case.** Slot 1 `PurchasingManagement.ascx` named "Data Panel Info", slot 2 `MainContentTasks.ascx` named "Main Content Links" (`1009_V4DataUpdate.sql:201-202`). |
| V2 widgets | **Purchasing Management** |
| **Proposed default** | **Purchasing Management at Detail, Table view, then Main Content Tasks at Detail as the last item** |

The old panel opens on **"Awaiting my approval next"**, the first option in its
status dropdown. V2 keeps that vocabulary in its scope chip, so the default
carries over.

![Purchasing Management, old system](../Pics/Modules/Purchasing%20Management/Purchasing%20Management%20-%20V1.png)
![Purchasing Management, V2](../Pics/Modules/Purchasing%20Management/Purchasing%20Management%20-%20V2.png)

---

### Records

| | |
|---|---|
| URL | `https://[env]myamplify.io/Records` |
| What it shows today | Slot 1 **empty**, slot 2 **empty**. |
| Provable from source | Not set by any migration in the repo, which is consistent with what the page shows. |
| V2 widgets | **My Status**, **Main Content Tasks** — the two shared widgets |
| **Proposed default** | **My Status at Detail and Main Content Tasks at Detail** — owner's ruling, 19 October |

Records has no widget of its own, so it takes the two cross-module widgets.
Both adapt to whichever module they sit on. On the old system the page is two
empty slots, and when a slot has no seed row the picker silently refuses to
fill it (`TasksServiceController.cs:107-144`, the `else return`), so this
replaces a page a user cannot fix from the interface.

![Records, old system](../Pics/Modules/Records/Records%20-%20V1.png)
![Records, V2](../Pics/Modules/Records/Records%20-%20V2.png)

---

### Remittance

| | |
|---|---|
| URL | `https://[env]myamplify.io/Remittance` |
| What it shows today | Slot 1 **Remittance Pledges**, slot 2 **Main Content Tasks**. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **Remittance Pledges** |
| **Proposed default** | **Remittance Pledges at Detail, then Main Content Tasks at Detail as the last item** |

Remittance is also a **licence flag**, not only a module: other modules test for
it before showing certain links and tiles.

![Remittance, old system](../Pics/Modules/Remittance/Remittance%20-%20V1.png)
![Remittance, V2](../Pics/Modules/Remittance/Remittance%20-%20V2.png)

---

### Statistics

| | |
|---|---|
| URL | `https://[env]myamplify.io/Statistics` |
| What it shows today | Redirects to the root; no page of its own on test1. |
| Provable from source | Not set by any migration in the repo. |
| V2 widgets | **None.** |
| **Proposed default** | Nothing to propose. Needs a ruling: does Statistics get a dashboard at all? |

No screenshot in either version. The old panel was never finished.

---

## The cross-module widgets

**My Status** and **Main Content Tasks** were the old system's two shared
panels, and both keep the same rule in V2: a row is offered only when the user
holds that row's own module right. They can appear on any module's dashboard,
and they are Records' entire dashboard.

- **My Status opens empty for a new user** in the old system. Its selected
  queries are a user preference with no seed (`MyStatus.ascx.cs:140-151`). V2
  ships a default selection of seven queries, a deliberate improvement.
- **Main Content Tasks shows at most eight tiles**, driven per page from the
  database, so it adapts to whichever module it sits on. V2 keeps that shape.

**Pending Actions** is new, and the one genuinely multi-module widget. It is
**absent from the Widget Permissions table**, which is a gap.

---

## What still needs a decision

1. **One dashboard per module, or one that follows the module in the
   sidebar?** The single dashboard is already named Accounts Payable to match
   the sidebar.
2. **What the home page (the root URL) opens with** when no module is chosen.
3. **Does Statistics get a dashboard?**
4. **Pending Actions needs a row in the Widget Permissions table.**
5. **Run the SQL above** to settle the shipped defaults for the eleven modules
   no migration sets. test1 strongly suggests the answer is the same pattern as
   the other five.

Settled on 19 October: Quick Links is retired, Records shows Main Content Tasks
and My Status, every default is the Detail size, the dashboard is named for its
module, and the user's selection must be saved.

---

## How the screenshots were made

`_tools/one-off/shoot-legacy-modules-2026-10-19.js` for the old system and
`_tools/one-off/shoot-modules-2026-10-19.js` for V2, both headless Chrome at
1920 wide, full-page captures.

The old-system script runs against a Chrome profile the owner signs into
himself (`login` opens the window; `shoot` reuses the profile). The script never
sees a credential. It reads the company name off every page and **refuses to
save anything that is not the test company**, because this repository is public
and served on GitHub Pages. It writes `docs/Pics/Modules/legacy-manifest.json`
with what each page showed, and the Dashboards view is generated from that
file, so the "what it shows today" rows above are the capture's own record.

The V2 script loads the build, keeps only the module's widgets at Detail, and
captures the whole page. Neither build is modified.

## What was checked, and what was not

Read from source: the routing table, `Default.aspx` and its code-behind,
`SSScreenSectionTaskRepository`, `DataPanelControl`, all eighteen panel
controls, `QuickLinks.ascx.cs`, `MyStatus.ascx.cs`, `MainContentTasks.ascx.cs`,
`MainNavigation.ascx.cs`, the `ModuleIDs` enum, and every data-panel statement
in `Plugin\sql`. Observed live: all fifteen module URLs on test1 and on the
owner's beta1 account.

Not checked: **no database was queried.** The shipped default for eleven
modules is inferred from test1 and the five-module pattern, not read from the
seed table.
