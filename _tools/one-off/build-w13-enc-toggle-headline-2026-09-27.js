/* One-off, 2026-09-27, owner (screenshot): "move the chart and table a bit higher so that it more line with
   total figure". At Explore the Encumbrances view's Chart / Table sub-toggle moves from its own line above the
   chart into the right cell of the headline row, level with "$X encumbered, not yet paid" (the cell the legend
   icon uses in the other views; the legend is hidden in this view). Detail is unchanged (chart and table side
   by side, no sub-toggle). */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const swap = function (a, b, label) { if (t.split(a).length !== 2) throw new Error("anchor x" + (t.split(a).length - 1) + ": " + label); t = t.replace(a, b); console.log("edited: " + label); };
swap("  var tog='<div class=\"purf-enc-sub\"><div class=\"vtoggle\" role=\"group\" aria-label=\"Encumbrance display\">'+[[\"chart\",\"Chart\",\"bar_chart\"],[\"table\",\"Table\",\"table_rows\"]].map(function(o){return '<button class=\"vt'+(v===o[0]?\" on\":\"\")+'\" data-purf=\"enc-view\" data-id=\"'+w.id+'\" data-v=\"'+o[0]+'\" aria-pressed=\"'+(v===o[0])+'\">'+purFIcon(o[2])+o[1]+'</button>';}).join(\"\")+'</div></div>';" + NL +
     "  return '<div class=\"purf-enc\">'+tog+((v===\"table\")?purFEncTable(w):purFEncChart(w))+'</div>';",
     "  return '<div class=\"purf-enc\">'+((v===\"table\")?purFEncTable(w):purFEncChart(w))+'</div>';", "enc view: sub-toggle leaves the body");
swap("function purFEncView(w){",
     "/* Explore's Chart / Table sub-toggle sits on the headline row, level with the encumbered total (owner, 27 Sep). */" + NL +
     "function purFEncSubToggle(w){var v=purFEncViewCur(w);return '<div class=\"vtoggle purf-enc-sub\" role=\"group\" aria-label=\"Encumbrance display\">'+[[\"chart\",\"Chart\",\"bar_chart\"],[\"table\",\"Table\",\"table_rows\"]].map(function(o){return '<button class=\"vt'+(v===o[0]?\" on\":\"\")+'\" data-purf=\"enc-view\" data-id=\"'+w.id+'\" data-v=\"'+o[0]+'\" aria-pressed=\"'+(v===o[0])+'\">'+purFIcon(o[2])+o[1]+'</button>';}).join(\"\")+'</div>';}" + NL +
     "function purFEncView(w){", "sub-toggle helper");
swap("    '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div>'+lg+'</div>'+",
     "    '<div class=\"dep-hd-num\"><div class=\"purf-numwrap\">'+kpi+ctx+'</div>'+((view===\"enc\"&&tier===\"wide\")?purFEncSubToggle(w):lg)+'</div>'+", "header: sub-toggle in the headline row at Explore");
swap("  .purf-root .purf-enc-sub{display:flex;justify-content:flex-end;padding:2px 14px 6px;}",
     "  .purf-root .purf-enc-sub{justify-self:end;align-self:start;}", "CSS: sub-toggle as the headline row's right cell");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
