import { useEffect, useState } from "react";
import { CURRENT_ROLE_EVENT, loadCurrentRole } from "./roleStore";
import type { PrototypeRoleId } from "./roleStore";

/**
 * プロトタイプ用の現在ロールを購読する。
 * ロール切替（アカウント情報画面）と別タブでの変更の両方に追従する。
 */
export function useCurrentRole(fallback: PrototypeRoleId = "approver"): PrototypeRoleId {
  const [role, setRole] = useState<PrototypeRoleId>(fallback);

  // localStorage はブラウザにしか無いので、初期描画後に読み直す
  useEffect(() => {
    const sync = () => setRole(loadCurrentRole(fallback));
    sync();
    window.addEventListener(CURRENT_ROLE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CURRENT_ROLE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [fallback]);

  return role;
}
