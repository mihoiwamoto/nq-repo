export type XrayTestPieceSetting = {
  id: string;
  productName: string;
  settingNumber: string;
  susBall: string;
  susWire: string;
  glassBall: string;
  ceramic: string;
  rubberBall: string;
};

export type XrayDetectorUnit = {
  id: string;
  name: string;
  settings: XrayTestPieceSetting[];
};
