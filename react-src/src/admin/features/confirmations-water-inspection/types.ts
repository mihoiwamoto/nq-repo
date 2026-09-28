export type ConfirmStatus = "unconfirmed" | "confirmed";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export type WaterCheckResult = {
  status: "normal" | "abnormal";
  cause?: string;
  action?: string;
};

export type WaterConfirmationRecord = {
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
  confirmStatus: ConfirmStatus;
  comments?: Comment[];
};
