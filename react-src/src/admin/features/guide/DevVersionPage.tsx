/**
 * 開発 Ver 管理。
 * デザイン先行で進めている開発を「Ver ごとに何を作ったか」で見返せるページ。
 * 左に Ver の一覧（新しいものが上）、右に選んだ Ver の詳細を出す。
 *
 * - Ver の記録（期間・ねらい・出来事）は devVersions.ts に書く
 * - その Ver で追加された帳票と画面数は screenCatalog.ts から自動集計する
 * - メモだけはこの端末の localStorage に保存する（プロトタイプなので他の人には共有されない）
 *   書いたメモは「記録」と同じように日時つきで一覧表示し、あとから直したり消したりできる
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { CATEGORY_LABELS, SCREENS, groupOf, groupOrder } from "./screenCatalog";
import {
  CURRENT_DEV_VERSION,
  DEV_VERSIONS,
  DEV_VERSION_CHIP_CLASS,
  DEV_VERSION_DOT_CLASS,
  DEV_VERSION_STATUS_LABEL,
  type DevVersion,
} from "./devVersions";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

/** 旧形式（1 Ver につきテキスト 1 本）。読み込み時だけ見て、新形式へ移し替える */
const LS_MEMO_PREFIX = "nq_dev_version_memo:";
/** 新形式。1 Ver につきメモの配列（新しいものが先頭） */
const LS_MEMOS_PREFIX = "nq_dev_version_memos:";

type DevVersionMemo = {
  id: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

type LedgerStat = { key: string; label: string; total: number; admin: number; app: number };

/** Ver ごとに「追加された帳票」と画面数を集計する（帳票以外の機能は数えない） */
function buildLedgerStats(): Map<string, LedgerStat[]> {
  const byVersion = new Map<string, Map<string, LedgerStat>>();
  for (const s of SCREENS) {
    const g = groupOf(s);
    if (g.kind !== "ledger" || !g.version) continue;
    let ledgers = byVersion.get(g.version);
    if (!ledgers) byVersion.set(g.version, (ledgers = new Map()));
    let stat = ledgers.get(g.key);
    if (!stat) ledgers.set(g.key, (stat = { key: g.key, label: g.label, total: 0, admin: 0, app: 0 }));
    stat.total += 1;
    if (s.category === "Admin") stat.admin += 1;
    else if (s.category === "App") stat.app += 1;
  }
  const result = new Map<string, LedgerStat[]>();
  for (const [version, ledgers] of byVersion) {
    result.set(
      version,
      [...ledgers.values()].sort((a, b) => groupOrder(a.key) - groupOrder(b.key))
    );
  }
  return result;
}

/** "2026-09-15" → "2026/09/15"、"2026-02" のように月までなら "2026/02" */
function formatDate(iso: string): string {
  return iso.split("-").join("/");
}

function formatPeriod(period: DevVersion["period"]): string | null {
  if (!period || (!period.start && !period.end)) return null;
  return `${period.start ? formatDate(period.start) : ""} 〜 ${period.end ? formatDate(period.end) : ""}`;
}

const STATUS_BADGE_CLASS: Record<DevVersion["status"], string> = {
  designing: "bg-[var(--semantic-brand-primary)] text-white",
  developing: "bg-[#2f7fd4] text-white",
  released: "bg-[#ececec] text-[var(--semantic-text-secondary)]",
  planned: "bg-white border border-[#c8c8c8] text-[var(--semantic-text-secondary)]",
};

/** 「2026/09/17 13:05」 */
function formatMemoTime(at: number): string {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function newMemoId(): string {
  return `memo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function readMemos(version: string): DevVersionMemo[] {
  try {
    const raw = localStorage.getItem(LS_MEMOS_PREFIX + version);
    if (raw) {
      const list = JSON.parse(raw) as DevVersionMemo[];
      return Array.isArray(list) ? list : [];
    }
    // 旧形式のメモが残っていれば 1 件として引き継ぐ
    const legacy = localStorage.getItem(LS_MEMO_PREFIX + version);
    if (legacy) {
      const at = Date.now();
      const migrated = [{ id: newMemoId(), body: legacy, createdAt: at, updatedAt: at }];
      writeMemos(version, migrated);
      localStorage.removeItem(LS_MEMO_PREFIX + version);
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

function writeMemos(version: string, memos: DevVersionMemo[]) {
  try {
    if (memos.length) localStorage.setItem(LS_MEMOS_PREFIX + version, JSON.stringify(memos));
    else localStorage.removeItem(LS_MEMOS_PREFIX + version);
  } catch {
    /* 容量超過などは無視（画面上の表示は続けられる） */
  }
}

function StatusBadge({ status }: { status: DevVersion["status"] }) {
  const active = status === "designing" || status === "developing";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[11px] font-bold ${STATUS_BADGE_CLASS[status]}`}>
      {active ? <span className="inline-block size-1.5 rounded-full bg-white animate-pulse" /> : null}
      {DEV_VERSION_STATUS_LABEL[status]}
    </span>
  );
}

function VersionChip({ version, large }: { version: string; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${
        large ? "px-3 h-8 text-[15px]" : "px-2 h-6 text-[12px]"
      } ${DEV_VERSION_CHIP_CLASS[version] ?? "bg-[#ececec] text-[var(--semantic-text-secondary)]"}`}
    >
      <span className={`inline-block size-2 rounded-full ${DEV_VERSION_DOT_CLASS[version] ?? "bg-[#c8c8c8]"}`} />
      {version}
    </span>
  );
}

/** 左の Ver 一覧の 1 行 */
function VersionListItem({
  item,
  ledgerCount,
  memoCount,
  selected,
  onSelect,
}: {
  item: DevVersion;
  ledgerCount: number;
  memoCount: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-lg border px-4 py-3 flex flex-col gap-2 transition-colors ${
        selected
          ? "bg-white border-[var(--semantic-brand-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          : "bg-white/70 border-[#dcdcdc] hover:bg-white hover:border-[#bdbdbd]"
      }`}
    >
      <div className="flex items-center gap-2">
        <VersionChip version={item.version} />
        <StatusBadge status={item.status} />
      </div>
      <p className="text-[12px] leading-[1.5] text-[var(--semantic-text-secondary)] line-clamp-2">{item.summary}</p>
      <div className="flex items-center gap-3 text-[11px] text-[var(--semantic-text-secondary)] tabular-nums">
        <span>帳票 {ledgerCount} 件</span>
        <span>記録 {item.changes.length} 件</span>
        {memoCount > 0 ? <span className="text-[var(--semantic-brand-primary)]">メモ {memoCount} 件</span> : null}
        {item.releasedAt ? (
          <span className="ml-auto">リリース {formatDate(item.releasedAt)}</span>
        ) : item.period?.start ? (
          <span className="ml-auto">{formatDate(item.period.start)} 〜</span>
        ) : null}
      </div>
    </button>
  );
}

function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <h2 className="text-[16px] font-bold text-[var(--semantic-text-primary)]">{children}</h2>
      {hint ? <span className="text-[11px] text-[var(--semantic-text-secondary)]">{hint}</span> : null}
    </div>
  );
}

export function DevVersionPage() {
  const ledgerStats = useMemo(buildLedgerStats, []);
  const [selectedVersion, setSelectedVersion] = useState(CURRENT_DEV_VERSION.version);
  const selected = DEV_VERSIONS.find((v) => v.version === selectedVersion) ?? DEV_VERSIONS[0];
  const ledgers = ledgerStats.get(selected.version) ?? [];
  const screenTotal = ledgers.reduce((sum, l) => sum + l.total, 0);

  const [memos, setMemos] = useState<DevVersionMemo[]>(() => readMemos(selected.version));
  /** 左の一覧に「メモ n 件」を出すための Ver ごとの件数 */
  const [memoCounts, setMemoCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(DEV_VERSIONS.map((v) => [v.version, readMemos(v.version).length]))
  );
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");

  useEffect(() => {
    setMemos(readMemos(selected.version));
    setDraft("");
    setEditingId(null);
  }, [selected.version]);

  const applyMemos = (next: DevVersionMemo[]) => {
    writeMemos(selected.version, next);
    setMemos(next);
    setMemoCounts((prev) => ({ ...prev, [selected.version]: next.length }));
  };

  const addMemo = () => {
    const body = draft.trim();
    if (!body) return;
    const at = Date.now();
    applyMemos([{ id: newMemoId(), body, createdAt: at, updatedAt: at }, ...memos]);
    setDraft("");
  };

  const saveEdit = () => {
    const body = editingBody.trim();
    if (!editingId || !body) return;
    applyMemos(memos.map((m) => (m.id === editingId ? { ...m, body, updatedAt: Date.now() } : m)));
    setEditingId(null);
  };

  const removeMemo = (id: string) => {
    if (!window.confirm("このメモを削除しますか？")) return;
    applyMemos(memos.filter((m) => m.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <PageTitleBar
        title="開発Ver管理"
        action={
          <span className="flex items-center gap-2 text-sm font-normal text-[var(--semantic-text-secondary)]">
            現在の開発
            <VersionChip version={CURRENT_DEV_VERSION.version} />
            <StatusBadge status={CURRENT_DEV_VERSION.status} />
          </span>
        }
      />

      <div className="flex-1 min-h-0 overflow-auto bg-[#f4f4f4]">
        <div className="px-6 pt-4 pb-10 flex flex-col gap-4">
          <p className="text-[11px] text-[var(--semantic-text-secondary)]">
            デザインを先行して作り、そのあと実装する進め方をしています。Ver ごとに「何を作ったか」をここへ残し、あとから見返せるようにします。
            帳票と画面数は画面一覧から自動で集計しています。Ver.3.0 以前の記録は Confluence の概要・スケジュール・リリース記録から起こしたものです。
            バージョン番号は、帳票を追加するメジャーアップデートで整数部分を上げ、マイナー修正は 1.x.x の部分を更新します。
          </p>

          <div className="flex items-start gap-6">
            {/* 左: Ver 一覧 */}
            <aside className="w-[300px] shrink-0 flex flex-col gap-2">
              {DEV_VERSIONS.map((item) => (
                <VersionListItem
                  key={item.version}
                  item={item}
                  ledgerCount={ledgerStats.get(item.version)?.length ?? 0}
                  memoCount={memoCounts[item.version] ?? 0}
                  selected={item.version === selected.version}
                  onSelect={() => setSelectedVersion(item.version)}
                />
              ))}
            </aside>

            {/* 右: 選んだ Ver の詳細 */}
            <main className="flex-1 min-w-0 flex flex-col gap-6">
              <section className="bg-white rounded-lg border border-[#dcdcdc] p-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <VersionChip version={selected.version} large />
                  <StatusBadge status={selected.status} />
                  {formatPeriod(selected.period) ? (
                    <span className="text-[13px] text-[var(--semantic-text-secondary)] tabular-nums">{formatPeriod(selected.period)}</span>
                  ) : null}
                  {selected.releasedAt ? (
                    <span className="text-[13px] text-[var(--semantic-text-secondary)] tabular-nums">リリース {formatDate(selected.releasedAt)}</span>
                  ) : null}
                </div>
                <p className="text-[14px] leading-[1.7] text-[var(--semantic-text-primary)]">{selected.summary}</p>
                <dl className="grid grid-cols-4 gap-3">
                  {[
                    { label: "追加した帳票", value: `${ledgers.length} 件` },
                    { label: "その画面数", value: `${screenTotal} 画面` },
                    { label: "記録", value: `${selected.changes.length} 件` },
                    { label: "メモ", value: `${memos.length} 件` },
                  ].map((cell) => (
                    <div key={cell.label} className="rounded-md bg-[#f7f7f7] px-4 py-3">
                      <dt className="text-[11px] text-[var(--semantic-text-secondary)]">{cell.label}</dt>
                      <dd className="text-[20px] font-bold tabular-nums text-[var(--semantic-text-primary)]">{cell.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="bg-white rounded-lg border border-[#dcdcdc] p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <SectionTitle hint="画面一覧から自動集計">この Ver で追加した帳票</SectionTitle>
                  <Link to="/admin/guide/flow" className="text-[12px] text-[var(--semantic-brand-primary)] underline underline-offset-2">
                    画面遷移図で見る
                  </Link>
                </div>
                {ledgers.length === 0 ? (
                  <p className="text-[13px] text-[var(--semantic-text-secondary)]">帳票の追加はありません</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-[#ececec]">
                    {ledgers.map((l) => (
                      <li key={l.key} className="flex items-center gap-3 py-2.5">
                        <span className={`inline-block size-2 rounded-full ${DEV_VERSION_DOT_CLASS[selected.version] ?? "bg-[#c8c8c8]"}`} />
                        <span className="text-[14px] font-bold text-[var(--semantic-text-primary)]">{l.label}</span>
                        <span className="ml-auto text-[12px] text-[var(--semantic-text-secondary)] tabular-nums">
                          {l.total} 画面（{CATEGORY_LABELS.Admin} {l.admin} / {CATEGORY_LABELS.App} {l.app}）
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bg-white rounded-lg border border-[#dcdcdc] p-6 flex flex-col gap-4">
                <SectionTitle hint="新しいものが上">記録</SectionTitle>
                {selected.changes.length === 0 ? (
                  <p className="text-[13px] text-[var(--semantic-text-secondary)]">
                    この Ver の記録はまだありません。開発中に起きたことを devVersions.ts に追記すると、ここに表示されます。
                  </p>
                ) : (
                  <ol className="relative flex flex-col gap-4 pl-5 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-[#dcdcdc]">
                    {selected.changes.map((c, i) => (
                      <li key={`${c.date ?? ""}-${i}`} className="relative flex flex-col gap-0.5">
                        <span
                          className={`absolute -left-5 top-[5px] size-[11px] rounded-full border-2 border-white ${
                            DEV_VERSION_DOT_CLASS[selected.version] ?? "bg-[#c8c8c8]"
                          }`}
                        />
                        <div className="flex items-baseline gap-3">
                          <span className="text-[12px] text-[var(--semantic-text-secondary)] tabular-nums shrink-0">
                            {c.date ? formatDate(c.date) : "日付なし"}
                          </span>
                          <span className="text-[14px] font-bold text-[var(--semantic-text-primary)]">{c.title}</span>
                        </div>
                        {c.detail ? <p className="text-[13px] leading-[1.6] text-[var(--semantic-text-secondary)] pl-[calc(10ch+12px)]">{c.detail}</p> : null}
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="bg-white rounded-lg border border-[#dcdcdc] p-6 flex flex-col gap-4">
                <SectionTitle hint="この端末だけに保存されます">
                  {memos.length ? `メモ（${memos.length} 件）` : "メモ"}
                </SectionTitle>
                {/* 書いたメモが先、書くところは下 */}
                {memos.length === 0 ? (
                  <p className="text-[13px] text-[var(--semantic-text-secondary)]">
                    この Ver のメモはまだありません。下に書いて保存すると、ここに新しいものから順に並びます。
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {memos.map((m) => (
                      <li key={m.id} className="rounded-md border border-[#e4e4e4] bg-[#fafafa] px-4 py-3 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-[var(--semantic-text-secondary)] tabular-nums">
                            {formatMemoTime(m.createdAt)}
                            {m.updatedAt !== m.createdAt ? `（${formatMemoTime(m.updatedAt)} 編集）` : ""}
                          </span>
                          <span className="ml-auto flex items-center gap-1">
                            {editingId === m.id ? null : (
                              <button
                                type="button"
                                title="編集"
                                aria-label="編集"
                                onClick={() => {
                                  setEditingId(m.id);
                                  setEditingBody(m.body);
                                }}
                                className="shrink-0 size-7 rounded-md flex items-center justify-center hover:bg-[#ececec]"
                              >
                                <img src={iconEdit} alt="" className="size-[18px]" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="削除"
                              aria-label="削除"
                              onClick={() => removeMemo(m.id)}
                              className="shrink-0 size-7 rounded-md flex items-center justify-center hover:bg-[#ececec]"
                            >
                              <img src={iconTrash} alt="" className="size-[18px]" />
                            </button>
                          </span>
                        </div>
                        {editingId === m.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={editingBody}
                              onChange={(e) => setEditingBody(e.target.value)}
                              rows={4}
                              className="w-full rounded-md border border-[#d0d0d0] bg-white px-3 py-2 text-[13px] leading-[1.6] outline-none focus:border-[var(--semantic-brand-primary)] resize-y"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={saveEdit}
                                disabled={!editingBody.trim()}
                                className="h-8 px-3 rounded-lg bg-[var(--semantic-brand-primary)] text-white text-[12px] font-bold disabled:opacity-40"
                              >
                                更新
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="h-8 px-3 rounded-lg border border-[#c8c8c8] bg-white text-[12px] font-bold text-[var(--semantic-text-secondary)]"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[13px] leading-[1.7] text-[var(--semantic-text-primary)] whitespace-pre-wrap break-words">
                            {m.body}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col gap-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    placeholder="気になっていること、次にやること、デザインとの差分など"
                    className="w-full rounded-md border border-[#d0d0d0] px-3 py-2 text-[13px] leading-[1.6] outline-none focus:border-[var(--semantic-brand-primary)] resize-y"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={addMemo}
                      disabled={!draft.trim()}
                      className="h-9 px-4 rounded-lg bg-[var(--semantic-brand-primary)] text-white text-[13px] font-bold disabled:opacity-40"
                    >
                      保存
                    </button>
                    <span className="text-[11px] text-[var(--semantic-text-secondary)]">
                      保存すると上に日時つきで残ります
                    </span>
                  </div>
                </div>
              </section>

              {selected.links?.length ? (
                <section className="bg-white rounded-lg border border-[#dcdcdc] p-6 flex flex-col gap-3">
                  <SectionTitle hint="Confluence（別タブで開きます）">参考</SectionTitle>
                  <ul className="flex flex-col gap-1.5">
                    {selected.links.map((l) => (
                      <li key={l.url}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[13px] text-[var(--semantic-brand-primary)] underline underline-offset-2 break-all"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
