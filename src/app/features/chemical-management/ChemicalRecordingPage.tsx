import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useChemicalManagement } from "./ChemicalManagementContext";
import { ACTORS } from "./mockData";

type TabType = "chemicals" | "remarks" | "completer";

export function ChemicalRecordingPage() {
  const { chemicalId } = useParams<{ chemicalId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { chemicals } = useChemicalManagement();

  const chemical = chemicals.find((c) => c.id === chemicalId);
  const state = location.state as { inspectorName?: string } | null;
  const inspectorName = state?.inspectorName ?? ACTORS[0].name;

  const [date, setDate] = useState("2025-04-01");
  const [activeTab, setActiveTab] = useState<TabType>("chemicals");

  // Tab: 使用薬品
  const [usedQuantity, setUsedQuantity] = useState("");
  const [purposeOfUse, setPurposeOfUse] = useState("");

  // Tab: 備考
  const [remarks, setRemarks] = useState("");

  // Tab: 完成者
  const [completerName, setCompleterName] = useState(inspectorName);

  const basePath = `/app/ledger-list/chemical-management`;
  const canSave = usedQuantity.trim() !== "" && purposeOfUse.trim() !== "";

  function handleSave() {
    if (!canSave) return;
    navigate(`${basePath}/${chemicalId}/confirm`, {
      state: {
        chemicalId,
        date: date.replaceAll("-", "/"),
        managementNumber: chemical?.managementNumber ?? "",
        storageLocation: chemical?.storageLocation ?? "",
        spec: chemical?.spec ?? "",
        currentQuantity: chemical?.currentQuantity ?? "",
        usedQuantity,
        purposeOfUse,
        remarks,
        completerName,
        inspectorName,
      },
    });
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "chemicals", label: "使用薬品" },
    { id: "remarks", label: "備考" },
    { id: "completer", label: "完成者" },
  ];

  return (
    <>
      <AppHeader title={`薬品管理_${chemical?.name ?? ""}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-5 items-center">
          <div className="bg-white flex flex-col gap-5 items-start p-4 rounded-lg w-full max-w-[640px]">
            {/* 上部：日付フィールド + 記録するボタン */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white h-12 px-3 rounded-lg text-base text-[var(--semantic-text-primary)] border border-[#d0d0d0]"
                />
              </div>
              <button
                type="button"
                disabled={!canSave}
                onClick={handleSave}
                className={`h-12 px-6 rounded-lg text-base text-white shrink-0 ${
                  canSave ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
                }`}
              >
                記録する
              </button>
            </div>

            {/* 管理情報表示 */}
            <div className="border-t border-[#d0d0d0] w-full pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-[var(--semantic-text-secondary)]">管理番号</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">
                    {chemical?.managementNumber ?? ""}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-[var(--semantic-text-secondary)]">保管場所</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">
                    {chemical?.storageLocation ?? ""}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-[var(--semantic-text-secondary)]">規格</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">{chemical?.spec ?? ""}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-[var(--semantic-text-secondary)]">現在量</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">
                    {chemical?.currentQuantity ?? ""}
                  </p>
                </div>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="border-t border-[#d0d0d0] w-full pt-4 -mx-4 px-4">
              <div className="flex gap-0 border-b border-[#d0d0d0]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-base whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                        : "border-transparent text-[var(--semantic-text-secondary)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* タブコンテンツ */}
            <div className="w-full">
              {/* Tab: 使用薬品 */}
              {activeTab === "chemicals" && (
                <div className="flex flex-col gap-5 items-start w-full">
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      使用数量 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <input
                      type="text"
                      value={usedQuantity}
                      onChange={(e) => setUsedQuantity(e.target.value)}
                      placeholder="例）100ml"
                      className="bg-white h-12 px-4 rounded-lg text-base w-full text-[var(--semantic-text-primary)] placeholder:text-[#808080] border border-[#d0d0d0]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      使用目的 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <textarea
                      value={purposeOfUse}
                      onChange={(e) => setPurposeOfUse(e.target.value)}
                      placeholder="例）製造ラインA用途"
                      className="bg-white min-h-24 p-3 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080] border border-[#d0d0d0]"
                    />
                  </div>
                </div>
              )}

              {/* Tab: 備考 */}
              {activeTab === "remarks" && (
                <div className="flex flex-col gap-2 items-start w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)]">備考</p>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="備考があればご記入ください"
                    className="bg-white min-h-24 p-3 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080] border border-[#d0d0d0]"
                  />
                </div>
              )}

              {/* Tab: 完成者 */}
              {activeTab === "completer" && (
                <div className="flex flex-col gap-2 items-start w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    完成者名 <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <input
                    type="text"
                    value={completerName}
                    onChange={(e) => setCompleterName(e.target.value)}
                    placeholder="完成者名を入力してください"
                    className="bg-white h-12 px-4 rounded-lg text-base w-full text-[var(--semantic-text-primary)] placeholder:text-[#808080] border border-[#d0d0d0]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            一覧へ戻る
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
              canSave ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
            }`}
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
}
