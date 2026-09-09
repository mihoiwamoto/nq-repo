import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Comments } from "../../components/Comments";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import type { WaterCheckResult } from "./types";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function StatusTag({ result }: { result: WaterCheckResult }) {
  const isAbnormal = result.status === "abnormal";
  return (
    <span
      className={`h-7 w-[88px] rounded-lg flex items-center justify-center text-base text-white ${
        isAbnormal ? "bg-[#f85c5c]" : "bg-[#19c95f]"
      }`}
    >
      {isAbnormal ? "異常あり" : "正常"}
    </span>
  );
}

function CheckRow({
  label,
  result,
  timestamp,
}: {
  label: string;
  result: WaterCheckResult;
  timestamp: string;
}) {
  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <div className="flex items-center justify-between w-full">
        <p className="text-xl text-[var(--semantic-text-primary)]">{label}</p>
        <StatusTag result={result} />
      </div>
      {result.status === "abnormal" && (
        <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
          <p>原因：{result.cause || "不明"}</p>
          <p>対応：{result.action || "記録なし"}</p>
        </div>
      )}
      <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
    </div>
  );
}

export function RecordDetailPage() {
  const { factoryId, pointId, recordId } = useParams<{
    factoryId: string;
    pointId: string;
    recordId: string;
  }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const location = pointId ? decodeURIComponent(pointId) : "";
  const basePath = `/admin/data-search/water-inspection/factories/${factoryId}/points/${pointId}`;

  const record = records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const timestamp = `${record.implementer} ${formatDate(record.date)} ${record.time}`;

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/water-inspection" },
          { label: "点検場所選択", to: `/admin/data-search/water-inspection/factories/${factoryId}` },
          { label: "データ一覧", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{location}</p>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">点検場所</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.location}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {formatDate(record.date)} {record.time}
            </p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <CheckRow label="味" result={record.taste} timestamp={timestamp} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow label="臭い" result={record.smell} timestamp={timestamp} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow label="色" result={record.color} timestamp={timestamp} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow label="濁り" result={record.turbidity} timestamp={timestamp} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow label="異物" result={record.foreignMatter} timestamp={timestamp} />
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-1 items-start w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">ph値</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.ph}</p>
            </div>
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-end w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">残留塩素濃度（mg/ℓ）</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.chlorine}</p>
            </div>
            {record.chlorineReplenished && (
              <span className="flex items-center gap-1 text-[#19c95f] text-base">
                <img src={iconCheckmark} alt="" className="size-4" />
                塩素補充
              </span>
            )}
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-end w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">UV殺菌灯稼働時間（h）</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.uvOperatingHours}</p>
            </div>
            {record.uvLampReplaced && (
              <span className="flex items-center gap-1 text-[#19c95f] text-base">
                <img src={iconCheckmark} alt="" className="size-4" />
                UV殺菌灯交換
              </span>
            )}
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-1 items-start w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">UV表示灯</p>
              <p
                className={`text-xl ${
                  record.uvIndicatorLight === "off"
                    ? "text-[var(--semantic-brand-danger)]"
                    : "text-[var(--semantic-text-primary)]"
                }`}
              >
                {record.uvIndicatorLight === "on" ? "点灯" : "消灯"}
              </p>
            </div>
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-1 items-start w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">異常検出灯</p>
              <p
                className={`text-xl ${
                  record.abnormalDetectionLight === "on"
                    ? "text-[var(--semantic-brand-danger)]"
                    : "text-[var(--semantic-text-primary)]"
                }`}
              >
                {record.abnormalDetectionLight === "on" ? "点灯" : "消灯"}
              </p>
            </div>
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
        </div>
      </div>
    </div>
  );
}
