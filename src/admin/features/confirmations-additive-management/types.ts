export type ConfirmStatus = "unconfirmed" | "confirmed";

export type AdditiveTransactionType = "入庫" | "出庫";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type AdditiveConfirmationRecord = {
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
  confirmStatus: ConfirmStatus;
  comments?: Comment[];
};
