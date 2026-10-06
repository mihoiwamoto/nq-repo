import iconHome from "../assets/figma/icons/nav/home.svg";
import iconDataSearch from "../assets/figma/icons/nav/data-search.svg";
import iconApproval from "../assets/figma/icons/nav/approval.svg";
import iconConfirmation from "../assets/figma/icons/nav/confirmation.svg";
import iconLedgerManagement from "../assets/figma/icons/nav/ledger-management.svg";
import iconProduct from "../assets/figma/icons/nav/product.svg";
import iconCompany from "../assets/figma/icons/nav/company.svg";
import iconFactory from "../assets/figma/icons/nav/factory.svg";
import iconStorage from "../assets/figma/icons/nav/storage.svg";
import iconStaff from "../assets/figma/icons/nav/staff.svg";
import iconLog from "../assets/figma/icons/nav/log.svg";
import iconDevice from "../assets/figma/icons/nav/device.svg";
import iconHelp from "../assets/figma/icons/nav/help.svg";
import type { PrototypeRoleId } from "../data/roleStore";
import { approvalRequests } from "./data/approvals";
import { pendingConfirmationCount } from "./data/confirmations";
import { isMenuHidden, withoutHiddenLedgers } from "../data/ledgerVisibility";

// 画面設計の Ver の切替で隠している帳票の申請は数えない（枠の URL の ?hide= を読み込みのときに見る）
const pendingApprovalCount = withoutHiddenLedgers(approvalRequests).filter((item) => item.status === "pending").length;

export type AdminNavItem = {
  label: string;
  icon: string;
  path: string;
  badge?: number;
  /** 指定するとサイドメニューでアコーディオンになり、親自体は遷移しない */
  children?: AdminNavChildItem[];
};

export type AdminNavChildItem = {
  label: string;
  icon: string;
  path: string;
};

export const primaryNav: AdminNavItem[] = [
  { label: "ホーム", icon: iconHome, path: "/admin/home" },
  { label: "データ検索", icon: iconDataSearch, path: "/admin/data-search" },
  { label: "承認申請管理", icon: iconApproval, path: "/admin/approvals", badge: pendingApprovalCount },
  { label: "確認管理", icon: iconConfirmation, path: "/admin/confirmations", badge: pendingConfirmationCount },
  { label: "帳票管理", icon: iconLedgerManagement, path: "/admin/ledger-management" },
  { label: "製品管理", icon: iconProduct, path: "/admin/products" },
  { label: "企業管理", icon: iconCompany, path: "/admin/company" },
  { label: "工場管理", icon: iconFactory, path: "/admin/factory" },
  { label: "保管場所管理", icon: iconStorage, path: "/admin/storage" },
  { label: "職員管理", icon: iconStaff, path: "/admin/staff" },
  { label: "ログ管理", icon: iconLog, path: "/admin/logs" },
  { label: "ログイン端末管理", icon: iconDevice, path: "/admin/devices" },
  { label: "ヘルプ", icon: iconHelp, path: "/admin/help" },
];

/** サイドメニュー下部の固定枠。現在は空（ヘルプはサイドメニューのいちばん下に単独項目として配置。フィードバック管理はメニューに出さず、URL で直接開く）。 */
export const secondaryNav: AdminNavItem[] = [];

/** 確認者に表示するサイドメニュー（これ以外は非表示） */
const CHECKER_NAV_PATHS = [
  "/admin/home",
  "/admin/data-search",
  "/admin/confirmations",
  "/admin/ledger-management",
  "/admin/products",
  "/admin/storage",
  "/admin/staff",
  "/admin/logs",
  "/admin/help",
];

/** 承認者に表示するサイドメニュー（これ以外は非表示） */
const APPROVER_NAV_PATHS = [
  "/admin/home",
  "/admin/data-search",
  "/admin/approvals",
  "/admin/ledger-management",
  "/admin/products",
  "/admin/storage",
  "/admin/staff",
  "/admin/logs",
  "/admin/help",
];

/** 承認者・確認者兼任に表示するサイドメニュー（これ以外は非表示） */
const APPROVER_CHECKER_NAV_PATHS = [
  "/admin/home",
  "/admin/data-search",
  "/admin/approvals",
  "/admin/confirmations",
  "/admin/ledger-management",
  "/admin/products",
  "/admin/storage",
  "/admin/staff",
  "/admin/logs",
  "/admin/help",
];

/**
 * ロールごとのサイドメニュー表示ルール（プロトタイプ用）
 * 管理者（administrator）はルールを持たせない = 全メニューを表示する。
 */
const NAV_VISIBILITY: Partial<Record<PrototypeRoleId, { allow?: string[]; hide?: string[] }>> = {
  approver_checker: { allow: APPROVER_CHECKER_NAV_PATHS },
  checker: { allow: CHECKER_NAV_PATHS },
  approver: { allow: APPROVER_NAV_PATHS },
};

/**
 * 今回の開発では実装しないため、どのロールでもサイドメニューとホームのカードに出さないメニュー（2026-09-30）。
 * 画面とルートは残してあるので URL で直接は開ける。実装することになったらここから外す。
 */
export const HIDDEN_NAV_PATHS = ["/admin/confirmations"];

export function filterNavByRole(items: AdminNavItem[], role: PrototypeRoleId): AdminNavItem[] {
  // 画面設計・プロトタイプの Ver の切替で、その Ver にまだ無いメニュー（製品管理・保管場所管理）も出さない
  const shown = items.filter((item) => !HIDDEN_NAV_PATHS.includes(item.path) && !isMenuHidden(item.path));
  const rule = NAV_VISIBILITY[role];
  if (!rule) return shown;
  return shown.filter(
    (item) => (!rule.allow || rule.allow.includes(item.path)) && !rule.hide?.includes(item.path)
  );
}

/** ルーティング生成用。子を持つ項目は親ではなく子のパスを返す。 */
export function flattenNavPaths(items: AdminNavItem[]): { label: string; path: string }[] {
  return items.flatMap((item) =>
    item.children?.length
      ? item.children.map((child) => ({ label: child.label, path: child.path }))
      : [{ label: item.label, path: item.path }]
  );
}
