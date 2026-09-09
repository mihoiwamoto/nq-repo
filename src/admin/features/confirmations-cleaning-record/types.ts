export type ConfirmStatus = "unconfirmed" | "confirmed";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

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

export type CleaningConfirmationRecord = {
  id: string;
  date: string;
  lineLabel: string;
  cleaned: boolean;
  remarks: string;
  implementer: string;
  confirmer: string;
  confirmStatus: ConfirmStatus;
  cleaningPoints: CleaningPointResult[];
  detailRemarks?: string;
  comments?: Comment[];
};
