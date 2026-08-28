import { useNavigate } from "react-router-dom";

export function SessionExpiredDialog() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-col gap-4 items-center w-full">
            <svg viewBox="0 0 80 80" fill="none" className="size-20 text-[var(--semantic-brand-primary)]">
              <circle cx="40" cy="40" r="33.3" stroke="currentColor" strokeWidth="4" />
              <rect x="37" y="20" width="6" height="24" rx="3" fill="currentColor" />
              <rect x="37" y="52" width="6" height="8" rx="3" fill="currentColor" />
            </svg>
            <h2 className="text-2xl text-[var(--semantic-brand-primary)] text-center w-full">
              セッションが終了しました
            </h2>
          </div>
          <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
            セキュリティ保護のため自動的にログアウトされました。
            <br />
            再度ログインしてください。
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/app/login")}
          className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-brand-primary)]"
        >
          ログイン画面へ
        </button>
      </div>
    </div>
  );
}
