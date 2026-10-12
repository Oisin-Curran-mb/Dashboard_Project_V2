/* Alerts & Actions design mocks: shared data (12 Oct 2026).
   The Copy widget's seven groups and twenty items, restated under the proposed rule:
   half = "act"  -> Needs your action (the user can approve, pay or post)
   half = "alert" -> Alerts (a threshold was crossed; the user reviews in the module)
   Tones follow the semantic chip tokens: negative, attention, brand, severe, neutral. */
var MOCK = (function () {
  var groups = [
    { id: "pay", half: "act", module: "ap", moduleName: "Accounts Payable", title: "Overdue Payables",
      summary: "3 invoices past due, $24,350", instruction: "Pay 3 overdue invoices, $24,350",
      sev: "Needs your action: payment overdue",
      open: "Open in Accounts Payable", act: "Process payment", dest: "Accounts Payable > Payment Processing, invoice selected",
      items: [
        { label: "Acme Audio LLC", meta: "INV-2024-4421 · AVID Pay · $12,400", amount: 12400, age: 22, chip: "Overdue 22d", tone: "negative",
          next: "Pay this invoice in Payment Processing; it is 22 days past due.",
          facts: [["Payment type", "AVID Pay"], ["Invoice", "INV-2024-4421"], ["Amount", "$12,400", 1], ["Due date", "Aug 4, 2026"], ["Days overdue", "22 days", 1]] },
        { label: "City Building Services", meta: "INV-2024-4398 · ACH · $8,750", amount: 8750, age: 16, chip: "Overdue 16d", tone: "negative",
          next: "Confirm the ACH authorisation and pay; 16 days past due.",
          facts: [["Payment type", "ACH"], ["Invoice", "INV-2024-4398"], ["Amount", "$8,750", 1], ["Due date", "Aug 10, 2026"], ["Days overdue", "16 days", 1]] },
        { label: "Grace Print & Design", meta: "INV-2024-4410 · EFT · $3,200", amount: 3200, age: 9, chip: "Overdue 9d", tone: "negative",
          next: "Schedule the EFT transfer; 9 days past due.",
          facts: [["Payment type", "EFT"], ["Invoice", "INV-2024-4410"], ["Amount", "$3,200", 1], ["Due date", "Aug 17, 2026"], ["Days overdue", "9 days", 1]] }
      ] },
    { id: "po", half: "act", module: "purchasing", moduleName: "Purchasing Management", title: "Purchase Approvals",
      summary: "2 requests waiting on you, oldest 8 business days", instruction: "Approve or reject 2 purchase requests, $24,700",
      sev: "Needs your action: approval waiting",
      open: "Open request", act: "Approve", reject: "Reject", dest: "Purchasing Management > Requests > Update",
      items: [
        { label: "Riverside AV Solutions", meta: "INV-2024-4433 · $18,500 · requested by David Chen", amount: 18500, age: 8, chip: "8 business days", tone: "attention", chip2: "Your turn",
          next: "Approve or reject; waiting on you 8 business days.",
          facts: [["Invoice no.", "INV-2024-4433"], ["Invoice date", "Aug 14, 2026"], ["Vendor", "Riverside AV Solutions"], ["Requested by", "David Chen"], ["Fund", "General Fund, Worship"], ["Total", "$18,500", 1]],
          lines: [["Audio System Upgrade, Main Sanctuary", "1 unit", "$12,500"], ["Wireless Microphone Set (8-pack)", "2 sets", "$3,600"], ["Installation & Configuration", "1 service", "$2,400"]],
          trail: [["Submitted", "David Chen · Aug 14, 2026", 1], ["Finance pre-check", "Automated · Aug 15, 2026", 1], ["Department head approval", "Sarah J. · waiting 8 business days", 0]] },
        { label: "Office Depot", meta: "PO-2024-0891 · $6,200 · requested by Lisa Park", amount: 6200, age: 6, chip: "6 business days", tone: "attention", chip2: "Your turn",
          next: "Approve or reject; waiting on you 6 business days.",
          facts: [["PO no.", "PO-2024-0891"], ["PO date", "Aug 20, 2026"], ["Vendor", "Office Depot"], ["Requested by", "Lisa Park"], ["Fund", "General Fund, Admin"], ["Total", "$6,200", 1]],
          lines: [["Office Furniture, Standing Desks (4)", "4 units", "$3,800"], ["Ergonomic Chair Set", "4 units", "$1,800"], ["Delivery & Assembly", "1 service", "$600"]],
          trail: [["Submitted", "Lisa Park · Aug 20, 2026", 1], ["Finance pre-check", "Automated · Aug 21, 2026", 1], ["Department head approval", "Michael R. · waiting 6 business days", 0]] }
      ] },
    { id: "je", half: "act", module: "gl", moduleName: "General Ledger", title: "Unposted Journals",
      summary: "5 journals awaiting posting, $42,800, oldest 12 days", instruction: "Post 5 journals, $42,800",
      sev: "Needs your action: journal unposted",
      open: "Open journal", act: "", dest: "General Ledger > journal entry",
      items: [
        { label: "Payroll allocation", meta: "JE-2024-1041 · $18,400 · prepared by Finance Team", amount: 18400, age: 12, chip: "12 days", tone: "attention", next: "Open the journal and post or void it; pending 12 days.", facts: [["Journal no.", "JE-2024-1041"], ["Type", "Payroll allocation"], ["Amount", "$18,400"], ["Days pending", "12 days", 1], ["Prepared by", "Finance Team"]] },
        { label: "Depreciation", meta: "JE-2024-1055 · $9,200 · prepared by Finance Team", amount: 9200, age: 9, chip: "9 days", tone: "attention", next: "Open the journal and post or void it; pending 9 days.", facts: [["Journal no.", "JE-2024-1055"], ["Type", "Depreciation"], ["Amount", "$9,200"], ["Days pending", "9 days", 1], ["Prepared by", "Finance Team"]] },
        { label: "Accrued expenses", meta: "JE-2024-1062 · $7,600 · prepared by Finance Team", amount: 7600, age: 7, chip: "7 days", tone: "attention", next: "Open the journal and post or void it; pending 7 days.", facts: [["Journal no.", "JE-2024-1062"], ["Type", "Accrued expenses"], ["Amount", "$7,600"], ["Days pending", "7 days", 1], ["Prepared by", "Finance Team"]] },
        { label: "Prepaid amortisation", meta: "JE-2024-1078 · $4,300 · prepared by Finance Team", amount: 4300, age: 4, chip: "4 days", tone: "neutral", next: "Open the journal and post it; pending 4 days.", facts: [["Journal no.", "JE-2024-1078"], ["Type", "Prepaid amortisation"], ["Amount", "$4,300"], ["Days pending", "4 days"], ["Prepared by", "Finance Team"]] },
        { label: "Intercompany transfer", meta: "JE-2024-1084 · $3,300 · prepared by Finance Team", amount: 3300, age: 2, chip: "2 days", tone: "neutral", next: "Open the journal and post it; pending 2 days.", facts: [["Journal no.", "JE-2024-1084"], ["Type", "Intercompany transfer"], ["Amount", "$3,300"], ["Days pending", "2 days"], ["Prepared by", "Finance Team"]] }
      ] },
    { id: "fund", half: "alert", module: "budget", moduleName: "Budget Compared to Actual", title: "Restricted Fund Over Income",
      summary: "1 fund has spent $35,200 more than it received", instruction: "Review 1 restricted fund over its income by $35,200",
      sev: "Alert: restricted fund over income",
      open: "Open fund summary", act: "", dest: "Designated Fund Summary report, Missions Fund",
      items: [
        { label: "Missions Fund", meta: "spent $133,400 of $98,200 received", amount: 35200, age: 0, chip: "136% of income", tone: "severe",
          next: "Review the fund summary; board notification may be required under the gift acceptance policy.",
          facts: [["Fund", "Missions Restricted Fund"], ["YTD expenditure", "$133,400", 1], ["Income received", "$98,200"], ["Over income by", "$35,200 (136% of income)", 1], ["First detected", "Today, Aug 26, 2026"]] }
      ] },
    { id: "bank", half: "alert", module: "bank", moduleName: "Bank Accounts", title: "Unreconciled Bank Accounts",
      summary: "1 account past the 30-day threshold", instruction: "Reconcile 1 account past the 30-day threshold",
      sev: "Alert: reconciliation overdue",
      open: "Start reconciliation", act: "", dest: "Bank Accounts > Reconciliation, Payroll Checking",
      items: [
        { label: "Payroll Checking ··3355", meta: "last reconciled Jul 26, 2026", amount: 0, age: 31, chip: "31 days", tone: "attention",
          next: "Start the reconciliation for this account; the 30-day threshold passed yesterday.",
          facts: [["Account", "Payroll Checking ··3355"], ["Last reconciled", "Jul 26, 2026"], ["Days unreconciled", "31 days", 1], ["Threshold", "30 days"]] }
      ] },
    { id: "budget", half: "alert", module: "budget", moduleName: "Budget Compared to Actual", title: "Budget Exceeded",
      summary: "1 department over its annual budget by $7,300", instruction: "Review 1 department over budget by $7,300",
      sev: "Alert: over budget",
      open: "Open budget report", act: "", dest: "Budgeted Financial Statement, Worship Arts",
      items: [
        { label: "Worship Arts", meta: "$67,800 spent of $60,500 budget", amount: 7300, age: 0, chip: "112% of budget", tone: "attention",
          next: "Review the department's budget statement by account.",
          facts: [["Department", "Worship Arts"], ["Actual YTD", "$67,800", 1], ["Annual budget", "$60,500"], ["Over budget by", "$7,300 (112% of budget)", 1], ["Period", "Period 1, July"]] }
      ] },
    { id: "ar", half: "alert", module: "ar", moduleName: "Accounts Receivable", title: "Receivable Invoices Outstanding",
      summary: "7 invoices unpaid, $18,450, oldest 45 days", instruction: "Follow up 7 unpaid invoices, $18,450",
      sev: "Alert: receivable outstanding",
      open: "Open invoice", act: "", dest: "Accounts Receivable > invoice",
      items: [
        ["Riverside Community Group", "INV-AR-2024-0112", 3800, 45, "Jul 12, 2026"],
        ["Grace Preschool Program", "INV-AR-2024-0098", 6500, 38, "Jul 19, 2026"],
        ["Hillside Bible Fellowship", "INV-AR-2024-0103", 2200, 32, "Jul 25, 2026"],
        ["Westside Community Center", "INV-AR-2024-0107", 1900, 28, "Jul 29, 2026"],
        ["St. Andrew's Parish", "INV-AR-2024-0109", 1450, 22, "Aug 4, 2026"],
        ["Grace Community Ministries", "INV-AR-2024-0115", 1300, 18, "Aug 8, 2026"],
        ["Northgate Baptist Church", "INV-AR-2024-0118", 1300, 14, "Aug 12, 2026"]
      ].map(function (r) {
        return { label: r[0], meta: r[1] + " · $" + r[2].toLocaleString("en-US"), amount: r[2], age: r[3], chip: r[3] + " days", tone: r[3] > 30 ? "attention" : "neutral",
          next: r[3] > 30 ? "Send a reminder; unpaid " + r[3] + " days, past the 30-day follow-up point." : "Within terms; track for payment (" + r[3] + " days).",
          facts: [["Customer", r[0]], ["Invoice", r[1]], ["Amount", "$" + r[2].toLocaleString("en-US"), r[3] > 30 ? 1 : 0], ["Days outstanding", r[3] + " days", r[3] > 30 ? 1 : 0], ["Due date", r[4]]] };
      }) }
  ];
  groups.forEach(function (g) { g.items.forEach(function (it, i) { it.id = g.id + ":" + i; it.g = g; }); });
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function half(h) { return groups.filter(function (g) { return g.half === h; }); }
  function count(gs) { return gs.reduce(function (s, g) { return s + g.items.length; }, 0); }
  function sum(gs) { return gs.reduce(function (s, g) { return s + g.items.reduce(function (t, it) { return t + it.amount; }, 0); }, 0); }
  var ABOUT = "Items across the accounting modules that need you. Needs your action lists payments to process, purchase requests to approve and journals to post; Alerts lists funds, budgets, bank accounts and receivables that have crossed a threshold. Open a group to see each item, act on it here where you can, or open it in its module.";
  var MODULE_BADGE = { ap: "AP", purchasing: "PO", gl: "GL", budget: "Budget", bank: "Bank", ar: "AR" };
  return { groups: groups, money: money, half: half, count: count, sum: sum, ABOUT: ABOUT, MODULE_BADGE: MODULE_BADGE,
    ICON: function (n) { return '<span class="material-symbols-rounded" aria-hidden="true">' + n + '</span>'; },
    esc: function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); } };
})();
