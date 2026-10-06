/**
 * 画面説明パネル。右側からスライドインして、今見ている画面の「何をする画面か / 何ができるか」を出す。
 * 各画面の右下の「i」ボタン（PageDescriptionButton）から開く。
 *
 * ガイド › 画面説明（ScreenDescriptionsPage）の一覧から開くのはこのパネルではなく、
 * 専用の詳細ページ（ScreenDescriptionDetailPage）。パネル下部の「大きく表示」でそこへ移れる。
 *
 * フィードバックパネルと同じ寸法・見た目にそろえている（幅 400px、白、左に影、0.2 秒のスライド）。
 * モーダルではなく、開いたまま裏の画面を操作できる。
 */
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_LABELS, groupOf, roleOf, type ScreenEntry } from "../../admin/features/guide/screenCatalog";
import { screenBreadcrumb } from "../feedback/screenBreadcrumb";
import { describeScreenFile } from "./screenDescriptions";
import { descriptionOfState, findOpenScreenState } from "./screenStates";
import { VERSION_CHIP_CLASS, shortTitleOf } from "./screenDescriptionUtils";
import { KIT_USER_DESCRIPTIONS, type KitUserStateDescription, type KitUserTask } from "../demo/kitUserDescriptions";
import type { ScreenDescription } from "./screenDescriptions";

/** PageDescriptionButton の aria-controls と対応させるためのパネルの id */
export const SCREEN_DESCRIPTION_PANEL_ID = "nq-screen-description-panel";
const TITLE_ID = "nq-screen-description-panel-title";

function Chip({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`h-5 px-2 rounded-full text-[11px] flex items-center whitespace-nowrap ${className}`}>{children}</span>;
}

const IconInfo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="8" r="0.6" fill="currentColor" />
  </svg>
);

const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const IconExternal = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5" />
  </svg>
);

export function ScreenDescriptionPanel({
  screen,
  pathname,
  onClose,
  docked = false,
  forUser = false,
}: {
  /** 説明する画面。URL が画面一覧に無いときは undefined */
  screen: ScreenEntry | undefined;
  /** 今の URL（パンくずと、画面が見つからないときの表示に使う） */
  pathname: string;
  onClose: () => void;
  /** true のとき画面の上に重ねず、置いた場所（メインの右）に並べてメインを狭める */
  docked?: boolean;
  /**
   * true のとき、実際に使う人向けの説明（kitUserDescriptions.ts）を出し、
   * 開発者向けのもの（区分・Ver のチップ、URL、ガイドへのリンク、説明の足し方）は出さない。プロトタイプのパネルで使う
   */
  forUser?: boolean;
}) {
  // Esc で閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 利用者向け（forUser）の説明は points の代わりに tasks（やりたいことごとの操作手順）を持つ。
  // ポップアップの判定（states の whenHeading）と summary・note は同じ形なので、そのまま同じ仕組みに通す
  const userDescription = screen && forUser ? KIT_USER_DESCRIPTIONS[screen.filePath] : undefined;
  const pageDescription: ScreenDescription | undefined = screen
    ? forUser
      ? (userDescription as unknown as ScreenDescription | undefined)
      : describeScreenFile(screen.filePath)
    : undefined;

  /**
   * 画面の上にポップアップ（実施者の選択など）が出ている間は、そのポップアップの説明に差し替える。
   * 開いたまま裏の画面を操作できるパネルなので、DOM が変わるたびに見直す。
   */
  const [stateLabel, setStateLabel] = useState<string | null>(null);
  const [description, setDescription] = useState(pageDescription);
  const [userTasks, setUserTasks] = useState<KitUserTask[] | undefined>(userDescription?.tasks);
  useEffect(() => {
    const sync = () => {
      const active = findOpenScreenState(document, pageDescription);
      setStateLabel(active?.state.label ?? null);
      setDescription(descriptionOfState(pageDescription, active));
      setUserTasks(
        active ? (active.state as unknown as KitUserStateDescription).tasks : (pageDescription as unknown as { tasks?: KitUserTask[] } | undefined)?.tasks,
      );
    };
    sync();
    const root = document.getElementById("root");
    if (!root) return;
    let timer: number | undefined;
    const observer = new MutationObserver(() => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(sync, 200);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [pageDescription]);
  const title = screen ? (forUser ? shortTitleOf(screen) : screen.title) : pathname === "/" ? "ホーム" : pathname;
  const trail = screenBreadcrumb(pathname, title);
  const group = screen ? groupOf(screen) : null;
  const role = screen ? roleOf(screen) : null;
  const isAdmin = pathname.startsWith("/admin");

  return (
    <aside
      // フィードバックの「場所選び」で、このパネルが選ばれないようにする印（フィードバック UI と同じ属性）
      data-nq-feedback=""
      id={SCREEN_DESCRIPTION_PANEL_ID}
      role="complementary"
      aria-labelledby={TITLE_ID}
      className={
        docked
          ? "nq-screen-description-panel relative shrink-0 w-[400px] max-w-[50%] h-full bg-white border-l border-[#e5e5e5] flex flex-col"
          : "nq-screen-description-panel fixed inset-y-0 right-0 z-[60] w-[400px] max-w-full bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.18)] flex flex-col"
      }
    >
      {/* ヘッダー */}
      <div className="h-14 px-4 flex items-center gap-2 border-b border-[#eee] shrink-0">
        <IconInfo className="w-5 h-5 text-[#2f7fd4] shrink-0" />
        <h2 id={TITLE_ID} className="flex-1 text-base font-bold text-[var(--semantic-text-primary)]">
          画面説明
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
        {/* 対象画面 */}
        <section className="px-4 pt-4 pb-4 border-b border-[#eee] flex flex-col gap-2">
          <span className="text-[11px] font-normal text-[var(--semantic-text-secondary)] break-words">{trail.slice(0, -1).join(" › ")}</span>
          <h3 className="text-lg font-bold leading-snug text-[var(--semantic-text-primary)] break-words">
            {title}
            {stateLabel && <span className="text-[var(--semantic-text-secondary)] font-normal"> › {stateLabel}</span>}
          </h3>
          {screen && !forUser && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Chip className="bg-[#eeeeee] text-[#555555]">{CATEGORY_LABELS[screen.category]}</Chip>
              {group?.kind === "ledger" && <Chip className="bg-[#f3f3f3] text-[var(--semantic-text-primary)]">{group.label}</Chip>}
              {group?.version && <Chip className={VERSION_CHIP_CLASS[group.version] ?? "bg-[#f3f3f3] text-[#808080]"}>{group.version}</Chip>}
              {role && <Chip className="bg-[#e7f1fe] text-[#2f7fd4]">{role}</Chip>}
            </div>
          )}
          {screen && !forUser && (
            <span className="text-[11px] font-normal text-[var(--semantic-text-secondary)] font-mono break-all" title={screen.filePath}>
              {pathname}
            </span>
          )}
        </section>

        {forUser && !description ? (
          <section className="px-4 py-6">
            <p className="text-sm leading-relaxed text-[var(--semantic-text-primary)]">この画面の説明は準備中です。</p>
          </section>
        ) : !screen ? (
          <section className="px-4 py-6 flex flex-col gap-2">
            <p className="text-sm leading-relaxed text-[var(--semantic-text-primary)]">この URL は画面一覧に無いページです。</p>
            <p className="text-xs leading-relaxed text-[var(--semantic-text-secondary)]">
              新しく追加した画面なら、画面マップを作り直す（
              <code className="font-mono">node .claude/generate-screen-map.cjs</code>
              ）と一覧に載ります。
            </p>
          </section>
        ) : !description ? (
          <section className="px-4 py-6 flex flex-col gap-2">
            <p className="text-sm leading-relaxed text-[var(--semantic-text-primary)]">この画面の説明はまだ書かれていません。</p>
            <p className="text-xs leading-relaxed text-[var(--semantic-text-secondary)] break-all">
              <code className="font-mono">src/components/screen-description/screenDescriptions.ts</code> に{" "}
              <code className="font-mono">{screen.filePath}</code> をキーにして追加してください。
            </p>
          </section>
        ) : (
          <>
            <section className="px-4 pt-4 pb-4 border-b border-[#eee] flex flex-col gap-1.5">
              <h4 className="text-xs font-bold text-[var(--semantic-text-secondary)]">{forUser ? "この画面について" : "概要"}</h4>
              <p className="text-sm leading-relaxed text-[var(--semantic-text-primary)]">{description.summary}</p>
            </section>

            {forUser ? (
              <section className="px-4 pt-4 pb-4 border-b border-[#eee] flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[var(--semantic-text-secondary)]">操作手順</h4>
                {(userTasks ?? []).map((task, ti) => (
                  <div key={ti} className="flex flex-col gap-2">
                    <h5 className="text-sm font-bold text-[var(--semantic-text-primary)]">{task.title}</h5>
                    <ol className="flex flex-col gap-2">
                      {task.steps.map((step, si) => (
                        <li key={si} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--semantic-text-primary)]">
                          <span className="mt-0.5 size-5 shrink-0 rounded-full bg-[var(--semantic-brand-primary)] text-white text-xs font-bold flex items-center justify-center">
                            {si + 1}
                          </span>
                          <span className="flex-1 min-w-0 break-words">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </section>
            ) : (
            <section className="px-4 pt-4 pb-4 border-b border-[#eee] flex flex-col gap-2">
              <h4 className="text-xs font-bold text-[var(--semantic-text-secondary)]">この画面でできること</h4>
              <ul className="flex flex-col gap-1.5">
                {description.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--semantic-text-primary)]">
                    <IconCheck className="w-4 h-4 mt-1 shrink-0 text-[var(--semantic-brand-primary)]" />
                    <span className="flex-1 min-w-0 break-words">{p}</span>
                  </li>
                ))}
              </ul>
            </section>
            )}

            {description.note && (
              <section className="px-4 pt-4 pb-4 border-b border-[#eee]">
                <div className="rounded-lg bg-[#f6f9ff] border border-[#dbe7fa] px-3 py-2.5 flex items-start gap-2">
                  <IconInfo className="w-4 h-4 mt-0.5 shrink-0 text-[#2f7fd4]" />
                  <p className="flex-1 min-w-0 text-xs leading-relaxed text-[var(--semantic-text-primary)] break-words">{description.note}</p>
                </div>
              </section>
            )}
          </>
        )}

        {/* 行き先（ガイドは管理画面側にしかないので、アプリでは出さない） */}
        {screen && isAdmin && !forUser && (
          <section className="px-4 pt-4 pb-6 flex flex-col gap-2">
            <Link
              to={`/admin/guide/descriptions/${encodeURIComponent(screen.id)}`}
              onClick={onClose}
              className="h-10 px-3 rounded-lg bg-[var(--semantic-brand-primary)] text-sm text-white hover:brightness-110 flex items-center justify-center gap-1.5"
            >
              <IconExternal className="w-4 h-4" />
              大きく表示（ガイド › 画面説明）
            </Link>
            <Link
              to="/admin/guide/descriptions"
              onClick={onClose}
              className="h-10 px-3 rounded-lg border border-[#ddd] bg-white text-sm text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] flex items-center justify-center"
            >
              ほかの画面の説明も見る
            </Link>
          </section>
        )}
      </div>

      <style>{`
        @keyframes nq-screen-description-slide-in {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nq-screen-description-panel {
          animation: nq-screen-description-slide-in 0.2s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .nq-screen-description-panel { animation: none; }
        }
      `}</style>
    </aside>
  );
}
