import { useNavigate, useLocation } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SubmitComplete } from "../../components/SubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";

export function ChemicalSubmitCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { inspectorName?: string } | null;
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();
  const inspectorName = state?.inspectorName;

  /** 「薬品管理記録を続ける」で戻ったときも実施者を引き継ぐ */
  const handleNavigate = (path: string) => {
    navigate(path, { state: inspectorName ? { inspectorName } : undefined });
  };

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle="薬品管理" />;
  }

  return (
    <SubmitComplete
      ledgerTitle="薬品管理"
      primary={{
        label: "薬品管理記録を続ける",
        onClick: () => handleNavigate("/app/ledger-list/chemical-management"),
      }}
      secondary={{ label: "帳票一覧に戻る", onClick: () => handleNavigate("/app/ledger-list") }}
    />
  );
}
