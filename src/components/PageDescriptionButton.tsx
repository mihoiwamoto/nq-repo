/**
 * 画面右下の青い「i」ボタンと、押すと右側から出てくる画面説明パネル。
 *
 * どの画面にいても、今見ている画面が「何をする画面か / 何ができるか」を読める。
 * 対象画面は URL から自動で判定する（変更履歴キャンバス・フィードバックと同じ画面マップを使う）。
 * 説明の本文は src/components/screen-description/screenDescriptions.ts。
 *
 * パネルはモーダルではない。開いたまま裏の画面を操作・遷移でき、説明は遷移先に追従する。
 * 開閉状態は sessionStorage に持ち、リロードしても開いたまま。
 *
 * 変更履歴キャンバスが iframe に画面を埋め込んでいるときは出さない
 * （キャンバス側から説明を見られるようにする想定。フィードバックボタンと同じ扱い）。
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { findScreenByPathname } from "../admin/features/guide/screenCatalog";
import { SCREEN_DESCRIPTION_PANEL_ID, ScreenDescriptionPanel } from "./screen-description/ScreenDescriptionPanel";

/** パネルの開閉状態。別画面へ遷移してもリロードしても開いたままにするため、タブ単位で覚えておく */
const OPEN_KEY = "nq_screen_description_open";

function loadOpen(): boolean {
  try {
    return sessionStorage.getItem(OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

function saveOpen(open: boolean) {
  try {
    if (open) sessionStorage.setItem(OPEN_KEY, "1");
    else sessionStorage.removeItem(OPEN_KEY);
  } catch {
    /* 無視 */
  }
}

export function PageDescriptionButton() {
  const [open, setOpen] = useState(loadOpen);
  const location = useLocation();
  const screen = useMemo(() => findScreenByPathname(location.pathname), [location.pathname]);

  // 変更履歴キャンバス（iframe）の中では出さない
  const embedded = typeof window !== "undefined" && window.self !== window.top;

  useEffect(() => saveOpen(open), [open]);

  if (embedded) return null;

  return (
    <>
      <button
        // フィードバックの「場所選び」で選ばれないようにする印
        data-nq-feedback=""
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="画面説明を表示"
        aria-expanded={open}
        aria-controls={SCREEN_DESCRIPTION_PANEL_ID}
        title="画面説明"
        className="page-description-fab fixed bottom-24 right-6 z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* 背景は暗くしない。パネルを開いたまま画面を操作・遷移できる（説明は遷移先に追従する） */}
      {open && <ScreenDescriptionPanel screen={screen} pathname={location.pathname} onClose={() => setOpen(false)} />}

      <style>{`
        @media (max-height: 700px) {
          .page-description-fab {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
