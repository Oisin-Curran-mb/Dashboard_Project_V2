/* One-off, 2026-09-26: W13 Purchasing Management, our block only (kind purchasing-mb, prefix purF).
   Owner: "try this on the OC version". The Kanban is rebuilt on the legacy approval model
   (MBAccounting POOrderRepository): the record has ONE status (Unapproved / Approved / Closed /
   Voided) and TWO ordered approval paths (request, payment) made of Then/Or levels with dollar
   thresholds; "awaiting my approval next" and "awaiting my approval" are computed from the live
   path, never stored; Rejected and Hold are per-approval rows, not states.
     - lanes are derived: Pending approval | Payment approval | Ready to pay | Paid (+ Finish at All)
     - every card carries a turn badge from the live path
     - scope chip with the legacy vocabulary: Awaiting my approval next / Awaiting my approval / All requests
     - the Approvals tab shows one row per level of the live path, boxes enabled on the viewer's level
     - demo data carries acted rows on both paths
   Anchored function-by-function; aborts before writing on any miss. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8"); const log = [];
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const balance = function (s) { let d = 0, q = null; for (let i = 0; i < s.length; i++) { const c = s[i]; if (q) { if (c === "\\") { i++; continue; } if (c === q) q = null; continue; } if (c === "'" || c === '"') { q = c; continue; } if (c === "{") d++; else if (c === "}") d--; } return d; };
function fnSpan(name) { const i = blk.indexOf("function " + name + "("); if (i < 0) throw new Error("fn missing: " + name); const ls = blk.lastIndexOf(NL, i) + NL.length; const firstLineEnd = blk.indexOf(NL, i); const line = blk.slice(ls, firstLineEnd); if (balance(line) === 0) return [ls, firstLineEnd + NL.length]; let e = blk.indexOf(NL + "}" + NL, i); if (e < 0) throw new Error("fn end: " + name); return [ls, e + (NL + "}" + NL).length]; }
function replaceFn(name, code) { const [s, e] = fnSpan(name); blk = blk.slice(0, s) + (Array.isArray(code) ? code.join(NL) : code) + NL + blk.slice(e); log.push("replaced: " + name); }
function removeFn(name) { const [s, e] = fnSpan(name); blk = blk.slice(0, s) + blk.slice(e); log.push("removed: " + name); }
const shift = function (x) { return x.split(NL).map(function (l) { return l.replace(/^ /, ""); }).join(NL); };
function swap(a, b, label) { if (blk.split(a).length !== 2 && blk.split(shift(a)).length === 2) { a = shift(a); b = shift(b); } if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); log.push("edited: " + label); }
function insertAfterFn(name, code) { const [, e] = fnSpan(name); blk = blk.slice(0, e) + (Array.isArray(code) ? code.join(NL) : code) + NL + blk.slice(e); log.push("added after " + name); }

/* ================= constants ================= */
swap('var PURF_STAGES=["Pending","Approved","Rejected"];', [
  '/* Record status vocabulary (legacy PO_Order.Status): Pending = Unapproved (0), Approved (1); Closed (2) and',
  '   Voided (3) are the archive. Rejected is NOT a status: it is a rejected approval row on a Pending request. */',
  'var PURF_STAGES=["Pending","Approved"];',
  '/* Board lanes are derived from the status plus the live approval path (see purFLane). */',
  'var PURF_LANES=["Pending approval","Payment approval","Ready to pay","Paid"];',
  'var PURF_ME="Oisin Curran";',
  'var PURF_SCOPES=["Awaiting my approval next","Awaiting my approval","All requests"];'].join(NL), "stages -> lanes");
swap('  "Rejected":"var(--red-100)",' + NL, '  "Rejected":"var(--red-100)",' + NL + '  "Pending approval":"var(--am-700)",' + NL + '  "Payment approval":"var(--am-500)",' + NL + '  "Ready to pay":"#0b6b4c",' + NL + '  "Paid":"#0b6b4c",' + NL, "lane tones");
(function () {
  const s = blk.indexOf("var PURF_PATH_APPROVERS={"); const e = blk.indexOf("};" + NL, s) + ("};" + NL).length; if (s < 0) throw new Error("PATH_APPROVERS");
  blk = blk.slice(0, s) + [
    '/* Approval paths as the record screen defines them: ordered LEVELS; "Then" opens a new level, "Or" adds an',
    '   interchangeable approver to the same level (any one satisfies it); min = the dollar threshold under which',
    '   that level is skipped. forRequest / forPayment mirror the path list flags. */',
    'var PURF_PATHS={',
    '  "Administration":{forRequest:true,forPayment:true,steps:[{seq:1,users:["Nitzi Wright"],min:0},{seq:2,users:[PURF_ME],min:0}]},',
    '  "Education Ministry":{forRequest:true,forPayment:true,steps:[{seq:1,users:["Ben Lane"],min:0},{seq:2,users:["Marvin Hall"],min:500}]},',
    '  "Everyone":{forRequest:true,forPayment:true,steps:[{seq:1,users:[PURF_ME],min:0}]},',
    '  "QA Path":{forRequest:true,forPayment:true,steps:[{seq:1,users:["Feargal Phelan",PURF_ME],min:0},{seq:2,users:["Nitzi Wright"],min:2000}]}',
    '};',
    'var PURF_PATH_APPROVERS={};Object.keys(PURF_PATHS).forEach(function(k){var out=[];PURF_PATHS[k].steps.forEach(function(st){st.users.forEach(function(u){out.push(u);});});PURF_PATH_APPROVERS[k]=out;});',
    ''].join(NL) + blk.slice(e);
  log.push("paths with levels and thresholds");
})();
(function () {
  const s = blk.indexOf("var PURF_POS=["); const e = blk.indexOf("];" + NL, s) + ("];" + NL).length; if (s < 0) throw new Error("PURF_POS");
  blk = blk.slice(0, s) + [
    '/* Mock purchase orders. appr = acted rows on the request path, payAppr = acted rows on the payment path',
    '   (both {seq,user,state:"approved"|"rejected"|"hold",reason,d}); only acted rows exist, as in the legacy',
    '   table. paid = the AP invoice has posted (derived in the real system). dept, fy and due stay unconfirmed. */',
    'var PURF_POS=[',
    '  {ref:"PO-2893",vendor:"Acme Paper Supply",dept:"Finance",   amt:245,   issued:"2026-07-02",due:"2026-08-01",path:"Administration",    fy:"FY 2026",stage:"Pending",appr:[{seq:1,user:"Nitzi Wright",state:"approved",d:"2026-07-03"}],log:[]},',
    '  {ref:"PO-2897",vendor:"A-1 Advertising",  dept:"Ministry",  amt:1120,  issued:"2026-07-28",due:"2026-08-27",path:"QA Path",           fy:"FY 2026",stage:"Pending",appr:[],log:[]},',
    '  {ref:"PO-2901",vendor:"Back Yard Burgers",dept:"Admin",     amt:87.5,  issued:"2026-08-10",due:"2026-09-09",path:"Everyone",          fy:"FY 2026",stage:"Pending",appr:[],log:[]},',
    '  {ref:"PO-2888",vendor:"IT Direct",        dept:"IT",        amt:2350,  issued:"2026-06-18",due:"2026-07-18",path:"Administration",    fy:"FY 2026",stage:"Pending",appr:[],log:[]},',
    '  {ref:"PO-2899",vendor:"Tech Supplies",    dept:"Ministry",  amt:640,   issued:"2026-08-04",due:"2026-09-03",path:"Education Ministry",fy:"FY 2026",stage:"Pending",appr:[{seq:1,user:"Ben Lane",state:"approved",d:"2026-08-05"}],log:[]},',
    '  {ref:"PO-2904",vendor:"Print Works",      dept:"Finance",   amt:310,   issued:"2026-08-14",due:"2026-09-13",path:"Everyone",          fy:"FY 2026",stage:"Pending",appr:[],log:[]},',
    '  {ref:"PO-2885",vendor:"Facilities Plus",  dept:"Facilities",amt:1975,  issued:"2026-06-05",due:"2026-07-05",path:"Administration",    fy:"FY 2026",stage:"Pending",appr:[{seq:1,user:"Nitzi Wright",state:"approved",d:"2026-06-06"}],log:[]},',
    '  {ref:"PO-2891",vendor:"Catering Co.",     dept:"Ministry",  amt:430,   issued:"2026-07-15",due:"2026-08-14",path:"Education Ministry",fy:"FY 2026",stage:"Pending",hold:true,appr:[{seq:1,user:"Ben Lane",state:"hold",reason:"Waiting on budget confirmation",d:"2026-08-14"}],log:[{d:"2026-08-14",by:"Ben Lane",to:"On hold",note:"Waiting on budget confirmation"}]},',
    '  {ref:"PO-2898",vendor:"Cleaning Svcs",    dept:"Facilities",amt:268,   issued:"2026-08-01",due:"2026-08-31",path:"Everyone",          fy:"FY 2026",stage:"Pending",appr:[],log:[]},',
    '  {ref:"PO-2903",vendor:"Office Depot",     dept:"Admin",     amt:152,   issued:"2026-08-12",due:"2026-09-11",path:"QA Path",           fy:"FY 2026",stage:"Pending",appr:[],log:[]},',
    '  {ref:"PO-2902",vendor:"Catering Co.",     dept:"Ministry",  amt:520,   issued:"2026-08-06",due:"2026-09-05",path:"Administration",    fy:"FY 2026",stage:"Pending",appr:[{seq:1,user:"Nitzi Wright",state:"rejected",reason:"Duplicate of PO-2891",d:"2026-08-12"}],log:[{d:"2026-08-12",by:"Nitzi Wright",to:"Rejected",note:"Duplicate of PO-2891"}]},',
    '  {ref:"PO-2906",vendor:"IT Direct",        dept:"IT",        amt:3150,  issued:"2026-08-15",due:"2026-09-14",path:"QA Path",           fy:"FY 2026",stage:"Pending",appr:[{seq:1,user:"Feargal Phelan",state:"rejected",reason:"Over budget for Q3, resubmit next period",d:"2026-08-17"}],log:[{d:"2026-08-17",by:"Feargal Phelan",to:"Rejected",note:"Over budget for Q3, resubmit next period"}]},',
    '  {ref:"PO-2872",vendor:"Grainger",         dept:"Facilities",amt:890,   issued:"2026-06-11",due:"2026-07-11",path:"Everyone",          fy:"FY 2026",stage:"Approved",pay:"unpaid",appr:[{seq:1,user:PURF_ME,state:"approved",d:"2026-06-12"}],payPath:"Administration",payAppr:[{seq:1,user:"Nitzi Wright",state:"approved",d:"2026-07-01"}],log:[]},',
    '  {ref:"PO-2879",vendor:"Tech Supplies",    dept:"IT",        amt:1540,  issued:"2026-07-06",due:"2026-08-05",path:"QA Path",           fy:"FY 2026",stage:"Approved",pay:"unpaid",appr:[{seq:1,user:"Feargal Phelan",state:"approved",d:"2026-07-07"}],payPath:"Education Ministry",payAppr:[],log:[]},',
    '  {ref:"PO-2861",vendor:"Office Depot",     dept:"Admin",     amt:312,   issued:"2026-06-20",due:"2026-07-20",path:"Administration",    fy:"FY 2026",stage:"Approved",pay:"unpaid",appr:[{seq:1,user:"Nitzi Wright",state:"approved",d:"2026-06-21"},{seq:2,user:PURF_ME,state:"approved",d:"2026-06-22"}],payPath:"Administration",payAppr:[{seq:1,user:"Nitzi Wright",state:"approved",d:"2026-07-02"},{seq:2,user:PURF_ME,state:"approved",d:"2026-07-03"}],payDone:true,log:[]},',
    '  {ref:"PO-2864",vendor:"Acme Paper Supply",dept:"Finance",   amt:45,    issued:"2026-05-09",due:"2026-06-08",path:"Administration",    fy:"FY 2026",stage:"Approved",pay:"paid",type:"Check Request",crNo:"2",crDate:"May 9, 2026",appr:[{seq:1,user:"Nitzi Wright",state:"approved",d:"2026-05-09"},{seq:2,user:PURF_ME,state:"approved",d:"2026-05-09"}],payPath:"Administration",payAppr:[{seq:1,user:"Nitzi Wright",state:"approved",d:"2026-05-10"},{seq:2,user:PURF_ME,state:"approved",d:"2026-05-10"}],payDone:true,paid:true,log:[]},',
    '  {ref:"PO-2610",vendor:"A-1 Advertising",  dept:"Ministry",  amt:140,   issued:"2025-04-04",due:"2025-05-04",path:"Administration",    fy:"FY 2025",stage:"Approved",pay:"paid",appr:[{seq:2,user:PURF_ME,state:"approved",d:"2025-04-05"}],payPath:"Administration",payAppr:[{seq:2,user:PURF_ME,state:"approved",d:"2025-04-20"}],payDone:true,paid:true,log:[]},',
    '  {ref:"PO-2633",vendor:"Back Yard Burgers",dept:"Admin",     amt:15,    issued:"2025-11-01",due:"2025-12-01",path:"Education Ministry",fy:"FY 2025",stage:"Approved",pay:"paid",appr:[{seq:1,user:"Ben Lane",state:"approved",d:"2025-11-02"}],payPath:"Education Ministry",payAppr:[{seq:1,user:"Ben Lane",state:"approved",d:"2025-11-10"}],payDone:true,paid:true,log:[]},',
    '  {ref:"PO-2655",vendor:"Acme Paper Supply",dept:"Finance",   amt:76.25, issued:"2025-09-15",due:"2025-10-15",path:"Everyone",          fy:"FY 2025",stage:"Approved",pay:"paid",appr:[{seq:1,user:PURF_ME,state:"approved",d:"2025-09-16"}],payPath:"Everyone",payAppr:[{seq:1,user:PURF_ME,state:"approved",d:"2025-09-30"}],payDone:true,paid:true,log:[]}',
    '];',
    ''].join(NL) + blk.slice(e);
  log.push("demo orders with acted rows on both paths");
})();

/* ================= the approval model ================= */
insertAfterFn("purFSum", [
  '/* ---- Approval model (ported from the legacy POOrderRepository rules) ------------------------',
  '   purFSteps: the levels of a path that apply to this amount (levels whose threshold is above the',
  '   total are skipped). purFLivePath: which path is running now (request while Pending, payment',
  '   while Approved and not yet approved for payment). purFTurn: whose turn it is, computed the way',
  '   the legacy "awaiting my approval next" / "awaiting my approval" queries do it: next = Max(acted',
  '   Sequence)+1 is my level; mine = I am on the path and have not acted. Rejected and Hold are rows,',
  '   so they surface as badges, never as lanes. ---- */',
  'function purFWho(n){return n===PURF_ME?(n+" (you)"):n;}',
  'function purFSteps(pathName,amt){var p=PURF_PATHS[pathName];if(!p)return [];return p.steps.filter(function(s){return (s.min||0)<=amt;});}',
  'function purFLivePath(po){',
  '  if(po.stage==="Pending")return {kind:"request",path:po.path,acted:po.appr||[]};',
  '  if(po.stage==="Approved"&&!po.payDone&&!po.paid)return {kind:"payment",path:po.payPath||po.path,acted:po.payAppr||[]};',
  '  return null;',
  '}',
  'function purFPathDone(pathName,amt,acted){var steps=purFSteps(pathName,amt);if(!steps.length)return true;var ok=acted.filter(function(a){return a.state==="approved";});if(!ok.length)return false;if(acted.some(function(a){return a.state==="rejected";}))return false;var maxSeq=Math.max.apply(null,ok.map(function(a){return a.seq;}));return steps.every(function(s){return s.seq<=maxSeq;});}',
  'function purFTurn(po){',
  '  var live=purFLivePath(po);',
  '  if(!live){if(po.paid)return {kind:"none",label:"Paid"};if(po.stage==="Approved")return {kind:"none",label:"Approved for payment"};return {kind:"none",label:po.stage};}',
  '  var steps=purFSteps(live.path,po.amt),acted=live.acted,n=steps.length;',
  '  var rej=acted.filter(function(a){return a.state==="rejected";})[0];',
  '  if(rej)return {kind:"rejected",label:"Rejected by "+rej.user+(rej.reason?": "+rej.reason:""),by:rej.user,reason:rej.reason||""};',
  '  var hold=acted.filter(function(a){return a.state==="hold";})[0];',
  '  if(hold||po.hold)return {kind:"hold",label:"On hold"+((hold&&hold.reason)?": "+hold.reason:(purFHoldReason(po)?": "+purFHoldReason(po):"")),by:hold?hold.user:""};',
  '  var maxSeq=acted.length?Math.max.apply(null,acted.map(function(a){return a.seq;})):0;',
  '  var level=null,idx=-1;for(var i=0;i<steps.length;i++){if(steps[i].seq>maxSeq){level=steps[i];idx=i;break;}}',
  '  if(!level)return {kind:"complete",label:live.kind==="request"?"Fully approved":"Approved for payment"};',
  '  var meHere=level.users.indexOf(PURF_ME)>-1;',
  '  var meLater=steps.some(function(s,k){return k>idx&&s.users.indexOf(PURF_ME)>-1;});',
  '  var who=level.users.map(purFWho).join(" or ");',
  '  var pos=" (level "+(idx+1)+" of "+n+(live.kind==="payment"?", payment":"")+")";',
  '  if(meHere)return {kind:"next",label:"Your approval next"+pos,level:level,idx:idx,n:n,live:live};',
  '  if(meLater)return {kind:"mine",label:"Your approval later. Waiting on "+who+pos,level:level,idx:idx,n:n,live:live};',
  '  return {kind:"waiting",label:"Waiting on "+who+pos,level:level,idx:idx,n:n,live:live};',
  '}',
  'function purFNeedsMe(po,scope){var tk=purFTurn(po).kind;if(scope==="Awaiting my approval next")return tk==="next";if(scope==="Awaiting my approval")return tk==="next"||tk==="mine";return true;}',
  'function purFLane(po){',
  '  if(po.stage==="Closed"||po.stage==="Voided")return po.stage;',
  '  if(po.stage==="Pending")return "Pending approval";',
  '  if(po.paid||po.pay==="paid")return "Paid";',
  '  if(po.payDone)return "Ready to pay";',
  '  return "Payment approval";',
  '}',
  'function purFScopeCur(w){return (w.purfScope&&PURF_SCOPES.indexOf(w.purfScope)>-1)?w.purfScope:"All requests";}',
  'function purFTurnBadge(po){var tn=purFTurn(po);if(tn.kind==="none"||tn.kind==="complete")return "";var ic={next:"how_to_reg",mine:"schedule",waiting:"hourglass_top",rejected:"block",hold:"lock"}[tn.kind]||"info";return \'<span class="purf-turn purf-turn-\'+tn.kind+\'">\'+purFIcon(ic)+purFEsc(tn.label)+\'</span>\';}',
  '/* Recording an approval on the live path: any one approver satisfies a level; approving at a higher level',
  '   implicitly approves the lower ones (legacy ApproveOrder). When every level is satisfied the request becomes',
  '   Approved (request path) or approved for payment (payment path). */',
  'function purFMyLevel(po){var tn=purFTurn(po);if(tn.kind!=="next"&&tn.kind!=="mine")return null;var live=tn.live,steps=purFSteps(live.path,po.amt);var mine=steps.filter(function(s){return s.users.indexOf(PURF_ME)>-1&&!live.acted.some(function(a){return a.seq===s.seq&&a.state==="approved";});})[0];return mine?{live:live,step:mine}:null;}',
  'function purFApproveStep(w,po,note){',
  '  var m=purFMyLevel(po);if(!m)return false;',
  '  var acted=m.live.acted;for(var i=acted.length-1;i>=0;i--)if(acted[i].state==="hold")acted.splice(i,1);',
  '  acted.push({seq:m.step.seq,user:PURF_ME,state:"approved",reason:note||"",d:"2026-08-19"});po.hold=false;',
  '  po.log=po.log||[];',
  '  if(purFPathDone(m.live.path,po.amt,acted)){',
  '    if(m.live.kind==="request"){po.stage="Approved";po.pay="unpaid";po.payPath=po.payPath||po.path;po.payAppr=po.payAppr||[];po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:"Approved",note:note||""});}',
  '    else{po.payDone=true;po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:"Approved for payment",note:note||""});}',
  '  }else po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:(m.live.kind==="request"?"Approved level "+m.step.seq:"Payment approved level "+m.step.seq),note:note||""});',
  '  return true;',
  '}',
  'function purFRejectStep(w,po,reason){var live=purFLivePath(po);if(!live)return false;var m=purFMyLevel(po);var seq=m?m.step.seq:(purFSteps(live.path,po.amt)[0]||{seq:1}).seq;live.acted.push({seq:seq,user:PURF_ME,state:"rejected",reason:reason||"unknown",d:"2026-08-19"});po.log=po.log||[];po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:"Rejected",note:reason||""});return true;}',
  'function purFClearReject(po){var live=purFLivePath(po);if(!live)return false;var n=live.acted.length;for(var i=n-1;i>=0;i--)if(live.acted[i].state==="rejected")live.acted.splice(i,1);return live.acted.length!==n;}',
  ''].join(NL));

/* ================= filters ================= */
replaceFn("purFStatusVals", ['function purFStatusVals(w,view){return (view==="table")?["All statuses"].concat(PURF_STAGES,PURF_ARCHIVE):["All statuses"].concat(PURF_LANES);}']);
swap("     if(st!==\"All statuses\"&&p.stage!==st)return;" + NL + "     if(!seen[p.path]){seen[p.path]=1;out.push(p.path);}", "     if(!purFMatchStatus(w,p,st))return;" + NL + "     if(!seen[p.path]){seen[p.path]=1;out.push(p.path);}", "path values follow the status match");
insertAfterFn("purFStatusCur", [
  '/* The status chip means the lane on the board and the record status in the table. */',
  'function purFMatchStatus(w,p,st){if(st==="All statuses")return true;return (purFViewCur(w)==="table")?(p.stage===st):(purFLane(p)===st);}']);
replaceFn("purFRows", [
  '/* The global filters, applied for every view: status (lane or record status), path, and the viewer scope. */',
  'function purFRows(w){',
  '  var st=purFStatusCur(w),pa=purFPathCur(w),sc=purFScopeCur(w);',
  '  return purFDataset(w).filter(function(p){',
  '    if(!purFMatchStatus(w,p,st))return false;',
  '    if(pa!=="All approval paths"&&p.path!==pa)return false;',
  '    if(!purFNeedsMe(p,sc))return false;',
  '    return true;',
  '  });',
  '}']);
replaceFn("purFPendingSet", [
  '/* Headline reads: the requests awaiting the viewer (next or later on the live path), and the pending count. Path-scoped, never status-scoped. */',
  'function purFPendingSet(w){var pa=purFPathCur(w);return purFDataset(w).filter(function(p){return p.stage==="Pending"&&(pa==="All approval paths"||p.path===pa);});}',
  'function purFMineSet(w){var pa=purFPathCur(w);return purFDataset(w).filter(function(p){if(pa!=="All approval paths"&&p.path!==pa)return false;var k=purFTurn(p).kind;return k==="next"||k==="mine";});}']);
replaceFn("purFCardCls", [
  'function purFCardCls(po){',
  '  var tn=purFTurn(po).kind,lane=purFLane(po);',
  '  if(po.hold||tn==="hold")return " purf-card-hold";',
  '  if(tn==="rejected")return " purf-card-rej";',
  '  if(lane==="Paid")return " purf-card-paid";',
  '  if(lane==="Ready to pay")return " purf-card-ok";',
  '  if(tn==="next")return " purf-card-next";',
  '  return "";',
  '}']);
replaceFn("purFCanHold", ['function purFCanHold(po){return !po.hold&&(po.stage==="Pending"||(po.stage==="Approved"&&!po.paid&&po.pay!=="paid"));}']);

/* ================= header, card, board, glance ================= */
replaceFn("purFHeaderBlock", [
  'function purFHeaderBlock(w){',
  '  var view=purFViewCur(w),tier=purFTier(w),loading=!!w.purfLoading;',
  '  var mine=purFMineSet(w).length,pending=purFPendingCount(w),outstanding=purFSum(purFPendingSet(w));',
  '  var setRows=(view==="table")?purFTableRows(w):purFBoardRows(w);',
  '  var chips=purFChip(w,"scope",purFScopeCur(w),"Viewer scope, currently "+purFScopeCur(w),false);',
  '  chips+=purFChip(w,"status","Status: "+purFStatusCur(w),"PO status, currently "+purFStatusCur(w),loading);',
  '  if(purFPathVals(w).length>1)chips+=purFChip(w,"path",purFPathCur(w),"Approval path, currently "+purFPathCur(w),false);',
  '  if(view==="table"&&tier==="xwide"){',
  '    chips+=purFChip(w,"dept",purFDeptCur(w),"Department, Table view only, currently "+purFDeptCur(w),false);',
  '    chips+=purFChip(w,"year",purFYearCur(w),"Year, Table view only, currently "+purFYearCur(w),false);',
  '    chips+=purFOvChip(w);',
  '  }',
  '  var kpi=loading',
  '    ? \'<div class="dep-hd-kpigrp"><span class="sk" style="width:44px;height:24px;border-radius:6px"></span><span class="sk" style="width:150px;height:15px;border-radius:6px"></span></div>\'',
  '    : \'<div class="dep-hd-kpigrp"><span class="metric-value">\'+mine+\'</span><span class="bank-pill">\'+(mine===1?"needs":"need")+\' your approval</span></div>\';',
  '  var ctx=loading?"":\'<div class="purf-ctx">\'+pending+\' pending approval, \'+purFMoney(outstanding)+\' outstanding. \'+setRows.length+\' request\'+(setRows.length===1?"":"s")+\' in view.</div>\';',
  '  return \'<div class="dep-hd purf-hd">\'+',
  '    \'<div class="dep-hd-top"><div class="purf-chiprow">\'+chips+\'</div><div class="dep-hd-toggle">\'+purFViewToggle(w)+\'</div></div>\'+',
  '    \'<div class="dep-hd-num"><div class="purf-numwrap">\'+kpi+ctx+\'</div></div>\'+',
  '  \'</div>\';',
  '}']);
replaceFn("purFCard", [
  '/* One card, on her .pur-kcard component, plus our turn badge: who has to act, from the live path. Only a',
  '   card the viewer can act on is draggable. */',
  'function purFCanDrag(po){var k=purFTurn(po).kind,lane=purFLane(po);if(po.hold)return false;return k==="next"||k==="mine"||lane==="Ready to pay"||lane==="Paid";}',
  'function purFCard(w,po){',
  '  var ov=purFOverdue(po),age=purFAgeLabel(po),tn=purFTurn(po),hr=purFHoldReason(po),can=purFCanDrag(po);',
  '  var lbl=po.ref+", "+po.vendor+", "+purFMoney(po.amt)+", "+age+(ov?", overdue":"")+". "+tn.label+". "+',
  '    (can?"Open the purchase order record, or drag the card to the next column to action it.":"Open the purchase order record.");',
  '  return \'<button class="pur-kcard purf-card\'+purFCardCls(po)+\'" draggable="\'+(can?"true":"false")+\'" data-purf="open" data-purf-ref="\'+purFEsc(po.ref)+\'" data-purf-card="\'+purFEsc(po.ref)+\'" data-id="\'+w.id+\'" aria-label="\'+purFEsc(lbl)+\'">\'+',
  '    \'<span class="pur-kc-top"><span class="pur-kc-num">\'+po.ref+\'</span><span class="pur-kc-amt">\'+purFMoney(po.amt)+\'</span></span>\'+',
  '    \'<span class="pur-kc-vendor">\'+purFEsc(po.vendor)+\'</span>\'+',
  '    \'<span class="purf-card-age\'+(ov?" purf-age-hot":"")+\'">\'+purFIcon("schedule")+age+(ov?", overdue":"")+\'</span>\'+',
  '    purFTurnBadge(po)+',
  '  \'</button>\';',
  '}']);
replaceFn("purFBoard", [
  '/* The board. Lanes are the lifecycle stages derived from the record status and the live approval path;',
  '   the status filter shows one lane. The split Finish column (Close / Void) appears only at "All statuses". */',
  'function purFBoard(w){',
  '  var rows=purFBoardRows(w),st=purFStatusCur(w),tier=purFTier(w);',
  '  var lanes=(st==="All statuses")?PURF_LANES:[st];',
  '  var cap=(tier==="wide")?PURF_CAP_BOARD_WIDE:9999;',
  '  var finish=(st==="All statuses");',
  '  var empty={"Pending approval":"Nothing awaiting approval","Payment approval":"Nothing awaiting payment approval","Ready to pay":"Nothing ready to pay","Paid":"Nothing paid yet"};',
  '  var cols=lanes.map(function(s){',
  '    var sp=rows.filter(function(p){return purFLane(p)===s;});',
  '    var cards=sp.slice(0,cap).map(function(po){return purFCard(w,po);}).join("");',
  '    if(!sp.length)cards=\'<div class="pur-kempty">\'+(empty[s]||"None")+\'</div>\';',
  '    else if(sp.length>cap)cards+=\'<button class="purf-more" data-purf="more" data-id="\'+w.id+\'">+\'+(sp.length-cap)+\' more, view in the PO Table</button>\';',
  '    return \'<div class="pur-kcol purf-col"><div class="pur-kcol-h"><span class="pur-kcol-t" style="color:\'+(PURF_STAGE_TONE[s]||"inherit")+\'">\'+s+\'</span><span class="pur-kcol-n">\'+sp.length+\'</span></div>\'+',
  '      \'<div class="pur-kcol-b purf-colb" data-purf-drop="\'+s+\'" data-id="\'+w.id+\'">\'+cards+\'</div></div>\';',
  '  }).join("");',
  '  var fin=finish',
  '    ? \'<div class="purf-finish" role="group" aria-label="Finish: drop a card here to close or void it">\'+',
  '        \'<div class="purf-fin-half purf-fin-close" data-purf-drop="Closed" data-id="\'+w.id+\'">\'+purFIcon("task_alt")+\'<span class="purf-fin-t">Close</span><span class="purf-fin-s">paid orders only</span></div>\'+',
  '        \'<div class="purf-fin-half purf-fin-void" data-purf-drop="Voided" data-id="\'+w.id+\'">\'+purFIcon("block")+\'<span class="purf-fin-t">Void</span><span class="purf-fin-s">unpaid only</span></div>\'+',
  '      \'</div>\'',
  '    : "";',
  '  var gtc="repeat("+lanes.length+",1fr)"+(finish?" 0.6fr":"");',
  '  return \'<div class="pur-kanban purf-board" data-purf-tier="\'+tier+\'" style="grid-template-columns:\'+gtc+\'">\'+cols+fin+\'</div>\';',
  '}']);
replaceFn("purFGlance", [
  'function purFGlance(w){',
  '  var pa=purFPathCur(w),pos=purFDataset(w).filter(function(p){return pa==="All approval paths"||p.path===pa;});',
  '  var mine=purFMineSet(w).length,pending=purFPendingCount(w),outstanding=purFSum(purFPendingSet(w));',
  '  var cards=["Pending approval","Payment approval","Ready to pay"].map(function(s){',
  '    var n=pos.filter(function(p){return purFLane(p)===s;}).length;',
  '    return \'<div class="purf-gcard" data-purf-stage="\'+s+\'"><span class="purf-gnum" style="color:\'+PURF_STAGE_TONE[s]+\'">\'+n+\'</span><span class="purf-glbl">\'+s.replace("Pending approval","Pending").replace("Payment approval","Payment").replace("Ready to pay","Ready")+\'</span></div>\';',
  '  }).join("");',
  '  return \'<div class="kpi-row"><div class="kpi-num">\'+',
  '    \'<div class="dep-hd-kpigrp"><span class="metric-value">\'+mine+\'</span><span class="bank-pill">\'+(mine===1?"needs":"need")+\' your approval</span></div>\'+',
  '    \'<div class="purf-glance">\'+cards+\'</div>\'+',
  '    \'<div class="gl-sub"><span class="bank-caption">\'+pending+\' pending, \'+purFMoney(outstanding)+\' outstanding</span></div>\'+',
  '  \'</div></div>\';',
  '}']);
/* table: the status cell names the lane for live records */
swap("       '<span class=\"purf-c-st\" role=\"cell\"><span class=\"purf-chip-st\" style=\"color:'+PURF_STAGE_TONE[po.stage]+'\">'+po.stage+'</span>'+",
     "       '<span class=\"purf-c-st\" role=\"cell\"><span class=\"purf-chip-st\" style=\"color:'+(PURF_STAGE_TONE[purFLane(po)]||PURF_STAGE_TONE[po.stage])+'\">'+purFLane(po)+'</span>'+purFTurnBadge(po)+", "table status cell shows the lane and the turn");
swap("         (po.hold?'<span class=\"purf-holdflag\">'+purFIcon(\"lock\")+'On hold</span>':\"\")+purFPayBadge(po)+'</span>'+", "         '</span>'+", "table: hold and pay flags are in the turn badge");

/* ================= popover: scope ================= */
swap("   if(t===\"status\"){" + NL + "     var cs=purFStatusCur(w),vals=purFStatusVals(w,purFViewCur(w));",
     "   if(t===\"scope\"){" + NL +
     "     var sc=purFScopeCur(w);" + NL +
     "     return '<div class=\"cap\">Show</div>'+PURF_SCOPES.map(function(v){return row(\"set-scope\",v,v,sc===v,v===\"All requests\"?\"\":\"how_to_reg\");}).join(\"\")+" + NL +
     "       '<div class=\"mi-note purf-popnote\">Awaiting my approval next: your level is the next one on the live path. Awaiting my approval: you are on the path and have not acted yet, wherever your level sits.</div>';" + NL +
     "   }" + NL +
     "   if(t===\"status\"){" + NL + "     var cs=purFStatusCur(w),vals=purFStatusVals(w,purFViewCur(w));", "scope popover");
swap("   if(a===\"status\"||a===\"path\"||a===\"dept\"||a===\"year\"){purFOpenPop(a,id,t);return;}",
     "   if(a===\"status\"||a===\"path\"||a===\"dept\"||a===\"year\"||a===\"scope\"){purFOpenPop(a,id,t);return;}" + NL +
     "   if(a===\"set-scope\"){if(w&&purFScopeCur(w)!==v){w.purfScope=v;}purFClosePop();render();return;}", "scope handler");

/* ================= moves ================= */
replaceFn("purFApplyMove", [
  '/* A lane-to-lane move is an approval act on the live path, a payment entry, or a close / void. purFMoveCheck',
  '   names why a move is refused; purFApplyMove performs it. */',
  'function purFMoveCheck(po,to){',
  '  var from=purFLane(po),tn=purFTurn(po);',
  '  if(po.stage==="Closed"||po.stage==="Voided")return {ok:false,msg:"Closed and voided orders are final."};',
  '  if(from===to)return {ok:false,msg:""};',
  '  if(po.hold&&to!=="Voided")return {ok:false,msg:"On hold: remove the hold on "+po.ref+" before moving it."};',
  '  if(to==="Closed")return (from==="Paid")?{ok:true}:{ok:false,msg:"Only paid orders can be closed. "+po.ref+" is not paid."};',
  '  if(to==="Voided")return (from==="Paid")?{ok:false,msg:"A paid order cannot be voided here. Reverse the check in Accounts Payable first."}:{ok:true};',
  '  if(from==="Pending approval"&&to==="Payment approval"){if(tn.kind==="rejected")return {ok:false,msg:po.ref+" is rejected. Clear the rejection on the Approvals tab first."};return (tn.kind==="next"||tn.kind==="mine")?{ok:true}:{ok:false,msg:"Not your approval: "+tn.label+"."};}',
  '  if(from==="Payment approval"&&to==="Ready to pay")return (tn.kind==="next"||tn.kind==="mine")?{ok:true}:{ok:false,msg:"Not your payment approval: "+tn.label+"."};',
  '  if(from==="Ready to pay"&&to==="Paid")return {ok:true};',
  '  return {ok:false,msg:"A request moves one lane at a time: "+from+" to "+PURF_LANES[PURF_LANES.indexOf(from)+1]+"."};',
  '}',
  'function purFApplyMove(w,ref,to,note){',
  '  var po=purFPO(w,ref);if(!po)return false;',
  '  var c=purFMoveCheck(po,to);if(!c.ok)return false;',
  '  var from=purFLane(po);',
  '  if(to==="Closed"||to==="Voided"){po.stage=to;po.log=po.log||[];po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:to,note:note||""});return true;}',
  '  if(from==="Ready to pay")return purFPaySubmit(w,ref);',
  '  return purFApproveStep(w,po,note);',
  '}']);
replaceFn("purFDrop", [
  'function purFDrop(e){',
  '  var z=e.target.closest&&e.target.closest("[data-purf-drop]");',
  '  if(!z)return;',
  '  if(e.preventDefault)e.preventDefault();',
  '  if(z.classList&&z.classList.remove)z.classList.remove("purf-dragover");',
  '  var to=z.getAttribute("data-purf-drop"),d=PURF_DRAG;',
  '  PURF_DRAG=null;',
  '  if(!d)return;',
  '  var w=find(d.id),po=w?purFPO(w,d.ref):null;',
  '  if(!po)return;',
  '  var c=purFMoveCheck(po,to);',
  '  if(!c.ok){if(c.msg)setStatus(c.msg);return;}',
  '  PURF_MOVE={id:d.id,ref:d.ref,to:to,from:purFLane(po),note:""};',
  '  purFRenderModal();',
  '}']);
swap("   if(po.hold){" + NL + "     if(e.preventDefault)e.preventDefault();" + NL + "     PURF_DRAG=null;" + NL + "     setStatus(\"On hold: remove the hold on \"+po.ref+\" before moving it.\");" + NL + "     return;" + NL + "   }",
     "   if(!purFCanDrag(po)){" + NL + "     if(e.preventDefault)e.preventDefault();" + NL + "     PURF_DRAG=null;" + NL + "     setStatus(po.hold?(\"On hold: remove the hold on \"+po.ref+\" before moving it.\"):(\"Not your turn: \"+purFTurn(po).label+\".\"));" + NL + "     return;" + NL + "   }", "drag start guard follows the turn");
/* move dialog wording */
swap("   var title=isCl?(\"Close \"+po.ref):(isVd?(\"Void \"+po.ref):(\"Move \"+po.ref+\" to \"+to));" + NL + "   var btn=isCl?\"Close order\":(isVd?\"Void order\":\"Confirm move\");",
     "   var isPay=(to===\"Paid\"),tn=purFTurn(po);" + NL +
     "   var title=isCl?(\"Close \"+po.ref):(isVd?(\"Void \"+po.ref):(isPay?(\"Submit \"+po.ref+\" for payment\"):(\"Approve \"+po.ref)));" + NL +
     "   var btn=isCl?\"Close order\":(isVd?\"Void order\":(isPay?\"Submit for payment\":\"Approve\"));", "move dialog title");
swap("     :\"This mirrors the Reason field on the record screen's Approvals tab. In the real build it calls the approval API, which does not exist yet.\");",
     "     :(isPay?\"Records the payment entry on the Payment Approval tab; the check number and date come from Accounts Payable.\":(\"Records your approval on \"+(tn.live?tn.live.path:po.path)+(tn.level?\", level \"+(tn.idx+1)+\" of \"+tn.n:\"\")+\". Any one approver satisfies a level; when every level is satisfied the request moves on. In the real build this calls the approval API, which does not exist yet.\")));", "move dialog note");
swap("   var ph=isCl?\"Why is this order being closed? (optional)\":(isVd?\"Why is this order being voided?\":(to===\"Rejected\"?\"Why is this request being rejected?\":\"Add a note for the record (optional)\"));",
     "   var ph=isCl?\"Why is this order being closed? (optional)\":(isVd?\"Why is this order being voided?\":\"Add a note for the record (optional)\");", "move dialog placeholder");
swap("purFEsc(po.vendor+\", \"+purFMoney(po.amt)+\", currently \"+po.stage+((po.stage===\"Approved\"&&po.pay)?\", \"+(po.pay===\"paid\"?\"paid\":\"not paid\"):\"\"))",
     "purFEsc(po.vendor+\", \"+purFMoney(po.amt)+\", \"+purFLane(po))", "move dialog subtitle");
swap("       if(wm&&purFApplyMove(wm,PURF_MOVE.ref,PURF_MOVE.to,note))setStatus(PURF_MOVE.ref+\" moved to \"+PURF_MOVE.to+\".\");",
     "       if(wm&&purFApplyMove(wm,PURF_MOVE.ref,PURF_MOVE.to,note)){var pm=purFPO(wm,PURF_MOVE.ref);setStatus(PURF_MOVE.ref+\": \"+(pm?purFTurn(pm).label:\"updated\")+\".\");}", "move confirm status");

/* ================= Approvals tab: one row per level of the live path ================= */
(function () {
  const s = blk.indexOf("  }else if(tab===\"approvals\"){"); const e = blk.indexOf("  }else if(tab===\"attachments\"){", s); if (s < 0 || e < 0) throw new Error("approvals tab span");
  blk = blk.slice(0, s) + [
    '   }else if(tab==="approvals"){',
    '     var locked=po.paid||po.pay==="paid"||po.stage==="Closed"||po.stage==="Voided";',
    '     var box=function(kind,on,lbl,off,seq){',
    '       return \'<button class="purf-box\'+(on?" on":"")+\'" role="checkbox" aria-checked="\'+on+\'" aria-label="\'+purFEsc(lbl)+\'"\'+(off?\' aria-disabled="true"\':\'\')+',
    '         \' data-purf="appr-box" data-k="\'+kind+\'" data-v="\'+(on?"off":"on")+\'" data-seq="\'+seq+\'" data-purf-ref="\'+purFEsc(po.ref)+\'" data-id="\'+w.id+\'">\'+purFIcon(on?"check_box":"check_box_outline_blank")+\'</button>\';',
    '     };',
    '     var apGrid=function(title,pathName,acted,live){',
    '       var steps=purFSteps(pathName,po.amt),all=PURF_PATHS[pathName]?PURF_PATHS[pathName].steps:[];',
    '       var rows=all.map(function(st,i){',
    '         var skipped=steps.indexOf(st)<0,rowsHere=acted.filter(function(a){return a.seq===st.seq;});',
    '         var ap=rowsHere.filter(function(a){return a.state==="approved";})[0],rj=rowsHere.filter(function(a){return a.state==="rejected";})[0],hd=rowsHere.filter(function(a){return a.state==="hold";})[0];',
    '         var maxOk=acted.filter(function(a){return a.state==="approved";}).reduce(function(m,a){return Math.max(m,a.seq);},0);',
    '         var implied=!ap&&maxOk>=st.seq;',
    '         var meHere=st.users.indexOf(PURF_ME)>-1,canAct=live&&meHere&&!locked&&!skipped;',
    '         var who=(i===all.length-1?"Ends with ":(i===0?"Starts with ":"Then "))+st.users.map(purFWho).join(" or ")+((st.min||0)>0?" (from "+purFMoney(st.min)+")":"");',
    '         var upd=(ap||rj||hd)?((ap||rj||hd).user+" "+purFFmtDate((ap||rj||hd).d)):(implied?"Implied by a higher level":(skipped?"Skipped: below this level\'s threshold":""));',
    '         return \'<div class="wt-row purf-aprow\'+(skipped?" purf-ap-skip":"")+(canAct?" purf-ap-me":"")+\'" role="row"><span class="lr-main" role="cell">\'+purFEsc(who)+\'</span>\'+',
    '           \'<span class="purf-a-b" role="cell">\'+box("approve",!!ap||implied,"Approved",!canAct,st.seq)+\'</span>\'+',
    '           \'<span class="purf-a-b" role="cell">\'+box("reject",!!rj,"Rejected",!canAct,st.seq)+\'</span>\'+',
    '           \'<span class="purf-a-r" role="cell">\'+(canAct?\'<input class="purf-fin" type="text" id="purfApprReason" value="\'+purFEsc(rj?rj.reason:"")+\'" aria-label="Approval reason" placeholder="Reason">\':purFEsc(rj?rj.reason:""))+\'</span>\'+',
    '           \'<span class="purf-a-b" role="cell">\'+box("hold",!!(hd||(po.hold&&meHere)),"Hold",!canAct,st.seq)+\'</span>\'+',
    '           \'<span class="purf-a-r" role="cell">\'+(canAct?\'<input class="purf-fin" type="text" id="purfHoldReason" value="\'+purFEsc(hd?hd.reason:purFHoldReason(po))+\'" aria-label="Hold reason" placeholder="Reason">\':purFEsc(hd?hd.reason:""))+\'</span>\'+',
    '           \'<span class="purf-a-u" role="cell">\'+purFEsc(upd)+\'</span></div>\';',
    '       }).join("");',
    '       return \'<div class="purf-flbl">\'+purFEsc(title)+\'</div><div class="purf-apgrid" role="table" aria-label="\'+purFEsc(title)+\'">\'+',
    '         \'<div class="wt-row wt-head purf-aprow" role="row"><span class="lr-main" role="columnheader">Approval Needed By</span><span class="purf-a-b" role="columnheader">Approved</span><span class="purf-a-b" role="columnheader">Rejected</span><span class="purf-a-r" role="columnheader">Reason</span><span class="purf-a-b" role="columnheader">Hold</span><span class="purf-a-r" role="columnheader">Reason</span><span class="purf-a-u" role="columnheader">Approval Updated By</span></div>\'+rows+\'</div>\';',
    '     };',
    '     var live=purFLivePath(po),tnA=purFTurn(po);',
    '     body+=\'<div class="purf-turnline purf-turn-\'+tnA.kind+\'">\'+purFIcon(tnA.kind==="next"?"how_to_reg":tnA.kind==="rejected"?"block":tnA.kind==="hold"?"lock":"account_tree")+purFEsc(tnA.label)+\'</div>\';',
    '     body+=apGrid("Approval Path: "+po.path,po.path,po.appr||[],!!live&&live.kind==="request");',
    '     if(po.stage!=="Pending")body+=apGrid("Payment Approval Path: "+(po.payPath||po.path),po.payPath||po.path,po.payAppr||[],!!live&&live.kind==="payment");',
    '     body+=\'<div class="purf-mnote">Any one approver satisfies a level, and approving at a higher level implies the lower ones, as on the record screen. Boxes are enabled on your own level only. Rejected and Hold are recorded on the approval row; the request stays Unapproved until the rejection is cleared. Approvals are kept for this session only: no dashboard write API exists yet.</div>\';',
    ''].join(NL) + blk.slice(e);
  log.push("Approvals tab: per-level grid for both paths");
})();
/* appr-box handler acts on the live path */
(function () {
  const s = blk.indexOf('  if(a==="appr-box"){'); const e = blk.indexOf('  if(a==="hold-open"){', s); if (s < 0 || e < 0) throw new Error("appr-box span");
  blk = blk.slice(0, s) + [
    '   /* The Approvals grid drives the card through the SAME rules as drag: my level on the live path. */',
    '   if(a==="appr-box"){',
    '     if(!w||!ref)return;',
    '     var p2=purFPO(w,ref),k2=t.getAttribute("data-k"),on=(v==="on");',
    '     if(!p2)return;',
    '     if(t.getAttribute("aria-disabled")==="true"){setStatus("Not your level: "+purFTurn(p2).label+".");return;}',
    '     var reason=purFReadField("purfApprReason"),hreason=purFReadField("purfHoldReason"),done=false;',
    '     if(k2==="approve"){if(on){if(purFTurn(p2).kind==="rejected"){purFClearReject(p2);}done=purFApproveStep(w,p2,reason);}else{var lv=purFLivePath(p2)||{acted:[]};var before=lv.acted.length;for(var q=before-1;q>=0;q--)if(lv.acted[q].user===PURF_ME&&lv.acted[q].state==="approved")lv.acted.splice(q,1);done=lv.acted.length!==before;if(done){p2.log=p2.log||[];p2.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:"Approval unticked",note:""});}}}',
    '     else if(k2==="reject"){done=on?purFRejectStep(w,p2,reason):purFClearReject(p2);}',
    '     else if(k2==="hold")done=purFApplyHold(w,ref,on?"hold":"unhold",hreason);',
    '     if(done)setStatus(p2.ref+": "+purFTurn(p2).label+".");',
    '     purFRenderModal();render();return;',
    '   }',
    ''].join(NL) + blk.slice(e);
  log.push("appr-box handler on the live path");
})();
/* hold row on the live path */
swap("   po.hold=(mode===\"hold\");" + NL + "   po.log=po.log||[];" + NL + "   po.log.push({d:\"2026-08-19\",by:\"Oisin Curran (you)\",to:(mode===\"hold\"?\"On hold\":\"Hold removed\"),note:note||\"\"});",
     "   po.hold=(mode===\"hold\");" + NL + "   var lv=purFLivePath(po);if(lv){for(var q=lv.acted.length-1;q>=0;q--)if(lv.acted[q].state===\"hold\")lv.acted.splice(q,1);if(mode===\"hold\"){var ml=purFMyLevel(po);lv.acted.push({seq:ml?ml.step.seq:(purFSteps(lv.path,po.amt)[0]||{seq:1}).seq,user:PURF_ME,state:\"hold\",reason:note||\"unknown\",d:\"2026-08-19\"});}}" + NL + "   po.log=po.log||[];" + NL + "   po.log.push({d:\"2026-08-19\",by:purFWho(PURF_ME),to:(mode===\"hold\"?\"On hold\":\"Hold removed\"),note:note||\"\"});", "hold recorded as a row");
/* pay submit marks paid */
swap("   po.pay=\"paid\";" + NL + "   po.log=po.log||[];" + NL + "   po.log.push({d:\"2026-08-19\",by:\"Oisin Curran (you)\",to:\"Paid\",note:\"Submitted for payment approval: \"+nos.join(\", \")});" + NL + "   setStatus(\"Submitted \"+po.ref+\" for payment approval. Its card is now green (paid).\");",
     "   po.pay=\"paid\";po.paid=true;po.payDone=true;" + NL + "   po.log=po.log||[];" + NL + "   po.log.push({d:\"2026-08-19\",by:purFWho(PURF_ME),to:\"Paid\",note:\"Payment entered: \"+nos.join(\", \")});" + NL + "   setStatus(\"Payment entered for \"+po.ref+\". Its card moves to Paid.\");", "pay submit");
swap("   if(!po||po.stage!==\"Approved\"||po.pay===\"paid\")return false;" + NL + "   if(po.hold){setStatus(\"On hold: remove the hold on \"+po.ref+\" before submitting it for payment.\");return false;}",
     "   if(!po||po.stage!==\"Approved\"||po.pay===\"paid\"||po.paid)return false;" + NL + "   if(!po.payDone){setStatus(purFTurn(po).label+\": payment approval must finish before a payment is entered.\");return false;}" + NL + "   if(po.hold){setStatus(\"On hold: remove the hold on \"+po.ref+\" before submitting it for payment.\");return false;}", "pay submit requires payment approval");
/* opening a record: Payment approval / Ready to pay land on the right tab */
swap("   var tab=(po.stage===\"Approved\"&&po.pay===\"unpaid\")?\"payment\":\"detail\";", "   var lane=purFLane(po);var tab=(lane===\"Ready to pay\")?\"payment\":((lane===\"Pending approval\"||lane===\"Payment approval\")&&purFTurn(po).kind!==\"waiting\"?\"approvals\":\"detail\");", "open record tab");
/* record status vocabulary: Rejected is not a status */
swap('   if(po.stage==="Voided")return "Voided";' + NL + '   return (po.stage==="Approved")?"Approved":"Unapproved";', '   if(po.stage==="Voided")return "Voided";' + NL + '   return (po.stage==="Approved")?"Approved":"Unapproved";', "record status unchanged");
swap("      body+=(po.stage===\"Rejected\")", "      body+=(purFTurn(po).kind===\"rejected\")", "payment tab: rejected is a row, not a stage");
/* about text */
(function () { const i = blk.indexOf("var PURF_ABOUT="); if (i < 0) throw new Error("about"); const e = blk.indexOf(NL, i); blk = blk.slice(0, i) + 'var PURF_ABOUT="Purchase requests moving through approval to payment. Lanes follow the record: pending approval on its approval path, payment approval on its payment path, ready to pay, paid; closed and voided orders stay in the table. Each card says whose approval is next; drag a request you can act on to the next lane, or open it for the record.";' + blk.slice(e); log.push("about text"); })();
t = t.slice(0, b0) + blk + t.slice(b1);

/* ================= CSS ================= */
const cEnd = "/* ===== end W13 Purchasing Management V2 CSS ===== */"; if (t.split(cEnd).length !== 2) throw new Error("css end");
t = t.replace(cEnd, [
  "  /* turn badge: whose approval is next, from the live path */",
  "  .purf-root .purf-turn{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:600;line-height:1.3;border-radius:8px;padding:2px 7px;max-width:100%;white-space:normal;text-align:left;}",
  "  .purf-root .purf-turn .material-symbols-rounded{font-size:13px;flex:0 0 auto;}",
  "  .purf-root .purf-turn-next{background:var(--am-100);color:var(--am-700);}",
  "  .purf-root .purf-turn-mine{background:var(--wn-100);color:var(--txt-secondary);}",
  "  .purf-root .purf-turn-waiting{background:var(--wn-100);color:var(--txt-subtle);}",
  "  .purf-root .purf-turn-rejected{background:var(--red-10);color:var(--red-100);}",
  "  .purf-root .purf-turn-hold{background:#fdf6e3;color:#7a5300;}",
  "  .purf-root .purf-card-next{border-color:var(--am-400);box-shadow:inset 3px 0 0 var(--am-500);}",
  "  .purf-root .purf-card[draggable=\"false\"]{cursor:pointer;}",
  "  .purf-root .purf-turnline{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;margin:2px 0 10px;padding:6px 10px;border-radius:8px;background:var(--wn-100);color:var(--txt-secondary);}",
  "  .purf-root .purf-turnline .material-symbols-rounded{font-size:16px;}",
  "  .purf-root .purf-turnline.purf-turn-next{background:var(--am-100);color:var(--am-700);}",
  "  .purf-root .purf-turnline.purf-turn-rejected{background:var(--red-10);color:var(--red-100);}",
  "  .purf-root .purf-turnline.purf-turn-hold{background:#fdf6e3;color:#7a5300;}",
  "  .purf-root .purf-ap-skip{opacity:.55;}",
  "  .purf-root .purf-ap-me{background:var(--am-50,var(--wn-100));}",
  "  .purf-root .purf-apgrid+.purf-flbl{margin-top:14px;}",
  cEnd].join(NL));
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const code = t.slice(t.indexOf(B0), t.indexOf(BEND)).replace(/\/\*[\s\S]*?\*\//g, "");
['stage==="Rejected"', '"Rejected"]', "PURF_PATH_APPROVERS[po.path]||[]", "Oisin Curran (you)\""].forEach(function (n) { if (code.indexOf(n) > -1) throw new Error("leftover: " + n); });
fs.writeFileSync(FILE, t, "utf8");
log.forEach(function (l) { console.log("  " + l); }); console.log("done: " + t.split(NL).length + " lines");

// Same day: the Approvals grid helper is apGrid, not grid: purFModalHTML already uses a function-scoped
// variable named grid for the Detail line grid, and the shadowing put the helper's source into the modal HTML.
