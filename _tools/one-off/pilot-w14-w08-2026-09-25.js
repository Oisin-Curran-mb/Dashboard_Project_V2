/* One-off, 2026-09-25 (decisions D8, D9, D11):
     A. add the WIDGETS registration object to the shell and hook the six
        dispatch points (contentHTML, aboutOf, popContent, triggerSelector,
        renderModal, click + input listeners)
     B. delete the W08 clone (kind mystatus-oc): CSS, data, JS, hook lines,
        cmp note and cmp row
     C. W14 Main Content Tasks -> one self-contained block, registered
     D. W08 My Status (Jo's, the keeper) -> one self-contained block, registered
   Every edit is anchored on exact text. If any anchor is missing or ambiguous
   the script aborts before writing. CRLF preserved. */
"use strict";
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
const NL = "\r\n";
let text = fs.readFileSync(FILE, "utf8");
const log = [];

function once(needle, label) {
  const i = text.indexOf(needle);
  if (i < 0) throw new Error("anchor not found: " + (label || needle.slice(0, 80)));
  if (text.indexOf(needle, i + 1) > -1) throw new Error("anchor not unique: " + (label || needle.slice(0, 80)));
  return i;
}
function replaceOnce(needle, repl, label) { once(needle, label); text = text.replace(needle, repl); log.push("replaced: " + (label || needle.slice(0, 60))); }
function removeLineContaining(needle, label) {
  const i = once(needle, label);
  const s = text.lastIndexOf(NL, i) + NL.length, e = text.indexOf(NL, i) + NL.length;
  text = text.slice(0, s) + text.slice(e);
  log.push("removed line: " + (label || needle.slice(0, 60)));
}
function removeSubstring(re, label) {
  const m = text.match(re);
  if (!m) throw new Error("substring not found: " + label);
  if (text.match(new RegExp(re.source, "g")).length !== 1) throw new Error("substring not unique: " + label);
  text = text.replace(re, "");
  log.push("removed substring: " + label);
  return m[0];
}
/* cut the lines from the line containing `from` up to (not including) the line containing `to` */
function cutRegion(from, to, label) {
  const i = once(from, label + " start"), j = text.indexOf(to, i);
  if (j < 0) throw new Error("region end not found: " + label);
  const s = text.lastIndexOf(NL, i) + NL.length, e = text.lastIndexOf(NL, j) + NL.length;
  const cut = text.slice(s, e);
  text = text.slice(0, s) + text.slice(e);
  log.push("cut " + cut.split(NL).length + " lines: " + label);
  return cut;
}
/* take contiguous lines matching re (they must be contiguous); return them, remove from text */
function takeLines(re, expectMin, label) {
  const lines = text.split(NL), out = [], keep = [];
  let started = false, ended = false;
  lines.forEach(function (l) {
    if (re.test(l)) { if (ended) throw new Error("non-contiguous: " + label); started = true; out.push(l); }
    else { if (started) ended = true; keep.push(l); }
  });
  if (out.length < expectMin) throw new Error("expected >= " + expectMin + " lines for " + label + ", got " + out.length);
  text = keep.join(NL);
  log.push("took " + out.length + " lines: " + label);
  return out;
}
function insertBeforeLineContaining(needle, block, label) {
  const i = once(needle, label);
  const s = text.lastIndexOf(NL, i) + NL.length;
  text = text.slice(0, s) + block + NL + text.slice(s);
  log.push("inserted before: " + (label || needle.slice(0, 60)));
}
function insertAfterLineContaining(needle, block, label) {
  const i = once(needle, label);
  const e = text.indexOf(NL, i) + NL.length;
  text = text.slice(0, e) + block + NL + text.slice(e);
  log.push("inserted after: " + (label || needle.slice(0, 60)));
}
const toHandler = function (lines) { return lines.map(function (l) { return l.replace(/return;\}\s*(\/\/.*)?$/, "return true;}"); }); };

/* ================= A. registration plumbing ================= */
const WIDGETS_BLOCK = [
  "  /* ===== Shell: widget registration =====",
  "     Each widget block registers itself once. The shell's dispatch points",
  "     (contentHTML, aboutOf, popContent, triggerSelector, renderModal, the",
  "     click and input listeners) ask WIDGETS first and fall through to the",
  "     older if-chains only for kinds that have not been registered yet.",
  "       WIDGETS.register(kind, {",
  "         content(w)        card body for the widget's current size (required)",
  "         about(w)          {h,b} for the info popover",
  "         click(a,id,t,e)   its own data-action values; return true when handled",
  "         input(e)          its own input events; return true when handled",
  "         pops:   {type: {content(), trigger()}}   popover types it owns",
  "         modals: {type: html()}                    modal types it owns",
  "       }) */",
  "  var WIDGETS={kinds:{},pops:{},modals:{},clicks:[],inputs:[],",
  "    register:function(kind,h){this.kinds[kind]=h;var k;for(k in (h.pops||{}))this.pops[k]=h.pops[k];for(k in (h.modals||{}))this.modals[k]=h.modals[k];if(h.click)this.clicks.push(h.click);if(h.input)this.inputs.push(h.input);},",
  "    content:function(w){var h=this.kinds[w.kind];return h&&h.content?h.content(w):null;},",
  "    about:function(w){var h=this.kinds[w.kind];return h&&h.about?h.about(w):null;},",
  "    click:function(a,id,t,e){for(var i=0;i<this.clicks.length;i++)if(this.clicks[i](a,id,t,e))return true;return false;},",
  "    input:function(e){for(var i=0;i<this.inputs.length;i++)if(this.inputs[i](e))return true;return false;},",
  "    pop:function(){var p=pop&&this.pops[pop.type];return p&&p.content?p.content():null;},",
  "    trigger:function(){var p=pop&&this.pops[pop.type];return p&&p.trigger?p.trigger():null;},",
  "    modal:function(){var m=modal&&this.modals[modal.type];return m?m():null;}};"
].join(NL);
insertAfterLineContaining("  var manage=false,pop=null,renaming=null,dragId=null,", WIDGETS_BLOCK, "WIDGETS block after shell state vars");
insertAfterLineContaining('if(w.state==="error"){var xc=ERROR_COPY[w.kind]||ERROR_COPY.deposits;', "    var wreg=WIDGETS.content(w);if(wreg!==null)return wreg;", "contentHTML hook");
replaceOnce("function aboutOf(w){", "function aboutOf(w){var wa=WIDGETS.about(w);if(wa)return wa;", "aboutOf hook");
replaceOnce("  function popContent(){" + NL + '    if(!pop)return "";', "  function popContent(){" + NL + '    if(!pop)return "";' + NL + "    var wp=WIDGETS.pop();if(wp!==null)return wp;", "popContent hook");
replaceOnce("function triggerSelector(){if(!pop)return null;", "function triggerSelector(){if(!pop)return null;var wt=WIDGETS.trigger();if(wt)return wt;", "triggerSelector hook");
insertAfterLineContaining("    bgtLockBg(true);", "    var wm=WIDGETS.modal();if(wm!==null){mr.innerHTML=wm;modalMounted=true;return;}", "renderModal hook");
insertAfterLineContaining('    var a=t.getAttribute("data-action"),id=t.getAttribute("data-id");' + NL + '    if(a==="noop")', "    if(WIDGETS.click(a,id,t,e))return;", "click hook");
replaceOnce("if(mysOHandleInput(e))return;", "if(WIDGETS.input(e))return;", "input hook (replaces the W08 clone hook)");

/* ================= B. delete the W08 clone ================= */
cutRegion("/* ===== W08 My Status V2 CSS ===== */", "/* ===== W18 Financial KPI V2 =====", "W08 clone CSS");
cutRegion("/* ===== W08 My Status V2 data ===== */", "  /* ===== P2/P3 WIDGET BLOCKS", "W08 clone data");
cutRegion('/* ===== W08 My Status V2 JS, kind:"mystatus-oc" ===== */', "/* ===== end W08 My Status V2 ===== */", "W08 clone JS");
removeLineContaining("/* ===== end W08 My Status V2 ===== */", "W08 clone end banner");
removeLineContaining('if(w.kind==="mystatus-oc")return mysOContent(w);', "clone contentHTML line");
removeLineContaining('if(pop.type==="myso-opts")return mysOPopContent();', "clone popContent line");
removeSubstring(/if\(pop\.type==="myso-opts"\)return '\[data-action="myso-opts"\]\[data-id="'\+pop\.id\+'"\]';/, "clone triggerSelector branch");
removeLineContaining('if(modal.type==="mysOconfig")', "clone modal config line");
removeLineContaining('if(modal.type==="mysOdetail")', "clone modal detail line");
removeLineContaining('a.indexOf("myso-")===0&&mysOHandleClick(a,id,t)', "clone click hook line");
cutRegion("    W08:{h:\"Ours is a straight DUPLICATE", "  };" + NL + "  /* number, display name, HER kind + her state, OUR kind + our state */", "CMPNOTE_ W08 entry");
(function () {
  const re = /\r\n[ \t]*,\r\n([ \t]*\};\r\n[ \t]*\/\* number, display name)/;
  if (!re.test(text)) throw new Error("CMPNOTE_ dangling comma not found");
  text = text.replace(re, "\r\n$1");
  log.push("removed: CMPNOTE_ dangling comma");
})();
removeLineContaining('["W08","My Status","mystatus",', "CMP_ROWS W08 row");

/* ================= C. W14 Main Content Tasks ================= */
replaceOnce("/* ===== Main Content Tasks (mct): context-aware launcher ===== */", "/* ===== W14 Main Content Tasks V2 CSS ===== */", "W14 CSS banner");
removeLineContaining("  .mct-filterrow{display:flex;}", "stray .mct-filterrow rule");
insertBeforeLineContaining("  /* ===== My Status (mys) ===== */", "  .mct-filterrow{display:flex;}" + NL + "/* ===== end W14 Main Content Tasks V2 CSS ===== */", "W14 CSS end banner");
replaceOnce("/* ===== Main Content Tasks (mct): context-aware quick-action launcher ===== */", "/* ===== W14 Main Content Tasks V2 =====" + NL + "   Context-aware quick-action launcher: recent, saved and standard tasks per accounting application, with search. ===== */", "W14 JS banner");
removeLineContaining('if(w.kind==="tasks")return mctContent(w);', "W14 contentHTML line");
const mctPop = cutRegion('    if(pop.type==="mct-appfilter"){var wf=find(pop.id),cf=mctFilter(wf);', '    if(pop.type==="pur-status"||pop.type==="pur-path")return purPopContent();', "W14 popContent block").split(NL).filter(function (l) { return l.trim() !== ""; });
if (!/\.join\(""\);\}$/.test(mctPop[mctPop.length - 1])) throw new Error("W14 pop block shape unexpected");
mctPop[0] = mctPop[0].replace('    if(pop.type==="mct-appfilter"){', "  function mctPopContent(){");
const mctClick = toHandler(takeLines(/^\s*if\(a==="mct-/, 6, "W14 click branches"));
removeSubstring(/if\(pop\.type==="mct-appfilter"\)return '\[data-action="mct-appfilter"\]\[data-id="'\+pop\.id\+'"\]';/, "W14 triggerSelector branch");
const mctInput = removeSubstring(/if\(e\.target\.id&&e\.target\.id\.indexOf\("mctq-"\)===0\)\{.*?catch\(_mc\)\{\}\}return;\}/, "W14 input segment").replace(/return;\}$/, "return true;}");
const W14_TAIL = [
  "",
  "  /* Popover content for the application filter (pop.type \"mct-appfilter\") */"
].concat(mctPop).concat([
  "  /* Click actions: mct-appfilter, mct-set-filter, mct-clearq, mct-open, mct-save, mct-unsave */",
  "  function mctHandleClick(a,id,t){"
]).concat(mctClick).concat([
  "    return false;",
  "  }",
  "  /* The search box (input id \"mctq-<widget id>\") re-renders with the caret kept in place */",
  "  function mctHandleInput(e){" + mctInput + "return false;}",
  '  WIDGETS.register("tasks",{content:mctContent,click:mctHandleClick,input:mctHandleInput,pops:{"mct-appfilter":{content:mctPopContent,trigger:function(){return \'[data-action="mct-appfilter"][data-id="\'+pop.id+\'"]\';}}}});',
  "/* ===== end W14 Main Content Tasks V2 ===== */"
]).join(NL);
insertAfterLineContaining("  function mctContent(w){if(w.size===\"kpi\")return mctGlance(w);", W14_TAIL, "W14 handlers + register + end banner");
insertBeforeLineContaining('{id:"mct", title:"Main Content Tasks", kind:"tasks"', "      /* W14 Main Content Tasks */", "W14 registry label");

/* ================= D. W08 My Status (Jo's) ================= */
replaceOnce("  /* ===== My Status (mys) ===== */", "/* ===== W08 My Status V2 CSS ===== */", "W08 CSS banner");
insertBeforeLineContaining("  /* ===== Bank Balances (prefix: bank): CSS ===== */", "/* ===== end W08 My Status V2 CSS ===== */", "W08 CSS end banner");
const mysData = cutRegion("/* === MY STATUS (mys) data === */", "  /* ===== P2/P3 WIDGET BLOCKS", "W08 data block (moved next to its render code)").replace(/(\r\n)+$/, "");
const mysDataLines = mysData.split(NL);
mysDataLines[0] = "  /* Data: query catalogue, areas, urgency labels and the default selection */";
removeLineContaining('if(w.kind==="mystatus")return mysContent(w);', "W08 contentHTML line");
removeLineContaining('if(pop.type==="mys-opts")return mysPopContent();', "W08 popContent line");
removeSubstring(/if\(pop\.type==="mys-opts"\)return '\[data-action="mys-opts"\]\[data-id="'\+pop\.id\+'"\]';/, "W08 triggerSelector branch");
removeLineContaining('if(modal.type==="mysconfig"){mr.innerHTML=mysConfigModalHTML();return;}', "W08 modal config line");
removeLineContaining('if(modal.type==="mysdetail"){mr.innerHTML=mysDetailModalHTML();return;}', "W08 modal detail line");
const mysClick = toHandler(takeLines(/^\s*if\(a==="mys-/, 11, "W08 click branches"));
const mysInput = removeSubstring(/if\(e\.target\.id==="mysConfigQ"\)\{.*?catch\(_mq\)\{\}\}return;\}/, "W08 input segment").replace(/return;\}$/, "return true;}");
replaceOnce("  /* === MY STATUS (mys) render === */", ["/* ===== W08 My Status V2 =====", "   Configurable list of system queries (unposted items, approvals, HR reviews) with counts, a config modal and a records modal. ===== */"].concat(mysDataLines).join(NL), "W08 JS banner + moved data");
const W08_TAIL = [
  "  /* Click actions: mys-config, mys-add, mys-remove, mys-config-done, mys-config-cancel, mys-row, mys-detail-close, mys-detail-export, mys-mode, mys-opts, mys-hidezero */",
  "  function mysHandleClick(a,id,t){"
].concat(mysClick).concat([
  "    return false;",
  "  }",
  "  /* The config modal's search box (input id \"mysConfigQ\") */",
  "  function mysHandleInput(e){" + mysInput + "return false;}",
  '  WIDGETS.register("mystatus",{content:mysContent,click:mysHandleClick,input:mysHandleInput,pops:{"mys-opts":{content:mysPopContent,trigger:function(){return \'[data-action="mys-opts"][data-id="\'+pop.id+\'"]\';}}},modals:{mysconfig:mysConfigModalHTML,mysdetail:mysDetailModalHTML}});',
  "/* ===== end W08 My Status V2 ===== */"
]).join(NL);
insertBeforeLineContaining("/* ===== Bank Balances (prefix: bank), RENDER ===== */", W08_TAIL, "W08 handlers + register + end banner");
insertBeforeLineContaining('{id:"mys",title:"My Status",kind:"mystatus"', "      /* W08 My Status */", "W08 registry label");

/* ================= write ================= */
if ((text.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF introduced");
fs.writeFileSync(FILE, text, "utf8");
log.forEach(function (l) { console.log("  " + l); });
console.log("done: " + text.split(NL).length + " lines");
