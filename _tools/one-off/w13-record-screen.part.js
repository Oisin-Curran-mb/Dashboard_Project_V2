/* ---- Record screen: the Requests / Update page, one to one, inside the pop-up ------------------------
   Rules ported from Requests/Update.aspx(.cs) and Content/scripts/Controls/POApprovalsGrid.js:
     - one grid row per approver (LoadApprovals): a "Starts with <creator>" row at level 0 when the creator is
       not on the path, then every approver in path order, "Or" for a second approver on the same level, the
       last non-Or row reads "Ends with"; inactive / out-of-office approvers flagged in red
     - ticking Approved on a row ticks every row at or below its level and clears their Rejected and Hold;
       unticking clears Approved and Rejected on its level and above (checkApproved click handler)
     - a box is enabled only down to and including the viewer's own level (setApprovalRows), Approved
       disables Rejected and Hold on the row and the reverse, a Reason is editable only while its box is
       ticked, and an acted row on a level after the viewer's disables every Approved and Rejected box
     - any acted row locks Type, Approval Path, Vendor, Ship To and the Detail lines
     - Status list: the current value and Closed are always offered; Voided only from Approved (and only when
       the creator is on the path); Approved from Closed, or from Voided when every box is ticked
     - Submit for Approval is shown while Unapproved with nothing approved; saved unticked the request is
       "not submitted" (legacy Status -1) and the hover text calls that a hold on the approval process
     - Save applies everything at once, like the postback; Cancel discards; the body scrolls, header and
       footer stay put.
   Every edit is kept for this session only: no dashboard write API exists yet. */
var PURF_OVERRIDE=false; /* the /PurchasingManagement/Requests/ApprovalOverride right; off for the demo viewer */
var PURF_USER_META={"Jim AndersonAndMoreLetters":{outOfOffice:true,until:"2026-09-05"}};
var PURF_STATUSES=["Unapproved","Approved","Closed","Voided"];
function purFCreator(po){return po.creator||"Alberto Allen";}
function purFSubmitted(po){return po.submitted!==false;}
function purFStageToStatus(po){return po.stage==="Pending"?"Unapproved":po.stage;}
function purFCreatorOnPath(po,pathName){var p=PURF_PATHS[pathName];return !!p&&p.steps.some(function(s){return s.users.indexOf(purFCreator(po))>-1;});}
/* One row per approver, as LoadApprovals builds them. acted = the stored rows for that path. */
function purFGridRows(po,pathName,acted,isRequest){
  var p=PURF_PATHS[pathName];if(!p)return [];
  var rows=[],creator=purFCreator(po);
  if(isRequest&&!purFCreatorOnPath(po,pathName))rows.push({seq:0,user:creator,min:0,creator:true});
  p.steps.forEach(function(s){s.users.forEach(function(u,i){rows.push({seq:s.seq,user:u,min:(s.mins&&s.mins[i]!=null)?s.mins[i]:(s.min||0)});});});
  var last=-1;
  rows.forEach(function(r){if(last===r.seq){r.pre="Or ";r.or=true;}else{r.pre=(last===-1)?"Starts with ":"Then ";last=r.seq;}});
  for(var i=rows.length-1;i>=0;i--){if(!rows[i].or){rows[i].pre="Ends with ";break;}}
  rows.forEach(function(r){
    var here=(acted||[]).filter(function(a){return a.user===r.user;});
    var ap=here.filter(function(a){return a.state==="approved";})[0],rj=here.filter(function(a){return a.state==="rejected";})[0],hd=here.filter(function(a){return a.state==="hold";})[0];
    if(r.creator){ap=purFSubmitted(po)?{user:creator,d:po.issued}:null;rj=null;hd=null;}
    r.approved=!!ap;r.rejected=!!rj;r.rejReason=rj?(rj.reason||""):"";r.hold=!!hd;r.holdReason=hd?(hd.reason||""):"";
    var act=ap||rj||hd;r.updatedBy=act?((act.by||act.user)+" "+purFFmtDate(act.d)):"";r.d=act?act.d:null;r.by=act?(act.by||act.user):null;
    var meta=PURF_USER_META[r.user]||{};r.flag=meta.inactive?" - inactive":(meta.outOfOffice?(" - out of office"+(meta.until?(" until "+purFFmtDate(meta.until)):"")):"");
  });
  return rows;
}
/* setApprovalRows: which boxes the viewer may tick. Returns whether any row has acted (locks the header). */
function purFGridEnable(rows,editEnabled){
  var found=false,last=-1,disableAll=false,anyActed=false;
  rows.forEach(function(r){
    var approved=r.approved,rejected=!approved&&r.rejected,held=!approved&&!rejected&&r.hold;
    if(approved||rejected||held)anyActed=true;
    var base=(!found||last===r.seq);
    r.canApprove=base&&!rejected&&!held;r.canReject=base&&!approved&&!held;r.canHold=base&&!approved&&!rejected;
    r.canRejReason=base&&rejected;r.canHoldReason=base&&held;
    if(found&&last!==r.seq&&(approved||rejected||held))disableAll=true;
    if(!found)last=r.seq;
    if(!PURF_OVERRIDE&&r.user===PURF_ME)found=true;
  });
  var noRight=(!PURF_OVERRIDE&&!found);
  if(disableAll||noRight)rows.forEach(function(r){r.canApprove=false;r.canReject=false;});
  if(!editEnabled)rows.forEach(function(r){r.canApprove=r.canReject=r.canHold=r.canRejReason=r.canHoldReason=false;});
  return {anyActed:anyActed,lockedAbove:disableAll,noRight:noRight};
}
/* checkApproved click: the cascade. */
function purFGridTick(rows,i,kind,on){
  var r=rows[i];if(!r)return;
  if(kind==="approve"){
    if(on)rows.forEach(function(x){if(x.seq<=r.seq){x.approved=true;x.rejected=false;x.rejReason="";x.hold=false;x.holdReason="";}});
    else rows.forEach(function(x){if(x.seq>=r.seq){x.approved=false;x.rejected=false;}});
  }else if(kind==="reject"){r.rejected=on;if(!on)r.rejReason="";}
  else if(kind==="hold"){r.hold=on;if(!on)r.holdReason="";}
}
/* Rows back to stored acted rows. Ticks made in this session carry the viewer as the actor (Approval Updated By). */
function purFRowsToActed(rows){
  var out=[];rows.forEach(function(r){
    if(r.creator)return;
    var d=r.d||"2026-08-19",by=r.by||PURF_ME;
    if(r.approved)out.push({seq:r.seq,user:r.user,state:"approved",d:d,by:by,reason:""});
    else if(r.rejected)out.push({seq:r.seq,user:r.user,state:"rejected",d:d,by:by,reason:r.rejReason||"unknown"});
    else if(r.hold)out.push({seq:r.seq,user:r.user,state:"hold",d:d,by:by,reason:r.holdReason||"unknown"});
  });return out;
}
/* Status list enablement (setApprovalRows tail + LoadApprovals). */
function purFStatusOptions(po,cur,rows){
  var allTicked=rows.length>0&&rows.every(function(r){return r.approved;}),creatorOn=purFCreatorOnPath(po,po.path);
  return PURF_STATUSES.map(function(s){
    var on=(s===cur)||(s==="Closed")||(s==="Voided"&&cur==="Approved"&&creatorOn)||(s==="Approved"&&(cur==="Closed"||(cur==="Voided"&&allTicked)));
    return {value:s,enabled:on};
  });
}
function purFRecordDraft(po){
  var st=purFStageToStatus(po);
  return {status:st,type:po.type||"Purchase Order",path:po.path,payPath:po.payPath||po.path,submit:purFSubmitted(po),
    rows:purFGridRows(po,po.path,po.appr||[],true),
    payRows:(po.stage==="Approved"||po.stage==="Closed")?purFGridRows(po,po.payPath||po.path,po.payAppr||[],false):[],
    snapF:JSON.stringify(po.f||{}),snapInv:JSON.stringify(po.inv||null)};
}
/* Save: the postback. */
function purFRecordSave(w,po,dr){
  var editEnabled=!(po.paid||po.pay==="paid"||po.stage==="Closed"||po.stage==="Voided");
  var log=[],before=po.stage;
  var en=purFGridEnable(dr.rows,editEnabled);
  if(editEnabled){
    if(!en.anyActed){if(dr.path!==po.path){po.path=dr.path;log.push("approval path "+dr.path);}if(dr.type!==(po.type||"Purchase Order")){po.type=dr.type;log.push("type "+dr.type);}}
    po.appr=purFRowsToActed(dr.rows);
    var wasSub=purFSubmitted(po);po.submitted=(dr.status!=="Unapproved")||dr.submit||dr.rows.some(function(r){return r.approved&&!r.creator;});
    if(po.submitted!==wasSub)log.push(po.submitted?"submitted for approval":"not submitted: will submit later");
    po.hold=po.appr.some(function(a){return a.state==="hold";});
    if(dr.payRows.length){po.payPath=dr.payPath||po.payPath||po.path;po.payAppr=purFRowsToActed(dr.payRows);po.payDone=purFPathDone(po.payPath,po.amt,po.payAppr);}
  }
  /* status: the dropdown first, then the path outcome (ApproveOrder POR:1776-1785) */
  var cur=purFStageToStatus(po),opts=purFStatusOptions(po,cur,dr.rows),pick=opts.filter(function(o){return o.value===dr.status&&o.enabled;})[0]?dr.status:cur;
  if(pick!==cur){po.stage=(pick==="Unapproved")?"Pending":pick;log.push("status "+pick);}
  if(po.stage==="Pending"&&po.submitted&&!po.appr.some(function(a){return a.state==="rejected";})&&purFPathDone(po.path,po.amt,po.appr)){po.stage="Approved";po.pay=po.pay||"unpaid";po.payPath=po.payPath||po.path;po.payAppr=po.payAppr||[];log.push("approved: every level satisfied");}
  else if(po.stage==="Approved"&&pick==="Approved"&&cur==="Approved"&&!po.paid&&po.pay!=="paid"&&!po.payDone&&!purFPathDone(po.path,po.amt,po.appr)){po.stage="Pending";po.pay=null;log.push("back to Unapproved: an approval was removed");}
  po.log=po.log||[];
  po.log.push({d:"2026-08-19",by:purFWho(PURF_ME),to:purFStageToStatus(po)+(po.hold?" (on hold)":""),note:"Record saved"+(log.length?": "+log.join(", "):"")});
  return {changed:log.length>0||before!==po.stage,summary:log};
}
function purFRecordCancel(po,dr){try{po.f=JSON.parse(dr.snapF);var inv=JSON.parse(dr.snapInv);if(inv)po.inv=inv;}catch(e){}}
/* The grid, both paths. */
function purFRecordGrid(w,po,rows,editEnabled,which,title){
  var en=purFGridEnable(rows,editEnabled);
  var box=function(kind,on,can,i,lbl){return '<button class="purf-box'+(on?" on":"")+'" role="checkbox" aria-checked="'+on+'" aria-label="'+purFEsc(lbl)+'"'+(can?'':' aria-disabled="true"')+' data-purf="grid-tick" data-g="'+which+'" data-k="'+kind+'" data-i="'+i+'" data-v="'+(on?"off":"on")+'" data-id="'+w.id+'">'+purFIcon(on?"check_box":"check_box_outline_blank")+'</button>';};
  var reason=function(kind,val,can,i,lbl){return can?'<input class="purf-fin purf-fin-reason" type="text" value="'+purFEsc(val)+'" data-purf-reason="'+kind+'" data-g="'+which+'" data-i="'+i+'" data-id="'+w.id+'" aria-label="'+purFEsc(lbl)+'">':'<span class="purf-a-ro">'+purFEsc(val)+'</span>';};
  var body=rows.map(function(r,i){
    var name=(r.or?'<span class="purf-a-or"></span>':"")+purFEsc(r.pre)+purFEsc(purFWho(r.user))+(r.flag?'<span class="purf-a-flag">'+purFEsc(r.flag)+'</span>':"");
    return '<div class="wt-row purf-aprow'+(r.user===PURF_ME?" purf-ap-me":"")+(r.creator?" purf-ap-creator":"")+'" role="row"><span class="lr-main" role="cell">'+name+'</span>'+
      '<span class="purf-a-b" role="cell">'+box("approve",r.approved,r.canApprove,i,"Approved, "+r.user)+'</span>'+
      '<span class="purf-a-b" role="cell">'+box("reject",r.rejected&&!r.approved,r.canReject,i,"Rejected, "+r.user)+'</span>'+
      '<span class="purf-a-r" role="cell">'+reason("reject",r.rejReason,r.canRejReason,i,"Rejected reason, "+r.user)+'</span>'+
      '<span class="purf-a-b" role="cell">'+box("hold",r.hold&&!r.approved&&!r.rejected,r.canHold,i,"Hold, "+r.user)+'</span>'+
      '<span class="purf-a-r" role="cell">'+reason("hold",r.holdReason,r.canHoldReason,i,"Hold reason, "+r.user)+'</span>'+
      '<span class="purf-a-u" role="cell">'+purFEsc(r.updatedBy)+'</span></div>';
  }).join("");
  var note=en.noRight?"You are not on this path, so the Approved and Rejected boxes are read-only.":(en.lockedAbove?"A later level has already acted, so Approved and Rejected are locked on every row.":"Boxes are enabled down to your own level. Ticking Approved also ticks the levels below it.");
  return '<div class="purf-flbl purf-gridttl">'+purFEsc(title)+'</div><div class="purf-apgrid" role="table" aria-label="'+purFEsc(title)+'">'+
    '<div class="wt-row wt-head purf-aprow" role="row"><span class="lr-main" role="columnheader">Approval Needed By:</span><span class="purf-a-b" role="columnheader">Approved</span><span class="purf-a-b" role="columnheader">Rejected</span><span class="purf-a-r" role="columnheader">Reason</span><span class="purf-a-b" role="columnheader">Hold</span><span class="purf-a-r" role="columnheader">Reason</span><span class="purf-a-u" role="columnheader">Approval Updated By:</span></div>'+body+'</div>'+
    (editEnabled?'<div class="purf-mnote">'+note+'</div>':'<div class="purf-mnote">Read-only: this order is '+purFEsc(purFStageToStatus(po).toLowerCase())+(po.paid||po.pay==="paid"?" and paid":"")+'.</div>');
}
function purFSel(w,key,val,opts,disabled,label){
  return '<select class="purf-fin purf-sel" data-purf-sel="'+key+'" data-id="'+w.id+'" aria-label="'+purFEsc(label)+'"'+(disabled?' disabled':'')+'>'+opts.map(function(o){var v=(typeof o==="string")?o:o.value,en=(typeof o==="string")?true:o.enabled;return '<option value="'+purFEsc(v)+'"'+(v===val?' selected':'')+(en?'':' disabled')+'>'+purFEsc(v)+'</option>';}).join("")+'</select>';
}
function purFModalHTML(){
  if(!PURF_MODAL)return "";
  var w=find(PURF_MODAL.id);if(!w)return "";
  var po=purFPO(w,PURF_MODAL.ref);if(!po)return "";
  if(!PURF_MODAL.draft)PURF_MODAL.draft=purFRecordDraft(po);
  var dr=PURF_MODAL.draft,tab=PURF_MODAL.tab||"detail";
  var vm=purFVendorMeta(po.vendor),da=purFDeptAcct(po.dept),isCR=(dr.type==="Check Request");
  var editEnabled=!(po.paid||po.pay==="paid"||po.stage==="Closed"||po.stage==="Voided");
  var en=purFGridEnable(dr.rows.map(function(r){var c={};for(var k in r)c[k]=r[k];return c;}),editEnabled);
  var headLocked=en.anyActed||!editEnabled;
  var statusIsApproved=(dr.status==="Approved");
  var vendorOn=editEnabled&&!statusIsApproved&&!dr.rows.some(function(r){return r.approved&&!r.creator;}),shipOn=editEnabled&&!statusIsApproved;
  var sub="Purchasing Management, Requests, Update. "+purFStageToStatus(po)+(po.hold?", on hold":"")+((po.stage==="Approved"&&po.pay)?", "+(po.pay==="paid"?"paid":"not paid"):"")+(purFSubmitted(po)?"":", not submitted");
  var head='<div class="modal-h purf-m-hd"><span class="modal-title">'+purFIcon("receipt_long")+(isCR?"Check request ":"Purchase order ")+po.ref+
    '<span class="purf-m-sub">'+purFEsc(sub)+'</span></span><button class="iconbtn" data-purf="close-modal" aria-label="Close">'+purFIcon("close")+'</button></div>';
  var pick=function(key,on,lbl){return '<button class="purf-pick" data-purf="pick-stub" data-v="'+key+'" data-id="'+w.id+'" aria-label="'+purFEsc(lbl)+'"'+(on?'':' aria-disabled="true"')+'>'+purFIcon("search")+'</button>';};
  var left='<div class="purf-rec-col">'+
    '<div class="purf-fld purf-fld-vendor"><span class="purf-flbl">Vendor</span><div class="purf-vname">'+purFEsc(po.vendor)+pick("vendor",vendorOn,"Pick a vendor")+'</div><div class="purf-vmeta">'+purFEsc(vm.a)+'</div><div class="purf-vmeta"><strong>Terms:</strong> '+purFEsc(vm.t)+'</div></div>'+
    purFFld(w,po,"Email","email",purFF(po,"email"),!editEnabled,"")+
    '<div class="purf-fld"><span class="purf-flbl">Type</span>'+purFSel(w,"type",dr.type,["Purchase Order","Check Request"],headLocked,"Type")+'</div>'+
    '<div class="purf-fld"><span class="purf-flbl">Status</span>'+purFSel(w,"status",dr.status,purFStatusOptions(po,purFStageToStatus(po),dr.rows),!editEnabled&&po.stage!=="Closed"&&po.stage!=="Voided","Status")+'</div>'+
    '<div class="purf-fld"><span class="purf-flbl"><span class="purf-req">*</span> Approval Path</span>'+purFSel(w,"path",dr.path,Object.keys(PURF_PATHS).filter(function(k){return PURF_PATHS[k].forRequest!==false;}),headLocked,"Approval Path")+'</div>'+
    (statusIsApproved||po.stage==="Approved"||po.stage==="Closed"?'<div class="purf-fld"><span class="purf-flbl">Payment Approval Path</span>'+purFSel(w,"payPath",dr.payPath,Object.keys(PURF_PATHS).filter(function(k){return PURF_PATHS[k].forPayment!==false;}),!editEnabled||!!po.payDone,"Payment Approval Path")+'</div>':"")+
    purFFld(w,po,"Requisition #","reqNo",po.ref.replace("PO-",""),true,"")+
    purFFld(w,po,isCR?"Check Request #":"Purchase Order #","poNo",purFF(po,"poNo",po.stage==="Pending"?"":po.ref.replace("PO-","")),!editEnabled||isCR,"")+
  '</div>';
  var right='<div class="purf-rec-col">'+
    '<div class="purf-fld"><span class="purf-flbl">Ship To</span><div class="purf-vname purf-shipto">'+purFEsc(purFF(po,"shipTo","(not set)"))+pick("shipTo",shipOn,"Pick a ship-to")+'</div></div>'+
    purFFld(w,po,"Purchase Order Date","poDate",purFF(po,"poDate",purFFmtDate(po.issued)),!editEnabled,"")+
    purFFld(w,po,"Issued To","issuedTo",purFF(po,"issuedTo"),!editEnabled,"")+
    purFFld(w,po,"Agent","agent",purFF(po,"agent"),!editEnabled,"")+
    purFFld(w,po,"Shipping","shipping",purFF(po,"shipping"),!editEnabled,"")+
    purFFld(w,po,"Date Requested","reqDate",purFF(po,"reqDate",purFFmtDate(po.issued)),!editEnabled,"")+
  '</div>';
  var rec='<div class="purf-rec">'+left+right+'</div>';
  var tabs=[["detail","Detail"],["approvals","Approvals"],["attachments","Attachments"],["note","Note"]];
  if(po.stage==="Approved"||po.stage==="Closed")tabs.push(["payment","Payment Approval"]);
  if(!tabs.some(function(t){return t[0]===tab;}))tab="detail";
  var tabRow='<div class="pur-tabs purf-mtabs" role="tablist" aria-label="Record sections">'+tabs.map(function(t){
    return '<button class="pur-tab'+(tab===t[0]?" on":"")+'" role="tab" aria-selected="'+(tab===t[0])+'" data-purf="tab" data-v="'+t[0]+'" data-id="'+w.id+'">'+t[1]+'</button>';
  }).join("")+'</div>';
  var body="";
  var linesRO=headLocked;
  if(tab==="detail"){
    var lin=function(key,val,lbl,ph){return linesRO?'<span class="purf-a-ro">'+purFEsc(val)+'</span>':'<input class="purf-fin" type="text" value="'+purFEsc(val)+'" data-purf-field="'+key+'" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'" aria-label="'+lbl+'"'+(ph?' placeholder="'+ph+'"':'')+'>';};
    body+='<div class="purf-lines" role="table" aria-label="Line items">'+
      '<div class="wt-row wt-head purf-lrow" role="row"><span class="purf-l-per" role="columnheader">Period</span><span class="lr-main" role="columnheader">Account</span><span class="purf-l-desc" role="columnheader">Description</span><span class="purf-l-proj" role="columnheader">Project</span><span class="wt-c2" role="columnheader">Amount</span></div>'+
      '<div class="wt-row purf-lrow" role="row"><span class="purf-l-per" role="cell">8 August</span><span class="lr-main" role="cell">'+purFEsc(da.acct)+'</span>'+
        '<span class="purf-l-desc" role="cell">'+lin("lineDesc",purFF(po,"lineDesc"),"Line description","Description")+'</span>'+
        '<span class="purf-l-proj" role="cell">'+lin("lineProj",purFF(po,"lineProj"),"Project","")+'</span>'+
        '<span class="wt-c2" role="cell">'+purFMoney(po.amt)+'</span></div>'+
    '</div>';
    body+='<div class="purf-dist">Fund: '+purFEsc(da.fund)+' &middot; Department: '+purFEsc(da.dept)+' &middot; Account #: '+purFEsc(da.acct)+'</div>';
    var money=function(key,lbl){return '<span>'+lbl+' '+(linesRO?'<span class="purf-a-ro">'+purFEsc(purFF(po,key,"$0.00"))+'</span>':'<input class="purf-fin purf-fin-sm" type="text" value="'+purFEsc(purFF(po,key,"$0.00"))+'" data-purf-field="'+key+'" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'" aria-label="'+lbl+'">')+'</span>';};
    body+='<div class="purf-totrow"><span>1 item</span>'+money("tax","Tax")+money("freight","Freight")+money("other","Other")+'<span class="purf-tot-tot">Total <strong>'+purFMoney(po.amt)+'</strong></span></div>';
    if(linesRO&&editEnabled)body+='<div class="purf-mnote">Lines, Type, Approval Path, Vendor and Ship To are locked once an approval row has acted, as on the record screen.</div>';
    if(po.hold)body+='<div class="purf-holdbar">'+purFIcon("lock")+'On hold'+(purFHoldReason(po)?": "+purFEsc(purFHoldReason(po)):"")+'</div>';
  }else if(tab==="approvals"){
    var tnA=purFTurn(po);
    body+='<div class="purf-turnline purf-turn-'+tnA.kind+'">'+purFIcon(tnA.kind==="next"?"how_to_reg":tnA.kind==="rejected"?"block":tnA.kind==="hold"?"lock":"account_tree")+purFEsc(tnA.label)+'</div>';
    body+=purFRecordGrid(w,po,dr.rows,editEnabled&&po.stage!=="Approved"||editEnabled&&po.stage==="Approved"&&!po.payDone,"req","Approval Path: "+dr.path);
  }else if(tab==="attachments"){
    body+='<div class="purf-none">No attachments on this request.</div>'+
      '<div class="purf-mact"><button class="btn outlined sm" data-purf="attach-stub" data-id="'+w.id+'">'+purFIcon("attach_file")+'Add New Attachment</button></div>';
  }else if(tab==="note"){
    body+='<textarea class="purf-note" rows="3" id="purfRecordNote" aria-label="Note" placeholder="Add a note to this request" data-purf-field="note" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'"'+(editEnabled?'':' readonly')+'>'+purFEsc(purFF(po,"note"))+'</textarea>';
    body+='<div class="purf-flbl purf-actlbl">Activity</div>';
    if(po.log&&po.log.length){
      body+=po.log.map(function(l){return '<div class="purf-actrow"><span class="purf-actmain"><strong>'+purFEsc(l.to)+'</strong> by '+purFEsc(l.by)+', '+purFFmtDate(l.d)+'</span>'+(l.note?'<span class="purf-actnote">'+purFEsc(l.note)+'</span>':"")+'</div>';}).join("");
    }else body+='<div class="purf-none">No activity recorded on this request yet.</div>';
  }else{
    body+='<div class="purf-mnote purf-disputed">'+purFIcon("info")+'<span>Payment approval inside the widget versus a redirect to the established payment screen is an open dispute (Feargal Phelan, action item C3). This is the built behaviour, carried unresolved.</span></div>';
    if(dr.payRows.length)body+=purFRecordGrid(w,po,dr.payRows,editEnabled&&!po.payDone,"pay","Payment Approval Path: "+dr.payPath);
    var inv=purFInvoices(po);
    if(po.stage!=="Closed")body+='<div class="purf-mact purf-mact-l"><button class="btn naked sm" data-purf="add-invoice" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'">'+purFIcon("add")+'Add Invoice Payment Approval</button></div>';
    else body+='<div class="purf-none">Closed order: the payment history is read-only.</div>';
    body+='<div class="purf-invtbl" role="table" aria-label="Invoice payment approvals">'+
      '<div class="wt-row wt-head purf-irow" role="row"><span class="lr-main" role="columnheader">Invoice Number</span><span class="purf-i-n" role="columnheader">Tax</span><span class="purf-i-n" role="columnheader">Freight</span><span class="purf-i-n" role="columnheader">Other</span><span class="purf-i-c" role="columnheader">Check #</span><span class="purf-i-c" role="columnheader">Check Date</span><span class="purf-i-s" role="columnheader">Who Setup</span></div>';
    if(!inv.length)body+='<div class="wt-row purf-irow" role="row"><span class="lr-main purf-none" role="cell">No invoice payment approvals yet. Use Add Invoice Payment Approval above.</span></div>';
    else body+=inv.map(function(r,i){
      return '<div class="wt-row purf-irow" role="row">'+
        '<span class="lr-main" role="cell"><input class="purf-fin" type="text" value="'+purFEsc(r.no)+'" data-purf-inv="no" data-purf-i="'+i+'" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'" aria-label="Invoice number"></span>'+
        '<span class="purf-i-n" role="cell"><input class="purf-fin purf-fin-sm" type="text" value="'+purFEsc(r.tax)+'" data-purf-inv="tax" data-purf-i="'+i+'" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'" aria-label="Tax"></span>'+
        '<span class="purf-i-n" role="cell"><input class="purf-fin purf-fin-sm" type="text" value="'+purFEsc(r.freight)+'" data-purf-inv="freight" data-purf-i="'+i+'" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'" aria-label="Freight"></span>'+
        '<span class="purf-i-n" role="cell"><input class="purf-fin purf-fin-sm" type="text" value="'+purFEsc(r.other)+'" data-purf-inv="other" data-purf-i="'+i+'" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'" aria-label="Other"></span>'+
        '<span class="purf-i-c" role="cell">'+purFEsc(r.check||"")+'</span><span class="purf-i-c" role="cell">'+purFEsc(r.checkDate||"")+'</span><span class="purf-i-s" role="cell">'+purFEsc(r.setup)+'</span></div>';
    }).join("");
    body+='</div>';
    var paid=(po.pay==="paid"||po.paid);
    body+='<div class="purf-submitrow"><button class="purf-box'+(paid?" on":"")+'" role="checkbox" aria-checked="'+paid+'" aria-label="Submit for payment"'+(paid||!po.payDone?' aria-disabled="true"':'')+' data-purf="pay-submit" data-purf-ref="'+purFEsc(po.ref)+'" data-id="'+w.id+'">'+purFIcon(paid?"check_box":"check_box_outline_blank")+'</button>'+
      '<span class="purf-submitlbl">Submit for Approval</span>'+(paid?'<span class="purf-paidnote">Paid: the card is green on the board.</span>':(po.payDone?"":'<span class="purf-paidnote">Enabled once the payment approval path is satisfied.</span>'))+'</div>';
  }
  /* Submit for Approval (order): shown while Unapproved with nothing approved, as submitForApproval() does */
  var showSubmit=editEnabled&&dr.status==="Unapproved"&&!dr.rows.some(function(r){return r.approved&&!r.creator;});
  var submitRow=showSubmit?'<div class="purf-submitrow purf-submit-order"><button class="purf-box'+(dr.submit?" on":"")+'" role="checkbox" aria-checked="'+dr.submit+'" aria-label="Submit for Approval" data-purf="submit-toggle" data-id="'+w.id+'">'+purFIcon(dr.submit?"check_box":"check_box_outline_blank")+'</button>'+
    '<span class="purf-submitlbl">Submit for Approval</span><span class="purf-hoverinfo" title="Leaving this check box unchecked will put this request on hold from proceeding with the approval process." aria-label="Leaving this check box unchecked will put this request on hold from proceeding with the approval process.">'+purFIcon("info")+'</span></div>':"";
  var foot='<div class="modal-f purf-m-ft purf-rec-ft"><span class="purf-m-note">Every edit is kept for this session only: no dashboard write API exists yet.</span>'+
    '<button class="btn naked sm" data-purf="close-modal">Cancel</button>'+
    '<button class="btn primary sm" data-purf="record-save" data-id="'+w.id+'"'+(editEnabled||po.stage==="Closed"||po.stage==="Voided"?'':' disabled')+'>Save</button></div>';
  return '<div class="modal-backdrop" data-purf="close-modal"><div class="modal purf-modal purf-record" data-purf="stop" role="dialog" aria-modal="true" aria-label="'+purFEsc("Purchase order "+po.ref+", "+po.vendor)+'">'+
    head+'<div class="purf-m-scroll">'+rec+tabRow+'<div class="modal-b purf-m-bd">'+body+'</div>'+submitRow+'</div>'+foot+'</div></div>';
}
