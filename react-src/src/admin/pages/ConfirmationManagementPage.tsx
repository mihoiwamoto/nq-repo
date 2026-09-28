import { LedgerCategoryGrid } from "../components/LedgerCategoryGrid";
import { confirmationPendingSlugs } from "../data/confirmations";
import { useDemoList } from "../../components/demo/demoStore";

export function ConfirmationManagementPage() {
  // 動作デモ「データが無い」のときは確認待ちの帳票も無いので、バッジを出さない
  const badgeSlugs = useDemoList(confirmationPendingSlugs);

  return (
    <div>
      <div className="bg-[var(--semantic-background-page)] shadow-[0px_2px_2px_rgba(51,51,51,0.16)] flex items-center p-6">
        <h1 className="text-[28px] leading-[1.4] font-semibold text-[var(--semantic-text-primary)]">
          確認管理
        </h1>
      </div>
      <LedgerCategoryGrid basePath="/admin/confirmations" badgeSlugs={badgeSlugs} />
    </div>
  );
}
