import type { ApprovalStatus } from "../../data/approvals";

export type SampleStatus = "保管中" | "使用済み" | "破棄済み";
export type DiscardReason = "賞味期限切れ" | "その他";

export type SampleApprovalRecord = {
  id: string;
  date: string;
  productName: string;
  expirationDate: string;
  manufactureDate: string;
  sampleType: string;
  sampleQuantity: string;
  unit: string;
  storageLocation: string;
  remarks: string;
  status: SampleStatus;
  discardedDate?: string;
  discardReason?: DiscardReason;
  discardReasonNote?: string;
  implementer: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  comment?: string;
};
