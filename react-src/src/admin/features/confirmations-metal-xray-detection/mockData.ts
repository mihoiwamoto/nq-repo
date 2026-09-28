import type { CheckItem, MachineConfirmationRecord } from "./types";

const METAL_CHECK_DEFS = [
  { label: "電源ON", detail: "電源が正常に入り始動する" },
  { label: "操作パネル", detail: "操作パネルに異常がなく操作できる" },
  { label: "コンベア・プーリー・モーター", detail: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
  { label: "ローラー", detail: "ローラーに引っ掛かりがないか（サーチコイルに接触していないか）" },
  { label: "設定", detail: "各設定基準が正しいか" },
  { label: "はね板（フリッパー）", detail: "正常に反応し作動する" },
];

const XRAY_CHECK_DEFS = [
  { label: "電源ON", detail: "電源が正常に入り始動する" },
  { label: "操作パネル", detail: "操作パネルに異常がなく操作できる" },
  { label: "コンベア・センサー", detail: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
  { label: "機械同士の接触が無いか", detail: "機械同士の接触が無いか" },
  { label: "はね板（フリッパー）", detail: "正常に反応し作動する" },
];

function buildOkChecks(defs: typeof METAL_CHECK_DEFS, inspectorName: string, startTime: string): CheckItem[] {
  const [h, m] = startTime.split(":").map(Number);
  return defs.map((def, index) => {
    const minutes = m + index * 5;
    const timestamp = `${String(h + Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    return { ...def, status: "ok", inspectorName, timestamp: `${inspectorName} 2026/04/01 ${timestamp}` };
  });
}

export const machineConfirmationRecords: MachineConfirmationRecord[] = [
  {
    id: "mxc1",
    machineName: "豆乳ラインNo.1",
    date: "2025-04-01",
    metalDetectorModel: "GM-500S",
    xrayDetectorModel: "XR-500S",
    result: "NG",
    confirmer: "山田太郎",
    confirmStatus: "unconfirmed",
    metalInspector: "田中太郎",
    metalCheckTime: "08:25",
    metalChecks: buildOkChecks(METAL_CHECK_DEFS, "田中太郎", "08:30").map((item, index) =>
      index === 1
        ? {
            ...item,
            status: "ng",
            cause: "操作パネル表面の汚れによる視認性低下",
            response: "アルコールクリーナーで清掃を実施。視認性が回復したことを確認。",
          }
        : item
    ),
    xrayInspector: "佐藤花子",
    xrayCheckTime: "08:25",
    xrayChecks: buildOkChecks(XRAY_CHECK_DEFS, "佐藤花子", "09:00"),
    remarks: "操作パネルに軽微な汚れあり。次回清掃時に対応予定。金属探知機のセンサー感度は基準値内であることを確認済み。",
    comments: [
      {
        id: "mc1",
        author: "鈴木修",
        timestamp: "2026.08.19 10:39",
        text: "検索条件を確認しました。問題ありません。",
      },
      {
        id: "mc2",
        author: "山田花子",
        timestamp: "2026.08.23 15:45",
        text: "データ抽出の期間を再度ご確認ください。",
      },
    ],
  },
  {
    id: "mxc2",
    machineName: "豆乳ラインNo.2",
    date: "2025-04-01",
    metalDetectorModel: "GM-1000S",
    xrayDetectorModel: "XR-1000S",
    result: "OK",
    confirmer: "佐藤花子",
    confirmStatus: "confirmed",
    metalInspector: "実施者02",
    metalCheckTime: "08:00",
    metalChecks: buildOkChecks(METAL_CHECK_DEFS, "実施者02", "08:00"),
    xrayInspector: "実施者02",
    xrayCheckTime: "08:00",
    xrayChecks: buildOkChecks(XRAY_CHECK_DEFS, "実施者02", "08:30"),
    remarks: "",
  },
  {
    id: "mxc3",
    machineName: "豆乳ラインNo.1",
    date: "2025-04-02",
    metalDetectorModel: "GM-500S",
    xrayDetectorModel: "XR-500S",
    result: "OK",
    confirmer: "山田太郎",
    confirmStatus: "unconfirmed",
    metalInspector: "田中太郎",
    metalCheckTime: "08:00",
    metalChecks: buildOkChecks(METAL_CHECK_DEFS, "田中太郎", "08:00"),
    xrayInspector: "田中太郎",
    xrayCheckTime: "08:30",
    xrayChecks: buildOkChecks(XRAY_CHECK_DEFS, "田中太郎", "08:30"),
    remarks: "本日の検査は予定通り完了しました。全ての検査項目において良好な結果が得られています。",
  },
];
