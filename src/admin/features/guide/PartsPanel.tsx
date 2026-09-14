import { useLayoutEffect, useRef, useState } from "react";
import { PARTS, PART_COMPONENTS, PART_GROUPS, type Part } from "./parts";

export type InsertPosition = "before" | "inside" | "after";

const POSITION_LABELS: Record<InsertPosition, string> = {
  before: "前に",
  inside: "中の末尾に",
  after: "後ろに",
};

export function PartsPanel({
  hasSelection,
  onInsert,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  hasSelection: boolean;
  onInsert: (part: Part, position: InsertPosition) => void;
  /** カードを掴んだ（キャンバスへドラッグし始めた） */
  onDragStart: (part: Part) => void;
  /** ドラッグ中のカーソル位置（ブラウザ座標） */
  onDragMove: (clientX: number, clientY: number) => void;
  /** 離した。commit=false なら取り消し */
  onDragEnd: (commit: boolean) => void;
}) {
  const [position, setPosition] = useState<InsertPosition>("after");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matches = (part: Part) =>
    !q ||
    part.label.toLowerCase().includes(q) ||
    part.component.toLowerCase().includes(q) ||
    part.description.toLowerCase().includes(q);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-[#e5e5e5] flex flex-col gap-2">
        <p className="text-xs font-normal text-[var(--semantic-text-secondary)]">
          設計ガイド「コンポーネント一覧」と同じ区分の部品を、静的な見た目として置けます（動作はしません）。
          <span className="text-[var(--semantic-brand-primary)]">カードをキャンバスにドラッグ</span>すると、落とした場所に入ります。
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="部品を検索（例: ボタン, タグ）"
          className="h-8 w-full rounded-md border border-[#e5e5e5] bg-white px-2 text-xs font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
        />
        <div className="flex rounded-lg bg-[#f4f4f4] p-0.5 text-xs">
          {(Object.keys(POSITION_LABELS) as InsertPosition[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPosition(p)}
              className={`flex-1 h-7 rounded-md ${
                position === p ? "bg-white text-[var(--semantic-brand-primary)] shadow-sm" : "text-[var(--semantic-text-secondary)]"
              }`}
            >
              {POSITION_LABELS[p]}
            </button>
          ))}
        </div>
        <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)]">
          クリックしたときは、{hasSelection ? "選択中の要素の" : "何も選んでいないときは画面本文の末尾に"}
          {hasSelection ? POSITION_LABELS[position] : ""}追加します
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-5">
        {PART_GROUPS.map((group) => {
          const components = PART_COMPONENTS[group]
            .map((component) => ({
              component,
              parts: PARTS.filter((p) => p.group === group && p.component === component && matches(p)),
            }))
            .filter((c) => c.parts.length > 0);
          if (components.length === 0) return null;
          return (
            <section key={group} className="flex flex-col gap-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--semantic-brand-primary)]">{group}</h3>
              {components.map(({ component, parts }) => (
                <div key={component}>
                  <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)] mb-1">{component}</p>
                  <div className="flex flex-col gap-2">
                    {parts.map((part) => (
                      <PartCard
                        key={part.id}
                        part={part}
                        onClick={() => onInsert(part, position)}
                        onDragStart={onDragStart}
                        onDragMove={onDragMove}
                        onDragEnd={onDragEnd}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}

const DRAG_THRESHOLD = 5;

function PartCard({
  part,
  onClick,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  part: Part;
  onClick: () => void;
  onDragStart: (part: Part) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: (commit: boolean) => void;
}) {
  // 押してから少し動いたらドラッグ。動かさずに離したときは今まで通りクリック扱い。
  const pressRef = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);
  const draggedRef = useRef(false);

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    pressRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging: false };
    // キャンバス（iframe）の上に出ても位置を受け取り続けるために掴んでおく
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const press = pressRef.current;
    if (!press || press.id !== e.pointerId) return;
    if (!press.dragging) {
      if (Math.abs(e.clientX - press.x) < DRAG_THRESHOLD && Math.abs(e.clientY - press.y) < DRAG_THRESHOLD) return;
      press.dragging = true;
      onDragStart(part);
    }
    onDragMove(e.clientX, e.clientY);
  }

  function handlePointerUp(e: React.PointerEvent) {
    const press = pressRef.current;
    pressRef.current = null;
    if (press?.dragging) {
      draggedRef.current = true;
      onDragEnd(true);
    }
    if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }

  function handlePointerCancel() {
    if (pressRef.current?.dragging) onDragEnd(false);
    pressRef.current = null;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      title={part.description}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={() => {
        // ドラッグの終わりに出るクリックでは追加しない（落とした場所にもう入っている）
        if (draggedRef.current) {
          draggedRef.current = false;
          return;
        }
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-grab active:cursor-grabbing overflow-hidden rounded-lg border border-[#e5e5e5] bg-white text-left hover:border-[var(--semantic-brand-primary)] focus:outline-none focus-visible:border-[var(--semantic-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--semantic-brand-primary)]/30 touch-none"
    >
      <PartThumb html={part.html} />
      <div className="flex items-center gap-1 border-t border-[#efefef] px-2 py-1 group-hover:bg-[#f3faf6]">
        <span className="min-w-0 flex-1 truncate text-[11px] font-normal text-[var(--semantic-text-primary)]">{part.label}</span>
        <span className="shrink-0 text-[11px] font-semibold text-[var(--semantic-text-secondary)] group-hover:text-[var(--semantic-brand-primary)]">＋</span>
      </div>
    </div>
  );
}

/**
 * 実物の HTML をそのまま描画し、カードに収まるよう縮小して見せる。
 * 部品は幅 LAYOUT_WIDTH のレイアウト（w-full / max-w-full の部品はこの幅になる）で
 * 一度組んでから、実サイズを測って scale をかける。transform は offsetWidth に
 * 影響しないので、測定 → 縮小の順で 1 回だけで決まる。
 *
 * サイドナビのように極端に縦長の部品は、全体を入れると潰れて何か分からなくなるので
 * MIN_SCALE までしか縮めず、はみ出した下側は切って（フェードを掛けて）見せる。
 */
const LAYOUT_WIDTH = 360;
const MAX_THUMB_HEIGHT = 116;
const MIN_THUMB_HEIGHT = 44;
const THUMB_PADDING = 12;
const MIN_SCALE = 0.35;

function PartThumb({ html }: { html: string }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState({ scale: 1, height: MIN_THUMB_HEIGHT, cropped: false });

  useLayoutEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;
    let alive = true;

    const measure = () => {
      const child = inner.firstElementChild as HTMLElement | null;
      if (!alive || !child) return;
      const w = child.offsetWidth;
      const h = child.offsetHeight;
      const available = box.clientWidth - THUMB_PADDING;
      if (!w || !h || available <= 0) return;
      const byWidth = Math.min(1, available / w);
      const byHeight = (MAX_THUMB_HEIGHT - THUMB_PADDING) / h;
      // 縦を入れるための縮小が効きすぎるときは MIN_SCALE で止めて、下を切る
      const scale = Math.max(Math.min(byWidth, byHeight), Math.min(byWidth, MIN_SCALE));
      const scaledHeight = Math.round(h * scale) + THUMB_PADDING;
      setFit({
        scale,
        height: Math.min(MAX_THUMB_HEIGHT, Math.max(MIN_THUMB_HEIGHT, scaledHeight)),
        cropped: scaledHeight > MAX_THUMB_HEIGHT,
      });
    };

    measure();
    // Web フォントが後から入ると文字幅が変わるので、読み込み後にもう一度合わせる
    document.fonts?.ready.then(measure);

    // パネル幅が変わったときだけ測り直す（高さは自分で変えるので見ない）
    let lastWidth = box.clientWidth;
    const ro = new ResizeObserver(() => {
      if (box.clientWidth === lastWidth) return;
      lastWidth = box.clientWidth;
      measure();
    });
    ro.observe(box);
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [html]);

  return (
    <div ref={boxRef} className="relative w-full overflow-hidden bg-[#f7f7f7]" style={{ height: fit.height }}>
      <div
        ref={innerRef}
        inert
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 flex justify-center ${fit.cropped ? "top-1.5" : "top-1/2"}`}
        style={{
          width: LAYOUT_WIDTH,
          transform: `translate(-50%, ${fit.cropped ? "0" : "-50%"}) scale(${fit.scale})`,
          transformOrigin: fit.cropped ? "top center" : "center",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {fit.cropped && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#f7f7f7] to-transparent" />
      )}
    </div>
  );
}
