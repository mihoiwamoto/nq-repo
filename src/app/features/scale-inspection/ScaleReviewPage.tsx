import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import { AppHeader } from "../../layout/AppHeader";
import { useScaleInspection } from "./ScaleInspectionContext";
import type { ActionCheck } from "./mockData";

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
      <span className="size-6 rounded flex items-center justify-center bg-[#f85c5c] text-white text-sm mx-auto">
        <img src={iconXMark} alt="異常あり" className="size-3" />
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

export function ScaleReviewPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, scalesByPost } = useScaleInspection();

  const post = posts.find((p) => p.id === postId);
  const scales = postId ? scalesByPost[postId] ?? [] : [];
  const locked = (location.state as { locked?: boolean } | null)?.locked ?? false;

  return (
    <>
      <AppHeader title="秤点検記録" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="flex justify-end w-full max-w-full max-w-[480px] mx-40">
          {!locked && (
            <Link
              to={`/app/ledger-list/scale-inspection/posts/${postId}`}
              className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center h-10 px-4 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              <img src={iconEdit} alt="編集" className="size-5" />
              編集
            </Link>
          )}
        </div>

        <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {post?.date ? post.date.replaceAll("-", "/") : ""}
            </p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{post?.inspectorName ?? ""}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">持ち場</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{post?.name ?? ""}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full max-w-[480px] mx-40">
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
              {scales.map((scale, index) => (
                <tr key={scale.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                  <td className="px-2 py-2 text-center">
                    <Link
                      to={`/app/ledger-list/scale-inspection/posts/${postId}/scales/${scale.id}/review`}
                      state={{ locked }}
                      className="bg-[var(--semantic-brand-primary)] inline-flex h-8 w-14 items-center justify-center rounded-lg text-xs text-white"
                    >
                      詳細
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]">{scale.label}</td>
                  <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                    {scale.serialNumber}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {scale.skipped ? <Dash /> : <ActionCheckBadge value={scale.record?.actionCheck ?? null} />}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {scale.skipped || scale.record === null || scale.record?.actionCheck === "ng" ? (
                      <Dash />
                    ) : (
                      <CheckBadge checked={scale.record?.levelCheck ?? false} />
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {scale.skipped || scale.record === null || scale.record?.actionCheck === "ng" ? (
                      <Dash />
                    ) : (
                      <CheckBadge checked={scale.record?.dirtCheck ?? false} />
                    )}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {scale.skipped || scale.record === null || scale.record?.actionCheck === "ng"
                      ? <Dash />
                      : scale.record?.displayValue ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </div>
    </>
  );
}
