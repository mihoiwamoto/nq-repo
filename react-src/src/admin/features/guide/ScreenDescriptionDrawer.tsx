/**
 * ガイド › 画面説明 の一覧で、カードを押したときに中央に開くポップアップ（モーダル）。
 *
 * 以前は詳細ページ（ScreenDescriptionDetailPage）へ遷移していたが、
 * 「1 画面読むたびにページが変わって一覧に戻る」のが読みづらかったので、
 * 一覧を表示したままこの中で読めるようにしている。
 * 右からのスライドインパネルだったものを、この画面では読む面積を広く取りたいので
 * 画面中央の大きめポップアップ（左にスクリーンショット / 右に説明の 2 カラム）に変えた。
 * 開いているかどうかは一覧側の URL（?screen=<画面ID>）に持たせているので、
 * ブラウザの戻るで閉じられるし、この URL をそのまま共有もできる。
 *
 * 詳細ページ自体は残してある（画面右下の「i」パネルや動作デモから直接開くため）。
 * 下部の「ページとして開く」でそちらへ移れる。
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_LABELS, SCREENS, groupOf, roleOf, type ScreenEntry } from "./screenCatalog";
import { IconExternal } from "./CanvasIcons";
import { shotUrl } from "./screenShots";
import { DEVICE_SIZES } from "./canvasTypes";
import { applyPreviewState } from "./screenPreviewState";
import { describeScreenFile } from "../../../components/screen-description/screenDescriptions";
import { VERSION_CHIP_CLASS, shortTitleOf } from "../../../components/screen-description/screenDescriptionUtils";
import { screenBreadcrumb } from "../../../components/feedback/screenBreadcrumb";

const TITLE_ID = "nq-screen-description-drawer-title";

function Chip({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`h-6 px-2.5 rounded-full text-xs flex items-center whitespace-nowrap ${className}`}>{children}</span>;
}

const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const IconInfo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="8" r="0.6" fill="currentColor" />
  </svg>
);

/** タブレット枠の縁の太さ（px）。枠の内側がちょうど 768×1024 になるように差し引く */
const BEZEL = 5;

/**
 * アプリ画面のプレビュー。
 *
 * アプリはタブレット縦（768×1024）に収まる縦長の画面なので、管理画面と同じ横長の絵で出すと
 * 実際の見え方と違ってしまう。撮影済みスクリーンショットは全画面 PC 幅（1280px）で撮っていて
 * 横長のままなので、ここでは実画面をその実寸で読み込み、端末枠ごと縮めて出している
 * （画面遷移図のポップアップと同じやり方）。撮り直さなくても常に今の見た目になる。
 */
function AppPreview({ screen }: { screen: ScreenEntry }) {
  const size = DEVICE_SIZES.tablet;
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.4);
  const [loaded, setLoaded] = useState(false);

  // 入る場所の大きさに合わせて縮める（縦横の比はそのまま）
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth - BEZEL * 2;
      const h = el.clientHeight - BEZEL * 2;
      if (w <= 0 || h <= 0) return;
      setScale(Math.min(1, w / size.width, h / size.height));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [size.width, size.height]);

  // 別の画面に切り替わったら読み込み直す
  useEffect(() => setLoaded(false), [screen.id]);

  const onLoad = () => {
    const frame = frameRef.current;
    // 確認画面などは見本の state を差し込んでから見せる
    if (frame) applyPreviewState(frame, screen.filePath, screen.route).finally(() => setLoaded(true));
    else setLoaded(true);
  };

  return (
    <div ref={boxRef} className="h-[min(56vh,540px)] flex items-start justify-center">
      <div
        className="relative overflow-hidden rounded-[16px] bg-white shadow-[0_6px_22px_rgba(0,0,0,0.18)]"
        style={{
          width: Math.round(size.width * scale) + BEZEL * 2,
          height: Math.round(size.height * scale) + BEZEL * 2,
          border: `${BEZEL}px solid #3c3c3c`,
        }}
      >
        {loaded ? null : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f7f7f7] text-xs text-[var(--semantic-text-secondary)]">
            読み込み中…
          </div>
        )}
        <iframe
          key={screen.id}
          ref={frameRef}
          src={screen.route}
          title={`${screen.title} のプレビュー`}
          tabIndex={-1}
          aria-hidden
          scrolling="no"
          onLoad={onLoad}
          className={`absolute top-0 left-0 border-0 bg-white pointer-events-none ${loaded ? "" : "opacity-0"}`}
          style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      </div>
    </div>
  );
}

/** 撮影済みのスクリーンショット。after → before の順に探し、どちらも無ければ枠だけ出す */
function Screenshot({ screen }: { screen: ScreenEntry }) {
  const [src, setSrc] = useState(() => shotUrl(screen.id, "after"));
  const [failed, setFailed] = useState(false);

  // 別の画面に切り替わったら読み直す
  useEffect(() => {
    setSrc(shotUrl(screen.id, "after"));
    setFailed(false);
  }, [screen.id]);

  if (failed) {
    return (
      <div className="rounded-lg border border-[#e6e6e6] bg-[#fafafa] aspect-[16/10] flex items-center justify-center text-xs text-[var(--semantic-text-secondary)]">
        スクリーンショットはまだありません
      </div>
    );
  }
  return (
    <a
      href={screen.route}
      target="_blank"
      rel="noreferrer"
      title="実画面を別タブで開く"
      className="block rounded-lg border border-[#e6e6e6] bg-[#fafafa] overflow-hidden"
    >
      <img
        src={src}
        alt={`${screen.title} のスクリーンショット`}
        className="w-full max-h-[440px] object-cover object-top"
        onError={() => {
          if (src.includes("/after/")) setSrc(shotUrl(screen.id, "before"));
          else setFailed(true);
        }}
      />
    </a>
  );
}

export function ScreenDescriptionDrawer({
  screen,
  onSelect,
  onClose,
}: {
  screen: ScreenEntry;
  /** 前後の画面に移る（一覧側の ?screen= を差し替える） */
  onSelect: (screenId: string) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc で閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 開いたときと画面を切り替えたときに、先頭へ戻す
  useEffect(() => {
    panelRef.current?.querySelector("[data-drawer-scroll]")?.scrollTo({ top: 0 });
  }, [screen.id]);

  const description = describeScreenFile(screen.filePath);
  const group = groupOf(screen);
  const role = roleOf(screen);
  const trail = screenBreadcrumb(screen.route, screen.title);

  // 同じ帳票（グループ）の画面。一覧と同じ並び（SCREENS の順）で前後に移れるようにする
  const siblings = SCREENS.filter((s) => groupOf(s).key === group.key);
  const index = siblings.findIndex((s) => s.id === screen.id);
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  return (
    <div
      className="nq-desc-modal-scrim fixed inset-0 z-[55] bg-black/40 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        data-nq-feedback=""
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(e) => e.stopPropagation()}
        className="nq-desc-modal w-full max-w-[1120px] max-h-[90vh] bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.28)] flex flex-col overflow-hidden"
      >
        {/* ヘッダー */}
        <div className="h-14 px-4 sm:px-5 flex items-center gap-2 border-b border-[#eee] shrink-0">
          <h2 id={TITLE_ID} className="flex-1 min-w-0 text-base font-bold text-[var(--semantic-text-primary)] truncate" title={screen.title}>
            {shortTitleOf(screen)}
          </h2>
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && onSelect(prev.id)}
            title={prev ? prev.title : undefined}
            aria-label="前の画面"
            className="h-8 px-2 rounded-md text-sm border border-[#ddd] bg-white text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-default"
          >
            ‹
          </button>
          <button
            type="button"
            disabled={!next}
            onClick={() => next && onSelect(next.id)}
            title={next ? next.title : undefined}
            aria-label="次の画面"
            className="h-8 px-2 rounded-md text-sm border border-[#ddd] bg-white text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-default"
          >
            ›
          </button>
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

        <div data-drawer-scroll className="flex-1 min-h-0 overflow-y-auto">
          {/* 対象画面 */}
          <section className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#eee] flex flex-col gap-2">
            <span className="text-[11px] text-[var(--semantic-text-secondary)] break-words">{trail.slice(0, -1).join(" › ")}</span>
            <h3 className="text-xl font-bold leading-snug text-[var(--semantic-text-primary)] break-words">{screen.title}</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Chip className="bg-[#eeeeee] text-[#555555]">{CATEGORY_LABELS[screen.category]}</Chip>
              {group.kind === "ledger" && <Chip className="bg-[#f3f3f3] text-[var(--semantic-text-primary)]">{group.label}</Chip>}
              {group.version && <Chip className={VERSION_CHIP_CLASS[group.version] ?? "bg-[#f3f3f3] text-[#808080]"}>{group.version}</Chip>}
              {role && <Chip className="bg-[#e7f1fe] text-[#2f7fd4]">{role}</Chip>}
            </div>
          </section>

          {/* 左: スクリーンショット / 右: 説明（狭いときは縦に積む） */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:divide-x divide-[#eee]">
            <div className="px-5 sm:px-6 pt-5 pb-5 border-b lg:border-b-0 border-[#eee]">
              {screen.category === "App" ? <AppPreview screen={screen} /> : <Screenshot screen={screen} />}

              {/* URL / ファイル */}
              <dl className="pt-4 flex flex-col gap-2 text-xs">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[var(--semantic-text-secondary)]">URL</dt>
                  <dd className="font-mono text-[var(--semantic-text-primary)] break-all whitespace-pre-line">{screen.routes.join("\n")}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[var(--semantic-text-secondary)]">ファイル</dt>
                  <dd className="font-mono text-[var(--semantic-text-primary)] break-all">{screen.filePath}</dd>
                </div>
              </dl>
            </div>

            <div className="min-w-0">
              {/* 説明本文 */}
              {!description ? (
                <section className="px-5 sm:px-6 py-6 flex flex-col gap-2">
                  <p className="text-sm leading-relaxed text-[var(--semantic-text-primary)]">この画面の説明はまだ書かれていません。</p>
                  <p className="text-xs leading-relaxed text-[var(--semantic-text-secondary)] break-all">
                    <code className="font-mono">src/components/screen-description/screenDescriptions.ts</code> に{" "}
                    <code className="font-mono">{screen.filePath}</code> をキーにして追加してください。
                  </p>
                </section>
              ) : (
                <>
                  <section className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#eee] flex flex-col gap-1.5">
                    <h4 className="text-xs font-bold text-[var(--semantic-text-secondary)]">概要</h4>
                    <p className="text-base leading-relaxed text-[var(--semantic-text-primary)]">{description.summary}</p>
                  </section>

                  <section className="px-5 sm:px-6 pt-4 pb-4 flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-[var(--semantic-text-secondary)]">この画面でできること</h4>
                    <ul className="flex flex-col gap-2">
                      {description.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--semantic-text-primary)]">
                          <IconCheck className="w-4 h-4 mt-1 shrink-0 text-[var(--semantic-brand-primary)]" />
                          <span className="flex-1 min-w-0 break-words">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {description.note && (
                    <section className="px-5 sm:px-6 pb-5">
                      <div className="rounded-lg bg-[#f6f9ff] border border-[#dbe7fa] px-3 py-2.5 flex items-start gap-2">
                        <IconInfo className="w-4 h-4 mt-0.5 shrink-0 text-[#2f7fd4]" />
                        <p className="flex-1 min-w-0 text-xs leading-relaxed text-[var(--semantic-text-primary)] break-words">{description.note}</p>
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 行き先 */}
        <div className="shrink-0 border-t border-[#eee] bg-white px-5 sm:px-6 py-3 flex flex-wrap items-center justify-end gap-2">
          <a
            href={screen.route}
            target="_blank"
            rel="noreferrer"
            className="h-10 px-3.5 rounded-lg border border-[#ddd] bg-white text-sm text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] flex items-center justify-center gap-1.5"
          >
            <IconExternal width={16} height={16} />
            実画面を別タブで開く
          </a>
          <Link
            to={`/admin/guide/screens?screen=${encodeURIComponent(screen.id)}`}
            className="h-10 px-3.5 rounded-lg border border-[#ddd] bg-white text-sm text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] flex items-center justify-center"
          >
            変更履歴キャンバスで見る
          </Link>
          <Link
            to={{ pathname: `/admin/guide/descriptions/${screen.id}`, search: `?group=${encodeURIComponent(group.key)}` }}
            className="h-10 px-3.5 rounded-lg bg-[var(--semantic-brand-primary)] text-sm text-white hover:brightness-110 flex items-center justify-center"
          >
            ページとして開く
          </Link>
        </div>

        <style>{`
          @keyframes nq-desc-modal-in {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes nq-desc-scrim-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .nq-desc-modal { animation: nq-desc-modal-in 0.18s ease-out; }
          .nq-desc-modal-scrim { animation: nq-desc-scrim-in 0.18s ease-out; }
          @media (prefers-reduced-motion: reduce) {
            .nq-desc-modal, .nq-desc-modal-scrim { animation: none; }
          }
        `}</style>
      </div>
    </div>
  );
}
