"use strict";
const H = require("./jo-port-driver.js");
const shell = H.loadShell(); const S = shell.script;
const TAIL = "\r\n  render();\r\n})();\r\n";
const EXPORTS = "\r\n  __EX={contentHTML:contentHTML,dashboards:dashboards};\r\n  try{render();}catch(e){}\r\n})();\r\n";
const env = H.runBlock(S.slice(0, -TAIL.length) + EXPORTS, { globals: {
  __EX:null, Boolean:Boolean, RegExp:RegExp, Intl:Intl, Set:Set, Map:Map, Error:Error,
  encodeURIComponent:encodeURIComponent, decodeURIComponent:decodeURIComponent,
  setInterval:function(){return 1;}, clearInterval:function(){}, navigator:{userAgent:"node"},
  location:{href:"about:blank",hash:""}, alert:function(){}, performance:{now:function(){return 0;}},
  localStorage:{getItem:function(){return null;},setItem:function(){},removeItem:function(){}},
  getComputedStyle:function(){return {getPropertyValue:function(){return "";}};} } });
const EX = env.ctx.__EX;
const cmp = EX.dashboards.filter(d=>d.id==="cmp")[0];
const main = EX.dashboards.filter(d=>d.id==="d1")[0];
function txt(h){ return h.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,150); }
function spark(h){ return /<svg/.test(h) ? "HAS sparkline" : "no sparkline"; }
[["cmpW01hkpi","cmp tab: Jo column (kind budget = her retired v1)"],
 ["cmpW01okpi","cmp tab: OC column (kind budget-oc = our V2)"]].forEach(function(p){
  const w = cmp.widgets.filter(x=>x.id===p[0])[0];
  if(!w){ console.log(p[1]+": card id not found"); return; }
  const h = EX.contentHTML(w);
  console.log(p[1] + "  [kind " + w.kind + "]");
  console.log("   " + spark(h) + "  |  " + txt(h));
});
const her = main.widgets.filter(x=>x.kind==="budget-mb")[0];
const h2 = EX.contentHTML(Object.assign({}, her, {size:"kpi"}));
console.log("HER MAIN DASHBOARD today (kind budget-mb = what her live site serves)");
console.log("   " + spark(h2) + "  |  " + txt(h2));
