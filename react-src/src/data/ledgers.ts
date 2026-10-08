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
    appLabel: "ガラスプラスチック管理",
    adminIcon: glassPlasticAdmin,
    appIcon: appIconUrl("glass-plastic"),
  },
  {
    slug: "scale-inspection",
    // 本番（app/Consts/ReportType.php）の帳票名は「秤点検記録」（2026-10-08 本番に合わせた）
    adminLabel: "秤点検記録",
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
    // 管理画面・アプリとも「金属/X線探知機記録」に統一（2026-10-07 にユーザーが決定。確定デザインどうしで揺れていたため）
    adminLabel: "金属/X線探知機記録",
    appLabel: "金属/X線探知機記録",
    adminIcon: metalXrayDetectionAdmin,
    appIcon: appIconUrl("metal-xray-detection"),
  },
  {
    slug: "sample-management",
    adminLabel: "検体管理",
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
