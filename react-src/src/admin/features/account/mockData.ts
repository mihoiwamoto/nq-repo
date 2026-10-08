import type { Staff } from "../staff-management/types";

export const CURRENT_ACCOUNT: Staff = {
  id: "admin01",
  name: "佐々木明子",
  employeeNumber: "20240815",
  systemAuthority: "hq_admin",
  companyId: "c1",
  // f1・f2 は承認者、f3 は所属しているが確認者（承認者の工場選択には f1・f2 だけが並ぶ。useRoleFactories.ts）
  assignments: [
    { factoryId: "f1", role: "approver" },
    { factoryId: "f2", role: "approver" },
    { factoryId: "f3", role: "checker" },
  ],
  email: "admin01@example.com",
  hasPassword: true,
};
