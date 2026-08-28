import type { ApprovalStatus } from "../../data/approvals";

export type WaterCheckResult = {
  status: "normal" | "abnormal";
  cause?: string;
  action?: string;
};

export type WaterApprovalRecord = {
  id: string;
  date: string;
  time: string;
  location: string;
  taste: WaterCheckResult;
  smell: WaterCheckResult;
  color: WaterCheckResult;
  turbidity: WaterCheckResult;
  foreignMatter: WaterCheckResult;
  ph: number;
  chlorine: number;
  chlorineReplenished: boolean;
  uvOperatingHours: number;
  uvLampReplaced: boolean;
  uvIndicatorLight: "on" | "off";
  abnormalDetectionLight: "on" | "off";
  implementer: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  comment?: string;
};
