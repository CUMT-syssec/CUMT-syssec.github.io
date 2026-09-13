"use client";

import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * 轻入场：默认可见，动效只是增强。
 * 无 JavaScript、动画报错、快速滚动、直接锚点定位时内容都完整存在。
 * 仅在元素进入视口时播放一次：位移约 10px、时长 0.5s。
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** 相邻元素轻微错峰（毫秒） */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || !("IntersectionObserver" in window)) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.style.transition = `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`;
        el.style.opacity = "1";
        el.style.transform = "none";
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
