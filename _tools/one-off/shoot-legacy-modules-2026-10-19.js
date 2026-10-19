/* Legacy module dashboards from beta1, FULL PAGE, for the V1 side of the
   Module dashboards comparison. 19 October 2026.

   Pair to shoot-modules-2026-10-19.js, which does the V2 side from index.html.

   WHY TWO MODES. The legacy site is behind a sign-in wall and I will not type
   credentials into it. So Chrome runs against a PERSISTENT profile under
   _tools/.tmp/beta1-profile:

     node ... login     opens a visible Chrome at the sign-in page. YOU sign in
                        and switch Company to the test tenant, then close it.
     node ... shoot     runs headless against that same profile, so the session
                        is already there, and captures each module.

   The credentials never reach this script, this session or the repo. The
   profile holds the cookie; it is under _tools/.tmp, which is git-ignored.

   USE THE TEST COMPANY. docs/Pics/Permissions/*.png were taken on
   renmore_test1 / "1 Test Company 92" / "10050 Test Bank", which is why they
   were safe to publish. This repo is PUBLIC and served on GitHub Pages, so the
   same applies here: shoot captures the company name on every page and ABORTS
   if it sees anything other than the test company, rather than quietly
   publishing a real church's bank accounts and balances.

   Output: docs/Pics/Modules/<Module>/<Module> - V1.png, which is where the
   Dashboards view and the review document already point.
*/
"use strict";
const { spawn } = require("child_process"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", ".."), DBG = Number(process.env.DBG || 9341);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
/* test1 is the environment docs/Pics/Permissions was taken on (owner, 19 Oct);
   HOST= overrides it. The profile folder is named by host so a beta1 session
   and a test1 session never get mixed up. */
const HOST = (process.env.HOST || "https://95301.accounting.test1.myamplify.io").replace(/\/+$/, "");
const PROFILE = path.join(ROOT, "_tools/.tmp", HOST.replace(/^https?:\/\//, "").replace(/[^a-z0-9.]+/gi, "_") + "-profile");
const OUTDIR = path.join(ROOT, "docs/Pics/Modules");

/* the company this is allowed to publish. Anything else aborts. */
const ALLOWED_COMPANY = /test company/i;

/* module path -> the folder name the document already uses.
   "" is the root: https://[env]myamplify.io/ is the home dashboard, the page
   every module root routes to when a user has no module context (owner,
   19 Oct: "main dashboard or as home dashboard"). */
const MODULES = [
  ["", "Home"],
  ["AccountsPayable", "Accounts Payable"],
  ["AccountsReceivable", "Accounts Receivable"],
  ["BankAccountManagement", "Bank Account Management"],
  ["DepositsOnHand", "Deposits On Hand"],
  ["DonorsAndGifts", "Donors And Gifts"],
  ["FixedAssets", "Fixed Assets"],
  ["GeneralLedger", "General Ledger"],
  ["InsuranceBilling", "Insurance Billing"],
  ["LoanProcessing", "Loan Processing"],
  ["Payroll", "Payroll"],
  ["PensionBilling", "Pension Billing"],
  ["PurchasingManagement", "Purchasing Management"],
  ["Records", "Records"],
  ["Remittance", "Remittance"]
  /* Statistics is left out: it redirects to the root on this tenant, so there
     is no Statistics dashboard to photograph. */
];

const MODE = (process.argv[2] || "").toLowerCase();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

if (MODE === "login") {
  fs.mkdirSync(PROFILE, { recursive: true });
  console.log("Opening Chrome on the " + HOST.replace(/^https?:\/\//, "") + " sign-in page, with its own profile at");
  console.log("  " + PROFILE);
  console.log("");
  console.log("  1. Sign in yourself. This script never sees the credentials.");
  console.log("  2. Switch Company to the TEST company (\"1 Test Company 92\"),");
  console.log("     the one docs/Pics/Permissions was taken on. The shoot step");
  console.log("     refuses to save anything from a real company.");
  console.log("  3. Close the window, then run:  node " + path.relative(ROOT, __filename).replace(/\\/g, "/") + " shoot");
  console.log("");
  /* Opened WITH the debugging port, so the shoot step can attach to this very
     window while it is still open instead of needing it closed first. Chrome
     refuses a second instance on the same profile, which is what "chrome did
     not start" meant the first time round. */
  const c = spawn(CHROME, ["--user-data-dir=" + PROFILE, "--remote-debugging-port=" + DBG, "--no-first-run", "--new-window", HOST + "/AccountsPayable"],
    { stdio: "ignore", detached: true });
  c.unref();
  process.exit(0);
}

if (MODE !== "shoot") {
  console.error("usage: node _tools/one-off/shoot-legacy-modules-2026-10-19.js login|shoot");
  process.exit(2);
}

if (!fs.existsSync(PROFILE)) {
  console.error("No profile at " + PROFILE + "\nRun the login step first.");
  process.exit(2);
}

setTimeout(() => { console.error("WATCHDOG: 600s elapsed, aborting"); process.exit(3); }, 600000);

(async () => {
  /* Attach to the sign-in window if it is still open on the debugging port;
     otherwise launch headless on the same profile. Either way the session is
     the one the owner created, and this script never saw a credential. */
  let v = null, chrome = null;
  try { v = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch (e) {}
  if (v) log("attached to the open sign-in window");
  else {
    chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + DBG, "--window-size=1920,1080",
      "--hide-scrollbars", "--no-first-run", "--user-data-dir=" + PROFILE, "about:blank"], { stdio: "ignore" });
    for (let i = 0; i < 40 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${DBG}/json/version`)).json(); } catch (e) { await sleep(250); } }
    if (!v) throw new Error("chrome did not start: if the sign-in window from an earlier login step is still open, close it and run shoot again, or re-run login (it now opens with the debugging port so shoot can attach to it)");
  }
  const kill = () => { if (chrome) { try { chrome.kill(); } catch (e) {} } };
  process.on("exit", kill);
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
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };
  const goto = async (url) => {
    const loaded = new Promise(r => { const l = m => { if (m.method === "Page.loadEventFired" && m.sessionId === S) { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
    await send("Page.navigate", { url }, S); await Promise.race([loaded, sleep(20000)]);
    await Promise.race([evalJS("document.fonts.ready.then(()=>true)"), sleep(8000)]);
    await sleep(1400); /* the panels fetch their own data after load */
  };

  /* the page's own report of where we are: signed in, which company, which
     panels are in the two slots */
  const STATE = `(function(){
    var ctx={};
    [].slice.call(document.querySelectorAll('*')).some(function(e){
      if(/^Company$/i.test((e.textContent||'').trim()) && e.children.length===0){
        var sib=e.parentElement && e.parentElement.textContent || '';
        ctx.company=sib.replace(/\\s+/g,' ').replace(/^\\s*Company\\s*/i,'').trim().slice(0,60);
        return true;
      }
      return false;
    });
    var slots=[].slice.call(document.querySelectorAll('.data-panel-body')).map(function(s){
      var a=s.querySelector('.data-panel-header a.data-panel-choose');
      return a?a.textContent.trim():'(empty slot)';
    });
    return JSON.stringify({url:location.href, loginWall:/login\\.aspx/i.test(location.href),
      company:ctx.company||null, slots:slots});
  })()`;

  const manifest = [];
  let aborted = false;
  for (const [urlPath, folder] of MODULES) {
    if (aborted) break;
    try {
      await goto(`${HOST}/${urlPath}`);
      const st = JSON.parse(await evalJS(STATE));

      if (st.loginWall) throw new Error("not signed in: the profile has no session. Run the login step again.");
      if (!st.company) throw new Error("could not read the Company from the page; refusing to save blind");
      if (!ALLOWED_COMPANY.test(st.company)) {
        console.error("\nABORTING. The session is on company " + JSON.stringify(st.company) + ".");
        console.error("This repo is public and served on GitHub Pages, so only the test company");
        console.error("may be captured. Run the login step, switch Company to \"1 Test Company 92\",");
        console.error("then shoot again. Nothing has been written.");
        aborted = true; process.exitCode = 1; break;
      }

      const dir = path.join(OUTDIR, folder);
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${folder} - V1.png`);

      const m = JSON.parse(await evalJS(`(function(){var d=document.documentElement;return JSON.stringify({w:Math.max(d.scrollWidth,1920),h:Math.max(d.scrollHeight,1080)});})()`));
      const shot = await send("Page.captureScreenshot", {
        format: "png", captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: m.w, height: m.h, scale: 1 }
      }, S);
      fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
      manifest.push({ folder, ok: true, size: `${m.w}x${m.h}`, slots: st.slots.join(" + "), company: st.company });
      log("saved", `${folder} - V1.png`, `${m.w}x${m.h}`, "[" + st.slots.join(" + ") + "]");
    } catch (e) {
      manifest.push({ folder, ok: false, error: e.message });
      console.error("FAILED", folder, "->", e.message);
      process.exitCode = 1;
    }
  }

  console.log("\nMANIFEST");
  manifest.forEach(m => console.log(
    (m.ok ? "  ok   " : "  FAIL ") + (m.folder + "                        ").slice(0, 26) +
    (m.ok ? m.size + "  " + m.slots : m.error)));
  if (manifest.length && manifest[0].ok) console.log("\ncompany: " + manifest[0].company);

  /* The Dashboards view and the review document read this, so what each
     module's page actually showed goes into them from the capture itself
     rather than being typed in by hand. Only successful captures are
     recorded; a module that failed is simply absent and the view says so. */
  if (!aborted) {
    const out = {};
    manifest.filter(m => m.ok).forEach(m => {
      out[m.folder] = { slots: m.slots.split(" + "), company: m.company, host: HOST.replace(/^https?:\/\//, ""), size: m.size, taken: new Date().toISOString().slice(0, 10) };
    });
    fs.writeFileSync(path.join(OUTDIR, "legacy-manifest.json"), JSON.stringify(out, null, 1) + "\n");
    log("wrote legacy-manifest.json for " + Object.keys(out).length + " module(s)");
  }
  kill(); process.exit(process.exitCode || 0);
})().catch(e => { console.error("FAILED", e); process.exit(1); });
