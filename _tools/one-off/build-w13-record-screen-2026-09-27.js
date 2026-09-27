/* One-off, 2026-09-27, owner: "make sure the pop up is the same as this from the old system as it need to be
   one to one ... follow all the same rules, blockers and locker. there also need to be save and cancel button
   in the bottom right hand corner and needs to be able to scroll" / "the goal that pop up will work the same".
   The record pop-up becomes the Requests/Update page: header fields in the page's order, one grid row per
   approver with the page's cascade and enablement rules, Submit for Approval, Save / Cancel, scrolling body.
   The new modal code lives in w13-record-screen.part.js (plain JS) and is spliced in here. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const part = fs.readFileSync(path.join(__dirname, "w13-record-screen.part.js"), "utf8").replace(/\r?\n/g, NL).replace(/\s+$/, "") + NL;
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
const cutRange = function (a, b, repl, label) { const i = blk.indexOf(a), j = blk.indexOf(b, i); if (i < 0 || j < 0) throw new Error("range: " + label); blk = blk.slice(0, i) + repl + blk.slice(j); console.log("edited: " + label); };

/* 1. modal: replace the whole function with the record screen */
cutRange("function purFModalHTML(){", "/* Move / Close / Void confirm popup", part, "record screen spliced in");

/* 2. open builds the draft */
swap("  PURF_MODAL={id:w.id,ref:ref,tab:tab};" + NL + "  purFClosePop();purFRenderModal();",
     "  PURF_MODAL={id:w.id,ref:ref,tab:tab,draft:purFRecordDraft(po)};" + NL + "  purFClosePop();purFRenderModal();", "open: draft");

/* 3. handlers */
cutRange('   if(a==="appr-box"){', '  if(a==="hold-open")',
  '  /* record screen: ticks and reasons edit the draft; Save applies them (the postback), Cancel discards */' + NL +
  '  if(a==="grid-tick"){' + NL +
  '    if(!PURF_MODAL||!PURF_MODAL.draft)return;' + NL +
  '    var dr=PURF_MODAL.draft,rows=(t.getAttribute("data-g")==="pay")?dr.payRows:dr.rows,gi=+t.getAttribute("data-i"),gk=t.getAttribute("data-k");' + NL +
  '    if(t.getAttribute("aria-disabled")==="true"){setStatus("Locked: boxes are enabled down to your own level, and a later level that has acted locks Approved and Rejected.");return;}' + NL +
  '    purFGridTick(rows,gi,gk,v==="on");' + NL +
  '    if(rows===dr.rows&&gi===0&&rows[0].user===PURF_ME&&gk==="approve")dr.submit=rows[0].approved;' + NL +
  '    purFRenderModal();return;' + NL +
  '  }' + NL +
  '  if(a==="submit-toggle"){' + NL +
  '    if(!PURF_MODAL||!PURF_MODAL.draft)return;' + NL +
  '    var ds=PURF_MODAL.draft;ds.submit=!ds.submit;' + NL +
  '    if(ds.rows[0]&&ds.rows[0].user===PURF_ME)ds.rows[0].approved=ds.submit; /* checkSubmitForApproval change: ticks the first row when it is mine */' + NL +
  '    purFRenderModal();return;' + NL +
  '  }' + NL +
  '  if(a==="record-save"){' + NL +
  '    if(PURF_MODAL&&PURF_MODAL.draft){var ws=find(PURF_MODAL.id),ps=ws?purFPO(ws,PURF_MODAL.ref):null;if(ps){var rs=purFRecordSave(ws,ps,PURF_MODAL.draft);setStatus(ps.ref+" saved"+(rs.summary.length?": "+rs.summary.join(", "):"")+". "+purFTurn(ps).label+".");}}' + NL +
  '    PURF_MODAL=null;purFRenderModal();render();return;' + NL +
  '  }' + NL +
  '  if(a==="pick-stub"){if(t.getAttribute("aria-disabled")==="true"){setStatus("Locked: Vendor and Ship To cannot change once the request is approved or an approval row has acted.");return;}setStatus("The person picker is not built in the dashboard yet; the record screen opens it here.");return;}' + NL,
  "handlers: grid-tick, submit-toggle, record-save, pick-stub");
swap('  if(a==="close-modal"){purFCloseModal();return;}',
     '  if(a==="close-modal"){if(PURF_MODAL&&PURF_MODAL.draft){var wc=find(PURF_MODAL.id),pc=wc?purFPO(wc,PURF_MODAL.ref):null;if(pc)purFRecordCancel(pc,PURF_MODAL.draft);}purFCloseModal();render();return;}', "cancel discards");
swap('  if(a==="update"){setStatus("Changes to this purchase order are kept for this session only: no dashboard write API exists yet.");purFCloseModal();render();return;}' + NL, "", "old Update handler removed");
swap('  if(a==="set-po-path"){' + NL +
     '    if(w&&ref){var pp=purFPO(w,ref);if(pp&&pp.stage==="Pending"&&!pp.hold){pp.path=v;setStatus(pp.ref+" moved to the "+v+" approval path.");}}' + NL +
     '    purFRenderModal();render();return;' + NL +
     '  }' + NL, "", "old path buttons handler removed");

/* 4. input + change */
swap('  var fk=el.getAttribute&&el.getAttribute("data-purf-field");',
     '  var rk=el.getAttribute&&el.getAttribute("data-purf-reason");' + NL +
     '  if(rk&&PURF_MODAL&&PURF_MODAL.draft){var drr=PURF_MODAL.draft,rrows=(el.getAttribute("data-g")==="pay")?drr.payRows:drr.rows,ri=+el.getAttribute("data-i");if(rrows[ri]){if(rk==="reject")rrows[ri].rejReason=el.value;else rrows[ri].holdReason=el.value;}return;}' + NL +
     '  var fk=el.getAttribute&&el.getAttribute("data-purf-field");', "input: reasons edit the draft");
swap('  document.addEventListener("input",purFHandleInput);',
     '  document.addEventListener("input",purFHandleInput);' + NL + '  document.addEventListener("change",purFHandleChange);', "wiring: change listener");
swap("function purFDragStart(e){",
     "/* Record screen dropdowns: Type, Status, Approval Path, Payment Approval Path edit the draft; a path change rebuilds its grid. */" + NL +
     "function purFHandleChange(e){" + NL +
     "  var el=e.target;if(!el||!el.getAttribute)return;" + NL +
     '  var key=el.getAttribute("data-purf-sel");if(!key||!PURF_MODAL||!PURF_MODAL.draft)return;' + NL +
     "  var w=find(el.getAttribute(\"data-id\")),po=w?purFPO(w,PURF_MODAL.ref):null;if(!po)return;" + NL +
     "  var dr=PURF_MODAL.draft;dr[key]=el.value;" + NL +
     '  if(key==="path")dr.rows=purFGridRows(po,dr.path,po.appr||[],true);' + NL +
     '  if(key==="payPath")dr.payRows=purFGridRows(po,dr.payPath,po.payAppr||[],false);' + NL +
     "  purFRenderModal();" + NL +
     "}" + NL +
     "function purFDragStart(e){", "change handler");

/* 5. the Kanban drop uses the same cascade and the same stored rows as Save */
cutRange("function purFApproveStep(w,po,note){", "function purFRejectStep(",
  "/* A drop on the board is my approval at my level, applied with the record screen's cascade (levels at or below" + NL +
  "   mine tick too) and stored as the same rows Save writes, so the board and the record cannot disagree. */" + NL +
  "function purFApproveStep(w,po,note){" + NL +
  "  var m=purFMyLevel(po);if(!m)return false;" + NL +
  "  var live=m.live;po.log=po.log||[];" + NL +
  "  if(m.release){" + NL +
  '    if(live.kind==="request"){po.stage="Approved";po.pay="unpaid";po.payPath=po.payPath||po.path;po.payAppr=po.payAppr||[];po.submitted=true;po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:"Approved",note:"Released: no approver required at this amount"+(note?". "+note:"")});}' + NL +
  '    else{po.payDone=true;po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:"Approved for payment",note:"Released: no approver required at this amount"+(note?". "+note:"")});}' + NL +
  "    return true;" + NL +
  "  }" + NL +
  '  var rows=purFGridRows(po,live.path,live.acted,live.kind==="request"),idx=-1;' + NL +
  "  rows.forEach(function(r,i){if(idx<0&&r.user===PURF_ME&&r.seq===m.step.seq)idx=i;});" + NL +
  "  if(idx<0)return false;" + NL +
  '  purFGridTick(rows,idx,"approve",true);' + NL +
  "  var acted=purFRowsToActed(rows);" + NL +
  '  if(live.kind==="request"){po.appr=acted;po.submitted=true;}else po.payAppr=acted;' + NL +
  '  po.hold=acted.some(function(a){return a.state==="hold";});' + NL +
  "  if(purFPathDone(live.path,po.amt,acted)){" + NL +
  '    if(live.kind==="request"){po.stage="Approved";po.pay="unpaid";po.payPath=po.payPath||po.path;po.payAppr=po.payAppr||[];po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:"Approved",note:note||""});}' + NL +
  '    else{po.payDone=true;po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:"Approved for payment",note:note||""});}' + NL +
  '  }else po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:(live.kind==="request"?"Approved level "+m.step.seq:"Payment approved level "+m.step.seq),note:note||""});' + NL +
  "  return true;" + NL +
  "}" + NL, "approve step: record cascade");

/* 6. not submitted = held from the approval process (the page's own hover text) */
swap("  var steps=purFSteps(live.path,po.amt),acted=live.acted,n=steps.length;" + NL + "  var rej=acted",
     '  if(live.kind==="request"&&!purFSubmitted(po))return {kind:"hold",label:"Not submitted for approval. Open the record and tick Submit for Approval.",by:purFCreator(po)};' + NL +
     "  var steps=purFSteps(live.path,po.amt),acted=live.acted,n=steps.length;" + NL + "  var rej=acted", "turn: not submitted");

t = t.slice(0, b0) + blk + t.slice(b1);

/* 7. CSS */
const swapT = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
const cutT = function (re, label) { const m = t.match(re); if (!m) throw new Error("css cut: " + label); t = t.replace(re, ""); console.log("edited: " + label + " x" + m.length); };
cutT(/  \.purf-root \.purf-vhd\{[^\r\n]*\r\n/g, "old vendor header CSS");
cutT(/  \.purf-root \.purf-hdgrid\{[^\r\n]*\r\n/g, "old header grid CSS");
cutT(/  \.purf-root \.purf-fpath\{[^\r\n]*\r\n/g, "old path buttons CSS");
cutT(/  \.purf-root \.purf-pathbtn\.on\{[^\r\n]*\r\n/g, "old path button on CSS");
const CEND = "/* ===== end W13 Purchasing Management V2 CSS ===== */";
if (t.split(CEND).length !== 2) throw new Error("css end");
const css = [
  "  /* Record screen (Requests / Update, one to one): fixed header and footer, scrolling body, two-column form, per-approver grid. */",
  "  .purf-root .purf-record{display:flex;flex-direction:column;}",
  "  .purf-root .purf-m-scroll{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;scrollbar-width:thin;}",
  "  .purf-root .purf-rec{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;padding:10px 16px 2px;}",
  "  .purf-root .purf-rec-col{display:flex;flex-direction:column;gap:8px;min-width:0;}",
  "  .purf-root .purf-fld-vendor .purf-vname,.purf-root .purf-shipto{display:flex;align-items:center;gap:6px;}",
  "  .purf-root .purf-pick{display:inline-flex;align-items:center;border:0;background:transparent;color:var(--txt-subtle);cursor:pointer;padding:0;}",
  "  .purf-root .purf-pick .material-symbols-rounded{font-size:16px;}",
  "  .purf-root .purf-pick[aria-disabled=\"true\"]{opacity:.4;cursor:default;}",
  "  .purf-root .purf-sel{appearance:auto;-webkit-appearance:menulist;padding:5px 8px;}",
  "  .purf-root .purf-sel:disabled{background:var(--wn-100);color:var(--txt-secondary);}",
  "  .purf-root .purf-req{color:var(--red-100);}",
  "  .purf-root .purf-a-or{display:inline-block;width:16px;}",
  "  .purf-root .purf-a-flag{color:var(--red-100);font-size:11px;margin-left:4px;}",
  "  .purf-root .purf-ap-creator .lr-main{color:var(--txt-secondary);}",
  "  .purf-root .purf-a-ro{font-size:12px;color:var(--txt-secondary);}",
  "  .purf-root .purf-fin-reason{padding:4px 7px;font-size:12px;}",
  "  .purf-root .purf-gridttl{padding-top:4px;}",
  "  .purf-root .purf-submit-order{padding:6px 16px 10px;}",
  "  .purf-root .purf-hoverinfo{display:inline-flex;color:var(--txt-subtle);cursor:help;}",
  "  .purf-root .purf-hoverinfo .material-symbols-rounded{font-size:16px;}",
  "  .purf-root .purf-rec-ft{border-top:1px solid var(--stroke-widget);padding-top:12px;}",
  "  .purf-root .purf-rec-ft .btn[disabled]{opacity:.5;cursor:default;}",
  "  @media (max-width:640px){.purf-root .purf-rec{grid-template-columns:1fr;}}",
  ""].join(NL);
t = t.replace(CEND, css + CEND);
console.log("edited: record screen CSS");
if (/purf-hdgrid|purf-vhd|purf-fpath|purf-pathbtn|data-purf="update"|appr-box|set-po-path/.test(t)) {
  const m = t.match(/.{0,50}(purf-hdgrid|purf-vhd|purf-fpath|purf-pathbtn|data-purf="update"|appr-box|set-po-path).{0,50}/g);
  throw new Error("leftovers: " + JSON.stringify(m.slice(0, 6)));
}
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
