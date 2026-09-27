/* =====================================================================
   w13-purchasing-mb.driver.js , W13 Purchasing Management, OUR block
   (prefix purF, kind "purchasing-mb"), rebuilt 2026-09-26 on the legacy
   approval model (docs/decisions/W13.md). Jo's "purchasing" block is
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
const block = H.extractRegion(shell.script, START, END), css = H.extractRegion(shell.css, CSS_START, CSS_END);
const registry = H.extractRegistry(shell.script, "purchasing-mb");
const env = H.runBlock(block, { registry: registry, dataAttr: "data-purf" });
const A = new H.Assert("W13 purchasing-mb (approval-path model)");
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
A.eq(C("purFSteps", "Education Ministry", 3150).map(function (s) { return s.users.join("|"); }).join(" > "), "Alfred Johnson > Jim AndersonAndMoreLetters|Lanette Stewart", "$3,150: Alfred, then Jim or Lanette; Pastor Bob not reached");
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
[wide, kpi, xw].forEach(function (w) { const h = C("purFContent", w); A.ok(h && h.length > 800, w.id + " (" + w.size + ") renders (" + h.length + " bytes)"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) A.headMatchesBody(h, w.id + " table (D12)"); });
let h = C("purFContent", xw);
A.contains(h, '<span class="metric-value">10</span><span class="bank-pill">need your approval</span>', "Detail headline: requests awaiting me");
["Pending approval", "Payment approval", "Ready to pay", "Paid"].forEach(function (l) { A.contains(h, 'data-purf-drop="' + l + '"', "board has the " + l + " lane"); });
A.absent(h, 'data-purf-drop="Rejected"', "no Rejected lane"); A.absent(h, 'data-purf-drop="Approved"', "no raw Approved lane");
A.contains(h, 'class="purf-finish"', "Finish column at All statuses");
A.contains(h, "purf-turn purf-turn-next", "cards carry a next-turn badge"); A.contains(h, "purf-turn purf-turn-rejected", "rejected badge"); A.contains(h, "purf-turn purf-turn-hold", "hold badge"); A.contains(h, "purf-turn purf-turn-waiting", "waiting badge");
A.contains(h, 'draggable="false"', "cards the viewer cannot act on are not draggable"); A.contains(h, 'draggable="true"', "cards the viewer can act on are draggable");
A.contains(h, 'data-purf="scope"', "scope chip present"); A.contains(h, ">All requests<", "scope defaults to All requests");
const hk = C("purFContent", kpi); A.contains(hk, '<span class="metric-value">10</span>', "Glance headline: requests awaiting me"); A.contains(hk, ">Pending<", "Glance tiles"); A.contains(hk, "13 pending, ", "Glance caption");
/* scope filter */
xw.purfScope = "Awaiting my approval next"; h = C("purFContent", xw); A.eq((h.match(/purf-turn-next/g) || []).length, (h.match(/class="pur-kcard/g) || []).length, "'Awaiting my approval next' shows only next-turn cards"); A.absent(h, "purf-turn-waiting", "no waiting cards under 'next'");
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
chk = C("purFMoveCheck", po("PO-2872"), "Closed"); A.eq(chk.ok, false, "cannot close before payment");
ok = C("purFApplyMove", wide, "PO-2872", "Paid", ""); A.eq(ok, true, "payment entry"); A.eq(lane("PO-2872"), "Paid", "PO-2872 is paid");
ok = C("purFApplyMove", wide, "PO-2872", "Closed", "done"); A.eq(ok, true, "a paid order can be closed"); A.eq(po("PO-2872").stage, "Closed", "PO-2872 closed");
chk = C("purFMoveCheck", po("PO-2864"), "Voided"); A.eq(chk.ok, false, "a paid order cannot be voided here");
chk = C("purFMoveCheck", po("PO-2903"), "Voided"); A.eq(chk.ok, true, "an unpaid request can be voided");
/* reject and hold as rows */
A.eq(C("purFRejectStep", wide, po("PO-2901"), "Wrong vendor"), true, "rejecting my level"); A.eq(turn("PO-2901").kind, "rejected", "PO-2901 shows rejected"); A.eq(po("PO-2901").stage, "Pending", "and stays Unapproved");
A.eq(C("purFApplyHold", wide, "PO-2904", "hold", "Budget check"), true, "holding"); A.eq(turn("PO-2904").kind, "hold", "PO-2904 shows hold"); A.ok(po("PO-2904").appr.some(function (a) { return a.state === "hold"; }), "hold is a row on the live path");
A.eq(C("purFApplyHold", wide, "PO-2904", "unhold", ""), true, "removing the hold"); A.eq(turn("PO-2904").kind, "next", "PO-2904 is my turn again");
reset();

/* ---------- 4. Approvals tab: one row per level ------------------------- */
const openTab = function (ref) { C("purFOpenPO", xw, ref); const m = env.get("PURF_MODAL"); m.tab = "approvals"; return C("purFModalHTML"); };
let mh = openTab("PO-2893"); A.ok(mh.length > 1500, "modal renders");
A.contains(mh, "Approval Path: Administration", "request path grid"); A.contains(mh, "Starts with Nitzi Wright", "level 1 named"); A.contains(mh, "Ends with Oisin Curran (you)", "level 2 named as the viewer");
A.eq((mh.match(/purf-ap-me/g) || []).length, 1, "exactly one row is the viewer's to act on"); A.contains(mh, "Nitzi Wright " , "updated-by carries the actor");
A.absent(mh, "Payment Approval Path: ", "no payment grid while Pending (the form field of that name stays)");
A.contains(mh, "purf-turnline purf-turn-next", "the tab states the turn");
mh = openTab("PO-2872"); A.contains(mh, "Payment Approval Path: Administration", "payment grid once Approved"); A.contains(mh, "Approval Path: Everyone", "request grid stays for the record");
mh = openTab("PO-2899"); A.contains(mh, "Skipped: below every minimum on this level", "a skipped level says so (Jim or Lanette at $640)"); A.contains(mh, "Alfred Johnson (from $500.00)", "each approver shows their own minimum"); A.contains(mh, "Jim AndersonAndMoreLetters (from $2,000.00) or Lanette Stewart (from $2,000.00)", "an Or level lists both approvers with minimums"); C("purFCloseModal");
A.absent(mh, "Rejected requests do not enter", "rejected copy keyed on the row, not a stage");

/* ---------- 5. hygiene --------------------------------------------------- */
A.noEmDash(block.replace(/\/\*[\s\S]*?\*\//g, ""), "block code");
A.contains(css, ".purf-turn-next", "turn badge CSS"); A.contains(css, ".purf-turnline", "turn line CSS");
A.absent(block.replace(/\/\*[\s\S]*?\*\//g, ""), 'stage==="Rejected"', "no code tests for a Rejected stage");
process.exit(A.report());
