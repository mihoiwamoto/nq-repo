import iconHome from "../assets/figma/icons/nav/home.svg";
import iconDataSearch from "../assets/figma/icons/nav/data-search.svg";
import iconApproval from "../assets/figma/icons/nav/approval.svg";
import iconLedgerManagement from "../assets/figma/icons/nav/ledger-management.svg";
import iconProduct from "../assets/figma/icons/nav/product.svg";
import iconCompany from "../assets/figma/icons/nav/company.svg";
import iconFactory from "../assets/figma/icons/nav/factory.svg";
import iconStorage from "../assets/figma/icons/nav/storage.svg";
import iconStaff from "../assets/figma/icons/nav/staff.svg";
import iconLog from "../assets/figma/icons/nav/log.svg";
import iconDevice from "../assets/figma/icons/nav/device.svg";
import iconHelp from "../assets/figma/icons/nav/help.svg";
import { approvalRequests } from "./data/approvals";

const pendingApprovalCount = approvalRequests.filter((item) => item.status === "pending").length;

export type AdminNavItem = {
  label: string;
  icon: string;
  path: string;
  badge?: number;
};

export const primaryNav: AdminNavItem[] = [
  { label: "ホーム", icon: iconHome, path: "/admin/home" },
  { label: "データ検索", icon: iconDataSearch, path: "/admin/data-search" },
  { label: "承認申請管理", icon: iconApproval, path: "/admin/approvals", badge: pendingApprovalCount },
  { label: "帳票管理", icon: iconLedgerManagement, path: "/admin/ledger-management" },
  { label: "製品管理", icon: iconProduct, path: "/admin/products" },
  { label: "企業管理", icon: iconCompany, path: "/admin/company" },
  { label: "工場管理", icon: iconFactory, path: "/admin/factory" },
  { label: "保管場所管理", icon: iconStorage, path: "/admin/storage" },
  { label: "職員管理", icon: iconStaff, path: "/admin/staff" },
  { label: "ログ管理", icon: iconLog, path: "/admin/logs" },
  { label: "ログイン端末管理", icon: iconDevice, path: "/admin/devices" },
];

export const secondaryNav: AdminNavItem[] = [
  { label: "ヘルプ", icon: iconHelp, path: "/admin/help" },
];
