/**
 * 動作デモ用の「今どの状態で見せているか」を持つ小さなストア。
 *
 * - どの画面（管理画面 / アプリ / ホーム）にいるかは URL から決まるので、ここには持たない。
 * - 「状態を試す」で選んだお試し状態だけを持つ。タブ単位で覚えておき、リロードしても残る。
 * - 各画面は `useDemoTrial()` / `useDemoList()` / `useDemoSendOutcome()` で読む。
 *   実際の繋ぎ込み先は demoTrial.md 相当のコメントを各所に置いてある:
 *     - データが無い … 記録の一覧を空にする（`useDemoList`）／点検状況をすべて未点検にする
 *                      （`useDemoUninspected` `useDemoInspectionState` `useDemoCount`）
 *     - オフライン … 提出しても送信されず、上に「未送信のデータがあります」の帯が出る
 *                    （`useDemoSendOutcome` + AnnouncementBar。ポップアップは出さない）
 *     - 送信エラー … 提出が失敗し、エラーのポップアップだけが出る（後ろの帯は出さない）
 *
 * 動作デモは実画面を iframe に読み込むので、外側（オーバーレイ）で切り替えた状態を
 * 中の画面にも伝える必要がある。sessionStorage の storage イベントに加えて、
 * 同じタブ内の親子ウィンドウへ postMessage でも流す（storage イベントは
 * ブラウザによって同一タブの iframe に届かないことがあるため）。
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

/** 「状態を試す」で選べるお試し状態 */
export type DemoTrial = "offline" | "empty" | "error" | "session";

export const TRIAL_ORDER: DemoTrial[] = ["offline", "empty", "error", "session"];

export const TRIAL_LABELS: Record<DemoTrial, string> = {
  offline: "オフライン",
  empty: "データが無い",
  error: "送信エラー",
  session: "セッション終了",
};

export const TRIAL_DESCRIPTIONS: Record<DemoTrial, string> = {
  offline: "送信できず未送信のまま残る",
  empty: "記録がまだ 1 件も無い",
  error: "送信に失敗した状態",
  session: "放置して自動ログアウトされた",
};

/**
 * 今その画面で何が起きているかの説明。
 *
 * 状態ごとに 1 つの説明文だと、見ている画面と食い違う（例: オフラインでログイン画面を
 * 見ているのに「提出しても送信されず…」と出る）。そこで画面の種類ごとに出し分ける。
 * 動作デモの左メニューと、右下のフローティングの案内の両方がこれを使う。
 */
type TrialArea = "login" | "complete" | "app" | "admin";

function areaOf(pathname: string): TrialArea {
  const path = pathname.split("?")[0];
  if (path === "/" || path.includes("/login")) return "login";
  if (path.startsWith("/app")) return path.includes("/complete") ? "complete" : "app";
  return "admin";
}

export type TrialGuide = { effect: string; steps: string[] };

const TRIAL_GUIDES: Record<DemoTrial, Record<TrialArea, TrialGuide>> = {
  offline: {
    login: {
      effect:
        "通信できないのでログインできない。「ログイン」を押すと、上に赤い「オフライン状態です。通信環境をご確認ください。」の帯が出る。",
      steps: [
        "工場IDとパスワードを入れて「ログイン」を押す",
        "上に赤い「オフライン状態です」の帯が出て、先に進めないことを確かめる",
        "オンラインに戻れば、同じ操作でログインできる",
      ],
    },
    complete: {
      effect:
        "完了画面はふだんどおり出る。ポップアップは出さず、上に赤い「未送信のデータがあります。送信ボタンを押してください。」の帯だけが出る。入力した内容は未送信のまま端末に残る。",
      steps: [
        "上に「未送信のデータがあります」の帯と送信ボタンが出ていることを確かめる",
        "オフラインのまま「送信」を押すと、「データの送信ができませんでした。」の帯に変わる",
        "進捗一覧を開くと、提出した記録に未送信のマークが付いている",
        "オフラインを解除して「送信」を押すと「データの送信が完了しました。」に変わる",
      ],
    },
    app: {
      effect:
        "入力も提出もふだんどおりできるが、送信はされない。提出すると上に赤い「未送信のデータがあります。送信ボタンを押してください。」の帯が出る（ポップアップは出ない）。",
      steps: [
        "帳票を開いて入力し、提出してみる",
        "上に「未送信のデータがあります」の帯と送信ボタンが出る",
        "進捗一覧では、その記録に未送信のマークが付く",
        "オフラインを解除して「送信」を押すと「データの送信が完了しました。」に変わる",
      ],
    },
    admin: {
      effect: "管理画面には効きません。オフラインはアプリ側（ログインと提出）でだけ起きます。",
      steps: ["「アプリ」に切り替えてから確かめる"],
    },
  },
  empty: {
    login: {
      effect:
        "ログイン画面には効きません。ログインしたあとの一覧が空になり、点検状況がすべて未点検になります。",
      steps: ["ログインして、進捗一覧や帳票の一覧を開く"],
    },
    complete: {
      effect:
        "完了画面には効きません。戻った先の一覧（進捗・確認待ち・記録一覧）が空になります。",
      steps: ["「帳票一覧に戻る」から一覧を開いて確かめる"],
    },
    app: {
      effect:
        "記録の一覧（進捗・確認待ち・各帳票の記録）が空になり、「まだありません」の文言が出る。点検する対象（ライン・秤・探知機…）の一覧は残るが、ステータスはすべて「未点検」・右上は「点検済み 0/件数」になり、開いた先の記録も空。",
      steps: [
        "進捗一覧・確認待ち・各帳票の記録一覧が空になる",
        "帳票を開くと、どの行も「未点検」で右上が「0/件数」になっている",
        "行を開いても記録が入っていないことを確かめる",
      ],
    },
    admin: {
      effect:
        "管理画面の記録一覧（確認・承認・データ検索）が空になり、「該当するデータがありません」の文言が出る。サイドメニューの承認待ち・確認待ちの件数バッジも消える。",
      steps: [
        "確認管理・承認申請管理・データ検索の一覧を開く",
        "「該当するデータがありません」の文言を確かめる",
        "サイドメニューの赤い件数バッジが消えていることを確かめる",
      ],
    },
  },
  error: {
    login: {
      effect: "ログイン画面には効きません。提出したときに送信が失敗します。",
      steps: ["ログインして、帳票を提出してみる"],
    },
    complete: {
      effect:
        "送信が失敗して「送信エラーが発生しました」のポップアップが出る。後ろに帯は出さず、ポップアップだけで知らせる。入力した内容は未送信のまま端末に残る。",
      steps: [
        "「送信エラーが発生しました」のポップアップが出る（後ろに帯は出ない）",
        "「閉じる」を押すと元の一覧に戻る",
        "ふだんは 帳票一覧 → ライン → 提出 の順でこの画面に来る",
      ],
    },
    app: {
      effect:
        "提出したときに送信が失敗し、「送信エラーが発生しました」のポップアップが出る。入力した内容は未送信のまま端末に残る。",
      steps: [
        "帳票を開いて入力し、提出してみる",
        "「送信エラーが発生しました」のポップアップが出る（後ろに帯は出ない）",
        "「閉じる」を押すと元の一覧に戻る",
      ],
    },
    admin: {
      effect: "管理画面には効きません。送信エラーはアプリ側の提出でだけ起きます。",
      steps: ["「アプリ」に切り替えてから確かめる"],
    },
  },
  session: {
    login: {
      effect:
        "ログイン画面には効きません。ログインしたあと、15 分さわらずに放置すると自動でログアウトされます。",
      steps: ["ログインしてから、もう一度この状態を選ぶ"],
    },
    complete: {
      effect:
        "画面の上に「セッションが終了しました」のポップアップが出て、操作できなくなる。「ログイン画面へ」でログインし直す。",
      steps: [
        "「セッションが終了しました」のポップアップが出る",
        "後ろの画面が操作できないことを確かめる",
        "「ログイン画面へ」を押すとログイン画面に戻る",
      ],
    },
    app: {
      effect:
        "15 分さわらずに放置したときと同じ状態。「セッションが終了しました」のポップアップが出て、後ろの画面は操作できない。",
      steps: [
        "「セッションが終了しました」のポップアップが出る",
        "後ろの画面が操作できないことを確かめる",
        "「ログイン画面へ」を押すとログイン画面に戻る",
      ],
    },
    admin: {
      effect: "管理画面には効きません。自動ログアウトの知らせはアプリ側でだけ出ます。",
      steps: ["「アプリ」に切り替えてから確かめる"],
    },
  },
};

/** 今見ている画面に合った説明と手順を返す */
export function trialGuideFor(trial: DemoTrial, pathname: string): TrialGuide {
  return TRIAL_GUIDES[trial][areaOf(pathname)];
}

/** 管理画面で出す状態。オフライン・送信エラー・セッション終了はアプリの提出/ログインでしか
    起きないので、管理画面の一覧には「データが無い」だけを出す */
const ADMIN_TRIALS: DemoTrial[] = ["empty"];

/**
 * その画面で選べる状態の並び。
 *
 * 管理画面を見ている間は「データが無い」だけ。前は管理画面だと「状態を試す」ごと
 * 消していたが、管理画面でも空の一覧は見せたいので、効く状態だけ残す形にした。
 */
export function trialsForPath(pathname: string): DemoTrial[] {
  return areaOf(pathname) === "admin" ? ADMIN_TRIALS : TRIAL_ORDER;
}

/**
 * その状態がそのまま出ている画面。
 *
 * 動作デモで状態を選んだ瞬間に、右の端末枠をここへ移す（選ぶだけでは何が変わるのか
 * 分からない、という指摘があったため）。オフライン / 送信エラーは提出したあとにしか
 * 出ないので、提出直後の完了画面を直接開いている。
 */
export const TRIAL_ENTRY_SCREENS: Record<
  DemoTrial,
  { path: string; label: string }
> = {
  offline: {
    path: "/app/ledger-list/equipment-inspection/lines/l1/complete",
    label: "機械器具点検の提出後（アプリ）",
  },
  empty: {
    path: "/app/progress",
    label: "進捗一覧（アプリ）",
  },
  error: {
    path: "/app/ledger-list/equipment-inspection/lines/l1/complete",
    label: "機械器具点検の提出後（アプリ）",
  },
  session: {
    path: "/app/progress",
    label: "進捗一覧（アプリ）",
  },
};

/** 管理画面で「データが無い」を選んだときに開く画面。承認申請管理トップは一覧も
    サイドメニューのバッジも空になるので、何が変わったか一目で分かる */
const ADMIN_EMPTY_ENTRY = {
  path: "/admin/approvals",
  label: "承認申請管理（管理画面）",
};

/**
 * 状態を選んだときに開く画面。管理画面を見ている間に「データが無い」を選んだら、
 * アプリへ飛ばさずに管理画面の一覧を開く。
 */
export function trialEntryFor(
  trial: DemoTrial,
  pathname: string,
): { path: string; label: string } {
  if (trial === "empty" && areaOf(pathname) === "admin") return ADMIN_EMPTY_ENTRY;
  return TRIAL_ENTRY_SCREENS[trial];
}

const TRIAL_KEY = "nq_demo_trial";
const MESSAGE_SOURCE = "nq-demo-trial";

function isTrial(value: string | null): value is DemoTrial {
  return value !== null && (TRIAL_ORDER as string[]).includes(value);
}

function load(): DemoTrial | null {
  try {
    const raw = sessionStorage.getItem(TRIAL_KEY);
    return isTrial(raw) ? raw : null;
  } catch {
    return null;
  }
}

let trial: DemoTrial | null = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function save(next: DemoTrial | null) {
  try {
    if (next) sessionStorage.setItem(TRIAL_KEY, next);
    else sessionStorage.removeItem(TRIAL_KEY);
  } catch {
    /* 無視 */
  }
}

/** 同じタブの親ウィンドウと、中に置いた iframe へ知らせる */
function broadcast(next: DemoTrial | null) {
  if (typeof window === "undefined") return;
  const payload = { source: MESSAGE_SOURCE, trial: next };
  const origin = window.location.origin;
  try {
    if (window.parent && window.parent !== window)
      window.parent.postMessage(payload, origin);
  } catch {
    /* 無視 */
  }
  try {
    document.querySelectorAll("iframe").forEach((frame) => {
      frame.contentWindow?.postMessage(payload, origin);
    });
  } catch {
    /* 無視 */
  }
}

/** 受け取った値をそのまま反映する（トグルしない）。変わっていなければ何もしない */
function apply(next: DemoTrial | null) {
  if (next === trial) return;
  trial = next;
  save(next);
  emit();
  broadcast(next);
}

/** お試し状態を切り替える。同じものをもう一度選ぶと解除 */
export function setDemoTrial(next: DemoTrial | null) {
  apply(trial === next ? null : next);
}

export function getDemoTrial(): DemoTrial | null {
  return trial;
}

export function subscribeDemoTrial(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** 今のお試し状態。切り替わったら読んでいる画面が描き直される */
export function useDemoTrial(): DemoTrial | null {
  return useSyncExternalStore(subscribeDemoTrial, getDemoTrial, () => null);
}

/* ───────────── 各画面から使う小さなヘルパ ───────────── */

/**
 * 「データが無い」を試しているときだけ、一覧の中身を空にする。
 *
 * 記録の一覧を描く画面で `const rows = useDemoList(RECORDS)` のように挟む。
 * 元データ（モック）そのものは触らないので、詳細画面など一覧以外は今まで通り動く。
 */
export function useDemoList<T>(items: T[]): T[] {
  const t = useDemoTrial();
  return t === "empty" ? EMPTY : items;
}
const EMPTY: never[] = [];

/** 「データが無い」を試しているか。記録の有無で見た目が変わる画面が使う */
export function useDemoEmpty(): boolean {
  return useDemoTrial() === "empty";
}

/** 「データが無い」ときは 0 件として見せる。サイドメニューのバッジなどに挟む */
export function useDemoCount(count: number): number {
  return useDemoEmpty() ? 0 : count;
}

/** 点検状況を持つ行を、まとめて「未点検」に落とす */
function asUninspected<T extends { status: string }>(items: T[], empty: boolean): T[] {
  if (!empty) return items;
  return items.map((item) =>
    item.status === "not_inspected" ? item : ({ ...item, status: "not_inspected" } as T),
  );
}

/**
 * 「データが無い」を試しているときだけ、点検状況をすべて「未点検」にする。
 *
 * 一覧を空にする `useDemoList` と違い、行そのものは残す。点検する対象
 * （ライン・秤・探知機…）は帳票管理で登録済みのマスタなので消えず、
 * 「まだ 1 件も点検していない」状態になるだけ、というのがこの状態の意味。
 * ステータスチップと「点検済み n/m」の両方がこれで揃う。
 *
 * モックの定数をそのまま読んでいる画面用。Context で持っている帳票は
 * `useDemoInspectionState` の方を使う（点検すればふつうに点検済みへ進むため）。
 */
export function useDemoUninspected<T extends { status: string }>(items: T[]): T[] {
  const empty = useDemoEmpty();
  return useMemo(() => asUninspected(items, empty), [items, empty]);
}

/**
 * 点検状況を持つ一覧の state。`useState(初期値)` の置き換えとして使う。
 *
 * 「データが無い」を試しているときは、すべて未点検の状態から始める。あくまで
 * 初期値なので、そのまま点検して提出すれば「点検済み」に変わる（点検した結果まで
 * 未点検に戻してしまうと、何をしても変わらない画面になってしまう）。
 * 画面を開いたまま「状態を試す」を切り替えたときは作り直す。
 */
export function useDemoInspectionState<T extends { status: string }>(
  initial: T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
  const empty = useDemoEmpty();
  const [items, setItems] = useState<T[]>(() => asUninspected(initial, empty));
  const applied = useRef(empty);

  useEffect(() => {
    if (applied.current === empty) return;
    applied.current = empty;
    setItems(asUninspected(initial, empty));
  }, [empty, initial]);

  return [items, setItems];
}

/** 提出の結果。sent=送信できた / unsent=オフラインで未送信 / failed=送信エラー */
export type DemoSendOutcome = "sent" | "unsent" | "failed";

export function getDemoSendOutcome(): DemoSendOutcome {
  if (trial === "offline") return "unsent";
  if (trial === "error") return "failed";
  return "sent";
}

/** 提出したときにどうなるか。完了画面・完了ポップアップがこれを見て文言を変える */
export function useDemoSendOutcome(): DemoSendOutcome {
  const t = useDemoTrial();
  if (t === "offline") return "unsent";
  if (t === "error") return "failed";
  return "sent";
}

/** ネットワークに繋がっているか。オフラインを試しているときは false */
export function isDemoOnline(): boolean {
  if (trial === "offline") return false;
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

if (typeof window !== "undefined") {
  // 同じタブの別ウィンドウ（iframe / 親）で書き換わったときに読み直す
  window.addEventListener("storage", (e) => {
    if (e.storageArea !== sessionStorage) return;
    if (e.key !== null && e.key !== TRIAL_KEY) return;
    apply(load());
  });

  window.addEventListener("message", (e) => {
    if (e.origin !== window.location.origin) return;
    const data = e.data as { source?: string; trial?: unknown } | null;
    if (!data || data.source !== MESSAGE_SOURCE) return;
    apply(isTrial((data.trial ?? null) as string | null) ? (data.trial as DemoTrial) : null);
  });
}
