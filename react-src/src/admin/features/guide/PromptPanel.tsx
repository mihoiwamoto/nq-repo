import { useEffect, useState } from "react";
import type { EditOp } from "./canvasTypes";
import type { ScreenEntry } from "./screenCatalog";
import { buildJson, buildPrompt, describeOp } from "./promptBuilder";
import { IconCheck, IconCopy, IconMore, IconTrash } from "./CanvasIcons";

/** 一覧に出す変更の絞り込み（右端の ⋯ から切り替え） */
type OpFilter = "done" | "pending" | "all";
const FILTER_LABELS: Record<OpFilter, string> = { done: "変更済み", pending: "未変更", all: "すべて" };

export function PromptPanel({
  screen,
  ops,
  cursor,
  onToggleDone,
  onReset,
}: {
  screen: ScreenEntry | undefined;
  ops: EditOp[];
  cursor: number;
  onToggleDone: (id: string, done: boolean) => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState<"prompt" | "json" | null>(null);
  const [filter, setFilter] = useState<OpFilter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  /**
   * 依頼文に「入れない」ものを覚えておく方式。
   * 入れるものを覚える方式にすると、新しく加えた変更を毎回選び直す必要が出る。
   */
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  if (!screen) return null;

  // 取り消し済み（undo した）ぶんは、キャンバスに当たっていないので依頼文にも入れられない
  const undone = ops.slice(cursor);
  const active = ops.slice(0, cursor);
  const doneOps = active.filter((op) => op.done);
  const pending = active.filter((op) => !op.done);
  const picked = pending.filter((op) => !excluded.has(op.id));

  const prompt = buildPrompt(
    screen,
    picked,
    pending.length > 0
      ? "（依頼文に入れる変更が 1 件も選ばれていません。下の変更履歴で選んでください）"
      : doneOps.length > 0
        ? "（未変更の変更はありません。すべて変更済みになっています）"
        : undefined
  );

  function togglePick(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copy(kind: "prompt" | "json") {
    const text = kind === "prompt" ? prompt : buildJson(screen!, picked);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
    } catch {
      window.prompt("コピーできませんでした。手動でコピーしてください:", text);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-3 border-b border-[#eee] flex flex-col gap-2">
        <p className="text-xs font-normal text-[var(--semantic-text-secondary)] leading-relaxed">
          下の変更履歴で選んだもの（緑の枠）だけを、Claude 向けの依頼文にします。コードに反映できたら ✓ を押すと「変更済み」に移ります。
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => copy("prompt")}
            disabled={picked.length === 0}
            className="flex-1 h-9 rounded-lg bg-[var(--semantic-brand-primary)] text-white text-xs flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <IconCopy width={14} height={14} />
            {copied === "prompt" ? "コピーしました" : "プロンプトをコピー"}
          </button>
          <button
            type="button"
            onClick={() => copy("json")}
            disabled={picked.length === 0}
            title="操作の生データ（JSON）"
            className="h-9 px-3 rounded-lg border border-[#ddd] text-xs text-[var(--semantic-text-primary)] disabled:opacity-40"
          >
            {copied === "json" ? "OK" : "JSON"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (ops.length === 0) return;
              if (window.confirm("この画面の変更をすべて取り消しますか？（元に戻せません）")) onReset();
            }}
            disabled={ops.length === 0}
            title="この画面の変更をすべて取り消す"
            className="h-9 px-2.5 rounded-lg border border-[#f5c9c9] text-[var(--semantic-brand-danger)] disabled:opacity-40"
          >
            <IconTrash width={14} height={14} />
          </button>
        </div>
      </div>
      <textarea
        readOnly
        value={prompt}
        className="mx-3 mt-3 h-48 shrink-0 rounded-lg border border-[#ddd] bg-[#fafafa] p-2 text-[11px] font-normal leading-relaxed text-[var(--semantic-text-primary)] outline-none resize-y"
      />

      <div className="px-3 pt-3 pb-1 flex items-center gap-2 relative">
        <span className="flex-1 min-w-0 text-xs font-bold text-[var(--semantic-text-primary)] truncate">
          変更履歴{" "}
          <span className="font-normal text-[var(--semantic-text-secondary)]">
            {pending.length} 件中 {picked.length} 件を選択
          </span>
        </span>
        {/* 右端の ⋯ で「変更済み / 未変更 / すべて」を切り替える */}
        <button
          type="button"
          title="表示する変更を切り替え"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className={`shrink-0 size-6 rounded-md flex items-center justify-center ${
            menuOpen || filter !== "all" ? "bg-[#ececec] text-[var(--semantic-text-primary)]" : "text-[var(--semantic-text-secondary)] hover:bg-[#ececec]"
          }`}
        >
          <IconMore width={16} height={16} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div role="menu" className="absolute right-3 top-8 z-20 w-40 rounded-lg border border-[#e5e5e5] bg-white py-1 shadow-lg">
              {(Object.keys(FILTER_LABELS) as OpFilter[]).map((f) => {
                const count = f === "done" ? doneOps.length : f === "pending" ? pending.length : active.length;
                return (
                  <button
                    key={f}
                    type="button"
                    role="menuitemradio"
                    aria-checked={filter === f}
                    onClick={() => {
                      setFilter(f);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 h-8 text-left text-xs ${
                      filter === f ? "text-[var(--semantic-brand-primary)] font-bold" : "text-[var(--semantic-text-primary)] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <span className="w-3">{filter === f ? "✓" : ""}</span>
                    <span className="flex-1">{FILTER_LABELS[f]}</span>
                    <span className="text-[var(--semantic-text-secondary)] font-normal">{count}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
        {ops.length === 0 && <p className="text-xs font-normal text-[var(--semantic-text-secondary)]">まだ変更はありません</p>}
        {ops.length > 0 && filter !== "done" && pending.length === 0 && (
          <p className="text-xs font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
            未変更の変更はありません{doneOps.length > 0 && "（変更済みは右端の ⋯ から）"}。
          </p>
        )}

        {filter !== "done" &&
          pending.map((op) => (
            <OpRow
              key={op.id}
              op={op}
              picked={!excluded.has(op.id)}
              onTogglePick={() => togglePick(op.id)}
              onToggleDone={() => onToggleDone(op.id, true)}
            />
          ))}

        {/* 取り消し済みは依頼文に入れられないので、選ぶ枠も ✓ も出さない */}
        {filter !== "done" &&
          undone.map((op) => (
            <div
              key={op.id}
              className="rounded-md border border-dashed border-[#ddd] px-2 py-1.5 text-[11px] font-normal leading-snug text-[#b0b0b0]"
            >
              <span className="font-bold">[{op.target}]</span> {describeOp(op)}
              <span className="ml-1">（取り消し済み）</span>
            </div>
          ))}

        {filter !== "pending" && (doneOps.length > 0 || filter === "done") && (
          <>
            <div className="mt-3 pt-3 border-t border-[#eee] text-xs font-bold text-[var(--semantic-text-primary)]">
              変更済み <span className="font-normal text-[var(--semantic-text-secondary)]">{doneOps.length} 件</span>
            </div>
            {doneOps.length === 0 && (
              <p className="text-xs font-normal text-[var(--semantic-text-secondary)]">変更済みにした変更はまだありません。</p>
            )}
            {doneOps.map((op) => (
              <OpRow key={op.id} op={op} done onToggleDone={() => onToggleDone(op.id, false)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 変更 1 件の行。
 * 本文を押すと依頼文に入れる / 入れないが切り替わり、入れるものは枠が緑になる。
 * 右の ✓ は「もうコードに反映した」印で、押すと変更済みへ移る。
 */
function OpRow({
  op,
  picked,
  done,
  onTogglePick,
  onToggleDone,
}: {
  op: EditOp;
  picked?: boolean;
  done?: boolean;
  onTogglePick?: () => void;
  onToggleDone: () => void;
}) {
  return (
    <div
      className={`flex items-start gap-1 rounded-md border pl-2 pr-1 py-1.5 ${
        done
          ? "border-[#eee] bg-[#fafafa]"
          : picked
            ? "border-[var(--semantic-brand-primary)] bg-[#f4faf5]"
            : "border-[#e5e5e5]"
      }`}
    >
      <button
        type="button"
        onClick={onTogglePick}
        disabled={done}
        title={done ? undefined : picked ? "依頼文から外す" : "依頼文に入れる"}
        className={`flex-1 min-w-0 text-left text-[11px] font-normal leading-snug ${
          done ? "text-[#a0a0a0] line-through decoration-[#d0d0d0] cursor-default" : "text-[var(--semantic-text-primary)]"
        }`}
      >
        <span className="font-bold">[{op.target}]</span> {describeOp(op)}
      </button>
      <button
        type="button"
        title={done ? "未変更に戻す" : "コードに反映した（変更済みにする）"}
        onClick={onToggleDone}
        className={`shrink-0 size-6 rounded-md flex items-center justify-center ${
          done ? "bg-[var(--semantic-brand-primary)] text-white" : "text-[var(--semantic-text-secondary)] hover:bg-[#ececec]"
        }`}
      >
        <IconCheck width={14} height={14} />
      </button>
    </div>
  );
}
