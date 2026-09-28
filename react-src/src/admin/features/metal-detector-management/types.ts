export type TestPieceSetting = {
  id: string;
  productName: string;
  settingNumber: string;
  fe: string;
  sus: string;
};

export type MetalDetectorUnit = {
  id: string;
  displayFrom?: string;
  displayTo?: string;
  name: string;
  settings: TestPieceSetting[];
  factoryName?: string;
  checklistName?: string;
  appDisplayFrom?: string;
  appDisplayTo?: string;
  metalDetector?: "記録する" | "記録しない";
  metalDetectorNo?: string;
  xrayDetector?: "記録する" | "記録しない";
  xrayDetectorNo?: string;
  weightChecker?: "記録する" | "記録しない";
  weightCheckerNo?: string;
  sealing?: "記録する" | "記録しない";
  mainProducts?: string[];
};
