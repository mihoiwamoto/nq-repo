import type { WaterInspectionPoint } from "./types";

export const initialWaterInspectionPoints: WaterInspectionPoint[] = [
  {
    id: "wp1",
    factoryId: "f1",
    name: "給湯室",
    displayFrom: "2025-04-01",
    displayTo: "2028-04-01",
    checks: {
      taste: true,
      smell: true,
      color: true,
      turbidity: true,
      foreignMatter: true,
      ph: true,
      chlorine: true,
      uvOperatingHours: true,
      uvIndicatorLight: true,
      abnormalDetectionLight: true,
    },
    uvAlertHours: "4,000",
  },
  {
    id: "wp2",
    factoryId: "f1",
    name: "点検場所B",
    checks: {
      taste: false,
      smell: false,
      color: false,
      turbidity: false,
      foreignMatter: false,
      ph: false,
      chlorine: false,
      uvOperatingHours: false,
      uvIndicatorLight: false,
      abnormalDetectionLight: false,
    },
    uvAlertHours: "",
  },
];
