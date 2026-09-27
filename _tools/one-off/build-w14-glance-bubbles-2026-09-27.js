/* One-off, 2026-09-27, owner: Glance "stay the same, nothing changes. just have it order like it is but just
   background bubbles clearly show when you move from one to the other ... a common theme running through it".
   The single tile row keeps its order (Recent Tasks, then My Tasks not already recent), its tiles and the search
   box; the two groups are wrapped in two warm-sand bubbles (--wn-250, the section panel token of the larger
   sizes). Search matches sit in one bubble for the same theme. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap("body=res.length?('<div class=\"mct-carousel\"><div class=\"mct-irow\">'+res.slice(0,12).map(function(r){return mctItile(w,r.t);}).join(\"\")+'</div></div>'):'<div class=\"mct-glance-empty\">No matches</div>';}else{var list=mctGlanceTasks(w);body=list.length?('<div class=\"mct-carousel\"><div class=\"mct-irow\">'+list.map(function(t){return mctItile(w,t);}).join(\"\")+'</div></div>'):'<div class=\"mct-glance-empty\">No recent or saved tasks yet</div>';}",
     "body=res.length?('<div class=\"mct-carousel\"><div class=\"mct-irow\"><div class=\"mct-gsec mct-gsec-results\" role=\"group\" aria-label=\"Matching tasks\">'+res.slice(0,12).map(function(r){return mctItile(w,r.t);}).join(\"\")+'</div></div></div>'):'<div class=\"mct-glance-empty\">No matches</div>';}else{" +
     "/* two bubbles in the one row: Recent Tasks, then My Tasks not already shown (owner, 27 Sep); order and tiles unchanged */var rec=mctRecentTasks(w),seenG={};rec.forEach(function(t){seenG[t.id]=1;});var mine=mctMyTasks(w).filter(function(t){return !seenG[t.id];});" +
     "var grp=function(cls,lbl,l){return l.length?('<div class=\"mct-gsec '+cls+'\" role=\"group\" aria-label=\"'+lbl+'\">'+l.map(function(t){return mctItile(w,t);}).join(\"\")+'</div>'):\"\";};" +
     "body=(rec.length||mine.length)?('<div class=\"mct-carousel\"><div class=\"mct-irow\">'+grp(\"mct-gsec-recent\",\"Recent Tasks\",rec)+grp(\"mct-gsec-my\",\"My Tasks\",mine)+'</div></div>'):'<div class=\"mct-glance-empty\">No recent or saved tasks yet</div>';}", "glance: two bubbles in the row");
swap("  .mct-irow{display:flex;align-items:center;gap:8px;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:4px;min-width:0;}",
     "  .mct-irow{display:flex;align-items:center;gap:8px;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:4px;min-width:0;}" + NL +
     "  /* Glance bubbles (owner, 27 Sep): the section panel token, one per group, inside the same scrolling row. */" + NL +
     "  .mct-gsec{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;padding:6px;border-radius:12px;background:var(--wn-250);}", "glance bubble CSS");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
