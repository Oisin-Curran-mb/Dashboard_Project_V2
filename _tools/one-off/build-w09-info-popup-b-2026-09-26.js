// One-off, 2026-09-26, owner ruling (docs/decisions/W09.md item 12, second pass): the person pop-up
// loses its footer; the Pending section lists each pending entry with its DATES, and under each entry
// who else from the same department is out on those dates (up to three named, otherwise a count);
// Taken and approved stays by leave type; the pop-up grows to 560px. Anchored; aborts on a miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const s = t.indexOf("function ptoFOverlapSameDept("); if (s < 0) throw new Error("helpers start");
const e = t.indexOf(NL + "}" + NL, t.indexOf("function ptoFInfoPanelHTML(){")) + (NL + "}" + NL).length;
const old = t.slice(s, e); if (old.indexOf("Informational only. Approvals are handled") < 0) throw new Error("shape");
const fresh = [
  "function ptoFSameDeptOut(w,pk,dept,fe){var out=[],seen={};ptoFFlat(w).forEach(function(o){if(o.personKey===pk||o.dept!==dept||!ptoFRangesOverlap(fe,o)||seen[o.personKey])return;seen[o.personKey]=1;out.push({person:o.person,type:o.type,dates:ptoFDates(o),status:ptoFEffState(w,o)});});return out;}",
  "function ptoFInfoTypes(by){var rows=PTOF_LEAVE_TYPES.filter(function(o){return (by[o.key]||0)>0;});if(!rows.length)return '<div class=\"ptof-info-empty\">None</div>';return rows.map(function(o){var n=by[o.key];return '<div class=\"ptof-info-typ\"><span class=\"ptof-info-typ-nm\">'+o.key+'</span><span class=\"ptof-info-typ-n\">'+n+(n===1?\" day\":\" days\")+'</span></div>';}).join(\"\");}",
  "/* one pending entry: its dates, type and state, then the same-department coverage on those dates (named up to three, otherwise a count) */",
  "function ptoFInfoPendingRow(w,pk,dept,fe){",
  "  var n=ptoFEntryDays(fe),others=ptoFSameDeptOut(w,pk,dept,fe),st=ptoFEffState(w,fe);",
  "  var head='<div class=\"ptof-info-typ ptof-info-pend\"><span class=\"ptof-info-typ-nm\"><strong>'+ptoFDates(fe)+'</strong> &middot; '+fe.type+'</span><span class=\"ptof-info-typ-n\">'+n+(n===1?\" day\":\" days\")+' &middot; '+st+'</span></div>';",
  "  var conf;",
  "  if(!others.length)conf='<div class=\"ptof-info-conf ok\">'+ICON(\"check_circle\")+'No one else from '+dept+' is out on these dates</div>';",
  "  else if(others.length>3)conf='<div class=\"ptof-info-conf warn\">'+ICON(\"groups\")+others.length+' others from '+dept+' are out on these dates</div>';",
  "  else conf='<div class=\"ptof-info-conf warn\">'+ICON(\"groups\")+'Also out from '+dept+': '+others.map(function(o){return o.person+' ('+o.dates+', '+o.type+', '+o.status+')';}).join(\"; \")+'</div>';",
  "  return head+conf;",
  "}",
  "function ptoFInfoPanelHTML(){",
  "  var st=PTOF_INFO;if(!st)return \"\";",
  "  var w=find(st.id);if(!w)return \"\";",
  "  var pk=st.pk;var nm=ptoFPersonName(pk);var meta=ptoFPersonMeta(w,pk);",
  "  var pending=ptoFFlat(w).filter(function(fe){return fe.personKey===pk&&ptoFEff(w,fe)!==\"Approved\";}).sort(function(a,b){return (a.year-b.year)||(a.mo-b.mo)||(a.d-b.d);});",
  "  var pendDays=pending.reduce(function(a,fe){return a+ptoFEntryDays(fe);},0);",
  "  var appr=ptoFPersonDaysByState(w,pk,true);",
  "  var days=function(n){return n+(n===1?\" day\":\" days\");};",
  "  var pendHtml=pending.length?pending.map(function(fe){return ptoFInfoPendingRow(w,pk,meta.dept,fe);}).join(\"\"):'<div class=\"ptof-info-empty\">Nothing is waiting on approval.</div>';",
  "  return '<div class=\"modal-backdrop\" data-pto=\"pto-ovl-close\"><div class=\"modal ptof-ovl\" data-pto=\"stop\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Time off detail for '+ptoFEsc(nm+\", \"+meta.dept+\", \"+meta.pg)+'\">'+",
  "    '<div class=\"modal-h\"><div class=\"ptof-info-hd-main\"><span class=\"modal-title\">'+nm+'</span><span class=\"ptof-info-hd-sub\">'+meta.dept+' &middot; '+meta.pg+'</span></div><button class=\"iconbtn\" data-pto=\"pto-ovl-close\" aria-label=\"Close detail\">'+ICON(\"close\")+'</button></div>'+",
  "    '<div class=\"modal-b ptof-ovl-b\">'+",
  "      '<div class=\"ptof-info-cap\">Pending approval, '+days(pendDays)+'</div>'+pendHtml+",
  "      '<div class=\"ptof-info-cap ptof-info-cap2\">Taken and approved, '+days(appr.tot)+' this year ('+PTOF_WORK_Y+')</div>'+ptoFInfoTypes(appr.by)+",
  "    '</div></div></div>';",
  "}", ""].join(NL);
t = t.slice(0, s) + fresh + t.slice(e);
const code = t.replace(/\/\*[\s\S]*?\*\//g, "");
if (/(?<![\w$.])ptoFOverlapSameDept\s*\(/.test(code)) throw new Error("old helper still referenced");
/* CSS */
const cssRep = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("css anchor: " + label); t = t.replace(a, b); console.log("css: " + label); };
cssRep("  .ptof-ovl{max-width:390px;display:flex;flex-direction:column;max-height:calc(100vh - 40px);}", "  .ptof-ovl{max-width:560px;display:flex;flex-direction:column;max-height:calc(100vh - 40px);}", "pop-up width");
cssRep("  .ptof-ovl-b{display:block;overflow:auto;padding:0 18px 6px;flex:1 1 auto;min-height:0;}", "  .ptof-ovl-b{display:block;overflow:auto;padding:0 18px 16px;flex:1 1 auto;min-height:0;}", "body padding (no footer)");
/* the .ptof-ovl-f rule stays: the day-detail overlay still has a footer */
cssRep("  .ptof-root{--ptof-st-appr:#2e7d32;--ptof-st-pend:#c77d00;--ptof-st-out:var(--red-100);}", "  .ptof-root,.ptof-ovl{--ptof-st-appr:#2e7d32;--ptof-st-pend:#c77d00;--ptof-st-out:var(--red-100);}", "status tokens reach the overlay");
cssRep("  .ptof-info-empty{font-size:12px;color:var(--txt-subtle);padding:8px 0;}",
  "  .ptof-info-empty{font-size:12px;color:var(--txt-subtle);padding:8px 0;}" + NL +
  "  .ptof-info-pend{border-bottom:none;padding-bottom:2px;}" + NL +
  "  .ptof-info-conf{display:flex;align-items:flex-start;gap:6px;font-size:11.5px;line-height:1.4;padding:0 0 8px 2px;margin-bottom:4px;border-bottom:1px solid var(--wn-200);color:var(--txt-subtle);}" + NL +
  "  .ptof-info-conf .material-symbols-rounded{font-size:15px;flex:0 0 auto;margin-top:1px;}" + NL +
  "  .ptof-info-conf.ok .material-symbols-rounded{color:var(--ptof-st-appr);}" + NL +
  "  .ptof-info-conf.warn{color:var(--txt-secondary);}" + NL +
  "  .ptof-info-conf.warn .material-symbols-rounded{color:var(--ptof-st-pend);}", "pending rows + coverage line");
/* unused .ptof-info-oth* rules go with the old list */
const before = t.split(NL).length; t = t.split(NL).filter(function (l) { return !/^\s*\.ptof-info-oth/.test(l); }).join(NL); console.log("removed " + (before - t.split(NL).length) + " .ptof-info-oth rules");
if (/ptof-info-oth/.test(t.replace(/\/\*[\s\S]*?\*\//g, ""))) throw new Error("ptof-info-oth still used");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
