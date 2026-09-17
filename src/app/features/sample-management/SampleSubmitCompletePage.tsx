import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SubmitOutcome } from "../../components/SubmitOutcome";
import { useFromProgress } from "../../layout/ProgressFlowContext";

export function SampleSubmitCompletePage() {
  const navigate = useNavigate();
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle="検体管理" />;
  }

  return (
    <SubmitOutcome
      ledgerTitle="検体管理"
      backLabel="帳票一覧に戻る"
      onBack={() => handleNavigate("/app/ledger-list")}
    >
      <AppHeader title="検体管理" />
      <div className="flex-1 flex flex-col items-center justify-start gap-10 px-8 py-6">
        <div className="flex flex-col gap-6 items-center w-full max-w-[640px]">
          <div className="flex flex-col gap-4 items-center w-full">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              className="text-[var(--semantic-brand-primary)] shrink-0"
              aria-hidden="true"
            >
              <path
                d="M66.6667 40C66.6667 25.2724 54.7276 13.3334 40 13.3334C25.2724 13.3334 13.3333 25.2724 13.3333 40C13.3333 54.7276 25.2724 66.6667 40 66.6667C54.7276 66.6667 66.6667 54.7276 66.6667 40ZM73.3333 40C73.3333 58.4095 58.4095 73.3334 40 73.3334C21.5905 73.3334 6.66667 58.4095 6.66667 40C6.66667 21.5905 21.5905 6.6667 40 6.6667C58.4095 6.6667 73.3333 21.5905 73.3333 40Z"
                fill="currentColor"
              />
              <path
                d="M52.4935 30.5265C53.7953 29.225 55.9054 29.2249 57.207 30.5265C58.5084 31.8282 58.5084 33.9384 57.207 35.2401L38.3887 54.0584L38.1445 54.2798C37.5516 54.7651 36.8049 55.0317 36.0319 55.0317C35.2587 55.0315 34.5121 54.7656 33.9193 54.2798L33.6751 54.0584L24.4596 44.8397C23.1581 43.5379 23.158 41.4278 24.4596 40.1261C25.7613 38.8247 27.8715 38.8247 29.1732 40.1261L36.0319 46.9849L52.4935 30.5265Z"
                fill="currentColor"
              />
            </svg>
            <p className="text-2xl text-[var(--semantic-brand-primary)] text-center w-full">
              提出が完了しました！
            </p>
          </div>
          <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
            ご記入ありがとうございます。
          </p>
        </div>
        <div className="flex flex-col gap-10 items-center w-full max-w-[360px]">
          <button
            type="button"
            onClick={() => handleNavigate("/app/ledger-list/sample-management")}
            className="bg-[var(--semantic-brand-primary)] h-16 w-full rounded-lg flex items-center justify-center text-xl text-white"
          >
            検体管理を続ける
          </button>
          <button
            type="button"
            onClick={() => handleNavigate("/app/ledger-list")}
            className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-full rounded-lg flex items-center justify-center text-xl text-[var(--semantic-brand-primary)]"
          >
            帳票一覧に戻る
          </button>
        </div>
      </div>
    </SubmitOutcome>
  );
}
