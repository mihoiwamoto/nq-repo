/**
 * 「プロトタイプで開く」から来たタブ（isKit）だけで、いま開いている画面の画面説明を右側からパネルで出す。
 * パネル本体は PageDescriptionButton と同じ ScreenDescriptionPanel（説明は screenDescriptions.ts）。
 * 説明は利用者向けの kitUserDescriptions.ts（forUser。開発者向けのチップ・URL・ガイドへのリンクも出さない）。
 * 画面の上に重ねず、AdminLayout のヘッダーの下・メインの右に並べて、メインを狭める（docked）。
 *
 * いまは帳票管理 › 機械器具点検の画面だけ（KIT_DESC_PATHS）。広げるときはここに URL の頭を足す。
 * 対象の画面を開くと自動で出し、閉じたら右下の切替の「?」の左のアイコン（KitSwitch）から開き直せる（2026-10-06 に右端のつまみから移した）。
 * 閉じたかどうかはタブ単位で覚え、対象の画面の中を移っても閉じたままにする。
 * パネルが出ている間は、右下の切替（KitSwitch の .nvsw）をパネルの左へずらす（body の kit-desc-open）。
 */
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { findScreenByPathname } from "../../admin/features/guide/screenCatalog";
import { ScreenDescriptionPanel } from "../screen-description/ScreenDescriptionPanel";

const KIT_DESC_PATHS = ["/admin/ledger-management/equipment-inspection"];
const CLOSED_KEY = "nq_kit_desc_closed";
const EVENT = "nq-kit-desc";

/** 画面説明を出す画面か（右下の切替の「画面説明」のアイコンもこれで出し分ける） */
export function isKitDescPath(pathname: string): boolean {
  return KIT_DESC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function loadClosed(): boolean {
  try {
    return sessionStorage.getItem(CLOSED_KEY) === "1";
  } catch {
    return false;
  }
}

/** 閉じた／開いたを覚える。右下の切替のアイコンとパネルの × の両方から呼ぶ */
export function setKitDescClosed(closed: boolean) {
  try {
    if (closed) sessionStorage.setItem(CLOSED_KEY, "1");
    else sessionStorage.removeItem(CLOSED_KEY);
  } catch {
    /* 無視 */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useKitDescClosed(): boolean {
  return useSyncExternalStore(subscribe, loadClosed, () => false);
}

export function KitScreenDescription() {
  const location = useLocation();
  const target = isKitDescPath(location.pathname);
  const screen = useMemo(() => findScreenByPathname(location.pathname), [location.pathname]);
  const closed = useKitDescClosed();
  const open = target && !closed;

  useEffect(() => {
    document.body.classList.toggle("kit-desc-open", open);
    return () => document.body.classList.remove("kit-desc-open");
  }, [open]);

  if (!open) return null;

  return (
    <>
      <ScreenDescriptionPanel docked forUser screen={screen} pathname={location.pathname} onClose={() => setKitDescClosed(true)} />
      <style>{`
        body.kit-desc-open .nvsw { right: 420px; }
      `}</style>
    </>
  );
}
