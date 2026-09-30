/**
 * 画面設計キットの「プロトタイプで開く」から開いたとき（?kit=1）に、右下の「動作デモ」ピルの代わりに出す切替。
 * 中身は画面設計（Documents/NQrepo の nqrepo-screen-design.html）の右下のフローティングと同じ：
 *   資料 … 画面設計（押すといまの画面・状態・ロールのまま画面設計へ戻る）／ React 実装（いま見ているもの）
 *   権限（管理画面のロール） … 画面設計の PROJECT.roles と同じ 4 つ・同じ並び。2 列で、説明は出さない
 *   状態 … 画面設計の PROJECT.screenStates と同じ。見出しの ? で出す説明は画面設計の STATE_HELP の写し
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
        ["確認・承認・データ検索の一覧", "該当するデータがありません"],
        ["承認申請管理", "対象の申請はありません"],
      ],
    },
  },
};

/* 画面設計の「右下の切替」の CSS の写し（暗い配色の段は外した。React の画面は明るいまま） */
const CSS = `
.nvsw{position:fixed;right:20px;bottom:20px;z-index:200;font-weight:400;
  --nb:#fff;--nl:#E2E5E7;--nt:#2B3134;--nm:#7A828A;--na:#009E5E;--nad:#1E7A4C;--nal:#DFF3E9;--ns:#F4F5F6;
  --nsh:0 4px 14px rgba(20,26,30,.10), 0 18px 44px -18px rgba(20,26,30,.36);
  font-family:"Noto Sans JP",system-ui,-apple-system,sans-serif}
.nvfab{display:flex;align-items:center;gap:9px;background:var(--nb);color:var(--nt);
  border:1px solid var(--nl);border-radius:999px;padding:9px 15px 9px 13px;box-shadow:var(--nsh);
  font-size:13px;line-height:1.5;cursor:pointer;transition:transform .14s,box-shadow .14s}
.nvfab:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(20,26,30,.14), 0 22px 50px -18px rgba(20,26,30,.42)}
.nvfab .dt{width:8px;height:8px;border-radius:99px;background:var(--na);flex:none}
.nvfab .lb{font-weight:700;white-space:nowrap}
.nvfab .sb{color:var(--nm);white-space:nowrap;border-left:1px solid var(--nl);padding-left:9px}
.nvfab .cr{color:var(--nm);transition:transform .18s}
.nvsw.open .nvfab .cr{transform:rotate(180deg)}
.nvpanel{position:absolute;right:0;bottom:calc(100% + 10px);width:312px;background:var(--nb);max-height:calc(100vh - 90px);overflow-y:auto;overscroll-behavior:contain;
  border:1px solid var(--nl);border-radius:16px;box-shadow:var(--nsh);padding:14px;
  animation:nvup .18s cubic-bezier(.2,1,.3,1)}
/* display を指定しているので、hidden 属性だけでは消えない。明示的に閉じる */
.nvpanel[hidden]{display:none}
@keyframes nvup{from{transform:translateY(8px)}to{transform:none}}
.nvh{margin:0 0 7px 4px;font-size:10.5px;letter-spacing:.14em;color:var(--nm);font-weight:500}
.nvsec+.nvsec{margin-top:15px;padding-top:14px;border-top:1px solid var(--nl)}
.nvit{display:flex;align-items:center;gap:10px;width:100%;text-align:left;text-decoration:none;
  border-radius:10px;padding:9px 11px;color:var(--nt);border:0;background:none;cursor:pointer;font:inherit}
.nvit:hover{background:var(--ns)}
.nvit[aria-current="true"]{background:var(--nal)}
.nvit .nvr{width:16px;height:16px;border-radius:99px;flex:none;box-shadow:inset 0 0 0 1.5px var(--nl)}
.nvit[aria-current="true"] .nvr{background:var(--na);box-shadow:inset 0 0 0 3px var(--nb)}
.nvit .tx{min-width:0;flex:1}
.nvit .t1{display:block;font-size:13.5px;line-height:1.45;font-weight:500}
.nvit .t2{display:block;font-size:11px;color:var(--nm);line-height:1.5}
.nvgrid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.nvgrid .nvit{padding:8px 10px}
.nvgrid .nvit .t1{font-size:12.5px}
.nvflow{margin:9px 4px 0;font-size:11px;color:var(--nm);line-height:1.65}
.nvflow b{color:var(--nt);font-weight:500}
.nvfoot{display:flex;align-items:center;justify-content:flex-end;gap:9px;margin-top:14px;padding-top:12px;border-top:1px solid var(--nl)}
.nvbtn{font-size:12px;border:1px solid var(--nl);border-radius:8px;padding:6px 12px;color:var(--nm);background:none;cursor:pointer;font-family:inherit}
.nvbtn:hover{border-color:var(--na);color:var(--nad)}
.nvtabs{display:flex;gap:2px;background:var(--ns);border-radius:9px;padding:2px;margin:0 0 12px}
.nvtab{flex:1;font-size:12.5px;padding:6px 10px;border-radius:7px;color:var(--nm);text-align:center;background:none;border:0;cursor:pointer;font-family:inherit}
.nvtab:hover{color:var(--nt)}
.nvtab[aria-selected="true"]{background:var(--nb);color:var(--nt);font-weight:500;box-shadow:0 1px 2px rgba(20,26,30,.12)}
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
@media (max-width:700px){ .nvfab .sb{display:none} .nvpanel{width:min(300px,calc(100vw - 40px))} }
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
    const panel = t?.closest(".nvpanel");
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
        <div className="nvtabs" role="tablist" aria-label="端末の切り替え">
          {(["admin", "app"] as Pf[]).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              className="nvtab"
              aria-selected={p === pf}
              onClick={() => p !== pf && navigate(lastPath(p))}
            >
              {p === "admin" ? "管理画面" : "アプリ"}
            </button>
          ))}
        </div>
        <div className="nvsec">
          <p className="nvh">資料</p>
          <a className="nvit" href={back} aria-current="false">
            <span className="nvr"></span>
            <span className="tx">
              <b className="t1">{info.doc}</b>
              <span className="t2">
                {info.n ? `画面ごとの仕様・画面のつながりをまとめた資料。全${info.n}画面` : "画面ごとの仕様・画面のつながりをまとめた資料"}
              </span>
            </span>
          </a>
          <span className="nvit" aria-current="true">
            <span className="nvr"></span>
            <span className="tx">
              <b className="t1">{info.demo}</b>
              <span className="t2">{info.demoDesc}</span>
            </span>
          </span>
        </div>
        <div className="nvsec">
          <p className="nvh">権限</p>
          <div className="nvgrid">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                className="nvit"
                aria-current={r.key === role}
                onClick={() => saveCurrentRole(r.key)}
              >
                <span className="nvr"></span>
                <span className="tx">
                  <b className="t1">{r.name}</b>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="nvsec nvqsec">
          <p className="nvh">
            状態
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
          <div className="nvgrid">
            {STATES.filter((x) => x.pf.includes(pf)).map((x) => (
              <button
                key={x.key || "normal"}
                type="button"
                className="nvit"
                aria-current={x.key === state}
                onClick={(e) => {
                  e.stopPropagation(); // 吹き出しを開いたまま切り替えられるように（画面設計と同じ）
                  setKitState(x.key);
                }}
              >
                <span className="nvr"></span>
                <span className="tx">
                  <b className="t1">{x.name}</b>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="nvfoot">
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
      <button
        className="nvfab"
        type="button"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span className="dt"></span>
        <span className="lb">{info.demo}</span>
        <span className="sb">
          {(STATES.find((x) => x.key === state) || STATES[0]).name}
        </span>
        <svg
          className="cr"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        >
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
    </div>
  );
}
