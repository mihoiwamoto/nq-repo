import { useNavigate, useParams } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SUBMIT_DONE_TITLE, SubmitComplete } from "../../components/SubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";

export function SubmitCompletePage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle="添加物管理" title={SUBMIT_DONE_TITLE} />;
  }

  return (
    <SubmitComplete
      ledgerTitle="添加物管理"
      title={SUBMIT_DONE_TITLE}
      /* 続けるときは、いま記録した添加物の記録一覧へ戻す */
      primary={{
        label: "添加物管理記録を続ける",
        onClick: () => navigate(`/app/ledger-list/additive-management/products/${productId}`),
      }}
      secondary={{ label: "帳票一覧に戻る", onClick: () => navigate("/app/ledger-list") }}
    />
  );
}
