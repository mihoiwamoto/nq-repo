export type Additive = {
  id: string;
  name: string;
  spec?: string;
  unit?: string;
  storageLocation?: string;
};

export const ADDITIVES: Additive[] = [
  { id: "a1", name: "ソルビン酸", spec: "1000", unit: "ml", storageLocation: "小型物置" },
  { id: "a2", name: "にがり（塩化マグネシウム）" },
  { id: "a3", name: "グルコノデルタラクトン" },
  { id: "a4", name: "消泡剤（シリコーン樹脂）" },
];
