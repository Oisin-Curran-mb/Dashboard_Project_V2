"use strict";
/* dump-cards: the identity gate for the data package work (16 Oct 2026).

   Hosts the shell in Node exactly as the whole-shell drivers do, then for each
   data-state option sets location.hash, applies the option the way the live
   shell does (dsApply while it exists, nothing afterwards: the package builders
   read the hash themselves), and records contentHTML(w) for every registry row
   of every dashboard plus the Financial KPI band.

     node _tools/one-off/dump-cards-2026-10-16.js out.json
     node _tools/one-off/dump-cards-2026-10-16.js --compare a.json b.json [option ...]

   compare prints, per option, either "identical (N cards)" or the first card
   that differs with the byte offset and a short window of both strings. With
   option names after the two files, only those options are compared. */
const fs = require("fs"), path = require("path");
const H = require(path.join(__dirname, "..", "jo-port-driver.js"));
const OPTIONS = ["default", "none", "notconfigured", "small", "extreme"];

function dump() {
  const shell = H.loadShell();
  const S = shell.script;
  const EXPORTS = "\r\n  __EX={contentHTML:contentHTML,dashboards:dashboards,find:find,WIDGETS:WIDGETS," +
    "dsApply:(typeof dsApply===\"function\")?dsApply:null,fkpBandHTML:(typeof fkpBandHTML===\"function\")?fkpBandHTML:null," +
    "stubRender:function(){render=function(){};renderModal=function(){};renderOverlay=function(){};showModal=function(){};setStatus=function(){};}};\r\n" +
    "  try{render();}catch(e){__EX.renderErr=String(e&&e.message);}\r\n})();\r\n";
  const env = H.runBlock(S.slice(0, -H.TAIL.length) + EXPORTS, { dataAttr: "data-action", globals: H.NODE_GLOBALS() });
  const EX = env.ctx.__EX;
  if (!EX || !EX.contentHTML) throw new Error("shell did not load" + (EX && EX.renderErr ? ": " + EX.renderErr : ""));
  EX.stubRender();
  const out = {};
  OPTIONS.forEach(function (opt) {
    env.ctx.location.hash = opt === "default" ? "" : "#ds=" + opt;
    const cards = {};
    EX.dashboards.forEach(function (d) {
      if (EX.dsApply) EX.dsApply(d.widgets);
      d.widgets.forEach(function (w) {
        let html;
        try { html = EX.contentHTML(w); } catch (e) { html = "!!THROW " + String(e && e.message); }
        cards[d.id + ":" + w.id] = html;
      });
    });
    if (EX.fkpBandHTML) { try { cards["band"] = EX.fkpBandHTML(); } catch (e) { cards["band"] = "!!THROW " + String(e && e.message); } }
    out[opt] = cards;
  });
  return out;
}

function compare(aPath, bPath, only) {
  const a = JSON.parse(fs.readFileSync(aPath, "utf8")), b = JSON.parse(fs.readFileSync(bPath, "utf8"));
  let bad = 0;
  OPTIONS.filter(function (o) { return !only.length || only.indexOf(o) > -1; }).forEach(function (opt) {
    const ca = a[opt] || {}, cb = b[opt] || {};
    const keys = Object.keys(ca).concat(Object.keys(cb).filter(function (k) { return !(k in ca); }));
    const diffs = keys.filter(function (k) { return ca[k] !== cb[k]; });
    if (!diffs.length) { console.log(opt.padEnd(14), "identical (" + keys.length + " cards)"); return; }
    bad += diffs.length;
    console.log(opt.padEnd(14), diffs.length + " of " + keys.length + " cards differ: " + diffs.slice(0, 12).join(" ") + (diffs.length > 12 ? " ..." : ""));
    const k = diffs[0], x = String(ca[k] || ""), y = String(cb[k] || "");
    let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++;
    console.log("   first:", k, "at byte", i);
    console.log("   a:", JSON.stringify(x.slice(Math.max(0, i - 60), i + 120)));
    console.log("   b:", JSON.stringify(y.slice(Math.max(0, i - 60), i + 120)));
  });
  return bad;
}

const argv = process.argv.slice(2);
if (argv[0] === "--compare") {
  const bad = compare(argv[1], argv[2], argv.slice(3));
  process.exit(bad ? 1 : 0);
} else {
  const outPath = argv[0];
  if (!outPath) { console.error("usage: dump-cards out.json | --compare a.json b.json [option ...]"); process.exit(2); }
  const res = dump();
  fs.writeFileSync(outPath, JSON.stringify(res));
  const n = Object.keys(res.default || {}).length;
  const throws = [];
  OPTIONS.forEach(function (o) { Object.keys(res[o] || {}).forEach(function (k) { if (String(res[o][k]).indexOf("!!THROW") === 0) throws.push(o + ":" + k + " " + res[o][k].slice(8, 90)); }); });
  console.log("dumped", n, "cards x", OPTIONS.length, "options ->", outPath, throws.length ? ("\nTHROWS:\n  " + throws.join("\n  ")) : "(no throws)");
}
