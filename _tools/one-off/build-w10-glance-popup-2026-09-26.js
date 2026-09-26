// One-off, 2026-09-26, owner ruling after the W10 browser look (docs/decisions/W10.md item 7):
//   1. Glance caption loses the trailing ", the most overdue with a balance"
//   2. Loan detail pop-up: "Record a contact" removed; "Export to Excel" moves to the header's top right
//      (before the close button); the placeholder note under the actions goes; "Open loan" stays as the
//      developer hook; footer is Close only. Anchored; aborts before writing on any miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W10 Loans With Balance Due V2 ===== */", B1 = "/* ===== end W10 Loans With Balance Due V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(B1, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
swap("lonFMoney(worst.total)+' in '+worst.label+', the most overdue with a balance</span>'", "lonFMoney(worst.total)+' in '+worst.label+'</span>'", "glance caption");
swap("    '<button class=\"btn naked sm\" data-lon=\"lon-contact\" data-id=\"'+w.id+'\" data-acct=\"'+lonFEsc(x.acct)+'\" data-tip=\"Placeholder: recording a contact has no backend in this mock.\" data-tip-plain>'+ICON(\"event_note\")+'Record a contact</button></div>'+" + NL +
     "    '<div class=\"lon-dl-note\">'+ICON(\"info\")+'<span>Placeholders: \"Open loan\" has no confirmed destination yet, and \"Record a contact\" is not wired to a backend.</span></div>';",
     "    '</div>';", "pop-up actions: Open loan only, no note");
swap("<span class=\"lon-dh-spacer\"></span><button class=\"iconbtn\" data-lon=\"lon-detail-close\" aria-label=\"Close\">",
     "<span class=\"lon-dh-spacer\"></span><button class=\"btn naked sm\" data-lon=\"lon-export\" data-id=\"'+w.id+'\">'+ICON(\"download\")+'Export to Excel</button><button class=\"iconbtn\" data-lon=\"lon-detail-close\" aria-label=\"Close\">", "header: Export to Excel at the top right");
swap("'<div class=\"modal-f\"><button class=\"btn naked sm\" data-lon=\"lon-export\" data-id=\"'+w.id+'\">'+ICON(\"download\")+'Export to Excel</button><span class=\"lon-dh-spacer\"></span><button class=\"btn primary sm\" data-lon=\"lon-detail-close\">Close</button></div>",
     "'<div class=\"modal-f\"><button class=\"btn primary sm\" data-lon=\"lon-detail-close\">Close</button></div>", "footer: Close only");
swap("  if(a===\"lon-contact\"){setStatus(\"Record a contact is a placeholder: loan \"+t.getAttribute(\"data-acct\")+\" has no contact record to write to yet.\");return;}" + NL, "", "contact handler gone");
/* the Open loan tooltip no longer talks about placeholders */
swap(" data-tip=\"Placeholder: the destination for this link is not confirmed yet.\" data-tip-plain>'+ICON(\"open_in_new\")+'Open loan", ">'+ICON(\"open_in_new\")+'Open loan", "Open loan: plain developer hook");
t = t.slice(0, b0) + blk + t.slice(b1);
const before = t.split(NL).length; t = t.split(NL).filter(function (l) { return !/^\s*\.lon-dl-note/.test(l); }).join(NL); if (before - t.split(NL).length !== 2) throw new Error("lon-dl-note rules"); console.log("css: 2 note rules removed");
const code = t.replace(/\/\*[\s\S]*?\*\//g, ""); ["lon-contact", "lon-dl-note", "most overdue with a balance", "Record a contact"].forEach(function (n) { if (code.indexOf(n) > -1) throw new Error("leftover: " + n); });
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
