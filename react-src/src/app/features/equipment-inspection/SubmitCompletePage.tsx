import { useNavigate, useParams } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SUBMIT_DONE_TITLE, SubmitComplete } from "../../components/SubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";
import { useInspection } from "./InspectionContext";

export function SubmitCompletePage() {
  const navigate = useNavigate();
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();
  const { lineId } = useParams<{ lineId: string }>();
  const { lines } = useInspection();
  // 続けるときは、いま点検したラインの頻度のタブ（毎週なら毎週）を開いた一覧へ戻す
  const frequency = lines.find((line) => line.id === lineId)?.frequency;

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle="機械器具点検" title={SUBMIT_DONE_TITLE} />;
  }

  return (
    <SubmitComplete
      ledgerTitle="機械器具点検"
      title={SUBMIT_DONE_TITLE}
      primary={{ label: "機械器具点検を続ける", onClick: () => navigate("/app/ledger-list/equipment-inspection", { state: frequency ? { frequency } : undefined }) }}
      secondary={{ label: "帳票一覧に戻る", onClick: () => navigate("/app/ledger-list") }}
    />
  );
}
