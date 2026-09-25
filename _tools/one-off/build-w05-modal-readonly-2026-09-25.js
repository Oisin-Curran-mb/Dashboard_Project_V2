// One-off, 2026-09-25, owner ruling after the W05 browser review: the drill pop-up shows
// information only. Remove the per-row checkbox, the Confirm button and its "Move to unposted
// transactions" note, and the drawer's Open invoice / Record a follow-up actions, with their
// handlers, state and CSS. Anchored; aborts before writing on any miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const once = function (n, label) { const i = t.indexOf(n); if (i < 0 || t.indexOf(n, i + 1) > -1) throw new Error("anchor: " + (label || n.slice(0, 70))); return i; };
const lineStart = function (i) { return t.lastIndexOf(NL, i - 1) + NL.length; }, lineEnd = function (i) { return t.indexOf(NL, i) + NL.length; };
function cutLines(fromNeedle, toNeedle, label) { const s = lineStart(once(fromNeedle, label + " start")); const e = lineEnd(t.indexOf(toNeedle, s)); if (e <= s) throw new Error(label + " end"); t = t.slice(0, s) + t.slice(e); console.log("cut: " + label); }
function removeLine(n, label) { const i = once(n, label); t = t.slice(0, lineStart(i)) + t.slice(lineEnd(i)); console.log("removed line: " + label); }
function swap(a, b, label) { once(a, label); t = t.replace(a, b); console.log("edited: " + label); }

/* drawer: tabs only, no actions */
cutLines("function arODrawerActions(w,x){", "Record a follow-up</button></div>';" + NL + "}", "arODrawerActions");
swap("row+='<div class=\"arO-drawer\">'+arODetailTabs(x)+arODrawerActions(w,x)+'</div>';", "row+='<div class=\"arO-drawer\">'+arODetailTabs(x)+'</div>';", "drawer call");
/* rows: no checkbox; header first cell goes with it */
swap('<div class="wt-row wt-head arO-dhead"><span class="arO-check" aria-hidden="true"></span><span class="arO-dexp"></span>', '<div class="wt-row wt-head arO-dhead"><span class="arO-dexp"></span>', "header check cell");
removeLine("      var checked=!!(modal.sel&&modal.sel[x.inv]);", "checked var");
cutLines("      /* ENHANCEMENT (owner-specified, dev-intent signal): per-row select checkbox", "No select-all header checkbox. */", "checkbox comment");
removeLine('\'<button type="button" class="arO-check\'+(checked?" on":"")+\'" data-action="arO-check"', "checkbox button");
/* footer: Close only */
cutLines("  /* ENHANCEMENT (owner-specified, dev-intent signal, NOT a finished workflow or final copy): a Confirm", '"N invoices / total" footer stay exactly as Jo has them. */', "confirm comment");
removeLine("  var selCount=modal.sel?Object.keys(modal.sel).length:0;", "selCount");
cutLines("  var confirmNote=modal.confirmed", ":'<span class=\"arO-f-spacer\"></span>';", "confirmNote");
swap('\'<div class="modal-f arO-modal-f">\'+confirmNote+\'<div class="arO-f-btns"><button class="btn outlined sm" data-action="arO-confirm" data-id="\'+w.id+\'">Confirm</button><button class="btn primary sm" data-action="arO-detail-close">Close</button></div></div>', '\'<div class="modal-f"><button class="btn primary sm" data-action="arO-detail-close">Close</button></div>', "footer");
/* handlers + state */
swap('tab:"details",exp:null,sel:{},confirmed:false};', 'tab:"details",exp:null};', "open handler state");
cutLines("  /* ENHANCEMENT (dev-intent): toggle one row's selection (modal-scoped set on modal.sel). Re-renders", "never triggers the row's arO-exp drill. */", "check handler comment");
removeLine('if(a==="arO-check"){if(modal){var civ=t.getAttribute("data-inv");', "check handler");
removeLine('if(a==="arO-confirm"){if(modal)modal.confirmed=true;render();return true;}', "confirm handler");
removeLine('if(a==="arO-open-invoice"){setStatus("Opening invoice "', "open-invoice handler");
removeLine('if(a==="arO-followup"){setStatus("Follow-up noted for invoice "', "follow-up handler");
/* CSS */
cutLines("/* Collection next-step actions in the expanded drawer */", ".arO-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}", "actions CSS");
cutLines("  .arO-dhead .arO-check{visibility:hidden;border:0;background:transparent;}", ".arO-confirm-sub{font-size:11px;color:var(--txt-subtle);}", "check/confirm CSS");

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
const code = t.replace(/\/\*[\s\S]*?\*\//g, "");
["arO-check", "arO-confirm", "arO-followup", "arO-open-invoice", "arODrawerActions", "modal.sel", "modal.confirmed", "arO-f-btns", "arO-f-spacer", "arO-modal-f", "arO-actions"].forEach(function (n) { if (code.indexOf(n) > -1) throw new Error("leftover: " + n); });
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
// Same day: cutLines() stopped at the end of the needle's first line, so the closing "}" of
// arODrawerActions survived; removed by hand straight after.
