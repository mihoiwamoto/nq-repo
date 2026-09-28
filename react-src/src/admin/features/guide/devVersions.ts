/**
 * 開発 Ver 管理の記録。
 *
 * デザインを先行して作り、そのあと実装する進め方をしているので、
 * 「どの Ver で何を作ったか」をあとから見返せるようにここへ残していく。
 * Ver が変わるときはこの配列に新しいエントリを足し、前の Ver の status を進める。
 *
 * Ver.3.0 以前の内容は Confluence（NQリポ スペース）の「概要」「スケジュール」「リリース記録 ver x.x」
 * 「開発定例MTG」から起こしたもの。各エントリの links に元ページを残してある。
 *
 * バージョン番号のルール（Confluence「バージョンについて」より）:
 *   帳票を追加するメジャーアップデートで整数部分を上げる。マイナー修正・バグ修正は 1.x.x の部分を更新する。
 *
 * 帳票ごとの Ver（どの帳票がどの Ver で追加されたか）は screenCatalog.ts の LEDGER_GROUPS が正。
 * ここでは画面数や帳票名は持たず、画面側で SCREENS + groupOf() から集計する。
 */

export type DevVersionStatus =
  /** このリポジトリ（デザイン先行のプロトタイプ）で今作っている */
  | "designing"
  /** デザインは終わり、実装チームが開発・検証している */
  | "developing"
  /** 本番にリリース済み */
  | "released"
  /** まだ着手していない（リリース計画にだけ載っている） */
  | "planned";

export type DevVersionChange = {
  /** YYYY-MM-DD。日付が分からない過去分は省略可 */
  date?: string;
  title: string;
  detail?: string;
};

export type DevVersionLink = { label: string; url: string };

export type DevVersion = {
  /** "Ver.4.0" のように、screenCatalog.ts の LEDGER_GROUPS と同じ表記にする */
  version: string;
  status: DevVersionStatus;
  /** 開発期間。分かっている方だけ入れればよい */
  period?: { start?: string; end?: string };
  /** 本番（バックエンド）に反映した日 */
  releasedAt?: string;
  /** その Ver のねらいを 1〜2 行で */
  summary: string;
  /** 帳票追加以外の変更・出来事。新しいものを上に */
  changes: DevVersionChange[];
  /** 元にした Confluence ページなど */
  links?: DevVersionLink[];
};

export const DEV_VERSION_STATUS_LABEL: Record<DevVersionStatus, string> = {
  designing: "デザイン中",
  developing: "開発中",
  released: "リリース済み",
  planned: "予定",
};

/** Ver ごとのチップ色。1.0 / 1.5 / 2.0 / 3.0 / 4.0 は ScreenListPanel / ScreenFlowPage と同じ配色 */
export const DEV_VERSION_CHIP_CLASS: Record<string, string> = {
  "Ver.1.0": "bg-[#fdefe0] text-[#d97316]",
  "Ver.1.5": "bg-[#f1ebfd] text-[#7c4dcc]",
  "Ver.1.6": "bg-[#e6f6f5] text-[#1f9e8f]",
  "Ver.2.0": "bg-[#e7f1fe] text-[#2f7fd4]",
  "Ver.2.1": "bg-[#e8f0f7] text-[#4a6d99]",
  "Ver.3.0": "bg-[#fdeaea] text-[var(--semantic-brand-danger)]",
  "Ver.4.0": "bg-[#e6f4ec] text-[var(--semantic-brand-primary)]",
  "Ver.5.0": "bg-[#f0f0f0] text-[#6b6b6b]",
};
export const DEV_VERSION_DOT_CLASS: Record<string, string> = {
  "Ver.1.0": "bg-[#d97316]",
  "Ver.1.5": "bg-[#7c4dcc]",
  "Ver.1.6": "bg-[#1f9e8f]",
  "Ver.2.0": "bg-[#2f7fd4]",
  "Ver.2.1": "bg-[#4a6d99]",
  "Ver.3.0": "bg-[var(--semantic-brand-danger)]",
  "Ver.4.0": "bg-[var(--semantic-brand-primary)]",
  "Ver.5.0": "bg-[#6b6b6b]",
};

const WIKI = "https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages";

/** 新しい Ver が上 */
export const DEV_VERSIONS: DevVersion[] = [
  {
    version: "Ver.5.0",
    status: "planned",
    period: { start: "2026-08" },
    summary: "加熱記録・冷却記録、一括表示・箱詰め管理表を追加する予定。リリース目標は 2027 年 2 月末。",
    changes: [
      { date: "2026-09-03", title: "オリエンテーション（加熱記録・冷却記録）" },
      { date: "2026-08-31", title: "オリエンテーション（一括表示・箱詰め管理表）" },
    ],
    links: [{ label: "スケジュール（リリース計画）", url: `${WIKI}/128974984` }],
  },
  {
    version: "Ver.4.0",
    status: "designing",
    period: { start: "2026-02" },
    summary:
      "機械器具点検・清掃記録・添加物管理・薬品管理の 4 帳票を追加。あわせて確認待ちフローや記録画面のタイムスタンプなど、帳票をまたぐ共通の振る舞いを整えている。リリース目標は 2026 年 11 月末。",
    changes: [
      {
        date: "2026-09-15",
        title: "ガイドに「開発Ver管理」を追加",
        detail: "Ver ごとの記録をここに残していく。Ver.3.0 以前は Confluence から起こした。",
      },
      {
        date: "2026-09-14",
        title: "フィードバック機能を追加",
        detail: "各画面からその場で意見を送れるウィジェットと、管理画面側の受信箱。",
      },
      {
        date: "2026-09-14",
        title: "画面説明キャンバスにコメント・ドラッグ編集・Before/After 比較を追加",
        detail: "操作パネルを左レールに集約。",
      },
      {
        date: "2026-09-09",
        title: "承認・確認・データ検索・アプリを横断的に更新",
        detail: "使用水点検にタイムスタンプ表示を追加。確認待ちの完了ポップアップを共通化。",
      },
      {
        date: "2026-09-03",
        title: "画面編集追跡システムを導入",
        detail: "どの画面のどの部分が変わったかを可視化し、ピクセル差分も撮れるようにした。",
      },
      {
        date: "2026-08-31",
        title: "金属/X線探知機記録の新規登録画面をデザインに合わせて修正",
      },
      {
        date: "2026-08-28",
        title: "デザイン先行プロトタイプ（このリポジトリ）を作成",
        detail: "Basic 認証を追加。以降、Ver.4.0 の画面デザインをここで作っていく。",
      },
      {
        date: "2026-08-07",
        title: "機械器具点検の異常時の選択肢を「修理（外部委託）」に",
        detail: "開発定例MTG。秤の表示単位は各工場に確認中。",
      },
      {
        date: "2026-06-26",
        title: "機械器具点検の仕様を決定",
        detail:
          "繰り返し機能は実装しない（都度または先々の点検予定を登録）。点検見送りも確認→承認フローに回す。確認項目はラインごとに追加できる仕様にする。保管場所管理は帳票をまたいで使えるよう独立ページにする。",
      },
      {
        date: "2026-02",
        title: "オリエンテーション",
        detail: "リリース計画上の目安。",
      },
    ],
    links: [
      { label: "スケジュール（リリース計画）", url: `${WIKI}/128974984` },
      { label: "2026-6-26 開発定例MTG", url: `${WIKI}/326205444` },
      { label: "2026-8-7 開発定例MTG", url: `${WIKI}/349667427` },
    ],
  },
  {
    version: "Ver.3.0",
    status: "developing",
    period: { start: "2026-04" },
    summary:
      "金属探知機・X線探知機記録（探知機・ウェイトチェッカーの機器管理を含む）と検体管理を追加。あわせて確認者が管理画面にログインできるようにする（企業管理・承認作業は不可）。",
    changes: [
      {
        date: "2026-08-07",
        title: "確認者の管理画面ログインを Ver.3.0 と同時リリースに",
        detail: "確認者は企業管理と承認作業はできない。",
      },
      {
        date: "2026-04",
        title: "開発着手",
        detail: "リリース計画上は 2026 年 4 月末〜。",
      },
      {
        date: "2026-03",
        title: "ワイヤー作成・見積・全体説明",
        detail:
          "3/9 週にワイヤー作成、3/16 週に見積作成、3/17〜19 に品質管理部へ全体の画面説明。3 月末に発注を受ける想定。",
      },
      {
        date: "2026-01-13",
        title: "オリエンテーション",
      },
    ],
    links: [
      { label: "スケジュール（リリース計画）", url: `${WIKI}/128974984` },
      { label: "2026-8-7 開発定例MTG", url: `${WIKI}/349667427` },
    ],
  },
  {
    version: "Ver.2.1",
    status: "released",
    period: { start: "2026-03", end: "2026-09-15" },
    releasedAt: "2026-09-15",
    summary: "帳票追加なし。独自テンキーの実装とリファクタリングをまとめてリリースした。",
    changes: [
      {
        date: "2026-09-15",
        title: "本番リリース",
        detail: "独自テンキーとリファクタリングをまとめて本番へ反映。",
      },
      {
        date: "2026-09-02",
        title: "リリース記録 ver 2.1 を作成",
        detail: "feature/v2.1 を master にマージする手順。リリース日時は未記入。",
      },
      {
        date: "2026-07-15",
        title: "独自テンキーとリファクタリングを同時リリースに",
        detail: "iOS 標準テンキーは今後表示されない。リファクタリングに伴い既存テストも通し直す。",
      },
      {
        date: "2026-07-13",
        title: "情シスの受け入れ試験開始（予定）",
      },
    ],
    links: [
      { label: "リリース記録 ver 2.1", url: `${WIKI}/363921450` },
      { label: "検証フロー ver 2.1", url: `${WIKI}/302415892` },
      { label: "2026-7-15 開発定例MTG", url: `${WIKI}/339509400` },
    ],
  },
  {
    version: "Ver.2.0",
    status: "released",
    period: { start: "2025-12", end: "2026-06-23" },
    releasedAt: "2026-06-23",
    summary: "秤点検記録と官能検査記録の 2 帳票を追加。管理画面を 6/23 に先行リリースし、アプリは審査通過後にリリース。",
    changes: [
      {
        date: "2026-07-01",
        title: "Ver.2.0 振り返り",
        detail: "課題から優先度の高いものを抽出し、担当者・期限つきの改善アクションに落とす。",
      },
      {
        date: "2026-07-01",
        title: "ver 2.0.1 負荷対応・秤量の定義変更",
        detail: "秤量の g 対応（管理画面・DB・API）とサーバー負荷対策。負荷テストも実施。",
      },
      {
        date: "2026-06-23",
        title: "ver 2.0.0 管理画面をリリース",
        detail: "検証完了 6/19。アプリは審査申請中で、通過次第リリース。",
      },
      {
        date: "2026-06-22",
        title: "本番反映と stg 反映、情シスの受け入れ開始",
        detail: "19:00 本番反映、20:00 MDM 対応。",
      },
      {
        date: "2026-05",
        title: "検証フロー ver 2.0",
        detail: "5/7〜8、5/11、5/15、5/18〜22、6/5 の各回で検証。",
      },
      {
        date: "2025-12-23",
        title: "リリース時期を 4 月から 5 月に変更",
        detail: "契約の変更にともない、以降の開発スケジュールを別途調整。",
      },
    ],
    links: [
      { label: "リリース記録 ver 2.0.0", url: `${WIKI}/324665385` },
      { label: "リリース記録 ver 2.0.1", url: `${WIKI}/331546627` },
      { label: "【ver2.0.1】負荷対応・秤量の定義変更", url: `${WIKI}/328007682` },
      { label: "検証フロー ver 2.0", url: `${WIKI}/145490011` },
      { label: "Ver.2.0 振り返り", url: `${WIKI}/331055107` },
      { label: "【帳票】秤点検記録", url: `${WIKI}/144703606` },
      { label: "【帳票】官能検査", url: `${WIKI}/151224321` },
    ],
  },
  {
    version: "Ver.1.6",
    status: "released",
    period: { start: "2025-11", end: "2025-12-15" },
    releasedAt: "2025-12-15",
    summary: "帳票追加なし。承認／差し戻し機能と CSV/PDF 出力を実装。承認申請管理の表示項目を揃える UI 変更も含む。",
    changes: [
      {
        date: "2026-02-02",
        title: "承認／差し戻しの現場（アプリ）リリース",
        detail: "2026-1-20 開発定例MTG 時点の予定日。",
      },
      {
        date: "2025-12-22",
        title: "ver 1.6.2 バグ修正",
        detail: "ガラスプラスチックの修理ステータス「その他」のテキストが管理画面に表示されない不具合を修正。",
      },
      {
        date: "2025-12-15",
        title: "ver 1.6.1 緊急リリース",
        detail: "同日 19:30 に fix/water_store を反映。",
      },
      {
        date: "2025-12-15",
        title: "ver 1.6 リリース",
        detail: "検証完了 12/12。13:00〜15:00 に本番反映、サーバー停止なし。",
      },
      {
        date: "2025-11-21",
        title: "stg アップ、内部テスト開始（11/25〜）",
        detail: "西原商会の受け入れは 12/4、リリース判定は 12/13。",
      },
    ],
    links: [
      { label: "リリース記録 ver 1.6", url: `${WIKI}/193527809` },
      { label: "リリース記録 ver 1.6.1 (緊急)", url: `${WIKI}/193527863` },
      { label: "リリース記録 ver 1.6.2", url: `${WIKI}/199557121` },
      { label: "承認・差し戻し申請管理 / 表示項目を揃えるUI変更【ver 1.6】", url: `${WIKI}/160563259` },
    ],
  },
  {
    version: "Ver.1.5",
    status: "released",
    period: { start: "2025-10", end: "2025-11-09" },
    releasedAt: "2025-11-09",
    summary: "ガラス・プラスチック管理帳票を追加（承認／差し戻しはまだなし）。修理ステータスの変更にも対応。図面上にアイコンを置いて点検する UI。",
    changes: [
      {
        date: "2025-12-01",
        title: "西通りプリンで受け入れ",
        detail: "11/26 に説明会、12/1 7:00 に受け入れ。",
      },
      {
        date: "2025-11-22",
        title: "オーナーレビュー",
      },
      {
        date: "2025-11-17",
        title: "App Store 本番申請",
        detail: "テスト申請は 11/7。",
      },
      {
        date: "2025-11-16",
        title: "ver 1.5.1 リリース",
        detail: "「包丁/カット類」→「包丁/カッター類」の文言変更。帳票取得 API が登録した帳票だけ返すように。",
      },
      {
        date: "2025-11-09",
        title: "ver 1.5 リリース",
        detail:
          "サーバーを 3 台構成にしたことで、ビルド後の CSS ファイル名の不一致と npm パッケージ未導入、WAF による画像アップロードのブロックが発生。11/14 までに解消（工場への告知前だったため実質影響なし）。",
      },
      {
        date: "2025-10-21",
        title: "stg アップ、内部テスト開始",
        detail: "西原商会の受け入れは 10/31。",
      },
    ],
    links: [
      { label: "リリース記録 ver 1.5", url: `${WIKI}/148668478` },
      { label: "リリース記録 ver 1.5.1", url: `${WIKI}/166428724` },
      { label: "【帳票】ガラスプラスチック管理", url: `${WIKI}/131367197` },
    ],
  },
  {
    version: "Ver.1.0",
    status: "released",
    period: { start: "2025-05", end: "2025-09-22" },
    releasedAt: "2025-09-22",
    summary:
      "最初の帳票として使用水の点検を作成（承認／差し戻しはなし）。iPad アプリ（実施者・確認者）と管理画面（承認者・管理者）の基本構成を確立し、紙の日報・点検をデジタル化する第一歩。",
    changes: [
      {
        date: "2025-10-03",
        title: "Ver.1.0 振り返り",
        detail: "リリース後の状況把握と「自分たちの作ったもの」という意識を課題として挙げた。",
      },
      {
        date: "2025-10-01",
        title: "リリース（予定日）",
      },
      {
        date: "2025-09-22",
        title: "本番サーバー反映",
      },
      {
        date: "2025-09-05",
        title: "stg アップ、内部テスト・西原商会受け入れ開始",
      },
      {
        date: "2025-05-12",
        title: "開発定例MTG でスケジュール確認",
        detail: "開発は 8 月末まで、リリースは 9 月末。",
      },
    ],
    links: [
      { label: "概要（プロジェクト全体）", url: `${WIKI}/129040407` },
      { label: "スケジュール（リリース計画）", url: `${WIKI}/128974984` },
      { label: "Ver.1.0 振り返り", url: `${WIKI}/133791975` },
    ],
  },
];

/** このリポジトリで今作っている Ver（デザイン中のもの。無ければ先頭） */
export const CURRENT_DEV_VERSION = DEV_VERSIONS.find((v) => v.status === "designing") ?? DEV_VERSIONS[0];
