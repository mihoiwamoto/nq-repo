import type { ApprovalStatus } from "../../data/approvals";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type CheckStatus = "ok" | "ng";

export type ActionOption = "電池交換" | "修理" | "その他";

export type WeightIssueOption = "故障" | "その他";

export type RepairStatus = "action_needed" | "no_repair" | "repairing" | "done";

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  action_needed: "要対応",
  no_repair: "修理しない",
  repairing: "修理中",
  done: "修理完了",
};

export const REPAIR_STATUS_COLORS: Record<RepairStatus, string> = {
  action_needed: "var(--semantic-status-error)",
  no_repair: "var(--semantic-text-secondary)",
  repairing: "var(--semantic-status-caution)",
  done: "var(--semantic-status-success)",
};

export const REPAIR_STATUS_NEXT_OPTIONS: Record<RepairStatus, RepairStatus[]> = {
  action_needed: ["action_needed", "repairing", "no_repair"],
  repairing: ["repairing", "done"],
  no_repair: ["no_repair"],
  done: ["done"],
};

export type ScaleApprovalRecord = {
  id: string;
  requestId: string;
  date: string;
  scaleLabel: string;
  serialNumber: string;
  post: string;
  skipped: boolean;
  operationCheck: CheckStatus;
  operationCause: string;
  operationAction: ActionOption | null;
  repairStatus: RepairStatus | null;
  operationCheckTime: string;
  levelCheck: CheckStatus | null;
  levelCheckTime: string | null;
  dirtCheck: CheckStatus | null;
  dirtCheckTime: string | null;
  referenceWeight: number;
  displayValue: number | null;
  displayValueTime: string | null;
  weightCause: WeightIssueOption | null;
  remarks: string;
  implementer: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  comments?: Comment[];
};
