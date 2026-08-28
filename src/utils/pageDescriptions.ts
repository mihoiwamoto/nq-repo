export const pageDescriptions: Record<string, string> = {
  "/": "食品工場管理システムのホームページです。管理画面またはアプリ画面を選択してください。",
  "/admin/login": "管理画面にログインするための画面です。社員番号とパスワードを入力してください。",
  "/admin/logout": "ログアウトが完了しました。",
  "/app/login": "アプリ画面にログインするための画面です。社員番号とパスワードを入力してください。",

  "/admin": "管理画面のホームです。各機能へのアクセスリンクが表示されます。",
  "/admin/home": "管理画面のホームです。各機能へのアクセスリンクが表示されます。",
  "/admin/ledger-management": "帳簿管理画面です。記録の一覧表示と詳細確認ができます。",
  "/admin/approval-management": "承認管理画面です。ユーザーからの承認申請を確認・処理します。",
  "/admin/approvals": "承認管理画面です。ユーザーからの承認申請を確認・処理します。",
  "/admin/data-search": "データ検索画面です。過去の記録を検索・フィルタリングできます。",
  "/admin/company": "企業情報管理画面です。",
  "/admin/factory": "工場情報管理画面です。",
  "/admin/staff": "スタッフ管理画面です。",
  "/admin/logs": "ログ管理画面です。",

  // Equipment inspection
  "/admin/equipment-inspection": "装置検査管理の機能選択画面です。",
  "/admin/equipment-inspection/factory": "工場を選択して、装置検査の詳細画面に移動します。",
  "/admin/equipment-inspection/line": "ラインを選択して、装置検査の詳細情報を確認できます。",

  // Cleaning record
  "/admin/cleaning-record": "清掃記録管理の機能選択画面です。",

  // App pages
  "/app": "アプリのホームです。実施すべきタスクが表示されます。",
  "/app/ledger-list": "帳簿の一覧が表示されます。",
  "/app/progress": "進行中の作業状況を確認できます。",
  "/app/pending-review": "レビュー待ちの項目を確認・対応できます。",
  "/app/help": "アプリの使用方法やFAQが表示されます。",
  "/app/settings": "アプリの設定画面です。",

  // Default fallback
  "default": "このページについて説明しています。",
};

export function getPageDescription(pathname: string): string {
  // 完全一致をまず確認
  if (pageDescriptions[pathname]) {
    return pageDescriptions[pathname];
  }

  // パスのプレフィックスで検索（動的パラメータ対応）
  const pathSegments = pathname.split("/").slice(0, 3).join("/"); // /admin/xxx までの部分
  if (pageDescriptions[pathSegments]) {
    return pageDescriptions[pathSegments];
  }

  return pageDescriptions["default"];
}
