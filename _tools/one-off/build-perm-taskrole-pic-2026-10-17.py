# Permissions view: the picture of the old system's Task Role editor with the module list and the Dashboard row
# (owner's screenshot of Security Setup, Task Roles, Update on the test1 host, 17 Oct 2026), placed under the rule.
# Also adds it to the spec driver's picture list. Byte-safe. Run: python -I <this file>
import re, os
ROOT = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"
P = os.path.join(ROOT, "index.html")
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s
anchor = '''            <p>Rights are an exact match on a page URI: holding <code>/Payroll</code> grants the Payroll Dashboard and nothing else.'''
assert s.count(anchor) == 1
fig = ('''            <figure class="spec-fig"><img src="docs/Pics/Permissions/taskrole-dashboard-row.png" alt="The old system's Task Role editor: Security Setup, Task Roles, Update; the module list on the left and, first in the task tree for Accounts Payable, the Dashboard row with a Full Rights box only" loading="lazy">'''
       '''<figcaption>Where the right lives in the old system: Security Setup, Task Roles, Update. Pick a module on the left; the first row of its task tree is <b>Dashboard</b>, with a Full Rights box only. That box is the module's root task and is what shows the module's widgets.</figcaption></figure>\r\n''')
s = s.replace(anchor, fig + anchor)
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("index.html: task-role figure added; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))

D = os.path.join(ROOT, "_tools", "shell-spec.driver.js")
t = open(D, "rb").read().decode("utf-8"); nl = "\r\n" if t.count("\r\n") > t.count("\n") // 2 else "\n"
o = 'const PICS = ["purchasing-popup",'; assert t.count(o) == 1
t = t.replace(o, 'const PICS = ["taskrole-dashboard-row", "purchasing-popup",')
open(D, "wb").write(t.encode("utf-8")); print("driver: picture list extended")
