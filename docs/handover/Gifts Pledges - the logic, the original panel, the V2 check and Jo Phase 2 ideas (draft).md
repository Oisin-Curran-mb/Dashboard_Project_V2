# Gifts Pledges: the logic, the original panel, where V2 stands, and what Jo's design offers

Draft, 9 October 2026. Working notes for the change document and for the next agent. Written from
the legacy code (`MBAccounting`, read-only), the V2 build (`index.html`, kind `gifts`), V1
(`_ref/v1-main-e0a04c5.html`) and Jo's Phase 2 head of 8 October (`_ref/jo-phase2-d7f33b0.html`),
plus the owner's rulings in `docs/decisions/W17.md` and the 28 September concept review.

Five parts:
1. How the original dashboard panel works.
2. What V2 is meant to be: the original, plus gifts that belong to no pledge.
3. The clean logic, question by question.
4. Does the V2 widget live up to it today? A check, with defects found.
5. What V1 and Jo Phase 2 do, and which of their ideas would make ours better.

---

## 1. How the original panel works

The Financials dashboard has a "Gifts Pledges" data panel. It calls one repository method,
`GFPledgeRepository.GetWidgetData(dateGiftsThru)`, with one input: the **Date Gifts Thru** (empty means
today). The computed result, date included, is cached per user and reused for one hour; a date change
or Refresh recomputes it. There is no purpose or campaign selector, no chart, no sorting, no paging.

**What it walks.** Pledges flagged **Active** (a manual checkbox on the pledge; nothing clears it when
the end date passes), grouped by the **pledge's purpose** ("CODE Name"). A purpose with no active
pledge never appears. Rows are ordered by the purpose's sequence then code, and the list by Pledge
Total, largest first.

**The columns, and how each is computed.**

| Column | Rule |
|---|---|
| Pledge Total | sum of the pledge amount of every active pledge on the purpose |
| Received | sum of the gift lines **attached to those pledges** (gift line carries the pledge id), counting only lines whose batch is **posted**, whose gift is **not undone** (no undo journal), and whose gift date is **on or before** the thru date. No lower date bound. Grouped by the pledge's purpose, not the line's own purpose |
| Pledge Due | sum, over the purpose's pledges, of what each pledge should have brought in by the thru date (the proration below) |
| Due Remaining | Pledge Due minus Received (negative when ahead) |
| Percent Due | Due Remaining divided by Pledge Due (divisor 1 when Pledge Due is zero, a defect) |

The grid sums the four money columns in its footer; Percent Due is not summed. Currency uses the
culture format, so the pound sign seen on one environment is a culture setting, not code.

**The proration ("Pledge Due").** A pledge has Begin date, End date, Frequency (1, 2, 4, 6, 12, 24,
26 or 52 per year), Periodic amount and Pledge total. Pledge Due counts the cycles elapsed since the
begin date, adds one because the panel measures from the beginning of a cycle, caps at the number
of cycles in the pledge, and multiplies by the periodic amount; once the thru date is on or after
the end date the full pledge is due; a pledge that has not started yet contributes nothing. One known
defect: the cycle count uses **today**, not the chosen thru date, so moving the date back changes
Received but not Pledge Due. Only the end-date test uses the chosen date.

**What the panel never shows.**
- A gift to the purpose that is **not attached to a pledge** (gift line with no pledge id). It is
  real money for the purpose, posted and receipted, and the panel is blind to it.
- A gift attached to an **inactive** pledge.
- A purpose that has gifts but **no active pledge** (confirmed on the owner's dev database, 28 Sep:
  a purpose with $200 of gifts over two lines, pledging allowed, no pledge). The purpose's own
  "allow pledges" flag only filters pickers; the panel ignores it.
- Any gift in an **unposted batch** or **undone** by a journal (on that database $30,192 over five
  lines, correctly excluded).

**How a gift gets attached to a pledge.** Gift entry pre-fills one line for each of the donor's
active pledges, so a gift from a pledging donor is attached unless the clerk changes the line. A gift
with no pledge id is therefore a donor without an active pledge on that purpose, or a line the clerk
deliberately left unattached: the one-off gift this document is about.

**Where the legacy does count purpose-wide giving.** The Purpose List report sums every posted,
not-undone gift line on the purpose over week, month, quarter and year windows; View Posted Gifts can
filter to lines "not associated with a pledge"; the Pledge List report offers "only those behind on
pledge" (Pledge Due minus contributed above zero) and a percentage against either the total pledge or
the pledge due. The widget's model in section 3 uses exactly these existing notions.

**Not the panel, but real.** A **Goal** exists on **campaigns** (per dated campaign period), and the
Campaign screen measures it against every gift line tagged with that campaign, pledged or not. A
campaign belongs to one purpose; a purpose can have many campaigns. The dashboard panel reads none
of this. There is no goal on a purpose.

---

## 2. What V2 is meant to be

The original panel's pledge position, **plus the gifts to the purpose that belong to no pledge**:
the one-off gift, the memorial, the appeal response from someone who never pledged. The owner's
28 September ruling: both count, and they count **separately**. Nothing blends them into one figure
a reader cannot trace back to a purpose-keyed query.

Two queries, keyed on the purpose, are the whole basis:

- **Q1, the purpose's gift lines**: every gift line for the purpose that is posted, not undone and
  inside the chosen dates. Split once on the pledge id: attached to a pledge = **pledge payment**;
  not attached = **gift**.
- **Q2, the purpose's pledges**: every active pledge on the purpose, with its pledge total and its
  Pledge Due to the thru date.

No campaign, no goal, no invented target. The legacy formulas for Pledge Total, Pledge Due, Due
Remaining and Percent Due are kept exactly, so the Pledges reading reconciles with the shipped panel.

---

## 3. The clean logic, question by question

For one purpose, with a chosen date window (a thru date, and optionally a start date):

### 3.1 What has come in from pledges
**Pledge payments** = Q1 lines attached to a pledge, inside the window.
Read two ways: **to the thru date only** (the panel's Received, used for the pledge position), and
**inside the window** (what the Giving view shows when a start date is set). A pledge is a
cumulative promise, so its position is always measured from inception; only the transactions obey
a start date.

### 3.2 What has come in as gifts outside any pledge
**Gifts** = Q1 lines with no pledge, inside the window. Count of gifts and count of distinct donors
come with it. These never move a pledge's status: a gift cannot make a pledge funded.

### 3.3 What I have for the purpose
**Total given** = pledge payments (in the window) + gifts (in the window). Named as a total, never
as "Received" on its own, because Received already means pledge payments in the panel.

### 3.4 What I expect to get for the purpose
From Q2:
- **Pledge Total**: the full promise, never re-scoped by a start date.
- **Still expected**: Pledge Total minus pledge payments to date (zero when over-paid). This is the
  forward-looking figure: money promised and not yet in.
- **Pledge Due**: what should have arrived by the thru date (the proration, computed on the chosen
  date, not today).
- **Due Remaining** = Pledge Due minus pledge payments to the thru date. Positive = behind,
  negative = ahead. **Percent Due** = Due Remaining over Pledge Due.
- Status, derived, not stored: Funded (payments at or over the total), On track (payments at or
  over Pledge Due), Behind (payments under Pledge Due), Gifts only (no pledge, some gifts), Nothing.

No expectation exists for gifts: nobody promised them.

### 3.5 The breakdown
- **Pledges**: one row per active pledge (donor): pledged, paid to date, due by the date, due
  remaining, status; opening a pledge shows its schedule and the gifts applied to it.
- **Gifts**: one row per gift with no pledge: date, donor, amount, how it arrived (medium),
  reference (check or receipt number, from the gift header). A gift's "motivation" lives on the
  header, not the line, so a gift split across purposes carries one motivation for all its lines;
  it is not shown per purpose for that reason.

### 3.6 Counting rules that apply everywhere
- Posted batch, not undone, gift date on or before the thru date; start date applies to
  transactions only.
- Closed purposes stay in the list with a Closed mark; their figures are what they are.
- A purpose with gifts and no pledge shows in Giving and in the Gifts breakdown, never in the
  Pledges table (the panel cannot show it at all).
- Over-paid pledges: payments above the pledge total are still payments; Still expected is zero,
  Due Remaining is negative, status Funded.

### 3.7 The words
Purpose; Pledge Total; Pledge Due; Received (pledge payments, panel sense); Due Remaining; Percent
Due; Gifts; Total given; Still expected; Funded, On track, Behind, Up to date. "Behind" has a legacy
basis: the Pledge List report's "behind on pledge" is Pledge Due minus contributed above zero, the
same test as Due Remaining above zero. Avoid: Goal, Campaign (as a synonym for purpose),
% Fulfilled (Remittance's measure), Fiscal.

---

## 4. Does the V2 widget live up to it today?

Checked on 9 October against the build (Glance, Explore, Detail, the Giving ledger pop-up).

| Question | In V2 | Verdict |
|---|---|---|
| 3.1 Pledge payments | Giving bar's dark segment and "$X from pledges"; Pledges table "Received" to the thru date; ledger "Pledge payments" | Yes |
| 3.2 Gifts outside a pledge | Giving bar's light segment and "$X from gifts"; Gifts table (gifts, donors, total); ledger "Gifts" and gift rows | Yes |
| 3.3 Total given | Header figure and "$X given" under each bar; ledger "Received" | Yes, but the ledger calls the total "Received" while the Pledges table calls pledge payments "Received": one word, two meanings |
| 3.4 Expected | Pledge Total, Pledge Due, Due Remaining, Percent Due in the Pledges table; grey "still expected" segment in the bar; header pill "81.45% of $400,200 pledged" | Yes, with two wording defects (below) |
| 3.5 Breakdown | Ledger pop-up: All / Pledges / Gifts filter, search, pledge rows expand to schedule and applied gifts, gift rows show medium and reference | Yes |
| 3.6 Counting | posted / undone / window applied in one place; fixture proves exclusions | Yes |
| Panel reconciliation | Default preset has no start date; Pledges table matches the panel's formulas | Yes |

### Defects and weak spots found

1. **Glance caption reads "$325,951 pledged, $56,940 gifts".** $325,951 is the pledge **payments**;
   pledged is $400,200. The word is wrong on the smallest size, where it is the only explanation.
2. **"Received" means two things.** Pledges table: pledge payments to date (the panel's sense).
   Ledger summary strip: pledge payments plus gifts. Pick one: keep Received for the panel figure,
   call the sum "Total given" everywhere else (the bar line already does).
3. **The header pill sits beside a figure it does not describe.** "$382,891" is total given;
   "81.45% of $400,200 pledged" is pledge payments over pledged. Correct, but a reader will read the
   percentage as the big number's share of the pledge. Either show the percentage beside the pledge
   payments figure or state it as "pledge payments 81% of $400,200 pledged".
4. **The fixture over-pays almost every pledge.** In the Building Fund ledger, pledge after pledge
   shows Received above Pledged (for example $5,547 pledged, $7,737 received, "Fully paid") while the
   purpose total reads $205,000 of $250,000. The per-pledge gifts are generated and do not sum to the
   purpose figure. It makes the ledger impossible to sanity-check and will be read as a bug by Value
   Labs; the sample pledges should sum to the purpose figures.
5. **"Behind" badge on a purpose whose ledger shows every pledge fully paid** follows from 4.
6. **The bar's grey segment is unlabeled on the bar itself** and reads as empty track; the legend
   says "Still expected" only at the bottom. Jo's hatched gap (section 5) is the clearer treatment.
7. **A start date has no visible effect on the Pledges table** (by design, see 3.1), but nothing on
   screen says so; a user who picks "Year to date" and sees the same Pledge Due will think the
   filter is broken. One line under the table, or a note on the chip, is needed.
8. **The Giving row shows no status.** The table and the ledger carry Funded / On track / Behind;
   the bars, the view a user lands on, do not.
9. **Percent Due is a Detail-only column.** Known and ruled; the Explore table has no pacing
   percentage at all, so a reader cannot tell behind from ahead without reading signs.

---

## 5. V1 and Jo Phase 2, and what to take from them

### 5.1 What they are
V1 and Jo's Phase 2 are the same widget with three small changes (ahead shown as "$655 ahead"
rather than a minus sign; a "Behind schedule" follow-up column added at Detail; a "Record a
follow-up" button removed). Both are **pledge-only** pacing on the panel's model, with two
figures that do not match the panel: their Pledge Due is a sum of scheduled instalments the data
does not hold, and their percentage is "% Fulfilled" (received over pledged), the Remittance
measure, not the panel's Percent Due. Neither shows gifts outside a pledge. So they cannot be the
build; but their presentation is good and several pieces fit our model.

### 5.2 How Jo's looks (Phase 2, 8 Oct)
- **Header**: date chip ("Today, 07/24/26") and purpose chip left; Progress / Table toggle right;
  eyebrow "Received" over the total; a small badge "3 behind" (or "All on track"). With one purpose
  chosen the badge becomes that purpose's status.
- **Progress rows**: purpose name left; status badge (Behind, amber; Funded, green; Ahead; On
  track) and "PLEDGED $45,000" at the right end; a thin bar whose fill is the received share, a
  **hatched gap** from received to "due by now", and a **tick mark** at the due-by-now point; green
  fill when funded. Hovering shows a card with pledged, expected by the date, paid, percent, owed.
  Clicking opens the donors.
- **Table**: Purpose, Pledged, Due by date, Received, Remaining ("$655 ahead" or "$4,000" behind),
  % Fulfilled; sortable; row opens the donors.
- **Detail**: two columns, "Progress toward goal" bars and a **"Behind schedule"** list (purpose,
  "60% fulfilled, 4 donors", "$4,000 behind", chevron) whose rows open the pop-up filtered to behind.
- **Pop-up "Gift pledges"**: purpose chip in the title, "as of 07/24/26 · 4 donors"; **All donors /
  Behind only (1)** toggle; Export; columns Donor, Pledged, Received, Due by date, Remaining, Last
  gift, Status (Behind amethyst, On track green, Fully paid green); a donor row expands to a drawer:
  Pledged / Received / Still to give, gift history, "Open donor record". Footer "4 donors", "$27,000
  received, $4,000 behind", Done.
- Tones: amber for behind, green for funded or on track, no red; the fill is the only coloured
  element in a row.

### 5.3 What would make ours better, taken from Jo's presentation
1. **A status badge on every Giving row** (Behind / On track / Funded / Gifts only), the same
   words the table and ledger already use; today the bars have none.
2. **The due-by-now mark and a hatched "still expected" gap** instead of the flat grey segment, so
   "what was due by the date" and "what is still to come" are both readable on the bar. Our bar has
   three parts (payments, still expected, gifts); keep the gifts segment, but draw the gap hatched.
3. **A header badge with the count**: "3 behind" beside the total, like hers; cheaper to read than
   the long sentence pill.
4. **A Behind list at Detail** beside the bars, opening the ledger filtered to pledges behind.
   Ours has the space (the Detail view is the Explore view stretched).
5. **"Behind only" in the ledger** as a fourth filter next to All / Pledges / Gifts, and a donor
   status chip that reads at a glance (hers: Behind, On track, Fully paid; ours exists but is small).
6. **Eyebrow over the headline** ("Total given") in place of the bare number, matching the Pathway
   pattern every other widget now uses.
7. **"Pledged $X" at the row end** rather than only the total in green; the total given is already in
   the sentence beneath.

### 5.4 What not to take
- Her Pledge Due basis (scheduled instalments) and her "% Fulfilled": not the panel's figures.
- "Progress toward goal": there is no goal; the heading would be "Pledges" or "Giving".
- Export buttons: removed from ours by ruling.
- Her donor drawer's "Record a follow-up": no data model behind it.

---

## 6. A proposed cleaner shape (for the owner to rule on)

**Header**: date chip, purpose chip; eyebrow "Total given" + figure; badge "N behind" (or "All on
track"); a short line "$X from pledges · $Y from gifts · $Z still expected".

**Giving view** (default): one row per purpose: name and Closed mark; right end: status badge and
"Pledged $X"; bar: dark pledge payments, hatched still-expected gap with the due-by-now tick, light
gifts beyond; one line beneath: "$given given · $from pledges · $from gifts · $still expected".

**Pledges table**: Purpose, Pledge Total, Pledge Due, Received, Due Remaining, Percent Due (the
panel's five, Percent Due at Detail), footer totals; a note under the table: "Pledge figures are
read to the thru date; a start date applies to gifts only."

**Gifts table**: Purpose, Gifts, Donors, Total (gifts outside any pledge), footer totals.

**Detail**: Giving bars left, "Behind" list right (purpose, due remaining, donors, opens the ledger
filtered to behind).

**Ledger pop-up**: title "CODE: Name", subtitle the date phrase; summary strip Pledge Total, Pledge
Due, Pledge payments, Gifts, Total given, status badge; filters All / Pledges / Gifts / Behind;
search; rows as today (pledge rows expand to schedule and applied gifts; gift rows show date,
medium, reference); footer counts and "Open in Gifts and Pledges".

**Glance**: eyebrow "Total given", figure, badge "N behind", caption "$X from pledges, $Y from
gifts" (fixing defect 1).

---

## 7. Backend, API and frontend notes

- **Data per purpose**: code, name, allow pledges, closed. **Per pledge**: donor, begin, end,
  frequency, periodic amount, pledge total, active. **Per gift line**: purpose, pledge id (nullable),
  amount, gift date, posted flag of its batch, undo journal (nullable); from the header: medium,
  check or receipt number. All exist today; none is new.
- **Aggregations** (Q1 and Q2) can be served per purpose for a thru date and an optional start
  date; Pledge Due must be computed on the chosen date, not today (fixes the legacy defect).
- **Deep link**: open the purpose (or a pledge) in Gifts and Pledges.
- **Frontend**: the model already exists in V2; the work in section 5.3 is presentation (badges,
  hatched gap and tick, header badge, Behind list, ledger filter, eyebrow) plus the wording fixes
  in section 4 and a fixture whose pledges sum to the purpose figures.

---

## 8. Open questions

1. Keep "Received" for pledge payments only, and "Total given" for the sum, everywhere?
2. Do you want the hatched gap and due-by-now tick on the Giving bar, or keep the flat grey segment?
3. A Behind list at Detail: yes or no?
4. Should the Gifts table carry a "Last gift" date again (removed earlier by ruling)?
5. The fixture: regenerate so every pledge's payments are at or under its pledge unless the status
   says Funded, and so the per-pledge rows sum to the purpose figures?
