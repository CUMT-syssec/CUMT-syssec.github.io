"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * 「可以启用滚动联动动效」的统一门槛：
 * 已挂载（SSR/无 JS 时为 false，渲染保持自然静止态）+ 桌面视口（≥768px）+ 用户未要求减少动效。
 * 移动端与减少动效时全部回退为普通文档流。
 */
export function useDesktopMotion(): boolean {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setActive(false);
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setActive(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reducedMotion]);

  return active;
}
