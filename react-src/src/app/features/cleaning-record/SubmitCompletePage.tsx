import { useNavigate } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SubmitComplete } from "../../components/SubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";

export function SubmitCompletePage() {
  const navigate = useNavigate();
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle="清掃記録" />;
  }

  return (
    <SubmitComplete
      ledgerTitle="清掃記録"
      primary={{ label: "清掃記録を続ける", onClick: () => navigate("/app/ledger-list/cleaning-record") }}
      secondary={{ label: "帳票一覧に戻る", onClick: () => navigate("/app/ledger-list") }}
    />
  );
}
