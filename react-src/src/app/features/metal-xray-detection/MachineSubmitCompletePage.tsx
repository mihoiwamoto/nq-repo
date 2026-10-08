import { useLocation, useNavigate } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SUBMIT_DONE_TITLE, SubmitComplete } from "../../components/SubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";
import type { EditReturn } from "./MachineDetailPage";

/**
 * 提出完了。確定デザイン（帳票一覧_金属/X線探知機記録_提出完了 6198:79645）の見出しは「提出が完了しました！」で、
 * 帳票一覧から来たときは「金属/X線探知機記録を続ける」「戻る」の 2 つ（2026-10-08 に本番に合わせて「帳票一覧に戻る」から変更）。
 * 進捗一覧から来たときは「進捗一覧に戻る」の 1 つ。確認待ち（差し戻し）から来たときも本番どおり「続ける」「戻る」の 2 つ。
 */
export function MachineSubmitCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();
  // 確認待ち（差し戻し）の「点検内容を修正する」から来た提出は、進捗一覧ではなく元の確認待ち詳細へ戻す
  const editReturn = (location.state as { editReturn?: EditReturn } | null)?.editReturn;

  // 本番（Excel No.25）は差し戻しの「点検内容を修正する」から来ても「金属/X線探知機記録を続ける」「戻る」の 2 つ。
  // 「戻る」は元の確認待ち詳細へ戻す（2026-10-08）
  if (editReturn) {
    return (
      <SubmitComplete
        ledgerTitle="金属/X線探知機記録"
        title={SUBMIT_DONE_TITLE}
        primary={{ label: "金属/X線探知機記録を続ける", onClick: () => navigate("/app/ledger-list/metal-xray-detection") }}
        secondary={{ label: "戻る", onClick: () => navigate(editReturn.to, { state: editReturn.state }) }}
      />
    );
  }

  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle="金属/X線探知機記録" title={SUBMIT_DONE_TITLE} />;
  }

  return (
    <SubmitComplete
      ledgerTitle="金属/X線探知機記録"
      title={SUBMIT_DONE_TITLE}
      primary={{ label: "金属/X線探知機記録を続ける", onClick: () => navigate("/app/ledger-list/metal-xray-detection") }}
      secondary={{ label: "戻る", onClick: () => navigate("/app/ledger-list") }}
    />
  );
}
