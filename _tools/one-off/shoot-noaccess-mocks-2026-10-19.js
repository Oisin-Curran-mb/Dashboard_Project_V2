/* Three mock-ups of the "no permission" pop-up, 19 October 2026.

   Owner: "all links for more information should always show, but if a user
   clicks it and does not have permission for that page, there be a pop up
   saying that user does not have permission to access that page and name the
   page they are trying to access, starting with module/subname/name of the
   page. create 3 mock ... make sure you using design library ... try to match
   the other popup in the V2".

   HOW THEY MATCH V2. Each mock is the shell's own modal: .modal-backdrop >
   .modal > .modal-h (.modal-title with the inline icon, .iconbtn close) +
   .modal-b + .modal-f, with the shell's .btn family. Nothing is styled from
   scratch; the only inline styles are Pathway tokens (--type-size-*,
   --padding-*, --red-130, --txt-subtle), exactly as the real modals do for
   their title icons. The build's stylesheet is NOT changed: the markup is
   injected into the live page in headless Chrome, photographed, and gone.

   THE TEMPLATE every option shares: the page the user tried to open, named
   as Module / Section / Page in bold. The example is the one the owner asked
   about: Bank Account Management / Bank Account Information / Update.

   Output: docs/Pics/Permissions/noaccess-a.png, -b.png, -c.png, clipped to
   the modal with a margin of backdrop, 1920-wide render at device scale 1.

   DECIDED, later the same day: the owner chose B, with two changes: Close is
   the only control, and the second line reads "Contact your administrator for
   more information." That is the "final" option below, written to
   noaccess.png. ONLY=final (the default) shoots just that; ONLY=a,b,c,final
   reshoots the superseded options too.
*/
"use strict";
const { spawn } = require("child_process"), fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.join(__dirname, "..", ".."), PORT = Number(process.env.PORT || 8768), DBG = Number(process.env.DBG || 9343);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.join(ROOT, "docs/Pics/Permissions");

const PAGE = "Bank Account Management / Bank Account Information / Update";
const RIGHT = "/BankAccountManagement/BankAccountInformation/Update";
const ICON = '<span class="material-symbols-rounded" style="font-size:var(--type-size-18);vertical-align:-4px;margin-right:var(--padding-xtight);color:var(--red-130)">lock</span>';
const CLOSE = '<button class="iconbtn" aria-label="Close"><span class="material-symbols-rounded">close</span></button>';
const shell = (label, title, body, foot) =>
  `<div class="modal-backdrop" id="noaccess-mock"><div class="modal" role="dialog" aria-modal="true" aria-label="${label}">` +
  `<div class="modal-h"><span class="modal-title">${ICON}${title}</span>${CLOSE}</div>` +
  `<div class="modal-b">${body}</div><div class="modal-f">${foot}</div></div></div>`;

const OPTIONS = {
  a: {
    name: "Plain",
    html: shell("No permission",
      "You don't have permission to open this page",
      `<p style="margin:0 0 var(--padding-tight)">You tried to open <b>${PAGE}</b>.</p>` +
      `<p style="margin:0">Ask your administrator to grant you access.</p>`,
      `<button class="btn primary sm">Close</button>`)
  },
  b: {
    name: "With actions",
    html: shell("No access to this page",
      "No access to this page",
      `<p style="margin:0 0 var(--padding-tight)">Opening <b>${PAGE}</b> needs a right you don't hold.</p>` +
      `<p style="margin:0">Your administrator can add it, or you can ask for it from here.</p>`,
      `<button class="btn naked sm">Request access</button><button class="btn primary sm">Back to dashboard</button>`)
  },
  c: {
    name: "With the right named",
    html: shell("Can't open Bank Account Information",
      "Can't open Bank Account Information",
      `<p style="margin:0 0 var(--padding-tight)">You don't have permission to open <b>${PAGE}</b>.</p>` +
      `<p style="margin:0;color:var(--txt-subtle);font-size:var(--type-size-12);line-height:1.5">Needs <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${RIGHT}</span> at Inquiry, granted in Security Setup, Task Roles, Bank Account Management, Modify.</p>`,
      `<button class="btn primary sm">Close</button>`)
  },
  final: {
    name: "Decided: B, Close only",
    file: "noaccess.png",
    html: shell("No access to this page",
      "No access to this page",
      `<p style="margin:0 0 var(--padding-tight)">Opening <b>${PAGE}</b> needs a right you don't hold.</p>` +
      `<p style="margin:0">Contact your administrator for more information.</p>`,
      `<button class="btn primary sm">Close</button>`)
  }
};
const ONLY = (process.env.ONLY || "final").split(",");

const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
setTimeout(() => { console.error("WATCHDOG: 180s elapsed, aborting"); process.exit(3); }, 180000);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, [path.join(ROOT, "_tools/serve.js"), String(PORT)], { stdio: "ignore" });
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "noaccess-"));
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + DBG, "--window-size=1920,1080",
    "--hide-scrollbars", "--no-first-run", "--user-data-dir=" + prof, "about:blank"], { stdio: "ignore" });
  const kill = () => { try { chrome.kill(); } catch (e) {} try { server.kill(); } catch (e) {} };
  process.on("exit", kill);
  let v = null;
  for (let i = 0; i < 40 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch (e) { await sleep(250); } }
  if (!v) throw new Error("chrome did not start");
  const ws = new WebSocket(v.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map(), listeners = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else listeners.slice().forEach(l => l(m)); };
  const send = (method, params, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {}, sessionId })); });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId: S } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, S); await send("Runtime.enable", {}, S);
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, S);
  const evalJS = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }, S); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; };
  const loaded = new Promise(r => { const l = m => { if (m.method === "Page.loadEventFired" && m.sessionId === S) { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html?noaccess=${Date.now()}` }, S);
  await Promise.race([loaded, sleep(15000)]);
  await Promise.race([evalJS("document.fonts.ready.then(()=>true)"), sleep(8000)]); await sleep(900);

  const manifest = [];
  for (const key of Object.keys(OPTIONS).filter(k => ONLY.includes(k))) {
    const o = OPTIONS[key];
    const file = path.join(OUT, o.file || `noaccess-${key}.png`);
    try {
      /* mount into the shell's own modal root, as a real pop-up would be */
      await evalJS(`(function(){var old=document.getElementById('noaccess-mock');if(old)old.remove();var root=document.getElementById('modalRoot')||document.body;root.insertAdjacentHTML('beforeend',${JSON.stringify(o.html)});return true;})()`);
      await sleep(500); /* the modalIn animation is var(--dur2) = 300ms */
      const r = JSON.parse(await evalJS(`(function(){var m=document.querySelector('#noaccess-mock .modal');var b=m.getBoundingClientRect();return JSON.stringify({x:b.left,y:b.top,w:b.width,h:b.height,fontOk:document.fonts.check('24px "Material Symbols Rounded"')});})()`));
      const M = 28; /* a margin of backdrop around the modal, so it reads as a pop-up */
      const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, r.x - M), y: Math.max(0, r.y - M), width: r.w + 2 * M, height: r.h + 2 * M, scale: 1 } }, S);
      fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
      manifest.push({ key, name: o.name, ok: true, size: `${Math.round(r.w)}x${Math.round(r.h)}`, iconFont: r.fontOk });
      log("saved", path.basename(file), `${Math.round(r.w)}x${Math.round(r.h)}`, r.fontOk ? "" : "(icon font not loaded: the lock renders as text)");
    } catch (e) {
      manifest.push({ key, name: o.name, ok: false, error: e.message }); console.error("FAILED", key, e.message); process.exitCode = 1;
    }
  }
  console.log("\nMANIFEST");
  manifest.forEach(m => console.log((m.ok ? "  ok   " : "  FAIL ") + m.key + "  " + m.name + "  " + (m.ok ? m.size + (m.iconFont ? "" : "  ICON FONT MISSING") : m.error)));
  kill(); process.exit(process.exitCode || 0);
})().catch(e => { console.error("FAILED", e); process.exit(1); });
