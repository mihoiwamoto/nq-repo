export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ResultIcon = "ok" | "ng" | "skip";
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
  segment: "始業" | "終業";
  points: InspectionPointResult[];
  remarks: string;
};

export type EquipmentApprovalRecord = {
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
