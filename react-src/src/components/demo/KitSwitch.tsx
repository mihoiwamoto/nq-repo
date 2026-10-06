/**
 * 画面設計キットの「プロトタイプで開く」から開いたとき（?kit=1）に、右下の「動作デモ」ピルの代わりに出す切替。
 * 中身は画面設計（Documents/NQrepo の nqrepo-screen-design.html）の右下のフローティングと同じ：
 *   資料 … 画面設計（押すといまの画面・状態・ロールのまま画面設計へ戻る）／ React 実装（いま見ているもの）
 *   ログイン中（管理画面のロール） … 画面設計の PROJECT.roles と同じ並び。カードを押すと下に一覧が開く（2026-10-06）
 *   状態を試す … 画面設計の PROJECT.screenStates と同じ。通常以外を 1 行ずつスイッチで出す。見出しの ? で出す説明は画面設計の STATE_HELP の写し
 *   バージョン … 画面設計のヘッダー右上の Ver の切替と同じ（2026-10-06）。選んだ Ver より後で足す帳票を隠す。
 *              選んだものは画面設計と同じ localStorage に覚えるので、画面設計へ戻っても同じ Ver（data/ledgerVisibility.ts）
 * 見た目も画面設計の .nvsw の CSS をそのまま写してある（画面設計側を直したらここも写し直す）。
 */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemoTrial } from "./demoStore";
import {
  loadCurrentRole,
  saveCurrentRole,
  type PrototypeRoleId,
} from "../../data/roleStore";
import { useCurrentRole } from "../../data/useCurrentRole";
import {
  KIT_FLAGS_EVENT,
  KIT_INFO_KEY,
  getKitState,
  setKitState,
} from "../../frameBridge";
import { openFeedbackPanel } from "../feedback/feedbackStore";
import { KIT_VERSIONS, chooseKitVer, getKitVer } from "../../data/ledgerVisibility";
import { ScreenCoachMarks } from "../screen-description/ScreenCoachMarks";
import { isKitDescPath, setKitDescClosed, useKitDescClosed } from "./KitScreenDescription";
import type { CoachMarkKind } from "../screen-description/coachMarks";

/**
 * 右下の切替の左に「?」（画面説明）を出す画面。押すとその画面の各部分に番号付きの説明（ScreenCoachMarks）を重ねる。
 * 2026-10-05 にまず 帳票管理 › 機械器具点検 の持ち場/ラインの一覧だけで試す。広げるときはここへ足す
 */
const COACH_PATHS = [/^\/admin\/ledger-management\/equipment-inspection\/factories\/[^/]+\/?$/];
/** 画面タイトルとパンくずは説明に入れない（2026-10-05 ユーザー指示） */
const COACH_SKIP: CoachMarkKind[] = ["title", "breadcrumb"];
/** 点検の事前準備は「点検予定」「確認項目の設定」それぞれに番号を付ける。一覧と「毎日」のように左上が同じ番号は横にずらす。説明カードは見出しをつかんで動かせる */
const COACH_OPTIONS = { splitPrep: true, spreadBadges: true, draggableCard: true };
const hasCoach = (path: string) => COACH_PATHS.some((re) => re.test(path));

type Pf = "admin" | "app";

/** 画面設計の PROJECT.roles と同じ */
const ROLES: { key: PrototypeRoleId; name: string; desc: string }[] = [
  { key: "administrator", name: "管理者", desc: "全画面にアクセスできる" },
  {
    key: "approver",
    name: "承認者",
    desc: "確認者が確認した確認済みの帳票を承認する",
  },
];
/** 状態。画面設計の PROJECT.screenStates と同じキー・名前・並び・端末 */
const STATES: { key: string; name: string; pf: ("admin" | "app")[] }[] = [
  { key: "", name: "通常", pf: ["app", "admin"] },
  { key: "empty", name: "データが無い", pf: ["app", "admin"] },
  { key: "off", name: "オフライン", pf: ["app"] },
  { key: "unsent", name: "未送信の記録がある", pf: ["app"] },
  { key: "err", name: "送信エラー", pf: ["app"] },
  { key: "session", name: "セッション終了", pf: ["app"] },
];

/**
 * 「状態」の ? で出す、それぞれの状態の説明。画面設計の STATE_HELP の写し（文面を変えたら両方直す）。
 * 1 つの状態につき「どんな時に出るか（一言）」と「表示文言」。texts は [出る場所, 文言]
 */
const STATE_HELP: Record<
  Pf,
  Record<string, { when: string; texts: [string, string][] }>
> = {
  app: {
    "": { when: "見本データのまま動かしたいとき", texts: [] },
    empty: {
      when: "記録がまだ 1 件も無いとき",
      texts: [
        ["記録の一覧", "確認待ちの記録はまだありません"],
        ["記録の一覧", "該当する点検はありません"],
      ],
    },
    off: {
      when: "通信できないとき",
      texts: [
        ["ログイン画面", "オフライン状態です。通信環境をご確認ください。"],
        [
          "提出したあとの上の帯",
          "未送信のデータがあります。送信ボタンを押してください。",
        ],
      ],
    },
    unsent: {
      when: "送れていない記録が端末に残っているとき",
      texts: [
        ["上の帯", "未送信のデータがあります。送信ボタンを押してください。"],
      ],
    },
    err: {
      when: "提出が送信に失敗したとき",
      texts: [
        ["ポップアップ", "送信エラーが発生しました"],
        [
          "ポップアップ",
          "入力した内容は未送信のまま端末に保存されています。時間をおいて、もう一度送信してください。",
        ],
      ],
    },
    session: {
      when: "一定時間さわらずにログアウトされたとき",
      texts: [
        ["ポップアップ", "セッションが終了しました"],
        [
          "ポップアップ",
          "セキュリティ保護のため自動的にログアウトされました。再度ログインしてください。",
        ],
      ],
    },
  },
  admin: {
    "": { when: "見本データのまま動かしたいとき", texts: [] },
    empty: {
      when: "対象の記録が 1 件も無いとき",
      texts: [
        ["確認・承認・データ検索・帳票管理などの一覧", "表は見出しだけになり、文字は出さない（空欄）"],
        ["承認申請管理", "帳票のタブだけになり、文字は出さない（空欄）"],
      ],
    },
  },
};

/* 画面設計の「右下の切替」の CSS の写し（暗い配色の段は外した。React の画面は明るいまま） */
const CSS = `
.nvsw{position:fixed;right:20px;bottom:20px;z-index:200;font-weight:400;display:flex;flex-direction:column;align-items:flex-end;gap:10px;
  --nb:#fff;--nl:#E2E5E7;--nt:#2B3134;--nm:#7A828A;--na:#009E5E;--nad:#1E7A4C;--nal:#DFF3E9;--ns:#F4F5F6;
  --nsh:0 4px 14px rgba(20,26,30,.10), 0 18px 44px -18px rgba(20,26,30,.36);
  font-family:"Noto Sans JP",system-ui,-apple-system,sans-serif}
.nvfab{display:grid;place-items:center;width:56px;height:56px;padding:0;background:#2B7A47;color:#fff;
  border:0;border-radius:999px;box-shadow:0 4px 12px rgba(20,26,30,.18), 0 14px 32px -14px rgba(20,26,30,.45);
  cursor:pointer;transition:transform .14s,box-shadow .14s,background .14s}
.nvfab:hover{transform:translateY(-1px);background:#246A3D;box-shadow:0 6px 16px rgba(20,26,30,.22), 0 18px 40px -14px rgba(20,26,30,.5)}
.nvfab:focus-visible{outline:3px solid rgba(43,122,71,.35);outline-offset:3px}
.nvsw.open .nvfab{background:#246A3D}
.nvfab .dt{width:8px;height:8px;border-radius:99px;background:var(--na);flex:none}
.nvfab .lb{font-weight:700;white-space:nowrap}
.nvfab .sb{color:var(--nm);white-space:nowrap;border-left:1px solid var(--nl);padding-left:9px}
.nvfab .cr{color:var(--nm);transition:transform .18s}
.nvsw.open .nvfab .cr{transform:rotate(180deg)}
.nvpanel{position:absolute;right:0;bottom:calc(100% + 10px);width:316px;background:var(--nb);max-height:calc(100vh - 90px);
  display:flex;flex-direction:column;border:1px solid var(--nl);border-radius:16px;box-shadow:var(--nsh);overflow:hidden;
  animation:nvup .18s cubic-bezier(.2,1,.3,1)}
.nvhead{display:flex;align-items:center;justify-content:space-between;padding:14px 12px 4px 18px;flex:none}
.nvhead b{font-size:13px;font-weight:500;color:var(--nm)}
.nvx{width:28px;height:28px;display:grid;place-items:center;border:0;background:none;border-radius:8px;color:var(--nm);cursor:pointer}
.nvx:hover{background:var(--ns);color:var(--nt)}
.nvbody{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:6px 16px 4px}
.nvseg{display:flex;gap:2px;background:var(--ns);border-radius:11px;padding:3px}
.nvseg>*{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 8px;border:0;background:none;border-radius:9px;
  font:inherit;font-size:13px;color:var(--nt);text-decoration:none;cursor:pointer;white-space:nowrap}
.nvseg>*:hover{color:var(--nad)}
.nvseg>[aria-selected="true"],.nvseg>[aria-current="true"]{background:var(--nb);color:var(--nad);font-weight:700;box-shadow:0 1px 3px rgba(20,26,30,.14);cursor:default}
.nvcap{margin:8px 2px 0;font-size:11.5px;color:var(--nm);line-height:1.6}
.nvcard{display:flex;align-items:center;gap:11px;width:100%;text-align:left;border:1px solid var(--nl);border-radius:12px;background:var(--nb);
  padding:9px 12px;cursor:pointer;font:inherit;color:var(--nt)}
.nvcard:hover,.nvcard[aria-expanded="true"]{border-color:var(--na)}
.nvav{width:32px;height:32px;border-radius:99px;background:var(--nal);color:var(--nad);display:grid;place-items:center;font-size:13px;font-weight:700;flex:none}
.nvcard .tx,.nvmenu .tx{min-width:0;flex:1}
.nvcard .t1{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:700;line-height:1.4}
.nvbadge{font-size:10.5px;font-weight:500;color:var(--nad);background:var(--nal);border-radius:5px;padding:1px 6px}
.nvcard .t2{display:block;font-size:11.5px;color:var(--nm);line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nvcard .cr{color:var(--nm);flex:none;transition:transform .18s}
.nvcard[aria-expanded="true"] .cr{transform:rotate(180deg)}
.nvmenu{margin-top:5px;border:1px solid var(--nl);border-radius:12px;padding:4px;background:var(--nb)}
.nvmenu[hidden]{display:none}
.nvmenu button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:none;border-radius:9px;padding:7px 9px;font:inherit;color:var(--nt);cursor:pointer}
.nvmenu button:hover{background:var(--ns)}
.nvmenu button[aria-current="true"]{background:var(--nal)}
.nvmenu .nvav{width:26px;height:26px;font-size:11.5px}
.nvmenu .t1{display:block;font-size:13px;font-weight:500}
.nvmenu .t2{display:block;font-size:11px;color:var(--nm);line-height:1.45}
.nvsws{display:flex;flex-direction:column}
.nvsw1{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;border:0;background:none;padding:7px 2px;font:inherit;font-size:13.5px;color:var(--nt);cursor:pointer;text-align:left}
.nvsw1 .tg{position:relative;width:34px;height:20px;border-radius:99px;background:#D5D9DC;flex:none;transition:background .15s}
.nvsw1 .tg::after{content:"";position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:99px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
.nvsw1[aria-checked="true"] .tg{background:#009E5E}
.nvsw1[aria-checked="true"] .tg::after{transform:translateX(14px)}
/* display を指定しているので、hidden 属性だけでは消えない。明示的に閉じる */
.nvpanel[hidden]{display:none}
@keyframes nvup{from{transform:translateY(8px)}to{transform:none}}
.nvh{display:flex;align-items:center;margin:0 0 9px 2px;font-size:13px;color:var(--nm);font-weight:500}
.nvsec{padding:12px 0 14px}
.nvsec+.nvsec{border-top:1px solid var(--nl)}
.nvit{display:flex;align-items:center;gap:10px;width:100%;text-align:left;text-decoration:none;
  border-radius:10px;padding:9px 11px;color:var(--nt);border:0;background:none;cursor:pointer;font:inherit}
.nvit:hover{background:var(--ns)}
.nvit[aria-current="true"]{background:var(--nal)}
.nvit .tx{min-width:0;flex:1}
.nvit .t1{display:block;font-size:13.5px;line-height:1.45;font-weight:500}
.nvit .t2{display:block;font-size:11px;color:var(--nm);line-height:1.5}
.nvgrid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
/* 権限・状態は選択ボタン（枠つき。選んだものは緑地に白文字。フィードバックの種類と同じ形） */
.nvgrid .nvit{justify-content:center;text-align:center;padding:7px 10px;border:1px solid var(--nl);border-radius:9px}
.nvgrid .nvit .t1{font-size:12.5px}
.nvgrid .nvit[aria-current="true"],.nvgrid .nvit[aria-current="true"]:hover{background:#009E5E;border-color:#009E5E;color:#fff}
.nvgrid .nvit[aria-current="true"] .t1{font-weight:700}
/* バージョンのプルダウン（パネルのいちばん下） */
.nvsel{position:relative;display:flex;align-items:center;border:1px solid var(--nl);border-radius:9px;background:var(--nb)}
.nvsel:hover,.nvsel:focus-within{border-color:var(--na)}
.nvsel .vd{position:absolute;left:12px;width:8px;height:8px;border-radius:99px;background:var(--vf,#808080);pointer-events:none}
.nvsel select{appearance:none;-webkit-appearance:none;width:100%;border:0;background:none;font:inherit;font-size:12.5px;font-weight:500;color:var(--nt);
  padding:8px 32px 8px 28px;cursor:pointer;outline:none}
.nvsel .cr{position:absolute;right:12px;color:var(--nm);pointer-events:none}
.nvfab .vb{display:flex;align-items:center;gap:6px;color:var(--nt);white-space:nowrap;border-left:1px solid var(--nl);padding-left:9px;font-weight:500}
.nvfab .vb i{width:7px;height:7px;border-radius:99px;background:var(--vf,#808080)}
.nvflow{margin:9px 4px 0;font-size:11px;color:var(--nm);line-height:1.65}
.nvflow b{color:var(--nt);font-weight:500}
.nvfoot{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:12px 14px;border-top:1px solid var(--nl);flex:none}
.nvbtn{font-size:12.5px;border:1px solid var(--nl);border-radius:9px;padding:7px 14px;color:var(--nm);background:none;cursor:pointer;font-family:inherit}
.nvbtn:hover{border-color:var(--na);color:var(--nad)}
.nvbtn.pri{background:#009E5E;border-color:#009E5E;color:#fff}
.nvbtn.pri:hover{background:#1E7A4C;border-color:#1E7A4C;color:#fff}
.nvqsec{position:relative}
.nvqsec>.nvh{display:flex;align-items:center}
.nvh .nvq{display:inline-flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;margin-left:4px;
  border-radius:99px;border:1px solid var(--nl);background:var(--nb);color:var(--nm);font:600 10px/1 system-ui,sans-serif;letter-spacing:0;cursor:pointer;padding:0}
.nvh .nvq:hover,.nvh .nvq[aria-expanded="true"]{border-color:var(--na);color:var(--nad);background:var(--nal)}
.nvtip{position:relative;margin:4px 0 10px;background:var(--nb);border:1px solid var(--nl);border-radius:12px;
  box-shadow:var(--nsh);padding:10px 12px;transform-origin:34px -6px;animation:nvpop .16s cubic-bezier(.2,1.3,.4,1)}
.nvtip[hidden]{display:none}
.nvtip::before{content:"";position:absolute;left:34px;top:-6px;width:10px;height:10px;background:var(--nb);
  border-left:1px solid var(--nl);border-top:1px solid var(--nl);transform:rotate(45deg)}
.nvtip dl{margin:0;display:grid;gap:8px}
.nvtip dt{font-size:12px;font-weight:500;color:var(--nt);line-height:1.5}
.nvtip dd{margin:1px 0 0;font-size:11px;color:var(--nm);line-height:1.65}
.nvtip dd.q{color:var(--nt)}
@keyframes nvpop{from{transform:scale(.9) translateY(-4px)}to{transform:none}}
.nvkey{margin-left:auto;font-size:10.5px;color:var(--nm);text-align:right;line-height:1.6}
/* 画面説明の ?（切替の左。押して開いているあいだは緑） */
.nvrow{display:flex;align-items:center;gap:10px}
.nvhelp{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;background:var(--nb);color:var(--nad);
  border:1px solid var(--nl);box-shadow:var(--nsh);font:700 18px/1 system-ui,sans-serif;cursor:pointer;padding:0;transition:transform .14s}
.nvhelp:hover{transform:translateY(-1px);border-color:var(--na)}
.nvhelp[aria-pressed="true"]{background:var(--na);border-color:var(--na);color:#fff}
/* 画面説明のパネルの開閉（? の左）。パネルの見出しと同じ青 */
.nvdesc{color:#2f7fd4}
.nvdesc:hover{border-color:#2f7fd4}
.nvdesc[aria-pressed="true"]{background:#2f7fd4;border-color:#2f7fd4;color:#fff}
@media (max-width:700px){ .nvpanel{width:min(300px,calc(100vw - 40px))} }
@media (prefers-reduced-motion:reduce){.nvfab,.nvpanel,.nvfab .cr,.nvtip{transition:none!important;animation:none!important}}
`;

type KitInfo = { doc: string; n: number; demo: string; demoDesc: string };
function kitInfo(): KitInfo {
  const d: KitInfo = {
    doc: "画面設計",
    n: 0,
    demo: "プロトタイプ",
    demoDesc: "",
  };
  /* この画面そのものの名前と説明は画面設計の PROJECT.demo と同じ文言で固定する。
     保存された値を使うと、名前を変える前に開いたタブに古い呼び名が残るため */
  const self = {
    demo: "プロトタイプ",
    demoDesc:
      "触って動かせる画面。見本データのまま、画面を行き来して操作を試せる",
  };
  try {
    return {
      ...d,
      ...JSON.parse(sessionStorage.getItem(KIT_INFO_KEY) || "{}"),
      ...self,
    };
  } catch {
    return { ...d, ...self };
  }
}

/** 管理画面／アプリのタブ。押すとその端末で最後に見ていた画面へ（無ければ先頭の画面へ） */
const PF_HOME: Record<Pf, string> = {
  admin: "/admin/home",
  app: "/app/ledger-list",
};
const lastKey = (pf: Pf) => `nq_kit_last_${pf}`;
function lastPath(pf: Pf): string {
  try {
    return sessionStorage.getItem(lastKey(pf)) || PF_HOME[pf];
  } catch {
    return PF_HOME[pf];
  }
}

export function KitSwitch() {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(false); // 「状態」の ? の吹き出し
  const [roleOpen, setRoleOpen] = useState(false); // ログイン中のカードの下の権限の一覧
  const [coach, setCoach] = useState(false); // 画面説明（? ボタン）
  const role = useCurrentRole(loadCurrentRole("administrator"));
  const location = useLocation();
  const navigate = useNavigate();
  const box = useRef<HTMLDivElement>(null);
  const tipRef = useRef(false);
  tipRef.current = tip;
  const tipBox = useRef<HTMLDivElement>(null);
  // 開いたら「状態」の見出しがパネルのいちばん上に来るまで、パネルの中だけを送る。
  // scrollIntoView だと、吹き出しがパネルより高いとき下の端に合わせて上が切れ、ページごと動いてしまう
  useEffect(() => {
    const t = tipBox.current;
    const panel = t?.closest(".nvbody");
    const head = t?.parentElement?.querySelector(".nvh");
    if (!tip || !panel || !head) return;
    panel.scrollTop +=
      head.getBoundingClientRect().top - panel.getBoundingClientRect().top - 12;
  }, [tip]);
  const info = kitInfo();
  const pf: Pf = location.pathname.startsWith("/app") ? "app" : "admin";
  useDemoTrial(); // 状態が変わったら描き直す
  const [, repaint] = useState(0);
  useEffect(() => {
    const on = () => repaint((n) => n + 1);
    window.addEventListener(KIT_FLAGS_EVENT, on);
    return () => window.removeEventListener(KIT_FLAGS_EVENT, on);
  }, []);
  const state = getKitState();
  const ver = getKitVer();
  const verInfo = KIT_VERSIONS.find((v) => v.ver === ver);
  const coachHere = hasCoach(location.pathname);
  const descHere = isKitDescPath(location.pathname);
  const descOpen = !useKitDescClosed();
  // 説明のある画面から離れたら閉じる
  useEffect(() => {
    if (!coachHere) setCoach(false);
  }, [coachHere]);

  // 端末ごとに最後に見ていた画面を覚える（ログイン画面は除く）
  useEffect(() => {
    if (/\/login$/.test(location.pathname)) return;
    try {
      sessionStorage.setItem(lastKey(pf), location.pathname);
    } catch {
      /* 無視 */
    }
  }, [pf, location.pathname]);

  useEffect(() => {
    if (!open) {
      setTip(false);
      return;
    }
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (tipRef.current) setTip(false);
      else setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  // 画面設計へ戻るリンク。いまの画面（React のルート）と状態・ロールを渡し、画面設計が同じところを開く
  const q = new URLSearchParams({ role });
  if (state) q.set("state", state);
  const back = `${import.meta.env.BASE_URL.replace(/[^/]+\/$/, "")}nqrepo-screen-design.html?${q}#${location.pathname.replace(/^\//, "")}`;

  return (
    <div className={`nvsw${open ? " open" : ""}`} ref={box} data-nq-feedback="">
      <style>{CSS}</style>
      {/* 吹き出しの外（パネルの中）を押したら閉じる */}
      <div className="nvpanel" hidden={!open} onClick={() => setTip(false)}>
        {/* 2026-10-06 に画面設計と同じ「切り替え」パネルの形にした（見出しと ×・2 段の切替・ログイン中のカード・状態のスイッチ・リセット） */}
        <div className="nvhead">
          <b>切り替え</b>
          <button className="nvx" type="button" aria-label="閉じる" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="nvbody">
          <div className="nvsec">
            <div className="nvseg">
              <a href={back} aria-current="false">{info.doc}</a>
              <span aria-current="true">{info.demo}</span>
            </div>
            <p className="nvcap">{info.doc}は、いまの画面・状態・ログイン中のまま開きます</p>
          </div>
          <div className="nvsec">
            <p className="nvh">画面</p>
            <div className="nvseg" role="tablist" aria-label="端末の切り替え">
              {(["app", "admin"] as Pf[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={p === pf}
                  onClick={() => p !== pf && navigate(lastPath(p))}
                >
                  {p === "admin" ? "管理画面" : "アプリ"}
                </button>
              ))}
            </div>
          </div>
          <div className="nvsec">
            <p className="nvh">ログイン中</p>
            {(() => {
              const cur = ROLES.find((r) => r.key === role) ?? ROLES[0];
              return (
                <>
                  <button
                    type="button"
                    className="nvcard"
                    aria-expanded={roleOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRoleOpen((v) => !v);
                    }}
                  >
                    <span className="nvav" aria-hidden="true">{cur.name.slice(0, 1)}</span>
                    <span className="tx">
                      <b className="t1">
                        {cur.name}
                        <span className="nvbadge">権限</span>
                      </b>
                      <span className="t2">{cur.desc}</span>
                    </span>
                    <svg className="cr" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div className="nvmenu" role="menu" hidden={!roleOpen}>
                    {ROLES.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        role="menuitemradio"
                        aria-checked={r.key === role}
                        aria-current={r.key === role}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoleOpen(false);
                          saveCurrentRole(r.key);
                        }}
                      >
                        <span className="nvav" aria-hidden="true">{r.name.slice(0, 1)}</span>
                        <span className="tx">
                          <b className="t1">{r.name}</b>
                          <span className="t2">{r.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
          <div className="nvsec nvqsec">
            <p className="nvh">
              状態を試す
              <button
                className="nvq"
                type="button"
                aria-expanded={tip}
                aria-label="それぞれの状態の説明"
                onClick={(e) => {
                  e.stopPropagation();
                  setTip((v) => !v);
                }}
              >
                ?
              </button>
            </p>
            <div
              className="nvtip"
              role="tooltip"
              ref={tipBox}
              hidden={!tip}
              onClick={(e) => e.stopPropagation()}
            >
              <dl>
                {STATES.filter((x) => x.pf.includes(pf)).map((x) => (
                  <div key={x.key || "normal"}>
                    <dt>{x.name}</dt>
                    <dd>{STATE_HELP[pf][x.key]?.when || "未記入"}</dd>
                    {(STATE_HELP[pf][x.key]?.texts || []).length ? (
                      STATE_HELP[pf][x.key].texts.map(([at, t], i) => (
                        <dd key={i} className="q">
                          表示文言（{at}）：「{t}」
                        </dd>
                      ))
                    ) : (
                      <dd className="q">表示文言：なし</dd>
                    )}
                  </div>
                ))}
              </dl>
            </div>
            {/* 通常以外を 1 行ずつスイッチで出す。入れられるのは 1 つだけで、入っているものを切ると通常に戻る */}
            <div className="nvsws">
              {STATES.filter((x) => x.key && x.pf.includes(pf)).map((x) => (
                <button
                  key={x.key}
                  type="button"
                  role="switch"
                  className="nvsw1"
                  aria-checked={x.key === state}
                  onClick={(e) => {
                    e.stopPropagation(); // 吹き出しを開いたまま切り替えられるように（画面設計と同じ）
                    setKitState(x.key === state ? "" : x.key);
                  }}
                >
                  <span>{x.name}</span>
                  <span className="tg" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
          <div className="nvsec">
            <p className="nvh">バージョン</p>
            {/* プルダウン。左の丸は選んでいる Ver の色 */}
            <label className="nvsel" style={verInfo ? { ["--vf" as string]: verInfo.c } : undefined}>
              <span className="vd" aria-hidden="true" />
              <select
                aria-label="バージョン"
                value={ver}
                title={verInfo ? `${verInfo.ver}（${verInfo.st}）の時点の画面。これより後で足す帳票を隠す` : "すべての帳票を出す"}
                onChange={(e) => e.target.value !== ver && chooseKitVer(e.target.value)}
              >
                <option value="">すべての Ver</option>
                {KIT_VERSIONS.map((v) => (
                  <option key={v.ver} value={v.ver}>
                    {v.ver}（{v.st}）
                  </option>
                ))}
              </select>
              <svg className="cr" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </label>
          </div>
        </div>
        <div className="nvfoot">
          <button
            type="button"
            className="nvbtn"
            title="状態を通常に、ログイン中を最初の権限に戻す"
            onClick={(e) => {
              e.stopPropagation();
              setRoleOpen(false);
              setKitState("");
              saveCurrentRole(ROLES[0].key);
            }}
          >
            リセット
          </button>
          <button
            type="button"
            className="nvbtn pri"
            onClick={() => {
              setOpen(false);
              openFeedbackPanel();
            }}
          >
            フィードバック
          </button>
        </div>
      </div>
      {coach && <ScreenCoachMarks onClose={() => setCoach(false)} cardBottom={130} skipKinds={COACH_SKIP} options={COACH_OPTIONS} />}
      <div className="nvrow">
      {descHere && (
        <button
          className="nvhelp nvdesc"
          type="button"
          aria-pressed={descOpen}
          aria-label={descOpen ? "画面説明を閉じる" : "画面説明を表示"}
          title="画面説明"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            setKitDescClosed(descOpen);
          }}
        >
          {/* 右にパネルが出る形のアイコン */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <path d="M14 4v16M16.5 8.5h2M16.5 12h2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {coachHere && (
        <button
          className="nvhelp"
          type="button"
          aria-pressed={coach}
          aria-label={coach ? "画面説明を閉じる" : "この画面の説明"}
          title="この画面の説明"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            setCoach((v) => !v);
          }}
        >
          ?
        </button>
      )}
      <button
        className="nvfab"
        type="button"
        aria-expanded={open}
        aria-label={`切り替え（${info.demo}・${verInfo ? verInfo.ver : "すべての Ver"}・${(STATES.find((x) => x.key === state) || STATES[0]).name}）`}
        title="切り替え"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {/* 2026-10-06 から緑の丸に重なった 2 枚の四角のアイコンだけ（画面設計と同じ。いまの状態・Ver はパネルの中で見る） */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="3.5" width="11.5" height="13.5" rx="2.2" />
          <path d="M19.5 7.5v10.3a2.7 2.7 0 0 1-2.7 2.7H9" />
        </svg>
      </button>
      </div>
    </div>
  );
}
