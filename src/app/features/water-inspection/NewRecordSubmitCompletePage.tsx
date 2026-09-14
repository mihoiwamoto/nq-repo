import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";

export function NewRecordSubmitCompletePage() {
  const navigate = useNavigate();
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle="使用水の点検" message="ご協力ありがとうございます。" />;
  }

  return (
    <>
      <AppHeader title="使用水の点検" />
      <div className="flex-1 flex flex-col items-center justify-center gap-10 p-6">
        <div className="flex flex-col gap-4 items-center w-full max-w-[440px]">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-[var(--semantic-brand-primary)]">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
            <path d="M24 41L34 51L56 29" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-2xl text-[var(--semantic-brand-primary)] text-center">
            提出が完了しました！
          </p>
          <p className="text-base text-[var(--semantic-text-primary)] text-center">
            ご協力ありがとうございます。
          </p>
        </div>
        <div className="flex flex-col gap-10 items-center w-full max-w-[360px]">
          <button
            onClick={() => handleNavigate("/app/ledger-list/water-inspection")}
            className="bg-[var(--semantic-brand-primary)] h-16 w-full rounded-lg flex items-center justify-center text-xl text-white"
          >
            使用水の点検を終わる
          </button>
          <button
            onClick={() => handleNavigate("/app/ledger-list")}
            className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-full rounded-lg flex items-center justify-center text-xl text-[var(--semantic-brand-primary)]"
          >
            帳票一覧に戻る
          </button>
        </div>
      </div>
    </>
  );
}
