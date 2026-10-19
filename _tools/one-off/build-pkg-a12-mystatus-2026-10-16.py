# Data package layer, step A12: My Status (W08, prefix mys) renders from mysPackage(w).
# Default returns MYS_QUERIES by reference; "none" hands copies at count 0, "notconfigured" no queries at all.
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''  function mysQueries(w){var l=MYS_QUERIES;if(w&&w.dataset==="noqueries")l=[];else if(w&&w.dataset==="none")l=MYS_QUERIES.map(function(q){var c={};for(var k in q)c[k]=q[k];c.count=0;return c;});else if(w&&(w.dataset==="small"||w.dataset==="extreme")){var g=DATA_STATES.get(w.dataset,"mystatus");l=MYS_QUERIES.map(function(q,i){var c={};for(var k in q)c[k]=q[k];c.count=g.counts(i);return c;});}mysLive=l;return l;}''',
'''  /* the shipped queries with every count replaced: 0 for "no data", generated for small / extreme */
  function mysWithCounts(fn){return MYS_QUERIES.map(function(q,i){var c={};for(var k in q)c[k]=q[k];c.count=fn(i);return c;});}
  /* data package: the envelope this widget renders from (API shape; see the shared pkg helpers).
     reasons: every-query-zero (no-data), no-queries-chosen (not-configured) */
  function mysPackage(w){
    if(w&&w.pkg)return w.pkg;
    var o=pkgOption();
    if(o==="default"){
      if(w&&w.dataset==="noqueries")return pkg("not-configured","no-queries-chosen",{queries:[]});
      if(w&&w.dataset==="none")return pkg("no-data","every-query-zero",{queries:mysWithCounts(function(){return 0;})});
      return pkg("ok","",{queries:MYS_QUERIES});
    }
    if(o==="none")return pkg("no-data","every-query-zero",{queries:mysWithCounts(function(){return 0;})});
    if(o==="notconfigured")return pkg("not-configured","no-queries-chosen",{queries:[]});
    var g=pkgGen(o,"mystatus");return pkg("ok",o,{queries:g?mysWithCounts(g.counts):MYS_QUERIES});
  }
  function mysQueries(w){var l=mysPackage(w).data.queries||[];mysLive=l;return l;}''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A12 mystatus ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
