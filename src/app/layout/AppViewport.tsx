/**
 * アプリ（/app）を 768×1024（タブレット縦）ちょうどの枠に収める。
 *
 * 管理画面と同じく PC 幅いっぱいに広がっていると、現場で実際に使う見え方と違って見えるため、
 * 動作デモの端末枠（canvasTypes.ts の DEVICE_SIZES.tablet）と同じ大きさに合わせている。
 * 枠の内側は常に 768×1024 なので、出てくるレイアウトは実機と同じ。
 *
 * 窓が 768×1024 より小さいときは、はみ出さないよう枠ごと縮小する（縦横の比はそのまま）。
 * 動作デモ・画面説明キャンバスの端末枠（iframe）はちょうど 768×1024 なので等倍で全面に出る。
 *
 * 枠には常に transform を掛けている。こうするとダイアログ（position: fixed）の基準が
 * 窓ではなくこの枠になり、枠の外まで広がらない。
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

/** アプリの画面サイズ。canvasTypes.ts の DEVICE_SIZES.tablet と合わせること */
export const APP_VIEWPORT_WIDTH = 768;
export const APP_VIEWPORT_HEIGHT = 1024;

export function AppViewport({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 窓の大きさに合わせて枠を縮める。窓ではなく外側の箱を測るので、
  // 端末枠（iframe）の中に入っているときもそのまま効く
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      setScale(Math.min(1, w / APP_VIEWPORT_WIDTH, h / APP_VIEWPORT_HEIGHT));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="app-viewport">
      <div className="app-viewport-frame" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
