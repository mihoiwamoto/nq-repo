export type ScaleInspectionPost = {
  id: string;
  factoryId: string;
  name: string;
};

export type ScaleRepairStatus = "action_needed" | "repairing" | "done";

export const SCALE_REPAIR_STATUS_LABELS: Record<ScaleRepairStatus, string> = {
  action_needed: "要対応",
  repairing: "管理中",
  done: "対応完了",
};

export const SCALE_REPAIR_STATUS_COLORS: Record<ScaleRepairStatus, string> = {
  action_needed: "var(--semantic-status-error)",
  repairing: "var(--semantic-status-caution)",
  done: "var(--semantic-status-success)",
};

export type ScaleInspectionScale = {
  id: string;
  factoryId: string;
  postId: string;
  label: string;
  serialNumber: string;
  weightCapacity: number;
  recordOperationCheck: boolean;
  recordLevelCheck: boolean;
  recordDirtCheck: boolean;
  recordDisplayValue: boolean;
  referenceWeight: number;
  minDisplayUnit: number;
  repairStatus: ScaleRepairStatus | null;
  displayFrom?: string;
  displayTo?: string;
};

export type ScaleCatalogEntry = {
  label: string;
  serialNumber: string;
  referenceWeight: number;
};
