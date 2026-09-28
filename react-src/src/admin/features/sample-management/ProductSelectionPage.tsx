import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useSampleManagement } from "./SampleManagementContext";

export function ProductSelectionPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { products } = useSampleManagement();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/sample-management/factories/${factoryId}`;

  return (
    <div>
      <PageTitleBar
        title="検体管理"
        showBack
        action={
          <Link
            to={`${basePath}/products/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/sample-management" },
          { label: "検体管理" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-[270px]">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm text-[var(--semantic-text-primary)]">
            検体製品の予定を組む場合はこちら
          </p>
          <Link
            to={`${basePath}/schedule`}
            className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
          >
            点検予定
          </Link>
        </div>

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-2xl text-[var(--semantic-text-primary)]">検体対象製品一覧</p>
          <div className="flex flex-col gap-6 items-start w-full">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`${basePath}/products/${product.id}`}
                className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 rounded-lg flex items-center px-6 text-lg text-[var(--semantic-text-primary)] w-full"
              >
                {product.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
