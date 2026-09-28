/** プロトタイプ用のロール識別子（承認フローの役割 + 部署権限） */
export type PrototypeRoleId =
  | "approver_checker"
  | "approver"
  | "checker"
  | "administrator";

const CURRENT_ROLE_KEY = "nq_current_role";
export const CURRENT_ROLE_EVENT = "nq-current-role-changed";

const VALID_ROLES: PrototypeRoleId[] = [
  "approver_checker",
  "approver",
  "checker",
  "administrator",
];

/** 情報システム部・品質管理部を「管理者」に統合したため、端末に残った旧値を読み替える */
const LEGACY_ROLE_ALIASES: Record<string, PrototypeRoleId> = {
  information_system: "administrator",
  quality_management: "administrator",
};

/** プロトタイプ用: 端末（ブラウザ）に保存された現在のロールを返す */
export function loadCurrentRole(fallback: PrototypeRoleId): PrototypeRoleId {
  try {
    const raw = localStorage.getItem(CURRENT_ROLE_KEY);
    if (raw && VALID_ROLES.includes(raw as PrototypeRoleId)) return raw as PrototypeRoleId;
    if (raw && LEGACY_ROLE_ALIASES[raw]) return LEGACY_ROLE_ALIASES[raw];
  } catch {
    // 破損したデータは既定値扱いにする
  }
  return fallback;
}

export function saveCurrentRole(role: PrototypeRoleId) {
  localStorage.setItem(CURRENT_ROLE_KEY, role);
  window.dispatchEvent(new CustomEvent(CURRENT_ROLE_EVENT, { detail: role }));
}
