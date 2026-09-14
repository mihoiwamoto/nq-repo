import { useCallback, useEffect, useMemo, useState } from "react";
import type { EditOp } from "./canvasTypes";

const STORAGE_KEY = "nq_screen_canvas_edits_v1";
/** 保存したことを同じタブの他のコンポーネント（サイドメニューのバッジ等）に知らせる */
const CHANGED_EVENT = "nq-screen-canvas-edits-changed";

type ScreenHistory = { ops: EditOp[]; cursor: number };
type Store = Record<string, ScreenHistory>;

/** 同じ要素の同じプロパティを連続でいじったときは 1 つの操作にまとめる */
const MERGE_WINDOW_MS = 1500;

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* 容量超過などは無視（編集はメモリ上では続けられる） */
  }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
}

/** 全画面ぶんの、まだ取り消されていない編集の件数 */
function countActiveOps(): number {
  return Object.values(loadStore()).reduce((n, h) => n + h.cursor, 0);
}

/** サイドメニューの「画面説明」バッジ用。キャンバスで編集するたびに更新される */
export function useCanvasEditTotal(): number {
  const [total, setTotal] = useState(countActiveOps);
  useEffect(() => {
    const reload = () => setTotal(countActiveOps());
    window.addEventListener(CHANGED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(CHANGED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);
  return total;
}

export function newOpId(): string {
  return `op_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useCanvasEdits(screenId: string | undefined) {
  const [store, setStore] = useState<Store>(loadStore);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const history: ScreenHistory = useMemo(
    () => (screenId ? store[screenId] : undefined) ?? { ops: [], cursor: 0 },
    [store, screenId]
  );

  const update = useCallback(
    (fn: (prev: ScreenHistory) => ScreenHistory) => {
      if (!screenId) return;
      setStore((prev) => ({ ...prev, [screenId]: fn(prev[screenId] ?? { ops: [], cursor: 0 }) }));
    },
    [screenId]
  );

  /** 操作を追加する。やり直し（redo）側の履歴は捨てる。 */
  const push = useCallback(
    (op: EditOp) => {
      update((prev) => {
        const kept = prev.ops.slice(0, prev.cursor);
        const last = kept[kept.length - 1];
        const mergeable =
          last &&
          last.kind === "style" &&
          op.kind === "style" &&
          last.selector === op.selector &&
          last.prop === op.prop &&
          op.at - last.at < MERGE_WINDOW_MS;
        if (mergeable) {
          kept[kept.length - 1] = { ...last, after: op.after, at: op.at };
          return { ops: kept, cursor: kept.length };
        }
        kept.push(op);
        return { ops: kept, cursor: kept.length };
      });
    },
    [update]
  );

  const undo = useCallback(() => update((prev) => ({ ...prev, cursor: Math.max(0, prev.cursor - 1) })), [update]);
  const redo = useCallback(
    () => update((prev) => ({ ...prev, cursor: Math.min(prev.ops.length, prev.cursor + 1) })),
    [update]
  );
  const reset = useCallback(() => update(() => ({ ops: [], cursor: 0 })), [update]);

  /** 「もうコードに反映した」印を付け外しする（プロンプトから外して変更済みに畳む） */
  const setDone = useCallback(
    (id: string, done: boolean) => {
      update((prev) => ({ ...prev, ops: prev.ops.map((op) => (op.id === id ? { ...op, done } : op)) }));
    },
    [update]
  );

  /** 別画面の編集もまとめて件数を出す（画面一覧のバッジ用） */
  const countsByScreen = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [id, h] of Object.entries(store)) if (h.cursor > 0) out[id] = h.cursor;
    return out;
  }, [store]);

  return {
    ops: history.ops,
    cursor: history.cursor,
    activeOps: history.ops.slice(0, history.cursor),
    canUndo: history.cursor > 0,
    canRedo: history.cursor < history.ops.length,
    push,
    undo,
    redo,
    reset,
    setDone,
    countsByScreen,
  };
}

/** hook の外（iframe の load 直後など）から、その画面に今かかっている操作を読む */
export function readActiveOps(screenId: string): EditOp[] {
  const history = loadStore()[screenId];
  return history ? history.ops.slice(0, history.cursor) : [];
}
