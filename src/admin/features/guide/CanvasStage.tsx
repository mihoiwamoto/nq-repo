import { useEffect, useRef, type RefObject } from "react";
import { DEVICE_SIZES, type DeviceMode, type Rect, type ToolMode } from "./canvasTypes";
import type { DropIndicator } from "./dropTarget";

export const STAGE_PADDING = 48;
/** After と Before の端末枠のあいだ（画面上の px。ズームしても変わらない） */
export const FRAME_GAP = 48;

/** キャンバスに立てるコメントピン（座標は iframe の表示領域基準） */
export type CommentPin = { id: string; n: number; x: number; y: number; resolved: boolean; active: boolean };

export function CanvasStage({
  stageRef,
  frameRef,
  frameSrc,
  iframeKey,
  onFrameLoad,
  device,
  zoom,
  tool,
  title,
  hoverRect,
  selectRect,
  selectLabel,
  onZoomBy,
  dropIndicator,
  editedRects,
  pins,
  draftPin,
  onPinClick,
  beforeSrc,
  beforeFrameRef,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLIFrameElement | null>;
  frameSrc: string;
  iframeKey: number;
  onFrameLoad: () => void;
  device: DeviceMode;
  zoom: number;
  tool: ToolMode;
  title: string;
  hoverRect: Rect | null;
  selectRect: Rect | null;
  selectLabel: string;
  onZoomBy: (factor: number) => void;
  /** ドラッグ中に「ここに入る」を示す線 / 枠 */
  dropIndicator: DropIndicator | null;
  /** 編集した要素の位置（赤枠で囲む） */
  editedRects: Rect[];
  pins: CommentPin[];
  /** 立てたばかりで、まだ書いていないピン */
  draftPin: { x: number; y: number } | null;
  onPinClick: (id: string) => void;
  /** 編集前の画面を右に並べて出すときの URL（出さないときは null） */
  beforeSrc: string | null;
  beforeFrameRef: RefObject<HTMLIFrameElement | null>;
}) {
  const size = DEVICE_SIZES[device];
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  // ⌘/Ctrl + ホイールで拡大縮小（React の onWheel は passive なので直接つける）
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      onZoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [stageRef, onZoomBy]);

  function startDrag(e: React.PointerEvent) {
    const stage = stageRef.current;
    if (!stage) return;
    dragRef.current = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function moveDrag(e: React.PointerEvent) {
    const stage = stageRef.current;
    const d = dragRef.current;
    if (!stage || !d) return;
    stage.scrollLeft = d.left - (e.clientX - d.x);
    stage.scrollTop = d.top - (e.clientY - d.y);
  }
  function endDrag(e: React.PointerEvent) {
    dragRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  const frames = beforeSrc ? 2 : 1;
  const beforeLeft = STAGE_PADDING + size.width * zoom + FRAME_GAP;
  const frameBottom = STAGE_PADDING + size.height * zoom;

  /** 端末枠の右下に出す「編集後 / 編集前」ラベル。枠の右端に右揃えで置く */
  const cornerLabel = (frameLeft: number, text: string, colorClass: string) => (
    <span
      data-stage-bg="1"
      className={`absolute h-5 px-1.5 rounded text-[10px] font-bold text-white flex items-center whitespace-nowrap ${colorClass}`}
      style={{ left: frameLeft + size.width * zoom, top: frameBottom + 8, transform: "translateX(-100%)" }}
    >
      {text}
    </span>
  );
  const outlineWidth = 2 / zoom;
  const labelScale = 1 / zoom;
  const pinScale = 1 / zoom;
  const lineWidth = 3 / zoom;

  return (
    <div
      ref={stageRef}
      className={`flex-1 min-h-0 overflow-auto bg-[#e4e2dd] relative select-none ${
        tool === "comment" ? "cursor-crosshair" : ""
      }`}
      onPointerDown={(e) => {
        // 背景（iframe 以外）をドラッグしたときは常にキャンバスを動かす
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.stageBg) startDrag(e);
      }}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        data-stage-bg="1"
        style={{
          width: size.width * zoom * frames + FRAME_GAP * (frames - 1) + STAGE_PADDING * 2,
          height: size.height * zoom + STAGE_PADDING * 2 + 28,
          position: "relative",
        }}
      >
        <div
          data-stage-bg="1"
          className="absolute text-xs font-bold text-[var(--semantic-text-secondary)] flex items-center gap-2"
          style={{ left: STAGE_PADDING, top: STAGE_PADDING - 26 }}
        >
          <span className="inline-block size-2 rounded-full bg-[var(--semantic-brand-primary)]" />
          {title}
          <span className="font-normal">
            {size.width}×{size.height}
          </span>
        </div>
        {beforeSrc && cornerLabel(STAGE_PADDING, "After（編集後）", "bg-[var(--semantic-brand-primary)]")}
        {beforeSrc && cornerLabel(beforeLeft, "Before（編集前）", "bg-[#6b6b6b]")}
        {beforeSrc && (
          <>
            <div
              data-stage-bg="1"
              className="absolute text-xs font-bold text-[var(--semantic-text-secondary)] flex items-center gap-2"
              style={{ left: beforeLeft, top: STAGE_PADDING - 26 }}
            >
              <span className="inline-block size-2 rounded-full bg-[#9a9a9a]" />
              {title}
            </div>
            {/* 編集前の画面。見比べる用なので触れない（スクロールは編集後の画面に追従する） */}
            <div
              className="absolute rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] overflow-hidden"
              style={{
                left: beforeLeft,
                top: STAGE_PADDING,
                width: size.width,
                height: size.height,
                transform: `scale(${zoom})`,
                transformOrigin: "0 0",
                outline: `${8 / zoom}px solid #6b6b6b`,
              }}
            >
              <iframe
                key={`before-${iframeKey}`}
                ref={beforeFrameRef}
                src={beforeSrc}
                title={`${title}（編集前）`}
                className="block border-0 bg-white pointer-events-none"
                style={{ width: size.width, height: size.height }}
              />
            </div>
          </>
        )}
        <div
          className="absolute rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] overflow-hidden"
          style={{
            left: STAGE_PADDING,
            top: STAGE_PADDING,
            width: size.width,
            height: size.height,
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
            outline: `${8 / zoom}px solid #333`,
          }}
        >
          <iframe
            key={iframeKey}
            ref={frameRef}
            src={frameSrc}
            title={title}
            onLoad={onFrameLoad}
            className="block border-0 bg-white"
            style={{ width: size.width, height: size.height }}
          />
          {editedRects.map((r, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: r.x,
                top: r.y,
                width: r.width,
                height: r.height,
                outline: `${outlineWidth}px solid var(--semantic-brand-danger)`,
                outlineOffset: outlineWidth,
                background: "rgba(220,53,69,0.06)",
              }}
            />
          ))}
          {hoverRect && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: hoverRect.x,
                top: hoverRect.y,
                width: hoverRect.width,
                height: hoverRect.height,
                outline: `${outlineWidth}px dashed #4b9ff8`,
                outlineOffset: -outlineWidth,
                background: "rgba(75,159,248,0.08)",
              }}
            />
          )}
          {selectRect && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: selectRect.x,
                top: selectRect.y,
                width: selectRect.width,
                height: selectRect.height,
                outline: `${outlineWidth}px solid var(--semantic-brand-primary)`,
                outlineOffset: -outlineWidth,
              }}
            >
              <span
                className="absolute left-0 whitespace-nowrap rounded-t px-1.5 py-0.5 text-[11px] font-bold text-white bg-[var(--semantic-brand-primary)]"
                style={{
                  bottom: "100%",
                  transform: `scale(${labelScale})`,
                  transformOrigin: "left bottom",
                  ...(selectRect.y < 24 / zoom ? { bottom: "auto", top: "100%", transformOrigin: "left top" } : {}),
                }}
              >
                {selectLabel}
              </span>
            </div>
          )}
          {dropIndicator && (dropIndicator.kind === "line" ? (
            <div
              className="absolute pointer-events-none bg-[var(--semantic-brand-primary)]"
              style={{
                left: dropIndicator.horizontal ? dropIndicator.x - lineWidth / 2 : dropIndicator.x,
                top: dropIndicator.horizontal ? dropIndicator.y : dropIndicator.y - lineWidth / 2,
                width: dropIndicator.horizontal ? lineWidth : dropIndicator.width,
                height: dropIndicator.horizontal ? dropIndicator.height : lineWidth,
                boxShadow: `0 0 0 ${1 / zoom}px rgba(255,255,255,0.9)`,
                borderRadius: lineWidth,
              }}
            />
          ) : (
            <div
              className="absolute pointer-events-none"
              style={{
                left: dropIndicator.x,
                top: dropIndicator.y,
                width: dropIndicator.width,
                height: dropIndicator.height,
                outline: `${lineWidth}px dashed var(--semantic-brand-primary)`,
                outlineOffset: -lineWidth,
                background: "rgba(28,140,88,0.08)",
              }}
            />
          ))}
          {pins.map((pin) => (
            <button
              key={pin.id}
              type="button"
              title={`コメント ${pin.n}`}
              onClick={(e) => {
                e.stopPropagation();
                onPinClick(pin.id);
              }}
              className="absolute"
              // ズームしても同じ大きさで見えるように、ピンだけ逆向きに拡縮する。
              // translateY(-100%) で吹き出しの左下（とがった角）がクリック位置に来る。
              style={{ left: pin.x, top: pin.y, transform: `scale(${pinScale}) translateY(-100%)`, transformOrigin: "left top" }}
            >
              <span
                className={`size-6 rounded-full rounded-bl-none text-[11px] font-bold text-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.3)] ${
                  pin.resolved ? "bg-[#9a9a9a]" : "bg-[var(--semantic-brand-danger)]"
                } ${pin.active ? "ring-2 ring-white outline outline-2 outline-[var(--semantic-brand-primary)]" : "ring-2 ring-white"}`}
              >
                {pin.n}
              </span>
            </button>
          ))}
          {draftPin && (
            <span
              className="absolute pointer-events-none"
              style={{ left: draftPin.x, top: draftPin.y, transform: `scale(${pinScale}) translateY(-100%)`, transformOrigin: "left top" }}
            >
              <span className="size-6 rounded-full rounded-bl-none bg-[var(--semantic-brand-primary)] text-[11px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] animate-pulse">
                ＋
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
