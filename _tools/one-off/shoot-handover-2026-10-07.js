/* Handover screenshots, V1 and V2, one widget at a time.
   V1 = _ref/v1-main-e0a04c5.html (Jo's main, identical to her live site); V2 = index.html#k=<kind>.
   Headless Chrome over the DevTools protocol (Node 22 WebSocket, no packages), 1920x1080 at device scale 1,
   element-clipped PNGs named "Wnn-V{v}-NN <label>.png" under docs/Pics/Version {1|2}/Wnn - <Name>/.
   Existing files of that widget+version move to _superseded/2026-10-07/ first. Fails loudly on a missing selector.

   Run:  node _tools/one-off/shoot-handover-2026-10-07.js W10 v1
         node _tools/one-off/shoot-handover-2026-10-07.js W10 v2
         node _tools/one-off/shoot-handover-2026-10-07.js W10 v2 03   (one shot only, by number)

   Step vocabulary (selectors not starting with "#" are scoped to the widget card):
     {click:sel}            click, then wait ~900ms (skeletons take 700-800ms)
     {size:"kpi"}           V1 only: open the size picker and pick a size
     {wait:ms}
     {target:[sel,...]}     what to clip instead of the card (first selector that exists wins) */
"use strict";
const { spawn } = require("child_process"), fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.join(__dirname, "..", ".."), PORT = Number(process.env.PORT || 8766), DBG = Number(process.env.DBG || 9335);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const V1_URL = `http://127.0.0.1:${PORT}/_ref/v1-main-e0a04c5.html`;
const V2_URL = `http://127.0.0.1:${PORT}/index.html`;
const SUPERSEDED = "_superseded/2026-10-07";

const SHELL_MODAL = ["#modalRoot .modal", "#modalRoot [role=dialog]"];
const W = {
  W09: { name: "Payroll Scheduled Time Off", kind: "pto",
    v1: { id: "pto", shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Approval Queue", size: "wide" },
      { num: "03", label: "Explore - Approval Queue expanded", size: "wide", steps: [{ click: '[data-action="pto-expand"]' }] },
      { num: "05", label: "Detail - Approval Queue", size: "xwide" },
      { num: "09", label: "Pop-up - Approve confirmation", size: "wide", steps: [{ click: '[data-action="pto-expand"]' }, { click: '[data-action="pto-approve-emp"]' }], target: SHELL_MODAL },
    ] },
    v2: { ids: { kpi: "ptoF_k", wide: "ptoF", xwide: "ptoF_x" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Approval Queue", size: "wide" },
      { num: "03", label: "Explore - Approval Queue expanded", size: "wide", steps: [{ click: '[data-pto="pto-person"]' }] },
      { num: "04", label: "Explore - Leave Calendar", size: "wide", steps: [{ click: '[data-pto="pto-view"][data-v="calendar"]' }] },
      { num: "05", label: "Detail - Approval Queue", size: "xwide" },
      { num: "06", label: "Detail - Leave Calendar", size: "xwide", steps: [{ click: '[data-pto="pto-view"][data-v="calendar"]' }] },
      { num: "07", label: "Pop-up - Person info", size: "wide", steps: [{ click: '[data-pto="pto-person"]' }, { click: '[data-pto="pto-info"]' }], target: ["#ptofOverlayRoot .modal", "#ptofOverlayRoot [role=dialog]"] },
      { num: "08", label: "Pop-up - Calendar day", size: "wide", steps: [{ click: '[data-pto="pto-view"][data-v="calendar"]' }, { click: '[data-pto="pto-mark"]', or: '[data-pto="pto-day"]' }], target: ["#ptofOverlayRoot .modal", "#ptofOverlayRoot [role=dialog]"] },
    ] } },
  W10: { name: "Loans With Balance Due", kind: "loans",
    v1: { id: "loan", shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Table", size: "wide" },
      { num: "05", label: "Detail", size: "xwide" },
      { num: "07", label: "Pop-up - Loan detail", size: "wide", steps: [{ click: '[data-action="loan-open"]' }], target: SHELL_MODAL },
    ] },
    v2: { ids: { kpi: "lonF_k", wide: "lonF", xwide: "lonF_x" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Table", size: "wide" },
      { num: "03", label: "Explore - Pie", size: "wide", steps: [{ click: '[data-lon="lon-view"][data-v="pie"]' }] },
      { num: "04", label: "Explore - Bands", size: "wide", steps: [{ click: '[data-lon="lon-view"][data-v="bands"]' }] },
      { num: "05", label: "Detail", size: "xwide" },
      { num: "06", label: "Detail - Bands", size: "xwide", steps: [{ click: '[data-lon="lon-side"][data-s="bands"]' }] },
      { num: "07", label: "Pop-up - Loan detail", size: "wide", steps: [{ click: '[data-lon="lon-open"]' }], target: ["#lonModalRoot .modal", "#lonModalRoot [role=dialog]"] },
    ] } },
  W11: { name: "Fixed Asset Values", kind: "fixedassets",
    v1: { id: "fa1", shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Asset Detail", size: "wide" },
      { num: "04", label: "Detail - Asset Detail", size: "xwide" },
    ] },
    v2: { ids: { kpi: "faF_k", wide: "faF", xwide: "faF_x" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Asset Detail", size: "wide" },
      { num: "03", label: "Explore - Chart", size: "wide", steps: [{ click: '[data-faf="view"][data-v="donut"]' }] },
      { num: "04", label: "Detail - Asset Detail", size: "xwide" },
      { num: "05", label: "Detail - Chart", size: "xwide", steps: [{ click: '[data-faf="view"][data-v="donut"]' }] },
      { num: "06", label: "Pop-up - Class table", size: "wide", steps: [{ click: '[data-faf="open-table"]' }], target: SHELL_MODAL },
    ] } },
  W13: { name: "Purchasing Management", kind: "purchasing",
    v1: { id: "pur", shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Table", size: "wide" },
      { num: "03", label: "Explore - Encumbrances chart", size: "wide", steps: [{ click: '[data-action="pur-view"][data-v="enc"]' }] },
      { num: "04", label: "Explore - Encumbrances table", size: "wide", steps: [{ click: '[data-action="pur-view"][data-v="enc"]' }, { click: '[data-action="pur-encview"][data-v="table"]' }] },
      { num: "05", label: "Detail", size: "xwide" },
      { num: "07", label: "Pop-up - Purchase order", size: "wide", steps: [{ click: '[data-action="pur-open"]' }], target: SHELL_MODAL },
    ] },
    v2: { ids: { kpi: "purF_k", wide: "purF", xwide: "purF_x" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Table", size: "wide" },
      { num: "03", label: "Explore - Encumbrances chart", size: "wide", steps: [{ click: '[data-purf="view"][data-v="enc"]' }] },
      { num: "04", label: "Explore - Encumbrances table", size: "wide", steps: [{ click: '[data-purf="view"][data-v="enc"]' }, { click: '[data-purf="enc-view"][data-v="table"]' }] },
      { num: "05", label: "Detail", size: "xwide" },
      { num: "06", label: "Detail - Encumbrances", size: "xwide", steps: [{ click: '[data-purf="view"][data-v="enc"]' }] },
      { num: "07", label: "Pop-up - Purchase order", size: "wide", steps: [{ click: '[data-purf="open"]' }], target: ["#purfModalRoot .modal", "#purfModalRoot [role=dialog]"] },
    ] } },
  W14: { name: "Main Content Tasks", kind: "tasks",
    v1: { ids: { kpi: "mct4", wide: "mct", xwide: "mct2", wide2: "mct3" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore", size: "wide" },
      { num: "03", label: "Detail", size: "xwide" },
      { num: "04", label: "Pop-up - Task", size: "wide", steps: [{ click: '[data-action="mct-open"]' }], target: SHELL_MODAL },
      { num: "05", label: "Explore - New user", size: "wide2" },
    ] },
    v2: { ids: { kpi: "mct4", wide: "mct", xwide: "mct2", wide2: "mct3" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore", size: "wide" },
      { num: "03", label: "Detail", size: "xwide" },
      { num: "04", label: "Pop-up - Task", size: "wide", steps: [{ click: '[data-action="mct-open"]' }], target: SHELL_MODAL },
      { num: "05", label: "Explore - New user", size: "wide2" },
    ] } },
  W15: { name: "Bank Balances", kind: "bank",
    v1: { id: "bank", shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Table", size: "wide" },
      { num: "04", label: "Detail", size: "xwide" },
      { num: "05", label: "Explore - One account", size: "wide", steps: [{ click: '[data-action="bank-acct"]' }, { click: '#overlay [data-action="bank-set-acct"]:not([data-acct="all"])' }] },
      { num: "07", label: "Explore - One account chart", size: "wide", steps: [{ click: '[data-action="bank-acct"]' }, { click: '#overlay [data-action="bank-set-acct"]:not([data-acct="all"])' }, { click: '[data-action="bank-view"][data-v="chart"]' }] },
    ] },
    v2: { ids: { kpi: "bank_k", wide: "bank", xwide: "bank_x" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Table", size: "wide" },
      { num: "03", label: "Explore - Bars", size: "wide", steps: [{ click: '[data-action="bank-view"][data-v="chart"]' }] },
      { num: "04", label: "Detail", size: "xwide" },
      { num: "05", label: "Explore - One account", size: "wide", steps: [{ click: '[data-action="bank-acct"]' }, { click: '#overlay [data-action="bank-set-acct"]:not([data-acct="all"])' }] },
      { num: "06", label: "Pop-up - Overdrawn accounts", size: "kpi", steps: [{ click: '[data-action="bank-drill"]' }], target: SHELL_MODAL },
    ] } },
  W16: { name: "Accounts Payable By Due Date", kind: "payables",
    v1: { id: "ap", shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Table", size: "wide" },
      { num: "03", label: "Detail", size: "xwide" },
      { num: "04", label: "Pop-up - Invoice", size: "wide", steps: [{ click: '[data-action="ap-open"]' }], target: SHELL_MODAL },
    ] },
    v2: { ids: { kpi: "ap_k", wide: "ap", xwide: "ap_x" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Table", size: "wide" },
      { num: "03", label: "Detail", size: "xwide" },
      { num: "04", label: "Pop-up - Invoice", size: "wide", steps: [{ click: '[data-action="ap-open"]' }], target: SHELL_MODAL },
    ] } },
  W17: { name: "Gifts Pledges", kind: "gifts",
    v1: { id: "gft", shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Giving", size: "wide" },
      { num: "03", label: "Explore - Summary Table", size: "wide", steps: [{ click: '[data-action="gft-view"][data-v="table"]' }] },
      { num: "04", label: "Detail", size: "xwide" },
      { num: "05", label: "Pop-up - Giving ledger", size: "wide", steps: [{ click: '[data-action="gft-open"]' }], target: SHELL_MODAL },
    ] },
    v2: { ids: { kpi: "gpF_k", wide: "gpF", xwide: "gpF_x" }, shots: [
      { num: "01", label: "Glance", size: "kpi" },
      { num: "02", label: "Explore - Giving", size: "wide" },
      { num: "03", label: "Explore - Summary Table", size: "wide", steps: [{ click: '[data-gpf="view"][data-v="table"]' }] },
      { num: "04", label: "Detail", size: "xwide" },
      { num: "05", label: "Pop-up - Giving ledger", size: "wide", steps: [{ click: '[data-gpf="baropen"]' }], target: ["#gpfModalRoot .modal", "#gpfModalRoot [role=dialog]"] },
      { num: "06", label: "Explore - Summary Table gifts", size: "wide", steps: [{ click: '[data-gpf="view"][data-v="table"]' }, { click: '[data-gpf="tbl"][data-v="gifts"]' }] },
    ] } },
};

const [, , WN, VER, ONLY] = process.argv;
if (!W[WN] || !["v1", "v2"].includes(VER)) { console.error("usage: node shoot-handover-2026-10-07.js W09..W17 v1|v2 [NN]"); process.exit(2); }
const cfg = W[WN], ver = cfg[VER], vnum = VER === "v1" ? "1" : "2";
const OUT = path.join(ROOT, "docs/Pics", `Version ${vnum}`, `${WN} - ${cfg.name}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
setTimeout(() => { console.error("WATCHDOG: 240s elapsed, aborting"); process.exit(3); }, 240000);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (!ONLY) { // move this widget+version's existing shots aside
    const old = fs.readdirSync(OUT).filter(f => f.startsWith(`${WN}-V${vnum}-`) && f.endsWith(".png"));
    if (old.length) { const d = path.join(OUT, SUPERSEDED); fs.mkdirSync(d, { recursive: true }); old.forEach(f => fs.renameSync(path.join(OUT, f), path.join(d, f))); log("moved", old.length, "old shot(s) to", SUPERSEDED); }
  }
  const server = spawn(process.execPath, [path.join(ROOT, "_tools/serve.js"), String(PORT)], { stdio: "ignore" });
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "shoot-"));
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + DBG, "--window-size=1920,1080", "--hide-scrollbars", "--no-first-run", "--user-data-dir=" + prof, "about:blank"], { stdio: "ignore" });
  const kill = () => { try { chrome.kill(); } catch (e) {} try { server.kill(); } catch (e) {} };
  process.on("exit", kill);
  let v = null; for (let i = 0; i < 40 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch (e) { await sleep(250); } }
  if (!v) throw new Error("chrome did not start");
  const ws = new WebSocket(v.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map(), listeners = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) listeners.forEach(l => l(m)); };
  const send = (method, params, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {}, sessionId })); });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId: S } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, S); await send("Runtime.enable", {}, S);
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, S);
  const evalJS = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }, S); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + JSON.stringify(r.exceptionDetails.exception)); return r.result.value; };
  const exists = sel => evalJS(`!!document.querySelector(${JSON.stringify(sel)})`);
  const goto = async (url) => {
    const loaded = new Promise(r => { const l = m => { if (m.method === "Page.loadEventFired" && m.sessionId === S) { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
    await send("Page.navigate", { url }, S); await Promise.race([loaded, sleep(15000)]);
    await Promise.race([evalJS("document.fonts.ready.then(()=>true)"), sleep(8000)]); await sleep(700);
  };
  const waitFor = async (sel, ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await exists(sel)) return true; await sleep(250); } return false; };
  const click = async (sel) => { if (!(await waitFor(sel))) { const diag = await evalJS(`(function(){var o=document.getElementById("overlay");return JSON.stringify({overlay:o?o.innerHTML.slice(0,160):null,hash:location.hash,scrollY:window.scrollY});})()`); throw new Error("no element to click: " + sel + " | " + diag); } await evalJS(`(function(){var el=document.querySelector(${JSON.stringify(sel)});el.scrollIntoView({block:"center"});return true;})()`); await sleep(350); /* let the scroll event pass: V1 closes pop-ups on scroll */ await evalJS(`document.querySelector(${JSON.stringify(sel)}).click()`); await sleep(900); };
  /* document coordinates + captureBeyondViewport, so a scrolled page clips correctly */
  const rectOf = sel => evalJS(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;el.scrollIntoView({block:"start"});var b=el.getBoundingClientRect();return {x:b.left+window.scrollX,y:b.top+window.scrollY,w:b.width,h:b.height};})()`);
  const settled = async (card) => { /* wait until the card has content and no skeleton */
    const t0 = Date.now(); while (Date.now() - t0 < 8000) { const ok = await evalJS(`(function(){var c=document.querySelector(${JSON.stringify(card)});if(!c)return false;var w=c.querySelector(".wcontent")||c;return w.children.length>0&&!c.querySelector(".skel,.skeleton,[data-state=loading]");})()`); if (ok) return; await sleep(250); } };

  const manifest = [];
  for (const s of ver.shots) {
    if (ONLY && s.num !== ONLY) continue;
    const file = path.join(OUT, `${WN}-V${vnum}-${s.num} ${s.label}.png`);
    try {
      const cardId = VER === "v1" ? (ver.id || ver.ids[s.size]) : ver.ids[s.size];
      const card = `section.widget[data-id="${cardId}"]`;
      await goto(VER === "v1" ? `${V1_URL}?s=${Date.now()}` : `${V2_URL}?s=${Date.now()}#k=${cfg.kind}`);
      if (!(await waitFor(card))) throw new Error("card not found: " + card);
      await settled(card);
      if (VER === "v1" && ver.id) { // one V1 row serves all sizes: switch it
        const cur = await evalJS(`document.querySelector(${JSON.stringify(card)}).getAttribute("data-size")`);
        if (cur !== s.size) { await click(`${card} [data-action="wsize"]`); await click(`#overlay [data-action="pick-size"][data-size="${s.size}"]`); await sleep(400); await settled(card); }
      }
      for (const st of (s.steps || [])) {
        if (st.wait) { await sleep(st.wait); continue; }
        if (st.click) {
          const scoped = sel => sel.startsWith("#") ? sel : `${card} ${sel}`;
          let sel = scoped(st.click);
          if (!(await exists(sel)) && st.or) sel = scoped(st.or);
          await click(sel);
        }
      }
      let target = card;
      if (s.target) { target = null; for (const t of s.target) { if (await exists(t)) { target = t; break; } } if (!target) throw new Error("no pop-up found for " + s.label + " (tried " + s.target.join(", ") + ")"); await sleep(300); }
      const r = await rectOf(target);
      if (!r || r.w < 20 || r.h < 20) throw new Error("bad rect for " + target + " " + JSON.stringify(r));
      const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } }, S);
      fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
      manifest.push({ num: s.num, label: s.label, size: `${Math.round(r.w)}x${Math.round(r.h)}`, ok: true });
      log("saved", path.basename(file), `${Math.round(r.w)}x${Math.round(r.h)}`);
    } catch (e) {
      manifest.push({ num: s.num, label: s.label, ok: false, error: e.message }); console.error("FAILED", s.num, s.label, "->", e.message); process.exitCode = 1;
    }
  }
  console.log("\nMANIFEST", WN, VER); manifest.forEach(m => console.log(m.ok ? "  ok  " : "  FAIL", m.num, m.label, m.ok ? m.size : m.error));
  kill(); process.exit(process.exitCode || 0);
})().catch(e => { console.error("FAILED", e); process.exit(1); });
