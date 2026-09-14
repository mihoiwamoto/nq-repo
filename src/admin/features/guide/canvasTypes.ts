export type DeviceMode = "pc" | "tablet";

/** 管理画面は PC、現場アプリはタブレットで確認する */
export const DEVICE_SIZES: Record<DeviceMode, { label: string; width: number; height: number }> = {
  pc: { label: "PC", width: 1280, height: 800 },
  tablet: { label: "タブレット", width: 768, height: 1024 },
};

/**
 * 選択（要素を選んで編集・並び替え） / 移動（キャンバスをドラッグ） /
 * 操作（実際にアプリを触る） / コメント（画面にピンを立てる）
 */
export type ToolMode = "select" | "comment";

type OpBase = {
  id: string;
  at: number;
  screenId: string;
  /** 「PageTitleBar › h1」のような、人が読める対象の名前 */
  target: string;
  /**
   * もうコードに反映した変更。プロンプトには載せず、「変更済み」に畳む。
   * キャンバス上の見た目はそのまま（取り消しは undo の役目）。
   */
  done?: boolean;
};

export type EditOp = OpBase &
  (
    | {
        kind: "style";
        selector: string;
        prop: string;
        /** 編集前の inline style（元に戻す用。無ければ空文字） */
        inlineBefore: string;
        /** 編集前の見た目上の値（プロンプト用） */
        computedBefore: string;
        after: string;
      }
    | { kind: "text"; selector: string; before: string; after: string }
    | { kind: "attr"; selector: string; name: string; before: string | null; after: string | null }
    | { kind: "hide"; selector: string; inlineBefore: string }
    | { kind: "remove"; selector: string; parentSelector: string; index: number; html: string }
    | { kind: "insert"; parentSelector: string; index: number; html: string; partLabel: string }
    | { kind: "move"; selector: string; parentSelector: string; fromIndex: number; toIndex: number }
    | {
        /** 別の親の下へ動かす（同じ親の中の並び替えは move） */
        kind: "reparent";
        selector: string;
        fromParentSelector: string;
        fromIndex: number;
        toParentSelector: string;
        /** 移す先の親の何番目に入れるか（入れる前の番号） */
        toIndex: number;
        /** 「TabBar › div の中」のような移動先の説明 */
        toLabel: string;
      }
  );

/**
 * 判別可能ユニオンのまま Omit する。
 * そのまま Omit<EditOp, ...> と書くと共通のキーしか残らず、kind ごとの項目が消えてしまう。
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** これから記録する操作（id/at/screenId/done は記録側で付ける） */
export type NewEditOp = DistributiveOmit<EditOp, "id" | "at" | "screenId" | "done">;

export type Rect = { x: number; y: number; width: number; height: number };

export const STYLE_PROP_LABELS: Record<string, string> = {
  color: "文字色",
  "background-color": "背景色",
  "font-size": "文字サイズ",
  "font-weight": "文字の太さ",
  "text-align": "文字揃え",
  "line-height": "行の高さ",
  "border-radius": "角丸",
  "border-color": "枠線の色",
  "border-width": "枠線の太さ",
  "border-style": "枠線の種類",
  "padding-top": "内側余白（上）",
  "padding-right": "内側余白（右）",
  "padding-bottom": "内側余白（下）",
  "padding-left": "内側余白（左）",
  "margin-top": "外側余白（上）",
  "margin-right": "外側余白（右）",
  "margin-bottom": "外側余白（下）",
  "margin-left": "外側余白（左）",
  width: "幅",
  height: "高さ",
  gap: "要素の間隔",
  opacity: "不透明度",
  display: "表示方法",
  "justify-content": "横方向の配置",
  "align-items": "縦方向の配置",
  "flex-direction": "並べる方向",
};
