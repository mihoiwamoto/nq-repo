import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSchedule } from "./ScheduleContext";
import { getFactoryName } from "../../../data/factories";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

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
  const { lines, updateLineDisplayPeriod, removeLine } = useSchedule();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/equipment-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const line = lines.find((l) => l.id === lineId);

  const [editing, setEditing] = useState(false);
  const [displayFrom, setDisplayFrom] = useState(line?.displayFrom ?? "");
  const [displayTo, setDisplayTo] = useState(line?.displayTo ?? "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!line) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">
          持ち場/ラインが見つかりません
        </p>
      </div>
    );
  }

  function handleSave() {
    updateLineDisplayPeriod(line!.id, displayFrom || undefined, displayTo || undefined);
    setEditing(false);
  }

  function handleDelete() {
    removeLine(line!.id);
    navigate(basePath);
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/equipment-inspection" },
          { label: "持ち場/ライン選択", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-[270px]">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex justify-end w-full">
          {editing ? (
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => {
                  setDisplayFrom(line.displayFrom ?? "");
                  setDisplayTo(line.displayTo ?? "");
                  setEditing(false);
                }}
                className="bg-white h-10 px-4 rounded-lg text-sm text-[var(--semantic-text-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-[var(--semantic-brand-primary)] h-10 px-4 rounded-lg text-sm text-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)]"
              >
                保存
              </button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setEditing(true)}
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
          )}
        </div>

        <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
          {editing ? (
            <Row label="アプリ表示期間">
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={displayFrom}
                  onChange={(e) => setDisplayFrom(e.target.value)}
                  className="bg-white border border-[#d0d0d0] h-10 px-2 rounded-lg text-base text-[var(--semantic-text-primary)]"
                />
                <span>〜</span>
                <input
                  type="date"
                  value={displayTo}
                  onChange={(e) => setDisplayTo(e.target.value)}
                  className="bg-white border border-[#d0d0d0] h-10 px-2 rounded-lg text-base text-[var(--semantic-text-primary)]"
                />
              </div>
            </Row>
          ) : (
            <Row label="アプリ表示期間">{formatPeriod(line.displayFrom, line.displayTo)}</Row>
          )}
          <div className="border-t border-[#d0d0d0] w-full" />

          <Row label="持ち場/ライン名">{line.name}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          <Row label="点検頻度">{FREQUENCY_LABEL[line.frequency]}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          {line.inspectionPoints.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)]">
              点検箇所は登録されていません
            </p>
          ) : (
            line.inspectionPoints.map((point, index) => (
              <div key={point.id} className="flex flex-col gap-2 w-full">
                <Row label="点検箇所">{point.location}</Row>
                {point.items.map((item, i) => (
                  <Row key={i} label={i === 0 ? "点検項目" : ""}>
                    {item}
                  </Row>
                ))}
                {index < line.inspectionPoints.length - 1 && (
                  <div className="border-t border-[#d0d0d0] w-full mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {line.name}の削除
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
    </div>
  );
}
