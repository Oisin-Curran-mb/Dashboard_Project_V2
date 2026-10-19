# Token audit for one widget block of index.html (19 Oct 2026). Read-only.
#
#   python -I _tools/token-audit.py W19            (by widget number, regions from _tools/widget-map.json)
#   python -I _tools/token-audit.py W19 --css-only  (skip the JS block's inline styles)
#   python -I _tools/token-audit.py --root           (just list the page's :root aliases and what they resolve to)
#
# What it reports, per region (the widget's CSS region, its JS block's inline styles):
#   every var(--token) use, classified as
#     pathway semantic   a --semantic-* token declared in the Pathway theme file the page loads
#     pathway primitive  a --primitive-* token declared in the Pathway primitives file (a raw ramp step; fine
#                        for charts, a smell for badges, text and surfaces, which have semantic tokens)
#     page alias         declared on :root in index.html's <style>, pointing at a Pathway token
#     local property     set inline by the widget's own markup (style="--x:..."), so declared at run time
#     UNDECLARED         declared nowhere: the var() falls back or resolves to nothing
#   raw hex colours, rgb()/rgba() calls, literal px values (with the lines they sit on), font-size values.
#
# Where the Pathway files come from: the two <link> tags at the top of index.html. They are downloaded once to
# _tools/.tmp/pathway/ and reused; delete that folder to refresh. See docs/TOKEN-AUDIT.md for how to read the output.
import re, os, sys, json, collections, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
MAP = os.path.join(ROOT, "_tools", "widget-map.json")
CACHE = os.path.join(ROOT, "_tools", ".tmp", "pathway")


def load_index():
    return open(INDEX, "rb").read().decode("utf-8")


def pathway_css(s):
    """the Pathway stylesheets the page links, fetched once"""
    links = re.findall(r'href="(https://[^"]*pathway-tokens[^"]*\.css)"', s)
    os.makedirs(CACHE, exist_ok=True)
    out = ""
    for u in links:
        p = os.path.join(CACHE, u.rsplit("/", 1)[1].replace(".css", "-" + re.sub(r"\W", "_", u.split("@")[-1].split("/dist")[0]) + ".css"))
        if not os.path.exists(p):
            with urllib.request.urlopen(u, timeout=30) as r:
                open(p, "wb").write(r.read())
        out += open(p, encoding="utf-8").read() + "\n"
    return links, out


def declared(css_text):
    return set(re.findall(r"(--[a-zA-Z0-9-]+)\s*:", css_text))


def region_by_markers(s, start, end):
    a = s.find(start)
    if a < 0:
        return None
    b = s.find(end, a + len(start))
    if b < 0:
        return None
    b = s.find("\n", b) + 1
    return a, b


def lines_of(s, a, b):
    return s.count("\n", 0, a) + 1, s.count("\n", 0, b) + 1


def scan(label, txt, root_decl, pw_decl, line0):
    used = collections.Counter(re.findall(r"var\((--[a-zA-Z0-9-]+)", txt))
    local = set(re.findall(r'style="[^"]*(--[a-zA-Z0-9-]+)\s*:', txt))
    groups = collections.OrderedDict((g, []) for g in ("pathway semantic", "pathway primitive", "page alias", "local property", "UNDECLARED"))
    for t, n in sorted(used.items()):
        if t in pw_decl and t.startswith("--semantic-"): groups["pathway semantic"].append((t, n))
        elif t in pw_decl and t.startswith("--primitive-"): groups["pathway primitive"].append((t, n))
        elif t in root_decl: groups["page alias"].append((t, n))
        elif t in local: groups["local property"].append((t, n))
        elif t in pw_decl: groups["pathway semantic"].append((t, n))
        else: groups["UNDECLARED"].append((t, n))
    print("\n== %s | var() uses: %d | distinct tokens: %d" % (label, sum(used.values()), len(used)))
    for g, items in groups.items():
        if not items: continue
        print("  %-18s %3d distinct, %3d uses" % (g, len(items), sum(n for _, n in items)))
        for t, n in items: print("      %-52s x%d" % (t, n))
    hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", re.sub(r'(?:href|id|data-[a-z-]+)="#[^"]*"', "", txt))
    print("  raw hex colours: %s" % (dict(collections.Counter(hexes)) if hexes else "none"))
    rg = re.findall(r"rgba?\([^)]*\)", txt)
    print("  rgb()/rgba(): %s" % (len(rg) if rg else "none"))
    fs = collections.Counter(v.strip() for v in re.findall(r"font-size:\s*([^;\"'}]+)", txt))
    print("  font-size values: %s" % ", ".join("%s x%d" % kv for kv in fs.most_common()))
    print("  literal px values (lines are index.html lines; 1px and 2px borders not listed):")
    for i, line in enumerate(txt.split("\n")):
        pxs = [p for p in re.findall(r"(?<![\w-])(\d+(?:\.\d+)?px)\b", line) if p not in ("1px", "2px", "0px")]
        if pxs:
            print("    %6d  %-28s %s" % (line0 + i, " ".join(sorted(set(pxs), key=pxs.index)), line.strip()[:120]))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    s = load_index()
    head = s[:s.index("</style>")]
    root_decl = declared(head)
    links, pw = pathway_css(s)
    pw_decl = declared(pw)
    print("index.html: %d custom properties declared in <style>; Pathway files (%d) declare %d" % (len(root_decl), len(links), len(pw_decl)))
    for u in links: print("  " + u)
    if "--root" in flags:
        for t in sorted(root_decl):
            m = re.search(re.escape(t) + r"\s*:\s*([^;]+);", head)
            print("  %-36s -> %s" % (t, m.group(1).strip() if m else "?"))
        return
    if not args:
        print(__doc__ or "usage: token-audit.py Wnn [--css-only] | --root"); return
    wnn = args[0].upper()
    m = json.load(open(MAP, encoding="utf-8"))["widgets"].get(wnn)
    if not m:
        print("no widget", wnn, "in widget-map.json"); return
    f = m.get("final") or {}
    print("\n%s %s (prefix %s, kind %s)" % (wnn, m.get("name"), f.get("prefix"), f.get("kind")))
    css = f.get("css") or {}; js = f.get("js") or {}
    r = region_by_markers(s, css.get("start", "\x00"), css.get("end", "\x00"))
    if r:
        a, b = r; l0, l1 = lines_of(s, a, b)
        scan("CSS region (index.html %d-%d)" % (l0, l1), s[a:b], root_decl, pw_decl, l0)
    else:
        print("  CSS region markers not found; check widget-map.json final.css")
    if "--css-only" not in flags:
        r = region_by_markers(s, js.get("start", "\x00"), js.get("end", "\x00"))
        if r:
            a, b = r; l0, l1 = lines_of(s, a, b)
            scan("JS block inline styles (index.html %d-%d)" % (l0, l1), s[a:b], root_decl, pw_decl, l0)
        else:
            print("  JS block markers not found; check widget-map.json final.js")


if __name__ == "__main__":
    main()
