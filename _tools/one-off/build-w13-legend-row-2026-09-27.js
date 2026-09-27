/* One-off, 2026-09-27: owner: "put the info Icon one line down because it wont be there for the table
   view or encumbrance when we get to it". The legend icon leaves the view-toggle row and becomes the
   second grid cell of the headline row (.dep-hd is a 1fr/auto grid; .dep-hd-num is display:contents), so
   it sits right-aligned beside the "N need your approval" line in every view. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
const BTN = "'<button class=\"purf-lgbtn\" data-purf=\"legend\" data-id=\"'+w.id+'\" aria-haspopup=\"dialog\" aria-label=\"Legend: what the lanes, badges and colours mean\" data-tip=\"Legend\">'+purFIcon(\"info\")+'</button>";
swap("'<div class=\"dep-hd-top\"><div class=\"purf-chiprow\">'+chips+'</div><div class=\"dep-hd-toggle purf-hd-acts\">'+purFViewToggle(w)+" + NL +
     "      " + BTN + "</div></div>'+" + NL +
     "    '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div></div>'+",
     "'<div class=\"dep-hd-top\"><div class=\"purf-chiprow\">'+chips+'</div><div class=\"dep-hd-toggle\">'+purFViewToggle(w)+'</div></div>'+" + NL +
     "    '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div>'+" + NL +
     "      " + BTN + "'+" + NL +
     "    '</div>'+", "icon moves to the headline row");
swap("  .purf-root .purf-hd-acts{display:flex;align-items:center;gap:4px;}" + NL +
     "  .purf-root .purf-lgbtn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;background:transparent;color:var(--txt-subtle);border-radius:8px;cursor:pointer;padding:0;}",
     "  .purf-root .purf-lgbtn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;background:transparent;color:var(--txt-subtle);border-radius:8px;cursor:pointer;padding:0;justify-self:end;align-self:start;}", "icon CSS: right cell of the headline row");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
