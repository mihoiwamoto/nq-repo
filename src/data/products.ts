import { FACTORIES } from "./factories";

export type HostProduct = {
  id: string;
  productCode: string;
  name: string;
  quantity: number;
  quantityUnit: string;
  factoryId: string;
  expiry: string;
};

const NAMES = [
  "ジェラート ミルク ALVO シングル",
  "沖縄産粉状黒糖(宮古･多良間島産)20kg 宮古製糖",
  "プリン 3種6個セット 85g6入",
  "生ゆば詰め合わせ 200g",
  "さつま揚げ 10枚入",
  "焼き麩 5個入り",
  "有明産 焼き海苔 全型10枚",
  "無添加ハム スライス 100g",
  "五島手延うどん 300g",
  "静岡産 うなぎ蒲焼 1尾",
  "本枯鰤 削り節 50g",
  "米麹みそ 750g",
  "銘菓 詰め合わせ 12個入",
  "冷凍餃子 20個入",
  "国産大豆豆腐 300g",
  "米粉パン 1袋",
];

export const HOST_PRODUCTS: HostProduct[] = Array.from({ length: 28 }, (_, i) => {
  const factory = FACTORIES[i % FACTORIES.length];
  const quantity = [20, 30, 40, 50, 100, 200, 500, 1000][i % 8];
  const quantityUnit = ["g", "kg", "ml", "L", "個"][i % 5];
  const expiry = ["30", "60", "90", "180", "365", "730", "9999"][i % 7];
  return {
    id: `hp${i + 1}`,
    productCode: String(1000000 + i * 137),
    name: NAMES[i % NAMES.length],
    quantity,
    quantityUnit,
    factoryId: factory.id,
    expiry,
  };
});
