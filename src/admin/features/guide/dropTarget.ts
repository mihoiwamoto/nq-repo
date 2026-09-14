/**
 * キャンバス内でのドラッグ＆ドロップ先の判定。
 *
 * 「今カーソルがある場所に落としたら、どの親の何番目に入るか」を求めて、
 * 挿入位置を示す線（インジケータ）まで作る。要素の並び替えと、部品パネルからの
 * 追加の両方で同じ判定を使う。
 *
 * 座標はすべて iframe の表示領域基準（getBoundingClientRect と同じ）。
 */
import type { Rect } from "./canvasTypes";
import { describeShort } from "./domInspector";

export type DropIndicator = Rect & { kind: "line" | "box"; horizontal: boolean };

export type DropPlacement = {
  parent: HTMLElement;
  /** parent.children の何番目の前に入れるか（末尾なら children.length） */
  index: number;
  indicator: DropIndicator;
  /** 「〇〇 の前」のような、人が読める説明 */
  label: string;
};

/** ドロップ先にできない要素（中身を差し替えると画面が壊れる） */
const UNDROPPABLE = new Set(["HTML", "HEAD", "BODY", "SCRIPT", "STYLE", "IMG", "INPUT", "TEXTAREA", "SELECT", "BR", "HR", "SVG", "PATH"]);

/**
 * iframe の中の要素は、親フレームの HTMLElement とは別のクラスになる。
 * instanceof では判定できないので nodeType で見る。
 */
function isElement(node: Node | null | undefined): node is HTMLElement {
  return !!node && node.nodeType === 1;
}

function elementChildren(parent: Element): HTMLElement[] {
  return Array.prototype.filter.call(parent.children, isElement) as HTMLElement[];
}

/**
 * 横並び（タブやボタンの列）かどうか。
 * 子が 2 つ以上あれば実際の位置関係で決め、無ければ CSS で決める。
 */
function isHorizontal(parent: HTMLElement, children: HTMLElement[]): boolean {
  if (children.length >= 2) {
    const a = children[0].getBoundingClientRect();
    const b = children[1].getBoundingClientRect();
    const sameRow = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > Math.min(a.height, b.height) * 0.5;
    if (sameRow && b.left >= a.left) return true;
    if (b.top >= a.bottom - 2) return false;
  }
  const style = parent.ownerDocument.defaultView?.getComputedStyle(parent);
  if (!style) return false;
  if (style.display.includes("flex")) return style.flexDirection.startsWith("row");
  if (style.display.includes("grid")) return style.gridAutoFlow.startsWith("column");
  return false;
}

/** 挿入位置に引く線。前後の要素の間に置く */
function lineIndicator(parent: HTMLElement, children: HTMLElement[], index: number, horizontal: boolean): DropIndicator {
  const parentRect = parent.getBoundingClientRect();
  const before = children[index - 1]?.getBoundingClientRect();
  const after = children[index]?.getBoundingClientRect();
  const neighbour = after ?? before ?? parentRect;
  if (horizontal) {
    const x = after ? after.left : before ? before.right : parentRect.left + 2;
    return { kind: "line", horizontal: true, x, y: neighbour.top, width: 0, height: Math.max(8, neighbour.height) };
  }
  const y = after ? after.top : before ? before.bottom : parentRect.top + 2;
  return { kind: "line", horizontal: false, x: neighbour.left, y, width: Math.max(8, neighbour.width), height: 0 };
}

/** parent の中で、カーソルがどの子の前に来るかを求める（exclude は居ないものとして扱う） */
function placeInParent(parent: HTMLElement, point: { x: number; y: number }, exclude: HTMLElement | null): DropPlacement | null {
  const all = elementChildren(parent);
  const children = exclude ? all.filter((c) => c !== exclude) : all;
  const horizontal = isHorizontal(parent, children.length >= 2 ? children : all);

  let insertBefore: HTMLElement | null = null;
  for (const child of children) {
    const r = child.getBoundingClientRect();
    const center = horizontal ? r.left + r.width / 2 : r.top + r.height / 2;
    const pos = horizontal ? point.x : point.y;
    if (pos < center) {
      insertBefore = child;
      break;
    }
  }

  const index = insertBefore ? Array.prototype.indexOf.call(parent.children, insertBefore) : parent.children.length;
  if (children.length === 0) {
    const r = parent.getBoundingClientRect();
    return {
      parent,
      index,
      indicator: { kind: "box", horizontal, x: r.left, y: r.top, width: r.width, height: r.height },
      label: `${describeShort(parent)} の中`,
    };
  }
  const visualIndex = insertBefore ? all.indexOf(insertBefore) : all.length;
  return {
    parent,
    index,
    indicator: lineIndicator(parent, all, visualIndex, horizontal),
    label: insertBefore ? `${describeShort(insertBefore)} の前` : `${describeShort(parent)} の最後`,
  };
}

/** 単純な入れ物（子が 1 つだけの親）は、まとめて 1 つの塊として扱う */
function promote(el: HTMLElement, root: HTMLElement): HTMLElement {
  let current = el;
  while (
    current.parentElement &&
    current.parentElement !== root &&
    current.parentElement !== root.ownerDocument.body &&
    elementChildren(current.parentElement).length === 1
  ) {
    current = current.parentElement;
  }
  return current;
}

/** 中に入れられる大きさか（タブやボタンのような小さい要素は「中」ではなく「前後」に入れたい） */
const MIN_CONTAINER_SIZE = 48;

/**
 * カーソル位置からドロップ先を決める。
 *
 * 基本は「指している要素の前 / 後ろ」。ただしカード等の十分に大きい入れ物の
 * 真ん中あたりを指しているときだけ「その中」に入れる。
 *
 * @param dragged 動かしている要素（その中には落とせない）。部品の追加時は null。
 */
export function resolveDrop(doc: Document, point: { x: number; y: number }, dragged: HTMLElement | null): DropPlacement | null {
  const root = doc.getElementById("root");
  if (!root) return null;
  const hit = doc.elementFromPoint(point.x, point.y);
  if (!isElement(hit)) return null;
  if (dragged && (hit === dragged || dragged.contains(hit))) return null;

  // 画面の外側（html/body）や #root そのものに当たったときは #root の中に並べる
  if (hit === doc.documentElement || hit === doc.body || hit === root) return placeInParent(root, point, dragged);
  if (!root.contains(hit)) return null;

  const reference = promote(hit, root);
  const parent = reference.parentElement;
  if (!isElement(parent)) return placeInParent(root, point, dragged);
  if (dragged && (dragged === parent || dragged.contains(parent))) return null;

  // 大きい入れ物の中ほどを指しているなら、その中に入れる
  const rect = reference.getBoundingClientRect();
  if (
    elementChildren(reference).length > 0 &&
    !UNDROPPABLE.has(reference.tagName) &&
    rect.width >= MIN_CONTAINER_SIZE &&
    rect.height >= MIN_CONTAINER_SIZE
  ) {
    const horizontal = isHorizontal(parent, elementChildren(parent));
    const ratio = horizontal ? (point.x - rect.left) / rect.width : (point.y - rect.top) / rect.height;
    if (ratio > 0.25 && ratio < 0.75) {
      const inside = placeInParent(reference, point, dragged);
      if (inside && !(dragged && dragged.contains(inside.parent))) return inside;
    }
  }

  return placeInParent(parent, point, dragged);
}
