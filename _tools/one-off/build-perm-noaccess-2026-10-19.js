/* One-off, 2026-10-19: Permissions view, the rule for outbound links changes,
   and the no-permission pop-up gets its template and three options.

   Owner: "all links for more information should always show, but if a user
   clicks it and does not have permission for that page, there be a pop up
   saying that user does not have permission to access that page and name the
   page they are trying to access, starting with module/subname/name of the
   page."

   That reverses section 2's rule, which was "show the control only when the
   user holds the destination page's right; otherwise it is absent". The rule
   paragraph is rewritten, and a new item closes section 2 with the template
   sentence and the three mock-ups from shoot-noaccess-mocks-2026-10-19.js,
   which are the shell's own modal and buttons on Pathway tokens.

   The per-widget items that name which right each link needs are unchanged:
   the right is still what the destination page checks; only what the user
   sees before holding it has changed.
*/
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", ".."), NL = "\r\n";
const FILE = path.join(DIR, "index.html");
let t = fs.readFileSync(FILE, "utf8");
const log = [];
function swap(a0, b0, why) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + why);
  t = t.split(a).join(b); log.push("  " + why);
}

/* the three mocks must exist before the view can show them */
["a", "b", "c"].forEach(k => {
  const p = path.join(DIR, "docs/Pics/Permissions", `noaccess-${k}.png`);
  if (!fs.existsSync(p)) throw new Error("mock not on disk, run shoot-noaccess-mocks first: " + p);
});

/* ---- 1. the rule ------------------------------------------------------- */
{
  const i = t.indexOf("            <p>The rule for every control below that leads to another page: <b>show it only when the user holds the destination page's right</b>;");
  if (i < 0) throw new Error("the old rule paragraph was not found");
  const j = t.indexOf("</p>", i) + 4;
  const NEW = `            <p>The rule for every control below that leads to another page (owner, 19 October): <b>always show it</b>. If the user does not hold the destination page's right, the click opens a pop-up that says so and <b>names the page as Module / Section / Page</b>, so they know exactly what to ask for. The widget itself is still shown only on its module's Dashboard right, and the destination page still enforces its own right on arrival, so nothing is reachable that was not reachable before; the user is simply told why instead of finding the control missing. This replaces the earlier rule of hiding the control, and the template and three mock-ups are in 2.${"N"} below.</p>`;
  t = t.slice(0, i) + NEW + t.slice(j);
  log.push("  the rule: always show the link; a click without the right opens the pop-up");
}

/* ---- 2. the template item, closing section 2 --------------------------- */
{
  /* find the last <h3>2.N ...</h3> in the permissions section to number after it */
  const p0 = t.indexOf('<section class="spec" id="permView"'), p1 = t.indexOf("</section>", p0);
  const perm = t.slice(p0, p1);
  const nums = [...perm.matchAll(/<h3>2\.(\d+) /g)].map(m => +m[1]);
  const next = Math.max(...nums) + 1;
  t = t.split("2." + "N" + " below").join("2." + next + " below");
  /* the care section ends where section 3 begins */
  const careEnd = t.indexOf('          <div class="spec-sec" id="perm-six">');
  const anchor = careEnd > 0 ? careEnd : t.indexOf("<h2>3. ", p0);
  if (anchor < 0) throw new Error("could not find where section 2 ends");
  /* walk back to the close of the section-2 div: the last "          </div>" before the anchor */
  const closeIdx = t.lastIndexOf("          </div>" + NL, anchor);
  if (closeIdx < 0 || closeIdx < p0) throw new Error("could not find the end of section 2's div");
  const fig = (k, cap) => `            <figure class="spec-fig"><a href="docs/Pics/Permissions/noaccess-${k}.png" target="_blank" rel="noopener" title="Open at full size"><img src="docs/Pics/Permissions/noaccess-${k}.png" alt="${cap}" loading="lazy"></a><figcaption>${cap}</figcaption></figure>`;
  const ITEM = [
    `            <h3>2.${next} When a link leads to a page the user may not open</h3>`,
    `            <p>The template, used by every option: <b>You don't have permission to open Module / Section / Page.</b> The path is the one the Task Role editor uses, so the user and their administrator are reading the same words. The example throughout is the page from 2.3, <b>Bank Account Management / Bank Account Information / Update</b>.</p>`,
    `            <p>All three are the shell's own pop-up, the same <code>.modal</code>, title icon, close control and <code>.btn</code> family every other V2 pop-up uses, on Pathway tokens, so whichever is chosen needs no new styling. They differ only in what sits beneath the sentence.</p>`,
    fig("a", "Option A, plain: the sentence, who to ask, and Close. The least to read, and the least to maintain."),
    fig("b", "Option B, with actions: the sentence, then Request access and Back to dashboard, so the user can do something about it from the pop-up."),
    fig("c", "Option C, with the right named: the sentence, then the exact right and where it is granted (Security Setup, Task Roles, Bank Account Management, Modify), for a user who will relay it to an administrator."),
    `            <p>A decision for the owner. A reads as the safe default; B promises a request-access flow that V2 does not yet have behind it; C is the most useful to an administrator and the most likely to date, since it prints a URI.</p>`
  ].join(NL) + NL;
  t = t.slice(0, closeIdx) + ITEM + t.slice(closeIdx);
  log.push("  item 2." + next + ": the template and the three options, closing section 2");
}

/* ---- guards ------------------------------------------------------------ */
if (t.indexOf("show it only when the user holds the destination page's right") > -1) throw new Error("the old rule survives");
if (t.indexOf("2.N below") > -1) throw new Error("the item number was not filled in");
["noaccess-a.png", "noaccess-b.png", "noaccess-c.png"].forEach(f => { if ((t.match(new RegExp(f, "g")) || []).length !== 2) throw new Error(f + " should appear twice (href and src)"); });
if (t.indexOf("Module / Section / Page") < 0) throw new Error("the template sentence did not land");
const css = t.slice(t.indexOf("<style"), t.lastIndexOf("</style>"));
const sec = t.slice(t.indexOf('id="permView"'), t.indexOf('id="dashView"'));
[...new Set([...sec.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)))].forEach(c => { if (/^material-symbols/.test(c)) return; if (css.indexOf("." + c) < 0) throw new Error("undeclared class in the view: " + c); });
if (/—/.test(sec.slice(sec.indexOf("When a link leads")))) throw new Error("an em dash crept into the new item");
let bare = 0; for (let k = 0; k < t.length; k++) if (t[k] === "\n" && t[k - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log(l));
console.log("Permissions view: links always show; the no-permission pop-up has its template and three options");
