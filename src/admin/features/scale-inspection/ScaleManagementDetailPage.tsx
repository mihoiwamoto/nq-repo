import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Toast } from "../../components/Toast";
import { useScaleInspection } from "./ScaleInspectionContext";
import { getFactoryName } from "../../../data/factories";
import { SCALE_REPAIR_STATUS_COLORS, SCALE_REPAIR_STATUS_LABELS, type ScaleRepairStatus } from "./types";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

const REPAIR_STATUS_OPTIONS: ScaleRepairStatus[] = ["action_needed", "repairing", "done"];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 items-center w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{value}</div>
    </div>
  );
}

export function ScaleManagementDetailPage() {
  const { factoryId, scaleId } = useParams<{ factoryId: string; scaleId: string }>();
  const { scales, posts, removeScale, setScaleRepairStatus } = useScaleInspection();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = `/admin/ledger-management/scale-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const scale = scales.find((s) => s.id === scaleId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.justSaved) {
      setShowUpdateToast(true);
    }
    if ((location.state as any)?.deleted) {
      setShowDeleteToast(true);
    }
  }, [location.state]);

  if (!scale) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">秤が見つかりません</p>
      </div>
    );
  }

  const postName = posts.find((p) => p.id === scale.postId)?.name ?? "未設定";

  function handleDelete() {
    removeScale(scale!.id);
    setDeleteDialogOpen(false);
    navigate(`${basePath}/scale-management/deleted`, { state: { deleted: true } });
  }

  return (
    <div>
      <PageTitleBar title="秤管理" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/scale-inspection" },
          { label: "秤点検記録設定", to: basePath },
          { label: "秤管理", to: `${basePath}/scale-management` },
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
            onClick={() => navigate(`${basePath}/scale-management/${scale.id}/edit`)}
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
          <Row label="秤No.(ラベル名)" value={scale.label} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="シリアルナンバー" value={scale.serialNumber} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="秤量(kg)" value={String(scale.weightCapacity)} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="動作確認" value={scale.recordOperationCheck ? "記録する" : "記録しない"} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="水平点検" value={scale.recordLevelCheck ? "記録する" : "記録しない"} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="汚れ" value={scale.recordDirtCheck ? "記録する" : "記録しない"} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="秤の表示値(g)" value={scale.recordDisplayValue ? "記録する" : "記録しない"} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="使用分銅(g)" value={String(scale.referenceWeight)} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="最小表示単位(g)" value={String(scale.minDisplayUnit)} />
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">秤の持ち場割り当て</p>
          <div className="bg-white flex items-center w-full px-4 py-6 rounded-lg">
            <Row label="持ち場" value={postName} />
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            異常があった箇所は、その後の対応状況に応じてステータスを更新してください。修理が完了した場合は「対応完了」ステータスに変更してください。
          </p>
          <div className="bg-white flex items-center justify-between w-full px-4 py-6 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{scale.label}</p>
            <Pulldown
              value={scale.repairStatus ?? ""}
              onChange={(value) =>
                setScaleRepairStatus(scale.id, value ? (value as ScaleRepairStatus) : null)
              }
              options={REPAIR_STATUS_OPTIONS.map((opt) => ({ value: opt, label: SCALE_REPAIR_STATUS_LABELS[opt] }))}
              placeholder="異常なし"
              className="h-10 px-4 rounded-lg text-sm text-white"
              style={{
                backgroundColor: scale.repairStatus ? SCALE_REPAIR_STATUS_COLORS[scale.repairStatus] : "#808080",
              }}
            />
          </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {scale.label}の削除
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

      {showUpdateToast && <Toast message="更新されました。" onClose={() => setShowUpdateToast(false)} />}
      {showDeleteToast && <Toast message="削除されました。" onClose={() => setShowDeleteToast(false)} />}
    </div>
  );
}
