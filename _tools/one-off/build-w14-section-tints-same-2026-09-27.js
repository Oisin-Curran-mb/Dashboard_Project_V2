/* One-off, 2026-09-27, owner: "make all 3 the same colour as my tasks ... having the outside box is perfect".
   Every section panel takes the warm-sand token --wn-250; the panel shape stays. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const a = "  .mct-sec-recent{background:var(--cn-30);}" + NL + "  .mct-sec-my{background:var(--wn-250);}" + NL + "  .mct-sec-content{background:var(--surface-widget);border:1px solid var(--stroke-widget);}" + NL + "  .mct-sec-recent .mct-sec-h,.mct-sec-my .mct-sec-h{color:var(--txt-secondary);}";
if (t.split(a).length !== 2) throw new Error("anchor");
t = t.replace(a, "  .mct-sec-recent,.mct-sec-my,.mct-sec-content{background:var(--wn-250);}" + NL + "  .mct-sec .mct-sec-h{color:var(--txt-secondary);}");
t = t.replace("  /* Section tints (owner, 27 Sep): design-system tokens, distinct from each other and from every badge tint. */", "  /* Section panels (owner, 27 Sep): one warm-sand token, --wn-250, no badge uses it. */");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
