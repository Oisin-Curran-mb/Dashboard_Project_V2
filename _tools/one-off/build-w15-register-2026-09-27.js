/* One-off, 2026-09-27, owner: "it no longer show in the list of items". The review viewer lists finished widgets
   from WIDGETS.kinds; Jo's bank block was dispatched by a shell hook, not registered, and its cmp row (the other
   way into the list) went with the finalisation. Her content is now registered under kind "bank" (the registry is
   consulted first in contentHTML, so the hook line is redundant and removed). Pops, modal and clicks stay as her
   shell hooks. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const once = function (n) { const i = t.indexOf(n); if (i < 0) throw new Error("anchor missing: " + n.slice(0, 60)); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + n.slice(0, 60)); return i; };
const hook = '    if(w.kind==="bank")return bankContent(w);' + NL; if (t.split(hook).length !== 2) throw new Error("hook"); t = t.replace(hook, ""); console.log("removed: bank contentHTML hook");
const ap = once('   Accounts Payable By Due Date  (ap, kind:"payables")  ,  v2 redesign'); const banner = t.lastIndexOf(NL, ap - NL.length - 1) + NL.length; /* the /* ===== line above the AP header */
if (t.slice(banner, banner + 30).indexOf("/* ====") < 0) throw new Error("AP banner line not found");
const about = 'The current balance of each active bank account, based on unreconciled activity since the last reconciliation. Select one account to see what has moved (deposits, voids, checks, withdrawals, EFT) since then.';
const br = 'if(w.kind==="bank")return {h:w.title,b:"' + about + '"};'; if (t.split(br).length !== 2) throw new Error('aboutOf branch'); t = t.replace(br, ''); console.log('removed: aboutOf bank branch (moves into the registration)');
t = t.slice(0, banner) + '  /* Registered so the shell (and the review viewer) find her block through WIDGETS; her pops, modal and clicks stay as shell hooks. */' + NL + '  var BANK_ABOUT="' + about + '";' + NL + '  WIDGETS.register("bank",{content:bankContent,about:function(w){return {h:w.title,b:BANK_ABOUT};}});' + NL + NL + t.slice(banner);
console.log("inserted: WIDGETS.register(\"bank\")");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
