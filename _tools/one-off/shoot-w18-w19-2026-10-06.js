/* One-off: V2 screenshots of W18 (KPI band) and W19 (Alerts & Actions) for handover.html.
   Serves the repo root on 8766, drives headless Chrome over the DevTools protocol (Node 22 WebSocket,
   no packages), clips each element at device scale 1 like the existing shots, writes PNGs to docs/Pics/Version 2.
   Run: node _tools/one-off/shoot-w18-w19-2026-10-06.js */
"use strict";
const { spawn } = require("child_process"), fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.join(__dirname, "..", ".."), PORT = 8766, DBG = 9333;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT18 = path.join(ROOT, "docs/Pics/Version 2/W18 - Financial KPI"), OUT19 = path.join(ROOT, "docs/Pics/Version 2/W19 - Alerts & Actions");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11,19), ...a);
setTimeout(() => { console.error("WATCHDOG: 100s elapsed, aborting"); process.exit(2); }, 100000);
(async () => {
  const server = spawn(process.execPath, [path.join(ROOT, "_tools/serve.js"), String(PORT)], { stdio: "ignore" });
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "shoot-"));
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + DBG, "--window-size=1920,1080", "--hide-scrollbars", "--no-first-run", "--user-data-dir=" + prof, "about:blank"], { stdio: "ignore" });
  const kill = () => { try { chrome.kill(); } catch (e) {} try { server.kill(); } catch (e) {} };
  process.on("exit", kill);
  let ver = null; for (let i = 0; i < 40 && !ver; i++) { try { ver = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch (e) { await sleep(250); } }
  if (!ver) throw new Error("chrome did not start"); log("chrome up", ver.Browser);
  const ws = new WebSocket(ver.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r); log("ws open");
  let id = 0; const pending = new Map(), listeners = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) listeners.forEach(l => l(m)); };
  const send = (method, params, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {}, sessionId })); });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId: S } = await send("Target.attachToTarget", { targetId, flatten: true });
  log("attached", S); await send("Page.enable", {}, S); await send("Runtime.enable", {}, S);
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, S);
  const evalJS = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }, S); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + JSON.stringify(r.exceptionDetails.exception)); return r.result.value; };
  const goto = async (hash) => {
    const loaded = new Promise(r => { const l = m => { if (m.method === "Page.loadEventFired" && m.sessionId === S) { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
    log("navigate", hash); await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html${hash}` }, S); await Promise.race([loaded, sleep(15000).then(()=>log("load event timeout, continuing"))]); log("loaded");
    await Promise.race([evalJS("document.fonts.ready.then(()=>true)"), sleep(8000).then(()=>log("fonts timeout"))]); log("fonts ready"); await sleep(600);
  };
  const shoot = async (sel, file, pad) => {
    pad = pad == null ? 0 : pad;
    const r = await evalJS(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;el.scrollIntoView({block:"start"});var b=el.getBoundingClientRect();return {x:b.left+window.scrollX,y:b.top+window.scrollY,w:b.width,h:b.height};})()`);
    if (!r) { console.log("MISSING", sel); return; }
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x - pad, y: r.y - pad, width: r.w + 2 * pad, height: r.h + 2 * pad, scale: 1 } }, S);
    fs.writeFileSync(file, Buffer.from(shot.data, "base64")); console.log("saved", path.basename(file), Math.round(r.w) + "x" + Math.round(r.h));
  };
  const click = async (sel) => { const ok = await evalJS(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return false;el.click();return true;})()`); if (!ok) console.log("NO ELEMENT to click", sel); await sleep(350); return ok; };
  // W18: the band alone
  await goto("#only=W18");
  await shoot("#fkpBand .fkp-root", path.join(OUT18, "W18-V2-01 KPI band.png"));
  // W19: both sizes, then interactions on the Explore card
  await goto("#k=alerts");
  console.log("cards:", await evalJS(`[...document.querySelectorAll('section.widget[data-id]')].map(s=>s.getAttribute('data-id')+':'+Math.round(s.getBoundingClientRect().width)).join(' ')`));
  await shoot('section.widget[data-id="alB4"]', path.join(OUT19, "W19-V2-01 Explore.png"));
  await shoot('section.widget[data-id="alB4_x"]', path.join(OUT19, "W19-V2-02 Detail.png"));
  await click('section.widget[data-id="alB4"] .alb4-tab[data-tab="err"]');
  await shoot('section.widget[data-id="alB4"]', path.join(OUT19, "W19-V2-03 Explore - Critical tab.png"));
  await click('section.widget[data-id="alB4"] .alb4-tab[data-tab="warn"]');
  await shoot('section.widget[data-id="alB4"]', path.join(OUT19, "W19-V2-04 Explore - Warning tab.png"));
  await click('section.widget[data-id="alB4"] .alb4-tab[data-tab="all"]');
  // item pop-ups
  const popup = async (cat, idx, file) => {
    await click(`section.widget[data-id="alB4"] [data-action="alO-toggle"][data-cat="${cat}"]`);
    if (!(await evalJS(`!!document.querySelector('section.widget[data-id="alB4"] [data-action="alO-item"][data-cat="${cat}"][data-idx="${idx}"]')`))) { await click(`section.widget[data-id="alB4"] [data-action="alO-toggle"][data-cat="${cat}"]`); }
    await click(`section.widget[data-id="alB4"] [data-action="alO-item"][data-cat="${cat}"][data-idx="${idx}"]`);
    console.log("modal class:", await evalJS(`(document.querySelector('.al-modal')||{}).className`));
    await shoot(".al-modal", file, 0);
    await evalJS(`(function(){var b=document.querySelector('.al-modal-backdrop');if(b)b.remove();return true;})()`); await sleep(200);
  };
  await popup("al-cat-5", 0, path.join(OUT19, "W19-V2-05 Pop-up - Purchase order approval.png"));
  await popup("al-cat-1", 0, path.join(OUT19, "W19-V2-06 Pop-up - Restricted fund.png"));
  await popup("al-cat-3", 0, path.join(OUT19, "W19-V2-07 Pop-up - Unreconciled account.png"));
  kill(); process.exit(0);
})().catch(e => { console.error("FAILED", e); process.exit(1); });
