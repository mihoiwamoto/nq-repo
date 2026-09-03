import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useWaterInspection } from "./WaterInspectionContext";
import { getFactoryName } from "../../../data/factories";
import { WATER_INSPECTION_FORM_FIELDS } from "./types";
import { Toast } from "../../components/Toast";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";

function formatPeriod(displayFrom?: string, displayTo?: string) {
  if (!displayFrom && !displayTo) return "指定なし（常に表示）";
  const from = displayFrom?.replaceAll("-", "/") ?? "";
  const to = displayTo?.replaceAll("-", "/") ?? "";
  return `${from}〜${to}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 items-center w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{value}</div>
    </div>
  );
}

export function PointDetailPage() {
  const { factoryId, pointId } = useParams<{ factoryId: string; pointId: string }>();
  const { points, removePoint } = useWaterInspection();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = `/admin/ledger-management/water-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const point = points.find((p) => p.id === pointId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.justSaved) {
      setShowUpdateToast(true);
    }
  }, [location.state]);

  if (!point) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">点検場所が見つかりません</p>
      </div>
    );
  }

  function handleDelete() {
    removePoint(point!.id);
    setShowToast(true);
    navigate(basePath);
  }

  return (
    <div>
      <PageTitleBar title="使用水の点検" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/water-inspection" },
          { label: "点検場所選択", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex items-center justify-end w-full gap-2">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/points/${point.id}/edit`)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
            ✎ 編集
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
          >
            <img src={iconTrash} alt="削除" className="size-6" />
          </button>
        </div>

        <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
          <Row label="点検場所" value={point.name} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="アプリ表示期間" value={formatPeriod(point.displayFrom, point.displayTo)} />
          <div className="border-t border-[#d0d0d0] w-full" />
          {WATER_INSPECTION_FORM_FIELDS.map((field, index) => (
            <div key={field.key} className="flex flex-col gap-6 w-full">
              <Row
                label={field.label}
                value={field.type === "text" ? point.uvAlertHours : point.checks[field.key] ? "記録する" : "記録しない"}
              />
              {index < WATER_INSPECTION_FORM_FIELDS.length - 1 && (
                <div className="border-t border-[#d0d0d0] w-full" />
              )}
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
                使用水の点検を削除
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

      {showUpdateToast && <Toast message="更新されました。" onClose={() => setShowUpdateToast(false)} />}
      {showToast && <Toast message="削除されました。" onClose={() => setShowToast(false)} />}
    </div>
  );
}
