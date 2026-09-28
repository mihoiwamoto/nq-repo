import { useParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { PageTitleBar } from "../components/PageTitleBar";
import { ComingSoonPage } from "../../pages/ComingSoonPage";
import { ledgerCategories } from "../../data/ledgers";

export function ConfirmationDataListPlaceholderPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = ledgerCategories.find((c) => c.slug === slug);

  return (
    <div>
      <PageTitleBar title="データ一覧" showBack />
      <Breadcrumb
        items={[
          { label: "確認管理", to: "/admin/confirmations" },
          { label: "工場選択", to: `/admin/confirmations/${slug}` },
          { label: "データ一覧" },
        ]}
      />
      <div className="p-6">
        <ComingSoonPage title={category?.adminLabel ?? "帳票"} />
      </div>
    </div>
  );
}
