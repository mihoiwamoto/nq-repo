/**
 * ガイド › フィードバック管理。
 *
 * 右下のフィードバックボタン（src/components/feedback）で集めた声を、
 * 管理画面側でまとめて見返すページ。絞り込み・対応済みの切り替え・削除ができる。
 *
 * 保存先はフィードバック機能と同じ端末の localStorage。
 * 他の人に渡すときは「Markdown でコピー」で貼り付ける。
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import {
  KIND_LABELS,
  KIND_ORDER,
  feedbackToMarkdown,
  formatFeedbackTime,
  sortNewestFirst,
  spotDisplay,
  useFeedback,
  type FeedbackEntry,
  type FeedbackKind,
} from "../../../components/feedback/feedbackStore";

/** 種類ごとのバッジ色（フィードバックパネルと合わせる） */
const KIND_STYLES: Record<FeedbackKind, string> = {
  bug: "bg-[#fdecec] text-[#c8322b]",
  improvement: "bg-[#e6f5ec] text-[var(--semantic-brand-primary)]",
  question: "bg-[#e8f1fd] text-[#2f6fc4]",
  other: "bg-[#eeeeee] text-[var(--semantic-text-secondary)]",
};

/** 場所を表す印。フィードバックパネルのピンと同じ形 */
const IconPin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6-5.2-6-11a6 6 0 0112 0c0 5.8-6 11-6 11z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

const STATUS_OPTIONS = [
  { value: "all", label: "すべての状態" },
  { value: "open", label: "未対応" },
  { value: "done", label: "対応済み" },
];

const KIND_OPTIONS = [{ value: "all", label: "すべての種類" }, ...KIND_ORDER.map((k) => ({ value: k, label: KIND_LABELS[k] }))];

export function FeedbackManagementPage() {
  const { entries, openCount, setStatus, remove } = useFeedback();
  const [status, setStatusFilter] = useState("all");
  const [kind, setKind] = useState("all");
  const [screen, setScreen] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [copied, setCopied] = useState(false);

  /** 画面の絞り込み候補。フィードバックが 1 件でもある画面だけ出す */
  const screenOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of entries) {
      if (!seen.has(e.pathname)) seen.set(e.pathname, `${e.screenCategory} › ${e.screenTitle}`);
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
        if (status !== "all" && e.status !== status) return false;
        if (kind !== "all" && e.kind !== kind) return false;
        if (screen !== "all" && e.pathname !== screen) return false;
        if (word && ![e.body, e.author, e.screenTitle, e.spot?.text ?? ""].some((t) => t.includes(word))) return false;
        return true;
      })
    );
  }, [entries, status, kind, screen, keyword]);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(feedbackToMarkdown(visible));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.alert("コピーできませんでした。ブラウザの設定をご確認ください。");
    }
  }

  const doneCount = entries.length - openCount;
  const filtered = visible.length !== entries.length;

  return (
    <div className="pb-10">
      <PageTitleBar
        title="フィードバック管理"
        action={
          <button
            type="button"
            onClick={copyAll}
            disabled={visible.length === 0}
            className="h-12 px-5 rounded-lg bg-[var(--semantic-brand-primary)] disabled:bg-[#d0d0d0] text-white text-base shadow-[0px_2px_2px_rgba(51,51,51,0.24)] disabled:shadow-none"
          >
            {copied ? "コピーしました" : `Markdown でコピー${filtered ? `（${visible.length} 件）` : ""}`}
          </button>
        }
      />

      <div className="px-6 pt-6 flex flex-col gap-4">
        {/* 件数 */}
        <div className="flex gap-3">
          <CountCard label="未対応" value={openCount} tone="open" />
          <CountCard label="対応済み" value={doneCount} tone="done" />
          <CountCard label="合計" value={entries.length} tone="total" />
        </div>

        {/* 絞り込み */}
        <div className="bg-white rounded-lg p-4 flex flex-wrap items-center gap-3">
          <Pulldown value={status} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <Pulldown value={kind} onChange={setKind} options={KIND_OPTIONS} />
          <Pulldown value={screen} onChange={setScreen} options={screenOptions} className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[320px]" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="内容・記入者・画面名で検索"
            className="h-12 px-4 rounded-lg border border-[#d0d0d0] bg-white text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-disabled)] w-[320px] outline-none focus:border-[var(--semantic-brand-primary)]"
          />
          {(status !== "all" || kind !== "all" || screen !== "all" || keyword !== "") && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setKind("all");
                setScreen("all");
                setKeyword("");
              }}
              className="h-12 px-4 rounded-lg border border-[#d0d0d0] bg-white text-base text-[var(--semantic-text-primary)] hover:bg-[#f5f5f5]"
            >
              絞り込みを解除
            </button>
          )}
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
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f4f1] text-sm text-[var(--semantic-text-secondary)]">
                  <th className="px-4 py-3 w-[110px] font-bold">状態</th>
                  <th className="px-4 py-3 w-[90px] font-bold">種類</th>
                  <th className="px-4 py-3 w-[240px] font-bold">画面 / 場所</th>
                  <th className="px-4 py-3 font-bold">内容</th>
                  <th className="px-4 py-3 w-[170px] font-bold">記入者 / 日時</th>
                  <th className="px-4 py-3 w-[100px] font-bold">操作</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => (
                  <Row
                    key={entry.id}
                    entry={entry}
                    onToggleStatus={() => setStatus(entry.id, entry.status === "done" ? "open" : "done")}
                    onRemove={() => {
                      if (window.confirm("このフィードバックを削除しますか？")) remove(entry.id);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
          フィードバックはこのブラウザ（localStorage）に保存されています。端末や別のブラウザとは共有されません。
        </p>
      </div>
    </div>
  );
}

/**
 * 対応状況のチップ。
 * 管理画面のほかの一覧（承認ステータス等）と同じ形・同じ配色にそろえる。
 * 未対応はグレー（＝まだ手がついていない）、対応済みはブランドの緑。
 */
function StatusChip({ done }: { done: boolean }) {
  return (
    <span
      className="h-6 w-20 rounded-lg flex items-center justify-center text-sm text-white shrink-0"
      style={{ backgroundColor: done ? "var(--semantic-brand-primary)" : "#808080" }}
    >
      {done ? "対応済み" : "未対応"}
    </span>
  );
}

function CountCard({ label, value, tone }: { label: string; value: number; tone: "open" | "done" | "total" }) {
  const color =
    tone === "open" ? "text-[var(--semantic-brand-danger)]" : tone === "done" ? "text-[var(--semantic-brand-primary)]" : "text-[var(--semantic-text-primary)]";
  return (
    <div className="bg-white rounded-lg px-5 py-3 min-w-[140px] flex flex-col gap-0.5">
      <span className="text-xs font-normal text-[var(--semantic-text-secondary)]">{label}</span>
      <span className={`text-2xl ${color}`}>{value}</span>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-lg px-6 py-12 flex flex-col items-center gap-2 text-center">
      <p className="text-base text-[var(--semantic-text-primary)]">{title}</p>
      <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{body}</p>
    </div>
  );
}

function Row({ entry, onToggleStatus, onRemove }: { entry: FeedbackEntry; onToggleStatus: () => void; onRemove: () => void }) {
  const done = entry.status === "done";
  return (
    <tr className={`border-t border-[#eee] align-top ${done ? "bg-[#fafafa]" : ""}`}>
      <td className="px-4 py-3">
        <StatusChip done={done} />
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs ${KIND_STYLES[entry.kind]}`}>{KIND_LABELS[entry.kind]}</span>
      </td>
      <td className="px-4 py-3">
        <Link to={entry.pathname} className="text-sm text-[var(--semantic-text-primary)] underline hover:text-[var(--semantic-brand-primary)]">
          {entry.screenCategory} › {entry.screenTitle}
        </Link>
        {entry.spot && (
          <p className="mt-0.5 flex items-center gap-1 text-xs font-normal text-[var(--semantic-text-secondary)]">
            <IconPin className="w-3.5 h-3.5 shrink-0" />
            <span className="min-w-0 truncate">{spotDisplay(entry.spot)}</span>
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <p className={`text-sm font-normal leading-relaxed whitespace-pre-wrap break-words ${done ? "text-[var(--semantic-text-secondary)]" : "text-[var(--semantic-text-primary)]"}`}>
          {entry.body}
        </p>
      </td>
      <td className="px-4 py-3 text-xs font-normal text-[var(--semantic-text-secondary)]">
        {entry.author && <p className="text-sm text-[var(--semantic-text-primary)]">{entry.author}</p>}
        <p>{formatFeedbackTime(entry.createdAt)}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleStatus}
            title={done ? "未対応に戻す" : "対応済みにする"}
            aria-label={done ? "未対応に戻す" : "対応済みにする"}
            className={`size-9 rounded-md flex items-center justify-center hover:bg-[#f0f0f0] ${
              done ? "text-[var(--semantic-brand-primary)]" : "text-[var(--semantic-text-secondary)] hover:text-[var(--semantic-brand-primary)]"
            }`}
          >
            {done ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 7H5V3" />
                <path d="M5 7a8 8 0 113 9" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={onRemove}
            title="削除する"
            aria-label="削除する"
            className="size-9 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#fdecec] hover:text-[var(--semantic-brand-danger)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M10 4h4M9.5 7l.6 12M14.5 7l-.6 12M6.5 7l.8 13.2a1 1 0 001 .8h7.4a1 1 0 001-.8L18.5 7" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
