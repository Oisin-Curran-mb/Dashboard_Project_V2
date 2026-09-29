/* One-off, 2026-09-28, owner: "could you make the Kanban not care about payments just show the approval
   paths ... just show tickets and show where they are in the path of the kanban depending on what
   approval path. is selected", with "Names only but think of Ideas of showing the threshold limits".

   Part B of three: the board becomes the approval path.
     - purFCols(w) is the new column list. With the payment process ON it returns the four lanes as
       objects whose title and tone reproduce today's markup byte for byte, so nothing about the payment
       board changes. With it OFF it returns one column per level of the SELECTED path, in Sequence
       order, then Approved.
     - purFColOf(po) places a card: the lane when the process is on, otherwise the level that has to act
       next, taken from the record's own path. purFOpenLevel computes that level from the acted rows
       WITHOUT purFTurn's rejected and hold short circuits, so a rejected or held card still sits in the
       column it is parked at, and a request no level applies to (PO-2907 at $430) sits in the first
       column carrying its "Approve to release" badge.
     - Thresholds show three ways: a muted sub-line in the header ("from $500"), the full legacy
       "Starts with / Then / Ends with ... from $N" wording as the column's accessible name
       (POOrder.cs:120-166), and a dimmed column reading "Not required under $5,000" when the level's
       minimum is above every amount on the board, which is the skip rule made visible in behaviour.
     - The board needs one concrete path, so on it the path chip lists every path, offers no
       "All approval paths" and defaults to the first (owner, 28 Sep).
     - The columns ARE the status axis now, so the status chip is not offered on the path board and the
       Finish column always shows. A stored lane falls back through the existing purFStatusCur guard. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* 1. a compact money form for the threshold line: the shell's money() gives $500, not $500.00 */
swap('function purFMoney(n){return moneyFull(n);}',
  'function purFMoney(n){return moneyFull(n);}' + NL +
  '/* Thresholds read as whole dollars in a column header; every other figure keeps two decimals. */' + NL +
  'function purFMoneyShort(n){return money(n);}', "purFMoneyShort helper");

/* 2. the column model, after purFLane */
swap('  return "Payment approval";' + NL + '}' + NL,
  '  return "Payment approval";' + NL + '}' + NL +
  '/* The level that has to act next on the request path, read straight off the acted rows so it is' + NL +
  '   defined even for a rejected or held card (purFTurn returns those kinds before it gets this far).' + NL +
  '   No acted rows gives the first level, which is also where a request that no level applies to sits. */' + NL +
  'function purFOpenLevel(po){' + NL +
  '  var p=PURF_PATHS[po.path];if(!p||!p.steps.length)return null;' + NL +
  '  var acted=po.appr||[],maxSeq=acted.length?Math.max.apply(null,acted.map(function(a){return a.seq;})):0;' + NL +
  '  for(var i=0;i<p.steps.length;i++)if(p.steps[i].seq>maxSeq)return {no:i+1,step:p.steps[i]};' + NL +
  '  return {no:p.steps.length,step:p.steps[p.steps.length-1]};' + NL +
  '}' + NL +
  '/* Which column a record sits in: the lane with the payment process on, otherwise the open level of' + NL +
  '   the record\'s OWN path (the board shows one path, so there is no ambiguity) and Approved once the' + NL +
  '   path is complete, because with no payment process the request leaves for Accounts Payable. */' + NL +
  'function purFColOf(po){' + NL +
  '  if(PURF_USE_PAY)return purFLane(po);' + NL +
  '  if(po.stage!=="Pending")return "Approved";' + NL +
  '  var L=purFOpenLevel(po);' + NL +
  '  return "Level "+(L?L.no:1);' + NL +
  '}' + NL +
  'function purFColNo(key){return (key==="Approved")?9999:(/^Level [0-9]+$/.test(key)?+key.slice(6):0);}' + NL +
  '/* The board columns. Payment lanes keep their exact markup; path levels add the threshold sub-line' + NL +
  '   and carry the legacy "Starts with / Then / Ends with" wording as their accessible name. */' + NL +
  'function purFCols(w){' + NL +
  '  if(PURF_USE_PAY){' + NL +
  '    var st=purFStatusCur(w);' + NL +
  '    var empty={"Pending approval":"Nothing awaiting approval","Payment approval":"Nothing awaiting payment approval","Ready to pay":"Nothing ready to pay","Paid":"Nothing paid yet"};' + NL +
  '    return ((st==="All statuses")?PURF_LANES:[st]).map(function(s){' + NL +
  '      return {key:s,title:s,sub:"",tone:PURF_STAGE_TONE[s]||"inherit",empty:empty[s]||"None",aria:"",min:0};' + NL +
  '    });' + NL +
  '  }' + NL +
  '  var p=PURF_PATHS[purFPathCur(w)],out=[];' + NL +
  '  if(p)p.steps.forEach(function(s,i){' + NL +
  '    var mins=s.users.map(function(u,k){return (s.mins&&s.mins[k]!=null)?s.mins[k]:(s.min||0);});' + NL +
  '    var lo=Math.min.apply(null,mins),hi=Math.max.apply(null,mins);' + NL +
  '    var names=s.users.map(purFWho).join(" or ");' + NL +
  '    var lead=(i===p.steps.length-1)?"Ends with ":((i===0)?"Starts with ":"Then ");' + NL +
  '    var mny=(lo>0)?(" from "+purFMoneyShort(lo)+((hi>lo)?" or more, depending on the approver":"")):"";' + NL +
  '    out.push({key:"Level "+(i+1),title:names,sub:(lo>0)?("from "+purFMoneyShort(lo)+((hi>lo)?"+":"")):"",' + NL +
  '      tone:PURF_STAGE_TONE["Pending approval"],empty:"Nothing at this level",aria:lead+names+mny+". Any one approver on a level satisfies it.",min:lo});' + NL +
  '  });' + NL +
  '  out.push({key:"Approved",title:"Approved",sub:"",tone:PURF_STAGE_TONE["Approved"],empty:"Nothing approved yet",' + NL +
  '    aria:"Approved: the approval path is complete. The invoice is entered in Accounts Payable.",min:0});' + NL +
  '  return out;' + NL +
  '}' + NL, "column model");

/* 3. the board */
const D0 = "function purFBoard(w){", D1 = NL + "}" + NL + "/* The PO Table, on her .wt-row primitives";
const d0 = blk.indexOf(D0), d1 = blk.indexOf(D1, d0); if (d0 < 0 || d1 < 0) throw new Error("board range");
const board = [
  "function purFBoard(w){",
  "  var rows=purFBoardRows(w),tier=purFTier(w),cols=purFCols(w);",
  "  var cap=(tier===\"wide\")?PURF_CAP_BOARD_WIDE:9999;",
  "  /* The payment board hides the Finish column when the status chip selects one lane, because closing or",
  "     voiding is a move out of the whole flow. The path board always shows the whole flow. */",
  "  var finish=PURF_USE_PAY?(purFStatusCur(w)===\"All statuses\"):true;",
  "  /* A level whose minimum is above every amount on the board cannot receive a card, so it says so",
  "     instead of looking merely empty: the skip rule made visible (POOrderRepository.cs:1760). */",
  "  var top=rows.reduce(function(m,p){return Math.max(m,p.amt);},0);",
  "  var cs=cols.map(function(c){",
  "    var sp=rows.filter(function(p){return purFColOf(p)===c.key;});",
  "    var dim=(c.min>0&&c.min>top);",
  "    var cards=sp.slice(0,cap).map(function(po){return purFCard(w,po);}).join(\"\");",
  "    if(!sp.length)cards='<div class=\"purf-kempty\">'+(dim?(\"Not required under \"+purFMoneyShort(c.min)):c.empty)+'</div>';",
  "    else if(sp.length>cap)cards+='<button class=\"purf-more\" data-purf=\"more\" data-id=\"'+w.id+'\">+'+(sp.length-cap)+' more, view in the PO Table</button>';",
  "    var ttl='<span class=\"purf-kcol-t\" style=\"color:'+c.tone+'\">'+purFEsc(c.title)+'</span>';",
  "    var head=c.sub",
  "      ? '<div class=\"purf-kcol-h\"><span class=\"purf-kcol-ttl\">'+ttl+'<span class=\"purf-kcol-sub\">'+purFEsc(c.sub)+'</span></span><span class=\"purf-kcol-n\">'+sp.length+'</span></div>'",
  "      : '<div class=\"purf-kcol-h\">'+ttl+'<span class=\"purf-kcol-n\">'+sp.length+'</span></div>';",
  "    return '<div class=\"purf-kcol purf-col'+(dim?\" purf-kcol-dim\":\"\")+'\"'+(c.aria?' role=\"group\" aria-label=\"'+purFEsc(c.aria)+'\"':\"\")+'>'+head+",
  "      '<div class=\"purf-kcol-b purf-colb\" data-purf-drop=\"'+purFEsc(c.key)+'\" data-id=\"'+w.id+'\">'+cards+'</div></div>';",
  "  }).join(\"\");",
  "  var fin=finish",
  "    ? '<div class=\"purf-finish\" role=\"group\" aria-label=\"Finish: drop a card here to close or void it\">'+",
  "        '<div class=\"purf-fin-half purf-fin-close\" data-purf-drop=\"Closed\" data-id=\"'+w.id+'\">'+purFIcon(\"task_alt\")+'<span class=\"purf-fin-t\">Close</span><span class=\"purf-fin-s\">any status</span></div>'+",
  "        '<div class=\"purf-fin-half purf-fin-void\" data-purf-drop=\"Voided\" data-id=\"'+w.id+'\">'+purFIcon(\"block\")+'<span class=\"purf-fin-t\">Void</span><span class=\"purf-fin-s\">'+(PURF_USE_PAY?\"unpaid only\":\"any open order\")+'</span></div>'+",
  "      '</div>'",
  "    : \"\";",
  "  /* Explore: columns keep a readable minimum and the board scrolls sideways (owner, 27 Sep). */",
  "  var gtc=(tier===\"wide\")?(\"repeat(\"+cols.length+\",minmax(180px,1fr))\"+(finish?\" 96px\":\"\")):(\"repeat(\"+cols.length+\",1fr)\"+(finish?\" 0.6fr\":\"\"));",
  "  return '<div class=\"purf-kanban purf-board\" data-purf-tier=\"'+tier+'\" style=\"grid-template-columns:'+gtc+'\">'+cs+fin+'</div>';"].join(NL);
blk = blk.slice(0, d0) + board + blk.slice(d1);
console.log("edited: the board");

/* 4. no status axis on the path board */
swap('function purFStatusVals(w,view){return (view==="table")?["All statuses"].concat(PURF_STAGES,PURF_ARCHIVE):["All statuses"].concat(PURF_LANES);}',
  '/* The path board has no status axis of its own: its columns ARE the status, so only "All statuses"' + NL +
  '   is available there, which hides the chip and lets a stored lane fall back through purFStatusCur. */' + NL +
  'function purFStatusVals(w,view){if(view==="kanban"&&!PURF_USE_PAY)return ["All statuses"];return (view==="table")?["All statuses"].concat(PURF_STAGES,PURF_ARCHIVE):["All statuses"].concat(PURF_LANES);}', "status values");

/* 5. the board needs one path */
swap('function purFPathVals(w){',
  '/* The path board draws its columns from one path, so it offers every path and no "All approval' + NL +
  '   paths" (owner, 28 Sep). Listing all of them, not just the ones with rows, means selecting a quiet' + NL +
  '   path still shows its levels. */' + NL +
  'function purFPathReq(w){return !PURF_USE_PAY&&purFTier(w)!=="kpi"&&purFViewCur(w)==="kanban";}' + NL +
  'function purFPathVals(w){' + NL +
  '  if(purFPathReq(w))return Object.keys(PURF_PATHS);', "path values");
swap('function purFPathCur(w){var vals=purFPathVals(w);return (w.purfPath&&vals.indexOf(w.purfPath)>-1)?w.purfPath:"All approval paths";}',
  'function purFPathCur(w){' + NL +
  '  if(purFPathReq(w))return (w.purfPath&&PURF_PATHS[w.purfPath])?w.purfPath:Object.keys(PURF_PATHS)[0];' + NL +
  '  var vals=purFPathVals(w);return (w.purfPath&&vals.indexOf(w.purfPath)>-1)?w.purfPath:"All approval paths";' + NL +
  '}', "path current");

/* 6. the header chips */
swap('  if(view!=="enc")chips+=purFChip(w,"status",sh?st:("Status: "+st),"PO status, currently "+st,loading);' + NL +
  '  if(purFPathVals(w).length>1)chips+=purFChip(w,"path",(sh&&pa==="All approval paths")?"All paths":pa,"Approval path, currently "+pa,false);',
  '  if(view!=="enc"&&purFStatusVals(w,view).length>1)chips+=purFChip(w,"status",sh?st:("Status: "+st),"PO status, currently "+st,loading);' + NL +
  '  if(purFPathReq(w)||purFPathVals(w).length>1)chips+=purFChip(w,"path",(sh&&pa==="All approval paths")?"All paths":pa,"Approval path, currently "+pa,false);', "header chips");

/* 7. the path popover */
swap('    if(!q||"all approval paths".indexOf(q)>-1)out+=row("set-path","all","All approval paths",allOn,"");',
  '    if(!purFPathReq(w)&&(!q||"all approval paths".indexOf(q)>-1))out+=row("set-path","all","All approval paths",allOn,"");', "path popover: no All row on the board");
swap("    if(!list.length&&q&&\"all approval paths\".indexOf(q)<0)out+='<div class=\"mi-note purf-popnote\">No approval paths match \"'+purFEsc(PURF_Q)+'\"</div>';" + NL +
  '    return out+\'</div>\';',
  "    if(!list.length&&q&&\"all approval paths\".indexOf(q)<0)out+='<div class=\"mi-note purf-popnote\">No approval paths match \"'+purFEsc(PURF_Q)+'\"</div>';" + NL +
  "    out+='</div>';" + NL +
  "    if(purFPathReq(w))out+='<div class=\"mi-note purf-popnote\">The Kanban draws its columns from one approval path, so every request on the board is on the path selected here. The Table and Encumbrances views still show them all.</div>';" + NL +
  '    return out;', "path popover: note on the board");

t = t.slice(0, b0) + blk + t.slice(b1);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
