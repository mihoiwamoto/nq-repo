/**
 * 画面上コーチマーク。今見ている画面の上に半透明の幕を重ね、
 * 「機能」ごとに番号付きのマークと吹き出しを出して、その画面が何をする画面かを細かく説明する。
 *
 * 開き方: 右下の「動作デモ」ピル › 資料 › 画面説明（openScreenCoachMarks()）。
 * 動作デモ（端末枠の iframe）を開いているときは、iframe の中の文書で開く（postMessage で合図）。
 *
 * 構成:
 *   - 幕（SVG のマスク）: 各マークの範囲だけ切り抜いて明るく残す。今選んでいるマークは緑の枠
 *   - 番号バッジ: 各マークの左上。押すとそのマークの吹き出しに切り替わる
 *   - 吹き出し: 選んでいるマークのそばに出る。見出し・説明・当てはまる箇条書き・前へ/次へ
 *   - 説明カード（右下、ピルの上）: 画面の概要、マークの一覧（押すとジャンプ）、マークに振り分けられなかった箇条書き、補足
 *
 * どこに何を出すかは coachMarks.ts（DOM からの自動検出 + screenDescriptions.ts の箇条書きの振り分け）。
 *
 * 幕はクリックを通す（pointer-events: none）ので、開いたまま裏の画面を触れて、ページ遷移にも追従する。
 * 画面の中身が変わったら（絞り込みを開いた、一覧が読み込まれた等）マークを取り直す。
 * 開閉状態は sessionStorage に持ち、リロードしても開いたまま。
 *
 * 層の順番: 動作デモのオーバーレイ（z-55）・ピル（z-56）・フィードバックの右パネル（z-60）より下（Z_INDEX のコメント参照）。
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { findScreenByPathname } from "../../admin/features/guide/screenCatalog";
import { screenBreadcrumb } from "../feedback/screenBreadcrumb";
import { describeScreenFile, type ScreenDescription } from "./screenDescriptions";
import { descriptionOfState, findOpenScreenState } from "./screenStates";
import { COACH_OWN_ATTR, detectCoachMarks, isHomePath, type CoachMark } from "./coachMarks";
import {
  COACH_MARKS_CLOSE_EVENT,
  COACH_MARKS_MESSAGE_TYPE,
  COACH_MARKS_OPEN_EVENT,
  type CoachMarksMessage,
} from "./coachMarkStore";

const OPEN_KEY = "nq_coach_marks_open";
/**
 * 層の順番。右下の「動作デモ」ピルとその案内メニュー（z-56）より下に置く。
 * コーチマークを開いたままでもピルのメニューから 管理画面/アプリ の切替やフィードバックができるようにするため
 * （最初は z-58 にしていて、説明カードがメニューを隠して押せなくなった）。
 * 動作デモのオーバーレイ（z-55）よりも下だが、動作デモ中のコーチマークは iframe の中で開くので問題ない
 */
const Z_INDEX = 52;
/** 切り抜きの余白（px） */
const PAD = 6;
const CALLOUT_WIDTH = 320;
const BADGE = 26;

/** フィードバックの場所選び・自分自身の再検出から外すための印 */
const own = { "data-nq-feedback": "", [COACH_OWN_ATTR]: "" } as Record<string, string>;

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

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.tagName) return false;
  const tag = node.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || node.isContentEditable;
}

type Rect = { left: number; top: number; width: number; height: number };

function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

const IconInfo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="8" r="0.6" fill="currentColor" />
  </svg>
);

const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const IconClose = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const IconChevron = ({ className, dir }: { className?: string; dir: "left" | "right" | "down" | "up" }) => {
  const d = { left: "M15 6l-6 6 6 6", right: "M9 6l6 6-6 6", down: "M6 9l6 6 6-6", up: "M6 15l6-6 6 6" }[dir];
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
};

/* ───────────────────────── ホスト（開閉の合図を受ける） ───────────────────────── */

/**
 * App.tsx に 1 つ置く。openScreenCoachMarks() の合図と、親フレームからの postMessage を受けて開く。
 * 動作デモの iframe の中でも動く必要があるので、他の右下ウィジェットと違って embedded でも描く。
 */
export function ScreenCoachMarksHost() {
  const [open, setOpen] = useState(loadOpen);

  useEffect(() => saveOpen(open), [open]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data as CoachMarksMessage | undefined;
      if (!data || typeof data !== "object" || data.type !== COACH_MARKS_MESSAGE_TYPE) return;
      setOpen(data.action === "open");
    };
    window.addEventListener(COACH_MARKS_OPEN_EVENT, onOpen);
    window.addEventListener(COACH_MARKS_CLOSE_EVENT, onClose);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener(COACH_MARKS_OPEN_EVENT, onOpen);
      window.removeEventListener(COACH_MARKS_CLOSE_EVENT, onClose);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  if (!open) return null;
  return <ScreenCoachMarks onClose={() => setOpen(false)} />;
}

/* ───────────────────────── 本体 ───────────────────────── */

export function ScreenCoachMarks({ onClose }: { onClose: () => void }) {
  const location = useLocation();
  const screen = useMemo(() => findScreenByPathname(location.pathname), [location.pathname]);
  const pageDescription = screen ? describeScreenFile(screen.filePath) : undefined;
  const isAdmin = location.pathname.startsWith("/admin");
  const isHome = isHomePath(location.pathname);
  const title = screen?.title ?? (location.pathname === "/" ? "ホーム" : location.pathname);
  const trail = screenBreadcrumb(location.pathname, title);

  const [marks, setMarks] = useState<CoachMark[]>([]);
  const [leftover, setLeftover] = useState<string[]>([]);
  /**
   * 画面の上にポップアップ（実施者の選択など）が出ているときの説明。
   * 出ている間は画面そのものではなくポップアップを案内する。
   */
  const [stateLabel, setStateLabel] = useState<string | null>(null);
  const [stateDescription, setStateDescription] = useState<ScreenDescription | undefined>(undefined);
  const description = stateDescription ?? pageDescription;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  /* マークの検出。ページ遷移直後は描画が終わっていないので、少し待って数回取り直す。
     その後も中身が変わったら（絞り込みを開いた等）取り直す */
  const detect = useCallback(() => {
    // ポップアップが出ていれば、その説明とポップアップの中だけに切り替える
    const active = findOpenScreenState(document, pageDescription);
    const shown = descriptionOfState(pageDescription, active);
    setStateLabel(active?.state.label ?? null);
    setStateDescription(active ? shown : undefined);
    const { marks: next, leftoverPoints } = detectCoachMarks(document, shown, isAdmin, isHome, active?.root);
    setMarks((prev) => {
      // 要素・件数が同じなら state を変えない（無駄な再描画を避ける）
      if (prev.length === next.length && prev.every((m, i) => m.el === next[i].el && m.body === next[i].body && m.points.length === next[i].points.length)) {
        return prev;
      }
      return next;
    });
    setLeftover(leftoverPoints);
  }, [pageDescription, isAdmin, isHome]);

  useEffect(() => {
    setActiveId(null);
    const timers = [0, 250, 800, 1600].map((ms) => window.setTimeout(detect, ms));
    return () => timers.forEach(clearTimeout);
  }, [location.pathname, detect]);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    let timer: number | undefined;
    const observer = new MutationObserver(() => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(detect, 300);
    });
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [detect]);

  /* 位置の追従: スクロール・リサイズ・一定間隔で各マークの位置を取り直す */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next: Record<string, Rect> = {};
        for (const m of marks) if (m.el.isConnected) next[m.id] = rectOf(m.el);
        setRects(next);
        setViewport({ w: window.innerWidth, h: window.innerHeight });
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const interval = window.setInterval(update, 200);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      clearInterval(interval);
    };
  }, [marks]);

  const active = useMemo(() => marks.find((m) => m.id === activeId) ?? marks[0], [marks, activeId]);
  const activeIndex = active ? marks.indexOf(active) : -1;

  /** マークを選ぶ。画面外なら見える所までスクロールする */
  const activate = useCallback((mark: CoachMark, scroll = true) => {
    setActiveId(mark.id);
    if (!scroll) return;
    const r = mark.el.getBoundingClientRect();
    const out = r.top < 0 || r.bottom > window.innerHeight || r.left < 0 || r.right > window.innerWidth;
    if (out) mark.el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (!marks.length) return;
      const i = activeIndex < 0 ? 0 : (activeIndex + delta + marks.length) % marks.length;
      activate(marks[i]);
    },
    [marks, activeIndex, activate]
  );

  // Esc で閉じる / ← → で前後のマーク
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  /* 吹き出しの位置。対象の下 → 上 → 右 → 左 の順で入る所に置く。縦長の対象（サイドメニュー等）は横に */
  const calloutRef = useRef<HTMLDivElement>(null);
  const [calloutH, setCalloutH] = useState(200);
  useLayoutEffect(() => {
    if (calloutRef.current) setCalloutH(calloutRef.current.offsetHeight);
  }, [active, rects]);

  const calloutPos = useMemo(() => {
    if (!active) return null;
    const r = rects[active.id];
    if (!r) return null;
    const { w: vw, h: vh } = viewport;
    const gap = 14;
    const clampX = (x: number) => Math.max(12, Math.min(x, vw - CALLOUT_WIDTH - 12));
    const clampY = (y: number) => Math.max(12, Math.min(y, vh - calloutH - 12));
    const tall = r.height > vh * 0.6;
    if (!tall && r.top + r.height + gap + calloutH <= vh - 12) {
      return { left: clampX(r.left), top: r.top + r.height + gap, side: "below" as const };
    }
    if (!tall && r.top - gap - calloutH >= 12) {
      return { left: clampX(r.left), top: r.top - gap - calloutH, side: "above" as const };
    }
    // 横に置くときは、対象の上端から少し下げる（サイドメニューの右に出すときにヘッダーと重ならないように）
    const sideTop = clampY(r.top + (tall ? 88 : 16));
    if (r.left + r.width + gap + CALLOUT_WIDTH <= vw - 12) {
      return { left: r.left + r.width + gap, top: sideTop, side: "right" as const };
    }
    if (r.left - gap - CALLOUT_WIDTH >= 12) {
      return { left: r.left - gap - CALLOUT_WIDTH, top: sideTop, side: "left" as const };
    }
    return { left: clampX(r.left + 24), top: clampY(r.top + 24), side: "inside" as const };
  }, [active, rects, viewport, calloutH]);

  const linkTo = screen && isAdmin ? `/admin/guide/descriptions/${encodeURIComponent(screen.id)}` : null;

  return createPortal(
    <>
      {/* 幕。マークの範囲を切り抜く。クリックは通す */}
      <svg
        {...own}
        className="fixed inset-0 w-full h-full pointer-events-none nq-coach-fade"
        style={{ zIndex: Z_INDEX }}
        width={viewport.w}
        height={viewport.h}
        aria-hidden
      >
        <defs>
          <mask id="nq-coach-mask">
            <rect x={0} y={0} width="100%" height="100%" fill="white" />
            {marks.map((m) => {
              const r = rects[m.id];
              if (!r) return null;
              return <rect key={m.id} x={r.left - PAD} y={r.top - PAD} width={r.width + PAD * 2} height={r.height + PAD * 2} rx={10} fill="black" />;
            })}
          </mask>
        </defs>
        <rect x={0} y={0} width="100%" height="100%" fill="rgba(20,20,20,0.55)" mask="url(#nq-coach-mask)" />
        {marks.map((m) => {
          const r = rects[m.id];
          if (!r) return null;
          const isActive = active?.id === m.id;
          return (
            <rect
              key={m.id}
              x={r.left - PAD}
              y={r.top - PAD}
              width={r.width + PAD * 2}
              height={r.height + PAD * 2}
              rx={10}
              fill="none"
              stroke={isActive ? "var(--semantic-brand-primary)" : "rgba(255,255,255,0.85)"}
              strokeWidth={isActive ? 3 : 1.5}
              strokeDasharray={isActive ? undefined : "5 4"}
            />
          );
        })}
      </svg>

      {/* 番号バッジ */}
      {marks.map((m, i) => {
        const r = rects[m.id];
        if (!r) return null;
        const isActive = active?.id === m.id;
        const left = Math.max(2, Math.min(r.left - PAD - BADGE / 2, viewport.w - BADGE - 2));
        const top = Math.max(2, Math.min(r.top - PAD - BADGE / 2, viewport.h - BADGE - 2));
        return (
          <button
            key={m.id}
            {...own}
            type="button"
            onClick={() => activate(m, false)}
            aria-label={`${i + 1}. ${m.title}`}
            aria-pressed={isActive}
            title={m.title}
            className={`fixed rounded-full text-[12px] font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-transform ${
              isActive
                ? "bg-[var(--semantic-brand-primary)] text-white ring-2 ring-white scale-110"
                : "bg-white text-[var(--semantic-brand-primary)] ring-2 ring-[var(--semantic-brand-primary)] hover:scale-110"
            }`}
            style={{ left, top, width: BADGE, height: BADGE, zIndex: Z_INDEX + 1 }}
          >
            {i + 1}
          </button>
        );
      })}

      {/* 吹き出し */}
      {active && calloutPos && (
        <div
          {...own}
          ref={calloutRef}
          role="dialog"
          aria-label={`${activeIndex + 1}. ${active.title}`}
          className="nq-coach-callout fixed rounded-xl bg-white shadow-[0_10px_36px_rgba(0,0,0,0.3)] border border-[#e6e6e6] text-[var(--semantic-text-primary)]"
          style={{ left: calloutPos.left, top: calloutPos.top, width: CALLOUT_WIDTH, zIndex: Z_INDEX + 2 }}
        >
          <div className="px-4 pt-3 pb-2 flex items-start gap-2.5">
            <span className="mt-0.5 size-6 shrink-0 rounded-full bg-[var(--semantic-brand-primary)] text-white text-[12px] font-bold flex items-center justify-center">
              {activeIndex + 1}
            </span>
            <h3 className="flex-1 min-w-0 text-[14px] font-bold leading-6 break-words">{active.title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="画面説明を閉じる"
              className="size-7 -mr-1.5 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#f0f0f0] hover:text-[var(--semantic-text-primary)]"
            >
              <IconClose className="w-4 h-4" />
            </button>
          </div>
          {(active.body || active.points.length > 0) && (
            <div className="px-4 pb-3 flex flex-col gap-2">
              {active.body && <p className="text-[13px] leading-relaxed whitespace-pre-line break-words">{active.body}</p>}
              {active.points.length > 0 && (
                <ul className="flex flex-col gap-1 pt-1 border-t border-[#f0f0f0]">
                  {active.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[13px] leading-relaxed">
                      <IconCheck className="w-4 h-4 mt-1 shrink-0 text-[var(--semantic-brand-primary)]" />
                      <span className="flex-1 min-w-0 break-words">{p}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="px-3 py-2 border-t border-[#efefef] flex items-center justify-between gap-2 bg-[#fafafa] rounded-b-xl">
            <span className="text-[11px] text-[var(--semantic-text-secondary)] tabular-nums">
              {activeIndex + 1} / {marks.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={marks.length < 2}
                className="h-7 px-2 rounded-md border border-[#ddd] bg-white text-[12px] flex items-center gap-0.5 hover:bg-[#f4f4f4] disabled:opacity-40"
              >
                <IconChevron dir="left" className="w-3.5 h-3.5" />
                前へ
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={marks.length < 2}
                className="h-7 px-2.5 rounded-md bg-[var(--semantic-brand-primary)] text-white text-[12px] font-semibold flex items-center gap-0.5 hover:brightness-110 disabled:opacity-40"
              >
                次へ
                <IconChevron dir="right" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 説明カード（左下） */}
      <aside
        {...own}
        role="complementary"
        aria-label="画面説明"
        // 右下のピル（動作デモ）の上に置く。左下だとサイドメニューや一覧の「操作」列（左端）に重なるため
        className="nq-coach-card fixed right-6 bottom-[76px] rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.28)] border border-[#e6e6e6] text-[var(--semantic-text-primary)] flex flex-col"
        style={{ width: collapsed ? "auto" : 340, maxWidth: "calc(100vw - 2rem)", maxHeight: collapsed ? undefined : "min(70vh, 640px)", zIndex: Z_INDEX + 2 }}
      >
        <div className="h-12 px-3.5 flex items-center gap-2 border-b border-[#eee] shrink-0">
          <IconInfo className="w-5 h-5 text-[var(--semantic-brand-primary)] shrink-0" />
          <h2 className="flex-1 text-[14px] font-bold whitespace-nowrap">
            画面説明
            {collapsed && marks.length > 0 && (
              <span className="ml-2 text-[12px] font-normal text-[var(--semantic-text-secondary)] tabular-nums">
                {activeIndex + 1} / {marks.length}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "説明カードを広げる" : "説明カードをたたむ"}
            aria-expanded={!collapsed}
            className="size-8 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#f0f0f0] hover:text-[var(--semantic-text-primary)]"
          >
            <IconChevron dir={collapsed ? "up" : "down"} className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="画面説明を閉じる"
            className="size-8 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#f0f0f0] hover:text-[var(--semantic-text-primary)]"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {!collapsed && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <section className="px-4 pt-3 pb-3 border-b border-[#eee] flex flex-col gap-1">
              <span className="text-[11px] text-[var(--semantic-text-secondary)] break-words">{trail.slice(0, -1).join(" › ")}</span>
              <h3 className="text-[16px] font-bold leading-snug break-words">
                {title}
                {stateLabel && <span className="text-[var(--semantic-text-secondary)] font-normal"> › {stateLabel}</span>}
              </h3>
              {!screen ? (
                <p className="text-[12px] leading-relaxed text-[var(--semantic-text-secondary)]">この URL は画面一覧に無いページです。見つかった機能だけを案内します。</p>
              ) : !description ? (
                <p className="text-[12px] leading-relaxed text-[var(--semantic-text-secondary)]">
                  この画面の説明はまだ書かれていません。見つかった機能だけを案内します（
                  <code className="font-mono">screenDescriptions.ts</code> に追加できます）。
                </p>
              ) : (
                <p className="text-[13px] leading-relaxed break-words">{description.summary}</p>
              )}
            </section>

            <section className="px-4 pt-3 pb-3 border-b border-[#eee] flex flex-col gap-1.5">
              <h4 className="text-[11px] font-bold text-[var(--semantic-text-secondary)]">
                この画面の機能{marks.length > 0 && <span className="ml-1 tabular-nums">({marks.length})</span>}
              </h4>
              {marks.length === 0 ? (
                <p className="text-[12px] leading-relaxed text-[var(--semantic-text-secondary)]">案内できる部分を探しています…</p>
              ) : (
                <ol className="flex flex-col gap-0.5">
                  {marks.map((m, i) => {
                    const isActive = active?.id === m.id;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => activate(m)}
                          aria-current={isActive ? "true" : undefined}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition ${
                            isActive ? "bg-[#e6f5ec]" : "hover:bg-[#f4f4f4]"
                          }`}
                        >
                          <span
                            className={`size-5 shrink-0 rounded-full text-[11px] font-bold flex items-center justify-center ${
                              isActive
                                ? "bg-[var(--semantic-brand-primary)] text-white"
                                : "bg-white text-[var(--semantic-brand-primary)] ring-1 ring-[var(--semantic-brand-primary)]"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="flex-1 min-w-0 text-[13px] truncate">{m.title}</span>
                          {m.points.length > 0 && (
                            <span className="text-[10px] text-[var(--semantic-text-secondary)] tabular-nums shrink-0">{m.points.length} 点</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            {leftover.length > 0 && (
              <section className="px-4 pt-3 pb-3 border-b border-[#eee] flex flex-col gap-1.5">
                <h4 className="text-[11px] font-bold text-[var(--semantic-text-secondary)]">ほかにできること</h4>
                <ul className="flex flex-col gap-1">
                  {leftover.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[13px] leading-relaxed">
                      <IconCheck className="w-4 h-4 mt-1 shrink-0 text-[var(--semantic-brand-primary)]" />
                      <span className="flex-1 min-w-0 break-words">{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {description?.note && (
              <section className="px-4 pt-3 pb-3 border-b border-[#eee]">
                <div className="rounded-lg bg-[#f6f9ff] border border-[#dbe7fa] px-3 py-2 flex items-start gap-2">
                  <IconInfo className="w-4 h-4 mt-0.5 shrink-0 text-[#2f7fd4]" />
                  <p className="flex-1 min-w-0 text-[12px] leading-relaxed break-words">{description.note}</p>
                </div>
              </section>
            )}

            <section className="px-4 pt-3 pb-3 flex flex-col gap-2">
              {linkTo && (
                <div className="flex gap-2">
                  <Link
                    to={linkTo}
                    onClick={onClose}
                    className="flex-1 h-9 px-3 rounded-lg border border-[#ddd] bg-white text-[12px] hover:bg-[#f7f7f7] flex items-center justify-center"
                  >
                    大きく表示
                  </Link>
                  <Link
                    to="/admin/guide/descriptions"
                    onClick={onClose}
                    className="flex-1 h-9 px-3 rounded-lg border border-[#ddd] bg-white text-[12px] hover:bg-[#f7f7f7] flex items-center justify-center"
                  >
                    ほかの画面の説明
                  </Link>
                </div>
              )}
              <p className="text-[11px] leading-5 text-[var(--semantic-text-secondary)]">
                番号を押すとその部分の説明に移ります。← → キーで前後、Esc で閉じます。開いたまま画面を操作・遷移できます。
              </p>
            </section>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes nq-coach-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes nq-coach-pop {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nq-coach-fade { animation: nq-coach-fade-in 0.2s ease-out; }
        .nq-coach-callout, .nq-coach-card { animation: nq-coach-pop 0.18s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .nq-coach-fade, .nq-coach-callout, .nq-coach-card { animation: none; }
        }
      `}</style>
    </>,
    document.body
  );
}
