import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { DateFilterInput } from "../../components/DateFilterInput";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useScaleInspection } from "./ScaleInspectionContext";
import { getFactoryName } from "../../../data/factories";
import type { ScaleCatalogEntry } from "./types";
import iconPulldown from "../../../assets/figma/icons/common/pulldown.svg";

function Pulldown({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className="relative w-[240px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="bg-white content-stretch flex gap-2 h-12 items-center px-4 rounded-lg w-full"
      >
        <span
          className={`flex-1 text-left text-base overflow-hidden text-ellipsis whitespace-nowrap ${
            selected ? "text-[var(--semantic-text-primary)]" : "text-[#808080]"
          }`}
        >
          {selected?.label ?? placeholder}
        </span>
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
            backgroundColor: "#808080",
          }}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white drop-shadow-[0px_0px_3px_rgba(51,51,51,0.24)] rounded-lg p-2 w-full z-10">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex h-[42px] items-center px-2 rounded-lg w-full text-left text-base ${
                option.value === value
                  ? "bg-[var(--semantic-brand-primary)] text-white"
                  : "text-[var(--semantic-text-primary)] hover:bg-[#f6f6f6]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScaleFormPage() {
  const { factoryId, scaleId } = useParams<{ factoryId: string; scaleId: string }>();
  const isEditing = Boolean(scaleId);
  const { scales, posts, addScale, updateScale } = useScaleInspection();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/scale-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const existing = scales.find((s) => s.id === scaleId);
  const factoryPosts = posts.filter((p) => p.factoryId === factoryId);

  const catalog = useMemo(() => {
    const byLabel = new Map<string, ScaleCatalogEntry>();
    scales
      .filter((s) => s.factoryId === factoryId)
      .forEach((s) => {
        if (!byLabel.has(s.label)) {
          byLabel.set(s.label, { label: s.label, serialNumber: s.serialNumber, referenceWeight: s.referenceWeight });
        }
      });
    if (existing && !byLabel.has(existing.label)) {
      byLabel.set(existing.label, {
        label: existing.label,
        serialNumber: existing.serialNumber,
        referenceWeight: existing.referenceWeight,
      });
    }
    return Array.from(byLabel.values());
  }, [scales, factoryId, existing]);

  const [scaleLabel, setScaleLabel] = useState(existing?.label ?? "");
  const [postId, setPostId] = useState(existing?.postId ?? "");
  const [displayFrom, setDisplayFrom] = useState(existing?.displayFrom ?? "");
  const [displayTo, setDisplayTo] = useState(existing?.displayTo ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    const selected = catalog.find((entry) => entry.label === scaleLabel);
    if (!selected || !postId) {
      setError("必須項目を選択してください");
      return;
    }
    const sourceScale = scales.find((s) => s.factoryId === factoryId && s.label === selected.label) ?? existing;
    const input = {
      factoryId: factoryId!,
      postId,
      label: selected.label,
      serialNumber: selected.serialNumber,
      weightCapacity: sourceScale?.weightCapacity ?? 0,
      recordOperationCheck: sourceScale?.recordOperationCheck ?? true,
      recordLevelCheck: sourceScale?.recordLevelCheck ?? true,
      recordDirtCheck: sourceScale?.recordDirtCheck ?? true,
      recordDisplayValue: sourceScale?.recordDisplayValue ?? true,
      referenceWeight: selected.referenceWeight,
      minDisplayUnit: sourceScale?.minDisplayUnit ?? 0.1,
      repairStatus: sourceScale?.repairStatus ?? null,
      displayFrom: displayFrom || undefined,
      displayTo: displayTo || undefined,
    };
    if (isEditing && existing) {
      updateScale(existing.id, input);
      navigate(`${basePath}/scales/${existing.id}`, { state: { justSaved: true } });
    } else {
      addScale(input);
      navigate(`${basePath}/scales/registered`);
    }
  }

  return (
    <div>
      <PageTitleBar title="秤点検記録設定" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/scale-inspection" },
          { label: "秤点検記録設定", to: basePath },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-full">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">持ち場の運用期間</p>
              <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
            </div>
            <p className="text-sm text-[#808080]">
              選択した秤を使用して、この持ち場を有効にする期間を入力してください。
              <br />
              この期間中のみ、点検一覧でこの持ち場が選択可能になります。
              <br />
              設定した期間外は、秤が紐づいていてもこの持ち場は画面に表示されません。
            </p>
            <div className="flex gap-2 items-center">
              <DateFilterInput value={displayFrom} onChange={setDisplayFrom} />
              <span className="text-[var(--semantic-text-primary)]">〜</span>
              <DateFilterInput value={displayTo} onChange={setDisplayTo} />
            </div>
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">秤No.(ラベル名)</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <Pulldown
              value={scaleLabel}
              placeholder="選択してください"
              options={catalog.map((entry) => ({ value: entry.label, label: entry.label }))}
              onChange={setScaleLabel}
            />
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">持ち場</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            {factoryPosts.length === 0 ? (
              <p className="text-sm text-[var(--semantic-text-secondary)]">
                先に持ち場を登録してください
              </p>
            ) : (
              <Pulldown
                value={postId}
                placeholder="選択してください"
                options={factoryPosts.map((post) => ({ value: post.id, label: post.name }))}
                onChange={setPostId}
              />
            )}
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
    </div>
  );
}
