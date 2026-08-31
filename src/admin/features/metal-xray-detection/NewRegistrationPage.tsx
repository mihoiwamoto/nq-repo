import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useMetalXrayManagement } from "./MetalXrayManagementContext";
import { AddProductDialog } from "./AddProductDialog";
import iconCalendar from "../../../assets/figma/icons/common/calendar.svg";

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative flex items-center">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white h-12 px-4 pr-12 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] appearance-none cursor-pointer"
      />
      <img
        src={iconCalendar}
        alt=""
        className="absolute right-4 w-6 h-6 pointer-events-none"
      />
    </label>
  );
}

function RecordToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex gap-4 items-center">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`h-12 w-[200px] rounded-lg shadow-[0px_2px_2px_rgba(51,51,51,0.24)] text-base bg-white ${
          !value
            ? "border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
            : "border border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
        }`}
      >
        記録しない
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`h-12 w-[200px] rounded-lg shadow-[0px_2px_2px_rgba(51,51,51,0.24)] text-base bg-white ${
          value
            ? "border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
            : "border border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
        }`}
      >
        記録する
      </button>
    </div>
  );
}

export function NewRegistrationPage() {
  const { factoryId, machineId } = useParams<{ factoryId: string; machineId?: string }>();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;
  const { machines, addMachine, updateMachine } = useMetalXrayManagement();
  const navigate = useNavigate();

  const isEditing = Boolean(machineId);
  const existing = machines.find((m) => m.id === machineId);

  const [displayFrom, setDisplayFrom] = useState(existing?.displayFrom ?? "");
  const [displayTo, setDisplayTo] = useState(existing?.displayTo ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [recordMetalDetector, setRecordMetalDetector] = useState(existing?.recordMetalDetector ?? false);
  const [recordXrayDetector, setRecordXrayDetector] = useState(existing?.recordXrayDetector ?? false);
  const [recordWeightChecker, setRecordWeightChecker] = useState(existing?.recordWeightChecker ?? false);
  const [recordSealing, setRecordSealing] = useState(existing?.recordSealing ?? true);
  const [mainPassProducts, setMainPassProducts] = useState<string[]>(existing?.mainPassProducts ?? []);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("点検構成名は必須です");
      return;
    }
    const machine = {
      name: name.trim(),
      displayFrom: displayFrom || undefined,
      displayTo: displayTo || undefined,
      recordMetalDetector,
      recordXrayDetector,
      recordWeightChecker,
      recordSealing,
      mainPassProducts: mainPassProducts.filter((p) => p.trim() !== ""),
    };
    if (isEditing && machineId) {
      updateMachine(machineId, machine);
      navigate(`${basePath}/machines/${machineId}`, { state: { justUpdated: true } });
    } else {
      addMachine(machine);
      navigate(`${basePath}/machines/new/complete`);
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/metal-xray-detection" },
          { label: "金属/X線探知機記録", to: basePath },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">アプリ表示期間</p>
            <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
          </div>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            日付指定が無い場合は、常にアプリ上に表示されます。
          </p>
          <div className="flex gap-2 items-center">
            <DateInput value={displayFrom} onChange={setDisplayFrom} />
            <span className="text-[var(--semantic-text-primary)]">〜</span>
            <DateInput value={displayTo} onChange={setDisplayTo} />
          </div>
        </div>

        <div className="flex flex-col gap-1 items-start w-[480px]">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">点検構成名</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            この点検構成を識別するための名称を入力してください。
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例）XXXXXXX"
            className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
          />
        </div>

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">金属探知機</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <RecordToggle value={recordMetalDetector} onChange={setRecordMetalDetector} />
        </div>

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">X線探知機</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <RecordToggle value={recordXrayDetector} onChange={setRecordXrayDetector} />
        </div>

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">ウェイトチェッカー</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <RecordToggle value={recordWeightChecker} onChange={setRecordWeightChecker} />
        </div>

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">シーリング</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <RecordToggle value={recordSealing} onChange={setRecordSealing} />
        </div>

        <div className="flex flex-col items-start rounded-lg w-full overflow-hidden max-w-[1152px]">
          <div className="bg-white flex gap-6 items-center p-4 w-full">
            <div className="flex-1 flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">主な通過製品</p>
              <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
            </div>
            <button
              type="button"
              onClick={() => setProductDialogOpen(true)}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
            >
              + 製品追加
            </button>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="bg-white flex flex-col gap-4 items-center p-4 w-full">
            {mainPassProducts.length === 0 ? (
              <p className="text-sm text-[var(--semantic-text-primary)] w-full">
                登録された製品がありません
              </p>
            ) : (
              mainPassProducts.map((product) => (
                <div key={product} className="flex items-center w-full gap-4">
                  <span className="flex-1 text-sm text-[var(--semantic-text-primary)]">{product}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setMainPassProducts((prev) => prev.filter((p) => p !== product))
                    }
                    className="text-sm text-[var(--semantic-text-secondary)]"
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(isEditing ? `${basePath}/machines/${machineId}` : basePath)}
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

      {productDialogOpen && (
        <AddProductDialog
          selectedNames={mainPassProducts}
          onClose={() => setProductDialogOpen(false)}
          onConfirm={(names) => {
            setMainPassProducts(names);
            setProductDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
