import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { FRAME } from "../../../frameBridge";
import { getFactoryName } from "../../../data/factories";
import { useChemicalManagement } from "./ChemicalManagementContext";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";

export function ChemicalDetailPage() {
  const { factoryId, chemicalId } = useParams<{ factoryId: string; chemicalId: string }>();
  const { chemicals, removeChemical } = useChemicalManagement();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const chemical = chemicals.find((item) => item.id === chemicalId);
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/chemical-management/factories/${factoryId}`;

  useEffect(() => {
    if (location.state?.justSaved) {
      setToastMessage("更新されました。");
      setShowToast(true);
      // 画面設計の枠の中では消さない（ユースケースの再生でトーストを囲んで見せるため。Toast も同じ。2026-10-05）
      if (FRAME) return;
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
    if (!chemical) return;
    removeChemical(chemical.id);
    setDeleteDialogOpen(false);
    navigate(`${basePath}/chemicals/deleted`, { state: { deleted: true, name: chemical.name } });
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/chemical-management" },
          { label: "薬品選択", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="bg-white inline-flex items-center min-w-[270px] px-4 py-2 rounded-lg self-start">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        {/* 確定デザイン：「編集」の段から詳細のカードまでは 8px（機械器具点検は 16px のまま。2026-10-08） */}
        <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-end w-full gap-2">
          <Link
            to={`${basePath}/chemicals/${chemicalId}/edit`}
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

        {/* 確定デザイン（7139:162715・7139:163565）：行と区切り線の間は 24px（行の間 76px）、名前の値は 18px（2026-10-08） */}
        <div className="bg-white flex flex-col gap-[23.5px] items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center w-full gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">薬品名</p>
            <p className="text-lg text-[var(--semantic-text-primary)]">{chemical?.name}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center w-full gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">規格</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {chemical?.spec}
              {chemical?.unit}
            </p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center w-full gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">保管場所</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {chemical?.storageLocation}
            </p>
          </div>
        </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {chemical?.name}の削除
              </h2>
              <p className="text-base font-normal text-[var(--semantic-text-primary)]">
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

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
