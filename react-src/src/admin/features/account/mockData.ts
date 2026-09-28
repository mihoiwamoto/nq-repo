import type { Staff } from "../staff-management/types";

export const CURRENT_ACCOUNT: Staff = {
  id: "admin01",
  name: "佐々木明子",
  employeeNumber: "20240815",
  systemAuthority: "hq_admin",
  companyId: "c1",
  assignments: [{ factoryId: "f1", role: "approver" }],
  email: "admin01@example.com",
  hasPassword: true,
};
