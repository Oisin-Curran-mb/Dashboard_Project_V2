# What is shared, and which widget uses it

Written 28 September 2026. Every widget in this build was written self-contained
on purpose, so that editing one could not affect another. That worked: seventeen
widgets were finalised one at a time without a single knock-on failure. The cost
was the same helper written out once per widget.

This document records what has been lifted into shared code, which widget uses
each piece, and what was deliberately left duplicated because the copies differ
in ways you can see on screen.

## The build: the shared helper package

In `index.html`, inside the shell, under the banner `Shell: shared widget
helpers (the common package)`.

A widget keeps its own named helper, which is now a one-line alias. No call site
anywhere moved, so the isolation stays where it matters, at the point of use. A
widget can take its own body back at any time if it needs to diverge.

| Helper | Widgets | What it replaced |
|---|---|---|
| `escAttr` | W02, W03, W04, W05, W06, W10, W16, W17 | eight byte-identical attribute escapers |
| `escText` | W09, W11, W13, W18 | four four-entity escapers; the shared one keeps W09's null guard, which is strictly safer for the other three |
| `parseISO` | W03, W04, W10, W13, W16, W17 | six identical local-midnight ISO parsers |
| `fmtDateLong` | W04, W05, W10, W13, W17 | five long-date formatters, three of which inlined their own month table; the shared one keeps the "return the input untouched when it is not a date-only ISO string" guard that only two had |
| `MONTHS` | W04, W13, W16, W17 | four identical twelve-element month tables, now private copies of one literal |
| `moneyFull` | W02, W10, W13, W16 | four identical two-decimal money formatters; the shared one keeps W13's null tolerance |
| `bandFromDays` | W04, W17 | two byte-identical pace-band ladders |

Thirty-three per-widget helpers now resolve to seven implementations.

The harness lifts this package out of `index.html` at run time, so a driver that
runs one widget's block in isolation still has the helpers, and there is never a
second copy in the test code to drift from the build.

### Left duplicated, on purpose

These are not oversights. Unifying any of them is a design decision, because the
copies differ in what the user sees.

- **Compact axis money**, five copies across W01, W11, W13, W15 and the shell.
  Five different rounding thresholds, tier boundaries and letter casing, all
  visible on a chart axis.
- **Sign-aware money**, two copies. W15 uses a true minus sign, W17 a hyphen,
  and they differ in decimal places.
- **Severity ladders**, three copies across W05, W10 and W16. Different band
  counts over different domains. Only the loop is shareable.
- **Day-difference helpers**, three copies. Midnight normalisation and
  zero-clamping are deliberate per widget.
- **Popover positioning**, six near-copies. Five clamp to the viewport; W07
  flips to the right edge and tries an upward placement first. Five could share;
  W07 must not.
- **Popover open and close**, six copies. Only W13 toggles when the same
  control is pressed twice. The others reopen. That is a behavioural difference
  to rule on, not to paper over.
- **Modal shells**, nineteen sites. The header layouts genuinely differ.
- **Sort buttons and sort state**, fourteen and twenty-one copies. The logic is
  identical; the `data-` attribute name is per widget, so a shared builder needs
  that as a parameter and every call site would move.
- **Skeletons and loaders**, eleven copies each. Shareable, but the loading-flag
  name differs in all eleven, so the flags want normalising first.
- **Empty states**, sixteen builders over one markup shape. The shell already
  has the mechanism (`EMPTY_COPY` / `ERROR_COPY`); adopting it would move
  user-visible copy in several widgets.

The last four are the largest remaining wins and the right next step, in that
order. None was taken tonight because each moves either markup or wording, and
that is yours to rule on.

## The tests: the shared library

In `_tools/jo-port-driver.js`.

| Export | Replaces | Adopted by |
|---|---|---|
| `sharedPackage()` | the build's helper package, lifted at run time | every driver, through `runBlock` |
| `TAIL` | fourteen byte-identical copies of the shell's closing lines, plus one in `syntax-check.js` | 14 drivers and the syntax gate |
| `NODE_GLOBALS()` | fourteen byte-identical copies of a nineteen-key globals bag | 14 drivers; W18's bag is its own timer override and is untouched |
| `code()` | four named comment strippers and twelve inlined copies of the same regex | 4 drivers so far |
| `meta(Wnn)` | a driver's number, name, kind, prefix and tags, from the map instead of transcribed | all 17 |
| `assertMarkersUnique()` | the marker-uniqueness assertion, hand-rolled in eighteen places | available, not yet adopted |
| `outside()` | the "shell minus this widget's region" computation | available, not yet adopted |

### Not done, and why

Fourteen drivers still wrap `runBlock` in their own ten-line hosting layer. A
single `H.hostShell()` would remove all fourteen copies, and the export is
designed for it, but that change touches every driver at once, and the drivers
are the only thing that proves the build. It wants a reviewed pass, not an
unsupervised one.

Two drivers, W06 and W09, define the same named check with different strictness:
on a missing head-and-body pair W06 fails and W09 passes, W06 samples four rows
and W09 three, and W06 requires an exact cell count where W09 allows extras.
Consolidating them will change at least one driver's result. That needs your
ruling on which semantics is right.

## Running one widget's tests

The old form still works and is unchanged:

```bash
node _tools/verify.js w05
```

It is a substring match on the file name, which means `w1` quietly selects eight
drivers. Three exact forms now sit alongside it, each validated against the map,
each stopping with an error if the value does not exist:

```bash
node _tools/verify.js --widget=W10
node _tools/verify.js --kind=loans
node _tools/verify.js --tag=uses:bandFromDays
node _tools/verify.js --list
```

The last prints every widget with its kind and its tags.

### Tags

Tags live in `_tools/widget-map.json` and are **derived from the build**, not
typed, by `_tools/one-off/build-test-lib-2026-09-28.js`. Re-run it after any
change and they follow the code.

A `uses:<helper>` tag means that widget's own region calls that helper from the
shared package, so `--tag=uses:parseISO` runs every widget that would be
affected by a change to it. The rest describe the widget's shape, and so the
shape of its tests: `table`, `sort`, `pager`, `modal`, `popover`, `skeleton`,
`chart`, `search`, `filter`, `checklist`.

| Widget | Kind | Tags |
|---|---|---|
| W01 Budget Compared to Actual | budget | table sort modal popover skeleton chart filter |
| W02 Pension Plans | pension | uses:escAttr uses:moneyFull table sort modal skeleton chart filter |
| W03 Payroll Distributions | payroll | uses:escAttr uses:parseISO table sort skeleton chart filter |
| W04 Remittance Pledges | remittance | uses:escAttr uses:parseISO uses:fmtDateLong uses:MONTHS uses:bandFromDays table sort pager modal skeleton filter |
| W05 Receivable Invoices Outstanding | receivables | uses:escAttr uses:fmtDateLong table pager modal popover skeleton chart filter |
| W06 Insurance Billing Plans | insurance | uses:escAttr table sort skeleton chart filter |
| W07 Deposits on Hand | deposits | table sort pager modal popover skeleton chart search filter |
| W08 My Status | mystatus | table modal search |
| W09 Payroll Scheduled Time Off | pto | uses:escText table modal popover filter |
| W10 Loans With Balance Due | loans | uses:escAttr uses:parseISO uses:fmtDateLong uses:moneyFull table sort modal popover skeleton chart filter |
| W11 Fixed Asset Values | fixedassets | uses:escText table sort pager modal popover chart filter |
| W13 Purchasing Management | purchasing | uses:escText uses:parseISO uses:fmtDateLong uses:MONTHS uses:moneyFull table modal popover skeleton search filter checklist |
| W14 Main Content Tasks | tasks | search filter |
| W15 Bank Balances | bank | table sort pager modal skeleton chart search filter |
| W16 Accounts Payable By Due Date | payables | uses:escAttr uses:parseISO uses:MONTHS uses:moneyFull table sort modal popover skeleton chart search filter |
| W17 Gifts Pledges | gifts | uses:escAttr uses:parseISO uses:fmtDateLong uses:MONTHS uses:bandFromDays table pager modal popover skeleton search filter |
| W18 Financial KPI | none, it is a page section | uses:escText popover skeleton |

W14 carries no shared helper and none of the table, modal or chart shapes. That
is accurate: it is a task list with sections and checkboxes.

## How this was checked

The assertion count did not move. 3069 assertions across 17 drivers before the
shared package, and 3069 after, with the same per-driver totals. Every widget was
then rendered in the browser at all three sizes and checked for money and date
output, with no `NaN`, no `Invalid Date` and no console error.
