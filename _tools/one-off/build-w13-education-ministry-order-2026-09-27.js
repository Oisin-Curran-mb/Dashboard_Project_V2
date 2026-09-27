/* One-off, 2026-09-27: the owner's Education Ministry screenshot lists the Or level as "Then Lanette Stewart /
   Or Jim AndersonAndMoreLetters"; the demo path had them the other way round. Data order only. */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const a = '{seq:2,users:["Jim AndersonAndMoreLetters","Lanette Stewart"],mins:[2000,2000]}';
if (t.split(a).length !== 2) throw new Error("anchor");
t = t.replace(a, '{seq:2,users:["Lanette Stewart","Jim AndersonAndMoreLetters"],mins:[2000,2000]}');
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
