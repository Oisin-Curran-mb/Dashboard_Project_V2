/* One-off, 2026-09-27, owner: "Main Content Tasks. can each section have slightly color in the background ...
   easier to see what section they are ... token from design system ... not similar to each other and not the same
   of any other color used in the badges". Recent Tasks = --cn-30 (cool grey), My Tasks = --wn-250 (warm sand),
   Content Tasks = the widget surface (white). Search results stay untinted. Badge and row-icon tints (--brand-10,
   --am-100, green, --wn-200) are avoided. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const swapN = function (a, b, n, label) { const k = t.split(a).length - 1; if (k !== n) throw new Error("anchor x" + k + " (want " + n + "): " + label); t = t.split(a).join(b); console.log("edited: " + label + " x" + n); };
swapN('<div class="mct-sec"><div class="mct-sec-h">Recent Tasks</div>', '<div class="mct-sec mct-sec-recent"><div class="mct-sec-h">Recent Tasks</div>', 1, "Recent Tasks section");
swapN('<div class="mct-sec"><div class="mct-sec-h">My Tasks</div>', '<div class="mct-sec mct-sec-my"><div class="mct-sec-h">My Tasks</div>', 1, "My Tasks section");
swapN('<div class="mct-sec"><div class="mct-sec-h">Content Tasks</div>', '<div class="mct-sec mct-sec-content"><div class="mct-sec-h">Content Tasks</div>', 2, "Content Tasks section (list and empty)");
swapN("  .mct-sec{display:flex;flex-direction:column;gap:7px;}",
      "  .mct-sec{display:flex;flex-direction:column;gap:7px;padding:10px 10px 8px;border-radius:12px;}" + NL +
      "  /* Section tints (owner, 27 Sep): design-system tokens, distinct from each other and from every badge tint. */" + NL +
      "  .mct-sec-recent{background:var(--cn-30);}" + NL +
      "  .mct-sec-my{background:var(--wn-250);}" + NL +
      "  .mct-sec-content{background:var(--surface-widget);border:1px solid var(--stroke-widget);}" + NL +
      "  .mct-sec-recent .mct-sec-h,.mct-sec-my .mct-sec-h{color:var(--txt-secondary);}", 1, "section tint CSS");
swapN(".mct-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:12px 16px 8px;display:flex;flex-direction:column;gap:16px;}",
      ".mct-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:12px 16px 8px;display:flex;flex-direction:column;gap:12px;}", 1, "section gap 16 -> 12 (panels carry their own padding)");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
