// One-off, 2026-09-26, owner ruling (docs/decisions/W11.md item 6): the icon-only download button goes;
// export lives in the card's three-dot menu with the standard export set every other widget carries
// (Export as CSV / Excel / PDF). Anchored; aborts before writing on any miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "/* ===== W11 Fixed Asset Values V2 ===== */", B1 = "/* ===== end W11 Fixed Asset Values V2 ===== */";
const b0 = t.indexOf(B0, t.indexOf("<script>")), b1 = t.indexOf(B1, b0); if (b0 < 0 || b1 < 0) throw new Error("block");
let blk = t.slice(b0, b1);
const swap = function (a, b, label) { if (blk.split(a).length !== 2) throw new Error("anchor x" + (blk.split(a).length - 1) + ": " + label); blk = blk.replace(a, b); console.log("edited: " + label); };
/* the button and its two callers */
const fS = blk.indexOf("function faFDownloadBtn(w){"); const fE = blk.indexOf(NL + "}" + NL, fS) + (NL + "}" + NL).length; if (fS < 0) throw new Error("fn"); blk = blk.slice(0, fS) + blk.slice(fE); console.log("removed: faFDownloadBtn");
swap("+faFViewToggle(w)+faFDownloadBtn(w)+'</div></div></div>';", "+faFViewToggle(w)+'</div></div></div>';", "header caller");
swap("'<span class=\"faf-modal-acts\">'+faFDownloadBtn(w)+", "'<span class=\"faf-modal-acts\">'+", "modal caller");
/* the handler */
const hS = blk.indexOf("  if(a==='download'){"); const hE = blk.indexOf(NL + "  }" + NL, hS) + (NL + "  }" + NL).length; if (hS < 0) throw new Error("handler"); blk = blk.slice(0, hS) + blk.slice(hE); console.log("removed: download handler");
swap("/* The full unshortened figure: what every title and aria-label carries, and what" + NL + "   the download would carry. */", "/* The full unshortened figure: what every title and aria-label carries. */", "comment");
t = t.slice(0, b0) + blk + t.slice(b1);
/* CSS */
const cssLine = "  .faf-root .faf-dl{flex:0 0 auto;}" + NL; if (t.split(cssLine).length !== 2) throw new Error("css"); t = t.replace(cssLine, ""); console.log("css: .faf-dl rule removed");
/* the three live rows get the standard export set */
const ACTIONS = ',actions:[{icon:"table_view",label:"Export as CSV",fmt:"CSV"},{icon:"description",label:"Export as Excel",fmt:"Excel"},{icon:"picture_as_pdf",label:"Export as PDF",fmt:"PDF"}]';
let n = 0; t = t.split(NL).map(function (l) { if (/^\s*,?\{id:"faF(_k|_x)?",\s*title:"Fixed Asset Values",\s*kind:"fixedassets"/.test(l)) { if (l.indexOf("actions:[") > -1) return l; n++; return l.replace(/updated:"just now"\}/, 'updated:"just now"' + ACTIONS + "}"); } return l; }).join(NL);
if (n !== 3) throw new Error("live rows given actions: " + n); console.log("registry: 3 live rows carry the standard export actions");
const code = t.replace(/\/\*[\s\S]*?\*\//g, ""); ["faFDownloadBtn", "data-faf=\"download\"", "faf-dl", "a==='download'"].forEach(function (x) { if (code.indexOf(x) > -1) throw new Error("leftover: " + x); });
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
