/* One-off, 2026-09-27, owner: "The info Icon need to not be shown on Encumbrances and for the table view
   only tell info that is shown on the table view. Kanban should not be option in the explore view but it
   should stay in the detail view."
     - legend icon hidden in the Encumbrances view
     - legend content follows the view: Table = Status chips (lanes + Closed + Voided), turn badges, the
       Overdue flag; Kanban = lanes + Finish zones, badges, card colours, overdue clock, move rules
     - Explore (wide tier) offers Table | Encumbrances only; a stored "kanban" view resolves to table there.
       Detail keeps Kanban | Table | Encumbrances. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* 1. view: no Kanban at Explore */
swap('function purFViewCur(w){return (w.purfView==="table")?"table":((w.purfView==="enc")?"enc":"kanban");}',
     '/* Explore (wide) has no Kanban: a stored kanban view resolves to the table there (owner, 27 Sep). */' + NL +
     'function purFViewCur(w){if(w.purfView==="enc")return "enc";if(w.purfView==="table")return "table";return (purFTier(w)==="wide")?"table":"kanban";}', "viewCur: wide falls back to table");
swap('    seg("kanban","Kanban","view_kanban","The live approval flow: one column per approval state, longest waiting first, drag a card to action it.")+',
     '    ((purFTier(w)==="wide")?"":seg("kanban","Kanban","view_kanban","The live approval flow: one column per approval state, longest waiting first, drag a card to action it."))+', "toggle: Kanban only at Detail");

/* 2. icon hidden in the Encumbrances view */
swap("      '<button class=\"purf-lgbtn\" data-purf=\"legend\"", "      ((view===\"enc\")?\"\":'<button class=\"purf-lgbtn\" data-purf=\"legend\"", "icon: open guard");
swap("+purFIcon(\"info\")+'</button>'+" + NL + "    '</div>'+", "+purFIcon(\"info\")+'</button>')+" + NL + "    '</div>'+", "icon: close guard");

/* 3. legend follows the view */
const L0 = "function purFLegendHTML(w){", L1 = NL + "}" + NL + "function purFRenderPop(anchor){";
const l0 = blk.indexOf(L0), l1 = blk.indexOf(L1, l0); if (l0 < 0 || l1 < 0) throw new Error("legend range");
const legend = [
  "function purFLegendHTML(w){",
  "  var view=purFViewCur(w),table=(view===\"table\");",
  "  var lanes=[[\"Pending approval\",\"Request path open. Approvers act in level order.\"],[\"Payment approval\",\"Approved. Payment path open, one per invoice.\"],[\"Ready to pay\",\"Payment approved. Waiting on the check.\"],[\"Paid\",table?\"Check posted.\":\"Check posted. Drag to Close when done.\"]];",
  "  if(table)lanes=lanes.concat([[\"Closed\",\"Final. Archive state, listed in the Table only.\"],[\"Voided\",\"Cancelled. Archive state, listed in the Table only.\"]]);",
  "  var out='<div class=\"cap\">'+(table?\"Status\":\"Lanes\")+'</div>'+lanes.map(function(l){return '<div class=\"purf-lg-row\"><span class=\"purf-chip-st purf-lg-lane\" style=\"color:'+PURF_STAGE_TONE[l[0]]+'\">'+l[0]+'</span><span class=\"purf-lg-txt\">'+l[1]+'</span></div>';}).join(\"\");",
  "  if(!table){",
  "    out+='<div class=\"purf-lg-row\"><span class=\"purf-lg-fin purf-fin-close\">Close</span><span class=\"purf-lg-txt\">Finish column: paid orders only. Leaves the board, stays in the Table.</span></div>';",
  "    out+='<div class=\"purf-lg-row\"><span class=\"purf-lg-fin purf-fin-void\">Void</span><span class=\"purf-lg-txt\">Finish column: unpaid orders only. Leaves the board, stays in the Table.</span></div>';",
  "  }",
  "  var act=table?\"Approve on the Approvals tab of the record.\":\"Drag the card on, or approve on the Approvals tab.\";",
  "  var badges=[[\"next\",\"how_to_reg\",\"Your approval next\",\"Your level is the next one. \"+act],[\"mine\",\"schedule\",\"Your approval later\",\"You are on the path, someone else is first. You may still approve; that also satisfies the lower levels.\"],[\"waiting\",\"hourglass_top\",\"Waiting on\",\"Someone else's turn.\"+(table?\"\":\" You cannot move the card.\")],[\"rejected\",\"block\",\"Rejected by\",\"An approver rejected it with a reason. Clear the rejection on the Approvals tab to resume.\"],[\"hold\",\"lock\",\"On hold\",\"Parked with a reason. Remove the hold before it moves.\"],[\"next\",\"how_to_reg\",\"No approver required\",\"The amount is under every minimum on the path. Approve to release it.\"]];",
  "  out+='<div class=\"cap\">Badges: whose turn it is</div>'+badges.map(function(b){return '<div class=\"purf-lg-row\"><span class=\"purf-turn purf-turn-'+b[0]+'\">'+purFIcon(b[1])+b[2]+'</span><span class=\"purf-lg-txt\">'+b[3]+'</span></div>';}).join(\"\");",
  "  if(table){",
  "    out+='<div class=\"cap\">Issued column</div><div class=\"purf-lg-row\"><span class=\"purf-ovflag purf-lg-ov\">'+purFIcon(\"warning\")+'Overdue</span><span class=\"purf-lg-txt\">Past its expected-by date and not yet approved.</span></div>';",
  "    return out;",
  "  }",
  "  var cards=[[\"purf-card-next\",\"Your turn\",\"Amber edge: you can act on this card now.\"],[\"purf-card-ok\",\"Ready to pay\",\"Grey: payment approved, waiting on the check.\"],[\"purf-card-paid\",\"Paid\",\"Green: check posted.\"],[\"purf-card-hold\",\"On hold\",\"Cream: parked, not draggable.\"],[\"purf-card-rej\",\"Rejected\",\"Red tint: rejected, not draggable until cleared.\"]];",
  "  out+='<div class=\"cap\">Card colours</div>'+cards.map(function(c){return '<div class=\"purf-lg-row\"><span class=\"pur-kcard purf-card purf-lg-card '+c[0]+'\">'+c[1]+'</span><span class=\"purf-lg-txt\">'+c[2]+'</span></div>';}).join(\"\");",
  "  out+='<div class=\"purf-lg-row\"><span class=\"purf-card-age purf-age-hot purf-lg-age\">'+purFIcon(\"schedule\")+'overdue</span><span class=\"purf-lg-txt\">Red clock: past its due date.</span></div>';",
  "  out+='<div class=\"cap\">Moving a card</div><div class=\"mi-note purf-popnote purf-lg-rules\">Dragging a card to the next lane records your approval. One lane at a time, forward only. Only paid orders can be closed; a paid order cannot be voided here. A card on hold moves only to Void.</div>';",
  "  return out;"].join(NL);
blk = blk.slice(0, l0) + legend + blk.slice(l1);
console.log("edited: legend follows the view");

t = t.slice(0, b0) + blk + t.slice(b1);
const CEND = "/* ===== end W13 Purchasing Management V2 CSS ===== */";
if (t.split(CEND).length !== 2) throw new Error("css end");
t = t.replace(CEND, "  .purf-root .purf-lg-ov{justify-self:start;font-size:11px;}" + NL + CEND);
console.log("edited: overdue sample CSS");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
