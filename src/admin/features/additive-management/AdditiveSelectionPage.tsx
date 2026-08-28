import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useAdditiveManagement } from "./AdditiveManagementContext";

export function AdditiveSelectionPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { additives } = useAdditiveManagement();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/additive-management/factories/${factoryId}`;

  return (
    <div>
      <PageTitleBar
        title="添加物管理"
        showBack
        action={
          <Link
            to={`${basePath}/additives/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/additive-management" },
          { label: "添加物選択" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white inline-flex items-center px-4 py-2 rounded-lg self-start">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm text-[var(--semantic-text-primary)]">
            保管場所の追加、削除はこちら
          </p>
          <Link
            to="/admin/storage"
            className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
          >
            保管場所管理
          </Link>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-2xl text-[var(--semantic-text-primary)]">添加物一覧</p>
          <div className="flex flex-col gap-6 items-start w-full">
            {additives.map((additive) => (
              <Link
                key={additive.id}
                to={`${basePath}/additives/${additive.id}`}
                className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 rounded-lg flex items-center px-4 text-lg text-black w-full"
              >
                {additive.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
