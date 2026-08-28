import type { ApprovalStatus } from "../../data/approvals";

export type ChemicalTransactionType = "入庫" | "出庫";

export type ChemicalApprovalRecord = {
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
  approvalStatus: ApprovalStatus;
  comment?: string;
};
