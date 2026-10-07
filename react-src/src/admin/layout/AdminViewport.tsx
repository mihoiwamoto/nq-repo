/**
 * 画面設計の「プロトタイプで開く」から来たとき（isKit()。枠の中＝?frame=1 は除く）だけ、
 * 管理画面を 1440×960（Figma の管理画面のデザイン・画面設計の管理画面の枠の既定と同じ）ちょうどの枠に収める。
 * アプリの AppViewport（iPad の縁を付けた 768×1024）と同じ考え方（2026-10-07）。
 *
 * 窓が 1440×960 より小さいときは、はみ出さないよう枠ごと縮小する（縦横の比はそのまま）。
 * 枠には常に transform を掛けているので、ダイアログ・トースト（position: fixed）の基準もこの枠になる。
 * 枠の中では h-screen / min-h-screen を枠の高さに読み替える（index.css の .admin-viewport-frame）。
 *
 * それ以外（キットの外・画面設計の枠の中）は何もせず、窓（枠）いっぱいに広げる。
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FRAME, isKit } from "../../frameBridge";

/** 管理画面の大きさ。canvasTypes.ts の DEVICE_SIZES.pc・useDesignScale.ts と合わせること */
export const ADMIN_VIEWPORT_WIDTH = 1440;
export const ADMIN_VIEWPORT_HEIGHT = 960;

/** 枠の周りの余白（index.css の .admin-viewport と合わせること） */
const GAP = 24;

/** 管理画面を 1440×960 の枠に入れて出すか。?kit=1 の印は main.tsx の installFrameBridge() が読み込みのあとで
 * sessionStorage へ写すので、モジュールを読んだ時点ではなく描くときに見る */
export const adminFramed = () => !FRAME && isKit();

export function AdminViewport({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const framed = adminFramed();

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    document.body.classList.add("kit-admin-framed");
    const fit = () => {
      const w = el.clientWidth - GAP * 2;
      const h = el.clientHeight - GAP * 2;
      if (w <= 0 || h <= 0) return;
      setScale(Math.min(1, w / ADMIN_VIEWPORT_WIDTH, h / ADMIN_VIEWPORT_HEIGHT));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.classList.remove("kit-admin-framed");
    };
  }, [framed]);

  if (!framed) return <>{children}</>;
  return (
    <div ref={outerRef} className="admin-viewport">
      <div className="admin-viewport-frame" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
