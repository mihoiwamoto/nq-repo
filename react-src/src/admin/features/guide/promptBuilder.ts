/**
 * キャンバス上で加えた見た目の変更を、Claude にそのままコードへ反映してもらえる
 * 日本語のプロンプトに組み立てる（参考サイトの「プロンプト」タブに相当）。
 */
import { STYLE_PROP_LABELS, type EditOp } from "./canvasTypes";
import type { ScreenEntry } from "./screenCatalog";
import { tidyHtml } from "./domInspector";

function quote(s: string): string {
  return `「${s.replace(/\s+/g, " ").trim()}」`;
}

export function describeOp(op: EditOp): string {
  switch (op.kind) {
    case "style": {
      const label = STYLE_PROP_LABELS[op.prop] ?? op.prop;
      return `${label}を ${op.computedBefore || "(未指定)"} → ${op.after} に変更`;
    }
    case "text":
      return `テキスト変更 ${quote(op.before)} → ${quote(op.after)}`;
    case "attr":
      return `${op.name} を ${op.before === null ? "(なし)" : quote(op.before)} → ${
        op.after === null ? "(なし)" : quote(op.after)
      } に変更`;
    case "hide":
      return "非表示にする";
    case "remove":
      return "削除する";
    case "insert":
      return `この要素の内側 ${op.index + 1} 番目に部品「${op.partLabel}」を追加`;
    case "move":
      return `並び順を ${op.fromIndex + 1} 番目 → ${op.toIndex + 1} 番目に移動`;
    case "reparent":
      return `${quote(op.toLabel)} へ移動（${op.toIndex + 1} 番目）`;
  }
}

/**
 * @param emptyNote 変更が 1 件も無いときに出す文言。
 *   「変更はあるが 1 件も選ばれていない」ときに呼び分けるために差し替えられる。
 */
export function buildPrompt(screen: ScreenEntry, ops: EditOp[], emptyNote?: string): string {
  const lines: string[] = [];
  lines.push("# NQ 画面の見た目変更をコードに反映してください");
  lines.push("");
  lines.push(`対象画面: ${screen.title}（${screen.componentName}）`);
  lines.push(`ファイル: ${screen.filePath}`);
  lines.push(`URL: ${screen.route}`);
  lines.push("");
  if (ops.length === 0) {
    lines.push(emptyNote ?? "（まだ変更はありません。キャンバス上で要素を選んで編集すると、ここに手順が並びます）");
    return lines.join("\n");
  }
  lines.push("画面説明キャンバスで以下の変更を仮に加えました。同じ見た目になるようにこのファイル（必要なら共通コンポーネント）を修正してください。");
  lines.push("対象は「コンポーネント名 › タグ」で示しています。`selector` は #root からの DOM パスです。");
  lines.push("");
  ops.forEach((op, i) => {
    lines.push(`${i + 1}. [${op.target}] ${describeOp(op)}`);
    const selector = "selector" in op ? op.selector : op.parentSelector;
    lines.push(`   selector: ${selector}`);
    if (op.kind === "insert") {
      lines.push("   追加した HTML:");
      lines.push("   ```html");
      for (const l of tidyHtml(op.html).split("\n")) lines.push(`   ${l}`);
      lines.push("   ```");
    }
  });
  lines.push("");
  lines.push("注意:");
  lines.push("- 共通コンポーネント（PageTitleBar / Pulldown など）に由来する箇所は、他画面への波及を確認したうえで直してください。");
  lines.push("- 色は可能なら `--semantic-*` の CSS 変数、余白やサイズは既存の Tailwind クラスに置き換えてください。");
  lines.push("- 作業後は `node .claude/report.cjs` で変わった画面を報告してください。");
  return lines.join("\n");
}

export function buildJson(screen: ScreenEntry, ops: EditOp[]): string {
  return JSON.stringify(
    {
      screen: { id: screen.id, title: screen.title, filePath: screen.filePath, route: screen.route },
      exportedAt: new Date().toISOString(),
      ops,
    },
    null,
    2
  );
}
