/* One-off, 2026-09-27, owner: "I am seeing more than 3 sizes ... i only wanted mine". The three W13 state
   fixtures from the side-by-side review era (purF2 PO Table, purF3 Pending only, purF4 empty dataset) leave the
   demo dashboard list. Glance (purF_k), Explore (purF) and Detail (purF_x) remain. Nothing else referenced them. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const L = t.split(NL), keep = [], gone = [];
L.forEach(function (l) { if (/^\s*,\{id:"purF[234]",\s*title:"Purchasing Management",\s*kind:"purchasing",/.test(l)) gone.push(l); else keep.push(l); });
if (gone.length !== 3) throw new Error("expected 3 fixture rows, found " + gone.length);
t = keep.join(NL);
if (/id:"purF[234]"/.test(t)) throw new Error("fixture ids survive");
if ((t.match(/id:"purF(_k|_x)?",/g) || []).length !== 3) throw new Error("expected the three size rows to remain");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("removed 3 fixture rows; done: " + t.split(NL).length + " lines");
