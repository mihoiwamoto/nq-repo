import { useNavigate } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SUBMIT_DONE_TITLE, SubmitComplete } from "../../components/SubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";

export function SampleSubmitCompletePage() {
  const navigate = useNavigate();
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle="検体管理" title={SUBMIT_DONE_TITLE} />;
  }

  return (
    <SubmitComplete
      ledgerTitle="検体管理"
      title={SUBMIT_DONE_TITLE}
      primary={{ label: "検体管理を続ける", onClick: () => navigate("/app/ledger-list/sample-management") }}
      secondary={{ label: "戻る", onClick: () => navigate("/app/ledger-list") }}
    />
  );
}
