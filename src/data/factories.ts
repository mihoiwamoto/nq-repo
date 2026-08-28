export type Factory = {
  id: string;
  name: string;
};

export const FACTORIES: Factory[] = [
  { id: "f1", name: "㈱西原食品 本社工場" },
  { id: "f2", name: "㈱西原食品 第二工場" },
  { id: "f3", name: "㈱西原食品 伊佐工場" },
  { id: "f4", name: "㈱ヒコシマリン 本社工場" },
  { id: "f5", name: "㈱ヒコシマリン カネハチ静岡工場" },
  { id: "f6", name: "㈱ゆば将 本社工場" },
  { id: "f7", name: "㈱匠フーズ 本社工場" },
  { id: "f8", name: "㈱薩摩家 本社工場" },
  { id: "f9", name: "㈱西通りプリン 本社工場" },
  { id: "f10", name: "㈱西通りプリン 安曇野工場" },
  { id: "f11", name: "㈱桜寿食品 本社工場" },
  { id: "f12", name: "㈱亜味撰 本社工場" },
  { id: "f13", name: "㈱ゆう屋 本社工場" },
  { id: "f14", name: "㈱五島製麺 本社工場" },
  { id: "f15", name: "㈱有明農産 本社工場" },
  { id: "f16", name: "龍屋物産㈱ 本社工場" },
  { id: "f17", name: "松山製菓㈱ 本社工場" },
  { id: "f18", name: "松山製菓㈱ 知多かなん堂工場" },
  { id: "f19", name: "はやしハム㈱ 本社工場" },
  { id: "f20", name: "あったか市場㈱ キットファクトリー" },
  { id: "f21", name: "㈱鈴木商会 製造部門" },
];

export function getFactoryName(factoryId: string | undefined) {
  return FACTORIES.find((f) => f.id === factoryId)?.name ?? "工場";
}
