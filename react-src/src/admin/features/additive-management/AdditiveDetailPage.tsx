import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { getFactoryName } from "../../../data/factories";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";

export function AdditiveDetailPage() {
  const { factoryId, additiveId } = useParams<{ factoryId: string; additiveId: string }>();
  const { additives, removeAdditive } = useAdditiveManagement();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const additive = additives.find((item) => item.id === additiveId);
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/additive-management/factories/${factoryId}`;

  useEffect(() => {
    if (location.state?.justSaved) {
      setToastMessage("更新されました。");
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (location.state?.deleted) {
      setToastMessage("削除されました。");
      setShowToast(true);
    }
  }, [location.state?.justSaved, location.state?.deleted]);

  function handleDelete() {
    if (!additive) return;
    removeAdditive(additive.id);
    setDeleteDialogOpen(false);
    navigate(`${basePath}/additives/deleted`, { state: { deleted: true } });
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/additive-management" },
          { label: "添加物選択", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="bg-white inline-flex items-center px-4 py-2 rounded-lg self-start">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex items-center justify-end w-full gap-2">
          <Link
            to={`${basePath}/additives/${additiveId}/edit`}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
            <img src={iconEdit} alt="編集" className="size-5" />
            編集
          </Link>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
          >
            <img src={iconTrash} alt="削除" className="size-6" />
          </button>
        </div>

        <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center w-full gap-4 py-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">添加物名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{additive?.name}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center w-full gap-4 py-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">規格</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {additive?.spec}
              {additive?.unit}
            </p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center w-full gap-4 py-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">保管場所</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {additive?.storageLocation}
            </p>
          </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {additive?.name}の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
