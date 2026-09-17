/**
 * 画面右下の「動作デモ」ピルと、押すと上に出てくる案内メニュー。
 *
 * デモを見せている最中に、
 *   - 資料（画面説明 / 動作デモ）を行き来する
 *   - 画面（管理画面 / アプリ）を切り替える。押した側が必ずそのまま出る:
 *     動作デモを開いている間は端末枠の中身が入れ替わり、閉じている間はその画面へ普通に遷移する。
 *     タブが光っているのは「今見ているもの」
 *   - 空状態やエラー文言を確かめるための「お試し状態」を選ぶ
 * ことができる。
 *
 * メニューの「動作デモ」を押すと、今の画面の上に動作デモ（DemoOverlay）が全面で重なって開く。
 * 動作デモは、変更履歴キャンバスと同じ端末枠の中に実画面を読み込み、そのまま触って動かせる画面。
 * 別ページではないので URL は変わらず、閉じれば元の画面にそのまま戻る。
 * このメニューから別の画面へ移ったら動作デモは閉じる（他の画面へ「行った」扱い）。
 *
 * 動作デモを開いている間も、このピルと案内メニューはオーバーレイ（z-55）の上（z-56）に出続ける。
 *
 * メニューはモーダルではない。開いたまま裏の画面を触れて、今どこにいるかはピルに出る。
 * メニューの開閉・動作デモの開閉・選んだ状態は sessionStorage に持つので、リロードしても続きから見せられる。
 *
 * 画面説明キャンバス（iframe）の中では出さない。フィードバックの「場所を選ぶ」の
 * 対象にもならないよう、フィードバック UI と同じ印（data-nq-feedback）を付けている。
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DemoOverlay } from "./DemoOverlay";
import { openFeedbackPanel } from "../feedback/feedbackStore";
import { findDemoFrame, openScreenCoachMarks, openScreenCoachMarksInFrame } from "../screen-description/coachMarkStore";
import {
  TRIAL_DESCRIPTIONS,
  trialEntryFor,
  TRIAL_LABELS,
  trialsForPath,
  trialGuideFor,
  getDemoTrial,
  setDemoTrial,
  subscribeDemoTrial,
  type DemoTrial,
} from "./demoStore";

/** メニューの開閉状態。画面遷移・リロードをまたいで開いたままにする */
const OPEN_KEY = "nq_demo_panel_open";
/** 動作デモ（オーバーレイ）の開閉状態と、開いたときに端末枠へ入れた画面 */
const DEMO_KEY = "nq_demo_open_path";
/** フィードバックの場所選びから自分を外すための印 */
const own = { "data-nq-feedback": "" } as Record<string, string>;

function loadOpen(): boolean {
  try {
    return sessionStorage.getItem(OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

function saveOpen(open: boolean) {
  try {
    if (open) sessionStorage.setItem(OPEN_KEY, "1");
    else sessionStorage.removeItem(OPEN_KEY);
  } catch {
    /* 無視 */
  }
}

function loadDemoPath(): string | null {
  try {
    const v = sessionStorage.getItem(DEMO_KEY);
    return v && v.startsWith("/") ? v : null;
  } catch {
    return null;
  }
}

function saveDemoPath(path: string | null) {
  try {
    if (path) sessionStorage.setItem(DEMO_KEY, path);
    else sessionStorage.removeItem(DEMO_KEY);
  } catch {
    /* 無視 */
  }
}

/* ───────────────────────── 画面 ───────────────────────── */

type Surface = { key: string; label: string; path: string; start: string };

/** 切り替えられる画面。並び順がそのままキーボードの 1〜2 に対応する。
 * path はログイン後の入口、start は「最初から」で戻るログイン前の画面 */
const SURFACES: Surface[] = [
  { key: "admin", label: "管理画面", path: "/admin/home", start: "/" },
  { key: "app", label: "アプリ", path: "/app/ledger-list", start: "/app/login" },
];

/** パスからどの画面かを決める。トップ（ログイン前）はどちらでもない */
function surfaceOf(pathname: string): Surface | null {
  if (pathname.startsWith("/admin")) return SURFACES[0];
  if (pathname.startsWith("/app")) return SURFACES[1];
  return null;
}

/* ───────────────────────── 資料 ───────────────────────── */

type Material = { key: "descriptions" | "demo"; label: string; note: string };

/** 「資料」の一覧。どちらも別ページへは行かず、今の画面の上に重ねて開く。
 *   - 画面説明: 今いる画面の各機能に番号付きコーチマークと吹き出しを重ねる（ScreenCoachMarks）
 *   - 動作デモ: 今の画面を端末枠に入れたオーバーレイ（DemoOverlay）
 * 以前の画面説明は一覧ページ（/admin/guide/descriptions）へ遷移していたが、
 * 「今いる画面の説明を画面上で細かく」に変えた。一覧ページへはコーチマークの説明カードから行ける。
 * 動作デモの下に 管理画面 / アプリ のリンクも出していたが、上のタブと同じことなので外した */
const MATERIALS: Material[] = [
  { key: "descriptions", label: "画面説明", note: "今の画面の各機能に、番号付きの吹き出しで説明を重ねる" },
  { key: "demo", label: "動作デモ", note: "今の画面を端末枠に入れて、触って動かせる" },
];

/** 入力中のキー操作をショートカットに取られないようにする */
function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.tagName) return false;
  const tag = node.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || node.isContentEditable;
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ───────────────────────── 本体 ───────────────────────── */

export function DemoGuideWidget() {
  const [open, setOpen] = useState(loadOpen);
  /** 動作デモを開いているときは、開いた時点の画面のパス。閉じているときは null */
  const [demoPath, setDemoPath] = useState<string | null>(loadDemoPath);
  const location = useLocation();
  const navigate = useNavigate();
  const trial = useSyncExternalStore(subscribeDemoTrial, getDemoTrial, () => null);

  /**
   * 今どちらの画面を見ているか。動作デモを開いている間は「端末枠の中の画面」がそれなので、
   * 実際の URL ではなくそちらを見る（管理画面の URL のまま端末枠でアプリを見ている、が普通に起きる）
   */
  const surface = useMemo(
    () => surfaceOf(demoPath ?? location.pathname),
    [demoPath, location.pathname]
  );
  /** 「状態を試す」の説明・開く画面は、今見ている画面（端末枠の中があればそちら）に合わせる */
  const trialPath = demoPath ?? location.pathname;
  /** 管理画面を見ている間は「データが無い」だけ出す（他はアプリの提出・ログインでしか起きない） */
  const trials = useMemo(() => trialsForPath(trialPath), [trialPath]);

  /** 資料のうち今開いているもの。動作デモはこのウィジェットが状態を持つので分かる。
   * 画面説明（コーチマーク）は ScreenCoachMarksHost が状態を持つのでここでは光らせない */
  const materialKey: Material["key"] | null = demoPath ? "demo" : null;

  // 画面説明キャンバス（iframe）の中では出さない
  const embedded = typeof window !== "undefined" && window.self !== window.top;

  useEffect(() => saveOpen(open), [open]);
  useEffect(() => saveDemoPath(demoPath), [demoPath]);

  const go = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  /** 指定の画面を端末枠に入れてオーバーレイを開く。メニューは閉じる */
  const openDemoAt = useCallback((path: string) => {
    setDemoPath(path);
    setOpen(false);
  }, []);

  /** メニューの「動作デモ」: 今の画面を端末枠に入れてオーバーレイを開く */
  const openDemo = useCallback(
    () => openDemoAt(location.pathname + location.search),
    [openDemoAt, location.pathname, location.search]
  );

  const closeDemo = useCallback(() => setDemoPath(null), []);

  /**
   * メニューの「画面説明」: 今いる画面の上にコーチマークを重ねる。
   * 動作デモを開いているときは、説明したい画面は端末枠（iframe）の中にあるので、そちらに合図を送る。
   * メニューは重なって邪魔になるので閉じる
   */
  const openDescriptions = useCallback(() => {
    if (demoPath && openScreenCoachMarksInFrame(findDemoFrame())) {
      setOpen(false);
      return;
    }
    openScreenCoachMarks();
    setOpen(false);
  }, [demoPath]);

  /**
   * それぞれの画面で最後に見ていたところ。タブで往復しても同じ画面に戻ってこられるように覚えておく。
   * まだ見ていない側は、その画面の最初のページ
   */
  const lastSeenRef = useRef<Record<string, string>>({
    admin: SURFACES[0].path,
    app: SURFACES[1].path,
  });
  useEffect(() => {
    // 動作デモを開いている間は端末枠の中の画面が「今いるところ」
    const here = demoPath ?? location.pathname + location.search;
    const s = surfaceOf(here);
    if (s) lastSeenRef.current[s.key] = here;
  }, [demoPath, location.pathname, location.search]);

  /**
   * 上のタブ / 1〜2 キーでの 管理画面・アプリ 切替。押した側が実際に出るようにする。
   * - 動作デモを開いている間: 端末枠の中身をその画面に入れ替える（枠も PC 幅 / タブレット幅に変わる）。
   *   左メニューの「端末」と同じ動きで、押した側がそのまま枠に出る
   * - 閉じている間: どちらも普通の画面として遷移するだけ。
   *   以前はアプリだけ端末枠（動作デモ）に入れて開いていたが、
   *   「タブは動作デモに入らず、普通の画面で切り替わってほしい」とのことでやめた。
   *   動作デモを見せたいときは「資料 › 動作デモ」から開く
   * どちらも、その画面で最後に見ていたところに戻る
   */
  const selectSurface = useCallback(
    (s: Surface) => {
      const target = lastSeenRef.current[s.key] ?? s.path;
      if (demoPath) {
        if (surfaceOf(demoPath)?.key !== s.key) setDemoPath(target);
        return;
      }
      if (surfaceOf(location.pathname)?.key !== s.key) go(target);
    },
    [demoPath, location.pathname, go]
  );

  // 別の画面へ移ったら動作デモを閉じる（このメニューの「管理画面」「画面説明」などで他の画面へ「行った」とき）。
  // 開いた時点のパスと比べるので、リロード直後（sessionStorage から復元）は閉じない
  const openedAtRef = useRef<string | null>(null);
  useEffect(() => {
    if (!demoPath) {
      openedAtRef.current = null;
      return;
    }
    if (openedAtRef.current === null) {
      openedAtRef.current = location.pathname;
      return;
    }
    if (openedAtRef.current !== location.pathname) setDemoPath(null);
  }, [demoPath, location.pathname]);

  // Esc でメニューを閉じる / 1〜2 で画面切替（メニューを開いている間だけ。
  // 数字キーは動作デモが開いているときはそちらのツールバーが受ける）
  // 操作の案内文は下段から外した（フィードバックボタンに置き換え）。各画面ボタンの title に番号は残している
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (demoPath) return;
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const index = Number(e.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < SURFACES.length) {
        e.preventDefault();
        selectSurface(SURFACES[index]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, demoPath, selectSurface]);

  if (embedded) return null;

  const trialLabel = trial ? TRIAL_LABELS[trial] : null;

  return (
    <>
      {demoPath && (
        <DemoOverlay
          path={demoPath}
          /* 端末枠の中で遷移したら、上のタブの「管理画面 / アプリ」もそれに合わせる */
          onPathChange={setDemoPath}
          onClose={closeDemo}
        />
      )}

      {open && (
        <div
          {...own}
          id="nq-demo-panel"
          role="dialog"
          aria-label="動作デモの案内"
          className="nq-demo-panel fixed bottom-[76px] right-6 z-[56] w-[320px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] border border-[#e6e6e6]"
        >
          {/* 画面（管理画面 / アプリ のタブ切り替え）。押した側が必ずそのまま出る。
              光っているのは「今見ているもの」で、動作デモを開いている間は端末枠の中の画面を指す。
              右端に赤い丸の閉じるボタンを置いていたが、何のボタンか分からないので外した。
              閉じるのは右下のピルをもう一度押すか Esc */}
          <div className="px-5 pt-4 pb-3">
            <div
              role="tablist"
              aria-label="画面"
              className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#f0f0f0]"
            >
              {SURFACES.map((s, i) => {
                const active = s.key === surface?.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectSurface(s)}
                    title={
                      demoPath
                        ? `${s.label}を端末枠に出す（${i + 1}）`
                        : `${s.label}へ移る（${i + 1}）`
                    }
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold text-center transition ${
                      active
                        ? "bg-white text-[var(--semantic-brand-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                        : "text-[var(--semantic-text-secondary)] hover:text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 資料 */}
          <div className="px-5 py-3 border-t border-[#efefef]">
            <h2 className="text-[13px] font-semibold text-[var(--semantic-text-primary)]">資料</h2>

            <ul className="mt-3 flex flex-col gap-1">
              {MATERIALS.map((m) => {
                const active = m.key === materialKey;
                return (
                  <li key={m.key}>
                    <button
                      type="button"
                      onClick={() => (m.key === "demo" ? openDemo() : openDescriptions())}
                      aria-current={active ? "true" : undefined}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        active ? "bg-[#e6f5ec] hover:brightness-[0.98]" : "hover:bg-[#f4f4f4]"
                      }`}
                    >
                      <span className="block text-[13px] font-semibold text-[var(--semantic-text-primary)]">
                        {m.label}
                      </span>
                      <span className="block text-[11px] text-[var(--semantic-text-secondary)] mt-0.5">{m.note}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 状態を試す */}
          <div className="px-5 py-3 border-t border-[#efefef]">
            <h3 className="text-[13px] font-semibold text-[var(--semantic-text-secondary)]">状態を試す</h3>
            <ul className="mt-2 flex flex-col gap-1">
              {trials.map((t: DemoTrial) => {
                const active = trial === t;
                const entry = trialEntryFor(t, trialPath);
                return (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => {
                        setDemoTrial(t);
                        // 動作デモを開いている間は、その状態がそのまま出ている画面へ端末枠を移す。
                        // 開いていないときは今の画面のまま
                        if (!active && demoPath) setDemoPath(entry.path);
                      }}
                      aria-pressed={active}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        active ? "bg-[#fff4e5]" : "hover:bg-[#f4f4f4]"
                      }`}
                    >
                      <span className="block text-[13px] font-semibold text-[var(--semantic-text-primary)]">
                        {TRIAL_LABELS[t]}
                      </span>
                      <span className="block text-[11px] text-[var(--semantic-text-secondary)] mt-0.5">
                        {TRIAL_DESCRIPTIONS[t]}
                      </span>
                    </button>
                    {/* 選んでいる間だけ、何が起きるかを出す。
                        「この状態で〇〇を開く」ボタンも出していたが、要らないとのことで外した */}
                    {active && (
                      <div className="mt-1 mb-1 ml-3 mr-1 pl-3 border-l-2 border-[#e08a1e]">
                        {/* 説明は今見ている画面に合わせる。動作デモを開いている間は端末枠の中の画面 */}
                        <p className="text-[11px] leading-5 text-[var(--semantic-text-primary)]">
                          {trialGuideFor(t, trialPath).effect}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 px-3 text-[11px] leading-5 text-[var(--semantic-text-secondary)]">
              {trials.length === 1
                ? "もう一度押すと解除されます。管理画面で試せるのは「データが無い」だけです（オフライン・送信エラー・セッション終了はアプリ側でだけ起きます）。"
                : "もう一度押すと解除されます。オフライン・送信エラーはアプリの提出で、「データが無い」は記録の一覧、「セッション終了」はアプリの画面で確かめられます。"}
            </p>
          </div>

          {/* 下段 */}
          <div className="px-5 py-3 border-t border-[#efefef] flex items-center justify-between gap-3">
            <button
              type="button"
              /* 今見ている側の最初（ログイン画面）から見せ直す。
                 アプリを見ているときに管理画面のログインへ飛んでしまうので側ごとに分けた */
              title={`お試し状態を解除して、${surface?.label ?? "管理画面"}の最初から見せ直す`}
              onClick={() => {
                setDemoTrial(null);
                go(surface?.start ?? SURFACES[0].start);
              }}
              className="px-3 py-1.5 rounded-lg border border-[#d9d9d9] text-[12px] font-semibold text-[var(--semantic-text-primary)] hover:bg-[#f4f4f4] transition"
            >
              最初から
            </button>
            <button
              type="button"
              onClick={() => {
                // 今いる画面へのフィードバックを開く。メニューは重なって邪魔になるので閉じる
                openFeedbackPanel();
                setOpen(false);
              }}
              title="この画面へのフィードバックを書く"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--semantic-brand-primary)] text-white text-[12px] font-semibold hover:brightness-110 transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              フィードバック
            </button>
          </div>
        </div>
      )}

      <button
        {...own}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="nq-demo-panel"
        title="動作デモの案内"
        className="nq-demo-pill fixed bottom-6 right-6 z-[56] flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-full bg-white border border-[#e0e0e0] shadow-[0_4px_16px_rgba(0,0,0,0.14)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition"
      >
        <span
          className={`w-2 h-2 rounded-full ${trial ? "bg-[#e08a1e]" : "bg-[var(--semantic-brand-primary)]"}`}
          aria-hidden
        />
        <span className="text-[13px] font-semibold text-[var(--semantic-text-primary)]">動作デモ</span>
        <span className="w-px h-4 bg-[#e0e0e0]" aria-hidden />
        <span className="text-[13px] text-[var(--semantic-text-secondary)]">
          {[surface?.label, trialLabel].filter(Boolean).join("・") || "選択なし"}
        </span>
        <span className="text-[var(--semantic-text-secondary)]">
          <Chevron open={open} />
        </span>
      </button>
    </>
  );
}
