import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useGlassPlastic } from "./GlassPlasticContext";
import { getFactoryName } from "../../../data/factories";

function isCurrentlyDisplayed(displayFrom?: string, displayTo?: string) {
  if (!displayFrom && !displayTo) return true;
  const today = new Date().toISOString().slice(0, 10);
  if (displayFrom && today < displayFrom) return false;
  if (displayTo && today > displayTo) return false;
  return true;
}

export function FloorSelectionPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { floors } = useGlassPlastic();
  const [visibility, setVisibility] = useState<"visible" | "hidden">("visible");

  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/glass-plastic/factories/${factoryId}`;

  const filteredFloors = floors.filter((floor) => {
    const displayed = isCurrentlyDisplayed(floor.displayFrom, floor.displayTo);
    return visibility === "visible" ? displayed : !displayed;
  });

  return (
    <div>
      <PageTitleBar
        title="点検場所選択"
        showBack
        action={
          <Link
            to={`${basePath}/floors/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/glass-plastic" },
          { label: "点検場所選択" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center border-b-2 border-[#d0d0d0] w-full">
            {(["visible", "hidden"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setVisibility(key)}
                className={`h-12 w-[156px] flex items-center justify-center border-b-2 text-xl ${
                  visibility === key
                    ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                    : "border-transparent text-[var(--semantic-text-secondary)]"
                }`}
              >
                {key === "visible" ? "アプリ表示中" : "アプリ非表示"}
              </button>
            ))}
          </div>

          {filteredFloors.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)]">
              該当する点検場所がありません
            </p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {filteredFloors.map((floor) => (
                <Link
                  key={floor.id}
                  to={`${basePath}/floors/${floor.id}`}
                  className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-[270px] flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
                >
                  {floor.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
