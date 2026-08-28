export type TestPieceSetting = {
  id: string;
  productName: string;
  settingNumber: string;
  fe: string;
  sus: string;
};

export type MetalDetectorUnit = {
  id: string;
  name: string;
  settings: TestPieceSetting[];
};
