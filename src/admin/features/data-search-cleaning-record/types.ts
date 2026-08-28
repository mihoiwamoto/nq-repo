export type ApprovalStatus = "pending" | "approved" | "rejected";

export type CleaningItemResult = {
  name: string;
  cleaned: boolean;
  timestamp: string;
  inspector: string;
};

export type CleaningPointResult = {
  location: string;
  items: CleaningItemResult[];
};

export type CleaningSearchRecord = {
  id: string;
  date: string;
  lineLabel: string;
  cleaned: boolean;
  remarks: string;
  implementer: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  cleaningPoints: CleaningPointResult[];
  detailRemarks?: string;
  comment?: string;
};
