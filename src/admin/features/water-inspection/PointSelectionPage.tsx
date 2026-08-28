import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useWaterInspection } from "./WaterInspectionContext";
import { getFactoryName } from "../../../data/factories";

function isCurrentlyDisplayed(displayFrom?: string, displayTo?: string) {
  if (!displayFrom && !displayTo) return true;
  const today = new Date().toISOString().slice(0, 10);
  if (displayFrom && today < displayFrom) return false;
  if (displayTo && today > displayTo) return false;
  return true;
}

export function PointSelectionPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { points } = useWaterInspection();
  const [visibility, setVisibility] = useState<"visible" | "hidden">("visible");

  const factoryName = getFactoryName(factoryId);
  const factoryPoints = points.filter((point) => point.factoryId === factoryId);
  const visibleCount = factoryPoints.filter((point) =>
    isCurrentlyDisplayed(point.displayFrom, point.displayTo)
  ).length;
  const filteredPoints = factoryPoints.filter((point) => {
    const displayed = isCurrentlyDisplayed(point.displayFrom, point.displayTo);
    return visibility === "visible" ? displayed : !displayed;
  });

  return (
    <div>
      <PageTitleBar
        title="使用水の点検"
        showBack
        action={
          <Link
            to={`/admin/ledger-management/water-inspection/factories/${factoryId}/points/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/water-inspection" },
          { label: "点検場所選択" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex items-center border-b-2 border-[#d0d0d0] w-full">
          {(["visible", "hidden"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setVisibility(key)}
              className={`relative h-12 w-[156px] flex items-center justify-center border-b-2 text-xl ${
                visibility === key
                  ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                  : "border-transparent text-[var(--semantic-text-secondary)]"
              }`}
            >
              {key === "visible" ? "アプリ表示中" : "アプリ非表示"}
              {key === "visible" && visibleCount > 0 && (
                <span className="absolute -top-2 left-[122px] bg-[var(--semantic-brand-danger)] text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {visibleCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-6">
          {filteredPoints.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)]">
              該当する点検場所がありません
            </p>
          ) : (
            filteredPoints.map((point) => (
              <Link
                key={point.id}
                to={`/admin/ledger-management/water-inspection/factories/${factoryId}/points/${point.id}`}
                className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-[270px] flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
              >
                {point.name}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
