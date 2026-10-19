# Data package layer, step A13: Budget Compared to Actual (W01, prefix bgtO) renders from bgtOPackage(w).
# Default returns BGT_REPORTS and the two fiscal-year tables by reference; the row transform now switches on the
# package reason, and generated special reports (already at the state's scale) are no longer transformed twice.
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''  function bgtOReports(w){if(w&&(w.dataset==="small"||w.dataset==="extreme"))return DATA_STATES.get(w.dataset,"budget");return BGT_REPORTS;}\r
  function bgtODsRows(w,rows){\r
    if(!w||!rows)return rows;\r
    if(w.dataset==="noactuals")return rows.map(function(r){return {period:r.period,budget:r.budget,actual:null};}); /* data state "No data": a budget with nothing posted yet */\r
    if(w.dataset==="nobudget")return rows.map(function(r){return {period:r.period,budget:null,actual:null};}); /* data state "Not configured": no budget entered for the year */\r
    if(w.dataset==="small")return rows.map(function(r,i){return {period:r.period,budget:Math.max(1,Math.round(r.budget/1000)),actual:(i===0&&r.actual!=null)?Math.max(1,Math.round(r.actual/1000)):null};});\r
    if(w.dataset==="extreme")return rows.map(function(r,i){var b=Math.round(r.budget*4000*100)/100;return {period:r.period,budget:b,actual:Math.round(b*(0.78+((i*37)%41)/100)*100)/100};});\r
    return rows;}''',
'''  /* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
     reasons: no-actuals (no-data: a budget with nothing posted yet), no-budget (not-configured: nothing entered
     for the year). The fiscal-year tables and the special-report list travel in data; bgtODsRows applies the
     reason to the rows it is handed. */
  function bgtOPackage(w){
    if(w&&w.pkg)return w.pkg;
    var o=pkgOption(),base={reports:BGT_REPORTS,income:BUDGET_INCOME_BY_FY,expense:BUDGET_EXPENSE_BY_FY};
    if(o==="default"){
      if(w&&w.dataset==="noactuals")return pkg("no-data","no-actuals",base);
      if(w&&w.dataset==="nobudget")return pkg("not-configured","no-budget",base);
      return pkg("ok","",base);
    }
    if(o==="none")return pkg("no-data","no-actuals",base);
    if(o==="notconfigured")return pkg("not-configured","no-budget",base);
    var g=pkgGen(o,"budget");return pkg("ok",o,{reports:g||BGT_REPORTS,income:BUDGET_INCOME_BY_FY,expense:BUDGET_EXPENSE_BY_FY});
  }
  function bgtOReports(w){return bgtOPackage(w).data.reports||BGT_REPORTS;}
  /* what a non-ok package shows. Phase A: nothing of its own; the rows carry the state (no budget -> the
     widget's own "No budget set up"; no actuals -> the year face with nothing posted). */
  function bgtOStateHTML(w,p){return null;}
  function bgtODsRows(w,rows,isReport){
    if(!w||!rows)return rows;
    var r=bgtOPackage(w).reason;
    if(r==="no-actuals")return rows.map(function(x){return {period:x.period,budget:x.budget,actual:null};});
    if(r==="no-budget")return rows.map(function(x){return {period:x.period,budget:null,actual:null};});
    if(isReport&&(r==="small"||r==="extreme"))return rows; /* a generated report is already at the state's scale */
    if(r==="small")return rows.map(function(x,i){return {period:x.period,budget:Math.max(1,Math.round(x.budget/1000)),actual:(i===0&&x.actual!=null)?Math.max(1,Math.round(x.actual/1000)):null};});
    if(r==="extreme")return rows.map(function(x,i){var b=Math.round(x.budget*4000*100)/100;return {period:x.period,budget:b,actual:Math.round(b*(0.78+((i*37)%41)/100)*100)/100};});
    return rows;}''')
sub1('''  function bgtOSet(w){var rows;if(w.acctview==="special")rows=bgtOReportLine(w).rows;else{var fy2=w.fy||BGT_CUR_FY,table=(w.acctview==="expense")?BUDGET_EXPENSE_BY_FY:BUDGET_INCOME_BY_FY;rows=table[fy2]||table[BGT_CUR_FY];}\r
    return bgtODsRows(w,rows);}''',
'''  function bgtOSet(w){var rows,d=bgtOPackage(w).data;if(w.acctview==="special")rows=bgtOReportLine(w).rows;else{var fy2=w.fy||BGT_CUR_FY,table=(w.acctview==="expense")?d.expense:d.income;rows=table[fy2]||table[BGT_CUR_FY];}\r
    return bgtODsRows(w,rows,w.acctview==="special");}''')
sub1('''  function bgtOSeriesFor(w,fy){var s;if(w.acctview==="special"){var ln=bgtOReportLine(w);s=(fy===BGT_CUR_FY)?ln.rows:bgtOBackfillRows(ln);}else{var t=(w.acctview==="expense")?BUDGET_EXPENSE_BY_FY:BUDGET_INCOME_BY_FY;s=t[fy]||null;}return bgtODsRows(w,s);}''',
'''  function bgtOSeriesFor(w,fy){var s,d=bgtOPackage(w).data;if(w.acctview==="special"){var ln=bgtOReportLine(w);s=(fy===BGT_CUR_FY)?ln.rows:bgtOBackfillRows(ln);}else{var t=(w.acctview==="expense")?d.expense:d.income;s=t[fy]||null;}return bgtODsRows(w,s,w.acctview==="special");}''')
sub1('''  function bgtOContent(w){\r
    if(w.size==="kpi")return bgtOGlance(w);''',
'''  function bgtOContent(w){var p=bgtOPackage(w);if(p.state!=="ok"){var sh=bgtOStateHTML(w,p);if(sh)return sh;}\r
    if(w.size==="kpi")return bgtOGlance(w);''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A13 budget ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
