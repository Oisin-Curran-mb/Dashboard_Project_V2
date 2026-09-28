/* =====================================================================
   jo-port-driver.js , the SHARED port verification harness.

   Written 2026-09-02 for the W10 port (the pilot of the W09/W10 pair) and
   meant to be reused by every later port. Every previous port rebuilt the DOM
   shim from scratch, which was the single biggest time sink in the job, and a
   shared harness also means a regression in one widget gets caught by the
   other widgets' runs.

   What lives HERE (generic):
     - loadShell()        read index.html, split out the <script> and <style>
     - extractRegion()    lift a widget block VERBATIM out of the real file
     - extractRegistry()  lift the registry entries for one kind
     - makeShim()         the DOM/window shim plus the shell's helper globals
     - runBlock()         execute the extracted block in that shim
     - fire()/fireKey()   drive the block's OWN delegated listeners
     - Assert             pass/fail bookkeeping and the generic assertions,
                          including noEmDash() and cssDeclares()

   What lives in a WIDGET driver (per widget):
     - the extraction markers, the kind, the registry ids
     - the class list its markup relies on
     - its own behavioural assertions

   Usage:
     const H=require("./jo-port-driver.js");
     const shell=H.loadShell();
     const block=H.extractRegion(shell.script,"var LONF_TODAY=",END_MARKER);
     const env=H.runBlock(block,{registry:H.extractRegistry(shell.script,"loans-mb")});
     const A=new H.Assert("W10 loans-mb");
     ...
     process.exit(A.report());

   Run from this folder:  node w10-loans-mb.driver.js
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SHELL = path.join(__dirname, "..", "index.html");

/* ---------- 0. the committed baseline --------------------------------- */
/* Complete Version 2 (2026-09-25): the drivers used to compare against
   gitignored index.BACKUP-*.html snapshots and against `git show a548419`,
   neither of which exists in this repo. Both are replaced by the committed
   file(s) in _tools/baselines/. Today that is index.a548419.html: Jo's
   Widget Container Demo/index.html at the OisinBranch branch point, converted
   to CRLF so the byte-level region comparisons still line up. Newest file
   (by name sort) wins, so a later baseline can be added without editing
   any driver. */
const BASELINE_DIR = path.join(__dirname, "baselines");
function baselineFiles() {
  if (!fs.existsSync(BASELINE_DIR)) return [];
  return fs.readdirSync(BASELINE_DIR)
    .filter(function (f) { return /^index\..*\.html$/.test(f); })
    .sort()
    .map(function (f) { return path.join(BASELINE_DIR, f); });
}
function baseline() {
  const f = baselineFiles();
  return f.length ? fs.readFileSync(f[f.length - 1], "utf8") : null;
}

/* ---------- 1. read the real file ------------------------------------- */
function loadShell(file) {
  const p = file || SHELL;
  const html = fs.readFileSync(p, "utf8");
  const s = /<script>([\s\S]*)<\/script>/.exec(html);
  if (!s) throw new Error("no <script> found in " + p);
  const c = /<style>([\s\S]*?)<\/style>/.exec(html);
  if (!c) throw new Error("no <style> found in " + p);
  return { file: p, html: html, script: s[1], css: c[1] };
}

/* ---------- 2. lift a block out, verbatim ----------------------------- */
function extractRegion(script, startMarker, endMarker) {
  const i = script.indexOf(startMarker);
  if (i < 0) throw new Error("start marker not found: " + startMarker);
  const j = script.indexOf(endMarker, i);
  if (j < 0) throw new Error("end marker not found: " + endMarker);
  return script.slice(i, j + endMarker.length);
}

/* Every registry entry for one kind, as live objects. One entry per line is
   the convention in this file, which is what makes this safe. */
function extractRegistry(script, kind) {
  const out = [];
  script.split("\n").forEach(function (ln) {
    if (ln.indexOf('kind:"' + kind + '"') < 0) return;
    const t = ln.trim().replace(/^,/, "").replace(/,$/, "");
    if (t.charAt(0) !== "{") return;
    out.push(t);
  });
  if (!out.length) throw new Error("no registry entries for kind " + kind);
  const objs = vm.runInNewContext("[" + out.join(",") + "]");
  /* mirror the shell's own normalisation pass over the registry */
  objs.forEach(function (w) {
    if (!w.tiers) w.tiers = [w.size];
    if (!w.state) w.state = "ready";
    if (!w.updated) w.updated = "14 min ago";
  });
  return objs;
}

/* ---------- 3. the DOM / window shim ---------------------------------- */
function makeShim(opts) {
  opts = opts || {};
  const nodes = {};              /* id -> node, as getElementById sees it */
  const listeners = {};          /* "click" | "keydown" | ... -> [fn] */
  const captured = {};           /* id -> last innerHTML written */

  function mkNode(id, tag) {
    const n = {
      id: id || "",
      tagName: (tag || "div").toUpperCase(),
      className: "",
      style: {},
      children: [],
      _attrs: {},
      _html: "",
      offsetWidth: 210,
      offsetHeight: 132,
      setAttribute: function (k, v) { n._attrs[k] = String(v); },
      getAttribute: function (k) { return Object.prototype.hasOwnProperty.call(n._attrs, k) ? n._attrs[k] : null; },
      removeAttribute: function (k) { delete n._attrs[k]; },
      appendChild: function (c) { n.children.push(c); if (c && c.id) nodes[c.id] = c; return c; },
      remove: function () { if (n.id) delete nodes[n.id]; },
      focus: function () {},
      /* a node's own click() fires the shim's CONFIGURED data attribute,
         not the first ported widget's. Defaults to data-lon, so no existing
         driver changes behaviour. */
      click: function () { fire(n.getAttribute(opts.dataAttr || "data-lon"), n._attrs); },
      contains: function () { return false; },
      closest: function (sel) { return matchSel(n, sel) ? n : null; },
      querySelector: function () { return mkNode("", "div"); },
      querySelectorAll: function () { return []; },
      getBoundingClientRect: function () {
        return { left: 40, top: 120, right: 190, bottom: 146, width: 150, height: 26, x: 40, y: 120 };
      }
    };
    Object.defineProperty(n, "innerHTML", {
      get: function () { return n._html; },
      set: function (v) { n._html = v == null ? "" : String(v); if (n.id) captured[n.id] = n._html; }
    });
    return n;
  }

  /* Only the selector shapes the ported blocks actually use:
     "[data-x]", "[data-x=\"v\"]", "#id", ".cls", ".cls[data-x]". */
  function matchSel(n, sel) {
    sel = String(sel).trim();
    if (sel.charAt(0) === "#") return n.id === sel.slice(1);
    let m = /^\[([a-zA-Z-]+)(?:="([^"]*)")?\]$/.exec(sel);
    if (m) {
      const v = n.getAttribute(m[1]);
      return v !== null && (m[2] === undefined || v === m[2]);
    }
    m = /^\.([A-Za-z0-9_-]+)(?:\[([a-zA-Z-]+)\])?$/.exec(sel);
    if (m) {
      const hasClass = (" " + (n.className || "") + " ").indexOf(" " + m[1] + " ") > -1;
      return hasClass && (!m[2] || n.getAttribute(m[2]) !== null);
    }
    return false;
  }

  const body = mkNode("body", "body");
  const documentShim = {
    body: body,
    getElementById: function (id) { return nodes[id] || null; },
    createElement: function (tag) { return mkNode("", tag); },
    querySelector: function (sel) {
      for (const k in nodes) if (matchSel(nodes[k], sel)) return nodes[k];
      const n = mkNode("", "div");
      n._selector = sel;
      return n;
    },
    querySelectorAll: function () { return []; },
    addEventListener: function (t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    removeEventListener: function () {},
    activeElement: null
  };
  const windowShim = {
    innerWidth: 1440,
    innerHeight: 900,
    addEventListener: function (t, fn) { (listeners["window:" + t] = listeners["window:" + t] || []).push(fn); },
    requestAnimationFrame: function (f) { if (typeof f === "function") f(0); return 1; },
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; }
  };

  /* a click/keydown target built from a bag of attributes */
  function mkTarget(attrs, tag, className) {
    const t = mkNode("", tag || "button");
    t.className = className || "";
    Object.keys(attrs || {}).forEach(function (k) { t._attrs[k] = String(attrs[k]); });
    return t;
  }

  function fire(action, attrs, tag) {
    const bag = Object.assign({}, attrs || {});
    if (action) bag[opts.dataAttr || "data-lon"] = action;
    const target = mkTarget(bag, tag);
    const ev = { target: target, preventDefault: function () {}, stopPropagation: function () {}, clientX: 300, clientY: 300 };
    (listeners.click || []).forEach(function (fn) { fn(ev); });
    return ev;
  }
  /* a click on nothing in particular, i.e. an outside click */
  function fireOutside() {
    const target = mkTarget({}, "div");
    (listeners.click || []).forEach(function (fn) { fn({ target: target, preventDefault: function () {} }); });
  }
  function fireKey(key, attrs, tag) {
    const target = mkTarget(attrs || {}, tag || "div");
    const ev = { key: key, target: target, preventDefault: function () {} };
    (listeners.keydown || []).forEach(function (fn) { fn(ev); });
    return ev;
  }
  function fireMove(className, attrs) {
    const target = mkTarget(attrs || {}, "button", className || "");
    (listeners.mousemove || []).forEach(function (fn) {
      fn({ target: target, clientX: 400, clientY: 300 });
    });
  }
  function fireWindow(type) {
    (listeners["window:" + type] || []).forEach(function (fn) { fn({}); });
  }

  return {
    nodes: nodes, listeners: listeners, captured: captured,
    document: documentShim, window: windowShim, body: body,
    mkNode: mkNode, mkTarget: mkTarget, matchSel: matchSel,
    fire: fire, fireOutside: fireOutside, fireKey: fireKey,
    fireMove: fireMove, fireWindow: fireWindow
  };
}

/* ---------- 4. run the extracted block in that shim ------------------- */
/* ---------- 4b. the shell's shared helper package ---------------------
   One implementation of the helpers every widget used to write out for itself.
   Lifted out of index.html on demand and cached, so drivers never carry a copy
   that could drift from the build. Added 2026-09-28. */
const PKG_START = "     Shell: shared widget helpers (the common package)";
const PKG_END = "  /* ===== end Shell: shared widget helpers ===== */";
let _pkg = null;
function sharedPackage() {
  if (_pkg !== null) return _pkg;
  const shell = loadShell();
  const hit = shell.script.indexOf(PKG_START);
  const b = shell.script.indexOf(PKG_END);
  if (hit < 0 || b < 0) { _pkg = ""; return _pkg; }
  /* back up to the comment opener on the line above the banner title */
  const a = shell.script.lastIndexOf("/* ====", hit);
  if (a < 0) { _pkg = ""; return _pkg; }
  _pkg = shell.script.slice(a, b + PKG_END.length);
  return _pkg;
}

function runBlock(block, opts) {
  opts = opts || {};
  const shim = makeShim(opts);
  const registry = opts.registry || [];
  const log = { renders: 0, status: [], timers: 0 };

  const sandbox = {
    /* the shell's own helpers, same behaviour, no DOM needed */
    ICON: function (n) { return '<span class="material-symbols-rounded">' + n + "</span>"; },
    money: function (n) { return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }); },
    fmtAxis: function (n) { return String(Math.round(n / 1000)) + "k"; },
    find: function (id) { for (let i = 0; i < registry.length; i++) if (registry[i].id === id) return registry[i]; return undefined; },
    render: function () { log.renders++; if (opts.onRender) opts.onRender(); },
    renderOverlay: function () {},
    renderModal: function () {},
    setStatus: function (s) { log.status.push(String(s)); },
    hideTip: function () {}, hideLnTip: function () {},
    timers: {},
    pop: null, modal: null, modalMounted: false, manage: false,
    document: shim.document,
    window: shim.window,
    requestAnimationFrame: shim.window.requestAnimationFrame,
    setTimeout: function (f) { log.timers++; return log.timers; },   /* never auto-fires: loading is asserted, not waited on */
    clearTimeout: function () {},
    console: console,
    Math: Math, Date: Date, JSON: JSON, Number: Number, String: String,
    Object: Object, Array: Array, isNaN: isNaN, parseInt: parseInt, parseFloat: parseFloat
  };
  Object.assign(sandbox, opts.globals || {});
  const ctx = vm.createContext(sandbox);
  /* The shell's shared helper package (escAttr, escText, parseISO, MONTHS,
     fmtDateLong, moneyFull, bandFromDays) is evaluated first, so a driver that
     runs its widget's block alone still has the helpers the block now calls.
     Lifted from index.html at run time rather than copied here, so there stays
     exactly one implementation. Added 2026-09-28 with the package itself. */
  if (opts.sharedPackage !== false) {
    const pkg = sharedPackage();
    if (pkg) vm.runInContext(pkg, ctx, { filename: "shared-package.js" });
  }
  vm.runInContext(block, ctx, { filename: "ported-block.js" });
  return { ctx: ctx, shim: shim, registry: registry, log: log,
           get: function (n) { return ctx[n]; },
           call: function (n) { return ctx[n].apply(null, Array.prototype.slice.call(arguments, 1)); } };
}

/* ---------- 4c. the shared test library -------------------------------
   The pieces fourteen drivers were each writing out for themselves. Additive:
   nothing here changes how a driver that has not adopted it behaves. Added
   2026-09-28 with the build-side shared package.

   Adopting `hostShell` across the fourteen drivers that splice TAIL/EXPORTS by
   hand is a mechanical but wide change, deliberately left for a reviewed pass
   rather than done unsupervised: it touches every driver at once, and the
   drivers are the only thing that proves the build. */

/* the shell script's own closing lines, which a driver must cut before it can
   splice its export bag in. Duplicated verbatim in fourteen drivers and in
   syntax-check.js. */
const TAIL = "\r\n  render();\r\n})();\r\n";

/* the Node-side globals the shell touches but the shim does not provide. */
function NODE_GLOBALS() {
  return {
    __EX: null, Boolean: Boolean, RegExp: RegExp, Intl: Intl, Set: Set, Map: Map, Error: Error,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    setInterval: function () { return 1; }, clearInterval: function () {},
    navigator: { userAgent: "node" }, location: { href: "about:blank", hash: "" },
    alert: function () {}, innerWidth: 1440, innerHeight: 900,
    performance: { now: function () { return 0; } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; }
  };
}

/* strip block comments, so an assertion about CODE is not satisfied by prose.
   Four drivers named this helper and twelve more inlined the regex. */
function code(s) { return String(s).replace(/\/\*[\s\S]*?\*\//g, ""); }

/* a widget's identity, from the map rather than transcribed into the driver.
   This is what keeps a driver's label, its kind and its tags in one place. */
let _map = null;
function widgetMap() {
  if (!_map) _map = JSON.parse(fs.readFileSync(path.join(__dirname, "widget-map.json"), "utf8"));
  return _map;
}
function meta(wnn) {
  const m = widgetMap().widgets[String(wnn).toUpperCase()];
  if (!m) throw new Error("no such widget in widget-map.json: " + wnn);
  const f = m.final || m.ours || {};
  return {
    n: String(wnn).toUpperCase(), name: m.name, kind: f.kind || null, prefix: f.prefix || null,
    driver: m.driver, tags: (m.tags || []).slice(), decided: m.decided || null,
    label: String(wnn).toUpperCase() + " " + m.name
  };
}

/* every marker must appear exactly once, or a region slice is meaningless.
   Hand-rolled in eighteen places. */
function assertMarkersUnique(raw, markers, A) {
  markers.forEach(function (mk) {
    const n = raw.split(mk).length - 1;
    A.eq(n, 1, "exactly one " + mk.slice(0, 52));
  });
}

/* the shell with one widget's own region removed, which is what "nothing of
   ours leaked outside its block" assertions measure against. */
function outside(shell, regions) {
  let js = shell.script, css = shell.css;
  (regions.js || []).forEach(function (r) { js = js.replace(r, ""); });
  (regions.css || []).forEach(function (r) { css = css.replace(r, ""); });
  return { script: js, css: css };
}

/* ---------- 5. assertions -------------------------------------------- */
const EM_DASH = "—";

class Assert {
  constructor(label) { this.label = label; this.pass = 0; this.fail = 0; this.fails = []; }
  _rec(ok, msg) {
    if (ok) { this.pass++; } else { this.fail++; this.fails.push(msg); console.log("  FAIL  " + msg); }
    return ok;
  }
  ok(cond, msg) { return this._rec(!!cond, msg); }
  eq(a, b, msg) { return this._rec(a === b, msg + "  (got " + JSON.stringify(a) + ", want " + JSON.stringify(b) + ")"); }
  near(a, b, tol, msg) { return this._rec(Math.abs(a - b) <= tol, msg + "  (got " + a + ", want " + b + ")"); }
  contains(hay, needle, msg) { return this._rec(String(hay).indexOf(needle) > -1, msg + "  (missing " + JSON.stringify(needle) + ")"); }
  absent(hay, needle, msg) { return this._rec(String(hay).indexOf(needle) < 0, msg + "  (unexpectedly present: " + JSON.stringify(needle) + ")"); }
  changed(a, b, msg) { return this._rec(String(a) !== String(b), msg + "  (output did not change)"); }
  /* The inverse of changed(): proof that a control did NOT reach something
     it must not. Every port makes at least one such claim, and asserting it
     needs an equality that names the control in the failure. */
  same(a, b, msg) { return this._rec(String(a) === String(b), msg + "  (output changed when it must not have)"); }
  /* No em dashes in any user-facing string. A minus sign is fine. */
  noEmDash(html, msg) { return this._rec(String(html).indexOf(EM_DASH) < 0, "em dash in " + msg); }
  /* The bug class this file has taught repeatedly: markup using a class that
     the stylesheet never declares, which ships as unstyled native chrome. */
  cssDeclares(css, classes, msg) {
    const missing = classes.filter(function (c) {
      return !new RegExp("\\." + c.replace(/[-]/g, "\\-") + "(?![A-Za-z0-9_-])").test(css);
    });
    return this._rec(missing.length === 0, (msg || "CSS declarations") + " missing: " + missing.join(", "));
  }
  /* Decision D12 (2026-09-25): in a table whose header row carries .wt-head the
     header cells must carry exactly the width/alignment classes of their body
     cells, so headers sit over their columns. The row class is whatever the
     header row's first class is (.wt-row, .remO-row, ...); rows are cut by div
     depth, so a body row may hold nested divs and attributes. Compares the first
     header row's cells with the first body row's, class set by class set
     (sort-button state tokens and screen-reader-only spans ignored). */
  headMatchesBody(html, msg) {
    const s = String(html);
    const first = /<div class="([^"]*)\bwt-head\b/.exec(s);
    const rowCls = (first && first[1].trim().split(/\s+/)[0]) || "wt-row";
    const rows = []; const open = new RegExp('<div class="' + rowCls + '(?:\\s[^"]*)?"[^>]*>', "g"); let om;
    while ((om = open.exec(s))) {
      const tag = /<(\/?)div\b[^>]*>/g; tag.lastIndex = om.index + om[0].length; let depth = 1, tm;
      while (depth && (tm = tag.exec(s))) { depth += tm[1] ? -1 : 1; if (!depth) rows.push([/class="([^"]*)"/.exec(om[0])[1], s.slice(om.index + om[0].length, tm.index)]); }
      if (depth) break;
    }
    const head = rows.find(function (r) { return /\bwt-head\b/.test(r[0]); });
    const body = rows.find(function (r) { return !/\bwt-head\b/.test(r[0]); });
    if (!head || !body) return this._rec(false, msg + ": header and a body row were found  (head " + !!head + ", body " + !!body + ")");
    /* top-level cells only: a sort <button> or a badge <span> nested inside a cell is part of that cell */
    const cells = function (s) {
      const out = []; let depth = 0; const re = /<(\/?)(span|button|div|a|b|i|em|strong|small)\b([^>]*)>/g; let m;
      while ((m = re.exec(s))) {
        if (m[1]) { depth--; continue; }
        if (/\/>$/.test(m[0])) continue;
        if (depth === 0) { const cm = /class="([^"]*)"/.exec(m[3]); const cl = (cm ? cm[1] : "").split(/\s+/).filter(function (c) { return c && !/^(on|wt-sort|lr-link|wt-rowlink)$/.test(c); }); if (cl.indexOf("sr-only") < 0) out.push(cl.sort().join(" ")); }
        depth++;
      }
      return out;
    };
    const h = cells(head[1]), b = cells(body[1]);
    if (h.length !== b.length) return this._rec(false, msg + ": header has " + h.length + " cells, body has " + b.length);
    const bad = h.map(function (c, i) { return c === b[i] ? null : "col " + (i + 1) + " head[" + c + "] body[" + b[i] + "]"; }).filter(Boolean);
    return this._rec(bad.length === 0, msg + ": header cells carry their column's classes" + (bad.length ? "  (" + bad.join("; ") + ")" : ""));
  }
  report() {
    console.log("\n" + this.label + ": " + this.pass + " passed, " + this.fail + " failed, " + (this.pass + this.fail) + " assertions");
    if (this.fail) console.log("FAILURES:\n - " + this.fails.join("\n - "));
    else console.log("ALL ASSERTIONS PASSED");
    return this.fail ? 1 : 0;
  }
}

module.exports = { SHELL, BASELINE_DIR, baselineFiles, baseline, loadShell, extractRegion, extractRegistry, makeShim, runBlock, sharedPackage,
                   TAIL, NODE_GLOBALS, code, widgetMap, meta, assertMarkersUnique, outside, Assert, EM_DASH };
