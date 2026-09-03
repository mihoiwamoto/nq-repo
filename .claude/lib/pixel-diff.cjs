/**
 * ピクセル差分。
 *
 * PNG のデコードを Node 側で自前実装するのは重いので、
 * すでに起動している Chrome の canvas にやらせる。npm パッケージは不要。
 *
 * 返すもの:
 *   - diff 画像（変わっていない所は薄く、変わった所はマゼンタで塗る）
 *   - 変化したピクセル数 / 割合
 *   - 変化した領域の矩形（「画面のどのあたりが変わったか」を出すため）
 */

/** Chrome 内で実行される関数。文字列化して Runtime.evaluate に渡す。 */
const DIFF_FN = /* js */ `
async (beforeUrl, afterUrl, tolerance, cell) => {
  const load = (src) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("画像を読めませんでした"));
    img.src = src;
  });

  const [a, b] = await Promise.all([load(beforeUrl), load(afterUrl)]);
  const w = Math.max(a.width, b.width);
  const h = Math.max(a.height, b.height);

  const draw = (img) => {
    const c = new OffscreenCanvas(w, h);
    const x = c.getContext("2d", { willReadFrequently: true });
    x.clearRect(0, 0, w, h);
    x.drawImage(img, 0, 0);
    return x.getImageData(0, 0, w, h);
  };

  const A = draw(a), B = draw(b);
  const out = new ImageData(w, h);
  const da = A.data, db = B.data, dout = out.data;

  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const grid = new Uint8Array(cols * rows);
  let changed = 0;

  for (let i = 0; i < dout.length; i += 4) {
    const dr = Math.abs(da[i] - db[i]);
    const dg = Math.abs(da[i+1] - db[i+1]);
    const dbl = Math.abs(da[i+2] - db[i+2]);
    const dal = Math.abs(da[i+3] - db[i+3]);
    const isDiff = dr > tolerance || dg > tolerance || dbl > tolerance || dal > tolerance;

    if (isDiff) {
      changed++;
      dout[i] = 255; dout[i+1] = 0; dout[i+2] = 128; dout[i+3] = 255;
      const px = (i / 4) % w, py = Math.floor((i / 4) / w);
      grid[Math.floor(py / cell) * cols + Math.floor(px / cell)] = 1;
    } else {
      // 変わっていない所は「後」の画像を薄いグレーで下敷きにする
      const lum = (db[i] * 0.299 + db[i+1] * 0.587 + db[i+2] * 0.114);
      const faded = 235 + (lum - 235) * 0.28;
      dout[i] = dout[i+1] = dout[i+2] = faded;
      dout[i+3] = db[i+3] ? 255 : 0;
    }
  }

  // 変化したセルを連結成分でまとめて矩形にする
  const boxes = [];
  const seen = new Uint8Array(grid.length);
  for (let idx = 0; idx < grid.length; idx++) {
    if (!grid[idx] || seen[idx]) continue;
    let minC = idx % cols, maxC = minC, minR = Math.floor(idx / cols), maxR = minR;
    const stack = [idx];
    seen[idx] = 1;
    while (stack.length) {
      const cur = stack.pop();
      const c = cur % cols, r = Math.floor(cur / cols);
      if (c < minC) minC = c; if (c > maxC) maxC = c;
      if (r < minR) minR = r; if (r > maxR) maxR = r;
      for (const [dc, dr2] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nc = c + dc, nr = r + dr2;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const n = nr * cols + nc;
        if (grid[n] && !seen[n]) { seen[n] = 1; stack.push(n); }
      }
    }
    boxes.push({
      x: minC * cell, y: minR * cell,
      w: (maxC - minC + 1) * cell, h: (maxR - minR + 1) * cell,
    });
  }
  boxes.sort((p, q) => q.w * q.h - p.w * p.h);

  // --- 縦ずれの検出 ---
  //
  // 要素を 8px 下げただけでも、それ以下の全ピクセルが動くので
  // 素朴なピクセル比較では「98% が変化」と出てしまい、人間には役に立たない。
  // 行ごとのハッシュを取って「何ピクセル下にずれたか」を割り出し、
  // 「ずれ」と「本当の描き換え」を区別する。
  // 行ハッシュは「変化した列の範囲」だけで取る。
  // サイドバーのように動いていない部分を含めると、
  // 本文が 8px ずれていても行全体としては一致しなくなり、ずれを検出できない。
  let colFrom = 0, colTo = w;
  if (boxes.length) {
    colFrom = Math.min(...boxes.map((b) => b.x));
    colTo = Math.max(...boxes.map((b) => b.x + b.w));
  }
  const step = Math.max(1, Math.floor((colTo - colFrom) / 320));

  const rowSig = (data) => {
    const sig = new Float64Array(h);
    for (let y = 0; y < h; y++) {
      let acc = 0;
      const base = y * w * 4;
      for (let x = colFrom; x < colTo; x += step) {
        const i = base + x * 4;
        acc = (acc * 31 + data[i] * 3 + data[i+1] * 5 + data[i+2] * 7) % 2147483647;
      }
      sig[y] = acc;
    }
    return sig;
  };

  const sigA = rowSig(da), sigB = rowSig(db);
  const MAX_SHIFT = 80;
  let bestDy = 0, bestMatch = 0;
  for (let dy = -MAX_SHIFT; dy <= MAX_SHIFT; dy++) {
    let m = 0;
    for (let y = 0; y < h; y++) {
      const y2 = y + dy;
      if (y2 < 0 || y2 >= h) continue;
      if (sigA[y] === sigB[y2]) m++;
    }
    if (m > bestMatch) { bestMatch = m; bestDy = dy; }
  }
  let zeroMatch = 0;
  for (let y = 0; y < h; y++) if (sigA[y] === sigB[y]) zeroMatch++;

  const shift = (bestDy !== 0 && bestMatch > zeroMatch * 1.15 && bestMatch > h * 0.3)
    ? {
        dy: bestDy,
        matchedRows: bestMatch,
        totalRows: h,
        unshiftedRows: zeroMatch,
        columns: [colFrom, colTo],
      }
    : null;

  // 変化領域を赤枠で囲った画像を書き出す
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.putImageData(out, 0, 0);
  ctx.strokeStyle = "rgba(229,72,77,0.95)";
  ctx.lineWidth = 2;
  for (const bx of boxes.slice(0, 40)) ctx.strokeRect(bx.x + 1, bx.y + 1, bx.w - 2, bx.h - 2);

  const blob = await canvas.convertToBlob({ type: "image/png" });
  const buf = await blob.arrayBuffer();
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 8192) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  }

  return {
    png: btoa(bin),
    width: w, height: h,
    changed, total: w * h,
    ratio: changed / (w * h),
    boxes: boxes.slice(0, 20),
    shift,
    sizeChanged: a.width !== b.width || a.height !== b.height,
  };
}
`;

/** 縮小サムネイルを作る（グリッド表示用） */
const THUMB_FN = /* js */ `
async (url, targetW) => {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("画像を読めませんでした"));
    i.src = url;
  });
  // 縦長すぎるページは上から 4:3 ぶんだけ切り出す（カードの見た目を揃えるため）
  const srcH = Math.min(img.height, Math.round(img.width * 0.75));
  const scale = targetW / img.width;
  const c = new OffscreenCanvas(targetW, Math.round(srcH * scale));
  const x = c.getContext("2d");
  x.imageSmoothingQuality = "high";
  x.drawImage(img, 0, 0, img.width, srcH, 0, 0, c.width, c.height);
  const blob = await c.convertToBlob({ type: "image/jpeg", quality: 0.72 });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  }
  return btoa(bin);
}
`;

/** page(Session) を使って 2 枚の PNG を比較する */
async function diffPngs(page, beforeB64, afterB64, { tolerance = 12, cell = 16 } = {}) {
  const expr =
    `(${DIFF_FN})(` +
    `"data:image/png;base64,${beforeB64}",` +
    `"data:image/png;base64,${afterB64}",` +
    `${tolerance}, ${cell})`;
  const { result, exceptionDetails } = await page.send("Runtime.evaluate", {
    expression: expr,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text || "差分計算に失敗しました");
  return result.value;
}

async function makeThumb(page, pngB64, width = 360) {
  const expr = `(${THUMB_FN})("data:image/png;base64,${pngB64}", ${width})`;
  const { result, exceptionDetails } = await page.send("Runtime.evaluate", {
    expression: expr,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text || "サムネイル生成に失敗しました");
  return result.value;
}

module.exports = { diffPngs, makeThumb };
