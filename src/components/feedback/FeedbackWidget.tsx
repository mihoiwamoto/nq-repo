/**
 * 画面右下の「フィードバック」ボタンと、押すと右側から出てくるパネル。
 *
 * どの画面にいても、今見ている画面に対する不具合・改善案・質問を書き残せる。
 * 対象画面は URL から自動で判定する（画面説明キャンバスと同じ画面マップを使う）。
 * 「画面上の場所を選ぶ」を押すと、画面の要素をクリックして「ここ」をピンポイントに指定できる。
 * 選んだ場所は、パネルを開いている間ピンとして画面上に出る。
 *
 * パネルはモーダルではない。開いたまま裏の画面を操作・遷移でき、対象画面は遷移先に追従する。
 * 開閉状態は sessionStorage に持ち、リロードしても開いたまま。
 *
 * 画面説明キャンバスが iframe に画面を埋め込んでいるときは、中のボタンは出さない
 * （外側のキャンバスに自分のコメント機能があるので二重になる）。
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { CATEGORY_LABELS, findScreenByPathname } from "../../admin/features/guide/screenCatalog";
import { screenBreadcrumb } from "./screenBreadcrumb";
import { isRootElement, resolveSelector, selectorFor, targetLabel } from "../../admin/features/guide/domInspector";
import {
  COMPANY_LABELS,
  COMPANY_ORDER,
  KIND_LABELS,
  KIND_ORDER,
  companyLabel,
  formatFeedbackTime,
  initialAuthor,
  initialCompany,
  saveFeedbackAuthor,
  saveFeedbackCompany,
  sortNewestFirst,
  spotDisplay,
  feedbackHeadline,
  feedbackDetail,
  isUnresolved,
  FEEDBACK_OPEN_EVENT,
  STATUS_CHIP_CLASS,
  STATUS_LABELS,
  useFeedback,
  type FeedbackCompany,
  type FeedbackEntry,
  type FeedbackKind,
  type FeedbackOpenDetail,
  type FeedbackSpot,
} from "./feedbackStore";

const PANEL_TITLE_ID = "nq-feedback-panel-title";
/** パネルの幅（px）。場所選びの案内をパネルに隠れない位置に出すのに使う */
const PANEL_WIDTH = 400;
/** パネルの開閉状態。別画面へ遷移してもリロードしても開いたままにするため、タブ単位で覚えておく */
const OPEN_KEY = "nq_feedback_panel_open";
/** フィードバック UI 自身（ボタン・パネル・ピン）に付ける印。場所選びの対象から外す */
const OWN_ATTR = "data-nq-feedback";
const own = { [OWN_ATTR]: "" } as Record<string, string>;

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

/** 一覧の絞り込み: 今の画面だけ / 全画面 */
type ListScope = "screen" | "all";

/** 種類ごとのバッジ色 */
const KIND_STYLES: Record<FeedbackKind, string> = {
  bug: "bg-[#fdecec] text-[#c8322b]",
  improvement: "bg-[#e6f5ec] text-[var(--semantic-brand-primary)]",
  question: "bg-[#e8f1fd] text-[#2f6fc4]",
  other: "bg-[#eeeeee] text-[var(--semantic-text-secondary)]",
};

type TargetScreen = { id?: string; title: string; category: string; pathname: string };

/** 今の URL から「どの画面へのフィードバックか」を決める */
function resolveTarget(pathname: string): TargetScreen {
  const screen = findScreenByPathname(pathname);
  if (screen) return { id: screen.id, title: screen.title, category: CATEGORY_LABELS[screen.category], pathname };
  const category = pathname.startsWith("/admin") ? "管理画面" : pathname.startsWith("/app") ? "アプリ" : "共通";
  const title = pathname === "/" ? "ホーム" : pathname;
  return { title, category, pathname };
}

/* ───────────────────────── 場所（spot）まわりのヘルパー ───────────────────────── */

type Box = { x: number; y: number; width: number; height: number };

function isOwnElement(el: Element | null): boolean {
  return !!el?.closest(`[${OWN_ATTR}]`);
}

function isPageElement(el: Element): boolean {
  return isRootElement(el) || el === document.body || el === document.documentElement;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 要素とクリック位置から、保存する場所を作る */
function spotFromElement(el: Element, clientX: number, clientY: number): FeedbackSpot {
  const rect = el.getBoundingClientRect();
  if (isPageElement(el)) return { label: "画面", selector: "#root", text: "", rx: 0.5, ry: 0.5 };
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  return {
    label: targetLabel(el),
    selector: selectorFor(el),
    text,
    rx: rect.width ? clamp01((clientX - rect.left) / rect.width) : 0.5,
    ry: rect.height ? clamp01((clientY - rect.top) / rect.height) : 0.5,
  };
}

/** 選択中に出す要素の呼び名。英語のコンポーネント名は出さず、その場所の文言を使う */
function hoverLabel(el: Element): string {
  if (isPageElement(el)) return "画面ぜんたい";
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 24);
  return text ? `「${text}」` : "ここ";
}

/** 保存した場所を今の DOM から引き直し、画面上の座標にする。要素が無ければ null */
function locateSpot(spot: FeedbackSpot): { x: number; y: number } | null {
  const el = resolveSelector(document, spot.selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left + r.width * spot.rx, y: r.top + r.height * spot.ry };
}

/** 場所選びの最中にホイールで裏の画面をスクロールさせる（覆いがあるので手で流す） */
function scrollAt(el: Element | null, dx: number, dy: number) {
  let cur: Element | null = el;
  while (cur && cur !== document.body) {
    const cs = getComputedStyle(cur);
    const canY = /(auto|scroll)/.test(cs.overflowY) && cur.scrollHeight > cur.clientHeight;
    const canX = /(auto|scroll)/.test(cs.overflowX) && cur.scrollWidth > cur.clientWidth;
    if (canY || canX) {
      cur.scrollBy({ left: canX ? dx : 0, top: canY ? dy : 0 });
      return;
    }
    cur = cur.parentElement;
  }
  window.scrollBy(dx, dy);
}

const IconPin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6-5.2-6-11a6 6 0 0112 0c0 5.8-6 11-6 11z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

/** 対応済みにする */
const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

/** 未対応に戻す */
const IconUndo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 7H5V3" />
    <path d="M5 7a8 8 0 113 9" />
  </svg>
);

/** 削除する */
const IconTrash = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M10 4h4M9.5 7l.6 12M14.5 7l-.6 12M6.5 7l.8 13.2a1 1 0 001 .8h7.4a1 1 0 001-.8L18.5 7" />
  </svg>
);

/* ───────────────────────── 本体 ───────────────────────── */

type FeedbackWidgetProps = {
  /**
   * 右下の丸いボタンを出すか。既定は出す。
   * 動作デモのピル（メニュー内の「フィードバック」）から開く構成のときは false にして、
   * パネルと合図の受け口だけを置く（ボタンが二重に並ばないようにする）。
   */
  showButton?: boolean;
};

export function FeedbackWidget({ showButton = true }: FeedbackWidgetProps = {}) {
  const [open, setOpen] = useState(loadOpen);
  const [picking, setPicking] = useState(false);
  /** 入力中のフィードバックに付ける場所 */
  const [spot, setSpot] = useState<FeedbackSpot | null>(null);
  /** ピンを押して選んだ一覧項目 */
  const [activeId, setActiveId] = useState<string | null>(null);
  /**
   * 今いる画面の代わりに対象にする画面のパス。
   * 動作デモのツールバーから開いたとき、端末枠の中に出している画面を対象にするために使う。
   * 別の画面へ移ったら解除して、いつも通り今いる画面を対象にする。
   */
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const location = useLocation();
  const { entries, openCount, add, setStatus, remove } = useFeedback();
  const target = useMemo(() => resolveTarget(targetPath ?? location.pathname), [targetPath, location.pathname]);
  /** 端末枠の中の画面を対象にしているときは、この画面上で場所を選んでも意味が無いので選ばせない */
  const canPick = targetPath === null;

  // 画面説明キャンバス（iframe）の中では出さない
  const embedded = typeof window !== "undefined" && window.self !== window.top;

  // 開閉状態を覚えておく（ウィジェットは Routes の外にあるので画面遷移では消えないが、リロードにも耐えるように）
  useEffect(() => saveOpen(open), [open]);

  // 別の画面へ移ったら、選んでいた場所は前の画面のものなので捨てる
  useEffect(() => {
    setSpot(null);
    setPicking(false);
    setActiveId(null);
    setTargetPath(null);
  }, [location.pathname]);

  // 右下のボタン以外（動作デモのツールバーなど）から開かれたとき
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<FeedbackOpenDetail>).detail;
      // 今いる画面と同じパスでも、動作デモの端末枠から開いたときは「枠の中の画面」が対象。
      // この画面上（動作デモの上）で場所を選ばせないよう、パスがあれば必ず上書き扱いにする
      const next = detail?.pathname ?? null;
      setTargetPath(next);
      if (next !== null) {
        setSpot(null);
        setPicking(false);
        setActiveId(null);
      }
      setOpen(true);
    };
    window.addEventListener(FEEDBACK_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(FEEDBACK_OPEN_EVENT, onOpen);
  }, []);

  // Esc で閉じる（場所選びの最中は SpotPicker 側が Esc で選びをやめる）
  useEffect(() => {
    if (!open || picking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, picking]);

  /** この画面のフィードバック（新しい順）と、場所付きのものに振るピン番号（古い順に 1, 2, …） */
  const screenEntries = useMemo(
    () => sortNewestFirst(entries.filter((e) => (target.id ? e.screenId === target.id : e.pathname === target.pathname))),
    [entries, target.id, target.pathname]
  );
  const pinNumbers = useMemo(() => {
    const map = new Map<string, number>();
    [...screenEntries]
      .filter((e) => e.spot)
      .sort((a, b) => a.createdAt - b.createdAt)
      .forEach((e, i) => map.set(e.id, i + 1));
    return map;
  }, [screenEntries]);

  /** 画面に出すピン: 未対応で場所付きのもの + 入力中の場所 */
  const markers = useMemo(() => {
    const list = screenEntries
      .filter((e) => e.spot && isUnresolved(e.status))
      .map((e) => ({ id: e.id, spot: e.spot!, n: pinNumbers.get(e.id) ?? null, active: e.id === activeId }));
    if (spot) list.push({ id: "__draft", spot, n: null, active: true });
    return list;
  }, [screenEntries, pinNumbers, activeId, spot]);

  const startPicking = useCallback(() => setPicking(true), []);
  /** 1 つ選んだら選択モードは終わる（選びっぱなしで画面が触れなくなるのを防ぐ）。選び直しは「選び直す」から */
  const handlePick = useCallback((s: FeedbackSpot) => {
    setSpot(s);
    setPicking(false);
  }, []);
  const endPicking = useCallback(() => setPicking(false), []);


  if (embedded) return null;

  return (
    <>
      {showButton && (
      <button
          {...own}
          type="button"
          onClick={() => {
            // 右下のボタンからはいつも「今いる画面」が対象
            setTargetPath(null);
            setOpen((v) => !v);
          }}
          aria-label="フィードバックを送る"
          aria-expanded={open}
          aria-controls="nq-feedback-panel"
          title="フィードバック"
          className="nq-feedback-fab fixed bottom-24 right-24 z-50 w-14 h-14 rounded-full bg-[var(--semantic-brand-primary)] text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:brightness-110"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v10a1.5 1.5 0 01-1.5 1.5H10l-4 3.2V17h-.5A1.5 1.5 0 014 15.5z" />
            <path d="M12 7.5v6M9 10.5h6" />
          </svg>
          {openCount > 0 && (
            <span
              aria-label={`未対応 ${openCount} 件`}
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white"
            >
              {openCount > 99 ? "99+" : openCount}
            </span>
          )}
        </button>
      )}

      {/* 背景は暗くしない。パネルを開いたまま画面を操作・遷移できる（対象画面は遷移先に追従する）。
          場所を選んでいる間も消さない（覆いはパネルより下の層に置くので、パネルはそのまま触れる） */}
      {open && (
        <FeedbackPanel
          target={target}
          entries={entries}
          screenEntries={screenEntries}
          pinNumbers={pinNumbers}
          activeId={activeId}
          spot={spot}
          picking={picking}
          canPick={canPick}
          onPickStart={startPicking}
          onPickEnd={endPicking}
          onClearSpot={() => setSpot(null)}
          onClose={() => setOpen(false)}
          onSubmit={(kind, title, body, author, company) => {
            add({
              kind,
              title: title || undefined,
              body,
              author,
              company,
              spot: spot ?? undefined,
              pathname: target.pathname,
              screenId: target.id,
              screenTitle: target.title,
              screenCategory: target.category,
              // 不具合の再現環境の手がかり（管理画面の詳細ポップアップに出す）
              ua: navigator.userAgent,
            });
            setSpot(null);
            setPicking(false);
          }}
          onToggleStatus={(e) => setStatus(e.id, e.status === "done" ? "open" : "done")}
          onRemove={remove}
        />
      )}

      {/* 端末枠の中の画面を対象にしているときは、ピンの場所はこの画面上には無いので出さない */}
      {open && canPick && markers.length > 0 && <SpotMarkers items={markers} onSelect={setActiveId} />}

      {picking && <SpotPicker onPick={handlePick} onEnd={endPicking} />}

      <style>{`
        @keyframes nq-feedback-slide-in {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nq-feedback-panel {
          animation: nq-feedback-slide-in 0.2s ease-out;
        }
        /* 位置と回転は個別プロパティ（translate / rotate）で指定しているので、ここでは触らない */
        @keyframes nq-feedback-pin-pop {
          from { scale: 0.6; opacity: 0; }
          to { scale: 1; opacity: 1; }
        }
        .nq-feedback-pin {
          animation: nq-feedback-pin-pop 0.18s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .nq-feedback-panel, .nq-feedback-pin { animation: none; }
          .nq-feedback-fab { transition: none; }
        }
      `}</style>
    </>
  );
}

/* ───────────────────────── 場所を選ぶ（画面全体を覆う） ───────────────────────── */

function SpotPicker({
  onPick,
  onEnd,
}: {
  onPick: (spot: FeedbackSpot) => void;
  onEnd: () => void;
}) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ box: Box; label: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEnd();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnd]);

  /** 覆いを一瞬すり抜けさせて、その座標にある裏の要素を取る */
  const elementAt = useCallback((x: number, y: number): Element | null => {
    const layer = layerRef.current;
    if (!layer) return null;
    layer.style.pointerEvents = "none";
    const el = document.elementFromPoint(x, y);
    layer.style.pointerEvents = "";
    if (!el || isOwnElement(el)) return null;
    return el;
  }, []);

  // パネル（z-60）より下の層に置く。パネルは覆われず、そのまま入力・中止ができる
  return createPortal(
    <div {...own} className="fixed inset-0 z-[59] pointer-events-none" aria-live="polite">
      <div
        ref={layerRef}
        className="absolute inset-0 pointer-events-auto cursor-crosshair"
        onMouseMove={(e) => {
          const el = elementAt(e.clientX, e.clientY);
          if (!el) {
            setHover(null);
            return;
          }
          const r = el.getBoundingClientRect();
          setHover({ box: { x: r.left, y: r.top, width: r.width, height: r.height }, label: hoverLabel(el) });
        }}
        onMouseLeave={() => setHover(null)}
        onWheel={(e) => scrollAt(elementAt(e.clientX, e.clientY), e.deltaX, e.deltaY)}
        onClick={(e) => {
          const el = elementAt(e.clientX, e.clientY);
          if (!el) return;
          onPick(spotFromElement(el, e.clientX, e.clientY));
        }}
      />

      {hover && (
        <div
          className="absolute rounded-sm border-2 border-[var(--semantic-brand-primary)] bg-[rgba(0,153,68,0.10)]"
          style={{ left: hover.box.x, top: hover.box.y, width: hover.box.width, height: hover.box.height }}
        >
          <span
            className="absolute left-0 max-w-[320px] truncate rounded bg-[var(--semantic-brand-primary)] px-1.5 py-0.5 text-[11px] font-bold text-white whitespace-nowrap"
            style={hover.box.y > 28 ? { bottom: "100%", marginBottom: 2 } : { top: "100%", marginTop: 2 }}
          >
            {hover.label}
          </span>
        </div>
      )}

      {/* 案内はパネルに隠れない位置（パネルを除いた幅の中央）に出す。
          1 つクリックすれば選択モードは終わるので、文言は 1 つだけ */}
      <div
        className="absolute top-4 -translate-x-1/2 pointer-events-auto flex items-center gap-3 rounded-full bg-[#333] text-white shadow-lg pl-4 pr-2 py-2"
        style={{ left: `calc((100vw - ${PANEL_WIDTH}px) / 2)` }}
      >
        <IconPin className="w-4 h-4 shrink-0" />
        <span className="text-xs font-bold whitespace-nowrap">フィードバックしたい場所をクリックしてください</span>
        <button
          type="button"
          onClick={onEnd}
          className="h-7 px-3 rounded-full bg-white/15 hover:bg-white/25 text-xs font-normal whitespace-nowrap"
        >
          中止 (Esc)
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ───────────────────────── 画面上のピン ───────────────────────── */

type MarkerItem = { id: string; spot: FeedbackSpot; n: number | null; active: boolean };

function SpotMarkers({ items, onSelect }: { items: MarkerItem[]; onSelect: (id: string) => void }) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  // スクロール・リサイズ・DOM の変化に合わせて、ピンの位置を要素から引き直す
  useLayoutEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const next: Record<string, { x: number; y: number }> = {};
      for (const it of items) {
        const p = locateSpot(it.spot);
        if (p) next[it.id] = p;
      }
      setPositions((prev) => {
        const keys = Object.keys(next);
        const same =
          keys.length === Object.keys(prev).length &&
          keys.every((k) => prev[k] && prev[k].x === next[k].x && prev[k].y === next[k].y);
        return same ? prev : next;
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    const root = document.getElementById("root");
    const observer = new MutationObserver(schedule);
    if (root) observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [items]);

  // ピンは #root の外（body 直下）に描く。#root の変化を監視しているので、自分の描画で監視が回り続けないように
  return createPortal(
    <div {...own} className="fixed inset-0 z-[58] pointer-events-none">
      {items.map((it) => {
        const p = positions[it.id];
        if (!p) return null;
        const draft = it.id === "__draft";
        // 45° 回して、角（吹き出しの先）が真下の対象を指すようにする。
        // 回すと角が下へ 0.207×辺 ぶんはみ出すので、その分だけ上へ寄せて先端を対象の点に合わせる。
        const size = draft || it.active ? 28 : 24;
        const tip = size * 0.2071;
        return (
            <button
              key={it.id}
              type="button"
              disabled={draft}
              onClick={() => onSelect(it.id)}
              title={draft ? `入力中: ${spotDisplay(it.spot)}` : `${it.n ?? ""} ${spotDisplay(it.spot)}`.trim()}
              aria-label={draft ? "入力中のフィードバックの場所" : `フィードバック ${it.n ?? ""} の場所`}
              className={`nq-feedback-pin absolute pointer-events-auto flex items-center justify-center rounded-full rounded-br-none border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] text-white text-[11px] font-bold ${
                draft ? "bg-[var(--semantic-brand-primary)] cursor-default" : it.active ? "bg-[#c8322b]" : "bg-[var(--semantic-brand-danger)] hover:scale-110"
              }`}
              style={{
                left: p.x,
                top: p.y,
                width: size,
                height: size,
                // transform ではなく個別プロパティを使う（Tailwind の scale や pop アニメーションと重ならないように）
                translate: `-50% calc(-100% - ${tip.toFixed(1)}px)`,
                rotate: "45deg",
              }}
            >
              {/* 中身は本体の回転を打ち消して、まっすぐ見せる */}
              <span className="flex items-center justify-center" style={{ rotate: "-45deg" }}>
                {draft ? <IconPin className="w-3.5 h-3.5" /> : it.n}
              </span>
            </button>
        );
      })}
    </div>,
    document.body
  );
}

/* ───────────────────────── パネル ───────────────────────── */

function FeedbackPanel({
  target,
  entries,
  screenEntries,
  pinNumbers,
  activeId,
  spot,
  picking,
  canPick,
  onPickStart,
  onPickEnd,
  onClearSpot,
  onClose,
  onSubmit,
  onToggleStatus,
  onRemove,
}: {
  target: TargetScreen;
  entries: FeedbackEntry[];
  /** この画面のフィードバック（新しい順） */
  screenEntries: FeedbackEntry[];
  /** この画面の場所付きフィードバックに振ったピン番号 */
  pinNumbers: Map<string, number>;
  activeId: string | null;
  spot: FeedbackSpot | null;
  /** 画面上の場所を選んでいる最中か */
  picking: boolean;
  /** 場所を選べるか。対象が今いる画面でないとき（動作デモの端末枠の中など）は選べない */
  canPick: boolean;
  onPickStart: () => void;
  onPickEnd: () => void;
  onClearSpot: () => void;
  onClose: () => void;
  onSubmit: (kind: FeedbackKind, title: string, body: string, author: string, company: FeedbackCompany) => void;
  onToggleStatus: (entry: FeedbackEntry) => void;
  onRemove: (id: string) => void;
}) {
  const [kind, setKind] = useState<FeedbackKind>("improvement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState(initialAuthor);
  const [company, setCompany] = useState<FeedbackCompany>(initialCompany);
  const [scope, setScope] = useState<ListScope>("screen");
  const [notice, setNotice] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    textareaRef.current?.focus();
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  // ピンを押したら、その項目が見えるところへ
  useEffect(() => {
    if (!activeId) return;
    listRef.current?.querySelector(`[data-feedback-id="${activeId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const flash = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2500);
  }, []);

  // 件名・内容の両方が必須
  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const trimmedAuthor = author.trim();
    onSubmit(kind, title.trim(), body.trim(), trimmedAuthor, company);
    saveFeedbackAuthor(trimmedAuthor);
    saveFeedbackCompany(company);
    setTitle("");
    setBody("");
    flash("フィードバックを送信しました");
    textareaRef.current?.focus();
  };

  const targetTrail = useMemo(() => screenBreadcrumb(target.pathname, target.title), [target.pathname, target.title]);
  const allEntries = useMemo(() => sortNewestFirst(entries), [entries]);
  const visible = scope === "screen" ? screenEntries : allEntries;
  const isThisScreen = (e: FeedbackEntry) => (target.id ? e.screenId === target.id : e.pathname === target.pathname);

  return (
    <aside
      {...own}
      id="nq-feedback-panel"
      role="complementary"
      aria-labelledby={PANEL_TITLE_ID}
      className="nq-feedback-panel fixed inset-y-0 right-0 z-[60] w-[400px] max-w-full bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.18)] flex flex-col"
    >
      {/* ヘッダー */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-[#eee] shrink-0">
        <h2 id={PANEL_TITLE_ID} className="flex-1 text-base font-bold text-[var(--semantic-text-primary)]">
          フィードバック
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="size-8 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#f0f0f0] hover:text-[var(--semantic-text-primary)]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* 入力フォーム */}
        <section className="px-4 pt-4 pb-4 border-b border-[#eee] flex flex-col gap-3">
          {/* 対象画面 */}
          <div className="rounded-lg bg-[var(--semantic-background-page)] px-3 py-2 flex flex-col gap-0.5">
            <span className="text-[11px] font-normal text-[var(--semantic-text-secondary)]">対象画面</span>
            <span className="text-sm font-bold text-[var(--semantic-text-primary)] truncate">
              <span className="font-normal text-[var(--semantic-text-secondary)]">{targetTrail.slice(0, -1).join(" › ")} › </span>
              {targetTrail[targetTrail.length - 1]}
            </span>
          </div>

          {/* 場所 */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--semantic-text-primary)]">
              場所 <span className="font-normal text-[var(--semantic-text-secondary)]">（省略可）</span>
            </span>
            {picking ? (
              // 選択モード中。1 つクリックすれば終わるので、案内と「中止」だけを出す。
              // 選び直しのときは、まだ前の場所が入っているので下に出しておく（中止すればそこへ戻る）
              <div className="flex flex-col gap-1.5 rounded-lg border-2 border-dashed border-[var(--semantic-brand-primary)] bg-[#f6fbf8] px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <IconPin className="w-4 h-4 shrink-0 text-[var(--semantic-brand-primary)]" />
                  <span className="flex-1 min-w-0 text-xs font-normal leading-snug text-[var(--semantic-text-primary)]">
                    <span className="font-bold text-[var(--semantic-brand-primary)]">選択中</span>{" "}
                    左の画面で、気になる場所をクリックしてください
                  </span>
                  <button
                    type="button"
                    onClick={onPickEnd}
                    className="shrink-0 h-7 px-2.5 rounded-md border border-[#ddd] bg-white text-[11px] font-normal text-[var(--semantic-text-primary)] hover:bg-[#f0f0f0] whitespace-nowrap"
                  >
                    中止
                  </button>
                </div>
                {spot && (
                  <div className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1.5">
                    <span className="shrink-0 text-[11px] font-normal text-[var(--semantic-text-secondary)]">今の場所</span>
                    <span className="flex-1 min-w-0 truncate text-xs font-bold text-[var(--semantic-text-primary)]" title={spotDisplay(spot)}>
                      {spotDisplay(spot)}
                    </span>
                    <button
                      type="button"
                      onClick={onClearSpot}
                      aria-label="場所の選択を解除"
                      className="shrink-0 size-6 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#f0f0f0] hover:text-[var(--semantic-text-primary)]"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : spot ? (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--semantic-brand-primary)] bg-[#e6f5ec] pl-3 pr-1.5 py-1.5">
                <IconPin className="w-4 h-4 shrink-0 text-[var(--semantic-brand-primary)]" />
                <span className="flex-1 min-w-0 truncate text-xs font-bold text-[var(--semantic-text-primary)]" title={spotDisplay(spot)}>
                  {spotDisplay(spot)}
                </span>
                <button
                  type="button"
                  onClick={onPickStart}
                  className="shrink-0 h-7 px-2 rounded-md text-[11px] font-normal text-[var(--semantic-brand-primary)] hover:bg-white"
                >
                  選び直す
                </button>
                <button
                  type="button"
                  onClick={onClearSpot}
                  aria-label="場所の選択を解除"
                  className="shrink-0 size-7 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-white hover:text-[var(--semantic-text-primary)]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            ) : canPick ? (
              <button
                type="button"
                onClick={onPickStart}
                className="h-9 rounded-lg border border-dashed border-[#bbb] text-xs font-normal text-[var(--semantic-text-primary)] hover:border-[var(--semantic-brand-primary)] hover:bg-[#f6fbf8] flex items-center justify-center gap-1.5"
              >
                <IconPin className="w-4 h-4 text-[var(--semantic-brand-primary)]" />
                画面上の場所を選ぶ
              </button>
            ) : (
              // 動作デモの端末枠の中の画面が対象のとき。この画面上で選んだ場所は端末枠の中とは対応しない
              <p className="min-h-9 px-3 py-2 rounded-lg bg-[#f4f4f4] text-[11px] leading-4 text-[var(--semantic-text-secondary)]">
                端末枠の中の画面には場所を指定できません。場所を伝えたいときは本文に書いてください。
              </p>
            )}
          </div>

          {/* 種類 */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--semantic-text-primary)]">種類</span>
            <div role="radiogroup" aria-label="フィードバックの種類" className="grid grid-cols-4 gap-1.5">
              {KIND_ORDER.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  className={`h-9 rounded-lg text-xs border ${
                    kind === k
                      ? "border-[var(--semantic-brand-primary)] bg-[var(--semantic-brand-primary)] text-white font-bold"
                      : "border-[#ddd] text-[var(--semantic-text-primary)] font-normal hover:bg-[#f8f8f8]"
                  }`}
                >
                  {KIND_LABELS[k]}
                </button>
              ))}
            </div>
          </div>

          {/* 件名（必須。一覧の見出しになる） */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--semantic-text-primary)]">
              件名 <span className="text-[var(--semantic-brand-danger)]">*</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              placeholder="ひとことで言うと？"
              className="h-9 w-full rounded-lg border border-[#ddd] px-3 text-sm font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-disabled)] outline-none focus:border-[var(--semantic-brand-primary)]"
            />
          </label>

          {/* 内容 */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--semantic-text-primary)]">
              内容 <span className="text-[var(--semantic-brand-danger)]">*</span>
            </span>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              rows={4}
              placeholder="気になったこと・直してほしいことを書いてください"
              className="w-full rounded-lg border border-[#ddd] px-3 py-2 text-sm font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-disabled)] resize-y outline-none focus:border-[var(--semantic-brand-primary)]"
            />
          </label>

          {/* 所属と名前 */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-bold text-[var(--semantic-text-primary)]">名前</span>
            {/* 所属（既定は西原商会）。矢印は index.css の select 共通スタイルが描く */}
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value as FeedbackCompany)}
              aria-label="所属"
              className="shrink-0 h-9 w-[140px] rounded-lg border border-[#ddd] pl-3 text-sm font-normal text-[var(--semantic-text-primary)] outline-none focus:border-[var(--semantic-brand-primary)]"
            >
              {COMPANY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {COMPANY_LABELS[c]}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              aria-label="名前"
              placeholder="未入力可"
              className="flex-1 min-w-0 h-9 rounded-lg border border-[#ddd] px-3 text-sm font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-disabled)] outline-none focus:border-[var(--semantic-brand-primary)]"
            />
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="h-11 w-full rounded-lg bg-[var(--semantic-brand-primary)] disabled:bg-[#d0d0d0] text-white text-sm font-bold shadow-[0px_2px_2px_rgba(51,51,51,0.24)] disabled:shadow-none"
          >
            送信する
          </button>

          {notice && (
            <p role="status" className="rounded-lg bg-[#e6f5ec] px-3 py-2 text-xs font-bold text-[var(--semantic-brand-primary)]">
              {notice}
            </p>
          )}
        </section>

        {/* 一覧 */}
        <section className="px-4 pt-3 pb-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div role="tablist" aria-label="一覧の範囲" className="flex rounded-lg border border-[#ddd] p-0.5 text-xs">
              {(["screen", "all"] as ListScope[]).map((s) => {
                const count = s === "screen" ? screenEntries.length : allEntries.length;
                const active = scope === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setScope(s)}
                    className={`h-7 px-3 rounded-md ${
                      active ? "bg-[var(--semantic-text-primary)] text-white font-bold" : "text-[var(--semantic-text-primary)] font-normal hover:bg-[#f0f0f0]"
                    }`}
                  >
                    {s === "screen" ? "この画面" : "すべて"} <span className={active ? "opacity-80" : "text-[var(--semantic-text-secondary)]"}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="pt-3 pb-2 text-xs font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
              {scope === "screen" ? "この画面へのフィードバックはまだありません。" : "フィードバックはまだありません。"}
            </p>
          ) : (
            <ul ref={listRef} className="flex flex-col gap-2">
              {visible.map((e) => (
                <FeedbackCard
                  key={e.id}
                  entry={e}
                  n={isThisScreen(e) ? (pinNumbers.get(e.id) ?? null) : null}
                  active={e.id === activeId}
                  showScreen={scope === "all"}
                  onToggleStatus={() => onToggleStatus(e)}
                  onRemove={() => onRemove(e.id)}
                />
              ))}
            </ul>
          )}

          <p className="pt-1 text-[11px] font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
            保存先はこのブラウザ（localStorage）です。
          </p>
        </section>
      </div>
    </aside>
  );
}

function FeedbackCard({
  entry,
  n,
  active,
  showScreen,
  onToggleStatus,
  onRemove,
}: {
  entry: FeedbackEntry;
  /** この画面の場所付きフィードバックならピン番号 */
  n: number | null;
  active: boolean;
  showScreen: boolean;
  onToggleStatus: () => void;
  onRemove: () => void;
}) {
  const done = entry.status === "done";
  return (
    <li
      data-feedback-id={entry.id}
      className={`rounded-lg border px-3 py-2.5 flex flex-col gap-1.5 ${
        active ? "border-[#c8322b] ring-2 ring-[#c8322b]/20 bg-white" : done ? "border-[#eee] bg-[#fafafa]" : "border-[#e5e5e5] bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {n !== null && (
          <span
            className={`shrink-0 size-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center ${done ? "bg-[#bbb]" : "bg-[var(--semantic-brand-danger)]"}`}
            title="画面上のピン番号"
          >
            {n}
          </span>
        )}
        <span className="shrink-0 text-[11px] font-bold text-[var(--semantic-text-secondary)]">No.{entry.no}</span>
        <span className={`shrink-0 h-5 px-2 rounded-full text-[11px] font-bold flex items-center ${STATUS_CHIP_CLASS[entry.status]}`}>
          {STATUS_LABELS[entry.status]}
        </span>
        <span className={`shrink-0 h-5 px-2 rounded-full text-[11px] font-bold flex items-center ${KIND_STYLES[entry.kind]}`}>{KIND_LABELS[entry.kind]}</span>
        {showScreen && (
          <span className="flex-1 min-w-0 truncate text-[11px] font-normal text-[var(--semantic-text-secondary)]" title={entry.pathname}>
            {entry.screenCategory} › {entry.screenTitle}
          </span>
        )}
      </div>
      {entry.spot && (
        <div className="flex items-center gap-1.5 text-[11px] font-normal text-[var(--semantic-text-secondary)]">
          <IconPin className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 min-w-0 truncate" title={spotDisplay(entry.spot)}>
            {spotDisplay(entry.spot)}
          </span>
        </div>
      )}
      <p className={`text-sm leading-relaxed break-words ${done ? "text-[var(--semantic-text-secondary)]" : "text-[var(--semantic-text-primary)]"}`}>
        {feedbackHeadline(entry)}
      </p>
      {feedbackDetail(entry) && (
        <p className="text-xs font-normal leading-relaxed whitespace-pre-wrap break-words text-[var(--semantic-text-secondary)]">
          {feedbackDetail(entry)}
        </p>
      )}
      <div className="flex items-center gap-2 text-[11px] font-normal text-[var(--semantic-text-secondary)]">
        <span className="flex-1 min-w-0 truncate">
          {[companyLabel(entry.company), entry.author].filter(Boolean).map((t) => (
            <span key={t} className="mr-1">
              {t}
            </span>
          ))}
          {formatFeedbackTime(entry.createdAt)}
        </span>
        {/* 操作はアイコンで。何のボタンかは title / aria-label で補う */}
        <button
          type="button"
          onClick={onToggleStatus}
          title={done ? "未対応に戻す" : "対応済みにする"}
          aria-label={done ? "未対応に戻す" : "対応済みにする"}
          className={`shrink-0 size-7 rounded-md flex items-center justify-center hover:bg-[#f0f0f0] ${
            done ? "text-[var(--semantic-brand-primary)]" : "text-[var(--semantic-text-secondary)] hover:text-[var(--semantic-brand-primary)]"
          }`}
        >
          {done ? <IconUndo className="w-4 h-4" /> : <IconCheck className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("このフィードバックを削除しますか？")) onRemove();
          }}
          title="削除する"
          aria-label="削除する"
          className="shrink-0 size-7 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#fdecec] hover:text-[var(--semantic-brand-danger)]"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}
