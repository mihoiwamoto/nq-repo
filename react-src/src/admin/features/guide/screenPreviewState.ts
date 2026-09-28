/**
 * 直接 URL を開いただけでは中身が出ない画面のための「見本の入力内容」。
 *
 * アプリの確認画面は、前の記録画面から location.state で入力内容を受け取る作りなので、
 * 遷移図やポップアップで URL だけ開くと「点検内容が見つかりません」になってしまう。
 * ここに置いた見本を、iframe 読み込み後に React Router の location.state として差し込んで表示する。
 *
 * キーは .claude/screen-map.json の filePath。値の形は各画面の state 型に手で合わせている
 * （画面側で state 型を変えたら、ここも直すこと）。
 */

const INSPECTOR = "実施者01";
const DATE = "2026/09/02";

const WATER_FORM_STATE = {
  date: DATE,
  checks: ["味", "臭い", "色", "濁り", "異物"].map((label) => ({ label, status: "ok" as const })),
  phValue: "7.0",
  residualChlorine: "0.4",
  chlorineChecked: true,
  uvOperatingHours: "1,200",
  uvChecked: true,
  uvIndicatorOk: true,
  errorIndicatorOk: true,
  inspectorName: INSPECTOR,
};

export const PREVIEW_STATE: Record<string, unknown> = {
  // 添加物管理: 1 件の記録内容を確認する形（SingleRecordConfirmState）
  "src/app/features/additive-management/ConfirmPage.tsx": {
    productId: "a1",
    date: DATE,
    storageLocation: "冷蔵庫A",
    spec: "1kg",
    initialStock: "10",
    category: "入庫",
    quantity: "5",
    currentStock: "15",
    remarks: "",
  },
  // 清掃記録
  "src/app/features/cleaning-record/ConfirmPage.tsx": {
    lineName: "ゆばライン",
    date: DATE,
    records: {},
    remarks: "",
    inspectorName: INSPECTOR,
  },
  "src/app/features/cleaning-record/SkipConfirmPage.tsx": {
    lineName: "ゆばライン",
    date: DATE,
    skipReason: "本日はラインの稼働がないため",
    inspectorName: INSPECTOR,
  },
  // 機械器具点検
  "src/app/features/equipment-inspection/ConfirmPage.tsx": {
    lineName: "豆乳ライン",
    date: DATE,
    records: { start: {}, end: {} },
    remarks: { start: "", end: "" },
    inspectorName: INSPECTOR,
  },
  "src/app/features/equipment-inspection/SkipConfirmPage.tsx": {
    lineName: "豆乳ライン",
    date: DATE,
    skipReason: "本日はラインの稼働がないため",
  },
  // 検体管理（本日の点検）
  "src/app/features/sample-management/SampleConfirmPage.tsx": {
    inspectorName: INSPECTOR,
    inspectionDate: DATE,
    manufactureDate: "2026/09/01",
    sampleType: "product",
    quantity: "2",
    unit: "個",
    storageLocation: "冷凍庫A",
    remarks: "",
  },
  // 検体管理（保管検体）
  "src/app/features/specimen-management/SpecimenManagementConfirmPage.tsx": {
    productName: "マンゴープリン　ストレート　1kg",
    expiryDate: "2026/12/01",
    inspectorName: INSPECTOR,
    inspectionDate: DATE,
    manufactureDate: "2026/09/01",
    specimenType: "製品",
    quantity: "2",
    unit: "個",
    storageLocation: "冷凍庫A",
    remarks: "",
    timestamp: `${DATE} 09:00`,
  },
  // 官能検査記録
  "src/app/features/sensory-inspection/ConfirmPage.tsx": {
    inspectorName: INSPECTOR,
    record: {
      date: DATE,
      manufactureDate: "2026/09/01",
      comparison: "none",
      comparisonManufactureDate: "",
      scores: {
        味: { score: 5, reason: "" },
        形: { score: 4, reason: "" },
        色: { score: 5, reason: "" },
        食感: { score: 4, reason: "" },
        香り: { score: 5, reason: "" },
        とろみ: { score: 4, reason: "" },
      },
      timestamps: {},
    },
  },
  // 使用水の点検
  "src/app/features/water-inspection/NewRecordConfirmPage.tsx": WATER_FORM_STATE,
  "src/app/features/water-inspection/RecordEditConfirmPage.tsx": WATER_FORM_STATE,
};

export function hasPreviewState(filePath: string): boolean {
  return filePath in PREVIEW_STATE;
}

/** iframe の中のアプリ（#root）が描画されるまで待つ */
function waitForApp(frame: HTMLIFrameElement, timeoutMs = 4000): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      let ready = false;
      try {
        ready = (frame.contentDocument?.querySelector("#root")?.childElementCount ?? 0) > 0;
      } catch {
        ready = true; // 別オリジン等で覗けないときは待たない
      }
      if (ready || Date.now() - started > timeoutMs) resolve();
      else setTimeout(tick, 60);
    };
    tick();
  });
}

/**
 * iframe 内の React Router に見本の state を渡す。
 * history.state を差し替えて popstate を起こすと、React Router が location.state を読み直して
 * その state で再描画する（同一オリジンの iframe でだけ使える）。
 * 見本が無い画面では何もしない。
 */
export async function applyPreviewState(frame: HTMLIFrameElement, filePath: string, route: string): Promise<void> {
  const state = PREVIEW_STATE[filePath];
  if (state === undefined) return;
  await waitForApp(frame);
  const win = frame.contentWindow;
  if (!win) return;
  try {
    const current = win.history.state as { idx?: number } | null;
    win.history.replaceState({ usr: state, key: `preview-${Date.now().toString(36)}`, idx: current?.idx ?? 0 }, "", route);
    const PopState = (win as Window & typeof globalThis).PopStateEvent;
    win.dispatchEvent(new PopState("popstate", { state: win.history.state }));
  } catch {
    /* 覗けない iframe（別オリジン等）は諦める */
  }
}
