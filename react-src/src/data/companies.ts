export type Company = {
  id: string;
  name: string;
  address: string;
};

export const INITIAL_COMPANIES: Company[] = [
  { id: "c1", name: "㈱西原食品", address: "鹿児島県鹿児島市本名町1744番地1号" },
  { id: "c2", name: "㈱ヒコシマリン", address: "静岡県静岡市清水区港町2-3-15" },
  { id: "c3", name: "㈱ゆば将", address: "京都府京都市南区東九条南田町5-1" },
  { id: "c4", name: "㈱匠フーズ", address: "福岡県福岡市博多区博多駅前3-2-8" },
  { id: "c5", name: "㈱薩摩家", address: "鹿児島県鹿児島市中央町18-1" },
  { id: "c6", name: "㈱西通りプリン", address: "長野県安曇野市豊科4300-2" },
  { id: "c7", name: "㈱桜寿食品", address: "熊本県熊本市西区花園6-22-1" },
  { id: "c8", name: "㈱亜味撰", address: "宮崎県宮崎市橘通西3-9-14" },
  { id: "c9", name: "㈱ゆう屋", address: "大分県大分市中央町1-2-3" },
  { id: "c10", name: "㈱五島製麺", address: "長崎県五島市浜町2-1-12" },
  { id: "c11", name: "㈱有明農産", address: "佐賀県佐賀市有明町大字牛津14-6" },
  { id: "c12", name: "龍屋物産㈱", address: "沖縄県那覇市泉崎1-10-8" },
  { id: "c13", name: "松山製菓㈱", address: "愛知県知多市新知台2-4-9" },
  { id: "c14", name: "はやしハム㈱", address: "群馬県高崎市問屋町3-5-2" },
  { id: "c15", name: "あったか市場㈱", address: "北海道札幌市中央区北3条西5-1" },
  { id: "c16", name: "㈱鈴木商会", address: "新潟県新潟市中央区東大通2-4-4" },
];

export function getCompanyName(companyId: string | undefined) {
  return INITIAL_COMPANIES.find((c) => c.id === companyId)?.name ?? "企業";
}
