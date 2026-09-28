import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";

export function PointSelectionPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/water-inspection/factories/${factoryId}`;

  const locations = useMemo(() => Array.from(new Set(records.map((r) => r.location))), [records]);

  return (
    <div>
      <PageTitleBar title="点検場所選択" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/water-inspection" },
          { label: "点検場所選択" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {locations.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)]">
              該当する点検場所がありません
            </p>
          ) : (
            locations.map((location) => (
              <Link
                key={location}
                to={`${basePath}/points/${encodeURIComponent(location)}`}
                className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-[270px] flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
              >
                {location}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
