import type { ApprovalStatus } from "../../data/approvals";

export type AdditiveTransactionType = "入庫" | "出庫";

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export type AdditiveRecord = {
  id: string;
  date: string;
  additiveName: string;
  type: AdditiveTransactionType;
  previousStock: string;
  quantity: string;
  currentStock: string;
  storageLocation: string;
  remarks: string;
  implementer: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  comment?: string;
  comments?: Comment[];
};
