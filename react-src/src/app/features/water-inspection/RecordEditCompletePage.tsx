import { useNavigate, useParams } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SubmitComplete } from "../../components/SubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";
import { useWaterInspection } from "./WaterInspectionContext";

export function RecordEditCompletePage() {
  const navigate = useNavigate();
  const { pointId, recordId } = useParams<{ pointId: string; recordId: string }>();
  const { recordsByPoint } = useWaterInspection();
  const record = pointId ? recordsByPoint[pointId]?.find((r) => r.id === recordId) : undefined;
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();

  const ledgerTitle = `使用水の点検_${record?.location ?? ""}`;

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle={ledgerTitle} />;
  }

  return (
    <SubmitComplete
      ledgerTitle={ledgerTitle}
      primary={{
        label: "使用水の点検を続ける",
        onClick: () => navigate("/app/ledger-list/water-inspection"),
      }}
      secondary={{ label: "帳票一覧に戻る", onClick: () => navigate("/app/ledger-list") }}
    />
  );
}
