/* One-off, 2026-09-28, owner: "There a way to toggle off the payment and this will make half of the
   Kanban empty. could you make the Kanban not care about payments just show the approval paths. I want
   this change setting config. So just hide the current version of the Kanban and just show tickets and
   show where they are in the path of the kanban depending on what approval path. is selected."
   Owner's rulings, same day: the Kanban forces one path; column headers are approver names with the
   threshold shown; the setting is a code constant, no UI; it reaches the whole widget, following legacy.

   Part A of three: the constant and the model gates.
     - PURF_USE_PAY models PO_Company.UsePaymentApprovalProcess (bit NOT NULL DEFAULT 0, so OFF on a new
       company). Both boards stay in the code: flip it to true and the payment board returns unchanged.
     - purFLivePath is the only switch between the request and the payment path, so the gate goes there.
       With the flag off there is one live path and everything downstream is already path-generic.
     - purFApproveStep stops seeding the payment path on request completion, as the legacy leaves
       PO_Order.PaymentApprovalID null (Requests/Update.aspx:93 hides the dropdown).
     - purFLane collapses to Pending approval / Approved, ignoring the pay fields the fixtures keep.
     - the record pop-up loses the Payment Approval tab and the Payment Approval Path dropdown, exactly
       the two things Requests/Update.aspx:93 hides for this flag.
     - Glance's third tile has no meaning with the flag off, so it becomes Waiting on others.
   Part B rebuilds the board; part C the move rules, the legend and the CSS. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

/* 1. the constant */
swap('var PURF_ARCHIVE=["Closed","Voided"];',
  'var PURF_ARCHIVE=["Closed","Voided"];' + NL +
  '/* PO_Company.UsePaymentApprovalProcess, bit NOT NULL DEFAULT 0, so off on a new company' + NL +
  '   (1045_V810_SchemaUpdate.sql:24; the checkbox at CompanyInformation/Default.aspx.cs:46). Off: no' + NL +
  '   payment path is selectable so PO_Order.PaymentApprovalID stays null and the whole invoice-approval' + NL +
  '   block is skipped (Requests/Update.aspx:93; POOrderRepository.cs:322), no PO_OrderInvoice rows are' + NL +
  '   created, ApprovedForPayment is never set, and an approved request goes straight to Accounts Payable' + NL +
  '   to be entered and paid by hand. The legacy Purchasing Management data panel models the request path' + NL +
  '   only, the same way (PurchasingManagement.ascx.cs:80). Flip this to true and the payment board,' + NL +
  '   the payment lanes and the Payment Approval tab all come back. */' + NL +
  'var PURF_USE_PAY=false;', "PURF_USE_PAY constant");

/* 2. one live path */
swap('  if(po.stage==="Approved"&&!po.payDone&&!po.paid)return {kind:"payment",path:po.payPath||po.path,acted:po.payAppr||[]};',
  '  if(PURF_USE_PAY&&po.stage==="Approved"&&!po.payDone&&!po.paid)return {kind:"payment",path:po.payPath||po.path,acted:po.payAppr||[]};', "livePath: payment path only when the process is on");

/* 3. lanes collapse */
swap('function purFLane(po){' + NL +
  '  if(po.stage==="Closed"||po.stage==="Voided")return po.stage;' + NL +
  '  if(po.stage==="Pending")return "Pending approval";',
  'function purFLane(po){' + NL +
  '  if(po.stage==="Closed"||po.stage==="Voided")return po.stage;' + NL +
  '  if(po.stage==="Pending")return "Pending approval";' + NL +
  '  /* With the payment process off there is nothing after approval to track: the pay, payDone and paid' + NL +
  '     fields stay on the fixtures so the constant can be flipped, but nothing reads them. */' + NL +
  '  if(!PURF_USE_PAY)return "Approved";', "lane: Pending approval / Approved when the process is off");

/* 4. no payment path seeded on completion */
swap('function purFApproveStep(w,po,note){',
  '/* Completing the request path opens the payment path only when the process is on; the legacy leaves' + NL +
  '   PO_Order.PaymentApprovalID null otherwise. */' + NL +
  'function purFSeedPayment(po){if(!PURF_USE_PAY)return;po.pay="unpaid";po.payPath=po.payPath||po.path;po.payAppr=po.payAppr||[];}' + NL +
  'function purFApproveStep(w,po,note){', "purFSeedPayment helper");
swap('po.stage="Approved";po.pay="unpaid";po.payPath=po.payPath||po.path;po.payAppr=po.payAppr||[];po.submitted=true;',
  'po.stage="Approved";purFSeedPayment(po);po.submitted=true;', "approveStep: release branch");
swap('po.stage="Approved";po.pay="unpaid";po.payPath=po.payPath||po.path;po.payAppr=po.payAppr||[];po.log.push',
  'po.stage="Approved";purFSeedPayment(po);po.log.push', "approveStep: path complete branch");

/* 5. the about text */
swap('var PURF_POP=null,PURF_MODAL=null,PURF_MOVE=null,PURF_HOLD=null,PURF_DRAG=null,PURF_Q="";',
  'var PURF_ABOUT_NOPAY="Purchase requests moving along their approval path. The board is the path itself: one column per approval level, in order, and a request sits in the column of the level that has to act next; a level whose dollar minimum the request does not reach is skipped. Approved requests leave the flow to Accounts Payable, and closed and voided orders stay in the table. Each card says whose approval is next; drag a request you can act on forward to record your approval, or open it for the record.";' + NL +
  'function purFAbout(){return PURF_USE_PAY?PURF_ABOUT:PURF_ABOUT_NOPAY;}' + NL +
  'var PURF_POP=null,PURF_MODAL=null,PURF_MOVE=null,PURF_HOLD=null,PURF_DRAG=null,PURF_Q="";', "about text for the flag off");

/* 6. the record pop-up: the two things the legacy page hides */
swap('  if(po.stage==="Approved"||po.stage==="Closed")tabs.push(["payment","Payment Approval"]);',
  '  /* Requests/Update.aspx:93 hides the Payment Approval tab when the process is off. */' + NL +
  '  if(PURF_USE_PAY&&(po.stage==="Approved"||po.stage==="Closed"))tabs.push(["payment","Payment Approval"]);', "record: Payment Approval tab");
swap('    (statusIsApproved||po.stage==="Approved"||po.stage==="Closed"?\'<div class="purf-fld"><span class="purf-flbl">Payment Approval Path</span>\'',
  '    (PURF_USE_PAY&&(statusIsApproved||po.stage==="Approved"||po.stage==="Closed")?\'<div class="purf-fld"><span class="purf-flbl">Payment Approval Path</span>\'', "record: Payment Approval Path dropdown");

/* 7. the table's screen-reader payment note */
swap('      ((po.stage==="Approved"&&po.pay)?", "+PURF_PAY_LBL[po.pay]:"")+',
  '      ((PURF_USE_PAY&&po.stage==="Approved"&&po.pay)?", "+PURF_PAY_LBL[po.pay]:"")+', "table: payment note");

/* 8. Glance: the third tile */
swap('  var next=pos.filter(function(p){return purFTurn(p).kind==="next";}).length,later=pos.filter(function(p){return purFTurn(p).kind==="mine";}).length,toPay=pos.filter(function(p){return purFLane(p)==="Ready to pay";}).length;',
  '  var next=pos.filter(function(p){return purFTurn(p).kind==="next";}).length,later=pos.filter(function(p){return purFTurn(p).kind==="mine";}).length,toPay=pos.filter(function(p){return purFLane(p)==="Ready to pay";}).length;' + NL +
  '  var others=pos.filter(function(p){return purFTurn(p).kind==="waiting";}).length;', "glance: waiting-on-others count");
swap('    {n:toPay,lbl:"To be paid",tone:PURF_STAGE_TONE["Ready to pay"],full:"Ready to pay: "+toPay+(toPay===1?" order":" orders")+" with payment approval complete, waiting for the check to be entered."}' + NL,
  '    /* Nothing waits to be paid when the payment process is off, so the third figure completes the' + NL +
  '       set the other way: mine now, mine later, someone else\'s. */' + NL +
  '    PURF_USE_PAY' + NL +
  '      ? {n:toPay,lbl:"To be paid",tone:PURF_STAGE_TONE["Ready to pay"],full:"Ready to pay: "+toPay+(toPay===1?" order":" orders")+" with payment approval complete, waiting for the check to be entered."}' + NL +
  '      : {n:others,lbl:"Waiting on others",tone:"var(--txt-secondary)",full:"Waiting on someone else: "+others+(others===1?" request":" requests")+" where the open level is someone else\'s and you are not on a later level."}' + NL, "glance: third tile");
swap('  var headFull="Everything waiting for someone to act: "+open.length+(open.length===1?" open order":" open orders")+" pending approval, in payment approval, or ready to pay.";',
  '  var headFull="Everything waiting for someone to act: "+open.length+(open.length===1?" open order":" open orders")+(PURF_USE_PAY?" pending approval, in payment approval, or ready to pay.":" still on an approval path.");', "glance: headline hover");

t = t.slice(0, b0) + blk + t.slice(b1);

/* 9. the register's about hook */
const REG = 'WIDGETS.register("purchasing",{content:purFContent,about:function(w){return {h:w.title,b:PURF_ABOUT};}});';
if (t.split(REG).length !== 2) throw new Error("register anchor");
t = t.replace(REG, 'WIDGETS.register("purchasing",{content:purFContent,about:function(w){return {h:w.title,b:purFAbout()};}});');
console.log("edited: register about hook");

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
