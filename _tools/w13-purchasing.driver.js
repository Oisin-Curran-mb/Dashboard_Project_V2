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

/* PURF_USE_PAY models PO_Company.UsePaymentApprovalProcess, whose DB default is 0 (off), and the widget
   ships with it off (owner, 28 Sep). Sections 1 to 4g below describe the payment process ON: the four
   lanes, the payment chain, the payment legend and the Payment Approval tab. They are asserted unchanged,
   with the flag forced on, because that behaviour is still reachable by flipping the constant. Section 6
   at the end covers the shipped default: the approval-path board. */
const payOn = function (on) { env.ctx.PURF_USE_PAY = !!on; };
A.eq(env.get("PURF_USE_PAY"), false, "the payment approval process ships off, as PO_Company.UsePaymentApprovalProcess defaults to 0");
payOn(true);

/* ---------- 1. model ---------------------------------------------------- */
A.eq(env.get("PURF_STAGES").join(","), "Pending,Approved", "record status vocabulary is Pending / Approved (Rejected is not a status)");
A.eq(env.get("PURF_LANES").join("|"), "Pending approval|Payment approval|Ready to pay|Paid", "the four derived lanes");
A.eq(env.get("PURF_STATUS_OPTS").join("|"), "All requests|Awaiting my approval next|Awaiting my approval|Unapproved|Approved", "one status chip: All requests, then V1's four options (owner, 9 Oct)");
A.ok(PATHS["QA Path"].steps[0].users.length === 2, "an Or level holds two interchangeable approvers (QA Path level 1)");
/* the owner's real Education Ministry path: Start with Alfred >= $500, Then Jim or Lanette >= $2,000, Ends with Pastor Bob >= $5,000 */
A.eq(PATHS["Education Ministry"].steps.map(function (s) { return s.users.length + ":" + s.mins.join("/"); }).join(" "), "1:500 2:2000/2000 1:5000", "per-approver minimums on every level");
A.eq(C("purFSteps", "Education Ministry", 430).length, 0, "$430: no approver's minimum is reached, no level applies");
A.eq(C("purFSteps", "Education Ministry", 640).length, 1, "$640: Alfred's level only");
A.eq(C("purFSteps", "Education Ministry", 3150).map(function (s) { return s.users.join("|"); }).join(" > "), "Alfred Johnson > Lanette Stewart|Jim AndersonAndMoreLetters", "$3,150: Alfred, then Lanette or Jim (screenshot order); Pastor Bob not reached");
A.eq(C("purFSteps", "Education Ministry", 5000).length, 3, "$5,000: all three levels");
A.eq(C("purFStepUsers", { users: ["A", "B"], mins: [1000, 3000] }, 1500).join(","), "A", "an Or level with different minimums keeps only the approvers whose minimum the total reaches");
A.eq(POS.filter(function (p) { return p.stage === "Rejected"; }).length, 0, "no order carries a Rejected stage");
A.eq(POS.filter(function (p) { return (p.appr || []).some(function (a) { return a.state === "rejected"; }); }).length, 2, "two sample orders carry a rejected approval row"); A.eq(C("purFDataset", wide).filter(function (p) { return (p.appr || []).some(function (a) { return a.state === "rejected"; }); }).length, 0, "and neither reaches the widget's data (owner, 9 Oct)");
/* turn per demo record */
const turn = function (ref) { return C("purFTurn", po(ref)); };
A.eq(turn("PO-2893").kind, "next", "PO-2893: Nitzi approved level 1, my level 2 is next");
A.eq(turn("PO-2888").kind, "mine", "PO-2888: nobody has acted, I am on level 2, so awaiting me later");
A.eq(turn("PO-2899").kind, "waiting", "PO-2899 ($640): waiting on Alfred Johnson, the only applying approver"); A.ok(/Alfred Johnson \(level 1 of 1\)/.test(turn("PO-2899").label), "the label names Alfred and a one-level path at this amount");
A.eq(turn("PO-2891").kind, "waiting", "PO-2891 ($3,150): Lanette holds at the Or level; someone else's hold leaves the request where the approved rows put it (owner, 9 Oct)"); A.eq(turn("PO-2891").hold, "Lanette Stewart", "and the turn carries who holds it");
A.ok(turn("PO-2907").none === true && turn("PO-2907").kind === "next", "PO-2907 ($430): no approver required, offered for release");
A.eq(turn("PO-2897").kind, "next", "PO-2897: QA Path level 1 is Feargal OR me, so it is my turn");
A.eq(C("purFHidden", po("PO-2902")), true, "PO-2902: a rejected row hides the request from the widget, as the data panel does (owner, 9 Oct)"); A.eq(C("purFPO", wide, "PO-2902"), null, "so the widget cannot find it");
A.eq(C("purFStatusWord", po("PO-2891")).w, "On hold", "PO-2891: the chip still reads On hold");
A.eq(turn("PO-2872").kind, "next", "PO-2872: approved; payment path level 2 is mine and next");
A.eq(turn("PO-2879").kind, "waiting", "PO-2879: payment path Education Ministry, waiting on Ben Lane");
A.ok(/level 2 of 2, payment/.test(turn("PO-2872").label), "payment turn is labelled as payment");
A.eq(turn("PO-2861").kind, "none", "PO-2861: approved for payment, nobody's turn");
/* lanes per demo record */
const lane = function (ref) { return C("purFLane", po(ref)); };
A.eq(lane("PO-2893"), "Pending approval", "pending request lane");
A.eq(lane("PO-2872"), "Payment approval", "approved with open payment steps"); A.eq(lane("PO-2861"), "Ready to pay", "payment approved, no check yet"); A.eq(lane("PO-2864"), "Paid", "paid");
A.eq(C("purFMineSet", wide).length, 25, "twenty-five requests await me with the payment process on: 15 on request paths plus the ten approved, unpaid January to May orders (9 Oct) whose payment path reaches me");
A.eq(C("purFPendingCount", wide), 15, "fifteen requests pending approval (the two with a rejected row are hidden)");

/* ---------- 2. render ---------------------------------------------------- */
/* The table is the default view; the Kanban board was removed on 5 Oct 2026 (owner: it did not work). */
[wide, kpi, xw].forEach(function (w) { const h = C("purFContent", w); A.ok(h && h.length > 800, w.id + " (" + w.size + ") renders (" + h.length + " bytes)"); A.noEmDash(h, w.id); if (/wt-head/.test(h)) A.headMatchesBody(h, w.id + " table (D12)"); });
let h = C("purFContent", xw);
A.contains(h, '<span class="metric-value">25</span><span class="bank-pill">need your approval</span>', "Detail headline: requests awaiting me (25 with the payment process on, after the 9 Oct sample additions)");
A.absent(h, "data-purf-drop=", "no board drop zones anywhere (Kanban removed 5 Oct)"); A.absent(h, "purf-kcard", "no cards");
A.absent(h.slice(h.indexOf('class="purf-tbl"')), "purf-turn", "table rows carry no turn badge: the Status column is a short word, not the old badge (owner, 9 Oct)");
A.absent(h, "draggable=", "nothing is draggable: the board is gone");
A.absent(h, 'data-purf="scope"', "no separate scope chip: merged into the status chip (owner, 9 Oct)"); A.contains(h, '<span class="fc-label">All requests</span>', "status chip defaults to All requests (owner, 9 Oct: the demo opens with every status on show)");
{ const kinds = (C("purFTable", wide).match(/purf-stchip purf-stchip-([a-z]+)"/g) || []).map(function (m) { return m.replace(/.*-/, "").replace('"', ""); }); const uniq = kinds.filter(function (k, i) { return kinds.indexOf(k) === i; }); A.ok(uniq.length >= 4, "Explore under All requests shows at least four different status chips (" + uniq.join(", ") + ")"); }
A.ok(/role="columnheader"><button[^>]*data-k="num"[^>]*>Requisition #[\s\S]*?role="columnheader"><button[^>]*data-k="vendor"[^>]*>Vendor[\s\S]*?role="columnheader"><button[^>]*data-k="issued"[^>]*>Issued[\s\S]*?role="columnheader"><button[^>]*data-k="age"[^>]*>Age[\s\S]*?role="columnheader"><button[^>]*data-k="status"[^>]*>Status[\s\S]*?role="columnheader"><button[^>]*data-k="amt"[^>]*>Amount [\s\S]*?<\/button><\/span><\/div>/.test(h), "table columns: Requisition #, Vendor, Issued, Age, Status, Amount last, each a sort header (owner, 9 Oct)");
A.ok(/<span class="purf-c-num" role="cell">\d{4}<\/span>/.test(h), "requisition shows the number alone, no PO- prefix (owner, 9 Oct)"); A.absent(h.slice(h.indexOf('class="purf-tbl"')), '"purf-c-num" role="cell">PO-', "no PO- prefix in the column");
A.ok(/<span class="purf-c-date" role="cell">[A-Z][a-z]{2} \d{1,2}<\/span>/.test(h), "Issued shows month and day, no year (owner, 9 Oct)");
A.ok(/<span class="purf-c-st" role="cell"><span class="purf-stchip purf-stchip-(next|mine|pending|approved|hold|other)"><span class="material-symbols-rounded"[^>]*>(hourglass_top|how_to_reg|schedule|check_circle|lock|circle)<\/span><span class="purf-stchip-t">(Your turn|Coming to you|Pending|Approved|On hold)<\/span><\/span><\/span>/.test(h), "Status cell: Jo-style chip, icon and short word in its own span (ellipsizes in a tight column)");
["pending:attention", "next:brand", "approved:positive", "hold:severe"].forEach(function (p) { const k = p.split(":")[0], t = p.split(":")[1]; A.contains(css, ".purf-root .purf-stchip-" + k + "{color:var(--semantic-color-foreground-static-" + t + "-on-subtle);background:var(--semantic-color-fill-static-" + t + "-subtle);}", "chip " + k + " on the " + t + " semantic tokens"); });
A.contains(css, ".purf-root .purf-stchip-mine{color:var(--txt-secondary);background:var(--semantic-color-fill-static-neutral-subtle);}", "Coming to you on the neutral tint");
{ const sw = function (ref) { return C("purFStatusWord", po(ref)); }; A.eq(sw("PO-2885").w, "Your turn", "my level acts next reads Your turn"); A.eq(sw("PO-2888").w, "Coming to you", "my later level reads Coming to you"); A.ok(POS.some(function (p) { return C("purFStatusWord", p).w === "Pending"; }), "someone else's turn reads Pending"); A.ok(POS.some(function (p) { return C("purFStatusWord", p).w === "Approved"; }), "a completed path reads Approved"); }
A.ok(/<span class="purf-c-age" role="cell" data-tip="Waiting \d+ days? since it was issued\." data-tip-plain><span class="material-symbols-rounded"[^>]*>schedule<\/span><span class="purf-age-n( purf-age-warn)?">\d+d<\/span><span class="sr-only"> waiting<\/span><\/span>/.test(h), "Age cell: clock glyph, Nd, hover wording, as V1"); A.contains(h, 'class="purf-age-n purf-age-warn"', "an age of 30 days or more is emphasised, as V1");
A.absent(h, 'role="columnheader">Department<', "no Department column"); A.contains(h, 'data-k="status"', "Status column present (owner, 9 Oct)"); A.contains(h, 'aria-colcount="6"', "six columns, no open-record control (owner, 9 Oct)"); A.absent(h, "purf-c-go", "no edit icon column"); A.absent(h, "purf-ovflag", "no Overdue flag in the Issued cell"); A.absent(h, "purf-ovrow", "no overdue row tint"); A.absent(h, 'data-purf="ov"', "no Overdue only chip (owner, 9 Oct: removed completely)"); A.absent(blockRaw, "purFOvChip", "and no Overdue code left");
xw.purfStatus = "Awaiting my approval next"; A.contains(C("purFHeaderBlock", xw), 'data-purf="path"', "the approval path chip shows at Detail under every status (owner, 9 Oct)"); xw.purfStatus = null; A.contains(h, 'data-purf="open"', "rows still open the record on click"); A.contains(css, ".purf-root .purf-trow .lr-main{flex:1 1 120px;min-width:64px;max-width:240px;}", "Vendor is bounded, 64px to 240px, and gives first (owner, 9 Oct)"); A.contains(css, ".purf-root .purf-c-date{flex:0 1 76px;min-width:48px;overflow:hidden;", "Issued shrinks to a floor and clips rather than running under Age (owner, 9 Oct)"); A.contains(css, ".purf-root .purf-tbl{min-width:0;}", "no table floor: the table never scrolls sideways (owner, 9 Oct)");
A.ok(/<span class="lr-main purf-c-vendor" role="cell" data-vendor="[^"]+" data-tip-plain>/.test(h), "vendor cell carries its full name for the hover"); A.contains(blockRaw, 'if(c.scrollWidth>c.clientWidth+1)c.setAttribute("data-tip",c.getAttribute("data-vendor"));else c.removeAttribute("data-tip");', "the hover shows the full name only when the text is actually cut");
A.contains(h, "Cleaning Services of Greater Springfield and Surrounding Counties Inc", "one sample vendor is long enough to be cut (owner, 9 Oct)"); A.absent(h, "Cleaning Svcs", "the short name is gone");
const hk = C("purFContent", kpi); const glOpen = POS.filter(function (p) { const l = C("purFLane", p); return l === "Pending approval" || l === "Payment approval" || l === "Ready to pay"; }).length;
/* Glance (owner, 9 Oct): three tiles in Jo's Phase 2 tile shape, no headline or caption. Labels are V1's filter terms shortened; the last tile is every unapproved request, not "waiting on others". */
A.absent(hk, "metric-value", "Glance has no headline figure (owner, 9 Oct: three tiles only)"); A.absent(hk, "waiting for action", "the waiting-for-action pill is gone"); A.absent(hk, " outstanding<", "and so is the outstanding caption: the Unapproved tile carries the dollars");
A.contains(hk, ">Your turn<", "tile 1: the Your turn status word (owner, 9 Oct)"); A.contains(hk, ">Coming to you<", "tile 2: Coming to you"); A.contains(hk, ">Pending<", "tile 3: Pending, every request still on a path (owner, 9 Oct)");
A.absent(hk, ">Coming to me<", "old tile label gone"); A.absent(hk, ">My approval<", "no shortened filter term as a label: the status word is the label, the filter term is the hover"); A.absent(hk, ">To be paid<", "no payment tile at Glance"); A.absent(hk, ">Waiting on others<", "no waiting-on-others tile (owner, 9 Oct)");
A.contains(hk, "purf-gtile-next", "tile 1 on the brand tone, as the Your turn status chip"); A.contains(hk, "purf-gtile-mine", "tile 2 on the neutral sheet, as the Coming to you chip"); A.contains(hk, "purf-gtile-pending", "tile 3 on the attention tone, as the Pending chip and Jo's Pending tile");
["Awaiting my approval", "Awaiting my approval next", "Unapproved"].forEach(function (st) { const l = C("purFDataset", kpi).filter(function (p) { return C("purFMatchStatus", kpi, p, st); }); A.contains(hk, '<span class="purf-gnum">' + l.length + "</span>", "tile count for " + st + " equals what the filter lists (" + l.length + ")"); A.contains(hk, '<span class="purf-gamt">' + C("purFMoneyShort", Math.round(C("purFSum", l))) + "</span>", "tile dollars for " + st + " are the sum of those requests, whole dollars as on Jo's tiles (cents in the hover)"); });
{ const pend = C("purFDataset", kpi).filter(function (p) { return C("purFMatchStatus", kpi, p, "Unapproved"); }), tot = pend.length, totAmt = C("purFMoney", C("purFSum", pend));
  A.ok(new RegExp('data-tip="Awaiting my approval: \\d+ of ' + tot + ' requests where your level acts now\\. Amount of all \\d+ requests: \\$[\\d,]+\\.\\d{2}\\." data-tip-plain data-tip-narrow').test(hk), "tile hover is the shell tooltip (data-tip, plain, narrow): V1's term, n of all pending, the rule, then the amount of all n requests (owner, 9 Oct)");
  A.ok(/data-tip="Awaiting my approval next: \d+ of \d+ requests on a path you are on, where an earlier level has to act first\. Amount of all /.test(hk), "tile hover: an earlier level acts first, with the amount named");
  A.ok(new RegExp('data-tip="Unapproved: all ' + tot + ' requests still on an approval path, whoever has to act\\. Amount of all ' + tot + ' requests: ' + totAmt.replace(/[$.]/g, "\\$&") + '\\."').test(hk), "tile hover: Pending is all pending requests with their amount");
  A.absent(hk, " pending total ", "no total-of-all-pending sentence (owner, 9 Oct: not needed)");
  A.absent(hk, "material-symbols", "no icons on the tiles: the label has the room (owner, 9 Oct)"); } A.absent(hk, ' title="', "no browser title tooltips on the tiles"); A.eq((hk.match(/tabindex="0"/g) || []).length, 3, "each tile is focusable so the tooltip shows on keyboard focus too");
A.absent(hk, "need your approval", "old headline gone"); A.absent(hk, "purf-gcard", "old card markup gone");
/* scope filter */
{ const kinds = function () { return C("purFTableRows", xw).map(function (p) { return C("purFTurn", p).kind; }); }; const stages = function () { return C("purFTableRows", xw).map(function (p) { return p.stage; }); };
  xw.purfStatus = "Awaiting my approval"; A.ok(kinds().length > 0 && kinds().every(function (k) { return k === "next"; }), "'Awaiting my approval' lists only requests where my level acts now, the Your turn rows (" + kinds().length + ")");
  xw.purfStatus = "Awaiting my approval next"; A.ok(kinds().length > 0 && kinds().every(function (k) { return k === "mine"; }), "'Awaiting my approval next' lists only the Coming to you rows, an earlier level acts first (" + kinds().length + ")");
  xw.purfStatus = "Unapproved"; A.ok(kinds().indexOf("waiting") > -1 && stages().every(function (st) { return st === "Pending"; }), "'Unapproved' lists every pending request, other people's turns included, and no approved order");
  xw.purfStatus = "Approved"; A.ok(stages().length > 0 && stages().every(function (st) { return st === "Approved"; }), "'Approved' lists approved orders only (" + stages().length + ")");
  xw.purfStatus = null; }
/* status chip means the derived status in the table */
xw.purfStatus = "Approved"; h = C("purFContent", xw); A.contains(h, "PO-2872", "an approved order awaiting payment approval is listed under Approved"); xw.purfStatus = null; h = C("purFContent", xw);
if (/wt-head/.test(h)) A.headMatchesBody(h, "table (D12)"); xw.purfView = null;

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
/* PO-2902: rejected, so hidden (owner, 9 Oct) */
A.absent(blockRaw, "purFClearReject", "no clear-rejection act: a rejected request is handled on the Requests page");
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
A.eq(C("purFRejectStep", wide, po("PO-2901"), "Wrong vendor"), true, "rejecting my level"); A.eq(C("purFHidden", po("PO-2901")), true, "PO-2901 is hidden from the widget from now on"); A.eq(po("PO-2901").stage, "Pending", "and stays Unapproved on the Requests page");
A.eq(C("purFApplyHold", wide, "PO-2904", "hold", "Budget check"), true, "holding"); A.eq(turn("PO-2904").kind, "hold", "PO-2904 shows hold"); A.ok(po("PO-2904").appr.some(function (a) { return a.state === "hold"; }), "hold is a row on the live path");
A.eq(C("purFApplyHold", wide, "PO-2904", "unhold", ""), true, "removing the hold"); A.eq(turn("PO-2904").kind, "next", "PO-2904 is my turn again");
reset();

/* ---------- 4. Record pop-up: read-only, Approve / Hold / Reject (owner, 9 Oct) --- */
const openTab = function (ref, tab) { C("purFOpenPO", xw, ref); const m = env.get("PURF_MODAL"); if (tab) m.tab = tab; return C("purFModalHTML"); };
const modal = function () { return env.get("PURF_MODAL"); };
const gridRows = function (ref) { const p = po(ref); return C("purFGridRows", p, p.path, p.appr || [], true); };
const tapPurf = function (attrs) { const el = env.shim.mkTarget(attrs, "button"); el.closest = function (sel) { return sel.indexOf("data-purf") > -1 ? el : null; }; C("purFHandleClick", { target: el }); };
const act = function (ref, kind, note) { tapPurf({ "data-purf": "po-act", "data-v": kind, "data-purf-ref": ref, "data-id": xw.id }); if (note !== undefined) modal().note = note; tapPurf({ "data-purf": "po-act-confirm", "data-v": kind, "data-purf-ref": ref, "data-id": xw.id }); };
reset();
/* header: requisition number and vendor, the table's status chip, Open request top right, Close */
let mh = openTab("PO-2885"); A.ok(mh.length > 3000, "pop-up renders"); A.eq(modal().tab, "approvals", "a request I can act on opens on Approvals");
A.contains(mh, "Requisition 2885 &middot; Facilities Plus", "title is the requisition number and vendor"); A.contains(mh, 'class="purf-stchip purf-stchip-next"', "the table's status chip sits in the title");
A.contains(mh, 'data-purf="open-record"', "Open request link in the header"); A.ok(mh.indexOf('data-purf="open-record"') < mh.indexOf('data-purf="close-modal" aria-label="Close"'), "Open request sits left of Close, top right");
A.contains(mh, "purf-m-scroll", "scrolling body under a fixed header and footer");
/* everything read-only: no form controls, no Save, no Submit for Approval */
A.absent(mh, "<select", "no dropdowns"); A.absent(mh, '<input class="purf-fin', "no text boxes"); A.absent(mh, 'data-purf="record-save"', "no Save"); A.absent(mh, 'data-purf="submit-toggle"', "no Submit for Approval"); A.absent(mh, 'data-purf="grid-tick"', "no tickable boxes"); A.absent(mh, 'data-purf="pick-stub"', "no pickers");
/* the page's header fields, in its order, as facts */
const FACTS = ["Vendor", "Ship To", "Email", "Type", "Status", "Approval Path", "Requisition #", "Purchase Order #", "Purchase Order Date", "Issued To", "Agent", "Shipping", "Date Requested"];
let last = -1; FACTS.forEach(function (f) { const i = mh.indexOf('class="purf-po-fact-k">' + f + '<'); A.ok(i > last, "fact " + f + " present, in the page's order"); last = i; });
A.contains(mh, "<strong>Terms:</strong>", "vendor terms line"); A.contains(mh, 'class="purf-po-fact-v">2885<', "Requisition # is the bare number"); A.contains(mh, 'class="purf-po-empty">Not set<', "an empty field reads Not set, not an empty box");
A.contains(mh, 'class="purf-po-fact-v">Unapproved<', "Status uses the page's vocabulary");
/* tabs: Detail, Approvals, Attachments with its count, Note; no Payment Approval */
A.contains(mh, 'data-v="detail"', "tab Detail"); A.contains(mh, 'data-v="approvals"', "tab Approvals"); A.contains(mh, 'data-v="attachments"', "tab Attachments"); A.contains(mh, 'data-v="note"', "tab Note"); A.absent(mh, 'data-v="payment"', "no Payment Approval tab");
A.contains(mh, ">Attachments (2)<", "the Attachments tab carries its file count (owner, 9 Oct: the invoice lives there)"); A.contains(mh, 'class="purf-tab on"', "Jo's segmented tab style, one tab on");
/* Detail: the line, account with fund and department beneath, totals row */
mh = openTab("PO-2885", "detail"); A.contains(mh, 'class="purf-po-acct">50510 Building Maintenance<', "account on the line"); A.contains(mh, "Fund 1 Church &middot; Department 140 Facilities", "fund and department beneath it");
A.contains(mh, 'role="cell">6 June<', "period from the issue date"); A.contains(mh, '<span class="purf-po-tot-k">Tax</span> $0.00', "Tax in the totals row"); A.contains(mh, '<span class="purf-po-tot-k">Total</span>', "Total in the totals row"); A.contains(mh, "$1,975.00", "the amount");
/* Attachments: the files, each with Open; none editable */
mh = openTab("PO-2885", "attachments"); A.contains(mh, "FacilitiesPlus-Invoice-88214.pdf", "invoice listed"); A.contains(mh, "Quote-roof-repair.pdf", "quote listed"); A.eq((mh.match(/data-purf="att-open"/g) || []).length, 2, "one Open per file"); A.absent(mh, "Add New Attachment", "no upload: read-only");
A.contains(mh, "Invoice &middot; 184 KB &middot; Jun 4, 2026 &middot; Nitzi Wright", "file meta: kind, size, date, who");
mh = openTab("PO-2899", "attachments"); A.contains(mh, "No attachments on this request.", "empty state"); A.contains(mh, ">Attachments<", "no count when there are none");
/* Note: the one field that edits here, with Save note; the activity log beneath */
mh = openTab("PO-2885", "note"); A.contains(mh, 'data-purf-field="note"', "note textarea"); A.absent(mh, "readonly", "note is writable"); A.contains(mh, 'data-purf="note-save"', "Save note button"); A.contains(mh, ">Activity<", "activity log");
C("purFFieldSet", po("PO-2885"), "note", "Call the vendor about delivery"); mh = openTab("PO-2885", "note"); A.contains(mh, ">Note (1)<", "the Note tab shows a note exists"); C("purFFieldSet", po("PO-2885"), "note", "");
/* Approvals grid: one row per approver, the page's wording and columns, marks not boxes */
mh = openTab("PO-2893", "approvals"); A.contains(mh, "Starts with Alberto Allen", "creator row at level 0 when the creator is not on the path"); A.contains(mh, "Then Nitzi Wright", "then the path in order"); A.contains(mh, "Ends with Oisin Curran (you)", "last row reads Ends with");
A.contains(mh, "Approval Needed By:", "column 1"); A.contains(mh, ">Approved<", "column Approved"); A.contains(mh, ">Rejected<", "column Rejected"); A.contains(mh, ">Hold<", "column Hold"); A.contains(mh, "Approval Updated By:", "column Approval Updated By"); A.eq((mh.match(/>Reason</g) || []).length, 2, "two Reason columns");
A.eq((mh.match(/purf-po-mark-approve/g) || []).length, 2, "two approved marks: the submitted creator row and Nitzi's level"); A.contains(mh, 'role="cell">Nitzi Wright Jul 3, 2026</span>', "Approval Updated By carries actor and date");
A.absent(mh, "(from $", "no per-approver minimum text (the page has none)"); A.absent(mh, "Skipped:", "no skipped wording (the page has none)");
mh = openTab("PO-2899", "approvals"); A.contains(mh, "Then Lanette Stewart", "Or level: first approver as Then"); A.contains(mh, '<span class="purf-a-or"></span>Or Jim AndersonAndMoreLetters', "second approver on the same level indented as Or"); A.contains(mh, "out of office until Sep 5, 2026", "out-of-office flag from user meta");
/* held by someone else at or below my level: stays in my list, chip On hold, no promotion, my row still enabled (owner, 9 Oct) */
reset(); po("PO-2888").appr.push({ seq: 1, user: "Nitzi Wright", state: "hold", reason: "Checking budget", d: "2026-08-18" }); po("PO-2888").hold = true;
A.eq(turn("PO-2888").kind, "mine", "Nitzi holds level 1: the request stays in my Awaiting my approval list"); A.eq(turn("PO-2888").hold, "Nitzi Wright", "the turn names who holds it"); A.eq(C("purFStatusWord", po("PO-2888")).w, "On hold", "the chip reads On hold");
A.eq(C("purFMatchStatus", xw, po("PO-2888"), "Awaiting my approval next"), true, "listed under Awaiting my approval next (the owner's label for Coming to you)"); A.eq(C("purFMatchStatus", xw, po("PO-2888"), "Awaiting my approval"), false, "not promoted into Awaiting my approval, the Your turn list (the legacy Max+1 quirk is not copied)");
mh = openTab("PO-2888", "approvals"); A.contains(mh, "purf-po-mark-hold", "her hold mark shows"); A.contains(mh, 'role="cell">Checking budget</span>', "with her reason"); A.contains(mh, 'data-v="approve"', "my row is still enabled, so Approve is offered"); A.contains(mh, "(on hold by Nitzi Wright)", "the turn line says it is held");
act("PO-2888", "approve", ""); A.eq(po("PO-2888").stage, "Approved", "approving at my level clears her hold through the cascade and completes the path, as the page does"); reset();
mh = openTab("PO-2891", "approvals"); A.contains(mh, "purf-po-mark-hold", "a held row shows the hold mark"); A.contains(mh, "Waiting on budget confirmation", "and its reason");
/* enablement (setApprovalRows) and the cascade (checkApproved) stay the page's, as pure rules */
let rows = gridRows("PO-2899"); let en = C("purFGridEnable", rows, true);
A.eq(en.noRight, true, "PO-2899: I am not on Education Ministry, so nothing is enabled"); A.ok(rows.every(function (r) { return !r.canApprove && !r.canReject; }), "no Approved/Rejected enabled");
rows = gridRows("PO-2893"); en = C("purFGridEnable", rows, true);
A.eq(rows[0].creator, true, "row 0 is the creator"); A.eq(rows[0].approved, true, "creator row ticked = submitted"); A.eq(rows[1].approved, true, "Nitzi's level 1 is approved"); A.eq(rows[2].user, ME, "row 2 is mine"); A.eq(rows[2].canApprove, true, "my row is enabled");
rows = gridRows("PO-2888"); en = C("purFGridEnable", rows, true);
A.eq(rows.filter(function (r) { return !r.creator; }).every(function (r) { return r.canApprove; }), true, "PO-2888: nothing acted, every level down to mine is enabled");
C("purFGridTick", rows, 2, "approve", true); A.ok(rows[1].approved && rows[2].approved, "ticking my level ticks the level below"); A.eq(rows[1].rejected || rows[1].hold, false, "and clears its Rejected and Hold");
C("purFGridTick", rows, 1, "approve", false); A.ok(!rows[1].approved && !rows[2].approved, "unticking a level clears it and every level above");
const fake = [{ seq: 1, user: "Nitzi Wright", min: 0, pre: "Starts with " }, { seq: 2, user: ME, min: 0, pre: "Then " }, { seq: 3, user: "Pastor Bob", min: 0, pre: "Ends with ", approved: true }];
en = C("purFGridEnable", fake, true); A.eq(en.lockedAbove, true, "an acted row on a later level locks"); A.ok(fake.every(function (r) { return !r.canApprove && !r.canReject; }), "every Approved and Rejected disabled");
/* footer by state: the three decisions when my level may act, Close otherwise */
reset(); mh = openTab("PO-2885"); ["approve", "hold", "reject"].forEach(function (k) { A.contains(mh, 'data-purf="po-act" data-v="' + k + '"', "Your turn: " + k + " offered"); });
A.ok(mh.indexOf('data-v="reject"') < mh.indexOf('data-v="hold"') && mh.indexOf('data-v="hold"') < mh.indexOf('data-v="approve"'), "order Reject, Hold, Approve, Approve primary at the right");
mh = openTab("PO-2888"); A.eq(turn("PO-2888").kind, "mine", "PO-2888: Coming to you"); A.contains(mh, 'data-v="approve"', "Coming to you may still act: the page enables rows down to mine, and Approve cascades below");
mh = openTab("PO-2899"); A.absent(mh, 'data-purf="po-act"', "not on the path: no decisions"); A.contains(mh, '>Close</button>', "Close instead"); A.eq(modal().tab, "detail", "and it opens on Detail"); A.contains(mh, "Waiting on Alfred Johnson", "the footer lead says whose turn it is");
mh = openTab("PO-2891"); A.absent(mh, 'data-v="unhold"', "held by Lanette: I cannot remove her hold"); A.contains(mh, "On hold by Lanette Stewart.", "footer names who holds it");
mh = openTab("PO-2872"); A.absent(mh, 'data-purf="po-act"', "an approved order has no decisions"); A.contains(mh, "nothing to decide here", "and says so");
/* the confirm strip: reason first, then the act, through the page's own rules */
reset(); mh = openTab("PO-2885"); tapPurf({ "data-purf": "po-act", "data-v": "approve", "data-purf-ref": "PO-2885", "data-id": xw.id }); mh = C("purFModalHTML");
A.eq(modal().confirm, "approve", "Approve opens the confirm strip"); A.contains(mh, 'id="purfPoNote"', "with a note field"); A.contains(mh, ">Confirm approve</button>", "and Confirm approve"); A.contains(mh, "This completes the path: the request becomes Approved.", "it says what approving at level 2 of 2 does"); A.absent(mh, 'data-purf="po-act"', "the three buttons are gone while confirming");
tapPurf({ "data-purf": "po-act-cancel", "data-id": xw.id }); A.eq(modal().confirm, null, "Cancel closes the strip"); A.eq(po("PO-2885").stage, "Pending", "and nothing happened");
act("PO-2885", "approve", "Looks fine"); A.eq(po("PO-2885").stage, "Approved", "Confirm approve: my level with the cascade completes the path"); A.eq(po("PO-2885").log[po("PO-2885").log.length - 1].note, "Looks fine", "the note is logged"); A.eq(modal().confirm, null, "strip closed"); A.eq(modal().tab, "approvals", "pop-up stays open on Approvals"); A.contains(C("purFModalHTML"), "purf-stchip-approved", "title chip now Approved");
reset(); openTab("PO-2888"); act("PO-2888", "reject", ""); A.eq(C("purFHidden", po("PO-2888")), true, "Confirm reject: the request is hidden from the widget"); A.eq(po("PO-2888").appr.filter(function (r) { return r.state === "rejected"; })[0].reason, "unknown", "a blank reason is saved as unknown, as the page does");
A.eq(modal(), null, "the pop-up closes, since the request is no longer in the table"); A.eq(C("purFPO", xw, "PO-2888"), null, "and the row is gone"); A.absent(C("purFTable", xw), "Rejected", "the table never shows the word");
reset(); openTab("PO-2888"); act("PO-2888", "hold", "Budget check"); A.eq(po("PO-2888").hold, true, "Confirm hold: on hold"); A.eq(turn("PO-2888").kind, "hold", "turn reads hold"); A.eq(po("PO-2888").appr.filter(function (r) { return r.state === "hold"; })[0].reason, "Budget check", "with the reason");
mh = C("purFModalHTML"); A.contains(mh, 'data-v="unhold"', "my own hold offers Remove hold"); act("PO-2888", "unhold", ""); A.eq(po("PO-2888").hold, false, "hold removed"); A.eq(turn("PO-2888").kind, "mine", "back on the path");
reset(); env.ctx.PURF_MODAL = null;
/* CSS: Jo's pop-up pieces on tokens; the form styles are gone */
A.contains(css, ".purf-root .purf-po-facts{display:grid;grid-template-columns:repeat(4,1fr);", "four-column fact grid"); A.contains(css, ".purf-root .purf-po-fact-v{font-size:var(--type-size-12);", "fact values at the table's 12px (owner, 9 Oct: one text scale)"); A.absent(C("purFModalHTML"), "Your level can act.", "no grid note under the Approvals grid (owner struck it out)"); A.contains(css, ".purf-root .purf-tab.on{", "segmented tab CSS present (the tabs had none)"); A.contains(css, ".purf-root .purf-po-mark-approve{color:var(--semantic-color-foreground-static-positive-on-subtle);}", "approved mark on the positive token");
A.contains(css, ".purf-root .purf-po-danger{background:var(--red-100);", "Confirm reject in Jo's danger style"); A.absent(css, ".purf-root .purf-fin{", "no text-box CSS"); A.absent(css, ".purf-root .purf-sel{", "no dropdown CSS"); A.absent(css, ".purf-root .purf-box{", "no checkbox CSS");

/* ---------- 5. hygiene --------------------------------------------------- */
A.noEmDash(block.replace(/\/\*[\s\S]*?\*\//g, ""), "block code");
A.contains(css, ".purf-turn-next", "turn badge CSS"); A.contains(css, ".purf-turnline", "turn line CSS");
A.absent(block.replace(/\/\*[\s\S]*?\*\//g, ""), 'stage==="Rejected"', "no code tests for a Rejected stage");
A.absent(css, ".purf-kcol-", "no board column CSS left (Kanban removed 5 Oct)"); A.absent(css, ".purf-board", "no board CSS"); A.absent(css, ".purf-card", "no card CSS"); A.absent(css, ".purf-tnote", "the \"Showing the N longest waiting\" note is gone (owner, 5 Oct)");
A.absent(css, ".purf-paybadge", "the dead pay badge CSS is gone"); A.absent(css, ".purf-holdflag", "and the dead hold flag CSS");

/* ---------- 6. the shipped default: the approval path with the payment process off (owner, 2026-09-28; board removed 5 Oct 2026) ------
   PURF_USE_PAY off is how the widget ships, and how a company with PO_Company
   .UsePaymentApprovalProcess = 0 sees it. The board stops being payment lanes and becomes the approval
   path itself. The Kanban that drew it as columns is gone; the column model (purFCols / purFColOf) still drives the
   move rules behind the Approvals grid. Everything above this line describes the same widget with the constant flipped on. */
payOn(false); reset();
xw.purfView = null; xw.purfPath = null; xw.purfStatus = null;
const col = function (ref) { return C("purFColOf", po(ref)); };
const chk6 = function (ref, to) { return C("purFMoveCheck", po(ref), to); };

/* 6a. paths and statuses with no board: the table keeps both chips */
A.eq(C("purFPathVals", xw).slice().sort().join("|"), "Administration|Education Ministry|Everyone|QA Path", "every approval path with rows is offered");
A.eq(C("purFPathCur", xw), "All approval paths", "the table defaults to all paths (the board that needed one is gone)");
A.eq(C("purFStatusVals", xw, "table").join("|"), "All requests|Awaiting my approval next|Awaiting my approval|Unapproved|Approved", "status filter: All requests plus V1's four (owner, 9 Oct); Closed and Voided are not options");
{ C("purFOpenPop", "status", xw.id, null); const pm = C("purFPopContent"); C("purFClosePop"); A.contains(pm, '<div class="cap">Show</div>', "status menu opens"); A.absent(pm, "mi-ic", "status menu options carry no icons (owner, 9 Oct)"); A.eq((pm.match(/class="mi check"/g) || []).length, 1, "one tick marks the current option"); A.absent(pm, "purf-popnote", "no explanatory note in the menu"); }
const h6 = C("purFHeaderBlock", xw);
A.contains(h6, 'data-purf="status"', "status chip on the table");
A.contains(h6, 'data-purf="path"', "path chip on the table");
C("purFOpenPop", "path", xw.id, null); const pp6 = C("purFPopContent"); C("purFClosePop");
A.contains(pp6, ">All approval paths<", "the path popover offers All approval paths");
A.absent(pp6, "Kanban", "and never mentions the Kanban");

/* 6b. the column model is the path's levels (it drives the move rules, no longer a board) */
xw.purfPath = "Everyone";
A.eq(C("purFCols", xw)[0].aria, "Ends with Oisin Curran (you). Any one approver on a level satisfies it.", "a one-level path reads Ends with, as the legacy rewrite does (POOrder.cs:154-166)");

/* 6c. thresholds: the sub-line, the legacy wording, and the dimmed column */
xw.purfPath = "Education Ministry";
const cs6 = C("purFCols", xw);
A.eq(cs6.map(function (c) { return c.key; }).join("|"), "Level 1|Level 2|Level 3|Approved", "three levels and Approved");
A.eq(cs6.map(function (c) { return c.sub; }).join("|"), "from $500|from $2,000|from $5,000|", "each level shows its own dollar minimum, and Approved has none");
A.eq(cs6[0].aria, "Starts with Alfred Johnson from $500. Any one approver on a level satisfies it.", "level 1 carries the legacy Starts with wording");
A.eq(cs6[1].aria, "Then Lanette Stewart or Jim AndersonAndMoreLetters from $2,000. Any one approver on a level satisfies it.", "an Or level is Then, with both approvers named");
A.eq(cs6[2].aria, "Ends with Pastor Bob from $5,000. Any one approver on a level satisfies it.", "the last level is Ends with");

/* 6d. every card sits in the column of the level that has to act next */
A.eq(col("PO-2893"), "Level 2", "PO-2893: Nitzi approved level 1, so it waits at my level 2");
A.eq(col("PO-2888"), "Level 1", "PO-2888: nobody has acted, so it sits at level 1 even though my level is 2");
A.eq(col("PO-2899"), "Level 1", "PO-2899 ($640): Alfred's level is the only one the amount reaches");
A.eq(col("PO-2891"), "Level 2", "PO-2891 ($3,150) is held at Lanette's level 2, NOT parked in Pastor Bob's $5,000 column");
A.eq(col("PO-2907"), "Level 1", "PO-2907 ($430): no level applies, so it sits in the first column");
A.eq(col("PO-2633"), "Approved", "PO-2633 was released and is out of the flow");
A.eq(col("PO-2864"), "Approved", "a paid fixture reads simply as Approved: nothing reads the pay fields");

/* 6e. an approval is an act on the path, forward only (the same rules the Approvals grid uses) */
xw.purfPath = "Administration";
A.eq(chk6("PO-2893", "Approved").ok, true, "my level can be approved onto Approved");
A.eq(chk6("PO-2888", "Level 2").ok, true, "and onto a later level");
A.eq(chk6("PO-2893", "Level 1").ok, false, "a backward move is refused");
A.contains(chk6("PO-2893", "Level 1").msg, "Approval moves forward only", "and says so");
A.contains(chk6("PO-2899", "Level 2").msg, "Not your approval", "someone else's turn is refused by name");
A.eq(chk6("PO-2891", "Level 3").ok, false, "a held request does not move forward");
A.eq(chk6("PO-2891", "Closed").ok, true, "but Close is offered from any column, on hold or not (owner, 27 Sep)");
A.eq(chk6("PO-2891", "Voided").ok, true, "and so is Void");
A.eq(chk6("PO-2861", "Voided").ok, true, "an approved order can still be voided: with no payment process nothing is paid");
A.eq(C("purFLandCol", po("PO-2893")), "Approved", "the confirm dialog can name where the card will land");
A.eq(C("purFLandCol", po("PO-2888")), "Approved", "including when approving my later level satisfies the whole path");

/* 6f. the write: no payment path is opened, and an approval stores what Save stores */
reset(); A.eq(C("purFApplyMove", xw, "PO-2893", "Approved", ""), true, "approving my level");
A.eq(po("PO-2893").stage, "Approved", "completes the request path");
A.eq(col("PO-2893"), "Approved", "and its column is Approved");
A.ok(po("PO-2893").pay === undefined && po("PO-2893").payPath === undefined && po("PO-2893").payAppr === undefined, "no payment path is seeded, as the legacy leaves PaymentApprovalID null");
reset(); C("purFApplyMove", xw, "PO-2888", "Level 2", "");
A.eq(po("PO-2888").stage, "Approved", "approving my later level implies the lower one (POOrderRepository.cs:1754)");
A.ok(po("PO-2888").appr.some(function (a) { return a.user === "Nitzi Wright" && a.by === ME; }), "and it stores the cascaded row exactly as Save does");
reset(); xw.purfPath = "Education Ministry";
A.eq(C("purFApplyMove", xw, "PO-2907", "Approved", ""), true, "the release case is approved without an approver");
A.eq(po("PO-2907").stage, "Approved", "and goes straight to Approved");
A.ok(po("PO-2907").pay === undefined, "again with no payment path");
reset();

/* 6g. the rest of the widget follows, as the legacy page does */
xw.purfView = "table";
A.absent(C("purFTable", xw), "purf-chip-st", "no old status chip markup; the Status column is the short word (owner, 9 Oct)");
A.absent(C("purFTable", xw), ">Payment approval</span>", "but never a payment one");
kpi.purfLoading = false; const gl6 = C("purFGlance", kpi);
A.contains(gl6, ">Pending<", "Glance's third tile is every unapproved request with the payment process on or off (owner, 9 Oct)"); A.absent(gl6, ">Waiting on others<", "no waiting-on-others tile");
A.absent(gl6, ">To be paid<", "so the payment tile is gone");
A.contains(gl6, 'data-tip="Unapproved: ', "and the Pending tile hover says what it counts");
env.ctx.PURF_MODAL = { id: xw.id, ref: "PO-2861", tab: "detail", confirm: null, note: "" };
const rm6 = C("purFModalHTML");
A.absent(rm6, 'data-v="payment"', "the record pop-up has no Payment Approval tab (Requests/Update.aspx:93)");
A.absent(rm6, "Payment Approval Path", "and no payment-path fact");
A.contains(rm6, 'data-v="approvals"', "the Approvals tab is untouched");
env.ctx.PURF_MODAL = null;
A.absent(C("purFAbout"), "column", "the about text no longer describes a board"); A.contains(C("purFAbout"), "whose approval is next", "it describes the table");

/* 6h. the legend is the table legend only */
xw.purfPath = "Education Ministry";
C("purFOpenPop", "legend", xw.id, null); const lg6 = C("purFPopContent"); C("purFClosePop");
A.absent(lg6, '<div class="cap">Columns</div>', "no Columns section without a board"); A.absent(lg6, "purf-lg-card", "no card colours"); A.absent(lg6, "Moving a card", "no move rules");
["Ready to pay", "Payment approval", "the check"].forEach(function (s) { A.absent(lg6, s, "the legend never mentions " + s); });
xw.purfView = "table"; C("purFOpenPop", "legend", xw.id, null); const lt6 = C("purFPopContent"); C("purFClosePop");
A.contains(lt6, '<div class="cap">Status</div>', "the table legend keeps its Status section");
A.contains(lt6, ">Approved</span>", "naming Approved");
A.contains(lt6, ">Voided</span>", "and the archive states");
A.absent(lt6, ">Ready to pay</span>", "with no payment lanes");

/* 6i. Encumbrances is deliberately unchanged: the legacy rule never mentioned the payment process */
xw.purfView = "enc"; xw.purfPath = null;
const encOff = C("purFEncTotal", xw); payOn(true); const encOn = C("purFEncTotal", xw); payOn(false);
A.eq(encOff, encOn, "the encumbrance total is the same either way (GLAccountRepository.cs:2220 keys off Status, not payment)");
xw.purfView = null; xw.purfPath = null; reset();

/* owner (8 Oct): the menu caret sits on the edge facing its chip and points at it, like every shell .pop (data-dir + --caret-x); without them it showed as a diamond inside the menu */
{ const src = blockRaw, at = src.indexOf("function purFPositionPop(el,anchor){"); A.ok(at > -1, "purFPositionPop present");
  const body = at > -1 ? src.slice(at, src.indexOf("function ", at + 10)) : "";
  A.ok(/setAttribute\("data-dir"/.test(body), "purFPositionPop sets data-dir so the caret sits on the edge"); A.ok(/setProperty\("--caret-x"/.test(body), "purFPositionPop points the caret at the chip (--caret-x)"); }
A.contains(css, ".purf-root .purf-c-num{flex:0 1 100px;min-width:48px;", "Requisition # column shrinks to a floor and ellipsizes (owner, 9 Oct: no sideways scroll)");
/* owner (9 Oct): the table sorts from its headers like Budget Compared to Actual, lists every row, and scrolls */
{ xw.purfStatus = null; xw.purfSort = null; const th = C("purFTable", xw);
  A.ok(/<span class="purf-c-date" role="columnheader"><button class="wt-sort on" data-purf="sort" data-id="[^"]+" data-k="issued"[^>]*>Issued <span class="material-symbols-rounded" aria-hidden="true">arrow_downward<\/span><\/button>/.test(th), "default sort: Issued descending, newest first, marked on the header (owner, 9 Oct)");
  A.eq((th.match(/class="wt-sort/g) || []).length, 6, "every header sorts"); A.eq((th.match(/class="wt-row purf-trow purf-rowclick"/g) || []).length, C("purFTableRows", xw).length, "every row is listed, no cap");
  const tap = function (k) { const el = env.shim.mkTarget({ "data-purf": "sort", "data-id": xw.id, "data-k": k }, "button"); el.closest = function (sel) { return sel.indexOf("data-purf") > -1 ? el : null; }; C("purFHandleClick", { target: el }); };
  tap("issued"); A.eq(xw.purfSort, "issued-asc", "clicking the active header flips it to oldest first"); tap("amt"); A.eq(xw.purfSort, "amt-desc", "a number header opens largest first"); const amts = C("purFTableRows", xw).map(function (p) { return p.amt; }); A.ok(amts.every(function (v, i) { return i === 0 || amts[i - 1] >= v; }), "rows follow the sort");
  tap("vendor"); A.eq(xw.purfSort, "vendor-asc", "a text header opens ascending"); xw.purfSort = null;
  /* Encumbrances (owner, 9 Oct): the status chip shows and filters the bars, and every month to the current one has a bar */
  xw.purfView = "enc"; xw.purfStatus = null; xw.purfPath = null;
  A.contains(C("purFHeaderBlock", xw), 'data-purf="status"', "the status chip is shown on the Encumbrances view too, as V1's Committed view had it");
  let per = C("purFEncPeriods", xw); A.eq(per.length, 8, "one period per month from the first open order (January 2026) to the current month (August 2026)");
  A.eq(per[0].key, "2026-01", "starts at January"); A.eq(per[per.length - 1].key, "2026-08", "ends at the current month");
  A.ok(per.every(function (r, i) { return i === 0 || (+r.key.slice(5)) === (+per[i - 1].key.slice(5)) + 1; }), "months are consecutive: a quiet month would show as $0, not vanish");
  A.contains(C("purFEncCtx", xw), "across 8 accounting periods", "the context line counts them");
  const encAll = C("purFEncTotal", xw); xw.purfStatus = "Approved"; const encApproved = C("purFEncTotal", xw); A.ok(encApproved > 0 && encApproved < encAll, "Approved narrows the bars to approved, unpaid orders");
  A.ok(C("purFEncRows", xw).every(function (p) { return p.stage === "Approved"; }), "and every bar order is approved"); A.contains(C("purFEncCtx", xw), "Approved, unpaid.", "the context line says so");
  xw.purfStatus = "Awaiting my approval"; A.ok(C("purFEncRows", xw).length > 0 && C("purFEncRows", xw).every(function (p) { return C("purFTurn", p).kind === "next"; }), "Awaiting my approval: the bars sum only the requests at my level");
  xw.purfStatus = "Unapproved"; A.contains(C("purFEncCtx", xw), "Pending, unpaid.", "Unapproved: pending orders only, and the line says so");
  xw.purfStatus = null; xw.purfView = null;
  A.contains(css, ".purf-root .purf-tscroll{flex:1 1 auto;min-height:0;overflow:auto;}", "the table body scrolls"); }
process.exit(A.report());
