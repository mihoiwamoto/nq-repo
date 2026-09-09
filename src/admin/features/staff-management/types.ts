export type StaffRole = "operator" | "checker" | "approver";

export const ROLE_LABELS: Record<StaffRole, string> = {
  operator: "実施者",
  checker: "確認者",
  approver: "承認者",
};

export const ROLE_COLORS: Record<StaffRole, { bg: string; text: string }> = {
  operator: { bg: "#e3f7e6", text: "#228b22" },
  checker: { bg: "#fff6d6", text: "#b38b00" },
  approver: { bg: "#dff1ff", text: "#005e9e" },
};

export const ROLE_OPTIONS: StaffRole[] = ["approver", "checker", "operator"];

export type SystemAuthority = "factory_staff" | "quality_management" | "information_system";

export const SYSTEM_AUTHORITY_LABELS: Record<SystemAuthority, string> = {
  factory_staff: "工場勤務者",
  quality_management: "品質管理部",
  information_system: "情報システム部",
};

export const SYSTEM_AUTHORITY_OPTIONS: SystemAuthority[] = ["factory_staff", "quality_management", "information_system"];

export type StaffFactoryAssignment = {
  factoryId: string;
  role: StaffRole;
};

export type Staff = {
  id: string;
  name: string;
  employeeNumber: string;
  systemAuthority: SystemAuthority;
  companyId: string;
  assignments: StaffFactoryAssignment[];
  email: string;
  hasPassword: boolean;
};

export type StaffInput = Omit<Staff, "id" | "hasPassword"> & {
  password?: string;
};
