/**
 * 依存パッケージ 0 の Chrome DevTools Protocol クライアント。
 *
 * Node 22+ の グローバル WebSocket を使うので npm install は不要。
 * Playwright / Puppeteer を入れると 300MB 超のブラウザを落とすことになるため、
 * すでに入っている Google Chrome をヘッドレスで動かす方針にしている。
 */

const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

function findChrome() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  for (const c of CHROME_CANDIDATES) if (fs.existsSync(c)) return c;
  throw new Error(
    "Chrome が見つかりません。CHROME_PATH 環境変数で実行ファイルを指定してください。",
  );
}

/** Chrome をヘッドレス起動して CDP の WebSocket エンドポイントを返す */
function launchChrome({ width = 1440, height = 900 } = {}) {
  const chrome = findChrome();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "screenmap-chrome-"));

  const proc = spawn(
    chrome,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      `--window-size=${width},${height}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--force-color-profile=srgb",
      "--disable-lcd-text",              // 環境差でアンチエイリアスがブレると誤検出になる
      "--font-render-hinting=none",
      "about:blank",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  return new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => reject(new Error("Chrome の起動がタイムアウトしました")), 20000);

    proc.stderr.on("data", (chunk) => {
      buf += chunk.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve({ wsUrl: m[1], proc, userDataDir });
      }
    });
    proc.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome が終了しました (code ${code})\n${buf.slice(-500)}`));
    });
  });
}

/** CDP セッション（1 タブぶん） */
class Session {
  constructor(ws, sessionId) {
    this.ws = ws;
    this.sessionId = sessionId;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  send(method, params = {}, { timeout = 30000 } = {}) {
    const id = this.nextId++;
    const msg = { id, method, params };
    if (this.sessionId) msg.sessionId = this.sessionId;
    this.ws.send(JSON.stringify(msg));
    return new Promise((resolve, reject) => {
      // タイムアウトは必須。awaitPromise で永久に解決しない Promise を渡すと
      // （例: document.fonts.ready が返らないページ）ワーカーが完全に固まる。
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP がタイムアウトしました: ${method}`));
      }, timeout);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
    });
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event).delete(fn);
  }

  once(event, { timeout = 15000 } = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new Error(`イベント待ちがタイムアウト: ${event}`));
      }, timeout);
      const off = this.on(event, (params) => {
        clearTimeout(timer);
        off();
        resolve(params);
      });
    });
  }

  handle(msg) {
    if (msg.id != null && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else resolve(msg.result);
      return;
    }
    if (msg.method) {
      for (const fn of this.listeners.get(msg.method) || []) fn(msg.params);
    }
  }
}

/** ブラウザ全体の接続。ページを 1 枚開いて Session を返す。 */
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const sessions = new Map(); // sessionId -> Session
  const root = new Session(ws, null);
  sessions.set(null, root);

  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("CDP に接続できませんでした")), { once: true });
  });

  ws.addEventListener("message", (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    const target = sessions.get(msg.sessionId ?? null);
    if (target) target.handle(msg);
  });

  return {
    root,
    ws,
    async newPage() {
      const { targetId } = await root.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await root.send("Target.attachToTarget", {
        targetId,
        flatten: true,
      });
      const page = new Session(ws, sessionId);
      sessions.set(sessionId, page);
      await page.send("Page.enable");
      await page.send("Runtime.enable");
      return page;
    },
    close() {
      try {
        ws.close();
      } catch { /* 既に閉じている */ }
    },
  };
}

module.exports = { launchChrome, connect, findChrome };
