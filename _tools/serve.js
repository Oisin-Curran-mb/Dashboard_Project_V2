/* =====================================================================
   serve.js , static server for reviewing the build, with caching OFF.

     node _tools/serve.js [port]        default 8765, binds 127.0.0.1

   Serves the repo root. Every response carries Cache-Control: no-store, so
   the browser never shows a stale index.html or review pack after an edit
   (the Python http.server sent no cache headers and a plain reload could
   keep the old file). Plain Node, no packages. Review aid only.
   ===================================================================== */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), url = require("url");
const ROOT = path.join(__dirname, ".."); const PORT = Number(process.argv[2] || 8765);
const MIME = { ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".json": "application/json; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon", ".woff2": "font/woff2" };
http.createServer(function (req, res) {
  let p = decodeURIComponent(url.parse(req.url).pathname || "/");
  if (p.endsWith("/")) p += "index.html";
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end("forbidden"); return; }
  fs.stat(file, function (err, st) {
    if (err || !st.isFile()) { res.writeHead(404, { "Cache-Control": "no-store" }); res.end("not found: " + p); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": st.size, "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache", "Expires": "0" });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, "127.0.0.1", function () { console.log("serving " + ROOT + " on http://localhost:" + PORT + "  (Cache-Control: no-store)"); });
