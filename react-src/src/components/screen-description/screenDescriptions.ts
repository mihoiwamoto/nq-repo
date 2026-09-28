/**
 * NQ リポの全画面の「この画面は何をする画面か」の説明。
 *
 * キーは画面ファイルのパス（screen-map.json の filePath と同じ）。
 * URL ではなくファイルパスをキーにしているのは、
 *   - 同じコンポーネントが複数のルートを持つ（新規/編集 など）
 *   - :factoryId のようなパラメータの解決に左右されない
 * ため。画面の特定は screenCatalog の findScreenByPathname() に任せる。
 *
 * 承認申請・確認・データ検索の画面は帳票ごとにほぼ同じ作りなので、
 * 文面のぶれを防ぐために builder 関数で組み立てている（表示される列名などは帳票ごとに指定）。
 *
 * 新しい *Page.tsx を追加したら、ここにも 1 件足すこと。
 * 足し忘れは「画面説明」ページ（/admin/guide/descriptions）の「説明なし」の件数で分かる。
 */

export type ScreenDescription = {
  /** 1〜2 文の概要。誰が・何のために使う画面か */
  summary: string;
  /** この画面でできること（箇条書き） */
  points: string[];
  /** 補足。運用上の注意や、この画面の次に進む先など */
  note?: string;
  /**
   * 画面の上にポップアップが出ているときの差し替え説明（省略可）。
   * 「帳票一覧を開いた直後に実施者選択のポップアップが出る」のように、
   * URL は同じでも実際に見えているものが別画面のときに使う。
   * 画面上コーチマークはポップアップが出ている間、この説明とポップアップの中だけを案内する。
   */
  states?: ScreenStateDescription[];
  /**
   * 画面上コーチマークの位置を手で指定したいときに書く（省略可）。
   * 書かなくても coachMarks.ts が DOM から自動で「メニュー・タイトル・検索・一覧・ボタン・入力欄…」を見つける。
   * 自動で拾えない要素や、説明を特に添えたい要素があるときだけ足す。
   */
  marks?: CoachMarkSpec[];
};

/**
 * ポップアップが出ている間の説明。
 * 画面に `whenHeading` の見出しが出ていれば、その間はこちらの説明に差し替わる。
 */
export type ScreenStateDescription = {
  /** ポップアップの見出し（部分一致）。例: "実施者を選んでください" */
  whenHeading: string;
  /** 画面名に添える短い名前。例: "実施者の選択" */
  label: string;
  summary: string;
  points: string[];
  note?: string;
  marks?: CoachMarkSpec[];
};

/** コーチマーク 1 つの手書き指定 */
export type CoachMarkSpec = {
  /** 対象の要素。CSS セレクタか、"text:登録" のようにボタン等の表示文字 */
  target: string;
  /** 吹き出しの見出し */
  title: string;
  /** 吹き出しの本文 */
  body: string;
};

/* ───────────────────────── builder（帳票ごとに繰り返す画面） ───────────────────────── */

/**
 * アプリの帳票を始めるときに最初に出る「実施者を選んでください」のポップアップ。
 * 帳票一覧・進捗一覧・確認待ちで同じ見た目のものが出る。
 */
const actorPickerState = (next: string): ScreenStateDescription => ({
  whenHeading: "実施者を選んでください",
  label: "実施者の選択",
  summary: `記録する人（実施者）を選ぶポップアップです。誰が点検したかを記録に残すため、${next}に進む前にここで選びます。`,
  points: ["職員の一覧から自分（実施者）を押して選ぶ", "「次へ」で先に進む", "「閉じる」で選ばずに戻る"],
});


/** 帳票管理 / データ検索 / 確認管理 の入口にある工場選択 */
const factorySelect = (menu: string, ledger: string, next: string): ScreenDescription => ({
  summary: `${menu}の「${ledger}」で、対象の工場を選ぶ画面です。工場を選ぶと${next}に進みます。`,
  points: ["工場名で検索して絞り込む", `工場を押して${next}へ進む`],
});

/** データ検索の一覧 */
const searchList = (ledger: string, columns: string, extra: string[] = []): ScreenDescription => ({
  summary: `${ledger}の過去の記録を、月ごとの一覧で振り返る画面です（データ検索）。閲覧専用で、内容の変更はできません。`,
  points: ["年と月のタブで対象の月を切り替える", `一覧には${columns}が並ぶ`, "操作列のボタンで、その記録の詳細を開く", ...extra],
});

/** データ検索の詳細 */
const searchDetail = (ledger: string, fields: string, extra: string[] = []): ScreenDescription => ({
  summary: `${ledger}の記録 1 件の内容を確認する画面です（データ検索）。閲覧専用です。`,
  points: [`実施日・実施者・確認者と、${fields}を表示`, ...extra, "コメント欄で、確認・承認時のやり取りを読める"],
});

/** 承認申請管理の一覧 */
const approvalList = (ledger: string, columns: string, extra: string[] = []): ScreenDescription => ({
  summary: `${ledger}の帳票のうち、確認者の確認が済んで承認を待っているものの一覧です。承認者が使います。`,
  points: [
    "ステータス（承認待ち・承認済み・差し戻し）で今の状態を把握する",
    `一覧には${columns}が並ぶ`,
    "操作列のボタンで詳細を開き、承認または差し戻しを行う",
    ...extra,
  ],
  note: "承認済みになった帳票はデータ検索から参照できます。",
});

/** 承認申請管理の詳細 */
const approvalDetail = (ledger: string, fields: string, extra: string[] = []): ScreenDescription => ({
  summary: `${ledger}の帳票 1 件の内容を見て、承認するか差し戻すかを決める画面です。承認者が使います。`,
  points: [
    `実施日・実施者・確認者と、${fields}を確認する`,
    ...extra,
    "「承認」で承認済みにする",
    "「差し戻し」で実施者に戻す。理由はコメントとして残る",
  ],
});

/** 確認管理の一覧 */
const confirmationList = (ledger: string, columns: string, extra: string[] = []): ScreenDescription => ({
  summary: `${ledger}の帳票のうち、アプリから提出されて確認者の確認を待っているものの一覧です。確認者が使います。`,
  points: [
    "年と月のタブで対象の月を切り替える",
    "ステータス（点検済み・承認待ち）で、確認前か確認後かを見分ける",
    `一覧には${columns}が並ぶ`,
    "操作列のボタンで詳細を開いて内容を確認する",
    ...extra,
  ],
  note: "確認が済むと「承認待ち」になり、承認申請管理に回ります。",
});

/** 確認管理の詳細 */
const confirmationDetail = (ledger: string, fields: string, extra: string[] = []): ScreenDescription => ({
  summary: `${ledger}の帳票 1 件の内容を確認者がチェックする画面です。問題なければ確認済みにして承認へ回します。`,
  points: [
    `実施日・実施者と、${fields}を確認する`,
    ...extra,
    "気になる点はコメントとして残せる",
    "確認を終えると承認待ちになり、承認者に引き継がれる",
  ],
});

/** 「○○が完了しました」だけの完了画面 */
const complete = (what: string, back: string): ScreenDescription => ({
  summary: `${what}が完了したことを知らせる画面です。`,
  points: [`ボタンで${back}に戻る`],
});

/** アプリの「提出内容の確認」画面 */
const appConfirm = (ledger: string, fields: string, extra: string[] = []): ScreenDescription => ({
  summary: `${ledger}で入力した内容を、提出する前に見直す画面です。`,
  points: [`実施日・実施者と、${fields}を一覧で確認する`, ...extra, "間違いがあれば戻って修正する", "「提出」で確認者に送る"],
  note: "提出した帳票は「進捗」で状態を追え、確認者側では確認管理に表示されます。",
});

/** アプリの「提出完了」画面 */
const appComplete = (ledger: string, back = "一覧"): ScreenDescription => ({
  summary: `${ledger}の提出が完了したことを知らせる画面です。`,
  points: [`ボタンで${back}に戻る`],
  note: "提出後の状態は「進捗」から確認できます。",
});

/** アプリの帳票入口（持ち場/場所/製品を選ぶ一覧） */
const appEntry = (ledger: string, target: string, extra: string[] = []): ScreenDescription => ({
  summary: `アプリの「${ledger}」の入口です。記録する${target}を選びます。`,
  points: [`管理画面で「アプリ表示中」に設定された${target}だけが並ぶ`, "点検済みのものには「点検済み」の印が付く", ...extra, "「帳票一覧に戻る」で帳票一覧へ"],
});

/** 帳票管理の「○○管理」系の登録・編集フォーム */
const adminForm = (what: string, required: string, optional?: string): ScreenDescription => ({
  summary: `${what}を新しく登録する、または既存のものを編集する画面です。新規と編集で同じフォームを使います。`,
  points: [`必須: ${required}`, ...(optional ? [`任意: ${optional}`] : []), "「登録」または「保存」で確定する。必須が空だとエラーが出る"],
});

/* ───────────────────────── 本体 ───────────────────────── */

export const SCREEN_DESCRIPTIONS: Record<string, ScreenDescription> = {
  /* ===== 共通 ===== */
  "src/pages/ComingSoonPage.tsx": {
    summary: "まだ作られていない機能の代わりに出る「準備中」の画面です。",
    points: ["サイドメニューにあるが実装されていない項目を開くと表示される"],
  },

  /* ===== 管理画面: ログイン・アカウント ===== */
  "src/admin/features/login/AdminLoginPage.tsx": {
    summary: "管理画面にログインする画面です。職員ごとの社員番号とパスワードで入ります。",
    points: ["社員番号とパスワードを入力して「ログイン」", "パスワードは目のアイコンで表示・非表示を切り替えられる", "一致しないときはエラー文が出る"],
    note: "ログイン後は権限（管理者・承認者・確認者）に応じてサイドメニューの項目が変わります。",
  },
  "src/admin/features/login/LogoutCompletePage.tsx": {
    summary: "管理画面からログアウトしたことを知らせる画面です。",
    points: ["ログイン画面に戻るリンクがある"],
  },
  "src/admin/features/account/AccountPage.tsx": {
    summary: "ログイン中の自分のアカウント情報を見る画面です。ヘッダー右上の名前から開きます。",
    points: [
      "名前・社員番号・企業・工場・権限・メールアドレスを表示",
      "パスワード変更・メールアドレス変更へ進む",
      "プロトタイプ用に権限（管理者・承認者・確認者・兼任）を切り替えて、メニューや操作の違いを試せる",
    ],
  },
  "src/admin/features/account/PasswordChangePage.tsx": {
    summary: "自分のパスワードを変更する画面です。",
    points: ["新しいパスワードを 2 回入力する", "8 文字以上で英数字と記号を含める必要がある", "一致しない・条件を満たさないときはエラー文が出る"],
  },
  "src/admin/features/account/PasswordChangeCompletePage.tsx": complete("パスワードの変更", "アカウント情報"),
  "src/admin/features/account/EmailChangePage.tsx": {
    summary: "自分のメールアドレスを変更する画面です。",
    points: ["新しいメールアドレスを 2 回入力する", "一致しないときはエラー文が出る"],
  },
  "src/admin/features/account/EmailChangeCompletePage.tsx": complete("メールアドレスの変更", "アカウント情報"),

  /* ===== 管理画面: ホーム・メニュー入口 ===== */
  "src/admin/pages/AdminHomePage.tsx": {
    summary: "管理画面のホームです。主な機能への入口が、それぞれの説明付きでカードとして並びます。",
    points: [
      "データ検索・承認申請管理・確認管理・帳票管理の各カードから作業に入る",
      "企業・工場・職員・ログ・ログイン端末の管理へも進める",
      "権限によって表示されるカードが変わる",
    ],
  },
  "src/admin/pages/LedgerManagementPage.tsx": {
    summary: "帳票管理の入口です。帳票（使用水の点検、清掃記録など）を選んで、その帳票のテンプレート設定へ進みます。",
    points: ["帳票ごとのカードを押すと、その帳票の工場選択へ進む", "帳票の作成・点検項目の修正・アプリへの表示設定はここから行う"],
    note: "帳票管理は「何を点検するか」を決める場所で、記録そのものはアプリで付けます。",
  },
  "src/admin/pages/DataSearchPage.tsx": {
    summary: "データ検索の入口です。帳票を選んで、過去の記録を閲覧します。",
    points: ["帳票ごとのカードを押すと、その帳票の工場選択へ進む", "承認まで済んだ記録を、月ごとに振り返れる"],
  },
  "src/admin/pages/ApprovalManagementPage.tsx": {
    summary: "承認申請管理の入口です。確認者の確認が済んだ帳票を、承認者がまとめて承認・差し戻しします。",
    points: [
      "承認待ちの申請が帳票ごとに並び、件数バッジで未処理数が分かる",
      "申請を選んで一覧・詳細へ進み、承認または差し戻しを行う",
      "承認待ち・承認済み・差し戻しのタブで絞り込む",
    ],
  },
  "src/admin/pages/ConfirmationManagementPage.tsx": {
    summary: "確認管理の入口です。現場から提出された帳票を、確認者が帳票ごとにチェックしに行きます。",
    points: ["帳票ごとのカードに未確認の件数バッジが出る", "カードを押すと工場選択へ進む"],
  },
  "src/admin/pages/ConfirmationFactorySelectionPage.tsx": {
    summary: "確認管理で帳票を選んだあと、対象の工場を選ぶ画面です。どの帳票でも共通で使います。",
    points: ["工場名で検索して絞り込む", "工場を押すとその帳票のデータ一覧へ進む"],
  },
  "src/admin/pages/ConfirmationDataListPlaceholderPage.tsx": {
    summary: "確認管理のデータ一覧がまだ作られていない帳票で、代わりに出る仮の画面です。",
    points: ["パンくずで工場選択に戻れる"],
  },
  "src/admin/pages/AdminLedgerDetailPage.tsx": {
    summary: "帳票管理・データ検索で、まだ専用の画面が無い帳票を開いたときに出る仮の画面です。",
    points: ["帳票名だけを表示する", "戻るボタンで入口に戻る"],
  },

  /* ===== 管理画面: ガイド・ヘルプ ===== */
  "src/admin/features/guide/ScreenCanvasPage.tsx": {
    summary:
      "変更履歴キャンバスです。全画面をサムネイルで俯瞰し、Claude が加えた変更が「どの画面のどこか」を確認したり、画面上に直接コメントや修正指示を残したりできます。",
    points: [
      "左レールの画面一覧から画面を選び、実画面を PC 幅 / タブレット幅で表示する",
      "要素をクリックしてプロパティを見る・ドラッグで位置や文言を試しに変える",
      "コメント・フィードバックを画面の場所に紐づけて残す",
      "加えた編集を Claude への修正プロンプトとして書き出す",
    ],
  },
  "src/admin/features/guide/ScreenFlowPage.tsx": {
    summary: "画面遷移図です。全画面を帳票ごとに「一覧 → 詳細 → 編集」のような遷移ツリーとして俯瞰できます。",
    points: [
      "管理画面 / アプリで絞り込む、帳票のバージョンで絞り込む",
      "ノードは撮影済みのスクリーンショット。役割（一覧・詳細・編集…）の色分けで見分ける",
      "ノードを押すとその画面だけがポップアップで開き、そのまま触って動かせる（背景クリック・Esc で閉じる）。右上のボタンで実画面を別タブに開く",
    ],
    note: "矢印は URL の親子関係から自動で組んでいるので、ボタン単位の遷移をすべて追っているわけではありません。",
  },
  "src/admin/features/guide/ScreenDescriptionsPage.tsx": {
    summary: "画面説明の一覧です。左で帳票を選ぶと、その帳票の画面がスクリーンショット付きのカードで役割（帳票管理 / 承認申請 / 確認 / データ検索 / アプリ）ごとに並びます。",
    points: [
      "左の帳票一覧はバージョンごとにまとまっている。数字はその帳票の画面数",
      "画面名・説明・URL で検索すると、帳票をまたいで一致した画面だけが並ぶ。管理画面 / アプリでも絞り込める",
      "カードを押すと、その画面の説明ページに移って大きく読める",
      "説明がまだ無い画面はカード左上の「説明なし」で分かる",
    ],
    note: "各画面の右下にある青い「i」ボタンでは、今見ている画面の説明を右からのパネルで読めます。",
  },
  "src/admin/features/guide/ScreenDescriptionDetailPage.tsx": {
    summary: "画面 1 つの説明ページです。概要・できること・補足を大きく読み、撮影済みのスクリーンショットと並べて確かめられます。",
    points: [
      "「実画面を別タブで開く」「変更履歴キャンバスで見る」でその画面へ移る",
      "「前の画面」「次の画面」で同じ帳票の画面を順に読む",
      "下の一覧から同じ帳票のほかの画面へ移る",
    ],
    note: "スクリーンショットが無いときは capture-screens.cjs で撮ると表示されます。",
  },
  "src/admin/features/guide/DevVersionPage.tsx": {
    summary: "開発 Ver 管理です。デザイン先行で進めている開発を「Ver ごとに何を作ったか」で見返せます。",
    points: [
      "左の Ver 一覧（新しいものが上）から Ver を選ぶ",
      "その Ver の期間・ねらい・出来事と、追加された帳票・画面数を見る",
      "メモを書き残せる（この端末だけに保存され、他の人には共有されない）",
    ],
  },
  "src/admin/features/feedback/FeedbackManagementPage.tsx": {
    summary:
      "フィードバック管理です。各画面の右下のフィードバックボタンで集まった声を一覧で見返し、対応状況を進められます。",
    points: [
      "状態（未対応・調査中・対応中・確認待ち・完了・保留）のチップで絞り込む",
      "画面・キーワードを選んで「検索」で絞り込む（「リセット」で状態の絞り込みごと元に戻る）",
      "カードを押すと中身が開き、対応状況の変更・コメントの追記・削除ができる",
    ],
    note: "保存先はこのブラウザ（localStorage）です。端末や別のブラウザとは共有されません。変更履歴キャンバスの左レールからも同じ一覧を見られます。",
  },
  "src/admin/features/help/HelpPage.tsx": {
    summary: "管理画面のヘルプです。よくある質問をキーワードやカテゴリから探せます。",
    points: ["キーワードで検索する", "カテゴリのカードから絞り込む", "質問を押すと回答が開く"],
  },
  "src/admin/features/help/HelpFaqDetailPage.tsx": {
    summary: "ヘルプの質問 1 件の回答を表示する画面です。",
    points: ["質問と回答の全文を読む", "戻るでヘルプ一覧へ"],
  },

  /* ===== 管理画面: マスタ管理 ===== */
  "src/admin/features/company-management/CompanyListPage.tsx": {
    summary: "企業管理の一覧です。システムを使う企業（会社）を登録・編集・削除します。",
    points: ["企業名で検索する", "一覧に企業名・住所が並ぶ", "操作列から詳細へ、「新規登録」で追加"],
  },
  "src/admin/features/company-management/CompanyDetailPage.tsx": {
    summary: "企業 1 件の詳細です。企業名と住所を確認し、編集や削除に進みます。",
    points: ["「編集」でフォームへ", "「削除」で削除確認 → 削除完了へ"],
  },
  "src/admin/features/company-management/CompanyFormPage.tsx": adminForm("企業", "企業名", "企業住所"),
  "src/admin/features/company-management/CompanyCompletePage.tsx": complete("企業の登録または削除", "企業管理の一覧"),

  "src/admin/features/factory-management/FactoryListPage.tsx": {
    summary: "工場管理の一覧です。帳票の対象になる工場を登録・編集・削除します。",
    points: ["工場名で検索する", "一覧に工場名・住所・企業名が並ぶ", "操作列から詳細へ、「新規登録」で追加"],
    note: "帳票管理・確認管理・データ検索の「工場選択」に並ぶのは、ここで登録した工場です。",
  },
  "src/admin/features/factory-management/FactoryDetailPage.tsx": {
    summary: "工場 1 件の詳細です。所属企業や、アプリのログインに使う工場 ID・パスワードの登録状況、休業日を確認できます。",
    points: ["工場名・住所・企業名・工場 ID・パスワード（登録済み/未登録）・休業日を表示", "「編集」でフォームへ、「削除」で削除完了へ"],
  },
  "src/admin/features/factory-management/FactoryFormPage.tsx": {
    summary: "工場を新しく登録する、または編集する画面です。アプリのログイン情報もここで決めます。",
    points: ["必須: 工場名・企業・工場 ID", "任意: 工場住所・パスワード・休業日", "工場 ID とパスワードはアプリ（タブレット）のログインに使う"],
  },
  "src/admin/features/factory-management/FactoryCompletePage.tsx": complete("工場の登録または削除", "工場管理の一覧"),

  "src/admin/features/staff-management/StaffListPage.tsx": {
    summary: "職員管理の一覧です。点検を行う職員や、管理画面を使う職員を登録・編集・削除します。入社・退職時に使います。",
    points: ["名前で検索、工場・権限で絞り込む", "一覧に名前・社員番号・工場・企業・権限が並ぶ", "操作列から詳細へ、「新規登録」で追加"],
    note: "アプリの「実施者を選ぶ」に並ぶ名前は、ここで登録した職員です。",
  },
  "src/admin/features/staff-management/StaffDetailPage.tsx": {
    summary: "職員 1 人の詳細です。所属と権限、メールアドレス・パスワードの登録状況を確認します。",
    points: ["名前・社員番号・システム権限・企業・工場・権限・メールアドレス・パスワード（登録済み/未登録）を表示", "「編集」でフォームへ、「削除」で削除完了へ"],
  },
  "src/admin/features/staff-management/StaffFormPage.tsx": {
    summary: "職員を新しく登録する、または編集する画面です。",
    points: ["必須: 名前・社員番号・システム権限・企業・工場", "権限（確認者・承認者など）とメールアドレスを設定する", "名前はアプリ・管理画面にそのまま表示される"],
  },
  "src/admin/features/staff-management/StaffCompletePage.tsx": complete("職員の登録または削除", "職員管理の一覧"),

  "src/admin/features/storage-management/StorageListPage.tsx": {
    summary: "保管場所管理の一覧です。添加物・薬品・検体などを置く保管場所を工場ごとに登録します。",
    points: ["保管場所名で検索する", "「新規登録」で追加、行から詳細へ"],
    note: "添加物管理・薬品管理・検体管理の「保管場所」の選択肢になります。",
  },
  "src/admin/features/storage-management/StorageDetailPage.tsx": {
    summary: "保管場所 1 件の詳細です。名前と所属工場を確認し、編集に進みます。",
    points: ["「編集」でフォームへ"],
  },
  "src/admin/features/storage-management/StorageFormPage.tsx": adminForm("保管場所", "保管場所名・工場"),
  "src/admin/features/storage-management/StorageCompletePage.tsx": complete("保管場所の登録または削除", "保管場所管理の一覧"),

  "src/admin/features/product-management/ProductListPage.tsx": {
    summary: "製品管理の一覧です。基幹システムから取り込んだ製品と、NQ リポで独自に登録した製品を並べて見られます。",
    points: [
      "「基幹システム」「NQ リポ」のタブで出どころを切り替える",
      "キーワード・製品コード・工場で絞り込む",
      "一覧に製品名・内容量・単位・工場名・賞味期限が並ぶ。行から詳細へ",
      "NQ リポの製品は「新規登録」で追加できる",
    ],
    note: "官能検査・検体管理の対象製品はここにある製品から選びます。",
  },
  "src/admin/features/product-management/HostProductDetailPage.tsx": {
    summary: "基幹システムから取り込んだ製品 1 件の詳細です。閲覧専用で、編集はできません。",
    points: ["製品コード・製品名・内容量・単位・工場名・賞味期限を表示"],
  },
  "src/admin/features/product-management/NqProductDetailPage.tsx": {
    summary: "NQ リポで登録した製品 1 件の詳細です。編集・削除ができます。",
    points: ["製品名・内容量・単位・工場名・賞味期限を表示", "「編集」でフォームへ、「削除」で削除完了へ"],
  },
  "src/admin/features/product-management/NqProductFormPage.tsx": adminForm("NQ リポの製品", "製品名・工場名・賞味期限", "内容量・内容量単位"),
  "src/admin/features/product-management/NqProductCompletePage.tsx": complete("製品の登録または削除", "製品管理の一覧"),

  "src/admin/features/log-management/LogListPage.tsx": {
    summary: "ログ管理です。誰がいつどの画面で何をしたか（点検の登録・確認・承認など）の履歴を一覧で見られます。",
    points: ["種別・工場・帳票・キーワードで絞り込む", "一覧に記録日時・画面種別・工場名・職員名・権限・操作内容が並ぶ"],
  },
  "src/admin/features/device-management/DeviceListPage.tsx": {
    summary: "ログイン端末管理です。アプリにログインできるタブレット端末を工場ごとに管理・承認します。",
    points: ["工場・端末名で絞り込む", "新規端末からのログインを承認する", "使わなくなった端末を削除する"],
  },
  "src/admin/features/device-management/DeviceCompletePage.tsx": complete("端末の削除", "ログイン端末管理"),

  /* ===== 管理画面: 帳票管理 › 使用水の点検 (Ver.1.0) ===== */
  "src/admin/features/water-inspection/FactorySelectionPage.tsx": factorySelect("帳票管理", "使用水の点検", "点検場所の一覧"),
  "src/admin/features/water-inspection/PointSelectionPage.tsx": {
    summary: "使用水の点検の点検場所（給湯室、製造室の蛇口など）を工場ごとに一覧する画面です。アプリに出す場所を管理します。",
    points: ["「アプリ表示中」「アプリ非表示」のタブで、今アプリに出ている場所かどうかを見分ける", "場所を押して詳細へ、「新規登録」で追加"],
  },
  "src/admin/features/water-inspection/PointDetailPage.tsx": {
    summary: "点検場所 1 件の詳細です。アプリへの表示期間と、どの項目を記録するかを確認します。",
    points: ["点検場所名・アプリ表示期間を表示", "臭い・濁り・pH・残留塩素などの項目ごとに「記録する / 記録しない」を確認", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/water-inspection/PointFormPage.tsx": {
    summary: "点検場所を新しく登録する、または編集する画面です。",
    points: ["必須: 点検場所名", "任意: アプリ表示期間、記録する項目の選択", "「登録」または「保存」で確定"],
  },
  "src/admin/features/water-inspection/PointRegistrationCompletePage.tsx": complete("点検場所の登録", "点検場所の一覧"),

  /* ===== 管理画面: 帳票管理 › ガラスプラスチック管理 (Ver.1.5) ===== */
  "src/admin/features/glass-plastic/FactorySelectionPage.tsx": factorySelect("帳票管理", "ガラスプラスチック管理", "点検場所（フロア）の一覧"),
  "src/admin/features/glass-plastic/FloorSelectionPage.tsx": {
    summary: "ガラス・プラスチック管理の点検場所（フロア）を工場ごとに一覧する画面です。",
    points: ["「アプリ表示中」「アプリ非表示」のタブで切り替える", "フロアを押して詳細へ、「新規登録」で追加"],
  },
  "src/admin/features/glass-plastic/FloorDetailPage.tsx": {
    summary: "フロア 1 件の詳細です。配置図と、その上に置いた点検箇所（ガラス・プラスチック製品の位置）を確認します。",
    points: ["フロア名・アプリ表示期間・配置図を表示", "点検箇所ごとの修理状況を確認", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/glass-plastic/FloorRegistrationPage.tsx": {
    summary: "フロアを新しく登録する画面です。配置図の画像を登録し、その上に点検箇所を置きます。",
    points: ["必須: フロア名", "任意: アプリ表示期間", "配置図は PNG / JPEG、5MB まで", "配置レイアウトで点検箇所を配置する"],
  },
  "src/admin/features/glass-plastic/FloorEditPage.tsx": {
    summary: "登録済みのフロアを編集する画面です。フロア名・表示期間・配置図を変えられます。",
    points: ["フロア名・アプリ表示期間・配置図を変更", "「保存」で確定"],
  },
  "src/admin/features/glass-plastic/FloorRegistrationCompletePage.tsx": complete("フロアの登録", "点検場所の一覧"),
  "src/admin/features/glass-plastic/FloorDeleteCompletePage.tsx": complete("フロアの削除", "点検場所の一覧"),

  /* ===== 管理画面: 帳票管理 › 秤点検管理 (Ver.2.0) ===== */
  "src/admin/features/scale-inspection/FactorySelectionPage.tsx": factorySelect("帳票管理", "秤点検管理", "秤点検記録設定"),
  "src/admin/features/scale-inspection/SettingsPage.tsx": {
    summary: "秤点検記録設定です。アプリで点検する秤を、持ち場ごとに並べて管理します。秤・持ち場そのもののマスタは別画面です。",
    points: ["「アプリ表示中」「アプリ非表示」のタブで切り替える", "秤を押して詳細へ、「新規登録」で秤を持ち場に割り当てる", "「秤管理」「持ち場管理」へのリンクからマスタを整備する"],
  },
  "src/admin/features/scale-inspection/ScaleDetailPage.tsx": {
    summary: "点検対象として登録した秤 1 件の詳細です。持ち場とアプリ表示期間を確認します。",
    points: ["秤 No.・持ち場・アプリ表示期間を表示", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/scale-inspection/ScaleFormPage.tsx": {
    summary: "秤を点検対象として登録・編集する画面です。秤管理にある秤を選び、持ち場と運用期間を決めます。",
    points: ["必須: 秤 No.（ラベル名）・持ち場", "任意: 持ち場の運用期間", "「登録」または「保存」で確定"],
  },
  "src/admin/features/scale-inspection/ScaleCompletePage.tsx": complete("秤の登録", "秤点検記録設定"),
  "src/admin/features/scale-inspection/ScaleManagementListPage.tsx": {
    summary: "秤管理です。工場にある秤そのもの（ラベル名・シリアル・秤量）をマスタとして登録し、表示順を並べ替えます。",
    points: ["シリアルナンバー・秤量・持ち場で絞り込む", "一覧に秤 No.・シリアルナンバー・秤量・持ち場・修理状況が並ぶ", "「上へ」「下へ」で表示順を変える", "行から詳細へ、「新規登録」で追加"],
  },
  "src/admin/features/scale-inspection/ScaleManagementDetailPage.tsx": {
    summary: "秤マスタ 1 件の詳細です。点検で記録する項目（動作確認・水平点検・汚れ・表示値）の有無を確認します。",
    points: ["秤 No.・シリアルナンバー・秤量を表示", "項目ごとの「記録する / 記録しない」を確認", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/scale-inspection/ScaleManagementFormPage.tsx": {
    summary: "秤マスタを新しく登録する、または編集する画面です。",
    points: ["必須: 秤 No.（ラベル名）・シリアルナンバー・秤量", "動作確認・水平点検・汚れ・秤の表示値を記録するかを選ぶ", "「登録」または「保存」で確定"],
  },
  "src/admin/features/scale-inspection/ScaleManagementCompletePage.tsx": complete("秤の登録または削除", "秤管理の一覧"),
  "src/admin/features/scale-inspection/PostManagementListPage.tsx": {
    summary: "持ち場管理です。秤を置く持ち場（製造ラインなど）をマスタとして登録し、表示順を並べ替えます。",
    points: ["持ち場名で検索する", "「上へ」「下へ」で表示順を変える", "行から詳細へ、「新規登録」で追加"],
  },
  "src/admin/features/scale-inspection/PostDetailPage.tsx": {
    summary: "持ち場 1 件の詳細です。名前を確認し、編集・削除に進みます。",
    points: ["「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/scale-inspection/PostFormPage.tsx": adminForm("持ち場", "持ち場名"),
  "src/admin/features/scale-inspection/PostManagementCompletePage.tsx": complete("持ち場の登録または削除", "持ち場管理の一覧"),

  /* ===== 管理画面: 帳票管理 › 官能検査記録 (Ver.2.0) ===== */
  "src/admin/features/sensory-inspection/FactorySelectionPage.tsx": factorySelect("帳票管理", "官能検査記録", "検査製品の一覧"),
  "src/admin/features/sensory-inspection/ProductSelectionPage.tsx": {
    summary: "官能検査の対象製品を工場ごとに一覧する画面です。点検予定（カレンダー）への入口もここにあります。",
    points: ["製品を押して詳細へ、「新規登録」で追加", "「点検予定」で、いつどの製品を検査するかのカレンダーへ"],
  },
  "src/admin/features/sensory-inspection/ProductDetailPage.tsx": {
    summary: "検査製品 1 件の詳細です。アプリで記録対象にするかを確認します。",
    points: ["検査製品名と「記録する / 記録しない」を表示", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/sensory-inspection/NewRegistrationPage.tsx": {
    summary: "検査製品を登録・編集する画面です。製品管理にある製品（NQ リポ / 基幹システム）から選びます。",
    points: ["必須: 検査製品名", "「NQ リポ」「基幹システム」のタブで製品の出どころを切り替える", "「登録」または「保存」で確定"],
  },
  "src/admin/features/sensory-inspection/NewRegistrationCompletePage.tsx": complete("検査製品の登録", "検査製品の一覧"),
  "src/admin/features/sensory-inspection/ProductDeleteCompletePage.tsx": complete("検査製品の削除", "検査製品の一覧"),
  "src/admin/features/sensory-inspection/CalendarPage.tsx": {
    summary: "官能検査の点検予定カレンダーです。どの日にどの製品を検査するかを月表示で確認・編集します。",
    points: ["月を切り替えて予定を見る", "日付を押して予定の登録へ", "登録済みの予定は「編集」「削除」ができる"],
    note: "ここで登録した予定が、アプリの点検予定・帳票の入口に反映されます。",
  },
  "src/admin/features/sensory-inspection/ScheduleRegistrationPage.tsx": {
    summary: "官能検査の点検予定を 1 件登録・編集する画面です。",
    points: ["必須: 日付・検査対象製品", "「登録」または「保存」で確定、「削除」で予定を消す"],
    states: [
      {
        whenHeading: "製品追加",
        label: "製品追加",
        summary: "対象にする製品を選ぶポップアップです。製品マスタから探して追加します。",
        points: ["製品名を入力して「検索」で探す", "一覧から製品を押して選ぶ", "「追加」で対象に加える", "「閉じる」で追加せずに戻る"],
      },
    ],
  },
  "src/admin/features/sensory-inspection/ScheduleRegistrationCompletePage.tsx": complete("点検予定の登録", "点検予定カレンダー"),

  /* ===== 管理画面: 帳票管理 › 金属/X線探知機記録 (Ver.3.0) ===== */
  "src/admin/features/metal-xray-detection/FactorySelectionPage.tsx": factorySelect("帳票管理", "金属/X線探知機記録", "点検構成の一覧"),
  "src/admin/features/metal-xray-detection/MachineSelectionPage.tsx": {
    summary: "金属/X線探知機記録の「点検構成」（どの金属探知機・X線探知機・ウェイトチェッカーを 1 セットで点検するか）を工場ごとに一覧する画面です。",
    points: ["「アプリ表示中」「アプリ非表示」のタブで切り替える", "点検構成を押して詳細へ、「新規登録」で追加", "金属探知機管理・X線探知機管理・ウェイトチェッカー管理へのリンクから機器マスタを整備する"],
  },
  "src/admin/features/metal-xray-detection/MachineDetailPage.tsx": {
    summary: "点検構成 1 件の詳細です。組み合わせた機器と、それぞれを記録するかどうかを確認します。",
    points: ["点検構成名・アプリ表示期間を表示", "金属探知機 / X線探知機 / ウェイトチェッカーごとの機器名と「記録する / 記録しない」を確認", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/metal-xray-detection/NewRegistrationPage.tsx": {
    summary: "点検構成を新しく登録する、または編集する画面です。",
    points: ["必須: 点検構成名", "任意: アプリ表示期間", "記録する機器の種類ごとに機器名を選ぶ（記録するのに機器名が空だとエラー）"],
    states: [
      {
        whenHeading: "製品追加",
        label: "製品追加",
        summary: "対象にする製品を選ぶポップアップです。製品マスタから探して追加します。",
        points: ["製品名を入力して「検索」で探す", "一覧から製品を押して選ぶ", "「追加」で対象に加える", "「閉じる」で追加せずに戻る"],
      },
    ],
  },
  "src/admin/features/metal-xray-detection/NewRegistrationCompletePage.tsx": complete("点検構成の登録", "点検構成の一覧"),
  "src/admin/features/metal-xray-detection/MachineDeleteCompletePage.tsx": complete("点検構成の削除", "点検構成の一覧"),

  "src/admin/features/metal-detector-management/MetalDetectorListPage.tsx": {
    summary: "金属探知機管理です。工場にある金属探知機をマスタとして登録し、表示順を並べ替えます。",
    points: ["「上へ移動」「下へ移動」で表示順を変える", "行から詳細へ、「新規登録」で追加", "「動作確認項目の編集はこちら」で点検項目の設定へ"],
  },
  "src/admin/features/metal-detector-management/MetalDetectorDetailPage.tsx": {
    summary: "金属探知機 1 台の詳細です。製品ごとの設定番号とテストピース（Fe・Sus など）の組み合わせを確認します。",
    points: ["金属探知機名を表示", "製品名/規格ごとの設定番号・テストピース設定を一覧", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/metal-detector-management/NewRegistrationPage.tsx": {
    summary: "金属探知機を登録・編集する画面です。製品ごとの設定番号とテストピースも合わせて登録します。",
    points: ["必須: 金属探知機名", "任意: 製品名/規格ごとの設定番号・テストピース設定（行の追加・削除ができる）", "「登録」または「保存」で確定"],
  },
  "src/admin/features/metal-detector-management/ChecklistSettingsPage.tsx": {
    summary: "金属探知機の動作確認項目の設定です。アプリの点検で確認する項目（電源 ON、コンベア、設定、はね板など）と説明文を編集します。",
    points: ["項目名と説明を編集する", "項目の追加・削除ができる", "「保存」で確定"],
  },
  "src/admin/features/metal-detector-management/NewRegistrationCompletePage.tsx": complete("金属探知機の登録", "金属探知機管理"),
  "src/admin/features/metal-detector-management/MetalDetectorDeleteCompletePage.tsx": complete("金属探知機の削除", "金属探知機管理"),

  "src/admin/features/xray-detector-management/XrayDetectorListPage.tsx": {
    summary: "X線探知機管理です。工場にある X線探知機をマスタとして登録し、表示順を並べ替えます。",
    points: ["「上へ移動」「下へ移動」で表示順を変える", "行から詳細へ、「新規登録」で追加", "「動作確認項目の編集はこちら」で点検項目の設定へ"],
  },
  "src/admin/features/xray-detector-management/XrayDetectorDetailPage.tsx": {
    summary: "X線探知機 1 台の詳細です。設定番号と、テストピース（Sus 球・Sus 線・ガラス球・セラミック・ゴム球）の設定を確認します。",
    points: ["X線探知機名を表示", "設定番号ごとのテストピース設定を一覧", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/xray-detector-management/NewRegistrationPage.tsx": {
    summary: "X線探知機を登録・編集する画面です。設定番号ごとに使うテストピースを選びます。",
    points: ["必須: X線探知機名", "設定番号とテストピース（Sus 球・Sus 線・ガラス球・セラミック・ゴム球）を設定", "「登録」または「保存」で確定"],
  },
  "src/admin/features/xray-detector-management/ChecklistSettingsPage.tsx": {
    summary: "X線探知機の動作確認項目の設定です。アプリの点検で確認する項目（電源 ON、コンベア・センサー、はね板など）と説明文を編集します。",
    points: ["項目名と説明を編集する", "項目の追加・削除ができる", "「保存」で確定"],
  },
  "src/admin/features/xray-detector-management/NewRegistrationCompletePage.tsx": complete("X線探知機の登録", "X線探知機管理"),
  "src/admin/features/xray-detector-management/XrayDetectorDeleteCompletePage.tsx": complete("X線探知機の削除", "X線探知機管理"),

  "src/admin/features/weight-checker-management/WeightCheckerListPage.tsx": {
    summary: "ウェイトチェッカー管理です。工場にあるウェイトチェッカー（重量選別機）をマスタとして登録し、表示順を並べ替えます。",
    points: ["「上へ移動」「下へ移動」で表示順を変える", "行から詳細へ、「新規登録」で追加", "「動作確認項目の編集はこちら」で点検項目の設定へ"],
  },
  "src/admin/features/weight-checker-management/WeightCheckerDetailPage.tsx": {
    summary: "ウェイトチェッカー 1 台の詳細です。",
    points: ["ウェイトチェッカー名を表示", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/weight-checker-management/NewRegistrationPage.tsx": adminForm("ウェイトチェッカー", "ウェイトチェッカー名"),
  "src/admin/features/weight-checker-management/ChecklistSettingsPage.tsx": {
    summary: "ウェイトチェッカーの動作確認項目の設定です。アプリの点検で確認する項目（電源 ON、キャリブレーション、精度確認など）と説明文を編集します。",
    points: ["項目名と説明を編集する", "項目の追加・削除ができる", "「保存」で確定"],
  },
  "src/admin/features/weight-checker-management/NewRegistrationCompletePage.tsx": complete("ウェイトチェッカーの登録", "ウェイトチェッカー管理"),
  "src/admin/features/weight-checker-management/WeightCheckerDeleteCompletePage.tsx": complete("ウェイトチェッカーの削除", "ウェイトチェッカー管理"),

  /* ===== 管理画面: 帳票管理 › 検体管理 (Ver.3.0) ===== */
  "src/admin/features/sample-management/FactorySelectionPage.tsx": factorySelect("帳票管理", "検体管理", "検体対象製品の一覧"),
  "src/admin/features/sample-management/ProductSelectionPage.tsx": {
    summary: "検体管理の対象製品（検体を保管する製品）を工場ごとに一覧する画面です。点検予定（カレンダー）への入口もここにあります。",
    points: ["製品を押して詳細へ、「新規登録」で追加", "「点検予定」で、いつどの製品の検体を取るかのカレンダーへ"],
  },
  "src/admin/features/sample-management/ProductDetailPage.tsx": {
    summary: "検体対象製品 1 件の詳細です。",
    points: ["製品名を表示", "「削除」で対象から外す"],
  },
  "src/admin/features/sample-management/NewRegistrationPage.tsx": {
    summary: "検体対象製品を登録する画面です。製品管理にある製品（NQ リポ / 基幹システム）から選びます。",
    points: ["必須: 検体製品名", "「NQ リポ」「基幹システム」のタブで製品の出どころを切り替える", "「登録」で確定"],
  },
  "src/admin/features/sample-management/NewRegistrationCompletePage.tsx": complete("検体対象製品の登録", "検体対象製品の一覧"),
  "src/admin/features/sample-management/ProductDeleteCompletePage.tsx": complete("検体対象製品の削除", "検体対象製品の一覧"),
  "src/admin/features/sample-management/CalendarPage.tsx": {
    summary: "検体管理の点検予定カレンダーです。どの日にどの製品の検体を取るかを月表示で確認・編集します。",
    points: ["月を切り替えて予定を見る", "日付を押して予定の登録へ", "登録済みの予定は「編集」「削除」ができる"],
  },
  "src/admin/features/sample-management/ScheduleRegistrationPage.tsx": {
    summary: "検体管理の点検予定を 1 件登録・編集する画面です。",
    points: ["必須: 日付・検体対象製品", "「登録」または「保存」で確定、「削除」で予定を消す"],
    states: [
      {
        whenHeading: "製品追加",
        label: "製品追加",
        summary: "対象にする製品を選ぶポップアップです。製品マスタから探して追加します。",
        points: ["製品名を入力して「検索」で探す", "一覧から製品を押して選ぶ", "「追加」で対象に加える", "「閉じる」で追加せずに戻る"],
      },
    ],
  },
  "src/admin/features/sample-management/ScheduleRegistrationCompletePage.tsx": complete("点検予定の登録", "点検予定カレンダー"),

  /* ===== 管理画面: 帳票管理 › 機械器具点検 (Ver.4.0) ===== */
  "src/admin/features/equipment-inspection/FactorySelectionPage.tsx": factorySelect("帳票管理", "機械器具点検", "持ち場/ラインの一覧"),
  "src/admin/features/equipment-inspection/LineSelectionPage.tsx": {
    summary: "機械器具点検の持ち場/ライン（豆乳ラインなど）を工場ごとに一覧する画面です。点検の事前準備（確認項目の設定・点検予定）への入口もここにあります。",
    points: [
      "毎日・毎週・毎月・毎年の点検頻度タブで切り替える",
      "「アプリ表示中」「アプリ非表示」で今アプリに出ているかを見分ける",
      "ラインを押して詳細へ、「新規登録」で追加",
      "「確認項目の設定」「点検予定」へ進む",
    ],
  },
  "src/admin/features/equipment-inspection/LineDetailPage.tsx": {
    summary: "持ち場/ライン 1 件の詳細です。点検箇所と点検項目、点検頻度、アプリ表示期間を確認します。",
    points: ["持ち場/ライン名・点検頻度・アプリ表示期間を表示", "点検箇所ごとの点検項目を一覧", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/equipment-inspection/LineRegistrationPage.tsx": {
    summary: "持ち場/ラインを新しく登録する画面です。点検箇所（機械）とその点検項目をここで組みます。",
    points: ["必須: 持ち場/ライン名・点検箇所", "任意: アプリ表示期間・点検頻度", "点検箇所の追加・削除、箇所ごとの点検項目の追加ができる"],
  },
  "src/admin/features/equipment-inspection/LineRegistrationCompletePage.tsx": complete("持ち場/ラインの登録", "持ち場/ラインの一覧"),
  "src/admin/features/equipment-inspection/ChecklistSettingsPage.tsx": {
    summary: "機械器具点検の「確認項目の設定」です。アプリの点検で毎回確認する共通の確認内容を編集します。",
    points: ["確認内容の追加・編集・削除", "「保存」で確定"],
  },
  "src/admin/features/equipment-inspection/ChecklistDeleteCompletePage.tsx": complete("確認項目の削除", "確認項目の設定"),
  "src/admin/features/equipment-inspection/CalendarPage.tsx": {
    summary: "機械器具点検の点検予定カレンダーです。どの日にどの持ち場/ラインを点検するかを月表示で確認・編集します。",
    points: ["月を切り替えて予定を見る", "日付を押して予定の登録へ", "登録済みの予定は「編集」「削除」ができる"],
    note: "ここで登録した予定が、アプリの点検予定に反映されます。",
  },
  "src/admin/features/equipment-inspection/NewRegistrationPage.tsx": {
    summary: "機械器具点検の点検予定を 1 件登録・編集する画面です。",
    points: ["必須: 点検日・持ち場/ライン", "点検頻度（毎日・毎週・毎月・毎年）を選ぶ", "「登録」または「保存」で確定、「削除」で予定を消す"],
    states: [
      {
        whenHeading: "持ち場/ライン名",
        label: "持ち場/ライン名の選択",
        summary: "点検する持ち場/ラインを選ぶポップアップです。登録済みの持ち場/ラインから探して選びます。",
        points: ["持ち場/ライン名を入力して探す", "一覧から押して選ぶ", "「追加」で対象に加える", "「閉じる」で選ばずに戻る"],
      },
    ],
  },
  "src/admin/features/equipment-inspection/ScheduleRegistrationCompletePage.tsx": complete("点検予定の登録", "点検予定カレンダー"),

  /* ===== 管理画面: 帳票管理 › 清掃記録 (Ver.4.0) ===== */
  "src/admin/features/cleaning-record/FactorySelectionPage.tsx": factorySelect("帳票管理", "清掃記録", "持ち場/ラインの一覧"),
  "src/admin/features/cleaning-record/LineSelectionPage.tsx": {
    summary: "清掃記録の持ち場/ライン（ゆばラインなど）を工場ごとに一覧する画面です。点検予定への入口もここにあります。",
    points: ["毎日・毎週・毎月・毎年の清掃頻度タブで切り替える", "「アプリ表示中」「アプリ非表示」で今アプリに出ているかを見分ける", "ラインを押して詳細へ、「新規登録」で追加", "「点検予定」でカレンダーへ"],
  },
  "src/admin/features/cleaning-record/LineDetailPage.tsx": {
    summary: "持ち場/ライン 1 件の詳細です。清掃箇所と清掃項目、清掃頻度、アプリ表示期間を確認します。",
    points: ["持ち場/ライン名・点検頻度・アプリ表示期間を表示", "清掃箇所ごとの清掃項目を一覧", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/cleaning-record/LineRegistrationPage.tsx": {
    summary: "持ち場/ラインを新しく登録する画面です。清掃箇所（機械・場所）とその清掃項目をここで組みます。",
    points: ["必須: 持ち場/ライン名・清掃箇所", "任意: アプリ表示期間・清掃頻度", "清掃箇所の追加・削除、箇所ごとの清掃項目の追加ができる"],
  },
  "src/admin/features/cleaning-record/LineRegistrationCompletePage.tsx": complete("持ち場/ラインの登録", "持ち場/ラインの一覧"),
  "src/admin/features/cleaning-record/CalendarPage.tsx": {
    summary: "清掃記録の点検予定カレンダーです。どの日にどの持ち場/ラインを清掃するかを月表示で確認・編集します。",
    points: ["月を切り替えて予定を見る", "日付を押して予定の登録へ", "登録済みの予定は「編集」「削除」ができる"],
  },
  "src/admin/features/cleaning-record/NewRegistrationPage.tsx": {
    summary: "清掃記録の点検予定を 1 件登録・編集する画面です。",
    points: ["必須: 点検日・持ち場/ライン", "清掃頻度（毎日・毎週・毎月・毎年）を選ぶ", "「登録」または「保存」で確定、「削除」で予定を消す"],
    states: [
      {
        whenHeading: "持ち場/ライン名",
        label: "持ち場/ライン名の選択",
        summary: "点検する持ち場/ラインを選ぶポップアップです。登録済みの持ち場/ラインから探して選びます。",
        points: ["持ち場/ライン名を入力して探す", "一覧から押して選ぶ", "「追加」で対象に加える", "「閉じる」で選ばずに戻る"],
      },
    ],
  },
  "src/admin/features/cleaning-record/ScheduleRegistrationCompletePage.tsx": complete("点検予定の登録", "点検予定カレンダー"),

  /* ===== 管理画面: 帳票管理 › 添加物管理 (Ver.4.0) ===== */
  "src/admin/features/additive-management/FactorySelectionPage.tsx": factorySelect("帳票管理", "添加物管理", "添加物の一覧"),
  "src/admin/features/additive-management/AdditiveSelectionPage.tsx": {
    summary: "添加物管理で在庫を記録する添加物（ソルビン酸など）を工場ごとに一覧する画面です。",
    points: ["添加物を押して詳細へ、「新規登録」で追加"],
    note: "ここに登録した添加物が、アプリの入庫・出庫記録の対象になります。",
  },
  "src/admin/features/additive-management/AdditiveDetailPage.tsx": {
    summary: "添加物 1 件の詳細です。規格と保管場所を確認します。",
    points: ["添加物名・規格・保管場所を表示", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/additive-management/NewRegistrationPage.tsx": adminForm("添加物", "添加物名・規格（数量と単位）・保管場所"),
  "src/admin/features/additive-management/AdditiveRegistrationCompletePage.tsx": complete("添加物の登録", "添加物の一覧"),
  "src/admin/features/additive-management/AdditiveDeleteCompletePage.tsx": complete("添加物の削除", "添加物の一覧"),

  /* ===== 管理画面: 帳票管理 › 薬品管理 (Ver.4.0) ===== */
  "src/admin/features/chemical-management/FactorySelectionPage.tsx": factorySelect("帳票管理", "薬品管理", "薬品の一覧"),
  "src/admin/features/chemical-management/ChemicalSelectionPage.tsx": {
    summary: "薬品管理で在庫を記録する薬品（次亜塩素酸ナトリウムなど）を工場ごとに一覧する画面です。",
    points: ["薬品を押して詳細へ、「新規登録」で追加"],
    note: "ここに登録した薬品が、アプリの入庫・出庫記録の対象になります。",
  },
  "src/admin/features/chemical-management/ChemicalDetailPage.tsx": {
    summary: "薬品 1 件の詳細です。規格と保管場所を確認します。",
    points: ["薬品名・規格・保管場所を表示", "「編集」でフォームへ、「削除」で削除"],
  },
  "src/admin/features/chemical-management/NewRegistrationPage.tsx": adminForm("薬品", "薬品名・規格（数量と単位）・保管場所"),
  "src/admin/features/chemical-management/ChemicalRegistrationCompletePage.tsx": complete("薬品の登録", "薬品の一覧"),
  "src/admin/features/chemical-management/ChemicalDeleteCompletePage.tsx": complete("薬品の削除", "薬品の一覧"),

  /* ===== 管理画面: 承認申請管理 ===== */
  "src/admin/features/approvals-water-inspection/ApprovalRecordsListPage.tsx": approvalList(
    "使用水の点検",
    "日付・点検時間・点検場所・臭い・濁り・異物・pH 値・残留塩素濃度・UV 殺菌灯の状態・実施者・確認者"
  ),
  "src/admin/features/approvals-water-inspection/RecordDetailPage.tsx": approvalDetail("使用水の点検", "点検場所ごとの臭い・濁り・異物・pH・残留塩素・UV 殺菌灯の記録"),
  "src/admin/features/approvals-glass-plastic/RecordDetailPage.tsx": approvalDetail(
    "ガラス・プラスチック管理",
    "点検場所（フロア）の配置図と、点検箇所ごとの結果",
    ["配置図の上のピンから点検箇所を選ぶ、絞り込みで異常のみ表示"]
  ),
  "src/admin/features/approvals-scale-inspection/ApprovalRecordsListPage.tsx": approvalList(
    "秤点検記録",
    "日付・秤 No.・シリアルナンバー・持ち場・動作確認・水平点検・汚れ・秤の表示値・備考・実施者・確認者"
  ),
  "src/admin/features/approvals-scale-inspection/RecordDetailPage.tsx": approvalDetail("秤点検記録", "秤ごとの動作確認・水平点検・汚れ・表示値と、正常/異常の結果"),
  "src/admin/features/approvals-sensory-inspection/ApprovalRecordsListPage.tsx": approvalList("官能検査記録", "日付・検査製品名・検査結果・確認者"),
  "src/admin/features/approvals-sensory-inspection/RecordDetailPage.tsx": {
    summary: "官能検査記録 1 件の点数一覧です。検査に参加した実施者ごとの点数を見て、承認または差し戻しを決めます。",
    points: ["検査製品名・製造日・賞味期限を表示", "実施者ごとの点数（5 点満点）と評価基準を確認", "操作列から実施者ごとの詳細へ", "「承認」または「差し戻し」を行う"],
  },
  "src/admin/features/approvals-sensory-inspection/ScoreDetailPage.tsx": {
    summary: "官能検査記録で、実施者 1 人分の採点内容を見る画面です。",
    points: ["検査製品名・製造日・賞味期限・実施者・確認者・実施日を表示", "比較製品の有無と製造日、点検箇所ごとの点数を確認"],
  },
  "src/admin/features/approvals-metal-xray-detection/ApprovalRecordsListPage.tsx": approvalList("金属/X線探知機記録", "実施日・点検構成名・結果（正常/異常あり）・確認者"),
  "src/admin/features/approvals-metal-xray-detection/MachineDetailPage.tsx": {
    summary: "金属/X線探知機記録 1 日分の点検内容一覧です。動作確認・テストピース・製品通過などの記録を時系列で見て、承認または差し戻しを決めます。",
    points: ["実施日と点検構成を表示", "点検時間・実施区分・点検内容・通過製品・結果・備考・実施者を一覧", "操作列から点検内容 1 件の詳細へ", "「承認」または「差し戻し」を行う"],
  },
  "src/admin/features/approvals-metal-xray-detection/RecordDetailPage.tsx": {
    summary: "金属/X線探知機記録の点検内容 1 件の詳細です。機器ごとのテストピース検知結果や備考を確認します。",
    points: ["点検時間・実施者・点検内容を表示", "金属探知機・X線探知機それぞれのテストピース（Fe・Sus・Sus 球など）の検知確認結果を見る"],
  },
  "src/admin/features/approvals-sample-management/ApprovalRecordsListPage.tsx": approvalList(
    "検体管理",
    "実施日・製品名・ロット No.・賞味期限・製造日・検体種別・検体数量・単位・保管場所・状態・破棄日・実施者・確認者",
    ["「データ一覧.csv」で一覧を CSV に書き出す"]
  ),
  "src/admin/features/approvals-sample-management/RecordDetailPage.tsx": approvalDetail("検体管理", "製品名・ロット No.・賞味期限・製造日・検体種別・数量・単位・保管場所"),
  "src/admin/features/approvals-equipment-inspection/ApprovalRecordsListPage.tsx": approvalList("機械器具点検", "実施日・持ち場名/ライン名・点検結果・備考・実施者・確認者"),
  "src/admin/features/approvals-equipment-inspection/RecordDetailPage.tsx": approvalDetail("機械器具点検", "持ち場/ライン名・実施区分（始業/終業）と、点検箇所ごとの点検項目の正常/異常"),
  "src/admin/features/approvals-cleaning-record/ApprovalRecordsListPage.tsx": approvalList("清掃記録", "実施日・持ち場名/ライン名・清掃済み・備考・実施者・確認者"),
  "src/admin/features/approvals-cleaning-record/RecordDetailPage.tsx": approvalDetail("清掃記録", "持ち場/ライン名と、清掃箇所ごとの清掃済み/未清掃"),
  "src/admin/features/approvals-additive-management/ApprovalRecordsListPage.tsx": approvalList("添加物管理", "日付・添加物名・区分（入庫/出庫）・数量・現在庫数・保管場所・備考・実施者・確認者"),
  "src/admin/features/approvals-additive-management/RecordDetailPage.tsx": approvalDetail("添加物管理", "添加物名・保管場所・区分・元在庫数・数量・現在庫数・備考"),
  "src/admin/features/approvals-chemical-management/ApprovalRecordsListPage.tsx": approvalList("薬品管理", "日付・薬品名・区分（入庫/出庫）・数量・現在庫数・保管場所・備考・実施者・確認者"),
  "src/admin/features/approvals-chemical-management/RecordDetailPage.tsx": approvalDetail("薬品管理", "薬品名・保管場所・区分・元在庫数・数量・現在庫数・備考"),

  /* ===== 管理画面: 確認管理 ===== */
  "src/admin/features/confirmations-water-inspection/RecordsListPage.tsx": confirmationList("使用水の点検", "日付・点検時間・点検場所と各点検項目・実施者"),
  "src/admin/features/confirmations-water-inspection/RecordDetailPage.tsx": confirmationDetail("使用水の点検", "点検場所ごとの臭い・濁り・異物・pH・残留塩素・UV 殺菌灯の記録"),
  "src/admin/features/confirmations-glass-plastic/RecordsListPage.tsx": confirmationList("ガラス・プラスチック管理", "日付・点検場所（フロア）・結果"),
  "src/admin/features/confirmations-glass-plastic/RecordDetailPage.tsx": confirmationDetail(
    "ガラス・プラスチック管理",
    "フロアの配置図と点検箇所ごとの結果・修理状況",
    ["配置図の上のピンから点検箇所を選ぶ、絞り込みで異常のみ表示"]
  ),
  "src/admin/features/confirmations-scale-inspection/RecordsListPage.tsx": confirmationList("秤点検記録", "日付・秤 No.・シリアルナンバー・持ち場・各点検項目・実施者"),
  "src/admin/features/confirmations-scale-inspection/RecordDetailPage.tsx": confirmationDetail("秤点検記録", "秤ごとの動作確認・水平点検・汚れ・表示値と、正常/異常の結果"),
  "src/admin/features/confirmations-sensory-inspection/DataListPage.tsx": confirmationList("官能検査記録", "日付・検査製品名・検査結果・実施者"),
  "src/admin/features/confirmations-sensory-inspection/RecordDetailPage.tsx": {
    summary: "官能検査記録 1 件の点数一覧です。確認者が実施者ごとの点数を見て、確認済みにします。",
    points: ["検査製品名・製造日・賞味期限を表示", "実施者ごとの点数（5 点満点）と評価基準を確認", "操作列から実施者ごとの詳細へ", "確認を終えると承認待ちになる"],
  },
  "src/admin/features/confirmations-sensory-inspection/ScoreDetailPage.tsx": {
    summary: "官能検査記録で、実施者 1 人分の採点内容を見る画面です（確認管理）。",
    points: ["実施者・確認者・実施日を表示", "比較製品の有無と製造日、点検箇所ごとの点数を確認"],
  },
  "src/admin/features/confirmations-metal-xray-detection/RecordsListPage.tsx": confirmationList("金属/X線探知機記録", "実施日・点検構成名・結果・実施者"),
  "src/admin/features/confirmations-metal-xray-detection/RecordDetailPage.tsx": confirmationDetail(
    "金属/X線探知機記録",
    "金属探知機・X線探知機それぞれの動作確認・点検時間・点検内容・備考"
  ),
  "src/admin/features/confirmations-sample-management/RecordsListPage.tsx": confirmationList("検体管理", "実施日・製品名・ロット No.・検体種別・数量・保管場所・実施者"),
  "src/admin/features/confirmations-sample-management/RecordDetailPage.tsx": confirmationDetail("検体管理", "製品名・ロット No.・賞味期限・製造日・検体種別・数量・単位・保管場所"),
  "src/admin/features/confirmations-equipment-inspection/RecordsListPage.tsx": confirmationList("機械器具点検", "実施日・持ち場名/ライン名・点検結果・備考・実施者"),
  "src/admin/features/confirmations-equipment-inspection/RecordDetailPage.tsx": confirmationDetail("機械器具点検", "持ち場/ライン名・実施区分と、点検箇所ごとの点検項目の正常/異常"),
  "src/admin/features/confirmations-cleaning-record/RecordsListPage.tsx": confirmationList("清掃記録", "実施日・持ち場名/ライン名・清掃済み・備考・実施者"),
  "src/admin/features/confirmations-cleaning-record/RecordDetailPage.tsx": confirmationDetail("清掃記録", "持ち場/ライン名と、清掃箇所ごとの清掃済み/未清掃"),
  "src/admin/features/confirmations-additive-management/RecordsListPage.tsx": confirmationList("添加物管理", "日付・添加物名・区分（入庫/出庫）・数量・現在庫数・実施者"),
  "src/admin/features/confirmations-additive-management/RecordDetailPage.tsx": confirmationDetail("添加物管理", "添加物名・保管場所・区分・元在庫数・数量・現在庫数・備考"),
  "src/admin/features/confirmations-chemical-management/RecordsListPage.tsx": confirmationList("薬品管理", "日付・薬品名・区分（入庫/出庫）・数量・現在庫数・実施者"),
  "src/admin/features/confirmations-chemical-management/RecordDetailPage.tsx": confirmationDetail("薬品管理", "薬品名・保管場所・区分・元在庫数・数量・現在庫数・備考"),

  /* ===== 管理画面: データ検索 ===== */
  "src/admin/features/data-search-water-inspection/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "使用水の点検", "点検場所選択"),
  "src/admin/features/data-search-water-inspection/PointSelectionPage.tsx": {
    summary: "データ検索の使用水の点検で、点検場所（給湯室など）を選ぶ画面です。場所ごとに記録を見ます。",
    points: ["点検場所を押すとその場所のデータ一覧へ"],
  },
  "src/admin/features/data-search-water-inspection/DataListPage.tsx": searchList("使用水の点検", "日付・点検時間・点検場所・臭い・濁り・異物・pH 値・残留塩素濃度・UV 殺菌灯の状態・実施者"),
  "src/admin/features/data-search-water-inspection/RecordDetailPage.tsx": searchDetail("使用水の点検", "点検場所ごとの臭い・濁り・異物・pH・残留塩素・UV 殺菌灯の記録"),

  "src/admin/features/data-search-glass-plastic/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "ガラスプラスチック管理", "点検場所選択"),
  "src/admin/features/data-search-glass-plastic/FloorSelectionPage.tsx": {
    summary: "データ検索のガラス・プラスチック管理で、点検場所（フロア）を選ぶ画面です。",
    points: ["フロアを押すとそのフロアのデータ一覧へ"],
  },
  "src/admin/features/data-search-glass-plastic/DataListPage.tsx": searchList("ガラス・プラスチック管理", "日付・点検場所・総点検箇所数・正常/異常ありの数"),
  "src/admin/features/data-search-glass-plastic/RecordDetailPage.tsx": searchDetail(
    "ガラス・プラスチック管理",
    "フロアの配置図と点検箇所ごとの結果・修理状況",
    ["配置図の上のピンから点検箇所を選ぶ、絞り込みで異常のみ表示"]
  ),

  "src/admin/features/data-search-scale-inspection/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "秤点検管理", "データ一覧"),
  "src/admin/features/data-search-scale-inspection/DataListPage.tsx": searchList("秤点検記録", "日付・秤 No.・シリアルナンバー・持ち場・動作確認・水平点検・汚れ・秤の表示値・実施者・確認者"),
  "src/admin/features/data-search-scale-inspection/RecordDetailPage.tsx": searchDetail("秤点検記録", "持ち場・秤 No.・シリアルナンバーと、動作確認・水平点検・汚れ・表示値の結果・備考"),

  "src/admin/features/data-search-sensory-inspection/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "官能検査記録", "データ一覧"),
  "src/admin/features/data-search-sensory-inspection/DataListPage.tsx": searchList("官能検査記録", "日付・検査製品名・検査結果・確認者"),
  "src/admin/features/data-search-sensory-inspection/RecordDetailPage.tsx": {
    summary: "官能検査記録 1 件の点数一覧です（データ検索）。実施者ごとの点数と検査結果を振り返ります。閲覧専用です。",
    points: ["検査製品名・製造日・賞味期限を表示", "実施者ごとの点数（5 点満点）と評価基準・検査結果・コメントを確認", "操作列から実施者ごとの詳細へ"],
  },
  "src/admin/features/data-search-sensory-inspection/ScoreDetailPage.tsx": {
    summary: "官能検査記録で、実施者 1 人分の採点内容を見る画面です（データ検索）。",
    points: ["検査製品名・製造日・賞味期限・実施者・確認者・実施日を表示", "比較製品の有無と製造日、点検箇所ごとの点数を確認"],
  },

  "src/admin/features/data-search-metal-xray-detection/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "金属/X線探知機記録", "データ一覧"),
  "src/admin/features/data-search-metal-xray-detection/DataListPage.tsx": searchList("金属/X線探知機記録", "実施日・点検構成名・結果（正常/異常あり）"),
  "src/admin/features/data-search-metal-xray-detection/RecordInspectionListPage.tsx": {
    summary: "金属/X線探知機記録 1 日分の点検内容一覧です（データ検索）。機器ごとに、動作確認・テストピース・異常反応・製品通過の記録を時系列で見ます。",
    points: ["金属探知機・X線探知機・ウェイトチェッカーのタブで機器を切り替える", "点検内容の種類（動作確認・テストピース・異常反応・製品通過）ごとに詳細へ", "コメントを確認"],
  },
  "src/admin/features/data-search-metal-xray-detection/RecordDetailPage.tsx": {
    summary: "金属/X線探知機記録の「動作確認」1 件の詳細です。電源・操作パネル・コンベア・ローラー・設定・はね板などの項目ごとの正常/異常を見ます。",
    points: ["点検時間・実施者を表示", "動作確認項目ごとの結果と説明を確認"],
  },
  "src/admin/features/data-search-metal-xray-detection/TestPieceDetailPage.tsx": {
    summary: "金属/X線探知機記録の「テストピース」1 件の詳細です。Fe・Sus・Sus 球・ガラス球などのテストピースが正しく検知されたかを見ます。",
    points: ["点検時間・実施者を表示", "テストピースごとの検知確認結果を確認"],
  },
  "src/admin/features/data-search-metal-xray-detection/AbnormalReactionDetailPage.tsx": {
    summary: "金属/X線探知機記録の「異常反応」1 件の詳細です。どの製品で異常が出て、原因と対応をどうしたかを見ます。",
    points: ["点検時間・実施者・異常製品を表示", "通過数量・異常数量・原因（異物混入など）・対応（点検調整など）を確認"],
  },
  "src/admin/features/data-search-metal-xray-detection/PassedProductDetailPage.tsx": {
    summary: "金属/X線探知機記録の「製品通過」1 件の詳細です。どの製品を通したか、重量の上下限などの設定を見ます。",
    points: ["点検時間・実施者・実施区分（開始/終了）を表示", "通過製品/カテゴリと重量下限値・上限値などを確認"],
  },

  "src/admin/features/data-search-sample-management/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "検体管理", "データ一覧"),
  "src/admin/features/data-search-sample-management/DataListPage.tsx": searchList("検体管理", "実施日・製品名・ロット No.・賞味期限・製造日・検体種別・数量・保管場所・状態"),
  "src/admin/features/data-search-sample-management/RecordDetailPage.tsx": searchDetail("検体管理", "製品名・ロット No.・賞味期限・製造日・検体種別・数量・単位・保管場所・備考・検体状況（保管中/破棄済み）"),

  "src/admin/features/data-search-equipment/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "機械器具点検", "データ一覧"),
  "src/admin/features/data-search-equipment/DataListPage.tsx": searchList("機械器具点検", "実施日・持ち場名/ライン名・点検結果・備考・実施者・確認者"),
  "src/admin/features/data-search-equipment/RecordDetailPage.tsx": searchDetail("機械器具点検", "持ち場/ライン名・実施区分と、点検箇所ごとの点検項目の正常/異常", ["異常ありの項目は原因と対応も表示"]),
  "src/admin/features/data-search-equipment/RecordInspectionListPage.tsx": {
    summary: "機械器具点検の記録 1 件の点検内容一覧です（データ検索）。機器ごとの点検内容をタブで切り替えて見ます。",
    points: ["金属探知機・X線探知機・ウェイトチェッカーのタブで切り替える", "点検内容ごとに詳細へ", "コメントを確認"],
  },
  "src/admin/features/data-search-equipment/InspectionItemDetailPage.tsx": {
    summary: "機械器具点検の点検内容 1 件の詳細です（データ検索）。",
    points: ["点検時間・実施者・点検内容を表示", "異常があれば異常製品・通過数量・異常数量・原因・対応を確認"],
  },
  "src/admin/features/data-search-equipment/AbnormalReactionDetailPage.tsx": {
    summary: "機械器具点検の「異常反応」1 件の詳細です（データ検索）。異常が出た製品と原因・対応を見ます。",
    points: ["点検時間・実施者・異常製品を表示", "通過数量・異常数量・原因・対応を確認"],
  },

  "src/admin/features/data-search-cleaning-record/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "清掃記録", "データ一覧"),
  "src/admin/features/data-search-cleaning-record/DataListPage.tsx": searchList("清掃記録", "実施日・持ち場名/ライン名・清掃済み・備考・実施者・確認者"),
  "src/admin/features/data-search-cleaning-record/RecordDetailPage.tsx": searchDetail("清掃記録", "持ち場/ライン名と、清掃箇所ごとの清掃済み/未清掃・備考"),

  "src/admin/features/data-search-additive-management/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "添加物管理", "データ一覧"),
  "src/admin/features/data-search-additive-management/DataListPage.tsx": searchList("添加物管理", "日付・添加物名・区分（入庫/出庫）・数量・現在庫数"),
  "src/admin/features/data-search-additive-management/RecordDetailPage.tsx": searchDetail("添加物管理", "添加物名・保管場所・区分・元在庫数・数量・現在庫数・備考"),

  "src/admin/features/data-search-chemical-management/SearchFactorySelectionPage.tsx": factorySelect("データ検索", "薬品管理", "データ一覧"),
  "src/admin/features/data-search-chemical-management/DataListPage.tsx": searchList("薬品管理", "日付・薬品名・区分（入庫/出庫）・数量・現在庫数"),
  "src/admin/features/data-search-chemical-management/RecordDetailPage.tsx": searchDetail("薬品管理", "薬品名・保管場所・区分・元在庫数・数量・現在庫数・備考"),

  /* ===== アプリ: 共通 ===== */
  "src/app/features/login/AppLoginPage.tsx": {
    summary: "アプリ（タブレット）のログイン画面です。職員ではなく工場の ID とパスワードでログインします。",
    points: ["工場 ID とパスワードを入力して「ログイン」", "初めての端末は「新規端末」として管理画面のログイン端末管理で承認が必要"],
  },
  "src/app/pages/LedgerListPage.tsx": {
    summary: "アプリのホームにあたる帳票一覧です。今日記録する帳票（使用水の点検、清掃記録など）を選びます。",
    points: ["帳票のカードを押すと、その帳票の入口（場所・持ち場・製品の選択）へ", "帳票によっては先に「実施者」を選ぶポップアップが出る"],
    states: [actorPickerState("選んだ帳票の入口")],
  },
  "src/app/pages/AppLedgerDetailPage.tsx": {
    summary: "アプリで、まだ専用の画面が無い帳票を開いたときに出る仮の画面です。",
    points: ["帳票名と「準備中」を表示する"],
  },
  "src/app/features/progress/ProgressListPage.tsx": {
    summary: "進捗一覧です。今日の帳票がどこまで進んだか（未点検・点検済み・確認完了など）を一覧で追えます。",
    points: ["「すべて」「未点検」のタブで絞る", "帳票・実施者などの絞り込み条件で探す", "行を押すと、その帳票の記録・確認画面へ進む", "不要な下書きは削除できる"],
    states: [
      actorPickerState("その帳票の記録画面"),
      {
        whenHeading: "絞り込み条件",
        label: "絞り込み条件",
        summary: "一覧に出す帳票を選ぶポップアップです。見たい帳票だけに絞って進捗を追えます。",
        points: ["帳票のカードを押して選ぶ（複数選べる。もう一度押すと外れる）", "「絞り込み」で一覧に反映する", "「閉じる」で変えずに戻る"],
      },
    ],
  },
  "src/app/features/pending-review/PendingReviewListPage.tsx": {
    summary: "確認待ちの一覧です。実施者が提出した帳票のうち、現場の確認者がまだ確認していないものが並びます。",
    points: ["帳票・実施者などの絞り込み条件で探す", "行を押すと確認画面へ進み、内容を見て確認または差し戻しをする", "差し戻しは実施者に戻り、修正して再提出できる"],
    note: "確認が済んだ帳票は管理画面の承認申請管理へ回ります。",
    states: [
      {
        whenHeading: "絞り込み条件",
        label: "絞り込み条件",
        summary: "確認待ちの一覧に出す帳票を選ぶポップアップです。",
        points: ["帳票のカードを押して選ぶ（複数選べる。もう一度押すと外れる）", "「絞り込み」で一覧に反映する", "「閉じる」で変えずに戻る"],
      },
    ],
  },
  "src/app/features/pending-review/PendingReviewDetailPage.tsx": {
    summary: "確認待ちの帳票を開く前に、確認者（自分）を選ぶ画面です。",
    points: ["職員の一覧から確認者を選ぶ", "選ぶと、その帳票の確認画面へ進む"],
    states: [
      {
        whenHeading: "確認者を選んでください",
        label: "確認者の選択",
        summary: "この帳票を確認する人（確認者）を選ぶポップアップです。誰が確認したかを記録に残すために選びます。",
        points: ["職員の一覧から確認者を押して選ぶ", "「次へ」で帳票の確認画面へ進む", "「閉じる」で確認待ちの一覧へ戻る"],
      },
      {
        whenHeading: "実施者を選んでください",
        label: "実施者の選択",
        summary: "差し戻された記録を直す人（実施者）を選ぶポップアップです。確認ではなく修正に入るので、確認者ではなく実施者を選びます。",
        points: ["職員の一覧から実施者を押して選ぶ", "「次へ」で記録の修正へ進む", "「閉じる」で選ばずに戻る"],
      },
    ],
  },
  "src/app/features/equipment-inspection/SchedulePage.tsx": {
    summary: "アプリの点検予定カレンダーです。機械器具点検の点検管理と、官能検査の検査商品設定を日付ごとに確認・登録します。",
    points: ["前の月・次の月で切り替える。休業日は色分け", "日付を押すと、その日の機械器具点検 点検設定 / 官能検査 検査商品設定へ", "「新規登録」で予定を追加"],
    states: [
      {
        whenHeading: "新規登録",
        label: "新規登録",
        summary: "選んだ日にどの帳票の予定を登録するかを選ぶポップアップです。",
        points: ["帳票（機械器具点検 / 官能検査）を押して、その設定画面へ進む", "「閉じる」でカレンダーに戻る"],
        note: "すでに予定がある日や、帳票が未設定のときは、その旨のポップアップが出て登録できません。",
      },
    ],
  },
  "src/app/features/equipment-inspection/SchedulePointSettingPage.tsx": {
    summary: "点検予定カレンダーから開く、その日の機械器具点検の点検設定です。点検する持ち場/ラインを登録・編集・削除します。",
    points: ["持ち場/ライン名を入力または選んで「登録」", "登録済みなら「保存」「削除」ができる"],
  },
  "src/app/features/sensory-inspection/ScheduleRegisterPage.tsx": {
    summary: "点検予定カレンダーから開く、その日の官能検査の検査商品設定です。検査する商品と比較商品を登録します。",
    points: ["「商品追加」で商品名・比較商品の有無・比較商品の製造日を登録", "登録済みの商品は「編集」「削除」ができる"],
    states: [
      {
        whenHeading: "商品追加",
        label: "商品追加",
        summary: "その日に官能検査をする商品を選ぶポップアップです。",
        points: ["商品名を入力して探す", "商品を押して選ぶ", "「追加」で検査商品に加える", "「閉じる」で追加せずに戻る"],
      },
    ],
  },
  "src/app/features/help/HelpPage.tsx": {
    summary: "アプリのヘルプです。よくある質問をキーワードやカテゴリから探せます。",
    points: ["キーワードで検索する", "カテゴリのカードから絞り込む", "質問を押すと回答が開く"],
  },
  "src/app/features/settings/SettingsPage.tsx": {
    summary: "アプリの設定です。ログイン中の工場名とアプリのバージョンを確認し、ログアウトやライセンス情報へ進みます。",
    points: ["「ライセンス情報」でオープンソースライセンスの一覧へ", "「ログアウト」でログイン画面へ戻る"],
  },
  "src/app/features/settings/LicensePage.tsx": {
    summary: "アプリで使っているオープンソースソフトウェアのライセンス情報を表示する画面です。",
    points: ["ライセンスの一覧を読む"],
  },
  "src/app/features/settings/TextSizePage.tsx": {
    summary: "アプリの文字サイズを小・中・大から選ぶ画面です。",
    points: ["文字サイズを選ぶとアプリ全体に反映される"],
  },

  /* ===== アプリ: 使用水の点検 ===== */
  "src/app/features/water-inspection/PointSelectionPage.tsx": appEntry("使用水の点検", "点検場所"),
  "src/app/features/water-inspection/PointHistoryTablePage.tsx": {
    summary: "点検場所 1 つの記録の履歴表です。過去の点検結果を日付順に見ながら、新しい記録を付け始めます。",
    points: [
      "日付・点検時間・臭い・濁り・異物・pH 値・残留塩素濃度・UV 殺菌灯の状態・実施者名を表で見る",
      "並び順を切り替える",
      "操作列から記録の詳細（編集）へ",
      "「新規記録」で今日の点検を記録する",
    ],
  },
  "src/app/features/water-inspection/NewRecordPage.tsx": {
    summary: "使用水の点検を 1 回ぶん記録する画面です。臭い・濁り・異物・pH・残留塩素・UV 殺菌灯の状態を入力します。",
    points: [
      "項目ごとに正常 / 異常ありを選ぶ。異常ありのときは内容を記入",
      "pH 値・残留塩素濃度を入力。塩素を補充したらチェック",
      "UV 殺菌灯の稼働時間・表示灯・異常検出灯を記録。交換したらチェックすると時間がリセットされる",
      "「説明を表示」で各項目の見方を確認できる",
    ],
  },
  "src/app/features/water-inspection/NewRecordConfirmPage.tsx": appConfirm("使用水の点検", "点検場所・pH・残留塩素・塩素補充・UV 殺菌灯の記録"),
  "src/app/features/water-inspection/NewRecordSubmitCompletePage.tsx": appComplete("使用水の点検", "点検場所の一覧"),
  "src/app/features/water-inspection/PointDetailPage.tsx": {
    summary: "使用水の点検の記録 1 件の詳細です。履歴表から開き、内容を確認して編集に進めます。",
    points: ["点検場所・実施日・実施者と各項目の値を表示", "「編集」で記録の修正へ", "「一覧表示に戻る」で履歴表へ"],
  },
  "src/app/features/water-inspection/RecordEditPage.tsx": {
    summary: "提出済みの使用水の点検記録を修正する画面です。入力項目は新規記録と同じです。",
    points: ["各項目の値を書き換える", "「確認」で修正内容の確認画面へ"],
    note: "差し戻された記録の修正もここで行います。",
  },
  "src/app/features/water-inspection/RecordEditConfirmPage.tsx": appConfirm("使用水の点検（修正）", "修正後の点検場所・pH・残留塩素・UV 殺菌灯の記録"),
  "src/app/features/water-inspection/RecordEditCompletePage.tsx": {
    summary: "使用水の点検記録の修正を保存できたことを知らせる画面です。",
    points: ["ボタンで履歴表に戻る"],
  },

  /* ===== アプリ: ガラス・プラスチック管理 ===== */
  "src/app/features/glass-plastic/FloorSelectionPage.tsx": appEntry("ガラス・プラスチック管理", "点検場所（フロア）"),
  "src/app/features/glass-plastic/FloorInspectionPage.tsx": {
    summary: "フロアの配置図を見ながら、ガラス・プラスチック製品の点検箇所を 1 つずつ点検する画面です。",
    points: [
      "配置図のピンを押して点検箇所を選ぶ。拡大・縮小ができる",
      "「すべて」「異常あり」「正常」で箇所を絞り込む",
      "箇所ごとに正常 / 異常あり / その他を選ぶ。異常のときは内容・原因・対応を記入",
      "すべて点検したら「確認」へ",
    ],
  },
  "src/app/features/glass-plastic/FloorInspectionConfirmPage.tsx": appConfirm("ガラス・プラスチック管理", "点検場所・点検箇所ごとの結果（内容・原因・対応）", ["配置図で未確認の箇所が無いかを見直す"]),
  "src/app/features/glass-plastic/FloorInspectionCompletePage.tsx": appComplete("ガラス・プラスチック管理", "フロアの一覧"),

  /* ===== アプリ: 秤点検記録 ===== */
  "src/app/features/scale-inspection/PostSelectionPage.tsx": appEntry("秤点検記録", "持ち場"),
  "src/app/features/scale-inspection/ScaleListPage.tsx": {
    summary: "持ち場にある秤の一覧です。秤を 1 台ずつ選んで点検し、すべて終わったら確認へ進みます。",
    points: ["秤 No.・シリアルナンバーと、動作確認・水平点検・汚れ・表示値の入力状況を表で見る", "行の「操作」から秤ごとの点検画面へ", "全部そろったら「確認」へ"],
    states: [
      {
        whenHeading: "秤を選択してください",
        label: "秤の追加",
        summary: "この持ち場の点検に、別の持ち場の秤や予備の秤を足すときのポップアップです。",
        points: ["「別の持ち場の秤」「予備の秤」のタブで探す先を切り替える", "秤を押して選ぶ", "「追加」で一覧に加える", "「閉じる」で追加せずに戻る"],
      },
    ],
  },
  "src/app/features/scale-inspection/ScaleRecordPage.tsx": {
    summary: "秤 1 台の点検を記録する画面です。動作確認・水平点検・汚れ・分銅を載せたときの表示値を入力します。",
    points: [
      "項目ごとに正常 / 異常あり / その他を選ぶ。異常のときは原因と対応を記入",
      "秤の表示値（g）を入力。使う分銅の重さが表示される",
      "「ヘルプ」で点検のしかたを確認できる",
      "点検できない秤は「点検見送り」にして理由を記入",
    ],
  },
  "src/app/features/scale-inspection/ConfirmPage.tsx": appConfirm("秤点検記録", "持ち場と秤ごとの動作確認・水平点検・汚れ・表示値・備考"),
  "src/app/features/scale-inspection/SubmitCompletePage.tsx": appComplete("秤点検記録", "持ち場の一覧"),
  "src/app/features/scale-inspection/ScaleReviewPage.tsx": {
    summary: "提出済みの秤点検記録を、確認者が見直す画面です。持ち場の秤ごとの結果を表で確認します。",
    points: ["実施日・実施者・持ち場を表示", "秤ごとの正常/異常を表で確認、行から秤の詳細へ", "「編集」で修正に戻せる"],
  },
  "src/app/features/scale-inspection/ScaleDetailPage.tsx": {
    summary: "提出済みの秤点検記録のうち、秤 1 台分の詳細です。",
    points: ["動作確認・水平点検・汚れ・表示値・備考を表示", "点検見送りの場合は理由を表示"],
  },

  /* ===== アプリ: 官能検査記録 ===== */
  "src/app/features/sensory-inspection/ProductSelectionPage.tsx": appEntry("官能検査記録", "検査商品", ["商品名で検索できる"]),
  "src/app/features/sensory-inspection/RecordPage.tsx": {
    summary: "官能検査を記録する画面です。検査商品を味・香りなどの点検箇所ごとに 5 点満点で採点します。",
    points: ["検査商品名・賞味期限を確認", "比較商品あり / なしを選ぶ", "点検箇所ごとに 1〜5 点を付ける。評価基準が画面に出る", "低い点のときは理由を記入"],
    states: [
      {
        whenHeading: "点検箇所",
        label: "点検箇所の採点",
        summary: "点検箇所 1 つ（味・香りなど）に点数を付けるポップアップです。",
        points: ["1〜5 の数字を押して点数を付ける", "2 点以下のときは理由を記入する", "「登録」で記録に反映する", "「閉じる」で付けずに戻る"],
      },
    ],
  },
  "src/app/features/sensory-inspection/ConfirmPage.tsx": appConfirm("官能検査記録", "検査商品・製造日・比較商品と、点検箇所ごとの点数"),
  "src/app/features/sensory-inspection/SubmitCompletePage.tsx": appComplete("官能検査記録", "検査商品の一覧"),
  "src/app/features/sensory-inspection/ReviewPage.tsx": {
    summary: "提出済みの官能検査記録を、確認者が見直す画面です。",
    points: ["検査商品名・賞味期限・実施者・実施日・製造日・比較商品を表示", "点検箇所ごとの点数を確認", "「編集」で修正に戻せる"],
  },

  /* ===== アプリ: 金属/X線探知機記録 ===== */
  "src/app/features/metal-xray-detection/MachineSelectionPage.tsx": appEntry("金属/X線探知機記録", "点検構成（探知機のセット）"),
  "src/app/features/metal-xray-detection/MachineDetailPage.tsx": {
    summary: "点検構成 1 つの、今日の記録一覧です。1 日の中で動作確認・テストピース・製品通過・異常反応を何度も記録し、最後にまとめて提出します。",
    points: [
      "金属探知機・X線探知機・ウェイトチェッカーのタブで機器を切り替える",
      "実施区分・点検時間・点検内容・通過製品・結果・備考・実施者を表で見る",
      "「新規記録」で記録を追加、操作列から記録の詳細へ。不要な記録は削除",
      "1 日の記録がそろったら「確認」で提出へ",
    ],
  },
  "src/app/features/metal-xray-detection/MachineRecordFormPage.tsx": {
    summary: "金属/X線探知機の記録を 1 件入力する画面です。点検内容（動作確認・テストピース・製品通過・異常反応）によって入力項目が変わります。",
    points: [
      "実施区分（開始/終了）と点検内容を選ぶ",
      "動作確認: 項目ごとに正常 / 異常ありを選ぶ",
      "テストピース: 設定番号を選び、テストピースごとの検知結果を入れる",
      "製品通過: 通過製品と通過数量を入れる。異常反応: 異常製品・数量・原因・対応を入れる",
    ],
  },
  "src/app/features/metal-xray-detection/MachineRecordDetailPage.tsx": {
    summary: "金属/X線探知機の記録 1 件の詳細です。動作確認・テストピース・製品通過・異常反応の内容を確認します。",
    points: ["点検時間・実施者・実施区分・点検内容を表示", "テストピースの検知結果、異常反応の原因・対応などを確認"],
  },
  "src/app/features/metal-xray-detection/MachineConfirmPage.tsx": appConfirm("金属/X線探知機記録", "1 日分の記録（実施区分・点検時間・点検内容・通過製品・結果・備考）"),
  "src/app/features/metal-xray-detection/MachineSubmitCompletePage.tsx": appComplete("金属/X線探知機記録", "点検構成の一覧、または確認待ち"),
  "src/app/features/metal-xray-detection/MachineReviewPage.tsx": {
    summary: "提出済みの金属/X線探知機記録を、確認者が見直す画面です。1 日分の記録を表で確認します。",
    points: ["実施日と記録の一覧（実施区分・点検時間・点検内容・通過製品・結果・備考・実施者）を表示", "操作列から記録の詳細へ", "「編集」で修正に戻せる"],
  },

  /* ===== アプリ: 検体管理 ===== */
  "src/app/features/sample-management/SampleListPage.tsx": {
    summary: "検体管理の入口です。「本日の点検」で今日取る検体を記録し、「保管検体」で保管中の検体を管理・破棄します。",
    points: [
      "「本日の点検」「保管検体」のタブで切り替える",
      "製品名・ロット No.・期間で絞り込む",
      "本日の点検: 製品を押して検体の記録へ。点検済みには印が付く",
      "保管検体: 検体を押して詳細へ。複数選んで「検体一括破棄」もできる",
    ],
    states: [
      {
        whenHeading: "検体一括破棄",
        label: "検体一括破棄",
        summary: "選んだ保管検体をまとめて破棄するポップアップです。破棄日と理由は全件同じ内容で記録されます。",
        points: ["破棄する検体の一覧を確認する", "破棄日と破棄理由を入力する", "「破棄」で確定する", "「閉じる」で破棄せずに戻る"],
        note: "一括破棄では全件に同じ破棄日・理由が入ります。違う理由のものは 1 件ずつ破棄してください。",
      },
      {
        whenHeading: "廃棄が完了しました",
        label: "破棄の完了",
        summary: "検体の破棄が終わったことを知らせるポップアップです。",
        points: ["「閉じる」で保管検体の一覧に戻る"],
      },
      {
        whenHeading: "絞り込み条件",
        label: "絞り込み条件",
        summary: "一覧に出す検体を絞り込むポップアップです。",
        points: ["製品名・ロット No.・期間などの条件を指定する", "「絞り込み」で一覧に反映する", "「閉じる」で変えずに戻る"],
      },
    ],
  },
  "src/app/features/sample-management/SampleInspectionPage.tsx": {
    summary: "検体を 1 件記録する画面です。取った検体の種別・数量・保管場所などを入力します。",
    points: ["製造日・ロット No.・検体種別・検体数量・単位・保管場所を入力", "備考を記入", "「確認」で提出内容の確認へ"],
    note: "製造日・ロット No. の入力欄は、管理画面の設定によって出ないことがあります。",
  },
  "src/app/features/sample-management/SampleConfirmPage.tsx": appConfirm("検体管理", "製造日・検体種別・検体数量・単位・保管場所・備考"),
  "src/app/features/sample-management/SampleSubmitCompletePage.tsx": appComplete("検体管理", "検体管理の一覧"),
  "src/app/features/sample-management/StoredSampleDetailPage.tsx": {
    summary: "保管中の検体 1 件の詳細です。保管期限を過ぎたものなどを破棄します。",
    points: ["実施者・実施日・製造日・検体種別・数量・単位・保管場所・備考を表示", "「検体破棄」で理由を選んで破棄する"],
    states: [
      {
        whenHeading: "検体破棄",
        label: "検体破棄",
        summary: "この検体 1 件を破棄するポップアップです。破棄日と理由を残します。",
        points: ["製品名・賞味期限・ロット No. を確認する", "破棄日と破棄理由を入力する", "「破棄」で確定する", "「閉じる」で破棄せずに戻る"],
      },
      {
        whenHeading: "廃棄が完了しました",
        label: "破棄の完了",
        summary: "検体の破棄が終わったことを知らせるポップアップです。",
        points: ["「閉じる」で保管検体の一覧に戻る"],
      },
    ],
  },
  "src/app/features/specimen-management/SpecimenListPage.tsx": {
    summary: "検体管理の旧版の一覧画面です。保管中の検体（製品名・賞味期限）が並びます。",
    points: ["検体を押して確認画面へ"],
    note: "現在の検体管理は sample-management 側の画面が本流です。この画面は旧版として残っています。",
  },
  "src/app/features/specimen-management/SpecimenManagementConfirmPage.tsx": {
    summary: "検体管理の旧版の確認画面です。検体 1 件の内容を見直して提出します。",
    points: ["製品名・賞味期限・実施者・実施日・製造日・検体種別・数量・単位・保管場所・備考を確認"],
    note: "現在の検体管理は sample-management 側の画面が本流です。",
  },

  /* ===== アプリ: 機械器具点検 ===== */
  "src/app/features/equipment-inspection/LineSelectionPage.tsx": appEntry("機械器具点検", "持ち場/ライン", ["毎日・毎週・毎月・毎年の頻度タブで切り替える", "「翌日分」の URL では翌日の予定を先に記録できる"]),
  "src/app/features/equipment-inspection/LineInspectionPage.tsx": {
    summary: "持ち場/ラインの機械器具点検を記録する画面です。点検箇所（機械）ごとの点検項目を、始業または終業として点検します。",
    points: [
      "実施区分（始業 / 終業）を選ぶ",
      "共通の確認項目にチェックする",
      "点検項目ごとに異常なし / 異常ありを選ぶ。異常のときは原因と対応（修理・外部委託など）を記入",
      "点検できないときは「点検見送り」で理由を記入",
    ],
  },
  "src/app/features/equipment-inspection/ConfirmPage.tsx": appConfirm("機械器具点検", "実施区分と、点検箇所ごとの点検項目の結果・備考"),
  "src/app/features/equipment-inspection/SkipConfirmPage.tsx": {
    summary: "機械器具点検を今日は行わない（点検見送り）ときの確認画面です。理由を確認して提出します。",
    points: ["実施日・実施者・見送りの理由（備考）を確認", "「提出」で見送りとして記録する"],
  },
  "src/app/features/equipment-inspection/SubmitCompletePage.tsx": appComplete("機械器具点検", "持ち場/ラインの一覧"),

  /* ===== アプリ: 清掃記録 ===== */
  "src/app/features/cleaning-record/LineSelectionPage.tsx": appEntry("清掃記録", "持ち場/ライン", ["「翌日分」の URL では翌日の予定を先に記録できる"]),
  "src/app/features/cleaning-record/RecordingPage.tsx": {
    summary: "持ち場/ラインの清掃記録を付ける画面です。清掃箇所ごとの清掃項目に、済んだものからチェックしていきます。",
    points: ["清掃箇所ごとに清掃項目の「完了」をチェック", "備考を記入", "清掃できないときは「点検見送り」で理由を記入", "「確認」で提出内容の確認へ"],
  },
  "src/app/features/cleaning-record/ConfirmPage.tsx": appConfirm("清掃記録", "清掃箇所ごとの清掃項目の完了状況・備考"),
  "src/app/features/cleaning-record/SkipConfirmPage.tsx": {
    summary: "清掃を今日は行わない（点検見送り）ときの確認画面です。理由を確認して提出します。",
    points: ["実施日・実施者・見送りの理由（備考）を確認", "「提出」で見送りとして記録する"],
  },
  "src/app/features/cleaning-record/SubmitCompletePage.tsx": appComplete("清掃記録", "持ち場/ラインの一覧"),

  /* ===== アプリ: 添加物管理 ===== */
  "src/app/features/additive-management/ProductSelectionPage.tsx": {
    summary: "アプリの「添加物管理」の入口です。在庫を記録する添加物を選びます。",
    points: ["管理画面で登録した添加物が並ぶ", "添加物を押すとその記録一覧へ", "「帳票一覧に戻る」で帳票一覧へ"],
  },
  "src/app/features/additive-management/RecordsListPage.tsx": {
    summary: "添加物 1 つの入庫・出庫の記録一覧です。ここから新しい記録を追加し、まとめて提出します。",
    points: ["保管場所・区分（入庫/出庫）・数量・現在庫数・備考・実施者を表で見る", "「新規記録」で入庫・出庫を追加、操作列から記録の詳細へ", "「確認」で提出へ"],
  },
  "src/app/features/additive-management/RecordingPage.tsx": {
    summary: "添加物の入庫または出庫を 1 件記録する画面です。数量を入れると現在庫数が計算されます。",
    points: ["入庫 / 出庫を選ぶ", "保管場所を選び、数量を入力する。規格・元在庫数が表示される", "備考（発注理由など）を記入"],
  },
  "src/app/features/additive-management/RecordDetailPage.tsx": {
    summary: "添加物の入庫・出庫記録 1 件の詳細です。",
    points: ["実施日・保管場所・規格・元在庫数・区分・数量・現在庫数・備考を表示"],
  },
  "src/app/features/additive-management/ConfirmPage.tsx": appConfirm("添加物管理", "入庫・出庫の記録（保管場所・区分・数量・現在庫数・備考）"),
  "src/app/features/additive-management/SubmitCompletePage.tsx": appComplete("添加物管理", "添加物の一覧"),

  /* ===== アプリ: 薬品管理 ===== */
  "src/app/features/chemical-management/ChemicalSelectionPage.tsx": {
    summary: "アプリの「薬品管理」の入口です。在庫を記録する薬品を選びます。",
    points: ["管理画面で登録した薬品が並ぶ", "薬品を押すとその記録一覧へ", "「帳票一覧に戻る」で帳票一覧へ"],
  },
  "src/app/features/chemical-management/ChemicalRecordsListPage.tsx": {
    summary: "薬品 1 つの入庫・出庫の記録一覧です。ここから新しい記録を追加し、まとめて提出します。",
    points: ["保管場所・区分（入庫/出庫）・数量・現在庫数・備考・実施者を表で見る", "「新規記録」で入庫・出庫を追加、操作列から記録の詳細へ", "「確認」で提出へ"],
  },
  "src/app/features/chemical-management/ChemicalRecordingPage.tsx": {
    summary: "薬品の入庫または出庫を 1 件記録する画面です。数量を入れると現在庫数が計算されます。",
    points: ["入庫 / 出庫を選ぶ", "保管場所を選び、数量を入力する。規格・元在庫数が表示される", "備考（発注理由など）を記入"],
  },
  "src/app/features/chemical-management/ChemicalRecordDetailPage.tsx": {
    summary: "薬品の入庫・出庫記録 1 件の詳細です。",
    points: ["実施日・保管場所・規格・元在庫数・区分・数量・現在庫数・備考を表示"],
  },
  "src/app/features/chemical-management/ChemicalConfirmPage.tsx": appConfirm("薬品管理", "入庫・出庫の記録（保管場所・区分・数量・現在庫数・備考）"),
  "src/app/features/chemical-management/ChemicalSubmitCompletePage.tsx": appComplete("薬品管理", "薬品の一覧"),
};

/** ファイルパスから説明を引く。無ければ undefined */
export function describeScreenFile(filePath: string): ScreenDescription | undefined {
  return SCREEN_DESCRIPTIONS[filePath];
}
