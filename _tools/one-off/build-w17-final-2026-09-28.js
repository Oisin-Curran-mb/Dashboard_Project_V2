/* One-off, 2026-09-28: finalise W17 Gifts Pledges on the OC version.
   Owner: "Gifts Pledges clean so there only OC and remove Jo and clean away code that no longer in use."
   Same shape as the W13 finalisation.

     - Jo's `gft` block (JS + CSS cluster), its shell hooks, registry rows, cmp row and cmp note are deleted
     - ours keeps prefix gpF, becomes kind "gifts", titles "Gifts Pledges", registered via
       WIDGETS.register and moved before the registry like every finished widget
     - the 64 shell classes we borrowed from her block are COPIED into our CSS as .gpf-* and every
       gft- reference in our JS and CSS is renamed, so our block owns everything it draws with
     - only the three sizes remain (Glance, Explore, Detail); the four review fixtures go, and the
       driver builds those states itself, as W13 did
     - guards: no gft name survives outside a comment, no .gft- rule or class survives, CRLF only
*/
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const log = [];
const crlf0 = t.split(NL).length - 1;

const idx = (n, from, label) => { const i = t.indexOf(n, from || 0); if (i < 0) throw new Error("anchor missing: " + (label || n.slice(0, 70))); return i; };
const once = (n, label) => { const i = idx(n, 0, label); if (t.indexOf(n, i + 1) > -1) throw new Error("anchor ambiguous: " + (label || n.slice(0, 70))); return i; };
const lineStart = i => t.lastIndexOf(NL, i - 1) + NL.length;
const lineEnd = i => t.indexOf(NL, i) + NL.length;
function cutSpan(s, e, label) { const cut = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("cut " + (cut.split(NL).length - 1) + " lines: " + label); return cut; }
function removeLine(n, label) { const i = once(n, label); const s = lineStart(i), e = lineEnd(i); const l = t.slice(s, e); t = t.slice(0, s) + t.slice(e); log.push("removed line: " + label); return l; }
function editLine(lineNeedle, re, repl, label) {
  const i = once(lineNeedle, label + " line"); const s = lineStart(i), e = lineEnd(i); const line = t.slice(s, e);
  if (!re.test(line)) throw new Error("edit pattern missing: " + label);
  t = t.slice(0, s) + line.replace(re, repl) + t.slice(e); log.push("edited: " + label);
}
function takeLines(re, n, label) {
  const L = t.split(NL), out = [], keep = [];
  L.forEach(l => { if (re.test(l)) out.push(l); else keep.push(l); });
  if (out.length !== n) throw new Error(label + ": expected " + n + " lines, found " + out.length);
  t = keep.join(NL); log.push("took " + n + " lines: " + label); return out;
}
function insertBefore(n, block, label) { const i = once(n, label); const s = lineStart(i); t = t.slice(0, s) + block + NL + t.slice(s); log.push("inserted: " + label); }

const scriptStart = () => t.indexOf("<script>");
const OURS0 = "/* ===== W17 Gifts Pledges V2";
const OURSEND = "/* ===== end W17 Gifts Pledges V2 ===== */";
const CSS0 = "/* ===== W17 Gifts Pledges V2 CSS";
const CSSEND = "/* ===== end W17 Gifts Pledges V2 CSS ===== */";

/* ============================================================ 0. what we borrow */
const ourJS0 = idx("var GPF_TODAY=", scriptStart(), "our block start");
const ourJS1 = idx(OURSEND, ourJS0, "our block end");
const borrowed = [...new Set((t.slice(ourJS0, ourJS1).match(/gft-[a-z0-9-]+/g) || []))].sort();
if (borrowed.length !== 64) throw new Error("expected 64 borrowed classes, found " + borrowed.length);
const borrowedSet = new Set(borrowed);

/* ======================================== 1. copy the rules we borrow as .gpf-* */
const styleA = idx("<style>"), styleB = idx("</style>");
const sheet = t.slice(styleA, styleB);

/* Parse the sheet into top-level rules, expanding at-rule bodies one level. Each
   entry keeps its selector, its declaration body and its at-rule, so the copy is
   rebuilt from parts and never drags a neighbouring comment along. */
function parseRules(css) {
  const out = [];
  let depth = 0, buf = "";
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    buf += c;
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { out.push(buf); buf = ""; } }
  }
  const flat = [];
  out.forEach(raw => {
    const o = raw.indexOf("{");
    const sel = raw.slice(0, o).replace(/\/\*[\s\S]*?\*\//g, "").trim();
    const body = raw.slice(o + 1, raw.lastIndexOf("}"));
    if (sel.charAt(0) === "@") {
      parseRules(body).forEach(r => flat.push({ sel: r.sel, body: r.body, at: sel }));
    } else if (sel) {
      flat.push({ sel: sel, body: body.trim(), at: null });
    }
  });
  return flat;
}
const all = parseRules(sheet);

/* A selector group is worth copying when it names a class we actually draw with,
   and mentions no gft class we never emit (those rules are hers alone). */
function keepGroup(g) {
  const names = g.match(/\.gft-[a-z0-9-]+/g) || [];
  if (!names.length) return false;
  return names.every(n => borrowedSet.has(n.slice(1)));
}
const copied = [];
all.forEach(r => {
  if (r.sel.indexOf(".gpf-root") > -1) return;           /* already ours */
  const groups = r.sel.split(",").map(x => x.trim()).filter(Boolean);
  const keep = groups.filter(keepGroup);
  if (!keep.length) return;
  const sel = keep.map(g => ".gpf-root " + g.split("gft-").join("gpf-")).join(",");
  copied.push({ sel: sel, body: r.body, at: r.at });
});
if (copied.length < 70) throw new Error("only " + copied.length + " rules would be copied; expected 70+");

/* every class we draw with must end up declared */
const declared = new Set();
copied.forEach(r => (r.sel.match(/\.gpf-[a-z0-9-]+/g) || []).forEach(n => declared.add(n.slice(1))));
const ourCSSnow = t.slice(idx(CSS0, styleA, "our CSS banner"), idx(CSSEND, styleA, "our CSS end"));
(ourCSSnow.match(/\.gpf-[a-z0-9-]+/g) || []).forEach(n => declared.add(n.slice(1)));
const missing = borrowed.map(b => b.split("gft-").join("gpf-")).filter(n => !declared.has(n));
if (missing.length) throw new Error("these borrowed classes would have no rule: " + missing.join(" "));

let addition = NL + "  /* ----- W17: the shell classes this widget used to borrow from the retired gft" + NL
  + "     block, copied here as gpf-* on 28 Sep 2026 so the block owns everything it" + NL
  + "     draws with. Declarations are unchanged; only the names and the root scope are. ----- */" + NL;
const plain = copied.filter(r => !r.at), inAt = copied.filter(r => r.at);
plain.forEach(r => { addition += "  " + r.sel + "{" + r.body + "}" + NL; });
[...new Set(inAt.map(r => r.at))].forEach(at => {
  addition += "  " + at + "{" + NL;
  inAt.filter(r => r.at === at).forEach(r => { addition += "    " + r.sel + "{" + r.body + "}" + NL; });
  addition += "  }" + NL;
});
{
  const i = once(CSSEND, "our CSS end banner");
  t = t.slice(0, lineStart(i)) + addition + t.slice(lineStart(i));
  log.push("copied " + copied.length + " borrowed rules into our CSS block");
}

/* ======================================== 2. rename gft- to gpf- inside our code */
function renameInSpan(startAnchor, endAnchor, label) {
  const a = idx(startAnchor, 0, label + " start"), b = idx(endAnchor, a, label + " end");
  const span = t.slice(a, b);
  const n = (span.match(/gft-/g) || []).length;
  t = t.slice(0, a) + span.split("gft-").join("gpf-") + t.slice(b);
  log.push("renamed " + n + " gft- references in " + label);
}
renameInSpan(CSS0, CSSEND, "our CSS block");
renameInSpan("var GPF_TODAY=", OURSEND, "our JS block");

/* ==================================================== 3. Jo's CSS, rule by rule

   NOT a span cut. Her cluster has two lodgers that must survive: the .mi-sub2
   override, which the W01 budget popover also reads, and the shared .pbar
   pacing-bar run that was parked immediately after it. Her rules also spill
   outside the cluster: one in the shared table-totals section, a run inside the
   remittance section, and one group of a two-group selector in the W04 block.

   So the sweep is per rule. A selector GROUP naming a .gft- class is dropped; a
   rule keeps whatever groups are left; a rule with no groups left goes. Anything
   that never names one of her classes is untouched, wherever it sits. */
{
  const a0 = t.indexOf("<style>"), b0 = t.indexOf("</style>");
  const sheet0 = t.slice(a0, b0);
  let out = "", i = 0, dropped = 0, trimmed = 0;

  function sweep(css, indentBack) {
    let res = "", j = 0, gone = 0;
    while (j < css.length) {
      /* find the next rule's opening brace at this level */
      const open = css.indexOf("{", j);
      if (open < 0) { res += css.slice(j); break; }
      /* the selector is everything since the last rule ended, minus comments */
      const head = css.slice(j, open);
      let depth = 1, k = open + 1;
      while (k < css.length && depth > 0) { if (css[k] === "{") depth++; else if (css[k] === "}") depth--; k++; }
      const body = css.slice(open + 1, k - 1);
      /* Split the head into leading trivia and the selector. The head begins
         right after the previous rule's closing brace, so the trivia is comments
         and blank lines; the selector is whatever follows the last comment. A
         comment's own prose contains commas, so it must not reach the group
         split, which is what an earlier version of this got wrong. */
      const lastC = head.lastIndexOf("*/");
      const selOff = lastC > -1 ? lastC + 2 : 0;
      const sel = head.slice(selOff);
      const lead = head.slice(0, selOff);
      const selTrim = sel.trim();

      if (selTrim.charAt(0) === "@") {
        const inner = sweep(body, true);
        if (inner.trim() === "") { res += lead; gone++; }
        else res += lead + sel + "{" + inner + "}";
      } else {
        const groups = selTrim.split(",").map(x => x.trim()).filter(Boolean);
        const keep = groups.filter(g => !/\.gft-[a-z0-9-]/.test(g));
        if (!keep.length) { res += lead; gone++; }
        else if (keep.length !== groups.length) {
          res += lead + sel.replace(selTrim, keep.join(",")) + "{" + body + "}";
          trimmed++;
        } else res += lead + sel + "{" + body + "}";
      }
      j = k;
    }
    dropped += gone;
    return res;
  }

  const swept = sweep(sheet0, false);
  /* a comment holding a stray brace would derail the walk, so prove it did not */
  const bal = s2 => { let d = 0; for (const c of s2) { if (c === "{") d++; else if (c === "}") d--; if (d < 0) return -1; } return d; };
  if (bal(sheet0) !== 0) throw new Error("the stylesheet did not balance before the sweep");
  if (bal(swept) !== 0) throw new Error("the sweep unbalanced the stylesheet");
  if (swept.length > sheet0.length) throw new Error("the sweep grew the stylesheet");
  if (dropped < 100) throw new Error("only " + dropped + " gft rules would be dropped; expected 100+");
  if (swept.indexOf(".mi-sub2") < 0) throw new Error(".mi-sub2 was swept away and W01 needs it");
  if (swept.indexOf(".pbar-lg-swatch") < 0) throw new Error("the shared .pbar run was swept away");
  if (/\.gft-[a-z]/.test(swept)) throw new Error("a .gft- selector survived the sweep");
  t = t.slice(0, a0) + swept + t.slice(b0);
  log.push("swept " + dropped + " gft rules out of the stylesheet, trimmed " + trimmed + " shared selectors");
}

/* ============================================================ 4. Jo's JS block */
{
  const hdr = idx("   Gifts Pledges  (prefix: gft, kind:\"gifts\")", scriptStart(), "her block header");
  let s = lineStart(hdr);
  /* walk back over her banner comment to its opening line */
  while (t.slice(s, s + 8).indexOf("/* =====") < 0) { s = lineStart(s - NL.length); if (s <= 0) throw new Error("her banner not found"); }
  const last = idx("function gftTriggerSelector(){", s, "her last function");
  let e = lineEnd(last);
  while (t.slice(e, e + NL.length) === NL) e += NL.length;
  const blk = cutSpan(s, e, "Jo's gifts JS block");
  ["var GFT_TODAY=", "function gftContent(", "function gftHandleClick(", "function gftPopContent(",
    "var GFT_DONORS=", "GFT_ABOUT_BODY", "EMPTY_COPY.gifts", "ERROR_COPY.gifts"].forEach(n => {
      if (blk.indexOf(n) < 0) throw new Error("her block lacks " + n);
    });
  if (/\bgpF[A-Z]|GPF_|gpf-/.test(blk)) throw new Error("the cut reached into our block");
}

/* ============================================================ 5. shell hooks */
removeLine('    if(w.kind==="gifts")return gftContent(w);', "gifts contentHTML");
removeLine('    if(w.kind==="gifts-mb")return gpFContentRoot(w); //', "gifts-mb contentHTML (now via WIDGETS.register)");
removeLine('    if(pop.type==="gft-date"||pop.type==="gft-purpose")return gftPopContent();', "gft popContent");
removeLine('    if(modal.type==="gftdetail"){mr.innerHTML=gftDetailModalHTML();return;}', "gftdetail modal");
removeLine('    if(a&&a.indexOf("gft-")===0&&gftHandleClick(a,id,t))return;', "gft click hook");
editLine('  document.addEventListener("input",function(e){if(gftHandleInput(e))return;', /if\(gftHandleInput\(e\)\)return;/, "", "gft input hook");
["gft-date", "gft-purpose"].forEach(k => {
  editLine("  function triggerSelector(){", new RegExp('if\\(pop\\.type==="' + k + '"\\)return \'\\[data-action="' + k + '"\\]\\[data-id="\'\\+pop\\.id\\+\'"\\]\';'), "", "triggerSelector " + k);
});
editLine("  function aboutOf(w){", /if\(w\.kind==="gifts"\)return \{h:w\.title,b:GFT_ABOUT_BODY\};/, "", "aboutOf gifts");
editLine("  function aboutOf(w){", /if\(w\.kind==="gifts-mb"\)return \{h:w\.title,b:GPF_ABOUT\};/, "", "aboutOf gifts-mb (moves into WIDGETS.register)");

/* ============================================================ 6. registry rows */
takeLines(/^\s*\{id:"gft(_k|2|3|4|5)?",\s*title:"Gifts Pledges[^"]*",\s*kind:"gifts",/, 6, "Jo's gifts registry rows");
takeLines(/^\s*,\{id:"gpF(2|3|4|5)",\s*title:"Gifts Pledges \(OC,[^"]*\)",\s*kind:"gifts-mb"/, 4, "our four review fixtures");
[["gpF_k", "kpi"], ["gpF", "wide"], ["gpF_x", "xwide"]].forEach(([id]) => {
  editLine(',{id:"' + id + '",', /title:"Gifts Pledges \(OC[^"]*\)",\s*/, 'title:"Gifts Pledges",'.padEnd(35, " "), "title " + id);
  editLine(',{id:"' + id + '",', /kind:"gifts-mb"/, 'kind:"gifts"', "kind " + id);
});
editLine('      /* ===== W17 Gifts Pledges V2 registry, prefix gpF, kind "gifts-mb". Seven registry ===== */', /.*/,
  "      /* W17 Gifts Pledges (ours, prefix gpF) */", "registry comment");
removeLine('    ["W17","Gifts Pledges","gifts",', "CMP_ROWS W17 (the last comparison row)");
editLine("    var VIEW_WNUM={budget:\"W01\"", /payables:"W16",/, 'payables:"W16",gifts:"W17",', "viewer map W17");

/* ============================================================ 7. our block moves */
{
  /* the block's own banner, found by its unique inner line and walked back to
     the comment opener (the string "/* ===== W17 Gifts Pledges V2" also occurs
     as the registry's own one-line comment, which is not the block) */
  let b0 = lineStart(idx('   W17 Gifts Pledges V2 registry, prefix gpF / GPF_, kind "gifts-mb"', scriptStart(), "our block banner line"));
  while (t.slice(b0, b0 + 8).indexOf("/* =====") < 0) { b0 = lineStart(b0 - NL.length); if (b0 <= 0) throw new Error("our banner opener not found"); }
  const b1 = lineEnd(idx(OURSEND, b0, "our end banner"));
  let blk = cutSpan(b0, b1, "our gpF block").replace(/(\r\n)+$/, "");
  if (blk.endsWith(OURSEND)) blk = blk.slice(0, -OURSEND.length).replace(/(\r\n)+$/, "");
  blk = blk.split('w.kind==="gifts-mb"').join('w.kind==="gifts"')
           .split('kind "gifts-mb"').join('kind "gifts"')
           .split('kind:"gifts-mb"').join('kind:"gifts"');
  if (blk.indexOf("gifts-mb") > -1) throw new Error("gifts-mb survives in the block: " + JSON.stringify(blk.match(/.{0,40}gifts-mb.{0,40}/g).slice(0, 4)));

  /* Two paragraphs of the block's banner describe a world that no longer exists:
     the rollback flags the rebuild deleted, and the CSS borrowing this script has
     just ended. Both are replaced rather than renamed, because renaming prose
     about "her .gft-prow row" would leave a sentence that is simply untrue. */
  const donutPara = blk.slice(blk.indexOf("   THE DONUT IS RETIRED"), blk.indexOf("   CSS REUSE IS THE POINT"));
  const cssPara = blk.slice(blk.indexOf("   CSS REUSE IS THE POINT"), blk.indexOf("   DELIBERATE DECOUPLING FROM W04"));
  if (!donutPara || !cssPara) throw new Error("the banner paragraphs to replace were not found");
  blk = blk.split(donutPara).join(
    "   THE DONUT IS RETIRED AND NOW DELETED. Donut by Purpose was removed as" + NL +
    "   a selectable view per owner 2026-08-19 (v1.1) and kept defined but" + NL +
    "   unreachable until the 28 September rebuild deleted it, along with the" + NL +
    "   retired Detail goal panel and the pre-v1.2 layout branch. gpFView and" + NL +
    "   gpFContent still map any stale \"donut\" state back to \"goal\", so an old" + NL +
    "   saved card cannot break." + NL + NL);
  blk = blk.split(cssPara).join(
    "   THIS BLOCK OWNS ITS OWN VOCABULARY (since 28 Sep 2026). The port" + NL +
    "   originally reused about sixty classes declared by Jo's gifts block: the" + NL +
    "   bar row, the table row, the eight-slot donor row, the gift list, the" + NL +
    "   drawer, the summary cells, the modal shell, the skeleton, the filter" + NL +
    "   chips and the glance stack. When W17 was finalised on this version her" + NL +
    "   block was deleted, so every one of those rules was copied into our CSS" + NL +
    "   block as .gpf-* with its declarations unchanged. Nothing here now depends" + NL +
    "   on a selector this widget does not declare." + NL + NL);

  const code = blk.replace(/\/\*[\s\S]*?\*\//g, "");
  if (/\bgft[A-Z]|GFT_|gft-/.test(code)) throw new Error("a gft name survives in our code: " + JSON.stringify(code.match(/.{0,30}(\bgft[A-Z]|GFT_|gft-).{0,30}/g).slice(0, 5)));
  if (blk.indexOf("WIDGETS.register(") > -1) throw new Error("the block already registers");
  const register = 'WIDGETS.register("gifts",{content:gpFContentRoot,about:function(w){return {h:w.title,b:GPF_ABOUT};}});';
  insertBefore("  /* ===== P2/P3 WIDGET BLOCKS", blk + NL + register + NL + OURSEND + NL, "W17 block before the registry");
}

/* her block was the only tenant left in the P2/P3 group, so its banners go too.
   Done after the move above, which anchors on the opening one. */
removeLine("  /* ===== P2/P3 WIDGET BLOCKS (pension, remittance, gifts, loans) ===== */", "P2/P3 opening banner");
removeLine("  /* ===== end P2/P3 widget blocks ===== */", "P2/P3 closing banner");

/* ============================================================ 8. guards */
const codeOnly = t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
["GFT_TODAY", "GFT_DONORS", "GFT_ABOUT_BODY", "GFT_WIDGETS", "gftContent", "gftHandleClick",
  "gftHandleInput", "gftPopContent", "gftDetailModalHTML", "gftTriggerSelector", "gftThru",
  'kind:"gifts-mb"', "gifts-mb", "EMPTY_COPY.gifts", "ERROR_COPY.gifts"].forEach(n => {
    const c = codeOnly.split(n).length - 1;
    if (c) throw new Error("still referenced in code: " + n + " x" + c);
  });
if (/\.gft-[a-z]/.test(codeOnly)) throw new Error("a .gft- rule or class survives: " + JSON.stringify(codeOnly.match(/.{0,40}\.gft-[a-z0-9-]+.{0,20}/g).slice(0, 5)));
if ((t.match(/kind:"gifts"/g) || []).length !== 3) throw new Error('expected exactly 3 kind:"gifts" rows, found ' + (t.match(/kind:"gifts"/g) || []).length);
let bare = 0;
for (let i = 0; i < t.length; i++) if (t[i] === "\n" && t[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);
log.forEach(l => console.log("  " + l));
console.log("W17 finalised on the OC version: " + crlf0 + " lines -> " + (t.split(NL).length - 1));
