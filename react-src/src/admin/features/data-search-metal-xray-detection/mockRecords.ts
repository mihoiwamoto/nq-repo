import type { InspectionRecord, MachineSearchRecord } from "./types";
import { aprilDays, at, statusAt, ymd } from "../../data/demoRecordGen";

export const machineSearchRecords: MachineSearchRecord[] = [
  {
    id: "dm1",
    machineName: "金探1号機（500g以下の場合）",
    date: "2025-04-01",
    metalDetectorModel: "GM-500S",
    xrayDetectorModel: "XR-500S",
    weightCheckerModel: "WC-500S",
    result: "OK",
    confirmer: "山田太郎",
    approvalStatus: "pending",
    metalComments: [
      {
        id: "mc1",
        author: "田中太郎",
        timestamp: "2026.08.19 10:39",
        text: "金属探知機の動作確認を実施しました。全ての検査項目で正常に動作しています。",
      },
      {
        id: "mc2",
        author: "佐藤花子",
        timestamp: "2026.08.23 15:45",
        text: "キャリブレーション値の確認を完了しました。問題ありません。",
      },
    ],
    xrayComments: [
      {
        id: "xc1",
        author: "田中太郎",
        timestamp: "2026.08.19 11:15",
        text: "X線探知機の感度設定を確認しました。正常範囲内です。",
      },
    ],
    metalOperationComments: [
      {
        id: "moc1",
        author: "山田太郎",
        timestamp: "2026.08.27 08:30",
        text: "本日の動作確認は予定通り完了しました。",
      },
    ],
    xrayOperationComments: [
      {
        id: "xoc1",
        author: "鈴木花子",
        timestamp: "2026.08.27 09:00",
        text: "X線検査システムの動作は良好です。次回検査予定は9月27日です。",
      },
    ],
    records: [
      {
        id: "dm1-1",
        category: "開始",
        time: "08:00",
        content: "動作確認",
        passedProduct: "ー",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
      {
        id: "dm1-2",
        category: "開始",
        time: "08:05",
        content: "テストピース",
        passedProduct: "ー",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
      {
        id: "dm1-3",
        category: "開始",
        time: "08:10",
        content: "製品通過",
        passedProduct: "仕出しだし巻き玉子 冷凍",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
      {
        id: "dm1-4",
        category: "終了",
        time: "17:00",
        content: "製品通過",
        passedProduct: "仕出しだし巻き玉子 冷凍",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
      {
        id: "dm1-5",
        category: "終了",
        time: "17:05",
        content: "テストピース",
        passedProduct: "ー",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
      {
        id: "dm1-6",
        category: "終了",
        time: "17:10",
        content: "異常反応",
        passedProduct: "ー",
        result: "NG",
        remarks: "",
        inspectorName: "田中太郎",
      },
    ],
  },
  {
    id: "dm2",
    machineName: "金探1号機（1kg以下の場合）",
    date: "2025-04-01",
    metalDetectorModel: "GM-1000S",
    xrayDetectorModel: "XR-1000S",
    weightCheckerModel: "WC-1000S",
    result: "NG",
    confirmer: "佐藤花子",
    approvalStatus: "rejected",
    records: [
      {
        id: "dm2-1",
        category: "開始",
        time: "08:00",
        content: "動作確認",
        passedProduct: "ー",
        result: "OK",
        remarks: "",
        inspectorName: "実施者02",
      },
      {
        id: "dm2-2",
        category: "ー",
        time: "12:30",
        content: "異常反応",
        passedProduct: "茶碗蒸しの素（濃縮）",
        result: "NG",
        remarks: "金属異物を検知したため製品を廃棄",
        inspectorName: "実施者02",
      },
    ],
  },
  {
    id: "dm3",
    machineName: "金探1号機（500g以下の場合）",
    date: "2025-04-02",
    metalDetectorModel: "GM-500S",
    xrayDetectorModel: "XR-500S",
    weightCheckerModel: "WC-500S",
    result: "OK",
    confirmer: "山田太郎",
    approvalStatus: "approved",
    records: [
      {
        id: "dm3-1",
        category: "開始",
        time: "08:00",
        content: "動作確認",
        passedProduct: "ー",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
      {
        id: "dm3-2",
        category: "終了",
        time: "17:00",
        content: "動作確認",
        passedProduct: "ー",
        result: "OK",
        remarks: "",
        inspectorName: "田中太郎",
      },
    ],
  },
];

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の dm1〜dm3 は画面設計の hash と確定デザインが使うので変えない）。
 * 点検構成（機器）ごとに 4 月の稼働日の 1 日おきくらい。3 月末・5 月頭にも少し。
 * 1 日の点検の形は元の見本の 3 つ（開始〜終了の通し dm1・動作確認だけ dm3・途中の異常反応 dm2）に合わせ、
 * NG（異常反応で製品の排除・テストピースの未検出・動作確認の不具合）を原因・対応・備考つきで混ぜる。
 * ─────────────────────────────────────────────────────────────── */
type MetalMachine = Pick<MachineSearchRecord, "machineName" | "metalDetectorModel" | "xrayDetectorModel" | "weightCheckerModel">;

const METAL_MACHINES: (MetalMachine & { staff: string[]; confirmer: string; products: string[] })[] = [
  {
    machineName: "金探1号機（500g以下の場合）",
    metalDetectorModel: "GM-500S",
    xrayDetectorModel: "XR-500S",
    weightCheckerModel: "WC-500S",
    staff: ["田中太郎", "佐藤健一"],
    confirmer: "山田太郎",
    products: ["仕出しだし巻き玉子 冷凍", "ふわとろスクランブルエッグ"],
  },
  {
    machineName: "金探1号機（1kg以下の場合）",
    metalDetectorModel: "GM-1000S",
    xrayDetectorModel: "XR-1000S",
    weightCheckerModel: "WC-1000S",
    staff: ["実施者02", "高橋美咲"],
    confirmer: "佐藤花子",
    products: ["茶碗蒸しの素（濃縮）", "だし巻き玉子 厚焼き 300g"],
  },
  {
    machineName: "X線検査機 A（包装ライン 出荷前最終確認・トレー入り製品用）",
    metalDetectorModel: "GM-2000T",
    xrayDetectorModel: "XR-2000T",
    weightCheckerModel: "WC-2000T",
    staff: ["小林誠司", "山本拓海"],
    confirmer: "山田太郎",
    products: ["仕出しだし巻き玉子 冷凍", "茶碗蒸しの素（濃縮）"],
  },
];

type Item = Omit<InspectionRecord, "id">;

function ok(category: InspectionRecord["category"], time: string, content: InspectionRecord["content"], inspectorName: string, passedProduct = "ー", remarks = ""): Item {
  return { category, time, content, passedProduct, result: "OK", remarks, inspectorName };
}

/** その日の点検の並び。kind で形と NG を変える */
function metalItems(kind: number, who: string, products: string[]): Item[] {
  const p = at(products, kind);
  // 12 回に 4 回が NG（終了時の異常反応・動作確認・途中の異常反応・テストピース）、2 回が動作確認だけ
  const shape = ({ 1: 1, 4: 3, 7: 5, 10: 6, 2: 2, 8: 2 } as Record<number, number>)[kind % 12] ?? 0;
  switch (shape) {
    case 1: // 終了時の異常反応 NG（製品を排除）
      return [
        ok("開始", "08:00", "動作確認", who),
        ok("開始", "08:05", "テストピース", who),
        ok("開始", "08:10", "製品通過", who, p),
        ok("終了", "17:00", "製品通過", who, p),
        ok("終了", "17:05", "テストピース", who),
        {
          category: "終了",
          time: "17:10",
          content: "異常反応",
          passedProduct: p,
          result: "NG",
          remarks: "排除した製品 2 個を開封し、2mm の金属片を確認。同じ時間帯の製品を再検査した。",
          inspectorName: who,
          cause: "異物混入",
          response: "排除した製品は廃棄。原料の受け入れ時の異物検査を強化し、ラインの刃物の欠けも確認した。",
        },
      ];
    case 3: // 動作確認 NG
      return [
        {
          category: "開始",
          time: "08:00",
          content: "動作確認",
          passedProduct: "ー",
          result: "NG",
          remarks: "コンベアベルトの蛇行。位置を調整して再確認し OK。",
          inspectorName: who,
          cause: "コンベアベルトの蛇行",
          response: "ベルトの張りを調整",
        },
        ok("終了", "17:00", "動作確認", who),
      ];
    case 5: // 途中の異常反応（dm2 と同じ形）
      return [
        ok("開始", "08:00", "動作確認", who),
        {
          category: "ー",
          time: at(["10:45", "13:20", "14:05"], kind),
          content: "異常反応",
          passedProduct: p,
          result: "NG",
          remarks: "金属異物を検知したため製品を廃棄",
          inspectorName: who,
          cause: "異物混入",
          response: "点検調整",
        },
      ];
    case 6: // テストピースが検出されない
      return [
        ok("開始", "08:00", "動作確認", who),
        {
          category: "開始",
          time: "08:05",
          content: "テストピース",
          passedProduct: "ー",
          result: "NG",
          remarks: "Fe φ1.0 が 3 回中 1 回検出されず。感度を再設定し、再試験で 3 回とも検出。",
          inspectorName: who,
          cause: "感度設定のずれ",
          response: "感度の再設定と再試験",
        },
        ok("開始", "08:10", "製品通過", who, p, "ロット切り替えのため 2 回通過"),
        ok("終了", "17:00", "製品通過", who, p),
        ok("終了", "17:05", "テストピース", who),
      ];
    case 2: // 動作確認だけ（dm3 と同じ形）
      return [ok("開始", "08:00", "動作確認", who), ok("終了", "17:00", "動作確認", who)];
    default: // 通常（開始〜終了すべて OK）
      return [
        ok("開始", "08:00", "動作確認", who),
        ok("開始", "08:05", "テストピース", who),
        ok("開始", "08:10", "製品通過", who, p),
        ok("終了", "17:00", "製品通過", who, p),
        ok("終了", "17:05", "テストピース", who),
        ok("終了", "17:10", "異常反応", who),
      ];
  }
}

function metalExtra(): MachineSearchRecord[] {
  const out: MachineSearchRecord[] = [];
  let n = 0;
  METAL_MACHINES.forEach((machine, mi) => {
    const { staff, confirmer, products, ...model } = machine;
    // 1・2 号機は 4/3 から 3 日に 1 回ずつ（元の見本が 4/1・4/2 にあるため）、X 線は週に 1 回ほど
    const april = mi === 2 ? [4, 11, 18, 25, 29] : aprilDays(3, 30).filter((_, i) => i % 3 === mi);
    const days: [number, number][] = [[3, 28 + mi], ...april.map((d) => [4, d] as [number, number]), [5, 1 + mi]];
    days.forEach(([m, d], di) => {
      const id = `dm-x${mi + 1}-${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
      const who = at(staff, di);
      const records = metalItems(n + mi * 3, who, products).map((item, i) => ({ id: `${id}-${i + 1}`, ...item }));
      out.push({
        id,
        ...model,
        date: ymd(m, d),
        result: records.some((r) => r.result === "NG") ? "NG" : "OK",
        confirmer,
        approvalStatus: statusAt(n),
        records,
      });
      n++;
    });
  });
  // 一覧は記録の並びのまま出るので、日付の順にしておく
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

machineSearchRecords.push(...metalExtra());
