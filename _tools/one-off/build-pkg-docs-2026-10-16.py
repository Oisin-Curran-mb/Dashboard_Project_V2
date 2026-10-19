# Data package layer: the documentation that travels with the build (16 Oct 2026).
#   docs/PLAN.md release gate (line "Remove the second TEMPORARY review aid...") and the status paragraph
#   docs/SHARED.md: the pkg* helper rows
#   docs/DATA-STATES.md: section 10, the package layer and the mapping table
#   docs/decisions/Shell-data-package.md: the decision record
#   docs/handover/Widget data states - API responses and Jo Phase 2 designs (draft).md: section 5 rewritten
# Each file keeps its own line endings. Run: python -I <this file>
import re, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"


def rw(rel, fn):
    p = os.path.join(ROOT, rel); b = open(p, "rb").read().decode("utf-8")
    nl = "\r\n" if b.count("\r\n") > b.count("\n") // 2 else "\n"
    t = b.replace("\r\n", "\n"); t2 = fn(t); assert t2 != t, rel
    open(p, "wb").write(t2.replace("\n", nl).encode("utf-8")); print("updated", rel)


# ---------- PLAN.md ----------
def plan(t):
    m = re.search(r"^- Remove the second TEMPORARY review aid added 16 Oct 2026:.*$", t, re.M); assert m
    new = ("- Remove the second TEMPORARY review aid added 16 Oct 2026, the data-state selector: in the \"Shell: data states\" block "
           "`DATA_STATES`, `DATA_STATE_LABELS`, `dataState`, `dataStateSelectHTML`, `devSelectorsHTML` and its `change` listener; the "
           "`devSelectorsHTML()` call in the toolbar (back to `viewOnlySelectHTML()`); the `ds=` handling in the widget selector's listener; "
           "the `.devonly-row` CSS. **Keep** the data package layer: the `pkg*` shared helpers, every `<prefix>Package(w)` builder, the "
           "`<prefix>StateHTML(w,p)` renderers and the `w.pkg` seam; they are the API integration point, not a review aid. Once the block "
           "is gone `pkgOption()` returns \"default\" through its `typeof` guard, so the builders' none / notconfigured / small / extreme "
           "branches become unreachable: delete them, or keep them as development fixtures (owner's call). The seven `PLACEHOLDER` cards "
           "(\"Not designed yet\") must be replaced by Jo's designs or removed before release. Lint rule T6 reports the block while present. "
           "Design: `docs/DATA-STATES.md` section 10, decision `docs/decisions/Shell-data-package.md`.")
    t = t[:m.start()] + new + t[m.end():]
    m2 = re.search(r"^\*\*Release gate, still open\.\*\*.*$", t, re.M); assert m2
    t = t[:m2.end()] + (" Since 16 Oct 2026 (evening) the selector no longer rewrites any row's `dataset` / `state`: every widget renders from an "
                        "API-shaped package built inside its block (`docs/DATA-STATES.md` section 10), so Refresh and Retry show their skeleton "
                        "again and the default face is byte-identical to the pre-package build (Node card dump and headless Chrome DOM, both compared).") + t[m2.end():]
    return t
rw("docs/PLAN.md", plan)

# ---------- SHARED.md ----------
def shared(t):
    anchor = "| `bandFromDays` | W04, W17 | two byte-identical pace-band ladders |\n"
    assert t.count(anchor) == 1
    rows = (anchor +
            "| `pkg` | every widget block, W18 | the data package envelope `{state, reason, data}` every widget renders from (added 16 Oct 2026; nothing replaced, this is the API seam) |\n"
            "| `pkgOption` | every widget block, W18 | the review selector's option, \"default\" when the data-states region is absent (`typeof` guard, so the isolated drivers and the release build see Default) |\n"
            "| `pkgGen` | every widget block, W18 | the data-states generators behind the same guard, null when absent |\n"
            "| `pkgStateHTML` | W15 (Bank Balances), the placeholders | the shell's `.state` block: icon, title, sub-line, optional call-to-action button |\n"
            "| `pkgPlaceholderHTML` | W03, W05, W10, W14, W16, W18 and Budget's no-fiscal-year | the owner's \"Not designed yet\" card for a package state Jo Phase 2 has no design for |\n")
    return t.replace(anchor, rows)
rw("docs/SHARED.md", shared)

# ---------- DATA-STATES.md ----------
def ds(t):
    assert "## 10." not in t
    sec = '''
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
'''
    return t.rstrip("\n") + "\n" + sec
rw("docs/DATA-STATES.md", ds)

# ---------- API handover doc, section 5 ----------
def api(t):
    i = t.index("## 5. What this means for the V2 build"); j = t.index("\n", i) + 1
    k = t.find("\n## ", j); k = len(t) if k < 0 else k
    new = '''
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
'''
    return t[:j] + new + t[k:]
rw("docs/handover/Widget data states - API responses and Jo Phase 2 designs (draft).md", api)

# ---------- decision record ----------
dec = '''# Shell: the data package layer

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
'''
p = os.path.join(ROOT, "docs", "decisions", "Shell-data-package.md")
ref = open(os.path.join(ROOT, "docs", "decisions", "Shell-spec-toggle.md"), "rb").read()
nl = "\r\n" if ref.count(b"\r\n") > ref.count(b"\n") // 2 else "\n"
open(p, "wb").write(dec.replace("\n", nl).encode("utf-8")); print("written docs/decisions/Shell-data-package.md")
