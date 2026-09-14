import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { railNav } from "../navigation";

/**
 * 「進捗一覧から入った」状態をレイアウト側で保持する。
 *
 * 記録 → 確認 → 提出完了 と画面をまたぐ間、各画面が location.state に
 * fromProgress を律儀に詰め直さないと消えてしまい、サイドメニューの
 * アクティブタブが「帳票」に戻ってしまっていた。
 * rail のタブ自体（帳票/進捗/確認待ち/点検予定/サイズ/ヘルプ/設定）に
 * 着くまでは進捗から来たものとして扱う。
 * リロードでも消えないよう sessionStorage に置く。
 */
const STORAGE_KEY = "nq.app.fromProgress";

const RAIL_ROOT_PATHS = new Set<string>([...railNav.map((item) => item.path), "/app/text-size"]);

function readFlag(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeFlag(value: boolean) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, "1");
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* プライベートモード等では保持しない（その場合はセッション内のみ） */
  }
}

const ProgressFlowContext = createContext(false);

/** 進捗一覧から入った一連の画面かどうか */
export function useFromProgress() {
  return useContext(ProgressFlowContext);
}

export function ProgressFlowProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sticky, setSticky] = useState(readFlag);

  const pathname = location.pathname.replace(/\/+$/, "") || location.pathname;
  const state = location.state as { fromProgress?: boolean } | null;

  // effect ではなくレンダー時に判定する。effect は paint の後に走るため、
  // rail のタブに戻った直後の 1 フレームだけ「進捗」が点いたままになる
  const fromProgress = RAIL_ROOT_PATHS.has(pathname)
    ? false
    : state?.fromProgress === true || sticky;

  useEffect(() => {
    writeFlag(fromProgress);
    setSticky(fromProgress);
  }, [fromProgress]);

  return (
    <ProgressFlowContext.Provider value={fromProgress}>{children}</ProgressFlowContext.Provider>
  );
}
