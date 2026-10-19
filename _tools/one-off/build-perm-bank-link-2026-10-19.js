/* One-off, 2026-10-19: Permissions view 2.3, Bank Balances: what "Open in Bank"
   really needs.

   Owner: "Is the dashboard really enough for the permissions to access that
   page, can you check" (https://.../BankAccountManagement/BankAccountInformation).

   Checked in MBAccounting (read-only). No. Every page load is gated on the
   page's own URI at Inquiry (ShelbyPage.cs:487), and Allowed() is an exact,
   case-insensitive match on the task's page URI with only the root and
   /portal exempt (ShelbyContext.cs:761-775). Nothing is inherited from the
   module's Dashboard row. The drill opens .../BankAccountInformation/Update,
   and inside that page SetSecurity() (Update.aspx.cs:1013-1022) hides the
   account number and seven tabs unless the user holds the matching
   .../BankAccountInformation/Secure<Name> right at Update. The old Bank
   Balances panel never linked anywhere, so this is a V2 question.

   The view already said a separate right was needed; it named the folder
   rather than the Update page and said nothing about the Secure rights or
   about the Dashboard row not covering it. Those three things are added. The
   review document (2.14) carries the same, with the file citations.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");

const OLD = `              <li><b>Open in Bank</b>: <code>/BankAccountManagement/BankAccountInformation</code> at Inquiry.</li>`;
const NEW = [
  `              <li><b>Open in Bank</b> opens <code>/BankAccountManagement/BankAccountInformation/Update</code>, so it needs that page's own row (under Modify in the Task Role tree) at Inquiry. <b>The Dashboard right does not confer it</b>: a page right is an exact match on the page's URI, with nothing inherited from the module row, so <code>/BankAccountManagement</code> grants the Dashboard and nothing else.</li>`,
  `              <li>Inside that page the account number and seven tabs (Company Info, MICR, Images, MICR Password, ACH, AP Checks, PR Checks) each need <code>/BankAccountManagement/BankAccountInformation/Secure&hellip;</code> at Full Rights; the page applies those itself, so V2 need not model them. The old Bank Balances panel never linked anywhere, so this is new to V2.</li>`
].join(NL);

if (t.split(OLD).length - 1 !== 1) throw new Error("the Open in Bank line was not found exactly once");
t = t.split(OLD).join(NEW);

/* guards: the item landed inside 2.3, once, and the account-roles line that followed it is still there */
const i = t.indexOf("<h3>2.3 Bank Balances</h3>"), j = t.indexOf("<h3>2.4", i);
const sec = t.slice(i, j > 0 ? j : i + 4000);
if ((sec.match(/BankAccountInformation\/Update/g) || []).length !== 1) throw new Error("the Update URI did not land once in 2.3");
if (sec.indexOf("Dashboard right does not confer it") < 0) throw new Error("the answer to the owner's question did not land");
if (sec.indexOf("Secure&hellip;") < 0) throw new Error("the Secure rights line did not land");
if (sec.indexOf("account roles") < 0) throw new Error("the account-roles line that followed was lost");
let bare = 0;
for (let k = 0; k < t.length; k++) if (t[k] === "\n" && t[k - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
console.log("Permissions 2.3: Open in Bank names the Update page, the Secure rights, and that the Dashboard row does not cover it");
