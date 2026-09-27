/* One-off, 2026-09-27, owner: "in the glimpse view. change the 10 need your approval is all that currently
   waiting for someone to do something. the in 3 figures down below have it as. waiting my approval, what is
   coming next for there approval and finally what is waiting to be paid. when you go over any the numbers
   there should be hover of giving not just shorted name but full meaning of each. the text below is the
   outstanding number only".
     - headline = every open order waiting for someone to act (Pending approval + Payment approval + Ready to pay)
     - tiles = Awaiting my approval next (kind next) | Awaiting my approval, later (kind mine) | Ready to pay
     - every figure carries a title + aria-label with the full meaning
     - caption = the outstanding dollars only */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const B0 = "function purFGlance(w){", B1 = "function purFEmpty(w,filtered){";
const i = t.indexOf(B0), j = t.indexOf(B1, i); if (i < 0 || j < 0) throw new Error("glance range");
const glance = [
  "/* Glance (owner, 27 Sep): headline = everything waiting for someone to act; tiles = my approval next / coming to",
  "   me later / ready to pay; every figure explains itself on hover; the caption is the outstanding dollars only. */",
  "function purFGlance(w){",
  '  var pa=purFPathCur(w),pos=purFDataset(w).filter(function(p){return pa==="All approval paths"||p.path===pa;});',
  '  var open=pos.filter(function(p){var l=purFLane(p);return l==="Pending approval"||l==="Payment approval"||l==="Ready to pay";});',
  '  var next=pos.filter(function(p){return purFTurn(p).kind==="next";}).length,later=pos.filter(function(p){return purFTurn(p).kind==="mine";}).length,toPay=pos.filter(function(p){return purFLane(p)==="Ready to pay";}).length;',
  "  var outstanding=purFSum(purFPendingSet(w));",
  '  var tiles=[',
  '    {n:next,lbl:"My approval",tone:PURF_STAGE_TONE["Pending approval"],full:"Awaiting my approval next: "+next+(next===1?" request":" requests")+" where your level is the next one to act."},',
  '    {n:later,lbl:"Coming to me",tone:PURF_STAGE_TONE["Payment approval"],full:"Awaiting my approval: "+later+(later===1?" request":" requests")+" on a path you are on, where an earlier level has to act first."},',
  '    {n:toPay,lbl:"To be paid",tone:PURF_STAGE_TONE["Ready to pay"],full:"Ready to pay: "+toPay+(toPay===1?" order":" orders")+" with payment approval complete, waiting for the check to be entered."}',
  "  ];",
  "  var cards=tiles.map(function(c){return '<div class=\"purf-gcard\" title=\"'+purFEsc(c.full)+'\" aria-label=\"'+purFEsc(c.full)+'\" tabindex=\"0\"><span class=\"purf-gnum\" style=\"color:'+c.tone+'\">'+c.n+'</span><span class=\"purf-glbl\">'+c.lbl+'</span></div>';}).join(\"\");",
  '  var headFull="Everything waiting for someone to act: "+open.length+(open.length===1?" open order":" open orders")+" pending approval, in payment approval, or ready to pay.";',
  "  return '<div class=\"kpi-row\"><div class=\"kpi-num\">'+",
  "    '<div class=\"dep-hd-kpigrp\" title=\"'+purFEsc(headFull)+'\" aria-label=\"'+purFEsc(headFull)+'\"><span class=\"metric-value\">'+open.length+'</span><span class=\"bank-pill\">waiting for action</span></div>'+",
  "    '<div class=\"purf-glance\">'+cards+'</div>'+",
  "    '<div class=\"gl-sub\"><span class=\"bank-caption\" title=\"Dollars on requests still pending approval.\">'+purFMoney(outstanding)+' outstanding</span></div>'+",
  "  '</div></div>';",
  "}",
  ""].join(NL);
t = t.slice(0, i) + glance + t.slice(j);
console.log("edited: glance");
if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done");
