import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useCompanyManagement } from "./CompanyManagementContext";

export function CompanyFormPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const isEditing = Boolean(companyId);
  const { companies, addCompany, updateCompany } = useCompanyManagement();
  const navigate = useNavigate();
  const existing = companies.find((c) => c.id === companyId);

  const [name, setName] = useState(existing?.name ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name) {
      setError("企業名は必須です");
      return;
    }
    if (isEditing && existing) {
      updateCompany(existing.id, { name, address });
      navigate(`/admin/company/${existing.id}`, { state: { updated: true } });
    } else {
      addCompany({ name, address });
      navigate("/admin/company/new/complete");
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "企業管理", to: "/admin/company" },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">企業名</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）㈱西原食品"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <p className="text-xl text-[var(--semantic-text-primary)]">企業住所</p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例）鹿児島県鹿児島市本名町1744番地1号"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>
    </div>
  );
}
