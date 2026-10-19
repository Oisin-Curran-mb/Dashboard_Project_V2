# Widget data states: the API responses that trigger them, and Jo Phase 2's designs for each

Draft for review, 16 October 2026. Companion to "Widget data states - what triggers each one in the old system",
which says what in the data produces each state. This document turns those triggers into **API responses** and
says, for every widget and every response, **which Jo Phase 2 design to show**, or that there is none yet.

Sources: Jo's `phase-2` branch pulled today to `Jo Phase 2 branch\design-sandbox` (commit `9e1ce97`, 16 October,
snapshot at `_ref/jo-phase2-9e1ce97.html`; row ids and line numbers below are to that file), her
`Widget Container Demo\WIDGET-DECISIONS.md`, and the legacy code references in the companion document.

**What changed in Jo's demo since the 8 October snapshot.** Forty commits on 15 and 16 October: a craft and
consistency pass (My Status rebuilt as a grouped list, Accounts Payable's cash-outflow chart, Fixed Assets' "View
by" control and percent depreciated, Insurance's by-type glance bar, badge and tooltip conventions, target sizes),
a brief-verification pass against the Confluence DR briefs, and a move of the repository to ministry-brands-llc.
**Her set of empty and not-set-up states is unchanged**: the only difference is one title, "No assets in this
class" became "No assets in this group" to follow the new View by control. Everything below therefore holds for
both snapshots.

---

## 1. The idea: the response is the trigger

The widget never works out whether it is "not configured". The API does, from the counts in the companion
document, and returns one of a small set of states with a reason code. The dashboard shell maps the state to the
design. One envelope for every widget:

```
{
  "state":  "ok" | "no-data" | "not-configured" | "no-access" | "error",
  "reason": "<code from the tables below>",
  "data":   { ...the widget's normal payload, present for "ok" and "no-data" }
}
```

- **ok**: the widget renders its normal face with `data`. Jo's filtered and scoped empties (a type with no
  plans, a date no pledge covers, "You are all caught up" on the pending view) happen **inside** `ok`, driven by
  the user's controls on the client; they are listed below as "client-side" so the designs are not lost, but they
  are not API states.
- **no-data**: setup exists, nothing to show for the window or the user. `data` carries the setup that does
  exist (the plan list, the account types, the queries chosen) so the widget can still show its controls.
- **not-configured**: the module's setup is missing. `reason` says what. The design carries the call to action.
- **no-access**: the user holds the module but not the data (Payroll Scheduled Time Off's approval departments
  is the one case so far). Jo designed this with a lock icon.
- **error**: the API failed. Jo's shell has this already: the widget's own error copy and a Retry button
  (`contentHTML`, line 11502; `ERROR_COPY` entries for deposits, payroll, budget, gifts, bank, purchasing,
  payables). **The old dashboard redirected the whole page on an error; V2 shows it in the one card.**

Jo's demo already uses two registry flags that are exactly these states: `state:"empty"` and `dataset:"none"`
(her not-set-up and no-data rows), and the V2 data-state selector sets the same flags. So "show her version"
means: when the API returns the state, set the flag her block reads.

---

## 2. Widget by widget

For each widget: the API reasons (from the companion document's section 4), the Jo design that answers each one
(her registry row, the function that draws it, the copy), and the gap where she has none. "Copy" is quoted from
her file so Value Labs can lift it.

### 2.1 Budget Compared to Actual (her live kind `budget-mb`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-fiscal-year` | **None.** Her widget assumes a year | needs design (or the Financial KPI band's, see 2.17) |
| `not-configured / no-accounts-in-scope` | **None** | needs design; the rights variant ("your account roles hide every account") needs wording too |
| `not-configured / no-budget` | Rows `bgtF3` (expense, FY 2027) and `bgtF4` (income, FY 2028); drawn by `bgtFNoBudgetState` when no row has a budget above zero (lines 7803, 7869) | "No **income budget** set up" / "No **expense budget** set up"; "Actuals are posting, but nothing has been entered yet to compare them against."; button **Set up budget** |
| `no-data / no-actuals` | Inside the year face: "No posted actuals yet" headline at Glance (verified 8 October review) | as is |
| client-side: a special-report line that no longer exists | **None.** The old panel fell back silently | the API should return `ok` with a `warning` and the widget should say the saved selection was reset |
| `error` | Shell: `ERROR_COPY.budget` + Retry | "Couldn't load budget data. Something went wrong fetching budget and actual figures." |

### 2.2 Pension Plans (`pension-mb`, live `penF*`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-plans` | Row `penF3` (`state:"empty"`, `dataset:"none"`), `penFEmpty` (line 4859) | "No active pension appointments. Once clergy are appointed to a pension plan in the Pension Billing module, their annual contributions will appear here by plan." |
| `no-data / no-active-appointments` | **The same block** (`!penFFiltered(w).length && dataset==="none"`, line 4861) | same copy, which fits this case better than the first |
| client-side: a district with no appointee on a plan | `penFDetailModalHTML`: "No appointees on this plan. Nothing matches this plan for {district}." | as is |
| `error` | Shell generic (no `ERROR_COPY.pension`; falls back to the deposits wording) | needs its own line |

Gap: one block for two states. The not-configured case needs its own title ("No pension plans set up") and a
pointer to Pension Billing, Plans; her existing copy stays for no-data.

### 2.3 Payroll Distributions (`payroll-mb`, live `prF*`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-distributions` | **None.** Her `prFContent` second empty (line 8296) fires when every table row sums to zero, with `ec0` copy | needs design: "Payroll is not set up" with a pointer to Payroll, Setup |
| `no-data / no-checks-in-window` | Row `prF4` (`state:"empty"`), `EMPTY_COPY.payroll` (line 8289) | "No payroll runs in this range. There's no payroll history for the selected period yet." |
| `error` | Shell: `ERROR_COPY.payroll` + Retry | "Couldn't load payroll data. Something went wrong fetching payroll history." |

### 2.4 Remittance Pledges (`remittance-mb`, live `remF*`; the older `remittance` rows carry more variants)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-activities` | Row `remF3` (`state:"empty"`), `remFEmpty` (line 5742); older `rem5` | "No remittance pledges yet. Once your conference or denomination sets up this organisation's pledges, you will see what is pledged, paid and outstanding, and whether you are keeping pace over each pledge's term." |
| `no-data / no-term-covers-date` | Older generation only: row `rem6` (`dataset:"newyear"`), `remThruEmpty` (line 5226: data exists, no active rows) | "No pledges in this date range. No pledges were active on or before {date}. Move the receipts date forward to see them." |
| `no-data / no-receipts` | Normal face with zero paid (older `rem3` "all pledges paid" is the opposite case, every pledge complete) | as is |
| `error` | Shell generic (no `ERROR_COPY.remittance`) | needs its own line |

Gap: the date-range empty exists only in the older `remittance` block; the live `remF` block should carry it.
Note her decisions file: pacing is now calendar year to date, so "no term covers the date" is the only
date-driven empty she needs.

### 2.5 Receivable Invoices Outstanding (`receivables-mb`, live `arF*`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-revenue-centres` | **None** | needs design: "Accounts Receivable is not set up" with a pointer to Accounts Receivable, Setup |
| `no-data / all-settled` | Row `arF5` (`state:"empty"`), `arFEmpty` (line 9879) | "Nothing outstanding. Every invoice has been paid. There is nothing to chase right now." |
| client-side: a centre or source with nothing, a bucket with nothing | `arDetailModalHTML`: "No invoices to display. Nothing matches this selection."; search: "No matches for "{query}"" | as is |
| `error` | Shell generic | needs its own line |

### 2.6 Insurance Billing Plans (`insurance-mb`, live `insF*`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-plans` | Row `insF3` (`state:"empty"`, `dataset:"none"`), `insFEmpty` (line 11250) | "No insurance plans yet. Once plans are set up in the Insurance Billing module, enrolment counts (employees and dependents) will appear here." |
| `no-data / no-enrolments` | Normal face: plans listed at 0 with the per-plan line "No one is enrolled in this plan yet" (8 October review) | as is |
| client-side: a type with no plans | Row `insF4` (`dataset:"nodental"`), `insFScopedEmpty` (line 11253) | "No {Type} plans. There are no {type} plans set up right now. Pick another type above to see the rest." |
| `error` | Shell generic | needs its own line |

Her decisions file flags the employee versus dependent split and premium per plan as data dependencies to
confirm; the counts-only response is what the old panel gives.

### 2.7 Deposits on Hand (`deposits-mb`, live `depF*`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-account-types` (or no bank account in context) | Row `depF5` (`state:"empty"`, `dataset:"none"`), shell generic with `EMPTY_COPY.deposits` (line 11520) | "No deposit accounts. There are no deposit accounts to show here yet."; button **Add account** |
| `no-data / no-active-accounts` | **The same block** | the title fits; the call to action is right for both |
| `error` | Shell: `ERROR_COPY.deposits` + Retry | "Couldn't load balances. Something went wrong fetching account data." |

Gap: none that matters; one design serves both because the fix is the same (add an account).

### 2.8 My Status (`mystatus`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-queries-chosen` | `mysContent` when the selection is empty (line 8515) | "Nothing to show yet. Pick the things you want to keep an eye on. Their live counts appear here."; button **Configure** |
| `no-access / no-module-any-query-targets` | **None** (the old panel hides the grid and the Select button) | needs design: say which modules unlock queries |
| `no-data / every-query-zero` | Normal face: her rebuilt grouped list with counts at 0 (16 October) | as is |
| client-side: a query with 0 opened | `mysDetailModalHTML`: "No records to display" | as is |
| `ok` with `warning: unmatched-saved-queries` | **None.** The old panel drops them silently | the widget should list the names it could not match |

### 2.9 Payroll Scheduled Time Off (`pto`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `no-access / no-approval-departments` | Row `pto3` (`state:"empty"`), `ptoNoAccessState` (line 10458) with a **lock** icon; Glance: "No departments / 0 / no approval rights" | "No access to time-off data. You have the Payroll module, but you're not permitted to view time-off records here. Ask an administrator if you need access." |
| `not-configured / nothing-ever-scheduled` | **None** as a distinct state; her `ptoEmptyForView` "all" view says "No scheduled time off. There is no time off recorded for {year}." | reuse that line |
| `no-data / nothing-pending` | `ptoEmptyForView` pending view (line 10448); row `pto2` "all approved" shows it | "You are all caught up. No time off is waiting for your approval in {year}. Switch the view to see approved time off." |
| client-side: approved view empty; filters match nothing; a day with nothing | "No approved time off. Nothing has been approved for {year} yet."; `ptoQueueTable`: "You are all caught up. No time off matches these filters."; `ptoDayModalHTML`: "No time off on this day" | as is |
| configuration variant: hour types renamed or hidden by the company | Row `pto4` (`dataset:"alt"`) | not a state, a payload shape: the API must carry the company's hour-type captions and which are hidden |

Her decisions file also removed the "Dismiss" action (no reject exists in the model). The old panel's "no
employee record shows every department" must become `no-access` or a ruling, never `ok` with everything.

### 2.10 Loans With Balance Due (`loans`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-loan-types-or-loans` | **None** as such; `loanEmpty` fires for `state:"empty"` **or** an empty dataset (line 6675) | her copy below is a no-data sentence; the not-configured case needs "Loan Processing is not set up" |
| `no-data / none-with-balance` | Row `loan4` (`state:"empty"`), `loanEmpty` | "Nothing outstanding. No loans currently carry a balance. There is nothing to collect right now." |
| client-side: a type with nothing outstanding | Row `loan6` (`dataset:"notype"`), `loanScopedEmpty` (line 6678) | "No {Type} loans. No loans of this type are carrying a balance. Pick another type above to see the rest." |
| `ok` variants she designed | `loan2` every loan current, `loan3` a single aging band | normal face |
| `error` | Shell generic | needs its own line |

Her decisions file settles four aging buckets (Current, 30-59, 60-89, 90+), which also replaces the old panel's
overlapping algorithm (companion document 3.10).

### 2.11 Fixed Asset Values (`fixedassets`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-assets` | `faEmptyState` for `state:"empty"` (line 11431); **no registry row ships it**, so it has never been seen in her demo | "No fixed assets yet. When assets are added to the Fixed Assets module they will show here, grouped and valued." |
| `no-data / nothing-to-chart-for-measure` | `faPie` / `faBar` when every group is zero (lines 11407, 11421) | "Nothing to chart. No group has a {measure} above zero." |
| client-side: a group with no assets | `faTable` (line 11381) | "No assets in this group. Nothing is assigned to {group} yet." |
| `error` | Shell generic | needs its own line |

### 2.12 Purchasing Management (`purchasing`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-approval-paths` (company level) | **None.** Her empty is user-level | needs design: "No approval paths. Requests cannot be routed until an approval path exists." with a pointer to Approval Paths |
| `no-access / not-on-any-path` (user level) | Row `pur5` (`state:"empty"`, `dataset:"empty"`), `purEmptyState` with `EMPTY_COPY.purchasing` (line 9112) | "Nothing needs your approval. You are not on an approval path yet, so there are no purchase requests to review here. When you are added to a path, anything that needs you shows up." |
| `no-data / nothing-matches-status` | Row `pur4` (`dataset:"empty"`), `purCaughtUp` (line 9045): "You are all caught up" for the For-me scopes, "Nothing to show" for All | per scope |
| `ok` variant | `pur3` single approval path | normal face |
| `error` | Shell: `ERROR_COPY.purchasing` + Retry | "Could not load purchase orders. Something went wrong fetching approval requests." |

Her decisions file marks the For-me / All scope and three status tiles as settled. The old panel's "Awaiting
my approval next" before the first approval row (companion 3.12) is an API ruling, not a design.

### 2.13 Main Content Tasks (`tasks`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / role-has-no-tasks` | **None.** Her only empty is the Glance line "No recent or saved tasks yet" (line 8459) | needs design: "No tasks available. Your role has no tasks in this application." and who can fix it |
| `no-data / nothing-recent` | The Glance line above | "No recent or saved tasks yet" |
| `error` | Shell generic | needs its own line |

Her decisions file: pin, hide and reorder are a data-layer build; keep the star affordance.

### 2.14 Bank Balances (`bank`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-active-bank-accounts` | Row `bank3` (`state:"empty"`), shell generic with `EMPTY_COPY.bank` (line 6902) | "No bank accounts. There are no active bank accounts to show here yet."; button **Add bank account** |
| `no-data` | does not arise: an account at $0 is a row | normal face |
| rights variant: the user's account roles hide every account | **None**, and the response is indistinguishable from no accounts unless the API says so | return `no-access / account-roles-hide-all` and reuse the lock design from Time Off |
| `error` | Shell: `ERROR_COPY.bank` + Retry | "Couldn't load bank balances. Something went wrong fetching account balances." |

### 2.15 Accounts Payable By Due Date (`payables`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-payables-bank-account` | **None** | needs design: "Accounts Payable is not set up. No bank account is marked for payables yet." |
| `no-data / nothing-unpaid` | Row `ap4` (`state:"empty"`), `apContent` / `apGlance` with `EMPTY_COPY.payables` (lines 10744, 10790) | "Nothing outstanding. All supplier invoices are paid. Nothing is due right now." |
| `ok` variant | `ap3` single due date | normal face |
| `error` | Shell: `ERROR_COPY.payables` + Retry | "Couldn't load payables. Something went wrong fetching outstanding invoices." |

### 2.16 Gifts Pledges (`gifts`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-purposes` | Row `gft5` (`state:"empty"`, `dataset:"empty"`), `gftEmpty` (line 6233) with `EMPTY_COPY.gifts` | "No pledges yet. When gift pledges are recorded for a purpose, their progress toward goal shows up here." |
| `no-data / no-active-pledges` | **The same block** | the copy reads as no-data; the not-configured case needs "No pledge purposes" |
| client-side: nothing behind | `gftBehindPanel`: "Nothing to follow up. Every purpose is on track or ahead of schedule as of {date}."; per purpose: "No donors behind" | as is |
| `ok` variants | `gft3` one purpose, `gft4` all on track | normal face |
| `error` | Shell: `ERROR_COPY.gifts` + Retry | "Could not load pledges. Something went wrong fetching pledge progress. Please try again." |

### 2.17 Financial KPI (`finkpi`)

| API state and reason | Jo's design | Copy |
|---|---|---|
| `not-configured / no-fiscal-year` or `no-accounts` | **None** | needs design; the band is the natural home for "No fiscal year set up" since Budget shares the cause |
| `no-data / nothing-posted` | **None** designed; tiles at zero | decide whether zeros or a line |
| `error` | `finkpiContent` (line 11497) | "Could not load financial KPIs" |

---

## 3. The matrix

A tick means Jo has a design that fits the state as defined here; "shared" means one block serves two states;
a blank is a gap.

| Widget | Not configured | No data | No access | Filtered or scoped empty (client) | Error copy of its own |
|---|---|---|---|---|---|
| Budget Compared to Actual | ✓ no budget; blank for no year or no accounts | ✓ | | | ✓ |
| Pension Plans | shared | shared | | ✓ | |
| Payroll Distributions | | ✓ | | | ✓ |
| Remittance Pledges | ✓ | ✓ (older block only) | | | |
| Receivable Invoices Outstanding | | ✓ | | ✓ | |
| Insurance Billing Plans | ✓ | ✓ | | ✓ | |
| Deposits on Hand | shared | shared | | | ✓ |
| My Status | ✓ | ✓ | | ✓ | |
| Payroll Scheduled Time Off | (reuse "all" view line) | ✓ | ✓ | ✓ | |
| Loans With Balance Due | | ✓ | | ✓ | |
| Fixed Asset Values | ✓ (never mounted) | ✓ | | ✓ | |
| Purchasing Management | | ✓ | ✓ | | ✓ |
| Main Content Tasks | | ✓ (Glance line) | | | |
| Bank Balances | ✓ | n/a | | | ✓ |
| Accounts Payable By Due Date | | ✓ | | | ✓ |
| Gifts Pledges | shared | shared | | ✓ | ✓ |
| Financial KPI | | | | | ✓ |

---

## 4. What to ask Jo for

Eleven designs, in the order the API will hit them most:

1. **A shared "module not set up" pattern** with a title, one sentence, and a pointer to the setup page (her
   Bank and Deposits cards with their Add buttons are the model). Then its words for: Payroll Distributions,
   Receivable Invoices Outstanding, Loans With Balance Due, Accounts Payable By Due Date, Main Content Tasks,
   Purchasing Management (company-level "no approval paths"), and the second titles for Pension Plans and Gifts
   Pledges where one block now serves two states.
2. **No fiscal year** for Budget Compared to Actual and the Financial KPI band, once, because the cause is the
   same.
3. **A shared "you cannot see this" pattern** from her Time Off lock card, for My Status (no module unlocks a
   query) and Bank Balances and Budget (account roles hide everything).
4. **A reset-selection warning** inside the normal face (Budget's vanished special-report line, My Status's
   unmatched saved queries) so nothing is silently dropped the way the old panels did.
5. **Error copy** for the eight widgets that fall back to the deposits wording today: Pension, Remittance,
   Receivables, Insurance, My Status, Time Off, Loans, Fixed Assets, Main Content Tasks.
6. Carry the **date-range empty** from the older Remittance block into the live one.

## 5. What this means for the V2 build

Built on 16 October 2026 (evening) as the **data package layer** (`docs/DATA-STATES.md` section 10):

- Every widget block has a `<prefix>Package(w)` builder returning this document's envelope. Today it reads the
  review selector and the block's fixtures; a stored response on the row (`w.pkg`) always wins, so the API
  integration is `refresh()` storing the response there. Nothing else on the client moves.
- Each content function routes a non-ok package to `<prefix>StateHTML(w,p)`, which shows Jo's design where she has
  one (section 2) and the owner's "Not designed yet" placeholder where she has none. Owner decisions: no invented
  copy; no "no access" state (a user without the right has no widget); Pending Actions and Alerts & Actions out of
  scope.
- The `reason` codes in section 2 are the ones the builders emit. The companion document's section 4 remains the
  authority for what count produces each one.
