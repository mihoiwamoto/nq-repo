import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import eyeOnIcon from "../../../../images/Icon/eye_on.svg";
import eyeOffIcon from "../../../../images/Icon/eye_off.svg";

function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Za-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function PasswordField({
  label,
  helperText,
  value,
  onChange,
  hasError,
}: {
  label: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1 items-start">
      <p className="text-xl text-[var(--semantic-text-primary)]">{label}</p>
      {helperText && <p className="text-sm text-[#808080]">{helperText}</p>}
      <div
        className={`bg-white flex items-center gap-2 h-12 px-4 rounded-lg w-[480px] ${
          hasError ? "border border-[#f85c5c]" : ""
        }`}
      >
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例）Ex@mple123"
          className="flex-1 text-base text-[var(--semantic-text-primary)] placeholder:text-[#808080] outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "パスワードを隠す" : "パスワードを表示"}
          className="shrink-0"
        >
          <img
            src={visible ? eyeOffIcon : eyeOnIcon}
            alt=""
            width="24"
            height="24"
          />
        </button>
      </div>
    </div>
  );
}

export function PasswordChangePage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit() {
    const nextErrors: string[] = [];
    if (newPassword !== confirmPassword) {
      nextErrors.push("※パスワードが一致しません");
    }
    if (!isStrongPassword(newPassword)) {
      nextErrors.push("※8文字以上の英数字、記号を含めてください");
    }
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    navigate("/admin/account/password/complete");
  }

  const hasError = errors.length > 0;

  return (
    <div>
      <PageTitleBar title="パスワード変更" showBack />
      <Breadcrumb
        items={[
          { label: "アカウント情報", to: "/admin/account" },
          { label: "パスワード変更" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start">
          <PasswordField
            label="新しいパスワード"
            helperText="※8文字以上の英数字、記号を含む"
            value={newPassword}
            onChange={setNewPassword}
            hasError={hasError}
          />
          <PasswordField
            label="新しいパスワード（確認用）"
            value={confirmPassword}
            onChange={setConfirmPassword}
            hasError={hasError}
          />
        </div>

        {hasError && (
          <div className="flex flex-col gap-1 items-start">
            {errors.map((error) => (
              <p key={error} className="text-base text-[#f85c5c]">
                {error}
              </p>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
        >
          パスワードを変更
        </button>
      </div>
    </div>
  );
}
