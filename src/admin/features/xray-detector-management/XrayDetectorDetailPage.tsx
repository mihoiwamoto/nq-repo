import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { useXrayDetector } from "./XrayDetectorContext";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

const SETTING_COLUMNS: { key: "settingNumber" | "susBall" | "susWire" | "glassBall" | "ceramic" | "rubberBall"; label: string }[] = [
  { key: "settingNumber", label: "設定番号" },
  { key: "susBall", label: "Sus球" },
  { key: "susWire", label: "Sus線" },
  { key: "glassBall", label: "ガラス球" },
  { key: "ceramic", label: "セラミック" },
  { key: "rubberBall", label: "ゴム球" },
];

export function XrayDetectorDetailPage() {
  const { factoryId, unitId } = useParams<{ factoryId: string; unitId: string }>();
  const { units, removeUnit } = useXrayDetector();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const unit = units.find((u) => u.id === unitId);

  useEffect(() => {
    if (location.state?.justSaved) {
      setToastMessage("更新されました。");
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (location.state?.deleted) {
      setToastMessage("削除されました。");
      setShowToast(true);
    }
  }, [location.state?.justSaved, location.state?.deleted]);

  if (!unit) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  function handleDelete() {
    if (!unit) return;
    removeUnit(unit.id);
    setDeleteDialogOpen(false);
    navigate(`${basePath}/xray-detectors/deleted`, { state: { deleted: true } });
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/metal-xray-detection" },
          { label: "金属/X線探知機記録", to: basePath },
          { label: "X線探知機管理", to: `${basePath}/xray-detectors` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="flex items-center justify-end w-full gap-2">
          <Link
            to={`${basePath}/xray-detectors/${unit.id}/edit`}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
            編集
          </Link>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
          >
            <img src={iconTrash} alt="削除" className="size-6" />
          </button>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">X線探知機名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{unit.name}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">設定番号/テストピース設定</p>
          <div className="flex flex-col items-start rounded-lg overflow-hidden w-full">
            <div className="bg-[#f6f6f6] flex h-[50px] items-center w-full">
              <div className="flex-1 flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">製品名/規格</p>
              </div>
              {SETTING_COLUMNS.map((col) => (
                <div key={col.key} className="w-[120px] flex items-center justify-center p-2 h-full">
                  <p className="text-sm text-[var(--semantic-brand-primary)]">{col.label}</p>
                </div>
              ))}
            </div>
            {unit.settings.length === 0 ? (
              <div className="bg-white flex items-center justify-center w-full py-6">
                <p className="text-base text-[var(--semantic-text-secondary)]">設定がありません</p>
              </div>
            ) : (
              unit.settings.map((row, index) => (
                <div
                  key={row.id}
                  className={`flex items-center w-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                >
                  <div className="flex-1 p-2">
                    <p className="text-base text-[var(--semantic-text-primary)] px-4 py-2">
                      {row.productName}
                    </p>
                  </div>
                  {SETTING_COLUMNS.map((col) => (
                    <div key={col.key} className="w-[120px] p-2">
                      <p className="text-base text-[var(--semantic-text-primary)] px-4 py-2">
                        {row[col.key] || "ー"}
                      </p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {unit.name}の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
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

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
