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
import iconGuide from "../assets/figma/icons/nav/guide.svg";
import iconScreenGuide from "../assets/figma/icons/nav/screen-guide.svg";
import iconHelp from "../assets/figma/icons/nav/help.svg";
import type { PrototypeRoleId } from "../data/roleStore";
import { approvalRequests } from "./data/approvals";
import { pendingConfirmationCount } from "./data/confirmations";

const pendingApprovalCount = approvalRequests.filter((item) => item.status === "pending").length;

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
  {
    label: "ガイド",
    icon: iconGuide,
    path: "/admin/guide",
    children: [
      { label: "画面説明", icon: iconScreenGuide, path: "/admin/guide/screens" },
      { label: "ヘルプ", icon: iconHelp, path: "/admin/help" },
    ],
  },
];

/** サイドメニュー下部の固定枠。現在は空（ヘルプはガイド配下に移動）。 */
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
  "/admin/guide",
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
  "/admin/guide",
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
  "/admin/guide",
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

export function filterNavByRole(items: AdminNavItem[], role: PrototypeRoleId): AdminNavItem[] {
  const rule = NAV_VISIBILITY[role];
  if (!rule) return items;
  return items.filter(
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
