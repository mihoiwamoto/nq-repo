/**
 * 画面設計キットの「プロトタイプで開く」から開いたとき（?kit=1）に、右下の「動作デモ」ピルの代わりに出す切替。
 * 中身は画面設計（Documents/NQrepo の nqrepo-screen-design.html）の右下のフローティングと同じ：
 *   資料 … 画面設計（押すといまの画面・状態・ロールのまま画面設計へ戻る）／ React 実装（いま見ているもの）
 *   権限（管理画面のロール） … 画面設計の PROJECT.roles と同じ 4 つ・同じ並び・同じ説明
 * 見た目も画面設計の .nvsw の CSS をそのまま写してある（画面設計側を直したらここも写し直す）。
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDemoTrial } from "./demoStore";
import { loadCurrentRole, saveCurrentRole, type PrototypeRoleId } from "../../data/roleStore";
import { useCurrentRole } from "../../data/useCurrentRole";
import { KIT_INFO_KEY } from "../../frameBridge";

/** 画面設計の PROJECT.roles と同じ */
const ROLES: { key: PrototypeRoleId; name: string; desc: string }[] = [
  { key: "administrator", name: "管理者", desc: "全画面にアクセスできる" },
  { key: "approver", name: "承認者", desc: "確認者が確認した確認済みの帳票を承認する" },
  { key: "checker", name: "確認者", desc: "実施者が提出した帳票を確認する" },
  { key: "approver_checker", name: "承認者・確認者兼任", desc: "確認と承認の両方を行う" },
];
/** 動作デモの「状態を試す」→ 画面設計の状態のキー */
const TRIAL2STATE: Record<string, string> = { offline: "off", empty: "empty", error: "err", session: "session" };

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
.nvpanel{position:absolute;right:0;bottom:calc(100% + 10px);width:312px;background:var(--nb);
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
.nvfoot{display:flex;align-items:center;gap:9px;margin-top:14px;padding-top:12px;border-top:1px solid var(--nl)}
.nvbtn{font-size:12px;border:1px solid var(--nl);border-radius:8px;padding:6px 12px;color:var(--nm);background:none;cursor:pointer;font-family:inherit}
.nvbtn:hover{border-color:var(--na);color:var(--nad)}
.nvkey{margin-left:auto;font-size:10.5px;color:var(--nm);text-align:right;line-height:1.6}
@media (max-width:700px){ .nvfab .sb{display:none} .nvpanel{width:min(300px,calc(100vw - 40px))} }
@media (prefers-reduced-motion:reduce){.nvfab,.nvpanel,.nvfab .cr{transition:none!important;animation:none!important}}
`;

type KitInfo = { doc: string; n: number; demo: string; demoDesc: string };
function kitInfo(): KitInfo {
  const d: KitInfo = { doc: "画面設計", n: 0, demo: "React 実装", demoDesc: "" };
  try {
    return { ...d, ...JSON.parse(sessionStorage.getItem(KIT_INFO_KEY) || "{}") };
  } catch {
    return d;
  }
}

export function KitSwitch() {
  const [open, setOpen] = useState(false);
  const role = useCurrentRole(loadCurrentRole("administrator"));
  const location = useLocation();
  const box = useRef<HTMLDivElement>(null);
  const info = kitInfo();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
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
  const st = TRIAL2STATE[getDemoTrial() || ""];
  if (st) q.set("state", st);
  const back = `${import.meta.env.BASE_URL.replace(/[^/]+\/$/, "")}nqrepo-screen-design.html?${q}#${location.pathname.replace(/^\//, "")}`;

  return (
    <div className={`nvsw${open ? " open" : ""}`} ref={box} data-nq-feedback="">
      <style>{CSS}</style>
      <div className="nvpanel" hidden={!open}>
        <div className="nvsec">
          <p className="nvh">資料</p>
          <a className="nvit" href={back} aria-current="false">
            <span className="nvr"></span>
            <span className="tx">
              <b className="t1">{info.doc}</b>
              <span className="t2">{info.n ? `全${info.n}画面と決めること` : "全画面と決めること"}</span>
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
          <p className="nvh">権限（管理画面のロール）</p>
          <div>
            {ROLES.map((r) => (
              <button key={r.key} type="button" className="nvit" aria-current={r.key === role} onClick={() => saveCurrentRole(r.key)}>
                <span className="nvr"></span>
                <span className="tx">
                  <b className="t1">{r.name}</b>
                  <span className="t2">{r.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="nvfoot">
          <span className="nvkey" style={{ marginLeft: 0 }}>
            <b>Esc</b> で閉じる
          </span>
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
        <svg className="cr" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
    </div>
  );
}
