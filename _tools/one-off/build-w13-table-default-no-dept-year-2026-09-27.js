/* One-off, 2026-09-27, owner: "for detail and for explore view on the table view, remove the filter for
   all departments and All years. they dont approvied enough and take up too much space" and "table should
   be default for both sizes too".
     - Department and Year chips, their pop-ups, click handlers, table filter lines, constants and current-
       value helpers are removed (Rule 11: neither field is confirmed on purchasing records). The Overdue
       chip stays.
     - The default view is the table at every tier; Kanban is chosen explicitly at Detail.
     - Demo widget configs follow: purfView "table", no purfDept / purfYear keys. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
const cut = function (a, label) { swap(a, "", label); };

/* default view: table everywhere */
swap('function purFViewCur(w){if(w.purfView==="enc")return "enc";if(w.purfView==="table")return "table";return (purFTier(w)==="wide")?"table":"kanban";}',
     '/* Default view is the table at every tier (owner, 27 Sep); Kanban is an explicit choice at Detail only. */' + NL +
     'function purFViewCur(w){if(w.purfView==="enc")return "enc";if(w.purfView==="kanban"&&purFTier(w)!=="wide")return "kanban";return "table";}', "viewCur: table default");

/* department / year filters removed */
cut('var PURF_DEPTS=["Finance","Admin","Ministry","Facilities","IT"];' + NL, "PURF_DEPTS");
cut('var PURF_YEARS=["FY 2026","FY 2025"];' + NL, "PURF_YEARS");
cut('function purFDeptCur(w){return (w.purfDept&&PURF_DEPTS.indexOf(w.purfDept)>-1)?w.purfDept:"All Departments";}' + NL, "purFDeptCur");
cut('function purFYearCur(w){return (w.purfYear&&PURF_YEARS.indexOf(w.purfYear)>-1)?w.purfYear:"All years";}' + NL, "purFYearCur");
swap("  var dp=purFDeptCur(w),yr=purFYearCur(w),ov=purFOvOnly(w);" + NL +
     "  return purFOldestFirst(purFRows(w).filter(function(p){" + NL +
     '    if(dp!=="All Departments"&&p.dept!==dp)return false;' + NL +
     '    if(yr!=="All years"&&p.fy!==yr)return false;' + NL,
     "  var ov=purFOvOnly(w);" + NL +
     "  return purFOldestFirst(purFRows(w).filter(function(p){" + NL, "table rows: overdue filter only");
cut('    chips+=purFChip(w,"dept",purFDeptCur(w),"Department, Table view only, currently "+purFDeptCur(w),false);' + NL, "dept chip");
cut('    chips+=purFChip(w,"year",purFYearCur(w),"Year, Table view only, currently "+purFYearCur(w),false);' + NL, "year chip");
cut('  if(t==="dept"){' + NL +
    '    var cd=purFDeptCur(w);' + NL +
    '    return \'<div class="cap">Department</div>\'+row("set-dept","all","All Departments",cd==="All Departments","")+' + NL +
    '      PURF_DEPTS.map(function(d){return row("set-dept",d,d,cd===d,"");}).join("")+' + NL +
    '      \'<div class="mi-note purf-popnote">Table view only. Department is not confirmed to exist as a field on purchasing records.</div>\';' + NL +
    '  }' + NL, "dept pop");
cut('  if(t==="year"){' + NL +
    '    var cy=purFYearCur(w);' + NL +
    '    return \'<div class="cap">Year</div>\'+row("set-year","all","All years",cy==="All years","")+' + NL +
    '      PURF_YEARS.map(function(y){return row("set-year",y,y,cy===y,"");}).join("")+' + NL +
    '      \'<div class="mi-note purf-popnote">Table view only. Year is not confirmed to exist as a field on purchasing records.</div>\';' + NL +
    '  }' + NL, "year pop");
swap('  if(a==="status"||a==="path"||a==="dept"||a==="year"||a==="scope"||a==="legend"){purFOpenPop(a,id,t);return;}',
     '  if(a==="status"||a==="path"||a==="scope"||a==="legend"){purFOpenPop(a,id,t);return;}', "click: no dept/year pops");
cut('  if(a==="set-dept"){' + NL +
    '    if(w){var nd=(v==="all"||!v)?null:v;if((w.purfDept||null)!==nd){w.purfDept=nd;purFLoad(w);}}' + NL +
    '    purFClosePop();render();return;' + NL +
    '  }' + NL, "set-dept handler");
cut('  if(a==="set-year"){' + NL +
    '    if(w){var ny=(v==="all"||!v)?null:v;if((w.purfYear||null)!==ny){w.purfYear=ny;purFLoad(w);}}' + NL +
    '    purFClosePop();render();return;' + NL +
    '  }' + NL, "set-year handler");
if (/purfDept|purfYear|PURF_DEPTS|PURF_YEARS|purFDeptCur|purFYearCur|"dept"|"year"/.test(blk)) {
  const m = blk.match(/.{0,60}(purfDept|purfYear|PURF_DEPTS|PURF_YEARS|purFDeptCur|purFYearCur|"dept"|"year").{0,60}/g);
  throw new Error("leftover department/year references: " + JSON.stringify(m));
}
t = t.slice(0, b0) + blk + t.slice(b1);

/* demo widget configs: table default, no dept/year keys */
let n = 0;
t = t.replace(/(kind:"purchasing-mb"[^\r\n]*?)purfView:"kanban"/g, function (m, a) { n++; return a + 'purfView:"table"'; });
console.log("edited: demo configs kanban -> table x" + n);
let k = 0;
t = t.replace(/(kind:"purchasing-mb"[^\r\n]*?)purfDept:null,purfYear:null,/g, function (m, a) { k++; return a; });
console.log("edited: demo configs dept/year keys removed x" + k);
if (n !== 5 || k !== 6) throw new Error("expected 5 kanban configs and 6 dept/year key pairs, got " + n + "/" + k);
/* the catalogue row (cmp / side-by-side) carries the same defaults in a different shape */
const CAT='"purchasing-mb",{purfView:"kanban",purfStatus:"All statuses",purfPath:null,purfDept:null,purfYear:null,';
if (t.split(CAT).length !== 2) throw new Error("catalogue row");
t = t.replace(CAT, '"purchasing-mb",{purfView:"table",purfStatus:"All statuses",purfPath:null,'); console.log("edited: catalogue row");
if (/purfDept|purfYear/.test(t)) throw new Error("purfDept/purfYear still referenced outside the block");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
