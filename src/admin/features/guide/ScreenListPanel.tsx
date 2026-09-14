import { useEffect, useMemo, useState } from "react";
import { groupOf, groupOrder, roleOf, roleOrder, type ScreenEntry, type ScreenGroup, type ScreenRole } from "./screenCatalog";
import { IconExternal, IconFolder, IconLedger, IconSearch } from "./CanvasIcons";
import type { ScreenCommentCount } from "./comments";
import iconArrowDown from "@images/Icon/arrow_down.svg";
import iconArrowUp from "@images/Icon/arrow_up.svg";

/** 帳票が追加されたバージョンごとのチップの色 */
const VERSION_CHIP_CLASS: Record<string, string> = {
  "Ver.1.0": "bg-[#fdefe0] text-[#d97316]",
  "Ver.2.0": "bg-[#e7f1fe] text-[#2f7fd4]",
  "Ver.3.0": "bg-[#fdeaea] text-[var(--semantic-brand-danger)]",
  "Ver.4.0": "bg-[#e6f4ec] text-[var(--semantic-brand-primary)]",
};
/** 絞り込みチップの並び（新しいバージョンが左） */
const VERSION_ORDER = ["Ver.4.0", "Ver.3.0", "Ver.2.0", "Ver.1.0"];

const VERSION_DOT_CLASS: Record<string, string> = {
  "Ver.1.0": "bg-[#d97316]",
  "Ver.2.0": "bg-[#2f7fd4]",
  "Ver.3.0": "bg-[var(--semantic-brand-danger)]",
  "Ver.4.0": "bg-[var(--semantic-brand-primary)]",
};

/** 「帳票一覧」「その他の画面」の区切り帯 */
function SectionBand({ icon, label }: { icon: "ledger" | "other"; label: string }) {
  return (
    <p className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-[var(--semantic-text-secondary)] bg-[#f8f8f8] border-y border-[#eee]">
      {icon === "ledger" ? <IconLedger width={14} height={14} /> : <IconFolder width={14} height={14} />}
      {label}
    </p>
  );
}

type RoleBlock = { role: ScreenRole | null; items: ScreenEntry[] };
/** edited = 編集のある画面数、commented = 未解決コメントのある画面数 */
type GroupBlock = { group: ScreenGroup; blocks: RoleBlock[]; count: number; edited: number; commented: number };

/** 赤 = 編集件数、緑 = 未解決コメント件数。キャンバスのレールと同じ色分け */
function Badge({ count, tone }: { count: number; tone: "edit" | "comment" }) {
  if (!count) return null;
  return (
    <span
      className={`shrink-0 min-w-5 h-5 px-1.5 rounded-full text-white text-[10px] flex items-center justify-center ${
        tone === "edit" ? "bg-[var(--semantic-brand-danger)]" : "bg-[var(--semantic-brand-primary)]"
      }`}
      title={tone === "edit" ? `編集 ${count} 件` : `未解決コメント ${count} 件`}
    >
      {count}
    </span>
  );
}

function buildGroups(
  screens: ScreenEntry[],
  counts: Record<string, number>,
  commentCounts: Record<string, ScreenCommentCount>
): GroupBlock[] {
  const map = new Map<string, GroupBlock>();
  for (const s of screens) {
    const group = groupOf(s);
    let gb = map.get(group.key);
    if (!gb) map.set(group.key, (gb = { group, blocks: [], count: 0, edited: 0, commented: 0 }));
    const role = roleOf(s);
    let rb = gb.blocks.find((b) => b.role === role);
    if (!rb) gb.blocks.push((rb = { role, items: [] }));
    rb.items.push(s);
    gb.count += 1;
    if (counts[s.id]) gb.edited += 1;
    if (commentCounts[s.id]?.open) gb.commented += 1;
  }
  const out = Array.from(map.values());
  for (const gb of out) gb.blocks.sort((a, b) => roleOrder(a.role) - roleOrder(b.role));
  // 帳票は追加順、その他は元の並び（category → feature → route）を保つ
  return out.sort((a, b) => groupOrder(a.group.key) - groupOrder(b.group.key));
}

export function ScreenListPanel({
  screens,
  activeId,
  counts,
  commentCounts,
  thumbIds,
  onSelect,
}: {
  /** 表示モード（PC=管理画面 / タブレット=アプリ）で絞り込んだあとの画面 */
  screens: ScreenEntry[];
  activeId: string | undefined;
  /** 画面ごとの編集件数（赤バッジ） */
  counts: Record<string, number>;
  /** 画面ごとのコメント件数（緑バッジ。未解決の数を出す） */
  commentCounts: Record<string, ScreenCommentCount>;
  /** 撮影済みサムネイルがある画面 ID */
  thumbIds: Set<string>;
  onSelect: (screen: ScreenEntry) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [editedOnly, setEditedOnly] = useState(false);
  // 帳票が追加されたバージョンで絞る（もう一度押すと解除）。ダッシュボードの Ver. メニューと同じ
  const [versionFilter, setVersionFilter] = useState<string | null>(null);
  /**
   * ユーザーが手で開閉したグループ（true=開く / false=閉じる）。
   * ここに無いグループは既定値（絞り込み中=開く、通常=閉じる、選択中の画面の帳票=開く）に従う。
   * 以前は「絞り込み中は常に開く」としていたため、Ver. チップや検索中にアコーディオンが閉じられなかった。
   */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    // 空白（半角・全角）区切りで複数語。すべての語がどこかに含まれる画面だけ残す（AND 検索）
    const terms = keyword.toLowerCase().split(/[\s\u3000]+/).filter(Boolean);
    return screens.filter((s) => {
      if (editedOnly && !counts[s.id]) return false;
      if (versionFilter && groupOf(s).version !== versionFilter) return false;
      if (terms.length === 0) return true;
      const haystack = [s.title, s.componentName, s.route, s.feature, s.filePath, groupOf(s).label].join(" ").toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [screens, keyword, editedOnly, versionFilter, counts]);

  const groups = useMemo(() => buildGroups(filtered, counts, commentCounts), [filtered, counts, commentCounts]);

  // 今開いている画面の帳票は自動で開く
  const activeGroupKey = useMemo(() => {
    const s = screens.find((x) => x.id === activeId);
    return s ? groupOf(s).key : null;
  }, [screens, activeId]);
  useEffect(() => {
    if (!activeGroupKey) return;
    // 選択が別の帳票に移ったら、その帳票を手で閉じていた記録は消して既定（開く）に戻す
    setOverrides((prev) => {
      if (!(activeGroupKey in prev)) return prev;
      const next = { ...prev };
      delete next[activeGroupKey];
      return next;
    });
  }, [activeGroupKey]);

  const searching = keyword.trim() !== "" || editedOnly || versionFilter !== null;

  // 検索語・絞り込みを変えたら手動の開閉はリセット（新しい結果は既定の状態で見せる）
  useEffect(() => {
    setOverrides({});
  }, [keyword, editedOnly, versionFilter]);

  function isOpen(key: string): boolean {
    const manual = overrides[key];
    if (manual !== undefined) return manual;
    return searching || key === activeGroupKey;
  }

  function toggle(key: string) {
    const next = !isOpen(key);
    setOverrides((prev) => ({ ...prev, [key]: next }));
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 flex flex-col gap-2 border-b border-[#e5e5e5]">
        <label className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#f4f4f4] text-[var(--semantic-text-secondary)]">
          <IconSearch width={16} height={16} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="帳票名・画面名・URL で検索（空白区切りで絞り込み）"
            className="flex-1 bg-transparent text-sm font-normal text-[var(--semantic-text-primary)] outline-none placeholder:text-[#a0a0a0]"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-normal text-[var(--semantic-text-secondary)] select-none whitespace-nowrap">
          <input type="checkbox" checked={editedOnly} onChange={(e) => setEditedOnly(e.target.checked)} className="accent-[var(--semantic-brand-primary)]" />
          編集した画面だけ表示
          <span className="ml-auto">
            {groups.length} 帳票 / {filtered.length} 画面
          </span>
        </label>
        {/* 1 行に並べて横スクロール（バージョンが増えても縦に伸びない）。縦ホイールでも横に流す */}
        <div
          className="flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5 -mb-0.5 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
          role="group"
          aria-label="バージョンで絞り込み"
          onWheel={(e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY;
          }}
        >
          {VERSION_ORDER.map((version) => {
            const active = versionFilter === version;
            return (
              <button
                key={version}
                type="button"
                aria-pressed={active}
                onClick={() => setVersionFilter((v) => (v === version ? null : version))}
                title={active ? "絞り込みを解除" : `${version} で追加された帳票だけ表示`}
                className={`h-6 shrink-0 px-2 rounded-full text-[11px] font-bold flex items-center gap-1 border whitespace-nowrap ${
                  active
                    ? "border-transparent bg-[var(--semantic-brand-primary)] text-white"
                    : `border-transparent ${VERSION_CHIP_CLASS[version]} hover:brightness-95`
                }`}
              >
                <span className={`inline-block size-1.5 rounded-full ${active ? "bg-white" : VERSION_DOT_CLASS[version]}`} />
                {version}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {groups.length === 0 && <p className="p-4 text-sm font-normal text-[var(--semantic-text-secondary)]">該当する画面がありません</p>}
        {groups.map((gb, i) => {
          const open = isOpen(gb.group.key);
          const isActiveGroup = gb.group.key === activeGroupKey;
          const firstOther = gb.group.kind === "other" && (i === 0 || groups[i - 1].group.kind === "ledger");
          const firstLedger = gb.group.kind === "ledger" && i === 0;
          return (
            <div key={gb.group.key} className="border-b border-[#f0f0f0]">
              {firstLedger && <SectionBand icon="ledger" label="帳票一覧" />}
              {firstOther && <SectionBand icon="other" label="その他の画面" />}
              <button
                type="button"
                onClick={() => toggle(gb.group.key)}
                aria-expanded={open}
                className={`w-full flex items-center gap-2 px-3 min-h-11 py-2 text-left ${isActiveGroup && !open ? "bg-[#f3faf6]" : "hover:bg-[#f8f8f8]"}`}
              >
                <span
                  className={`inline-block size-2 rounded-full shrink-0 ${
                    (gb.group.version && VERSION_DOT_CLASS[gb.group.version]) || "bg-[#c8c8c8]"
                  }`}
                />
                {gb.group.version && (
                  <span
                    className={`shrink-0 h-5 px-1.5 rounded text-[10px] font-bold flex items-center whitespace-nowrap ${
                      VERSION_CHIP_CLASS[gb.group.version] ?? "bg-[#eee] text-[var(--semantic-text-secondary)]"
                    }`}
                  >
                    {gb.group.version}
                  </span>
                )}
                <span className="flex-1 min-w-0 text-sm leading-tight text-[var(--semantic-text-primary)] break-words">{gb.group.label}</span>
                <Badge count={gb.edited} tone="edit" />
                <Badge count={gb.commented} tone="comment" />
                <span className="shrink-0 text-[11px] font-normal text-[var(--semantic-text-secondary)]">{gb.count}</span>
                <span
                  aria-hidden
                  className="size-3 shrink-0 bg-[var(--semantic-text-secondary)]"
                  style={{
                    WebkitMaskImage: `url("${open ? iconArrowUp : iconArrowDown}")`,
                    maskImage: `url("${open ? iconArrowUp : iconArrowDown}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
              </button>
              {open && (
                <div className="pb-2 bg-[#fcfcfc]">
                  {gb.blocks.map((rb) => (
                    <div key={rb.role ?? "all"}>
                      {rb.role && (
                        <p className="px-3 pt-2 pb-1 pl-7 text-[11px] font-normal text-[var(--semantic-text-secondary)]">
                          {rb.role} <span className="text-[#b5b5b5]">{rb.items.length}</span>
                        </p>
                      )}
                      {rb.items.map((s) => {
                        const active = s.id === activeId;
                        return (
                          <div
                            key={s.id}
                            className={`w-full flex items-center gap-2 pl-7 pr-2 py-1.5 ${active ? "bg-[#e6f4ec]" : "hover:bg-[#f2f2f2]"}`}
                          >
                            <button
                              type="button"
                              onClick={() => onSelect(s)}
                              title={`${s.filePath}\n${s.route}`}
                              className="flex-1 min-w-0 flex items-center gap-2 text-left"
                            >
                              <span className="w-12 h-8 shrink-0 rounded border border-[#e0e0e0] bg-[#f1efea] overflow-hidden flex items-center justify-center text-[10px] text-[#a0a0a0]">
                                {thumbIds.has(s.id) ? (
                                  <img src={`/.claude/.shots/thumb/${s.id}.jpg`} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                                ) : (
                                  s.componentName.slice(0, 1)
                                )}
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className={`block text-sm truncate ${active ? "text-[var(--semantic-brand-primary)]" : "text-[var(--semantic-text-primary)]"}`}>
                                  {s.title}
                                </span>
                                <span className="block text-[11px] font-normal text-[var(--semantic-text-secondary)] truncate">{s.componentName}</span>
                              </span>
                              <Badge count={counts[s.id] ?? 0} tone="edit" />
                              <Badge count={commentCounts[s.id]?.open ?? 0} tone="comment" />
                            </button>
                            {/* 実際の画面を新しいタブで開く（旧プロパティパネルの「新しいタブで開く」をここに移した） */}
                            <a
                              href={s.route}
                              target="_blank"
                              rel="noreferrer"
                              title={`この画面を新しいタブで開く\n${s.route}`}
                              aria-label={`${s.title} を新しいタブで開く`}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 size-6 rounded flex items-center justify-center text-[#9a9a9a] hover:text-[var(--semantic-brand-primary)] hover:bg-white"
                            >
                              <IconExternal width={14} height={14} />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
