/* One-off, 2026-09-27, owner (screenshots): "if table is the default of the detail view. it should be first
   in the list and the filter in the explorer view needs the shorted to fit, example Statues: all status
   should be changed to all status ... these changes only for the explore view."
     - view toggle order: Table | Kanban (Detail only) | Encumbrances
     - Explore (wide) chip labels are shortened so the three chips fit beside the toggle instead of being
       clipped behind it: "Status: All statuses" -> "All statuses"; "All approval paths" -> "All paths";
       "Awaiting my approval next" -> "My approval next"; "Awaiting my approval" -> "My approval".
       Aria labels keep the full wording; Detail labels are unchanged. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* toggle order */
const KAN = '    ((purFTier(w)==="wide")?"":seg("kanban","Kanban","view_kanban","The live approval flow: one column per approval state, longest waiting first, drag a card to action it."))+' + NL;
const TAB = '    seg("table","Table","table_rows","Every purchase order over time, including closed and voided ones, with the department, year and overdue filters.")+' + NL;
swap(KAN + TAB, TAB + KAN, "toggle: Table first");
swap('seg("table","Table","table_rows","Every purchase order over time, including closed and voided ones, with the department, year and overdue filters.")',
     'seg("table","Table","table_rows","Every purchase order over time, including closed and voided ones, with the overdue filter.")', "toggle: table tip no longer names removed filters");

/* Explore chip labels */
swap('  var chips=purFChip(w,"scope",purFScopeCur(w),"Viewer scope, currently "+purFScopeCur(w),false);' + NL +
     '  if(view!=="enc")chips+=purFChip(w,"status","Status: "+purFStatusCur(w),"PO status, currently "+purFStatusCur(w),loading);' + NL +
     '  if(purFPathVals(w).length>1)chips+=purFChip(w,"path",purFPathCur(w),"Approval path, currently "+purFPathCur(w),false);',
     '  /* Explore shortens the chip labels so all three fit beside the view toggle (owner, 27 Sep). */' + NL +
     '  var sh=(tier==="wide"),sc=purFScopeCur(w),st=purFStatusCur(w),pa=purFPathCur(w);' + NL +
     '  var chips=purFChip(w,"scope",sh?purFShortScope(sc):sc,"Viewer scope, currently "+sc,false);' + NL +
     '  if(view!=="enc")chips+=purFChip(w,"status",sh?st:("Status: "+st),"PO status, currently "+st,loading);' + NL +
     '  if(purFPathVals(w).length>1)chips+=purFChip(w,"path",(sh&&pa==="All approval paths")?"All paths":pa,"Approval path, currently "+pa,false);', "header: short labels at Explore");
swap("function purFHeaderBlock(w){",
     'function purFShortScope(s){return s==="Awaiting my approval next"?"My approval next":(s==="Awaiting my approval"?"My approval":s);}' + NL +
     "function purFHeaderBlock(w){", "short scope helper");

t = t.slice(0, b0) + blk + t.slice(b1);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
