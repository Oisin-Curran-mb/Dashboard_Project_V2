# Data package layer, step A17: the Financial KPI band (W18, prefix fkp) renders from fkpPackage().
# Default returns FKP_TILES by reference. FKP_STATE is untouched (its keys are asserted by the driver).
# Byte-safe. Run: python -I <this file>
import re
P = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\index.html"
s = open(P, "rb").read().decode("utf-8"); assert "\r\n" in s and "\r\r\n" not in s


def sub1(o, n):
    global s
    assert s.count(o) == 1, ("count", s.count(o), o[:80]); s = s.replace(o, n.replace("\r\n", "\n").replace("\n", "\r\n"))


sub1('''function fkpTiles(){var st=(typeof dataState==="function")?dataState():"default";if(st==="notconfigured")return []; /* no fiscal year: nothing to tile */\r
  if(st==="none"||st==="small"||st==="extreme"){var t=DATA_STATES.get(st,"finkpi");if(t)return t;}return FKP_TILES;}''',
'''/* data package: the envelope the band renders from (API shape; see the shared pkg helpers).
   reasons: nothing-posted (no-data: every tile at zero), no-fiscal-year (not-configured: no tiles). */
function fkpPackage(){var o=pkgOption();
  if(o==="none")return pkg("no-data","nothing-posted",{tiles:pkgGen(o,"finkpi")||FKP_TILES});
  if(o==="notconfigured")return pkg("not-configured","no-fiscal-year",{tiles:[]});
  if(o==="small"||o==="extreme"){var g=pkgGen(o,"finkpi");return pkg("ok",o,{tiles:g||FKP_TILES});}
  return pkg("ok","",{tiles:FKP_TILES});}
function fkpTiles(){return fkpPackage().data.tiles||[];}''')
nb = s.encode("utf-8"); open(P, "wb").write(nb)
print("A17 band ok; bare LF:", len(re.findall(rb"(?<!\r)\n", nb)))
