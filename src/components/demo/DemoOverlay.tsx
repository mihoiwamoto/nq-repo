/**
 * 右下の「動作デモ」ピルを押すと、今の画面の上に全面で重なって出る動作デモ。
 * 別ページではなく、どの画面にいても同じ場所でそのまま開ける。
 *
 * 見た目: 左に操作メニュー、右に端末枠を大きく。背景は全面白。
 * （最初はキャンバスと同じ「上にツールバー + 下に端末枠」だったが、
 * 「タブレットや PC のデモ画面は右側に大きく、タイトル下のものは左側にメニューとして」で並べ替えた）
 * 画面一覧パネルは持たない。見せたい画面へは端末枠の中で普通に遷移する。
 * 端末枠には NQ の実画面を iframe で読み込み、そのまま触って動かせる。キャンバスと違って
 * 要素の編集やコメントはせず、左メニューで
 *   - 管理画面（PC 幅）/ アプリ（タブレット幅）を切り替える
 *   - 空状態やエラー文言を確かめる「状態を試す」を選ぶ
 *   - 資料（変更履歴 / 画面遷移図 / 画面説明 / 開発Ver管理）へ移る
 *   - 端末枠の拡大・縮小
 * ことに絞ってある。
 *
 * 開いた時点で見ていた画面が最初に端末枠に入る。iframe の中で遷移しても、左メニューの「表示中」と
 * 端末枠のラベルはそれに追従する。
 * 端末枠に出す画面は外（右下ピルの 管理画面 / アプリ タブ）からも変えられる。今どの画面を出しているかは
 * onPathChange で親に返していて、ピルの「管理画面 / アプリ」の選択状態もそれに合わせて光る。「状態を試す」は sessionStorage 経由で iframe の中の画面にも
 * 伝わる（demoStore の storage イベント）。
 *
 * 置き場所: サイドバー・ヘッダーも含めて画面いっぱいに重なる（一度サイドバーを残す形にしたが
 * 「やっぱりサイドメニューは無しで画面いっぱいに」で全面に戻した）。
 * 上の見出し帯（PageTitleBar + 説明文）も「文字は要らないので画面をもっと大きく」で外し、
 * 端末枠が縦いっぱいに入るようにした。閉じるボタンは左メニューの先頭にある。
 *
 * 層の順番: フィードバックの右パネル（z-60）より下、右下の「動作デモ」ピル（z-56）より下。
 * 動作デモを開いている間もピルと案内メニューはそのまま見えて使える。
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  DEVICE_SIZES,
  type DeviceMode,
} from "../../admin/features/guide/canvasTypes";
import { findScreenByPathname } from "../../admin/features/guide/screenCatalog";
import {
  IconClose,
  IconComment,
  IconExternal,
  IconFit,
  IconFolder,
  IconMonitor,
  IconReload,
  IconSliders,
  IconTablet,
  IconZoomIn,
  IconZoomOut,
} from "../../admin/features/guide/CanvasIcons";
import {
  isUnresolved,
  openFeedbackPanel,
  useFeedback,
} from "../feedback/feedbackStore";
import { DEMO_FRAME_ATTR, openScreenCoachMarksInFrame } from "../screen-description/coachMarkStore";
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

/**
 * 「状態を試す」で選んだときに出る説明。
 * 左メニューは幅が狭く、説明が何行にもなってメニューが埋まってしまうので、
 * 2 行を超えるときだけ 2 行で切って「表示 / 非表示」で開け閉めできるようにする。
 * 2 行に収まるとき（管理画面では効きません、など）はボタンを出さない。
 */
function TrialNote({ effect, steps }: { effect: string; steps: string[] }) {
  const [open, setOpen] = useState(false);
  const [clipped, setClipped] = useState(false);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  // たたんでいる間だけ測る（開いている間は全部出ているので、はみ出しは分からない）
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || open) return;
    setClipped(el.scrollHeight > el.clientHeight + 1);
  }, [effect, open]);

  return (
    <div className="mt-1 mb-1.5 ml-4 mr-1 pl-3 border-l-2 border-[#e08a1e] flex flex-col gap-1.5">
      <p
        ref={textRef}
        className={`text-[11px] leading-5 text-[var(--semantic-text-primary)] ${open ? "" : "line-clamp-2"}`}
      >
        {effect}
      </p>
      {(clipped || open) && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="self-start flex items-center gap-1 text-[11px] font-semibold text-[var(--semantic-brand-primary)] hover:underline"
          >
            {open ? "説明を隠す" : "説明を表示"}
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
          </button>
          {open && (
            <ol className="flex flex-col gap-0.5 list-decimal pl-4 text-[11px] leading-5 text-[var(--semantic-text-secondary)]">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
        </>
      )}
      {/* 2 行に収まる短い説明は、たたむ意味がないので手順もそのまま出す */}
      {!clipped && !open && (
        <ol className="flex flex-col gap-0.5 list-decimal pl-4 text-[11px] leading-5 text-[var(--semantic-text-secondary)]">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;

/** 端末枠のまわりの余白。変更履歴キャンバス（48px）より狭くして、画面いっぱいに大きく見せる */
const STAGE_PADDING = 8;

/** フィードバックの場所選びから自分を外すための印 */
const own = { "data-nq-feedback": "" } as Record<string, string>;

/** 端末の種類ごとの呼び名と、その側の最初の画面。
 * home はログイン後の入口、start は「最初から」で戻るログイン前の画面。
 * 「最初から」は今見ている側の先頭に戻す（アプリを見ているのに管理画面のログインへ飛ばさない） */
const SURFACES: Record<
  DeviceMode,
  { label: string; home: string; start: string; hint: string }
> = {
  pc: {
    label: "管理画面",
    home: "/admin/home",
    start: "/",
    hint: "管理画面を PC 幅（1280px）で表示（1）",
  },
  tablet: {
    label: "アプリ",
    home: "/app/ledger-list",
    start: "/app/login",
    hint: "アプリをタブレット縦（768×1024）で表示（2）",
  },
};
const DEVICE_ORDER: DeviceMode[] = ["pc", "tablet"];

/** 資料。動作デモを閉じてそのページへ移る */
const MATERIALS: { label: string; note: string; path: string }[] = [
  {
    label: "変更履歴",
    note: "Claude が加えた変更がどの画面のどこかを見る・編集を試す",
    path: "/admin/guide/screens",
  },
  {
    label: "画面遷移図",
    note: "帳票ごとの「一覧 → 詳細 → 編集」の流れを俯瞰する",
    path: "/admin/guide/flow",
  },
  {
    label: "画面説明",
    note: "全画面が何をする画面かを読む",
    path: "/admin/guide/descriptions",
  },
  {
    label: "開発Ver管理",
    note: "Ver ごとに何を作ったかを見返す",
    path: "/admin/guide/versions",
  },
  {
    label: "フィードバック管理",
    note: "各画面から書き残した声を一覧で見返す",
    path: "/admin/guide/feedback",
  },
];

/** アプリの URL はタブレット、それ以外（管理画面・トップ）は PC で見せる */
function deviceForPath(pathname: string): DeviceMode {
  return pathname.startsWith("/app") ? "tablet" : "pc";
}

/** 入力中のキー操作をショートカットに取られないようにする */
function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.tagName) return false;
  const tag = node.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    node.isContentEditable
  );
}

/* ───────────────────────── 小さな部品（変更履歴キャンバスと同じ見た目） ───────────────────────── */

function ToolButton({
  active,
  title,
  onClick,
  disabled,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`h-8 min-w-8 px-1.5 rounded-md flex items-center justify-center gap-1 text-xs disabled:opacity-30 ${
        active
          ? "bg-[var(--semantic-brand-primary)] text-white"
          : "text-[var(--semantic-text-primary)] hover:bg-[#ececec]"
      }`}
    >
      {children}
    </button>
  );
}

/** 左メニューのひとかたまり（見出し + 中身） */
function MenuSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-3 border-b border-[#efefef] last:border-b-0">
      <p className="px-2 mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-[var(--semantic-text-secondary)]">
        {icon}
        {title}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

/** 左メニューの一行ボタン */
function MenuButton({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={active}
      className={`w-full h-9 px-3 rounded-lg flex items-center gap-2 text-[13px] font-semibold text-left transition ${
        active
          ? "bg-[var(--semantic-brand-primary)] text-white"
          : "text-[var(--semantic-text-primary)] hover:bg-[#f4f4f4]"
      }`}
    >
      {children}
    </button>
  );
}

/* ───────────────────────── ステージ（端末枠 + iframe） ───────────────────────── */

function DemoStage({
  stageRef,
  frameRef,
  frameSrc,
  iframeKey,
  onFrameLoad,
  device,
  zoom,
  title,
  trialLabel,
  onZoomBy,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  frameSrc: string;
  iframeKey: number;
  onFrameLoad: () => void;
  device: DeviceMode;
  zoom: number;
  title: string;
  trialLabel: string | null;
  onZoomBy: (factor: number) => void;
}) {
  const size = DEVICE_SIZES[device];
  const dragRef = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);

  // ⌘/Ctrl + ホイールで拡大縮小（React の onWheel は passive なので直接つける）
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      onZoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [stageRef, onZoomBy]);

  function startDrag(e: React.PointerEvent) {
    const stage = stageRef.current;
    if (!stage) return;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      left: stage.scrollLeft,
      top: stage.scrollTop,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function moveDrag(e: React.PointerEvent) {
    const stage = stageRef.current;
    const d = dragRef.current;
    if (!stage || !d) return;
    stage.scrollLeft = d.left - (e.clientX - d.x);
    stage.scrollTop = d.top - (e.clientY - d.y);
  }
  function endDrag(e: React.PointerEvent) {
    dragRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  return (
    // 外側は大きさを測るためだけの枠。中のスクロール面を inset-0 で敷き詰め、
    // 状態ラベルはその上に浮かせる（レイアウトの高さを食わせない）
    <div className="flex-1 min-h-0 relative">
      <div
        ref={stageRef}
        className="absolute inset-0 overflow-auto bg-white select-none flex"
        onPointerDown={(e) => {
          // 背景（iframe 以外）をドラッグしたときはキャンバスを動かす
          if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).dataset.stageBg
          )
            startDrag(e);
        }}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* m-auto で真ん中に置く。端末枠がはみ出すほど拡大したときも
            flex の中央寄せと違って端が切れない */}
        <div
          data-stage-bg="1"
          className="m-auto shrink-0"
          style={{
            width: size.width * zoom + STAGE_PADDING * 2,
            height: size.height * zoom + STAGE_PADDING * 2,
            position: "relative",
          }}
        >
          <div
            className="absolute rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{
              left: STAGE_PADDING,
              top: STAGE_PADDING,
              width: size.width,
              height: size.height,
              transform: `scale(${zoom})`,
              transformOrigin: "0 0",
              outline: `${8 / zoom}px solid #333`,
            }}
          >
            <iframe
              key={iframeKey}
              ref={frameRef}
              {...{ [DEMO_FRAME_ATTR]: "" }}
              src={frameSrc}
              title={title}
              onLoad={onFrameLoad}
              className="block border-0 bg-white"
              style={{ width: size.width, height: size.height }}
            />
          </div>
        </div>
      </div>

      {/* 今どういう状態で見せているか。右下は「動作デモ」ピルがいるので左下に浮かせる */}
      <span
        className={`pointer-events-none absolute left-2 bottom-2 h-5 px-1.5 rounded text-[10px] font-bold text-white flex items-center whitespace-nowrap ${
          trialLabel ? "bg-[#e08a1e]" : "bg-[var(--semantic-brand-primary)]"
        }`}
      >
        {trialLabel
          ? `状態を試す: ${trialLabel}`
          : "動作デモ（そのまま操作できます）"}
      </span>
    </div>
  );
}

/* ───────────────────────── 本体 ───────────────────────── */

export function DemoOverlay({
  path,
  onPathChange,
  onClose,
}: {
  /** 端末枠に出す画面。開いた時点で見ていた画面が最初に入る。
   * 外（右下ピルの 管理画面 / アプリ タブ）から変えられたら端末枠もそこへ移る */
  path: string;
  /** 端末枠の中で遷移したら知らせる。ピルの 管理画面 / アプリ の表示がこれに追従する */
  onPathChange: (path: string) => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const trial = useSyncExternalStore(
    subscribeDemoTrial,
    getDemoTrial,
    () => null,
  );

  const [frameSrc, setFrameSrc] = useState(() =>
    path.startsWith("/") ? path : SURFACES.pc.home,
  );
  const [iframeKey, setIframeKey] = useState(0);
  const [livePath, setLivePath] = useState(frameSrc);
  const [device, setDevice] = useState<DeviceMode>(() =>
    deviceForPath(frameSrc),
  );
  const [zoom, setZoom] = useState(0.5);
  const [loading, setLoading] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  /** 端末枠に今出ている画面のパス（クエリ抜き）。最初に入れた画面から始める。
   * null のままだと、開いた直後に外から同じ画面を渡されたときに読み直してしまう */
  const lastPathRef = useRef<string | null>(frameSrc.split("?")[0]);
  /** go() でこれから移す画面。iframe は少しの間まだ前の画面のままなので、
   * その間に下の見張りが古いパスを拾って「中で遷移した」と誤解し、元の画面へ戻してしまう。
   * 移し終わる（or 4 秒経つ）までは古いパスを無視するための控え */
  const pendingPathRef = useRef<{ path: string; until: number } | null>(null);

  const screen = useMemo(() => findScreenByPathname(livePath), [livePath]);
  const frameTitle = screen?.title ?? (livePath === "/" ? "トップ" : livePath);
  const trialLabel = trial ? TRIAL_LABELS[trial] : null;
  const surface = SURFACES[device];

  // 端末枠に出している画面に付いている未対応のフィードバック件数（ツールバーのボタンに出す）
  const { entries: feedbackEntries } = useFeedback();
  const feedbackCount = useMemo(
    () =>
      feedbackEntries.filter(
        (e) =>
          (screen?.id ? e.screenId === screen.id : e.pathname === livePath) &&
          isUnresolved(e.status),
      ).length,
    [feedbackEntries, screen?.id, livePath],
  );

  // 開いている間は裏の画面をスクロールさせない
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /** 端末枠の中を指定の URL へ。同じ URL なら読み直す */
  const go = useCallback(
    (next: string) => {
      setLoading(true);
      if (next === frameSrc) setIframeKey((k) => k + 1);
      else setFrameSrc(next);
      pendingPathRef.current = {
        path: next.split("?")[0],
        until: Date.now() + 4000,
      };
      // 中で遷移したときの見張り（下の setInterval）と突き合わせる基準もここで合わせておく。
      // 合わせておかないと、外から渡された path と往復して無限に読み直しになる
      lastPathRef.current = next.split("?")[0];
      setLivePath(next);
      setDevice(deviceForPath(next));
    },
    [frameSrc],
  );

  // 外（右下ピルの 管理画面 / アプリ タブ）で画面が変えられたら、端末枠をそちらへ移す。
  // 端末枠の中で遷移して親に知らせた分は lastPathRef と一致するので、ここでは何もしない。
  //
  // go は frameSrc が変わるたびに作り直されるので、依存に入れると
  // 「自分で移した直後に、まだ古いままの path でもう一度呼ばれて元の画面に戻る」ことになる。
  // 外から渡された path が変わったときだけ動かす
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    if (!path.startsWith("/")) return;
    if (path.split("?")[0] === lastPathRef.current) return;
    goRef.current(path);
  }, [path]);

  // 端末枠に出ている画面を親に知らせる。ピルの 管理画面 / アプリ の表示がこれに追従する。
  // 親から渡された関数の作り直しで動かないよう、呼ぶ先は ref 経由にしている
  const onPathChangeRef = useRef(onPathChange);
  onPathChangeRef.current = onPathChange;
  useEffect(() => {
    onPathChangeRef.current(livePath);
  }, [livePath]);

  /** それぞれの端末で最後に見ていた画面。管理画面 ⇄ アプリ を行き来しても同じ画面に戻ってこられる */
  const lastByDevice = useRef<Record<DeviceMode, string>>({
    pc: SURFACES.pc.home,
    tablet: SURFACES.tablet.home,
  });
  useEffect(() => {
    lastByDevice.current[deviceForPath(livePath)] = livePath;
  }, [livePath]);

  /** 左メニューの 管理画面 / アプリ 切替。反対側を見ていたら、その側で最後に見ていた画面に移る */
  const switchDevice = useCallback(
    (d: DeviceMode) => {
      if (deviceForPath(livePath) !== d) go(lastByDevice.current[d]);
      else setDevice(d);
    },
    [livePath, go],
  );

  const reloadFrame = useCallback(() => {
    setLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  /** お試し状態を解除して、今見ている側のログイン画面から見せ直す。
   * アプリを見ているときにいつも管理画面のログインへ飛んでしまっていたので、側ごとに戻り先を変える */
  const restart = useCallback(() => {
    setDemoTrial(null);
    go(SURFACES[deviceForPath(livePath)].start);
  }, [go, livePath]);

  /** 資料へ。動作デモを閉じてそのページに移る */
  const goMaterial = useCallback(
    (path: string) => {
      onClose();
      navigate(path);
    },
    [navigate, onClose],
  );

  const handleFrameLoad = useCallback(() => {
    setLoading(false);
    const w = frameRef.current?.contentWindow;
    if (w && w.location.href !== "about:blank") {
      // 読み込みが終わった＝go() で移した先に着いた
      pendingPathRef.current = null;
      lastPathRef.current = w.location.pathname;
      setLivePath(w.location.pathname);
    }
  }, []);

  // 端末枠の中で遷移したときに、タイトル・端末の種類を追従させる
  useEffect(() => {
    const timer = setInterval(() => {
      const w = frameRef.current?.contentWindow;
      const d = frameRef.current?.contentDocument;
      if (!w || !d) return;
      // まだ読み込み前（about:blank）のときは画面として扱わない
      if (w.location.href === "about:blank" || !d.getElementById("root"))
        return;
      const p = w.location.pathname;
      // go() で移している最中に、まだ切り替わっていない古いパスを拾わない
      const pending = pendingPathRef.current;
      if (pending) {
        if (p !== pending.path && Date.now() < pending.until) return;
        pendingPathRef.current = null;
      }
      if (p !== lastPathRef.current) {
        lastPathRef.current = p;
        setLivePath(p);
        setDevice(deviceForPath(p));
      }
    }, 400);
    return () => clearInterval(timer);
  }, []);

  /** 自分で拡大縮小したか。している間は窓のリサイズで勝手に倍率を戻さない */
  const manualZoomRef = useRef(false);

  const zoomBy = useCallback((factor: number) => {
    manualZoomRef.current = true;
    setZoom((z) =>
      Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, Math.round(z * factor * 100) / 100),
      ),
    );
  }, []);

  const fitZoom = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    manualZoomRef.current = false;
    const size = DEVICE_SIZES[device];
    const available = stage.clientWidth - STAGE_PADDING * 2;
    const availableH = stage.clientHeight - STAGE_PADDING * 2;
    const z = Math.min(available / size.width, availableH / size.height);
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.floor(z * 100) / 100)));
  }, [device]);

  useEffect(() => {
    fitZoom();
  }, [fitZoom]);

  // 窓の大きさが変わっても端末枠を目いっぱいのままに保つ（自分で拡大縮小したときは触らない）
  useEffect(() => {
    const onResize = () => {
      if (!manualZoomRef.current) fitZoom();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fitZoom]);

  // Esc で閉じる / 1〜2 で 管理画面 / アプリ を切り替える（入力中は除く）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey)
        return;
      if (e.key === "Escape") {
        // 右下ピルの案内メニューが開いていれば、そちらが Esc で閉じる
        if (document.getElementById("nq-demo-panel")) return;
        e.preventDefault();
        onClose();
        return;
      }
      const index = Number(e.key) - 1;
      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < DEVICE_ORDER.length
      ) {
        e.preventDefault();
        switchDevice(DEVICE_ORDER[index]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [switchDevice, onClose]);

  // 管理画面を出している間は「データが無い」だけ（他はアプリの提出・ログインでしか起きない）
  const trials = trialsForPath(livePath);

  const trialMenu = (
    <div className="flex flex-col gap-0.5">
      {trials.map((t: DemoTrial) => {
        const active = trial === t;
        const entry = trialEntryFor(t, livePath);
        // 説明は「今どの画面を見ているか」に合わせる（ログイン画面と提出後では起きることが違う）
        const guide = trialGuideFor(t, livePath);
        return (
          <div key={t}>
            <button
              type="button"
              onClick={() => {
                // 選んだら、その状態がそのまま出ている画面を端末枠に出す。
                // 解除（もう一度押す）のときは今見ている画面のままにする
                setDemoTrial(active ? null : t);
                if (!active) go(entry.path);
              }}
              aria-pressed={active}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${active ? "bg-[#fff4e5]" : "hover:bg-[#f4f4f4]"}`}
            >
              <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--semantic-text-primary)]">
                <span
                  className={`size-2 rounded-full ${active ? "bg-[#e08a1e]" : "bg-[#d9d9d9]"}`}
                  aria-hidden
                />
                {TRIAL_LABELS[t]}
              </span>
              <span className="block text-[11px] text-[var(--semantic-text-secondary)] mt-0.5 pl-4">
                {TRIAL_DESCRIPTIONS[t]}
              </span>
            </button>

            {/* 選んでいる間だけ、何が起きるかと「どうやって見るか」を出す。
                オレンジの「〇〇を開き直す」ボタンも出していたが、
                フローティングの案内メニューと同じく要らないとのことで外した */}
            {active && <TrialNote effect={guide.effect} steps={guide.steps} />}
          </div>
        );
      })}
      <p className="mt-1 px-3 text-[11px] leading-5 text-[var(--semantic-text-secondary)]">
        {trials.length === 1
          ? "もう一度押すと解除されます。管理画面で試せるのは「データが無い」だけです（オフライン・送信エラー・セッション終了はアプリ側でだけ起きます）。"
          : "もう一度押すと解除されます。オフライン・送信エラー・セッション終了はアプリ側でだけ起きます。「データが無い」は管理画面の記録一覧にも効きます。"}
      </p>
    </div>
  );

  const materialsMenu = (
    <div className="flex flex-col gap-0.5">
      {/* 今の画面の説明: 端末枠の中の画面にコーチマーク（番号付きの吹き出し）を重ねる。
          動作デモは閉じない（以前は画面説明の詳細ページへ遷移していた） */}
      <button
        type="button"
        onClick={() => openScreenCoachMarksInFrame(frameRef.current)}
        className="w-full text-left px-3 py-2 rounded-lg bg-[#e6f5ec] hover:brightness-[0.98] transition"
      >
        <span className="block text-[13px] font-semibold text-[var(--semantic-brand-primary)]">
          今の画面の説明を表示
        </span>
        <span className="block text-[11px] text-[var(--semantic-text-secondary)] mt-0.5 truncate">
          {screen ? `${screen.title} の各機能に吹き出しを重ねる` : "端末枠の中の画面に、機能ごとの吹き出しを重ねる"}
        </span>
      </button>
      {MATERIALS.map((m) => (
        <button
          key={m.path}
          type="button"
          onClick={() => goMaterial(m.path)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f4f4f4] transition"
        >
          <span className="block text-[13px] font-semibold text-[var(--semantic-text-primary)]">
            {m.label}
          </span>
          <span className="block text-[11px] text-[var(--semantic-text-secondary)] mt-0.5">
            {m.note}
          </span>
        </button>
      ))}
      <p className="mt-1 px-3 text-[11px] leading-5 text-[var(--semantic-text-secondary)]">
        資料を開くと動作デモは閉じます。右下の「動作デモ」からいつでも戻れます。
      </p>
    </div>
  );

  return createPortal(
    <div
      {...own}
      id="nq-demo-overlay"
      role="region"
      aria-label="動作デモ"
      className="nq-demo-overlay fixed inset-0 z-[55] flex flex-col bg-white text-[var(--semantic-text-primary)]"
    >
      {/* 見出し（PageTitleBar と説明文）は置かない。
          端末枠を少しでも大きく見せたいので、上の帯をまるごと外して
          閉じるボタンは左メニューの先頭に移した */}
      <div className="flex flex-1 min-h-0">
        {/* 左: 操作メニュー（旧ツールバーの中身を縦に並べたもの） */}
        <aside className="w-[240px] shrink-0 flex flex-col min-h-0 overflow-y-auto bg-white border-r border-[#e5e5e5]">
          {/* 先頭: タイトル代わりの行と閉じるボタン。
              メニューを下までスクロールしても閉じられるように貼り付けておく */}
          <div className="sticky top-0 z-10 bg-white px-5 pt-4 pb-3 flex items-center justify-between gap-2 border-b border-[#efefef]">
            <span className="text-[15px] font-bold">動作デモ</span>
            <button
              type="button"
              onClick={onClose}
              title="動作デモを閉じる (Esc)"
              aria-label="動作デモを閉じる"
              className="shrink-0 size-8 rounded-lg border border-[#d9d9d9] bg-white flex items-center justify-center hover:bg-[#f4f4f4] transition"
            >
              <IconClose width={16} height={16} />
            </button>
          </div>

          {/* 今、端末枠に出している画面 */}
          <div className="px-5 py-4 border-b border-[#efefef]">
            <p className="text-[11px] font-bold text-[var(--semantic-text-secondary)]">
              表示中
            </p>
            <p className="mt-1 text-[14px] font-semibold leading-5 break-words">
              {loading ? "読み込み中…" : `${surface.label} › ${frameTitle}`}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-[var(--semantic-text-secondary)] break-all">
              {livePath}
            </p>
            {trialLabel && (
              <button
                type="button"
                onClick={() => setDemoTrial(null)}
                title="お試し状態を解除"
                className="mt-2 h-7 pl-2.5 pr-2 rounded-full bg-[#fff4e5] text-[#b86a0b] text-xs font-semibold inline-flex items-center gap-1.5 hover:brightness-[0.97]"
              >
                <span
                  className="size-2 rounded-full bg-[#e08a1e]"
                  aria-hidden
                />
                {trialLabel}
                <IconClose width={12} height={12} />
              </button>
            )}
          </div>

          {/* 端末 */}
          <MenuSection title="端末">
            {DEVICE_ORDER.map((d) => (
              <MenuButton
                key={d}
                active={device === d}
                title={SURFACES[d].hint}
                onClick={() => switchDevice(d)}
              >
                {d === "pc" ? <IconMonitor /> : <IconTablet />}
                <span className="flex-1">{SURFACES[d].label}</span>
                <span className="text-[11px] font-normal opacity-70 tabular-nums">
                  {DEVICE_SIZES[d].width}×{DEVICE_SIZES[d].height}
                </span>
              </MenuButton>
            ))}
          </MenuSection>

          {/* 操作 */}
          <MenuSection title="操作">
            <MenuButton title="画面を再読み込み" onClick={reloadFrame}>
              <IconReload />
              <span>再読み込み</span>
            </MenuButton>
            <MenuButton
              title="この画面を別タブで開く"
              onClick={() => window.open(livePath, "_blank", "noopener")}
            >
              <IconExternal />
              <span>別タブで開く</span>
            </MenuButton>
            <MenuButton
              title={`お試し状態を解除して、${surface.label}の最初から見せ直す`}
              onClick={restart}
            >
              <IconReload />
              <span>最初から</span>
            </MenuButton>
            <MenuButton
              title={`「${frameTitle}」へのフィードバックを書く`}
              onClick={() => openFeedbackPanel(livePath)}
            >
              <IconComment />
              <span className="flex-1">フィードバック</span>
              {feedbackCount > 0 && (
                <span
                  aria-label={`未対応 ${feedbackCount} 件`}
                  className="min-w-4 h-4 px-1 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[10px] font-bold flex items-center justify-center tabular-nums"
                >
                  {feedbackCount > 99 ? "99+" : feedbackCount}
                </span>
              )}
            </MenuButton>
          </MenuSection>

          {/* 表示倍率 */}
          <MenuSection title="表示">
            <div className="flex items-center gap-1 px-1">
              <ToolButton title="縮小" onClick={() => zoomBy(1 / 1.2)}>
                <IconZoomOut />
              </ToolButton>
              <span className="w-12 text-center text-xs tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <ToolButton title="拡大" onClick={() => zoomBy(1.2)}>
                <IconZoomIn />
              </ToolButton>
              <ToolButton title="画面に合わせる" onClick={fitZoom}>
                <IconFit />
                <span className="whitespace-nowrap">合わせる</span>
              </ToolButton>
            </div>
          </MenuSection>

          {/* 状態を試す。
              管理画面（PC 幅）を出している間は「データが無い」だけ出す。
              オフライン・送信エラー・セッション終了はアプリの提出/ログインでしか起きないため */}
          <MenuSection title="状態を試す" icon={<IconSliders />}>
            {trialMenu}
          </MenuSection>

          {/* 資料 */}
          <MenuSection title="資料" icon={<IconFolder />}>
            {materialsMenu}
          </MenuSection>
        </aside>

        {/* 右: 端末枠を大きく */}
        <section className="flex-1 min-w-0 flex flex-col min-h-0">
          <DemoStage
            stageRef={stageRef}
            frameRef={frameRef}
            frameSrc={frameSrc}
            iframeKey={iframeKey}
            onFrameLoad={handleFrameLoad}
            device={device}
            zoom={zoom}
            title={frameTitle}
            trialLabel={trialLabel}
            onZoomBy={zoomBy}
          />
        </section>
      </div>
    </div>,
    document.body,
  );
}
