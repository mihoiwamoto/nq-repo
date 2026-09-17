import attentionIcon from "../../../assets/figma/icons/common/attention.svg";

/**
 * ログイン画面の上に出るオフラインの帯。
 * ログインボタンを押したときに通信できていないと出る（Figma「（仮案）オフライン時_ログインボタン後のエラー画面」）。
 * アプリ内の帯（AnnouncementBar）とは別物で、こちらは「まだログインできていない」ことの知らせ。
 */
export function OfflineBanner() {
  return (
    <div className="bg-[var(--semantic-status-error)] h-16 px-4 py-2 flex items-center rounded-t-lg shrink-0">
      <div className="flex items-center gap-1">
        <img src={attentionIcon} alt="" className="size-5 shrink-0 brightness-0 invert" />
        <p className="text-base font-semibold text-white">
          オフライン状態です。通信環境をご確認ください。
        </p>
      </div>
    </div>
  );
}
