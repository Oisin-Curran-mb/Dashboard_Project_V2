/* One-off, 2026-09-27, owner: "follow the rules that page follow as it how it need to work, so close at any
   time is possible". On Requests/Update the Status list always offers Closed (setApprovalRows: "Closed enabled
   in all cases"), and Closed / Voided are status actions independent of whose approval turn it is. So:
     - the Finish column's Close accepts a card from any lane, on hold or not
     - every card that is not Closed or Voided can be picked up; purFMoveCheck decides what a drop may do,
       so a card that is not the viewer's turn can still reach Close or Void (this also fixes the earlier
       gap where waiting, rejected and held cards could never be voided from the board)
     - Void stays unpaid-only (a paid order is reversed in AP first), as before
   Captions and the legend follow. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap('function purFCanDrag(po){var k=purFTurn(po).kind,lane=purFLane(po);if(po.hold)return false;return k==="next"||k==="mine"||lane==="Ready to pay"||lane==="Paid";}',
     '/* Any open card can be picked up; purFMoveCheck rules on the drop (owner, 27 Sep: the page allows Close, and Void from Approved, whatever the turn). */' + "\r\n" +
     'function purFCanDrag(po){return po.stage!=="Closed"&&po.stage!=="Voided";}', "drag: any open card");
swap('  if(po.hold&&to!=="Voided")return {ok:false,msg:"On hold: remove the hold on "+po.ref+" before moving it."};' + "\r\n" +
     '  if(to==="Closed")return (from==="Paid")?{ok:true}:{ok:false,msg:"Only paid orders can be closed. "+po.ref+" is not paid."};',
     '  if(to==="Closed")return {ok:true}; /* the page offers Closed from every status */' + "\r\n" +
     '  if(po.hold&&to!=="Voided")return {ok:false,msg:"On hold: remove the hold on "+po.ref+" before moving it."};', "move: Close from any lane, hold or not");
swap('<span class="purf-fin-t">Close</span><span class="purf-fin-s">paid orders only</span>', '<span class="purf-fin-t">Close</span><span class="purf-fin-s">any status</span>', "Finish caption");
swap('["Paid",table?"Check posted.":"Check posted. Drag to Close when done."]', '["Paid",table?"Check posted.":"Check posted. Drag to Close when the order is done."]', "legend Paid text");
swap("Finish column: paid orders only. Leaves the board, stays in the Table.", "Finish column: closes an order from any lane, as the Status list on the record does. Leaves the board, stays in the Table.", "legend Close text");
swap("Dragging a card to the next lane records your approval. One lane at a time, forward only. Only paid orders can be closed; a paid order cannot be voided here. A card on hold moves only to Void.",
     "Dragging a card to the next lane records your approval, so only your turn can move it forward. One lane at a time. Any card can be dragged to Close, and any unpaid card to Void, whatever the turn. A paid order cannot be voided here. A card on hold moves only to Close or Void.", "legend move rules");
swap('["waiting","hourglass_top","Waiting on","Someone else\'s turn."+(table?"":" You cannot move the card.")]', '["waiting","hourglass_top","Waiting on","Someone else\'s turn."+(table?"":" You can only drag it to Close or Void.")]', "legend waiting text");
swap('["purf-card-hold","On hold","Cream: parked, not draggable."],["purf-card-rej","Rejected","Red tint: rejected, not draggable until cleared."]', '["purf-card-hold","On hold","Cream: parked. Moves only to Close or Void."],["purf-card-rej","Rejected","Red tint: rejected. Clear it on the Approvals tab to approve; Close or Void still allowed."]', "legend card colours text");
swap('    setStatus(po.hold?("On hold: remove the hold on "+po.ref+" before moving it."):("Not your turn: "+purFTurn(po).label+"."));', '    setStatus(po.ref+" is "+po.stage.toLowerCase()+": closed and voided orders are final.");', "drag refusal message");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
