// usage: PORT=… node cdp2.mjs <planId>  -> json2/<id>.json
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const id = process.argv[2];
const spec = JSON.parse(fs.readFileSync(process.env.PLAN || 'plan.json')).find(s => s.id === id);
const port = +(process.env.PORT || 9800);
const dir = `${process.cwd()}/prof-y-${id}`;
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, `--window-size=${spec.w},${spec.h}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const done = (msg) => { console.log(msg); try { ws && ws.close(); } catch {} try { chrome.kill('SIGKILL'); } catch {} setTimeout(() => { fs.rmSync(dir, { recursive: true, force: true }); process.exit(0); }, 300); };
setTimeout(() => done(`FAIL ${id} timeout`), 60000);
let ws, seq = 0; const pend = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++seq; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description || JSON.stringify(r.exceptionDetails)).slice(0, 300)); return r.result.value; };
try {
  let target;
  for (let i = 0; i < 50; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target = l.find(t => t.type === 'page'); if (target) break; } catch { } await sleep(200); }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await send('Emulation.setDeviceMetricsOverride', { width: spec.w, height: spec.h, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: `http://127.0.0.1:${process.env.KITPORT || 8791}/react/?frame=1${spec.q || ''}#${spec.hash}` });
  await sleep(3000);
  let log = [];
  if (spec.steps.length) {
    await evalJs(fs.readFileSync('act.js', 'utf8'));
    const r = await evalJs(`__act(${JSON.stringify(spec.steps)})`);
    log = r.log; await sleep(900);
  }
  const out = await evalJs(fs.readFileSync('extract.js', 'utf8'));
  fs.mkdirSync('json2', { recursive: true });
  fs.writeFileSync(`json2/${id}.json`, out);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync('shots2', { recursive: true }); fs.writeFileSync(`shots2/${id}.png`, Buffer.from(shot.data, 'base64'));
  const path = await evalJs('location.pathname');
  done(`ok ${id} ${path} ${log.length}`);
} catch (e) { done(`FAIL ${id} ${e.message}`); }
