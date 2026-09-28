/* =====================================================================
   w13-purchasing.driver.js , W13 Purchasing Management, OUR block
   (prefix purF, kind "purchasing"), rebuilt 2026-09-26 on the legacy
   approval model (docs/decisions/W13.md). Jo's block was deleted on 27 Sep 2026 (finalised); this
   untouched and still compared on the cmp tab; this driver covers ours.

   Proves: one status vocabulary (Pending / Approved + archive); ordered
   Then/Or approval levels with dollar thresholds on both paths; lanes are
   derived (Pending approval, Payment approval, Ready to pay, Paid); the turn
   is computed the way the legacy "awaiting my approval (next)" queries do
   it; Rejected and Hold are rows that surface as badges; approving my level
   completes the path when every level is satisfied; payment approval, then
   payment entry, then Close; the scope chip carries the legacy vocabulary;
   tables obey D12; no em dashes.
   ===================================================================== */
"use strict";
const H = require("./jo-port-driver.js");
const START = "var PURF_TODAY=new Date(2026,7,19);", END = "/* ===== end W13 Purchasing Management V2 ===== */";
const CSS_START = "/* ===== W13 Purchasing Management V2 CSS =====", CSS_END = "/* ===== end W13 Purchasing Management V2 CSS ===== */";
const shell = H.loadShell();
const blockRaw = H.extractRegion(shell.script, START, END), css = H.extractRegion(shell.css, CSS_START, CSS_END);
/* finished widgets register themselves; the shim has no WIDGETS, so the register line is checked here and stripped before the block runs */
if (blockRaw.indexOf('WIDGETS.register("purchasing",{content:purFContent,about:') < 0) throw new Error("W13 block does not register kind purchasing");
const block = blockRaw.split(/\r?\n/).filter(function (l) { return l.indexOf('WIDGETS.register("purchasing",') !== 0; }).join("\r\n");
const registry = H.extractRegistry(shell.script, "purchasing");
const env = H.runBlock(block, { registry: registry, dataAttr: "data-purf" });
const META = H.meta("W13");   /* number, name, kind, prefix and tags from _tools/widget-map.json */
const A = new H.Assert(META.label + " (final, rebuilt on the legacy approval model)");
const POS = env.get("PURF_POS"), PATHS = env.get("PURF_PATHS"), ME = env.get("PURF_ME");
const W = function (id) { for (const w of registry) if (w.id === id) return w; throw new Error("no widget " + id); };
const C = function () { return env.call.apply(null, arguments); };
const po = function (ref) { return POS.filter(function (p) { return p.ref === ref; })[0]; };
const pristine = JSON.parse(JSON.stringify(POS));
const reset = function () { POS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach(function (p) { POS.push(p); }); };
const wide = W("purF"), kpi = W("purF_k"), xw = W("purF_x");
["purF", "purF_k", "purF_x"].forEach(function (id) { const w = W(id); w.purfLoading = false; });

/* ---------- 1. model ---------------------------------------------------- */
A.eq(env.get("PURF_STAGES").join(","), "Pending,Approved", "record status vocabulary is Pending / Approved (Rejected is not a status)");
A.eq(env.get("PURF_LANES").join("|"), "Pending approval|Payment approval|Ready to pay|Paid", "the four derived lanes");
A.eq(env.get("PURF_SCOPES").join("|"), "Awaiting my approval next|Awaiting my approval|All requests", "scope uses the legacy queue vocabulary");
A.ok(PATHS["QA Path"].steps[0].users.length === 2, "an Or level holds two interchangeable approvers (QA Path level 1)");
/* the owner's real Education Ministry path: Start with Alfred >= $500, Then Jim or Lanette >= $2,000, Ends with Pastor Bob >= $5,000 */
A.eq(PATHS["Education Ministry"].steps.map(function (s) { return s.users.length + ":" + s.mins.join("/"); }).join(" "), "1:500 2:2000/2000 1:5000", "per-approver minimums on every level");
A.eq(C("purFSteps", "Education Ministry", 430).length, 0, "$430: no approver's minimum is reached, no level applies");
A.eq(C("purFSteps", "Education Ministry", 640).length, 1, "$640: Alfred's level only");
A.eq(C("purFSteps", "Education Ministry", 3150).map(function (s) { return s.users.join("|"); }).join(" > "), "Alfred Johnson > Lanette Stewart|Jim AndersonAndMoreLetters", "$3,150: Alfred, then Lanette or Jim (screenshot order); Pastor Bob not reached");
A.eq(C("purFSteps", "Education Ministry", 5000).length, 3, "$5,000: all three levels");
A.eq(C("purFStepUsers", { users: ["A", "B"], mins: [1000, 3000] }, 1500).join(","), "A", "an Or level with different minimums keeps only the approvers whose minimum the total reaches");
A.eq(POS.filter(function (p) { return p.stage === "Rejected"; }).length, 0, "no order carries a Rejected stage");
A.eq(POS.filter(function (p) { return (p.appr || []).some(function (a) { return a.state === "rejected"; }); }).length, 2, "two orders carry a rejected approval row");
/* turn per demo record */
const turn = function (ref) { return C("purFTurn", po(ref)); };
A.eq(turn("PO-2893").kind, "next", "PO-2893: Nitzi approved level 1, my level 2 is next");
A.eq(turn("PO-2888").kind, "mine", "PO-2888: nobody has acted, I am on level 2, so awaiting me later");
A.eq(turn("PO-2899").kind, "waiting", "PO-2899 ($640): waiting on Alfred Johnson, the only applying approver"); A.ok(/Alfred Johnson \(level 1 of 1\)/.test(turn("PO-2899").label), "the label names Alfred and a one-level path at this amount");
A.eq(turn("PO-2891").kind, "hold", "PO-2891 ($3,150): Lanette holds at the Or level");
A.ok(turn("PO-2907").none === true && turn("PO-2907").kind === "next", "PO-2907 ($430): no approver required, offered for release");
A.eq(turn("PO-2897").kind, "next", "PO-2897: QA Path level 1 is Feargal OR me, so it is my turn");
A.eq(turn("PO-2902").kind, "rejected", "PO-2902: rejected row surfaces as the turn");
A.eq(turn("PO-2891").kind, "hold", "PO-2891: hold row surfaces as the turn");
A.eq(turn("PO-2872").kind, "next", "PO-2872: approved; payment path level 2 is mine and next");
A.eq(turn("PO-2879").kind, "waiting", "PO-2879: payment path Education Ministry, waiting on Ben Lane");
A.ok(/level 2 of 2, payment/.test(turn("PO-2872").label), "payment turn is labelled as payment");
A.eq(turn("PO-2861").kind, "none", "PO-2861: approved for payment, nobody's turn");
/* lanes per demo record */
const lane = function (ref) { return C("purFLane", po(ref)); };
A.eq(lane("PO-2893"), "Pending approval", "pending request lane"); A.eq(lane("PO-2902"), "Pending approval", "a rejected request stays in Pending approval");
A.eq(lane("PO-2872"), "Payment approval", "approved with open payment steps"); A.eq(lane("PO-2861"), "Ready to pay", "payment approved, no check yet"); A.eq(lane("PO-2864"), "Paid", "paid");
A.eq(C("purFMineSet", wide).length, 10, "ten requests await me (next or later, incl. the release case) across both paths");
A.eq(C("purFPendingCount", wide), 13, "thirteen requests pending approval");

/* ---------- 2. render ---------------------------------------------------- */
/* The table is the default view since 27 Sep; the board sections opt into Kanban at Detail explicitly. */
xw.purfView = "kanban";
[wide, kpi, xw].forEach(function (w) { const h = C("purFContent", w); A.ok(h && h.length > 800, w.id + " (" + w.size + ") renders (" + h.length + " bytes)"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) A.headMatchesBody(h, w.id + " table (D12)"); });
let h = C("purFContent", xw);
A.contains(h, '<span class="metric-value">10</span><span class="bank-pill">need your approval</span>', "Detail headline: requests awaiting me");
["Pending approval", "Payment approval", "Ready to pay", "Paid"].forEach(function (l) { A.contains(h, 'data-purf-drop="' + l + '"', "board has the " + l + " lane"); });
A.absent(h, 'data-purf-drop="Rejected"', "no Rejected lane"); A.absent(h, 'data-purf-drop="Approved"', "no raw Approved lane");
A.contains(h, 'class="purf-finish"', "Finish column at All statuses");
A.contains(h, "purf-turn purf-turn-next", "cards carry a next-turn badge"); A.contains(h, "purf-turn purf-turn-rejected", "rejected badge"); A.contains(h, "purf-turn purf-turn-hold", "hold badge"); A.contains(h, "purf-turn purf-turn-waiting", "waiting badge");
A.absent(h, 'draggable="false"', "every open card can be picked up (Close and Void are status actions, whatever the turn)"); A.contains(h, 'draggable="true"', "cards are draggable"); A.eq(C("purFCanDrag", { stage: "Closed" }), false, "a closed card cannot be picked up"); A.eq(C("purFCanDrag", { stage: "Voided" }), false, "a voided card cannot be picked up");
A.contains(h, 'data-purf="scope"', "scope chip present"); A.contains(h, ">All requests<", "scope defaults to All requests");
const hk = C("purFContent", kpi); const glOpen = POS.filter(function (p) { const l = C("purFLane", p); return l === "Pending approval" || l === "Payment approval" || l === "Ready to pay"; }).length;
A.contains(hk, '<span class="metric-value">' + glOpen + '</span>', "Glance headline: everything waiting for someone to act (owner, 27 Sep)"); A.contains(hk, ">waiting for action<", "headline pill"); A.contains(hk, 'title="Everything waiting for someone to act: ', "headline hover explains itself");
A.contains(hk, ">My approval<", "tile: Awaiting my approval next"); A.contains(hk, ">Coming to me<", "tile: Awaiting my approval, later"); A.contains(hk, ">To be paid<", "tile: Ready to pay");
A.contains(hk, 'title="Awaiting my approval next: 9 requests where your level is the next one to act."', "tile hover: full meaning with the count"); A.contains(hk, 'title="Awaiting my approval: 1 request on a path you are on', "tile hover: later"); A.contains(hk, 'title="Ready to pay: 1 order with payment approval complete', "tile hover: to be paid");
A.absent(hk, " pending, ", "caption is the outstanding figure only"); A.contains(hk, "$14,397.50 outstanding</span>", "caption: outstanding dollars"); A.absent(hk, "need your approval", "old headline gone");
/* scope filter */
xw.purfScope = "Awaiting my approval next"; h = C("purFContent", xw); A.eq((h.match(/purf-turn-next/g) || []).length, (h.match(/class="purf-kcard/g) || []).length, "'Awaiting my approval next' shows only next-turn cards (cards now carry our purf-kcard class)"); A.absent(h, "purf-turn-waiting", "no waiting cards under 'next'");
xw.purfScope = "Awaiting my approval"; h = C("purFContent", xw); A.ok(/purf-turn-mine/.test(h) && !/purf-turn-waiting/.test(h), "'Awaiting my approval' adds my later levels, still no waiting cards");
xw.purfScope = "All requests";
/* status chip means the lane on the board */
xw.purfStatus = "Payment approval"; h = C("purFContent", xw); A.eq((h.match(/data-purf-drop="/g) || []).length, 1, "one lane and no Finish column when a lane is chosen"); A.contains(h, "PO-2872", "Payment approval lane shows its cards"); xw.purfStatus = null;
xw.purfView = "table"; h = C("purFContent", xw); A.contains(h, ">Payment approval</span>", "table status cell names the lane"); A.contains(h, "purf-turn", "table rows carry the turn badge"); if (/wt-head/.test(h)) A.headMatchesBody(h, "table (D12)"); xw.purfView = null;

/* ---------- 3. actions on the live path --------------------------------- */
/* PO-2893: my level 2 is next; approving completes the request path */
let ok = C("purFApplyMove", wide, "PO-2893", "Payment approval", "fine"); A.eq(ok, true, "approving my next level is allowed");
A.eq(po("PO-2893").stage, "Approved", "PO-2893 becomes Approved when the last level is satisfied"); A.eq(lane("PO-2893"), "Payment approval", "and lands in Payment approval");
A.eq(turn("PO-2893").kind, "mine", "its payment path (Administration) waits on Nitzi at level 1, with me later at level 2");
/* PO-2888: my level is later; approving out of turn implies the lower level (legacy ApproveOrder) */
ok = C("purFApplyMove", wide, "PO-2888", "Payment approval", ""); A.eq(ok, true, "approving my later level is allowed (legacy lets a higher level approve out of turn)");
A.eq(po("PO-2888").stage, "Approved", "a higher-level approval implies the lower level, so PO-2888 is fully approved");
/* PO-2897: Or level: my approval satisfies it, and level 2 (Nitzi, from $2,000) is skipped at $1,120 */
ok = C("purFApplyMove", wide, "PO-2897", "Payment approval", ""); A.eq(ok && po("PO-2897").stage === "Approved", true, "an Or level is satisfied by any one approver; the threshold level above is skipped");
/* PO-2899: not my path */
let chk = C("purFMoveCheck", po("PO-2899"), "Payment approval"); A.eq(chk.ok, false, "cannot approve a request I am not on"); A.ok(/Not your approval/.test(chk.msg), "the refusal names the turn");
/* PO-2907: no applying approver at $430, released by the viewer */
ok = C("purFApplyMove", wide, "PO-2907", "Payment approval", ""); A.eq(ok && po("PO-2907").stage === "Approved", true, "a request no level applies to is released on approval");
/* PO-2902: rejected */
chk = C("purFMoveCheck", po("PO-2902"), "Payment approval"); A.eq(chk.ok, false, "a rejected request cannot be approved until the rejection is cleared");
A.eq(C("purFClearReject", po("PO-2902")), true, "clearing the rejection"); A.eq(turn("PO-2902").kind, "mine", "after clearing, the path restarts at Nitzi's level 1 with me later at level 2");
/* PO-2891: hold */
chk = C("purFMoveCheck", po("PO-2891"), "Payment approval"); A.eq(chk.ok, false, "a held request cannot move");
/* skipping a lane */
chk = C("purFMoveCheck", po("PO-2872"), "Paid"); A.eq(chk.ok, false, "a request moves one lane at a time");
/* payment approval then payment entry then close */
ok = C("purFApplyMove", wide, "PO-2872", "Ready to pay", ""); A.eq(ok, true, "approving my payment level"); A.eq(po("PO-2872").payDone, true, "payment path complete"); A.eq(lane("PO-2872"), "Ready to pay", "PO-2872 is ready to pay");
chk = C("purFMoveCheck", po("PO-2872"), "Closed"); A.eq(chk.ok, true, "Close is allowed at any time, as the record's Status list offers Closed from every status (owner, 27 Sep)"); chk = C("purFMoveCheck", po("PO-2891"), "Closed"); A.eq(chk.ok, true, "a held card can be closed"); chk = C("purFMoveCheck", po("PO-2899"), "Voided"); A.eq(chk.ok, true, "a card that is not my turn can be voided"); chk = C("purFMoveCheck", po("PO-2899"), "Payment approval"); A.eq(chk.ok, false, "but not approved");
ok = C("purFApplyMove", wide, "PO-2872", "Paid", ""); A.eq(ok, true, "payment entry"); A.eq(lane("PO-2872"), "Paid", "PO-2872 is paid");
ok = C("purFApplyMove", wide, "PO-2872", "Closed", "done"); A.eq(ok, true, "a paid order can be closed"); A.eq(po("PO-2872").stage, "Closed", "PO-2872 closed");
chk = C("purFMoveCheck", po("PO-2864"), "Voided"); A.eq(chk.ok, false, "a paid order cannot be voided here");
chk = C("purFMoveCheck", po("PO-2903"), "Voided"); A.eq(chk.ok, true, "an unpaid request can be voided");
/* reject and hold as rows */
A.eq(C("purFRejectStep", wide, po("PO-2901"), "Wrong vendor"), true, "rejecting my level"); A.eq(turn("PO-2901").kind, "rejected", "PO-2901 shows rejected"); A.eq(po("PO-2901").stage, "Pending", "and stays Unapproved");
A.eq(C("purFApplyHold", wide, "PO-2904", "hold", "Budget check"), true, "holding"); A.eq(turn("PO-2904").kind, "hold", "PO-2904 shows hold"); A.ok(po("PO-2904").appr.some(function (a) { return a.state === "hold"; }), "hold is a row on the live path");
A.eq(C("purFApplyHold", wide, "PO-2904", "unhold", ""), true, "removing the hold"); A.eq(turn("PO-2904").kind, "next", "PO-2904 is my turn again");
reset();

/* ---------- 4. Record screen: Requests/Update one to one (owner, 27 Sep) --- */
const openTab = function (ref, tab) { C("purFOpenPO", xw, ref); const m = env.get("PURF_MODAL"); m.tab = tab || "approvals"; return C("purFModalHTML"); };
const draft = function () { return env.get("PURF_MODAL").draft; };
reset();
/* header, tabs, footer, scroll */
let mh = openTab("PO-2893", "detail"); A.ok(mh.length > 3000, "record renders");
["Vendor", "Ship To", ">Email<", ">Type<", ">Status<", "Approval Path", "Requisition #", "Purchase Order #", "Purchase Order Date", "Issued To", ">Agent<", ">Shipping<", "Date Requested"].forEach(function (f) { A.contains(mh, f, "header field " + f); });
A.contains(mh, "<strong>Terms:</strong>", "vendor terms line"); A.contains(mh, "purf-m-scroll", "scrolling body"); A.contains(mh, 'data-purf="record-save"', "Save button"); A.contains(mh, ">Cancel</button>", "Cancel button");
A.ok(mh.indexOf(">Cancel</button>") < mh.indexOf('data-purf="record-save"'), "Cancel then Save, bottom right"); A.absent(mh, ">Update</button>", "no Update button");
A.contains(mh, 'data-v="detail"', "tab Detail"); A.contains(mh, 'data-v="approvals"', "tab Approvals"); A.contains(mh, 'data-v="attachments"', "tab Attachments"); A.contains(mh, 'data-v="note"', "tab Note"); A.absent(mh, 'data-v="payment"', "no Payment Approval tab while Unapproved");
A.contains(mh, 'data-purf-sel="status"', "Status is a dropdown"); A.contains(mh, 'data-purf-sel="path"', "Approval Path is a dropdown"); A.contains(mh, 'data-purf-sel="type"', "Type is a dropdown");
A.absent(mh, 'data-purf="submit-toggle"', "PO-2893 has an approved row, so Submit for Approval is hidden (submitForApproval())");
mh = openTab("PO-2888", "detail"); A.contains(mh, 'data-purf="submit-toggle"', "Submit for Approval shown while Unapproved with nothing approved"); A.contains(mh, "Leaving this check box unchecked will put this request on hold", "the page's hover text");
/* grid: one row per approver, legacy wording */
mh = openTab("PO-2893"); A.contains(mh, "Starts with Alberto Allen", "creator row at level 0 when the creator is not on the path"); A.contains(mh, "Then Nitzi Wright", "then the path in order"); A.contains(mh, "Ends with Oisin Curran (you)", "last row reads Ends with");
A.contains(mh, "Approval Needed By:", "column 1"); A.contains(mh, ">Approved<", "column Approved"); A.contains(mh, ">Rejected<", "column Rejected"); A.contains(mh, ">Hold<", "column Hold"); A.contains(mh, "Approval Updated By:", "column Approval Updated By"); A.eq((mh.match(/>Reason</g) || []).length, 2, "two Reason columns");
A.contains(mh, 'role="cell">Nitzi Wright Jul 3, 2026</span>', "Approval Updated By carries actor and date"); A.absent(mh, "(from $", "no per-approver minimum text (the page has none)"); A.absent(mh, "Skipped:", "no skipped wording (the page has none)");
mh = openTab("PO-2899"); A.contains(mh, "Then Lanette Stewart", "Or level: first approver as Then"); A.contains(mh, '<span class="purf-a-or"></span>Or Jim AndersonAndMoreLetters', "second approver on the same level indented as Or"); A.contains(mh, "out of office until Sep 5, 2026", "out-of-office flag from user meta"); A.contains(mh, "Ends with Pastor Bob", "Ends with the last level");
/* enablement (setApprovalRows) */
let rows = draft().rows; let en = C("purFGridEnable", rows, true);
A.eq(en.noRight, true, "PO-2899: I am not on Education Ministry, so Approved and Rejected are read-only"); A.ok(rows.every(function (r) { return !r.canApprove && !r.canReject; }), "no Approved/Rejected box enabled");
mh = openTab("PO-2893"); rows = draft().rows; en = C("purFGridEnable", rows, true);
A.eq(rows[0].creator, true, "row 0 is the creator"); A.eq(rows[0].approved, true, "creator row ticked = submitted"); A.eq(rows[1].approved, true, "Nitzi's level 1 is approved"); A.eq(rows[2].user, ME, "row 2 is mine"); A.eq(rows[2].canApprove, true, "my row is enabled");
mh = openTab("PO-2888"); rows = draft().rows; en = C("purFGridEnable", rows, true);
A.eq(rows.filter(function (r) { return !r.creator; }).every(function (r) { return r.canApprove; }), true, "PO-2888: nothing acted, every level down to mine is enabled");
/* cascade (checkApproved click) */
C("purFGridTick", rows, 2, "approve", true); A.ok(rows[1].approved && rows[2].approved, "ticking my level ticks the level below"); A.eq(rows[1].rejected || rows[1].hold, false, "and clears its Rejected and Hold");
C("purFGridTick", rows, 1, "approve", false); A.ok(!rows[1].approved && !rows[2].approved, "unticking a level clears it and every level above");
C("purFGridTick", rows, 1, "reject", true); en = C("purFGridEnable", rows, true); A.eq(rows[1].canApprove, false, "a rejected row disables its Approved"); A.eq(rows[1].canRejReason, true, "its Reason is editable while ticked"); A.eq(rows[1].canHold, false, "and its Hold");
C("purFGridTick", rows, 1, "reject", false); C("purFGridTick", rows, 1, "hold", true); en = C("purFGridEnable", rows, true); A.eq(rows[1].canHoldReason, true, "hold reason editable while Hold is ticked"); A.eq(rows[1].canApprove, false, "hold disables Approved on the row");
/* a later level acted locks Approved and Rejected everywhere */
const fake = [{ seq: 1, user: "Nitzi Wright", min: 0, pre: "Starts with " }, { seq: 2, user: ME, min: 0, pre: "Then " }, { seq: 3, user: "Pastor Bob", min: 0, pre: "Ends with ", approved: true }];
en = C("purFGridEnable", fake, true); A.eq(en.lockedAbove, true, "an acted row on a later level locks"); A.ok(fake.every(function (r) { return !r.canApprove && !r.canReject; }), "every Approved and Rejected box disabled");
/* status options */
let opts = C("purFStatusOptions", po("PO-2893"), "Unapproved", draft().rows); A.eq(opts.filter(function (o) { return o.enabled; }).map(function (o) { return o.value; }).join(","), "Unapproved,Closed", "Unapproved: current and Closed only");
opts = C("purFStatusOptions", po("PO-2872"), "Approved", []); A.eq(opts.filter(function (o) { return o.enabled; }).map(function (o) { return o.value; }).join(","), "Approved,Closed", "Approved on Everyone (creator not on path): Voided stays disabled, as LoadApprovals does");
opts = C("purFStatusOptions", po("PO-2610"), "Closed", []); A.ok(opts.filter(function (o) { return o.value === "Approved"; })[0].enabled, "Closed offers Approved (reopen)");
/* Save applies the draft; Cancel discards */
reset(); mh = openTab("PO-2888"); rows = draft().rows; C("purFGridTick", rows, 2, "approve", true);
C("purFRecordSave", xw, po("PO-2888"), draft()); A.eq(po("PO-2888").stage, "Approved", "Save: my approval with the cascade completes the path"); A.ok(po("PO-2888").appr.some(function (a) { return a.user === "Nitzi Wright" && a.by === ME; }), "the cascaded row is stored with me as the actor"); A.contains(po("PO-2888").log[po("PO-2888").log.length - 1].note, "Record saved", "activity logged");
reset(); mh = openTab("PO-2888"); const d2 = draft(); d2.submit = false; C("purFRecordSave", xw, po("PO-2888"), d2); A.eq(po("PO-2888").submitted, false, "Save unticked: not submitted"); A.eq(turn("PO-2888").kind, "hold", "not submitted shows as a hold on the approval process (the page's hover text)"); A.eq(C("purFMoveCheck", po("PO-2888"), "Payment approval").ok, false, "and cannot be approved from the board (Close and Void stay possible, as on the page)");
mh = openTab("PO-2888"); A.contains(mh, "Not submitted for approval", "turn line says so"); A.eq(draft().submit, false, "checkbox reflects it"); const d3 = draft(); d3.submit = true; C("purFRecordSave", xw, po("PO-2888"), d3); A.eq(po("PO-2888").submitted, true, "re-submitted"); A.eq(turn("PO-2888").kind, "mine", "back on the path");
reset(); mh = openTab("PO-2893", "detail"); C("purFFieldSet", po("PO-2893"), "email", "x@y.z"); C("purFRecordCancel", po("PO-2893"), draft()); A.eq(C("purFF", po("PO-2893"), "email"), "", "Cancel restores header fields");
/* status dropdown on save */
reset(); mh = openTab("PO-2903"); const d4 = draft(); d4.status = "Closed"; C("purFRecordSave", xw, po("PO-2903"), d4); A.eq(po("PO-2903").stage, "Closed", "Closed is always offered on the record, as on the page");
reset(); mh = openTab("PO-2903"); const d5 = draft(); d5.status = "Voided"; C("purFRecordSave", xw, po("PO-2903"), d5); A.eq(po("PO-2903").stage, "Pending", "Voided is refused from Unapproved (not offered)");
/* header lock once a row acted */
reset(); mh = openTab("PO-2893", "detail"); A.contains(mh, 'aria-label="Approval Path" disabled', "Approval Path locked once a row has acted"); A.contains(mh, 'aria-label="Type" disabled', "Type locked too"); A.contains(mh, "Lines, Type, Approval Path, Vendor and Ship To are locked", "lines locked note");
mh = openTab("PO-2888", "detail"); A.contains(mh, 'aria-label="Approval Path" disabled', "submitted: the creator row counts as acted, so the path is locked (setApprovalRows)"); po("PO-2888").submitted = false; mh = openTab("PO-2888", "detail"); A.absent(mh, 'aria-label="Approval Path" disabled', "not submitted: nothing acted, path editable"); po("PO-2888").submitted = true;
/* read-only records */
mh = openTab("PO-2610"); A.contains(mh, "Read-only: this order is approved and paid", "paid order grid is read-only"); A.contains(mh, 'data-v="payment"', "Payment Approval tab once Approved/Closed");
mh = openTab("PO-2872", "payment"); A.contains(mh, "Payment Approval Path: Administration", "payment grid lives on the Payment Approval tab"); A.contains(mh, "Add Invoice Payment Approval", "invoice grid follows");
/* the board drop writes the same rows Save writes */
reset(); C("purFApplyMove", wide, "PO-2888", "Payment approval", ""); A.eq(po("PO-2888").stage, "Approved", "drop: approved"); A.ok(po("PO-2888").appr.some(function (a) { return a.user === "Nitzi Wright" && a.by === ME; }) && po("PO-2888").appr.some(function (a) { return a.user === ME; }), "drop stores the cascaded rows like Save");
C("purFCloseModal"); reset();

/* ---------- 4b. legend (owner, 27 Sep): info icon top right, Explore and Detail only ---- */
xw.purfView = "kanban"; const hdWide = C("purFHeaderBlock", wide), hdX = C("purFHeaderBlock", xw), glance = C("purFContent", kpi);
A.contains(hdWide, 'data-purf="legend"', "Explore header carries the legend icon"); A.contains(hdX, 'data-purf="legend"', "Detail header carries the legend icon");
A.absent(glance, 'data-purf="legend"', "Glance has no legend icon");
A.ok(hdX.indexOf("dep-hd-num") < hdX.indexOf('data-purf="legend"'), "the icon sits in the headline row, one line below the toggle (owner, 27 Sep)");
C("purFOpenPop", "legend", xw.id, null); A.eq(env.get("PURF_POP").type, "legend", "the icon opens the legend pop-up");
const lg = C("purFPopContent");
["Lanes", "Badges: whose turn it is", "Card colours", "Moving a card"].forEach(function (c) { A.contains(lg, '<div class="cap">' + c + "</div>", "legend section " + c); });
env.get("PURF_LANES").forEach(function (l) { A.contains(lg, ">" + l + "</span>", "legend names lane " + l); });
["next", "mine", "waiting", "rejected", "hold"].forEach(function (k) { A.contains(lg, "purf-turn purf-turn-" + k, "legend shows the " + k + " badge with its real class"); });
["purf-card-next", "purf-card-ok", "purf-card-paid", "purf-card-hold", "purf-card-rej"].forEach(function (k) { A.contains(lg, k, "legend shows card colour " + k); });
A.contains(lg, "purf-fin-close", "legend shows the Close zone"); A.contains(lg, "purf-fin-void", "legend shows the Void zone"); A.contains(lg, "purf-age-hot", "legend shows the overdue clock");
A.contains(lg, "One lane at a time", "legend states the move rules"); A.noEmDash(lg, "legend");
C("purFClosePop"); A.eq(env.get("PURF_POP"), null, "legend closes");

/* ---------- 4c. Explore board scrolls sideways (owner, 27 Sep) ------------ */
wide.purfView = "kanban"; wide.purfStatus = null;
const bw = C("purFBoard", wide), bx = C("purFBoard", xw);
A.contains(bw, "grid-template-columns:repeat(4,minmax(180px,1fr)) 96px", "Explore: four lanes keep a 180px minimum and Finish is a fixed track");
A.contains(bx, "grid-template-columns:repeat(4,1fr) 0.6fr", "Detail: unchanged fluid tracks");
A.contains(css, '.purf-root[data-tier="wide"] .purf-board{overflow-x:auto;overflow-y:hidden', "Explore board scrolls sideways only, never up and down");

/* ---------- 4d. Encumbrances view (owner, 27 Sep) ----------------------- */
reset();
A.contains(C("purFViewToggle", wide), 'data-v="enc"', "toggle offers Encumbrances"); A.contains(C("purFViewToggle", xw), ">Encumbrances<", "segment label at Detail (Explore is icon-only)");
wide.purfView = "enc"; xw.purfView = "enc"; wide.purfPath = null; xw.purfPath = null;
A.eq(C("purFViewCur", wide), "enc", "view resolves to enc");
const encRows = C("purFEncRows", wide), all = env.get("PURF_POS");
A.ok(encRows.length > 0, "there are open encumbrances");
A.ok(encRows.every(function (p) { return (p.stage === "Pending" || p.stage === "Approved") && !p.paid && p.pay !== "paid" && !(p.appr || []).some(function (a) { return a.state === "rejected"; }); }), "open = pending or approved, unpaid, no rejected row (GLAccountRepository.cs:2220)");
A.eq(all.filter(function (p) { return p.stage === "Closed" || p.stage === "Voided" || p.paid; }).filter(function (p) { return encRows.indexOf(p) > -1; }).length, 0, "closed, voided and paid orders never encumber");
A.ok(encRows.some(function (p) { return p.hold; }), "held orders still count (no legacy hold exclusion)");
A.eq(C("purFEncTotal", wide), encRows.reduce(function (s, p) { return s + p.amt; }, 0), "total = sum of open order totals");
const pers = C("purFEncPeriods", wide);
A.ok(pers.length > 1, "more than one accounting period"); A.eq(pers.map(function (r) { return r.key; }).join(","), pers.map(function (r) { return r.key; }).sort().join(","), "periods in chronological order");
A.eq(pers.reduce(function (s, r) { return s + r.n; }, 0), encRows.length, "every open order lands in exactly one period");
A.ok(/^[A-Z][a-z]{2} 20\d\d$/.test(pers[0].label), "period label is Mon YYYY");
const hdE = C("purFHeaderBlock", wide);
A.contains(hdE, "encumbered, not yet paid", "headline is the encumbered total"); A.absent(hdE, 'data-purf="status"', "status chip hidden in the Encumbrances view");
A.contains(hdE, 'data-purf="path"', "approval path chip stays"); A.contains(hdE, "open order", "context line counts open orders");
const encW = C("purFEncView", wide), encX = C("purFEncView", xw);
A.absent(encW, 'data-purf="enc-view"', "Explore: the Chart / Table sub-toggle is not in the body"); A.contains(C("purFHeaderBlock", wide), 'data-purf="enc-view"', "Explore: the sub-toggle sits on the headline row, level with the total (owner, 27 Sep)"); A.absent(C("purFHeaderBlock", xw), 'data-purf="enc-view"', "Detail header has no sub-toggle"); A.contains(encW, "purf-enc-col", "Explore: chart bars");
A.eq((encW.match(/purf-enc-col"/g) || []).length, pers.length, "one bar per period");
A.contains(encX, "purf-enc-split", "Detail: chart and table side by side"); A.contains(encX, "Total encumbered, not yet paid", "Detail: table total row");
A.absent(encX, 'data-purf="enc-view"', "Detail has no sub-toggle");
wide.purfEncView = "table"; const encT = C("purFEncView", wide); A.contains(encT, "purf-enc-tbl", "Explore table on demand");
A.eq((encT.match(/purf-enc-trow/g) || []).length, pers.length, "one table row per period");
env.get("PURF_POP"); C("purFClosePop");
/* bar pop-up lists the orders behind a period with their lane */
const body = C("purFBody", wide); A.contains(body, "purf-enc", "body renders the view");
xw.purfView = "table"; wide.purfView = "kanban"; wide.purfEncView = null;
A.absent(C("purFLegendHTML", wide), "Encumbrances view", "legend carries no Encumbrances note (icon is hidden in that view)");
A.contains(css, ".purf-root .purf-enc-bar{", "chart CSS copied as purf-enc-*"); A.absent(block, ".pur-bar", "no dependency on her .pur-bar class");
reset();

/* ---------- 4e. legend by view, no Kanban at Explore (owner, 27 Sep) ------ */
reset(); wide.purfView = null; xw.purfView = null; wide.purfEncView = null;
A.absent(C("purFViewToggle", wide), 'data-v="kanban"', "Explore toggle has no Kanban"); A.contains(C("purFViewToggle", wide), 'data-v="table"', "Explore offers Table"); A.contains(C("purFViewToggle", wide), 'data-v="enc"', "Explore offers Encumbrances");
A.contains(C("purFViewToggle", xw), 'data-v="kanban"', "Detail keeps Kanban");
A.eq(C("purFViewCur", wide), "table", "Explore default view is the table"); A.eq(C("purFViewCur", xw), "table", "Detail default view is the table too (owner, 27 Sep)"); xw.purfView = "kanban"; A.eq(C("purFViewCur", xw), "kanban", "Kanban stays an explicit choice at Detail"); xw.purfView = null;
wide.purfView = "kanban"; A.eq(C("purFViewCur", wide), "table", "a stored kanban view resolves to table at Explore"); wide.purfView = null;
xw.purfView = "enc"; A.absent(C("purFHeaderBlock", xw), 'data-purf="legend"', "no legend icon in the Encumbrances view"); xw.purfView = "table";
A.contains(C("purFHeaderBlock", xw), 'data-purf="legend"', "legend icon in the Table view");
C("purFOpenPop", "legend", xw.id, null); const lgT = C("purFPopContent"); C("purFClosePop");
A.contains(lgT, '<div class="cap">Status</div>', "table legend: Status section"); A.contains(lgT, ">Closed</span>", "table legend names Closed"); A.contains(lgT, ">Voided</span>", "table legend names Voided");
A.contains(lgT, "purf-ovflag", "table legend shows the Overdue flag"); A.contains(lgT, "purf-turn purf-turn-next", "table legend keeps the badges");
["purf-card-", "purf-fin-close", "Moving a card", "Drag the card", "Encumbrances view", "purf-age-hot"].forEach(function (k) { A.absent(lgT, k, "table legend has no board-only item " + k); });
xw.purfView = "kanban"; C("purFOpenPop", "legend", xw.id, null); const lgK = C("purFPopContent"); C("purFClosePop");
A.contains(lgK, '<div class="cap">Lanes</div>', "board legend: Lanes"); A.contains(lgK, "purf-card-next", "board legend: card colours"); A.contains(lgK, "Moving a card", "board legend: move rules"); A.absent(lgK, ">Closed</span>", "board legend has no Closed chip");
xw.purfView = null; reset();

/* ---------- 4f. Table first; short chip labels at Explore (owner, 27 Sep) -- */
reset(); wide.purfView = null; xw.purfView = null; wide.purfScope = null; xw.purfScope = null;
const tgX = C("purFViewToggle", xw); A.ok(tgX.indexOf('data-v="table"') < tgX.indexOf('data-v="kanban"') && tgX.indexOf('data-v="kanban"') < tgX.indexOf('data-v="enc"'), "Detail toggle order: Table, Kanban, Encumbrances");
const tgW = C("purFViewToggle", wide); A.ok(tgW.indexOf('data-v="table"') < tgW.indexOf('data-v="enc"'), "Explore toggle order: Table, Encumbrances");
const hW = C("purFHeaderBlock", wide), hX = C("purFHeaderBlock", xw);
A.contains(hW, '<span class="fc-label">All statuses</span>', "Explore status chip drops the Status: prefix"); A.contains(hX, '<span class="fc-label">Status: All statuses</span>', "Detail status chip unchanged");
A.contains(hW, '<span class="fc-label">All paths</span>', "Explore path chip reads All paths"); A.contains(hX, '<span class="fc-label">All approval paths</span>', "Detail path chip unchanged");
A.contains(hW, 'aria-label="Approval path, currently All approval paths"', "Explore aria keeps the full wording");
wide.purfScope = "Awaiting my approval next"; A.contains(C("purFHeaderBlock", wide), '<span class="fc-label">My approval next</span>', "Explore scope: My approval next");
wide.purfScope = "Awaiting my approval"; A.contains(C("purFHeaderBlock", wide), '<span class="fc-label">My approval</span>', "Explore scope: My approval");
xw.purfScope = "Awaiting my approval next"; A.contains(C("purFHeaderBlock", xw), '<span class="fc-label">Awaiting my approval next</span>', "Detail scope unchanged");
wide.purfScope = null; xw.purfScope = null; reset();

/* ---------- 4g. Explore header: one layout at both tiers (owner, 27 Sep: "fix this to way it was before") -- */
reset(); wide.purfView = null; xw.purfView = null;
const hsW = C("purFHeaderBlock", wide), hsX = C("purFHeaderBlock", xw);
[hsW, hsX].forEach(function (h, i) { const n = i ? "Detail" : "Explore"; A.contains(h, 'class="dep-hd-toggle"', n + ": labelled toggle on the chip line"); A.contains(h, ">Encumbrances</button>", n + ": toggle keeps its labels"); A.ok(h.indexOf("dep-hd-num") < h.indexOf('data-purf="legend"'), n + ": legend icon on the headline row"); });
A.absent(hsW, "purf-hd-acts", "no stacked actions cell"); A.absent(css, "purf-vtoggle-ic", "no icon-only toggle CSS");
A.contains(css, "justify-self:stretch;align-self:center;}", "chip row stretches to its track (was start-justified and overflowed under the toggle)");
A.contains(css, '.purf-root[data-tier="wide"] .purf-chip::before{display:none;}', "Explore chips drop the leading filter glyph");
wide.purfView = "enc"; A.absent(C("purFHeaderBlock", wide), 'data-purf="legend"', "Explore enc view hides the legend"); wide.purfView = null; reset();

/* ---------- 5. hygiene --------------------------------------------------- */
A.noEmDash(block.replace(/\/\*[\s\S]*?\*\//g, ""), "block code");
A.contains(css, ".purf-turn-next", "turn badge CSS"); A.contains(css, ".purf-turnline", "turn line CSS");
A.absent(block.replace(/\/\*[\s\S]*?\*\//g, ""), 'stage==="Rejected"', "no code tests for a Rejected stage");
process.exit(A.report());
