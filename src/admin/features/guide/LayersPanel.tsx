import { describeShort, isRootElement } from "./domInspector";

function ancestorsOf(el: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  let cur = el.parentElement;
  while (cur && !isRootElement(cur)) {
    out.unshift(cur);
    cur = cur.parentElement;
  }
  return out;
}

export function LayersPanel({
  doc,
  selected,
  onSelect,
  onHover,
}: {
  doc: Document | null;
  selected: HTMLElement | null;
  onSelect: (el: HTMLElement) => void;
  onHover: (el: HTMLElement | null) => void;
}) {
  const root = doc?.getElementById("root") ?? null;
  const base: HTMLElement | null = selected && doc?.contains(selected) ? selected : root;
  const ancestors = selected && doc?.contains(selected) ? ancestorsOf(selected) : [];
  const children = base ? (Array.from(base.children) as HTMLElement[]) : [];

  return (
    <div className="flex flex-col h-full min-h-0" onMouseLeave={() => onHover(null)}>
      <div className="p-3 border-b border-[#e5e5e5]">
        <p className="text-xs font-normal text-[var(--semantic-text-secondary)]">
          選んだ要素の親子関係です。クリックで選択、ホバーでキャンバス上に位置を表示します。
        </p>
      </div>
      {!doc && <p className="p-4 text-sm font-normal text-[var(--semantic-text-secondary)]">画面を読み込んでいます…</p>}
      {doc && (
        <div className="flex-1 overflow-y-auto py-2">
          {ancestors.length > 0 && (
            <div className="px-3 pb-2">
              <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)] mb-1">親要素</p>
              {ancestors.map((el, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelect(el)}
                  onMouseEnter={() => onHover(el)}
                  className="w-full text-left text-xs font-normal text-[var(--semantic-text-primary)] truncate py-1 hover:bg-[#f6f6f6] rounded px-1"
                  style={{ paddingLeft: 4 + Math.min(i, 8) * 8 }}
                >
                  {describeShort(el)}
                </button>
              ))}
            </div>
          )}
          <div className="px-3">
            <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)] mb-1">
              {selected && doc.contains(selected) ? "選択中" : "画面のトップ"}
            </p>
            {base && !isRootElement(base) && (
              <p className="text-xs font-bold text-[var(--semantic-brand-primary)] truncate py-1 px-1 bg-[#e6f4ec] rounded">
                {describeShort(base)}
              </p>
            )}
            <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)] mt-2 mb-1">
              子要素 {children.length} 件
            </p>
            {children.length === 0 && (
              <p className="text-xs font-normal text-[var(--semantic-text-secondary)] px-1">子要素はありません（テキストや入力欄）</p>
            )}
            {children.map((el, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(el)}
                onMouseEnter={() => onHover(el)}
                className="w-full text-left text-xs font-normal text-[var(--semantic-text-primary)] truncate py-1 px-1 hover:bg-[#f6f6f6] rounded flex items-center gap-1"
              >
                <span className="text-[#c0c0c0]">└</span>
                <span className="truncate">{describeShort(el)}</span>
                {el.children.length > 0 && (
                  <span className="ml-auto shrink-0 text-[10px] text-[#a0a0a0]">{el.children.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
