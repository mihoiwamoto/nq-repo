import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Toast } from "../../components/Toast";
import { useMetalDetector } from "./MetalDetectorContext";
import { CANDIDATE_PRODUCTS } from "./mockData";
import type { TestPieceSetting } from "./types";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

let nextId = 1000;

export function NewRegistrationPage() {
  const { factoryId, unitId } = useParams<{ factoryId: string; unitId?: string }>();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;
  const { units, addUnit, updateUnit } = useMetalDetector();
  const navigate = useNavigate();

  const isEditing = Boolean(unitId);
  const existing = units.find((u) => u.id === unitId);

  const [name, setName] = useState(existing?.name ?? "");
  const [settings, setSettings] = useState<TestPieceSetting[]>(existing?.settings ?? []);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function addRow() {
    setSettings((prev) => [
      ...prev,
      { id: `s${nextId++}`, productName: "", settingNumber: "", fe: "", sus: "" },
    ]);
  }

  function updateRow(id: string, field: keyof Omit<TestPieceSetting, "id">, value: string) {
    setSettings((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function removeRow(id: string) {
    setSettings((prev) => prev.filter((row) => row.id !== id));
    setToastMessage("削除されました。");
    setShowToast(true);
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("金属探知機名は必須です");
      return;
    }
    const unit = {
      name: name.trim(),
      settings: settings.filter((row) => row.productName.trim() !== ""),
    };
    if (isEditing && unitId) {
      updateUnit(unitId, unit);
      navigate(`${basePath}/metal-detectors/${unitId}`, { state: { justSaved: true } });
    } else {
      addUnit(unit);
      navigate(`${basePath}/metal-detectors/new/complete`);
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
          { label: "金属探知機管理", to: `${basePath}/metal-detectors` },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-6 items-start p-6">
        <div className="flex flex-col gap-1 items-start w-[480px]">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">金属探知機名</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例）金属探知機1号機"
            className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
          />
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">設定番号/テストピース設定</p>
            <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
          </div>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            設定番号がない場合には「標準」と入力してください。
          </p>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            使用しないテストピースにはサイズを「0」と入力してください。
          </p>

          <div className="flex flex-col items-start rounded-lg w-full mt-2 border border-[#d0d0d0]">
            <div className="bg-[#f6f6f6] flex h-[50px] items-center w-full rounded-t-lg">
              <div className="w-[440px] flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">製品名/規格</p>
              </div>
              <div className="w-[100px] flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">設定番号</p>
              </div>
              <div className="w-[100px] flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">Fe</p>
              </div>
              <div className="w-[100px] flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">Sus</p>
              </div>
              <div className="w-[100px] flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">操作</p>
              </div>
            </div>
            {settings.length === 0 ? (
              <div className="bg-white flex items-center justify-center w-full py-6">
                <p className="text-base text-[var(--semantic-text-secondary)]">
                  設定がありません
                </p>
              </div>
            ) : (
              settings.map((row, index) => (
                <div
                  key={row.id}
                  className={`flex h-[64px] items-center w-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                >
                  <div className="p-2 flex items-center h-full">
                    <Pulldown
                      value={row.productName}
                      onChange={(value) => updateRow(row.id, "productName", value)}
                      options={CANDIDATE_PRODUCTS.map((product) => ({ value: product, label: product }))}
                      placeholder=""
                      className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[424px]"
                    />
                  </div>
                  <div className="w-[100px] p-2 flex items-center justify-center h-full">
                    <input
                      type="text"
                      value={row.settingNumber}
                      onChange={(e) => updateRow(row.id, "settingNumber", e.target.value)}
                      placeholder="ー"
                      className="bg-white border border-[#d0d0d0] flex items-center min-h-10 px-4 py-2 rounded-lg w-full text-base text-center text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                    />
                  </div>
                  <div className="w-[100px] p-2 flex items-center justify-center h-full">
                    <input
                      type="text"
                      value={row.fe}
                      onChange={(e) => updateRow(row.id, "fe", e.target.value)}
                      placeholder="ー"
                      className="bg-white border border-[#d0d0d0] flex items-center min-h-10 px-4 py-2 rounded-lg w-full text-base text-center text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                    />
                  </div>
                  <div className="w-[100px] p-2 flex items-center justify-center h-full">
                    <input
                      type="text"
                      value={row.sus}
                      onChange={(e) => updateRow(row.id, "sus", e.target.value)}
                      placeholder="ー"
                      className="bg-white border border-[#d0d0d0] flex items-center min-h-10 px-4 py-2 rounded-lg w-full text-base text-center text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                    />
                  </div>
                  <div className={`w-[100px] p-2 flex items-center justify-center h-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="bg-white border border-[var(--semantic-brand-danger)] size-10 rounded-lg flex items-center justify-center"
                    >
                      <img src={iconTrash} alt="削除" className="size-6" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
          >
            + 行追加
          </button>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() =>
              navigate(isEditing ? `${basePath}/metal-detectors/${unitId}` : `${basePath}/metal-detectors`)
            }
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
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
