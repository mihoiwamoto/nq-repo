export type ConfirmStatus = "unconfirmed" | "confirmed";

/** 本番どおり 2 つ（trashed() ? "破棄済み" : "保管中"） */
export type SampleStatus = "保管中" | "破棄済み";
export type DiscardReason = "賞味期限切れ" | "その他";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type SampleConfirmationRecord = {
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
  status: SampleStatus;
  discardedDate?: string;
  discardReason?: DiscardReason;
  discardReasonNote?: string;
  implementer: string;
  confirmer: string;
  confirmStatus: ConfirmStatus;
  timestamp?: string;
  comments?: Comment[];
};
