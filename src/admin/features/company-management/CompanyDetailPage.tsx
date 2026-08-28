import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useCompanyManagement } from "./CompanyManagementContext";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";
import iconXMark from "../../../assets/figma/icons/common/x-mark.svg";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 items-center w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{value}</div>
    </div>
  );
}

export function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { companies, removeCompany } = useCompanyManagement();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const company = companies.find((c) => c.id === companyId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showUpdatedToast, setShowUpdatedToast] = useState(
    Boolean((routerLocation.state as { justUpdated?: boolean } | null)?.justUpdated)
  );

  useEffect(() => {
    if (!showUpdatedToast) return;
    const timer = setTimeout(() => setShowUpdatedToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showUpdatedToast]);

  if (!company) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">企業が見つかりません</p>
      </div>
    );
  }

  function handleDelete() {
    removeCompany(company!.id);
    navigate("/admin/company/deleted");
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "企業管理", to: "/admin/company" },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="flex items-center justify-end w-full gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/company/${company.id}/edit`)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
            ✎ 編集
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
          >
            <img src={iconTrash} alt="削除" className="size-6" />
          </button>
        </div>
        <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
          <Row label="企業名" value={company.name} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="企業住所" value={company.address} />
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                企業情報を削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。削除しますか？
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

      {showUpdatedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex items-center gap-2 px-4 py-3 w-[340px]">
          <img src={iconCheckmark} alt="" className="size-5" />
          <p className="text-sm text-[var(--semantic-text-primary)] flex-1">企業が更新されました</p>
          <button
            type="button"
            onClick={() => setShowUpdatedToast(false)}
            className="text-[var(--semantic-text-secondary)]"
          >
            <img src={iconXMark} alt="閉じる" className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
