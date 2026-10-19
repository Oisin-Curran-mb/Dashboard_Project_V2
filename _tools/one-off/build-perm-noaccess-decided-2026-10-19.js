/* One-off, 2026-10-19 (later): the no-permission pop-up is decided.

   Owner: "I want B but they can only close it and the last part should be
   contact your administrator for more information." The three options in
   Permissions item 2.10 and in the review document's 5.2 become the one
   decided pop-up, shot by shoot-noaccess-mocks-2026-10-19.js (ONLY=final)
   to docs/Pics/Permissions/noaccess.png. The three option PNGs moved to
   docs/Pics/Permissions/_superseded/ and are no longer referenced.

   Each step is skipped when its result is already in the file, so the script
   can be re-run after a partial run (its first version lost two edits by
   returning a stale copy of the text; this one keeps a single copy per file).
*/
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..");
if (!fs.existsSync(path.join(DIR, "docs/Pics/Permissions/noaccess.png"))) throw new Error("noaccess.png missing: run the shoot script first");

function edit(file, steps) {
  const P = path.join(DIR, file); let s = fs.readFileSync(P, "utf8");
  const NL = s.indexOf("\r\n") > -1 ? "\r\n" : "\n";
  steps.forEach(st => {
    if (s.indexOf(st.done) > -1) { console.log("  " + file + ": already, " + st.why); return; }
    s = st.run(s, NL); if (s.indexOf(st.done) < 0) throw new Error(file + ": did not land, " + st.why);
    console.log("  " + file + ": " + st.why);
  });
  ["noaccess-a", "noaccess-b", "noaccess-c", "three options", "Option A", "Option C"].forEach(m => { if (s.indexOf(m) > -1) throw new Error(file + ": still mentions " + m); });
  if (NL === "\r\n") { let bare = 0; for (let k = 0; k < s.length; k++) if (s[k] === "\n" && s[k - 1] !== "\r") bare++; if (bare) throw new Error("bare LF: " + bare); }
  fs.writeFileSync(P, s);
}
const once = (s, a, b, why) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error("anchor appeared " + n + " times: " + why); return s.split(a).join(b); };

/* ---- index.html, Permissions 2.10 ------------------------------------ */
edit("index.html", [
  { why: "2.10 is the decided pop-up, one figure", done: 'src="docs/Pics/Permissions/noaccess.png"', run: (s, NL) => {
    const i = s.indexOf("            <h3>2.10 When a link leads to a page the user may not open</h3>");
    if (i < 0) throw new Error("2.10 not found");
    const j = s.indexOf("          </div>", i);
    if ((s.slice(i, j).match(/<figure/g) || []).length !== 3) throw new Error("expected the three option figures in 2.10");
    return s.slice(0, i) + [
      `            <h3>2.10 When a link leads to a page the user may not open</h3>`,
      `            <p>Decided (owner, 19 October). The pop-up is the shell's own, the same <code>.modal</code>, title icon, close control and <code>.btn</code> family every other V2 pop-up uses, on Pathway tokens, so it needs no new styling. Its only control is <b>Close</b> (and the close icon in the header). The text names the page as <b>Module / Section / Page</b>, the path the Task Role editor uses, so the user and their administrator are reading the same words; the example is the page from 2.3.</p>`,
      `            <figure class="spec-fig"><a href="docs/Pics/Permissions/noaccess.png" target="_blank" rel="noopener" title="Open at full size"><img src="docs/Pics/Permissions/noaccess.png" alt="The no-permission pop-up: No access to this page. Opening Bank Account Management / Bank Account Information / Update needs a right you don't hold. Contact your administrator for more information. Close." loading="lazy"></a><figcaption>The template. Title: <b>No access to this page</b>. Body: <b>Opening Module / Section / Page needs a right you don't hold.</b> Then: <b>Contact your administrator for more information.</b> One button, Close.</figcaption></figure>`,
      ``].join(NL) + s.slice(j);
  } },
  { why: "the rule paragraph points at the pop-up, not the mock-ups", done: "the pop-up itself is in 2.10 below", run: s =>
    once(s, "and the template and three mock-ups are in 2.10 below", "and the pop-up itself is in 2.10 below", "rule paragraph tail") }
]);

/* ---- the review document, 5.2 and decision 5 -------------------------- */
edit("docs/handover/Widget permissions - the old system and the V2 recommendation (draft).md", [
  { why: "5.2 shows the decided pop-up", done: "#### The no-permission pop-up (decided 19 October)", run: (s, NL) => {
    const i = s.indexOf("#### The no-permission pop-up: template and three options");
    const j = s.indexOf("| V2 widget | Outbound control in the build today |");
    if (i < 0 || j < 0 || j < i) throw new Error("pop-up section boundaries not found");
    return s.slice(0, i) + [
      "#### The no-permission pop-up (decided 19 October)",
      "",
      "Three options were mocked up; the owner chose the second, with two changes: **Close is the only",
      "control**, and the last line reads **Contact your administrator for more information.** The pop-up",
      "is the shell's own `.modal`, title icon, close control and `.btn` family on Pathway tokens, so it needs",
      "no new styling. Mock-up: `_tools/one-off/shoot-noaccess-mocks-2026-10-19.js`.",
      "",
      "![The no-permission pop-up](../Pics/Permissions/noaccess.png)",
      "*Title: No access to this page. Body: Opening Module / Section / Page needs a right you don't hold.*",
      "*Then: Contact your administrator for more information. One button, Close.*",
      "",
      "The page is named as **Module / Section / Page**, the path the Task Role editor uses, so the user and",
      "their administrator read the same words. Example: **Bank Account Management / Bank Account",
      "Information / Update**.",
      "", ""].join(NL) + s.slice(j);
  } },
  { why: "decision 5 records the pop-up as decided", done: "The pop-up is decided: title", run: (s, NL) =>
    once(s, ["   Revised 19 October from the earlier decision to hide such links; the choice between the three",
             "   pop-up options is open."].join(NL),
            ["   Revised 19 October from the earlier decision to hide such links. The pop-up is decided: title",
             "   \"No access to this page\", the page named, \"Contact your administrator for more information.\",",
             "   Close as the only control."].join(NL), "decision 5") }
]);

/* ---- the driver --------------------------------------------------------- */
edit("_tools/shell-spec.driver.js", [
  { why: "one mock-up, the decided one", done: 'const MOCKS = ["noaccess"];', run: (s, NL) =>
    once(s, [`/* the Task Role screenshots, plus the three no-permission pop-up mock-ups in item 2.10 (19 Oct) */`,
             `const MOCKS = ["noaccess-a", "noaccess-b", "noaccess-c"];`].join(NL),
            [`/* the Task Role screenshots, plus the decided no-permission pop-up in item 2.10 (19 Oct) */`,
             `const MOCKS = ["noaccess"];`].join(NL), "MOCKS") },
  { why: "the owner's wording is asserted", done: "the pop-up's last line is the owner's wording", run: (s, NL) =>
    once(s, `"one figure per picture and per mock-up");`,
            `"one figure per picture and per mock-up");` + NL + `A.contains(perm, "Contact your administrator for more information.", "the pop-up's last line is the owner's wording");`, "wording") }
]);
console.log("decided pop-up landed in the view, the document and the driver");
