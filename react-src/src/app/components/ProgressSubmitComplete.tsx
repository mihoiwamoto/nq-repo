import { useNavigate } from "react-router-dom";
import { SubmitComplete } from "./SubmitComplete";

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
 * 見た目は通常の完了画面（SubmitComplete）と同じ。ボタンが 1 つだけ違う。
 */
export function ProgressSubmitComplete({
  ledgerTitle,
  title,
  message,
  backLabel = "進捗一覧に戻る",
  onBack,
}: ProgressSubmitCompleteProps) {
  const navigate = useNavigate();

  const handleBack = () => (onBack ? onBack() : navigate("/app/progress"));

  return (
    <SubmitComplete
      ledgerTitle={ledgerTitle}
      title={title}
      message={message}
      secondary={{ label: backLabel, onClick: handleBack }}
    />
  );
}
