export type ConfirmStatus = "unconfirmed" | "confirmed";

export type ChemicalTransactionType = "入庫" | "出庫";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type ChemicalConfirmationRecord = {
  id: string;
  date: string;
  chemicalName: string;
  type: ChemicalTransactionType;
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
