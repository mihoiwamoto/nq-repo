import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { getCompanyName } from "../../../data/companies";
import { ROLE_COLORS, ROLE_LABELS } from "../staff-management/types";
import { CURRENT_ACCOUNT } from "./mockData";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-center w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{children}</div>
    </div>
  );
}

export function AccountPage() {
  const account = CURRENT_ACCOUNT;

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
                  className="h-10 w-28 rounded-lg flex items-center justify-center text-base"
                  style={{
                    backgroundColor: ROLE_COLORS[assignment.role].bg,
                    color: ROLE_COLORS[assignment.role].text,
                  }}
                >
                  {ROLE_LABELS[assignment.role]}
                </span>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
            </div>
          ))}

          <Row label="メールアドレス">{account.email}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="パスワード">{account.hasPassword ? "登録済み" : "未登録"}</Row>
        </div>
      </div>
    </div>
  );
}
