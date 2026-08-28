import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { LoadingOverlay } from "../../layout/LoadingOverlay";
import { OfflineDialog } from "./OfflineDialog";
import iconEye from "../../../assets/figma/icons/common/eye.svg";
import iconEyeOff from "../../../assets/figma/icons/common/eye-off.svg";

const DEMO_FACTORY_ID = "123456";
const DEMO_PASSWORD = "Iwamoto1000@";
const LOGIN_DELAY_MS = 600;

export function AppLoginPage() {
  const navigate = useNavigate();
  const [factoryId, setFactoryId] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);

  function handleSubmit() {
    if (!navigator.onLine) {
      setShowOfflineDialog(true);
      return;
    }
    if (factoryId === DEMO_FACTORY_ID && password === DEMO_PASSWORD) {
      setIsLoggingIn(true);
      setTimeout(() => navigate("/app/ledger-list"), LOGIN_DELAY_MS);
      return;
    }
    setHasError(true);
  }

  return (
    <div className="min-h-screen bg-[var(--semantic-brand-primary)] p-2 flex flex-col">
      <div className="flex-1 rounded-lg bg-[var(--semantic-background-page)] overflow-hidden flex flex-col">
        <AppHeader title="NQリポ" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <div className="flex flex-col gap-10 max-w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-6 items-start w-full">
              <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">ログイン</p>
              <div className="flex flex-col gap-6 items-start w-full">
                <div className="flex flex-col gap-1 items-start w-full">
                  <p className="text-base font-semibold text-[var(--semantic-text-primary)]">工場ID</p>
                  <input
                    type="text"
                    value={factoryId}
                    onChange={(e) => setFactoryId(e.target.value)}
                    placeholder="例）012345"
                    className={`bg-white h-12 px-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full border placeholder:text-[var(--semantic-text-secondary)] ${
                      hasError ? "border-[var(--semantic-brand-danger)]" : "border-[var(--semantic-text-secondary)]"
                    }`}
                  />
                </div>
                <div className="flex flex-col gap-1 items-start w-full">
                  <p className="text-base font-semibold text-[var(--semantic-text-primary)]">パスワード</p>
                  <p className="text-sm font-semibold text-[var(--semantic-text-secondary)]">
                    ※8文字以上の英数字、記号を含む
                  </p>
                  <div
                    className={`bg-white flex items-center gap-2 h-12 px-2 rounded-lg w-full border ${
                      hasError ? "border-[var(--semantic-brand-danger)]" : "border-[var(--semantic-text-secondary)]"
                    }`}
                  >
                    <input
                      type={visible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="例）Ex@mple123"
                      className="flex-1 text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)] outline-none"
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
                </div>
                {hasError && (
                  <p className="text-sm text-[var(--semantic-brand-danger)] w-full">
                    ※パスワードが一致しません
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center w-full">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-[var(--semantic-brand-primary)] h-16 w-full max-w-[360px] rounded-lg text-xl font-semibold text-white"
              >
                ログイン
              </button>
            </div>

            <p className="text-base text-[var(--semantic-text-primary)] w-full">
              ※西原商会グループ向けアプリケーションとなります。一般の方はご利用いただけません。
            </p>
          </div>
        </div>
      </div>
      {isLoggingIn && <LoadingOverlay />}
      {showOfflineDialog && (
        <OfflineDialog onRetry={() => window.location.reload()} />
      )}
    </div>
  );
}
