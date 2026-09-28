export type ScaleInspectionPost = {
  id: string;
  factoryId: string;
  name: string;
};

export type ScaleRepairStatus = "action_needed" | "no_repair" | "repairing" | "done";

export const SCALE_REPAIR_STATUS_LABELS: Record<ScaleRepairStatus, string> = {
  action_needed: "要対応",
  no_repair: "修理しない",
  repairing: "修理中",
  done: "修理完了",
};

export const SCALE_REPAIR_STATUS_COLORS: Record<ScaleRepairStatus, string> = {
  action_needed: "var(--semantic-status-error)",
  no_repair: "var(--semantic-text-secondary)",
  repairing: "var(--semantic-status-caution)",
  done: "var(--semantic-status-success)",
};

export const SCALE_REPAIR_STATUS_NEXT_OPTIONS: Record<ScaleRepairStatus, ScaleRepairStatus[]> = {
  action_needed: ["action_needed", "repairing", "no_repair"],
  repairing: ["repairing", "done"],
  no_repair: ["no_repair"],
  done: ["done"],
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
