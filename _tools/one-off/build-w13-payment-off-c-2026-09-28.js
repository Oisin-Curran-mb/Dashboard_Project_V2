/* One-off, 2026-09-28. Part C of three, finishing the approval-path board.
     - purFMoveCheck rules on a path-board drop: a drop on any later level, or on Approved, records my
       approval at MY level; a drop to the left is refused; rejected blocks it; hold, Close and Void keep
       the rules the owner settled on 27 Sep. Approving at a level implies the ones below it
       (POOrderRepository.cs:1754), so the model, not the drop, decides where the card lands, and
       purFLandCol names that column in the confirm dialog.
     - Also fixes a real defect in passing: the lane fallback message indexed past the end of PURF_LANES
       and printed "A request moves one lane at a time: Paid to undefined."
     - purFLegendNoPay is a separate function, so the payment legend stays byte for byte what it was.
       The board legend gains a Columns section built from purFCols, so it cannot drift from the board,
       and a threshold row carrying the real sub-line of the selected path. Card colours drop the two
       payment tones, which cannot occur with the process off.
     - CSS: the header title wrapper and threshold sub-line, the dimmed column, and the four dead
       payment rules removed (.purf-paybadge, .purf-pay-unpaid, .purf-pay-paid, .purf-holdflag, none of
       which were ever emitted). */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* 1. where an approval lands, for the confirm dialog */
swap('function purFMoveCheck(po,to){',
  '/* The column a card reaches when I approve my level: the next level the amount still applies to, or' + NL +
  '   Approved when nothing is left. Named in the confirm dialog, because approving at my level also' + NL +
  '   satisfies the levels below it and the card can pass more than one column. */' + NL +
  'function purFLandCol(po){' + NL +
  '  if(PURF_USE_PAY)return "";' + NL +
  '  var m=purFMyLevel(po);if(!m)return "";' + NL +
  '  if(m.release)return "Approved";' + NL +
  '  var rest=purFSteps(po.path,po.amt).filter(function(s){return s.seq>m.step.seq;});' + NL +
  '  if(!rest.length)return "Approved";' + NL +
  '  var p=PURF_PATHS[po.path],no=0;' + NL +
  '  for(var i=0;i<p.steps.length;i++)if(p.steps[i].seq===rest[0].seq)no=i+1;' + NL +
  '  return no?("Level "+no):"Approved";' + NL +
  '}' + NL +
  'function purFMoveCheck(po,to){', "purFLandCol helper");

/* 2. the drop rules */
swap('  var from=purFLane(po),tn=purFTurn(po);',
  '  var from=purFColOf(po),tn=purFTurn(po);', "moveCheck: from is the column");
swap('  if(from==="Pending approval"&&to==="Payment approval"){',
  '  if(!PURF_USE_PAY){' + NL +
  '    /* The path board: forward is any later level, or Approved. */' + NL +
  '    if(purFColNo(to)<=purFColNo(from))return {ok:false,msg:"Approval moves forward only. Drop the card on a later level, or on Approved."};' + NL +
  '    if(tn.kind==="rejected")return {ok:false,msg:po.ref+" is rejected. Clear the rejection on the Approvals tab first."};' + NL +
  '    return (tn.kind==="next"||tn.kind==="mine")?{ok:true}:{ok:false,msg:"Not your approval: "+tn.label+"."};' + NL +
  '  }' + NL +
  '  if(from==="Pending approval"&&to==="Payment approval"){', "moveCheck: path-board branch");
swap('  return {ok:false,msg:"A request moves one lane at a time: "+from+" to "+PURF_LANES[PURF_LANES.indexOf(from)+1]+"."};',
  '  /* Defect fix: the index ran off the end of PURF_LANES on a Paid card and printed "to undefined". */' + NL +
  '  var nxt=PURF_LANES[PURF_LANES.indexOf(from)+1];' + NL +
  '  return {ok:false,msg:nxt?("A request moves one lane at a time: "+from+" to "+nxt+"."):("A "+from.toLowerCase()+" order does not move to "+to+".")};', "moveCheck: lane fallback message");
swap('  var from=purFLane(po);' + NL +
  '  if(to==="Closed"||to==="Voided"){',
  '  var from=purFColOf(po);' + NL +
  '  if(to==="Closed"||to==="Voided"){', "applyMove: from is the column");

/* 3. the confirm dialog */
swap('  var isPay=(to==="Paid"),tn=purFTurn(po);',
  '  var isPay=(to==="Paid"),tn=purFTurn(po),land=purFLandCol(po);', "moveHTML: landing column");
swap('purFEsc(po.vendor+", "+purFMoney(po.amt)+", "+purFLane(po))',
  'purFEsc(po.vendor+", "+purFMoney(po.amt)+", "+purFColOf(po))', "moveHTML: subtitle names the column");
swap(':("Records your approval on "+(tn.live?tn.live.path:po.path)+(tn.level?", level "+(tn.idx+1)+" of "+tn.n:"")+". Any one approver satisfies a level; when every level is satisfied the request moves on. In the real build this calls the approval API, which does not exist yet.")));',
  ':("Records your approval on "+(tn.live?tn.live.path:po.path)+(tn.level?", level "+(tn.idx+1)+" of "+tn.n:"")+". Any one approver satisfies a level, and approving at your level also satisfies the levels below it"+(land?(", so the card moves to "+land):"")+". In the real build this calls the approval API, which does not exist yet.")));', "moveHTML: note names the landing column");

/* 4. the legend */
swap('function purFLegendHTML(w){' + NL +
  '  var view=purFViewCur(w),table=(view==="table");',
  '/* With the payment process off the lanes do not exist, so the legend is its own function and the' + NL +
  '   payment legend above is left exactly as the owner signed it off. The Columns section is built from' + NL +
  '   purFCols, so it cannot drift from the board it describes. */' + NL +
  'function purFLegendNoPay(w,table){' + NL +
  '  var out;' + NL +
  '  if(table){' + NL +
  '    var sts=[["Pending approval","On its approval path. Approvers act in level order."],["Approved","Approval path complete. The invoice is entered in Accounts Payable."],["Closed","Final. Archive state, listed in the Table only."],["Voided","Cancelled. Archive state, listed in the Table only."]];' + NL +
  '    out=\'<div class="cap">Status</div>\'+sts.map(function(l){return \'<div class="purf-lg-row"><span class="purf-chip-st purf-lg-lane" style="color:\'+PURF_STAGE_TONE[l[0]]+\'">\'+l[0]+\'</span><span class="purf-lg-txt">\'+l[1]+\'</span></div>\';}).join("");' + NL +
  '  }else{' + NL +
  '    var cols=purFCols(w),thr=cols.filter(function(c){return c.min>0;})[0];' + NL +
  '    out=\'<div class="cap">Columns</div>\'+cols.map(function(c){return \'<div class="purf-lg-row"><span class="purf-chip-st purf-lg-lane" style="color:\'+c.tone+\'">\'+purFEsc(c.title)+\'</span><span class="purf-lg-txt">\'+purFEsc(c.aria)+\'</span></div>\';}).join("");' + NL +
  '    out+=\'<div class="mi-note purf-popnote">The columns are the levels of the approval path selected above, in order. A request sits in the column of the level that has to act next.</div>\';' + NL +
  '    if(thr)out+=\'<div class="purf-lg-row"><span class="purf-kcol-sub purf-lg-lane">\'+purFEsc(thr.sub)+\'</span><span class="purf-lg-txt">The dollar minimum belongs to the approver, not the level: they have to approve only once the request total reaches it, and below it the level is skipped. A column no request on the board can reach is greyed out.</span></div>\';' + NL +
  '    out+=\'<div class="purf-lg-row"><span class="purf-lg-fin purf-fin-close">Close</span><span class="purf-lg-txt">Finish column: closes an order from any column, as the Status list on the record does. Leaves the board, stays in the Table.</span></div>\';' + NL +
  '    out+=\'<div class="purf-lg-row"><span class="purf-lg-fin purf-fin-void">Void</span><span class="purf-lg-txt">Finish column: cancels an open order. Leaves the board, stays in the Table.</span></div>\';' + NL +
  '  }' + NL +
  '  var act=table?"Approve on the Approvals tab of the record.":"Drag the card forward, or approve on the Approvals tab.";' + NL +
  '  var badges=[["next","how_to_reg","Your approval next","Your level is the next one. "+act],["mine","schedule","Your approval later","You are on the path, someone else is first. You may still approve; that also satisfies the lower levels."],["waiting","hourglass_top","Waiting on","Someone else\'s turn."+(table?"":" You can only drag it to Close or Void.")],["rejected","block","Rejected by","An approver rejected it with a reason. Clear the rejection on the Approvals tab to resume."],["hold","lock","On hold","Parked with a reason. Remove the hold before it moves."],["next","how_to_reg","No approver required","The amount is under every minimum on the path. Approve to release it."]];' + NL +
  '  out+=\'<div class="cap">Badges: whose turn it is</div>\'+badges.map(function(b){return \'<div class="purf-lg-row"><span class="purf-turn purf-turn-\'+b[0]+\'">\'+purFIcon(b[1])+b[2]+\'</span><span class="purf-lg-txt">\'+b[3]+\'</span></div>\';}).join("");' + NL +
  '  if(table){' + NL +
  '    out+=\'<div class="cap">Issued column</div><div class="purf-lg-row"><span class="purf-ovflag purf-lg-ov">\'+purFIcon("warning")+\'Overdue</span><span class="purf-lg-txt">Past its expected-by date and not yet approved.</span></div>\';' + NL +
  '    return out;' + NL +
  '  }' + NL +
  '  var cards=[["purf-card-next","Your turn","Amber edge: you can act on this card now."],["purf-card-hold","On hold","Cream: parked. Moves only to Close or Void."],["purf-card-rej","Rejected","Red tint: rejected. Clear it on the Approvals tab to approve; Close or Void still allowed."]];' + NL +
  '  out+=\'<div class="cap">Card colours</div>\'+cards.map(function(c){return \'<div class="purf-lg-row"><span class="purf-kcard purf-card purf-lg-card \'+c[0]+\'">\'+c[1]+\'</span><span class="purf-lg-txt">\'+c[2]+\'</span></div>\';}).join("");' + NL +
  '  out+=\'<div class="purf-lg-row"><span class="purf-card-age purf-age-hot purf-lg-age">\'+purFIcon("schedule")+\'overdue</span><span class="purf-lg-txt">Red clock: past its due date.</span></div>\';' + NL +
  '  out+=\'<div class="cap">Moving a card</div><div class="mi-note purf-popnote purf-lg-rules">Dragging a card onto a later level records your approval, so only your turn can move it forward. Approving at your level also satisfies every level below it, so a card can pass more than one column at once. Any card can be dragged to Close, and any open order to Void, whatever the turn. A card on hold moves only to Close or Void.</div>\';' + NL +
  '  return out;' + NL +
  '}' + NL +
  'function purFLegendHTML(w){' + NL +
  '  var view=purFViewCur(w),table=(view==="table");' + NL +
  '  if(!PURF_USE_PAY)return purFLegendNoPay(w,table);', "legend for the flag off");

t = t.slice(0, b0) + blk + t.slice(b1);

/* 5. CSS: the new header pieces and the dimmed column */
const CEND = "/* ===== end W13 Purchasing Management V2 CSS ===== */";
if (t.split(CEND).length !== 2) throw new Error("css end");
t = t.replace(CEND, [
  "  .purf-root .purf-kcol-ttl{display:flex;flex-direction:column;gap:1px;min-width:0;}",
  "  .purf-root .purf-kcol-ttl .purf-kcol-t{white-space:normal;overflow:visible;text-overflow:clip;line-height:1.25;}",
  "  .purf-root .purf-kcol-sub{font-size:10.5px;font-weight:600;color:var(--txt-subtle);font-variant-numeric:tabular-nums;white-space:nowrap;}",
  "  .purf-root .purf-kcol-dim{opacity:.62;}",
  "  .purf-root .purf-kcol-dim .purf-colb{border:1px dashed var(--stroke-widget);}",
  CEND].join(NL));
console.log("edited: column header and dimmed column CSS");

/* 6. the four dead payment rules */
const dead = [
  '  .purf-root .purf-holdflag{display:inline-flex;align-items:center;gap:3px;font-size:10.5px;font-weight:600;color:#7a5300;}' + NL,
  '  .purf-root .purf-holdflag .material-symbols-rounded{font-size:12px;}' + NL,
  '  .purf-root .purf-paybadge{display:inline-block;width:-moz-fit-content;width:fit-content;font-size:10px;font-weight:600;border-radius:8px;padding:1px 7px;border:1px solid;}' + NL,
  '  .purf-root .purf-pay-unpaid{background:var(--am-50);color:#7a5300;border-color:#e8cfae;}' + NL,
  '  .purf-root .purf-pay-paid{background:var(--pos-10);color:#0b6b4c;border-color:#9fe1cb;}' + NL];
dead.forEach(function (d, i) { if (t.split(d).length !== 2) throw new Error("dead rule " + i); t = t.replace(d, ""); });
console.log("edited: removed 5 dead payment CSS rules");
const PCLS = 'var PURF_PAY_CLS={unpaid:"purf-pay-unpaid",paid:"purf-pay-paid"};' + NL;
if (t.split(PCLS).length !== 2) throw new Error("PURF_PAY_CLS");
t = t.replace(PCLS, "");
console.log("edited: removed PURF_PAY_CLS");

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
