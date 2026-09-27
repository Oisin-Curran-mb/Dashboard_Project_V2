/* One-off, 2026-09-27: W13 legend. Owner: "Add info icon on the top right hand corner that will be
   legends to explain what different colors mean and different badges mean and so on."
     - an info icon in the header, top right next to the view toggle, Explore and Detail only (the Glance
       renderer does not use the header block); plain icon, no circle, no border (owner's W09 ruling)
     - a legend pop-up on the existing #purfPop machinery: lanes, turn badges, card colours, moving a card
     - the samples are built from the same constants and classes the board uses (PURF_LANES, purf-turn-*,
       purf-card-*), so the legend cannot drift from the board
   Anchored; aborts before writing on any miss. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* 1. header: info icon beside the view toggle */
swap("'<div class=\"dep-hd-top\"><div class=\"purf-chiprow\">'+chips+'</div><div class=\"dep-hd-toggle\">'+purFViewToggle(w)+'</div></div>'+",
     "'<div class=\"dep-hd-top\"><div class=\"purf-chiprow\">'+chips+'</div><div class=\"dep-hd-toggle purf-hd-acts\">'+purFViewToggle(w)+" + NL +
     "      '<button class=\"purf-lgbtn\" data-purf=\"legend\" data-id=\"'+w.id+'\" aria-haspopup=\"dialog\" aria-label=\"Legend: what the lanes, badges and colours mean\" data-tip=\"Legend\">'+purFIcon(\"info\")+'</button></div></div>'+",
     "header info icon");

/* 2. legend content on the pop machinery */
swap("function purFRenderPop(anchor){",
     "/* Legend. Every sample is the board's own markup (lane tone, .purf-turn-*, .purf-card-*), so what the" + NL +
     "   legend shows is what the board draws. */" + NL +
     "function purFLegendHTML(w){" + NL +
     "  var lanes=[[\"Pending approval\",\"Request path open. Approvers act in level order.\"],[\"Payment approval\",\"Approved. Payment path open, one per invoice.\"],[\"Ready to pay\",\"Payment approved. Waiting on the check.\"],[\"Paid\",\"Check posted. Drag to Close when done.\"]];" + NL +
     "  var out='<div class=\"cap\">Lanes</div>'+lanes.map(function(l){return '<div class=\"purf-lg-row\"><span class=\"purf-chip-st purf-lg-lane\" style=\"color:'+PURF_STAGE_TONE[l[0]]+'\">'+l[0]+'</span><span class=\"purf-lg-txt\">'+l[1]+'</span></div>';}).join(\"\");" + NL +
     "  out+='<div class=\"purf-lg-row\"><span class=\"purf-lg-fin purf-fin-close\">Close</span><span class=\"purf-lg-txt\">Finish column: paid orders only. Leaves the board, stays in the Table.</span></div>';" + NL +
     "  out+='<div class=\"purf-lg-row\"><span class=\"purf-lg-fin purf-fin-void\">Void</span><span class=\"purf-lg-txt\">Finish column: unpaid orders only. Leaves the board, stays in the Table.</span></div>';" + NL +
     "  var badges=[[\"next\",\"how_to_reg\",\"Your approval next\",\"Your level is the next one. Drag the card on, or approve on the Approvals tab.\"],[\"mine\",\"schedule\",\"Your approval later\",\"You are on the path, someone else is first. You may still approve; that also satisfies the lower levels.\"],[\"waiting\",\"hourglass_top\",\"Waiting on\",\"Someone else's turn. You cannot move the card.\"],[\"rejected\",\"block\",\"Rejected by\",\"An approver rejected it with a reason. Clear the rejection on the Approvals tab to resume.\"],[\"hold\",\"lock\",\"On hold\",\"Parked with a reason. Remove the hold before it moves.\"],[\"next\",\"how_to_reg\",\"No approver required\",\"The amount is under every minimum on the path. Approve to release it.\"]];" + NL +
     "  out+='<div class=\"cap\">Badges: whose turn it is</div>'+badges.map(function(b){return '<div class=\"purf-lg-row\"><span class=\"purf-turn purf-turn-'+b[0]+'\">'+purFIcon(b[1])+b[2]+'</span><span class=\"purf-lg-txt\">'+b[3]+'</span></div>';}).join(\"\");" + NL +
     "  var cards=[[\"purf-card-next\",\"Your turn\",\"Amber edge: you can act on this card now.\"],[\"purf-card-ok\",\"Ready to pay\",\"Grey: payment approved, waiting on the check.\"],[\"purf-card-paid\",\"Paid\",\"Green: check posted.\"],[\"purf-card-hold\",\"On hold\",\"Cream: parked, not draggable.\"],[\"purf-card-rej\",\"Rejected\",\"Red tint: rejected, not draggable until cleared.\"]];" + NL +
     "  out+='<div class=\"cap\">Card colours</div>'+cards.map(function(c){return '<div class=\"purf-lg-row\"><span class=\"pur-kcard purf-card purf-lg-card '+c[0]+'\">'+c[1]+'</span><span class=\"purf-lg-txt\">'+c[2]+'</span></div>';}).join(\"\");" + NL +
     "  out+='<div class=\"purf-lg-row\"><span class=\"purf-card-age purf-age-hot purf-lg-age\">'+purFIcon(\"schedule\")+'overdue</span><span class=\"purf-lg-txt\">Red clock: past its due date.</span></div>';" + NL +
     "  out+='<div class=\"cap\">Moving a card</div><div class=\"mi-note purf-popnote purf-lg-rules\">Dragging a card to the next lane records your approval. One lane at a time, forward only. Only paid orders can be closed; a paid order cannot be voided here. A card on hold moves only to Void.</div>';" + NL +
     "  return out;" + NL +
     "}" + NL +
     "function purFRenderPop(anchor){", "legend function");
swap("  if(!el){el=document.createElement(\"div\");el.id=\"purfPop\";el.className=\"pop purf-root purf-pop\";document.body.appendChild(el);}",
     "  if(!el){el=document.createElement(\"div\");el.id=\"purfPop\";document.body.appendChild(el);}" + NL +
     "  el.className=\"pop purf-root purf-pop\"+(PURF_POP.type===\"legend\"?\" purf-pop-lg\":\"\");el.setAttribute(\"role\",PURF_POP.type===\"legend\"?\"dialog\":\"\");", "pop class per type");
swap("  var t=PURF_POP.type;" + NL + "  function row(act,val,label,on,ic){",
     "  var t=PURF_POP.type;" + NL + "  if(t===\"legend\")return purFLegendHTML(w);" + NL + "  function row(act,val,label,on,ic){", "legend dispatch in pop content");

/* 3. click */
swap("  if(a===\"status\"||a===\"path\"||a===\"dept\"||a===\"year\"||a===\"scope\"){purFOpenPop(a,id,t);return;}",
     "  if(a===\"status\"||a===\"path\"||a===\"dept\"||a===\"year\"||a===\"scope\"||a===\"legend\"){purFOpenPop(a,id,t);return;}", "click opens the legend");

t = t.slice(0, b0) + blk + t.slice(b1);

/* 4. CSS, inside the W13 CSS block */
const CEND = "/* ===== end W13 Purchasing Management V2 CSS ===== */";
if (t.split(CEND).length !== 2) throw new Error("css end");
const css = [
  "  /* Legend: header info icon (plain, no circle, no border) and the legend pop-up rows. */",
  "  .purf-root .purf-hd-acts{display:flex;align-items:center;gap:4px;}",
  "  .purf-root .purf-lgbtn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;background:transparent;color:var(--txt-subtle);border-radius:8px;cursor:pointer;padding:0;}",
  "  .purf-root .purf-lgbtn .material-symbols-rounded{font-size:19px;}",
  "  .purf-root .purf-lgbtn:hover{color:var(--txt-primary);}",
  "  .purf-pop-lg{min-width:300px;max-width:360px;max-height:min(78vh,640px);overflow-y:auto;}",
  "  .purf-root .purf-lg-row{display:grid;grid-template-columns:118px 1fr;gap:8px;align-items:center;padding:3px 10px;}",
  "  .purf-root .purf-lg-txt{font-size:11px;color:var(--txt-secondary);line-height:1.35;}",
  "  .purf-root .purf-lg-lane{font-size:11px;font-weight:700;}",
  "  .purf-root .purf-lg-fin{display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border:1.5px dashed;border-radius:8px;padding:4px 6px;}",
  "  .purf-root .purf-lg-row .purf-turn{justify-self:start;}",
  "  .purf-root .purf-lg-card{display:inline-flex;align-items:center;justify-self:stretch;font-size:11px;font-weight:600;padding:6px 8px;border:1px solid var(--stroke-widget);border-radius:8px;cursor:default;}",
  "  .purf-root .purf-lg-age{font-size:11px;}",
  "  .purf-root .purf-lg-rules{padding:4px 10px 6px;}",
  ""].join(NL);
t = t.replace(CEND, css + CEND);
console.log("edited: legend CSS");

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
