import { useLocation, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";

export function SampleSubmitCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { fromProgress?: boolean } | null;
  const fromProgress = state?.fromProgress ?? false;

  return (
    <>
      <AppHeader title="検体管理" />
      <div className="flex-1 flex flex-col items-center justify-start gap-10 p-6 pt-20">
        <div className="flex flex-col gap-4 items-center w-full max-w-[440px]">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-[var(--semantic-brand-primary)]">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" />
            <path d="M24 41L34 51L56 29" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-2xl text-[var(--semantic-brand-primary)] text-center">
            提出が完了しました！
          </p>
          <p className="text-base text-[var(--semantic-text-primary)] text-center">
            ご記入ありがとうございます。
          </p>
        </div>
        <div className="flex flex-col gap-10 items-center w-full max-w-[360px]">
          <button
            type="button"
            onClick={() => navigate("/app/progress", { state: { fromProgress } })}
            className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-full rounded-lg flex items-center justify-center text-xl text-[var(--semantic-brand-primary)]"
          >
            進捗一覧に戻る
          </button>
        </div>
      </div>
    </>
  );
}
