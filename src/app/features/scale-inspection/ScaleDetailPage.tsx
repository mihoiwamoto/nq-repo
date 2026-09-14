import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { useScaleInspection } from "./ScaleInspectionContext";

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

function Dash() {
  return <span className="inline-block w-3 h-px bg-[#333]" />;
}

const HLine = () => <div className="border-t border-[#d0d0d0] w-full" />;

export function ScaleDetailPage() {
  const { postId, scaleId } = useParams<{ postId: string; scaleId: string }>();
  const navigate = useNavigate();
  const { posts, scalesByPost } = useScaleInspection();

  const post = posts.find((p) => p.id === postId);
  const scale = postId ? scalesByPost[postId]?.find((s) => s.id === scaleId) : undefined;

  return (
    <>
      <AppHeader title="秤点検記録" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {post?.date ? post.date.replaceAll("-", "/") : ""}
            </p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{post?.inspectorName ?? ""}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">持ち場</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{post?.name ?? ""}</p>
          </div>
        </div>

        {scale && (
          <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">秤No.(ラベル名)</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{scale.label}</p>
            </div>
            <HLine />
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">シリアルナンバー</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{scale.serialNumber}</p>
            </div>
            <HLine />
            {scale.skipped ? (
              <>
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">動作確認</p>
                  <Dash />
                </div>
                <HLine />
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">水平点検</p>
                  <Dash />
                </div>
                <HLine />
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">汚れ</p>
                  <Dash />
                </div>
                <HLine />
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-2 items-start">
                    <p className="text-base text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                    <p className="text-sm text-[#808080]">使用分銅(g)：{scale.referenceWeight}</p>
                  </div>
                  <Dash />
                </div>
                <HLine />
                <div className="flex flex-col gap-2 items-start w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">点検見送り</p>
                </div>
              </>
            ) : scale.record === null ? (
              <>
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">動作確認</p>
                  <Dash />
                </div>
                <HLine />
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">水平点検</p>
                  <Dash />
                </div>
                <HLine />
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">汚れ</p>
                  <Dash />
                </div>
                <HLine />
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-2 items-start">
                    <p className="text-base text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                    <p className="text-sm text-[#808080]">使用分銅(g)：{scale.referenceWeight}</p>
                  </div>
                  <Dash />
                </div>
                <HLine />
                <div className="flex flex-col gap-2 items-start w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                  <p className="text-base text-[var(--semantic-text-primary)]"></p>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">動作確認</p>
                    {scale.record?.actionCheck === "ng" ? (
                      <StatusTag label="異常あり" color="#f85c5c" />
                    ) : (
                      <StatusTag label="正常" color="#19c95f" />
                    )}
                  </div>
                  <RecordTimestamp
                    inspector={scale.record?.inspector ?? post?.inspectorName}
                    timestamp={scale.record?.timestamps?.actionCheck}
                  />
                </div>
                <HLine />
                {/* 記録が入っていない項目は「正常」ではなく横棒。タイムスタンプも出ない */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">水平点検</p>
                    {scale.record?.levelCheck ? <StatusTag label="正常" color="#19c95f" /> : <Dash />}
                  </div>
                  <RecordTimestamp
                    inspector={scale.record?.inspector ?? post?.inspectorName}
                    timestamp={scale.record?.timestamps?.levelCheck}
                  />
                </div>
                <HLine />
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">汚れ</p>
                    {scale.record?.dirtCheck ? <StatusTag label="正常" color="#19c95f" /> : <Dash />}
                  </div>
                  <RecordTimestamp
                    inspector={scale.record?.inspector ?? post?.inspectorName}
                    timestamp={scale.record?.timestamps?.dirtCheck}
                  />
                </div>
                <HLine />
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-2 items-start">
                      <p className="text-base text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                      <p className="text-sm text-[#808080]">使用分銅(g)：{scale.referenceWeight}</p>
                    </div>
                    {scale.record?.displayValue ? (
                      <p className="text-base text-[var(--semantic-text-primary)]">{scale.record.displayValue}</p>
                    ) : (
                      <Dash />
                    )}
                  </div>
                  <RecordTimestamp
                    inspector={scale.record?.inspector ?? post?.inspectorName}
                    timestamp={scale.record?.timestamps?.displayValue}
                  />
                </div>
                <HLine />
                <div className="flex flex-col gap-2 items-start w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">{scale.record?.remarks ?? ""}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] flex items-center justify-center flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
      </div>
    </>
  );
}
