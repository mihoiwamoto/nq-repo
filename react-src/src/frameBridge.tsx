/**
 * 画面設計キット（Documents/NQrepo の nqrepo-screen-design.html）の iframe に、この React 実装をそのまま映すためのブリッジ。
 * キットの CLAUDE.md §3「プロトタイプが守る約束」の 5 つを、この 1 ファイルで満たす。
 *
 *   1. ?frame=1 が付いていたら html に .frame を付け、資料用の表示にする（動作デモのピルは出さない）
 *   2. 開く画面は hash（#admin/approvals のように React のルートと同じ形）で決める
 *   3. 画面が変わるたびに親へ {nvideo:'loc', hash} を postMessage で知らせる
 *   4. 親からの {nvideo:'go', hash, flags} で画面と状態を切り替える
 *   5. flags（empty／off／err／session／unsent／role）を demoStore の「状態を試す」と roleStore のロールに写す
 *
 * `nvideo` というキー名はキット共通の合言葉。案件名に変えない。
 * frame のときは何も保存せず、Basic 認証も通す（資料はローカルで開く前提）。
 */
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDemoTrial, setDemoTrial, type DemoTrial } from "./components/demo/demoStore";
import { saveCurrentRole, type PrototypeRoleId } from "./data/roleStore";
import { openFeedbackPanel } from "./components/feedback/feedbackStore";

/** 画面設計の「プロトタイプで開く」から来たときに、画面設計から受け取った資料名などを置く。あれば右下は KitSwitch になる */
export const KIT_INFO_KEY = "nq_kit_info";
export function isKit(): boolean {
  try {
    return !!sessionStorage.getItem(KIT_INFO_KEY);
  } catch {
    return false;
  }
}

export const FRAME =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("frame");

/** キットの状態の印 → 動作デモの「状態を試す」。
 *  「未送信の記録がある」（unsent）は状態を試すには無いので、下の kitUnsent で持つ（オフラインにはしない。送信を押せば送れる） */
const FLAG_TRIAL: Record<string, DemoTrial> = {
  off: "offline",
  empty: "empty",
  err: "error",
  session: "session",
};

/** 画面設計で「未送信の記録がある」を選んでいるか。AppLayout が見て、どの画面でも上に「未送信のデータがあります」の帯を出す
 *  （プロトタイプ HTML の S.app.unsent と同じ）。親から状態が届くたびに KIT_FLAGS_EVENT で知らせる */
const KIT_UNSENT_KEY = "nq_kit_unsent";
let kitUnsent = (() => {
  // 「プロトタイプで開く」のタブでは右下の「状態」から選ぶので、リロードしても残す（枠の中は毎回きれいな状態から）
  if (FRAME) return false;
  try {
    return sessionStorage.getItem(KIT_UNSENT_KEY) === "1";
  } catch {
    return false;
  }
})();
export const KIT_FLAGS_EVENT = "nq-kit-flags";
export const getKitUnsent = () => kitUnsent;
/** 画面設計のユースケースの再生中（flags.fresh）。記録入力を見本の記録の入っていない「未点検」の状態で開き、
 *  画面設計が入力欄を 1 つずつ埋めて見せる（progressRecordFill.ts の useProgressRecordFill が見る。2026-10-02） */
let kitFresh = false;
export const getKitFresh = () => kitFresh;
const ROLES: PrototypeRoleId[] = ["approver_checker", "approver", "checker", "administrator"];

function applyFlags(flags: Record<string, unknown>) {
  const key = Object.keys(FLAG_TRIAL).find((k) => flags[k] && flags[k] !== "0");
  const next = key ? FLAG_TRIAL[key] : null;
  const cur = getDemoTrial();
  // setDemoTrial は同じものを渡すと解除になる。いまと違うときだけ、解除は「いまの値」を渡して行う
  if (cur !== next) setDemoTrial(next === null ? cur : next);
  const role = flags.role;
  if (typeof role === "string" && (ROLES as string[]).includes(role)) saveCurrentRole(role as PrototypeRoleId);
  kitUnsent = !!flags.unsent && flags.unsent !== "0";
  kitFresh = FRAME && !!flags.fresh && flags.fresh !== "0";
  if (!FRAME) {
    try {
      if (kitUnsent) sessionStorage.setItem(KIT_UNSENT_KEY, "1");
      else sessionStorage.removeItem(KIT_UNSENT_KEY);
    } catch {
      /* 無視 */
    }
  }
  window.dispatchEvent(new CustomEvent(KIT_FLAGS_EVENT));
}

/** 画面設計の状態のキー（''／empty／off／unsent／err／session）。「プロトタイプで開く」のタブの右下「状態」が使う */
export function getKitState(): string {
  if (kitUnsent) return "unsent";
  const t = getDemoTrial();
  return (t && Object.keys(FLAG_TRIAL).find((k) => FLAG_TRIAL[k] === t)) || "";
}
export function setKitState(key: string) {
  applyFlags(key ? { [key]: 1 } : {});
}

function postLoc(pathname: string) {
  try {
    window.parent.postMessage({ nvideo: "loc", hash: pathname.replace(/^\//, "") }, "*");
  } catch {
    /* 親が無い */
  }
}

/** React を描く前に 1 回だけ呼ぶ。?frame=1&empty=1#admin/approvals のような URL を、状態と /admin/approvals に読み替える */
export function installFrameBridge() {
  // #admin/… #app/… の形の hash は「開く画面」として読み替える。?frame=1 が無くても効かせるので、
  // 画面設計の「プロトタイプで開く」（react/#admin/approvals）を新しいタブで開いてもその画面が出る
  const kq = new URLSearchParams(window.location.search); // 下で hash を読み替えると消えるので先に読む
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (/^(admin|app)(\/|$)/.test(hash)) {
    try {
      window.history.replaceState(null, "", import.meta.env.BASE_URL.replace(/\/$/, "") + "/" + hash);
    } catch {
      /* 無視 */
    }
  }
  // 画面設計の「プロトタイプで開く」から来たとき（?kit=1&empty=1&role=…）。枠の中と同じ状態・ロールで普通の画面として開く。
  // 認証と途中の状態は、画面設計が window.open で sessionStorage ごと写してくる。直に開かれたときのために認証だけは通す
  if (!FRAME && kq.has("kit")) {
    try {
      sessionStorage.setItem("auth", "true");
      const info = { doc: kq.get("doc") || "", n: Number(kq.get("n")) || 0, demo: kq.get("demo") || "", demoDesc: kq.get("demoDesc") || "" };
      sessionStorage.setItem(KIT_INFO_KEY, JSON.stringify(Object.fromEntries(Object.entries(info).filter(([, v]) => v))));
    } catch {
      /* 無視 */
    }
    applyFlags(Object.fromEntries(kq.entries()));
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      /* 無視 */
    }
    return;
  }
  if (!FRAME) return;
  document.documentElement.classList.add("frame");
  // 枠の中で起きたエラーは親（画面設計）へも知らせる。別オリジンの iframe のコンソールは親から見えないため
  window.addEventListener("error", (e) => {
    try {
      window.parent.postMessage({ nvideo: "error", message: String(e.message), stack: String(e.error?.stack || "") }, "*");
    } catch {
      /* 無視 */
    }
  });
  window.addEventListener("unhandledrejection", (e) => {
    try {
      window.parent.postMessage({ nvideo: "error", message: String(e.reason?.message || e.reason), stack: String(e.reason?.stack || "") }, "*");
    } catch {
      /* 無視 */
    }
  });
  try {
    sessionStorage.setItem("auth", "true");
  } catch {
    /* 無視 */
  }
  // 上で hash を読み替えると search が消えるので、先に読んだ kq を使う（2026-10-02 まで消えたあとを読んでいて、URL の印が効いていなかった）
  applyFlags(Object.fromEntries(kq.entries()));
}

/** BrowserRouter の中に置く。画面が変わったら親へ知らせ、親からの go で画面と状態を切り替える */
export function FrameBridge() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!FRAME) return;
    postLoc(location.pathname);
  }, [location.pathname]);

  // 確認画面のように前の画面から location.state で中身を受け取る画面は、hash だけで開くと「点検内容が見つかりません」になる。
  // 画面遷移図と同じ見本（screenPreviewState.ts の PREVIEW_STATE）を state として差し込む
  useEffect(() => {
    if ((!FRAME && !isKit()) || location.state) return;
    const pathname = location.pathname;
    let cancelled = false;
    Promise.all([import("./admin/features/guide/screenCatalog"), import("./admin/features/guide/screenPreviewState")]).then(
      ([{ findScreenByPathname }, { PREVIEW_STATE }]) => {
        const filePath = findScreenByPathname(pathname)?.filePath;
        const state = filePath ? PREVIEW_STATE[filePath] : undefined;
        if (!cancelled && state !== undefined) navigate(pathname, { replace: true, state });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [navigate, location.pathname, location.state]);

  useEffect(() => {
    if (!FRAME) return;
    const onMessage = (e: MessageEvent) => {
      const m = e.data as { nvideo?: string; hash?: unknown; flags?: Record<string, unknown> } | null;
      // 画面設計の右下 › フィードバック。枠の中のいまの画面を対象にパネルを開く
      if (m && m.nvideo === "feedback") return openFeedbackPanel();
      if (!m || m.nvideo !== "go" || typeof m.hash !== "string") return;
      applyFlags(m.flags || {});
      const to = "/" + m.hash.replace(/^\//, "");
      if (to !== location.pathname) navigate(to, { replace: true });
      else postLoc(location.pathname); // 同じ画面のまま状態だけ変えたときも、親には返事をする
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate, location.pathname]);

  return null;
}
