import attentionIcon from "../../assets/figma/icons/common/attention.svg";
import checkIcon from "../../assets/figma/icons/common/check.svg";

export type AnnouncementStatus = "unsent" | "failed" | "success";

export function AnnouncementBar({
  status,
  onSend,
}: {
  status: AnnouncementStatus;
  onSend?: () => void;
}) {
  if (status === "success") {
    return (
      <div className="bg-[var(--semantic-status-success)] flex items-center gap-1 px-4 py-2 rounded-t-lg shrink-0">
        <img src={checkIcon} alt="" className="size-5 shrink-0" />
        <p className="text-base font-semibold text-white">データの送信が完了しました。</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="bg-[var(--semantic-status-error)] flex items-center gap-1 px-4 py-2 rounded-t-lg shrink-0">
        <img src={attentionIcon} alt="" className="size-5 shrink-0" />
        <p className="text-base font-semibold text-white">
          データの送信ができませんでした。オンライン状態で再度お試しください。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--semantic-status-error)] flex items-center justify-between gap-4 px-4 py-2 rounded-t-lg shrink-0">
      <div className="flex items-center gap-1">
        <img src={attentionIcon} alt="" className="size-5 shrink-0" />
        <p className="text-base font-semibold text-white">
          未送信のデータがあります。送信ボタンを押してください。
        </p>
      </div>
      <button
        type="button"
        onClick={onSend}
        className="bg-white h-10 w-[104px] rounded-lg text-base font-semibold text-[var(--semantic-status-error)] shrink-0"
      >
        送信
      </button>
    </div>
  );
}
