# Companion to build-views-2026-10-23.py: the two drivers and the module shoot list.
# shell-spec.driver.js: Statistics now has a V2 screenshot (Q51). w15-bank.driver.js: account numbers
# are masked everywhere (Q56). shoot-modules-2026-10-19.js: Statistics joins the module list.
# Run: python -I <this file>
import os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
MISSING = []

def edit(rel, pairs):
    p = os.path.join(ROOT, rel); b = open(p, "rb").read(); s = b.decode("utf-8"); crlf = "\r\n" in s
    s2 = s.replace("\r\n", "\n")
    for o, n in pairs:
        c = s2.count(o)
        if c != 1: MISSING.append((rel, c, o[:100])); continue
        s2 = s2.replace(o, n)
    return p, (s2.replace("\n", "\r\n") if crlf else s2)

out = []
out.append(edit("_tools/shell-spec.driver.js", [(
'''  /* Statistics is the one module with no screenshot, and says why. The slice
     start is asserted first: indexOf returning -1 would make slice(-1) one
     character long and the absent() below pass for the wrong reason. */
  const statAt = dash.indexOf("Statistics</h2>");
  A.ok(statAt > 0, "the Statistics section was located");
  A.absent(dash.slice(statAt), "<img", "Statistics has no screenshot, having no widget in either version");
''',
'''  /* Statistics has no old-system screenshot (the URL redirects to the root) and,
     since the owner's ruling of 22 Oct 2026 (Q51), one V2 screenshot like Records.
     The slice start is asserted first: indexOf returning -1 would make slice(-1)
     one character long and the checks below pass for the wrong reason. */
  const statAt = dash.indexOf("Statistics</h2>");
  A.ok(statAt > 0, "the Statistics section was located");
  A.eq((dash.slice(statAt).match(/<img /g) || []).length, 1, "Statistics has exactly one screenshot, the V2 capture");
  A.contains(dash.slice(statAt), "Statistics%20-%20V2.png", "and it is the V2 capture");
  A.absent(dash.slice(statAt), "Statistics%20-%20V1.png", "no old-system screenshot: the URL redirects");
  A.contains(dash.slice(statAt), "Settled 22 October (Q51)", "the ruling is stated");
'''),
(
'''  A.ok(imgs.length >= 14, "at least the fourteen V2 full-page screenshots are present (" + imgs.length + " in all)");''',
'''  A.ok(imgs.length >= 15, "at least the fifteen V2 full-page screenshots are present, Statistics included (" + imgs.length + " in all)");'''),
]))

out.append(edit("_tools/w15-bank.driver.js", [(
'''["bank-acct", "bank-overdrawn", "bank-sort", "bank-more"].forEach(function (a) { A.contains(d, 'data-action="' + a + '"', "Detail control " + a); });

process.exit(A.report());''',
'''["bank-acct", "bank-overdrawn", "bank-sort", "bank-more"].forEach(function (a) { A.contains(d, 'data-action="' + a + '"', "Detail control " + a); });

/* ---------- 6. account numbers are masked everywhere (owner, 22 Oct 2026, Q56) --------
   Shelby encrypts the bank account number and shows it only behind a secure right; the
   dashboard shows the masked form (last four digits) in the rows, the row tooltips and
   the account picker, and the fixtures carry no full number at all. */
[g, e, d].forEach(function (h, i) { A.absent(h, "Account 0044", ["Glance", "Explore", "Detail"][i] + ": no full account number anywhere"); });
A.ok(/, Account \\u2022\\u2022\\d{4}, tap to open"/.test(e), "Explore row tooltip carries the masked number");
A.ok(/, Account \\u2022\\u2022\\d{4}, tap to open"/.test(d), "Detail row tooltip carries the masked number");
EX.setPop({ type: "bank-acct", id: wide.id }); const pk = EX.popContent(); EX.setPop(null);
A.contains(pk, 'data-action="bank-set-acct"', "account picker renders");
A.absent(pk, "Account 0044", "picker: no full account number"); A.absent(pk, "0044174021", "picker: Operating Checking shows its masked number only");
A.contains(pk, '<span class="mi-acctno">\\u2022\\u20224021</span>', "picker number line is the masked form");
const bankFixtures = raw.slice(raw.indexOf('{id:"bk-op"'), raw.indexOf('WIDGETS.register("bank"'));
A.ok(bankFixtures.length > 1000, "bank fixture region located");
A.absent(bankFixtures, "acctFull", "bank fixtures carry no full account number");
A.absent(raw, 'acctFull: "0044174021"', "the small data-state fixture carries no full number either");

process.exit(A.report());'''),
]))

out.append(edit("_tools/one-off/shoot-modules-2026-10-19.js", [(
'''  "Records": { titles: ["My Status", "Main Content Tasks"] },
  "Remittance": { titles: ["Remittance Pledges"] }
  /* Statistics has no widget in either build, so there is nothing to shoot.
     Its original panel rendered the literal word STATS. */
};''',
'''  "Records": { titles: ["My Status", "Main Content Tasks"] },
  "Remittance": { titles: ["Remittance Pledges"] },
  /* Statistics has no widget of its own in either build; its original panel rendered the
     literal word STATS. Owner, 22 Oct 2026 (Q51): it takes the two shared widgets, like
     Records. V2 only: on test1 the URL redirects to the root, so there is no V1 capture
     (run with "Statistics" v2). */
  "Statistics": { titles: ["My Status", "Main Content Tasks"] }
};'''),
]))

if MISSING:
    for m in MISSING: print("MISSING", m)
    sys.exit(1)
for p, s in out:
    open(p, "wb").write(s.encode("utf-8")); print("updated", os.path.relpath(p, ROOT))
