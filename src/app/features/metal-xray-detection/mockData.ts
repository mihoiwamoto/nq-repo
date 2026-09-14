export type MachineStatus = "not_inspected" | "inspected";

export type Machine = {
  id: string;
  name: string;
  status: MachineStatus;
  metalDetectorModel: string;
  xrayDetectorModel: string;
  weightCheckerModel: string;
  displayFrom?: string;
  displayTo?: string;
};

export const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  not_inspected: "未点検",
  inspected: "点検済み",
};

export const METAL_DETECTOR_UNITS = ["金属探知機1号機", "金属探知機2号機", "金属探知機3号機"];
export const XRAY_DETECTOR_UNITS = ["X線探知機1号機", "X線探知機2号機", "X線探知機3号機"];
export const WEIGHT_CHECKER_UNITS = ["ウェイトチェッカー1号機", "ウェイトチェッカー2号機", "ウェイトチェッカー3号機"];

export const MACHINE_STATUS_COLORS: Record<MachineStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  inspected: "#DCAA14",
};

export function isMachineDisplayable(machine: Machine): boolean {
  if (!machine.displayFrom && !machine.displayTo) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (machine.displayFrom) {
    const fromDate = new Date(machine.displayFrom);
    if (today < fromDate) {
      return false;
    }
  }

  if (machine.displayTo) {
    const toDate = new Date(machine.displayTo);
    toDate.setHours(23, 59, 59, 999);
    if (today > toDate) {
      return false;
    }
  }

  return true;
}

export const MACHINES: Machine[] = [
  {
    id: "m1",
    name: "金探1号機（500g以下の場合）",
    status: "not_inspected",
    metalDetectorModel: "GM-500S",
    xrayDetectorModel: "XR-500S",
    weightCheckerModel: "WC-500S",
  },
  {
    id: "m2",
    name: "金探1号機（1kg以下の場合）",
    status: "inspected",
    metalDetectorModel: "GM-1000S",
    xrayDetectorModel: "XR-1000S",
    weightCheckerModel: "WC-1000S",
  },
  {
    id: "m3",
    name: "X線探知機1号機",
    status: "not_inspected",
    metalDetectorModel: "GM-2000S",
    xrayDetectorModel: "XR-2000S",
    weightCheckerModel: "WC-2000S",
    displayFrom: "2026-09-01",
    displayTo: "2026-09-30",
  },
  {
    id: "m4",
    name: "ウェイトチェッカー1号機",
    status: "not_inspected",
    metalDetectorModel: "GM-3000S",
    xrayDetectorModel: "XR-3000S",
    weightCheckerModel: "WC-3000S",
  },
];

export const MACHINE_INSPECTED_AT: Record<string, string> = {
  m1: "4.23 10:32",
  m2: "4.23 11:15",
};

export type InspectionContent = "動作確認" | "テストピース" | "製品通過" | "異常反応";
export type InspectionResult = "OK" | "NG";

export const INSPECTION_CONTENTS: InspectionContent[] = ["動作確認", "テストピース", "製品通過", "異常反応"];

export const RESULT_LABELS: Record<InspectionResult, string> = {
  OK: "正常",
  NG: "異常あり",
};

export const RESULT_COLORS: Record<InspectionResult, string> = {
  OK: "var(--semantic-status-success)",
  NG: "var(--semantic-status-error)",
};

export type RecordExecutionPhase = "開始" | "終了" | "ー";

export type MachineRecordDetail = {
  metalUnit: string;
  metalTime: string;
  metalChecks: Record<string, OkNg>;
  metalAnomalyNotes?: Record<string, { cause: string; response: string }>;
  xrayUnit: string;
  xrayTime: string;
  xrayChecks: Record<string, OkNg>;
  xrayAnomalyNotes?: Record<string, { cause: string; response: string }>;
};

export type TestPieceDetail = {
  metalUnit: string;
  metalTime: string;
  metalSettingNumber: string;
  metalPieceValues: Record<string, string>;
  metalPieceChecks: Record<string, OkNg>;
  metalPieceAnomalyNotes?: Record<string, { cause?: string; responseType?: string; response: string }>;
  xrayUnit: string;
  xrayTime: string;
  xraySettingNumber: string;
  xrayPieceValues: Record<string, string>;
  xrayPieceChecks: Record<string, OkNg>;
  xrayPieceAnomalyNotes?: Record<string, { cause?: string; responseType?: string; response: string }>;
};

export type ProductPassDetail = {
  passQuantity: string;
  weightCheckerUnit: string;
  weightCheckerTime: string;
  weightLowerLimit: string;
  weightCalibrationCheck: OkNg | null;
  weightPackageMatchCheck: OkNg | null;
  sealingTime: string;
  sealingCheck: OkNg | null;
};

export type AbnormalDetail = {
  passedQuantity: string;
  abnormalQuantity: string;
  abnormalCause: AbnormalCause;
  abnormalCauseNote: string;
  abnormalAction: AbnormalAction;
  abnormalActionNote: string;
};

export type MachineAnomalyNote = {
  itemLabel: string;
  cause: string;
  response: string;
  responseNote?: string;
};

export type MachineRecord = {
  id: string;
  category: RecordExecutionPhase;
  time: string;
  content: InspectionContent;
  passedProduct: string;
  result: InspectionResult;
  remarks: string;
  inspectorName: string;
  detail?: MachineRecordDetail;
  testPieceDetail?: TestPieceDetail;
  productPassDetail?: ProductPassDetail;
  abnormalDetail?: AbnormalDetail;
  machineAnomalyNotes?: MachineAnomalyNote[];
};

export const MACHINE_RECORDS: Record<string, MachineRecord[]> = {
  m1: [
    {
      id: "r1",
      category: "開始",
      time: "07:15",
      content: "動作確認",
      passedProduct: "",
      result: "NG",
      remarks: "",
      inspectorName: "山田太郎",
      detail: {
        metalUnit: "金属探知機1号機",
        metalTime: "07:15",
        metalChecks: {
          power_on: "ok",
          panel_ok: "ng",
          conveyor_ok: "ok",
          roller_ok: "ok",
          setting_ok: "ok",
          flipper_ok: "ok",
        },
        metalAnomalyNotes: {
          panel_ok: {
            cause: "表示パネルの液晶不良により数値表示が不明確",
            response: "メーカーに修理依頼し、パネルユニット交換を実施予定",
          },
        },
        xrayUnit: "X線探知機1号機",
        xrayTime: "07:22",
        xrayChecks: {
          power_on: "ok",
          panel_ok: "ok",
          conveyor_ok: "ok",
          contact_ok: "ok",
          flipper_ok: "ok",
        },
      },
    },
    {
      id: "r2",
      category: "開始",
      time: "07:38",
      content: "テストピース",
      passedProduct: "マンゴープリン ストレート 1kg",
      result: "OK",
      remarks: "",
      inspectorName: "山田太郎",
      testPieceDetail: {
        metalUnit: "金属探知機1号機",
        metalTime: "07:38",
        metalSettingNumber: "1",
        metalPieceValues: {
          fe: "2.0",
          sus: "3.0",
        },
        metalPieceChecks: {
          fe: "ok",
          sus: "ok",
        },
        xrayUnit: "X線探知機1号機",
        xrayTime: "07:45",
        xraySettingNumber: "1",
        xrayPieceValues: {
          sus_ball: "2.0",
          sus_wire: "3.0",
          glass_ball: "3.0",
          ceramic: "3.0",
          rubber_ball: "3.0",
        },
        xrayPieceChecks: {
          sus_ball: "ok",
          sus_wire: "ok",
          glass_ball: "ok",
          ceramic: "ok",
          rubber_ball: "ok",
        },
      },
    },
    {
      id: "r3",
      category: "開始",
      time: "08:15",
      content: "異常反応",
      passedProduct: "商品A",
      result: "NG",
      remarks: "",
      inspectorName: "山田太郎",
      abnormalCause: "異物混入",
      abnormalCauseNote: "テスト",
      abnormalAction: "点検調整",
      abnormalActionNote: "テストととと",
    },
  ],
  m2: [
    {
      id: "r4",
      category: "ー",
      time: "08:25",
      content: "動作確認",
      passedProduct: "",
      result: "OK",
      remarks: "動作確認完了",
      inspectorName: "田中花子",
    },
    {
      id: "r5",
      category: "開始",
      time: "08:30",
      content: "テストピース",
      passedProduct: "テスト用治具A",
      result: "OK",
      remarks: "",
      inspectorName: "田中花子",
    },
    {
      id: "r6",
      category: "終了",
      time: "08:40",
      content: "テストピース",
      passedProduct: "テスト用治具A",
      result: "OK",
      remarks: "",
      inspectorName: "田中花子",
    },
    {
      id: "r7",
      category: "開始",
      time: "08:45",
      content: "製品通過",
      passedProduct: "マンゴープリン 1kg",
      result: "OK",
      remarks: "",
      inspectorName: "田中花子",
    },
    {
      id: "r8",
      category: "終了",
      time: "16:25",
      content: "製品通過",
      passedProduct: "マンゴープリン 1kg",
      result: "OK",
      remarks: "",
      inspectorName: "佐藤太郎",
    },
    {
      id: "r9",
      category: "開始",
      time: "16:30",
      content: "テストピース",
      passedProduct: "テスト用治具B",
      result: "OK",
      remarks: "",
      inspectorName: "佐藤太郎",
    },
    {
      id: "r10",
      category: "終了",
      time: "16:40",
      content: "テストピース",
      passedProduct: "テスト用治具B",
      result: "OK",
      remarks: "終了確認",
      inspectorName: "佐藤太郎",
    },
  ],
};

/**
 * その探知機の記録。m3 / m4 には専用のモックが無いので m2 の記録を流用する
 * （記録が引けないと点検済み・確認完了の画面が空になってしまうため）。
 */
export function recordsForMachine(machineId: string | undefined): MachineRecord[] {
  return MACHINE_RECORDS[machineId ?? ""] ?? MACHINE_RECORDS.m2 ?? [];
}

export const MACHINE_INSPECTION_DATES: Record<string, string> = {
  m1: "2025-03-24",
  m2: "2025-03-24",
};

/** 記録と同じく、m3 / m4 は m2 の実施日を流用する */
export function inspectionDateForMachine(machineId: string | undefined): string | undefined {
  return MACHINE_INSPECTION_DATES[machineId ?? ""] ?? MACHINE_INSPECTION_DATES.m2;
}

export type MachineRejectionComment = {
  id: string;
  authorName: string;
  timestamp: string;
  body: string;
};

export const MACHINE_REJECTION_COMMENTS: Record<string, MachineRejectionComment[]> = {
  m1: [
    {
      id: "c1",
      authorName: "西村千夏",
      timestamp: "25.04.02 10:16",
      body: "動作確認の記録に不足があります。金属探知機・X線探知機の点検結果を確認のうえ、再度ご記入をお願いします。",
    },
  ],
};

export type OkNg = "ok" | "ng";

export type ChecklistItem = { key: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const METAL_DETECTOR_CHECKLIST: ChecklistGroup[] = [
  {
    title: "電源ON",
    items: [
      { key: "power_on", label: "電源が正常に入り始動する" },
      { key: "panel_ok", label: "操作パネルに異常がなく操作できる" },
    ],
  },
  {
    title: "コンベア・プーリー・モーター",
    items: [
      { key: "conveyor_ok", label: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
      { key: "roller_ok", label: "ローラーに引っ掛かりがないか（サーチコイルに接触していないか）" },
    ],
  },
  {
    title: "設定",
    items: [{ key: "setting_ok", label: "各設定基準が正しいか" }],
  },
  {
    title: "はね板（フリッパー）",
    items: [{ key: "flipper_ok", label: "正常に反応し作動する" }],
  },
];

export type ExecutionPhase = "開始" | "終了";

export type TestPieceRow = { key: string; label: string; example: string };

export const METAL_TEST_PIECES: TestPieceRow[] = [
  { key: "fe", label: "Fe", example: "2.0" },
  { key: "sus", label: "Sus", example: "3.0" },
];

export const XRAY_TEST_PIECES: TestPieceRow[] = [
  { key: "sus_ball", label: "Sus球", example: "2.0" },
  { key: "sus_wire", label: "Sus線", example: "3.0" },
  { key: "glass_ball", label: "ガラス球", example: "3.0" },
  { key: "ceramic", label: "セラミック", example: "3.0" },
  { key: "rubber_ball", label: "ゴム球", example: "3.0" },
];

export type AbnormalCause = "異物混入" | "故障" | "その他";
export const ABNORMAL_CAUSES: AbnormalCause[] = ["異物混入", "故障", "その他"];

export type AbnormalAction = "点検調整" | "再加工" | "破棄" | "その他";
export const ABNORMAL_ACTIONS: AbnormalAction[] = ["点検調整", "再加工", "破棄", "その他"];

export const XRAY_DETECTOR_CHECKLIST: ChecklistGroup[] = [
  {
    title: "電源ON",
    items: [
      { key: "power_on", label: "電源が正常に入り始動する" },
      { key: "panel_ok", label: "操作パネルに異常がなく操作できる" },
    ],
  },
  {
    title: "コンベア・センサー",
    items: [
      { key: "conveyor_ok", label: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
      { key: "contact_ok", label: "機械同士の接触が無いか" },
    ],
  },
  {
    title: "はね板（フリッパー）",
    items: [{ key: "flipper_ok", label: "正常に反応し作動する" }],
  },
];
