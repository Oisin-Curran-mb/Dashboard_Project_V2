/* One-off, 2026-09-27, owner (screenshot): "just give them little bit more space down. maybe use the token
   xtight". The shell had no spacing tokens, so the design system's xtight step is declared once on :root
   (--space-xtight: 4px) and the Glance row's bottom padding grows by it. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap("    --dur:150ms;--dur2:300ms;--ease:cubic-bezier(.4,0,.2,1);--dec:cubic-bezier(0,0,.2,1);--r:12px;",
     "    --dur:150ms;--dur2:300ms;--ease:cubic-bezier(.4,0,.2,1);--dec:cubic-bezier(0,0,.2,1);--r:12px;" + NL +
     "    /* Spacing step from the design system (owner, 27 Sep): xtight. Add further steps here as they are needed. */" + NL +
     "    --space-xtight:4px;", "token --space-xtight");
swap("  .bank-glrow{flex-direction:column;gap:4px;padding:8px 8px;}", "  .bank-glrow{flex-direction:column;gap:var(--space-xtight);padding:8px 8px calc(8px + var(--space-xtight));}", "glance row: xtight gap and extra bottom space");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
