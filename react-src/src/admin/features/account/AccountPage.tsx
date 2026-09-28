import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { getCompanyName } from "../../../data/companies";
import { ROLE_COLORS, ROLE_LABELS } from "../staff-management/types";
import { saveCurrentRole } from "../../../data/roleStore";
import type { PrototypeRoleId } from "../../../data/roleStore";
import { useCurrentRole } from "../../../data/useCurrentRole";
import { CURRENT_ACCOUNT } from "./mockData";

type PrototypeRoleOption = {
  id: PrototypeRoleId;
  label: string;
  description: string;
  colors: { bg: string; text: string };
};

const PROTOTYPE_ROLES: PrototypeRoleOption[] = [
  {
    id: "approver_checker",
    label: `${ROLE_LABELS.approver}・${ROLE_LABELS.checker}兼任`,
    description: "確認と承認の両方を行う。",
    colors: { bg: "#fbe4ec", text: "#9d2c5b" },
  },
  {
    id: "administrator",
    label: "管理者",
    description: "全画面にアクセスできる。",
    colors: { bg: "#ece4fb", text: "#6b3fa0" },
  },
  {
    id: "approver",
    label: ROLE_LABELS.approver,
    description: "確認者が確認した確認済みの帳票を承認する。",
    colors: ROLE_COLORS.approver,
  },
  {
    id: "checker",
    label: ROLE_LABELS.checker,
    description: "実施者が提出した帳票を確認する。",
    colors: ROLE_COLORS.checker,
  },
];

const DEFAULT_ROLE: PrototypeRoleId = "approver";

function getRoleOption(id: PrototypeRoleId): PrototypeRoleOption {
  return PROTOTYPE_ROLES.find((option) => option.id === id) ?? PROTOTYPE_ROLES[0];
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-center w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{children}</div>
    </div>
  );
}

function RoleSwitcher({
  role,
  onSelect,
}: {
  role: PrototypeRoleId;
  onSelect: (role: PrototypeRoleId) => void;
}) {
  return (
    <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
      <h2 className="text-xl text-[var(--semantic-text-primary)]">ロール切替（プロトタイプ用）</h2>

      <p className="bg-[#fdf6e3] border border-[var(--semantic-status-caution)] rounded-lg px-4 py-3 text-base text-[var(--semantic-text-primary)] w-full">
        プロトタイプ動作確認用です。本番ではログイン時に決定されます。選択したロールはこの端末（ブラウザ）に保存されます。
      </p>

      <div className="grid grid-cols-2 gap-4 w-full">
        {PROTOTYPE_ROLES.map((option) => {
          const selected = option.id === role;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`flex flex-col gap-3 items-start rounded-lg border-2 px-4 py-4 text-left ${
                selected ? "" : "border-[#d0d0d0] bg-white"
              }`}
              // 選択中はそのロールのチップの色を使う（薄い背景 + 濃い枠線）
              style={
                selected
                  ? { backgroundColor: option.colors.bg, borderColor: option.colors.text }
                  : undefined
              }
            >
              <div className="flex gap-2 items-center justify-between w-full">
                <span
                  className="h-10 min-w-28 px-3 rounded-lg flex items-center justify-center text-base"
                  style={{
                    backgroundColor: option.colors.bg,
                    color: option.colors.text,
                    // 選択中はカード背景と同色になるので、枠線でチップの形を残す
                    border: selected ? `1px solid ${option.colors.text}` : undefined,
                  }}
                >
                  {option.label}
                </span>
                {selected && (
                  <span
                    className="rounded px-2 py-1 text-sm text-white"
                    style={{ backgroundColor: option.colors.text }}
                  >
                    使用中
                  </span>
                )}
              </div>
              <p className="text-base text-[var(--semantic-text-primary)]">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AccountPage() {
  const account = CURRENT_ACCOUNT;
  const role = useCurrentRole(DEFAULT_ROLE);
  const currentRole = getRoleOption(role);

  return (
    <div>
      <PageTitleBar title="アカウント情報" />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
          <Row label="名前">{account.name}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="社員番号">{account.employeeNumber}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="企業">{getCompanyName(account.companyId)}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          {account.assignments.map((assignment, index) => (
            <div key={`${assignment.factoryId}-${index}`} className="flex flex-col gap-4 w-full">
              <Row label="工場">{getFactoryName(assignment.factoryId)}</Row>
              <div className="flex gap-4 items-center w-full">
                <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">権限</div>
                <span
                  className="h-10 min-w-28 px-3 rounded-lg flex items-center justify-center text-base"
                  style={{
                    backgroundColor: currentRole.colors.bg,
                    color: currentRole.colors.text,
                  }}
                >
                  {currentRole.label}
                </span>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
            </div>
          ))}

          <Row label="メールアドレス">{account.email}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="パスワード">{account.hasPassword ? "登録済み" : "未登録"}</Row>
        </div>

        <RoleSwitcher role={role} onSelect={saveCurrentRole} />
      </div>
    </div>
  );
}
