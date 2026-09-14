import { useEffect, useState } from "react";
import type { EditOp } from "./canvasTypes";
import type { ScreenEntry } from "./screenCatalog";
import { buildJson, buildPrompt, describeOp } from "./promptBuilder";
import { IconCopy, IconTrash } from "./CanvasIcons";

export function PromptPanel({
  screen,
  ops,
  cursor,
  onReset,
}: {
  screen: ScreenEntry | undefined;
  ops: EditOp[];
  cursor: number;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState<"prompt" | "json" | null>(null);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  if (!screen) return null;
  const active = ops.slice(0, cursor);
  const prompt = buildPrompt(screen, active);

  async function copy(kind: "prompt" | "json") {
    const text = kind === "prompt" ? prompt : buildJson(screen!, active);
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
          ここまでの変更を Claude 向けの依頼文にしたものです。コピーしてそのまま貼り付けると、コードに反映してもらえます。
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => copy("prompt")}
            disabled={active.length === 0}
            className="flex-1 h-9 rounded-lg bg-[var(--semantic-brand-primary)] text-white text-xs flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <IconCopy width={14} height={14} />
            {copied === "prompt" ? "コピーしました" : "プロンプトをコピー"}
          </button>
          <button
            type="button"
            onClick={() => copy("json")}
            disabled={active.length === 0}
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
      <div className="px-3 pt-3 pb-1 text-xs font-bold text-[var(--semantic-text-primary)]">
        変更履歴 <span className="font-normal text-[var(--semantic-text-secondary)]">{active.length} 件</span>
      </div>
      <ol className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
        {ops.length === 0 && <li className="text-xs font-normal text-[var(--semantic-text-secondary)]">まだ変更はありません</li>}
        {ops.map((op, i) => {
          const undone = i >= cursor;
          return (
            <li
              key={op.id}
              className={`rounded-md border px-2 py-1.5 text-[11px] font-normal leading-snug ${
                undone ? "border-dashed border-[#ddd] text-[#b0b0b0]" : "border-[#e5e5e5] text-[var(--semantic-text-primary)]"
              }`}
            >
              <span className="text-[var(--semantic-brand-primary)] mr-1">{i + 1}.</span>
              <span className="font-bold">[{op.target}]</span> {describeOp(op)}
              {undone && <span className="ml-1">（取り消し済み）</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
