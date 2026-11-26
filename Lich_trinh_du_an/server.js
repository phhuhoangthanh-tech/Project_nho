"use strict";

/* Local static server for Lịch trình cho bạn.
   Run with: node server.js
   Then open http://localhost:8080 (this script opens it for you). */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8080;
const URL = `http://localhost:${PORT}`;
const NO_OPEN = process.argv.includes("--no-open") || process.env.NO_OPEN === "1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8"
};

function safePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  if (decoded === "/" || decoded === "") decoded = "/index.html";
  const resolved = path.resolve(ROOT, "." + decoded);
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" });
    res.end("Method not allowed");
    return;
  }

  const file = safePath(req.url || "/");
  if (!file) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!doctype html><meta charset="utf-8"><title>Not found</title>
        <body style="font-family:system-ui;background:#04121b;color:#dff5ff;padding:40px">
        <h1>404</h1><p>Không tìm thấy tệp này.</p><p><a style="color:#7dd3fc" href="/">Về trang chính</a></p>`);
      return;
    }

    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff"
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(file).pipe(res);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nCổng ${PORT} đang được dùng. Hãy tắt chương trình đang chạy hoặc đặt biến PORT.\n`);
  } else {
    console.error("\nKhông khởi động được server:", err.message, "\n");
  }
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("");
  console.log("  Lịch trình cho bạn đang chạy tại:");
  console.log(`  ${URL}`);
  console.log("");
  console.log("  Giữ cửa sổ này mở. Nhấn Ctrl + C để dừng.");
  console.log("");

  if (NO_OPEN || process.platform !== "win32") return;
  exec(`start "" "${URL}"`, { windowsHide: true }, (err) => {
    if (err) console.log(`  Mở trình duyệt tại ${URL} nếu cửa sổ chưa tự mở.`);
  });
});
