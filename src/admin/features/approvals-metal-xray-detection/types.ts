import type { ApprovalStatus } from "../../data/approvals";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type InspectionCategory = "開始" | "終了" | "ー";
export type InspectionContent = "動作確認" | "テストピース" | "製品通過" | "異常反応";
export type InspectionResult = "OK" | "NG";

export type ChecklistItem = { key: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export type ChecklistDetail = {
  metalTime: string;
  metalTimeTimestamp?: string;
  metalChecks: Record<string, InspectionResult>;
  metalTimestamps?: Record<string, string>;
  xrayTime: string;
  xrayTimeTimestamp?: string;
  xrayChecks: Record<string, InspectionResult>;
  xrayTimestamps?: Record<string, string>;
};

export type InspectionRecord = {
  id: string;
  category: InspectionCategory;
  time: string;
  content: InspectionContent;
  passedProduct: string;
  result: InspectionResult;
  remarks: string;
  inspectorName: string;
  checklistDetail?: ChecklistDetail;
  cause?: string;
  response?: string;
};

export type MachineApprovalRecord = {
  id: string;
  machineName: string;
  date: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  records: InspectionRecord[];
  comments?: Comment[];
};
