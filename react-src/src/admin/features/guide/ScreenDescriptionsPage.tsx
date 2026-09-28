/**
 * ガイド › 画面説明（一覧）。
 * NQ の全画面（管理画面・アプリ）について「何をする画面か / 何ができるか」を読める入口。
 *
 * 左に帳票（グループ）の一覧、右に選んだ帳票の画面を
 * 役割（帳票管理 / 承認申請 / 確認 / データ検索 / アプリ）ごとにサムネイル付きのカードで並べる。
 * 300 画面を 1 本のリストに全部出すと見通しが悪かったので、「1 帳票ずつ見る」形にしている。
 * キーワード検索中だけは、帳票をまたいで一致した画面を全部見せる（左の一覧は件数表示 + 見出しへのジャンプになる）。
 *
 * カードを押すと、ページを移らずに中央に開く大きめのポップアップ（ScreenDescriptionDrawer）で読める。
 * 開いている画面は URL の ?screen= に持たせているので、ブラウザの戻るで閉じられる。
 * Cmd/Ctrl クリックなら今まで通り詳細ページ（/admin/guide/descriptions/:screenId）を別タブで開ける。
 * 選んでいる帳票は URL の ?group= に持たせ、詳細から戻ってきても同じ帳票が開いたままになるようにしている。
 *
 * 各画面の右下の「i」ボタンから開くスライドインパネルは別物（ScreenDescriptionPanel）だが、
 * 説明の本文は同じ src/components/screen-description/screenDescriptions.ts を使う。
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { SCREENS, groupOf, groupOrder, roleOf, roleOrder, type ScreenEntry, type ScreenGroup } from "./screenCatalog";
import { IconMonitor, IconPanelLeft, IconSearch, IconTablet } from "./CanvasIcons";
import { VERSION_CHIP_CLASS, shortTitleOf } from "../../../components/screen-description/screenDescriptionUtils";
import { describeScreenFile } from "../../../components/screen-description/screenDescriptions";
import { ScreenDescriptionDrawer } from "./ScreenDescriptionDrawer";
import { ScreenThumb } from "./screenShots";

type DeviceFilter = "all" | "pc" | "tablet";

const DEVICE_FILTERS: { key: DeviceFilter; label: string; hint: string }[] = [
  { key: "all", label: "すべて", hint: "管理画面とアプリを両方表示" },
  { key: "pc", label: "管理画面", hint: "管理画面（PC）だけ表示" },
  { key: "tablet", label: "アプリ", hint: "アプリ（タブレット）だけ表示" },
];

/** 左の一覧での帳票の並び（新しいバージョンが上）。その他の機能はこの後にまとめる */
const VERSION_ORDER = ["Ver.4.0", "Ver.3.0", "Ver.2.0", "Ver.1.5", "Ver.1.0"];

/**
 * 小見出しの表記をサイドメニューの項目名に合わせる（役割名 → メニュー名）。
 * 「帳票管理」「データ検索」はそのままなので、ここには差がある分だけ書く。
 */
const ROLE_MENU_LABEL: Record<string, string> = {
  承認申請: "承認申請管理",
  確認: "確認管理",
};

/** 見出しごとの色（左の縦線）。詳細ページのチップや画面遷移図と大きくは揃えている */
const ROLE_ACCENT: Record<string, string> = {
  帳票管理: "bg-[var(--semantic-brand-primary)]",
  承認申請管理: "bg-[#2f7fd4]",
  確認管理: "bg-[#7c4dcc]",
  データ検索: "bg-[#d97316]",
  アプリ: "bg-[#1a9e9e]",
  管理画面: "bg-[#6b6b6b]",
  共通: "bg-[#6b6b6b]",
};

type Block = { key: string; label: string; order: number; items: ScreenEntry[] };
type Section = { group: ScreenGroup; blocks: Block[]; count: number };

/** 帳票（グループ）→ 役割ごとのブロック に組み直す */
function buildSections(screens: ScreenEntry[]): Section[] {
  const map = new Map<string, { group: ScreenGroup; blocks: Map<string, Block> }>();
  for (const s of screens) {
    const group = groupOf(s);
    let bucket = map.get(group.key);
    if (!bucket) map.set(group.key, (bucket = { group, blocks: new Map() }));

    const role = roleOf(s);
    let key: string;
    let label: string;
    let order: number;
    if (s.category === "App") {
      key = "app";
      label = "アプリ";
      order = 100;
    } else if (role) {
      key = `admin:${role}`;
      label = ROLE_MENU_LABEL[role] ?? role;
      order = roleOrder(role);
    } else if (s.category === "Common") {
      key = "common";
      label = "共通";
      order = 90;
    } else {
      key = "admin";
      label = "管理画面";
      order = 50;
    }
    let block = bucket.blocks.get(key);
    if (!block) bucket.blocks.set(key, (block = { key, label, order, items: [] }));
    block.items.push(s);
  }

  const sections: Section[] = [];
  for (const { group, blocks } of map.values()) {
    const sorted = Array.from(blocks.values()).sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
    sections.push({ group, blocks: sorted, count: sorted.reduce((n, b) => n + b.items.length, 0) });
  }
  return sections.sort((a, b) => groupOrder(a.group.key) - groupOrder(b.group.key) || a.group.label.localeCompare(b.group.label));
}

function ScreenCard({
  screen,
  groupKey,
  isOpen,
  onOpen,
}: {
  screen: ScreenEntry;
  groupKey: string;
  isOpen: boolean;
  onOpen: (screenId: string) => void;
}) {
  const description = describeScreenFile(screen.filePath);
  return (
    <li className="min-w-0">
      <Link
        // 普通のクリックは右のパネルを開くだけ。Cmd/Ctrl クリックは今まで通り詳細ページを別タブで開く
        to={{ pathname: `/admin/guide/descriptions/${screen.id}`, search: `?group=${encodeURIComponent(groupKey)}` }}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          onOpen(screen.id);
        }}
        aria-label={`${screen.title} の説明を開く`}
        aria-current={isOpen ? "true" : undefined}
        title={screen.title}
        className={`group flex items-stretch rounded-lg bg-white border overflow-hidden hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-shadow ${
          isOpen
            ? "border-[var(--semantic-brand-primary)] shadow-[0_0_0_2px_rgba(0,150,85,0.18)]"
            : "border-[#e3e3e3] hover:border-[var(--semantic-brand-primary)]"
        }`}
      >
        {/* 左: サムネイル（幅固定・16:10） */}
        <div className="relative shrink-0 w-[200px] aspect-[16/10] bg-[#f3f3f3] border-r border-[#ececec] overflow-hidden">
          <ScreenThumb
            screenId={screen.id}
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#9a9a9a]">
                <span className="text-[11px]">スクリーンショットなし</span>
                <span className="text-[10px] px-3 text-center leading-tight line-clamp-2">{screen.componentName}</span>
              </div>
            }
          />
          {!description && (
            <span className="absolute top-2 left-2 h-5 px-2 rounded-full text-[11px] font-bold flex items-center bg-[#fdeaea] text-[var(--semantic-brand-danger)] shadow-sm">
              説明なし
            </span>
          )}
        </div>
        {/* 右: タイトル・説明・URL */}
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col gap-1.5">
          <span className="text-[15px] font-bold leading-snug text-[var(--semantic-text-primary)] group-hover:text-[var(--semantic-brand-primary)]">
            {shortTitleOf(screen)}
          </span>
          <span className="text-[13px] leading-relaxed text-[var(--semantic-text-secondary)] line-clamp-3">
            {description?.summary ?? "この画面の説明はまだ書かれていません"}
          </span>
        </div>
      </Link>
    </li>
  );
}

function RoleBlock({
  block,
  groupKey,
  openId,
  onOpen,
}: {
  block: Block;
  groupKey: string;
  openId: string | null;
  onOpen: (screenId: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2.5">
        <span className={`w-1 h-5 rounded-full ${ROLE_ACCENT[block.label] ?? "bg-[#6b6b6b]"}`} aria-hidden />
        <span className="text-sm font-bold text-[var(--semantic-text-primary)]">{block.label}</span>
        <span className="text-xs text-[var(--semantic-text-secondary)]">{block.items.length} 画面</span>
      </h3>
      <ul className="flex flex-col gap-3 max-w-[880px]">
        {block.items.map((s) => (
          <ScreenCard
            key={s.id}
            screen={s}
            groupKey={groupKey}
            isOpen={s.id === openId}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </section>
  );
}

function GroupHeading({ group, count, total }: { group: ScreenGroup; count: number; total: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3 flex-wrap">
        {group.version && (
          <span className={`h-6 px-2.5 rounded-full text-xs font-bold flex items-center ${VERSION_CHIP_CLASS[group.version] ?? ""}`}>{group.version}</span>
        )}
        <h2 className="text-xl font-bold text-[var(--semantic-text-primary)]">{group.label}</h2>
        <span className="text-sm text-[var(--semantic-text-secondary)]">
          {count === total ? `${total} 画面` : `${count} / ${total} 画面`}
        </span>
      </div>
      {/* 帳票の説明（screenCatalog の LEDGER_GROUPS）。個々の画面ではなく「この帳票は何を記録するものか」 */}
      {group.description && (
        <p className="max-w-[880px] text-sm leading-relaxed text-[var(--semantic-text-primary)]">{group.description}</p>
      )}
    </div>
  );
}

export function ScreenDescriptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [device, setDevice] = useState<DeviceFilter>("all");
  const [missingOnly, setMissingOnly] = useState(false);
  /** 左の帳票一覧を開いているか。狭い画面でカードを広く見たいときに閉じられる */
  const [navOpen, setNavOpen] = useState(true);
  const missingCount = useMemo(() => SCREENS.filter((s) => !describeScreenFile(s.filePath)).length, []);

  /** 絞り込み前の全体（左の一覧の「全 N 画面」の分母に使う） */
  const allSections = useMemo(() => buildSections(SCREENS), []);
  const totalByGroup = useMemo(() => new Map(allSections.map((s) => [s.group.key, s.count])), [allSections]);

  const searching = keyword.trim().length > 0;

  const filtered = useMemo(() => {
    const terms = keyword.toLowerCase().split(/[\s　]+/).filter(Boolean);
    return SCREENS.filter((s) => {
      if (device === "pc" && s.category !== "Admin") return false;
      if (device === "tablet" && s.category !== "App") return false;
      const description = describeScreenFile(s.filePath);
      if (missingOnly && description) return false;
      if (terms.length === 0) return true;
      const haystack = [
        s.title,
        s.componentName,
        s.route,
        s.filePath,
        groupOf(s).label,
        description?.summary ?? "",
        ...(description?.points ?? []),
        description?.note ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [keyword, device, missingOnly]);

  const sections = useMemo(() => buildSections(filtered), [filtered]);
  const countByGroup = useMemo(() => new Map(sections.map((s) => [s.group.key, s.count])), [sections]);

  // 選択中の帳票。URL の ?group= を使い、絞り込みで消えてしまったら先頭の帳票に寄せる
  const requested = searchParams.get("group");
  const activeKey = sections.some((s) => s.group.key === requested) ? requested : sections[0]?.group.key ?? null;
  const active = sections.find((s) => s.group.key === activeKey) ?? null;

  const selectGroup = (key: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("group", key);
      return next;
    }, { replace: true });
    if (searching) document.getElementById(`desc-group-${key}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  // 中央に開くポップアップ。開いている画面は ?screen= に持たせる（戻るで閉じられる）
  const openScreen = SCREENS.find((s) => s.id === searchParams.get("screen")) ?? null;

  const openDrawer = (screenId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("screen", screenId);
      return next;
    });
  };

  const closeDrawer = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("screen");
      return next;
    }, { replace: true });
  };

  // 左の一覧: 帳票をバージョンごとにまとめ、その後に「その他の機能」
  const navGroups = useMemo(() => {
    const ledgers = VERSION_ORDER.map((v) => ({
      key: v,
      label: v,
      version: v as string | undefined,
      items: allSections.filter((s) => s.group.kind === "ledger" && s.group.version === v).map((s) => s.group),
    })).filter((g) => g.items.length > 0);
    const others = allSections.filter((s) => s.group.kind === "other").map((s) => s.group);
    return others.length ? [...ledgers, { key: "other", label: "その他の機能", version: undefined, items: others }] : ledgers;
  }, [allSections]);

  // 上のチップで選ばれているバージョン。選択中の帳票から決まるので、
  // 詳細から ?group= 付きで戻ってきてもそのバージョンが開いた状態になる
  const activeNavKey =
    (active ? (active.group.kind === "ledger" ? active.group.version ?? "other" : "other") : null) ?? navGroups[0]?.key ?? null;
  const activeNav = navGroups.find((ng) => ng.key === activeNavKey) ?? navGroups[0] ?? null;

  /** バージョンのチップを押したら、そのバージョンの先頭の帳票に切り替える */
  const selectVersion = (key: string) => {
    const nav = navGroups.find((ng) => ng.key === key);
    const first = nav?.items.find((g) => (countByGroup.get(g.key) ?? 0) > 0) ?? nav?.items[0];
    if (first) selectGroup(first.key);
  };

  return (
    <div className="min-h-full flex flex-col">
      <PageTitleBar
        title="画面説明"
        action={
          <div className="flex items-center gap-2 text-sm text-[var(--semantic-text-secondary)]">
            <span>全 {SCREENS.length} 画面</span>
            <span aria-hidden>・</span>
            <span>説明あり {SCREENS.length - missingCount}</span>
            {missingCount > 0 && (
              <>
                <span aria-hidden>・</span>
                <span className="text-[var(--semantic-brand-danger)] font-bold">説明なし {missingCount}</span>
              </>
            )}
          </div>
        }
      />

      {/* ツールバー（画面遷移図と同じ並び・見た目） */}
      <div className="sticky top-0 z-10 shrink-0 flex flex-wrap items-center gap-3 px-6 py-3 bg-white border-b border-[#e5e5e5]">
        <div role="group" aria-label="表示する種類" className="flex rounded-lg border border-[#d0d0d0] overflow-hidden">
          {DEVICE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={device === f.key}
              title={f.hint}
              onClick={() => setDevice(f.key)}
              className={`px-3 h-9 text-[13px] flex items-center gap-1.5 ${
                device === f.key ? "bg-[var(--semantic-brand-primary)] text-white" : "bg-white text-[var(--semantic-text-primary)] hover:bg-[#f3f3f3]"
              }`}
            >
              {f.key === "pc" ? <IconMonitor width={15} height={15} /> : f.key === "tablet" ? <IconTablet width={15} height={15} /> : null}
              {f.label}
            </button>
          ))}
        </div>

        {/* バージョンのチップ。押すとそのバージョンの帳票だけが左に並ぶ */}
        <div role="group" aria-label="バージョン" className="flex items-center gap-1">
          {navGroups.map((ng) => {
            const count = ng.items.reduce((n, g) => n + (countByGroup.get(g.key) ?? 0), 0);
            const isActive = ng.key === activeNavKey;
            const disabled = count === 0;
            const tone = ng.version
              ? VERSION_CHIP_CLASS[ng.version] ?? "bg-[#f0f0f0] text-[var(--semantic-text-primary)]"
              : "bg-[#f0f0f0] text-[var(--semantic-text-primary)]";
            return (
              <button
                key={ng.key}
                type="button"
                disabled={disabled}
                aria-pressed={isActive}
                title={`${ng.label}（${ng.items.length} 帳票 / ${count} 画面）`}
                onClick={() => selectVersion(ng.key)}
                className={`px-2 h-7 rounded-full text-[11px] font-bold border ${tone} ${
                  disabled ? "border-transparent opacity-30 cursor-default" : isActive ? "border-current" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {ng.label}
              </button>
            );
          })}
        </div>

        <label className="ml-auto flex items-center gap-2 h-9 px-3 rounded-lg border border-[#d0d0d0] bg-white min-w-[240px]">
          <IconSearch width={15} height={15} className="text-[#808080]" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="画面名・説明・URL で探す"
            aria-label="画面を検索"
            className="flex-1 text-[13px] outline-none placeholder:text-[#a0a0a0]"
          />
          {searching ? <span className="text-[11px] text-[var(--semantic-text-secondary)]">{filtered.length} 件</span> : null}
        </label>

        {missingCount > 0 && (
          <button
            type="button"
            aria-pressed={missingOnly}
            onClick={() => setMissingOnly((v) => !v)}
            className={`h-9 px-3 rounded-lg text-[13px] border flex items-center gap-1 ${
              missingOnly
                ? "border-[var(--semantic-brand-danger)] bg-[#fdeaea] text-[var(--semantic-brand-danger)]"
                : "border-[#d0d0d0] bg-white text-[var(--semantic-text-primary)] hover:bg-[#f3f3f3]"
            }`}
          >
            説明なしだけ
            <span className="font-normal">{missingCount}</span>
          </button>
        )}
      </div>

      <div className={`flex-1 grid items-start ${navOpen ? "grid-cols-[232px_minmax(0,1fr)]" : "grid-cols-[44px_minmax(0,1fr)]"}`}>
        {/* 左: 帳票の一覧（閉じると開くボタンだけの細い帯になる） */}
        <nav
          aria-label="帳票"
          className={`sticky top-[61px] self-start max-h-[calc(100vh-61px)] overflow-x-hidden py-3 flex flex-col gap-2 border-r border-[#e6e6e6] ${
            navOpen ? "px-3 overflow-y-auto" : "px-1.5 overflow-y-hidden"
          }`}
        >
          <button
            type="button"
            aria-expanded={navOpen}
            aria-label={navOpen ? "帳票の一覧を閉じる" : "帳票の一覧を開く"}
            title={navOpen ? "帳票の一覧を閉じる" : "帳票の一覧を開く"}
            onClick={() => setNavOpen((v) => !v)}
            className={`h-8 w-8 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#ececec] hover:text-[var(--semantic-text-primary)] ${
              navOpen ? "self-end" : "self-center"
            }`}
          >
            <IconPanelLeft width={16} height={16} />
          </button>

          {/* 選んでいるバージョンの帳票 */}
          <div hidden={!navOpen} className="flex flex-col gap-0.5">
            {(activeNav?.items ?? []).map((g) => {
              const count = countByGroup.get(g.key) ?? 0;
              const total = totalByGroup.get(g.key) ?? 0;
              const isActive = !searching && g.key === activeKey;
              const disabled = count === 0;
              return (
                <button
                  key={g.key}
                  type="button"
                  disabled={disabled}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => selectGroup(g.key)}
                  className={`h-9 px-3 rounded-md flex items-center gap-2 text-left text-sm ${
                    isActive
                      ? "bg-[var(--semantic-brand-primary)] text-white font-bold"
                      : disabled
                        ? "text-[#b5b5b5] cursor-default"
                        : "text-[var(--semantic-text-primary)] hover:bg-[#ececec]"
                  }`}
                >
                  <span className="flex-1 min-w-0 truncate">{g.label}</span>
                  <span className={`shrink-0 text-xs tabular-nums ${isActive ? "text-white/85" : "text-[var(--semantic-text-secondary)]"}`}>
                    {count === total ? total : `${count}/${total}`}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* 右: 選んだ帳票の画面（検索中は一致した帳票をすべて） */}
        <div className="px-6 py-5 flex flex-col gap-10">
          {sections.length === 0 && (
            <p className="py-24 text-center text-sm text-[var(--semantic-text-secondary)]">該当する画面がありません</p>
          )}

          {(searching ? sections : active ? [active] : []).map(({ group, blocks, count }) => (
            <section key={group.key} id={`desc-group-${group.key}`} className="flex flex-col gap-5 scroll-mt-20">
              <GroupHeading group={group} count={count} total={totalByGroup.get(group.key) ?? count} />
              {blocks.map((block) => (
                <RoleBlock
                  key={block.key}
                  block={block}
                  groupKey={group.key}
                  openId={openScreen?.id ?? null}
                  onOpen={openDrawer}
                />
              ))}
            </section>
          ))}
        </div>
      </div>

      {openScreen && <ScreenDescriptionDrawer screen={openScreen} onSelect={openDrawer} onClose={closeDrawer} />}
    </div>
  );
}
