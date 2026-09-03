import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Toast } from "../../components/Toast";
import { useXrayDetector } from "./XrayDetectorContext";
import { CANDIDATE_PRODUCTS } from "./mockData";
import type { XrayTestPieceSetting } from "./types";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";

let nextId = 1000;

const SETTING_COLUMNS: { key: keyof Omit<XrayTestPieceSetting, "id" | "productName">; label: string }[] = [
  { key: "settingNumber", label: "設定番号" },
  { key: "susBall", label: "Sus球" },
  { key: "susWire", label: "Sus線" },
  { key: "glassBall", label: "ガラス球" },
  { key: "ceramic", label: "セラミック" },
  { key: "rubberBall", label: "ゴム球" },
];

const CELL_WIDTH = 100;

export function NewRegistrationPage() {
  const { factoryId, unitId } = useParams<{ factoryId: string; unitId?: string }>();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;
  const { units, addUnit, updateUnit } = useXrayDetector();
  const navigate = useNavigate();

  const isEditing = Boolean(unitId);
  const existing = units.find((u) => u.id === unitId);

  const [name, setName] = useState(existing?.name ?? "");
  const [settings, setSettings] = useState<XrayTestPieceSetting[]>(existing?.settings ?? []);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function addRow() {
    setSettings((prev) => [
      ...prev,
      {
        id: `xs${nextId++}`,
        productName: "",
        settingNumber: "",
        susBall: "",
        susWire: "",
        glassBall: "",
        ceramic: "",
        rubberBall: "",
      },
    ]);
  }

  function updateRow(id: string, field: keyof Omit<XrayTestPieceSetting, "id">, value: string) {
    setSettings((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function removeRow(id: string) {
    setSettings((prev) => prev.filter((row) => row.id !== id));
    setToastMessage("削除されました。");
    setShowToast(true);
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("X線探知機名は必須です");
      return;
    }
    const unit = {
      name: name.trim(),
      settings: settings.filter((row) => row.productName.trim() !== ""),
    };
    if (isEditing && unitId) {
      updateUnit(unitId, unit);
      navigate(`${basePath}/xray-detectors/${unitId}`, { state: { justSaved: true } });
    } else {
      addUnit(unit);
      navigate(`${basePath}/xray-detectors/new/complete`);
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/metal-xray-detection" },
          { label: "金属/X線探知機記録", to: `${basePath}` },
          { label: "X線探知機管理", to: `${basePath}/xray-detectors` },
          ...(isEditing ? [{ label: "詳細", to: `${basePath}/xray-detectors/${unitId}` }] : []),
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center w-full">
              <p className="text-xl leading-[1.4] text-[var(--semantic-text-primary)]">X線探知機名</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）XXXXXX"
              className="bg-[var(--semantic-background-surface)] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
            />
          </div>

          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex flex-col gap-1 items-start w-full">
              <div className="flex flex-col gap-1 items-start w-[480px]">
                <div className="flex gap-2 items-center w-full">
                  <p className="text-xl leading-[1.4] text-[var(--semantic-text-primary)]">
                    設定番号/テストピース設定
                  </p>
                  <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
                </div>
                <div className="text-sm leading-[1.2] text-[var(--semantic-text-secondary)] w-full">
                  <p>設定番号がない場合には「標準」と入力してください。</p>
                  <p>使用しないテストピースにはサイズを「0」と入力してください。</p>
                </div>
              </div>

              <div className="w-full">
                <div className="flex flex-col items-start w-full">
                  <div className="bg-[#f6f6f6] flex h-[50px] items-center rounded-t-lg w-full">
                    <div className="flex flex-1 min-w-0 items-center justify-center p-2 h-full">
                      <p className="text-sm leading-[1.2] text-[var(--semantic-brand-primary)]">製品名/規格</p>
                    </div>
                    {SETTING_COLUMNS.map((col) => (
                      <div
                        key={col.key}
                        className="flex items-center justify-center p-2 h-full shrink-0"
                        style={{ width: `${CELL_WIDTH}px` }}
                      >
                        <p className="text-sm leading-[1.2] text-[var(--semantic-brand-primary)]">{col.label}</p>
                      </div>
                    ))}
                    <div
                      className="flex items-center justify-center p-2 h-full shrink-0"
                      style={{ width: `${CELL_WIDTH}px` }}
                    >
                      <p className="text-sm leading-[1.2] text-[var(--semantic-brand-primary)]">操作</p>
                    </div>
                  </div>
                  {settings.length === 0 ? (
                    <div className="bg-white flex items-center justify-center rounded-b-lg w-full py-6">
                      <p className="text-base text-[var(--semantic-text-secondary)]">設定がありません</p>
                    </div>
                  ) : (
                    settings.map((row, index) => (
                      <div
                        key={row.id}
                        className={`flex h-[56px] items-center w-full ${
                          index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"
                        } ${index === settings.length - 1 ? "rounded-b-lg" : ""}`}
                      >
                        <div className="flex flex-1 min-w-0 flex-col justify-center p-2 h-full">
                          <Pulldown
                            value={row.productName}
                            onChange={(value) => updateRow(row.id, "productName", value)}
                            options={CANDIDATE_PRODUCTS.map((product) => ({ value: product, label: product }))}
                            placeholder="例）マンゴープリン　ストレート　1kg"
                            className="bg-[var(--semantic-background-surface)] border border-[#d0d0d0] flex h-10 items-center px-4 rounded-lg w-full text-base text-[var(--semantic-text-primary)]"
                          />
                        </div>
                        {SETTING_COLUMNS.map((col) => (
                          <div
                            key={col.key}
                            className="flex items-center justify-center p-2 h-full shrink-0"
                            style={{ width: `${CELL_WIDTH}px` }}
                          >
                            <input
                              type="text"
                              value={row[col.key]}
                              onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                              placeholder="ー"
                              className="bg-[var(--semantic-background-surface)] border border-[#d0d0d0] h-10 px-4 rounded-lg w-full text-base text-center text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                            />
                          </div>
                        ))}
                        <div
                          className="flex items-center justify-center p-2 h-full shrink-0"
                          style={{ width: `${CELL_WIDTH}px` }}
                        >
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="bg-[var(--semantic-background-surface)] border border-[var(--semantic-brand-danger)] size-10 rounded-lg flex items-center justify-center"
                          >
                            <img src={iconTrash} alt="削除" className="size-6" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="bg-[var(--semantic-background-surface)] border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
            >
              <img src={iconPlus} alt="" aria-hidden className="size-5" />
              行追加
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() =>
              navigate(isEditing ? `${basePath}/xray-detectors/${unitId}` : `${basePath}/xray-detectors`)
            }
            className="bg-[var(--semantic-background-surface)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
