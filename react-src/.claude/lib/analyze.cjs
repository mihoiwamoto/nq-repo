/**
 * 画面ファイル(.tsx)を解析して
 *   - structure : サムネイル(ワイヤーフレーム)描画用のブロック列
 *   - sections  : 「どの部分か」を示す行範囲つきの目印
 * を取り出す共有ロジック。generate-screen-map.cjs と track-edits.cjs の両方が使う。
 */

const BLOCK_RULES = [
  { type: "title", re: /<h1\b|text-3xl|text-2xl/ },
  { type: "subtitle", re: /<h2\b|<h3\b|text-xl\b/ },
  { type: "tabs", re: /role="tablist"|<Tabs\b/ },
  { type: "field", re: /<input\b|<textarea\b|<select\b|<Pulldown\b|<Input\b|<TextField\b/ },
  { type: "table", re: /<table\b|<thead\b|<Table\b/ },
  { type: "calendar", re: /<Calendar\b|calendar-grid/ },
  { type: "image", re: /<img\b|<Image\b/ },
  { type: "list", re: /\.map\(\s*\(?[A-Za-z]/ },
  { type: "card", re: /rounded-lg border|rounded-xl border|shadow-sm|<Card\b/ },
  { type: "button", re: /<button\b|<Button\b/ },
];

function extractStructure(source) {
  const jsxStart = source.search(/return\s*\(/);
  const body = jsxStart === -1 ? source : source.slice(jsxStart);

  const blocks = [];
  for (const line of body.split("\n")) {
    for (const rule of BLOCK_RULES) {
      if (rule.re.test(line)) {
        // 同種が連続したらまとめる（ボタン5個並びを5ブロックにしない）
        if (blocks[blocks.length - 1] !== rule.type) blocks.push(rule.type);
        break;
      }
    }
    if (blocks.length >= 14) break;
  }
  return blocks.length ? blocks : ["card"];
}

function extractSections(source) {
  const lines = source.split("\n");
  const sections = [];
  const seen = new Set();

  const push = (name, idx, kind) => {
    const key = name + "@" + idx;
    if (seen.has(key)) return;
    seen.add(key);
    sections.push({ name, startLine: idx + 1, kind });
  };

  lines.forEach((line, idx) => {
    let m =
      line.match(/^\s*(?:export\s+)?(?:default\s+)?function\s+([A-Za-z0-9_]+)/) ||
      line.match(/^\s*(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*[:=].*(?:=>|function)/);
    if (m) return push(m[1], idx, "code");

    // {/* セクション名 */}
    m = line.match(/\{\s*\/\*\s*(.+?)\s*\*\/\s*\}/);
    if (m && m[1].length <= 40) return push(m[1], idx, "comment");

    // <h2>基本情報</h2> のような見出しは画面上の「部分」そのもの
    m = line.match(/<h[1-4][^>]*>\s*([^<{][^<]*?)\s*<\/h[1-4]>/);
    if (m && m[1].trim()) return push(m[1].trim().slice(0, 40), idx, "heading");

    // 日本語ラベルもデザイン上の目印になる
    m = line.match(/>\s*([^<>{}\n]*[぀-ヿ一-鿿][^<>{}\n]*?)\s*</);
    if (m) {
      const label = m[1].trim();
      if (label.length >= 2 && label.length <= 24) push(label, idx, "label");
    }
  });

  sections.sort((a, b) => a.startLine - b.startLine);
  sections.forEach((s, i) => {
    s.endLine = i + 1 < sections.length ? sections[i + 1].startLine - 1 : lines.length;
  });
  return sections;
}

/** 変更された行番号の配列 → それが属するセクション名の一覧 */
function sectionsForLines(sections, lineNumbers) {
  const hit = new Map();
  for (const ln of lineNumbers) {
    // その行を含む最後（=最も近い）のセクションを採用
    let found = null;
    for (const s of sections) {
      if (s.startLine <= ln && ln <= s.endLine) found = s;
    }
    if (!found) continue;
    const key = found.name + "@" + found.startLine;
    if (!hit.has(key)) hit.set(key, { name: found.name, kind: found.kind, lines: 0 });
    hit.get(key).lines++;
  }
  return [...hit.values()].sort((a, b) => b.lines - a.lines);
}

module.exports = { extractStructure, extractSections, sectionsForLines };
