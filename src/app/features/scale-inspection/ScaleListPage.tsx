import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-success.svg";
import { DateFilterInput } from "../../components/DateFilterInput";
import { todayString } from "../../utils/date";
import { seedTimestamp, seedTimestamps } from "../../utils/recordTimestamps";
import {
  fillSlice,
  useProgressConfirmed,
  useProgressRecordFill,
  type RecordFill,
} from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import { ACTORS } from "../cleaning-record/mockData";
import { useScaleInspection } from "./ScaleInspectionContext";
import {
  pendingReviewScales,
  scalesByPost as registeredScalesByPost,
  spareScales,
  type ActionCheck,
} from "./mockData";

function Dash() {
  return <span className="inline-block w-3 h-px bg-[#333] mx-auto" />;
}

function ActionCheckBadge({ value }: { value: ActionCheck }) {
  if (value === "ok") {
    return (
      <span className="size-6 flex items-center justify-center text-[var(--semantic-status-success)] text-lg mx-auto">
        <img src={iconCheck} alt="正常" className="size-4" />
      </span>
    );
  }
  if (value === "ng") {
    return (
      <span className="size-6 flex items-center justify-center mx-auto">
        <img src={iconXMark} alt="異常あり" className="size-6" />
      </span>
    );
  }
  return null;
}

function CheckBadge({ checked }: { checked: boolean }) {
  if (!checked) return null;
  return (
    <span className="size-6 flex items-center justify-center text-[var(--semantic-status-success)] text-lg mx-auto">
      <img src={iconCheck} alt="確認" className="size-4" />
    </span>
  );
}

const COLUMNS = [
  { key: "op", label: "操作", width: 80 },
  { key: "label", label: "秤No.(ラベル名)", width: 204 },
  { key: "serial", label: "シリアルナンバー", width: 128 },
  { key: "action", label: "動作\n確認", width: 60 },
  { key: "level", label: "水平\n点検", width: 60 },
  { key: "dirt", label: "汚れ", width: 60 },
  { key: "display", label: "秤の\n表示値(g)", width: 80 },
] as const;

type SourceScale = { label: string; serialNumber: string; referenceWeight: number };

export function ScaleListPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, scalesByPost, addScaleWithId, seedPostRecords } = useScaleInspection();

  const post = posts.find((p) => p.id === postId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const postFill: RecordFill = post?.status === "inspected" ? "full" : "none";
  const fill = progressFill ?? postFill;
  // 確認完了は確認まで通った記録なので、どの秤も欠けのない（すべて正常な）記録で埋める
  const confirmed = useProgressConfirmed();
  const scales = postId ? scalesByPost[postId] ?? [] : [];

  const inspectorName = (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;

  // 記録は context に入れる。ここで表示用に作るだけだと、詳細画面・確認画面が空のままになる。
  // 流し込みは「持ち場 + 記録の入り具合」ごとに 1 回だけ（同じ状態で開き直したときは
  // 入力を消さないよう context 側で無視される）。
  useEffect(() => {
    if (!postId) return;
    // 未点検で空にしたあとに別のステータスで開き直しても記録を作れるよう、
    // 空のときは登録されている秤を土台にする
    const live = scalesByPost[postId] ?? [];
    const baseScales = live.length > 0 ? live : registeredScalesByPost[postId] ?? [];
    const completeRecord =
      pendingReviewScales.find((s) => s.record?.actionCheck === "ok")?.record ??
      pendingReviewScales[0]?.record ??
      null;
    // 点検中は前半の秤だけ記録が入った「記録途中」の状態にする
    const recordedIds = new Set(fillSlice(baseScales, fill).map((scale) => scale.id));
    seedPostRecords(
      postId,
      Object.fromEntries(
        baseScales.map((scale) => {
          if (!recordedIds.has(scale.id)) return [scale.id, null];
          const reviewed = confirmed
            ? completeRecord
            : (pendingReviewScales.find((s) => s.id === scale.id) ?? pendingReviewScales[0])?.record ?? null;
          // モックの記録には入力時刻が入っていないので、実施日から組み立てて付けておく。
          // これが無いと確認画面・詳細画面で「記録はあるのにタイムスタンプだけ出ない」状態になる。
          // 値の入っている項目にだけ付くので、未入力の項目はタイムスタンプも出ない。
          const stamped = reviewed && {
            ...reviewed,
            inspector: reviewed.inspector ?? inspectorName,
            timestamps:
              reviewed.timestamps ??
              seedTimestamps(
                {
                  actionCheck: reviewed.actionCheck,
                  levelCheck: reviewed.levelCheck,
                  dirtCheck: reviewed.dirtCheck,
                  displayValue: reviewed.displayValue,
                },
                seedTimestamp(post?.date)
              ),
          };
          return [scale.id, stamped];
        })
      ),
      `${fill}:${confirmed}`,
      // 未点検はまだ 1 台も点検していないので、秤の行そのものを出さない
      { clearScales: fill === "none" }
    );
  }, [postId, fill, confirmed, scalesByPost, seedPostRecords, post?.date, inspectorName]);

  const [date, setDate] = useState(() => (fill !== "none" ? post?.date || todayString() : todayString()));

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTab, setAddTab] = useState<"other" | "spare">("other");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceScale | null>(null);

  const canProceed = date !== "" && scales.length > 0;

  const otherPostGroups = posts
    .filter((p) => p.id !== postId)
    .map((p) => ({ post: p, scales: scalesByPost[p.id] ?? [] }))
    .filter((group) => group.scales.length > 0);

  function openAddDialog() {
    setAddTab("other");
    setSelectedKey(null);
    setSelectedSource(null);
    setAddDialogOpen(true);
  }

  function closeAddDialog() {
    setAddDialogOpen(false);
  }

  function selectOtherScale(key: string, source: SourceScale) {
    setSelectedKey(key);
    setSelectedSource(source);
  }

  function confirmAddDialog() {
    if (!postId || !selectedSource) return;
    const newId = `${postId}-${scales.length + 1}`;
    addScaleWithId(postId, newId, selectedSource);
    setAddDialogOpen(false);
    navigate(`/app/ledger-list/scale-inspection/posts/${postId}/scales/${newId}`, {
      state: { inspectorName },
    });
  }

  return (
    <>
      <AppHeader title={`秤点検記録_${post?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
        <div className="flex flex-col gap-4 items-start w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <DateFilterInput value={date} onChange={setDate} />
          </div>

          <div className="bg-white rounded-lg overflow-x-auto w-full">
            <table className="border-collapse w-full">
              <thead>
                <tr className="bg-[var(--semantic-brand-primary)]">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.width }}
                      className="text-white text-sm font-semibold px-2 py-2 whitespace-pre-line"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scales.length === 0 ? (
                  // 未点検は「表が空欄」の状態にしたいので、案内文も出さない
                  fill === "none" ? null : (
                    <tr>
                      <td colSpan={COLUMNS.length} className="text-center text-[var(--semantic-text-secondary)] py-8">
                        点検する秤が登録されていません
                      </td>
                    </tr>
                  )
                ) : (
                  scales.map((scale, index) => (
                    <tr key={scale.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                      <td className="px-2 py-2 text-center">
                        <Link
                          to={`/app/ledger-list/scale-inspection/posts/${postId}/scales/${scale.id}`}
                          state={{ inspectorName }}
                          className="bg-[var(--semantic-brand-primary)] inline-flex h-8 w-14 items-center justify-center rounded-lg text-xs text-white"
                        >
                          詳細
                        </Link>
                      </td>
                      <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]">{scale.label}</td>
                      <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                        {scale.serialNumber}
                      </td>
                      <td
                        className={`px-2 py-2 text-center ${
                          !scale.skipped && scale.record?.actionCheck === "ng"
                            ? "bg-[var(--semantic-status-error)]"
                            : ""
                        }`}
                      >
                        {scale.skipped ? <Dash /> : <ActionCheckBadge value={scale.record?.actionCheck ?? null} />}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {scale.skipped ? (
                          <Dash />
                        ) : (
                          <CheckBadge checked={scale.record?.levelCheck ?? false} />
                        )}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {scale.skipped ? (
                          <Dash />
                        ) : (
                          <CheckBadge checked={scale.record?.dirtCheck ?? false} />
                        )}
                      </td>
                      <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                        {scale.skipped ? <Dash /> : scale.record?.displayValue ?? ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={openAddDialog}
            className="bg-white border border-[var(--semantic-brand-primary)] flex gap-1 h-12 items-center justify-center rounded-lg w-full text-lg text-[var(--semantic-brand-primary)]"
          >
            <span className="text-xl leading-none">＋</span>点検する秤を追加
          </button>
        </div>
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
          disabled={!canProceed}
          onClick={() =>
            navigate(`/app/ledger-list/scale-inspection/posts/${postId}/confirm`, {
              state: { date, inspectorName },
            })
          }
          className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
            canProceed ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
          }`}
        >
          確認画面へ
        </button>
      </div>

      {addDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeAddDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-full mx-40 mx-16 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">秤を選択してください</h2>
              <div className="flex flex-col gap-4 items-start w-full">
                <div className="flex gap-4 items-start w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setAddTab("other");
                      setSelectedKey(null);
                      setSelectedSource(null);
                    }}
                    className={`flex-1 h-12 rounded-lg text-base ${
                      addTab === "other"
                        ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                        : "bg-white text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    別の持ち場の秤
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddTab("spare");
                      setSelectedKey(null);
                      setSelectedSource(null);
                    }}
                    className={`flex-1 h-12 rounded-lg text-base ${
                      addTab === "spare"
                        ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                        : "bg-white text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    予備の秤
                  </button>
                </div>

                <div className="bg-white flex flex-col gap-6 items-start p-4 rounded-lg w-full max-h-[308px] overflow-y-auto overflow-x-hidden">
                  {addTab === "other" ? (
                    otherPostGroups.length === 0 ? (
                      <p className="text-base text-[var(--semantic-text-secondary)]">
                        他の持ち場に登録されている秤はありません
                      </p>
                    ) : (
                      otherPostGroups.map((group) => (
                        <div key={group.post.id} className="flex flex-col items-start w-full">
                          <p className="h-6 text-base text-[var(--semantic-brand-primary)]">{group.post.name}</p>
                          <div className="flex flex-col items-start w-full">
                            {group.scales.map((scale) => {
                              const key = `${group.post.id}-${scale.id}`;
                              const selected = selectedKey === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() =>
                                    selectOtherScale(key, {
                                      label: scale.label,
                                      serialNumber: scale.serialNumber,
                                      referenceWeight: scale.referenceWeight,
                                    })
                                  }
                                  className="border-b border-[#d0d0d0] flex gap-1 h-12 items-center w-full"
                                >
                                  <span
                                    className={`size-4 rounded-full border shrink-0 flex items-center justify-center ${
                                      selected
                                        ? "border-[var(--semantic-brand-primary)]"
                                        : "border-[var(--semantic-text-secondary)]"
                                    }`}
                                  >
                                    {selected && (
                                      <span className="size-2 rounded-full bg-[var(--semantic-brand-primary)]" />
                                    )}
                                  </span>
                                  <span
                                    className={`text-sm text-left ${
                                      selected
                                        ? "text-[var(--semantic-brand-primary)]"
                                        : "text-[var(--semantic-text-primary)]"
                                    }`}
                                  >
                                    {scale.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="flex flex-col items-start w-full">
                      {spareScales.map((spare) => {
                        const key = `spare-${spare.id}`;
                        const selected = selectedKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              selectOtherScale(key, {
                                label: spare.label,
                                serialNumber: spare.serialNumber,
                                referenceWeight: spare.referenceWeight,
                              })
                            }
                            className="border-b border-[#d0d0d0] flex gap-1 h-12 items-center w-full"
                          >
                            <span
                              className={`size-4 rounded-full border shrink-0 flex items-center justify-center ${
                                selected
                                  ? "border-[var(--semantic-brand-primary)]"
                                  : "border-[var(--semantic-text-secondary)]"
                              }`}
                            >
                              {selected && <span className="size-2 rounded-full bg-[var(--semantic-brand-primary)]" />}
                            </span>
                            <span
                              className={`text-sm text-left ${
                                selected ? "text-[var(--semantic-brand-primary)]" : "text-[var(--semantic-text-primary)]"
                              }`}
                            >
                              {spare.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeAddDialog}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!selectedSource}
                onClick={confirmAddDialog}
                className={`h-16 w-60 rounded-lg text-xl text-white ${
                  selectedSource ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
                }`}
              >
                点検画面へ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
