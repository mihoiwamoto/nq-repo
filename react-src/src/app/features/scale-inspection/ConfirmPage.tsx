import { useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { ACTORS } from "../cleaning-record/mockData";
import { useScaleInspection } from "./ScaleInspectionContext";

function Dash() {
  return <span className="inline-block w-3 h-px bg-[#333]" />;
}

function StatusTag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="h-6 w-16 rounded-lg flex items-center justify-center text-xs text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between w-full gap-6">
      <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
      <div className="text-base text-[var(--semantic-text-primary)] text-right">{value}</div>
    </div>
  );
}

function StatusRow({
  label,
  content,
  inspector,
  timestamp,
}: {
  label: string;
  content: ReactNode;
  inspector?: string;
  timestamp?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between w-full gap-6">
        <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
        <div className="flex justify-end">{content}</div>
      </div>
      <RecordTimestamp inspector={inspector} timestamp={timestamp} />
    </div>
  );
}

function ValueRow({
  label,
  sub,
  content,
  inspector,
  timestamp,
}: {
  label: string;
  sub: string;
  content: ReactNode;
  inspector?: string;
  timestamp?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between w-full gap-6">
        <div className="flex flex-col gap-2 items-start">
          <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
          <p className="text-sm text-[#808080]">{sub}</p>
        </div>
        <div className="text-base text-[var(--semantic-text-primary)] text-right">{content}</div>
      </div>
      <RecordTimestamp inspector={inspector} timestamp={timestamp} />
    </div>
  );
}

function RemarksRow({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
      <p className="text-base text-[var(--semantic-text-primary)]">{text}</p>
    </div>
  );
}

const HLine = () => <div className="border-t border-[#d0d0d0] w-full" />;

export function ConfirmPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, scalesByPost, submitPost } = useScaleInspection();

  const post = posts.find((p) => p.id === postId);
  const scales = postId ? scalesByPost[postId] ?? [] : [];
  const state = location.state as { date?: string; inspectorName?: string } | null;
  const date = state?.date ?? "";
  const inspectorName = state?.inspectorName ?? ACTORS[0].name;

  const [showExitDialog, setShowExitDialog] = useState(false);

  function handleSubmit() {
    if (!postId) return;
    submitPost(postId, { date, inspectorName });
    navigate(`/app/ledger-list/scale-inspection/posts/${postId}/complete`);
  }

  function handleDiscardAndLeave() {
    setShowExitDialog(false);
    navigate(-1);
  }

  return (
    <>
      <AppHeader title={`秤点検記録_${post?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full">
          <Row label="実施日" value={date.replaceAll("-", "/")} />
          <HLine />
          <Row label="実施者" value={inspectorName} />
          <HLine />
          <Row label="持ち場" value={post?.name ?? ""} />
        </div>

        {scales.map((scale) => (
          <div key={scale.id} className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full">
            <Row label="秤No.(ラベル名)" value={scale.label} />
            <HLine />
            <Row label="シリアルナンバー" value={scale.serialNumber} />
            <HLine />
            {scale.skipped ? (
              <>
                <StatusRow label="動作確認" content={<Dash />} />
                <HLine />
                <StatusRow label="水平点検" content={<Dash />} />
                <HLine />
                <StatusRow label="汚れ" content={<Dash />} />
                <HLine />
                <ValueRow label="秤の表示値(g)" sub={`使用分銅(g)：${scale.referenceWeight}`} content={<Dash />} />
                <HLine />
                <RemarksRow text="点検見送り" />
              </>
            ) : scale.record === null ? (
              <>
                <StatusRow label="動作確認" content={<Dash />} />
                <HLine />
                <StatusRow label="水平点検" content={<Dash />} />
                <HLine />
                <StatusRow label="汚れ" content={<Dash />} />
                <HLine />
                <ValueRow label="秤の表示値(g)" sub={`使用分銅(g)：${scale.referenceWeight}`} content={<Dash />} />
                <HLine />
                <RemarksRow text="" />
              </>
            ) : (
              <>
                <StatusRow
                  label="動作確認"
                  content={
                    scale.record?.actionCheck === "ng" ? (
                      <StatusTag label="異常あり" color="#f85c5c" />
                    ) : (
                      <StatusTag label="正常" color="#19c95f" />
                    )
                  }
                  inspector={scale.record?.inspector ?? inspectorName}
                  timestamp={scale.record?.timestamps?.actionCheck}
                />
                <HLine />
                {/* 記録が入っていない項目は「正常」ではなく横棒。タイムスタンプも出ない */}
                <StatusRow
                  label="水平点検"
                  content={scale.record?.levelCheck ? <StatusTag label="正常" color="#19c95f" /> : <Dash />}
                  inspector={scale.record?.inspector ?? inspectorName}
                  timestamp={scale.record?.timestamps?.levelCheck}
                />
                <HLine />
                <StatusRow
                  label="汚れ"
                  content={scale.record?.dirtCheck ? <StatusTag label="正常" color="#19c95f" /> : <Dash />}
                  inspector={scale.record?.inspector ?? inspectorName}
                  timestamp={scale.record?.timestamps?.dirtCheck}
                />
                <HLine />
                <ValueRow
                  label="秤の表示値(g)"
                  sub={`使用分銅(g)：${scale.referenceWeight}`}
                  content={scale.record?.displayValue || <Dash />}
                  inspector={scale.record?.inspector ?? inspectorName}
                  timestamp={scale.record?.timestamps?.displayValue}
                />
                <HLine />
                <RemarksRow text={scale.record?.remarks ?? ""} />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setShowExitDialog(true)}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>

      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExitDialog(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-4 items-center w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                　未提出の項目があります
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
                入力内容が提出されていません。このまま別の画面に切り替えると、入力内容は失われます。本当に画面を切り替えますか？
              </p>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setShowExitDialog(false)}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDiscardAndLeave}
                className="bg-[var(--semantic-brand-danger)] h-16 w-60 rounded-lg text-xl text-white"
              >
                破棄して画面移動
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
