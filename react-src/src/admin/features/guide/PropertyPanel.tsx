import { useEffect, useState, type ReactNode } from "react";
import type { ScreenEntry } from "./screenCatalog";
import { componentChain, computedOf, isFormField, isTextEditable } from "./domInspector";
import { IconCopy, IconDown, IconExternal, IconEyeOff, IconParent, IconTrash, IconUp } from "./CanvasIcons";

export type PropertyActions = {
  onStyle: (prop: string, value: string) => void;
  onText: (value: string) => void;
  onAttr: (name: string, value: string | null) => void;
  onHide: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
  onSelectParent: () => void;
};

const SEMANTIC_TOKENS: [name: string, label: string][] = [
  ["brand-primary", "メイン緑"],
  ["brand-danger", "赤"],
  ["background-page", "ページ背景"],
  ["background-surface", "白"],
  ["text-primary", "文字（濃）"],
  ["text-secondary", "文字（薄）"],
  ["text-disabled", "無効"],
  ["status-caution", "注意"],
  ["status-done", "完了"],
  ["status-error", "エラー"],
  ["status-success", "成功"],
];

/** index.css の --semantic-* を実行時に読む（値を二重管理しない） */
function semanticColors() {
  const cs = getComputedStyle(document.documentElement);
  return SEMANTIC_TOKENS.map(([name, label]) => ({
    label,
    value: `var(--semantic-${name})`,
    hex: cs.getPropertyValue(`--semantic-${name}`).trim(),
  }));
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-[#eee] px-3 py-3 flex flex-col gap-2">
      <p className="text-xs font-bold text-[var(--semantic-text-primary)]">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[11px] font-normal text-[var(--semantic-text-secondary)]">{label}</span>
      <div className="flex-1 min-w-0 flex items-center gap-1">{children}</div>
    </div>
  );
}

const inputClass =
  "h-8 w-full min-w-0 px-2 rounded-md border border-[#ddd] bg-white text-xs font-normal text-[var(--semantic-text-primary)] outline-none focus:border-[var(--semantic-brand-primary)]";

/** 入力中は自由に打てて、確定（blur / Enter）で 1 回だけ反映する */
function TextField({
  value,
  onCommit,
  placeholder,
  multiline,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (draft !== value) onCommit(draft);
  };
  if (multiline) {
    return (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) (e.target as HTMLTextAreaElement).blur();
        }}
        rows={3}
        placeholder={placeholder}
        className={`${inputClass} h-auto py-1.5 resize-y leading-relaxed`}
      />
    );
  }
  return (
    <input
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const known = options.some((o) => o.value === value);
  return (
    <select value={known ? value : ""} onChange={(e) => onChange(e.target.value)} className={`${inputClass} !h-8 !py-0 !pr-7 !text-xs !rounded-md !m-0`}>
      {!known && <option value="">（{value || "未指定"}）</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tokens = semanticColors();
  const validHex = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={validHex}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 shrink-0 rounded-md border border-[#ddd] bg-white p-0.5 cursor-pointer"
          title="自由な色を選ぶ"
        />
        <TextField value={value} onCommit={onChange} placeholder="#333333 / transparent" />
      </div>
      <div className="flex flex-wrap gap-1">
        {tokens.map((t) => (
          <button
            key={t.value}
            type="button"
            title={`${t.label} (${t.hex})`}
            onClick={() => onChange(t.value)}
            className={`size-5 rounded-full border ${
              value.toLowerCase() === t.hex.toLowerCase() ? "border-[var(--semantic-text-primary)] ring-2 ring-[#c9e8d6]" : "border-[#d0d0d0]"
            }`}
            style={{ backgroundColor: t.hex }}
          />
        ))}
        <button
          type="button"
          title="透明"
          onClick={() => onChange("transparent")}
          className="size-5 rounded-full border border-[#d0d0d0] bg-[repeating-conic-gradient(#ddd_0_25%,#fff_0_50%)] bg-[length:8px_8px]"
        />
      </div>
    </div>
  );
}

function ActionButton({ title, onClick, danger, children }: { title: string; onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 h-12 flex-1 rounded-md border text-[10px] font-normal ${
        danger
          ? "border-[#f5c9c9] text-[var(--semantic-brand-danger)] hover:bg-[#fdf0f0]"
          : "border-[#e5e5e5] text-[var(--semantic-text-primary)] hover:bg-[#f6f6f6]"
      }`}
    >
      {children}
      <span>{title}</span>
    </button>
  );
}

function ScreenInfo({ screen }: { screen: ScreenEntry | undefined }) {
  if (!screen) return null;
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="rounded-lg bg-[#f6f6f6] p-3 flex flex-col gap-1">
        <p className="text-sm font-bold text-[var(--semantic-text-primary)]">{screen.title}</p>
        <p className="text-xs font-normal text-[var(--semantic-text-secondary)]">{screen.componentName}</p>
        <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)] break-all">{screen.filePath}</p>
        <a
          href={screen.route}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--semantic-brand-primary)]"
        >
          <IconExternal width={14} height={14} />
          新しいタブで開く
        </a>
      </div>
      <div className="text-xs font-normal text-[var(--semantic-text-secondary)] leading-relaxed flex flex-col gap-1">
        <p>キャンバス上の要素をクリックすると、ここで色・文字・余白などを変えられます。</p>
        <p>テキストはダブルクリックでその場で書き換えられます。</p>
        <p>
          変更は右上の「プロンプト」タブにまとまります。コピーして Claude に渡すと、コードに反映できます。
        </p>
        <p className="mt-1">
          ショートカット: <kbd>V</kbd> 選択 / <kbd>H</kbd> 移動 / <kbd>P</kbd> 操作 / <kbd>⌘Z</kbd> 取り消し / <kbd>Delete</kbd> 削除
        </p>
      </div>
    </div>
  );
}

export function PropertyPanel({
  el,
  screen,
  actions,
}: {
  el: HTMLElement | null;
  screen: ScreenEntry | undefined;
  actions: PropertyActions;
}) {
  if (!el) return <ScreenInfo screen={screen} />;

  const chain = componentChain(el);
  const tag = el.tagName.toLowerCase();
  const c = (prop: string) => computedOf(el, prop);
  const display = c("display");
  const isFlex = /flex|grid/.test(display);
  const parentIsRoot = !el.parentElement || el.parentElement.id === "root";

  return (
    <div className="flex flex-col">
      <div className="px-3 py-3 border-b border-[#eee] flex flex-col gap-2">
        <p className="text-[11px] font-normal text-[var(--semantic-text-secondary)] truncate" title={chain.join(" › ")}>
          {chain.length ? chain.join(" › ") : "追加した部品（コンポーネント情報なし）"}
        </p>
        <p className="text-sm font-bold text-[var(--semantic-text-primary)] truncate">
          {chain[chain.length - 1] ?? ""} <span className="text-[var(--semantic-brand-primary)]">‹{tag}›</span>
        </p>
        {el.className && typeof el.className === "string" && (
          <p className="text-[10px] font-normal text-[#a0a0a0] break-all leading-snug max-h-10 overflow-hidden" title={el.className}>
            {el.className}
          </p>
        )}
        <div className="flex gap-1">
          <ActionButton title="親を選択" onClick={actions.onSelectParent}>
            <IconParent width={16} height={16} />
          </ActionButton>
          <ActionButton title="上へ" onClick={() => actions.onMove(-1)}>
            <IconUp width={16} height={16} />
          </ActionButton>
          <ActionButton title="下へ" onClick={() => actions.onMove(1)}>
            <IconDown width={16} height={16} />
          </ActionButton>
          <ActionButton title="複製" onClick={actions.onDuplicate}>
            <IconCopy width={16} height={16} />
          </ActionButton>
          <ActionButton title="非表示" onClick={actions.onHide}>
            <IconEyeOff width={16} height={16} />
          </ActionButton>
          <ActionButton title="削除" onClick={actions.onRemove} danger>
            <IconTrash width={16} height={16} />
          </ActionButton>
        </div>
        {parentIsRoot && <p className="text-[10px] font-normal text-[#a0a0a0]">画面全体の器です。細かい部品を選ぶには中をクリックしてください。</p>}
      </div>

      {isTextEditable(el) && (
        <Section title="テキスト">
          <TextField value={el.textContent ?? ""} onCommit={actions.onText} multiline />
          <p className="text-[10px] font-normal text-[#a0a0a0]">⌘+Enter または欄の外をクリックで反映</p>
        </Section>
      )}

      {isFormField(el) && (
        <Section title="入力欄">
          <Row label="プレースホルダ">
            <TextField value={el.placeholder} onCommit={(v) => actions.onAttr("placeholder", v)} />
          </Row>
          <Row label="値">
            <TextField value={el.value} onCommit={(v) => actions.onAttr("value", v)} />
          </Row>
        </Section>
      )}

      <Section title="文字">
        <Row label="文字色">
          <ColorField value={c("color")} onChange={(v) => actions.onStyle("color", v)} />
        </Row>
        <Row label="サイズ">
          <TextField value={c("font-size")} onCommit={(v) => actions.onStyle("font-size", v)} />
          <SelectField
            value={c("font-weight")}
            options={[
              { value: "400", label: "通常" },
              { value: "600", label: "やや太" },
              { value: "700", label: "太字" },
            ]}
            onChange={(v) => actions.onStyle("font-weight", v)}
          />
        </Row>
        <Row label="揃え">
          <SelectField
            value={c("text-align")}
            options={[
              { value: "start", label: "左" },
              { value: "left", label: "左" },
              { value: "center", label: "中央" },
              { value: "right", label: "右" },
            ]}
            onChange={(v) => actions.onStyle("text-align", v)}
          />
          <TextField value={c("line-height")} onCommit={(v) => actions.onStyle("line-height", v)} placeholder="行の高さ" />
        </Row>
      </Section>

      <Section title="背景・枠線">
        <Row label="背景色">
          <ColorField value={c("background-color")} onChange={(v) => actions.onStyle("background-color", v)} />
        </Row>
        <Row label="角丸">
          <TextField value={c("border-radius")} onCommit={(v) => actions.onStyle("border-radius", v)} />
        </Row>
        <Row label="枠線">
          <TextField value={c("border-width")} onCommit={(v) => actions.onStyle("border-width", v)} placeholder="太さ" />
          <SelectField
            value={c("border-style")}
            options={[
              { value: "none", label: "なし" },
              { value: "solid", label: "実線" },
              { value: "dashed", label: "破線" },
            ]}
            onChange={(v) => actions.onStyle("border-style", v)}
          />
        </Row>
        <Row label="枠線色">
          <ColorField value={c("border-color")} onChange={(v) => actions.onStyle("border-color", v)} />
        </Row>
      </Section>

      <Section title="余白">
        <Row label="内側">
          <div className="grid grid-cols-4 gap-1 w-full">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <TextField key={side} value={c(`padding-${side}`)} onCommit={(v) => actions.onStyle(`padding-${side}`, v)} />
            ))}
          </div>
        </Row>
        <Row label="外側">
          <div className="grid grid-cols-4 gap-1 w-full">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <TextField key={side} value={c(`margin-${side}`)} onCommit={(v) => actions.onStyle(`margin-${side}`, v)} />
            ))}
          </div>
        </Row>
        <p className="text-[10px] font-normal text-[#a0a0a0] pl-16">上・右・下・左の順。例: 16px / 0</p>
      </Section>

      <Section title="サイズ・配置">
        <Row label="幅 / 高さ">
          <TextField value={c("width")} onCommit={(v) => actions.onStyle("width", v)} placeholder="auto" />
          <TextField value={c("height")} onCommit={(v) => actions.onStyle("height", v)} placeholder="auto" />
        </Row>
        <Row label="表示">
          <SelectField
            value={display}
            options={[
              { value: "block", label: "ブロック" },
              { value: "flex", label: "横並び（flex）" },
              { value: "inline-flex", label: "インライン flex" },
              { value: "inline-block", label: "インラインブロック" },
              { value: "grid", label: "グリッド" },
              { value: "none", label: "非表示" },
            ]}
            onChange={(v) => actions.onStyle("display", v)}
          />
        </Row>
        {isFlex && (
          <>
            <Row label="方向">
              <SelectField
                value={c("flex-direction")}
                options={[
                  { value: "row", label: "横" },
                  { value: "column", label: "縦" },
                ]}
                onChange={(v) => actions.onStyle("flex-direction", v)}
              />
              <TextField value={c("gap")} onCommit={(v) => actions.onStyle("gap", v)} placeholder="間隔" />
            </Row>
            <Row label="配置">
              <SelectField
                value={c("justify-content")}
                options={[
                  { value: "normal", label: "先頭" },
                  { value: "flex-start", label: "先頭" },
                  { value: "center", label: "中央" },
                  { value: "flex-end", label: "末尾" },
                  { value: "space-between", label: "両端" },
                ]}
                onChange={(v) => actions.onStyle("justify-content", v)}
              />
              <SelectField
                value={c("align-items")}
                options={[
                  { value: "normal", label: "伸ばす" },
                  { value: "stretch", label: "伸ばす" },
                  { value: "flex-start", label: "上" },
                  { value: "center", label: "中央" },
                  { value: "flex-end", label: "下" },
                ]}
                onChange={(v) => actions.onStyle("align-items", v)}
              />
            </Row>
          </>
        )}
        <Row label="不透明度">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={Number(c("opacity") || 1)}
            onChange={(e) => actions.onStyle("opacity", e.target.value)}
            className="flex-1 accent-[var(--semantic-brand-primary)]"
          />
          <span className="w-8 text-right text-[11px] font-normal text-[var(--semantic-text-secondary)]">
            {Math.round(Number(c("opacity") || 1) * 100)}%
          </span>
        </Row>
      </Section>
    </div>
  );
}
