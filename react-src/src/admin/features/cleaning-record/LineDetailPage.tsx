import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useCleaningRecord } from "./CleaningRecordContext";
import { getFactoryName } from "../../../data/factories";
import { Toast } from "../../components/Toast";

const FREQUENCY_LABEL = { daily: "毎日", weekly: "毎週", monthly: "毎月", yearly: "毎年" } as const;

function formatPeriod(displayFrom?: string, displayTo?: string) {
  if (!displayFrom && !displayTo) return "指定なし（常に表示）";
  const from = displayFrom?.replaceAll("-", "/") ?? "";
  const to = displayTo?.replaceAll("-", "/") ?? "";
  return `${from}〜${to}`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-center w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{children}</div>
    </div>
  );
}

export function LineDetailPage() {
  const { factoryId, lineId } = useParams<{ factoryId: string; lineId: string }>();
  const { lines } = useCleaningRecord();
  const location = useLocation();
  const basePath = `/admin/ledger-management/cleaning-record/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const line = lines.find((l) => l.id === lineId);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (location.state?.justSaved) {
      setToastMessage("更新されました。");
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.justSaved]);

  if (!line) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">
          持ち場/ラインが見つかりません
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/cleaning-record" },
          { label: "持ち場/ライン選択", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-[270px]">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
          <Row label="アプリ表示期間">{formatPeriod(line.displayFrom, line.displayTo)}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          <Row label="持ち場/ライン名">{line.name}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          <Row label="点検頻度">{FREQUENCY_LABEL[line.frequency]}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          {line.cleaningPoints.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)]">
              清掃箇所は登録されていません
            </p>
          ) : (
            line.cleaningPoints.map((point, index) => (
              <div key={point.id} className="flex flex-col gap-2 w-full">
                <Row label="清掃箇所">{point.location}</Row>
                {point.items.map((item, i) => (
                  <Row key={i} label={i === 0 ? "清掃項目" : ""}>
                    {item}
                  </Row>
                ))}
                {index < line.cleaningPoints.length - 1 && (
                  <div className="border-t border-[#d0d0d0] w-full mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
