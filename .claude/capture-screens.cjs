#!/usr/bin/env node
/**
 * 実画面のスクリーンショットを撮り、変更前後をピクセル比較する。
 *
 *   node .claude/capture-screens.cjs --baseline    全画面を撮って「変更前」として保存
 *   node .claude/capture-screens.cjs               変更のあった画面だけ撮り直して差分を出す
 *   node .claude/capture-screens.cjs --all         全画面を撮り直して差分を出す
 *   node .claude/capture-screens.cjs --only <文字列>  画面名/パスの部分一致で絞る
 *
 * オプション:
 *   --port <n>        dev サーバーのポート（省略時は自動検出）
 *   --width <n>       ビューポート幅（既定 1280）
 *   --concurrency <n> 同時に開くタブ数（既定 4）
 *
 * 依存パッケージなし。すでに入っている Google Chrome をヘッドレスで使う。
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

const { launchChrome, connect } = require("./lib/cdp.cjs");
const { diffPngs, makeThumb } = require("./lib/pixel-diff.cjs");
const { buildResolver } = require("./lib/route-params.cjs");

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, ".shots");
const DIRS = {
  before: path.join(SHOTS, "before"),
  after: path.join(SHOTS, "after"),
  diff: path.join(SHOTS, "diff"),
  thumb: path.join(SHOTS, "thumb"),
};
const INDEX_PATH = path.join(__dirname, "shots-index.json");

/* ------------------------------------------------------------------ */
/* 引数                                                                */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const a = { mode: "changed", width: 1280, height: 900, concurrency: 4, port: null, only: null, resume: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--baseline") a.mode = "baseline";
    else if (v === "--all") a.mode = "all";
    else if (v === "--only") a.only = argv[++i];
    else if (v === "--resume") a.resume = true;
    else if (v === "--port") a.port = Number(argv[++i]);
    else if (v === "--width") a.width = Number(argv[++i]);
    else if (v === "--concurrency") a.concurrency = Number(argv[++i]);
  }
  return a;
}

/* ------------------------------------------------------------------ */
/* dev サーバーの検出                                                   */
/* ------------------------------------------------------------------ */

function probe(port) {
  return new Promise((resolve) => {
    const req = http.get({ host: "localhost", port, path: "/", timeout: 1500 }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve(res.statusCode === 200 && body.includes("/src/main.tsx")));
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}

async function findDevServer(preferred) {
  const ports = preferred ? [preferred] : [5173, 5174, 5175, 5176, 5177, 5178, 3000, 4173];
  for (const p of ports) if (await probe(p)) return p;
  return null;
}

/* ------------------------------------------------------------------ */
/* 描画を毎回同じにするための仕込み                                      */
/* ------------------------------------------------------------------ */

/**
 * 時刻と乱数を固定し、アニメーションを止める。
 * これをやらないと「時計が 1 秒進んだだけ」で差分が出てしまう。
 */
const DETERMINISM_SCRIPT = `
(() => {
  const FIXED = new Date("2026-09-02T09:00:00+09:00").getTime();
  const RealDate = Date;
  function FakeDate(...args) {
    if (args.length === 0) return new RealDate(FIXED);
    return new RealDate(...args);
  }
  FakeDate.prototype = RealDate.prototype;
  FakeDate.now = () => FIXED;
  FakeDate.parse = RealDate.parse;
  FakeDate.UTC = RealDate.UTC;
  window.Date = FakeDate;

  let seed = 42;
  Math.random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  const style = document.createElement("style");
  style.textContent =
    "*,*::before,*::after{animation:none!important;transition:none!important;" +
    "caret-color:transparent!important;scroll-behavior:auto!important}";
  const attach = () => document.head && document.head.appendChild(style);
  if (document.head) attach();
  else document.addEventListener("DOMContentLoaded", attach);
})();
`;

const BLANK_BYTES = 9000;      // これ未満の PNG は真っ白の疑い
const BLANK_ROOT_CHARS = 2000; // DOM にこれだけ中身があるなら白いのは異常

const SETTLE_TIMEOUT = 15000; // 描画待ちの上限
const SETTLE_QUIET = 400;     // DOM がこの時間変化しなければ「落ち着いた」とみなす

/** ページ内で実行され、描画が落ち着くまで待つ */
const SETTLE_FN = /* js */ `
async (timeout, quiet) => {
  const root = document.getElementById("root") || document.body;
  const started = Date.now();

  const rootReady = () => (root.innerHTML || "").length > 200;

  // 1. #root に中身が入るまで
  while (!rootReady() && Date.now() - started < timeout) {
    await new Promise(r => setTimeout(r, 100));
  }

  // 2. DOM の変化が quiet ミリ秒止まるまで
  await new Promise((resolve) => {
    let timer = setTimeout(resolve, quiet);
    const obs = new MutationObserver(() => {
      clearTimeout(timer);
      if (Date.now() - started > timeout) return resolve();
      timer = setTimeout(resolve, quiet);
    });
    obs.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
    setTimeout(resolve, Math.max(0, timeout - (Date.now() - started)));
  });

  // 3. フォント（永久に解決しないことがあるので時間で打ち切る）
  await Promise.race([
    (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
    new Promise(r => setTimeout(r, 2000)),
  ]);

  // 描画フレームを 2 回待って確実に反映させる
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  return {
    ok: rootReady(),
    rootSize: (root.innerHTML || "").length,
    fonts: document.fonts ? document.fonts.status : "なし",
    waitedMs: Date.now() - started,
  };
}
`;

/* ------------------------------------------------------------------ */
/* 1 画面ぶんのキャプチャ                                                */
/* ------------------------------------------------------------------ */

async function preparePage(browser, { width, height }) {
  const page = await browser.newPage();
  await page.send("Page.addScriptToEvaluateOnNewDocument", { source: DETERMINISM_SCRIPT });
  await page.send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: false,
  });

  // 画面が白いとき、それが「撮影が早すぎた」のか「JS エラーで描画できていない」のか
  // 区別できないと原因調査に時間がかかるので、例外を拾って記録する。
  page.jsErrors = [];
  page.on("Runtime.exceptionThrown", (p) => {
    const d = p.exceptionDetails;
    const text = d?.exception?.description || d?.text || "不明な例外";
    page.jsErrors.push(String(text).split("\n")[0].slice(0, 200));
  });

  return page;
}

/** 1 画面の処理に上限をつける。1 枚の壊れたページで全体を止めないため。 */
function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, rej) => {
      timer = setTimeout(() => rej(new Error(`${label} が ${ms}ms を超えました`)), ms);
    }),
  ]);
}

async function capture(page, url, { height }) {
  page.jsErrors = [];
  const loaded = page.once("Page.loadEventFired", { timeout: 20000 }).catch(() => null);
  await page.send("Page.navigate", { url });
  await loaded;

  // 描画が本当に終わるまで待つ。
  //
  // load イベントだけでは足りない。jspdf/html2canvas のような重い依存を持つ画面は
  // vite が初回変換している間 #root が空のままで、白い画像が撮れてしまう。
  // 白い画像は後のピクセル比較で巨大な誤検出になるので、
  //   1. #root に中身が入る
  //   2. DOM の変化が止まる
  //   3. フォントが読み終わる
  // の 3 つが揃うまで待ち、それでもダメなら時間で打ち切る。
  const settled = await page.send("Runtime.evaluate", {
    expression: `(${SETTLE_FN})(${SETTLE_TIMEOUT}, ${SETTLE_QUIET})`,
    awaitPromise: true,
    returnByValue: true,
  }, { timeout: SETTLE_TIMEOUT + 5000 }).catch(() => null);

  const state = settled?.result?.value;
  if (state && !state.ok) {
    throw new Error(
      `描画が終わりませんでした (root:${state.rootSize}文字, fonts:${state.fonts})`,
    );
  }
  await new Promise((r) => setTimeout(r, 150));

  // ページ全体の高さを測る（極端に長いページは頭打ちにする）
  const { result } = await page.send("Runtime.evaluate", {
    expression:
      `JSON.stringify({h: Math.min(Math.max(document.documentElement.scrollHeight, ${height}), 4000)})`,
    returnByValue: true,
  });
  const fullHeight = JSON.parse(result.value).h;

  const width = await currentWidth(page);
  const shoot = async () => {
    const shot = await page.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: fullHeight, scale: 1 },
    });
    return shot.data;
  };

  // 同じ絵が 2 回連続で撮れるまで撮り直す。
  //
  // 編集直後は vite が該当ルートを再コンパイルし HMR が走るため、
  // 1 回撮っただけでは中間状態（描画途中・HMR の一瞬のちらつき）を
  // 掴んでしまい、実際には変わっていない画面が「98% 変化」と出た。
  // 追加のナビゲーションは要らず、撮影をもう 1 回するだけなので安い。
  let png = await shoot();
  let stable = false;
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 350));
    const again = await shoot();
    if (again === png) { stable = true; break; }
    png = again;
  }

  return {
    png,
    stable,
    rootSize: state?.rootSize ?? 0,
    jsErrors: [...new Set(page.jsErrors)].slice(0, 5),
  };
}

async function currentWidth(page) {
  const { result } = await page.send("Runtime.evaluate", {
    expression: "document.documentElement.clientWidth",
    returnByValue: true,
  });
  return result.value;
}

/* ------------------------------------------------------------------ */
/* メイン                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const map = JSON.parse(fs.readFileSync(path.join(__dirname, "screen-map.json"), "utf8"));
  const edits = (() => {
    try {
      return JSON.parse(fs.readFileSync(path.join(__dirname, "edited_screens.json"), "utf8"));
    } catch {
      return { screens: {} };
    }
  })();

  const port = await findDevServer(args.port);
  if (!port) {
    console.error(
      "dev サーバーが見つかりません。先に `npm run dev` を起動してから、\n" +
      "必要なら --port でポートを指定してください。",
    );
    process.exit(1);
  }
  const origin = `http://localhost:${port}`;

  // 対象の画面を決める
  let targets = map.screens.filter((s) => (s.routes || []).length > 0);
  if (args.mode === "changed") {
    const ids = new Set(Object.keys(edits.screens || {}));
    targets = targets.filter((s) => ids.has(s.id));
  }
  if (args.only) {
    const q = args.only.toLowerCase();
    targets = targets.filter(
      (s) => s.displayName.toLowerCase().includes(q) || s.filePath.toLowerCase().includes(q),
    );
  }

  if (!targets.length) {
    console.log(
      args.mode === "changed"
        ? "変更された画面がありません。先に --baseline で基準を撮ってください。"
        : "対象の画面がありません。",
    );
    return;
  }

  for (const d of Object.values(DIRS)) fs.mkdirSync(d, { recursive: true });

  const outDir = args.mode === "baseline" ? DIRS.before : DIRS.after;

  // 中断したところから続ける
  if (args.resume) {
    const before = targets.length;
    targets = targets.filter((s) => !fs.existsSync(path.join(outDir, `${s.id}.png`)));
    console.log(`--resume: 撮影済み ${before - targets.length} 画面をとばします`);
  }
  const { resolveRoute } = buildResolver(map.screens);

  console.log(`dev サーバー: ${origin}`);
  console.log(`対象: ${targets.length} 画面 / 保存先: ${path.relative(ROOT, outDir)}`);
  console.log("Chrome を起動しています…");

  const { wsUrl, proc } = await launchChrome({ width: args.width, height: args.height });
  const browser = await connect(wsUrl);

  const index = (() => {
    try {
      return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
    } catch {
      return { capturedAt: null, viewportWidth: args.width, screens: {} };
    }
  })();
  index.viewportWidth = args.width;

  // 差分計算用の作業ページ（about:blank のまま canvas だけ使う）
  const worker = await browser.newPage();

  let done = 0;
  const failures = [];
  const blanks = [];
  const unstables = [];
  const queue = [...targets];

  async function runWorker(n) {
    let page = await preparePage(browser, args);
    // サムネイル生成用の canvas ページはワーカーごとに持つ。
    // 1 枚を共有すると、そこで全ワーカーが直列化して撮影速度が数倍遅くなる。
    const canvas = await browser.newPage();
    while (queue.length) {
      const screen = queue.shift();
      const route = resolveRoute(screen.routes[0], screen);
      const url = origin + route;
      try {
        // 中身があるはずなのに真っ白な絵が撮れることがある（描画待ちを抜けても
        // コンポジタが描き終わっていないケース）。白い基準画像は後の比較で
        // 「全面が変わった」という誤検出になるので、疑わしければ撮り直す。
        let png = null;
        let jsErrors = [];
        let unstable = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          const r = await withTimeout(capture(page, url, args), 60000, screen.displayName);
          png = r.png;
          jsErrors = r.jsErrors;
          unstable = !r.stable;
          const bytes = Buffer.byteLength(png, "base64");
          // JS エラーで落ちている画面は撮り直しても白いままなので、粘らない
          if (jsErrors.length) {
            blanks.push({ screen: screen.displayName, url, bytes, jsErrors });
            break;
          }
          const looksBlank = bytes < BLANK_BYTES && r.rootSize > BLANK_ROOT_CHARS;
          if (!looksBlank) break;
          if (attempt === 3) {
            blanks.push({ screen: screen.displayName, url, bytes, rootSize: r.rootSize, jsErrors });
            break;
          }
          await new Promise((r2) => setTimeout(r2, 700 * attempt));
        }
        fs.writeFileSync(path.join(outDir, `${screen.id}.png`), Buffer.from(png, "base64"));

        const entry = (index.screens[screen.id] ||= {});
        entry.displayName = screen.displayName;
        entry.filePath = screen.filePath;
        entry.url = route;
        entry.capturedAt = new Date().toISOString();
        entry.jsErrors = jsErrors.length ? jsErrors : undefined;
        entry.unstable = unstable || undefined;
        if (unstable) unstables.push(screen.displayName);
        if (args.mode === "baseline") {
          entry.hasBefore = true;
          entry.hasAfter = false;
          entry.diff = null;
        } else {
          entry.hasAfter = true;
        }

        // サムネイル（グリッド用）は常に最新の絵から作る
        const thumb = await makeThumb(canvas, png, 360);
        fs.writeFileSync(path.join(DIRS.thumb, `${screen.id}.jpg`), Buffer.from(thumb, "base64"));
      } catch (e) {
        failures.push({ screen: screen.displayName, url, error: e.message });
        // 固まったページは以降も応答しないので、作り直す
        try {
          await page.send("Page.close", {}, { timeout: 5000 });
        } catch { /* 既に死んでいる */ }
        page = await preparePage(browser, args);
      }
      done++;
      if (done % 5 === 0 || done === targets.length) {
        const failed =
          (failures.length ? ` 失敗 ${failures.length}` : "") +
          (blanks.length ? ` 白紙 ${blanks.length}` : "");
        // ログにリダイレクトされることも多いので \r ではなく行で出す
        const line = `  撮影 ${done}/${targets.length}${failed}`;
        if (process.stdout.isTTY) process.stdout.write(`\r${line}   `);
        else console.log(line);
      }
    }
    await page.send("Page.close").catch(() => {});
    await canvas.send("Page.close").catch(() => {});
  }

  await Promise.all(
    Array.from({ length: Math.min(args.concurrency, targets.length) }, (_, i) => runWorker(i)),
  );
  if (process.stdout.isTTY) process.stdout.write("\n");

  /* ---- 差分 ---- */
  if (args.mode !== "baseline") {
    console.log("変更前と比較しています…");
    let diffed = 0;
    for (const screen of targets) {
      const bPath = path.join(DIRS.before, `${screen.id}.png`);
      const aPath = path.join(DIRS.after, `${screen.id}.png`);
      if (!fs.existsSync(bPath) || !fs.existsSync(aPath)) continue;

      try {
        const res = await diffPngs(
          worker,
          fs.readFileSync(bPath).toString("base64"),
          fs.readFileSync(aPath).toString("base64"),
        );
        fs.writeFileSync(path.join(DIRS.diff, `${screen.id}.png`), Buffer.from(res.png, "base64"));
        const entry = (index.screens[screen.id] ||= {});
        entry.diff = {
          changed: res.changed,
          total: res.total,
          ratio: res.ratio,
          boxes: res.boxes,
          shift: res.shift,
          sizeChanged: res.sizeChanged,
          width: res.width,
          height: res.height,
        };
        diffed++;
      } catch (e) {
        failures.push({ screen: screen.displayName, url: "(diff)", error: e.message });
      }
    }
    console.log(`  ${diffed} 画面を比較しました`);
  }

  index.capturedAt = new Date().toISOString();
  index.mode = args.mode;
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

  browser.close();
  proc.kill();

  /* ---- 結果 ---- */
  console.log("");
  if (args.mode === "baseline") {
    console.log(`✓ 基準スクリーンショットを ${targets.length - failures.length} 画面ぶん保存しました`);
    console.log("  この後 Claude に編集を頼み、node .claude/capture-screens.cjs で比較できます");
  } else {
    // 今回撮った画面だけを対象にする。
    // index には過去の実行の差分も残っているので、絞らないと無関係な画面が並ぶ。
    const targetIds = new Set(targets.map((t) => t.id));
    const withDiff = Object.entries(index.screens)
      .filter(([id, s]) => targetIds.has(id) && s.diff && s.diff.changed > 0)
      .map(([, s]) => s)
      .sort((a, b) => b.diff.ratio - a.diff.ratio);
    const unchanged = [...targetIds].filter(
      (id) => index.screens[id]?.diff && index.screens[id].diff.changed === 0,
    ).length;
    if (withDiff.length) {
      console.log("見た目が変わった画面:");
      for (const s of withDiff.slice(0, 25)) {
        const pct = (s.diff.ratio * 100).toFixed(2);
        const sh = s.diff.shift;
        const note = sh
          ? `  ← 大半は ${sh.dy > 0 ? "下" : "上"}に ${Math.abs(sh.dy)}px ずれただけ`
          : "";
        console.log(`  ${s.displayName.padEnd(26)} ${pct.padStart(6)}% (${s.diff.boxes.length} 箇所)${note}`);
      }
      console.log(`\n  見た目が変わらなかった画面: ${unchanged} / ${targets.length}`);
    } else {
      console.log(`ピクセル単位の見た目の変化はありませんでした（${targets.length} 画面を比較）。`);
    }
  }

  if (unstables.length) {
    console.log(
      `\n⚠ ${unstables.length} 画面は描画が安定しませんでした（差分が信頼できません）:`,
    );
    console.log(`  ${unstables.slice(0, 10).join(", ")}`);
    console.log("  少し待ってから撮り直すと安定することが多いです。");
  }

  if (blanks.length) {
    console.log(`\n⚠ ${blanks.length} 件は 3 回撮り直しても真っ白でした（基準として使えません）:`);
    for (const b of blanks) {
      console.log(`  ${b.screen} — ${b.url}`);
      for (const e of b.jsErrors || []) console.log(`      JSエラー: ${e}`);
    }
    console.log("  JSエラーが出ている画面はアプリ側の不具合です（撮り直しても直りません）。");
  }

  if (failures.length) {
    console.log(`\n⚠ ${failures.length} 件は撮影できませんでした:`);
    for (const f of failures.slice(0, 8)) console.log(`  ${f.screen} — ${f.error}`);
  }
  console.log("\nマップで見る → node .claude/serve-map.cjs");
}

main().catch((e) => {
  console.error("失敗:", e.message);
  process.exit(1);
});
