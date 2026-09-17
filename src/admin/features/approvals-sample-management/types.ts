import type { ApprovalStatus } from "../../data/approvals";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type SampleStatus = "保管中" | "使用済み" | "破棄済み";
export type DiscardReason = "賞味期限切れ" | "その他";

export type SampleApprovalRecord = {
  id: string;
  date: string;
  productName: string;
  expirationDate: string;
  /** 管理画面で「記載する」と設定した製品だけに入る任意項目 */
  lotNumber?: string;
  manufactureDate: string;
  sampleType: string;
  sampleQuantity: string;
  unit: string;
  storageLocation: string;
  remarks: string;
  /** アプリで記録した時刻。詳細画面で項目の下に出す */
  timestamp?: string;
  status: SampleStatus;
  discardedDate?: string;
  discardReason?: DiscardReason;
  discardReasonNote?: string;
  implementer: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  comments?: Comment[];
};
