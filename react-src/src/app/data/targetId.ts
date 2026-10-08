/**
 * 工場ごとの見本で増やした点検対象の id（2026-10-07。factoryAppData.ts）。
 *
 * 元の見本と同じ件数までは元の id をそのまま使い、それより多い分は `元の id~印`（例 wp1~5）にする。
 * 記録・秤・差し戻しコメントなど、点検対象の id で引く見本は元の id でしか持っていないので、
 * `~` 以降を外した元の id（tplId）で引けば、同じ形の中身が出る。
 *
 * このファイルは何も読み込まない（mockData から読むため。読み込むと輪になる）。
 */

/** 増やした点検対象の id から元の id を取り出す。`c1~3:skipped` → `c1:skipped` のように後ろの印は残す */
export function tplId(id: string): string;
export function tplId(id: string | undefined): string | undefined;
export function tplId(id: string | undefined): string | undefined {
  return id ? id.replace(/~[^:]*/, "") : id;
}

/**
 * 点検対象の id をキーに持つ見本（Record）を包み、無いキーは元の id のもので答える。
 * 書き込みはそのまま元の Record に入る。Object.keys などには元のキーしか出ない。
 */
export function withTplFallback<T extends object>(map: T): T {
  return new Proxy(map, {
    get(target, key, receiver) {
      if (typeof key === "string" && !Reflect.has(target, key) && key.includes("~")) {
        return Reflect.get(target, tplId(key), receiver);
      }
      return Reflect.get(target, key, receiver);
    },
    has(target, key) {
      if (typeof key === "string" && !Reflect.has(target, key) && key.includes("~")) {
        return Reflect.has(target, tplId(key));
      }
      return Reflect.has(target, key);
    },
  });
}
