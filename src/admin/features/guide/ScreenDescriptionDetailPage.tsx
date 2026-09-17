/**
 * ガイド › 画面説明 › 画面 1 つの詳細。
 * 一覧（ScreenDescriptionsPage）の行を押すとここに遷移し、説明を大きく読める。
 * 左に説明本文、右にその画面の撮影済みスクリーンショットと行き先ボタン、下に同じ帳票の画面へのリンク。
 *
 * 右下の「i」ボタンから開くスライドインパネル（ScreenDescriptionPanel）と同じデータを使う。
 * 説明の本文は src/components/screen-description/screenDescriptions.ts。
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { CATEGORY_LABELS, SCREENS, groupOf, roleOf, type ScreenEntry } from "./screenCatalog";
import { IconExternal } from "./CanvasIcons";
import { shotUrl } from "./screenShots";
import { describeScreenFile } from "../../../components/screen-description/screenDescriptions";
import { VERSION_CHIP_CLASS, shortTitleOf } from "../../../components/screen-description/screenDescriptionUtils";
import { screenBreadcrumb } from "../../../components/feedback/screenBreadcrumb";

const LIST_PATH = "/admin/guide/descriptions";

function Chip({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`h-6 px-2.5 rounded-full text-xs flex items-center whitespace-nowrap ${className}`}>{children}</span>;
}

/** 撮影済みのスクリーンショット。after → before の順に探し、どちらも無ければ枠だけ出す */
function Screenshot({ screen }: { screen: ScreenEntry }) {
  const [src, setSrc] = useState(() => shotUrl(screen.id, "after"));
  const [failed, setFailed] = useState(false);

  // 一覧から別の画面に飛んだときはこのページが作り直されないので、自分で読み直す
  useEffect(() => {
    setSrc(shotUrl(screen.id, "after"));
    setFailed(false);
  }, [screen.id]);

  return (
    <div className="rounded-lg border border-[#e6e6e6] bg-[#fafafa] overflow-hidden">
      {failed ? (
        <div className="aspect-[16/11] flex flex-col items-center justify-center gap-1 text-xs text-[var(--semantic-text-secondary)]">
          <span>スクリーンショットはまだありません</span>
          <code className="font-mono text-[11px]">node .claude/capture-screens.cjs --only {shortTitleOf(screen)}</code>
        </div>
      ) : (
        <a href={screen.route} target="_blank" rel="noreferrer" title="実画面を別タブで開く" className="block">
          <img
            src={src}
            alt={`${screen.title} のスクリーンショット`}
            // アプリはタブレット縦で撮っているので、幅いっぱいに広げず中央に収める
            className={
              screen.category === "App"
                ? "max-h-[560px] mx-auto object-contain bg-white"
                : "w-full max-h-[560px] object-cover object-top"
            }
            onError={() => {
              if (src.includes("/after/")) setSrc(shotUrl(screen.id, "before"));
              else setFailed(true);
            }}
          />
        </a>
      )}
    </div>
  );
}

export function ScreenDescriptionDetailPage() {
  const { screenId } = useParams<{ screenId: string }>();
  const screen = useMemo(() => SCREENS.find((s) => s.id === screenId), [screenId]);

  if (!screen) {
    return (
      <div>
        <PageTitleBar title="画面説明" showBack />
        <div className="p-6 flex flex-col gap-3 items-start">
          <p className="text-sm text-[var(--semantic-text-primary)]">この画面 ID は画面一覧にありません。</p>
          <p className="text-xs text-[var(--semantic-text-secondary)]">
            ファイルを移動・リネームすると ID が変わります。画面マップを作り直した場合は一覧から開き直してください。
          </p>
          <Link to={LIST_PATH} className="h-10 px-4 rounded-lg bg-[var(--semantic-brand-primary)] text-sm text-white flex items-center">
            画面説明の一覧へ
          </Link>
        </div>
      </div>
    );
  }

  const description = describeScreenFile(screen.filePath);
  const group = groupOf(screen);
  const role = roleOf(screen);
  const trail = screenBreadcrumb(screen.route, screen.title);

  // 同じ帳票（グループ）の画面。一覧と同じ並び（SCREENS の順）で、前後の画面へも移れるようにする
  const siblings = SCREENS.filter((s) => groupOf(s).key === group.key);
  const index = siblings.findIndex((s) => s.id === screen.id);
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  return (
    <div>
      <PageTitleBar
        title={screen.title}
        showBack
        action={
          <div className="flex items-center gap-2">
            {prev && (
              <Link to={`${LIST_PATH}/${prev.id}`} className="h-9 px-3 rounded-lg border border-[#ddd] bg-white text-sm text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] flex items-center gap-1" title={prev.title}>
                ‹ 前の画面
              </Link>
            )}
            {next && (
              <Link to={`${LIST_PATH}/${next.id}`} className="h-9 px-3 rounded-lg border border-[#ddd] bg-white text-sm text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] flex items-center gap-1" title={next.title}>
                次の画面 ›
              </Link>
            )}
            <Link
              to={{ pathname: LIST_PATH, search: `?group=${encodeURIComponent(group.key)}` }}
              className="h-9 px-3 rounded-lg border border-[#ddd] bg-white text-sm text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] flex items-center"
            >
              一覧へ
            </Link>
          </div>
        }
      />

      <div className="p-6 flex flex-col gap-6">
        {/* パンくず + チップ */}
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--semantic-text-secondary)]">{trail.join(" › ")}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Chip className="bg-[#eeeeee] text-[#555555]">{CATEGORY_LABELS[screen.category]}</Chip>
            <Chip className="bg-[#f3f3f3] text-[var(--semantic-text-primary)]">{group.label}</Chip>
            {group.version && <Chip className={VERSION_CHIP_CLASS[group.version] ?? "bg-[#f3f3f3] text-[#808080]"}>{group.version}</Chip>}
            {role && <Chip className="bg-[#e7f1fe] text-[#2f7fd4]">{role}</Chip>}
            <span className="text-xs text-[var(--semantic-text-secondary)]">{screen.componentName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_480px] gap-6 items-start">
          {/* 説明本文 */}
          <div className="flex flex-col gap-6">
            {!description ? (
              <section className="bg-white rounded-lg p-6 flex flex-col gap-2">
                <p className="text-base text-[var(--semantic-text-primary)]">この画面の説明はまだ書かれていません。</p>
                <p className="text-sm text-[var(--semantic-text-secondary)] break-all">
                  <code className="font-mono">src/components/screen-description/screenDescriptions.ts</code> に{" "}
                  <code className="font-mono">{screen.filePath}</code> をキーにして追加してください。
                </p>
              </section>
            ) : (
              <>
                <section className="bg-white rounded-lg p-6 flex flex-col gap-3">
                  <h2 className="text-sm font-bold text-[var(--semantic-text-secondary)]">概要</h2>
                  <p className="text-lg leading-relaxed text-[var(--semantic-text-primary)]">{description.summary}</p>
                </section>

                <section className="bg-white rounded-lg p-6 flex flex-col gap-3">
                  <h2 className="text-sm font-bold text-[var(--semantic-text-secondary)]">この画面でできること</h2>
                  <ul className="flex flex-col gap-2.5">
                    {description.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-base leading-relaxed text-[var(--semantic-text-primary)]">
                        <span className="mt-1.5 size-2 rounded-full bg-[var(--semantic-brand-primary)] shrink-0" aria-hidden />
                        <span className="flex-1 min-w-0 break-words">{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {description.note && (
                  <section className="rounded-lg bg-[#f6f9ff] border border-[#dbe7fa] px-5 py-4 flex items-start gap-3">
                    <svg className="w-5 h-5 mt-0.5 shrink-0 text-[#2f7fd4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 11v5" />
                      <circle cx="12" cy="8" r="0.6" fill="currentColor" />
                    </svg>
                    <p className="flex-1 min-w-0 text-sm leading-relaxed text-[var(--semantic-text-primary)] break-words">{description.note}</p>
                  </section>
                )}
              </>
            )}
          </div>

          {/* スクリーンショット + 行き先 */}
          <aside className="flex flex-col gap-3">
            <Screenshot screen={screen} />
            <div className="flex flex-col gap-2">
              <a
                href={screen.route}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-3 rounded-lg border border-[#ddd] bg-white text-sm text-[var(--semantic-text-primary)] hover:bg-[#f7f7f7] flex items-center justify-center gap-1.5"
              >
                <IconExternal width={16} height={16} />
                実画面を別タブで開く
              </a>
              <Link
                to={`/admin/guide/screens?screen=${encodeURIComponent(screen.id)}`}
                className="h-10 px-3 rounded-lg bg-[var(--semantic-brand-primary)] text-sm text-white hover:brightness-110 flex items-center justify-center"
              >
                変更履歴キャンバスで見る
              </Link>
            </div>
            <dl className="bg-white rounded-lg p-4 flex flex-col gap-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <dt className="text-[var(--semantic-text-secondary)]">URL</dt>
                <dd className="font-mono text-[var(--semantic-text-primary)] break-all">{screen.routes.join("\n")}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-[var(--semantic-text-secondary)]">ファイル</dt>
                <dd className="font-mono text-[var(--semantic-text-primary)] break-all">{screen.filePath}</dd>
              </div>
            </dl>
          </aside>
        </div>

        {/* 同じ帳票の画面 */}
        {siblings.length > 1 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-[var(--semantic-text-secondary)]">
              同じ「{group.label}」の画面 <span className="font-normal">{siblings.length}</span>
            </h2>
            <ul className="bg-white rounded-lg border border-[#e6e6e6] overflow-hidden">
              {siblings.map((s) => {
                const active = s.id === screen.id;
                const d = describeScreenFile(s.filePath);
                return (
                  <li key={s.id} className="border-b border-[#f0f0f0] last:border-b-0">
                    <Link
                      to={`${LIST_PATH}/${s.id}`}
                      aria-current={active ? "page" : undefined}
                      className={`px-4 py-2.5 flex items-center gap-3 ${active ? "bg-[#eef8f1]" : "hover:bg-[#f7f9f8]"}`}
                    >
                      <span className="shrink-0 w-[88px] text-[11px] text-[var(--semantic-text-secondary)]">
                        {s.category === "App" ? "アプリ" : roleOf(s) ?? "管理画面"}
                      </span>
                      <span className="shrink-0 min-w-[160px] text-sm font-bold text-[var(--semantic-text-primary)]">{shortTitleOf(s)}</span>
                      <span className="flex-1 min-w-0 text-xs text-[var(--semantic-text-secondary)] truncate">{d?.summary ?? "説明なし"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
