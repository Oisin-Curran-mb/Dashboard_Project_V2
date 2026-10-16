# Builds the public Dashboard_V2_Handover release from this repo: every widget except Alerts & Actions and its alerts2 copy.
# Renumbered 2026-10-16: Alerts & Actions moved from W19 to W20 when Pending Actions took W19. Every literal below followed it.
# Pending Actions (W19) SHIPS. Do not reintroduce a "W19 off" step here: that would now hide the wrong widget.
# Run: python -I _tools/one-off/build-release-2026-10-12.py   (then review, commit and push in the public repo folder)
import os, re, shutil, subprocess, sys
SRC = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2"
DST = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Handover W01-W04 (public repo)"

# ---------- 1. index.html ----------
s = open(os.path.join(SRC, "index.html"), "rb").read().decode("utf-8")
assert "\r\n" in s and "\r\r\n" not in s
def cut(s, start, end, inclusive_end):
    a = s.index(start); assert s.count(start) == 1, start
    b = s.index(end, a); assert b > a, end
    if inclusive_end: b += len(end)
    return s[:a] + s[b:], b - a
# switchboard. The build itself now ships with Alerts & Actions already off, so
# there is nothing to flip; assert the state instead of changing it, and assert
# that Pending Actions is ON, because it is the widget that replaced it.
assert s.count("W20:false") == 1, "Alerts & Actions should already be switched off in the build"
assert s.count("W19:true,   /* Pending Actions */") == 1, "Pending Actions must stay in the release"
# alerts2 CSS: from its banner up to (not including) the W20 CSS end banner
s, n1 = cut(s, "  /* \u2500\u2500 Alerts & Actions Copy (alerts2): tab severity overrides \u2500\u2500 */", "/* ===== end W20 Alerts & Actions V2 CSS ===== */", False)
# alerts2 JS block, both banners inclusive, plus the CRLF after the end banner
s, n2 = cut(s, "/* ===== W20-Copy Alerts & Actions V2 (alerts2) ===== */", "/* ===== end W20-Copy Alerts & Actions V2 (alerts2) ===== */\r\n", True)
# registry comment + two rows
# The two alerts2 rows were commented out on 2026-10-13 (commit 8e2940e), so the
# end anchor needs the comment closer. This had already broken the release build
# before the 16 Oct renumber; it is fixed here rather than left to abort.
s, n3 = cut(s, "      /* W20 Alerts & Actions, Copy (alerts2 variant), scrapped with it */", '/* {id:"alB4_2x",title:"Alerts & Actions Copy (Detail)",kind:"alerts2",size:"xwide",tiers:["wide","xwide"],updated:"just now"}, */\r\n', True)
assert "alerts2" not in s and "alo2" not in s and "alO2" not in s and "ALO2" not in s, [m.start() for m in re.finditer("alerts2|alo2|alO2|ALO2", s)][:5]
assert "\r\r\n" not in s and "\n" not in s.replace("\r\n", "")
open(os.path.join(DST, "index.html"), "wb").write(s.encode("utf-8"))
print("index.html: Alerts & Actions (W20) already off; removed alerts2 CSS %d, JS %d, registry %d chars" % (n1, n2, n3))

# ---------- 2. handover.html ----------
h = open(os.path.join(SRC, "handover.html"), "rb").read().decode("utf-8")
assert "\r\n" not in h
a = h.index('<section id="w19"'); b = h.index("</section>\n", a) + len("</section>\n")
h = h[:a] + h[b:]
# nav link
m = re.search(r'<a href="#w19"[^>]*>.*?</a>', h); assert m and h.count('href="#w19"') == 1
h = h[:m.start()] + h[m.end():]
# intro bullets, paragraph, legend
def sub1(o, n):
    global h
    assert h.count(o) == 1, (h.count(o), o[:70]); h = h.replace(o, n)
sub1("<li><strong>New Widget</strong> \u2014 did not exist in V1 (Financial KPI and Alerts &amp; Actions).</li>",
     "<li><strong>New Widget</strong> \u2014 did not exist in V1 (Financial KPI).</li>")
pm = re.search(r"<p>This document covers every widget in the Version 2 build:.*?</p></div>", h, re.S); assert pm
h = h[:pm.start()] + ("<p>This handover covers every widget carried over from V1, <strong>Budget Compared to Actual</strong> through <strong>Gifts Pledges</strong>, "
    "each with V1 and V2 screenshots side by side, what changed and where, and developer notes on any logic; plus <strong>Financial KPI</strong>, "
    "which is new in V2, with Aditya&#39;s design spec linked from its section. Alerts &amp; Actions is not part of this release.</p></div>") + h[pm.end():]
lg = re.search(r'<div class="legend">.*?</div>', h); assert lg
h = h[:lg.start()] + ('<div class="legend"><span class="ctype t-visual">Visual Only</span><span class="ctype t-feature">New Feature or Logic</span>'
    '<span class="ctype t-complete">Complete Change</span><span class="ctype t-new">New Widget</span><span class="ctype t-none">No Change</span></div>') + h[lg.end():]
assert "w19" not in h.lower() and "Alerts &amp; Actions is not part" in h
secs = re.findall(r'<section id="(w\d+)"', h); navs = re.findall(r'<a href="#(w\d+)"', h)
assert secs == navs, (secs, navs)
open(os.path.join(DST, "handover.html"), "wb").write(h.encode("utf-8"))
print("handover.html: sections", secs)

# ---------- 3. pics + spec ----------
pics_dst = os.path.join(DST, "docs", "Pics")
if os.path.isdir(pics_dst): shutil.rmtree(pics_dst)
copied = 0
for ver in ("Version 1", "Version 2"):
    for folder in sorted(os.listdir(os.path.join(SRC, "docs", "Pics", ver))):
        # Matched by NAME, not by number: the Alerts & Actions shots are the ones
        # to leave out, and their folder still reads "W19 - Alerts & Actions" even
        # though the widget is now W20. A startswith("W19") test would skip the
        # wrong widget's shots the moment a "W19 - Pending Actions" folder exists.
        if "Alerts & Actions" in folder: continue
        sd = os.path.join(SRC, "docs", "Pics", ver, folder); dd = os.path.join(pics_dst, ver, folder)
        os.makedirs(dd)
        for f in os.listdir(sd):
            p = os.path.join(sd, f)
            if os.path.isfile(p) and f.lower().endswith(".png"):
                shutil.copy2(p, dd); copied += 1
shutil.copy2(os.path.join(SRC, "docs", "W18 Financial KPI - Design Spec.html"), os.path.join(DST, "docs"))
print("pics copied:", copied)

# every src/href the handover uses must exist in the release folder
srcs = re.findall(r'(?:src|data-src|href)="(docs/[^"]+)"', h)
missing = [u for u in set(srcs) if not os.path.exists(os.path.join(DST, u.replace("%20", " ")))]
assert not missing, missing
print("handover refs:", len(set(srcs)), "all present | em dash:", "\u2014" in h[h.index("<section"):])

# ---------- 4. README ----------
readme = open(os.path.join(DST, "README.md"), "rb").read().decode("utf-8")
nl = "\r\n" if "\r\n" in readme else "\n"
o = "The demo shows the widgets that have been handed over so far; more are added as each one is signed off."
assert readme.count(o) == 1 or "not part of this release" in readme
readme = readme.replace(o, "The demo and the handover doc cover every widget carried over from V1 plus Financial KPI. Alerts & Actions is not part of this release.")
open(os.path.join(DST, "README.md"), "wb").write(readme.encode("utf-8"))

# ---------- 5. release index.html gate: script parses, pure CRLF ----------
sc = re.search(r"<script>([\s\S]*)</script>", s).group(1)
import tempfile; tmp = os.path.join(tempfile.gettempdir(), "release_script.js"); open(tmp, "wb").write(sc.encode("utf-8"))
r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
print("node --check:", "ok" if r.returncode == 0 else r.stderr[:800])
print("done")
