/* One-off, 2026-10-19: the Widget Permissions review document follows the
   two rulings of 19 October: 2.14 Bank Balances gets the source-backed answer
   to "is the Dashboard right enough", and the rule for outbound links becomes
   "always show; a click without the right opens the no-permission pop-up",
   with the template and three mock-ups.

   A file-based script rather than an inline edit, after an inline attempt
   assumed LF line endings on a CRLF file, matched nothing, and replaced the
   document from the rule paragraph to its end. The document was restored
   from HEAD first. This script reads the line ending from the file, anchors
   every edit on text that must appear exactly once, and refuses to write if
   the sections after the rule paragraph are not all still there afterwards.
*/
"use strict";
const fs = require("fs"), path = require("path");
const P = path.join(__dirname, "..", "..", "docs/handover/Widget permissions - the old system and the V2 recommendation (draft).md");
let s = fs.readFileSync(P, "utf8");
const NL = s.indexOf("\r\n") > -1 ? "\r\n" : "\n";
const J = a => a.join(NL);
const log = [];
function swap(oldLines, newLines, why) {
  const a = J(oldLines), b = J(newLines);
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error("anchor appeared " + n + " times: " + why);
  s = s.split(a).join(b); log.push("  " + why);
}

/* ---- 1. 2.14 Bank Balances ------------------------------------------------ */
swap([
  '- **V2 adds**: bars, twelve-month line, drill, "Open in Bank". Bank page',
  '  `/BankAccountManagement/BankAccountInformation/Update` (tabs by `...BankAccountInformation/*Tab`).',
  '- **Recommendation**: show on the Bank Account Management Dashboard right; **the account-role filter must',
  '  be kept in the API** (it is data access, not a widget right). "Open in Bank" needs',
  '  `/BankAccountManagement/BankAccountInformation` at Inquiry.'
], [
  '- **V2 adds**: bars, twelve-month line, drill, "Open in Bank". **The old panel never linked anywhere**',
  '  (`BankBalances.ascx` and its code-behind contain no hyperlink or redirect), so the question of what',
  '  right the link needs is new to V2.',
  '- **Is the Dashboard right enough to open the bank page? No** (owner\'s question, 19 Oct). Every page',
  '  load is gated on the page\'s own URI at Inquiry (`ShelbyPage.cs:487`, `NotAllowedRedirect()` on',
  '  failure), and `Allowed()` is an **exact, case-insensitive match** on the task\'s page URI with only the',
  '  root and `/portal` exempt (`ShelbyContext.cs:761-775`). There is no prefix match and nothing is',
  '  inherited from the module row. Holding `/BankAccountManagement` grants that page and nothing else.',
  '- **What "Open in Bank" needs**: the drill opens',
  '  `/BankAccountManagement/BankAccountInformation/Update`, so the user must hold that page\'s row at',
  '  Inquiry. The row sits under **Modify** in the Task Role editor\'s Bank Account Management tree (see',
  '  the Permissions view\'s screenshot). Whether `Default` and `Update` under `BankAccountInformation` are',
  '  one task row or two is in the seed table, not the repository.',
  '- **Inside the page, more rights again**: `Update.aspx.cs:1013-1022` (`SetSecurity`) hides the account',
  '  number field and seven tabs (Company Info, MICR, Images, MICR Password, ACH, AP Checks, PR Checks)',
  '  unless the user holds `/BankAccountManagement/BankAccountInformation/Secure<Name>` at **Update**',
  '  (Full Rights, not Inquiry). A user who can open the page may still see most of it missing.',
  '- **Recommendation**: show the widget on the Bank Account Management Dashboard right; **the',
  '  account-role filter must be kept in the API** (it is data access, not a widget right). "Open in',
  '  Bank" is **always shown**; a click by a user without',
  '  `/BankAccountManagement/BankAccountInformation/Update` at Inquiry opens the no-permission pop-up',
  '  naming **Bank Account Management / Bank Account Information / Update** (owner\'s rule, 19 Oct, see',
  '  5.2). The Dashboard right does not confer that page. V2 need not model the `Secure*` rights: the',
  '  destination page applies them itself.'
], "2.14 Bank Balances: the Dashboard right is not enough, and why");

/* ---- 2. the rule for outbound links (5.2), replaced paragraph-for-paragraph ---- */
{
  const start = "Rule proposed for every outbound control:";
  const i = s.indexOf(start);
  if (i < 0) throw new Error("the rule paragraph was not found");
  const j = s.indexOf(NL + NL, i);
  if (j < 0) throw new Error("the rule paragraph has no end");
  const old = s.slice(i, j);
  if (old.indexOf("| V2 widget |") > -1 || old.length > 800) throw new Error("the paragraph boundary overshot: " + old.length + " chars");
  const NEW = J([
    'Rule for every outbound control (owner, 19 October, replacing the earlier proposal to hide the',
    'control): **always show it.** If the user does not hold the destination page\'s right, the click',
    'opens a pop-up that says so and **names the page as Module / Section / Page**, so they know exactly',
    'what to ask for. The widget is still shown only on its module\'s Dashboard right, and the destination',
    'page still enforces its own right on arrival (`ShelbyPage.cs:487`), so nothing becomes reachable that',
    'was not; the user is told why instead of finding the control missing. The API that serves the widget',
    'should still return, per record, whether the current user may open it, so the pop-up can be shown',
    'without a round trip.',
    '',
    '#### The no-permission pop-up: template and three options',
    '',
    'Template, shared by every option: **You don\'t have permission to open Module / Section / Page.** The',
    'path is the one the Task Role editor uses, so the user and their administrator read the same words.',
    'Example throughout: **Bank Account Management / Bank Account Information / Update**.',
    '',
    'All three are the shell\'s own pop-up: the same `.modal`, title icon, close control and `.btn` family',
    'every other V2 pop-up uses, on Pathway tokens, so whichever is chosen needs no new styling. They',
    'differ only in what sits beneath the sentence. Mock-ups: `_tools/one-off/shoot-noaccess-mocks-2026-10-19.js`.',
    '',
    '![Option A, plain](../Pics/Permissions/noaccess-a.png)',
    '*Option A, plain: the sentence, who to ask, and Close.*',
    '',
    '![Option B, with actions](../Pics/Permissions/noaccess-b.png)',
    '*Option B, with actions: Request access and Back to dashboard beneath the sentence.*',
    '',
    '![Option C, with the right named](../Pics/Permissions/noaccess-c.png)',
    '*Option C, with the right named: the exact URI at Inquiry and where it is granted (Security Setup, Task Roles, Bank Account Management, Modify).*',
    '',
    'A decision for the owner. A is the safe default; B promises a request-access flow V2 does not yet',
    'have behind it; C is the most useful to an administrator and the most likely to date, since it prints',
    'a URI.'
  ]);
  s = s.slice(0, i) + NEW + s.slice(j);
  log.push("  5.2 rule: always show; pop-up names the page; template and three options added");
}

/* ---- 3. the decision that recorded the old rule ------------------------------ */
swap([
  '5. Links out of a widget: a link from a widget in one module to a page in another module the user does not',
  '   hold is not shown, as Main Content Tasks does today (section 5.2). Confirmed.'
], [
  '5. Links out of a widget: **always shown**; a click by a user who does not hold the destination page\'s',
  '   right opens the no-permission pop-up naming the page as Module / Section / Page (section 5.2).',
  '   Revised 19 October from the earlier decision to hide such links; the choice between the three',
  '   pop-up options is open.'
], "decision 5: the link rule, revised");

/* ---- guards ------------------------------------------------------------------ */
["| V2 widget | Outbound control in the build today |", "### 5.3 What V2 must be careful with", "## 6. Where the old system is wrong",
 "## 7. Summary table for Value Labs", "## 8. Decisions", "Nothing is open."].forEach(m => {
  if (s.indexOf(m) < 0) throw new Error("a later section is missing after the edit: " + m);
});
if (s.indexOf("show it only when the user holds the destination page's URI") > -1) throw new Error("the old rule survives");
["noaccess-a.png", "noaccess-b.png", "noaccess-c.png"].forEach(f => {
  if (!fs.existsSync(path.join(__dirname, "..", "..", "docs/Pics/Permissions", f))) throw new Error("mock not on disk: " + f);
  if (s.split(f).length - 1 !== 1) throw new Error(f + " should be linked exactly once");
});
if (NL === "\r\n") { let bare = 0; for (let k = 0; k < s.length; k++) if (s[k] === "\n" && s[k - 1] !== "\r") bare++; if (bare) throw new Error("bare LF introduced: " + bare); }

fs.writeFileSync(P, s);
log.forEach(l => console.log(l));
console.log("permissions document: 2.14 answered, link rule revised, pop-up template and options added");
