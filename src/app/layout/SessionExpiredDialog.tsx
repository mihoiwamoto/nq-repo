import { useNavigate } from "react-router-dom";
import attentionIcon from "../../assets/figma/icons/common/attention.svg";

/**
 * 一定時間さわっていないと出る「セッションが終了しました」のポップアップ。
 *
 * 大きさは中身なり（Figma のダイアログも高さ固定ではない）。以前は h-738px を
 * 決め打ちしていて、文字の 2 倍以上の高さの箱になっていた。
 */
export function SessionExpiredDialog() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(51,51,51,0.5)]" />
      <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-full">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-col gap-4 items-center w-full">
            <span
              aria-hidden
              className="size-20 shrink-0"
              style={{
                WebkitMaskImage: `url("${attentionIcon}")`,
                maskImage: `url("${attentionIcon}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "var(--semantic-brand-primary)",
              }}
            />
            <h2 className="text-2xl font-semibold text-[var(--semantic-brand-primary)] text-center w-full">
              セッションが終了しました
            </h2>
          </div>
          <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
            セキュリティ保護のため自動的にログアウトされました。
            <br />
            再度ログインしてください。
          </p>
        </div>
        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => navigate("/app/login")}
            className="bg-white border border-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 max-w-full px-4 py-2 rounded-lg text-xl font-semibold text-[var(--semantic-brand-primary)]"
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    </div>
  );
}
