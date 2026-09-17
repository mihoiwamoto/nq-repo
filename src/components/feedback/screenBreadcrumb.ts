/**
 * 対象画面を「管理画面 › ガイド › 変更履歴」のようなパンくずで表す。
 *
 * URL（/admin/guide/screens）をそのまま出しても人には伝わらないので、
 * サイドメニュー（admin/navigation・app/navigation）のラベルをたどって
 * 日本語の道順に直す。見つからないときはカテゴリ + 画面名だけになる。
 */
import { primaryNav } from "../../admin/navigation";
import { railNav } from "../../app/navigation";

const under = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`);

export function screenBreadcrumb(pathname: string, title: string): string[] {
  const trail: string[] = [];

  if (pathname.startsWith("/admin")) {
    trail.push("管理画面");
    for (const item of primaryNav) {
      const child = item.children?.find((c) => under(pathname, c.path));
      if (!child && !under(pathname, item.path)) continue;
      trail.push(item.label);
      if (child) trail.push(child.label);
      break;
    }
  } else if (pathname.startsWith("/app")) {
    trail.push("アプリ");
    const item = railNav.find((i) => under(pathname, i.path));
    if (item) trail.push(item.label);
  } else {
    trail.push("共通");
  }

  // 画面名がメニュー名と同じなら二重に出さない
  if (title && trail[trail.length - 1] !== title) trail.push(title);
  return trail;
}
