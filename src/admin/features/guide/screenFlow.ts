/**
 * 画面遷移図のデータ作り。
 *
 * 「どのボタンを押すとどこへ行くか」は、各画面のソースにある navigate() / <Link to> から
 * Vite プラグイン（vite-plugins/screenFlowEdges.ts）が抜き出したもの（virtual:screen-flow-edges）を使う。
 * どこからも遷移してこない画面だけは、URL の親子関係（A の URL が B の URL の前方一致）で親に繋ぐ。
 *
 * 遷移は循環する（一覧 → 詳細 → 一覧…）ので、一覧側を根にした深さ優先探索で
 * 「戻る向き」の遷移（back）を切り分け、残りの向きだけで列（depth）を決める。
 */
import codeEdges from "virtual:screen-flow-edges";
import { groupOf, groupOrder, roleOf, type ScreenEntry, type ScreenGroup } from "./screenCatalog";
import { flattenNavPaths, primaryNav } from "../../navigation";
import { ledgerCategories } from "../../../data/ledgers";

/** 画面の役割（一覧・詳細・編集…）。ノードの色分けとセクション見出しに使う */
export type FlowRole =
  | "list"
  | "detail"
  | "edit"
  | "new"
  | "confirm"
  | "complete"
  | "delete-confirm"
  | "delete-complete"
  | "approve"
  | "calendar"
  | "settings"
  | "login"
  | "other";

export const FLOW_ROLE_LABEL: Record<FlowRole, string> = {
  list: "一覧",
  detail: "詳細",
  edit: "編集",
  new: "新規",
  confirm: "確認",
  complete: "完了",
  "delete-confirm": "削除確認",
  "delete-complete": "削除完了",
  approve: "承認",
  calendar: "カレンダー",
  settings: "設定",
  login: "ログイン",
  other: "その他",
};

/** 役割チップの色（Tailwind クラス） */
export const FLOW_ROLE_CLASS: Record<FlowRole, string> = {
  list: "bg-[#e7f1fe] text-[#2f7fd4]",
  detail: "bg-[#eeeeee] text-[#555555]",
  edit: "bg-[#fdefe0] text-[#d97316]",
  new: "bg-[#e6f4ec] text-[var(--semantic-brand-primary)]",
  confirm: "bg-[#f1ebfd] text-[#7c4dcc]",
  complete: "bg-[#e0f5f3] text-[#1f8f83]",
  "delete-confirm": "bg-[#fdeaea] text-[var(--semantic-brand-danger)]",
  "delete-complete": "bg-[#fdeaea] text-[var(--semantic-brand-danger)]",
  approve: "bg-[#e6f4ec] text-[var(--semantic-brand-primary)]",
  calendar: "bg-[#eef2f7] text-[#4a6076]",
  settings: "bg-[#eef2f7] text-[#4a6076]",
  login: "bg-[#eef2f7] text-[#4a6076]",
  other: "bg-[#f3f3f3] text-[#808080]",
};

export function flowRoleOf(screen: ScreenEntry): FlowRole {
  const t = `${screen.title} ${screen.componentName}`;
  if (/削除.*完了|Delete.*Complete/i.test(t)) return "delete-complete";
  if (/削除.*確認|Delete.*Confirm/i.test(t)) return "delete-confirm";
  if (/完了|Complete/i.test(t)) return "complete";
  if (/ログイン|ログアウト|Login|Logout/i.test(t)) return "login";
  if (/承認|レビュー|Review|Approv/i.test(t)) return "approve";
  if (/確認|Confirm/i.test(t)) return "confirm";
  if (/編集|Edit/i.test(t)) return "edit";
  if (/新規|登録|New|Registration|Form/i.test(t)) return "new";
  if (/詳細|Detail/i.test(t)) return "detail";
  if (/カレンダー|予定|スケジュール|Calendar|Schedule/i.test(t)) return "calendar";
  if (/設定|Settings?/i.test(t)) return "settings";
  if (/一覧|選択|List|Selection|管理|Management/i.test(t)) return "list";
  return "other";
}

export type FlowNode = {
  screen: ScreenEntry;
  role: FlowRole;
  /** 親子判定に使うルート定義（:param 付き） */
  route: string;
  /** セクション内で表示する短い名前（帳票名の接頭辞を落としたもの） */
  shortTitle: string;
  /** レイアウト用の木の子（遷移のうち、列を決めるのに使った 1 本） */
  children: FlowNode[];
  /** 列（根からの最長距離） */
  depth: number;
  /** 行（枝分かれの縦位置）。0 始まりに正規化済み */
  row: number;
};

/** 遷移の出どころ。code = ソースの navigate/Link から、route = URL の親子関係からの推定 */
export type FlowEdgeKind = "code" | "route";

export type FlowEdge = {
  from: FlowNode;
  to: FlowNode;
  kind: FlowEdgeKind;
  /** 戻る向き（列が同じか左へ向かう遷移。完了 → 一覧 など） */
  back: boolean;
  /** レイアウトの木として使った遷移 */
  tree: boolean;
};

/** 1 つの遷移ツリー（管理画面の帳票管理 / 承認申請 / 確認 / データ検索、アプリ、など） */
export type FlowModule = {
  key: string;
  label: string;
  /** 「一覧 → 詳細 → 編集」のような骨格の説明 */
  signature: string;
  category: ScreenEntry["category"];
  nodes: FlowNode[];
  roots: FlowNode[];
  /** 画面同士の遷移（back を含む） */
  edges: FlowEdge[];
  /** 列数・行数（レイアウト用） */
  cols: number;
  rows: number;
};

export type FlowSection = {
  group: ScreenGroup;
  modules: FlowModule[];
  count: number;
  adminCount: number;
  appCount: number;
};

const segCount = (r: string) => r.split("/").filter(Boolean).length;

function shortTitleOf(screen: ScreenEntry, group: ScreenGroup): string {
  if (group.kind === "ledger" && screen.title.startsWith(`${group.label}_`)) {
    return screen.title.slice(group.label.length + 1);
  }
  return screen.title;
}

// グルーピングの骨格として数える役割（確認/完了のような末端の状態違いでは分けない）
const CORE_ROLES: FlowRole[] = ["login", "list", "detail", "new", "edit", "approve", "calendar", "settings"];

function signatureOf(nodes: FlowNode[]): string {
  const roles = new Set(nodes.map((n) => n.role));
  const core = CORE_ROLES.filter((r) => roles.has(r));
  return core.length ? core.map((r) => FLOW_ROLE_LABEL[r]).join(" → ") : FLOW_ROLE_LABEL.other;
}

/** 画面ファイル → コード上の遷移先ファイル */
const CODE_TARGETS = new Map<string, Set<string>>();
for (const e of codeEdges) {
  let set = CODE_TARGETS.get(e.from);
  if (!set) CODE_TARGETS.set(e.from, (set = new Set()));
  set.add(e.to);
}

/** 根（入口）に選びやすい役割の順。一覧・ログイン・カレンダーが先 */
const ROOT_ROLE_PRIORITY: FlowRole[] = ["login", "list", "calendar", "settings", "detail", "new", "edit", "approve", "confirm", "other", "complete", "delete-confirm", "delete-complete"];
/** 同じ親から枝分かれした子の並び。一覧・詳細を上、完了系を下に */
const CHILD_ROLE_PRIORITY: FlowRole[] = ["list", "detail", "calendar", "settings", "approve", "new", "edit", "confirm", "complete", "delete-confirm", "delete-complete", "login", "other"];

const rolePriority = (order: FlowRole[], role: FlowRole) => {
  const i = order.indexOf(role);
  return i === -1 ? order.length : i;
};

/**
 * 同じモジュールの画面から遷移グラフを作り、列・行を決める。
 * 1. ソースから抜き出した遷移（code）を張る
 * 2. どこからも遷移してこない画面は URL の親（route）に繋ぐ
 * 3. 入ってくる遷移が無い画面を根にして深さ優先探索し、探索中の画面へ戻る遷移を back にする
 * 4. back 以外の遷移で「根からの最長距離」を列にし、列を決めた 1 本を木の親として行を割り当てる
 */
export function buildFlowModule(
  key: string,
  label: string,
  category: ScreenEntry["category"],
  items: ScreenEntry[],
  group: ScreenGroup
): FlowModule {
  const nodes: FlowNode[] = items.map((s) => ({
    screen: s,
    role: flowRoleOf(s),
    route: s.routes[0] ?? "",
    shortTitle: shortTitleOf(s, group),
    children: [],
    depth: 0,
    row: 0,
  }));
  const byFile = new Map(nodes.map((n) => [n.screen.filePath, n] as const));

  // 1. コード上の遷移
  const edges: FlowEdge[] = [];
  const edgeKeys = new Set<string>();
  const addEdge = (from: FlowNode, to: FlowNode, kind: FlowEdgeKind) => {
    if (from === to) return;
    const k = `${from.screen.id}>${to.screen.id}`;
    if (edgeKeys.has(k)) return;
    edgeKeys.add(k);
    edges.push({ from, to, kind, back: false, tree: false });
  };
  for (const n of nodes) {
    const targets = CODE_TARGETS.get(n.screen.filePath);
    if (!targets) continue;
    for (const t of targets) {
      const to = byFile.get(t);
      if (to) addEdge(n, to, "code");
    }
  }

  // 2. 誰からも遷移されない画面は URL の親に繋ぐ
  const hasIncoming = new Set(edges.map((e) => e.to));
  const withRoute = nodes.filter((n) => n.route);
  for (const n of withRoute) {
    if (hasIncoming.has(n)) continue;
    let parent: FlowNode | null = null;
    for (const cand of withRoute) {
      if (cand === n || cand.route === n.route) continue;
      if (n.route.startsWith(`${cand.route}/`) && (!parent || cand.route.length > parent.route.length)) parent = cand;
    }
    if (parent) addEdge(parent, n, "route");
  }

  // 3. 根を選んで深さ優先探索。探索中（スタック上）の画面や根へ向かう遷移は「戻る向き」
  const outgoing = new Map<FlowNode, FlowEdge[]>(nodes.map((n) => [n, []]));
  const indegree = new Map<FlowNode, number>(nodes.map((n) => [n, 0]));
  for (const e of edges) {
    outgoing.get(e.from)!.push(e);
    indegree.set(e.to, indegree.get(e.to)! + 1);
  }
  const byEntry = (a: FlowNode, b: FlowNode) =>
    (a.route ? segCount(a.route) : 99) - (b.route ? segCount(b.route) : 99) ||
    rolePriority(ROOT_ROLE_PRIORITY, a.role) - rolePriority(ROOT_ROLE_PRIORITY, b.role) ||
    a.route.localeCompare(b.route);
  const sorted = [...nodes].sort(byEntry);
  const roots: FlowNode[] = sorted.filter((n) => indegree.get(n) === 0);
  const rootSet = new Set(roots);
  const state = new Map<FlowNode, 0 | 1 | 2>(nodes.map((n) => [n, 0]));
  const finished: FlowNode[] = [];
  const dfs = (n: FlowNode) => {
    state.set(n, 1);
    for (const e of outgoing.get(n)!) {
      const s = state.get(e.to)!;
      if (s === 1 || rootSet.has(e.to)) {
        e.back = true;
        continue;
      }
      if (s === 0) dfs(e.to);
    }
    state.set(n, 2);
    finished.push(n);
  };
  roots.forEach(dfs);
  // 全部が輪になっていて入口が無い塊は、いちばん浅い URL の画面を入口にする
  for (const n of sorted) {
    if (state.get(n) !== 0) continue;
    roots.push(n);
    rootSet.add(n);
    dfs(n);
  }

  // 4. back 以外の遷移で根からの最長距離 = 列。finished の逆順がトポロジカル順
  for (let i = finished.length - 1; i >= 0; i--) {
    const n = finished[i];
    for (const e of outgoing.get(n)!) {
      if (e.back) continue;
      e.to.depth = Math.max(e.to.depth, n.depth + 1);
    }
  }
  // 列を決めた遷移（1 段浅い親からのもの。code を優先）を木として採用
  for (const n of nodes) {
    if (rootSet.has(n)) continue;
    const cands = edges.filter((e) => e.to === n && !e.back && e.from.depth === n.depth - 1);
    const pick = cands.find((e) => e.kind === "code") ?? cands[0];
    if (!pick) continue;
    pick.tree = true;
    pick.from.children.push(n);
  }
  const byChild = (a: FlowNode, b: FlowNode) =>
    rolePriority(CHILD_ROLE_PRIORITY, a.role) - rolePriority(CHILD_ROLE_PRIORITY, b.role) || a.route.localeCompare(b.route);
  for (const n of nodes) n.children.sort(byChild);

  // 行: 葉から順に割り当て、親は子の中央（tidy tree の簡易版）
  let nextRow = 0;
  const assignRow = (n: FlowNode) => {
    if (!n.children.length) {
      n.row = nextRow++;
      return;
    }
    n.children.forEach(assignRow);
    n.row = (n.children[0].row + n.children[n.children.length - 1].row) / 2;
  };
  roots.forEach(assignRow);

  const cols = nodes.length ? Math.max(...nodes.map((n) => n.depth)) + 1 : 0;
  const rows = nodes.length ? Math.max(...nodes.map((n) => n.row)) + 1 : 0;

  return { key, label, signature: signatureOf(nodes), category, nodes, roots, edges, cols, rows };
}

// ---------------------------------------------------------------------------
// 並び順はサイドメニュー（navigation.ts の primaryNav）に合わせる。
// ホーム → データ検索 → 承認申請管理 → 確認管理 → 帳票管理 → 製品管理 → … → ガイド → ヘルプ の順。
// 画面の URL がどのメニュー項目のパスに属するかで位置を決めるので、メニューを並べ替えればここも追従する。
// ---------------------------------------------------------------------------

const NAV_PATHS: string[] = flattenNavPaths(primaryNav).map((n) => n.path);
/** 帳票同士の順番は「帳票管理」画面のカード順（data/ledgers.ts）に合わせる */
const LEDGER_SLUGS: string[] = ledgerCategories.map((c) => c.slug);

/** 「該当なし」の順位。Infinity 同士の引き算は NaN になりソートが壊れるので有限の大きな値にする */
const NONE = 1e9;

/** ルートが属するサイドメニュー項目の位置。どの項目にも属さなければ NONE（末尾に回す） */
function navIndexOfRoute(route: string): number {
  let best = -1;
  let bestLen = -1;
  NAV_PATHS.forEach((p, i) => {
    if ((route === p || route.startsWith(`${p}/`)) && p.length > bestLen) {
      best = i;
      bestLen = p.length;
    }
  });
  return best === -1 ? NONE : best;
}

/** 画面群のうち、サイドメニューでいちばん上に出る項目の位置 */
function navIndexOf(items: ScreenEntry[]): number {
  return Math.min(NONE, ...items.flatMap((s) => s.routes.map(navIndexOfRoute)));
}

/** 画面群がどの帳票（slug）のものか。帳票でなければ NONE */
function ledgerIndexOf(items: ScreenEntry[]): number {
  return Math.min(
    NONE,
    ...items.flatMap((s) =>
      s.routes.map((r) => {
        const segs = r.split("/");
        const i = LEDGER_SLUGS.findIndex((slug) => segs.includes(slug));
        return i === -1 ? NONE : i;
      })
    )
  );
}

/** モジュールの並び: 管理画面（サイドメニュー順: データ検索 → 承認申請 → 確認 → 帳票管理 → …） → 共通 → アプリ */
function moduleOrder(category: ScreenEntry["category"], items: ScreenEntry[]): number {
  if (category === "App") return 2000;
  if (category === "Common") return 1900;
  // メニューに無い管理画面（ログイン等）も、共通・アプリより前に置く
  return Math.min(navIndexOf(items), 1000);
}

/**
 * 画面一覧から「帳票（機能）ごとのセクション → その中の遷移ツリー」を組む。
 * 管理画面の帳票系は 帳票管理 / 承認申請 / 確認 / データ検索 で分け、アプリは 1 つにまとめる。
 */
export function buildFlowSections(screens: ScreenEntry[]): FlowSection[] {
  type Bucket = { group: ScreenGroup; modules: Map<string, { label: string; category: ScreenEntry["category"]; items: ScreenEntry[] }> };
  const buckets = new Map<string, Bucket>();

  for (const s of screens) {
    const group = groupOf(s);
    let bucket = buckets.get(group.key);
    if (!bucket) buckets.set(group.key, (bucket = { group, modules: new Map() }));

    const role = roleOf(s);
    let key: string;
    let label: string;
    if (s.category === "App") {
      key = "app";
      label = "アプリ";
    } else if (role) {
      key = `admin:${role}`;
      label = `管理画面 / ${role}`;
    } else {
      key = `${s.category.toLowerCase()}:${s.feature}`;
      label = s.category === "Common" ? "共通" : "管理画面";
    }
    let mod = bucket.modules.get(key);
    if (!mod) bucket.modules.set(key, (mod = { label, category: s.category, items: [] }));
    mod.items.push(s);
  }

  // セクション（機能）の並び: サイドメニューの位置 → 帳票管理画面のカード順 → 従来の並び → 名前
  type Ranked = { section: FlowSection; nav: number; ledger: number };
  const ranked: Ranked[] = [];
  for (const { group, modules } of buckets.values()) {
    const built = Array.from(modules.entries())
      .map(([key, m]) => ({ key, m, order: moduleOrder(m.category, m.items) }))
      .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key))
      .map(({ key, m }) => buildFlowModule(`${group.key}/${key}`, m.label, m.category, m.items, group));
    const count = built.reduce((n, m) => n + m.nodes.length, 0);
    const appCount = built.filter((m) => m.category === "App").reduce((n, m) => n + m.nodes.length, 0);
    const items = Array.from(modules.values()).flatMap((m) => m.items);
    ranked.push({
      section: { group, modules: built, count, adminCount: count - appCount, appCount },
      nav: navIndexOf(items),
      ledger: ledgerIndexOf(items),
    });
  }
  return ranked
    .sort(
      (a, b) =>
        a.nav - b.nav ||
        a.ledger - b.ledger ||
        groupOrder(a.section.group.key) - groupOrder(b.section.group.key) ||
        a.section.group.label.localeCompare(b.section.group.label)
    )
    .map((r) => r.section);
}
