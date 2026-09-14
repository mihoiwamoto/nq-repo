/**
 * 「5,000ml」のような数量表記を扱うユーティリティ。
 * 薬品管理／添加物管理では、規格や在庫数に品目ごとの単位（ml・g など）が付いており、
 * 記録入力では数値だけを打つ運用なので、保存時にここで単位を補う。
 */

/** "5,000ml" → { amount: 5000, unit: "ml" } */
export function parseAmount(value: string): { amount: number; unit: string } {
  const match = value.trim().match(/^([\d,]+(?:\.\d+)?)\s*(.*)$/);
  if (!match) return { amount: NaN, unit: "" };
  return { amount: Number(match[1].replace(/,/g, "")), unit: match[2].trim() };
}

/** 5000, "ml" → "5,000ml" */
export function formatAmount(amount: number, unit: string) {
  return `${amount.toLocaleString("ja-JP")}${unit}`;
}

/** 規格や在庫数の表記から単位だけを取り出す（"1,000ml" → "ml"） */
export function unitOf(value: string) {
  return parseAmount(value).unit;
}

/**
 * 数値だけ入力された値に単位を付ける。
 * すでに単位が付いている入力（"500ml"）はその単位を尊重し、桁区切りだけ整える。
 */
export function withUnit(value: string, unit: string) {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  const parsed = parseAmount(trimmed);
  if (Number.isNaN(parsed.amount)) return trimmed;
  return formatAmount(parsed.amount, parsed.unit || unit);
}
