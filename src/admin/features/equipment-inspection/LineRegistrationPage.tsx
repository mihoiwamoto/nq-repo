import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSchedule } from "./ScheduleContext";
import type { InspectionPoint, LineFrequency } from "./types";

const FREQUENCY_OPTIONS: { key: LineFrequency; label: string }[] = [
  { key: "daily", label: "毎日" },
  { key: "weekly", label: "毎週" },
  { key: "monthly", label: "毎月" },
  { key: "yearly", label: "毎年" },
];

let nextPointId = 1;

function emptyPoint(): InspectionPoint {
  return { id: `p${nextPointId++}`, location: "", items: [""] };
}

export function LineRegistrationPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const basePath = `/admin/ledger-management/equipment-inspection/factories/${factoryId}`;
  const { addLine } = useSchedule();
  const navigate = useNavigate();

  const [displayFrom, setDisplayFrom] = useState("");
  const [displayTo, setDisplayTo] = useState("");
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<LineFrequency>("daily");
  const [points, setPoints] = useState<InspectionPoint[]>([emptyPoint()]);
  const [error, setError] = useState("");

  function updateLocation(pointId: string, location: string) {
    setPoints((prev) => prev.map((p) => (p.id === pointId ? { ...p, location } : p)));
  }

  function updateItem(pointId: string, itemIndex: number, value: string) {
    setPoints((prev) =>
      prev.map((p) =>
        p.id === pointId
          ? { ...p, items: p.items.map((it, i) => (i === itemIndex ? value : it)) }
          : p
      )
    );
  }

  function addItem(pointId: string) {
    setPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, items: [...p.items, ""] } : p))
    );
  }

  function addPoint() {
    setPoints((prev) => [...prev, emptyPoint()]);
  }

  function handleSubmit() {
    if (!name.trim() || !points[0]?.location.trim()) {
      setError("持ち場/ライン名と点検箇所は必須です");
      return;
    }
    addLine({
      id: `line-${Date.now()}`,
      name: name.trim(),
      frequency,
      displayFrom: displayFrom || undefined,
      displayTo: displayTo || undefined,
      inspectionPoints: points
        .filter((p) => p.location.trim() !== "")
        .map((p) => ({ ...p, items: p.items.filter((item) => item.trim() !== "") })),
    });
    navigate(`${basePath}/schedule`);
  }

  return (
    <div>
      <PageTitleBar title="新規登録" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/equipment-inspection" },
          { label: "持ち場/ライン選択", to: basePath },
          { label: "新規登録" },
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
            <input
              type="date"
              value={displayFrom}
              onChange={(e) => setDisplayFrom(e.target.value)}
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
            />
            <span className="text-[var(--semantic-text-primary)]">〜</span>
            <input
              type="date"
              value={displayTo}
              onChange={(e) => setDisplayTo(e.target.value)}
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 items-start w-[480px]">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">持ち場/ライン名</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            この点検構成を識別するための名称を入力してください。
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例）豆乳ライン"
            className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
          />
        </div>

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">点検頻度</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <div className="flex gap-2 items-center">
            {FREQUENCY_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFrequency(option.key)}
                className={`h-10 w-[120px] rounded-lg border shadow-[0px_2px_2px_rgba(51,51,51,0.24)] text-base ${
                  frequency === option.key
                    ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                    : "border-[#808080] text-[var(--semantic-text-secondary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 items-start w-full">
          {points.map((point) => (
            <div key={point.id} className="flex flex-col gap-2 items-start w-[480px]">
              <div className="flex gap-2 items-center">
                <p className="text-xl text-[var(--semantic-text-primary)]">点検箇所</p>
                <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
              </div>
              <input
                type="text"
                value={point.location}
                onChange={(e) => updateLocation(point.id, e.target.value)}
                placeholder="例）エコスター"
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
              />
              <div className="flex flex-col gap-2 items-start pl-6 w-full border-l border-[#d0d0d0]">
                <p className="text-xl text-[var(--semantic-text-primary)]">点検項目</p>
                {point.items.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(point.id, index, e.target.value)}
                    placeholder="例）定量部"
                    className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addItem(point.id)}
                  className="border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg text-sm text-[var(--semantic-brand-primary)]"
                >
                  + 追加
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPoint}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-brand-primary)]"
          >
            + 点検の追加
          </button>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/schedule`)}
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            登録
          </button>
        </div>
      </div>
    </div>
  );
}
