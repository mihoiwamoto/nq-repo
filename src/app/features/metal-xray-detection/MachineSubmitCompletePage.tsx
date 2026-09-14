import { useLocation, useNavigate } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import type { EditReturn } from "./MachineDetailPage";

export function MachineSubmitCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 確認待ち（差し戻し）の「点検内容を修正する」から来た提出は、進捗一覧ではなく元の確認待ち詳細へ戻す
  const editReturn = (location.state as { editReturn?: EditReturn } | null)?.editReturn;

  return (
    <ProgressSubmitComplete
      ledgerTitle="金属/X線探知機記録"
      backLabel={editReturn ? "確認待ちに戻る" : undefined}
      onBack={editReturn ? () => navigate(editReturn.to, { state: editReturn.state }) : undefined}
    />
  );
}
