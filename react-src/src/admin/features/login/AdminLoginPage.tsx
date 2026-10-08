import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/figma/logo-admin.png";
import iconEye from "../../../assets/figma/icons/common/eye.svg?url";
import iconEyeOff from "../../../assets/figma/icons/common/eye-off.svg?url";

const DEMO_EMPLOYEE_NUMBER = "123456";
const DEMO_PASSWORD = "N9MX8Wjywc6m5MxD";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  // 本番（LoginRequest）と同じ項目ごとの入力チェック。文言は本番の lang/ja/validation.php
  const [fieldErrors, setFieldErrors] = useState<{ staffId?: string; password?: string }>({});

  function validate() {
    const errs: { staffId?: string; password?: string } = {};
    if (!employeeNumber) errs.staffId = "社員番号は必須です。";
    else if (!/^\d{6}$/.test(employeeNumber)) errs.staffId = "社員番号は6桁の数字で入力してください。";
    if (!password) errs.password = "パスワードは必須です。";
    else if (password.length < 8 || password.length > 64) errs.password = "パスワードは8〜64文字の間で入力してください。";
    else if (!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/.test(password))
      errs.password = "パスワードは英数字記号を組み合わせてください。";
    return errs;
  }

  function handleSubmit() {
    // 見本のパスワードは記号を含まないので、見本の組み合わせだけは入力チェックの前に通す
    if (employeeNumber === DEMO_EMPLOYEE_NUMBER && password === DEMO_PASSWORD) {
      navigate("/admin");
      return;
    }
    const errs = validate();
    setFieldErrors(errs);
    if (errs.staffId || errs.password) {
      setHasError(false);
      return;
    }
    setHasError(true);
  }

  return (
    <div className="min-h-screen bg-[#f1efea]">
      <header className="h-16 flex items-center bg-[#009944] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] w-screen">
        <div className="px-6">
          <div className="size-10 rounded-[6.4px] bg-white overflow-hidden">
            <img src={logo} alt="NQlipo" className="size-full object-cover" />
          </div>
        </div>
      </header>
      <div className="flex justify-center pt-[144px] px-4 sm:px-6">
        <div className="flex flex-col gap-10 items-start w-full max-w-[640px]">
          <h1 className="text-[32px] leading-[1.4] text-[#333] font-['Hiragino_Kaku_Gothic_ProN']">ログイン</h1>
          <div className="flex flex-col gap-10 items-start w-full">
            <div className="flex flex-col gap-6 items-start w-full">
              <p className="text-[20px] leading-[1.4] text-[#333] font-['Hiragino_Kaku_Gothic_ProN']">ログイン情報を入力してください。</p>
              <div className="flex flex-col gap-6 items-start w-full">
                <div className="flex flex-col gap-1 items-start w-full">
                  <p className="text-[20px] leading-[1.4] text-[#333] font-['Hiragino_Kaku_Gothic_ProN']">社員番号</p>
                  <input
                    type="text"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    placeholder="例）012345"
                    className={`bg-white h-12 px-4 rounded-lg text-base text-[#333] w-full placeholder:text-[#808080] ${
                      hasError || fieldErrors.staffId ? "border border-[#f85c5c]" : ""
                    }`}
                  />
                  {fieldErrors.staffId && <p className="text-sm text-[#f34949]">{fieldErrors.staffId}</p>}
                </div>
                <div className="flex flex-col gap-1 items-start w-full">
                  <p className="text-[20px] leading-[1.4] text-[#333] font-['Hiragino_Kaku_Gothic_ProN']">パスワード</p>
                  <div
                    className={`bg-white flex items-center gap-2 h-12 px-4 rounded-lg w-full ${
                      hasError || fieldErrors.password ? "border border-[#f85c5c]" : ""
                    }`}
                  >
                    <input
                      type={visible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="例）Ex@mple123"
                      className="flex-1 text-base text-[#333] placeholder:text-[#808080] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setVisible((v) => !v)}
                      aria-label={visible ? "パスワードを隠す" : "パスワードを表示"}
                      className="shrink-0"
                    >
                      <img src={visible ? iconEyeOff : iconEye} alt="" className="size-6" />
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-sm text-[#f34949]">{fieldErrors.password}</p>}
                </div>
              </div>
            </div>

            {hasError && (
              <p className="text-sm text-[#f34949] w-full">※社員番号とパスワードが一致しません</p>
            )}

            <div className="flex flex-col gap-6 items-center w-full">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-[#009944] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-full max-w-[400px] rounded-lg text-base text-white font-['Hiragino_Kaku_Gothic_ProN']"
              >
                ログイン
              </button>
              <p className="text-sm leading-[1.6] text-[#333] text-center font-['Hiragino_Kaku_Gothic_ProN']">
                ※パスワードを忘れた方は西原商会情報システム部へご連絡ください
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
