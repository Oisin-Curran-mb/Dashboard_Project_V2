# Accounts Payable By Due Date: Jo Phase 2 against V1

Draft, 9 October 2026. Rough working notes for the change document: what Jo's Phase 2 version of
this widget does and looks like compared with V1, written so the next agent can build the V2 widget
to Jo's design (look, feel and actions), not port her code. Three readers: the manager, the UI
developer, the API and backend developer.

Sources, both read directly:
- **V1**: Jo's `main` branch as Value Labs has it (`_ref/v1-main-e0a04c5.html`), 19 August 2026.
- **Jo Phase 2**: her `phase-2` head on 8 October 2026 16:03 (`_ref/jo-phase2-d7f33b0.html`).
- Screenshots of Phase 2 supplied by the owner on 9 October (Glance, Explore, Detail).

Change type: **New Feature or Logic**. The data behind the widget is unchanged; what changed is how
it is filtered, read and acted on.

---

## 1. Manager view

What the user gains:
- The due-date filter becomes four **tappable tiles under the total** (All dates, Overdue, Due this
  week, Due this month), each showing its own amount and invoice count. One tap filters the table;
  the reading "how much is due, and when" is on screen without opening anything. V1 hid the same
  figures inside a dropdown and, at Detail, in a side panel.
- A **search box in the header**, always visible, that finds a vendor, an invoice number or a due
  date typed in plain words ("July", "25 Jul"). V1 showed a search only when the list was long and
  it matched vendor and invoice only.
- At Glance, a second pill: **"$X due this week"** beside the overdue pill, so cash needed in the
  next seven days is visible at the smallest size.
- The invoice pop-up gains two actions: **Open in Accounts Payable** (the full bill) and **Schedule
  payment** through AvidXchange BillPay when the organisation has that integration. V1's pop-up was
  facts only.
- A **vendor pop-up**: tap a vendor in "Top vendors owed" to see everything owed to them, split
  Overdue / Due this week / Due this month, with their invoices earliest first.

What it costs:
- **Backend: small.** No new fields on an invoice. One organisation-level flag (AvidXchange BillPay
  enabled) and two deep links (open the invoice; hand the invoice to BillPay). Aggregations can stay
  client-side.
- **Frontend: medium.** Tile group, header search, status badge, two pop-ups, the Glance pill.
  V2 already carries Jo's late-September version (tiles, search, pill, vendor list), so the real gap
  is the two pop-ups and the BillPay gate.

What is at risk:
- The tiles **overlap**: "Due this month" includes the invoices in "Due this week". The figures are
  correct as windows, but a reader who adds the tiles up will double count. Decide whether that is
  acceptable or whether the month tile should read "Due in 8 to 30 days".
- The **aging basis** (due date versus invoice date) was never confirmed with the product team; it
  moves every tile.
- **Schedule payment** depends on an integration hand-off that does not exist in the dashboard yet.

---

## 2. Functional differences (behaviour, not code)

### Glance
- Phase 2: eyebrow "Total due" over the total; underneath, the overdue pill ("$7,670.50 overdue",
  red, hover: amount across N invoices past due) or "Nothing overdue" (positive) **and** a saffron
  "$3,720.75 due this week" pill when anything falls due within seven days (hover: amount across N
  invoices). Empty state "Nothing outstanding".
  V1 had: a static "Accounts payable" scope chip above the total, then the overdue pill only.

### Explore
- **Header.** Phase 2: one row, total on the left (eyebrow + figure), search field on the right,
  always shown, placeholder "Search vendor, invoice or date"; it matches vendor, invoice number and
  the due date in several spellings (abbreviated and full month, "25 July" and "July 25", "July
  2026"). V1 had: a two-row header with a **due-date filter chip** on the left (opens a list: All due
  dates, the aging bands with counts and subtotals, then every specific due date earliest first,
  searchable when more than eight dates) and the total with the overdue pill beneath.
- **Filter.** Phase 2: a row of four tiles under the header, All dates / Overdue / Due this week /
  Due this month, each with icon, label, amount and count; the selected tile is outlined; tapping a
  tile filters the table and shows a short loading skeleton (filter changes fetch; sorting does not).
  There is no tile for "Due later"; those invoices are only visible under All dates. The specific
  due-date filter and the "Due later" band are gone from the controls.
  V1 had: the chip above, with bands Overdue / Due this week / Due this month / Due later (mutually
  exclusive: 0 to 7 days, 8 to 30, over 30) and any single due date.
- **Table.** Both: Vendor, Invoice, Due date, Status, Amount; every header sorts; default due date
  ascending; a text or date header opens ascending, Amount descending; footer with the selection
  label, count and total ("Due this month (6 invoices)  $16,820.75"); rows open the invoice pop-up.
  Phase 2: one flat sorted list under every filter; the status badge carries the aging. V1 had: under
  All due dates the rows were grouped under **aging band subheaders** (icon, band name, count,
  subtotal; Overdue in red), flat only when a filter was applied; and a search box above the table
  that appeared only when more than six rows were listed.
- **Status badge.** Phase 2: "Overdue 13d" (negative) up to two weeks then "Overdue 2w"; "Due today"
  or "Due in 2d" (attention) within a month, "Due in 3w" between two and eight weeks, "Due in 2mo"
  beyond (neutral). V1 had: "Overdue 13d", "Due today", "Due 2d" in a pill, red only when overdue.
- **Invoice number** is shown with a copy affordance in Phase 2 (tap to copy). V1 showed plain text.

### Detail
- Phase 2: two columns. Left, "Outstanding invoices", the same table. Right, "Top vendors owed": the
  six largest vendors by amount owed, name in red when any of their invoices is overdue, amount, a
  chevron; hover shows "N invoices · $X overdue"; tapping opens the vendor pop-up.
  V1 had: right column "Cash requirements": an intro line ("How much cash is needed, and when. Pick a
  band to filter the invoice list."), an All due dates row and the four band rows as the filter
  selector (synced with the chip), each with a share bar, "N invoices, X% of total" and the amount,
  disabled when empty; then "Top vendors owed", five vendors, static, with a share bar against the
  largest, count and overdue amount in small text.
- The band selector moved from the Detail side panel into the tiles, which exist at Explore as well.

### Pop-ups
- **Invoice** (tap a row). Phase 2: title "Invoice INV-3310", vendor as subtitle; facts Vendor,
  Invoice # (copyable), Due date (long form), Status badge in long form ("Overdue by 13 days", "Due
  in 2 days"), Amount; footer: "Open in Accounts Payable" (secondary, left) and "Schedule payment"
  (primary, right) when AvidXchange BillPay is enabled for the organisation; when it is not, the
  payment button is absent and a note reads "Online bill payment is available with AvidXchange
  BillPay (not enabled for this organization)". In the demo both buttons open an explanatory
  navigation note instead of leaving the page.
  V1 had: a plain facts pop-up (Vendor, Invoice #, Due date, Status as text, Amount), close only.
- **Vendor** (tap a vendor at Detail). Phase 2 only: title is the vendor, subtitle "$X across N
  invoices"; three tiles Overdue / Due this week / Due this month for that vendor; a table Invoice /
  Due / Status / Amount, earliest first; footer "Open in Accounts Payable" and "Done".
- On screens narrower than 900 px the pop-ups fill the screen (shell rule, Phase 2).

### States
- Loading: skeleton rows under the header on a filter change, never on a sort (both versions).
- Empty: "Nothing outstanding. All supplier invoices are paid. Nothing is due right now." (both).
- Error copy exists in both ("Couldn't load payables").
- Today is fixed to 23 July 2026 in both demos; live, "today" decides every tile and badge.

### Figures and rules (same in both unless noted)
- Total due = sum of outstanding amounts of posted, unpaid invoices that have a due date.
- Overdue = due date before today. Due this week = today to today + 7. Due this month = today to
  today + 30 in Phase 2 (so it includes this week); in V1 the month band was 8 to 30 days.
- Top vendors = sum per vendor, largest first; "overdue" per vendor = sum of their overdue invoices.
- Currency is the organisation's; the demo shows dollars. V1's live build had a hard-coded pound
  sign in one place, which Jo fixed.

---

## 3. Visual differences (UI developer view)

### Glance
- Phase 2: eyebrow label (10 px, letter-spaced, subtle) above the total; the pills use the shell's
  single pill geometry (28 px tall, 999 px radius, icon 15 px, 12 px semibold). Overdue pill on the
  negative tint, week pill on saffron 25 / saffron 500, positive pill on the neutral sheet.
  V1: a scope chip ("Accounts payable") above the total, no eyebrow, one pill.

### Explore header
- Phase 2: single row, total left, search right (search field with leading icon, grows to fill,
  right-aligned); no filter chip, no toggle slot. V1: two rows, chip top-left, total and pill below.

### Tiles (Phase 2 only)
- Row of four, equal width, wrap when narrow, 8 px gap, 10 px padding around the row.
- Tile: 12 px radius, half-point container stroke, sheet surface, 9 px by 12 px padding, left
  aligned; icon 16 px + label 12 px semibold (secondary) on one line, amount 18 px bold tabular,
  count 11 px subtle.
- Tones: All dates neutral; Overdue on the negative subtle fill, stroke and foreground; Due this
  week on saffron 25 fill, saffron 200 stroke, saffron 500 text; Due this month on the attention
  subtle fill, stroke and foreground. Hover and selected: brand 100 border with a 2 px brand 10
  ring; the negative, attention and saffron tiles ring in their own tone when selected.

### Table
- Phase 2: sort icons are "unfold more" when inactive, up or down arrows when active; status badge
  24 px tall pill, icon 15 px, semantic tokens (negative, attention, neutral); invoice number in the
  secondary colour with the copy affordance; due date short form "25 Jul" (year added only when not
  this year). No band subheaders, so no grey band rows.
  V1: "swap vert" sort icon when inactive; status in a 12 px pill, red tint only when overdue;
  grouped band subheaders in a grey band with uppercase 11 px label and red overdue variants; the
  conditional search box above the table.

### Detail right column
- Phase 2: a 300 px column, "Top vendors owed" rows: name (red when any overdue) left, amount and a
  chevron right, hover tint, pointer; no bars, no small meta text (that moved to the hover).
  V1: the same column held the cash-requirements rows with 5 px share bars (amethyst 300, overdue
  amethyst 600, empty grey), selected row on the neutral 200 sheet with an inset ring, then a
  separator and the vendor list with bars.

### Pop-ups
- Phase 2 uses the shell's wide pop-up in the loan-detail style: icon + title, subtitle, label and
  value grid, footer with a secondary button left and the primary right; a one-column grid on narrow
  screens; full-screen under 900 px. V1 used the generic facts pop-up (four label and value pairs).

### Copy
- Labels: "Total due", "All dates", "Overdue", "Due this week", "Due this month", "Outstanding
  invoices", "Top vendors owed", "Open in Accounts Payable", "Schedule payment", "Done".
- Status words: "Overdue Nd" / "Overdue Nw"; "Due today"; "Due in Nd" / "Due in Nw" / "Due in Nmo";
  long form in the pop-up: "Overdue by N days", "Due in N days".

---

## 4. API and backend

No new field on an invoice. What the widget needs per invoice is unchanged from V1: vendor name,
invoice number, due date, outstanding amount, restricted to posted, unpaid invoices with a due date.

New or worth deciding:
- **AvidXchange BillPay entitlement**: a per-organisation flag the dashboard can read, to show or
  hide "Schedule payment" and its note.
- **Deep links**: a route that opens one invoice in Accounts Payable, and a hand-off that passes one
  invoice to BillPay to schedule its payment (pay date and funding account are chosen there).
- **Aggregations**: total due, the three windows (overdue, 0 to 7 days, 0 to 30 days) with counts,
  and the per-vendor totals with overdue sums. All can be computed in the browser from the invoice
  list, as the demo does; if the list is large, serve them pre-aggregated.
- **Today**: the tiles and badges depend on the date. Decide whether "today" is the browser's date
  or the server's; the demo fixes it.
- **Aging basis**: confirm due date (not invoice date) is the field the business expects.
- **Window overlap**: confirm the month window includes the week window, or change it to 8 to 30.
- **Search**: client-side over the loaded list; no API change unless the list is paged.
- **Permission**: the widget assumes the user can see Accounts Payable; "Open in Accounts Payable"
  should respect the same access.

---

## 5. Frontend

Components, in the order a build would take them:
1. Glance: eyebrow + total; pill set (overdue or nothing-overdue, plus week pill when non-zero).
2. Explore header: total left, search right; search filters the table as you type over vendor,
   invoice and date spellings.
3. Tile group (a group of four buttons with pressed state), amounts and counts recomputed from the
   data; selected tile drives the table and shows the skeleton on change.
4. Table: five sortable columns, flat list, status badge with the three tones, copyable invoice
   number, footer with selection label, count and total, rows focusable and opening the pop-up.
5. Detail: two columns; "Top vendors owed" list with hover detail and click to the vendor pop-up.
6. Invoice pop-up with the two actions and the BillPay note; vendor pop-up with three tiles and the
   invoice table; both full-screen under 900 px.
7. States: loading skeleton, empty, error.

Accessibility carried in Jo's version: tiles are buttons with a pressed state and a group label; rows
are focusable with a spoken label (vendor, due date, status, amount, "Open invoice"); pill hovers
are also readable as tooltips; icons never carry meaning alone (sign and label always present).

**Starting point in the V2 build.** V2 already contains Jo's version from 27 September (owner ruling:
"take Jo's version"): the tiles, the header search, the week pill, the flat table with badges and
the "Top vendors owed" list. It does not yet have her October additions: the invoice pop-up with
"Open in Accounts Payable" and "Schedule payment" (and the BillPay flag), and the vendor pop-up; the
vendor rows are marked clickable but open nothing. Those two pop-ups and the flag are the build gap.

---

## 6. Open questions

1. Month tile includes the week tile: keep as windows, or make the month tile 8 to 30 days?
2. "Due later" has no tile; is All dates enough, or should a fifth tile return?
3. Aging basis: due date confirmed?
4. "Today": browser or server?
5. BillPay: which organisations have it, and what does the hand-off take (invoice id, amount)?
6. Should the specific-due-date filter V1 offered come back anywhere (for example in the search)?
