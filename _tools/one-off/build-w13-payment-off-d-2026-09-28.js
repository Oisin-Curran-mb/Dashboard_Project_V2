/* One-off, 2026-09-28. Part D: defect fix found by probing the new board before writing its assertions.

   purFOpenLevel walked the path's FULL level list to find the level next to act, so a card could be
   placed in a column its own amount can never reach. PO-2891 ($3,150 on Education Ministry, held by
   Lanette at the Or level) landed in Pastor Bob's $5,000 column, which the board had at the same time
   greyed out as "Not required under $5,000" - the card and the column contradicting each other.

   The walk now runs over the APPLICABLE levels (purFSteps at the record's amount, which is what the
   legacy ApproveOrder skips by threshold, POOrderRepository.cs:1760) and only then maps the chosen
   Sequence back to its position in the full path, because the columns are the whole path. When every
   applicable level has been acted on but the request is still Pending (rejected, or held), it parks at
   the last applicable level rather than running off the end. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W13 Purchasing Management V2 JS", BEND = "/* ===== end W13 Purchasing Management V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(BEND, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };

swap('/* The level that has to act next on the request path, read straight off the acted rows so it is' + NL +
  '   defined even for a rejected or held card (purFTurn returns those kinds before it gets this far).' + NL +
  '   No acted rows gives the first level, which is also where a request that no level applies to sits. */' + NL +
  'function purFOpenLevel(po){' + NL +
  '  var p=PURF_PATHS[po.path];if(!p||!p.steps.length)return null;' + NL +
  '  var acted=po.appr||[],maxSeq=acted.length?Math.max.apply(null,acted.map(function(a){return a.seq;})):0;' + NL +
  '  for(var i=0;i<p.steps.length;i++)if(p.steps[i].seq>maxSeq)return {no:i+1,step:p.steps[i]};' + NL +
  '  return {no:p.steps.length,step:p.steps[p.steps.length-1]};' + NL +
  '}',
  '/* The level that has to act next on the request path, read straight off the acted rows so it is' + NL +
  '   defined even for a rejected or held card (purFTurn returns those kinds before it gets this far).' + NL +
  '   The walk is over the levels this AMOUNT reaches, never the raw path, so a card is never placed in a' + NL +
  '   column its own total cannot require; the chosen Sequence is then mapped back to its position in the' + NL +
  '   full path, because the columns are the whole path. A request that no level applies to sits at the' + NL +
  '   first column with its release badge, and one whose applicable levels have all been acted on but is' + NL +
  '   still Pending (rejected, or held) parks at the last applicable level. */' + NL +
  'function purFOpenLevel(po){' + NL +
  '  var p=PURF_PATHS[po.path];if(!p||!p.steps.length)return null;' + NL +
  '  var ap=purFSteps(po.path,po.amt);' + NL +
  '  var acted=po.appr||[],maxSeq=acted.length?Math.max.apply(null,acted.map(function(a){return a.seq;})):0;' + NL +
  '  var seq=null,i;' + NL +
  '  for(i=0;i<ap.length;i++)if(ap[i].seq>maxSeq){seq=ap[i].seq;break;}' + NL +
  '  if(seq===null)seq=ap.length?ap[ap.length-1].seq:p.steps[0].seq;' + NL +
  '  for(i=0;i<p.steps.length;i++)if(p.steps[i].seq===seq)return {no:i+1,step:p.steps[i]};' + NL +
  '  return {no:1,step:p.steps[0]};' + NL +
  '}', "openLevel: walk the applicable levels, then map back to the full path");

t = t.slice(0, b0) + blk + t.slice(b1);
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
