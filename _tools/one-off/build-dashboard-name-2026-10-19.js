/* One-off, 2026-10-19: the dashboard is named for its module.

   Owner, 16 Oct: "make sure the name of the dashboard is the same as the
   module". Then, 19 Oct, a screenshot of the live Pages site with the
   dashboard renamed to "Accounts Payable" through the rename control: "I also
   given screenshot for what the dashboard header should look like".

   The build has one dashboard and the sidebar hard-codes one module group,
   Accounts Payable, so the dashboard takes that name. The old system agrees:
   every module home page on test1 is titled with the module's name, and
   "Dashboard" exists only in this shell, inherited from the demo. When the
   per-module split happens (still the owner's call) each dashboard takes its
   own module's name the same way.

   One line in the registry. No driver pins the old name (checked: no
   `name:"Dashboard"` in any _tools/*.driver.js), the rename control keeps
   working, and the spec's section 5 describes the switcher generically.
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");

const OLD = `    {id:"d1",name:"Dashboard",custom:true,widgets:[`;
/* joined with NL rather than written as a multi-line literal: the file is CRLF
   and a literal's own line breaks would be bare LFs, which the guard below
   rightly refuses */
const NEW = [
  `    /* Named for the module the sidebar shows, as the old system names every`,
  `       module home page (owner, 16 and 19 Oct 2026). A per-module split would`,
  `       give each dashboard its own module's name the same way. */`,
  `    {id:"d1",name:"Accounts Payable",custom:true,widgets:[`
].join(NL);
if (t.split(OLD).length - 1 !== 1) throw new Error("the d1 registry row was not found exactly once");
t = t.split(OLD).join(NEW);

/* guards */
if (t.indexOf('name:"Dashboard"') > -1) throw new Error("a dashboard is still named Dashboard");
if (t.split('{id:"d1",name:"Accounts Payable"').length - 1 !== 1) throw new Error("the rename did not land exactly once");
if (t.indexOf('<div class="sn-group">Accounts Payable</div>') < 0) throw new Error("the sidebar no longer shows Accounts Payable; the name would not match the module");
let bare = 0;
for (let k = 0; k < t.length; k++) if (t[k] === "\n" && t[k - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
console.log("the dashboard is named Accounts Payable, after the module the sidebar shows");
