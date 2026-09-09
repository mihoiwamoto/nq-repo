import { Link } from "react-router-dom";
import { PageTitleBar } from "../components/PageTitleBar";
import iconDataSearch from "../../assets/figma/icons/nav/data-search.svg";
import iconApproval from "../../assets/figma/icons/nav/approval.svg";
import iconConfirmation from "../../assets/figma/icons/nav/confirmation.svg";
import iconLedgerManagement from "../../assets/figma/icons/nav/ledger-management.svg";
import iconCompany from "../../assets/figma/icons/nav/company.svg";
import iconFactory from "../../assets/figma/icons/nav/factory.svg";
import iconStaff from "../../assets/figma/icons/nav/staff.svg";
import iconLog from "../../assets/figma/icons/nav/log.svg";
import iconDevice from "../../assets/figma/icons/nav/device.svg";
import iconHelp from "../../assets/figma/icons/nav/help.svg";

const HOME_SHORTCUTS = [
  {
    label: "データ検索",
    icon: iconDataSearch,
    path: "/admin/data-search",
    description: "登録された過去の点検データを閲覧することができます",
  },
  {
    label: "承認申請管理",
    icon: iconApproval,
    path: "/admin/approvals",
    description: "工場で点検された帳票を承認する画面です",
  },
  {
    label: "確認管理",
    icon: iconConfirmation,
    path: "/admin/confirmations",
    description: "工場で点検された帳票を確認する画面です",
  },
  {
    label: "帳票管理",
    icon: iconLedgerManagement,
    path: "/admin/ledger-management",
    description: "帳票のテンプレート管理の画面です。帳票の作成・項目の修正が必要な際に使用する画面です",
  },
  {
    label: "企業管理",
    icon: iconCompany,
    path: "/admin/company",
    description: "企業の登録・編集・削除ができます",
  },
  {
    label: "工場管理",
    icon: iconFactory,
    path: "/admin/factory",
    description: "工場の登録・編集・削除ができます",
  },
  {
    label: "職員管理",
    icon: iconStaff,
    path: "/admin/staff",
    description: "点検登録する職員の登録・編集・削除ができる画面です。職員の入社・退職時にご利用ください",
  },
  {
    label: "ログ管理",
    icon: iconLog,
    path: "/admin/logs",
    description: "点検登録された履歴を見ることができます",
  },
  {
    label: "ログイン端末管理",
    icon: iconDevice,
    path: "/admin/devices",
    description: "アプリにログインできる端末を管理、承認する画面です",
  },
  {
    label: "ヘルプ",
    icon: iconHelp,
    path: "/admin/help",
    description: "操作説明やトラブルシューティングはこちらからご覧ください",
  },
];

export function AdminHomePage() {
  return (
    <div className="w-full h-full flex flex-col">
      <PageTitleBar title="ホーム" />
      <div className="flex-1 flex flex-col justify-start p-6 overflow-auto">
        <div className="w-full flex flex-col gap-4">
          {HOME_SHORTCUTS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="bg-[var(--semantic-background-surface)] flex items-center gap-6 px-4 py-3 rounded-lg w-full"
            >
              <div className="flex items-center gap-3 h-8 w-[228px] shrink-0">
                <span
                  aria-hidden
                  className="size-8 shrink-0"
                  style={{
                    WebkitMaskImage: `url("${item.icon}")`,
                    maskImage: `url("${item.icon}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "var(--semantic-brand-primary)",
                  }}
                />
                <span className="flex-1 text-xl font-semibold leading-[1.4] text-[var(--semantic-brand-primary)]">
                  {item.label}
                </span>
              </div>
              <div className="w-px self-stretch bg-[var(--semantic-text-secondary)]" />
              <p className="flex-1 text-base font-light leading-[1.6] text-[var(--semantic-text-primary)]">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
