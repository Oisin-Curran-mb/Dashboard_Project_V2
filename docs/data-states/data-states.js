/* =====================================================================
   Data states for the "For developers only" selector (review aid, not product).
   Prepared 16 Oct 2026, see docs/DATA-STATES.md. Standalone: no shell dependencies.

   DATA_STATES.get(state, kind) -> the fixture for that state in the widget's own
   record shape ("small" and "extreme"), memoised. NOTCONF_COPY -> suggested Not configured
   copy per kind, for the widgets' own empty states; the shell does not draw it (owner, 16 Oct 2026:
   the selector changes only the data a widget receives). Generators are seeded so every run is identical.
   ===================================================================== */
"use strict";
var DATA_STATES = (function () {
  /* ---- seeded random ------------------------------------------------- */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function money(r, lo, hi, cents) { var v = lo + r() * (hi - lo); return cents === false ? Math.round(v) : Math.round(v * 100) / 100; }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function pad(n, w) { return String(n).padStart(w, "0"); }

  /* ---- name pools ---------------------------------------------------- */
  var FIRST = ["Dana", "Marcus", "Rosa", "Thomas", "Grace", "Patrick", "Elena", "Derek", "Maureen", "Anil", "Latoya", "Greg", "Carmen", "Susan", "Kwame", "Erik", "Beatriz", "Sean", "Cheryl", "Malcolm", "Wei", "Kathleen", "Wesley", "Fatima", "Janusz", "Miguel", "Gloria", "Aaron", "Rico", "Harriet"];
  var LAST = ["Whitfield", "Bell", "Alvarez", "Nguyen", "Okafor", "Sullivan", "Ramirez", "Coleman", "Fitzgerald", "Patel", "Brooks", "Hoffman", "Delgado", "Whitaker", "Osei", "Lindqvist", "Montoya", "Callahan", "Freeman", "Barrett", "Zhang", "Donovan", "Pruitt", "Amara", "Kowalski", "Reyes", "Stanton", "Mercer", "Villanueva", "Boone"];
  var VENDOR_A = ["Acme", "Grainger", "Summit", "Lakeside", "Guardian", "Cornerstone", "Harmony", "Faithful", "City", "Riverside", "Northstar", "Pinnacle", "Heritage", "Meridian", "Beacon", "Evergreen", "Granite", "Horizon", "Keystone", "Liberty"];
  var VENDOR_B = ["Paper Supply", "Industrial", "HVAC Services", "Print & Mail", "Insurance", "Landscaping", "Music Licensing", "Cleaning Co.", "Water & Power", "Office Products", "Technology", "Facilities", "Catering", "Security", "Audio Visual", "Plumbing", "Electrical", "Roofing", "Transport", "Consulting"];
  var CHURCH_A = ["Grace", "Hope", "St. Paul", "Riverside", "Northside", "Trinity", "Bethel", "Calvary", "Emmanuel", "Faith", "First", "Cornerstone", "New Life", "Redeemer", "Christ", "Good Shepherd", "Covenant", "Harvest", "Living Water", "Mount Zion"];
  var CHURCH_B = ["Community Church", "UMC", "Fellowship", "Chapel", "Baptist Church", "Lutheran Church", "Presbyterian Church", "Methodist Church", "Bible Church", "Christian Center"];
  var LONG_NAME = "Cleaning Services of Greater Springfield and Surrounding Counties Inc";
  var DEPTS = ["Finance", "Admin", "Ministry", "Facilities", "IT", "Worship", "Youth", "Children", "Missions", "Office", "Communications", "Kitchen"];
  function person(r) { return pick(r, LAST) + ", " + pick(r, FIRST); }
  function personFirstLast(r) { return pick(r, FIRST) + " " + pick(r, LAST); }
  function vendor(r, i) { return (i === 7) ? LONG_NAME : pick(r, VENDOR_A) + " " + pick(r, VENDOR_B); }
  function church(r, i) { return (i === 5) ? "First United Methodist Church of Greater Springfield and Outlying Districts" : pick(r, CHURCH_A) + " " + pick(r, CHURCH_B); }

  /* ---- generators, one per kind: small and extreme ------------------- */
  var G = {};

  /* Budget Compared to Actual: BGT_REPORTS shape. rows = 12 {period,budget,actual|null}, 7 actuals. */
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function bgtRows(r, base, spread) { var out = []; for (var i = 0; i < 12; i++) { var b = Math.round(base * (1 + (r() - 0.5) * spread)); out.push({ period: MON[i], budget: b, actual: i < 7 ? Math.round(b * (0.8 + r() * 0.4)) : null }); } return out; }
  G.budget = {
    small: function () { var r = rng(101); return [{ id: "stmt-act", name: "Statement of Activities", lines: [
      { id: "contrib", name: "Contributions & offerings", type: "income", rows: bgtRows(r, 42000, 0.1) },
      { id: "salaries", name: "Salaries & wages", type: "expense", rows: bgtRows(r, 26000, 0.05) }] }]; },
    extreme: function () { var r = rng(102), reps = []; for (var k = 0; k < 12; k++) { var lines = []; for (var i = 0; i < 60; i++) { var inc = i % 3 === 0; lines.push({ id: "l" + k + "-" + i, name: (inc ? "Income line " : "Expense line ") + (i + 1) + (i === 11 ? " with an unusually long account description that will not fit" : ""), type: inc ? "income" : (i % 7 === 0 ? "mixed" : "expense"), rows: bgtRows(r, inc ? 5000 + r() * 400000 : 2000 + r() * 250000, 0.3) }); } reps.push({ id: "rep" + k, name: "Report " + (k + 1) + (k === 0 ? ": Statement of Activities" : ""), lines: lines }); } return reps; }
  };

  /* Pension Plans: PENO_APPTS {name, org, dist, plan, amt}. */
  var PLANS = ["Employee Before Tax-UMPIP", "Employee After Tax-UMPIP", "Clergy Retirement Security Program", "Comprehensive Protection Plan", "Horizon 403(b)", "Pastor's Pension Supplement"];
  G.pension = {
    small: function () { return [{ name: "Rev. Jonathan Pierce", org: "St. Paul UMC", dist: "District 1", plan: PLANS[0], amt: 12000.00 }, { name: "Rev. Naomi Adler", org: "Hope UMC", dist: "District 1", plan: PLANS[2], amt: 6000.00 }]; },
    extreme: function () { var r = rng(201), out = []; for (var i = 0; i < 3000; i++) out.push({ name: "Rev. " + personFirstLast(r), org: church(r, i % 400), dist: "District " + (1 + i % 24), plan: pick(r, PLANS), amt: money(r, 240, 48000) }); return out; }
  };

  /* Payroll Distributions: PRO_DISTS {id,name} and PRO_BASE {distId: {payType: amount}} (the block's seeded run generator scales from these). */
  var PAY_TYPES = ["reg", "ot", "hol", "vac", "sick", "housing", "ss", "med"];
  G.payroll = {
    small: function () { return { dists: [{ id: "admin", name: "Administration Staff" }], base: { admin: { reg: 4200, vac: 400 } }, payTypes: [{ id: "reg", name: "Regular Pay" }, { id: "vac", name: "Vacation" }] }; },
    extreme: function () { var r = rng(301), dists = [], base = {}; for (var i = 0; i < 60; i++) { var id = "d" + i; dists.push({ id: id, name: (i === 9 ? "Department of Community Outreach, Hospitality and Volunteer Coordination" : pick(r, DEPTS) + " " + (i + 1)) }); var b = {}; PAY_TYPES.forEach(function (p) { if (r() < 0.7) b[p] = money(r, 40, 9000, false); }); base[id] = b; } return { dists: dists, base: base, payTypes: PAY_TYPES.map(function (p) { return { id: p, name: p.charAt(0).toUpperCase() + p.slice(1) }; }) }; }
  };

  /* Remittance Pledges: REMO_ACTIVITIES {seq,name,ref,total,begin,end,freq,dur,payments[{date,ref,amount}]} and REMO_CHURCHES (names). */
  G.remittance = {
    small: function () { return { activities: [{ seq: 1, name: "General Fund Apportionment", ref: "Conference remittance, monthly", total: 24000, begin: "2026-01-01", end: "2026-12-31", freq: 12, dur: 12, payments: [{ date: "2026-01-15", ref: "Check 4102", amount: 2400 }] }], churches: ["Whitfield, Dana", "Bell, Marcus"] }; },
    extreme: function () { var r = rng(401), acts = [], ch = []; for (var i = 0; i < 240; i++) { var freq = pick(r, [1, 4, 12, 26, 52]), total = money(r, 500, 900000, false), pays = [], n = Math.floor(r() * 10); for (var k = 0; k < n; k++) pays.push({ date: iso(addDays(new Date(2026, 0, 1), Math.floor(r() * 220))), ref: pick(r, ["ACH", "Check " + (4000 + Math.floor(r() * 900)), "EFT"]), amount: money(r, 10, total / 4) }); acts.push({ seq: i + 1, name: "Activity " + (i + 1) + (i === 3 ? ": Conference-wide capital apportionment for the regional camp and retreat centre" : ""), ref: "Conference remittance", total: total, begin: "2026-01-01", end: "2026-12-31", freq: freq, dur: freq, payments: pays }); } for (var j = 0; j < 400; j++) ch.push(person(r)); return { activities: acts, churches: ch }; }
  };

  /* Receivable Invoices Outstanding: ARO_INV {inv,customer,billTo,due,days,amount,rc,source,lines[],attachments[],note,payments[]}. */
  G.receivables = {
    small: function () { return [{ inv: "INV-3001", customer: "Northside Community Church", billTo: "Northside Community Church", due: "2026-07-18", days: 5, amount: 1250, rc: "Church", source: "", lines: [{ desc: "Facility use, June", qty: 1, unit: 1250 }], attachments: [], note: "", payments: [] }]; },
    extreme: function () { var r = rng(501), out = [], today = new Date(2026, 6, 23); for (var i = 0; i < 4000; i++) { var days = Math.floor(r() * 400) - 200, due = addDays(today, -days), amt = money(r, 5, 250000), cust = church(r, i % 600); out.push({ inv: "INV-" + pad(100000 + i, 6), customer: cust, billTo: cust, due: iso(due), days: days, amount: amt, rc: pick(r, ["Church", "School", "Camp", "Individual", "Agency"]), source: "", lines: [{ desc: "Services", qty: 1, unit: amt }], attachments: i % 9 === 0 ? [{ name: "INV-" + pad(100000 + i, 6) + ".pdf", size: Math.floor(40 + r() * 300) + " KB" }] : [], note: "", payments: [] }); } return out; }
  };

  /* Insurance Billing Plans: INSO_PLANS {plan,type,enroll,rate}. */
  var INS_TYPES = ["Medical", "Dental", "Vision", "Property", "Life", "Disability", "Liability", "Auto", "Workers Comp"];
  G.insurance = {
    small: function () { return [{ plan: "Medical Base", type: "Medical", enroll: 128, rate: 450 }]; },
    extreme: function () { var r = rng(601), out = []; for (var i = 0; i < 80; i++) out.push({ plan: (i === 4 ? "Comprehensive Medical Buy-Up Plan for Clergy and Lay Employees" : pick(r, ["Base", "Buy Up", "Plus", "Standard", "Premier", "Family", "Single"]) + " " + (i + 1)), type: INS_TYPES[i % INS_TYPES.length], enroll: r() < 0.1 ? 0 : Math.floor(r() * 2500), rate: money(r, 0, 1800) }); return out; }
  };

  /* Deposits on Hand: the block has DEP_BIG already (extreme). Small = two accounts in the DEP shape; copy the first two records of DEP when wiring. */
  G.deposits = { small: null, extreme: null };

  /* Payroll Scheduled Time Off: PTOF_GROUPS {pg, people[{name,dept,entries[{type,d,dEnd?,mo?,hours,st,appBy?,appDate?}]}]}. */
  var LEAVE = ["Vacation", "Sick", "Personal", "Bereavement", "Jury duty"];
  G.pto = {
    small: function () { return [{ pg: "Weekly Staff", people: [{ name: "Dana Whitfield", dept: "Finance", entries: [{ type: "Vacation", d: 12, dEnd: 14, hours: 24, st: "Pending" }] }] }]; },
    extreme: function () { var r = rng(701), out = []; for (var g = 0; g < 40; g++) { var people = []; for (var p = 0; p < 15; p++) { var entries = [], n = 1 + Math.floor(r() * 14); for (var e = 0; e < n; e++) { var approved = r() < 0.6, d = 1 + Math.floor(r() * 28), span = r() < 0.3 ? Math.floor(r() * 4) : 0, ent = { type: pick(r, LEAVE), d: d, hours: span ? 8 * (span + 1) : pick(r, [4, 8]), st: approved ? "Approved" : "Pending" }; if (span) ent.dEnd = Math.min(28, d + span); if (r() < 0.5) ent.mo = Math.floor(r() * 12); if (approved) { ent.appBy = "M. Reyes"; ent.appDate = MON[ent.mo || 7] + " " + d; } entries.push(ent); } people.push({ name: personFirstLast(r), dept: pick(r, DEPTS), entries: entries }); } out.push({ pg: (g === 2 ? "Hourly Part-Time Seasonal Staff and Contracted Musicians" : pick(r, ["Weekly", "Biweekly", "Semi-monthly", "Monthly"]) + " Staff " + (g + 1)), people: people }); } return out; }
  };

  /* Loans With Balance Due: LONF_LOANS {acct,name,type,orig,amount,days,lastPay,nextDue,payments[{date,method,amount}]}. */
  var LOAN_TYPES = ["Church Expansion", "Parsonage", "Vehicle", "Equipment", "Renovation", "Land", "School", "Camp", "Refinance", "Emergency", "Technology", "Energy"];
  G.loans = {
    small: function () { return [{ acct: "LN-1042", name: "Grace Fellowship", type: "Church Expansion", orig: 150000, amount: 28450.00, days: -8, lastPay: "2026-07-08", nextDue: "2026-08-01", payments: [{ date: "2026-07-08", method: "ACH", amount: 2100.00 }] }]; },
    extreme: function () { var r = rng(801), out = [], today = new Date(2026, 6, 24); for (var i = 0; i < 800; i++) { var days = Math.floor(r() * 300) - 60, orig = money(r, 2000, 5000000, false), pays = [], n = Math.floor(r() * 6); for (var k = 0; k < n; k++) pays.push({ date: iso(addDays(today, -30 * (k + 1))), method: pick(r, ["ACH", "Check", "EFT", "Cash"]), amount: money(r, 50, orig / 60) }); out.push({ acct: "LN-" + pad(1000 + i, 5), name: church(r, i % 400), type: LOAN_TYPES[i % LOAN_TYPES.length], orig: orig, amount: money(r, 1, orig / 3), days: days, lastPay: iso(addDays(today, -Math.floor(r() * 400))), nextDue: iso(addDays(today, Math.floor(r() * 60) - 30)), payments: pays }); } return out; }
  };

  /* Fixed Asset Values: FAF_ASSETS {tag,nm,cls,bldg,room,cap,cost,salv,dep}. */
  var ASSET_CLS = ["Audio Visual", "Buildings", "Land", "Vehicles", "Furniture", "Computers", "Kitchen", "Playground", "HVAC", "Musical Instruments"];
  G.fixedassets = {
    small: function () { return [{ tag: "FA-1001", nm: "Sanctuary Sound System", cls: "Audio Visual", bldg: "", room: "Media Room", cap: 111719, cost: 118850, salv: 4754, dep: 114096 }]; },
    extreme: function () { var r = rng(901), out = []; for (var i = 0; i < 5000; i++) { var cost = money(r, 50, 12000000, false), salv = Math.round(cost * r() * 0.1), cap = cost - Math.round(cost * r() * 0.08); out.push({ tag: "FA-" + pad(10000 + i, 5), nm: (i === 20 ? "Replacement roof membrane, flashing and drainage for the fellowship hall and education wing" : pick(r, ["Projector", "Van", "Organ", "Chairs", "Server", "Oven", "Boiler", "Piano", "Sign", "Fence"]) + " " + (i + 1)), cls: ASSET_CLS[i % 40 % ASSET_CLS.length] + (i % 40 >= 10 ? " " + Math.floor(i % 40 / 10 + 1) : ""), bldg: i % 3 === 0 ? "" : "Building " + (1 + i % 30), room: i % 4 === 0 ? "" : "Room " + (1 + i % 90), cap: cap, cost: cost, salv: salv, dep: Math.min(cap - salv, Math.round((cap - salv) * r())) }); } return out; }
  };

  /* Purchasing Management: PURF_POS {ref,vendor,dept,amt,issued,due,path,fy,stage,appr[],log[],att[]}. Paths are the four shipped in PURF_PATHS. */
  var PATHS = ["Administration", "Education Ministry", "Everyone", "QA Path"];
  G.purchasing = {
    small: function () { return [{ ref: "PO-2893", vendor: "Acme Paper Supply", dept: "Finance", amt: 245, issued: "2026-07-02", due: "2026-08-01", path: "Administration", fy: "FY 2026", stage: "Pending", appr: [{ seq: 1, user: "Nitzi Wright", state: "approved", d: "2026-07-03" }], log: [], att: [] }]; },
    extreme: function () { var r = rng(1001), out = [], today = new Date(2026, 7, 19); for (var i = 0; i < 2500; i++) { var issued = addDays(today, -Math.floor(r() * 365)), pending = r() < 0.55, appr = []; if (!pending || r() < 0.3) appr.push({ seq: 1, user: "Nitzi Wright", state: r() < 0.08 ? "hold" : "approved", d: iso(addDays(issued, 1)), reason: "Checking budget" }); if (!pending) appr.push({ seq: 2, user: "Oisin Curran", state: "approved", d: iso(addDays(issued, 2)) }); out.push({ ref: "PO-" + pad(10000 + i, 5), vendor: vendor(r, i % 300), dept: pick(r, DEPTS), amt: money(r, 0.5, 980000), issued: iso(issued), due: iso(addDays(issued, 30)), path: PATHS[i % PATHS.length], fy: "FY 2026", stage: pending ? "Pending" : "Approved", pay: pending ? undefined : "unpaid", appr: appr, log: [], att: i % 5 === 0 ? [{ name: "Invoice-" + pad(i, 5) + ".pdf", label: "Invoice", kind: "pdf", size: Math.floor(30 + r() * 400) + " KB", d: iso(issued), by: "Nitzi Wright" }] : [] }); } return out; }
  };

  /* Main Content Tasks: MCT_TASKS {app,id,label,dest,icon,std,dflt,keywords[]}. */
  var APPS = ["ap", "ar", "gl", "payroll", "purchasing", "bank", "contributions", "assets"];
  G.tasks = {
    small: function () { return [{ app: "ap", id: "ap-check", label: "Write AP Check", dest: "Accounts Payable, Checks, Write Check", icon: "payments", std: true, dflt: true, keywords: ["pay", "check"] }]; },
    extreme: function () { var r = rng(1101), out = []; for (var i = 0; i < 240; i++) { var app = APPS[i % APPS.length]; out.push({ app: app, id: app + "-t" + i, label: (i === 13 ? "Reconcile the restricted fund balances against the general ledger control accounts" : pick(r, ["Enter", "Post", "Print", "Review", "Approve", "Void", "Export", "Reconcile"]) + " " + pick(r, ["invoices", "checks", "journals", "deposits", "pledges", "assets", "loans", "plans"]) + " " + (i + 1)), dest: app.toUpperCase() + ", Task " + (i + 1), icon: pick(r, ["payments", "receipt_long", "summarize", "storefront", "request_quote", "money_off"]), std: true, dflt: i % 17 === 0, keywords: ["task", app] }); } return out; }
  };

  /* My Status: MYS_QUERIES keeps its list; states change the counts. The getter returns a count overlay {id: count}. */
  G.mystatus = {
    small: function () { return { counts: function (i) { return i % 2; } }; },
    extreme: function () { var r = rng(1201); return { counts: function (i) { return 1000 + Math.floor(r() * 24000) + i; } }; }
  };

  /* Bank Balances: BANK_ACCOUNTS {id,name,type,acct,acctFull,a[6]} (a = the six monthly points the block reads). */
  G.bank = {
    small: function () { return [{ id: "bk-op", name: "Operating Checking", type: "Checking", acct: "••4021", acctFull: "0044174021", a: [380000, 210500, 1200, -142300, -21400, 39500] }]; },
    extreme: function () { var r = rng(1301), out = []; for (var i = 0; i < 150; i++) { var a = []; for (var k = 0; k < 6; k++) a.push(money(r, -2500000, 9000000, false)); var last4 = pad(Math.floor(r() * 10000), 4); out.push({ id: "bk-" + i, name: (i === 6 ? "Capital Campaign Restricted Building Fund Money Market Account" : pick(r, ["Operating", "General Fund", "Payroll", "Missions", "Building", "Youth", "Benevolence", "Reserve"]) + " " + pick(r, ["Checking", "Savings", "Money Market", "CD"]) + " " + (i + 1)), type: pick(r, ["Checking", "Savings", "Money Market", "Certificate"]), acct: "••" + last4, acctFull: "00441" + pad(Math.floor(r() * 100000), 5) + last4.slice(0, 1), a: a }); } return out; }
  };

  /* Accounts Payable By Due Date: AP_INVOICES {vendor,inv,due,amount}. */
  G.payables = {
    small: function () { return [{ vendor: "Staples", inv: "INV-0003", due: "2026-07-10", amount: 5555.00 }]; },
    extreme: function () { var r = rng(1401), out = [], today = new Date(2026, 6, 23); for (var i = 0; i < 3000; i++) out.push({ vendor: vendor(r, i % 400), inv: "INV-" + pad(i, 6), due: iso(addDays(today, Math.floor(r() * 540) - 180)), amount: money(r, 0.25, 480000) }); return out; }
  };

  /* Gifts Pledges: GPF_PURPOSES {code,name,allowPledges,pledgeTotal,pledgePaid,otherGifts,closed,allPast}; the block derives donors and gifts from these. */
  G.gifts = {
    small: function () { return [{ code: "BLDGFUND", name: "Building Fund", allowPledges: true, pledgeTotal: 250000, pledgePaid: 205000, otherGifts: 31500, closed: false, allPast: false }]; },
    extreme: function () { var r = rng(1501), out = []; for (var i = 0; i < 300; i++) { var total = r() < 0.15 ? 0 : money(r, 500, 6000000, false); out.push({ code: "P" + pad(i, 4), name: (i === 8 ? "Capital Campaign for the New Family Life Centre, Phase Two Construction" : pick(r, ["Building", "Mission", "Youth", "Organ", "Memorial", "Scholarship", "Camp", "Relief", "Music", "Outreach"]) + " " + pick(r, ["Fund", "Trip", "Appeal", "Drive", "Gifts", "Project"]) + " " + (i + 1)), allowPledges: true, pledgeTotal: total, pledgePaid: total ? money(r, 0, total * 1.1, false) : 0, otherGifts: r() < 0.3 ? 0 : money(r, 20, 400000, false), closed: r() < 0.1, allPast: r() < 0.2 }); } return out; }
  };

  /* Financial KPI: FKP_TILES {lbl,val,prev,chg,dir,fav}. */
  function kpi(inc, exp, pInc, pExp) { function t(l, v, p, favUp) { var c = p ? Math.round((v - p) / Math.abs(p) * 1000) / 10 : 0, up = v >= p; return { lbl: l, val: v, prev: p, chg: Math.abs(c) + "%", dir: up ? "up" : "down", fav: favUp ? up : !up }; } return [t("Total Income (YTD)", inc, pInc, true), t("Total Expenses (YTD)", exp, pExp, false), t("Net Income (YTD)", inc - exp, pInc - pExp, true)]; }
  G.finkpi = {
    none: function () { return kpi(0, 0, 0, 0); },
    small: function () { return kpi(1250, 980, 1100, 1010); },
    extreme: function () { return kpi(4821937642.37, 5103882190.12, 4466120093.55, 4209433117.08); }  /* negative net income, nine-figure variance */
  };

  /* Pending Actions and Alerts & Actions: {id,sev,action,title,sub,items[]} per category. */
  function cats(prefix, n, perItem, r) { var out = []; for (var i = 0; i < n; i++) { var items = []; for (var k = 0; k < perItem; k++) items.push(pick(r, ["Missions Fund", "Youth Fund", "Capital Fund", "General Fund", "Camp Fund"]) + ", $" + money(r, 100, 900000).toLocaleString("en-US", { minimumFractionDigits: 2 }) + " " + pick(r, ["over restricted income", "past due", "unposted", "awaiting approval", "out of balance"]) + " (" + Math.round(100 + r() * 60) + "%)"); out.push({ id: prefix + "-cat-" + (i + 1), sev: pick(r, ["err", "warn", "upd"]), action: r() < 0.5, title: pick(r, ["Restricted Fund Compliance", "Overdue Payables", "Unposted Transactions", "Payment Processing", "Journals Out of Balance", "Unapplied Receipts"]) + " " + (i + 1), sub: items.length + " items need attention", items: items }); } return out; }
  /* Pending Actions reads "need" categories grouped by module (ap, ar, gl); each item is a queue line. */
  function needCats(n, perItem, r) { var out = cats("pa3", n, perItem, r), groups = ["ap", "ar", "gl"]; out.forEach(function (c, i) { c.sev = "need"; c.action = true; c.group = groups[i % 3]; }); return out; }
  G.pendingactions = { small: function () { return needCats(1, 1, rng(1601)); }, extreme: function () { return needCats(40, 50, rng(1602)); } };
  G.alerts = { small: function () { return cats("al", 1, 1, rng(1701)); }, extreme: function () { return cats("al", 40, 50, rng(1702)); } };

  /* ---- memoised getter ----------------------------------------------- */
  var memo = {};
  function get(state, kind) {
    var key = state + ":" + kind;
    if (memo[key] !== undefined) return memo[key];
    var g = G[kind] && G[kind][state];
    memo[key] = (typeof g === "function") ? g() : null;
    return memo[key];
  }
  return { get: get, generators: G, kinds: Object.keys(G) };
})();

/* Not configured: suggested copy per kind (title, sub-line, the setup place to name). Not used by the shell;
   kept as the wording to offer when a widget gains its own "not set up" state. */
var NOTCONF_COPY = {
  budget: { title: "No budget set up", sub: "There is no budget for this fiscal year yet.", setup: "General Ledger, Budgets" },
  pension: { title: "No pension plans", sub: "No pension billing plans have been set up.", setup: "Pension Billing, Plans" },
  payroll: { title: "Payroll is not set up", sub: "No pay types or compensation distributions exist yet.", setup: "Payroll, Setup" },
  remittance: { title: "No remittance activities", sub: "No activities or pledges have been set up for this year.", setup: "Remittance, Activities" },
  receivables: { title: "Accounts Receivable is not set up", sub: "No customers or invoice types exist yet.", setup: "Accounts Receivable, Setup" },
  insurance: { title: "No insurance plans", sub: "No billing plans have been set up.", setup: "Insurance Billing, Plans" },
  deposits: { title: "No deposit accounts", sub: "No deposit account types have been set up.", setup: "Deposits On Hand, Setup" },
  mystatus: { title: "No queries selected", sub: "Choose the queries you want to follow.", setup: "Configure, on this widget" },
  pto: { title: "No approval departments", sub: "Your employee record has no departments to approve time off for.", setup: "Payroll, Employee Information, Can Approve Home Depts" },
  loans: { title: "Loan Processing is not set up", sub: "No loan types or loans exist yet.", setup: "Loan Processing, Setup" },
  fixedassets: { title: "No asset classes", sub: "No fixed asset classes have been set up.", setup: "Fixed Assets, Setup" },
  purchasing: { title: "No approval paths", sub: "Requests cannot be routed until an approval path exists.", setup: "Purchasing Management, Approval Paths" },
  tasks: { title: "No tasks available", sub: "Your role has no tasks in this application.", setup: "Security Setup, Task Roles" },
  bank: { title: "No bank accounts", sub: "No bank accounts have been set up.", setup: "Bank Account Management, Bank Account Information" },
  payables: { title: "Accounts Payable is not set up", sub: "No vendors or bank account for payables exist yet.", setup: "Accounts Payable, Setup" },
  gifts: { title: "No pledge purposes", sub: "No purpose allows pledges yet.", setup: "Donors and Gifts, Purposes" },
  finkpi: { title: "No fiscal year", sub: "The general ledger has no fiscal year to report on.", setup: "General Ledger, Fiscal Years" },
  pendingactions: { title: "No queues configured", sub: "No posting or approval queues are set up for this company.", setup: "each module's Setup" },
  alerts: { title: "No queues configured", sub: "No posting or approval queues are set up for this company.", setup: "each module's Setup" }
};

/* Smoke test when run under Node: node docs/data-states/data-states.js */
if (typeof module !== "undefined" && typeof require === "function" && require.main === module) {
  var kinds = DATA_STATES.kinds, bad = 0;
  kinds.forEach(function (k) {
    ["small", "extreme"].forEach(function (st) {
      var v = DATA_STATES.get(st, k), n = Array.isArray(v) ? v.length : (v && typeof v === "object" ? Object.keys(v).length : (v === null ? "null (wire from the block)" : typeof v));
      console.log(String(k + "." + st).padEnd(24), n);
      if (v === undefined) bad++;
    });
    if (!NOTCONF_COPY[k]) { console.log("missing NOTCONF_COPY for", k); bad++; }
  });
  console.log(bad ? "PROBLEMS: " + bad : "OK: every kind has small, extreme and not-configured copy");
}
