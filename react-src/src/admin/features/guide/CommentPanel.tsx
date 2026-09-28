/**
 * キャンバス右側の「コメント」パネル。
 * 今見ている画面に立っているピンの一覧と、立てたばかりのピンへの書き込みを受け持つ。
 */
import { useEffect, useRef, useState } from "react";
import { formatCommentTime, type ScreenComment } from "./comments";
import type { ScreenEntry } from "./screenCatalog";
import type { GoogleAccount } from "./googleAccount";
import { IconCheck, IconComment, IconMore, IconTrash } from "./CanvasIcons";

export type CommentDraft = { x: number; y: number; target: string };

/** 一覧に出すコメントの絞り込み */
export type CommentFilter = "open" | "resolved" | "all";
const FILTER_LABELS: Record<CommentFilter, string> = { open: "未解決", resolved: "解決済み", all: "すべて" };

/** 別画面のコメントを、画面ごとにまとめたもの */
export type ScreenCommentGroup = { screen: ScreenEntry; items: { comment: ScreenComment; n: number }[] };

export function CommentPanel({
  screen,
  items,
  openCount,
  resolvedCount,
  filter,
  onFilterChange,
  author,
  onAuthorChange,
  google,
  draft,
  onSaveDraft,
  onCancelDraft,
  activeId,
  onSelect,
  onUpdateBody,
  onToggleResolved,
  onRemove,
  onStartCommentMode,
  commentMode,
  otherGroups,
  otherLabel,
  onJump,
}: {
  screen: ScreenEntry | undefined;
  /** 表示するコメントと、そのピン番号 */
  items: { comment: ScreenComment; n: number }[];
  openCount: number;
  resolvedCount: number;
  /** 未解決 / 解決済み / すべて（右端の ⋯ から切り替え） */
  filter: CommentFilter;
  onFilterChange: (value: CommentFilter) => void;
  author: string;
  onAuthorChange: (value: string) => void;
  /** Google アカウント連携の状態。configured=false なら名前は手入力 */
  google: {
    configured: boolean;
    account: GoogleAccount | null;
    error: string | null;
    renderButton: (el: HTMLElement | null) => void;
    signOut: () => void;
  };
  draft: CommentDraft | null;
  onSaveDraft: (body: string) => void;
  onCancelDraft: () => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  onUpdateBody: (id: string, body: string) => void;
  onToggleResolved: (comment: ScreenComment) => void;
  onRemove: (id: string) => void;
  onStartCommentMode: () => void;
  commentMode: boolean;
  /** 今の表示モード（管理画面 / アプリ）の、他の画面のコメント */
  otherGroups: ScreenCommentGroup[];
  /** 「管理画面」「アプリ」 */
  otherLabel: string;
  /** 別画面のコメントを押した → その画面を開いてピンへ */
  onJump: (screen: ScreenEntry, commentId: string) => void;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // 一覧から飛んできたとき・ピンを押したときに、そのコメントを見えるところへ
  useEffect(() => {
    if (!activeId) return;
    listRef.current?.querySelector(`[data-comment-id="${activeId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeId, items.length]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-3 border-b border-[#eee] flex flex-col gap-2">
        <p className="text-xs font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
          画面の気になるところにピンを立てて、メモを残せます。✓ を押すと解決済みになり、右端の ⋯ から見返せます。
        </p>
        <button
          type="button"
          onClick={onStartCommentMode}
          className={`h-9 rounded-lg text-xs flex items-center justify-center gap-1.5 ${
            commentMode
              ? "bg-[var(--semantic-brand-primary)] text-white"
              : "border border-[#ddd] text-[var(--semantic-text-primary)] hover:bg-[#f8f8f8]"
          }`}
        >
          <IconComment width={14} height={14} />
          {commentMode ? "画面をクリックしてピンを立てる" : "ピンを立てる (C)"}
        </button>
        <AuthorField author={author} onAuthorChange={onAuthorChange} google={google} />
      </div>

      {draft && <DraftEditor draft={draft} onSave={onSaveDraft} onCancel={onCancelDraft} />}

      <div className="px-3 pt-3 pb-1 flex items-center gap-2 relative">
        <span className="flex-1 min-w-0 text-xs font-bold text-[var(--semantic-text-primary)] truncate">
          この画面のコメント{" "}
          <span className="font-normal text-[var(--semantic-text-secondary)]">
            {filter === "open" ? `未解決 ${openCount} 件` : filter === "resolved" ? `解決済み ${resolvedCount} 件` : `${openCount + resolvedCount} 件`}
          </span>
        </span>
        {/* 右端の ⋯ で「未解決 / 解決済み / すべて」を切り替える */}
        <button
          type="button"
          title="表示するコメントを切り替え"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className={`shrink-0 size-6 rounded-md flex items-center justify-center ${
            menuOpen || filter !== "open" ? "bg-[#ececec] text-[var(--semantic-text-primary)]" : "text-[var(--semantic-text-secondary)] hover:bg-[#ececec]"
          }`}
        >
          <IconMore width={16} height={16} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div role="menu" className="absolute right-3 top-8 z-20 w-40 rounded-lg border border-[#e5e5e5] bg-white py-1 shadow-lg">
              {(Object.keys(FILTER_LABELS) as CommentFilter[]).map((f) => {
                const count = f === "open" ? openCount : f === "resolved" ? resolvedCount : openCount + resolvedCount;
                return (
                  <button
                    key={f}
                    type="button"
                    role="menuitemradio"
                    aria-checked={filter === f}
                    onClick={() => {
                      onFilterChange(f);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 h-8 text-left text-xs ${
                      filter === f ? "text-[var(--semantic-brand-primary)] font-bold" : "text-[var(--semantic-text-primary)] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <span className="w-3">{filter === f ? "✓" : ""}</span>
                    <span className="flex-1">{FILTER_LABELS[f]}</span>
                    <span className="text-[var(--semantic-text-secondary)] font-normal">{count}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1.5">
        {items.length === 0 && (
          <p className="pt-2 text-xs font-normal leading-relaxed text-[var(--semantic-text-secondary)]">
            {!screen
              ? "画面を選ぶとコメントを残せます。"
              : filter === "resolved"
                ? "解決済みのコメントはありません。"
                : filter === "open" && resolvedCount > 0
                  ? "未解決のコメントはありません（解決済みは右端の ⋯ から）。"
                  : "この画面にはまだコメントがありません。"}
          </p>
        )}
        {items.map(({ comment, n }) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            n={n}
            active={comment.id === activeId}
            onSelect={() => onSelect(comment.id)}
            onUpdateBody={(body) => onUpdateBody(comment.id, body)}
            onToggleResolved={() => onToggleResolved(comment)}
            onRemove={() => onRemove(comment.id)}
          />
        ))}

        {/* 他の画面のコメント（画面ごと）。押すとその画面へ移ってピンを開く */}
        <div className="mt-3 pt-3 border-t border-[#eee] text-xs font-bold text-[var(--semantic-text-primary)]">
          {otherLabel}の他の画面のコメント{" "}
          <span className="font-normal text-[var(--semantic-text-secondary)]">
            {otherGroups.reduce((n, g) => n + g.items.length, 0)} 件
          </span>
        </div>
        {otherGroups.length === 0 && (
          <p className="text-xs font-normal leading-relaxed text-[var(--semantic-text-secondary)]">他の画面のコメントはありません。</p>
        )}
        {otherGroups.map((group) => (
          <section key={group.screen.id} className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onJump(group.screen, group.items[0].comment.id)}
              title={group.screen.route}
              className="flex items-center gap-1.5 pt-1 text-left text-[11px] text-[var(--semantic-text-secondary)] hover:text-[var(--semantic-brand-primary)]"
            >
              <span className="truncate font-bold text-[var(--semantic-text-primary)]">{group.screen.title}</span>
              <span className="shrink-0 min-w-4 h-4 px-1 rounded-full bg-[var(--semantic-brand-primary)] text-white text-[10px] flex items-center justify-center">
                {group.items.length}
              </span>
            </button>
            {/* カード全体を押すとその画面へ飛ぶ。✓ と ゴミ箱 はここからそのまま操作できる */}
            {group.items.map(({ comment, n }) => (
              <div
                key={comment.id}
                onClick={() => onJump(group.screen, comment.id)}
                className={`rounded-lg border border-[#e5e5e5] bg-white p-2 cursor-pointer hover:border-[var(--semantic-brand-primary)] ${
                  comment.resolved ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`shrink-0 size-4 rounded-full rounded-bl-none text-[9px] font-bold text-white flex items-center justify-center ${
                      comment.resolved ? "bg-[#b0b0b0]" : "bg-[var(--semantic-brand-danger)]"
                    }`}
                  >
                    {n}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-[11px] font-normal text-[var(--semantic-text-secondary)]">{comment.target}</span>
                  <CommentActions
                    resolved={comment.resolved}
                    onToggleResolved={() => onToggleResolved(comment)}
                    onRemove={() => onRemove(comment.id)}
                  />
                </div>
                <p className="mt-1 text-xs font-normal leading-snug text-[var(--semantic-text-primary)] line-clamp-2">{comment.body}</p>
                <p className="mt-1 text-[10px] font-normal text-[var(--semantic-text-secondary)]">
                  {comment.author || "名前なし"} ・ {formatCommentTime(comment.createdAt)}
                </p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * カード右上の「解決にする」「削除」。
 * この画面のコメントと、他の画面のコメントの両方で同じものを使う。
 * どちらのカードもクリックで別の動き（選択 / 画面移動）をするので、押したことを親に伝えない。
 */
function CommentActions({
  resolved,
  onToggleResolved,
  onRemove,
}: {
  resolved: boolean;
  onToggleResolved: () => void;
  onRemove: () => void;
}) {
  return (
    <>
      <button
        type="button"
        title={resolved ? "未解決に戻す" : "解決にする"}
        onClick={(e) => {
          e.stopPropagation();
          onToggleResolved();
        }}
        className={`shrink-0 size-6 rounded-md flex items-center justify-center ${
          resolved ? "bg-[var(--semantic-brand-primary)] text-white" : "text-[var(--semantic-text-secondary)] hover:bg-[#ececec]"
        }`}
      >
        <IconCheck width={14} height={14} />
      </button>
      <button
        type="button"
        title="削除"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm("このコメントを削除しますか？")) onRemove();
        }}
        className="shrink-0 size-6 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#ececec] hover:text-[var(--semantic-brand-danger)]"
      >
        <IconTrash width={14} height={14} />
      </button>
    </>
  );
}

/**
 * 記入者名。Google 連携が有効ならログイン中のアカウント名が自動で入り、
 * 無効（クライアント ID 未設定）なら手で入れる。
 */
function AuthorField({
  author,
  onAuthorChange,
  google,
}: {
  author: string;
  onAuthorChange: (value: string) => void;
  google: {
    configured: boolean;
    account: GoogleAccount | null;
    error: string | null;
    renderButton: (el: HTMLElement | null) => void;
    signOut: () => void;
  };
}) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const { configured, account, error, renderButton } = google;

  useEffect(() => {
    if (configured && !account) renderButton(buttonRef.current);
  }, [configured, account, renderButton]);

  if (configured && account) {
    return (
      <div className="flex items-center gap-2 text-[11px] font-normal text-[var(--semantic-text-secondary)]">
        {account.picture ? (
          <img src={account.picture} alt="" referrerPolicy="no-referrer" className="size-6 rounded-full shrink-0" />
        ) : (
          <span className="size-6 rounded-full bg-[#ddd] shrink-0" />
        )}
        <span className="flex-1 min-w-0 truncate">
          <span className="text-xs font-bold text-[var(--semantic-text-primary)]">{account.name}</span>
          {account.email && <span className="ml-1">{account.email}</span>}
        </span>
        <button type="button" onClick={google.signOut} className="shrink-0 underline hover:text-[var(--semantic-text-primary)]">
          切り替え
        </button>
      </div>
    );
  }

  if (configured) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)]">
          記入者名は Google アカウントから自動で入ります。
        </p>
        <div ref={buttonRef} className="min-h-8" />
        {error && <p className="text-[11px] font-normal text-[var(--semantic-brand-danger)]">{error}</p>}
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2 text-[11px] font-normal text-[var(--semantic-text-secondary)]">
      <span className="shrink-0">名前</span>
      <input
        type="text"
        value={author}
        onChange={(e) => onAuthorChange(e.target.value)}
        placeholder="未入力可（Google 連携は VITE_GOOGLE_CLIENT_ID で有効化）"
        className="flex-1 min-w-0 h-7 rounded-md border border-[#e5e5e5] px-2 text-xs font-normal text-[var(--semantic-text-primary)] outline-none focus:border-[var(--semantic-brand-primary)]"
      />
    </label>
  );
}

/** 立てたばかりのピンに書く欄 */
function DraftEditor({ draft, onSave, onCancel }: { draft: CommentDraft; onSave: (body: string) => void; onCancel: () => void }) {
  const [body, setBody] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setBody("");
    ref.current?.focus();
  }, [draft.x, draft.y]);

  return (
    <div className="mx-3 mt-3 rounded-lg border-2 border-[var(--semantic-brand-primary)] bg-[#f3faf6] p-2 flex flex-col gap-2">
      <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)] truncate" title={draft.target}>
        ピン位置: <span className="font-bold text-[var(--semantic-text-primary)]">{draft.target}</span>
      </p>
      <textarea
        ref={ref}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onSave(body);
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        rows={3}
        placeholder="気づいたことを書く（⌘Enter で保存）"
        className="w-full rounded-md border border-[#ddd] bg-white p-2 text-xs font-normal leading-relaxed text-[var(--semantic-text-primary)] outline-none resize-y"
      />
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onSave(body)}
          disabled={body.trim() === ""}
          className="flex-1 h-8 rounded-lg bg-[var(--semantic-brand-primary)] text-white text-xs disabled:opacity-40"
        >
          コメントする
        </button>
        <button type="button" onClick={onCancel} className="h-8 px-3 rounded-lg border border-[#ddd] text-xs text-[var(--semantic-text-primary)]">
          やめる
        </button>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  n,
  active,
  onSelect,
  onUpdateBody,
  onToggleResolved,
  onRemove,
}: {
  comment: ScreenComment;
  n: number;
  active: boolean;
  onSelect: () => void;
  onUpdateBody: (body: string) => void;
  onToggleResolved: () => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);

  useEffect(() => {
    if (!editing) setBody(comment.body);
  }, [comment.body, editing]);

  return (
    <div
      data-comment-id={comment.id}
      onClick={onSelect}
      className={`rounded-lg border p-2 cursor-pointer ${
        active ? "border-[var(--semantic-brand-primary)] bg-[#f3faf6]" : "border-[#e5e5e5] bg-white hover:border-[#ccc]"
      } ${comment.resolved ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`shrink-0 size-5 rounded-full rounded-bl-none text-[10px] font-bold text-white flex items-center justify-center ${
            comment.resolved ? "bg-[#b0b0b0]" : "bg-[var(--semantic-brand-danger)]"
          }`}
        >
          {n}
        </span>
        <span className="flex-1 min-w-0 text-[11px] font-normal text-[var(--semantic-text-secondary)] truncate" title={comment.target}>
          {comment.target}
        </span>
        <CommentActions resolved={comment.resolved} onToggleResolved={onToggleResolved} onRemove={onRemove} />
      </div>

      {editing ? (
        <div className="mt-1.5 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-[#ddd] bg-white p-2 text-xs font-normal leading-relaxed text-[var(--semantic-text-primary)] outline-none resize-y"
          />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                if (body.trim() !== "") onUpdateBody(body.trim());
                setEditing(false);
              }}
              className="h-7 px-3 rounded-md bg-[var(--semantic-brand-primary)] text-white text-[11px]"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => {
                setBody(comment.body);
                setEditing(false);
              }}
              className="h-7 px-3 rounded-md border border-[#ddd] text-[11px] text-[var(--semantic-text-primary)]"
            >
              やめる
            </button>
          </div>
        </div>
      ) : (
        <p
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          title="ダブルクリックで編集"
          className="mt-1.5 text-xs font-normal leading-relaxed text-[var(--semantic-text-primary)] whitespace-pre-wrap break-words"
        >
          {comment.body}
        </p>
      )}

      <p className="mt-1.5 text-[10px] font-normal text-[var(--semantic-text-secondary)]">
        {comment.author || "名前なし"} ・ {formatCommentTime(comment.createdAt)}
        {comment.resolved && <span className="ml-1 text-[var(--semantic-brand-primary)]">解決済み</span>}
      </p>
    </div>
  );
}
