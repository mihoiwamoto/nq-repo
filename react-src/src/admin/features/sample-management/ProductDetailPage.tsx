import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useSampleManagement } from "./SampleManagementContext";
import { Toast } from "../../components/Toast";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

export function ProductDetailPage() {
  const { factoryId, productId } = useParams<{ factoryId: string; productId: string }>();
  const { products, removeProduct } = useSampleManagement();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const product = products.find((item) => item.id === productId);
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/sample-management/factories/${factoryId}`;

  useEffect(() => {
    if ((location.state as any)?.deleted) {
      setShowToast(true);
    }
  }, [location.state]);

  function handleDelete() {
    if (!product) return;
    removeProduct(product.id);
    setDeleteDialogOpen(false);
    navigate(`${basePath}/products/deleted`, { state: { deleted: true } });
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/sample-management" },
          { label: "検体管理", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="bg-white inline-flex items-center px-4 py-2 rounded-lg self-start">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex items-center justify-end w-full">
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
          >
            <img src={iconTrash} alt="削除" className="size-6" />
          </button>
        </div>

        <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center w-full gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">製品名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{product?.name}</p>
          </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {product?.name}の削除
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
      {showToast && <Toast message="削除されました。" onClose={() => setShowToast(false)} />}
    </div>
  );
}
