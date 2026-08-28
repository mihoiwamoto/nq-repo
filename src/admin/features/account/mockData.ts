import type { Staff } from "../staff-management/types";

export const CURRENT_ACCOUNT: Staff = {
  id: "admin01",
  name: "管理者01",
  employeeNumber: "000001",
  systemAuthority: "hq_admin",
  companyId: "c1",
  assignments: [{ factoryId: "f1", role: "admin" }],
  email: "admin01@example.com",
  hasPassword: true,
};
