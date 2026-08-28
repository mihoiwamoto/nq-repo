export type Chemical = {
  id: string;
  name: string;
  spec?: string;
  unit?: string;
  storageLocation?: string;
};

export const CHEMICALS: Chemical[] = [
  { id: "c1", name: "次亜塩素酸ナトリウム", spec: "1000", unit: "g", storageLocation: "小型物置" },
  { id: "c2", name: "ジオキシー" },
  { id: "c3", name: "塩酸" },
  { id: "c4", name: "次亜塩素酸ソーダ" },
];
