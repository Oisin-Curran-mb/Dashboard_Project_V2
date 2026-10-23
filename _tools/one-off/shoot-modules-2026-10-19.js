/* Module dashboard screenshots, V1 and V2, FULL PAGE.

   For the "Module dashboards" document: one full-page shot per module per
   version, showing what that module's dashboard would look like with only its
   own widgets on it, all at Detail size (the owner's instruction, 19 Oct).

   V1 = _ref/v1-main-e0a04c5.html (the Phase 1 demo delivered to Value Labs).
   V2 = index.html.

   NOT element-clipped. shoot-handover-2026-10-07.js clips to the widget card;
   the owner asked for "full screen shot and not snipts", so this captures the
   whole document including the left navigation, the top bar and the toolbar.

   HOW A MODULE IS ISOLATED. Both builds render one <section class="widget"
   data-size> per registry row, and both carry the widget's name in .wtitle, so
   one filter works on both: keep the card whose title matches EXACTLY (which
   skips the parenthetical review fixtures, e.g. "Bank Balances (no accounts)")
   and whose data-size is xwide; remove every other card. Where a build has no
   xwide row for a widget, its size picker is driven to Detail first.

   Nothing is changed in either build: the filtering happens in the page, in
   the headless browser, and is thrown away with the tab.

   Run:  node _tools/one-off/shoot-modules-2026-10-19.js            all modules, both versions
         node _tools/one-off/shoot-modules-2026-10-19.js "General Ledger"
         node _tools/one-off/shoot-modules-2026-10-19.js "General Ledger" v2
*/
"use strict";
const { spawn } = require("child_process"), fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.join(__dirname, "..", ".."), PORT = Number(process.env.PORT || 8767), DBG = Number(process.env.DBG || 9337);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URLS = { v1: `http://127.0.0.1:${PORT}/_ref/v1-main-e0a04c5.html`, v2: `http://127.0.0.1:${PORT}/index.html` };
const OUTDIR = path.join(ROOT, "docs/Pics/Modules");

/* Module -> the widget titles that belong to it, from the Widget Permissions
   table in index.html. `band` means the Financial KPI band stays on screen;
   it is gated on General Ledger and is new in V2, so no other module keeps it
   and V1 has none at all. */
const MODULES = {
  /* Owner, 19 Oct: the home page is what Accounts Payable, Accounts Receivable,
     General Ledger and Bank Account Management show, all at EXPLORE size rather
     than Detail. Pending Actions appears in three of those and is shown once;
     the Financial KPI band comes with General Ledger; Main Content Tasks last. */
  "Home": { titles: ["Accounts Payable By Due Date", "Receivable Invoices Outstanding", "Budget Compared to Actual", "Bank Balances", "Pending Actions", "Main Content Tasks"], band: true, size: "wide" },
  "Accounts Payable": { titles: ["Accounts Payable By Due Date", "Pending Actions"] },
  "Accounts Receivable": { titles: ["Receivable Invoices Outstanding", "Pending Actions"] },
  "Bank Account Management": { titles: ["Bank Balances"] },
  "Deposits On Hand": { titles: ["Deposits on Hand"] },
  "Donors And Gifts": { titles: ["Gifts Pledges"] },
  "Fixed Assets": { titles: ["Fixed Asset Values"] },
  "General Ledger": { titles: ["Budget Compared to Actual", "Pending Actions"], band: true },
  "Insurance Billing": { titles: ["Insurance Billing Plans"] },
  "Loan Processing": { titles: ["Loans With Balance Due"] },
  "Payroll": { titles: ["Payroll Distributions"] },
  "Pension Billing": { titles: ["Pension Plans"] },
  "Purchasing Management": { titles: ["Purchasing Management"] },
  "Records": { titles: ["My Status", "Main Content Tasks"] },
  "Remittance": { titles: ["Remittance Pledges"] },
  /* Statistics has no widget of its own in either build; its original panel rendered the
     literal word STATS. Owner, 22 Oct 2026 (Q51): it takes the two shared widgets, like
     Records. V2 only: on test1 the URL redirects to the root, so there is no V1 capture
     (run with "Statistics" v2). */
  "Statistics": { titles: ["My Status", "Main Content Tasks"] }
};
/* Owner, 19 Oct: Main Content Tasks closes every module's dashboard, as the
   old system's slot 2 does on every module page with panels. Appended last,
   and the filter below keeps the cards in THIS order, so it renders last. */
Object.keys(MODULES).forEach(function (k) {
  const t = MODULES[k].titles;
  if (t.indexOf("Main Content Tasks") < 0) t.push("Main Content Tasks");
});

const [, , ONLY_MOD, ONLY_VER] = process.argv;
if (ONLY_MOD && !MODULES[ONLY_MOD]) {
  console.error("unknown module: " + ONLY_MOD + "\nknown: " + Object.keys(MODULES).join(", "));
  process.exit(2);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
setTimeout(() => { console.error("WATCHDOG: 600s elapsed, aborting"); process.exit(3); }, 600000);

/* Runs IN THE PAGE. Returns what it kept and what it could not find, so a
   missing widget is reported rather than silently producing an empty page. */
function FILTER_SRC(titles, keepBand, size) {
  size = size || "xwide"; /* Detail unless a module says otherwise; Home is Explore */
  return `(function(){
    var want=${JSON.stringify(titles)}, size=${JSON.stringify(size)}, kept=[], missing=[], needSize=[];
    var cards=[].slice.call(document.querySelectorAll('section.widget'));
    var chosen=[];
    want.forEach(function(t){
      var exact=cards.filter(function(c){
        var el=c.querySelector('.wtitle'); return el && el.textContent.trim()===t;
      });
      if(!exact.length){missing.push(t);return;}
      var x=exact.filter(function(c){return c.getAttribute('data-size')===size;})[0];
      if(x){chosen.push(x);kept.push(t+' ('+size+')');}
      else {chosen.push(exact[0]);needSize.push(exact[0].getAttribute('data-id'));kept.push(t+' (needs resize)');}
    });
    cards.forEach(function(c){if(chosen.indexOf(c)<0)c.remove();});
    /* the grid keeps registry order, which puts Main Content Tasks before the
       module's own widget; re-append in the wanted order so it renders last */
    chosen.forEach(function(c){c.parentElement.appendChild(c);});
    if(!${keepBand ? "true" : "false"}){var b=document.getElementById('fkpBand');if(b)b.innerHTML='';}
    return JSON.stringify({kept:kept,missing:missing,needSize:needSize,left:document.querySelectorAll('section.widget').length});
  })()`;
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const server = spawn(process.execPath, [path.join(ROOT, "_tools/serve.js"), String(PORT)], { stdio: "ignore" });
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "shootmod-"));
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + DBG, "--window-size=1920,1080",
    "--hide-scrollbars", "--no-first-run", "--user-data-dir=" + prof, "about:blank"], { stdio: "ignore" });
  const kill = () => { try { chrome.kill(); } catch (e) {} try { server.kill(); } catch (e) {} };
  process.on("exit", kill);

  let v = null;
  for (let i = 0; i < 40 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch (e) { await sleep(250); } }
  if (!v) throw new Error("chrome did not start");
  const ws = new WebSocket(v.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map(), listeners = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else listeners.slice().forEach(l => l(m));
  };
  const send = (method, params, sessionId) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params: params || {}, sessionId }));
  });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId: S } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, S); await send("Runtime.enable", {}, S);
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, S);

  const evalJS = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }, S);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description || ""));
    return r.result.value;
  };
  const exists = sel => evalJS(`!!document.querySelector(${JSON.stringify(sel)})`);
  const waitFor = async (sel, ms = 10000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await exists(sel)) return true; await sleep(250); } return false; };
  const click = async (sel) => { if (!(await waitFor(sel))) throw new Error("no such control: " + sel); await evalJS(`document.querySelector(${JSON.stringify(sel)}).click()`); await sleep(900); };
  const goto = async (url) => {
    const loaded = new Promise(r => { const l = m => { if (m.method === "Page.loadEventFired" && m.sessionId === S) { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
    await send("Page.navigate", { url }, S); await Promise.race([loaded, sleep(15000)]);
    await Promise.race([evalJS("document.fonts.ready.then(()=>true)"), sleep(8000)]);
    await sleep(900); /* skeletons settle at 700-800ms */
  };

  const manifest = [];
  const mods = ONLY_MOD ? [ONLY_MOD] : Object.keys(MODULES);
  /* V2 only by default since 19 Oct: the owner ruled that the "before" is the
     live old system, not the Phase 1 demo, and shoot-legacy-modules takes
     those. Pass v1 explicitly if the Phase 1 demo shots are ever wanted. */
  const vers = ONLY_VER ? [ONLY_VER] : ["v2"];

  for (const mod of mods) {
    const cfg = MODULES[mod];
    fs.mkdirSync(path.join(OUTDIR, mod), { recursive: true });
    for (const ver of vers) {
      const vnum = ver === "v1" ? "1" : "2";
      const file = path.join(OUTDIR, mod, `${mod} - V${vnum}.png`);
      try {
        await goto(`${URLS[ver]}?s=${Date.now()}`);
        if (!(await waitFor("section.widget"))) throw new Error("no widgets rendered at all");

        const res = JSON.parse(await evalJS(FILTER_SRC(cfg.titles, !!cfg.band, cfg.size)));
        /* a widget that exists only at a smaller size: drive its size picker */
        for (const wid of res.needSize) {
          const card = `section.widget[data-id="${wid}"]`;
          await click(`${card} [data-action="wsize"]`);
          await click(`#overlay [data-action="pick-size"][data-size="${cfg.size || "xwide"}"]`);
        }
        if (res.needSize.length) {
          /* the re-render brings every card back, so filter again */
          JSON.parse(await evalJS(FILTER_SRC(cfg.titles, !!cfg.band, cfg.size)));
        }
        await sleep(900);

        /* The dashboard is titled for its module, as every old-system module
           page is and as the owner's 19 Oct instruction requires. The build has
           one dashboard named Accounts Payable; for the other modules' shots the
           title is set in the page to the module's name, so each screenshot
           shows the proposal as it would render. Set AFTER the size-picker
           re-render, which would otherwise put the registry name back. */
        if (ver === "v2") await evalJS(`(function(){var n=document.querySelector('.dash-name');if(n)n.textContent=${JSON.stringify(mod)};return !!n;})()`);
        /* Driving the size picker leaves a status line behind ("Pending
           Actions" -> Detail.). That is an artefact of this script, not
           something a user would see on their own dashboard, so it goes. */
        await evalJS(`(function(){var s=document.getElementById('status');if(s)s.textContent='';return true;})()`);

        const left = await evalJS(`document.querySelectorAll('section.widget').length`);
        if (!left) throw new Error("filter removed everything; titles not found: " + res.missing.join(", "));

        const m = await evalJS(`(function(){var d=document.documentElement;return JSON.stringify({w:Math.max(d.scrollWidth,1920),h:Math.max(d.scrollHeight,1080)});})()`);
        const { w, h } = JSON.parse(m);
        const shot = await send("Page.captureScreenshot", {
          format: "png", captureBeyondViewport: true,
          clip: { x: 0, y: 0, width: w, height: h, scale: 1 }
        }, S);
        fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
        manifest.push({ mod, ver, ok: true, size: `${w}x${h}`, kept: res.kept.join(" + "), missing: res.missing });
        log("saved", `${mod} - V${vnum}.png`, `${w}x${h}`, res.missing.length ? "(missing: " + res.missing.join(", ") + ")" : "");
      } catch (e) {
        manifest.push({ mod, ver, ok: false, error: e.message });
        console.error("FAILED", mod, ver, "->", e.message);
        process.exitCode = 1;
      }
    }
  }

  console.log("\nMANIFEST");
  manifest.forEach(m => console.log(
    (m.ok ? "  ok   " : "  FAIL ") + (m.mod + "                        ").slice(0, 26) + " V" + (m.ver === "v1" ? "1" : "2") + "  " +
    (m.ok ? m.size + "  " + m.kept + (m.missing.length ? "   MISSING: " + m.missing.join(", ") : "") : m.error)));
  kill(); process.exit(process.exitCode || 0);
})().catch(e => { console.error("FAILED", e); process.exit(1); });
