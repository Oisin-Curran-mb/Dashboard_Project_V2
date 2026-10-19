# Data package layer, Phase B: map each package (state, reason) to Jo Phase 2's design, or to the owner's
# "Not designed yet" placeholder where she has none. One section per widget; every anchor asserted unique.
# Plan: .claude plan "the data package layer" (16 Oct 2026), section "Phase B". Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


# ---- Budget Compared to Actual: no-budget and no-actuals ride in the rows (Jo's own states); a no-fiscal-year
#      package (API only) has no design.
sub1('''  function bgtOStateHTML(w,p){return null;}''',
'''  function bgtOStateHTML(w,p){
    /* PLACEHOLDER: no Jo Phase 2 design for not-configured/no-fiscal-year (reachable only from an API response); owner to review */
    if(p.state==="not-configured"&&p.reason!=="no-budget")return pkgPlaceholderHTML(w,p);
    return null;}''')

# ---- Payroll Distributions: no-data -> Jo's "No payroll runs in this range"; not-configured has no design.
sub1('''  function prOStateHTML(w,p){return prOEmptyHTML(w);}''',
'''  function prOStateHTML(w,p){
    /* PLACEHOLDER: no Jo Phase 2 design for not-configured/no-distributions; owner to review */
    if(p.state==="not-configured")return prOHeaderBlock(w,(w.size==="xwide"||w.size==="kpi"),true)+pkgPlaceholderHTML(w,p);
    return prOEmptyHTML(w);}''')

# ---- Receivable Invoices Outstanding: no-data -> Jo's "Nothing outstanding"; not-configured has no design.
sub1('''function arOStateHTML(w,p){return arOEmpty(w);}''',
'''function arOStateHTML(w,p){
  /* PLACEHOLDER: no Jo Phase 2 design for not-configured/no-revenue-centres; owner to review */
  if(p.state==="not-configured")return pkgPlaceholderHTML(w,p);
  return arOEmpty(w);}''')

# ---- Insurance Billing Plans: no-data = the plans listed at zero enrolment (Jo's face, her per-plan zero line);
#      not-configured -> Jo's "No insurance plans yet".
sub1('''    if(o==="none")return pkg("no-data","no-enrolments",{plans:INSO_PLANS_EMPTY});''',
'''    if(o==="none")return pkg("no-data","no-enrolments",{plans:insOZeroSet()});''')
sub1('''  function insODataset(w){return insOPackage(w).data.plans||[];}\r
  /* what a non-ok package shows. Phase A: the widget's own empty block for every non-ok state. */\r
  function insOStateHTML(w,p){return insOEmpty(w);}''',
'''  function insODataset(w){return insOPackage(w).data.plans||[];}
  /* the shipped plans with every enrolment at zero: the "no data" face, built once */
  var insOZero=null;
  function insOZeroSet(){if(!insOZero)insOZero=INSO_PLANS.map(function(p){var c={};for(var k in p)c[k]=p[k];c.enroll=0;return c;});return insOZero;}
  /* what a non-ok package shows: not-configured -> Jo's "No insurance plans yet"; no-data falls through to
     the normal face, which lists the plans at zero. */
  function insOStateHTML(w,p){if(p.state==="no-data")return null;return insOEmpty(w);}''')
sub1('''    var inner,p=insOPackage(w);\r
    if(p.state!=="ok")inner=insOStateHTML(w,p);\r
    else if(w.state==="empty")inner=insOEmpty(w);''',
'''    var inner,p=insOPackage(w),sh=(p.state!=="ok")?insOStateHTML(w,p):null;\r
    if(sh)inner=sh;\r
    else if(w.state==="empty")inner=insOEmpty(w);''')

# ---- Loans With Balance Due: no-data -> Jo's "Nothing outstanding"; not-configured has no design.
sub1('''function lonFStateHTML(w,p){return lonFEmpty(w);}''',
'''function lonFStateHTML(w,p){
  /* PLACEHOLDER: no Jo Phase 2 design for not-configured/no-loan-types-or-loans; owner to review */
  if(p.state==="not-configured")return pkgPlaceholderHTML(w,p);
  return lonFEmpty(w);}''')

# ---- Fixed Asset Values: the wide empty block takes Jo's copy (faEmptyState in her phase-2 build) in place of
#      the build-invented wording. Both package states land here; Glance keeps "No assets".
sub1('''    '<div class="state-title">No fixed assets</div>'+\r
    '<div class="state-sub">There are no fixed asset records for this organisation. This wording is build-invented: no empty-state copy has been decided (Step 4 Sign-off Readiness row 8).</div>'+''',
'''    '<div class="state-title">No fixed assets yet</div>'+\r
    '<div class="state-sub">When assets are added to the Fixed Assets module they will show here, grouped and valued.</div>'+''')

# ---- Purchasing Management: no-data -> the widget's "Nothing needs your approval"; not-configured (the user is on
#      no approval path) -> Jo's purEmptyState wording, inlined (this block runs alone in its driver).
sub1('''function purFStateHTML(w,p){return purFEmpty(w,false);}''',
'''function purFNotOnPath(w){return '<div class="state" data-kind="empty">'+purFIcon("inbox")+
    '<div class="state-title">Nothing needs your approval</div>'+
    '<div class="state-sub">You are not on an approval path yet, so there are no purchase requests to review here. When you are added to a path, anything that needs you shows up.</div></div>';}
function purFStateHTML(w,p){if(p.state==="not-configured")return purFNotOnPath(w);return purFEmpty(w,false);}''')

# ---- Main Content Tasks: Jo's only empty is the Glance line "No recent or saved tasks yet", which the Glance
#      draws itself from an empty list; every other non-ok face has no design.
sub1('''  function mctStateHTML(w,p){return null;}''',
'''  function mctStateHTML(w,p){
    if(p.state==="no-data"&&w.size==="kpi")return null;
    /* PLACEHOLDER: no Jo Phase 2 design for not-configured/role-has-no-tasks, nor for no-data beyond the Glance line; owner to review */
    return pkgPlaceholderHTML(w,p);}''')

# ---- Bank Balances: Jo's "No bank accounts" card with "Add bank account" (her shell fallback, EMPTY_COPY.bank),
#      drawn by the widget itself so it reaches the face. No-data does not arise for this widget (an account at
#      $0 is a row), so the same card answers both package states.
sub1('''  function bankStateHTML(w,p){return null;}''',
'''  function bankStateHTML(w,p){var ec=EMPTY_COPY.bank;return pkgStateHTML(w,{icon:"inbox",title:ec.title,sub:ec.sub,cta:ec.cta,action:ec.action});}''')

# ---- Accounts Payable By Due Date: no-data -> Jo's "Nothing outstanding"; not-configured has no design.
sub1('''  function apStateHTML(w,p){var ec=EMPTY_COPY.payables;return''',
'''  function apStateHTML(w,p){
    /* PLACEHOLDER: no Jo Phase 2 design for not-configured/no-payables-bank-account; owner to review */
    if(p.state==="not-configured")return pkgPlaceholderHTML(w,p);
    var ec=EMPTY_COPY.payables;return''')

# ---- Financial KPI band: not-configured (no fiscal year) has no design; the row holds the placeholder.
sub1('''    '<div class="fkp-row">'+\r
      fkpTiles().map(fkpTileHTML).join("")+\r
    '</div>'+''',
'''    '<div class="fkp-row">'+\r
      fkpRowHTML()+\r
    '</div>'+''')
sub1('''function fkpTiles(){return fkpPackage().data.tiles||[];}''',
'''function fkpTiles(){return fkpPackage().data.tiles||[];}
/* PLACEHOLDER: no Jo Phase 2 design for not-configured/no-fiscal-year; owner to review. Every other package renders the tiles. */
function fkpRowHTML(){var fp=fkpPackage();if(fp.state==="not-configured")return pkgPlaceholderHTML({id:"fkp",title:"Financial KPI"},fp);return fkpTiles().map(fkpTileHTML).join("");}''')

nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("Phase B ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)), "| placeholders:", s.count("PLACEHOLDER: no Jo Phase 2 design"))
