/* One-off: Deposits on Hand account pop-up after the 6 Oct height fix.
   Opens the pop-up for the Capital account in headless Chrome (DevTools protocol, Node 22 WebSocket, no packages),
   checks the Done button is on screen and not covered at a normal window (1920x1080) and a short one (1366x700),
   and retakes "W07-V2-07 Pop-up - Account trend.png" and "W07-V2-08 Pop-up - Account table.png" at 1920.
   Run: node _tools/one-off/shoot-w07-popup-2026-10-06.js */
"use strict";
const { spawn } = require("child_process"), fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.join(__dirname, "..", ".."), PORT = 8766, DBG = 9334;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.join(ROOT, "docs/Pics/Version 2/W07 - Deposits on Hand");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
setTimeout(() => { console.error("WATCHDOG: 150s elapsed, aborting"); process.exit(2); }, 150000);
(async () => {
  const server = spawn(process.execPath, [path.join(ROOT, "_tools/serve.js"), String(PORT)], { stdio: "ignore" });
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "shoot-"));
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + DBG, "--window-size=1920,1080", "--hide-scrollbars", "--no-first-run", "--user-data-dir=" + prof, "about:blank"], { stdio: "ignore" });
  const kill = () => { try { chrome.kill(); } catch (e) {} try { server.kill(); } catch (e) {} };
  process.on("exit", kill);
  let ver = null; for (let i = 0; i < 40 && !ver; i++) { try { ver = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch (e) { await sleep(250); } }
  if (!ver) throw new Error("chrome did not start");
  const ws = new WebSocket(ver.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map(), listeners = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) listeners.forEach(l => l(m)); };
  const send = (method, params, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {}, sessionId })); });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId: S } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, S); await send("Runtime.enable", {}, S);
  const evalJS = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }, S); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + JSON.stringify(r.exceptionDetails.exception)); return r.result.value; };
  const setViewport = (w, h) => send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false }, S);
  const goto = async (hash) => {
    const loaded = new Promise(r => { const l = m => { if (m.method === "Page.loadEventFired" && m.sessionId === S) { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html${hash}` }, S);
    await Promise.race([loaded, sleep(15000)]);
    await Promise.race([evalJS("document.fonts.ready.then(()=>true)"), sleep(8000)]); await sleep(600);
  };
  const click = async (sel) => { const ok = await evalJS(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return false;el.click();return true;})()`); if (!ok) throw new Error("no element: " + sel); await sleep(400); return ok; };
  const shoot = async (sel, file) => {
    const r = await evalJS(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;var b=el.getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height};})()`);
    if (!r) throw new Error("no element to shoot: " + sel);
    const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } }, S);
    fs.writeFileSync(file, Buffer.from(shot.data, "base64")); log("saved", path.basename(file), Math.round(r.w) + "x" + Math.round(r.h));
  };
  const openPopup = async () => {
    await goto("#k=deposits");
    const sel = 'section.widget[data-id="depO"] [data-depo="pick-acct"][data-v="Capital"]';
    const have = await evalJS(`!!document.querySelector(${JSON.stringify(sel)})`);
    await click(have ? sel : 'section.widget[data-id="depO"] [data-depo="pick-acct"]');
    await sleep(500);
    if (!(await evalJS(`!!document.querySelector('.depo-acct-modal')`))) throw new Error("pop-up did not open");
  };
  const doneCheck = async (label) => {
    const r = await evalJS(`(function(){
      var m=document.querySelector('.depo-acct-modal'),b=m.querySelector('.modal-f .btn'),body=m.querySelector('.modal-b');
      var mb=m.getBoundingClientRect(),bb=b.getBoundingClientRect();
      var cx=bb.left+bb.width/2,cy=bb.top+bb.height/2,hit=document.elementFromPoint(cx,cy);
      return {viewport:[innerWidth,innerHeight],modal:[Math.round(mb.top),Math.round(mb.bottom)],done:[Math.round(bb.top),Math.round(bb.bottom)],
        doneOnScreen:bb.bottom<=innerHeight&&bb.top>=0, doneInsideModal:bb.bottom<=mb.bottom+0.5,
        doneHitTest:!!(hit&&(hit===b||b.contains(hit))), bodyScrolls:body.scrollHeight>body.clientHeight+1,
        plotH:Math.round((m.querySelector('.tr-plot')||{getBoundingClientRect:()=>({height:0})}).getBoundingClientRect().height)};})()`);
    log(label, JSON.stringify(r));
    if (!(r.doneOnScreen && r.doneInsideModal && r.doneHitTest)) { console.error("FAIL: Done button not fully visible at", label); process.exitCode = 1; }
    return r;
  };
  // 1. normal window: checks + the two doc screenshots
  await setViewport(1920, 1080);
  await openPopup();
  await doneCheck("1920x1080 trend");
  await shoot(".depo-acct-modal", path.join(OUT, "W07-V2-07 Pop-up - Account trend.png"));
  await click('.depo-acct-modal [data-depo="dep-view"][data-v="table"]');
  await doneCheck("1920x1080 table");
  await shoot(".depo-acct-modal", path.join(OUT, "W07-V2-08 Pop-up - Account table.png"));
  // 2. the owner's window size from the screenshots, and a short laptop window
  for (const [w, h] of [[1920, 889], [1366, 700], [1280, 600]]) {
    await setViewport(w, h);
    await openPopup();
    await doneCheck(`${w}x${h} trend`);
    await click('.depo-acct-modal [data-depo="dep-view"][data-v="table"]');
    await doneCheck(`${w}x${h} table`);
  }
  // one small-window shot for the eye, not for the doc
  await setViewport(1366, 700); await openPopup();
  fs.mkdirSync(path.join(ROOT, "_tools/.tmp"), { recursive: true });
  const full = await send("Page.captureScreenshot", { format: "png" }, S);
  fs.writeFileSync(path.join(ROOT, "_tools/.tmp/w07-popup-1366x700.png"), Buffer.from(full.data, "base64")); log("saved _tools/.tmp/w07-popup-1366x700.png");
  kill(); process.exit(process.exitCode || 0);
})().catch(e => { console.error("FAILED", e); process.exit(1); });
