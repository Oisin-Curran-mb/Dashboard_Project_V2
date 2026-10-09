# Session handover: editing V2, shooting the handover, writing it up

Written 9 October 2026 for the next Claude session. Read this first, then say which widget
is in hand. Everything below is how the work has actually been done in this repo; where a
rule came from the owner (Oisin Curran) it is marked **(owner)**.

Repo: `C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2`
(the working repo, GitHub `Dashboard_Project_V2`). Nothing is committed or pushed without the
owner saying so; the whole of 8 and 9 October is still uncommitted local work.

---

## 0. Ground rules that bind every session

| Rule | Detail |
|---|---|
| Plan before implementing **(owner)** | New scope gets a short reviewable plan (files touched, what changes, open questions) and waits for "go". A conversational description of work is a request for a plan, not a green light. Small follow-ups to work already agreed ("fix the overlap", "make it bold") are done directly. |
| Explain before prompting **(owner)** | Before any command that will raise a permission prompt, say in one line what it does and why. |
| The owner rules on design | No defaults that override him. Defects (lint findings, overlaps, missing CSS) are fixed without asking and logged in the widget's decision record. |
| Widget names, never W-numbers **(owner)** | Anything a reader sees (handover prose, captions, comments the reader may hit) names widgets by their defined names. The `W13` badge and `id="w13"` in `handover.html` stay as they are. |
| Tokens only **(owner)** | Every style value comes from Pathway tokens (`--type-size-*`, `--padding-*`, `--gap-*`, `--cornerradius-*`, `--wn-*`, `--semantic-color-*`). Padding especially. Column widths in px are the one accepted exception. `node _tools/lint.js` reports undeclared tokens. |
| Jo Phase 2 is the styling authority | When the owner says "like Jo's" the source is `_ref/jo-phase2-e77c188.html` (her latest, untracked copy). Copy her markup and CSS, then swap her raw values for tokens. |
| No handover work unless asked | On 9 Oct the owner said "dont worry about the handover document" for the Purchasing pop-up. Ask before spending time there. |
| Memory | Append a dated line to `~/.claude/projects/C--Users-ocurran/memory/project-v2-final-complete-version-2.md` when a widget's state changes. |

---

## 1. Where things are

| What | Path |
|---|---|
| The build (demo and V2 in one file) | `index.html` (CRLF, ~13,000 lines, one `<style>` and one `<script>` region per widget) |
| Handover document | `handover.html` (one `<section id="wNN">` per widget, screenshots then prose) |
| Screenshots | `docs/Pics/Version 1/Wnn - Name/`, `docs/Pics/Version 2/Wnn - Name/`; retired shots in `_superseded/<date>/` under each folder |
| Decision records (one per widget) | `docs/decisions/Wnn.md`: every owner ruling, dated, with what was built |
| Plan and standing decisions D1-D13 | `docs/PLAN.md` |
| Shared helpers and conventions | `docs/SHARED.md` |
| Per-widget drivers (the executable spec) | `_tools/wNN-name.driver.js`, run by `_tools/verify.js` |
| Capture script | `_tools/one-off/shoot-handover-2026-10-07.js` |
| V1 (what Value Labs has today) | `_ref/v1-main-e0a04c5.html`, identical to Jo's live main |
| Jo Phase 2 (latest) | `_ref/jo-phase2-e77c188.html` |
| Legacy product code (read-only) | `C:\Users\ocurran\source\repos\MBAccounting` (e.g. `Shelby.Web.Financials\PurchasingManagement\Requests\Update.aspx`, `Content\scripts\Controls\POApprovalsGrid.js`) |
| Public handover repo | `..\Dashboard_V2_Handover` (published copy; publish = copy `index.html`, `handover.html`, `docs/Pics` unchanged, only when the owner says) |
| Live links | V1 `https://helloimjolopez-collab.github.io/design-sandbox/Widget%20Container%20Demo/`, Jo Phase 2 `.../design-sandbox/phase-2/Widget%20Container%20Demo/`, V2 `https://oisin-curran-mb.github.io/Dashboard_Project_V2/` |
| Local demo | `node _tools/serve.js` then `http://localhost:8765/index.html#k=<kind>` (one widget, three sizes side by side) and `http://localhost:8765/handover.html#wNN` |

Kinds: `budget pension payroll remittance receivables insurance deposits mystatus pto loans fixedassets purchasing tasks bank payables gifts`. Card ids are `<prefix>`, `<prefix>_k`, `<prefix>_x` for Explore, Glance, Detail (e.g. `purF`, `purF_k`, `purF_x`).

---

## 1a. The repositories, what each is for, and what gets pushed where

All local clones sit under `C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\`.

| Repo (remote) | Local folder | Branch | Purpose | What is pushed, and when |
|---|---|---|---|---|
| `Oisin-Curran-mb/Dashboard_Project_V2` | `Complete Version 2` | `main` | **The working repo.** The build (`index.html`), the handover source (`handover.html`), screenshots, decision records, drivers, tools, this document. Everything is edited here and only here. GitHub Pages serves it at `https://oisin-curran-mb.github.io/Dashboard_Project_V2/` (all widgets on; this is the owner's own demo link, not the Value Labs one). | Commits on the owner's say-so, one per finished widget ("Purchasing Management: ..."). Push only when he says push. **As of 9 Oct evening nothing since commit `6f897d3` (7 Oct) is committed: 47 changed or new paths, see `git status`.** The untracked `_ref/jo-phase2-e77c188.html` is a reference copy; ask before committing it. |
| `Oisin-Curran-mb/Dashboard_V2_Handover` | `Handover W01-W04 (public repo)` (folder name is historical) | `main` | **The public handover home** given to Value Labs, Confluence and SharePoint: `https://oisin-curran-mb.github.io/Dashboard_V2_Handover/` and `/handover.html`. Holds only `index.html`, `handover.html`, `README.md`, `docs/Pics` and the Financial KPI spec page (`.gitignore` keeps everything else out). Never edited directly. | A **release**: built from the working repo at publish time, never committed back to it. (1) copy `index.html` and flip the `WIDGET_SWITCH` entries (shell section "widget switchboard", `WIDGET_SWITCH={W01:true,...}`) to `false` for every widget not yet released; (2) filter `handover.html` to the released sections with a release intro and legend; (3) copy only the referenced `docs/Pics/Version 1|2/<widget>` folders, skipping `_superseded`; (4) commit "Handover: ...", push. Current public set (commit `f36b180`, 7 Oct): Budget Compared to Actual through My Status plus Financial KPI; Alerts & Actions withdrawn. The release transform lived in a session scratchpad (`build_release.py`); it is not in the repo, so rebuild it from this description or ask the owner for the copy. |
| `Oisin-Curran-mb/Dashboard_Project` | `Aditya KPI branch\Dashboard_Project` | `main` | Aditya's fork of the shell: `Aditya_Widget_Design\Demo V2.html` with the Financial KPI variants and Alerts & Actions. **Read-only source** for Financial KPI and Alerts & Actions. | Nothing. We never push here. |
| `helloimjolopez-collab/design-sandbox` @ `main` | `Phase 1 branch\design-sandbox` | `main` | **V1**: Jo's `Widget Container Demo/index.html` as Value Labs has it (identical to `_ref/v1-main-e0a04c5.html`, which is what the capture script shoots). Live: `https://helloimjolopez-collab.github.io/design-sandbox/Widget%20Container%20Demo/`. | Nothing. Pull only, and only to confirm V1 has not moved. |
| `helloimjolopez-collab/design-sandbox` @ `phase-2` | `Jo Phase 2 branch\design-sandbox` | `phase-2` | **Jo Phase 2**, the styling authority. Pull when the owner says "update the version I have locally", then copy `Widget Container Demo/index.html` to `_ref/jo-phase2-<short sha>.html` and point the session at the new file. Live: `.../design-sandbox/phase-2/Widget%20Container%20Demo/`. | Nothing. Jo's repo; we never push or branch there. |
| `MBAccounting` (Azure DevOps, not GitHub) | `C:\Users\ocurran\source\repos\MBAccounting` | as checked out | The legacy product: the screens, grids and repository rules each widget mirrors (`Shelby.Web.Financials\...`, `Shelby.Repository\...`). **Read-only** for this work. | Nothing. |

Outside git but kept in step with the handover repo: the Confluence knowledgebase page
(Modernised Dashboards (VL) Initiative, section "Version 2 handover (Value Labs)", pasted by the
owner from `..\Confluence - Version 2 handover section (paste into Knowledgebase page).html`) and
the SharePoint shortcuts "Dashboard V2 - Live demo.url" and "Dashboard V2 - Handover doc (V1 to
V2).url" under `productteam / Shared Documents / Accounting - Modernized Dashboards project`. If a
URL changes, both need the owner's hand.

**The one-line version:** edit in `Complete Version 2`; commit there when told; release by
copying a switched-down build and a filtered handover into `Dashboard_V2_Handover` when told;
never touch Jo's, Aditya's or the legacy repo.

---

## 2. Editing V2 and the demo

The demo and V2 are the same file: `index.html`. Load the local `v2-port` skill at the start of
a session for the block layout, the registry and the sources table; this section is the
day-to-day procedure on top of it.

### 2.1 Orientation (two minutes)

```bash
cd "C:/Users/ocurran/Desktop/For Dashboard/Step 7 - Version 2/Complete Version 2"
git status --short | head
node _tools/verify.js 2>&1 | tail -3        # must say ALL DRIVERS GREEN before you touch anything
```

Then read `docs/decisions/Wnn.md` for the widget in hand and, if the ask touches the legacy
screen, look at the real code in `MBAccounting` (an Explore subagent with the exact file list is
the cheap way; it returned a 900-word factual report for the Purchasing screen in two minutes).

### 2.2 How an edit is made

`index.html` is CRLF and 13,000 lines. The pattern that has not failed:

1. Find the region: `grep -n "^function purF[A-Za-z]*(" index.html` lists a widget's functions
   with line numbers; `sed -n 'A,Bp' index.html | cut -c1-400` reads them. CSS lives between
   `/* ===== Wnn <Name> V2 CSS ===== */` and `/* ===== end Wnn <Name> V2 CSS ===== */`; JS between
   the same banners without `CSS`. `node _tools/extract.js W13` writes one widget's regions to
   `_tools/.tmp/`.
2. Write a Python script in the scratchpad (never a long heredoc; the shell truncates them) that
   reads the file as bytes, decodes UTF-8, and replaces exact strings with an assertion that each
   old string occurs once:

   ```python
   P="index.html"; s=open(P,"rb").read().decode("utf-8")
   def sub1(o,n):
       global s; o=o.replace("\n","\r\n"); n=n.replace("\n","\r\n")
       assert s.count(o)==1,(s.count(o),o[:80]); s=s.replace(o,n)
   sub1("old text", "new text")
   open(P,"wb").write(s.encode("utf-8"))
   ```

   Never `sed -i` the file. Never `.replace("\n","\r\n")` on text that already has CRLF (that
   produced `\r\r\n`; if it happens, normalise with `s.replace("\r\r\n","\r\n")`). When cutting a
   whole function, cut from its first line to the first line of the next function, not to a
   string inside it (a stray `}` broke the syntax gate on 9 Oct).
3. Back up first when the change is large: `cp index.html <scratchpad>/index.before-<task>.html`.
4. Gate, every time, in this order:

   ```bash
   node _tools/syntax-check.js          # SYNTAX OK, else node --check on the extracted script shows the line
   node _tools/verify.js w13            # the widget's driver
   node _tools/verify.js                # all 19 drivers (about 90 s)
   node _tools/lint.js                  # compare the finding counts with a run on the backup; only new findings matter
   ```

5. Look at it in Chrome. Headless Chrome over the DevTools protocol is the proven way (no
   packages): start `_tools/serve.js` on a fresh port, open `index.html?s=<timestamp>#k=<kind>`,
   wait for `document.fonts.ready`, drive clicks with `document.querySelector(...).click()`,
   measure with `getBoundingClientRect`, and `Page.captureScreenshot` with a `clip` in page
   coordinates (`left + scrollX`, `top + scrollY`). Reusable heads are in the scratchpad
   (`hover_look.js` lines 1-20, `new_po_look.js`, `enc_look.js`, `w13_overlap3.js`). Emulate the
   owner's zoom by setting the viewport width to `1920 / zoom` (1536 = 125%, 1280 = 150%). Use a
   new port and debugging port for every run; "chrome did not start" means the previous one is
   still closing, so sleep a few seconds and retry.
6. Update the driver. The driver is the widget's spec: when behaviour changes on purpose, the
   stale assertions are rewritten with an "(owner, <date>)" note, never deleted wholesale. New
   behaviour gets new assertions. Harness rules the drivers enforce: a header cell carries exactly
   the classes of its body cells (D12); Jo's class prefixes (`.pto-`, `.fa-`, `.pur-`) never appear
   in our block, not even in comments; no em dashes in markup or string literals.
7. Record it: a dated entry in `docs/decisions/Wnn.md` quoting the owner's words, what was built,
   what was removed; then the memory line.

### 2.3 Conventions inside a widget block

- Everything is `data-<prefix>="action"` on the element and one `<prefix>HandleClick` that
  switches on it; `render()` redraws the widget, `<prefix>RenderModal()` redraws its pop-up root.
- Pop-ups use the shell's `.modal-backdrop / .modal / .modal-h / .modal-b / .modal-f`, with a
  widget class (`.purf-modal .purf-record`) for anything specific.
- Chips are the shell's `.filter-chip` with `.pop / .cap / .mi` menus. The caret needs
  `data-dir` and `--caret-x` or it renders as a diamond.
- Tables are `.wt-row / .wt-head`, sort headers `.wt-sort` as Budget Compared to Actual has them.
  Columns that must never overflow use `flex:0 1 <basis>; min-width:<floor>; overflow:hidden;
  text-overflow:ellipsis` and the table has no width floor (`min-width:0`), so the card never
  scrolls sideways.
- Status chips: `.purf-stchip-<kind>` on the semantic status tokens (attention, brand, neutral,
  positive, negative, severe), label in its own span so it can ellipsize.
- Mock data changes move figures everywhere (headline counts, totals, "N requests in view");
  expect driver expectations to shift and re-check the handover text if it quotes a figure.

---

## 3. Screenshots for the handover

Script: `_tools/one-off/shoot-handover-2026-10-07.js`. Headless Chrome, 1920x1080 at device scale
1, element-clipped PNGs. V1 is shot from `_ref/v1-main-e0a04c5.html`, V2 from `index.html#k=<kind>`.

```bash
node _tools/one-off/shoot-handover-2026-10-07.js W13 v1           # every V1 shot in the list
node _tools/one-off/shoot-handover-2026-10-07.js W13 v2           # every V2 shot
SUPERSEDED=_superseded/2026-10-09 node _tools/one-off/shoot-handover-2026-10-07.js W13 v2 02   # one shot
```

What to know:

- The shot list per widget and version is the `W` table at the top of the script: `num`, `label`,
  `size` (`kpi | wide | xwide`), optional `steps` and `target`. Edit the list to add a view.
- A full run moves the existing files of that widget and version to `_superseded/<date>/` first
  (set `SUPERSEDED` to today's date). A single-shot run overwrites in place; copy the old file
  aside yourself if it matters.
- Output path and name are fixed: `docs/Pics/Version 2/W13 - Purchasing Management/W13-V2-02
  Explore - Table.png`. The same number is the same view in V1 and V2; V2's numbering is the
  master. Order: Glance, Explore views, Detail views, then pop-ups.
- Step selectors not starting with `#` are scoped to the widget card. A pop-up is clipped with
  `target: ["#purfModalRoot .modal", "#purfModalRoot [role=dialog]"]` (shell pop-ups:
  `SHELL_MODAL`). Clicks inside an open pop-up cannot be expressed as card-scoped steps, which is
  why the Purchasing pop-up has one shot (as opened) and not one per tab; a tab shot needs a
  `#`-prefixed selector or a scratchpad capture.
- Run shots one at a time with a short sleep between runs if Chrome refuses to start.
- Open every new PNG (Read the file) before you call it done: a wrong clip, an unfinished
  skeleton after a filter click, or a stale state are only visible by looking. After a filter
  click wait at least 1.2 s; the widget shows a loading skeleton for about 800 ms.
- The owner's own screenshots arrive at his zoom (about 125%); the script shoots at 100%. A
  layout that only breaks at his zoom is checked with the viewport-width trick in 2.2 step 5.
- Hand-taken V2 shots are not mixed into the set; the whole document is one size by script.

---

## 4. Writing the handover text

`handover.html` is for Value Labs: what changed from V1 to V2 and what a developer needs to build
it. It is not a design history, not a record of Jo-versus-us, and not a description of the demo's
tooling.

### 4.1 Section shape (template: `id="w07"`, Deposits on Hand)

```
<section id="w13" class="widget">
  <header class="wh"> W-number badge, <h2>defined name</h2>, change-type badge, review badge </header>
  <details class="shots" open><summary>Screenshots <span class="count">14 of 14 saved</span></summary>
    <div class="pair"> <h4><span class="num">01</span>Glance</h4> V1 figure | V2 figure </div> ...
  </details>
  <div class="prose">
    <h3>Overview</h3>
    <h3>What's Different</h3>  <h4>per area</h4> <ul><li><strong>View name:</strong> ...</li></ul>
    <h3>Developer Notes</h3>   <h4>Data</h4> <h4>rules</h4> ... <h4>Still open</h4>
  </div>
</section>
```

- Change type badge: `t-visual` Visual Only, `t-feature` New Feature or Logic, `t-complete`
  Complete Change, `t-new` New Widget, `t-none` No Change. The nav link carries the same class.
- Review badge: `Draft <d Mon yyyy>` until the owner reviews, then `Reviewed <date>` with class
  `rev ok`. Never promote it yourself.
- A view only in V2 gets `<figure class="shot missing"><figcaption>V1</figcaption><div class="ph">Not
  in V1<code>New in V2</code></div></figure>` on the left; a view only in V1 the mirror on the
  right ("Not in V2 / Removed in V2"). The `count` in the summary is 2 x pairs.
- Bullets in What's Different open with the screenshot's view name in bold, exactly as the file is
  labelled ("**Explore - Table:**"), V2 first, then "V1 had ..." in the same bullet.

### 4.2 What goes in, and what stays out

In:
- Overview: one paragraph of what V1 had and V2 keeps, a numbered list of the changes with bold
  lead-ins, and an "everything else unchanged" line. If nothing changed, say so and badge No Change.
- What's Different: every visible difference a user would notice, grouped by area, each tied to a
  screenshot name. Include the exact labels and vocabulary V2 shows ("Your turn", "Coming to you").
- Developer Notes: only where data or logic changed. What data is needed (fields, per record), the
  rules in plain English (how a figure is computed, what filters narrow, what a click does), the
  dates rule (browser date or server date), and the hooks that lead out of the dashboard. Finish
  with "Still open": the real unknowns a developer must settle (which endpoint, where a link goes).
- Facts about V1 are read from the V1 html; facts about V2 from `index.html` and the decision
  record. Any September diff doc is a checklist, not a source.

Out:
- Mock data and its differences (vendor names, counts, dates), unless the point is a rule.
- Anything that exists only to run the demo: "kept for this session", "no write API", driver
  names, tooling, line numbers, file paths, class names, function names.
- Design history: Jo's rulings, what was tried and reverted, who asked for what. The handover
  states the result; the reasons live in `docs/decisions/Wnn.md`.
- Superseded decisions. If an earlier draft described a control that is gone, delete the
  sentence; do not write "previously".
- W-numbers in prose; em dashes anywhere; code or identifiers in the text.

### 4.3 Procedure for one widget

1. Finish the code and the screenshots first; the text describes what is on disk.
2. Build the section with a Python step (pattern: `scratchpad/handover_w18_w19.py`): generate the
   pairs from the files in the folder plus placeholders, write the prose, replace the whole
   `<section id="wNN">...</section>`.
3. Sanity script before you report: every `src` exists on disk; `class="pair"` count x 2 equals the
   summary count; no `\u2014`; no `\bW\d{2}\b` in the prose; badge reads `Draft <today>`.
4. Open `http://localhost:8765/handover.html#wNN` and check the pairs sit at the same size (Glance,
   Explore and Detail must match across V1 and V2; only pop-ups may differ) and nothing is cut.
5. Tell the owner what changed in the text, in two or three lines, and give the local link.

---

## 5. State on 9 October 2026 (evening)

- Code and drivers green: `node _tools/verify.js` reports 3431 passed, 0 failed across 19 drivers.
- Done this week (all uncommitted): Payroll Scheduled Time Off, Loans With Balance Due, Fixed
  Asset Values and Purchasing Management reworked per the owner; handover sections for the first
  three are "Draft 9 Oct 2026" with retaken shots.
- Purchasing Management, latest round (9 Oct, late): single status chip with All; table with sort
  headers, shrinkable columns, no sideways scroll; status chips on semantic tokens; record pop-up
  rebuilt read-only in Jo's Phase 2 style with Approve / Hold / Reject and a confirm strip,
  Attachments listed with Open, Note writable, "Open request" top right; Overdue filter removed;
  approval path chip always shown; Encumbrances filtered by the status chip with a bar for every
  month to the current one (ten approved, unpaid January to May sample orders added).
  **The Purchasing handover section was deliberately not updated after the pop-up rebuild
  (owner).** Its shot 07 shows the new pop-up; its prose still describes Save / Cancel and the
  editable grid, and shots 02 and 05 predate the Jan-May data. Decision record
  `docs/decisions/W13.md` has the 9 Oct entry.
- Open question put to the owner, unanswered: whether a "Coming to you" request should also offer
  Approve (it does now, as the legacy screen enables rows down to yours and cascades), and whether
  the request table should still default to oldest first now that January orders sit on top.
- Backups of `index.html` before the pop-up rebuild are in the session scratchpad only
  (`index.before-popup.html`); they vanish with the session.

---

## 6. Gotchas, in one place

- `python - <<'EOF'` heredocs break on long scripts and on `\{` in regexes; write the script to a
  file with the Write tool and run it.
- Python prints to a cp1252 console; printing an em dash or arrow from the html crashes the
  script. Encode or avoid printing them.
- `verify.js` runs some sections with the payment process flag on (`payOn(true)` in the W13
  driver, sections 1 to 5) and the shipped default off (section 6). A rule that reads
  `PURF_USE_PAY` behaves differently between them; write pure helpers for the pop-up text.
- The capture script's step clicks are card-scoped; the pop-up root is outside the card.
- Chrome capture clip is in page coordinates; `getBoundingClientRect` is viewport coordinates.
- Jo's `.pur-tab` styles were deleted with her block on 27 Sep and our `.purf-tab` had none until
  9 Oct: when copying a Jo component, copy its CSS too and grep that every class in the new
  markup has a rule.
- The owner reads at about 125% zoom; verify layouts at 1536 px viewport width as well as 1920.
