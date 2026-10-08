import type { ScaleRecord } from "./types";
import { at, statusAt, ymd } from "../../data/demoRecordGen";

export const scaleRecords: ScaleRecord[] = [
  {
    id: "sc1",
    date: "2025-04-01",
    scaleLabel: "プリン①",
    serialNumber: "ABC-123456",
    post: "プリン",
    skipped: false,
    operationCheck: "ok",
    operationCause: "",
    operationAction: null,
    repairStatus: null,
    levelCheck: "ok",
    dirtCheck: "ok",
    referenceWeight: 100,
    displayValue: 100,
    weightCause: null,
    remarks: "",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "pending",
    comments: [
      {
        id: "c1",
        author: "鈴木修",
        timestamp: "2026.08.19 10:39",
        text: "検索条件を確認しました。問題ありません。",
      },
      {
        id: "c2",
        author: "山田花子",
        timestamp: "2026.08.23 15:45",
        text: "データ抽出の期間を再度ご確認ください。",
      },
    ],
  },
  {
    id: "sc2",
    date: "2025-04-01",
    scaleLabel: "プリン②",
    serialNumber: "ABC-123457",
    post: "プリン",
    skipped: false,
    operationCheck: "ng",
    operationCause: "表示が点灯しない",
    operationAction: "修理",
    repairStatus: "action_needed",
    levelCheck: null,
    dirtCheck: null,
    referenceWeight: 100,
    displayValue: null,
    weightCause: null,
    remarks: "修理担当者へ連絡済み",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "pending",
  },
  {
    id: "sc3",
    date: "2025-04-01",
    scaleLabel: "プリン③",
    serialNumber: "ABC-123458",
    post: "プリン",
    skipped: true,
    operationCheck: "ok",
    operationCause: "",
    operationAction: null,
    repairStatus: null,
    levelCheck: null,
    dirtCheck: null,
    referenceWeight: 100,
    displayValue: null,
    weightCause: null,
    remarks: "ライン停止中のため点検見送り",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "pending",
  },
  {
    id: "sc4",
    date: "2025-04-01",
    scaleLabel: "プリン④",
    serialNumber: "ABC-123459",
    post: "プリン",
    skipped: false,
    operationCheck: "ok",
    operationCause: "",
    operationAction: null,
    repairStatus: null,
    levelCheck: "ok",
    dirtCheck: "ok",
    referenceWeight: 100,
    displayValue: 100,
    weightCause: null,
    remarks: "",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "pending",
  },
  {
    id: "sc5",
    date: "2025-04-01",
    scaleLabel: "プリン⑤",
    serialNumber: "ABC-123460",
    post: "プリン",
    skipped: false,
    operationCheck: "ok",
    operationCause: "",
    operationAction: null,
    repairStatus: null,
    levelCheck: "ok",
    dirtCheck: "ok",
    referenceWeight: 100,
    displayValue: 110,
    weightCause: "故障",
    remarks: "表示値のズレを確認、次回点検まで経過観察",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "pending",
  },
  {
    id: "sc6",
    date: "2025-04-02",
    scaleLabel: "プリン①",
    serialNumber: "ABC-123456",
    post: "プリン",
    skipped: false,
    operationCheck: "ok",
    operationCause: "",
    operationAction: null,
    repairStatus: null,
    levelCheck: "ok",
    dirtCheck: "ok",
    referenceWeight: 100,
    displayValue: 100,
    weightCause: null,
    remarks: "",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "approved",
  },
  {
    id: "sc7",
    date: "2025-04-02",
    scaleLabel: "プリン②",
    serialNumber: "ABC-123457",
    post: "プリン",
    skipped: false,
    operationCheck: "ok",
    operationCause: "",
    operationAction: null,
    repairStatus: null,
    levelCheck: "ok",
    dirtCheck: "ok",
    referenceWeight: 100,
    displayValue: 100,
    weightCause: null,
    remarks: "修理完了後の再点検、異常なし",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "rejected",
  },
  {
    id: "sc8",
    date: "2025-04-01",
    scaleLabel: "アイス①",
    serialNumber: "ABC-423456",
    post: "アイス",
    skipped: false,
    operationCheck: "ok",
    operationCause: "",
    operationAction: null,
    repairStatus: null,
    levelCheck: "ok",
    dirtCheck: "ok",
    referenceWeight: 100,
    displayValue: 100,
    weightCause: null,
    remarks: "",
    implementer: "佐々木亮",
    confirmer: "山本真理",
    approvalStatus: "pending",
  },
  {
    id: "sc9",
    date: "2025-04-01",
    scaleLabel: "アイス②",
    serialNumber: "ABC-423457",
    post: "アイス",
    skipped: false,
    operationCheck: "ng",
    operationCause: "重量が安定しない",
    operationAction: "電池交換",
    repairStatus: "done",
    levelCheck: null,
    dirtCheck: null,
    referenceWeight: 100,
    displayValue: null,
    weightCause: null,
    remarks: "電池交換にて対応完了",
    implementer: "佐々木亮",
    confirmer: "山本真理",
    approvalStatus: "approved",
  },
];

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の sc1〜sc9 は画面設計の hash と確定デザインが使うので変えない）。
 * 秤は週に 1 回の点検。プリンの持ち場は火曜、アイス・トッピング・添加物は木曜。3 月末・5 月頭にも少し。
 * 動作確認 ×（原因・対応・修理状況：要対応／修理中／修理完了／修理しない）、表示値のずれ（故障・その他）、
 * 水平・汚れの ×、点検見送り（備考に理由）、長い備考 を混ぜる。
 * ─────────────────────────────────────────────────────────────── */
const SCALES = [
  { scaleLabel: "プリン①", serialNumber: "ABC-123456", post: "プリン", ref: 100, staff: "田中裕子" },
  { scaleLabel: "プリン②", serialNumber: "ABC-123457", post: "プリン", ref: 100, staff: "田中裕子" },
  { scaleLabel: "プリン③", serialNumber: "ABC-123458", post: "プリン", ref: 100, staff: "高橋美咲" },
  { scaleLabel: "プリン④", serialNumber: "ABC-123459", post: "プリン", ref: 100, staff: "高橋美咲" },
  { scaleLabel: "プリン⑤", serialNumber: "ABC-123460", post: "プリン", ref: 100, staff: "田中裕子" },
  { scaleLabel: "アイス①", serialNumber: "ABC-423456", post: "アイス", ref: 100, staff: "佐々木亮" },
  { scaleLabel: "アイス②", serialNumber: "ABC-423457", post: "アイス", ref: 100, staff: "佐々木亮" },
  { scaleLabel: "トッピング①", serialNumber: "TPG-200118", post: "トッピング", ref: 50, staff: "渡辺真由" },
  { scaleLabel: "添加物計量用 精密はかり①（0.1g単位）", serialNumber: "PRC-0012-7781", post: "添加物", ref: 10, staff: "小林誠司" },
];

type ScalePattern = Partial<Omit<ScaleRecord, "id" | "date" | "scaleLabel" | "serialNumber" | "post" | "implementer" | "confirmer" | "approvalStatus">>;

const OP_NG = (operationCause: string, operationAction: ScaleRecord["operationAction"], repairStatus: ScaleRecord["repairStatus"], remarks: string): ScalePattern => ({
  operationCheck: "ng",
  operationCause,
  operationAction,
  repairStatus,
  levelCheck: null,
  dirtCheck: null,
  displayValue: null,
  remarks,
});

/** 正常以外の見本（番号順に回して当てる）。null は正常 */
const SCALE_PATTERNS: (ScalePattern | null)[] = [
  null,
  OP_NG("電源が入らない", "電池交換", "done", "電池交換にて対応完了"),
  null,
  { displayValue: 1, weightCause: "故障", remarks: "表示値が基準分銅より 1 ずれている。メーカーへ校正を依頼" },
  null,
  { skipped: true, levelCheck: null, dirtCheck: null, displayValue: null, remarks: "ライン停止中のため点検見送り" },
  null,
  OP_NG("表示が点滅し、数値が定まらない", "修理", "action_needed", "修理担当者へ連絡済み。代わりの秤を使用中"),
  { dirtCheck: "ng", remarks: "計量皿の裏にトッピングの付着あり。清掃後に再確認し問題なし" },
  null,
  OP_NG("風防の破損", "その他", "repairing", ""),
  { levelCheck: "ng", remarks: "水平器の気泡がずれていたため脚を調整" },
  { displayValue: -1, weightCause: "その他", remarks: "床の振動の影響と思われる。設置場所を変えて再確認予定" },
  null,
  OP_NG("ゼロ点が戻らない", "修理", "no_repair", "使用頻度が低いため修理せず予備の秤と入れ替え。入れ替え後は持ち場の秤一覧も更新した（品質管理課 承認済み）"),
  { skipped: true, levelCheck: null, dirtCheck: null, displayValue: null, remarks: "棚卸しのため製造なし。点検見送り" },
];

function scaleExtra(): ScaleRecord[] {
  const out: ScaleRecord[] = [];
  // 火曜（プリン）と木曜（アイス・トッピング・添加物）。4/1 の分は元の見本にある
  const tue: [number, number][] = [[3, 25], [4, 8], [4, 15], [4, 22], [4, 29], [5, 6]];
  const thu: [number, number][] = [[3, 27], [4, 3], [4, 10], [4, 17], [4, 24], [5, 1]];
  let n = 0;
  SCALES.forEach((s, si) => {
    const days = s.post === "プリン" ? tue : thu;
    days.forEach(([m, d], di) => {
      // プリン①② は毎週、アイスは隔週、ほかは月に 1 回（3 月・5 月の分はプリン①② とアイスだけ）で、件数に偏りを付ける
      const weekly = si <= 1;
      if (m === 4 && !weekly && (s.post === "アイス" ? di % 2 === 0 : di !== 3)) return;
      if (m !== 4 && !(si <= 1 || s.post === "アイス")) return;
      const p = at(SCALE_PATTERNS, n + si);
      const ref = s.ref;
      const rec: ScaleRecord = {
        id: `sc-x${si + 1}-${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`,
        date: ymd(m, d),
        scaleLabel: s.scaleLabel,
        serialNumber: s.serialNumber,
        post: s.post,
        skipped: false,
        operationCheck: "ok",
        operationCause: "",
        operationAction: null,
        repairStatus: null,
        levelCheck: "ok",
        dirtCheck: "ok",
        referenceWeight: ref,
        displayValue: ref,
        weightCause: null,
        remarks: "",
        implementer: s.staff,
        confirmer: di % 2 ? "山本真理" : "佐藤健一",
        approvalStatus: statusAt(n),
        ...(p ?? {}),
      };
      // 表示値のずれは基準分銅からの差で持っている
      if (p && typeof p.displayValue === "number" && p.weightCause) rec.displayValue = ref + p.displayValue;
      out.push(rec);
      n++;
    });
  });
  // 一覧は記録の並びのまま出るので、日付の順にしておく
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

scaleRecords.push(...scaleExtra());
