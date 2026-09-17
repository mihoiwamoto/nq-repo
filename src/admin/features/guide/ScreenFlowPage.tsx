/**
 * 画面遷移図。
 * NQ の全画面（管理画面・アプリ）を、帳票ごとに「一覧 → 詳細 → 編集」のような
 * 遷移ツリーとして俯瞰できる。ノードは撮影済みスクリーンショット（無ければ役割だけのカード）、
 * 矢印はソースの navigate / <Link> から抜き出した遷移（virtual:screen-flow-edges）。
 * ノードをクリックすると、その画面だけをポップアップ（実寸の iframe）で開く。
 * 前の画面から入力内容（location.state）を受け取る確認画面には、見本の state を差し込んで中身を出す。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { CATEGORY_LABELS, SCREENS, type ScreenEntry } from "./screenCatalog";
import { FLOW_ROLE_CLASS, FLOW_ROLE_LABEL, buildFlowSections, type FlowEdge, type FlowModule, type FlowNode, type FlowRole } from "./screenFlow";
import { applyPreviewState } from "./screenPreviewState";
import { ScreenThumb } from "./screenShots";
import { DEVICE_SIZES, type DeviceMode } from "./canvasTypes";
import { IconClose, IconExternal, IconMonitor, IconSearch, IconTablet, IconZoomIn, IconZoomOut } from "./CanvasIcons";
import iconArrowDown from "@images/Icon/arrow_down.svg";
import iconArrowUp from "@images/Icon/arrow_up.svg";

type DeviceFilter = "all" | "pc" | "tablet";

const DEVICE_FILTERS: { key: DeviceFilter; label: string; hint: string }[] = [
  { key: "all", label: "すべて", hint: "管理画面とアプリを両方表示" },
  { key: "pc", label: "管理画面", hint: "管理画面（PC 幅 1280px の実画面）だけ表示" },
  { key: "tablet", label: "アプリ", hint: "アプリ（タブレット縦 768×1024 の実画面）だけ表示" },
];

/**
 * 遷移図に出さない画面。
 *
 * `ComingSoonPage` は「準備中」の中身を描く共通部品で、単体で開ける URL を持たない。
 * App.tsx では `path={item.path.replace(...)}` と式で組み立てているため画面マップの
 * ルート解析が拾えず、親レイアウトの `/admin` `/app` が割り当たってしまう。
 * その URL を開くとホーム（帳票一覧）へリダイレクトするので、「準備中」と書かれた
 * ノードにホーム画面が出ていた。
 *
 * 残り 3 つは「まだ専用画面が無い帳票を開いたとき」の逃がし先で、準備中の中身を描くのもこれ。
 * ただし `data/ledgers.ts` の 10 帳票はすべて専用ルートを持つので、今はどこからも到達しない。
 * 遷移図に残すと「帳票管理 → 帳票詳細（準備中）」のような実際には起きない遷移に見えるので外す。
 * 帳票が増えて専用画面が間に合わないときは、ここから該当行を消せばまた出る。
 */
const HIDDEN_FILES = new Set([
  "src/pages/ComingSoonPage.tsx",
  "src/admin/pages/AdminLedgerDetailPage.tsx",
  "src/admin/pages/ConfirmationDataListPlaceholderPage.tsx",
  "src/app/pages/AppLedgerDetailPage.tsx",
]);

/** 帳票が追加されたバージョンごとのチップの色（画面一覧パネルと揃える） */
const VERSION_CHIP_CLASS: Record<string, string> = {
  "Ver.1.0": "bg-[#fdefe0] text-[#d97316]",
  "Ver.1.5": "bg-[#f1ebfd] text-[#7c4dcc]",
  "Ver.2.0": "bg-[#e7f1fe] text-[#2f7fd4]",
  "Ver.3.0": "bg-[#fdeaea] text-[var(--semantic-brand-danger)]",
  "Ver.4.0": "bg-[#e6f4ec] text-[var(--semantic-brand-primary)]",
};
const VERSION_ORDER = ["Ver.4.0", "Ver.3.0", "Ver.2.0", "Ver.1.5", "Ver.1.0"];

/** 凡例に出す役割（並び順） */
const LEGEND_ROLES: FlowRole[] = ["list", "detail", "new", "edit", "confirm", "complete", "approve", "delete-confirm", "settings", "other"];

// ノードの寸法。
// ノードには実画面を iframe で読み込み、その端末の実寸（管理画面は PC 1280×800、
// アプリはタブレット縦 768×1024）で描いたものをノード幅に縮小して表示する。
// 撮影済みサムネイルは PC 幅でしか撮っていないため、アプリ画面が別物に見えてしまうのと、
// 撮り直さないと古いままになるので、遷移図では常に今の実画面を出す。
const NODE_W = 132;
const LABEL_H = 40;
const COL_STEP = NODE_W + 48;
const PAD = 12;

/** 管理画面は PC、アプリはタブレットで表示する（変更履歴キャンバスと同じ） */
function deviceFor(category: ScreenEntry["category"]): DeviceMode {
  return category === "App" ? "tablet" : "pc";
}

/** モジュールの種別（管理画面 / アプリ）ごとのノード高さと行間隔 */
function nodeMetrics(category: ScreenEntry["category"]) {
  const size = DEVICE_SIZES[deviceFor(category)];
  const thumbH = Math.round((NODE_W * size.height) / size.width);
  return { thumbH, rowStep: thumbH + LABEL_H + 18 };
}

const ZOOM_STEPS = [0.5, 0.65, 0.8, 1, 1.2, 1.5];
const LS_ZOOM = "nq_screen_flow_zoom";
const LS_DEVICE = "nq_screen_flow_device";

function readZoom(): number {
  const v = Number(localStorage.getItem(LS_ZOOM));
  return ZOOM_STEPS.includes(v) ? v : 1;
}

/** 役割とコンポーネント名だけのプレースホルダ（サムネイルが無い / 読み込み中） */
function NodePlaceholder({ node }: { node: FlowNode }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#f7f7f7] text-[#9a9a9a]">
      <span className="text-[11px] font-bold">{FLOW_ROLE_LABEL[node.role]}</span>
      <span className="text-[9px] px-2 text-center leading-tight line-clamp-2">{node.screen.componentName}</span>
    </div>
  );
}

/**
 * 同時に読み込む iframe の枚数を絞る待ち行列。
 * 画面内のノードを一斉に読み込むと 1 枚も出てこない時間が長くなるので、
 * 数枚ずつ順に読み込んで手前から見えるようにする。
 */
const MAX_LOADING = 3;
let loadingCount = 0;
const loadQueue: (() => void)[] = [];
function acquireLoadSlot(start: () => void): () => void {
  let started = false;
  let released = false;
  const run = () => {
    if (released) return;
    started = true;
    loadingCount += 1;
    start();
  };
  if (loadingCount < MAX_LOADING) run();
  else loadQueue.push(run);
  return () => {
    if (released) return;
    released = true;
    if (started) {
      loadingCount -= 1;
      loadQueue.shift()?.();
    } else {
      const i = loadQueue.indexOf(run);
      if (i >= 0) loadQueue.splice(i, 1);
    }
  };
}

/**
 * 実画面をその端末の実寸（PC 1280×800 / タブレット縦 768×1024）で iframe に読み込み、
 * ノード幅に縮小して表示する。
 * 画面数が多いので、画面内に近づいたときだけ読み込み、離れたら破棄してメモリを抑える。
 * 読み込み中は撮影済みサムネイル（あれば）か役割のプレースホルダを出す。
 */
function LivePreview({ node, device }: { node: FlowNode; device: DeviceMode }) {
  const size = DEVICE_SIZES[device];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  /** 読み込み枠を確保できて iframe を出してよい */
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const releaseRef = useRef<(() => void) | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (!entry.isIntersecting) setLoaded(false);
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 見えているあいだだけ読み込み枠を取り、読み終わるか見えなくなったら返す
  useEffect(() => {
    if (!visible) {
      setActive(false);
      return;
    }
    const release = acquireLoadSlot(() => setActive(true));
    releaseRef.current = release;
    return () => {
      release();
      releaseRef.current = null;
    };
  }, [visible]);

  const onLoad = () => {
    releaseRef.current?.();
    releaseRef.current = null;
    // 確認画面などは見本の state を差し込んでから見せる（差し込む前の「見つかりません」を一瞬出さない）
    const frame = frameRef.current;
    if (frame) applyPreviewState(frame, node.screen.filePath, node.screen.route).finally(() => setLoaded(true));
    else setLoaded(true);
  };

  const scale = NODE_W / size.width;
  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden bg-[#f7f7f7]">
      {loaded ? null : (
        <ScreenThumb screenId={node.screen.id} fallback={<NodePlaceholder node={node} />} />
      )}
      {visible && active ? (
        <iframe
          ref={frameRef}
          src={node.screen.route}
          title=""
          tabIndex={-1}
          aria-hidden
          scrolling="no"
          onLoad={onLoad}
          className={`absolute top-0 left-0 border-0 pointer-events-none bg-white ${loaded ? "" : "opacity-0"}`}
          style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      ) : null}
    </div>
  );
}

/**
 * ノードをクリックしたときのポップアップ。
 * 余計な枠や説明は付けず、その画面だけを端末の実寸（PC 1280×800 / タブレット縦 768×1024）で
 * iframe に読み込み、ウィンドウに収まるよう縮小して真ん中に出す。中は実際に触って動かせる。
 * 背景クリック・Esc・右上の × で閉じる。
 * 層はフィードバックの右パネル（z-60）より上に置く。
 */
function ScreenPopup({ screen, onClose }: { screen: ScreenEntry; onClose: () => void }) {
  const device = deviceFor(screen.category);
  const size = DEVICE_SIZES[device];
  const isApp = device === "tablet";
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const onLoad = () => {
    const frame = frameRef.current;
    if (frame) applyPreviewState(frame, screen.filePath, screen.route).finally(() => setLoaded(true));
    else setLoaded(true);
  };

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // 上下左右に余白を残して収まる倍率。実寸より大きくはしない
  const MARGIN = 48;
  const scale = Math.min(1, (viewport.w - MARGIN * 2) / size.width, (viewport.h - MARGIN * 2) / size.height);
  const w = Math.round(size.width * scale);
  const h = Math.round(size.height * scale);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={screen.title}
    >
      <button
        type="button"
        title="閉じる（Esc）"
        onClick={onClose}
        className="absolute top-3 right-3 size-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[var(--semantic-text-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
      >
        <IconClose width={18} height={18} />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] ${
          isApp ? "rounded-[18px] border-[6px] border-[#3c3c3c]" : "rounded-md border border-[#dcdcdc]"
        }`}
        style={{ width: w, height: h }}
      >
        {loaded ? null : (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[#9a9a9a] bg-[#f7f7f7]">読み込み中…</div>
        )}
        <iframe
          ref={frameRef}
          src={screen.route}
          title={screen.title}
          onLoad={onLoad}
          className={`absolute top-0 left-0 border-0 bg-white ${loaded ? "" : "opacity-0"}`}
          style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      </div>
    </div>,
    document.body
  );
}

/** クリックでその画面をポップアップに。右上の小さいボタンで実画面を別タブに開く */
function FlowNodeView({
  node,
  category,
  matched,
  dimmed,
  onOpen,
}: {
  node: FlowNode;
  category: ScreenEntry["category"];
  matched: boolean;
  dimmed: boolean;
  onOpen: (screen: ScreenEntry) => void;
}) {
  const { screen } = node;
  const { thumbH, rowStep } = nodeMetrics(category);
  const device = deviceFor(category);
  const isApp = device === "tablet";
  const x = PAD + node.depth * COL_STEP;
  const y = PAD + node.row * rowStep;
  return (
    <div
      className={`absolute group ${dimmed ? "opacity-30" : ""}`}
      style={{ left: x, top: y, width: NODE_W }}
      title={`${screen.title}\n${screen.routes[0] ?? ""}\n${screen.filePath}`}
    >
      <button
        type="button"
        onClick={() => onOpen(screen)}
        className={`block w-full text-left bg-white border overflow-hidden transition-shadow hover:shadow-[0_3px_10px_rgba(0,0,0,0.14)] hover:border-[var(--semantic-brand-primary)] ${
          isApp ? "rounded-xl border-[3px]" : "rounded-md"
        } ${
          matched
            ? "border-[var(--semantic-brand-primary)] ring-2 ring-[var(--semantic-brand-primary)]/40"
            : isApp
              ? "border-[#3c3c3c]"
              : "border-[#dcdcdc]"
        }`}
        style={{ height: thumbH }}
      >
        <LivePreview node={node} device={device} />
      </button>
      <a
        href={screen.route}
        target="_blank"
        rel="noreferrer"
        title="実画面を別タブで開く"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-1 right-1 size-6 rounded bg-white/95 border border-[#dcdcdc] hidden group-hover:flex items-center justify-center text-[var(--semantic-text-primary)] hover:bg-[#f0f0f0]"
      >
        <IconExternal width={13} height={13} />
      </a>
      <div className="mt-1.5 flex items-start gap-1" style={{ height: LABEL_H }}>
        <span className={`shrink-0 mt-px px-1 py-px rounded text-[9px] font-bold leading-[14px] ${FLOW_ROLE_CLASS[node.role]}`}>
          {FLOW_ROLE_LABEL[node.role]}
        </span>
        <span className="text-[11px] leading-[14px] text-[var(--semantic-text-primary)] line-clamp-2 break-all">{node.shortTitle}</span>
      </div>
    </div>
  );
}

function FlowModuleView({
  module,
  matchIds,
  onOpen,
}: {
  module: FlowModule;
  /** キーワード一致した画面 ID（null = 絞り込みなし） */
  matchIds: Set<string> | null;
  onOpen: (screen: ScreenEntry) => void;
}) {
  const { thumbH, rowStep } = nodeMetrics(module.category);
  const w = PAD * 2 + (module.cols - 1) * COL_STEP + NODE_W;
  const h = PAD * 2 + (module.rows - 1) * rowStep + thumbH + 6 + LABEL_H;

  // 進む向きの遷移は右端 → 左端。戻る向き（完了 → 一覧 など）はノードの下をまわる破線で、
  // 完了系の画面からのものだけ出す（パンくず・キャンセルの「戻る」まで全部出すと線だらけになる）
  const showBack = (e: FlowEdge) => e.back && (e.from.role === "complete" || e.from.role === "delete-complete");
  const edges: { key: string; d: string; kind: FlowEdge["kind"]; back: boolean }[] = [];
  for (const e of module.edges) {
    if (e.back && !showBack(e)) continue;
    const key = `${e.from.screen.id}-${e.to.screen.id}`;
    if (e.back) {
      const ax = PAD + e.from.depth * COL_STEP + NODE_W / 2;
      const ay = PAD + e.from.row * rowStep + thumbH;
      const bx = PAD + e.to.depth * COL_STEP + NODE_W / 2;
      const by = PAD + e.to.row * rowStep + thumbH;
      const dip = Math.max(ay, by) + LABEL_H + 26;
      edges.push({ key, kind: e.kind, back: true, d: `M${ax},${ay + 2} C${ax},${dip} ${bx},${dip} ${bx},${by + 2}` });
    } else {
      const ax = PAD + e.from.depth * COL_STEP + NODE_W;
      const ay = PAD + e.from.row * rowStep + thumbH / 2;
      const bx = PAD + e.to.depth * COL_STEP;
      const by = PAD + e.to.row * rowStep + thumbH / 2;
      edges.push({ key, kind: e.kind, back: false, d: `M${ax},${ay} C${ax + 24},${ay} ${bx - 24},${by} ${bx},${by}` });
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 px-1">
        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--semantic-text-primary)]">
          {module.category === "App" ? <IconTablet width={14} height={14} /> : <IconMonitor width={14} height={14} />}
          {module.label}
        </span>
        <span className="text-[11px] text-[var(--semantic-text-secondary)]">{module.signature}</span>
        <span className="text-[11px] text-[#9a9a9a]">{module.nodes.length} 画面</span>
      </div>
      <div className="relative rounded-lg bg-white border border-[#e5e5e5]" style={{ width: w, height: h }}>
        <svg className="absolute inset-0 pointer-events-none overflow-visible" width={w} height={h}>
          {edges.map((e) => (
            <path
              key={e.key}
              d={e.d}
              fill="none"
              stroke={e.back ? "#c4c4c4" : e.kind === "route" ? "#b8b8b8" : "#9a9a9a"}
              strokeWidth={e.back || e.kind === "route" ? 1.2 : 1.6}
              strokeDasharray={e.back ? "5 4" : e.kind === "route" ? "2 3" : undefined}
              markerEnd={e.back ? "url(#nq-flow-arrow-light)" : "url(#nq-flow-arrow)"}
            />
          ))}
        </svg>
        {module.nodes.map((n) => (
          <FlowNodeView
            key={n.screen.id}
            node={n}
            category={module.category}
            matched={matchIds !== null && matchIds.has(n.screen.id)}
            dimmed={matchIds !== null && !matchIds.has(n.screen.id)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

export function ScreenFlowPage() {
  const [popupScreen, setPopupScreen] = useState<ScreenEntry | null>(null);
  const [device, setDevice] = useState<DeviceFilter>(() => {
    const v = localStorage.getItem(LS_DEVICE);
    return v === "pc" || v === "tablet" || v === "all" ? v : "all";
  });
  const [versionFilter, setVersionFilter] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [zoom, setZoom] = useState(readZoom);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  useEffect(() => localStorage.setItem(LS_DEVICE, device), [device]);
  useEffect(() => localStorage.setItem(LS_ZOOM, String(zoom)), [zoom]);

  const deviceScreens = useMemo(
    () =>
      SCREENS.filter(
        (s) =>
          !HIDDEN_FILES.has(s.filePath) &&
          (device === "all" ? true : device === "tablet" ? s.category === "App" : s.category !== "App")
      ),
    [device]
  );
  const allSections = useMemo(() => buildFlowSections(deviceScreens), [deviceScreens]);

  // キーワード: 空白区切りの AND 検索。一致した画面を強調し、一致が無いセクションは隠す
  const matchIds = useMemo(() => {
    const terms = keyword.toLowerCase().split(/[\s　]+/).filter(Boolean);
    if (!terms.length) return null;
    const ids = new Set<string>();
    for (const s of deviceScreens) {
      const hay = [s.title, s.componentName, s.route, s.routes.join(" "), s.feature, s.filePath].join(" ").toLowerCase();
      if (terms.every((t) => hay.includes(t))) ids.add(s.id);
    }
    return ids;
  }, [keyword, deviceScreens]);

  const sections = useMemo(
    () =>
      allSections
        .filter((sec) => !versionFilter || sec.group.version === versionFilter)
        .map((sec) => (matchIds ? { ...sec, modules: sec.modules.filter((m) => m.nodes.some((n) => matchIds.has(n.screen.id))) } : sec))
        .filter((sec) => sec.modules.length > 0),
    [allSections, versionFilter, matchIds]
  );

  const totals = useMemo(() => {
    const admin = deviceScreens.filter((s) => s.category !== "App").length;
    return { all: deviceScreens.length, admin, app: deviceScreens.length - admin, groups: allSections.length };
  }, [deviceScreens, allSections]);

  const openPopup = (screen: ScreenEntry) => setPopupScreen(screen);
  const closePopup = () => setPopupScreen(null);

  const toggleCollapsed = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const allCollapsed = sections.length > 0 && sections.every((s) => collapsed.has(s.group.key));

  const zoomIndex = ZOOM_STEPS.indexOf(zoom);
  const zoomBy = (delta: number) => setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, zoomIndex + delta))]);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <PageTitleBar
        title="画面遷移図"
        action={
          <span className="text-sm font-normal text-[var(--semantic-text-secondary)]">
            全 {totals.all} 画面（{CATEGORY_LABELS.Admin} {totals.admin} / {CATEGORY_LABELS.App} {totals.app}）を {totals.groups} 機能に分けて表示
          </span>
        }
      />

      {/* 矢印の先端。各モジュールの SVG から url(#nq-flow-arrow) で参照する */}
      <svg width={0} height={0} className="absolute" aria-hidden>
        <defs>
          <marker id="nq-flow-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth={6.5} markerHeight={6.5} orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="#9a9a9a" />
          </marker>
          <marker id="nq-flow-arrow-light" viewBox="0 0 8 8" refX="7" refY="4" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="#c4c4c4" />
          </marker>
        </defs>
      </svg>

      {/* ツールバー */}
      <div className="shrink-0 flex flex-wrap items-center gap-3 px-6 py-3 bg-white border-b border-[#e5e5e5]">
        <div className="flex rounded-lg border border-[#d0d0d0] overflow-hidden">
          {DEVICE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              title={f.hint}
              onClick={() => setDevice(f.key)}
              className={`px-3 h-9 text-[13px] flex items-center gap-1.5 ${
                device === f.key ? "bg-[var(--semantic-brand-primary)] text-white" : "bg-white text-[var(--semantic-text-primary)] hover:bg-[#f3f3f3]"
              }`}
            >
              {f.key === "pc" ? <IconMonitor width={15} height={15} /> : f.key === "tablet" ? <IconTablet width={15} height={15} /> : null}
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {VERSION_ORDER.map((v) => {
            const active = versionFilter === v;
            return (
              <button
                key={v}
                type="button"
                title={active ? "絞り込みを解除" : `${v} で追加された帳票だけ表示`}
                onClick={() => setVersionFilter(active ? null : v)}
                className={`px-2 h-7 rounded-full text-[11px] font-bold border ${VERSION_CHIP_CLASS[v]} ${
                  active ? "border-current" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#d0d0d0] bg-white min-w-[240px]">
          <IconSearch width={15} height={15} className="text-[#808080]" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="画面名・URL・ファイル名で探す"
            className="flex-1 text-[13px] outline-none placeholder:text-[#a0a0a0]"
          />
          {matchIds ? <span className="text-[11px] text-[var(--semantic-text-secondary)]">{matchIds.size} 件</span> : null}
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(sections.map((s) => s.group.key)))}
            className="h-9 px-3 rounded-lg border border-[#d0d0d0] bg-white text-[13px] text-[var(--semantic-text-primary)] hover:bg-[#f3f3f3]"
          >
            {allCollapsed ? "すべて開く" : "すべて閉じる"}
          </button>
          <div className="flex items-center rounded-lg border border-[#d0d0d0] bg-white overflow-hidden">
            <button type="button" title="縮小" onClick={() => zoomBy(-1)} disabled={zoomIndex <= 0} className="size-9 flex items-center justify-center hover:bg-[#f3f3f3] disabled:opacity-30">
              <IconZoomOut width={16} height={16} />
            </button>
            <button type="button" title="100% に戻す" onClick={() => setZoom(1)} className="w-14 h-9 text-[12px] tabular-nums hover:bg-[#f3f3f3]">
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" title="拡大" onClick={() => zoomBy(1)} disabled={zoomIndex >= ZOOM_STEPS.length - 1} className="size-9 flex items-center justify-center hover:bg-[#f3f3f3] disabled:opacity-30">
              <IconZoomIn width={16} height={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 本体 */}
      <div className="flex-1 min-h-0 overflow-auto bg-[#f4f4f4]">
        <div className="px-6 pt-4 pb-10 flex flex-col gap-6" style={{ zoom }}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--semantic-text-secondary)]">
            <span>
              矢印は各画面のソース（navigate / Link）から抜き出した遷移です。点線の細い矢印は URL の親子関係からの推定、下をまわる破線は完了画面から一覧などへ戻る遷移。
              確認画面には見本の入力内容を差し込んで表示しています。ノードをクリックするとその画面がポップアップで開きます。
            </span>
            <span className="flex items-center gap-1.5">
              {LEGEND_ROLES.map((r) => (
                <span key={r} className={`px-1.5 py-px rounded text-[10px] font-bold ${FLOW_ROLE_CLASS[r]}`}>
                  {FLOW_ROLE_LABEL[r]}
                </span>
              ))}
            </span>
          </div>

          {sections.length === 0 ? (
            <p className="py-16 text-center text-[var(--semantic-text-secondary)]">該当する画面がありません</p>
          ) : (
            sections.map((sec) => {
              const isCollapsed = collapsed.has(sec.group.key);
              return (
                <section key={sec.group.key} className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(sec.group.key)}
                    className="flex items-center gap-2 text-left w-full"
                  >
                    <img src={isCollapsed ? iconArrowDown : iconArrowUp} alt="" className="size-4 shrink-0" />
                    <h2 className="text-[16px] font-bold text-[var(--semantic-text-primary)]">{sec.group.label}</h2>
                    {sec.group.version ? (
                      <span className={`px-2 h-5 rounded-full text-[10px] font-bold flex items-center ${VERSION_CHIP_CLASS[sec.group.version] ?? ""}`}>
                        {sec.group.version}
                      </span>
                    ) : null}
                    <span className="text-[11px] text-[var(--semantic-text-secondary)]">
                      {sec.count} 画面
                      {sec.adminCount && sec.appCount ? `（${CATEGORY_LABELS.Admin} ${sec.adminCount} / ${CATEGORY_LABELS.App} ${sec.appCount}）` : ""}
                    </span>
                    <span className="flex-1 h-px bg-[#dcdcdc]" />
                  </button>
                  {isCollapsed ? null : (
                    <div className="flex flex-wrap items-start gap-6 pl-6">
                      {sec.modules.map((m) => (
                        <FlowModuleView key={m.key} module={m} matchIds={matchIds} onOpen={openPopup} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>

      {popupScreen ? <ScreenPopup screen={popupScreen} onClose={closePopup} /> : null}
    </div>
  );
}
