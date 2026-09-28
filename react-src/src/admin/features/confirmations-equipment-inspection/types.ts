export type ConfirmStatus = "unconfirmed" | "confirmed";
export type ResultIcon = "ok" | "ng" | "skip";
export type ItemStatus = "ok" | "ng";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type InspectionItemResult = {
  name: string;
  status: ItemStatus;
  cause?: string;
  action?: string;
  timestamp: string;
  inspector: string;
};

export type InspectionPointResult = {
  location: string;
  items: InspectionItemResult[];
};

export type InspectionSession = {
  segment: string;
  points: InspectionPointResult[];
  remarks: string;
};

export type EquipmentConfirmationRecord = {
  id: string;
  date: string;
  lineLabel: string;
  resultIcon: ResultIcon;
  remarks: string;
  implementer: string;
  confirmer: string;
  confirmStatus: ConfirmStatus;
  sessions: InspectionSession[];
  comments?: Comment[];
};
