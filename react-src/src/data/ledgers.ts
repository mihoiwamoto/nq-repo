import type { LedgerCategory } from "../types/ledger";

/** public/ に置いたアプリ側のアイコン。画面設計キットのように /react/ の下で配ることがあるので、
 *  絶対パス（/icons/…）ではなく base を付けて引く。ふだんの配り方（base=/）では今までと同じ */
const appIconUrl = (name: string) => `${import.meta.env.BASE_URL}icons/ledger-app/${name}.png`;

import waterInspectionAdmin from "../assets/figma/icons/ledger/water-inspection.png";
import glassPlasticAdmin from "../assets/figma/icons/ledger/glass-plastic.png";
import scaleInspectionAdmin from "../assets/figma/icons/ledger/scale-inspection.png";
import sensoryInspectionAdmin from "../assets/figma/icons/ledger/sensory-inspection.png";
import metalXrayDetectionAdmin from "../assets/figma/icons/ledger/metal-xray-detection.png";
import sampleManagementAdmin from "../assets/figma/icons/ledger/sample-management.png";
import equipmentInspectionAdmin from "../assets/figma/icons/ledger/equipment-inspection.png";
import cleaningRecordAdmin from "../assets/figma/icons/ledger/cleaning-record.png";
import chemicalManagementAdmin from "../assets/figma/icons/ledger/chemical-management.png";
import additiveManagementAdmin from "../assets/figma/icons/ledger/additive-management.png";

export const ledgerCategories: LedgerCategory[] = [
  {
    slug: "water-inspection",
    adminLabel: "使用水の点検",
    appLabel: "使用水の点検",
    adminIcon: waterInspectionAdmin,
    appIcon: appIconUrl("water-inspection"),
  },
  {
    slug: "glass-plastic",
    adminLabel: "ガラスプラスチック管理",
    appLabel: "ガラス・プラスチック管理",
    adminIcon: glassPlasticAdmin,
    appIcon: appIconUrl("glass-plastic"),
  },
  {
    slug: "scale-inspection",
    adminLabel: "秤点検管理",
    appLabel: "秤点検記録",
    adminIcon: scaleInspectionAdmin,
    appIcon: appIconUrl("scale-inspection"),
  },
  {
    slug: "sensory-inspection",
    adminLabel: "官能検査記録",
    appLabel: "官能検査記録",
    adminIcon: sensoryInspectionAdmin,
    appIcon: appIconUrl("sensory-inspection"),
  },
  {
    slug: "metal-xray-detection",
    adminLabel: "金属探知機記録", // 確定デザイン Ver.3.0（U7BHhdczTV8L2SR9zko0UA の帳票管理・データ検索のタイル）に合わせた 2026-10-07
    appLabel: "金属探知機・X線探知機",
    adminIcon: metalXrayDetectionAdmin,
    appIcon: appIconUrl("metal-xray-detection"),
  },
  {
    slug: "sample-management",
    adminLabel: "検体の管理",
    appLabel: "検体管理",
    adminIcon: sampleManagementAdmin,
    appIcon: appIconUrl("sample-management"),
  },
  {
    slug: "equipment-inspection",
    adminLabel: "機械器具点検",
    appLabel: "機械器具点検",
    adminIcon: equipmentInspectionAdmin,
    appIcon: appIconUrl("equipment-inspection"),
  },
  {
    slug: "cleaning-record",
    adminLabel: "清掃記録",
    appLabel: "清掃記録",
    adminIcon: cleaningRecordAdmin,
    appIcon: appIconUrl("cleaning-record"),
  },
  {
    slug: "chemical-management",
    adminLabel: "薬品管理",
    appLabel: "薬品管理",
    adminIcon: chemicalManagementAdmin,
    appIcon: appIconUrl("chemical-management"),
  },
  {
    slug: "additive-management",
    adminLabel: "添加物管理",
    appLabel: "添加物管理",
    adminIcon: additiveManagementAdmin,
    appIcon: appIconUrl("additive-management"),
  },
];
