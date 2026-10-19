# Shell: the data package layer

Owner instruction, 16 October 2026 (evening): map Jo Phase 2's empty and not-set-up states to the
"For developers only" data-state selector with a package approach. Every widget receives its data as
if it arrived as an API payload; the selector chooses the package; when the package carries a trigger
state the widget shows Jo's design for it. No new widgets. First make every widget work from a package,
then map the visuals. The Default face must look the same for every widget afterwards.

## Decisions

- **Envelope** `{state: ok | no-data | not-configured | error, reason, data}`. Reason codes from
  `docs/handover/Widget data states - API responses and Jo Phase 2 designs (draft).md`.
- **Widget-level, not shell-level.** The builder and the state renderer live inside each block. The
  shell supplies five self-contained helpers (`pkg*`) and nothing else; it never names a builder, so the
  "no widget code outside its block" assertions hold and the isolated drivers (Purchasing, Gifts, band)
  still run the block alone.
- **Default by reference.** The Default package hands back the block's fixture objects themselves. That
  is the byte-identity mechanism and what keeps in-place mutation working.
- **The selector reaches the data only.** `DATA_STATE_MAP` and `dsApply` deleted; `render()` touches no
  row. Side effect fixed: Refresh, Refresh all and Retry show their skeleton again.
- **Gaps are placeholders** that say "Not designed yet" with the widget, state and reason; no invented
  copy (owner). Seven on screen: Payroll, Receivables, Loans, Accounts Payable, Main Content Tasks (all
  sizes but Glance), the band; plus Budget's no-fiscal-year and Purchasing's company-level no-paths,
  reachable only from a response.
- **No "no access" state** (owner: a user without the right has no widget). Jo's lock card is not
  ported.
- **Out of scope** (owner): Pending Actions, Alerts & Actions.

## Jo designs carried in

Bank Balances' "No bank accounts" card with Add bank account (her shell fallback, now drawn by the
widget so it reaches the face); Purchasing's "not on an approval path yet" card; Fixed Asset Values'
"No fixed assets yet. When assets are added to the Fixed Assets module they will show here, grouped
and valued." (replaces the build-invented wording). Every other state uses the block Jo already had in
V2.

## Verification

Node card dump identical for Default after every step (53 cards); headless Chrome Default DOM identical
to the pre-package file; no console error or "undefined" / "NaN" under any option; Refresh shows its
skeleton under No data; suite 3,971 plus the new shell-package driver; lint counts unchanged.

## Release

The selector goes before v2.0-rc1 (`docs/PLAN.md` release gate). The package layer stays: it is the
API integration point. The placeholders must be replaced by Jo's designs or removed before release.
