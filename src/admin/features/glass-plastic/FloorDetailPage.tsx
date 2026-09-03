import { useState, useEffect, type ReactNode } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { useGlassPlastic } from "./GlassPlasticContext";
import { getFactoryName } from "../../../data/factories";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconPulldown from "../../../assets/figma/icons/common/pulldown.svg";
import { FloorPlanPreview } from "./FloorPlanPreview";
import {
  REPAIR_STATUS_COLORS,
  REPAIR_STATUS_LABELS,
  REPAIR_STATUS_ORDER,
  type RepairItem,
  type RepairStatus,
} from "./types";

function formatPeriod(displayFrom?: string, displayTo?: string) {
  if (!displayFrom && !displayTo) return "指定なし（常に表示）";
  const from = displayFrom?.replaceAll("-", "/") ?? "";
  const to = displayTo?.replaceAll("-", "/") ?? "";
  return `${from}〜${to}`;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 items-center w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{children}</div>
    </div>
  );
}

function RepairStatusDropdown({
  status,
  onChange,
}: {
  status: RepairStatus;
  onChange: (status: RepairStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-24 px-2 rounded-lg flex items-center justify-between text-sm text-white"
        style={{ backgroundColor: REPAIR_STATUS_COLORS[status] }}
      >
        {REPAIR_STATUS_LABELS[status]}
        <span
          aria-hidden
          className="inline-block size-3 shrink-0"
          style={{
            WebkitMaskImage: `url("${iconPulldown}")`,
            maskImage: `url("${iconPulldown}")`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            backgroundColor: "currentColor",
          }}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white shadow-[0px_0px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col p-2 w-40">
            {REPAIR_STATUS_ORDER.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`h-[42px] rounded-lg flex items-center px-2 text-base text-left ${
                  option === status
                    ? "bg-[var(--semantic-brand-primary)] text-white"
                    : "text-[var(--semantic-text-primary)]"
                }`}
              >
                {REPAIR_STATUS_LABELS[option]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function groupByRoom(items: RepairItem[]) {
  const rooms: { room: string; items: RepairItem[] }[] = [];
  for (const item of items) {
    let group = rooms.find((r) => r.room === item.room);
    if (!group) {
      group = { room: item.room, items: [] };
      rooms.push(group);
    }
    group.items.push(item);
  }
  return rooms;
}

export function FloorDetailPage() {
  const { factoryId, floorId } = useParams<{ factoryId: string; floorId: string }>();
  const { floors, removeFloor, updateRepairStatus } = useGlassPlastic();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = `/admin/ledger-management/glass-plastic/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const floor = floors.find((f) => f.id === floorId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.deleted) {
      setShowToast(true);
    }
  }, [location.state]);

  if (!floor) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">点検場所が見つかりません</p>
      </div>
    );
  }

  function handleDelete() {
    removeFloor(floor!.id);
    setDeleteDialogOpen(false);
    navigate(`${basePath}/floors/deleted`, { state: { deleted: true } });
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/glass-plastic" },
          { label: "点検場所選択", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
            <p className="text-sm text-[var(--semantic-text-secondary)]">
              異常があった箇所は、その後の対応状況に応じてステータスを更新してください。修理が完了した場合は「修理完了」ステータスに変更してください。
            </p>
          </div>
          <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
            {floor.repairItems.length === 0 ? (
              <p className="text-base text-[var(--semantic-text-secondary)]">
                現在、対応が必要な箇所はありません
              </p>
            ) : (
              groupByRoom(floor.repairItems).map((group) => (
                <div key={group.room} className="flex flex-col gap-2 items-start w-full">
                  <p className="text-base text-[var(--semantic-brand-primary)]">{group.room}</p>
                  <div className="flex flex-col gap-2 items-start w-full">
                    {group.items.map((item, index) => (
                      <div key={item.id} className="flex flex-col gap-1 items-start w-full">
                        <div className="flex gap-4 items-center w-full">
                          <p className="flex-1 text-base text-[var(--semantic-text-primary)]">
                            {item.name}
                          </p>
                          <RepairStatusDropdown
                            status={item.status}
                            onChange={(status) => updateRepairStatus(floor.id, item.id, status)}
                          />
                        </div>
                        <div className="flex flex-col gap-2 items-start px-2 text-base text-[var(--semantic-text-secondary)]">
                          <p>内容：{item.content}</p>
                          <p>原因：{item.cause}</p>
                          <p>
                            対応：{item.actionType}
                            {item.actionDetail && (
                              <>
                                <br />
                                {item.actionDetail}
                              </>
                            )}
                          </p>
                        </div>
                        {index < group.items.length - 1 && (
                          <div className="border-t border-[#d0d0d0] w-full mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end w-full">
          <div className="flex gap-2 items-center">
            <Link
              to={`${basePath}/floors/${floorId}/edit`}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
            >
              ✎ 編集
            </Link>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
            >
              <img src={iconTrash} alt="削除" className="size-6" />
            </button>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
          <Row label="フロア名">{floor.name}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          <Row label="アプリ表示期間">{formatPeriod(floor.displayFrom, floor.displayTo)}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          <Row label="配置図">
            {floor.planImageUrl ? (
              <FloorPlanPreview
                imageUrl={floor.planImageUrl}
                items={floor.mapItems}
                alt={`${floor.name}の配置図`}
              />
            ) : (
              "未設定"
            )}
          </Row>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                ガラスプラスチック管理を削除
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

      {showToast && <Toast message="削除されました。" onClose={() => setShowToast(false)} />}
    </div>
  );
}
