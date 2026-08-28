import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useGlassPlastic } from "./GlassPlasticContext";
import floorMapImage from "../../../assets/figma/floorplans/floor-a.png";
import iconExpand from "../../../assets/figma/icons/common/expansion.svg";
import iconReduce from "../../../assets/figma/icons/common/reduction.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import type { RoomItemRecord } from "./mockData";

export function FloorInspectionConfirmPage() {
  const { floorId } = useParams<{ floorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentFloorRecords } = useGlassPlastic();
  const state = location.state as {
    floorName?: string;
    date?: string;
    records?: Record<string, RoomItemRecord>;
    inspectorName?: string;
  } | null;

  const floorName = state?.floorName ?? "フロアA";
  const date = state?.date ?? "2025/03/24";
  const inspectorName = state?.inspectorName ?? "未設定";
  const records = state?.records ?? currentFloorRecords;

  const [mapScale, setMapScale] = useState(1);
  const [mapExpanded, setMapExpanded] = useState(false);

  function handleSave() {
    navigate(`/app/ledger-list/glass-plastic/floors/${floorId}/complete`, {
      state: { floorName, date, inspectorName },
    });
  }

  return (
    <>
      <AppHeader title={`ガラス・プラスチック管理_${floorName}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4">
          <div className="bg-yellow-50 rounded-lg p-4 flex items-center gap-3 text-sm text-[var(--semantic-text-primary)]">
            <span
              className="size-6 shrink-0"
              style={{
                WebkitMaskImage: `url("${iconAttention}")`,
                maskImage: `url("${iconAttention}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "#333333",
              }}
            />
            <span>実施者、入力内容に誤りがないか確認後にご提案ください。</span>
          </div>

          <div className="bg-white rounded-lg overflow-x-auto p-4 flex-1 flex items-center justify-center relative">
            <button
              type="button"
              onClick={() => setMapExpanded((expanded) => !expanded)}
              aria-label={mapExpanded ? "縮小表示" : "拡大表示"}
              className="absolute top-4 left-4 size-10 bg-white rounded-lg flex items-center justify-center text-lg z-10"
            >
              <span
                className="size-6"
                style={{
                  WebkitMaskImage: `url("${mapExpanded ? iconReduce : iconExpand}")`,
                  maskImage: `url("${mapExpanded ? iconReduce : iconExpand}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "#009944",
                }}
              />
            </button>
            <div className={`flex items-center justify-center ${mapExpanded ? "h-[640px]" : "h-[340px]"}`}>
              <img
                src={floorMapImage}
                alt={`${floorName}の配置図`}
                style={{ transform: `scale(${mapScale})` }}
                className={`transition-transform ${mapExpanded ? "" : "max-h-[300px]"}`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col rounded-lg overflow-hidden shadow-[0px_2px_3px_rgba(51,51,51,0.24)]">
                <button
                  type="button"
                  onClick={() => setMapScale((s) => Math.min(s + 0.2, 2))}
                  className="bg-white w-10 h-10 flex items-center justify-center text-xl border-b border-[#d0d0d0]"
                >
                  <span
                    className="size-6"
                    style={{
                      WebkitMaskImage: `url("${iconPlus}")`,
                      maskImage: `url("${iconPlus}")`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      backgroundColor: "#009944",
                    }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setMapScale((s) => Math.max(s - 0.2, 0.6))}
                  className="bg-white w-10 h-10 flex items-center justify-center text-xl"
                >
                  <span
                    className="size-6"
                    style={{
                      WebkitMaskImage: `url("${iconMinus}")`,
                      maskImage: `url("${iconMinus}")`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      backgroundColor: "#009944",
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between py-2 border-b border-[#e0e0e0]">
              <span className="text-base text-[var(--semantic-text-secondary)]">実施者</span>
              <span className="text-base text-[var(--semantic-text-primary)]">{inspectorName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#e0e0e0]">
              <span className="text-base text-[var(--semantic-text-secondary)]">点検場所</span>
              <span className="text-base text-[var(--semantic-text-primary)]">{floorName}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-base text-[var(--semantic-text-secondary)]">実施日</span>
              <span className="text-base text-[var(--semantic-text-primary)]">{date}</span>
            </div>
          </div>

          {records && (
            <div className="bg-white rounded-lg p-4 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-[var(--semantic-text-primary)]">検査結果</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(records).map(([key, record]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-b-0">
                    <span className="text-base text-[var(--semantic-text-primary)]">{record.label}</span>
                    <div className="flex items-center gap-2">
                      {record.status === "ng" ? (
                        <span className="text-sm bg-[#f85c5c] text-white px-3 py-1 rounded">異常あり</span>
                      ) : record.status === "ok" ? (
                        <span className="text-sm bg-[#3ba55c] text-white px-3 py-1 rounded">正常</span>
                      ) : (
                        <span className="text-sm bg-[#e0e0e0] text-[var(--semantic-text-secondary)] px-3 py-1 rounded">未確認</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
}
