/**
 * ガイド › フィードバック管理。
 *
 * 各画面の右下のフィードバックボタン（src/components/feedback）で集めた声を、
 * 管理画面側でまとめて見返すページ。ステータスのチップと、画面・キーワードで絞り込める。
 *
 * 一覧は表ではなく 1 件 1 カードの積み重ね。
 * 「No. / 状態 / 種類 …… 日時」→ 件名 → 本文 → 記入者・画面 の 4 段で、
 * 本文をその場で読めるようにしている（表だと 1 行に潰れて読めない）。
 *
 * 1 件の中身（場所・コメントのやり取り・状態の変更・削除）は、
 * 変更履歴キャンバスの左レールと同じ詳細ポップアップ（FeedbackDetailDialog）で扱う。
 * 表示だけをここで持ち、編集の作法はキャンバス側とそろえている。
 *
 * 保存先はフィードバック機能と同じ端末の localStorage。
 */
import { useMemo, useState } from "react";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { FeedbackDetailDialog, formatStamp } from "./FeedbackDetailDialog";
import { screenBreadcrumb } from "../../../components/feedback/screenBreadcrumb";
import {
  KIND_LABELS,
  STATUS_CHIP_CLASS,
  STATUS_DOT_COLOR,
  STATUS_LABELS,
  STATUS_ORDER,
  companyLabel,
  feedbackDetail,
  feedbackHeadline,
  isUnresolved,
  sortNewestFirst,
  useFeedback,
  type FeedbackEntry,
  type FeedbackKind,
  type FeedbackStatus,
} from "../../../components/feedback/feedbackStore";

/** 種類は背景を敷かず色文字だけにする（状態バッジと並べたときにうるさくならない） */
const KIND_TEXT_CLASS: Record<FeedbackKind, string> = {
  bug: "text-[#c8322b]",
  improvement: "text-[#2f6fc4]",
  question: "text-[#7c4dcc]",
  other: "text-[var(--semantic-text-secondary)]",
};

/** 絞り込みチップ用。「すべて」「未完了」＋ 状態ごと */
type StatusFilter = "all" | "unresolved" | FeedbackStatus;

export function FeedbackManagementPage() {
  const { entries, openCount, statusCounts, setStatus, remove, addComment } = useFeedback();
  const [status, setStatusFilter] = useState<StatusFilter>("all");
  // 管理画面のほかの一覧と同じく、入力（*Input）は「検索」を押して初めて効く
  const [screenInput, setScreenInput] = useState("all");
  const [keywordInput, setKeywordInput] = useState("");
  const [screen, setScreen] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  /** 画面の絞り込み候補。フィードバックが 1 件でもある画面だけ出す */
  const screenOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of entries) {
      if (!seen.has(e.pathname)) seen.set(e.pathname, screenBreadcrumb(e.pathname, e.screenTitle).join(" › "));
    }
    return [
      { value: "all", label: "すべての画面" },
      ...[...seen].sort((a, b) => a[1].localeCompare(b[1], "ja")).map(([path, label]) => ({ value: path, label })),
    ];
  }, [entries]);

  const visible = useMemo(() => {
    const word = keyword.trim();
    return sortNewestFirst(
      entries.filter((e) => {
        if (status === "unresolved" ? !isUnresolved(e.status) : status !== "all" && e.status !== status) return false;
        if (screen !== "all" && e.pathname !== screen) return false;
        if (word && ![feedbackHeadline(e), e.body, e.author, e.screenTitle].some((t) => t.includes(word))) return false;
        return true;
      })
    );
  }, [entries, status, screen, keyword]);

  const openEntry = openId ? entries.find((e) => e.id === openId) ?? null : null;

  function handleSearch() {
    setScreen(screenInput);
    setKeyword(keywordInput);
  }

  /** 状態のチップも含めて、絞り込みを全部やめて最初の並びに戻す */
  function handleReset() {
    setStatusFilter("all");
    setScreenInput("all");
    setKeywordInput("");
    setScreen("all");
    setKeyword("");
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <PageTitleBar title="フィードバック管理" />

      <div className="flex-1 min-h-0 overflow-auto bg-[#f4f4f4]">
        <div className="px-6 pt-4 pb-10 flex flex-col gap-4">
          <p className="text-[11px] text-[var(--semantic-text-secondary)]">
            各画面の右下のフィードバックボタンで集まった声の一覧です。カードを押すと中身とやり取りが開き、対応状況の変更・コメントの追記ができます。
            変更履歴キャンバスの左レールからも同じ一覧を見られます。
          </p>

          {/* 状態の絞り込み。数字はその状態の件数 */}
          <div className="bg-white rounded-lg border border-[#dcdcdc] p-4 flex flex-col gap-3">
            <p className="text-[13px] text-[var(--semantic-text-secondary)]">ステータスで絞り込み</p>
            <div className="flex flex-wrap gap-2">
              <StatusChip label="すべて" count={entries.length} active={status === "all"} onClick={() => setStatusFilter("all")} />
              <StatusChip
                label="未完了"
                count={openCount}
                active={status === "unresolved"}
                onClick={() => setStatusFilter("unresolved")}
              />
              <span className="w-px self-stretch bg-[#dcdcdc]" />
              {STATUS_ORDER.map((s) => (
                <StatusChip
                  key={s}
                  label={STATUS_LABELS[s]}
                  count={statusCounts[s]}
                  dot={STATUS_DOT_COLOR[s]}
                  active={status === s}
                  onClick={() => setStatusFilter(s)}
                />
              ))}
            </div>
          </div>

          {/* 画面・キーワード */}
          <div className="bg-white rounded-lg border border-[#dcdcdc] p-4 flex flex-wrap items-center gap-3">
            <Pulldown
              value={screenInput}
              onChange={setScreenInput}
              options={screenOptions}
              className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[320px]"
            />
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="件名・内容・記入者・画面名で検索"
              className="h-12 px-4 rounded-lg border border-[#d0d0d0] bg-white text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-disabled)] w-[320px] outline-none focus:border-[var(--semantic-brand-primary)]"
            />
            {/* 入力欄が折り返しても、ボタンは常に右端に寄せる */}
            <div className="ml-auto flex gap-2 items-center">
              <button
                type="button"
                onClick={handleReset}
                className="bg-white border border-[#808080] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg text-sm text-[#808080]"
              >
                リセット
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg text-base text-white"
              >
                検索
              </button>
            </div>
          </div>

          {/* 一覧 */}
          {entries.length === 0 ? (
            <EmptyState
              title="フィードバックはまだありません"
              body="各画面の右下にあるフィードバックボタンから、気になったことを書き残すとここに集まります。"
            />
          ) : visible.length === 0 ? (
            <EmptyState title="条件に合うフィードバックがありません" body="絞り込みを変えてお試しください。" />
          ) : (
            <ul className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden">
              {visible.map((entry) => (
                <Row key={entry.id} entry={entry} onOpen={() => setOpenId(entry.id)} />
              ))}
            </ul>
          )}

          <p className="text-xs font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
            フィードバックはこのブラウザ（localStorage）に保存されています。端末や別のブラウザとは共有されません。
          </p>
        </div>
      </div>

      {openEntry && (
        <FeedbackDetailDialog
          entry={openEntry}
          onChangeStatus={(next) => setStatus(openEntry.id, next)}
          onRemove={() => {
            if (window.confirm(`No.${openEntry.no} を削除しますか？`)) {
              remove(openEntry.id);
              setOpenId(null);
            }
          }}
          onAddComment={(author, body, entryCompany) => addComment(openEntry.id, author, body, entryCompany)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

/** 状態の絞り込みチップ。丸ポチの色は一覧のバッジと同じ配色 */
function StatusChip({
  label,
  count,
  dot,
  active,
  onClick,
}: {
  label: string;
  count: number;
  dot?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 px-3.5 rounded-full flex items-center gap-1.5 text-sm border ${
        active
          ? "border-[var(--semantic-brand-primary)] bg-[#eef8f1] text-[var(--semantic-brand-primary)]"
          : "border-[#dcdcdc] bg-white text-[var(--semantic-text-primary)] hover:bg-[#f5f5f5]"
      }`}
    >
      {active ? (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
      ) : (
        dot && <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
      )}
      {label}
      <span className="font-normal tabular-nums text-[var(--semantic-text-secondary)]">{count}</span>
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-lg border border-[#dcdcdc] px-6 py-12 flex flex-col items-center gap-2 text-center">
      <p className="text-base text-[var(--semantic-text-primary)]">{title}</p>
      <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{body}</p>
    </div>
  );
}

function Row({ entry, onOpen }: { entry: FeedbackEntry; onOpen: () => void }) {
  const detail = feedbackDetail(entry);
  const commentCount = entry.comments?.length ?? 0;
  /** 「西原商会 荒井」。会社を持たない古いデータは名前だけ */
  const who = [companyLabel(entry.company), entry.author].filter(Boolean).join(" ");
  /** 「管理画面 › 帳票管理 ・ コメント 2」 */
  const meta = [
    screenBreadcrumb(entry.pathname, entry.screenTitle).join(" › "),
    commentCount > 0 ? `コメント ${commentCount}` : "",
  ].filter(Boolean);

  return (
    <li className="border-t border-[#eee] first:border-t-0">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`No.${entry.no} ${feedbackHeadline(entry)} の詳細を開く`}
        className="w-full px-5 py-4 flex flex-col gap-1.5 text-left hover:bg-[#f7f9f8]"
      >
        {/* 1 行目: No. / 状態 / 種類 …… 右端に日時と記入者 */}
        <div className="flex items-start gap-3 w-full">
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span className="h-6 px-2 rounded-md flex items-center text-[13px] tabular-nums bg-[#e6f4ec] text-[var(--semantic-brand-primary)]">
              No.{entry.no}
            </span>
            <span className={`h-6 px-2.5 rounded-md flex items-center text-xs ${STATUS_CHIP_CLASS[entry.status]}`}>
              {STATUS_LABELS[entry.status]}
            </span>
            <span className={`text-[13px] ${KIND_TEXT_CLASS[entry.kind]}`}>{KIND_LABELS[entry.kind]}</span>
          </div>
          {/* 日時の下に記入者 */}
          <div className="shrink-0 flex flex-col items-end gap-0.5 text-[var(--semantic-text-secondary)]">
            <span className="text-[13px] font-normal tabular-nums">{formatStamp(entry.createdAt)}</span>
            {who && <span className="text-xs font-normal">{who}</span>}
          </div>
        </div>

        {/* 2 行目: 件名 */}
        <span className="text-base leading-relaxed break-words text-[var(--semantic-text-primary)]">
          {feedbackHeadline(entry)}
        </span>

        {/* 3 行目: 本文 */}
        {detail && (
          <span className="text-[13px] font-normal leading-relaxed whitespace-pre-wrap break-words text-[var(--semantic-text-secondary)]">
            {detail}
          </span>
        )}

        {/* 4 行目: 記入者・画面・コメント数 */}
        <span className="text-xs font-normal break-words text-[var(--semantic-text-secondary)]">{meta.join(" ・ ")}</span>
      </button>
    </li>
  );
}
