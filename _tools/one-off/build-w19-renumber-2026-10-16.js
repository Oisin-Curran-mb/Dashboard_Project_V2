/* One-off, 2026-10-16: Pending Actions becomes W19; Alerts & Actions becomes W20.

   Owner: "make W?? Pending Actions to be changed into W19 as it going to
   replace Actions and alerts as this being scrapped and this is new one."

   WHERE THE "W??" CAME FROM. The developer review dropdown builds its labels
   from VIEW_WNUM, a kind-to-number map, and falls back to the literal "W??"
   for any kind it does not list. `pendingactions` was in none of the three
   runtime maps, which is also why the widget could not be switched off or
   held out of a release: WIDGET_SWITCH is keyed by W number, and widgetOn()
   reverse-looks-up WIDGET_KIND, returning true for any kind it cannot find.
   So the number is not decoration. It is what makes the widget governable.

   ALERTS & ACTIONS MOVES TO W20 RATHER THAN BEING DELETED. Its registry rows
   are already commented out so nothing of it is on screen, but its CSS is
   NOT dead: Pending Actions renders inside .al-*, .alb4-* and .al2-dp-*
   markup and declares none of those families itself. Deleting the Alerts
   block today would strip the new widget of most of its styling. The number
   is freed; the code stays, and its driver moves to w20- so it keeps
   guarding a block the new widget depends on.

   The owner's 6 Oct rule holds: nothing a reader sees gains a W number. The
   widget stays titled "Pending Actions" on screen. W19 appears only in
   banners, maps, the spec inventory and the driver filename.

   Also here, because it is the same kind of work: three inline font-size
   literals in the JS block move onto --type-size-* where an exact token
   exists. 16px and 14px do; 13px does not (the scale jumps 12 to 14), so the
   chevron at line ~13237 keeps its literal.
*/
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", ".."), NL = "\r\n";
const FILE = path.join(DIR, "index.html"), MAPF = path.join(DIR, "_tools", "widget-map.json");
let t = fs.readFileSync(FILE, "utf8");
const log = [];

function swap(a0, b0, why) {
  const a = a0.split("\n").join(NL), b = b0.split("\n").join(NL);
  const got = t.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + (why || a0.slice(0, 60)));
  t = t.split(a).join(b);
  log.push("  " + (why || a0.slice(0, 50).replace(/\s+/g, " ")));
}

/* =============================================== 1. the three runtime maps */

swap(`    W18:true,   /* Financial KPI */
    W19:true    /* Alerts & Actions (Aditya B4) */
  };`,
`    W18:true,   /* Financial KPI */
    W19:true,   /* Pending Actions */
    W20:false   /* Alerts & Actions (Aditya B4) - scrapped 16 Oct 2026, replaced by W19 Pending Actions. The code stays because W19 renders inside its .al- / .alb4- / .al2-dp- classes. */
  };`, "WIDGET_SWITCH: W19 is Pending Actions, Alerts moves to W20 and is off");

swap(`W17:"gifts",W18:null,W19:"alerts"}; /* W number -> widget kind (W18 is the KPI band, not a grid widget) */`,
     `W17:"gifts",W18:null,W19:"pendingactions",W20:"alerts"}; /* W number -> widget kind (W18 is the KPI band, not a grid widget) */`,
     "WIDGET_KIND: W19 -> pendingactions, W20 -> alerts");

swap(`gifts:"W17",tasks:"W14",alerts:"W19"}; /* finished widgets: kind -> W number, so they sort with the rest */`,
     `gifts:"W17",tasks:"W14",pendingactions:"W19",alerts:"W20"}; /* finished widgets: kind -> W number, so they sort with the rest */`,
     "VIEW_WNUM: pendingactions is W19, which is what retires the \"W??\" label");

/* =============================================== 2. the spec inventory */

swap(`              <tr><td>W19</td><td>Alerts &amp; Actions</td><td><code>alerts</code></td><td>Explore, Detail</td></tr>`,
`              <tr><td>W19</td><td>Pending Actions</td><td><code>pendingactions</code></td><td>Glance, Explore, Detail</td></tr>
              <tr><td>W20</td><td>Alerts &amp; Actions</td><td><code>alerts</code></td><td>Explore, Detail</td></tr>`,
     "spec inventory: a W19 Pending Actions row, Alerts renumbered to W20");

/* The count sentence above the table. Nineteen still SHIP: W20 is retained
   for reference and switched off. */
swap(`            <p>Nineteen widgets ship in Version 2. The kind is the registration key in the build; sizes are the tiers the widget offers.</p>`,
`            <p>Nineteen widgets ship in Version 2. The kind is the registration key in the build; sizes are the tiers the widget offers. W20 Alerts &amp; Actions is listed because its code is still in the build, but it is switched off and does not ship: Pending Actions replaced it.</p>`,
     "the inventory's count sentence says why W20 is listed but does not ship");

/* =============================================== 3. the block banners */

swap(`/* ===== W19 Alerts & Actions V2 CSS ===== */`,
     `/* ===== W20 Alerts & Actions V2 CSS ===== */`, "Alerts CSS banner -> W20");
swap(`/* ===== end W19 Alerts & Actions V2 CSS ===== */`,
     `/* ===== end W20 Alerts & Actions V2 CSS ===== */`, "Alerts CSS end banner -> W20");
swap(`/* ===== W19 Alerts & Actions V2 ===== */`,
     `/* ===== W20 Alerts & Actions V2 ===== */`, "Alerts JS banner -> W20");
swap(`/* ===== end W19 Alerts & Actions V2 ===== */`,
     `/* ===== end W20 Alerts & Actions V2 ===== */`, "Alerts JS end banner -> W20");
swap(`/* ===== W19-Copy Alerts & Actions V2 (alerts2) ===== */`,
     `/* ===== W20-Copy Alerts & Actions V2 (alerts2) ===== */`, "Alerts Copy JS banner -> W20");
swap(`/* ===== end W19-Copy Alerts & Actions V2 (alerts2) ===== */`,
     `/* ===== end W20-Copy Alerts & Actions V2 (alerts2) ===== */`, "Alerts Copy JS end banner -> W20");

swap(`/* ===== W19-PendingActions Pending Actions V2 (pendingactions) ===== */`,
     `/* ===== W19 Pending Actions V2 JS , prefix pa3 , kind "pendingactions" ===== */`,
     "Pending Actions JS banner takes the house shape");
swap(`/* ===== end W19-PendingActions Pending Actions V2 (pendingactions) ===== */`,
     `/* ===== end W19 Pending Actions V2 ===== */`, "and its end banner");
swap(`      /* W19-PendingActions Pending Actions (pendingactions variant) */`,
     `      /* W19 Pending Actions */`, "the registry section comment");

/* Both Alerts registry banners name the number. They carry em dashes, which
   is fine here: lint T3 reads string literals and markup, not comments. */
swap(`      /* W19 Alerts & Actions — hidden for now, preserved for future use */`,
     `      /* W20 Alerts & Actions, scrapped 16 Oct 2026 and replaced by W19 Pending Actions. The rows stay commented out; the CSS stays because W19 renders inside it. */`,
     "the Alerts registry banner -> W20");
swap(`      /* W19 Alerts & Actions — Copy (alerts2 variant) — hidden for now, preserved for future use */`,
     `      /* W20 Alerts & Actions, Copy (alerts2 variant), scrapped with it */`,
     "the Alerts Copy registry banner -> W20");

/* The note the token script left at the top of the new CSS region names the
   old number, so it moves with everything else. */
swap(`  /* Lifted out of the W19 Alerts & Actions region on 16 Oct 2026 so this`,
     `  /* Lifted out of the Alerts & Actions region (now W20) on 16 Oct 2026 so this`,
     "the new CSS region note follows the renumber");

/* =============================================== 4. inline type sizes */

swap(`<span class="material-symbols-rounded" style="font-size:16px;line-height:1;">check</span>`,
     `<span class="material-symbols-rounded" style="font-size:var(--type-size-16);line-height:1;">check</span>`,
     "the glance-group tick takes --type-size-16");
swap(`'<span class="material-symbols-rounded" style="font-size:14px;line-height:1;flex:0 0 auto;">expand_more</span>'+`,
     `'<span class="material-symbols-rounded" style="font-size:var(--type-size-14);line-height:1;flex:0 0 auto;">expand_more</span>'+`,
     "the glance chevron takes --type-size-14");

/* =============================================== 5. guards on index.html */

if (t.indexOf("W19-PendingActions") > -1) throw new Error("a W19-PendingActions banner survives");
if (t.indexOf("W19 Alerts") > -1) throw new Error("a W19 Alerts banner survives");
/* Whole banner lines, not substrings: "W19 Pending Actions V2 CSS" also sits
   inside "end W19 Pending Actions V2 CSS", so a substring count is always 2. */
[`/* ===== W19 Pending Actions V2 CSS , prefix pa3 , kind "pendingactions" ===== */`,
 `/* ===== end W19 Pending Actions V2 CSS ===== */`,
 `/* ===== W19 Pending Actions V2 JS , prefix pa3 , kind "pendingactions" ===== */`,
 `/* ===== end W19 Pending Actions V2 ===== */`].forEach(s => {
  if (t.split(s).length - 1 !== 1) throw new Error("expected exactly one: " + s);
});
["W20 Alerts & Actions V2 CSS", "W20 Alerts & Actions V2 =====", "W20-Copy"].forEach(s => {
  if (t.indexOf(s) < 0) throw new Error("missing after the renumber: " + s);
});

/* the inventory: exactly one row per registered kind, plus the band, which is
   the assertion shell-spec.driver.js makes. Its kind regex is letters-only, so
   alerts2 collapses onto alerts. */
{
  const kinds = {}; let m, re = /WIDGETS\.register\("([a-z]+)"/g;
  while ((m = re.exec(t))) kinds[m[1]] = true;
  const inv = t.slice(t.indexOf('id="spec-widgets"'));
  const rows = (inv.match(/<tr><td>W\d\d<\/td>/g) || []).length;
  if (rows !== Object.keys(kinds).length + 1) {
    throw new Error("inventory rows " + rows + " != kinds " + Object.keys(kinds).length + " + 1");
  }
  Object.keys(kinds).forEach(k => {
    if (inv.indexOf("<code>" + k + "</code>") < 0) throw new Error("inventory does not list kind " + k);
  });
  log.push("  inventory: " + rows + " rows for " + Object.keys(kinds).length + " kinds plus the band");
}

/* shell-spec.driver.js:91 pins this verbatim; the number cell is outside it */
if (t.indexOf("<td>Alerts &amp; Actions</td><td><code>alerts</code></td><td>Explore, Detail</td>") < 0) {
  throw new Error("the verbatim Alerts inventory cells the shell-spec driver pins are broken");
}

/* the maps agree with each other */
["W19:\"pendingactions\"", "W20:\"alerts\"", "pendingactions:\"W19\"", "alerts:\"W20\"",
 "W19:true,   /* Pending Actions */", "W20:false"].forEach(s => {
  if (t.indexOf(s) < 0) throw new Error("map entry missing: " + s);
});

let bare = 0;
for (let k = 0; k < t.length; k++) if (t[k] === "\n" && t[k - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);

fs.writeFileSync(FILE, t);

/* =============================================== 6. the widget map */
{
  let s = fs.readFileSync(MAPF, "utf8");
  const nl = s.indexOf("\r\n") > -1 ? "\r\n" : "\n";
  const map = JSON.parse(s);
  const w = map.widgets;
  if (!w.W19) throw new Error("no W19 entry to work from");
  if (w.W20) throw new Error("a W20 entry already exists");

  /* Alerts keeps everything it had, under its new number and driver name. */
  const alerts = JSON.parse(JSON.stringify(w.W19));
  alerts.driver = "w20-alerts.driver.js";
  alerts.decided = "2026-10-02; SCRAPPED 2026-10-16, replaced by W19 Pending Actions. Registry rows commented out. The block is NOT deleted: W19 renders inside its .al- / .alb4- / .al2-dp- classes and declares none of them itself.";
  alerts.final.css.start = "/* ===== W20 Alerts & Actions V2 CSS ===== */";
  alerts.final.css.end = "/* ===== end W20 Alerts & Actions V2 CSS ===== */";
  alerts.final.js.start = "/* ===== W20 Alerts & Actions V2 ===== */";
  alerts.final.js.end = "/* ===== end W20 Alerts & Actions V2 ===== */";

  w.W19 = {
    name: "Pending Actions",
    driver: "w19-pendingactions.driver.js",
    decided: "2026-10-16 OC (replaces the scrapped Alerts & Actions, which moved to W20; styling moved onto the build's own tokens, behaviour untouched)",
    final: {
      kind: "pendingactions",
      prefix: "pa3",
      css: {
        start: "/* ===== W19 Pending Actions V2 CSS , prefix pa3 , kind \"pendingactions\" ===== */",
        end: "/* ===== end W19 Pending Actions V2 CSS ===== */"
      },
      js: {
        start: "/* ===== W19 Pending Actions V2 JS , prefix pa3 , kind \"pendingactions\" ===== */",
        end: "/* ===== end W19 Pending Actions V2 ===== */"
      },
      registry: { grep: ["kind:\"pendingactions\""] }
    },
    note: "Renders inside W20's .al- / .alb4- / .al2-dp- class families and declares none of them. Those names are load bearing: renaming them to pa3- was tried on 2026-10-13 and broke the detail pane. W20 cannot be deleted until this widget declares its own copies.",
    tags: ["uses:escAttr", "modal", "popover", "filter"]
  };
  w.W20 = alerts;

  /* keys in order, so the file stays readable */
  const ordered = {};
  Object.keys(w).sort().forEach(k => { ordered[k] = w[k]; });
  map.widgets = ordered;

  const out = JSON.stringify(map, null, 1).split("\n").join(nl) + nl;
  JSON.parse(out);
  fs.writeFileSync(MAPF, out);
  log.push("  widget-map: W19 is Pending Actions, W20 is the scrapped Alerts & Actions");
}

log.forEach(l => console.log(l));
console.log("W19 is Pending Actions; Alerts & Actions is W20 and switched off");
