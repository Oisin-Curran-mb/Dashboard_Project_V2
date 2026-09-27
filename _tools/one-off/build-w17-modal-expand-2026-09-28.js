/* One-off, 2026-09-28: W17 (ours) defect found while checking the owner's "OC pop up used to work" report.
   In the donors-behind-pace modal, clicking a donor row (gopen) toggled gpFPlExp and called render(), which
   redraws the widgets but not the body-mounted modal, so nothing visibly changed. Present since the 25 Sep
   shell-conformance port (the a548419 baseline has no gopen handler at all). The handler now also redraws the
   modal when it is open; the inline Summary Table drill keeps working through render(). */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html");
let t = fs.readFileSync(FILE, "utf8");
const a = "  if(a==='gopen'){if(!w)return;var gid=t.getAttribute('data-plid');w.gpFPlExp=w.gpFPlExp||{};w.gpFPlExp[gid]=!w.gpFPlExp[gid];gpFClosePop();render();return;}";
if (t.split(a).length !== 2) throw new Error("anchor");
t = t.replace(a, "  if(a==='gopen'){if(!w)return;var gid=t.getAttribute('data-plid');w.gpFPlExp=w.gpFPlExp||{};w.gpFPlExp[gid]=!w.gpFPlExp[gid];gpFClosePop();render();if(GPF_MODAL)gpFRenderModal();return;} /* the modal is body-mounted, so render() alone never redraws it (fixed 2026-09-28) */");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
