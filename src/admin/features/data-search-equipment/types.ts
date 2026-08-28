export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ItemStatus = "ok" | "ng";

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
  remarks?: string;
};

export type ResultIcon = "ok" | "ng" | "skip";

export type InspectionRecord = {
  id: string;
  date: string;
  lineLabel: string;
  resultIcon: ResultIcon;
  remarks: string;
  implementer: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  sessions: InspectionSession[];
  comment?: string;
};
