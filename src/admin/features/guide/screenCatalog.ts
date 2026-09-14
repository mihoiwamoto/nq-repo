/**
 * 画面説明キャンバスで扱う「NQ の全画面」の一覧。
 *
 * 画面の一覧とルートは編集追跡システムの生成物（.claude/screen-map.json）を
 * そのまま読む。`:factoryId` のようなパラメータは .claude/route-params.json と
 * このリポジトリの ID 規則（頭文字 + 1）で埋める（capture-screens.cjs と同じ考え方）。
 */
import screenMapRaw from "../../../../.claude/screen-map.json?raw";
import routeParamsRaw from "../../../../.claude/route-params.json?raw";

type RawScreen = {
  id: string;
  displayName: string;
  frameTitle?: string | null;
  filePath: string;
  category: "Admin" | "App" | "Common";
  feature: string;
  routes: string[];
};

type RouteParams = {
  global?: Record<string, string>;
  byScreen?: Record<string, Record<string, string>>;
};

export type ScreenEntry = {
  id: string;
  /** アプリ上で表示される見出し（無ければコンポーネント名） */
  title: string;
  componentName: string;
  filePath: string;
  category: RawScreen["category"];
  feature: string;
  /** パラメータを埋めた、実際に開ける URL */
  route: string;
  /** 元のルート定義（:param 付き） */
  routes: string[];
};

/** キャンバス自身を読み込むと無限に入れ子になるので除外する */
const EXCLUDED_FILES = new Set(["src/admin/features/guide/ScreenCanvasPage.tsx"]);

const CATEGORY_ORDER: Record<RawScreen["category"], number> = { Admin: 0, App: 1, Common: 2 };

const rawScreens = (JSON.parse(screenMapRaw) as { screens: RawScreen[] }).screens;
const routeParams = JSON.parse(routeParamsRaw) as RouteParams;

function resolveParam(param: string, filePath: string): string {
  const byScreen = routeParams.byScreen?.[filePath]?.[param];
  if (byScreen) return byScreen;
  const global = routeParams.global?.[param];
  if (global) return global;
  const entity = param.replace(/^:/, "").replace(/Id$/, "");
  if (/date|Key$/i.test(entity)) return "2026-09-02";
  return `${entity[0]?.toLowerCase() ?? "x"}1`;
}

export function resolveRoute(pattern: string, filePath: string): string {
  return pattern.replace(/:[A-Za-z_]+/g, (param) => resolveParam(param, filePath));
}

/**
 * 見出しを取れなかった画面の日本語名。
 * AppHeader の title が `添加物管理_${name}` のように動的だったり、見出しが h1 でない画面は
 * 生成物（screen-map.json）の frameTitle がコンポーネント名（英語）になってしまうので、
 * ここで実際の表示に合わせた名前を当てる。キーはファイルパス。
 */
const JAPANESE_TITLES: Record<string, string> = {
  "src/admin/features/login/AdminLoginPage.tsx": "ログイン",
  "src/admin/features/login/LogoutCompletePage.tsx": "ログアウトしました",
  "src/admin/pages/AdminLedgerDetailPage.tsx": "帳票詳細",
  "src/admin/pages/ApprovalManagementPage.tsx": "承認申請管理",
  "src/admin/pages/ConfirmationManagementPage.tsx": "確認管理",
  "src/admin/pages/DataSearchPage.tsx": "データ検索",
  "src/admin/pages/LedgerManagementPage.tsx": "帳票管理",
  "src/app/features/additive-management/RecordsListPage.tsx": "添加物管理_記録一覧",
  "src/app/features/additive-management/RecordingPage.tsx": "添加物管理_記録",
  "src/app/features/additive-management/ConfirmPage.tsx": "添加物管理_確認",
  "src/app/features/chemical-management/ChemicalRecordsListPage.tsx": "薬品管理_記録一覧",
  "src/app/features/chemical-management/ChemicalRecordingPage.tsx": "薬品管理_記録",
  "src/app/features/chemical-management/ChemicalConfirmPage.tsx": "薬品管理_確認",
  "src/app/features/cleaning-record/RecordingPage.tsx": "清掃記録_記録",
  "src/app/features/equipment-inspection/LineInspectionPage.tsx": "機械器具点検_ライン点検",
  "src/app/features/glass-plastic/FloorInspectionPage.tsx": "ガラス・プラスチック管理_点検",
  "src/app/features/glass-plastic/FloorInspectionConfirmPage.tsx": "ガラス・プラスチック管理_確認",
  "src/app/features/glass-plastic/FloorInspectionCompletePage.tsx": "ガラス・プラスチック管理_保存完了",
  "src/app/features/metal-xray-detection/MachineDetailPage.tsx": "金属/X線探知機記録_探知機詳細",
  "src/app/features/metal-xray-detection/MachineRecordFormPage.tsx": "金属/X線探知機記録_記録入力",
  "src/app/features/metal-xray-detection/MachineRecordDetailPage.tsx": "金属/X線探知機記録_記録詳細",
  "src/app/features/metal-xray-detection/MachineConfirmPage.tsx": "金属/X線探知機記録_確認",
  "src/app/features/metal-xray-detection/MachineReviewPage.tsx": "金属/X線探知機記録_記録確認",
  "src/app/features/metal-xray-detection/MachineSubmitCompletePage.tsx": "金属/X線探知機記録_送信完了",
  "src/app/features/scale-inspection/ScaleListPage.tsx": "秤点検記録_秤一覧",
  "src/app/features/scale-inspection/ScaleRecordPage.tsx": "秤点検記録_記録",
  "src/app/features/scale-inspection/ConfirmPage.tsx": "秤点検記録_確認",
  "src/app/features/water-inspection/RecordEditCompletePage.tsx": "使用水の点検_保存完了",
  "src/pages/ComingSoonPage.tsx": "準備中",
  "src/pages/HomePage.tsx": "食品工場管理システム（トップ）",
};

/** 日本語（かな・漢字）を含むか。含まないなら見出しが取れずコンポーネント名になっている */
const hasJapanese = (text: string) => /[぀-ヿ一-鿿]/.test(text);

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/:[A-Za-z_]+/g, "[^/]+");
  return new RegExp(`^${escaped}/?$`);
}

/** iframe 内で遷移したときに、今どの画面を表示しているかを URL から逆引きする */
export function findScreenByPathname(pathname: string): ScreenEntry | undefined {
  let best: ScreenEntry | undefined;
  let bestLength = -1;
  for (const screen of SCREENS) {
    for (const pattern of screen.routes) {
      if (patternToRegExp(pattern).test(pathname) && pattern.length > bestLength) {
        best = screen;
        bestLength = pattern.length;
      }
    }
  }
  return best;
}

export const CATEGORY_LABELS: Record<RawScreen["category"], string> = {
  Admin: "管理画面",
  App: "現場アプリ",
  Common: "共通",
};

// ---------------------------------------------------------------------------
// 帳票ごとのグループ分け（画面一覧のアコーディオン用）
// 対応表はダッシュボード（.claude/screen-map-viewer.html の VERSION_GROUPS）と揃える。
// 新しい帳票を追加したらここにも足すこと。
// ---------------------------------------------------------------------------

export type ScreenGroup = {
  key: string;
  label: string;
  /** 帳票（承認・確認・データ検索を横断してまとめる）か、それ以外の機能か */
  kind: "ledger" | "other";
  /** 帳票が追加されたバージョン（帳票のみ） */
  version?: string;
};

/** 並び順はこの配列の順（新しいバージョンが上） */
const LEDGER_GROUPS: { version: string; label: string; features: string[] }[] = [
  {
    version: "Ver.4.0",
    label: "機械器具点検",
    features: ["equipment-inspection", "data-search-equipment", "approvals-equipment-inspection", "confirmations-equipment-inspection"],
  },
  {
    version: "Ver.4.0",
    label: "清掃記録",
    features: ["cleaning-record", "data-search-cleaning-record", "approvals-cleaning-record", "confirmations-cleaning-record"],
  },
  {
    version: "Ver.4.0",
    label: "添加物管理",
    features: ["additive-management", "data-search-additive-management", "approvals-additive-management", "confirmations-additive-management"],
  },
  {
    version: "Ver.4.0",
    label: "薬品管理",
    features: ["chemical-management", "data-search-chemical-management", "approvals-chemical-management", "confirmations-chemical-management"],
  },
  {
    version: "Ver.3.0",
    label: "金属/X線探知機",
    features: [
      "metal-detector-management",
      "xray-detector-management",
      "weight-checker-management",
      "metal-xray-detection",
      "data-search-metal-xray-detection",
      "approvals-metal-xray-detection",
      "confirmations-metal-xray-detection",
    ],
  },
  {
    version: "Ver.3.0",
    label: "検体管理",
    features: [
      "sample-management",
      "specimen-management",
      "data-search-sample-management",
      "approvals-sample-management",
      "confirmations-sample-management",
    ],
  },
  {
    version: "Ver.2.0",
    label: "ガラスプラスチック管理",
    features: ["glass-plastic", "data-search-glass-plastic", "approvals-glass-plastic", "confirmations-glass-plastic"],
  },
  {
    version: "Ver.2.0",
    label: "秤点検管理",
    features: ["scale-inspection", "data-search-scale-inspection", "approvals-scale-inspection", "confirmations-scale-inspection"],
  },
  {
    version: "Ver.2.0",
    label: "官能検査記録",
    features: ["sensory-inspection", "data-search-sensory-inspection", "approvals-sensory-inspection", "confirmations-sensory-inspection"],
  },
  {
    version: "Ver.1.0",
    label: "使用水の点検",
    features: ["water-inspection", "data-search-water-inspection", "approvals-water-inspection", "confirmations-water-inspection"],
  },
];

/** 帳票に属さない機能フォルダの表示名 */
const OTHER_FEATURE_LABELS: Record<string, string> = {
  pages: "ホーム・共通ページ",
  account: "アカウント",
  company: "企業管理",
  "company-management": "企業管理",
  "factory-management": "工場管理",
  "staff-management": "職員管理",
  "storage-management": "保管場所管理",
  "product-management": "製品管理",
  "device-management": "ログイン端末管理",
  "log-management": "ログ管理",
  help: "ヘルプ",
  guide: "ガイド",
  login: "ログイン",
  "pending-review": "確認待ち",
  progress: "進捗",
  settings: "設定",
};

/** 「その他の画面」の並び順。ここに無い機能は末尾に付く */
const OTHER_ORDER = [
  "account",
  "pages",
  "product-management",
  "storage-management",
  "company-management",
  "factory-management",
  "staff-management",
  "log-management",
  "device-management",
  "help",
];

const featureToLedger = new Map<string, (typeof LEDGER_GROUPS)[number]>();
for (const g of LEDGER_GROUPS) for (const f of g.features) featureToLedger.set(f, g);

/** 帳票に属する画面は「帳票名_画面名」で表示する（例: 機械器具点検_工場選択）。
 *  すでに帳票名で始まる名前（JAPANESE_TITLES の手書き分など）は二重に付けない。 */
function withLedgerPrefix(title: string, feature: string): string {
  const ledger = featureToLedger.get(feature);
  if (!ledger || title.startsWith(ledger.label)) return title;
  return `${ledger.label}_${title}`;
}

function titleOf(s: RawScreen): string {
  const override = JAPANESE_TITLES[s.filePath];
  const base = override ?? (s.frameTitle && hasJapanese(s.frameTitle) ? s.frameTitle : s.frameTitle || s.displayName);
  return withLedgerPrefix(base, s.feature);
}

export const SCREENS: ScreenEntry[] = rawScreens
  .filter((s) => !EXCLUDED_FILES.has(s.filePath) && s.routes.length > 0)
  .map((s) => ({
    id: s.id,
    title: titleOf(s),
    componentName: s.displayName,
    filePath: s.filePath,
    category: s.category,
    feature: s.feature,
    route: resolveRoute(s.routes[0], s.filePath),
    routes: s.routes,
  }))
  .sort(
    (a, b) =>
      CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] ||
      a.feature.localeCompare(b.feature) ||
      a.route.localeCompare(b.route)
  );


export function groupOf(screen: ScreenEntry): ScreenGroup {
  const ledger = featureToLedger.get(screen.feature);
  if (ledger) return { key: `ledger:${ledger.label}`, label: ledger.label, kind: "ledger", version: ledger.version };
  return { key: `other:${screen.feature}`, label: OTHER_FEATURE_LABELS[screen.feature] ?? screen.feature, kind: "other" };
}

/** グループの並び順: 帳票（LEDGER_GROUPS の順）→ その他（OTHER_ORDER の順 → 残り） */
export function groupOrder(key: string): number {
  if (key.startsWith("ledger:")) {
    const i = LEDGER_GROUPS.findIndex((g) => `ledger:${g.label}` === key);
    return i === -1 ? 500 : i;
  }
  const i = OTHER_ORDER.indexOf(key.replace(/^other:/, ""));
  return i === -1 ? 1900 : 1000 + i;
}

export type ScreenRole = "帳票管理" | "承認申請" | "確認" | "データ検索";
const ROLE_ORDER: ScreenRole[] = ["帳票管理", "承認申請", "確認", "データ検索"];

/** 管理画面の帳票系画面が、帳票管理 / 承認 / 確認 / データ検索 のどれかを feature 名から判定する */
export function roleOf(screen: ScreenEntry): ScreenRole | null {
  if (screen.category !== "Admin" || !featureToLedger.has(screen.feature)) return null;
  if (screen.feature.startsWith("approvals-")) return "承認申請";
  if (screen.feature.startsWith("confirmations-")) return "確認";
  if (screen.feature.startsWith("data-search-")) return "データ検索";
  return "帳票管理";
}

export function roleOrder(role: ScreenRole | null): number {
  return role ? ROLE_ORDER.indexOf(role) : -1;
}
