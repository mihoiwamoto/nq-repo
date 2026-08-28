import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";

export function EmailChangePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [hasError, setHasError] = useState(false);

  function handleSubmit() {
    if (!email || email !== confirmEmail) {
      setHasError(true);
      return;
    }
    navigate("/admin/account/email/complete");
  }

  return (
    <div>
      <PageTitleBar title="メールアドレス変更" showBack />
      <Breadcrumb
        items={[
          { label: "アカウント情報", to: "/admin/account" },
          { label: "メールアドレス変更" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <p className="text-xl text-[var(--semantic-text-primary)]">メールアドレス</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              className={`bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080] ${
                hasError ? "border border-[#f85c5c]" : ""
              }`}
            />
          </div>
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <p className="text-xl text-[var(--semantic-text-primary)]">メールアドレス（確認用）</p>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="example@example.com"
              className={`bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080] ${
                hasError ? "border border-[#f85c5c]" : ""
              }`}
            />
          </div>
        </div>

        {hasError && <p className="text-base text-[#f85c5c]">※メールアドレスが一致しません</p>}

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
        >
          メールアドレスを変更
        </button>
      </div>
    </div>
  );
}
