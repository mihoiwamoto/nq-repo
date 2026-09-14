/**
 * 今日の日付を "YYYY-MM-DD" 形式で返す。
 * 未点検の帳票を開いたときの実施日の初期値として使う。
 */
export function todayString() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * "YYYY-MM-DD" を "MM/DD" 形式に変換する。
 * 毎週/毎月/毎年タブの日付見出し（点検予定で登録した日付）で使う。
 */
export function formatMonthDay(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${month}/${day}`;
}

/**
 * コメント投稿時刻を "YY.MM.DD HH:mm" 形式で返す。
 * 現場アプリのコメント欄（CommentInput）の表示に合わせた書式。
 */
export function commentTimestamp(d: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getFullYear() % 100)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 記録項目を入力した時刻を "YYYY/MM/DD HH:mm" 形式で返す。
 * 現場アプリの記録画面で、項目ごとに「誰がいつ入れたか」を添えるのに使う。
 */
export function recordTimestamp(d: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}
