import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { useMetalXrayManagement } from "./MetalXrayManagementContext";
import { AddProductDialog } from "./AddProductDialog";
import iconCalendar from "../../../assets/figma/icons/common/calendar.svg";
import { METAL_DETECTORS, XRAY_DETECTORS, WEIGHT_CHECKERS } from "./mockData";

function DatePicker({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(
    value ? new Date(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleSelectDate = (day: number) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateString = selectedDate.toISOString().split("T")[0];
    onChange(dateString);
    onClose();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthYear = currentDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4 w-[280px]"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="px-2 py-1 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <div className="text-base font-semibold text-[var(--semantic-text-primary)]">
          {monthYear}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="px-2 py-1 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-[var(--semantic-text-secondary)] p-1"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => day && handleSelectDate(day)}
            disabled={!day}
            className={`w-8 h-8 flex items-center justify-center text-sm rounded-full ${
              day
                ? `text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-brand-primary)] hover:text-white cursor-pointer ${
                    value ===
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    )
                      .toISOString()
                      .split("T")[0]
                      ? "bg-[var(--semantic-brand-primary)] text-white"
                      : ""
                  }`
                : "text-gray-300"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleIconClick = () => {
    setIsOpen(true);
  };

  const displayValue = value
    ? new Date(value).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <div className="relative">
      <label className="relative flex items-center">
        {!value && (
          <span className="absolute left-4 text-[var(--semantic-text-secondary)] pointer-events-none">
            日付を選択
          </span>
        )}
        <input
          type="text"
          value={displayValue}
          readOnly
          placeholder="日付を選択"
          className="bg-white h-12 px-4 pr-12 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] cursor-pointer border border-transparent"
        />
        <img
          src={iconCalendar}
          alt="日付を選択"
          className="absolute right-4 w-6 h-6 cursor-pointer"
          onClick={handleIconClick}
        />
      </label>
      {isOpen && (
        <DatePicker value={value} onChange={onChange} onClose={() => setIsOpen(false)} />
      )}
    </div>
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

function DetectorSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = value || "";
  const selectedColor = value ? "#333333" : "#d0d0d0";

  return (
    <div className="flex flex-col gap-1 items-start w-[240px] mb-4" ref={containerRef}>
      <div className="flex gap-2 items-center">
        <p className="text-xl text-[var(--semantic-text-primary)]">{label}</p>
        <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
      </div>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white h-12 px-4 rounded-lg text-base w-full border border-[#d0d0d0] flex items-center justify-between"
          style={{ color: selectedColor }}
        >
          <span>{selectedLabel}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <path d="M1 4l5 4 5-4" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-[0px_0px_3px_rgba(51,51,51,0.24)] z-10 overflow-hidden pb-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="w-full h-[42px] px-2 py-2 text-left text-base text-[#808080] hover:bg-[#094] hover:text-white transition-colors"
            >
              選択してください
            </button>
            {options.map((option) => (
              <div
                key={option}
                className={`px-2 py-0 ${value === option ? "mx-1" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full h-[42px] px-2 py-2 text-left text-base transition-colors rounded-lg ${
                    value === option
                      ? "bg-[#094] text-white"
                      : "text-[#333333] hover:bg-[#094] hover:text-white"
                  }`}
                >
                  {option}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
  const [metalDetectorName, setMetalDetectorName] = useState(existing?.metalDetectorName ?? "");
  const [recordXrayDetector, setRecordXrayDetector] = useState(existing?.recordXrayDetector ?? false);
  const [xrayDetectorName, setXrayDetectorName] = useState(existing?.xrayDetectorName ?? "");
  const [recordWeightChecker, setRecordWeightChecker] = useState(existing?.recordWeightChecker ?? false);
  const [weightCheckerName, setWeightCheckerName] = useState(existing?.weightCheckerName ?? "");
  const [recordSealing, setRecordSealing] = useState(existing?.recordSealing ?? true);
  const [mainPassProducts, setMainPassProducts] = useState<string[]>(existing?.mainPassProducts ?? []);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("点検構成名は必須です");
      return;
    }
    if (recordMetalDetector && !metalDetectorName.trim()) {
      setError("金属探知機を記録する場合、機器名の選択は必須です");
      return;
    }
    if (recordXrayDetector && !xrayDetectorName.trim()) {
      setError("X線探知機を記録する場合、機器名の選択は必須です");
      return;
    }
    if (recordWeightChecker && !weightCheckerName.trim()) {
      setError("ウェイトチェッカーを記録する場合、機器名の選択は必須です");
      return;
    }
    const machine = {
      name: name.trim(),
      displayFrom: displayFrom || undefined,
      displayTo: displayTo || undefined,
      recordMetalDetector,
      ...(metalDetectorName && { metalDetectorName }),
      recordXrayDetector,
      ...(xrayDetectorName && { xrayDetectorName }),
      recordWeightChecker,
      ...(weightCheckerName && { weightCheckerName }),
      recordSealing,
      mainPassProducts: mainPassProducts.filter((p) => p.trim() !== ""),
    };
    if (isEditing && machineId) {
      updateMachine(machineId, machine);
      navigate(`${basePath}/machines/${machineId}`, { state: { justSaved: true } });
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

        {recordMetalDetector && (
          <DetectorSelect
            value={metalDetectorName}
            onChange={setMetalDetectorName}
            options={METAL_DETECTORS}
            label="金属探知機名"
          />
        )}

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">X線探知機</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <RecordToggle value={recordXrayDetector} onChange={setRecordXrayDetector} />
        </div>

        {recordXrayDetector && (
          <DetectorSelect
            value={xrayDetectorName}
            onChange={setXrayDetectorName}
            options={XRAY_DETECTORS}
            label="X線探知機名"
          />
        )}

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">ウェイトチェッカー</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <RecordToggle value={recordWeightChecker} onChange={setRecordWeightChecker} />
        </div>

        {recordWeightChecker && (
          <DetectorSelect
            value={weightCheckerName}
            onChange={setWeightCheckerName}
            options={WEIGHT_CHECKERS}
            label="ウェイトチェッカー名"
          />
        )}

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">シーリング</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <RecordToggle value={recordSealing} onChange={setRecordSealing} />
        </div>

        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">主な通過製品</p>
            <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
          </div>
          {mainPassProducts.length > 0 && (
            <div className="bg-white rounded-lg p-4 w-1/3">
              <div className="flex flex-col gap-4 items-start w-full">
                {mainPassProducts.map((product) => (
                  <div key={product} className="text-sm text-[var(--semantic-text-primary)]">
                    {product}
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setProductDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
          >
            + 製品追加
          </button>
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

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
