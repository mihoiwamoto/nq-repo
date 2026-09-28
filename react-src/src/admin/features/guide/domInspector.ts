/**
 * iframe に読み込んだ NQ 画面の DOM を調べたり、編集操作（EditOp）を当てたり戻したりする。
 * React の開発ビルドが DOM ノードに残す fiber から、その要素がどのコンポーネント由来かも引く。
 */
import type { EditOp, Rect } from "./canvasTypes";

const ROOT_ID = "root";

/** コンポーネント名として表示しても意味のない、ルーティング/レイアウトの器 */
const IGNORED_COMPONENTS = new Set([
  "App",
  "BasicAuth",
  "BrowserRouter",
  "Router",
  "Routes",
  "Route",
  "RenderedRoute",
  "Outlet",
  "Navigate",
  "StrictMode",
  "Provider",
  "Fragment",
  "AdminLayout",
  "AppLayout",
  "TextSizeProvider",
  "ProgressFlowProvider",
  "AnnouncementBarContext",
]);

export function isRootElement(el: Element): boolean {
  return el.id === ROOT_ID;
}

/** #root からの nth-child パス。ページを再読込しても同じ要素を指せる。 */
export function selectorFor(el: Element): string {
  if (isRootElement(el)) return `#${ROOT_ID}`;
  const segments: string[] = [];
  let current: Element | null = el;
  while (current && !isRootElement(current)) {
    const parent: Element | null = current.parentElement;
    if (!parent) break;
    const index = Array.prototype.indexOf.call(parent.children, current) + 1;
    segments.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
    current = parent;
  }
  return `#${ROOT_ID}>${segments.join(">")}`;
}

export function resolveSelector(doc: Document, selector: string): HTMLElement | null {
  try {
    return doc.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
}

type Fiber = {
  type: unknown;
  return: Fiber | null;
};

function fiberOf(el: Element): Fiber | null {
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
  return key ? ((el as unknown as Record<string, Fiber>)[key] ?? null) : null;
}

function componentNameOf(type: unknown): string | undefined {
  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name || undefined;
  }
  if (type && typeof type === "object") {
    // forwardRef は render、memo は type に中身が入る。Context の Provider/Consumer は無視する
    const obj = type as { render?: { displayName?: string; name?: string }; type?: unknown };
    if (obj.render) return obj.render.displayName || obj.render.name || undefined;
    if (obj.type) return componentNameOf(obj.type);
  }
  return undefined;
}

/** その要素を描いているコンポーネントの連なり（外側 → 内側） */
export function componentChain(el: Element): string[] {
  const names: string[] = [];
  let fiber = fiberOf(el);
  while (fiber) {
    const name = componentNameOf(fiber.type);
    if (
      name &&
      !IGNORED_COMPONENTS.has(name) &&
      !/Context|Provider$/.test(name) &&
      names[names.length - 1] !== name
    ) {
      names.push(name);
    }
    fiber = fiber.return;
  }
  return names.reverse();
}

/** 「PageTitleBar › h1」のような短い名前 */
export function targetLabel(el: Element): string {
  const chain = componentChain(el);
  const tail = chain.slice(-2);
  return [...tail, el.tagName.toLowerCase()].join(" › ");
}

export function directText(el: Element): string {
  return Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? "")
    .join("");
}

/**
 * 画面の中から「その文字が書かれている要素」を探す。
 * 編集追跡が拾った変更部分（「製品コード」などの日本語ラベル）を、
 * 実画面のどこかに重ねて示すために使う。
 * 同じ文字が何度も出る画面（表の見出しなど）があるので、上から順に limit 件まで返す。
 */
export function findElementsByText(doc: Document, text: string, limit = 12): HTMLElement[] {
  const target = text.replace(/\s+/g, " ").trim();
  const out: HTMLElement[] = [];
  if (!target || !doc.body) return out;
  for (const el of Array.from(doc.body.querySelectorAll<HTMLElement>("*"))) {
    if (out.length >= limit) break;
    // 入れ子の外側まで拾うと画面全体が囲まれてしまうので、文字を直接持つ要素だけにする
    const own = directText(el).replace(/\s+/g, " ").trim();
    if (own !== target) continue;
    const whole = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (whole !== target) continue;
    out.push(el);
  }
  // 入力欄の placeholder / value にしか出ない文字もある
  if (out.length === 0) {
    for (const el of Array.from(doc.body.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input,textarea"))) {
      if (out.length >= limit) break;
      if ((el.placeholder ?? "").trim() === target || (el.value ?? "").trim() === target) out.push(el);
    }
  }
  return out;
}

/** 子がテキストだけなら、丸ごとテキストとして編集できる */
export function isTextEditable(el: Element): boolean {
  if (el.childNodes.length === 0) return false;
  if (isFormField(el)) return false;
  return Array.from(el.childNodes).every((n) => n.nodeType === Node.TEXT_NODE);
}

export function isFormField(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA";
}

export function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

export function rgbToHex(value: string): string {
  const m = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (!m) return value;
  if (m[4] !== undefined && Number(m[4]) === 0) return "transparent";
  const hex = [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  return `#${hex}`;
}

export function computedOf(el: Element, prop: string): string {
  const win = el.ownerDocument.defaultView;
  if (!win) return "";
  const value = win.getComputedStyle(el).getPropertyValue(prop).trim();
  return /color/.test(prop) ? rgbToHex(value) : value;
}

/** 選択した要素を短く言い表す（レイヤー一覧・パンくず用） */
export function describeShort(el: Element): string {
  const text = directText(el).trim() || (isFormField(el) ? el.placeholder || el.value : "");
  const chain = componentChain(el);
  const component = chain[chain.length - 1];
  const tag = el.tagName.toLowerCase();
  const head = component ? `${component} › ${tag}` : tag;
  return text ? `${head}「${text.length > 14 ? `${text.slice(0, 14)}…` : text}」` : head;
}

// ---------------------------------------------------------------------------
// 編集操作の適用 / 取り消し
// ---------------------------------------------------------------------------

function insertHtmlAt(parent: Element, index: number, html: string): Element | null {
  const template = parent.ownerDocument.createElement("template");
  template.innerHTML = html.trim();
  const node = template.content.firstElementChild;
  if (!node) return null;
  const reference = parent.children[index] ?? null;
  parent.insertBefore(node, reference);
  return node;
}

function moveChild(parent: Element, fromIndex: number, toIndex: number) {
  const child = parent.children[fromIndex];
  if (!child) return;
  const reference = parent.children[toIndex > fromIndex ? toIndex + 1 : toIndex] ?? null;
  parent.insertBefore(child, reference);
}

function setStyle(el: HTMLElement, prop: string, value: string) {
  if (value === "") el.style.removeProperty(prop);
  else el.style.setProperty(prop, value);
}

export function applyOp(doc: Document, op: EditOp): boolean {
  switch (op.kind) {
    case "style": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      setStyle(el, op.prop, op.after);
      return true;
    }
    case "text": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      el.textContent = op.after;
      return true;
    }
    case "attr": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      if (op.after === null) el.removeAttribute(op.name);
      else el.setAttribute(op.name, op.after);
      if (op.name === "value" && isFormField(el)) el.value = op.after ?? "";
      return true;
    }
    case "hide": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      el.style.setProperty("display", "none");
      return true;
    }
    case "remove": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      el.remove();
      return true;
    }
    case "insert": {
      const parent = resolveSelector(doc, op.parentSelector);
      if (!parent) return false;
      return insertHtmlAt(parent, op.index, op.html) !== null;
    }
    case "move": {
      const parent = resolveSelector(doc, op.parentSelector);
      if (!parent) return false;
      moveChild(parent, op.fromIndex, op.toIndex);
      return true;
    }
    case "reparent": {
      const el = resolveSelector(doc, op.selector);
      const toParent = resolveSelector(doc, op.toParentSelector);
      if (!el || !toParent) return false;
      toParent.insertBefore(el, toParent.children[op.toIndex] ?? null);
      return true;
    }
  }
}

export function revertOp(doc: Document, op: EditOp): boolean {
  switch (op.kind) {
    case "style": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      setStyle(el, op.prop, op.inlineBefore);
      return true;
    }
    case "text": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      el.textContent = op.before;
      return true;
    }
    case "attr": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      if (op.before === null) el.removeAttribute(op.name);
      else el.setAttribute(op.name, op.before);
      if (op.name === "value" && isFormField(el)) el.value = op.before ?? "";
      return true;
    }
    case "hide": {
      const el = resolveSelector(doc, op.selector);
      if (!el) return false;
      setStyle(el, "display", op.inlineBefore);
      return true;
    }
    case "remove": {
      const parent = resolveSelector(doc, op.parentSelector);
      if (!parent) return false;
      return insertHtmlAt(parent, op.index, op.html) !== null;
    }
    case "insert": {
      const parent = resolveSelector(doc, op.parentSelector);
      if (!parent) return false;
      parent.children[op.index]?.remove();
      return true;
    }
    case "move": {
      const parent = resolveSelector(doc, op.parentSelector);
      if (!parent) return false;
      moveChild(parent, op.toIndex, op.fromIndex);
      return true;
    }
    case "reparent": {
      // 移したあとは selector が効かないので、移した先の位置から拾って戻す
      const toParent = resolveSelector(doc, op.toParentSelector);
      const fromParent = resolveSelector(doc, op.fromParentSelector);
      const el = toParent?.children[op.toIndex];
      if (!el || !fromParent) return false;
      fromParent.insertBefore(el, fromParent.children[op.fromIndex] ?? null);
      return true;
    }
  }
}

export function applyAll(doc: Document, ops: EditOp[]): number {
  let failed = 0;
  for (const op of ops) if (!applyOp(doc, op)) failed += 1;
  return failed;
}

/** 生成した部品などの HTML を、プロンプトに載せられる程度に整える */
export function tidyHtml(html: string): string {
  return html
    .replace(/\s+/g, " ")
    .replace(/> </g, ">\n<")
    .trim();
}
