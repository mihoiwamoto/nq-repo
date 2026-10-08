import { FACTORIES, type Factory } from "../../data/factories";
import { useCurrentRole } from "../../data/useCurrentRole";
import { CURRENT_ACCOUNT } from "../features/account/mockData";

/**
 * 管理画面の工場選択に並べる工場（2026-10-08）。
 *
 * 仕様書（画面設計 ⑧-4 の工場選択）どおり、承認者でログインしているときは「承認者の権限がある工場」だけ、
 * 管理者（情シス・品質管理部）は全工場を並べる。ログイン中の人の担当は account/mockData.ts の
 * CURRENT_ACCOUNT.assignments（f1・f2 は承認者、f3 は確認者＝所属しているが承認者の権限は無い）。
 * 本番のコードは所属工場を承認者の権限で絞らずに全部並べていた（Excel「仕様書・コード差異」管理-2 など）。
 */
export function approverFactoryIds(): string[] {
  return CURRENT_ACCOUNT.assignments.filter((a) => a.role === "approver").map((a) => a.factoryId);
}

export function useRoleFactories(): Factory[] {
  const role = useCurrentRole();
  if (role === "administrator") return FACTORIES;
  const ids = approverFactoryIds();
  return FACTORIES.filter((f) => ids.includes(f.id));
}
