/**
 * 画面説明キャンバス。
 * NQ の実画面を iframe で読み込み、Figma のように要素を選んで見た目を編集できる。
 * 編集は DOM に直接当てる「仮の変更」で、コードには触らない。まとめて Claude 向けの
 * プロンプトに書き出し、それを渡すことでコードに反映する（プロンプトタブ）。
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { SCREENS, findScreenByPathname, type ScreenEntry } from "./screenCatalog";
import { DEVICE_SIZES, type DeviceMode, type EditOp, type NewEditOp, type Rect, type ToolMode } from "./canvasTypes";
import {
  applyAll,
  applyOp,
  computedOf,
  findElementsByText,
  isTextEditable,
  rectOf,
  resolveSelector,
  revertOp,
  selectorFor,
  targetLabel,
} from "./domInspector";
import { newOpId, readActiveOps, useCanvasEdits } from "./useCanvasEdits";
import { CanvasStage, FRAME_GAP, STAGE_PADDING, type ChangeRect } from "./CanvasStage";
import { resolveDrop, type DropIndicator, type DropPlacement } from "./dropTarget";
import { ScreenListPanel } from "./ScreenListPanel";
import { PropertyPanel } from "./PropertyPanel";
import { PromptPanel } from "./PromptPanel";
import { CommentPanel, type CommentDraft, type CommentFilter, type ScreenCommentGroup } from "./CommentPanel";
import { ChangeHistoryPanel, type CompareMode } from "./ChangeHistoryPanel";
import { isLocatableSection, shortStamp, useClaudeChanges, useScreenChangeDetail } from "./claudeChanges";
import { shotUrl } from "./screenShots";
import { commentsOfScreen, loadAuthor, saveAuthor, useScreenComments } from "./comments";
import { useGoogleAccount } from "./googleAccount";
import {
  IconCursor,
  IconFit,
  IconMonitor,
  IconPanelLeft,
  IconClose,
  IconComment,
  IconHistory,
  IconRedo,
  IconReload,
  IconScreens,
  IconSparkle,
  IconTablet,
  IconUndo,
  IconZoomIn,
  IconZoomOut,
} from "./CanvasIcons";

/** 左の 1 本のパネルに出せる中身 */
type PanelTab = "screens" | "props" | "comments" | "history" | "prompt";

/** ドラッグ中に画面へ出す情報（要素の移動 / 部品の追加で共通） */
type DragState = {
  kind: "element" | "part";
  /** 動かしているもの（要素名 or 部品名） */
  label: string;
  indicator: DropIndicator | null;
  /** 「〇〇 の前」のような落ちる場所の説明 */
  dropLabel: string | null;
};
const PANEL_LABELS: Record<PanelTab, string> = {
  screens: "画面一覧",
  props: "プロパティ",
  comments: "コメント",
  history: "変更履歴",
  prompt: "プロンプト",
};

const LS_SCREEN = "nq_screen_canvas_screen";

/** 管理画面は PC、アプリはタブレットで表示する */
function deviceFor(screen: ScreenEntry | undefined): DeviceMode {
  return screen?.category === "App" ? "tablet" : "pc";
}

/** PC 表示のときは管理画面（+ 共通ページ）だけ、タブレット表示のときはアプリ画面だけを一覧に出す */
function screensForDevice(device: DeviceMode): ScreenEntry[] {
  return SCREENS.filter((s) => (device === "tablet" ? s.category === "App" : s.category !== "App"));
}

const DEVICE_MODE_LABELS: Record<DeviceMode, { title: string; hint: string }> = {
  pc: { title: "管理画面", hint: "管理画面を PC 幅（1280px）で表示" },
  tablet: { title: "アプリ", hint: "アプリをタブレット縦（768×1024）で表示" },
};
/** 「変わった部分」を選んでいないときに、まとめて囲む数の上限（画面が枠だらけにならないように） */
const MAX_MARKED_SECTIONS = 8;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;

const MemoScreenList = memo(ScreenListPanel);

/** #root に中身が入り、DOM の変化が落ち着くまで待つ（描画途中に編集を当てないため） */
function waitForFrameReady(doc: Document): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now();
    let lastLength = -1;
    let stable = 0;
    const tick = () => {
      const root = doc.getElementById("root");
      const length = root?.innerHTML.length ?? 0;
      if (root && root.children.length > 0 && length === lastLength) stable += 1;
      else stable = 0;
      lastLength = length;
      if (stable >= 2 || Date.now() - started > 6000) resolve();
      else setTimeout(tick, 120);
    };
    tick();
  });
}

function RailButton({
  active,
  title,
  onClick,
  badge,
  children,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`relative size-10 rounded-lg flex items-center justify-center ${
        active ? "bg-[var(--semantic-brand-primary)] text-white" : "text-[var(--semantic-text-primary)] hover:bg-[#ececec]"
      }`}
    >
      {children}
      {badge ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[10px] flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/** パネル上部の見出し。× で閉じられる */
function PanelHeader({ title, onClose, side }: { title: string; onClose: () => void; side: "left" | "right" }) {
  return (
    <div className={`h-11 shrink-0 flex items-center gap-1 px-2 border-b border-[#e5e5e5] ${side === "right" ? "flex-row-reverse" : ""}`}>
      <span className="flex-1 min-w-0 px-1 text-xs font-bold text-[var(--semantic-text-primary)] truncate">{title}</span>
      <button
        type="button"
        title="パネルを閉じる"
        onClick={onClose}
        className="size-7 shrink-0 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#ececec]"
      >
        <IconClose width={16} height={16} />
      </button>
    </div>
  );
}

function ToolButton({ active, title, onClick, disabled, children }: { active?: boolean; title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`h-8 min-w-8 px-1.5 rounded-md flex items-center justify-center gap-1 text-xs disabled:opacity-30 ${
        active ? "bg-[var(--semantic-brand-primary)] text-white" : "text-[var(--semantic-text-primary)] hover:bg-[#ececec]"
      }`}
    >
      {children}
    </button>
  );
}

export function ScreenCanvasPage() {
  // キャンバス自身を iframe に読み込んでしまったとき（無限に入れ子になる）の保険
  if (window.self !== window.top) {
    return (
      <div className="w-full h-full flex flex-col">
        <PageTitleBar title="変更履歴" />
        <p className="p-6 text-[var(--semantic-text-secondary)]">変更履歴キャンバスはキャンバス内では開けません。</p>
      </div>
    );
  }
  return <ScreenCanvas />;
}

function ScreenCanvas() {
  // コメント一覧からは ?screen=<画面ID>&comment=<コメントID> で開かれる
  const [searchParams] = useSearchParams();
  const requestedScreenId = searchParams.get("screen");
  const requestedCommentId = searchParams.get("comment");

  const [screenId, setScreenId] = useState<string | undefined>(() => {
    if (requestedScreenId && SCREENS.some((s) => s.id === requestedScreenId)) return requestedScreenId;
    const saved = localStorage.getItem(LS_SCREEN);
    return SCREENS.some((s) => s.id === saved) ? saved! : SCREENS[0]?.id;
  });
  const screen = useMemo(() => SCREENS.find((s) => s.id === screenId), [screenId]);
  const [frameSrc, setFrameSrc] = useState(() => SCREENS.find((s) => s.id === screenId)?.route ?? "/admin/home");
  const [iframeKey, setIframeKey] = useState(0);
  const [device, setDevice] = useState<DeviceMode>(() => deviceFor(SCREENS.find((s) => s.id === screenId)));
  const [zoom, setZoom] = useState(0.5);
  const [tool, setTool] = useState<ToolMode>("select");
  // パネルは左の 1 本だけ。レールのアイコンで中身を切り替える。
  // コメントを見に来たときはコメント、それ以外は変更履歴から始める。
  const [panel, setPanel] = useState<PanelTab | null>(requestedCommentId ? "comments" : "history");
  const [doc, setDoc] = useState<Document | null>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  // 右に何を並べるか（変更前のスクリーンショット / ピクセル差分 / 並べない）
  const [compare, setCompare] = useState<CompareMode>("before");
  // 編集した要素を赤枠で囲って、どこを変えたか分かるようにする
  const [showEdited, setShowEdited] = useState(true);
  // Claude が変えた箇所（編集追跡の記録）をオレンジ枠で囲む
  const [showChanges, setShowChanges] = useState(true);
  /** 変更履歴パネルで選んだ「変わった部分」。選ぶとその場所だけ強調する */
  const [activeSection, setActiveSection] = useState<string | null>(null);
  /** 今 iframe に表示されている実際のパス（操作モードで遷移したときも追う。Before 側はこれを読む） */
  const [livePath, setLivePath] = useState(() => SCREENS.find((s) => s.id === screenId)?.route ?? "/admin/home");

  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const beforeFrameRef = useRef<HTMLIFrameElement | null>(null);
  const toolRef = useRef(tool);
  const selectedRef = useRef<HTMLElement | null>(null);
  const selectedSelectorRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const lastPathRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const screenIdRef = useRef(screenId);
  const commitRef = useRef<(partial: NewEditOp) => void>(() => {});
  /** 今まさに落ちる場所（描画用の state とは別に、最新値を同期で読むため ref でも持つ） */
  const dropPlacementRef = useRef<DropPlacement | null>(null);
  /** iframe の中で始まったドラッグを、外側（キャンバス上でマウスを離した等）から終わらせる */
  const endElementDragRef = useRef<((commit: boolean) => void) | null>(null);

  const edits = useCanvasEdits(screenId);

  // ---- Claude が変えた箇所（編集追跡システムの記録）----------------------------

  const changes = useClaudeChanges();
  const change = screenId ? changes.byId.get(screenId) : undefined;
  const { detail: changeDetail } = useScreenChangeDetail(screenId, changes.stamp);
  const screensById = useMemo(() => new Map(SCREENS.map((s) => [s.id, s])), []);

  // ---- コメント ---------------------------------------------------------------

  const commentStore = useScreenComments();
  const [draft, setDraft] = useState<CommentDraft | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(requestedCommentId);
  const [commentFilter, setCommentFilter] = useState<CommentFilter>("open");
  const matchesFilter = useCallback(
    (resolved: boolean) => commentFilter === "all" || (commentFilter === "resolved" ? resolved : !resolved),
    [commentFilter]
  );
  const [author, setAuthor] = useState(loadAuthor);
  const google = useGoogleAccount();
  /** 実際にコメントへ入れる名前。Google でログインしていればその名前、なければ手入力 */
  const effectiveAuthor = google.configured && google.account ? google.account.name : author.trim();
  const startCommentRef = useRef<(draft: CommentDraft) => void>(() => {});

  const screenComments = useMemo(
    () => commentsOfScreen(commentStore.comments, screenId).map((comment, i) => ({ comment, n: i + 1 })),
    [commentStore.comments, screenId]
  );
  const shownComments = useMemo(
    () => screenComments.filter(({ comment }) => matchesFilter(comment.resolved)),
    [screenComments, matchesFilter]
  );
  const openCommentCount = screenComments.filter(({ comment }) => !comment.resolved).length;

  // 今の表示モード（管理画面 / アプリ）の、他の画面のコメントを画面ごとにまとめる（新しい順）
  const otherCommentGroups = useMemo<ScreenCommentGroup[]>(() => {
    const groups: ScreenCommentGroup[] = [];
    for (const s of screensForDevice(device)) {
      if (s.id === screenId) continue;
      const items = commentsOfScreen(commentStore.comments, s.id)
        .map((comment, i) => ({ comment, n: i + 1 }))
        .filter(({ comment }) => matchesFilter(comment.resolved));
      if (items.length > 0) groups.push({ screen: s, items });
    }
    const latest = (g: ScreenCommentGroup) => Math.max(...g.items.map((i) => i.comment.createdAt));
    return groups.sort((a, b) => latest(b) - latest(a));
  }, [device, screenId, commentStore.comments, matchesFilter]);
  const resolvedCommentCount = screenComments.length - openCommentCount;

  /** 画面をクリックしてピンを立てた（iframe 側の load 時クロージャから呼ばれる） */
  const startComment = useCallback((next: CommentDraft) => {
    setDraft(next);
    setActiveCommentId(null);
    setPanel("comments");
  }, []);
  startCommentRef.current = startComment;

  const saveDraft = useCallback(
    (body: string) => {
      const text = body.trim();
      if (!draft || !screen || !screenId || text === "") return;
      const created = commentStore.add({
        screenId,
        screenTitle: screen.title,
        screenRoute: screen.route,
        screenCategory: screen.category,
        x: draft.x,
        y: draft.y,
        target: draft.target,
        body: text,
        author: effectiveAuthor,
      });
      setDraft(null);
      setActiveCommentId(created.id);
    },
    [draft, screen, screenId, commentStore, effectiveAuthor]
  );

  const changeAuthor = useCallback((name: string) => {
    setAuthor(name);
    saveAuthor(name);
  }, []);

  // 画面を切り替えたら書きかけは捨てる（別の画面にピンが移ってしまわないように）
  useEffect(() => {
    setDraft(null);
  }, [screenId]);

  /**
   * 要素を選んだときにプロパティへ切り替える。
   * ただし画面一覧・コメントを見ているときは、そのまま（見ていたものを消さない）。
   */
  const showProps = useCallback(() => setPanel((t) => (t === "props" || t === "prompt" ? "props" : t)), []);

  useEffect(() => {
    toolRef.current = tool;
    if (tool !== "select") setHovered(null);
  }, [tool]);
  useEffect(() => {
    selectedRef.current = selected;
    selectedSelectorRef.current = selected ? selectorFor(selected) : null;
  }, [selected]);
  useEffect(() => {
    screenIdRef.current = screenId;
    if (screenId) localStorage.setItem(LS_SCREEN, screenId);
  }, [screenId]);
  // 画面が変わったら（一覧から選んだ／操作モードで遷移した）カテゴリに合わせてデバイスを切り替える
  useEffect(() => {
    setDevice(deviceFor(screen));
  }, [screen]);

  /** 変更履歴パネルの「ほかの画面」に出してよい画面（今の表示モードのもの） */
  const visibleChangeIds = useMemo(() => new Set(screensForDevice(device).map((s) => s.id)), [device]);

  // 画面を変えたら、選んでいた「変わった部分」は持ち越さない
  useEffect(() => {
    setActiveSection(null);
  }, [screenId]);

  // 「変わった部分」を選んだら、その場所が見えるところまで画面をスクロールする
  useEffect(() => {
    const d = frameRef.current?.contentDocument;
    if (!activeSection || !d || loading) return;
    const el = findElementsByText(d, activeSection, 1)[0];
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeSection, loading, livePath]);

  /** DOM が動いた・スクロールしたときに枠の位置を描き直す（1 フレームにまとめる） */
  const bump = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setTick((t) => t + 1);
    });
  }, []);

  /**
   * 右に並べる「変更前」。
   * Claude の編集前に撮ったスクリーンショットがあればそれを、無ければ
   * （キャンバスで仮の編集をしているときだけ）編集前の画面を iframe で並べる。
   */
  const beforeImage = useMemo(() => {
    if (!screenId || !change) return null;
    // 撮影幅が端末枠と違うと縮めて出すことになるので、その旨をラベルに出す
    // （画面ごとの幅が記録されていない古い撮影のときだけ、全体の幅で代用する）
    const shotWidth = change.shotWidth ?? changes.index?.shotWidth ?? null;
    const widthNote = shotWidth && shotWidth !== DEVICE_SIZES[device].width ? `・${shotWidth}px 幅` : "";
    if (compare === "before" && change.hasBefore) {
      return { src: shotUrl(screenId, "before"), label: `Before（変更前 ${shortStamp(change.shotAt)} 撮影${widthNote}）` };
    }
    if (compare === "diff" && change.diffRatio !== null) {
      return { src: shotUrl(screenId, "diff"), label: `差分（マゼンタが変わった所${widthNote}）` };
    }
    return null;
  }, [screenId, change, compare, changes.index, device]);
  const beforeFrameSrc = compare === "before" && !beforeImage && edits.cursor > 0 ? livePath : null;
  const beforeVisible = !!beforeImage || !!beforeFrameSrc;
  /** 変更前を並べられるか（撮影済みの絵があるか、キャンバスで編集しているか） */
  const canCompareBefore = !!change?.hasBefore || edits.cursor > 0;

  const fitZoom = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const size = DEVICE_SIZES[device];
    const frames = beforeVisible ? 2 : 1;
    const available = stage.clientWidth - STAGE_PADDING * 2 - FRAME_GAP * (frames - 1);
    const availableH = stage.clientHeight - STAGE_PADDING * 2 - 28;
    const z = Math.min(available / (size.width * frames), availableH / size.height);
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.floor(z * 100) / 100)));
  }, [device, beforeVisible]);

  useEffect(() => {
    fitZoom();
  }, [fitZoom, panel]);

  const zoomBy = useCallback((factor: number) => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * factor * 100) / 100)));
  }, []);

  // ---- 操作（EditOp）の適用 ------------------------------------------------

  const commit = useCallback(
    (partial: NewEditOp) => {
      if (!doc || !screenId) return;
      const op: EditOp = { ...partial, id: newOpId(), at: Date.now(), screenId };
      applyOp(doc, op);
      edits.push(op);
      bump();
    },
    [doc, screenId, edits, bump]
  );
  commitRef.current = commit;

  /** 動かした要素を、落とした場所に入れ直す操作として記録する */
  const commitElementDrop = useCallback((el: HTMLElement, placement: DropPlacement) => {
    const parent = el.parentElement;
    if (!parent) return;
    const fromIndex = Array.prototype.indexOf.call(parent.children, el);
    if (placement.parent === parent) {
      // 同じ親の中の並び替え。自分を抜いたぶん、後ろへ動かすときは 1 つ手前になる
      const toIndex = placement.index > fromIndex ? placement.index - 1 : placement.index;
      if (toIndex === fromIndex) return;
      commitRef.current({
        kind: "move",
        selector: selectorFor(el),
        parentSelector: selectorFor(parent),
        fromIndex,
        toIndex,
        target: targetLabel(el),
      });
      return;
    }
    commitRef.current({
      kind: "reparent",
      selector: selectorFor(el),
      fromParentSelector: selectorFor(parent),
      fromIndex,
      toParentSelector: selectorFor(placement.parent),
      toIndex: placement.index,
      toLabel: placement.label,
      target: targetLabel(el),
    });
  }, []);

  const undo = useCallback(() => {
    const op = edits.ops[edits.cursor - 1];
    if (!op || !doc) return;
    revertOp(doc, op);
    edits.undo();
    bump();
  }, [edits, doc, bump]);

  const redo = useCallback(() => {
    const op = edits.ops[edits.cursor];
    if (!op || !doc) return;
    applyOp(doc, op);
    edits.redo();
    bump();
  }, [edits, doc, bump]);

  const resetEdits = useCallback(() => {
    edits.reset();
    setSelected(null);
    setIframeKey((k) => k + 1);
  }, [edits]);

  // ---- iframe との接続 -------------------------------------------------------

  /** 画面が切り替わった（初回 load / 中で遷移）ときに、その画面の編集を当て直す */
  const syncSeqRef = useRef(0);
  const syncToPath = useCallback(
    async (d: Document, pathname: string) => {
      // 古い呼び出し（about:blank の間に走ったもの等）が待ち終わってから
      // 最新の結果を上書きしないように、最後の呼び出しだけを有効にする
      const seq = ++syncSeqRef.current;
      const matched = findScreenByPathname(pathname);
      const id = matched?.id;
      if (id && id !== screenIdRef.current) setScreenId(id);
      setLivePath(pathname);
      setLoading(true);
      await waitForFrameReady(d);
      if (seq !== syncSeqRef.current) return;
      setLoading(false);
      if (id) {
        const ops = readActiveOps(id);
        const failed = applyAll(d, ops);
        setNotice(failed > 0 ? `${failed} 件の変更は当てる場所が見つかりませんでした（画面の構造が変わった可能性）` : null);
      } else {
        setNotice("この URL は画面一覧に無いページです（編集は記録されません）");
      }
      bump();
    },
    [bump]
  );

  const handleFrameLoad = useCallback(() => {
    cleanupRef.current?.();
    const frame = frameRef.current;
    const d = frame?.contentDocument;
    const w = frame?.contentWindow;
    if (!d || !w) return;
    setDoc(d);
    setSelected(null);
    setHovered(null);

    const isEditing = (t: EventTarget | null) => !!(t as HTMLElement | null)?.isContentEditable;

    // ---- 画面の中で要素をつかんで動かす（タブの並び替えなど）----------------
    // 押した場所を覚えておき、少し動いたらドラッグに切り替える（ただのクリックと区別する）
    let pressed: { el: HTMLElement; x: number; y: number } | null = null;
    let dragged: HTMLElement | null = null;
    let draggedStyle = "";
    let suppressClick = false;

    const updateElementDrag = (e: MouseEvent) => {
      if (!dragged) return;
      const placement = resolveDrop(d, { x: e.clientX, y: e.clientY }, dragged);
      dropPlacementRef.current = placement;
      setDrag((prev) => (prev ? { ...prev, indicator: placement?.indicator ?? null, dropLabel: placement?.label ?? null } : prev));
    };

    const beginElementDrag = (el: HTMLElement, e: MouseEvent) => {
      dragged = el;
      // 掴んでいる要素自身は当たり判定から外す（下にある要素を落とし先にしたい）
      draggedStyle = el.getAttribute("style") ?? "";
      el.style.setProperty("pointer-events", "none");
      el.style.setProperty("opacity", "0.4");
      setSelected(el);
      setHovered(null);
      setDrag({ kind: "element", label: targetLabel(el), indicator: null, dropLabel: null });
      updateElementDrag(e);
    };

    const endElementDrag = (commitDrop: boolean) => {
      const el = dragged;
      const placement = dropPlacementRef.current;
      dragged = null;
      dropPlacementRef.current = null;
      setDrag(null);
      if (!el) return;
      // 掴んでいる間だけ当てていた見た目を元に戻す（編集としては記録しない）
      if (draggedStyle) el.setAttribute("style", draggedStyle);
      else el.removeAttribute("style");
      if (commitDrop && placement) commitElementDrop(el, placement);
      bump();
    };
    endElementDragRef.current = endElementDrag;

    const onMove = (e: MouseEvent) => {
      if (dragged) return updateElementDrag(e);
      if (pressed && (Math.abs(e.clientX - pressed.x) > 4 || Math.abs(e.clientY - pressed.y) > 4)) {
        const el = pressed.el;
        pressed = null;
        beginElementDrag(el, e);
        return;
      }
      if (toolRef.current !== "select") return;
      const t = e.target as HTMLElement;
      if (!t || t.nodeType !== 1 || t === selectedRef.current) return setHovered(null);
      setHovered(t);
    };
    const onUp = () => {
      pressed = null;
      if (!dragged) return;
      suppressClick = true;
      endElementDrag(true);
    };
    const onDown = (e: MouseEvent) => {
      if (toolRef.current === "select" && isEditing(e.target)) return;
      // コメントモードでは、下のボタンやリンクが反応しないように止める
      e.preventDefault();
      e.stopPropagation();
      if (toolRef.current !== "select" || e.button !== 0) return;
      const t = e.target as HTMLElement | null;
      if (!t || t.nodeType !== 1 || t.id === "root" || !t.parentElement) return;
      // すでに選んである要素の上で押したときは、その要素ごと動かす
      const selected = selectedRef.current;
      const el = selected && d.contains(selected) && selected.contains(t) ? selected : t;
      if (el.id === "root" || !el.parentElement) return;
      pressed = { el, x: e.clientX, y: e.clientY };
    };
    const onClick = (e: MouseEvent) => {
      if (suppressClick) {
        // ドラッグの終わりに出るクリックで選択が変わってしまわないようにする
        suppressClick = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (toolRef.current === "comment") {
        e.preventDefault();
        e.stopPropagation();
        const t = e.target as HTMLElement | null;
        startCommentRef.current({
          // 画面をスクロールしても同じ場所に残るよう、ドキュメント座標で覚える
          x: Math.round(e.clientX + w.scrollX),
          y: Math.round(e.clientY + w.scrollY),
          target: t && t.nodeType === 1 && t.id !== "root" ? targetLabel(t) : "画面",
        });
        return;
      }
      if (toolRef.current !== "select" || isEditing(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const t = e.target as HTMLElement;
      if (!t || t.nodeType !== 1) return;
      setSelected(t.id === "root" ? null : t);
      setHovered(null);
      showProps();
    };
    const onDblClick = (e: MouseEvent) => {
      if (toolRef.current !== "select") return;
      e.preventDefault();
      e.stopPropagation();
      const t = e.target as HTMLElement;
      if (t && isTextEditable(t)) beginInlineEdit(t);
    };
    const onLeave = () => setHovered(null);
    const onScroll = () => {
      bump();
      // Before（編集前）の画面も同じ位置までスクロールして、同じ場所を見比べられるようにする
      const before = beforeFrameRef.current?.contentWindow;
      if (before && before.location.pathname === w.location.pathname) before.scrollTo(w.scrollX, w.scrollY);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dragged) {
        e.preventDefault();
        endElementDrag(false);
      }
    };
    const observer = new w.MutationObserver(() => {
      bump();
      const sel = selectedRef.current;
      if (sel && !d.contains(sel)) {
        const again = selectedSelectorRef.current ? resolveSelector(d, selectedSelectorRef.current) : null;
        setSelected(again);
      }
    });

    d.addEventListener("mousemove", onMove, true);
    d.addEventListener("mousedown", onDown, true);
    d.addEventListener("mouseup", onUp, true);
    d.addEventListener("keydown", onKeyDown, true);
    d.addEventListener("click", onClick, true);
    d.addEventListener("dblclick", onDblClick, true);
    d.addEventListener("scroll", onScroll, true);
    d.documentElement.addEventListener("mouseleave", onLeave);
    w.addEventListener("resize", onScroll);
    if (d.body) observer.observe(d.body, { subtree: true, childList: true, attributes: true, characterData: true });

    cleanupRef.current = () => {
      endElementDrag(false);
      endElementDragRef.current = null;
      d.removeEventListener("mousemove", onMove, true);
      d.removeEventListener("mousedown", onDown, true);
      d.removeEventListener("mouseup", onUp, true);
      d.removeEventListener("keydown", onKeyDown, true);
      d.removeEventListener("click", onClick, true);
      d.removeEventListener("dblclick", onDblClick, true);
      d.removeEventListener("scroll", onScroll, true);
      d.documentElement.removeEventListener("mouseleave", onLeave);
      w.removeEventListener("resize", onScroll);
      observer.disconnect();
    };

    lastPathRef.current = w.location.pathname;
    void syncToPath(d, w.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bump, syncToPath, commitElementDrop]);

  // 「操作」モードで iframe 内を遷移したときに追従する
  useEffect(() => {
    const timer = setInterval(() => {
      const w = frameRef.current?.contentWindow;
      const d = frameRef.current?.contentDocument;
      if (!w || !d) return;
      // まだ読み込み前（about:blank）のときは画面として扱わない
      if (w.location.href === "about:blank" || !d.getElementById("root")) return;
      const p = w.location.pathname;
      if (p !== lastPathRef.current) {
        lastPathRef.current = p;
        setSelected(null);
        void syncToPath(d, p);
      }
    }, 400);
    return () => clearInterval(timer);
  }, [syncToPath]);

  useEffect(() => () => cleanupRef.current?.(), []);

  // コメントモードのあいだは、iframe の中も十字カーソルにする（ボタンの指マークを出さない）
  useEffect(() => {
    if (!doc || tool !== "comment") return;
    const style = doc.createElement("style");
    style.textContent = "*{cursor:crosshair !important}";
    doc.head?.appendChild(style);
    return () => style.remove();
  }, [doc, tool]);

  // コメント一覧から飛んできた / ピンを選んだときに、そのピンが見えるところまでスクロールする
  useEffect(() => {
    if (!activeCommentId || loading) return;
    const target = screenComments.find(({ comment }) => comment.id === activeCommentId)?.comment;
    const w = frameRef.current?.contentWindow;
    if (!target || !w) return;
    const top = w.scrollY;
    const bottom = top + w.innerHeight;
    if (target.y < top + 40 || target.y > bottom - 40) {
      w.scrollTo({ top: Math.max(0, target.y - w.innerHeight / 3), behavior: "smooth" });
    }
    setPanel((t) => t ?? "comments");
  }, [activeCommentId, loading, screenComments]);

  /** ダブルクリックでその場でテキスト編集 */
  function beginInlineEdit(el: HTMLElement) {
    const before = el.textContent ?? "";
    let cancelled = false;
    el.contentEditable = "true";
    el.focus();
    const range = el.ownerDocument.createRange();
    range.selectNodeContents(el);
    const sel = el.ownerDocument.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        el.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelled = true;
        el.blur();
      }
    };
    const onBlur = () => {
      el.removeEventListener("keydown", onKey);
      el.contentEditable = "false";
      el.removeAttribute("contenteditable");
      const after = el.textContent ?? "";
      if (cancelled || after === before) {
        el.textContent = before;
        return;
      }
      // load 時のクロージャから呼ばれるので、最新の commit を ref 経由で使う
      commitRef.current({ kind: "text", selector: selectorFor(el), before, after, target: targetLabel(el) });
    };
    el.addEventListener("keydown", onKey);
    el.addEventListener("blur", onBlur, { once: true });
  }

  // ---- 画面の切り替え ----------------------------------------------------------

  const selectScreen = useCallback(
    (s: ScreenEntry) => {
      setScreenId(s.id);
      setSelected(null);
      setHovered(null);
      setNotice(null);
      if (s.route === frameSrc) setIframeKey((k) => k + 1);
      else setFrameSrc(s.route);
    },
    [frameSrc]
  );

  /** ツールバーの PC / タブレット切替。反対側の画面を見ていたら、その側の最初の画面に移る */
  const switchDevice = useCallback(
    (d: DeviceMode) => {
      if (screen && deviceFor(screen) !== d) {
        const first = screensForDevice(d)[0];
        if (first) selectScreen(first);
        return;
      }
      setDevice(d);
    },
    [screen, selectScreen]
  );

  const reloadFrame = useCallback(() => {
    setSelected(null);
    setHovered(null);
    if (screen && screen.route !== frameSrc) setFrameSrc(screen.route);
    else setIframeKey((k) => k + 1);
  }, [screen, frameSrc]);

  // ---- プロパティパネルからの操作 ---------------------------------------------------

  function withSelected(fn: (el: HTMLElement, parent: HTMLElement, index: number) => void) {
    const el = selected;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    fn(el, parent, Array.prototype.indexOf.call(parent.children, el));
  }

  const actions = {
    onStyle: (prop: string, value: string) =>
      withSelected((el) =>
        commit({
          kind: "style",
          selector: selectorFor(el),
          prop,
          inlineBefore: el.style.getPropertyValue(prop),
          computedBefore: computedOf(el, prop),
          after: value,
          target: targetLabel(el),
        })
      ),
    onText: (value: string) =>
      withSelected((el) => commit({ kind: "text", selector: selectorFor(el), before: el.textContent ?? "", after: value, target: targetLabel(el) })),
    onAttr: (name: string, value: string | null) =>
      withSelected((el) =>
        commit({ kind: "attr", selector: selectorFor(el), name, before: el.getAttribute(name), after: value, target: targetLabel(el) })
      ),
    onHide: () =>
      withSelected((el) => {
        commit({ kind: "hide", selector: selectorFor(el), inlineBefore: el.style.display, target: targetLabel(el) });
        setSelected(null);
      }),
    onRemove: () =>
      withSelected((el, parent, index) => {
        commit({ kind: "remove", selector: selectorFor(el), parentSelector: selectorFor(parent), index, html: el.outerHTML, target: targetLabel(el) });
        setSelected(null);
      }),
    onDuplicate: () =>
      withSelected((el, parent, index) => {
        commit({
          kind: "insert",
          parentSelector: selectorFor(parent),
          index: index + 1,
          html: el.outerHTML,
          partLabel: `複製: ${targetLabel(el)}`,
          target: targetLabel(parent),
        });
        const inserted = parent.children[index + 1] as HTMLElement | undefined;
        if (inserted) setSelected(inserted);
      }),
    onMove: (dir: -1 | 1) =>
      withSelected((el, parent, index) => {
        const to = index + dir;
        if (to < 0 || to >= parent.children.length) return;
        commit({ kind: "move", selector: selectorFor(el), parentSelector: selectorFor(parent), fromIndex: index, toIndex: to, target: targetLabel(el) });
      }),
    onSelectParent: () =>
      withSelected((_el, parent) => {
        if (parent.id !== "root") setSelected(parent);
      }),
  };

  // iframe の外（パネルやツールバーの上）でマウスを離したときも、掴んだままにしない
  useEffect(() => {
    if (drag?.kind !== "element") return;
    const onUp = () => endElementDragRef.current?.(true);
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, [drag]);

  // ---- キーボードショートカット -------------------------------------------------------

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      const meta = e.metaKey || e.ctrlKey;
      // パネルの開閉（⌘⌥[ / ⌘⌥]）
      if (meta && e.altKey && (e.key === "[" || e.code === "BracketLeft")) {
        e.preventDefault();
        setPanel((t) => (t ? null : "screens"));
        return;
      }
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (meta) return;
      switch (e.key) {
        case "v":
        case "V":
          setTool("select");
          break;
        case "c":
        case "C":
          setTool("comment");
          setPanel("comments");
          break;
        case "Escape":
          // 書きかけのコメントがあるなら、まずそれをやめる
          if (draft) setDraft(null);
          else setSelected(null);
          break;
        case "Backspace":
        case "Delete":
          if (selected) {
            e.preventDefault();
            actions.onRemove();
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, selected, doc, draft]);

  // ---- 描画 -----------------------------------------------------------------------

  const visibleScreens = useMemo(() => screensForDevice(device), [device]);
  const liveSelected = selected && doc?.contains(selected) ? selected : null;
  const liveHovered = hovered && doc?.contains(hovered) && hovered !== liveSelected ? hovered : null;
  const selectRect = liveSelected ? rectOf(liveSelected) : null;
  const hoverRect = liveHovered ? rectOf(liveHovered) : null;
  const selectLabel = liveSelected ? targetLabel(liveSelected) : "";

  // 編集した要素の枠。操作ごとに対象要素を引き直す（消した要素は残らないので出ない）
  const editedRects: Rect[] = [];
  if (showEdited && doc) {
    const seen = new Set<Element>();
    for (const op of edits.activeOps) {
      let el: Element | null = null;
      if (op.kind === "insert" || op.kind === "move") {
        el = resolveSelector(doc, op.parentSelector)?.children[op.kind === "insert" ? op.index : op.toIndex] ?? null;
      } else if (op.kind === "reparent") {
        el = resolveSelector(doc, op.toParentSelector)?.children[op.toIndex] ?? null;
      } else if (op.kind !== "remove") {
        el = resolveSelector(doc, op.selector);
      }
      if (!el || seen.has(el) || !doc.contains(el)) continue;
      seen.add(el);
      const r = rectOf(el);
      if (r.width > 0 && r.height > 0) editedRects.push(r);
    }
  }

  // Claude が変えた箇所の枠。記録に残っている「変わった部分」の文字を画面から探して囲む。
  // 探すのは重いので、画面・記録・選んだ部分が変わったときだけ引き直し、位置は毎回取り直す。
  const changeTargets = useMemo(() => {
    if (!showChanges || !doc || !changeDetail || loading) return [] as { el: HTMLElement; label: string; active: boolean }[];
    const sections = changeDetail.sections.filter(isLocatableSection);
    const picked = activeSection ? sections.filter((x) => x.name === activeSection) : sections.slice(0, MAX_MARKED_SECTIONS);
    const out: { el: HTMLElement; label: string; active: boolean }[] = [];
    const seen = new Set<HTMLElement>();
    for (const section of picked) {
      for (const el of findElementsByText(doc, section.name, activeSection ? 12 : 4)) {
        if (seen.has(el)) continue;
        seen.add(el);
        out.push({ el, label: section.name, active: activeSection === section.name });
      }
    }
    return out;
    // livePath / iframeKey が変わると DOM ごと入れ替わるので、そのときも引き直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChanges, doc, changeDetail, activeSection, loading, livePath, iframeKey]);

  const changeRects: ChangeRect[] = [];
  changeTargets.forEach((t, i) => {
    if (!doc?.contains(t.el)) return;
    const r = rectOf(t.el);
    if (r.width <= 0 || r.height <= 0) return;
    changeRects.push({ key: `${t.label}:${i}`, rect: r, label: t.label, active: t.active });
  });

  // ピンはドキュメント座標で持っているので、今のスクロール量を引いて表示位置にする
  const frameWindow = frameRef.current?.contentWindow;
  const frameScrollX = frameWindow?.scrollX ?? 0;
  const frameScrollY = frameWindow?.scrollY ?? 0;

  /**
   * 撮影したピクセル差分の位置。撮影と同じ幅で見ているときだけ重ねる
   * （タブレット表示は 1280px 幅で撮った絵なので位置が合わない）。
   */
  const diffRects: Rect[] =
    compare === "diff" && changeDetail && (changeDetail.shotWidth ?? changes.index?.shotWidth) === DEVICE_SIZES[device].width
      ? changeDetail.diffBoxes.map((b) => ({ x: b.x, y: b.y - frameScrollY, width: b.w, height: b.h }))
      : [];
  const pins = shownComments.map(({ comment, n }) => ({
    id: comment.id,
    n,
    x: comment.x - frameScrollX,
    y: comment.y - frameScrollY,
    resolved: comment.resolved,
    active: comment.id === activeCommentId,
  }));
  const draftPin = draft ? { x: draft.x - frameScrollX, y: draft.y - frameScrollY } : null;

  const panelBody =
    panel === "screens" ? (
      <MemoScreenList
        screens={visibleScreens}
        activeId={screenId}
        counts={edits.countsByScreen}
        commentCounts={commentStore.countsByScreen}
        onSelect={selectScreen}
      />
    ) : panel === "props" ? (
      <PropertyPanel el={liveSelected} screen={screen} actions={actions} />
    ) : panel === "comments" ? (
      <CommentPanel
        screen={screen}
        items={shownComments}
        openCount={openCommentCount}
        resolvedCount={resolvedCommentCount}
        filter={commentFilter}
        onFilterChange={setCommentFilter}
        author={author}
        onAuthorChange={changeAuthor}
        google={google}
        draft={draft}
        onSaveDraft={saveDraft}
        onCancelDraft={() => setDraft(null)}
        activeId={activeCommentId}
        onSelect={setActiveCommentId}
        onUpdateBody={(id, body) => commentStore.update(id, { body })}
        onToggleResolved={(comment) => commentStore.update(comment.id, { resolved: !comment.resolved })}
        onRemove={(id) => {
          commentStore.remove(id);
          setActiveCommentId((current) => (current === id ? null : current));
        }}
        onStartCommentMode={() => setTool("comment")}
        commentMode={tool === "comment"}
        otherGroups={otherCommentGroups}
        otherLabel={DEVICE_MODE_LABELS[device].title}
        onJump={(s, commentId) => {
          selectScreen(s);
          setActiveCommentId(commentId);
        }}
      />
    ) : panel === "history" ? (
      <ChangeHistoryPanel
        screen={screen}
        screensById={screensById}
        index={changes.index}
        loading={changes.loading}
        onReload={changes.reload}
        change={change}
        detail={changeDetail}
        activeSection={activeSection}
        onSelectSection={(name) => {
          setActiveSection(name);
          if (name) setShowChanges(true);
        }}
        compare={compare}
        onCompareChange={setCompare}
        deviceLabel={DEVICE_MODE_LABELS[device].title}
        visibleIds={visibleChangeIds}
        onJump={selectScreen}
      />
    ) : panel === "prompt" ? (
      <PromptPanel screen={screen} ops={edits.ops} cursor={edits.cursor} onToggleDone={edits.setDone} onReset={resetEdits} />
    ) : null;

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <PageTitleBar
        title="変更履歴"
        action={
          <span className="text-sm font-normal text-[var(--semantic-text-secondary)]">
            Claude が変えた箇所を実画面の上で確認し、変更前と見比べられます
          </span>
        }
      />
      <div className="flex flex-1 min-h-0 bg-[#f4f4f4] text-[var(--semantic-text-primary)]">
        {/* 左レール */}
        <div className="w-12 shrink-0 flex flex-col items-center gap-1 py-2 bg-white border-r border-[#e5e5e5]">
          <RailButton
            active={false}
            title={panel ? "パネルを閉じる (⌘⌥[)" : "パネルを開く (⌘⌥[)"}
            onClick={() => setPanel((t) => (t ? null : "screens"))}
          >
            <IconPanelLeft />
          </RailButton>
          <span className="w-6 h-px bg-[#e5e5e5] my-1" />
          <RailButton active={panel === "screens"} title="画面一覧" onClick={() => setPanel((t) => (t === "screens" ? null : "screens"))}>
            <IconScreens />
          </RailButton>
          {/* レールの履歴マークは Claude の変更履歴。キャンバスのピンコメントは
              下のツールバーの「コメント」から今まで通り開く */}
          <RailButton
            active={panel === "history"}
            title="変更履歴（Claude が変えた箇所）"
            badge={change?.level === "direct" ? change.sectionTotal || undefined : undefined}
            onClick={() => setPanel((t) => (t === "history" ? null : "history"))}
          >
            <IconHistory />
          </RailButton>
          <RailButton
            active={panel === "prompt"}
            title="プロンプト"
            badge={edits.cursor || undefined}
            onClick={() => setPanel((t) => (t === "prompt" ? null : "prompt"))}
          >
            <IconSparkle />
          </RailButton>
        </div>
        {panel && (
          <aside className="w-[300px] shrink-0 bg-white border-r border-[#e5e5e5] flex flex-col min-h-0">
            <PanelHeader
              title={panel === "screens" ? `${DEVICE_MODE_LABELS[device].title}の画面一覧` : PANEL_LABELS[panel]}
              onClose={() => setPanel(null)}
              side="left"
            />
            <div className={`flex-1 min-h-0 flex flex-col ${panel === "props" ? "overflow-y-auto" : ""}`}>{panelBody}</div>
          </aside>
        )}

        {/* 中央 */}
        <section className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="h-11 shrink-0 flex items-center gap-1 px-2 bg-white border-b border-[#e5e5e5]">
            <ToolButton active={tool === "select"} title="選択 (V)" onClick={() => setTool("select")}>
              <IconCursor />
            </ToolButton>
            <ToolButton
              active={tool === "comment"}
              title="コメント (C): 画面をクリックするとその場所にピンを立てられます"
              onClick={() => {
                setTool("comment");
                setPanel("comments");
              }}
            >
              <IconComment />
            </ToolButton>
            <span className="w-px h-5 bg-[#e5e5e5] mx-1" />
            <ToolButton title="元に戻す (⌘Z)" onClick={undo} disabled={!edits.canUndo}>
              <IconUndo />
            </ToolButton>
            <ToolButton title="やり直す (⇧⌘Z)" onClick={redo} disabled={!edits.canRedo}>
              <IconRedo />
            </ToolButton>
            <ToolButton title="画面を再読み込み（編集は当て直されます）" onClick={reloadFrame}>
              <IconReload />
            </ToolButton>
            <span className="w-px h-5 bg-[#e5e5e5] mx-1" />
            <ToolButton
              active={showChanges && !!change}
              disabled={!change}
              title={
                change
                  ? "Claude が変えた箇所をオレンジ枠で囲む（変更履歴の記録から）"
                  : "この画面は今の記録では変わっていません"
              }
              onClick={() => setShowChanges((v) => !v)}
            >
              <span className="whitespace-nowrap px-0.5">変更箇所</span>
            </ToolButton>
            <ToolButton
              active={showEdited && edits.cursor > 0}
              disabled={edits.cursor === 0}
              title="このキャンバスで仮に編集した場所を赤枠で囲む"
              onClick={() => setShowEdited((v) => !v)}
            >
              <span className="whitespace-nowrap px-0.5">編集箇所</span>
            </ToolButton>
            <ToolButton
              active={compare === "before" && beforeVisible}
              disabled={!canCompareBefore}
              title={
                change?.hasBefore
                  ? `Claude が変える前に撮った画面（${shortStamp(change.shotAt)}）を右に並べる`
                  : edits.cursor > 0
                  ? "このキャンバスで編集する前の画面を右に並べる"
                  : "この画面の変更前スクリーンショットがまだありません"
              }
              onClick={() => setCompare((m) => (m === "before" ? "none" : "before"))}
            >
              <span className="whitespace-nowrap px-0.5">変更前</span>
            </ToolButton>
            <ToolButton
              active={compare === "diff" && beforeVisible}
              disabled={!change || change.diffRatio === null}
              title={
                change && change.diffRatio !== null
                  ? `変更前と変更後のピクセル差分を右に並べる${change.diffShift ? `（${change.diffShift}px ずれ）` : ""}`
                  : "この画面のピクセル差分がまだありません"
              }
              onClick={() => setCompare((m) => (m === "diff" ? "none" : "diff"))}
            >
              <span className="whitespace-nowrap px-0.5">差分</span>
            </ToolButton>
            <span className="flex-1 min-w-0 px-2 text-xs text-[var(--semantic-text-secondary)] truncate text-center">
              {drag
                ? drag.dropLabel
                  ? `${drag.label} → ${drag.dropLabel}`
                  : `${drag.label} を掴んでいます（落とせる場所を探しています）`
                : loading
                ? "読み込み中…"
                : notice ??
                  (tool === "select"
                    ? "要素をクリックで選択・ダブルクリックで文字を編集"
                    : "コメントしたい場所をクリックしてピンを立てる")}
            </span>
            <span className="w-px h-5 bg-[#e5e5e5] mx-1" />
            {(Object.keys(DEVICE_SIZES) as DeviceMode[]).map((d) => (
              <ToolButton key={d} active={device === d} title={DEVICE_MODE_LABELS[d].hint} onClick={() => switchDevice(d)}>
                {d === "pc" ? <IconMonitor /> : <IconTablet />}
                <span className="hidden xl:inline whitespace-nowrap">{DEVICE_MODE_LABELS[d].title}</span>
              </ToolButton>
            ))}
            <span className="w-px h-5 bg-[#e5e5e5] mx-1" />
            <ToolButton title="縮小" onClick={() => zoomBy(1 / 1.2)}>
              <IconZoomOut />
            </ToolButton>
            <span className="w-11 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
            <ToolButton title="拡大" onClick={() => zoomBy(1.2)}>
              <IconZoomIn />
            </ToolButton>
            <ToolButton title="画面に合わせる" onClick={fitZoom}>
              <IconFit />
            </ToolButton>
          </div>
          <CanvasStage
            stageRef={stageRef}
            frameRef={frameRef}
            frameSrc={frameSrc}
            iframeKey={iframeKey}
            onFrameLoad={handleFrameLoad}
            device={device}
            zoom={zoom}
            tool={tool}
            title={screen?.title ?? ""}
            hoverRect={hoverRect}
            selectRect={selectRect}
            selectLabel={selectLabel}
            onZoomBy={zoomBy}
            dropIndicator={drag?.indicator ?? null}
            editedRects={editedRects}
            changeRects={changeRects}
            diffRects={diffRects}
            beforeSrc={beforeFrameSrc}
            beforeImage={beforeImage ? { ...beforeImage, offsetY: frameScrollY } : null}
            beforeFrameRef={beforeFrameRef}
            pins={pins}
            draftPin={draftPin}
            onPinClick={(id) => {
              setActiveCommentId(id);
              setDraft(null);
              setPanel("comments");
            }}
          />
        </section>

      </div>
    </div>
  );
}
