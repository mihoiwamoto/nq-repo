import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useProductManagement } from "./ProductManagementContext";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

export function NqProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { nqProducts, removeNqProduct } = useProductManagement();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showUpdatedToast, setShowUpdatedToast] = useState(
    Boolean((routerLocation.state as { justUpdated?: boolean } | null)?.justUpdated)
  );

  const product = nqProducts.find((item) => item.id === productId);

  useEffect(() => {
    if (!showUpdatedToast) return;
    const timer = setTimeout(() => setShowUpdatedToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showUpdatedToast]);

  function handleDelete() {
    if (!product) return;
    removeNqProduct(product.id);
    navigate("/admin/products/nq/deleted");
  }

  const rows: [string, string | undefined][] = [
    ["製品名", product?.name],
    ["内容量", product?.quantity],
    ["内容量単位", product?.quantityUnit],
    ["工場名", getFactoryName(product?.factoryId)],
    ["賞味期限", product?.expiry],
  ];

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb items={[{ label: "製品管理", to: "/admin/products?tab=nq" }, { label: "詳細" }]} />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="flex items-center justify-end w-full gap-2">
          <Link
            to={`/admin/products/nq/${productId}/edit`}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
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
          {rows.map(([label, value], index) => (
            <div key={label} className="flex flex-col w-full">
              {index > 0 && <div className="border-t border-[#d0d0d0] w-full" />}
              <div className="flex items-center w-full gap-4 py-4">
                <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">{label}</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {product?.name}を削除
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
          <span className="text-[var(--semantic-brand-primary)] text-xl">✓</span>
          <p className="text-sm text-[var(--semantic-text-primary)]">更新されました。</p>
        </div>
      )}
    </div>
  );
}
