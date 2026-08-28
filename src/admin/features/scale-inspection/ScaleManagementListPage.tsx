import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { getFactoryName } from "../../../data/factories";
import { useScaleInspection } from "./ScaleInspectionContext";
import { SCALE_REPAIR_STATUS_COLORS, SCALE_REPAIR_STATUS_LABELS, type ScaleRepairStatus } from "./types";

const REPAIR_STATUS_OPTIONS: ScaleRepairStatus[] = ["action_needed", "repairing", "done"];

export function ScaleManagementListPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { scales, posts, setScaleRepairStatus, moveScale } = useScaleInspection();
  const basePath = `/admin/ledger-management/scale-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);

  const [filterOpen, setFilterOpen] = useState(true);
  const [serialFilter, setSerialFilter] = useState("");
  const [weightFilter, setWeightFilter] = useState("");
  const [postFilter, setPostFilter] = useState("");

  const factoryPosts = posts.filter((post) => post.factoryId === factoryId);
  const factoryScales = scales.filter((scale) => scale.factoryId === factoryId);

  function getPostName(postId: string) {
    return posts.find((post) => post.id === postId)?.name ?? "";
  }

  const filtered = factoryScales.filter((scale) => {
    if (serialFilter && !scale.serialNumber.toLowerCase().includes(serialFilter.toLowerCase())) return false;
    if (weightFilter && String(scale.weightCapacity) !== weightFilter) return false;
    if (postFilter && scale.postId !== postFilter) return false;
    return true;
  });

  function handleReset() {
    setSerialFilter("");
    setWeightFilter("");
    setPostFilter("");
  }

  return (
    <div>
      <PageTitleBar
        title="秤管理"
        showBack
        action={
          <Link
            to={`${basePath}/scale-management/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/scale-inspection" },
          { label: "秤点検記録設定", to: basePath },
          { label: "秤管理" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="text-base text-[var(--semantic-brand-primary)]"
          >
            絞り込み検索 {filterOpen ? "−" : "+"}
          </button>
          {filterOpen && (
            <div className="flex gap-4 items-center w-full">
              <input
                type="text"
                value={serialFilter}
                onChange={(e) => setSerialFilter(e.target.value)}
                placeholder="秤のシリアルナンバーで探す"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[260px] placeholder:text-[var(--semantic-text-secondary)]"
              />
              <input
                type="text"
                value={weightFilter}
                onChange={(e) => setWeightFilter(e.target.value)}
                placeholder="秤重量で探す"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] placeholder:text-[var(--semantic-text-secondary)]"
              />
              <Pulldown
                value={postFilter}
                onChange={setPostFilter}
                options={factoryPosts.map((post) => ({ value: post.id, label: post.name }))}
                placeholder="持ち場選択"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
              />
              <button
                type="button"
                onClick={handleReset}
                className="bg-white border border-[#808080] h-12 w-20 rounded-lg text-sm text-[var(--semantic-text-secondary)]"
              >
                リセット
              </button>
              <button
                type="button"
                className="bg-[var(--semantic-brand-primary)] h-12 w-[120px] rounded-lg text-sm text-white"
              >
                検索
              </button>
            </div>
          )}
        </div>

        <div className="w-full rounded-lg overflow-x-auto">
          <div className="flex flex-col min-w-[900px]">
            <div className="bg-[#f6f6f6] flex h-[50px] items-center">
              {[
                { label: "表示順", width: "w-[80px]" },
                { label: "秤No.(ラベル名)", width: "w-[148px]" },
                { label: "シリアルナンバー", width: "w-[148px]" },
                { label: "秤量(kg)", width: "w-[100px]" },
                { label: "持ち場", width: "w-[148px]" },
                { label: "修理状況", width: "w-[140px]" },
                { label: "操作", width: "w-[104px]" },
              ].map((col) => (
                <div
                  key={col.label}
                  className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${col.width}`}
                >
                  {col.label}
                </div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <p className="bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                該当する秤がありません
              </p>
            ) : (
              filtered.map((scale, index) => (
                <div
                  key={scale.id}
                  className={`flex h-14 items-center ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                >
                  <div className="w-[80px] flex items-center justify-center gap-1 p-2 h-full">
                    <button
                      type="button"
                      onClick={() => moveScale(scale.id, "up")}
                      disabled={index === 0}
                      className="text-[var(--semantic-brand-primary)] disabled:text-[#d0d0d0]"
                      aria-label="上へ"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveScale(scale.id, "down")}
                      disabled={index === filtered.length - 1}
                      className="text-[var(--semantic-brand-primary)] disabled:text-[#d0d0d0]"
                      aria-label="下へ"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="w-[148px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] text-center">
                    {scale.label}
                  </div>
                  <div className="w-[148px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] text-center">
                    {scale.serialNumber}
                  </div>
                  <div className="w-[100px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                    {scale.weightCapacity}
                  </div>
                  <div className="w-[148px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] text-center">
                    {getPostName(scale.postId)}
                  </div>
                  <div className="w-[140px] flex items-center justify-center p-2 h-full">
                    {scale.repairStatus ? (
                      <Pulldown
                        value={scale.repairStatus}
                        onChange={(value) => setScaleRepairStatus(scale.id, value as ScaleRepairStatus)}
                        options={REPAIR_STATUS_OPTIONS.map((opt) => ({
                          value: opt,
                          label: SCALE_REPAIR_STATUS_LABELS[opt],
                        }))}
                        className="h-8 px-2 rounded-lg text-sm text-white"
                        style={{ backgroundColor: SCALE_REPAIR_STATUS_COLORS[scale.repairStatus] }}
                      />
                    ) : null}
                  </div>
                  <div className="w-[104px] flex items-center justify-center p-2 h-full">
                    <Link
                      to={`${basePath}/scale-management/${scale.id}`}
                      className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
