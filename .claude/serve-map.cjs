#!/usr/bin/env node
/**
 * ダッシュボード用のミニサーバ（依存パッケージなし）。
 *   node .claude/serve-map.cjs   →  http://localhost:4321
 *
 * file:// で直接開いても動くようにしてあるが、
 * こちらで開くと 5 秒ごとの自動更新がきちんと効く。
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const PORT = Number(process.env.SCREEN_MAP_PORT) || 4321;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel === "/") rel = "/screen-map-viewer.html";
    const file = path.join(DIR, path.normalize(rel).replace(/^(\.\.[/\\])+/, ""));
    if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file)] || "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => {
    console.log(`Screen Map ダッシュボード → http://localhost:${PORT}`);
  });
