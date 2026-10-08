import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import eyeOnIcon from "../../../../images/Icon/eye_on.svg";
import eyeOffIcon from "../../../../images/Icon/eye_off.svg";

// 本番（PasswordUpdateRequest）と同じ入力チェック。文言は本番の lang/ja/validation.php
const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/;

function passwordError(attr: string, value: string): string | undefined {
  if (!value) return `${attr}は必須です。`;
  if (value.length < 8 || value.length > 64) return `${attr}は8〜64文字の間で入力してください。`;
  if (!PASSWORD_RE.test(value)) return `${attr}は英数字記号を組み合わせてください。`;
  return undefined;
}

function PasswordField({
  label,
  helperText,
  value,
  onChange,
  hasError,
  error,
}: {
  label: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  error?: string;
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
      {error && <p className="text-base text-[#f85c5c]">{error}</p>}
    </div>
  );
}

export function PasswordChangePage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  function handleSubmit() {
    const nextErrors = {
      newPassword: passwordError("新しいパスワード", newPassword),
      confirmPassword:
        passwordError("パスワード確認", confirmPassword) ??
        (confirmPassword !== newPassword ? "パスワード確認は新しいパスワードと一致する必要があります。" : undefined),
    };
    if (nextErrors.newPassword || nextErrors.confirmPassword) {
      setErrors(nextErrors);
      return;
    }
    navigate("/admin/account/password/complete");
  }


  return (
    <div>
      <PageTitleBar title="パスワード変更" />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start">
          <PasswordField
            label="新しいパスワード"
            helperText="※8文字以上の英数字、記号を含む"
            value={newPassword}
            onChange={setNewPassword}
            hasError={!!errors.newPassword}
            error={errors.newPassword}
          />
          <PasswordField
            label="新しいパスワード（確認用）"
            value={confirmPassword}
            onChange={setConfirmPassword}
            hasError={!!errors.confirmPassword}
            error={errors.confirmPassword}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
        >
          パスワードを変更
        </button>
      </div>
    </div>
  );
}
