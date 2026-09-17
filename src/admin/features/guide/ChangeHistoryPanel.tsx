/**
 * 変更履歴（キャンバス）の左レール › 履歴マークで開くパネル。
 *
 * ここは「書き込む所」ではなく「Claude が何を変えたかを読む所」。
 * 編集追跡システム（.claude/edited_screens.json）の記録をそのまま出す。
 *   - 今開いている画面: 直接編集 / 波及・変わった部分・差分（追加/削除行）
 *   - 変わった部分を押すと、右のデモ画面の該当箇所へ飛んでオレンジ枠で囲む
 *   - ほかの画面: 新しく変わった順。押すとその画面に切り替わる
 */
import { useMemo, useState } from "react";
import type { ScreenEntry } from "./screenCatalog";
import {
  SECTION_KIND_LABELS,
  isLocatableSection,
  shortStamp,
  type ChangedSection,
  type ChangesIndex,
  type ScreenChange,
  type ScreenChangeDetail,
} from "./claudeChanges";
import { IconReload } from "./CanvasIcons";

export type CompareMode = "none" | "before" | "diff";

type OtherFilter = "all" | "direct" | "impact";

const LEVEL_CHIP: Record<ScreenChange["level"], string> = {
  direct: "bg-[#fdeaea] text-[#c23a3a]",
  impact: "bg-[#fdf0e3] text-[#c2703a]",
};
const LEVEL_LABELS: Record<ScreenChange["level"], string> = { direct: "直接編集", impact: "波及" };

export function ChangeHistoryPanel({
  screen,
  screensById,
  index,
  loading,
  onReload,
  change,
  detail,
  activeSection,
  onSelectSection,
  compare,
  onCompareChange,
  deviceLabel,
  visibleIds,
  onJump,
}: {
  screen: ScreenEntry | undefined;
  screensById: Map<string, ScreenEntry>;
  index: ChangesIndex | null;
  loading: boolean;
  onReload: () => void;
  /** 今開いている画面の変更サマリ */
  change: ScreenChange | undefined;
  /** 今開いている画面の差分（読み込めていないときは null） */
  detail: ScreenChangeDetail | null;
  activeSection: string | null;
  onSelectSection: (name: string | null) => void;
  compare: CompareMode;
  onCompareChange: (mode: CompareMode) => void;
  /** 「ほかの画面」の見出しに出す今の表示モード（管理画面 / アプリ） */
  deviceLabel: string;
  /** 今の表示モードで出してよい画面 ID */
  visibleIds: Set<string>;
  onJump: (screen: ScreenEntry) => void;
}) {
  const [filter, setFilter] = useState<OtherFilter>("direct");
  const [query, setQuery] = useState("");
  const [openDiff, setOpenDiff] = useState(false);

  const others = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (index?.screens ?? []).filter((s) => {
      if (s.id === screen?.id || !visibleIds.has(s.id)) return false;
      if (filter !== "all" && s.level !== filter) return false;
      if (!q) return true;
      const entry = screensById.get(s.id);
      return `${entry?.title ?? ""} ${s.displayName} ${s.filePath}`.toLowerCase().includes(q);
    });
  }, [index, screen, visibleIds, filter, query, screensById]);

  const counts = useMemo(() => {
    let direct = 0;
    let impact = 0;
    for (const s of index?.screens ?? []) {
      if (!visibleIds.has(s.id)) continue;
      if (s.level === "direct") direct += 1;
      else impact += 1;
    }
    return { direct, impact };
  }, [index, visibleIds]);

  if (index && !index.available) {
    return (
      <p className="px-4 py-8 text-sm font-normal leading-relaxed text-center text-[var(--semantic-text-secondary)]">
        変更の記録を読み込めませんでした。
        <br />
        開発サーバー（npm run dev）で開いているか確認してください。
      </p>
    );
  }

  const sections = detail?.sections ?? change?.sections ?? [];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* 追跡している期間と最終更新 */}
      <div className="px-3 py-2 border-b border-[#eee] flex items-center gap-2">
        <span className="flex-1 min-w-0 text-[11px] font-normal leading-tight text-[var(--semantic-text-secondary)]">
          {shortStamp(index?.startedAt ?? null) || "—"} から記録
          <br />
          最終更新 {shortStamp(index?.lastUpdated ?? null) || "—"}
        </span>
        <button
          type="button"
          title="最新の記録を読み直す"
          onClick={onReload}
          className="size-7 shrink-0 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#ececec]"
        >
          <IconReload width={15} height={15} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* ---- 今開いている画面 ---- */}
        <section className="border-b-8 border-[#f4f4f4]">
          <h3 className="px-3 pt-3 pb-1 text-xs font-bold text-[var(--semantic-text-primary)]">この画面の変更</h3>
          {!change ? (
            <p className="px-3 pb-3 text-[11px] font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
              {loading ? "読み込み中…" : "この画面は今の記録では変わっていません。"}
            </p>
          ) : (
            <div className="px-3 pb-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`h-5 px-2 rounded-full text-[11px] flex items-center ${LEVEL_CHIP[change.level]}`}>
                  {LEVEL_LABELS[change.level]}
                </span>
                {change.level === "direct" && (
                  <span className="text-[11px] font-normal tabular-nums">
                    <span className="text-[#1c8c58]">+{change.added}</span> <span className="text-[#c23a3a]">−{change.removed}</span>
                  </span>
                )}
                <span className="text-[11px] font-normal text-[var(--semantic-text-secondary)]">
                  {change.editCount}回 ・ {shortStamp(change.lastEditedAt)}
                </span>
              </div>

              {/* 変わった部分。画面の文字として探せるものは押すと右の画面で光る */}
              {sections.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-normal text-[var(--semantic-text-secondary)]">
                    変わった部分（押すと右の画面の場所を囲みます）
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sections.map((s) => (
                      <SectionChip
                        key={`${s.kind}:${s.name}`}
                        section={s}
                        active={activeSection === s.name}
                        onClick={() => onSelectSection(activeSection === s.name ? null : s.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {change.level === "impact" && change.via.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-normal text-[var(--semantic-text-secondary)]">
                    共通部品を直したことで影響を受けた画面です
                  </span>
                  {change.via.map((f) => (
                    <span key={f} className="text-[11px] font-normal break-all text-[var(--semantic-text-primary)]">
                      ・{f.split("/").pop()}
                      <span className="text-[var(--semantic-text-secondary)]"> （{f}）</span>
                    </span>
                  ))}
                </div>
              )}

              {/* 変更前 / 差分の見比べ */}
              <div className="flex gap-1.5">
                <CompareButton
                  label="変更前と見比べる"
                  active={compare === "before"}
                  disabled={!change.hasBefore}
                  title={
                    change.hasBefore
                      ? `${shortStamp(change.shotAt)} に撮った変更前の画面を右に並べます`
                      : "この画面の変更前スクリーンショットがまだありません"
                  }
                  onClick={() => onCompareChange(compare === "before" ? "none" : "before")}
                />
                <CompareButton
                  label="差分"
                  active={compare === "diff"}
                  disabled={change.diffRatio === null}
                  title={
                    change.diffRatio === null
                      ? "ピクセル差分がまだありません"
                      : `変わった所をマゼンタで塗った画像（変化 ${(change.diffRatio * 100).toFixed(1)}%${
                          change.diffShift ? ` / ${change.diffShift}px ずれ` : ""
                        }）`
                  }
                  onClick={() => onCompareChange(compare === "diff" ? "none" : "diff")}
                />
              </div>
              {change.diffShift ? (
                <p className="text-[11px] font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
                  撮影の比較では {change.diffShift}px ずれています（率ではなくこのずれ量で見てください）。
                </p>
              ) : null}

              {/* 実際の差分 */}
              {detail && detail.hunks.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenDiff((v) => !v)}
                    className="w-full h-7 px-2 rounded-md flex items-center justify-between text-[11px] bg-[#f2f2f2] hover:bg-[#e9e9e9]"
                  >
                    <span>コードの差分（{detail.hunks.length} か所）</span>
                    <span className="font-normal text-[var(--semantic-text-secondary)]">{openDiff ? "閉じる" : "開く"}</span>
                  </button>
                  {openDiff && (
                    <div className="mt-1.5 flex flex-col gap-2">
                      {detail.hunks.map((hunk, i) => (
                        <div key={i} className="rounded-md border border-[#eee] overflow-hidden">
                          <div className="px-2 py-1 bg-[#fafafa] text-[10px] font-normal text-[var(--semantic-text-secondary)] truncate">
                            {hunk.startLine} 行目 ・ {hunk.context}
                          </div>
                          <pre className="px-2 py-1 overflow-x-auto text-[10px] leading-[1.5] font-mono">
                            {hunk.lines.map((line, j) => (
                              <div
                                key={j}
                                className={
                                  line.t === "+"
                                    ? "bg-[#e6f4ec] text-[#14663f]"
                                    : line.t === "-"
                                    ? "bg-[#fdeaea] text-[#a33]"
                                    : "text-[var(--semantic-text-secondary)]"
                                }
                              >
                                {line.t}
                                {line.s}
                              </div>
                            ))}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ---- ほかの画面 ---- */}
        <section>
          <div className="px-3 pt-3 pb-2 flex flex-col gap-2">
            <h3 className="text-xs font-bold text-[var(--semantic-text-primary)]">
              ほかの{deviceLabel}
              <span className="font-normal text-[var(--semantic-text-secondary)]">（新しく変わった順）</span>
            </h3>
            <div className="flex gap-1.5">
              <FilterChip label="直接編集" count={counts.direct} active={filter === "direct"} onClick={() => setFilter("direct")} />
              <FilterChip label="波及" count={counts.impact} active={filter === "impact"} onClick={() => setFilter("impact")} />
              <FilterChip
                label="すべて"
                count={counts.direct + counts.impact}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="画面名で絞り込む"
              className="h-8 px-2 rounded-md border border-[#ddd] text-xs outline-none focus:border-[var(--semantic-brand-primary)]"
            />
          </div>
          {others.length === 0 ? (
            <p className="px-3 pb-6 text-[11px] font-normal text-[var(--semantic-text-secondary)]">該当する画面はありません。</p>
          ) : (
            <ul className="pb-6">
              {others.map((s) => {
                const entry = screensById.get(s.id);
                return (
                  <li key={s.id} className="border-b border-[#f0f0f0]">
                    <button
                      type="button"
                      disabled={!entry}
                      onClick={() => entry && onJump(entry)}
                      className="w-full px-3 py-2 flex flex-col gap-0.5 text-left hover:bg-[#f7f9f8] disabled:opacity-50"
                    >
                      <span className="flex items-center gap-1.5 w-full">
                        <span className={`h-4 px-1.5 rounded-full text-[10px] flex items-center shrink-0 ${LEVEL_CHIP[s.level]}`}>
                          {LEVEL_LABELS[s.level]}
                        </span>
                        <span className="flex-1 min-w-0 text-xs truncate text-[var(--semantic-text-primary)]">
                          {entry?.title ?? s.displayName}
                        </span>
                        <span className="text-[10px] font-normal tabular-nums text-[var(--semantic-text-secondary)]">
                          {shortStamp(s.lastEditedAt)}
                        </span>
                      </span>
                      <span className="text-[10px] font-normal text-[var(--semantic-text-secondary)] truncate w-full">
                        {s.level === "direct" ? (
                          <>
                            <span className="text-[#1c8c58]">+{s.added}</span> <span className="text-[#c23a3a]">−{s.removed}</span>
                            {s.sections.length > 0 && ` ・ ${s.sections.slice(0, 3).map((x) => x.name).join(" / ")}`}
                          </>
                        ) : (
                          `${s.via.map((f) => f.split("/").pop()).slice(0, 3).join(" / ")}`
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionChip({ section, active, onClick }: { section: ChangedSection; active: boolean; onClick: () => void }) {
  const locatable = isLocatableSection(section);
  const title = `${SECTION_KIND_LABELS[section.kind] ?? section.kind} ・ ${section.lines} 行変更${
    locatable ? "（押すと右の画面で囲みます）" : "（画面の文字ではないので場所は出せません）"
  }`;
  if (!locatable) {
    return (
      <span
        title={title}
        className="max-w-full h-6 px-2 rounded-full flex items-center text-[11px] bg-[#f2f2f2] text-[var(--semantic-text-secondary)] truncate"
      >
        {section.name}
      </span>
    );
  }
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={`max-w-full h-6 px-2 rounded-full flex items-center text-[11px] border truncate ${
        active ? "border-[#e0651a] bg-[#fdf0e3] text-[#c2703a]" : "border-[#e2e2e2] bg-white text-[var(--semantic-text-primary)] hover:bg-[#f4f4f4]"
      }`}
    >
      {section.name}
    </button>
  );
}

function CompareButton({
  label,
  active,
  disabled,
  title,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={`h-7 px-2.5 rounded-md text-[11px] border disabled:opacity-40 ${
        active
          ? "border-[var(--semantic-brand-primary)] bg-[#eef8f1] text-[var(--semantic-brand-primary)]"
          : "border-[#ddd] bg-white text-[var(--semantic-text-primary)] hover:bg-[#f4f4f4]"
      }`}
    >
      {label}
    </button>
  );
}

function FilterChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-7 px-2.5 shrink-0 rounded-full flex items-center gap-1 text-xs whitespace-nowrap border ${
        active
          ? "border-[var(--semantic-brand-primary)] bg-[#eef8f1] text-[var(--semantic-brand-primary)]"
          : "border-transparent bg-[#f2f2f2] text-[var(--semantic-text-primary)] hover:bg-[#e9e9e9]"
      }`}
    >
      {label}
      <span className="font-normal text-[var(--semantic-text-secondary)]">{count}</span>
    </button>
  );
}
