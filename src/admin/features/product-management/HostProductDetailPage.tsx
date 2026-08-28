import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { HOST_PRODUCTS } from "../../../data/products";

export function HostProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const product = HOST_PRODUCTS.find((item) => item.id === productId);

  const rows: [string, string | undefined][] = [
    ["製品コード", product?.productCode],
    ["製品名", product?.name],
    ["内容量", product ? String(product.quantity) : undefined],
    ["内容量単位", product?.quantityUnit],
    ["工場名", getFactoryName(product?.factoryId)],
    ["賞味期限", product?.expiry],
  ];

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb items={[{ label: "製品管理", to: "/admin/products" }, { label: "詳細" }]} />
      <div className="flex flex-col gap-4 items-start p-6">
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
    </div>
  );
}
