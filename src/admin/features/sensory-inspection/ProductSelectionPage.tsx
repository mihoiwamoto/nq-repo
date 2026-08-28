import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useSensoryInspection } from "./SensoryInspectionContext";
import { CRITERIA, CRITERION_STYLES } from "./types";

function CriteriaLabelList() {
  return (
    <div className="flex gap-[2px] items-start shrink-0">
      {CRITERIA.map((criterion) => {
        const style = CRITERION_STYLES[criterion];
        return (
          <div
            key={criterion}
            className="flex items-center justify-center px-1.5 py-0.5 rounded-full w-10 shrink-0"
            style={{ backgroundColor: style.bg }}
          >
            <p className="text-xs leading-none whitespace-nowrap" style={{ color: style.text }}>
              {criterion}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function ProductSelectionPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { products } = useSensoryInspection();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/sensory-inspection/factories/${factoryId}`;

  return (
    <div>
      <PageTitleBar
        title="検査製品選択"
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
          { label: "工場選択", to: "/admin/ledger-management/sensory-inspection" },
          { label: "検査製品選択" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-[270px]">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <div className="flex flex-col gap-1 items-start">
            <p className="text-2xl text-[var(--semantic-text-primary)]">点検予定</p>
            <p className="text-sm text-[var(--semantic-text-primary)]">
              検査する製品の予定を組む場合はこちらから。
            </p>
          </div>
          <Link
            to={`${basePath}/schedule`}
            className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
          >
            点検予定
          </Link>
        </div>

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-2xl text-[var(--semantic-text-primary)]">検査製品一覧</p>
          <div className="flex flex-col gap-6 items-start w-full">
            {products.length === 0 ? (
              <p className="text-base text-[var(--semantic-text-secondary)]">
                登録された製品がありません
              </p>
            ) : (
              products.map((product) => (
                <Link
                  key={product.id}
                  to={`${basePath}/products/${product.id}`}
                  className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 rounded-lg flex gap-10 items-center px-6 w-full"
                >
                  <p className="flex-1 text-lg text-[var(--semantic-text-primary)]">{product.name}</p>
                  <CriteriaLabelList />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
