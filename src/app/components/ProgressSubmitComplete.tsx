import { useNavigate } from "react-router-dom";
import { AppHeader } from "../layout/AppHeader";
import { SubmitOutcome } from "./SubmitOutcome";

type ProgressSubmitCompleteProps = {
  /** ヘッダーに出す帳票名（例: 秤点検記録） */
  ledgerTitle: string;
  /** 見出し */
  title?: string;
  /** 見出しの下の説明文 */
  message?: string;
  /** 戻るボタンの文言（既定: 進捗一覧に戻る） */
  backLabel?: string;
  /** 戻るボタンの遷移先を差し替える（既定: 進捗一覧へ） */
  onBack?: () => void;
};

/**
 * 進捗一覧から入って提出したときの完了画面。
 * 帳票を続けて入力する導線は出さず、進捗一覧に戻るだけにする。
 *
 * 動作デモで「オフライン」「送信エラー」を試しているときは、SubmitOutcome が
 * 送信できなかった画面に差し替える（進捗一覧から入るどの帳票でも同じ）。
 */
export function ProgressSubmitComplete({
  ledgerTitle,
  title = "提出が完了しました！",
  message = "ご記入ありがとうございます。",
  backLabel = "進捗一覧に戻る",
  onBack,
}: ProgressSubmitCompleteProps) {
  const navigate = useNavigate();

  const handleBack = () => (onBack ? onBack() : navigate("/app/progress"));

  return (
    <SubmitOutcome
      ledgerTitle={ledgerTitle}
      backLabel={backLabel}
      onBack={handleBack}
    >
      <AppHeader title={ledgerTitle} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-10 items-center px-8 py-6 w-full">
          <div className="flex flex-col gap-6 items-center w-full">
            <div className="flex flex-col gap-4 items-center w-full">
              <svg
                className="size-20 shrink-0"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M66.6667 40.0003C66.6667 25.2727 54.7276 13.3337 40 13.3337C25.2724 13.3337 13.3334 25.2727 13.3334 40.0003C13.3334 54.7279 25.2724 66.667 40 66.667C54.7276 66.667 66.6667 54.7279 66.6667 40.0003ZM73.3334 40.0003C73.3334 58.4098 58.4095 73.3337 40 73.3337C21.5905 73.3337 6.66669 58.4098 6.66669 40.0003C6.66669 21.5908 21.5905 6.66699 40 6.66699C58.4095 6.66699 73.3334 21.5908 73.3334 40.0003Z"
                  fill="var(--semantic-brand-primary)"
                />
                <path
                  d="M52.4935 30.527C53.7952 29.2255 55.9053 29.2253 57.207 30.527C58.5084 31.8286 58.5084 33.9388 57.207 35.2405L38.3886 54.0589L38.1445 54.2802C37.5516 54.7655 36.8049 55.0322 36.0319 55.0322C35.2587 55.0319 34.5121 54.766 33.9192 54.2802L33.6751 54.0589L24.4596 44.8401C23.1581 43.5383 23.1579 41.4283 24.4596 40.1266C25.7613 38.8251 27.8715 38.8251 29.1732 40.1266L36.0319 46.9853L52.4935 30.527Z"
                  fill="var(--semantic-brand-primary)"
                />
              </svg>
              <h2 className="text-2xl text-[var(--semantic-brand-primary)] text-center w-full font-semibold">
                {title}
              </h2>
            </div>
            <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
              {message}
            </p>
          </div>

          <div className="flex items-center justify-center w-full">
            <button
              type="button"
              onClick={handleBack}
              className="bg-white border border-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-[360px] max-w-full px-4 rounded-lg text-xl text-[var(--semantic-brand-primary)] font-semibold"
            >
              {backLabel}
            </button>
          </div>
        </div>
      </div>
    </SubmitOutcome>
  );
}
