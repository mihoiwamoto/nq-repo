import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { getFactoryName } from "../../../data/factories";
import { storageOriginCrumbs, useStorageManagement } from "./StorageManagementContext";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

export function StorageDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const { storageLocations, origin, removeStorageLocation } = useStorageManagement();
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const location = storageLocations.find((item) => item.id === locationId);

  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if ((routeLocation.state as any)?.justSaved) {
      setShowUpdateToast(true);
    }
  }, [routeLocation.state]);

  /* 本番どおり 詳細のごみ箱 → 確認ダイアログ → 削除完了（2026-10-08） */
  function handleDelete() {
    if (!locationId) return;
    removeStorageLocation(locationId);
    setDeleteDialogOpen(false);
    navigate("/admin/storage/deleted");
  }

  return (
    <div>
      {showUpdateToast && <Toast message="更新しました。" onClose={() => setShowUpdateToast(false)} />}
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          ...storageOriginCrumbs(origin),
          { label: "保管場所管理", to: "/admin/storage" },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 items-start p-6">
        {/* 確定デザイン 7139:162525：「編集」の段からカードまで 8px、カードの内側の左右 16px（2026-10-08） */}
        <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-end w-full gap-2">
          <Link
            to={`/admin/storage/${locationId}/edit`}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
            <img src={iconEdit} alt="編集" className="size-5" />
            編集
          </Link>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
          >
            <img src={iconTrash} alt="削除" className="size-6" />
          </button>
        </div>
        {/* 本番どおり 工場は「工場名」の行で出す（以前は上の札。2026-10-08） */}
        <div className="bg-white rounded-lg w-full px-4">
          <div className="flex items-center py-6 gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">工場名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{getFactoryName(location?.factoryId)}</p>
          </div>
          <div className="h-px bg-[#d0d0d0] w-full" />
          <div className="flex items-center py-6 gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">保管場所</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{location?.name}</p>
          </div>
        </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl leading-[34px] text-[var(--semantic-text-primary)] text-center w-full">
                保管場所情報を削除
              </h2>
              <p className="text-base leading-[26px] font-normal text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
