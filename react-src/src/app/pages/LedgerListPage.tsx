import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../layout/AppHeader";
import { visibleLedgerCategories } from "../../data/ledgerVisibility";
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

/**
 * 帳票一覧のタイルの並び。確定デザイン（Figma 帳票一覧 7139:282835）では官能検査記録が秤点検記録の前に来る
 * （管理画面の帳票の並び＝data/ledgers.ts とはここだけ違う）。ここに無い帳票は ledgers.ts の順で後ろに並ぶ。
 */
const APP_TILE_ORDER = [
  "water-inspection",
  "glass-plastic",
  "sensory-inspection",
  "scale-inspection",
  "metal-xray-detection",
  "sample-management",
  "equipment-inspection",
  "cleaning-record",
  "chemical-management",
  "additive-management",
];
const tileRank = (slug: string) => {
  const i = APP_TILE_ORDER.indexOf(slug);
  return i < 0 ? APP_TILE_ORDER.length : i;
};

/** タイルの中で改行する位置を決めている帳票名（確定デザインは「金属探知機・」で折り返す） */
const TILE_LINES: Record<string, string[]> = {
  "metal-xray-detection": ["金属探知機・", "X線探知機"],
};
function TileLabel({ slug, label }: { slug: string; label: string }) {
  const lines = TILE_LINES[slug];
  return (
    // 確定デザイン：名前は高さ 38px の枠の上下中央（1 行の名前は 2 行より下に来る。2026-10-08）
    <span className="h-[38px] flex flex-col items-center justify-center text-base text-[var(--semantic-brand-primary)] text-center leading-[1.4]">
      {lines
        ? lines.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))
        : label}
    </span>
  );
}

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
      {/* 確定デザイン（7139:282835・7139:245397）：ヘッダーの下 24px、タイルの中身は上から 17px（名前の位置を合わせる。2026-10-08） */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-4 justify-items-start content-start items-start gap-x-8 gap-y-6">
          {[...visibleLedgerCategories()].sort((a, b) => tileRank(a.slug) - tileRank(b.slug)).map((category) =>
            ACTOR_PICKER_SLUGS.includes(category.slug) ? (
              <button
                key={category.slug}
                type="button"
                onClick={() => openActorPicker(category.slug)}
                className="size-36 bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col items-center justify-start gap-2 px-2 pt-[17px]"
              >
                <img src={category.appIcon} alt={category.appLabel} className="size-16" />
                <TileLabel slug={category.slug} label={category.appLabel} />
              </button>
            ) : (
              <Link
                key={category.slug}
                to={`/app/ledger-list/${category.slug}`}
                className="size-36 bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col items-center justify-start gap-2 px-2 pt-[17px]"
              >
                <img src={category.appIcon} alt="" className="size-16" />
                <TileLabel slug={category.slug} label={category.appLabel} />
              </Link>
            )
          )}
        </div>
      </div>

      {actorPickerSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[rgba(51,51,51,0.5)]" onClick={() => setActorPickerSlug(null)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
            <h2 className="-mb-4 text-2xl text-black">実施者を選んでください</h2>
            <div className="grid grid-cols-3 gap-4 w-full content-start overflow-y-auto flex-1">
              {ACTORS.map((actor) => (
                <button
                  key={actor.id}
                  type="button"
                  onClick={() => setSelectedActorId(actor.id)}
                  className={`h-[78px] rounded-lg flex flex-col items-center justify-center gap-1 px-4 shadow-[0px_2px_6px_rgba(51,51,51,0.24)] ${
                    selectedActorId === actor.id
                      ? "bg-white border-2 border-[var(--semantic-brand-primary)]"
                      : "bg-white border-2 border-transparent"
                  }`}
                >
                  <span className="text-lg leading-[1.4] text-[var(--semantic-text-primary)]">{actor.name}</span>
                  <span className="text-sm text-[var(--semantic-text-secondary)]">{actor.id}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setActorPickerSlug(null)}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[#333] font-semibold hover:bg-gray-50"
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
