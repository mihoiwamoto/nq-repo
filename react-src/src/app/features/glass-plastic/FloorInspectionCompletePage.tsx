import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
import { SubmitComplete } from "../../components/SubmitComplete";
import { useFromProgress } from "../../layout/ProgressFlowContext";
import { useGlassPlastic } from "./GlassPlasticContext";

export function FloorInspectionCompletePage() {
  const navigate = useNavigate();
  const { floorId } = useParams<{ floorId: string }>();
  const location = useLocation();
  const state = location.state as {
    floorName?: string;
    date?: string;
    inspectorName?: string;
  } | null;

  // 直接開いたときも、URL のフロアの名前を出す
  const { floors } = useGlassPlastic();
  const floorName = state?.floorName ?? floors.find((f) => f.id === floorId)?.name ?? "フロアA";
  // 進捗一覧から入った一連の画面かどうかはレイアウト側が保持している
  const fromProgress = useFromProgress();

  const ledgerTitle = `ガラス・プラスチック管理_${floorName}`;

  // 進捗一覧から入った場合は、帳票を続ける導線は出さず進捗一覧に戻すだけ
  if (fromProgress) {
    return <ProgressSubmitComplete ledgerTitle={ledgerTitle} />;
  }

  return (
    <SubmitComplete
      ledgerTitle={ledgerTitle}
      primary={{
        label: "ガラス・プラスチック管理を続ける",
        onClick: () => navigate("/app/ledger-list/glass-plastic"),
      }}
      secondary={{ label: "帳票一覧に戻る", onClick: () => navigate("/app/ledger-list") }}
    />
  );
}
