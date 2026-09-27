// One-off, 2026-09-27, owner: approval paths can be anything the organisation builds. Two corrections to
// the W13 (ours) approval model after the owner's Education Ministry screenshot:
//   1. thresholds are PER APPROVER (a level applies when at least one of its approvers' minimum is at or
//      under the total, and only those approvers can act on it), as PO_ApprovalPath.RequiredMinimum is
//   2. a request no level applies to (every minimum above the total) is released without an approver, as
//      the legacy ApproveOrder does on submit; the board shows it as "no approver required, approve to release"
// The demo path Education Ministry becomes the owner's real one: Start with Alfred Johnson >= $500, Then
// Jim AndersonAndMoreLetters or Lanette Stewart >= $2,000, Ends with Pastor Bob >= $5,000.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
/* paths: per-approver minimums */
swap('/* Approval paths as the record screen defines them: ordered LEVELS; "Then" opens a new level, "Or" adds an' + NL +
     '   interchangeable approver to the same level (any one satisfies it); min = the dollar threshold under which' + NL +
     '   that level is skipped. forRequest / forPayment mirror the path list flags. */',
     '/* Approval paths as the record screen defines them: ordered LEVELS; "Then" opens a new level, "Or" adds an' + NL +
     '   interchangeable approver to the same level (any one satisfies it). Each approver carries their own dollar' + NL +
     '   minimum ("X has to approve if at least $N"): an approver applies only when the total reaches it, and a level' + NL +
     '   with no applying approver is skipped. forRequest / forPayment mirror the path list flags. */', "paths comment");
swap('  "Education Ministry":{forRequest:true,forPayment:true,steps:[{seq:1,users:["Ben Lane"],min:0},{seq:2,users:["Marvin Hall"],min:500}]},',
     '  "Education Ministry":{forRequest:true,forPayment:true,steps:[{seq:1,users:["Alfred Johnson"],mins:[500]},{seq:2,users:["Jim AndersonAndMoreLetters","Lanette Stewart"],mins:[2000,2000]},{seq:3,users:["Pastor Bob"],mins:[5000]}]},', "Education Ministry = the owner's real path");
swap('function purFSteps(pathName,amt){var p=PURF_PATHS[pathName];if(!p)return [];return p.steps.filter(function(s){return (s.min||0)<=amt;});}',
     '/* The levels of a path that apply to this amount, each reduced to the approvers whose own minimum the total reaches. */' + NL +
     'function purFStepUsers(s,amt){return s.users.filter(function(u,i){var m=(s.mins&&s.mins[i]!=null)?s.mins[i]:(s.min||0);return m<=amt;});}' + NL +
     'function purFSteps(pathName,amt){var p=PURF_PATHS[pathName];if(!p)return [];var out=[];p.steps.forEach(function(s){var us=purFStepUsers(s,amt);if(us.length)out.push({seq:s.seq,users:us,all:s});});return out;}', "per-approver thresholds");
swap('  if(!level)return {kind:"complete",label:live.kind==="request"?"Fully approved":"Approved for payment"};',
     '  if(!steps.length)return {kind:"next",label:"No approver required at "+purFMoney(po.amt)+" on "+live.path+". Approve to release.",level:null,idx:0,n:0,live:live,none:true};' + NL +
     '  if(!level)return {kind:"complete",label:live.kind==="request"?"Fully approved":"Approved for payment"};', "no applicable level: release");
swap('  var steps=purFSteps(live.path,po.amt),acted=live.acted,n=steps.length;' + NL + '  var rej=acted',
     '  var steps=purFSteps(live.path,po.amt),acted=live.acted,n=steps.length;' + NL + '  var rej=acted', "turn steps (unchanged anchor check)");
/* purFMyLevel: a request with no applicable level can be released by the viewer */
swap('function purFMyLevel(po){var tn=purFTurn(po);if(tn.kind!=="next"&&tn.kind!=="mine")return null;var live=tn.live,steps=purFSteps(live.path,po.amt);var mine=steps.filter(function(s){return s.users.indexOf(PURF_ME)>-1&&!live.acted.some(function(a){return a.seq===s.seq&&a.state==="approved";});})[0];return mine?{live:live,step:mine}:null;}',
     'function purFMyLevel(po){var tn=purFTurn(po);if(tn.kind!=="next"&&tn.kind!=="mine")return null;var live=tn.live,steps=purFSteps(live.path,po.amt);if(tn.none)return {live:live,step:{seq:0,users:[PURF_ME]},release:true};var mine=steps.filter(function(s){return s.users.indexOf(PURF_ME)>-1&&!live.acted.some(function(a){return a.seq===s.seq&&a.state==="approved";});})[0];return mine?{live:live,step:mine}:null;}', "my level: release case");
/* Approvals tab: skipped approvers named per level */
swap("         var skipped=steps.indexOf(st)<0,rowsHere=acted.filter(function(a){return a.seq===st.seq;});",
     "         var applying=purFStepUsers(st,po.amt),skipped=!applying.length,rowsHere=acted.filter(function(a){return a.seq===st.seq;});", "tab: applying approvers");
swap("         var meHere=st.users.indexOf(PURF_ME)>-1,canAct=live&&meHere&&!locked&&!skipped;",
     "         var meHere=applying.indexOf(PURF_ME)>-1,canAct=live&&meHere&&!locked&&!skipped;", "tab: I can act only if my own minimum applies");
swap("         var who=(i===all.length-1?\"Ends with \":(i===0?\"Starts with \":\"Then \"))+st.users.map(purFWho).join(\" or \")+((st.min||0)>0?\" (from \"+purFMoney(st.min)+\")\":\"\");",
     "         var who=(i===all.length-1?\"Ends with \":(i===0?\"Starts with \":\"Then \"))+st.users.map(function(u,k){var m=(st.mins&&st.mins[k]!=null)?st.mins[k]:(st.min||0);return purFWho(u)+(m>0?\" (from \"+purFMoney(m)+\")\":\"\");}).join(\" or \");", "tab: each approver's own minimum");
swap("         var upd=(ap||rj||hd)?((ap||rj||hd).user+\" \"+purFFmtDate((ap||rj||hd).d)):(implied?\"Implied by a higher level\":(skipped?\"Skipped: below this level's threshold\":\"\"));",
     "         var upd=(ap||rj||hd)?((ap||rj||hd).user+\" \"+purFFmtDate((ap||rj||hd).d)):(implied?\"Implied by a higher level\":(skipped?\"Skipped: below every minimum on this level\":\"\"));", "tab: skipped wording");
/* demo orders on Education Ministry follow the real path */
swap('path:"Education Ministry",fy:"FY 2026",stage:"Pending",appr:[{seq:1,user:"Ben Lane",state:"approved",d:"2026-08-05"}],log:[]},',
     'path:"Education Ministry",fy:"FY 2026",stage:"Pending",appr:[],log:[]},', "PO-2899 ($640): waiting on Alfred Johnson alone");
swap('{ref:"PO-2891",vendor:"Catering Co.",     dept:"Ministry",  amt:430,   issued:"2026-07-15",due:"2026-08-14",path:"Education Ministry",fy:"FY 2026",stage:"Pending",hold:true,appr:[{seq:1,user:"Ben Lane",state:"hold",reason:"Waiting on budget confirmation",d:"2026-08-14"}],log:[{d:"2026-08-14",by:"Ben Lane",to:"On hold",note:"Waiting on budget confirmation"}]},',
     '{ref:"PO-2891",vendor:"Catering Co.",     dept:"Ministry",  amt:3150,  issued:"2026-07-15",due:"2026-08-14",path:"Education Ministry",fy:"FY 2026",stage:"Pending",hold:true,appr:[{seq:1,user:"Alfred Johnson",state:"approved",d:"2026-07-16"},{seq:2,user:"Lanette Stewart",state:"hold",reason:"Waiting on budget confirmation",d:"2026-08-14"}],log:[{d:"2026-08-14",by:"Lanette Stewart",to:"On hold",note:"Waiting on budget confirmation"}]},', "PO-2891 ($3,150): Alfred done, Lanette holds at the Or level; Pastor Bob not reached");
swap('{ref:"PO-2904",vendor:"Print Works",      dept:"Finance",   amt:310,   issued:"2026-08-14",due:"2026-09-13",path:"Everyone",          fy:"FY 2026",stage:"Pending",appr:[],log:[]},',
     '{ref:"PO-2904",vendor:"Print Works",      dept:"Finance",   amt:310,   issued:"2026-08-14",due:"2026-09-13",path:"Everyone",          fy:"FY 2026",stage:"Pending",appr:[],log:[]},' + NL +
     '  {ref:"PO-2907",vendor:"Choir Robes Ltd", dept:"Ministry",  amt:430,   issued:"2026-08-16",due:"2026-09-15",path:"Education Ministry",fy:"FY 2026",stage:"Pending",appr:[],log:[]},', "PO-2907 ($430): no approver's minimum reached, releases on approval");
swap('payPath:"Education Ministry",payAppr:[],log:[]},', 'payPath:"Education Ministry",payAppr:[],log:[]},', "PO-2879 payment path (anchor check)");
swap('{ref:"PO-2633",vendor:"Back Yard Burgers",dept:"Admin",     amt:15,    issued:"2025-11-01",due:"2025-12-01",path:"Education Ministry",fy:"FY 2025",stage:"Approved",pay:"paid",appr:[{seq:1,user:"Ben Lane",state:"approved",d:"2025-11-02"}],payPath:"Education Ministry",payAppr:[{seq:1,user:"Ben Lane",state:"approved",d:"2025-11-10"}],payDone:true,paid:true,log:[]},',
     '{ref:"PO-2633",vendor:"Back Yard Burgers",dept:"Admin",     amt:15,    issued:"2025-11-01",due:"2025-12-01",path:"Education Ministry",fy:"FY 2025",stage:"Approved",pay:"paid",appr:[],payPath:"Education Ministry",payAppr:[],payDone:true,paid:true,log:[]},', "PO-2633 ($15): released with no approver on either path");
t = t.slice(0, b0) + blk + t.slice(b1);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
