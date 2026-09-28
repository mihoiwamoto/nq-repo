import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import type { AdditiveRecord } from "./mockData";

export function RecordDetailPage() {
  const { productId, recordId } = useParams<{ productId: string; recordId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { additives, records } = useAdditiveManagement();

  /** 確認画面から来た未保存の記録は state 経由で受け取る */
  const pendingRecord = (location.state as { record?: AdditiveRecord } | null)?.record;
  const record = records.find((r) => r.id === recordId) ?? pendingRecord;
  const additive = additives.find((a) => a.id === (record?.additiveId ?? productId));

  if (!record || !additive) {
    return (
      <>
        <AppHeader title="添加物管理" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            記録が見つかりません。記録一覧画面から操作してください。
          </p>
          <Link
            to={`/app/ledger-list/additive-management/products/${productId ?? ""}`}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white flex items-center justify-center"
          >
            記録一覧に戻る
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title={`添加物管理_${additive.name}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.date}</p>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">保管場所</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.storageLocation}</p>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">規格</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{additive.spec}</p>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">元在庫数</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{additive.initialStock}</p>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">区分</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.category}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">数量</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.quantity}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">現在庫数</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.currentStock}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base text-[var(--semantic-text-secondary)]">{record.remarks}</p>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
      </div>
    </>
  );
}
