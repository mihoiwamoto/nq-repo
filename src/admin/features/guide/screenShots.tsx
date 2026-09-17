/**
 * 撮影済みスクリーンショット（.claude/.shots）を画面に出すための共通部分。
 *
 * 以前は各ページが shots-index.json を読み、そこに載っている画面だけ <img> を出していた。
 * これには 2 つ困ったところがあった。
 *   - 撮影スクリプトが index を書き換えている最中に読むと JSON が壊れて取得に失敗し、
 *     そのとき全画面のサムネイルが一斉に消える。
 *   - 撮り直しても URL が変わらないので、ブラウザが前の（真っ白な）絵を使い続ける。
 * なので index は当てにせず「まず出して、無ければプレースホルダに落とす」形にし、
 * URL には読み込みごとの版を付けて、撮り直しがそのまま反映されるようにしている。
 */
import { useEffect, useState, type ReactNode } from "react";

/** 画面を開くたびに変わる版。撮り直した絵がキャッシュで隠れないようにするため */
const SHOT_VERSION = Date.now().toString(36);

export function thumbUrl(screenId: string): string {
  return `/.claude/.shots/thumb/${screenId}.jpg?v=${SHOT_VERSION}`;
}

export function shotUrl(screenId: string, kind: "after" | "before" | "diff"): string {
  return `/.claude/.shots/${kind}/${screenId}.png?v=${SHOT_VERSION}`;
}

/**
 * サムネイル 1 枚。読み込めなかったときだけ fallback を出す。
 * 枠（大きさ・角丸・背景）は呼び出し側が持つ。
 */
export function ScreenThumb({
  screenId,
  fallback,
  className = "w-full h-full object-cover object-top",
}: {
  screenId: string;
  fallback: ReactNode;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  // 別の画面を映すときは「読めなかった」を持ち越さない
  useEffect(() => setBroken(false), [screenId]);

  if (broken) return <>{fallback}</>;
  return (
    <img
      src={thumbUrl(screenId)}
      alt=""
      loading="lazy"
      onError={() => setBroken(true)}
      className={className}
    />
  );
}
