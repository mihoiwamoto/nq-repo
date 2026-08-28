import type { LedgerCategory } from "../types/ledger";

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
    appIcon: "/icons/ledger-app/water-inspection.png",
  },
  {
    slug: "glass-plastic",
    adminLabel: "ガラスプラスチック管理",
    appLabel: "ガラス・プラスチック管理",
    adminIcon: glassPlasticAdmin,
    appIcon: "/icons/ledger-app/glass-plastic.png",
  },
  {
    slug: "scale-inspection",
    adminLabel: "秤点検管理",
    appLabel: "秤点検記録",
    adminIcon: scaleInspectionAdmin,
    appIcon: "/icons/ledger-app/scale-inspection.png",
  },
  {
    slug: "sensory-inspection",
    adminLabel: "官能検査記録",
    appLabel: "官能検査記録",
    adminIcon: sensoryInspectionAdmin,
    appIcon: "/icons/ledger-app/sensory-inspection.png",
  },
  {
    slug: "metal-xray-detection",
    adminLabel: "金属探知機・X線探知機記録",
    appLabel: "金属探知機",
    adminIcon: metalXrayDetectionAdmin,
    appIcon: "/icons/ledger-app/metal-xray-detection.png",
  },
  {
    slug: "sample-management",
    adminLabel: "検体の管理",
    appLabel: "検体管理",
    adminIcon: sampleManagementAdmin,
    appIcon: "/icons/ledger-app/sample-management.png",
  },
  {
    slug: "equipment-inspection",
    adminLabel: "機械器具点検",
    appLabel: "機械器具点検",
    adminIcon: equipmentInspectionAdmin,
    appIcon: "/icons/ledger-app/equipment-inspection.png",
  },
  {
    slug: "cleaning-record",
    adminLabel: "清掃記録",
    appLabel: "清掃記録",
    adminIcon: cleaningRecordAdmin,
    appIcon: "/icons/ledger-app/cleaning-record.png",
  },
  {
    slug: "chemical-management",
    adminLabel: "薬品管理",
    appLabel: "薬品管理",
    adminIcon: chemicalManagementAdmin,
    appIcon: "/icons/ledger-app/chemical-management.png",
  },
  {
    slug: "additive-management",
    adminLabel: "添加物管理",
    appLabel: "添加物管理",
    adminIcon: additiveManagementAdmin,
    appIcon: "/icons/ledger-app/additive-management.png",
  },
];
