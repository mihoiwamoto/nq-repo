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
 * 画面設計キット（?frame=1）の枠の中では、枠そのものが端末の大きさ（iPad mini・横向きなど）なので、
 * 768×1024 に固定せず枠いっぱいに広げる。端末の大きさを変えるとレイアウトもその大きさで組み直される。
 *
 * 画面設計の「プロトタイプで開く」から来たとき（isKit()）は、画面設計のアプリの枠（.phone.tablet）と同じ
 * iPad の縁（11px の黒い縁・角丸 26px）を付けて、周りに余白を取る。縁の内側は 768×1024 のまま。
 *
 * 枠には常に transform を掛けている。こうするとダイアログ（position: fixed）の基準が
 * 窓ではなくこの枠になり、枠の外まで広がらない。
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FRAME, isKit } from "../../frameBridge";

/** アプリの画面サイズ。canvasTypes.ts の DEVICE_SIZES.tablet と合わせること */
export const APP_VIEWPORT_WIDTH = 768;
export const APP_VIEWPORT_HEIGHT = 1024;

/** iPad の縁の太さと、周りの余白（index.css の .app-viewport--bezel と合わせること） */
const BEZEL = 11;
const BEZEL_GAP = 24;
const BEZELED = !FRAME && isKit();

export function AppViewport({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 窓の大きさに合わせて枠を縮める。窓ではなく外側の箱を測るので、
  // 端末枠（iframe）の中に入っているときもそのまま効く
  useEffect(() => {
    const el = outerRef.current;
    if (!el || FRAME) return;
    const fit = () => {
      const pad = BEZELED ? BEZEL_GAP * 2 : 0;
      const edge = BEZELED ? BEZEL * 2 : 0;
      const w = el.clientWidth - pad;
      const h = el.clientHeight - pad;
      if (w <= 0 || h <= 0) return;
      setScale(Math.min(1, w / (APP_VIEWPORT_WIDTH + edge), h / (APP_VIEWPORT_HEIGHT + edge)));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className={`app-viewport${BEZELED ? " app-viewport--bezel" : ""}`}>
      <div
        className={`app-viewport-frame${FRAME ? " app-viewport-frame--fill" : ""}${BEZELED ? " app-viewport-frame--bezel" : ""}`}
        style={{ transform: `scale(${FRAME ? 1 : scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
