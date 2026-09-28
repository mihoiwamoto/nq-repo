import floorMapImage from "../../../assets/figma/floorplans/floor-a.png";
import type { Floor } from "./types";

export const floors: Floor[] = [
  {
    id: "f1",
    name: "フロアA",
    planImageUrl: floorMapImage,
    mapItems: [
      { id: "m1", room: "出入口", name: "鏡1", category: "mirror", x: 20, y: 15 },
      { id: "m2", room: "出入口", name: "時計1", category: "clock", x: 35, y: 15 },
      { id: "m3", room: "出入口", name: "プラスチック棚1", category: "plastic_shelf", x: 20, y: 30 },
      { id: "m4", room: "出入口", name: "窓ガラス1", category: "window_glass", x: 35, y: 30 },
      { id: "m5", room: "出荷口", name: "引き戸", category: "sliding_door", x: 65, y: 60 },
      { id: "m6", room: "出荷口", name: "窓ガラス1", category: "window_glass", x: 80, y: 60 },
      { id: "m7", room: "プリンエリア", name: "窓ガラス1", category: "window_glass", x: 55, y: 45 },
    ],
    repairItems: [
      {
        id: "r1",
        room: "出荷口",
        name: "引き戸",
        status: "action_needed",
        content: "破損",
        cause: "人や物との接触",
        actionType: "修理依頼",
      },
      {
        id: "r2",
        room: "出荷口",
        name: "窓ガラス1",
        status: "repairing",
        content: "ひび割れ",
        cause: "人や物との接触",
        actionType: "補修テープでの応急処置",
      },
      {
        id: "r3",
        room: "プリンエリア",
        name: "窓ガラス1",
        status: "repairing",
        content: "ひび割れ",
        cause: "経年劣化",
        actionType: "補修テープでの応急処置",
      },
    ],
  },
  { id: "f2", name: "フロアB", mapItems: [], repairItems: [] },
];
