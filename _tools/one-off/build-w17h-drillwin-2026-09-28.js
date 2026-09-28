/* =====================================================================
   build-w17h-drillwin-2026-09-28.js

   The Detail drill was window-blind. gpFDonorRows paced every donor pledge
   over all time and gpFDonorRowHTML called the gift panel without the
   window, so at the This-month preset the purpose row showed the month
   while the drill underneath it showed everything ever received. The two
   levels of one widget disagreed, and the roll-up only held on the default
   preset.

   gpFDonorPace and gpFGiftPanel both already take the window and default
   it, so the fix is to thread it, not to change any arithmetic. The signature
   of gpFDonorRows does not change: it derives the window from the widget it
   was already given.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "..", "index.html");
let s = fs.readFileSync(FILE, "utf8");
const crlfBefore = s.split("\r\n").length - 1;

function swap(a, b) {
  const got = s.split(a).length - 1;
  if (got !== 1) throw new Error("anchor appeared " + got + " times: " + a.slice(0, 70));
  s = s.split(a).join(b);
}

/* (1) the donor rows pace inside the window, like the purpose row above them */
swap(
  "  var iso=gpFThru(w),asOf=gpFParse(iso);\r\n"
  + "  var arr=gpFDonorsFor(camp).map(function(pl){return {pl:pl,p:gpFDonorPace(pl,asOf,iso)};});",
  "  var win=gpFWindow(w),iso=win.end,asOf=gpFParse(iso);\r\n"
  + "  var arr=gpFDonorsFor(camp).map(function(pl){return {pl:pl,p:gpFDonorPace(pl,asOf,iso,win)};});"
);

/* (2) the row hands the window down to its gift panel */
swap("function gpFDonorRowHTML(item,w,iso){", "function gpFDonorRowHTML(item,w,iso,win){");
swap("  if(exp)row+=gpFGiftPanel(pl,iso);", "  if(exp)row+=gpFGiftPanel(pl,iso,win||{start:null,end:iso});");

/* (3) the panel that builds the rows supplies it */
swap(
  "  var iso=gpFThru(w);\r\n"
  + "  var body=rows.slice((pg-1)*GPF_PAGE_SIZE,(pg-1)*GPF_PAGE_SIZE+GPF_PAGE_SIZE).map(function(it){return gpFDonorRowHTML(it,w,iso);}).join(\"\");",
  "  var win=gpFWindow(w),iso=win.end;\r\n"
  + "  var body=rows.slice((pg-1)*GPF_PAGE_SIZE,(pg-1)*GPF_PAGE_SIZE+GPF_PAGE_SIZE).map(function(it){return gpFDonorRowHTML(it,w,iso,win);}).join(\"\");"
);

let bare = 0;
for (let i = 0; i < s.length; i++) if (s[i] === "\n" && s[i - 1] !== "\r") bare++;
if (bare) throw new Error("bare LF introduced: " + bare);
if (s.split("\r\n").length - 1 !== crlfBefore) throw new Error("line count moved");

fs.writeFileSync(FILE, s);
console.log("W17: the Detail drill now paces and lists inside the date window");
