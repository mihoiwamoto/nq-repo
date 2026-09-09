export type ConfirmStatus = "unconfirmed" | "confirmed";

export type InspectionResult = "OK" | "NG";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type CheckItemStatus = "ok" | "ng";

export type CheckItem = {
  label: string;
  detail: string;
  status: CheckItemStatus;
  cause?: string;
  response?: string;
  inspectorName: string;
  timestamp: string;
};

export type MachineConfirmationRecord = {
  id: string;
  machineName: string;
  date: string;
  metalDetectorModel: string;
  xrayDetectorModel: string;
  result: InspectionResult;
  confirmer: string;
  confirmStatus: ConfirmStatus;
  metalInspector: string;
  metalCheckTime: string;
  metalChecks: CheckItem[];
  xrayInspector: string;
  xrayCheckTime: string;
  xrayChecks: CheckItem[];
  remarks: string;
  comments?: Comment[];
};
