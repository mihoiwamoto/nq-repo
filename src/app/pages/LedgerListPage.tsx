import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../layout/AppHeader";
import { ledgerCategories } from "../../data/ledgers";
import { ACTORS } from "../features/cleaning-record/mockData";

const ACTOR_PICKER_SLUGS = [
  "cleaning-record",
  "glass-plastic",
  "sample-management",
  "metal-xray-detection",
  "water-inspection",
  "scale-inspection",
  "sensory-inspection",
  "equipment-inspection",
  "chemical-management",
  "additive-management",
];

export function LedgerListPage() {
  const navigate = useNavigate();
  const [actorPickerSlug, setActorPickerSlug] = useState<string | null>(null);
  const [selectedActorId, setSelectedActorId] = useState(ACTORS[0].id);

  function openActorPicker(slug: string) {
    setSelectedActorId(ACTORS[0].id);
    setActorPickerSlug(slug);
  }

  function confirmActorPicker() {
    if (!actorPickerSlug) return;
    const actor = ACTORS.find((a) => a.id === selectedActorId) ?? ACTORS[0];
    const slug = actorPickerSlug;
    setActorPickerSlug(null);
    navigate(`/app/ledger-list/${slug}`, { state: { inspectorName: actor.name } });
  }

  return (
    <>
      <AppHeader title="帳票一覧" />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap content-start items-start gap-x-8 gap-y-6">
          {ledgerCategories.map((category) =>
            ACTOR_PICKER_SLUGS.includes(category.slug) ? (
              <button
                key={category.slug}
                type="button"
                onClick={() => openActorPicker(category.slug)}
                className="size-36 bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col items-center justify-center gap-2 px-2"
              >
                <img src={category.appIcon} alt={category.appLabel} className="size-16" />
                <span className="text-base text-[var(--semantic-brand-primary)] text-center leading-[1.4]">
                  {category.appLabel}
                </span>
              </button>
            ) : (
              <Link
                key={category.slug}
                to={`/app/ledger-list/${category.slug}`}
                className="size-36 bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col items-center justify-center gap-2 px-2"
              >
                <img src={category.appIcon} alt="" className="size-16" />
                <span className="text-base text-[var(--semantic-brand-primary)] text-center leading-[1.4]">
                  {category.appLabel}
                </span>
              </Link>
            )
          )}
        </div>
      </div>

      {actorPickerSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[rgba(51,51,51,0.5)]" onClick={() => setActorPickerSlug(null)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">実施者を選んでください</h2>
            <div className="grid grid-cols-3 gap-4 w-full content-start overflow-y-auto flex-1">
              {ACTORS.map((actor) => (
                <button
                  key={actor.id}
                  type="button"
                  onClick={() => setSelectedActorId(actor.id)}
                  className={`h-[78px] rounded-lg flex flex-col items-center justify-start pt-2 gap-0 p-4 shadow-[0px_2px_3px_rgba(51,51,51,0.24)] ${
                    selectedActorId === actor.id
                      ? "bg-white border-2 border-[var(--semantic-brand-primary)]"
                      : "bg-white border-2 border-transparent"
                  }`}
                >
                  <span className="text-base text-[var(--semantic-text-primary)]">{actor.name}</span>
                  <span className="text-sm text-[var(--semantic-text-secondary)]">{actor.id}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setActorPickerSlug(null)}
                className="bg-white border-2 border-[#333] h-16 w-60 rounded-lg text-xl text-[#333] font-semibold hover:bg-gray-50"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={confirmActorPicker}
                className="bg-[#094] h-16 w-60 rounded-lg text-xl text-white font-semibold hover:bg-[#076a38]"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
