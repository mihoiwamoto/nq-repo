import attentionIcon from "../../assets/figma/icons/common/attention.svg";
import checkIcon from "../../assets/figma/icons/common/check.svg";

/**
 * 画面いちばん上の帯。Figma「アナウンスバー表示」の 3 つがそのまま対応する。
 * - unsent  … 送信できていない記録が端末に残っている（アナウンスバー_未送信状態）
 * - failed  … 送信を試したが失敗した（アナウンスバー_送信失敗）
 * - success … 送信できた（アナウンスバー_送信成功）
 *
 * オフラインであること自体の帯は出さない。オフラインのときも、出るのは
 * 「未送信のデータがあります」の帯だけにする（Figma にオフライン専用の帯が無いため）。
 */
export type AnnouncementStatus = "unsent" | "failed" | "success";

/**
 * 帯の高さは状態が変わっても動かないように固定する。
 * 「未送信」だけ送信ボタン（h-10）があって高く、他は文字だけで低かったため、
 * 送信を押して 未送信 → 送信失敗 に変わった瞬間に下の画面全体が 16px ずり上がっていた。
 * いちばん高い「未送信」に合わせて 56px で揃える。
 */
const BAR_HEIGHT = "h-14";

export function AnnouncementBar({
  status,
  onSend,
}: {
  status: AnnouncementStatus;
  onSend?: () => void;
}) {
  if (status === "success") {
    return (
      <div className={`bg-[var(--semantic-status-success)] flex items-center gap-1 px-4 py-2 rounded-t-lg shrink-0 ${BAR_HEIGHT}`}>
        <img src={checkIcon} alt="" className="size-5 shrink-0" />
        <p className="text-base font-semibold text-white">データの送信が完了しました。</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={`bg-[var(--semantic-status-error)] flex items-center gap-1 px-4 py-2 rounded-t-lg shrink-0 ${BAR_HEIGHT}`}>
        <img src={attentionIcon} alt="" className="size-5 shrink-0 brightness-0 invert" />
        <p className="text-base font-semibold text-white">
          データの送信ができませんでした。オンライン状態で再度お試しください。
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--semantic-status-error)] flex items-center justify-between gap-4 px-4 py-2 rounded-t-lg shrink-0 ${BAR_HEIGHT}`}>
      <div className="flex items-center gap-1">
        <img src={attentionIcon} alt="" className="size-5 shrink-0 brightness-0 invert" />
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
