# Data states: a second "For developers only" selector

Prepared 16 October 2026 for the next agent. Nothing in `index.html` is changed by this document; it
describes the control, how it hooks into the shell and the widgets, and where the data for each state
comes from (`docs/data-states/data-states.js`, written alongside). The owner's instruction: a second
dropdown, to the **left of the existing widget selector**, also under the "For developers only" label,
with the options **No data, Not configured, Default, Small data, Extreme high volume
of data**. Not to be added yet; prepare the data and the hook-up.

---

## 1. What each state means

| Option | Meaning | What it should prove |
|---|---|---|
| **No data** | The module is set up, but nothing exists for the period or filter: no invoices outstanding, no pending requests, no loans due. | Every widget's empty state, at every size, with its controls still usable (date, filters, view toggle) and the correct positive or neutral copy ("Nothing outstanding", "Nothing pending"). |
| **Not configured** | The module or the thing the widget depends on has never been set up: no budget for the year, no approval paths, no bank accounts, no fiscal year. | A distinct state from No data: a short explanation and a way out (a link or the name of the setup page), and no controls that cannot work. Today only Budget Compared to Actual ("No budget set up") and the shell's "Add account" style empty states come close. |
| **Default** | The fixtures as shipped. | The widget as the handover shows it. Selecting this restores every widget's registry defaults. |
| **Small data** | One to three records; the smallest set that still renders every element once. | Singular wording ("1 invoice", not "1 invoices"), charts with one bar or one slice, tables with one row, pagers and Load more hidden, totals that equal the single row. |
| **Extreme high volume of data** | Thousands of records, many groups, very large and very small amounts, long names. | Scrolling and paging, sort speed, axis scaling and label collisions, truncation with ellipsis, totals in the millions with cents, badge counts in the thousands, chips and menus with hundreds of options, and that nothing is capped silently. |

The states are **demo review aids**, like the widget selector: not part of the product, not built by
Value Labs, listed under the same "For developers only" label and removed at release by the same lint
rule (T6).

---

## 2. How it hooks up (shell)

Mirror the widget selector exactly, so the two controls behave as one toolbar.

1. **Address bar carries the state**, as `#k=` and `#only=` do: `#ds=none | notconfigured | default |
   small | extreme`. `default` and no `ds` are the same thing. The `hashchange` listener the shell already
   has re-renders everything, so no new event wiring is needed. Combined forms work: `#k=purchasing&ds=extreme`.
2. **Reader**: `function dataState(){var m=/[#&]ds=(none|notconfigured|default|small|extreme)/i.exec(location.hash||"");return m?m[1].toLowerCase():"default";}`
3. **Selector**: `dataStateSelectHTML()` returns a `<select id="dataStateSel" class="btn outlined sm">`
   with the five labels, current option selected, inside the same `devonly-wrap` as the widget selector,
   and the one shared "For developers only" label spanning both. Place it **before**
   `viewOnlySelectHTML()` in the toolbar builder (the line that returns
   `viewOnlySelectHTML()+wfindBtn+refreshAll+...`).
4. **Change handler**: the existing `document.addEventListener("change", ...)` for `viewOnlySel` gets a
   sibling for `dataStateSel` that rewrites only the `ds=` part of the hash and keeps `k=` / `only=`:
   read the hash, drop any `ds=...`, append `&ds=<value>` unless the value is `default`, set
   `location.hash`. If the hash did not change, call `render()` directly (as the widget selector does).
5. **Applying the state to widgets**: one function, called at the top of `render()` on the widgets about
   to be drawn (`viewOnly(cur().widgets)` returns them), and once for the Financial KPI band before
   `fkpRender()`:

   ```
   function dsApply(ws){
     var st=dataState();
     ws.forEach(function(w){
       if(!w._dsDefaults)w._dsDefaults={dataset:w.dataset,state:w.state};   // remember the registry row once
       var m=(DATA_STATE_MAP[w.kind]||{})[st];
       if(st==="default"||!m){w.dataset=w._dsDefaults.dataset;w.state=w._dsDefaults.state;}
       else{w.dataset=m.dataset!==undefined?m.dataset:w._dsDefaults.dataset;w.state=m.state!==undefined?m.state:w._dsDefaults.state;}
     });
   }
   ```
   The registry rows keep their own `dataset` and `state` (the fixture rows that show a single-path
   Purchasing or an empty Loans card still work), because `default` puts them back.
6. **The map** (`DATA_STATE_MAP`, one entry per kind) says which existing or new `dataset` / `state`
   value each option means for that widget. Section 4 has it. Where a widget already has an equivalent
   (`dataset:"none"`, `state:"empty"`, `dataset:"big"`), the map reuses it; where it does not, the
   widget's data accessor gains a branch (section 3).
7. **Shared pieces**: `DATA_STATES` (the generators, from `docs/data-states/data-states.js`, pasted into
   the shell region). Nothing else: the shell draws no block of its own for any option. **Owner's rule
   (16 October): the selector changes only the data a widget receives.** Each option is a `dataset` or
   `state` value the widget already reads, or a dataset name its own accessor turns into data (an empty
   list, a budget with no figures, queries at zero). The widget then shows whatever it already does with
   that, and where that is wrong or missing, the gap is the finding (section 9).

Keep everything inside `/* ===== Shell: data states (TEMPORARY review aid) ===== */` banners so the
release lint (T6) lists it next to the widget selector.

---

## 3. How each widget consumes it

Every finished widget already reads its fixture through one accessor (`purFDataset(w)`,
`lonFDataset(w)`, `arODataset(w)`, `apData(w)`, `gpFData(w)`, `penODataset(w)`, `insODataset(w)`,
`remOData(w)`, `depOData(w)`, `faFDataset(w)`, `bankAccounts(w)`, `depData(w)`). The pattern per widget:

- **Accessor**: add two branches, `if(w.dataset==="small")return DATA_STATES.get("small","<kind>");`
  and the same for `extreme`. `DATA_STATES.get` memoises, so the extreme set is generated once.
- **Empty**: `none` maps to the widget's existing empty branch (`dataset:"none"` or `state:"empty"`).
- **Not configured**: at the top of the content function, before the loading and empty checks,
  `if(w.state==="notconfigured")return notConfiguredHTML(w.kind);`. Glance returns the same block in
  its short form (title only), as the empty states do today.
- **Widgets without an accessor** need one thin indirection first:
  - Budget Compared to Actual reads `BGT_REPORTS` and the fiscal-year tables directly; wrap in
    `bgtOReports(w)`.
  - Payroll Distributions builds its runs from `PRO_DISTS` and `PRO_BASE` through its seeded generator;
    wrap both in `prODists(w)` / `prOBase(w)` so the generator scales with the distribution list.
  - Payroll Scheduled Time Off reads `PTOF_GROUPS`; wrap in `ptoFGroups(w)`.
  - My Status reads `MYS_QUERIES`; wrap in `mysQueries(w)` (states change the counts, not the list).
  - Main Content Tasks reads `MCT_TASKS`; wrap in `mctTasks(w)`.
  - Financial KPI reads `FKP_TILES` in `fkpRender`; wrap in `fkpTiles()` reading `dataState()` directly
    (the band is not a registry row).
  - Pending Actions and Alerts & Actions read `PA3_CATS` / `ALO_CATS`; wrap in `pa3Cats(w)` / `aloCats(w)`.
  - Deposits on Hand already has `dataset:"big"` and a `DEP_BIG` set; `extreme` maps to it, `small`
    needs a two-account set.
  - Gifts Pledges derives donors and gifts from each purpose's figures, so a purpose list is enough.
- **Drivers**: each widget driver gains four assertions (none, notconfigured, small, extreme render
  without error; extreme row count equals the generated length; small uses singular words). The
  `_tools/jo-port-driver.js` shim needs `location.hash` readable (it already fakes `location`).

---

## 4. The map, per widget

`default` always restores the registry row. Values in **bold** are new branches the widget needs.

| Kind | none | notconfigured | small | extreme |
|---|---|---|---|---|
| budget | `state:"empty"` **new** (year set up, no actuals) | **`state:"notconfigured"`** (today's "No budget set up" path) | **`dataset:"small"`** 1 report, 2 lines | **`dataset:"extreme"`** 12 reports, 60 lines each |
| pension | `dataset:"none"` | **notconfigured** | **small** 2 appointees, 1 district | **extreme** 3,000 appointees, 24 districts, 6 plans |
| payroll | `state:"empty"` | **notconfigured** | **small** 1 distribution, 2 pay types | **extreme** 60 distributions, 14 pay types |
| remittance | `state:"empty"` | **notconfigured** | **small** 1 activity, 2 churches | **extreme** 240 activities, 400 churches |
| receivables | `state:"empty"` | **notconfigured** | `dataset:"single"` (exists) | **extreme** 4,000 invoices, 600 customers |
| insurance | `dataset:"none"` | **notconfigured** | **small** 1 plan | **extreme** 80 plans, 9 types |
| deposits | `dataset:"empty"` | **notconfigured** | **small** 2 accounts | `dataset:"big"` (exists) |
| mystatus | **small counts all 0** | **notconfigured** (no queries chosen) | **small** counts 0 and 1 | **extreme** counts in the thousands |
| pto | `dataset:"none"` | **notconfigured** (no approval departments) | **small** 1 group, 1 person, 1 entry | **extreme** 40 groups, 600 people |
| loans | `dataset:"none"` | **notconfigured** | `dataset:"single"` (exists) | **extreme** 800 loans, 12 types |
| fixedassets | `dataset:"none"` | **notconfigured** | **small** 1 asset | **extreme** 5,000 assets, 40 classes, 30 buildings |
| purchasing | `dataset:"empty"` | **notconfigured** (no approval paths) | `dataset:"single"` (exists) | **extreme** 2,500 requests, 300 vendors, 6 paths |
| tasks | **small** (no tasks for the user) | **notconfigured** | **small** 1 task | **extreme** 240 tasks, 12 applications |
| bank | `state:"empty"` (shell copy "No bank accounts") | **notconfigured** | **small** 1 account | **extreme** 150 accounts |
| payables | `state:"empty"` | **notconfigured** | `dataset:"single"` (exists) | **extreme** 3,000 invoices, 400 vendors, due dates over 18 months |
| gifts | `dataset:"empty"` | **notconfigured** (no purpose allows pledges) | `dataset:"single"` (exists) | **extreme** 300 purposes |
| finkpi (band) | **zeros** | **notconfigured** (no fiscal year) | **small** three small figures | **extreme** figures in the billions, negative net income |
| pendingactions, alerts | `state:"empty"` | **notconfigured** (no queues) | **small** 1 group, 1 item | **extreme** 40 groups, 50 items each |

---

## 5. Not configured: suggested copy per widget

**Not rendered by the shell** (owner's rule, section 2 item 7). Kept as the wording to offer when a
widget gains its own "not set up" state: title, sub-line, and the setup place to name (the real page in
Shelby Financials). The list also lives in `docs/data-states/data-states.js` as `NOTCONF_COPY`.

| Kind | Title | Sub-line | Setup place |
|---|---|---|---|
| budget | No budget set up | There is no budget for this fiscal year yet. | General Ledger, Budgets |
| pension | No pension plans | No pension billing plans have been set up. | Pension Billing, Plans |
| payroll | Payroll is not set up | No pay types or compensation distributions exist yet. | Payroll, Setup |
| remittance | No remittance activities | No activities or pledges have been set up for this year. | Remittance, Activities |
| receivables | Accounts Receivable is not set up | No customers or invoice types exist yet. | Accounts Receivable, Setup |
| insurance | No insurance plans | No billing plans have been set up. | Insurance Billing, Plans |
| deposits | No deposit accounts | No deposit account types have been set up. | Deposits On Hand, Setup |
| mystatus | No queries selected | Choose the queries you want to follow. | the widget's own Configure button |
| pto | No approval departments | Your employee record has no departments to approve time off for. | Payroll, Employee Information, Can Approve Home Depts |
| loans | Loan Processing is not set up | No loan types or loans exist yet. | Loan Processing, Setup |
| fixedassets | No asset classes | No fixed asset classes have been set up. | Fixed Assets, Setup |
| purchasing | No approval paths | Requests cannot be routed until an approval path exists. | Purchasing Management, Approval Paths |
| tasks | No tasks available | Your role has no tasks in this application. | Security Setup, Task Roles |
| bank | No bank accounts | No bank accounts have been set up. | Bank Account Management, Bank Account Information |
| payables | Accounts Payable is not set up | No vendors or bank account for payables exist yet. | Accounts Payable, Setup |
| gifts | No pledge purposes | No purpose allows pledges yet. | Donors and Gifts, Purposes |
| finkpi | No fiscal year | The general ledger has no fiscal year to report on. | General Ledger, Fiscal Years |
| pendingactions, alerts | No queues configured | No posting or approval queues are set up for this company. | each module's Setup |

---

## 6. The data

`docs/data-states/data-states.js` holds `DATA_STATES`: deterministic generators (seeded, so every run
and every screenshot is identical) that return records in **each widget's own fixture shape**, plus
`NOTCONF_COPY` and the `small` sets as literals. `DATA_STATES.get(state, kind)` memoises. The file is
standalone (no shell dependencies) so it can be pasted into the shell helpers region as is, or loaded
beside `index.html` during development with a `<script src>` that is removed before release.

Conventions inside the generators: names from fixed pools (vendors, customers, people, churches),
amounts with cents and a few very large and very small values, dates spread over the window each widget
reads (the demo's "today" anchors: Purchasing 19 Aug 2026, Accounts Payable 23 Jul 2026, Gifts 19 Aug
2026, Deposits 24 Jul 2026), one deliberately long name per set ("Cleaning Services of Greater
Springfield and Surrounding Counties Inc" is the model), and counts chosen so totals do not round to
clean figures.

---

## 7. Checks before calling it done

- Each of the five options renders every widget at all three sizes with no console error.
- **none**: empty copy, controls still enabled, totals $0.00, Glance short form.
- **notconfigured**: the block from section 5, no filter chips or view toggles that cannot work.
- **small**: singular words everywhere ("1 request", "1 invoice"), one bar, one slice, no pager.
- **extreme**: tables scroll inside the card (no sideways scroll, per the Purchasing rule), bars and
  axes scale, long names ellipsise with hover, menus with hundreds of options stay usable (search box
  appears where the widget has one), render time under a second on the full dashboard.
- `default` after any other option shows exactly the handover screenshots again.
- Drivers green; lint T6 lists the new region as a review aid.

---

## 8. What Jo Phase 2 already has (reviewed 16 October, `_ref/jo-phase2-d7f33b0.html`)

Jo's mechanism is the one this plan reuses: extra **registry rows** per widget carrying `dataset:` and
`state:` flags, each read by the widget's data accessor. She never built a state selector; a reviewer
scrolls to the fixture row. Her "not set up" signal is an empty state **with a call-to-action button**
("Add account", "Add bank account", "Set up budget"); her "no data" states have no button.

| Widget (her kind) | State rows she ships | No data | Not set up | Copy worth reusing |
|---|---|---|---|---|
| Budget Compared to Actual (`budget-mb`) | `bgtF3` expense budget not set up (FY 2027), `bgtF4` income budget not set up (FY 2028); "No posted actuals yet" inside a year with a budget | Yes: "No posted actuals yet" | **Yes**: "No budget set up. Once a budget is entered for this fiscal year, actuals will be compared against it here." with "Set up budget" | both |
| Pension Plans (`pension`, `pension-mb`) | `pen4` / `penF3` no active appointments (`dataset:"none"`, `state:"empty"`) | Yes | No | title only |
| Payroll Distributions (`payroll-mb`) | `prF4` no history (`state:"empty"`) | Yes: "No payroll runs in this range. There's no payroll history for the selected period yet." | No | no-data copy |
| Remittance Pledges (`remittance`) | `rem3` all paid (`ontrack`), `rem4` one activity behind (`single`), `rem5` no pledges set up (`state:"empty"`), `rem6` date before the pledges begin (`newyear`) | **Yes, two kinds**: `rem6` (nothing in the window) and `rem3` (all paid) | Yes: `rem5`, copy "No remittance pledges yet" | the `newyear` idea: a date earlier than any data is a distinct no-data case worth copying to every dated widget |
| Receivable Invoices Outstanding (`receivables-mb`) | `arF3` everything current, `arF4` single aging bucket, `arF5` nothing outstanding (`state:"empty"`) | Yes | No | "Nothing outstanding" |
| Insurance Billing Plans (`insurance-mb`) | `insF3` no plans set up (`dataset:"none"`), `insF4` Dental filter, none set up (`nodental`); per-row "No one is enrolled in this plan yet" | Yes, per plan (zero enrolment) | **Yes**: "No insurance plans yet" (`insF3`), and a filter-level version (`insF4`) | both |
| Deposits on Hand (`deposits-mb`, `deposits`) | `depF5` no data (`dataset:"none"`, `state:"empty"`); `dataset:"big"` on her own `deposits` | No | **Yes**: "No deposit accounts. There are no deposit accounts to show here yet." with "Add account" | not-set-up copy; `big` is her only large set anywhere |
| My Status (`mystatus`) | none | No | No | - |
| Payroll Scheduled Time Off (`pto`) | `pto2` all approved, `pto3` no departments to approve, `pto4` renamed and hidden hour types (`alt`) | Partial (`pto2`: nothing pending) | **Yes, for the user**: `pto3`, the signed-in employee has no approval departments (the same case as section 5); `alt` is a **configuration variant** (hour types renamed or hidden by the company) | `pto3` wording; the `alt` idea belongs under Not configured as "configured differently" |
| Loans With Balance Due (`loans`) | `loan2` every loan current, `loan3` single aging band, `loan4` nothing outstanding (`state:"empty"`), `loan6` Individual filter, none outstanding (`notype`) | Yes, plus a filter-empty variant | No | "Nothing outstanding"; `notype` for filter-empty |
| Fixed Asset Values (`fixedassets`) | none | No | No | - |
| Purchasing Management (`purchasing`) | `pur3` single approval path, `pur4` nothing awaiting me (`dataset:"empty"`), `pur5` not on an approval path (`dataset:"empty"`, `state:"empty"`) | Yes: `pur4` | **Yes, for the user**: "Nothing needs your approval. You are not on an approval path yet, so there are no purchase requests to review here. When you are added to a path, anything that needs you shows up." | both; the user-level not-set-up wording is good |
| Main Content Tasks (`tasks`) | none; "No recent or saved tasks yet" in the My Tasks area | Partial | No | - |
| Bank Balances (`bank`) | `bank3` no accounts (`state:"empty"`) | No | **Yes**: "No bank accounts. There are no active bank accounts to show here yet." with "Add bank account" | not-set-up copy |
| Accounts Payable By Due Date (`payables`) | `ap3` single due date, `ap4` nothing outstanding (`state:"empty"`) | Yes: "Nothing outstanding. All supplier invoices are paid. Nothing is due right now." | No | no-data copy |
| Gifts Pledges (`gifts`) | `gft3` one purpose (`single`), `gft4` all on track (`ontrack`), `gft5` no pledges yet (`dataset:"empty"`, `state:"empty"`) | Partial (`gft4`) | Yes: "No pledges yet. When gift pledges are recorded for a purpose, their progress toward goal shows up here." | not-set-up copy (drop "toward goal") |
| Financial KPI | none; an error title "Could not load financial KPIs" | No | No | - |

**Error and loading.** The shell's generic dispatch handles `state:"error"` with `ERROR_COPY[kind]`
(deposits, payroll, budget, bank, gifts, purchasing, payables; the rest fall back to the deposits copy)
and a Retry button; every widget has a loading skeleton on a fetch. No registry row ships an error state.

### What this means for the five options

- **No data**: Jo covers it for Pension, Payroll Distributions, Remittance, Receivables, Loans,
  Purchasing, Accounts Payable and partly Gifts and Insurance. Missing: Budget (she has "no actuals"
  only inside a budgeted year), Deposits, Bank, Fixed Assets, Time Off, My Status, Tasks, Financial KPI.
- **Not set up**: Jo has a true version for Budget, Deposits, Bank, Insurance, Gifts and Remittance,
  and a user-level one for Purchasing and Time Off. Missing: Pension, Payroll, Receivables, Loans, Fixed
  Assets, Accounts Payable, My Status, Tasks, Financial KPI. Section 5's copy fills those; where she has
  wording, prefer hers (listed in the last column) so the two builds read alike.
- **Small**: her `single` rows (Remittance, Receivables, Loans, Purchasing, Accounts Payable, Gifts) are
  the small state for those six; the others have none.
- **Extreme**: only Deposits (`big`). Everything in `data-states.js` is new.
- **Two ideas worth adopting from her set** as sub-states later: a chosen date earlier than any data
  (`newyear`) and a filter that matches nothing (`notype`, `nodental`); both are "no data" seen through
  a control, and both trip widgets that only test for an empty dataset.
- **None of her extra rows survive in our build**: `ontrack`, `newyear`, `notype`, `alt` and her per-widget fixture rows were not carried when her blocks were replaced or trimmed (0 matches in `index.html`), so the states above exist only in her file. The generators and copy in this plan rebuild them centrally rather than row by row.
- **Her mechanism is ours**: the `dataset` / `state` flags on registry rows. The selector in section 2
  only sets those flags from one place instead of asking the reviewer to scroll to a fixture row.

---

## 9. Built on 16 October 2026 (local; first pass pushed in `c606587`, later passes uncommitted)

Three passes the same day, each on the owner's word.

**First pass** ("add it in local"): the shell region after the widget switchboard (generators,
`DATA_STATE_LABELS`, `dataState()`, `DATA_STATE_MAP`, `dsApply()`, the selector and its change handler,
both selectors under the one "For developers only" label), the `render()` hook, accessor branches for
twelve widgets and the Financial KPI band. The other session committed and pushed it in `c606587`.

**Second pass** ("this should affect every widget", and the first option reads "Default"): Budget
Compared to Actual, Payroll Distributions, My Status, Main Content Tasks, Pending Actions and Alerts &
Actions follow the state too. Budget scales its figures and swaps its special-report list through one
transform that every reader uses (the chart and the rolling windows read the fiscal-year tables by a
second path, now routed through the same transform); Payroll generates its runs per state; the four list
widgets swap their lists through a "live list" accessor because their helpers have no widget in hand.

**Third pass** ("it should not be new widgets but just the data going to the widgets"): the shell's own
Not configured block and its empty block for My Status, Main Content Tasks and Alerts were removed, with
`NOTCONF_COPY` and `notConfiguredHTML()`. Every option is now data: `DATA_STATE_MAP` only names a
`dataset` or `state` the widget already reads, and five accessors gained a dataset that returns an empty
or unconfigured shape (`nobudget`, `nodists`, `noqueries`, `nopurposes`, and `none` for Bank, Accounts
Payable, Receivables, Main Content Tasks, Alerts and Pending Actions). The band returns no tiles for Not
configured. Where a widget cannot tell "not configured" from "no data" the two options hand it the same
data.

**Verified in headless Chrome**, all 51 cards and the band, every option: no page errors, no visible
"undefined" or "NaN"; the first option reads "Default"; both dropdowns keep each other's part of the
hash. Suite: 3,971 passed, 0 failed across 20 drivers. Lint T6 lists the region as a review aid.

### What the data exposed (the point of the aid)

| Widget | No data | Not configured | Gap |
|---|---|---|---|
| Bank Balances | Empty table, chart and $0 headline | Same | No empty state at all |
| Budget Compared to Actual | "No data yet", $0 at Glance; chart with budget only | Its own "No budget set up" | None |
| Payroll Distributions | Its own "No payroll runs in this range" | Glance "No payroll this period"; table shows nothing | Table has no empty state for no distributions |
| Remittance Pledges | Its own "No remittance pledges yet" | Its own "No pledge term covers this date" (`noscope`) | None |
| Receivable Invoices Outstanding | Its own "Nothing outstanding" | Headings and six aging rows at $0 | Empty data with no `state:"empty"` shows an empty table |
| Insurance Billing Plans | "0 plans", empty table or donut | Same | No empty state |
| Deposits on Hand | Its own "No deposit accounts", Add account | Same | Cannot tell the two apart |
| My Status | "0, All clear" with Configure | Its own "No records to display, choose the queries" | None |
| Payroll Scheduled Time Off | Its own "No time off scheduled" | Same | Cannot tell the two apart |
| Loans With Balance Due | Its own "Nothing outstanding" | Same | Cannot tell the two apart |
| Fixed Asset Values | Its own "No fixed assets" | Same | Cannot tell the two apart |
| Purchasing Management | Its own "Nothing needs your approval" | Same | No "no approval paths" state |
| Main Content Tasks | "All content tasks are already..." (reads no tasks as all done); Glance "No recent or saved tasks yet" | Same | Wrong copy for an empty role |
| Accounts Payable By Due Date | Its own "Nothing outstanding" | Same | Cannot tell the two apart |
| Gifts Pledges | Its own "No gift or pledge purposes yet" | Same | Cannot tell the two apart |
| Pending Actions | Zeros per module; Glance still prints "7 AP invoices past due, 1 journal out of balance" | Same | Glance lines are fixed text, not data |
| Alerts & Actions | Switched off (`WIDGET_SWITCH.W20` false), not on the demo | Same | Not visible until switched on |
| Financial KPI band | Zero tiles | No tiles, header only | No "no fiscal year" state |

**Filter lists not extended**: the extreme sets reach districts, customer categories and loan types that
the widgets' fixed filter lists do not name, so those rows show but cannot be filtered to. **No driver
assertions yet** for the five states.

---

## 10. The data package layer (built 16 October 2026, evening)

Owner's instruction: map Jo Phase 2's states to the selector with a **package approach**. Every widget receives
its data as if it arrived as an API payload; the selector chooses the package; a trigger state shows Jo's design;
no new widgets; the Default face identical afterwards. Owner decisions while planning: placeholder cards that say
"Not designed yet" where Jo has no design; no "no access" state (a user without the right has no widget); Pending
Actions and Alerts & Actions out of scope.

**The envelope.** `{ state: "ok" | "no-data" | "not-configured" | "error", reason: "<code>", data: {...} }`. Reason
codes are the handover document's (`docs/handover/Widget data states - API responses and Jo Phase 2 designs
(draft).md`).

**Where it lives.** Five self-contained helpers in "Shell: shared widget helpers" (`pkg`, `pkgOption`, `pkgGen`,
`pkgStateHTML`, `pkgPlaceholderHTML`; the isolated drivers run that region first, so the helpers guard on
`typeof dataState` and `typeof DATA_STATES` and read Default when the data-states region is absent). One builder
per widget block, `<prefix>Package(w)`, which reads a stored response first (`w.pkg`, the API seam), then the
selector option, and hands back **the block's fixture objects by reference** for Default (the byte-identity
mechanism, and what keeps in-place mutation working: the Purchasing driver mutates `PURF_POS`). The accessor each
widget already had now reads `<prefix>Package(w).data`. Each content function reads the envelope first and routes
a non-ok package to `<prefix>StateHTML(w,p)` inside the block. `DATA_STATE_MAP` and `dsApply` are gone and
`render()` no longer touches any row, so Refresh, Refresh all and Retry show their skeleton again (they never did
while `dsApply` rewrote `w.state` on every render).

**Registry and driver fixture flags still work.** In Default the builder maps a row's own `dataset` / `state`
flags (`single`, `current`, `none`, `empty`, `nodental`, `noactuals`, `nobudget`, `nodists`, `noqueries`,
`nopurposes`, `noscope`) to the envelope they mean, so the commented fixture rows and the Gifts driver's inline
fixtures render as before.

**The mapping** (selector option, package, what the card shows; "Jo" = her design, carried in V2):

| Widget | No data | Not configured |
|---|---|---|
| Budget Compared to Actual | `no-actuals`: the year face with nothing posted (Jo) | `no-budget`: "No budget set up" + Set up budget (Jo); a `no-fiscal-year` response: placeholder |
| Pension Plans | `no-active-appointments`: "No active pension appointments" (Jo, one block) | `no-plans`: the same block |
| Payroll Distributions | `no-checks-in-window`: "No payroll runs in this range" (Jo) | `no-distributions`: header + placeholder |
| Remittance Pledges | `no-term-covers-date`: "No pledge term covers this date" | `no-activities`: "No remittance pledges yet" (Jo) |
| Receivable Invoices Outstanding | `all-settled`: "Nothing outstanding", Glance "All settled" (Jo) | `no-revenue-centres`: placeholder |
| Insurance Billing Plans | `no-enrolments`: the plans listed at zero (Jo's face) | `no-plans`: "No insurance plans yet" (Jo) |
| Deposits on Hand | `no-active-accounts`: "No deposit accounts" + Add account (Jo) | `no-account-types`: the same card |
| My Status | `every-query-zero`: "All clear" (Jo) | `no-queries-chosen`: the no-selection block + Configure (Jo) |
| Payroll Scheduled Time Off | `nothing-pending`: "No time off scheduled" | `nothing-ever-scheduled`: the same block (owner: no permissions version) |
| Loans With Balance Due | `none-with-balance`: "Nothing outstanding", Glance "All settled" (Jo) | `no-loan-types-or-loans`: placeholder |
| Fixed Asset Values | `nothing-to-chart-for-measure`: "No fixed assets yet" (Jo's copy, ported) | `no-assets`: the same block |
| Purchasing Management | `nothing-matches-status`: "Nothing needs your approval" | `not-on-any-path`: Jo's "not on an approval path yet" card (ported) |
| Main Content Tasks | `nothing-recent`: Glance "No recent or saved tasks yet" (Jo); other sizes placeholder | `role-has-no-tasks`: placeholder |
| Bank Balances | `all-zero-balances`: Jo's "No bank accounts" + Add bank account (ported into the widget) | `no-active-bank-accounts`: the same card |
| Accounts Payable By Due Date | `nothing-unpaid`: "Nothing outstanding" (Jo) | `no-payables-bank-account`: placeholder |
| Gifts Pledges | `no-active-pledges`: "No gift or pledge purposes yet" (Jo, one block) | `no-purposes`: the same block |
| Financial KPI band | `nothing-posted`: every tile at zero | `no-fiscal-year`: placeholder in the tile row |

Small and Extreme are `ok` packages carrying the generated sets; five widgets (Receivables, Loans, Purchasing,
Accounts Payable, Gifts) now get their generated small set instead of the `single` fixture the old map sent.

**Verified.** Node card dump (`_tools/one-off/dump-cards-2026-10-16.js`, 53 cards x 5 options) identical to the
pre-package baseline for Default after every step; headless Chrome: the Default DOM of every card and the band
identical to the pre-package file, no console error and no "undefined" / "NaN" under any option, the selector
reads back its option, and a widget's Refresh shows its skeleton under No data. Suite: the 20 drivers unchanged
at 3,971 plus the new `_tools/shell-package.driver.js`. Lint T1, T5 and T6 counts unchanged.

**Out of scope, as decided.** Pending Actions and Alerts & Actions keep their old accessors (they no longer react
to the selector, since nothing sets the flags they read). A "no access" state is not built. No real API call: the
`w.pkg` seam is where a response lands.
