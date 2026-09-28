import type { ApprovalStatus } from "../../data/approvals";

export type InspectionCategory = "開始" | "終了" | "ー";
export type InspectionContent = "動作確認" | "テストピース" | "製品通過" | "異常反応";
export type InspectionResult = "OK" | "NG";

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export type InspectionRecord = {
  id: string;
  category: InspectionCategory;
  time: string;
  content: InspectionContent;
  passedProduct: string;
  result: InspectionResult;
  remarks: string;
  inspectorName: string;
  cause?: string;
  response?: string;
  comments?: Comment[];
};

export type MachineSearchRecord = {
  id: string;
  machineName: string;
  date: string;
  metalDetectorModel: string;
  xrayDetectorModel: string;
  weightCheckerModel: string;
  result: InspectionResult;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  records: InspectionRecord[];
  comment?: string;
  comments?: Comment[];
  metalComments?: Comment[];
  xrayComments?: Comment[];
  metalOperationComments?: Comment[];
  xrayOperationComments?: Comment[];
};
