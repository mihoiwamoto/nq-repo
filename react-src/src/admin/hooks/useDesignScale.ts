import { useEffect, useState } from "react";
import { adminFramed } from "../layout/AdminViewport";

// Figma の管理画面のデザインは 1440×960。ポップアップを画面に対して同じ比率で出すための倍率
const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 960;

function currentScale() {
  // プロトタイプで 1440×960 の枠に入れているときは、枠がデザインと同じ大きさなので等倍（枠ごと縮めている）
  if (adminFramed()) return 1;
  return Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
}

export function useDesignScale() {
  const [scale, setScale] = useState(currentScale);

  useEffect(() => {
    const onResize = () => setScale(currentScale());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return scale;
}
