import { LedgerCategoryGrid } from "../components/LedgerCategoryGrid";
import { confirmationPendingSlugs } from "../data/confirmations";

export function ConfirmationManagementPage() {
  return (
    <div>
      <div className="bg-[var(--semantic-background-page)] shadow-[0px_2px_2px_rgba(51,51,51,0.16)] flex items-center p-6">
        <h1 className="text-[28px] leading-[1.4] font-semibold text-[var(--semantic-text-primary)]">
          確認管理
        </h1>
      </div>
      <LedgerCategoryGrid basePath="/admin/confirmations" badgeSlugs={confirmationPendingSlugs} />
    </div>
  );
}
