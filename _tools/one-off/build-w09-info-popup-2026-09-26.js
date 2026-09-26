// One-off, 2026-09-26, owner ruling (docs/decisions/W09.md item 12): the person Info pop-up drops the
// placeholder note and splits into two sections, "Pending approval" (days by leave type, and who else
// from the same department is out during those pending dates) and "Taken and approved" (days by type).
// Anchored; aborts before writing on any miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const s = t.indexOf("function ptoFInfoPanelHTML(){"); if (s < 0) throw new Error("fn start");
const e = t.indexOf(NL + "}" + NL, s) + (NL + "}" + NL).length;
const oldFn = t.slice(s, e); if (oldFn.indexOf("Placeholder, not yet available") < 0 || oldFn.indexOf("ptoFOverlapStaff(w,pk)") < 0) throw new Error("fn shape");
const newFn = [
  "/* Person pop-up: two sections. Pending approval (days by leave type this year, and who else from the same",
  "   department is out during those pending dates) and Taken and approved (days by type). Informational only. */",
  "function ptoFPersonDaysByState(w,pk,approved){var out={},tot=0;ptoFYearFlat(w).forEach(function(fe){if(fe.personKey!==pk)return;var isA=(ptoFEff(w,fe)===\"Approved\");if(isA!==approved)return;var n=ptoFEntryDays(fe);out[fe.type]=(out[fe.type]||0)+n;tot+=n;});return {by:out,tot:tot};}",
  "function ptoFOverlapSameDept(w,pk,dept){var mine=ptoFFlat(w).filter(function(fe){return fe.personKey===pk&&ptoFEff(w,fe)!==\"Approved\";});var out=[],seen={};ptoFFlat(w).forEach(function(fe){if(fe.personKey===pk||fe.dept!==dept)return;var ok=false;for(var i=0;i<mine.length;i++){if(ptoFRangesOverlap(mine[i],fe)){ok=true;break;}}if(!ok||seen[fe._id])return;seen[fe._id]=1;out.push({person:fe.person,pg:fe.pg,type:fe.type,dates:ptoFDates(fe),status:ptoFEffState(w,fe)});});return out;}",
  "function ptoFInfoTypes(by){var rows=PTOF_LEAVE_TYPES.filter(function(o){return (by[o.key]||0)>0;});if(!rows.length)return '<div class=\"ptof-info-empty\">None</div>';return rows.map(function(o){var n=by[o.key];return '<div class=\"ptof-info-typ\"><span class=\"ptof-info-typ-nm\">'+o.key+'</span><span class=\"ptof-info-typ-n\">'+n+(n===1?\" day\":\" days\")+'</span></div>';}).join(\"\");}",
  "function ptoFInfoPanelHTML(){",
  "  var st=PTOF_INFO;if(!st)return \"\";",
  "  var w=find(st.id);if(!w)return \"\";",
  "  var pk=st.pk;var nm=ptoFPersonName(pk);var meta=ptoFPersonMeta(w,pk);",
  "  var pend=ptoFPersonDaysByState(w,pk,false),appr=ptoFPersonDaysByState(w,pk,true);",
  "  var others=ptoFOverlapSameDept(w,pk,meta.dept);",
  "  var othersHtml=others.length",
  "    ?others.map(function(o){return '<div class=\"ptof-info-oth\"><div class=\"ptof-info-oth-main\"><div class=\"ptof-info-oth-nm\">'+o.person+'</div><div class=\"ptof-info-oth-grp\">'+o.pg+'</div></div><div class=\"ptof-info-oth-side\"><div class=\"ptof-info-oth-dt\">'+o.dates+'</div><div class=\"ptof-info-oth-lt\">'+o.type+' &middot; '+o.status+'</div></div></div>';}).join(\"\")",
  "    :'<div class=\"ptof-info-empty\">No one else from '+meta.dept+' is off during these dates.</div>';",
  "  var days=function(n){return n+(n===1?\" day\":\" days\");};",
  "  return '<div class=\"modal-backdrop\" data-pto=\"pto-ovl-close\"><div class=\"modal ptof-ovl\" data-pto=\"stop\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Time off detail for '+ptoFEsc(nm+\", \"+meta.dept+\", \"+meta.pg)+'\">'+",
  "    '<div class=\"modal-h\"><div class=\"ptof-info-hd-main\"><span class=\"modal-title\">'+nm+'</span><span class=\"ptof-info-hd-sub\">'+meta.dept+' &middot; '+meta.pg+'</span></div><button class=\"iconbtn\" data-pto=\"pto-ovl-close\" aria-label=\"Close detail\">'+ICON(\"close\")+'</button></div>'+",
  "    '<div class=\"modal-b ptof-ovl-b\">'+",
  "      '<div class=\"ptof-info-cap\">Pending approval, '+days(pend.tot)+'</div>'+ptoFInfoTypes(pend.by)+",
  "      (pend.tot?('<div class=\"ptof-info-cap ptof-info-cap2\">Also out from '+meta.dept+' during these dates</div>'+othersHtml):'')+",
  "      '<div class=\"ptof-info-cap ptof-info-cap2\">Taken and approved, '+days(appr.tot)+' this year ('+PTOF_WORK_Y+')</div>'+ptoFInfoTypes(appr.by)+",
  "    '</div>'+",
  "    '<div class=\"modal-f ptof-ovl-f\"><span class=\"w09-caption\">Informational only. Approvals are handled in the Approval Queue.</span></div></div></div>';",
  "}", ""].join(NL);
t = t.slice(0, s) + newFn + t.slice(e);
/* helpers no longer used anywhere */
["function ptoFPersonYearByType(", "function ptoFPersonYearTotal(", "function ptoFOverlapStaff("].forEach(function (n) {
  const i = t.indexOf(n); if (i < 0) throw new Error(n); const ls = t.lastIndexOf(NL, i) + NL.length, le = t.indexOf(NL, i) + NL.length; t = t.slice(0, ls) + t.slice(le);
  const nm = n.slice(9, -1); if (new RegExp("(?<![\\w$.])" + nm + "\\s*\\(").test(t.replace(/\/\*[\s\S]*?\*\//g, ""))) throw new Error(nm + " still referenced");
  console.log("removed unused helper: " + nm);
});
const beforeN = t.split(NL).length; t = t.split(NL).filter(function (l) { return !/^\s*\.ptof-note[ {]/.test(l); }).join(NL); if (beforeN - t.split(NL).length !== 2) throw new Error(".ptof-note rules: " + (beforeN - t.split(NL).length));
if (/ptof-note/.test(t.replace(/\/\*[\s\S]*?\*\//g, ""))) throw new Error("ptof-note still used");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
